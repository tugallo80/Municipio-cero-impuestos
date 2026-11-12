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

### El curso de la demo: el REAL del profe del piloto
Fuente única **`tools/datos/demo-piloto.json`** → `node tools/datos/armar-demo.mjs` genera `maqueta/demo-piloto.js`
(`window.DEMO_PILOTO`), `maqueta/curso-demo.js`, `maqueta/estudiante-demo.js` y las copias del servidor sin apodos;
el seed lo lee directo. Lo usan el panel del profe, la app del alumno (EDU.17), el tutor (EDU.16) y la presentación (EDU.14b).
- **U.E. Nuevo Horizonte** (rural, Santa Cruz) · **2.º de secundaria** · gestión 2026 · 3.er trimestre.
- **Profe:** el nombre REAL no va en el repo, la base ni la IA. Llega por el link (`?profe=…&profeApodo=…`, también `apodo` o en el `#`,
  lo arma la presentación), se guarda solo en el equipo (`localStorage` `nande-profe`) y se borra de la barra.
  Sin valor: "Profe" (`demo-piloto.json`). `U.nombreProfe()` en la maqueta.
- **Materias del profe:** las de los textos que pasó él: Inglés, Cosmovisiones-Filosofía-Psicología, Artes Plásticas,
  Música y Valores (a confirmar). Lengua, Matemática, Bio-Geo y Sociales quedan en el horario del alumno.
- **Hoy** (últimas unidades de cada texto): Inglés u.9 "Musical instruments and sports" (pág. 57) · Filosofía u.9
  "Autoconocimiento y proyecto de vida" (pág. 48) · Artes u.9 "La escultura: bajo, medio y alto relieve" (pág. 38) ·
  Música u.13 "Ensambles instrumentales" (pág. 49) · Valores u.10 "Vidas ejemplares… vocacionales" (pág. 38).
- **Toda la maqueta** (selector de perfiles, profe, padres, dirección) muestra el colegio del piloto: `demo-piloto.js`
  se carga después de `datos-demo.js` y pisa `DEMO.colegio` (y `DEMO.tutor.nombre` con `nande-profe`).
- **Convención de nombres** (solo en el equipo, nunca en el repo, la base ni la IA; los guarda la presentación):
  `nande-profe` = nombre formal del profe (panel del profe, presentación) · `nande-profe-apodo` = cómo lo llaman
  sus alumnos (app del alumno y tutor) · `nande-apodo` = apodo del alumno, opcional (si no, "Jaguar Azul 7") ·
  `nande-demo` = la llave de la demo.
- **Alumnos:** 12 ficticios con apodos ("Jaguar Azul 7", "Tucán Verde 3"…); el alumno demo es Jaguar Azul 7.

### La cuenta demo
- Alumno de `2do_secundaria` (`alu_demo01`, en pantalla Jaguar Azul 7) **y** profe/dirección del mismo curso (`per_demo01`), con `demo: true`.
- Solo ve datos ficticios de su curso. No tiene clave: no se puede entrar con usuario.
- Cada deploy la deja "como nueva" (`tools/seed/datos-demo.js`), con las fechas corridas a esta semana:
  - 2 tareas enviadas: Inglés "Questions about sports and music" (de la clase) y Filosofía "Mi proyecto de vida en 5 pasos" (del cronograma).
  - Clase grabada de ayer: Inglés, lectura "Patricia's talents" (pág. 57) y present continuous en preguntas (pág. 58), con tarea y aviso para casa.
  - Mapa armado en tres grupos por nivel ("Present continuous: interrogative form").
  - Cronograma de la gestión 2026 con las 5 áreas del profe: todo lo anterior al tema de hoy, marcado como dado.
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
Salen de `demo-piloto.json` (sección `estudiante`) con `node tools/datos/armar-demo.mjs`:
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
- **Permiso para firmar el pase** (paso 5c): el primer deploy confirmó que falta (`iam.serviceAccounts.signBlob`
  denegado a la cuenta de las Functions). Lo corre el dueño una vez en Cloud Shell.
- Confirmar con el dueño qué materias da el profe y su nombre (`demo-piloto.json`).
- EDU.16 (tutor 24/7) lee `tutor/estudiante-demo.json` y los avisos para casa del informe.

## Cierre
(se completa al cerrar)
