// ══════════════════════════════════════════════════
//  Clase grabada (EDU.04a) — lógica pura, sin red ni base, para poder probarla.
//
//  El profe graba su clase → Gemini escucha el audio UNA vez y devuelve un JSON con:
//   - profe:     qué se vio contra el pensum del día, qué quedó pendiente, 2–3
//                sugerencias en tono positivo y las tareas que dio (nunca una nota).
//   - direccion: resumen corto y alertas SOLO con señales claras de riesgo, siempre
//                "para revisar por una persona".
//   - contexto:  lo que necesitan los profes IA (Taji / Jochi / Kay) para responder
//                "¿qué tarea dejó el profe?" — sin nombres de alumnos.
//   - transcripcion: con los nombres de alumnos reemplazados por "un alumno".
//
//  PRIVACIDAD: además de la instrucción al modelo, todo el texto que vuelve pasa por
//  anonimizar() con la lista de nombres del curso (en la demo, nombres ficticios).
// ══════════════════════════════════════════════════

// Cursos que se pueden grabar (los mismos IDs de curso que usa Kay).
const CURSO_VALIDO = /^[0-9]{1,2}(ro|do|to|vo|no|mo)_(primaria|secundaria)$/;

// Nombres de los alumnos del curso, para borrarlos del texto. En la demo son los
// nombres FICTICIOS de la maqueta (datos-demo.js). En el piloto vendrán de la base
// (EDU.03), nunca del navegador.
const NOMBRES_DEMO = {
  '4to_primaria': ['Mateo Rojas', 'Valentina Suárez', 'Thiago Vargas', 'Camila Justiniano'],
  '5to_primaria': ['Sofía Rojas', 'Benjamín Céspedes', 'Isabella Añez', 'Lucas Montaño'],
};

const TIPOS_ALERTA = ['maltrato', 'gritos', 'alguien_lastimado', 'pide_ayuda', 'otro'];

const sinTildes = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Reemplaza nombres (completos, nombre solo y apellido solo) por "un alumno". */
function anonimizar(texto, nombres = []) {
  let t = String(texto || '');
  const partes = new Set();
  for (const n of nombres) {
    const limpio = String(n || '').trim();
    if (!limpio) continue;
    partes.add(limpio);
    for (const p of limpio.split(/\s+/)) if (p.length >= 3) partes.add(p);
  }
  // Primero los más largos ("Mateo Rojas" antes que "Mateo").
  for (const p of [...partes].sort((a, b) => b.length - a.length)) {
    // Compara sin tildes: "Suarez" también cae si el nombre es "Suárez".
    const patron = sinTildes(p)
      .split('')
      .map((c) => {
        const base = escapar(c);
        const con = { a: 'aá', e: 'eé', i: 'ií', o: 'oó', u: 'uúü', n: 'nñ', A: 'AÁ', E: 'EÉ', I: 'IÍ', O: 'OÓ', U: 'UÚÜ', N: 'NÑ' }[c];
        return con ? `[${con}]` : base;
      })
      .join('');
    t = t.replace(new RegExp(`(^|[^\\p{L}])${patron}(?![\\p{L}])`, 'giu'), '$1un alumno');
  }
  // "un alumno un alumno" (nombre + apellido sueltos) → uno solo.
  return t.replace(/(un alumno)(\s+un alumno)+/gi, '$1');
}

const texto = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const lista = (v, max, largo) => (Array.isArray(v) ? v : []).map((x) => texto(x, largo)).filter(Boolean).slice(0, max);

/** Lo que manda el navegador sobre la clase: solo textos cortos del propio profe. */
function validarPedido(d = {}) {
  const curso = String(d.curso || '');
  if (!CURSO_VALIDO.test(curso)) return { ok: false, error: 'Curso inválido.' };
  const mime = String(d.mime || '').split(';')[0].trim().toLowerCase();
  if (!/^audio\/(webm|ogg|mp4|mpeg|mp3|wav|aac|x-m4a|m4a|flac)$/.test(mime)) return { ok: false, error: 'Formato de audio no soportado.' };
  if (typeof d.audio !== 'string' || d.audio.length < 1000) return { ok: false, error: 'No llegó el audio.' };
  return {
    ok: true,
    curso,
    mime,
    materia: texto(d.materia, 40) || 'Clase',
    tema: texto(d.tema, 120),
    pensum: texto(d.pensum, 80),
    segundos: Math.max(0, Math.min(Number(d.segundos) || 0, 4 * 3600)),
  };
}

function cursoLegible(curso) {
  return CURSO_VALIDO.test(curso || '') ? curso.replace('_', ' de ') : 'primaria';
}

