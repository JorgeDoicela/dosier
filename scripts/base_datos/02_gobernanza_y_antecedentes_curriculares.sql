-- =============================================================================
-- DOSIER: GOBERNANZA Y ANTECEDENTES CURRICULARES INSTITUCIONALES
-- 1. Normativas Externas (CES, CACES, SENESCYT) - Consulta inalterable
-- 2. Artículos y Lineamientos para Checklist Activo
-- 3. Modelo Educativo Institucional (Versiones y Vigencia)
-- 4. Proyectos de Carrera Aprobados por CES
-- 5. Perfiles de Egreso y Resultados de Aprendizaje del Perfil (RDA Carrera)
-- 6. Matriz de Tributación Curricular (Asignatura -> Resultados del Perfil)
-- 7. Expedientes Curriculares Oficiales (Contenedor Maestro por Asignación)
-- Base de datos: sigafi_es | Motor: MySQL 8.0+ / MariaDB 10.5+ | Prefijo: 'doc_'
-- =============================================================================

USE sigafi_es;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- -----------------------------------------------------------------------------
-- LIMPIEZA PREVIA DE TABLAS DE GOBERNANZA
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_doc_normativas_uuid;
DROP TRIGGER IF EXISTS trg_doc_normativa_articulos_uuid;
DROP TRIGGER IF EXISTS trg_doc_modelos_educativos_uuid;
DROP TRIGGER IF EXISTS trg_doc_proyectos_curriculares_uuid;
DROP TRIGGER IF EXISTS trg_doc_perfiles_egreso_uuid;
DROP TRIGGER IF EXISTS trg_doc_perfil_egreso_res_uuid;
DROP TRIGGER IF EXISTS trg_doc_expedientes_curriculares_uuid;

DROP TABLE IF EXISTS
    doc_expediente_asignaciones,
    doc_asignatura_resultado_perfil,
    doc_perfil_egreso_resultados,
    doc_perfiles_egreso,
    doc_expedientes_curriculares,
    doc_proyectos_curriculares,
    doc_modelos_educativos,
    doc_normativa_articulos,
    doc_normativas;

-- =============================================================================
-- 1. CAPA DE NORMATIVAS EXTERNAS (CONSULTA Y REFERENCIA INALTERABLE)
-- =============================================================================

