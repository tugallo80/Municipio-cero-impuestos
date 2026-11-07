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

  alumnos: [
    { id: 'A01', nombre: 'Mateo Rojas', curso: '4A', promedio: 78, tendencia: 'sube', misiones: 12, estilo: 'Visual', avatar: '🦊',
      perfil: { estilo: 'Aprende mejor con dibujos y esquemas', fortalezas: 'Cálculo mental, creatividad', apoyo: 'Se distrae en lecturas largas', contexto: 'Usa la tablet en casa por la tarde', obs: 'Responde muy bien a las misiones con tiempo límite.' },
      notas: { mat: 84, len: 70, cnat: 80, csoc: 76, ing: 72, art: 88 } },
    { id: 'A02', nombre: 'Valentina Suárez', curso: '4A', promedio: 85, tendencia: 'estable', misiones: 15, estilo: 'Lectora', avatar: '🦉',
      perfil: { estilo: 'Aprende leyendo y escribiendo', fortalezas: 'Comprensión lectora, orden', apoyo: 'Le cuesta pedir ayuda', contexto: 'Comparte tablet con un hermano', obs: 'Buena candidata para monitora de lectura.' },
      notas: { mat: 80, len: 92, cnat: 85, csoc: 86, ing: 81, art: 84 } },
    { id: 'A03', nombre: 'Thiago Vargas', curso: '4A', promedio: 58, tendencia: 'baja', misiones: 6, estilo: 'Kinestésico', avatar: '🐢',
      perfil: { estilo: 'Aprende haciendo y moviéndose', fortalezas: 'Trabajo en equipo, deportes', apoyo: 'Fracciones y comprensión lectora', contexto: 'Conexión intermitente en casa', obs: 'Bajó en las últimas 3 semanas: conviene hablar con la familia.' },
      notas: { mat: 52, len: 55, cnat: 63, csoc: 60, ing: 58, art: 70 } },
    { id: 'A04', nombre: 'Camila Justiniano', curso: '4A', promedio: 72, tendencia: 'sube', misiones: 10, estilo: 'Auditiva', avatar: '🐬',
      perfil: { estilo: 'Aprende escuchando y conversando', fortalezas: 'Expresión oral, inglés', apoyo: 'Escritura y ortografía', contexto: 'Usa la voz del tutor IA seguido', obs: 'Mejoró mucho con las misiones de voz.' },
      notas: { mat: 68, len: 66, cnat: 74, csoc: 72, ing: 86, art: 75 } },
    { id: 'A05', nombre: 'Sofía Rojas', curso: '5A', promedio: 81, tendencia: 'estable', misiones: 14, estilo: 'Visual', avatar: '🦋',
      perfil: { estilo: 'Mapas mentales y colores', fortalezas: 'Ciencias, dibujo', apoyo: 'Inglés oral', contexto: 'Hermana de Mateo (4A)', obs: 'Lidera bien los trabajos de grupo.' },
      notas: { mat: 79, len: 80, cnat: 90, csoc: 82, ing: 66, art: 89 } },
    { id: 'A06', nombre: 'Benjamín Céspedes', curso: '5A', promedio: 63, tendencia: 'baja', misiones: 7, estilo: 'Kinestésico', avatar: '🐻',
      perfil: { estilo: 'Necesita práctica concreta', fortalezas: 'Construcción, maquetas', apoyo: 'Matemática y constancia', contexto: 'Llega tarde seguido', obs: 'Las misiones cortas le funcionan mejor.' },
      notas: { mat: 55, len: 64, cnat: 68, csoc: 62, ing: 60, art: 80 } },
    { id: 'A07', nombre: 'Isabella Añez', curso: '5A', promedio: 74, tendencia: 'sube', misiones: 11, estilo: 'Lectora', avatar: '🐱',
      perfil: { estilo: 'Lectura y resúmenes', fortalezas: 'Lenguaje, sociales', apoyo: 'Geometría', contexto: 'Sin observaciones', obs: 'Constante y prolija.' },
      notas: { mat: 66, len: 84, cnat: 72, csoc: 80, ing: 74, art: 70 } },
    { id: 'A08', nombre: 'Lucas Montaño', curso: '5A', promedio: 54, tendencia: 'baja', misiones: 4, estilo: 'Auditivo', avatar: '🐸',
      perfil: { estilo: 'Explicaciones habladas', fortalezas: 'Memoria, música', apoyo: 'Lectura y escritura', contexto: 'Faltó 4 días este mes', obs: 'Alerta: 3 misiones vencidas y faltas.' },
      notas: { mat: 50, len: 48, cnat: 58, csoc: 56, ing: 55, art: 62 } }
  ],

  misiones: [
    { id: 'M1', materia: 'mat', titulo: 'El mercado de las fracciones', desc: 'Ayudá a la casera a repartir frutas en partes iguales.', curso: '4A', vence: 'mié 11', estado: 'activa', hechos: 2, total: 4, puntos: 30, minijuego: 'Pizza de fracciones' },
    { id: 'M2', materia: 'mat', titulo: 'Tablas en carrera', desc: 'Multiplicaciones rápidas para abrir la puerta del aula.', curso: '4A', vence: 'hecha', estado: 'hecha', hechos: 4, total: 4, puntos: 20, minijuego: 'Carrera de bloques' },
    { id: 'M3', materia: 'len', titulo: 'Describí tu barrio', desc: 'Escribí 5 oraciones que describan un lugar de tu barrio.', curso: '4A', vence: 'jue 12', estado: 'activa', hechos: 1, total: 4, puntos: 25, minijuego: 'Sopa de adjetivos' },
    { id: 'M4', materia: 'cnat', titulo: 'El viaje de la gota', desc: 'Seguí a la gota por el ciclo del agua.', curso: '5A', vence: 'vie 13', estado: 'activa', hechos: 0, total: 4, puntos: 30, minijuego: 'Ruta del agua' },
    { id: 'M5', materia: 'csoc', titulo: 'Los 9 departamentos', desc: 'Ubicá cada departamento en el mapa de bloques.', curso: '5A', vence: 'lun 16', estado: 'activa', hechos: 3, total: 9, puntos: 35, minijuego: 'Mapa armable' },
    { id: 'M6', materia: 'ing', titulo: 'My morning', desc: 'Ordená tu rutina de la mañana en inglés.', curso: '5A', vence: 'mar 17', estado: 'activa', hechos: 0, total: 3, puntos: 20, minijuego: 'Memoria de palabras' },
    { id: 'M7', materia: 'art', titulo: 'Collage de colores cálidos', desc: 'Armá un collage con colores cálidos y sacale foto.', curso: '4A', vence: 'vie 13', estado: 'activa', hechos: 0, total: 1, puntos: 15, minijuego: 'Pintar bloques' },
    { id: 'M8', materia: 'cnat', titulo: 'Plantas que beben', desc: 'Observá una planta 3 días y anotá qué pasa.', curso: '4A', vence: 'hecha', estado: 'hecha', hechos: 3, total: 3, puntos: 20, minijuego: 'Ruta del agua' }
  ],

  // Avance del alumno de demo (Mateo) por materia, para el mundo 3D
  alumnoDemo: { id: 'A01', apodo: 'Mateo', avatar: '🦊', nivel: 7, puntos: 340,
    avance: { mat: 72, len: 45, cnat: 80, csoc: 60, ing: 30, art: 88 } },

  // Familia de demo: dos hijos (uno en cada curso)
  familia: {
    nombre: 'Familia Rojas',
    hijos: ['A01', 'A05'],
    feed: {
      A01: [
        { hora: '10:42', txt: 'Completó el paso 2 de "El mercado de las fracciones"', tipo: 'ok' },
        { hora: '10:15', txt: 'Pidió una pista al tutor IA en Matemática', tipo: 'info' },
        { hora: '09:30', txt: 'Entró a clase de Lenguaje', tipo: 'info' },
        { hora: 'Ayer', txt: 'Desbloqueó el minijuego "Carrera de bloques"', tipo: 'ok' }
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
    ],
    pagos: [
      { concepto: 'Mensualidad noviembre', monto: 350, estado: 'pendiente', vence: '15 nov' },
      { concepto: 'Mensualidad octubre', monto: 350, estado: 'pagado', vence: '15 oct' },
      { concepto: 'Material Feria de Ciencias', monto: 40, estado: 'pendiente', vence: '16 nov' }
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
