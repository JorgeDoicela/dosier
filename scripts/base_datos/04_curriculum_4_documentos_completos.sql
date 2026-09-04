-- =============================================================================
-- DOSIER: ARQUITECTURA INTEGRAL DE LOS 4 DOCUMENTOS CURRICULARES ISTPET
-- 1. PEA (Programa de Estudio de la Asignatura)
-- 2. Plan Analítico o Sílabo (Matriz de 19 Semanas)
-- 3. Guías de Trabajo Práctico - Experimental (Guías APE)
-- 4. Guía de Estudio / Compendio Autónomo de la Asignatura
-- Base de datos: sigafi_es | Prefijo oficial: 'doc_'
-- =============================================================================

USE sigafi_es;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- -----------------------------------------------------------------------------
-- 1. LIMPIEZA CONTROLADA DE TABLAS CURRICULARES 'doc_'
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_doc_pea_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_unidades_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_temas_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_rda_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_practicas_uuid;
DROP TRIGGER IF EXISTS trg_doc_pea_biblio_uuid;

DROP TRIGGER IF EXISTS trg_doc_silabo_uuid;
DROP TRIGGER IF EXISTS trg_doc_silabo_semanas_uuid;
DROP TRIGGER IF EXISTS trg_doc_silabo_adapt_uuid;

DROP TRIGGER IF EXISTS trg_doc_guias_ape_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_ape_obj_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_ape_rda_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_ape_crit_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_ape_prep_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_ape_proc_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_ape_ref_uuid;

DROP TRIGGER IF EXISTS trg_doc_guias_estudio_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_estudio_uni_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_estudio_tem_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_estudio_sub_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_estudio_preg_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_estudio_glos_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_estudio_act_uuid;
DROP TRIGGER IF EXISTS trg_doc_guias_estudio_ref_uuid;

DROP TABLE IF EXISTS
    doc_guias_estudio_referencias,
    doc_guias_estudio_actividades,
    doc_guias_estudio_glosario,
    doc_guias_estudio_preguntas_guia,
    doc_guias_estudio_subtemas,
    doc_guias_estudio_temas,
    doc_guias_estudio_unidades,
    doc_guias_estudio,
    doc_guias_ape_referencias,
    doc_guias_ape_procedimientos,
    doc_guias_ape_preparacion,
    doc_guias_ape_criterios_evaluacion,
    doc_guias_ape_rdas,
    doc_guias_ape_objetivos,
    doc_guias_ape,
    doc_silabo_adaptaciones,
    doc_silabo_semanas,
    doc_silabo,
    doc_pea_bibliografia,
    doc_pea_actividades_practicas,
    doc_pea_resultados_aprendizaje,
    doc_pea_temas,
    doc_pea_unidades,
    doc_pea;

-- =============================================================================
-- DOCUMENTO 1: PEA (PROGRAMA DE ESTUDIO DE LA ASIGNATURA)
-- =============================================================================

CREATE TABLE doc_pea (
    idPea                   INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idCarrera               INT(11)         NOT NULL,
    idAsignatura            INT(11)         NOT NULL,
    idPeriodo               CHAR(7)         CHARACTER SET latin1 NOT NULL,
    idDocenteElaborador     VARCHAR(20)     NULL,
    modalidad               VARCHAR(50)     NOT NULL DEFAULT 'Presencial',
    unidadOrganizacion      VARCHAR(100)    NULL,
    semestreNivel           VARCHAR(20)     NULL,
    totalHorasAsignatura    INT             NOT NULL DEFAULT 0,
    creditos                DECIMAL(4,2)    NOT NULL DEFAULT 0.00,
    
    -- Componentes pedagógicos globales
    horasContactoDocente    INT             NOT NULL DEFAULT 0 COMMENT 'CD',
    horasPracticoExperimental INT           NOT NULL DEFAULT 0 COMMENT 'APE',
    horasAutonomo           INT             NOT NULL DEFAULT 0 COMMENT 'AA',
    
    objetivoAsignatura      TEXT            NULL,
    metodologiaEnsenanza    TEXT            NULL,
    recursosDidacticos      TEXT            NULL,
    
    estado                  ENUM('Borrador', 'EnRevision', 'Aprobado', 'Rechazado') NOT NULL DEFAULT 'Borrador',
    version                 INT             NOT NULL DEFAULT 1,
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    fechaCreacion           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaModificacion       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Firmas institucionales
    firmaElaboradoDocente   VARCHAR(255)    NULL,
    fechaElaborado          DATETIME        NULL,
    firmaRevisadoCoord      VARCHAR(255)    NULL,
    fechaRevisadoCoord      DATETIME        NULL,
    firmaRevisadoAcad       VARCHAR(255)    NULL,
    fechaRevisadoAcad       DATETIME        NULL,
    firmaAprobadoVicerrector VARCHAR(255)   NULL,
    fechaAprobado           DATETIME        NULL,
    
    INDEX idx_pea_carrera_asig (idCarrera, idAsignatura, idPeriodo),
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura) ON DELETE RESTRICT,
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='PEA — Programa de Estudio de la Asignatura Oficial ISTPET';

