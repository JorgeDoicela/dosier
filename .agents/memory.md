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
