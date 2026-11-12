// ══════════════════════════════════════════════════
//  Tutor 24/7 del alumno (EDU.16): Cloud Function eduTutor (texto, con streaming).
//
//  El alumno pregunta y el tutor (la profe o el profe IA; nombres configurables, EDU.16b) responde con el contexto
//  de SU vida escolar: clases grabadas recientes, tareas, horario, avisos, qué llevar y un pedazo
//  del texto oficial. La lógica pura (qué se manda y cómo) está en tutor/tutor24.js.
//
//  Pedido: { pregunta, foco?: {materia, tema, pagina, tarea, tareaInfo}, historial?: [{rol, texto}], profe? }
//  Respuesta: { ok, texto, profe, intencion, fuentes, costoUsd, modelo, ms, cache? }
//    Con streaming (httpsCallable(...).stream), además va mandando { t: '…pedacito…' }.
//  Gasto: bolsa general / de pruebas / de la demo (la de la cuenta), tope por alumno por día.
//  Señales de riesgo: respuesta fija SIN IA que deriva a un adulto (costo 0).
// ══════════════════════════════════════════════════
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenAI } = require('@google/genai');
const crypto = require('node:crypto');

const T24 = require('../tutor/tutor24');
const IA = require('../tutor/nombres-ia');
const T = require('../tutor/tareas');
const { LIMITES } = require('../tutor/config');
const { costoClase } = require('./costos');
const { fechaBolivia } = require('./cuota');
const datos = require('./datos');

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const MODELOS = (process.env.EDU_MODELO_TUTOR || process.env.EDU_MODELO_PLAN || 'gemini-3.1-flash-lite,gemini-3.1-flash-lite-preview,gemini-2.5-flash-lite,gemini-flash-lite-latest')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const MAX_CONSULTAS_DIA = Number(process.env.EDU_MAX_CONSULTAS_TUTOR_DIA) > 0 ? Number(process.env.EDU_MAX_CONSULTAS_TUTOR_DIA) : 60;
const OPC = { region: 'us-central1', invoker: 'public', maxInstances: 10, timeoutSeconds: 60, memory: '256MiB', secrets: [GEMINI_API_KEY] };

function log(evento, campos) {
  console.log(JSON.stringify({ evento, ...campos }));
}

/** Tareas vigentes del alumno con su estado (lo mismo que eduTareas 'mias', sin costo). */
async function tareasDelAlumno(curso, alumnoId) {
  const [tareas, estados] = await Promise.all([datos.listarTareas(curso), datos.estadosTareas(curso)]);
  return tareas.map((t) => ({ ...T.tareaParaAlumno(t.id, t, t.asignacion?.[alumnoId] || t.varianteResto || 'base'), estado: estados?.[t.id]?.[alumnoId]?.estado || 'pendiente' }));
}

/** Todo lo que sabe el tutor de la vida escolar de este alumno (sin nombres). */
async function contextoAlumno(alumno, p) {
  const curso = alumno.perfil.curso;
  const est = T24.datosDelCurso(curso);
  const [tareas, clases] = await Promise.all([tareasDelAlumno(curso, alumno.alumnoId), datos.obtenerClasesRecientes(curso, 3)]);
  if (p.foco.tareaInfo && !tareas.some((t) => t.id === p.foco.tarea)) {
    tareas.push({ id: p.foco.tarea || 'abierta', materia: p.foco.tareaInfo.materia, titulo: p.foco.tareaInfo.titulo, consigna: p.foco.tareaInfo.consigna, entrega: p.foco.tareaInfo.entrega, estado: 'pendiente', pistas: [] });
    if (!p.foco.tarea) p.foco.tarea = 'abierta';
  }
  const tarea = tareas.find((t) => t.id === p.foco.tarea);
  const materia = T24.materiaDe(p.pregunta, est?.materias) || p.foco.materia || tarea?.materia || null;
  const intencion = T24.intencion(p.pregunta);
  // El texto oficial solo cuando hace falta: lo pide, tiene una página abierta o la tarea nombra una página.
  const paginaTarea = tarea ? T24.paginaDe(tarea.consigna) : null;
  const quiereTexto = intencion === 'texto' || p.foco.tema || p.foco.pagina || T24.paginaDe(p.pregunta) || paginaTarea;
  const fragmento = quiereTexto || intencion === 'clase' || intencion === 'tarea' || intencion === 'otro'
    ? T24.buscarFragmento({ materia, tema: p.foco.tema, pagina: p.foco.pagina || T24.paginaDe(p.pregunta) || (intencion === 'tarea' ? paginaTarea : null), pregunta: `${p.pregunta} ${intencion === 'tarea' && tarea ? tarea.titulo : ''}`, temasHoy: est?.temasHoy, siempre: !!quiereTexto })
    : null;
  return { curso, est, tareas, clases, fragmento, intencion, materia, foco: p.foco };
}

