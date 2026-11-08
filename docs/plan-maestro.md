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
| Hub + 6 prototipos HTML | Raíz de este repo | Maquetas estáticas con datos de ejemplo. Sin backend. `municipio0_transporte_mvp.html` no está enlazado en el Hub |
| Educación — backend WhatsApp + PDF | `tugallo80/rubikeduai-backend` rama `main` (Vercel) | Funcional en código. Sin validación de firma Twilio. Manda nombre del alumno a Gemini |
| Educación — dashboard de los chicos (voz en vivo con Kay) | `rubikeduai-backend` rama `claude/dashboard-hijos-kay` | Sin mergear. Nunca desplegado (Cloud Functions apagadas en el proyecto `rubikeduai`) |
| Educación — panel del profesor | No encontrado en ningún repo | `api/process-pdf.js` lo menciona pero el código no está |
| Deploy | — | Sin `firebase.json`, `vercel.json` ni GitHub Actions. Vercel falla por carpeta de salida |
| Proyecto Google Cloud/Firebase propio | `municipio-ia` ("MUNICIPIO IA") | ✅ Creado 7-nov: Blaze, Firebase, deploy por Workload Identity, `GEMINI_API_KEY` en Secret Manager, `claude-code` con solo lectura (probado) |

## Orden de trabajo

Primero la base (deploy y permisos) para que todo lo demás se publique solo; después Educación,
que es el módulo más avanzado; después el Núcleo ciudadano, que lo necesitan todos los demás.

| Código | Sub-sesión | Objetivo | Depende de | Estado |
|---|---|---|---|---|
| MAESTRA | Coordinación | Ordenar visión, plan, reglas y permisos; lanzar y revisar sub-sesiones | — | ✅ activa |
| INF.01 | Deploy automático | Firebase Hosting + Vercel, vista previa por PR, publicación al mergear | ✅ proyecto `municipio-ia` | ✅ En `main` (8-nov). Sitio del municipio publicándose en `municipio-ia.web.app`; Educación en su propio sitio |
| EDU.01 | Maqueta navegable | Los 4 perfiles (tutor, alumno, padres, dirección) con datos de demo, para validar antes de programar | — (link con INF.01) | ✅ En `main` (8-nov) |
| EDU.01b | Láminas y maqueta v2 | Láminas de los 4 mundos + cartas para talleres con niños; maqueta del alumno v2 (misión→llave→lugar, sin ranking, perfil sin "estilo de aprendizaje") | EDU.01 | ✅ En `main` (8-nov) |
| EDU.01c | Propuestas de estilo visual | Escalera de 3 tramos (Bloques 1.º–3.º, Piezas 4.º–6.º, Mundo real secundaria) + transición "pasaste de curso"; ciudad vacía con hitos y obra pública; exploración A/B/C (C = modo liviano); prueba de construcción con fps; lámina E | EDU.01b | 🔎 PR #8 abierto, esperando que el dueño elija. `municipio-ia--pr-8-j2o7xxsd.web.app/educacion/estilos/` |
| EDU.02 | Motor | Migrar tutor IA, voz Kay, Functions y datos de `rubikeduai-backend` (sin la interfaz vieja) + arreglos de seguridad | INF.01 | ✅ En `main` (8-nov). `nande-educacion.web.app/prueba-motor/` |
| EDU.02b | Los profes dentro del mundo | Voz en vivo en la maqueta del alumno: la profe (Sulafat) y el profe (Achird), habla camba, marco/franja que sigue la voz, pistas en escalera con la misión | EDU.02, EDU.01b | ✅ En `main` (8-nov). `nande-educacion.web.app/maqueta/alumno.html` |
| EDU.03 | Datos, cuentas y roles | Colegio/cursos/materias/alumnos, 4 roles con reglas de seguridad, seed de demo | EDU.02 | ⏳ |
| EDU.04 | Panel del tutor | Cronograma, pensum, avance del día, perfil psicopedagógico, rendimiento | EDU.03 | ⏳ |
| EDU.05 | Retos / Misiones | Editor del tutor + motor de misiones + tutor IA dentro de la misión | EDU.03–04 | ⏳ |
| EDU.06 | Mundo 3D del colegio | App del alumno: colegio estilo bloques, aulas por materia, misiones (PWA) | EDU.05 | ⏳ |
| EDU.07 | Modelos 3D en Blender | Colegio y aulas en glTF liviano, Blender en la nube con Claude | EDU.01 | ⏳ |
| EDU.08 | Minijuegos | 2–3 minijuegos que desbloquean las misiones | EDU.05–06 | ⏳ |
| EDU.09 | App de padres | Avance en tiempo real, cronograma, reportes, permisos, pagos, libretas | EDU.03, 05 | ⏳ |
| EDU.10 | Panel de dirección | Cursos, finanzas, cronograma, planificación, ayuda de notas RUDE/SIE | EDU.03, 09 | ⏳ |
| EDU.11 | Sin internet + cifrado | Offline, sincronización y datos locales cifrados | EDU.06, 08 | ⏳ |
| EDU.12 | Prueba Alfa familiar | Prueba con los hijos, ajustes, guion de la demo para la presentación | EDU.04–11 | ⏳ |
| EDU.13 | Limpieza | Archivar `rubikeduai-backend` (PR aparte, con OK del dueño) | EDU.12 | ⏳ |
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

