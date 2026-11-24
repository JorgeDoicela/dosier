# Catálogo Integral de Vistas, Páginas y Flujos de Usuario (Frontend Web)

## 1. Visión General del Enrutador y Estructura de Páginas

El cliente web de DOSIER (`dosier_web`) estructura sus vistas dentro del directorio `src/pages/`, organizadas en **14 módulos funcionales** que abarcan la gobernanza curricular, formulación pedagógica, co-redacción concurrente, revisión colegiada, administración institucional y verificación forense:

```text
dosier_web/src/pages/
├── Admin/           # Administración general: UsersPage, AuditPage, DocumentMaintenancePage,
│                    # DocumentTemplatesPage, EmailEnginePage, AdminFeedbackPage
├── Analytics/       # Indicadores y tablero de acreditación CACES
├── Auth/            # Flujos secundarios de autenticación (ResetAlertPage)
├── Calendario/      # Planificador de hitos lectivos, Kanban y notas adhesivas
├── Curriculum/      # Dominio Curricular ISTPET (Mis Asignaturas, Supervisión, DocumentWorkspace,
│                    # Monitoreo, Revisión y Salas Curriculares de Carrera)
├── Dashboard/       # Tableros diferenciados por rol (5 roles curriculares) y modales operativos
├── Feedback/        # Buzón del docente e incidencias técnicas (UserFeedbackPage)
├── Landing/         # Página pública de presentación institucional
├── Login/           # Autenticación (Credenciales locales, SSO Microsoft 365, Recuperación)
├── Lopdp/           # Gestión de consentimientos informados y solicitudes de derechos ARCO
├── Notificaciones/  # Centro unificado de notificaciones in-app vía SignalR
├── Public/          # Validador forense público de documentos vía código QR
├── RecycleBin/      # Papelera de reciclaje y recuperación de registros en borrado lógico
├── Settings/        # Configuración de cuenta, firmas digitales y parámetros normativos
└── Solicitudes/     # Centro de Solicitudes y trámites curriculares directos
```

---

## 2. Detalle Exhaustivo por Módulo y Vista

### 2.1. Módulo Dashboard (`src/pages/Dashboard/`)
Punto de entrada principal para usuarios autenticados (`/dashboard`), adaptado dinámicamente según el rol institucional mediante el riel plano de navegación `RoleFlowBanner` (estándar Modern Enterprise Docs con acento `#0070f3`, eliminando segmented controls y sliders verticales).

#### 2.1.1. Tableros Específicos por Rol (`src/pages/Dashboard/Roles/`)
* **`DocentePeaDashboard.tsx` (`DOSIER_DOCENTE`):**
  * **Panel de Actividades y Formulación Curricular (`DocenteActividadesPanel.tsx`):** Lista priorizada de cátedras asignadas para el período activo con avance in-situ desplegado abajo de cada una (`0% Sin Iniciar`, `25% Borrador`, `30% Observado`, `50% En Revisión`, `75% Aval de Carrera`, `90% Aval Académico`, `100% Aprobado Oficial`), con barra de progreso y acciones directas contextuales (*Elaborar PEA*, *Continuar PEA*, *Corregir PEA*, *Ver PEA*).
  * **Agenda y Calendario Curricular (`DocenteAgendaWidget.tsx`):** Columna lateral de próximos hitos normativos CACES, fechas de entrega institucional y acceso directo al módulo de Calendario.
  * **Desacople del Distributivo Exhaustivo:** La cuadrícula completa de asignaturas se canaliza exclusivamente a través de la vista de asignaturas (`MisAsignaturasPage.tsx` en `/documentacion/mis-proyectos`), eliminando redundancias en el dashboard.
