// Cronograma y mentora (EDU.04b), sin red: `npm test`.
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../tutor/plan');

test('normalizarPlan: solo áreas conocidas, títulos recortados, peso y trimestre válidos', () => {
  const r = P.normalizarPlan({
    titulo: 'Plan 4to',
    areas: [
      { area: 'mat', temas: [{ titulo: 'Fracciones', peso: 3, trimestre: 2 }, { titulo: '', peso: 2 }, { titulo: 'x'.repeat(500), peso: 9, trimestre: 7 }] },
      { area: 'inventada', temas: [{ titulo: 'Nada' }] },
    ],
  });
  assert.equal(r.areas.length, 1);
  assert.equal(r.areas[0].temas.length, 2);
  assert.deepEqual(r.areas[0].temas.map((t) => t.id), ['mat-1', 'mat-2']);
  assert.equal(r.areas[0].temas[1].peso, 2);
  assert.equal(r.areas[0].temas[1].trimestre, 0);
  assert.equal(r.areas[0].temas[1].titulo.length, 120);
});

test('validarEstado conserva los IDs al editar y descarta lo que no corresponde', () => {
  const e = P.validarEstado({
    config: { anio: 2099, distrito: '<script>', horario: { lun: ['mat', 'hack', 'len'] }, sinClase: [{ fecha: '2027-04-20', motivo: 'Fiesta' }, { fecha: 'mañana' }] },
    plan: { areas: [{ id: 'mat', temas: [{ id: 'mat-5', titulo: 'B' }, { id: 'mat-2', titulo: 'A' }] }] },
    hechos: { 'mat-5': '2027-03-01', 'x/y': '2027-03-01' },
    perdidos: ['2027-05-03', 'nunca'],
  });
  assert.equal(e.config.anio, 2027);
  assert.equal(e.config.distrito, 'scz_capital');
  assert.deepEqual(e.config.horario.lun, ['mat', '', 'len']);
  assert.equal(e.config.sinClase.length, 1);
  assert.deepEqual(e.plan.areas[0].temas.map((t) => t.id), ['mat-5', 'mat-2']);
  assert.deepEqual(Object.keys(e.hechos), ['mat-5']);
  assert.deepEqual(e.perdidos, ['2027-05-03']);
});

test('la mentora: evaluación de la RM 0001/2026, sin juicios ni nombres', () => {
  const t = P.instruccionMentora();
  assert.match(t, /Ser \(10\), Saber \(45\), Hacer \(40\) y Autoevaluación \(5\)/);
  assert.match(t, /Nunca: puntajes del profe/);
  assert.deepEqual(P.EVALUACION, { ser: 10, saber: 45, hacer: 40, autoevaluacion: 5 });
  const p = P.validarPedidoMentora({ curso: '4to_primaria', area: 'cnat', tema: 'El agua', multigrado: ['3ro_primaria', 'malo'] });
  assert.equal(p.ok, true);
  assert.match(P.pedidoMentora(p), /multigrado con 3ro de primaria/);
  assert.equal(P.validarPedidoMentora({ curso: '4to_primaria', area: 'zzz', tema: 'x' }).ok, false);
  assert.equal(P.claveIdea(p), P.claveIdea({ ...p, tema: 'EL AGUA' }));
});

test('la lectura del PDF ignora nombres y listas de alumnos', () => {
  assert.match(P.instruccionPlan(), /IGNORÁ nombres de personas, listas de alumnos/);
});