CREATE TABLE doc_normativas (
    idNormativa             INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    organismoEmisor         ENUM('CES', 'CACES', 'SENESCYT', 'MINEDUC', 'OTRO') NOT NULL DEFAULT 'CACES',
    tipoNormativa           VARCHAR(100)    NOT NULL COMMENT 'Reglamento, Resolución, Guía Metodológica, Modelo de Evaluación',
    codigoResolucion        VARCHAR(100)    NOT NULL COMMENT 'Ej: RPC-SO-013-No.111-2022',
    titulo                  VARCHAR(500)    NOT NULL,
    descripcion             TEXT            NULL,
    fechaEmision            DATE            NULL,
    fechaVigencia           DATE            NULL,
    archivoUrl              VARCHAR(512)    NULL COMMENT 'Enlace o ruta de almacenamiento seguro al PDF oficial',
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    fechaRegistro           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_normativa_emisor (organismoEmisor, activo),
    INDEX idx_normativa_codigo (codigoResolucion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Repositorio inalterable de normativas externas reguladoras';

DELIMITER $$
CREATE TRIGGER trg_doc_normativas_uuid BEFORE INSERT ON doc_normativas FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- Artículos y lineamientos específicos para la lista de verificación activa
CREATE TABLE doc_normativa_articulos (
    idArticulo              INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idNormativa             INT             NOT NULL,
    numeroArticulo          VARCHAR(50)     NOT NULL COMMENT 'Ej: Art. 24, Criterio 2.1, Estándar 4',
    titulo                  VARCHAR(255)    NULL,
    contenido               TEXT            NOT NULL,
    requisitoCurricular     TEXT            NULL COMMENT 'Orientación concreta para el checklist del PEA / Sílabo',
    orden                   INT             NOT NULL DEFAULT 1,
    
    INDEX idx_articulo_normativa (idNormativa),
    FOREIGN KEY (idNormativa) REFERENCES doc_normativas(idNormativa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Desglose de artículos normativos para auditoría y validación';

DELIMITER $$
CREATE TRIGGER trg_doc_normativa_articulos_uuid BEFORE INSERT ON doc_normativa_articulos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- =============================================================================
-- 2. CAPA DE GOBIERNO INSTITUCIONAL: MODELOS EDUCATIVOS Y POLÍTICAS
-- =============================================================================

CREATE TABLE doc_modelos_educativos (
    idModelo                INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    codigo                  VARCHAR(50)     NOT NULL UNIQUE COMMENT 'Ej: MED-ISTPET-2024',
    nombre                  VARCHAR(255)    NOT NULL,
    version                 VARCHAR(20)     NOT NULL DEFAULT '1.0',
    resolucionAprobacion    VARCHAR(150)    NULL COMMENT 'Resolución del Órgano Colegiado Superior o Rectorado',
    descripcion             TEXT            NULL,
    fechaVigenciaDesde      DATE            NOT NULL,
    fechaVigenciaHasta      DATE            NULL,
    archivoUrl              VARCHAR(512)    NULL,
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    fechaRegistro           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Versiones históricas y vigentes del Modelo Educativo Institucional';

DELIMITER $$
CREATE TRIGGER trg_doc_modelos_educativos_uuid BEFORE INSERT ON doc_modelos_educativos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- =============================================================================
-- 3. CAPA DE DISEÑO CURRICULAR DE CARRERAS Y PERFILES DE EGRESO
-- =============================================================================

-- Proyecto curricular aprobado de carrera (Resolución CES / Rediseño)
CREATE TABLE doc_proyectos_curriculares (
    idProyectoCurricular    INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idCarrera               INT(11)         NOT NULL,
    idMalla                 INT(11)         NOT NULL,
    codigoResolucionCes     VARCHAR(100)    NULL COMMENT 'Resolución de aprobación o rediseño CES',
    nombreProyecto          VARCHAR(255)    NOT NULL,
    version                 VARCHAR(20)     NOT NULL DEFAULT '1.0',
    fechaAprobacion         DATE            NULL,
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    fechaRegistro           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_proy_carrera_malla (idCarrera, idMalla),
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idMalla) REFERENCES mallas(idMalla) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Proyectos y resoluciones CES de aprobación y rediseño de carreras';

DELIMITER $$
CREATE TRIGGER trg_doc_proyectos_curriculares_uuid BEFORE INSERT ON doc_proyectos_curriculares FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- Perfil de egreso oficial de la carrera
CREATE TABLE doc_perfiles_egreso (
    idPerfilEgreso          INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idCarrera               INT(11)         NOT NULL,
    idMalla                 INT(11)         NOT NULL,
    version                 VARCHAR(20)     NOT NULL DEFAULT '1.0',
    descripcionGeneral      TEXT            NOT NULL,
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    fechaRegistro           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_perfil_carrera_malla (idCarrera, idMalla),
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idMalla) REFERENCES mallas(idMalla) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Perfil de egreso institucional formal por carrera y malla';

DELIMITER $$
CREATE TRIGGER trg_doc_perfiles_egreso_uuid BEFORE INSERT ON doc_perfiles_egreso FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- Resultados de Aprendizaje del Perfil de Egreso (RDA Carrera - Administrados centralmente)
CREATE TABLE doc_perfil_egreso_resultados (
    idResultadoPerfil       INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPerfilEgreso          INT             NOT NULL,
    codigo                  VARCHAR(50)     NOT NULL COMMENT 'Ej: RDA-SOF-01',
    descripcion             TEXT            NOT NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    
    INDEX idx_res_perfil (idPerfilEgreso),
    FOREIGN KEY (idPerfilEgreso) REFERENCES doc_perfiles_egreso(idPerfilEgreso) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Resultados de aprendizaje del perfil de egreso (RDA oficiales de carrera)';

DELIMITER $$
CREATE TRIGGER trg_doc_perfil_egreso_res_uuid BEFORE INSERT ON doc_perfil_egreso_resultados FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- Matriz de tributación curricular: qué asignaturas tributan a qué resultados del perfil
CREATE TABLE doc_asignatura_resultado_perfil (
    idRelacion              INT             AUTO_INCREMENT PRIMARY KEY,
    idAsignatura            INT(11)         NOT NULL,
    idMalla                 INT(11)         NOT NULL,
    idResultadoPerfil       INT             NOT NULL,
    nivelAporte             ENUM('Introductorio', 'Medio', 'Avanzado') NOT NULL DEFAULT 'Medio',
    
    INDEX idx_asig_malla_res (idAsignatura, idMalla, idResultadoPerfil),
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura) ON DELETE RESTRICT,
    FOREIGN KEY (idMalla) REFERENCES mallas(idMalla) ON DELETE RESTRICT,
    FOREIGN KEY (idResultadoPerfil) REFERENCES doc_perfil_egreso_resultados(idResultadoPerfil) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Matriz institucional de articulación entre asignaturas y perfil de egreso';

-- =============================================================================
-- 4. CAPA DE GESTIÓN: EL EXPEDIENTE CURRICULAR INSTITUCIONAL
-- =============================================================================

CREATE TABLE doc_expedientes_curriculares (
    idExpediente            INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    codigoExpediente        VARCHAR(100)    NULL COMMENT 'Ej: EXP-2025-SOF-P01-PROG1',
    idAsignacion            INT(11)         NULL COMMENT 'Origen oficial desde asignaciones_profesores SIGAFI',
    idPeriodo               CHAR(7)         CHARACTER SET latin1 NOT NULL,
    idCarrera               INT(11)         NOT NULL,
    idMalla                 INT(11)         NULL,
    idDetalleMalla          INT(11)         NULL,
    idAsignatura            INT(11)         NOT NULL,
    idNivel                 INT(11)         NULL,
    idModalidad             INT(11)         NULL,
    idSeccion               INT(11)         NULL,
    paralelo                VARCHAR(20)     NULL,
    idDocenteResponsable    VARCHAR(20)     NULL,
    idProyectoCurricular    INT             NULL COMMENT 'Vínculo al proyecto de carrera aprobado por CES',
    idPerfilEgreso          INT             NULL,
    idModeloEducativo       INT             NULL,
    estadoGeneral           ENUM('Abierto', 'EnRevision', 'Aprobado', 'Cerrado') NOT NULL DEFAULT 'Abierto',
    snapshotCurricularJson  JSON            NULL COMMENT 'Snapshot oficial congelado con contexto académico',
    fechaApertura           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaCierre             DATETIME        NULL,
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    
    INDEX idx_exp_periodo_asig (idPeriodo, idAsignatura),
    INDEX idx_exp_asignacion (idAsignacion),
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura) ON DELETE RESTRICT,
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo) ON DELETE RESTRICT,
    FOREIGN KEY (idProyectoCurricular) REFERENCES doc_proyectos_curriculares(idProyectoCurricular) ON DELETE SET NULL,
    FOREIGN KEY (idPerfilEgreso) REFERENCES doc_perfiles_egreso(idPerfilEgreso) ON DELETE SET NULL,
    FOREIGN KEY (idModeloEducativo) REFERENCES doc_modelos_educativos(idModelo) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Expediente Curricular Maestro: Agrupador oficial de PEA, Sílabo y Guías';

DELIMITER $$
CREATE TRIGGER trg_doc_expedientes_curriculares_uuid BEFORE INSERT ON doc_expedientes_curriculares FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- Mapeo de asignaciones docentes y paralelos al expediente de cátedra (Cátedra Compartida)
CREATE TABLE doc_expediente_asignaciones (
    idExpediente            INT             NOT NULL,
    idAsignacion            INT(11)         NOT NULL,
    esDocenteLider          TINYINT(1)      NOT NULL DEFAULT 0,
    fechaAsignacion         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idExpediente, idAsignacion),
    INDEX idx_exp_asig_id (idAsignacion),
    FOREIGN KEY (idExpediente) REFERENCES doc_expedientes_curriculares(idExpediente) ON DELETE CASCADE,
    FOREIGN KEY (idAsignacion) REFERENCES asignaciones_profesores(idAsignacion) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Mapeo de asignaciones docentes y paralelos al expediente de la cátedra';

-- =============================================================================
-- 5. SEMILLAS BASE: NORMAS SUPERIORES Y MODELO EDUCATIVO OFICIAL
-- =============================================================================

INSERT INTO doc_normativas (uuid, organismoEmisor, tipoNormativa, codigoResolucion, titulo, fechaEmision, fechaVigencia, activo) VALUES
(
    UUID(),
    'CES',
    'Reglamento',
    'RPC-SE-08-No.023-2022',
    'Reglamento de Régimen Académico',
    '2022-04-27',
    '2022-05-01',
    1
),
(
    UUID(),
    'CACES',
    'Modelo de Evaluación',
    'M-A-IST-2024',
    'Modelo de Evaluación Externa para Institutos Superiores Técnicos y Tecnológicos',
    '2024-03-15',
    '2024-06-01',
    1
);

-- Artículos clave para el checklist del PEA
SET @idNormativaCes = (SELECT idNormativa FROM doc_normativas WHERE codigoResolucion = 'RPC-SE-08-No.023-2022' LIMIT 1);

INSERT INTO doc_normativa_articulos (uuid, idNormativa, numeroArticulo, titulo, contenido, requisitoCurricular, orden) VALUES
(
    UUID(),
    @idNormativaCes,
    'Art. 21',
    'Componentes del Aprendizaje',
    'La organización del aprendizaje se estructura en tres componentes: Docencia (CD), Prácticas de aplicación y experimentación de los aprendizajes (APE), y Aprendizaje autónomo (AA).',
    'El PEA debe desglosar explícitamente las horas en CD, APE y AA, garantizando que su suma sea exactamente igual al total curricular.',
    1
),
(
    UUID(),
    @idNormativaCes,
    'Art. 27',
    'Planificación Microcurricular',
    'Cada cátedra debe contar con una planificación microcurricular que articule los contenidos, estrategias metodológicas, resultados de aprendizaje y mecanismos de evaluación.',
    'Verificar la coherencia interna entre unidades temáticas, actividades prácticas y ponderaciones evaluativas.',
    2
);

-- Semilla de Modelo Educativo Institucional
-- Inactivo (activo = 0) provisionalmente hasta verificar resolución oficial con secretaría del ISTPET
INSERT INTO doc_modelos_educativos (uuid, codigo, nombre, version, resolucionAprobacion, fechaVigenciaDesde, activo) VALUES
(
    UUID(),
    'MED-ISTPET-2024',
    'Modelo Educativo Pedagógico Institucional ISTPET (Pendiente verificación)',
    '2.0',
    'RES-OCS-2024-004',
    '2024-01-01',
    0
);

SET FOREIGN_KEY_CHECKS = 1;
