// ══════════════════════════════════════════════════
//  Prueba de punta a punta del cronograma y la mentora (EDU.04b), contra lo publicado:
//   1. Un PDF de plan INVENTADO (con una lista de alumnos ficticia que se debe ignorar)
//      → eduPlan 'extraer' → áreas y temas en orden, sin nombres.
//   2. 'guardar' / 'leer' devuelven lo mismo.
//   3. eduMentora arma una tarjeta con Ser/Saber/Hacer/Autoevaluación; la segunda vez sale del caché.
//  Usa la cuenta e2e-profe de probar-clase.mjs (clave al azar en cada corrida).
// ══════════════════════════════════════════════════
import { randomBytes } from 'node:crypto'
import { appendFileSync, readFileSync } from 'node:fs'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'

const PROYECTO = process.env.PROYECTO || 'municipio-ia'
const API_KEY = process.env.FIREBASE_API_KEY
const FUNCIONES = `https://us-central1-${PROYECTO}.cloudfunctions.net`
const PROFE = { uid: 'e2e-profe', email: 'e2e-profe@alumnos.nande-educacion.local', id: 'per_e2e000' }
const CURSO = '4to_primaria'

const resumen = []
const md = (l = '') => { resumen.push(l); console.log(l) }
let fallas = 0
const chequear = (ok, t) => { md(`- ${ok ? '✅' : '❌'} ${t}`); if (!ok) fallas++ }

initializeApp({ projectId: PROYECTO, databaseURL: process.env.EDU_DATABASE_URL })
const db = getDatabase()
const fecha = new Date(Date.now() - 4 * 3600e3).toISOString().slice(0, 10)

async function entrar() {
  const clave = randomBytes(24).toString('base64url')
  try { await getAuth().updateUser(PROFE.uid, { email: PROFE.email, password: clave }) } catch { await getAuth().createUser({ uid: PROFE.uid, email: PROFE.email, password: clave }) }
  await db.ref(`edu/personal/${PROFE.uid}`).set({ id: PROFE.id, roles: { tutor: true, direccion: false }, cursos: { [CURSO]: true, '2do_secundaria': true } })
  for (const t of ['plan', 'mentora']) await db.ref(`edu/uso_${t}/${fecha}/${PROFE.id}`).remove()
  await db.ref(`edu/planes/${PROFE.id}`).remove()
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: PROFE.email, password: clave, returnSecureToken: true }),
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

// PDF mínimo de texto (una página por bloque), sin librerías.
function pdfDeTexto(paginas) {
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  const objs = []
  const add = (s) => { objs.push(s); return objs.length }
  const fuente = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  const kids = []
  const paginasId = objs.length + 1 + paginas.length * 2 // se completa después
  for (const lineas of paginas) {
    const cuerpo = ['BT', '/F1 11 Tf', '14 TL', '50 790 Td', ...lineas.map((l) => `(${esc(l)}) '`), 'ET'].join('\n')
    const cont = add(`<< /Length ${Buffer.byteLength(cuerpo, 'latin1')} >>\nstream\n${cuerpo}\nendstream`)
    kids.push(add(`<< /Type /Page /Parent ${paginasId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fuente} 0 R >> >> /Contents ${cont} 0 R >>`))
  }
  add(`<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`)
  const catalogo = add(`<< /Type /Catalog /Pages ${paginasId} 0 R >>`)
  let out = '%PDF-1.4\n'
  const offs = []
  objs.forEach((o, i) => { offs.push(Buffer.byteLength(out, 'latin1')); out += `${i + 1} 0 obj\n${o}\nendobj\n` })
  const xref = Buffer.byteLength(out, 'latin1')
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogo} 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out, 'latin1')
}

const PDF = pdfDeTexto([
  [
    'PLAN ANUAL TRIMESTRALIZADO - GESTION 2027 (EJEMPLO DE PRUEBA)',
    'Unidad Educativa: Escuela de prueba. Ano de escolaridad: 4to de primaria.',
    '',
    'AREA: MATEMATICA',
    'Primer trimestre:',
    '  1. Numeros naturales hasta el 100.000',
    '  2. Adicion y sustraccion con llevadas',
    'Segundo trimestre:',
    '  3. Multiplicacion por dos cifras',
    '  4. Fracciones: partes de un entero',
    'Tercer trimestre:',
    '  5. Medidas de longitud: metro y centimetro',
    '',
    'AREA: CIENCIAS NATURALES',
    '  1. Los seres vivos y su clasificacion (primer trimestre)',
    '  2. El ciclo del agua (tercer trimestre)',
    '',
    'AREA: COMUNICACION Y LENGUAJES',
    '  1. Lectura de cuentos y leyendas',
    '  2. El texto descriptivo',
  ],
  ['LISTA DE ESTUDIANTES (no copiar):', '  Mateo Rojas Vargas', '  Valentina Suarez Pinto', '  Thiago Vargas Lima'],
])

