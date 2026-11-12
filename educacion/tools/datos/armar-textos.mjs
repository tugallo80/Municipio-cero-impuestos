// ══════════════════════════════════════════════════
//  EDU.17 — Arma los textos oficiales de 2.º de secundaria para el lector "Mis textos" del alumno.
//  Entrada: educacion/datos/textos-oficiales/2do-secundaria/*.txt (texto extraído de los PDF del
//  Ministerio, distribución gratuita). Salida: educacion/maqueta/textos/<area>.json + indice.json
//  Cada área: trimestres → unidades (con sus subtemas del índice) → párrafos de texto.
//  Uso: node tools/datos/armar-textos.mjs   (se vuelve a correr si cambian los .txt)
// ══════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const edu = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')
const dir = resolve(edu, 'datos/textos-oficiales/2do-secundaria')
const sal = resolve(edu, 'maqueta/textos')
mkdirSync(sal, { recursive: true })

const LIBROS = [
  ['ing', 'Lengua Extranjera (Inglés)', 'lengua-extranjera-ingles.txt'],
  ['fil', 'Cosmovisiones, Filosofía y Psicología', 'cosmovisiones-filosofia-psicologia.txt'],
  ['art', 'Artes Plásticas y Visuales', 'artes-plasticas-visuales.txt'],
  ['mus', 'Educación Musical', 'educacion-musical.txt'],
  ['val', 'Valores, Espiritualidades y Religiones', 'valores-espiritualidad-religiones.txt'],
]
// carpetas de las páginas reales en imagen (datos/textos-oficiales/2do-secundaria/paginas/<carpeta>/NNN.webp)
const CARPETA = { ing: 'ingles', fil: 'filosofia', art: 'artes', mus: 'musica', val: 'valores' }
const TRIM = { primer: 1, segundo: 2, tercer: 3 }
const limpiarTitulo = (s) => s.replace(/\.{3,}\s*\d*\s*$/, '').replace(/\s+\d+\s*$/, '').replace(/\s+/g, ' ').trim()
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim()

