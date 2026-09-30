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
* **Unificación Tipográfica Global a Inter Variable (`Inter Puro`):**
  - Causa Raíz de Tipografía Rota: Se detectó que textos regulares, títulos en la Landing (`Hero.tsx`, `Footer.tsx`, `Workspace.tsx`, `TechFirma.tsx`) y clases `.font-mono` renderizaban en fuentes de máquina de escribir por defecto del sistema (Consolas/Courier) debido a que `--font-mono` apuntaba a `"JetBrains Mono", "SF Mono", "Fira Code", monospace` sin estar cargadas en el proyecto, contradiciendo el principio de diseño "Inter Puro".
  - Instalación Local de `@fontsource-variable/inter`: Se integró el paquete local en `dosier_web` e importó en `src/main.tsx` para garantizar que la fuente variable oficial de Inter se empaquete en el bundle de Vite sin depender de conexiones externas a CDN.
  - Normalización de Tokens y Variables OpenType en `base.css`: Se redefinieron `--font-sans` y `--font-mono` apuntando a `"Inter Variable", "Inter"`. Se activaron en `:root` las funciones OpenType institucionales (`'cv02' 1, 'cv03' 1, 'cv04' 1, 'cv11' 1, 'calt' 1, 'liga' 1`) y ajuste óptico (`font-optical-sizing: auto`). Para elementos técnicos y numéricos (`.font-mono`, `.tabular-nums`), se activaron las variantes numéricas tabulares y cero cruzado de Inter (`'tnum' 1, 'zero' 1`), preservando la familia Inter en todo el sistema.
  - Saneamiento en Vistas: Se reemplazaron clases `font-mono` residuales por `font-sans` en encabezados y textos editoriales de `Hero.tsx`, `Footer.tsx`, `Workspace.tsx` y `TechFirma.tsx`.
* **Depuración Integral de Información Irrelevante, Fluff y Exposición de Infraestructura Interna:**
  - Causa Raíz: La interfaz exponía datos de depuración de bajo nivel orientados a desarrolladores (tarjeta "Frontera SIGAFI (Solo Lectura)" con `sigafi_es (MySQL 3306)`, conteo crudo de tablas, menciones a "Yjs", "Simulador de Acciones" y badges redundantes de sesión activa con el nombre de usuario ya presente en el sidebar), violando el principio institucional de presentar únicamente datos reales y operativos para el usuario final.
  - Saneamiento en Admin Dashboard: Se eliminó la tarjeta técnica de base de datos MySQL y el botón de prueba de sincronización en `AdminPeaDashboard.tsx`, sustituyéndolos por accesos operativos a Módulos Curriculares y Plantillas.
  - Saneamiento de Cabeceras en Dashboards de Roles (`DocentePeaDashboard`, `CoordCarreraDashboard`, `CoordAcadDashboard`, `VicerrectorDashboard`): Se eliminaron las cejas decorativas redundantes ("Docencia Curricular • Planificación Microcurricular", "Gobernanza Curricular Oficial", etc.), badges duplicados con el nombre de usuario y párrafos de relleno explicativo, dejando encabezados directos y limpios.
  - Saneamiento en Stepper y Vistas (`PipelineCurricularStepper`, `Roles.tsx`): Se eliminaron leyendas internas como "(Solo Lectura)", menciones de librerías técnicas ("Yjs") y términos como "Simulador", reemplazándolos por descripciones puramente funcionales y de negocio normativo.
* **Erradicación de Segmented Controls (iOS) y Adopción de Pestañas sobre Riel Plano:**
  - Causa Raíz: `RoleFlowBanner.tsx` utilizaba `.segmented-container` con fondos grises redondeados y botones con sombras elevadas flotantes, anti-patrón ajeno al estilo editorial sobrio de Stripe Docs, Linear y GitBook Enterprise.
  - Corrección en Componente y Estilos: Se refactorizó `RoleFlowBanner.tsx` a un sistema de pestañas sobre riel continuo (`border-b border-slate-200 dark:border-zinc-800`) al ras de la línea base con indicador inferior activo (`border-b-2 border-[#0070f3] dark:border-blue-400 -mb-[1px]`). Se eliminaron las clases obsoletas `.segmented-container` y `.segmented-item-active` de `base.css`.
  - Formalización en Reglas y Skill: Se documentó formalmente en `.agents/AGENTS.md` y en `.agents/skills/styles-dosier/SKILL.md` (sección 1.8) la prohibición absoluta de segmented controls estilo iOS/macOS y el estándar obligatorio de pestañas sobre riel plano.
