-- =============================================================================
-- DOSIER: ARQUITECTURA OFICIAL DEL PROGRAMA DE ESTUDIO DE LA ASIGNATURA (PEA)
-- Formato oficial institucional normalizado (Secciones a - k)
-- Base de datos: sigafi_es | Motor: MySQL 8.0+ / MariaDB 10.5+ | Prefijo: 'doc_'
-- =============================================================================

USE sigafi_es;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- -----------------------------------------------------------------------------
-- 1. LIMPIEZA CONTROLADA DE TABLAS DEL PEA Y WORKFLOW
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_doc_pea_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_unidades_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_temas_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_rda_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_practicas_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_biblio_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_observaciones_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_trazabilidad_uuid;

DROP TABLE IF EXISTS
    doc_pea_trazabilidad,
    doc_pea_observaciones,
    doc_pea_bibliografia,
    doc_pea_actividades_practicas,
    doc_pea_resultados_aprendizaje,
    doc_pea_temas,
    doc_pea_unidades,
    doc_pea;

-- =============================================================================
-- NÚCLEO CURRICULAR: PEA (PROGRAMA DE ESTUDIO DE LA ASIGNATURA)
-- =============================================================================

CREATE TABLE doc_pea (
    idPea                   INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idExpediente            INT             NULL COMMENT 'Vínculo al expediente curricular maestro',
    idCarrera               INT(11)         NOT NULL,
    idAsignatura            INT(11)         NOT NULL,
    idPeriodo               CHAR(7)         CHARACTER SET latin1 NOT NULL,
    idAsignacion            INT(11)         NULL COMMENT 'Vínculo oficial a distributivo docente SIGAFI',
    idMalla                 INT(11)         NULL,
    idDetalleMalla          INT(11)         NULL,
    idNivel                 INT(11)         NULL,
    idModalidad             INT(11)         NULL,
    idSeccion               INT(11)         NULL,
    paralelo                VARCHAR(20)     NULL,
    fuenteMalla             VARCHAR(40)     NULL,
    snapshotCurricularJson  JSON            NULL COMMENT 'Snapshot inmutable de asignación, prerrequisitos y créditos',
    idDocenteElaborador     VARCHAR(20)     NULL,
    modalidad               VARCHAR(50)     NOT NULL DEFAULT 'Presencial',
    unidadOrganizacion      VARCHAR(100)    NULL,
    semestreNivel           VARCHAR(20)     NULL,
    totalHorasAsignatura    INT             NOT NULL DEFAULT 0,
    creditos                DECIMAL(4,2)    NOT NULL DEFAULT 0.00,
    
    -- Componentes pedagógicos globales (Sección a)
    horasContactoDocente    INT             NOT NULL DEFAULT 0 COMMENT 'CD - Contacto Docente',
    horasPracticoExperimental INT           NOT NULL DEFAULT 0 COMMENT 'APE - Práctico Experimental',
    horasAutonomo           INT             NOT NULL DEFAULT 0 COMMENT 'AA - Aprendizaje Autónomo',
    
    -- Secciones descriptivas pedagógicas
    objetivoAsignatura      TEXT            NULL COMMENT 'Sección b) Objetivo de la asignatura',
    metodologiaEnsenanza    TEXT            NULL COMMENT 'Sección g) Estrategias metodológicas',
    recursosDidacticos      TEXT            NULL COMMENT 'Sección g) Recursos didácticos e informatización',
    evaluacionAprendizaje   TEXT            NULL COMMENT 'Sección i) Evaluación del aprendizaje y ponderaciones',
    
    estado                  ENUM('Borrador', 'EnRevision', 'Observado', 'Corregido', 'Aprobado', 'Publicado', 'Rechazado') NOT NULL DEFAULT 'Borrador',
    version                 INT             NOT NULL DEFAULT 1,
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    fechaCreacion           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaModificacion       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Firmas institucionales de responsabilidad (Sección k — Ley 67 Ecuador)
    firmaElaboradoDocente   VARCHAR(255)    NULL COMMENT 'Código oficial DFRM de firma digital (Ley 67) del Docente Elaborador',
    fechaElaborado          DATETIME        NULL,
    firmaRevisadoCoord      VARCHAR(255)    NULL COMMENT 'Código oficial DFRM de firma digital (Ley 67) del Coordinador de Carrera',
    fechaRevisadoCoord      DATETIME        NULL,
    firmaRevisadoAcad       VARCHAR(255)    NULL COMMENT 'Código oficial DFRM de firma digital (Ley 67) de la Comisión Académica',
    fechaRevisadoAcad       DATETIME        NULL,
    firmaAprobadoVicerrector VARCHAR(255)   NULL COMMENT 'Código oficial DFRM de firma digital (Ley 67) del Vicerrector Académico',
    fechaAprobado           DATETIME        NULL,
    
    INDEX idx_pea_carrera_asig (idCarrera, idAsignatura, idPeriodo),
    INDEX idx_pea_asignacion_version (idAsignacion, version),
    INDEX idx_pea_expediente (idExpediente),
    FOREIGN KEY (idExpediente) REFERENCES doc_expedientes_curriculares(idExpediente) ON DELETE SET NULL,
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura) ON DELETE RESTRICT,
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='PEA — Programa de Estudio de la Asignatura Oficial';

