// ══════════════════════════════════════════════════
//  Reglas de cuota (lógica pura, sin base de datos, para poder probarla).
// ══════════════════════════════════════════════════

// Fecha del día en Bolivia (UTC-4, sin horario de verano): las cuotas se reinician
// a la medianoche local, no a la de Greenwich.
function fechaBolivia(ahora = Date.now()) {
  return new Date(ahora - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Las dos bolsas de gasto del día (EDU.04e):
 *  - general: chicos, profes y la cuenta demo del dueño (tope EDU_TOPE_COSTO_GLOBAL_DIA_USD, USD 5)
 *  - pruebas: las cuentas de prueba automática del workflow (tope EDU_TOPE_COSTO_PRUEBAS_DIA_USD, USD 1)
 * Las pruebas NUNCA gastan de la bolsa general: si la suya se agota, se saltean.
 * Las dos se reinician a la medianoche de Bolivia (fechaBolivia).
 */
function bolsa(esPrueba, limites) {
  return esPrueba
    ? { ruta: 'edu/uso_pruebas', tope: limites.costoPruebasDiaUsd, motivo: 'tope_pruebas', mensaje: 'Las pruebas automáticas ya usaron su presupuesto de IA de hoy.' }
    : { ruta: 'edu/uso_global', tope: limites.costoGlobalDiaUsd, motivo: 'tope_global', mensaje: 'Kay ya habló mucho hoy con todos los chicos. ¡Mañana seguimos!' };
}

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

module.exports = { fechaBolivia, evaluarCuota, bolsa };