- Educación es el **primer módulo a probar** antes de presentar el proyecto completo. Interfaz nueva según `docs/educacion/vision-interfaz.md` (4 perfiles, mundo 3D, misiones).
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

## Decisiones del 7-nov-2026 (dueño)

- **Apps separadas, no una sola web enlazada**: Educación es una app propia; Salud probablemente también.
  La app del municipio se centra en: estado de "impuestos" → **suscripciones**, **referéndums
  digitales** (el vecino elige entre obras para su zona, "el ciudadano como un concejal más") y
  **transparencia en tiempo real** (cuánto dinero hay, cuánto entra, en qué se gasta).
- Pendiente: ¿eMarket y transporte van dentro de la app del municipio o aparte? → investigación
  en curso (sociología, psicología, neurociencias, marketing, casos reales). Resultado en
  `docs/investigacion/una-app-o-varias.md`.
- INF.01 queda **en espera** (PR #1 abierto, sin mergear) hasta definir cómo se separan las apps
  (probablemente un sitio de Hosting por app).

- **Investigación "una app o varias"** aceptada por el dueño como criterio: ÑANDÉ ID único, app
  núcleo con pocos accesos (Mi aporte, Mi ciudad, Comprar, Viajar), lo cívico protegido (sin
  premios por votar), Educación y Salud aparte. Ver `docs/investigacion/una-app-o-varias.md`.
- **Modelo económico** (impuesto → suscripción con beneficio personal): `docs/vision-modelo-economico.md`.
- **Educación pública gratuita**; financiamiento buscado con Google y otros.

## Material para la presentación

Guardar aquí todo lo que sirva para presentar el demo (municipio, Google, financiadores):
- `docs/investigacion/una-app-o-varias.md` — por qué este diseño (con fuentes).
- `docs/vision-modelo-economico.md` — de impuesto a suscripción.
- `docs/educacion/vision-plataforma-educativa.md` y `vision-interfaz.md`.
- `docs/investigacion/educacion-piloto-y-financiamiento.md` — piloto, evidencia y financiamiento.
- `docs/investigacion/transporte-municipal.md` — parque, modelo financiero y ley del transporte.
- `docs/investigacion/experiencia-del-alumno.md` — psicología infantil, juego y mundo compartido.
- `docs/educacion/protocolo-focus-group.md` — talleres de co-diseño con niños.
- `docs/investigacion/voz-del-tutor.md` — voz femenina, masculina o que elija el niño.
- `docs/investigacion/mundo-abierto-santa-cruz.md` — mundo abierto, moneda de conocimiento, colegios, identidad y técnica.
- `docs/investigacion/estilo-visual.md` — 3 direcciones de arte para 6–17 años.

## Decisiones pendientes del dueño

1. ~~ID del proyecto~~ → nombre **MUNICIPIO IA**, ID `municipio-ia` (si está tomado, `municipio-ia-scz`).
2. **¿Educación usa el proyecto nuevo o sigue en `rubikeduai`?** Recomendación: proyecto nuevo único
   para toda la súper app; los datos de `rubikeduai` son de prueba familiar y se recrean con el seed.
3. **Plan Blaze (facturación)**: necesario para Cloud Functions. Hosting solo funciona gratis.
