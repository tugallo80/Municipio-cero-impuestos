// EDU.06d — Tareas del alumno (modo directo). Formato común de "tarea" (acordado con EDU.04f):
// {
//   id, curso, materia ('mat'|'len'|'cnat'|'csoc'|'ing'|'art'), titulo, consigna,
//   tipo: 'mision' (usa el contenido de misiones-demo.js por `mision`) | 'opciones' | 'respuesta' | 'texto' | 'foto',
//   mision?, preguntas?: [{ q, ops, ok, mal, escalera: [guía, pista, ejemplo] }],
//   vence: 'AAAA-MM-DD', creada: 'AAAA-MM-DD',
//   origen: { tipo: 'clase'|'cronograma'|'mentora'|'profe', texto },
//   premio?: { llave }, estado: 'pendiente'|'hecha'
// }
// Sin nombres reales: solo curso y materia. Las fechas de la demo se arman desde HOY, así nunca
// aparecen vencidas el día que se muestra.
(function () {
  const dia = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const nombreDia = iso => DIAS[new Date(iso + 'T12:00:00').getDay()];
  const enClase = (n, quien = 'la profe') => ({ tipo: 'clase', texto: `la dejó ${quien} en la clase del ${nombreDia(dia(n))}` });

  window.TAREAS_DEMO = [
    { id: 'M1', curso: '4A', materia: 'mat', titulo: 'El mercado de las fracciones', consigna: 'Ayudá a la casera a repartir frutas en partes iguales. Primero un repaso cortito y después la misión.', tipo: 'mision', mision: 'M1', vence: dia(0), creada: dia(-2), origen: enClase(-2), premio: { llave: 'parque' }, estado: 'pendiente' },
    { id: 'T-cuaderno-42', curso: '4A', materia: 'mat', titulo: 'Fracciones equivalentes en el cuaderno', consigna: 'Página 42 del cuaderno: ejercicios 1 al 5 de fracciones equivalentes. Cuando termines, sacale una foto a tu cuaderno.', tipo: 'foto', vence: dia(1), creada: dia(-2), origen: enClase(-2), estado: 'pendiente',
      escalera: ['¿Qué quiere decir que dos fracciones sean equivalentes?', 'Multiplicá o dividí arriba y abajo por el mismo número.', 'Ejemplo: 1/2 = 2/4 = 3/6, porque arriba y abajo se multiplican por 2 y por 3.'] },
    { id: 'M3', curso: '4A', materia: 'len', titulo: 'Describí tu barrio', consigna: 'Respondé las preguntas sobre palabras que describen, y después escribí 5 oraciones sobre un lugar de tu barrio.', tipo: 'mision', mision: 'M3', vence: dia(1), creada: dia(-1), origen: { tipo: 'cronograma', texto: 'del cronograma de Lenguaje de esta semana' }, premio: { llave: 'perdidos' }, estado: 'pendiente' },
    { id: 'T-oraciones', curso: '4A', materia: 'len', titulo: '5 oraciones de mi barrio', consigna: 'Escribí 5 oraciones que describan un lugar de tu barrio (la plaza, el mercado, tu calle). Usá al menos 3 palabras que digan cómo es.', tipo: 'texto', minimo: 60, vence: dia(2), creada: dia(-1), origen: { tipo: 'profe', texto: 'la dejó la profe en el cronograma' }, estado: 'pendiente',
      escalera: ['¿Qué lugar de tu barrio te gusta más?', 'Contá cómo es: grande, ruidoso, verde, colorido…', 'Ejemplo: “El mercado es grande y ruidoso. Tiene frutas coloridas.”'] },
    { id: 'M4', curso: '4A', materia: 'cnat', titulo: 'El viaje de la gota', consigna: 'Seguí a la gota por el ciclo del agua y respondé.', tipo: 'mision', mision: 'M4', vence: dia(2), creada: dia(0), origen: { tipo: 'mentora', texto: 'sugerida por la mentora del profe para repasar lo de hoy' }, estado: 'pendiente' },
    { id: 'M5', curso: '4A', materia: 'csoc', titulo: 'Los 9 departamentos', consigna: 'Repasá los departamentos de Bolivia.', tipo: 'mision', mision: 'M5', vence: dia(5), creada: dia(-1), origen: { tipo: 'cronograma', texto: 'del cronograma de Ciencias Sociales' }, estado: 'pendiente' },
    { id: 'M6', curso: '4A', materia: 'ing', titulo: 'My morning', consigna: 'Ordená tu rutina de la mañana en inglés.', tipo: 'mision', mision: 'M6', vence: dia(6), creada: dia(0), origen: enClase(0, 'el profe'), estado: 'pendiente' },
    { id: 'M7', curso: '4A', materia: 'art', titulo: 'Collage de colores cálidos', consigna: 'Armá un collage con colores cálidos (rojo, naranja, amarillo) y sacale una foto.', tipo: 'foto', vence: dia(3), creada: dia(-1), origen: enClase(-1), estado: 'pendiente',
      escalera: ['¿Qué colores te recuerdan al sol o al fuego?', 'Buscá papeles o revistas con rojo, naranja y amarillo.', 'Ejemplo: un sol de papel naranja con rayos amarillos y rojos.'] },
    { id: 'M2', curso: '4A', materia: 'mat', titulo: 'Tablas en carrera', consigna: 'Multiplicaciones rápidas.', tipo: 'mision', mision: 'M2', vence: dia(-1), creada: dia(-4), origen: enClase(-4), estado: 'hecha' },
    { id: 'M8', curso: '4A', materia: 'cnat', titulo: 'Plantas que beben', consigna: 'Observá una planta 3 días y anotá qué pasa.', tipo: 'texto', vence: dia(-2), creada: dia(-5), origen: enClase(-5, 'el profe'), estado: 'hecha' }
  ];

  // Lo que el alumno ya hizo (en el modo directo o en el juego) queda en el celular.
  const CLAVE = 'alumno-tareas-hechas';
  const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (e) { return []; } };
  window.TAREAS_HECHAS = {
    lista: leer,
    marcar(id) { const l = leer(); if (!l.includes(id)) { l.push(id); try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch (e) {} } },
    borrar() { try { localStorage.removeItem(CLAVE); } catch (e) {} }
  };
  // Formato de EDU.04f (Function eduTareas, accion 'mias'): se adapta a esta pantalla.
  // { id, curso, materia, titulo, consigna, tipo: practica|lectura|investigacion|proyecto|mision, entrega,
  //   variante, textoVariante, criterios, puntos, autoevaluacion, origen: { tipo, tema }, enviada, como?, pistas?, mision?, estado? }
  window.adaptarTareaProfe = function (t) {
    if (!t || !t.entrega) return t;   // ya viene en el formato de esta pantalla
    const como = t.como || (t.tipo === 'mision' ? 'mision' : t.tipo === 'proyecto' ? 'foto' : t.tipo === 'lectura' ? 'nada' : 'texto');
    const env = t.enviada ? new Date(t.enviada) : null, dia = env ? DIAS[env.getDay()] : '';
    const tema = t.origen && t.origen.tema ? t.origen.tema : '';
    return {
      id: t.id, curso: t.curso, materia: t.materia, titulo: t.titulo, consigna: t.textoVariante || t.consigna,
      tipo: como === 'nada' ? 'texto' : como, minimo: como === 'nada' ? 0 : undefined, soloMarcar: como === 'nada',
      mision: t.mision, escalera: t.pistas, vence: t.entrega, creada: env ? env.toISOString().slice(0, 10) : t.entrega,
      origen: { tipo: (t.origen && t.origen.tipo) || 'profe', texto: t.origen && t.origen.tipo === 'cronograma' ? `del cronograma${tema ? ': ' + tema : ''}` : `la dejó el profe${dia ? ' el ' + dia : ''}${tema ? ' (clase de ' + tema + ')' : ''}` },
      autoevaluacion: t.autoevaluacion, criterios: t.criterios, estado: t.estado === 'hecha' ? 'hecha' : 'pendiente', delProfe: true
    };
  };
  // Tareas generadas del lado del profe (EDU.04f), si están cargadas (su formato o este).
  window.tareasDelAlumno = function () {
    let extra = [];
    try { extra = JSON.parse(localStorage.getItem('nande-tareas-profe') || '[]'); } catch (e) {}
    const todas = [...(window.TAREAS_PROFE || []), ...extra].map(window.adaptarTareaProfe).concat(window.TAREAS_DEMO);
    const vistas = new Set(), hechas = new Set(leer());
    return todas.filter(t => !vistas.has(t.id) && vistas.add(t.id)).map(t => Object.assign({}, t, { estado: hechas.has(t.id) || hechas.has(t.mision) ? 'hecha' : t.estado }));
  };
})();
