// EDU.16c — Reintentos ante fallas pasajeras de Gemini (sin red).
const test = require('node:test');
const assert = require('node:assert');
const { conReintento, RespuestaVacia, esPasajero } = require('../src/reintento');

const op = { esperaMs: 1, limiteMs: 200, presupuestoMs: 5000 };
const err503 = () => Object.assign(new Error('{"error":{"code":503,"message":"This model is currently experiencing high demand.","status":"UNAVAILABLE"}}'), { status: 503 });

test('503 "high demand" y después bien → reintenta una vez y responde', async () => {
  let n = 0;
  const r = await conReintento(['m1', 'm2'], async (m) => { n++; if (n === 1) throw err503(); return `ok ${m}`; }, op);
  assert.equal(r.valor, 'ok m1');
  assert.equal(r.intentos, 2);
  assert.equal(r.fallas.length, 1);
});

test('respuesta vacía → reintenta', async () => {
  let n = 0;
  const r = await conReintento(['m1'], async () => { n++; if (n === 1) throw new RespuestaVacia(); return 'texto'; }, op);
  assert.equal(r.valor, 'texto');
});

test('dos fallas pasajeras seguidas → error con las dos fallas (sin tercer intento)', async () => {
  let n = 0;
  await assert.rejects(conReintento(['m1', 'm2', 'm3'], async () => { n++; throw err503(); }, op), (e) => e.fallas.length === 2);
  assert.equal(n, 2);
});

test('modelo inexistente no cuenta como intento: pasa al siguiente', async () => {
  const vistos = [];
  const r = await conReintento(['viejo', 'nuevo'], async (m) => { vistos.push(m); if (m === 'viejo') throw new Error('models/viejo is not found'); return 'ok'; }, op);
  assert.deepEqual(vistos, ['viejo', 'nuevo']);
  assert.equal(r.intentos, 1);
});

test('un error que no es pasajero (pedido inválido) no se reintenta', async () => {
  let n = 0;
  await assert.rejects(conReintento(['m1'], async () => { n++; throw new Error('400 INVALID_ARGUMENT: bad schema'); }, op));
  assert.equal(n, 1);
});

test('una llamada colgada se corta por tiempo y se reintenta', async () => {
  let n = 0;
  const t0 = Date.now();
  const r = await conReintento(['m1'], (m, signal) => {
    n++;
    if (n === 1) return new Promise((_, no) => signal.addEventListener('abort', () => no(signal.reason)));
    return Promise.resolve('ok');
  }, { ...op, limiteMs: 80 });
  assert.equal(r.valor, 'ok');
  assert.ok(Date.now() - t0 < 1000);
  assert.match(r.fallas[0], /Tiempo agotado/);
});

test('avisa antes de reintentar (para que la pantalla borre lo que llegó por streaming)', async () => {
  let avisos = 0;
  let n = 0;
  await conReintento(['m1'], async () => { n++; if (n === 1) throw err503(); return 'ok'; }, { ...op, alReintentar: async () => { avisos++; } });
  assert.equal(avisos, 1);
});

test('qué cuenta como pasajero', () => {
  for (const m of ['503 UNAVAILABLE', '429 RESOURCE_EXHAUSTED', 'fetch failed', 'Tiempo agotado', 'The operation was aborted']) assert.ok(esPasajero(new Error(m)), m);
  for (const m of ['400 INVALID_ARGUMENT', 'API key not valid']) assert.ok(!esPasajero(new Error(m)), m);
});
