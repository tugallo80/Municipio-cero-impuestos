// Demo sin login (EDU.15), sin red: `npm test`.
const test = require('node:test');
const assert = require('node:assert/strict');
const { bolsa, tipoDeBolsa, evaluarCuota } = require('../src/cuota');
const { LIMITES } = require('../tutor/config');

test('la demo tiene su propia bolsa de USD 2, aparte de la general y la de pruebas', () => {
  assert.equal(bolsa('demo', LIMITES).ruta, 'edu/uso_demo');
  assert.equal(bolsa('demo', LIMITES).tope, 2);
  assert.equal(bolsa(true, LIMITES).ruta, 'edu/uso_pruebas');
  assert.equal(bolsa(false, LIMITES).ruta, 'edu/uso_global');
  assert.equal(tipoDeBolsa({ demo: true }), 'demo');
  assert.equal(tipoDeBolsa({ pruebaAuto: true, demo: true }), true);
  assert.equal(tipoDeBolsa({}), false);
  assert.equal(tipoDeBolsa(null), false);
});

test('con la bolsa demo agotada se rechaza con motivo tope_demo (la pantalla muestra el ejemplo)', () => {
  const r = evaluarCuota({}, { costoUsd: 2.01 }, LIMITES, 'demo');
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'tope_demo');
  // La general llena no frena a la demo
  assert.equal(evaluarCuota({}, { costoUsd: 0.5 }, LIMITES, 'demo').ok, true);
});

test('en el repo solo está el hash de la llave de la demo', () => {
  const { llaves } = require('../../../tools/seed/demo.json');
  for (const h of Object.values(llaves)) assert.match(h, /^[0-9a-f]{64}$/);
});
