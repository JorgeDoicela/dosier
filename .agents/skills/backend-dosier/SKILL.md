---
name: backend-dosier
description: Extiende la skill global de backend con convenciones y restricciones específicas del proyecto DOSIER. Activa esta skill EN COMBINACIÓN CON `desarrollo-backend` para tareas de controladores, servicios C#, EF Core, DTOs o base de datos de DOSIER.
---
# Extensión de Backend — DOSIER

> **Orquestación:** Esta skill **extiende y complementa** las directrices globales de `desarrollo-backend`. Debe cargarse siempre junto con los principios globales (arquitectura limpia, inyección de dependencias, logging, commits semánticos).

## 1. Convenciones de Base de Datos y Persistencia

* **Tablas Institucionales SIGAFI — Estrictamente Solo Lectura:** Las tablas preexistentes del sistema académico institucional (`carreras`, `periodos`, `mallas_periodos`, `detallemallas`, `profesores`, `asignacion_materias`) residen en la base de datos `sigafi_es` y son de **estricta solo lectura** para la API de DOSIER.
  * Al consultar carreras, aplica siempre el filtro institucional `esInstituto = 1` para limitar el alcance al Instituto Superior Tecnológico Pedro Traversari.
  * Usa `.AsNoTracking()` en todas las consultas sobre entidades de SIGAFI.
* **Tablas del Núcleo Curricular DOSIER (Lectura / Escritura):** Gestionadas mediante los 4 scripts SQL oficiales en `scripts/base_datos/`:
  1. `01_sistema_base.sql`: `document_templates`, `document_instances`, `document_signatures`, `audit_logs`, `doc_cowork_documentos`, tablas LOPDP.
  2. `02_gobernanza_y_antecedentes_curriculares.sql`: `cur_normativas_externas`, `cur_normativa_articulos`, `cur_modelos_educativos`, `cur_proyectos_carrera`, `cur_asignaturas_antecedentes`.
  3. `03_curriculum_pea_oficial.sql`: `cur_pea`, `cur_pea_seccion_b..k` (10 tablas por sección A-K), `cur_pea_colaboradores`, `cur_pea_versiones`.
  4. `04_seguridad_rbac_roles_curriculares.sql`: Sistema ID 6 (`DOSIER`), módulos curriculares, permisos y los 5 roles oficiales.

## 2. Seguridad RBAC y Control de Acceso Curricular

* **Sistema Oficial:** Registrado con `idSistema = 6` en `rbac_sistema` con detalle `"Gestión Curricular y Acreditación ISTPET"`.
* **Catálogo de 5 Roles Curriculares Oficiales:**
  1. `DOSIER_ADMIN` (idRol: 32) - Administrador general y gestión de calidad.
  2. `DOSIER_DOCENTE` (idRol: 33) - Docente autor y co-redactor de PEAs.
  3. `DOSIER_COORD_CARRERA` (idRol: 34) - Coordinador de Carrera (revisión disciplinar y aval).
  4. `DOSIER_COORD_ACAD` (idRol: 35) - Coordinador Académico (verificación metodológica e institucional).
  5. `DOSIER_VICERRECTOR` (idRol: 36) - Vicerrectorado (aprobación definitiva y legalización forense).
* **Módulos Curriculares:** `PEA`, `GOBERNANZA_CURRICULAR`, `AUDITORIA_CACES`, `CONFIGURACION`.
* En servicios y controladores, valida la pertenencia al rol mediante `RbacService` o los atributos `[Authorize(Policy = "...")]`.

## 3. Máquina de Estados y Circuito de Firmas del PEA

* El ciclo de vida oficial del PEA se gestiona mediante el servicio `PeaService`:
  $$\text{Borrador} \longrightarrow \text{EnRevision} \longrightarrow \text{RevisadoCoord} \longrightarrow \text{RevisadoAcad} \longrightarrow \text{Aprobado}$$
* **Flujo de Observaciones:** En estado `EnRevision`, las comisiones pueden registrar observaciones por sección (`AgregarObservacionAsync`), devolviendo el documento a estado `Observado` para que el docente autor subsane los requerimientos (`SubsanarObservacionAsync`) antes del reenvío.
* **Bloqueo Inmutable (*State Locking*):** Al pasar a `Aprobado` tras la firma de Vicerrectorado, el documento se congela irrevocablemente en `document_instances.data_snapshot_json` y se sella con hash criptográfico SHA-256.

## 4. Validación Matemática de Horas y Créditos

* En todo guardado o cambio de estado de un PEA, el sistema valida que la distribución de horas en la Sección F de contenidos coincida exactamente con las horas normadas en `detallemallas` de SIGAFI:
  $$\text{Horas Docencia (CD)} + \text{Horas APE} + \text{Horas Autónomo (TA)} \equiv \text{Total Horas Asignatura}$$
* 1 Crédito Académico equivale exactamente a 48 horas de trabajo del estudiante.

## 5. Convenciones de Controladores y Rutas API

* **Controladores Principales:**
  * `PeaController` (`/api/pea`): Operaciones sobre el PEA oficial, 11 secciones, firmas, observaciones y clonación.
  * `DocenteAsignaturasController` (`/api/docente-asignaturas`): Asignaciones docentes y contexto académico desde SIGAFI.
  * `NormativasController` (`/api/normativas`): Normativas externas CES/CACES, modelos educativos y perfiles de egreso.
  * `ExpedientesController` (`/api/expedientes-curriculares`): Vinculación de asignación con período académico y PEA.
  * `DocumentInstancesController` (`/api/document-instances`): Compilación PDF, snapshots y comprobación pública QR.
* **Serialización:** Todas las respuestas JSON del backend deben serializarse en `lower_snake_case` globalmente.
