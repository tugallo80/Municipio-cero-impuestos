// ══════════════════════════════════════════════════
//  Tutor 24/7 (EDU.16) — respuestas de EJEMPLO armadas en el equipo, sin IA.
//  Se usan en la demo cuando la IA tarda más de 3 s, falla o no hay presupuesto, y sin cuenta.
//  Salen de los MISMOS datos del curso real del piloto que ve la app (window.ESTUDIANTE_DEMO,
//  generado desde tools/datos/demo-piloto.json): nunca inventan algo que la app no muestre.
// ══════════════════════════════════════════════════
import INTENCIONES from '@tutor/tutor24-intenciones.json'

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const CLAVE = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']
const normal = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const REGEX = Object.fromEntries(Object.entries(INTENCIONES.patrones).map(([k, xs]) => [k, xs.map((x) => new RegExp(x))]))

export function intencion(pregunta) {
  const t = normal(pregunta)
  for (const k of INTENCIONES.orden) if (REGEX[k].some((r) => r.test(t))) return k
  return 'otro'
}

const ALIAS = { ing: ['ingles', 'english'], mat: ['mate', 'matematica', 'matematicas'], len: ['lenguaje', 'lengua', 'castellano'], fil: ['filosofia', 'psicologia', 'cosmovisiones'], art: ['artes', 'arte', 'plastica'], mus: ['musica'], val: ['valores', 'religion'], bio: ['biologia', 'geografia'], csoc: ['sociales'], efd: ['educacion fisica', 'ed. fisica', 'gimnasia'] }
/** La materia que nombra la pregunta (igual que el servidor, tutor24.js). */
export function materiaDe(pregunta, materias = {}) {
  const t = ` ${normal(pregunta).replace(/[^a-z0-9ñ. ]+/g, ' ')} `
  for (const [id, xs] of Object.entries(ALIAS)) {
    const nombres = [...xs, normal(materias[id]?.corto || ''), normal(materias[id]?.nombre || '')].filter((x) => x.length >= 4)
    if (nombres.some((n) => t.includes(` ${n} `))) return id
  }
  return null
}

export const RESPUESTA_RIESGO = [
  'Gracias por contármelo. Soy una IA y esto es demasiado importante para que lo hables solo con una máquina. 💛',
  'Contáselo **hoy** a un adulto de confianza: alguien de tu familia, {PROFE}, la dirección o el regente.',
  'Si estás en peligro ahora mismo, pedí ayuda a un adulto que esté cerca o llamá al **110** (Policía). La Defensoría de la Niñez y Adolescencia de tu municipio también te puede ayudar.',
  'No es tu culpa y no estás solo/a.',
].join('\n\n')