async function generar(sistema, contenidos, alPedazo) {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
  let ultimo = null;
  for (const modelo of MODELOS) {
    // Gemini 3: pensar lo mínimo (responde más rápido y más barato). Si el modelo no lo acepta, sin eso.
    for (const pensar of /gemini-3/.test(modelo) ? [true, false] : [false]) {
      const config = { systemInstruction: sistema, temperature: 0.6, maxOutputTokens: 700, ...(pensar ? { thinkingConfig: { thinkingLevel: 'MINIMAL' } } : {}) };
      try {
        let texto = '';
        let uso = null;
        if (alPedazo) {
          const flujo = await ai.models.generateContentStream({ model: modelo, contents: contenidos, config });
          for await (const c of flujo) {
            const t = c.text || '';
            if (t) { texto += t; await alPedazo(t); }
            if (c.usageMetadata) uso = c.usageMetadata;
          }
        } else {
          const r = await ai.models.generateContent({ model: modelo, contents: contenidos, config });
          texto = r.text || '';
          uso = r.usageMetadata;
        }
        return { modelo, texto, uso };
      } catch (err) {
        ultimo = err;
        const m = String(err?.message || err);
        if (pensar && /think/i.test(m)) continue;
        if (/not found|404|is not supported|no longer available|deprecated/i.test(m)) break;
        throw err;
      }
    }
  }
  throw ultimo || new Error('Sin modelos');
}

const claveCache = (x) => `tutor-${crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 32)}`;

