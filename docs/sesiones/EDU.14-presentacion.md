# EDU.14 — Presentación del proyecto (para el profe del piloto)

## Objetivo

Una presentación web corta (10 láminas) para que el dueño le muestre al profe de la U.E. Nuevo
Horizonte qué gana con ÑANDÉ. Minimalista, objetiva y práctica. Se ve en celular (vertical y
horizontal), PC y proyector, y se descarga en PDF.

## Dónde

- Código: `educacion/presentacion/index.html` + `img/` (capturas reales del demo, datos inventados).
- Se copia a `dist/presentacion/` en `apps/web/scripts/despues-del-build.mjs` → `/presentacion/`.
- Rama `sesion/pantalla-edu-14`: publica solo en su canal de vista previa (link en el resumen del workflow).

## Cómo se usa

- Pasar: tocar (tercio izquierdo = atrás, resto = adelante), deslizar, flechas, espacio, Inicio/Fin.
  `F` o el botón ⛶ = pantalla completa.
- **PDF**: botón "PDF" → "Guardar como PDF" (una lámina por página, 16:9, fondo negro).
  En el diálogo de impresión, dejar activado "Gráficos de fondo" si el navegador lo pregunta.
- **Contacto**: agregar al link `?nombre=Tu%20Nombre&tel=7xxxxxxx` y aparece en la última lámina.
  Sin eso, quedan las líneas para escribir.
- Ir a una lámina: `#5` al final del link.

## Guion (10 láminas)

1. Cada alumno, a su ritmo — educación individualizada gracias a la IA.
2. El aula de hoy — un profe, muchos chicos, ritmos distintos, poco tiempo.
3. Para el alumno — Taji y Jochi, preguntas en vez de respuestas, mundo-juego, modo directo (captura real de EDU.06d).
4. Para el profe — mentora IA: clase → resumen, cronograma + PDC, tareas, mapa del curso. La IA propone, el profe decide.
5. Mapa del curso — el aula por mesas, propuestas de la mentora (parejas, grupos, a quién acompañar) que el profe acepta o cambia (captura real de EDU.04f).
6. Qué gana el profe — tiempo y ver a cada uno.
7. Evidencia — Nigeria (BM 2025), TaRL (J-PAL), EEF −31 % planificación, OLPC Perú sin efecto.
8. Cuidado de los chicos — sin nombres a la IA, audio no se guarda, consentimiento.
9. Propuesta de piloto — gratis, un curso 8–12 semanas, medido con curso de comparación, profe co-diseñador.
10. Próximos pasos + contacto.

No se menciona la parte de reportes a dirección ni alertas (decisión del dueño).

## Probado

Playwright en 390×844, 844×390, 1280×800, 360×740 y 1920×1080: sin desbordes, nada bajo la barra
ni debajo de los botones. PDF de 10 páginas. Capturas en `docs/sesiones/capturas/EDU.14/`.

## Pendiente

- **Nigeria**: los documentos del repo dan +0,23 DE (educacion-piloto) y +0,3 DE (mentor-del-profesor).
  La lámina dice "+0,2 a 0,3 DE" para no exagerar. Verificar en el informe del Banco Mundial.
- Las capturas son archivos sueltos en `educacion/presentacion/img/`: se cambian sin tocar el HTML
  (mismo nombre; si cambia la proporción, ajustar `width`/`height` del `<img>`).
- `img/alumno-tareas.jpg` sale de la rama `sesion/pantalla-edu-06d` (modo directo) y `img/profe-mapa.jpg`
  de `sesion/canal-edu-04f` (mapa del curso). Si esas pantallas cambian antes de mergear, rehacer las capturas.
- La foto del juego es una captura guardada (EDU.02c); el demo en vivo usa 4.º de primaria de ejemplo.

---

# EDU.14b — Presentación con alma (11-nov-2026)

