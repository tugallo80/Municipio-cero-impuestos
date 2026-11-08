// ══════════════════════════════════════════════════
//  Reglas de cuota (lógica pura, sin base de datos, para poder probarla).
// ══════════════════════════════════════════════════

// Fecha del día en Bolivia (UTC-4, sin horario de verano): las cuotas se reinician
// a la medianoche local, no a la de Greenwich.
function fechaBolivia(ahora = Date.now()) {
  return new Date(ahora - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * ¿Puede este alumno abrir otra charla hoy?
 * @param {{sesiones?:number, tokens?:number}} usoAlumno uso de hoy del alumno
 * @param {{costoUsd?:number}} usoGlobal uso de hoy de todo el sistema
 * @param {{sesionesPorAlumnoDia:number, tokensPorAlumnoDia:number, costoGlobalDiaUsd:number}} limites
 * @returns {{ok:true} | {ok:false, motivo:string, mensaje:string}}
 */
function evaluarCuota(usoAlumno = {}, usoGlobal = {}, limites) {
  if ((usoGlobal.costoUsd || 0) >= limites.costoGlobalDiaUsd) {
    return {
      ok: false,
      motivo: 'tope_global',
      mensaje: 'Kay ya habló mucho hoy con todos los chicos. ¡Mañana seguimos!',
    };
  }
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

module.exports = { fechaBolivia, evaluarCuota };
