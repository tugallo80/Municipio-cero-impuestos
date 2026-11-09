// ══════════════════════════════════════════════════
//  Cronograma y mentora del profe (EDU.04b): Cloud Functions eduPlan y eduMentora.
//
//  eduPlan    — 'extraer': Gemini lee el PDF del plan y devuelve áreas y temas.
//                El PDF NO se guarda (solo vive en esta llamada).
//               'leer' / 'guardar': el cronograma del profe (config + plan + hechos).
//  eduMentora — una tarjeta de clase por tema (con caché: el mismo tema no se paga dos veces).
//  Solo cuentas de profe (edu/personal) y en sus cursos. Suma al tope global de USD 5/día.
// ══════════════════════════════════════════════════
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenAI } = require('@google/genai');

const plan = require('../tutor/plan');
const { LIMITES } = require('../tutor/config');
const { costoClase } = require('./costos');
const datos = require('./datos');

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const MODELOS = (process.env.EDU_MODELO_PLAN || 'gemini-3.1-flash-lite,gemini-3.1-flash-lite-preview,gemini-2.5-flash-lite,gemini-flash-lite-latest')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const MAX_PDF_BASE64 = 14 * 1024 * 1024; // ~10 MB de PDF
const MAX_PLANES_DIA = 10;
const MAX_IDEAS_DIA = 60;
const CURSO_VALIDO = /^[0-9]{1,2}(ro|do|to|vo|no|mo)_(primaria|secundaria)$/;

function log(evento, campos) {
  console.log(JSON.stringify({ evento, ...campos }));
}

async function profeDeLaCuenta(request, curso) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Necesitás iniciar sesión.');
  const p = await datos.obtenerPersonal(request.auth.uid);
  if (!p || !p.tutor) throw new HttpsError('permission-denied', 'Esta cuenta no es de un profe.');
  if (!CURSO_VALIDO.test(curso || '') || !p.cursos.includes(curso)) throw new HttpsError('permission-denied', 'Ese curso no es tuyo.');
  return p;
}

async function generarJson(partes, sistema, esquema, maxSalida) {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
  let ultimo = null;
  for (const modelo of MODELOS) {
    try {
      const r = await ai.models.generateContent({
        model: modelo,
        contents: [{ role: 'user', parts: partes }],
        config: { systemInstruction: sistema, responseMimeType: 'application/json', responseJsonSchema: esquema, temperature: 0.4, maxOutputTokens: maxSalida },
      });
      let json = null;
      try {
        json = JSON.parse(r.text || '{}');
      } catch {
        json = null;
      }
      return { modelo, json, uso: r.usageMetadata };
    } catch (err) {
      ultimo = err;
      if (/not found|404|is not supported|no longer available|deprecated/i.test(String(err?.message || err))) continue;
      throw err;
    }
  }
  throw ultimo || new Error('Sin modelos');
}

const OPC = { region: 'us-central1', invoker: 'public', secrets: [GEMINI_API_KEY], maxInstances: 5 };

