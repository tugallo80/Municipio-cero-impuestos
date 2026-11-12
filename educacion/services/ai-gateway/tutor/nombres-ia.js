// ══════════════════════════════════════════════════
//  EDU.16b — Nombres de los dos profes IA (la profe / el profe), configurables.
//  Por defecto, los de la demo (tools/datos/demo-piloto.json → 'ia', copiados a estudiante-demo.json
//  por armar-demo.mjs). El navegador puede mandar otros (link ?iaVaron=…&iaMujer=…): se validan
//  (solo letras y espacios, máx. 20 caracteres) y si no sirven se usan los de la demo.
//  Son TEMPORALES: los definitivos salen de la investigación de naming.
// ══════════════════════════════════════════════════
const DEF = (() => {
  try {
    const ia = require('./estudiante-demo.json').ia;
    if (ia && ia.varon && ia.mujer) return ia;
  } catch {}
  return { varon: 'Tomatao', mujer: 'Tomatina' };
})();
const OK = /^[\p{L}][\p{L} ]{0,19}$/u;
const limpio = (v, def) => {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim();
  return OK.test(s) ? s : def;
};

/** { varon, mujer } validados (o los de la demo). */
function nombresIA(x) {
  const o = x && typeof x === 'object' ? x : {};
  return { varon: limpio(o.varon, DEF.varon), mujer: limpio(o.mujer, DEF.mujer) };
}
const nombreDe = (id, n = DEF) => (id === 'el_profe' ? n.varon : n.mujer);
const tituloDe = (id, n = DEF) => (id === 'el_profe' ? `el profe ${n.varon}` : `la profe ${n.mujer}`);
/** "la profe {IA_MUJER}" → "la profe Tomatina" */
const conNombres = (s, n = DEF) => String(s ?? '').replace(/\{IA_VARON\}/g, n.varon).replace(/\{IA_MUJER\}/g, n.mujer);

module.exports = { DEF, nombresIA, nombreDe, tituloDe, conNombres };
