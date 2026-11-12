// ══════════════════════════════════════════════════
//  Prueba de punta a punta de la demo sin login (EDU.15), contra lo publicado:
//   1. Una llave mala se rechaza; una buena devuelve el pase y entra a la cuenta demo (sin clave).
//   2. La cuenta demo ve todo armado: tareas enviadas (alumno y profe), clase grabada, mapa y cronograma.
//   3. Gasta de su propia bolsa (edu/uso_demo), no de la general.
//   4. La propuesta del mapa sale del caché la segunda vez (al instante y sin costo); de paso deja
//      listas las tres propuestas de la pantalla para la presentación (tema del mapa de demo-piloto.json).
//   5. Con la bolsa demo agotada responde "tope_demo" (la pantalla muestra el ejemplo).
//  Usa una llave de prueba propia (se crea y se borra acá): la llave real de la presentación no
//  se toca ni se conoce.
// ══════════════════════════════════════════════════
import { randomBytes, createHash } from 'node:crypto'
import { appendFileSync } from 'node:fs'
import { initializeApp } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'
import { readFileSync } from 'node:fs'
const TEMA_MAPA = JSON.parse(readFileSync(new URL('../datos/demo-piloto.json', import.meta.url), 'utf8')).temaMapa

const PROYECTO = process.env.PROYECTO || 'municipio-ia'
const API_KEY = process.env.FIREBASE_API_KEY
const FUNCIONES = `https://us-central1-${PROYECTO}.cloudfunctions.net`
const CURSO = '2do_secundaria'

const resumen = []
const md = (l = '') => { resumen.push(l); console.log(l) }
let fallas = 0
const chequear = (ok, t) => { md(`- ${ok ? '✅' : '❌'} ${t}`); if (!ok) fallas++ }

initializeApp({ projectId: PROYECTO, databaseURL: process.env.EDU_DATABASE_URL })
const db = getDatabase()
const fecha = new Date(Date.now() - 4 * 3600e3).toISOString().slice(0, 10)
const leer = async (ruta) => (await db.ref(ruta).once('value')).val()

