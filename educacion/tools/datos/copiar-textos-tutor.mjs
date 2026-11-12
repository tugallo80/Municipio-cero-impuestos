// ══════════════════════════════════════════════════
//  EDU.16 — Copia los textos oficiales del lector (maqueta/textos/*.json) al servidor del tutor
//  (services/ai-gateway/tutor/textos/), que se publica con las Functions. El tutor recupera de acá
//  UN tema y un pedazo (≤ 3.000 caracteres) por pregunta: nunca manda el libro entero a la IA.
//  Lo llama armar-textos.mjs al final; también se puede correr solo:
//    node tools/datos/copiar-textos-tutor.mjs
// ══════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const edu = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')
const de = resolve(edu, 'maqueta/textos')
const a = resolve(edu, 'services/ai-gateway/tutor/textos')
mkdirSync(a, { recursive: true })
let n = 0
for (const f of readdirSync(de).filter((x) => x.endsWith('.json') && x !== 'indice.json')) {
  const d = JSON.parse(readFileSync(resolve(de, f), 'utf8'))
  const temas = (d.temas || []).map(({ id, titulo, trimestre, pagina, subtemas, parrafos }) => ({ id, titulo, trimestre, pagina: pagina || null, subtemas: subtemas || [], parrafos: parrafos || [] }))
  writeFileSync(resolve(a, f), JSON.stringify({ id: d.id, nombre: d.nombre, temas }))
  n++
}
console.log(`✅ ${n} textos copiados al servidor del tutor (${a})`)
