// ══════════════════════════════════════════════════
//  Contenido de las misiones de la maqueta (EDU.01b → EDU.02b).
//  Lo usan DOS lados, por eso es un solo archivo:
//   - la maqueta del alumno (alumno.html lo carga con <script>)
//   - el servidor de los profes (services/ai-gateway/tutor/misiones-demo.js es una
//     COPIA EXACTA: el profe sabe en qué pregunta está el niño sin que el navegador
//     le mande texto). `npm test` en ai-gateway falla si las dos copias difieren.
//  Para cambiar algo: editar acá y copiar el archivo encima del otro.
//
//  escalera = [pregunta que guía, pista, ejemplo resuelto]; mal = feedback por opción.
//  Solo contenido pedagógico: nada de nombres ni datos de alumnos.
// ══════════════════════════════════════════════════
(function (raiz) {
  const MATERIAS = { mat: 'Matemática', len: 'Comunicación y Lenguajes', cnat: 'Ciencias Naturales', csoc: 'Ciencias Sociales', ing: 'Inglés', art: 'Artes Plásticas' };
  const MISIONES = {
    M1: { materia: 'mat', titulo: 'El mercado de las fracciones' },
    M2: { materia: 'mat', titulo: 'Tablas en carrera' },
    M3: { materia: 'len', titulo: 'Describí tu barrio' },
    M4: { materia: 'cnat', titulo: 'El viaje de la gota' },
    M5: { materia: 'csoc', titulo: 'Los 9 departamentos' },
    M6: { materia: 'ing', titulo: 'My morning' },
    M7: { materia: 'art', titulo: 'Collage de colores cálidos' },
    M8: { materia: 'cnat', titulo: 'Plantas que beben' }
  };
  const CONT = {
    M1: {
      repaso: [
        { de: 'hace 3 días', q: '¿Cuánto es 6 × 4?', ops: ['24', '20', '28'], ok: 0, mal: { 1: '20 es 5 × 4. Te falta sumar un 4 más.', 2: '28 es 7 × 4. Te pasaste por un 4.' } },
        { de: 'hace 7 días', q: 'En 3/5, ¿cuál es el denominador?', ops: ['3', '5', '8'], ok: 1, mal: { 0: '3 es el numerador: las partes que tomás. El denominador es el de abajo.', 2: '8 sería sumar los dos. El denominador es el número de abajo.' } }
      ],
      pasos: [
        { q: 'La casera corta una sandía en 4 partes iguales y vende 2. ¿Qué fracción vendió?', ops: ['2/4', '4/2', '2/6'], ok: 0,
          mal: { 1: 'Está al revés: abajo va en cuántas partes se cortó (4), arriba las que vendió (2).', 2: '2/6 sería si la sandía tuviera 6 partes. ¿En cuántas se cortó?' },
          escalera: ['¿En cuántas partes iguales se cortó la sandía? Ese número va abajo.', 'Arriba va cuántas partes vendió; abajo, en cuántas se cortó.', 'Ejemplo resuelto: una torta en 8 partes, me como 3 → 3/8. Ahora hacelo con la sandía.'] },
        { q: 'Vendió 2/4 de la sandía. ¿Qué fracción es igual a 2/4?', ops: ['1/2', '2/8', '4/4'], ok: 0,
          mal: { 1: '2/8 es más chico: es cortar en 8 y tomar solo 2.', 2: '4/4 es la sandía entera.' },
          escalera: ['Si tenés 4 pedazos y tomás 2, ¿tomaste más, menos o justo la mitad?', 'Dividí arriba y abajo de 2/4 por el mismo número: 2.', 'Ejemplo resuelto: 3/6 → 3 ÷ 3 = 1 y 6 ÷ 3 = 2 → 1/2. Probá lo mismo con 2/4.'] }
      ]
    },
    M3: {
      repaso: [
        { de: 'hace 3 días', q: '¿Cuál es un sustantivo (el nombre de una cosa)?', ops: ['mercado', 'rápido', 'correr'], ok: 0, mal: { 1: '"rápido" dice cómo es algo: es un adjetivo.', 2: '"correr" es una acción: es un verbo.' } },
        { de: 'hace 7 días', q: '¿Qué oración está bien escrita?', ops: ['El río es ancho.', 'el río es ancho.', 'El río es ancho'], ok: 0, mal: { 1: 'Las oraciones empiezan con mayúscula.', 2: 'Le falta el punto al final.' } },
        { de: 'ayer', q: '¿Cuál es un verbo (una acción)?', ops: ['saltar', 'mesa', 'alto'], ok: 0, mal: { 1: '"mesa" es una cosa: sustantivo.', 2: '"alto" dice cómo es: adjetivo.' } }
      ],
      pasos: [
        { q: 'Completá: “La plaza de mi barrio es ___.”', ops: ['verde', 'camina', 'ayer'], ok: 0,
          mal: { 1: '"camina" es una acción. Buscá una palabra que diga cómo es la plaza.', 2: '"ayer" dice cuándo, no cómo es.' },
          escalera: ['¿Cómo es la plaza de tu barrio? Pensá en su color o en su tamaño.', 'Las palabras que describen se llaman adjetivos: grande, verde, ruidosa…', 'Ejemplo resuelto: “El micro es ruidoso” → “ruidoso” dice cómo es el micro. Ahora la plaza.'] },
        { q: '¿Qué oración describe MEJOR el mercado?', ops: ['El mercado es grande, ruidoso y colorido.', 'El mercado.', 'Fui al mercado.'], ok: 0,
          mal: { 1: 'Le falta decir cómo es.', 2: 'Cuenta qué hiciste, pero no cómo es el mercado.' },
          escalera: ['¿Con cuál oración podés imaginarte el mercado?', 'Buscá la que tiene más palabras que dicen cómo es.', 'Ejemplo resuelto: “El parque es amplio, fresco y verde” tiene 3 adjetivos. ¿Cuál se le parece?'] }
      ]
    }
  };
  // Misiones sin guion propio: usan una pregunta genérica por materia
  const GEN = {
    mat: { q: '¿Cuánto es 7 × 3?', ops: ['21', '24', '18'], ok: 0, mal: { 1: '24 es 8 × 3.', 2: '18 es 6 × 3.' }, escalera: ['¿Cuánto es 3 + 3 + 3 + 3 + 3 + 3 + 3?', 'Contá de 3 en 3, siete veces.', 'Ejemplo: 5 × 3 = 3+3+3+3+3 = 15. Seguí dos veces más.'] },
    len: { q: '¿Cuál palabra describe cómo es algo?', ops: ['colorido', 'corre', 'ayer'], ok: 0, mal: { 1: 'Es una acción.', 2: 'Dice cuándo.' }, escalera: ['¿Cuál te dice cómo es una cosa?', 'Probá decir “el mercado es …”.', 'Ejemplo: “la casa es blanca” → blanca describe.'] },
    cnat: { q: '¿Qué pasa con el agua cuando el sol la calienta?', ops: ['Se evapora', 'Se congela', 'Desaparece'], ok: 0, mal: { 1: 'Se congela con frío, no con calor.', 2: 'No desaparece: cambia de estado.' }, escalera: ['Acordate de la ropa mojada al sol. ¿A dónde va el agua?', 'Sube como vapor…', 'Ejemplo: la olla hirviendo larga vapor: el agua se evapora.'] },
    csoc: { q: '¿Cuántos departamentos tiene Bolivia?', ops: ['9', '7', '12'], ok: 0, mal: { 1: 'Son más: contá Santa Cruz, Beni, Pando, La Paz…', 2: 'Son menos de 12.' }, escalera: ['¿Cuáles conocés? Contalos con los dedos.', 'Es un número impar, mayor que 8.', 'Ejemplo: Santa Cruz, Beni, Pando, La Paz, Oruro, Potosí, Chuquisaca, Tarija… falta uno.'] },
    ing: { q: '“I ___ my teeth every morning.”', ops: ['brush', 'sleep', 'eat'], ok: 0, mal: { 1: 'No dormís los dientes 😄', 2: 'No te comés los dientes 😄' }, escalera: ['¿Qué hacés con el cepillo de dientes?', 'Es la palabra para “cepillar”.', 'Ejemplo: “I brush my hair” = me cepillo el pelo.'] },
    art: { q: '¿Cuál es un color cálido?', ops: ['Naranja', 'Azul', 'Verde'], ok: 0, mal: { 1: 'El azul es frío, como el agua.', 2: 'El verde es más bien frío.' }, escalera: ['¿Qué colores te recuerdan al fuego?', 'Los cálidos son los del sol.', 'Ejemplo: rojo y amarillo son cálidos. ¿Cuál se les parece?'] }
  };
  const REPASO_GEN = [CONT.M1.repaso[0], CONT.M3.repaso[1]];

  // Misiones sin guion propio usan la pregunta genérica de su materia.
  function contenido(id) {
    const m = MISIONES[id];
    if (!m) return null;
    return CONT[id] || { repaso: REPASO_GEN, pasos: [GEN[m.materia]] };
  }
  const MISIONES_DEMO = { MATERIAS, MISIONES, CONT, GEN, REPASO_GEN, contenido };
  if (typeof module !== 'undefined' && module.exports) module.exports = MISIONES_DEMO;
  else raiz.MISIONES_DEMO = MISIONES_DEMO;
})(typeof window !== 'undefined' ? window : globalThis);