Pedido del dueño: "es muy técnica, le falta alma". Se agrega una **apertura con propósito** y se
acorta lo práctico. Rama `sesion/pantalla-edu-14b`.

## Nuevo orden (13 láminas) — segunda vuelta: "cambio de paradigma"

El dueño pidió más fondo: no es un juego ni "tareas más bonitas", es integrar la tecnología y la IA
a la educación como respuesta a la pobreza y a la falta de alcance.

**Apertura (6):**
1. **Seguimos enseñando como hace 100 años.** ¿Y si el cambio empieza en una escuela rural? Pioneros. (foto colegio)
2. **La IA ya llegó.** ¿Espalda o ponerla a trabajar? Agregado del dueño, el problema: "Hoy" la IA
   hace la tarea por el chico y el profe no sabe qué copió; "Acá" el tutor guía con preguntas y
   pistas, la tarea se hace paso a paso y el profe ve el proceso. "Hoy la IA le hace la tarea al
   chico. Acá le enseña a hacerla." Sin prometer que es imposible copiar ("pensada para aprender,
   no para copiar"). "No es una app más…" pasó a la lámina 6.
3. **Una tablet por alumno, con todo adentro** — sello "La visión": alcaldía, textos oficiales del
   Ministerio (gratuitos), ahorro en útiles. Cifra: lista básica ≈ Bs 1.000 al año sin libros; libros
   Bs 80–180 c/u (El Deber, feb-2025, **a verificar**; Defensa del Consumidor publicó precios
   referenciales 2026 pero no un total).
4. **Un tutor en el bolsillo, a cualquier hora** — sello "Lo que viene": recuerda la clase, tareas,
   horarios y qué llevar, avisos para la casa; la app del alumno es agenda, calendario, textos,
   tutor y el mundo. Agregado del dueño: contraste "un buscador o un chat cualquiera" (no sabe dónde
   estás) vs "su tutor" (conoce los textos oficiales y el plan del profe: en qué tema va, qué dijo su
   profe, qué le cuesta). "Ayuda a aprender y a ordenarse, no a copiar." La frase "el centro es el
   alumno" pasó a la lámina 6.
5. **"Acá no vale lo que tenés, sino lo que sabés."** Semillas de conocimiento, construir su Santa
   Cruz, colegios que se encuentran en un mundo seguro. (foto zoológico)
6. **Bachilleres que salen sabiendo de verdad.** "Queremos bajar los aplazos, y lo vamos a medir en el piloto."

**Lo práctico (7):** hoy en el demo (profes IA + modo directo) · mentora del profe · mapa del curso ·
evidencia · cuidado de los chicos · piloto · próximos pasos y contacto.

Fuentes del costo de útiles:
- https://eldeber.com.bo/santa-cruz/la-lista-de-utiles-escolares-demanda-un-gasto-de-unos-bs-1000-y-sube-el-precio-de-los-materiales_502810/
- https://eldeber.com.bo/pais/establecen-lista-precios-referenciales-utiles-escolares_1769814838

## Nombres

- Investigación de nombres (MAESTRA, 11-nov): se descarta "Jochi". En la presentación los profes IA
  **no se nombran** ("Dos profes IA para cada alumno") y una línea chica dice que los nombres son
  provisionales y que **los chicos ayudan a elegirlos en los talleres**.
- La marca está en una sola variable al principio del `<script>`: `const NOMBRES = { marca: 'ÑANDÉ' };`
  (cambia la marca y el título de la pestaña). Las capturas usadas no muestran nombres de los profes.
- "Moneda" → **"semillas de conocimiento"**: se ganan al aprender y el curso las planta para hacer
  crecer su ciudad (láminas 3 y 4). El lema queda igual.

## Imágenes

`img/mundo-colegio.jpg`, `img/mundo-portal.jpg`, `img/mundo-zoologico.jpg` salen de
`educacion/estilos/capturas/PROMO-*-horizontal.jpg`, recortadas para sacar los carteles de texto.
`img/profe-pdc.jpg` quedó sin usar (era de la lámina "Qué gana el profe"); se puede borrar con OK del dueño.

