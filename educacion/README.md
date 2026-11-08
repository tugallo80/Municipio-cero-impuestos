# ÑANDÉ Educación

App aparte del municipio: sitio propio **https://nande-educacion.web.app** (Firebase Hosting
`nande-educacion`, proyecto `municipio-ia`). Se publica sola con `.github/workflows/educacion.yml`.

| Carpeta | Qué es |
|---|---|
| `apps/web/` | Sitio: portada, `/prueba-motor/` (página técnica para hablar con Kay) y `/maqueta/` |
| `services/ai-gateway/` | Cloud Functions del tutor (token de voz, cuota, costos) — ver su README |
| `services/ai-gateway/tutor/personalidad-kay.md` | Personalidad de Kay (se afina como texto) |
| `packages/voz-kay/` | Motor de voz en vivo del navegador (Gemini Live) |
| `maqueta/` | Maqueta navegable de EDU.01 |
| `tools/infra/` | Prepara el proyecto (sitio, base, login) — lo corre el workflow |
| `tools/seed/` | Reglas de la base, cuentas de prueba sin datos personales y contenido demo |
| `tools/e2e/` | Prueba de punta a punta con voz real contra lo publicado |
| `firebase.json`, `database.rules.json` | Config de deploy (codebase `educacion`) y reglas de la base |
| `.env.example` | Variables (secretas en Secret Manager, no secretas en `services/ai-gateway/.env`) |

Visión: `docs/educacion/`. Fichas: `docs/sesiones/EDU.*`.