* **Auditoría Integral y Consolidación de Modern Enterprise Docs en Todo el Sistema:**
  - `EmailEnginePage.tsx`: Reemplazado segmented control encapsulado en caja gris por pestañas sobre riel plano al ras de la línea base con indicador activo `#0070f3`.
  - `CalendarioHeader.tsx` y `CalendarioPage.css`: Erradicados los segmented pills (`.view-selector-pill`, `.view-selector-btn`) para selector de vista, navegador temporal y sub-vistas; sustituidos por pestañas sobre riel plano continuo y botones con bordes limpios sin fondos encapsulados.
  - `UploadSignatureTab.css`: Reemplazado contenedor y botones con sombras tipo iOS por botones de opción planos con borde tenue y acento `#0070f3`.
  - `buttons.css`: Normalizada la tipografía base de botones a `font-size: 0.75rem; text-transform: none; letter-spacing: normal; font-weight: 500` eliminando el forzado a mayúsculas gritadas de 10px (`uppercase tracking-widest`).
  - `AnalyticsTabs.tsx` y `misc.css`: Eliminado estilo tipográfico chillón (`font-black uppercase tracking-widest`) en pestañas de analíticas, unificando el acento activo a `#0070f3`.
  - `NotificationsPage.tsx`: Reemplazado fondo `bg-zinc-900` de filtro activo por el acento institucional `bg-[#0070f3] text-white border-[#0070f3]`.
* **Refactorización del Feed de Notificaciones y Prohibición de Bordes Laterales (`border-l-4`):**
  - Causa Raíz de Desviación Visual: La vista de notificaciones (`NotificationsPage.tsx`) utilizaba barras laterales de acento grueso (`border-l-2 !border-l-[#0070f3]` estilo callout de alerta de Bootstrap/macOS), tarjetas individuales aisladas con bordes completos amontonadas en `space-y-2`, y duplicaba las fechas en cada elemento (mostrando fecha relativa arriba a la derecha y fecha completa larga abajo a la derecha).
  - Corrección en Componente:
    - Se transformó el listado en un **Folio Unificado con Lista Continua** (`rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden shadow-2xs`).
    - Se eliminaron las barras de acento lateral (`border-l-2/border-l-4`); el estado no leído se distingue mediante un punto azul corporativo alineado (`w-2 h-2 rounded-full bg-[#0070f3]`) y un sutil fondo `bg-blue-50/20 dark:bg-blue-950/10`.
    - Se eliminó la fecha redundante inferior (`formatFullDate`), conservando una única marca temporal relativa en la esquina superior derecha (`text-[11px] font-mono text-slate-400`).
    - Se refactorizó la tarjeta de métricas de almacenamiento `VercelUsageCard` a `NotificationSummaryCard` con estética sobria y acentos técnicos en `#0070f3`.
  - Ampliación de Directrices y Skills: Se incorporó la sección 4.9 en `styles-dosier/SKILL.md`, y se actualizaron las reglas en `.agents/AGENTS.md` y `frontend-dosier/SKILL.md` prohibiendo explícitamente barras laterales gruesas, listas de tarjetas aisladas y duplicación de marcas temporales.
* **Erradicación de Sliders / Barras de Desplazamiento Verticales en Pestañas sobre Riel:**
  - Causa Raíz Técnica del Slider:
    1. Especificación W3C CSS Overflow: Al declarar `overflow-x: auto` en `<nav>`, el navegador computa obligatoriamente `overflow-y: auto`.
    2. Margen Negativo en Botones: Los botones activos tenían `-mb-[1px]` (y en `CalendarioHeader.tsx` `-mb-[13px]`), lo que provocaba que la caja del botón sobresaliera verticalmente del flex line de `<nav>`.
    3. Inexistencia de `.no-scrollbar`: La clase `.no-scrollbar` no estaba declarada en CSS, por lo que Chromium en Windows renderizaba la barra de desplazamiento nativa con flechas arriba/abajo (slider).
  - Corrección Arquitectónica:
    - Se declaró la regla `.no-scrollbar` en `base.css` (`scrollbar-width: none` y `::-webkit-scrollbar: display: none`).
    - En `RoleFlowBanner.tsx`, `CalendarioHeader.tsx` y `EmailEnginePage.tsx`: se trasladó el margen negativo `-mb-px` exclusivamente al contenedor `<nav>`, se agregó `overflow-y-hidden`, y se removieron todos los márgenes negativos de los `<button>`, garantizando que todos los botones compartan idéntico padding y altura vertical.
    - Se actualizó `styles-dosier/SKILL.md` y `frontend-dosier/SKILL.md` con la regla de oro para la prevención de sliders.
