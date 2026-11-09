// ══════════════════════════════════════════════════
//  Clase grabada (EDU.04a): la parte que habla con el servidor.
//  Se publica como /voz/clase.js y lo carga el panel del profe y el de la
//  dirección de la maqueta (/maqueta/tutor.html, /maqueta/direccion.html).
//  La grabación y la pantalla viven en /maqueta/clase.js (sin build).
//
//  Expone window.NandeClase y avisa con el evento "nande-clase-listo".
//  Si no carga (sin internet, maqueta abierta como archivo), el panel sigue con
//  el ejemplo de datos ficticios.
// ══════════════════════════════════════════════════
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'

const DOMINIO_CUENTAS = 'alumnos.nande-educacion.local'

const cfg = await (await fetch('/firebase-config.json', { cache: 'no-store' })).json()
const app = initializeApp(cfg, 'clase')
const auth = getAuth(app)
const f = getFunctions(app, 'us-central1')
// La IA tarda: hasta 9 minutos para una clase de una hora (lo normal es 1–2 min).
const fnClase = httpsCallable(f, 'eduClase', { timeout: 540_000 })
const fnClases = httpsCallable(f, 'eduClases')
// EDU.04b: cronograma y mentora del profe
const fnPlan = httpsCallable(f, 'eduPlan', { timeout: 300_000 })
const fnMentora = httpsCallable(f, 'eduMentora', { timeout: 70_000 })
const llamar = async (fn, datos) => {
  try {
    const r = await fn(datos)
    return r.data.ok ? r.data : { ok: false, error: r.data.error || 'No se pudo.' }
  } catch (e) {
    return { ok: false, error: mensaje(e) }
  }
}

let usuario = null
await new Promise((res) => onAuthStateChanged(auth, (u) => { usuario = u; res() }))
onAuthStateChanged(auth, (u) => { usuario = u })

const mensaje = (err) => {
  const m = String(err?.message || err || '')
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/i.test(m)) return 'Usuario o clave incorrectos.'
  if (/network|Failed to fetch|internal/i.test(m)) return 'No hay conexión con el servidor. Probá de nuevo.'
  if (/deadline/i.test(m)) return 'La IA tardó demasiado. Probá de nuevo en un rato.'
  return m.replace(/^Firebase: |\(functions\/[a-z-]+\)\.?/g, '').trim() || 'Algo falló.'
}

window.NandeClase = {
  conectado: true,
  usuario: () => (usuario ? usuario.email.split('@')[0] : null),
  async entrar(u, clave) {
    try {
      await signInWithEmailAndPassword(auth, u.includes('@') ? u : `${u.trim().toLowerCase()}@${DOMINIO_CUENTAS}`, clave)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: mensaje(e) }
    }
  },
  async salir() { await signOut(auth) },
  async procesar(datos) {
    try {
      const r = await fnClase(datos)
      return r.data.ok ? r.data : { ok: false, error: r.data.error || 'No se pudo.' }
    } catch (e) {
      return { ok: false, error: mensaje(e) }
    }
  },
  async listar() {
    try { return (await fnClases({ accion: 'listar' })).data } catch (e) { return { ok: false, error: mensaje(e) } }
  },
  // Cronograma (EDU.04b)
  leerPlan: (curso) => llamar(fnPlan, { accion: 'leer', curso }),
  guardarPlan: (curso, estado) => llamar(fnPlan, { accion: 'guardar', curso, estado }),
  extraerPlan: (curso, datos) => llamar(fnPlan, { accion: 'extraer', curso, ...datos }), // datos: { texto } o { pdf }
  mentora: (datos) => llamar(fnMentora, datos),
  async borrar(curso, id) {
    try { return (await fnClases({ accion: 'borrar', curso, id })).data } catch (e) { return { ok: false, error: mensaje(e) } }
  },
}
window.dispatchEvent(new Event('nande-clase-listo'))
