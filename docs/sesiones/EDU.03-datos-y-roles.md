# EDU.03 — Datos, cuentas y roles

## Objetivo
Modelo de datos del colegio y cuentas con 4 roles (tutor, alumno, padre/madre, dirección), con reglas de seguridad para que cada uno vea solo lo suyo.

## Antes de empezar
- Leer `CLAUDE.md`, `docs/plan-maestro.md`, `docs/educacion/vision-interfaz.md` y `docs/educacion/vision-plataforma-educativa.md`.
- Depende de: EDU.02.

## Tareas (borrador — la MAESTRA las afina antes de lanzar)
1. Esquema: colegio → cursos → materias → alumnos (ID opaco) → misiones, notas, asistencia; padres vinculados a hijos.
2. Firebase Auth con rol en custom claims; reglas de la base por rol (un padre solo ve a sus hijos).
3. Pruebas de reglas automáticas (emulador).
4. Seed del colegio ficticio de la maqueta (mismos datos que `datos-demo.js`).
5. El nombre real del alumno nunca viaja a la IA: solo ID opaco y datos pedagógicos.

## Hecho cuando
- Se prueba desde el celular/laptop con la URL de vista previa del PR, con datos de demo.

## Cierre
(pendientes de la sesión)