const aFecha = (s) => new Date(`${s}T12:00:00`)
const iso = (d) => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x.toISOString().slice(0, 10) }
const sumar = (s, n) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d) }
const largo = (s) => { const d = aFecha(s); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}` }
function cuando(s, hoy) {
  const n = Math.round((aFecha(s) - aFecha(hoy)) / 864e5)
  return n === 0 ? 'hoy' : n === 1 ? 'mañana' : n === -1 ? 'ayer' : `el ${largo(s)}`
}
const proximoDia = (hoy) => { let d = sumar(hoy, 1); while (!(aFecha(d).getDay() % 6)) d = sumar(d, 1); return d }

/** Datos del alumno en la forma que sea (la cruda de estudiante-demo.js o la ya normalizada por estudiante.js). */
function datos(E) {
  const x = E || {}
  const materias = x.materias || {}
  let clases = () => []
  if (Array.isArray(x.horario)) clases = (f) => x.horario.filter((h) => h.dia === aFecha(f).getDay()).map((h) => h.materia)
  else if (x.horario) clases = (f) => (x.horario[CLAVE[aFecha(f).getDay()]] || []).filter(Boolean)
  const llevar = Array.isArray(x.llevar) ? x.llevar : x.llevarFechas || []
  const llevarPorMateria = !Array.isArray(x.llevar) && x.llevar ? x.llevar : {}
  let tareas = []
  try { tareas = typeof window !== 'undefined' && window.tareasDelAlumno ? window.tareasDelAlumno() : x.tareas || [] } catch { tareas = x.tareas || [] }
  tareas = tareas.map((t) => ({ ...t, fecha: t.vence || t.entrega, pistas: t.escalera || t.pistas || [] })).filter((t) => t.titulo)
  return { materias, clases, llevar, llevarPorMateria, avisos: x.avisos || [], eventos: x.eventos || [], tareas, temasHoy: x.temasHoy || {} }
}
const unicos = (xs) => [...new Set(xs)]
const corto = (D, m) => D.materias[m]?.corto || D.materias[m]?.nombre || m

/**
 * Respuesta de ejemplo para la pregunta, con los datos del curso.
 * @param {string} pregunta
 * @param {{materia?, tema?, pagina?, tarea?: {id,titulo,consigna}|string}} foco
 * @param {object} E window.ESTUDIANTE_DEMO
 * @param {{hoy?: string, historial?: {rol,texto}[], profe?: string}} op
 */
export function respuestaEjemplo(pregunta, foco = {}, E, op = {}) {
  const hoy = op.hoy || iso(new Date())
  const D = datos(E)
  const yo = op.profe === 'el_profe' ? 'el profe Jochi' : 'la profe Taji'
  const tipo = intencion(pregunta)
  const prox = proximoDia(hoy)
  const fut = (xs) => xs.filter((x) => (x.fecha || '') >= hoy).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  const pendientes = D.tareas.filter((t) => t.estado !== 'hecha').sort((a, b) => ((a.fecha || '') < (b.fecha || '') ? -1 : 1))

  if (tipo === 'riesgo') return { tipo, texto: RESPUESTA_RIESGO }
  if (tipo === 'emocional') {
    return { tipo, texto: 'Gracias por contarme cómo te sentís. 💛 Soy una IA, así que lo mejor es que lo hables con alguien que te quiere: tu familia, {PROFE} o alguien de la dirección. Contarlo ayuda, de verdad.\n\nSi querés, después seguimos con lo del colegio, de a poquito.' }
  }
  if (tipo === 'llevar') {
    const dias = [prox, proximoDia(prox)]
    const items = []
    for (const d of dias) {
      const mats = unicos(D.clases(d))
      const delDia = fut(D.llevar).filter((l) => l.fecha === d || (l.materia && mats.includes(l.materia) && l.fecha <= d))
      for (const l of delDia) items.push(`• ${cuando(d, hoy).replace(/^el /, '')} — ${corto(D, l.materia)}: ${l.texto}`)
      for (const m of mats) if (D.llevarPorMateria[m] && !delDia.some((l) => l.materia === m)) items.push(`• ${cuando(d, hoy).replace(/^el /, '')} — ${corto(D, m)}: ${D.llevarPorMateria[m]}`)
      if (d === prox && mats.length) items.push(`• Y los cuadernos de ${mats.map((m) => corto(D, m)).join(', ')}.`)
    }
    return { tipo, texto: items.length ? `Para las próximas clases:\n${unicos(items).slice(0, 6).join('\n')}\n\n¿Querés que repasemos algo de esas materias?` : 'No tengo nada especial cargado para llevar. Llevá los cuadernos de las materias del día y, si {PROFE} pidió algo en clase, anotalo acá.' }
  }
  if (tipo === 'casa') {
    const avisos = fut(D.avisos).slice(0, 3)
    return { tipo, texto: avisos.length ? `Esto es lo que hay que avisar en tu casa:\n${avisos.map((a) => `• ${a.fecha === hoy ? 'Hoy' : `Para ${cuando(a.fecha, hoy)}`}: ${String(a.texto).replace(/^Avisar en casa:\s*/i, '')}`).join('\n')}\n\n¡Contáselo hoy, así no se olvida! 🏠` : 'No hay avisos para la casa cargados. Si {PROFE} dijo algo en clase, preguntale de nuevo.' }
  }
  if (tipo === 'manana') {
    const mats = unicos(D.clases(prox))
    const t = pendientes.filter((x) => x.fecha && x.fecha <= sumar(prox, 3))
    const ev = fut(D.eventos).filter((e) => e.fecha <= sumar(prox, 3))
    const partes = [`${cuando(prox, hoy).replace(/^./, (c) => c.toUpperCase())} (${largo(prox)}) tenés: ${mats.map((m) => corto(D, m)).join(', ') || 'no hay clases'}.`]
    if (t.length) partes.push(`Tareas que se vienen:\n${t.slice(0, 3).map((x) => `• ${corto(D, x.materia)} — "${x.titulo}", para ${cuando(x.fecha, hoy)}`).join('\n')}`)
    if (ev.length) partes.push(`Y ojo: ${ev.slice(0, 2).map((e) => `${e.tipo === 'examen' ? 'evaluación' : e.tipo} de ${corto(D, e.materia)} (${e.titulo}) ${cuando(e.fecha, hoy)}`).join('; ')}.`)
    partes.push('¿Arrancamos por la tarea más cercana?')
    return { tipo, texto: partes.join('\n\n') }
  }
  const nombrada = materiaDe(pregunta, D.materias)
  const m = nombrada || foco.materia || (typeof foco.tarea === 'object' && foco.tarea?.materia) || (foco.tema ? String(foco.tema).split('-')[0] : null)
  if (tipo === 'clase') {
    const mm = m && D.temasHoy[m] ? m : 'ing'
    const th = D.temasHoy[mm]
    if (!th) return { tipo, texto: 'Todavía no tengo el resumen de esa clase. Preguntale a {PROFE} o a un compañero, y mirá tu cuaderno.' }
    const extra = mm === 'ing' ? ' Leyeron "Patricia\'s talents" (pág. 57) y practicaron preguntas como **Is she playing the charango?** — Yes, she is. El verbo to be va adelante.' : ''
    return { tipo, texto: `En ${corto(D, mm)}, {PROFE} está con la unidad ${th.unidad}, "${th.titulo}" (pág. ${th.pagina}): ahora ${th.enCurso}.${extra}\n\n¿Qué parte querés que repasemos?` }
  }
  if (tipo === 'texto') {
    const mm = m && D.temasHoy[m] ? m : 'ing'
    const th = D.temasHoy[mm]
    const pag = foco.pagina || Number((/\bp[aá]g(?:ina)?\.?\s*(\d{1,3})/i.exec(pregunta) || [])[1]) || th?.pagina
    if (mm === 'ing') {
      return { tipo, texto: `En la pág. ${pag || 58} está el **present continuous en preguntas**. Es fácil: el verbo to be va primero.\n• He/She/It → **Is** she playing…?\n• You/We/They → **Are** they playing…?\n• I → **Am** I playing…?\nY el verbo lleva -ing. Por ejemplo: *Is your cousin playing the bombo?* — Yes, he is.\n\n¿Probás armar una con un deporte que te guste?` }
    }
    return { tipo, texto: th ? `En ${corto(D, mm)} van por la unidad ${th.unidad}, "${th.titulo}" (desde la pág. ${th.pagina}), con ${th.enCurso}. Contame qué frase o qué palabra de la pág. ${pag} no se entiende y lo vemos juntos, de a poquito.` : 'Decime la materia y la página, y vemos esa parte juntos.' }
  }
  if (tipo === 'tarea' || foco.tarea) {
    const id = typeof foco.tarea === 'object' ? foco.tarea?.id : foco.tarea
    const t = (nombrada && pendientes.find((x) => x.materia === nombrada)) || pendientes.find((x) => x.id === id) || (typeof foco.tarea === 'object' && foco.tarea?.titulo ? { ...foco.tarea, pistas: [] } : null) || pendientes.find((x) => !m || x.materia === m) || pendientes[0]
    if (!t) return { tipo, texto: 'No veo tareas pendientes. ¡Bien ahí! Si {PROFE} dejó algo nuevo, contame de qué se trata.' }
    const dadas = (op.historial || []).filter((x) => x.rol === 'tutor' && /peldaño|pista|pregunta para pensar/i.test(x.texto)).length
    const pista = t.pistas[dadas]
    const pide = /respuesta|hac[eé]mela|resolv[eé]/i.test(normal(pregunta))
    const inicio = pide ? 'La respuesta no te la voy a dar 😉, pero te ayudo a llegar solo/a. ' : ''
    if (dadas === 0) return { tipo, texto: `${inicio}Vamos con "${t.titulo}"${t.fecha ? ` (para ${cuando(t.fecha, hoy)})` : ''}.\n\nPrimera pregunta para pensar: ¿qué te pide exactamente la consigna? Contámelo con tus palabras.${pista ? `\n\n💡 Pista de {PROFE}: ${pista}` : ''}` }
    return { tipo, texto: pista ? `${inicio}Siguiente peldaño 💡: ${pista}\n\nProbá con una y me la mostrás.` : `${inicio}Hacé el primer paso y mostrámelo: te digo qué está bien y qué revisar.` }
  }
  return {
    tipo,
    texto: `¡Hola! Soy ${yo}, una IA de ÑANDÉ. Sé lo que está viendo tu curso, tus tareas y tus textos, y te ayudo a pensar (la tarea la hacés vos 😉). Podés preguntarme:\n• ¿Qué tengo para mañana?\n• ¿Qué tengo que llevar?\n• No entiendo la pág. ${D.temasHoy.ing?.pagina || 57} de Inglés\n• Ayudame con mi tarea`,
  }
}
