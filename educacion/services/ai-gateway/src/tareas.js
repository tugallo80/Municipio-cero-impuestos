// ══════════════════════════════════════════════════
//  Tareas sugeridas y mapa del curso (EDU.04f): Cloud Functions eduTareas y eduMapa.
//
//  eduTareas
//    profe:  'sugerir' (IA, ~USD 0,003) · 'enviar' · 'listar' (con quién la marcó hecha) · 'borrar'
//    alumno: 'mias' (sus tareas vigentes, con su variante y su estado) ·
//            'marcar' ({id, estado: 'hecha'|'entregada'|'pendiente', texto?}) — también acepta {id, hecha: bool}
//  eduMapa (profe)
//    'curso' (alumnos demo sin nombres + disposición guardada) · 'proponer' (IA, ~USD 0,003) · 'guardar'
//
//  A la IA no llega ningún nombre: solo curso, tema y, en el mapa, IDs opacos con rasgos pedagógicos.
// ══════════════════════════════════════════════════
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenAI } = require('@google/genai');

const T = require('../tutor/tareas');
const { LIMITES } = require('../tutor/config');
const { costoClase } = require('./costos');
const { fechaBolivia } = require('./cuota');
const datos = require('./datos');

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const MODELOS = (process.env.EDU_MODELO_PLAN || 'gemini-3.1-flash-lite,gemini-3.1-flash-lite-preview,gemini-2.5-flash-lite,gemini-flash-lite-latest')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const MAX_SUGERENCIAS_DIA = 40;
const MAX_MAPAS_DIA = 30;
const CURSO_VALIDO = /^[0-9]{1,2}(ro|do|to|vo|no|mo)_(primaria|secundaria)$/;
const OPC = { region: 'us-central1', invoker: 'public', maxInstances: 5, timeoutSeconds: 60, memory: '256MiB' };

function log(evento, campos) {
  console.log(JSON.stringify({ evento, ...campos }));
}

async function profe(request, curso) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Necesitás iniciar sesión.');
  const p = await datos.obtenerPersonal(request.auth.uid);
  if (!p || !p.tutor) throw new HttpsError('permission-denied', 'Esta cuenta no es de un profe.');
  if (!CURSO_VALIDO.test(curso || '') || !p.cursos.includes(curso)) throw new HttpsError('permission-denied', 'Ese curso no es tuyo.');
  return p;
}

