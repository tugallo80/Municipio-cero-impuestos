// ══════════════════════════════════════════════════
//  Tutor 24/7 del alumno (EDU.16) — lógica pura, sin red ni base, para poder probarla.
//
//  El alumno pregunta por texto (o por voz, con el mismo contexto) y el tutor responde con
//  la vida escolar REAL de su curso:
//   - lo que pasó en las últimas clases (resúmenes de la clase grabada, EDU.04a), con los
//     avisos para la casa y lo que hay que traer;
//   - sus tareas, fechas y estado (EDU.04f / EDU.06d);
//   - el horario, dónde va el curso en cada texto y lo que se viene (EDU.04b / EDU.15);
//   - UN pedazo del texto oficial (≤ 3.000 caracteres): el tema y la página que pregunta.
//     Nunca el libro entero.
//  Guía sin hacer la tarea (escalera: pregunta → pista → ejemplo parecido).
//
//  PRIVACIDAD: a la IA no llega ningún nombre. El alumno es "un alumno de 2.º de secundaria";
//  el profe humano es el marcador {PROFE} (el navegador lo cambia por el apodo guardado en el
//  equipo, nunca pasa por el servidor). Todo lo que vuelve pasa por anonimizar().
// ══════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const { textoClasesParaTutor, anonimizar, NOMBRES_DEMO } = require('./clase');
const { cursoLegible } = require('./instruccion');
const INTENCIONES = require('./tutor24-intenciones.json');
const ESTUDIANTE = require('./estudiante-demo.json');

const MAX_FRAGMENTO = 3000;
const MAX_PREGUNTA = 500;
const MAX_TURNOS = 8;
const MAX_TURNO = 600;
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MATERIA_OK = /^[a-z]{2,5}$/;
const TEMA_OK = /^[a-z]{2,5}-\d{1,2}$/;

const normal = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const texto = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// ── Qué pregunta ──────────────────────────────────
/** La materia que nombra la pregunta ("la tarea de inglés", "pág. 40 de Artes"), con los nombres del curso. */
const ALIAS = { ing: ['ingles', 'english'], mat: ['mate', 'matematica', 'matematicas'], len: ['lenguaje', 'lengua', 'castellano'], fil: ['filosofia', 'psicologia', 'cosmovisiones'], art: ['artes', 'arte', 'plastica'], mus: ['musica'], val: ['valores', 'religion'], bio: ['biologia', 'geografia'], csoc: ['sociales'], efd: ['educacion fisica', 'ed. fisica', 'gimnasia'] };
function materiaDe(pregunta, materias = {}) {
  const t = ` ${normal(pregunta).replace(/[^a-z0-9ñ. ]+/g, ' ')} `;
  for (const [id, xs] of Object.entries(ALIAS)) {
    const nombres = [...xs, normal(materias[id]?.corto || ''), normal(materias[id]?.nombre || '')].filter((x) => x.length >= 4);
    if (nombres.some((n) => t.includes(` ${n} `))) return id;
  }
  return null;
}

const REGEX = Object.fromEntries(Object.entries(INTENCIONES.patrones).map(([k, xs]) => [k, xs.map((x) => new RegExp(x))]));
/** 'riesgo' | 'emocional' | 'llevar' | 'casa' | 'clase' | 'texto' | 'manana' | 'tarea' | 'otro' */
function intencion(pregunta) {
  const t = normal(pregunta);
  for (const k of INTENCIONES.orden) if (REGEX[k].some((r) => r.test(t))) return k;
  return 'otro';
}

/** Respuesta fija, sin IA, cuando hay señales de riesgo (se deriva a un adulto). */
function respuestaRiesgo() {
  return [
    'Gracias por contármelo. Soy una IA y esto es demasiado importante para que lo hables solo con una máquina. 💛',
    'Contáselo **hoy** a un adulto de confianza: alguien de tu familia, {PROFE}, la dirección o el regente.',
    'Si estás en peligro ahora mismo, pedí ayuda a un adulto que esté cerca o llamá al **110** (Policía). La Defensoría de la Niñez y Adolescencia de tu municipio también te puede ayudar.',
    'No es tu culpa y no estás solo/a.',
  ].join('\n\n');
}

