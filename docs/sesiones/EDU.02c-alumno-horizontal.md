# EDU.02c — Alumno en horizontal

## Objetivo
El dueño vio que los chicos juegan con el celular **acostado**. La app del alumno
(`educacion/maqueta/alumno.html`) pasa a **horizontal primero**, como un juego.

## Antes de empezar
- Parte de `main` con el arreglo del PR #9 (`<base href="/maqueta/">`, no tocarlo).
- Leer `CLAUDE.md`, `docs/plan-maestro.md`, fichas de EDU.01b y EDU.02b, `docs/educacion/vision-interfaz.md`.
- Autorización del dueño: publicar en `nande-educacion` desde la rama, sin mergear.

## Tareas
1. Layout de juego: círculo de caminar abajo a la izquierda, acciones abajo a la derecha,
   caras de los profes arriba en una esquina, barra del curso y llaves arriba, compactas.
2. En vertical: aviso "Girá tu pantalla" con animación; "Jugar" pide pantalla completa y
   traba la pantalla acostada (Screen Orientation API, sin errores si no se puede).
3. Paneles para pantalla ancha sin tapar todo el mundo.
4. Marco/franja de la voz adaptados al ancho.
5. Probar 844×390, 915×412 y 1280×800 con Playwright; zonas seguras (notch).
6. Tutor, padres y dirección sin cambios.

## Hecho cuando
- En el celular acostado se camina, se abre una misión y se llama a un profe sin que nada se encime.
- En vertical aparece "Girá tu pantalla" (o se puede seguir en vertical).

## Cómo quedó (técnico)

| Pieza | Dónde |
|---|---|
| HUD, controles, paneles, inicio y aviso de girar | `educacion/maqueta/alumno.html` (CSS al principio, bloque "EDU.02c") |
| Pantalla completa + trabar horizontal | `pantallaJuego()` en `alumno.html` |
| Cámara según orientación y corrimiento con panel abierto | `ajustarCamara()` y `setViewOffset` en el bucle 3D |
| Píldora, franja y login de la voz en horizontal | `educacion/apps/web/profes/profes-voz.js` (`@media (orientation:landscape)`) |
| Capturas | `docs/sesiones/capturas/EDU.02c/` |

- **Horizontal**: caras de los profes arriba a la izquierda (por encima de los paneles: se
  los puede llamar en plena misión); arriba a la derecha puente del curso + apodo y llaves + salir (✕).
  Círculo de caminar abajo a la izquierda; Frases, Mochila y Ayuda (más grande) abajo a la derecha.
- **Paneles**: hoja lateral a la derecha (máx. 480 px, 520 en tablet). El mundo se corre a la
  izquierda para que el personaje quede a la vista. Tocar el mundo cierra el panel. Respuestas
  en 2 columnas, pizza y objetos más chicos para que entren en 390 px de alto.
- **Vertical**: pantalla de inicio con "▶ Jugar" + teléfono que gira. Si el aparato no gira solo
  (iPhone), aparece "Girá tu pantalla" con la opción "Seguir en vertical" (el diseño anterior,
  con hoja de abajo). La elección dura la visita (`sessionStorage`).
- **Zonas seguras**: todo usa `env(safe-area-inset-*)` en las 4 orillas.

## Cierre

**8-nov-2026** — PR #10 (`sesion/edu-02c` → `main`), sin mergear. Publicado desde la rama:
Hosting `nande-educacion` versión `bb8dd24` (FINALIZED, verificado por la API de Hosting).

**Deploy**: sitio y Functions OK. La prueba de voz marcó 1 chequeo en rojo ("al pedir el profe Jochi
llama a `llamar_profe`"), pero la transcripción muestra que sí lo llamó (`llamar_profe(profe='el_profe')`):
es la detección de la prueba, que a veces llega tarde. Esta sesión no tocó el servidor de voz.

**Prueba automática (Playwright, deviceScaleFactor 2, isMobile, hasTouch)**: 844×390, 915×412,
1280×800 y vertical 390×844. Inicio → Jugar → mundo 3D → misión con escalera → minijuego pizza →
profe (texto) → casa. Sin errores de JavaScript; controles sin encimarse. Fluidez: 12–14 fps en
celular y 6 en tablet **con render por software (sin GPU)**; no es comparable con un celular real
(EDU.01b medía ~18 fps igual). Los cambios no agregan trabajo al 3D.

**Ajuste (pedido de la MAESTRA: "al dueño le sigue vertical")**
- Caché: con cleanUrls la página se sirve como `/maqueta/alumno/` y el `no-cache` de `**/*.html` no
  aplicaba → nuevos headers `no-cache` para `/maqueta/**`, `/` y `/prueba-motor/**`, y `?v=edu02c-2`
  en los `.js`/`.css` propios de la maqueta y en `/voz/profes.js`. Al cambiar algo de la maqueta, subir ese número.
- Aviso "Girá tu pantalla": línea "Si no gira, activá la Rotación automática…" y botón "Probar de nuevo"
  (vuelve a pedir pantalla completa + trabar horizontal, que en Android funciona aunque la rotación esté apagada).
- Capturas de pantalla: la página no hace nada que las bloquee (no hay `FLAG_SECURE` en la web);
  en pantalla completa se sacan igual con los botones del celular.

**Ajuste 2 (pruebas del dueño en Android)**
- *Chrome incógnito sigue vertical, otro navegador sí gira*: el diseño ya depende solo del ancho y el alto
  de la pantalla (`orientation` en CSS es eso mismo) y cambia en caliente. Probado con Pixel 7 rotando
  en caliente: acostado → layout horizontal; parado → "Girá tu pantalla"; acostado otra vez → se va el aviso
  (`c1-pixel7-acostado.jpg`). La causa más probable era la página vieja guardada (ajuste 1). Si sigue,
  "Probar de nuevo" pide pantalla completa y traba horizontal, y el aviso explica la Rotación automática.
- *Pantalla azul en el navegador interno de la app de Claude*: si el 3D no arranca en 8 s aparece
  "La isla tarda en cargar" con "Reintentar", "Seguir sin 3D" (lista 2D) y el link para abrir en Chrome.
  Si el navegador no tiene WebGL, pasa directo a la lista 2D (`c2-3d-trabado.jpg`).
- *Login de voz cortado en horizontal*: ahora es compacto. El título va arriba, usuario y clave lado a
  lado y abajo los botones; mide unos 170 px de alto. Con el teclado abierto (alto 200 px) el campo se
  acomoda solo a la vista y "Entrar" queda visible (`c3-login-*.jpg`).

**Pendiente**
- Afinar la prueba de voz para que espere la llamada a `llamar_profe` antes de dar rojo (falso negativo).
- Prueba del dueño con un chico, celular acostado: ¿el círculo y los botones quedan cómodos para los pulgares?
- iPhone no permite trabar la orientación desde la web: ahí queda el aviso "Girá tu pantalla".
- La zona del notch no se pudo simular en Playwright: mirar en un celular con notch.
- Medir fluidez en un celular de gama media real (sigue pendiente desde EDU.02b).
