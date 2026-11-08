# EDU.02b — Los profes dentro del mundo

## Objetivo
En la maqueta del alumno (`/maqueta/alumno.html`) el niño **habla por voz en vivo** con dos profes
mientras juega, sin que la voz tape el juego.

## Antes de empezar
- Parte de `sesion/edu-02` (motor Kay, PR #3) + `sesion/edu-01b` (maqueta v2, PR #4) + docs de la maestra.
- Leer `docs/educacion/vision-interfaz.md` ("Dos tutores con personalidad", "Ajuste del habla camba",
  "Los profes dentro del mundo"), `docs/investigacion/voz-del-tutor.md` y `experiencia-del-alumno.md`.
- Autorización del dueño: publicar en `municipio-ia` (Functions de Educación y sitio `nande-educacion`)
  desde la rama, sin mergear.

## Tareas
1. Dos personalidades: **la profe** (voz Sulafat) y **el profe** (voz Achird), mismo nivel de calidez
   y saber, sin materias asignadas, siempre disponibles, aclaran que son IA.
2. Habla camba: aspiración de la "s" y vocabulario ("belleza", "la tuti", "mucha dosis", "otro level").
   Un archivo de personalidad por profe, fácil de afinar.
3. Llamar a uno u otro con su cara (botón) o por voz ("quiero hacerlo con la profe"); recordar la
   preferencia por materia sin imponerla; memoria compartida.
4. Voz dentro del mundo: **marco que palpita** o **franja de luz abajo** que se mueve con el sonido,
   con interruptor para comparar.
5. Contexto de la misión: el profe sabe en qué pregunta está el niño y da la escalera
   (pregunta → pista → ejemplo resuelto), nunca la respuesta; celebra al terminar.
6. Privacidad y costos como en EDU.02 (ID opaco, límites por cuenta, tope USD 5/día).

## Hecho cuando
- Con la cuenta `dueno`, en el celular, se llama a un profe tocando su cara, se le habla mientras
  se resuelve una misión, da pistas sin la respuesta, se cambia al otro por voz o tocando su cara,
  y la voz se ve como marco o franja sin tapar el juego.
- La prueba automática del deploy pasa (nombre, IA, pistas sin respuesta, relevo, memoria).

## Cómo quedó (técnico)

| Pieza | Dónde |
|---|---|
| Nombres, voz y color de cada profe | `educacion/services/ai-gateway/tutor/profes.json` |
| Personalidad común (pedagogía, camba, seguridad, avisos del juego) | `tutor/profes/comun.md` |
| Estilo de cada uno | `tutor/profes/la-profe.md`, `tutor/profes/el-profe.md` |
| Arma la instrucción (misión por ID + memoria) | `tutor/profes.js` |
| Contenido de las misiones (uno solo para maqueta y servidor) | `educacion/maqueta/misiones-demo.js` (copia exacta en `tutor/`; `npm test` avisa si difieren) |
| Voz en la maqueta (caras, marco/franja, avisos, relevo) | `educacion/apps/web/profes/profes-voz.js` → se publica como `/voz/profes.js` |
| Volumen para la animación + texto en medio de la charla | `educacion/packages/voz-kay/src/kaySession.js` |

- **Functions**: `eduKayToken` acepta `profe` (`la_profe`/`el_profe`), `mision` (solo IDs y números)
  y `relevoDe`. Nueva `eduProfes` (lista de profes + preferencia por materia). `eduKayUso` guarda en
  qué quedó (`edu/memoria/{alumnoId}`: misión, paso, peldaño; nada personal).
- **Relevo** (cambiar de profe en medio de la charla): no cuenta como charla nueva y hereda el reloj de
  10 minutos de la charla original. Máximo 40 cambios por día.
- **Avisos del juego**: la maqueta le cuenta al profe, como texto `[JUEGO]`, cuando abre una misión,
  pasa de paso, se equivoca, toca "darme una pista" o termina. Si el profe está hablando, el aviso
  espera a que calle.
- **Herramientas del modelo**: `terminar_conversacion`, `llamar_profe`, `mostrar_pista` (el peldaño
  que da por voz aparece también en la pantalla).
- **Sin internet** (o maqueta abierta como archivo): las caras abren la ayuda de texto de antes.
- **Demo del efecto sin gastar charlas**: `/maqueta/alumno.html?demo-voz=la_profe&efecto=marco`.

## Nombres propuestos (provisionales, elige el dueño)

| La profe (Sulafat) | El profe (Achird) |
|---|---|
| **Taji** (del tajibo en flor) — en uso | **Jochi** (el del monte) — en uso |
| Cusi (la palmera) | Totaí (la palmera) |
| Paraba (el loro grande) | Peji (el tatú chiquito) |

Para cambiar: editar `nombre` y `titulo` en `profes.json` (y los títulos de los botones en `alumno.html`).

## Cierre

_(se completa al terminar)_
