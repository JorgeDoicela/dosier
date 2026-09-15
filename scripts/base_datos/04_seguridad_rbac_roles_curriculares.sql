-- =============================================================================
--  SISTEMA DOSIER - GOBERNANZA CURRICULAR Y GESTIÓN DOCUMENTAL (ISTPET)
--  Script 04: Configuración de Seguridad RBAC y Roles Curriculares Oficiales
--  Base de Datos: sigafi_es | Motor: MySQL 8.0+ / MariaDB 10.5+
-- =============================================================================

USE sigafi_es;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- -----------------------------------------------------------------------------
-- 1. REGISTRO / ACTUALIZACIÓN DEL SISTEMA 'DOSIER' (idSistema = 6)
--    Nota: rbac_sistema.detalle tiene restricción varchar(50)
-- -----------------------------------------------------------------------------
INSERT INTO rbac_sistema (idSistema, codigo, detalle)
SELECT 6, 'DOSIER', 'Gestión Curricular y Acreditación ISTPET'
WHERE NOT EXISTS (
    SELECT 1 FROM rbac_sistema WHERE idSistema = 6 OR CONVERT(codigo USING utf8mb4) = 'DOSIER'
);

UPDATE rbac_sistema 
SET codigo = 'DOSIER',
    detalle = 'Gestión Curricular y Acreditación ISTPET'
WHERE idSistema = 6 OR CONVERT(codigo USING utf8mb4) = 'DOSIER';

-- Definición robusta de variable de sesión para el sistema DOSIER
SET @idSistemaDosier = COALESCE(
    (SELECT idSistema FROM rbac_sistema WHERE CONVERT(codigo USING utf8mb4) = 'DOSIER' LIMIT 1),
    (SELECT idSistema FROM rbac_sistema WHERE idSistema = 6 LIMIT 1),
    6
);

-- -----------------------------------------------------------------------------
-- 2. LIMPIEZA DE PERMISOS PREVIOS DEL SISTEMA DOSIER (Evitar duplicidades)
-- -----------------------------------------------------------------------------
-- Eliminar asignaciones de operaciones a roles de DOSIER
DELETE rmo FROM rbac_rol_modulo_operacion rmo
JOIN rbac_modulos_operaciones mo ON rmo.idModulosOperaciones = mo.idModulosOperaciones
JOIN rbac_modulos m ON mo.idModulos = m.idModulos
WHERE m.id_sistema = @idSistemaDosier;

-- Eliminar relaciones módulo-operación de DOSIER
DELETE mo FROM rbac_modulos_operaciones mo
JOIN rbac_modulos m ON mo.idModulos = m.idModulos
WHERE m.id_sistema = @idSistemaDosier;

-- Eliminar módulos anteriores de DOSIER
DELETE FROM rbac_modulos 
WHERE id_sistema = @idSistemaDosier;

-- -----------------------------------------------------------------------------
-- 3. CATÁLOGO DE OPERACIONES ATÓMICAS (rbac_operaciones)
-- -----------------------------------------------------------------------------
INSERT INTO rbac_operaciones (NombreOperacion)
SELECT op FROM (
    SELECT 'ver' AS op UNION
    SELECT 'crear' UNION
    SELECT 'editar' UNION
    SELECT 'eliminar' UNION
    SELECT 'GESTIONAR' UNION
    SELECT 'REPORTES' UNION
    SELECT 'APROBAR' UNION
    SELECT 'ver-auditoria' UNION
    SELECT 'COWORK' UNION
    SELECT 'OBSERVAR' UNION
    SELECT 'SUBSANAR' UNION
    SELECT 'AVALAR_CARRERA' UNION
    SELECT 'AVALAR_ACADEMICO' UNION
    SELECT 'EXPORTAR_PDF'
) AS nuevas_ops
WHERE NOT EXISTS (
    SELECT 1 FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = LOWER(nuevas_ops.op)
);

