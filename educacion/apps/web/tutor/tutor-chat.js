// ══════════════════════════════════════════════════
//  Tutor 24/7 del alumno (EDU.16) — el chat (y la voz) que se monta en la app del alumno.
//  Se publica como /voz/tutor.js.
//
//    const t = NandeTutor.montar(elemento, { curso, materia, tarea, tema, pagina, q })
//    t.actualizar({ materia, tarea, tema, pagina })   // cambió de tema
//    t.preguntar('¿Qué tengo para mañana?')
//    t.desmontar()
//  Avisa con el evento "nande-tutor-listo".
//
//  - Con cuenta (o la llave de la demo, EDU.15): eduTutor responde con la vida escolar real.
//  - Demo: si tarda más de 3 s, falla o no hay presupuesto → respuesta de ejemplo con los datos
//    del curso real del piloto (ejemplos.js). Nunca un error en pantalla.
//  - {PROFE} → apodo del profe guardado en el equipo (localStorage nande-profe-apodo). Nunca va al servidor.
// ══════════════════════════════════════════════════
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { entrarDemo, esDemo } from '../comun/demo.js'
import { respuestaEjemplo, intencion } from './ejemplos.js'
import { nombresIA, nombreIA, tituloIA, conNombresIA } from '../comun/nombres-ia.js'

const DOMINIO_CUENTAS = 'alumnos.nande-educacion.local'
const ESPERA_DEMO_MS = 3000
const ESPERA_MAX_MS = 30000
const CLAVE_CHARLA = 'nande-tutor-charla'
const PROFES = {
  // EDU.16b: los nombres (temporales de la demo) salen de nombres-ia.js: configurables por link.
  la_profe: { get nombre() { return tituloIA('la_profe') }, get corto() { return nombreIA('la_profe') }, color: '#FBBF24', emoji: '🌸' },
  el_profe: { get nombre() { return tituloIA('el_profe') }, get corto() { return nombreIA('el_profe') }, color: '#8B5CF6', emoji: '🌿' },
}
// Los 4 primeros son los de la presentación (pedido de la MAESTRA): se muestra sin tipear.
const SUGERENCIAS = [
  '¿Qué dijo el profe hoy?',
  '¿Qué tengo para mañana?',
  '¿Qué llevo?',
  'No entiendo la pág. 58 de Inglés',
  '¿Qué tenía que decir en casa?',
  'Ayudame con mi tarea de Inglés',
]
const diag = /[?&]diag=1/.test(location.search)

// ── Conexión (si no hay internet o no está la config, queda en modo ejemplo) ──
let auth = null
let fnTutor = null
let cuenta = { estado: 'cargando', demo: false }
const listo = (async () => {
  try {
    const cfg = await (await fetch('/firebase-config.json', { cache: 'no-store' })).json()
    const app = initializeApp(cfg, 'tutor')
    auth = getAuth(app)
    const f = getFunctions(app, 'us-central1')
    fnTutor = httpsCallable(f, 'eduTutor', { timeout: ESPERA_MAX_MS + 5000 })
    await new Promise((res) => onAuthStateChanged(auth, () => res()))
    await entrarDemo(auth, f)
    onAuthStateChanged(auth, (u) => { cuenta = { estado: u ? 'conectado' : 'sin_cuenta', demo: esDemo(u) }; montados.forEach((m) => m.pintarCabecera()) })
    cuenta = { estado: auth.currentUser ? 'conectado' : 'sin_cuenta', demo: esDemo(auth.currentUser) }
  } catch (e) {
    console.warn('[tutor] sin servidor: modo ejemplo', e)
    cuenta = { estado: 'sin_servidor', demo: false }
  }
  montados.forEach((m) => m.pintarCabecera())
})()

