// ══════════════════════════════════════════════════
//  Arma el plan de ejemplo de 2.º de secundaria (EDU.04b) desde el ÍNDICE de los textos
//  de aprendizaje oficiales 2025 del Ministerio (educacion/datos/textos-oficiales/).
//  Cada unidad del índice = un tema del cronograma; sus subtemas = contenidos.
//  Salida: educacion/maqueta/plan-ejemplo-2do-secundaria.js  (se vuelve a correr si cambian los .txt)
//
//  Uso: node tools/datos/armar-plan-ejemplo.mjs
// ══════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const edu = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')
const dir = resolve(edu, 'datos/textos-oficiales/2do-secundaria')

const POR_LIBRO = [
  ['lengua-extranjera-ingles.txt', 'ing'],
  ['cosmovisiones-filosofia-psicologia.txt', 'fil'],
  ['artes-plasticas-visuales.txt', 'art'],
  ['educacion-musical.txt', 'mus'],
  ['valores-espiritualidad-religiones.txt', 'val'],
]
const TRIM = { primer: 1, segundo: 2, tercer: 3 }
const limpiar = (s) => s.replace(/\.{3,}.*$/, '').replace(/\s+\d+\s*$/, '').replace(/\s+/g, ' ').trim()

function indice(texto) {
  const a = texto.search(/ÍNDICE/)
  const b = texto.indexOf('PRESENTACI', a + 20)
  return texto.slice(a, b).split('\n').slice(1)
}

// Libros de un área: Primer/Segundo/Tercer trimestre → unidad (con puntos) → subtemas (sin puntos).
function leerLibro(archivo) {
  const lineas = indice(readFileSync(resolve(dir, archivo), 'utf8'))
  const temas = []
  let trimestre = 0
  let pendiente = '' // unidades cuyo título ocupa dos líneas
  let pendienteCrudo = ''
  let sangriaUnidad = 0
  const sangria = (l) => l.match(/^\s*/)[0].length
  for (const crudo of lineas) {
    const l = crudo.replace(/\s+$/, '')
    if (!l.trim() || /^Presentaci/i.test(l.trim())) continue
    const m = l.trim().match(/^(Primer|Segundo|Tercer) trimestre/i)
    if (m) { trimestre = TRIM[m[1].toLowerCase()]; pendiente = ''; continue }
    if (/\.{4,}/.test(l)) {
      // Unidad (lleva los puntos hasta el número de página)
      temas.push({ titulo: limpiar(`${pendiente} ${l}`), trimestre, contenidos: [] })
      sangriaUnidad = sangria(pendiente ? pendienteCrudo : l)
      pendiente = ''
      continue
    }
    const t = temas[temas.length - 1]
    if (t && t.trimestre === trimestre && sangria(l) > sangriaUnidad) {
      // Subtema; si empieza en minúscula es la segunda línea del anterior.
      if (/^[a-záéíóúñ(]/.test(l.trim()) && t.contenidos.length) t.contenidos[t.contenidos.length - 1] += ' ' + limpiar(l)
      else t.contenidos.push(limpiar(l))
    } else {
      if (!pendiente) pendienteCrudo = l
      pendiente = limpiar(`${pendiente} ${l}`)
    }
  }
  return temas
}

// Texto general: ÁREA EN MAYÚSCULAS → unidades (sin trimestres en el índice).
function leerGeneral() {
  const lineas = indice(readFileSync(resolve(dir, 'texto-general-areas-principales.txt'), 'utf8'))
  const AREA = { 'LENGUA CASTELLANA': 'len', MATEMÁTICA: 'mat', 'BIOLOGÍA - GEOGRAFÍA': 'bio', 'CIENCIAS SOCIALES': 'csoc' }
  const out = {}
  let actual = null
  for (const l of lineas) {
    const t = limpiar(l)
    if (!t || /^Presentaci/i.test(t)) continue
    if (AREA[t]) { actual = AREA[t]; out[actual] = []; continue }
    if (actual) out[actual].push({ titulo: t, trimestre: 1, contenidos: [] })
  }
  return out
}

const NOMBRES = {
  ing: 'Lengua Extranjera (Inglés)', fil: 'Cosmovisiones, Filosofía y Psicología', art: 'Artes Plásticas y Visuales',
  mus: 'Educación Musical', val: 'Valores, Espiritualidades y Religiones', len: 'Comunicación y Lenguajes: Lengua Castellana',
  mat: 'Matemática', bio: 'Biología - Geografía', csoc: 'Ciencias Sociales',
}
const areas = []
const general = leerGeneral()
for (const id of ['len', 'mat', 'bio', 'csoc']) areas.push({ id, temas: general[id] || [] })
for (const [archivo, id] of POR_LIBRO) areas.push({ id, temas: leerLibro(archivo) })

const plan = {
  titulo: '2.º de secundaria — índices de los textos de aprendizaje 2025 del Ministerio (EJEMPLO, a verificar con el profe)',
  curso: '2do_secundaria',
  fuente: 'Textos de aprendizaje 2025, Ministerio de Educación de Bolivia (índices). El texto general solo trae las unidades del 1.er trimestre de Lengua, Matemática, Biología-Geografía y Sociales.',
  areas: areas.map(({ id, temas }) => ({
    id,
    nombre: NOMBRES[id],
    temas: temas.slice(0, 40).map((t, i) => ({
      id: `${id}-${i + 1}`,
      titulo: t.titulo.slice(0, 120),
      peso: t.contenidos.length >= 4 ? 3 : 2,
      trimestre: t.trimestre,
      objetivo: '',
      contenidos: t.contenidos.slice(0, 8).map((c) => c.slice(0, 120)),
    })),
  })),
}
const salida = resolve(edu, 'maqueta/plan-ejemplo-2do-secundaria.js')
writeFileSync(salida, `// GENERADO por tools/datos/armar-plan-ejemplo.mjs desde los índices de los textos oficiales 2025.\n// No editar a mano: volver a correr el script.\nwindow.PLAN_EJEMPLO_2SEC = ${JSON.stringify(plan, null, 1)};\n`)
for (const a of plan.areas) console.log(`${a.id.padEnd(5)} ${String(a.temas.length).padStart(2)} temas · ${a.temas.map((t) => `[T${t.trimestre}] ${t.titulo} (${t.contenidos.length})`).join(' | ').slice(0, 400)}`)
