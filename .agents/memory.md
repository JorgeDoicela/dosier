# Memoria del Proyecto — DOSIER

Este archivo almacena el contexto operativo, decisiones arquitectónicas consolidadas y lecciones aprendidas exclusivas del proyecto DOSIER (Sistema PEA).

---

## 1. Decisiones Arquitectónicas Consolidadas

* **Backend y Persistencia:**
  - Clean Architecture en 4 capas concéntricas con ASP.NET Core (.NET 8).
  - Contexto Entity Framework modularizado en 4 partes parciales (`DosierContext`, `DosierContext.Doc`, `DosierContext.Identity`, `DosierContext.Sigafi`).
  - Base de datos institucional SIGAFI estrictamente de **solo lectura**.
  - Motor de validación curricular (`CurricularValidationEngine`) y máquina de estados del PEA con 5 fases (`Borrador` -> `EnRevision` -> `RevisadoCoord` -> `RevisadoAcad` -> `Aprobado`).
* **Frontend y UI:**
  - Feature-Based SPA en React 18 con Vite y TypeScript.
  - Fachadas estructuradas en `src/services/` (Axios centralizado).
  - Componentes de sección del PEA (secciones A a K) con integración `<CoWorkField>` y Yjs sobre SignalR.
  - Sistema de diseño Geist Editorial con regla cardinal de fondos 100% sólidos.
  - **Gobernanza de Bloques y Preservación de Editabilidad:** Prohibición estricta de aplanar bloques a HTML estático; regla fundamental de expansión vertical libre (`h-auto`, `min-h-fit`, cero compresión ni scroll interno en bloques); evolución aditiva (añadir requerimientos CACES/CES, nunca restar); desacoplamiento Molde Maestro (`doc_document_templates`) vs Instancia Inmutable (`doc_documentos_instancias`) persistida por `field_key` (`data_snapshot_json`); y blindaje con `<SectionBlockGuard>`.
* **Documentación Técnica:**
  - Dosier técnico modular en `docs/documentacion/` con taxonomía numérica (`01-`, `02-`...).
  - Blindaje total e inmutable del directorio `docs/tesis/` (prohibido alterar o leer por el agente).
  - Cero emojis y cero lenguaje marketero.

---

## 2. Historial de Decisiones y Lecciones Aprendidas

* **Depuración de Plantillas del Motor Documental:** Se eliminó la plantilla de marcador de posición `REPORTE_ANALITICAS` ("Reporte de Analíticas y Portafolio Documental v20") de `DocumentTemplateRegistry.cs`, `TemplateFileLoader.cs` y de la tabla `doc_document_templates` en MySQL, preservando el generador directo de analíticas institucionales en `ReportsController`/`ReportsService` y limpiando la visualización en el editor de plantillas.
* **Adopción del Estándar de Bloques y Documentos Editables:** Se integraron formalmente en las directrices de DOSIER (`AGENTS.md`, `frontend-dosier` y `backend-dosier`) los principios de preservación innegociable de reactividad, expansión vertical holgada sin scroll asfixiante, evolución aditiva estricta e inmutabilidad por snapshot forense.
* **Homologación Curricular del PEA Oficial ISTPET:** Se alinearon al 100% las 11 secciones (a - k) del PEA con el formato institucional oficial vigente:
  - Sección a (Datos Generales): inclusión del código de carrera e integración de las etiquetas oficiales exactas de desglose horario (`Total horas de contacto docente`, `Total horas de práctico experimental`, `Total horas de aprendizaje autónomo`).
  - Sección i (Evaluación del Aprendizaje): matriz estandarizada con textos normados en mayúsculas (`NOTA PARCIAL 1: ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)`, `NOTA PARCIAL 2: EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)`, `EVALUACIÓN FINAL: EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)` con base sobre 10,00).
  - Sección k (Firmas de Responsabilidad): tabla de 5 columnas (`DESCRIPCIÓN`, `ELABORADO`, `REVISADO`, `REVISADO`, `APROBADO`) con cargos oficiales normalizados (`Docente`, `Coordinador de Carrera`, `Coordinador Académico`, `Vicerrectorado`).
  - Sincronización completa entre el molde documental (`DocumentTemplateRegistry.ts`), componentes del espacio de trabajo (`PeaEvaluationSection.tsx`, `PeaSignaturesSection.tsx`), lienzo visual del diseñador de plantillas (`RenderPeaSections.tsx`) y plantilla HTML del compilador PDF (`PEA_OFICIAL.html`).
