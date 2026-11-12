// ══════════════════════════════════════════════════
//  Demo sin login (EDU.15): cuenta demo fija y datos del curso REAL del profe del piloto
//  (U.E. Nuevo Horizonte, 2.º de secundaria, temas de sus textos oficiales en el 3.er trimestre),
//  con alumnos FICTICIOS. Fuente única: tools/datos/demo-piloto.json.
//
//  Lo llama crear-cuentas-prueba.js (workflow, cuenta de deploy). Idempotente: cada deploy deja
//  la demo "como nueva", con las fechas corridas a esta semana.
//  La cuenta demo no tiene clave: solo se entra con el link de la llave (eduDemo → custom token).
//  Gasta de su propia bolsa (edu/uso_demo).
// ══════════════════════════════════════════════════
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { getAuth } = require('firebase-admin/auth');
const T = require('../../services/ai-gateway/tutor/tareas');
const P = require('../../services/ai-gateway/tutor/plan');
const { llaves } = require('./demo.json');
const PILOTO = require('../datos/demo-piloto.json');

const CURSO = PILOTO.curso.id;
const DEMO = { uid: 'demo-nande-01', email: 'demo@alumnos.nande-educacion.local', alumnoId: 'alu_demo01', personalId: 'per_demo01' };
const DIA = 864e5;
const HOY = PILOTO.temasHoy;

// Fecha de Bolivia (UTC-4) con días hábiles: la demo siempre se ve "de esta semana".
const hoyBo = () => new Date(Date.now() - 4 * 3600e3);
const iso = (d) => d.toISOString().slice(0, 10);
function habil(dias) {
  const d = hoyBo();
  let n = Math.abs(dias);
  const paso = dias >= 0 ? 1 : -1;
  while (n > 0) {
    d.setUTCDate(d.getUTCDate() + paso);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) n--;
  }
  return iso(d);
}

// Clase grabada de ayer: Inglés, unidad 9 del texto ("Musical instruments and sports", pág. 57–58).
function claseDeEjemplo() {
  const ahora = Date.now();
  const fecha = habil(-1);
  const ing = HOY.ing;
  const entrega = habil(2);
  const contexto = {
    temas: [`${ing.titulo} (unidad ${ing.unidad}, pág. ${ing.pagina}): present continuous en preguntas`],
    explicaciones: [
      'Lectura "Patricia\'s talents" (pág. 57): Patricia, de Tarija, toca charango y los bombos del folclore.',
      'Para preguntar en present continuous el verbo to be va adelante: Is she playing the charango? — Yes, she is. / No, she is not.',
      'Se practicó con deportes y música del curso: Are they playing football? Is he playing the drums?',
    ],
    tareas: [`Escribir 6 preguntas en present continuous sobre deportes y música, con su respuesta corta, para el ${entrega}`],
    dudas: ['Cuándo va am, is o are al principio de la pregunta'],
    // EDU.16: lo que el tutor 24/7 responde a "¿qué tenía que decir en casa?" y "¿qué tengo que llevar?"
    avisosCasa: [`El profe pidió avisar en casa que para Música (el ${habil(1)}) hay que traer un instrumento autóctono o folclórico si tienen (charango, tarka, bombo…)`],
    llevar: [`Para Inglés del ${habil(2)}: el cuaderno con las 6 preguntas y el texto (págs. 57–58)`],
  };
  return {
    clase: {
      fecha, materia: 'Inglés', tema: ing.titulo, pensum: `Unidad ${ing.unidad} · ${ing.enCurso} · texto pág. ${ing.pagina}`,
      personalId: DEMO.personalId, segundos: 2460, costoUsd: 0.07, costoPorHoraUsd: 0.1, modelo: 'gemini-3.1-flash-lite', demo: true,
      curso: CURSO, creado: ahora - DIA, vence: ahora + 30 * DIA, venceTranscripcion: ahora + 7 * DIA,
      informe: {
        huboClase: true, calidadAudio: 'buena',
        profe: {
          resumen: 'Se leyó "Patricia\'s talents" (pág. 57) y se trabajó el present continuous en preguntas con instrumentos y deportes del lugar. El curso participó mucho cuando se habló del charango y del fútbol del sábado.',
          vistos: ['Lectura "Patricia\'s talents" y sus 3 preguntas (pág. 57)', 'Present continuous: interrogative form, con respuestas cortas (pág. 58)', 'Preguntas en parejas: Is he playing…? Are they playing…?'],
          comparacionPensum: `Se cubrió el primer contenido de la unidad ${ing.unidad}. "${ing.siguiente}" queda para la próxima clase, como estaba en el plan.`,
          pendiente: [ing.siguiente],
          sugerencias: ['La lectura de Patricia enganchó: se puede arrancar la próxima con "¿qué instrumento tocás vos?" en inglés.', 'Un cartel con "Am / Is / Are + sujeto + verbo-ing" ayuda a los que todavía dudan.', 'Cerrar con 3 preguntas rápidas de salida para ver quién lo tiene claro.'],
          tareas: [{ descripcion: 'Escribir 6 preguntas en present continuous sobre deportes y música, con su respuesta corta', para: entrega }],
          avisosCasa: [{ texto: 'Para Música: traer un instrumento autóctono o folclórico si tienen en casa (charango, tarka, bombo…)', para: habil(1) }],
        },
        direccion: { resumen: `Clase de Inglés de ${PILOTO.curso.nombre} sobre el present continuous, con buena participación y trabajo en parejas. Avanza según el plan del 3.er trimestre.`, alertas: [] },
        contexto,
      },
      transcripcion: 'Profe: Good morning! Abran el texto en la página 57, "Patricia\'s talents"…\nAlumno: ¡Profe, el charango!\nProfe: Very good! ¿Y cómo pregunto si ella está tocando el charango ahora?…\n(ejemplo inventado para la demo)',
    },
    contexto: { fecha, materia: 'Inglés', tema: ing.titulo, contexto, creado: ahora - DIA, vence: ahora + 14 * DIA },
  };
}

