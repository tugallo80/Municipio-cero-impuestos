# EDU.06b — Vida e interacción en el colegio

## Objetivo

Que el alumno interactúe con su colegio, con cada aula y con los objetos que hay adentro, y que haya
más zonas (biblioteca, cancha, huerto, kiosco, dirección). Todo armado con un **sistema genérico de
objetos interactivos**, para que después se enchufe la maqueta 3D del dueño (GLB) por nombres
(`aula_mate`, `puerta_mate`, `pizarra_mate`, `zona_cancha`, `obj_microscopio_ciencias`…). Lo que se
dibuja hoy por código es la primera versión.

## Antes de empezar

- `CLAUDE.md`, `docs/plan-maestro.md`, cierre de `EDU.06a-evoluciones-en-el-alumno.md`.
- Lanzada por la MAESTRA 2 con autorización del dueño para publicar en nande-educacion.
- Rama `sesion/edu-01c` llevada a `main` (fast-forward) después del merge del PR #16.

## Tareas

1. **Aulas 3D por dentro**: entrar a un aula de verdad (zona interior, cámara a la altura de los ojos)
   con bancos, pizarra, estante, un objeto propio de cada materia y un mural del avance.
   - **Pizarra**: la misión del día.
   - **Estante**: misiones y avance.
   - **Objeto de la materia**: una curiosidad o una pregunta rápida del profe.
   - **Puerta**: salir.
2. **Zonas nuevas**, cada una con 1–2 interacciones:
   - **Biblioteca**: elegir una lectura.
   - **Cancha**: reto de movimiento.
   - **Huerto**: regar la planta del curso, que crece con el avance.
   - **Kiosco**: canje simbólico por llaves, sin plata.
   - **Dirección**: avisos.

   Lo que no tenga contenido queda como "Pronto", sin simularlo.
3. **Compañeros en distintos lugares**, con animación: sentados en el aula, jugando en la cancha.
4. **Mantener lo que anda**:
   - evoluciones 1–6 y su escala, y la cámara interior;
   - cartel a 1,5 m y tocar para ir;
   - profes de voz y 🎓;
   - instalable;
   - `<base href>`, rutas sin `.html` y `?v=`.
5. **Convención de nombres** para el GLB: se escribe en esta ficha y coincide con
   `docs/educacion/guia-maqueta-3d.md`.
6. **Probar con Playwright** en horizontal y táctil, en P1, P5 y S6.

## Estado

Plan enviado a la MAESTRA 2; se programa con su OK.
