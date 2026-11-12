// EDU.17 — Alumno demo del curso piloto: U.E. Nuevo Horizonte, 2.º de secundaria, gestión 2026.
// El curso y sus textos son reales (los pasó el profe del piloto); el alumno es ficticio (apodo, sin nombre real).
// Tareas y exámenes van sobre las unidades del 3.er trimestre de sus textos oficiales.
// Las fechas se arman desde HOY (en días hábiles relativos) para que la demo siempre se vea al día.
// Fuente única: EDU.15/EDU.04f van a generar este archivo desde tools/datos/estudiante-demo.json;
// estudiante.js acepta también su formato (horario y llevar como listas).
(function () {
  const dia = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  // n días HÁBILES desde hoy (salta sábado y domingo)
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const lindo = isoF => { const d = new Date(isoF + 'T12:00:00'); return `${DIAS[d.getDay()]} ${d.getDate()}`; };
  const habil = n => { const d = new Date(); d.setHours(12, 0, 0, 0); let k = 0; const paso = n >= 0 ? 1 : -1; while (k !== n) { d.setDate(d.getDate() + paso); if (d.getDay() % 6) k += paso; } return d.toISOString().slice(0, 10); };

  window.ESTUDIANTE_DEMO = {
    apodo: 'Jaguar Azul 7', avatar: '🐆', curso: '2do_secundaria', cursoNombre: '2.º de secundaria A',
    colegio: 'U.E. Nuevo Horizonte', gestion: 2026, distrito: 'scz_capital',
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
      { fecha: dia(0), titulo: 'Feria de ciencias', texto: `El ${lindo(habil(8))} es la feria de ciencias. Cada grupo trae su maqueta de un bioma de Bolivia.` },
      { fecha: dia(-1), titulo: 'Reunión de padres', texto: `El ${lindo(habil(3))} a las 18:00 hay reunión de padres de 2.º de secundaria: entrega de notas del 3.er trimestre.` },
      { fecha: dia(-3), titulo: 'Fin de gestión', texto: 'Las clases de la gestión 2026 terminan el 4 de diciembre. ¡Último empujón!' }
    ],
    // Exámenes y actos del 3.er trimestre, sobre los temas reales de sus textos
    eventos: [
      { fecha: habil(2), tipo: 'examen', materia: 'mat', titulo: 'Evaluación de Matemática: cuerpos geométricos' },
      { fecha: habil(4), tipo: 'examen', materia: 'csoc', titulo: 'Evaluación de Sociales: las grandes rebeliones indígenas' },
      { fecha: habil(6), tipo: 'acto', titulo: 'Acto cívico (el curso lee una crónica)' },
      { fecha: habil(8), tipo: 'acto', titulo: 'Feria de ciencias: biomas de Bolivia' },
      { fecha: habil(3), tipo: 'casa', titulo: 'Reunión de padres 18:00' }
    ],
    // Tareas del curso (formato común de EDU.06d/EDU.04f), sobre las unidades del 3.er trimestre de sus textos
    tareas: [
      { id: 'S2-mat-cuerpos', curso: '2do_secundaria', materia: 'mat', titulo: 'Cuerpos geométricos', consigna: 'Respondé estas preguntas de las formas en el espacio. Si te trabás, pedí una pista.', tipo: 'opciones', vence: dia(0), creada: habil(-1),
        origen: { tipo: 'clase', texto: 'la dejó la profe en la clase de ayer' },
        preguntas: [
          { q: '¿Cuántas caras tiene un cubo?', ops: ['6', '8', '12'], ok: 0, mal: { 1: '8 son los vértices (las esquinas), no las caras.', 2: '12 son las aristas (los bordes), no las caras.' }, escalera: ['Pensá en un dado: ¿cuántos números tiene?', 'Cada cara es un cuadrado. Contá arriba, abajo y los costados.', 'Ejemplo: una caja de fósforos también tiene 6 caras.'] },
          { q: 'Un prisma triangular, ¿qué forma tienen sus dos bases?', ops: ['Triángulos', 'Cuadrados', 'Círculos'], ok: 0, mal: { 1: 'Las caras de los costados son rectángulos; las bases le dan el nombre.', 2: 'Las bases con círculos son del cilindro.' }, escalera: ['El nombre del prisma te da una pista.', 'Las bases son las dos caras iguales y paralelas.', 'Ejemplo: un prisma cuadrangular tiene bases cuadradas.'] }
        ] },
      { id: 'S2-len-acentos', curso: '2do_secundaria', materia: 'len', titulo: 'Leer: diptongos e hiatos', consigna: 'Leé en “Mis textos” el taller ortográfico de Lengua (acentuación en diptongos, hiatos y casos especiales) y anotá 5 ejemplos de cada uno en tu cuaderno.', tipo: 'texto', como: 'nada', soloMarcar: true, vence: dia(1), creada: habil(-1),
        origen: { tipo: 'cronograma', texto: 'del cronograma de Lengua Castellana' } },
      { id: 'S2-bio-bioma', curso: '2do_secundaria', materia: 'bio', titulo: 'Un bioma de Bolivia', consigna: 'Dibujá un bioma de Bolivia (por ejemplo, el Chaco o la Chiquitanía) con 3 animales y 3 plantas, y sacale una foto.', tipo: 'foto', vence: habil(2), creada: dia(0),
        origen: { tipo: 'clase', texto: 'la dejó el profe en la clase de hoy' },
        escalera: ['¿Cómo es el clima en ese lugar: seco, húmedo, frío?', 'Los animales y plantas se adaptan al clima del bioma.', 'Ejemplo: en el Chaco hay quebracho, cactus y el tatú carreta.'] },
      { id: 'S2-ing-music', curso: '2do_secundaria', materia: 'ing', titulo: 'My favorite music and sport', consigna: 'Write 5 sentences about the musical instruments and sports you like (in English). Usá: I like, I play, I can…', tipo: 'texto', minimo: 80, vence: habil(3), creada: dia(0),
        origen: { tipo: 'mentora', texto: 'sugerida por la mentora del profe para repasar' },
        escalera: ['What sport do you play?', 'Usá “I play” + deporte o instrumento: I play football.', 'Ejemplo: I play the guitar. I like basketball because it is fun.'] },
      { id: 'S2-csoc-rebeliones', curso: '2do_secundaria', materia: 'csoc', titulo: 'Las grandes rebeliones indígenas', consigna: 'Respondé sobre las rebeliones indígenas de la colonia.', tipo: 'opciones', vence: habil(4), creada: dia(0),
        origen: { tipo: 'cronograma', texto: 'del cronograma de Ciencias Sociales' },
        preguntas: [{ q: '¿Quién dirigió el cerco a la ciudad de La Paz en 1781?', ops: ['Túpac Katari', 'Simón Bolívar', 'Pedro Domingo Murillo'], ok: 0, mal: { 1: 'Bolívar llegó más de 40 años después, en la independencia.', 2: 'Murillo encabezó la revolución de 1809, no el cerco de 1781.' }, escalera: ['¿Fue antes o después de la independencia?', 'Fue un líder aymara, junto a Bartolina Sisa.', 'Ejemplo: Túpac Amaru se levantó en el Cusco en 1780.'] }] },
      { id: 'S2-mus-coro', curso: '2do_secundaria', materia: 'mus', titulo: 'Calentamiento vocal', consigna: 'Hacé los ejercicios de calentamiento vocal del texto de Música y contá cuál te costó más.', tipo: 'texto', minimo: 40, vence: habil(-1), creada: habil(-4),
        origen: { tipo: 'clase', texto: 'la dejó la profe en la clase de música' }, estado: 'hecha' }
    ]
  };
})();