// ── Fechas (hora de Bolivia, días hábiles como en estudiante-demo.js) ──
const hoyBolivia = (ahora = Date.now()) => new Date(ahora - 4 * 3600e3);
const iso = (d) => d.toISOString().slice(0, 10);
function habil(dias, ahora = Date.now()) {
  const d = hoyBolivia(ahora);
  let n = Math.abs(dias);
  const paso = dias >= 0 ? 1 : -1;
  while (n > 0) {
    d.setUTCDate(d.getUTCDate() + paso);
    if (d.getUTCDay() % 6) n--;
  }
  return iso(d);
}
const aFecha = (s) => new Date(`${s}T12:00:00Z`);
const largo = (s) => {
  const d = aFecha(s);
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
};
function cuando(s, hoy) {
  const n = Math.round((aFecha(s) - aFecha(hoy)) / 864e5);
  return n === 0 ? `hoy (${largo(s)})` : n === 1 ? `mañana (${largo(s)})` : n === -1 ? `ayer (${largo(s)})` : largo(s);
}

// ── Datos fijos del curso (horario, avisos, qué llevar, eventos, dónde va) ──
// Hoy solo existe el curso del piloto (estudiante-demo.json, generado desde demo-piloto.json).
// Las fechas vienen como "días hábiles desde hoy" para que la demo siempre esté al día.
function datosDelCurso(curso, ahora = Date.now()) {
  if (curso !== ESTUDIANTE.curso) return null;
  const conFecha = (xs) => (xs || []).map(({ dias, ...r }) => ({ ...r, fecha: habil(dias, ahora) }));
  // "Qué llevar" de una materia: el primer día (desde esa fecha) que el curso tiene esa materia.
  const conClase = (x) => {
    if (!x.materia || !(ESTUDIANTE.horario || []).some((h) => h.materia === x.materia)) return x;
    const d = aFecha(x.fecha);
    for (let k = 0; k < 10 && !(ESTUDIANTE.horario || []).some((h) => h.dia === d.getUTCDay() && h.materia === x.materia); k++) d.setUTCDate(d.getUTCDate() + 1);
    return { ...x, fecha: iso(d) };
  };
  return {
    colegio: ESTUDIANTE.colegio,
    cursoNombre: ESTUDIANTE.cursoNombre,
    materias: ESTUDIANTE.materias || {},
    horario: ESTUDIANTE.horario || [],
    recreo: ESTUDIANTE.recreo,
    avisos: conFecha(ESTUDIANTE.avisos),
    eventos: conFecha(ESTUDIANTE.eventos),
    llevar: conFecha(ESTUDIANTE.llevar).map(conClase),
    temasHoy: ESTUDIANTE.temasHoy || {},
    tareasDemo: (ESTUDIANTE.tareas || []).map(({ dias, ...t }) => ({ ...t, entrega: habil(dias, ahora) })),
  };
}
const nombreMateria = (est, m) => est?.materias?.[m]?.corto || est?.materias?.[m]?.nombre || m;
/** El profe IA de cada materia ('la_profe' Taji / 'el_profe' Jochi). */
function profeDeMateria(est, m) {
  return /jochi/i.test(est?.materias?.[m]?.profe || '') ? 'el_profe' : 'la_profe';
}

function clasesDelDia(est, fecha) {
  const dw = aFecha(fecha).getUTCDay();
  const del = (est?.horario || []).filter((h) => h.dia === dw).sort((a, b) => (a.desde < b.desde ? -1 : 1));
  // "Lenguaje 07:30–08:50" (horas seguidas de la misma materia, juntas)
  const grupos = [];
  for (const h of del) {
    const g = grupos[grupos.length - 1];
    if (g && g.materia === h.materia) g.hasta = h.hasta;
    else grupos.push({ ...h });
  }
  return grupos;
}
const proximoDiaDeClase = (fecha) => {
  const d = aFecha(fecha);
  do d.setUTCDate(d.getUTCDate() + 1);
  while (!(d.getUTCDay() % 6));
  return iso(d);
};