exports.eduTutor = onCall(OPC, async (request, response) => {
  const t0 = Date.now();
  if (!request.auth) throw new HttpsError('unauthenticated', 'Necesitás iniciar sesión.');
  const alumno = await datos.obtenerAlumno(request.auth.uid);
  if (!alumno) throw new HttpsError('permission-denied', 'Esta cuenta no tiene perfil de alumno.');
  const p = T24.validarPedido(request.data || {});
  if (!p.ok) throw new HttpsError('invalid-argument', p.error);
  const intencion = T24.intencion(p.pregunta);

  // Señales de riesgo: nunca a la IA. Respuesta fija que deriva a un adulto.
  if (intencion === 'riesgo') {
    log('tutor_riesgo', { alumnoId: alumno.alumnoId, curso: alumno.perfil.curso });
    return { ok: true, texto: T24.respuestaRiesgo(), profe: p.profe || 'la_profe', intencion, fuentes: [], costoUsd: 0, modelo: null, ms: Date.now() - t0, derivar: true };
  }

  const ctx = await contextoAlumno(alumno, p);
  const profe = p.profe || (ctx.materia && ctx.est ? T24.profeDeMateria(ctx.est, ctx.materia) : 'la_profe');
  const fuentes = [
    ...(ctx.clases.length ? [`${ctx.clases.length} clase(s) grabada(s)`] : []),
    ...(ctx.tareas.length ? [`${ctx.tareas.length} tarea(s)`] : []),
    ...(ctx.fragmento ? [`${ctx.fragmento.nombre}, ${ctx.fragmento.titulo}${ctx.fragmento.pagina ? `, pág. ${ctx.fragmento.pagina}` : ''}`] : []),
  ];

  // Demo: la primera pregunta de una charla, igual y del mismo día, sale del caché (al instante, sin costo).
  const cacheable = alumno.prueba === 'demo' && !p.historial.length && request.data?.nueva !== true;
  const clave = cacheable ? claveCache({ c: ctx.curso, f: fechaBolivia(), q: p.pregunta.toLowerCase(), foco: p.foco, profe, ia: IA.nombresIA(request.data?.ia) }) : null;
  if (clave) {
    const enCache = await datos.leerCacheDemo(clave);
    if (enCache) return { ...enCache, costoUsd: 0, cache: true, ms: Date.now() - t0 };
  }

  // La cuenta demo la comparten la presentación y las pruebas: más consultas (la bolsa de USD 2 la frena igual).
  const maxDia = alumno.prueba === 'demo' ? MAX_CONSULTAS_DIA * 5 : MAX_CONSULTAS_DIA;
  const reserva = await datos.reservarClase(alumno.alumnoId, maxDia, LIMITES, 'tutor', alumno.prueba);
  if (!reserva.ok) {
    log('tutor_cuota', { alumnoId: alumno.alumnoId, motivo: reserva.motivo });
    const msj = reserva.motivo === 'tutor_dia' ? `Hoy ya me hiciste ${maxDia} preguntas: ¡mañana seguimos! Mientras, mirá tus tareas y tu texto.` : reserva.mensaje;
    return { ok: false, motivo: reserva.motivo, error: msj };
  }

  const sistema = `${T24.instruccionTutor({ curso: ctx.curso, profe, ia: request.data?.ia })}\n\n# Lo que sabés de su vida escolar\n\n${T24.armarContexto(ctx)}`;
  const contenidos = T24.armarConversacion(p.historial, p.pregunta);
  let r;
  let primerPedazoMs = null;
  try {
    r = await generar(sistema, contenidos, request.acceptsStreaming
      ? async (t) => {
          if (primerPedazoMs === null) primerPedazoMs = Date.now() - t0;
          await response.sendChunk({ t: T24.limpiarPedazo(t, ctx.curso) });
        }
      : null);
  } catch (err) {
    log('tutor_error', { alumnoId: alumno.alumnoId, error: String(err?.message || err).slice(0, 300) });
    throw new HttpsError('unavailable', 'El tutor no pudo responder ahora. Probá de nuevo en un ratito.');
  }
  const costo = costoClase(r.uso, r.modelo);
  await datos.registrarCostoClase(alumno.alumnoId, reserva.fecha, costo.costoUsd, 0, 'tutor', alumno.prueba);
  const texto = T24.limpiarRespuesta(r.texto, ctx.curso) || 'Uy, no me salió la respuesta. ¿Me lo preguntás de nuevo con otras palabras?';
  const ms = Date.now() - t0;
  log('tutor_respuesta', {
    alumnoId: alumno.alumnoId,
    curso: ctx.curso,
    intencion,
    profe,
    modelo: r.modelo,
    tokensEntrada: costo.tokens.entradaTexto + costo.tokens.entradaAudio,
    tokensSalida: costo.tokens.salidaTexto,
    costoUsd: costo.costoUsd,
    caracteresContexto: sistema.length,
    fragmento: ctx.fragmento ? `${ctx.fragmento.temaId}@${ctx.fragmento.pagina}` : null,
    turnos: p.historial.length,
    ms,
    primerPedazoMs,
    stream: !!request.acceptsStreaming,
    bolsa: alumno.prueba === 'demo' ? 'demo' : alumno.prueba === true ? 'pruebas' : 'general',
  });
  const resp = { ok: true, texto, profe, intencion, fuentes, costoUsd: costo.costoUsd, tokens: costo.totalTokens, modelo: r.modelo, ms, primerPedazoMs };
  if (clave) await datos.guardarCacheDemo(clave, resp);
  return resp;
});

module.exports.contextoAlumno = contextoAlumno;