* **`CoordCarreraDashboard.tsx` (`DOSIER_COORD_CARRERA`):**
  * **Estructura en Dos Columnas Minimalista:** Idéntica a la vista docente para consistencia visual (columna ancha para asignaturas y columna lateral para agenda y alertas).
  * **Columna de Asignaturas y Estado Curricular:** Folio continuo sin anidamiento excesivo con subpestañas directas (*Todas*, *Pendientes de Aval*, *Mis Asignaturas*), buscador reactivo, barra de avance por materia y botón de acción contextual (*Revisar*, *Ver observaciones*, *Ver avance*, *Ver PEA*).
  * **Columna Lateral de Rezagados y Agenda:** Bloque compacto de docentes con retraso en entregas con acción directa para despachar recordatorios y widget de hitos institucionales.
  * **Acciones:** Revisión técnica de PEAs en el editor, registro de observaciones disciplinares (`ObservacionesDisciplinarModal.tsx`) y emisión del Aval de Carrera (*RevisadoCoord*).
* **`CoordAcadDashboard.tsx` (`DOSIER_COORD_ACAD`):**
  * Panel de control metodológico y normativo de todas las carreras del ISTPET.
  * Detección de inconsistencias con el Artículo 21 del Reglamento de Régimen Académico del CES (160 horas por cada 4 créditos).
  * Acciones institucionales:
    * Apertura formal del período de formulación (`AperturaConvocatoriaModal.tsx`).
    * Emisión de recordatorios masivos a docentes rezagados (`RecordatorioDocentesModal.tsx`).
    * Concesión de prórrogas oficiales con registro de causa (`ProrrogaPlazoModal.tsx`).
    * Auditoría automática de parámetros CACES (`AuditoriaCacesModal.tsx`).
    * Emisión de Aval Académico Institucional (*RevisadoAcad*).
* **`VicerrectorDashboard.tsx` (`DOSIER_VICERRECTOR`):**
  * Despacho de máxima autoridad curricular.
  * Bandeja de instrumentos con doble aval favorable listos para legalización institucional.
  * Acciones:
    * Firma electrónica y legalización masiva de PEAs por carrera (`LegalizacionFirmaModal.tsx`).
    * Sellado criptográfico unitario con hash SHA-256 e inmutabilidad definitiva (*State Locking*).
    * Descarga del Dossier Curricular Institucional foliado para procesos de acreditación CACES.
* **`AdminPeaDashboard.tsx` (`DOSIER_ADMIN`):**
  * Monitor del estado de salud del sistema, métricas globales de avance curricular y sincronización con SIGAFI (Solo Lectura).
  * Integra el simulador de etapas del PEA, permitiendo validar las 5 fases institucionales (Apertura, Formulación, Aval de Carrera, Aval Académico y Legalización) y conmutar en vivo al rol respectivo para auditar el flujo completo.

#### 2.1.2. Modales Operativos Institucionales (`src/pages/Dashboard/Roles/Modals/`)
Todos los modales implementan de forma estricta la **regla de fondos 100% sólidos y opacos**:
1. **`AperturaConvocatoriaModal.tsx`:** Fija fecha de inicio, fecha límite de entrega y período académico activo, notificando a los docentes vía correo y SignalR.
2. **`AuditoriaCacesModal.tsx`:** Ejecuta un barrido heurístico sobre los PEAs evaluando cuadre de horas, bibliografía APA 7.ª edición y articulación con el perfil de egreso.
3. **`ClonarPeaModal.tsx`:** Permite al docente copiar la estructura de unidades, temas y bibliografía de un PEA aprobado en un período anterior hacia su nuevo distributivo.
4. **`LegalizacionFirmaModal.tsx`:** Permite al Vicerrectorado legalizar en bloque múltiples asignaturas seleccionadas, aplicando firma digital P12 o institucional.
5. **`ObservacionesDisciplinarModal.tsx`:** Formulario para registrar observaciones atómicas por sección con plazo estricto de subsanación de 48 horas.
6. **`ProrrogaPlazoModal.tsx`:** Otorga días adicionales de gracia a una carrera o docente particular con registro justificado en la bitácora de auditoría.
7. **`RecordatorioDocentesModal.tsx`:** Envía alertas automatizadas a docentes cuyos PEAs sigan en estado `Borrador` a pocos días del cierre lectivo.