// ── Utilidades ──
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
function apodoProfe() {
  try {
    const x = (localStorage.getItem('nande-profe-apodo') || localStorage.getItem('nande-profe') || '').trim()
    return x ? (/^profe\b/i.test(x) ? `el ${x}` : x) : 'tu profe'
  } catch { return 'tu profe' }
}
const conProfe = (t) => conNombresIA(String(t || '').replace(/\{\s*profe\s*\}/gi, apodoProfe()))
/** Texto del tutor → HTML seguro: **negrita**, *cursiva*, viñetas "• " y párrafos. */
function formato(t) {
  return esc(conProfe(t))
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/(^|[\s(])\*(?!\s)([^*\n]+?)\*(?=[\s.,;:!?)]|$)/g, '$1<i>$2</i>')
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
}
const hoyISO = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d.toISOString().slice(0, 10) }
function leerCharla() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CLAVE_CHARLA) || 'null')
    return c && c.fecha === hoyISO() && Array.isArray(c.mensajes) ? c.mensajes.slice(-30) : []
  } catch { return [] }
}
const guardarCharla = (mensajes) => { try { sessionStorage.setItem(CLAVE_CHARLA, JSON.stringify({ fecha: hoyISO(), mensajes: mensajes.filter((m) => !m.pensando).slice(-30) })) } catch {} }

const CSS = `
.nt { display: flex; flex-direction: column; background: var(--sup1, #0A0A0A); color: var(--texto, #fff); min-height: 460px; height: min(78vh, 760px); border-radius: 20px; overflow: hidden; font-family: Inter, system-ui, sans-serif; }
.nt * { box-sizing: border-box; }
.nt [hidden] { display: none !important; }
.nt-cab { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--borde, #222); background: var(--sup2, #111); }
.nt-av { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; font-size: 24px; flex: none; }
.nt-quien { flex: 1; min-width: 150px; }
.nt-quien b { font-family: 'Space Grotesk', Inter, sans-serif; font-size: 16px; display: block; }
.nt-quien small { color: var(--texto2, #A3A3A3); font-size: 12px; }
.nt-ia { display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 99px; background: rgba(16,185,129,.14); color: var(--verde, #10B981); margin-left: 6px; vertical-align: 2px; }
.nt-acciones { display: flex; gap: 8px; flex-wrap: wrap; }
.nt-btn { min-height: 44px; padding: 0 14px; border-radius: 12px; background: var(--sup3, #1A1A1A); border: 1px solid var(--borde, #222); color: var(--texto, #fff); font: 600 14px Inter, sans-serif; cursor: pointer; }
.nt-btn.verde { background: var(--verde, #10B981); color: #00140D; border-color: transparent; }
.nt-btn[disabled] { opacity: .45; cursor: default; }
.nt-foco { padding: 8px 14px; font-size: 13px; color: var(--texto2, #A3A3A3); border-bottom: 1px solid var(--borde, #222); }
.nt-foco b { color: var(--texto, #fff); }
.nt-lista { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; overscroll-behavior: contain; }
.nt-msj { max-width: 88%; padding: 10px 13px; border-radius: 16px; line-height: 1.45; font-size: 15px; overflow-wrap: anywhere; }
.nt-msj p + p { margin-top: 8px; }
.nt-msj.alumno { align-self: flex-end; background: var(--verde, #10B981); color: #00140D; border-bottom-right-radius: 5px; }
.nt-msj.tutor { align-self: flex-start; background: var(--sup3, #1A1A1A); border: 1px solid var(--borde, #222); border-bottom-left-radius: 5px; }
.nt-msj .nt-meta { margin-top: 6px; font-size: 11px; color: var(--texto3, #6B6B6B); }
.nt-msj.pensando .nt-puntos::after { content: '…'; animation: ntp 1.2s steps(3) infinite; display: inline-block; width: 1.2em; overflow: hidden; vertical-align: bottom; }
@keyframes ntp { from { width: 0 } to { width: 1.2em } }
.nt-ejemplo { display: inline-block; font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 99px; background: rgba(245,158,11,.14); color: var(--ambar, #F59E0B); margin-bottom: 4px; }
.nt-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 14px 10px; }
.nt-chips button { min-height: 40px; padding: 6px 12px; border-radius: 999px; background: var(--sup2, #111); border: 1px solid var(--borde, #222); color: var(--texto, #fff); font: 500 13px Inter, sans-serif; text-align: left; cursor: pointer; }
.nt-form { display: flex; gap: 8px; padding: 10px 12px calc(10px + env(safe-area-inset-bottom)); border-top: 1px solid var(--borde, #222); background: var(--sup2, #111); }
.nt-form textarea { flex: 1; min-width: 0; min-height: 48px; max-height: 120px; resize: none; padding: 12px 14px; border-radius: 14px; background: var(--fondo, #000); border: 1px solid var(--borde, #222); color: var(--texto, #fff); font: 15px Inter, sans-serif; }
.nt-form textarea:focus { outline: 2px solid var(--verde, #10B981); outline-offset: -1px; }
.nt-form .nt-btn { min-width: 52px; min-height: 48px; font-size: 18px; }
.nt-aviso { font-size: 12px; color: var(--texto3, #6B6B6B); padding: 0 14px 8px; }
.nt-login { display: grid; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--borde, #222); }
.nt-login input { min-height: 44px; padding: 0 12px; border-radius: 12px; background: var(--fondo, #000); border: 1px solid var(--borde, #222); color: var(--texto, #fff); font: 15px Inter, sans-serif; }
@media (max-width: 560px) {
  .nt { height: calc(100dvh - 210px); min-height: 430px; }
  .nt-acciones { width: 100%; }
  .nt-acciones .nt-btn { flex: 1; }
  .nt-msj { max-width: 94%; }
  /* En el celular las sugerencias van en una sola fila que se desliza (dentro del chat, no la página). */
  .nt-chips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; padding-bottom: 8px; }
  .nt-chips::-webkit-scrollbar { display: none; }
  .nt-chips button { flex: none; white-space: nowrap; }
  .nt-aviso { display: none; }
}
@media (min-width: 900px) { .nt-login { grid-template-columns: 1fr 1fr auto; } }
`

