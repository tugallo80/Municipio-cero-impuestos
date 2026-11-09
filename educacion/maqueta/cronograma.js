// ══════════════════════════════════════════════════
//  Cronograma y mentora del profe (EDU.04b) — pantalla (sin build).
//
//  Asistente en 4 pasos: ① plan (PDF → IA, o el de ejemplo) ② escuela y gestión
//  ③ horario semanal ④ días propios. El calendario por capas y el reparto los hace
//  calendario.js (sin IA). La mentora (💡) arma una tarjeta por tema con la IA.
//
//  Con cuenta (window.NandeClase, /voz/clase.js): se guarda en el servidor.
//  Sin cuenta: se guarda solo en este navegador (demo) y la lectura del PDF no está.
// ══════════════════════════════════════════════════
(function () {
  const C = window.Calendario;
  const CURSO_SERVIDOR = { '4A': '4to_primaria', '5A': '5to_primaria' };
  const AREAS = {
    mat: { nombre: 'Matemática', corto: 'Mate', icono: '🔢', color: '#10B981' },
    len: { nombre: 'Comunicación y Lenguajes', corto: 'Lenguaje', icono: '📖', color: '#F59E0B' },
    cnat: { nombre: 'Ciencias Naturales', corto: 'Ciencias', icono: '🌱', color: '#22C55E' },
    csoc: { nombre: 'Ciencias Sociales', corto: 'Sociales', icono: '🌎', color: '#38BDF8' },
    art: { nombre: 'Artes Plásticas y Visuales', corto: 'Artes', icono: '🎨', color: '#EC4899' },
    mus: { nombre: 'Educación Musical', corto: 'Música', icono: '🎵', color: '#A855F7' },
    efd: { nombre: 'Educación Física y Deportes', corto: 'Ed. Física', icono: '⚽', color: '#EF4444' },
    val: { nombre: 'Valores, Espiritualidades y Religiones', corto: 'Valores', icono: '🕊️', color: '#94A3B8' },
    tec: { nombre: 'Técnica Tecnológica', corto: 'Técnica', icono: '🛠️', color: '#EAB308' },
    ing: { nombre: 'Lengua extranjera', corto: 'Inglés', icono: '💬', color: '#6366F1' },
    ori: { nombre: 'Lengua originaria', corto: 'Originaria', icono: '🗣️', color: '#14B8A6' },
  };
  const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie'];
  const N_PERIODOS = 6;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const area = (id) => AREAS[id] || { nombre: id, corto: id, icono: '•', color: '#666' };
  const hoyTexto = () => { const d = new Date(Date.now() - 4 * 3600e3); return d.toISOString().slice(0, 10); }; // hora de Bolivia
  const fechaLarga = (f) => new Date(f + 'T12:00:00Z').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const fechaCorta = (f) => new Date(f + 'T12:00:00Z').toLocaleDateString('es-BO', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const lunesDe = (f) => { const i = DIAS.indexOf(C.diaSemana(f)); return i < 0 ? C.sumarDias(f, C.diaSemana(f) === 'sab' ? 2 : 1) : C.sumarDias(f, -i); };

  // ── Datos de ejemplo (inventados) ──────────────────
  const HORARIO_EJEMPLO = {
    lun: ['mat', 'mat', 'len', 'len', 'cnat', 'art'],
    mar: ['len', 'len', 'mat', 'mat', 'csoc', 'efd'],
    mie: ['mat', 'mat', 'cnat', 'cnat', 'len', 'mus'],
    jue: ['len', 'len', 'mat', 'csoc', 'csoc', 'val'],
    vie: ['mat', 'len', 'cnat', 'csoc', 'tec', 'efd'],
  };
  const t = (titulo, peso = 2, trimestre = 0, objetivo = '') => ({ titulo, peso, trimestre, objetivo });
  const PLAN_EJEMPLO = {
    titulo: 'Plan anual de 4.º de primaria (EJEMPLO inventado)',
    areas: [
      ['mat', [t('Números hasta el 100.000: leer, escribir y comparar', 3, 1), t('Suma y resta con números grandes', 2, 1), t('Multiplicación por una y dos cifras', 3, 1), t('División exacta e inexacta', 3, 1), t('Problemas con dinero en la feria', 2, 2), t('Fracciones: partes de un entero', 3, 2, 'Reconocer y representar fracciones con objetos de la vida diaria'), t('Fracciones equivalentes', 2, 2), t('Suma de fracciones con igual denominador', 2, 2), t('Medidas de longitud: metro y centímetro', 2, 3), t('Peso: kilo y libra en el mercado', 2, 3), t('Figuras geométricas y perímetro', 2, 3), t('Gráficos de barras con datos del huerto', 2, 3)]],
      ['len', [t('Lectura de cuentos y leyendas cruceñas', 3, 1), t('El sustantivo y el adjetivo', 2, 1), t('Texto descriptivo: mi comunidad', 2, 1), t('La carta y el recado', 2, 2), t('Verbos: presente, pasado y futuro', 2, 2), t('Entrevista a un mayor de la comunidad', 2, 2), t('Signos de puntuación', 2, 3), t('Texto instructivo: una receta', 2, 3), t('Poesía y coplas', 1, 3), t('Exposición oral', 2, 3)]],
      ['cnat', [t('Los seres vivos y su clasificación', 2, 1), t('Las plantas: partes y funciones', 2, 1), t('Animales vertebrados e invertebrados', 2, 1), t('El cuerpo humano: sistema digestivo', 2, 2), t('Alimentación saludable', 2, 2), t('El agua y su ciclo', 2, 3), t('El suelo y el huerto escolar', 2, 3), t('Cuidado del medio ambiente', 2, 3)]],
      ['csoc', [t('Mi familia y mi comunidad', 2, 1), t('Mi municipio y sus autoridades', 2, 1), t('El departamento de Santa Cruz', 2, 2), t('Regiones de Bolivia', 2, 2), t('Fechas cívicas y símbolos patrios', 1, 2), t('Pueblos indígenas de las tierras bajas', 2, 3), t('Derechos y deberes de los niños', 2, 3)]],
      ['art', [t('Dibujo de la naturaleza', 2), t('Collage con materiales del lugar', 2), t('Modelado con arcilla', 2), t('Exposición de trabajos', 1)]],
      ['mus', [t('Ritmo y pulso', 2), t('Canciones tradicionales cruceñas', 2), t('Himnos patrios', 1)]],
      ['efd', [t('Juegos de coordinación', 2), t('Atletismo: carrera y salto', 2), t('Fútbol de salón: reglas básicas', 2), t('Juegos tradicionales', 2)]],
      ['val', [t('Convivencia y respeto', 2), t('Solidaridad en la comunidad', 2), t('Diversidad de creencias', 1)]],
      ['tec', [t('Herramientas del huerto y su cuidado', 2), t('Pequeños proyectos productivos', 2), t('Uso responsable de la tecnología', 1)]],
    ].map(([id, temas]) => ({ id, nombre: area(id).nombre, temas: temas.map((x, i) => ({ id: `${id}-${i + 1}`, ...x })) })),
  };

  const TARJETA_EJEMPLO = {
    objetivo: 'Reconocer fracciones como partes iguales de un entero, usando cosas de todos los días.',
    inicio: 'Mostrá una naranja y preguntá: "Si la partimos para cuatro, ¿cuánto le toca a cada uno?". Escuchá 3 respuestas.',
    actividad: 'En grupos, doblan tiras de papel en 2, 4 y 8 partes iguales, pintan algunas partes y escriben la fracción. Después comparan: ¿qué tapa más, un medio o dos cuartos?',
    cierre: 'Pregunta de salida: "Dibujá una fracción y decí cómo se llama". Cada uno la muestra antes de salir.',
    comunidad: 'En el huerto, dividan una parcela en 4 partes iguales con hilo y estacas: ¿qué fracción le toca a cada grupo para sembrar?',
    materiales: ['tiras de papel', 'lápices de color', 'hilo y estacas', 'una naranja'],
    criterios: ['Reparte un entero en partes iguales', 'Nombra la fracción (un cuarto, dos octavos)', 'Explica con sus palabras qué significa el número de abajo'],
    evaluacion: { ser: 'Respeta el turno y comparte los materiales del grupo.', saber: 'Reconoce y nombra fracciones simples.', hacer: 'Representa fracciones con tiras de papel y en la parcela.', autoevaluacion: 'Semáforo: verde "lo puedo explicar", amarillo "con ayuda", rojo "todavía no".' },
    repaso: ['¿Qué es una fracción?', '¿Qué dice el número de abajo?', '¿Cuánto es la mitad de 8 cuñapés?', '¿Un medio es más o menos que un cuarto?', 'Dibujá tres cuartos.'],
    multigrado: 'Los de 3.º trabajan medios y cuartos con la naranja; los de 4.º, octavos y comparación con las tiras.',
    ejemplo: true,
  };

  // ── Estado ─────────────────────────────────────────
  let curso = '4A';
  let estado = null;      // { config, plan, hechos, perdidos }
  let cargado = false;
  let origen = 'local';   // 'servidor' | 'local'
  let semana = null;      // lunes de la semana a mostrar
  let ocupado = '';       // texto de "la IA está leyendo…"
  const ideas = {};       // temaId → tarjeta

  const api = () => window.NandeClase || null;
  const conCuenta = () => !!api()?.usuario();
  const clave = () => `nande-crono-${curso}`;
  const leerLocal = () => { try { return JSON.parse(localStorage.getItem(clave()) || 'null'); } catch { return null; } };
  const guardarLocal = (e) => { try { localStorage.setItem(clave(), JSON.stringify(e)); } catch {} };

  function vacio() {
    return { config: { anio: 2027, distrito: 'scz_rural_demo', multigrado: [], horario: JSON.parse(JSON.stringify(HORARIO_EJEMPLO)), sinClase: [], semanaEvaluacion: true, colchon: 0.1 }, plan: null, hechos: {}, perdidos: [] };
  }

  function repintar() {
    if ((location.hash.slice(1) || '').split('/')[0] !== 'cronograma') return;
    // Volver a pintar sin saltar arriba (el router sube al principio en cada cambio).
    const y = window.scrollY;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    window.scrollTo(0, y);
  }

  async function cargar() {
    if (cargar.corriendo) return;
    cargar.corriendo = true;
    await null; // se llama desde adentro de una vista: terminar de pintar antes de volver a pintar
    if (conCuenta()) {
      const r = await api().leerPlan(CURSO_SERVIDOR[curso]);
      if (r.ok) { estado = r.estado || leerLocal() || vacio(); origen = 'servidor'; }
      else { estado = leerLocal() || vacio(); origen = 'local'; U.toast(r.error); }
    } else { estado = leerLocal() || vacio(); origen = 'local'; }
    if (!estado.config) estado = { ...vacio(), ...estado };
    estado.hechos ||= {}; estado.perdidos ||= [];
    cargado = true;
    cargar.corriendo = false;
    repintar();
  }

  async function guardar() {
    guardarLocal(estado);
    if (conCuenta()) {
      const r = await api().guardarPlan(CURSO_SERVIDOR[curso], estado);
      if (r.ok) { estado = r.estado; origen = 'servidor'; } else U.toast('No se pudo guardar en el servidor: ' + r.error);
    }
  }

  // ── Cálculo ────────────────────────────────────────
  function calculo() {
    const c = estado.config;
    const cal = C.diasDelAnio({ anio: c.anio, distrito: c.distrito, profe: { sinClase: c.sinClase } });
    const hoy = hoyTexto();
    const enCurso = hoy >= cal.inicio && hoy <= cal.fin;
    const ref = enCurso ? hoy : cal.inicio;
    // Lo marcado como dado desde hoy en adelante queda en su lugar (tachado) para no mover
    // la pantalla bajo el dedo; lo dado antes ya no ocupa periodos.
    const antes = Object.fromEntries(Object.entries(estado.hechos).filter(([, f]) => f < ref));
    const rep = C.repartir(estado.plan, c.horario, cal, { colchon: c.colchon, semanaEvaluacion: c.semanaEvaluacion, desde: ref, hechos: antes, perdidos: estado.perdidos });
    const temas = {};
    for (const a of estado.plan.areas) for (const x of a.temas) temas[x.id] = { ...x, area: a.id };
    return { cal, rep, ref, enCurso, temas };
  }

  // ── Piezas de vista ────────────────────────────────
  const css = `
  .cr-may::first-letter{text-transform:uppercase}
  .cr-semana{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(170px,1fr);gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px}
  .cr-semana>*{scroll-snap-align:start}
  .cr-dia.hoy{border-color:var(--verde)}
  .cr-dia.sin{opacity:.6}
  .cr-item{display:flex;gap:8px;align-items:center;padding:7px 8px;border-radius:10px;background:var(--sup3);font-size:13px;margin-top:6px}
  .cr-item .n{color:var(--texto3);font-size:11px;min-width:14px}
  .cr-item.hecho{opacity:.55;text-decoration:line-through}
  .cr-item.colchon,.cr-item.evaluacion{background:transparent;border:1px dashed var(--borde);color:var(--texto2)}
  .cr-per{display:flex;gap:10px;align-items:center;padding:12px;border-radius:14px;background:var(--sup2);border:1px solid var(--borde)}
  .cr-per .ic{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:20px;flex-shrink:0}
  .cr-per .btn{min-height:44px;min-width:44px;padding:0 12px}
  .cr-per.hecho{opacity:.6}
  .cr-aviso{border-radius:12px;padding:10px 12px;font-size:13px;margin-bottom:8px}
  .cr-aviso.rojo{background:rgba(239,68,68,.1);border:1px solid var(--rojo)}
  .cr-aviso.ambar{background:rgba(245,158,11,.08);border:1px solid var(--ambar)}
  .cr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
  .cr-grid select,.cr-campo{width:100%;min-height:46px;border-radius:10px;border:1px solid var(--borde);background:var(--sup2);color:#fff;padding:0 8px;font-size:15px}
  .cr-pasos{display:flex;gap:6px;margin:10px 0 16px}
  .cr-pasos span{flex:1;height:6px;border-radius:9px;background:var(--sup3)}
  .cr-pasos span.si{background:var(--verde)}
  .cr-tarjeta h4{font-size:13px;color:var(--texto2);text-transform:uppercase;letter-spacing:.04em;margin:14px 0 6px}
  .cr-tarjeta ul{margin-left:18px}.cr-tarjeta li{margin:4px 0}
  .cr-eval{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;font-size:13px}
  .cr-eval b{color:var(--verde)}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const pasos = (n) => `<div class="cr-pasos">${[1, 2, 3, 4].map((i) => `<span class="${i <= n ? 'si' : ''}"></span>`).join('')}</div>`;
  const avisoCuenta = () => conCuenta() ? `<span class="pildora">☁️ guardado en tu cuenta</span>` : `<span class="pildora gris">💾 solo en este equipo</span> ${api() ? `<button class="btn chico sec2" onclick="Clase.login()">Entrar</button>` : ''}`;

  function itemSemana(x, temas) {
    if (x.tipo === 'evaluacion') return `<div class="cr-item evaluacion"><span class="n">${x.periodo}</span>${area(x.area).icono} Evaluación</div>`;
    if (x.tipo === 'colchon') return `<div class="cr-item colchon"><span class="n">${x.periodo}</span>${area(x.area).icono} Repaso / libre</div>`;
    const tm = temas[x.temaId];
    return `<div class="cr-item ${estado.hechos[x.temaId] ? 'hecho' : ''}"><span class="n">${x.hasta !== x.periodo ? `${x.periodo}-${x.hasta}` : x.periodo}</span>${area(x.area).icono} ${esc(tm?.titulo || '')}</div>`;
  }

  // Periodos seguidos con el mismo tema se muestran juntos ("1.º–2.º periodo").
  function agrupar(xs) {
    const out = [];
    for (const x of xs) {
      const u = out[out.length - 1];
      if (u && u.tipo === x.tipo && u.area === x.area && u.temaId === x.temaId && u.hasta === x.periodo - 1) u.hasta = x.periodo;
      else out.push({ ...x, hasta: x.periodo });
    }
    return out;
  }
  const etiquetaPeriodo = (x) => (x.hasta && x.hasta !== x.periodo ? `${x.periodo}.º y ${x.hasta}.º periodo` : `${x.periodo}.º periodo`);

  function periodoHoy(x, temas, fecha) {
    const a = area(x.area);
    if (x.tipo !== 'tema') return `<div class="cr-per"><div class="ic" style="background:${a.color}22">${a.icono}</div><div class="crece"><b>${x.tipo === 'evaluacion' ? 'Evaluación' : 'Repaso / libre'}</b><div class="ter">${etiquetaPeriodo(x)} · ${esc(a.nombre)}</div></div></div>`;
    const tm = temas[x.temaId];
    const hecho = !!estado.hechos[x.temaId];
    return `<div class="cr-per ${hecho ? 'hecho' : ''}">
      <div class="ic" style="background:${a.color}22">${a.icono}</div>
      <div class="crece"><b>${esc(tm.titulo)}</b><div class="ter">${etiquetaPeriodo(x)} · ${esc(a.corto)}</div></div>
      <button class="btn sec2" title="Ideas de la mentora" onclick="location.hash='cronograma/idea/${tm.id}'">💡</button>
      <button class="btn ${hecho ? '' : 'sec2'}" title="Marcar como dado" onclick="Cronograma.hecho('${tm.id}','${fecha}')">${hecho ? '✓' : '○'}</button>
    </div>`;
  }

  // ── Vistas ─────────────────────────────────────────
  function principal() {
    if (!cargado) { cargar(); return '<p class="ter">Cargando…</p>'; }
    if (!estado.plan) return bienvenida();
    const { cal, rep, ref, enCurso, temas } = calculo();
    const diaRef = cal.dias.find((d) => d.fecha >= ref && d.clase && !estado.perdidos.includes(d.fecha)) || cal.dias[0];
    const items = rep.porFecha[diaRef.fecha] || [];
    semana ||= lunesDe(diaRef.fecha);
    const dias = DIAS.map((_, i) => C.sumarDias(semana, i));
    const totalTemas = Object.keys(temas).length, hechos = Object.keys(estado.hechos).filter((k) => temas[k]).length;
    return `<div class="encab"><div><h1>Cronograma</h1><p>${esc(estado.plan.titulo)} · ${curso} · gestión ${estado.config.anio}${cal.provisional ? ' <span class="pildora ambar">provisional</span>' : ''}</p></div>
      <div class="fila envuelve" style="gap:8px">${avisoCuenta()}<a class="btn chico sec2" href="#cronograma/paso/1">⚙️ Ajustes</a><a class="btn chico sec2" href="#cronograma/plan">📄 Temas</a></div></div>
    ${cal.provisional ? `<div class="cr-aviso ambar">El calendario ${estado.config.anio} todavía no es oficial (falta la resolución del Ministerio). Se usa una fecha provisional y se recalcula cuando salga.</div>` : ''}
    ${rep.avisos.slice(0, 3).map((a) => `<div class="cr-aviso ${a.nivel}">⚠️ ${esc(a.texto)}</div>`).join('')}

    <div class="tarjeta" style="border-color:var(--verde)">
      <div class="fila entre envuelve"><div><h2>${enCurso && diaRef.fecha === hoyTexto() ? 'Hoy' : enCurso ? 'Próxima clase' : 'Primer día de clases'}</h2><p class="ter" class="cr-may">${fechaLarga(diaRef.fecha)} · ${diaRef.trimestre}.º trimestre${diaRef.menosHoras ? ` · ${esc(diaRef.motivo)} (menos horas)` : ''}</p></div>
      <button class="btn chico sec2" onclick="Cronograma.perdido('${diaRef.fecha}')">🚫 Perdí este día</button></div>
      <div class="pila" style="margin-top:12px">${items.length ? agrupar(items).map((x) => periodoHoy(x, temas, diaRef.fecha)).join('') : '<p class="ter">Sin periodos en tu horario este día.</p>'}</div>
    </div>

    <div class="seccion"><div class="fila entre"><h3>Semana del ${fechaCorta(semana)}</h3>
      <span class="fila" style="gap:6px"><button class="btn chico sec2" onclick="Cronograma.semana(-7)">◀</button><button class="btn chico sec2" onclick="Cronograma.semana(7)">▶</button></span></div>
      <div class="cr-semana">${dias.map((f) => {
        const d = cal.dias.find((x) => x.fecha === f);
        const perdido = estado.perdidos.includes(f);
        const xs = rep.porFecha[f] || [];
        const cab = `<div class="fila entre"><b class="cr-may">${C.NOMBRE_DIA[C.diaSemana(f)]} ${fechaCorta(f)}</b></div>`;
        if (!d) return `<div class="tarjeta cr-dia sin">${cab}<p class="ter" style="margin-top:6px">Fuera del año escolar</p></div>`;
        if (!d.clase || perdido) return `<div class="tarjeta cr-dia sin">${cab}<p class="ter" style="margin-top:6px">${perdido ? '🚫 Día perdido' : '🎉 ' + esc(d.motivo)}</p>${perdido ? `<button class="btn chico sec2" style="margin-top:8px" onclick="Cronograma.perdido('${f}')">Deshacer</button>` : ''}</div>`;
        return `<a class="tarjeta cr-dia ${f === diaRef.fecha ? 'hoy' : ''}" href="#cronograma/dia/${f}" style="color:inherit">${cab}${d.menosHoras ? `<div class="ter">${esc(d.motivo)}</div>` : ''}${xs.length ? agrupar(xs).map((x) => itemSemana(x, temas)).join('') : `<p class="ter" style="margin-top:6px">${f < ref ? 'Ya pasó' : '—'}</p>`}</a>`;
      }).join('')}</div></div>

    <div class="seccion"><h3>Trimestres</h3><div class="grilla g2">${cal.trimestres.map(([a, b], i) => {
      const n = i + 1;
      const habiles = C.contarHabiles(cal.dias.filter((d) => !estado.perdidos.includes(d.fecha)), a, b);
      const temasT = Object.values(rep.areas).reduce((s, x) => s + (x.porTrimestre[n]?.temas || 0), 0);
      return `<div class="tarjeta"><div class="fila entre"><b>${n}.º trimestre</b><span class="ter">${fechaCorta(a)} – ${fechaCorta(b)}</span></div>
        <p class="chica sec" style="margin-top:6px">${habiles} días de clase · ${temasT} temas por dar</p></div>`;
    }).join('')}</div>
      <div class="tarjeta" style="margin-top:12px"><div class="fila entre chica"><span>Avance del plan</span><b>${hechos} de ${totalTemas} temas dados</b></div>${U.barra(totalTemas ? Math.round(hechos / totalTemas * 100) : 0)}</div></div>

    <details class="tarjeta seccion"><summary style="cursor:pointer"><b>Días sin clase y de dónde salen</b> <span class="ter">· ${cal.dias.filter((d) => !d.clase).length} días</span></summary>
      <div class="lista chica" style="margin-top:10px">${cal.capas.filter((c) => c.nombre && c.nombre !== '—').map((c) => `<div><span class="pildora gris">${esc(c.id)}</span> ${esc(c.nombre)}</div>`).join('')}</div>
      <div class="lista chica" style="margin-top:10px">${cal.dias.filter((d) => !d.clase).map((d) => `<div class="fila entre"><span>${fechaCorta(d.fecha)} · ${esc(d.motivo)}</span><span class="ter">${esc(d.capa)}</span></div>`).join('')}</div>
    </details>`;
  }

  function bienvenida() {
    return `<div class="encab"><div><h1>Cronograma</h1><p>Armá el año día a día con tu plan, el calendario oficial y tu horario.</p></div></div>
    <div class="tarjeta" style="border-color:var(--verde)">
      <h2>Armá tu cronograma en 4 pasos</h2>
      <ol class="chica" style="margin:10px 0 14px 20px;line-height:1.9">
        <li>Subí el PDF de tu plan o pensum (la IA lee los temas)</li>
        <li>Elegí tu escuela, distrito y gestión</li>
        <li>Revisá tu horario semanal</li>
        <li>Agregá tus días sin clase (fiesta patronal, siembra…)</li>
      </ol>
      <p class="ter" style="margin-bottom:12px">El calendario se arma con el nacional, el de Santa Cruz, el de tu distrito y el de tu escuela. Vos podés cambiar todo.</p>
      <a class="btn ancho" href="#cronograma/paso/1">Empezar</a>
    </div>`;
  }

  function paso(n) {
    if (!cargado) { cargar(); return '<p class="ter">Cargando…</p>'; }
    n = Number(n) || 1;
    const c = estado.config;
    const pie = (sig) => `<div class="fila entre" style="margin-top:16px">${n > 1 ? `<a class="btn sec2" href="#cronograma/paso/${n - 1}">← Atrás</a>` : '<a class="btn sec2" href="#cronograma">Cancelar</a>'}${sig}</div>`;
    if (n === 1) {
      const p = estado.plan;
      return `<a href="#cronograma" class="chica">← Cronograma</a><h1 style="margin-top:10px">Paso 1 · Tu plan</h1>${pasos(1)}
      ${ocupado ? `<div class="tarjeta cg-espera" style="text-align:center;padding:30px"><div class="ruedita" style="width:46px;height:46px;border-radius:50%;border:5px solid var(--sup3);border-top-color:var(--verde);margin:0 auto 14px;animation:cg-gira 1s linear infinite"></div><b>${esc(ocupado)}</b><p class="ter">Tarda entre 10 segundos y 1 minuto.</p></div>` : `
      <div class="tarjeta">
        <b>Subí el PDF de tu plan anual, PDC o pensum</b>
        <p class="ter" style="margin:4px 0 12px">La IA saca las áreas y los temas en orden. El PDF no se guarda. Si tiene nombres de alumnos, se ignoran.</p>
        ${conCuenta() ? `<label class="btn ancho" style="cursor:pointer">📄 Elegir PDF<input type="file" accept="application/pdf" style="display:none" onchange="Cronograma.subir(this.files[0])"></label>`
          : `<p class="chica" style="color:var(--ambar)">Para leer un PDF tenés que entrar con tu cuenta.</p>${api() ? '<button class="btn ancho sec2" style="margin-top:8px" onclick="Clase.login()">Entrar</button>' : ''}`}
        <button class="btn ancho sec2" style="margin-top:10px" onclick="Cronograma.ejemplo()">Usar el plan de ejemplo (4.º de primaria)</button>
      </div>`}
      ${p ? `<div class="tarjeta" style="margin-top:12px"><div class="fila entre"><b>${esc(p.titulo)}</b><a class="chica" href="#cronograma/plan">Ver y editar temas</a></div>
        <div class="chips" style="margin-top:10px">${p.areas.map((a) => `<span class="pildora gris">${area(a.id).icono} ${esc(area(a.id).corto)} · ${a.temas.length}</span>`).join('')}</div>
        ${(p.advertencias || []).map((x) => `<div class="cr-aviso ambar" style="margin-top:8px">${esc(x)}</div>`).join('')}</div>` : ''}
      ${pie(p ? '<a class="btn" href="#cronograma/paso/2">Siguiente →</a>' : '')}`;
    }
    if (n === 2) {
      const dist = Object.entries(C.CAPAS.distritos);
      return `<a href="#cronograma" class="chica">← Cronograma</a><h1 style="margin-top:10px">Paso 2 · Escuela y gestión</h1>${pasos(2)}
      <div class="tarjeta pila">
        <label class="campo"><span>Gestión</span><select class="cr-campo" onchange="Cronograma.cfg('anio', Number(this.value))">
          ${Object.keys(C.CAPAS.nacional).map((a) => `<option value="${a}" ${Number(a) === c.anio ? 'selected' : ''}>${a}${C.CAPAS.nacional[a].provisional ? ' (provisional)' : ''}</option>`).join('')}</select></label>
        <label class="campo"><span>Distrito educativo</span><select class="cr-campo" onchange="Cronograma.cfg('distrito', this.value)">
          ${dist.map(([id, d]) => `<option value="${id}" ${id === c.distrito ? 'selected' : ''}>${esc(d.nombre)}</option>`).join('')}</select></label>
        <label class="campo"><span>Curso</span><select class="cr-campo" onchange="Cronograma.curso(this.value)">
          ${Object.keys(CURSO_SERVIDOR).map((k) => `<option ${k === curso ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
        <label class="fila chica" style="gap:10px;cursor:pointer"><input type="checkbox" style="width:22px;height:22px" ${c.multigrado.length ? 'checked' : ''} onchange="Cronograma.cfg('multigrado', this.checked ? ['3ro_primaria'] : [])"> Aula multigrado (doy 3.º y 4.º juntos)</label>
        <p class="ter">Capas que se aplican: nacional → ${esc(C.CAPAS.departamentos[(C.CAPAS.distritos[c.distrito] || {}).departamento]?.nombre || '—')} → ${esc((C.CAPAS.distritos[c.distrito] || {}).nombre || '')} → tu escuela → tus días.</p>
      </div>${pie('<a class="btn" href="#cronograma/paso/3">Siguiente →</a>')}`;
    }
    if (n === 3) {
      const usadas = new Set([...(estado.plan?.areas || []).map((a) => a.id), ...Object.values(c.horario).flat().filter(Boolean)]);
      const opciones = (sel) => `<option value="">— libre —</option>${[...usadas].map((id) => `<option value="${id}" ${id === sel ? 'selected' : ''}>${area(id).icono} ${esc(area(id).corto)}</option>`).join('')}`;
      return `<a href="#cronograma" class="chica">← Cronograma</a><h1 style="margin-top:10px">Paso 3 · Tu horario</h1>${pasos(3)}
      <p class="sec chica" style="margin-bottom:12px">Qué área das en cada periodo (6 periodos de 40 minutos). Viene cargado un ejemplo: tocá para cambiar.</p>
      <div class="pila">${DIAS.map((d) => `<div class="tarjeta"><b>${C.NOMBRE_DIA[d]}</b><div class="cr-grid" style="margin-top:8px">
        ${Array.from({ length: N_PERIODOS }, (_, i) => `<select aria-label="${C.NOMBRE_DIA[d]} periodo ${i + 1}" onchange="Cronograma.horario('${d}', ${i}, this.value)">${opciones(c.horario[d]?.[i] || '')}</select>`).join('')}
      </div></div>`).join('')}</div>${pie('<a class="btn" href="#cronograma/paso/4">Siguiente →</a>')}`;
    }
    return `<a href="#cronograma" class="chica">← Cronograma</a><h1 style="margin-top:10px">Paso 4 · Tus días</h1>${pasos(4)}
    <div class="tarjeta">
      <b>Días sin clase propios de tu escuela o comunidad</b>
      <p class="ter" style="margin:4px 0 10px">Fiesta patronal, aniversario de la escuela, siembra o cosecha, reuniones.</p>
      <div class="lista chica">${c.sinClase.length ? c.sinClase.map((d, i) => `<div class="fila entre"><span>${d.fecha ? fechaCorta(d.fecha) : `${fechaCorta(d.desde)} – ${fechaCorta(d.hasta)}`} · ${esc(d.motivo)}</span><button class="btn chico sec2" onclick="Cronograma.quitarDia(${i})">✕</button></div>`).join('') : '<span class="ter">Ninguno todavía</span>'}</div>
      <div class="grilla g2" style="gap:8px;margin-top:10px">
        <input id="cr-f" type="date" class="cr-campo" value="${c.anio}-05-03">
        <input id="cr-m" class="cr-campo" placeholder="Motivo (ej. Fiesta patronal)">
      </div>
      <button class="btn ancho sec2" style="margin-top:8px" onclick="Cronograma.agregarDia()">+ Agregar día</button>
    </div>
    <div class="tarjeta pila" style="margin-top:12px">
      <label class="fila chica" style="gap:10px;cursor:pointer"><input type="checkbox" style="width:22px;height:22px" ${c.semanaEvaluacion ? 'checked' : ''} onchange="Cronograma.cfg('semanaEvaluacion', this.checked)"> Reservar la última semana de cada trimestre para evaluar</label>
      <label class="campo"><span>Colchón para imprevistos (lluvia, bloqueos, actos)</span><select class="cr-campo" onchange="Cronograma.cfg('colchon', Number(this.value))">
        ${[0, 0.05, 0.1, 0.15, 0.2].map((v) => `<option value="${v}" ${v === c.colchon ? 'selected' : ''}>${Math.round(v * 100)} % de los periodos</option>`).join('')}</select></label>
    </div>${pie('<button class="btn" onclick="Cronograma.terminar()">✓ Armar cronograma</button>')}`;
  }

  function planVista() {
    if (!cargado) { cargar(); return '<p class="ter">Cargando…</p>'; }
    if (!estado.plan) return bienvenida();
    return `<a href="#cronograma" class="chica">← Cronograma</a>
    <div class="encab" style="margin-top:10px"><div><h1>Temas del plan</h1><p>Cambiá el orden, el largo (peso) o el trimestre. Lo que cambies se reacomoda solo.</p></div></div>
    <div class="pila">${estado.plan.areas.map((a, ai) => `<details class="tarjeta" ${ai === 0 ? 'open' : ''}><summary style="cursor:pointer"><b>${area(a.id).icono} ${esc(area(a.id).nombre)}</b> <span class="ter">· ${a.temas.length} temas</span></summary>
      <div class="pila" style="margin-top:10px">${a.temas.map((x, i) => `<div class="fila envuelve" style="gap:6px;padding:8px;background:var(--sup3);border-radius:10px">
        <button class="btn chico ${estado.hechos[x.id] ? '' : 'sec2'}" title="Dado" onclick="Cronograma.hecho('${x.id}')">${estado.hechos[x.id] ? '✓' : '○'}</button>
        <span class="crece chica" style="min-width:140px">${esc(x.titulo)}</span>
        <select class="cr-campo" style="width:auto;min-height:38px" onchange="Cronograma.tema('${a.id}', ${i}, 'peso', Number(this.value))">${[1, 2, 3].map((p) => `<option value="${p}" ${p === x.peso ? 'selected' : ''}>${['corto', 'normal', 'largo'][p - 1]}</option>`).join('')}</select>
        <select class="cr-campo" style="width:auto;min-height:38px" onchange="Cronograma.tema('${a.id}', ${i}, 'trimestre', Number(this.value))">${[0, 1, 2, 3].map((p) => `<option value="${p}" ${p === x.trimestre ? 'selected' : ''}>${p ? p + '.º trim.' : 'cualquiera'}</option>`).join('')}</select>
        <button class="btn chico sec2" onclick="Cronograma.mover('${a.id}', ${i}, -1)">↑</button><button class="btn chico sec2" onclick="Cronograma.mover('${a.id}', ${i}, 1)">↓</button>
        <button class="btn chico sec2" onclick="Cronograma.quitarTema('${a.id}', ${i})">✕</button></div>`).join('')}
        <button class="btn chico sec2" onclick="Cronograma.agregarTema('${a.id}')">+ Agregar tema</button></div></details>`).join('')}</div>`;
  }

  function diaVista(f) {
    if (!cargado) { cargar(); return '<p class="ter">Cargando…</p>'; }
    if (!estado.plan) return bienvenida();
    const { cal, rep, temas } = calculo();
    const d = cal.dias.find((x) => x.fecha === f);
    const xs = rep.porFecha[f] || [];
    return `<a href="#cronograma" class="chica">← Cronograma</a>
    <div class="encab" style="margin-top:10px"><div><h1 class="cr-may">${fechaLarga(f)}</h1><p>${d ? `${d.trimestre}.º trimestre${d.motivo ? ' · ' + esc(d.motivo) : ''}` : 'Fuera del año escolar'}</p></div>
      ${d && d.clase ? `<button class="btn chico sec2" onclick="Cronograma.perdido('${f}')">${estado.perdidos.includes(f) ? 'Deshacer día perdido' : '🚫 Perdí este día'}</button>` : ''}</div>
    <div class="pila">${xs.length ? agrupar(xs).map((x) => periodoHoy(x, temas, f)).join('') : '<p class="ter">No hay nada planificado este día.</p>'}</div>`;
  }

  function ideaVista(temaId) {
    if (!cargado) { cargar(); return '<p class="ter">Cargando…</p>'; }
    const tm = (estado.plan?.areas || []).flatMap((a) => a.temas.map((x) => ({ ...x, area: a.id }))).find((x) => x.id === temaId);
    if (!tm) return '<p class="ter">No encontré ese tema.</p>';
    const a = area(tm.area);
    let tarjeta = ideas[temaId];
    if (!tarjeta && !conCuenta()) tarjeta = TARJETA_EJEMPLO;
    else if (!tarjeta) { pedirIdea(tm); }
    const e = tarjeta?.evaluacion || {};
    return `<a href="javascript:history.back()" class="chica">← Volver</a>
    <div class="encab" style="margin-top:10px"><div><h1>💡 ${esc(tm.titulo)}</h1><p>${a.icono} ${esc(a.nombre)} · ideas de la mentora</p></div></div>
    ${!tarjeta ? `<div class="tarjeta" style="text-align:center;padding:30px"><div style="width:46px;height:46px;border-radius:50%;border:5px solid var(--sup3);border-top-color:var(--verde);margin:0 auto 14px;animation:cg-gira 1s linear infinite"></div><b>La mentora está pensando una clase…</b><p class="ter">Unos segundos.</p></div>` : `
    ${tarjeta.ejemplo ? '<div class="cr-aviso ambar">Ejemplo sin conexión (fracciones). Entrá con tu cuenta para que la mentora arme la tarjeta de este tema.</div>' : ''}
    ${tarjeta.error ? `<div class="cr-aviso rojo">${esc(tarjeta.error)}</div>` : `
    <div class="tarjeta cr-tarjeta">
      <p><b>Objetivo:</b> ${esc(tarjeta.objetivo)}</p>
      <h4>1 · Inicio (5 min)</h4><p class="chica">${esc(tarjeta.inicio)}</p>
      <h4>2 · Actividad</h4><p class="chica">${esc(tarjeta.actividad)}</p>
      <h4>3 · Cierre</h4><p class="chica">${esc(tarjeta.cierre)}</p>
      <h4>🌳 Con lo que hay en la comunidad</h4><p class="chica">${esc(tarjeta.comunidad)}</p>
      ${tarjeta.materiales?.length ? `<h4>Materiales</h4><p class="chica">${tarjeta.materiales.map(esc).join(' · ')}</p>` : ''}
      ${tarjeta.multigrado && estado.config.multigrado.length ? `<h4>Multigrado</h4><p class="chica">${esc(tarjeta.multigrado)}</p>` : ''}
      <h4>Para mirar en el momento</h4><ul class="chica">${(tarjeta.criterios || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="ter">Marcá cada criterio como en camino · logrado · destacado.</p>
      <h4>Cómo evaluarlo (RM 0001/2026)</h4>
      <div class="cr-eval"><b>Ser 10</b><span>${esc(e.ser)}</span><b>Saber 45</b><span>${esc(e.saber)}</span><b>Hacer 40</b><span>${esc(e.hacer)}</span><b>Autoev. 5</b><span>${esc(e.autoevaluacion)}</span></div>
      <h4>🔁 Repaso para empezar la próxima clase</h4><ol class="chica" style="margin-left:18px">${(tarjeta.repaso || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    </div>
    <p class="ter" style="margin-top:10px">Es una propuesta: usá lo que te sirva y cambiá lo que quieras.${tarjeta.costoUsd ? ` · costo de IA USD ${tarjeta.costoUsd}` : ''}</p>
    ${!tarjeta.ejemplo ? `<button class="btn chico sec2" onclick="Cronograma.otraIdea('${temaId}')">↻ Otra idea</button>` : ''}`}`}`;
  }

  async function pedirIdea(tm, nueva = false) {
    if (pedirIdea.en === tm.id) return;
    pedirIdea.en = tm.id;
    const r = await api().mentora({ curso: CURSO_SERVIDOR[curso], area: tm.area, tema: tm.titulo, objetivo: tm.objetivo || '', multigrado: estado.config.multigrado, nueva });
    pedirIdea.en = null;
    ideas[tm.id] = r.ok ? { ...r.tarjeta, costoUsd: r.costoUsd } : { error: r.error };
    repintar();
  }

  const aBase64 = (file) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1] || ''); fr.onerror = () => rej(fr.error); fr.readAsDataURL(file); });

  // ── Acciones ───────────────────────────────────────
  window.Cronograma = {
    vista(param, extra) {
      if (param === 'paso') return paso(extra);
      if (param === 'plan') return planVista();
      if (param === 'dia') return diaVista(extra);
      if (param === 'idea') return ideaVista(extra);
      return principal();
    },
    async subir(file) {
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) return U.toast('El PDF es muy grande (máximo 10 MB)');
      ocupado = `La IA está leyendo "${file.name}"…`; repintar();
      const r = await api().extraerPlan(CURSO_SERVIDOR[curso], await aBase64(file));
      ocupado = '';
      if (!r.ok) { U.toast(r.error, 4000); repintar(); return; }
      if (!r.plan.areas.length) { U.toast('No encontré temas en ese PDF', 4000); estado.plan = estado.plan || null; repintar(); return; }
      estado.plan = r.plan; estado.hechos = {};
      // Las áreas nuevas que no están en el horario se avisan en el paso 3.
      await guardar();
      U.toast(`✅ ${r.plan.areas.reduce((a, x) => a + x.temas.length, 0)} temas leídos (USD ${r.costoUsd})`, 3500);
      repintar();
    },
    async ejemplo() { estado.plan = JSON.parse(JSON.stringify(PLAN_EJEMPLO)); estado.hechos = {}; await guardar(); repintar(); },
    async cfg(k, v) { estado.config[k] = v; await guardar(); repintar(); },
    async curso(c) { curso = c; cargado = false; semana = null; repintar(); },
    async horario(d, i, v) { estado.config.horario[d] ||= []; estado.config.horario[d][i] = v; await guardar(); },
    async agregarDia() {
      const f = document.getElementById('cr-f').value, m = document.getElementById('cr-m').value.trim() || 'Sin clase';
      if (!f) return;
      estado.config.sinClase.push({ fecha: f, motivo: m }); await guardar(); repintar();
    },
    async quitarDia(i) { estado.config.sinClase.splice(i, 1); await guardar(); repintar(); },
    async terminar() { semana = null; await guardar(); location.hash = 'cronograma'; },
    async hecho(id, fecha) {
      if (estado.hechos[id]) delete estado.hechos[id]; else estado.hechos[id] = fecha || hoyTexto();
      await guardar(); repintar();
    },
    async perdido(f) {
      const i = estado.perdidos.indexOf(f);
      if (i >= 0) estado.perdidos.splice(i, 1); else { estado.perdidos.push(f); U.toast('🔁 Reacomodé lo que quedaba desde ese día', 3000); }
      await guardar(); repintar();
    },
    semana(n) { semana = C.sumarDias(semana, n); repintar(); },
    async tema(aid, i, k, v) { const a = estado.plan.areas.find((x) => x.id === aid); a.temas[i][k] = v; await guardar(); repintar(); },
    async mover(aid, i, d) { const a = estado.plan.areas.find((x) => x.id === aid); const j = i + d; if (j < 0 || j >= a.temas.length) return; [a.temas[i], a.temas[j]] = [a.temas[j], a.temas[i]]; await guardar(); repintar(); },
    async quitarTema(aid, i) { const a = estado.plan.areas.find((x) => x.id === aid); if (!confirm(`¿Quitar "${a.temas[i].titulo}"?`)) return; a.temas.splice(i, 1); await guardar(); repintar(); },
    async agregarTema(aid) {
      const titulo = prompt('Nombre del tema'); if (!titulo) return;
      const a = estado.plan.areas.find((x) => x.id === aid);
      let n = 1; while (a.temas.some((x) => x.id === `${aid}-${n}`)) n++;
      a.temas.push({ id: `${aid}-${n}`, titulo: titulo.slice(0, 120), peso: 2, trimestre: 0, objetivo: '' });
      await guardar(); repintar();
    },
    otraIdea(id) {
      const tm = estado.plan.areas.flatMap((a) => a.temas.map((x) => ({ ...x, area: a.id }))).find((x) => x.id === id);
      delete ideas[id]; repintar(); pedirIdea(tm, true);
    },
    PLAN_EJEMPLO, HORARIO_EJEMPLO,
  };
  // Al entrar o salir de la cuenta, volver a leer.
  window.addEventListener('nande-clase-listo', () => { cargado = false; repintar(); });
  window.addEventListener('nande-cuenta', () => { cargado = false; repintar(); });
})();
