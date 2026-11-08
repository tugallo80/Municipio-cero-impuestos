# EDU.01b — Láminas de mundos y maqueta del alumno v2

Rama: `sesion/edu-01b` (parte de `sesion/edu-01`, PR #2, + rama de la maestra).

## Objetivo

1. **Material para los talleres con niños** (`docs/educacion/protocolo-focus-group.md`): láminas A3
   de los 4 mundos (A colegio mágico · B Selva/Isla Ñandé · C mi barrio en bloques · D mundo que
   construye el curso), cartas con íconos de la sesión 2 y viñetas para completar. Listas para
   imprimir (PDF y PNG) y para ver en el celular.
2. **Maqueta del alumno v2** (`educacion/maqueta/`) con las recomendaciones de
   `docs/investigacion/experiencia-del-alumno.md`: misión → llave → lugar, lugares con niebla,
   lugar que abre todo el curso, casa propia visitable, frases y emotes predefinidos, pedir ayuda,
   repaso al inicio, pistas en escalera, cierre natural, 2 minijuegos, sin ranking ni rachas.
3. Perfil psicopedagógico sin "estilo de aprendizaje" (tutor y padres); padres sin "Pagos".

## Antes de empezar

- Leer `CLAUDE.md`, `docs/plan-maestro.md`, `docs/educacion/vision-interfaz.md`,
  `docs/investigacion/experiencia-del-alumno.md` y `docs/educacion/protocolo-focus-group.md`.

## Tareas

1. Generador de láminas en `tools/talleres/` (escenas three.js de bloques, diseño propio,
   capturadas con Playwright). Salida en `docs/educacion/talleres/` + `README.md` de impresión
   + `index.html` para verlas en el celular.
2. Láminas A–D (una por concepto, imagen grande + título corto), cartas (7 mecánicas + 1 en
   blanco) y viñetas para completar.
3. Maqueta del alumno v2 (`alumno.html`): todo lo de arriba, fluido en gama media.
4. Tutor y padres: perfil nuevo (nivel por tema, errores frecuentes, ritmo, intereses,
   accesibilidad indicada por docente/profesional); padres con lenguaje positivo y "cómo
   ayudarlo en casa"; quitar Pagos.
5. Publicar las láminas en la vista previa (`scripts/build-site.sh`).
6. PR único contra `main`, verificar el canal de vista previa por la API de Firebase Hosting.

## Hecho cuando

- Desde el celular se abren la maqueta v2 y la página de láminas en el link de vista previa.
- Los PDF A3 se descargan e imprimen sin cortes.
- En la maqueta: hacer una misión con repaso → pistas en escalera → llave → abrir un lugar con
  niebla; aportar a la barra del curso; visitar la casa de un compañero y reaccionar; pedir ayuda.
- No queda ningún ranking individual, "estilo de aprendizaje" ni "Pagos".

## Cierre

_(se completa al terminar)_
