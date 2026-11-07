#!/usr/bin/env bash
# Prueba, desde una sesión de Claude, los permisos de claude-code en el proyecto de ÑANDÉ (solo lecturas).
# Uso: bash tools/probar-permisos-claude-code.sh <scratchpad> <id-proyecto>
# La llave se escribe en el scratchpad, nunca en el repo.
S="${1:?Pasá el scratchpad de la sesión}"
P="${2:?Pasá el id del proyecto}"
[ -f "$S/sa.json" ] || { echo "$GCP_SA_KEY_B64" | base64 -d > "$S/sa.json"; chmod 600 "$S/sa.json"; }
export CLOUDSDK_CONFIG=$S/gcloud; unset CLOUDSDK_AUTH_ACCESS_TOKEN
gcloud auth list --format="value(account)" 2>/dev/null | grep -q claude-code || \
  gcloud auth activate-service-account --key-file="$S/sa.json" -q 2>&1 | tail -1
T=$(gcloud auth print-access-token)
r() { printf "%-36s" "$1"; shift; out=$("$@" 2>&1); c=$?
      if [ $c -eq 0 ]; then echo "PERMITIDO  $(echo "$out" | head -1 | cut -c1-60)"
      else echo "DENEGADO   $(echo "$out" | grep -oE 'PERMISSION_DENIED|403|401|denied|does not have|Permission|not enabled' | head -1)"; fi; }
h() { code=$(curl -s -o "$S/resp" -w '%{http_code}' -H "Authorization: Bearer $T" -H "x-goog-user-project: $P" "$1")
      [ "$code" = 200 ] && echo ok || { echo "HTTP $code" >&2; return 1; }; }
echo "== Debería estar PERMITIDO =="
r "Logs"                 gcloud logging read 'severity>=DEFAULT' --project="$P" --limit=1 --freshness=30d --format="value(timestamp)"
r "Lista de Functions"   gcloud functions list --project="$P" --format="value(name)"
r "Servicios Cloud Run"  gcloud run services list --project="$P" --region=us-central1 --format="value(metadata.name)"
r "Versiones de Hosting" h "https://firebasehosting.googleapis.com/v1beta1/sites/$P/releases?pageSize=1"
echo "== Debe seguir DENEGADO siempre =="
r "Leer la base"         h "https://$P-default-rtdb.firebaseio.com/.json?shallow=true&access_token=$T"
r "Listar usuarios Auth" h "https://identitytoolkit.googleapis.com/v1/projects/$P/accounts:batchGet?maxResults=1"
r "Leer GEMINI_API_KEY"  gcloud secrets versions access latest --secret=GEMINI_API_KEY --project="$P"
r "Ver política IAM"     gcloud projects get-iam-policy "$P" --format="value(etag)"
