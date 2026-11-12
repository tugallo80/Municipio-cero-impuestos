// ══════════════════════════════════════════════════
//  Demo (EDU.15): arma TODO desde la fuente única tools/datos/demo-piloto.json
//  (curso real del profe del piloto + alumnos ficticios con apodos).
//   - maqueta/demo-piloto.js        → window.DEMO_PILOTO (colegio, curso, gestión, profe, temas de hoy)
//   - maqueta/curso-demo.js         → window.CURSO_DEMO (mapa del curso, con apodos)
//   - maqueta/estudiante-demo.js    → window.ESTUDIANTE_DEMO (app del alumno, EDU.17; fechas al abrir)
//   - services/ai-gateway/tutor/curso-demo.json      → servidor e IA (SIN apodos ni avatares)
//   - services/ai-gateway/tutor/estudiante-demo.json → tutor 24/7 (EDU.16; sin apodo ni avatar)
//  El seed (tools/seed/datos-demo.js) lee demo-piloto.json directo.
//  Uso: node tools/datos/armar-demo.mjs
// ══════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'

const edu = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')
const D = JSON.parse(readFileSync(resolve(edu, 'tools/datos/demo-piloto.json'), 'utf8'))
const escribir = (ruta, txt) => writeFileSync(resolve(edu, ruta), txt)
const CAB = '// GENERADO por tools/datos/armar-demo.mjs desde tools/datos/demo-piloto.json. No editar a mano.\n'

const piloto = {
  colegio: D.colegio, curso: D.curso, gestion: D.gestion, trimestre: D.trimestre, profe: D.profe,
  materiasProfe: D.materiasProfe,
  temasHoy: Object.fromEntries(Object.entries(D.temasHoy).map(([k, { texto, ...t }]) => [k, t])),
}
escribir('maqueta/demo-piloto.js', `${CAB}// Curso REAL del profe del piloto; alumnos ficticios. El nombre REAL del profe NO va acá:
// llega por el link y queda en el equipo (localStorage 'nande-profe'; 'nande-profe-apodo' = cómo lo llaman sus alumnos).
window.DEMO_PILOTO = ${JSON.stringify(piloto, null, 1)};
// Las pantallas de la maqueta (selector, profe, padres, dirección) muestran el colegio del piloto.
(function () {
  const P = window.DEMO_PILOTO, D = window.DEMO;
  if (!D || !D.colegio) return;
  let profe = ''; try { profe = localStorage.getItem('nande-profe') || ''; } catch {}
  const hoy = new Date(Date.now() - 4 * 3600e3).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  D.colegio.nombre = P.colegio.nombre;
  D.colegio.nota = P.curso.nombre + ' · curso del piloto (alumnos ficticios)';
  D.colegio.gestion = P.gestion;
  D.colegio.trimestre = P.trimestre;
  D.colegio.hoy = hoy.charAt(0).toUpperCase() + hoy.slice(1);
  if (D.tutor) D.tutor.nombre = profe || P.profe.nombre;
})();
`)

const curso = { curso: D.curso.id, maqueta: D.curso.nombre, colegio: D.colegio.nombre, temaMapa: D.temaMapa, alumnos: D.alumnos }
escribir('maqueta/curso-demo.js', `${CAB}// Alumnos FICTICIOS (apodos).\nwindow.CURSO_DEMO = ${JSON.stringify(curso, null, 1)};\n`)
escribir('services/ai-gateway/tutor/curso-demo.json', JSON.stringify({
  _nota: 'GENERADO por tools/datos/armar-demo.mjs. Curso demo SIN apodos: solo IDs opacos y rasgos pedagógicos.',
  cursos: { [D.curso.id]: D.alumnos.map(({ nombre, avatar, ...resto }) => resto) },
}, null, 1) + '\n')

const E = D.estudiante
const yo = D.alumnos.find((a) => a.id === E.alumnoId)
// Las mismas 2 tareas que carga el seed, en el formato común de EDU.06d (con 'dias' para fechar al abrir).
const require = createRequire(import.meta.url)
const T = require('../../services/ai-gateway/tutor/tareas.js')
const { tareasDemo } = require('../seed/datos-demo.js')
const hoy = new Date(Date.now() - 4 * 3600e3).toISOString().slice(0, 10)
const habilesHasta = (f) => { let n = 0; const d = new Date(hoy + 'T12:00:00Z'); while (d.toISOString().slice(0, 10) < f) { d.setUTCDate(d.getUTCDate() + 1); if (d.getUTCDay() % 6) n++; } return n }
const tareas = tareasDemo().map((t) => { const { entrega, enviada, ...x } = T.tareaParaAlumno(t.id, t, t.asignacion?.alu_demo01 || 'base'); return { ...x, dias: habilesHasta(entrega), estado: 'pendiente', hecha: false } })
const est = { curso: D.curso.id, cursoNombre: D.curso.nombre, colegio: D.colegio.nombre, gestion: D.gestion, distrito: D.distrito, recreo: E.recreo, materias: E.materias, horario: E.horario, avisos: E.avisos, eventos: E.eventos, llevar: E.llevar, tareas, temasHoy: piloto.temasHoy }
escribir('maqueta/estudiante-demo.js', `${CAB}// Alumno demo FICTICIO. Las fechas se calculan al abrir (días hábiles desde hoy, hora de Bolivia).
(function () {
  const D = ${JSON.stringify({ apodo: yo.nombre, avatar: yo.avatar, ...est }, null, 1)};
  const hoy = new Date(Date.now() - 4 * 3600e3);
  const habil = (n) => { const x = new Date(hoy); let k = Math.abs(n); const p = n >= 0 ? 1 : -1; while (k > 0) { x.setUTCDate(x.getUTCDate() + p); if (x.getUTCDay() % 6) k--; } return x.toISOString().slice(0, 10); };
  const conFecha = (xs) => xs.map(({ dias, ...r }) => ({ fecha: habil(dias), ...r }));
  const tareas = D.tareas.map(({ dias, ...t }) => ({ ...t, entrega: habil(dias) }));
  window.ESTUDIANTE_DEMO = { ...D, avisos: conFecha(D.avisos), eventos: conFecha(D.eventos), llevar: conFecha(D.llevar), tareas };
})();
`)
escribir('services/ai-gateway/tutor/estudiante-demo.json', JSON.stringify({ _nota: 'GENERADO por tools/datos/armar-demo.mjs (sin apodo ni avatar). Fechas en días hábiles desde hoy.', ...est, temasHoy: D.temasHoy }, null, 1) + '\n')
console.log(`✅ Demo de ${D.colegio.nombre} · ${D.curso.nombre} · ${D.alumnos.length} alumnos ficticios → maqueta/{demo-piloto,curso-demo,estudiante-demo}.js y tutor/{curso-demo,estudiante-demo}.json`)
