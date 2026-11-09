# EDU.04c — Panel del profe en celular y PC

## Objetivo
Pedido urgente para la reunión con el profe del piloto: en el celular, la tarjeta "Tu clase ahora"
ponía el texto en una columna angostísima (el ícono y el botón le comían el ancho). Arreglarlo y
revisar todo el panel del profe en 360 y 390 px (celular) y 1280 px (PC).

## Hecho
- Regla general `.fila-accion` (`educacion/maqueta/estilos.css`): en el celular, las tarjetas con botón
  van **apiladas**: texto arriba, botón abajo a todo el ancho. En PC quedan en una fila.
  Se usa en "Tu clase ahora", el horario de Clase grabada y los periodos de "Hoy" del cronograma
  (botones "💡 Ideas" y "○ Dado").
- Temas del plan: título y contenidos arriba, controles (largo, trimestre, ↑ ↓ ✕) abajo.
- Semana del cronograma en el celular: se desliza de a un día (80 % del ancho).
- Revisión automática (Playwright) en 360, 390 y 1280 px de 19 pantallas: Hoy (y el aviso de
  grabar), Clase grabada, informe de ejemplo, Cronograma (bienvenida, 4 pasos, listo, día, temas,
  mentora, PDC), Alumnos, ficha de alumno, Misiones, Nueva misión y Pensum. Chequea desbordes
  horizontales y textos aplastados (bloques de menos de 110 px con varias líneas): **0 problemas**.
- Capturas: `docs/sesiones/capturas/EDU.04c/` (360 y 1280 px).
- Esta rama publica en un **canal de vista previa** (no en el sitio en vivo, que usa EDU.06b), en su propia cola y sin tocar Functions: https://nande-educacion--edu-04c-isjznr7h.web.app/maqueta/tutor.html

## Pendiente
- La revisión se hizo con Chromium; probar en el celular real del dueño (Android) y en un iPhone si hay.
- El script de revisión vive en la sesión; si sirve, pasarlo a `educacion/tools/e2e/` para correrlo en cada deploy.