## Probado

Playwright en 390×844, 844×390, 1280×800, 360×740 y 1920×1080: sin desbordes. En celular vertical
la imagen de la mentora se oculta (no entraba). PDF de 13 páginas. `img/mundo-portal.jpg` y
`img/profe-pdc.jpg` quedaron sin usar (se pueden borrar con OK del dueño).

## "▶ Verlo en vivo" (pedido del dueño para presentar en vivo)

En las láminas con algo ya programado hay botones que abren esa parte de la plataforma en una
**capa a pantalla completa dentro de la presentación** (iframe del mismo sitio, rutas relativas,
`allow="fullscreen; microphone; autoplay; screen-wake-lock"`). Arriba siempre está
**"✕ Volver a la presentación"**: vuelve a la misma lámina, corta audio y micrófono (el iframe queda
en blanco) y también cierra con Esc o con el botón "atrás" del celular.

| Lámina | Botones |
|---|---|
| 5 · Lema | El mundo (`/estilos/escena/?estilo=PROMO&vista=colegio`) y Pasar de curso (`/estilos/transicion/?de=VIVO&a=PROMO`), con "abrir aparte". No se usa `/estilos/` porque es una nota interna para el dueño |
| 7 · Hoy en el demo | Juego (`/maqueta/alumno/?demo=1`, con "abrir aparte"), Mis tareas (`/maqueta/tareas/`) |
| 8 · Mentora | Clase grabada (`#clase`), Cronograma y PDC (`#cronograma`), Tareas sugeridas (`#tareas`) en `/maqueta/tutor.html` |
| 9 · Mapa del curso | Mapa del curso (`/maqueta/tutor.html#mapa`) |

- "Lo que viene" (tutor a cualquier hora, agenda, textos) no lleva botón.
- No se enlaza `/maqueta/` (los 4 perfiles) porque muestra el perfil de dirección, que el dueño
  dejó fuera de esta presentación.
- "abrir aparte" en el juego y el mundo, por si la orientación o el 3D andan mejor fuera del iframe.
- Probado con Playwright (servidor local con URLs limpias como Firebase) en 390×844, 844×390 y
  1280×800: cada botón abre su parte y "Volver" deja en la misma lámina. En celular acostado, la
  lámina 8 oculta su captura y pone las 4 funciones en dos columnas.

## Demo en vivo desde PC o proyector (pedido del dueño)

- **Marco de dispositivo** (pantallas ≥ 900×560): la demo corre al tamaño real del aparato
  (celular 390×844 o 844×390, tablet 1180×820) dentro de un marco sobrio, escalado para entrar
  (máx. ×1,5), con la lámina detrás oscurecida. Selector arriba: Celular · Horizontal · Tablet ·
  Completa. Cada demo arranca en su aparato (`data-disp` del botón): juego en horizontal, Mis tareas
  en celular, panel del profe y mundo en completa. En el celular real se abre directo, sin marco.
- **Teclado**: flechas, Esc cierra la demo (también con el foco dentro de la demo), F pantalla completa,
  **P o botón "Notas"** abre el **modo presentador** (`?presentador`) en otra ventana: notas por
  lámina (`<template class="notas">` en cada lámina), lámina siguiente, reloj, botones de las demos
  de esa lámina y "Cerrar la demo". Sincronizado en las dos direcciones con `BroadcastChannel`.
- **Sin fricción**: "Cargando la demo…" hasta que carga; si tarda más de 8 s, "Abrir aparte" (nunca
  un error). Se precargan (`prefetch`) las demos de la lámina actual y la siguiente.
- **Llave de demo (EDU.15)**: `?llave=…` en el link de la presentación → se guarda en el equipo
  (`localStorage`), se borra del link y se agrega a cada demo. Si EDU.15 usa otro nombre, cambiar
  `PARAM_LLAVE` en el script.
