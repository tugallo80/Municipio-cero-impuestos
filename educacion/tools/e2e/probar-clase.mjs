// ══════════════════════════════════════════════════
//  Prueba de punta a punta de la clase grabada (EDU.04a), contra lo publicado:
//   1. Una "clase" corta hablada con espeak-ng (con nombres INVENTADOS) → webm/opus
//      y m4a (Safari) → eduClase → informe.
//   2. El informe no tiene nombres, trae la tarea, no inventa alertas y no guarda audio.
//   3. La profe Taji (voz en vivo) responde "¿qué tarea dejó el profe?" con lo de la clase.
//   4. Se borra todo lo de la prueba (eduClases borrar) para no ensuciar el contexto del curso.
//  Necesita espeak-ng y ffmpeg. Cuentas propias con clave al azar en cada corrida.
// ══════════════════════════════════════════════════
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'
import { GoogleGenAI, Modality } from '@google/genai'

const PROYECTO = process.env.PROYECTO || 'municipio-ia'
const API_KEY = process.env.FIREBASE_API_KEY
const SALIDA = process.env.SALIDA || 'salida-e2e'
const FUNCIONES = `https://us-central1-${PROYECTO}.cloudfunctions.net`
const DOM = 'alumnos.nande-educacion.local'
const PROFE = { uid: 'e2e-profe', email: `e2e-profe@${DOM}`, id: 'per_e2e000' }
const ALU = { uid: 'e2e-clase', email: `e2e-clase@${DOM}`, alumnoId: 'alu_e2ec00' }
const CURSO = '4to_primaria'

mkdirSync(SALIDA, { recursive: true })
const resumen = []
const md = (l = '') => { resumen.push(l); console.log(l) }
let fallas = 0
const chequear = (ok, t) => { md(`- ${ok ? '✅' : '❌'} ${t}`); if (!ok) fallas++ }
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

initializeApp({ projectId: PROYECTO, databaseURL: process.env.EDU_DATABASE_URL })
const db = getDatabase()
const fecha = new Date(Date.now() - 4 * 3600e3).toISOString().slice(0, 10)

async function cuenta(c) {
  const clave = randomBytes(24).toString('base64url')
  try { await getAuth().updateUser(c.uid, { email: c.email, password: clave }) } catch { await getAuth().createUser({ uid: c.uid, email: c.email, password: clave }) }
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: c.email, password: clave, returnSecureToken: true }),
  })
  const j = await r.json()
  if (!j.idToken) throw new Error(`No se pudo iniciar sesión: ${j.error?.message}`)
  return j.idToken
}

