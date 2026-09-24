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
├── Modulos/         # Conmutador modular institucional
├── Notificaciones/  # Centro de notificaciones in-app
├── Public/          # Validador público de documentos vía código QR
├── RecycleBin/      # Papelera de reciclaje y recuperación de registros
└── Settings/        # Configuración de cuenta, seguridad y apariencia
```

---

## 2. Detalle Exhaustivo por Módulo y Vista

### 2.1. Módulo Dashboard (`src/pages/Dashboard/`)
Punto de entrada principal para usuarios autenticados (`/dashboard`), adaptado dinámicamente según el rol institucional mediante el conmutador segmentado `RoleFlowBanner`.

#### 2.1.1. Tableros Específicos por Rol (`src/pages/Dashboard/Roles/`)
* **`DocentePeaDashboard.tsx` (`DOSIER_DOCENTE`):**
  * Presenta las asignaturas asignadas al docente para el período lectivo ordinario extraídas de SIGAFI (`detallemallas`).
  * Semáforo de estado curricular por materia (`Borrador`, `EnRevision`, `Observado`, `RevisadoCoord`, `RevisadoAcad`, `Aprobado`).
  * Indicador de balance horario (horas docencia CD, prácticas APE y autónomas AA).
  * Acciones: Crear/Abrir PEA en Workspace, Clonar PEA de período previo (`ClonarPeaModal.tsx`) y Enviar a Revisión Técnica.
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
  * Monitor del estado de salud del sistema, métricas globales de avance, configuración de mallas curriculares y sincronización con SIGAFI.

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

* **`SupervisionCurricularPage.tsx` (`/documentacion` o `/investigacion/proyectos`):**
  * Vista matriz que alberga el conmutador de pestañas institucionales:
    1. **Pestaña Programas de Estudio (PEA):** Despliega el componente `<PeaSupervisionTray>`, permitiendo supervisar, filtrar por carrera/período y acceder al editor curricular oficial.
    2. **Pestaña Proyectos de Investigación:** Gestión de expedientes de investigación formativa vinculados al currículo.
* **`MisAsignaturasPage.tsx` (`/documentacion/mis-proyectos`):**
  * Bandeja personalizada para el docente con sus asignaturas oficiales sincronizadas desde SIGAFI y el estado de formulación de cada PEA.
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
  * Catálogo de usuarios institucionales sincronizados desde SIGAFI.
  * Asignación de roles curriculares RBAC (`idSistema = 6`).
  * Bloqueo y reseteo de credenciales de acceso.
* **Diseñador de Plantillas / Canvas Builder (`/plantillas`):**
  * Maquetador visual de bloques curriculares (`BlockCanvas.tsx`, `availableBlocks.ts`).
  * Configuración de propiedades JSON y previsualización de folios A4.
* **Bitácora de Auditoría Forense (`/auditoria`):**
  * Consulta de registros de `doc_audit_logs` con filtros por fecha UTC, usuario, dirección IP y acción.
* **Motor de Correo Transaccional (`/emails`):**
  * Editor de plantillas HTML institucionales y visor de cola de envíos SMTP.

---

### 2.4. Módulo de Analíticas e Indicadores CACES (`src/pages/Analytics/`)

* **`AnalyticsOverviewTab.tsx`:** Gráficas de avance global de planificación curricular institucional.
* **`AnalyticsProjectsTab.tsx`:** Desglose del estado de avance curricular por carreras del ISTPET.
* **`AnalyticsCacesTab.tsx`:** Matriz de cumplimiento de estándares del CACES 2026:
  * Cobertura de PEAs aprobados y legalizados.
  * Cumplimiento del Artículo 21 del CES en carga horaria.
  * Trazabilidad de firmas electrónicas válidas bajo Ley 67.
* **`cacesCalculator.ts`:** Lógica de cálculo matemático de los indicadores de aseguramiento de la calidad.

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

* **`src/pages/Calendario/`:** Cronograma de fechas límite para entrega y aprobación de PEAs con exportador de eventos iCalendar (`.ics`).
* **`src/pages/Notificaciones/`:** Bandeja centralizada de alertas transaccionales recibidas por WebSocket SignalR.
* **`src/pages/RecycleBin/`:** Papelera de reciclaje lógica para recuperación controlada de registros curriculares dados de baja.
* **`src/pages/Settings/`:** Gestión del perfil docente, actualización de correo, cambio de clave y selector de tema visual (Claro / Oscuro).
* **`src/pages/Modulos/`:** Selector de subsistemas institucionales del ISTPET.