md('## Prueba del cronograma y la mentora (EDU.04b)')
md()
try {
  const token = await entrar()
  const sin = await llamar('eduPlan', { accion: 'leer', curso: CURSO })
  chequear(sin.error?.status === 'UNAUTHENTICATED', `Sin cuenta, eduPlan rechaza (${sin.error?.status || sin.http})`)
  const otro = await llamar('eduPlan', { accion: 'leer', curso: '6to_primaria' }, token)
  chequear(otro.error?.status === 'PERMISSION_DENIED', `Otro curso, rechaza (${otro.error?.status || otro.http})`)

  const t0 = Date.now()
  const r = await llamar('eduPlan', { accion: 'extraer', curso: CURSO, pdf: PDF.toString('base64') }, token)
  // El tope global de USD 5/día es el mismo para los chicos y para las pruebas: si ya se llegó,
  // la prueba se saltea con un aviso (no es una falla del código) y no gasta más.
  if (r.result?.motivo === 'tope_global') {
    md(`- ⏸️ Prueba salteada: hoy ya se llegó al tope de gasto de IA (${r.result.error}). Se reinicia a la medianoche de Bolivia.`)
    console.log('::warning::Prueba del cronograma salteada: tope diario de IA alcanzado')
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, resumen.join('\n') + '\n')
    await db.ref(`edu/planes/${PROFE.id}`).remove()
    process.exit(0)
  }
  chequear(r.result?.ok === true, `Leyó el PDF en ${((Date.now() - t0) / 1000).toFixed(1)} s (${r.result?.modelo || r.error?.message || r.result?.error})`)
  if (r.result?.ok) {
    const p = r.result.plan
    const mat = p.areas.find((a) => a.id === 'mat')
    chequear(!!mat && mat.temas.length >= 4, `Matemática con ${mat?.temas.length} temas: ${mat?.temas.map((t) => `${t.titulo} [T${t.trimestre}]`).join(' · ')}`)
    chequear(/fracci/i.test(mat?.temas.map((t) => t.titulo).join(' ') || ''), 'Encontró "Fracciones" en orden')
    chequear(p.areas.some((a) => a.id === 'cnat') && p.areas.some((a) => a.id === 'len'), `Áreas: ${p.areas.map((a) => a.id).join(', ')}`)
    chequear(!/Mateo|Valentina|Thiago/i.test(JSON.stringify(p)), 'Ignoró la lista de alumnos')
    md(`- Costo de leer el PDF (2 páginas): USD ${r.result.costoUsd} (${r.result.tokens} tokens)`)

    const estado = { config: { anio: 2027, distrito: 'scz_rural_demo', horario: { lun: ['mat', 'mat', 'len'], mar: ['cnat'] }, sinClase: [{ fecha: '2027-04-20', motivo: 'Fiesta patronal' }] }, plan: p, hechos: { [mat.temas[0].id]: '2027-02-01' }, perdidos: [] }
    const g = await llamar('eduPlan', { accion: 'guardar', curso: CURSO, estado }, token)
    const l = await llamar('eduPlan', { accion: 'leer', curso: CURSO }, token)
    chequear(g.result?.ok && JSON.stringify(l.result?.estado?.plan) === JSON.stringify(g.result?.estado?.plan) && l.result?.estado?.hechos?.[mat.temas[0].id] === '2027-02-01', 'Guardar y leer el cronograma devuelve lo mismo')

    // Texto de aprendizaje oficial (2.º de secundaria, Inglés): el navegador manda el texto del índice.
    const txt = readFileSync(new URL('../../datos/textos-oficiales/2do-secundaria/lengua-extranjera-ingles.txt', import.meta.url), 'utf8')
    const indice = txt.slice(txt.indexOf('ÍNDICE'), txt.indexOf('PRESENTACI', txt.indexOf('ÍNDICE') + 20) + 600)
    const ri = await llamar('eduPlan', { accion: 'extraer', curso: '2do_secundaria', texto: indice }, token)
    const ing = ri.result?.plan?.areas?.find((a) => a.id === 'ing')
    const tri = ing ? [1, 2, 3].map((n) => ing.temas.filter((t) => t.trimestre === n).length) : []
    chequear(ri.result?.ok && ing && ing.temas.length >= 8 && tri.every((n) => n >= 2), `Índice del texto oficial de Inglés → ${ing?.temas.length} unidades por trimestre ${tri.join('/')} (USD ${ri.result?.costoUsd})`)
    chequear((ing?.temas || []).some((t) => (t.contenidos || []).length >= 2), `Subtemas como contenidos: "${ing?.temas[0]?.titulo}" → ${(ing?.temas[0]?.contenidos || []).join('; ')}`)

    const tema = mat.temas.find((t) => /fracci/i.test(t.titulo)) || mat.temas[0]
    const m1 = await llamar('eduMentora', { curso: CURSO, area: 'mat', tema: tema.titulo, multigrado: ['3ro_primaria'] }, token)
    const tj = m1.result?.tarjeta
    chequear(m1.result?.ok && tj?.evaluacion?.ser && tj?.evaluacion?.saber && tj?.evaluacion?.hacer && tj?.evaluacion?.autoevaluacion, `La mentora armó la tarjeta (USD ${m1.result?.costoUsd})`)
    chequear((tj?.repaso || []).length >= 3 && (tj?.criterios || []).length >= 2, `Repaso (${tj?.repaso?.length}) y criterios (${tj?.criterios?.length})`)
    const m2 = await llamar('eduMentora', { curso: CURSO, area: 'mat', tema: tema.titulo, multigrado: ['3ro_primaria'] }, token)
    chequear(m2.result?.deCache === true && m2.result?.costoUsd === 0, 'La segunda vez sale del caché (no se paga)')
    md()
    md(`**Tarjeta de la mentora (${tema.titulo}):** ${tj?.objetivo}`)
    md(`- Actividad: ${tj?.actividad}`)
    md(`- Comunidad: ${tj?.comunidad}`)
    md(`- Evaluación: Ser: ${tj?.evaluacion?.ser} / Saber: ${tj?.evaluacion?.saber} / Hacer: ${tj?.evaluacion?.hacer} / Autoev.: ${tj?.evaluacion?.autoevaluacion}`)
  }
} catch (err) {
  chequear(false, `Error: ${err.message}`)
} finally {
  await db.ref(`edu/planes/${PROFE.id}`).remove()
}

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, resumen.join('\n') + '\n')
console.log(fallas ? `\n${fallas} chequeo(s) fallaron` : '\nTodo OK')
process.exit(fallas ? 1 : 0)
