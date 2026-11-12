// ══════════════════════════════════════════════════
//  Los profes dentro del mundo (EDU.02b).
//  Se publica como /voz/profes.js y lo carga la maqueta del alumno
//  (/maqueta/alumno.html). Si no carga (sin internet, maqueta abierta como
//  archivo), la maqueta sigue con su ayuda simulada de texto.
//
//  - Dos profes siempre disponibles: el niño toca la cara de uno o del otro.
//    Tocar al otro en medio de la charla = relevo (no cuenta como charla nueva).
//    Por voz: "quiero hacerlo con la profe" → herramienta llamar_profe.
//  - La voz no abre pantalla: se nota con un MARCO que palpita o una FRANJA de
//    luz abajo que se mueve con el sonido. Interruptor para comparar.
//  - El profe sabe en qué misión/paso está el niño (solo IDs al servidor) y
//    recibe avisos [JUEGO] cuando se equivoca, pide pista o termina.
// ══════════════════════════════════════════════════
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { entrarDemo } from '../comun/demo.js'
import { iniciarSesionKay } from '@voz-kay/kaySession.js'
import config from '@tutor/profes.json'

const DOMINIO_CUENTAS = 'alumnos.nande-educacion.local'
const DESPEDIDA = /\b(chau|chao|adi[oó]s|nos vemos|hasta (luego|mañana)|ya termin[eé])/i
const leer = (k, d) => { try { return localStorage.getItem(k) ?? d } catch { return d } }
const guardar = (k, v) => { try { localStorage.setItem(k, v) } catch {} }

let PROFES = config.profes.map(({ id, nombre, titulo, color }) => ({ id, nombre, titulo, color }))
const profe = (id) => PROFES.find((p) => p.id === id)

// ── Estado ────────────────────────────────────────
let auth = null
let fnToken, fnUso, fnProfes
let usuario = null
let preferencias = {}
let ctx = { materia: null, mision: null } // lo informa la maqueta
let charla = null // { profe, sesion, sesionId, usos, inicio, hablando, cola, cierre, textoAlumno, peldanoMax }
let ocupado = false
let efecto = new URLSearchParams(location.search).get('efecto') || leer('profes-efecto', 'franja')
const oyentes = { estado: [], pista: [] }
const emitir = (tipo, dato) => oyentes[tipo].forEach((f) => { try { f(dato) } catch (e) { console.error(e) } })

