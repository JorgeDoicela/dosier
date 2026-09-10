# Esquema Relacional de Base de Datos y Persistencia

## 1. Visión General del Modelo de Persistencia

La persistencia de DOSIER opera sobre el motor relacional **MariaDB 10.5+ / MySQL 8.0+** en el esquema de base de datos **`sigafi_es`** (puerto por defecto `3306`).

El sistema implementa una arquitectura híbrida de base de datos:
1. **Esquema Académico Institucional Preexistente (SIGAFI - Solo Lectura):** Contiene los catálogos maestros de carreras técnicas y tecnológicas, períodos académicos semestrales, mallas curriculares aprobadas, asignaturas con distribución horaria y la nómina docente institucional.
2. **Esquema de Gobernanza Curricular y Acreditación DOSIER (Lectura / Escritura):** Conjunto de tablas estructuradas mediante scripts DDL versionados que gestionan la formulación colaborativa del Programa de Estudio de la Asignatura (PEA), antecedentes curriculares, marcos normativos, firmas electrónicas, bitácora forense de auditoría y sincronización colaborativa en tiempo real.

El mapeo objeto-relacional (ORM) es administrado por **Entity Framework Core 9.0** mediante el conector oficial `Pomelo.EntityFrameworkCore.MySql`.

---

## 2. Diagrama de Arquitectura de Datos Híbrida

```mermaid
graph TD
    subgraph SIGAFI_ES_READONLY ["Esquema Preexistente SIGAFI (Solo Lectura)"]
        carreras["carreras\n(Filtro esInstituto = 1)"]
        periodos["periodos\n(PAO Semestral)"]
        mallas_periodos["mallas_periodos\n(Vigencia Malla)"]
        detallemallas["detallemallas\n(Asignaturas, Horas Docencia, APE, Autónomo)"]
        profesores["profesores\n(Cédula, Nombres, Correo)"]
        asignacion_materias["asignacion_materias\n(Docente - Asignatura - Período)"]
    end

    subgraph DOSIER_CURRICULAR ["Esquema Curricular DOSIER (Lectura / Escritura)"]
        cur_pea["cur_pea\n(Cabecera PEA, Estado, Hash SHA-256)"]
        cur_pea_secciones["cur_pea_seccion_b..k\n(10 Tablas Específicas por Sección A-K)"]
        cur_pea_colaboradores["cur_pea_colaboradores\n(Co-Redacción Docente)"]
        cur_pea_versiones["cur_pea_versiones\n(Historial e Inmutabilidad)"]
        cur_asignaturas_antecedentes["cur_asignaturas_antecedentes\n(Matriz de Coherencia Curricular)"]
        cur_proyectos_carrera["cur_proyectos_carrera\n(Gobernanza de Malla)"]
    end

    subgraph DOSIER_SEGURIDAD_AUDITORIA ["Seguridad RBAC y Auditoría Forense"]
        rbac_sistema["rbac_sistema\n(ID 6: DOSIER)"]
        rbac_rol["rbac_rol\n(DOSIER_ADMIN, DOSIER_DOCENTE, etc.)"]
        rbac_permisos["rbac_permisos\n(PEA:*, GOBERNANZA_CURRICULAR:*)"]
        audit_logs["audit_logs\n(Diff JSON Anterior/Posterior)"]
        document_instances["document_instances\n(Snapshot JSON, PDF, QR CACES)"]
        document_signatures["document_signatures\n(4 Firmas: Docente, Coord, Acad, Vicerrec)"]
        doc_cowork_documentos["doc_cowork_documentos\n(Persistencia HTML Yjs Delta)"]
    end

    carreras --> cur_proyectos_carrera
    detallemallas --> cur_pea
    detallemallas --> cur_asignaturas_antecedentes
    profesores --> cur_pea_colaboradores
    profesores --> document_signatures
    cur_pea --> cur_pea_secciones
    cur_pea --> document_instances
    document_instances --> document_signatures
```

---

## 3. Catálogo de Tablas del Sistema por Módulos

### 3.1. Tablas del Esquema SIGAFI (Solo Lectura)

