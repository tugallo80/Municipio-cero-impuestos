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

## Dos tutores con personalidad: "la profe" y "el profe" (dueño, 8-nov-2026)

- No es "una voz": son **dos personalidades (arquetipos)**. Voz femenina **Sulafat** → *la profe*;
  voz masculina **Achird** → *el profe* (en Santa Cruz a los docentes se les dice "profe").
  Nombres propios a definir.
- **Ambos siempre disponibles.** No se obliga a elegir al empezar: el niño llama al que quiere
  ("quiero hacer la tarea con la profe") y puede preferir uno por materia.
- **Interfaz**: no un botón verde; la idea es que **toda la pantalla lata, como una boca que
  habla**. Se afina después.
- **Más adelante**: si el municipio lanza el proyecto, habrá una etapa de concientización sobre la
  entrada de la IA a la educación (publicidad, socialización, **acciones BTL en colegios**), y los
  dos tutores se **personificarán físicamente** como personajes.

Criterios para diseñarlos (de `docs/investigacion/voz-del-tutor.md` y `experiencia-del-alumno.md`):
- **Mismo nivel de calidez y de saber** en los dos; ninguno es "el sabio" ni "la tierna".
- **Ninguna materia asignada por defecto** a uno u otro (nada de "el profe para matemática, la
  profe para lenguaje"); la preferencia por materia la decide el niño.
- **Memoria compartida**: los dos ven el mismo progreso del alumno; cambiar de profe no reinicia nada.
- **Siempre dicen que son una IA** (UNESCO); importante sobre todo cuando haya personajes físicos
  en colegios, para que los niños no los confundan con personas.
- Medir en el piloto: con quién habla cada niño, por materia y edad, y si cambiar de profe ayuda o distrae.

## Ajuste del habla camba (dueño escuchó las voces, 8-nov-2026)

Las voces están bien, pero **mezclan camba con neutro**. Para afinar la personalidad:
- **Terminaciones**: el camba aspira la "s" final y antes de consonante, suena como una "j" suave
  ("loj chicoj", "ejtá", "ej") — no la "s" neutra.
- **Vocabulario camba** que debe aparecer con naturalidad:
  - "**belleza**" en vez de "lindo" ("¡belleza, lo lograste!").
  - "**la tuti**" cuando algo está muy bueno.
  - "**mucha dosis**" cuando algo es de buen nivel.
  - "**otro level**" como elogio.
- Se sigue ajustando con el dueño. Limitación técnica a probar: las voces de Gemini se guían por
  instrucciones; la aspiración de la "s" puede lograrse solo en parte.

## Los profes dentro del mundo (dueño, 8-nov-2026)

- El tutor de voz vive **dentro del mundo del niño**: no debe tapar ni cortar la interfaz del juego.
- Se nota que está acompañando con un **detalle**: un **marco que palpita** alrededor de la pantalla,
  o una **base/niebla luminosa abajo que se mueve con el sonido** (tipo la franja de voz de los
  autos Tesla), sin salirse de su espacio.
- Reemplaza la idea anterior de "toda la pantalla latiendo como una boca".

## Idea del mundo: "Mi colegio en Santa Cruz" — mundo abierto (dueño, 8-nov-2026)

- Cada colegio tiene su terreno **geoubicado** en un mapa de Santa Cruz (por anillos y zonas). El
  resto, salvo hitos, es baldío o bosque.
- Los alumnos **construyen su escuela** (tipo Roblox/Minecraft) con **recursos limitados**: la
  **única moneda es hacer (y rehacer) los deberes** → monedas del juego → ladrillos.
- **Red social entre colegios del mismo nivel**: se visitan entre sí; un regulador (IA + docente)
  previene bullying.
- **Competencia entre colegios**: quién "termina mejor su escuela" en el año.
- **Acceso verificado**: RUDE + carnet + aval del director → solo estudiantes reales.
- Visión del dueño: "un mundo abierto donde la moneda es el conocimiento", con los límites y
  restricciones de ingreso necesarios. (Evitar la palabra "GTA" en presentaciones.)

Respuesta de la MAESTRA (resumen): idea fuerte — competencia **entre equipos** (colegios) con
cooperación interna, moneda = aprendizaje (mecánica integrada), construcción, identidad local,
cierre del riesgo de adultos desconocidos. Cuidar: desigualdad entre colegios (premiar mejora,
por alumno, ligas comparables, retos cooperativos), "farmeo" de monedas (pagar por dominio y
repaso, rendimientos decrecientes), moderación (frases predefinidas, IA de apoyo al docente,
revisar construcciones), escala técnica (por etapas). Se suma a los talleres como **mundo E**.

Investigación hecha → `docs/investigacion/mundo-abierto-santa-cruz.md`: economía de fichas
(tareas como moneda), competencia entre colegios y equidad, verificación de identidad de menores
en Bolivia (RUDE, carnet), factibilidad técnica en tablets.

## Evolución de la visión del mundo (dueño, 8-nov-2026)

> **"Acá no vale lo que tenés, sino lo que sabés."**

- **Primaria y secundaria.** El mundo debe servir a los dos: **estética propia ÑANDÉ** (no
  "Roblox/Minecraft"), que no resulte infantil para un adolescente ni pierda gracia para un niño.
- **Une todas las ideas anteriores**: misiones, lugares secretos, profes por voz, casa propia,
  construcción con materiales de conocimiento, mundo cerrado y seguro.
- **La magia está en los portales**: visitar otros colegios a través de portales.
- **Construir** es el reto que más le gusta al público objetivo.
- **El mapa**: la ciudad de Santa Cruz **todavía vacía**, solo con los **hitos urbanos** (el Cristo,
  la plaza 24 de Septiembre, etc.) y áreas verdes libres. Los colegios la van construyendo
  (ver "Los alumnos construyen la ciudad", abajo). *Aclaración del dueño: no se trata de talar.*
- **Evolución**: olimpiadas y retos entre colegios.
- **Conectar clases sociales**: colegios públicos, de convenio y privados en el mismo mundo,
  donde lo que cuenta es el conocimiento.

Notas de la MAESTRA:
- **Bosque**: en Santa Cruz la deforestación y los incendios son un tema sensible. Conviene que el
  bosque **no se tale**: que los colegios lo **restauren, cuiden y hagan crecer** al aprender
  (sumar árboles, fauna, río limpio). Refuerza el mensaje y conecta con el resto de ÑANDÉ.
- **Secundaria (13–17 años)** cambia la seguridad: más autonomía y más riesgos (acoso, contenido,
  contacto). Los mundos siguen separados por nivel; las reglas de comunicación se adaptan por edad.
- **Mezcla social**: para que sea justo, las ligas y premios ya miden mejora y participación (no
  recursos); los eventos cooperativos entre colegios de distinto origen (padrinos entre anillos)
  son la herramienta principal para "conectar clases sociales".
- **Estética propia**: definir una dirección de arte que escale por edad (mismo mundo, distinto
  nivel de detalle y tono de interfaz/avatares por nivel).

## Estilo que evoluciona por tramo de grados (dueño, 8-nov-2026)

- Cada tramo tiene su propia gráfica y **el mundo se transforma al pasar de curso** ("vencer el
  curso para vivir la nueva interfaz") → motivación para subir de nivel.
  - **1.º–3.º primaria**: cúbico / bloques (estilo propio).
  - **4.º–6.º primaria**: piezas redondeadas y encastrables, tipo juguete de construcción.
  - **Secundaria**: más realista / estilizado.
- Nombres propios sin marcas (ej. "Bloques", "Piezas", "Mundo real"); no copiar Minecraft, Lego
  ni Playmobil.

Notas de la MAESTRA:
- Encaja con la investigación: lo que los adolescentes rechazan es lo infantil, y aquí cada edad
  tiene lo suyo; los mundos ya están separados por nivel.
- **Repitentes**: que quedarse en un tramo no se sienta castigo (ej. el mundo igual mejora con lo
  que construyen; la transformación es un premio, no una vergüenza).
- **Costo**: tres líneas de arte. Mitigar con una base común (mismas piezas lógicas y mapa) y tres
  "pieles" de render.
- **Rendimiento**: el tramo "realista" es el más pesado; debe seguir andando en tablets baratas.
- Se prueba en EDU.01c (pedido enviado a la sub-sesión).

## Los alumnos construyen la ciudad (aclaración del dueño, 8-nov-2026)

- La ciudad empieza **vacía**, solo con hitos (el Cristo, la plaza, etc.). No hay bosque que talar.
- Cada curso **acumula capital** con sus misiones bien hechas. El docente propone, por ejemplo un
  viernes: *"esta semana juntamos un buen capital porque todos hicieron sus misiones y las hicieron
  bien, ¿qué les parece si construimos un zoológico?"*
- Los alumnos **no solo mejoran su escuela: construyen la ciudad** (zoológico, parques, hospitales,
  bibliotecas…).
- **Reto entre colegios = "envidia buena"**: quién **aporta más a la ciudad**.

Notas de la MAESTRA:
- Es un **presupuesto participativo en miniatura**: el curso decide en qué invierte lo que ganó.
  Conecta directo con la app del municipio (referéndums de obras) y forma ciudadanía desde chicos.
- Para que "aportar más" sea justo: medir el aporte **por alumno** y la **mejora**, en ligas de
  colegios comparables (ver `docs/investigacion/mundo-abierto-santa-cruz.md`).
- La decisión del curso puede ser una **votación en clase** guiada por el docente, sin premios por votar.
- Las obras de la ciudad son **de todos**: se pueden visitar por portales y llevan el nombre de los
  colegios que aportaron.
