# EDU.04b — Cronograma y mentora del profe

## Objetivo
El profe sube el PDF de su plan o pensum, y la app arma el cronograma día a día del año escolar
respetando el calendario en capas (nacional → departamento → distrito → escuela → profe). El profe
lo edita y lo reajusta. Una "mentora" con IA le sugiere, tema por tema, cómo darlo y cómo evaluarlo.

Base: `docs/investigacion/planificacion-y-calendario-bolivia.md` y
`docs/investigacion/mentor-del-profesor-sistemas-exitosos.md`.

## Dónde está
- Vista previa (canal de esta rama): `https://nande-educacion--edu-04a-m9feaits.web.app/maqueta/tutor.html#cronograma`
- Cuenta: `dueno` (profe demo). Sin cuenta funciona con el plan de ejemplo y se guarda solo en ese navegador.

| Pieza | Archivo |
|---|---|
| Calendario por capas + reparto (sin IA) | `educacion/maqueta/calendario.js` (pruebas: `services/ai-gateway/test/calendario.test.js`) |
| Pantalla (asistente, Hoy, semana, trimestres, temas, mentora) | `educacion/maqueta/cronograma.js` (ruta `#cronograma` de `tutor.html`) |
| Functions `eduPlan` (leer PDF, leer/guardar) y `eduMentora` | `educacion/services/ai-gateway/src/plan.js` + `tutor/plan.js` |
| Llamadas desde el navegador | `educacion/apps/web/clase/clase-cuenta.js` (`/voz/clase.js`) |
| Prueba de punta a punta | `educacion/tools/e2e/probar-plan.mjs` (en cada deploy) |

## Qué le pide al profe (asistente de 4 pasos)
1. **Plan**: PDF del plan anual, PDC o pensum (la IA saca áreas y temas en orden, con peso y trimestre
   si el PDF lo dice), o "usar el plan de ejemplo".
2. **Escuela y gestión**: gestión (2026, o 2027 provisional), distrito, curso y si es **multigrado**.
3. **Horario semanal**: 6 periodos × 5 días (viene un ejemplo cargado).
4. **Días propios**: fiesta patronal, siembra, aniversario… + semana de evaluación por trimestre y
   colchón para imprevistos (10 % por defecto).

## Cómo se arma
- **Capas** (datos editables en `calendario.js`, sin IA): nacional 2026 (RM 0001/2026 + DS 5521),
  Santa Cruz (descanso 6–24 jul, 24–25 sep, cierre 4 dic), distrito (ejemplo rural con aniversario
  del municipio), escuela y profe. Cada capa agrega o quita días sin clase, o **resta horas** (actos
  cívicos: −2 periodos). Los días hábiles se calculan: 2026 da 66 / 76 / 66 días por trimestre, y el
  2.º da 66 recién después de restar los 10 de descanso (no 68 como dice la RM). Santa Cruz: 2.º = 61.
- **2027 es provisional** (inicio 1 feb, feriados calculados) hasta la RM y el decreto de enero.
  La pantalla lo avisa.
- **Reparto**: periodos reales por área (días × horario) → temas en orden, proporcionales al peso,
  respetando el trimestre si el plan lo fija; colchón y semana de evaluación al final de cada
  trimestre. **Avisos** si un trimestre queda apretado o no entran los temas.
- **Reajustar**: ✓ marcar un tema como dado, **🚫 Perdí este día** (reacomoda desde ese día),
  editar temas (orden, largo, trimestre, agregar o quitar), cambiar horario o días.
- **Mentora (💡)**: una tarjeta corta por tema: objetivo; inicio, actividad y cierre; actividad con lo
  de la comunidad; materiales; 3 criterios (en camino / logrado / destacado); evaluación
  **Ser 10 · Saber 45 · Hacer 40 · Autoevaluación 5**; 5 preguntas de repaso; nota de multigrado.
  Tono de colega: propone, el profe decide. Sin puntajes del profe. Se guarda (caché) para no pagar dos veces.

