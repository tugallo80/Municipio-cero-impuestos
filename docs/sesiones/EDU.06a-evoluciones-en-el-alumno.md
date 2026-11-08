# EDU.06a — Las evoluciones en la app del alumno

## Objetivo

Que el juego del alumno (`educacion/maqueta/alumno.html`, de EDU.02c/02d) dibuje su mundo con la
**evolución del curso del alumno**, usando los estilos de EDU.01c (`educacion/estilos/`):

| Curso | Evolución |
|---|---|
| P1–P2 | 1 Bloques |
| P3–P4 | 2 Piezas |
| P5–P6 | 3 Mundo real |
| S1–S2 | 4 Horizonte |
| S3–S5 | 5 Mundo vivo |
| S6 | 6 Promo |

## Antes de empezar

- `CLAUDE.md`, `docs/plan-maestro.md`, ficha y cierre de `EDU.01c-estilo-visual.md`, EDU.02c/02d.
- Lanzada por la MAESTRA 2 con autorización del dueño para publicar en municipio-ia / nande-educacion.

## Tareas

1. El curso sale de los datos de demo; con `?demo=1` aparece un selector de curso que cambia la
   evolución y, al subir, muestra la transición "pasaste de curso".
2. Mantener todo lo que ya anda (horizontal, ▶ Jugar, ⛶, joystick, cámara, pellizco, cartel de
   puerta con radio 1,5, tocar el aula para ir solo, profes de voz, `<base href="/maqueta/">`,
   rompecachés `?v=`).
3. Bajada automática de calidad en 5 y 6; con `?diag=1`, aviso si una evolución no llega a 30 fps.
4. Probar con Playwright en horizontal y táctil (844×390 y 915×412) en cada evolución.

## Hecho cuando

- `nande-educacion.web.app/maqueta/alumno.html?demo=1` deja elegir curso; el mundo cambia de
  evolución; al subir se ve la transición y se vuelve al juego; se camina, se entra a un aula y se
  habla con un profe en las 6.

## Cierre

**8-nov-2026** — PR nuevo (`sesion/edu-01c` → `main`), sin mergear. Publicado en
`nande-educacion` desde la rama (se agregó `sesion/edu-01c` a `.github/workflows/educacion.yml`).

**Cómo se adaptó** (mundo.js arma una escena fija; el juego tiene su propio mapa):
- `educacion/estilos/evolucion.js`: "kit de evolución" por curso → formas (cubo, caja redondeada,
  esfera, cápsula, torso), materiales (Lambert / plástico / toon 2–3 tonos / PBR), luz, cielo,
  sombras (5–6), brillo (6), contorno (3–5), **fusión de lo fijo** (de ~190 mallas a ~33: menos
  llamadas de dibujo en todas las evoluciones) y calidad automática (5–6).
- `alumno.html` conserva mapa, colisiones, puertas, toques y controles; `bloque()`, techos, copas de
  árboles, suelo y personajes piden la forma y el material a la evolución. Las piezas que se mueven
  (puertas, avisos, bandera, tablas del puente, lugares que se abren, personajes) quedan aparte.
  Para tocar el mundo se siguen usando las mallas originales (aunque estén fusionadas).
- Personajes: el mismo esqueleto (piernas y brazos con pivote en cadera y hombro) con la forma de
  cada evolución: redondeado (2), cápsulas (3), más alto con torso y cuello (4–6).
- `?demo=1`: botón 🎓 arriba (curso · evolución) → panel con los 12 cursos. Si la evolución sube,
  va a `/estilos/transicion.html?de=…&a=…&volver=…` y el botón "Entrar a mi mundo nuevo" vuelve al
  juego con el curso nuevo. `?diag=1`: evolución, curso y fps; avisa "⚠ no llega a 30".
- Despliegue: `despues-del-build.mjs` copia `educacion/estilos/` a `/estilos/` del sitio de
  Educación; `educacion/firebase.json` manda `no-cache` para `/estilos/**`.

