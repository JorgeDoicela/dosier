# Catálogo Integral de Vistas, Páginas y Flujos de Usuario (Frontend Web)

## 1. Visión General del Enrutador y Estructura de Páginas

El cliente web de DOSIER (`dosier_web`) estructura sus vistas dentro del directorio `src/pages/`, organizadas en **14 módulos funcionales** que abarcan la gobernanza curricular, formulación pedagógica, co-redacción en tiempo real, revisión colegiada, administración institucional y verificación forense:

```text
dosier_web/src/pages/
├── Admin/           # Administración general (Usuarios, Auditoría, Plantillas, Emails)
├── Analytics/       # Indicadores y tablero CACES
├── Auth/            # Flujos secundarios de autenticación (Reset password, Magic link)
├── Calendario/      # Planificador de hitos lectivos y exportación iCalendar
├── Curriculum/      # Dominio Curricular ISTPET (Mis Asignaturas PEA, Supervisión, DocumentWorkspace, Monitoreo, Revisión)
├── Dashboard/       # Tableros diferenciados por rol (5 roles curriculares) y modales operativos
├── Landing/         # Página pública de presentación
├── Login/           # Autenticación multicanal (Credenciales, SSO, PIN, Magic Link)
├── Lopdp/           # Gestión de consentimientos y solicitudes de derechos ARCO
├── Notificaciones/  # Centro de notificaciones in-app
├── Public/          # Validador público de documentos vía código QR
├── RecycleBin/      # Papelera de reciclaje y recuperación de registros
├── Settings/        # Configuración de cuenta, seguridad y apariencia
└── Solicitudes/     # Centro de Solicitudes y trámites curriculares por rol
```

---

## 2. Detalle Exhaustivo por Módulo y Vista

### 2.1. Módulo Dashboard (`src/pages/Dashboard/`)
Punto de entrada principal para usuarios autenticados (`/dashboard`), adaptado dinámicamente según el rol institucional mediante el riel plano de navegación por rol `RoleFlowBanner` (estándar Modern Enterprise Docs con acento `#0070f3` y sin sliders verticales).

#### 2.1.1. Tableros Específicos por Rol (`src/pages/Dashboard/Roles/`)
* **`DocentePeaDashboard.tsx` (`DOSIER_DOCENTE`):**
  * **Panel de Actividades y Formulación Curricular (`DocenteActividadesPanel.tsx`):** Lista priorizada de cátedras asignadas para el período activo con avance in-situ desplegado abajo de cada una (`0% Sin Iniciar`, `25% Borrador`, `30% Observado`, `50% En Revisión`, `75% Aval de Carrera`, `90% Aval Académico`, `100% Aprobado Oficial`), con barra de progreso y acciones directas contextuales ("Elaborar PEA", "Continuar PEA", "Corregir PEA", "Ver PEA").
  * **Agenda y Calendario Curricular (`DocenteAgendaWidget.tsx`):** Columna lateral de próximos hitos normativos CACES, fechas de entrega institucional y acceso directo al módulo de Calendario.
  * **Desacople del Distributivo Exhaustivo:** La cuadrícula/tabla completa de exploración de asignaturas se canaliza exclusivamente a través de la *Vista Folio de Proyectos* (`MisAsignaturasPage.tsx` en `/documentacion/mis-proyectos`), eliminando redundancias en el dashboard.
* **`CoordCarreraDashboard.tsx` (`DOSIER_COORD_CARRERA`):**
  * Vista panorámica de todas las asignaturas pertenecientes a las carreras bajo su coordinación técnica.
  * Filtro disciplinar por nivel, paralelo y estado.
  * Detección de PEAs con observaciones pendientes o demoras de entrega.
  * Acciones: Apertura de revisión colegiada, registro de observaciones disciplinadas (`ObservacionesDisciplinarModal.tsx`) y emisión del Aval de Carrera (*RevisadoCoord*).