## Privacidad y costos
- El **PDF no se guarda**: se lee en la llamada y se descarta. La IA tiene orden de ignorar nombres y
  listas de alumnos (la prueba e2e incluye una lista ficticia y verifica que no aparezca).
- A la mentora solo llegan curso, área y tema. Nada de alumnos.
- Lo guardado: `edu/planes/{profe}/{curso}` (config, plan, hechos, días perdidos, tarjetas), base cerrada al navegador.
- Costo estimado (gemini-3.1-flash-lite): PDF de 30 páginas ≈ 8.000 tokens → **< USD 0,01** (una vez
  al año); tarjeta de la mentora ≈ **USD 0,001**. Topes: 10 PDF y 60 tarjetas por profe por día; suma
  al tope global de USD 5/día. Medido: ver Cierre.

## Pendiente / a verificar
- Leer el PDF completo de la RM 0001/2026 (art. 9 calendario, art. 29 evaluación) y confirmar fechas
  2026 de Santa Cruz con la DDE; cargar 2027 cuando salga la RM.
- Calendario del **distrito real** del piloto (U.E. Nuevo Horizonte) y sus días cívicos.
- Generar el **PDC** en el formato de la Distrital (pedir uno aprobado al profe) y la planilla 10/45/40/5.
- Temas pendientes de la clase grabada (EDU.04a) → ofrecerlos para reacomodar en el cronograma.
- Sin internet (EDU.11): el cronograma se calcula en el equipo; falta guardar el plan para usarlo offline.

## Cierre (9-nov-2026)

**Hecho** (en la rama `sesion/edu-04a`, PR #20, sin mergear; canal de vista previa)
- Asistente de 4 pasos, cronograma (Hoy / semana / trimestres / días sin clase y su capa), edición de
  temas, "Perdí este día", mentora 💡 y **PDC** del mes por área (imprimir / guardar PDF, descargar Word,
  "Completar con la mentora").
- **2.º de secundaria** (pedido del dueño): el plan de ejemplo sale de los **índices reales** de los textos de
  aprendizaje 2025 (9 áreas; `tools/datos/armar-plan-ejemplo.mjs` → `maqueta/plan-ejemplo-2do-secundaria.js`),
  marcado "a verificar con el profe". La demo arranca con **varias áreas** del profe (Inglés, Filosofía,
  Artes, Música, Valores) y "Hoy" las mezcla según el horario. También queda 4.º de primaria.
- **PDF grandes**: pdf.js va incluido en el sitio (`/voz/pdf-texto.js`); del libro se manda solo el texto de las
  primeras 16 páginas (el índice). Probado con la muestra oficial de Inglés (4 MB → 19.000 caracteres).
  Si el PDF no tiene texto (escaneado), se manda el PDF si pesa menos de 10 MB.
- Varias áreas: cada PDF suma o reemplaza sus áreas; se puede quitar un área.
- Arreglo general de la maqueta: los links `#ruta` sacaban de la página (por el `<base href>`).

**Medido** (gemini-3.1-flash-lite, prueba automática en cada deploy ✅)
- Leer un PDF de plan (2 páginas): **USD 0,0011**, 18 s. Índice del texto oficial de Inglés: **USD 0,0012**, 2 s
  → 9 unidades, 3 por trimestre, subtemas como contenidos. Lista de alumnos ficticia: ignorada ✅.
- Tarjeta de la mentora: **USD 0,0009**; la segunda vez sale del caché (USD 0).
- Un año de un profe (1 PDF por área + ~150 tarjetas) ≈ **USD 0,15**.

**Pendiente**
- Lo de "Pendiente / a verificar" de arriba (RM completa, distrito real, formato de PDC de la Distrital).
- La muestra de 12 páginas y los .txt vienen de la rama `maestra-2` (PR #18): cuando entren a `main`, no hay conflicto (mismo contenido).
- El texto general de 2.º de secundaria solo trae las unidades del 1.er trimestre de Lengua, Matemática,
  Biología-Geografía y Sociales: completar con el libro entero.
