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
//    edu/sesiones/{sesionId}           → { alumnoId, inicio, voz, modelo, cerrada }
// ══════════════════════════════════════════════════
const admin = require('firebase-admin');
const { fechaBolivia, evaluarCuota } = require('./cuota');

let db = null;
function base() {
  if (!db) {
    if (!admin.apps.length) admin.initializeApp({ databaseURL: process.env.EDU_DATABASE_URL });
    db = admin.database();
  }
  return db;
}

async function obtenerAlumno(uid) {
  const alumnoId = (await base().ref(`edu/uid_alumno/${uid}`).once('value')).val();
  if (!alumnoId) return null;
  const perfil = (await base().ref(`edu/alumnos/${alumnoId}`).once('value')).val();
  if (!perfil) return null;
  return { alumnoId, perfil: { curso: perfil.curso, estilo: perfil.estilo } };
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
 */
async function reservarSesion(alumnoId, limites, datosSesion) {
  const fecha = fechaBolivia();
  const usoGlobal = (await base().ref(`edu/uso_global/${fecha}`).once('value')).val() || {};

  let rechazo = null;
  const tx = await base()
    .ref(`edu/uso/${fecha}/${alumnoId}`)
    .transaction((actual) => {
      const uso = actual || {};
      const ev = evaluarCuota(uso, usoGlobal, limites);
      if (!ev.ok) {
        rechazo = ev;
        return undefined; // aborta la transacción
      }
      rechazo = null;
      return { ...uso, sesiones: (uso.sesiones || 0) + 1 };
    });
  if (!tx.committed) return rechazo || { ok: false, motivo: 'error', mensaje: 'No se pudo reservar la charla.' };

  await base().ref(`edu/uso_global/${fecha}/sesiones`).transaction((n) => (n || 0) + 1);
  const ref = base().ref('edu/sesiones').push();
  await ref.set({ alumnoId, fecha, inicio: admin.database.ServerValue.TIMESTAMP, cerrada: false, ...datosSesion });
  const usoAlumno = tx.snapshot.val() || {};
  return { ok: true, sesionId: ref.key, fecha, sesionesRestantes: limites.sesionesPorAlumnoDia - (usoAlumno.sesiones || 0) };
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

module.exports = { obtenerAlumno, obtenerContenido, reservarSesion, registrarUso };
