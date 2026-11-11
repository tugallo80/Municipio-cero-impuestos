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
