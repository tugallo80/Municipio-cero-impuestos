# EDU.01 — Maqueta navegable de los 4 perfiles

## Objetivo
Una maqueta que el dueño recorre desde el celular para validar la idea **antes de programar**:
los 4 perfiles (tutor, alumno, padres, dirección) con sus pantallas principales, datos de un
colegio ficticio y navegación real entre pantallas. Sin backend, sin login real.

## Antes de empezar
- Leer `CLAUDE.md`, `docs/plan-maestro.md`, `docs/educacion/vision-interfaz.md` y
  `docs/educacion/vision-plataforma-educativa.md`.
- Puede correr en paralelo con INF.01. El link de vista previa llega cuando INF.01 esté mergeada;
  mientras tanto, mostrar capturas (Playwright, ancho celular 390 px y laptop 1366 px).

## Tareas
1. Carpeta `educacion/maqueta/` con HTML/CSS/JS estático (sin build), diseño ÑANDÉ.
2. Pantalla de entrada: "¿Quién sos?" → Tutor · Alumno · Padres · Dirección.
3. **Tutor** (pensada para laptop, que no se rompa en celular):
   - Hoy: lo que toca avanzar, por materia.
   - Cronograma (semana/mes) y pensum por materia.
   - Lista de alumnos → ficha con perfil psicopedagógico y rendimiento.
   - Retos/Misiones: lista, crear misión (formulario simulado), asignar a curso/alumno.
4. **Alumno** (celular/tablet):
   - Mundo del colegio en 3D estilo bloques: para la maqueta, una escena simple en el navegador
     (three.js) con el edificio hecho de cubos, aulas por materia con su avance encima, y
     movimiento táctil básico. Diseño propio, sin arte de juegos existentes.
   - Al tocar un aula: misiones de esa materia → una misión → "minijuego desbloqueado"
     (pantalla de ejemplo) → tutor IA (burbuja de chat simulada).
5. **Padres** (celular): hijo/a → avance en tiempo real (simulado), cronograma, reportes,
   permisos, pagos, libreta.
6. **Dirección** (laptop): resumen por curso, finanzas, cronograma educativo, planificación,
   ayuda de notas RUDE (tabla de notas + botón "preparar archivo" simulado).
7. Datos de demo en un solo archivo `educacion/maqueta/datos-demo.js` (colegio, 2 cursos,
   6 materias, 8 alumnos con nombres inventados, misiones, notas).
8. Enlace "Educación (maqueta)" en el Hub, sin cambiar el diseño del Hub.

## Hecho cuando
- El dueño entra desde el celular, elige cada perfil y recorre sus pantallas sin callejones sin salida.
- El mundo 3D se mueve fluido en un celular de gama media.
- Lista de preguntas/decisiones abiertas para el dueño al final del PR (qué minijuegos, qué
  estética del mundo, qué datos ve cada perfil).

## Cierre

**Hecho (7-nov-2026)** — rama `sesion/edu-01`.
- `educacion/maqueta/`: `index.html` (¿Quién sos?), `tutor.html`, `alumno.html`, `padres.html`,
  `direccion.html`, `estilos.css`, `comun.js`, `datos-demo.js` (todos los datos inventados en un solo archivo).
- Alumno: mundo 3D con three.js `0.160.0` desde cdnjs (si falla, prueba jsDelivr; sin internet muestra
  una lista 2D de aulas). 6 aulas con cartel de avance, personaje propio de bloques, joystick táctil y
  teclado, tocar un aula la abre. Flujo: aula → misión → pregunta → tutor IA (Kay, solo pistas) →
  minijuego desbloqueado (ejemplo: pizza de fracciones).
- Enlace "Educación (maqueta)" en el Hub (`index.html`), debajo de "Panel Municipal".
- Capturas: `docs/educacion/capturas-maqueta/` (celular 390×844 y laptop 1366×768).

**Notas técnicas**
- Desde el contenedor de Claude los CDN están bloqueados: las capturas se sacaron sirviendo three.js
  y las fuentes desde npm con Playwright. En el celular del dueño cargan desde el CDN normal.
- Rendimiento: suelo en una sola malla instanciada, sin sombras reales, resolución máx. 1,75×.
  Falta probarlo en un celular de gama media real cuando haya link de vista previa (INF.01).
- La tabla de notas RUDE usa las dimensiones Ser/Saber/Hacer/Decidir/Autoevaluación como ejemplo;
  el formato oficial del SIE se valida en EDU.10.

**Decisiones abiertas para el dueño**
1. **Minijuegos**: ¿qué 2–3 hacemos primero? Propuestos: pizza de fracciones (Mate), sopa de
   adjetivos (Lenguaje), ruta del agua (Ciencias), mapa armable de Bolivia (Sociales), memoria de palabras (Inglés).
2. **Estética del mundo**: ¿día soleado y colores vivos como ahora, o algo más cruceño (palmeras,
   tajibos, plaza con bancos de colegio real)? ¿Personaje fijo o que cada alumno lo arme?
3. **Qué ve cada perfil**: ¿los padres ven el perfil psicopedagógico o solo notas y avance?
   ¿Dirección ve el detalle por alumno o solo resúmenes por curso?
4. **Tutor IA**: ¿se llama Kay también para los alumnos? ¿Voz desde el inicio o solo texto?
5. **Pagos**: ¿los padres pueden pagar con créditos ÑANDÉ (reciclaje/solar) además de QR?