**Pruebas** (Playwright, táctil/isMobile, 844×390 y 915×412, sin GPU): en las 6 evoluciones carga
el mundo, se camina, el cartel "🔢 Entrar · Mate" aparece pegado a la puerta y abre el aula, y la
profe Taji responde (sin voz real: ayuda de texto). Sin errores de JavaScript.

| Evolución | fps en el servidor de pruebas (sin GPU) |
|---|---|
| 1 Bloques | 10–20 |
| 2 Piezas | 10–14 |
| 3 Mundo real | 11–13 |
| 4 Horizonte | 10–11 |
| 5 Mundo vivo | 5–6 (baja calidad sola) |
| 6 Promo | 2–4 (baja calidad sola) |

El juego del alumno ya daba ~18 fps en este servidor (EDU.01b): sin GPU todo es lento. Hay que
medir en el celular real con `?diag=1`.

**Arreglo: el dueño veía el mundo viejo en producción.** Sin 🎓 ni la barra de diag, aunque
abrió el link con `?demo=1&diag=1`. Como la barra de diag no depende de la evolución, eso solo se
explica si a la página **no le llegó el `?…`**: la redirección de Firebase `alumno.html →
alumno/` (cleanUrls + trailingSlash) en producción lo descarta (en la copia local con superstatic
sí se conserva, por eso las pruebas pasaban). Sin `demo`, 4A queda en "Piezas", que se parece a
Bloques. Arreglo: link sin redirección (`/maqueta/alumno/`), los parámetros también se leen del
`#` (que ninguna redirección borra), el HUD dice siempre el mundo ("4to A · mundo Piezas") y con
diag se muestra en pantalla si la evolución no cargó.

**App instalable** (para sacar el cartel de Chrome de la pantalla completa): `manifest.webmanifest`
(display fullscreen, orientation landscape, íconos propios 192/512, start_url `/maqueta/alumno/`,
scope `/maqueta/`), service worker mínimo `sw.js` **red primero** (solo usa lo guardado sin
internet; no toca la CDN ni la voz) y en Ayuda "📲 Instalar en el celular" (beforeinstallprompt, o
instrucciones si Chrome no lo ofrece). Probado: el SW se registra y controla la página, y con el SW
activo la evolución, el 🎓 y el HUD siguen bien.

**Demo recordado**: `?demo=1` queda guardado en el celular (localStorage), junto con el último curso
elegido, para que la app instalada (que abre sin parámetros) también muestre el 🎓; `?demo=0` lo
apaga. Probado: demo=1 + S1 → abrir sin parámetros sigue en S1 con 🎓 → demo=0 vuelve a P4 sin 🎓.

**Aviso**: en el deploy de las 18:55 UTC falló "Publicar las Functions" porque la facturación de
`municipio-ia` aparece desactivada (Secret Manager 403). El sitio (Hosting) sí se publicó.

**El mundo nuevo: Santa Cruz por anillos** (pedido del dueño, plan aprobado por la MAESTRA 2). La
isla vieja se reemplazó por la ciudad del diseño (vista "Ciudad" de la vitrina y lámina E):
- Anillos (1.º a 4.º) y avenidas radiales con cantero, centrados en la plaza 24 de Septiembre
  con la catedral (hito lejano), el Cristo en su rotonda sobre el 2.º anillo, otros colegios en
  verde, el río al oeste y áreas verdes con árboles sueltos (toborochi, tajibos en flor).
- **El colegio**: casona de ~26×26 m entre el 3.º y el 4.º anillo, con alas, techos a cuatro aguas,
  galerías con horcones alrededor del patio con aljibe y toborochi. Las **6 aulas** son puertas en
  las alas que dan a la galería, cada una con su color, su cartel de avance y el cartel "Entrar · …"
  a 1,5 m; tocar el aula de lejos sigue llevando solo. El zaguán es la salida a la ciudad. Adentro
  del colegio los techos se vuelven transparentes para ver el patio.
