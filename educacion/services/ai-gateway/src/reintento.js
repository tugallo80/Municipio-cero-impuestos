// ══════════════════════════════════════════════════
//  EDU.16c — Reintentos ante fallas PASAJERAS de Gemini (sin red ni base: se prueba en test/).
//
//  Visto en los logs del 13-nov-2026: Gemini respondió 503 "This model is currently experiencing high
//  demand" a eduPlan (a los 15,7 s), y una llamada de eduTutor se colgó hasta que la Function se cortó
//  a los 60 s (504). Antes, esas fallas llegaban directo al alumno o al profe.
//
//  Regla: cada intento tiene su tiempo máximo (se corta con AbortSignal). Si falla por algo pasajero
//  (503, 429, 500, tiempo, red) o vuelve vacío, se espera un poco y se reintenta UNA vez.
//  "Modelo inexistente" no es pasajero: se salta al siguiente modelo de la lista.
// ══════════════════════════════════════════════════

const PASAJERO = /\b(429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|INTERNAL|DEADLINE|overloaded|high demand|try again|timed? ?out|tiempo|abort|ECONNRESET|ETIMEDOUT|socket hang up|fetch failed|network/i;
const NO_EXISTE = /not found|404|is not supported|no longer available|deprecated/i;

const esPasajero = (err) => PASAJERO.test(String(err?.name || '') + ' ' + String(err?.message || err || ''));
const noExiste = (err) => NO_EXISTE.test(String(err?.message || err || ''));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/** Error que marca una respuesta vacía (se trata como pasajero: se reintenta). */
class RespuestaVacia extends Error {
  constructor(m = 'La IA devolvió una respuesta vacía') {
    super(m);
    this.name = 'RespuestaVacia';
  }
}

/**
 * Llama a `intento(modelo, señal, n)` recorriendo los modelos, con hasta `intentos` llamadas reales.
 *  - Modelo inexistente → siguiente modelo (no cuenta como intento).
 *  - Falla pasajera o RespuestaVacia → espera `esperaMs` y reintenta (mismo modelo; si vuelve a fallar, el siguiente).
 *  - Cualquier otra falla → se corta ahí.
 *  - Cada intento se aborta a los `limiteMs`; no se empieza uno nuevo si ya pasó `presupuestoMs`.
 * @returns {Promise<{valor:any, modelo:string, intentos:number, fallas:string[]}>}
 */
async function conReintento(modelos, intento, op = {}) {
  const { intentos = 2, limiteMs = 25_000, esperaMs = 1200, presupuestoMs = 55_000, alReintentar = null } = op;
  const t0 = Date.now();
  const fallas = [];
  let usados = 0;
  let ultimo = null;
  const lista = [...modelos];
  let i = 0;
  while (i < lista.length && usados < intentos) {
    const modelo = lista[i];
    if (usados > 0) {
      if (Date.now() - t0 + esperaMs > presupuestoMs) break;
      if (alReintentar) await alReintentar(fallas[fallas.length - 1]);
      await esperar(esperaMs);
    }
    const ctrl = new AbortController();
    const reloj = setTimeout(() => ctrl.abort(new Error(`Tiempo agotado (${limiteMs} ms)`)), Math.min(limiteMs, Math.max(1000, presupuestoMs - (Date.now() - t0))));
    try {
      const valor = await intento(modelo, ctrl.signal, usados + 1);
      return { valor, modelo, intentos: usados + 1, fallas };
    } catch (err) {
      ultimo = ctrl.signal.aborted && !(err instanceof RespuestaVacia) ? new Error(`Tiempo agotado (${limiteMs} ms): ${err?.message || err}`) : err;
      if (noExiste(err) && !(err instanceof RespuestaVacia)) { i++; continue; }
      usados++;
      fallas.push(`${modelo}: ${String(ultimo?.message || ultimo).slice(0, 160)}`);
      if (!(err instanceof RespuestaVacia) && !ctrl.signal.aborted && !esPasajero(err)) throw err;
      // Un modelo que falló dos veces seguidas por demanda: el próximo intento va con el siguiente.
      if (usados >= 2) i++;
    } finally {
      clearTimeout(reloj);
    }
  }
  const e = ultimo || new Error('Sin modelos');
  e.fallas = fallas;
  throw e;
}

module.exports = { conReintento, esPasajero, noExiste, RespuestaVacia, esperar };
