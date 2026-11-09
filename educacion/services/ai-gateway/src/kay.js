// ══════════════════════════════════════════════════
//  Cloud Functions del tutor de voz Kay (codebase "educacion").
//  Migrado de rubikeduai-backend, rama claude/dashboard-hijos-kay, functions/kay.js
//  (commit bbf7789), con estos cambios:
//   - La instrucción de sistema se arma EN EL SERVIDOR y queda bloqueada dentro del
//     token efímero (liveConnectConstraints): el navegador no la ve ni la puede cambiar.
//   - Al modelo no llega el nombre del alumno: solo curso, estilo y contenido.
//   - Cuota diaria por alumno + tope de costo global, y registro de tokens/costo por minuto.
// ══════════════════════════════════════════════════
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenAI, Modality } = require('@google/genai');

const { MODELO_KAY, VOCES, VOZ_POR_DEFECTO, LIMITES } = require('../tutor/config');
const { construirInstruccion, HERRAMIENTAS, cursoLegible } = require('../tutor/instruccion');
const profes = require('../tutor/profes');
const { resumirUso, PRECIOS_USD_POR_MILLON } = require('./costos');
const datos = require('./datos');

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const OPCIONES = { region: 'us-central1', secrets: [GEMINI_API_KEY], timeoutSeconds: 30, memory: '256MiB', maxInstances: 10 };

// Log estructurado: en Cloud Logging queda como jsonPayload, fácil de filtrar
// (jsonPayload.evento="kay_uso"). Nunca loguear nombres, tokens ni secretos.
function log(evento, campos) {
  console.log(JSON.stringify({ evento, ...campos }));
}

async function alumnoDeLaCuenta(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Necesitás iniciar sesión.');
  const alumno = await datos.obtenerAlumno(request.auth.uid);
  if (!alumno) throw new HttpsError('permission-denied', 'Esta cuenta no tiene perfil de alumno.');
  return alumno;
}

// Pide un token efímero para hablar por voz.
//  - Con `profe` ('la_profe' | 'el_profe'): uno de los dos profes (EDU.02b), con su voz
//    fija, la misión en la que está el alumno (`mision`: solo IDs y números) y la
//    memoria compartida. `relevoDe`: sesión anterior si es un cambio de profe.
//  - Sin `profe`: Kay con la voz elegida (página técnica /prueba-motor/, EDU.02).
exports.eduKayToken = onCall(OPCIONES, async (request) => {
  const { alumnoId, perfil, limites: propios, prueba } = await alumnoDeLaCuenta(request);
  // Los topes de costo diario (general y de pruebas) no se pueden cambiar por cuenta.
  const limites = { ...LIMITES, ...propios, costoGlobalDiaUsd: LIMITES.costoGlobalDiaUsd, costoPruebasDiaUsd: LIMITES.costoPruebasDiaUsd };
  const profe = profes.profePorId(String(request.data?.profe || ''));
  const pedida = String(request.data?.voz || '');
  const voz = profe ? profe.voz : VOCES.some((v) => v.id === pedida) ? pedida : VOZ_POR_DEFECTO;
  const mision = profe ? profes.validarMision(request.data?.mision) : null;
  const relevoDe = profe ? String(request.data?.relevoDe || '') || null : null;

  const reserva = await datos.reservarSesion(
    alumnoId,
    limites,
    { voz, modelo: MODELO_KAY, ...(profe ? { profe: profe.id } : {}) },
    relevoDe,
    prueba
  );
  if (!reserva.ok) {
    log('kay_cuota_agotada', { alumnoId, motivo: reserva.motivo, prueba });
    return { ok: false, motivo: reserva.motivo, error: reserva.mensaje };
  }

  let instruccion;
  let herramientas = HERRAMIENTAS;
  if (profe) {
    const [memoria, clases] = await Promise.all([datos.obtenerMemoria(alumnoId), datos.obtenerClasesRecientes(perfil.curso)]);
    instruccion = profes.construirInstruccionProfe(profe.id, perfil, { mision, memoria, clases, relevo: reserva.relevo, cursoLegible });
    herramientas = profes.HERRAMIENTAS_PROFES;
    if (mision && !reserva.relevo) await datos.anotarEleccion(alumnoId, mision.materia, profe.id);
  } else {
    const [contenido, clases] = await Promise.all([datos.obtenerContenido(perfil.curso), datos.obtenerClasesRecientes(perfil.curso)]);
    instruccion = construirInstruccion(perfil, { ...contenido, clases });
  }

  const ahora = Date.now();
  const vence = Math.min(reserva.venceEn || Infinity, ahora + LIMITES.minutosPorSesion * 60 * 1000);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value(), httpOptions: { apiVersion: 'v1alpha' } });
  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      // La charla se corta sola al vencer el token: es el límite duro de minutos
      // (en un relevo, el reloj sigue el de la charla original).
      expireTime: new Date(vence).toISOString(),
      newSessionExpireTime: new Date(ahora + 60 * 1000).toISOString(),
      liveConnectConstraints: {
        model: MODELO_KAY,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: instruccion,
          tools: [{ functionDeclarations: herramientas }],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voz } } },
          realtimeInputConfig: { automaticActivityDetection: { disabled: false } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          // Ventana deslizante: el contexto no crece sin fin (cada turno lo vuelve a cobrar).
          contextWindowCompression: { slidingWindow: {} },
        },
      },
      // Sin lockAdditionalFields = se bloquea TODA la configuración de la sesión:
      // nadie puede cambiar la personalidad, la voz ni las herramientas desde el
      // navegador (lo que mande el cliente se ignora).
    },
  });
  if (!token?.name) throw new HttpsError('unavailable', 'Gemini no devolvió el token.');

  log('kay_sesion_iniciada', {
    alumnoId,
    sesionId: reserva.sesionId,
    curso: perfil.curso,
    voz,
    profe: profe?.id || null,
    mision: mision ? `${mision.id}/${mision.fase}/${mision.paso}/${mision.peldano}` : null,
    relevo: reserva.relevo,
    modelo: MODELO_KAY,
    caracteresInstruccion: instruccion.length,
    clasesEnContexto: instruccion.includes('# Lo que pasó en las últimas clases'),
  });

  return {
    ok: true,
    token: token.name,
    modelo: MODELO_KAY,
    voz,
    profe: profe?.id || null,
    relevo: reserva.relevo,
    sesionId: reserva.sesionId,
    minutosMaximos: LIMITES.minutosPorSesion,
    segundosRestantes: Math.round((vence - ahora) / 1000),
    sesionesRestantes: reserva.sesionesRestantes,
  };
});