* **`CoordAcadDashboard.tsx` (`DOSIER_COORD_ACAD`):**
  * Panel de control metodológico y normativo de todas las carreras del ISTPET.
  * Detección de inconsistencias con el Artículo 21 del CES (160 horas por 4 créditos).
  * Acciones institucionales:
    * Apertura formal del período de formulación (`AperturaConvocatoriaModal.tsx`).
    * Emisión de recordatorios masivos a docentes rezagados (`RecordatorioDocentesModal.tsx`).
    * Concesión de prórrogas oficiales con registro de causa (`ProrrogaPlazoModal.tsx`).
    * Auditoría automática de parámetros CACES (`AuditoriaCacesModal.tsx`).
    * Emisión de Aval Académico Institucional (*RevisadoAcad*).
* **`VicerrectorDashboard.tsx` (`DOSIER_VICERRECTOR`):**
  * Despacho de máxima autoridad curricular.
  * Bandeja de instrumentos con doble aval favorable listos para legalización.
  * Acciones:
    * Firma electrónica y legalización masiva de PEAs por carrera (`LegalizacionFirmaModal.tsx`).
    * Sellado criptográfico unitario SHA-256 e inmutabilidad forense (*State Locking*).
    * Generación y descarga del Dossier Curricular Institucional foliado para auditoría CACES.
* **`AdminPeaDashboard.tsx` (`DOSIER_ADMIN`):**
  * Monitor del estado de salud del sistema, métricas globales de avance, configuración de mallas curriculares y sincronización con SIGAFI (Solo Lectura).
  * Integra el **Simulador del Circuito Curricular Oficial** (`PipelineCurricularStepper`), permitiendo explorar detalladamente las 5 fases del PEA (Apertura, Formulación, Aval de Carrera, Aval Académico y Legalización/Firma), con sus actores, herramientas operativas y la capacidad de conmutar en vivo al rol respectivo para validar el flujo completo.

#### 2.1.2. Modales Operativos Institucionales (`src/pages/Dashboard/Roles/Modals/`)
1. **`AperturaConvocatoriaModal.tsx`:** Fija fecha de inicio, fecha límite de entrega, período académico y notifica a los docentes vía correo y SignalR.
2. **`AuditoriaCacesModal.tsx`:** Ejecuta un barrido heurístico sobre los PEAs evaluando cuadre de 160h, inclusión de bibliografía en norma APA 7ma y articulación con el perfil de egreso.
3. **`ClonarPeaModal.tsx`:** Permite al docente copiar la estructura de unidades, temas y bibliografía de un PEA aprobado en un período anterior hacia su nuevo distributivo.
4. **`LegalizacionFirmaModal.tsx`:** Permite al Vicerrector legalizar en bloque múltiples asignaturas seleccionadas, aplicando firma digital P12 o HMAC.
5. **`ObservacionesDisciplinarModal.tsx`:** Formulario para registrar observaciones atómicas por sección con plazo estricto de subsanación de 48 horas.
6. **`ProrrogaPlazoModal.tsx`:** Otorga días adicionales de gracia a una carrera o docente particular con registro del motivo en la bitácora de auditoría.
7. **`RecordatorioDocentesModal.tsx`:** Envía alertas automatizadas a docentes cuyos PEAs sigan en estado `Borrador` a pocos días del cierre lectivo.

---

### 2.2. Módulo de Dominio Curricular y Gestión de Documentos Docentes (`src/pages/Curriculum/`)

* **`SupervisionCurricularPage.tsx` (`/documentacion`):**
  * Vista matriz de supervisión curricular que despliega directamente el componente `<PeaSupervisionTray>`, permitiendo a coordinadores de carrera, coordinadores académicos y vicerrectorado supervisar en tiempo real el avance institucional de los PEAs, filtrar por período y carrera, y acceder al espacio de trabajo documental con las firmas y validaciones normativas vigentes.
