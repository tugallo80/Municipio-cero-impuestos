#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
#  Prepara en municipio-ia lo que necesita Educación (idempotente: si ya está, lo salta).
#  Lo corre el workflow "Educación — deploy" con la cuenta github-deploy (Workload Identity).
#
#   1. Sitio de Hosting propio: nande-educacion  (→ nande-educacion.web.app)
#   2. Realtime Database propia: municipio-ia-educacion (separada de la del municipio)
#   3. App web de Firebase (config pública para iniciar sesión)
#   4. Login con usuario/clave activado y registro libre DESACTIVADO
#      (solo el servidor crea cuentas de alumnos)
#   5. La clave pública del navegador queda limitada a login: no sirve para usar Gemini
#
#  Salida: escribe la config pública de la app web en $1 (JSON).
# ══════════════════════════════════════════════════════════════════════
set -euo pipefail
SALIDA_CONFIG="${1:?Pasá la ruta donde guardar la config web}"
P="${PROYECTO:-municipio-ia}"
SITIO="nande-educacion"
BASE="municipio-ia-educacion"
APP_NOMBRE="NANDE Educacion"
FB="npx --yes firebase-tools@15.34.1"

ok()   { echo "  ✅ $*"; }
aviso(){ echo "::warning::$*"; }
paso() { echo; echo "── $*"; }

paso "1. Sitio de Hosting $SITIO"
if $FB hosting:sites:list --project "$P" --json | grep -q "\"sites/$SITIO\"\|/sites/$SITIO\""; then ok "Ya existe"
else $FB hosting:sites:create "$SITIO" --project "$P" --non-interactive && ok "Creado"; fi

paso "2. Realtime Database $BASE"
if $FB database:instances:list --project "$P" --json | grep -q "\"$BASE\"\|/instances/$BASE\""; then ok "Ya existe"
else $FB database:instances:create "$BASE" --location us-central1 --project "$P" --non-interactive && ok "Creada"; fi

paso "3. App web de Firebase"
APP_ID=$($FB apps:list WEB --project "$P" --json | node -e '
  const r = JSON.parse(require("fs").readFileSync(0, "utf8")).result || [];
  const a = r.find((x) => x.displayName === process.argv[1]); console.log(a ? a.appId : "")' "$APP_NOMBRE")
if [ -z "$APP_ID" ]; then
  APP_ID=$($FB apps:create WEB "$APP_NOMBRE" --project "$P" --json | node -e '
    console.log(JSON.parse(require("fs").readFileSync(0, "utf8")).result.appId)')
  ok "Creada ($APP_ID)"
else ok "Ya existe ($APP_ID)"; fi
$FB apps:sdkconfig WEB "$APP_ID" --project "$P" --json | node -e '
  const c = JSON.parse(require("fs").readFileSync(0, "utf8")).result.sdkConfig;
  require("fs").writeFileSync(process.argv[1], JSON.stringify(c));' "$SALIDA_CONFIG"
API_KEY=$(node -e 'console.log(require(process.argv[1]).apiKey)' "$SALIDA_CONFIG")
echo "::add-mask::$API_KEY"
ok "Config pública guardada"

paso "4. Inicio de sesión (Firebase Auth)"
T=$(gcloud auth print-access-token)
H=(-H "Authorization: Bearer $T" -H "x-goog-user-project: $P" -H "Content-Type: application/json")
IT="https://identitytoolkit.googleapis.com"
COD=$(curl -s -o /dev/null -w '%{http_code}' "${H[@]}" "$IT/admin/v2/projects/$P/config")
if [ "$COD" != 200 ]; then
  curl -sf -X POST "${H[@]}" -d '{}' "$IT/v2/projects/$P/identityPlatform:initializeAuth" >/dev/null && ok "Auth inicializado"
fi
curl -sf -X PATCH "${H[@]}" \
  -d '{"signIn":{"email":{"enabled":true,"passwordRequired":true}},"client":{"permissions":{"disabledUserSignup":true}}}' \
  "$IT/admin/v2/projects/$P/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired,client.permissions.disabledUserSignup" \
  >/dev/null && ok "Usuario/clave activado; registro libre desactivado"

paso "5. Limitar la clave pública del navegador"
# Las claves "Browser key (auto created by Firebase)" sirven para CUALQUIER API activada,
# incluida Gemini: sin este límite, cualquiera que la copie de la página podría gastar.
if KEY_NAME=$(gcloud services api-keys lookup "$API_KEY" --format='value(name)' 2>/dev/null) && [ -n "$KEY_NAME" ]; then
  if gcloud services api-keys update "$KEY_NAME" --quiet \
       --api-target=service=identitytoolkit.googleapis.com \
       --api-target=service=securetoken.googleapis.com \
       --api-target=service=firebaseinstallations.googleapis.com >/dev/null 2>&1; then
    ok "Limitada a login (identitytoolkit, securetoken, firebaseinstallations)"
  else aviso "No se pudo limitar la clave del navegador (falta permiso apikeys). Ver tools/cloudshell/configurar-nande.sh"; fi
else aviso "No se pudo buscar la clave del navegador (falta permiso apikeys). Ver tools/cloudshell/configurar-nande.sh"; fi
