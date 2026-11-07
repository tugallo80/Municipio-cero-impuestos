#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
#  ÑANDÉ SCZ Digital — configuración de Google Cloud / Firebase (una sola vez)
#
#  Lo corre el DUEÑO en Cloud Shell (shell.cloud.google.com, sirve desde el celular):
#    bash configurar-nande.sh <id-proyecto>            → solo revisa, no cambia nada
#    bash configurar-nande.sh <id-proyecto> aplicar    → crea/configura todo
#  ID sugerido: municipio-ia (minúsculas, números y guiones; único en todo Google Cloud)
#
#  Qué hace "aplicar" (cada paso se salta si ya está hecho):
#    1. Crea el proyecto si no existe.
#    2. Ofrece vincular facturación (plan Blaze, necesario para Cloud Functions).
#    3. Activa las APIs que usa la app.
#    4. Agrega Firebase al proyecto.
#    5. Crea la cuenta "github-deploy" y deja que SOLO GitHub Actions de este repo la use
#       (Workload Identity: no se guarda ninguna llave en GitHub).
#    6. Da a la cuenta "claude-code" permisos de SOLO LECTURA (logs, estado, versiones).
#    7. Ofrece guardar la clave de Gemini en Secret Manager (se escribe oculta).
#    8. Imprime los "Datos para GitHub" que hay que pegarle a Claude (no son secretos).
# ══════════════════════════════════════════════════════════════════════
set -euo pipefail

P="${1:?Uso: bash configurar-nande.sh <id-proyecto> [revisar|aplicar]}"
MODO="${2:-revisar}"
REPO="tugallo80/Municipio-cero-impuestos"
CLAUDE_SA="claude-code@desarrollo-personal-a831d.iam.gserviceaccount.com"
DEPLOY_SA="github-deploy@${P}.iam.gserviceaccount.com"
NOMBRE="MUNICIPIO IA"   # nombre visible del proyecto (sin Ñ ni tildes: Google no las acepta)
POOL="github"
PROVIDER="github-actions"

APIS=(
  firebase.googleapis.com firebasehosting.googleapis.com firebasedatabase.googleapis.com
  identitytoolkit.googleapis.com cloudfunctions.googleapis.com cloudbuild.googleapis.com
  run.googleapis.com artifactregistry.googleapis.com eventarc.googleapis.com
  secretmanager.googleapis.com iam.googleapis.com iamcredentials.googleapis.com
  sts.googleapis.com cloudresourcemanager.googleapis.com serviceusage.googleapis.com
  logging.googleapis.com generativelanguage.googleapis.com apikeys.googleapis.com
  cloudbilling.googleapis.com firebaseextensions.googleapis.com pubsub.googleapis.com
  storage.googleapis.com   # EDU.02: el deploy de Functions de Firebase los revisa
)

# Lo que necesita GitHub Actions para publicar Hosting, reglas y Functions.
ROLES_DEPLOY=(
  roles/firebase.admin
  roles/cloudfunctions.admin
  roles/run.admin
  roles/iam.serviceAccountUser
  roles/artifactregistry.admin
  roles/cloudbuild.builds.editor
  roles/secretmanager.admin
  roles/serviceusage.serviceUsageConsumer
  roles/serviceusage.apiKeysAdmin   # EDU.02: limitar la clave pública del navegador (que no sirva para Gemini)
)

# Claude: solo lectura. Nunca datos de ciudadanos/alumnos, secretos ni IAM.
ROLES_CLAUDE=(
  roles/logging.viewer
  roles/cloudfunctions.viewer
  roles/run.viewer
  roles/firebasehosting.viewer
  roles/serviceusage.serviceUsageConsumer
)
PROHIBIDOS_CLAUDE='roles/(owner|editor|viewer|firebase\.|firebasedatabase\.|firebaseauth\.|storage\.|secretmanager\.|iam\.|resourcemanager\.|datastore\.|cloudfunctions\.(admin|developer)|run\.(admin|developer)|firebasehosting\.admin)'

ok()   { echo "  ✅ $*"; }
mal()  { echo "  ❌ $*"; }
paso() { echo; echo "── $*"; }

# Reintenta (las cuentas recién creadas tardan unos segundos en verse en IAM).
reintentar() { local i; for i in 1 2 3 4 5 6; do "$@" && return 0; echo "   (reintento $i en 10 s…)"; sleep 10; done; return 1; }

