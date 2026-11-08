// kaySession.js — el motor de Kay: conversación de voz en vivo con Gemini
// (Live API), audio adentro, audio afuera, sin transcribir a texto en el
// medio — así habla el modo de voz de ChatGPT/Gemini. La detección de
// cuándo el usuario empieza y termina de hablar la hace el modelo solo
// (actividad automática); no hace falta push-to-talk, con abrir la sesión
// alcanza para tener una charla natural. Soporta function calling e
// interrupciones (barge-in) de fábrica.
//
// No importa nada específico de ninguna app — todo lo que necesita entra
// por parámetros. Ver README.md para cómo conectarlo a un proyecto nuevo.
//
// Migrado a ÑANDÉ desde rubikeduai-backend (rama claude/dashboard-hijos-kay,
// dashboard/src/kay/kaySession.js, commit bbf7789). Cambios:
// - La configuración de la sesión (personalidad, voz, herramientas) viene
//   BLOQUEADA dentro del token efímero que arma el servidor: el navegador no
//   arma ni ve la instrucción de sistema (privacidad + nadie la puede cambiar).
//   construirSystemInstruction queda solo para tokens sin bloqueo.
// - Nuevos callbacks: onUso (usageMetadata de cada turno, para medir costo),
//   onTranscripcion (texto de lo que dijo cada uno), onTurnoCompleto y
//   onSilencio (terminó de sonar el audio de Kay).

import { GoogleGenAI } from '@google/genai'

const SAMPLE_RATE_ENTRADA = 16000
const SAMPLE_RATE_SALIDA = 24000

// Modelos de la Live API en orden de preferencia. Google va cambiando de
// generación (2.x -> 3.x confirmado en la práctica, septiembre 2026 — los
// modelos "gemini-live-2.5-flash-preview" y "gemini-2.0-flash-live-001"
// quedaron dados de baja, cierre de conexión código 1008 "not found") —
// mantené más de un candidato acá; Kay prueba el siguiente solo si el
// anterior devuelve ese mismo error.
const MODELOS_FALLBACK_DEFAULT = ['gemini-3.1-flash-live-preview']

function arrayBufferABase64(buffer) {
  let binario = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i])
  return btoa(binario)
}

function pcm16Base64AFloat32(base64) {
  const binario = atob(base64)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  const int16 = new Int16Array(bytes.buffer)
  const float32 = new Float32Array(int16.length)
  for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768
  return float32
}

// Arma los dos AudioContext (captura + reproducción), carga sus worklets y
// pide permiso de micrófono — todo en paralelo entre sí, y en paralelo con
// obtenerToken() (ver abajo). El permiso de mic y la carga de los worklets
// no dependen para nada de la respuesta del servidor, así que hacerlos
// esperar esa ida y vuelta de red sería tiempo muerto puro antes de poder
// escuchar/hablar.
async function prepararAudio(workletBasePath) {
  const ctxSalida = new AudioContext({ sampleRate: SAMPLE_RATE_SALIDA })
  const cargaSalida = ctxSalida.audioWorklet.addModule(`${workletBasePath}/pcmPlayback.worklet.js`)

  const ctxEntrada = new AudioContext({ sampleRate: SAMPLE_RATE_ENTRADA })
  const cargaEntrada = ctxEntrada.audioWorklet.addModule(`${workletBasePath}/pcmCapture.worklet.js`)

  const streamPromise = navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  })

  const [stream] = await Promise.all([streamPromise, cargaSalida, cargaEntrada])

  const nodoSalida = new AudioWorkletNode(ctxSalida, 'pcm-playback')
  nodoSalida.connect(ctxSalida.destination)
  const fuente = ctxEntrada.createMediaStreamSource(stream)
  const nodoEntrada = new AudioWorkletNode(ctxEntrada, 'pcm-capture')
  fuente.connect(nodoEntrada)

  // Los AudioContext pueden arrancar "suspended" (política de autoplay del
  // navegador) — sobre todo acá, que se crean después de un par de await,
  // lejos del click original que arrancó la conversación. Si quedan
  // suspendidos, el audio nunca se procesa: no se manda nada del micrófono
  // y tampoco se escucha nada de vuelta, SIN NINGÚN ERROR — el síntoma
  // exacto de "conecta pero no responde" (bug real que tuvimos). resume()
  // es un no-op si ya estaban corriendo, así que es seguro llamarlo siempre.
  await Promise.all([ctxEntrada.resume(), ctxSalida.resume()])

  return { ctxSalida, ctxEntrada, nodoSalida, nodoEntrada, stream }
}