/** Instrucción de sistema del resumen de clase. */
function instruccionClase() {
  return `Sos un asistente pedagógico de la plataforma educativa ÑANDÉ (Santa Cruz, Bolivia).
Escuchás el audio de una clase de primaria y armás un informe para el profe, para la dirección
y un contexto para los tutores de IA de los alumnos. Escribís en español de Bolivia, claro y cálido.

Reglas que no se rompen:
1. NUNCA escribas nombres ni apellidos de alumnos (tampoco apodos). Siempre "un alumno", "una alumna"
   o "varios alumnos". Al profe llamalo "el profe" o "la profe". No escribas lugares exactos,
   teléfonos ni datos de familias.
2. Para el profe: tono positivo y productivo, de colega que acompaña. NUNCA es una calificación,
   puntaje ni castigo; no uses "mal", "deficiente", "falló". Primero lo que salió bien.
3. Alertas para la dirección: SOLO si hay señales CLARAS en el audio de maltrato, gritos fuertes
   contra alguien, alguien lastimado o un chico que pide ayuda. Una clase movida o ruidosa NO es
   alerta. Si no hay nada claro, la lista va vacía. Cada alerta describe lo que se escuchó, no saca
   conclusiones: la revisa una persona.
4. No inventes. Si algo no se entiende en el audio, decilo. Si el audio no es una clase o está
   vacío, marcá hubo_clase=false y dejá las listas vacías.
5. Tareas: solo las que el profe dio de verdad, con la fecha de entrega si la dijo.
6. La transcripción va completa pero con los nombres de alumnos ya reemplazados; marcá quién habla
   con "Profe:" o "Alumno:" / "Alumna:" / "Varios:" al inicio de cada intervención.`;
}

/** Pedido concreto para esta clase (va junto al audio). */
function pedidoClase(p, contenido = {}) {
  const pensum = (contenido.pensum || [])
    .slice(0, 6)
    .map((x) => `- [${texto(x.materia, 30)}] ${texto(x.titulo, 80)}: ${texto(x.texto, 300)}`)
    .join('\n');
  return `Curso: ${cursoLegible(p.curso)}.
Según el horario, en esta hora tocaba: ${p.materia}${p.tema ? ` — "${p.tema}"` : ''}${p.pensum ? ` (${p.pensum})` : ''}.
Duración grabada: ${Math.round(p.segundos / 60)} minutos aprox.
${pensum ? `\nPensum cargado del curso (referencia):\n${pensum}\n` : ''}
Escuchá el audio adjunto y devolvé el informe en el formato JSON pedido.`;
}

const LISTA_TEXTO = { type: 'array', items: { type: 'string' } };
const ESQUEMA_INFORME = {
  type: 'object',
  properties: {
    hubo_clase: { type: 'boolean', description: 'false si el audio está vacío o no es una clase' },
    calidad_audio: { type: 'string', enum: ['buena', 'regular', 'mala'] },
    profe: {
      type: 'object',
      properties: {
        resumen: { type: 'string', description: '2-3 frases: qué se trabajó y cómo se vio la clase' },
        vistos: { ...LISTA_TEXTO, description: 'temas que se vieron' },
        comparacion_pensum: { type: 'string', description: 'cómo se relaciona lo que se dio con lo que tocaba hoy' },
        pendiente: { ...LISTA_TEXTO, description: 'lo que tocaba hoy y no se llegó a ver o quedó a medias' },
        sugerencias: { ...LISTA_TEXTO, description: '2 o 3 sugerencias concretas y positivas para la próxima clase' },
        tareas: {
          type: 'array',
          items: {
            type: 'object',
            properties: { descripcion: { type: 'string' }, para: { type: 'string', description: 'cuándo se entrega, si lo dijo' } },
            required: ['descripcion'],
          },
        },
      },
      required: ['resumen', 'vistos', 'comparacion_pensum', 'pendiente', 'sugerencias', 'tareas'],
    },
    direccion: {
      type: 'object',
      properties: {
        resumen: { type: 'string', description: '2-3 frases para la dirección' },
        alertas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tipo: { type: 'string', enum: TIPOS_ALERTA },
              que_se_escucho: { type: 'string' },
              minuto: { type: 'string', description: 'minuto aproximado, ej. "12"' },
            },
            required: ['tipo', 'que_se_escucho'],
          },
        },
      },
      required: ['resumen', 'alertas'],
    },
    contexto: {
      type: 'object',
      properties: {
        temas: { ...LISTA_TEXTO, description: 'temas de la clase, en palabras de un chico' },
        explicaciones_clave: { ...LISTA_TEXTO, description: 'cómo lo explicó el profe (ejemplos, pasos) para poder repetirlo' },
        tareas: LISTA_TEXTO,
        dudas: { ...LISTA_TEXTO, description: 'dudas que tuvieron los alumnos en clase' },
      },
      required: ['temas', 'explicaciones_clave', 'tareas', 'dudas'],
    },
    transcripcion: { type: 'string' },
  },
  required: ['hubo_clase', 'calidad_audio', 'profe', 'direccion', 'contexto', 'transcripcion'],
};