---

### 2.2. Módulo de Dominio Curricular (`src/pages/Curriculum/`)

* **`SupervisionCurricularPage.tsx` (`/documentacion`):**
  * Vista matriz de supervisión y revisión curricular para directivos (`DOSIER_ADMIN`, `DOSIER_COORD_CARRERA`, `DOSIER_COORD_ACAD`, `DOSIER_VICERRECTOR`).
  * **Regla de Visibilidad Curricular:** Muestra exclusivamente aquellos PEAs que los docentes han enviado formalmente a revisión (`EnRevision`, `Observado`, `Corregido`, `RevisadoCoord`, `RevisadoAcad`, `Aprobado`). Los borradores no iniciados o no enviados permanecen en el espacio personal del docente (*Mis Instrumentos PEA*).
  * **Semántica Visual del Dictamen:** Durante la auditoría, la adición de observaciones técnicas mantiene el estado en `EnRevision`. Para las autoridades en la bandeja se visualiza como "En Revisión Técnica", reservando la etiqueta "Con Observaciones" para cuando se emite el dictamen formal de devolución.
* **`MisAsignaturasPage.tsx` (`/documentacion/mis-proyectos`):**
  * Bandeja personalizada para el docente con sus asignaturas oficiales sincronizadas desde SIGAFI.
  * **Navegación sobre Riel Plano:** Alterna limpiamente entre *Mis Asignaturas* y *PEAs de Otros Docentes* con contadores en tiempo real.
  * **Modo de Consulta y Colaboración:** Permite explorar y solicitar co-elaboración en asignaturas de la misma carrera mediante modales opacos (`SolicitarColaboracionModal.tsx`, `CancelarColaboracionModal.tsx`, `ConfirmarRespuestaColaboracionModal.tsx`). La firma digital y el envío a revisión quedan blindados exclusivamente para el docente titular.
  * **Distribución Horaria Asistida CACES:** Botón de balance asistido para cuadre normativo de horas (1/3 docencia, 1/3 prácticas APE y 1/3 trabajo autónomo).
* **`SalaCarreraPage.tsx` (`/salas-curriculares` y `/salas-curriculares/:idCarrera`):**
  * Entorno de armonización curricular colegiada y co-diseño en tiempo real para docentes y coordinadores de carrera.
  * **Componentes Especializados:**
    * `SalaPizarraCanvas.tsx`: Pizarra interactiva infinita a pantalla completa (`fullBleed`) con notas adhesivas, acuerdos pedagógicos, paneo y presencia de cursores remotos Yjs sobre WebSockets.
    * `SalaComparadorCurricular.tsx`: Herramienta de cotejo analítico entre dos asignaturas de la carrera para contrastar cargas horarias, unidades temáticas y resultados de aprendizaje (articulación horizontal y vertical).
    * `SalaPerfilEgresoSeccion.tsx`: Matriz del perfil de egreso aprobado por CES y competencias CACES para articular acuerdos de cátedra.
    * `PeaAiChatSidebar.tsx`: Asistente curricular contextualizado a la carrera para sugerir articulaciones pedagógicas.
* **`RevisionCurricularPage.tsx` (`/documentacion/revision-tecnica/:projectUuid`):**
  * Portal de auditoría colegiada donde los evaluadores contrastan el documento contra las directrices normativas.
  * Permite la edición in-situ directa de datos generales en la Sección 1 sin modales flotantes (`InteractiveSections.tsx`), cuenta con compositor de observaciones anclado a cada sección y acceso directo al editor colaborativo.
* **`MonitoreoCurricularPage.tsx` (`/documentacion/monitoreo/:projectUuid`):**
  * Línea de tiempo visual y seguimiento detallado de estados y transiciones del PEA.
