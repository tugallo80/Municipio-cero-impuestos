# EDU.04a — Clase grabada (panel del profe)

## Objetivo
Para la primera reunión con el profe del piloto (U.E. Nuevo Horizonte): el profe toca
**▶ Empezar clase**, el micrófono graba la clase, se corta sola al terminar la hora y la IA
devuelve un resumen con 3 usos:

1. **Para el profe**: qué se vio contra el pensum del día, qué quedó pendiente, 2–3 sugerencias
   positivas y las tareas que dio. Nunca una nota ni un castigo.
2. **Para la dirección**: resumen corto y alertas **solo** con señales claras de riesgo
   (maltrato, gritos, alguien lastimado, un chico que pide ayuda), siempre "para revisar por una persona".
3. **Para los profes IA (Taji / Jochi / Kay)**: el "contexto del día" del curso. Si un alumno pregunta
   "¿qué tarea dejó el profe?" o "no entendí lo de las fracciones", responden con lo que pasó en la clase real.

## Dónde está
- Panel del profe: `https://nande-educacion.web.app/maqueta/tutor.html#clase` (y tarjeta en "Hoy").
- Dirección: **escondida por ahora** (pedido del dueño, 8-nov). Solo con `?direccion=1`:
  `…/maqueta/tutor.html?direccion=1#clase` (el informe muestra también "Para la dirección") y
  `…/maqueta/direccion.html?direccion=1#clases`. La Function la sigue armando.
- Ejemplo sin cuenta ni internet: `…/maqueta/tutor.html#clase/ejemplo`.
- Cuenta: la del dueño (`dueno`), que ahora también es profe y dirección **demo** (curso ficticio 4to/5to).

| Pieza | Archivo |
|---|---|
| Grabación y pantalla (sin build) | `educacion/maqueta/clase.js` (lo cargan `tutor.html` y `direccion.html`) |
| Cuenta y llamadas al servidor | `educacion/apps/web/clase/clase-cuenta.js` → se publica como `/voz/clase.js` |
| Functions `eduClase` y `eduClases` | `educacion/services/ai-gateway/src/clase.js` |
| Instrucción, esquema JSON, anonimizar, contexto para Kay | `educacion/services/ai-gateway/tutor/clase.js` |
| Precios del modelo de audio | `educacion/services/ai-gateway/src/costos.js` (`PRECIOS_CLASE`) |
| Base (cerrada al navegador) | `edu/clases`, `edu/contexto_dia`, `edu/personal`, `edu/uso_clase` (ver `src/datos.js`) |
| Pruebas | `test/clase.test.js` (sin red) y `educacion/tools/e2e/probar-clase.mjs` (en cada deploy) |

## Cómo funciona
- **Grabación**: `MediaRecorder` en el navegador, voz mono a 16 kbps (~7 MB por hora). Opus/webm en
  Chrome y Android; AAC/mp4 en iPhone. Aviso antes de grabar con casilla "Avisé al curso", barra
  roja fija **🔴 Grabando** con reloj, nivel del micrófono, **⏸ Pausa** y **■ Terminar**. Se corta
  sola a los 45 min (hora pedagógica demo) o a los **2 min en la "Clase de prueba"** (para la reunión).
  Tope duro 75 min. Mantiene la pantalla encendida (Wake Lock) y avisa si se intenta cerrar la página.
- **Resumen**: `eduClase` manda el audio a Gemini en **una sola llamada** con salida JSON
  (informe del profe + dirección + contexto + transcripción). Modelo: `gemini-3.1-flash-lite`; si no
  existe, prueba `gemini-3.1-flash-lite-preview`, `gemini-2.5-flash-lite`, `gemini-flash-lite-latest`
  (`EDU_MODELO_CLASE` para cambiarlo). La clave `GEMINI_API_KEY` sigue en Secret Manager.
- **Topes**: suma al mismo tope global de **USD 5/día** que Kay; máximo 8 clases por profe por día.
- **Kay / Taji / Jochi**: `eduKayToken` agrega a la instrucción las últimas 3 clases vigentes del curso
  (temas, cómo lo explicó, tareas, dudas) con la regla "si no está, no inventes: preguntale a tu profe".

## Privacidad (lo que ya cumple)
- **El audio no se guarda**: vive en la memoria de la página hasta que el servidor responde, y en la
  memoria de la Function durante la llamada a Gemini. No va a Storage, ni a la base, ni a los logs.
  (Gemini API pago: Google no usa los datos para entrenar; confirmar los términos para el piloto.)
- **Sin nombres**: la instrucción prohíbe nombres de alumnos ("un alumno") y además el servidor pasa
  todo el texto por un filtro con la lista de nombres del curso (en la demo, los ficticios de la maqueta;
  en el piloto, los de la base de EDU.03 — nunca del navegador).
- **Vencimientos**: informe 30 días, transcripción 7 días, contexto para los profes IA 14 días.
  Se limpian solos al leer (sin cron). El profe (o la dirección) puede borrar un informe en el momento,
  y eso borra también lo que sabían los profes IA.
