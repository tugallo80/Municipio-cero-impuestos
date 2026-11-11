// ══════════════════════════════════════════════════
//  Tareas sugeridas y mapa del curso (EDU.04f) — lógica pura, sin red ni base.
//
//  Tareas: la mentora propone 2–3 tareas desde lo que pasó en la clase (o un tema del
//  cronograma). El profe edita y envía. Formato común con EDU.06d (modo directo del alumno):
//  ver docs/sesiones/EDU.04f-tareas-y-mapa.md.
//
//  Mapa: la IA propone una agrupación del curso. A la IA solo le llegan IDs opacos (A01…) y
//  rasgos pedagógicos del curso demo del servidor (tutor/curso-demo.json): nunca nombres.
// ══════════════════════════════════════════════════
const { AREA_IDS, AREAS, cursoLegible } = require('./plan');
const CURSO_DEMO = require('./curso-demo.json');

const TIPOS = ['practica', 'lectura', 'investigacion', 'proyecto', 'mision'];
const VARIANTES = ['apoyo', 'base', 'desafio'];
// Cómo entrega el alumno (EDU.06d). Por defecto según el tipo.
const COMO = ['texto', 'foto', 'opciones', 'nada'];
const COMO_POR_TIPO = { practica: 'texto', lectura: 'nada', investigacion: 'texto', proyecto: 'foto', mision: 'opciones' };
const PUNTOS = { ser: 10, saber: 45, hacer: 40, autoevaluacion: 5 };
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const CURSO_VALIDO = /^[0-9]{1,2}(ro|do|to|vo|no|mo)_(primaria|secundaria)$/;

const texto = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const lista = (v, max, largo) => (Array.isArray(v) ? v : []).map((x) => texto(x, largo)).filter(Boolean).slice(0, max);

// ── Tareas ─────────────────────────────────────────
function instruccionTareas() {
  return `Sos la mentora pedagógica de ÑANDÉ (escuelas de Santa Cruz, Bolivia). A partir de lo que pasó
en una clase real (o de un tema del cronograma), proponés 2 o 3 TAREAS para el curso. El profe las
revisa, las edita y decide si las manda: vos proponés, el profe decide.

Cada tarea:
- Ligada a lo que se vio o a lo que quedó pendiente. Nada fuera del tema.
- Consigna para el alumno, en voseo, clara y corta (máx. 4 frases). Sin nombres de alumnos.
- Hecha con lo que hay en casa o en la comunidad (cuaderno, objetos de la casa, el patio, la feria);
  nada que haya que comprar ni que necesite internet.
- Tipo: practica, lectura, investigacion, proyecto o mision.
- Días hasta la entrega (1 a 7) según el trabajo.
- Criterios RM 0001/2026 en una frase cada uno: Ser (10), Saber (45), Hacer (40), Autoevaluación (5).
- Una pregunta de autoevaluación para el chico (caritas o semáforo).
- Cómo entrega el chico: "texto" (escribe la respuesta), "foto" (de su trabajo; por ahora se anota
  que la hizo), "nada" (solo marca que la hizo).
- Una escalera de 3 ayudas que NO dan la respuesta: pregunta guía, pista, ejemplo resuelto con OTROS datos.
- Tres variantes por nivel, en tono positivo: "apoyo" (con un ejemplo o pista, más corta), "base" y
  "desafio" (un paso más). Nunca etiquetes a nadie ("los flojos", "los que no saben").`;
}

const ESQUEMA_TAREAS = {
  type: 'object',
  properties: {
    tareas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          consigna: { type: 'string' },
          tipo: { type: 'string', enum: TIPOS },
          dias: { type: 'integer', minimum: 1, maximum: 7 },
          criterios: {
            type: 'object',
            properties: { ser: { type: 'string' }, saber: { type: 'string' }, hacer: { type: 'string' }, autoevaluacion: { type: 'string' } },
            required: ['ser', 'saber', 'hacer', 'autoevaluacion'],
          },
          autoevaluacion: { type: 'string', description: 'pregunta para que el chico se autoevalúe' },
          como: { type: 'string', enum: ['texto', 'foto', 'nada'] },
          pistas: { type: 'array', items: { type: 'string' }, description: 'pregunta guía, pista, ejemplo resuelto con otros datos' },
          variantes: {
            type: 'object',
            properties: { apoyo: { type: 'string' }, base: { type: 'string' }, desafio: { type: 'string' } },
            required: ['apoyo', 'base', 'desafio'],
          },
        },
        required: ['titulo', 'consigna', 'tipo', 'dias', 'criterios', 'autoevaluacion', 'variantes'],
      },
    },
  },
  required: ['tareas'],
};