/**
 * Arranca una conversación de voz en vivo con Gemini.
 *
 * @param {Object} args
 * @param {() => Promise<{ok: boolean, token?: string, modelo?: string, error?: string}>} args.obtenerToken
 *   Tu propia función que llama a tu backend a mintear el token efímero
 *   (ver server/kayToken.example.js). Podés devolver campos extra (perfil,
 *   contexto, lo que sea) — todo el objeto se le pasa a
 *   construirSystemInstruction.
 * @param {(datosToken: object) => (string|object)} [args.construirSystemInstruction]
 *   Arma el system instruction de la sesión con lo que devolvió obtenerToken.
 * @param {Array<object>} [args.tools] Function declarations (formato
 *   parametersJsonSchema, ver la doc de @google/genai).
 * @param {(estado: 'conectando'|'escuchando'|'cerrado') => void} [args.onEstado]
 * @param {(llamada: {id, name, args}, responder: (resultado: object) => void) => void} [args.onFunctionCall]
 * @param {(texto: string) => void} [args.onTextoModelo] Por si el modelo
 *   manda texto además de audio (no pasa en modo AUDIO puro, pero por las
 *   dudas).
 * @param {(mensaje: string) => void} [args.onError]
 * @param {(usageMetadata: object) => void} [args.onUso] Uso de tokens que manda
 *   la Live API (uno por turno). Mandarlo al servidor al cerrar para medir costo.
 * @param {(t: {quien: 'alumno'|'kay', texto: string}) => void} [args.onTranscripcion]
 * @param {() => void} [args.onTurnoCompleto]
 * @param {() => void} [args.onSilencio] Terminó de sonar todo el audio de Kay.
 * @param {string[]} [args.modelosFallback] Default: MODELOS_FALLBACK_DEFAULT.
 * @param {string} [args.voz] Nombre de voz prebuilt de Gemini. Default: 'Kore'.
 * @param {string} [args.workletBasePath] Carpeta pública donde serviste los
 *   worklets (ver README — tiene que ser una URL real, no un import de
 *   Vite). Default: '/audioWorklets'.
 * @returns {Promise<{cerrar: () => void}>}
 */
