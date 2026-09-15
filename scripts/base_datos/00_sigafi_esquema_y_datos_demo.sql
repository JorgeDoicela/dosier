-- =============================================================================
-- SISTEMA DOSIER - SEMILLERO DE ENTORNO SIGAFI MAESTRO (DEMO / TESIS ISTPET)
-- Base de Datos: sigafi_es | Motor: MySQL 8.0+ / MariaDB 10.5+
-- Propósito: Provisión autónoma del esquema preexistente de solo lectura de SIGAFI
-- con datos sintéticos realistas para defensas de grado y cumplimiento LOPDP.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS sigafi_es CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sigafi_es;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. TABLA: carreras (Filtro institucional esInstituto = 1)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS carreras;
CREATE TABLE carreras (
    idCarrera           INT AUTO_INCREMENT PRIMARY KEY,
    nombreCarrera       VARCHAR(200) NOT NULL,
    codigoCarrera       VARCHAR(50)  NULL,
    tituloOtorga        VARCHAR(200) NULL,
    modalidad           VARCHAR(50)  DEFAULT 'Presencial',
    duracionPeriodos    INT          DEFAULT 4,
    esInstituto         TINYINT(1)   NOT NULL DEFAULT 1,
    estado              VARCHAR(20)  DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO carreras (idCarrera, nombreCarrera, codigoCarrera, tituloOtorga, modalidad, duracionPeriodos, esInstituto, estado) VALUES
(1, 'Tecnología Superior en Desarrollo de Software', 'TSDS-2022', 'Tecnólogo/a Superior en Desarrollo de Software', 'Presencial', 4, 1, 'Activo'),
(2, 'Tecnología Superior en Ciberseguridad', 'TSC-2023', 'Tecnólogo/a Superior en Ciberseguridad', 'Presencial', 4, 1, 'Activo'),
(3, 'Tecnología Superior en Redes y Telecomunicaciones', 'TSRT-2022', 'Tecnólogo/a Superior en Redes y Telecomunicaciones', 'Presencial', 4, 1, 'Activo');

-- -----------------------------------------------------------------------------
-- 2. TABLA: periodos (Períodos Académicos Ordinarios PAO)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS periodos;
CREATE TABLE periodos (
    idPeriodo           INT AUTO_INCREMENT PRIMARY KEY,
    nombrePeriodo       VARCHAR(100) NOT NULL,
    codigoPeriodo       VARCHAR(20)  NOT NULL UNIQUE,
    fechaInicio         DATE         NOT NULL,
    fechaFin            DATE         NOT NULL,
    estado              VARCHAR(20)  DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO periodos (idPeriodo, nombrePeriodo, codigoPeriodo, fechaInicio, fechaFin, estado) VALUES
(1, 'Periodo Académico 2026-1', '2026-1', '2026-04-01', '2026-08-31', 'Activo'),
(2, 'Periodo Académico 2025-2', '2025-2', '2025-10-01', '2025-02-28', 'Cerrado');

-- -----------------------------------------------------------------------------
-- 3. TABLA: mallas_periodos (Vigencia de Malla Curricular por Período)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS mallas_periodos;
CREATE TABLE mallas_periodos (
    idMallaPeriodo      INT AUTO_INCREMENT PRIMARY KEY,
    idCarrera           INT          NOT NULL,
    idPeriodo           INT          NOT NULL,
    codigoMalla         VARCHAR(50)  NOT NULL,
    resolucionCes       VARCHAR(100) DEFAULT 'RPC-SO-12-No.185-2022',
    estado              VARCHAR(20)  DEFAULT 'Vigente',
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera),
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO mallas_periodos (idMallaPeriodo, idCarrera, idPeriodo, codigoMalla, resolucionCes, estado) VALUES
(1, 1, 1, 'MALLA-TSDS-V2', 'RPC-SO-12-No.185-2022', 'Vigente'),
(2, 2, 1, 'MALLA-TSC-V1', 'RPC-SO-15-No.220-2023', 'Vigente');

-- -----------------------------------------------------------------------------
-- 4. TABLA: detallemallas (Asignaturas, Créditos y Cuadre Horario 48h/crédito)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS detallemallas;
CREATE TABLE detallemallas (
    idDetalleMalla      INT AUTO_INCREMENT PRIMARY KEY,
    idMallaPeriodo      INT          NOT NULL,
    idCarrera           INT          NOT NULL,
    nivelMalla          INT          NOT NULL, -- 1 a 4
    codigoMateria       VARCHAR(30)  NOT NULL,
    nombreMateria       VARCHAR(200) NOT NULL,
    campoFormacion      VARCHAR(100) DEFAULT 'Disciplinar',
    creditos            DECIMAL(4,2) NOT NULL DEFAULT 3.00,
    horasDocencia       INT          NOT NULL DEFAULT 48, -- CD
    horasPracticas      INT          NOT NULL DEFAULT 48, -- APE
    horasAutonomas      INT          NOT NULL DEFAULT 48, -- TA
    totalHoras          INT          NOT NULL DEFAULT 144,
    prerrequisitos      VARCHAR(255) NULL,
    correquisitos       VARCHAR(255) NULL,
    estado              VARCHAR(20)  DEFAULT 'Activo',
    FOREIGN KEY (idMallaPeriodo) REFERENCES mallas_periodos(idMallaPeriodo),
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO detallemallas (idDetalleMalla, idMallaPeriodo, idCarrera, nivelMalla, codigoMateria, nombreMateria, campoFormacion, creditos, horasDocencia, horasPracticas, horasAutonomas, totalHoras, prerrequisitos, correquisitos, estado) VALUES
-- Nivel 3 - TSDS
(101, 1, 1, 3, 'TSDS-301', 'Desarrollo de Aplicaciones Web Avanzadas', 'Profesional', 3.00, 48, 48, 48, 144, 'TSDS-201', 'TSDS-302', 'Activo'),
(102, 1, 1, 3, 'TSDS-302', 'Arquitectura de Software y Patrones de Diseno', 'Profesional', 3.00, 48, 48, 48, 144, 'TSDS-202', 'TSDS-301', 'Activo'),
(103, 1, 1, 3, 'TSDS-303', 'Bases de Datos Avanzadas y Seguridad LOPDP', 'Disciplinar', 2.50, 40, 40, 40, 120, 'TSDS-203', NULL, 'Activo'),
(104, 1, 1, 3, 'TSDS-304', 'Metodologias Agiles y DevOps Curricular', 'Profesional', 2.50, 40, 40, 40, 120, 'TSDS-204', NULL, 'Activo'),
-- Nivel 4 - TSDS
(105, 1, 1, 4, 'TSDS-401', 'Integracion Continua y Despliegue en la Nube', 'Profesional', 3.00, 48, 48, 48, 144, 'TSDS-304', NULL, 'Activo');

-- -----------------------------------------------------------------------------
-- 5. TABLA: profesores (Nómina Docente Institucional Demo)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS profesores;
CREATE TABLE profesores (
    idProfesor          INT AUTO_INCREMENT PRIMARY KEY,
    cedula              VARCHAR(20)  NOT NULL UNIQUE,
    nombres             VARCHAR(100) NOT NULL,
    apellidos           VARCHAR(100) NOT NULL,
    correoInstitucional VARCHAR(150) NOT NULL UNIQUE,
    telefono            VARCHAR(30)  NULL,
    tituloAcademico     VARCHAR(200) DEFAULT 'Magíster en Ingeniería de Software',
    estado              VARCHAR(20)  DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO profesores (idProfesor, cedula, nombres, apellidos, correoInstitucional, telefono, tituloAcademico, estado) VALUES
(1, '1720000001', 'Jorge Ismael', 'Doicela Molina', 'jorge.doicela@istpet.edu.ec', '0990000001', 'Tecnólogo en Desarrollo de Software', 'Activo'),
(2, '1720000002', 'Carlos Enrique', 'Valencia Llerena', 'carlos.valencia@istpet.edu.ec', '0990000002', 'Magíster en Sistemas de Información', 'Activo'),
(3, '1720000003', 'Marcia Elena', 'Proaño Ramos', 'vicerrectorado@istpet.edu.ec', '0990000003', 'Doctora en Ciencias de la Educación', 'Activo'),
(4, '1720000004', 'David Alejandro', 'Guaman Perez', 'coordinacion.software@istpet.edu.ec', '0990000004', 'Magíster en Ciberseguridad y Redes', 'Activo'),
(5, '1720000005', 'Silvia Patricia', 'Andrade Torres', 'coordinacion.academica@istpet.edu.ec', '0990000005', 'Magíster en Docencia Universitaria', 'Activo');

-- -----------------------------------------------------------------------------
-- 6. TABLA: asignacion_materias (Carga Académica Distributiva Docente)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS asignacion_materias;
CREATE TABLE asignacion_materias (
    idAsignacion        INT AUTO_INCREMENT PRIMARY KEY,
    idProfesor          INT         NOT NULL,
    idDetalleMalla      INT         NOT NULL,
    idPeriodo           INT         NOT NULL,
    paralelo            VARCHAR(10) DEFAULT 'A',
    jornada             VARCHAR(30) DEFAULT 'Nocturna',
    esTitular           TINYINT(1)  DEFAULT 1,
    estado              VARCHAR(20) DEFAULT 'Aprobado',
    FOREIGN KEY (idProfesor) REFERENCES profesores(idProfesor),
    FOREIGN KEY (idDetalleMalla) REFERENCES detallemallas(idDetalleMalla),
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO asignacion_materias (idAsignacion, idProfesor, idDetalleMalla, idPeriodo, paralelo, jornada, esTitular, estado) VALUES
(1, 1, 101, 1, 'A', 'Nocturna', 1, 'Aprobado'), -- Jorge Doicela -> Web Avanzada
(2, 2, 102, 1, 'A', 'Nocturna', 1, 'Aprobado'), -- Carlos Valencia -> Arquitectura
(3, 4, 103, 1, 'A', 'Nocturna', 1, 'Aprobado'), -- David Guaman -> Bases de Datos
(4, 1, 104, 1, 'A', 'Nocturna', 1, 'Aprobado'); -- Jorge Doicela -> Metodologías Ágiles

-- -----------------------------------------------------------------------------
-- 7. TABLA: usuarios (Usuarios Maestros Institucionales SIGAFI)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    idUsuario           INT AUTO_INCREMENT PRIMARY KEY,
    idSigafi            VARCHAR(20)  NULL,
    tablaSigafi         ENUM('alumno','profesor','otros') DEFAULT 'profesor',
    nombre              VARCHAR(200) NOT NULL,
    contrasenia         VARCHAR(250) NOT NULL,
    activo              TINYINT(4)   NOT NULL DEFAULT 1,
    administrador       TINYINT(4)   NOT NULL DEFAULT 0,
    emailInstitucional  VARCHAR(100) NULL,
    emailValidado       TINYINT(4)   NOT NULL DEFAULT 1,
    hashEmailToken      VARCHAR(255) NULL,
    fechaEmailValidacion DATETIME    NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO usuarios (idUsuario, idSigafi, tablaSigafi, nombre, contrasenia, activo, administrador, emailInstitucional, emailValidado) VALUES
(1, '1', 'profesor', 'Jorge Ismael Doicela Molina', '$2a$11$q9v5uV0j2Jc.27tY7GqFw.mXqUaFjZ0P/6O9aX7uV1j2Jc.27tY7G', 1, 1, 'jorge.doicela@istpet.edu.ec', 1),
(2, '2', 'profesor', 'Carlos Enrique Valencia Llerena', '$2a$11$q9v5uV0j2Jc.27tY7GqFw.mXqUaFjZ0P/6O9aX7uV1j2Jc.27tY7G', 1, 0, 'carlos.valencia@istpet.edu.ec', 1),
(3, '3', 'profesor', 'Marcia Elena Proaño Ramos', '$2a$11$q9v5uV0j2Jc.27tY7GqFw.mXqUaFjZ0P/6O9aX7uV1j2Jc.27tY7G', 1, 0, 'vicerrectorado@istpet.edu.ec', 1),
(4, '4', 'profesor', 'David Alejandro Guaman Perez', '$2a$11$q9v5uV0j2Jc.27tY7GqFw.mXqUaFjZ0P/6O9aX7uV1j2Jc.27tY7G', 1, 0, 'coordinacion.software@istpet.edu.ec', 1),
(5, '5', 'profesor', 'Silvia Patricia Andrade Torres', '$2a$11$q9v5uV0j2Jc.27tY7GqFw.mXqUaFjZ0P/6O9aX7uV1j2Jc.27tY7G', 1, 0, 'coordinacion.academica@istpet.edu.ec', 1);

-- -----------------------------------------------------------------------------
-- 8. ESQUEMA RBAC BASE (Sistemas, Módulos, Operaciones y Roles Institucionales)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS rbac_usuario_rol;
DROP TABLE IF EXISTS rbac_rol_modulo_operacion;
DROP TABLE IF EXISTS rbac_modulos_operaciones;
DROP TABLE IF EXISTS rbac_modulos;
DROP TABLE IF EXISTS rbac_operaciones;
DROP TABLE IF EXISTS rbac_rol;
DROP TABLE IF EXISTS rbac_sistema;

CREATE TABLE rbac_sistema (
    idSistema           INT AUTO_INCREMENT PRIMARY KEY,
    codigo              VARCHAR(20) NOT NULL,
    detalle             VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rbac_operaciones (
    idOperaciones       INT AUTO_INCREMENT PRIMARY KEY,
    NombreOperacion     VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rbac_rol (
    idRol               INT AUTO_INCREMENT PRIMARY KEY,
    Nombre              VARCHAR(255) NOT NULL,
    codigo_rol          VARCHAR(25)  NOT NULL,
    esActivo            TINYINT(4)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rbac_modulos (
    idModulos           INT AUTO_INCREMENT PRIMARY KEY,
    id_sistema          INT          NOT NULL,
    Nombre              VARCHAR(255) NOT NULL,
    esActivo            TINYINT(4)   NOT NULL DEFAULT 1,
    FOREIGN KEY (id_sistema) REFERENCES rbac_sistema(idSistema)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rbac_modulos_operaciones (
    idModulosOperaciones INT AUTO_INCREMENT PRIMARY KEY,
    idModulos           INT        NOT NULL,
    idOperaciones       INT        NOT NULL,
    fecha_creacion      DATE       NULL,
    fecha_modificacion  DATE       NULL,
    esActivo            TINYINT(4) NOT NULL DEFAULT 1,
    FOREIGN KEY (idModulos) REFERENCES rbac_modulos(idModulos),
    FOREIGN KEY (idOperaciones) REFERENCES rbac_operaciones(idOperaciones)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rbac_rol_modulo_operacion (
    idRolModuloOperacion INT AUTO_INCREMENT PRIMARY KEY,
    idRol               INT        NOT NULL,
    idModulosOperaciones INT       NOT NULL,
    fecha_asignacion    DATE       NULL,
    fecha_modificacion  DATE       NULL,
    fecha_desactivacion DATE       NULL,
    esActivo            TINYINT(4) NOT NULL DEFAULT 1,
    FOREIGN KEY (idRol) REFERENCES rbac_rol(idRol),
    FOREIGN KEY (idModulosOperaciones) REFERENCES rbac_modulos_operaciones(idModulosOperaciones)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rbac_usuario_rol (
    idUsuarioRol        INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario           INT        NOT NULL,
    idRol               INT        NOT NULL,
    fecha_creacion      DATE       NULL,
    fecha_modificacion  DATE       NULL,
    esActivo            TINYINT(4) NOT NULL DEFAULT 1,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario),
    FOREIGN KEY (idRol) REFERENCES rbac_rol(idRol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