// ── Estilos y elementos (fuera del juego, sin tapar nada: pointer-events: none) ──
const css = `
.pv-capa{position:fixed;pointer-events:none;z-index:55;opacity:0;transition:opacity .35s;contain:strict}
.pv-capa.ver{opacity:1}
#pv-marco{inset:0}
#pv-marco i{position:absolute;inset:0;border-radius:22px;will-change:opacity}
#pv-marco .luz{border:3px solid var(--pv-c);box-shadow:inset 0 0 28px 8px var(--pv-c),inset 0 0 70px 10px var(--pv-c2);opacity:.35}
#pv-marco .oye{border:3px solid rgba(255,255,255,.85);box-shadow:inset 0 0 26px 6px rgba(255,255,255,.55);opacity:0}
#pv-franja{left:0;right:0;bottom:0;height:90px}
#pv-franja .caja{position:absolute;inset:0;transform-origin:50% 100%;will-change:transform,opacity;transform:scaleY(.35);opacity:.6}
#pv-franja .caja b{position:absolute;bottom:-78px;width:70%;height:130px;border-radius:50%;background:radial-gradient(closest-side,var(--pv-c),transparent);will-change:transform}
#pv-franja .caja b:nth-child(1){left:-10%;animation:pv-va 5.5s ease-in-out infinite alternate}
#pv-franja .caja b:nth-child(2){left:20%;background:radial-gradient(closest-side,var(--pv-c2),transparent);animation:pv-va 4.2s ease-in-out infinite alternate-reverse}
#pv-franja .caja b:nth-child(3){left:45%;animation:pv-va 6.3s ease-in-out infinite alternate}
#pv-franja .oye{position:absolute;left:15%;right:15%;bottom:-40px;height:80px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.9),transparent);opacity:0;will-change:opacity}
@keyframes pv-va{from{transform:translateX(-12%)}to{transform:translateX(16%)}}
.pv-conectando #pv-marco .luz,.pv-conectando #pv-franja .caja{animation:pv-respira 1.2s ease-in-out infinite alternate}
@keyframes pv-respira{from{opacity:.15}to{opacity:.6}}
#pv-pildora{position:fixed;left:50%;top:calc(108px + env(safe-area-inset-top));transform:translateX(-50%);z-index:56;display:none;align-items:center;gap:6px;background:rgba(15,26,23,.9);border:2px solid var(--pv-c,#10B981);border-radius:99px;padding:4px 4px 4px 12px;font:600 13px Inter,system-ui,sans-serif;color:#fff;white-space:nowrap;box-shadow:0 4px 0 rgba(0,0,0,.25)}
#pv-pildora.ver{display:flex}
#pv-pildora [hidden]{display:none!important}
#pv-pildora button{font:inherit;color:#fff;background:rgba(255,255,255,.1);border:0;border-radius:99px;min-height:34px;padding:0 10px;cursor:pointer}
#pv-pildora .colgar{background:#DC2626}
#pv-pildora #pv-sonido{background:#FDE047;color:#422006;font-weight:700;animation:pv-respira .8s ease-in-out infinite alternate}
#pv-entrar{position:fixed;inset:0;z-index:70;background:rgba(4,12,10,.6);display:none;align-items:flex-end;justify-content:center;font-family:Inter,system-ui,sans-serif}
#pv-entrar.ver{display:flex}
#pv-entrar form{width:100%;max-width:420px;background:#0A0A0A;border:2px solid #1F3B33;border-radius:24px 24px 0 0;padding:20px 16px calc(22px + env(safe-area-inset-bottom));color:#fff;display:grid;gap:10px}
#pv-entrar h2{font:700 20px 'Space Grotesk',sans-serif}
#pv-entrar p{color:#A3A3A3;font-size:14px}
#pv-entrar input{min-height:50px;border-radius:14px;border:2px solid #262626;background:#111;color:#fff;padding:0 14px;font-size:16px}
#pv-entrar .fila{display:flex;gap:10px}
#pv-entrar button{flex:1;min-height:52px;border-radius:14px;border:0;font:700 16px 'Space Grotesk',sans-serif;cursor:pointer}
#pv-entrar .si{background:#10B981;color:#04261B}
#pv-entrar .no{background:#262626;color:#fff}
#pv-entrar .error{color:#FCA5A5;font-size:14px;min-height:18px}
@media (prefers-reduced-motion: reduce){#pv-franja .caja b{animation:none}}
/* EDU.02c — horizontal primero: la píldora va debajo de las caras (arriba a la izquierda),
   la franja es más baja para no tapar el círculo de caminar ni los botones, y el login
   aparece centrado y compacto. En vertical queda como antes. */
@media (orientation:landscape){
#pv-pildora{left:max(10px,env(safe-area-inset-left));top:calc(max(8px,env(safe-area-inset-top)) + 60px);transform:none}
#pv-franja{height:70px}
#pv-franja .caja b{width:45%;height:110px;bottom:-70px}
#pv-franja .caja b:nth-child(1){left:-5%}#pv-franja .caja b:nth-child(2){left:28%}#pv-franja .caja b:nth-child(3){left:60%}
#pv-franja .oye{left:25%;right:25%}
#pv-marco i{border-radius:28px}
#pv-entrar{align-items:flex-start;overflow-y:auto;overscroll-behavior:contain;padding:max(8px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))}
#pv-entrar form{max-width:560px;margin:auto 0;border-radius:20px;padding:12px 14px;gap:8px;grid-template-columns:1fr 1fr;align-items:center}
#pv-entrar h2{font-size:17px;grid-column:1/-1}
#pv-entrar p{font-size:12px;grid-column:1/-1;margin-top:-6px}
#pv-entrar input{min-height:44px}
#pv-entrar .error{grid-column:1/-1;min-height:0}
#pv-entrar .error:empty{display:none}
#pv-entrar .fila{grid-column:1/-1}
#pv-entrar button{min-height:46px}
}
`
const estilo = document.createElement('style')
estilo.textContent = css
document.head.appendChild(estilo)
document.body.insertAdjacentHTML(
  'beforeend',
  `<div id="pv-marco" class="pv-capa" aria-hidden="true"><i class="luz"></i><i class="oye"></i></div>
   <div id="pv-franja" class="pv-capa" aria-hidden="true"><div class="caja"><b></b><b></b><b></b></div><i class="oye"></i></div>
   <div id="pv-pildora" role="status"><span id="pv-texto"></span>
     <button type="button" id="pv-sonido" hidden>🔊 Tocá para activar el sonido</button>
     <button type="button" id="pv-efecto" title="Cambiar cómo se ve la voz"></button>
     <button type="button" class="colgar" id="pv-colgar" title="Colgar">✕</button></div>
   <div id="pv-entrar"><form>
     <h2>Entrá para hablar con los profes</h2>
     <p>Usá la cuenta de prueba que te dieron.</p>
     <input name="usuario" placeholder="Usuario" autocomplete="username" autocapitalize="none" required>
     <input name="clave" type="password" placeholder="Clave" autocomplete="current-password" required>
     <div class="error"></div>
     <div class="fila"><button type="button" class="no">Ahora no</button><button class="si">Entrar</button></div>
   </form></div>`
)
const $ = (id) => document.getElementById(id)
const marco = $('pv-marco')
const sonido = $('pv-sonido')
sonido.onclick = () => { charla?.sesion?.reanudarAudio?.(); window.__sonidoTocado = true }
const franja = $('pv-franja')

