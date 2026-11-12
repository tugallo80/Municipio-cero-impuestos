# EDU.16 — Tutor 24/7 del alumno (en pantalla: "tu tutor, a cualquier hora")

**Rama:** `sesion/canal-edu-16` (publica el sitio en su canal de vista previa + Functions y pruebas) ·
**Pedido por:** MAESTRA (con OK del dueño para publicar en `municipio-ia`).

## Objetivo
El alumno tiene "el celular del tutor 24/7": la profe Taji o el profe Jochi (IA), por texto y por voz, con
**el contexto completo de su vida escolar**. No es un chat genérico: sabe en qué tema va el curso, qué dijo el
profe en clase, qué tareas tiene y qué le cuesta, y **guía sin hacer la tarea**.

## Dónde está
- App del alumno → **🧑‍🏫 Mi tutor** (`/maqueta/mi-tutor/`). También se abre desde:
  - **Mis textos**: botón "Preguntale a tu tutor sobre esta página" (lo pone EDU.17b en su lector tipo libro) →
    `/maqueta/mi-tutor/?materia=ing&tema=ing-9&pagina=57`. "Página" = la **impresa** del libro (la del índice); las
    imágenes del lector usan la hoja del PDF (hoja = página + 2 en los 5 libros de área).
  - **Mis tareas**: botón "🧑‍🏫 Preguntale a tu tutor" → `/maqueta/mi-tutor/?tarea=<id>`
  - `&q=<pregunta>` la manda sola al abrir.
- Demo sin login: el link con la llave de EDU.15 (`…/maqueta/mi-tutor/#demo=<llave>`).

| Pieza | Archivo |
|---|---|
| Function `eduTutor` (texto, con streaming) | `educacion/services/ai-gateway/src/tutor.js` |
| Lógica pura: qué pregunta, recuperar el texto, armar el contexto, instrucción | `services/ai-gateway/tutor/tutor24.js` |
| Intenciones (compartidas con el navegador) | `services/ai-gateway/tutor/tutor24-intenciones.json` |
| Textos oficiales del lado del servidor | `services/ai-gateway/tutor/textos/*.json` (copia de `maqueta/textos/`, la hace `tools/datos/copiar-textos-tutor.mjs`; la prueba avisa si quedan desfasados) |
| Voz con el mismo contexto | `src/kay.js` (`eduKayToken` con `tutor: {materia, tema, pagina, tarea}`) + `tutor/profes.js` + `apps/web/profes/profes-voz.js` |
| Componente del navegador | `apps/web/tutor/tutor-chat.js` → `/voz/tutor.js` (`window.NandeTutor`) |
| Respuestas de ejemplo (sin IA) | `apps/web/tutor/ejemplos.js` |
| Pruebas | `test/tutor24.test.js` (sin red), `tools/e2e/probar-tutor.mjs` (en cada deploy de canal y de main) |

## Componente
```js
const t = NandeTutor.montar(elemento, { curso, materia, tarea, tema, pagina, q })
t.actualizar({ materia, tarea, tema, pagina })   // cambió de tema
t.preguntar('¿Qué tengo para mañana?')
t.desmontar()
```
`tarea` puede ser el id o `{id, titulo, consigna, materia, vence}`. Avisa con el evento `nande-tutor-listo`.
Cabecera con el profe IA (cambiar Taji ↔ Jochi), pastilla **IA**, **🎙️ Hablar** (voz con el mismo foco),
6 sugerencias (una fila deslizable en el celular), y la charla queda en la pestaña (sessionStorage, solo del día).

## Qué contexto usa (≈ 2.500–3.500 tokens por consulta)
1. **Hoy y el próximo día de clase**, con el horario del curso.
2. **Dónde va el curso** en cada texto oficial (unidad, página, contenido de ahora y el siguiente).
3. **Sus tareas** con fecha, estado, consigna y la escalera de pistas de su profe (eduTareas).
4. **Las últimas 3 clases grabadas** (EDU.04a): temas, cómo lo explicó, tareas, dudas y — nuevo — **"pidió avisar
   en casa"** y **"pidió traer"** (campos `avisos_casa` y `llevar` en el informe de la clase grabada; el panel del
   profe los muestra en "Lo que van a saber Taji y Jochi").
5. **Avisos para la casa, qué llevar y lo que se viene** (2 semanas) del curso.
6. **Un pedazo del texto oficial** (máx. 3.000 caracteres): el tema pedido, el de la página (se interpola dentro
   de la unidad), el que mejor coincide con la pregunta o donde va el curso. **Nunca el libro entero.** Si la
   unidad solo está en el índice, lo dice.
7. Lo que tiene abierto (tarea, materia, página) y los últimos 8 turnos de la charla.

## Seguridad y privacidad
- Dice que es IA; tono cálido; respuestas cortas.
- **Tareas**: escalera de a un peldaño (pregunta → pista → ejemplo parecido), nunca la respuesta.
- **Riesgo** ("me pegan", "no quiero vivir", abuso…): respuesta **fija sin IA** que deriva a un adulto de confianza
  y al 110 (costo 0; queda un log `tutor_riesgo` sin texto).
