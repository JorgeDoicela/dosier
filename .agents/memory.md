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
* **Documentación Técnica:**
  - Dosier técnico modular en `docs/documentacion/` con taxonomía numérica (`01-`, `02-`...).
  - Blindaje total e inmutable del directorio `docs/tesis/` (prohibido alterar o leer por el agente).
  - Cero emojis y cero lenguaje marketero.

---

## 2. Historial de Decisiones y Lecciones Aprendidas

* *(El agente registrará aquí automáticamente las decisiones técnicas tomadas durante futuras sesiones)*.
