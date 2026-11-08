# EDU.01c — Propuestas de estilo visual

## Objetivo

Que el dueño **compare y elija el estilo visual propio** del mundo ÑANDÉ, para primaria **y**
secundaria (ni infantil ni copia de Roblox/Minecraft). Lema: *"Acá no vale lo que tenés, sino lo
que sabés"*.

**Cambio de enfoque a mitad de sesión (dueño, vía MAESTRA, 8-nov):**
1. **Cada tramo de grados tiene su gráfica y el mundo "evoluciona" al pasar de curso**:
   1.º–3.º "Bloques" (cúbico), 4.º–6.º "Piezas" (redondeadas y encastrables, base A),
   secundaria "Mundo real" (estilizado maduro, base B). Nombres propios, sin copiar Minecraft,
   Lego ni Playmobil. Pantalla corta "pasaste de curso: tu mundo se transforma". A/B/C quedan
   como exploración; C como "modo liviano".
2. **No hay bosque que se restaura ni que se tala**: Santa Cruz empieza **vacía**, con áreas
   verdes y solo los hitos (plaza 24 de Septiembre/catedral, Cristo Redentor). Los cursos juntan
   capital con sus misiones y deciden con el docente qué obra hacer para la ciudad (ej. un
   zoológico): **los alumnos construyen la ciudad**. El reto entre colegios es quién aporta más.

**Decisión del dueño (vía MAESTRA 2, 8-nov, tarde):** B es la mejor dirección; C se ve mal y
sale de la vitrina (el código queda). Visión final: **12 evoluciones, una por año**, la promo con
acabado de juego comercial y estilo propio. Para la presentación, **6 escalones**: P1–P2 Bloques,
P3–P4 Piezas, P5–P6 Mundo real (base B), S1–S2 **Horizonte** (nuevo), S3–S5 **Mundo vivo** (nuevo),
S6 **Promo** (nuevo, el tope). La transición funciona entre cualquier par de escalones seguidos.

## Antes de empezar

- `CLAUDE.md`, `docs/plan-maestro.md`, `docs/sesiones/README.md`.
- **`docs/investigacion/estilo-visual.md`** (base: direcciones A, B y C).
- `docs/investigacion/mundo-abierto-santa-cruz.md` y `docs/educacion/vision-interfaz.md`
  ("Evolución de la visión del mundo", "Dos tutores…", "Los profes dentro del mundo").
- Cierre de EDU.01b y EDU.02b.

## Tareas

1. Escenas 3D en three.js (`educacion/estilos/`) con la **misma escena** en cada estilo: colegio
   cruceño (casona con galerías y horcones alrededor de un patio, creciendo), terreno vacío de la
   ciudad con un hito y una obra pública en construcción con el cartel de los colegios que
   aportan, portal de visita, ciudad por anillos, los dos profes y los alumnos.
2. Escalera de 3 tramos + transición de curso animada.
3. Prueba de construcción tipo Townscaper (tocar celda → el sistema elige la pieza), con fps.
4. Capturas (Playwright, deviceScaleFactor 2) de colegio, obra y portal por estilo, en celular
   (390×844) y horizontal (1280×800); página `educacion/estilos/index.html` para comparar.
   Lámina E "Mi colegio en Santa Cruz" para los talleres.
5. Rendimiento de gama baja: sin sombras en tiempo real, colores por vértice, luz horneada,
   niebla; three.js desde CDN con versión exacta. Medir fps de cada tramo.

## Hecho cuando

- Desde el celular se abre `/educacion/estilos/` en la vista previa, se comparan los 3 tramos
  (y A/B/C), se abre cada escena en 3D y se ve la transición de curso.
- `construir.html` funciona con el dedo y muestra fps.
- La lámina E está en PDF A3 + PNG junto a las láminas A–D.

## Cierre