exports.eduPlan = onCall({ ...OPC, timeoutSeconds: 300, memory: '1GiB' }, async (request) => {
  const d = request.data || {};
  const curso = String(d.curso || '');
  const yo = await profeDeLaCuenta(request, curso);
  const accion = String(d.accion || '');

  if (accion === 'leer') {
    const guardado = await datos.leerPlan(yo.id, curso);
    return { ok: true, estado: guardado ? plan.validarEstado(guardado) : null, areas: plan.AREAS, evaluacion: plan.EVALUACION };
  }

  if (accion === 'guardar') {
    const estado = plan.validarEstado(d.estado);
    if (JSON.stringify(estado).length > 300_000) throw new HttpsError('invalid-argument', 'El plan es demasiado grande.');
    await datos.guardarPlan(yo.id, curso, estado);
    return { ok: true, estado };
  }

  if (accion === 'extraer') {
    // Dos formas: el PDF entero (hasta ~10 MB) o el TEXTO de sus primeras páginas, que el
    // navegador saca con pdf.js (libros de 25 MB: se manda solo el índice).
    const pdf = typeof d.pdf === 'string' ? d.pdf : '';
    const textoPlan = typeof d.texto === 'string' ? d.texto.slice(0, plan.MAX_TEXTO) : '';
    if (!textoPlan && pdf.length < 500) throw new HttpsError('invalid-argument', 'No llegó el PDF.');
    if (!textoPlan && pdf.length > MAX_PDF_BASE64) throw new HttpsError('invalid-argument', 'El PDF es muy grande (máximo 10 MB).');
    if (textoPlan && textoPlan.trim().length < 80) throw new HttpsError('invalid-argument', 'El PDF no tiene texto (¿es una foto escaneada?).');
    const reserva = await datos.reservarClase(yo.id, MAX_PLANES_DIA, LIMITES, 'plan', yo.prueba);
    if (!reserva.ok) return { ok: false, motivo: reserva.motivo, error: reserva.mensaje };
    const inicio = Date.now();
    let r;
    try {
      r = await generarJson(
        textoPlan
          ? [{ text: `Curso del profe: ${plan.cursoLegible(curso)}. Texto de las primeras páginas del documento:\n\n${textoPlan}\n\nExtraé el plan.` }]
          : [{ inlineData: { mimeType: 'application/pdf', data: pdf } }, { text: `Curso del profe: ${plan.cursoLegible(curso)}. Extraé el plan.` }],
        plan.instruccionPlan(),
        plan.ESQUEMA_PLAN,
        16384
      );
    } catch (err) {
      log('plan_error', { personalId: yo.id, error: String(err?.message || err).slice(0, 300) });
      throw new HttpsError('unavailable', 'La IA no pudo leer el PDF. Probá de nuevo o con otro archivo.');
    }
    d.pdf = null; // el PDF no se guarda
    const costo = costoClase(r.uso, r.modelo);
    await datos.registrarCostoClase(yo.id, reserva.fecha, costo.costoUsd, 0, 'plan', yo.prueba);
    if (!r.json) throw new HttpsError('unavailable', 'La IA devolvió algo que no se entiende. Probá de nuevo.');
    const extraido = plan.normalizarPlan(r.json);
    const temas = extraido.areas.reduce((a, x) => a + x.temas.length, 0);
    log('plan_extraido', { personalId: yo.id, curso, modelo: r.modelo, forma: textoPlan ? 'texto' : 'pdf', kb: Math.round((textoPlan ? textoPlan.length : (pdf.length * 3) / 4) / 1024), areas: extraido.areas.length, temas, tokens: costo.tokens, costoUsd: costo.costoUsd, ms: Date.now() - inicio });
    return { ok: true, plan: extraido, costoUsd: costo.costoUsd, tokens: costo.totalTokens, modelo: r.modelo };
  }

  throw new HttpsError('invalid-argument', 'Acción desconocida.');
});

exports.eduMentora = onCall({ ...OPC, timeoutSeconds: 60, memory: '256MiB' }, async (request) => {
  const p = plan.validarPedidoMentora(request.data || {});
  if (!p.ok) throw new HttpsError('invalid-argument', p.error);
  const yo = await profeDeLaCuenta(request, p.curso);
  const clave = plan.claveIdea(p);
  const guardada = request.data?.nueva ? null : await datos.leerIdea(yo.id, p.curso, clave);
  if (guardada) return { ok: true, tarjeta: plan.limpiarTarjeta(guardada), deCache: true, costoUsd: 0 };

  const reserva = await datos.reservarClase(yo.id, MAX_IDEAS_DIA, LIMITES, 'mentora', yo.prueba);
  if (!reserva.ok) return { ok: false, motivo: reserva.motivo, error: reserva.mensaje };
  let r;
  try {
    r = await generarJson([{ text: plan.pedidoMentora(p) }], plan.instruccionMentora(), plan.ESQUEMA_MENTORA, 4096);
  } catch (err) {
    log('mentora_error', { personalId: yo.id, error: String(err?.message || err).slice(0, 300) });
    throw new HttpsError('unavailable', 'La mentora no pudo responder. Probá de nuevo.');
  }
  const costo = costoClase(r.uso, r.modelo);
  await datos.registrarCostoClase(yo.id, reserva.fecha, costo.costoUsd, 0, 'mentora', yo.prueba);
  if (!r.json) throw new HttpsError('unavailable', 'La mentora devolvió algo que no se entiende. Probá de nuevo.');
  const tarjeta = plan.limpiarTarjeta(r.json);
  await datos.guardarIdea(yo.id, p.curso, clave, tarjeta);
  log('mentora_tarjeta', { personalId: yo.id, curso: p.curso, area: p.area.id, modelo: r.modelo, tokens: costo.totalTokens, costoUsd: costo.costoUsd });
  return { ok: true, tarjeta, deCache: false, costoUsd: costo.costoUsd };
});
