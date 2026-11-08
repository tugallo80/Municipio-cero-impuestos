# Mundo abierto "Mi colegio en Santa Cruz" — investigación (8-nov-2026)

Idea del dueño (ver `docs/educacion/vision-interfaz.md`): cada colegio geoubicado en un mapa de
Santa Cruz; los alumnos construyen su escuela con recursos limitados; la única moneda son los
deberes; visitas entre colegios del mismo nivel; competencia anual entre colegios; acceso
verificado con RUDE + carnet + aval del director.

Cuatro investigaciones: economía (tareas como moneda), competencia entre colegios, verificación
de identidad de menores en Bolivia, factibilidad técnica. Varias cifras salen de resúmenes o
fuentes secundarias y algunos sitios estaban bloqueados: **verificar antes de citar**.

## Respuesta corta

**La idea es viable y tiene base**, con cuatro ajustes:
1. **La moneda no paga "hacer tareas": paga "dominar temas"**, con materiales que dicen qué se
   aprendió, y se gana sobre todo **en clase**.
2. **Competir como colegio sí, pero midiendo mejora y participación**, en ligas de colegios
   comparables, con una **meta común de toda la ciudad**. Nunca un ranking único de la ciudad.
3. **RUDE + carnet + director sirve para dar de alta la cuenta, no para entrar.** El niño entra con
   QR o PIN que entrega el colegio; la plataforma guarda solo un ID opaco.
4. **Se construye por etapas** con la tecnología actual (app web + three.js): primero mi colegio,
   después visitas asincrónicas, luego eventos, al final salas en vivo.

## 1. Economía: la moneda es el conocimiento

**Evidencia**
- Las economías de fichas cambian la conducta mientras duran; al retirarlas, los logros caen si no
  se planifica el retiro (Kazdin y Bootzin 1972). Rinden más en conducta que en lo académico
  (Soares y otros 2016).
- Pagar dinero a alumnos en más de 200 escuelas de EE. UU. no subió las notas (Fryer 2011, QJE).
- "Engañar al sistema" (abusar de pistas, adivinar) es la conducta más asociada a aprender menos
  (Baker y otros 2004).
- Aprendizaje por dominio (feedback → corrección → nueva prueba) mejora resultados (Kulik y otros
  1990, 108 evaluaciones); el repaso espaciado mejora el recuerdo (Cepeda y otros 2006).
- Integrar el contenido a la mecánica del juego: más aprendizaje y 7 veces más juego voluntario
  (Habgood y Ainsworth 2011).
- **En primaria, el tiempo de deberes en casa casi no se relaciona con el rendimiento** (Cooper,
  Robinson y Patall 2006) y depende mucho del hogar.

**Diseño recomendado**
- **Materiales con significado**, no monedas sueltas: "ladrillo de fracciones", "viga de lectura".
  Partes de la escuela que solo se construyen dominando un tema (el techo requiere geometría).
- **No anunciar un pago por tarea**: los materiales llegan al completar una unidad de dominio.
- **Cómo se ganan**: 70–80% por **dominio** (primera vez que se alcanza el criterio, ej. 4 de 5 en
  ítems nuevos); menos por **repaso espaciado** (a los 2, 7 y 21 días); **rehacer paga solo la
  mejora** sobre el mejor intento, con ítems nuevos y después del feedback; bonus por desafío.
- **Anti-farmeo**: tema ya dominado paga 0 fuera del repaso; **tope diario** (lo que sobra se vuelve
  decoración sin valor competitivo); respuestas al azar o abuso de pistas no pagan.
- **No se compra**: nada con dinero real, ni pistas, ni saltear tareas, ni materiales de otros colegios.
- **Equidad**: la mayor parte se gana **en clase** (bloque semanal fijo); en casa suma con tope.
- **Plan de retiro**: los pagos explícitos bajan con el tiempo y quedan proyectos de construcción
  con sentido propio.

## 2. Competencia entre colegios

