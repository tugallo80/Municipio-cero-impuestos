# Traspaso de la MAESTRA 1 → MAESTRA 2 (8-nov-2026)

La primera sesión maestra llenó su contexto. Este documento es todo lo que la nueva maestra
necesita para seguir. **Leelo junto con `CLAUDE.md` y `docs/plan-maestro.md`.**

## Quién es el dueño y cómo trabaja

- Trabaja **desde el celular**; Claude hace todo lo técnico. Español, mensajes cortos, sin jerga.
- Permiso de admin en Google Cloud: **un solo comando** en Cloud Shell (`tools/cloudshell/configurar-nande.sh`).
- Le gusta que se le diga la verdad (pidió honestidad sobre la viabilidad y la valoró).
- Cuida la plata: presupuesto de pruebas bajo (~USD 100). Tope de IA: USD 5/día.

## Cómo opera la MAESTRA

- **No programa módulos**: lanza sub-sesiones con `create_session` (código `MÓDULO.NN`, fichas en
  `docs/sesiones/`), las sigue con `send_message`/`get_session`/`list_events` y `send_later`,
  verifica con la API de Firebase Hosting y `gcloud` (cuenta `claude-code`, solo lectura; ver
  `CLAUDE.md`), y recién después le avisa al dueño. Arreglos chicos los puede hacer ella en una rama
  aparte con PR.
- Las sub-sesiones con permiso de publicar en `municipio-ia` lo tienen **por autorización explícita
  del dueño** (EDU.02, EDU.02b, EDU.02c). Escribilo en el prompt de cada sub-sesión nueva que lo necesite.
- Investigaciones: con agentes en paralelo (`Agent`, `general-purpose`), resultado guardado en
  `docs/investigacion/`.
