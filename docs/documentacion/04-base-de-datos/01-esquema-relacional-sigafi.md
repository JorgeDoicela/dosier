# Esquema Relacional de Base de Datos y Persistencia

## 1. Visión General del Modelo de Datos

La capa de persistencia de DOSIER utiliza el motor de base de datos **MariaDB 10.5+ / MySQL 8.0+** sobre el esquema de base de datos **`sigafi_es`** (expuesto en el puerto por defecto `3306`).

El mapeo objeto-relacional (ORM) es administrado por **Entity Framework Core 9.0** a través del conector `Pomelo.EntityFrameworkCore.MySql`. La base de datos almacena las entidades del dominio curricular docente (PEA, Sílabos de 19 semanas, Guías APE, Guías de Estudio), la estructura de usuarios y permisos, el motor documental, la bitácora de auditoría inmutable y las tablas de sincronización colaborativa CoWork.

---

## 2. Diagrama Entidad-Relación (DER Principal)

```mermaid
erDiagram
    USERS ||--o{ PROJECT_TEAM : docente_asignado
    USERS ||--o{ AUDIT_LOGS : genera
    USERS ||--o{ DOCUMENT_SIGNATURES : firma

    PROJECTS ||--|{ PROJECT_TEAM : incluye
    PROJECTS ||--o{ DOCUMENT_INSTANCES : vincula
    PROJECTS ||--o{ INFORMES_AVANCE : genera

    DOCUMENT_TEMPLATES ||--o{ DOCUMENT_INSTANCES : instancia
    DOCUMENT_INSTANCES ||--o{ COWORK_DOCUMENTOS : sincroniza
    DOCUMENT_INSTANCES ||--o{ DOCUMENT_SIGNATURES : contiene

    USERS {
        string uuid PK
        string email
        string password_hash
        string names
        string surnames
        bool is_active
    }

    PROJECTS {
        string uuid PK
        string code "Código Asignatura / Plan"
        string title "Nombre Asignatura / Cátedra"
        string state "Estado Curricular"
        decimal total_budget "Horas Totales / Créditos"
        datetime created_at_utc
    }

    DOCUMENT_INSTANCES {
        string uuid PK
        string template_code FK "PEA, SILABO_19SEM, GUIA_APE, GUIA_ESTUDIO"
        string entity_type "ASIGNATURA / PERIODO"
        string entity_uuid
        longtext data_snapshot_json
        string sha256_hash
        string state
    }

    COWORK_DOCUMENTOS {
        bigint id PK
        string entidad_uuid FK
        string campo_nombre "Sección Sílabo / PEA"
        longtext content_html
        datetime updated_at_utc
    }
```

---

## 3. Tablas Clave del Sistema

### 3.1. Dominio Curricular y Gestión Docente

* **`doc_proyectos` (`Projects`):** Almacena la entidad principal de planificación curricular de la asignatura (código de materia, nombre de asignatura, nivel, período académico, horas totales y estado del workflow curricular).
* **`doc_proyecto_miembros` (`ProjectTeam`):** Relación N:M entre docentes y asignaturas/cátedras, especificando el rol (Docente Autor Principal, Co-Docente Cátedra, Revisor de Comisión Curricular), porcentaje de dedicación y estado de asignación.
* **`doc_proyecto_cambios_equipo` (`ProjectTeamChange`):** Registro de solicitudes formales de reasignación de docentes de cátedra durante el período académico.
* **`doc_informes_avance` (`InformesAvance`):** Registro de informes de cumplimiento de avance curricular (corte de parcial 1, parcial 2 y portafolio docente de fin de período).

### 3.2. Dominio Documental y Forense

* **`document_templates` (`DocumentTemplate`):** Registro de plantillas curriculares oficiales del ISTPET (PEA, Sílabo de 19 semanas, Guía APE, Guía de Estudio Institucional), con su marcado HTML base y esquema de metadatos JSON.
* **`document_instances` (`DocumentInstance`):** Registro inmutable de cada documento curricular emitido (UUID, asignatura vinculada, snapshot JSON `data_snapshot_json`, hash criptográfico SHA-256, código QR de verificación CACES y estado).
* **`doc_cowork_documentos` (`DocCoworkDocumento`):** Tabla de edición colaborativa que guarda el marcado HTML resultante de las secciones curriculares co-redactadas en tiempo real mediante Yjs.
* **`document_signatures` (`DocumentSignature`):** Bitácora de firmas electrónicas aplicadas al documento oficial (docentes autores, comisión académica, coordinador de carrera, vicerrectorado).

### 3.3. Dominio de Seguridad y Gobernanza

* **`users` (`User`):** Catálogo de usuarios institucionales (UUID, cédula, nombres, apellidos, correo institucional, password_hash BCrypt).
* **`roles` / `permissions` / `role_permissions`:** Estructura RBAC para asignación de roles curriculares (`SuperAdmin`, `Vicerrectorado`, `CoordinadorCarrera`, `ComisionCurricular`, `Docente`).
* **`audit_logs` (`AuditLog`):** Tabla inmutable que registra cada operación `INSERT`, `UPDATE` o `DELETE` con snapshots en JSON del estado anterior y posterior de la planificación curricular.
* **`lopdp_consents` / `lopdp_arco_requests`:** Registro de consentimientos informados y atención a solicitudes de derechos ARCO.

---

## 4. Convenciones de Columna y Estrategia de Indexación

1. **Identificadores Únicos (UUID v4):** Las entidades principales de negocio utilizan identificadores `VARCHAR(36)` generados en la capa de aplicación (`Guid.NewGuid()`), evitando el uso de claves secuenciales expuestas en la API.
2. **Columnas de Auditoría Estándar:**
   * `created_at_utc DATETIME NOT NULL`: Fecha de creación en formato UTC.
   * `updated_at_utc DATETIME NULL`: Fecha de última modificación.
   * `is_deleted BOOLEAN NOT NULL DEFAULT FALSE`: Indicador de borrado lógico (Soft Delete).
   * `deleted_at_utc DATETIME NULL`: Fecha de eliminación lógica.
3. **Estrategia de Índices:**
   * Índices B-Tree únicos sobre `uuid`, `code` y `email`.
   * Índices compuestos en `document_instances(entity_uuid, entity_type)` para optimizar las consultas del orquestador documental.
   * Índices en `audit_logs(entity_uuid, timestamp_utc)` para la generación de trazas de auditoría de portafolio docente.