* **`SalaCarreraPage.tsx` (`/documentacion/carrera/:idCarrera/sala-curricular` y `/salas-curriculares/:idCarrera`):**
  * Entorno de armonización curricular colegiada y co-diseño para el claustro docente y la Coordinación de Carrera.
  * **Estructura y Componentes:**
    * *Columna Izquierda (`CareerProfileSidebar`):* Inspección del Perfil de Egreso CES de la carrera, resultados de aprendizaje del egresado (RDA) y matriz de tributación al perfil.
    * *Espacio Central Amplio:* Matriz y catálogo de asignaturas de la malla organizadas por nivel/semestre con badges normativos de estado. Cada tarjeta ofrece acceso directo mediante el botón "Abrir en Pantalla Completa" que transiciona fluidamente al editor maestro (`DocumentWorkspace` con `DOSIERBuilderShell`), garantizando espacio holgado, las 11 secciones oficiales del PEA, motor colaborativo y retorno limpio a la sala curricular.
    * *Columna Derecha (`LivePresenceSidebar`):* Panel de moderación y presencia en vivo con control de apertura/pausa de sesión (`Conmutar Sala`), lista de docentes en línea vía Awareness CRDT e hilo de debate colaborativo.
* **`MisAsignaturasPage.tsx` (`/documentacion/mis-proyectos`):**
  * Bandeja personalizada para el docente con sus asignaturas oficiales sincronizadas desde SIGAFI y el estado de formulación de cada PEA.
  * **Navegación sobre Riel Plano Continuo:** Permite alternar limpiamente entre **Mis Asignaturas** y **PEAs de Otros Docentes** mediante pestañas directas sobre la línea base con contadores de asignaturas en tiempo real.
  * **Modo de Consulta y Colaboración Colegiada:** Opción para explorar y co-elaborar propuestas pedagógicas en asignaturas formuladas por otros docentes que pertenecen a la(s) misma(s) carrera(s) donde el profesor imparte docencia en el período. Conforme al marco de gobernanza institucional, la firma digital y el envío a revisión quedan blindados exclusivamente para el docente titular asignado (con validación 403 en backend y supresión de acciones de firma en frontend).
  * **Algoritmo Invisible de Apertura Reciente:** Ordenamiento adaptativo que posiciona de forma automática en primer lugar la materia abierta o consultada más recientemente, independientemente de su estado curricular.
  * **Filtros Dinámicos de Alta Densidad:** Selector oficial de período académico, buscador en vivo (asignatura, código, carrera, docente titular), selector de carreras, modalidades y estados normativos con badges de puntos discretos.
  * Integra en la Sección 1 del PEA (`PeaGeneralSection.tsx`) la distribución horaria asistida con botón de un clic para cuadre normativo CACES (1/3 docencia, 1/3 prácticas y 1/3 autónomo), permitiendo desbloqueo seguro de edición cuando la base institucional carece de horas desglosadas.
* **`RevisionCurricularPage.tsx` (`/documentacion/revision-tecnica/:projectUuid`):**
  * Entorno de revisión colegiada y disciplinar para coordinadores y comisiones. Permite contrastar el contenido contra el checklist de normativas.
* **`MonitoreoCurricularPage.tsx` (`/documentacion/monitoreo/:projectUuid`):**
  * Monitor de avance, trazabilidad y estado de ejecución del documento docente.
* **`DocumentWorkspace.tsx` (`/documentacion/workspace/:templateCode/:projectUuid`):**
  * Entorno de trabajo y orquestador del editor. Monta el `<DOSIERBuilderShell>` con:
    * **`PeaWorkflowBar.tsx`:** Barra superior con semáforo de cuadre horario y botón de firma/transición según el rol autenticado.
    * **`PeaObservationsDrawer.tsx`:** Panel deslizable lateral para consultar y subsanar observaciones por sección.
    * **Pestañas Secciones A - K:** Componentes modulares con `<CoWorkField>` para edición concurrente en vivo vía Yjs/SignalR.
    * **`NormativaDrawer.tsx`:** Asistente lateral de consulta de normativas CES y CACES vigentes.

---

### 2.3. Módulo de Administración (`src/pages/Admin/`)

