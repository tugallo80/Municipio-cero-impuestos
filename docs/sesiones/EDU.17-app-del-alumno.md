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