/**
 * Normaliza y limpia la respuesta del modelo: recorta todo, aplica el esquema a mano
 * (por si el modelo se sale) y borra nombres con anonimizar().
 */
function limpiarInforme(crudo, nombres = []) {
  const r = crudo && typeof crudo === 'object' ? crudo : {};
  const a = (s) => anonimizar(s, nombres);
  const t = (v, max) => a(texto(v, max));
  const l = (v, max, largo) => lista(v, max, largo).map(a);
  const p = r.profe || {};
  const d = r.direccion || {};
  const c = r.contexto || {};
  return {
    huboClase: r.hubo_clase !== false,
    calidadAudio: ['buena', 'regular', 'mala'].includes(r.calidad_audio) ? r.calidad_audio : 'regular',
    profe: {
      resumen: t(p.resumen, 600),
      vistos: l(p.vistos, 8, 160),
      comparacionPensum: t(p.comparacion_pensum, 600),
      pendiente: l(p.pendiente, 6, 200),
      sugerencias: l(p.sugerencias, 3, 300),
      tareas: (Array.isArray(p.tareas) ? p.tareas : [])
        .slice(0, 6)
        .map((x) => ({ descripcion: t(x?.descripcion, 240), para: t(x?.para, 60) }))
        .filter((x) => x.descripcion),
    },
    direccion: {
      resumen: t(d.resumen, 600),
      alertas: (Array.isArray(d.alertas) ? d.alertas : [])
        .slice(0, 5)
        .map((x) => ({
          tipo: TIPOS_ALERTA.includes(x?.tipo) ? x.tipo : 'otro',
          queSeEscucho: t(x?.que_se_escucho, 300),
          minuto: texto(x?.minuto, 10),
        }))
        .filter((x) => x.queSeEscucho),
    },
    contexto: {
      temas: l(c.temas, 6, 160),
      explicaciones: l(c.explicaciones_clave, 6, 300),
      tareas: l(c.tareas, 5, 240),
      dudas: l(c.dudas, 5, 200),
    },
    transcripcion: a(String(r.transcripcion || '').slice(0, 60000)),
  };
}

/**
 * Texto para la instrucción de los profes IA: lo que pasó en las últimas clases del
 * curso (sin nombres; ya viene limpio). `clases`: [{fecha, materia, tema, contexto}]
 */
function textoClasesParaTutor(clases = []) {
  const items = (Array.isArray(clases) ? clases : []).slice(0, 3);
  if (!items.length) return '';
  const bloques = items.map((k) => {
    const c = k.contexto || {};
    const linea = (titulo, xs) => (xs && xs.length ? `${titulo}:\n${xs.map((x) => `  - ${texto(x, 300)}`).join('\n')}` : '');
    return [
      `## ${texto(k.materia, 40)} — clase del ${texto(k.fecha, 10)}${k.tema ? ` ("${texto(k.tema, 120)}")` : ''}`,
      linea('Temas', c.temas),
      linea('Cómo lo explicó su profe', c.explicaciones),
      linea('Tareas que dejó', c.tareas),
      linea('Dudas que hubo en clase', c.dudas),
    ]
      .filter(Boolean)
      .join('\n');
  });
  return `# Lo que pasó en las últimas clases de su curso (las dio su profe de verdad)

Usalo cuando el alumno pregunte por la clase ("¿qué dijo el profe que teníamos que hacer?",
"¿qué tarea dejó?", "no entendí la parte de…"). Contale lo que dijo su profe y explicalo de la
misma forma, con la escalera de siempre (sin hacerle la tarea). Si lo que pregunta no está acá,
decí con sinceridad que no lo sabés y que le pregunte a su profe: no inventes tareas ni fechas.

${bloques.join('\n\n')}`;
}

module.exports = {
  CURSO_VALIDO,
  NOMBRES_DEMO,
  TIPOS_ALERTA,
  ESQUEMA_INFORME,
  anonimizar,
  validarPedido,
  instruccionClase,
  pedidoClase,
  limpiarInforme,
  textoClasesParaTutor,
};
