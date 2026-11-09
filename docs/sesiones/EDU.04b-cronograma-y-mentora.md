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

## Cierre
(se completa al cerrar)