DELIMITER $$
CREATE TRIGGER trg_doc_pea_uuid BEFORE INSERT ON doc_pea FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- Sección f) Contenidos de enseñanza: Unidades de estudio
-- -----------------------------------------------------------------------------
CREATE TABLE doc_pea_unidades (
    idUnidad                INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPea                   INT             NOT NULL,
    numeroUnidad            INT             NOT NULL,
    nombreUnidad            VARCHAR(255)    NOT NULL,
    totalHorasUnidad        INT             NOT NULL DEFAULT 0,
    horasDocencia           INT             NOT NULL DEFAULT 0,
    horasPracticoExp        INT             NOT NULL DEFAULT 0,
    horasAutonomo           INT             NOT NULL DEFAULT 0,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_unidad_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_pea_unidades_uuid BEFORE INSERT ON doc_pea_unidades FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- Sección f) Contenidos de enseñanza: Temas y subtemas por unidad
-- -----------------------------------------------------------------------------
CREATE TABLE doc_pea_temas (
    idTema                  INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idUnidad                INT             NOT NULL,
    numeroTema              INT             NOT NULL,
    tituloTema              VARCHAR(255)    NOT NULL,
    descripcionSubtemas     TEXT            NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_tema_unidad (idUnidad),
    FOREIGN KEY (idUnidad) REFERENCES doc_pea_unidades(idUnidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_pea_temas_uuid BEFORE INSERT ON doc_pea_temas FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- Secciones d y e) Resultados de aprendizaje (Carrera y Asignatura)
-- -----------------------------------------------------------------------------
CREATE TABLE doc_pea_resultados_aprendizaje (
    idRda                   INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPea                   INT             NOT NULL,
    tipoRda                 ENUM('Carrera', 'Asignatura') NOT NULL DEFAULT 'Asignatura',
    codigoRda               VARCHAR(20)     NULL,
    descripcion             TEXT            NOT NULL,
    nivelDesarrollo         ENUM('Inicial', 'Medio', 'Alto') NOT NULL DEFAULT 'Medio',
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_rda_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_pea_rda_uuid BEFORE INSERT ON doc_pea_resultados_aprendizaje FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- Sección h) Actividades prácticas
-- -----------------------------------------------------------------------------
CREATE TABLE doc_pea_actividades_practicas (
    idPractica              INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPea                   INT             NOT NULL,
    idUnidad                INT             NULL,
    numeroPractica          INT             NOT NULL,
    nombrePractica          VARCHAR(255)    NOT NULL,
    caracterizacion         TEXT            NULL,
    duracionHoras           INT             NOT NULL DEFAULT 2,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_practica_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idUnidad) REFERENCES doc_pea_unidades(idUnidad) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_pea_practicas_uuid BEFORE INSERT ON doc_pea_actividades_practicas FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- Sección j) Bibliografía (Básica, Consulta, Virtual)
-- -----------------------------------------------------------------------------
CREATE TABLE doc_pea_bibliografia (
    idBiblio                INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPea                   INT             NOT NULL,
    tipoBibliografia        ENUM('Basica', 'Consulta', 'Virtual') NOT NULL DEFAULT 'Basica',
    autor                   VARCHAR(255)    NULL,
    anio                    INT             NULL,
    tituloLibro             VARCHAR(500)    NOT NULL,
    editorialCiudad         VARCHAR(255)    NULL,
    isbn                    VARCHAR(50)     NULL,
    urlRecurso              VARCHAR(512)    NULL,
    citaCompletaApa         TEXT            NOT NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_biblio_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_pea_biblio_uuid BEFORE INSERT ON doc_pea_bibliografia FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- =============================================================================
-- WORKFLOW INSTITUCIONAL: OBSERVACIONES Y TRAZABILIDAD DEL PEA
-- =============================================================================

-- Bandeja de observaciones emitidas por Coordinación / Comisión
CREATE TABLE doc_pea_observaciones (
    idObservacion           INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPea                   INT             NOT NULL,
    idUsuarioObservador     INT(11)         NULL,
    rolObservador           VARCHAR(50)     NOT NULL DEFAULT 'CoordinadorCarrera',
    seccionAfectada         VARCHAR(100)    NOT NULL COMMENT 'Objetivo, Unidades, Metodologia, Evaluacion, Bibliografia, etc.',
    textoObservacion        TEXT            NOT NULL,
    estado                  ENUM('Pendiente', 'Subsanada', 'Desestimada') NOT NULL DEFAULT 'Pendiente',
    respuestaDocente        TEXT            NULL,
    fechaObservacion        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaResolucion         DATETIME        NULL,
    
    INDEX idx_obs_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idUsuarioObservador) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Observaciones formales emitidas durante la revisión del PEA';

DELIMITER $$
CREATE TRIGGER trg_doc_pea_observaciones_uuid BEFORE INSERT ON doc_pea_observaciones FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- Historial inmutable de trazabilidad de estados y auditoría
CREATE TABLE doc_pea_trazabilidad (
    idTrazabilidad          INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPea                   INT             NOT NULL,
    idUsuario               INT(11)         NULL,
    estadoAnterior          VARCHAR(50)     NOT NULL,
    estadoNuevo             VARCHAR(50)     NOT NULL,
    motivo                  TEXT            NULL,
    hashIntegridadSha256    VARCHAR(64)     NULL COMMENT 'Hash SHA-256 de la versión en el momento de la transición',
    fechaTransicion         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_traza_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Trazabilidad y auditoría cronológica del ciclo de vida del PEA';

DELIMITER $$
CREATE TRIGGER trg_doc_pea_trazabilidad_uuid BEFORE INSERT ON doc_pea_trazabilidad FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