function pintarEfecto() {
  $('pv-efecto').textContent = efecto === 'marco' ? '▢ Marco' : '≋ Franja'
  const activo = !!charla
  marco.classList.toggle('ver', activo && efecto === 'marco')
  franja.classList.toggle('ver', activo && efecto === 'franja')
}
$('pv-efecto').onclick = () => {
  efecto = efecto === 'marco' ? 'franja' : 'marco'
  guardar('profes-efecto', efecto)
  pintarEfecto()
}
$('pv-colgar').onclick = () => colgar()

function ponerColor(p) {
  for (const el of [marco, franja, $('pv-pildora')]) {
    el.style.setProperty('--pv-c', p.color)
    el.style.setProperty('--pv-c2', p.color + '88')
  }
}

function avisar(texto) {
  if (typeof window.toast === 'function') window.toast(texto, 3500)
  else alert(texto)
}

// ── Animación con el sonido (un solo rAF, solo durante la charla) ──
let suave = 0
let suaveOye = 0
let raf = 0
function animar() {
  raf = 0
  if (!charla?.sesion) return
  // Si el celular suspende el audio (llamada, otra app, ahorro de energía), avisar con un botón.
  const bloqueado = !!charla.sesion.estadoAudio && charla.sesion.estadoAudio() !== 'running'
  if (sonido.hidden === bloqueado) sonido.hidden = !bloqueado
  const habla = charla.sesion.nivelSalida()
  const oye = charla.sesion.nivelEntrada()
  suave += (habla - suave) * (habla > suave ? 0.5 : 0.12)
  suaveOye += (oye - suaveOye) * (oye > suaveOye ? 0.4 : 0.1)
  if (efecto === 'marco') {
    marco.children[0].style.opacity = (0.3 + suave * 0.7).toFixed(3)
    marco.children[1].style.opacity = (suaveOye * 0.6).toFixed(3)
  } else {
    const caja = franja.children[0]
    caja.style.transform = `scaleY(${(0.35 + suave * 0.75).toFixed(3)})`
    caja.style.opacity = (0.5 + suave * 0.4).toFixed(3)
    franja.children[1].style.opacity = (suaveOye * 0.7).toFixed(3)
  }
  raf = requestAnimationFrame(animar)
}