- Probado en 1920×1080 y 1280×720 (marco, selector, Esc, presentador ida y vuelta) y en 390×844 /
  844×390 (sin marco). El 3D del mundo no se ve desde la sesión (CDN bloqueado): revisar en el canal.

## Versión "para el profe" (enfoque del dueño)

La presentación habla **al profe del piloto** (segunda persona: "tu curso", "tus textos", "vos decidís"),
y las notas del presentador dicen qué decirle y qué mostrarle.

- **A quién se presenta** (un solo lugar, al principio del `<script>`):
  `const PARA = { profe: '', colegio: 'U.E. Nuevo Horizonte', curso: '2.º de secundaria' }`.
  El nombre del profe también va en el link: `?profe=Nombre` (se recuerda en el equipo y se borra del link).
  Portada: "Para vos, profe · U.E. Nuevo Horizonte · 2.º de secundaria" (o "Para {nombre}").
- **Lámina "La IA ya leyó tus textos de 2.º de secundaria"** (3): índice real de los textos de
  aprendizaje 2025 (`/maqueta/plan-ejemplo-2do-secundaria.js`), 9 áreas y 64 temas por trimestre.
  Botones en vivo **"Tu cronograma"** y **"Tu PDC"**: antes de abrir, si el equipo no tiene cronograma
  guardado (`localStorage nande-crono-S2`), la presentación deja uno armado con esos temas → se ve el año
  día por día y el PDC **sin cuenta y sin pasos**. Si ya hay uno, no lo pisa.
- **Variantes** listas: `?para=profe` (por defecto) `| director | municipio`. Una lámina con
  `data-para="director municipio"` solo sale en esas variantes. Hoy solo está la del profe.
- "Cuidado de los chicos" pasó a una franja dentro de "La propuesta para tu curso" (13 láminas en total).

**Pendiente para EDU.15 (modo demo):** el panel del profe muestra el profe y colegio de ejemplo
("Prof. Daniela Méndez · U.E. Arcoíris del Sur"). Para que la demo diga "U.E. Nuevo Horizonte" y su
nombre, el modo demo debería aceptar colegio y nombre del profe (la presentación ya los tiene en `PARA`).

### Nombre del profe y llave de demo (acordado con EDU.15)

- El nombre real del profe **no va en el repo ni en el sitio** (repo público). Entra por el link:
  `?profe=<nombre formal>&profeApodo=<apodo>` (claves unificadas por la MAESTRA). La presentación usa el
  nombre formal en la portada ("Para el profe <nombre>"; sin parámetro, "Hola, Profe") y en las notas
  (`{profe}`; `{apodo}` también disponible), lo guarda en el equipo y pasa `profe` y `profeApodo` a cada demo.
- Llave de la demo: `?llave=…` o `#demo=…` en el link de la presentación.
- Todo se guarda en `localStorage` del mismo sitio y se borra del link. Las páginas de la demo lo leen
  solas (acordado con EDU.15):
  - `nande-demo`: la llave (la tiene la MAESTRA; nunca en el repo).
  - `nande-profe`: nombre formal (portada, notas, panel del profe).
  - `nande-profe-apodo`: apodo del profe (app del alumno y tutor).
  - Ojo: `nande-apodo` es el apodo **del alumno** (EDU.15); la presentación no lo toca.
- Con la llave, el panel usa el cronograma de la cuenta demo del servidor (2026, las 5 materias del profe).
  Sin llave o sin internet, la presentación siembra `nande-crono-S2` como respaldo.