export async function iniciarSesionKay({
  obtenerToken,
  construirSystemInstruction,
  tools,
  onEstado,
  onFunctionCall,
  onTextoModelo,
  onError,
  onUso,
  onTranscripcion,
  onTurnoCompleto,
  onSilencio,
  modelosFallback = MODELOS_FALLBACK_DEFAULT,
  voz = 'Kore',
  workletBasePath = '/audioWorklets',
}) {
  onEstado?.('conectando')

  // El token (viaje de red al backend) y la preparación de audio (permiso
  // de mic + worklets, todo local salvo el propio permiso) no dependen uno
  // del otro — se piden a la vez en vez de en serie.
  const [datos, audio] = await Promise.all([obtenerToken(), prepararAudio(workletBasePath)])
  const { ctxSalida, ctxEntrada, nodoSalida, nodoEntrada, stream } = audio

  if (!datos.ok) {
    stream.getTracks().forEach((t) => t.stop())
    ctxEntrada.close().catch(() => {})
    ctxSalida.close().catch(() => {})
    const detalle = datos.error ?? 'No se pudo iniciar la sesión de voz en vivo.'
    onError?.(detalle)
    throw new Error(detalle)
  }
  const systemInstruction = construirSystemInstruction?.(datos)

  let cerrado = false
  let sesion = null

  if (ctxEntrada.state !== 'running' || ctxSalida.state !== 'running') {
    onError?.(
      `El navegador no dejó activar el audio (entrada: ${ctxEntrada.state}, salida: ${ctxSalida.state}). ` +
        'Probá tocar en cualquier parte de la pantalla y reintentar.'
    )
  }

  nodoSalida.port.onmessage = (e) => {
    if (e.data?.tipo === 'vacio') onSilencio?.()
  }

  nodoEntrada.port.onmessage = (e) => {
    if (cerrado || !sesion) return
    sesion.sendRealtimeInput({
      audio: { data: arrayBufferABase64(e.data), mimeType: `audio/pcm;rate=${SAMPLE_RATE_ENTRADA}` },
    })
  }

  const manejarMensaje = (mensaje) => {
    const contenido = mensaje.serverContent
    if (contenido?.interrupted) {
      // El usuario empezó a hablar encima del asistente — corta lo que
      // estaba sonando en vez de dejarlo terminar, para que se sienta como
      // una interrupción real y no como que lo está ignorando.
      nodoSalida.port.postMessage({ tipo: 'limpiar' })
    }
    const partes = contenido?.modelTurn?.parts ?? []
    for (const parte of partes) {
      if (parte.inlineData?.data) {
        const floats = pcm16Base64AFloat32(parte.inlineData.data)
        nodoSalida.port.postMessage(floats.buffer, [floats.buffer])
      }
      if (parte.text) onTextoModelo?.(parte.text)
    }
    if (contenido?.inputTranscription?.text) onTranscripcion?.({ quien: 'alumno', texto: contenido.inputTranscription.text })
    if (contenido?.outputTranscription?.text) onTranscripcion?.({ quien: 'kay', texto: contenido.outputTranscription.text })
    if (contenido?.turnComplete) onTurnoCompleto?.()
    if (mensaje.usageMetadata) onUso?.(mensaje.usageMetadata)
    if (mensaje.toolCall?.functionCalls?.length) {
      for (const llamada of mensaje.toolCall.functionCalls) {
        onFunctionCall?.(llamada, (resultado) => {
          if (cerrado) return
          sesion.sendToolResponse({
            functionResponses: [{ id: llamada.id, name: llamada.name, response: resultado }],
          })
        })
      }
    }
  }

  const ai = new GoogleGenAI({ apiKey: datos.token, httpOptions: { apiVersion: 'v1alpha' } })
  // Con token bloqueado (ÑANDÉ), el servidor ya fijó todo esto y lo que se
  // mande acá se ignora; se deja para tokens sin bloqueo.
  const configSesion = {
    responseModalities: ['AUDIO'],
    ...(systemInstruction ? { systemInstruction } : {}),
    ...(tools?.length ? { tools: [{ functionDeclarations: tools }] } : {}),
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voz } } },
    // Explícito en vez de confiar en el default: sin esto, si por lo que
    // sea la detección automática de actividad no quedara prendida sola,
    // Gemini nunca "escucharía" nada aunque le llegue audio — mismo síntoma
    // de "conecta pero no responde".
    realtimeInputConfig: { automaticActivityDetection: { disabled: false } },
  }

  // Intenta conectar con un modelo puntual. Asigna "sesion" (la que usa el
  // envío de audio del micrófono) apenas connect() resuelve — no hay que
  // esperar los 900ms de gracia para eso, si no se pierde el primer segundo
  // de lo que diga el usuario mientras esperamos confirmar que el modelo es
  // válido. Si el servidor rechaza este modelo después (cierre código 1008
  // "not found" típicamente, no antes), "sesion" se vuelve a limpiar antes
  // de probar el siguiente candidato.
  const intentarModelo = (modelo) =>
    new Promise((resolve) => {
      let resuelto = false
      const terminar = (valor) => {
        if (resuelto) return
        resuelto = true
        resolve(valor)
      }
      ai.live
        .connect({
          model: modelo,
          config: configSesion,
          callbacks: {
            onopen: () => onEstado?.('escuchando'),
            onmessage: manejarMensaje,
            onerror: (e) => onError?.(e?.message ?? 'Error de conexión con la Live API.'),
            onclose: (e) => {
              // Cierre limpio (código 1000, sin motivo) = charla terminada
              // normal. Cualquier otra cosa = este modelo no sirve, probamos
              // el siguiente candidato.
              if (e && (e.code !== 1000 || e.reason)) {
                sesion = null
                terminar({ ok: false, error: `código ${e.code}${e.reason ? `: ${e.reason}` : ''}` })
                return
              }
              onEstado?.('cerrado')
            },
          },
        })
        .then((s) => {
          sesion = s
          setTimeout(() => terminar({ ok: true }), 900)
        })
        .catch((err) => terminar({ ok: false, error: err.message ?? String(err) }))
    })

  const candidatos = [datos.modelo, ...modelosFallback].filter((m, i, arr) => m && arr.indexOf(m) === i)

  let ultimoError = null
  for (const modelo of candidatos) {
    const resultado = await intentarModelo(modelo)
    if (resultado.ok) break
    ultimoError = resultado.error
  }

  if (!sesion) {
    cerrarTodo()
    const detalle = `No se pudo conectar con ningún modelo de voz en vivo (${ultimoError ?? 'motivo desconocido'}).`
    onError?.(detalle)
    throw new Error(detalle)
  }

  function cerrarTodo() {
    if (cerrado) return
    cerrado = true
    try {
      sesion?.close()
    } catch {
      // no crítico
    }
    stream.getTracks().forEach((t) => t.stop())
    ctxEntrada.close().catch(() => {})
    ctxSalida.close().catch(() => {})
  }

  return { cerrar: cerrarTodo }
}
