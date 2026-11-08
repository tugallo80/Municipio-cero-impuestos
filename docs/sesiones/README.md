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

## Formato de cada ficha

- **Objetivo** — qué queda funcionando al final.
- **Antes de empezar** — qué leer, qué tiene que haber hecho el dueño.
- **Tareas** — en orden.
- **Hecho cuando** — criterio de salida verificable (idealmente desde el celular).
- **Cierre** — la sub-sesión anota lo pendiente y actualiza `docs/plan-maestro.md`.

Un PR por sub-sesión, con el código al inicio del título.