// ── Textos oficiales: UN tema y un pedazo, nunca el libro ──
const CACHE_TEXTOS = {};
function textoArea(area) {
  if (!MATERIA_OK.test(area || '')) return null;
  if (CACHE_TEXTOS[area] !== undefined) return CACHE_TEXTOS[area];
  try {
    CACHE_TEXTOS[area] = JSON.parse(fs.readFileSync(path.join(__dirname, 'textos', `${area}.json`), 'utf8'));
  } catch {
    CACHE_TEXTOS[area] = null;
  }
  return CACHE_TEXTOS[area];
}
const AREAS = ['ing', 'fil', 'art', 'mus', 'val', 'len', 'mat', 'bio', 'csoc'];
const VACIAS = new Set('para como sobre esta este esto esa ese eso parte texto pagina libro tengo tenia porque donde cuando entiendo entendi explicame explica ayudame quiero puedo sabes podes decime dice dijo hace hacer hacia tiene tienen entre desde hasta todo toda todos todas solo tambien pero cual cuales'.split(' '));
const palabras = (s) => [...new Set(normal(s).replace(/[^a-z0-9ñ ]+/g, ' ').split(/\s+/).filter((w) => w.length >= 4 && !VACIAS.has(w)))];

/** "página 57", "pág. 58", "pag 12" → 57 */
function paginaDe(s) {
  const m = /\bp[aá]g(?:ina)?\.?\s*(\d{1,3})\b/i.exec(String(s || ''));
  return m ? Number(m[1]) : null;
}

/** Rango de páginas de cada tema (empieza en su página; termina donde empieza el siguiente). */
function rango(temas, i) {
  const p0 = Number(temas[i].pagina) || null;
  if (!p0) return { p0: null, p1: null };
  const sig = temas.slice(i + 1).find((t) => Number(t.pagina) > p0);
  return { p0, p1: sig ? Number(sig.pagina) - 1 : p0 + 6 };
}

/**
 * Elige el pedazo del texto oficial para esta pregunta.
 * @param {{materia?:string, tema?:string, pagina?:number, pregunta?:string, temasHoy?:object, siempre?:boolean}} p
 * @returns {null | {area, nombre, temaId, titulo, p0, p1, pagina, aprox:boolean, texto}}
 */
function buscarFragmento(p = {}) {
  const pregunta = String(p.pregunta || '');
  const pagina = Number(p.pagina) || paginaDe(pregunta);
  const claves = palabras(pregunta);
  let area = materiaDe(pregunta, ESTUDIANTE.materias) || (MATERIA_OK.test(p.materia || '') ? p.materia : null);
  if (TEMA_OK.test(p.tema || '')) area = p.tema.split('-')[0];
  const areas = area ? [area] : AREAS;

  // 1) El tema: el pedido, el de la página, el que mejor coincide con la pregunta o donde va el curso.
  let elegido = null;
  for (const a of areas) {
    const libro = textoArea(a);
    if (!libro) continue;
    const temas = libro.temas;
    let i = TEMA_OK.test(p.tema || '') ? temas.findIndex((t) => t.id === p.tema) : -1;
    if (i < 0 && pagina) i = temas.findIndex((t, k) => { const r = rango(temas, k); return r.p0 && pagina >= r.p0 && pagina <= r.p1; });
    let puntaje = i >= 0 ? 100 : 0;
    if (i < 0 && claves.length) {
      temas.forEach((t, k) => {
        const tit = normal(`${t.titulo} ${(t.subtemas || []).join(' ')}`);
        const s = claves.filter((w) => tit.includes(w)).length * 3 + (t.parrafos.length ? Math.min(3, claves.filter((w) => normal(t.parrafos.join(' ')).includes(w)).length) : 0);
        if (s > puntaje) { puntaje = s; i = k; }
      });
    }
    if (i < 0 && area && p.temasHoy?.[a]?.temaId) { i = temas.findIndex((t) => t.id === p.temasHoy[a].temaId); puntaje = 1; }
    if (i >= 0 && (!elegido || puntaje > elegido.puntaje)) elegido = { a, libro, i, puntaje };
  }
  if (!elegido) return null;
  // Sin pedido concreto y con una coincidencia flojita en otra área, mejor no mandar nada.
  if (!area && elegido.puntaje < 4 && !p.siempre) return null;
  const { libro, i } = elegido;
  const t = libro.temas[i];
  const { p0, p1 } = rango(libro.temas, i);
  const base = { area: elegido.a, nombre: libro.nombre, temaId: t.id, titulo: t.titulo, subtemas: t.subtemas || [], p0, p1 };
  if (!t.parrafos.length) return { ...base, pagina: null, aprox: false, texto: '' };

  // 2) Dentro del tema: dónde empezar (la página pedida, interpolada; o el párrafo que mejor coincide).
  const largos = t.parrafos.map((x) => x.length + 1);
  const total = largos.reduce((a, b) => a + b, 0);
  let desde = 0;
  if (pagina && p0 && p1 > p0 && pagina >= p0) {
    const objetivo = (total * (Math.min(pagina, p1) - p0)) / (p1 - p0 + 1);
    let acc = 0;
    while (desde < t.parrafos.length - 1 && acc + largos[desde] < objetivo) acc += largos[desde++];
  } else if (claves.length) {
    let mejor = -1;
    t.parrafos.forEach((x, k) => {
      const n = normal(x);
      const s = claves.filter((w) => n.includes(w)).length;
      if (s > mejor) { mejor = s; desde = k; }
    });
    if (mejor <= 0) desde = 0;
  }
  // Un poco antes, para que no arranque en la mitad de una explicación.
  let atras = 0;
  while (desde > 0 && atras + largos[desde - 1] < 500) atras += largos[--desde];
  const partes = [];
  let n = 0;
  for (let k = desde; k < t.parrafos.length && n < MAX_FRAGMENTO; k++) {
    const x = t.parrafos[k].slice(0, MAX_FRAGMENTO - n);
    partes.push(x);
    n += x.length + 1;
  }
  const antes = largos.slice(0, desde).reduce((a, b) => a + b, 0);
  const paginaAprox = p0 && p1 ? Math.min(p1, p0 + Math.floor(((p1 - p0 + 1) * antes) / total)) : null;
  return { ...base, pagina: pagina && p0 && pagina >= p0 && pagina <= p1 ? pagina : paginaAprox, aprox: !pagina, texto: partes.join('\n') };
}

