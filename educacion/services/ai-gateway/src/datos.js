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
//    edu/uso_global/{fecha}            → { sesiones, tokens, segundos, costoUsd }   (chicos, profes, dueño)
//    edu/uso_pruebas/{fecha}           → lo mismo, solo de las cuentas de prueba automática (EDU.04e)
//    edu/uso_demo/{fecha}              → lo mismo, solo de la cuenta de la demo sin login (EDU.15, USD 2/día)
//    Una cuenta es de prueba si su perfil (edu/alumnos/… o edu/personal/…) tiene pruebaAuto: true
//    (lo pone solo el workflow con la cuenta de deploy; el navegador no puede escribir la base).
//    edu/sesiones/{sesionId}           → { alumnoId, inicio, inicioCadena, voz, modelo, profe, relevo, cerrada }
//    edu/memoria/{alumnoId}            → { ultima: {profe, misionId, paso, peldanoMax, completa, fecha},
//                                          materias: {mat: {la_profe: n, el_profe: n, ultimo}} }
//                                          (memoria compartida de los dos profes: solo datos pedagógicos)
//
//  Clase grabada (EDU.04a):
//    edu/personal/{uid}                → { id, roles: {tutor, direccion}, cursos: {curso: true} }
//    edu/clases/{curso}/{claseId}      → informe (profe + dirección + contexto), vence a los 30 días;
//                                          la transcripción vence a los 7 (sin nombres de alumnos)
//    edu/contexto_dia/{curso}/{claseId} → lo que usan los profes IA (temas, tareas…), vence a los 14
//    edu/uso_clase/{fecha}/{personalId} → { clases, costoUsd }
//    El audio NO se guarda en ningún lado.
// ══════════════════════════════════════════════════
const { initializeApp, getApps } = require('firebase-admin/app');
const NOMBRE_APP = 'educacion';
const { getDatabase, ServerValue } = require('firebase-admin/database');
const { fechaBolivia, evaluarCuota, bolsa, tipoDeBolsa } = require('./cuota');

// Cambios de profe por día (cada uno es una conexión nueva a Gemini).
const MAX_RELEVOS_DIA = 40;

let db = null;
// App con nombre propio: firebase-functions crea su propia app interna, así que
// "si no hay apps, inicializar" no sirve para saber si existe la nuestra.
const appAdmin = () =>
  getApps().find((a) => a.name === NOMBRE_APP) || initializeApp({ databaseURL: process.env.EDU_DATABASE_URL }, NOMBRE_APP);
function base() {
  if (!db) db = getDatabase(appAdmin());
  return db;
}

