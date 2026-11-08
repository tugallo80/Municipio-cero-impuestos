# Guía para armar la maqueta 3D del colegio y la ciudad

> Para el dueño. Vos armás la **maqueta volumétrica** (formas y tamaños); Claude la abre en Blender
> en la nube, la limpia, le pone texturas, saca las **evoluciones por curso** y la conecta al juego.
> Versión 1 — 8-nov-2026. Se ajusta con EDU.06b.

## 1. Formato y escala

- Exportá en **GLB** (o glTF). Si tu programa no puede, **FBX** u **OBJ** también sirven, pero se pierden colores.
- **1 unidad = 1 metro.** Medidas de referencia:
  - puerta de aula: 1,1 × 2,2 m · ventana: 1,2 m de alto, a 0,9 m del piso;
  - altura de pared/galería: 3,2 m · horcón: 0,3 m de grueso;
  - alumnos: 1,15 m (P1) a 1,65 m (S6) · adulto: 1,70 m.
- El **piso del patio en altura 0**, **Y hacia arriba**.
- Cada objeto con su **punto de giro (pivote) abajo y al centro**, y su **frente hacia +Z** (el lado por donde se entra o se usa).
- Liviano: formas simples. Nada de detalles chicos (tornillos, letras en 3D): eso lo agrega Claude.

## 2. Una pieza = un objeto, con nombre

El juego **lee los nombres** para saber qué se puede tocar. Usá minúsculas, sin acentos ni espacios.

| Prefijo | Qué es | Ejemplos |
|---|---|---|
| `aula_` | El cuarto de un aula (paredes y techo) | `aula_mate`, `aula_lenguaje`, `aula_ciencias`, `aula_sociales`, `aula_artes`, `aula_ingles` |
| `puerta_` | Puerta por donde se entra (muestra el cartel "Entrar") | `puerta_mate`, `puerta_biblioteca`, `puerta_zaguan` |
| `zona_` | Un área (piso) donde pasa algo | `zona_patio`, `zona_cancha`, `zona_huerto`, `zona_kiosco`, `zona_biblioteca`, `zona_direccion` |
| `obj_` | Un objeto que se toca y hace algo | `obj_pizarra_mate`, `obj_estante_mate`, `obj_microscopio_ciencias`, `obj_globo_sociales`, `obj_caballete_artes`, `obj_aljibe` |
| `interior_` | Volumen donde la cámara baja a altura de ojos | `interior_colegio`, `interior_aula_mate` |
| `colision_` | Caja invisible que no se puede atravesar | `colision_muro_norte` |
| `deco_` | Decoración sin interacción | `deco_banco_01`, `deco_arbol_toborochi` |

Si hay varios iguales, numeralos: `deco_banco_01`, `deco_banco_02`.

Materias: `mate`, `lenguaje`, `ciencias` (Naturales), `sociales`, `artes`, `ingles`.
Lugares: `biblioteca`, `futbol`, `basquet`, `parque` (infantil), `huerto`, `kiosco`, `direccion`.

Objetos que el juego ya sabe usar (EDU.06b):
- En cada aula: `obj_pizarra_<materia>`, `obj_estante_<materia>`, `obj_silla_<materia>_01…` (se sientan), `deco_mesa_<materia>_01…`.
- De cada materia: `obj_abaco_mate`, `obj_microscopio_ciencias`, `obj_cuerpo_ciencias`, `obj_globo_sociales`, `obj_mapa_sociales`, `obj_caballete_artes`, `obj_radio_ingles`, `obj_libros_lenguaje`.
- Afuera: `obj_arco_futbol_01/02`, `obj_aro_basquet_01/02`, `obj_hamaca_01…`, `obj_resbalin`, `obj_subeybaja`, `obj_kiosco`, `obj_planta_huerto`.

Partes que se mueven (opcional): dentro de `obj_hamaca_01` una pieza hija llamada `asiento` (con el pivote arriba, donde cuelga); dentro de `obj_subeybaja` una pieza hija `tabla` (pivote al centro). Si no las separás, igual funciona.

Si te falta un nombre para algo nuevo, inventalo con la misma lógica y avisame.

## 3. Colores (opcional, ayuda)

Pintá cada material con un color plano y un nombre: `mat_pared`, `mat_techo_teja`, `mat_piso_patio`,
`mat_madera`, `mat_pasto`. Claude los reemplaza por la textura de cada evolución:
- Bloques (P1–P2) · Piezas (P3–P4) · Mundo real (P5–P6) · Horizonte (S1–S2) · Mundo vivo (S3–S5) · Promo (S6).

## 4. Qué conviene incluir

- **Colegio**: zaguán, patio con galería, las 6 aulas, biblioteca, cancha, huerto, kiosco, dirección, baños (solo como volumen).
- **Adentro de cada aula**: bancos, pizarra, estante y el objeto de la materia.
- **Ciudad** (aparte, en otro archivo): manzanas como bloques, anillos, plaza, catedral, Cristo, río y los colegios.
  Para la ciudad alcanzan cajas simples: lo lejano se ve con niebla.

## 5. Cómo me lo pasás

Subí el archivo a Google Drive y pasame el link, o adjuntalo en el chat de la MAESTRA.
Con el primer archivo hacemos la **prueba** (pendiente n.º 1): un edificio terminado y un personaje,
y medimos tiempo y calidad antes de decidir el plan de USD 200.