// ── Lo que se manda a la IA ───────────────────────
/** Lo que manda el navegador: pregunta, foco (qué tiene abierto) e historial corto. Solo texto acotado e IDs. */
function validarPedido(d = {}) {
  const pregunta = texto(d.pregunta, MAX_PREGUNTA);
  if (!pregunta) return { ok: false, error: 'Escribí tu pregunta.' };
  const f = d.foco && typeof d.foco === 'object' ? d.foco : {};
  const foco = {
    materia: MATERIA_OK.test(f.materia || '') ? f.materia : null,
    tema: TEMA_OK.test(f.tema || '') ? f.tema : null,
    pagina: Number.isInteger(Number(f.pagina)) && Number(f.pagina) > 0 && Number(f.pagina) < 400 ? Number(f.pagina) : null,
    tarea: /^[-_A-Za-z0-9]{3,40}$/.test(f.tarea || '') ? f.tarea : null,
    // Si la tarea no está en el servidor (tareas de la demo que viven en el navegador): título y consigna, acotados.
    tareaInfo: f.tareaInfo && typeof f.tareaInfo === 'object' && texto(f.tareaInfo.titulo, 80)
      ? { titulo: texto(f.tareaInfo.titulo, 80), consigna: texto(f.tareaInfo.consigna, 400), materia: MATERIA_OK.test(f.tareaInfo.materia || '') ? f.tareaInfo.materia : null, entrega: /^\d{4}-\d{2}-\d{2}$/.test(f.tareaInfo.entrega || '') ? f.tareaInfo.entrega : null }
      : null,
  };
  const historial = (Array.isArray(d.historial) ? d.historial : [])
    .slice(-MAX_TURNOS)
    .map((x) => ({ rol: x?.rol === 'tutor' ? 'tutor' : 'alumno', texto: texto(x?.texto, MAX_TURNO) }))
    .filter((x) => x.texto);
  const profe = d.profe === 'el_profe' || d.profe === 'la_profe' ? d.profe : null;
  return { ok: true, pregunta, foco, historial, profe };
}

