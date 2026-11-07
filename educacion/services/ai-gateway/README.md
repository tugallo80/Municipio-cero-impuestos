# ai-gateway — Cloud Functions de Educación

Codebase `educacion` en el proyecto `municipio-ia` (región `us-central1`, Node 22).
Lo publica `.github/workflows/educacion.yml`.

| Function | Qué hace |
|---|---|
| `eduKayToken` | Con sesión iniciada y perfil de alumno: revisa la cuota del día, arma la instrucción de Kay **en el servidor** (sin nombre: solo curso, estilo y contenido) y devuelve un token efímero de Gemini Live de **un uso**, que vence a los 10 min y trae **toda la configuración bloqueada** (personalidad, voz, herramientas). |
| `eduKayUso` | Al terminar la charla: recibe el `usageMetadata` de cada turno, calcula tokens y costo, cierra la sesión (una sola vez) y deja en los logs `jsonPayload.evento="kay_uso"` con `costoPorMinutoUsd`. |

| Carpeta | Qué hay |
|---|---|
| `tutor/personalidad-kay.md` | **La personalidad de Kay.** Se edita como texto, sin tocar código. |
| `tutor/config.js` | Modelo, voces permitidas y límites (cuota). |
| `tutor/instruccion.js` | Arma la instrucción: personalidad + curso + contenido. Filtra todo dato personal. |
| `src/costos.js` | Precios por millón de tokens y cálculo de costo. |
| `src/cuota.js`, `src/datos.js` | Cuota diaria (hora de Bolivia) y acceso a la base `municipio-ia-educacion`. |

## Seguridad

- Gemini nunca recibe nombre, RUDE, teléfono, ubicación ni el ID del alumno (prueba en `test/`).
- La clave de Gemini está en Secret Manager (`GEMINI_API_KEY`); el navegador solo ve tokens efímeros.
- Límites: 8 charlas por alumno por día, 10 minutos por charla, 600.000 tokens por alumno por día
  y un **tope global de USD 5 por día** para todo el sistema (se cambian en `.env`).
- La base de Educación niega toda lectura/escritura desde el navegador.

## Logs (con la cuenta claude-code, solo lectura)

```bash
gcloud logging read 'jsonPayload.evento="kay_uso"' --project=municipio-ia --limit=20 --freshness=1d
```

## Lo que NO se migró en EDU.02 (y por qué)

- **Webhook de WhatsApp** (`api/whatsapp.js` de `rubikeduai-backend`, rama `main`): queda **fuera de
  alcance**. Hoy no valida la firma de Twilio (cualquiera puede llamarlo y gastar Gemini) y le
  manda a Gemini el nombre y la región del alumno. Cuando se migre (sugerido: ficha propia), hay
  que: validar `X-Twilio-Signature` con `twilio.validateRequest` y el secreto `TWILIO_AUTH_TOKEN`
  en Secret Manager; reusar `tutor/instruccion.js` (sin nombre); y pasar por la misma cuota.
  Mientras tanto, el webhook viejo sigue en Vercel con el proyecto viejo, sin tocar.
- **Procesador de PDF** (`api/process-pdf.js`): es del panel del tutor (EDU.04). No tiene
  autenticación; al migrarlo, exigir rol de tutor.
- **Interfaz vieja** (React, `RobotFace`): no se migra; la reemplaza la nueva (EDU.04 en adelante).
