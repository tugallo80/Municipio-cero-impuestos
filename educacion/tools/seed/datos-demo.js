// ══════════════════════════════════════════════════
//  Demo sin login (EDU.15): cuenta demo fija y datos lindos y coherentes de 2.º de secundaria A.
//  Lo llama crear-cuentas-prueba.js (workflow, cuenta de deploy). Idempotente: cada deploy deja
//  la demo "como nueva", con las fechas corridas a hoy.
//
//  Todo es ficticio. La cuenta demo no tiene clave: solo se entra con el link de la llave
//  (eduDemo → custom token). Gasta de su propia bolsa (edu/uso_demo).
// ══════════════════════════════════════════════════
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { getAuth } = require('firebase-admin/auth');
const T = require('../../services/ai-gateway/tutor/tareas');
const P = require('../../services/ai-gateway/tutor/plan');
const { llaves } = require('./demo.json');

const CURSO = '2do_secundaria';
const DEMO = { uid: 'demo-nande-01', email: 'demo@alumnos.nande-educacion.local', alumnoId: 'alu_demo01', personalId: 'per_demo01' };
const DIA = 864e5;

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

function claseDeEjemplo() {
  const ahora = Date.now();
  const fecha = habil(-1);
  const contexto = {
    temas: ['Simple present: preguntas con do y does sobre rutinas'],
    explicaciones: ['Con he, she e it la pregunta usa does y el verbo va sin -s: Does she play? (no "Does she plays?")', 'Se armó en el pizarrón la rutina de un compañero imaginario: What time does he get up?'],
    tareas: [`Escribir 6 preguntas con do / does para entrevistar a alguien de la casa, para el ${habil(2)}`],
    dudas: ['Por qué con does el verbo pierde la -s'],
  };
  return {
    clase: {
      fecha, materia: 'Lengua extranjera: Inglés', tema: 'The simple present tense', pensum: 'Unidad 1 · Coexistence with events happening in the context',
      personalId: DEMO.personalId, segundos: 2460, costoUsd: 0.07, costoPorHoraUsd: 0.1, modelo: 'gemini-3.1-flash-lite', demo: true,
      curso: CURSO, creado: ahora - DIA, vence: ahora + 30 * DIA, venceTranscripcion: ahora + 7 * DIA,
      informe: {
        huboClase: true, calidadAudio: 'buena',
        profe: {
          resumen: 'Se repasó el simple present y se trabajaron las preguntas con do y does a partir de rutinas reales del curso. Hubo mucha participación en la entrevista en parejas.',
          vistos: ['Afirmativas y negativas con rutinas diarias', 'Preguntas con do / does', 'Entrevista en parejas: What time do you get up?'],
          comparacionPensum: 'Se cubrió lo previsto para la unidad 1. Las respuestas cortas (Yes, I do / No, she doesn\'t) quedaron para la próxima clase.',
          pendiente: ['Respuestas cortas: Yes, I do / No, she doesn\'t'],
          sugerencias: ['La entrevista en parejas funcionó muy bien: se puede repetir con las respuestas cortas.', 'Un cartel con "does + verbo sin -s" en la pared ayuda a los que todavía dudan.', 'Cerrar con 3 preguntas rápidas de salida para ver quién lo tiene claro.'],
          tareas: [{ descripcion: 'Escribir 6 preguntas con do / does para entrevistar a alguien de la casa', para: habil(2) }],
          avisosCasa: [{ texto: 'Traer el diccionario de inglés para la próxima clase', para: habil(2) }],
        },
        direccion: { resumen: 'Clase de Inglés de 2.º A sobre el simple present, con buena participación y trabajo en parejas. Se avanzó según el plan, con un tema corto pendiente.', alertas: [] },
        contexto,
      },
      transcripcion: 'Profe: Good morning! Hoy seguimos con el simple present. ¿Quién me dice una rutina?\nAlumno: I get up at six, profe.\nProfe: Very good! ¿Y cómo pregunto eso a un compañero?…\n(ejemplo inventado para la demo)',
    },
    contexto: { fecha, materia: 'Lengua extranjera: Inglés', tema: 'The simple present tense', contexto, creado: ahora - DIA, vence: ahora + 14 * DIA },
  };
}

