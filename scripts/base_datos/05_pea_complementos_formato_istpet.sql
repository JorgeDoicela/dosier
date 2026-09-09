-- =============================================================================
-- PROYECTO: DOSIER - ISTPET (Acreditación y Portafolio Docente)
-- SCRIPT 05: Complementos del formato oficial PEA del ISTPET
-- DESCRIPCIÓN: Crea las tablas relacionales para las secciones estructuradas
--              c) Prerrequisitos e i) Evaluación del aprendizaje oficial ISTPET.
-- =============================================================================

USE sigafi_es;

-- -----------------------------------------------------------------------------
-- Sección c) Prerrequisitos de la asignatura
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doc_pea_prerrequisitos (
    idPrerequisito      INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                VARCHAR(36)     NOT NULL UNIQUE,
    idPea               INT             NOT NULL,
    idAsignaturaOrigen  INT(11)         NULL COMMENT 'Vínculo a asignaturas SIGAFI si aplica',
    codigoAsignatura    VARCHAR(50)     NULL COMMENT 'Código snapshot de la asignatura',
    nombreAsignatura    VARCHAR(255)    NOT NULL COMMENT 'Nombre de la asignatura prerrequisito',
    observacion         TEXT            NULL COMMENT 'Condición u observación pedagógica',
    orden               INT             NOT NULL DEFAULT 1,
    INDEX idx_prerreq_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idAsignaturaOrigen) REFERENCES asignaturas(idAsignatura) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Prerrequisitos de la asignatura — Sección c) del PEA oficial ISTPET';

DELIMITER $$
CREATE TRIGGER trg_doc_pea_prerrequisitos_uuid BEFORE INSERT ON doc_pea_prerrequisitos FOR EACH ROW
BEGIN
    IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
        SET NEW.uuid = UUID();
    END IF;
END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- Sección i) Evaluación del aprendizaje oficial (3 componentes estándar ISTPET)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doc_pea_evaluaciones (
    idEvaluacion        INT             AUTO_INCREMENT PRIMARY KEY,
    uuid                VARCHAR(36)     NOT NULL UNIQUE,
    idPea               INT             NOT NULL,
    denominacion        VARCHAR(100)    NOT NULL COMMENT 'Nota parcial 1, Nota parcial 2, Evaluación final',
    tipoEvaluacion      TEXT            NOT NULL COMMENT 'Descripción y componentes formativos / sumativos evaluados',
    calificacionMaxima  DECIMAL(4,1)    NOT NULL DEFAULT 10.0 COMMENT 'Calificación máxima sobre 10.0',
    orden               INT             NOT NULL DEFAULT 1,
    INDEX idx_eval_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Evaluación del aprendizaje estructurada — Sección i) del PEA oficial ISTPET';

DELIMITER $$
CREATE TRIGGER trg_doc_pea_evaluaciones_uuid BEFORE INSERT ON doc_pea_evaluaciones FOR EACH ROW
BEGIN
    IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
        SET NEW.uuid = UUID();
    END IF;
END$$
DELIMITER ;
