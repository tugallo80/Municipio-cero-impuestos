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

## Cierre
(pendientes de la sesión)
