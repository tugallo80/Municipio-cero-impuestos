# ÑANDÉ SCZ Digital — Reglas para Claude

Súper app municipal: los ciudadanos cambian **impuestos por suscripciones y aportes** (reciclaje,
energía solar, consumo en el eMarket) y reciben servicios digitales a cambio.
Repo: `tugallo80/Municipio-cero-impuestos`. Plan general: `docs/plan-maestro.md`.

## Cómo trabajamos

- **El dueño trabaja desde el celular. Claude hace todo lo técnico**: código, commits, PRs, deploy,
  configuración. Nunca pedirle que corra comandos en una PC.
- Lo único que hace el dueño: aprobar, probar en el celular, y —cuando haga falta un permiso de
  administrador— pegar **un solo comando** en Cloud Shell (desde el navegador del celular).
- Responder siempre en **español**: chat, commits y PRs. Mensajes cortos, sin jerga; decir qué
  cambió y qué tiene que probar.
- **MAESTRA + sub-sesiones por módulo** (`INF.01`, `EDU.01`, `EDU.02`, `TRA.01`…; códigos en
  `docs/sesiones/README.md`). Cada sub-sesión tiene su ficha en `docs/sesiones/`. Al
  arrancar, leer este archivo, `docs/plan-maestro.md` y la ficha. Al cerrar, actualizar la tabla
  de estado del plan maestro y anotar lo pendiente en la ficha.
- Antes de borrar archivos, módulos, datos o repos: **pedir confirmación**, y hacerlo en un PR aparte.
- Cada PR: crearlo automáticamente después del push. Mergear solo si la sesión tiene el OK del
  dueño para ese objetivo y el deploy de vista previa funciona.

## Diseño ÑANDÉ

| Token | Valor |
|---|---|
| Primario | `#10B981` (verde esmeralda) |
| Fondo | negro `#000000` / superficies `#0A0A0A`, `#111111` |
| Texto | `#FFFFFF` y `#A3A3A3` secundario |
| Títulos | **Space Grotesk** (600–700) |
| Texto | **Inter** (400–600) |

- Pensado primero para celular (360 px), modo oscuro por defecto, botones grandes.
- **Siempre las dos versiones: celular (360–390 px) y PC (1280 px).** Probar cada pantalla en ambas
  antes de publicar (Playwright), sin texto apretado ni desbordes. En celular, tarjetas con botón: texto
  arriba y botón abajo a todo el ancho.
- Los prototipos actuales (`index.html`, `municipio0_*.html`) usan verde lima `#deff9a` sobre
  `#020617`. Se migran a ÑANDÉ módulo por módulo, no todos de golpe.

## Mapa del repo

| Ruta | Qué es |
|---|---|
| `index.html` | Hub (menú de módulos) |
| `municipio0_viaje_app.html`, `municipio0_transporte_mvp.html` | Transporte (tipo Yango) |
| `municipio0_marketplace.html` | eMarket municipal (reemplaza patentes) |
| `municipio0_vivienda_verde.html` | Vivienda verde: reciclaje + solar (reemplaza impuesto inmueble) |
| `municipio0_bienestar.html` | Bienestar / salud |
| `municipio0_dashboard_alcalde.html` | Dashboard del alcalde |
| `educacion/` | Módulo Educación (viene de `tugallo80/rubikeduai-backend`) — fichas `docs/sesiones/EDU.*`, visión en `docs/educacion/` |
| `docs/` | Plan maestro, fichas de sesión, visiones de cada módulo |
| `tools/cloudshell/` | Scripts que corre el dueño en Cloud Shell (permisos, proyecto) |

No romper los HTML de la raíz: el Hub los enlaza por nombre de archivo.

## Google Cloud desde la sesión

Las sesiones tienen `GCP_SA_KEY_B64` (cuenta `claude-code@desarrollo-personal-a831d.iam.gserviceaccount.com`).

```bash
S=<scratchpad de la sesión>            # NUNCA dentro del repo
echo "$GCP_SA_KEY_B64" | base64 -d > $S/sa.json && chmod 600 $S/sa.json
export CLOUDSDK_CONFIG=$S/gcloud; unset CLOUDSDK_AUTH_ACCESS_TOKEN
gcloud auth activate-service-account --key-file=$S/sa.json
bash tools/probar-permisos-claude-code.sh $S municipio-ia
```

- `claude-code` tiene **solo lectura** (logs, estado de Functions/Cloud Run, versiones de Hosting).
  No lee datos de ciudadanos/alumnos, ni secretos, ni IAM.
- El deploy lo hace GitHub Actions con la cuenta `github-deploy` por Workload Identity
  (sin llaves guardadas). Se configura una vez con `tools/cloudshell/configurar-nande.sh`.
- La llave nunca se commitea ni se imprime. Permisos nuevos: proponer el cambio en el script y
  que el dueño lo corra.

## Datos de menores y ciudadanos

- No mandar nombres reales, ubicación exacta ni identificadores personales a la IA: usar IDs opacos.
- Secretos (Gemini, Twilio) solo en Secret Manager / variables del proveedor, nunca en el repo.
