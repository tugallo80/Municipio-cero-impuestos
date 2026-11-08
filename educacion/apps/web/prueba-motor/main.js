// Página técnica para probar el motor de voz de Kay (no es la interfaz final).
// Flujo: iniciar sesión → eduKayToken (token efímero con todo bloqueado) →
// voz en vivo con Gemini → al terminar, eduKayUso registra tokens y costo.
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { iniciarSesionKay } from '@voz-kay/kaySession.js'

// Mismo listado que services/ai-gateway/tutor/config.js (el servidor valida igual).
const VOCES = [
  { id: 'Sulafat', descripcion: 'cálida' },
  { id: 'Achird', descripcion: 'amigable' },
  { id: 'Umbriel', descripcion: 'tranquila' },
  { id: 'Vindemiatrix', descripcion: 'suave' },
  { id: 'Puck', descripcion: 'alegre' },
  { id: 'Sadaltager', descripcion: 'sabionda' },
]
const DOMINIO_CUENTAS = 'alumnos.nande-educacion.local'

const $ = (id) => document.getElementById(id)
const mostrar = (el, si) => el.classList.toggle('oculto', !si)

let auth, fnToken, fnUso
let vozElegida = localStorage.getItem('kay-voz') || VOCES[0].id
let sesion = null
let charla = null // { sesionId, usos: [], inicio, motivoFin }
let reloj = null

async function arrancar() {
  let config
  try {
    config = await (await fetch('/firebase-config.json', { cache: 'no-store' })).json()
  } catch {
    mostrarError('error-entrar', 'Falta la configuración del sitio. Avisale a quien hace el deploy.')
    return
  }
  const app = initializeApp(config)
  auth = getAuth(app)
  const functions = getFunctions(app, 'us-central1')
  fnToken = httpsCallable(functions, 'eduKayToken')
  fnUso = httpsCallable(functions, 'eduKayUso')
  onAuthStateChanged(auth, (u) => {
    mostrar($('panel-entrar'), !u)
    mostrar($('panel-charla'), !!u)
  })
}

function mostrarError(id, texto) {
  const el = $(id)
  el.textContent = texto || ''
  mostrar(el, !!texto)
}

// ── Entrar ─────────────────────────────────────────
$('form-entrar').addEventListener('submit', async (e) => {
  e.preventDefault()
  mostrarError('error-entrar', '')
  const usuario = $('usuario').value.trim().toLowerCase()
  const email = usuario.includes('@') ? usuario : `${usuario}@${DOMINIO_CUENTAS}`
  try {
    await signInWithEmailAndPassword(auth, email, $('clave').value)
  } catch {
    mostrarError('error-entrar', 'Usuario o clave incorrectos.')
  }
})
$('salir').addEventListener('click', async () => {
  terminar('salir')
  await signOut(auth)
})

// ── Voces ──────────────────────────────────────────
function pintarVoces() {
  $('voces').innerHTML = ''
  for (const v of VOCES) {
    const b = document.createElement('button')
    b.className = 'voz'
    b.type = 'button'
    b.setAttribute('aria-pressed', String(v.id === vozElegida))
    b.innerHTML = `${v.id}<small>${v.descripcion}</small>`
    b.disabled = !!sesion
    b.onclick = () => {
      vozElegida = v.id
      try { localStorage.setItem('kay-voz', v.id) } catch {}
      pintarVoces()
    }
    $('voces').appendChild(b)
  }
}

// ── Charla ─────────────────────────────────────────
const MENSAJES = { conectando: 'Despertando a Kay…', escuchando: 'Te escucho… hablá nomás', cerrado: 'Charla terminada' }

function ponerEstado(e) {
  $('estado').textContent = MENSAJES[e] || e
  const orbe = $('orbe')
  orbe.classList.toggle('vivo', e === 'escuchando')
  orbe.textContent = e === 'conectando' ? '…' : sesion || e === 'escuchando' ? 'Terminar' : 'Hablar'
  orbe.disabled = e === 'conectando'
}

// Cierre al despedirse: Kay debería llamar a terminar_conversacion, pero el modelo
// a veces se despide sin llamarla. Respaldo: si el alumno se despidió, se corta
// cuando termina de sonar la despedida de Kay (o a los 15 s, por las dudas).
const DESPEDIDA = /\b(chau|chao|adi[oó]s|nos vemos|hasta (luego|mañana)|ya termin[eé])\b/i
let textoAlumnoTurno = ''
let cierrePendiente = null
function programarCierre(motivo) {
  if (cierrePendiente || !sesion) return
  cierrePendiente = { motivo, respaldo: setTimeout(() => cerrarPendiente(), 15000) }
}
function cerrarPendiente() {
  if (!cierrePendiente) return
  clearTimeout(cierrePendiente.respaldo)
  const { motivo } = cierrePendiente
  cierrePendiente = null
  terminar(motivo)
}