DELIMITER $$
CREATE TRIGGER trg_doc_pea_uuid BEFORE INSERT ON doc_pea FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

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
-- DOCUMENTO 2: PLAN ANALÍTICO / SÍLABO (19 SEMANAS)
-- =============================================================================

CREATE TABLE doc_silabo (
    idSilabo                INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPea                   INT             NOT NULL,
    idPeriodo               CHAR(7)         CHARACTER SET latin1 NOT NULL,
    idDocenteResponsable    VARCHAR(20)     NULL,
    horarioTutoria          VARCHAR(255)    NULL,
    emailDocente            VARCHAR(150)    NULL,
    
    porcentajeDocencia      DECIMAL(5,2)    DEFAULT 40.00,
    porcentajePractico      DECIMAL(5,2)    DEFAULT 30.00,
    porcentajeAutonomo      DECIMAL(5,2)    DEFAULT 30.00,
    horasSemanaDocencia     DECIMAL(4,1)    DEFAULT 0.0,
    horasSemanaPractico     DECIMAL(4,1)    DEFAULT 0.0,
    horasSemanaAutonomo     DECIMAL(4,1)    DEFAULT 0.0,
    
    aplicaAdaptacion        TINYINT(1)      NOT NULL DEFAULT 0,
    detalleAdaptacion       TEXT            NULL,
    
    estado                  ENUM('Borrador', 'EnRevision', 'Aprobado', 'Rechazado') NOT NULL DEFAULT 'Borrador',
    version                 INT             NOT NULL DEFAULT 1,
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    fechaCreacion           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaModificacion       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    firmaElaboradoDocente   VARCHAR(255)    NULL,
    fechaElaborado          DATETIME        NULL,
    firmaRevisadoCoord      VARCHAR(255)    NULL,
    fechaRevisadoCoord      DATETIME        NULL,
    firmaAprobadoAcad       VARCHAR(255)    NULL,
    fechaAprobado           DATETIME        NULL,
    
    INDEX idx_silabo_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Sílabo / Plan Analítico Oficial ISTPET';

DELIMITER $$
CREATE TRIGGER trg_doc_silabo_uuid BEFORE INSERT ON doc_silabo FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_silabo_semanas (
    idSemana                INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idSilabo                INT             NOT NULL,
    numeroSemana            INT             NOT NULL COMMENT 'Semana 1 a 19',
    idUnidad                INT             NULL,
    contenidosTemas         TEXT            NOT NULL,
    docenciaMetodologia     TEXT            NULL,
    practicoExperimental   TEXT            NULL,
    actividadesAutonomas    TEXT            NULL,
    idRdaEvaluado           VARCHAR(100)    NULL,
    calificacionEvaluativa  VARCHAR(100)    NULL,
    esHitoEvaluativo        TINYINT(1)      NOT NULL DEFAULT 0 COMMENT 'Semana 9 (P1), 18 (P2), 19 (Final)',
    
    INDEX idx_semana_silabo (idSilabo),
    FOREIGN KEY (idSilabo) REFERENCES doc_silabo(idSilabo) ON DELETE CASCADE,
    FOREIGN KEY (idUnidad) REFERENCES doc_pea_unidades(idUnidad) ON DELETE SET NULL,
    UNIQUE KEY uk_silabo_semana (idSilabo, numeroSemana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_silabo_semanas_uuid BEFORE INSERT ON doc_silabo_semanas FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_silabo_adaptaciones (
    idAdaptacion            INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idSilabo                INT             NOT NULL,
    estudianteId            VARCHAR(20)     NULL,
    tipoNecesidad           VARCHAR(150)    NOT NULL,
    adaptacionAplicada      TEXT            NOT NULL,
    fechaRegistro           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_adapt_silabo (idSilabo),
    FOREIGN KEY (idSilabo) REFERENCES doc_silabo(idSilabo) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_silabo_adapt_uuid BEFORE INSERT ON doc_silabo_adaptaciones FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- =============================================================================
-- DOCUMENTO 3: GUÍAS DE TRABAJO PRÁCTICO - EXPERIMENTAL (GUÍAS APE)
-- =============================================================================

CREATE TABLE doc_guias_ape (
    idGuiaApe               INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPea                   INT             NOT NULL,
    idAsignatura            INT(11)         NOT NULL,
    idCarrera               INT(11)         NOT NULL,
    idPeriodo               CHAR(7)         CHARACTER SET latin1 NOT NULL,
    idDocente               VARCHAR(20)     NULL,
    
    -- Control documental oficial
    codigoFormato           VARCHAR(50)     NOT NULL DEFAULT 'IT-P03-F05',
    versionFormato          VARCHAR(20)     NOT NULL DEFAULT '01',
    fechaRevisionFormato    VARCHAR(50)     NULL,
    vigenciaFormato         VARCHAR(50)     NULL,
    
    -- Datos de la práctica
    fechaPractica           VARCHAR(100)    NULL,
    duracionHoras           INT             NOT NULL DEFAULT 2,
    duracionSemanas         INT             NOT NULL DEFAULT 1,
    nivelSemestre           VARCHAR(20)     NULL,
    paralelo                VARCHAR(20)     NULL,
    numeroPractica          INT             NOT NULL DEFAULT 1,
    tallerLaboratorio       VARCHAR(255)    NULL,
    tituloPractica          VARCHAR(500)    NOT NULL,
    
    -- Secciones pedagógicas estructuradas
    fundamentosTeoricos     TEXT            NULL COMMENT 'Fundamentos, descripción y relación con conocimientos',
    investigacionAutonoma   TEXT            NULL COMMENT 'Preguntas de investigación previa del estudiante',
    metodologiaDidactica    TEXT            NULL,
    normasSeguridad         TEXT            NULL,
    habilidadesBlandas      TEXT            NULL COMMENT 'Destrezas socioemocionales CACES',
    indicacionesEntrega     TEXT            NULL,
    
    estado                  ENUM('Borrador', 'EnRevision', 'Aprobado', 'Rechazado') NOT NULL DEFAULT 'Borrador',
    version                 INT             NOT NULL DEFAULT 1,
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    fechaCreacion           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaModificacion       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Firmas institucionales
    firmaElaboradoDocente   VARCHAR(255)    NULL,
    fechaElaborado          DATETIME        NULL,
    firmaRevisadoCoord      VARCHAR(255)    NULL,
    fechaRevisadoCoord      DATETIME        NULL,
    firmaAprobadoDocencia   VARCHAR(255)    NULL,
    fechaAprobado           DATETIME        NULL,
    
    INDEX idx_guia_pea (idPea),
    INDEX idx_guia_asig (idAsignatura, idPeriodo),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura) ON DELETE RESTRICT,
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Guía de Trabajo Práctico - Experimental Oficial ISTPET';

DELIMITER $$
CREATE TRIGGER trg_doc_guias_ape_uuid BEFORE INSERT ON doc_guias_ape FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_ape_objetivos (
    idObjetivo              INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaApe               INT             NOT NULL,
    descripcion             TEXT            NOT NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_obj_guia (idGuiaApe),
    FOREIGN KEY (idGuiaApe) REFERENCES doc_guias_ape(idGuiaApe) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_ape_obj_uuid BEFORE INSERT ON doc_guias_ape_objetivos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_ape_rdas (
    idGuiaRda               INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaApe               INT             NOT NULL,
    idRda                   INT             NULL,
    descripcionRda          TEXT            NOT NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_rda_guia (idGuiaApe),
    FOREIGN KEY (idGuiaApe) REFERENCES doc_guias_ape(idGuiaApe) ON DELETE CASCADE,
    FOREIGN KEY (idRda) REFERENCES doc_pea_resultados_aprendizaje(idRda) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_ape_rda_uuid BEFORE INSERT ON doc_guias_ape_rdas FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_ape_criterios_evaluacion (
    idCriterio              INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaApe               INT             NOT NULL,
    criterioEvaluacion      VARCHAR(255)    NOT NULL,
    puntaje                 DECIMAL(4,2)    NOT NULL DEFAULT 2.50,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_crit_guia (idGuiaApe),
    FOREIGN KEY (idGuiaApe) REFERENCES doc_guias_ape(idGuiaApe) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_ape_crit_uuid BEFORE INSERT ON doc_guias_ape_criterios_evaluacion FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_ape_preparacion (
    idPrep                  INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaApe               INT             NOT NULL,
    tipo                    ENUM('IndicacionPrevia', 'MaterialEquipo') NOT NULL DEFAULT 'IndicacionPrevia',
    descripcion             TEXT            NOT NULL,
    caracteristicasCantidad VARCHAR(255)    NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_prep_guia (idGuiaApe),
    FOREIGN KEY (idGuiaApe) REFERENCES doc_guias_ape(idGuiaApe) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_ape_prep_uuid BEFORE INSERT ON doc_guias_ape_preparacion FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_ape_procedimientos (
    idProcedimiento         INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaApe               INT             NOT NULL,
    numeroParte             INT             NOT NULL DEFAULT 1,
    nombreEtapa             VARCHAR(255)    NOT NULL,
    descripcionEtapa        TEXT            NULL,
    instruccionesDetalle    JSON            NULL COMMENT 'Array de pasos e instrucciones concretas',
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_proc_guia (idGuiaApe),
    FOREIGN KEY (idGuiaApe) REFERENCES doc_guias_ape(idGuiaApe) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_ape_proc_uuid BEFORE INSERT ON doc_guias_ape_procedimientos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_ape_referencias (
    idReferencia            INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaApe               INT             NOT NULL,
    citaApa                 TEXT            NOT NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_ref_guia (idGuiaApe),
    FOREIGN KEY (idGuiaApe) REFERENCES doc_guias_ape(idGuiaApe) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_ape_ref_uuid BEFORE INSERT ON doc_guias_ape_referencias FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- =============================================================================
-- DOCUMENTO 4: GUÍA DE ESTUDIO / COMPENDIO AUTÓNOMO DE LA ASIGNATURA
-- =============================================================================

CREATE TABLE doc_guias_estudio (
    idGuiaEstudio           INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idPea                   INT             NOT NULL,
    idAsignatura            INT(11)         NOT NULL,
    idCarrera               INT(11)         NOT NULL,
    idPeriodo               CHAR(7)         CHARACTER SET latin1 NOT NULL,
    idDocenteElaborador     VARCHAR(20)     NULL,
    encabezadoOficial       VARCHAR(255)    NULL,
    introduccionGeneral     TEXT            NULL,
    
    estado                  ENUM('Borrador', 'EnRevision', 'Aprobado', 'Rechazado') NOT NULL DEFAULT 'Borrador',
    version                 INT             NOT NULL DEFAULT 1,
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    fechaCreacion           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaModificacion       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Firmas institucionales
    firmaElaboradoDocente   VARCHAR(255)    NULL,
    fechaElaborado          DATETIME        NULL,
    firmaRevisadoCoord      VARCHAR(255)    NULL,
    fechaRevisadoCoord      DATETIME        NULL,
    firmaAprobadoAcad       VARCHAR(255)    NULL,
    fechaAprobado           DATETIME        NULL,
    
    INDEX idx_estudio_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura) ON DELETE RESTRICT,
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Guía de Estudio y Compendio Autónomo ISTPET';

DELIMITER $$
CREATE TRIGGER trg_doc_guias_estudio_uuid BEFORE INSERT ON doc_guias_estudio FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_estudio_unidades (
    idGuiaUnidad            INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaEstudio           INT             NOT NULL,
    numeroUnidad            INT             NOT NULL,
    nombreUnidad            VARCHAR(255)    NOT NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_uni_estudio (idGuiaEstudio),
    FOREIGN KEY (idGuiaEstudio) REFERENCES doc_guias_estudio(idGuiaEstudio) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_estudio_uni_uuid BEFORE INSERT ON doc_guias_estudio_unidades FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_estudio_temas (
    idGuiaTema              INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaUnidad            INT             NOT NULL,
    numeroTema              INT             NOT NULL,
    nombreTema              VARCHAR(255)    NOT NULL,
    contenidoDesarrollo     LONGTEXT        NULL,
    cuadrosApoyoJson        JSON            NULL COMMENT 'Cuadros comparativos estructurados',
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_tem_estudio (idGuiaUnidad),
    FOREIGN KEY (idGuiaUnidad) REFERENCES doc_guias_estudio_unidades(idGuiaUnidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_estudio_tem_uuid BEFORE INSERT ON doc_guias_estudio_temas FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_estudio_subtemas (
    idGuiaSubtema           INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaTema              INT             NOT NULL,
    numeroSubtema           VARCHAR(20)     NOT NULL COMMENT 'Ej: 1.1, 1.2, 2.1',
    tituloSubtema           VARCHAR(255)    NOT NULL,
    contenidoTeorico        LONGTEXT        NOT NULL,
    ejemplosCodigo          TEXT            NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_sub_estudio (idGuiaTema),
    FOREIGN KEY (idGuiaTema) REFERENCES doc_guias_estudio_temas(idGuiaTema) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_estudio_sub_uuid BEFORE INSERT ON doc_guias_estudio_subtemas FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_estudio_preguntas_guia (
    idPreguntaGuia          INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaUnidad            INT             NOT NULL,
    numeroPregunta          INT             NOT NULL COMMENT '1 a 11 por unidad',
    pregunta                TEXT            NOT NULL,
    respuestaDocente        TEXT            NOT NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_preg_estudio (idGuiaUnidad),
    FOREIGN KEY (idGuiaUnidad) REFERENCES doc_guias_estudio_unidades(idGuiaUnidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='11 Preguntas guía con respuestas de autoevaluación';

DELIMITER $$
CREATE TRIGGER trg_doc_guias_estudio_preg_uuid BEFORE INSERT ON doc_guias_estudio_preguntas_guia FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_estudio_glosario (
    idGlosario              INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaUnidad            INT             NOT NULL,
    termino                 VARCHAR(150)    NOT NULL,
    definicion              TEXT            NOT NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_glos_estudio (idGuiaUnidad),
    FOREIGN KEY (idGuiaUnidad) REFERENCES doc_guias_estudio_unidades(idGuiaUnidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='10 Términos de glosario por unidad';

DELIMITER $$
CREATE TRIGGER trg_doc_guias_estudio_glos_uuid BEFORE INSERT ON doc_guias_estudio_glosario FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_estudio_actividades (
    idActividad             INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaUnidad            INT             NOT NULL,
    codigoTabla             VARCHAR(50)     NULL COMMENT 'Ej: Tabla 1. Actividad P1',
    tituloActividad         VARCHAR(255)    NOT NULL,
    descripcionActividad    TEXT            NULL,
    tipoPracticaP           VARCHAR(50)     NULL COMMENT 'P1, P2, etc.',
    rubricaDetalleJson      JSON            NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_act_estudio (idGuiaUnidad),
    FOREIGN KEY (idGuiaUnidad) REFERENCES doc_guias_estudio_unidades(idGuiaUnidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Actividades en el aula virtual / fichas integradas';

DELIMITER $$
CREATE TRIGGER trg_doc_guias_estudio_act_uuid BEFORE INSERT ON doc_guias_estudio_actividades FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_guias_estudio_referencias (
    idGuiaRef               INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    idGuiaUnidad            INT             NOT NULL,
    referenciaCompletaApa   TEXT            NOT NULL,
    orden                   INT             NOT NULL DEFAULT 1,
    INDEX idx_ref_estudio (idGuiaUnidad),
    FOREIGN KEY (idGuiaUnidad) REFERENCES doc_guias_estudio_unidades(idGuiaUnidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_guias_estudio_ref_uuid BEFORE INSERT ON doc_guias_estudio_referencias FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
