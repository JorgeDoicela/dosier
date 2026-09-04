-- DOSIER - Contexto academico institucional del PEA
-- Migracion aditiva. No modifica tablas institucionales de SIGAFI.

ALTER TABLE `doc_pea`
    ADD COLUMN `idAsignacion` INT(11) NULL AFTER `idPeriodo`,
    ADD COLUMN `idMalla` INT(11) NULL AFTER `idAsignacion`,
    ADD COLUMN `idDetalleMalla` INT(11) NULL AFTER `idMalla`,
    ADD COLUMN `idNivel` INT(11) NULL AFTER `idDetalleMalla`,
    ADD COLUMN `idModalidad` INT(11) NULL AFTER `idNivel`,
    ADD COLUMN `idSeccion` INT(11) NULL AFTER `idModalidad`,
    ADD COLUMN `paralelo` VARCHAR(20) NULL AFTER `idSeccion`,
    ADD COLUMN `fuenteMalla` VARCHAR(40) NULL AFTER `paralelo`,
    ADD COLUMN `snapshotCurricularJson` JSON NULL AFTER `fuenteMalla`,
    ADD INDEX `idx_pea_asignacion_version` (`idAsignacion`, `version`);