// ── Demo sin login (EDU.15) ─────────────────────────
//    edu/demo/llaves/{nombre} → hash SHA-256 de la llave (la llave no se guarda en ningún lado)
//    edu/demo/fallos/{fecha}  → intentos con llave mala del día
async function hashesDemo() {
  return (await base().ref('edu/demo/llaves').once('value')).val() || {};
}
async function fallosDemo(fecha) {
  return (await base().ref(`edu/demo/fallos/${fecha}`).once('value')).val() || 0;
}
async function sumarFalloDemo(fecha) {
  await base().ref(`edu/demo/fallos/${fecha}`).transaction((n) => (n || 0) + 1);
}
//    edu/demo/cache/{clave} → { respuesta, creado }: lo que ya respondió la IA en la demo
//    (la misma propuesta vuelve al instante y sin costo; "↻ Otras" pide una nueva).
const VENCE_CACHE_DEMO = 7 * 864e5;
async function leerCacheDemo(clave) {
  const c = (await base().ref(`edu/demo/cache/${clave}`).once('value')).val();
  return c && Date.now() - (c.creado || 0) < VENCE_CACHE_DEMO ? c.respuesta : null;
}
async function guardarCacheDemo(clave, respuesta) {
  await base().ref(`edu/demo/cache/${clave}`).set({ respuesta, creado: Date.now() });
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
  return { alumnoId, perfil: { curso: perfil.curso, estilo: perfil.estilo }, limites, prueba: tipoDeBolsa(perfil) };
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
async function reservarSesion(alumnoId, limites, datosSesion, relevoDe = null, esPrueba = false) {
  const fecha = fechaBolivia();
  const rutaBolsa = bolsa(esPrueba, limites).ruta;
  const usoGlobal = (await base().ref(`${rutaBolsa}/${fecha}`).once('value')).val() || {};
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
      const ev = evaluarCuota(esRelevo ? { ...uso, sesiones: 0 } : uso, usoGlobal, limites, esPrueba);
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

  if (!esRelevo) await base().ref(`${rutaBolsa}/${fecha}/sesiones`).transaction((n) => (n || 0) + 1);
  const ref = base().ref('edu/sesiones').push();
  await ref.set({ alumnoId, fecha, inicio: ServerValue.TIMESTAMP, inicioCadena, relevo: esRelevo, cerrada: false, ...(esPrueba ? { prueba: esPrueba } : {}), ...datosSesion });
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
  let esPrueba = false;
  const tx = await refSesion.transaction((s) => {
    // La primera pasada puede llegar con null (sin caché local): se devuelve null
    // para que el servidor responda con el valor real y la función vuelva a correr.
    if (s === null) return null;
    if (s.alumnoId !== alumnoId || s.cerrada) return undefined;
    fecha = s.fecha;
    esPrueba = s.prueba === true ? true : s.prueba === 'demo' ? 'demo' : false;
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
  await Promise.all([sumarA(`edu/uso/${fecha}/${alumnoId}`), sumarA(`${bolsa(esPrueba, {}).ruta}/${fecha}`)]);
  return { ok: true };
}

// ── Clase grabada (EDU.04a) ─────────────────────────
const DIA = 24 * 3600e3;
const VENCE = { informe: 30 * DIA, transcripcion: 7 * DIA, contexto: 14 * DIA };
const ID_OK = /^[-_A-Za-z0-9]{10,40}$/;

/** Cuenta de personal del colegio (profe / dirección). null si no es personal. */
async function obtenerPersonal(uid) {
  const p = (await base().ref(`edu/personal/${uid}`).once('value')).val();
  if (!p || !p.id) return null;
  const cursos = Object.keys(p.cursos || {}).filter((c) => p.cursos[c] === true);
  return { id: String(p.id), tutor: p.roles?.tutor === true, direccion: p.roles?.direccion === true, cursos, prueba: tipoDeBolsa(p) };
}

/**
 * Reserva una clase / PDF / tarjeta (cuenta 1) si el profe no pasó su límite y hay presupuesto
 * en su bolsa (general, o la de pruebas si es una cuenta de prueba automática).
 */
async function reservarClase(personalId, maxClasesDia, limites, tipo = 'clase', esPrueba = false) {
  const fecha = fechaBolivia();
  const b = bolsa(esPrueba, limites);
  const usoGlobal = (await base().ref(`${b.ruta}/${fecha}`).once('value')).val() || {};
  if ((usoGlobal.costoUsd || 0) >= b.tope) {
    return { ok: false, motivo: b.motivo, mensaje: esPrueba ? b.mensaje : 'Hoy ya se usó todo el presupuesto de IA del día. Mañana se puede de nuevo.' };
  }
  let rechazo = null;
  const tx = await base()
    .ref(`edu/uso_${tipo}/${fecha}/${personalId}`)
    .transaction((u) => {
      const x = u || {};
      if ((x.clases || 0) >= maxClasesDia) {
        rechazo = { ok: false, motivo: `${tipo}_dia`, mensaje: tipo === 'clase' ? `Hoy ya se resumieron ${maxClasesDia} clases tuyas. Mañana hay más.` : `Hoy ya usaste ${maxClasesDia} veces esta ayuda. Mañana hay más.` };
        return undefined;
      }
      rechazo = null;
      return { ...x, clases: (x.clases || 0) + 1 };
    });
  if (!tx.committed) return rechazo || { ok: false, motivo: 'error', mensaje: 'No se pudo reservar.' };
  return { ok: true, fecha };
}

/** Suma el costo de una clase al día del profe y al global (el mismo tope que Kay). */
async function registrarCostoClase(personalId, fecha, costoUsd, segundos, tipo = 'clase', esPrueba = false) {
  const sumar = (ruta, extra) =>
    base()
      .ref(ruta)
      .transaction((u) => {
        const x = u || {};
        return { ...x, ...extra(x), costoUsd: Math.round(((x.costoUsd || 0) + costoUsd) * 1e6) / 1e6 };
      });
  await Promise.all([
    sumar(`edu/uso_${tipo}/${fecha}/${personalId}`, () => ({})),
    sumar(`${bolsa(esPrueba, {}).ruta}/${fecha}`, (x) =>
      tipo === 'clase'
        ? { clases: (x.clases || 0) + 1, segundosClase: (x.segundosClase || 0) + Math.round(segundos) }
        : { [`${tipo}s`]: (x[`${tipo}s`] || 0) + 1 }
    ),
  ]);
}

/** Guarda el informe y el contexto del día. Devuelve el claseId. */
async function guardarClase(curso, registro) {
  const ahora = Date.now();
  const ref = base().ref(`edu/clases/${curso}`).push();
  const { informe, ...meta } = registro;
  const { transcripcion, contexto, ...resto } = informe;
  await ref.set({
    ...meta,
    curso,
    creado: ahora,
    vence: ahora + VENCE.informe,
    venceTranscripcion: ahora + VENCE.transcripcion,
    informe: { ...resto, contexto },
    transcripcion: transcripcion || '',
  });
  if (informe.huboClase && (contexto.temas.length || contexto.tareas.length)) {
    await base()
      .ref(`edu/contexto_dia/${curso}/${ref.key}`)
      .set({ fecha: meta.fecha, materia: meta.materia, tema: meta.tema || '', contexto, creado: ahora, vence: ahora + VENCE.contexto });
  }
  return ref.key;
}

/** Borra lo vencido de un curso (se llama al leer: no hace falta un cron). */
async function limpiarVencidos(curso, ahora = Date.now()) {
  const borrar = {};
  const clases = (await base().ref(`edu/clases/${curso}`).once('value')).val() || {};
  for (const [id, c] of Object.entries(clases)) {
    if ((c.vence || 0) <= ahora) borrar[`edu/clases/${curso}/${id}`] = null;
    else if (c.transcripcion && (c.venceTranscripcion || 0) <= ahora) borrar[`edu/clases/${curso}/${id}/transcripcion`] = null;
  }
  const ctx = (await base().ref(`edu/contexto_dia/${curso}`).once('value')).val() || {};
  for (const [id, c] of Object.entries(ctx)) if ((c.vence || 0) <= ahora) borrar[`edu/contexto_dia/${curso}/${id}`] = null;
  if (Object.keys(borrar).length) await base().ref().update(borrar);
  return { clases, ctx, borrados: Object.keys(borrar).length };
}

/** Informes vigentes de los cursos dados (más nuevos primero). */
async function listarClases(cursos) {
  const ahora = Date.now();
  const salida = [];
  for (const curso of cursos) {
    const { clases } = await limpiarVencidos(curso, ahora);
    for (const [id, c] of Object.entries(clases)) {
      if ((c.vence || 0) <= ahora) continue;
      const transcripcion = (c.venceTranscripcion || 0) > ahora ? c.transcripcion || '' : '';
      salida.push({ id, ...c, transcripcion });
    }
  }
  return salida.sort((a, b) => b.creado - a.creado).slice(0, 30);
}

async function obtenerClase(curso, id) {
  if (!ID_OK.test(id || '')) return null;
  return (await base().ref(`edu/clases/${curso}/${id}`).once('value')).val();
}

async function borrarClase(curso, id) {
  if (!ID_OK.test(id || '')) return;
  await base().ref().update({ [`edu/clases/${curso}/${id}`]: null, [`edu/contexto_dia/${curso}/${id}`]: null });
}

/** Lo que ven los profes IA: las últimas clases vigentes del curso (sin nombres). */
async function obtenerClasesRecientes(curso, max = 3) {
  if (!/^[a-z0-9_]{3,30}$/.test(curso || '')) return [];
  const ahora = Date.now();
  const ctx = (await base().ref(`edu/contexto_dia/${curso}`).orderByChild('creado').limitToLast(10).once('value')).val() || {};
  const arr = (v) => (Array.isArray(v) ? v : []);
  return Object.values(ctx)
    .filter((c) => (c.vence || 0) > ahora)
    .map((c) => ({ ...c, contexto: { temas: arr(c.contexto?.temas), explicaciones: arr(c.contexto?.explicaciones), tareas: arr(c.contexto?.tareas), dudas: arr(c.contexto?.dudas) } }))
    .sort((a, b) => b.creado - a.creado)
    .slice(0, max);
}

// ── Cronograma del profe (EDU.04b) ──────────────────
//    edu/planes/{personalId}/{curso} → { config, plan, hechos, perdidos, actualizado }
//    edu/planes/{personalId}/{curso}/ideas/{clave} → tarjeta de la mentora (caché)
async function leerPlan(personalId, curso) {
  const v = (await base().ref(`edu/planes/${personalId}/${curso}`).once('value')).val();
  if (!v) return null;
  const { ideas, ...resto } = v;
  return resto;
}
async function guardarPlan(personalId, curso, estado) {
  const ideas = (await base().ref(`edu/planes/${personalId}/${curso}/ideas`).once('value')).val() || null;
  await base().ref(`edu/planes/${personalId}/${curso}`).set({ ...estado, actualizado: Date.now(), ...(ideas ? { ideas } : {}) });
}
async function leerIdea(personalId, curso, clave) {
  return (await base().ref(`edu/planes/${personalId}/${curso}/ideas/${clave}`).once('value')).val();
}
async function guardarIdea(personalId, curso, clave, tarjeta) {
  await base().ref(`edu/planes/${personalId}/${curso}/ideas/${clave}`).set({ ...tarjeta, creado: Date.now() });
}

// ── Tareas y mapa del curso (EDU.04f) ─────────────
//    edu/tareas/{curso}/{tareaId}       → tarea enviada (+ asignacion {alumnoId: variante}, personalId, vence)
//    edu/tareas_estado/{curso}/{tareaId}/{alumnoId} → { estado: 'hecha'|'entregada', fecha, texto? }
//    edu/mapas/{personalId}/{curso}     → disposición del aula que guardó el profe
const VENCE_TAREA = 60 * DIA;

async function guardarTarea(curso, tarea) {
  const ahora = Date.now();
  const ref = base().ref(`edu/tareas/${curso}`).push();
  await ref.set({ ...tarea, enviada: ahora, vence: ahora + VENCE_TAREA });
  return ref.key;
}

/** Tareas vigentes del curso (borra las vencidas al leer, sin cron). */
async function listarTareas(curso) {
  const ahora = Date.now();
  const todas = (await base().ref(`edu/tareas/${curso}`).once('value')).val() || {};
  const borrar = {};
  const vigentes = [];
  for (const [id, t] of Object.entries(todas)) {
    if ((t.vence || 0) <= ahora) {
      borrar[`edu/tareas/${curso}/${id}`] = null;
      borrar[`edu/tareas_estado/${curso}/${id}`] = null;
    } else vigentes.push({ id, ...t });
  }
  if (Object.keys(borrar).length) await base().ref().update(borrar);
  return vigentes.sort((a, b) => (a.entrega < b.entrega ? -1 : a.entrega > b.entrega ? 1 : b.enviada - a.enviada));
}

async function obtenerTarea(curso, id) {
  if (!ID_OK.test(id || '')) return null;
  return (await base().ref(`edu/tareas/${curso}/${id}`).once('value')).val();
}

async function borrarTarea(curso, id) {
  if (!ID_OK.test(id || '')) return;
  await base().ref().update({ [`edu/tareas/${curso}/${id}`]: null, [`edu/tareas_estado/${curso}/${id}`]: null });
}

async function marcarTarea(curso, id, alumnoId, estado, texto = '') {
  await base().ref(`edu/tareas_estado/${curso}/${id}/${alumnoId}`).set(estado ? { estado, fecha: fechaBolivia(), ...(texto ? { texto } : {}) } : null);
}

async function estadosTareas(curso) {
  return (await base().ref(`edu/tareas_estado/${curso}`).once('value')).val() || {};
}

async function leerMapa(personalId, curso) {
  return (await base().ref(`edu/mapas/${personalId}/${curso}`).once('value')).val();
}
async function guardarMapa(personalId, curso, mapa) {
  await base().ref(`edu/mapas/${personalId}/${curso}`).set({ ...mapa, actualizado: Date.now() });
}

module.exports = {
  guardarTarea,
  listarTareas,
  obtenerTarea,
  borrarTarea,
  marcarTarea,
  estadosTareas,
  leerMapa,
  guardarMapa,
  leerPlan,
  guardarPlan,
  leerIdea,
  guardarIdea,
  obtenerPersonal,
  reservarClase,
  registrarCostoClase,
  guardarClase,
  listarClases,
  obtenerClase,
  borrarClase,
  obtenerClasesRecientes,
  VENCE,
  appAdmin, hashesDemo, fallosDemo, sumarFalloDemo, leerCacheDemo, guardarCacheDemo,
  obtenerAlumno, obtenerContenido, reservarSesion, registrarUso, obtenerMemoria, anotarEleccion, guardarUltima, obtenerSesion };