function tareasDemo() {
  const base = { curso: CURSO, hoy: iso(hoyBo()) };
  const t1 = T.normalizarTarea(
    {
      titulo: 'Questions about sports and music', tipo: 'practica', dias: 2, materia: 'ing',
      consigna: 'Escribí 6 preguntas en present continuous sobre deportes y música (Is your brother playing football? Are they playing the charango?) y respondé cada una con una respuesta corta. Usá la tabla de la página 58.',
      variantes: { apoyo: 'Completá el molde: ___ (Am / Is / Are) + she / they + playing + ___ ? Te damos los verbos: playing, singing, running, dancing.', desafio: 'Además escribí un párrafo de 5 líneas sobre tu música favorita (lo que viene en la unidad): qué escuchás y qué instrumento te gustaría tocar.' },
      criterios: { ser: 'Respeta los gustos musicales y deportivos de los demás.', saber: 'Usa am / is / are según el sujeto y el verbo con -ing.', hacer: 'Escribe las 6 preguntas con su respuesta corta.', autoevaluacion: '¿Puse el verbo to be al principio de cada pregunta?' },
      pistas: ['Fijate quién es el sujeto: he / she → Is; you / they → Are; I → Am.', 'El verbo principal lleva -ing: play → playing, run → running.', 'Mirá la tabla de la página 58 del texto.'],
    },
    { ...base, materia: 'ing', origen: 'clase', tema: HOY.ing.titulo }
  );
  const t2 = T.normalizarTarea(
    {
      titulo: 'Mi proyecto de vida en 5 pasos', tipo: 'proyecto', como: 'texto', dias: 4, materia: 'fil',
      consigna: 'Con lo que leímos en la página 48 sobre autoconocimiento, escribí tu proyecto de vida en 5 pasos: 1) quién soy, 2) qué me gusta y qué hago bien, 3) una meta para el próximo año, 4) qué voy a hacer para lograrla, 5) quién me puede ayudar.',
      variantes: { apoyo: 'Completá frases: "Me gusta…", "Soy bueno/a en…", "El año que viene quiero…", "Para eso voy a…", "Me puede ayudar…".', desafio: 'Sumá una meta a 5 años y conversalo con alguien de tu casa: anotá qué te aconsejó.' },
      criterios: { ser: 'Reflexiona sobre sí mismo con respeto y sinceridad.', saber: 'Explica qué es el autoconocimiento y qué es un proyecto de vida.', hacer: 'Escribe sus 5 pasos con una meta clara.', autoevaluacion: '¿Mi meta es algo que puedo empezar a hacer este mes?' },
      pistas: ['Empezá por lo que te gusta hacer en tu tiempo libre.', 'Una buena meta se puede medir: "leer un libro por mes" mejor que "leer más".', 'Releé la página 48: ¿qué es conocerse a uno mismo?'],
    },
    { ...base, materia: 'fil', origen: 'cronograma', tema: HOY.fil.titulo }
  );
  const asignacion = Object.fromEntries(T.alumnosDemo(CURSO).map((a) => [a.id, T.varianteSugerida(a)]));
  // El alumno demo es uno de los 12 (Jaguar Azul 7): le toca su misma variante.
  asignacion[DEMO.alumnoId] = asignacion[PILOTO.estudiante.alumnoId] || 'base';
  const ahora = Date.now();
  return [
    { id: 'demo-tarea-1', ...t1, asignacion, varianteResto: 'base', personalId: DEMO.personalId, enviada: ahora - 3600e3, vence: ahora + 60 * DIA, demo: true },
    { id: 'demo-tarea-2', ...t2, asignacion, varianteResto: 'base', personalId: DEMO.personalId, enviada: ahora - 2 * 3600e3, vence: ahora + 60 * DIA, demo: true },
  ];
}

