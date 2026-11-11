# EDU.06c — Regente y guardias

## Objetivo

Ajuste del dueño: adentro del colegio el espacio es chico y el regente perseguía demasiado, así que
molestaba más de lo que divertía. Rama `sesion/pantalla-edu-06c`: publica solo en su canal de vista
previa, sin tocar el live.

## Qué cambió

- **Regente adentro**: siempre sentado y dormido (💤) en su silla de la galería.
  - Se despierta **solo** si el alumno pasa a menos de ~1,8 m o lo toca. Ya no lo despierta correr
    a 2,4 m.
  - Persigue poco: como mucho 2,5 s y 3,5 m desde donde se despertó, más lento (3,2 m/s; el alumno
    corre a 6).
  - Si no te alcanza, dice "Mmm…" y vuelve a sentarse y a dormir. No te vuelve a ver mientras
    vuelve, y descansa 6 s.
  - No sale del colegio: si salís, te deja.
- **Sin guardia en la galería**: adentro ya no patrulla nadie.
- **Guardia afuera**: hace la ronda alrededor del colegio (plazuela, canchas, parque y la cuadra de
  atrás).
  - Persigue más: hasta 10 s y 28 m. Hay lugar para escapar y esconderse detrás de árboles, casas o
    paredes.
  - No entra al colegio: si te metés, vuelve a su ronda.
- **Las reglas de siempre**:
  - cono de visión que no atraviesa paredes, horcones ni árboles;
  - "❗" y música suave mientras persigue;
  - si te alcanza, fundido a la dirección y la directora dice algo gracioso;
  - sin castigo ni pérdida de avance.

## Nodos para la guía de la maqueta (sin cambios de nombre)

- `obj_silla_galeria_01`: la silla del regente de adentro.
- `ruta_guardia_01_NN`: ahora es la **ronda exterior**. Son 4 puntos alrededor del colegio, a ~1,5 m
  de las paredes.

## Probado (Playwright, 915×412, táctil)

- **Guardia**:
  - la ronda queda siempre afuera del colegio;
  - te ve afuera y te persigue;
  - si te metés al colegio, vuelve a su ronda.
- **Regente** (P1 y P5):
  - a 2,6 m sigue dormido;
  - a 1,4 m se despierta;
  - si te alejás, persigue un poco, vuelve y se duerme.
- Sin errores.

## Pendiente

- Probar en el celular si 1,8 m para despertarlo se siente bien, o si conviene 1,5 m.
