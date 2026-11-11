// Tareas sugeridas y mapa del curso (EDU.04f), sin red: `npm test`.
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../tutor/tareas');
const { NOMBRES_DEMO } = require('../tutor/clase');

test('el curso demo del servidor no tiene nombres ni avatares, y la IA solo recibe IDs y rasgos', () => {
  const alumnos = T.alumnosDemo('4to_primaria');
  assert.equal(alumnos.length, 12);
  const json = JSON.stringify(T.rasgosParaIA('4to_primaria')) + T.pedidoMapa('4to_primaria', 'parejas', 'Fracciones');
  for (const n of NOMBRES_DEMO['4to_primaria']) for (const parte of n.split(' ')) assert.ok(!json.includes(parte), `se filtró "${parte}"`);
  assert.ok(!/avatar|nombre/.test(JSON.stringify(alumnos)));
  assert.match(json, /"id":"A01"/);
});

test('la instrucción del mapa pide tono positivo y prohíbe etiquetas', () => {
  const t = T.instruccionMapa();
  assert.match(t, /Nunca etiquetes negativamente/);
  assert.match(t, /No sabés sus nombres/);
});

test('normalizarMapa: cada alumno una sola vez, IDs inventados afuera, los que faltan a una mesa abierta, mesas sin repetir', () => {
  const m = T.normalizarMapa(
    {
      resumen: 'ok',
      grupos: [
        { nombre: 'Mesa 1', alumnos: ['A01', 'A03', 'Z99'], porque: 'x', columna: 1, fila: 1 },
        { nombre: 'Mesa 2', alumnos: ['A01', 'A02'], porque: 'y', columna: 1, fila: 1 },
      ],
      atencion: [{ alumno: 'A03', porque: 'bajó' }, { alumno: 'Juan', porque: 'nada' }],
    },
    '4to_primaria'
  );
  const todos = m.grupos.flatMap((g) => g.alumnos);
  assert.equal(new Set(todos).size, 12);
  assert.equal(todos.length, 12);
  assert.ok(!todos.includes('Z99'));
  assert.equal(m.grupos.at(-1).nombre, 'Mesa abierta');
  const lugares = m.grupos.map((g) => `${g.columna}-${g.fila}`);
  assert.equal(new Set(lugares).size, lugares.length);
  assert.deepEqual(m.atencion.map((a) => a.alumno), ['A03']);
});

test('normalizarTarea: tipos, recortes, variantes y entrega en día hábil', () => {
  const t = T.normalizarTarea(
    { titulo: 'x'.repeat(200), consigna: 'Medí la mesa', tipo: 'cualquiera', dias: 2, criterios: { ser: 's' }, variantes: { apoyo: 'con ejemplo' } },
    { curso: '4to_primaria', materia: 'mat', hoy: '2026-11-13', origen: 'clase', tema: 'Medidas' } // viernes + 2 = domingo → lunes
  );
  assert.equal(t.titulo.length, 80);
  assert.equal(t.tipo, 'practica');
  assert.equal(t.entrega, '2026-11-16');
  assert.equal(t.variantes.base, 'Medí la mesa');
  assert.equal(t.variantes.apoyo, 'con ejemplo');
  assert.deepEqual(t.puntos, { ser: 10, saber: 45, hacer: 40, autoevaluacion: 5 });
  assert.equal(t.origen.tipo, 'clase');
});

test('tareaParaAlumno: formato común con EDU.06d y la variante que le toca', () => {
  const t = T.normalizarTarea({ consigna: 'Base', variantes: { apoyo: 'Apoyo', base: 'Base', desafio: 'Desafío' } }, { curso: '4to_primaria', materia: 'mat', hoy: '2026-11-11', origen: 'cronograma', tema: 'Fracciones' });
  const a = T.tareaParaAlumno('-Nabc', { ...t, enviada: 1 }, 'desafio');
  assert.deepEqual(Object.keys(a).sort(), ['autoevaluacion', 'consigna', 'criterios', 'curso', 'entrega', 'enviada', 'id', 'materia', 'origen', 'puntos', 'textoVariante', 'tipo', 'titulo', 'variante'].sort());
  assert.equal(a.textoVariante, 'Desafío');
  assert.equal(T.tareaParaAlumno('x', t, 'inventada').variante, 'base');
  assert.equal(T.varianteSugerida({ avance: 55 }), 'apoyo');
  assert.equal(T.varianteSugerida({ avance: 90 }), 'desafio');
});

test('la instrucción de tareas: tono positivo, sin nombres, con Ser/Saber/Hacer/Autoevaluación', () => {
  const t = T.instruccionTareas();
  assert.match(t, /Sin nombres de alumnos/);
  assert.match(t, /Ser \(10\), Saber \(45\), Hacer \(40\), Autoevaluación \(5\)/);
  assert.match(t, /Nunca etiquetes/);
  const p = T.validarPedidoTareas({ curso: '4to_primaria', materia: 'mat', tema: 'Fracciones', vistos: ['a'], pendiente: ['b'], origen: 'clase' });
  assert.equal(p.ok, true);
  assert.match(T.pedidoTareas(p), /Lo que quedó pendiente:\n- b/);
  assert.equal(T.validarPedidoTareas({ curso: 'x', tema: 'y' }).ok, false);
});
