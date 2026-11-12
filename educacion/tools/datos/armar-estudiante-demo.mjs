// ══════════════════════════════════════════════════
//  Alumno demo de 2.º de secundaria (EDU.15 → EDU.17 y EDU.16).
//  Fuente: tools/datos/estudiante-demo.json. Salidas:
//   - maqueta/estudiante-demo.js  → window.ESTUDIANTE_DEMO (las fechas se calculan al abrir, días hábiles)
//   - services/ai-gateway/tutor/estudiante-demo.json → copia para el tutor 24/7 (sin apodo ni avatar)
//  Uso: node tools/datos/armar-estudiante-demo.mjs
// ══════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const edu = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')
const { _nota, ...d } = JSON.parse(readFileSync(resolve(edu, 'tools/datos/estudiante-demo.json'), 'utf8'))

const js = `// GENERADO por tools/datos/armar-estudiante-demo.mjs desde tools/datos/estudiante-demo.json. No editar a mano.
// Alumno demo FICTICIO de 2.º de secundaria (EDU.15). Las fechas se calculan al abrir (días hábiles desde hoy).
(function () {
  const D = ${JSON.stringify(d, null, 1)};
  const hoy = new Date(Date.now() - 4 * 3600e3); // hora de Bolivia
  const habil = (n) => { const x = new Date(hoy); let k = Math.abs(n); const p = n >= 0 ? 1 : -1; while (k > 0) { x.setUTCDate(x.getUTCDate() + p); if (x.getUTCDay() % 6) k--; } return x.toISOString().slice(0, 10); };
  const conFecha = (xs) => xs.map(({ dias, ...r }) => ({ fecha: habil(dias), ...r }));
  window.ESTUDIANTE_DEMO = {
    apodo: D.apodo, avatar: D.avatar, curso: D.curso, cursoNombre: D.cursoNombre, materias: D.materias,
    horario: D.horario,
    avisos: conFecha(D.avisos),
    eventos: conFecha(D.eventos),
    llevar: conFecha(D.llevar),
  };
})();
`
writeFileSync(resolve(edu, 'maqueta/estudiante-demo.js'), js)
const { apodo, avatar, ...servidor } = d
writeFileSync(resolve(edu, 'services/ai-gateway/tutor/estudiante-demo.json'), JSON.stringify({ _nota: 'GENERADO por tools/datos/armar-estudiante-demo.mjs (sin apodo ni avatar). Fechas en días hábiles desde hoy.', ...servidor }, null, 1) + '\n')
console.log('✅ maqueta/estudiante-demo.js y tutor/estudiante-demo.json')