// ── Estado visible ────────────────────────────────
function pintar(estado) {
  const p = charla && profe(charla.profe)
  document.documentElement.classList.toggle('pv-conectando', estado === 'conectando')
  $('pv-pildora').classList.toggle('ver', !!charla)
  if (p) {
    ponerColor(p)
    $('pv-texto').textContent = estado === 'conectando' ? `Llamando a ${p.titulo}…` : `🎙️ ${p.titulo}`
  }
  pintarEfecto()
  emitir('estado', { activo: !!charla, profe: charla?.profe || null, estado, profes: PROFES, preferido: preferido() })
}
const preferido = () => (ctx.materia && preferencias[ctx.materia]) || null

// ── Firebase ──────────────────────────────────────
const listo = (async () => {
  // (si falla, llamar() avisa; la maqueta sigue funcionando)
  const cfg = await (await fetch('/firebase-config.json', { cache: 'no-store' })).json()
  const app = initializeApp(cfg, 'profes')
  auth = getAuth(app)
  const f = getFunctions(app, 'us-central1')
  fnToken = httpsCallable(f, 'eduKayToken')
  fnUso = httpsCallable(f, 'eduKayUso')
  fnProfes = httpsCallable(f, 'eduProfes')
  await new Promise((res) => onAuthStateChanged(auth, (u) => { usuario = u; res() }))
  // EDU.15: con la llave de la demo se entra solo (sin pedir usuario ni clave).
  if ((await entrarDemo(auth, f)).ok) usuario = auth.currentUser
  if (usuario) cargarProfes()
})()
listo.catch((e) => console.warn('[profes] sin conexión:', e))

async function cargarProfes() {
  try {
    const { data } = await fnProfes({})
    if (data?.ok) {
      PROFES = data.profes
      preferencias = data.preferencias || {}
      pintar(charla ? 'escuchando' : 'libre')
    }
  } catch { /* no crítico */ }
}

