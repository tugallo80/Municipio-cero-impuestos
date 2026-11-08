// ══════════════════════════════════════════════════
//  Acceso a la Realtime Database de Educación (instancia propia, separada de la
//  del municipio). Solo el servidor la lee/escribe: las reglas niegan todo al
//  cliente (educacion/database.rules.json).
//
//  Esquema:
//    edu/uid_alumno/{uid}              → alumnoId (ID opaco, ej. "alu_k3j9x2")
//    edu/alumnos/{alumnoId}            → { curso, estilo }        (sin nombre)
//    edu/contenido/{curso}/pensum/{materia}/{id} → { titulo, texto }
//    edu/contenido/{curso}/agenda/{id} → { tipo, titulo, fecha, descripcion }
//    edu/uso/{fecha}/{alumnoId}        → { sesiones, tokens, segundos, costoUsd }
//    edu/uso_global/{fecha}            → { sesiones, tokens, segundos, costoUsd }
//    edu/sesiones/{sesionId}           → { alumnoId, inicio, inicioCadena, voz, modelo, profe, relevo, cerrada }
//    edu/memoria/{alumnoId}            → { ultima: {profe, misionId, paso, peldanoMax, completa, fecha},
//                                          materias: {mat: {la_profe: n, el_profe: n, ultimo}} }
//                                          (memoria compartida de los dos profes: solo datos pedagógicos)
// ══════════════════════════════════════════════════
const { initializeApp, getApps } = require('firebase-admin/app');
const NOMBRE_APP = 'educacion';
const { getDatabase, ServerValue } = require('firebase-admin/database');
const { fechaBolivia, evaluarCuota } = require('./cuota');

// Cambios de profe por día (cada uno es una conexión nueva a Gemini).
const MAX_RELEVOS_DIA = 40;

let db = null;
function base() {
  if (!db) {
    // App con nombre propio: firebase-functions crea su propia app interna, así que
    // "si no hay apps, inicializar" no sirve para saber si existe la nuestra.
    const app =
      getApps().find((a) => a.name === NOMBRE_APP) ||
      initializeApp({ databaseURL: process.env.EDU_DATABASE_URL }, NOMBRE_APP);
    db = getDatabase(app);
  }
  return db;
}

async function obtenerAlumno(uid) {
  const alumnoId = (await base().ref(`edu/uid_alumno/${uid}`).once('value')).val();
  if (!alumnoId) return null;
  const perfil = (await base().ref(`edu/alumnos/${alumnoId}`).once('value')).val();
  if (!perfil) return null;
  // Límites propios (opcionales, p. ej. la cuenta de pruebas del dueño). No van al modelo:
  // construirInstruccion solo usa curso y estilo.
  const limites = {};
  if (Number(perfil.limiteSesionesDia) > 0) limites.sesionesPorAlumnoDia = Math.min(Number(perfil.limiteSesionesDia), 100);
  if (Number(perfil.limiteTokensDia) > 0) limites.tokensPorAlumnoDia = Math.min(Number(perfil.limiteTokensDia), 10_000_000);
  return { alumnoId, perfil: { curso: perfil.curso, estilo: perfil.estilo }, limites };
}

async function obtenerContenido(curso) {
  if (!/^[a-z0-9_]{3,30}$/.test(curso || '')) return { pensum: [], agenda: [] };
  const c = (await base().ref(`edu/contenido/${curso}`).once('value')).val() || {};
  const pensum = [];
  for (const [materia, items] of Object.entries(c.pensum || {})) {
    for (const it of Object.values(items || {})) pensum.push({ materia, titulo: it.titulo, texto: it.texto });
  }
  const hoy = fechaBolivia();
  const agenda = Object.values(c.agenda || {})
    .filter((a) => (a.fecha || '') >= hoy)
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  return { pensum, agenda };
}

/**
 * Revisa la cuota y, si alcanza, reserva una charla (suma 1 sesión) en una
 * transacción, para que dos pedidos al mismo tiempo no se salteen el límite.
 *
 * Relevo (cambio de profe dentro de la misma charla): si `relevoDe` es una sesión
 * del mismo alumno que sigue dentro de su tiempo, NO cuenta como charla nueva y
 * hereda el reloj (inicioCadena): la cadena entera dura como mucho minutosPorSesion.
 * El tope de tokens del alumno y el de costo global se siguen revisando.
 */
