# EDU.15 — Demo sin login

**Rama:** `sesion/canal-edu-15` · **Pedido por:** MAESTRA 2 (con OK del dueño para publicar en `municipio-ia`)

## Objetivo
Una demo interactiva **sin fricción** para la reunión con el profe: nada de usuarios ni claves durante la
presentación. Un link con una **llave de demo** entra solo, como cuenta demo, en todo: panel del profe
(clase grabada, cronograma, mentora, tareas, mapa), Mis tareas, el juego y la voz de los profes.

## Cómo funciona
1. El link lleva la llave: `…/maqueta/tutor.html#demo=<llave>` (o `?demo=<llave>`). Sirve en cualquier
   página que cargue `/voz/clase.js` o `/voz/profes.js` (tutor.html, alumno.html, tareas.html).
2. La pantalla la saca de la barra de direcciones (no se ve al compartir pantalla) y la **recuerda en el
   equipo** (`localStorage` `nande-demo`): el iframe de `/presentacion/` (mismo dominio) y la app
   instalada entran solos.
3. `eduDemo({llave})` compara el SHA-256 con `edu/demo/llaves/*` y devuelve un **custom token** de
   Firebase para la cuenta fija `demo-nande-01` (sin clave). La pantalla entra con `signInWithCustomToken`.
4. Arriba aparece la pastilla **✨ Demo** (tocándola: "Salir de la demo", olvida la llave en ese equipo).

### La llave
- **No está en el repo**: en `tools/seed/demo.json` va solo su hash. La tiene el dueño (se la pasó la MAESTRA).
- **Rotar**: generar otra llave (`node -e "console.log(require('crypto').randomBytes(16).toString('base64url'))"`),
  poner su SHA-256 en `demo.json` y hacer push. Para cortar una llave, borrar su línea. Las Functions no cambian.
- Freno: más de 300 llaves malas en el día → la demo se apaga hasta mañana.
- Necesita que las Functions puedan firmar el pase: paso **5c** de `tools/cloudshell/configurar-nande.sh`.

### La cuenta demo
- Alumno de `2do_secundaria` (`alu_demo01`) **y** profe/dirección demo del mismo curso (`per_demo01`), con `demo: true`.
- Solo ve datos ficticios de su curso. No tiene clave: no se puede entrar con usuario.
- Cada deploy la deja "como nueva" (`tools/seed/datos-demo.js`), con las fechas corridas a esta semana:
  - 2 tareas enviadas (Inglés "Entrevista en casa" y Matemática "Racionales en el mercado"); 7 de 12 ficticios ya entregaron la primera.
  - Una clase grabada de ejemplo (Inglés, simple present) con informe, tarea y "avisos para casa".
  - Mapa armado en tres grupos por nivel (Números racionales).
  - Cronograma con Inglés, Filosofía, Artes, Música y Valores, con lo ya dado hasta noviembre.
  - Memoria de los profes IA en cero.

## Gasto
- **Bolsa propia** `edu/uso_demo`: USD 2/día (`EDU_TOPE_COSTO_DEMO_DIA_USD`), aparte de la general (5) y la de pruebas (1).
- **Caché de la demo**: la misma propuesta de tareas o de mapa vuelve al instante y sin costo
  (`edu/demo/cache`, 7 días). "↻ Otras ideas" pide una nueva. La mentora del cronograma ya tenía caché por tema.
- La prueba automática deja listas las tres propuestas del mapa ("Números racionales").

## Sin internet bueno / sin presupuesto
- En la demo, lo que depende de la IA (tareas, mapa, tarjeta de la mentora) espera **2,5 s**. Si tarda más,
  falla o la bolsa se agotó (`tope_demo`), se muestra un **ejemplo listo con el mismo aspecto**.
  Cuando llega lo de la mentora: botón "Ver las de la mentora" (tareas y mapa) o reemplazo automático (tarjeta).
- La voz no tiene ejemplo posible: si no hay presupuesto, Taji avisa con el mensaje amable de siempre.
- La clase grabada nueva tarda lo que tarda la IA (1–2 min); para la demo está la clase de ejemplo.

## Datos del alumno demo para la app (EDU.17) y el tutor (EDU.16)
`tools/datos/estudiante-demo.json` → `node tools/datos/armar-estudiante-demo.mjs` genera:
- `maqueta/estudiante-demo.js` → `window.ESTUDIANTE_DEMO = { apodo, avatar, curso, cursoNombre, materias,
  horario:[{dia,desde,hasta,materia,aula}], avisos:[{fecha,titulo,texto,materia}],
  eventos:[{fecha,tipo:'examen'|'acto'|'entrega',materia,titulo}], llevar:[{fecha,materia,texto}] }`
  (fechas calculadas al abrir, días hábiles desde hoy).
- `services/ai-gateway/tutor/estudiante-demo.json` (sin apodo ni avatar) para el tutor 24/7.

## Pruebas
- `npm test` (ai-gateway): bolsa demo separada, `tope_demo`, en el repo solo el hash.
- `tools/e2e/probar-demo.mjs` (workflow): llave mala rechaza · llave buena da el pase · entra sin clave ·
  ve tareas (alumno y profe), clase, mapa y cronograma · la voz gasta de la bolsa demo · caché del mapa ·
  bolsa agotada → `tope_demo`. Usa una llave de prueba propia que crea y borra.
- Playwright local con la IA simulada lenta (6 s): ejemplo a los 2,5 s, botón con la propuesta real, sin desbordes, 390 y 1280 px.

## Pendiente
- Si `eduDemo` responde "La demo todavía no está habilitada": el dueño corre el paso 5c (un comando en Cloud Shell).
- EDU.16 (tutor 24/7) lee `tutor/estudiante-demo.json` y los avisos para casa del informe.

## Cierre
(se completa al cerrar)