function pedirEntrada() {
  return new Promise((resolver) => {
    const velo = $('pv-entrar')
    const form = velo.querySelector('form')
    const error = velo.querySelector('.error')
    error.textContent = ''
    velo.classList.add('ver')
    // Con el teclado abierto la pantalla acostada queda muy baja: llevar el campo a la vista.
    for (const campo of form.querySelectorAll('input')) {
      campo.onfocus = () => setTimeout(() => campo.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
    }
    const fin = (ok) => { velo.classList.remove('ver'); resolver(ok) }
    velo.querySelector('.no').onclick = () => fin(false)
    form.onsubmit = async (e) => {
      e.preventDefault()
      const u = form.usuario.value.trim().toLowerCase()
      try {
        await signInWithEmailAndPassword(auth, u.includes('@') ? u : `${u}@${DOMINIO_CUENTAS}`, form.clave.value)
        usuario = auth.currentUser
        cargarProfes()
        fin(true)
      } catch {
        error.textContent = 'Usuario o clave incorrectos.'
      }
    }
  })
}

// ── Avisos del juego al profe ([JUEGO]) ───────────
// Si el profe está hablando, se guarda el último aviso y se manda cuando calla
// (así no lo corta a mitad de frase). Terminar la misión tiene prioridad.
function avisoJuego(texto, prioridad = 0) {
  if (!charla?.sesion || charla.cierre) return
  const espera = charla.esperaHasta - Date.now()
  if (charla.hablando || espera > 0) {
    if (!charla.cola || prioridad >= charla.cola.prioridad) charla.cola = { texto, prioridad }
    if (!charla.hablando) setTimeout(soltarCola, espera + 50)
    return
  }
  charla.sesion.enviarTexto(`[JUEGO] ${texto}`)
  // Margen para que el profe empiece a responder antes de mandar otro aviso.
  charla.esperaHasta = Date.now() + 6000
}
function soltarCola() {
  if (!charla?.cola || charla.hablando || charla.esperaHasta > Date.now()) return
  const { texto } = charla.cola
  charla.cola = null
  avisoJuego(texto)
}

const MD = () => window.MISIONES_DEMO
function describirPaso(m) {
  const c = MD()?.contenido(m.id)
  if (!c) return ''
  const lista = m.fase === 'repaso' ? c.repaso : c.pasos
  const p = lista[m.paso]
  return p ? `${m.fase === 'repaso' ? `Repaso ${m.paso + 1} de ${c.repaso.length}` : `Paso ${m.paso + 1} de ${c.pasos.length}`}: "${p.q}"` : ''
}

// ── Charla ────────────────────────────────────────
async function empezar(profeId, relevoDe = null) {
  charla = { profe: profeId, sesion: null, sesionId: null, usos: [], inicio: null, hablando: false, esperaHasta: 0, cola: null, cierre: null, textoAlumno: '', peldanoMax: ctx.mision?.peldano || 0 }
  const esta = charla
  pintar('conectando')
  try {
    const sesion = await iniciarSesionKay({
      workletBasePath: '/audioWorklets',
      ctxSalida: tomarSalida(),
      obtenerToken: async () => {
        try {
          // EDU.16: desde "Mi tutor" la voz recibe el mismo foco que el chat (materia, tema, página, tarea).
          const { data } = await fnToken({ profe: profeId, mision: ctx.mision, relevoDe, ...(ctx.tutor && !ctx.mision ? { tutor: ctx.tutor } : {}) })
          if (data?.ok) esta.sesionId = data.sesionId
          return data
        } catch (err) {
          return { ok: false, error: err.message }
        }
      },
      onEstado: (e) => {
        if (esta !== charla) return
        if (e === 'escuchando' && !esta.inicio) {
          esta.inicio = Date.now()
          pintar('escuchando')
        }
        if (e === 'cerrado') terminar('cerrado_por_gemini')
      },
      onTranscripcion: ({ quien, texto }) => {
        if (esta !== charla) return
        if (quien === 'kay') esta.hablando = true
        else esta.textoAlumno += texto
      },
      onTurnoCompleto: () => {
        if (esta !== charla) return
        if (DESPEDIDA.test(esta.textoAlumno)) programarCierre({ tipo: 'fin', motivo: 'despedida' })
        esta.textoAlumno = ''
        // Respaldo por si el reproductor no avisa el silencio (ej. después de una interrupción).
        setTimeout(() => {
          if (esta !== charla || !esta.sesion || esta.sesion.nivelSalida() > 0.02) return
          esta.hablando = false
          if (esta.cierre) return ejecutarCierre()
          soltarCola()
        }, 1500)
      },
      onSilencio: () => {
        if (esta !== charla) return
        esta.hablando = false
        esta.esperaHasta = 0
        if (esta.cierre) return ejecutarCierre()
        soltarCola()
      },
      onUso: (u) => esta.usos.push(u),
      onFunctionCall: (llamada, responder) => {
        if (llamada.name === 'terminar_conversacion') {
          responder({ output: 'Listo.' })
          programarCierre({ tipo: 'fin', motivo: 'herramienta' })
        } else if (llamada.name === 'llamar_profe') {
          const otro = String(llamada.args?.profe || '')
          if (profe(otro) && otro !== esta.profe) {
            responder({ output: 'Listo, ya lo llamo.' })
            programarCierre({ tipo: 'relevo', a: otro })
          } else responder({ output: 'Ya está hablando con vos.' })
        } else if (llamada.name === 'mostrar_pista') {
          const n = Math.max(1, Math.min(3, Number(llamada.args?.peldano) || 1))
          esta.peldanoMax = Math.max(esta.peldanoMax, n)
          emitir('pista', n)
          responder({ output: 'Se ve en pantalla.' })
        } else responder({ error: `Herramienta desconocida: ${llamada.name}` })
      },
      onError: (msg) => console.warn('[profes]', msg),
    })
    if (esta !== charla) {
      // Colgó mientras se conectaba: cerrar y registrar la charla vacía.
      sesion.cerrar()
      if (esta.sesionId) fnUso({ sesionId: esta.sesionId, usos: [], segundos: 0, motivoFin: 'cancelada' }).catch(() => {})
      return
    }
    esta.sesion = sesion
    if (!raf) raf = requestAnimationFrame(animar)
    // Si arranca sin misión abierta, que salude; si hay misión, ya la conoce.
  } catch (err) {
    if (esta === charla) charla = null
    pintar('libre')
    avisar(err.message || 'No se pudo llamar al profe.')
    console.warn(err)
  }
}

// Corta cuando termina de sonar la despedida (o a los 12 s, por las dudas).
function programarCierre(cierre) {
  if (!charla || charla.cierre) return
  charla.cierre = { ...cierre, respaldo: setTimeout(ejecutarCierre, 12000) }
  if (!charla.hablando) setTimeout(() => charla?.cierre && !charla.hablando && ejecutarCierre(), 2500)
}
function ejecutarCierre() {
  const c = charla?.cierre
  if (!c) return
  clearTimeout(c.respaldo)
  if (c.tipo === 'relevo') relevo(c.a)
  else terminar(c.motivo)
}

async function terminar(motivo) {
  const c = charla
  if (!c) return
  charla = null
  if (c.cierre) clearTimeout(c.cierre.respaldo)
  cancelAnimationFrame(raf)
  raf = 0
  c.sesion?.cerrar()
  pintar('libre')
  if (!c.sesionId) return
  const segundos = c.inicio ? (Date.now() - c.inicio) / 1000 : 0
  const m = ctx.mision
  const resumen = m ? { ...m, peldano: Math.max(m.peldano || 0, c.peldanoMax || 0) } : null
  try {
    await fnUso({ sesionId: c.sesionId, usos: c.usos.slice(0, 500), segundos, motivoFin: motivo, resumen })
  } catch { /* no crítico */ }
}

async function relevo(aId) {
  if (ocupado) return
  ocupado = true
  try {
    const anterior = charla?.sesionId || null
    await terminar('relevo')
    await empezar(aId, anterior)
  } finally {
    ocupado = false
  }
}

// ── API para la maqueta ───────────────────────────
// Contexto de reproducción creado DENTRO del toque en la cara del profe (antes de
// cualquier await): en Android/iOS es lo que garantiza que el audio suene.
let salidaPreparada = null
function prepararSalida() {
  try {
    if (salidaPreparada && salidaPreparada.state !== 'closed') return
    const AC = window.AudioContext || window.webkitAudioContext
    salidaPreparada = new AC({ sampleRate: 24000 })
    salidaPreparada.resume().catch(() => {})
    // un instante de silencio "desbloquea" la salida en algunos celulares
    const b = salidaPreparada.createBuffer(1, 240, 24000), f = salidaPreparada.createBufferSource()
    f.buffer = b; f.connect(salidaPreparada.destination); f.start()
  } catch { salidaPreparada = null }
}
// ── Modo diagnóstico (?diag=1): muestra en pantalla el estado del audio y deja probar el parlante ──
if (new URLSearchParams(location.search).get('diag') === '1') {
  const caja = document.createElement('div')
  caja.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:max(8px,env(safe-area-inset-bottom));z-index:80;background:rgba(0,0,0,.85);color:#fff;font:12px/1.35 monospace;padding:6px 10px;border-radius:10px;display:flex;gap:8px;align-items:center;max-width:96vw'
  caja.innerHTML = '<span id="pv-diag">audio: sin charla</span><button type="button" style="font:inherit;background:#FDE047;color:#000;border:0;border-radius:8px;padding:6px 8px">🔈 Probar parlante</button>'
  document.body.appendChild(caja)
  caja.querySelector('button').onclick = () => {
    for (const [hz, f, t] of [[24000, 440, 0], [undefined, 660, 0.6]]) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext
        const c = hz ? new AC({ sampleRate: hz }) : new AC()
        const o = c.createOscillator(), g = c.createGain()
        o.frequency.value = f; g.gain.value = 0.2; o.connect(g).connect(c.destination)
        c.resume(); o.start(c.currentTime + t); o.stop(c.currentTime + t + 0.4)
        setTimeout(() => c.close(), 1500)
      } catch (e) { $('pv-diag').textContent = 'error: ' + e.message }
    }
  }
  setInterval(() => {
    const d = charla?.sesion?.diagnostico?.()
    $('pv-diag').textContent = d
      ? `salida ${d.salida} ${d.hz}Hz · mic ${d.entrada} · llegaron ${d.bloques} bloques (${(d.muestras / 24000).toFixed(1)} s) · nivel ${charla.sesion.nivelSalida().toFixed(2)}`
      : 'audio: sin charla (tocá la cara de un profe)'
  }, 300)
}
function tomarSalida() { const c = salidaPreparada; salidaPreparada = null; return c }
async function llamar(profeId) {
  if (ocupado || !profe(profeId)) return
  if (charla?.profe !== profeId) prepararSalida()
  try {
    await listo
  } catch {
    return avisar('No se pudo conectar con los profes. Revisá tu internet.')
  }
  if (!usuario && !(await pedirEntrada())) return
  if (charla?.profe === profeId) return colgar()
  if (charla) return relevo(profeId)
  ocupado = true
  try {
    await empezar(profeId)
  } finally {
    ocupado = false
  }
}
function colgar() {
  if (charla) terminar('usuario')
}

