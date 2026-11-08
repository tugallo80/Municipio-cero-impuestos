# EDU.02 — Motor: migración de RubiKEduAI (sin la interfaz vieja)

## Objetivo
El **motor** de RubiKEduAI (tutor IA, voz en vivo con Kay, Functions, datos) vive en
`educacion/services/` y funciona en el proyecto `municipio-ia`. **La interfaz vieja no se migra**:
la reemplaza la nueva (maqueta EDU.01 → pantallas EDU.04 en adelante). Para probar el motor
alcanza una página técnica mínima.

## Antes de empezar
- Leer `CLAUDE.md`, `docs/plan-maestro.md` y `docs/educacion/vision-plataforma-educativa.md`.
- INF.01 terminada (deploy automático funcionando).
- Repo origen: `tugallo80/rubikeduai-backend` (privado) — rama `main` (backend Vercel) y rama
  `claude/dashboard-hijos-kay` (dashboard React + Functions + seed).

## Mapeo origen → destino

| Origen | Destino |
|---|---|
| `dashboard/src/kay/`, `dashboard/public/audioWorklets/` | `educacion/packages/voz-kay/` (reutilizable por la app del alumno) |
| `dashboard/src/pages/*`, `RobotFace.jsx`, `styles.css` | **No se migran** (interfaz vieja); quedan como referencia en el repo origen |
| `functions/` (kay.js, lib/firebase.js) | `educacion/services/ai-gateway/` (Cloud Functions) |
| `api/whatsapp.js`, `api/process-pdf.js`, `lib/*` (main) | `educacion/services/ai-gateway/` (pasar de Vercel a Functions, o dejar en Vercel — decidir) |
| `seed/` | `educacion/tools/seed/` |
| `.env.example` | `educacion/.env.example` con las variables del documento de visión |

## Tareas
1. Copiar conservando historial donde sea razonable (`git subtree` o copia con nota de commit de origen).
2. Ajustar rutas, `base` de Vite, `firebase.json` (codebase `educacion` para Functions).
3. Corregir antes de publicar:
   - Validar la firma de Twilio en el webhook de WhatsApp (hoy cualquiera puede llamarlo y gastar Gemini).
   - Quitar nombre real y región del prompt de Gemini (usar ID opaco) — requisito 4.3 de la visión.
   - Límite de mensajes por alumno por día (`MAX_TOKENS_PER_STUDENT_DAY`).
4. Secretos en Secret Manager: `GEMINI_API_KEY` (y Twilio si el webhook pasa a Functions).
5. Página técnica mínima `/educacion/prueba-motor/` para hablar con el tutor (no es la interfaz final).

## Hecho cuando
- En la página técnica, una cuenta de prueba habla por voz con el tutor y recibe respuestas guiadas.
- Las Functions aparecen desplegadas en `municipio-ia` y sus logs se ven con `claude-code`.
- Ningún módulo de la raíz cambió de comportamiento.

## Cierre (8-nov-2026, en curso)

**Hecho**
- Educación es app aparte: sitio de Hosting `nande-educacion` (https://nande-educacion.web.app),
  con `/prueba-motor/` (página técnica) y `/maqueta/` (EDU.01). Workflow `.github/workflows/educacion.yml`.
- Base propia `municipio-ia-educacion` (Realtime Database, cerrada al navegador), separada de la del municipio.
- Functions `eduKayToken` y `eduKayUso` (codebase `educacion`) — ver `educacion/services/ai-gateway/README.md`.
- Personalidad camba original: `educacion/services/ai-gateway/tutor/personalidad-kay.md`.
- Voz por defecto **Sulafat** (Google la describe como "cálida"); la página deja elegir entre 6.
- Privacidad: instrucción armada en el servidor y bloqueada en el token efímero; sin nombre del alumno.
- Cuota: 8 charlas/día, 10 min/charla, 600.000 tokens/día por alumno, tope global USD 5/día.
- Cuenta de prueba `prueba` (sin nombre; clave solo como hash bcrypt en el repo, la tiene el dueño por chat).
- Registro libre de cuentas desactivado.

**Pendiente**
- El dueño corre en Cloud Shell `tools/cloudshell/configurar-nande.sh municipio-ia aplicar` (activa
  `cloudbilling` y otras APIs que pide el deploy de Functions, deja compilar a la cuenta de
  cómputo, y da `apiKeysAdmin` al deploy para limitar la clave pública del navegador).
- WhatsApp fuera de alcance (falta firma de Twilio) → ficha nueva. Procesador de PDF → EDU.04.
- Precios de la voz tomados de agregadores: confirmar en ai.google.dev/pricing.

