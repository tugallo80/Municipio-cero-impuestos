// EDU.17b — Lector tipo libro para "Mis textos": hojas de verdad, vuelta de página al deslizar.
// - Libros de área (Inglés, Filosofía, Artes, Música, Valores): las PÁGINAS REALES del PDF en imagen
//   (textos/paginas/<carpeta>/NNN.webp, 001 = portada).
// - Texto general (Lengua, Mate, Bio-Geo, Sociales): sin PDF → el texto extraído, maquetado en hojas.
// - Doble página (libro abierto) si entra a lo ancho (tablet acostada, PC); una página en celular parado.
// - Vuelta de página con CSS 3D (curvatura con luz y sombra) que sigue al dedo o al mouse.
//   Con "reducir movimiento" o un equipo lento: deslizamiento simple.
// Uso: const L = Libro.abrir(contenedor, { paginas, pagina, alCambiar, claro, tam }); L.ir(n); L.siguiente(); L.anterior()
(function () {
  const lento = (() => {
    try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return true; } catch (e) {}
    return (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 1;
  })();

  const css = `
  .lb-escena { position: relative; display: flex; justify-content: center; align-items: center; overflow: hidden; touch-action: pan-y; user-select: none; -webkit-user-select: none; }
  .lb-libro { position: relative; perspective: 2600px; }
  /* mesa: fondo sobrio de escritorio */
  .lb-escena.mesa { background: radial-gradient(ellipse at 50% 38%, #2B2622 0%, #171412 62%, #0C0B0A 100%); }
  .lb-escena.mesa::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .07; background: repeating-linear-gradient(92deg, #000 0 2px, transparent 2px 9px, #fff 9px 10px, transparent 10px 23px); }
  /* tapa del libro detrás de las hojas, un poco más grande, con lomo y sombra sobre la mesa */
  .lb-tapa { position: absolute; z-index: 0; border-radius: 7px; box-shadow: 0 22px 44px rgba(0,0,0,.6), 0 6px 14px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.08); transition: left .25s, width .25s; }
  .lb-tapa::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(160deg, rgba(255,255,255,.14), rgba(0,0,0,.25)); }
  .lb-lomo { position: absolute; z-index: 0; width: 16px; margin-left: -8px; background: linear-gradient(to right, rgba(0,0,0,.45), rgba(255,255,255,.12) 45%, rgba(0,0,0,.5)); border-radius: 3px; }
  /* canto de las hojas: capas finas, más grueso del lado con más páginas */
  .lb-canto { position: absolute; z-index: 1; transition: width .25s, left .25s; background: repeating-linear-gradient(to right, #EFEADF 0 1px, #CFC7B6 1px 2px); }
  .lb-canto.izq { border-radius: 4px 0 0 4px; box-shadow: inset 4px 0 6px -3px rgba(0,0,0,.35); }
  .lb-canto.der { border-radius: 0 4px 4px 0; box-shadow: inset -4px 0 6px -3px rgba(0,0,0,.35); }
  .lb-escena.noche .lb-canto { background: repeating-linear-gradient(to right, #3A362F 0 1px, #24211C 1px 2px); }
  /* textura muy sutil de papel */
  .lb-pag::before, .lb-cara::before { content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 2; opacity: .07; mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .45 0 0 0 0 .35 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23f)'/%3E%3C/svg%3E"); }
  .lb-escena.noche .lb-pag::before { mix-blend-mode: screen; opacity: .04; }
  .lb-pag { position: absolute; top: 0; height: 100%; overflow: hidden; background: #FBF8F1; color: #1F1A12; z-index: 1; }
  .lb-pag.vacia { background: transparent; }
  .lb-pag.izq { border-radius: 6px 0 0 6px; } .lb-pag.der { border-radius: 0 6px 6px 0; } .lb-pag.sola { border-radius: 4px 6px 6px 4px; }
  /* lomo: sombra suave hacia el centro del libro abierto */
  .lb-pag.izq::after, .lb-pag.der::after { content: ''; position: absolute; top: 0; bottom: 0; width: 9%; pointer-events: none; z-index: 3; }
  .lb-pag.izq::after, .lb-pag.der::after { width: 14%; }
  .lb-pag.izq::after { right: 0; background: linear-gradient(to left, rgba(0,0,0,.30), rgba(0,0,0,.10) 22%, rgba(0,0,0,.03) 55%, rgba(0,0,0,0)), linear-gradient(to left, rgba(255,255,255,0) 60%, rgba(255,255,255,.10)); }
  .lb-pag.der::after { left: 0; background: linear-gradient(to right, rgba(0,0,0,.30), rgba(0,0,0,.10) 22%, rgba(0,0,0,.03) 55%, rgba(0,0,0,0)), linear-gradient(to right, rgba(255,255,255,0) 60%, rgba(255,255,255,.10)); }
  .lb-pag.sola::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 4%; background: linear-gradient(to right, rgba(0,0,0,.14), rgba(0,0,0,0)); pointer-events: none; z-index: 3; }
  .lb-pag img { width: 100%; height: 100%; object-fit: contain; display: block; background: #fff; pointer-events: none; }
  .lb-hoja { position: absolute; top: 0; height: 100%; transform-style: preserve-3d; z-index: 5; will-change: transform; }
  .lb-cara { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: hidden; background: #FBF8F1; color: #1F1A12; }
  .lb-cara.dorso { transform: rotateY(180deg); }
  .lb-cara .lb-luz { position: absolute; inset: 0; pointer-events: none; z-index: 4; }
  .lb-sombra { position: absolute; top: 0; height: 100%; pointer-events: none; z-index: 4; }
  .lb-pag .cinta { position: absolute; top: -4px; right: 18px; width: 26px; height: 64px; background: #10B981; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%); z-index: 6; box-shadow: 0 2px 6px rgba(0,0,0,.3); }
  .lb-pag .cinta-txt { position: absolute; top: 8px; right: 50px; z-index: 6; background: #10B981; color: #04120C; font: 700 11px Inter, sans-serif; padding: 3px 8px; border-radius: 999px; }
  /* modo noche: papel oscuro (texto) o páginas invertidas suave (imagen) */
  .lb-escena.noche .lb-pag, .lb-escena.noche .lb-cara { background: #1A1814; color: #E9E3D6; }
  .lb-escena.noche img { filter: invert(.9) hue-rotate(180deg) brightness(.95); background: #1A1814; }
  .lb-escena.noche .lb-pag .cinta { filter: none; }
  /* deslizamiento simple */
  @keyframes lb-entra-der { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes lb-entra-izq { from { transform: translateX(-40px); opacity: 0; } to { transform: none; opacity: 1; } }
  .lb-libro.entra-der .lb-pag { animation: lb-entra-der .22s ease-out; }
  .lb-libro.entra-izq .lb-pag { animation: lb-entra-izq .22s ease-out; }
  .lb-flecha { position: absolute; bottom: 10px; z-index: 8; width: 40px; height: 40px; border-radius: 50%; border: 0; background: rgba(0,0,0,.45); color: #fff; font-size: 20px; line-height: 40px; cursor: pointer; opacity: .75; }
  .lb-flecha:hover { opacity: 1; } .lb-flecha[disabled] { opacity: .15; cursor: default; }
  .lb-flecha.ant { left: 10px; } .lb-flecha.sig { right: 10px; }
  `;
  let puesto = false;
  function estilos() { if (puesto) return; puesto = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

  function abrir(cont, o) {
    estilos();
    // o.paginas: n páginas (1..n); o.pintar(i) → HTML de la página i; o.ratio ancho/alto
    const L = { n: o.paginas, actual: Math.max(1, o.pagina || 1), doble: false, ocupado: false };
    const ratio = o.ratio || 0.72;
    cont.innerHTML = '<div class="lb-escena"><div class="lb-libro"></div><button class="lb-flecha ant" aria-label="Página anterior">‹</button><button class="lb-flecha sig" aria-label="Página siguiente">›</button></div>';
    const escena = cont.firstChild, libro = escena.firstChild;
    const [bAnt, bSig] = escena.querySelectorAll('.lb-flecha');
    let pw = 300, ph = 420, tapa = 10, canto = 8;
    escena.classList.toggle('mesa', o.mesa !== false);

    // Doble: izquierda par, derecha impar; la portada (1) sola a la derecha.
    const pliego = p => L.doble ? (p % 2 === 0 ? [p, p + 1] : [p - 1, p]) : [p];
    const valida = i => i >= 1 && i <= L.n;
    const pag = (i, clase, x) => `<div class="lb-pag ${clase} ${valida(i) ? '' : 'vacia'}" style="left:${x}px;width:${pw}px">${valida(i) ? o.pintar(i) : ''}</div>`;

    function medir() {
      tapa = Math.round(Math.max(7, Math.min(18, cont.clientHeight * 0.018)));
      canto = Math.round(Math.max(4, Math.min(16, cont.clientHeight * 0.016)));
      const marco = tapa + canto;
      const W0 = cont.clientWidth, H0 = cont.clientHeight, W = W0 - 2 * marco - 8, H = H0 - 2 * marco - 12;
      let h = H, w = Math.round(h * ratio);
      L.doble = o.doble !== false && 2 * w <= W && W > H * 1.05;
      if (!L.doble && w > W) { w = W; h = Math.round(w / ratio); }
      pw = w; ph = h;
      escena.style.width = W0 + 'px'; escena.style.height = H0 + 'px';
      libro.style.width = (L.doble ? 2 * pw : pw) + 'px'; libro.style.height = ph + 'px';
      // en doble, la portada y la contratapa van solas: el libro se corre para quedar centrado
    }
    function pintar(dir) {
      const [a, b] = pliego(L.actual);
      if (L.doble) libro.innerHTML = cubierta(a, b) + pag(a, 'izq', 0) + pag(b, 'der', pw);
      else libro.innerHTML = cubierta(a, a) + pag(a, 'sola', 0);
      libro.style.transform = L.doble && a < 1 ? `translateX(${-pw / 2}px)` : L.doble && !valida(b) ? `translateX(${pw / 2}px)` : '';
      libro.classList.remove('entra-der', 'entra-izq');
      if (dir) { void libro.offsetWidth; libro.classList.add(dir > 0 ? 'entra-der' : 'entra-izq'); }
      bAnt.disabled = L.actual <= 1; bSig.disabled = !valida(pliego(L.actual).slice(-1)[0] + 1);
      if (o.alCambiar) o.alCambiar(L.actual, pliego(L.actual).filter(valida));
      // precarga de las que siguen (imágenes)
      if (o.precargar) [1, 2, 3, -1, -2].forEach(d => valida(L.actual + d) && o.precargar(L.actual + d));
    }

    // Tapa (un poco más grande que las hojas), lomo y canto de las hojas según lo que queda a cada lado
    function cubierta(a, b) {
      const c = o.tapa || '#1F2937', hayIzq = L.doble ? valida(a) : true, hayDer = L.doble ? valida(b) : true;
      const ancho = L.doble ? 2 * pw : pw, x0 = L.doble && !hayIzq ? pw : 0, x1 = L.doble && !hayDer ? pw : ancho;
      const antes = Math.max(0, (L.doble ? a : a) - 1), despues = Math.max(0, L.n - (L.doble ? b : a));
      const gIzq = hayIzq && antes > 0 ? Math.max(2, Math.round(canto * Math.min(1, antes / Math.max(1, L.n * 0.6)))) : 0;
      const gDer = hayDer && despues > 0 ? Math.max(2, Math.round(canto * Math.min(1, despues / Math.max(1, L.n * 0.6)))) : 0;
      const fondo = `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 55%, #000))`;
      return `<div class="lb-tapa" style="left:${x0 - tapa - gIzq}px;top:${-tapa}px;width:${x1 - x0 + 2 * tapa + gIzq + gDer}px;height:${ph + 2 * tapa}px;background:${c};background:${fondo}"></div>` +
        (L.doble && hayIzq && hayDer ? `<div class="lb-lomo" style="left:${pw}px;top:${-tapa}px;height:${ph + 2 * tapa}px"></div>` : '') +
        (gIzq ? `<div class="lb-canto izq" style="left:${x0 - gIzq}px;top:3px;width:${gIzq}px;height:${ph - 6}px"></div>` : '') +
        (gDer ? `<div class="lb-canto der" style="left:${x1}px;top:3px;width:${gDer}px;height:${ph - 6}px"></div>` : '');
    }

    // ---------- Vuelta de página 3D ----------
    // adelante: la hoja derecha (o la única) gira sobre su borde izquierdo (lomo) de 0° a −180°.
    // atrás: la hoja izquierda (o la anterior) gira sobre su borde derecho de 0° a +180°.
    let giro = null;
    function empezar(dir) {
      if (L.ocupado) return null;
      const [a, b] = pliego(L.actual);
      const destino = dir > 0 ? (L.doble ? b + 1 : a + 1) : (L.doble ? a - 1 : a - 1);
      if (!valida(destino) && !(L.doble && valida(destino + (dir > 0 ? 1 : -1)))) return null;
      L.ocupado = true;
      if (lento) return { dir, simple: true, destino };
      const [na, nb] = pliego(destino);
      let base, frente, dorso, x, origen;
      if (L.doble && dir > 0) { base = pag(a, 'izq', 0) + pag(nb, 'der', pw); frente = b; dorso = na; x = pw; origen = 'left'; }
      else if (L.doble) { base = pag(na, 'izq', 0) + pag(b, 'der', pw); frente = a; dorso = nb; x = 0; origen = 'right'; }
      else if (dir > 0) { base = pag(destino, 'sola', 0); frente = a; dorso = null; x = 0; origen = 'left'; }
      else { base = pag(a, 'sola', 0); frente = destino; dorso = null; x = 0; origen = 'left'; }
      libro.innerHTML = (L.doble ? cubierta(dir > 0 ? a : na, dir > 0 ? nb : b) : cubierta(a, a)) + base + `<div class="lb-sombra" style="left:${L.doble ? (dir > 0 ? pw : 0) : 0}px;width:${pw}px"></div>
        <div class="lb-hoja" style="left:${x}px;width:${pw}px;transform-origin:${origen} center">
          <div class="lb-cara frente">${valida(frente) ? o.pintar(frente) : ''}<div class="lb-luz"></div></div>
          <div class="lb-cara dorso">${dorso && valida(dorso) ? o.pintar(dorso) : ''}<div class="lb-luz"></div></div></div>`;
      const hoja = libro.querySelector('.lb-hoja'), sombra = libro.querySelector('.lb-sombra'), luces = libro.querySelectorAll('.lb-luz');
      // en una página sola hacia atrás, la anterior entra desde −180°
      const desde = !L.doble && dir < 0 ? -180 : 0, hasta = !L.doble ? (dir > 0 ? -180 : 0) : dir > 0 ? -180 : 180;
      return { dir, destino, hoja, sombra, luces, desde, hasta, origen };
    }
    function poner(g, t) {   // t: 0 (sin girar) → 1 (girada)
      const ang = g.desde + (g.hasta - g.desde) * t, abs = Math.abs(ang), k = Math.sin(abs * Math.PI / 180);
      // la curvatura se insinúa con una leve inclinación y escala mientras está levantada
      g.hoja.style.transform = `rotateY(${ang}deg) skewY(${(g.origen === 'left' ? -1 : 1) * k * 1.6}deg) scaleX(${1 - k * 0.04})`;
      const luz = abs < 90 ? 'to left' : 'to right';
      g.luces[0].style.background = `linear-gradient(${luz}, rgba(255,255,255,${0.18 * k}) 0%, rgba(0,0,0,${0.28 * k}) 55%, rgba(0,0,0,0) 100%)`;
      g.luces[1].style.background = `linear-gradient(${abs < 90 ? 'to right' : 'to left'}, rgba(0,0,0,${0.32 * k}) 0%, rgba(0,0,0,0) 60%)`;
      g.sombra.style.background = `linear-gradient(${g.origen === 'left' ? 'to right' : 'to left'}, rgba(0,0,0,${0.35 * k}) 0%, rgba(0,0,0,0) ${30 + 50 * (1 - k)}%)`;
    }
    function terminar(g, completar) {
      if (g.simple) { L.ocupado = false; if (completar) { L.actual = g.destino; pintar(g.dir); } return; }
      const t0 = performance.now(), dur = 420, ini = g.t || 0, fin = completar ? 1 : 0;
      const paso = ahora => {
        const u = Math.min(1, (ahora - t0) / dur), e = 1 - Math.pow(1 - u, 3);
        poner(g, ini + (fin - ini) * e);
        if (u < 1) requestAnimationFrame(paso);
        else { L.ocupado = false; if (completar) L.actual = g.destino; pintar(); }
      };
      requestAnimationFrame(paso);
    }
    L.siguiente = () => { const g = empezar(1); if (g) terminar(g, true); };
    L.anterior = () => { const g = empezar(-1); if (g) terminar(g, true); };
    L.ir = (p, sinAnim) => {
      p = Math.max(1, Math.min(L.n, p | 0));
      if (sinAnim || lento || Math.abs(p - L.actual) > 2) { const d = Math.sign(p - L.actual); L.actual = p; pintar(sinAnim ? 0 : d); return; }
      if (pliego(p).includes(L.actual)) { L.actual = p; pintar(); return; }
      const g = empezar(Math.sign(p - L.actual)); if (g) { g.destino = p; terminar(g, true); }
    };
    bAnt.onclick = e => { e.stopPropagation(); L.anterior(); };
    bSig.onclick = e => { e.stopPropagation(); L.siguiente(); };

    // ---------- Dedo / mouse ----------
    let toque = null;
    escena.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button, a, input')) return;
      toque = { x: e.clientX, y: e.clientY, t: performance.now(), g: null, id: e.pointerId };
    });
    escena.addEventListener('pointermove', e => {
      if (!toque || e.pointerId !== toque.id) return;
      const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
      if (!toque.g) {
        if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy)) return;
        toque.g = empezar(dx < 0 ? 1 : -1) || 'nada';
        try { escena.setPointerCapture(e.pointerId); } catch (er) {}
      }
      const g = toque.g; if (g === 'nada' || g.simple) return;
      const ancho = (L.doble ? pw : pw) * 1.1;
      g.t = Math.max(0, Math.min(1, (g.dir > 0 ? -dx : dx) / ancho));
      poner(g, g.t);
    });
    const soltar = e => {
      if (!toque || (e && e.pointerId !== toque.id)) return;
      const t = toque; toque = null;
      if (t.g && t.g !== 'nada') {
        const dx = e ? e.clientX - t.x : 0, vel = Math.abs(dx) / Math.max(1, performance.now() - t.t);
        terminar(t.g, t.g.simple ? true : (t.g.t > 0.35 || vel > 0.5));
        return;
      }
      if (t.g === 'nada' || !e) return;
      // toque sin arrastrar: borde derecho → siguiente, borde izquierdo → anterior
      const r = escena.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (Math.abs(e.clientX - t.x) < 8 && performance.now() - t.t < 500) { if (x > 0.82) L.siguiente(); else if (x < 0.18) L.anterior(); else if (o.alTocarCentro) o.alTocarCentro(); }
    };
    escena.addEventListener('pointerup', soltar);
    escena.addEventListener('pointercancel', () => { if (toque && toque.g && toque.g !== 'nada') terminar(toque.g, false); toque = null; });
    const teclas = e => {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); L.siguiente(); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); L.anterior(); }
    };
    addEventListener('keydown', teclas);
    let rz; const alRedimensionar = () => { clearTimeout(rz); rz = setTimeout(() => { if (L.ocupado) return; medir(); if (o.alRedimensionar) o.alRedimensionar(pw, ph); pintar(); }, 120); };
    addEventListener('resize', alRedimensionar);

    L.noche = v => escena.classList.toggle('noche', !!v);
    L.repintar = () => { medir(); pintar(); };
    L.medidas = () => ({ pw, ph, doble: L.doble });
    L.cerrar = () => { removeEventListener('keydown', teclas); removeEventListener('resize', alRedimensionar); cont.innerHTML = ''; };
    L.noche(o.noche);
    medir();
    if (o.alRedimensionar) o.alRedimensionar(pw, ph);
    pintar();
    return L;
  }
  window.Libro = { abrir, lento };
})();
