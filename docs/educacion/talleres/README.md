# Material para los talleres con niños

Para el protocolo de `docs/educacion/protocolo-focus-group.md`. Todo es **A3 apaisado**.
Para verlo desde el celular: abrir `index.html` (en la vista previa: `/educacion/talleres/`).

| Archivo | Para qué | Sesión |
|---|---|---|
| `laminas/A-colegio-magico` | Concepto A: el colegio con aulas que son portales | 1 |
| `laminas/B-selva-nande` | Concepto B: isla-selva inspirada en Santa Cruz (montañas tipo Amboró, río, lomas de arena, jaguar, capibaras, parabas, tucán, toborochis) | 1 |
| `laminas/C-mi-barrio` | Concepto C: barrio en bloques (casas genéricas, ninguna real) | 1 |
| `laminas/D-mundo-que-creamos` | Concepto D: terreno vacío que el curso construye | 1 |
| `laminas/E-mi-colegio-en-santa-cruz` | Concepto E: Santa Cruz por anillos, colegios unidos por portales y el bosque que hacen crecer (estilo A "Maqueta Viva", EDU.01c). Se genera con `tools/estilos/generar.mjs`; no está en `todo-para-imprimir.pdf` | 1 |
| `fichas` | 54 fichas para votar en secreto: verde "quiero vivir acá", amarilla "más o menos", roja "aburrido" | 1 |
| `cartas` | 8 cartas para ordenar de "me encanta" a "no me gusta": ver compañeros, visitar su casa, ranking, regalos, tutor que habla, lugar secreto, equipo del curso, y una en blanco ("Mi idea") | 2 |
| `vinetas` (3 hojas) | Historietas para completar: "¿Qué pasa cuando terminás la misión?", "¿Qué hay detrás de la puerta?", "Un compañero necesita ayuda" | 2 |
| `todo-para-imprimir.pdf` | Todas las hojas juntas | — |

Cada hoja está en **PDF** (para imprimir) y **PNG** (2480 × 1754, 150 ppp). En `vista/` hay copias
livianas en JPG para el celular.

## Cómo imprimir

1. Abrir el PDF → Imprimir → papel **A3**, orientación **horizontal**, escala **100% / tamaño real**.
2. Si solo hay A4: elegir **"ajustar a la página"** (se ve más chico pero entero).
3. Láminas: mejor en papel grueso (150 g o más) o plastificadas, porque los niños les pegan fichas.
4. Fichas: por grupo de 6 niños y 4 estaciones hacen falta ~24 de cada color → imprimir **2 hojas**
   por grupo. Recortar por la línea. Sirven también stickers redondos de colores.
5. Cartas: 1 juego por cada 2–3 niños. Recortar por la línea punteada.
6. Viñetas: 1 hoja de cada tipo por niño (o por pareja) y lápices de colores.

## Criterios de diseño

- **Diseño propio** estilo bloques: ningún personaje, arte ni marca de juegos existentes.
  El robot verde es **Kay**, el tutor de ÑANDÉ.
- Imagen grande + título corto; sin texto largo (los niños de 6–8 años recién leen).
- Las 4 láminas tienen el mismo nivel de detalle, colores vivos y niños parecidos, para no
  inclinar el voto. La letra (A–D) sirve para anotar en la planilla.
- Son **bocetos para conversar**, no el arte final del juego.

## Cómo se regeneran

Las escenas se arman en three.js (`tools/talleres/escenas.js`) y se capturan con Playwright
(`tools/talleres/generar.mjs`). Para cambiar algo, editar la escena y volver a correr:

```bash
R=<carpeta temporal fuera del repo>
npm i --prefix $R three@0.160.0 && cp $R/node_modules/three/build/three.module.min.js $R/
# fuentes: Space Grotesk 700, Inter 600 y 800 (Google Fonts) como
#   $R/SpaceGrotesk-700.ttf, $R/Inter-600.ttf, $R/Inter-800.ttf
node tools/talleres/generar.mjs $R
```
