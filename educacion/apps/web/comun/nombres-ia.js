// ══════════════════════════════════════════════════
//  EDU.16b — Nombres de los dos profes IA para los módulos del navegador (/voz/*.js).
//  Misma regla que /maqueta/nombres-ia.js: link (?iaVaron=…&iaMujer=…, también en el #) →
//  equipo (localStorage nande-ia-varon / nande-ia-mujer) → los de la demo (demo-piloto.json → 'ia').
//  Si la página ya cargó /maqueta/nombres-ia.js (window.NandeIA), se usa ese.
// ══════════════════════════════════════════════════
import { ia as DEF } from '@tutor/estudiante-demo.json'

const OK = /^[\p{L}][\p{L} ]{0,19}$/u
const limpio = (v) => { const s = String(v || '').replace(/\s+/g, ' ').trim(); return OK.test(s) ? s : '' }
const leer = (k) => { try { return localStorage.getItem(k) || '' } catch { return '' } }

export function nombresIA() {
  if (typeof window !== 'undefined' && window.NandeIA?.varon) return { varon: window.NandeIA.varon, mujer: window.NandeIA.mujer }
  let varon = '', mujer = ''
  try {
    const q = new URLSearchParams(location.search + '&' + location.hash.replace(/^#/, ''))
    varon = limpio(q.get('iaVaron')); mujer = limpio(q.get('iaMujer'))
    if (varon) localStorage.setItem('nande-ia-varon', varon)
    if (mujer) localStorage.setItem('nande-ia-mujer', mujer)
  } catch {}
  return { varon: varon || limpio(leer('nande-ia-varon')) || DEF?.varon || 'Tomatao', mujer: mujer || limpio(leer('nande-ia-mujer')) || DEF?.mujer || 'Tomatina' }
}
export const nombreIA = (id) => (id === 'el_profe' ? nombresIA().varon : nombresIA().mujer)
export const tituloIA = (id) => (id === 'el_profe' ? 'el profe ' : 'la profe ') + nombreIA(id)
export const conNombresIA = (s) => { const n = nombresIA(); return String(s ?? '').replace(/\{IA_VARON\}/g, n.varon).replace(/\{IA_MUJER\}/g, n.mujer) }
