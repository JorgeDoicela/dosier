-- =============================================================================
-- SISTEMA DOSIER - SEMILLERO DE ENTORNO SIGAFI MAESTRO (DEMO / SANDBOX)
-- Base de Datos: sigafi_es | Motor: MySQL 8.0+ / MariaDB 10.5+
-- GOBERNANZA DE PRODUCCIÓN: Script 100% no destructivo.
-- Emplea CREATE TABLE IF NOT EXISTS e INSERT IGNORE INTO para garantizar que
-- NUNCA sobrescriba ni borre tablas ni registros preexistentes en producción.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS sigafi_es CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sigafi_es;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. TABLA: carreras (Filtro institucional esInstituto = 1)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carreras (
    idCarrera           INT AUTO_INCREMENT PRIMARY KEY,
    Carrera             VARCHAR(200) NOT NULL,
    codigo_cases        VARCHAR(50)  NULL,
    aliasCarrera        VARCHAR(50)  NULL,
    esInstituto         TINYINT(4)   NOT NULL DEFAULT 1,
    activa              TINYINT(4)   NOT NULL DEFAULT 1,
    numero_creditos     INT          DEFAULT 80,
    ordenCarrera        INT          DEFAULT 1,
    numero_alumnos      INT          DEFAULT 0,
    revisaArrastres     TINYINT(4)   DEFAULT 0,
    directorCarrera     VARCHAR(100) NULL,
    BolsaEmpleo         TINYINT(4)   DEFAULT 0,
    fechaCreacion       DATE         NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO carreras (idCarrera, Carrera, codigo_cases, aliasCarrera, esInstituto, activa, numero_creditos) VALUES
(1, 'Tecnología Superior en Desarrollo de Software', 'TSDS-2022', 'TSDS', 1, 1, 80),
(2, 'Tecnología Superior en Ciberseguridad', 'TSC-2023', 'TSC', 1, 1, 80),
(3, 'Tecnología Superior en Redes y Telecomunicaciones', 'TSRT-2022', 'TSRT', 1, 1, 80),
(7, 'Tecnología Superior en Electricidad', 'TSE-2022', 'TSE', 1, 1, 80),
(9, 'Tecnología Superior en Mecánica Automotriz', 'TSMA-2022', 'TSMA', 1, 1, 80),
(10, 'Tecnología Superior en Administración', 'TSA-2022', 'TSA', 1, 1, 80);

-- -----------------------------------------------------------------------------
-- 2. TABLA: periodos (Períodos Académicos Ordinarios PAO)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS periodos (
    idPeriodo           CHAR(7) CHARACTER SET latin1 PRIMARY KEY,
    detalle             VARCHAR(100) NOT NULL,
    fecha_inicial       DATE         NOT NULL,
    fecha_final         DATE         NOT NULL,
    cerrado             TINYINT(1)   DEFAULT 0,
    activo              TINYINT(1)   DEFAULT 1,
    esInstituto         TINYINT(4)   NOT NULL DEFAULT 1,
    periodoactivoinstituto TINYINT(4) NOT NULL DEFAULT 1,
    creditos            TINYINT(1)   DEFAULT 1,
    permiteMatricula    TINYINT(4)   DEFAULT 1,
    ingresoCalificaciones TINYINT(4) DEFAULT 1,
    permiteCalificacionesInstituto TINYINT(4) DEFAULT 1,
    visualizaPowerBi    TINYINT(4)   DEFAULT 0,
    periodoPlanificacion TINYINT(4)  DEFAULT 0,
    fecha_maxima_autocierre DATE     NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO periodos (idPeriodo, detalle, fecha_inicial, fecha_final, cerrado, activo, esInstituto, periodoactivoinstituto) VALUES
('2026-1', 'Periodo Académico Ordinario 2026-1', '2026-04-01', '2026-08-31', 0, 1, 1, 1),
('2025-2', 'Periodo Académico Ordinario 2025-2', '2025-10-01', '2025-02-28', 1, 0, 1, 0);

-- -----------------------------------------------------------------------------
-- 3. TABLA: asignaturas (Catálogo de Materias del Instituto)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asignaturas (
    idAsignatura        INT AUTO_INCREMENT PRIMARY KEY,
    asignatura          VARCHAR(200) NOT NULL,
    codigo              VARCHAR(30)  NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO asignaturas (idAsignatura, asignatura, codigo) VALUES
(101, 'Desarrollo de Aplicaciones Web Avanzadas', 'TSDS-301'),
(102, 'Arquitectura de Software y Patrones de Diseno', 'TSDS-302'),
(103, 'Bases de Datos Avanzadas y Seguridad LOPDP', 'TSDS-303'),
(104, 'Metodologias Agiles y DevOps Curricular', 'TSDS-304'),
(105, 'Integracion Continua y Despliegue en la Nube', 'TSDS-401');

-- -----------------------------------------------------------------------------
-- 4. TABLA: mallas (Estructura Macro-Curricular)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mallas (
    idMalla             INT AUTO_INCREMENT PRIMARY KEY,
    idCarrera           INT          NOT NULL,
    vigencia            VARCHAR(50)  NULL,
    descripcion         VARCHAR(100) NULL,
    creditos_minimo     INT          DEFAULT 0,
    creditos_maximo     INT          DEFAULT 80,
    creditos_reprobatorio INT        DEFAULT 0,
    activa              TINYINT(4)   DEFAULT 1,
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO mallas (idMalla, idCarrera, vigencia, descripcion, creditos_minimo, creditos_maximo, activa) VALUES
(1, 1, '2022-2026', 'Malla Curricular Rediseño 2022 - TSDS', 0, 80, 1),
(2, 2, '2023-2027', 'Malla Curricular Rediseño 2023 - TSC', 0, 80, 1);

-- -----------------------------------------------------------------------------
-- 5. TABLA: mallas_periodos (Vigencia de Malla por Período y Nivel)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mallas_periodos (
    idPeriodo           CHAR(7) CHARACTER SET latin1 NOT NULL,
    idNivel             INT          NOT NULL,
    idMalla             INT          NOT NULL,
    PRIMARY KEY (idPeriodo, idNivel, idMalla),
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo),
    FOREIGN KEY (idMalla) REFERENCES mallas(idMalla)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO mallas_periodos (idPeriodo, idNivel, idMalla) VALUES
('2026-1', 1, 1),
('2026-1', 2, 1),
('2026-1', 3, 1),
('2026-1', 4, 1);

-- -----------------------------------------------------------------------------
-- 6. TABLA: detallemallas (Detalle Asignaturas, Horas y Créditos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detallemallas (
    idDetalleMalla      INT AUTO_INCREMENT PRIMARY KEY,
    idMalla             INT          NOT NULL,
    idAsignatura        INT          NOT NULL,
    idNivel             INT          NOT NULL,
    idtipo_asignatura   INT          DEFAULT 1,
    tipo                VARCHAR(100) DEFAULT 'Disciplinar',
    opcional            TINYINT(4)   DEFAULT 0,
    creditos            DECIMAL(4,2) NOT NULL DEFAULT 3.00,
    horas               INT          NOT NULL DEFAULT 144,
    anulada             TINYINT(4)   DEFAULT 0,
    horasDocente        INT          NOT NULL DEFAULT 48,
    horasPracticoExperimental DECIMAL(10,2) NOT NULL DEFAULT 48.00,
    FOREIGN KEY (idMalla) REFERENCES mallas(idMalla),
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO detallemallas (idDetalleMalla, idMalla, idAsignatura, idNivel, idtipo_asignatura, tipo, creditos, horas, horasDocente, horasPracticoExperimental) VALUES
(101, 1, 101, 3, 1, 'Profesional', 3.00, 144, 48, 48.00),
(102, 1, 102, 3, 1, 'Profesional', 3.00, 144, 48, 48.00),
(103, 1, 103, 3, 1, 'Disciplinar', 2.50, 120, 40, 40.00),
(104, 1, 104, 3, 1, 'Profesional', 2.50, 120, 40, 40.00),
(105, 1, 105, 4, 1, 'Profesional', 3.00, 144, 48, 48.00);

-- -----------------------------------------------------------------------------
-- 7. TABLA: profesores (Nómina Docente Institucional Completa)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profesores (
    idProfesor          VARCHAR(14)  PRIMARY KEY,
    tipodocumento       VARCHAR(20)  DEFAULT 'C',
    apellidos           VARCHAR(100) NOT NULL,
    nombres             VARCHAR(100) NOT NULL,
    primerApellido      VARCHAR(50)  NULL,
    segundoApellido     VARCHAR(50)  NULL,
    primerNombre        VARCHAR(50)  NULL,
    segundoNombre       VARCHAR(50)  NULL,
    estadoCivil         INT          DEFAULT 1,
    direccion           VARCHAR(255) NULL,
    callePrincipal      VARCHAR(100) NULL,
    calleSecundaria     VARCHAR(100) NULL,
    numeroCasa          VARCHAR(20)  NULL,
    telefono            VARCHAR(30)  NULL,
    celular             VARCHAR(30)  NULL,
    email               VARCHAR(150) NULL,
    fecha_nacimiento    DATE         NULL,
    sexo                VARCHAR(10)  DEFAULT 'M',
    clave               VARCHAR(250) NULL,
    practicas           TINYINT(4)   DEFAULT 0,
    tipo                VARCHAR(50)  DEFAULT 'Docente',
    nacionalidad        VARCHAR(50)  DEFAULT 'ECUATORIANA',
    titulo              VARCHAR(200) DEFAULT 'Magíster en Ingeniería de Software',
    abreviatura         VARCHAR(20)  DEFAULT 'Ing.',
    abreviatura_post    VARCHAR(20)  DEFAULT 'Msc.',
    activo              TINYINT(4)   DEFAULT 1,
    idEtnia             INT          DEFAULT 1,
    idNacionalidad      INT          DEFAULT 1,
    idParroquiaNacimiento INT        DEFAULT 1,
    emailInstitucional  VARCHAR(150) NULL,
    fecha_ingreso       DATE         NULL,
    fechaIngresoIess    DATE         NULL,
    fecha_retiro        DATE         NULL,
    idParroquiaResidencia INT        DEFAULT 1,
    tipoSangre          VARCHAR(10)  DEFAULT 'O+',
    codigoPostal        VARCHAR(20)  NULL,
    idDiscapacidad      INT          DEFAULT 0,
    porcentajeDiscapacidad INT       DEFAULT 0,
    numeroConadis       VARCHAR(50)  NULL,
    foto                VARCHAR(255) NULL,
    esReal              TINYINT(4)   DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO profesores (idProfesor, tipodocumento, apellidos, nombres, primerApellido, segundoApellido, primerNombre, segundoNombre, emailInstitucional, email, clave, titulo, abreviatura, abreviatura_post, activo) VALUES
('1725555377', 'C', 'Doicela Molina', 'Jorge Ismael', 'Doicela', 'Molina', 'Jorge', 'Ismael', 'jorge.doicela@istpet.edu.ec', 'jorge.doicela@istpet.edu.ec', '12345', 'Tecnólogo en Desarrollo de Software', 'Ing.', 'Msc.', 1),
('1720000002', 'C', 'Valencia Llerena', 'Carlos Enrique', 'Valencia', 'Llerena', 'Carlos', 'Enrique', 'carlos.valencia@istpet.edu.ec', 'carlos.valencia@istpet.edu.ec', '12345', 'Magíster en Sistemas de Información', 'Ing.', 'Msc.', 1),
('1720000003', 'C', 'Proaño Ramos', 'Marcia Elena', 'Proaño', 'Ramos', 'Marcia', 'Elena', 'vicerrectorado@istpet.edu.ec', 'vicerrectorado@istpet.edu.ec', '12345', 'Doctora en Ciencias de la Educación', 'Dra.', 'Ph.D.', 1),
('1720000004', 'C', 'Guaman Perez', 'David Alejandro', 'Guaman', 'Perez', 'David', 'Alejandro', 'coordinacion.software@istpet.edu.ec', 'coordinacion.software@istpet.edu.ec', '12345', 'Magíster en Ciberseguridad y Redes', 'Ing.', 'Msc.', 1),
('1720000005', 'C', 'Andrade Torres', 'Silvia Patricia', 'Andrade', 'Torres', 'Silvia', 'Patricia', 'coordinacion.academica@istpet.edu.ec', 'coordinacion.academica@istpet.edu.ec', '12345', 'Magíster en Docencia Universitaria', 'Msc.', 'Msc.', 1),
('1802707511', 'C', 'Baño', 'Freddy', 'Baño', '', 'Freddy', '', 'freddy.bano@istpet.edu.ec', 'freddy.bano@istpet.edu.ec', '12345', 'Magíster en Educación Superior', 'Msc.', 'Msc.', 1),
('0502405889', 'C', 'Cobos', 'Cristian', 'Cobos', '', 'Cristian', '', 'cristian.cobos@istpet.edu.ec', 'cristian.cobos@istpet.edu.ec', '12345', 'Magíster en Gestión Curricular', 'Msc.', 'Msc.', 1),
('1709890626', 'C', 'Trujillo', 'Wilfrido', 'Trujillo', '', 'Wilfrido', '', 'wilfrido.trujillo@istpet.edu.ec', 'wilfrido.trujillo@istpet.edu.ec', '12345', 'Ingeniero Mecánico', 'Ing.', 'Msc.', 1),
('1720004793', 'C', 'Castro', 'Christian', 'Castro', '', 'Christian', '', 'christian.castro@istpet.edu.ec', 'christian.castro@istpet.edu.ec', '12345', 'Magíster en Administración', 'Msc.', 'Msc.', 1),
('1721465431', 'C', 'Toapanta', 'Wilmer', 'Toapanta', '', 'Wilmer', '', 'wilmer.toapanta@istpet.edu.ec', 'wilmer.toapanta@istpet.edu.ec', '12345', 'Ingeniero Eléctrico', 'Ing.', 'Msc.', 1);

-- -----------------------------------------------------------------------------
-- 8. TABLA: asignaciones_profesores (Carga Académica Distributiva Docente)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asignaciones_profesores (
    idAsignacion        INT AUTO_INCREMENT PRIMARY KEY,
    idProfesor          VARCHAR(14)  NOT NULL,
    idAsignatura        INT          NOT NULL,
    idPeriodo           CHAR(7) CHARACTER SET latin1 NOT NULL,
    idModalidad         INT          DEFAULT 1,
    idSeccion           INT          DEFAULT 1,
    idNivel             INT          DEFAULT 3,
    paralelo            VARCHAR(1)   DEFAULT 'A',
    activo              TINYINT(4)   DEFAULT 1,
    codigo_asignacion   VARCHAR(10)  NULL,
    fecha_inicial       DATE         NULL,
    fecha_fin           DATE         NULL,
    fecha_grabar        DATETIME     NULL,
    fecha_modificacion  DATETIME     NULL,
    entrega_acta        TINYINT(4)   DEFAULT 0,
    ingresa_notas       TINYINT(4)   DEFAULT 1,
    user_asignaciones   VARCHAR(25)  NULL,
    user_acta           VARCHAR(25)  NULL,
    esActivaAsignacion  TINYINT(4)   DEFAULT 1,
    numeroHoras         DECIMAL(10,2) DEFAULT 48.00,
    contabilizarHoraDocente TINYINT(4) DEFAULT 1,
    horasPracticoExperimental DECIMAL(10,2) DEFAULT 48.00,
    FOREIGN KEY (idProfesor) REFERENCES profesores(idProfesor),
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura),
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO asignaciones_profesores (idAsignacion, idProfesor, idAsignatura, idPeriodo, paralelo, idNivel, activo) VALUES
(1, '1725555377', 101, '2026-1', 'A', 3, 1),
(2, '1720000002', 102, '2026-1', 'A', 3, 1),
(3, '1720000004', 103, '2026-1', 'A', 3, 1),
(4, '1725555377', 104, '2026-1', 'A', 3, 1);

-- -----------------------------------------------------------------------------
-- 9. TABLA: usuarios (Usuarios Maestros Institucionales SIGAFI)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
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

INSERT IGNORE INTO usuarios (idUsuario, idSigafi, tablaSigafi, nombre, contrasenia, activo, administrador, emailInstitucional, emailValidado) VALUES
(1, '1725555377', 'profesor', 'Jorge Ismael Doicela Molina', '12345', 1, 1, 'jorge.doicela@istpet.edu.ec', 1),
(2, '1720000002', 'profesor', 'Carlos Enrique Valencia Llerena', '12345', 1, 0, 'carlos.valencia@istpet.edu.ec', 1),
(3, '1720000003', 'profesor', 'Marcia Elena Proaño Ramos', '12345', 1, 0, 'vicerrectorado@istpet.edu.ec', 1),
(4, '1720000004', 'profesor', 'David Alejandro Guaman Perez', '12345', 1, 0, 'coordinacion.software@istpet.edu.ec', 1),
(5, '1720000005', 'profesor', 'Silvia Patricia Andrade Torres', '12345', 1, 0, 'coordinacion.academica@istpet.edu.ec', 1),
(6, '1802707511', 'profesor', 'Freddy Baño', '12345', 1, 0, 'freddy.bano@istpet.edu.ec', 1),
(7, '0502405889', 'profesor', 'Cristian Cobos', '12345', 1, 0, 'cristian.cobos@istpet.edu.ec', 1),
(8, '1709890626', 'profesor', 'Wilfrido Trujillo', '12345', 1, 0, 'wilfrido.trujillo@istpet.edu.ec', 1),
(9, '1720004793', 'profesor', 'Christian Castro', '12345', 1, 0, 'christian.castro@istpet.edu.ec', 1),
(10, '1721465431', 'profesor', 'Wilmer Toapanta', '12345', 1, 0, 'wilmer.toapanta@istpet.edu.ec', 1);

-- -----------------------------------------------------------------------------
-- 10. ESQUEMA RBAC BASE (Sistemas, Módulos, Operaciones y Roles Institucionales)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rbac_sistema (
    idSistema           INT AUTO_INCREMENT PRIMARY KEY,
    codigo              VARCHAR(20) NOT NULL,
    detalle             VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rbac_operaciones (
    idOperaciones       INT AUTO_INCREMENT PRIMARY KEY,
    NombreOperacion     VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rbac_rol (
    idRol               INT AUTO_INCREMENT PRIMARY KEY,
    Nombre              VARCHAR(255) NOT NULL,
    codigo_rol          VARCHAR(25)  NOT NULL,
    esActivo            TINYINT(4)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rbac_modulos (
    idModulos           INT AUTO_INCREMENT PRIMARY KEY,
    id_sistema          INT          NOT NULL,
    Nombre              VARCHAR(255) NOT NULL,
    esActivo            TINYINT(4)   NOT NULL DEFAULT 1,
    FOREIGN KEY (id_sistema) REFERENCES rbac_sistema(idSistema)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rbac_modulos_operaciones (
    idModulosOperaciones INT AUTO_INCREMENT PRIMARY KEY,
    idModulos           INT        NOT NULL,
    idOperaciones       INT        NOT NULL,
    fecha_creacion      DATE       NULL,
    fecha_modificacion  DATE       NULL,
    esActivo            TINYINT(4) NOT NULL DEFAULT 1,
    FOREIGN KEY (idModulos) REFERENCES rbac_modulos(idModulos),
    FOREIGN KEY (idOperaciones) REFERENCES rbac_operaciones(idOperaciones)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rbac_rol_modulo_operacion (
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

CREATE TABLE IF NOT EXISTS rbac_usuario_rol (
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
