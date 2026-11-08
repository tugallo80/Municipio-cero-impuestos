#!/usr/bin/env bash
# Arma la carpeta _site/ que publican Firebase Hosting y Vercel.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _site
mkdir -p _site
cp index.html _site/
cp municipio0_*.html _site/

# Educación: la maqueta estática (EDU.01) se copia tal cual a /educacion/maqueta.
if [ -d educacion/maqueta ]; then
  mkdir -p _site/educacion/maqueta
  cp -r educacion/maqueta/. _site/educacion/maqueta/
fi

# Educación: material de los talleres con niños (EDU.01b) en /educacion/talleres.
if [ -d docs/educacion/talleres ]; then
  mkdir -p _site/educacion/talleres
  cp -r docs/educacion/talleres/. _site/educacion/talleres/
fi

# Educación: propuestas de estilo visual (EDU.01c) en /educacion/estilos.
if [ -d educacion/estilos ]; then
  mkdir -p _site/educacion/estilos
  cp -r educacion/estilos/. _site/educacion/estilos/
fi

# Educación: si existe la app de la tablet, se compila y se publica en /educacion.
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