* **`carreras`:** Registro institucional de carreras y programas formativos. DOSIER filtra estrictamente las carreras con `esInstituto = 1` para limitar el alcance al Instituto Superior Tecnológico Pedro Traversari.
* **`periodos`:** Períodos Académicos Ordinarios (PAO) con sus fechas de inicio, finalización y estado administrativo.
* **`mallas_periodos`:** Vinculación entre el período lectivo y la versión curricular aprobada por los organismos colegiados.
* **`detallemallas`:** Registro granular de asignaturas por nivel formativo. Define las horas oficiales de docencia (CD), aprendizaje práctico-experimental (APE) y trabajo autónomo (TA), sirviendo como regla de validación matemática inviolable para la planificación curricular.
* **`profesores`:** Catálogo del personal docente, identificadores únicos institucionales, títulos profesionales y correos electrónicos.
* **`asignacion_materias`:** Cruce entre el docente titular, el período lectivo y la asignatura asignada para la carga académica.

### 3.2. Tablas del Núcleo Base Documental y Forense (`01_sistema_base.sql`)

* **`document_templates` (`DocumentTemplate`):** Catálogo de plantillas oficiales emitidas por la institución (PEA oficial, Sílabos, Guías APE). Almacena el marcado HTML base y el esquema JSON de metadatos.
* **`document_instances` (`DocumentInstance`):** Instancia oficial de un documento curricular emitido. Almacena el snapshot congelado (`data_snapshot_json`), hash criptográfico SHA-256, ruta del archivo PDF firmado y código de verificación QR para acreditación CACES.
* **`document_signatures` (`DocumentSignature`):** Registro de las firmas electrónicas aplicadas a cada documento curricular. Almacena el identificador del firmante, rol curricular, certificado PKCS#12, marca de tiempo y estado de validación.
* **`audit_logs` (`AuditLog`):** Bitácora de auditoría forense inmutable. Cada transacción curricular genera un registro con el usuario, dirección IP, tipo de acción, entidad afectada y snapshots JSON del estado previo y posterior.
* **`doc_cowork_documentos` (`DocCoworkDocumento`):** Tabla de persistencia para la co-redacción concurrente en tiempo real mediante Yjs y CRDT. Guarda los estados intermedios en HTML de cada sección editada simultáneamente por los docentes.
* **`lopdp_consents` & `lopdp_arco_requests`:** Tablas de cumplimiento con la Ley Orgánica de Protección de Datos Personales del Ecuador para consentimientos informados y ejercicio de derechos ARCO.

### 3.3. Tablas de Gobernanza Curricular y Normativa (`02_gobernanza_y_antecedentes_curriculares.sql`)

* **`cur_normativas_externas`:** Repositorio de normativas de nivel superior (Ley Orgánica de Educación Superior - LOES, Reglamento de Régimen Académico del CES, Criterios de Evaluación CACES y lineamientos SENESCYT).
* **`cur_normativa_articulos`:** Artículos específicos y considerandos normativos vinculables a las decisiones curriculares.
* **`cur_modelos_educativos`:** Registro de las versiones del Modelo Educativo y Pedagógico Institucional del ISTPET.
* **`cur_proyectos_carrera`:** Proyectos de creación y rediseño de carreras aprobados por el Consejo de Educación Superior (CES), vinculando la carrera de SIGAFI con su fundamentación curricular.
* **`cur_proyectos_carrera_normativas`:** Tabla de articulación N:M entre los proyectos de carrera y las normativas externas vigentes.
* **`cur_asignaturas_antecedentes`:** Matriz curricular que detalla para cada asignatura de `detallemallas` su justificación epistemológica, problema pedagógico que resuelve, relación con el perfil de egreso y articulación metodológica.

### 3.4. Tablas del Programa de Estudio de la Asignatura Oficial (`03_curriculum_pea_oficial.sql`)

* **`cur_pea`:** Cabecera de la planificación del PEA. Almacena la relación con `detallemallas`, período académico, estado del workflow (`Borrador`, `EnRevision`, `RevisadoCoord`, `RevisadoAcad`, `Aprobado`), versión curricular, hash SHA-256 de inmutabilidad y marca de tiempo de bloqueo.
* **`cur_pea_seccion_b_datos`:** Datos generales de la asignatura, campo de formación, créditos, prerrequisitos y correquisitos sincronizados desde SIGAFI.
* **`cur_pea_seccion_c_objetivos`:** Objetivos de aprendizaje general y específicos de la asignatura articulados con la malla.
* **`cur_pea_seccion_d_competencias`:** Competencias genéricas y específicas que tributan al perfil de egreso del tecnólogo.
* **`cur_pea_seccion_e_resultados`:** Matriz de resultados de aprendizaje con niveles de logro (Inicial, Medio, Alto).
* **`cur_pea_seccion_f_contenidos`:** Estructura modular de unidades temáticas, subtemas, horas teóricas, horas prácticas y trabajo autónomo.
* **`cur_pea_seccion_g_metodologia`:** Estrategias metodológicas y técnicas didácticas de enseñanza-aprendizaje aplicadas.
* **`cur_pea_seccion_h_recursos`:** Recursos didácticos, software especializado, laboratorios, talleres y equipamiento requerido.
* **`cur_pea_seccion_i_evaluacion`:** Mecanismos de evaluación diagnóstica, formativa y sumativa con sus respectivas ponderaciones porcentuales reglamentarias.
* **`cur_pea_seccion_j_bibliografia`:** Referencias bibliográficas básicas y complementarias normalizadas bajo normas APA 7ma edición con validación de fondos físicos y virtuales.
* **`cur_pea_seccion_k_firmas`:** Circuito formal de 4 firmas: Elaborado (Docente/s), Revisado (Coordinador de Carrera), Verificado (Coordinador Académico) y Aprobado (Vicerrectorado).
* **`cur_pea_colaboradores`:** Nómina de docentes autores y co-autores asignados con permisos de co-redacción concurrente.
* **`cur_pea_versiones`:** Historial de versiones del PEA con almacenamiento de snapshot y trazabilidad de cambios por período lectivo.

