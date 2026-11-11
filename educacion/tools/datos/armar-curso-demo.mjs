// ══════════════════════════════════════════════════
//  Arma los dos archivos del curso demo del mapa (EDU.04f) desde curso-demo.json:
//   - educacion/maqueta/curso-demo.js            → la pantalla (con nombres ficticios)
//   - services/ai-gateway/tutor/curso-demo.json  → el servidor y la IA (SIN nombres ni avatares)
//  Uso: node tools/datos/armar-curso-demo.mjs
// ══════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const edu = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')
const fuente = JSON.parse(readFileSync(resolve(edu, 'tools/datos/curso-demo.json'), 'utf8'))
writeFileSync(resolve(edu, 'maqueta/curso-demo.js'), `// GENERADO por tools/datos/armar-curso-demo.mjs (no editar a mano). Alumnos FICTICIOS.\nwindow.CURSO_DEMO = ${JSON.stringify(fuente, null, 1)};\n`)
const servidor = {
  _nota: 'GENERADO por tools/datos/armar-curso-demo.mjs. Curso demo SIN nombres: solo IDs opacos y rasgos pedagógicos.',
  cursos: { [fuente.curso]: fuente.alumnos.map(({ nombre, avatar, ...resto }) => resto) },
}
writeFileSync(resolve(edu, 'services/ai-gateway/tutor/curso-demo.json'), JSON.stringify(servidor, null, 1) + '\n')
console.log(`${fuente.alumnos.length} alumnos → maqueta/curso-demo.js y tutor/curso-demo.json`)