- Afuera: plazuela con bandera, **portal** "Visitar · Col. Los Tajibos" (panel de demo), tu casa y
  las de los compañeros cruzando el 3.er anillo, el parque escondido y el cuarto de objetos perdidos
  en la manzana, y la **obra de la ciudad: el zoológico** (sus piezas se completan con la barra
  "entre todos", antes el puente), con grúa y cartel.
- Área caminable ±45 m; colisiones por ala, casa, obra, hito cercano y árbol. Lo fijo se fusiona
  (~1450 piezas → ~41–47 mallas); en Bloques el suelo es de baldosas de 2 m.
- Probado con Playwright (915×412, táctil) en las 6 evoluciones: se camina, el cartel "Entrar ·
  Mate" abre el aula y la profe responde, sin errores.

**Ajustes del colegio por dentro (pedido MAESTRA 2)**
- Horcones solo en las esquinas y uno al medio de cada lado de la galería, con choque chico (el
  alumno no se traba).
- **Cámara de "zona interior"** (reutilizable para aulas y casas: `zonasInteriores`): al entrar al
  colegio baja suave a la altura de los ojos, por detrás del hombro; al salir vuelve a la vista de
  arriba. El pulgar derecho sigue mirando, el pellizco aleja un poco, y si hay una pared o un horcón
  detrás la cámara se acerca en vez de atravesarlo. El toborochi del patio se aclara si queda en el
  medio, y el cartel "Entrar" baja para no quedar bajo la barra de arriba.
- Arreglado el **techo negro** del colegio (la forma no tenía normales y la luz no la iluminaba).
- Pantalla "▶ Jugar": si la app no está instalada, botón grande "📲 Instalar ÑANDÉ"; si Chrome no
  lo ofrece, dos pasos (⋮ → "Instalar app" / "Agregar a pantalla de inicio").
- El manifest cumple lo que pide Chrome para instalar: íconos 192 y 512, service worker con
  `fetch`, `start_url` dentro del `scope`, https. `display: fullscreen` es válido, con
  `display_override` que cae a `standalone` donde no hay pantalla completa.

**Arreglo: pantalla negra al pasar de curso (P1 → P6)**
- Causa: Firebase sirve `/estilos/transicion.html` como `/estilos/transicion/`, y desde ahí la
  página buscaba sus archivos del 3D en `/estilos/transicion/…` (no existen) → "No se pudo cargar".
- Arreglo: las páginas de `estilos/` (transición, escena, construir) tienen `<base href="/estilos/">`,
  leen los datos también del `#`, y el juego y la vitrina enlazan directo a `/estilos/transicion/`
  (sin `.html`, sin redirección). Con `?diag=1` el error muestra el motivo.
- Probado contra la config real de Firebase (cleanUrls + trailingSlash): P1→S6, S6→P1, P3→P5,
  P4→P1, P1→P3, S1→S3, P5→S1, los enlaces viejos con `.html` y la vitrina.

**Pendiente**
- **Un solo kit para vitrina y juego** (pedido de la MAESTRA 2): hoy las dos usan la misma base de
  `mundo.js` (paletas, geometrías, techos, contorno, brillo/bloom), pero la luz, el cielo y los
  materiales están escritos dos veces (en `mundo.js` para la vitrina, horneados en lotes, y en
  `evolucion.js` para el juego, por material). Unificarlos implica reescribir cómo arma la vitrina
  sus escenas: queda para una próxima sesión, para no romper la vitrina ya aprobada.
- Medir en el celular/tablet real cada evolución con `?diag=1`.
- Los lugares con niebla, el puente y las casas usan las mismas piezas con otra forma: el arte
  propio de cada evolución (Blender, EDU.07) los va a reemplazar.
- Guardar el curso real del alumno en la base (EDU.03) en vez de los datos demo.