// Mapa armado: tres grupos por nivel para el tema de Inglés de hoy (sin apodos: la pantalla los pone).
const TEMA_MAPA = PILOTO.temaMapa;
function mapaDemo() {
  const xs = [...T.alumnosDemo(CURSO)].sort((a, b) => b.avance - a.avance);
  const info = [
    ['Equipo tajibo', 'desafio', 'Ya preguntan en present continuous sin dudar: escriben sobre su música favorita y ayudan a corregir.', 3, 2],
    ['Equipo cusi', 'base', 'Van bien: practican preguntas y respuestas cortas en parejas y comparan con la tabla de la pág. 58.', 2, 2],
    ['Equipo motacú', 'apoyo', 'Están practicando: molde con am / is / are y verbos con -ing, y la profe cerca para acompañar.', 2, 1],
  ];
  const grupos = [xs.slice(0, 4), xs.slice(4, 8), xs.slice(8)].map((al, i) => ({ nombre: info[i][0], variante: info[i][1], porque: info[i][2], alumnos: al.map((a) => a.id), columna: info[i][3], fila: info[i][4] }));
  return { ...T.validarDisposicion({ grupos }, CURSO), objetivo: 'niveles', tema: TEMA_MAPA, resumen: `Tres grupos para ${TEMA_MAPA}, cada uno con la versión de la tarea que le sirve. El grupo de apoyo, adelante.`, actualizado: Date.now() };
}

