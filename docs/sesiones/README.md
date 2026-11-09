# Fichas de sub-sesión

## Quién es quién

- **MAESTRA**: la sesión que coordina. No programa módulos: ordena, lanza sub-sesiones, revisa
  sus resultados y mantiene `docs/plan-maestro.md`.
- **Sub-sesiones**: una por ficha. Cada una tiene un código `MÓDULO.NN`.

## Códigos de módulo

| Código | Módulo |
|---|---|
| `INF` | Infraestructura (deploy, permisos, dominio) |
| `NUC` | Núcleo ciudadano (cuenta, suscripción, billetera de créditos) |
| `EDU` | Educación (tutor IA, tablets) |
| `TRA` | Transporte (tipo Yango) |
| `MKT` | eMarket municipal |
| `VIV` | Vivienda verde / reciclaje |
| `LUZ` | Alumbrado solar |
| `SAL` | Salud IA + telemedicina |
| `ALC` | Dashboard del alcalde |

Numeración: `EDU.01`, `EDU.02`… en orden de ejecución dentro del módulo.
Archivo: `docs/sesiones/<CÓDIGO>-<tema>.md`. Rama sugerida: `sesion/edu-01`. El título de la
sesión en la nube empieza con el código (ej. "EDU.01 — Migración de RubiKEduAI").

**Educación — ramas que publican solas** (workflow `educacion.yml`, sin tocar el sitio en vivo):
- `sesion/canal-<código>` (ej. `sesion/canal-edu-05`): el sitio sale en un **canal de vista previa** de
  `nande-educacion` (14 días) y además se publican las Functions y corren las pruebas. Usarla cuando el
  cambio toca el servidor.
- `sesion/pantalla-<código>` (ej. `sesion/pantalla-edu-04c`): solo el sitio en su canal, en una cola
  propia, sin base, Functions ni pruebas con Gemini. Usarla cuando el cambio es solo de pantallas.
- El link del canal queda en el resumen del workflow ("Vista previa de esta rama").
- Una rama `sesion/<código>` normal no publica nada (salvo las que figuran en el workflow).

## Formato de cada ficha

- **Objetivo** — qué queda funcionando al final.
- **Antes de empezar** — qué leer, qué tiene que haber hecho el dueño.
- **Tareas** — en orden.
- **Hecho cuando** — criterio de salida verificable (idealmente desde el celular).
- **Cierre** — la sub-sesión anota lo pendiente y actualiza `docs/plan-maestro.md`.

Un PR por sub-sesión, con el código al inicio del título.
