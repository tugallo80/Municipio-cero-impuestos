// ══════════════════════════════════════════════════
//  Tareas sugeridas por la mentora (EDU.04f) — pantalla del profe (sin build).
//
//  Desde una clase grabada (#tareas/clase/<id>) o un tema del cronograma (#tareas/tema/<id>),
//  la mentora propone 2–3 tareas con consigna, tipo, fecha, criterios Ser/Saber/Hacer/Autoev.
//  y variantes por nivel. El profe edita y toca "Enviar a mis alumnos": la tarea llega al
//  modo directo del alumno (EDU.06d) por la Function eduTareas ('mias').
//  Sin cuenta: ejemplo inventado, y lo "enviado" queda solo en este equipo.
// ══════════════════════════════════════════════════
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const api = () => window.NandeClase || null;
  const conCuenta = () => !!api()?.usuario();
  const TIPOS = { practica: '✏️ Práctica', lectura: '📖 Lectura', investigacion: '🔎 Investigación', proyecto: '🛠️ Proyecto', mision: '🎯 Misión' };
  const MATERIAS = { mat: '🔢 Matemática', len: '📖 Lenguaje', cnat: '🌱 Ciencias Naturales', csoc: '🌎 Ciencias Sociales', art: '🎨 Artes', mus: '🎵 Música', efd: '⚽ Ed. Física', val: '🕊️ Valores', tec: '🛠️ Técnica', ing: '💬 Inglés', ori: '🗣️ Lengua originaria', fil: '🧠 Filosofía', bio: '🧬 Biología', fis: '🧲 Física', qui: '⚗️ Química' };
  const CURSOS = { '2do_secundaria': '2.º de secundaria', '4to_primaria': '4.º de primaria', '5to_primaria': '5.º de primaria' };
  const hoy = () => new Date(Date.now() - 4 * 3600e3).toISOString().slice(0, 10);
  const fechaCorta = (f) => new Date(f + 'T12:00:00Z').toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  const sumarDias = (f, n) => { const d = new Date(f + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

  let ctx = null;          // { origen, curso, materia, tema, vistos, pendiente, tareasDichas, contenidos, claseId, temaId }
  let sugeridas = null;    // tareas editables
  let pidiendo = false;
  let enviadas = null;     // lista del servidor (o local)
  let error = '';

  function repintar() {
    if ((location.hash.slice(1) || '').split('/')[0] !== 'tareas') return;
    const y = window.scrollY;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    window.scrollTo(0, y);
  }
  const leerLocal = () => { try { return JSON.parse(localStorage.getItem('nande-tareas-demo') || '[]'); } catch { return []; } };
  const guardarLocal = (xs) => { try { localStorage.setItem('nande-tareas-demo', JSON.stringify(xs)); } catch {} };

  // ── Contexto: de dónde salen las sugerencias ──────
  function contextoDe(tipo, id) {
    if (tipo === 'clase') {
      const c = window.Clase?.obtener?.(id);
      if (!c) return null;
      const inf = c.informe || {};
      const area = Object.entries(MATERIAS).find(([, n]) => n.toLowerCase().includes(String(c.materia || '').toLowerCase().split(' ')[0]))?.[0] || null;
      return { origen: 'clase', claseId: c.ejemplo ? null : c.id, curso: c.curso, materia: area, tema: c.tema || c.materia, vistos: inf.profe?.vistos || [], pendiente: inf.profe?.pendiente || [], tareasDichas: (inf.profe?.tareas || []).map((t) => t.descripcion), contenidos: [], titulo: `Clase de ${c.materia} · ${c.fecha}` };
    }
    if (tipo === 'tema') {
      const t = window.Cronograma?.buscarTema?.(id);
      if (!t) return null;
      return { origen: 'cronograma', curso: window.Cronograma.cursoServidor(), materia: t.area, tema: t.titulo, vistos: [], pendiente: [], tareasDichas: [], contenidos: t.contenidos || [], titulo: `Tema del cronograma: ${t.titulo}`, temaId: id };
    }
    return null;
  }

  // Ejemplo inventado (sin cuenta / sin internet)
  function ejemplo(c) {
    const e = sumarDias(hoy(), 3);
    const base = (titulo, tipo, consigna, apoyo, desafio) => ({
      curso: c.curso, materia: c.materia || 'mat', titulo, tipo, consigna, entrega: e, ejemplo: true,
      criterios: { ser: 'Trabaja con cuidado y comparte lo que hizo.', saber: 'Explica con sus palabras qué representa una fracción.', hacer: 'Representa fracciones con objetos de la casa.', autoevaluacion: 'Marca con el semáforo cómo le fue.' },
      puntos: { ser: 10, saber: 45, hacer: 40, autoevaluacion: 5 }, autoevaluacion: '¿Pudiste explicarle a alguien de tu casa lo que hiciste? 🟢 🟡 🔴',
      variantes: { apoyo, base: consigna, desafio }, origen: { tipo: c.origen, tema: c.tema },
    });
    return [
      base('Fracciones en la cocina', 'practica', 'Con ayuda de alguien de tu casa, partí una naranja o un pan en partes iguales. Dibujá cómo quedó y escribí la fracción de cada parte.', 'Partí una naranja en 2 y después en 4. Dibujá las partes y escribí "un medio" y "un cuarto". Mirá el ejemplo del cuaderno.', 'Partí algo en 8 partes, comé (¡o guardá!) 3 y escribí qué fracción queda. ¿Es más o menos que un medio?'),
      base('Cazadores de fracciones', 'investigacion', 'Buscá en tu casa o en el barrio 3 cosas partidas en partes iguales (una ventana, una tableta de chocolate, una baldosa). Dibujalas y escribí su fracción.', 'Buscá 2 cosas partidas en partes iguales y contá cuántas partes tienen.', 'Buscá 3 cosas y ordenalas de la fracción más chica a la más grande. Explicá cómo te diste cuenta.'),
    ];
  }

  async function pedir() {
    if (!ctx) return;
    pidiendo = true; error = ''; sugeridas = null; repintar();
    if (!conCuenta()) { await new Promise((r) => setTimeout(r, 500)); sugeridas = ejemplo(ctx); pidiendo = false; repintar(); return; }
    const r = await api().tareas({ accion: 'sugerir', curso: ctx.curso, materia: ctx.materia, tema: ctx.tema, origen: ctx.origen, claseId: ctx.claseId, vistos: ctx.vistos, pendiente: ctx.pendiente, tareasDichas: ctx.tareasDichas, contenidos: ctx.contenidos, hoy: hoy() });
    pidiendo = false;
    if (r.ok) sugeridas = r.tareas.map((t) => ({ ...t, costoUsd: r.costoUsd })); else error = r.error;
    repintar();
  }

  async function cargarEnviadas(curso) {
    if (cargarEnviadas.en) return;
    cargarEnviadas.en = true;
    if (conCuenta()) {
      const r = await api().tareas({ accion: 'listar', curso });
      enviadas = r.ok ? r.tareas : [];
      if (!r.ok) error = r.error;
    } else enviadas = leerLocal().filter((t) => t.curso === curso);
    cargarEnviadas.en = false;
    repintar();
  }

  // ── Vistas ─────────────────────────────────────────
  function tarjetaEditable(t, i) {
    const campo = (k, v, extra = '') => `oninput="Tareas.editar(${i}, '${k}', this.value)" ${extra}`;
    return `<div class="tarjeta pila" style="border-color:var(--verde)">
      <div class="fila entre envuelve"><span class="pildora">${esc(MATERIAS[t.materia] || t.materia)}</span>${t.ejemplo ? '<span class="pildora ambar">ejemplo</span>' : ''}</div>
      <label class="campo"><span>Título</span><input value="${esc(t.titulo)}" ${campo('titulo')}></label>
      <label class="campo"><span>Consigna para los alumnos</span><textarea rows="4" ${campo('consigna')}>${esc(t.consigna)}</textarea></label>
      <div class="grilla g2" style="gap:0 12px">
        <label class="campo"><span>Tipo</span><select ${campo('tipo')} onchange="Tareas.editar(${i}, 'tipo', this.value)">${Object.entries(TIPOS).map(([k, n]) => `<option value="${k}" ${k === t.tipo ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="campo"><span>Entrega</span><input type="date" value="${esc(t.entrega)}" ${campo('entrega')}></label>
      </div>
      <details><summary class="chica" style="cursor:pointer"><b>Variantes por nivel</b> <span class="ter">· apoyo, base y desafío</span></summary>
        ${['apoyo', 'base', 'desafio'].map((v) => `<label class="campo" style="margin-top:8px"><span>${{ apoyo: '🤝 Con apoyo', base: '✏️ Base', desafio: '🚀 Desafío' }[v]}</span><textarea rows="3" oninput="Tareas.editarVariante(${i}, '${v}', this.value)">${esc(t.variantes?.[v])}</textarea></label>`).join('')}
        <p class="ter">Cada alumno recibe la que le corresponde según cómo viene (se ve y se cambia en el 🗺️ Mapa del curso).</p></details>
      <details><summary class="chica" style="cursor:pointer"><b>Cómo se evalúa</b> <span class="ter">· Ser 10 · Saber 45 · Hacer 40 · Autoev. 5</span></summary>
        ${[['ser', 'Ser (10)'], ['saber', 'Saber (45)'], ['hacer', 'Hacer (40)'], ['autoevaluacion', 'Autoevaluación (5)']].map(([k, n]) => `<label class="campo" style="margin-top:8px"><span>${n}</span><input value="${esc(t.criterios?.[k])}" oninput="Tareas.editarCriterio(${i}, '${k}', this.value)"></label>`).join('')}
        <label class="campo"><span>Pregunta de autoevaluación para el alumno</span><input value="${esc(t.autoevaluacion)}" ${campo('autoevaluacion')}></label></details>
      <div class="fila-accion"><div class="crece ter">${t.enviada ? '✅ Enviada' : 'La ven tus alumnos en su modo directo, con la versión de su nivel.'}</div>
        <div class="acciones"><button class="btn sec2" onclick="Tareas.descartar(${i})">Descartar</button><button class="btn" ${t.enviada || t.enviando ? 'disabled' : ''} onclick="Tareas.enviar(${i})">${t.enviando ? 'Enviando…' : t.enviada ? '✅ Enviada' : '📤 Enviar a mis alumnos'}</button></div></div>
    </div>`;
  }

  function vista(tipo, id) {
    const n = (tipo === 'clase' || tipo === 'tema') ? contextoDe(tipo, id) : null;
    if (n && (!ctx || ctx.claseId !== n.claseId || ctx.temaId !== n.temaId || ctx.tema !== n.tema)) { if (ctx?.curso !== n.curso) enviadas = null; ctx = n; sugeridas = null; error = ''; setTimeout(pedir, 0); }
    const curso = ctx?.curso || (window.Cronograma?.cursoServidor?.() || '4to_primaria');
    if (!enviadas) setTimeout(() => cargarEnviadas(curso), 0);
    const cab = `<div class="encab"><div><h1>📝 Tareas</h1><p>La mentora propone tareas con lo que pasó en tu clase o con el tema del cronograma. Vos las editás y decidís cuáles mandar.</p></div></div>`;
    const sinCuenta = !conCuenta() ? `<div class="cr-aviso ambar" style="margin-bottom:12px;padding:10px 12px;border-radius:12px;border:1px solid var(--ambar);font-size:13px">Sin cuenta: se muestran tareas de ejemplo y lo enviado queda solo en este equipo.${api() ? ' <button class="btn chico sec2" onclick="Clase.login()">Entrar</button>' : ''}</div>` : '';
    let cuerpo = '';
    if (n === null && (tipo === 'clase' || tipo === 'tema')) cuerpo = `<div class="tarjeta"><p class="sec">No encontré esa ${tipo === 'clase' ? 'clase' : 'tema'}. Volvé a abrirla desde ${tipo === 'clase' ? 'Clase grabada' : 'el Cronograma'}.</p></div>`;
    else if (ctx) {
      cuerpo = `<div class="tarjeta fila-accion" style="margin-bottom:12px"><div class="crece"><b>${esc(ctx.titulo)}</b><div class="ter">${esc(CURSOS[ctx.curso] || ctx.curso)}${ctx.pendiente?.length ? ` · quedó pendiente: ${esc(ctx.pendiente.join('; '))}` : ''}</div></div>
        <button class="btn sec2" ${pidiendo ? 'disabled' : ''} onclick="Tareas.pedir()">↻ Otras ideas</button></div>
        ${pidiendo ? `<div class="tarjeta" style="text-align:center;padding:30px"><div style="width:46px;height:46px;border-radius:50%;border:5px solid var(--sup3);border-top-color:var(--verde);margin:0 auto 14px;animation:cg-gira 1s linear infinite"></div><b>La mentora está pensando tareas…</b><p class="ter">Unos segundos.</p></div>` : ''}
        ${error ? `<div class="tarjeta" style="border-color:var(--rojo)"><p>${esc(error)}</p></div>` : ''}
        ${sugeridas ? `<div class="pila">${sugeridas.map(tarjetaEditable).join('')}</div>${sugeridas[0]?.costoUsd ? `<p class="ter" style="margin-top:8px">Costo de IA de estas ideas: USD ${sugeridas[0].costoUsd}</p>` : ''}` : ''}`;
    } else {
      cuerpo = `<div class="tarjeta pila"><b>¿De dónde saco las ideas?</b>
        <div class="fila-accion"><div class="crece chica">De una <b>clase grabada</b>: lo que se vio y lo que quedó pendiente.</div><a class="btn sec2" href="#clase">🎙️ Ir a Clase grabada</a></div>
        <div class="fila-accion"><div class="crece chica">De un <b>tema del cronograma</b>.</div><a class="btn sec2" href="#cronograma/plan">🗓️ Ir a los temas</a></div>
        <div class="fila-accion"><div class="crece chica">Probar con la <b>clase de ejemplo</b>.</div><a class="btn" href="#tareas/clase/ejemplo">✨ Ver ideas de ejemplo</a></div></div>`;
    }
    const lista = enviadas === null ? '<p class="ter">Cargando…</p>' : !enviadas.length ? '<p class="ter">Todavía no mandaste tareas a este curso.</p>' : `<div class="pila">${enviadas.map((t) => `
      <div class="tarjeta fila-accion"><div class="crece"><b>${esc(t.titulo)}</b><div class="ter">${esc(MATERIAS[t.materia] || t.materia)} · entrega ${fechaCorta(t.entrega)} · ${esc(TIPOS[t.tipo] || t.tipo)}${t.hechas ? ` · ✅ ${t.hechas} la marcaron hecha` : ''}${t.local ? ' · solo en este equipo' : ''}</div></div>
        <button class="btn chico sec2" onclick="Tareas.borrar('${esc(t.id)}')">🗑 Quitar</button></div>`).join('')}</div>`;
    return `${cab}${sinCuenta}${cuerpo}<div class="seccion"><h3>Enviadas a ${esc(CURSOS[curso] || curso)}</h3>${lista}</div>`;
  }

  window.Tareas = {
    vista,
    pedir,
    editar(i, k, v) { if (sugeridas?.[i]) sugeridas[i][k] = v; },
    editarVariante(i, k, v) { if (sugeridas?.[i]) (sugeridas[i].variantes ||= {})[k] = v; },
    editarCriterio(i, k, v) { if (sugeridas?.[i]) (sugeridas[i].criterios ||= {})[k] = v; },
    descartar(i) { sugeridas.splice(i, 1); repintar(); },
    async enviar(i) {
      const t = sugeridas[i];
      if (!t.consigna?.trim()) return U.toast('Falta la consigna');
      t.enviando = true; repintar();
      if (!conCuenta()) {
        const xs = leerLocal(); xs.unshift({ ...t, id: 'local-' + Date.now(), local: true, curso: ctx.curso }); guardarLocal(xs);
        t.enviando = false; t.enviada = true; enviadas = null; U.toast('✅ Guardada en este equipo (demo)'); repintar(); return;
      }
      const { costoUsd, ejemplo: _e, enviada: _x, enviando: _y, ...tarea } = t;
      const r = await api().tareas({ accion: 'enviar', curso: ctx.curso, tarea });
      t.enviando = false;
      if (r.ok) { t.enviada = true; enviadas = null; U.toast('📤 Enviada: tus alumnos la ven en su modo directo', 3200); } else U.toast(r.error, 4000);
      repintar();
    },
    async borrar(id) {
      if (!confirm('¿Quitar esta tarea? Los alumnos dejan de verla.')) return;
      if (id.startsWith('local-')) guardarLocal(leerLocal().filter((t) => t.id !== id));
      else { const r = await api()?.tareas({ accion: 'borrar', curso: ctx?.curso || window.Cronograma?.cursoServidor?.() || '4to_primaria', id }); if (r && !r.ok) return U.toast(r.error); }
      enviadas = null; repintar();
    },
  };
  window.addEventListener('nande-cuenta', () => { enviadas = null; repintar(); });
})();
