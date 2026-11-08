# EDU.02d — Entrar a las aulas como en un mundo abierto

## Objetivo
En la app del alumno (`educacion/maqueta/alumno.html`), entrar a las aulas como en los juegos de mundo
abierto: acercarse y tocar "Entrar", o tocar el aula y que el personaje vaya solo.

## Antes de empezar
- Parte de `main` con EDU.02c (horizontal, giro de cámara, zoom). Pedido del dueño por la MAESTRA 2.
- Autorización: publicar en `nande-educacion` desde la rama, sin mergear.
- Rama: `sesion/edu-02c` (la sesión solo puede publicar en esa rama; ya estaba al día con `main`).

## Tareas
1. Cartel flotante "Entrar · <materia>" sobre la puerta más cercana (2–3 pasos), botón grande para el pulgar.
2. Tocar el aula/puerta en el mundo → camina solo hasta la puerta y entra; tocar durante la caminata la cancela.
3. "Entrar" abre lo mismo que hoy (panel del aula con sus misiones).
4. Diseño propio, acento verde ÑANDÉ; compatible con todo lo de EDU.02c; `<base href="/maqueta/">` intacto; `?v=`.

## Hecho cuando
- En el celular acostado: al acercarse a un aula aparece el cartel, al tocarlo se abre el aula; al tocar un aula
  lejana el personaje va solo y entra.

## Cómo quedó (técnico)
- **Cartel flotante** (`#cartel`): se proyecta cada cuadro desde la puerta (`interes[].pos` + `alto`) a la
  pantalla, con un pico que rebota hacia la puerta. Radio 3 unidades; con 0,5 de margen al alejarse para que no
  parpadee. Si hay varias puertas cerca, gana la más cercana. Se oculta con un panel abierto o mientras camina solo.
  Reemplaza al botón fijo "Entrar a …" de abajo a la derecha.
- Vale para todos los puntos del mundo: aulas ("🔢 Entrar · Mate"), lugares con niebla, tu casa, casas de
  compañeros ("Visitar · …") y el puente ("Ver el puente").
- **Ir solo** (`irHacia` / `piloto`): al tocar un aula, lugar, casa o puente, camina a la puerta con una marca
  verde que late en el piso y la píldora "Yendo a Mate… ✕ Parar". Si algo lo traba, rodea un poco por el
  costado; si a los 12 s no llegó, entra igual. Se cancela con el círculo de caminar, con otro toque en el
  mundo o con "✕ Parar". Tocar a un compañero sigue abriendo su casa directo.
- En compu: Enter o espacio entra a la puerta cercana.
- `?v=edu02d-1` en los archivos de la maqueta.

## Cierre
**8-nov-2026** — Prueba con Playwright (táctil, horizontal, 844×390 y 915×412): cartel "🎨 Entrar · Artes"
al lado de la puerta → su botón abre "Aula de Artes"; tocar el aula de Mate en el mundo → camina solo y abre
"Aula de Mate" (<1 s desde la plaza); tocar durante la caminata la cancela; el círculo la cancela. Giro de cámara,
pellizco, dos pulgares y toque corto siguen igual. Sin errores de JS. Capturas en `capturas/EDU.02d/`.

**Pendiente**
- Las aulas rodean la plaza: desde casi cualquier punto del centro hay una puerta a menos de 3 pasos, así que el
  cartel aparece seguido. Si molesta, bajar `RADIO_PUERTA` o mostrarlo solo mirando hacia la puerta.
- La caminata sola va en línea recta con un esquive simple (no hay mapa de caminos); en el mundo 3D final
  (EDU.06) conviene un camino de verdad.
- Prueba del dueño en el celular.
