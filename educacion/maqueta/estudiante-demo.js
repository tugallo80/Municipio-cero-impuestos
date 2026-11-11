// EDU.17 — Alumno demo de 2.º de secundaria (app completa del alumno). Datos ficticios, sin nombres reales.
// Las fechas se arman desde HOY (en días hábiles relativos) para que la demo siempre se vea al día.
// Si EDU.15 publica su alumno demo, este archivo se reemplaza por sus datos con los mismos campos.
(function () {
  const dia = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  // n días HÁBILES desde hoy (salta sábado y domingo)
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const lindo = isoF => { const d = new Date(isoF + 'T12:00:00'); return `${DIAS[d.getDay()]} ${d.getDate()}`; };
  const habil = n => { const d = new Date(); d.setHours(12, 0, 0, 0); let k = 0; const paso = n >= 0 ? 1 : -1; while (k !== n) { d.setDate(d.getDate() + paso); if (d.getDay() % 6) k += paso; } return d.toISOString().slice(0, 10); };

  window.ESTUDIANTE_DEMO = {
    apodo: 'Jaguar Azul 7', avatar: '🐆', curso: '2do_secundaria', cursoNombre: '2.º de secundaria A',
    colegio: 'U.E. Arcoíris del Sur', distrito: 'scz_capital',
    // Mismo horario que el cronograma del profe para 2.º de secundaria (EDU.04b)
    horario: {
      lun: ['len', 'len', 'mat', 'mat', 'ing', 'ing'],
      mar: ['bio', 'bio', 'csoc', 'csoc', 'art', 'fil'],
      mie: ['mat', 'mat', 'len', 'ing', 'mus', 'val'],
      jue: ['bio', 'csoc', 'fil', 'art', 'art', 'efd'],
      vie: ['mat', 'len', 'bio', 'mus', 'val', 'efd']
    },
    horas: [['07:30', '08:10'], ['08:10', '08:50'], ['08:50', '09:30'], ['09:50', '10:30'], ['10:30', '11:10'], ['11:10', '11:50']],
    recreo: ['09:30', '09:50'],
    materias: {
      len: { nombre: 'Lengua Castellana', corto: 'Lenguaje', icono: '📖', color: '#F59E0B', profe: 'la profe Taji' },
      mat: { nombre: 'Matemática', corto: 'Mate', icono: '🔢', color: '#10B981', profe: 'la profe Taji' },
      bio: { nombre: 'Biología - Geografía', corto: 'Biología', icono: '🧬', color: '#22C55E', profe: 'el profe Jochi' },
      csoc: { nombre: 'Ciencias Sociales', corto: 'Sociales', icono: '🗺️', color: '#A78BFA', profe: 'el profe Jochi' },
      ing: { nombre: 'Lengua Extranjera (Inglés)', corto: 'Inglés', icono: '💬', color: '#F472B6', profe: 'el profe Jochi' },
      fil: { nombre: 'Cosmovisiones, Filosofía y Psicología', corto: 'Filosofía', icono: '💭', color: '#818CF8', profe: 'el profe Jochi' },
      art: { nombre: 'Artes Plásticas y Visuales', corto: 'Artes', icono: '🎨', color: '#FB923C', profe: 'la profe Taji' },
      mus: { nombre: 'Educación Musical', corto: 'Música', icono: '🎵', color: '#EC4899', profe: 'la profe Taji' },
      val: { nombre: 'Valores, Espiritualidades y Religiones', corto: 'Valores', icono: '🤝', color: '#EAB308', profe: 'el profe Jochi' },
      efd: { nombre: 'Educación Física y Deportes', corto: 'Ed. Física', icono: '⚽', color: '#14B8A6', profe: 'el profe Jochi' }
    },
    // Qué llevar según la materia del día (se suma lo de las tareas)
    llevar: { mus: 'Flauta o tu instrumento', efd: 'Buzo, zapatillas y una botella de agua', art: 'Lápices de colores y hoja bond', mat: 'Calculadora y regla', bio: 'Cuaderno de Biología', ing: 'Diccionario de inglés (si tenés)' },
    avisos: [
      { fecha: dia(0), titulo: 'Feria de ciencias', texto: 'El viernes de la semana que viene es la feria de ciencias. Cada grupo trae su maqueta.' },
      { fecha: dia(-1), titulo: 'Reunión de padres', texto: `El ${lindo(habil(3))} a las 18:00 hay reunión de padres de 2.º de secundaria en el salón.` },
      { fecha: dia(-3), titulo: 'Uniforme de educación física', texto: 'Los jueves y viernes vienen con buzo del colegio.' }
    ],
    eventos: [
      { fecha: habil(2), tipo: 'examen', materia: 'mat', titulo: 'Evaluación de Matemática: números enteros' },
      { fecha: habil(4), tipo: 'examen', materia: 'bio', titulo: 'Evaluación de Biología: la célula' },
      { fecha: habil(6), tipo: 'acto', titulo: 'Acto cívico (el curso lee el poema)' },
      { fecha: habil(8), tipo: 'acto', titulo: 'Feria de ciencias' },
      { fecha: habil(3), tipo: 'casa', titulo: 'Reunión de padres 18:00' }
    ],
    // Tareas del curso (formato común de EDU.06d/EDU.04f)
    tareas: [
      { id: 'S2-mat-enteros', curso: '2do_secundaria', materia: 'mat', titulo: 'Números enteros en la recta', consigna: 'Respondé estas preguntas de números enteros. Si te trabás, pedí una pista.', tipo: 'opciones', vence: dia(0), creada: habil(-1),
        origen: { tipo: 'clase', texto: 'la dejó la profe en la clase de ayer' },
        preguntas: [
          { q: '¿Cuál es mayor: −3 o −7?', ops: ['−3', '−7', 'Son iguales'], ok: 0, mal: { 1: 'En la recta, −7 está más a la izquierda: es menor.', 2: 'No son iguales: están en lugares distintos de la recta.' }, escalera: ['Dibujá una recta con el 0 al medio. ¿Dónde va el −3 y dónde el −7?', 'Más a la derecha en la recta = número mayor.', 'Ejemplo: −1 es mayor que −5 porque está más cerca del 0.'] },
          { q: 'La temperatura era −2 °C y subió 5 grados. ¿Cuánto marca ahora?', ops: ['3 °C', '−7 °C', '7 °C'], ok: 0, mal: { 1: 'Subir es sumar: −2 + 5, no −2 − 5.', 2: 'Arrancás en −2, no en 2.' }, escalera: ['Subir 5 grados, ¿es sumar o restar?', 'Pará en −2 en la recta y avanzá 5 lugares a la derecha.', 'Ejemplo: −1 + 4 = 3.'] }
        ] },
      { id: 'S2-len-cuento', curso: '2do_secundaria', materia: 'len', titulo: 'Leer: el género narrativo', consigna: 'Leé en “Mis textos” el tema de Lengua sobre el género narrativo y anotá en tu cuaderno los elementos de un cuento.', tipo: 'texto', como: 'nada', soloMarcar: true, vence: dia(1), creada: habil(-1),
        origen: { tipo: 'cronograma', texto: 'del cronograma de Lengua Castellana' } },
      { id: 'S2-bio-celula', curso: '2do_secundaria', materia: 'bio', titulo: 'Dibujo de la célula', consigna: 'Dibujá una célula animal y una vegetal, marcá 3 partes de cada una y sacale una foto.', tipo: 'foto', vence: habil(2), creada: dia(0),
        origen: { tipo: 'clase', texto: 'la dejó el profe en la clase de hoy' },
        escalera: ['¿Qué tienen todas las células?', 'Las vegetales tienen pared celular y cloroplastos.', 'Ejemplo: núcleo, membrana y citoplasma en las dos.'] },
      { id: 'S2-ing-routine', curso: '2do_secundaria', materia: 'ing', titulo: 'My daily routine', consigna: 'Write 5 sentences about your daily routine (in English). Usá: wake up, have breakfast, go to school…', tipo: 'texto', minimo: 80, vence: habil(3), creada: dia(0),
        origen: { tipo: 'mentora', texto: 'sugerida por la mentora del profe para repasar' },
        escalera: ['What do you do first in the morning?', 'Usá “I” + verbo: I wake up at 6.', 'Ejemplo: I wake up at 6. I have breakfast with my family.'] },
      { id: 'S2-csoc-mapa', curso: '2do_secundaria', materia: 'csoc', titulo: 'Pisos ecológicos de Bolivia', consigna: 'Respondé sobre los pisos ecológicos.', tipo: 'opciones', vence: habil(5), creada: dia(0),
        origen: { tipo: 'cronograma', texto: 'del cronograma de Ciencias Sociales' },
        preguntas: [{ q: '¿En qué región está Santa Cruz de la Sierra?', ops: ['Llanos (tierras bajas)', 'Altiplano', 'Valles'], ok: 0, mal: { 1: 'El Altiplano está al oeste, a más de 3.600 m.', 2: 'Los valles están entre la cordillera y los llanos.' }, escalera: ['¿Hace frío o calor en Santa Cruz?', 'Las tierras bajas son cálidas y están al este.', 'Ejemplo: Beni y Santa Cruz son llanos.'] }] },
      { id: 'S2-mus-taquirari', curso: '2do_secundaria', materia: 'mus', titulo: 'Escuchar un taquirari', consigna: 'Escuchá un taquirari y escribí qué instrumentos reconocés.', tipo: 'texto', minimo: 40, vence: habil(-1), creada: habil(-4),
        origen: { tipo: 'clase', texto: 'la dejó la profe en la clase de música' }, estado: 'hecha' }
    ]
  };
})();