* **Gestión de Usuarios (`/usuarios`):**
  * Navegación por pestañas sincronizada con la URL mediante el parámetro `type`: `/usuarios?type=DOCENTE`, `/usuarios?type=ADMINISTRATIVO` y `/usuarios?type=CARRERAS`.
  * Catálogo de usuarios institucionales sincronizados desde SIGAFI (Docentes y Administrativos) con paginación, filtros multicriterio y asignación de roles curriculares RBAC (`idSistema = 6`).
  * **Estructura por Carreras y Gobernanza (`OrganigramaVerticalView.tsx`):**
    * *Cúspide Institucional:* Enlace jerárquico de supervisión entre Vicerrectorado Académico (cierre PEA) y Coordinación Académica Institucional (cuadre distributivo).
    * *Árbol de Carreras (Columna Izquierda):* Riel vertical con líneas conectoras de rama, buscador rápido, conteo de docentes y filtro de estado (Todas, Con coordinador titular, Vacantes).
    * *Detalle y Claustro (Columna Derecha):* Ficha del Coordinador titular de la carrera activa y tabla compacta del claustro docente asignado con horas de carga horaria (`h/sem`), materias en malla, cédula y rol institucional.
  * Bloqueo y reseteo de credenciales de acceso.
* **Diseñador de Plantillas / Canvas Builder (`/plantillas`):**
  * Maquetador visual e interactivo de bloques curriculares (`BlockCanvas.tsx`, `availableBlocks.ts`).
  * Soporte nativo para la totalidad de bloques del PEA oficial (Secciones a hasta k) con vistas previas idénticas al formato institucional físico del ISTPET.
  * Inspector lateral reactivo de propiedades (`BlockProperties.tsx`) con 9 formularios específicos para editar parámetros de configuración (horas, unidades temáticas, matrices de evaluación, rúbricas y firmas).
  * Renderizadores de Lienzo A4 con subcabeceras celestes institucionales (`#bdd7ee`), líneas continuas de escritura y fondos 100% sólidos.
  * Compilación y exportación de plantillas HTML/PDF mediante generadores modulares (`peaGenerators.ts`, `HtmlGenerator.ts`) con sincronización bidireccional hacia la persistencia del backend (`PEA_OFICIAL.html`).
* **Bitácora de Auditoría Forense (`/auditoria`):**
  * Consulta de registros de `doc_audit_logs` con filtros por fecha UTC, usuario, dirección IP y acción.
* **Motor de Correo Transaccional (`/emails`):**
  * Editor de plantillas HTML institucionales y visor de cola de envíos SMTP.

---

### 2.4. Módulo de Analíticas Curriculares y Auditoría CACES (`src/pages/Analytics/`)

Consola directiva unificada en tiempo real para el seguimiento de la planificación microcurricular (PEA), gobernanza institucional y acreditación del CACES:

* **`AnalyticsOverviewTab.tsx`:** Consola directiva ejecutiva dividida en 4 módulos operativos:
  * **Indicadores Ejecutivos Globales:** Total de asignaturas del corte, porcentaje de legalización oficial, PEAs en circuito activo de avales y volumen de horas prácticas (APE).
  * **Semáforo y Ranking de Cumplimiento por Carrera:** Tabla comparativa por Tecnología con cálculo dinámico de avance, detección de rezago crítico (< 40%), en proceso (40-79%) y óptimo (>= 80%), horas totales y filtrado contextual directo.
  * **Diagnóstico de Cuello de Botella Operativo:** Embudo fáctico de 6 etapas del circuito de avales (Formulación Inicial, Subsanación de Observaciones, Revisión de Carrera, Verificación Académica, Aprobación de Vicerrectorado y PEAs Legalizados) con plazos normativos y responsables institucionales.
  * **Auditoría de Componentes Pedagógicos CACES (RRA Art. 21 / 27):** Desglose y balance de carga horaria en Contacto Docente (CD), Práctico-Experimental (APE) en talleres y laboratorios, y Aprendizaje Autónomo (AA), junto con detección de anomalías (asignaturas sin horas).
  * **Nómina y Estado Curricular:** Tabla fáctica con buscador reactivo, metadatos de cátedra, nivel, modalidad y seguimiento de 4 firmas digitales (Ley 67 DFRM).
