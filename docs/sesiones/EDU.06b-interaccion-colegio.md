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
| `deco_<x>` | Decoración (p. ej. `deco_mesa_mate_01`) | Nada; se registra y se ignora |
| `obj_silla_<materia\|lugar>_NN` | Silla (+Z = de donde se sienta) | "Sentarse" |
| `obj_hamaca_NN`, `obj_resbalin`, `obj_subeybaja` | Juegos del parque | Subirse; se baja moviendo el círculo |
| `obj_kiosco` | Mostrador del kiosco | Menú de comida |
| `obj_arco_futbol_NN`, `obj_aro_basquet_NN` | Arcos y aros (+Z = hacia la cancha) | Gol o canasta |
| `obj_planta_huerto` | Planta del huerto | Crece con el avance del curso |
| `colision_<x>` | Caja de choque | Se oculta y frena al personaje |
| `interior_<x>` | Volumen interior | Se oculta; adentro, cámara a la altura de los ojos |

- **Forma principal**: `obj_<cosa>_<materia>`, como en `docs/educacion/guia-maqueta-3d.md`. El
  juego también acepta `pizarra_mate` y `estante_mate`, y los toma como `obj_pizarra_mate` y
  `obj_estante_mate`.
- **Materias**: `mate`, `lenguaje`, `ciencias` (Ciencias Naturales), `sociales` (Ciencias
  Sociales), `artes`, `ingles`.
- **Lugares**: `biblioteca`, `futbol`, `basquet`, `parque`, `huerto`, `kiosco`, `direccion`.
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

- **Sub-nodos opcionales de lo que se mueve**:
  - `asiento` dentro de cada hamaca: el pivote va arriba, en la barra.
  - `tabla` dentro del sube y baja: el pivote va al centro.
  - Si no están, la lógica funciona igual.
- **Datos opcionales del nodo** (en Blender, propiedades personalizadas; llegan a `userData`):

  | Dato | Para qué | Si falta |
  |---|---|---|
  | `campo: [ancho, largo]` | Canchas | Se usa la caja del nodo |
  | `aro: [x, y, z]` | Centro del aro | Arriba de la caja |
  | `superficie: {w, h, y, z}` | Pizarra para dibujar | Se usa la cara de adelante de la caja |
  | `frente` | Distancia del cartel | — |
- **La lógica no usa números fijos de posición**. Todo sale del nodo con nombre: su matriz y su caja
  se guardan antes de juntar las mallas.

## Entrega 1 — "segunda vida" (pedido ampliado del dueño)
- **Pizarra para dibujar** en todas las aulas:
  - al tocarla, la cámara pasa a primer plano;
  - 6 tizas de colores, borrador y "borrar todo";
  - "📌 Misión" abre la misión del día y "← Volver" sale;
  - lo dibujado queda mientras dura la sesión.
- **Sentarse** en las sillas de las aulas y de la biblioteca: "🪑 Sentarse"; para pararse, mover el
  círculo. Si la silla está ocupada por un compañero, avisa.
- **Kiosco con menú cruceño, gratis**:
  - lo saludable primero y destacado (⭐): fruta de estación, jugo de frutas y agua;
  - después: cuñapé, sonso de yuca, empanada de queso y salteña;
  - el personaje lo agarra con la mano, come o toma con animación y dice "¡Rico! 😋";
  - las gorras siguen abajo.
- **Fútbol**:
  - la pelota tiene física simple: se empuja al caminar y frena sola;
  - cerca de la pelota aparece "⚽ Patear";
  - arcos con "¡GOOOL!" y papelitos de festejo;
  - dos compañeros juegan: van a la pelota si está de su lado y la patean;
  - el reto de los conos sigue acá.
- **Básquet**:
  - "🏀 Tirar al aro": hasta 5 m entra con festejo; desde más lejos, "¡Casi!";
  - un compañero tira al aro solo.
- **Parque infantil** (al oeste del colegio):
  - 2 hamacas que se balancean;
  - resbalín: sube la escalera, se tira y dice "¡Yujuuu!";
  - sube y baja, con un chiquito en la otra punta.
- **Rendimiento**: física simple (fricción y rebote en el campo), 7 compañeros en total y todo lo
  fijo junto en pocas mallas.
- **Probado** (Playwright, 915×412, táctil):
  - P1 y P5, completo:
    - dibujar con el dedo y misión desde la pizarra;
    - sentarse, pararse y silla ocupada;
    - pedir en el kiosco;
    - gol;
    - canasta;
    - hamaca, sube y baja y resbalín.
    - Sin errores.
  - S6: lo mismo, salvo la canasta y el final del resbalín, que no llegan a terminar en la prueba
    sin placa de video (1–2 cuadros por segundo).

