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
2. **La IA ya llegó.** ¿Espalda o ponerla a trabajar? No es una app más; no reemplaza al profe.
3. **Una tablet por alumno, con todo adentro** — sello "La visión": alcaldía, textos oficiales del
   Ministerio (gratuitos), ahorro en útiles. Cifra: lista básica ≈ Bs 1.000 al año sin libros; libros
   Bs 80–180 c/u (El Deber, feb-2025, **a verificar**; Defensa del Consumidor publicó precios
   referenciales 2026 pero no un total).
4. **Un tutor en el bolsillo, las 24 horas** — sello "Lo que viene": recuerda la clase, tareas,
   horarios y qué llevar, avisos para la casa; la app del alumno es agenda, calendario, textos,
   tutor y el mundo. "El juego es una parte. El centro es el alumno."
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