* **`DocumentWorkspace.tsx` (`/documentacion/workspace/:templateCode/:projectUuid` y `/documentacion/mis-proyectos/workspace/...`):**
  * Orquestador del espacio de redacción y edición activa. Monta `<DOSIERBuilderShell>` integrando:
    * `CollaborationSidebar.tsx` (revisión de consistencia, chat colegiado, estado y actividad).
    * `PeaReviewPanel.tsx` (auditoría CACES en 7 verificadores automáticos y botones de aval).
    * `OutputSection.tsx` (emisión oficial y visor PDF con iframe compilado).
    * `<SectionBlockGuard>` (bloqueo reactivo de secciones post-firma y por avance de workflow).
  * **Segregación Contextual de Autoría vs. Supervisión Curricular:**
    * Cuando el usuario ingresa por la ruta de asignaturas propias (`/documentacion/mis-proyectos/workspace/...`), opera estrictamente como **Docente Elaborador** (incluso si posee credenciales de Coordinador de Carrera, Coordinador Académico o Vicerrector).
    * En dicho contexto de autoría, la barra lateral (`CollaborationSidebar.tsx`) inhabilita de forma absoluta la pestaña y el panel de auditoría técnica (`PeaReviewPanel.tsx`), impidiendo que el elaborador se auto-audite o reciba formularios de dictamen en su espacio de redacción.
    * Tras estampar la firma institucional como docente elaborador en `OutputSection.tsx` y transicionar el PEA a `EnRevision`, la ventana modal de certificación (`TimedSuccessModal`) y las acciones directas enrutan determinísticamente según el rol:
      * **Autoridades y Coordinadores:** Redirección automática a la bandeja general de Supervisión Curricular (`/documentacion`), donde el documento ya figura en circuito formal de revisión.
      * **Docentes Estándar:** Redirección a su catálogo de asignaturas (`/documentacion/mis-proyectos`).
      * Se elimina el botón de auto-revisión técnica in-situ en el workspace del autor para prevenir confusiones operativas.

---

### 2.3. Módulo de Administración (`src/pages/Admin/`)

* **Gestión de Usuarios (`/usuarios`):**
  * Catálogo de usuarios institucionales sincronizados desde SIGAFI (Docentes y Administrativos) con filtros multicriterio, paginación y asignación de roles curriculares institucionales.
  * **Organigrama Vertical por Carreras (`OrganigramaVerticalView.tsx`):** Representación del árbol institucional con el claustro docente por carrera, horas semanales de carga y coordinadores asignados.
* **Mantenimiento Documental y Respaldos (`/admin/documentos` - `DocumentMaintenancePage.tsx`):**
  * Exclusivo para administradores (`DOSIER_ADMIN`).
  * **Pestaña de Versiones Obsoletas (`ObsoleteVersionsTab.tsx`):** Diagnóstico de almacenamiento físico, conteo de bytes utilizados por instancias no publicadas y purga unitaria o masiva de borradores huérfanos.
  * **Pestaña de Copias de Seguridad (`BackupsTab.tsx`):** Disparador de respaldos de base de datos bajo demanda, descarga de archivos `.sql.gz`, verificación forense de hash SHA-256 y eliminación controlada de copias históricas.
* **Diseñador de Plantillas / Canvas Builder (`/plantillas` - `DocumentTemplatesPage.tsx`):**
  * Diseñador visual con soporte drag and drop (`BlockCanvas.tsx`, `defaultBlocksFactory.ts`).
  * Inspector de propiedades (`BlockProperties.tsx`) para la personalización de bloques institucionales.
  * Vista Bento de Formatos Oficiales (`OfficialTemplatesCatalogView.tsx`) para consulta y descarga por parte de la planta docente.
  * Previsualización PDF en caliente (`TemplatePreviewModal.tsx`) mediante compilación de marcado HTML.
* **Bitácora de Auditoría Forense (`/auditoria` - `AuditPage.tsx`):**
  * Consulta de registros de `doc_audit_logs` con filtros por rango de fechas, identificador de usuario, dirección IP de origen y acción realizada.
