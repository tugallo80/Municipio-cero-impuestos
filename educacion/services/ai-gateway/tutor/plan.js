// ══════════════════════════════════════════════════
//  Cronograma y mentora del profe (EDU.04b) — lógica pura, sin red ni base.
//
//  - Leer el plan: Gemini lee el PDF del profe y devuelve áreas y temas (JSON).
//    El calendario y el reparto NO usan IA (maqueta/calendario.js).
//  - Mentora: una tarjeta corta por tema, que propone y no juzga. Evaluación según
//    la RM 0001/2026: Ser 10 · Saber 45 · Hacer 40 · Autoevaluación 5.
//  Nada de datos de alumnos: al modelo solo va el curso, el área y el tema.
// ══════════════════════════════════════════════════

const AREAS = [
  { id: 'mat', nombre: 'Matemática', icono: '🔢' },
  { id: 'len', nombre: 'Comunicación y Lenguajes', icono: '📖' },
  { id: 'cnat', nombre: 'Ciencias Naturales', icono: '🌱' },
  { id: 'csoc', nombre: 'Ciencias Sociales', icono: '🌎' },
  { id: 'art', nombre: 'Artes Plásticas y Visuales', icono: '🎨' },
  { id: 'mus', nombre: 'Educación Musical', icono: '🎵' },
  { id: 'efd', nombre: 'Educación Física y Deportes', icono: '⚽' },
  { id: 'val', nombre: 'Valores, Espiritualidades y Religiones', icono: '🕊️' },
  { id: 'tec', nombre: 'Técnica Tecnológica', icono: '🛠️' },
  { id: 'ing', nombre: 'Lengua extranjera', icono: '💬' },
  { id: 'ori', nombre: 'Lengua originaria', icono: '🗣️' },
];
const AREA_IDS = AREAS.map((a) => a.id);
const EVALUACION = { ser: 10, saber: 45, hacer: 40, autoevaluacion: 5 };

const texto = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const lista = (v, max, largo) => (Array.isArray(v) ? v : []).map((x) => texto(x, largo)).filter(Boolean).slice(0, max);
const CURSO_VALIDO = /^[0-9]{1,2}(ro|do|to|vo|no|mo)_(primaria|secundaria)$/;
const cursoLegible = (c) => (CURSO_VALIDO.test(c || '') ? c.replace('_', ' de ') : 'primaria');

// ── Leer el plan (PDF) ──────────────────────────────
function instruccionPlan() {
  return `Sos un asistente pedagógico de la plataforma ÑANDÉ (Bolivia). Te dan el PDF del plan de un
profe de primaria (plan anual, PDC, pensum o planes y programas). Extraé las áreas y los temas
(contenidos) EN EL ORDEN en que aparecen, para armar un cronograma.

Reglas:
1. No inventes temas: solo lo que está en el documento. Si el documento no es un plan, devolvé
   areas vacías y explicalo en advertencias.
2. Áreas: usá los códigos dados (mat, len, cnat, csoc, art, mus, efd, val, tec, ing, ori). Si un
   área del PDF no corresponde a ninguno, usá la más parecida y avisá en advertencias.
3. Cada tema: título corto (máx. 12 palabras), objetivo en una frase si está, peso 1 (corto, 1–2
   clases), 2 (normal) o 3 (largo, una unidad entera), y el trimestre (1, 2 o 3) solo si el
   documento lo dice; si no, 0.
4. IGNORÁ nombres de personas, listas de alumnos, notas, teléfonos o direcciones: nunca los copies.
5. Máximo 40 temas por área (si hay más, juntá subtemas).`;
}

const ESQUEMA_PLAN = {
  type: 'object',
  properties: {
    titulo: { type: 'string', description: 'título corto del plan, sin nombres de personas' },
    curso_detectado: { type: 'string' },
    areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          area: { type: 'string', enum: AREA_IDS },
          temas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                titulo: { type: 'string' },
                objetivo: { type: 'string' },
                peso: { type: 'integer', minimum: 1, maximum: 3 },
                trimestre: { type: 'integer', minimum: 0, maximum: 3 },
              },
              required: ['titulo', 'peso', 'trimestre'],
            },
          },
        },
        required: ['area', 'temas'],
      },
    },
    advertencias: { type: 'array', items: { type: 'string' } },
  },
  required: ['titulo', 'areas', 'advertencias'],
};

