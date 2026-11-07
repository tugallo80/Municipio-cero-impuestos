# Educación — visión de la interfaz (idea del dueño, 7-nov-2026)

> Idea macro. Se afina en cada sub-sesión EDU. Complementa `vision-plataforma-educativa.md`
> (arquitectura, offline, privacidad), que sigue vigente.

Educación es el **primer módulo que se pone a prueba** antes de presentar el proyecto completo.
Todo se diseña para que se pueda **demostrar** de punta a punta con datos de prueba.

## Cuatro perfiles

### 1. Tutor (profesor) — desde su laptop
- **Cronograma** del curso.
- **Pensum**: contenidos por materia (carga de PDF → la IA lo estructura).
- **Lo que toca avanzar hoy**: el plan del día según cronograma y pensum.
- **Perfil psicopedagógico** de cada alumno (estilo de aprendizaje, contexto, observaciones).
- **Rendimiento** de los alumnos (por materia, por misión, tendencias, alertas).
- **Retos / Misiones**: así se llaman las tareas. El tutor las crea y asigna; para el alumno
  son misiones dentro del juego (ver abajo).

### 2. Alumno — desde su celular o tablet
- Un **mundo 3D del colegio, estilo bloques** (inspiración: juegos tipo Roblox, pero diseño
  propio — no copiar personajes, arte ni marca de ningún juego existente).
- El edificio del colegio es el mapa: **cada materia es un aula/espacio** que muestra el avance.
- Las **tareas son misiones**; cumplirlas **habilita minijuegos** (se definen en diseño).
- El **tutor IA** acompaña dentro del juego: guía con preguntas y pistas, no da la respuesta.
- 3D para la prueba: modelo genérico descargado (libre de derechos) o diseñado/mejorado en
  **Blender con Claude a cargo** (Blender corre en la sesión en la nube, sin PC del dueño).

### 3. Padres
Solo consulta (no editan contenidos):
- Cronogramas.
- **Avance en tiempo real** de sus hijos: tareas/misiones, exámenes, pendientes.
- Reportes.
- Permisos (solicitar/autorizar).
- Pagos.
- Libretas (boletines de notas).

### 4. Dirección y administración del colegio
- Resumen del estado de **cada curso**.
- **Finanzas** del colegio.
- **Cronograma educativo** y **planificación**.
- **Ayuda para el registro de notas** de los alumnos en el sistema del Estado (RUDE / SIE):
  preparar las notas en el formato que pide el Ministerio. No se conecta directo al sistema
  del Estado; genera lo necesario para cargarlo.

## Principios para la prueba
- Primero una **maqueta navegable** de los 4 perfiles, para validar con el dueño antes de programar.
- Datos de demo de un colegio ficticio. Nunca datos reales de menores en la demo.
- Tutor y padres: web (laptop / celular). Alumno: app web instalable (PWA) que corre el 3D en el
  navegador del celular o tablet.
- Diseño ÑANDÉ para tutor, padres y dirección. El mundo del alumno tiene su propia estética de
  juego, con el verde ÑANDÉ como color de acento.
