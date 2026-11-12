// EDU.16 — Tutor 24/7: qué pregunta, qué pedazo de texto recupera y qué contexto manda (sin red).
const test = require('node:test');
const assert = require('node:assert');
const T24 = require('../tutor/tutor24');
const C = require('../tutor/clase');
const profes = require('../tutor/profes');
const { cursoLegible } = require('../tutor/instruccion');

test('reconoce los 6 casos y las señales de riesgo', () => {
  assert.equal(T24.intencion('¿Qué dijo el profe hoy sobre el present continuous?'), 'clase');
  assert.equal(T24.intencion('¿Qué tengo para mañana?'), 'manana');
  assert.equal(T24.intencion('¿Qué tengo que llevar?'), 'llevar');
  assert.equal(T24.intencion('No entiendo esta parte del texto, página 58'), 'texto');
  assert.equal(T24.intencion('¿Qué tenía que decir en casa?'), 'casa');
  assert.equal(T24.intencion('Ayudame con esta tarea'), 'tarea');
  assert.equal(T24.intencion('dame la respuesta de la tarea de inglés'), 'tarea');
  assert.equal(T24.intencion('me siento muy triste, no tengo amigos'), 'emocional');
  assert.equal(T24.intencion('en mi casa me pegan'), 'riesgo');
  assert.equal(T24.intencion('ya no quiero vivir'), 'riesgo');
  assert.equal(T24.intencion('hola'), 'otro');
  // Botones de la presentación
  assert.equal(T24.intencion('¿Qué dijo el profe hoy?'), 'clase');
  assert.equal(T24.intencion('¿Qué llevo?'), 'llevar');
  assert.equal(T24.intencion('No entiendo esta página'), 'texto');
});

test('la respuesta de riesgo deriva a un adulto, dice que es IA y no usa nombres', () => {
  const r = T24.respuestaRiesgo();
  assert.match(r, /IA/);
  assert.match(r, /adulto de confianza/);
  assert.match(r, /110/);
  assert.match(r, /\{PROFE\}/);
});

test('recupera UN tema por página, nunca el libro entero', () => {
  const f = T24.buscarFragmento({ materia: 'ing', pagina: 58, pregunta: 'no entiendo esta parte' });
  assert.equal(f.temaId, 'ing-9');
  assert.equal(f.p0, 57);
  assert.ok(f.texto.length <= T24.MAX_FRAGMENTO + 20, `largo ${f.texto.length}`);
  assert.ok(f.texto.length > 500);
  assert.match(f.texto, /[Pp]resent continuous|Is (he|she)/);
  const libro = require('../tutor/textos/ing.json');
  const total = libro.temas.reduce((n, t) => n + t.parrafos.join('\n').length, 0);
  assert.ok(f.texto.length < total / 10, 'muy chico comparado con el libro');
});

test('recupera por tema, por la página escrita en la pregunta y por palabras', () => {
  assert.equal(T24.buscarFragmento({ tema: 'art-9' }).temaId, 'art-9');
  assert.equal(T24.buscarFragmento({ materia: 'ing', pregunta: 'no entiendo la pág. 57' }).temaId, 'ing-9');
  const r = T24.buscarFragmento({ pregunta: 'cómo se hace el alto relieve en jabón', siempre: true });
  assert.equal(r.area, 'art');
  // Sin pedido concreto y sin coincidencia: no manda nada.
  assert.equal(T24.buscarFragmento({ pregunta: 'hola cómo estás' }), null);
  // Con materia pero sin pista: donde va el curso hoy.
  const hoy = T24.datosDelCurso('2do_secundaria').temasHoy;
  assert.equal(T24.buscarFragmento({ materia: 'fil', temasHoy: hoy, pregunta: 'explicame' }).temaId, hoy.fil.temaId);
  // Un área sin texto (solo índice) lo dice: texto vacío.
  const bio = T24.buscarFragmento({ materia: 'bio', pregunta: 'biomas', siempre: true });
  assert.ok(!bio || bio.texto === '');
});

test('valida lo que manda el navegador (texto acotado, solo IDs)', () => {
  assert.equal(T24.validarPedido({}).ok, false);
  const p = T24.validarPedido({ pregunta: 'x'.repeat(2000), foco: { materia: 'ing<script>', tema: 'ing-9', pagina: 5000, tarea: '../../x' }, historial: Array(30).fill({ rol: 'tutor', texto: 'y'.repeat(2000) }) });
  assert.equal(p.pregunta.length, 500);
  assert.equal(p.foco.materia, null);
  assert.equal(p.foco.tema, 'ing-9');
  assert.equal(p.foco.pagina, null);
  assert.equal(p.foco.tarea, null);
  assert.equal(p.historial.length, 8);
  assert.equal(p.historial[0].texto.length, 600);
});