async function generarJson(texto, sistema, esquema) {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
  let ultimo = null;
  for (const modelo of MODELOS) {
    try {
      const r = await ai.models.generateContent({
        model: modelo,
        contents: [{ role: 'user', parts: [{ text: texto }] }],
        config: { systemInstruction: sistema, responseMimeType: 'application/json', responseJsonSchema: esquema, temperature: 0.5, maxOutputTokens: 6000 },
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

/** Llamada a la IA con cupo diario, bolsa (general o de pruebas) y registro de costo. */
async function conIA(yo, tipo, max, texto, sistema, esquema) {
  const reserva = await datos.reservarClase(yo.id, max, LIMITES, tipo, yo.prueba);
  if (!reserva.ok) return { ok: false, motivo: reserva.motivo, error: reserva.mensaje };
  let r;
  try {
    r = await generarJson(texto, sistema, esquema);
  } catch (err) {
    log(`${tipo}_error`, { personalId: yo.id, error: String(err?.message || err).slice(0, 300) });
    throw new HttpsError('unavailable', 'La mentora no pudo responder. Probá de nuevo.');
  }
  const costo = costoClase(r.uso, r.modelo);
  await datos.registrarCostoClase(yo.id, reserva.fecha, costo.costoUsd, 0, tipo, yo.prueba);
  if (!r.json) throw new HttpsError('unavailable', 'La mentora devolvió algo que no se entiende. Probá de nuevo.');
  return { ok: true, json: r.json, modelo: r.modelo, costo };
}

exports.eduTareas = onCall({ ...OPC, secrets: [GEMINI_API_KEY] }, async (request) => {
  const d = request.data || {};
  const accion = String(d.accion || '');

  // ── Alumno ──
  if (accion === 'mias' || accion === 'marcar') {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Necesitás iniciar sesión.');
    const alumno = await datos.obtenerAlumno(request.auth.uid);
    if (!alumno) throw new HttpsError('permission-denied', 'Esta cuenta no tiene perfil de alumno.');
    const curso = alumno.perfil.curso;
    if (accion === 'marcar') {
      const t = await datos.obtenerTarea(curso, String(d.id || ''));
      if (!t) return { ok: false, error: 'Esa tarea ya no está.' };
      const estado = ['hecha', 'entregada', 'pendiente'].includes(d.estado) ? d.estado : d.hecha === false ? 'pendiente' : 'hecha';
      // Texto de la entrega (sin fotos ni archivos por ahora: datos de menores, falta Storage y permisos).
      const textoEntrega = typeof d.texto === 'string' ? d.texto.slice(0, 2000) : '';
      await datos.marcarTarea(curso, String(d.id), alumno.alumnoId, estado === 'pendiente' ? null : estado, textoEntrega);
      return { ok: true, estado };
    }
    const [tareas, estados] = await Promise.all([datos.listarTareas(curso), datos.estadosTareas(curso)]);
    return {
      ok: true,
      hoy: fechaBolivia(),
      tareas: tareas.map((t) => {
        const e = estados?.[t.id]?.[alumno.alumnoId]?.estado || 'pendiente';
        return { ...T.tareaParaAlumno(t.id, t, t.asignacion?.[alumno.alumnoId] || t.varianteResto || 'base'), estado: e, hecha: e !== 'pendiente' };
      }),
    };
  }

  // ── Profe ──
  const curso = String(d.curso || '');
  const yo = await profe(request, curso);

  if (accion === 'sugerir') {
    const p = T.validarPedidoTareas(d);
    if (!p.ok) throw new HttpsError('invalid-argument', p.error);
    const r = await conIA(yo, 'tareas', MAX_SUGERENCIAS_DIA, T.pedidoTareas(p), T.instruccionTareas(), T.ESQUEMA_TAREAS);
    if (!r.ok) return r;
    const hoy = p.hoy || fechaBolivia();
    const tareas = (Array.isArray(r.json.tareas) ? r.json.tareas : []).slice(0, 3).map((t) => T.normalizarTarea({ ...t, materia: p.materia }, { curso, materia: p.materia, hoy, origen: p.origen, tema: p.tema }));
    log('tareas_sugeridas', { personalId: yo.id, curso, n: tareas.length, modelo: r.modelo, tokens: r.costo.totalTokens, costoUsd: r.costo.costoUsd });
    return { ok: true, tareas, costoUsd: r.costo.costoUsd, modelo: r.modelo };
  }

  if (accion === 'enviar') {
    const hoy = fechaBolivia();
    const t = T.normalizarTarea(d.tarea, { curso, materia: d.tarea?.materia, hoy, origen: d.tarea?.origen?.tipo, tema: d.tarea?.origen?.tema });
    if (!t.consigna) throw new HttpsError('invalid-argument', 'La tarea no tiene consigna.');
    // Variante por alumno: la que eligió el profe, o la sugerida por su avance (demo).
    const asignacion = {};
    for (const a of T.alumnosDemo(curso)) {
      const elegida = d.asignacion?.[a.id];
      asignacion[a.id] = T.VARIANTES.includes(elegida) ? elegida : T.varianteSugerida(a);
    }
    const varianteResto = T.VARIANTES.includes(d.varianteResto) ? d.varianteResto : 'base';
    const id = await datos.guardarTarea(curso, { ...t, asignacion, varianteResto, personalId: yo.id });
    log('tarea_enviada', { personalId: yo.id, curso, tareaId: id, tipo: t.tipo, entrega: t.entrega });
    return { ok: true, id };
  }

  if (accion === 'listar') {
    const [tareas, estados] = await Promise.all([datos.listarTareas(curso), datos.estadosTareas(curso)]);
    return { ok: true, tareas: tareas.map((t) => ({ ...t, hechas: Object.keys(estados?.[t.id] || {}).length })) };
  }

  if (accion === 'borrar') {
    const t = await datos.obtenerTarea(curso, String(d.id || ''));
    if (t && t.personalId !== yo.id && !yo.direccion) throw new HttpsError('permission-denied', 'Solo quien la envió la puede borrar.');
    await datos.borrarTarea(curso, String(d.id || ''));
    return { ok: true };
  }

  throw new HttpsError('invalid-argument', 'Acción desconocida.');
});

exports.eduMapa = onCall({ ...OPC, secrets: [GEMINI_API_KEY] }, async (request) => {
  const d = request.data || {};
  const curso = String(d.curso || '');
  const yo = await profe(request, curso);
  const accion = String(d.accion || '');

  if (accion === 'curso') {
    // Sin nombres: la pantalla los pone de su lado (datos ficticios de la demo).
    return { ok: true, alumnos: T.alumnosDemo(curso), guardado: await datos.leerMapa(yo.id, curso) };
  }

  if (accion === 'proponer') {
    if (!T.alumnosDemo(curso).length) return { ok: false, error: 'Este curso todavía no tiene alumnos cargados.' };
    const objetivo = Object.keys(T.OBJETIVOS).includes(d.objetivo) ? d.objetivo : 'parejas';
    const tema = String(d.tema || '').slice(0, 160);
    const r = await conIA(yo, 'mapa', MAX_MAPAS_DIA, T.pedidoMapa(curso, objetivo, tema), T.instruccionMapa(), T.ESQUEMA_MAPA);
    if (!r.ok) return r;
    const propuesta = { ...T.normalizarMapa(r.json, curso), objetivo, tema };
    log('mapa_propuesto', { personalId: yo.id, curso, objetivo, grupos: propuesta.grupos.length, modelo: r.modelo, tokens: r.costo.totalTokens, costoUsd: r.costo.costoUsd });
    return { ok: true, propuesta, costoUsd: r.costo.costoUsd, modelo: r.modelo };
  }

  if (accion === 'guardar') {
    const mapa = T.validarDisposicion(d.mapa, curso);
    await datos.guardarMapa(yo.id, curso, mapa);
    return { ok: true, mapa };
  }

  throw new HttpsError('invalid-argument', 'Acción desconocida.');
});