-- -----------------------------------------------------------------------------
-- 4. ROLES CURRICULARES OFICIALES DEL ISTPET (rbac_rol)
--    Nota: rbac_rol.codigo_rol tiene restricción varchar(25)
-- -----------------------------------------------------------------------------
-- Rol 1: Administrador del Sistema / Calidad (12 chars)
INSERT INTO rbac_rol (Nombre, codigo_rol, esActivo)
SELECT 'Administrador DOSIER', 'DOSIER_ADMIN', 1
WHERE NOT EXISTS (SELECT 1 FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_ADMIN');

-- Rol 2: Docente Elaborador (14 chars)
INSERT INTO rbac_rol (Nombre, codigo_rol, esActivo)
SELECT 'Docente Elaborador DOSIER', 'DOSIER_DOCENTE', 1
WHERE NOT EXISTS (SELECT 1 FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_DOCENTE');

-- Rol 3: Coordinador de Carrera - Revisor Curricular (19 chars)
INSERT INTO rbac_rol (Nombre, codigo_rol, esActivo)
SELECT 'Coordinador de Carrera DOSIER', 'DOSIER_COORD_CARRERA', 1
WHERE NOT EXISTS (SELECT 1 FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_COORD_CARRERA');

-- Rol 4: Coordinación / Comisión Académica - Revisor Metodológico (16 chars)
INSERT INTO rbac_rol (Nombre, codigo_rol, esActivo)
SELECT 'Coordinación Académica DOSIER', 'DOSIER_COORD_ACAD', 1
WHERE NOT EXISTS (SELECT 1 FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_COORD_ACAD');

-- Rol 5: Vicerrectorado Académico - Aprobador Oficial y Legalizador (17 chars)
INSERT INTO rbac_rol (Nombre, codigo_rol, esActivo)
SELECT 'Vicerrectorado Académico DOSIER', 'DOSIER_VICERRECTOR', 1
WHERE NOT EXISTS (SELECT 1 FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_VICERRECTOR');

-- -----------------------------------------------------------------------------
-- 5. MÓDULOS CURRICULARES DE DOSIER (rbac_modulos)
-- -----------------------------------------------------------------------------
INSERT INTO rbac_modulos (id_sistema, Nombre, esActivo) VALUES
(@idSistemaDosier, 'PEA', 1),
(@idSistemaDosier, 'GOBERNANZA_CURRICULAR', 1),
(@idSistemaDosier, 'AUDITORIA_CACES', 1),
(@idSistemaDosier, 'CONFIGURACION', 1);

-- -----------------------------------------------------------------------------
-- 6. MATRIZ DE MÓDULOS Y OPERACIONES (rbac_modulos_operaciones)
-- -----------------------------------------------------------------------------
SET @modPEA    = (SELECT idModulos FROM rbac_modulos WHERE id_sistema = @idSistemaDosier AND CONVERT(Nombre USING utf8mb4) = 'PEA' LIMIT 1);
SET @modGob    = (SELECT idModulos FROM rbac_modulos WHERE id_sistema = @idSistemaDosier AND CONVERT(Nombre USING utf8mb4) = 'GOBERNANZA_CURRICULAR' LIMIT 1);
SET @modAud    = (SELECT idModulos FROM rbac_modulos WHERE id_sistema = @idSistemaDosier AND CONVERT(Nombre USING utf8mb4) = 'AUDITORIA_CACES' LIMIT 1);
SET @modCfg    = (SELECT idModulos FROM rbac_modulos WHERE id_sistema = @idSistemaDosier AND CONVERT(Nombre USING utf8mb4) = 'CONFIGURACION' LIMIT 1);

SET @opVer          = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'ver' LIMIT 1);
SET @opEditar       = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'editar' LIMIT 1);
SET @opCrear        = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'crear' LIMIT 1);
SET @opEliminar     = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'eliminar' LIMIT 1);
SET @opGestionar    = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'gestionar' LIMIT 1);
SET @opReportes     = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'reportes' LIMIT 1);
SET @opAprobar      = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'aprobar' LIMIT 1);
SET @opVerAud       = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'ver-auditoria' LIMIT 1);
SET @opCowork       = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'cowork' LIMIT 1);
SET @opObservar     = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'observar' LIMIT 1);
SET @opSubsanar     = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'subsanar' LIMIT 1);
SET @opAvalCarrera  = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'avalar_carrera' LIMIT 1);
SET @opAvalAcad     = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'avalar_academico' LIMIT 1);
SET @opExportarPdf  = (SELECT idOperaciones FROM rbac_operaciones WHERE LOWER(CONVERT(NombreOperacion USING utf8mb4)) = 'exportar_pdf' LIMIT 1);