/** Lo que manda el navegador para pedir sugerencias: textos del propio profe, recortados. */
function validarPedidoTareas(d = {}) {
  const curso = String(d.curso || '');
  if (!CURSO_VALIDO.test(curso)) return { ok: false, error: 'Curso inválido.' };
  const materia = AREA_IDS.includes(d.materia) ? d.materia : null;
  const tema = texto(d.tema, 160);
  if (!tema) return { ok: false, error: 'Falta el tema.' };
  return {
    ok: true,
    curso,
    materia,
    tema,
    origen: d.origen === 'clase' ? 'clase' : 'cronograma',
    claseId: /^[-_A-Za-z0-9]{10,40}$/.test(d.claseId || '') ? d.claseId : null,
    vistos: lista(d.vistos, 8, 200),
    pendiente: lista(d.pendiente, 6, 200),
    tareasDichas: lista(d.tareasDichas, 4, 240),
    contenidos: lista(d.contenidos, 8, 160),
    hoy: FECHA.test(d.hoy || '') ? d.hoy : null,
  };
}

function pedidoTareas(p) {
  const area = AREAS.find((a) => a.id === p.materia);
  const linea = (t, xs) => (xs.length ? `${t}:\n${xs.map((x) => `- ${x}`).join('\n')}\n` : '');
  return `Curso: ${cursoLegible(p.curso)}.${area ? ` Área: ${area.nombre}.` : ''}
Tema: "${p.tema}" (${p.origen === 'clase' ? 'de una clase grabada' : 'del cronograma'}).
${linea('Lo que se vio en la clase', p.vistos)}${linea('Lo que quedó pendiente', p.pendiente)}${linea('Tareas que el profe ya dijo en clase (no las repitas; podés completarlas)', p.tareasDichas)}${linea('Contenidos del tema', p.contenidos)}
Proponé 2 o 3 tareas.`;
}

