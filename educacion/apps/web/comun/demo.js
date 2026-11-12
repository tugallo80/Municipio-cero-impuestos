// ══════════════════════════════════════════════════
//  Demo sin login (EDU.15), compartido por /voz/clase.js y /voz/profes.js.
//
//  La llave llega en el link (?demo=<llave> o #demo=<llave>) y queda guardada en el equipo
//  (localStorage "nande-demo"), así el iframe de la presentación y la app instalada entran solos.
//  Se saca de la barra de direcciones apenas se lee (que no se vea al compartir pantalla).
//  Con la llave, eduDemo devuelve un pase (custom token) para la cuenta demo fija.
// ══════════════════════════════════════════════════
import { signInWithCustomToken, signOut } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'

const CLAVE = 'nande-demo'
const UID_DEMO = 'demo-nande-01'
const LLAVE_OK = /^[A-Za-z0-9_-]{16,80}$/

const leer = () => { try { return localStorage.getItem(CLAVE) || '' } catch { return '' } }
const guardar = (v) => { try { v ? localStorage.setItem(CLAVE, v) : localStorage.removeItem(CLAVE) } catch {} }

/** Lee la llave del link (y la guarda) o la recordada en el equipo. */
export function llaveDemo() {
  let llave = ''
  try {
    const url = new URL(location.href)
    const deQuery = url.searchParams.get('demo')
    const deHash = /(?:^#|[#&])demo=([^&]+)/.exec(url.hash)?.[1]
    llave = decodeURIComponent(deQuery || deHash || '')
    // Solo una llave de verdad (16+ caracteres): "?demo=1" es otra cosa (selector de curso de EDU.06a) y no se toca.
    if (LLAVE_OK.test(llave)) {
      // Las dos partes (clase y profes) leen la llave: la segunda ya no la ve en el link.
      try { sessionStorage.setItem('nande-demo-link', '1') } catch {}
      url.searchParams.delete('demo')
      // "#demo=x" o "#mapa&demo=x": se quita solo la llave, la ruta queda.
      url.hash = url.hash.replace(/[#&]?demo=[^&]*/, '').replace(/^#&/, '#')
      history.replaceState(history.state, '', url.pathname + url.search + (url.hash.length > 1 ? url.hash : ''))
    }
  } catch {}
  if (LLAVE_OK.test(llave)) guardar(llave)
  return LLAVE_OK.test(llave) ? llave : leer()
}

export const esDemo = (usuario) => usuario?.uid === UID_DEMO

/**
 * Si hay llave y no estamos ya en la cuenta demo, entra solo. No pisa la sesión de otra cuenta
 * salvo que la llave venga en el link (el link manda).
 * @returns {Promise<{ok:boolean, demo:boolean, error?:string}>}
 */
export async function entrarDemo(auth, funciones) {
  let delLink = /[?&#]demo=[A-Za-z0-9_-]{16,80}/.test(location.href)
  try { delLink = delLink || sessionStorage.getItem('nande-demo-link') === '1' } catch {}
  const llave = llaveDemo()
  if (!llave) return { ok: false, demo: false }
  if (esDemo(auth.currentUser)) return { ok: true, demo: true }
  if (auth.currentUser && !delLink) return { ok: false, demo: false }
  try {
    const r = await httpsCallable(funciones, 'eduDemo', { timeout: 15_000 })({ llave })
    await signInWithCustomToken(auth, r.data.token)
    return { ok: true, demo: true }
  } catch (e) {
    const m = String(e?.message || e)
    // Llave vencida o mala: se olvida, para no reintentar en cada carga.
    if (/permission-denied|no es válido|ya no sirve/i.test(m)) guardar('')
    return { ok: false, demo: false, error: m.replace(/^Firebase: |\(functions\/[a-z-]+\)\.?/g, '').trim() }
  }
}

export async function salirDemo(auth) {
  guardar('')
  if (esDemo(auth.currentUser)) await signOut(auth)
}