## Entrega 2 — personajes del colegio y escondidas
- **Adultos** (1,70 m, armados con proporción de adulto, originales):
  - **La directora** está sentada en la **dirección**, que ahora tiene sala por dentro: escritorio,
    banderas de Santa Cruz y de Bolivia, y estantes.
    - Saluda al entrar, en habla camba suave: "¡Buenas, buenas! ¿Cómo andás?", "Pasá nomás, pues".
    - Comenta el avance del curso: "¡Qué macanudo!" o "vamos de a poquito, pues".
    - Muestra los avisos (hoy *Pronto*).
  - **Profes con cuerpo**: la profe Taji (Mate, Lenguaje y Artes) y el profe Jochi (Ciencias,
    Sociales e Inglés) aparecen junto a la pizarra del aula donde entrás y saludan. Tocarlos abre
    la charla de voz de siempre.
- **Escondidas**:
  - **El regente** duerme en una silla de la galería, con "💤 Zzz" sobre la cabeza.
    - Se despierta si corrés cerca o si lo tocás: "¡Eh! ¿Qué hacen ahí? 👀".
    - Te sigue mientras te ve, con "❗" sobre la cabeza y una música suave de persecución.
    - Te ve en un cono de 110°, hasta 8 m, y no a través de paredes, horcones, el tronco del
      toborochi ni el aljibe.
    - Si te pierde 2 s: "Mmm… ¿a dónde se fue? 🤔" y vuelve a dormir.
    - Si te alcanza: "¡Te agarré! Vamos a la dirección 😄", fundido, y la directora dice algo
      gracioso y amable ("¡corrías más ligero que un jochi!", "la próxima escondete detrás del
      toborochi, pues").
    - No se pierde nada: ni avance, ni llaves, y no hay castigo. Después de un rato no te vuelve a
      perseguir enseguida.
  - **El guardia** patrulla la galería y juega igual.
  - La IA es simple: dormido o patrulla → alerta → persigue → vuelve. Corre a 3,6 m/s y el alumno a
    6, así que se puede escapar. Si se traba con un horcón, lo rodea.
- **Nodos para la maqueta**:
  - `obj_silla_galeria_01`: el puesto del regente.
  - `obj_silla_direccion_01`: la silla de la directora.
  - `ruta_guardia_01_NN`: puntos de la ronda del guardia.
  - `zona_direccion`: el escritorio.
  - `puerta_direccion`: la puerta.
- **Probado** (Playwright, 915×412, táctil) en P1, P5 y S6:
  - despertar al regente y quedarse quieto: te lleva a la dirección y la directora habla;
  - esconderse detrás del ala este: lo pierde y vuelve a dormir;
  - la directora en su escritorio;
  - el profe en el aula.
  - Sin errores.

## Entrega 3 — la acción central de cada materia
Cada objeto abre un minijuego corto en el panel. Abajo de cada uno sigue "💡 Curiosidad y pregunta
del profe".

| Materia | Objeto | Minijuego |
|---|---|---|
| Mate | `obj_abaco_mate` | **Ábaco**: tocar cuentas en centenas, decenas y unidades para formar el número pedido (✅ ¡Justo! y "Otro número") |
| Ciencias | `obj_microscopio_ciencias` | **Microscopio**: 3 muestras (hoja, célula, agua de río) dibujadas en la lente, con perilla de enfoque y un dato de cada una |
| Ciencias | `obj_cuerpo_ciencias` (nuevo maniquí en el aula) | **Cuerpo humano armable**: arrastrar cerebro, corazón, pulmones, estómago e intestinos a su lugar |
| Sociales | `obj_globo_sociales` | **Globo terráqueo** que se gira con el dedo (continentes simplificados, Bolivia marcada) |
| Sociales | `obj_mapa_sociales` (el mapa de la pared) | **Mapa de Bolivia** para armar: arrastrar los 9 departamentos a su lugar (mapa simplificado, Santa Cruz destacada) |
| Artes | `obj_caballete_artes` | **Pintar en el caballete**: primer plano, 6 pinturas, borrador; usa el mismo dibujo que la pizarra |
| Inglés | `obj_radio_ingles` | **Radio**: 6 palabras y una canción corta original. Suenan con la voz del celular si tiene; si no, queda el texto |
| Lenguaje | `obj_libros_lenguaje` | **Lecturas** de la biblioteca de aula |

- En horizontal, la figura y las piezas para arrastrar quedan una al lado de la otra, para que
  entren en 412 px de alto. La pieza cae donde está el dedo.
- El caballete tiene `userData.superficie` (el lienzo).
- **Probado** (Playwright, 915×412, táctil) en P1, P5 y S6:
  - formar el número en el ábaco;
  - las 3 muestras del microscopio;
  - arrastrar órganos y departamentos a su lugar;
  - girar el globo;
  - pintar en el caballete;
  - la radio y los libros.
  - Las entregas 1 y 2 siguen andando. Sin errores.

## Ajustes después de la prueba del dueño
- **Salir de las salas sin trabarse**: el punto de salida quedó más cerca de la puerta (1,5 m). Si
  cae dentro de una caja de choque (un horcón), se busca el lugar libre más cercano. Al salir hay
  3 s de respiro antes de que el regente o el guardia puedan perseguir. Probado en las 8 puertas:
  6 aulas, biblioteca y dirección.
- **Menos texto en pantalla**:
  - el cartel de acción es ~70 % del tamaño anterior y se muestra solo el más cercano; si hay otros
    cerca, aparece un botón chico **⋯** para cambiar entre ellos;
  - los nombres de los compañeros son más chicos y se ven solo hasta 8 m;
  - los carteles de aulas lejanas (más de 9 m) se ven más chicos y semitransparentes;
  - las burbujas de los adultos son más chicas.
- **Misión primero**:
  - al entrar a un aula aparece "Para cumplir tu misión del día y desbloquear los minijuegos,
    sentate 🪑";
  - al sentarse se abre la misión del día;
  - los minijuegos de la materia (y el caballete) tienen candado: "🔒 Cumplí tu misión para
    desbloquear", con un botón a la misión;
  - al completar la misión se desbloquean los juegos de esa materia y la cancha;
  - en 🎓 hay un interruptor "Desbloquear todo (demo)", que se guarda en el celular.
- **Modo deporte**:
  - al entrar a una cancha, los botones de la derecha cambian:
    - fútbol: ▶ Partido, Pasar, Patear, Quitar y Regate;
    - básquet: ▶ Partido, Pasar, Tirar, Robar y Finta;
  - la cámara se acerca un poco;
  - partidito 2 contra 2 de 90 s: vos y un compañero contra dos rivales NPC, con marcador y tiempo
    abajo al centro;
  - la IA es simple: el que tiene la pelota avanza, pasa o tira; los rivales marcan e intentan
    quitar; la pelota suelta va al más cercano;
  - el regate o la finta deja quietos a los rivales cercanos un segundo;
  - se desbloquea con la misión;
  - al salir de la cancha, el partido termina y vuelven los botones normales.
- **Botones de la cancha como control de consola**: círculos translúcidos (relleno ~20 %, borde
  claro) en arco abajo a la derecha, con el botón grande de Patear o Tirar y alrededor Pasar,
  Quitar o Robar, Regate o Finta y ▶ Partido. El nombre va chiquito abajo y se ve la cancha a
  través. Probado en 915×412 y 844×390.
- **Probado** (Playwright, 915×412, táctil) en P1, P5 y S6:
  - las 8 salidas;
  - el aviso al entrar;
  - el cartel con candado y el ⋯;
  - sentarse abre la misión;
  - desbloquear;
  - los botones de cada cancha;
  - el partido bloqueado y después en juego, con marcador y tiempo;
  - salir de la cancha;
  - el regente sigue andando.
  - Sin errores.

## Multijugador real (para otra sesión, NO hecho)
- **Ya está preparado**: el estado del partido (`partido`: jugadores, equipos, quién tiene la pelota,
  vuelo, marcador, tiempo) está separado del dibujo y **solo cambia con eventos**
  `evento({ quien, tipo })`, con `tipo` = pasar | tirar | quitar | regate. Para jugar con compañeros
  reales hay que mandar esos eventos por la red y que un solo lugar (el "anfitrión") resuelva el
  azar (tiros y quites).
- **Opciones**:
  - **Firebase Realtime Database** (ya estamos en Firebase): una sala por partido, con los eventos y
    las posiciones unas 10 veces por segundo.
    - Costo: bajo para un curso (se paga por GB descargado; un partido de 90 s con 4 chicos son
      pocos cientos de KB).
    - Hay que limitar las salas a los chicos del mismo curso con las reglas de seguridad.
  - **WebRTC** (de celular a celular): tiene menos demora y casi no cuesta en servidor, pero necesita
    un servidor para encontrarse (señalización, se puede hacer con la misma base) y a veces un
    servidor TURN cuando las redes lo bloquean (ese sí cuesta).
- **Seguridad de menores**:
  - solo compañeros del mismo curso, con apodos y sin nombres reales;
  - sin chat libre (solo frases y emotes de lista, como hoy);
  - sin audio ni video;
  - salas que se borran al terminar;
  - el docente puede ver y apagar el modo partido;
  - registro mínimo (quién jugó y cuándo), sin datos personales.

## Cierre

**Estado**: ✅ mergeado en main con el PR #19 (3f472d5), con el OK del dueño.
- Publicado en `nande-educacion.web.app/maqueta/`.
- La rama `sesion/edu-01c` sigue publicando al sitio en vivo si se pushean cambios en
  `educacion/`. No usarla sin avisar a la MAESTRA.

**App instalada** (último ajuste antes del merge):
- El manifest abre en el selector de perfiles: `start_url` es `/maqueta/` y `orientation` es
  `any`.
- Solo el juego del alumno traba la horizontal, y la suelta al salir con ✕.
- El selector también enlaza el manifest y registra el service worker (cache v2).
- Para ver el cambio enseguida en un celular que ya tenía la app instalada, hay que desinstalarla
  y volver a instalarla desde `/maqueta/`.

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
- "Jugar con el curso" en la cancha, y más lecturas reales de cada curso (EDU.05/EDU.08).
- Avisos de la dirección desde la base (EDU.03 / EDU.10).
- Cargar la maqueta GLB del dueño con `__enlazar` cuando esté (EDU.07).
