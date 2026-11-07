#!/usr/bin/env bash
# Arma la carpeta _site/ que publican Firebase Hosting y Vercel.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _site
mkdir -p _site
cp index.html _site/
cp municipio0_*.html _site/

# Gancho para Educación (llega con EDU.01): si existe la app de la tablet, se compila
# y se publica en /educacion.
APP=educacion/apps/tablet-client
if [ -f "$APP/package.json" ]; then
  echo "Compilando $APP..."
  (cd "$APP" && npm ci && npm run build)
  mkdir -p _site/educacion
  for out in dist build out; do
    if [ -d "$APP/$out" ]; then cp -r "$APP/$out/." _site/educacion/; break; fi
  done
fi

echo "Sitio listo en _site/:"
ls -R _site | head -50
