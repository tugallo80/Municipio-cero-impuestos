# EDU.17 — App del alumno completa

## Objetivo

La app del alumno no es solo el juego: **el centro es el alumno**. Es una app con barra de
navegación (celular vertical, tablet y PC) con seis secciones: **Hoy**, **Agenda**, **Mis textos**,
**Mis tareas**, **Mi tutor** y **Mundo** (el juego).

- Rama `sesion/pantalla-edu-17`: publica solo en su canal de vista previa, sin Functions.
- El backend, el modo demo sin login (EDU.15) y el tutor 24/7 (EDU.16) los hace la sesión
  `session_01Jdt98bSsn1vo2pkQFemAsC`.

## Cómo está armada

- **Barra compartida** (`educacion/maqueta/estudiante.js`):
  - abajo en celular y tablet parada; a la izquierda en tablet acostada y PC (≥ 1000 px);
  - botones grandes;
  - también tiene ayudas comunes: fechas, horario del día, días sin clase según el calendario por
    capas de EDU.04b y materias.
- **Páginas**:

  | Sección | Dirección |
  |---|---|
  | Hoy | `/maqueta/hoy/` |
  | Agenda | `/maqueta/agenda/` |
  | Mis textos | `/maqueta/textos/` |
  | Mis tareas | `/maqueta/tareas/` (la de EDU.06d, ahora con la barra) |
  | Mi tutor | `/maqueta/mi-tutor/` |
  | Mundo | `/maqueta/alumno/` |
- **Selector de perfiles**: "Alumno" abre la app (Hoy). Además está **🌎 Ir directo al mundo**, para
  la demo rápida del juego.
- **Datos demo** (`estudiante-demo.js`, `window.ESTUDIANTE_DEMO`), sin nombres reales:
  - alumno de 2.º de secundaria;
  - el horario es el mismo del cronograma del profe para 2.º;
  - horas, materias con su profe IA, qué llevar por materia, avisos para la casa, exámenes y
    actos, y tareas en el formato común (EDU.06d/EDU.04f).
  - Las fechas se arman desde hoy, así la demo siempre se ve al día.
  - Si EDU.15 publica su alumno demo, se usa ese con los mismos campos.

## Parte 1 — Hoy

- Saludo y fecha.
- **Clases de hoy** según el horario, con "Ahora" en la que está en curso y el recreo. Si es
  feriado, fin de semana o vacaciones (calendario por capas), lo dice, junto con la próxima clase.
- **Tareas para hoy y mañana**, con acceso a todas.
- **Qué llevar** al próximo día de clase: por las materias de ese día, lo que hay que entregar y
  los exámenes.
- **Se viene**: exámenes, actos y reuniones de los próximos 10 días.
- **Avisos para la casa**.
- Atajos a "Seguir leyendo" y al mundo.

## Parte 2 — Agenda

- **Semana** (lunes a viernes) y **mes**, con flechas, botón "Hoy" y el día de hoy marcado.
- **Capas que se prenden y apagan**:
  - clases (en grupos: "Mate ×2");
  - tareas y entregas (tocarlas abre la tarea);
  - exámenes;
  - feriados y días sin clase, más los días con menos horas: todo sale del **calendario por capas
    de EDU.04b** (`calendario.js`, nacional → departamento → distrito);
  - actos y avisos.
- **En el mes**: puntos de color por capa; los días sin clase van en ámbar; tocar un día muestra su
  detalle abajo.
- **Probado** en 390, 820 y 1280:
  - semana con 5 días;
  - en junio de 2026 marca Corpus Christi y el Año Nuevo Andino Amazónico (22 de junio);
  - las capas se apagan;
  - sin desbordes.

## Parte 3 — Mis textos (`/maqueta/textos/`)

- Los textos oficiales 2025 de 2.º de secundaria, armados una sola vez con
  `educacion/tools/datos/armar-textos.mjs` → `educacion/maqueta/textos/<área>.json` + `indice.json`.
  Se carga solo el área que se abre.
- **Áreas** con sus unidades por trimestre. **"📍 El curso va acá"**: el reparto del cronograma
  (`calendario.js` de EDU.04b sobre el plan de ejemplo de 2.º). Si el plan no cubre el trimestre
  actual, se estima por la fecha dentro del trimestre.
- **Lector**: letra A−/A+, modo claro u oscuro (se guardan en el celular), anterior/siguiente.
  **"Seguir leyendo"** se guarda y aparece en Mis textos y en Hoy.
