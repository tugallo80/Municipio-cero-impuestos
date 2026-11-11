// EDU.17 — App del alumno: barra de navegación compartida y ayudas comunes.
// Secciones: Hoy · Agenda · Mis textos · Mis tareas · Mi tutor · Mundo (el juego).
// Barra abajo en celular y tablet parada; a la izquierda en tablet acostada y PC (≥ 1000 px).
(function () {
  const E = window.ESTUDIANTE_DEMO;
  const SECCIONES = [
    ['hoy', '🏠', 'Hoy', '/maqueta/hoy/'],
    ['agenda', '🗓️', 'Agenda', '/maqueta/agenda/'],
    ['textos', '📖', 'Mis textos', '/maqueta/textos/'],
    ['tareas', '📋', 'Mis tareas', '/maqueta/tareas/'],
    ['tutor', '🧑‍🏫', 'Mi tutor', '/maqueta/mi-tutor/'],
    ['mundo', '🌎', 'Mundo', '/maqueta/alumno/']
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

  window.EST = { E, nav, hoy, sumar, largo, relativo, aFecha, infoDia, clasesDe, materia, ahoraHHMM, esc, DIAS, CLAVE, MESES, calendario };
})();
