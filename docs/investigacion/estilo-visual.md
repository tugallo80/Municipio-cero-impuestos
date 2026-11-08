# Estilo visual propio para 6–17 años (8-nov-2026)

Algunas fuentes (nngroup, ncbi) no se pudieron abrir; se citan desde resúmenes. **No hay estudios
que comparen estilos 3D por edad**: la validación con chicos es imprescindible.

## Respuesta corta

- Funciona para todas las edades un **3D estilizado y "honesto"**: formas simples, siluetas claras,
  paleta controlada, luz cálida, humor amable. Ni "bebé" ni hiperrealista.
- Para ÑANDÉ: **maqueta low poly facetada con piezas modulares que se acomodan solas** (estilo
  Townscaper / Tiny Glade) sobre una grilla que sigue los anillos. Barata en gama baja y fácil de
  construir con el dedo.
- La diferencia por edad va en **interfaz, avatar y tono**, no en dos mundos.

## Hallazgos

- Adolescentes rechazan lo que se ve "demasiado infantil" y que les digan "niños" (NN/g *Teenagers
  on the Web*, 2005, cualitativo y antiguo). Los niños aman la animación pero abandonan lo confuso.
- La personalización del avatar importa más con la edad y se asocia con la autoestima adolescente.
- ~2/3 de los usuarios diarios de Roblox tienen 13+ (Roblox, 3T-2025); la mayoría de jugadores de
  Animal Crossing NH tienen 20–39 (Nintendo): un estilo simple o tierno no espanta a los mayores.
- Fortnite pasó de oscuro/realista a caricaturesco; BotW mezcló cel-shading con realismo para un
  Link "más mayor".
- Townscaper: tocás una celda y el sistema elige la pieza que encaja; Tiny Glade agrega detalles solo.
- A Short Hike: render a baja resolución ampliado sin suavizado → menos detalle necesario.
- Identidad local bien hecha: *Never Alone* (con el Cook Inlet Tribal Council) y *Mulaka* (con
  antropólogos y líderes rarámuri). En Santa Cruz: galerías con horcones, patios y aljibes; techos
  tradicionales mayormente de palma. Artecampo/CIDAC agrupa 14 asociaciones indígenas de tierras
  bajas; la protección legal de sus diseños es débil → **co-diseñar y acreditar, nunca copiar**.
- Rendimiento (three.js en celular): pocas llamadas de dibujo, mallas instanciadas, sin sombras en
  tiempo real, sin antialiasing, una o dos luces (guías de la comunidad).

## Tres propuestas

### A. "Maqueta Viva" (diorama facetado) — recomendada para probar primero
- Low poly facetado de cantos suaves, como maqueta tallada en madera y arcilla; ciudad como tablero
  redondo por anillos, bosque que crece en los bordes.
- Paleta: esmeralda `#10B981` (lo restaurado/conocimiento), arena `#E9CFA3`, teja `#C65A3A`,
  tajibo amarillo `#F2C230`, tajibo rosado `#E68AB8`, Piraí `#5FB7C9`, bosque `#1F5E45`;
  interfaz sobre `#000000`/`#111111`.
- Luz de tarde cálida, oclusión horneada en vértices, sombra falsa bajo cada objeto, niebla verde-azulada.
- Avatares de ~4 cabezas, cara simple con expresiones por calcomanía, mucha personalización.
- Construcción: tocar una celda de la grilla radial; el sistema elige la pieza (galería con
  horcones, techo de palma o teja, patio, aljibe, mirador).
- Colegio: casona con galerías alrededor de un patio que crece en torres y techos verdes.
- Bosque: toborochis, tajibos, motacús; paraba, peta, y raramente el jaguar.
- Portal: arco de horcones con enredadera de tajibo que brilla en esmeralda.
- Costo técnico: **bajo**.

### B. "Tierra Pintada" (gráfico con contorno)
- Cel-shading de dos tonos con contorno, estilo Wind Waker/BotW. Patrones geométricos solo como
  acentos (interfaz, banderas, portales), **co-diseñados y acreditados** con Artecampo o comunidades.
- Paleta más saturada: `#10B981`, terracota `#B8492F`, ocre `#D9A441`, crema `#F5ECD7`, tinta `#0A0A0A`.
- Avatares de ~5–6 cabezas, "cómic juvenil". Portal: círculo con guarda tejida que gira.
- La más "propia" y la más fácil de llevar a campañas físicas. Costo técnico: **medio**.

### C. "Pixel Camba" (baja resolución + paleta corta)
- Geometría de A dibujada al 40–50% de resolución, ampliada sin suavizado, ~32 colores (estilo A Short Hike).
- Prestigio retro entre adolescentes; costo técnico **el más bajo**. Riesgo: puede parecer "juego
  viejo" a docentes y padres; la interfaz se dibuja aparte.

**Recomendación**: probar **A**, con los patrones de **B** en interfaz y portales, y **C** como
**modo de rendimiento** para tablets débiles.

## Validación (2 semanas, 2 colegios, con consentimiento)

1. Tres láminas (colegio, bosque, portal) por estilo a grupos de 6–8, 9–12 y 13–17: "¿Cuál querés
   jugar?", "¿Esto es para alguien de tu edad?" (1–5) y un adjetivo libre.
2. Prueba de construcción en la tablet real de gama baja: armar un aula en 3 minutos.
3. Métricas: tasa de éxito, toques fallidos, fps (meta ≥ 30); que los adolescentes no den menos de
   3 en "¿es para mi edad?".

## Evidencia vs inferencia

- **Evidencia**: rechazo adolescente a lo infantil; personalización del avatar crece con la edad;
  públicos mayores en Roblox y Animal Crossing; técnicas de Townscaper, Tiny Glade, A Short Hike;
  casos de co-creación; reglas de rendimiento.
- **Inferencia**: que el low poly facetado sea transversal por edad, la grilla radial, las paletas
  y proporciones, que el pixelado guste a adolescentes cruceños.
