# EDU.04f — Tareas sugeridas y mapa del curso

## Objetivo
Para la reunión con el profe del piloto, dos cosas en el panel del profe:
1. **Tareas sugeridas por la IA**: desde una clase grabada (o un tema del cronograma), la mentora propone
   2–3 tareas con consigna, tipo, fecha, criterios Ser/Saber/Hacer/Autoevaluación y variantes por
   nivel. El profe edita y toca **"Enviar a mis alumnos"** → aparecen en el **modo directo** del alumno (EDU.06d).
2. **Mapa del curso**: plano del aula con cada alumno (perfil, avance, últimas misiones, notas de la
   mentora). La mentora propone una agrupación con el porqué; el profe la usa o arma la suya y guarda.

## Dónde está
- Rama `sesion/canal-edu-04f` (publica Functions y el sitio en su canal de vista previa).
- Panel del profe: `#tareas` (y "✨ Sugerir tareas" en cada informe de clase y en cada tarjeta de la
  mentora del cronograma) y `#mapa`.

| Pieza | Archivo |
|---|---|
| Pantallas | `educacion/maqueta/tareas.js`, `educacion/maqueta/mapa.js` |
| Curso demo (12 alumnos FICTICIOS) | `educacion/tools/datos/curso-demo-4A.json` → `armar-curso-demo.mjs` genera `maqueta/curso-demo.js` (con nombres, para la pantalla) y `services/ai-gateway/tutor/curso-demo.json` (SIN nombres, para el servidor y la IA) |
| Lógica (prompts, esquemas, limpieza) | `services/ai-gateway/tutor/tareas.js` |
| Functions `eduTareas` y `eduMapa` | `services/ai-gateway/src/tareas.js` |
| Pruebas | `test/tareas.test.js` (sin red) y `tools/e2e/probar-plan.mjs` (en cada deploy de canal y de main) |

## Formato común de "tarea" (con EDU.06d)
El alumno la lee con `httpsCallable(functions, 'eduTareas')({ accion: 'mias' })` →
`{ ok, hoy, tareas: [Tarea] }` (solo las vigentes de su curso, ordenadas por entrega; sin costo de IA).
Para marcarla: `{ accion: 'marcar', id, hecha: true | false }`.

```js
Tarea = {
  id: string,                 // ID de la base
  curso: '4to_primaria',
  materia: 'mat',             // mat, len, cnat, csoc, art, mus, efd, val, tec, ing, ori, fil, bio, fis, qui
  titulo: string,             // máx. 80
  consigna: string,           // para el alumno, voseo, sin nombres; máx. 600
  tipo: 'practica' | 'lectura' | 'investigacion' | 'proyecto' | 'mision',
  entrega: 'AAAA-MM-DD',      // día hábil
  variante: 'apoyo' | 'base' | 'desafio',
  textoVariante: string,      // la consigna en su nivel (lo que conviene mostrar en grande)
  criterios: { ser, saber, hacer, autoevaluacion },
  puntos: { ser: 10, saber: 45, hacer: 40, autoevaluacion: 5 },
  autoevaluacion: string,     // pregunta para el chico (caritas o semáforo)
  origen: { tipo: 'clase' | 'cronograma', tema: string },
  enviada: number,            // ms
  hecha: boolean              // si este alumno la marcó
}
```
- Base: `edu/tareas/{curso}/{id}` (lado profe, con `asignacion {alumnoId: variante}`, vence a los 60 días)
  y `edu/tareas_estado/{curso}/{id}/{alumnoId}`. Solo escribe la Function.
- Variante: la que eligió el profe al enviar o, en la demo, la sugerida por el avance del curso demo
  (< 65 % apoyo, ≥ 85 % desafío, el resto base). Cuentas fuera del curso demo reciben `base`.

## Mapa del curso
- Plano de 4 × 3 mesas con el pizarrón adelante. **PC**: arrastrar alumnos entre mesas. **Celular**:
  lista por mesa con "Mover a…". Tocar un alumno abre su ficha: cómo aprende, ritmo, fortalezas, lo que
  está practicando, temas, últimas misiones, lo que fue notando la mentora, variante de tareas y
  "💛 para acompañar" (alerta suave, en tono de cuidado).
- Propuesta de la mentora con tres objetivos: 🤝 parejas que se complementan, 📊 grupos por nivel para
  un tema, 💛 a quién acompañar esta semana. Cada grupo con nombre amable, el porqué y su mesa.
- **Privacidad**: la IA recibe solo IDs opacos (A01…) y rasgos pedagógicos que tiene el servidor;
  nunca nombres (prueba automática). Instrucción: tono positivo, sin etiquetas negativas (prueba
  automática de palabras prohibidas). Todo es ficticio en la demo.
- Guarda en `edu/mapas/{profe}/{curso}`; sin cuenta, en el equipo.

## Costo
- Sugerir tareas ≈ USD 0,003 por pedido; propuesta de mapa ≈ USD 0,003. Ver, enviar y marcar: sin IA.
- Topes: 40 sugerencias y 30 propuestas por profe por día; suman a la bolsa general (USD 5) o a la de
  pruebas (USD 1). Medido: ver Cierre.

## Pendiente
- Perfiles reales y alumnos de la base (EDU.03); hoy el mapa usa el curso demo 4A.
- Que el profe elija la variante por alumno al enviar (hoy: automática por avance; se puede cambiar
  agrupando "por nivel" en el mapa — falta conectar mapa → variante de la tarea).
- "Lo que notó la mentora" por alumno sale de datos ficticios: las clases grabadas son anónimas a
  propósito (no hay notas por alumno).

## Cierre
(se completa al cerrar)