* **`useAnalyticsData.ts`:** Hook que consolida y procesa los datos agregados desde la API `/pea/bandeja` y catálogos institucionales, integrando sincronización por eventos en tiempo real.
* **`analyticsService.ts`:** Fachada de comunicación tipada para consumo de bandejas curriculares y generación de reportes ejecutivos PDF.

---

### 2.5. Módulos de Autenticación, Seguridad y LOPDP

* **`src/pages/Login/`:**
  * Acceso por credenciales locales (Usuario/Cédula y contraseña BCrypt).
  * Acceso rápido por código PIN.
  * Inicio de sesión único (SSO) con Microsoft 365 institucional (`@traversari.edu.ec`).
  * Solicitud de enlaces de acceso seguro (Magic Links).
* **`src/pages/Auth/`:**
  * Recuperación y restablecimiento de contraseña olvidada.
  * Verificación de correo electrónico.
* **`src/pages/Lopdp/`:**
  * Formulario de consentimiento informado obligatorio previo al primer ingreso.
  * Portal de ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación, Oposición).
* **`src/pages/Public/` (`/verificacion/:code`):**
  * Validador forense público sin requerimiento de inicio de sesión.
  * Verificación de la firma digital, estampados DFRM y cálculo de hash SHA-256 sobre el documento emitido.

---

### 2.6. Módulos Complementarios

* **`src/pages/Calendario/` (`/calendario`):** Sistema integral de planificación y seguimiento curricular con triple modalidad de visualización:
  * **Vista Calendario Mensual / Semanal / Diario:** Rejilla interactiva (`react-big-calendar`) con arrastre de fechas, visualización de hitos CACES, plazos de elaboración del PEA y eventos normativos institucionales.
  * **Vista Kanban Curricular:** Tablero de flujo de trabajo segmentado en columnas (`Pendiente`, `En Progreso`, `Completado`) con reubicación fluida por *drag and drop* y transición instantánea de estados.
  * **Vista Notas Adhesivas (Inbox):** Bandeja ágil de captura de notas rápidas y tareas pendientes con filtro por módulos (`Curricular / PEA`, `Coordinación`, `Vicerrectoría`, `Agenda`), código de colores HSL y planificador con anclaje temporal directo a la agenda.
  * **Gobernanza RBAC por Rol:**
    * *Docentes (`DOSIER_DOCENTE`):* Visualización exclusiva de asignaturas y PEAs a su cargo, fechas de entrega y directivas CACES visibles para docentes.
    * *Coordinadores de Carrera (`DOSIER_COORD_CARRERA`):* Vista agregada de todas las asignaturas de su carrera, plazos de revisión y PEAs asignados a sus docentes.
    * *Coordinación Académica y Vicerrectoría (`DOSIER_COORD_ACAD`, `DOSIER_VICERRECTOR`):* Visión institucional global de todas las carreras, hitos lectivos y avance macro del distributivo.
    * *Administradores y Autoridades:* Capacidad de publicar directivas institucionales con segmentación por roles destino (`roles_visibles`) y privacidad controlada.
  * **Sincronización Externa iCalendar:** Generación y revocación de tokens privados iCal (`/api/calendario/feed?token=...`) para suscripción en Outlook, Apple Calendar y Google Calendar.
* **`src/pages/Notificaciones/`:** Bandeja centralizada de alertas transaccionales recibidas por WebSocket SignalR.
* **`src/pages/RecycleBin/`:** Papelera de reciclaje lógica para recuperación controlada de registros curriculares dados de baja.
* **`src/pages/Settings/`:** Gestión del perfil docente, actualización de correo, cambio de clave y selector de tema visual (Claro / Oscuro).

---

### 2.7. Módulo de Incidencias y Soporte Técnico

* **Modal Global de Captura (`FeedbackModal.tsx`):**
  * Disparador global accesible desde el encabezado superior (desktop y móvil) y mediante el evento `dosier-open-feedback`.
  * Captura de capturas de pantalla desde el portapapeles (`Ctrl+V`), arrastre (*drag and drop*) o selector de archivos.
  * Validación estricta de adjuntos (imágenes hasta 5MB, videos explicativos hasta 15MB).
  * Recolección automática de metadatos de entorno (navegador, versión, resolución, sistema operativo y ruta activa).
  * Enlace directo a WhatsApp institucional preformateado con los detalles del reporte.
