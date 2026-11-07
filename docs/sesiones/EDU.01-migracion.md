# EDU.01 — Migración de RubiKEduAI al repo

## Objetivo
El código de RubiKEduAI vive en `educacion/` con la estructura del documento de visión, compila,
y se publica en `/educacion` del sitio ÑANDÉ.

## Antes de empezar
- Leer `CLAUDE.md`, `docs/plan-maestro.md` y `docs/educacion/vision-plataforma-educativa.md`.
- INF.01 terminada (deploy automático funcionando).
- Repo origen: `tugallo80/rubikeduai-backend` (privado) — rama `main` (backend Vercel) y rama
  `claude/dashboard-hijos-kay` (dashboard React + Functions + seed).

## Mapeo origen → destino

| Origen | Destino |
|---|---|
| `dashboard/` (rama dashboard-hijos-kay) | `educacion/apps/tablet-client/` (Vite con `base: '/educacion/'`) |
| — (no existe aún) | `educacion/apps/admin-dashboard/` (panel profesor: carga de PDF del pensum) |
| `functions/` (kay.js, lib/firebase.js) | `educacion/services/ai-gateway/` (Cloud Functions) |
| `api/whatsapp.js`, `api/process-pdf.js`, `lib/*` (main) | `educacion/services/ai-gateway/` (pasar de Vercel a Functions, o dejar en Vercel — decidir) |
| `seed/` | `educacion/tools/seed/` |
| `dashboard/src/kay/` (copia de `tugallo80/kay`) | Se mantiene como copia, anotando la versión de origen |
| `.env.example` | `educacion/.env.example` con las variables del documento de visión |

## Tareas
1. Copiar conservando historial donde sea razonable (`git subtree` o copia con nota de commit de origen).
2. Ajustar rutas, `base` de Vite, `firebase.json` (codebase `educacion` para Functions).
3. Corregir antes de publicar:
   - Validar la firma de Twilio en el webhook de WhatsApp (hoy cualquiera puede llamarlo y gastar Gemini).
   - Quitar nombre real y región del prompt de Gemini (usar ID opaco) — requisito 4.3 de la visión.
   - Límite de mensajes por alumno por día (`MAX_TOKENS_PER_STUDENT_DAY`).
4. Secretos en Secret Manager: `GEMINI_API_KEY` (y Twilio si el webhook pasa a Functions).
5. Tarjeta "Educación" en el Hub.
6. Seed de los hijos en el proyecto nuevo (si el dueño eligió proyecto nuevo).

## Hecho cuando
- `https://<id-proyecto>.web.app/educacion/` abre el login de Rubik en el celular.
- Un hijo inicia sesión y habla por voz con el tutor.
- Ningún módulo de la raíz cambió de comportamiento.

## Cierre
(pendientes de la sesión)