- **Buscador** en un área o en todos los textos; resalta la palabra y salta al párrafo.
- **Honesto con lo que falta**:
  - libros de área (Inglés, Filosofía, Artes, Música, Valores): todas las unidades con texto;
  - texto general: Lenguaje 19 de 20 unidades, Matemática solo 2 de 10, Biología y Sociales
    solo el índice. Cada área lo avisa y cada unidad vacía dice "Solo en el índice".
  - El texto sale de los PDF: algunas columnas o ejercicios se ven simples o mezclados.
- **Probado** en 390, 820 y 1280: inicio, área, lector, unidad sin texto y búsqueda; sin desbordes
  ni errores.

### Pendiente
- Volver a extraer Biología, Sociales y el resto de Matemática cuando haya un PDF mejor del texto
  general.

## Parte 4 — Mi tutor (`/maqueta/mi-tutor/`)

- **Lugar fijo** para el tutor de EDU.16: la página carga `/voz/tutor.js` y, si existe, llama a
  `NandeTutor.montar(elemento, { curso, materia, tarea })`. Si el objeto que devuelve tiene
  `actualizar(contexto)`, se lo llama cuando el alumno cambia de tema.
- **"¿De qué querés hablar?"**: las tareas pendientes y las materias del alumno (por defecto, la
  primera clase de hoy). También acepta `?tarea=<id>` o `?materia=<id>` en el enlace.
- **Mientras EDU.16 no está**: los profes de voz que ya existen (`/voz/profes.js`, EDU.02b), con el
  tema elegido como contexto. Sin servidor de voz, los botones dicen "Todavía no disponible" y se
  avisa que el chat del tutor llega pronto.
- **Probado** en 390, 820 y 1280, sin tutor y con un tutor simulado; sin desbordes ni errores.

## Curso real del piloto (pedido del dueño)

- La demo es **el curso real del profe del piloto**: U.E. Nuevo Horizonte, 2.º de secundaria,
  gestión 2026 (hoy, 3.er trimestre). El alumno sigue ficticio ("Jaguar Azul 7").
- **Tareas y exámenes** van sobre las unidades del 3.er trimestre de sus textos: cuerpos geométricos,
  diptongos e hiatos, biomas de Bolivia, música y deportes en inglés, rebeliones indígenas,
  calentamiento vocal.
- **Hoy** muestra, debajo de cada clase, el tema real que toca ("📖 …"), con enlace al texto.
  El cálculo de "dónde va el curso" ahora es común (`EST.dondeVa()` en `estudiante.js`).
- **Fuente única con EDU.15/EDU.04f**: van a generar `estudiante-demo.js` desde
  `tools/datos/estudiante-demo.json`. `estudiante.js` ya acepta su formato (horario y "qué llevar"
  como listas, eventos `entrega`). Campos de más que usa la app: `materias` (nombre, icono, color,
  profe), `colegio`, `cursoNombre`, `distrito`, `horas`, `recreo`, `tareas`.

### Pendiente
- Cambiar al `estudiante-demo.js` de EDU.15 cuando lo publique.
- El selector de perfiles todavía dice "U.E. Arcoíris del Sur · colegio ficticio" (lo usan el profe y
  la dirección): pasarlo al curso real junto con EDU.15.
- **Nombre del profe: nunca en el repo.** `estudiante.js` lo lee del link de la presentación
  (`?profe=…&apodo=…`), lo guarda en el equipo (`localStorage 'nande-profe'`) y lo usa en Hoy, en las
  tareas ("La dejó … en la clase del miércoles") y en las materias. Si no hay, dice "tu profe".
  Los datos usan el marcador `{profe}`. Tampoco se manda a la IA.
- Si la fuente de EDU.15 trae `temasHoy`, Hoy usa ese título; si trae `DEMO_PILOTO.materiasProfe`,
  el nombre va solo en esas materias.

## Fuente única ya adoptada (12/11)

- `maqueta/estudiante-demo.js` es **el mismo archivo que genera EDU.15** (PR #37, desde
  `tools/datos/demo-piloto.json`): copiado tal cual para que no haya conflicto al mergear.
- Lo que suma EDU.17 va aparte, en `maqueta/tareas-curso-demo.js` (`window.EDU17_EXTRA`): tareas y
  exámenes de Mate, Lenguaje, Biología, Sociales y Música sobre unidades reales del 3.er trimestre,
  y qué llevar según la materia. Las tareas de EDU.15 (Inglés y Filosofía, las del servidor) vienen en
  formato del servidor y se adaptan con `adaptarTareaProfe`.
- `estudiante.js` acepta días con número (1 = lunes) y pasa el profe IA (Taji/Jochi) a `profeIA`.
- **Profe**: el alumno ve el **apodo** (`?profeApodo=` → `nande-profe-apodo`, ej. "el Profe …"); si no hay,
  el nombre formal (`?profe=` → `nande-profe`); si no hay nada, "tu profe".