function contexto(nuevo) {
  ctx = { materia: nuevo?.materia || nuevo?.mision?.materia || null, mision: nuevo?.mision || null, tutor: nuevo?.tutor && typeof nuevo.tutor === 'object' ? nuevo.tutor : null }
  if (ctx.mision && !ctx.materia) ctx.materia = MD()?.MISIONES[ctx.mision.id]?.materia || null
  if (charla && ctx.mision) charla.peldanoMax = Math.max(charla.peldanoMax, ctx.mision.peldano || 0)
  pintar(charla ? 'escuchando' : 'libre')
}

/** Eventos de la maqueta → avisos al profe (solo si hay charla). */
function evento(tipo, d = {}) {
  const m = ctx.mision
  const titulo = m && MD()?.MISIONES[m.id]?.titulo
  if (tipo === 'mision' && m) avisoJuego(`Abrió la misión "${titulo}". ${describirPaso(m)}. Comentá algo cortito para arrancar.`)
  else if (tipo === 'paso' && m) avisoJuego(`Acertó y pasó a: ${describirPaso(m)}.`)
  else if (tipo === 'error' && m) avisoJuego(`En ${describirPaso(m)} eligió "${d.opcion}", que no es la correcta. Ayudalo con el siguiente peldaño, sin decir la respuesta.`)
  else if (tipo === 'peldano' && m) avisoJuego(`Tocó el botón de ayuda: en pantalla apareció el peldaño ${d.peldano} (${['', 'pregunta', 'pista', 'ejemplo resuelto'][d.peldano]}). Explicáselo con tu voz, cortito.`)
  else if (tipo === 'completa') avisoJuego(`¡Terminó la misión "${d.titulo || titulo}"${d.premio ? ` y ganó ${d.premio}` : ''}! Celebrá con alegría camba.`, 2)
}

