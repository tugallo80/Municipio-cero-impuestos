// ══════════════════════════════════════════════════
//  Mapa del curso (EDU.04f) — pantalla del profe (sin build).
//
//  Plano del aula (4 columnas × 3 filas de mesas, el pizarrón adelante) con una tarjeta por
//  alumno. Tocar un alumno abre su ficha (cómo aprende, ritmo, fortalezas, qué está practicando,
//  avance, últimas misiones, lo que fue notando la mentora y, si hay, algo para acompañar).
//  La mentora propone una agrupación (parejas, niveles o atención de la semana) con el porqué;
//  el profe la usa o arma la suya: en PC arrastra, en celular "Mover a…". Guarda.
//  Alumnos FICTICIOS (curso-demo.js). A la IA solo van IDs opacos y rasgos (lo arma el servidor).
// ══════════════════════════════════════════════════
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const api = () => window.NandeClase || null;
  const conCuenta = () => !!api()?.usuario();
  const DEMO = window.CURSO_DEMO;
  const CURSO = DEMO.curso;
  const al = (id) => DEMO.alumnos.find((a) => a.id === id);
  const nombreCorto = (a) => a.nombre.split(' ')[0];
  const OBJ = {
    parejas: { ico: '🤝', txt: 'Parejas que se complementan' },
    niveles: { ico: '📊', txt: 'Grupos por nivel para un tema' },
    atencion: { ico: '💛', txt: 'A quién acompañar esta semana' },
  };
  const NIVEL = { logrado: '', 'en camino': 'ambar', inicio: 'gris' };
  const VAR = { apoyo: '🤝 apoyo', base: '✏️ base', desafio: '🚀 desafío' };

  let mapa = null;        // { grupos, atencion, resumen, objetivo, tema }
  let propuesta = null;
  let objetivo = 'parejas';
  let tema = 'Números racionales';
  let pidiendo = false;
  let guardado = true;
  let cargado = false;
  let error = '';

  function repintar() {
    if ((location.hash.slice(1) || '').split('/')[0] !== 'mapa') return;
    const y = window.scrollY;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    window.scrollTo(0, y);
  }
  const leerLocal = () => { try { return JSON.parse(localStorage.getItem('nande-mapa-' + CURSO) || 'null'); } catch { return null; } };
  const guardarLocal = (m) => { try { localStorage.setItem('nande-mapa-' + CURSO, JSON.stringify(m)); } catch {} };

  // Disposición inicial: 6 mesas de a dos, adelante.
  function inicial() {
    const ids = DEMO.alumnos.map((a) => a.id);
    const grupos = [];
    for (let i = 0; i < ids.length; i += 2) grupos.push({ nombre: `Mesa ${grupos.length + 1}`, alumnos: ids.slice(i, i + 2), columna: (grupos.length % 4) + 1, fila: Math.floor(grupos.length / 4) + 1, porque: '' });
    return { grupos, atencion: [], resumen: '', objetivo: null, tema: '' };
  }

  async function cargar() {
    if (cargar.en) return;
    cargar.en = true;
    await null;
    let m = null;
    if (conCuenta()) {
      const r = await api().mapa({ accion: 'curso', curso: CURSO });
      if (r.ok) m = r.guardado; else error = r.error;
    }
    mapa = m && m.grupos ? { ...m, grupos: m.grupos.map((g) => ({ ...g, alumnos: g.alumnos || [] })), atencion: m.atencion || [] } : leerLocal() || inicial();
    cargado = true; cargar.en = false;
    repintar();
  }

  // ── Propuesta de ejemplo (sin cuenta): la misma lógica que pediríamos a la IA, hecha acá ──
  function propuestaEjemplo(obj, temaTxt) {
    const xs = [...DEMO.alumnos].sort((a, b) => b.avance - a.avance);
    const lugar = (i) => ({ columna: (i % 4) + 1, fila: Math.floor(i / 4) + 1 });
    if (obj === 'niveles') {
      const g = [xs.slice(0, 4), xs.slice(4, 8), xs.slice(8)];
      const info = [['Equipo tajibo', 'desafio', `Ya dominan ${temaTxt}: un desafío extra y explicar cómo lo pensaron.`], ['Equipo cusi', 'base', `Van bien con ${temaTxt}: práctica guiada y comparar resultados entre ellos.`], ['Equipo motacú', 'apoyo', `Están practicando ${temaTxt}: material concreto y la profe cerca para acompañar.`]];
      return { resumen: `Tres grupos para ${temaTxt}, cada uno con la versión de la tarea que le sirve. El grupo de apoyo, adelante.`, grupos: g.map((alumnos, i) => ({ nombre: info[i][0], variante: info[i][1], porque: info[i][2], alumnos: alumnos.map((a) => a.id), ...[{ columna: 3, fila: 2 }, { columna: 2, fila: 2 }, { columna: 2, fila: 1 }][i] })), atencion: [], objetivo: obj, tema: temaTxt, ejemplo: true };
    }
    if (obj === 'atencion') {
      const cerca = DEMO.alumnos.filter((a) => a.atencion || a.tendencia === 'baja').slice(0, 4);
      const resto = DEMO.alumnos.filter((a) => !cerca.includes(a)).sort((a, b) => b.avance - a.avance);
      const grupos = [{ nombre: 'Mesa cerca del pizarrón', alumnos: cerca.map((a) => a.id), porque: 'Para acompañarlos de cerca esta semana, sin sacarlos del grupo.', columna: 2, fila: 1 }];
      for (let i = 0; i < 3; i++) grupos.push({ nombre: ['Mesa del mercado', 'Mesa del río', 'Mesa del huerto'][i], alumnos: [resto[i], resto[resto.length - 1 - i], resto[3 + i]].filter(Boolean).map((a) => a.id), porque: 'Grupo mezclado: quienes ya dominan el tema acompañan a quienes lo están practicando.', ...lugar(4 + i) });
      return { resumen: 'Esta semana conviene acompañar más de cerca a algunos chicos; el resto trabaja en grupos mezclados.', grupos, atencion: cerca.map((a) => ({ alumno: a.id, porque: a.atencion || 'Viene bajando: un poco más de acompañamiento le va a ayudar.' })), objetivo: obj, tema: temaTxt, ejemplo: true };
    }
    const grupos = [];
    for (let i = 0; i < xs.length / 2; i++) {
      const a = xs[i], b = xs[xs.length - 1 - i];
      grupos.push({ nombre: `Pareja ${i + 1}`, alumnos: [a.id, b.id], porque: `${nombreCorto(a)} se destaca en ${a.fortalezas[0]} y puede acompañar a ${nombreCorto(b)}, que está practicando ${b.practicando[0]}${b.fortalezas[0] ? `; ${nombreCorto(b)} aporta ${b.fortalezas[0]}` : ''}.`, ...lugar(i) });
    }
    return { resumen: `Parejas para ${temaTxt}: alguien que ya lo domina con alguien que lo está practicando, y los dos aportan algo.`, grupos, atencion: [], objetivo: obj, tema: temaTxt, ejemplo: true };
  }

  async function pedir() {
    pidiendo = true; error = ''; propuesta = null; repintar();
    if (!conCuenta()) { await new Promise((r) => setTimeout(r, 500)); propuesta = propuestaEjemplo(objetivo, tema); pidiendo = false; repintar(); return; }
    tardia = null;
    const pedido = `${objetivo}|${tema}`;
    const promesa = api().mapa({ accion: 'proponer', curso: CURSO, objetivo, tema, nueva: pedir.otra === true });
    pedir.otra = false;
    // EDU.15: en la demo, si la mentora tarda más de 3 s (o no hay presupuesto), propuesta de ejemplo
    // al instante; la de la mentora se ofrece con un botón cuando llega.
    const r = U.esDemo() ? await U.aTiempo(promesa, 2500) : await promesa;
    pidiendo = false;
    if (r?.ok) propuesta = { ...r.propuesta, costoUsd: r.costoUsd };
    else if (U.esDemo()) {
      propuesta = propuestaEjemplo(objetivo, tema);
      if (!r) promesa.then((x) => { if (x?.ok && `${objetivo}|${tema}` === pedido) { tardia = { ...x.propuesta, costoUsd: x.costoUsd }; repintar(); } });
    } else error = r.error;
    repintar();
  }
  let tardia = null;

  // ── Mover alumnos ─────────────────────────────────
  function mover(id, destino) {
    for (const g of mapa.grupos) g.alumnos = g.alumnos.filter((x) => x !== id);
    if (destino.startsWith('nueva')) {
      const [, c, f] = destino.split(':').map(Number);
      const libre = c ? { columna: c, fila: f } : lugarLibre();
      mapa.grupos.push({ nombre: `Mesa ${mapa.grupos.length + 1}`, alumnos: [id], porque: '', ...libre });
    } else {
      const g = mapa.grupos[Number(destino)];
      if (g) g.alumnos.push(id);
    }
    mapa.grupos = mapa.grupos.filter((g) => g.alumnos.length);
    guardado = false;
    repintar();
  }
  function lugarLibre() {
    for (let f = 1; f <= 3; f++) for (let c = 1; c <= 4; c++) if (!mapa.grupos.some((g) => g.columna === c && g.fila === f)) return { columna: c, fila: f };
    return { columna: 4, fila: 3 };
  }

  // ── Vistas ─────────────────────────────────────────
  const css = `
  .mp-plano{display:none}
  .mp-lista{display:block}
  @media (min-width:760px){.mp-plano{display:block}.mp-lista{display:none}}
  .mp-pizarron{background:#0b2a20;border:1px solid #10B98155;color:var(--verde);text-align:center;border-radius:10px;padding:6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px}
  .mp-grilla{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,minmax(150px,auto));gap:10px}
  .mp-mesa{background:var(--sup2);border:1px solid var(--borde);border-radius:14px;padding:10px;display:flex;flex-direction:column;gap:6px;min-height:150px}
  .mp-mesa.vacia{border-style:dashed;background:transparent;align-items:center;justify-content:center;color:var(--texto3);font-size:12px}
  .mp-mesa.sobre{border-color:var(--verde);background:var(--verde-suave)}
  .mp-mesa h4{font-size:13px;margin:0;display:flex;justify-content:space-between;gap:6px}
  .mp-chip{display:flex;align-items:center;gap:8px;background:var(--sup3);border:1px solid var(--borde);border-radius:10px;padding:6px 8px;cursor:grab;font-size:13px;user-select:none;text-align:left;width:100%}
  .mp-chip:active{cursor:grabbing}
  .mp-chip .av{font-size:20px}
  .mp-chip .mini{height:4px;border-radius:9px;background:var(--sup1);overflow:hidden;margin-top:3px}
  .mp-chip .mini i{display:block;height:100%;background:var(--verde)}
  .mp-chip.cuidado{border-color:#F59E0B88}
  .mp-porque{font-size:11px;color:var(--texto2);line-height:1.35}
  .mp-fila{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--borde)}
  .mp-fila:last-child{border-bottom:0}
  .mp-fila select{min-height:42px;border-radius:10px;border:1px solid var(--borde);background:var(--sup1);color:#fff;padding:0 8px;font-size:14px;max-width:46%}
  .mp-obj{display:flex;flex-wrap:wrap;gap:8px}
  .mp-obj button{flex:1 1 180px;min-height:46px;border-radius:12px;border:1px solid var(--borde);background:var(--sup3);font-weight:600;font-size:14px;padding:0 10px}
  .mp-obj button.activo{border-color:var(--verde);background:var(--verde-suave);color:var(--verde)}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function chip(id, cuidado) {
    const a = al(id);
    if (!a) return '';
    return `<button class="mp-chip ${cuidado ? 'cuidado' : ''}" draggable="true" data-alumno="${a.id}" onclick="Mapa.ficha('${a.id}')" ondragstart="Mapa.arrastrar(event,'${a.id}')">
      <span class="av">${a.avatar}</span><span class="crece"><b>${esc(nombreCorto(a))}</b><div class="mini"><i style="width:${a.avance}%"></i></div></span>${cuidado ? '<span title="Para acompañar">💛</span>' : ''}</button>`;
  }

  function vista() {
    if (!cargado) { cargar(); return '<p class="ter">Cargando…</p>'; }
    const cuidar = new Set([...(mapa.atencion || []).map((x) => x.alumno), ...DEMO.alumnos.filter((a) => a.atencion).map((a) => a.id)]);
    const celdas = [];
    for (let f = 1; f <= 3; f++) for (let c = 1; c <= 4; c++) {
      const i = mapa.grupos.findIndex((g) => g.columna === c && g.fila === f);
      const g = mapa.grupos[i];
      celdas.push(g
        ? `<div class="mp-mesa" ondragover="Mapa.sobre(event,this)" ondragleave="this.classList.remove('sobre')" ondrop="Mapa.soltar(event,'${i}')">
            <h4><span>${esc(g.nombre)}</span>${g.variante ? `<span class="pildora gris">${VAR[g.variante]}</span>` : ''}</h4>
            ${g.alumnos.map((id) => chip(id, cuidar.has(id))).join('')}
            ${g.porque ? `<div class="mp-porque">${esc(g.porque)}</div>` : ''}</div>`
        : `<div class="mp-mesa vacia" ondragover="Mapa.sobre(event,this)" ondragleave="this.classList.remove('sobre')" ondrop="Mapa.soltar(event,'nueva:${c}:${f}')">mesa libre</div>`);
    }
    const opciones = (actual) => mapa.grupos.map((g, i) => `<option value="${i}" ${i === actual ? 'selected' : ''}>${esc(g.nombre)}</option>`).join('') + '<option value="nueva">+ Mesa nueva</option>';
    const lista = mapa.grupos.map((g, i) => `<div class="tarjeta" style="margin-bottom:10px">
        <div class="fila entre"><b>${esc(g.nombre)}</b>${g.variante ? `<span class="pildora gris">${VAR[g.variante]}</span>` : ''}</div>
        ${g.porque ? `<p class="ter" style="margin-top:4px">${esc(g.porque)}</p>` : ''}
        ${g.alumnos.map((id) => { const a = al(id); return a ? `<div class="mp-fila">
          <button class="crece fila" style="gap:10px;text-align:left" onclick="Mapa.ficha('${id}')"><span style="font-size:24px">${a.avatar}</span><span class="crece"><b>${esc(a.nombre)}</b>${cuidar.has(id) ? ' 💛' : ''}<div class="ter">avance ${a.avance}% · ${esc(a.aprende)}</div></span></button>
          <select aria-label="Mover a ${esc(nombreCorto(a))}" onchange="Mapa.mover('${id}', this.value)">${opciones(i)}</select></div>` : ''; }).join('')}
      </div>`).join('');

    return `<div class="encab"><div><h1>🗺️ Mapa del curso</h1><p>${esc(DEMO.maqueta)} · ${DEMO.alumnos.length} alumnos (ficticios). Tocá un alumno para ver su ficha. La mentora propone cómo sentarlos; vos decidís.</p></div>
      <div class="fila" style="gap:8px">${conCuenta() ? '<span class="pildora">☁️ en tu cuenta</span>' : `<span class="pildora gris">💾 solo en este equipo</span>${api() ? ' <button class="btn chico sec2" onclick="Clase.login()">Entrar</button>' : ''}`}</div></div>

    <div class="tarjeta pila">
      <b>✨ Pedile una propuesta a la mentora</b>
      <div class="mp-obj">${Object.entries(OBJ).map(([k, o]) => `<button class="${k === objetivo ? 'activo' : ''}" onclick="Mapa.objetivo('${k}')">${o.ico} ${o.txt}</button>`).join('')}</div>
      <label class="campo" style="margin:0"><span>Tema a trabajar</span><input value="${esc(tema)}" oninput="Mapa.tema(this.value)" placeholder="Ej. Números racionales"></label>
      <button class="btn ancho" ${pidiendo ? 'disabled' : ''} onclick="Mapa.pedir()">${pidiendo ? 'La mentora está pensando…' : '✨ Pedir propuesta'}</button>
      <p class="ter">A la mentora le llegan solo códigos (S01, S02…) y cómo viene cada uno, nunca los nombres.</p>
    </div>
    ${error ? `<div class="tarjeta" style="border-color:var(--rojo);margin-top:12px">${esc(error)}</div>` : ''}
    ${tardia ? `<div class="tarjeta fila-accion" style="margin-top:12px;border-color:var(--verde)"><div class="crece">✨ <b>La mentora terminó su propuesta</b><div class="ter">La de abajo es un ejemplo listo.</div></div><button class="btn" onclick="Mapa.verTardia()">Ver la de la mentora</button></div>` : ''}
    ${propuesta ? `<div class="tarjeta pila" style="margin-top:12px;border-color:var(--verde)">
      <div class="fila entre envuelve"><b>${OBJ[propuesta.objetivo]?.ico || '✨'} Propuesta de la mentora</b>${propuesta.ejemplo ? '<span class="pildora ambar">ejemplo</span>' : ''}</div>
      <p class="chica">${esc(propuesta.resumen)}</p>
      ${propuesta.atencion?.length ? `<div class="chica"><b>💛 Para acompañar esta semana</b>${propuesta.atencion.map((x) => `<div class="ter" style="margin-top:4px">${esc(al(x.alumno)?.nombre || x.alumno)}: ${esc(x.porque)}</div>`).join('')}</div>` : ''}
      <div class="pila">${propuesta.grupos.map((g) => `<div style="padding:10px;border-radius:12px;background:var(--sup3)"><b class="chica">${esc(g.nombre)}</b>${g.variante ? ` <span class="pildora gris">${VAR[g.variante]}</span>` : ''}
        <div class="chica" style="margin:4px 0">${g.alumnos.map((id) => `${al(id)?.avatar || ''} ${esc(al(id) ? nombreCorto(al(id)) : id)}`).join(' · ')}</div><div class="ter">${esc(g.porque)}</div></div>`).join('')}</div>
      <div class="fila-accion"><div class="crece ter">${propuesta.costoUsd ? `Costo de IA: USD ${propuesta.costoUsd}` : 'Es una propuesta: la podés cambiar después.'}</div>
        <div class="acciones"><button class="btn sec2" onclick="Mapa.descartar()">Descartar</button><button class="btn" onclick="Mapa.usar()">Usar esta propuesta</button></div></div>
    </div>` : ''}

    <div class="seccion">
      <div class="fila entre envuelve" style="margin-bottom:10px"><h3 style="margin:0">El aula</h3>
        <span class="fila" style="gap:8px"><button class="btn chico sec2" onclick="Mapa.reiniciar()">↺ Empezar de nuevo</button><button class="btn chico" ${guardado ? 'disabled' : ''} onclick="Mapa.guardar()">${guardado ? '✓ Guardado' : '💾 Guardar'}</button></span></div>
      <div class="mp-plano"><div class="mp-pizarron">pizarrón</div><div class="mp-grilla">${celdas.join('')}</div>
        <p class="ter" style="margin-top:8px">Arrastrá a un alumno a otra mesa (o a una mesa libre). 💛 = para acompañar de cerca.</p></div>
      <div class="mp-lista">${lista}<p class="ter">Usá "Mover a…" para cambiar de mesa. 💛 = para acompañar de cerca.</p></div>
    </div>`;
  }

  function ficha(id) {
    const a = al(id);
    if (!a) return;
    const tend = { sube: '▲ viene subiendo', estable: '● estable', baja: '▼ viene bajando: acompañar' }[a.tendencia] || '';
    const variante = a.avance < 65 ? 'apoyo' : a.avance >= 85 ? 'desafio' : 'base';
    U.hoja(`<div class="fila" style="gap:12px"><span style="font-size:40px">${a.avatar}</span><div class="crece"><h2>${esc(a.nombre)}</h2><p class="ter">${esc(DEMO.maqueta)} · ${tend} · ${a.misiones} misiones</p></div></div>
      <div style="margin:12px 0"><div class="fila entre chica"><span>Avance</span><b>${a.avance}%</b></div>${U.barra(a.avance)}</div>
      ${a.atencion ? `<div style="border:1px solid var(--ambar);background:rgba(245,158,11,.08);border-radius:12px;padding:10px 12px;margin-bottom:10px" class="chica">💛 <b>Para acompañar:</b> ${esc(a.atencion)}</div>` : ''}
      <div class="lista chica">
        <div><span class="ter">Cómo aprende mejor</span><br>${esc(a.aprende)} · ritmo ${esc(a.ritmo)}</div>
        <div><span class="ter">Fortalezas</span><br>${a.fortalezas.map(esc).join(' · ')}</div>
        <div><span class="ter">Lo que está practicando</span><br>${a.practicando.map(esc).join(' · ')}</div>
        <div><span class="ter">Cómo va en cada tema</span><div class="chips" style="margin-top:6px">${Object.entries(a.temas).map(([t, n]) => `<span class="pildora ${NIVEL[n] ?? 'gris'}">${esc(t)} · ${esc(n)}</span>`).join('')}</div></div>
        <div><span class="ter">Últimas misiones</span><br>${a.ultimas.map(esc).join('<br>')}</div>
        <div><span class="ter">Lo que fue notando la mentora</span><br>${esc(a.mentora)}</div>
        <div><span class="ter">Le interesa</span><br>${a.intereses.map(esc).join(' · ')}</div>
        <div><span class="ter">En las tareas recibe la versión</span><br>${VAR[variante]}</div>
      </div>
      <p class="ter" style="margin-top:10px">Datos ficticios de demostración. El perfil sirve para acompañar, no para poner etiquetas.</p>
      <button class="btn ancho" data-cerrar style="margin-top:12px">Cerrar</button>`);
  }

  window.Mapa = {
    vista,
    ficha,
    pedir,
    verTardia() { if (tardia) { propuesta = tardia; tardia = null; repintar(); } },
    objetivo(k) { objetivo = k; repintar(); },
    tema(v) { tema = v; },
    usar() { mapa = { grupos: propuesta.grupos.map((g) => ({ ...g, alumnos: [...g.alumnos] })), atencion: propuesta.atencion || [], resumen: propuesta.resumen, objetivo: propuesta.objetivo, tema: propuesta.tema }; propuesta = null; guardado = false; U.toast('Propuesta aplicada: podés moverla y guardar'); repintar(); },
    descartar() { propuesta = null; repintar(); },
    reiniciar() { if (!confirm('¿Volver a la disposición inicial?')) return; mapa = inicial(); guardado = false; repintar(); },
    mover(id, destino) { mover(id, destino); },
    arrastrar(e, id) { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; },
    sobre(e, el) { e.preventDefault(); el.classList.add('sobre'); },
    soltar(e, destino) { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) mover(id, destino); },
    async guardar() {
      guardarLocal(mapa);
      if (conCuenta()) {
        const r = await api().mapa({ accion: 'guardar', curso: CURSO, mapa });
        if (!r.ok) return U.toast(r.error, 4000);
      }
      guardado = true; U.toast('💾 Mapa guardado'); repintar();
    },
  };
  window.addEventListener('nande-cuenta', () => { cargado = false; repintar(); });
})();