/** Tareas en formato corto para el contexto (con las pistas de su profe, que la IA NO debe saltear). */
function textoTareas(tareas, est, hoy, focoTarea) {
  const vigentes = (tareas || []).filter((t) => t && t.titulo).sort((a, b) => (a.entrega < b.entrega ? -1 : 1)).slice(0, 8);
  if (!vigentes.length) return '# Sus tareas\n\n- No tiene tareas cargadas en la app.';
  return `# Sus tareas (las dejó {PROFE})

${vigentes
  .map((t) => {
    const abierta = t.id === focoTarea ? ' ← LA TIENE ABIERTA AHORA' : '';
    const estado = t.estado && t.estado !== 'pendiente' ? 'ya la hizo' : 'pendiente';
    const origen = t.origen?.tipo === 'clase' ? `de la clase${t.origen.tema ? ` "${texto(t.origen.tema, 80)}"` : ''}` : t.origen?.tema ? `del cronograma: "${texto(t.origen.tema, 80)}"` : '';
    const pistas = (t.pistas || []).slice(0, 3).map((x, i) => `    ${i + 1}. ${texto(x, 200)}`).join('\n');
    return [
      `- [${estado}] ${nombreMateria(est, t.materia)} — "${texto(t.titulo, 80)}", para ${t.entrega ? cuando(t.entrega, hoy) : 'sin fecha'}${origen ? ` (${origen})` : ''}${abierta}`,
      `  Consigna: ${texto(t.textoVariante || t.consigna, 500)}`,
      pistas && `  Escalera de su profe (de a un peldaño, sin dar la respuesta):\n${pistas}`,
    ]
      .filter(Boolean)
      .join('\n');
  })
  .join('\n')}`;
}

/**
 * Arma el contexto de su vida escolar (≈ 1.500–4.000 tokens).
 * @param {{curso:string, ahora?:number, est?:object|null, tareas?:object[], clases?:object[], fragmento?:object|null, foco?:object}} c
 */
function armarContexto(c) {
  const ahora = c.ahora || Date.now();
  const hoy = iso(hoyBolivia(ahora));
  const hora = hoyBolivia(ahora).toISOString().slice(11, 16);
  const est = c.est || null;
  const prox = proximoDiaDeClase(hoy);
  const partes = [];
  partes.push(`# Hoy

Hoy es ${largo(hoy)} de ${aFecha(hoy).getUTCFullYear()}, son las ${hora} (hora de Bolivia). El próximo día de clase es ${cuando(prox, hoy)}.
(No conocés los feriados de este año: si el alumno dice que mañana no hay clase, creele.)`);

  if (est) {
    const linea = (f) => {
      const cl = clasesDelDia(est, f);
      return cl.length ? cl.map((h) => `${nombreMateria(est, h.materia)} ${h.desde}–${h.hasta}`).join(', ') : 'no hay clases';
    };
    const dwHoy = aFecha(hoy).getUTCDay();
    partes.push(`# Horario (${est.colegio}, ${est.cursoNombre})

- Hoy: ${dwHoy % 6 ? linea(hoy) : 'fin de semana, no hay clases'}. Recreo ${est.recreo?.[0] || ''}–${est.recreo?.[1] || ''}.
- ${cuando(prox, hoy).replace(/^./, (x) => x.toUpperCase())}: ${linea(prox)}.`);

    const va = Object.entries(est.temasHoy || {});
    if (va.length) {
      partes.push(`# Dónde va el curso en cada texto oficial (3.er trimestre)

${va.map(([m, t]) => `- ${nombreMateria(est, m)}: unidad ${t.unidad} "${texto(t.titulo, 100)}" (desde la pág. ${t.pagina}). Ahora: ${texto(t.enCurso, 100)}.${t.siguiente ? ` Después: ${texto(t.siguiente, 100)}.` : ''}`).join('\n')}`);
    }
  }

  partes.push(textoTareas(c.tareas, est, hoy, c.foco?.tarea));

  const clases = textoClasesParaTutor(c.clases || []);
  if (clases) partes.push(clases);

  if (est) {
    const fut = (xs) => (xs || []).filter((x) => x.fecha >= hoy).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
    const avisos = fut(est.avisos).slice(0, 6);
    // Los avisos de las clases grabadas también cuentan (vienen en textoClasesParaTutor).
    partes.push(`# Avisos para la casa (lo que tiene que decir en su casa)

${avisos.length ? avisos.map((a) => `- ${a.fecha === hoy ? 'Hoy' : `Para ${cuando(a.fecha, hoy)}`}: ${texto(a.texto, 300)}`).join('\n') : '- No hay avisos cargados.'}`);
    const llevar = fut(est.llevar).slice(0, 8);
    const porMateria = clasesDelDia(est, prox).map((h) => h.materia);
    partes.push(`# Qué llevar

${llevar.length ? llevar.map((l) => `- ${cuando(l.fecha, hoy)} — ${nombreMateria(est, l.materia)}: ${texto(l.texto, 200)}`).join('\n') : '- Nada especial cargado.'}
- Materias del próximo día de clase (${largo(prox)}): ${porMateria.map((m) => nombreMateria(est, m)).join(', ') || 'ninguna'} → sus cuadernos y textos.`);
    const eventos = fut(est.eventos).filter((e) => aFecha(e.fecha) - aFecha(hoy) <= 14 * 864e5).slice(0, 8);
    if (eventos.length) {
      const tipo = { examen: 'Evaluación', acto: 'Acto', entrega: 'Entrega' };
      partes.push(`# Se viene (próximas 2 semanas)

${eventos.map((e) => `- ${cuando(e.fecha, hoy)}: ${tipo[e.tipo] || e.tipo} de ${nombreMateria(est, e.materia)} — ${texto(e.titulo, 120)}`).join('\n')}`);
    }
  }

  const fr = c.fragmento;
  if (fr && fr.texto) {
    partes.push(`# Texto oficial: ${fr.nombre} · unidad "${texto(fr.titulo, 120)}" (págs. ${fr.p0}–${fr.p1})

Pedazo desde ${fr.aprox ? 'aprox. ' : ''}la pág. ${fr.pagina}. Es el texto del Ministerio que tiene el alumno (puede verse algo desordenado: viene de un PDF).
"""
${fr.texto}
"""`);
  } else if (fr) {
    partes.push(`# Texto oficial: ${fr.nombre} · unidad "${texto(fr.titulo, 120)}"${fr.p0 ? ` (desde la pág. ${fr.p0})` : ''}

De esta unidad solo tenemos el índice (subtemas: ${(fr.subtemas || []).join(', ') || '—'}). Si pregunta por el contenido exacto, decí con sinceridad que no lo tenés y explicale el tema en general.`);
  }

  const f = c.foco || {};
  if (f.pagina || f.tema || f.materia) {
    partes.push(`# Lo que tiene abierto ahora

${[f.materia && `Materia: ${nombreMateria(est, f.materia)}`, f.tema && `Unidad del texto: ${f.tema}`, f.pagina && `Página ${f.pagina}`].filter(Boolean).join(' · ')}`);
  }
  return partes.join('\n\n');
}