**Evidencia**
- Cooperar dentro del equipo y competir contra otro dio más motivación que solo cooperar o solo
  competir (Tauer y Harackiewicz 2004; estudios chicos, deporte).
- Metas grupales + responsabilidad individual: 37 de 44 comparaciones positivas, y mejores
  relaciones entre grupos (Slavin).
- Competir por premios escasos generó hostilidad; la bajaron las **metas que ningún grupo logra
  solo** (Sherif, Robbers Cave).
- Rankings de escuelas por nivel absoluto: reflejan el nivel socioeconómico y son ruidosos (Leckie
  y Goldstein 2009); en Chile (SIMCE) se asocian a estigmatizar escuelas pobres.
- Sentirse parte de la escuela se asocia (poco) con mejor rendimiento y menos ausentismo
  (Korpershoek y otros 2020).

**Diseño recomendado**
- **Qué se mide**: mejora de cada colegio respecto de sí mismo; **participación** (% de alumnos
  activos, mediana por alumno, no el total); bonus por "levantar al último" (cuando sube el cuartil
  más bajo). Todo ajustado por matrícula.
- **Ligas** chicas (6–10 colegios) por nivel, tamaño y contexto, que rotan cada temporada.
- **Premios por categorías** ("mayor mejora", "más participación", "obra más colaborativa", "más
  creativa"); al colegio, nunca a un alumno; ninguno depende del dinero de las familias.
- **Meta de ciudad**: una obra que construyen todos los colegios juntos (un hito cruceño, un puente
  entre anillos); **colegios padrinos** de anillos distintos; obras en dúo.
- **Se muestra**: visitar las escuelas de otros, avance de la meta de ciudad, podios por liga y
  categoría, la mejora propia. **No se muestra**: ranking de toda la ciudad, rankings de alumnos,
  el fondo de la tabla. **Cierre del año como feria** ("inauguración"), no como eliminación.
- Visitas solo con reacciones predefinidas; nadie puede destruir lo de otro colegio.

## 3. Verificación de identidad (Bolivia)

**Lo que se encontró**
- El RUDE lo genera el sistema del Ministerio al inscribir; lleva el código SIE y la firma del
  director. **No hay API pública** para que terceros lo verifiquen; haría falta un convenio.
  **Hay reportes RUDE publicados en internet**: no sirve como secreto.
- El carnet de niños es obligatorio desde los 3 meses (DS 1434/2012) y gratuito (DS 4655/2022). No
  se encontró qué porcentaje de alumnos de primaria lo tiene. No hay servicio público del SEGIP
  para que terceros verifiquen; los privados que lo ofrecen **no se recomiendan** para menores.
- Ciudadanía Digital es para mayores de 18: sirve para el **padre o la madre**, no para el niño.
- Así lo hacen afuera: Google Workspace for Education (la escuela crea las cuentas), Minecraft
  Education (solo cuenta escolar), Clever (tarjeta QR para 5–9 años), Seesaw (QR o código de clase).
- Bolivia: Constitución art. 21 (privacidad e imagen) y arts. 130–131 (Acción de Protección de
  Privacidad); Ley 548 arts. 143–144 (verificar vigencia); Ley 164 y DS 1793 (datos en TIC);
  ley de datos personales solo en anteproyecto.

**Diseño recomendado**
- **Alta**: la crea el director o docente desde un panel del colegio, con **convenio** con la
  Dirección Distrital/Departamental, **consentimiento de los padres** (papel o Ciudadanía Digital)
  y revisión anual de la lista.
- **Se guarda**: ID opaco, colegio, grado, curso, docente, apodo o avatar de una lista, hash del PIN.
  El RUDE solo para el alta (hash con sal, o queda en el colegio). **Nunca**: carnet, nombre
  completo, fecha de nacimiento exacta, foto de la cara, ubicación precisa ni celular del niño.
- **No exigir el carnet**: alcanza RUDE + aval del director (evita excluir a quien no lo tenga).
- **Entrar**: 6–8 años con **QR impreso** por el colegio (o QR de clase + avatar o PIN de figuras);
  9–12 años con usuario + PIN propio que entrega el docente. Sobre todo en **tablets del programa
  con gestión de dispositivos**; uso en casa con un código que activan los padres.
- **Entre colegios**: solo apodo, avatar y colegio por zona; frases predefinidas; sin mensajes
  privados; docentes como moderadores; ningún adulto sin cuenta validada de docente.

## 4. Factibilidad técnica

- **Seguir con la app web (PWA) y three.js** + un motor de bloques propio y liviano (chunks de 16³,
  una malla por chunk, WebGL2). Unity y Godot en el navegador rinden peor en gama baja; WebGPU solo
  como mejora (no todos los Android lo tienen).
- **Cada colegio = un archivo chico comprimido** en Cloud Storage (~200 veces más barato que en la
  base de datos actual). Cambios guardados en la tablet sin internet y sincronizados en el colegio;
  si dos tocan el mismo bloque gana el último; zonas por alumno o grupo para que casi no choquen.
- **Las monedas las da solo el servidor.**
- **Mapa** con OpenStreetMap (colegios y anillos), con atribución visible (licencia ODbL); colegios
  lejanos como "postales".
- **Moderación de construcciones**: piezas prearmadas y colores limitados + capturas revisadas por
  IA + **aprobación obligatoria del docente** antes de que lo vean otros colegios (la IA reconoce mal
  figuras de bloques; Roblox tuvo esvásticas).
- **Antes de empezar**: probar el motor en 3 modelos reales de tablet; modo 2D o "postal" de respaldo.

**Etapas**
1. **Mi colegio** — cada curso construye su escuela (complejidad media).
2. **Visitas asincrónicas** entre colegios del mismo nivel: ver la última versión aprobada y dejar
   reacciones (media).
3. **Eventos y competencias** con jurado docente (media-alta).
4. **Ciudad en vivo** por salas de ~30 niños, no toda la ciudad a la vez (alta; desde ~USD 15/mes).

## Qué medir en el piloto

- Comparar cursos con y sin economía (o variantes); prueba antes y después; dominio retenido a 3–6 semanas.
- Farmeo: intentos en temas ya dominados, tiempo por ítem, abuso de pistas, errores antes de rehacer.
- Motivación: uso libre del juego **después** de apagar los pagos.
- Equidad: materiales y dominio según acceso a tablet en casa, nivel inicial y género.
- Clima: rivalidad entre colegios, burlas, presión sobre rezagados (percepción docente).

## Para consultar con el Ministerio o un abogado

1. Convenio para validar el RUDE con el SIE: qué resolución lo autoriza y qué datos se pueden recibir.
2. Si el carnet del alumno es obligatorio en 2026 y cuántos no lo tienen.
3. Vigencia y alcance de la Ley 548 (arts. 143–144) para una red social escolar; ¿hace falta la Defensoría de la Niñez?
4. Qué consentimiento hace falta (padres, director, Distrital/Departamental); ¿RM o reglamento específico?
5. Cómo cumplir Ley 164 y DS 1793 y prepararse para la futura ley de datos.
6. Dónde se guardan los datos y quién responde ante una filtración (municipio, Ministerio o proveedor).

## Evidencia vs inferencia

- **Evidencia**: fichas cambian conducta pero el retiro es frágil; pagar no subió notas (Fryer);
  dominio y repaso mejoran el aprendizaje; engañar al sistema se asocia a aprender menos; deberes en
  casa casi no predicen rendimiento en primaria; cooperación con metas grupales funciona; metas
  comunes bajan la hostilidad; rankings por nivel absoluto reflejan el nivel socioeconómico.
- **Inferencia**: que los "materiales con significado" informen mejor que puntos; que pagar solo
  la mejora evite el error intencional; que la meta de ciudad y los padrinos eviten la rivalidad;
  que three.js aguante 30 fps en las tablets del municipio. **Nada de esto se probó en un mundo
  abierto escolar en Bolivia: validar en talleres y piloto.**