* **Erradicación de Segmented Controls, Filtros Encapsulados y Mayúsculas Gritadas en UsersHeader:**
  - Causa Raíz: En `UsersHeader.tsx`, las vistas principales (*Docentes / Administrativos*) y los subfiltros (*Asignación: Con Carga Docente / Con Horas de Investigación / Toda la Planta Docente*) estaban implementados como segmented controls encapsulados dentro de cajas con bordes grises (`bg-surface border p-1 rounded-lg`), píldoras con acento tintado (`bg-brand/15 text-brand border border-brand/30`) y tipografía en mayúsculas gritadas (`text-[10px] font-black uppercase tracking-wider`).
  - Corrección en Componente:
    - Se refactorizaron las vistas a un **Riel Plano Continuo** (`border-b border-slate-200 dark:border-zinc-800`), utilizando `<nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">` con acento activo `#0070f3`, eliminando cajas y bordes envolventes.
    - Se integró el buscador con shortcut `/` a la derecha del riel.
    - Se transformaron los subfiltros en chips de texto planos directos con capitalización natural (*Con carga docente*, *Con horas de investigación*, *Toda la planta docente*) y estado activo de alto contraste (`bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs`).
  - Blindaje en Skills: Se añadieron prohibiciones expresas en `styles-dosier/SKILL.md` (sección 4.10), `frontend-dosier/SKILL.md` (directriz 12) y `.agents/AGENTS.md` prohibiendo cajas encapsuladas para subfiltros y mayúsculas forzadas (ALL CAPS) en controles.
* **Alineación Integral del Editor de Plantillas a Modern Enterprise Docs:**
  - Causa Raíz: En `DocumentTemplatesPage`, `TemplateCatalog`, `BlockCanvas` y `BlockProperties`:
    1. Las pestañas del panel lateral (*Propiedades* / *Estilos*) usaban `border-text-main` (borde negro en modo claro) en lugar del acento corporativo `#0070f3`.
    2. Los ítems del catálogo de plantillas encerraban sus iconos en cajitas grises (`p-1.5 rounded bg-zinc-50 border`) y usaban una barra lateral azul gruesa para la selección.
    3. Categorías, cabecera de lienzo y estados vacíos usaban mayúsculas gritadas (`ALL CAPS`, `uppercase font-bold tracking-wider`).
    4. En pantallas de altura completa (`isFullHeightPage`), el botón flotante de notas (`StickyNotesFloatingButton`) se superponía sobre los controles del editor.
  - Corrección en Componentes y Layout:
    - `DashboardLayout.tsx`: Se condicionó `StickyNotesFloatingButton` para no renderizarse en vistas `isFullHeightPage`.
    - `DocumentTemplatesPage.tsx`: Se eliminó el texto filler explicativo del `PageHeader` y se estilizaron las pestañas móviles con `#0070f3`.
    - `TemplateCatalog.tsx`: Se sustituyeron los wrappers de iconos por iconografía vectorial desnuda directa, se eliminó la barra lateral azul gruesa adoptando un fondo de fila continuo sobrio (`bg-blue-50/70 dark:bg-blue-950/30`), y se normalizó la tipografía de categorías a capitalización natural.
    - `BlockCanvas.tsx`: Se convirtieron los botones de cabecera y los estados vacíos a capitalización natural sobria (`text-xs/sm font-medium/semibold`).
    - `BlockProperties.tsx`: Se implementó el riel plano continuo con acento `#0070f3` (`dark:border-blue-400 font-semibold`) y estados vacíos limpios.
  - Blindaje en Skills: Se creó la sección 4.11 en `styles-dosier/SKILL.md`, la directriz 13 en `frontend-dosier/SKILL.md` y se actualizó el checklist de verificación.
* **Sincronización Total de la Documentación Técnica a Modern Enterprise Docs:**
  - Se realizó una auditoría y actualización integral de toda la documentación técnica en `docs/documentacion/` (`05-sistema-de-diseno-editorial.md`, `01-arquitectura-react-vite.md`, `02-componentes-ui-y-builder-shell.md`, `06-catalogo-completo-vistas-y-flujos.md`, `01-macro-arquitectura-clean-arch.md`, `04-delimitacion-diagnostico-y-auditoria-istpet.md` y `README.md` de docs y raíz).
  - Se formalizó el Mandato de Alcance Universal (100% de pantallas, componentes estructurales, rieles planos, colores y tipografía Inter Variable sin mayúsculas forzadas ni emojis), erradicando menciones obsoletas a controles segmentados o librerías de terceros y blindando la consistencia entre el código fuente, las skills y los entregables de titulación.