// Demo del efecto sin gastar charlas (?demo-voz=la_profe): una "voz" falsa que sube y baja.
function demoEfecto(profeId = 'la_profe') {
  if (charla || !profe(profeId)) return
  const t0 = performance.now()
  const ola = () => {
    const t = (performance.now() - t0) / 1000
    const habla = (Math.sin(t * 0.9) > -0.2 ? 1 : 0) * (0.35 + 0.35 * Math.abs(Math.sin(t * 7.3)) + 0.25 * Math.abs(Math.sin(t * 13.1)))
    return Math.min(1, habla)
  }
  charla = { profe: profeId, demo: true, sesion: { nivelSalida: ola, nivelEntrada: () => 0, cerrar() {}, enviarTexto() {} }, usos: [], cola: null }
  pintar('escuchando')
  raf = requestAnimationFrame(animar)
}

window.ProfesVoz = {
  version: 1,
  listo,
  get profes() { return PROFES },
  get activo() { return charla?.profe || null },
  llamar,
  colgar,
  contexto,
  evento,
  demoEfecto,
  al: (tipo, fn) => oyentes[tipo]?.push(fn),
}
window.dispatchEvent(new Event('profes-voz-listo'))
pintar('libre')
const demo = new URLSearchParams(location.search).get('demo-voz')
if (demo) demoEfecto(demo === '1' ? 'la_profe' : demo)
