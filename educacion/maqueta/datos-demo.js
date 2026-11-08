// Datos de DEMO de la maqueta EDU.01.
// Colegio, nombres y números son INVENTADOS. Nunca poner datos reales de menores acá.
window.DEMO = {
  colegio: {
    nombre: 'U.E. Arcoíris del Sur',
    nota: 'Colegio ficticio de demostración',
    gestion: 2026,
    trimestre: 3,
    hoy: 'Lunes 9 de noviembre'
  },

  tutor: { nombre: 'Prof. Daniela Méndez', cursos: ['4A', '5A'] },

  cursos: [
    { id: '4A', nombre: '4to de primaria A', tutor: 'Prof. Daniela Méndez', alumnos: 4, asistencia: 94, promedio: 71, avancePensum: 78, alertas: 1 },
    { id: '5A', nombre: '5to de primaria A', tutor: 'Prof. Daniela Méndez', alumnos: 4, asistencia: 91, promedio: 68, avancePensum: 72, alertas: 2 }
  ],

  // color = acento del aula en el mundo 3D; pos = ubicación del aula en el patio (x, z)
  materias: [
    { id: 'mat', nombre: 'Matemática', corto: 'Mate', icono: '🔢', color: '#10B981', pos: [-9, -6] },
    { id: 'len', nombre: 'Comunicación y Lenguajes', corto: 'Lenguaje', icono: '📖', color: '#F59E0B', pos: [0, -9] },
    { id: 'cnat', nombre: 'Ciencias Naturales', corto: 'Ciencias', icono: '🌱', color: '#22D3EE', pos: [9, -6] },
    { id: 'csoc', nombre: 'Ciencias Sociales', corto: 'Sociales', icono: '🗺️', color: '#A78BFA', pos: [-9, 5] },
    { id: 'ing', nombre: 'Inglés', corto: 'Inglés', icono: '💬', color: '#F472B6', pos: [9, 5] },
    { id: 'art', nombre: 'Artes Plásticas', corto: 'Artes', icono: '🎨', color: '#FB923C', pos: [0, 9] }
  ],

  // Plan del día del tutor (por materia)
  hoy: [
    { materia: 'mat', curso: '4A', hora: '08:00', tema: 'Fracciones equivalentes', pensum: 'Unidad 5 · Tema 3', estado: 'hecho' },
    { materia: 'len', curso: '4A', hora: '09:30', tema: 'Texto descriptivo: mi barrio', pensum: 'Unidad 4 · Tema 2', estado: 'en curso' },
    { materia: 'cnat', curso: '5A', hora: '11:00', tema: 'Ciclo del agua', pensum: 'Unidad 3 · Tema 4', estado: 'pendiente' },
    { materia: 'ing', curso: '5A', hora: '14:00', tema: 'Daily routines', pensum: 'Unit 6 · Lesson 1', estado: 'pendiente' }
  ],

  semana: [
    { dia: 'Lun', items: ['Mate · Fracciones', 'Lenguaje · Descripción', 'Ciencias · Agua', 'Inglés · Routines'] },
    { dia: 'Mar', items: ['Sociales · Departamentos', 'Mate · Práctica', 'Artes · Collage'] },
    { dia: 'Mié', items: ['Ciencias · Lab simple', 'Lenguaje · Lectura', 'Mate · Misión'] },
    { dia: 'Jue', items: ['Inglés · Vocabulary', 'Sociales · Mapa', 'Evaluación Mate'] },
    { dia: 'Vie', items: ['Artes · Exposición', 'Lenguaje · Escritura', 'Reunión de padres'] }
  ],

  mes: [
    { fecha: '12 nov', evento: 'Evaluación de Matemática (4A)' },
    { fecha: '18 nov', evento: 'Feria de Ciencias' },
    { fecha: '25 nov', evento: 'Cierre de notas del 3er trimestre' },
    { fecha: '28 nov', evento: 'Entrega de libretas' },
    { fecha: '4 dic', evento: 'Acto de clausura' }
  ],

  pensum: {
    mat: [
      { unidad: 'U4 · Multiplicación y división', avance: 100 },
      { unidad: 'U5 · Fracciones', avance: 60 },
      { unidad: 'U6 · Medidas y geometría', avance: 0 }
    ],
    len: [
      { unidad: 'U3 · El cuento', avance: 100 },
      { unidad: 'U4 · Textos descriptivos', avance: 45 },
      { unidad: 'U5 · La carta', avance: 0 }
    ],
    cnat: [
      { unidad: 'U2 · Seres vivos', avance: 100 },
      { unidad: 'U3 · El agua y el aire', avance: 70 },
      { unidad: 'U4 · Energía', avance: 0 }
    ],
    csoc: [
      { unidad: 'U3 · Mi municipio', avance: 100 },
      { unidad: 'U4 · Los 9 departamentos', avance: 50 }
    ],
    ing: [
      { unidad: 'Unit 5 · My family', avance: 100 },
      { unidad: 'Unit 6 · Daily routines', avance: 20 }
    ],
    art: [
      { unidad: 'U3 · Color y textura', avance: 90 },
      { unidad: 'U4 · Collage', avance: 30 }
    ]
  },

  // Perfil psicopedagógico v2 (EDU.01b): sin "estilo de aprendizaje" (no tiene evidencia).
  // nivel por tema · errores frecuentes · ritmo · intereses · accesibilidad (solo si lo indica
  // docente o profesional, nunca diagnóstico de la app ni dato para la IA) · cómo ayudar en casa.
  alumnos: [
    { id: 'A01', nombre: 'Mateo Rojas', apodo: 'Zorro Naranja 4', curso: '4A', promedio: 78, tendencia: 'sube', misiones: 12, avatar: '🦊',
      perfil: { fortalezas: 'Cálculo mental, creatividad, ayuda a sus compañeros',
        temas: [['Fracciones', 'en camino'], ['Multiplicación', 'logrado'], ['Texto descriptivo', 'en camino'], ['Ciclo del agua', 'logrado']],
        errores: ['Suma numeradores y denominadores (1/2 + 1/4 = 2/6)', 'Olvida mayúscula al empezar una oración'],
        ritmo: { min: 9, pistas: 1.2, abandonos: 0, texto: 'Constante; termina las misiones en el tiempo esperado' },
        intereses: ['fútbol', 'animales', 'construir'], accesibilidad: [], lengua: 'Castellano · lectura acorde a 4to',
        acceso: 'Tablet propia, conexión en casa por la tarde', repaso: 'Fracciones: repasar en 3 y 7 días',
        casa: ['Repartir la merienda en partes iguales y nombrar la fracción', 'Pedirle que les cuente qué misión hizo hoy'],
        obs: 'Cuando entiende algo, se lo explica a otro: buen candidato a mentor.' },
      notas: { mat: 84, len: 70, cnat: 80, csoc: 76, ing: 72, art: 88 } },
    { id: 'A02', nombre: 'Valentina Suárez', apodo: 'Búho Azul 2', curso: '4A', promedio: 85, tendencia: 'estable', misiones: 15, avatar: '🦉',
      perfil: { fortalezas: 'Comprensión lectora, orden, constancia',
        temas: [['Fracciones', 'logrado'], ['Texto descriptivo', 'logrado'], ['Departamentos', 'logrado']],
        errores: ['Se apura en problemas de varios pasos'],
        ritmo: { min: 7, pistas: .4, abandonos: 0, texto: 'Rápida; casi no pide pistas' },
        intereses: ['libros', 'dibujo'], accesibilidad: [], lengua: 'Castellano · lectura avanzada',
        acceso: 'Comparte la tablet con un hermano', repaso: 'Problemas de 2 pasos: 1 por semana',
        casa: ['Proponerle que lea en voz alta a la familia', 'Animarla a pedir ayuda cuando se traba'],
        obs: 'Le cuesta pedir ayuda: el botón "pedir ayuda" puede servirle.' },
      notas: { mat: 80, len: 92, cnat: 85, csoc: 86, ing: 81, art: 84 } },
    { id: 'A03', nombre: 'Thiago Vargas', apodo: 'Tortuga Verde 9', curso: '4A', promedio: 58, tendencia: 'baja', misiones: 6, avatar: '🐢',
      perfil: { fortalezas: 'Trabajo en equipo, deportes, buena memoria visual',
        temas: [['Fracciones', 'inicio'], ['Multiplicación', 'en camino'], ['Texto descriptivo', 'inicio']],
        errores: ['Confunde numerador y denominador', 'Se salta palabras al leer consignas largas'],
        ritmo: { min: 14, pistas: 2.8, abandonos: 2, texto: 'Necesita más tiempo; deja misiones a la mitad' },
        intereses: ['fútbol', 'motos', 'música'], accesibilidad: [['Consignas leídas en voz alta', 'docente'], ['Misiones más cortas', 'docente']],
        lengua: 'Castellano · lectura en proceso', acceso: 'Conexión intermitente en casa', repaso: 'Fracciones: repasar en 1, 3 y 7 días',
        casa: ['Leer juntos la consigna antes de empezar', 'Celebrar cuando termina una misión, aunque tarde'],
        obs: 'Bajó en las últimas 3 semanas: conviene hablar con la familia.' },
      notas: { mat: 52, len: 55, cnat: 63, csoc: 60, ing: 58, art: 70 } },
    { id: 'A04', nombre: 'Camila Justiniano', apodo: 'Delfín Rosa 5', curso: '4A', promedio: 72, tendencia: 'sube', misiones: 10, avatar: '🐬',
      perfil: { fortalezas: 'Expresión oral, inglés, curiosidad',
        temas: [['Fracciones', 'en camino'], ['Ortografía', 'inicio'], ['Daily routines', 'logrado']],
        errores: ['Confunde b/v y s/c al escribir'],
        ritmo: { min: 10, pistas: 1.5, abandonos: 0, texto: 'Avanza bien cuando usa la voz de Kay' },
        intereses: ['música', 'animales del agua'], accesibilidad: [['Subtítulos en la voz de Kay', 'docente']],
        lengua: 'Castellano y algo de guaraní en casa', acceso: 'Tablet propia', repaso: 'Ortografía: 3 palabras por día',
        casa: ['Dictarle 3 palabras por día y revisarlas juntas', 'Cantar canciones en inglés'],
        obs: 'Mejoró mucho con las misiones de voz.' },
      notas: { mat: 68, len: 66, cnat: 74, csoc: 72, ing: 86, art: 75 } },
    { id: 'A05', nombre: 'Sofía Rojas', apodo: 'Mariposa Lila 1', curso: '5A', promedio: 81, tendencia: 'estable', misiones: 14, avatar: '🦋',
      perfil: { fortalezas: 'Ciencias, dibujo, liderazgo en grupo',
        temas: [['Ciclo del agua', 'logrado'], ['Daily routines', 'en camino'], ['Departamentos', 'logrado']],
        errores: ['Pronunciación de la "th" en inglés'],
        ritmo: { min: 8, pistas: .8, abandonos: 0, texto: 'Constante' },
        intereses: ['plantas', 'dibujo', 'ciencia'], accesibilidad: [], lengua: 'Castellano · lectura acorde a 5to',
        acceso: 'Tablet propia', repaso: 'Inglés oral: 2 veces por semana',
        casa: ['Ver juntos un video corto en inglés y repetir frases', 'Dejarla explicar un experimento en casa'],
        obs: 'Lidera bien los trabajos de grupo.' },
      notas: { mat: 79, len: 80, cnat: 90, csoc: 82, ing: 66, art: 89 } },
    { id: 'A06', nombre: 'Benjamín Céspedes', apodo: 'Oso Café 8', curso: '5A', promedio: 63, tendencia: 'baja', misiones: 7, avatar: '🐻',
      perfil: { fortalezas: 'Construcción, maquetas, manos hábiles',
        temas: [['Fracciones', 'inicio'], ['Ciclo del agua', 'en camino']],
        errores: ['Cuenta con los dedos en multiplicaciones', 'Deja la misión cuando se equivoca 2 veces'],
        ritmo: { min: 12, pistas: 2.1, abandonos: 3, texto: 'Las misiones cortas le funcionan mejor' },
        intereses: ['construir', 'autos'], accesibilidad: [['Menos distractores en pantalla', 'profesional externo']],
        lengua: 'Castellano', acceso: 'Llega tarde seguido; usa la tablet en el colegio', repaso: 'Tablas: 5 minutos por día',
        casa: ['Jugar a las tablas en el camino al colegio', 'Recordarle que equivocarse no le quita nada'],
        obs: 'Las misiones cortas le funcionan mejor.' },
      notas: { mat: 55, len: 64, cnat: 68, csoc: 62, ing: 60, art: 80 } },
    { id: 'A07', nombre: 'Isabella Añez', apodo: 'Gata Dorada 3', curso: '5A', promedio: 74, tendencia: 'sube', misiones: 11, avatar: '🐱',
      perfil: { fortalezas: 'Lenguaje, sociales, prolijidad',
        temas: [['Geometría', 'en camino'], ['Departamentos', 'logrado']],
        errores: ['Confunde perímetro y área'],
        ritmo: { min: 9, pistas: 1, abandonos: 0, texto: 'Constante y prolija' },
        intereses: ['historias', 'mapas'], accesibilidad: [], lengua: 'Castellano · lectura avanzada',
        acceso: 'Tablet propia', repaso: 'Geometría: 2 veces por semana',
        casa: ['Medir juntos el contorno de una mesa (perímetro)'], obs: 'Constante y prolija.' },
      notas: { mat: 66, len: 84, cnat: 72, csoc: 80, ing: 74, art: 70 } },
    { id: 'A08', nombre: 'Lucas Montaño', apodo: 'Sapo Verde 6', curso: '5A', promedio: 54, tendencia: 'baja', misiones: 4, avatar: '🐸',
      perfil: { fortalezas: 'Memoria, música, oído',
        temas: [['Lectura', 'inicio'], ['Fracciones', 'inicio']],
        errores: ['Lee sílaba por sílaba y pierde el sentido', 'Omite letras al escribir'],
        ritmo: { min: 15, pistas: 3, abandonos: 4, texto: 'Pocas misiones este mes (faltó 4 días)' },
        intereses: ['música', 'ritmos', 'animales'], accesibilidad: [['Lectura en voz alta', 'docente'], ['Tipografía más grande', 'docente'], ['Tiempo extra', 'docente']],
        lengua: 'Castellano · lectura en proceso', acceso: 'Tablet compartida, sin internet en casa (usa modo sin conexión)',
        repaso: 'Lectura: 10 minutos por día', casa: ['Leer juntos 10 minutos por día, él elige el libro', 'Usar canciones para aprender palabras'],
        obs: 'Alerta: 3 misiones vencidas y faltas.' },
      notas: { mat: 50, len: 48, cnat: 58, csoc: 56, ing: 55, art: 62 } }
  ],

  misiones: [
    { id: 'M1', materia: 'mat', titulo: 'El mercado de las fracciones', desc: 'Ayudá a la casera a repartir frutas en partes iguales.', curso: '4A', vence: 'mié 11', estado: 'activa', hechos: 2, total: 4, llave: 'parque' },
    { id: 'M2', materia: 'mat', titulo: 'Tablas en carrera', desc: 'Multiplicaciones rápidas para abrir la puerta del aula.', curso: '4A', vence: 'hecha', estado: 'hecha', hechos: 4, total: 4 },
    { id: 'M3', materia: 'len', titulo: 'Describí tu barrio', desc: 'Escribí 5 oraciones que describan un lugar de tu barrio.', curso: '4A', vence: 'jue 12', estado: 'activa', hechos: 1, total: 4, llave: 'perdidos' },
    { id: 'M4', materia: 'cnat', titulo: 'El viaje de la gota', desc: 'Seguí a la gota por el ciclo del agua.', curso: '5A', vence: 'vie 13', estado: 'activa', hechos: 0, total: 4 },
    { id: 'M5', materia: 'csoc', titulo: 'Los 9 departamentos', desc: 'Ubicá cada departamento en el mapa de bloques.', curso: '5A', vence: 'lun 16', estado: 'activa', hechos: 3, total: 9 },
    { id: 'M6', materia: 'ing', titulo: 'My morning', desc: 'Ordená tu rutina de la mañana en inglés.', curso: '5A', vence: 'mar 17', estado: 'activa', hechos: 0, total: 3 },
    { id: 'M7', materia: 'art', titulo: 'Collage de colores cálidos', desc: 'Armá un collage con colores cálidos y sacale foto.', curso: '4A', vence: 'vie 13', estado: 'activa', hechos: 0, total: 1 },
    { id: 'M8', materia: 'cnat', titulo: 'Plantas que beben', desc: 'Observá una planta 3 días y anotá qué pasa.', curso: '4A', vence: 'hecha', estado: 'hecha', hechos: 3, total: 3 }
  ],

  // Avance del alumno de demo (Mateo) por materia, para el mundo 3D.
  // Sin puntos ni nivel: las misiones dan llaves a lugares (EDU.01b).
  alumnoDemo: { id: 'A01', apodo: 'Zorro Naranja 4', avatar: '🦊',
    avance: { mat: 72, len: 45, cnat: 80, csoc: 60, ing: 30, art: 88 } },


  // Mundo compartido del curso 4A (EDU.01b). Cerrado por curso, apodos de lista, sin texto libre.
  mundo: {
    // El dueño escribe el guion final de los lugares; estos 2 son de ejemplo.
    lugares: [
      { id: 'parque', nombre: 'Parque escondido', icono: '🌳', color: '#22C55E', mision: 'M1', pos: [-13, -13],
        pista: 'Detrás del cerco se escuchan pájaros… La llave verde está en la misión de fracciones del aula de Mate.',
        dentro: 'Hamacas, un árbol gigante y un picnic con pizzas para repartir.', minijuego: 'pizza' },
      { id: 'perdidos', nombre: 'Cuarto de objetos perdidos', icono: '🧸', color: '#F59E0B', mision: 'M3', pos: [13, -13],
        pista: 'La puerta está entreabierta y algo hace “clic, clic”… La llave amarilla está en la misión de describir del aula de Lenguaje.',
        dentro: 'Estantes llenos de cosas perdidas. Para devolverlas hay que describirlas bien.', minijuego: 'perdidos' }
    ],
    // Lugar que abre todo el curso con misiones sumadas
    puente: { nombre: 'Puente del arroyo', icono: '🌉', meta: 30, hechas: 22, pos: [0, -14.5], mio: 3,
      equipos: [{ nombre: 'Equipo Tajibo', aporte: 8 }, { nombre: 'Equipo Motacú', aporte: 7 }, { nombre: 'Equipo Ambaibo', aporte: 7 }] },
    // Compañeros de 4A: apodos de lista + ID opaco. Nunca nombre real ni foto.
    companeros: [
      { id: 'A02', apodo: 'Búho Azul 2', color: '#38BDF8', casa: { color: '#bae6fd', techo: '#1d4ed8', adornos: ['🌻', '📚', '🪁'] } },
      { id: 'A03', apodo: 'Tortuga Verde 9', color: '#22C55E', casa: { color: '#d9f99d', techo: '#15803d', adornos: ['⚽', '🌵'] } },
      { id: 'A04', apodo: 'Delfín Rosa 5', color: '#F472B6', casa: { color: '#fbcfe8', techo: '#be185d', adornos: ['🎵', '🐠', '🌺'] } },
      { id: 'X11', apodo: 'Tucán Rojo 2', color: '#EF4444', casa: { color: '#fecaca', techo: '#b91c1c', adornos: ['🎨', '🌈'] } }
    ],
    miCasa: { color: '#fed7aa', techo: '#c2410c', adornos: ['🪴', '⚽'],
      visitas: [{ quien: 'Búho Azul 2', reaccion: '🌟' }, { quien: 'Delfín Rosa 5', reaccion: '👏' }, { quien: 'Tortuga Verde 9', reaccion: '😄' }] },
    // Comunicación SOLO con esto (sin texto libre, voz, mensajes privados ni fotos)
    frases: ['¡Hola!', '¿Vamos juntos?', '¡Bien hecho!', 'Gracias', 'Te ayudo', '¡Mirá esto!', 'Nos vemos mañana'],
    emotes: ['👋', '👍', '🎉', '😄', '❤️', '🤔'],
    reacciones: [['👏', '¡Qué linda!'], ['🌟', '¡Me inspira!'], ['😄', '¡Genial!'], ['🌱', '¡Qué verde!']]
  },

  // Familia de demo: dos hijos (uno en cada curso)
  familia: {
    nombre: 'Familia Rojas',
    hijos: ['A01', 'A05'],
    feed: {
      A01: [
        { hora: '10:42', txt: 'Completó el paso 2 de "El mercado de las fracciones"', tipo: 'ok' },
        { hora: '10:15', txt: 'Pidió una pista al tutor IA en Matemática', tipo: 'info' },
        { hora: '09:30', txt: 'Entró a clase de Lenguaje', tipo: 'info' },
        { hora: 'Ayer', txt: 'Ganó la llave del Parque escondido', tipo: 'ok' }
      ],
      A05: [
        { hora: '11:05', txt: 'Empezó "El viaje de la gota"', tipo: 'info' },
        { hora: '10:20', txt: 'Sacó 90 en el repaso de Ciencias', tipo: 'ok' },
        { hora: 'Ayer', txt: 'Misión de Inglés pendiente (vence mar 17)', tipo: 'alerta' }
      ]
    },
    examenes: [
      { fecha: '12 nov', materia: 'Matemática', hijo: 'A01' },
      { fecha: '14 nov', materia: 'Ciencias Naturales', hijo: 'A05' },
      { fecha: '19 nov', materia: 'Inglés', hijo: 'A05' }
    ],
    reportes: [
      { titulo: 'Informe semanal', fecha: '6 nov', resumen: 'Buen avance en Matemática; reforzar lectura en casa 15 min por día.' },
      { titulo: 'Informe del 2do trimestre', fecha: '30 ago', resumen: 'Promedio 76. Mejoró en Ciencias y Artes.' }
    ],
    permisos: [
      { titulo: 'Salida a la Feria de Ciencias', fecha: '18 nov', estado: 'pendiente' },
      { titulo: 'Uso de fotos en el mural del colegio', fecha: '—', estado: 'autorizado' },
      { titulo: 'Retiro anticipado (cita médica)', fecha: '3 nov', estado: 'autorizado' }
    ]
  },

  // Dirección
  finanzas: {
    meses: [
      { mes: 'Jul', ingresos: 42000, gastos: 38500 },
      { mes: 'Ago', ingresos: 43500, gastos: 39000 },
      { mes: 'Sep', ingresos: 41000, gastos: 40200 },
      { mes: 'Oct', ingresos: 44800, gastos: 39800 },
      { mes: 'Nov', ingresos: 21500, gastos: 18200 }
    ],
    morosidad: 12,
    rubros: [
      { rubro: 'Sueldos docentes', monto: 28000 },
      { rubro: 'Servicios (luz, agua, internet)', monto: 4200 },
      { rubro: 'Mantenimiento', monto: 3100 },
      { rubro: 'Tablets y licencias', monto: 2500 },
      { rubro: 'Material didáctico', monto: 2000 }
    ]
  },

  planificacion: [
    { item: 'Planificación anual 2027', responsable: 'Dirección', estado: 'borrador', avance: 30 },
    { item: 'Planes de desarrollo curricular 3er trimestre', responsable: 'Docentes', estado: 'en revisión', avance: 85 },
    { item: 'Cronograma de evaluaciones finales', responsable: 'Coordinación', estado: 'aprobado', avance: 100 },
    { item: 'Plan de refuerzo para alumnos con alerta', responsable: 'Tutores', estado: 'en curso', avance: 50 }
  ]
};
