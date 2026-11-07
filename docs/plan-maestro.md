# Plan maestro — ÑANDÉ SCZ Digital

> Fuente de verdad del proyecto. La **MAESTRA** ordena y lanza sub-sesiones; cada sub-sesión
> trabaja un objetivo acotado y, al terminar, actualiza la tabla de estado de abajo.

## Visión

Una súper app municipal donde el ciudadano **no paga impuestos tradicionales**: se suscribe y
aporta de formas que generan valor para la ciudad, y a cambio recibe servicios y beneficios.

| Hoy (impuesto) | ÑANDÉ (cambio) | Módulo |
|---|---|---|
| Impuesto a la vivienda | Se paga con **reciclaje** (créditos verdes) | Vivienda verde |
| Alumbrado público | Se paga con el **cambio a paneles solares en los postes** | Alumbrado solar |
| Patentes e impuestos comerciales | **eMarket municipal** para mercados y comercios (comisión/suscripción) | eMarket |
| Transporte informal | **Transporte tipo Yango** municipal | Transporte |
| — | **Salud con IA y telemedicina** | Salud |
| — | **Plataforma educativa con tutor IA** (tablets offline) | Educación |
| — | **Suscripción ciudadana**: cuenta única, plan, saldo de créditos | Núcleo ciudadano |
| — | Indicadores para la gestión | Dashboard del alcalde |

El **Núcleo ciudadano** (cuenta, suscripción, billetera de créditos) es transversal: todos los
módulos suman o gastan créditos en la misma cuenta.

## Estado actual (7-nov-2026)

| Pieza | Dónde está | Estado |
|---|---|---|
| Hub + 6 prototipos HTML | Raíz de este repo | Maquetas estáticas con datos de ejemplo. Sin backend. Todos enlazados en el Hub (INF.01) |
| Educación — backend WhatsApp + PDF | `tugallo80/rubikeduai-backend` rama `main` (Vercel) | Funcional en código. Sin validación de firma Twilio. Manda nombre del alumno a Gemini |
| Educación — dashboard de los chicos (voz en vivo con Kay) | `rubikeduai-backend` rama `claude/dashboard-hijos-kay` | Sin mergear. Nunca desplegado (Cloud Functions apagadas en el proyecto `rubikeduai`) |
| Educación — panel del profesor | No encontrado en ningún repo | `api/process-pdf.js` lo menciona pero el código no está |
| Deploy | `firebase.json`, `.github/workflows/`, `vercel.json` | INF.01 (PR #1): push a `main` → `municipio-ia.web.app`; cada PR → vista previa con URL comentada. Vercel publica `_site/` |
| Proyecto Google Cloud/Firebase propio | `municipio-ia` ("MUNICIPIO IA") | ✅ Creado 7-nov: Blaze, Firebase, deploy por Workload Identity, `GEMINI_API_KEY` en Secret Manager, `claude-code` con solo lectura (probado) |

## Orden de trabajo

Primero la base (deploy y permisos) para que todo lo demás se publique solo; después Educación,
que es el módulo más avanzado; después el Núcleo ciudadano, que lo necesitan todos los demás.

| Código | Sub-sesión | Objetivo | Depende de | Estado |
|---|---|---|---|---|
| MAESTRA | Coordinación | Ordenar visión, plan, reglas y permisos; lanzar y revisar sub-sesiones | — | ✅ activa |
| INF.01 | Deploy automático | Firebase Hosting + Vercel, vista previa por PR, publicación al mergear | ✅ proyecto `municipio-ia` | 🔎 PR #1 en revisión del dueño |
| EDU.01 | Migración RubiKEduAI | Traer `rubikeduai-backend` a `educacion/`, que compile y se publique en `/educacion` | INF.01 | ⏳ |
| EDU.02 | Sprint 1.1 — lector offline | Textos por capítulos, lectura en tablet sin internet | EDU.01 | ⏳ |
| EDU.03 | Sprint 1.2 — tutor contextual | Tutor del capítulo + guardrails + anonimización + cuota | EDU.01 | ⏳ |
| EDU.04 | Sprint 1.3 — cifrado local | Datos locales cifrados + config emulador/tablet | EDU.02 | ⏳ |
| EDU.05 | Prueba Alfa familiar (Fase 1) | Probar con los hijos, ajustar, checklist de salida | EDU.02–04 | ⏳ |
| EDU.06 | Limpieza | Archivar `rubikeduai-backend` (PR aparte, con OK del dueño) | EDU.05 | ⏳ |
| NUC.01 | Núcleo ciudadano | Login, perfil, plan de suscripción, billetera de créditos, Hub con diseño ÑANDÉ | INF.01 | ⏳ |
| TRA.01 | Transporte | Del prototipo a MVP: pedir viaje, conductor, pago con créditos | NUC.01 | ⏳ |
| MKT.01 | eMarket | Catálogo de comercios, pedidos, suscripción comercial | NUC.01 | ⏳ |
| VIV.01 | Vivienda verde / reciclaje | Reciclaje → créditos → descuento del aporte de vivienda | NUC.01 | ⏳ |
| SAL.01 | Salud IA + telemedicina | Triage con IA, agenda de teleconsulta | NUC.01 | ⏳ |
| LUZ.01 | Alumbrado solar | Mapa de postes, avance del cambio a solar, ahorro | NUC.01 | ⏳ |
| ALC.01 | Dashboard del alcalde | Indicadores reales de todos los módulos | TRA–LUZ | ⏳ |

Códigos de módulo y convenciones: `docs/sesiones/README.md`.

Las fichas de cada sub-sesión están en `docs/sesiones/`. Las de módulos posteriores se escriben
cuando les toque (la sesión maestra las arma con lo aprendido).

## Cómo se lanza una sub-sesión

Desde la sesión maestra, el dueño escribe por ejemplo **"arranca INF.01"**. La maestra crea una sesión
nueva en la nube con la ficha como instrucción, y la sigue. Al terminar, la sub-sesión deja su PR y
actualiza este plan; la maestra revisa y propone la siguiente.

## Decisiones tomadas

- Educación vive en `educacion/` con la estructura del documento de visión
  (`apps/`, `services/`, `packages/`, `docs/`) — ver `docs/educacion/vision-plataforma-educativa.md`.
- Los HTML de la raíz no se mueven hasta NUC.01, para no romper enlaces.
- Deploy principal: **Firebase Hosting** (todo el sitio) + Functions. Vercel queda como espejo o
  solo para el webhook de WhatsApp (se decide en INF.01).
- Sin llaves de deploy guardadas: GitHub Actions entra a Google Cloud por Workload Identity.

## Datos de Google Cloud (no son secretos)

```
PROYECTO=municipio-ia
WIF_PROVIDER=projects/359679900643/locations/global/workloadIdentityPools/github/providers/github-actions
DEPLOY_SA=github-deploy@municipio-ia.iam.gserviceaccount.com
```
Facturación: cuenta "Pago de Firebase" (`01853C-…`), la misma de `nutri-piloto-rubik`.

## Decisiones pendientes del dueño

1. ~~ID del proyecto~~ → nombre **MUNICIPIO IA**, ID `municipio-ia` (si está tomado, `municipio-ia-scz`).
2. **¿Educación usa el proyecto nuevo o sigue en `rubikeduai`?** Recomendación: proyecto nuevo único
   para toda la súper app; los datos de `rubikeduai` son de prueba familiar y se recrean con el seed.
3. **Plan Blaze (facturación)**: necesario para Cloud Functions. Hosting solo funciona gratis.
