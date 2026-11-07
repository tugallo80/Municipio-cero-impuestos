# voz-kay — motor de voz en vivo del tutor

Conversación por voz con Gemini Live: audio del micrófono → modelo → audio por el parlante, sin
pasar por texto en el medio. El modelo detecta solo cuándo el alumno empieza y termina de hablar,
y se lo puede interrumpir hablando encima (barge-in).

Origen: `tugallo80/rubikeduai-backend`, rama `claude/dashboard-hijos-kay`, `dashboard/src/kay/` y
`dashboard/public/audioWorklets/` (commit `bbf7789`). La interfaz vieja (React, `RobotFace`) no se migró.

| Archivo | Qué es |
|---|---|
| `src/kaySession.js` | El motor, sin framework: `iniciarSesionKay({ obtenerToken, … })` → `{ cerrar }` |
| `src/useKayLive.js` | Hook de React para la futura app del alumno (EDU.06) |
| `audioWorklets/pcmCapture.worklet.js` | Micrófono a PCM16 16 kHz |
| `audioWorklets/pcmPlayback.worklet.js` | Reproducción 24 kHz con colchón anti-cortes (220 ms) |

## Cómo se usa

1. Los worklets tienen que servirse como archivos reales (no import de Vite): copiarlos a una
   carpeta pública y pasar `workletBasePath`.
2. `obtenerToken()` llama al servidor (`eduKayToken`), que devuelve un **token efímero de un solo
   uso con toda la configuración bloqueada** (personalidad, voz, herramientas). El navegador nunca
   ve la instrucción de sistema ni la clave de Gemini.
3. `onUso` recibe el `usageMetadata` de cada turno: al cerrar, mandar la lista a `eduKayUso` para
   registrar tokens y costo por minuto.

Ejemplo completo: `educacion/apps/web/prueba-motor/main.js`.

## Cosas aprendidas (no romper)

- Los `AudioContext` pueden quedar "suspended" y entonces no se escucha ni se manda nada, sin
  error: por eso se llama a `resume()` siempre.
- Google da de baja modelos de la Live API seguido (cierre 1008 "not found"): el modelo se cambia
  en el servidor, `educacion/services/ai-gateway/tutor/config.js`.
