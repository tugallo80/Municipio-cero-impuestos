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

## Convención de nombres para la maqueta 3D (GLB)

El juego recorre la maqueta por **nombre de nodo** (`window.__enlazar(gltf.scene)`). Lo que hoy se
dibuja por código usa los mismos nombres y pasa por el mismo enlace.

| Nombre | Qué es | Qué hace el juego |
|---|---|---|
| `aula_<materia>` | Contenedor de un aula por dentro | Nada (agrupa) |
| `puerta_<materia\|lugar>` | Puerta | Afuera: "Entrar · …" (fundido y adentro). Adentro: "Salir al patio" |
| `obj_pizarra_<materia>` | Pizarra | La misión del día (la primera pendiente) |
| `obj_estante_<materia>` | Estante | Misiones y avance de la materia |
| `obj_<cosa>_<materia>` | Objeto de la materia (ábaco, microscopio…) | Curiosidad y pregunta rápida del profe |
| `obj_libros_biblioteca` | Estante destacado de la biblioteca | Elegir una lectura |
| `zona_<lugar>` | Lugar con interacción | Abre el panel del lugar |
| `colision_<x>` | Caja de choque | Se oculta y frena al personaje |
| `interior_<x>` | Volumen interior | Se oculta; adentro, cámara a la altura de los ojos |

- **Forma principal**: `obj_<cosa>_<materia>`, como en `docs/educacion/guia-maqueta-3d.md`. El
  juego también acepta `pizarra_mate` y `estante_mate`, y los toma como `obj_pizarra_mate` y
  `obj_estante_mate`.
- **Materias**: `mate`, `lenguaje`, `ciencias` (Ciencias Naturales), `sociales` (Ciencias
  Sociales), `artes`, `ingles`.
- **Lugares**: `biblioteca`, `cancha`, `huerto`, `kiosco`, `direccion`.
- **Cosas de cada aula** (hoy, dibujadas por código):

  | Aula | Cosa |
  |---|---|
  | Mate | `abaco` |
  | Lenguaje | `libros` |
  | Ciencias | `microscopio` |
  | Sociales | `globo` |
  | Artes | `caballete` |
  | Inglés | `radio` |
- **Ejes**: Y arriba, **+Z = frente** (el lado desde donde se usa), pivote abajo al centro, en metros.
  El cartel aparece ~1 m delante del frente; con `userData.frente` se cambia esa distancia.
- **Al leer los nombres**: se pasan a minúsculas, los espacios y guiones a `_`, y se quita el sufijo
  de Blender `.001`. Si un nombre se repite, a partir del segundo se le agrega `@2`, `@3`…

## Cierre

**Qué quedó**
- **Aulas 3D por dentro**:
  - "Entrar · Mate" hace un fundido y lleva a la sala de 7 × 6 m, que está aparte del mapa, con la
    cámara a la altura de los ojos.
  - Cada aula tiene bancos con dos compañeros sentados que escriben, pizarra ("📌 Misión del día"),
    estante con libros, el mural "Mi avance" (10 cuadros que se pintan con el avance de la materia)
    y su objeto:
    - Mate: ábaco;
    - Lenguaje: biblioteca de aula y alfombra;
    - Ciencias: microscopio y plantas;
    - Sociales: globo y mapa de Bolivia;
    - Artes: caballete, tambor y maracas;
    - Inglés: radio y carteles "Hello!" / "Thank you!".
  - Cada cosa muestra su cartel a 1,5 m. Si se toca de lejos, el alumno camina solo hasta ella.
  - La cámara no se sale por la puerta abierta, y adentro de una sala solo se pueden tocar cosas de
    esa sala.
- **Zonas**:
  - **Biblioteca**: puerta en el ala norte y sala con estantes, mesa y una compañera leyendo. Tiene
    2 lecturas cortas *demo* para 4.º de primaria ("El toborochi panzón" y "El jochi jardinero"),
    con una pregunta cada una.
  - **Cancha**: al este del colegio. "Reto de los conos" (tocar 5 conos, cronómetro y mejor tiempo
    guardado en el celular). "Jugar con el curso" queda como *Pronto*. Dos compañeros se pasan la
    pelota.
  - **Huerto**: en el patio. Se riega 1 vez por día (con gotas). La planta crece con el avance
    "entre todos" del curso; regar no la acelera.
  - **Kiosco**: en el zaguán. Las llaves **no se gastan**: con más llaves se desbloquean colores de
    gorra (azul, esmeralda, naranja, rosa toborochi). El color elegido se guarda en el celular.
  - **Dirección**: en el zaguán. Muestra avisos si hay en los datos; hoy no hay, así que dice
    *Pronto*.
- **Se mantiene**:
  - evoluciones 1–6 y su escala, y la cámara interior;
  - cartel a 1,5 m y tocar para ir;
  - profes de voz y 🎓;
  - instalable;
  - `<base href>`, rutas sin `.html` y `?v=`.

**Pruebas** (Playwright, 915×412, táctil)
- En P1, P5 y S6:
  - entrar a Mate con el cartel;
  - tocar la pizarra en la pantalla: camina solo y abre la misión del día;
  - estante, ábaco y pregunta rápida;
  - salir;
  - entrar y salir de la biblioteca, abrir una lectura y responder;
  - huerto (regar), kiosco, dirección y cancha;
  - reto de los conos completo.
  - Sin errores.
- En P3, S1 y S3: caminar, entrar al aula 3D, salir y la profe. Sin errores.

**Pendiente**
- Profes con cuerpo en la pizarra (hoy explican desde el panel y por voz).
- "Jugar con el curso" en la cancha, y más lecturas reales de cada curso (EDU.05/EDU.08).
- Avisos de la dirección desde la base (EDU.03 / EDU.10).
- Cargar la maqueta GLB del dueño con `__enlazar` cuando esté (EDU.07).
