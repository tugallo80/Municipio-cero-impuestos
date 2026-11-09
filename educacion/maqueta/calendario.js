// ══════════════════════════════════════════════════
//  Calendario escolar por capas + reparto del plan del profe (EDU.04b).
//  Sin IA y sin red: todo se calcula acá, en el navegador (y en las pruebas con Node).
//
//  Capas (cada una agrega o quita días sin clase, o resta horas):
//    nacional (RM + decreto de feriados) → departamento → distrito → escuela → profe
//  Los días hábiles se CALCULAN (lunes a viernes − feriados − descansos − días propios):
//  no se copian de la resolución (ver docs/investigacion/planificacion-y-calendario-bolivia.md).
//
//  Para actualizar un año: editar CAPAS abajo (es solo datos). 2027 es PROVISIONAL hasta
//  que salgan la RM y el decreto de feriados (enero 2027).
// ══════════════════════════════════════════════════
(function (raiz) {
  const CAPAS = {
    nacional: {
      2026: {
        nombre: 'Nacional 2026 (RM 0001/2026 y DS 5521)',
        inicio: '2026-02-02',
        fin: '2026-12-02',
        trimestres: [['2026-02-02', '2026-05-08'], ['2026-05-11', '2026-08-31'], ['2026-09-01', '2026-12-02']],
        sinClase: [
          { fecha: '2026-02-16', motivo: 'Carnaval' }, { fecha: '2026-02-17', motivo: 'Carnaval' },
          { fecha: '2026-04-03', motivo: 'Viernes Santo' }, { fecha: '2026-05-01', motivo: 'Día del Trabajo' },
          { fecha: '2026-06-04', motivo: 'Corpus Christi' }, { fecha: '2026-06-05', motivo: 'Corpus Christi (día adicional)' },
          { fecha: '2026-06-22', motivo: 'Año Nuevo Andino Amazónico' },
          { fecha: '2026-08-06', motivo: 'Independencia' }, { fecha: '2026-08-07', motivo: 'Independencia (día adicional)' },
          { fecha: '2026-11-02', motivo: 'Todos Santos' },
        ],
        menosHoras: [
          { fecha: '2026-03-23', motivo: 'Día del Mar (acto cívico)' }, { fecha: '2026-04-13', motivo: 'Día del Niño (actividad)' },
          { fecha: '2026-06-08', motivo: 'Día del Maestro (acto)' }, { fecha: '2026-09-21', motivo: 'Día del Estudiante' },
          { fecha: '2026-10-12', motivo: 'Día de la Descolonización (acto cívico)' },
        ],
      },
      2027: {
        provisional: true,
        nombre: 'Nacional 2027 (PROVISIONAL: todavía no hay RM ni decreto de feriados)',
        inicio: '2027-02-01',
        fin: '2027-12-03',
        trimestres: [['2027-02-01', '2027-05-07'], ['2027-05-10', '2027-08-31'], ['2027-09-01', '2027-12-03']],
        sinClase: [
          { fecha: '2027-02-08', motivo: 'Carnaval' }, { fecha: '2027-02-09', motivo: 'Carnaval' },
          { fecha: '2027-03-26', motivo: 'Viernes Santo' }, { fecha: '2027-05-27', motivo: 'Corpus Christi' },
          { fecha: '2027-06-21', motivo: 'Año Nuevo Andino Amazónico' }, { fecha: '2027-08-06', motivo: 'Independencia' },
          { fecha: '2027-11-02', motivo: 'Todos Santos' },
        ],
        menosHoras: [
          { fecha: '2027-03-23', motivo: 'Día del Mar (acto cívico)' }, { fecha: '2027-04-12', motivo: 'Día del Niño (actividad)' },
          { fecha: '2027-06-07', motivo: 'Día del Maestro (acto)' }, { fecha: '2027-09-21', motivo: 'Día del Estudiante' },
          { fecha: '2027-10-12', motivo: 'Día de la Descolonización (acto cívico)' },
        ],
      },
    },
    departamentos: {
      santa_cruz: {
        nombre: 'Santa Cruz',
        2026: {
          fin: '2026-12-04', // cierre de clases en Santa Cruz (a verificar con la DDE)
          sinClase: [
            { desde: '2026-07-06', hasta: '2026-07-24', motivo: 'Descanso pedagógico (ampliado por la DDE)' },
            { fecha: '2026-09-24', motivo: 'Aniversario de Santa Cruz' }, { fecha: '2026-09-25', motivo: 'Feriado por decreto (DS 5711)' },
          ],
        },
        2027: {
          sinClase: [
            { desde: '2027-07-05', hasta: '2027-07-16', motivo: 'Descanso pedagógico (provisional)' },
            { fecha: '2027-09-24', motivo: 'Aniversario de Santa Cruz' },
          ],
        },
      },
    },
    distritos: {
      scz_capital: { nombre: 'Santa Cruz de la Sierra (capital)', departamento: 'santa_cruz' },
      scz_rural_demo: {
        nombre: 'Distrito rural de Santa Cruz (ejemplo)',
        departamento: 'santa_cruz',
        2026: { sinClase: [{ fecha: '2026-10-16', motivo: 'Aniversario del municipio (ejemplo)' }] },
        2027: { sinClase: [{ fecha: '2027-10-15', motivo: 'Aniversario del municipio (ejemplo)' }] },
      },
    },
  };

  const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  const NOMBRE_DIA = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes' };

  // Fechas como texto AAAA-MM-DD, sin husos horarios (todo en UTC).
  const aFecha = (s) => new Date(`${s}T00:00:00Z`);
  const aTexto = (d) => d.toISOString().slice(0, 10);
  const sumarDias = (s, n) => { const d = aFecha(s); d.setUTCDate(d.getUTCDate() + n); return aTexto(d); };
  const diaSemana = (s) => DIAS[aFecha(s).getUTCDay()];

  function expandir(lista = []) {
    const out = [];
    for (const x of lista) {
      if (x.fecha) out.push({ fecha: x.fecha, motivo: x.motivo || 'Sin clase' });
      else if (x.desde && x.hasta) for (let f = x.desde; f <= x.hasta; f = sumarDias(f, 1)) out.push({ fecha: f, motivo: x.motivo || 'Sin clase' });
    }
    return out;
  }

  /** Las capas que aplican, de la más general a la más particular. */
  function capas({ anio, distrito, escuela = {}, profe = {} }) {
    const nac = CAPAS.nacional[anio];
    if (!nac) throw new Error(`No hay calendario cargado para ${anio}`);
    const dist = CAPAS.distritos[distrito] || CAPAS.distritos.scz_capital;
    const dep = CAPAS.departamentos[dist.departamento] || {};
    return [
      { id: 'nacional', nombre: nac.nombre, provisional: !!nac.provisional, ...nac },
      { id: 'departamento', nombre: dep.nombre || '—', ...(dep[anio] || {}) },
      { id: 'distrito', nombre: dist.nombre, ...(dist[anio] || {}) },
      { id: 'escuela', nombre: 'Escuela', ...escuela },
      { id: 'profe', nombre: 'Tus días', ...profe },
    ];
  }

  /**
   * Todos los días del año escolar: [{fecha, dia, trimestre, clase, motivo, capa, menosHoras}]
   * Una capa más particular puede devolver la clase a un día (`conClase`), p. ej. si el distrito
   * decide dar clases un día cívico.
   */
  function diasDelAnio(cfg) {
    const cs = capas(cfg);
    let inicio = null, fin = null, trimestres = null;
    for (const c of cs) { if (c.inicio) inicio = c.inicio; if (c.fin) fin = c.fin; if (c.trimestres) trimestres = c.trimestres; }
    // Si una capa corre el fin, el último trimestre termina ahí.
    trimestres = trimestres.map((t, i) => (i === trimestres.length - 1 ? [t[0], fin] : t));
    const sin = new Map(), menos = new Map();
    for (const c of cs) {
      for (const x of expandir(c.sinClase)) sin.set(x.fecha, { motivo: x.motivo, capa: c.id });
      for (const x of expandir(c.conClase)) sin.delete(x.fecha);
      for (const x of expandir(c.menosHoras)) menos.set(x.fecha, { motivo: x.motivo, capa: c.id });
    }
    const dias = [];
    for (let f = inicio; f <= fin; f = sumarDias(f, 1)) {
      const dia = diaSemana(f);
      if (dia === 'sab' || dia === 'dom') continue;
      const t = trimestres.findIndex(([a, b]) => f >= a && f <= b);
      if (t < 0) continue; // entre trimestres
      const s = sin.get(f), m = menos.get(f);
      dias.push({ fecha: f, dia, trimestre: t + 1, clase: !s, motivo: s ? s.motivo : m ? m.motivo : '', capa: s ? s.capa : m ? m.capa : '', menosHoras: !s && !!m });
    }
    return { dias, trimestres, inicio, fin, provisional: cs[0].provisional, capas: cs };
  }

  const contarHabiles = (dias, desde = '0000', hasta = '9999') => dias.filter((d) => d.clase && d.fecha >= desde && d.fecha <= hasta).length;

  // ── Reparto del plan ────────────────────────────────
  // plan: { areas: [{ id, nombre, temas: [{ id, titulo, peso (1–3), trimestre (0 = cualquiera) }] }] }
  // horario: { lun: ['mat', 'mat', 'len', …], mar: […], … }  (un área por periodo; '' = libre)
  // opciones: { colchon: 0.1, semanaEvaluacion: true, desde: 'AAAA-MM-DD', hechos: {temaId: fecha}, perdidos: [fecha] }
  const PERIODOS_MENOS = 2; // un acto cívico se come ~2 periodos

  function slotsDelAnio(cal, horario, opciones = {}) {
    const perdidos = new Set(opciones.perdidos || []);
    const desde = opciones.desde || cal.inicio;
    const slots = [];
    // Semana de evaluación: los últimos 5 días con clase de cada trimestre.
    const evalua = new Set();
    if (opciones.semanaEvaluacion !== false) {
      for (let t = 1; t <= cal.trimestres.length; t++) {
        cal.dias.filter((d) => d.trimestre === t && d.clase && !perdidos.has(d.fecha)).slice(-5).forEach((d) => evalua.add(d.fecha));
      }
    }
    for (const d of cal.dias) {
      if (!d.clase || perdidos.has(d.fecha) || d.fecha < desde) continue;
      let periodos = (horario[d.dia] || []).slice();
      if (d.menosHoras) periodos = periodos.slice(0, Math.max(0, periodos.length - PERIODOS_MENOS));
      periodos.forEach((area, i) => { if (area) slots.push({ fecha: d.fecha, periodo: i + 1, area, trimestre: d.trimestre, evaluacion: evalua.has(d.fecha) }); });
    }
    return slots;
  }

  /**
   * Reparte los temas pendientes en los periodos que quedan. Devuelve
   * { porFecha: {fecha: [{periodo, area, tipo, temaId}]}, areas: {id: resumen}, avisos: [] }
   */
  function repartir(plan, horario, cal, opciones = {}) {
    const colchon = opciones.colchon ?? 0.1;
    const hechos = opciones.hechos || {};
    const slots = slotsDelAnio(cal, horario, opciones);
    const porFecha = {};
    const poner = (s, x) => { (porFecha[s.fecha] ||= []).push({ periodo: s.periodo, area: s.area, ...x }); };
    const areas = {};
    const avisos = [];

    for (const area of plan.areas || []) {
      const mios = slots.filter((s) => s.area === area.id);
      const pendientes = (area.temas || []).filter((t) => !hechos[t.id]);
      const res = { id: area.id, nombre: area.nombre, periodos: mios.length, temas: (area.temas || []).length, hechos: (area.temas || []).length - pendientes.length, porTrimestre: {} };
      areas[area.id] = res;
      // Por trimestre: los temas con trimestre fijo van a su trimestre; los demás, en orden.
      const nT = cal.trimestres.length;
      const grupos = Array.from({ length: nT }, () => []);
      const libres = pendientes.filter((t) => !(t.trimestre >= 1 && t.trimestre <= nT));
      pendientes.filter((t) => t.trimestre >= 1 && t.trimestre <= nT).forEach((t) => grupos[t.trimestre - 1].push(t));
      // Los libres se reparten entre trimestres según los periodos que tiene cada uno.
      const utiles = (t) => mios.filter((s) => s.trimestre === t + 1 && !s.evaluacion).length;
      const totalUtil = grupos.reduce((a, _, t) => a + utiles(t), 0) || 1;
      // Cada tema libre va al trimestre donde cae la mitad de su peso acumulado (en orden del plan).
      const pesoLibres = libres.reduce((a, t) => a + (t.peso || 2), 0) || 1;
      const corte = []; let ac = 0;
      for (let t = 0; t < nT; t++) { ac += utiles(t); corte.push(ac / totalUtil); }
      let acum = 0;
      for (const tema of libres) {
        const medio = (acum + (tema.peso || 2) / 2) / pesoLibres;
        acum += tema.peso || 2;
        const t = corte.findIndex((c) => medio <= c + 1e-9);
        grupos[t < 0 ? nT - 1 : t].push(tema);
      }
      // Mantener el orden del plan dentro de cada trimestre.
      const orden = new Map((area.temas || []).map((t, i) => [t.id, i]));
      grupos.forEach((g) => g.sort((a, b) => orden.get(a.id) - orden.get(b.id)));

      for (let t = 0; t < nT; t++) {
        const disp = mios.filter((s) => s.trimestre === t + 1);
        const clase = disp.filter((s) => !s.evaluacion);
        disp.filter((s) => s.evaluacion).forEach((s) => poner(s, { tipo: 'evaluacion' }));
        const temas = grupos[t];
        const usables = Math.floor(clase.length * (1 - colchon));
        const pesoT = temas.reduce((a, x) => a + (x.peso || 2), 0) || 1;
        // Periodos por tema proporcionales al peso (mínimo 1), ajustados para no pasarse.
        let asign = temas.map((x) => Math.max(1, Math.round(((x.peso || 2) / pesoT) * usables)));
        while (asign.reduce((a, b) => a + b, 0) > clase.length && asign.some((n) => n > 1)) {
          const i = asign.indexOf(Math.max(...asign)); asign[i]--;
        }
        let k = 0;
        temas.forEach((x, i) => { for (let j = 0; j < asign[i] && k < clase.length; j++) poner(clase[k++], { tipo: 'tema', temaId: x.id }); });
        const sobran = clase.slice(k);
        sobran.forEach((s) => poner(s, { tipo: 'colchon' }));
        const necesita = temas.length * 2; // al menos 2 periodos por tema para que no quede apretado
        res.porTrimestre[t + 1] = { periodos: clase.length, temas: temas.length, colchon: sobran.length };
        if (temas.length && clase.length < temas.length) {
          avisos.push({ nivel: 'rojo', area: area.id, trimestre: t + 1, texto: `${area.nombre}: en el ${t + 1}.º trimestre quedan ${clase.length} periodos y ${temas.length} temas. No entran todos: conviene juntar o pasar temas.` });
        } else if (temas.length && clase.length < necesita) {
          avisos.push({ nivel: 'ambar', area: area.id, trimestre: t + 1, texto: `${area.nombre}: en el ${t + 1}.º trimestre quedan ${clase.length} periodos para ${temas.length} temas. Va apretado.` });
        }
      }
    }
    for (const f of Object.keys(porFecha)) porFecha[f].sort((a, b) => a.periodo - b.periodo);
    return { porFecha, areas, avisos, slots: slots.length };
  }

  const api = { CAPAS, DIAS, NOMBRE_DIA, sumarDias, diaSemana, capas, diasDelAnio, contarHabiles, slotsDelAnio, repartir };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Calendario = api;
})(typeof window !== 'undefined' ? window : globalThis);