test('el contexto trae su vida escolar real y ningún nombre', () => {
  const est = T24.datosDelCurso('2do_secundaria');
  const clase = C.completarInforme({ contexto: { temas: ['Present continuous en preguntas'], explicaciones: ['Is she playing…?'], tareas: ['6 preguntas'], dudas: [], avisosCasa: ['Traer un instrumento autóctono para Música'], llevar: ['Cuaderno de inglés'] } }).contexto;
  const ctx = T24.armarContexto({
    curso: '2do_secundaria',
    est,
    tareas: est.tareasDemo,
    clases: [{ fecha: '2026-11-11', materia: 'Inglés', tema: 'Musical instruments and sports', contexto: clase }],
    fragmento: T24.buscarFragmento({ materia: 'ing', pagina: 58 }),
    foco: { materia: 'ing', pagina: 58, tarea: 'demo-tarea-1' },
  });
  for (const x of ['# Hoy', '# Horario', 'U.E. Nuevo Horizonte', 'Questions about sports and music', 'LA TIENE ABIERTA AHORA', 'Escalera de su profe', 'Pidió avisar en casa', 'Traer un instrumento', '# Avisos para la casa', '# Qué llevar', '# Se viene', '# Texto oficial', 'Musical instruments and sports', '{PROFE}']) {
    assert.ok(ctx.includes(x), `falta "${x}"`);
  }
  for (const n of C.NOMBRES_DEMO['2do_secundaria']) assert.ok(!ctx.includes(n.split(' ')[0] + ' '), `nombre ${n}`);
  assert.ok(!/Jaguar Azul/.test(ctx), 'sin apodo del alumno');
  assert.ok(ctx.length < 16000, `contexto ${ctx.length} caracteres`);
});

test('fechas: días hábiles desde hoy, como la app', () => {
  const lunes = Date.UTC(2026, 10, 16, 15); // lunes 16-nov-2026 11:00 en Bolivia
  assert.equal(T24.habil(1, lunes), '2026-11-17');
  assert.equal(T24.habil(5, lunes), '2026-11-23');
  const viernes = Date.UTC(2026, 10, 13, 15);
  assert.equal(T24.habil(1, viernes), '2026-11-16');
  const ctx = T24.armarContexto({ curso: '2do_secundaria', est: T24.datosDelCurso('2do_secundaria', viernes), ahora: viernes, tareas: [] });
  assert.match(ctx, /viernes 13 de noviembre/);
  assert.match(ctx, /próximo día de clase es lunes 16 de noviembre/);
});

test('instrucción: es IA, no hace la tarea, deriva lo emocional, usa {PROFE}', () => {
  const s = T24.instruccionTutor({ curso: '2do_secundaria', profe: 'el_profe' });
  assert.match(s, /el profe Tomatao/);
  assert.ok(!/taji|jochi/i.test(s));
  assert.match(s, /inteligencia artificial/);
  assert.match(s, /no la hacés/);
  assert.match(s, /adulto de confianza/);
  assert.match(s, /\{PROFE\}/);
  assert.match(s, /2do de secundaria/);
});

test('lo que vuelve de la IA: sin nombres y con el marcador normalizado', () => {
  const t = T24.limpiarRespuesta('# Hola\nComo dijo { profe }, Mateo Rojas ya lo hizo.', '2do_secundaria');
  assert.ok(!/Mateo/.test(t));
  assert.match(t, /\{PROFE\}/);
  assert.ok(!t.startsWith('#'));
});

test('conversación: empieza con el alumno y termina con la pregunta', () => {
  const c = T24.armarConversacion([{ rol: 'tutor', texto: '¡Hola!' }, { rol: 'alumno', texto: 'no entiendo' }, { rol: 'tutor', texto: '¿Qué parte?' }], 'la 58');
  assert.equal(c[0].role, 'user');
  assert.equal(c[c.length - 1].parts[0].text, 'la 58');
});