// Los profes que puede llamar el alumno y a cuál eligió la última vez en cada materia
// (para recordarlo con una estrellita, nunca para imponerlo).
exports.eduProfes = onCall({ ...OPCIONES, secrets: [] }, async (request) => {
  const { alumnoId } = await alumnoDeLaCuenta(request);
  const memoria = await datos.obtenerMemoria(alumnoId);
  const preferencias = {};
  for (const [materia, m] of Object.entries(memoria.materias || {})) if (profes.profePorId(m?.ultimo)) preferencias[materia] = m.ultimo;
  return { ok: true, profes: profes.profesPublicos(), preferencias };
});

exports.eduKayUso = onCall({ ...OPCIONES, secrets: [] }, async (request) => {
  const { alumnoId, perfil } = await alumnoDeLaCuenta(request);
  const { sesionId, usos, segundos, motivoFin, resumen: resumenMision } = request.data || {};

  const resumen = resumirUso(usos);
  const seg = Math.max(0, Math.min(Number(segundos) || 0, LIMITES.minutosPorSesion * 60 + 60));
  const minutos = seg / 60;

  const r = await datos.registrarUso(alumnoId, String(sesionId || ''), {
    totalTokens: resumen.totalTokens,
    costoUsd: resumen.costoUsd,
    segundos: Math.round(seg),
  });
  if (!r.ok) return r;

  // Memoria compartida de los profes: en qué misión quedó (solo IDs y números validados).
  const m = profes.validarMision(resumenMision);
  if (m) {
    const sesion = await datos.obtenerSesion(String(sesionId || ''));
    if (sesion?.profe) {
      await datos.guardarUltima(alumnoId, {
        profe: sesion.profe,
        misionId: m.id,
        paso: m.paso,
        peldanoMax: m.peldano,
        completa: m.completa,
      });
    }
  }

  const costoPorMinutoUsd = minutos > 0 ? Math.round((resumen.costoUsd / minutos) * 1e6) / 1e6 : 0;
  log('kay_uso', {
    alumnoId,
    sesionId,
    curso: perfil.curso,
    segundos: Math.round(seg),
    turnos: resumen.turnos,
    tokens: resumen.tokens,
    totalTokens: resumen.totalTokens,
    tokensPorMinuto: minutos > 0 ? Math.round(resumen.totalTokens / minutos) : 0,
    costoUsd: resumen.costoUsd,
    costoPorMinutoUsd,
    precios: PRECIOS_USD_POR_MILLON,
    motivoFin: String(motivoFin || '').slice(0, 40),
  });

  return { ok: true, segundos: Math.round(seg), totalTokens: resumen.totalTokens, costoUsd: resumen.costoUsd, costoPorMinutoUsd };
});
