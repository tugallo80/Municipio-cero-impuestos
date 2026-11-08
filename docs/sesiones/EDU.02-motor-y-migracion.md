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

## Cierre (8-nov-2026)

**Hecho** (PR #3, sin mergear; publicado desde la rama con permiso del dueño)
- Educación es app aparte: sitio de Hosting `nande-educacion` → https://nande-educacion.web.app
  con `/prueba-motor/` (página técnica) y `/maqueta/` (EDU.01). Workflow `.github/workflows/educacion.yml`
  (se dispara con push a `educacion/**` en esta rama o en `main`).
- Base propia `municipio-ia-educacion` (Realtime Database, cerrada al navegador), separada de la del municipio.
- Functions `eduKayToken` y `eduKayUso` (codebase `educacion`, Node 22, us-central1) — ACTIVE; sus logs
  se leen con `claude-code` (`jsonPayload.evento="kay_uso"`). Ver `educacion/services/ai-gateway/README.md`.
- Personalidad camba original: `educacion/services/ai-gateway/tutor/personalidad-kay.md`.
- Privacidad: instrucción armada en el servidor y bloqueada en el token efímero (probado: el navegador
  no la puede cambiar); a Gemini solo llegan curso, estilo y contenido (prueba automática).
- Cuota: 8 charlas/día, 10 min/charla, 600.000 tokens/día por alumno, tope global USD 5/día.
- Cuenta de prueba `prueba` (sin nombre; en el repo solo el hash bcrypt de la clave). Registro libre desactivado.
- Clave pública del navegador limitada a login (ya no sirve para Gemini).
- Prueba de punta a punta automática en cada deploy: voz real → Kay entiende → guía sin dar la
  respuesta → registra costo; 6 voces; intento de inyección rechazado.

**Medido** (8-nov, Gemini 3.1 Flash Live preview): **~USD 0,025–0,03 por minuto de charla**
(~2.500 tokens por turno corto; el contexto de ~2.000 tokens de texto se vuelve a cobrar en cada turno).
10 min/día × 180 días ≈ USD 45–55 por alumno/año: más que la estimación de la investigación (USD 20).
Para bajarlo: acortar la instrucción, caché de contexto, o voz en el dispositivo (EDU.11).

**Voz**: por defecto **Sulafat** (Google la describe como "cálida"). Las 6 voces funcionan; la elección
final la hace el dueño escuchando en el celular (Claude no puede escuchar audio).

**Pendiente**
- Prueba del dueño en el celular y elegir voz.
- El modelo a veces se despide sin llamar a `terminar_conversacion`: la página corta sola al detectar
  la despedida del alumno (respaldo). Revisar con modelos nuevos.
- WhatsApp fuera de alcance (falta firma de Twilio; el webhook viejo sigue en Vercel) → ficha nueva.
  Procesador de PDF → EDU.04 (exigir rol de tutor).
- Precios tomados de agregadores: confirmar en ai.google.dev/pricing (`src/costos.js`).
- Sin moderación de contenido aparte (solo instrucciones de la personalidad) → antes de usar con
  alumnos reales.
- `workflow_dispatch` no se puede disparar desde la sesión (403 de la integración): se dispara con push.
- Cuenta `dueno` para las pruebas del dueño: 40 charlas/día (límite propio en el perfil,
  `limiteSesionesDia`); `prueba` y alumnos siguen con 8; tope global USD 5/día sin cambios.

**Pedido del dueño para la próxima sesión (no implementado)**
- **Dos tutores con personalidad propia, siempre disponibles**: "la profe" (voz Sulafat) y "el profe"
  (voz Achird). El niño llama a uno u otro por su nombre cuando quiere, sin elegir al inicio, y
  puede preferir uno por materia. Idea técnica: dos personalidades en `tutor/` y cambio de
  tutor dentro de la charla (herramienta `llamar_tutor` que cierra y abre sesión con la otra
  voz, o una sola sesión con las dos personalidades si el modelo permite cambiar de voz).
- **Interfaz final**: no un botón verde, sino toda la pantalla latiendo, como una boca que habla
  (animación al ritmo del audio de salida).
