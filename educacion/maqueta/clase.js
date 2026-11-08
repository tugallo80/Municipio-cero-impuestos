// ══════════════════════════════════════════════════
//  Clase grabada (EDU.04a) — pantalla del profe y de la dirección (sin build).
//
//  ▶ Empezar clase (según el horario de hoy) → aviso → graba con el micrófono
//  (MediaRecorder) → se corta sola al terminar la hora o con ■ Terminar →
//  el audio va a la Function eduClase (por /voz/clase.js) → informe.
//
//  El audio solo vive en la memoria de esta página hasta que el servidor responde:
//  no se guarda en el equipo ni en el servidor. Si se cierra la página, se pierde.
//
//  Usa window.NandeClase (módulo /voz/clase.js) si cargó; si no, solo el ejemplo.
// ══════════════════════════════════════════════════
(function () {
  const D = window.DEMO;
  const CURSO_SERVIDOR = { '4A': '4to_primaria', '5A': '5to_primaria' };
  const CURSO_MAQUETA = { '4to_primaria': '4A', '5to_primaria': '5A' };
  const DURACION_MIN = 45;      // una hora pedagógica (demo)
  const MAX_MIN = 75;           // tope duro, igual que el servidor
  const KBPS = 16000;           // voz: alcanza y pesa poco (~7 MB por hora)

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dosDig = (n) => String(n).padStart(2, '0');
  const reloj = (seg) => `${dosDig(Math.floor(seg / 60))}:${dosDig(Math.floor(seg % 60))}`;
  const hora = (ms) => { const d = new Date(ms); return `${dosDig(d.getHours())}:${dosDig(d.getMinutes())}`; };
  const fechaCorta = (ms) => new Date(ms).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
  const usd = (n) => n == null ? '—' : 'USD ' + Number(n).toLocaleString('es-BO', { minimumFractionDigits: 3, maximumFractionDigits: 4 });

  // ── Estilos propios (diseño ÑANDÉ) ──────────────────
  const css = `
  #cg-barra{position:fixed;left:0;right:0;bottom:0;z-index:60;display:none;align-items:center;gap:10px;flex-wrap:wrap;
    padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:#1a0505;border-top:2px solid var(--rojo);box-shadow:0 -6px 24px rgba(0,0,0,.6)}
  #cg-barra.ver{display:flex}
  #cg-barra .punto{width:14px;height:14px;border-radius:50%;background:var(--rojo);box-shadow:0 0 0 0 rgba(239,68,68,.7);animation:cg-late 1.4s infinite;flex-shrink:0}
  #cg-barra.pausa{background:#1a1405;border-top-color:var(--ambar)}
  #cg-barra.pausa .punto{background:var(--ambar);animation:none}
  @keyframes cg-late{0%{box-shadow:0 0 0 0 rgba(239,68,68,.7)}70%{box-shadow:0 0 0 12px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}
  #cg-barra .txt{flex:1;min-width:150px}
  #cg-barra .txt b{font-family:'Space Grotesk';font-size:16px;display:block}
  #cg-barra .txt span{font-size:12px;color:var(--texto2)}
  #cg-barra .nivel{width:60px;height:8px;border-radius:9px;background:var(--sup3);overflow:hidden}
  #cg-barra .nivel i{display:block;height:100%;width:0;background:var(--verde);transition:width .1s}
  #cg-barra button{min-height:46px;padding:0 16px;border-radius:12px;font-weight:700;font-family:'Space Grotesk'}
  #cg-barra .pausar{background:var(--sup3);color:#fff}
  #cg-barra .terminar{background:var(--rojo);color:#fff}
  body.cg-grabando .principal{padding-bottom:160px}
  @media (max-width:600px){#cg-barra .txt{flex-basis:calc(100% - 40px)}#cg-barra .nivel{display:none}#cg-barra button{flex:1}}
  .cg-dos{grid-template-columns:1fr}@media (min-width:760px){.cg-dos{grid-template-columns:1fr 1fr}}
  .cg-hoy{border:2px solid var(--verde);background:linear-gradient(135deg,#062a1d,#0A0A0A)}
  .cg-hoy .btn{min-height:54px;font-size:17px}
  .cg-aviso li{margin:6px 0 6px 18px}
  .cg-bloque{margin-top:14px}
  .cg-bloque h4{font-size:13px;color:var(--texto2);font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em}
  .cg-bloque ul{margin-left:18px}.cg-bloque li{margin:4px 0}
  .cg-alerta{border:1px solid var(--ambar);background:rgba(245,158,11,.08);border-radius:12px;padding:10px 12px;margin-top:8px}
  .cg-transcripcion{white-space:pre-wrap;font-size:13px;color:var(--texto2);max-height:360px;overflow:auto;background:var(--sup1);border-radius:12px;padding:12px;margin-top:8px}
  .cg-espera{text-align:center;padding:40px 16px}
  .cg-espera .ruedita{width:54px;height:54px;border-radius:50%;border:5px solid var(--sup3);border-top-color:var(--verde);margin:0 auto 18px;animation:cg-gira 1s linear infinite}
  @keyframes cg-gira{to{transform:rotate(360deg)}}
  .cg-mismo{display:flex;gap:10px;align-items:flex-start;background:var(--verde-suave);border-radius:12px;padding:10px 12px;font-size:13px}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  document.body.insertAdjacentHTML('beforeend', `
    <div id="cg-barra" role="status" aria-live="polite">
      <div class="punto"></div>
      <div class="txt"><b id="cg-estado">🔴 Grabando</b><span id="cg-detalle"></span></div>
      <div class="nivel" title="Nivel del micrófono"><i id="cg-nivel"></i></div>
      <button class="pausar" id="cg-pausar">⏸ Pausa</button>
      <button class="terminar" id="cg-terminar">■ Terminar</button>
    </div>`);

  // ── Estado ─────────────────────────────────────────
  let rec = null;   // { mr, stream, trozos, mime, inicio, fin, acumulado, desde, clase, tic, ctx, wake }
  let pendiente = null; // { blob, mime, segundos, clase } si falló el envío (solo en memoria)
  let enviando = null;  // { clase, desde }
  const informes = {};  // id → clase (los que trajo el servidor + el ejemplo)
  let listado = null;   // respuesta de listar()

  const api = () => window.NandeClase || null;
  const enClase = () => /^#clase/.test(location.hash);
  function repintar() {
    if (typeof window.Clase?.alRepintar === 'function') window.Clase.alRepintar();
  }

  // Horario de hoy + la clase de prueba de 2 minutos (para mostrar en una reunión).
  function horario() {
    const lista = D.hoy.map((h, i) => ({ id: 'h' + i, ...h, minutos: DURACION_MIN, nombreMateria: U.materia(h.materia).nombre, icono: U.materia(h.materia).icono }));
    lista.unshift({ id: 'prueba', materia: 'mat', curso: '4A', hora: 'ahora', tema: 'Clase de prueba (se corta sola a los 2 minutos)', pensum: 'Unidad 5 · Tema 3', estado: 'pendiente', minutos: 2, nombreMateria: 'Matemática', icono: '🧪' });
    return lista;
  }
  const claseDeHoy = () => horario().find((h) => h.estado === 'en curso') || horario().find((h) => h.estado === 'pendiente');

  // ── Aviso + login antes de grabar ──────────────────
  function pedirEmpezar(id) {
    if (rec) return U.toast('Ya hay una clase grabándose');
    const h = horario().find((x) => x.id === id) || claseDeHoy();
    const conectado = !!api();
    const sinCuenta = conectado && !api().usuario();
    const hoja = U.hoja(`
      <h2>▶ Empezar clase</h2>
      <p class="sec chica" style="margin:4px 0 12px">${esc(h.icono)} ${esc(h.nombreMateria)} · ${esc(U.curso(h.curso).nombre)} · ${esc(h.tema)}</p>
      <div class="tarjeta cg-aviso chica" style="border-color:var(--ambar)">
        <b>Antes de grabar</b>
        <ul>
          <li>Se graba <b>el audio</b> de la clase con el micrófono de este equipo. Vas a ver <b>🔴 Grabando</b> todo el tiempo, con pausa y terminar.</li>
          <li>Se corta sola a los <b>${h.minutos} minutos</b> (a las ${hora(Date.now() + h.minutos * 60e3)}).</li>
          <li><b>Avisale al curso</b> que la clase se graba.</li>
          <li>El audio va a la IA para el resumen y <b>se borra enseguida</b>: no se guarda en ningún lado.</li>
          <li>En el resumen, los <b>nombres de los alumnos se cambian por "un alumno"</b>.</li>
          <li>El informe <b>lo ves vos y la dirección, el mismo</b>. Se borra solo a los 30 días (la transcripción, a los 7).</li>
          <li>Es una ayuda para planificar, <b>no una evaluación</b>.</li>
          <li class="ter">Demo: hablá vos simulando una clase, con nombres inventados. Nada de chicos reales.</li>
        </ul>
      </div>
      ${!conectado ? `<p class="chica" style="margin-top:12px;color:var(--ambar)">Sin conexión con el servidor: se puede grabar, pero el resumen no se va a poder hacer. Mirá el <a href="#clase/ejemplo" data-cerrar>informe de ejemplo</a>.</p>` : ''}
      ${sinCuenta ? `<div style="margin-top:14px"><b class="chica">Entrá con tu cuenta de prueba</b>
        <div class="grilla g2" style="gap:8px;margin-top:8px">
          <input id="cg-u" placeholder="Usuario" autocomplete="username" autocapitalize="none" style="min-height:48px;border-radius:12px;border:1px solid var(--borde);background:var(--sup2);color:#fff;padding:0 12px;font-size:16px">
          <input id="cg-c" type="password" placeholder="Clave" autocomplete="current-password" style="min-height:48px;border-radius:12px;border:1px solid var(--borde);background:var(--sup2);color:#fff;padding:0 12px;font-size:16px">
        </div><p id="cg-err" class="chica" style="color:var(--rojo);min-height:18px;margin-top:6px"></p></div>` : ''}
      <label class="fila chica" style="margin:14px 0;gap:10px;cursor:pointer"><input type="checkbox" id="cg-ok" style="width:22px;height:22px"> Avisé al curso que la clase se graba</label>
      <button class="btn ancho" id="cg-ir" style="background:var(--rojo);color:#fff;min-height:54px" disabled>🔴 Empezar a grabar</button>
      <button class="btn ancho sec2" data-cerrar style="margin-top:8px">Ahora no</button>`);
    const ok = hoja.querySelector('#cg-ok'), ir = hoja.querySelector('#cg-ir');
    ok.addEventListener('change', () => { ir.disabled = !ok.checked; });
    ir.addEventListener('click', async () => {
      ir.disabled = true;
      if (sinCuenta) {
        const r = await api().entrar(hoja.querySelector('#cg-u').value, hoja.querySelector('#cg-c').value);
        if (!r.ok) { hoja.querySelector('#cg-err').textContent = r.error; ir.disabled = false; return; }
      }
      hoja.remove();
      empezar(h);
    });
  }

  // ── Grabación ──────────────────────────────────────
  function elegirMime() {
    const opciones = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/webm'];
    if (!window.MediaRecorder) return null;
    return opciones.find((m) => MediaRecorder.isTypeSupported?.(m)) || '';
  }

  async function empezar(h) {
    const mime = elegirMime();
    if (mime === null || !navigator.mediaDevices?.getUserMedia) return U.hoja(`<h2>Este navegador no puede grabar</h2><p class="sec" style="margin-top:8px">Probá con Chrome (Android o computadora) o Safari actualizado.</p><button class="btn ancho" data-cerrar style="margin-top:14px">Entendido</button>`);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    } catch (e) {
      return U.hoja(`<h2>No se pudo usar el micrófono</h2><p class="sec" style="margin-top:8px">Tocá el candado de la barra de direcciones y permití el micrófono para este sitio. Después probá de nuevo.</p><button class="btn ancho" data-cerrar style="margin-top:14px">Entendido</button>`);
    }
    let mr;
    try { mr = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: KBPS }); }
    catch { mr = new MediaRecorder(stream); }
    const ahora = Date.now();
    const trozos = [];
    rec = { mr, stream, trozos, mime: mr.mimeType || mime || 'audio/webm', inicio: ahora, fin: ahora + Math.min(h.minutos, MAX_MIN) * 60e3, acumulado: 0, desde: ahora, clase: h };
    // Se guarda en la lista local: el último pedazo llega DESPUÉS de terminar (rec ya es null).
    mr.ondataavailable = (e) => { if (e.data && e.data.size) trozos.push(e.data); };
    mr.start(10_000);
    // Nivel del micrófono, para que se vea que está escuchando.
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const an = ctx.createAnalyser(); an.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      rec.ctx = ctx;
      rec.nivel = () => { an.getByteTimeDomainData(buf); let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v - 128)); return Math.min(1, m / 64); };
    } catch {}
    try { rec.wake = await navigator.wakeLock?.request('screen'); } catch {}
    document.body.classList.add('cg-grabando');
    document.getElementById('cg-barra').classList.add('ver');
    rec.tic = setInterval(tic, 250);
    tic();
    repintar();
  }

  const segundosGrabados = () => !rec ? 0 : (rec.acumulado + (rec.mr.state === 'recording' ? Date.now() - rec.desde : 0)) / 1000;

  function tic() {
    if (!rec) return;
    const pausa = rec.mr.state === 'paused';
    const barra = document.getElementById('cg-barra');
    barra.classList.toggle('pausa', pausa);
    document.getElementById('cg-estado').textContent = pausa ? '⏸ En pausa (no se graba)' : `🔴 Grabando · ${reloj(segundosGrabados())}`;
    const quedan = Math.max(0, (rec.fin - Date.now()) / 1000);
    document.getElementById('cg-detalle').textContent = `${rec.clase.nombreMateria} · ${rec.clase.curso} · se corta sola a las ${hora(rec.fin)} (quedan ${reloj(quedan)})`;
    document.getElementById('cg-pausar').textContent = pausa ? '▶ Seguir' : '⏸ Pausa';
    document.getElementById('cg-nivel').style.width = (pausa || !rec.nivel ? 0 : Math.round(rec.nivel() * 100)) + '%';
    document.title = (pausa ? '⏸ ' : '🔴 ') + 'Grabando clase · ÑANDÉ';
    if (Date.now() >= rec.fin || segundosGrabados() >= MAX_MIN * 60) terminar('tiempo');
  }

  function pausar() {
    if (!rec) return;
    if (rec.mr.state === 'recording') { rec.mr.pause(); rec.acumulado += Date.now() - rec.desde; }
    else if (rec.mr.state === 'paused') { rec.mr.resume(); rec.desde = Date.now(); }
    tic();
  }

  async function terminar(motivo) {
    if (!rec) return;
    const r = rec;
    const segundos = segundosGrabados();
    rec = null;
    clearInterval(r.tic);
    const listo = new Promise((res) => { r.mr.onstop = res; });
    try { r.mr.state !== 'inactive' && r.mr.stop(); } catch {}
    await listo;
    r.stream.getTracks().forEach((t) => t.stop());   // apaga el micrófono
    try { r.ctx?.close(); } catch {}
    try { await r.wake?.release(); } catch {}
    document.body.classList.remove('cg-grabando');
    document.getElementById('cg-barra').classList.remove('ver');
    document.title = 'Tutor · Educación ÑANDÉ (maqueta)';
    const blob = new Blob(r.trozos, { type: r.mime });
    r.trozos = [];
    if (motivo === 'tiempo') U.toast('⏰ Terminó la hora: la grabación se cortó sola', 3500);
    if (segundos < 5 || blob.size < 2000) { U.toast('La grabación fue muy corta: no se manda'); repintar(); return; }
    pendiente = { blob, mime: r.mime, segundos, clase: r.clase };
    if (!enClase()) location.hash = 'clase'; else repintar();
    enviar();
  }

  const aBase64 = (blob) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result).split(',')[1] || '');
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(blob);
  });

  async function enviar() {
    if (!pendiente || enviando) return;
    if (!api()) { repintar(); return; }
    const p = pendiente;
    enviando = { clase: p.clase, desde: Date.now(), segundos: p.segundos };
    repintar();
    const r = await api().procesar({
      audio: await aBase64(p.blob),
      mime: p.mime,
      segundos: Math.round(p.segundos),
      curso: CURSO_SERVIDOR[p.clase.curso] || '4to_primaria',
      materia: p.clase.nombreMateria,
      tema: p.clase.tema,
      pensum: p.clase.pensum,
    });
    enviando = null;
    if (r.ok) {
      pendiente = null; // el audio se suelta: no queda en la página
      informes[r.clase.id] = { ...r.clase, costoPorHoraUsd: r.costoPorHoraUsd };
      listado = null;
      location.hash = 'clase/' + r.clase.id;
    } else {
      pendiente.error = r.error;
      repintar();
    }
  }

  function descartar() {
    pendiente = null;
    U.toast('🗑 Grabación descartada');
    repintar();
  }

  document.getElementById('cg-pausar').addEventListener('click', pausar);
  document.getElementById('cg-terminar').addEventListener('click', () => terminar('profe'));
  window.addEventListener('beforeunload', (e) => { if (rec || pendiente) { e.preventDefault(); e.returnValue = ''; } });

  // ── Informe (el mismo para el profe y la dirección) ─
  const ALERTA = { maltrato: 'Posible maltrato', gritos: 'Gritos', alguien_lastimado: 'Alguien lastimado', pide_ayuda: 'Un chico pide ayuda', otro: 'Otra señal' };
  const lis = (xs, vacio) => xs && xs.length ? `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="ter">${vacio}</p>`;

  function informeHtml(c, { quien = 'profe' } = {}) {
    const inf = c.informe || {};
    const p = inf.profe || {}, d = inf.direccion || {}, x = inf.contexto || {};
    const curso = CURSO_MAQUETA[c.curso] || c.curso;
    const volver = quien === 'direccion' ? '#clases' : '#clase';
    return `<a href="${volver}" class="chica">← Clases</a>
    <div class="encab" style="margin-top:12px"><div><h1>${esc(c.materia)} · ${esc(curso)}</h1>
      <p>${esc(c.tema)}${c.pensum ? ' · ' + esc(c.pensum) : ''}<br>${esc(c.fecha)} · ${Math.max(1, Math.round((c.segundos || 0) / 60))} min grabados${c.ejemplo ? ' · <b style="color:var(--ambar)">EJEMPLO con datos inventados</b>' : ''}</p></div></div>
    <div class="cg-mismo"><span>👁️</span><span><b>Este informe es el mismo para el profe y para la dirección.</b> Es una ayuda para planificar, no una evaluación. Los nombres de los alumnos se cambiaron por "un alumno". El audio no se guardó.</span></div>
    ${inf.huboClase === false ? `<div class="cg-alerta" style="margin-top:12px">La IA no encontró una clase en el audio (¿silencio o ruido?). Calidad del audio: ${esc(inf.calidadAudio)}.</div>` : ''}

    <div class="grilla cg-dos" style="margin-top:14px">
      <div class="tarjeta">
        <h3>👩‍🏫 Para el profe</h3>
        <p class="chica" style="margin-top:8px">${esc(p.resumen)}</p>
        <div class="cg-bloque"><h4>Lo que se vio</h4>${lis(p.vistos, 'Nada registrado')}</div>
        <div class="cg-bloque"><h4>Contra el pensum de hoy</h4><p class="chica">${esc(p.comparacionPensum) || '—'}</p></div>
        <div class="cg-bloque"><h4>Quedó pendiente</h4>${lis(p.pendiente, 'Nada: se llegó a todo 🎉')}</div>
        <div class="cg-bloque"><h4>💡 Ideas para la próxima</h4>${lis(p.sugerencias, '—')}</div>
        <div class="cg-bloque"><h4>📝 Tareas que se dieron</h4>${p.tareas && p.tareas.length ? `<ul>${p.tareas.map((t) => `<li>${esc(t.descripcion)}${t.para ? ` <span class="pildora gris">${esc(t.para)}</span>` : ''}</li>`).join('')}</ul>` : '<p class="ter">No se dieron tareas</p>'}</div>
      </div>
      <div class="pila">
        <div class="tarjeta">
          <h3>🏫 Para la dirección</h3>
          <p class="chica" style="margin-top:8px">${esc(d.resumen)}</p>
          <div class="cg-bloque"><h4>Señales para revisar</h4>
            ${d.alertas && d.alertas.length ? d.alertas.map((a) => `<div class="cg-alerta chica"><b>⚠️ ${esc(ALERTA[a.tipo] || 'Señal')}</b>${a.minuto ? ` · minuto ${esc(a.minuto)}` : ''}<br>${esc(a.queSeEscucho)}<div class="ter" style="margin-top:4px">Para revisar por una persona. No es una conclusión: la IA puede equivocarse.</div></div>`).join('')
              : '<p class="chica"><span class="pildora">Sin señales de riesgo</span></p>'}
          </div>
        </div>
        <div class="tarjeta">
          <h3>🦜 Lo que van a saber Taji y Jochi</h3>
          <p class="ter" style="margin-top:4px">Si un alumno pregunta "¿qué tarea dejó el profe?" o "no entendí lo de hoy", los profes IA responden con esto (sin nombres). Se borra a los 14 días.</p>
          <div class="cg-bloque"><h4>Temas</h4>${lis(x.temas, '—')}</div>
          <div class="cg-bloque"><h4>Cómo lo explicó</h4>${lis(x.explicaciones, '—')}</div>
          <div class="cg-bloque"><h4>Tareas</h4>${lis(x.tareas, 'Sin tareas')}</div>
          <div class="cg-bloque"><h4>Dudas de la clase</h4>${lis(x.dudas, '—')}</div>
        </div>
      </div>
    </div>
    <details class="tarjeta" style="margin-top:14px"><summary style="cursor:pointer"><b>Transcripción sin nombres</b> <span class="ter">${c.transcripcion ? `· se borra el ${fechaCorta(c.venceTranscripcion)}` : '· ya se borró (dura 7 días)'}</span></summary>
      ${c.transcripcion ? `<div class="cg-transcripcion">${esc(c.transcripcion)}</div>` : ''}</details>
    <div class="fila entre envuelve ter" style="margin-top:14px;gap:10px">
      <span>Se borra solo el ${fechaCorta(c.vence)} · costo de IA ${usd(c.costoUsd)}${c.costoPorHoraUsd ? ` (≈ ${usd(c.costoPorHoraUsd)} por hora de clase)` : ''} · ${esc(c.modelo || '')}</span>
      ${c.ejemplo ? '' : `<button class="btn chico sec2" onclick="Clase.borrar('${esc(c.curso)}','${esc(c.id)}')">🗑 Borrar ahora</button>`}
    </div>`;
  }

  // ── Vistas ─────────────────────────────────────────
  function tarjetaHoy() {
    const h = claseDeHoy();
    if (rec) return `<div class="tarjeta cg-hoy fila envuelve" style="gap:14px"><div class="crece"><b>🔴 Grabando ${esc(rec.clase.nombreMateria)} · ${esc(rec.clase.curso)}</b><div class="ter">Mirá la barra roja de abajo para pausar o terminar.</div></div></div>`;
    return `<div class="tarjeta cg-hoy fila envuelve" style="gap:14px">
      <div class="ico-caja" style="background:#10B98122">🎙️</div>
      <div class="crece"><b>Tu clase ahora: ${esc(h.nombreMateria)} · ${esc(h.curso)}</b><div class="ter">${esc(h.hora)} · ${esc(h.tema)} · ${esc(h.pensum)}</div>
        <div class="ter" style="margin-top:4px">Grabá la clase y la IA te arma el resumen contra el pensum.</div></div>
      <button class="btn" onclick="Clase.empezar('${h.id}')">▶ Empezar clase</button>
    </div>`;
  }

  function esperaHtml() {
    if (enviando) {
      const min = Math.max(1, Math.round(enviando.segundos / 60));
      return `<div class="tarjeta cg-espera"><div class="ruedita"></div><h2>La IA está escuchando la clase…</h2>
        <p class="sec" style="margin-top:8px">${esc(enviando.clase.nombreMateria)} · ${min} min de audio. Tarda entre 20 segundos y 2 minutos. No cierres esta página.</p></div>`;
    }
    if (pendiente) {
      return `<div class="tarjeta" style="border-color:var(--ambar)"><h3>La grabación no se pudo resumir</h3>
        <p class="chica sec" style="margin:6px 0 12px">${esc(pendiente.error || (api() ? '' : 'Sin conexión con el servidor.'))} El audio sigue solo en esta página (${reloj(pendiente.segundos)}); si la cerrás, se pierde.</p>
        <div class="fila envuelve"><button class="btn" onclick="Clase.reintentar()">↻ Reintentar</button><button class="btn sec2" onclick="Clase.descartar()">🗑 Descartar</button></div></div>`;
    }
    return '';
  }

  function listaInformes(quien) {
    const conectado = !!api();
    const base = quien === 'direccion' ? '#clases/' : '#clase/';
    let cuerpo;
    if (!conectado) cuerpo = `<p class="ter">Sin conexión con el servidor: mirá el ejemplo.</p>`;
    else if (!api().usuario()) cuerpo = `<p class="ter">Entrá con tu cuenta para ver los informes. <button class="btn chico sec2" onclick="Clase.login()">Entrar</button></p>`;
    else if (!listado) { cuerpo = `<p class="ter">Cargando…</p>`; cargar(); }
    else if (!listado.ok) cuerpo = `<p class="ter" style="color:var(--rojo)">${esc(listado.error)}</p>`;
    else if (!listado.clases.length) cuerpo = `<p class="ter">Todavía no hay clases grabadas (se borran solas a los 30 días).</p>`;
    else cuerpo = `<div class="pila">${listado.clases.map((c) => { informes[c.id] = c; const al = c.informe?.direccion?.alertas?.length || 0; return `
      <a class="tarjeta click fila" href="${base}${esc(c.id)}" style="color:inherit">
        <div class="ico-caja" style="background:#10B98122">🎙️</div>
        <div class="crece"><b>${esc(c.materia)} · ${esc(CURSO_MAQUETA[c.curso] || c.curso)}</b><div class="ter">${esc(c.fecha)} · ${Math.max(1, Math.round(c.segundos / 60))} min · ${esc(c.tema)}</div></div>
        ${al ? `<span class="pildora ambar">⚠️ ${al} para revisar</span>` : '<span class="pildora">listo</span>'}
      </a>`; }).join('')}</div>`;
    return `<div class="seccion"><div class="fila entre"><h3>Informes recientes</h3>
      <span class="fila" style="gap:8px">${conectado && api().usuario() ? `<span class="ter">cuenta: ${esc(api().usuario())}</span><button class="btn chico sec2" onclick="Clase.salir()">Salir</button>` : ''}<a class="btn chico sec2" href="${base}ejemplo">Ver un ejemplo</a></span></div>${cuerpo}</div>`;
  }

  async function cargar() {
    if (cargar.corriendo) return;
    cargar.corriendo = true;
    listado = await api().listar();
    cargar.corriendo = false;
    repintar();
  }

  function vistaProfe(param) {
    if (param === 'ejemplo') return informeHtml(EJEMPLO);
    if (param && informes[param]) return informeHtml(informes[param]);
    if (param && !listado && api()?.usuario()) { cargar(); return '<p class="ter">Cargando…</p>'; }
    const h = horario();
    return `<div class="encab"><div><h1>🎙️ Clase grabada</h1><p>Empezá la clase, se graba el audio y al terminar la IA te devuelve el resumen contra el pensum. El audio no se guarda.</p></div></div>
    ${esperaHtml()}
    <div class="seccion"><h3>Horario de hoy</h3><div class="pila">
      ${h.map((x) => `<div class="tarjeta fila envuelve">
        <div class="ico-caja" style="background:${(U.materia(x.materia) || {}).color || '#10B981'}22">${esc(x.icono)}</div>
        <div class="crece"><b>${esc(x.tema)}</b><div class="ter">${esc(x.hora)} · ${esc(x.nombreMateria)} · ${esc(U.curso(x.curso).nombre)} · ${x.minutos} min</div></div>
        <button class="btn chico" ${rec || enviando ? 'disabled' : ''} onclick="Clase.empezar('${x.id}')">▶ Empezar clase</button></div>`).join('')}
    </div></div>
    ${listaInformes('profe')}`;
  }

  function vistaDireccion(param) {
    if (param === 'ejemplo') return informeHtml(EJEMPLO, { quien: 'direccion' });
    if (param && informes[param]) return informeHtml(informes[param], { quien: 'direccion' });
    return `<div class="encab"><div><h1>🎙️ Clases grabadas</h1><p>Los mismos informes que ve cada profe. Las señales de riesgo son para que las revise una persona: la IA puede equivocarse.</p></div></div>
    ${listaInformes('direccion')}`;
  }

  function login() {
    if (!api()) return U.toast('Sin conexión con el servidor');
    const hoja = U.hoja(`<h2>Entrar</h2><p class="sec chica" style="margin:4px 0 12px">Cuenta de prueba (demo).</p>
      <input id="cg-u" placeholder="Usuario" autocomplete="username" autocapitalize="none" style="width:100%;min-height:48px;border-radius:12px;border:1px solid var(--borde);background:var(--sup2);color:#fff;padding:0 12px;font-size:16px;margin-bottom:8px">
      <input id="cg-c" type="password" placeholder="Clave" autocomplete="current-password" style="width:100%;min-height:48px;border-radius:12px;border:1px solid var(--borde);background:var(--sup2);color:#fff;padding:0 12px;font-size:16px">
      <p id="cg-err" class="chica" style="color:var(--rojo);min-height:18px;margin:6px 0"></p>
      <button class="btn ancho" id="cg-ir">Entrar</button>`);
    hoja.querySelector('#cg-ir').addEventListener('click', async () => {
      const r = await api().entrar(hoja.querySelector('#cg-u').value, hoja.querySelector('#cg-c').value);
      if (!r.ok) { hoja.querySelector('#cg-err').textContent = r.error; return; }
      hoja.remove(); listado = null; repintar();
    });
  }

  async function borrar(curso, id) {
    if (!confirm('¿Borrar este informe ahora? También se borra lo que sabían Taji y Jochi de esta clase.')) return;
    const r = await api()?.borrar(curso, id);
    if (r?.ok) { delete informes[id]; listado = null; U.toast('🗑 Informe borrado'); location.hash = location.hash.startsWith('#clases') ? 'clases' : 'clase'; }
    else U.toast(r?.error || 'No se pudo borrar');
  }

  // Ejemplo con datos inventados (para mostrar sin internet ni cuenta).
  const EJEMPLO = {
    id: 'ejemplo', ejemplo: true, curso: '4to_primaria', fecha: '2026-11-09', materia: 'Matemática', tema: 'Fracciones equivalentes', pensum: 'Unidad 5 · Tema 3',
    segundos: 2580, creado: Date.now(), vence: Date.now() + 30 * 864e5, venceTranscripcion: Date.now() + 7 * 864e5, costoUsd: 0.031, costoPorHoraUsd: 0.043, modelo: 'gemini-3.1-flash-lite',
    informe: {
      huboClase: true, calidadAudio: 'buena',
      profe: {
        resumen: 'Se trabajaron fracciones equivalentes con ejemplos de comida y un ejercicio en grupos. Los alumnos participaron mucho en la parte de la pizza.',
        vistos: ['Qué es una fracción equivalente', 'Un medio = dos cuartos = cuatro octavos, con la pizza', 'Ejercicio en grupos con tiras de papel'],
        comparacionPensum: 'Se cubrió lo central del Tema 3 de la Unidad 5. La simplificación de fracciones, que también figuraba para hoy, quedó para la próxima clase.',
        pendiente: ['Simplificar fracciones (dividir arriba y abajo por el mismo número)'],
        sugerencias: ['El ejemplo de la pizza enganchó mucho: se puede usar el mismo para arrancar la simplificación.', 'Dos alumnos terminaron rápido el ejercicio: podrían ayudar a explicar en la próxima clase.', 'Cerrar con una pregunta rápida de salida ayuda a ver quién lo entendió.'],
        tareas: [{ descripcion: 'Página 42 del cuaderno: ejercicios 1 al 5 de fracciones equivalentes', para: 'el jueves' }],
      },
      direccion: { resumen: 'Clase de Matemática de 4to A sobre fracciones equivalentes, con buena participación y trabajo en grupos. Se avanzó según el pensum, con un tema pendiente para la próxima.', alertas: [] },
      contexto: {
        temas: ['Fracciones equivalentes: fracciones distintas que valen lo mismo'],
        explicaciones: ['Una pizza cortada en 2 y otra en 4: medio pizza es lo mismo que dos cuartos', 'Con tiras de papel dobladas se ve que un medio tapa lo mismo que cuatro octavos'],
        tareas: ['Página 42 del cuaderno, ejercicios 1 al 5, para el jueves'],
        dudas: ['Por qué si los números son más grandes la fracción vale lo mismo'],
      },
    },
    transcripcion: 'Profe: Buenos días. Hoy vamos a ver fracciones equivalentes. ¿Quién se acuerda qué es un medio?\nAlumno: La mitad, profe.\nProfe: ¡Muy bien! Imaginen una pizza cortada en dos…\n(ejemplo inventado)',
  };

  window.Clase = {
    empezar: pedirEmpezar, terminar: () => terminar('profe'), pausar, reintentar: enviar, descartar, borrar, login,
    async salir() { await api()?.salir(); listado = null; repintar(); },
    tarjetaHoy, vistaProfe, vistaDireccion, informeHtml, EJEMPLO,
    grabando: () => !!rec,
    alRepintar: null,
  };
  window.addEventListener('nande-clase-listo', () => { listado = null; repintar(); });
})();
