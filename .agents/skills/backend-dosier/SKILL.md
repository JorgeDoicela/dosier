---
name: backend-dosier
description: Extiende la skill global de backend con convenciones y restricciones específicas del proyecto DOSIER. Activa esta skill EN COMBINACIÓN CON `desarrollo-backend` para tareas de controladores, servicios C#, EF Core, DTOs o base de datos de DOSIER.
---
# Extensión de Backend — DOSIER

> **Orquestación:** Esta skill **extiende y complementa** las directrices globales de `desarrollo-backend`. Debe cargarse siempre junto con los principios globales (arquitectura limpia, inyección de dependencias, logging, commits semánticos).


## 1. Convenciones de Base de Datos (DOSIER)

* **Tablas del Módulo Académico y Curricular:** Todas las tablas nativas del portafolio docente (PEA, Sílabo 19 semanas, Guías APE, Guías de Estudio) se gestionan a través de EF Core manteniendo integridad relacional y llaves foráneas explícitas.
* **Tablas Institucionales (`sigafi`) — Estrictamente Solo Lectura:** Las tablas del sistema institucional (`malla`, `detalle_malla`, `prerequisito`, `parcial`, `parcial_modalidad_fecha`, `profesor`, `asignatura`, `carrera`, `periodo`) pertenecen a `sigafi_es` y son de **solo lectura** para la API de DOSIER. Nunca generes consultas que intenten escribir en estos registros.

## 2. Consultas EF Core — DOSIER

* Al consultar mallas, asignaturas y prerrequisitos, incluye siempre las entidades navegacionales:
  ```csharp
  .Include(m => m.DetalleMalla)
      .ThenInclude(d => d.Asignatura)
  ```
* Usa `.AsNoTracking()` en todas las consultas de solo lectura para optimizar memoria.

## 3. Mapeo Completo de DTOs — DOSIER

* En métodos `GetAll` o listados de asignaturas y portafolios, incluye **todas** las horas desglosadas (`HorasDocencia`, `HorasApe`, `HorasAutonomo`, `Creditos`) requeridas por el frontend para validación matemática en tiempo real.

## 4. Seguridad y Gobernanza

* Aplica siempre las reglas de la skill global `gobernanza-datos-segura` para cualquier operación que involucre credenciales, roles, permisos o tablas de usuarios de `sigafi`.

## 5. Convenciones de Rutas y Controladores API

* **Prefijo de Ruta y Nombres:** Todas las rutas de controladores API deben mantener el prefijo `/api/[controller]` usando sustantivos en inglés o kebab-case (ej: `/api/docente-asignaturas`, `/api/document-instances`, `/api/document-templates`).
* **Verbos HTTP:** Respeta estrictamente los verbos REST estándar (`GET` para lectura, `POST` para creación, `PUT` para actualización completa, `PATCH` para parcial, `DELETE` para eliminación).
* **Respuestas Uniformes:** Devuelve respuestas estructuradas con códigos HTTP adecuados (`200 OK`, `201 Created`, `400 BadRequest`, `404 NotFound`, `500 InternalServerError`).

## 6. Motor Documental — Patrón Molde vs Instancia (Inmutabilidad)

* **Separación Estricta:**
  - `document_templates` (Molde Maestro): Plantillas de los 4 entregables oficiales (PEA, Sílabo, Guías APE, Guías de Estudio).
  - `document_instances` (Instancia de Asignatura): Al iniciar la planificación de una materia, `DocumentInstanceService` clona la versión y guarda el `TemplateConfigSnapshotJson`.
* **Protección de Datos Docentes en Producción:**
  - Los documentos aprobados o legalizados leen **exclusivamente su Snapshot**.
  - Los datos de redacción colaborativa se almacenan indexados por claves de campo (`field_key`), desacoplados de la presentación visual.