- **El profe ve exactamente lo que ve la dirección**: un solo informe; la pantalla lo dice arriba.
- Detrás de login (cuenta demo `dueno` con rol de profe/dirección). Sin login: solo el ejemplo inventado.
- Demo con datos ficticios; el aviso pide hablar con nombres inventados.

## Pendiente de diseño fino con el dueño (protección de los chicos)
- La parte **"para la dirección"** (resumen y alertas de riesgo): qué señales, quién las revisa, en
  cuánto tiempo y a dónde se derivan. Hasta entonces queda escondida en la pantalla (`?direccion=1`).
- Regla que no cambia: cuando se active, **el profe ve exactamente lo mismo que la dirección**.
- Va junto con los consentimientos de abajo.

## Consentimientos para el piloto real (antes de grabar una clase de verdad)
1. **Profe**: consentimiento escrito e informado, revocable; él decide cuándo graba y puede pausar
   o borrar. Acuerdo explícito de que **no se usa para evaluarlo** ni para sanciones.
2. **Padres o tutores** de cada alumno: consentimiento escrito (se graba la voz de menores aunque el
   audio se borre), con explicación simple de qué se guarda y cuánto tiempo. Plan para los chicos
   sin consentimiento (p. ej. no grabar esa clase, o grabar solo la voz del profe con micrófono de solapa).
3. **Asentimiento de los alumnos**: explicarles en el aula, con cartel visible "🔴 Se está grabando".
4. **Dirección de la unidad educativa** y **Dirección Distrital de Educación** (escuela fiscal):
   autorización por escrito del uso, del destino de las alertas y de quién las revisa.
5. **Protocolo de alertas**: quién revisa (una persona, nunca la IA sola), en cuánto tiempo, y cómo se
   deriva a la Defensoría de la Niñez y Adolescencia si corresponde (Ley 548, Código Niña, Niño y
   Adolescente). La IA puede equivocarse: nunca se actúa solo por la alerta.
6. **Datos**: aviso de privacidad (proveedor Google/Gemini, servidores en EE. UU., vencimientos).
   Revisar con un abogado la normativa boliviana de protección de datos vigente.

## Costo
- Estimado: audio ≈ 32 tokens/s → ~115.000 tokens por hora. Con Flash-Lite ≈ **USD 0,05–0,08 por
  hora de clase** (precios de agregadores; confirmar en ai.google.dev/pricing).
- **Medido (8-nov, `gemini-3.1-flash-lite`)**: clase de prueba de 69 s → **USD 0,0020** (3.067 tokens),
  respuesta en ~3 s. Extrapolado linealmente da USD 0,11/hora, pero en clips cortos pesa la parte fija
  (instrucción + JSON ≈ 850 tokens). Para una hora real: ~115.000 tokens de audio (USD 0,058) + salida
  con transcripción (~15.000 tokens, USD 0,022) ≈ **USD 0,08 por hora de clase**. 5 horas por día ≈
  USD 0,40/día por profe → USD 72 por profe por año escolar (180 días). El log `clase_resumida`
  guarda `costoPorHoraUsd` de cada clase real para confirmarlo.
- Si se quiere bajar: no pedir la transcripción (ahorra ~25 %), o resumir solo la voz del profe.

## Cierre (9-nov-2026)

**Hecho** (PR #20, mergeado a `main` el 9-nov-2026 con el OK del dueño)
- Publicado en el canal de vista previa `https://nande-educacion--edu-04a-m9feaits.web.app/maqueta/tutor.html#clase`
  (vence a los 14 días; esta rama ya no publica en el sitio en vivo para no pisar a EDU.06b).
  Functions `eduClase` y `eduClases` en vivo; `eduKayToken`/`eduProfes` siguen andando (prueba de Kay ✅).
- Prueba automática en cada deploy ✅: seguridad (sin cuenta / alumno / otro curso), resumen en ~3 s,
  sin nombres, tarea encontrada, sin alertas inventadas, audio no guardado, vencimientos, formato de
  iPhone, y **Taji contesta "¿qué tarea dejó el profe?" con la tarea de la clase real**.
- Playwright local (micrófono falso, servidor simulado) en celular y laptop: aviso obligatorio, 🔴,
  pausa, terminar, corte automático a los 2 min, informe.

**Pendiente**
- Prueba del dueño en su celular (hablar 1–2 min en la "Clase de prueba").
- Parte de dirección: diseño fino con el dueño (arriba).
- Login real de profes y nombres del curso desde la base → EDU.03.
- Grabar en segundo plano con la pantalla apagada no está garantizado en todos los celulares
  (se pide Wake Lock); probar en el teléfono del profe del piloto.
- Precios de agregadores: confirmar en ai.google.dev/pricing.
- Próximo trabajo propuesto por la MAESTRA: EDU.04b (cronograma y mentora del profe), esperando su OK.