**8-nov-2026** — PR #8 "EDU.01c — Propuestas de estilo visual" (`sesion/edu-01c` → `main`), sin mergear.
Vista previa (canal `pr-8`, verificada por la API de Firebase Hosting):
**https://municipio-ia--pr-8-j2o7xxsd.web.app/educacion/estilos/**

Nota: mientras tanto `main` sacó Educación del sitio del municipio (PR #7). `/educacion/estilos`
se sigue publicando ahí como material para decidir (igual que `/educacion/talleres`), no como app.

**Hecho**
- `educacion/estilos/mundo.js`: una sola escena para 6 estilos (three.js 0.160.0 desde cdnjs, con
  jsdelivr de respaldo). Todo es `MeshBasicMaterial` con color por vértice: la luz y la oclusión se
  **hornean** al armar (cero cálculo de luz por cuadro), sombras falsas, niebla, y la escena
  fusionada en ~10–16 llamadas de dibujo.
  - **1 Bloques** (1.º–3.º): todo con cubos (techos y árboles en escalón), luz de caras de cubo,
    colores lisos y vivos, personajes de ~3 cabezas. Sin texturas pixeladas (no es Minecraft).
  - **2 Piezas** (4.º–6.º): cajas de cantos redondeados, sombreado suave con brillo de plástico
    horneado, paredes con ranuras de encastre y suelo de placas; **sin pernos** (no es Lego) y
    caras propias (no Playmobil). ~4 cabezas.
  - **3 Mundo real** (secundaria): tres tonos + contorno fino marrón oscuro, paleta natural,
    ~6,5–7 cabezas.
  - **A / B / C**: la exploración inicial (B con patrones genéricos marcados "a co-diseñar con
    Artecampo / comunidades"; C = A al 45% de resolución y 32 colores, modo liviano).
- La escena nueva: la ciudad empieza vacía (anillos, avenidas, áreas verdes con árboles sueltos
  de la flora cruceña), hitos (plaza 24 de Septiembre con la catedral, Cristo Redentor en su
  rotonda), **Zoológico de la ciudad en obra** (recinto terminado, otro a medias, portal de
  entrada en fantasma, andamio, grúa, materiales de conocimiento en esmeralda y **cartel con los
  colegios que aportan y el avance**, sin montos ni ranking), un **parque terminado**, otros
  colegios, el portal, Taji y Jochi + el alumno del tramo (en A/B/C: uno de primaria y uno de
  secundaria).
- `escena.html?estilo=BLOQUES|PIEZAS|REAL|A|B|C&vista=colegio|obra|portal|ciudad|profes|general`.
- `transicion.html?de=BLOQUES&a=PIEZAS` (y `de=PIEZAS&a=REAL`): "¡Terminaste el curso!" → una ola
  de luz esmeralda cruza la ciudad y la redibuja en el estilo siguiente (dos escenas recortadas por
  un plano) → "¡Pasaste a 4.º de primaria! Tu colegio, tus obras y tus amigos siguen acá".
- `construir.html?estilo=…` (por defecto A): grilla 7×7; patio, aljibe, galerías con horcones,
  palma o teja, pisos, mirador; piezas con rebote.
- `index.html`: la escalera de 3 tramos lado a lado (colegio/obra/portal, celular/horizontal), la
  transición, fichas de cada tramo, construcción, exploración A/B/C, lámina E, fps y preguntas.
- Capturas en `educacion/estilos/capturas/` (36 de escenas + 4 de transición + 2 de construcción)
  y lámina E nueva (ciudad vacía con hitos, colegios, portales y obras) en
  `docs/educacion/talleres/laminas/E-mi-colegio-en-santa-cruz.{pdf,png}`. Todo se regenera con
  `node tools/estilos/generar.mjs <recursos>`.

**Arreglo tras la prueba del dueño en el celular** (vio los botones viejos y la transición en
negro): su navegador tenía en caché el `mundo.js` anterior. Ahora `arranque.js` carga three.js y
`mundo.js?v=<VERSION>` (rompecachés; subir `VERSION` en las 3 páginas cuando cambien los .js),
`firebase.json` manda `Cache-Control: no-cache` para `/educacion/estilos/**`, y si algo no carga
aparece "No se pudo cargar · Tocá para reintentar" (nunca pantalla negra). En celular vertical las
páginas 3D muestran "Girá tu pantalla" (con "Seguir así"). Probado con Playwright simulando el
módulo viejo (muestra el aviso de versión vieja) y con Pixel 5 vertical/horizontal.

**fps medidos** (Chromium del contenedor **sin GPU**, render por CPU; piso pesimista; mediana de
6 s, vista "Todo") — detalle en `educacion/estilos/capturas/fps.json` y en la página.

| Página | Celular 390×844 | Horizontal 1280×800 |
|---|---|---|
| 1 Bloques | 60 | 22 |
| 2 Piezas | 35 | 19 |
| 3 Mundo real | 34 | 15 |
| A Maqueta Viva | 50 | 21 |
| B Tierra Pintada | 31 | 17 |
| C Pixel Camba (modo liviano) | 60 | 35 |
| Transición 2 → 3 (dos mundos a la vez) | 18 | 6 |
| Construir (A) | 60 | 50 |

Sin GPU, el horizontal sufre por la cantidad de píxeles; en una tablet con GPU el orden debería
mantenerse (Bloques/C < A < Piezas ≈ Mundo real < transición).

**Segunda ronda (8-nov, tarde): 6 escalones + evoluciones 4, 5 y 6**
- Vitrina rehecha: la página abre con los **6 escalones** (P1–P2 Bloques · P3–P4 Piezas · P5–P6
  Mundo real · S1–S2 Horizonte · S3–S5 Mundo vivo · S6 Promo), cada uno con accesos a Colegio,
  Ciudad, Obra, Portal, Profes y alumnos (y Construir en 1–3), y la transición entre **cualquier par
  seguido** (1→2 … 5→6). A y B quedan como "Exploración anterior"; **C fuera de la vitrina** (el código
  queda en `mundo.js`, marcado `oculto`). El escalón 3 ahora usa la paleta de B.
- **Evolución 4 "Horizonte"**: la luz se calcula en la GPU (material toon de 3 tonos + sol + cielo),
  contorno fino, más geometría redonda, y **personajes por partes** (cuerpo con cintura y hombros,
  cuello, brazos y piernas) que **respiran, saludan (Taji) y caminan** (el alumno va y vuelve al portal).
- **Evolución 5 "Mundo vivo"**: + **sombras reales** (mapa de 1024), cielo con degradé y sol, nubes que
  pasan, **viento** en las copas y **agua** con ondas (shaders), tejas y revoque dibujados por shader,
  cara con nariz, cejas y orejas, antialias.
- **Evolución 6 "Promo"**: + materiales **PBR estilizados**, luz de cielo (PMREM), sombras de 2048 y
  sombras de nubes, **ACES + brillo (bloom) propio** en portal, faroles y "conocimiento", pétalos de
  tajibo y luciérnagas, viñeta, chamarra de promoción, resolución hasta 2x. Sin librerías extra.
- Antes de programarla se mandó el plan de 5 líneas a la MAESTRA 2 (técnica, costo, Blender).

**fps por escalón** (mismo servidor **sin GPU**, render por CPU, vista "Todo"; `capturas/fps.json`):

| Escalón | Celular 390×844 | Horizontal 1280×800 | Anda en (estimación honesta) |
|---|---|---|---|
| 1 Bloques | 55 | 34 | cualquier tablet |
| 2 Piezas | 37 | 24 | tablet de gama baja |
| 3 Mundo real | 36 | 22 | tablet de gama baja/media |
| 4 Horizonte | 29 | 17 | tablet media (con GPU) |
| 5 Mundo vivo | 9 | 7 | tablet/celular medio-alto (sombras en GPU) |
| 6 Promo | 6 | 4 | celular/tablet buena, 2021+ con GPU (vitrina) |
| Transición 5 → 6 | 6 | 4,5 | dibuja dos mundos: en gama media, usar fundido simple |

En este servidor todo lo pesado lo hace el procesador, así que 5 y 6 caen fuerte (sombras, PBR y
brillo son trabajo típico de GPU). En una tablet/celular con GPU decente se espera bastante más,
pero **hay que medirlo en el equipo real** antes de la presentación: si la 6 no llega a 30 fps,
bajar la resolución a 1,5x, el mapa de sombras a 1024 y apagar las partículas.

**Riesgos (pedidos por la MAESTRA)**
- **Alumnos que repiten de curso**: el mundo **nunca retrocede** de estilo; si repite, se queda
  en su tramo sin mensaje negativo (la transición solo existe para celebrar, nunca se "quita").
  Evitar que los compañeros vean quién no cambió: el estilo es la forma en que **cada uno** ve el
  mundo, no un distintivo público. Cuidado especial en 3.º→4.º y 6.º→1.º de secundaria.
- **Costo de producir 3 líneas de arte**: cada pieza nueva (obra, edificio, personaje, animal)
  hay que hacerla 3 veces. Mitigación aplicada en esta maqueta: **una sola geometría** con
  "traductores" por estilo (cubo ↔ redondeado ↔ dibujo) y paletas; el costo extra real está en
  personajes y en piezas especiales. Si se producen en Blender (EDU.07), definir desde el
  principio las 3 variantes por pieza o un sistema automático (voxelizar / redondear / contorno).
- **Cómo se ven entre sí colegios de distintos tramos**: al visitar por portal, cada uno ve el
  mundo **en su propio estilo** (el contenido es el mismo: piezas, obras, avatares). Así un
  colegio de primaria no se ve "infantil" para uno de secundaria y viceversa. Los mundos siguen
  separados por nivel para el contacto (seguridad), pero las obras de la ciudad son compartidas.
- **Rendimiento**: "Mundo real" y "Piezas" son los más pesados (contorno = el doble de
  triángulos; cantos redondeados); en gama baja usar C/Bloques como modo liviano, o contorno solo
  en objetos cercanos. La transición dibuja dos mundos: en gama baja, hacerla más corta o con
  fundido simple.
- **Marcas**: nombres propios ("Bloques", "Piezas", "Mundo real"); nada de pernos tipo Lego,
  caras tipo Playmobil ni texturas tipo Minecraft. Revisar con un abogado antes de publicar.

**Pendiente**
- Medir 4–6 en el celular/tablet que se use en la presentación (y el 1–3 en la tablet del programa).
- Producción de la evolución 6 (y luego las 12): **Blender (EDU.07)** para personajes con esqueleto y
  animaciones, modelos glTF con texturas pintadas y luz horneada; artista 3D para el acabado comercial.
- Definir las 12 evoluciones (una por año) a partir de estos 6 escalones.
- Medir fps en la **tablet real de gama baja** (meta ≥ 30) para cada tramo y la transición.
- Co-diseñar los patrones con Artecampo/CIDAC si se usan acentos de B.
- Nombres finales de los profes (Taji y Jochi son provisionales) y su ropa/aspecto por tramo.
- Qué obras puede elegir un curso (zoológico, parque, puente, museo…), cuánto cuestan y cómo se
  decide con el docente → EDU.05 (misiones) y el diseño de la economía.
- Llevar la lámina E (y las capturas por tramo) a los talleres: "¿Cuál querés jugar?", "¿Es para
  alguien de tu edad?" (1–5) con grupos de 6–8, 9–12 y 13–17.
- La lámina E no está dentro de `todo-para-imprimir.pdf` (va como PDF aparte).
