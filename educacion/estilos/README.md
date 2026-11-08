# Estilos del mundo ÑANDÉ (EDU.01c · EDU.06a)

| Archivo | Qué es |
|---|---|
| `index.html` | Vitrina para elegir: escalera de 6 escalones, transición, exploración A/B, lámina E, fps |
| `escena.html` | Una escena 3D por estilo (`?estilo=BLOQUES…PROMO`, `&vista=colegio|obra|portal|ciudad|profes|general`) |
| `transicion.html` | "Pasaste de curso": `?de=…&a=…` (y `&volver=/ruta` para volver al juego) |
| `construir.html` | Prueba de construcción tipo Townscaper (`?estilo=…`) |
| `mundo.js` | Base común: paletas, geometrías, techos, contorno, brillo; arma las escenas de la vitrina |
| `evolucion.js` | Kit por evolución para el juego del alumno (`educacion/maqueta/alumno.html`) |
| `arranque.js` | Carga de three.js y mundo.js con rompecachés, errores visibles, "▶ Ver" acostado |
| `capturas/` | Capturas y `fps.json` (se regeneran con `tools/estilos/generar.mjs`) |

Cursos → evolución: P1–P2 Bloques · P3–P4 Piezas · P5–P6 Mundo real · S1–S2 Horizonte ·
S3–S5 Mundo vivo · S6 Promo. Al cambiar `mundo.js`, `evolucion.js` o `arranque.js`, subir
`VERSION` en las páginas (y `VERSION_ESTILOS` en `alumno.html`).