- La red de las sesiones **no abre `*.web.app`**: verificar por la API de Hosting.
- Cuidado con la **caché**: Firebase sirve .js con max-age; usar rompecachés `?v=` y `no-cache`.
- El sitio de Educación usa `cleanUrls`+`trailingSlash`: por eso las páginas de `educacion/maqueta/`
  llevan `<base href="/maqueta/">` (PR #9). No romperlo.
- PRs: mergear solo con OK del dueño y vista previa funcionando; usar **merge commit** (las ramas se apilan).

## Proyecto en Google Cloud

- Proyecto `municipio-ia` ("MUNICIPIO IA"), Blaze, cuenta de facturación "Pago de Firebase" (`01853C-…`).
- Deploy por GitHub Actions + Workload Identity (sin llaves). Datos en `docs/plan-maestro.md`.
- Sitios: `municipio-ia.web.app` (Hub del municipio, 6 prototipos) y **`nande-educacion.web.app`**
  (app de Educación, separada).
- Functions de Educación: `eduKayToken`, `eduKayUso`, `eduProfes` (Gemini Live, voz).
- Secreto `GEMINI_API_KEY` en Secret Manager.
- Cuentas de prueba de voz: `prueba` (8 charlas/día) y `dueno` (40/día). **Las claves no van en el
  repo** (es público): están en el prompt de arranque de la maestra 2 y en la conversación de EDU.02.

## Estado al 8-nov-2026 (15:40 UTC)

**En `main` y publicado**: INF.01, EDU.01, EDU.01b, EDU.02, EDU.02b, docs de la maestra (PR #6),
limpieza del Hub (PR #7), arreglo de rutas de la maqueta (PR #9).

**PRs abiertos (sin mergear)**:
- **#8 — EDU.01c Propuestas de estilo visual** (sesión `session_01Jdt98fThVDqrbaV4DW6Ah5`, terminada).
  Vitrina: `https://municipio-ia--pr-8-j2o7xxsd.web.app/educacion/estilos/` — escalera por nivel
  **Bloques (1.º–3.º) → Piezas (4.º–6.º) → Mundo real (secundaria)**, transición "pasaste de curso",
  ciudad vacía con hitos (Cristo, plaza, catedral), zoológico en obra, portales, profes. Esperando
  la elección del dueño. Pendiente: medir en tablet real; "Mundo real" y la transición son pesados.
- **#10 — EDU.02c Alumno en horizontal** (sesión `session_01Jdt98dzvu4TVGmJMb4EDhb`, trabajando).
  Ya: horizontal, pulgar derecho gira la cámara, pellizcar = zoom, login de voz compacto,
  rompecachés, diagnóstico `?diag=1`. **Los profes ya hablan** (confirmado por el dueño).
  En curso (último pedido): ocultar diagnóstico sin `?diag=1`; mostrar "▶ Jugar" cada vez que se
  entra + botón fijo "⛶" pantalla completa; bloqueo horizontal aunque la rotación automática del
  Android esté apagada (el dueño la tiene apagada). Cuando el dueño lo apruebe: mergear #10 y #8.

**Rama de la maestra 1**: `ccr-3c65dd9e-x1ipi2` (docs de visión posteriores al PR #6; mergear a main con un PR de docs).

## Visión de Educación (resumen; detalle en `docs/educacion/vision-interfaz.md`)

- Educación **pública y gratuita**; el municipio entregaría una tablet por alumno. Financiamiento:
  Google y otros (`docs/investigacion/educacion-piloto-y-financiamiento.md`). Solicitud de créditos de
  Google Cloud lista en `docs/financiamiento/` — **se envía cuando el proyecto esté terminado**.
  Página del proyecto en `sitio-proyecto/` (sin publicar; falta correo de contacto).
- **Corazón** (lo que tiene evidencia): tutor que enseña a cada niño a su manera.
- **Dos profes de voz**, personajes camba originales: **la profe** (voz Sulafat) y **el profe** (Achird);
  nombres provisionales **Taji / Jochi** (dueño aún no eligió). Habla camba ("belleza", "la tuti",
  "mucha dosis", "otro level", s aspirada). Siempre disponibles, memoria compartida, dicen que son IA.
  No imitar personas reales (se descartó a Percy Fernández).
- **Mundo**: Santa Cruz **vacía con hitos**; los cursos juntan capital con misiones y **construyen la
  ciudad** (ej. zoológico) — presupuesto participativo en chiquito. Colegios geoubicados, **portales**
  de visita, reto entre colegios = quién aporta más a la ciudad (justo: por alumno y mejora, ligas).
  Lema: **"Acá no vale lo que tenés, sino lo que sabés."**
- **Estilo por nivel** que evoluciona al pasar de curso (Bloques → Piezas → Mundo real).
- **Moneda = dominio** (no cantidad de tareas): materiales con significado, se gana sobre todo en clase.
- **Construcción lúdica y propia** (diseño libre + plantillas), obreros que construyen (expectativa, no
  ansiedad), concurso de arte — después de la maqueta funcional.
- **Seguridad**: mundo cerrado por curso/nivel, frases predefinidas, sin ranking individual, cuentas
  creadas por el colegio (RUDE para el alta, QR/PIN para entrar), IDs opacos hacia la IA.
- **Horizontal** para jugar; pulgar izq. camina, der. gira cámara, pellizco = zoom.

## Lo que espera del dueño

1. Opinión/elección de estilos (PR #8) y prueba final del horizontal (PR #10).
2. Nombres de los profes (Taji/Jochi u otros) y marco vs franja de voz.
3. Guion de minijuegos y lugares secretos (lo está escribiendo).
4. Talleres con niños (láminas listas en `/educacion/talleres/`, incluida la E).
5. Correo de contacto para la página del proyecto (cuando se envíe la solicitud).

## Próximos pasos sugeridos (la maestra 2 los propone; el dueño decide)

- Unir la app del alumno con el estilo elegido: ciudad, nivel, portales y profes caminando en el mundo.
- Bajar el costo de la voz (hoy ~USD 0,04–0,05/min con misión): mandar solo el paso actual.
- EDU.03 (datos, cuentas y roles) cuando se acerque el piloto.
- El dueño mantiene la visión completa; la maestra recuerda el criterio: llegar a probar con niños reales
  y medir (piloto en aula con curso de comparación).

## Índice de documentos

`docs/plan-maestro.md` · `docs/vision-modelo-economico.md` · `docs/educacion/vision-interfaz.md` ·
`docs/educacion/vision-plataforma-educativa.md` · `docs/educacion/protocolo-focus-group.md` ·
`docs/investigacion/` (una-app-o-varias, educacion-piloto-y-financiamiento, transporte-municipal,
experiencia-del-alumno, voz-del-tutor, mundo-abierto-santa-cruz, estilo-visual) ·
`docs/financiamiento/solicitud-google-cloud-start.md` · `docs/sesiones/` (fichas).