async function llamar(nombre, data, idToken) {
  const r = await fetch(`${FUNCIONES}/${nombre}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
    body: JSON.stringify({ data }),
  })
  const j = await r.json().catch(() => ({}))
  return { http: r.status, ...j }
}

// ── La clase de prueba (todo inventado) ───────────
const CLASE = [
  'Buenos días, chicos. Hoy en Ciencias Naturales vamos a ver el ciclo del agua.',
  'Mateo, sentate por favor. Valentina, ¿me ayudás a repartir las hojas?',
  'Primero, el sol calienta el agua del río Piraí y el agua se evapora: sube como vapor.',
  'Arriba hace frío, el vapor se enfría y se juntan gotitas: eso se llama condensación, y así se forman las nubes.',
  'Cuando las gotitas pesan mucho, cae la lluvia. Eso es la precipitación.',
  '¿Alguien tiene una duda? Sí, Mateo pregunta si la lluvia es la misma agua del río. ¡Muy buena pregunta! Sí, es la misma agua que da vueltas.',
  'Bueno, la tarea para el jueves es dibujar el ciclo del agua en el cuaderno, con flechas y los tres nombres: evaporación, condensación y precipitación.',
  'Repito: la tarea es el dibujo del ciclo del agua para el jueves. Nos vemos mañana, chicos.',
].join(' ')

function audioClase() {
  const wav = join(SALIDA, 'clase.wav')
  execFileSync('espeak-ng', ['-v', 'es-419', '-s', '140', '-w', wav, CLASE])
  const webm = join(SALIDA, 'clase.webm')
  const m4a = join(SALIDA, 'clase.m4a')
  // Igual que el navegador: opus mono a 16 kbps (Chrome/Android) y AAC en mp4 (Safari/iPhone).
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-c:a', 'libopus', '-b:a', '16k', webm])
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-c:a', 'aac', '-b:a', '32k', m4a])
  const seg = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).toString().trim())
  return { webm: readFileSync(webm), m4a: readFileSync(m4a), segundos: seg }
}

// ── Voz en vivo mínima (texto → audio de Taji, con transcripción) ──
async function preguntarATaji(token, pregunta) {
  const estado = { kay: '', usos: [], turnos: 0 }
  let fin = null
  const ai = new GoogleGenAI({ apiKey: token.token, httpOptions: { apiVersion: 'v1alpha' } })
  const sesion = await ai.live.connect({
    model: token.modelo,
    config: { responseModalities: [Modality.AUDIO] },
    callbacks: {
      onmessage: (m) => {
        const c = m.serverContent
        if (c?.outputTranscription?.text) estado.kay += c.outputTranscription.text
        if (m.usageMetadata) estado.usos.push(m.usageMetadata)
        for (const f of m.toolCall?.functionCalls ?? []) sesion.sendToolResponse({ functionResponses: [{ id: f.id, name: f.name, response: { output: 'Listo.' } }] })
        if (c?.turnComplete) { estado.turnos++; fin?.() }
      },
      onerror: () => {},
      onclose: () => {},
    },
  })
  const inicio = Date.now()
  await new Promise((res) => { const t = setTimeout(res, 60000); fin = () => { clearTimeout(t); res() }; sesion.sendRealtimeInput({ text: pregunta }) })
  try { sesion.close() } catch {}
  return { ...estado, segundos: (Date.now() - inicio) / 1000 }
}

md('## Prueba de punta a punta de la clase grabada (EDU.04a)')
md()
let claseId = null
let tokenProfe = null
try {
  // Cuentas
  tokenProfe = await cuenta(PROFE)
  await db.ref(`edu/personal/${PROFE.uid}`).set({ id: PROFE.id, roles: { tutor: true, direccion: false }, cursos: { [CURSO]: true }, pruebaAuto: true })
  await db.ref(`edu/uso_clase/${fecha}/${PROFE.id}`).remove()
  // Restos de corridas anteriores que fallaron a mitad: que no queden en el contexto del curso.
  const viejas = (await db.ref(`edu/clases/${CURSO}`).orderByChild('personalId').equalTo(PROFE.id).once('value')).val() || {}
  for (const id of Object.keys(viejas)) await db.ref().update({ [`edu/clases/${CURSO}/${id}`]: null, [`edu/contexto_dia/${CURSO}/${id}`]: null })
  if (Object.keys(viejas).length) md(`- Limpié ${Object.keys(viejas).length} clase(s) de pruebas anteriores`)
  const tokenAlu = await cuenta(ALU)
  await db.ref(`edu/uid_alumno/${ALU.uid}`).set(ALU.alumnoId)
  await db.ref(`edu/alumnos/${ALU.alumnoId}`).set({ curso: CURSO, estilo: 'visual', pruebaAuto: true })
  await db.ref(`edu/uso/${fecha}/${ALU.alumnoId}`).remove()

  const audio = audioClase()
  md(`- Clase de prueba: ${audio.segundos.toFixed(0)} s de voz sintética · webm ${Math.round(audio.webm.length / 1024)} KB · m4a ${Math.round(audio.m4a.length / 1024)} KB`)
  const pedido = (buf, mime) => ({ audio: buf.toString('base64'), mime, segundos: audio.segundos, curso: CURSO, materia: 'Ciencias Naturales', tema: 'El ciclo del agua', pensum: 'Unidad 3 · Tema 4' })

  // Seguridad
  const sin = await llamar('eduClase', pedido(audio.webm, 'audio/webm'))
  chequear(sin.error?.status === 'UNAUTHENTICATED', `Sin iniciar sesión, eduClase rechaza (${sin.error?.status || sin.http})`)
  const comoAlumno = await llamar('eduClase', pedido(audio.webm, 'audio/webm'), tokenAlu)
  chequear(comoAlumno.error?.status === 'PERMISSION_DENIED', `Un alumno no puede mandar una clase (${comoAlumno.error?.status || comoAlumno.http})`)
  const otroCurso = await llamar('eduClase', { ...pedido(audio.webm, 'audio/webm'), curso: '6to_primaria' }, tokenProfe)
  chequear(otroCurso.error?.status === 'PERMISSION_DENIED', `Un profe no puede mandar clases de otro curso (${otroCurso.error?.status || otroCurso.http})`)

  // La clase (Chrome / Android)
  const t0 = Date.now()
  const r = await llamar('eduClase', pedido(audio.webm, 'audio/webm;codecs=opus'), tokenProfe)
  const ms = Date.now() - t0
  // Las pruebas tienen su propia bolsa (USD 1/día, aparte de la de los chicos): si se agotó,
  // la prueba se saltea con un aviso (no es una falla del código) y no gasta más.
  if (/^tope_/.test(r.result?.motivo || '')) {
    md(`- ⏸️ Prueba salteada: hoy ya se llegó al tope de gasto de IA de las pruebas o el general (${r.result.error}). Se reinicia a la medianoche de Bolivia.`)
    console.log('::warning::Prueba de la clase grabada salteada: tope diario de IA alcanzado')
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, resumen.join('\n') + '\n')
    process.exit(0)
  }
  chequear(r.result?.ok === true, `eduClase resumió la clase webm/opus en ${(ms / 1000).toFixed(1)} s (${r.result?.clase?.modelo || r.error?.message || r.result?.error})`)
  if (r.result?.ok) {
    const c = r.result.clase
    claseId = c.id
    const inf = c.informe
    const todo = JSON.stringify(c)
    chequear(!/Mateo|Valentina/i.test(todo), 'Ningún nombre de alumno en el informe ni en la transcripción')
    chequear(inf.profe.tareas.some((t) => /dibuj/i.test(t.descripcion)), `Encontró la tarea: "${inf.profe.tareas.map((t) => `${t.descripcion} (${t.para})`).join('; ')}"`)
    chequear(inf.profe.sugerencias.length >= 1 && inf.profe.sugerencias.length <= 3, `Sugerencias para el profe: ${inf.profe.sugerencias.length}`)
    chequear(inf.direccion.alertas.length === 0, `Sin alertas inventadas en una clase tranquila (${inf.direccion.alertas.length})`)
    chequear(inf.contexto.tareas.length > 0, 'Guardó el contexto del día para los profes IA')
    const guardada = (await db.ref(`edu/clases/${CURSO}/${c.id}`).once('value')).val()
    const mayor = Math.max(...JSON.stringify(guardada).split('"').map((s) => s.length))
    chequear(!JSON.stringify(guardada).includes(audio.webm.toString('base64').slice(0, 200)) && mayor < 100_000, 'El audio NO quedó guardado en la base')
    chequear(guardada.vence - guardada.creado === 30 * 864e5 && guardada.venceTranscripcion - guardada.creado === 7 * 864e5, 'Vence a los 30 días (transcripción a los 7)')
    const ctx = (await db.ref(`edu/contexto_dia/${CURSO}/${c.id}`).once('value')).val()
    chequear(ctx && ctx.vence - ctx.creado === 14 * 864e5, 'Contexto del día guardado, vence a los 14 días')
    md()
    md(`**Costo medido:** USD ${r.result.costoUsd} por ${audio.segundos.toFixed(0)} s → **≈ USD ${r.result.costoPorHoraUsd} por hora de clase** (${r.result.tokens} tokens, modelo ${c.modelo})`)
    md()
    md(`**Para el profe:** ${inf.profe.resumen}`)
    md(`- Contra el pensum: ${inf.profe.comparacionPensum}`)
    md(`- Sugerencias: ${inf.profe.sugerencias.join(' / ')}`)
    md(`**Para la dirección:** ${inf.direccion.resumen}`)
    md(`**Transcripción (sin nombres):** ${c.transcripcion.slice(0, 600).replace(/\n/g, ' ')}`)
    md()

    // El profe y la dirección ven lo mismo: listar devuelve el mismo informe
    const lista = await llamar('eduClases', { accion: 'listar' }, tokenProfe)
    const enLista = lista.result?.clases?.find((x) => x.id === c.id)
    chequear(enLista && JSON.stringify(enLista.informe) === JSON.stringify(c.informe), 'eduClases devuelve el mismo informe')

    // Taji responde con lo de la clase
    const tk = await llamar('eduKayToken', { profe: 'la_profe' }, tokenAlu)
    chequear(tk.result?.ok === true, 'La profe Taji da token al alumno del mismo curso')
    if (tk.result?.ok) {
      const ch = await preguntarATaji(tk.result, 'Profe, ¿qué tarea dejó el profe en la clase de ciencias?')
      await llamar('eduKayUso', { sesionId: tk.result.sesionId, usos: ch.usos, segundos: ch.segundos, motivoFin: 'e2e-clase' }, tokenAlu)
      chequear(/dibuj/i.test(ch.kay) && /agua/i.test(ch.kay), `Taji contesta con la tarea de la clase real: "${ch.kay.trim().slice(0, 300)}"`)
    }
  }

  // iPhone / Safari: audio/mp4 (AAC)
  const r2 = await llamar('eduClase', pedido(audio.m4a, 'audio/mp4'), tokenProfe)
  chequear(r2.result?.ok === true, `Formato de iPhone (audio/mp4) también funciona (${r2.result?.ok ? `USD ${r2.result.costoUsd}` : r2.error?.message || r2.result?.error})`)
  if (r2.result?.ok) await llamar('eduClases', { accion: 'borrar', curso: CURSO, id: r2.result.clase.id }, tokenProfe)
} catch (err) {
  chequear(false, `Error: ${err.message}`)
} finally {
  if (claseId && tokenProfe) {
    const b = await llamar('eduClases', { accion: 'borrar', curso: CURSO, id: claseId }, tokenProfe)
    const queda = (await db.ref(`edu/contexto_dia/${CURSO}/${claseId}`).once('value')).val()
    chequear(b.result?.ok === true && !queda, `Borrar el informe borra también lo que sabían los profes IA (${JSON.stringify(b.result || b.error)}, contexto ${queda ? 'quedó' : 'borrado'})`)
  }
}

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, resumen.join('\n') + '\n')
writeFileSync(join(SALIDA, 'resumen-clase.md'), resumen.join('\n'))
console.log(fallas ? `\n${fallas} chequeo(s) fallaron` : '\nTodo OK')
process.exit(fallas ? 1 : 0)