const montados = new Set()

function montar(el, opciones = {}) {
  if (!el) throw new Error('NandeTutor.montar: falta el elemento')
  if (!document.getElementById('nt-estilos')) {
    const st = document.createElement('style'); st.id = 'nt-estilos'; st.textContent = CSS; document.head.appendChild(st)
  }
  const E = () => window.ESTUDIANTE_DEMO || null
  let foco = {}
  let profe = 'la_profe'
  let profeElegido = false
  const mensajes = leerCharla()
  let ocupado = false
  let verLogin = false

  el.innerHTML = `
    <div class="nt" role="region" aria-label="Chat con tu tutor">
      <div class="nt-cab"></div>
      <div class="nt-login" hidden></div>
      <div class="nt-foco" hidden></div>
      <div class="nt-lista" aria-live="polite"></div>
      <div class="nt-chips"></div>
      <div class="nt-aviso"></div>
      <form class="nt-form" autocomplete="off">
        <textarea rows="1" maxlength="500" placeholder="Escribile a tu tutor…" aria-label="Tu pregunta"></textarea>
        <button class="nt-btn verde" type="submit" aria-label="Enviar">➤</button>
      </form>
    </div>`
  const $ = (s) => el.querySelector(s)
  const lista = $('.nt-lista')
  const area = $('textarea')

  function pintarCabecera() {
    const p = PROFES[profe]
    const conectado = cuenta.estado === 'conectado'
    const estado = cuenta.estado === 'cargando' ? 'Conectando…' : conectado ? (cuenta.demo ? 'Demo · sabe lo de tu curso' : 'Sabe lo de tu curso, tus tareas y tus textos') : 'Modo ejemplo (sin tu cuenta)'
    $('.nt-cab').innerHTML = `
      <div class="nt-av" style="background:${p.color}33">${p.emoji}</div>
      <div class="nt-quien"><b>${p.nombre.replace(/^./, (c) => c.toUpperCase())}<span class="nt-ia">IA</span></b><small>${esc(estado)}</small></div>
      <div class="nt-acciones">
        <button type="button" class="nt-btn" data-accion="cambiar" title="Cambiar de tutor">↔ ${PROFES[profe === 'la_profe' ? 'el_profe' : 'la_profe'].corto}</button>
        <button type="button" class="nt-btn" data-accion="voz" ${conectado ? '' : 'disabled'} title="Hablar por voz">🎙️ Hablar</button>
        ${cuenta.estado === 'sin_cuenta' ? '<button type="button" class="nt-btn" data-accion="entrar">Entrar</button>' : ''}
      </div>`
    const login = $('.nt-login')
    login.hidden = !(verLogin && cuenta.estado === 'sin_cuenta')
    if (!login.hidden && !login.innerHTML) {
      login.innerHTML = `<input name="u" placeholder="Usuario" autocomplete="username" aria-label="Usuario"><input name="c" type="password" placeholder="Clave" autocomplete="current-password" aria-label="Clave"><button type="button" class="nt-btn verde" data-accion="login">Entrar</button>`
    }
    $('.nt-aviso').textContent = conectado ? 'Soy una IA: te ayudo a pensar, no te hago la tarea. Lo que te preocupe, contáselo también a un adulto.' : 'Sin tu cuenta te muestro ejemplos con los datos del curso. Entrá para hablar con el tutor de verdad.'
  }

  function pintarFoco() {
    const f = $('.nt-foco')
    const est = E()
    const mat = foco.materia && est?.materias?.[foco.materia]
    const partes = []
    if (foco.tarea && typeof foco.tarea === 'object' && foco.tarea.titulo) partes.push(`📋 <b>${esc(foco.tarea.titulo)}</b>`)
    if (mat) partes.push(`${mat.icono || '📘'} ${esc(mat.corto || mat.nombre)}`)
    if (foco.pagina) partes.push(`📖 pág. ${esc(foco.pagina)}`)
    f.hidden = !partes.length
    f.innerHTML = partes.length ? `Hablando de: ${partes.join(' · ')}` : ''
  }

  function sugerencias() {
    const est = E()
    const th = est?.temasHoy || {}
    const xs = [...SUGERENCIAS]
    if (foco.pagina && foco.materia) xs[3] = 'No entiendo esta página'
    else if (foco.materia && th[foco.materia] && foco.materia !== 'ing') xs[3] = `No entiendo la pág. ${th[foco.materia].pagina} de ${est.materias[foco.materia]?.corto || 'esta materia'}`
    if (foco.tarea && typeof foco.tarea === 'object' && foco.tarea.titulo) xs.unshift(`Ayudame con "${foco.tarea.titulo}"`)
    return [...new Set(xs)].slice(0, 6)
  }
  function pintarChips() {
    const c = $('.nt-chips')
    c.hidden = mensajes.some((m) => m.rol === 'alumno') && mensajes.length > 2
    c.innerHTML = c.hidden ? '' : sugerencias().map((s) => `<button type="button" data-q="${esc(s)}">${esc(s)}</button>`).join('')
  }

  function pintarMensajes() {
    if (!mensajes.length) {
      const r = respuestaEjemplo('hola', foco, E(), { profe })
      mensajes.push({ rol: 'tutor', texto: r.texto, bienvenida: true })
    }
    lista.innerHTML = mensajes.map((m) => {
      if (m.rol === 'alumno') return `<div class="nt-msj alumno">${formato(m.texto)}</div>`
      const meta = diag && m.meta ? `<div class="nt-meta">${esc(m.meta)}</div>` : ''
      return `<div class="nt-msj tutor${m.pensando ? ' pensando' : ''}">${m.ejemplo ? '<span class="nt-ejemplo">Ejemplo</span>' : ''}${m.pensando && !m.texto ? '<span class="nt-puntos">Pensando</span>' : formato(m.texto)}${meta}</div>`
    }).join('')
    lista.scrollTop = lista.scrollHeight
    pintarChips()
  }

  function focoParaServidor() {
    const t = foco.tarea
    return {
      materia: foco.materia || (typeof t === 'object' ? t?.materia : null) || null,
      tema: foco.tema || null,
      pagina: foco.pagina ? Number(foco.pagina) : null,
      tarea: typeof t === 'object' ? t?.id || null : t || null,
      tareaInfo: typeof t === 'object' && t?.titulo ? { titulo: t.titulo, consigna: t.consigna || '', materia: t.materia || foco.materia || null, entrega: t.vence || t.entrega || null } : null,
    }
  }

  async function preguntar(texto) {
    const q = String(texto || '').trim().slice(0, 500)
    if (!q || ocupado) return
    ocupado = true
    const historial = mensajes.filter((m) => !m.pensando && !m.bienvenida).slice(-8).map((m) => ({ rol: m.rol, texto: conProfe(m.texto).slice(0, 600) }))
    mensajes.push({ rol: 'alumno', texto: q })
    if (!profeElegido && foco.materia && E()?.materias?.[foco.materia]) profe = /IA_VARON|\bel profe\b/i.test(E().materias[foco.materia].profeIA || E().materias[foco.materia].profe || '') ? 'el_profe' : 'la_profe'
    const resp = { rol: 'tutor', texto: '', pensando: true }
    mensajes.push(resp)
    pintarMensajes(); pintarCabecera()
    const ejemplo = () => respuestaEjemplo(q, foco, E(), { historial, profe })
    const ponerEjemplo = (motivo) => {
      if (!resp.pensando && !resp.ejemplo && resp.texto) return
      if (intencion(q) === 'riesgo') return
      Object.assign(resp, { texto: ejemplo().texto, pensando: false, ejemplo: true, meta: `ejemplo (${motivo})` })
      pintarMensajes()
    }
    await Promise.race([listo, new Promise((r) => setTimeout(r, 2000))])
    const t0 = performance.now()
    // Sin cuenta ni servidor: ejemplo honesto, al instante.
    if (!fnTutor || cuenta.estado !== 'conectado') {
      setTimeout(() => { ponerEjemplo(cuenta.estado === 'sin_servidor' ? 'sin conexión' : 'sin cuenta'); ocupado = false; guardarCharla(mensajes) }, 450)
      return
    }
    // Riesgo: también se muestra al instante (el servidor responde lo mismo, sin IA).
    if (intencion(q) === 'riesgo') { Object.assign(resp, { texto: ejemplo().texto, pensando: false }); pintarMensajes() }
    let llegoAlgo = false
    const reloj = cuenta.demo ? setTimeout(() => { if (!llegoAlgo) ponerEjemplo('tardó más de 3 s') }, ESPERA_DEMO_MS) : null
    const reemplazar = (txt) => { Object.assign(resp, { texto: txt, pensando: false, ejemplo: false }) }
    try {
      const datos = { pregunta: q, foco: focoParaServidor(), historial, profe: profeElegido ? profe : null, ia: nombresIA() }
      let final
      if (typeof fnTutor.stream === 'function') {
        const { stream, data } = await fnTutor.stream(datos)
        let acumulado = ''
        for await (const pedazo of stream) {
          if (!pedazo?.t) continue
          acumulado += pedazo.t
          if (!llegoAlgo) { llegoAlgo = true; clearTimeout(reloj) }
          reemplazar(acumulado)
          pintarMensajes()
        }
        final = await data
      } else {
        final = (await fnTutor(datos)).data
      }
      clearTimeout(reloj)
      if (final?.ok && final.texto) {
        llegoAlgo = true
        reemplazar(final.texto)
        if (final.profe && PROFES[final.profe] && !profeElegido) profe = final.profe
        resp.meta = `${final.cache ? 'caché' : final.modelo} · ${((performance.now() - t0) / 1000).toFixed(1)} s${final.primerPedazoMs ? ` (1.ª letra ${(final.primerPedazoMs / 1000).toFixed(1)} s)` : ''} · USD ${Number(final.costoUsd || 0).toFixed(4)} · ${final.intencion}`
      } else {
        // Sin presupuesto o tope del día: en la demo, el ejemplo; si no, el mensaje amable del servidor.
        if (cuenta.demo || !final?.error) ponerEjemplo(final?.motivo || 'sin respuesta')
        else Object.assign(resp, { texto: `${final.error}\n\nMientras tanto, esto te puede servir:\n\n${ejemplo().texto}`, pensando: false, ejemplo: true })
      }
    } catch (e) {
      clearTimeout(reloj)
      console.warn('[tutor]', e)
      if (resp.pensando || !resp.texto || resp.ejemplo) ponerEjemplo('falló la conexión')
    }
    pintarMensajes(); pintarCabecera()
    ocupado = false
    guardarCharla(mensajes)
  }

  async function voz() {
    if (cuenta.estado !== 'conectado') return
    if (!window.ProfesVoz) { try { const u = '/voz/profes.js?v=edu16-1'; await import(/* @vite-ignore */ u) } catch {} }
    const PV = window.ProfesVoz
    if (!PV) return
    const f = focoParaServidor()
    PV.contexto({ materia: f.materia, mision: null, tutor: { materia: f.materia, tema: f.tema, pagina: f.pagina, tarea: f.tarea, tareaInfo: f.tareaInfo } })
    PV.llamar(profe)
  }

  async function entrar() {
    const u = el.querySelector('.nt-login input[name=u]')?.value || ''
    const c = el.querySelector('.nt-login input[name=c]')?.value || ''
    if (!auth || !u || !c) return
    try {
      await signInWithEmailAndPassword(auth, u.includes('@') ? u : `${u.trim().toLowerCase()}@${DOMINIO_CUENTAS}`, c)
      verLogin = false
    } catch {
      $('.nt-aviso').textContent = 'Usuario o clave incorrectos.'
    }
  }

  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('button')
    if (!b || !el.contains(b)) return
    if (b.dataset.q) return preguntar(b.dataset.q)
    const a = b.dataset.accion
    if (a === 'cambiar') { profe = profe === 'la_profe' ? 'el_profe' : 'la_profe'; profeElegido = true; pintarCabecera() }
    else if (a === 'voz') voz()
    else if (a === 'entrar') { verLogin = !verLogin; pintarCabecera() }
    else if (a === 'login') entrar()
  })
  $('.nt-form').addEventListener('submit', (ev) => { ev.preventDefault(); const q = area.value; area.value = ''; preguntar(q) })
  area.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); $('.nt-form').requestSubmit() } })

  function actualizar(op = {}) {
    let tarea = op.tarea || null
    if (typeof tarea === 'string') {
      const t = (window.tareasDelAlumno ? window.tareasDelAlumno() : E()?.tareas || []).find((x) => x.id === tarea)
      tarea = t ? { id: t.id, titulo: t.titulo, consigna: t.consigna, materia: t.materia, vence: t.vence || t.entrega } : { id: tarea }
    }
    foco = { materia: op.materia || tarea?.materia || null, tema: op.tema || null, pagina: op.pagina || null, tarea }
    if (foco.tema && !foco.materia) foco.materia = String(foco.tema).split('-')[0]
    pintarFoco(); pintarChips()
  }

  const yo = {
    actualizar,
    preguntar,
    pintarCabecera,
    desmontar() { montados.delete(yo); el.innerHTML = '' },
    cerrar() { yo.desmontar() },
  }
  montados.add(yo)
  actualizar(opciones)
  pintarCabecera()
  pintarMensajes()
  if (opciones.q) setTimeout(() => preguntar(opciones.q), 300)
  return yo
}

window.NandeTutor = { version: 1, montar, listo }
window.dispatchEvent(new Event('nande-tutor-listo'))
