// ══════════════════════════════════════════════════
//  Los dos profes de voz (EDU.02b): "la profe" y "el profe".
//
//  Arma la instrucción de sistema de cada uno con:
//   - profes/comun.md (lo común) + profes/<el suyo>.md (su estilo)
//   - el curso (sin nombre), la misión en la que está (buscada en el catálogo del
//     servidor por ID: el navegador no manda texto) y la memoria compartida
//     (solo datos pedagógicos: misión, paso, peldaño; nunca nombre ni ID).
// ══════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const { profes: PROFES } = require('./profes.json');
const MISIONES_DEMO = require('./misiones-demo');
const { textoClasesParaTutor } = require('./clase');
const IA = require('./nombres-ia');

const leer = (archivo) =>
  fs.readFileSync(path.join(__dirname, 'profes', archivo), 'utf8').replace(/<!--[\s\S]*?-->/g, '').trim();

const COMUN = leer('comun.md');
const PERSONALIDADES = Object.fromEntries(PROFES.map((p) => [p.id, leer(p.archivo)]));

const profePorId = (id) => PROFES.find((p) => p.id === id) || null;
const otroProfe = (id) => PROFES.find((p) => p.id !== id);

/** Lo que el navegador puede saber de los profes (sin instrucciones). Nombres: EDU.16b (configurables). */
function profesPublicos(ia) {
  const n = IA.nombresIA(ia);
  return PROFES.map(({ id, color }) => ({ id, nombre: IA.nombreDe(id, n), titulo: IA.tituloDe(id, n), color }));
}

const entero = (v, min, max) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};

/**
 * Valida el estado de la misión que manda el navegador. Solo IDs y números:
 * cualquier texto se descarta. Devuelve null si no hay misión válida.
 */
function validarMision(m) {
  if (!m || typeof m !== 'object') return null;
  const id = String(m.id || '');
  if (!Object.prototype.hasOwnProperty.call(MISIONES_DEMO.MISIONES, id)) return null;
  const c = MISIONES_DEMO.contenido(id);
  const fase = m.fase === 'repaso' ? 'repaso' : 'pasos';
  const lista = fase === 'repaso' ? c.repaso : c.pasos;
  return {
    id,
    materia: MISIONES_DEMO.MISIONES[id].materia,
    fase,
    paso: entero(m.paso, 0, lista.length - 1),
    peldano: entero(m.peldano, 0, 3),
    completa: m.completa === true,
  };
}

const LETRAS = ['A', 'B', 'C', 'D'];
const NOMBRE_PELDANO = ['Pregunta', 'Pista', 'Ejemplo resuelto'];