async function llamar(nombre, data, idToken) {
  const t0 = Date.now()
  const r = await fetch(`${FUNCIONES}/${nombre}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
    body: JSON.stringify({ data }),
  })
  const j = await r.json().catch(() => ({}))
  return { http: r.status, ms: Date.now() - t0, ...j }
}

md('## Demo sin login (EDU.15)')
md()
const llave = randomBytes(16).toString('base64url')
await db.ref('edu/demo/llaves/e2e').set(createHash('sha256').update(llave).digest('hex'))
const topeOriginal = await leer(`edu/uso_demo/${fecha}`)
try {
  const mala = await llamar('eduDemo', { llave: randomBytes(16).toString('base64url') })
  chequear(mala.error?.status === 'PERMISSION_DENIED', `Una llave inventada no entra (${mala.error?.status || mala.http})`)

  const buena = await llamar('eduDemo', { llave })
  chequear(buena.result?.ok && !!buena.result?.token, `La llave buena da el pase de la demo${buena.error ? ` — ${buena.error.status}: ${buena.error.message}` : ''} (${buena.ms} ms)`)
  if (!buena.result?.token) throw new Error(buena.error?.status === 'FAILED_PRECONDITION' ? 'Falta el permiso para firmar el pase (paso 5c de configurar-nande.sh)' : 'Sin pase')
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: buena.result.token, returnSecureToken: true }),
  })
  const tok = (await r.json()).idToken
  chequear(!!tok, 'Con el pase entra a la cuenta demo, sin usuario ni clave')

  // Todo armado
  const mias = await llamar('eduTareas', { accion: 'mias' }, tok)
  const ids = (mias.result?.tareas || []).map((t) => t.id)
  chequear(ids.includes('demo-tarea-1') && ids.includes('demo-tarea-2'), `Como alumno ve sus 2 tareas en el modo directo (${(mias.result?.tareas || []).filter((t) => t.id.startsWith('demo-')).map((t) => `"${t.titulo}" para el ${t.entrega}`).join(' · ')})`)
  const lista = await llamar('eduTareas', { accion: 'listar', curso: CURSO }, tok)
  chequear((lista.result?.tareas || []).find((t) => t.id === 'demo-tarea-1')?.hechas === 7, 'Como profe ve las tareas enviadas y que 7 de 12 ya la entregaron')
  const clases = await llamar('eduClases', { accion: 'listar' }, tok)
  chequear((clases.result?.clases || []).some((c) => c.id === 'demo-clase-1'), 'Ve la clase grabada de ejemplo con su informe')
  const mapa = await llamar('eduMapa', { accion: 'curso', curso: CURSO }, tok)
  chequear(mapa.result?.guardado?.grupos?.length === 3, `El mapa ya está armado (${(mapa.result?.guardado?.grupos || []).map((g) => g.nombre).join(', ')})`)
  const plan = await llamar('eduPlan', { accion: 'leer', curso: CURSO }, tok)
  chequear((plan.result?.estado?.plan?.areas || []).length >= 3 && Object.keys(plan.result?.estado?.hechos || {}).length > 10, `El cronograma está cargado (${(plan.result?.estado?.plan?.areas || []).map((a) => a.id).join(', ')}) y con temas ya dados`)

  // Bolsa propia
  const antesD = (await leer(`edu/uso_demo/${fecha}/sesiones`)) || 0
  const antesG = (await leer(`edu/uso_global/${fecha}/sesiones`)) || 0
  const tk = await llamar('eduKayToken', { profe: 'la_profe' }, tok)
  if (tk.result?.sesionId) await llamar('eduKayUso', { sesionId: tk.result.sesionId, usos: [], segundos: 1, motivoFin: 'e2e-demo' }, tok)
  const despuesD = (await leer(`edu/uso_demo/${fecha}/sesiones`)) || 0
  const despuesG = (await leer(`edu/uso_global/${fecha}/sesiones`)) || 0
  chequear(tk.result?.ok === true, `La voz de los profes le da token a la cuenta demo (${tk.result?.ok ? 'ok' : tk.result?.error || tk.error?.message})`)
  chequear(despuesD === antesD + 1 && despuesG === antesG, `…y cuenta en la bolsa de la demo, no en la general (demo ${antesD}→${despuesD}, general ${antesG}→${despuesG})`)

  // Caché de la demo: deja listas las propuestas que pide la pantalla (tema por defecto).
  for (const objetivo of ['parejas', 'niveles', 'atencion']) {
    const p1 = await llamar('eduMapa', { accion: 'proponer', curso: CURSO, objetivo, tema: TEMA_MAPA }, tok)
    const p2 = await llamar('eduMapa', { accion: 'proponer', curso: CURSO, objetivo, tema: TEMA_MAPA }, tok)
    chequear(p1.result?.ok && p2.result?.cache === true && p2.result?.costoUsd === 0, `Mapa "${objetivo}": ${p1.result?.cache ? 'ya estaba en caché' : `la mentora tardó ${(p1.ms / 1000).toFixed(1)} s (USD ${p1.result?.costoUsd})`}; la segunda vez, del caché en ${(p2.ms / 1000).toFixed(1)} s y sin costo`)
  }

  // Bolsa agotada → tope_demo (y se restaura enseguida)
  await db.ref(`edu/uso_demo/${fecha}/costoUsd`).set(99)
  const agotada = await llamar('eduMapa', { accion: 'proponer', curso: CURSO, objetivo: 'parejas', tema: 'Fracciones', nueva: true }, tok)
  chequear(agotada.result?.ok === false && agotada.result?.motivo === 'tope_demo', `Con la bolsa de la demo agotada responde "${agotada.result?.motivo}" y la pantalla muestra el ejemplo`)
} catch (err) {
  chequear(false, `Error: ${err.message}`)
} finally {
  await db.ref(`edu/uso_demo/${fecha}/costoUsd`).set(topeOriginal?.costoUsd ?? null)
  await db.ref('edu/demo/llaves/e2e').remove()
}

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, resumen.join('\n') + '\n')
console.log(fallas ? `\n${fallas} chequeo(s) fallaron` : '\nTodo OK')
process.exit(fallas ? 1 : 0)