let ultimaBurbuja = null
function agregarTexto({ quien, texto }) {
  if (quien === 'alumno') textoAlumnoTurno += texto
  if (quien === 'kay') $('orbe').classList.add('habla')
  if (!ultimaBurbuja || ultimaBurbuja.dataset.quien !== quien) {
    ultimaBurbuja = document.createElement('div')
    ultimaBurbuja.className = `burbuja ${quien}`
    ultimaBurbuja.dataset.quien = quien
    ultimaBurbuja.innerHTML = `<b>${quien === 'kay' ? 'Kay' : 'Vos'}</b><span></span>`
    $('charla').appendChild(ultimaBurbuja)
  }
  ultimaBurbuja.querySelector('span').textContent += texto
  $('charla').scrollTop = $('charla').scrollHeight
}

function pintarReloj() {
  if (!charla?.inicio) return
  const s = Math.floor((Date.now() - charla.inicio) / 1000)
  $('m-tiempo').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

async function empezar() {
  mostrarError('error-charla', '')
  $('charla').innerHTML = ''
  ultimaBurbuja = null
  for (const id of ['m-tokens', 'm-costo', 'm-minuto']) $(id).textContent = '—'
  charla = { sesionId: null, usos: [], inicio: null, motivoFin: 'usuario' }
  ponerEstado('conectando')
  try {
    sesion = await iniciarSesionKay({
      workletBasePath: '/audioWorklets',
      obtenerToken: async () => {
        try {
          const { data } = await fnToken({ voz: vozElegida })
          if (data?.ok) {
            charla.sesionId = data.sesionId
            $('restantes').textContent = `Charlas que te quedan hoy: ${data.sesionesRestantes} · máximo ${data.minutosMaximos} min cada una`
          }
          return data
        } catch (err) {
          return { ok: false, error: err.message }
        }
      },
      onEstado: (e) => {
        if (e === 'escuchando' && !charla.inicio) {
          charla.inicio = Date.now()
          reloj = setInterval(pintarReloj, 500)
        }
        if (e === 'cerrado') terminar('cerrado_por_gemini')
        else ponerEstado(e)
      },
      onTranscripcion: agregarTexto,
      onTurnoCompleto: () => {
        $('orbe').classList.remove('habla')
        ultimaBurbuja = null
        if (DESPEDIDA.test(textoAlumnoTurno)) programarCierre('despedida')
        textoAlumnoTurno = ''
      },
      onSilencio: () => {
        $('orbe').classList.remove('habla')
        cerrarPendiente()
      },
      onUso: (u) => charla?.usos.push(u),
      onFunctionCall: (llamada, responder) => {
        if (llamada.name === 'terminar_conversacion') {
          responder({ output: 'Listo, charla cerrada.' })
          // Corta cuando termine de sonar la despedida.
          programarCierre('herramienta')
        } else {
          responder({ error: `Herramienta desconocida: ${llamada.name}` })
        }
      },
      onError: (msg) => mostrarError('error-charla', msg),
    })
    pintarVoces()
  } catch (err) {
    sesion = null
    mostrarError('error-charla', err.message)
    ponerEstado('cerrado')
    $('orbe').textContent = 'Hablar'
    pintarVoces()
  }
}

async function terminar(motivo) {
  if (cierrePendiente) {
    clearTimeout(cierrePendiente.respaldo)
    cierrePendiente = null
  }
  textoAlumnoTurno = ''
  const s = sesion
  const c = charla
  sesion = null
  charla = null
  clearInterval(reloj)
  s?.cerrar()
  ponerEstado('cerrado')
  $('orbe').classList.remove('habla')
  pintarVoces()
  if (!c?.sesionId) return
  const segundos = c.inicio ? (Date.now() - c.inicio) / 1000 : 0
  try {
    const { data } = await fnUso({ sesionId: c.sesionId, usos: c.usos.slice(0, 500), segundos, motivoFin: c.motivoFin === 'usuario' ? motivo : c.motivoFin })
    if (data?.ok) {
      $('m-tokens').textContent = data.totalTokens.toLocaleString('es-BO')
      $('m-costo').textContent = data.costoUsd.toFixed(4)
      $('m-minuto').textContent = data.costoPorMinutoUsd.toFixed(4)
    }
  } catch {
    // no crítico: la charla ya terminó
  }
}

$('orbe').addEventListener('click', () => (sesion ? terminar('usuario') : empezar()))

pintarVoces()
arrancar()
