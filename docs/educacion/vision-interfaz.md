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

## Decisiones del dueño tras la maqueta EDU.01 (7-nov-2026)

- **Educación es una app aparte**, no enlazada al Hub del municipio.
- **Minijuegos**: hacer **2** para probar. Después de tener una maqueta funcional, el dueño
  escribe un guion de cómo se los imagina.
- **Estilo del mundo**: el de la maqueta sirve para probar; no es el final. Se diseña a detalle después.
- **Padres SÍ ven el perfil psicopedagógico** de sus hijos. Es un punto central: ayuda a los
  padres a entender cómo aprende su hijo. Cada niño entiende de forma distinta; la plataforma
  personaliza el estudio para cada uno, para que el nivel de aprendizaje supere al actual.
  - Cuidado al implementarlo (EDU.03/EDU.09): lenguaje positivo y orientado a cómo ayudar, sin
    etiquetas ni diagnósticos; consentimiento de los padres; el perfil nunca va con el nombre
    real a la IA; solo los padres del alumno, su tutor y quien autorice la dirección lo ven.
- **Tutor de los chicos**: con **voz** desde el principio. Nombre provisional **Kay** (puede cambiar).
- **Educación pública gratuita**: sin pagos para alumnos ni familias (ni dinero, ni QR, ni
  créditos). La sección "Pagos" de padres no va en la versión pública; podría existir en una
  versión para colegios privados. El municipio entregaría una tablet por alumno con textos y
  cuadernos (ver `docs/vision-modelo-economico.md`).
- Pendiente: qué ve la dirección (detalle por alumno o solo resúmenes).

## Personalidad y voz del tutor (7-nov-2026)

- Demo piloto: **IA conversacional en vivo por voz** (motor Kay / Gemini Live).
- Tono **camba**: confiable, agradable, que se note que sabe mucho pero amigable y algo gracioso,
  con el cantito y la calidez cruceña.
- **Personaje original.** No imitar ni clonar la voz o identidad de ninguna persona real (el dueño
  pensó en Percy Fernández como inspiración de carisma; se descartó copiarlo por derechos de su
  familia, por ser figura política en un producto para escuelas públicas, y porque Gemini Live
  usa voces predefinidas, no clonadas). Si en el futuro se quisiera una referencia a una persona
  real, solo con autorización escrita de sus herederos y evaluación del riesgo político.
- Nombre provisional: Kay (puede cambiar).

## Revisión de la maqueta por el dueño (8-nov-2026)

- La maqueta está bien y el mundo 3D se mueve **fluido** en su celular. El diseño final cambiará.
- **Foco ahora: la experiencia del alumno.** Tutor, padres y dirección son más técnicos e
  informativos; se trabajan después.
- **Comunidad**: los compañeros del curso se encuentran en el mismo mundo, ven los retos de los
  demás y quieren superarse → efecto comunitario y "viral" como Roblox/Minecraft (con seguridad).
- **Duda abierta**: ¿el mundo debe ser el colegio ("salen del colegio y entran a otro colegio")
  o algo fantástico, su casa, su barrio, o un mundo que crean ellos? → investigar y hacer un
  **focus group con niños** antes de decidir.
- **Minijuegos y recompensas**: no solo "un reto después del juego". Vencer un reto da acceso a
  **lugares especiales o "prohibidos"** (ej.: un parque solo para quienes vencieron el reto, el
  cuarto de objetos perdidos). El dueño escribirá el guion.
- Investigación en curso (psicología infantil, por qué enganchan Roblox/Minecraft, escenario del
  mundo + protocolo de focus group, mundo compartido seguro) →
  `docs/investigacion/experiencia-del-alumno.md`.

## Prueba de voz del dueño (8-nov-2026)

- Probó a Kay por voz en `/prueba-motor/`: "está bastante bien".
- **Dos voces candidatas**: femenina **Sulafat** (la que más le gusta) y masculina a elegir entre
  **Achird** y **Sadaltager**.
- Idea: tener **las dos voces**. Duda: ¿los niños confían más en una voz femenina o masculina, y
  las niñas? → investigación en curso (`docs/investigacion/voz-del-tutor.md`); probar también en
  los talleres con niños.
- Con la cuenta de prueba llegó al límite de **8 charlas por día**.