- Colegio y curso salen de `/maqueta/demo-piloto.js` (EDU.15, PR #37) cuando esté en `main`; si no, del texto fijo.

**Link para presentar** (lo arma la MAESTRA con los valores reales, fuera del repo):
`…/presentacion/?profe=<nombre>&profeApodo=<apodo>#demo=<llave>` — se abre una vez en el equipo de la reunión.

### App del alumno (EDU.17, PR #36)

- Botones nuevos: lámina 4 (la tablet) **Mis textos** (`/maqueta/textos/`, tablet); lámina 8 (tus alumnos)
  **Hoy** (`/maqueta/hoy/`), **Agenda** (`/maqueta/agenda/`), **Mis textos**, además de Juego y Mis tareas.
- La agenda y los textos ya no van como "Lo que viene". El **tutor a cualquier hora (EDU.16)** sigue con su sello.
- Funcionan del todo cuando #36 y #37 estén en `main`; probados en local contra la rama `sesion/pantalla-edu-17`.

---

# EDU.14c — Evidencia en comparaciones simples (12-nov-2026)

Pedido del dueño: que la lámina de evidencia no hable en "DE", sino con comparaciones que se entiendan al toque.
Rama `sesion/pantalla-edu-14c`. Cada fila: pictograma + frase grande + dato técnico en chico.

1. **Nigeria (Banco Mundial 2025):** "6 semanas que rindieron como 1,5 a 2 años de escuela". Chico: "un chico del
   medio de la clase pasó a estar por delante de 6 de cada 10" (≈ +0,25 DE), secundaria, inglés, docentes guiando,
   +0,2 a 0,3 DE. La equivalencia en años es la del propio Banco Mundial.
2. **India, enseñar al nivel (J-PAL):** "donde se aplicó bien, el salto fue grande; donde la clase no cambió, casi
   nada" (se usó "grande", no "enorme"). Chico: 6 ensayos con sorteo, 0,07 a 0,70 DE.
3. **Inglaterra (EEF 2024):** "de cada 3 horas, recuperás casi 1, sin bajar la calidad" (−31 %).
4. **Perú (BID 2012):** "repartir aparatos no alcanza: sin guía, los chicos no aprendieron más" (319 escuelas).

Cierre: "Son estudios de otros países: en tu curso lo vamos a medir." En celular vertical se ocultan la línea de
"6 de cada 10" y la explicación de DE; en celulares muy chicos, los pictogramas.
Probado en 390×844, 844×390, 1280×800, 360×740 y 1920×1080; PDF de 13 páginas.
- Pedido de la MAESTRA: no usar "24/7" ni "las 24 horas" (se lee como fecha). La lámina dice
  "Un tutor en el bolsillo de cada alumno, **a cualquier hora**".

---

# EDU.14d — Lámina "Un ejemplo": lo que ahorra una familia (12-nov-2026)

Lámina 5, después de "Una tablet por alumno". Ejemplo genérico: **Juan, el papá de Carlitos (2.º de secundaria,
Santa Cruz)**. Presentación de 14 láminas.

| | Bs por año (2027, estimado) |
|---|---|
| Hoy (textos, cuadernos, mochila y útiles) | **≈ 1.700** |
| Con la tablet (sin textos, 3 cuadernos en vez de 10) | **≈ 1.150** |
| **Juan ahorra** | **≈ 550** (casi 2 bonos Juancito Pinto de Bs 300) |
| Tu curso (30 familias) | ≈ 16.500 que se quedan en las casas |
| La tablet (≈ Bs 1.400, 2 años de uso) | ≈ 700 por alumno: con lo que ahorran las familias, casi se paga sola (≈ 8 de cada 10 Bs) |

**Cálculo (precios 2026 → 2027 × 1,127):**
- Textos: 3 al año × ≈ Bs 130 = Bs 390 → 440. Precio por libro Bs 80–180 (El Deber, feb-2025); la cantidad es supuesto.
- Cuadernos: 10 × ≈ Bs 17 = Bs 170 → 192 (El Deber, ene-2026: carta tapa dura Bs 15–18). Con la tablet, 3 → 57.
- Resto de la lista (bolígrafos, colores, geometría, hojas, carpetas): Bs 830 → 935, igual con y sin tablet.
  (Lista básica ≈ Bs 1.000 sin libros, El Deber feb-2025, menos los cuadernos.)
- Mochila: ≈ Bs 150 → 169 (rango Bs 50–400, El Deber ene-2026), igual con y sin tablet. Uniforme no se cuenta.
- Total: 1.736 → "≈ 1.700"; con tablet 1.161 → "≈ 1.150"; ahorro 575 → se muestra "≈ 550" (redondeo conservador).
- Se trata la lista 2025 como precio 2026: los comerciantes dijeron que en 2026 los útiles bajaron (Unitel, ene-2026),
  así que no se suma la inflación de 2025 (20,4 %, INE) para no inflar.

**Fuentes:**
- El Deber, feb-2025: lista de útiles ≈ Bs 1.000 sin libros; libros Bs 80–180 —
  https://eldeber.com.bo/santa-cruz/la-lista-de-utiles-escolares-demanda-un-gasto-de-unos-bs-1000-y-sube-el-precio-de-los-materiales_502810/
- El Deber, ene-2026: cuadernos Bs 9–21, mochilas Bs 50–400 — https://eldeber.com.bo/santa-cruz/gente-vuelca-mercados-utiles-escolares_1769731111
- Unitel, ene-2026: útiles bajan hasta 50 % — https://unitel.bo/noticias/economia/utiles-escolares-bajan-de-precio-hasta-un-50-en-comparacion-con-el-ano-pasado-segun-comerciantes-DJ18995521
- Inflación: INE 2025 = 20,40 % (Infobae, ene-2026) — https://www.infobae.com/america/america-latina/2026/01/07/bolivia-registro-en-2025-una-inflacion-de-2040-el-nivel-mas-alto-en-mas-de-dos-decadas/ ;
  FMI oct-2026: 12,7 % (2026) y 15,8 % (2027) — https://oxigeno.bo/fmi-proyecta-que-bolivia-sera-la-unica-economia-de-sudamerica-en-contraccion-en-2026-y-2027/
- Tablet: Samsung Galaxy Tab A9 Bs 1.687 (Next Level, distribuidor) a Bs 1.044 (listados 2025) —
  https://nextlevel.com.bo/collections/tablets ; https://www.laptop6.com/bo/laptops/samsung/galaxy-tab-a9-16265 .
  Bs 1.400 por compra al por mayor es **estimado** (no se encontró precio unitario de licitaciones; buscar en SICOES).
- Bono Juancito Pinto 2026: Bs 300 (DS 5712) — https://correodelsur.com/sociedad/20260923/el-pago-del-bono-juancito-pinto-comenzara-el-lunes-19-de-octubre.html
- Bono municipal de Santa Cruz de la Sierra: Bs 400 anunciado para abril 2026 (El Deber / eju.tv, dic-2025), pero en
  oct-2026 el exalcalde dijo que se retiró del presupuesto. **No confirmado → no va en la lámina** (solo en notas).
  https://eju.tv/2025/12/jhonny-confirma-bono-de-bs-400-para-cada-estudiante-de-santa-cruz-se-pagara-en-abril-de-2026/ ;
  https://eju.tv/2026/10/jhonny-fernandez-acusa-a-mamen-de-montar-procesos-para-tapar-el-destino-de-bs-1-800-millones/
- Curso de 30: supuesto (Reduno, 2026: cursos de hasta 35–40 en secundaria). No se encontró el dato de la U.E. Nuevo
  Horizonte ni la matrícula de secundaria del municipio (pedir al SIE / Dirección Departamental).

**Diseño:** sello "Estimado · 2027", texto arriba y cifras apiladas en celular; en PC, texto a la izquierda y cifras a la
derecha. Nota al pie con fuentes. Notas del presentador: guion de 30 segundos y fuentes.
Probado en 360×740, 390×844, 844×390, 1280×800 y 1920×1080 sin desbordes; PDF de 14 páginas.
Captura: `docs/sesiones/capturas/EDU.14/juan-14d.jpg`.
