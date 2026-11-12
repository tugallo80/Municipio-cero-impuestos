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

  // Las páginas tienen <base href="/maqueta/"> (por cleanUrls): sin esto, un link "#ruta"
  // iría a /maqueta/#ruta (el selector de perfiles) en vez de quedarse en esta página.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    location.hash = a.getAttribute('href').slice(1);
  });

  // Router por hash: #ruta/parametro
  U.router = (rutas, porDefecto) => {
    let ultimo = null;
    const pintar = () => {
      // Al cambiar de pantalla de verdad (no al repintar la misma), se cierran las hojas abiertas.
      if (ultimo !== null && ultimo !== location.hash) document.querySelectorAll('.velo').forEach((v) => v.remove());
      ultimo = location.hash;
      const [ruta, param] = (location.hash.slice(1) || porDefecto).split('/');
      const fn = rutas[ruta] || rutas[porDefecto];
      document.querySelectorAll('[data-ruta]').forEach(a => a.classList.toggle('activo', a.dataset.ruta === ruta));
      const main = U.$('#principal');
      main.innerHTML = fn(param ? decodeURIComponent(param) : undefined) + '<p class="aviso-demo">Maqueta EDU.01b · datos inventados de un colegio ficticio</p>';
      window.scrollTo(0, 0);
      if (rutas._despues) rutas._despues(ruta, param);
    };
    window.addEventListener('hashchange', pintar);
    pintar();
  };


  // Perfil psicopedagógico v2 (EDU.01b). Sin "estilo de aprendizaje".
  const NIVEL = { 'logrado': '', 'en camino': 'ambar', 'inicio': 'gris' };
  U.perfilTutor = a => {
    const p = a.perfil;
    return `<div class="lista chica">
      <div><span class="ter">Fortalezas</span><br>${p.fortalezas}</div>
      <div><span class="ter">Nivel por tema</span><div class="chips" style="margin-top:6px">${p.temas.map(([t, n]) => `<span class="pildora ${NIVEL[n]}">${t} · ${n}</span>`).join('')}</div></div>
      <div><span class="ter">Errores frecuentes</span><br>${p.errores.map(e => '• ' + e).join('<br>')}</div>
      <div><span class="ter">Ritmo</span><br>${p.ritmo.min} min por misión · ${p.ritmo.pistas} pistas por misión · ${p.ritmo.abandonos} abandonos este mes<br><span class="sec">${p.ritmo.texto}</span></div>
      <div><span class="ter">Plan de repaso</span><br>${p.repaso}</div>
      <div><span class="ter">Intereses (para las historias de sus misiones)</span><br>${p.intereses.join(' · ')}</div>
      <div><span class="ter">Ajustes de accesibilidad</span><br>${p.accesibilidad.length ? p.accesibilidad.map(([x, quien]) => `• ${x} <span class="pildora gris">indicado por ${quien}</span>`).join('<br>') : '<span class="sec">Ninguno indicado</span>'}
        <div class="ter" style="margin-top:4px">Solo los indica un docente o profesional. La app no diagnostica y esto no se envía a la IA.</div></div>
      <div><span class="ter">Lengua y lectura</span><br>${p.lengua}</div>
      <div><span class="ter">Acceso</span><br>${p.acceso}</div>
      <div><span class="ter">Observación del tutor</span><br>${p.obs}</div>
    </div>`;
  };
  // Para padres: lenguaje positivo, sin etiquetas, con "cómo ayudarlo en casa"
  const NIVEL_PADRES = { 'logrado': 'ya lo domina', 'en camino': 'lo está aprendiendo', 'inicio': 'recién empieza' };
  U.perfilPadres = a => {
    const p = a.perfil, n = a.nombre.split(' ')[0];
    return `<div class="pila">
      <div class="tarjeta"><h3>🌟 Lo que mejor le sale</h3><p class="chica" style="margin-top:6px">${p.fortalezas}</p></div>
      <div class="tarjeta"><h3>📚 Cómo va en cada tema</h3><div class="lista chica" style="margin-top:6px">${p.temas.map(([t, x]) => `<div class="fila entre"><span>${t}</span><span class="pildora ${NIVEL[x]}">${NIVEL_PADRES[x]}</span></div>`).join('')}</div></div>
      <div class="tarjeta"><h3>🧩 Lo que está practicando</h3><p class="chica sec" style="margin-top:6px">${p.errores.map(e => '• ' + e).join('<br>')}</p>
        <p class="ter" style="margin-top:6px">Equivocarse es parte de aprender: Kay le da pistas paso a paso.</p></div>
      <div class="tarjeta"><h3>⏱️ Su ritmo</h3><p class="chica" style="margin-top:6px">${p.ritmo.texto}. Suele tardar unos ${p.ritmo.min} minutos por misión.</p></div>
      <div class="tarjeta"><h3>💚 Le interesa</h3><p class="chica" style="margin-top:6px">${p.intereses.join(' · ')}</p></div>
      ${p.accesibilidad.length ? `<div class="tarjeta"><h3>🛠️ Ajustes que usa</h3><p class="chica" style="margin-top:6px">${p.accesibilidad.map(([x, quien]) => `• ${x} <span class="ter">(indicado por ${quien})</span>`).join('<br>')}</p></div>` : ''}
      <div class="tarjeta" style="border-color:var(--verde);background:linear-gradient(135deg,#0b2a20,#111)"><h3>🏠 Cómo ayudar a ${n} en casa</h3>
        <div class="lista chica" style="margin-top:6px">${p.casa.map(c => `<div>✅ ${c}</div>`).join('')}</div></div>
      <p class="ter">Este perfil lo arma su tutor con lo que observa. Cada niño aprende distinto: sirve para acompañarlo, no para ponerle etiquetas. Lo ven solo ustedes, su tutor y quien autorice la dirección.</p>
    </div>`;
  };

  // ── Demo sin login (EDU.15) ──
  U.esDemo = () => !!window.NandeClase?.esDemo?.();
  // Espera la respuesta de la IA hasta `ms`; si tarda más, devuelve null (la promesa sigue viva).
  U.aTiempo = (promesa, ms = 2500) => Promise.race([promesa, new Promise((r) => setTimeout(() => r(null), ms))]);

  // Pastilla "Demo" en la barra de arriba (con "Salir de la demo"), cuando la cuenta es la demo.
  function marcarDemo() {
    const top = document.querySelector('header.top');
    if (!top) return;
    let p = top.querySelector('.pildora-demo');
    if (!U.esDemo()) { p?.remove(); return; }
    if (p) return;
    p = document.createElement('button');
    p.className = 'pildora pildora-demo';
    p.title = 'Salir de la demo';
    p.textContent = '✨ Demo';
    p.style.cssText = 'border:0;cursor:pointer;margin-left:auto';
    p.onclick = async () => {
      if (!confirm('¿Salir de la demo? En este equipo se olvida el link de la demo.')) return;
      await window.NandeClase?.salirDemo?.();
      U.toast('Saliste de la demo');
    };
    top.appendChild(p);
  }
  window.addEventListener('nande-cuenta', marcarDemo);
  window.addEventListener('nande-clase-listo', marcarDemo);

  window.U = U;
})();