token()  { gcloud auth print-access-token; }
fb_get() { curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $(token)" \
             -H "x-goog-user-project: $P" "https://firebase.googleapis.com/v1beta1/projects/$P"; }

roles_de() {
  gcloud projects get-iam-policy "$P" --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$1" --format="value(bindings.role)" | sort
}

revisar() {
  paso "Proyecto $P"
  if ! gcloud projects describe "$P" --format="value(projectNumber)" >/dev/null 2>&1; then
    mal "No existe (o no tenés acceso). Corré con 'aplicar' para crearlo."; return
  fi
  ok "Existe (número $(gcloud projects describe "$P" --format='value(projectNumber)'))"

  paso "Facturación"
  if [ "$(gcloud billing projects describe "$P" --format='value(billingEnabled)' 2>/dev/null)" = "True" ]; then
    ok "Activa (plan Blaze)"; else mal "Sin facturación: Hosting funciona, Cloud Functions no"; fi

  paso "Firebase"
  [ "$(fb_get)" = 200 ] && ok "Firebase agregado" || mal "Firebase no agregado"

  paso "Cuenta de deploy ($DEPLOY_SA)"
  if gcloud iam service-accounts describe "$DEPLOY_SA" --project="$P" >/dev/null 2>&1; then
    ok "Existe"; roles_de "$DEPLOY_SA" | sed 's/^/     /'
  else mal "No existe"; fi

  paso "Workload Identity (GitHub → Google, sin llaves)"
  if gcloud iam workload-identity-pools providers describe "$PROVIDER" --workload-identity-pool="$POOL" \
       --location=global --project="$P" >/dev/null 2>&1; then
    ok "Proveedor configurado, limitado a $REPO"
  else mal "No configurado"; fi

  paso "Cuenta claude-code (solo lectura)"
  local actuales malos
  actuales=$(roles_de "$CLAUDE_SA")
  [ -n "$actuales" ] && echo "$actuales" | sed 's/^/     /' || echo "     (sin roles)"
  malos=$(echo "$actuales" | grep -E "^$PROHIBIDOS_CLAUDE" || true)
  [ -n "$malos" ] && mal "Tiene roles que NO debería: $malos" || ok "Sin acceso a datos, secretos ni IAM"

  paso "Secreto GEMINI_API_KEY"
  gcloud secrets describe GEMINI_API_KEY --project="$P" >/dev/null 2>&1 && ok "Guardado" || mal "No guardado"
}

datos_github() {
  local num
  num=$(gcloud projects describe "$P" --format="value(projectNumber)")
  echo
  echo "════════ Datos para GitHub (copialos y pegáselos a Claude — no son secretos) ════════"
  echo "PROYECTO=$P"
  echo "WIF_PROVIDER=projects/$num/locations/global/workloadIdentityPools/$POOL/providers/$PROVIDER"
  echo "DEPLOY_SA=$DEPLOY_SA"
  echo "═══════════════════════════════════════════════════════════════════════════════════════"
}

aplicar() {
  paso "1. Proyecto"
  if gcloud projects describe "$P" >/dev/null 2>&1; then ok "Ya existe"
  elif gcloud projects create "$P" --name="$NOMBRE"; then ok "Creado: $NOMBRE ($P)"
  else
    mal "No se pudo crear '$P'. Si dice que el ID ya está en uso, probá con otro, por ejemplo:"
    echo "     bash c.sh ${P}-scz aplicar"
    exit 1
  fi
  local num; num=$(gcloud projects describe "$P" --format="value(projectNumber)")

  paso "2. Facturación"
  if [ "$(gcloud billing projects describe "$P" --format='value(billingEnabled)' 2>/dev/null)" = "True" ]; then
    ok "Ya activa"
  else
    mapfile -t CUENTAS < <(gcloud billing accounts list --filter="open=true" --format="value(name,displayName)")
    if [ "${#CUENTAS[@]}" -eq 0 ]; then
      mal "No tenés cuentas de facturación abiertas. Cloud Functions no va a andar hasta activarla."
    else
      echo "  Cuentas disponibles:"; local i=1
      for c in "${CUENTAS[@]}"; do echo "    $i) $c"; i=$((i+1)); done
      read -r -p "  ¿Número de cuenta a vincular? (Enter = no vincular ahora): " n
      if [[ "$n" =~ ^[0-9]+$ ]] && [ "$n" -ge 1 ] && [ "$n" -le "${#CUENTAS[@]}" ]; then
        gcloud billing projects link "$P" --billing-account="$(echo "${CUENTAS[$((n-1))]}" | awk '{print $1}')" \
          --format=none && ok "Vinculada"
      else echo "  (saltado)"; fi
    fi
  fi

  paso "3. APIs"
  gcloud services enable "${APIS[@]}" --project="$P" && ok "Activadas"

  paso "4. Firebase"
  if [ "$(fb_get)" = 200 ]; then ok "Ya agregado"
  else
    curl -s -X POST -H "Authorization: Bearer $(token)" -H "x-goog-user-project: $P" \
      -H "Content-Type: application/json" -d '{}' \
      "https://firebase.googleapis.com/v1beta1/projects/$P:addFirebase" >/dev/null
    for _ in $(seq 1 20); do [ "$(fb_get)" = 200 ] && break; sleep 3; done
    [ "$(fb_get)" = 200 ] && ok "Agregado" || mal "No se pudo: agregalo en console.firebase.google.com → Agregar proyecto → elegir $P"
  fi

  paso "5. Cuenta de deploy + Workload Identity"
  if ! gcloud iam service-accounts describe "$DEPLOY_SA" --project="$P" >/dev/null 2>&1; then
    gcloud iam service-accounts create github-deploy --project="$P" --display-name="Deploy desde GitHub Actions"
    sleep 15
  fi
  for R in "${ROLES_DEPLOY[@]}"; do
    reintentar gcloud projects add-iam-policy-binding "$P" --member="serviceAccount:$DEPLOY_SA" --role="$R" \
      --condition=None --format=none && echo "   + $R"
  done
  gcloud iam workload-identity-pools describe "$POOL" --location=global --project="$P" >/dev/null 2>&1 || \
    gcloud iam workload-identity-pools create "$POOL" --location=global --project="$P" --display-name="GitHub Actions"
  gcloud iam workload-identity-pools providers describe "$PROVIDER" --workload-identity-pool="$POOL" \
      --location=global --project="$P" >/dev/null 2>&1 || \
    gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" --project="$P" --location=global \
      --workload-identity-pool="$POOL" --display-name="GitHub Actions" \
      --issuer-uri="https://token.actions.githubusercontent.com" \
      --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
      --attribute-condition="assertion.repository=='$REPO'"
  reintentar gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SA" --project="$P" \
    --role=roles/iam.workloadIdentityUser --format=none \
    --member="principalSet://iam.googleapis.com/projects/$num/locations/global/workloadIdentityPools/$POOL/attribute.repository/$REPO"
  ok "Solo GitHub Actions de $REPO puede usar $DEPLOY_SA"

  paso "6. claude-code (solo lectura)"
  for R in "${ROLES_CLAUDE[@]}"; do
    gcloud projects add-iam-policy-binding "$P" --member="serviceAccount:$CLAUDE_SA" --role="$R" \
      --condition=None --format=none && echo "   + $R"
  done

  paso "7. Clave de Gemini (se crea sola dentro del proyecto)"
  if gcloud secrets describe GEMINI_API_KEY --project="$P" >/dev/null 2>&1; then ok "Ya guardada"
  else
    local KN K
    KN=$(gcloud services api-keys list --project="$P" --filter='displayName="Gemini MUNICIPIO IA"' \
           --format="value(name)" 2>/dev/null | head -1)
    if [ -z "$KN" ]; then
      gcloud services api-keys create --project="$P" --display-name="Gemini MUNICIPIO IA" \
        --api-target=service=generativelanguage.googleapis.com --format=none 2>/dev/null || true
      KN=$(gcloud services api-keys list --project="$P" --filter='displayName="Gemini MUNICIPIO IA"' \
             --format="value(name)" 2>/dev/null | head -1)
    fi
    K=""
    [ -n "$KN" ] && K=$(gcloud services api-keys get-key-string "$KN" --format="value(keyString)" 2>/dev/null || true)
    if [ -z "$K" ]; then
      echo "  No se pudo crear sola. Creala en aistudio.google.com/app/apikey (proyecto $P)."
      read -r -s -p "  Pegá la clave (no se ve al escribir; Enter = después): " K; echo
    fi
    if [ -n "$K" ]; then
      printf '%s' "$K" | gcloud secrets create GEMINI_API_KEY --project="$P" \
        --replication-policy=automatic --data-file=- --format=none && ok "Guardada en Secret Manager (solo sirve para Gemini)"
    else echo "  (saltado)"; fi
    unset K
  fi

  revisar
  datos_github
}

case "$MODO" in
  revisar) revisar ;;
  aplicar) aplicar ;;
  *) echo "Uso: bash configurar-nande.sh <id-proyecto> [revisar|aplicar]"; exit 2 ;;
esac