-- Operaciones del Módulo PEA
INSERT INTO rbac_modulos_operaciones (idModulos, idOperaciones, fecha_creacion, esActivo) VALUES
(@modPEA, @opVer, CURDATE(), 1),
(@modPEA, @opCrear, CURDATE(), 1),
(@modPEA, @opEditar, CURDATE(), 1),
(@modPEA, @opCowork, CURDATE(), 1),
(@modPEA, @opObservar, CURDATE(), 1),
(@modPEA, @opSubsanar, CURDATE(), 1),
(@modPEA, @opAvalCarrera, CURDATE(), 1),
(@modPEA, @opAvalAcad, CURDATE(), 1),
(@modPEA, @opAprobar, CURDATE(), 1),
(@modPEA, @opExportarPdf, CURDATE(), 1);

-- Operaciones del Módulo GOBERNANZA_CURRICULAR
INSERT INTO rbac_modulos_operaciones (idModulos, idOperaciones, fecha_creacion, esActivo) VALUES
(@modGob, @opVer, CURDATE(), 1),
(@modGob, @opGestionar, CURDATE(), 1);

-- Operaciones del Módulo AUDITORIA_CACES
INSERT INTO rbac_modulos_operaciones (idModulos, idOperaciones, fecha_creacion, esActivo) VALUES
(@modAud, @opVerAud, CURDATE(), 1),
(@modAud, @opReportes, CURDATE(), 1);

-- Operaciones del Módulo CONFIGURACION
INSERT INTO rbac_modulos_operaciones (idModulos, idOperaciones, fecha_creacion, esActivo) VALUES
(@modCfg, @opVer, CURDATE(), 1),
(@modCfg, @opEditar, CURDATE(), 1);

-- -----------------------------------------------------------------------------
-- 7. ASIGNACIÓN DE PERMISOS A CADA ROL (rbac_rol_modulo_operacion)
-- -----------------------------------------------------------------------------
SET @rolAdmin    = (SELECT idRol FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_ADMIN' LIMIT 1);
SET @rolDocente  = (SELECT idRol FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_DOCENTE' LIMIT 1);
SET @rolCoordCar = (SELECT idRol FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_COORD_CARRERA' LIMIT 1);
SET @rolCoordAca = (SELECT idRol FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_COORD_ACAD' LIMIT 1);
SET @rolVicerrec = (SELECT idRol FROM rbac_rol WHERE CONVERT(codigo_rol USING utf8mb4) = 'DOSIER_VICERRECTOR' LIMIT 1);

-- A. Asignar TODOS los permisos al Administrador de DOSIER
INSERT INTO rbac_rol_modulo_operacion (idRol, idModulosOperaciones, fecha_asignacion, esActivo)
SELECT @rolAdmin, mo.idModulosOperaciones, CURDATE(), 1
FROM rbac_modulos_operaciones mo
JOIN rbac_modulos m ON mo.idModulos = m.idModulos
WHERE m.id_sistema = @idSistemaDosier;

-- B. Asignar permisos al Docente Elaborador
INSERT INTO rbac_rol_modulo_operacion (idRol, idModulosOperaciones, fecha_asignacion, esActivo)
SELECT @rolDocente, mo.idModulosOperaciones, CURDATE(), 1
FROM rbac_modulos_operaciones mo
JOIN rbac_modulos m ON mo.idModulos = m.idModulos
WHERE m.id_sistema = @idSistemaDosier
  AND (
      (CONVERT(m.Nombre USING utf8mb4) = 'PEA' AND mo.idOperaciones IN (@opVer, @opCrear, @opEditar, @opCowork, @opSubsanar, @opExportarPdf)) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'GOBERNANZA_CURRICULAR' AND mo.idOperaciones = @opVer) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'CONFIGURACION' AND mo.idOperaciones = @opVer)
  );

-- C. Asignar permisos al Coordinador de Carrera
INSERT INTO rbac_rol_modulo_operacion (idRol, idModulosOperaciones, fecha_asignacion, esActivo)
SELECT @rolCoordCar, mo.idModulosOperaciones, CURDATE(), 1
FROM rbac_modulos_operaciones mo
JOIN rbac_modulos m ON mo.idModulos = m.idModulos
WHERE m.id_sistema = @idSistemaDosier
  AND (
      (CONVERT(m.Nombre USING utf8mb4) = 'PEA' AND mo.idOperaciones IN (@opVer, @opObservar, @opAvalCarrera, @opExportarPdf)) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'GOBERNANZA_CURRICULAR' AND mo.idOperaciones IN (@opVer, @opGestionar)) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'AUDITORIA_CACES' AND mo.idOperaciones = @opReportes) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'CONFIGURACION' AND mo.idOperaciones = @opVer)
  );