// Cronograma de la gestión con las áreas del profe; lo anterior al tema de hoy, dado.
function planDemo() {
  const src = readFileSync(resolve(__dirname, '../../maqueta/plan-ejemplo-2do-secundaria.js'), 'utf8');
  const ej = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  const AREAS = PILOTO.materiasProfe;
  const COMPLETO = {
    lun: ['len', 'len', 'mat', 'mat', 'ing', 'ing'], mar: ['bio', 'bio', 'csoc', 'csoc', 'art', 'fil'], mie: ['mat', 'mat', 'len', 'ing', 'mus', 'val'],
    jue: ['bio', 'csoc', 'fil', 'art', 'art', 'efd'], vie: ['mat', 'len', 'bio', 'mus', 'val', 'efd'],
  };
  const horario = Object.fromEntries(Object.entries(COMPLETO).map(([d, xs]) => [d, xs.map((x) => (AREAS.includes(x) ? x : ''))]));
  const estado = P.validarEstado({
    config: { anio: PILOTO.gestion, distrito: PILOTO.distrito, horario, semanaEvaluacion: true, colchon: 0.1 },
    plan: { titulo: `${PILOTO.curso.nombre} · ${PILOTO.colegio.nombre} — textos de aprendizaje del Ministerio`, areas: ej.areas.filter((a) => AREAS.includes(a.id)) },
  });
  // Dado: todo lo anterior al tema de hoy, repartido de febrero a esta semana.
  const hechos = {};
  const inicio = new Date(Date.UTC(PILOTO.gestion, 1, 9)).getTime();
  const fin = hoyBo().getTime() - 7 * DIA;
  for (const a of estado.plan.areas) {
    const idx = a.temas.findIndex((t) => t.id === HOY[a.id]?.temaId);
    const dados = a.temas.slice(0, idx >= 0 ? idx : Math.max(1, a.temas.length - 2));
    dados.forEach((t, i) => {
      const d = new Date(inicio + ((fin - inicio) * (i + 1)) / (dados.length + 1));
      while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1); // día de clase
      hechos[t.id] = iso(d);
    });
  }
  return { ...estado, hechos, plan: { ...estado.plan, advertencias: ['Armado con los índices de los textos de aprendizaje del Ministerio que pasó el profe: a verificar con él.'] }, actualizado: Date.now() };
}

async function cargarDemo(db) {
  // Cuenta demo sin clave (solo entra con la llave del link).
  try {
    await getAuth().updateUser(DEMO.uid, { email: DEMO.email, emailVerified: true });
  } catch {
    await getAuth().createUser({ uid: DEMO.uid, email: DEMO.email, emailVerified: true });
  }
  await db.ref(`edu/uid_alumno/${DEMO.uid}`).set(DEMO.alumnoId);
  await db.ref(`edu/alumnos/${DEMO.alumnoId}`).set({ curso: CURSO, estilo: 'visual', demo: true, limiteSesionesDia: 30 });
  await db.ref(`edu/personal/${DEMO.uid}`).set({ id: DEMO.personalId, roles: { tutor: true, direccion: true }, cursos: { [CURSO]: true }, demo: true });
  await db.ref('edu/demo/llaves').set(llaves);

  // Clase grabada de ejemplo (id fijo) y lo que saben los profes IA de ella.
  const { clase, contexto } = claseDeEjemplo();
  await db.ref(`edu/clases/${CURSO}/demo-clase-1`).set(clase);
  await db.ref(`edu/contexto_dia/${CURSO}/demo-clase-1`).set(contexto);

  // Tareas ya enviadas: parte del curso ficticio ya entregó; el alumno demo arranca con todo pendiente.
  for (const t of tareasDemo()) {
    const { id, ...resto } = t;
    await db.ref(`edu/tareas/${CURSO}/${id}`).set(resto);
    const estados = {};
    T.alumnosDemo(CURSO)
      .filter((a) => a.id !== PILOTO.estudiante.alumnoId)
      .slice(0, id === 'demo-tarea-1' ? 7 : 3)
      .forEach((a) => (estados[a.id] = { estado: 'hecha', fecha: habil(0) }));
    await db.ref(`edu/tareas_estado/${CURSO}/${id}`).set(estados);
  }

  await db.ref(`edu/mapas/${DEMO.personalId}/${CURSO}`).set(mapaDemo());
  // update (no set): se conservan las tarjetas de la mentora ya generadas (caché por tema).
  await db.ref(`edu/planes/${DEMO.personalId}/${CURSO}`).update(planDemo());

  // Cada deploy la demo arranca "como nueva": sin memoria de presentaciones anteriores.
  await db.ref(`edu/memoria/${DEMO.alumnoId}`).remove();
  console.log(`✅ Demo sin login lista: ${PILOTO.colegio.nombre}, ${PILOTO.curso.nombre} (${Object.keys(llaves).length} llave/s, 2 tareas, 1 clase, mapa y cronograma)`);
}

module.exports = { cargarDemo, DEMO, tareasDemo, mapaDemo, planDemo, claseDeEjemplo };
