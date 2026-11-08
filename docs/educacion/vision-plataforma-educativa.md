# Proyecto: Plataforma Educativa con Tutor de IA para Bolivia
## Documento de Contexto y Requisitos Técnicos para Desarrollo (Cloud Code)

---

### 1. Resumen Ejecutivo y Visión

El presente proyecto consiste en el desarrollo e implementación de un ecosistema educativo digital adaptado a la realidad de los municipios en Bolivia. El núcleo de la propuesta combina:

* **Dispositivos tipo tableta** con textos y materiales pedagógicos oficiales pre-cargados (capacidad *offline-first* para sortear limitaciones de conectividad en zonas periurbanas y rurales).
* **Tutor inteligente interactivo impulsado por IA**, enfocado en guiar el aprendizaje activo, resolver dudas sobre los textos cargados y adaptarse al ritmo del estudiante sin generar respuestas fuera de currículo.
* **Plataforma de gestión y seguimiento** para docentes y administradores educativos municipales.

El objetivo estratégico a mediano y largo plazo es lograr un despliegue escalable a nivel municipal y estatal mediante alianzas público-privadas, modelos comerciales paquetizados y programas de impacto social/filantrópico con entidades tecnológicas globales (como Google for Education, Google.org o fundaciones internacionales).

---

### 2. Estrategia de Despliegue por Fases (Ruta Crítica)

Para evitar la dispersión de esfuerzos y optimizar los recursos técnicos y económicos, el proyecto se estructura en 5 fases secuenciales estrictas:

| Fase | Denominación | Alcance y Entorno | Objetivos Principales | Criterios de Éxito / Salida |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1** | **Prueba Alfa / Familiar** | Entorno controlado (hijos propios / círculo cerrado) | - Validar la usabilidad de la interfaz en tablet.<br>- Ajustar la interacción conversacional del tutor IA.<br>- Calibrar la lectura de textos locales y latencia. | Experiencia de usuario fluida, navegación intuitiva para niños y respuestas pedagógicamente coherentes del tutor. |
| **Fase 2** | **Piloto Aula / Docente** | 1 profesor y 1 curso escolar | - Evaluar la integración didáctica en el aula.<br>- Medir el valor percibido por el docente.<br>- Identificar fricciones pedagógicas y técnicas reales. | Docente valida la herramienta como apoyo efectivo; los alumnos interactúan sin bloqueos técnicos frecuentes. |
| **Fase 3** | **Piloto Institucional** | 1 unidad educativa completa | - Probar concurrencia y sincronización en red local/híbrida.<br>- Recopilar métricas de aprendizaje, retención y asistencia.<br>- Construir un caso de estudio documentado con datos cuantitativos. | Caso de éxito formalizado (Whitepaper/Dossier de impacto) con métricas de mejora académica y ratio de adopción. |
| **Fase 4** | **Presentación Municipal** | Gobiernos Autónomos Municipales | - Presentar el caso de éxito documentado.<br>- Exponer opciones de modelo: Paquete integral privado (hardware + software + bolsa API) vs. Alianza institucional con financiamiento externo. | Aprobación de proyecto piloto municipal o licitación de programa de transformación digital educativa. |
| **Fase 5** | **Alianzas Estratégicas** | Google for Education, Google.org, Fundaciones | - Presentar volumen validado para subsidios de hardware.<br>- Postular a fondos de impacto social y programas filantrópicos globales.<br>- Optimizar esquemas de financiamiento multilateral. | Acceso a precios de volumen institucional de hardware, subvenciones operativas de API o patrocinios de impacto social. |

---

### 3. Modelos de Sostenibilidad y Negocio

1. **Modelo Paquete Cerrado Privado (B2G / B2B):**
   * Venta llave en mano al municipio o institución educativa.
   * Componentes: Hardware (tabletas configuradas) + Licencia anual de software + Paquetes/bolsas prepagadas de consumo de tokens/API para el tutor IA.
   * Mantenimiento, actualizaciones y soporte técnico centralizado.

2. **Modelo de Impacto Social y Cooperación Internacional:**
   * Apalancamiento en programas de responsabilidad social empresarial (RSE) y filantropía corporativa (ej. Google.org, fondos de fundaciones privadas internacionales).
   * Aprovechamiento de beneficios fiscales de donación internacional de tecnología en países en desarrollo.
   * Alianzas con organismos multilaterales de desarrollo enfocados en educación y reducción de la brecha digital.

---

### 4. Arquitectura del Sistema y Requisitos Técnicos

#### 4.1 Principio Rector: *Offline-First* con Sincronización Oportunista
Dadas las disparidades de infraestructura de telecomunicaciones en municipios bolivianos, el sistema no debe depender de conexión continua a Internet.