const sumarDias = (f, n) => {
  const d = new Date(`${f}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
// Si la entrega cae sábado o domingo, pasa al lunes.
function diaHabil(f) {
  const dia = new Date(`${f}T12:00:00Z`).getUTCDay();
  return dia === 6 ? sumarDias(f, 2) : dia === 0 ? sumarDias(f, 1) : f;
}

/** Normaliza una tarea (de la IA o editada por el profe). */
function normalizarTarea(t, { curso, materia, hoy, origen, tema }) {
  const x = t && typeof t === 'object' ? t : {};
  const c = x.criterios || {};
  const v = x.variantes || {};
  const dias = Math.min(14, Math.max(1, Math.floor(Number(x.dias) || 3)));
  const entrega = FECHA.test(x.entrega || '') ? x.entrega : diaHabil(sumarDias(hoy, dias));
  const consigna = texto(x.consigna, 600);
  return {
    curso,
    materia: AREA_IDS.includes(x.materia) ? x.materia : materia || 'mat',
    titulo: texto(x.titulo, 80) || 'Tarea',
    consigna,
    tipo: TIPOS.includes(x.tipo) ? x.tipo : 'practica',
    entrega,
    criterios: { ser: texto(c.ser, 200), saber: texto(c.saber, 200), hacer: texto(c.hacer, 200), autoevaluacion: texto(c.autoevaluacion, 200) },
    puntos: { ...PUNTOS },
    autoevaluacion: texto(x.autoevaluacion, 200),
    como: COMO.includes(x.como) ? x.como : COMO_POR_TIPO[TIPOS.includes(x.tipo) ? x.tipo : 'practica'],
    pistas: lista(x.pistas, 3, 300),
    variantes: { apoyo: texto(v.apoyo, 600) || consigna, base: texto(v.base, 600) || consigna, desafio: texto(v.desafio, 600) || consigna },
    origen: { tipo: origen === 'clase' ? 'clase' : 'cronograma', tema: texto(tema, 160) },
  };
}

/**
 * Qué variante le toca a cada alumno. En la demo sale del avance del curso demo del servidor;
 * en el piloto vendrá del perfil real (EDU.03). El profe puede cambiarla al enviar.
 */
function varianteSugerida(alumno) {
  const a = Number(alumno?.avance) || 70;
  return a < 65 ? 'apoyo' : a >= 85 ? 'desafio' : 'base';
}

/** La tarea como la ve el alumno (formato común con EDU.06d). */
function tareaParaAlumno(id, t, variante) {
  const v = VARIANTES.includes(variante) ? variante : 'base';
  return {
    id,
    curso: t.curso,
    materia: t.materia,
    titulo: t.titulo,
    consigna: t.consigna,
    tipo: t.tipo,
    entrega: t.entrega,
    variante: v,
    textoVariante: t.variantes?.[v] || t.consigna,
    criterios: t.criterios,
    puntos: t.puntos || { ...PUNTOS },
    autoevaluacion: t.autoevaluacion || '',
    como: COMO.includes(t.como) ? t.como : COMO_POR_TIPO[t.tipo] || 'texto',
    pistas: Array.isArray(t.pistas) ? t.pistas : [],
    origen: t.origen || { tipo: 'cronograma', tema: '' },
    enviada: t.enviada || 0,
  };
}

// ── Mapa del curso ─────────────────────────────────
const OBJETIVOS = {
  parejas: 'Armá PAREJAS que se complementen (alguien que ya domina un tema con alguien que lo está practicando, o intereses parecidos), para trabajar el tema indicado.',
  niveles: 'Armá GRUPOS POR NIVEL (3 o 4 grupos) para trabajar el tema indicado con la variante que le corresponde a cada grupo (apoyo, base, desafío).',
  atencion: 'Señalá a QUIÉNES conviene acompañar más de cerca ESTA SEMANA (como mucho 4) y por qué, en tono de cuidado, y sentá cerca del profe a esos alumnos. El resto, en grupos mezclados.',
};

function instruccionMapa() {
  return `Sos la mentora pedagógica de ÑANDÉ. Ayudás a un profe de primaria a organizar su aula.
Recibís a los alumnos SOLO con un código (A01, A02…) y rasgos pedagógicos. No sabés sus nombres y no
los inventes. Proponés una disposición del aula según el objetivo que pide el profe.

Reglas:
- Tono positivo y de cuidado. Nunca etiquetes negativamente ("flojo", "problemático", "lento").
  Hablá de lo que cada uno está practicando y de lo que aporta.
- Cada grupo con un nombre amable (ej. "Mesa del mercado", "Equipo tajibo") y un "porque" de una o dos
  frases que el profe entienda rápido.
- Usá a TODOS los alumnos exactamente una vez en los grupos.
- Las mesas son lugares en un plano de 4 columnas por 3 filas (fila 1 = adelante, cerca del pizarrón).
  Ubicá cada grupo en una mesa distinta (columna 1–4, fila 1–3).
- Es una propuesta: el profe decide.`;
}

const ESQUEMA_MAPA = {
  type: 'object',
  properties: {
    resumen: { type: 'string', description: 'una o dos frases para el profe' },
    grupos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          alumnos: { type: 'array', items: { type: 'string' } },
          porque: { type: 'string' },
          columna: { type: 'integer', minimum: 1, maximum: 4 },
          fila: { type: 'integer', minimum: 1, maximum: 3 },
          variante: { type: 'string', enum: VARIANTES },
        },
        required: ['nombre', 'alumnos', 'porque', 'columna', 'fila'],
      },
    },
    atencion: {
      type: 'array',
      items: { type: 'object', properties: { alumno: { type: 'string' }, porque: { type: 'string' } }, required: ['alumno', 'porque'] },
    },
  },
  required: ['resumen', 'grupos', 'atencion'],
};

const alumnosDemo = (curso) => CURSO_DEMO.cursos[curso] || [];

/** Lo que va a la IA: solo ID y rasgos (sin nombre, avatar ni nada que identifique). */
function rasgosParaIA(curso) {
  return alumnosDemo(curso).map((a) => ({
    id: a.id,
    avance: a.avance,
    tendencia: a.tendencia,
    aprende: a.aprende,
    ritmo: a.ritmo,
    fortalezas: a.fortalezas,
    practicando: a.practicando,
    intereses: a.intereses,
    temas: a.temas,
    nota_mentora: a.mentora,
    acompanar: a.atencion || '',
  }));
}

function pedidoMapa(curso, objetivo, tema) {
  return `Curso: ${cursoLegible(curso)}. Objetivo del profe: ${OBJETIVOS[objetivo] || OBJETIVOS.parejas}
${tema ? `Tema a trabajar: "${tema}".\n` : ''}Alumnos (JSON):
${JSON.stringify(rasgosParaIA(curso))}`;
}

/** Limpia la propuesta: solo IDs del curso, cada alumno una sola vez; los que falten van a un grupo más. */
function normalizarMapa(crudo, curso) {
  const ids = alumnosDemo(curso).map((a) => a.id);
  const usados = new Set();
  const r = crudo && typeof crudo === 'object' ? crudo : {};
  const ocupadas = new Set();
  const lugar = (c, f) => {
    let col = Math.min(4, Math.max(1, Number(c) || 1));
    let fil = Math.min(3, Math.max(1, Number(f) || 1));
    for (let i = 0; i < 12 && ocupadas.has(`${col}-${fil}`); i++) {
      col = (col % 4) + 1;
      if (col === 1) fil = (fil % 3) + 1;
    }
    ocupadas.add(`${col}-${fil}`);
    return { columna: col, fila: fil };
  };
  const grupos = [];
  for (const g of (Array.isArray(r.grupos) ? r.grupos : []).slice(0, 12)) {
    const alumnos = (Array.isArray(g?.alumnos) ? g.alumnos : []).map(String).filter((id) => ids.includes(id) && !usados.has(id));
    alumnos.forEach((id) => usados.add(id));
    if (!alumnos.length) continue;
    grupos.push({ nombre: texto(g.nombre, 40) || `Mesa ${grupos.length + 1}`, alumnos, porque: texto(g.porque, 300), variante: VARIANTES.includes(g.variante) ? g.variante : null, ...lugar(g.columna, g.fila) });
  }
  const faltan = ids.filter((id) => !usados.has(id));
  if (faltan.length) grupos.push({ nombre: 'Mesa abierta', alumnos: faltan, porque: 'Quedaron sin ubicar en la propuesta: el profe decide dónde.', variante: null, ...lugar(4, 3) });
  const atencion = (Array.isArray(r.atencion) ? r.atencion : [])
    .filter((x) => ids.includes(String(x?.alumno)))
    .slice(0, 4)
    .map((x) => ({ alumno: String(x.alumno), porque: texto(x.porque, 240) }));
  return { resumen: texto(r.resumen, 400), grupos, atencion };
}

/** Disposición que guarda el profe: {grupos: [{nombre, alumnos[], columna, fila, porque}]} validada. */
function validarDisposicion(d, curso) {
  const norm = normalizarMapa({ grupos: d?.grupos, atencion: d?.atencion, resumen: d?.resumen }, curso);
  return { ...norm, objetivo: Object.keys(OBJETIVOS).includes(d?.objetivo) ? d.objetivo : null, tema: texto(d?.tema, 160) };
}

module.exports = {
  TIPOS,
  VARIANTES,
  COMO,
  PUNTOS,
  OBJETIVOS,
  ESQUEMA_TAREAS,
  ESQUEMA_MAPA,
  instruccionTareas,
  validarPedidoTareas,
  pedidoTareas,
  normalizarTarea,
  varianteSugerida,
  tareaParaAlumno,
  instruccionMapa,
  pedidoMapa,
  rasgosParaIA,
  alumnosDemo,
  normalizarMapa,
  validarDisposicion,
  diaHabil,
};
