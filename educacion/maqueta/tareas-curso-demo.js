// EDU.17 — Lo que la app del alumno suma a la fuente única de EDU.15 (estudiante-demo.js, generado).
// EDU.15 trae las tareas del servidor (solo materias del profe del piloto: Inglés y Filosofía).
// Acá van tareas y exámenes de ejemplo de las otras materias, sobre las unidades REALES del
// 3.er trimestre de sus textos, y lo que se lleva siempre según la materia. Sin nombres reales:
// {profe} se reemplaza en el equipo con el apodo del profe (estudiante.js).
(function () {
  const dia = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  // n días HÁBILES desde hoy (salta sábado y domingo)
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const lindo = isoF => { const d = new Date(isoF + 'T12:00:00'); return `${DIAS[d.getDay()]} ${d.getDate()}`; };
  const habil = n => { const d = new Date(); d.setHours(12, 0, 0, 0); let k = 0; const paso = n >= 0 ? 1 : -1; while (k !== n) { d.setDate(d.getDate() + paso); if (d.getDay() % 6) k += paso; } return d.toISOString().slice(0, 10); };

  window.EDU17_EXTRA = {
    llevar: { mus: 'Flauta o tu instrumento', efd: 'Buzo, zapatillas y una botella de agua', art: 'Lápices de colores y hoja bond', mat: 'Calculadora y regla', bio: 'Cuaderno de Biología', ing: 'Diccionario de inglés (si tenés)' },
    eventos: [
      { fecha: habil(2), tipo: 'examen', materia: 'mat', titulo: 'Evaluación de Matemática: cuerpos geométricos' },
      { fecha: habil(5), tipo: 'examen', materia: 'csoc', titulo: 'Evaluación de Sociales: las grandes rebeliones indígenas' }
    ],
    tareas: [
      { id: 'S2-mat-cuerpos', curso: '2do_secundaria', materia: 'mat', titulo: 'Cuerpos geométricos', consigna: 'Respondé estas preguntas de las formas en el espacio. Si te trabás, pedí una pista.', tipo: 'opciones', vence: dia(0), creada: habil(-1),
        origen: { tipo: 'clase', texto: `la dejó {profe} en la clase del ${DIAS[new Date(habil(-1) + 'T12:00:00').getDay()]}` },
        preguntas: [
          { q: '¿Cuántas caras tiene un cubo?', ops: ['6', '8', '12'], ok: 0, mal: { 1: '8 son los vértices (las esquinas), no las caras.', 2: '12 son las aristas (los bordes), no las caras.' }, escalera: ['Pensá en un dado: ¿cuántos números tiene?', 'Cada cara es un cuadrado. Contá arriba, abajo y los costados.', 'Ejemplo: una caja de fósforos también tiene 6 caras.'] },
          { q: 'Un prisma triangular, ¿qué forma tienen sus dos bases?', ops: ['Triángulos', 'Cuadrados', 'Círculos'], ok: 0, mal: { 1: 'Las caras de los costados son rectángulos; las bases le dan el nombre.', 2: 'Las bases con círculos son del cilindro.' }, escalera: ['El nombre del prisma te da una pista.', 'Las bases son las dos caras iguales y paralelas.', 'Ejemplo: un prisma cuadrangular tiene bases cuadradas.'] }
        ] },
      { id: 'S2-len-acentos', curso: '2do_secundaria', materia: 'len', titulo: 'Leer: diptongos e hiatos', consigna: 'Leé en “Mis textos” el taller ortográfico de Lengua (acentuación en diptongos, hiatos y casos especiales) y anotá 5 ejemplos de cada uno en tu cuaderno.', tipo: 'texto', como: 'nada', soloMarcar: true, vence: dia(1), creada: habil(-1),
        origen: { tipo: 'cronograma', texto: 'del cronograma de Lengua Castellana' } },
      { id: 'S2-bio-bioma', curso: '2do_secundaria', materia: 'bio', titulo: 'Un bioma de Bolivia', consigna: 'Dibujá un bioma de Bolivia (por ejemplo, el Chaco o la Chiquitanía) con 3 animales y 3 plantas, y sacale una foto.', tipo: 'foto', vence: habil(2), creada: dia(0),
        origen: { tipo: 'clase', texto: 'la dejó {profe} en la clase de hoy' },
        escalera: ['¿Cómo es el clima en ese lugar: seco, húmedo, frío?', 'Los animales y plantas se adaptan al clima del bioma.', 'Ejemplo: en el Chaco hay quebracho, cactus y el tatú carreta.'] },
      { id: 'S2-csoc-rebeliones', curso: '2do_secundaria', materia: 'csoc', titulo: 'Las grandes rebeliones indígenas', consigna: 'Respondé sobre las rebeliones indígenas de la colonia.', tipo: 'opciones', vence: habil(4), creada: dia(0),
        origen: { tipo: 'cronograma', texto: 'del cronograma de Ciencias Sociales' },
        preguntas: [{ q: '¿Quién dirigió el cerco a la ciudad de La Paz en 1781?', ops: ['Túpac Katari', 'Simón Bolívar', 'Pedro Domingo Murillo'], ok: 0, mal: { 1: 'Bolívar llegó más de 40 años después, en la independencia.', 2: 'Murillo encabezó la revolución de 1809, no el cerco de 1781.' }, escalera: ['¿Fue antes o después de la independencia?', 'Fue un líder aymara, junto a Bartolina Sisa.', 'Ejemplo: Túpac Amaru se levantó en el Cusco en 1780.'] }] },
      { id: 'S2-mus-coro', curso: '2do_secundaria', materia: 'mus', titulo: 'Calentamiento vocal', consigna: 'Hacé los ejercicios de calentamiento vocal del texto de Música y contá cuál te costó más.', tipo: 'texto', minimo: 40, vence: habil(-1), creada: habil(-4),
        origen: { tipo: 'clase', texto: 'la dejó {profe} en la clase de música' }, estado: 'hecha' }
    ]
  };
})();