function textoPaso(p, n, total) {
  const ops = p.ops.map((o, i) => `${LETRAS[i]}) ${o}`).join(' · ');
  const errores = Object.entries(p.mal || {})
    .map(([i, t]) => `  - Si elige ${LETRAS[i]}: ${t}`)
    .join('\n');
  const escalera = (p.escalera || [])
    .map((t, i) => `  ${i + 1}. ${NOMBRE_PELDANO[i]}: ${t.replace(/^Ejemplo( resuelto)?: /, '')}`)
    .join('\n');
  return [
    `Paso ${n} de ${total}: "${p.q}"`,
    `Opciones: ${ops}. La correcta es ${LETRAS[p.ok]} — **nunca la digas**.`,
    errores && `Errores típicos:\n${errores}`,
    escalera && `Escalera de ayuda (de a un peldaño, en orden):\n${escalera}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function textoMision(m) {
  if (!m) return '';
  const info = MISIONES_DEMO.MISIONES[m.id];
  const c = MISIONES_DEMO.contenido(m.id);
  const materia = MISIONES_DEMO.MATERIAS[info.materia];
  let ahora;
  if (m.completa) ahora = 'Acaba de **terminar** la misión.';
  else if (m.fase === 'repaso') {
    const r = c.repaso[m.paso];
    ahora = `Está en el **repaso** (pregunta ${m.paso + 1} de ${c.repaso.length}): "${r.q}" (correcta: ${r.ops[r.ok]}, no la digas). Si pide ayuda, dale una pregunta-pista.`;
  } else ahora = `Está en el **paso ${m.paso + 1}**. En pantalla ya vio ${m.peldano} peldaño(s) de la escalera.`;
  return `# La misión que está haciendo ahora

Materia: ${materia}. Misión: "${info.titulo}".
${c.pasos.map((p, i) => textoPaso(p, i + 1, c.pasos.length)).join('\n\n')}

${ahora}`;
}

function textoMemoria(memoria, n) {
  const u = memoria?.ultima;
  if (!u || !MISIONES_DEMO.MISIONES[u.misionId]) return '';
  const info = MISIONES_DEMO.MISIONES[u.misionId];
  const quien = profePorId(u.profe) ? IA.tituloDe(u.profe, n) : 'un profe';
  const como = u.completa
    ? 'y la terminó'
    : `y llegó al paso ${(u.paso || 0) + 1}${u.peldanoMax ? `, usando hasta el peldaño ${u.peldanoMax} de la escalera` : ''}`;
  return `# Memoria compartida (la ven los dos profes)

- La última vez (${u.fecha || 'hace poco'}) trabajó con ${quien} en "${info.titulo}" ${como}.`;
}

/**
 * @param {string} profeId 'la_profe' | 'el_profe'
 * @param {object} perfil { curso } — cualquier otro campo se ignora
 * @param {{mision?: object, memoria?: object, clases?: object[], relevo?: boolean, cursoLegible: (c:string)=>string}} extra
 *   `clases`: contexto del día de las últimas clases grabadas del curso (EDU.04a, sin nombres)
 *   `ia`: (EDU.16b) { varon, mujer } nombres de los profes IA (validados; por defecto los de la demo)
 *   `tutor`: (EDU.16) bloque "tutor 24/7" con su vida escolar (tareas, horario, avisos, texto); si viene,
 *            reemplaza al de las clases (ya las incluye)
 */
function construirInstruccionProfe(profeId, perfil = {}, extra = {}) {
  const yo = profePorId(profeId);
  if (!yo) throw new Error(`Profe desconocido: ${profeId}`);
  const otro = otroProfe(profeId);
  const n = IA.nombresIA(extra.ia);
  const yoTitulo = IA.tituloDe(yo.id, n);
  const otroTitulo = IA.tituloDe(otro.id, n);
  const comun = COMUN.replaceAll('{{YO}}', yoTitulo).replaceAll('{{OTRO}}', otroTitulo);
  const propia = PERSONALIDADES[profeId].replaceAll('{{NOMBRE}}', IA.nombreDe(yo.id, n));
  const curso = extra.cursoLegible ? extra.cursoLegible(perfil.curso) : 'primaria';

  const relevo = extra.relevo
    ? `# Relevo

El alumno te acaba de llamar: venía con ${otroTitulo} en esta misma charla. Saludá en UNA frase
("¡Acá ${yoTitulo}! Seguimoj, ¿ya?") y seguí desde donde estaban. No te presentes largo.`
    : '';

  return [
    propia,
    comun,
    `# Con quién estás hablando

- Un alumno o alumna de ${curso}. No sabés su nombre y no hace falta: tratalo con cariño sin nombrarlo.`,
    textoMemoria(extra.memoria, n),
    extra.tutor || textoClasesParaTutor(extra.clases),
    textoMision(extra.mision),
    relevo,
  ]
    .filter(Boolean)
    .join('\n\n');
}

const HERRAMIENTAS_PROFES = [
  {
    name: 'terminar_conversacion',
    description:
      'OBLIGATORIO: llamar SIEMPRE que el alumno se despida ("chau", "nos vemos", "ya terminé", "listo gracias"). Es la única forma correcta de cerrar la charla.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'llamar_profe',
    description:
      'Pasa la charla al otro profe cuando el alumno lo pide ("quiero hacerlo con la profe", "llamá al profe", o lo nombra). Antes decí una frase corta de despedida.',
    parametersJsonSchema: {
      type: 'object',
      properties: { profe: { type: 'string', enum: PROFES.map((p) => p.id), description: 'El profe al que quiere llamar.' } },
      required: ['profe'],
    },
  },
  {
    name: 'mostrar_pista',
    description:
      'Muestra en la pantalla el peldaño de la escalera que le acabás de dar al alumno (1 = pregunta, 2 = pista, 3 = ejemplo resuelto). Llamala cada vez que des un peldaño de la misión.',
    parametersJsonSchema: {
      type: 'object',
      properties: { peldano: { type: 'integer', minimum: 1, maximum: 3 } },
      required: ['peldano'],
    },
  },
];

module.exports = {
  PROFES,
  COMUN,
  PERSONALIDADES,
  profePorId,
  profesPublicos,
  validarMision,
  construirInstruccionProfe,
  HERRAMIENTAS_PROFES,
};