- **Alumno**: si la presentación guardó un apodo en `nande-apodo`, se usa en vez de "Jaguar Azul 7".

## EDU.17b — Salidas sin caer en el selector (rama `sesion/pantalla-edu-17b`)

Problema que encontró el dueño en la presentación: al salir del mundo (✕ / Salir) iba a "¿Quién sos?".

- Nuevo `maqueta/salida.js` (en todas las páginas de la maqueta):
  - la app del alumno recuerda su última página (`sessionStorage 'nande-volver-alumno'`);
  - **✕ del mundo** → vuelve a esa página de la app (o a Hoy). Vuelve al selector **solo** si se
    entró con "🌎 Ir directo al mundo" (`?desde=selector`) y no está dentro de la presentación;
  - **dentro de la presentación (iframe)**: el "←" de Hoy y del panel del profe, padres y dirección
    se oculta; si algo llega al selector, vuelve solo a la app del alumno;
  - en la presentación o en modo demo se oculta "← Volver al Hub ÑANDÉ".
- Mis tareas: "←" ahora vuelve a Hoy (es parte de la app).
- Pie del selector: "Curso del piloto · alumnos ficticios".
- Probado en 390×844, 844×390 y 1280×800: app → mundo → ✕ vuelve a la página de la app; selector →
  mundo → ✕ vuelve al selector; dentro de un iframe en `/presentacion/`, el juego vuelve a Hoy, el
  selector redirige a Hoy y ningún "←" lleva al selector.

### EDU.17b — Mis textos como libro real (pedido del dueño)

- **Libros de área (Inglés, Filosofía, Artes, Música, Valores): las páginas reales del PDF** en
  imagen (`datos/textos-oficiales/2do-secundaria/paginas/<área>/NNN.webp`, traídas de `maestra-2`;
  el build las copia a `/maqueta/textos/paginas/`). Se ve el libro tal cual, con sus dibujos y tablas.
  Por qué: es fiel al texto que usa el profe y evita las columnas mezcladas de la extracción.
- **Texto general (Lengua, Mate, Bio-Geo, Sociales)**: no hay PDF → el texto extraído, maquetado en
  hojas (letra Literata, márgenes, título del tema arriba, número de página, portada del área).
  A−/A+ vuelve a repartir el texto sin perder el lugar.
- `maqueta/libro.js`: hojas con **vuelta de página en CSS 3D** (curvatura, luz y sombra) que sigue al
  dedo o al mouse; tocar el borde, flechas del teclado y botones ‹ › chicos. **Doble página** si
  entra a lo ancho (tablet acostada, PC), una en celular parado. Con "reducir movimiento" o equipo
  lento: deslizamiento simple.
- **📍 El curso va acá**: cinta verde en la primera hoja de esa unidad y botón 📍 para ir. **☰** lista
  de unidades por trimestre. **🔎** buscador: salta a la hoja (en las páginas reales avisa "está en
  esta página"; en el texto, la palabra queda resaltada). **Seguir leyendo** guarda la hoja.
  **🌙** modo noche. **🧑‍🏫** "Preguntale a tu tutor sobre esta página" →
  `/maqueta/mi-tutor/?materia=<área>&tema=<temaId>&pagina=<n>` (acordado con EDU.16).
- `armar-textos.mjs` ahora guarda, en los libros de área, la hoja de inicio de cada unidad y la hoja
  de cada párrafo (`hoja`, `hojaFin`, `ph`), para el buscador y la cinta.
- Probado en 820×1180, 1180×820, 390×844 y 1280×800, y dentro del marco tablet de la presentación:
  sin desbordes, ninguna hoja de texto cortada, sin errores.
- **Pantalla completa** (botón ⛶): solo el libro, ocupando todo (usa la pantalla completa del equipo
  si se puede). Un toque al centro muestra ✕, 📍, ‹ ›, 🌙 y el tema; se esconden solos a los 3 s.
  Esc o ✕ vuelve.
- **Más realismo**: tapa detrás de las hojas (color del área, un poco más grande, lomo al centro y
  sombra sobre la mesa); canto de las hojas a cada lado, más grueso del lado con más páginas; sombra
  hacia el lomo; textura sutil de papel; fondo de escritorio oscuro.
- Celular acostado: mientras se lee se esconden el encabezado y la barra de abajo (la barra del libro
  trae "←"), para que el libro abierto se vea más grande.
- Probado en 820×1180, 1180×820, 844×390, 390×844, 1280×800 y 1920×1080, y en la presentación con
  los 4 marcos (celular, horizontal, tablet, completa): sin desbordes ni errores.
