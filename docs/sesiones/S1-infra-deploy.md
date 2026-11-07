# S1 — Infra y deploy automático

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
(pendientes de la sesión)