function tareasDemo() {
  const base = { curso: CURSO, hoy: iso(hoyBo()) };
  const t1 = T.normalizarTarea(
    {
      titulo: 'Entrevista en casa', tipo: 'practica', dias: 2, materia: 'ing',
      consigna: 'Escribí 6 preguntas con do / does para saber la rutina de alguien de tu casa. Preguntale, anotá sus respuestas y marcá el verbo de cada pregunta.',
      variantes: { apoyo: 'Usá estos verbos: get up, eat, work, sleep. Completá: Do you ___ ? / Does she ___ ?', desafio: 'Además escribí un párrafo corto en inglés contando su rutina, con 2 oraciones negativas.' },
      criterios: { ser: 'Escucha con respeto a la persona que entrevista.', saber: 'Usa do / does según el sujeto y el verbo sin -s después de does.', hacer: 'Escribe y hace las 6 preguntas, y anota las respuestas.', autoevaluacion: '¿Usé does con he, she e it?' },
      pistas: ['Fijate quién es el sujeto: you → do; he / she → does.', 'Después de does el verbo va sin -s: Does she work?', 'Mirá el ejemplo del pizarrón: What time does he get up?'],
    },
    { ...base, materia: 'ing', origen: 'clase', tema: 'The simple present tense' }
  );
  const t2 = T.normalizarTarea(
    {
      titulo: 'Racionales en el mercado', tipo: 'mision', como: 'texto', dias: 4, materia: 'mat',
      consigna: 'En el mercado, un vendedor tiene 3/4 de arroba de papa y vende 2/3 de lo que tiene. ¿Qué fracción de arroba le queda? Mostrá cómo lo pensaste.',
      variantes: { apoyo: 'Dibujá una barra dividida en 12 partes para ver 3/4 y después 2/3 de eso.', desafio: 'Inventá otro problema del mercado con fracciones y resolvelo de dos formas.' },
      criterios: { ser: 'Trabaja con orden y cuida el material.', saber: 'Multiplica y resta fracciones con distinto denominador.', hacer: 'Representa el problema con un dibujo o una barra.', autoevaluacion: '¿Puedo explicar mi resultado a un compañero?' },
      pistas: ['Primero calculá cuánto vende: 2/3 de 3/4.', '"De" en fracciones es multiplicar.', 'Lo que queda = lo que tenía − lo que vendió.'],
    },
    { ...base, materia: 'mat', origen: 'cronograma', tema: 'Números racionales' }
  );
  const asignacion = Object.fromEntries(T.alumnosDemo(CURSO).map((a) => [a.id, T.varianteSugerida(a)]));
  const ahora = Date.now();
  return [
    { id: 'demo-tarea-1', ...t1, asignacion, varianteResto: 'base', personalId: DEMO.personalId, enviada: ahora - 3600e3, vence: ahora + 60 * DIA, demo: true },
    { id: 'demo-tarea-2', ...t2, asignacion, varianteResto: 'base', personalId: DEMO.personalId, enviada: ahora - 2 * 3600e3, vence: ahora + 60 * DIA, demo: true },
  ];
}

// Mapa armado: tres grupos por nivel (sin nombres: la pantalla los pone de su lado).
function mapaDemo() {
  const xs = [...T.alumnosDemo(CURSO)].sort((a, b) => b.avance - a.avance);
  const info = [
    ['Equipo tajibo', 'desafio', 'Ya dominan los números racionales: un desafío extra y explicar cómo lo pensaron.', 3, 2],
    ['Equipo cusi', 'base', 'Van bien: práctica guiada y comparar resultados entre ellos.', 2, 2],
    ['Equipo motacú', 'apoyo', 'Están practicando: material concreto y la profe cerca para acompañar.', 2, 1],
  ];
  const grupos = [xs.slice(0, 4), xs.slice(4, 8), xs.slice(8)].map((al, i) => ({ nombre: info[i][0], variante: info[i][1], porque: info[i][2], alumnos: al.map((a) => a.id), columna: info[i][3], fila: info[i][4] }));
  return { ...T.validarDisposicion({ grupos }, CURSO), objetivo: 'niveles', tema: 'Números racionales', resumen: 'Tres grupos para números racionales, cada uno con la versión de la tarea que le sirve. El grupo de apoyo, adelante.', actualizado: Date.now() };
}

function planDemo() {
  const src = readFileSync(resolve(__dirname, '../../maqueta/plan-ejemplo-2do-secundaria.js'), 'utf8');
  const ej = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  const AREAS = ['ing', 'fil', 'art', 'mus', 'val'];
  const HORARIO = {
    lun: ['', '', '', '', 'ing', 'ing'], mar: ['', '', '', '', 'art', 'fil'], mie: ['', '', '', 'ing', 'mus', 'val'],
    jue: ['', '', 'fil', 'art', 'art', ''], vie: ['', '', '', 'mus', 'val', ''],
  };
  const estado = P.validarEstado({
    config: { anio: 2026, distrito: 'scz_rural_demo', horario: HORARIO, semanaEvaluacion: true, colchon: 0.1 },
    plan: { titulo: ej.titulo, areas: ej.areas.filter((a) => AREAS.includes(a.id)) },
  });
  // Lo ya dado: en noviembre, casi todo el año (lo último queda por delante).
  const hechos = {};
  for (const a of estado.plan.areas) a.temas.slice(0, Math.max(1, a.temas.length - 2)).forEach((t, i) => (hechos[t.id] = habil(-(a.temas.length - i) * 8)));
  return { ...estado, hechos, plan: { ...estado.plan, advertencias: ['Ejemplo armado con los índices de los textos oficiales 2025: a verificar con el profe.'] }, actualizado: Date.now() };
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

  // Tareas ya enviadas: 7 de los 12 ficticios ya la entregaron; el alumno demo arranca con todo pendiente.
  for (const t of tareasDemo()) {
    const { id, ...resto } = t;
    await db.ref(`edu/tareas/${CURSO}/${id}`).set(resto);
    const estados = {};
    T.alumnosDemo(CURSO).slice(0, id === 'demo-tarea-1' ? 7 : 3).forEach((a) => (estados[a.id] = { estado: 'hecha', fecha: habil(0) }));
    await db.ref(`edu/tareas_estado/${CURSO}/${id}`).set(estados);
  }

  await db.ref(`edu/mapas/${DEMO.personalId}/${CURSO}`).set(mapaDemo());
  // update (no set): se conservan las tarjetas de la mentora ya generadas (caché por tema).
  await db.ref(`edu/planes/${DEMO.personalId}/${CURSO}`).update(planDemo());

  // Cada deploy la demo arranca "como nueva": sin charlas ni memoria de presentaciones anteriores.
  await db.ref(`edu/memoria/${DEMO.alumnoId}`).remove();
  console.log(`✅ Demo sin login lista (${Object.keys(llaves).length} llave/s, 2 tareas, 1 clase, mapa y cronograma de ${CURSO})`);
}

module.exports = { cargarDemo, DEMO, tareasDemo, mapaDemo, planDemo, claseDeEjemplo };