* **Buzón del Docente / Usuario (`UserFeedbackPage.tsx` - `/incidencias`):**
  * Historial de incidencias reportadas por el usuario autenticado con filtros por estado (`Pendiente`, `En Revisión`, `Resuelto`, `Descartado`) y tipo (`Error / Fallo`, `Sugerencia`, `Consulta`, `Otro`).
  * Indicador de respuestas y mensajes no leídos sincronizado con el centro de notificaciones.
  * Hilo de conversación interactivo bidireccional con el equipo técnico y de administración.
  * Edición y eliminación de reportes en estado inicial de espera.
* **Bandeja Maestra de Administración (`AdminFeedbackPage.tsx` - `/admin/incidencias`):**
  * Vista centralizada para administradores (`DOSIER_ADMIN`) con tabla interactiva, filtros combinados y buscador de texto completo.
  * Panel de diagnóstico técnico con visualización de metadatos de máquina, agente de usuario y visor multimedia con navegación por teclado y deslizamiento.
  * Gestión de ciclo de vida del reporte (transición de estados) y respuesta técnica directa desde el hilo de soporte.

---

### 2.8. Módulo Centro de Solicitudes (`src/pages/Solicitudes/` - `/solicitudes`)

Portal unificado y canal institucional para la tramitación de requerimientos, soporte técnico e incidencias:

* **Arquitectura de Maquetación (Modern Enterprise Docs):**
  * **Encabezado Institucional (`SolicitudesHeader.tsx`):** Título directo con descripción operativa y accesos directos al portafolio y al buzón de incidencias.
  * **Tarjetas Bento de Trámites (`SolicitudBentoCard.tsx`):** Superficies 100% sólidas sin transparencias, iconografía vectorial desnuda de Lucide, especificación técnica clave-valor (`<dl>`) con SLA de resolución e instancia responsable (cero KPIs gigantes), y botón de ejecución directa.
* **Canales Operativos:**
  * **Buzón de Incidencias Curriculares:** Acceso directo a `/incidencias` para tramitar novedades en el distributivo SIGAFI, errores de acreditación CACES o fallas en firmas digitales mediante tickets formales (`INC-XXXX`). El seguimiento completo, el chat bidireccional y las evidencias se gestionan en su vista dedicada.

---

### 2.9. Módulo de Salas Curriculares Colegiadas por Carrera (`/salas-curriculares` y `/salas-curriculares/:idCarrera`)

Módulo de trabajo cooperativo y armonización curricular colegiada por carrera antes de la formulación individual del PEA institucional:

* **Acceso Directo a Pantalla Completa (`SalaCarreraPage.tsx` - `/salas-curriculares`):**
  * Sin pantallas intermedias: al ingresar a "Salas Curriculares" se carga inmediatamente el espacio de trabajo colegiado a pantalla completa sobre **`DOSIERBuilderShell`**.
  * Selector superior integrado para alternar de asignatura de la malla en tiempo real y selector de carrera/período.
* **Estructura Operativa de Co-Diseño (`AsignaturaCoDesignWorkspace.tsx`):**
  * **Navegación Izquierda (`BuilderNavigationSidebar`):** Se pliega con `<` y se expande mediante la pestaña flotante inteligente (`BuilderFloatingTab`) con las 6 secciones de armonización (Propuesta y Malla, Objetivo, Unidades, RDAs, Metodología y Perfil CES).
  * **Lienzo Central de Co-Creación:** Espacio amplio de redacción colegiada sin scrolls comprimidos.
  * **Colaboración Derecha (`CollaborationSidebar`):** Se oculta con `>` y permite debatir en vivo mediante el motor CRDT y sockets de CoWork.
  * **Gobernanza:** Botón de acción principal para **Aplicar al PEA Oficial** con un solo clic.