/** Normaliza el plan (de la IA o del navegador): áreas conocidas, IDs estables, límites. */
function normalizarPlan(crudo) {
  const r = crudo && typeof crudo === 'object' ? crudo : {};
  const porArea = new Map();
  for (const a of Array.isArray(r.areas) ? r.areas : []) {
    const id = AREA_IDS.includes(a?.area || a?.id) ? a.area || a.id : null;
    if (!id) continue;
    const temas = porArea.get(id) || [];
    for (const t of Array.isArray(a.temas) ? a.temas : []) {
      const titulo = texto(t?.titulo, 120);
      if (!titulo || temas.length >= 40) continue;
      temas.push({
        idPrevio: typeof t?.id === 'string' ? t.id : '',
        titulo,
        objetivo: texto(t?.objetivo, 240),
        peso: [1, 2, 3].includes(Number(t?.peso)) ? Number(t.peso) : 2,
        trimestre: [0, 1, 2, 3].includes(Number(t?.trimestre)) ? Number(t.trimestre) : 0,
      });
    }
    porArea.set(id, temas);
  }
  // IDs estables: si el tema ya tenía un ID válido se conserva (así "hecho" no se pierde al
  // editar el plan); los nuevos toman el siguiente número libre.
  const areas = AREAS.filter((a) => porArea.get(a.id)?.length).map((a) => {
    const usados = new Set();
    const valido = (id) => new RegExp(`^${a.id}-\\d{1,2}$`).test(id) && !usados.has(id);
    const temas = porArea.get(a.id).map(({ idPrevio, ...t }) => {
      const id = valido(idPrevio) ? idPrevio : null;
      if (id) usados.add(id);
      return { id, ...t };
    });
    let n = 1;
    for (const t of temas) {
      if (t.id) continue;
      while (usados.has(`${a.id}-${n}`)) n++;
      t.id = `${a.id}-${n}`;
      usados.add(t.id);
    }
    return { id: a.id, nombre: a.nombre, temas };
  });
  return {
    titulo: texto(r.titulo, 120) || 'Plan del curso',
    cursoDetectado: texto(r.curso_detectado || r.cursoDetectado, 40),
    areas,
    advertencias: lista(r.advertencias, 6, 240),
  };
}

// ── Lo que guarda el navegador (config del cronograma) ──
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie'];
function validarEstado(e) {
  const x = e && typeof e === 'object' ? e : {};
  const c = x.config || {};
  const horario = {};
  for (const d of DIAS) horario[d] = (Array.isArray(c.horario?.[d]) ? c.horario[d] : []).slice(0, 8).map((a) => (AREA_IDS.includes(a) ? a : ''));
  const dias = (v) =>
    (Array.isArray(v) ? v : [])
      .slice(0, 60)
      .map((d) => ({ fecha: FECHA.test(d?.fecha) ? d.fecha : undefined, desde: FECHA.test(d?.desde) ? d.desde : undefined, hasta: FECHA.test(d?.hasta) ? d.hasta : undefined, motivo: texto(d?.motivo, 60) }))
      .filter((d) => d.fecha || (d.desde && d.hasta))
      .map((d) => JSON.parse(JSON.stringify(d)));
  const hechos = {};
  for (const [k, v] of Object.entries(x.hechos || {}).slice(0, 600)) if (/^[a-z]{2,4}-\d{1,2}$/.test(k) && FECHA.test(v)) hechos[k] = v;
  return {
    config: {
      anio: [2026, 2027].includes(Number(c.anio)) ? Number(c.anio) : 2027,
      distrito: /^[a-z0-9_]{3,40}$/.test(c.distrito || '') ? c.distrito : 'scz_capital',
      multigrado: lista(c.multigrado, 3, 20).filter((m) => CURSO_VALIDO.test(m)),
      horario,
      sinClase: dias(c.sinClase),
      semanaEvaluacion: c.semanaEvaluacion !== false,
      colchon: Math.min(0.3, Math.max(0, Number(c.colchon ?? 0.1) || 0)),
    },
    plan: normalizarPlan({ titulo: x.plan?.titulo, areas: (x.plan?.areas || []).map((a) => ({ area: a.id, temas: a.temas })) }),
    hechos,
    perdidos: (Array.isArray(x.perdidos) ? x.perdidos : []).filter((f) => FECHA.test(f)).slice(0, 120),
  };
}