### 3.5. Tablas de Seguridad RBAC Curricular (`04_seguridad_rbac_roles_curriculares.sql`)

* **`rbac_sistema`:** Registro de sistemas de la institución. DOSIER está formalizado con identificador primario `6` y detalle `"Gestión Curricular y Acreditación ISTPET"`.
* **`rbac_modulos`:** Módulos funcionales: `PEA`, `GOBERNANZA_CURRICULAR`, `AUDITORIA_CACES`, `CONFIGURACION`.
* **`rbac_rol`:** Catálogo de roles curriculares institucionales:
  1. `DOSIER_ADMIN` (ID: 32) - Administrador General del Sistema Curricular.
  2. `DOSIER_DOCENTE` (ID: 33) - Docente Autor y Co-Redactor de Planificación Curricular.
  3. `DOSIER_COORD_CARRERA` (ID: 34) - Coordinador de Carrera (Revisión Técnica y Aprobación Primaria).
  4. `DOSIER_COORD_ACAD` (ID: 35) - Coordinador Académico (Verificación Institucional).
  5. `DOSIER_VICERRECTOR` (ID: 36) - Vicerrectorado (Aprobación Definitiva e Inmutabilidad).
* **`rbac_permisos`:** Permisos granulares de acción sobre los módulos curriculares (`PEA:READ`, `PEA:WRITE`, `PEA:REVIEW`, `PEA:APPROVE`, `PEA:SIGN`, etc.).
* **`rbac_rol_permisos`:** Matriz de asociación N:M entre roles y permisos.
* **`rbac_usuario_rol`:** Asignación de docentes y directivos a los roles curriculares del sistema.

---

## 4. Convenciones de Columnas y Reglas de Integridad

1. **Claves Primarias:**
   * Tablas maestras de negocio DOSIER: `VARCHAR(36)` con identificadores únicos universales (UUID v4) generados a nivel de aplicación mediante `Guid.NewGuid()`.
   * Tablas de auditoría y relaciones transaccionales: `BIGINT AUTO_INCREMENT` o claves compuestas explícitas.
2. **Campos de Auditoría Estándar:**
   * `created_at_utc DATETIME NOT NULL`: Marca temporal de creación en tiempo universal coordinado.
   * `updated_at_utc DATETIME NULL`: Marca temporal de última modificación.
   * `is_deleted BOOLEAN NOT NULL DEFAULT FALSE`: Marcado para borrado lógico (Soft Delete).
   * `deleted_at_utc DATETIME NULL`: Fecha de eliminación lógica.
3. **Manejo de Cotejamiento y Collation:**
   * Las tablas preexistentes del esquema `sigafi_es` utilizan cotejamiento `latin1_swedish_ci`.
   * Las tablas curriculares de DOSIER utilizan `utf8mb4_unicode_ci` para soporte de caracteres extendidos, caracteres científicos y tildes en contenidos pedagógicos.
   * Para evitar errores 1267 de incompatibilidad en consultas que unen tablas de ambos esquemas, los controladores y servicios ejecutan conversiones explícitas (`CONVERT(col USING utf8mb4)`).
4. **Reglas de Integridad Referencial:**
   * No se aplican claves foráneas restrictivas directas hacia las tablas de SIGAFI (`carreras`, `detallemallas`, `profesores`) para evitar bloqueos transaccionales o fallos en cascada sobre el sistema académico principal. La consistencia se garantiza a través de la capa de dominio en EF Core y validaciones en los servicios de aplicación.
