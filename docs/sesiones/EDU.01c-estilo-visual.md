# EDU.01c — Propuestas de estilo visual

## Objetivo

Que el dueño **compare y elija el estilo visual propio** del mundo ÑANDÉ, para primaria **y**
secundaria (ni infantil ni copia de Roblox/Minecraft). Lema: *"Acá no vale lo que tenés, sino lo
que sabés"*.

## Antes de empezar

- `CLAUDE.md`, `docs/plan-maestro.md`, `docs/sesiones/README.md`.
- **`docs/investigacion/estilo-visual.md`** (base: direcciones A, B y C).
- `docs/investigacion/mundo-abierto-santa-cruz.md` y `docs/educacion/vision-interfaz.md`
  ("Evolución de la visión del mundo", "Dos tutores…", "Los profes dentro del mundo").
- Cierre de EDU.01b y EDU.02b.

## Tareas

1. Escenas 3D estáticas en three.js (`educacion/estilos/`), una por dirección de arte, con la
   **misma escena**: colegio cruceño (casona con galerías y horcones alrededor de un patio,
   creciendo), bosque que se restaura (toborochi, tajibo, motacú; paraba, peta), portal de visita,
   ciudad por anillos, la profe Taji y el profe Jochi + alumno de primaria y de secundaria.
2. Prueba de construcción tipo Townscaper en el estilo A (tocar celda → el sistema elige la pieza),
   con indicador de fps.
3. Capturas (Playwright, deviceScaleFactor 2) de colegio, bosque y portal por estilo, en celular
   (390×844) y horizontal (1280×800); página `educacion/estilos/index.html` con las 3 lado a lado.
   Lámina E "Mi colegio en Santa Cruz" para los talleres, en el estilo A.
4. Rendimiento de gama baja: sin sombras en tiempo real, colores por vértice, luz horneada, niebla;
   three.js desde CDN con versión exacta.

## Hecho cuando

- Desde el celular se abre `/educacion/estilos/` en la vista previa, se comparan los 3 estilos y
  se abre cada escena en 3D.
- `construir.html` funciona con el dedo y muestra fps.
- La lámina E está en PDF A3 + PNG junto a las láminas A–D.

## Cierre

**8-nov-2026** — PR #8 "EDU.01c — Propuestas de estilo visual" (`sesion/edu-01c` → `main`), sin mergear.
Vista previa (canal `pr-8`, verificado por la API de Firebase Hosting: versión con
`/educacion/estilos/*` y la lámina E): **https://municipio-ia--pr-8-j2o7xxsd.web.app/educacion/estilos/**

Nota: mientras tanto `main` sacó Educación del sitio del municipio (PR #7). `/educacion/estilos`
se sigue publicando ahí como material para decidir (igual que `/educacion/talleres`), no como app.

**Hecho**
- `educacion/estilos/mundo.js`: la escena entera, compartida por los 3 estilos (three.js 0.160.0
  desde cdnjs, con jsdelivr de respaldo). Todo es `MeshBasicMaterial` con color por vértice: la luz
  de tarde y la oclusión se **hornean** al armar (no hay cálculo de luz por cuadro), sombras falsas
  (discos con degradé), niebla, y la escena fusionada en ~10–17 llamadas de dibujo.
  - **A Maqueta Viva**: facetado, paleta de la investigación, avatares de ~4 cabezas.
  - **B Tierra Pintada**: dos tonos + contorno de tinta (malla inflada vista de espaldas), paleta
    terracota/ocre/crema, avatares de ~6 cabezas, portal con aro de guarda que gira y banderines.
    Los patrones son **genéricos, de muestra**, marcados en la escena y en la página como "a
    co-diseñar con Artecampo / las comunidades".
  - **C Pixel Camba**: la geometría de A dibujada al 45% de los píxeles CSS, ampliada sin suavizar,
    luz encajada en 32 colores y color final reducido a pocos niveles.
- `escena.html?estilo=A|B|C&vista=colegio|bosque|portal|ciudad|profes|general`: girar con el dedo,
  pellizcar para acercar, botones de vista, nombres on/off y fps visible.
- `construir.html` (estilo A): grilla 7×7; celda rodeada → patio (un aljibe por patio); galerías con
  horcones hacia el patio y hacia la calle; palma en casas chicas (<3 celdas) y teja en grandes;
  tocar otra vez sube un piso; el tercero es mirador; las piezas aparecen con rebote.
- `index.html`: las 3 lado a lado por vista (colegio/bosque/portal) y formato (celular/horizontal),
  botón "Abrir en 3D", fichas de cada estilo, prueba de construcción, lámina E, tabla de fps y
  4 preguntas para elegir.
- Capturas en `educacion/estilos/capturas/` (18 + 2 de construcción) y lámina E en
  `docs/educacion/talleres/laminas/E-mi-colegio-en-santa-cruz.{pdf,png}` (+ `vista/…jpg`), agregada
  a la página y al README de los talleres. Todo se regenera con
  `node tools/estilos/generar.mjs <recursos>` (ver cabecera del script).
- `scripts/build-site.sh` publica `educacion/estilos/` en `/educacion/estilos/`.

**fps medidos** (Chromium del contenedor **sin GPU**, render por CPU; piso pesimista) — ver
`educacion/estilos/capturas/fps.json`:

| Página | Celular 390×844 | Horizontal 1280×800 |
|---|---|---|
| A Maqueta Viva (vista Todo, ~95 mil triángulos) | 35 | 21 |
| B Tierra Pintada (~242 mil triángulos por el contorno) | 17 | 9 |
| C Pixel Camba | 44 | 28 |
| Construir (A) | 60 | 60 |

**Pendiente**
- Que el dueño elija (o combine: la investigación recomienda A + patrones de B en interfaz y
  portales + C como modo liviano).
- Medir fps en la **tablet real de gama baja** (meta ≥ 30); B necesita bajar triángulos (contorno
  solo en objetos cercanos o menos árboles) si se elige.
- Co-diseñar los patrones con Artecampo/CIDAC antes de usar B en serio.
- Nombres finales de los profes (Taji y Jochi son provisionales) y su ropa/aspecto.
- Llevar la lámina E (y las láminas por estilo) a los talleres: "¿Cuál querés jugar?", "¿Es para
  alguien de tu edad?" (1–5) con grupos de 6–8, 9–12 y 13–17.
- La lámina E no está dentro de `todo-para-imprimir.pdf` (va como PDF aparte).
