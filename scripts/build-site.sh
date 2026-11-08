#!/usr/bin/env bash
# Arma la carpeta _site/ que publican Firebase Hosting y Vercel.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _site
mkdir -p _site
cp index.html _site/
cp municipio0_*.html _site/

# Educación es una app aparte (sitio nande-educacion): no se copia aquí.

# Educación: material de los talleres con niños (EDU.01b) en /educacion/talleres.
if [ -d docs/educacion/talleres ]; then
  mkdir -p _site/educacion/talleres
  cp -r docs/educacion/talleres/. _site/educacion/talleres/
fi

# Educación: propuestas de estilo visual para que el dueño elija (EDU.01c), en
# /educacion/estilos. Es material de decisión, como los talleres; no es la app.
if [ -d educacion/estilos ]; then
  mkdir -p _site/educacion/estilos
  cp -r educacion/estilos/. _site/educacion/estilos/
fi

echo "Sitio listo en _site/:"
ls -R _site | head -50