* **Motor de Correo Transaccional (`/emails` - `EmailEnginePage.tsx`):**
  * Gestión de plantillas HTML institucionales y pruebas de despacho SMTP.
* **Gestión de Incidencias Administrativas (`/admin/incidencias` - `AdminFeedbackPage.tsx`):**
  * Consola centralizada de soporte técnico con filtros por severidad, estado, visor de capturas de pantalla y chat de resolución con el docente.

---

### 2.4. Módulo de Seguimiento y Analíticas CACES (`src/pages/Analytics/`)

Accesible en `/analiticas` para roles de dirección y supervisión:
* **`AnalyticsOverviewTab.tsx`:**
  * **Paso actual del trámite:** Conteo exacto de asignaturas en cada etapa del flujo curricular indicando el responsable inmediato.
  * **Distribución por estado:** Desglose porcentual y numérico del avance general.
  * **Avance de firmas:** Trazabilidad de las 4 firmas institucionales reglamentarias por cátedra.
  * **Desglose por carrera:** Matriz comparativa de cumplimiento entre facultades y carreras del instituto.
* **`AnalyticsProjectsTab.tsx` & `AnalyticsCacesTab.tsx`:** Auditoría de consistencia horaria según el Art. 21 del CES y generación de informes ejecutivos de acreditación.

---

### 2.5. Módulos de Autenticación, Seguridad y LOPDP

* **`src/pages/Login/`:**
  * Formulario de autenticación con credenciales locales (`Login.tsx`).
  * Procesamiento de inicio de sesión único institucional (`MicrosoftCallback.tsx`).
  * Solicitud y formalización de recuperación de contraseña (`RecuperarContrasenia.tsx`, `VerContrasenia.tsx`).
* **`src/pages/Auth/ResetAlertPage.tsx`:** Pantalla de notificación ante requerimientos de cambio de clave forzado.
* **`src/pages/Lopdp/`:**
  * `LopdpConsentPage.tsx`: Formulario de aceptación de términos de tratamiento de datos personales, obligatorio previo al acceso al sistema.
  * `LopdpAdminPage.tsx`: Administración de consentimientos otorgados y gestión formal de solicitudes de derechos ARCO.
* **`src/pages/Public/VerifyDocument.tsx` (`/verificacion/:code`):**
  * Validador forense público accesible sin credenciales mediante escaneo de código QR.
  * Comprueba la autenticidad del documento, los certificados digitales de los firmantes y el hash criptográfico SHA-256.

---

### 2.6. Módulos Complementarios

* **`src/pages/Calendario/CalendarioPage.tsx` (`/calendario`):**
  * Vista Calendario interactiva con `react-big-calendar` para plazos del PEA y eventos normativos.
  * Vista Kanban curricular por columnas (*Pendiente*, *En Progreso*, *Completado*) con arrastre fluido.
  * Vista de notas adhesivas rápidas para anotaciones personales de cátedra.
* **`src/pages/Notificaciones/NotificationsPage.tsx` (`/notificaciones`):**
  * Feed documental continuo con divisores finos para revisión de alertas y eventos transaccionales.
* **`src/pages/RecycleBin/RecycleBinPage.tsx` (`/papelera`):**
  * Interfaz de restauración para registros eliminados lógicamente en base de datos.
* **`src/pages/Settings/SettingsPage.tsx` (`/configuracion`):**
  * Configuración de perfil docente, carga de firmas digitales (DFRM o certificado `.p12`) y parámetros normativos institucionales (`?tab=parametros`).
* **`src/pages/Solicitudes/SolicitudesPage.tsx` (`/solicitudes`):**
  * Catálogo Bento de trámites docentes y solicitudes de soporte institucional.
* **`src/pages/Feedback/UserFeedbackPage.tsx` (`/mis-incidencias` e `/incidencias`):**
  * Portal del docente para la radicación y seguimiento interactivo de requerimientos técnicos.