* **Modularización y Super-Editabilidad de Bloques PEA en el Lienzo:** Se refactorizó `RenderPeaSections.tsx` (reduciéndolo de 1046 a 29 líneas) descomponiéndolo en una suite modular en `canvasRenderers/pea/` (`RenderPeaGeneral`, `RenderPeaObjectives`, `RenderPeaPrerequisites`, `RenderPeaContents`, `RenderPeaMethodology`, `RenderPeaResources`, `RenderPeaEvaluation`, `RenderPeaBibliography`, `RenderPeaSignatures`, `RenderPeaLegacy`), garantizando el umbral de < 700 líneas por archivo y habilitando edición in-situ en tiempo real (inputs para labels y horas, textareas auto-expandibles, botones interactivos `+ Agregar fila / unidad / práctica / evaluación` y eliminación sin compresión de altura ni scroll interno).
* **Sincronización Reactiva Automática en Mis Asignaturas (`/documentacion/mis-proyectos`):** Se eliminó el botón manual de recarga en `MisAsignaturasPage.tsx` y se implementó una arquitectura de actualización continua multi-canal sin parpadeo visual:
  - Evento de Dominio SignalR (`dosier-projects-changed`): Reacciona en tiempo real a notificaciones push del servidor (cambios de estado, revisiones, aprobaciones o nuevas asignaciones).
  - Revalidación por Foco y Visibilidad: Se revalidan datos silenciosamente al regresar a la pestaña del navegador (`document.visibilitychange` y `window.focus`).
  - Heartbeat Pasivo Adaptativo: Intervalo de sondeo de respaldo cada 30 segundos activo exclusivamente cuando la pestaña es visible para el usuario, ejecutando peticiones silenciosas en segundo plano que conservan el estado visual y evitan spinners intrusivos.
  - Navegabilidad Integral en Tarjetas de Asignatura: Se transformó el contenedor de cada tarjeta en elemento interactivo de primer orden (`role="button"`, `tabIndex={0}`, eventos de teclado y mouse) permitiendo acceder al PEA al hacer clic en cualquier parte del cuadro, con feedback visual reactivo (`hover:border-[#0070f3]`, `group-hover:text-[#0070f3]`, `translate-x-0.5` en la flecha de acción) y prevención de propagación dual.
* **Integración Real del Despacho de Vicerrectorado (`/dashboard`):** Se erradicó el uso de datos estáticos (`MOCK_PEAS`) en `VicerrectorDashboard.tsx` y en el modal `LegalizacionFirmaModal.tsx`. Ahora el Vicerrector consulta directamente las asignaturas reales desde `getBandejaPeas` y los períodos oficiales de SIGAFI, calcula métricas en vivo (Listos para firma, Legalizados, En proceso) y ejecuta la firma digital de legalización en firme (`POST /api/pea/{id}/firmar`) bajo la Ley 67 del Ecuador.
* **Consolidación Integral del Rol Docente (`/dashboard` y `/documentacion/workspace/`):** Se eliminó por completo la maqueta estática de "Ing. Edison Pérez" y `mockCurricularData.ts` en `DocentePeaDashboard.tsx`. Ahora el docente carga en tiempo real sus asignaturas oficiales de SIGAFI mediante `docenteAsignaturasService.getMisMaterias(selectedPeriodo)`, monitorea métricas en vivo calculadas del estado real del workflow, inicializa o continúa su PEA hacia `/documentacion/workspace/pea-oficial/${uuid}` y diligencia las 11 secciones normativas con persistencia colaborativa Yjs/SignalR.
* **Erradicación Total de Datos Hardcodeados y Mocks en Todos los Roles del Sistema:**
  - Se eliminó de raíz el directorio `src/pages/Dashboard/Roles/data/` (`mockCurricularData.ts`) que contenía nóminas ficticias, convocatorias inventadas y constantes `MOCK_PEAS`, `MOCK_CONVOCATORIA_ACTIVA`, `MOCK_MATERIAS_ANTERIORES` y `MOCK_DOCENTES_REZAGADOS`.
  - `CoordCarreraDashboard.tsx`: Conectado a `curriculumProjectService.getCarrerasInstitucionales()`, `docenteAsignaturasService.getPeriodosAcademicos()` y `getBandejaPeas({ idCarrera, idPeriodo })`. Emisión formal de Aval de Carrera con `cambiarEstadoPea(id, 'RevisadoCoord')` y registro de observaciones con `agregarObservacionPea`.
  - `CoordAcadDashboard.tsx`: Conectado a catálogos reales de períodos y carreras, matriz general de supervisión institucional, emisión de aval académico con `cambiarEstadoPea(id, 'RevisadoAcad')` y cálculo dinámico de docentes con entregas pendientes.
  - `AdminPeaDashboard.tsx`: Conectado a métricas en vivo de la frontera SIGAFI (conteo dinámico de carreras autorizadas, usuarios sincronizados y PEAs en plataforma).
  - Modales del circuito (`RecordatorioDocentesModal.tsx`, `AperturaConvocatoriaModal.tsx`, `ProrrogaPlazoModal.tsx`, `ClonarPeaModal.tsx`): Desacoplados al 100% de datos fijos; cargan los períodos y carreras vigentes de la base de datos y reciben nóminas dinámicas de docentes rezagados calculadas en tiempo real.
  - `PipelineCurricularStepper.tsx` y `RoleFlowBanner.tsx`: Erradicados nombres de personas inventadas y ejemplos estáticos, preservando una guía de etapas normativas puramente fáctica y orientada a los roles institucionales.
* **Corrección de Error 500 en `/api/feedback/my` y Estabilidad de Notificaciones Web Push:**
  - Causa Raíz de 500: La tabla `doc_feedback_reportes` definida en `scripts/base_datos/05_feedback_incidencias.sql` no había sido aprovisionada en la base de datos MySQL local (`sigafi_es`), provocando fallo en `_feedbackService.GetMyFeedbackAsync`. Se ejecutó el DDL correspondiente creando la tabla con sus índices y columnas `JSON`/`TIMESTAMP`.
  - Notificaciones Web Push: Se alineó la clave pública VAPID en `DashboardLayout.tsx` con la configurada en `appsettings.json` (`BEEx5SX2kXyqhLIAD1oMlYVMEM9ZACpRCA8z12C1x_FUobijWo-LlV0O9R3Ql0jgAvYAnTg1ktBlLyDIRcJnOO8`) y se añadió un flag en `sessionStorage` para evitar reintentos ruidosos en navegadores que rechacen el servicio push de fondo (Brave, modo incógnito o entornos locales sin FCM).