// ── Mentora ─────────────────────────────────────────
function instruccionMentora() {
  return `Sos la mentora pedagógica de ÑANDÉ: una colega con experiencia que acompaña a profes de
primaria de escuelas rurales de Santa Cruz, Bolivia. Proponés, el profe decide. Hablás claro, en
español de Bolivia, con voseo y sin jerga.

Para el tema que te pasan, armá UNA tarjeta de clase corta y concreta:
- Objetivo en una frase.
- Tres momentos: inicio (5 min, con una pregunta), actividad principal, cierre (pregunta de salida).
- Una actividad con lo que hay en la comunidad (huerto, feria, río, animales, entrevistas a
  mayores) ligada al objetivo. Materiales que ya hay en una escuela rural: nada de comprar ni de
  internet.
- Tres criterios simples para mirar en el momento (en camino / logrado / destacado).
- Cómo evaluarlo según la RM 0001/2026: Ser (10), Saber (45), Hacer (40) y Autoevaluación (5),
  una frase concreta por dimensión. La autoevaluación la hace el niño (caritas o semáforo).
- 5 preguntas cortas de repaso (para empezar la clase siguiente: preguntar, no releer).
- Si es multigrado, una frase de cómo darlo a dos cursos a la vez.
Nunca: puntajes del profe, juicios sobre el profe, más de una actividad principal, nombres de niños.`;
}

const ESQUEMA_MENTORA = {
  type: 'object',
  properties: {
    objetivo: { type: 'string' },
    inicio: { type: 'string' },
    actividad: { type: 'string' },
    cierre: { type: 'string' },
    comunidad: { type: 'string', description: 'actividad con lo que hay en la comunidad' },
    materiales: { type: 'array', items: { type: 'string' } },
    criterios: { type: 'array', items: { type: 'string' } },
    evaluacion: {
      type: 'object',
      properties: { ser: { type: 'string' }, saber: { type: 'string' }, hacer: { type: 'string' }, autoevaluacion: { type: 'string' } },
      required: ['ser', 'saber', 'hacer', 'autoevaluacion'],
    },
    repaso: { type: 'array', items: { type: 'string' } },
    multigrado: { type: 'string' },
  },
  required: ['objetivo', 'inicio', 'actividad', 'cierre', 'comunidad', 'criterios', 'evaluacion', 'repaso'],
};

function validarPedidoMentora(d = {}) {
  const curso = String(d.curso || '');
  if (!CURSO_VALIDO.test(curso)) return { ok: false, error: 'Curso inválido.' };
  const area = AREAS.find((a) => a.id === d.area);
  if (!area) return { ok: false, error: 'Área inválida.' };
  const tema = texto(d.tema, 120);
  if (!tema) return { ok: false, error: 'Falta el tema.' };
  return { ok: true, curso, area, tema, objetivo: texto(d.objetivo, 240), multigrado: lista(d.multigrado, 3, 20).filter((m) => CURSO_VALIDO.test(m)) };
}

function pedidoMentora(p) {
  return `Curso: ${cursoLegible(p.curso)}${p.multigrado.length ? ` (multigrado con ${p.multigrado.map(cursoLegible).join(' y ')})` : ''}.
Área: ${p.area.nombre}.
Tema: "${p.tema}".${p.objetivo ? `\nObjetivo del plan del profe: ${p.objetivo}` : ''}
Escuela rural de Santa Cruz, Bolivia. Periodos de 40 minutos.`;
}

function limpiarTarjeta(r) {
  const x = r && typeof r === 'object' ? r : {};
  const e = x.evaluacion || {};
  return {
    objetivo: texto(x.objetivo, 240),
    inicio: texto(x.inicio, 400),
    actividad: texto(x.actividad, 700),
    cierre: texto(x.cierre, 300),
    comunidad: texto(x.comunidad, 500),
    materiales: lista(x.materiales, 6, 80),
    criterios: lista(x.criterios, 3, 200),
    evaluacion: { ser: texto(e.ser, 240), saber: texto(e.saber, 240), hacer: texto(e.hacer, 240), autoevaluacion: texto(e.autoevaluacion, 240) },
    repaso: lista(x.repaso, 5, 200),
    multigrado: texto(x.multigrado, 300),
  };
}

/** Clave del caché de ideas: mismo curso + área + tema = misma tarjeta (no se paga dos veces). */
function claveIdea(p) {
  let h = 0;
  const s = `${p.curso}|${p.area.id}|${p.tema.toLowerCase()}|${p.multigrado.join(',')}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `${p.area.id}_${(h >>> 0).toString(36)}`;
}

module.exports = {
  AREAS,
  AREA_IDS,
  EVALUACION,
  ESQUEMA_PLAN,
  ESQUEMA_MENTORA,
  instruccionPlan,
  normalizarPlan,
  validarEstado,
  instruccionMentora,
  validarPedidoMentora,
  pedidoMentora,
  limpiarTarjeta,
  claveIdea,
  cursoLegible,
};
