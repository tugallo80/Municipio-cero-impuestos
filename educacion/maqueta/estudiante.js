// EDU.17 — App del alumno: barra de navegación compartida y ayudas comunes.
// Secciones: Hoy · Agenda · Mis textos · Mis tareas · Mi tutor · Mundo (el juego).
// Barra abajo en celular y tablet parada; a la izquierda en tablet acostada y PC (≥ 1000 px).
(function () {
  // ---------- Nombre del profe: nunca en el repo ----------
  // Llega por el link de la presentación: ?profe=<nombre formal>&profeApodo=<apodo del profe, ej. "Profe …">.
  // Queda en el equipo (localStorage 'nande-profe' y 'nande-profe-apodo'). El alumno ve el apodo; si no
  // hay, el nombre; si no hay nada, "tu profe". No se manda a la IA.
  function quienProfe() {
    let nombre = '', apodo = '';
    try {
      const q = new URLSearchParams(location.search);
      if (q.get('profe')) localStorage.setItem('nande-profe', q.get('profe').slice(0, 60));
      const ap = q.get('profeApodo') || q.get('apodo');   // 'apodo' queda por compatibilidad con links viejos
      if (ap) localStorage.setItem('nande-profe-apodo', ap.slice(0, 60));
      nombre = (localStorage.getItem('nande-profe') || '').trim(); apodo = (localStorage.getItem('nande-profe-apodo') || '').trim();
    } catch (e) {}
    const x = apodo || nombre;
    return x ? (/^profe\b/i.test(x) ? 'el ' + x : x) : 'tu profe';   // "La dejó el Profe …"
  }
  const QUIEN = quienProfe();
  window.nombreProfe = () => QUIEN;
  const E = normalizar(window.ESTUDIANTE_DEMO);

  // Fuente única de EDU.15 (estudiante-demo.js, generado desde tools/datos/demo-piloto.json) +
  // lo que suma EDU.17 (tareas-curso-demo.js). Formatos aceptados:
  //   horario: lista [{dia: 1..5 | 'lunes', desde, hasta, materia, aula?}] o mapa {lun: [...]} con horas
  //   llevar: lista [{fecha?, materia?, texto}] o mapa {materia: texto}
  //   tareas: formato común (vence) o el del servidor de EDU.04f (entrega) → adaptarTareaProfe
  function normalizar(E) {
    if (!E) return E;
    const CL = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    if (Array.isArray(E.horario)) {
      const lista = E.horario, horas = [...new Set(lista.map(h => h.desde + '|' + h.hasta))].sort().map(x => x.split('|'));
      const mapa = {};
      lista.forEach(h => {
        const d = typeof h.dia === 'number' ? CL[h.dia] : String(h.dia).slice(0, 3).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        (mapa[d] = mapa[d] || Array(horas.length).fill(null))[horas.findIndex(x => x[0] === h.desde)] = h.materia;
      });
      E.horario = mapa; E.horas = E.horas || horas;
    }
    if (Array.isArray(E.llevar)) {
      E.llevarFechas = E.llevar.filter(x => x.fecha);
      E.llevar = Object.fromEntries(E.llevar.filter(x => !x.fecha && x.materia).map(x => [x.materia, x.texto]));
    }
    E.llevar = E.llevar || {}; E.materias = E.materias || {}; E.eventos = E.eventos || []; E.avisos = E.avisos || []; E.tareas = E.tareas || [];
    const X = window.EDU17_EXTRA;
    if (X && !E._extra) {
      E._extra = true;
      E.llevar = Object.assign({}, X.llevar, E.llevar);
      E.eventos = E.eventos.concat(X.eventos || []);
      E.tareas = E.tareas.concat((X.tareas || []).filter(t => !E.tareas.some(u => u.id === t.id)));
    }
    // Apodo elegido por el alumno en la presentación (EDU.14b), si hay
    try { const a = (localStorage.getItem('nande-apodo') || '').trim(); if (a) E.apodo = a.slice(0, 30); } catch (e) {}
    // En las materias, "profe" de la fuente es el profe IA ("la profe {IA_MUJER}"): pasa a profeIA; el alumno ve a su profe.
    const delPiloto = window.DEMO_PILOTO && window.DEMO_PILOTO.materiasProfe;
    Object.entries(E.materias).forEach(([id, m]) => {
      if (m.profe && /\{IA_(VARON|MUJER)\}|taji|jochi/i.test(m.profe)) m.profeIA = window.NandeIA ? NandeIA.texto(m.profe) : m.profe;
      if (!m.profe || m.profeIA || /\{profe\}/.test(m.profe)) m.profe = !delPiloto || delPiloto.includes(id) ? QUIEN : 'tu profe';
    });
    (E.tareas || []).forEach(t => { if (t.origen && t.origen.texto) t.origen.texto = t.origen.texto.replace(/\{profe\}/g, QUIEN); });
    return E;
  }
  const SECCIONES = [
    ['hoy', '🏠', 'Hoy', '/maqueta/hoy/'],
    ['agenda', '🗓️', 'Agenda', '/maqueta/agenda/'],
    ['textos', '📖', 'Mis textos', '/maqueta/textos/'],
    ['tareas', '📋', 'Mis tareas', '/maqueta/tareas/'],
    ['tutor', '🧑‍🏫', 'Mi tutor', '/maqueta/mi-tutor/'],
    ['mundo', '🌎', 'Mundo', '/maqueta/alumno/?desde=app']
  ];
  const css = `
    .nav-est { position: fixed; z-index: 40; background: rgba(10,10,10,.97); backdrop-filter: blur(10px); display: flex; }
    .nav-est a { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: var(--texto3); font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 14px; }
    .nav-est a .ico { font-size: 24px; filter: grayscale(1) opacity(.65); line-height: 1; }
    .nav-est a.activo { color: var(--verde); background: var(--verde-suave); }
    .nav-est a.activo .ico { filter: none; }
    @media (max-width: 999px) {
      .nav-est { left: 0; right: 0; bottom: 0; border-top: 1px solid var(--borde); padding: 6px 4px calc(8px + env(safe-area-inset-bottom)); justify-content: space-around; }
      .nav-est a { flex: 1; min-height: 58px; max-width: 120px; }
      body.est-app .principal { padding-bottom: 110px; }
    }
    @media (min-width: 768px) and (max-width: 999px) { .nav-est a { min-height: 68px; font-size: 14px; } .nav-est a .ico { font-size: 28px; } }
    @media (min-width: 1000px) {
      .nav-est { top: 0; bottom: 0; left: 0; width: 104px; flex-direction: column; gap: 8px; padding: 18px 10px; border-right: 1px solid var(--borde); }
      .nav-est a { min-height: 78px; font-size: 13px; }
      .nav-est .marca-est { font-family: 'Space Grotesk'; font-weight: 700; color: var(--verde); text-align: center; font-size: 15px; margin-bottom: 8px; }
      body.est-app .app { padding-left: 104px; }
    }
    @media (max-width: 999px) { .nav-est .marca-est { display: none; } }
  `;
  function nav(activa) {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    document.body.classList.add('est-app');
    const n = document.createElement('nav'); n.className = 'nav-est'; n.setAttribute('aria-label', 'Secciones');
    n.innerHTML = '<div class="marca-est">ÑANDÉ</div>' + SECCIONES.map(([id, ico, txt, url]) => `<a href="${url}" class="${id === activa ? 'activo' : ''}"${id === activa ? ' aria-current="page"' : ''}><span class="ico">${ico}</span>${txt}</a>`).join('');
    document.body.appendChild(n);
  }

  // ---------- Fechas ----------
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const CLAVE = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const iso = d => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x.toISOString().slice(0, 10); };
  const hoy = iso(new Date());
  const aFecha = s => new Date(s + 'T12:00:00');
  const sumar = (s, n) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d); };
  const largo = s => { const d = aFecha(s); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; };
  const relativo = s => { const n = Math.round((aFecha(s) - aFecha(hoy)) / 864e5); return n === 0 ? 'hoy' : n === 1 ? 'mañana' : n === -1 ? 'ayer' : largo(s); };

  // ---------- Calendario por capas (EDU.04b): feriados y días sin clase ----------
  let calCache = {};
  function calendario(anio) {
    if (calCache[anio] !== undefined) return calCache[anio];
    try { calCache[anio] = window.Calendario ? window.Calendario.diasDelAnio({ anio, distrito: (E && E.distrito) || 'scz_capital' }) : null; } catch (e) { calCache[anio] = null; }
    return calCache[anio];
  }
  // { clase: bool, motivo, fin: bool (fin de semana), fuera: bool (vacaciones) }
  function infoDia(s) {
    const d = aFecha(s), dw = d.getDay();
    if (dw === 0 || dw === 6) return { clase: false, fin: true, motivo: '' };
    const cal = calendario(d.getFullYear());
    if (!cal) return { clase: true, motivo: '' };
    const x = cal.dias.find(z => z.fecha === s);
    if (!x) return { clase: false, fuera: true, motivo: s < cal.inicio || s > cal.fin ? 'Vacaciones' : 'Descanso entre trimestres' };
    return { clase: x.clase, motivo: x.motivo, menosHoras: x.menosHoras, trimestre: x.trimestre };
  }
  function clasesDe(s) {
    const inf = infoDia(s); if (!inf.clase || !E) return [];
    return (E.horario[CLAVE[aFecha(s).getDay()]] || []).map((m, i) => ({ periodo: i + 1, materia: m, desde: E.horas[i][0], hasta: E.horas[i][1] })).filter(c => c.materia);
  }
  const materia = id => (E && E.materias[id]) || { nombre: id, corto: id, icono: '📘', color: '#10B981' };
  const ahoraHHMM = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- ¿En qué parte va el curso? (unidad de los textos oficiales que toca hoy, por área) ----------
  // Reparto del cronograma (calendario.js de EDU.04b) sobre el plan de ejemplo de 2.º, si está cargado.
  // Si el plan no cubre el trimestre de hoy, se estima por la fecha dentro del trimestre.
  let vaCache = null;
  const normal = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function dondeVa() {
    return vaCache || (vaCache = fetch('/maqueta/textos/indice.json', { cache: 'no-cache' }).then(r => r.json()).then(INDICE => {
      const VA = {}, cal = calendario(aFecha(hoy).getFullYear()); if (!cal) return { VA, INDICE };
      const hoyTrim = (cal.dias.find(d => d.fecha >= hoy) || cal.dias[cal.dias.length - 1]).trimestre;
      const ultimo = {};
      try {
        const P = window.PLAN_EJEMPLO_2SEC;
        if (P && window.Calendario.repartir) {
          const rep = window.Calendario.repartir(P, E.horario, cal, { colchon: 0.1, semanaEvaluacion: true, desde: cal.inicio });
          Object.keys(rep.porFecha).filter(f => f <= hoy).sort().forEach(f => rep.porFecha[f].forEach(x => { if (x.tipo === 'tema') ultimo[x.area] = x.temaId; }));
        }
      } catch (e) { console.warn('[EST] sin reparto', e); }
      for (const a of INDICE.areas) {
        const plan = ((window.PLAN_EJEMPLO_2SEC || { areas: [] }).areas.find(p => p.id === a.id) || { temas: [] }).temas;
        const tema = plan.find(t => t.id === ultimo[a.id]);
        let k = -1;
        if (tema && tema.trimestre === hoyTrim) { const c = normal(tema.titulo).slice(0, 18); k = a.temas.findIndex(u => normal(u.titulo).startsWith(c)); }
        if (k < 0) {
          const delTrim = a.temas.map((u, i) => [u, i]).filter(([u]) => u.trimestre === hoyTrim);
          if (delTrim.length && cal.trimestres[hoyTrim - 1]) {
            const [i0, f0] = cal.trimestres[hoyTrim - 1], frac = Math.min(.999, Math.max(0, (aFecha(hoy) - aFecha(i0)) / (aFecha(f0) - aFecha(i0))));
            k = delTrim[Math.floor(frac * delTrim.length)][1];
          }
        }
        if (k >= 0) VA[a.id] = k;
      }
      return { VA, INDICE, trimestre: hoyTrim };
    }).catch(e => { console.warn('[EST] sin índice de textos', e); return { VA: {}, INDICE: { areas: [] } }; }));
  }

  window.EST = { E, nav, dondeVa, hoy, sumar, largo, relativo, aFecha, infoDia, clasesDe, materia, ahoraHHMM, esc, DIAS, CLAVE, MESES, calendario };
})();