const NOMBRES_PROFES = { la_profe: 'la profe Taji', el_profe: 'el profe Jochi' };

/** Instrucción de sistema del tutor por texto. */
function instruccionTutor({ curso, profe = 'la_profe' } = {}) {
  const yo = NOMBRES_PROFES[profe] || NOMBRES_PROFES.la_profe;
  return `Sos ${yo}, una tutora o tutor de inteligencia artificial de la app educativa ÑANDÉ (Santa Cruz, Bolivia).
Estás "en el celular del alumno" a cualquier hora, todos los días, para acompañarlo en su vida escolar.
Si hablás de cuándo estás disponible, decí "a cualquier hora" (nunca "24/7"). Hablás con un alumno o
alumna de ${cursoLegible(curso)}. No sabés su nombre y no hace falta.

Reglas que no se rompen:
1. Sos una IA: si te preguntan si sos una persona, decí que no, que sos una IA. Nunca digas que sos una persona.
   NO te presentes ni saludes con "¡Hola! Soy…": la app ya te presentó (y muestra que sos IA). Andá directo a la respuesta.
2. Usá SOLO lo que está en "Lo que sabés de su vida escolar". Si no está, decí con sinceridad que no lo sabés y
   que le pregunte a {PROFE}. Nunca inventes tareas, fechas, páginas, avisos ni lo que dijo el profe.
3. Al profe de carne y hueso del curso nombralo SIEMPRE exactamente así: {PROFE} (es un marcador; se cambia solo).
   A vos y al otro profe IA ("la profe Taji", "el profe Jochi") sí los podés nombrar.
4. TAREAS: guiás, no la hacés. Escalera, de a UN peldaño por mensaje, mirando el historial para saber en cuál van:
   1.º una pregunta que lo haga pensar; 2.º una pista concreta; 3.º un ejemplo PARECIDO resuelto (con otros datos,
   nunca uno de su tarea). Si te pide la respuesta, decile con cariño que no se la vas a dar y dale el peldaño que sigue.
   Si te muestra lo que hizo, decile qué está bien y qué revisar, sin corregirlo entero. Usá las pistas de su profe.
5. TEXTO OFICIAL: si pregunta por una parte o "esta página", NO le preguntes qué parte: explicale directamente la idea
   principal de ese pedazo del texto con tus palabras y cortito, con un ejemplo de acá (Santa Cruz,
   el colegio, la comunidad), decí la página ("en la pág. 58…") y cerrá con UNA pregunta para ver si entendió.
6. "¿Qué tengo para mañana?", "¿qué llevo?", "¿qué digo en casa?": respondé con la lista concreta (fecha, materia,
   qué) sacada del contexto, en el orden en que sirve. Si no hay nada cargado, decilo.
7. EMOCIONES: si cuenta algo que le pasa (tristeza, peleas, miedo, burlas), respondé con calidez en 2–3 frases, sin
   hacer de psicólogo ni pedir detalles, y animalo a hablarlo con un adulto de confianza (su familia, {PROFE}, la
   dirección). Después, si quiere, seguís con lo escolar.
8. Privacidad: no le pidas su nombre, dirección, teléfono ni fotos. Si los dice, no los repitas.
9. Fuera de lo escolar: respondé breve y con buena onda, y volvé a lo escolar. Nada violento ni para adultos.
10. Forma: español de Bolivia con voseo camba suave, cálido y alentador. CORTO: hasta 80 palabras (hasta 140 si
    explicás una parte del texto). Listas con "• " cuando son varias cosas. Podés usar **negrita**. Máximo 1 emoji.
    Sin títulos ni tablas.`;
}

