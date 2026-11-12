// ══════════════════════════════════════════════════
//  Reglas de cuota (lógica pura, sin base de datos, para poder probarla).
// ══════════════════════════════════════════════════

// Fecha del día en Bolivia (UTC-4, sin horario de verano): las cuotas se reinician
// a la medianoche local, no a la de Greenwich.
function fechaBolivia(ahora = Date.now()) {
  return new Date(ahora - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Las bolsas de gasto del día (EDU.04e, EDU.15):
 *  - general: chicos, profes y la cuenta del dueño (tope EDU_TOPE_COSTO_GLOBAL_DIA_USD, USD 5)
 *  - pruebas: las cuentas de prueba automática del workflow (tope EDU_TOPE_COSTO_PRUEBAS_DIA_USD, USD 1)
 *  - demo: la cuenta de la demo sin login (tope EDU_TOPE_COSTO_DEMO_DIA_USD, USD 2)
 * Ninguna gasta de la bolsa de otra: si la suya se agota, esa cuenta usa ejemplos o espera a mañana.
 * Se reinician a la medianoche de Bolivia (fechaBolivia).
 * @param {boolean|'demo'} tipo true = pruebas · 'demo' = demo · false = general
 */
function bolsa(tipo, limites) {
  if (tipo === 'demo') return { ruta: 'edu/uso_demo', tope: limites.costoDemoDiaUsd ?? 2, motivo: 'tope_demo', mensaje: 'La demo ya usó su presupuesto de IA de hoy: te mostramos un ejemplo.' };
  return tipo === true
    ? { ruta: 'edu/uso_pruebas', tope: limites.costoPruebasDiaUsd, motivo: 'tope_pruebas', mensaje: 'Las pruebas automáticas ya usaron su presupuesto de IA de hoy.' }
    : { ruta: 'edu/uso_global', tope: limites.costoGlobalDiaUsd, motivo: 'tope_global', mensaje: 'Kay ya habló mucho hoy con todos los chicos. ¡Mañana seguimos!' };
}

/** Qué bolsa usa un perfil (edu/alumnos/… o edu/personal/…). */
const tipoDeBolsa = (perfil) => (perfil?.pruebaAuto === true ? true : perfil?.demo === true ? 'demo' : false);

/**
 * ¿Puede este alumno abrir otra charla hoy?
 * @param {{sesiones?:number, tokens?:number}} usoAlumno uso de hoy del alumno
 * @param {{costoUsd?:number}} usoGlobal uso de hoy de todo el sistema
 * @param {{sesionesPorAlumnoDia:number, tokensPorAlumnoDia:number, costoGlobalDiaUsd:number, costoPruebasDiaUsd?:number}} limites
 * @param {boolean} esPrueba cuenta de prueba automática (usa la bolsa de pruebas)
 * @returns {{ok:true} | {ok:false, motivo:string, mensaje:string}}
 */
function evaluarCuota(usoAlumno = {}, usoGlobal = {}, limites, esPrueba = false) {
  const b = bolsa(esPrueba, limites);
  if ((usoGlobal.costoUsd || 0) >= b.tope) return { ok: false, motivo: b.motivo, mensaje: b.mensaje };
  if ((usoAlumno.sesiones || 0) >= limites.sesionesPorAlumnoDia) {
    return {
      ok: false,
      motivo: 'sesiones_alumno',
      mensaje: `Hoy ya usaste tus ${limites.sesionesPorAlumnoDia} charlas con Kay. ¡Mañana hay más!`,
    };
  }
  if ((usoAlumno.tokens || 0) >= limites.tokensPorAlumnoDia) {
    return {
      ok: false,
      motivo: 'tokens_alumno',
      mensaje: 'Hoy ya estudiaste un montón con Kay. ¡Descansá y mañana seguimos!',
    };
  }
  return { ok: true };
}

module.exports = { fechaBolivia, evaluarCuota, bolsa, tipoDeBolsa };