test('la voz recibe el mismo contexto, sin el marcador y con el texto más corto', () => {
  const est = T24.datosDelCurso('2do_secundaria');
  const v = T24.contextoParaVoz({ curso: '2do_secundaria', est, tareas: est.tareasDemo, clases: [], fragmento: T24.buscarFragmento({ materia: 'ing', pagina: 58 }) });
  assert.ok(!v.includes('{PROFE}'));
  assert.match(v, /modo tutor a cualquier hora/);
  const i = profes.construirInstruccionProfe('la_profe', { curso: '2do_secundaria' }, { tutor: v, cursoLegible });
  assert.match(i, /modo tutor a cualquier hora/);
  assert.ok(i.length < 20000);
});

test('clase grabada: el informe trae "avisar en casa" y "traer"', () => {
  assert.ok(C.ESQUEMA_INFORME.properties.contexto.required.includes('avisos_casa'));
  const inf = C.limpiarInforme({ hubo_clase: true, contexto: { temas: ['x'], avisos_casa: ['Avisar en casa que el viernes hay reunión, dijo Mateo Rojas'], llevar: ['Traer charango'] } }, C.NOMBRES_DEMO['2do_secundaria']);
  assert.deepEqual(inf.contexto.llevar, ['Traer charango']);
  assert.ok(!/Mateo/.test(inf.contexto.avisosCasa[0]));
  const txt = C.textoClasesParaTutor([{ fecha: '2026-11-11', materia: 'Música', contexto: inf.contexto }]);
  assert.match(txt, /Pidió avisar en casa/);
  assert.match(txt, /Pidió traer/);
});

test('los textos del servidor están al día con los del lector', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const dir = path.join(__dirname, '../../../maqueta/textos');
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json') && x !== 'indice.json')) {
    const a = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const b = require(`../tutor/textos/${f}`);
    assert.equal(JSON.stringify(a.temas.map((t) => t.parrafos || [])), JSON.stringify(b.temas.map((t) => t.parrafos)), `${f}: correr tools/datos/copiar-textos-tutor.mjs`);
  }
});

test('reconoce la materia nombrada en la pregunta', () => {
  assert.equal(T24.materiaDe('ayudame con la tarea de inglés'), 'ing');
  assert.equal(T24.materiaDe('no entiendo la pág. 40 de Artes'), 'art');
  assert.equal(T24.materiaDe('¿qué llevo para Ed. Física?'), 'efd');
  assert.equal(T24.materiaDe('hola'), null);
  assert.equal(T24.buscarFragmento({ pregunta: 'no entiendo la pág. 40 de Artes' }).area, 'art');
});

test('los pedacitos del streaming conservan los espacios', () => {
  const partes = ['Hola, ', 'como dijo { profe }', ' vos ', 'podés.'];
  assert.equal(partes.map((x) => T24.limpiarPedazo(x, '2do_secundaria')).join(''), 'Hola, como dijo {PROFE} vos podés.');
});

test('EDU.16b: nombres de los profes IA configurables y validados', () => {
  const IA = require('../tutor/nombres-ia');
  const profesMod = require('../tutor/profes');
  assert.deepEqual(IA.nombresIA(), { varon: 'Tomatao', mujer: 'Tomatina' });
  assert.deepEqual(IA.nombresIA({ varon: 'Pepe', mujer: '<script>' }), { varon: 'Pepe', mujer: 'Tomatina' });
  assert.equal(IA.nombresIA({ varon: 'x'.repeat(21) }).varon, 'Tomatao');
  const v = profesMod.construirInstruccionProfe('el_profe', { curso: '2do_secundaria' }, { ia: { varon: 'Pepe', mujer: 'Ana' }, cursoLegible });
  assert.match(v, /Sos \*\*el profe Pepe\*\*/);
  assert.match(v, /la profe Ana/);
  assert.ok(!/\bTaji\b|\bJochi\b/.test(v));
  const t = T24.instruccionTutor({ curso: '2do_secundaria', profe: 'la_profe', ia: { varon: 'Pepe', mujer: 'Ana' } });
  assert.match(t, /Soy la profe Ana/);
  assert.deepEqual(profesMod.profesPublicos().map((p) => p.titulo), ['la profe Tomatina', 'el profe Tomatao']);
  const est = T24.datosDelCurso('2do_secundaria');
  assert.equal(T24.profeDeMateria(est, 'ing'), 'el_profe');
  assert.equal(T24.profeDeMateria(est, 'mat'), 'la_profe');
  const voz = T24.contextoParaVoz({ curso: '2do_secundaria', est, tareas: [], clases: [] }, { varon: 'Pepe', mujer: 'Ana' });
  assert.ok(!/\{IA_/.test(voz));
});
