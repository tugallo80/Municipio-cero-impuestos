// Utilidades compartidas de la maqueta (sin build, sin librerías).
(function () {
  const D = window.DEMO;
  const U = {};

  U.$ = (sel, raiz = document) => raiz.querySelector(sel);
  U.materia = id => D.materias.find(m => m.id === id);
  U.alumno = id => D.alumnos.find(a => a.id === id);
  U.curso = id => D.cursos.find(c => c.id === id);
  U.bs = n => 'Bs ' + n.toLocaleString('es-BO');

  U.barra = (v, extra = '') => {
    const cls = v < 40 ? 'rojo' : v < 65 ? 'ambar' : '';
    return `<div class="barra ${cls} ${extra}"><i style="width:${v}%"></i></div>`;
  };
  U.colorNota = n => n >= 75 ? 'var(--verde)' : n >= 60 ? 'var(--ambar)' : 'var(--rojo)';
  U.tendencia = t => t === 'sube' ? '<span class="pildora">▲ sube</span>' : t === 'baja' ? '<span class="pildora rojo">▼ baja</span>' : '<span class="pildora gris">● estable</span>';
  U.estado = e => {
    const map = { 'hecho': '', 'hecha': '', 'pagado': '', 'autorizado': '', 'aprobado': '', 'en curso': 'ambar', 'activa': 'ambar', 'en revisión': 'ambar', 'pendiente': 'gris', 'borrador': 'gris' };
    return `<span class="pildora ${map[e] ?? 'gris'}">${e}</span>`;
  };

  U.toast = (txt, ms = 2200) => {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = txt;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };

  U.hoja = html => {
    const v = document.createElement('div');
    v.className = 'velo';
    v.innerHTML = `<div class="hoja">${html}</div>`;
    v.addEventListener('click', e => { if (e.target === v || e.target.closest('[data-cerrar]')) v.remove(); });
    document.body.appendChild(v);
    return v;
  };

  // Router por hash: #ruta/parametro
  U.router = (rutas, porDefecto) => {
    const pintar = () => {
      const [ruta, param] = (location.hash.slice(1) || porDefecto).split('/');
      const fn = rutas[ruta] || rutas[porDefecto];
      document.querySelectorAll('[data-ruta]').forEach(a => a.classList.toggle('activo', a.dataset.ruta === ruta));
      const main = U.$('#principal');
      main.innerHTML = fn(param ? decodeURIComponent(param) : undefined) + '<p class="aviso-demo">Maqueta EDU.01 · datos inventados de un colegio ficticio</p>';
      window.scrollTo(0, 0);
      if (rutas._despues) rutas._despues(ruta, param);
    };
    window.addEventListener('hashchange', pintar);
    pintar();
  };

  window.U = U;
})();