- **Emocional** (tristeza, burlas, miedo): 2–3 frases cálidas y lo anima a hablar con un adulto.
- Sin nombres: a la IA llega "un alumno de 2.º de secundaria"; el profe humano es el marcador `{PROFE}`, que el
  navegador cambia por `nande-profe-apodo` (o "tu profe"). En la voz se dice "tu profe". Todo lo que vuelve pasa por
  el filtro de nombres del curso.

## Demo sin fricción
- Con la llave de EDU.15 entra solo y gasta de la **bolsa de la demo** (USD 2/día).
- Si la IA tarda **más de 3 s**, falla o no hay presupuesto → **respuesta de ejemplo** armada con los datos del curso
  real del piloto (`ESTUDIANTE_DEMO`), con la etiqueta "Ejemplo". Si después llega la de la IA, la reemplaza.
  Nunca un error en pantalla.
- La primera pregunta de una charla, igual y del mismo día, sale del **caché** (al instante, sin costo).
- Sin cuenta ni servidor: modo ejemplo honesto ("Entrá para hablar con el tutor de verdad").

## Costo
- Modelo `gemini-3.1-flash-lite` (pensamiento mínimo), mismos respaldos que eduPlan (`EDU_MODELO_TUTOR` para cambiarlo).
- Estimado: ~3.000 tokens de entrada + ~200 de salida ≈ **USD 0,001 por consulta**.
- Medido: ver Cierre (la prueba e2e lo calcula en cada deploy, en el resumen del workflow).
- Topes: 60 consultas por alumno por día (300 la cuenta demo, que comparten la presentación y las pruebas); suma a la
  bolsa de la cuenta (general USD 5, pruebas USD 1, demo USD 2).

## Pruebas
- `npm test` (ai-gateway): 6 casos de intención, riesgo, recuperación por página/tema/palabras (≤ 3.000 caracteres),
  contexto sin nombres, fechas hábiles, materia nombrada, streaming sin perder espacios, voz con el mismo contexto,
  clase grabada con avisos y textos sincronizados.
- `tools/e2e/probar-tutor.mjs`: los 6 casos con la IA de verdad (cuenta demo), escalera, riesgo, emocional, "¿sos una
  persona?", streaming, caché, bolsa demo vs. general y **costo promedio por consulta**.
- Playwright local con el servidor simulado en 390×844, 820×1180 y 1280×800: los 6 casos en modo ejemplo, demo con
  llave (rápido por streaming, lento → ejemplo a los ~3 s y después la IA, caído, sin presupuesto), enlaces desde
  Mis textos y Mis tareas, sin desbordes ni errores.

## Pendiente
- Feriados en el servidor: el tutor no conoce el calendario por capas (el navegador sí); por ahora "mañana" es el
  próximo día hábil y la instrucción le dice que crea al alumno si dice que no hay clase.
- Páginas en imagen de los textos (rama `maestra-2`): hoy se recupera solo el texto extraído. Cuando EDU.17b
  mergee `ph` (hoja de cada párrafo) en `maqueta/textos/*.json`, usar esa hoja en vez de interpolar la página.
- Cursos reales (EDU.03): horario, avisos y "qué llevar" hoy salen del curso del piloto (`estudiante-demo.json`).
- Biología, Sociales y parte de Matemática solo tienen índice (EDU.17): el tutor lo dice.

## Texto visible
- Pedido del dueño: nunca "24/7" en pantalla ni en las voces (se leyó como "24 de julio"). Se dice **"a cualquier
  hora"** o "todos los días, a toda hora". La instrucción se lo prohíbe a la IA y la prueba e2e lo revisa.
- Botones de la presentación (para mostrarlo sin tipear): "¿Qué dijo el profe hoy?", "¿Qué tengo para mañana?",
  "¿Qué llevo?" y "No entiendo esta página" (o "la pág. 58 de Inglés" si no hay página abierta).

## Cierre (12-nov-2026)
**Hecho** — PR #40, rama `sesion/canal-edu-16`, canal https://nande-educacion--canal-edu-16-xs8ywax4.web.app/maqueta/mi-tutor/
- Function `eduTutor` publicada; `eduKayToken` con `tutor` (voz con el mismo contexto). Kay, la clase grabada y la demo
  siguen andando (sus pruebas pasaron en el mismo deploy).
- e2e contra lo publicado ✅: los 6 casos, escalera, riesgo (sin IA, costo 0), emocional, "sos IA", streaming
  (primer pedazo a 1,3 s), caché demo (0,1 s, sin costo), bolsa demo vs. general.
- **Costo medido: USD 0,00093 por consulta** (10 consultas, 0,00077–0,00105; ~2.600–3.500 tokens) → 1.000 consultas ≈
  USD 0,93. Respuesta completa en 1–3,6 s.
- Playwright local (servidor simulado) en 390×844, 820×1180 y 1280×800 ✅. No se pudo abrir el canal desde la sesión
  (la red de la sesión no llega a web.app): lo prueba el dueño.
- Un deploy falló porque Gemini tardó 5,5 min en resumir la clase de prueba de EDU.04a (la prueba corta a los 5 min);
  no es del tutor. Si se repite, subir el tiempo de espera de `probar-clase.mjs`.

**Qué tiene que probar el dueño** (celular): abrir el canal con la llave de la demo (`…/maqueta/mi-tutor/#demo=<llave>`),
tocar los 4 botones, preguntar "dame la respuesta de la tarea de inglés" y tocar 🎙️ Hablar.
