# EDU.06d — Modo directo de tareas

## Objetivo

Los alumnos no siempre quieren jugar o están apurados. Además del juego, un **modo directo**: solo
las tareas del profe, sin el mundo 3D. Es prioritario para la reunión del dueño con el profe.

Rama `sesion/pantalla-edu-06d`: publica solo en su canal de vista previa.

## Qué hay

- **Dos opciones grandes** en la pantalla de inicio del juego: **🎮 Jugar** y **📋 Ir directo a mis
  tareas**. También está en la 🎒 Mochila, dentro del juego.
- **Página propia** `/maqueta/tareas/` (`educacion/maqueta/tareas.html`), en vertical (no fuerza la
  horizontal) y en PC (centrada):
  - resumen: para hoy, pendientes y hechas;
  - filtro por materia;
  - secciones "Para hoy", "Pendientes" y "Hechas";
  - cada tarea muestra materia, fecha ("para hoy", "para mañana", "para el viernes 13"), estado,
    si da llave, y de dónde vino: 🧑‍🏫 "la dejó la profe en la clase del lunes", 🗓️ "del cronograma
    de Lenguaje", ✨ "sugerida por la mentora del profe".
  - En celular, el texto va arriba y el botón "Hacer" abajo, a todo el ancho.
- **Resolver una tarea**:
  - **misión**: repaso y pasos con opciones, explicación cuando se equivoca y barra de avance;
  - **texto**: escribir con un mínimo de letras;
  - **foto**: sacar o elegir foto del cuaderno o del trabajo (en la demo queda en el celular).
- **Ayuda de los profes IA**, sin dar la respuesta:
  - **pistas en escalera** en texto: 🤔 "No entiendo" → 💬 pregunta guía, 💡 pista y 📝 ejemplo;
  - si el servidor de voz está, el botón **🎙️ Preguntarle a la profe Taji / al profe Jochi** usa el
    mismo módulo de voz del juego, con el contexto de la tarea: materia, misión, paso y peldaño.
- **Cuenta igual que en el juego**:
  - lo hecho se guarda en el celular (`alumno-tareas-hechas`);
  - al abrir el juego, esas misiones quedan hechas, con su llave, el avance de la materia, el
    puente o zoológico "entre todos", y el **desbloqueo de los minijuegos de la materia y de la
    cancha**;
  - las tareas que no son misiones (cuaderno, texto, foto) también desbloquean su materia y suman
    avance;
  - al revés, lo que se completa en el juego aparece hecho en la lista.

## Formato común de "tarea" (para EDU.04f, que las genera del lado del profe)

En `educacion/maqueta/tareas-demo.js`:

```
{
  id, curso, materia,            // 'mat' | 'len' | 'cnat' | 'csoc' | 'ing' | 'art'
  titulo, consigna,
  tipo,                          // 'mision' | 'opciones' | 'respuesta' | 'texto' | 'foto'
  mision?,                       // si tipo = 'mision': id del contenido en misiones-demo.js
  preguntas?,                    // [{ q, ops, ok, mal, escalera: [guía, pista, ejemplo] }]
  escalera?,                     // pistas para texto o foto
  minimo?,                       // letras mínimas (texto)
  vence, creada,                 // 'AAAA-MM-DD'
  origen: { tipo, texto },       // tipo: 'clase' | 'cronograma' | 'mentora' | 'profe'
  premio?: { llave },
  estado                         // 'pendiente' | 'hecha'
}
```

- Sin nombres reales: solo curso y materia.
- La página lee las tareas, en este orden:
  1. `window.TAREAS_PROFE`, si EDU.04f lo carga;
  2. `localStorage['nande-tareas-profe']`, un array en este formato;
  3. la demo (`window.TAREAS_DEMO`, con fechas armadas desde hoy para que nunca aparezcan vencidas
     en una presentación).
- Le mandé este formato a la sesión EDU.04f para coordinar. **Pendiente**: que las tareas que salen
  de la clase grabada (`p.tareas` = `{ descripcion, para }`) se conviertan a este formato y se
  guarden donde las lea el alumno, en la base, cuando haya cuentas reales (EDU.03).

## Acuerdo con EDU.04f (respuesta del 11/11)

- **Leer las tareas**: EDU.04f publica la Function `eduTareas`. El alumno logueado llama a
  `eduTareas({ accion: 'mias' })` y recibe `{ ok, tareas, hoy }`.
- **Formato de EDU.04f**:

  ```
  { id, curso, materia, titulo, consigna,
    tipo: practica | lectura | investigacion | proyecto | mision,
    entrega, variante, textoVariante, criterios, puntos, autoevaluacion,
    origen: { tipo, tema }, enviada }
  ```

  Se usa tal cual. `window.adaptarTareaProfe()` (en `tareas-demo.js`) lo pasa a esta pantalla:
  - se muestra `textoVariante`;
  - el origen dice "la dejó el profe el martes (clase de …)" o "del cronograma: …";
  - "Qué se mira" sale de `criterios`;
  - las caritas de autoevaluación aparecen al terminar;
  - la lectura se completa con "✅ La hice";
  - práctica → texto y proyecto → foto, salvo que venga `como`.
- **Pedidos a EDU.04f**:
  - acción `marcar` (`{ id, estado: 'hecha' | 'entregada', texto? }`; sin fotos hasta que haya
    permisos y Storage);
  - que `mias` traiga el estado de cada tarea;
  - campos opcionales `como`, `pistas` (la escalera) y `mision`.
- **Pendiente**: cuando la Function esté publicada y haya una cuenta de prueba de alumno, llamarla
  desde `/maqueta/tareas/`. Hoy la página lee `window.TAREAS_PROFE` o
  `localStorage['nande-tareas-profe']` y, si no hay nada, la demo.
- **Probado**: tareas en el formato de EDU.04f, cargadas por `localStorage` (Música con criterios y
  autoevaluación; Lenguaje de lectura), se listan, se completan y muestran las caritas. Sin errores.

## Probado (Playwright)

- En 390×844 y 1280×800:
  - lista sin desbordes y filtro por materia;
  - misión M1 completa: respuesta mal con explicación, pistas en escalera y respuestas bien hasta
    "¡Tarea hecha!";
  - tarea de texto y tarea de foto;
  - el resumen se actualiza.
- En la configuración real de Firebase (`cleanUrls`): al abrir el juego después, M1 está hecha, con
  la llave del Parque, y Mate, Lenguaje, Artes y la cancha están desbloqueados.
- El botón "📋 Ir directo a mis tareas" se ve en el inicio del juego, también en vertical.
- Sin errores.

## Pendiente

- Conectar con las tareas reales del profe (EDU.04f) y guardarlas en la base (EDU.03), en lugar del
  celular.
- Subir la foto de verdad (Storage) cuando haya cuentas reales, con permisos de menores.
