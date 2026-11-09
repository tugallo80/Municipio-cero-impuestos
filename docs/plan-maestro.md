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
| EDU.01c | Propuestas de estilo visual | Dueño eligió B. Escalera de 6 escalones para la presentación (Bloques, Piezas, Mundo real, Horizonte, Mundo vivo, Promo; visión final 12, una por año) + transición de curso; ciudad vacía con hitos y obra; C fuera de la vitrina; lámina E | EDU.01b | 🔎 PR #8 abierto (vista previa `municipio-ia--pr-8-j2o7xxsd.web.app/educacion/estilos/`). Producción de la 6 → EDU.07 (Blender) |
| EDU.02 | Motor | Migrar tutor IA, voz Kay, Functions y datos de `rubikeduai-backend` (sin la interfaz vieja) + arreglos de seguridad | INF.01 | ✅ En `main` (8-nov). `nande-educacion.web.app/prueba-motor/` |
| EDU.02b | Los profes dentro del mundo | Voz en vivo en la maqueta del alumno: la profe (Sulafat) y el profe (Achird), habla camba, marco/franja que sigue la voz, pistas en escalera con la misión | EDU.02, EDU.01b | ✅ En `main` (8-nov). `nande-educacion.web.app/maqueta/alumno.html` |
| EDU.02c | Alumno en horizontal | App del alumno horizontal primero (layout de juego, "Girá tu pantalla", pantalla completa, paneles laterales) | EDU.02b | ✅ En `main` (8-nov, PR #10). Probado por el dueño en Chrome horizontal. `nande-educacion.web.app/maqueta/alumno.html` |
| EDU.02d | Entrar a las aulas | Cartel flotante "Entrar · materia" cerca de la puerta y caminar solo al tocar un aula | EDU.02c | ✅ En `main` (8-nov, PR #13), aprobado por el dueño. Cartel solo pegado a la puerta (radio 1,5) |
| EDU.03 | Datos, cuentas y roles | Colegio/cursos/materias/alumnos, 4 roles con reglas de seguridad, seed de demo | EDU.02 | ⏳ |
| EDU.04 | Panel del tutor | Cronograma, pensum, avance del día, perfil psicopedagógico, rendimiento | EDU.03 | ⏳ |
| EDU.04a | Clase grabada | El profe graba su clase (▶ Empezar / 🔴 Grabando / ■ Terminar, corte automático); la IA arma informe para el profe y la dirección (el mismo) y el contexto del día para Taji/Jochi/Kay. Audio no se guarda, sin nombres, vencimientos | EDU.02b | ✅ En `main` (9-nov, PR #20). `nande-educacion.web.app/maqueta/tutor.html#clase` (cuenta `dueno`). ≈ USD 0,002/min de clase. Dirección escondida (`?direccion=1`) |
| EDU.04b | Cronograma y mentora | PDF del plan → cronograma día a día con calendario por capas (nacional, Santa Cruz, distrito, escuela, profe), reajuste ("Perdí este día") y mentora IA por tema (Ser 10/Saber 45/Hacer 40/Autoev. 5) | EDU.04a | ✅ En `main` (9-nov, PR #20). `nande-educacion.web.app/maqueta/tutor.html#cronograma`. Demo 2.º de secundaria con índices oficiales y varias áreas; PDC imprimible/Word |
| EDU.04c | Panel del profe en celular y PC | Tarjetas con botón apiladas en el celular, revisión en 360/390/1280 px de todo el panel del profe | EDU.04b | 🔎 PR #22 abierto. `nande-educacion--edu-04c-isjznr7h.web.app/maqueta/tutor.html` |
| EDU.05 | Retos / Misiones | Editor del tutor + motor de misiones + tutor IA dentro de la misión | EDU.03–04 | ⏳ |
| EDU.06 | Mundo 3D del colegio | App del alumno: colegio estilo bloques, aulas por materia, misiones (PWA) | EDU.05 | ⏳ |
| EDU.06a | Evoluciones en el alumno | El juego del alumno dibuja su mundo con la evolución de su curso (P1–P2 Bloques … S6 Promo), selector de curso con `?demo=1` y transición al subir, calidad automática y `?diag=1` | EDU.01c, EDU.02c | ✅ Mergeado (PR #16), publicado en `nande-educacion.web.app/maqueta/alumno/` |
| EDU.06b | Vida e interacción en el colegio | Aulas 3D por dentro con objetos interactivos, zonas nuevas (biblioteca, cancha, huerto, kiosco, dirección), compañeros con animación y convención de nombres para la maqueta GLB | EDU.06a | ✅ Mergeado (PR #19, 3f472d5), publicado en `nande-educacion.web.app/maqueta/` |
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

## Decisión del 8-nov-2026: seguir con la visión completa, validar en cancha

- El dueño mantiene la visión completa de Educación (tutor + mundo abierto + ciudad que construyen
  los colegios). "La forma puede cambiar; el fondo tiene esencia": la prueba se ve **en cancha**.
- Criterio de la MAESTRA acordado: el **corazón** es el tutor que enseña a cada niño a su manera
  (lo que tiene evidencia). Todo lo demás se valida con niños reales (talleres y piloto en aula
  con curso de comparación) y se ajusta según los datos.
- Presupuesto del dueño para pruebas: bajo (orden de USD 100). Se mantiene el tope de USD 5/día de
  IA y se reporta el gasto.

## Decisiones pendientes del dueño

> Lo que el dueño tiene para trabajar o probar está en **`docs/pendientes-del-dueno.md`**.

1. ~~ID del proyecto~~ → nombre **MUNICIPIO IA**, ID `municipio-ia` (si está tomado, `municipio-ia-scz`).
2. **¿Educación usa el proyecto nuevo o sigue en `rubikeduai`?** Recomendación: proyecto nuevo único
   para toda la súper app; los datos de `rubikeduai` son de prueba familiar y se recrean con el seed.
3. **Plan Blaze (facturación)**: necesario para Cloud Functions. Hosting solo funciona gratis.

## Decisión del 8-nov-2026 (noche): clase grabada (EDU.04a)

- El profe graba su clase; la IA resume para el profe (pensum del día, sugerencias positivas) y da
  **contexto del día a los profes IA** del alumno. El audio no se guarda; sin nombres de alumnos.
- **Parte "dirección" (protección de los chicos ante maltrato o bullying)**: programada pero escondida;
  se diseña en detalle con el dueño más adelante. Estrategia del dueño: primero mostrar el valor a
  profes y alumnos; **todos los usos se presentan abiertos antes de grabar clases reales** (consentimiento
  del profe, padres y dirección distrital). Regla: el profe ve lo mismo que la dirección.

## Costos de IA (9-nov-2026)

- El 8-nov se agotó el tope de USD 5/día: USD 4,81 fueron pruebas automáticas de voz (~USD 0,20 por
  deploy × 24). Arreglo: la prueba de voz corre solo en main (PR #24) y las pruebas tendrán su propio
  tope de USD 1/día (EDU.04d).
- **La voz en vivo es lo más caro**: ~USD 0,04–0,05/min. Un curso de 30 chicos × 10 min/día ≈ USD 13/día.
  **Antes del piloto en aula: bajar el costo de la voz** (solo el paso actual de la misión, voz a pedido y
  texto el resto, modelo más barato). Acordado con el dueño: después de su reunión con el profe.
