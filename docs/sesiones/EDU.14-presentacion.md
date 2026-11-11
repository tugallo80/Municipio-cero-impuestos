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

## Nuevo orden (11 láminas)

1. **¿Y si la nueva forma de educar empieza acá?** — escuela rural de Santa Cruz, el profe y los chicos como pioneros. Foto: el colegio (evolución Promo).
2. **La IA ya llegó** — darle la espalda o ponerla a trabajar para nuestros chicos; no reemplaza al profe, le devuelve tiempo y le ayuda a ver a cada chico.
3. **"Acá no vale lo que tenés, sino lo que sabés."** — la moneda es el conocimiento; fiscales, rurales y particulares por portales; compiten por mejora y por alumno. Foto: portal.
4. **Aprender jugando, con sentido** — tareas → misiones; los cursos construyen su Santa Cruz (zoológico); mundo cerrado, sin ranking de alumnos, frases predefinidas. Foto: zoológico en obra.
5. Para el alumno (profes IA + modo directo) · 6. Mentora del profe (incluye "lo que gana el profe") ·
7. Mapa del curso · 8. Evidencia · 9. Cuidado de los chicos · 10. Piloto · 11. Próximos pasos y contacto.

Salieron "El aula de hoy" (quedó dentro de la 2) y "Qué gana el profe" (dentro de la 6).

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
la imagen de la lámina 6 se oculta (no entraba). PDF de 11 páginas.