/** Contenido para generateContent: historial + pregunta. */
function armarConversacion(historial, pregunta) {
  const turnos = (historial || []).map((x) => ({ role: x.rol === 'tutor' ? 'model' : 'user', parts: [{ text: x.texto }] }));
  // La API pide que empiece con el usuario.
  while (turnos.length && turnos[0].role === 'model') turnos.shift();
  turnos.push({ role: 'user', parts: [{ text: pregunta }] });
  return turnos;
}

/** Limpieza de lo que vuelve: sin nombres del curso, sin marcas raras, largo acotado. */
function limpiarRespuesta(t, curso) {
  let s = anonimizar(String(t || ''), NOMBRES_DEMO[curso] || []);
  s = s.replace(/\{\s*profe\s*\}/gi, '{PROFE}').replace(/^#+\s*/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  return s.slice(0, 2500);
}

/** Un pedacito del streaming: sin nombres y con el marcador, SIN recortar espacios (se pegan uno tras otro). */
function limpiarPedazo(t, curso) {
  return anonimizar(String(t || ''), NOMBRES_DEMO[curso] || []).replace(/\{\s*profe\s*\}/gi, '{PROFE}');
}

/** Bloque compacto para la voz (Taji / Jochi por la Live API): sin el pedazo largo de texto. */
function contextoParaVoz(c) {
  const fr = c.fragmento && c.fragmento.texto ? { ...c.fragmento, texto: c.fragmento.texto.slice(0, 1500) } : c.fragmento;
  return `# Lo que sabés de su vida escolar (modo tutor a cualquier hora)

Usalo si pregunta qué tiene para mañana, qué llevar, qué decir en casa, qué dijo su profe o una parte del texto.
Al profe de carne y hueso decile "tu profe" (no sabés su nombre). Si algo no está acá, no lo inventes.

${armarContexto({ ...c, fragmento: fr })}`.replaceAll('{PROFE}', 'tu profe');
}

module.exports = {
  MAX_FRAGMENTO,
  intencion,
  materiaDe,
  respuestaRiesgo,
  datosDelCurso,
  profeDeMateria,
  buscarFragmento,
  paginaDe,
  validarPedido,
  armarContexto,
  instruccionTutor,
  armarConversacion,
  limpiarRespuesta,
  limpiarPedazo,
  contextoParaVoz,
  clasesDelDia,
  habil,
  NOMBRES_PROFES,
};