-- D. Asignar permisos a la Coordinación Académica
INSERT INTO rbac_rol_modulo_operacion (idRol, idModulosOperaciones, fecha_asignacion, esActivo)
SELECT @rolCoordAca, mo.idModulosOperaciones, CURDATE(), 1
FROM rbac_modulos_operaciones mo
JOIN rbac_modulos m ON mo.idModulos = m.idModulos
WHERE m.id_sistema = @idSistemaDosier
  AND (
      (CONVERT(m.Nombre USING utf8mb4) = 'PEA' AND mo.idOperaciones IN (@opVer, @opObservar, @opAvalAcad, @opExportarPdf)) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'GOBERNANZA_CURRICULAR' AND mo.idOperaciones IN (@opVer, @opGestionar)) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'AUDITORIA_CACES' AND mo.idOperaciones IN (@opVerAud, @opReportes)) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'CONFIGURACION' AND mo.idOperaciones = @opVer)
  );

-- E. Asignar permisos al Vicerrectorado Académico
INSERT INTO rbac_rol_modulo_operacion (idRol, idModulosOperaciones, fecha_asignacion, esActivo)
SELECT @rolVicerrec, mo.idModulosOperaciones, CURDATE(), 1
FROM rbac_modulos_operaciones mo
JOIN rbac_modulos m ON mo.idModulos = m.idModulos
WHERE m.id_sistema = @idSistemaDosier
  AND (
      (CONVERT(m.Nombre USING utf8mb4) = 'PEA' AND mo.idOperaciones IN (@opVer, @opObservar, @opAprobar, @opExportarPdf)) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'GOBERNANZA_CURRICULAR' AND mo.idOperaciones IN (@opVer, @opGestionar)) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'AUDITORIA_CACES' AND mo.idOperaciones IN (@opVerAud, @opReportes)) OR
      (CONVERT(m.Nombre USING utf8mb4) = 'CONFIGURACION' AND mo.idOperaciones IN (@opVer, @opEditar))
  );

-- Normalización institucional: Actualizar tablaSigafi a 'profesor' para usuarios que consten en la nómina docente
UPDATE usuarios u
JOIN profesores p ON u.idSigafi = p.idProfesor
SET u.tablaSigafi = 'profesor'
WHERE u.tablaSigafi = 'alumno';

-- F. Sincronizar roles de autoridades designadas hacia usuarios existentes
INSERT INTO rbac_usuario_rol (idUsuario, idRol, fecha_creacion, esActivo)
SELECT u.idUsuario, 
       CASE aut.cargoCurricular
           WHEN 'VICERRECTOR' THEN @rolVicerrec
           WHEN 'COORD_ACADEMICO' THEN @rolCoordAca
           WHEN 'COORD_CARRERA' THEN @rolCoordCar
       END as idRol,
       CURDATE(), 1
FROM doc_autoridades_curriculares aut
JOIN usuarios u ON aut.idSigafi = u.idSigafi
WHERE aut.esActivo = 1
  AND NOT EXISTS (
      SELECT 1 FROM rbac_usuario_rol ur
      WHERE ur.idUsuario = u.idUsuario
        AND ur.idRol = CASE aut.cargoCurricular
                           WHEN 'VICERRECTOR' THEN @rolVicerrec
                           WHEN 'COORD_ACADEMICO' THEN @rolCoordAca
                           WHEN 'COORD_CARRERA' THEN @rolCoordCar
                       END
  );

-- G. Asignar rol DOSIER_ADMIN a usuarios con administrador = 1
INSERT INTO rbac_usuario_rol (idUsuario, idRol, fecha_creacion, esActivo)
SELECT u.idUsuario, @rolAdmin, CURDATE(), 1
FROM usuarios u
WHERE u.administrador = 1
  AND NOT EXISTS (
      SELECT 1 FROM rbac_usuario_rol ur
      WHERE ur.idUsuario = u.idUsuario AND ur.idRol = @rolAdmin
  );

-- H. Asignar rol DOSIER_DOCENTE a todos los usuarios de tipo profesor
INSERT INTO rbac_usuario_rol (idUsuario, idRol, fecha_creacion, esActivo)
SELECT u.idUsuario, @rolDocente, CURDATE(), 1
FROM usuarios u
WHERE u.tablaSigafi = 'profesor'
  AND NOT EXISTS (
      SELECT 1 FROM rbac_usuario_rol ur
      WHERE ur.idUsuario = u.idUsuario AND ur.idRol = @rolDocente
  );

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;