// Texto de PDF → párrafos legibles (saca encabezados, números de página y une las líneas cortadas)
const RUIDO = /EDUCACIÓN SECUNDARIA COMUNITARIA PRODUCTIVA|SEGUNDO AÑO DE ESCOLARIDAD|^ÁREA:|^ÁREA DE SABERES|LA VENTA DE ESTE DOCUMENTO/i
function parrafos(texto) {
  const lineas = texto.split('\n').flatMap((l) => l.split(/\s{4,}/))   // columnas separadas por muchos espacios
    .map((l) => l.replace(/\s+/g, ' ').trim()).map((l) => (RUIDO.test(l) ? '' : l))
  const out = []; let actual = ''
  for (const l of lineas) {
    if (!l || /^\d{1,3}$/.test(l)) { if (actual) { out.push(actual); actual = '' } continue }
    if (actual.endsWith('-') && /^[a-záéíóúñ]/.test(l)) actual = actual.slice(0, -1) + l
    else actual = actual ? `${actual} ${l}` : l
  }
  if (actual) out.push(actual)
  return out.map((p) => p.replace(/\\([!.\-*_#()[\]])/g, '$1')).filter((p) => p.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g, '').length >= 3)
}

// Índice de un libro de área: trimestre → unidad (con página) → subtemas
function indiceLibro(texto) {
  const a = texto.search(/ÍNDICE/), b = texto.indexOf('PRESENTACI', a + 20)
  const unidades = []; let trimestre = 0
  for (const crudo of texto.slice(a, b).split('\n').slice(1)) {
    const l = crudo.replace(/\s+$/, ''); if (!l.trim() || /^Presentaci/i.test(l.trim())) continue
    const m = l.trim().match(/^(Primer|Segundo|Tercer) trimestre/i)
    if (m) { trimestre = TRIM[m[1].toLowerCase()]; continue }
    const pg = l.match(/\.{3,}\s*(\d+)\s*$/)
    if (pg) {
      const titulo = limpiarTitulo(l)
      const previa = unidades[unidades.length - 1]
      // título en dos líneas: la línea anterior sin página quedó como "pendiente"
      unidades.push({ titulo: (unidades.pendiente ? unidades.pendiente + ' ' : '') + titulo, trimestre, pagina: +pg[1], subtemas: [] }); unidades.pendiente = ''
      continue
    }
    const u = unidades[unidades.length - 1]
    if (u && /^\s{5,}/.test(l)) u.subtemas.push(l.trim())
    else unidades.pendiente = ((unidades.pendiente || '') + ' ' + l.trim()).trim()
  }
  return unidades
}

const resumen = []
for (const [id, nombre, archivo] of LIBROS) {
  const texto = readFileSync(resolve(dir, archivo), 'utf8')
  const paginas = texto.split('\f')
  const unidades = indiceLibro(texto)
  // desfase entre el número impreso y la hoja del PDF: se busca el título de la 1.ª unidad en el cuerpo
  const clave = norm(unidades[0].titulo).slice(0, 22)
  let hoja = paginas.findIndex((p, i) => i > 3 && norm(p).includes(clave))
  const desfase = hoja >= 0 ? hoja - unidades[0].pagina : 0
  const temas = unidades.map((u, i) => {
    const desde = u.pagina + desfase, hasta = (unidades[i + 1] ? unidades[i + 1].pagina + desfase : paginas.length) - 1
    const ps = [], ph = []; for (let k = desde; k <= hasta && k < paginas.length; k++) { const pp = parrafos(paginas[k]); ps.push(...pp); pp.forEach(() => ph.push(k + 1)) }
    // hoja = número de hoja del PDF (001 = portada), el de las imágenes de paginas/<carpeta>/NNN.webp
    return { id: `${id}-${i + 1}`, titulo: u.titulo, trimestre: u.trimestre, pagina: u.pagina, hoja: desde + 1, hojaFin: hasta + 1, subtemas: u.subtemas, parrafos: ps, ph }
  })
  writeFileSync(resolve(sal, `${id}.json`), JSON.stringify({ id, nombre, carpeta: CARPETA[id], hojas: paginas.length, fuente: 'Texto de aprendizaje 2025, 2.º año de escolaridad, Educación Secundaria Comunitaria Productiva. Ministerio de Educación de Bolivia (distribución gratuita).', completo: true, temas }))
  resumen.push({ id, nombre, completo: true, temas: temas.map(({ id, titulo, trimestre, subtemas, parrafos }) => ({ id, titulo, trimestre, subtemas, conTexto: parrafos.length > 0 })) })
  console.log(id, temas.length, 'unidades', 'desfase', desfase, 'párrafos', temas.reduce((a, t) => a + t.parrafos.length, 0))
}

// Texto general (Lengua, Matemática, Biología-Geografía, Sociales): índice completo, contenido parcial
{
  const texto = readFileSync(resolve(dir, 'texto-general-areas-principales.txt'), 'utf8')
  const a = texto.search(/ÍNDICE/), b = texto.indexOf('PRESENTACI', a + 20)
  const AREA = { 'LENGUA CASTELLANA': ['len', 'Lengua Castellana'], 'MATEMÁTICA': ['mat', 'Matemática'], 'BIOLOGÍA - GEOGRAFÍA': ['bio', 'Biología - Geografía'], 'CIENCIAS SOCIALES': ['csoc', 'Ciencias Sociales'] }
  // el índice viene en un renglón largo: "Título.......8 Otro título.....12 Segundo trimestre ..."
  const plano = texto.slice(a, b).replace(/ÍNDICE/g, '').replace(/\s+/g, ' ')
  const piezas = plano.split(/(\.{3,}\s*\d+)/)
  const areas = {}; let actual = null, trimestre = 1, previo = ''
  for (let i = 0; i < piezas.length; i += 2) {
    let t = (piezas[i] || '').trim(); const pg = piezas[i + 1] ? +piezas[i + 1].replace(/\D/g, '') : null
    for (;;) {   // marcas sueltas de trimestre o de área dentro del texto
      const m = t.match(/^(Primer|Segundo|Tercer) trimestre\s*/i); if (m) { trimestre = TRIM[m[1].toLowerCase()]; t = t.slice(m[0].length); continue }
      break
    }
    const mt = t.match(/\s(Primer|Segundo|Tercer) trimestre$/i)
    let sig = null; if (mt) { sig = TRIM[mt[1].toLowerCase()]; t = t.slice(0, -mt[0].length).trim() }
    const ar = Object.keys(AREA).find((k) => t.toUpperCase() === k)
    if (ar) { actual = AREA[ar][0]; areas[actual] = { nombre: AREA[ar][1], temas: [] }; trimestre = 1 }
    else if (actual && t && pg !== null && !/^Presentaci/i.test(t)) areas[actual].temas.push({ titulo: t, trimestre, pagina: pg })
    if (sig) trimestre = sig
  }
  const cuerpo = texto.slice(b)
  const cuerpoN = norm(cuerpo)
  for (const [id, ar] of Object.entries(areas)) {
    // se busca cada título en el cuerpo, en orden; el texto entre dos títulos encontrados es la unidad
    let desde = 0
    const pos = ar.temas.map((t) => { const k = norm(t.titulo).slice(0, 30); const j = cuerpoN.indexOf(k, desde); if (j >= 0) desde = j + k.length; return j })
    ar.temas = ar.temas.map((t, i) => ({ id: `${id}-${i + 1}`, titulo: t.titulo, trimestre: t.trimestre, pagina: t.pagina, subtemas: [], _pos: pos[i] }))
  }
  // posiciones normalizadas → cortes aproximados en el texto original (misma proporción)
  const prop = cuerpo.length / cuerpoN.length
  const todos = Object.values(areas).flatMap((a) => a.temas).filter((t) => t._pos >= 0).sort((x, y) => x._pos - y._pos)
  todos.forEach((t, i) => {
    const ini = Math.floor(t._pos * prop), fin = todos[i + 1] ? Math.floor(todos[i + 1]._pos * prop) : cuerpo.length
    t.parrafos = parrafos(cuerpo.slice(ini, fin)).slice(0, 400)
  })
  for (const [id, ar] of Object.entries(areas)) {
    // en Matemática el símbolo π salió como 'ð' (fuente Symbol del PDF)
    const temas = ar.temas.map(({ _pos, ...t }) => ({ ...t, parrafos: (t.parrafos || []).map((p) => (id === 'mat' ? p.replace(/ð/g, 'π') : p)) }))
    const conTexto = temas.filter((t) => t.parrafos.length).length
    writeFileSync(resolve(sal, `${id}.json`), JSON.stringify({ id, nombre: ar.nombre, fuente: 'Texto de aprendizaje 2025 (texto general), 2.º año de escolaridad, Ministerio de Educación de Bolivia.', completo: false, aviso: conTexto ? `Del texto general solo se pudo extraer una parte: ${conTexto} de ${temas.length} unidades tienen texto; las demás figuran solo en el índice.` : 'De esta área solo tenemos el índice: el texto completo todavía no se pudo extraer.', temas }))
    resumen.push({ id, nombre: ar.nombre, completo: false, temas: temas.map(({ id, titulo, trimestre, subtemas, parrafos }) => ({ id, titulo, trimestre, subtemas, conTexto: parrafos.length > 0 })) })
    console.log(id, temas.length, 'unidades', conTexto, 'con texto')
  }
}
const orden = ['len', 'mat', 'bio', 'csoc', 'ing', 'fil', 'art', 'mus', 'val']
resumen.sort((a, b) => orden.indexOf(a.id) - orden.indexOf(b.id))
writeFileSync(resolve(sal, 'indice.json'), JSON.stringify({ curso: '2do_secundaria', areas: resumen }))
console.log('listo:', sal)
await import('./copiar-textos-tutor.mjs')
