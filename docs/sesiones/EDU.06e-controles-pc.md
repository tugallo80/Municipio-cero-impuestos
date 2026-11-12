# EDU.06e — Controles de compu en el mundo 3D

**Rama:** `sesion/pantalla-edu-06e` (canal de vista previa) · **Pedido:** dueño vía MAESTRA 2.

Problema: en la PC el juego caminaba con las letras, pero la cámara no giraba.

## Controles (convenciones de los juegos de mundo abierto)

| Tecla / mouse | Qué hace |
|---|---|
| W A S D | Caminar (como antes) |
| ↑ ↓ | Caminar adelante / atrás (se dejó así: ya se usaba y es lo más común) |
| ← → | Girar la cámara |
| Clic derecho + arrastrar | Girar la cámara y mirar arriba/abajo |
| M | Modo mirar: el mouse queda capturado y gira libre; Esc lo suelta |
| Rueda | Acercar / alejar |
| Shift | Correr |
| Espacio | Saltar (salto simple con gravedad) |
| E | Usar: lo que dice el cartel (entrar, sentarse, patear…); sentado, E se levanta |
| Enter | Igual que E (como antes) |
| Clic izquierdo | "Tocar para ir", como antes |
| En la cancha: J · K · L · Shift · P | Patear/tirar · pasar · quitar/robar · regate/finta · empezar partido |

- Antes Q/E giraban la cámara; ahora E es "usar" y el giro va con ← → o el mouse.
  Espacio antes entraba; ahora salta (Enter y E entran).
- Con teclado/mouse, los botones muestran su tecla (cartel "E", botones de la cancha).
- Ayuda chica la primera vez en compu ("WASD caminar · clic derecho girar · rueda zoom · E usar ·
  Espacio saltar · Shift correr"); se cierra con la primera tecla y no vuelve (`alumno-ayuda-pc`).
  En Ayuda hay un botón ⌨️ "Teclado y mouse" con la lista completa.
- Lo táctil no cambia (círculo, pulgar derecho para mirar, pellizco).
- Dentro del iframe de la presentación: al tocar el mundo toma el foco del teclado; la captura del
  mouse funciona (el iframe no tiene sandbox).

## Probado
- 1280×800 y 1920×1080 con teclado y mouse: ← gira, clic derecho gira, rueda acerca, Espacio salta,
  Shift corre (~1,7×), M captura el mouse, teclas de la cancha visibles y funcionando, sin errores.
- 915×412 táctil: el círculo camina, sin ayuda de teclado.
- Dentro del marco de la presentación: → gira y M captura el mouse.

## Pendiente
- Si se suma multijugador, mapear las mismas teclas a los eventos `{ quien, tipo }` del partido.
