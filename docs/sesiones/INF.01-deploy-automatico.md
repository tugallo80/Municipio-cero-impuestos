# INF.01 — Infra y deploy automático

## Objetivo
Cada merge a `main` publica el sitio solo; cada PR genera una URL de vista previa para probar
desde el celular. Vercel deja de fallar.

## Antes de empezar
- Leer `CLAUDE.md` y `docs/plan-maestro.md`.
- ✅ Proyecto `municipio-ia` configurado. Datos de Workload Identity en `docs/plan-maestro.md`
  (sección "Datos de Google Cloud").
- Comprobar acceso de lectura: `bash tools/probar-permisos-claude-code.sh $S municipio-ia`.

## Tareas
1. `firebase.json` + `.firebaserc`: Hosting publica `_site/`; cabeceras `no-cache` para HTML.
2. `scripts/build-site.sh`: copia `index.html` y `municipio0_*.html` a `_site/`; si existe
   `educacion/apps/tablet-client`, la compila y la pone en `_site/educacion/`.
3. GitHub Actions:
   - `deploy.yml`: en push a `main` → build → `firebase deploy --only hosting` (y Functions solo
     si cambió `educacion/services/` o `functions/`). Autenticación con
     `google-github-actions/auth` + Workload Identity (sin secretos).
   - `preview.yml`: en cada PR → canal de vista previa de Hosting y comentario con la URL.
4. Vercel: `vercel.json` con `buildCommand: bash scripts/build-site.sh` y `outputDirectory: _site`
   (arregla el error de carpeta de salida). Decidir con el dueño si Vercel queda como espejo o solo
   para el webhook de WhatsApp de Educación.
5. Enlazar `municipio0_transporte_mvp.html` en el Hub (hoy está huérfano).

## Hecho cuando
- El PR de esta sesión muestra una URL de vista previa que abre el Hub y los 6 módulos.
- Al mergear, la URL de producción (`municipio-ia.web.app`) se actualiza sola.
- `firebase hosting:channel:list` y logs visibles con la cuenta `claude-code`.

## Cierre

Hecho (PR #1, rama `sesion/inf-01`). Vista previa verificada: `https://municipio-ia--pr-1-lmdi7w7u.web.app` (versión con Hub + 6 módulos, publicada por `github-deploy`):
- `firebase.json` + `.firebaserc` (Hosting `municipio-ia`, publica `_site/`, HTML `no-cache`).
- `scripts/build-site.sh`: copia `educacion/maqueta/` (EDU.01) a `/educacion/maqueta/` y, si existe
  `educacion/apps/tablet-client`, la compila y copia `dist/`, `build/` u `out/` a `/educacion/`.
- `deploy.yml` (push a `main` → Hosting) y `preview.yml` (PR → canal `pr-N`, 14 días, comentario con URL).
  Los PR desde forks no generan vista previa (no reciben token de Google).
- `vercel.json` con `buildCommand` y `outputDirectory: "_site"`.
- Hub: enlace "Transporte MVP" con el estilo del botón "Panel Municipal".

Pendiente:
- Functions en `deploy.yml`: se agrega en EDU.02 (motor) cuando exista `educacion/services/` o `functions/`.
- Decisión del dueño: ¿Vercel queda como espejo del sitio o solo para el webhook de WhatsApp?
  Si en el panel de Vercel hay un "Output Directory" puesto a mano, borrarlo (manda `vercel.json`).
- Verificar después del merge que `municipio-ia.web.app` se actualiza sola.
