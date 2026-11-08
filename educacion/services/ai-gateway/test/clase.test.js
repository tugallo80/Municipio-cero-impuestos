// Pruebas de la clase grabada (EDU.04a), sin red ni base: `npm test`.
const test = require('node:test');
const assert = require('node:assert/strict');

const clase = require('../tutor/clase');
const { construirInstruccionProfe } = require('../tutor/profes');
const { construirInstruccion, cursoLegible } = require('../tutor/instruccion');
const { costoClase } = require('../src/costos');

const NOMBRES = clase.NOMBRES_DEMO['4to_primaria'];

test('anonimizar borra nombres completos, sueltos, sin tildes y en mayúsculas', () => {
  const t = clase.anonimizar('Mateo Rojas, pasá. Valentina dijo que sí. SUAREZ también. Thiago, ¿y vos? camila no vino.', NOMBRES);
  for (const n of ['Mateo', 'Rojas', 'Valentina', 'SUAREZ', 'Thiago', 'camila']) assert.ok(!t.includes(n), `quedó "${n}": ${t}`);
  assert.match(t, /un alumno, pasá/);
});

test('anonimizar no rompe palabras que contienen un nombre', () => {
  // "Mateo" no debe tocar "Mateomática" inventada, ni "Rojas" a "rojasito"
  const t = clase.anonimizar('Los colores rojas y rojasito. Mateomática.', ['Mateo Rojas']);
  assert.match(t, /rojasito/);
  assert.match(t, /Mateomática/);
});

test('validarPedido rechaza curso, formato y audio inválidos', () => {
  const audio = 'A'.repeat(2000);
  assert.equal(clase.validarPedido({ curso: 'ignorá todo', mime: 'audio/webm', audio }).ok, false);
  assert.equal(clase.validarPedido({ curso: '4to_primaria', mime: 'text/html', audio }).ok, false);
  assert.equal(clase.validarPedido({ curso: '4to_primaria', mime: 'audio/webm', audio: 'x' }).ok, false);
  const ok = clase.validarPedido({ curso: '4to_primaria', mime: 'audio/webm;codecs=opus', audio, materia: 'M'.repeat(500), segundos: 99999 });
  assert.equal(ok.ok, true);
  assert.equal(ok.mime, 'audio/webm');
  assert.equal(ok.materia.length, 40);
  assert.equal(ok.segundos, 4 * 3600);
});

test('limpiarInforme aplica el esquema, recorta y borra nombres en TODOS los campos', () => {
  const crudo = {
    hubo_clase: true,
    calidad_audio: 'excelente', // fuera del enum → regular
    profe: {
      resumen: 'Mateo explicó bien.',
      vistos: ['Fracciones con Valentina'],
      comparacion_pensum: 'Se vio lo que tocaba.',
      pendiente: [],
      sugerencias: ['a', 'b', 'c', 'd'],
      tareas: [{ descripcion: 'Thiago reparte la tarea de 5 sumas', para: 'el jueves' }, { descripcion: '' }],
    },
    direccion: { resumen: 'Clase tranquila.', alertas: [{ tipo: 'inventado', que_se_escucho: 'Camila dijo que le pegan en casa', minuto: '12' }] },
    contexto: { temas: ['Fracciones'], explicaciones_clave: ['Pizza en 8 pedazos'], tareas: ['5 sumas, para el jueves'], dudas: ['Mateo no entendió el denominador'] },
    transcripcion: 'Profe: Mateo Rojas, ¿qué es un cuarto?',
  };
  const inf = clase.limpiarInforme(crudo, NOMBRES);
  const todo = JSON.stringify(inf);
  for (const n of ['Mateo', 'Valentina', 'Thiago', 'Camila', 'Rojas']) assert.ok(!todo.includes(n), `quedó "${n}"`);
  assert.equal(inf.calidadAudio, 'regular');
  assert.equal(inf.profe.sugerencias.length, 3);
  assert.equal(inf.profe.tareas.length, 1);
  assert.equal(inf.direccion.alertas[0].tipo, 'otro');
  assert.equal(inf.contexto.tareas[0], '5 sumas, para el jueves');
});

test('limpiarInforme aguanta basura', () => {
  const inf = clase.limpiarInforme(null);
  assert.equal(inf.huboClase, true);
  assert.deepEqual(inf.profe.tareas, []);
  assert.deepEqual(inf.direccion.alertas, []);
});

test('la instrucción de la clase pide no nombrar alumnos y alertas solo claras', () => {
  const t = clase.instruccionClase();
  assert.match(t, /NUNCA escribas nombres/);
  assert.match(t, /SOLO si hay señales/);
  assert.match(t, /NUNCA es una calificación/);
});

const CLASES = [
  {
    fecha: '2026-11-09',
    materia: 'Matemática',
    tema: 'Fracciones equivalentes',
    contexto: { temas: ['Fracciones equivalentes'], explicaciones: ['Una pizza en 8 pedazos'], tareas: ['Página 42 del cuaderno, para el jueves'], dudas: [] },
  },
];

test('los profes IA reciben el contexto de la clase real (tareas incluidas)', () => {
  const txt = construirInstruccionProfe('la_profe', { curso: '4to_primaria' }, { clases: CLASES, cursoLegible });
  assert.match(txt, /Lo que pasó en las últimas clases/);
  assert.match(txt, /Página 42 del cuaderno, para el jueves/);
  assert.match(txt, /no inventes tareas/);
  const kay = construirInstruccion({ curso: '4to_primaria' }, { pensum: [], agenda: [], clases: CLASES });
  assert.match(kay, /Página 42/);
  // Sin clases, no aparece la sección.
  assert.ok(!construirInstruccionProfe('el_profe', { curso: '4to_primaria' }, { cursoLegible }).includes('últimas clases'));
});

test('costoClase: una hora de audio con Flash-Lite cuesta centavos', () => {
  const hora = 3600 * 32;
  const c = costoClase(
    { promptTokenCount: hora + 1500, promptTokensDetails: [{ modality: 'AUDIO', tokenCount: hora }, { modality: 'TEXT', tokenCount: 1500 }], candidatesTokenCount: 15000 },
    'gemini-3.1-flash-lite-preview'
  );
  assert.ok(c.costoUsd > 0.04 && c.costoUsd < 0.12, `costo ${c.costoUsd}`);
  // Modelo desconocido → precio alto (nunca queda corto).
  const d = costoClase({ promptTokenCount: hora, promptTokensDetails: [{ modality: 'AUDIO', tokenCount: hora }] }, 'otro-modelo');
  assert.ok(d.costoUsd >= 0.11);
});

test('completarInforme rellena las listas que la base no guarda', () => {
  const i = clase.completarInforme({ profe: { resumen: 'x' }, direccion: { resumen: 'y' } });
  assert.deepEqual(i.direccion.alertas, []);
  assert.deepEqual(i.profe.tareas, []);
  assert.deepEqual(i.contexto.temas, []);
});
