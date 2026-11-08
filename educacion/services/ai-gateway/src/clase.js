// ══════════════════════════════════════════════════
//  Clase grabada (EDU.04a): Cloud Functions eduClase y eduClases.
//
//  eduClase  — el profe manda el audio de su clase (base64). Gemini lo escucha una
//              vez y devuelve el informe. El audio vive solo en la memoria de esta
//              llamada: NO se guarda en ningún lado (ni base, ni Storage, ni logs).
//  eduClases — listar / borrar informes. El profe y la dirección ven EXACTAMENTE el
//              mismo informe (no hay una versión "solo para la dirección").
// ══════════════════════════════════════════════════
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenAI } = require('@google/genai');

const clase = require('../tutor/clase');
const { LIMITES } = require('../tutor/config');
const { costoClase } = require('./costos');
const datos = require('./datos');

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

// Modelos de audio más baratos, en orden. Si Google da de baja uno (404), se prueba el siguiente.
const MODELOS_CLASE = (process.env.EDU_MODELO_CLASE || 'gemini-3.1-flash-lite,gemini-3.1-flash-lite-preview,gemini-2.5-flash-lite,gemini-flash-lite-latest')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const MAX_MINUTOS_CLASE = Number(process.env.EDU_MAX_MINUTOS_CLASE) > 0 ? Number(process.env.EDU_MAX_MINUTOS_CLASE) : 75;
const MAX_CLASES_DIA = Number(process.env.EDU_MAX_CLASES_DIA) > 0 ? Number(process.env.EDU_MAX_CLASES_DIA) : 8;
// Audio en base64: ~16 kbps × 75 min ≈ 12 MB. Gemini acepta hasta ~20 MB por pedido.
const MAX_BASE64 = 18 * 1024 * 1024;

function log(evento, campos) {
  console.log(JSON.stringify({ evento, ...campos }));
}

async function personalDeLaCuenta(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Necesitás iniciar sesión.');
  const p = await datos.obtenerPersonal(request.auth.uid);
  if (!p) throw new HttpsError('permission-denied', 'Esta cuenta no es de un profe ni de la dirección.');
  return p;
}

// Lo que se manda al navegador: el mismo informe para el profe y para la dirección.
function publico(c) {
  return {
    id: c.id,
    curso: c.curso,
    fecha: c.fecha,
    materia: c.materia,
    tema: c.tema || '',
    pensum: c.pensum || '',
    segundos: c.segundos || 0,
    creado: c.creado,
    vence: c.vence,
    venceTranscripcion: c.venceTranscripcion,
    modelo: c.modelo,
    costoUsd: c.costoUsd,
    informe: clase.completarInforme(c.informe),
    transcripcion: c.transcripcion || '',
  };
}

async function generar(ai, pedido, audio, mime, contenido) {
  let ultimoError = null;
  for (const modelo of MODELOS_CLASE) {
    try {
      const r = await ai.models.generateContent({
        model: modelo,
        contents: [
          {
            role: 'user',
            parts: [{ inlineData: { mimeType: mime, data: audio } }, { text: clase.pedidoClase(pedido, contenido) }],
          },
        ],
        config: {
          systemInstruction: clase.instruccionClase(),
          responseMimeType: 'application/json',
          responseJsonSchema: clase.ESQUEMA_INFORME,
          temperature: 0.3,
          maxOutputTokens: 32768,
        },
      });
      return { modelo, r };
    } catch (err) {
      ultimoError = err;
      const msg = String(err?.message || err);
      // Modelo inexistente o dado de baja → probar el siguiente. Otro error → cortar.
      if (/not found|404|is not supported|no longer available|deprecated/i.test(msg)) {
        log('clase_modelo_no_disponible', { modelo, error: msg.slice(0, 200) });
        continue;
      }
      throw err;
    }
  }
  throw ultimoError || new Error('Sin modelos');
}