async function reservarSesion(alumnoId, limites, datosSesion, relevoDe = null) {
  const fecha = fechaBolivia();
  const usoGlobal = (await base().ref(`edu/uso_global/${fecha}`).once('value')).val() || {};
  const ahora = Date.now();

  let inicioCadena = ahora;
  let esRelevo = false;
  if (relevoDe && /^[-_A-Za-z0-9]{10,40}$/.test(relevoDe)) {
    const previa = (await base().ref(`edu/sesiones/${relevoDe}`).once('value')).val();
    const raiz = Number(previa?.inicioCadena || previa?.inicio || 0);
    if (previa && previa.alumnoId === alumnoId && raiz + limites.minutosPorSesion * 60e3 > ahora + 30e3) {
      inicioCadena = raiz;
      esRelevo = true;
    }
  }

  let rechazo = null;
  const tx = await base()
    .ref(`edu/uso/${fecha}/${alumnoId}`)
    .transaction((actual) => {
      const uso = actual || {};
      // En un relevo no se cuenta la charla, pero sí tokens y costo global.
      const ev = evaluarCuota(esRelevo ? { ...uso, sesiones: 0 } : uso, usoGlobal, limites);
      if (ev.ok && esRelevo && (uso.relevos || 0) >= MAX_RELEVOS_DIA) {
        rechazo = { ok: false, motivo: 'relevos', mensaje: 'Hoy ya cambiaste muchas veces de profe. ¡Seguí con este!' };
        return undefined;
      }
      if (!ev.ok) {
        rechazo = ev;
        return undefined; // aborta la transacción
      }
      rechazo = null;
      return esRelevo ? { ...uso, relevos: (uso.relevos || 0) + 1 } : { ...uso, sesiones: (uso.sesiones || 0) + 1 };
    });
  if (!tx.committed) return rechazo || { ok: false, motivo: 'error', mensaje: 'No se pudo reservar la charla.' };

  if (!esRelevo) await base().ref(`edu/uso_global/${fecha}/sesiones`).transaction((n) => (n || 0) + 1);
  const ref = base().ref('edu/sesiones').push();
  await ref.set({ alumnoId, fecha, inicio: ServerValue.TIMESTAMP, inicioCadena, relevo: esRelevo, cerrada: false, ...datosSesion });
  const usoAlumno = tx.snapshot.val() || {};
  return {
    ok: true,
    sesionId: ref.key,
    fecha,
    relevo: esRelevo,
    venceEn: inicioCadena + limites.minutosPorSesion * 60e3,
    sesionesRestantes: limites.sesionesPorAlumnoDia - (usoAlumno.sesiones || 0),
  };
}

// ── Memoria compartida de los profes ───────────────
async function obtenerMemoria(alumnoId) {
  return (await base().ref(`edu/memoria/${alumnoId}`).once('value')).val() || {};
}

/** Suma que el alumno eligió a este profe para esta materia (para recordar, no imponer). */
async function anotarEleccion(alumnoId, materia, profeId) {
  if (!/^[a-z]{2,6}$/.test(materia || '')) return;
  await base()
    .ref(`edu/memoria/${alumnoId}/materias/${materia}`)
    .transaction((x) => {
      const m = x || {};
      return { ...m, [profeId]: (m[profeId] || 0) + 1, ultimo: profeId };
    });
}

/** Guarda en qué quedó (ya validado por el llamador: solo IDs y números). */
async function guardarUltima(alumnoId, ultima) {
  await base().ref(`edu/memoria/${alumnoId}/ultima`).set({ ...ultima, fecha: fechaBolivia() });
}

/** La sesión (para saber qué profe era al cerrar). */
async function obtenerSesion(sesionId) {
  if (!/^[-_A-Za-z0-9]{10,40}$/.test(sesionId || '')) return null;
  return (await base().ref(`edu/sesiones/${sesionId}`).once('value')).val();
}

/** Cierra la charla (una sola vez) y suma tokens/costo al día del alumno y global. */
async function registrarUso(alumnoId, sesionId, { totalTokens, costoUsd, segundos }) {
  if (!/^[-_A-Za-z0-9]{10,40}$/.test(sesionId || '')) return { ok: false, error: 'Sesión inválida.' };
  const refSesion = base().ref(`edu/sesiones/${sesionId}`);
  let fecha = null;
  const tx = await refSesion.transaction((s) => {
    // La primera pasada puede llegar con null (sin caché local): se devuelve null
    // para que el servidor responda con el valor real y la función vuelva a correr.
    if (s === null) return null;
    if (s.alumnoId !== alumnoId || s.cerrada) return undefined;
    fecha = s.fecha;
    return { ...s, cerrada: true, totalTokens, costoUsd, segundos };
  });
  const final = tx.snapshot.val();
  if (!tx.committed || !final || !fecha) return { ok: false, error: 'La sesión no existe, no es tuya o ya se cerró.' };

  const sumarA = (ruta) =>
    base()
      .ref(ruta)
      .transaction((u) => {
        const x = u || {};
        return {
          ...x,
          tokens: (x.tokens || 0) + totalTokens,
          segundos: (x.segundos || 0) + segundos,
          costoUsd: Math.round(((x.costoUsd || 0) + costoUsd) * 1e6) / 1e6,
        };
      });
  await Promise.all([sumarA(`edu/uso/${fecha}/${alumnoId}`), sumarA(`edu/uso_global/${fecha}`)]);
  return { ok: true };
}

module.exports = { obtenerAlumno, obtenerContenido, reservarSesion, registrarUso, obtenerMemoria, anotarEleccion, guardarUltima, obtenerSesion };
