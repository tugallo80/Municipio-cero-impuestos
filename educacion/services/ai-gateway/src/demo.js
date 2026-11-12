// ══════════════════════════════════════════════════
//  Demo sin login (EDU.15): Cloud Function eduDemo.
//
//  El link de la presentación lleva una llave (?demo=<llave> o #demo=<llave>). La pantalla se la
//  manda a eduDemo, que la compara con los hashes SHA-256 guardados en edu/demo/llaves/{nombre}
//  (los carga el workflow desde tools/seed/demo.json; la llave en sí nunca está en el repo) y,
//  si coincide, devuelve un "custom token" de Firebase para la cuenta demo fija.
//
//  La cuenta demo es alumno de 2do_secundaria y profe/dirección demo del mismo curso, con datos
//  ficticios, y gasta de su propia bolsa (edu/uso_demo, USD 2/día). No ve datos de nadie más.
//  Rotar la llave: cambiar el hash en tools/seed/demo.json y hacer push (las Functions no cambian).
// ══════════════════════════════════════════════════
const crypto = require('node:crypto');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getAuth } = require('firebase-admin/auth');
const datos = require('./datos');
const { fechaBolivia } = require('./cuota');

const UID_DEMO = 'demo-nande-01';
const LLAVE_OK = /^[A-Za-z0-9_-]{16,80}$/;
const MAX_FALLOS_DIA = 300; // freno simple contra quien pruebe llaves al azar (son de 128 bits igual)

const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

function iguales(a, b) {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

function log(evento, campos) {
  console.log(JSON.stringify({ evento, ...campos }));
}

exports.UID_DEMO = UID_DEMO;
exports.sha256 = sha256;

exports.eduDemo = onCall({ region: 'us-central1', invoker: 'public', maxInstances: 5, timeoutSeconds: 20, memory: '256MiB' }, async (request) => {
  const llave = String(request.data?.llave || '').trim();
  const fecha = fechaBolivia();
  if ((await datos.fallosDemo(fecha)) >= MAX_FALLOS_DIA) throw new HttpsError('resource-exhausted', 'La demo no está disponible por hoy.');
  if (!LLAVE_OK.test(llave)) {
    await datos.sumarFalloDemo(fecha);
    throw new HttpsError('permission-denied', 'Ese link de demo no es válido.');
  }
  const hashes = await datos.hashesDemo();
  const h = sha256(llave);
  const nombre = Object.keys(hashes).find((k) => typeof hashes[k] === 'string' && iguales(hashes[k], h));
  if (!nombre) {
    await datos.sumarFalloDemo(fecha);
    log('demo_llave_mala', { fecha });
    throw new HttpsError('permission-denied', 'Ese link de demo ya no sirve. Pedí uno nuevo.');
  }
  let token;
  try {
    token = await getAuth(datos.appAdmin()).createCustomToken(UID_DEMO, { demo: true });
  } catch (err) {
    // Falta el permiso para firmar (paso 5c de tools/cloudshell/configurar-nande.sh).
    log('demo_sin_firma', { error: String(err?.message || err).slice(0, 300) });
    throw new HttpsError('failed-precondition', 'La demo todavía no está habilitada en el servidor.');
  }
  log('demo_entrada', { llave: nombre, fecha });
  return { ok: true, token, uid: UID_DEMO };
});