* **Almacenamiento Local en Dispositivo:**
  * Motor de base de datos embebido y reactivo (SQLite / WatermelonDB / IndexedDB según stack final).
  * Libros de texto y guías curriculares pre-empaquetados en formatos optimizados (EPUB/PDF comprimido o JSON estructurado por temas y lecciones).
  * Historial de interacciones y progresos del estudiante en búfer local encriptado.
* **Sincronización:**
  * Cola de eventos local (*sync queue*) que sube métricas y progresos a la nube cuando el dispositivo detecta conexión Wi-Fi (en la escuela o punto municipal).

#### 4.2 Motor de Tutor de IA y Gestión de Inferencia
* **Arquitectura RAG (Retrieval-Augmented Generation) Restringida:**
  * El tutor de IA responde fundamentándose exclusivamente en el corpus de textos y módulos pre-cargados para el grado académico correspondiente.
  * *Guardrails* estrictos para prevenir alucinaciones o desvíos hacia temas ajenos al currículo escolar.
* **Esquema Híbrido de Inferencia:**
  * Consultas frecuentes y directas: Resolución mediante caché semántica local o lógica estructurada.
  * Consultas generativas complejas: Llamada a API de modelos de lenguaje en la nube (con control estricto de cuotas y token budget por estudiante).
* **Control de Costos de API:**
  * Sistema de limitación de tasa (*rate limiting*) y asignación diaria/semanal de créditos de interacción para evitar sobrecostos descontrolados.

#### 4.3 Privacidad, Seguridad y Protección de Datos de Menores
La protección de datos de niños, niñas y adolescentes es un requisito ineludible de diseño desde la base (*Privacy by Design*):

* **Encriptación de Extremo a Extremo y en Reposo:**
  * Base de datos local cifrada en el dispositivo (AES-256).
  * Comunicaciones cifradas obligatoriamente bajo HTTPS / TLS 1.3.
* **Anonimización / Seudonimización:**
  * No se envían nombres reales, ubicaciones geográficas exactas ni identificadores personales del menor en los prompts hacia los modelos de IA.
  * Uso de identificadores opacos únicos (*Student ID Hash*) para la agregación de progreso y analíticas docentes.
* **Filtros de Moderación y Contenido Seguro:**
  * Capa intermedia de moderación de entrada y salida para detectar y bloquear lenguaje inapropiado, acoso o contenidos no aptos para la edad escolar.

---

### 5. Guía de Implementación para Cloud Code

Para orientar el desarrollo asistido en Cloud Code, el repositorio debe organizarse en los siguientes módulos desacoplados:

```text
/
├── apps/
│   ├── tablet-client/          # Aplicación cliente para tabletas (UI/UX, lector, chat tutor)
│   └── admin-dashboard/        # Portal web para profesores y supervisores municipales
├── services/
│   ├── ai-gateway/             # Orquestador RAG, moderación, prompt engineering y control de cuotas
│   └── sync-api/               # Ingestion de telemetría y sincronización de estado de estudiantes
├── packages/
│   ├── core-types/             # Definiciones TypeScript de entidades y contratos de API
│   ├── pedagogical-corpus/     # Esquemas de datos para textos escolares y metadatos curriculares
│   └── crypto-utils/           # Módulos de cifrado y anonimización de identificadores
└── docs/
    └── architecture/           # Diagramas y especificaciones de protocolos de sincronización
```

#### Variables de Entorno Clave (`.env.example`)
* `AI_PROVIDER_API_KEY`: Credencial del proveedor de LLM.
* `AI_MODEL_TIER`: Modelo asignado (balance entre latencia, precisión y costo por token).
* `MAX_TOKENS_PER_STUDENT_DAY`: Límite máximo de consumo diario por usuario.
* `LOCAL_ENCRYPTION_KEY_SALT`: Salt maestro para derivación de claves de almacenamiento local.
* `ENABLE_OFFLINE_CACHE`: Bandera para activar caché semántica local.

---

### 6. Backlog Técnico Inmediato (Fase 1 - Sprint Actual)

1. **Sprint 1.1 - Interfaz de Lectura y Navegación:**
   - [ ] Conectar la interfaz ya diseñada con la carga de documentos de texto locales.
   - [ ] Implementar vista de lectura adaptada a tablets con navegación fluida por capítulos.
2. **Sprint 1.2 - Integración Básica del Tutor IA:**
   - [ ] Configurar el componente de chat del tutor contextualizado al capítulo en pantalla.
   - [ ] Crear el pipeline de prompt base con restricciones pedagógicas para niños.
3. **Sprint 1.3 - Cifrado y Configuración Local:**
   - [ ] Configurar el almacenamiento local cifrado para almacenar el estado de lectura y sesiones.
   - [ ] Establecer el mecanismo de configuración de entorno para despliegue en emulador y tableta física.
