// GENERADO por tools/datos/armar-demo.mjs desde tools/datos/demo-piloto.json. No editar a mano.
// Nombres de los dos profes IA (TEMPORALES de la demo; los definitivos salen de la investigación de naming).
// Prioridad: link (?iaVaron=…&iaMujer=…, también en el #) → equipo (localStorage nande-ia-varon / nande-ia-mujer) → demo-piloto.json.
// window.NandeIA = { varon, mujer, nombre(id), titulo(id), Titulo(id), texto(s) }   id: 'la_profe' | 'el_profe'
(function () {
  const DEF = {"varon":"Tomatao","mujer":"Tomatina"};
  const OK = /^[\p{L}][\p{L} ]{0,19}$/u;
  const limpio = (v) => { const s = String(v || '').replace(/\s+/g, ' ').trim(); return OK.test(s) ? s : ''; };
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k) || ''; localStorage.setItem(k, v); } catch (e) {} return ''; };
  try {
    const q = new URLSearchParams(location.search + '&' + location.hash.replace(/^#/, ''));
    const v = limpio(q.get('iaVaron')), m = limpio(q.get('iaMujer'));
    if (v) ls('nande-ia-varon', v);
    if (m) ls('nande-ia-mujer', m);
  } catch (e) {}
  const varon = limpio(ls('nande-ia-varon')) || DEF.varon, mujer = limpio(ls('nande-ia-mujer')) || DEF.mujer;
  const nombre = (id) => (id === 'el_profe' ? varon : mujer);
  const titulo = (id) => (id === 'el_profe' ? 'el profe ' : 'la profe ') + nombre(id);
  const texto = (s) => String(s == null ? '' : s).replace(/\{IA_VARON\}/g, varon).replace(/\{IA_MUJER\}/g, mujer);
  window.NandeIA = { varon, mujer, nombre, titulo, Titulo: (id) => titulo(id).replace(/^./, (c) => c.toUpperCase()), texto, def: DEF };
})();
