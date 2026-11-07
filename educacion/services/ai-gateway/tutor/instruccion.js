// ══════════════════════════════════════════════════
//  Arma la instrucción de sistema de Kay.
//
//  PRIVACIDAD (requisito 4.3 de la visión): al modelo solo llegan el curso, el
//  estilo de aprendizaje y el contenido/agenda del curso. Nunca nombre, RUDE,
//  teléfono, ubicación ni el ID del alumno. Esta función recibe un perfil y copia
//  SOLO los campos permitidos: aunque el perfil traiga otros datos, no pasan.
// ══════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const PERSONALIDAD = fs
  .readFileSync(path.join(__dirname, 'personalidad-kay.md'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '')
  .trim();

const ESTILOS = {
  visual: 'Aprende mejor con imágenes: usá analogías visuales y describí dibujos mentales.',
  auditivo: 'Aprende mejor escuchando: usá ritmo, rimas cortas y repetí lo clave con otras palabras.',
  relacional: 'Aprende mejor conectando: relacioná el tema con su día a día y con otras materias.',
};

const CURSO_VALIDO = /^[0-9]{1,2}(ro|do|to|vo|no|mo)_(primaria|secundaria)$/;

function cursoLegible(curso) {
  if (!CURSO_VALIDO.test(curso || '')) return 'primaria (curso no especificado)';
  return curso.replace('_', ' de ');
}

// Recorta texto de contenido para no inflar el contexto (cada token de contexto se
// vuelve a cobrar en cada turno de la charla).
function recortar(texto, max) {
  const t = String(texto || '').trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

/**
 * @param {object} perfil  { curso, estilo } — cualquier otro campo se ignora.
 * @param {object} contenido { pensum: [{materia, titulo, texto}], agenda: [{tipo, titulo, fecha, descripcion}] }
 * @returns {string}
 */
function construirInstruccion(perfil = {}, contenido = {}) {
  const curso = cursoLegible(perfil.curso);
  const estilo = ESTILOS[perfil.estilo] || '';

  const pensum = (contenido.pensum || [])
    .slice(0, 6)
    .map((p) => `- [${recortar(p.materia, 30).toUpperCase()}] ${recortar(p.titulo, 80)}: ${recortar(p.texto, 600)}`)
    .join('\n');

  const agenda = (contenido.agenda || [])
    .slice(0, 6)
    .map((a) => `- ${a.tipo === 'examen' ? 'Examen' : 'Tarea'} "${recortar(a.titulo, 80)}" para el ${recortar(a.fecha, 10)}: ${recortar(a.descripcion, 200)}`)
    .join('\n');

  return `${PERSONALIDAD}

# Con quién estás hablando

- Un alumno o alumna de ${curso}.${estilo ? `\n- ${estilo}` : ''}
- No sabés su nombre y no hace falta: tratalo con cariño sin nombrarlo.

# Lo que está viendo en clase (usalo como base cuando venga al caso)

${pensum || '- Todavía no hay contenido cargado por su profe. Ayudalo con lo que corresponde a su curso en el currículo boliviano.'}

# Tareas y exámenes que vienen

${agenda || '- No hay tareas registradas.'}`;
}

const HERRAMIENTAS = [
  {
    name: 'terminar_conversacion',
    description:
      'OBLIGATORIO: llamar SIEMPRE que el alumno se despida ("chau", "nos vemos", "ya terminé", "listo gracias"). Es la única forma correcta de cerrar la charla.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
];

module.exports = { construirInstruccion, HERRAMIENTAS, PERSONALIDAD };
