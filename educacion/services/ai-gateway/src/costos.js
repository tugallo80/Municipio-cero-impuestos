// ══════════════════════════════════════════════════
//  Costo estimado de la voz en vivo, a partir del usageMetadata que manda la
//  Live API de Gemini en cada turno.
//
//  Precios en USD por millón de tokens (Gemini 3.1 Flash Live preview, nov-2026,
//  según agregadores de precios: confirmar en ai.google.dev/pricing y ajustar acá
//  o con variables EDU_PRECIO_*). Audio ≈ 25 tokens por segundo.
// ══════════════════════════════════════════════════

function precio(nombre, porDefecto) {
  const v = Number(process.env[nombre]);
  return Number.isFinite(v) && v >= 0 ? v : porDefecto;
}

const PRECIOS_USD_POR_MILLON = {
  entradaTexto: precio('EDU_PRECIO_ENTRADA_TEXTO', 0.75),
  entradaAudio: precio('EDU_PRECIO_ENTRADA_AUDIO', 3.0),
  salidaTexto: precio('EDU_PRECIO_SALIDA_TEXTO', 4.5),
  salidaAudio: precio('EDU_PRECIO_SALIDA_AUDIO', 12.0),
};

const VACIO = () => ({ entradaTexto: 0, entradaAudio: 0, salidaTexto: 0, salidaAudio: 0 });

function entero(v) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? Math.min(n, 50_000_000) : 0;
}

// Reparte una lista de {modality, tokenCount} en texto / audio.
function repartir(detalles, total, clave, acc) {
  let asignado = 0;
  for (const d of Array.isArray(detalles) ? detalles : []) {
    const n = entero(d?.tokenCount);
    asignado += n;
    if (String(d?.modality).toUpperCase() === 'AUDIO') acc[`${clave}Audio`] += n;
    else acc[`${clave}Texto`] += n;
  }
  // Si el total es mayor que el detalle (o no hay detalle), el resto se cuenta como
  // audio: es lo más caro, así la estimación nunca queda corta.
  const resto = entero(total) - asignado;
  if (resto > 0) acc[`${clave}Audio`] += resto;
}

/** Convierte un usageMetadata de la Live API en tokens por tipo. */
function normalizarUso(meta) {
  const acc = VACIO();
  if (!meta || typeof meta !== 'object') return acc;
  repartir(meta.promptTokensDetails, meta.promptTokenCount, 'entrada', acc);
  repartir(meta.responseTokensDetails, meta.responseTokenCount, 'salida', acc);
  acc.entradaTexto += entero(meta.toolUsePromptTokenCount);
  acc.salidaTexto += entero(meta.thoughtsTokenCount);
  return acc;
}

function sumar(a, b) {
  const r = VACIO();
  for (const k of Object.keys(r)) r[k] = (a[k] || 0) + (b[k] || 0);
  return r;
}

function totalTokens(t) {
  return t.entradaTexto + t.entradaAudio + t.salidaTexto + t.salidaAudio;
}

function costoUsd(t) {
  let usd = 0;
  for (const [k, p] of Object.entries(PRECIOS_USD_POR_MILLON)) usd += ((t[k] || 0) * p) / 1_000_000;
  return Math.round(usd * 1_000_000) / 1_000_000;
}

/**
 * Resume la lista de usageMetadata de una charla. La Live API manda uno por turno
 * y cada turno vuelve a cobrar todo el contexto acumulado, así que lo facturado es
 * la SUMA de los turnos.
 */
function resumirUso(lista) {
  const turnos = (Array.isArray(lista) ? lista : []).slice(0, 500).map(normalizarUso);
  const tokens = turnos.reduce(sumar, VACIO());
  return { turnos: turnos.length, tokens, totalTokens: totalTokens(tokens), costoUsd: costoUsd(tokens) };
}

module.exports = { PRECIOS_USD_POR_MILLON, normalizarUso, resumirUso, costoUsd, totalTokens };