exports.eduClase = onCall(
  { region: 'us-central1', invoker: 'public', secrets: [GEMINI_API_KEY], timeoutSeconds: 540, memory: '1GiB', maxInstances: 5 },
  async (request) => {
    const yo = await personalDeLaCuenta(request);
    if (!yo.tutor) throw new HttpsError('permission-denied', 'Solo un profe puede grabar su clase.');
    const p = clase.validarPedido(request.data || {});
    if (!p.ok) throw new HttpsError('invalid-argument', p.error);
    if (!yo.cursos.includes(p.curso)) throw new HttpsError('permission-denied', 'Ese curso no es tuyo.');
    // El audio pesa ~2 KB por segundo (16 kbps): si dice durar más de lo que pesa, se usa lo que pesa.
    const audio = request.data.audio;
    if (audio.length > MAX_BASE64) throw new HttpsError('invalid-argument', `La grabación es muy larga (máximo ${MAX_MINUTOS_CLASE} minutos).`);
    if (p.segundos > MAX_MINUTOS_CLASE * 60 + 60) throw new HttpsError('invalid-argument', `Máximo ${MAX_MINUTOS_CLASE} minutos por clase.`);

    const reserva = await datos.reservarClase(yo.id, MAX_CLASES_DIA, LIMITES.costoGlobalDiaUsd);
    if (!reserva.ok) {
      log('clase_cuota_agotada', { personalId: yo.id, motivo: reserva.motivo });
      return { ok: false, motivo: reserva.motivo, error: reserva.mensaje };
    }

    const inicio = Date.now();
    const contenido = await datos.obtenerContenido(p.curso);
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
    let resultado;
    try {
      resultado = await generar(ai, p, audio, p.mime, contenido);
    } catch (err) {
      log('clase_error', { personalId: yo.id, curso: p.curso, error: String(err?.message || err).slice(0, 300) });
      throw new HttpsError('unavailable', 'La IA no pudo escuchar la clase. Probá de nuevo en un rato.');
    }
    // Desde acá el audio ya no se usa: se suelta la referencia (no queda copia).
    request.data.audio = null;

    const { modelo, r } = resultado;
    let crudo = null;
    try {
      crudo = JSON.parse(r.text || '{}');
    } catch {
      crudo = null;
    }
    const costo = costoClase(r.usageMetadata, modelo);
    await datos.registrarCostoClase(yo.id, reserva.fecha, costo.costoUsd, p.segundos);
    if (!crudo) {
      log('clase_json_invalido', { personalId: yo.id, modelo, costoUsd: costo.costoUsd });
      throw new HttpsError('unavailable', 'La IA devolvió algo que no se entiende. Probá de nuevo.');
    }

    const nombres = clase.NOMBRES_DEMO[p.curso] || [];
    const informe = clase.limpiarInforme(crudo, nombres);
    const registro = {
      fecha: reserva.fecha,
      materia: p.materia,
      tema: p.tema,
      pensum: p.pensum,
      segundos: Math.round(p.segundos),
      personalId: yo.id,
      modelo,
      costoUsd: costo.costoUsd,
      tokens: costo.totalTokens,
      informe,
    };
    const id = await datos.guardarClase(p.curso, registro);
    const minutos = p.segundos / 60;
    log('clase_resumida', {
      personalId: yo.id,
      curso: p.curso,
      claseId: id,
      modelo,
      segundos: Math.round(p.segundos),
      kbAudio: Math.round((audio.length * 3) / 4 / 1024),
      tokens: costo.tokens,
      totalTokens: costo.totalTokens,
      costoUsd: costo.costoUsd,
      costoPorHoraUsd: minutos > 0 ? Math.round((costo.costoUsd / minutos) * 60 * 1e4) / 1e4 : 0,
      precios: costo.precios,
      alertas: informe.direccion.alertas.length,
      huboClase: informe.huboClase,
      msGemini: Date.now() - inicio,
    });

    const guardada = await datos.obtenerClase(p.curso, id);
    return {
      ok: true,
      clase: publico({ id, ...guardada }),
      costoUsd: costo.costoUsd,
      costoPorHoraUsd: minutos > 0 ? Math.round((costo.costoUsd / minutos) * 60 * 1e4) / 1e4 : null,
      tokens: costo.totalTokens,
    };
  }
);

exports.eduClases = // invoker public: cualquiera puede LLAMARLA, pero la Function exige cuenta de profe/dirección.
exports.eduClases = onCall({ region: 'us-central1', invoker: 'public', timeoutSeconds: 30, memory: '256MiB', maxInstances: 10 }, async (request) => {
  const yo = await personalDeLaCuenta(request);
  const accion = String(request.data?.accion || 'listar');
  if (accion === 'listar') {
    const clases = await datos.listarClases(yo.cursos);
    return { ok: true, roles: { tutor: yo.tutor, direccion: yo.direccion }, cursos: yo.cursos, clases: clases.map(publico) };
  }
  if (accion === 'borrar') {
    const curso = String(request.data?.curso || '');
    const id = String(request.data?.id || '');
    if (!yo.cursos.includes(curso)) throw new HttpsError('permission-denied', 'Ese curso no es tuyo.');
    const c = await datos.obtenerClase(curso, id);
    if (!c) return { ok: true };
    // Lo borra el profe que la grabó o la dirección.
    if (c.personalId !== yo.id && !yo.direccion) throw new HttpsError('permission-denied', 'Solo quien la grabó o la dirección la pueden borrar.');
    await datos.borrarClase(curso, id);
    log('clase_borrada', { personalId: yo.id, curso, claseId: id });
    return { ok: true };
  }
  throw new HttpsError('invalid-argument', 'Acción desconocida.');
});
