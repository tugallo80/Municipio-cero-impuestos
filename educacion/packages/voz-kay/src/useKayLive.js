// useKayLive.js — hook de React que envuelve kaySession.js: maneja el ciclo
// de vida (iniciar/detener), guarda "estado"/"error" para pintar la UI, y
// mantiene la pantalla prendida mientras la charla está activa (Screen Wake
// Lock — útil para usarlo manejando, sin depender de ningún plugin nativo).
//
// No asume nada de tu backend ni de tus herramientas — todo entra por
// parámetros. Ver README.md.
//
// Migrado de rubikeduai-backend (rama claude/dashboard-hijos-kay, commit
// bbf7789). Para la app del alumno (EDU.06); la página de prueba usa
// kaySession.js directo, sin React.

import { useCallback, useEffect, useRef, useState } from 'react'
import { iniciarSesionKay } from './kaySession'

// Wake Lock inline (no depende de que tu proyecto ya tenga un hook propio) —
// el navegador lo libera solo si la app pasa a segundo plano, por eso hay
// que re-pedirlo al volver a estar visible.
function useWakeLockInterno(activo) {
  const wakeLockRef = useRef(null)

  useEffect(
    () => () => {
      wakeLockRef.current?.release().catch(() => {})
    },
    []
  )

  useEffect(() => {
    const pedir = async () => {
      try {
        if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        // no soportado, o el navegador lo negó (ej. batería baja) — seguimos sin bloquear la pantalla
      }
    }
    const soltar = () => {
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
    if (!activo) {
      soltar()
      return
    }
    pedir()
    const alVolverVisible = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) pedir()
    }
    document.addEventListener('visibilitychange', alVolverVisible)
    return () => document.removeEventListener('visibilitychange', alVolverVisible)
  }, [activo])
}

/**
 * @param {Object} args
 * @param {() => Promise<object>} args.obtenerToken Ver kaySession.js.
 * @param {(nombre: string, argumentos: object) => Promise<{ok: boolean, output?: string, resultado?: any, error?: string}>} args.ejecutarHerramienta
 *   Tu callable de backend que ejecuta la acción real y le da al modelo algo
 *   para confirmar en voz alta ("output"). Si no usás function calling,
 *   podés omitir esto (y "tools").
 * @param {(datosToken: object) => (string|object)} [args.construirSystemInstruction]
 * @param {Array<object>} [args.tools]
 * @param {(resultado: any, dataCompleta: object) => void} [args.onResultado]
 *   Se llama después de cada herramienta ejecutada con éxito — para que tu
 *   UI reaccione (mostrar una tarjeta, abrir un link, lo que sea). Los
 *   efectos secundarios de tu app (ej. abrir WhatsApp) van acá, no dentro de
 *   Kay.
 * @param {(mensaje: string) => void} [args.onError]
 * @param {string[]} [args.modelosFallback]
 * @param {string} [args.voz]
 * @param {string} [args.workletBasePath]
 */
export function useKayLive({
  obtenerToken,
  ejecutarHerramienta,
  construirSystemInstruction,
  tools,
  onResultado,
  onError: onErrorExterno,
  onUso,
  onTranscripcion,
  onTurnoCompleto,
  modelosFallback,
  voz,
  workletBasePath,
}) {
  const [activo, setActivo] = useState(false)
  const [estado, setEstado] = useState('idle') // idle | conectando | escuchando | pensando
  const [error, setError] = useState('')
  const sesionRef = useRef(null)
  const vivoRef = useRef(false)

  useWakeLockInterno(activo)

  const detener = useCallback(() => {
    vivoRef.current = false
    setActivo(false)
    setEstado('idle')
    sesionRef.current?.cerrar()
    sesionRef.current = null
  }, [])

  // Se desmonta el componente con la charla todavía abierta — no dejar el
  // micrófono/WebSocket colgado.
  useEffect(() => () => sesionRef.current?.cerrar(), [])

  const manejarFunctionCall = useCallback(
    async (llamada, responder) => {
      if (!ejecutarHerramienta) {
        responder({ error: `No hay ejecutarHerramienta configurado para "${llamada.name}".` })
        return
      }
      // Agregado local (no está en el Kay original): el function calling de
      // la Live API es síncrono — el audio se pausa mientras esperamos la
      // herramienta (ver README de Kay, gotcha #7) — así que este es el
      // único momento real de "procesamiento" que podemos mostrar en la cara.
      if (vivoRef.current) setEstado('pensando')
      const data = await ejecutarHerramienta(llamada.name, llamada.args ?? {})
      if (vivoRef.current) setEstado('escuchando')
      if (!data.ok) {
        responder({ error: data.error ?? 'No se pudo ejecutar la acción.' })
        return
      }
      if (!vivoRef.current) return
      onResultado?.(data.resultado, data)
      responder({ output: data.output ?? 'Listo.' })
    },
    [ejecutarHerramienta, onResultado]
  )

  const iniciar = useCallback(async () => {
    if (vivoRef.current) return
    vivoRef.current = true
    setActivo(true)
    setError('')
    setEstado('conectando')
    try {
      const sesion = await iniciarSesionKay({
        obtenerToken,
        construirSystemInstruction,
        tools,
        modelosFallback,
        voz,
        workletBasePath,
        onEstado: (e) => {
          if (!vivoRef.current) return
          setEstado(e)
          // Cierre normal de la Live API (o el usuario cortó desde otro
          // lado) — apaga "activo" solo, sin esperar a que el usuario
          // vuelva a tocar el botón.
          if (e === 'cerrado') detener()
        },
        onFunctionCall: manejarFunctionCall,
        onUso,
        onTranscripcion,
        onTurnoCompleto,
        onError: (msg) => {
          if (vivoRef.current) setError(msg)
          onErrorExterno?.(msg)
        },
      })
      if (!vivoRef.current) {
        sesion.cerrar()
        return
      }
      sesionRef.current = sesion
    } catch (err) {
      if (vivoRef.current) {
        setError(err.message ?? 'No se pudo iniciar la conversación.')
        detener()
      }
    }
  }, [obtenerToken, construirSystemInstruction, tools, modelosFallback, voz, workletBasePath, manejarFunctionCall, detener, onErrorExterno, onUso, onTranscripcion, onTurnoCompleto])

  return { activo, estado, error, iniciar, detener }
}
