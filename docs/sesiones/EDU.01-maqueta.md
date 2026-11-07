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
(pendientes de la sesión)
