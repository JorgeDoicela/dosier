-- =============================================================================
-- DOSIER / SIGAFI - Base de Datos Institucional Anonimizada (LOPDP Compliant)
-- =============================================================================
-- Generado con Pipeline de Sanitización Oficial para el ISTPET.
-- Conserva el catálogo curricular real (carreras, mallas, periodos, materias)
-- y anonimiza estrictamente datos personales y credenciales bajo la LOPDP.
-- =============================================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `sigafi_es` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sigafi_es`;

-- -----------------------------------------------------------------------------
-- 1. ESTRUCTURA COMPLETA DDL DE TABLAS (sigafi_es)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `aceptaciones_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aceptaciones_usuarios` (
  `idAceptacionUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` varchar(14) DEFAULT NULL,
  `idTermino` int(11) DEFAULT NULL,
  `sistema` varchar(100) DEFAULT NULL,
  `fechaRegistro` datetime DEFAULT NULL,
  `ipOrigen` varchar(50) DEFAULT NULL,
  `dispositivo` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idAceptacionUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `adjuntos_imagenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adjuntos_imagenes` (
  `idAdjuntos_Imagenes` int(11) NOT NULL AUTO_INCREMENT,
  `NombreArchivos` varchar(90) DEFAULT NULL,
  `Extension` varchar(90) DEFAULT NULL,
  `MimeTypes` varchar(90) DEFAULT NULL,
  `TamanioBytes` int(11) DEFAULT NULL,
  `Ruta` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idAdjuntos_Imagenes`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `administrador` (
  `idAdministrador` varchar(16) NOT NULL,
  `NombresCompletos` varchar(120) DEFAULT NULL,
  `ApellidosCompletos` varchar(120) DEFAULT NULL,
  `password` varchar(90) DEFAULT NULL,
  `esAdministrador` tinyint(4) DEFAULT NULL,
  `fecha_Asignacion` date DEFAULT NULL,
  `fecha_modificacion` date DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  `primerIngreso` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idAdministrador`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `agenda_academica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agenda_academica` (
  `idperiodo` varchar(7) DEFAULT NULL,
  `fecha_desde` date DEFAULT NULL,
  `fecha_hasta` date DEFAULT NULL,
  `evento` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos` (
  `idAlumno` varchar(14) NOT NULL DEFAULT '',
  `tipoDocumento` char(1) DEFAULT NULL,
  `apellidoPaterno` varchar(30) DEFAULT NULL,
  `apellidoMaterno` varchar(30) DEFAULT NULL,
  `primerNombre` varchar(30) DEFAULT NULL,
  `segundoNombre` varchar(30) DEFAULT NULL,
  `fecha_Nacimiento` date DEFAULT NULL,
  `direccion` varchar(60) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `email` varchar(40) DEFAULT NULL,
  `ciudad_Nacimiento` varchar(30) DEFAULT NULL,
  `provincia_Nacimiento` varchar(40) DEFAULT NULL,
  `foto` longblob,
  `sexo` char(1) DEFAULT NULL,
  `nacionalidad` varchar(50) DEFAULT NULL,
  `idNivel` int(11) DEFAULT '1',
  `idPeriodo` char(7) DEFAULT NULL,
  `idSeccion` int(11) DEFAULT NULL,
  `idModalidad` int(11) DEFAULT NULL,
  `idInstitucion` int(11) DEFAULT NULL,
  `tituloColegio` varchar(200) DEFAULT NULL,
  `fecha_Inscripcion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `parroquia_nacimiento` varchar(100) DEFAULT NULL,
  `nombre_padre` varchar(150) DEFAULT NULL,
  `ocupacion_padre` varchar(150) DEFAULT NULL,
  `nacionalidad_padre` varchar(30) DEFAULT NULL,
  `nombre_madre` varchar(150) DEFAULT NULL,
  `ocupacion_madre` varchar(150) DEFAULT NULL,
  `nacionalidad_madre` varchar(150) DEFAULT NULL,
  `barrio_residencia` varchar(150) DEFAULT NULL,
  `parroquia_residencia` varchar(150) DEFAULT NULL,
  `ciudad_residencia` varchar(100) DEFAULT NULL,
  `tipo_sangre` varchar(6) DEFAULT NULL,
  `user_alumno` varchar(20) DEFAULT NULL,
  `password` varchar(20) DEFAULT NULL,
  `idDiscapacidad` int(11) DEFAULT NULL,
  `idEtnia` int(11) DEFAULT NULL,
  `idNacionalidad` int(11) DEFAULT NULL,
  `porcentaje_discapacidad` int(11) DEFAULT NULL,
  `carnet_conadis` varchar(20) DEFAULT NULL,
  `email_institucional` varchar(100) DEFAULT NULL,
  `primerIngreso` tinyint(4) DEFAULT '1',
  `archivofoto` varchar(100) DEFAULT NULL,
  `fotoAprobada` tinyint(4) DEFAULT NULL,
  `IdEstadoCivil` int(11) DEFAULT NULL,
  `idGeneroAlumno` int(11) DEFAULT NULL,
  `idNacionalidadEtnica` int(11) DEFAULT NULL,
  `idParroquiaResidencia` int(11) DEFAULT NULL,
  `tipoInstitucion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idAlumno`),
  KEY `fk_alumnos_estadoCivil_idx` (`IdEstadoCivil`),
  KEY `fk_alumnos_genero_idx` (`idGeneroAlumno`),
  KEY `fk_alumnos_nacionalidad_idx` (`idNacionalidadEtnica`),
  KEY `fk_alumnos_parroquiaResidencia_idx` (`idParroquiaResidencia`),
  CONSTRAINT `fk_alumnos_estadoCivil` FOREIGN KEY (`IdEstadoCivil`) REFERENCES `estadocivil` (`idestadoCivil`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_alumnos_genero` FOREIGN KEY (`idGeneroAlumno`) REFERENCES `bien_genero_alumno` (`idGeneroAlumno`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_alumnos_nacionalidad` FOREIGN KEY (`idNacionalidadEtnica`) REFERENCES `etnias` (`idEtnia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_alumnos_parroquiaResidencia` FOREIGN KEY (`idParroquiaResidencia`) REFERENCES `parroquias` (`idParroquias`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `alumnos_acta_conduccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos_acta_conduccion` (
  `idalumno` varchar(14) NOT NULL,
  `numero_acta` int(11) DEFAULT NULL,
  `fecha_grado` date DEFAULT NULL,
  `idperiodo` varchar(7) NOT NULL,
  PRIMARY KEY (`idalumno`,`idperiodo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `alumnos_carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos_carreras` (
  `idAlumno` varchar(14) NOT NULL,
  `idCarrera` int(11) NOT NULL,
  `convalidacion` tinyint(4) DEFAULT '0',
  `carrera_convalidada` varchar(100) DEFAULT NULL,
  `institucion_convalidada` varchar(100) DEFAULT NULL,
  `creditos_convalidados` int(11) DEFAULT '0',
  `pasantias` tinyint(4) DEFAULT '0',
  `nota_pasantia` decimal(5,2) DEFAULT '0.00',
  `creditos_pasantia` int(11) DEFAULT '0',
  `trabajo_grado` tinyint(4) DEFAULT '0',
  `nota_documento` decimal(5,2) DEFAULT '0.00',
  `nota_defensa` decimal(5,2) DEFAULT '0.00',
  `nota_tesis` decimal(5,2) DEFAULT '0.00',
  `creditos_titulo` int(11) DEFAULT NULL,
  PRIMARY KEY (`idAlumno`,`idCarrera`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `alumnos_habilidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos_habilidades` (
  `idalumnos_habilidades` int(11) NOT NULL AUTO_INCREMENT,
  `idAlumno` varchar(14) DEFAULT NULL,
  `idhabilidades` int(11) NOT NULL,
  `nivel` enum('basico','intermedio','avanzado') DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idalumnos_habilidades`),
  KEY `idhabilidades` (`idhabilidades`),
  CONSTRAINT `alumnos_habilidades_ibfk_1` FOREIGN KEY (`idhabilidades`) REFERENCES `habilidades` (`idhabilidades`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `alumnos_inscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos_inscripciones` (
  `idInscripcion` int(11) NOT NULL AUTO_INCREMENT,
  `idalumno` varchar(14) DEFAULT NULL,
  `idPeriodo` varchar(7) DEFAULT NULL,
  `idModalidad` int(11) DEFAULT NULL,
  `idNivel` int(11) DEFAULT NULL,
  `idSeccion` int(11) DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario` varchar(20) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `idMedio` int(11) DEFAULT NULL,
  PRIMARY KEY (`idInscripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=6555 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `alumnos_inscripciones_ingles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos_inscripciones_ingles` (
  `idAlumno` varchar(14) NOT NULL,
  `idPeriodo` varchar(7) NOT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_inscripcion` varchar(20) DEFAULT NULL,
  `puntaje` decimal(18,2) DEFAULT NULL,
  `idAsignatura` int(11) DEFAULT NULL,
  `idMalla` int(11) DEFAULT NULL,
  `observacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idAlumno`,`idPeriodo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `alumnos_referencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos_referencias` (
  `idalumnos_referencias` int(11) NOT NULL AUTO_INCREMENT,
  `idAlumno` varchar(14) NOT NULL,
  `nombres_referencia` varchar(255) DEFAULT NULL,
  `contacto` varchar(255) DEFAULT NULL,
  `referencia_empresa` varchar(150) DEFAULT NULL,
  `relacion` varchar(100) DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `fecha_modificacion` date DEFAULT NULL,
  PRIMARY KEY (`idalumnos_referencias`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `alumnos_restricciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos_restricciones` (
  `idalumno` varchar(14) NOT NULL,
  `idrestriccion` varchar(5) NOT NULL,
  PRIMARY KEY (`idalumno`,`idrestriccion`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `alumnos_sucesos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos_sucesos` (
  `idSuceso` int(11) NOT NULL AUTO_INCREMENT,
  `idAlumno` varchar(14) DEFAULT NULL,
  `idMatricula` int(11) DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `observacion` varchar(200) NOT NULL,
  `usuario` varchar(100) DEFAULT 'current_user',
  PRIMARY KEY (`idSuceso`)
) ENGINE=InnoDB AUTO_INCREMENT=5252 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `alumnos_titulos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos_titulos` (
  `idAlumno` varchar(14) NOT NULL,
  `idTitulo` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_acta` date DEFAULT NULL,
  `numero_acta` varchar(20) DEFAULT NULL,
  `primer_vocal` varchar(100) DEFAULT NULL,
  `segundo_vocal` varchar(100) DEFAULT NULL,
  `tercer_vocal` varchar(100) DEFAULT NULL,
  `secretaria` varchar(100) DEFAULT NULL,
  `rector` varchar(100) DEFAULT NULL,
  `vicerrector` varchar(100) DEFAULT NULL,
  `total_creditos` int(11) DEFAULT '0',
  `total_asignaturas` int(11) DEFAULT '0',
  `total_horas` int(11) DEFAULT '0',
  `puntaje_total` decimal(5,2) DEFAULT '0.00',
  `nota_final` decimal(5,2) DEFAULT '0.00',
  `titulo_tesis` varchar(400) DEFAULT NULL,
  `codigo_sistema` int(11) DEFAULT NULL,
  `promedio_estudios` decimal(5,2) DEFAULT '0.00',
  `nota_trabajo` decimal(5,2) DEFAULT '0.00',
  `nota_defensa` decimal(5,2) DEFAULT '0.00',
  `nota_complexivo` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`idAlumno`,`idTitulo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `asignacion_instructores_vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignacion_instructores_vehiculos` (
  `idAsignacion` int(11) NOT NULL AUTO_INCREMENT,
  `idVehiculo` int(11) NOT NULL,
  `idProfesor` varchar(14) NOT NULL,
  `fecha_asignacion` date DEFAULT NULL,
  `fecha_salidad` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `usuario_asigna` varchar(20) DEFAULT NULL,
  `usuario_desactiva` varchar(20) DEFAULT NULL,
  `observacion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idAsignacion`)
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `asignaciones_profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignaciones_profesores` (
  `idProfesor` varchar(14) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `idPeriodo` varchar(7) NOT NULL,
  `idModalidad` int(11) NOT NULL,
  `idSeccion` int(11) NOT NULL,
  `idNivel` int(11) NOT NULL,
  `paralelo` char(1) NOT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `fecha_grabar` datetime DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL,
  `codigo_asignacion` varchar(10) DEFAULT NULL,
  `entrega_acta` tinyint(4) DEFAULT '0',
  `ingresa_notas` tinyint(4) DEFAULT '0',
  `user_asignaciones` varchar(25) DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_inicial` date DEFAULT NULL,
  `user_acta` varchar(25) DEFAULT NULL,
  `idAsignacion` int(11) NOT NULL AUTO_INCREMENT,
  `esActivaAsignacion` tinyint(4) DEFAULT '1',
  `numeroHoras` decimal(10,2) DEFAULT NULL,
  `contabilizarHoraDocente` tinyint(4) DEFAULT '1',
  `horasPracticoExperimental` decimal(10,2) DEFAULT '0.00',
  `extraCurricular` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idProfesor`,`idAsignatura`,`idPeriodo`,`idModalidad`,`idSeccion`,`idNivel`,`paralelo`),
  UNIQUE KEY `idAsignacion` (`idAsignacion`)
) ENGINE=InnoDB AUTO_INCREMENT=25222 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `asignaciones_profesores_grado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignaciones_profesores_grado` (
  `idProfesor` varchar(14) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `idPeriodo` varchar(7) NOT NULL,
  `idModalidad` int(11) NOT NULL,
  `idSeccion` int(11) NOT NULL,
  `idNivel` int(11) NOT NULL,
  `paralelo` char(1) NOT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProfesor`,`idAsignatura`,`idPeriodo`,`idModalidad`,`idSeccion`,`idNivel`,`paralelo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `asignaciones_propedeutico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignaciones_propedeutico` (
  `idCarrera` int(11) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `activa` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idCarrera`,`idAsignatura`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `asignaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignaturas` (
  `idAsignatura` int(11) NOT NULL AUTO_INCREMENT,
  `asignatura` varchar(200) DEFAULT NULL,
  `anulada` tinyint(1) DEFAULT NULL,
  `codigo` varchar(30) DEFAULT NULL,
  `extraCurricular` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idAsignatura`)
) ENGINE=InnoDB AUTO_INCREMENT=622 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `asignaturas_complementos_formacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignaturas_complementos_formacion` (
  `idAsignatura` int(11) NOT NULL AUTO_INCREMENT,
  `idCarrera` int(11) DEFAULT NULL,
  `asignatura` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idAsignatura`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `asignaturas_propedeutico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignaturas_propedeutico` (
  `idAsignatura` int(11) NOT NULL AUTO_INCREMENT,
  `asignatura` varchar(50) DEFAULT NULL,
  `activa` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idAsignatura`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `entidad_id` varchar(100) DEFAULT NULL,
  `detalles` text,
  `ip_origen` varchar(45) DEFAULT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_usuario` (`usuario`),
  KEY `idx_audit_accion` (`accion`),
  KEY `idx_audit_fecha` (`fecha_hora`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `auditoria_pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auditoria_pagos` (
  `idpago` int(11) DEFAULT NULL,
  `idmatricula` int(11) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `numero_deposito` varchar(20) DEFAULT NULL,
  `cuenta` varchar(50) DEFAULT NULL,
  `valor` float DEFAULT NULL,
  `num_registro` int(11) DEFAULT NULL,
  `usuario` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_apoyo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_apoyo` (
  `idBienApoyo` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(50) DEFAULT NULL,
  `esBeca` tinyint(4) DEFAULT NULL,
  `esAyudaEconomica` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idBienApoyo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_apoyo_financiero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_apoyo_financiero` (
  `idApoyoFinanciero` int(11) NOT NULL AUTO_INCREMENT,
  `idResponsable` int(11) NOT NULL,
  `idResolucionesTribunales` int(11) NOT NULL,
  `idMatricula` int(11) NOT NULL,
  `observacion` varchar(100) DEFAULT NULL,
  `esAceptada` tinyint(4) NOT NULL,
  `fechaAceptacion` date DEFAULT NULL,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idApoyoFinanciero`),
  KEY `fk_bien_ayudas_economicas_bien_resoluciones_tribunales1_idx` (`idResolucionesTribunales`),
  KEY `fk_bien_ayudas_economicas_usuarios1_idx` (`idResponsable`),
  KEY `fk_bien_ayudas_economicas_matriculas1_idx` (`idMatricula`),
  CONSTRAINT `fk_bien_apoyo_financiero_usarioResponsable1` FOREIGN KEY (`idResponsable`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_ayudas_economicas_bien_resoluciones_tribunales1` FOREIGN KEY (`idResolucionesTribunales`) REFERENCES `bien_resoluciones_tribunales` (`idResolucionesTribunales`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_ayudas_economicas_matriculas1` FOREIGN KEY (`idMatricula`) REFERENCES `matriculas` (`idMatricula`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_catalogo_motivos_salida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_catalogo_motivos_salida` (
  `idMotivoSalida` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  `requiereEvidencia` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idMotivoSalida`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_convocatorias_becas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_convocatorias_becas` (
  `idConvocatoriasBecas` int(11) NOT NULL AUTO_INCREMENT,
  `fechaInicio` date NOT NULL,
  `fechaFin` date DEFAULT NULL,
  `idDetalleCronograma` int(11) DEFAULT NULL,
  `idTipoConvocatoria` int(11) NOT NULL,
  PRIMARY KEY (`idConvocatoriasBecas`),
  KEY `fk_bien_convocatorias_becas_cron_detalle_cronograma1_idx` (`idDetalleCronograma`),
  KEY `fk_bien_tipo_convocatoria_beca_idx` (`idTipoConvocatoria`),
  CONSTRAINT `fk_bien_convocatorias_becas_cron_detalle_cronograma1` FOREIGN KEY (`idDetalleCronograma`) REFERENCES `cron_detalle_cronograma` (`idDetalleCronograma`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_tipo_convocatoria_beca` FOREIGN KEY (`idTipoConvocatoria`) REFERENCES `bien_tipo_convocatoria` (`idTipoConvocatoria`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_datos_economicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_datos_economicos` (
  `idFichaSocioEconomica` int(11) NOT NULL,
  `familiaRecibeBono` tinyint(4) NOT NULL DEFAULT '0',
  `tipoActividadEconomica` enum('estudia','trabaja','ambos','ninguna') NOT NULL DEFAULT 'estudia',
  `ingresosPropios` decimal(10,2) NOT NULL DEFAULT '0.00',
  `empleaIngresos` varchar(255) DEFAULT NULL,
  `nombreBono` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idFichaSocioEconomica`),
  KEY `fk_recibeBono_bien_ficha_socioeconomica1_idx` (`idFichaSocioEconomica`),
  CONSTRAINT `fk_recibeBono_bien_ficha_socioeconomica1` FOREIGN KEY (`idFichaSocioEconomica`) REFERENCES `bien_ficha_socioeconomica` (`idFichaSocioEconomica`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_datos_educacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_datos_educacion` (
  `idDatosEducacion` int(11) NOT NULL AUTO_INCREMENT,
  `nombreCurso` varchar(100) NOT NULL,
  `nombreInstitucion` varchar(150) DEFAULT NULL,
  `esIstpet` tinyint(4) NOT NULL DEFAULT '0',
  `nivelEducacion` enum('tercer','cuarto','otro') NOT NULL,
  `estaCursando` tinyint(4) NOT NULL,
  `esPresencial` tinyint(4) NOT NULL,
  `esBecado` tinyint(4) NOT NULL,
  `tipoEducacion` enum('publica','privada') NOT NULL,
  `idAlumno` varchar(14) NOT NULL,
  PRIMARY KEY (`idDatosEducacion`),
  KEY `fk_bien_datos_educacion_alumnos1_idx` (`idAlumno`),
  CONSTRAINT `fk_bien_datos_educacion_alumnos1` FOREIGN KEY (`idAlumno`) REFERENCES `alumnos` (`idAlumno`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_detalle_vivienda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_detalle_vivienda` (
  `idAlumno` varchar(14) NOT NULL,
  `tipoDeVivienda` varchar(45) NOT NULL,
  `espaciosFisicos` int(11) NOT NULL,
  `dormitorios` int(11) NOT NULL,
  `referencia` varchar(255) NOT NULL,
  `miembrosHogar` int(11) DEFAULT NULL,
  `adultosVivienda` int(11) DEFAULT NULL,
  `niñosVivienda` int(11) DEFAULT NULL,
  `bonoDesarrolloHumano` tinyint(4) DEFAULT NULL,
  `ingresoPromedioHogar` decimal(10,2) DEFAULT NULL,
  `idFichaSocioEconomica` int(11) NOT NULL,
  PRIMARY KEY (`idAlumno`),
  KEY `fk_bien_detalle_vivienda_bien_detalle_alumno1_idx` (`idFichaSocioEconomica`),
  CONSTRAINT `fk_bien_detalle_vivienda_bien_detalle_alumno1` FOREIGN KEY (`idFichaSocioEconomica`) REFERENCES `bien_ficha_socioeconomica` (`idFichaSocioEconomica`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_ficha_socioeconomica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_ficha_socioeconomica` (
  `idFichaSocioEconomica` int(11) NOT NULL AUTO_INCREMENT,
  `idTipoVivienda` int(11) NOT NULL,
  `miembrosHogar` int(11) NOT NULL,
  `miembrosAdulto` int(11) NOT NULL,
  `miembrosNinos` int(11) NOT NULL,
  `fechaRegistro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estudiaOtroSitio` tinyint(4) NOT NULL,
  `espaciosFisicosVivienda` int(11) NOT NULL DEFAULT '0',
  `numeroDormitorioriosVivienda` int(11) NOT NULL DEFAULT '0',
  `idAlumno` varchar(14) NOT NULL,
  `requiereActualizacion` tinyint(4) DEFAULT NULL,
  `razonActualizacion` varchar(45) DEFAULT NULL,
  `ultimaFechaActualizacion` varchar(45) DEFAULT NULL,
  `idPeriodo` char(7) DEFAULT NULL,
  PRIMARY KEY (`idFichaSocioEconomica`),
  KEY `fk_bien_ficha_socioeconomica_bien_tipo_vivienda1_idx` (`idTipoVivienda`),
  KEY `fk_bien_ficha_socioeconomica_alumnos1_idx` (`idAlumno`),
  KEY `fk_bien_ficha_socioeconomica_periodo1_idx` (`idPeriodo`),
  CONSTRAINT `fk_bien_ficha_socioeconomica_alumnos1` FOREIGN KEY (`idAlumno`) REFERENCES `alumnos` (`idAlumno`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_ficha_socioeconomica_bien_tipo_vivienda1` FOREIGN KEY (`idTipoVivienda`) REFERENCES `bien_tipo_vivienda` (`idTipoVivienda`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_genero_alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_genero_alumno` (
  `idGeneroAlumno` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(30) NOT NULL,
  PRIMARY KEY (`idGeneroAlumno`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_motivos_beca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_motivos_beca` (
  `idMotivosBeca` int(11) NOT NULL AUTO_INCREMENT,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  `esDefault` tinyint(4) DEFAULT NULL,
  `idTipoApoyoFinanciero` int(11) NOT NULL,
  `idPorcentajeBecaMinimo` int(11) NOT NULL,
  `idPorcentajeBecaMaximo` int(11) DEFAULT NULL,
  PRIMARY KEY (`idMotivosBeca`),
  UNIQUE KEY `uq_motivo_porcetaje_default` (`idPorcentajeBecaMinimo`,`idTipoApoyoFinanciero`,`esActivo`),
  KEY `fk_bien_motivos_beca_bien_tipo_apoyo_financiero1_idx` (`idTipoApoyoFinanciero`),
  KEY `fk_bien_motivos_beca_bien_porcentaje_beca1_idx` (`idPorcentajeBecaMinimo`),
  CONSTRAINT `fk_bien_motivos_beca_bien_tipo_apoyo_financiero1` FOREIGN KEY (`idTipoApoyoFinanciero`) REFERENCES `bien_tipo_apoyo_financiero` (`idTipoApoyoFinanciero`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_nivel_instruccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_nivel_instruccion` (
  `idNivelInstruccion` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(50) NOT NULL,
  PRIMARY KEY (`idNivelInstruccion`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_parametro_requisito_beca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_parametro_requisito_beca` (
  `idParametroRequisitoBeca` int(11) NOT NULL AUTO_INCREMENT,
  `idRequistosBeca` int(11) NOT NULL,
  `esObligatorio` tinyint(4) NOT NULL DEFAULT '0',
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  `idTipoApoyoFinanciero` int(11) NOT NULL,
  PRIMARY KEY (`idParametroRequisitoBeca`),
  KEY `fk_bien_parametro_requisito_beca_bien_requisitos_beca1_idx` (`idRequistosBeca`),
  KEY `fk_bien_parametro_requisito_beca_bien_tipo_apoyo_financiero_idx` (`idTipoApoyoFinanciero`),
  CONSTRAINT `fk_bien_parametro_requisito_beca_bien_requisitos_beca1` FOREIGN KEY (`idRequistosBeca`) REFERENCES `bien_requisitos_beca` (`idRequistosBeca`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_parametro_requisito_beca_bien_tipo_apoyo_financiero1` FOREIGN KEY (`idTipoApoyoFinanciero`) REFERENCES `bien_tipo_apoyo_financiero` (`idTipoApoyoFinanciero`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_parentescos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_parentescos` (
  `idParentezco` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `esPadre` tinyint(4) NOT NULL,
  `esMadre` tinyint(4) NOT NULL,
  PRIMARY KEY (`idParentezco`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_parentezcos_alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_parentezcos_alumno` (
  `idParentezcoAlumno` int(11) NOT NULL AUTO_INCREMENT,
  `idParentezco` int(11) NOT NULL,
  `idAlumno` varchar(14) NOT NULL,
  `idpaises` int(11) DEFAULT NULL,
  `idNivelInstruccion` int(11) DEFAULT NULL,
  `nombre` varchar(90) NOT NULL,
  `ingresoMensualPromedio` decimal(10,2) DEFAULT NULL,
  `esResponsableEconomico` tinyint(4) NOT NULL,
  `contactoEmergencia` tinyint(4) NOT NULL,
  `numeroContactoEmergencia` varchar(45) DEFAULT NULL,
  `esCarga` tinyint(4) DEFAULT '0',
  `tieneDiscapacidad` tinyint(4) DEFAULT '0',
  `esActivo` tinyint(4) NOT NULL,
  PRIMARY KEY (`idParentezcoAlumno`),
  KEY `fk_bien_parentezcos_fichas_personas_bien_parentescos1_idx` (`idParentezco`),
  KEY `fk_bien_parentezcos_fichas_personas_alumnos1_idx` (`idAlumno`),
  KEY `fk_bien_parentezcos_alumno_bien_nivel_instruccion1_idx` (`idNivelInstruccion`),
  KEY `fk_bien_parentezcos_alumno_paises1_idx` (`idpaises`),
  CONSTRAINT `fk_bien_parentezcos_alumno_bien_nivel_instruccion1` FOREIGN KEY (`idNivelInstruccion`) REFERENCES `bien_nivel_instruccion` (`idNivelInstruccion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_parentezcos_alumno_paises1` FOREIGN KEY (`idpaises`) REFERENCES `paises` (`idpaises`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_parentezcos_fichas_personas_alumnos1` FOREIGN KEY (`idAlumno`) REFERENCES `alumnos` (`idAlumno`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_parentezcos_fichas_personas_bien_parentescos1` FOREIGN KEY (`idParentezco`) REFERENCES `bien_parentescos` (`idParentezco`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_permisos_evidencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_permisos_evidencias` (
  `idEvidencia` int(11) NOT NULL AUTO_INCREMENT,
  `idPermisosSalidasAlumnos` int(11) NOT NULL,
  `idAdjuntosImagenes` int(11) NOT NULL,
  `nombreArchivo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idEvidencia`),
  KEY `fk_permiso1_idx` (`idPermisosSalidasAlumnos`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_permisos_salidas_alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_permisos_salidas_alumnos` (
  `idPermisosSalidasAlumnos` int(11) NOT NULL AUTO_INCREMENT,
  `idMatricula` int(11) NOT NULL,
  `idMotivoSalida` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `fechaRetorno` datetime DEFAULT NULL,
  `ocupado` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idPermisosSalidasAlumnos`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_porcentaje_beca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_porcentaje_beca` (
  `idPorcentajeBeca` int(11) NOT NULL AUTO_INCREMENT,
  `porcentaje` decimal(10,2) NOT NULL,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idPorcentajeBeca`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_postulacion_requisitos_becas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_postulacion_requisitos_becas` (
  `idPostulacionBecaDocumentos` int(11) NOT NULL AUTO_INCREMENT,
  `idParametroRequisitoBeca` int(11) NOT NULL,
  `estadoDocumento` enum('pendiente','aprobado','rechazado') NOT NULL,
  `observacionBienestar` varchar(500) DEFAULT NULL,
  `fechaValidacionBienestar` datetime DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  `idPostulacionesBecas` int(11) NOT NULL,
  `idUsuarioBienestar` int(11) DEFAULT NULL,
  `requisitoBool` tinyint(4) DEFAULT NULL,
  `requisitoAdjunto` int(11) DEFAULT NULL,
  PRIMARY KEY (`idPostulacionBecaDocumentos`),
  KEY `fk_bien_postulacion_becas_documentos_bien_parametro_requisi_idx` (`idParametroRequisitoBeca`),
  KEY `fk_bien_postulacion_becas_documentos_bien_postulaciones_bec_idx` (`idPostulacionesBecas`),
  KEY `fk_bien_postulacion_becas_documentos_usuarios1_idx` (`idUsuarioBienestar`),
  KEY `fk_bien_postulacion_becas_documentos_adjuntos_imagenes1_idx` (`requisitoAdjunto`),
  CONSTRAINT `fk_bien_postulacion_becas_documentos_adjuntos_imagenes1` FOREIGN KEY (`requisitoAdjunto`) REFERENCES `adjuntos_imagenes` (`idAdjuntos_Imagenes`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_postulacion_becas_documentos_bien_parametro_requisito1` FOREIGN KEY (`idParametroRequisitoBeca`) REFERENCES `bien_parametro_requisito_beca` (`idParametroRequisitoBeca`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_postulacion_becas_documentos_bien_postulaciones_bec1` FOREIGN KEY (`idPostulacionesBecas`) REFERENCES `bien_postulaciones_becas` (`idPostulacionesBecas`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_postulacion_becas_documentos_usuarios1` FOREIGN KEY (`idUsuarioBienestar`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_postulaciones_becas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_postulaciones_becas` (
  `idPostulacionesBecas` int(11) NOT NULL AUTO_INCREMENT,
  `idConvocatoriasBecas` int(11) DEFAULT NULL,
  `idMotivosBeca` int(11) DEFAULT NULL,
  `idUsuarioBienestar` int(11) DEFAULT NULL,
  `idMatricula` int(11) NOT NULL,
  `fechaRegistro` date NOT NULL,
  `estadoBienestar` enum('pendiente','en_revision','aprobada','rechazada','desistida') NOT NULL,
  `observacionBienestar` text,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  `fechaValidacionBienestar` datetime DEFAULT NULL,
  `fechaActualizado` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idPostulacionesBecas`),
  KEY `fk_bien_postulaciones_becas_bien_motivos_beca1_idx` (`idMotivosBeca`),
  KEY `fk_bien_postulaciones_becas_bien_convocatorias_becas1_idx` (`idConvocatoriasBecas`),
  KEY `fk_bien_postulaciones_becas_usuarios1_idx` (`idUsuarioBienestar`),
  KEY `fk_bien_postulaciones_becas_matriculas1_idx` (`idMatricula`),
  CONSTRAINT `fk_bien_postulaciones_becas_bien_convocatorias_becas1` FOREIGN KEY (`idConvocatoriasBecas`) REFERENCES `bien_convocatorias_becas` (`idConvocatoriasBecas`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_postulaciones_becas_matriculas1` FOREIGN KEY (`idMatricula`) REFERENCES `matriculas` (`idMatricula`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_postulaciones_becas_motivobeca` FOREIGN KEY (`idMotivosBeca`) REFERENCES `bien_motivos_beca` (`idMotivosBeca`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_postulaciones_becas_usuarioBienestar` FOREIGN KEY (`idUsuarioBienestar`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_requisitos_beca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_requisitos_beca` (
  `idRequistosBeca` int(11) NOT NULL AUTO_INCREMENT,
  `requisito` varchar(250) NOT NULL,
  `tipoRequisito` enum('adjunto','bool') NOT NULL,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idRequistosBeca`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_resoluciones_tribunales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_resoluciones_tribunales` (
  `idResolucionesTribunales` int(11) NOT NULL AUTO_INCREMENT,
  `idPostulacionesBecas` int(11) NOT NULL,
  `idUsuarioRegistra` int(11) NOT NULL,
  `idPeriodo` char(7) NOT NULL,
  `resolucion` enum('aprobada','anulada','rechazada','votacion') DEFAULT NULL,
  `porcentajeFinal` decimal(10,2) NOT NULL,
  `observacion` text,
  `fechaActualizacion` datetime DEFAULT NULL,
  `fechaRegistro` datetime NOT NULL,
  PRIMARY KEY (`idResolucionesTribunales`),
  UNIQUE KEY `index5` (`idPostulacionesBecas`,`resolucion`,`idPeriodo`),
  KEY `fk_bien_resoluciones_tribunales_bien_postulaciones_becas1_idx` (`idPostulacionesBecas`),
  KEY `fk_bien_resoluciones_tribunales_usuarios1_idx` (`idUsuarioRegistra`),
  KEY `fk_bien_resoluciones_tribunales_periodos1_idx` (`idPeriodo`),
  CONSTRAINT `fk_bien_resoluciones_tribunales_periodos1` FOREIGN KEY (`idPeriodo`) REFERENCES `periodos` (`idPeriodo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_resoluciones_tribunales_postulaciones` FOREIGN KEY (`idPostulacionesBecas`) REFERENCES `bien_postulaciones_becas` (`idPostulacionesBecas`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_resoluciones_tribunales_usuarioRegisra` FOREIGN KEY (`idUsuarioRegistra`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_servicios_fichas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_servicios_fichas` (
  `idServicioFicha` int(11) NOT NULL AUTO_INCREMENT,
  `tieneServicio` tinyint(4) NOT NULL DEFAULT '1',
  `idTipoServicio` int(11) NOT NULL,
  `idFichaSocioEconomica` int(11) NOT NULL,
  PRIMARY KEY (`idServicioFicha`),
  KEY `fk_detalle_servicio_vivienda_bien_detalle_servicios1_idx` (`idTipoServicio`),
  KEY `fk_detalle_servicio_vivienda_bien_ficha_socioeconomica1_idx` (`idFichaSocioEconomica`),
  CONSTRAINT `fk_detalle_servicio_vivienda_bien_detalle_servicios1` FOREIGN KEY (`idTipoServicio`) REFERENCES `bien_tipo_servicios` (`idTipoServicio`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_detalle_servicio_vivienda_bien_ficha_socioeconomica1` FOREIGN KEY (`idFichaSocioEconomica`) REFERENCES `bien_ficha_socioeconomica` (`idFichaSocioEconomica`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_tipo_apoyo_financiero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_tipo_apoyo_financiero` (
  `idTipoApoyoFinanciero` int(11) NOT NULL AUTO_INCREMENT,
  `idBienApoyo` int(11) NOT NULL,
  `nombreApoyo` varchar(100) NOT NULL,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idTipoApoyoFinanciero`),
  KEY `fk_bien_tipo_apoyo_financiero_bien_apoyo1_idx` (`idBienApoyo`),
  CONSTRAINT `fk_bien_tipo_apoyo_financiero_bien_apoyo1` FOREIGN KEY (`idBienApoyo`) REFERENCES `bien_apoyo` (`idBienApoyo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_tipo_cargo_tribunal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_tipo_cargo_tribunal` (
  `idTipoCargoTribunal` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(50) NOT NULL,
  `esRector` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idTipoCargoTribunal`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_tipo_convocatoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_tipo_convocatoria` (
  `idTipoConvocatoria` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(255) NOT NULL,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  `esInformativo` tinyint(4) NOT NULL,
  `bloquea` tinyint(4) NOT NULL,
  PRIMARY KEY (`idTipoConvocatoria`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_tipo_servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_tipo_servicios` (
  `idTipoServicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idTipoServicio`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_tipo_vivienda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_tipo_vivienda` (
  `idTipoVivienda` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(45) NOT NULL,
  PRIMARY KEY (`idTipoVivienda`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_tribunal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_tribunal` (
  `idUsuario` int(11) NOT NULL,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  `fechaCreacion` datetime NOT NULL,
  `fechaActualizacion` datetime DEFAULT NULL,
  `idTipoCargoTribunal` int(11) DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  KEY `fk_bien_tribunal_usuarios1_idx` (`idUsuario`),
  KEY `fk_bien_tribunal_tipocargo1_idx` (`idTipoCargoTribunal`),
  CONSTRAINT `fk_bien_tribunal_tipocargo1` FOREIGN KEY (`idTipoCargoTribunal`) REFERENCES `bien_tipo_cargo_tribunal` (`idTipoCargoTribunal`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_tribunal_usuarios1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bien_votos_tribunales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bien_votos_tribunales` (
  `idVotosTribunales` int(11) NOT NULL AUTO_INCREMENT,
  `estado` enum('aprobado','pendiente','rechazado') NOT NULL,
  `fechaCreacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `idResolucionesTribunales` int(11) NOT NULL,
  `idUsuarioTribunal` int(11) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `idCargoOcupado` int(11) DEFAULT NULL,
  PRIMARY KEY (`idVotosTribunales`),
  UNIQUE KEY `index4` (`idResolucionesTribunales`),
  KEY `fk_bien_votos_tribunales_bien_resoluciones_tribunales1_idx` (`idResolucionesTribunales`),
  KEY `fk_bien_votos_tribunales_bien_tribunal1_idx` (`idUsuarioTribunal`),
  KEY `fk_bien_votos_tribunales_bien_tipo_cargo_tribunal1` (`idCargoOcupado`),
  CONSTRAINT `fk_bien_votos_tribunales_bien_resoluciones_tribunales1` FOREIGN KEY (`idResolucionesTribunales`) REFERENCES `bien_resoluciones_tribunales` (`idResolucionesTribunales`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_votos_tribunales_bien_tipo_cargo_tribunal1` FOREIGN KEY (`idCargoOcupado`) REFERENCES `bien_tipo_cargo_tribunal` (`idTipoCargoTribunal`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_bien_votos_tribunales_bien_tribunal1` FOREIGN KEY (`idUsuarioTribunal`) REFERENCES `bien_tribunal` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `calificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calificaciones` (
  `idMatricula` int(11) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `idNivel` int(11) DEFAULT NULL,
  `paralelo` varchar(10) DEFAULT NULL,
  `idSeccion` int(11) DEFAULT NULL,
  `idModalidad` int(11) DEFAULT NULL,
  `ef1` decimal(4,2) DEFAULT '0.00',
  `ep1` decimal(4,2) DEFAULT '0.00',
  `nota1` decimal(4,2) DEFAULT '0.00',
  `faltasi1` int(11) DEFAULT '0',
  `faltasj1` int(11) DEFAULT '0',
  `ef2` decimal(4,2) DEFAULT '0.00',
  `ep2` decimal(4,2) DEFAULT '0.00',
  `nota2` decimal(4,2) DEFAULT '0.00',
  `faltasi2` int(11) DEFAULT '0',
  `faltasj2` int(11) DEFAULT '0',
  `nota3` decimal(4,2) DEFAULT '0.00',
  `faltasi3` int(11) DEFAULT '0',
  `faltasj3` int(11) DEFAULT '0',
  `nota4` decimal(4,2) DEFAULT '0.00',
  `faltasi4` int(11) DEFAULT '0',
  `faltasj4` int(11) DEFAULT '0',
  `nota5` decimal(4,2) DEFAULT '0.00',
  `horas_asistidas` int(11) DEFAULT '0',
  `remedial_parcial` decimal(4,2) DEFAULT '0.00',
  `promedio_parcial` decimal(4,2) DEFAULT '0.00',
  `examen` decimal(4,2) DEFAULT '0.00',
  `remedial_final` decimal(4,2) DEFAULT '0.00',
  `promedio_final` decimal(4,2) DEFAULT '0.00',
  `nota_final` decimal(4,2) DEFAULT '0.00',
  `aprobado` tinyint(1) DEFAULT '0',
  `remedial` tinyint(1) DEFAULT '0',
  `observacion` varchar(100) DEFAULT NULL,
  `tipo` varchar(4) DEFAULT NULL,
  `pierde_faltas` tinyint(4) DEFAULT '0',
  `codigoSolicitud` varchar(20) DEFAULT NULL,
  `fechaMaximaRemedial` date DEFAULT NULL,
  PRIMARY KEY (`idAsignatura`,`idMatricula`),
  KEY `R_30` (`idMatricula`),
  CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`idAsignatura`) REFERENCES `asignaturas` (`idAsignatura`),
  CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`idMatricula`) REFERENCES `matriculas` (`idMatricula`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `calificaciones_complementos_formacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calificaciones_complementos_formacion` (
  `idAlumno` varchar(14) NOT NULL,
  `idComplemento` int(11) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `notaFinal` decimal(5,2) DEFAULT '0.00',
  `aprobado` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idAlumno`,`idComplemento`,`idAsignatura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `calificaciones_conduccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calificaciones_conduccion` (
  `idmatricula` int(11) DEFAULT NULL,
  `nota_final` int(11) DEFAULT NULL,
  `aprobado` tinyint(1) DEFAULT '0',
  `observacion` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `calificaciones_grado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calificaciones_grado` (
  `idMatricula` int(11) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `nota` decimal(4,2) DEFAULT '0.00',
  `aprobado` tinyint(1) DEFAULT '0',
  `fecha_evaluacion` date DEFAULT NULL,
  PRIMARY KEY (`idMatricula`,`idAsignatura`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `calificaciones_propedeutico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calificaciones_propedeutico` (
  `idAlumno` varchar(14) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `idPeriodo` varchar(7) NOT NULL,
  `nota1` decimal(10,0) DEFAULT NULL,
  `aprobado` tinyint(4) DEFAULT '0',
  `observacion` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idAlumno`,`idAsignatura`,`idPeriodo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cambiosmalla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cambiosmalla` (
  `idCambioMalla` int(11) NOT NULL AUTO_INCREMENT,
  `idMalla` int(11) NOT NULL,
  `Fecha` date DEFAULT NULL,
  `Cambio` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idCambioMalla`),
  KEY `R_16` (`idMalla`),
  CONSTRAINT `cambiosmalla_ibfk_1` FOREIGN KEY (`idMalla`) REFERENCES `mallas` (`idMalla`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `campo_amplio_unesco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campo_amplio_unesco` (
  `idCampoAmplioUnesco` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `codigoAmplio` varchar(10) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idCampoAmplioUnesco`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `campo_detallado_unesco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campo_detallado_unesco` (
  `idCampoDetalladoUnesco` int(11) NOT NULL AUTO_INCREMENT,
  `idCampospecificoUnesco` int(11) DEFAULT NULL,
  `nombreDetallado` varchar(100) DEFAULT NULL,
  `codigoDetallado` varchar(10) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idCampoDetalladoUnesco`),
  KEY `idCampospecificoUnesco` (`idCampospecificoUnesco`),
  CONSTRAINT `campo_detallado_unesco_ibfk_1` FOREIGN KEY (`idCampospecificoUnesco`) REFERENCES `campo_especifico_unesco` (`idCampospecificoUnesco`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `campo_especifico_unesco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campo_especifico_unesco` (
  `idCampospecificoUnesco` int(11) NOT NULL AUTO_INCREMENT,
  `idCampoAmplioUnesco` int(11) DEFAULT NULL,
  `nombreEspecifico` varchar(100) DEFAULT NULL,
  `codigoEspecifico` varchar(10) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idCampospecificoUnesco`),
  KEY `idCampoAmplioUnesco` (`idCampoAmplioUnesco`),
  CONSTRAINT `campo_especifico_unesco_ibfk_1` FOREIGN KEY (`idCampoAmplioUnesco`) REFERENCES `campo_amplio_unesco` (`idCampoAmplioUnesco`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cargo_instituto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cargo_instituto` (
  `idCargoInstituto` int(11) NOT NULL AUTO_INCREMENT,
  `idTipoFuncionario` int(11) NOT NULL,
  `nombre` varchar(90) DEFAULT NULL,
  `disponibilidad_cargo` int(11) DEFAULT NULL,
  PRIMARY KEY (`idCargoInstituto`),
  KEY `fk_cargo_instituto_tipo_funcionario1_idx` (`idTipoFuncionario`),
  CONSTRAINT `fk_cargo_instituto_tipo_funcionario1` FOREIGN KEY (`idTipoFuncionario`) REFERENCES `tipo_funcionario` (`idTipoFuncionario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cargos_ofertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cargos_ofertas` (
  `idcargos_ofertas` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_cargo` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idcargos_ofertas`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carreras` (
  `idCarrera` int(11) NOT NULL AUTO_INCREMENT,
  `Carrera` varchar(100) DEFAULT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `activa` tinyint(1) DEFAULT NULL,
  `directorCarrera` varchar(100) DEFAULT NULL,
  `numero_creditos` int(11) DEFAULT NULL,
  `ordenCarrera` int(11) DEFAULT '0',
  `numero_alumnos` int(11) DEFAULT NULL,
  `revisaArrastres` tinyint(4) DEFAULT '1',
  `codigo_cases` varchar(20) DEFAULT NULL,
  `aliasCarrera` varchar(5) DEFAULT NULL,
  `BolsaEmpleo` tinyint(1) DEFAULT NULL,
  `esInstituto` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idCarrera`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `carreras_adjuntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carreras_adjuntos` (
  `idCarrerasAdjuntos` int(11) NOT NULL AUTO_INCREMENT,
  `idCarrera` int(11) NOT NULL,
  `idAdjuntos_Imagenes` int(11) NOT NULL,
  PRIMARY KEY (`idCarrerasAdjuntos`),
  KEY `idCarrera` (`idCarrera`),
  KEY `idAdjuntos_Imagenes` (`idAdjuntos_Imagenes`),
  CONSTRAINT `carreras_adjuntos_ibfk_1` FOREIGN KEY (`idCarrera`) REFERENCES `carreras` (`idCarrera`),
  CONSTRAINT `carreras_adjuntos_ibfk_2` FOREIGN KEY (`idAdjuntos_Imagenes`) REFERENCES `adjuntos_imagenes` (`idAdjuntos_Imagenes`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `categoria_contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoria_contratos` (
  `idCategoriaContratos` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`idCategoriaContratos`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `categoria_vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoria_vehiculos` (
  `idCategoria` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `categorias_actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias_actividades` (
  `idCategoria` int(7) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(100) NOT NULL,
  `esDocencia` tinyint(4) DEFAULT '0',
  `activo` tinyint(4) DEFAULT '1',
  `porcentaje` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `categorias_examenes_conduccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias_examenes_conduccion` (
  `IdCategoria` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(100) DEFAULT NULL,
  `tieneNota` tinyint(4) DEFAULT '0',
  `activa` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`IdCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `categorias_terminos_condiciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias_terminos_condiciones` (
  `idCategoria` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(50) DEFAULT NULL,
  `esAlumno` tinyint(4) DEFAULT '0',
  `esDocente` tinyint(4) DEFAULT '0',
  `esAdministrativo` tinyint(4) DEFAULT '0',
  `esExterno` tinyint(4) DEFAULT '0',
  `fechaRegistro` date DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idCategoria`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `categoriassolicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoriassolicitudes` (
  `idCategoriaSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idCategoriaSolicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `certificados_experiencia_laboral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificados_experiencia_laboral` (
  `idcertificados_experiencia_laboral` int(11) NOT NULL AUTO_INCREMENT,
  `idProfesor` varchar(14) NOT NULL,
  `fecha_emision` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `generado_automaticamente` tinyint(4) NOT NULL DEFAULT '0',
  `ruta` varchar(500) DEFAULT NULL,
  `esActivo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idcertificados_experiencia_laboral`),
  KEY `fk_certificados_experiencia_laboral_profesores1_idx` (`idProfesor`),
  CONSTRAINT `fk_certificados_experiencia_laboral_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ciudades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ciudades` (
  `idciudades` int(11) NOT NULL AUTO_INCREMENT,
  `idprovincias` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idciudades`),
  KEY `fk_cuidades_provincias1_idx` (`idprovincias`),
  CONSTRAINT `fk_cuidades_provincias1` FOREIGN KEY (`idprovincias`) REFERENCES `provincias` (`idprovincias`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=774 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `clausulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clausulas` (
  `idClausulas` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_clausula` varchar(150) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idClausulas`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cliente_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cliente_factura` (
  `documentoFactura` varchar(14) NOT NULL,
  `tipoDocumento` varchar(1) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `telefono` varchar(10) DEFAULT NULL,
  `email` varchar(60) DEFAULT NULL,
  `fechaCreacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`documentoFactura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `complementos_formacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `complementos_formacion` (
  `idComplemento` int(11) NOT NULL,
  `complemento` varchar(60) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idComplemento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cond_alumnos_horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cond_alumnos_horarios` (
  `idAsignacionHorario` int(11) NOT NULL AUTO_INCREMENT,
  `idAsignacion` int(11) NOT NULL,
  `idFecha` int(11) NOT NULL,
  `idHora` int(11) NOT NULL,
  `asiste` tinyint(4) DEFAULT '0',
  `activo` tinyint(4) DEFAULT '1',
  `observacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idAsignacionHorario`)
) ENGINE=InnoDB AUTO_INCREMENT=176992 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cond_alumnos_practicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cond_alumnos_practicas` (
  `idPractica` int(11) NOT NULL AUTO_INCREMENT,
  `idalumno` varchar(14) NOT NULL,
  `idvehiculo` int(11) NOT NULL,
  `idProfesor` varchar(14) NOT NULL,
  `idPeriodo` varchar(7) NOT NULL,
  `dia` varchar(15) DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora_salida` time DEFAULT NULL,
  `hora_llegada` time DEFAULT NULL,
  `tiempo` time DEFAULT NULL,
  `ensalida` tinyint(1) DEFAULT '0',
  `verificada` tinyint(1) DEFAULT '0',
  `user_asigna` varchar(20) DEFAULT NULL,
  `user_llegada` varchar(20) DEFAULT NULL,
  `cancelado` tinyint(1) DEFAULT '0',
  `observaciones` text,
  PRIMARY KEY (`idPractica`)
) ENGINE=InnoDB AUTO_INCREMENT=78877 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cond_alumnos_vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cond_alumnos_vehiculos` (
  `idAsignacion` int(11) NOT NULL AUTO_INCREMENT,
  `idAlumno` varchar(14) NOT NULL,
  `idVehiculo` int(11) NOT NULL,
  `idPeriodo` varchar(7) NOT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `fechaAsignacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaInicio` date DEFAULT NULL,
  `fechaFin` date DEFAULT NULL,
  `activa` tinyint(4) DEFAULT '1',
  `observacion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idAsignacion`)
) ENGINE=InnoDB AUTO_INCREMENT=20674 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cond_practicas_horarios_alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cond_practicas_horarios_alumnos` (
  `idPractica` int(11) NOT NULL,
  `idAsignacionHorario` int(11) NOT NULL,
  PRIMARY KEY (`idPractica`,`idAsignacionHorario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `configsharepoint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `configsharepoint` (
  `idSharePoint` int(11) NOT NULL AUTO_INCREMENT,
  `ClientID` varchar(225) NOT NULL,
  `TenanID` varchar(255) NOT NULL,
  `ClientSecret` varchar(255) NOT NULL,
  `AppID` varchar(255) NOT NULL,
  `RedirectURL` varchar(255) NOT NULL,
  `TenantName` varchar(100) NOT NULL,
  `SiteName` varchar(100) NOT NULL,
  `SiteID` varchar(255) NOT NULL,
  `ListID` varchar(255) NOT NULL,
  `DriveID` varchar(255) NOT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  `FechaCreado` date DEFAULT NULL,
  `FechaActualizado` date DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idSharePoint`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contratos` (
  `idContratos` int(11) NOT NULL AUTO_INCREMENT,
  `idInstitucionesInstituto` int(11) NOT NULL,
  `idProfesor` varchar(14) NOT NULL,
  `idDedicacionCategorias` int(11) NOT NULL,
  `idTiposContratos` int(11) DEFAULT NULL,
  `idRelacionIes` int(11) DEFAULT NULL,
  `iddepartamentos` int(11) DEFAULT NULL,
  `idCargoInstituto` int(11) DEFAULT NULL,
  `numeroContrato` varchar(90) DEFAULT NULL,
  `esAdendum` tinyint(4) DEFAULT NULL,
  `contratoVinculado` varchar(255) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_final` date DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  `archivoContrato` text,
  `archivoLegalizado` varchar(900) DEFAULT NULL,
  `archivoFiniquito` varchar(900) DEFAULT NULL,
  `archivoLegalizadoSalida` varchar(900) DEFAULT NULL,
  `ingreso_concurso` tinyint(4) DEFAULT NULL,
  `usuario_creo` varchar(50) CHARACTER SET utf8 NOT NULL,
  `usuarios_modifico` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `fecha_modifico` date DEFAULT NULL,
  `reingreso` date DEFAULT NULL,
  PRIMARY KEY (`idContratos`),
  KEY `fk_contratos_tipos_contratos1_idx` (`idTiposContratos`),
  KEY `fk_contratos_relacion_ies1_idx` (`idRelacionIes`),
  KEY `fk_contratos_profesores1_idx` (`idProfesor`),
  KEY `fk_contratos_instituciones_instituto1_idx` (`idInstitucionesInstituto`),
  KEY `fk_contratos_usuarios1_idx` (`usuario_creo`),
  KEY `fk_contratos_usuarios2_idx` (`usuarios_modifico`),
  KEY `fk_contratos_dedicacion_categorias1_idx` (`idDedicacionCategorias`),
  KEY `fk_contratos_cargo_instituto1_idx` (`idCargoInstituto`),
  KEY `fk_contratos_departamentos1_idx` (`iddepartamentos`),
  CONSTRAINT `fk_contratos_dedicacion_categorias1` FOREIGN KEY (`idDedicacionCategorias`) REFERENCES `dedicacion_categorias` (`idDedicacionCategorias`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_contratos_instituciones_instituto1` FOREIGN KEY (`idInstitucionesInstituto`) REFERENCES `instituciones_instituto` (`idInstitucionesInstituto`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_contratos_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=295 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `contratos_asignaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contratos_asignaturas` (
  `idContratosAsignaturas` int(11) NOT NULL AUTO_INCREMENT,
  `idContratos` int(11) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `idPeriodo` char(7) NOT NULL,
  `horas` int(11) DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  `idAsignacion` int(11) DEFAULT NULL,
  `paralelo` varchar(45) DEFAULT NULL,
  `idModalidad` int(11) DEFAULT NULL,
  `idSeccion` int(11) DEFAULT NULL,
  `idNivel` int(11) DEFAULT NULL,
  `pagada` tinyint(4) DEFAULT NULL,
  `valorHora` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`idContratosAsignaturas`),
  KEY `fk_contratos_asignaturas_contratos1_idx` (`idContratos`),
  KEY `fk_contratos_asignaturas_asignaturas1_idx` (`idAsignatura`),
  KEY `fk_contratos_asignaturas_periodos1_idx` (`idPeriodo`),
  KEY `fk_contratos_asignaturas_asignacion1_idx` (`idAsignacion`),
  CONSTRAINT `fk_contratos_asignaturas_asignaturas1` FOREIGN KEY (`idAsignatura`) REFERENCES `asignaturas` (`idAsignatura`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_contratos_asignaturas_contratos1` FOREIGN KEY (`idContratos`) REFERENCES `contratos` (`idContratos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_contratos_asignaturas_periodos1` FOREIGN KEY (`idPeriodo`) REFERENCES `periodos` (`idPeriodo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `contratos_facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contratos_facturas` (
  `idFacturasContratos` int(11) NOT NULL AUTO_INCREMENT,
  `idContratos` int(11) NOT NULL,
  `periodoFactura` date DEFAULT NULL,
  `numeroFactura` varchar(500) NOT NULL,
  `valorFacturado` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`idFacturasContratos`),
  KEY `fk_contratos_facturas_contratos1_idx` (`idContratos`),
  CONSTRAINT `fk_contratos_facturas_contratos1` FOREIGN KEY (`idContratos`) REFERENCES `contratos` (`idContratos`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `credito_alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `credito_alumno` (
  `idMatricula` int(11) NOT NULL,
  `idEspecie` int(11) NOT NULL,
  `credito_inicial` decimal(8,2) DEFAULT NULL,
  `saldo` decimal(8,2) DEFAULT NULL,
  `beca` decimal(8,2) DEFAULT NULL,
  `saldo_beca` decimal(8,2) DEFAULT NULL,
  `numero_cuotas` int(11) DEFAULT NULL,
  `valor_cuotas` decimal(8,2) DEFAULT NULL,
  `idCredito` int(11) NOT NULL AUTO_INCREMENT,
  `migradoContabilidad` tinyint(4) DEFAULT '0',
  `fechaMigracion` datetime DEFAULT NULL,
  `idDeudaApi` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`idMatricula`,`idEspecie`),
  KEY `idCredito` (`idCredito`)
) ENGINE=InnoDB AUTO_INCREMENT=122018 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `credito_alumno_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `credito_alumno_detalle` (
  `idCreditoAlumnoDetalle` int(11) NOT NULL AUTO_INCREMENT,
  `idCredito` int(11) DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `valorCuota` decimal(10,2) DEFAULT NULL,
  `valorAbonado` decimal(10,2) DEFAULT NULL,
  `cancelado` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idCreditoAlumnoDetalle`),
  KEY `fk_credito_alumno_detalle_credito_idx` (`idCredito`),
  CONSTRAINT `fk_credito_alumno_detalle_credito` FOREIGN KEY (`idCredito`) REFERENCES `credito_alumno` (`idCredito`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cron_cronograma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cron_cronograma` (
  `idCronograma` int(11) NOT NULL AUTO_INCREMENT,
  `idPeriodo` varchar(7) NOT NULL,
  `detalle` varchar(90) NOT NULL,
  `esPublico` tinyint(1) DEFAULT NULL,
  `esActivo` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`idCronograma`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cron_detalle_cronograma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cron_detalle_cronograma` (
  `idDetalleCronograma` int(11) NOT NULL AUTO_INCREMENT,
  `idCronograma` int(11) NOT NULL,
  `idTipoProceso` int(11) NOT NULL,
  `fechaInicio` datetime NOT NULL,
  `fechaFin` datetime NOT NULL,
  `fechaExtension` datetime DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idDetalleCronograma`),
  KEY `fk_dc_cronograma` (`idCronograma`),
  KEY `fk_cron_detalle_cronograma_cron_tipo_proceso1_idx` (`idTipoProceso`),
  CONSTRAINT `fk_cron_detalle_cronograma_cron_tipo_proceso1` FOREIGN KEY (`idTipoProceso`) REFERENCES `cron_tipo_proceso` (`idTipoProceso`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dc_cronograma` FOREIGN KEY (`idCronograma`) REFERENCES `cron_cronograma` (`idCronograma`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cron_dias_especiales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cron_dias_especiales` (
  `idDiasEspeciales` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT NULL,
  `idTipoDiaEspecial` int(11) NOT NULL,
  `idCronograma` int(11) DEFAULT NULL,
  `esRecuperable` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`idDiasEspeciales`),
  KEY `fk_cron_dias_tipo` (`idTipoDiaEspecial`),
  KEY `fk_cron_dias_cronograma` (`idCronograma`),
  CONSTRAINT `fk_cron_dias_cronograma` FOREIGN KEY (`idCronograma`) REFERENCES `cron_cronograma` (`idCronograma`),
  CONSTRAINT `fk_cron_dias_tipo` FOREIGN KEY (`idTipoDiaEspecial`) REFERENCES `cron_tipo_dia_especial` (`idTipoDiaEspecial`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cron_tipo_dia_especial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cron_tipo_dia_especial` (
  `idTipoDiaEspecial` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(150) DEFAULT NULL,
  `esFeriado` tinyint(1) DEFAULT NULL,
  `esEventoInterno` tinyint(1) DEFAULT NULL,
  `fechaOriginal` date DEFAULT NULL,
  PRIMARY KEY (`idTipoDiaEspecial`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cron_tipo_proceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cron_tipo_proceso` (
  `idTipoProceso` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(100) NOT NULL,
  `esInformativo` tinyint(1) DEFAULT NULL,
  `audiencia` varchar(15) NOT NULL,
  `orden` int(11) DEFAULT NULL,
  `esActivo` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`idTipoProceso`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cuentas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cuentas` (
  `idCuenta` int(11) NOT NULL AUTO_INCREMENT,
  `cuenta` varchar(100) NOT NULL,
  `numero_cuenta` varchar(20) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `esingreso` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `tipo_pago` varchar(2) DEFAULT NULL,
  PRIMARY KEY (`idCuenta`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cursos` (
  `idNivel` int(11) NOT NULL AUTO_INCREMENT,
  `idCarrera` int(11) NOT NULL,
  `Nivel` varchar(20) DEFAULT NULL,
  `jerarquia` int(11) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `esRecuperacion` tinyint(4) DEFAULT '0',
  `aliasCurso` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`idNivel`),
  KEY `R_5` (`idCarrera`),
  CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`idCarrera`) REFERENCES `carreras` (`idCarrera`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `cursos_profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cursos_profesores` (
  `idCursoProfesor` int(11) NOT NULL AUTO_INCREMENT,
  `idProfesor` varchar(14) NOT NULL,
  `nombre_curso` varchar(255) DEFAULT NULL,
  `Institucion` varchar(200) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_finalizacion` date DEFAULT NULL,
  `numero_horas` int(11) DEFAULT NULL,
  `esValido` tinyint(4) DEFAULT NULL,
  `archivoCurso` varchar(255) DEFAULT NULL,
  `financioInstituto` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idCursoProfesor`),
  KEY `fk_cursos_profesores_profesores1_idx` (`idProfesor`),
  CONSTRAINT `fk_cursos_profesores_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `dedicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dedicacion` (
  `idDedicacion` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`idDedicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `dedicacion_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dedicacion_categorias` (
  `idDedicacionCategorias` int(11) NOT NULL AUTO_INCREMENT,
  `idDedicacion` int(11) NOT NULL,
  `idEscalafon` int(11) NOT NULL,
  `horasMinimas` int(11) DEFAULT NULL,
  `horasMaximas` int(11) DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idDedicacionCategorias`),
  KEY `fk_dedicacion_categorias_dedicacion1_idx` (`idDedicacion`),
  KEY `fk_dedicacion_categorias_escalafon1_idx` (`idEscalafon`),
  CONSTRAINT `fk_dedicacion_categorias_dedicacion1` FOREIGN KEY (`idDedicacion`) REFERENCES `dedicacion` (`idDedicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_dedicacion_categorias_escalafon1` FOREIGN KEY (`idEscalafon`) REFERENCES `escalafon` (`idEscalafon`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departamentos` (
  `iddepartamentos` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_departamento` varchar(90) DEFAULT NULL,
  `abreviacion` varchar(45) DEFAULT NULL,
  `descripcion` text,
  `idInstitucion` int(11) DEFAULT NULL,
  PRIMARY KEY (`iddepartamentos`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `departamentossolicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departamentossolicitudes` (
  `idDepartamentoSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `departamento` varchar(60) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idDepartamentoSolicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `detalle_pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_pagos` (
  `idPago` int(11) NOT NULL,
  `idEspecie` int(11) NOT NULL,
  `valor` decimal(8,2) DEFAULT NULL,
  `descuento` decimal(8,2) DEFAULT NULL,
  `idCredito` int(11) DEFAULT NULL,
  `migradoContabilidad` tinyint(4) DEFAULT '0',
  `fechaMigracion` datetime DEFAULT NULL,
  PRIMARY KEY (`idPago`,`idEspecie`),
  KEY `R_36` (`idEspecie`),
  CONSTRAINT `detalle_pagos_ibfk_1` FOREIGN KEY (`idPago`) REFERENCES `pagos` (`idPago`),
  CONSTRAINT `detalle_pagos_ibfk_2` FOREIGN KEY (`idEspecie`) REFERENCES `especies` (`idEspecie`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `detalle_sistema_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_sistema_evaluacion` (
  `idperiodo` varchar(7) NOT NULL,
  `idcarrera` int(11) NOT NULL,
  `idsistemaevaluacion` int(11) NOT NULL,
  PRIMARY KEY (`idperiodo`,`idcarrera`,`idsistemaevaluacion`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `detallemallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detallemallas` (
  `idDetalleMalla` int(11) NOT NULL AUTO_INCREMENT,
  `idMalla` int(11) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `idNivel` int(11) NOT NULL,
  `idtipo_asignatura` int(11) NOT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `opcional` tinyint(1) DEFAULT NULL,
  `creditos` int(11) DEFAULT NULL,
  `horas` int(11) DEFAULT NULL,
  `anulada` tinyint(1) DEFAULT NULL,
  `horasDocente` int(11) DEFAULT '0',
  `horasPracticoExperimental` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`idDetalleMalla`),
  KEY `R_12` (`idMalla`),
  KEY `R_13` (`idAsignatura`),
  KEY `R_17` (`idNivel`),
  KEY `fk_detallemallas_tipos_asignatura1_idx` (`idtipo_asignatura`),
  CONSTRAINT `detallemallas_ibfk_1` FOREIGN KEY (`idMalla`) REFERENCES `mallas` (`idMalla`),
  CONSTRAINT `detallemallas_ibfk_2` FOREIGN KEY (`idAsignatura`) REFERENCES `asignaturas` (`idAsignatura`),
  CONSTRAINT `detallemallas_ibfk_3` FOREIGN KEY (`idNivel`) REFERENCES `cursos` (`idNivel`),
  CONSTRAINT `fk_detallemallas_tipos_asignatura1` FOREIGN KEY (`idtipo_asignatura`) REFERENCES `tipos_asignatura` (`idtipo_asignatura`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1191 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `detalles_documentos_pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalles_documentos_pagos` (
  `iddocumentopago` int(10) unsigned NOT NULL,
  `idpago` int(11) NOT NULL,
  `valor` decimal(8,2) NOT NULL,
  PRIMARY KEY (`iddocumentopago`,`idpago`),
  KEY `FK_detalles_documentos_pagos_2` (`idpago`),
  CONSTRAINT `FK_detalles_documentos_pagos_1` FOREIGN KEY (`iddocumentopago`) REFERENCES `documentos_pagos` (`iddocumentopago`),
  CONSTRAINT `FK_detalles_documentos_pagos_2` FOREIGN KEY (`idpago`) REFERENCES `pagos` (`idPago`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `detalles_ofertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalles_ofertas` (
  `iddetalles_ofertas` int(11) NOT NULL AUTO_INCREMENT,
  `idofertas_laborales` int(11) NOT NULL,
  `idjornadas_ofertas` int(11) NOT NULL,
  `idmodalidades_ofertas` int(11) NOT NULL,
  PRIMARY KEY (`iddetalles_ofertas`),
  UNIQUE KEY `modalidadofertas` (`idofertas_laborales`,`idjornadas_ofertas`,`idmodalidades_ofertas`),
  KEY `idjornadas_ofertas` (`idjornadas_ofertas`),
  KEY `idmodalidades_ofertas` (`idmodalidades_ofertas`),
  CONSTRAINT `detalles_ofertas_ibfk_1` FOREIGN KEY (`idjornadas_ofertas`) REFERENCES `jornadas_ofertas` (`idjornadas_ofertas`),
  CONSTRAINT `detalles_ofertas_ibfk_2` FOREIGN KEY (`idmodalidades_ofertas`) REFERENCES `modalidades_ofertas` (`idmodalidades_ofertas`),
  CONSTRAINT `detalles_ofertas_ibfk_3` FOREIGN KEY (`idofertas_laborales`) REFERENCES `ofertas_laborales` (`idofertas_laborales`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `discapacidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discapacidades` (
  `idDiscapacidad` int(11) NOT NULL AUTO_INCREMENT,
  `discapacidad` varchar(30) DEFAULT NULL,
  `esDefecto` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idDiscapacidad`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `documentos_adjuntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documentos_adjuntos` (
  `iddocumentos_adjuntos` int(11) NOT NULL AUTO_INCREMENT,
  `idAlumno` varchar(14) NOT NULL,
  `idtipos_documentos` int(11) NOT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `ruta_archivo` varchar(255) DEFAULT NULL,
  `fecha_Subida` timestamp NULL DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`iddocumentos_adjuntos`),
  KEY `idtipos_documentos` (`idtipos_documentos`),
  CONSTRAINT `documentos_adjuntos_ibfk_1` FOREIGN KEY (`idtipos_documentos`) REFERENCES `tipos_documentos` (`idtipos_documentos`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `ed_alumnostest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ed_alumnostest` (
  `idIngresoTest` int(11) NOT NULL AUTO_INCREMENT,
  `idMatricula` int(11) DEFAULT NULL,
  `idTest` int(11) DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `culminado` tinyint(4) DEFAULT '0',
  `fecha_modificacion` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`idIngresoTest`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ed_encuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ed_encuestas` (
  `idEncuesta` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idEncuesta`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ed_fechasevaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ed_fechasevaluacion` (
  `idPeriodo` varchar(7) NOT NULL,
  `idModalidad` int(11) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_final` date DEFAULT NULL,
  PRIMARY KEY (`idPeriodo`,`idModalidad`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ed_preguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ed_preguntas` (
  `IdPregunta` int(11) NOT NULL AUTO_INCREMENT,
  `idEncuesta` int(11) DEFAULT NULL,
  `pregunta` varchar(250) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `activa` tinyint(4) DEFAULT '1',
  `esAbierta` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`IdPregunta`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ed_respuestastest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ed_respuestastest` (
  `idIngresoTest` int(11) NOT NULL,
  `idPregunta` int(11) NOT NULL,
  `siempre` tinyint(4) DEFAULT '0',
  `casiSiempre` tinyint(4) DEFAULT '0',
  `aVeces` tinyint(4) DEFAULT '0',
  `casiNunca` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idIngresoTest`,`idPregunta`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ed_respuestastestab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ed_respuestastestab` (
  `idIngresoTest` int(11) NOT NULL,
  `idPregunta` int(11) NOT NULL,
  `respuesta` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idIngresoTest`,`idPregunta`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `empresas` (
  `idempresa` varchar(15) NOT NULL,
  `tipoDocumento` char(1) DEFAULT NULL,
  `idsectores_empresas` int(11) NOT NULL,
  `nombre_empresa` varchar(255) DEFAULT NULL,
  `pais_empresa` varchar(100) DEFAULT NULL,
  `ciudad_empresa` varchar(100) DEFAULT NULL,
  `direccion_empresa` varchar(100) DEFAULT NULL,
  `telefono_empresa` varchar(20) DEFAULT NULL,
  `email_empresa` varchar(90) DEFAULT NULL,
  `user_empresa` varchar(90) DEFAULT NULL,
  `password` varchar(90) DEFAULT NULL,
  `fecha_Inscripcion` timestamp NULL DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT NULL,
  `estado_verificacion` enum('pendiente','verificado','rechazado') DEFAULT 'pendiente',
  `fecha_verificacion` date DEFAULT NULL,
  `comentario_verificacion` text,
  `EsActivo` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idempresa`),
  KEY `idsectores_empresas` (`idsectores_empresas`),
  CONSTRAINT `empresas_ibfk_1` FOREIGN KEY (`idsectores_empresas`) REFERENCES `sectores_empresas` (`idsectores_empresas`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `empresas_contactos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `empresas_contactos` (
  `idempresas_contactos` int(11) NOT NULL AUTO_INCREMENT,
  `idempresa` varchar(15) NOT NULL,
  `idtipo_contacto` int(11) NOT NULL,
  `valor` varchar(255) DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `fecha_modificacion` date DEFAULT NULL,
  PRIMARY KEY (`idempresas_contactos`),
  KEY `idtipo_contacto` (`idtipo_contacto`),
  KEY `idempresa` (`idempresa`),
  CONSTRAINT `empresas_contactos_ibfk_1` FOREIGN KEY (`idtipo_contacto`) REFERENCES `tipo_contacto` (`idtipo_contacto`),
  CONSTRAINT `empresas_contactos_ibfk_2` FOREIGN KEY (`idempresa`) REFERENCES `empresas` (`idempresa`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `escalafon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `escalafon` (
  `idEscalafon` int(11) NOT NULL AUTO_INCREMENT,
  `idCategoriaContratos` int(11) NOT NULL,
  `Nombre` varchar(90) DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idEscalafon`),
  KEY `fk_escalafon_categoria_contratos1_idx` (`idCategoriaContratos`),
  CONSTRAINT `fk_escalafon_categoria_contratos1` FOREIGN KEY (`idCategoriaContratos`) REFERENCES `categoria_contratos` (`idCategoriaContratos`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `espacios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `espacios` (
  `idEspacio` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(15) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('aula','laboratorio','taller','virtual','aula interactiva') NOT NULL,
  `capacidad` int(11) NOT NULL,
  `idCarrera` int(11) DEFAULT NULL,
  `edificio` varchar(50) DEFAULT NULL,
  `piso` int(11) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  `requiereReserva` tinyint(4) DEFAULT NULL,
  `imagen referencia` varchar(500) DEFAULT NULL,
  `esAsincrono` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idEspacio`),
  KEY `fk_espacios_carreras1_idx` (`idCarrera`),
  CONSTRAINT `fk_espacios_carreras1` FOREIGN KEY (`idCarrera`) REFERENCES `carreras` (`idCarrera`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `especies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `especies` (
  `idEspecie` int(11) NOT NULL AUTO_INCREMENT,
  `especie` varchar(100) NOT NULL,
  `valor` decimal(8,2) NOT NULL,
  `numero_cuotas` int(11) NOT NULL,
  `prioridad` int(11) DEFAULT NULL,
  `permite_intercalar` tinyint(4) DEFAULT NULL,
  `codigo_referencia` varchar(10) DEFAULT NULL,
  `idperiodo` varchar(7) DEFAULT NULL,
  `extraordinaria` decimal(8,2) DEFAULT NULL,
  `idNivel` int(11) DEFAULT '0',
  `codigo_financiero` varchar(8) DEFAULT NULL,
  `sufijo` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`idEspecie`)
) ENGINE=InnoDB AUTO_INCREMENT=950 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `especies_extras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `especies_extras` (
  `idmatricula` int(11) NOT NULL,
  `idespecie` int(11) NOT NULL,
  `fecha_registro` date NOT NULL,
  `valor` decimal(8,2) NOT NULL,
  `fecha_limite_pago` date NOT NULL,
  `observacion` varchar(100) DEFAULT NULL,
  `obligatoria` tinyint(1) NOT NULL,
  `pagado` decimal(8,2) NOT NULL,
  `extra` tinyint(1) NOT NULL,
  `tipo` varchar(45) NOT NULL,
  PRIMARY KEY (`idmatricula`,`idespecie`,`fecha_registro`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `estadocivil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estadocivil` (
  `idestadoCivil` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) DEFAULT NULL,
  `requiereConyuge` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idestadoCivil`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `estadossolicitados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estadossolicitados` (
  `idEstadoSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `estado` varchar(30) DEFAULT NULL,
  `orden` int(11) DEFAULT '0',
  `esTerminal` tinyint(4) DEFAULT '0',
  `esPendiente` tinyint(4) DEFAULT '0',
  `esFinalizado` tinyint(4) DEFAULT '0',
  `esEnRevision` tinyint(4) DEFAULT '0',
  `esAnulada` tinyint(4) DEFAULT '0',
  `esReasignada` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idEstadoSolicitud`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `etnias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `etnias` (
  `idEtnia` int(11) NOT NULL AUTO_INCREMENT,
  `etnia` varchar(30) DEFAULT NULL,
  `esIndigena` tinyint(4) DEFAULT NULL,
  `noRegistra` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idEtnia`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `experiencias_laborales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `experiencias_laborales` (
  `idexperiencias_laborales` int(11) NOT NULL AUTO_INCREMENT,
  `idAlumno` varchar(14) DEFAULT NULL,
  `empresa_nombre` varchar(255) DEFAULT NULL,
  `puesto_nombre` varchar(255) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `descripcion` text,
  `fecha_creacion` timestamp NULL DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idexperiencias_laborales`),
  KEY `idAlumno` (`idAlumno`),
  CONSTRAINT `experiencias_laborales_ibfk_1` FOREIGN KEY (`idAlumno`) REFERENCES `alumnos` (`idAlumno`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `extras_contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `extras_contratos` (
  `idExtraContratos` int(11) NOT NULL AUTO_INCREMENT,
  `idContratos` int(11) NOT NULL,
  `fecha_registro` date DEFAULT NULL,
  `fecha_inicioextra` date DEFAULT NULL,
  `valor_extra` decimal(10,2) DEFAULT NULL,
  `motivo` varchar(100) DEFAULT NULL,
  `fecha_finalizacion` date DEFAULT NULL,
  `esactivo` tinyint(4) DEFAULT NULL,
  `usuarioRegistra` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idExtraContratos`),
  KEY `fk_extras_contratos_contratos1_idx` (`idContratos`),
  CONSTRAINT `fk_extras_contratos_contratos1` FOREIGN KEY (`idContratos`) REFERENCES `contratos` (`idContratos`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `fechas_grados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fechas_grados` (
  `idperiodo` varchar(7) NOT NULL,
  `idnivel` int(11) NOT NULL,
  `idseccion` int(11) NOT NULL,
  `paralelo` char(1) NOT NULL,
  `fecha_grado` date DEFAULT NULL,
  PRIMARY KEY (`idperiodo`,`idnivel`,`idseccion`,`paralelo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `fechas_horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fechas_horarios` (
  `idFecha` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT NULL,
  `finsemana` tinyint(4) DEFAULT '0',
  `dia` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`idFecha`),
  KEY `ix_fechas_horarios_fecha` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=4737 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `fechas_pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fechas_pagos` (
  `idFecha` int(11) NOT NULL AUTO_INCREMENT,
  `idEspecie` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  PRIMARY KEY (`idFecha`)
) ENGINE=InnoDB AUTO_INCREMENT=1005 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `fechas_pagos_cuotas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fechas_pagos_cuotas` (
  `idFecha` int(11) NOT NULL AUTO_INCREMENT,
  `idPeriodo` char(7) NOT NULL,
  `idModalidad` int(11) NOT NULL,
  `idCarrera` int(11) NOT NULL,
  `codigo_referencia` varchar(10) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `genera_fecha` tinyint(4) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idFecha`),
  KEY `fk_fechas_pagos_cuotas_carreras1_idx` (`idCarrera`),
  KEY `fk_fechas_pagos_cuotas_modalidades1_idx` (`idModalidad`),
  KEY `fk_fechas_pagos_cuotas_periodos_idx` (`idPeriodo`),
  CONSTRAINT `fk_fechas_pagos_cuotas_carreras1` FOREIGN KEY (`idCarrera`) REFERENCES `carreras` (`idCarrera`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_fechas_pagos_cuotas_modalidades1` FOREIGN KEY (`idModalidad`) REFERENCES `modalidades` (`idModalidad`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_fechas_pagos_cuotas_periodos` FOREIGN KEY (`idPeriodo`) REFERENCES `periodos` (`idPeriodo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `fechas_semanas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fechas_semanas` (
  `idFechasSemanas` int(11) NOT NULL AUTO_INCREMENT,
  `idSemanasHorarios` int(11) NOT NULL,
  `idFecha` int(11) NOT NULL,
  `idPeriodo` char(7) NOT NULL,
  PRIMARY KEY (`idFechasSemanas`),
  KEY `idFecha` (`idFecha`),
  KEY `idPeriodo` (`idPeriodo`),
  KEY `idSemanasHorarios` (`idSemanasHorarios`),
  CONSTRAINT `fechas_semanas_ibfk_1` FOREIGN KEY (`idFecha`) REFERENCES `fechas_horarios` (`idFecha`),
  CONSTRAINT `fechas_semanas_ibfk_2` FOREIGN KEY (`idPeriodo`) REFERENCES `periodos` (`idPeriodo`),
  CONSTRAINT `fechas_semanas_ibfk_3` FOREIGN KEY (`idSemanasHorarios`) REFERENCES `semanas_horarios` (`idSemanasHorarios`)
) ENGINE=InnoDB AUTO_INCREMENT=1313 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `financiamiento_beca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `financiamiento_beca` (
  `idFinanciamiento` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`idFinanciamiento`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `formaciones_academicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `formaciones_academicas` (
  `idformaciones_academicas` int(11) NOT NULL AUTO_INCREMENT,
  `idAlumno` varchar(14) NOT NULL,
  `Institucion_nombre` varchar(255) DEFAULT NULL,
  `titulo` varchar(90) DEFAULT NULL,
  `abreviatura` char(5) DEFAULT NULL,
  `numero_registro` varchar(45) DEFAULT NULL,
  `area_estudio` varchar(90) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idformaciones_academicas`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `gacad_asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gacad_asistencias` (
  `idAsistencia` int(11) NOT NULL AUTO_INCREMENT,
  `idSesion` int(11) NOT NULL,
  `idMatricula` int(11) NOT NULL,
  `estado` enum('presente','ausente','atraso','justificado') NOT NULL DEFAULT 'presente',
  `minutosAtraso` smallint(5) unsigned DEFAULT NULL,
  `observacion` varchar(200) DEFAULT NULL,
  `usuarioCreacion` varchar(25) NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuarioActualiza` varchar(25) DEFAULT NULL,
  `fechaActualizacion` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idAsistencia`),
  UNIQUE KEY `uq_gacad_asistencias_sesion_matricula` (`idSesion`,`idMatricula`),
  KEY `ix_gacad_asistencias_matricula_estado` (`idMatricula`,`estado`),
  CONSTRAINT `gacad_asistencias_ibfk_1` FOREIGN KEY (`idMatricula`) REFERENCES `matriculas` (`idMatricula`),
  CONSTRAINT `gacad_asistencias_ibfk_2` FOREIGN KEY (`idSesion`) REFERENCES `gacad_sesiones` (`idSesion`)
) ENGINE=InnoDB AUTO_INCREMENT=3679 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `gacad_asistencias_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gacad_asistencias_historial` (
  `idHistorial` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `idAsistencia` int(11) NOT NULL,
  `idSesion` int(11) NOT NULL,
  `idMatricula` int(11) NOT NULL,
  `estadoAnterior` varchar(15) DEFAULT NULL COMMENT 'NULL = alta inicial',
  `estadoNuevo` varchar(15) NOT NULL,
  `motivo` varchar(250) DEFAULT NULL,
  `usuario` varchar(25) NOT NULL,
  `rol` varchar(25) DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idHistorial`),
  KEY `ix_acad_hist_asistencia` (`idAsistencia`),
  KEY `ix_acad_hist_sesion` (`idSesion`),
  KEY `ix_acad_hist_fecha` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=9697 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `gacad_sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gacad_sesiones` (
  `idSesion` int(11) NOT NULL AUTO_INCREMENT,
  `idHorarioDetalle` int(11) NOT NULL,
  `tema` varchar(250) NOT NULL,
  `observacion` varchar(500) DEFAULT NULL,
  `estado` enum('borrador','cerrada') NOT NULL DEFAULT 'borrador',
  `fechaCierre` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `usuarioCreacion` varchar(25) NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuarioActualiza` varchar(25) DEFAULT NULL,
  `fechaActualizacion` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idSesion`),
  UNIQUE KEY `gacad_sesiones_unique` (`idHorarioDetalle`),
  KEY `gacad_sesiones_ibfk_3_idx` (`idHorarioDetalle`),
  CONSTRAINT `gacad_sesiones_ibfk_2` FOREIGN KEY (`idHorarioDetalle`) REFERENCES `horario_detalle` (`idHorario`)
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `gest_audit_acciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gest_audit_acciones` (
  `idAuditAcciones` varchar(100) NOT NULL,
  `codigoSistema` varchar(20) NOT NULL,
  `idModulo` varchar(255) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idAuditAcciones`,`codigoSistema`),
  KEY `ix_audit_acciones_sistema_modulo` (`codigoSistema`,`idModulo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `gest_audit_registros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gest_audit_registros` (
  `idAuditRegistros` bigint(20) NOT NULL AUTO_INCREMENT,
  `fechaHora` datetime NOT NULL,
  `codigoSistema` varchar(20) NOT NULL,
  `idUsuario` varchar(14) NOT NULL,
  `rol` varchar(30) DEFAULT NULL,
  `idModulo` varchar(50) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `idEntidad` int(11) DEFAULT NULL,
  `tablaAfectada` varchar(100) DEFAULT NULL,
  `descripcion` text,
  `datosAnteriores` text,
  `datosNuevos` text,
  `ipOrigen` varchar(45) DEFAULT NULL,
  `userAgent` varchar(500) DEFAULT NULL,
  `jti` varchar(50) DEFAULT NULL,
  `requestMethod` varchar(10) DEFAULT NULL,
  `requestPath` varchar(500) DEFAULT NULL,
  `statusCode` int(11) DEFAULT NULL,
  `mensajeError` text,
  `duracionMs` int(11) DEFAULT NULL,
  PRIMARY KEY (`idAuditRegistros`),
  KEY `ix_audit_sistema_modulo_fecha` (`codigoSistema`,`idModulo`,`fechaHora`),
  KEY `ix_audit_sistema_usuario_fecha` (`idUsuario`,`codigoSistema`,`fechaHora`),
  KEY `ix_audit_entidad` (`idEntidad`,`tablaAfectada`),
  KEY `ix_audit_accion_fecha` (`accion`,`fechaHora`),
  KEY `ix_audit_jti` (`jti`),
  KEY `ix_audit_codigo_sistema` (`codigoSistema`,`idAuditRegistros`)
) ENGINE=InnoDB AUTO_INCREMENT=37928 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `gest_password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gest_password_resets` (
  `idToken` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` int(11) NOT NULL,
  `tokenHash` varchar(255) NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaExpiracion` datetime NOT NULL,
  `usado` tinyint(4) NOT NULL DEFAULT '0',
  `ipSolicitud` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idToken`),
  KEY `fk_usuario_password_resets_idx` (`idUsuario`),
  CONSTRAINT `fk_usuario_password_resets_usuarios1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `grados_academicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grados_academicos` (
  `idGradoAcademico` int(11) NOT NULL AUTO_INCREMENT,
  `idNivelAcademico` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idGradoAcademico`),
  KEY `fk_grados_academicos_niveles_academicos1_idx` (`idNivelAcademico`),
  CONSTRAINT `fk_grados_academicos_niveles_academicos1` FOREIGN KEY (`idNivelAcademico`) REFERENCES `niveles_academicos` (`idNivelAcademico`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `habilidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `habilidades` (
  `idhabilidades` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) DEFAULT NULL,
  `descripcion` text,
  PRIMARY KEY (`idhabilidades`),
  UNIQUE KEY `nombre_UNIQUE` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `habilidades_requeridas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `habilidades_requeridas` (
  `idhabilidades_requeridas` int(11) NOT NULL AUTO_INCREMENT,
  `idofertas_laborales` int(11) NOT NULL,
  `idhabilidades` int(11) NOT NULL,
  `nivel` enum('basico','intermedio','avanzado') DEFAULT NULL,
  `es_obligatoria` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idhabilidades_requeridas`),
  UNIQUE KEY `habilidades_ofertas` (`idofertas_laborales`,`idhabilidades`),
  KEY `idhabilidades` (`idhabilidades`),
  CONSTRAINT `habilidades_requeridas_ibfk_1` FOREIGN KEY (`idhabilidades`) REFERENCES `habilidades` (`idhabilidades`),
  CONSTRAINT `habilidades_requeridas_ibfk_2` FOREIGN KEY (`idofertas_laborales`) REFERENCES `ofertas_laborales` (`idofertas_laborales`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `hdv_enlaces_magicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hdv_enlaces_magicos` (
  `idHdvEnlacesMagicos` int(11) NOT NULL AUTO_INCREMENT,
  `idProfesor` varchar(14) NOT NULL,
  `token` varchar(255) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'Pendiente' COMMENT 'Pendiente, EnProceso, Utilizado, Expirado, Revocado',
  PRIMARY KEY (`idHdvEnlacesMagicos`),
  KEY `fk_hdv_enlaces_magicos_profesores1_idx` (`idProfesor`),
  KEY `idx_hdv_enlaces_token` (`token`),
  KEY `idx_hdv_enlaces_estado` (`estado`),
  CONSTRAINT `fk_hdv_enlaces_magicos_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `hdv_solicitudes_actualizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hdv_solicitudes_actualizacion` (
  `idHdvSolicitudesActualizacion` int(11) NOT NULL AUTO_INCREMENT,
  `idProfesor` varchar(14) NOT NULL,
  `idHdvEnlacesMagicos` int(11) NOT NULL,
  `datos_propuestos` json NOT NULL,
  `ruta_archivos_adjuntos` json DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'Pendiente' COMMENT 'Pendiente, Borrador, Aprobado, Rechazado',
  `fecha_solicitud` datetime NOT NULL,
  `revisado_por` int(11) DEFAULT NULL,
  `fecha_revision` datetime DEFAULT NULL,
  PRIMARY KEY (`idHdvSolicitudesActualizacion`),
  KEY `fk_hdv_solicitudes_actualizacion_profesores1_idx` (`idProfesor`),
  KEY `fk_hdv_solicitudes_actualizacion_hdv_enlaces_magicos1_idx` (`idHdvEnlacesMagicos`),
  KEY `fk_hdv_solicitudes_actualizacion_usuarios1_idx` (`revisado_por`),
  KEY `idx_hdv_solicitudes_estado_fecha` (`estado`,`fecha_solicitud`),
  CONSTRAINT `fk_hdv_solicitudes_actualizacion_hdv_enlaces_magicos1` FOREIGN KEY (`idHdvEnlacesMagicos`) REFERENCES `hdv_enlaces_magicos` (`idHdvEnlacesMagicos`),
  CONSTRAINT `fk_hdv_solicitudes_actualizacion_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`),
  CONSTRAINT `fk_hdv_solicitudes_actualizacion_usuarios1` FOREIGN KEY (`revisado_por`) REFERENCES `usuarios` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `horario_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `horario_detalle` (
  `idHorario` int(11) NOT NULL AUTO_INCREMENT,
  `idAsignacion` int(11) NOT NULL,
  `idFecha` int(11) NOT NULL,
  `idhora` int(11) NOT NULL,
  `idEspacio` int(11) DEFAULT NULL,
  `tipoBloque` enum('teorico','practico','taller') DEFAULT NULL,
  `activo` tinyint(4) DEFAULT NULL,
  `claseReasignacion` tinyint(4) DEFAULT NULL,
  `esRecuperacionPedagocia` tinyint(1) DEFAULT NULL,
  `observacion` varchar(500) DEFAULT NULL,
  `idHorarioReasgincacion` int(11) DEFAULT NULL,
  PRIMARY KEY (`idHorario`),
  KEY `fk_asignacion_horario_idx` (`idAsignacion`),
  KEY `fk_horario_detalle_espacios1_idx` (`idEspacio`),
  KEY `fk_horario_detalle_fechas_horarios1_idx` (`idFecha`),
  KEY `fk_horario_detalle_horas_clases1_idx` (`idhora`),
  KEY `ix_horario_detalle_fecha_hora_activo` (`idFecha`,`idhora`,`activo`),
  CONSTRAINT `fk_asignacion_horario` FOREIGN KEY (`idAsignacion`) REFERENCES `asignaciones_profesores` (`idAsignacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_horario_detalle_espacios1` FOREIGN KEY (`idEspacio`) REFERENCES `espacios` (`idEspacio`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_horario_detalle_fechas_horarios1` FOREIGN KEY (`idFecha`) REFERENCES `fechas_horarios` (`idFecha`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_horario_detalle_horas_clases1` FOREIGN KEY (`idhora`) REFERENCES `horas_clases` (`idhora`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=11914 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `horario_profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `horario_profesores` (
  `idHorario` int(11) NOT NULL AUTO_INCREMENT,
  `idAsignacion` int(11) DEFAULT NULL,
  `idHora` int(11) DEFAULT NULL,
  `idFecha` int(11) DEFAULT NULL,
  `asiste` tinyint(4) DEFAULT '1',
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idHorario`)
) ENGINE=InnoDB AUTO_INCREMENT=866364 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `horas_academicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `horas_academicas` (
  `idHorasAcademicas` int(11) NOT NULL AUTO_INCREMENT,
  `idDedicacion` int(11) NOT NULL,
  `HorasMinimas` int(11) DEFAULT NULL,
  `HorasMaximas` int(11) DEFAULT NULL,
  `HorasMaximaSemana` int(11) DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idHorasAcademicas`),
  KEY `fk_horas_academicas_dedicacion1_idx` (`idDedicacion`),
  CONSTRAINT `fk_horas_academicas_dedicacion1` FOREIGN KEY (`idDedicacion`) REFERENCES `dedicacion` (`idDedicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `horas_clases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `horas_clases` (
  `idhora` int(11) NOT NULL AUTO_INCREMENT,
  `idSeccion` int(11) DEFAULT NULL,
  `idCarrera` int(11) DEFAULT NULL,
  `hora_inicio` varchar(5) DEFAULT NULL,
  `hora_fin` varchar(5) DEFAULT NULL,
  `minutos` int(11) DEFAULT NULL,
  `numero_hora` int(11) DEFAULT NULL,
  `tipo` char(1) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idhora`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `instituciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `instituciones` (
  `idInstitucion` int(11) NOT NULL AUTO_INCREMENT,
  `Institucion` varchar(200) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idInstitucion`)
) ENGINE=InnoDB AUTO_INCREMENT=3757 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `instituciones_instituto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `instituciones_instituto` (
  `idInstitucionesInstituto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `ruc` varchar(15) DEFAULT NULL,
  `ubicado` varchar(255) DEFAULT NULL,
  `representante` varchar(90) DEFAULT NULL,
  `cedula_representante` varchar(14) DEFAULT NULL,
  PRIMARY KEY (`idInstitucionesInstituto`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `jornadas_ofertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jornadas_ofertas` (
  `idjornadas_ofertas` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_jornada` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idjornadas_ofertas`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `kardex_vacaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kardex_vacaciones` (
  `id_kardex` int(11) NOT NULL AUTO_INCREMENT,
  `id_profesor` varchar(14) NOT NULL COMMENT 'Profesor al que se le afecta el saldo',
  `fecha_transaccion` datetime NOT NULL COMMENT 'Fecha en que se realiza la transacción',
  `tipo_transaccion` varchar(30) NOT NULL COMMENT 'ASIGNACION_ANUAL, CONSUMO_VACACIONES, AJUSTE_ADMINISTRATIVO, PRESCRIPCION',
  `cantidad_dias` decimal(5,2) NOT NULL COMMENT 'Días afectados: (+) Cargas anuales, (-) Descuentos por consumo o prescripción',
  `periodo` varchar(9) NOT NULL COMMENT 'Periodo anual correspondiente (ej. 2024-2025)',
  `detalle` varchar(255) NOT NULL COMMENT 'Detalle o justificación contable de la transacción',
  `usuario_responsable` int(11) NOT NULL COMMENT 'Usuario del sistema (TH o RL) que realiza el movimiento',
  PRIMARY KEY (`id_kardex`),
  KEY `fk_kardex_vac_profesores` (`id_profesor`),
  KEY `fk_kardex_vac_usuario_resp` (`usuario_responsable`),
  CONSTRAINT `fk_kardex_vac_profesores` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_kardex_vac_usuario_resp` FOREIGN KEY (`usuario_responsable`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Transacciones del Kardex contable de vacaciones (Libro Mayor)';

DROP TABLE IF EXISTS `logsmigraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logsmigraciones` (
  `idLog` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(1000) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`idLog`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `mallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mallas` (
  `idMalla` int(11) NOT NULL AUTO_INCREMENT,
  `idCarrera` int(11) NOT NULL,
  `vigencia` int(7) DEFAULT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `creditos_minimo` int(11) DEFAULT NULL,
  `creditos_maximo` int(11) DEFAULT NULL,
  `creditos_reprobatorio` int(11) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idMalla`),
  KEY `R_15` (`idCarrera`),
  CONSTRAINT `mallas_ibfk_1` FOREIGN KEY (`idCarrera`) REFERENCES `carreras` (`idCarrera`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `mallas_periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mallas_periodos` (
  `idPeriodo` varchar(7) NOT NULL,
  `idNivel` int(11) NOT NULL,
  `idMalla` int(11) NOT NULL,
  PRIMARY KEY (`idPeriodo`,`idNivel`,`idMalla`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `matriculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `matriculas` (
  `idMatricula` int(11) NOT NULL AUTO_INCREMENT,
  `idAlumno` varchar(14) NOT NULL,
  `idNivel` int(11) NOT NULL,
  `idSeccion` int(11) NOT NULL,
  `idModalidad` int(11) NOT NULL,
  `idPeriodo` char(7) NOT NULL,
  `fechaMatricula` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `paralelo` varchar(10) DEFAULT NULL,
  `arrastres` tinyint(1) DEFAULT NULL,
  `folio` int(11) DEFAULT NULL,
  `beca_matricula` decimal(5,2) DEFAULT NULL,
  `beca_colegiatura` decimal(5,2) DEFAULT NULL,
  `retirado` tinyint(1) DEFAULT NULL,
  `fechaRetiro` date DEFAULT NULL,
  `observacion` varchar(100) DEFAULT NULL,
  `convalidacion` tinyint(1) DEFAULT NULL,
  `carrera_convalidada` varchar(200) DEFAULT NULL,
  `numero_permiso` int(11) DEFAULT NULL,
  `user_matricula` varchar(20) DEFAULT NULL,
  `valida` tinyint(4) DEFAULT '1',
  `esOyente` tinyint(4) DEFAULT '0',
  `documentoFactura` varchar(14) DEFAULT NULL,
  PRIMARY KEY (`idMatricula`),
  KEY `R_3` (`idAlumno`),
  KEY `R_4` (`idSeccion`),
  KEY `R_6` (`idNivel`),
  KEY `R_7` (`idModalidad`),
  KEY `R_8` (`idPeriodo`),
  CONSTRAINT `matriculas_ibfk_1` FOREIGN KEY (`idAlumno`) REFERENCES `alumnos` (`idAlumno`),
  CONSTRAINT `matriculas_ibfk_2` FOREIGN KEY (`idSeccion`) REFERENCES `secciones` (`idSeccion`),
  CONSTRAINT `matriculas_ibfk_3` FOREIGN KEY (`idNivel`) REFERENCES `cursos` (`idNivel`),
  CONSTRAINT `matriculas_ibfk_4` FOREIGN KEY (`idModalidad`) REFERENCES `modalidades` (`idModalidad`),
  CONSTRAINT `matriculas_ibfk_5` FOREIGN KEY (`idPeriodo`) REFERENCES `periodos` (`idPeriodo`)
) ENGINE=InnoDB AUTO_INCREMENT=59518 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `matriculas_asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `matriculas_asistencias` (
  `idMatricula` int(11) NOT NULL,
  `idFecha` int(11) NOT NULL,
  `noAsiste` tinyint(1) DEFAULT '0',
  `atraso` tinyint(1) DEFAULT '0',
  `observacion` varchar(100) DEFAULT NULL,
  `usuario` varchar(20) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `fecha_actualizacion` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `usuario_actualiza` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`idMatricula`,`idFecha`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `matriculas_examen_conduccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `matriculas_examen_conduccion` (
  `idMatricula` int(11) NOT NULL,
  `idCategoria` int(11) NOT NULL,
  `nota` int(11) DEFAULT '0',
  `observacion` varchar(100) DEFAULT NULL,
  `usuario` varchar(20) DEFAULT NULL,
  `fechaExamen` date DEFAULT NULL,
  `fechaIngreso` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `instructor` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idMatricula`,`idCategoria`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `medios_contacto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medios_contacto` (
  `idMedio` int(11) NOT NULL AUTO_INCREMENT,
  `medio` varchar(100) DEFAULT NULL,
  `activo` bit(1) DEFAULT b'1',
  PRIMARY KEY (`idMedio`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `modalidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modalidades` (
  `idModalidad` int(11) NOT NULL AUTO_INCREMENT,
  `modalidad` varchar(100) DEFAULT NULL,
  `sufijo` char(1) DEFAULT NULL,
  `modalidadImpresion` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`idModalidad`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `modalidades_carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modalidades_carreras` (
  `idModalidadCarrera` int(11) NOT NULL AUTO_INCREMENT,
  `idCarrera` int(11) NOT NULL,
  `idModalidad` int(11) NOT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idModalidadCarrera`),
  KEY `fk_ModalidadCarrera_carreras1_idx` (`idCarrera`),
  KEY `fk_ModalidadCarrera_modalidades1_idx` (`idModalidad`),
  CONSTRAINT `fk_ModalidadCarrera_carreras1` FOREIGN KEY (`idCarrera`) REFERENCES `carreras` (`idCarrera`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_ModalidadCarrera_modalidades1` FOREIGN KEY (`idModalidad`) REFERENCES `modalidades` (`idModalidad`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `modalidades_ofertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modalidades_ofertas` (
  `idmodalidades_ofertas` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_modalidad` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idmodalidades_ofertas`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `motivo_salida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `motivo_salida` (
  `idMotivoSalida` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_motivo` varchar(45) DEFAULT NULL,
  `necesita_infrome` tinyint(4) DEFAULT NULL,
  `esactivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idMotivoSalida`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `nacionalidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nacionalidades` (
  `idNacionalidad` int(11) NOT NULL AUTO_INCREMENT,
  `nacionalidad` varchar(30) DEFAULT NULL,
  `esNinguna` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idNacionalidad`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `niveles_academicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `niveles_academicos` (
  `idNivelAcademico` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`idNivelAcademico`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ofertas_carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ofertas_carreras` (
  `idofertas_carreras` int(11) NOT NULL AUTO_INCREMENT,
  `idofertas_laborales` int(11) NOT NULL,
  `idCarrera` int(11) NOT NULL,
  PRIMARY KEY (`idofertas_carreras`),
  UNIQUE KEY `ofertas_carreras` (`idofertas_laborales`,`idCarrera`),
  KEY `idCarrera` (`idCarrera`),
  CONSTRAINT `ofertas_carreras_ibfk_1` FOREIGN KEY (`idofertas_laborales`) REFERENCES `ofertas_laborales` (`idofertas_laborales`),
  CONSTRAINT `ofertas_carreras_ibfk_2` FOREIGN KEY (`idCarrera`) REFERENCES `carreras` (`idCarrera`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ofertas_laborales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ofertas_laborales` (
  `idofertas_laborales` int(11) NOT NULL AUTO_INCREMENT,
  `idempresa` varchar(15) NOT NULL,
  `iddepartamentos` int(11) NOT NULL,
  `idcargos_ofertas` int(11) NOT NULL,
  `Provincia` varchar(100) DEFAULT NULL,
  `Ciudad` varchar(100) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `idtipos_ofertas` int(11) NOT NULL,
  `experiencia_requerida` varchar(50) DEFAULT NULL,
  `vacantes` int(11) DEFAULT NULL,
  `estado` enum('activa','pausada','cerrada') DEFAULT 'activa',
  `fecha_publicacion` timestamp NULL DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT NULL,
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT NULL,
  `enlace_original` text,
  `esActivo` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idofertas_laborales`),
  KEY `iddepartamentos` (`iddepartamentos`),
  KEY `idtipos_ofertas` (`idtipos_ofertas`),
  KEY `idempresa` (`idempresa`),
  KEY `idcargos_ofertas` (`idcargos_ofertas`),
  CONSTRAINT `ofertas_laborales_ibfk_1` FOREIGN KEY (`iddepartamentos`) REFERENCES `departamentos` (`iddepartamentos`),
  CONSTRAINT `ofertas_laborales_ibfk_2` FOREIGN KEY (`idtipos_ofertas`) REFERENCES `tipos_ofertas` (`idtipos_ofertas`),
  CONSTRAINT `ofertas_laborales_ibfk_3` FOREIGN KEY (`idempresa`) REFERENCES `empresas` (`idempresa`),
  CONSTRAINT `ofertas_laborales_ibfk_4` FOREIGN KEY (`idcargos_ofertas`) REFERENCES `cargos_ofertas` (`idcargos_ofertas`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ofertas_requisitos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ofertas_requisitos` (
  `idofertas_requisitos` int(11) NOT NULL AUTO_INCREMENT,
  `idofertas_laborales` int(11) NOT NULL,
  `descripcion` text,
  `es_obligatoria` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idofertas_requisitos`),
  KEY `idofertas_laborales` (`idofertas_laborales`),
  CONSTRAINT `ofertas_requisitos_ibfk_1` FOREIGN KEY (`idofertas_laborales`) REFERENCES `ofertas_laborales` (`idofertas_laborales`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos` (
  `idPago` int(11) NOT NULL AUTO_INCREMENT,
  `idMatricula` int(11) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `idCuenta` int(11) DEFAULT NULL,
  `factura` varchar(15) DEFAULT NULL,
  `numero_deposito` varchar(20) DEFAULT NULL,
  `fecha_deposito` date DEFAULT NULL,
  `valor` decimal(8,2) DEFAULT NULL,
  `descuento` decimal(8,2) DEFAULT NULL,
  `observacion` varchar(100) DEFAULT NULL,
  `tipo_documento` varchar(50) DEFAULT NULL,
  `anulado` tinyint(4) DEFAULT '0',
  `fecha_anulacion` date DEFAULT NULL,
  `numero_registro` int(11) DEFAULT NULL,
  `numero_excepcion` tinyint(4) DEFAULT '0',
  `user_pago` varchar(20) DEFAULT NULL,
  `genera_manual` tinyint(4) DEFAULT '0',
  `documentoFactura` varchar(14) DEFAULT NULL,
  PRIMARY KEY (`idPago`)
) ENGINE=InnoDB AUTO_INCREMENT=222326 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `paises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paises` (
  `idpaises` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `nacionalidad` varchar(100) DEFAULT NULL,
  `esEcuador` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idpaises`)
) ENGINE=InnoDB AUTO_INCREMENT=196 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `parametros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parametros` (
  `codigo_institucion` varchar(10) DEFAULT NULL,
  `nombreInstitucion` varchar(150) DEFAULT NULL,
  `cadenaConexion` varchar(200) DEFAULT NULL,
  `nombreRector` varchar(200) DEFAULT NULL,
  `archivoFirma` varchar(150) DEFAULT NULL,
  `archivoSello` varchar(150) DEFAULT NULL,
  `emailSolicitudes` varchar(150) DEFAULT NULL,
  `claveEmailSolicitudes` varchar(50) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `permiteActualizacionCompleta` tinyint(4) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `parametrostipossolicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parametrostipossolicitudes` (
  `idParametroTipoSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `idTipoSolicitud` int(11) DEFAULT NULL,
  `periodo` tinyint(4) DEFAULT '0',
  `esPeriodoApertura` tinyint(4) DEFAULT '0',
  `esConduccion` tinyint(4) DEFAULT '0',
  `carrera` tinyint(4) DEFAULT '0',
  `nivel` tinyint(4) DEFAULT '0',
  `asignatura` tinyint(4) DEFAULT '0',
  `detalle` tinyint(4) DEFAULT '0',
  `esDetalleAutogenerado` tinyint(4) DEFAULT '0',
  `detalleAutogenerado` varchar(1500) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '0',
  `esCalificaciones` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idParametroTipoSolicitud`),
  KEY `idTipoSolicitud` (`idTipoSolicitud`),
  CONSTRAINT `parametrostipossolicitudes_ibfk_1` FOREIGN KEY (`idTipoSolicitud`) REFERENCES `tipossolicitudes` (`idTipoSolicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `parciales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parciales` (
  `idParcial` int(11) NOT NULL,
  `Parcial` varchar(40) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_final` date DEFAULT NULL,
  `esPrimero` tinyint(4) DEFAULT '0',
  `esSegundo` tinyint(4) DEFAULT '0',
  `esExamenFinal` tinyint(4) DEFAULT '0',
  `esRemedial` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idParcial`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `parciales_modalidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parciales_modalidades` (
  `idParcial` int(11) DEFAULT NULL,
  `idModalidad` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `parciales_modalidades_fechas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parciales_modalidades_fechas` (
  `idPeriodo` varchar(7) DEFAULT NULL,
  `idParcial` int(11) DEFAULT NULL,
  `idModalidad` int(11) DEFAULT NULL,
  `fechaInicio` date DEFAULT NULL,
  `fechaFin` date DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `parroquias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parroquias` (
  `idParroquias` int(11) NOT NULL AUTO_INCREMENT,
  `idciudades` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idParroquias`),
  KEY `fk_parroquias_ciudades1_idx` (`idciudades`),
  CONSTRAINT `fk_parroquias_ciudades1` FOREIGN KEY (`idciudades`) REFERENCES `ciudades` (`idciudades`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2415 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `pd_aceptaciones_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pd_aceptaciones_usuarios` (
  `idAceptacionUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` varchar(14) DEFAULT NULL,
  `idTermino` int(11) DEFAULT NULL,
  `sistema` varchar(100) DEFAULT NULL,
  `fechaRegistro` datetime DEFAULT NULL,
  `ipOrigen` varchar(50) DEFAULT NULL,
  `dispositivo` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idAceptacionUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=371 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `pd_categorias_terminos_condiciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pd_categorias_terminos_condiciones` (
  `idCategoria` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(50) DEFAULT NULL,
  `esAlumno` tinyint(4) DEFAULT '0',
  `esDocente` tinyint(4) DEFAULT '0',
  `esAdministrativo` tinyint(4) DEFAULT '0',
  `esExterno` tinyint(4) DEFAULT '0',
  `fechaRegistro` date DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `pd_terminos_condiciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pd_terminos_condiciones` (
  `idTermino` int(11) NOT NULL AUTO_INCREMENT,
  `idCategoria` int(11) DEFAULT NULL,
  `versionTermino` varchar(20) DEFAULT NULL,
  `contenido` text,
  `fechaPublicacion` date DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `archivoHtml` varchar(100) DEFAULT NULL,
  `esVigente` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idTermino`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `periodos` (
  `idPeriodo` char(7) NOT NULL DEFAULT '',
  `detalle` varchar(100) DEFAULT NULL,
  `fecha_inicial` date DEFAULT NULL,
  `fecha_final` date DEFAULT NULL,
  `cerrado` tinyint(1) DEFAULT NULL,
  `fecha_maxima_autocierre` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `creditos` tinyint(1) DEFAULT NULL,
  `numero_pagos` int(10) unsigned DEFAULT NULL,
  `fecha_matrucla_extraordinaria` date DEFAULT NULL,
  `foliop` int(11) DEFAULT NULL,
  `permiteMatricula` tinyint(4) DEFAULT '0',
  `ingresoCalificaciones` tinyint(4) DEFAULT '0',
  `permiteCalificacionesInstituto` tinyint(4) DEFAULT '0',
  `periodoactivoinstituto` tinyint(4) DEFAULT '0',
  `visualizaPowerBi` tinyint(4) DEFAULT '0',
  `esInstituto` tinyint(4) DEFAULT '0',
  `periodoPlanificacion` tinyint(4) DEFAULT '0',
  `esConduccion` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idPeriodo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `periodos_inscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `periodos_inscripciones` (
  `idPeriodoInscripcion` int(11) NOT NULL AUTO_INCREMENT,
  `idPeriodo` varchar(7) DEFAULT NULL,
  `idModalidad` int(11) DEFAULT NULL,
  `idNivel` int(11) DEFAULT NULL,
  `idSeccion` int(11) DEFAULT NULL,
  `fechaInicio` date DEFAULT NULL,
  `fechaFinal` date DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(4) DEFAULT '1',
  `conduccion` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idPeriodoInscripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=166 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `periodos_matriculas_niveles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `periodos_matriculas_niveles` (
  `idPeriodo` varchar(7) NOT NULL,
  `idNivel` int(11) NOT NULL,
  `idSeccion` int(11) NOT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idPeriodo`,`idNivel`,`idSeccion`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `plantilla_clausulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plantilla_clausulas` (
  `idPlantillasClausulas` int(11) NOT NULL AUTO_INCREMENT,
  `idPlantillaContrato` int(11) NOT NULL,
  `idClausulas` int(11) NOT NULL,
  `texto` mediumtext,
  `orden` int(11) DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `fecha_modificacion` date DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idPlantillasClausulas`),
  KEY `fk_plantilla_clausulas_plantilla_contrato1_idx` (`idPlantillaContrato`),
  KEY `fk_plantilla_clausulas_clausulas1_idx` (`idClausulas`),
  CONSTRAINT `fk_plantilla_clausulas_clausulas1` FOREIGN KEY (`idClausulas`) REFERENCES `clausulas` (`idClausulas`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_plantilla_clausulas_plantilla_contrato1` FOREIGN KEY (`idPlantillaContrato`) REFERENCES `plantilla_contrato` (`idPlantillaContrato`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `plantilla_contrato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plantilla_contrato` (
  `idPlantillaContrato` int(11) NOT NULL AUTO_INCREMENT,
  `idDedicacion` int(11) NOT NULL,
  `idTiposContratos` int(11) NOT NULL,
  `idInstitucionesInstituto` int(11) NOT NULL,
  `idSello` int(11) NOT NULL,
  `idFondo` int(11) NOT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `cuerpo` mediumtext,
  `version` int(11) DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `fecha_modificacion` date DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  `esDocente` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idPlantillaContrato`),
  KEY `fk_plantilla_contrato_tipos_contratos1_idx` (`idTiposContratos`),
  KEY `fk_plantilla_contrato_dedicacion1_idx` (`idDedicacion`),
  KEY `fk_plantilla_contrato_instituciones_instituto1_idx` (`idInstitucionesInstituto`),
  KEY `fk_plantilla_contrato_adjuntos_imagenes1_idx` (`idSello`),
  KEY `fk_plantilla_contrato_adjuntos_imagenes2_idx` (`idFondo`),
  CONSTRAINT `fk_plantilla_contrato_adjuntos_imagenes1` FOREIGN KEY (`idSello`) REFERENCES `adjuntos_imagenes` (`idAdjuntos_Imagenes`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_plantilla_contrato_adjuntos_imagenes2` FOREIGN KEY (`idFondo`) REFERENCES `adjuntos_imagenes` (`idAdjuntos_Imagenes`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_plantilla_contrato_dedicacion1` FOREIGN KEY (`idDedicacion`) REFERENCES `dedicacion` (`idDedicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_plantilla_contrato_instituciones_instituto1` FOREIGN KEY (`idInstitucionesInstituto`) REFERENCES `instituciones_instituto` (`idInstitucionesInstituto`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_plantilla_contrato_tipos_contratos1` FOREIGN KEY (`idTiposContratos`) REFERENCES `tipos_contratos` (`idTiposContratos`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `plantillas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plantillas` (
  `idPlantilla` int(11) NOT NULL AUTO_INCREMENT,
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `nombre` varchar(200) DEFAULT NULL,
  `archivo` varchar(100) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idPlantilla`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `plantillasparametros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plantillasparametros` (
  `idParametro` int(11) NOT NULL AUTO_INCREMENT,
  `idPlantilla` int(11) DEFAULT NULL,
  `parametro` varchar(100) DEFAULT NULL,
  `x` decimal(10,2) DEFAULT NULL,
  `y` decimal(10,2) DEFAULT NULL,
  `fontSize` decimal(10,2) DEFAULT NULL,
  `textAlign` varchar(50) DEFAULT NULL,
  `width` varchar(50) DEFAULT NULL,
  `fontFamily` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idParametro`),
  KEY `idPlantilla` (`idPlantilla`),
  CONSTRAINT `plantillasparametros_ibfk_1` FOREIGN KEY (`idPlantilla`) REFERENCES `plantillas` (`idPlantilla`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `postulaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `postulaciones` (
  `idPostulaciones` int(11) NOT NULL AUTO_INCREMENT,
  `idofertas_laborales` int(11) NOT NULL,
  `idAlumno` varchar(14) NOT NULL,
  `iddocumentos_adjuntos` int(11) NOT NULL,
  `fecha_postulacion` timestamp NULL DEFAULT NULL,
  `estado` enum('Pendiente','Revisado','Entrevista','Rechazado','Aceptado') DEFAULT 'Pendiente',
  `fecha_creacion` timestamp NULL DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idPostulaciones`),
  KEY `idofertas_laborales` (`idofertas_laborales`),
  KEY `iddocumentos_adjuntos` (`iddocumentos_adjuntos`),
  CONSTRAINT `postulaciones_ibfk_1` FOREIGN KEY (`idofertas_laborales`) REFERENCES `ofertas_laborales` (`idofertas_laborales`),
  CONSTRAINT `postulaciones_ibfk_2` FOREIGN KEY (`iddocumentos_adjuntos`) REFERENCES `documentos_adjuntos` (`iddocumentos_adjuntos`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `prerequisitos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prerequisitos` (
  `idDetalleMalla` int(11) NOT NULL,
  `idAsignatura` int(11) NOT NULL,
  `activa` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idDetalleMalla`,`idAsignatura`),
  KEY `R_34` (`idAsignatura`),
  CONSTRAINT `prerequisitos_ibfk_1` FOREIGN KEY (`idDetalleMalla`) REFERENCES `detallemallas` (`idDetalleMalla`),
  CONSTRAINT `prerequisitos_ibfk_2` FOREIGN KEY (`idAsignatura`) REFERENCES `asignaturas` (`idAsignatura`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `procesos_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `procesos_usuario` (
  `proceso` varchar(30) DEFAULT NULL,
  `usuario` varchar(20) DEFAULT NULL,
  `consultar` tinyint(4) DEFAULT '0',
  `insertar` tinyint(4) DEFAULT '0',
  `modificar` tinyint(4) DEFAULT '0',
  `eliminar` tinyint(4) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profesores` (
  `idProfesor` varchar(14) NOT NULL,
  `tipodocumento` char(1) DEFAULT NULL,
  `apellidos` varchar(60) DEFAULT NULL,
  `nombres` varchar(60) DEFAULT NULL,
  `primerApellido` varchar(60) DEFAULT NULL,
  `segundoApellido` varchar(60) DEFAULT NULL,
  `primerNombre` varchar(60) DEFAULT NULL,
  `segundoNombre` varchar(60) DEFAULT NULL,
  `estadoCivil` int(11) NOT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `callePrincipal` varchar(125) DEFAULT NULL,
  `calleSecundaria` varchar(125) DEFAULT NULL,
  `numeroCasa` varchar(45) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` char(1) DEFAULT NULL,
  `clave` varchar(20) DEFAULT '321',
  `practicas` tinyint(4) DEFAULT '0',
  `tipo` char(1) DEFAULT 'P',
  `nacionalidad` varchar(40) DEFAULT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  `abreviatura` varchar(5) DEFAULT NULL,
  `abreviatura_post` varchar(5) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT NULL,
  `idEtnia` int(11) NOT NULL,
  `idNacionalidad` int(11) NOT NULL,
  `idParroquiaNacimiento` int(11) NOT NULL,
  `emailInstitucional` varchar(255) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `fechaIngresoIess` date DEFAULT NULL,
  `fecha_retiro` date DEFAULT NULL,
  `idParroquiaResidencia` int(11) NOT NULL,
  `tipoSangre` varchar(5) NOT NULL,
  `codigoPostal` varchar(20) DEFAULT NULL,
  `idDiscapacidad` int(11) NOT NULL,
  `porcentajeDiscapacidad` int(11) DEFAULT NULL,
  `numeroConadis` varchar(45) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `esReal` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProfesor`),
  KEY `fk_profesores_etnias1_idx` (`idEtnia`),
  KEY `fk_profesores_parroquias1_idx` (`idParroquiaNacimiento`),
  KEY `fk_profesores_parroquias2_idx` (`idParroquiaResidencia`),
  KEY `fk_profesores_tipoSangre1_idx` (`tipoSangre`),
  KEY `fk_profesores_estadoCivil1_idx` (`estadoCivil`),
  KEY `fk_profesores_nacionalidades1_idx` (`idNacionalidad`),
  KEY `fk_profesores_discapacidades1_idx` (`idDiscapacidad`),
  CONSTRAINT `fk_profesores_discapacidades1` FOREIGN KEY (`idDiscapacidad`) REFERENCES `discapacidades` (`idDiscapacidad`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_estadoCivil1` FOREIGN KEY (`estadoCivil`) REFERENCES `estadocivil` (`idestadoCivil`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_etnias1` FOREIGN KEY (`idEtnia`) REFERENCES `etnias` (`idEtnia`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_nacionalidades1` FOREIGN KEY (`idNacionalidad`) REFERENCES `nacionalidades` (`idNacionalidad`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_parroquias1` FOREIGN KEY (`idParroquiaNacimiento`) REFERENCES `parroquias` (`idParroquias`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_parroquias2` FOREIGN KEY (`idParroquiaResidencia`) REFERENCES `parroquias` (`idParroquias`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_tipoSangre1` FOREIGN KEY (`tipoSangre`) REFERENCES `tiposangre` (`codigoTipoSangre`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `profesores_actas_parciales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profesores_actas_parciales` (
  `idAsignacion` int(11) NOT NULL,
  `idParcial` int(11) NOT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `fecha_grabar` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `codigo_impresion` varchar(10) DEFAULT NULL,
  `entrega_acta` tinyint(4) DEFAULT '0',
  `ingresa_notas` tinyint(4) DEFAULT '0',
  `usuario_graba` varchar(20) DEFAULT NULL,
  `activoAtraso` tinyint(4) DEFAULT '0',
  `fechaInicio` date DEFAULT NULL,
  `fechaFin` date DEFAULT NULL,
  PRIMARY KEY (`idAsignacion`,`idParcial`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `profesores_actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profesores_actividades` (
  `idPeriodo` varchar(7) NOT NULL,
  `idProfesor` varchar(14) NOT NULL,
  `idSubcategoria` int(11) NOT NULL,
  `horas_semana` int(11) DEFAULT '0',
  `usuario` varchar(20) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idPeriodo`,`idProfesor`,`idSubcategoria`),
  KEY `fk_profesores_actividades_subcategorias_actividades1_idx` (`idSubcategoria`),
  CONSTRAINT `fk_profesores_actividades_subcategorias_actividades1` FOREIGN KEY (`idSubcategoria`) REFERENCES `subcategorias_actividades` (`idSubcategoria`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `profesores_carreras_periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profesores_carreras_periodos` (
  `idProfesoresCarrerasPeriodos` int(11) NOT NULL AUTO_INCREMENT,
  `idPeriodo` char(7) NOT NULL,
  `idProfesor` varchar(14) NOT NULL,
  `idCarrera` int(11) DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  `sonTodas` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idProfesoresCarrerasPeriodos`),
  KEY `fk_profesores_carreras_periodos_periodos1_idx` (`idPeriodo`),
  KEY `fk_profesores_carreras_periodos_profesores1_idx` (`idProfesor`),
  KEY `fk_profesores_carreras_periodos_carreras1_idx` (`idCarrera`),
  CONSTRAINT `fk_profesores_carreras_periodos_carreras1` FOREIGN KEY (`idCarrera`) REFERENCES `carreras` (`idCarrera`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_carreras_periodos_periodos1` FOREIGN KEY (`idPeriodo`) REFERENCES `periodos` (`idPeriodo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_carreras_periodos_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=279 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `profesores_dedicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profesores_dedicacion` (
  `idProfesoresDedicacion` int(11) NOT NULL AUTO_INCREMENT,
  `idProfesor` varchar(14) NOT NULL,
  `idDedicacionCategorias` int(11) NOT NULL,
  `idPeriodo` char(7) NOT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idProfesoresDedicacion`),
  KEY `fk_profesores_dedicacion_profesores1_idx` (`idProfesor`),
  KEY `fk_profesores_dedicacion_periodos1_idx` (`idPeriodo`),
  KEY `fk_profesores_dedicacion_dedicacion_categorias1_idx` (`idDedicacionCategorias`),
  CONSTRAINT `fk_profesores_dedicacion_dedicacion_categorias1` FOREIGN KEY (`idDedicacionCategorias`) REFERENCES `dedicacion_categorias` (`idDedicacionCategorias`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_dedicacion_periodos1` FOREIGN KEY (`idPeriodo`) REFERENCES `periodos` (`idPeriodo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_dedicacion_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `profesores_motivo_salida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profesores_motivo_salida` (
  `idProfesor` varchar(14) NOT NULL,
  `idMotivoSalida` int(11) NOT NULL,
  `idContratos` int(11) NOT NULL,
  `Observacion` varchar(400) DEFAULT NULL,
  `ruta_archivo` varchar(150) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `fecha_salida` date DEFAULT NULL,
  PRIMARY KEY (`idProfesor`,`idMotivoSalida`),
  KEY `fk_profesores_has_motivo_salida_motivo_salida1_idx` (`idMotivoSalida`),
  KEY `fk_profesores_has_motivo_salida_profesores1_idx` (`idProfesor`),
  KEY `fk_profesores_has_motivo_salida_contratos1_idx` (`idContratos`),
  CONSTRAINT `fk_profesores_has_motivo_salida_contratos1` FOREIGN KEY (`idContratos`) REFERENCES `contratos` (`idContratos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_has_motivo_salida_motivo_salida1` FOREIGN KEY (`idMotivoSalida`) REFERENCES `motivo_salida` (`idMotivoSalida`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_profesores_has_motivo_salida_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `provincias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provincias` (
  `idprovincias` int(11) NOT NULL AUTO_INCREMENT,
  `idpaises` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idprovincias`),
  KEY `fk_provincias_paises1_idx` (`idpaises`),
  CONSTRAINT `fk_provincias_paises1` FOREIGN KEY (`idpaises`) REFERENCES `paises` (`idpaises`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=444 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `rbac_modulos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rbac_modulos` (
  `idModulos` int(11) NOT NULL AUTO_INCREMENT,
  `id_sistema` int(11) NOT NULL,
  `Nombre` varchar(255) DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idModulos`),
  KEY `fk_modulos_sistema1_idx` (`id_sistema`),
  CONSTRAINT `fk_modulos_sistema1` FOREIGN KEY (`id_sistema`) REFERENCES `rbac_sistema` (`idSistema`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `rbac_modulos_operaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rbac_modulos_operaciones` (
  `idModulosOperaciones` int(11) NOT NULL AUTO_INCREMENT,
  `idModulos` int(11) NOT NULL,
  `idOperaciones` int(11) NOT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `fecha_modificacion` date DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idModulosOperaciones`),
  KEY `fk_modulos_operaciones_modulos1_idx` (`idModulos`),
  KEY `fk_modulos_operaciones_operaciones1_idx` (`idOperaciones`),
  CONSTRAINT `fk_modulos_operaciones_modulos1` FOREIGN KEY (`idModulos`) REFERENCES `rbac_modulos` (`idModulos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_modulos_operaciones_operaciones1` FOREIGN KEY (`idOperaciones`) REFERENCES `rbac_operaciones` (`idOperaciones`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `rbac_operaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rbac_operaciones` (
  `idOperaciones` int(11) NOT NULL AUTO_INCREMENT,
  `NombreOperacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idOperaciones`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `rbac_refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rbac_refresh_tokens` (
  `idRefreshToken` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `idUsuario` int(11) NOT NULL,
  `tokenHash` varchar(255) NOT NULL,
  `deviceInfo` varchar(255) DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `expiresAt` datetime NOT NULL,
  `revokedAt` datetime DEFAULT NULL,
  `replacedByTokenId` bigint(20) unsigned DEFAULT NULL,
  `familyId` varchar(36) DEFAULT NULL,
  `sequence` int(10) unsigned DEFAULT NULL,
  `revokedReason` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`idRefreshToken`),
  UNIQUE KEY `rbac_refresh_tokens_unique_1` (`tokenHash`),
  KEY `rbac_refresh_tokens_tokenHash_IDX` (`tokenHash`) USING BTREE,
  KEY `rbac_refresh_tokens_idUsuario_IDX` (`idUsuario`,`revokedAt`) USING BTREE,
  CONSTRAINT `rbac_refresh_tokens_usuarios_FK` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=443 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `rbac_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rbac_rol` (
  `idRol` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  `codigo_rol` varchar(25) NOT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idRol`),
  UNIQUE KEY `codigo_rol_UNIQUE` (`codigo_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `rbac_rol_modulo_operacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rbac_rol_modulo_operacion` (
  `idRolModuloOperacion` int(11) NOT NULL AUTO_INCREMENT,
  `idModulosOperaciones` int(11) NOT NULL,
  `idRol` int(11) NOT NULL,
  `fecha_asignacion` date DEFAULT NULL,
  `fecha_modificacion` date DEFAULT NULL,
  `fecha_desactivacion` date DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idRolModuloOperacion`),
  KEY `fk_rol_modulo_operacion_modulos_operaciones1_idx` (`idModulosOperaciones`),
  KEY `fk_rol_modulo_operacion_rol1_idx` (`idRol`),
  CONSTRAINT `fk_rol_modulo_operacion_modulos_operaciones1` FOREIGN KEY (`idModulosOperaciones`) REFERENCES `rbac_modulos_operaciones` (`idModulosOperaciones`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_rol_modulo_operacion_rol1` FOREIGN KEY (`idRol`) REFERENCES `rbac_rol` (`idRol`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=203 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `rbac_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rbac_sistema` (
  `idSistema` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `detalle` varchar(50) NOT NULL,
  `url` varchar(500) DEFAULT NULL,
  `icono` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idSistema`),
  UNIQUE KEY `rbac_sistema_codigo_IDX` (`codigo`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `rbac_usuario_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rbac_usuario_rol` (
  `idUsuarioRol` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` int(11) NOT NULL,
  `idRol` int(11) NOT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `fecha_modificacion` date DEFAULT NULL,
  `esActivo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idUsuarioRol`),
  KEY `fk_usuario_rol_rol1_idx` (`idRol`),
  KEY `fk_usuario_rol_usuarios1_idx` (`idUsuario`),
  CONSTRAINT `fk_usuario_rol_rol1` FOREIGN KEY (`idRol`) REFERENCES `rbac_rol` (`idRol`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuario_rol_usuarios1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `relacion_ies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `relacion_ies` (
  `idRelacionIes` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`idRelacionIes`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `respuestassolicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `respuestassolicitudes` (
  `idRespuestaSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `idSolicitud` int(11) DEFAULT NULL,
  `idEstadoSolicitud` int(11) DEFAULT NULL,
  `idUsuarioSolicitud` int(11) DEFAULT NULL,
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `detalleRespuesta` varchar(8000) DEFAULT NULL,
  `adjuntaArchivo` tinyint(4) DEFAULT '0',
  `mailRespuesta` varchar(100) DEFAULT NULL,
  `envioMail` tinyint(4) DEFAULT '0',
  `fechaRespuesta` datetime DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `archivoAjunto` varchar(150) DEFAULT NULL,
  `revisarLogs` tinyint(4) DEFAULT '0',
  `adjuntarSoloArchivoAdjunto` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idRespuestaSolicitud`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `restricciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `restricciones` (
  `idrestriccion` varchar(5) NOT NULL,
  `restriccion` varchar(100) DEFAULT NULL,
  `activo` bit(1) DEFAULT NULL,
  PRIMARY KEY (`idrestriccion`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `secciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `secciones` (
  `idSeccion` int(11) NOT NULL AUTO_INCREMENT,
  `seccion` varchar(30) DEFAULT NULL,
  `sufijo` char(1) DEFAULT NULL,
  PRIMARY KEY (`idSeccion`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `sectores_empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sectores_empresas` (
  `idsectores_empresas` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_sector` varchar(90) DEFAULT NULL,
  `codigo_sector` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`idsectores_empresas`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `seddautoevaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddautoevaluacion` (
  `idTest` int(11) NOT NULL AUTO_INCREMENT,
  `idInstrumento` int(11) DEFAULT NULL,
  `idPeriodo` char(7) DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTest`),
  KEY `idInstrumento` (`idInstrumento`),
  CONSTRAINT `seddautoevaluacion_ibfk_1` FOREIGN KEY (`idInstrumento`) REFERENCES `seddinstrumentos` (`idInstrumento`)
) ENGINE=InnoDB AUTO_INCREMENT=802 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seddautoriadesperiodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddautoriadesperiodos` (
  `idAsignacion` int(11) NOT NULL AUTO_INCREMENT,
  `idProfesor` varchar(14) DEFAULT NULL,
  `designacion` varchar(200) DEFAULT NULL,
  `idInstrumento` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idAsignacion`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seddautoridadescarrerasperiodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddautoridadescarrerasperiodos` (
  `idAsignacion` int(11) NOT NULL AUTO_INCREMENT,
  `idCarrera` int(11) DEFAULT NULL,
  `idPeriodo` varchar(14) DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `idInstrumento` int(11) DEFAULT '0',
  `designacion` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idAsignacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seddcoevaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddcoevaluacion` (
  `idTest` int(11) NOT NULL AUTO_INCREMENT,
  `idInstrumento` int(11) DEFAULT NULL,
  `idPeriodo` varchar(7) DEFAULT NULL,
  `idAsignacion` int(11) DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `fechaRegistro` datetime DEFAULT NULL,
  `fechaTest` datetime DEFAULT NULL,
  `idEvaluado` varchar(14) DEFAULT NULL,
  `numeroProceso` int(11) DEFAULT NULL,
  PRIMARY KEY (`idTest`),
  KEY `idInstrumento` (`idInstrumento`),
  CONSTRAINT `seddcoevaluacion_ibfk_1` FOREIGN KEY (`idInstrumento`) REFERENCES `seddinstrumentos` (`idInstrumento`)
) ENGINE=InnoDB AUTO_INCREMENT=1322 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seddcoevaluacionautoridad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddcoevaluacionautoridad` (
  `idTest` int(11) NOT NULL AUTO_INCREMENT,
  `idInstrumento` int(11) DEFAULT NULL,
  `idPeriodo` varchar(7) DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `idEvaluador` varchar(14) DEFAULT NULL,
  `fechaRegistro` datetime DEFAULT NULL,
  `fechaTest` datetime DEFAULT NULL,
  PRIMARY KEY (`idTest`),
  KEY `idInstrumento` (`idInstrumento`),
  CONSTRAINT `seddcoevaluacionautoridad_ibfk_1` FOREIGN KEY (`idInstrumento`) REFERENCES `seddinstrumentos` (`idInstrumento`)
) ENGINE=InnoDB AUTO_INCREMENT=1479 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sedddetalleautoevaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sedddetalleautoevaluacion` (
  `idDetalle` int(11) NOT NULL AUTO_INCREMENT,
  `idTest` int(11) DEFAULT NULL,
  `idPregunta` int(11) DEFAULT NULL,
  `respuesta` int(11) DEFAULT '0',
  PRIMARY KEY (`idDetalle`),
  KEY `idPregunta` (`idPregunta`),
  KEY `idTest` (`idTest`),
  CONSTRAINT `sedddetalleautoevaluacion_ibfk_1` FOREIGN KEY (`idPregunta`) REFERENCES `seddpreguntas` (`idPregunta`),
  CONSTRAINT `sedddetalleautoevaluacion_ibfk_2` FOREIGN KEY (`idTest`) REFERENCES `seddautoevaluacion` (`idTest`)
) ENGINE=InnoDB AUTO_INCREMENT=7557 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sedddetallecoevaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sedddetallecoevaluacion` (
  `idDetalle` int(11) NOT NULL AUTO_INCREMENT,
  `idTest` int(11) DEFAULT NULL,
  `idPregunta` int(11) DEFAULT NULL,
  `respuesta` int(11) DEFAULT '0',
  PRIMARY KEY (`idDetalle`),
  KEY `idPregunta` (`idPregunta`),
  KEY `idTest` (`idTest`),
  CONSTRAINT `sedddetallecoevaluacion_ibfk_1` FOREIGN KEY (`idPregunta`) REFERENCES `seddpreguntas` (`idPregunta`),
  CONSTRAINT `sedddetallecoevaluacion_ibfk_2` FOREIGN KEY (`idTest`) REFERENCES `seddcoevaluacion` (`idTest`)
) ENGINE=InnoDB AUTO_INCREMENT=16680 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sedddetallecoevaluacionautoridad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sedddetallecoevaluacionautoridad` (
  `idDetalle` int(11) NOT NULL AUTO_INCREMENT,
  `idTest` int(11) DEFAULT NULL,
  `idPregunta` int(11) DEFAULT NULL,
  `respuesta` int(11) DEFAULT '0',
  PRIMARY KEY (`idDetalle`),
  KEY `idPregunta` (`idPregunta`),
  KEY `idTest` (`idTest`),
  CONSTRAINT `sedddetallecoevaluacionautoridad_ibfk_1` FOREIGN KEY (`idPregunta`) REFERENCES `seddpreguntas` (`idPregunta`),
  CONSTRAINT `sedddetallecoevaluacionautoridad_ibfk_2` FOREIGN KEY (`idTest`) REFERENCES `seddcoevaluacionautoridad` (`idTest`)
) ENGINE=InnoDB AUTO_INCREMENT=11687 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sedddetalleheteroevaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sedddetalleheteroevaluacion` (
  `idDetalle` int(11) NOT NULL AUTO_INCREMENT,
  `idTest` int(11) DEFAULT NULL,
  `idPregunta` int(11) DEFAULT NULL,
  `respuesta` int(11) DEFAULT '0',
  PRIMARY KEY (`idDetalle`),
  KEY `idPregunta` (`idPregunta`),
  KEY `idTest` (`idTest`),
  CONSTRAINT `sedddetalleheteroevaluacion_ibfk_1` FOREIGN KEY (`idPregunta`) REFERENCES `seddpreguntas` (`idPregunta`),
  CONSTRAINT `sedddetalleheteroevaluacion_ibfk_2` FOREIGN KEY (`idTest`) REFERENCES `seddheteroevaluacion` (`idTest`)
) ENGINE=InnoDB AUTO_INCREMENT=244722 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seddheteroevaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddheteroevaluacion` (
  `idTest` int(11) NOT NULL AUTO_INCREMENT,
  `idInstrumento` int(11) DEFAULT NULL,
  `idPeriodo` varchar(7) DEFAULT NULL,
  `idAsignacion` int(11) DEFAULT NULL,
  `idMatricula` int(11) DEFAULT NULL,
  `fechaRegistro` datetime DEFAULT NULL,
  PRIMARY KEY (`idTest`),
  KEY `idInstrumento` (`idInstrumento`),
  CONSTRAINT `seddheteroevaluacion_ibfk_1` FOREIGN KEY (`idInstrumento`) REFERENCES `seddinstrumentos` (`idInstrumento`)
) ENGINE=InnoDB AUTO_INCREMENT=11292 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seddinsitu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddinsitu` (
  `idEvaluacion` int(11) NOT NULL AUTO_INCREMENT,
  `idInstrumento` int(11) DEFAULT NULL,
  `idPeriodo` varchar(7) DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `calificacion` decimal(5,2) DEFAULT '0.00',
  `idEvaluador` varchar(14) DEFAULT NULL,
  `fechaActualizacion` datetime DEFAULT NULL,
  `idPregunta` int(11) DEFAULT NULL,
  PRIMARY KEY (`idEvaluacion`),
  KEY `idInstrumento` (`idInstrumento`),
  CONSTRAINT `seddinsitu_ibfk_1` FOREIGN KEY (`idInstrumento`) REFERENCES `seddinstrumentos` (`idInstrumento`)
) ENGINE=InnoDB AUTO_INCREMENT=254 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seddinstrumentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddinstrumentos` (
  `idInstrumento` int(11) NOT NULL AUTO_INCREMENT,
  `idCategoria` int(11) DEFAULT NULL,
  `Instrumento` varchar(100) DEFAULT NULL,
  `codigo` varchar(3) DEFAULT NULL,
  `porcentaje` int(11) DEFAULT '0',
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idInstrumento`),
  KEY `idCategoria` (`idCategoria`),
  CONSTRAINT `seddinstrumentos_ibfk_1` FOREIGN KEY (`idCategoria`) REFERENCES `categorias_actividades` (`idCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seddinstrumentospreguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddinstrumentospreguntas` (
  `idInstrumentoPregunta` int(11) NOT NULL AUTO_INCREMENT,
  `idInstrumento` int(11) DEFAULT NULL,
  `idPregunta` int(11) DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idInstrumentoPregunta`),
  KEY `idInstrumento` (`idInstrumento`),
  KEY `idPregunta` (`idPregunta`),
  CONSTRAINT `seddinstrumentospreguntas_ibfk_1` FOREIGN KEY (`idInstrumento`) REFERENCES `seddinstrumentos` (`idInstrumento`),
  CONSTRAINT `seddinstrumentospreguntas_ibfk_2` FOREIGN KEY (`idPregunta`) REFERENCES `seddpreguntas` (`idPregunta`)
) ENGINE=InnoDB AUTO_INCREMENT=422 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seddpreguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seddpreguntas` (
  `idPregunta` int(11) NOT NULL AUTO_INCREMENT,
  `pregunta` varchar(300) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idPregunta`)
) ENGINE=InnoDB AUTO_INCREMENT=422 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `seedevaluadoresinsitu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seedevaluadoresinsitu` (
  `idAsignacionEvaluador` int(11) NOT NULL AUTO_INCREMENT,
  `idPeriodo` varchar(7) DEFAULT NULL,
  `idEvaluador` varchar(14) DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idAsignacionEvaluador`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `semanas_horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `semanas_horarios` (
  `idSemanasHorarios` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(50) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT NULL,
  `esExamen` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idSemanasHorarios`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `sistema_titulacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sistema_titulacion` (
  `codigo_sistema` int(11) NOT NULL AUTO_INCREMENT,
  `detalle` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`codigo_sistema`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `solicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solicitudes` (
  `idSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `idTipoSolicitud` int(11) DEFAULT NULL,
  `cedula` varchar(14) DEFAULT NULL,
  `solicitante` varchar(150) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  `nivel` varchar(60) DEFAULT NULL,
  `asunto` varchar(1000) DEFAULT NULL,
  `impreso` tinyint(4) DEFAULT '0',
  `fechaVenta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaImpresion` datetime DEFAULT NULL,
  `codigoSolicitud` varchar(10) DEFAULT NULL,
  `reimprimir` tinyint(4) DEFAULT '0',
  `anulada` tinyint(4) DEFAULT '0',
  `esAlumno` tinyint(4) DEFAULT '0',
  `esDocente` tinyint(4) DEFAULT '0',
  `esExterno` tinyint(4) DEFAULT '0',
  `emailSolicitante` varchar(100) DEFAULT NULL,
  `esperandoImpresion` tinyint(4) DEFAULT '0',
  `revisarLogs` tinyint(4) DEFAULT '0',
  `idPeriodo` varchar(7) DEFAULT NULL,
  `usuarioVenta` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`idSolicitud`),
  KEY `idTipoSolicitud` (`idTipoSolicitud`),
  CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`idTipoSolicitud`) REFERENCES `tipossolicitudes` (`idTipoSolicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `solicitudes_licencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solicitudes_licencias` (
  `id_licencia` int(11) NOT NULL AUTO_INCREMENT,
  `id_profesor` varchar(14) NOT NULL COMMENT 'Empleado ausente',
  `tipo_licencia` varchar(50) NOT NULL COMMENT 'Maternidad, Paternidad, Lactancia, Capacitacion, CalamidadDomestica, Fallecimiento',
  `fecha_inicio` date NOT NULL COMMENT 'Inicio de la licencia',
  `fecha_fin` date NOT NULL COMMENT 'Fin de la licencia',
  `dias_solicitados` int(11) NOT NULL COMMENT 'Cantidad de días solicitados',
  `motivo` text NOT NULL COMMENT 'Detalle del suceso/solicitud',
  `fecha_suceso` date NOT NULL COMMENT 'Fecha en que ocurrió el hecho',
  `fecha_solicitud` datetime NOT NULL COMMENT 'Fecha de registro en el sistema',
  `ruta_documento_justificativo` varchar(255) DEFAULT NULL COMMENT 'Ruta del justificativo en PDF',
  `fecha_entrega_justificativo` datetime DEFAULT NULL COMMENT 'Fecha en que se cargó el justificativo',
  `estado` varchar(30) NOT NULL DEFAULT 'PendienteJustificacion' COMMENT 'PendienteJustificacion, PendienteAprobacion, Aprobada, Rechazada, FaltaInjustificada',
  `usuario_aprobador` int(11) DEFAULT NULL COMMENT 'Usuario de TH que aprueba',
  `fecha_aprobacion` datetime DEFAULT NULL COMMENT 'Fecha de aprobación de la licencia',
  `motivo_rechazo` text COMMENT 'Detalle del rechazo en caso de aplicar',
  PRIMARY KEY (`id_licencia`),
  KEY `fk_solicitudes_lic_profesores` (`id_profesor`),
  KEY `fk_solicitudes_lic_usuario_aprobador` (`usuario_aprobador`),
  CONSTRAINT `fk_solicitudes_lic_profesores` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_solicitudes_lic_usuario_aprobador` FOREIGN KEY (`usuario_aprobador`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Permisos con sueldo y licencias justificadas conforme a la ley';

DROP TABLE IF EXISTS `solicitudescalificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solicitudescalificaciones` (
  `idSolicitudCalificacion` int(11) NOT NULL AUTO_INCREMENT,
  `fechaRegistro` datetime DEFAULT NULL,
  `fechaHabilitado` datetime DEFAULT NULL,
  `idSolicitud` int(11) DEFAULT NULL,
  `idParcial` int(11) DEFAULT NULL,
  `idMatricula` int(11) DEFAULT NULL,
  `idAsignatura` int(11) DEFAULT NULL,
  `idNivel` int(11) DEFAULT NULL,
  `idPeriodo` char(7) DEFAULT NULL,
  `paralelo` varchar(10) DEFAULT NULL,
  `fechaCalificacion` datetime DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `calificacion` decimal(4,2) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idSolicitudCalificacion`),
  KEY `idSolicitud` (`idSolicitud`),
  KEY `idParcial` (`idParcial`),
  KEY `idMatricula` (`idMatricula`),
  KEY `idNivel` (`idNivel`),
  KEY `idAsignatura` (`idAsignatura`),
  CONSTRAINT `solicitudescalificaciones_ibfk_1` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitudes` (`idSolicitud`),
  CONSTRAINT `solicitudescalificaciones_ibfk_2` FOREIGN KEY (`idParcial`) REFERENCES `parciales` (`idParcial`),
  CONSTRAINT `solicitudescalificaciones_ibfk_3` FOREIGN KEY (`idMatricula`) REFERENCES `matriculas` (`idMatricula`),
  CONSTRAINT `solicitudescalificaciones_ibfk_4` FOREIGN KEY (`idNivel`) REFERENCES `cursos` (`idNivel`),
  CONSTRAINT `solicitudescalificaciones_ibfk_5` FOREIGN KEY (`idAsignatura`) REFERENCES `asignaturas` (`idAsignatura`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `solicitudeslogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solicitudeslogs` (
  `idLogSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `idSolicitud` int(11) DEFAULT NULL,
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `detalle` varchar(2000) DEFAULT NULL,
  `idRespuestaSolicitud` int(11) DEFAULT NULL,
  PRIMARY KEY (`idLogSolicitud`),
  KEY `idSolicitud` (`idSolicitud`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `subcategoria_vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subcategoria_vehiculos` (
  `idSubcategoria` int(11) NOT NULL AUTO_INCREMENT,
  `subcategoria` varchar(50) DEFAULT NULL,
  `activa` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idSubcategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `subcategorias_actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subcategorias_actividades` (
  `idSubcategoria` int(7) NOT NULL AUTO_INCREMENT,
  `idCategoria` int(14) DEFAULT NULL,
  `subcategoria` varchar(200) DEFAULT NULL,
  `esDocencia` tinyint(4) DEFAULT '0',
  `activa` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idSubcategoria`),
  KEY `fk_subcategorias_actividades_categorias_actividades1_idx` (`idCategoria`),
  CONSTRAINT `fk_subcategorias_actividades_categorias_actividades1` FOREIGN KEY (`idCategoria`) REFERENCES `categorias_actividades` (`idCategoria`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `sueldos_contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sueldos_contratos` (
  `idSueldosContratos` int(11) NOT NULL AUTO_INCREMENT,
  `idContratos` int(11) NOT NULL,
  `fecha_registro` date DEFAULT NULL,
  `fecha_cambiosueldo` date DEFAULT NULL,
  `sueldo` decimal(10,2) DEFAULT '0.00',
  `esactivo` tinyint(4) DEFAULT NULL,
  `usarioRegistra` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idSueldosContratos`),
  KEY `fk_sueldos_contratos_contratos1_idx` (`idContratos`),
  CONSTRAINT `fk_sueldos_contratos_contratos1` FOREIGN KEY (`idContratos`) REFERENCES `contratos` (`idContratos`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `terminos_condiciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `terminos_condiciones` (
  `idTermino` int(11) NOT NULL AUTO_INCREMENT,
  `idCategoria` int(11) DEFAULT NULL,
  `versionTermino` varchar(20) DEFAULT NULL,
  `contenido` text,
  `fechaPublicacion` date DEFAULT NULL,
  `fechaRegistro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `archivoHtml` varchar(100) DEFAULT NULL,
  `esVigente` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idTermino`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `tipo_contacto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_contacto` (
  `idtipo_contacto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_contacto` varchar(90) DEFAULT NULL,
  `longitud_contacto` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`idtipo_contacto`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `tipo_funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_funcionario` (
  `idTipoFuncionario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) DEFAULT NULL,
  `esDocente` bit(1) DEFAULT NULL,
  PRIMARY KEY (`idTipoFuncionario`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `tipos_asignatura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_asignatura` (
  `idtipo_asignatura` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_asignatura` varchar(45) DEFAULT NULL,
  `abreviatura` char(5) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT NULL,
  `no_definida` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idtipo_asignatura`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `tipos_becas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_becas` (
  `idTipoBeca` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idTipoBeca`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `tipos_contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_contratos` (
  `idTiposContratos` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(90) DEFAULT NULL,
  `codigo` varchar(10) DEFAULT NULL,
  `duracionSemanas` int(11) DEFAULT NULL,
  `esAfiliado` bit(1) DEFAULT NULL,
  PRIMARY KEY (`idTiposContratos`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `tipos_documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_documentos` (
  `idtipos_documentos` int(11) NOT NULL AUTO_INCREMENT,
  `documento` varchar(90) DEFAULT NULL,
  `subijo_documento` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`idtipos_documentos`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tipos_ofertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_ofertas` (
  `idtipos_ofertas` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`idtipos_ofertas`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `tiposangre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tiposangre` (
  `codigoTipoSangre` varchar(5) NOT NULL,
  `grupo` varchar(5) DEFAULT NULL,
  `sitemaRH` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`codigoTipoSangre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `tiposdocumentosi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tiposdocumentosi` (
  `tipoDocumento` varchar(1) NOT NULL,
  `documento` varchar(20) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`tipoDocumento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tipossolicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipossolicitudes` (
  `idTipoSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `idCategoriaSolicitud` int(11) DEFAULT NULL,
  `idDepartamentoSolicitud` int(11) DEFAULT NULL,
  `tipoSolicitud` varchar(200) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `escuelaConduccion` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`idTipoSolicitud`),
  KEY `idCategoriaSolicitud` (`idCategoriaSolicitud`),
  KEY `idDepartamentoSolicitud` (`idDepartamentoSolicitud`),
  CONSTRAINT `tipossolicitudes_ibfk_1` FOREIGN KEY (`idCategoriaSolicitud`) REFERENCES `categoriassolicitudes` (`idCategoriaSolicitud`),
  CONSTRAINT `tipossolicitudes_ibfk_2` FOREIGN KEY (`idDepartamentoSolicitud`) REFERENCES `departamentossolicitudes` (`idDepartamentoSolicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `titulos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `titulos` (
  `idTitulo` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) DEFAULT NULL,
  `titulo_femenino` varchar(100) DEFAULT NULL,
  `nivel_inicial` int(11) DEFAULT '1',
  `nivel_final` int(11) DEFAULT '6',
  `idCarrera` int(11) DEFAULT NULL,
  `tiene_practicas` tinyint(4) DEFAULT '1',
  `creditos_practicas` int(11) DEFAULT '0',
  `tiene_titulacion` tinyint(4) DEFAULT '1',
  `creditos_titulacion` int(11) DEFAULT '0',
  PRIMARY KEY (`idTitulo`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `titulos_en_curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `titulos_en_curso` (
  `idTitulosProfesorCurso` int(11) NOT NULL AUTO_INCREMENT,
  `idProfesor` varchar(14) NOT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  `idUniversidad` int(11) NOT NULL,
  `idGradoAcademico` int(11) NOT NULL,
  `idCampoDetalladoUnesco` int(11) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `tieneBeca` tinyint(4) DEFAULT NULL,
  `porcentajeBeca` int(11) DEFAULT NULL,
  `idTipoBeca` int(11) DEFAULT NULL,
  `montoBeca` decimal(10,2) DEFAULT NULL,
  `idFinanciamiento` int(11) DEFAULT NULL,
  `nombreOtro` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`idTitulosProfesorCurso`),
  KEY `fk_titulos_en_curso_universidades1_idx` (`idUniversidad`),
  KEY `fk_titulos_en_curso_grados_academicos1_idx` (`idGradoAcademico`),
  KEY `fk_titulos_en_curso_tipos_becas1_idx` (`idTipoBeca`),
  KEY `fk_titulos_en_curso_financiamiento_beca1_idx` (`idFinanciamiento`),
  KEY `fk_titulos_en_curso_campo_detallado_unesco1_idx` (`idCampoDetalladoUnesco`),
  KEY `fk_titulos_en_curso_profesores1_idx` (`idProfesor`),
  CONSTRAINT `fk_titulos_en_curso_campo_detallado_unesco1` FOREIGN KEY (`idCampoDetalladoUnesco`) REFERENCES `campo_detallado_unesco` (`idCampoDetalladoUnesco`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_titulos_en_curso_financiamiento_beca1` FOREIGN KEY (`idFinanciamiento`) REFERENCES `financiamiento_beca` (`idFinanciamiento`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_titulos_en_curso_grados_academicos1` FOREIGN KEY (`idGradoAcademico`) REFERENCES `grados_academicos` (`idGradoAcademico`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_titulos_en_curso_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_titulos_en_curso_tipos_becas1` FOREIGN KEY (`idTipoBeca`) REFERENCES `tipos_becas` (`idTipoBeca`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_titulos_en_curso_universidades1` FOREIGN KEY (`idUniversidad`) REFERENCES `universidades` (`idUniversidad`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `titulos_profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `titulos_profesores` (
  `idTitulosProfesor` int(11) NOT NULL AUTO_INCREMENT,
  `idProfesor` varchar(14) NOT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  `idUniversidad` int(11) NOT NULL,
  `idGradoAcademico` int(11) NOT NULL,
  `codigo_senescyt` varchar(90) DEFAULT NULL,
  `fecha_obtencion` date DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `idCampoDetalladoUnesco` int(11) NOT NULL,
  `archivoTitulo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idTitulosProfesor`),
  KEY `fk_titulos_universidades1_idx` (`idUniversidad`),
  KEY `fk_titulos_grados_academicos1_idx` (`idGradoAcademico`),
  KEY `fk_titulos_profesores_campo_detallado_unesco1_idx` (`idCampoDetalladoUnesco`),
  KEY `fk_titulos_profesores_profesores1_idx` (`idProfesor`),
  CONSTRAINT `fk_titulos_grados_academicos1` FOREIGN KEY (`idGradoAcademico`) REFERENCES `grados_academicos` (`idGradoAcademico`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_titulos_profesores_campo_detallado_unesco1` FOREIGN KEY (`idCampoDetalladoUnesco`) REFERENCES `campo_detallado_unesco` (`idCampoDetalladoUnesco`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_titulos_profesores_profesores1` FOREIGN KEY (`idProfesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_titulos_universidades1` FOREIGN KEY (`idUniversidad`) REFERENCES `universidades` (`idUniversidad`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `universidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `universidades` (
  `idUniversidad` int(11) NOT NULL AUTO_INCREMENT,
  `idpaises` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `codigo_siees` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idUniversidad`),
  KEY `fk_universidades_paises1_idx` (`idpaises`),
  CONSTRAINT `fk_universidades_paises1` FOREIGN KEY (`idpaises`) REFERENCES `paises` (`idpaises`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=392 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `idUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `idSigafi` varchar(20) NOT NULL COMMENT 'este es idSifafi\\n',
  `tablaSigafi` enum('alumno','profesor','otros') NOT NULL,
  `nombre` varchar(200) DEFAULT NULL,
  `contrasenia` varchar(250) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  `administrador` tinyint(4) NOT NULL DEFAULT '0',
  `emailInstitucional` varchar(100) DEFAULT NULL,
  `emailValidado` tinyint(4) NOT NULL DEFAULT '0',
  `hashEmailToken` varchar(255) DEFAULT NULL,
  `fechaEmailValidacion` datetime DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `usuario_UNIQUE` (`idSigafi`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `usuarios_web`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios_web` (
  `usuario` varchar(20) NOT NULL,
  `password` varchar(20) DEFAULT NULL,
  `salida` tinyint(4) DEFAULT '0',
  `ingreso` tinyint(4) DEFAULT '0',
  `activo` tinyint(4) DEFAULT '0',
  `asistencia` tinyint(4) DEFAULT '0',
  `esRrhh` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `usuariosdepartamentossolicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuariosdepartamentossolicitudes` (
  `idUsuarioDepartamentoSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `idTipoSolicitud` int(11) DEFAULT NULL,
  `idUsuarioSolicitud` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaBaja` datetime DEFAULT NULL,
  PRIMARY KEY (`idUsuarioDepartamentoSolicitud`),
  KEY `idUsuarioSolicitud` (`idUsuarioSolicitud`),
  KEY `idTipoSolicitud` (`idTipoSolicitud`),
  CONSTRAINT `usuariosdepartamentossolicitudes_ibfk_1` FOREIGN KEY (`idUsuarioSolicitud`) REFERENCES `usuariossolicitudes` (`idUsuarioSolicitud`),
  CONSTRAINT `usuariosdepartamentossolicitudes_ibfk_2` FOREIGN KEY (`idTipoSolicitud`) REFERENCES `tipossolicitudes` (`idTipoSolicitud`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `usuariossolicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuariossolicitudes` (
  `idUsuarioSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(60) DEFAULT NULL,
  `clave` varchar(20) DEFAULT NULL,
  `resetear` tinyint(4) DEFAULT '0',
  `email` varchar(60) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `Administrador` tinyint(4) DEFAULT '0',
  `nombre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idUsuarioSolicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_cierres_colectivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_cierres_colectivos` (
  `id_cierre` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `dias_descuento` decimal(4,2) NOT NULL DEFAULT '12.00',
  `fines_semana_incluidos` int(11) NOT NULL DEFAULT '2',
  `fecha_creacion` datetime NOT NULL,
  `registrado_por_id` int(11) NOT NULL,
  PRIMARY KEY (`id_cierre`),
  KEY `fk_vac_cierres_usuario` (`registrado_por_id`),
  CONSTRAINT `fk_vac_cierres_usuario` FOREIGN KEY (`registrado_por_id`) REFERENCES `usuarios` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_cierres_colectivos_exclusiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_cierres_colectivos_exclusiones` (
  `id_exclusion` int(11) NOT NULL AUTO_INCREMENT,
  `id_cierre` int(11) NOT NULL,
  `id_profesor` varchar(14) NOT NULL,
  PRIMARY KEY (`id_exclusion`),
  UNIQUE KEY `ux_vac_cierre_profesor` (`id_cierre`,`id_profesor`),
  KEY `fk_vac_excl_cierre` (`id_cierre`),
  KEY `fk_vac_excl_profesor` (`id_profesor`),
  CONSTRAINT `fk_vac_excl_cierre` FOREIGN KEY (`id_cierre`) REFERENCES `vac_cierres_colectivos` (`id_cierre`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_vac_excl_profesor` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`idProfesor`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_config_dias_extras_depto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_config_dias_extras_depto` (
  `id_config` int(11) NOT NULL AUTO_INCREMENT,
  `iddepartamentos` int(11) NOT NULL,
  `id_institucion` int(11) DEFAULT NULL,
  `dias_extras` decimal(6,2) NOT NULL DEFAULT '0.00',
  `requiere_fin_semana` tinyint(1) NOT NULL DEFAULT '0',
  `cant_fines_semana_requeridos` int(11) DEFAULT '0',
  `periodo_aplicacion` varchar(9) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `motivo` varchar(255) DEFAULT NULL,
  `fecha_vigencia_desde` date DEFAULT NULL,
  `fecha_vigencia_hasta` date DEFAULT NULL,
  `registrado_por_id` int(11) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_config`),
  KEY `fk_vac_cfg_extras_depto` (`iddepartamentos`),
  CONSTRAINT `fk_vac_cfg_extras_depto` FOREIGN KEY (`iddepartamentos`) REFERENCES `departamentos` (`iddepartamentos`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_config_dias_extras_excepciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_config_dias_extras_excepciones` (
  `id_excepcion` int(11) NOT NULL AUTO_INCREMENT,
  `id_config` int(11) NOT NULL,
  `id_profesor` varchar(14) NOT NULL,
  `tipo` varchar(10) NOT NULL,
  PRIMARY KEY (`id_excepcion`),
  UNIQUE KEY `ux_vac_config_profesor` (`id_config`,`id_profesor`),
  KEY `fk_vac_excep_config` (`id_config`),
  KEY `fk_vac_excep_profesor` (`id_profesor`),
  CONSTRAINT `fk_vac_excep_config` FOREIGN KEY (`id_config`) REFERENCES `vac_config_dias_extras_depto` (`id_config`) ON DELETE CASCADE,
  CONSTRAINT `fk_vac_excep_profesor` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`idProfesor`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_configuracion` (
  `id_config` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `valor` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_config`),
  UNIQUE KEY `ux_vac_config_clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_ledger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_ledger` (
  `id_ledger` int(11) NOT NULL AUTO_INCREMENT,
  `id_profesor` varchar(14) NOT NULL,
  `tipo_transaccion` varchar(30) NOT NULL,
  `dias` decimal(8,4) NOT NULL,
  `fines_semana` int(11) NOT NULL DEFAULT '0',
  `fecha` datetime NOT NULL,
  `periodo` varchar(9) NOT NULL,
  `detalle` varchar(255) NOT NULL,
  `id_periodo_vacaciones` int(11) DEFAULT NULL,
  `id_permiso` int(11) DEFAULT NULL,
  `registrado_por_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_ledger`),
  KEY `fk_vac_ledger_profesor` (`id_profesor`),
  KEY `fk_vac_ledger_periodo_vac` (`id_periodo_vacaciones`),
  KEY `fk_vac_ledger_permiso` (`id_permiso`),
  KEY `fk_vac_ledger_usuario` (`registrado_por_id`),
  CONSTRAINT `fk_vac_ledger_periodo_vac` FOREIGN KEY (`id_periodo_vacaciones`) REFERENCES `vac_periodos_vacacionales` (`id_periodo_vacaciones`),
  CONSTRAINT `fk_vac_ledger_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `vac_permisos` (`id_permiso`),
  CONSTRAINT `fk_vac_ledger_profesor` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`idProfesor`),
  CONSTRAINT `fk_vac_ledger_usuario` FOREIGN KEY (`registrado_por_id`) REFERENCES `usuarios` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=882 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_periodos_vacacionales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_periodos_vacacionales` (
  `id_periodo_vacaciones` int(11) NOT NULL AUTO_INCREMENT,
  `id_profesor` varchar(14) NOT NULL,
  `origen_evento` varchar(30) NOT NULL,
  `periodo_lectivo` varchar(9) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `dias_solicitados` int(11) NOT NULL,
  `cant_fines_semana` int(11) NOT NULL DEFAULT '0',
  `es_fuera_planificacion` tinyint(1) NOT NULL DEFAULT '0',
  `estado` varchar(30) NOT NULL DEFAULT 'PENDIENTE',
  `fecha_solicitud` datetime NOT NULL,
  `ruta_documento` varchar(255) DEFAULT NULL,
  `usuario_th` int(11) DEFAULT NULL,
  `fecha_aprobacion_th` datetime DEFAULT NULL,
  `usuario_rl` int(11) DEFAULT NULL,
  `fecha_aprobacion_rl` datetime DEFAULT NULL,
  `motivo_solicitud` text,
  `motivo_rechazo` text,
  `requiere_fin_semana` tinyint(1) NOT NULL DEFAULT '0',
  `cant_fines_semana_requeridos` int(11) DEFAULT NULL,
  `periodo_asignado` varchar(9) DEFAULT NULL COMMENT 'Bolsa de días FIFO imputada (Ej. 2021-2022)',
  PRIMARY KEY (`id_periodo_vacaciones`),
  KEY `fk_vac_periodos_profesor` (`id_profesor`),
  KEY `fk_vac_periodos_th` (`usuario_th`),
  KEY `fk_vac_periodos_rl` (`usuario_rl`),
  CONSTRAINT `fk_vac_periodos_profesor` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`idProfesor`),
  CONSTRAINT `fk_vac_periodos_rl` FOREIGN KEY (`usuario_rl`) REFERENCES `usuarios` (`idUsuario`),
  CONSTRAINT `fk_vac_periodos_th` FOREIGN KEY (`usuario_th`) REFERENCES `usuarios` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=597 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_permisos` (
  `id_permiso` int(11) NOT NULL AUTO_INCREMENT,
  `id_profesor` varchar(14) NOT NULL,
  `id_tipo_permiso` int(11) NOT NULL,
  `horas_solicitadas` decimal(4,2) DEFAULT NULL,
  `dias_solicitados` int(11) DEFAULT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'PENDIENTE_RECUPERACION',
  `fecha_suceso` date NOT NULL,
  `fecha_solicitud` datetime NOT NULL,
  `motivo` text NOT NULL,
  `ruta_justificativo` varchar(255) DEFAULT NULL,
  `fecha_entrega_justificativo` datetime DEFAULT NULL,
  `aprobado_por_id` int(11) DEFAULT NULL,
  `notas_rrhh` text,
  `afecta_vacaciones` tinyint(1) NOT NULL DEFAULT '0',
  `adjunto_pendiente_fisico` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_permiso`),
  KEY `fk_vac_permisos_profesor` (`id_profesor`),
  KEY `fk_vac_permisos_tipo` (`id_tipo_permiso`),
  KEY `fk_vac_permisos_aprobador` (`aprobado_por_id`),
  CONSTRAINT `fk_vac_permisos_aprobador` FOREIGN KEY (`aprobado_por_id`) REFERENCES `usuarios` (`idUsuario`),
  CONSTRAINT `fk_vac_permisos_profesor` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`idProfesor`),
  CONSTRAINT `fk_vac_permisos_tipo` FOREIGN KEY (`id_tipo_permiso`) REFERENCES `vac_tipos_permisos` (`id_tipo_permiso`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_plantillas_documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_plantillas_documentos` (
  `id_plantilla` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `cuerpo` text NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`id_plantilla`),
  UNIQUE KEY `ux_vac_plantillas_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_recuperacion_feriados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_recuperacion_feriados` (
  `id_recuperacion_feriado` int(11) NOT NULL AUTO_INCREMENT,
  `id_dias_especiales` int(11) NOT NULL,
  `id_profesor` varchar(14) NOT NULL,
  `fecha_recuperacion` date NOT NULL,
  `completado` tinyint(1) NOT NULL DEFAULT '0',
  `observacion` varchar(255) DEFAULT NULL,
  `registrado_por_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_recuperacion_feriado`),
  KEY `fk_vac_recup_feriado_cron` (`id_dias_especiales`),
  KEY `fk_vac_recup_feriado_prof` (`id_profesor`),
  KEY `fk_vac_recup_feriado_usr` (`registrado_por_id`),
  CONSTRAINT `fk_vac_recup_feriado_cron` FOREIGN KEY (`id_dias_especiales`) REFERENCES `cron_dias_especiales` (`idDiasEspeciales`),
  CONSTRAINT `fk_vac_recup_feriado_prof` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`idProfesor`),
  CONSTRAINT `fk_vac_recup_feriado_usr` FOREIGN KEY (`registrado_por_id`) REFERENCES `usuarios` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_recuperacion_tiempo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_recuperacion_tiempo` (
  `id_recuperacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_permiso` int(11) NOT NULL,
  `fecha_recuperada` date NOT NULL,
  `horas_recuperadas` decimal(4,2) NOT NULL,
  `fecha_registro` datetime NOT NULL,
  `usuario_th` int(11) NOT NULL,
  PRIMARY KEY (`id_recuperacion`),
  KEY `fk_vac_recup_permiso` (`id_permiso`),
  KEY `fk_vac_recup_usuario` (`usuario_th`),
  CONSTRAINT `fk_vac_recup_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `vac_permisos` (`id_permiso`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_vac_recup_usuario` FOREIGN KEY (`usuario_th`) REFERENCES `usuarios` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_saldos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_saldos` (
  `id_saldo_vacaciones` int(11) NOT NULL AUTO_INCREMENT,
  `id_profesor` varchar(14) NOT NULL,
  `periodo` varchar(9) NOT NULL,
  `dias_ganados` decimal(8,4) NOT NULL DEFAULT '15.0000',
  `dias_tomados` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `dias_acumulados` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `fines_semana_tomados` int(11) NOT NULL DEFAULT '0',
  `fecha_ultimo_calculo` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_saldo_vacaciones`),
  UNIQUE KEY `ux_vac_saldos_profesor_periodo` (`id_profesor`,`periodo`),
  KEY `fk_vac_saldos_profesor` (`id_profesor`),
  CONSTRAINT `fk_vac_saldos_profesor` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`idProfesor`)
) ENGINE=InnoDB AUTO_INCREMENT=542 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vac_tipos_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vac_tipos_permisos` (
  `id_tipo_permiso` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `unidad` varchar(10) NOT NULL DEFAULT 'HORAS',
  `requiere_adjunto` tinyint(1) NOT NULL DEFAULT '0',
  `afecta_vacaciones` tinyint(1) NOT NULL DEFAULT '0',
  `max_horas_por_solicitud` decimal(4,2) DEFAULT NULL,
  `max_permisos_mes` int(11) DEFAULT NULL,
  `es_calamidad_domestica` tinyint(1) NOT NULL DEFAULT '0',
  `dias_calendario_fijos` int(11) DEFAULT NULL,
  `es_recuperable` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_tipo_permiso`),
  UNIQUE KEY `ux_vac_tipos_permisos_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehiculos` (
  `idVehiculo` int(11) NOT NULL AUTO_INCREMENT,
  `idSubcategoria` int(11) DEFAULT NULL,
  `numero_vehiculo` varchar(3) DEFAULT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `idCategoria` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `observacion` varchar(200) DEFAULT NULL,
  `chasis` varchar(50) DEFAULT NULL,
  `motor` varchar(50) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idVehiculo`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vehiculos_operacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehiculos_operacion` (
  `idVehiculo` int(11) NOT NULL,
  `id_tipo_licencia` int(11) DEFAULT NULL,
  `id_instructor_fijo` varchar(14) DEFAULT NULL,
  `estado_mecanico` varchar(30) DEFAULT 'OPERATIVO',
  PRIMARY KEY (`idVehiculo`),
  CONSTRAINT `vehiculos_operacion_ibfk_1` FOREIGN KEY (`idVehiculo`) REFERENCES `vehiculos` (`idVehiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionarea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionarea` (
  `idArea` int(11) NOT NULL AUTO_INCREMENT,
  `area` varchar(250) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idArea`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacioncategoriasobjetivosoportunidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacioncategoriasobjetivosoportunidades` (
  `idCategoriaObjetivoOportunidad` int(11) NOT NULL AUTO_INCREMENT,
  `categoriaObjetivoOportunidad` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idCategoriaObjetivoOportunidad`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacioncategoriasresultadosaprendizajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacioncategoriasresultadosaprendizajes` (
  `idCategoriaResultadoAprendizaje` int(11) NOT NULL AUTO_INCREMENT,
  `categoriaResultadoAprendizaje` varchar(50) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idCategoriaResultadoAprendizaje`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionestadosproyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionestadosproyectos` (
  `idEstadoProyecto` int(11) NOT NULL AUTO_INCREMENT,
  `estado` varchar(100) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idEstadoProyecto`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionhabilidadesblandas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionhabilidadesblandas` (
  `idHablidadBlanda` int(11) NOT NULL AUTO_INCREMENT,
  `habilidadBlanda` varchar(100) DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idHablidadBlanda`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionimpactosproyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionimpactosproyectos` (
  `idImpactoproyecto` int(11) NOT NULL AUTO_INCREMENT,
  `impactoProyecto` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idImpactoproyecto`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionlineasaccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionlineasaccion` (
  `idlineaAsccion` int(11) NOT NULL AUTO_INCREMENT,
  `linea` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`idlineaAsccion`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionobjetivosoportunidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionobjetivosoportunidades` (
  `idObjetivoOportunidad` int(11) NOT NULL AUTO_INCREMENT,
  `idCategoriaObjetivoOportunidad` int(11) DEFAULT NULL,
  `objetivoOportunidad` varchar(500) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idObjetivoOportunidad`),
  KEY `idCategoriaObjetivoOportunidad` (`idCategoriaObjetivoOportunidad`),
  CONSTRAINT `vinculacionobjetivosoportunidades_ibfk_1` FOREIGN KEY (`idCategoriaObjetivoOportunidad`) REFERENCES `vinculacioncategoriasobjetivosoportunidades` (`idCategoriaObjetivoOportunidad`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionobjetivospedis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionobjetivospedis` (
  `idObjetivoPedi` int(11) NOT NULL AUTO_INCREMENT,
  `pedi` varchar(9) DEFAULT NULL,
  `objetivoPedi` varchar(500) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idObjetivoPedi`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionpoblaciondirecta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionpoblaciondirecta` (
  `idPoblacionDirecta` int(11) NOT NULL AUTO_INCREMENT,
  `directa` varchar(250) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idPoblacionDirecta`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionpoblacionexterna`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionpoblacionexterna` (
  `idPoblacionExterna` int(11) NOT NULL AUTO_INCREMENT,
  `externa` varchar(250) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idPoblacionExterna`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionpoblacionindirecta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionpoblacionindirecta` (
  `idPoblacionIndirecta` int(11) NOT NULL AUTO_INCREMENT,
  `indirecta` varchar(250) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idPoblacionIndirecta`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionprogramas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionprogramas` (
  `idPrograma` int(11) NOT NULL AUTO_INCREMENT,
  `programa` varchar(200) DEFAULT NULL,
  `descripcion` text,
  `fechaInicio` date DEFAULT NULL,
  `fechaFin` date DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idPrograma`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectos` (
  `idProyectoVinculacion` int(11) NOT NULL AUTO_INCREMENT,
  `idProgramaVinculacion` int(11) DEFAULT NULL,
  `proyecto` varchar(500) DEFAULT NULL,
  `idCampoDetalladoUnesco` int(11) DEFAULT NULL,
  `idlineaAsccion` int(11) DEFAULT NULL,
  `esAsistenciaComunitaria` tinyint(4) DEFAULT '0',
  `esEducacionContinua` tinyint(4) DEFAULT '0',
  `tiempoEstimado` varchar(50) DEFAULT NULL,
  `resumenEjecutivo` text,
  `antecedentes` text,
  `alcanceTerritorial` varchar(100) DEFAULT NULL,
  `metodologia` text,
  `impacto` text,
  `innovacion` text,
  `habilidadesDescripcion` text,
  `idProfesor` varchar(14) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  `idPoblacionDirecta` int(11) DEFAULT NULL,
  `idPoblacionIndirecta` int(11) DEFAULT NULL,
  `idPoblacionExterna` int(11) DEFAULT NULL,
  `biografia` text,
  PRIMARY KEY (`idProyectoVinculacion`),
  KEY `idCampoDetalladoUnesco` (`idCampoDetalladoUnesco`),
  KEY `idlineaAsccion` (`idlineaAsccion`),
  CONSTRAINT `vinculacionproyectos_ibfk_1` FOREIGN KEY (`idCampoDetalladoUnesco`) REFERENCES `campo_detallado_unesco` (`idCampoDetalladoUnesco`),
  CONSTRAINT `vinculacionproyectos_ibfk_2` FOREIGN KEY (`idlineaAsccion`) REFERENCES `vinculacionlineasaccion` (`idlineaAsccion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosalumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosalumnos` (
  `idProyectoAlumno` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idMatricula` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoAlumno`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idMatricula` (`idMatricula`),
  CONSTRAINT `vinculacionproyectosalumnos_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosalumnos_ibfk_2` FOREIGN KEY (`idMatricula`) REFERENCES `matriculas` (`idMatricula`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectoscarreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectoscarreras` (
  `idProyectoCarrera` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idCarrera` int(11) DEFAULT NULL,
  `esPrincipal` tinyint(4) DEFAULT '0',
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoCarrera`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idCarrera` (`idCarrera`),
  CONSTRAINT `vinculacionproyectoscarreras_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectoscarreras_ibfk_2` FOREIGN KEY (`idCarrera`) REFERENCES `carreras` (`idCarrera`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectoscarrerasdetalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectoscarrerasdetalle` (
  `idProyectoCarrera` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idTipoPoblacion` int(11) DEFAULT NULL,
  `poblacion` varchar(100) DEFAULT NULL,
  `descripcion` varchar(400) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  PRIMARY KEY (`idProyectoCarrera`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idTipoPoblacion` (`idTipoPoblacion`),
  CONSTRAINT `vinculacionproyectoscarrerasdetalle_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectoscarrerasdetalle_ibfk_2` FOREIGN KEY (`idTipoPoblacion`) REFERENCES `vinculaciontipospoblaciones` (`idTipoPoblacion`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectoscronograma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectoscronograma` (
  `idProyectosCronograma` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `fechaInicioPlanificada` timestamp NULL DEFAULT NULL,
  `fechaFinPlanificada` timestamp NULL DEFAULT NULL,
  `fechaInicioCumplida` timestamp NULL DEFAULT NULL,
  `fechaFinCumplida` timestamp NULL DEFAULT NULL,
  `actividad` varchar(5000) DEFAULT NULL,
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idProyectosCronograma`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectoscronograma_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosentidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosentidades` (
  `idProyectoEntidad` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `entidad` varchar(200) DEFAULT NULL,
  `tipoEntidad` varchar(200) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoEntidad`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosentidades_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectoshabilidadesblandas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectoshabilidadesblandas` (
  `idProyectoHabilidad` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idHablidadBlanda` int(11) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoHabilidad`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idHablidadBlanda` (`idHablidadBlanda`),
  CONSTRAINT `vinculacionproyectoshabilidadesblandas_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectoshabilidadesblandas_ibfk_2` FOREIGN KEY (`idHablidadBlanda`) REFERENCES `vinculacionhabilidadesblandas` (`idHablidadBlanda`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosimpactos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosimpactos` (
  `idProyectoImpacto` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idImpactoproyecto` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoImpacto`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idImpactoproyecto` (`idImpactoproyecto`),
  CONSTRAINT `vinculacionproyectosimpactos_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosimpactos_ibfk_2` FOREIGN KEY (`idImpactoproyecto`) REFERENCES `vinculacionimpactosproyectos` (`idImpactoproyecto`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosmateriales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosmateriales` (
  `idProyectosMateriales` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `material` varchar(5000) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `valor` decimal(5,2) DEFAULT NULL,
  `total` decimal(5,2) DEFAULT NULL,
  `instituto` int(11) NOT NULL DEFAULT '0',
  `autogestion` int(11) NOT NULL DEFAULT '0',
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idProyectosMateriales`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosmateriales_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosobjetivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosobjetivos` (
  `idProyectoObjetivo` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `objetivo` text,
  `esGeneral` tinyint(4) DEFAULT '0',
  `resultado` text,
  `orden` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoObjetivo`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosobjetivos_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosobjetivosoportunidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosobjetivosoportunidades` (
  `idProyectObjetivoOportunidad` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idObjetivoOportunidad` int(11) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectObjetivoOportunidad`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idObjetivoOportunidad` (`idObjetivoOportunidad`),
  CONSTRAINT `vinculacionproyectosobjetivosoportunidades_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosobjetivosoportunidades_ibfk_2` FOREIGN KEY (`idObjetivoOportunidad`) REFERENCES `vinculacionobjetivosoportunidades` (`idObjetivoOportunidad`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosobjetivospedis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosobjetivospedis` (
  `idProyectoObjetivoPedi` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idObjetivoPedi` int(11) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoObjetivoPedi`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idObjetivoPedi` (`idObjetivoPedi`),
  CONSTRAINT `vinculacionproyectosobjetivospedis_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosobjetivospedis_ibfk_2` FOREIGN KEY (`idObjetivoPedi`) REFERENCES `vinculacionobjetivospedis` (`idObjetivoPedi`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosperiodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosperiodos` (
  `idProyectoPeriodo` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idPeriodo` varchar(7) DEFAULT NULL,
  `esPrincipal` tinyint(4) DEFAULT '0',
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoPeriodo`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosperiodos_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosplanesaprendizaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosplanesaprendizaje` (
  `idProyectosPlanesAprendizaje` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idProyectosResultadosAprendizaje` int(11) DEFAULT NULL,
  `actividad` varchar(5000) DEFAULT NULL,
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idProyectosPlanesAprendizaje`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idProyectosResultadosAprendizaje` (`idProyectosResultadosAprendizaje`),
  CONSTRAINT `vinculacionproyectosplanesaprendizaje_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosplanesaprendizaje_ibfk_2` FOREIGN KEY (`idProyectosResultadosAprendizaje`) REFERENCES `vinculacionproyectosresultadosaprendizaje` (`idProyectosResultadosAprendizaje`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosplantrabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosplantrabajo` (
  `idProyectosPlanTrabajo` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idProyectoObjetivo` int(11) DEFAULT NULL,
  `idProyectoImpacto` int(11) DEFAULT NULL,
  `indicador` text,
  `resultadoEsperado` text,
  `actividades` text,
  `medioVerificacion` text,
  `resultados` text,
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idProyectosPlanTrabajo`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idProyectoObjetivo` (`idProyectoObjetivo`),
  KEY `idProyectoImpacto` (`idProyectoImpacto`),
  CONSTRAINT `vinculacionproyectosplantrabajo_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosplantrabajo_ibfk_2` FOREIGN KEY (`idProyectoObjetivo`) REFERENCES `vinculacionproyectosobjetivos` (`idProyectoObjetivo`),
  CONSTRAINT `vinculacionproyectosplantrabajo_ibfk_3` FOREIGN KEY (`idProyectoImpacto`) REFERENCES `vinculacionproyectosimpactos` (`idProyectoImpacto`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectospoblaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectospoblaciones` (
  `idProyectosPoblaciones` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `nombre` varchar(500) DEFAULT NULL,
  `direccion` varchar(250) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idProyectosPoblaciones`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectospoblaciones_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectospresupuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectospresupuestos` (
  `idProyectoPresupuesto` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `empresa` varchar(100) DEFAULT NULL,
  `cantidad` decimal(10,2) DEFAULT '0.00',
  `orden` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoPresupuesto`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectospresupuestos_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosprofesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosprofesores` (
  `idProyectoProfesor` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `esDirector` tinyint(4) DEFAULT '0',
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoProfesor`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosprofesores_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosresponsables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosresponsables` (
  `idProyectoResponsable` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idProfesor` varchar(14) DEFAULT NULL,
  `esColaborador` tinyint(4) DEFAULT '0',
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idProyectoResponsable`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosresponsables_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionproyectosresultadosaprendizaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionproyectosresultadosaprendizaje` (
  `idProyectosResultadosAprendizaje` int(11) NOT NULL AUTO_INCREMENT,
  `idProyectoVinculacion` int(11) DEFAULT NULL,
  `idCategoriaResultadoAprendizaje` int(11) DEFAULT NULL,
  `resultado` varchar(5000) DEFAULT NULL,
  `fechaRegistro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idProyectosResultadosAprendizaje`),
  KEY `idProyectoVinculacion` (`idProyectoVinculacion`),
  KEY `idCategoriaResultadoAprendizaje` (`idCategoriaResultadoAprendizaje`),
  CONSTRAINT `vinculacionproyectosresultadosaprendizaje_ibfk_1` FOREIGN KEY (`idProyectoVinculacion`) REFERENCES `vinculacionproyectos` (`idProyectoVinculacion`),
  CONSTRAINT `vinculacionproyectosresultadosaprendizaje_ibfk_2` FOREIGN KEY (`idCategoriaResultadoAprendizaje`) REFERENCES `vinculacioncategoriasresultadosaprendizajes` (`idCategoriaResultadoAprendizaje`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionsubarea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionsubarea` (
  `idSubArea` int(11) NOT NULL AUTO_INCREMENT,
  `idArea` int(11) DEFAULT NULL,
  `subArea` varchar(250) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idSubArea`),
  KEY `idArea` (`idArea`),
  CONSTRAINT `vinculacionsubarea_ibfk_1` FOREIGN KEY (`idArea`) REFERENCES `vinculacionarea` (`idArea`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculacionsubareaespecifica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculacionsubareaespecifica` (
  `idSubAreaEspecifica` int(11) NOT NULL AUTO_INCREMENT,
  `idSubArea` int(11) DEFAULT NULL,
  `subAreaEspecifica` varchar(250) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idSubAreaEspecifica`),
  KEY `idSubArea` (`idSubArea`),
  CONSTRAINT `vinculacionsubareaespecifica_ibfk_1` FOREIGN KEY (`idSubArea`) REFERENCES `vinculacionsubarea` (`idSubArea`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculaciontiposobjetivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculaciontiposobjetivos` (
  `idTipoObjetivo` int(11) NOT NULL AUTO_INCREMENT,
  `tipoObjetivo` varchar(50) DEFAULT NULL,
  `esGeneral` tinyint(4) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idTipoObjetivo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `vinculaciontipospoblaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculaciontipospoblaciones` (
  `idTipoPoblacion` int(11) NOT NULL AUTO_INCREMENT,
  `tipoPoblacion` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`idTipoPoblacion`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- -----------------------------------------------------------------------------
-- 2. CATÁLOGO ACADÉMICO Y CURRICULAR INSTITUCIONAL (REAL)
-- -----------------------------------------------------------------------------
-- Datos para la tabla `carreras`
LOCK TABLES `carreras` WRITE;
/*!40000 ALTER TABLE `carreras` DISABLE KEYS */;
INSERT INTO `carreras` VALUES (1,'GESTIÓN INFORMATICA','2009-10-26',1,'',176,2,60,1,'002648','INF',NULL,0),(2,'GESTION HOTELERA Y TURÍSTICA','2009-10-26',1,'',200,3,60,1,'002650','HTR',NULL,0),(3,'GESTIÓN EMPRESARIAL','2009-10-27',1,'',186,4,60,1,'002649','EMP',NULL,0),(4,'MECÁNICA AUTOMOTRIZ','2008-03-12',0,'',211,5,60,1,'002875','MEC',NULL,0),(5,'ELECTRÓNICA *','2008-03-04',1,'',211,6,60,1,'002876','ELC',NULL,0),(6,'ESCUELA DE CONDUCCION','2013-08-07',1,'',0,1,30,0,'000','CON',1,0),(7,'ENTRENAMIENTO DEPORTIVO','2018-04-18',1,'',0,7,60,1,'551014B-P-01','DEP',1,1),(8,'HOTELERIA','2018-04-18',1,'',0,0,30,1,'551013A-P-01','HOT',NULL,0),(9,'DESARROLLO DE SOFTWARE','2018-04-18',1,'',0,0,30,1,'550613A-P-01','SOF',1,1),(10,'MECANICA AUTOMOTRIZ','2018-04-18',1,'',0,0,50,1,'550715I-P-01','MCA',1,1),(11,'INGLES','2020-01-02',1,'',0,0,45,0,'555','ING',NULL,0),(12,'CONTABILIDAD Y ASESORIA TRIBUTARIA','2023-02-01',1,NULL,NULL,0,30,1,NULL,'CTA',1,1),(13,'ADMINISTRACION DE TALENTO HUMANO','2023-07-01',1,'',0,0,60,1,NULL,'ATH',1,1),(14,'DISEÑO GRAFICO','2023-07-01',1,'',0,0,60,1,NULL,'DGF',1,1),(15,'EDUCACION INICIAL','2023-07-01',1,'',0,0,60,1,NULL,'EBI',1,1),(16,'MARKETING DIGITAL Y COMERCIO ELECTRONICO','2023-07-01',1,'',0,0,60,1,NULL,'MKT',1,1),(17,'EDUCACION INCLUSIVA','2023-08-30',1,'',0,0,60,1,NULL,'EIN',1,1),(18,'EDUCACION BASICA','2023-08-30',1,NULL,NULL,0,60,1,NULL,'EBA',1,1),(19,'GASTRONOMIA','2023-08-30',1,NULL,NULL,0,60,1,NULL,'GAS',1,1),(20,'REDES Y TELECOMUNICACIONES','2023-10-01',1,NULL,60,0,60,1,NULL,'RDT',1,1),(21,'ELECTRÓNICA','2024-01-16',1,NULL,NULL,0,60,1,NULL,'ELT',1,1);
/*!40000 ALTER TABLE `carreras` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `detallemallas`
LOCK TABLES `detallemallas` WRITE;
/*!40000 ALTER TABLE `detallemallas` DISABLE KEYS */;
INSERT INTO `detallemallas` VALUES (1,1,1,1,1,'HUMANISTICO',0,2,32,0,0,0.00),(2,1,2,1,1,'IDIOMA INGLES',0,2,32,0,0,0.00),(3,1,3,1,1,'BASICO',0,4,64,0,0,0.00),(4,1,4,1,1,'BASICO',0,2,32,0,0,0.00),(5,1,5,1,1,'BASICO',0,2,32,0,0,0.00),(6,1,6,1,1,'PROFESIONAL',0,4,64,0,0,0.00),(7,1,7,1,1,'PROFESIONAL',0,6,96,0,0,0.00),(8,1,8,1,1,'PROFESIONAL',0,2,32,0,0,0.00),(9,1,9,1,1,'PROFESIONAL',0,3,48,0,0,0.00),(10,1,10,2,1,'HUMANISTICO',0,2,32,0,0,0.00),(11,1,11,2,1,'I',0,2,32,0,0,0.00),(12,1,12,2,1,'B',0,4,64,0,0,0.00),(13,1,13,2,1,'P',0,3,48,0,0,0.00),(14,1,14,2,1,'P',0,4,64,0,0,0.00),(15,1,15,2,1,'P',0,3,48,0,0,0.00),(16,1,16,2,1,'P',0,3,48,0,0,0.00),(17,1,17,2,1,'P',0,3,48,0,0,0.00),(18,1,18,2,1,'P',0,2,48,0,0,0.00),(19,1,19,3,1,'I',0,2,32,0,0,0.00),(20,1,20,3,1,'B',0,4,64,0,0,0.00),(21,1,21,3,1,'B',0,3,48,0,0,0.00),(22,1,22,3,1,'P',0,5,80,0,0,0.00),(23,1,23,3,1,'P',0,4,64,0,0,0.00),(24,1,24,3,1,'P',0,4,64,0,0,0.00),(25,1,25,3,1,'P',0,3,48,0,0,0.00),(26,1,26,3,1,'PT',0,2,32,0,0,0.00),(30,3,1,8,1,'HUMANISTICA',0,2,32,0,0,0.00),(31,3,2,8,1,'BASICAS',0,2,32,0,0,0.00),(32,3,3,8,1,'BASICAS',0,4,64,0,0,0.00),(33,3,6,8,1,'BASICAS',0,4,64,0,0,0.00),(34,3,27,8,1,'PROFESIONAL',0,3,48,0,0,0.00),(35,3,28,8,1,'PROFESIONAL',0,3,48,0,0,0.00),(47,1,38,4,1,'BASICO',0,2,32,0,0,0.00),(48,1,39,4,1,'BASICO',0,3,48,0,0,0.00),(49,1,40,4,1,'BASICOS',0,3,48,0,0,0.00),(50,1,41,4,1,'BASICO',0,4,64,0,0,0.00),(51,1,43,4,1,'PROFESIONAL',0,2,32,0,0,0.00),(52,1,44,4,1,'PROFESIONAL',0,2,32,0,0,0.00),(53,1,45,4,1,'PROFESIONAL',0,5,80,0,0,0.00),(54,1,46,4,1,'PROFESIONAL',0,3,48,0,0,0.00),(55,1,47,4,1,'PROFESIONAL',0,3,48,0,0,0.00),(56,1,48,4,1,'PROYECTOS Y TESIS',0,2,32,0,0,0.00),(57,1,121,5,1,'HUMANISTICA',0,2,32,0,0,0.00),(58,1,50,5,1,'PROFESIONAL',0,2,32,0,0,0.00),(59,1,51,5,1,'PROFESIONAL',0,4,64,0,0,0.00),(60,1,52,5,1,'PROFESIONAL',0,2,32,0,0,0.00),(61,1,53,5,1,'PROFESIONAL',0,4,64,0,0,0.00),(62,1,54,5,1,'PROFESIONAL',0,3,48,0,0,0.00),(63,1,55,5,1,'PROFESIONAL',0,4,64,0,0,0.00),(64,1,56,5,1,'PROFESIONAL',0,2,32,0,0,0.00),(65,1,137,5,1,'PROFESIONAL',0,3,48,0,0,0.00),(66,1,58,5,1,'PROYECTOS Y TESIS',0,0,0,0,0,0.00),(67,1,59,6,1,'HUMANISTICO',0,2,32,0,0,0.00),(68,1,60,6,1,'PROFESIONAL',0,3,48,0,0,0.00),(69,1,61,6,1,'PROFESIONAL',0,4,64,0,0,0.00),(70,1,80,6,1,'PROFESIONAL',0,3,48,0,0,0.00),(71,1,63,6,1,'PROFESIONAL',0,2,32,0,0,0.00),(72,1,64,6,1,'PROFESIONAL',0,4,64,0,0,0.00),(73,1,65,6,1,'OPCIONAL',0,4,64,0,0,0.00),(74,1,67,6,1,'PROYECTOS Y TESIS',0,0,0,0,0,0.00),(75,3,10,9,1,'HUMANA',0,2,32,0,0,0.00),(76,3,11,9,1,'BASICAS',0,2,32,0,0,0.00),(77,3,12,9,1,'BASICAS',0,4,64,0,0,0.00),(78,3,13,9,1,'BASICAS',0,3,48,0,0,0.00),(79,3,102,9,1,'PROFESIONAL',0,2,32,0,0,0.00),(80,3,103,9,1,'PROFESIONAL',0,2,32,0,0,0.00),(87,2,10,16,1,'HUMANISTICO',0,2,32,0,0,0.00),(88,2,11,16,1,'BASICAS',0,2,32,0,0,0.00),(89,2,12,16,1,'BASICAS',0,4,64,0,0,0.00),(90,2,68,16,1,'BASICAS',0,3,48,0,0,0.00),(91,2,13,16,1,'PROFESIONAL',0,3,48,0,0,0.00),(92,2,69,16,1,'PROFESIONAL',0,3,48,0,0,0.00),(93,2,70,16,1,'PROFESIONAL',0,3,48,0,0,0.00),(94,2,71,16,1,'PROFESIONAL',0,3,48,0,0,0.00),(95,2,72,16,1,'PROFESIONAL',0,2,32,0,0,0.00),(96,2,57,16,1,'OPTATIVAS',0,2,32,0,0,0.00),(108,3,38,13,1,'BASICAS',0,2,32,0,0,0.00),(109,3,109,13,1,'BASICAS',0,3,48,0,0,0.00),(110,3,68,13,1,'BASICAS',0,3,48,0,0,0.00),(111,3,37,13,1,'PROFESIONAL',0,3,48,0,0,0.00),(112,3,116,13,1,'PROFESIONAL',0,3,48,0,0,0.00),(113,3,117,13,1,'PROFESIONAL',0,2,32,0,0,0.00),(114,3,118,13,1,'PROFESIONAL',0,3,48,0,0,0.00),(115,3,119,13,1,'PROFESIONAL',0,2,32,0,0,0.00),(116,3,120,13,1,'PROFESIONAL',0,3,48,0,0,0.00),(117,3,94,13,1,'OPTATIVAS',0,2,32,0,0,0.00),(129,3,95,15,1,'HUMANA',0,2,32,0,0,0.00),(130,3,129,15,1,'BASICAS',0,2,32,0,0,0.00),(131,3,130,15,1,'BASICAS',0,2,32,0,0,0.00),(132,3,71,15,1,'PROFESIONAL',0,3,48,0,0,0.00),(133,3,131,15,1,'PROFESIONAL',0,2,32,0,0,0.00),(141,2,19,17,1,'BASICAS',0,2,32,0,0,0.00),(142,2,20,17,1,'BASICAS',0,4,64,0,0,0.00),(143,2,73,17,1,'BASICAS',0,3,48,0,0,0.00),(144,2,74,17,1,'PROFESIONAL',0,3,48,0,0,0.00),(145,2,76,17,1,'PROFESIONAL',0,3,48,0,0,0.00),(146,2,75,17,1,'PROFESIONAL',0,2,32,0,0,0.00),(147,2,78,17,1,'PROFESIONAL',0,4,64,0,0,0.00),(148,2,79,17,1,'PROFESIONAL',0,2,32,0,0,0.00),(149,2,65,17,1,'OPTATIVAS',0,2,32,0,0,0.00),(150,2,26,17,1,'PROYECTOS',0,2,32,0,0,0.00),(151,2,38,18,1,'BASICAS',0,2,32,0,0,0.00),(152,2,109,18,1,'BASICAS',0,3,48,0,0,0.00),(153,2,39,18,1,'BASICAS',0,3,48,0,0,0.00),(154,2,82,18,1,'PROFESIONAL',0,4,64,0,0,0.00),(155,2,83,18,1,'PROFESIONAL',0,3,48,0,0,0.00),(156,2,84,18,1,'PROFESIONAL',0,2,32,0,0,0.00),(157,2,85,18,1,'PROFESIONAL',0,2,32,0,0,0.00),(158,2,86,18,1,'PROFESIONAL',0,3,48,0,0,0.00),(159,2,48,18,1,'PROYECTOS',0,2,32,0,0,0.00),(160,2,87,19,1,'HUMANISTICO',0,2,32,0,0,0.00),(161,2,88,19,1,'PROFESIONAL',0,4,64,0,0,0.00),(162,2,89,19,1,'PROFESIONAL',0,3,48,0,0,0.00),(163,2,90,19,1,'PROFESIONAL',0,4,64,0,0,0.00),(164,2,91,19,1,'PROFESIONAL',0,3,48,0,0,0.00),(165,2,92,19,1,'PROFESIONAL',0,3,48,0,0,0.00),(166,2,93,19,1,'PROFESIONAL',0,3,48,0,0,0.00),(167,2,94,19,1,'OPTATIVAS',0,2,32,0,0,0.00),(168,2,58,19,1,'PROYECTO TESIS',0,0,0,0,0,0.00),(169,2,95,20,1,'HUMANISTICA',0,2,32,0,0,0.00),(170,2,96,20,1,'PROFESIONAL',0,3,48,0,0,0.00),(171,2,97,20,1,'PROFESIONAL',0,2,32,0,0,0.00),(172,2,98,20,1,'PROFESIONAL',0,3,48,0,0,0.00),(173,2,99,20,1,'PROFESIONAL',0,4,64,0,0,0.00),(174,2,100,20,1,'PROFESIONAL',0,2,32,0,0,0.00),(175,2,101,20,1,'PROFESIONAL',0,3,48,0,0,0.00),(176,2,143,20,1,'OPTATIVAS',0,3,48,0,0,0.00),(178,2,67,20,1,'PROYECTOS TESIS',0,0,0,0,0,0.00),(183,3,146,13,1,'PROYECTOS Y TESIS',0,2,32,0,0,0.00),(184,3,121,14,1,'HUMANA',0,2,32,0,0,0.00),(185,3,122,14,1,'BASICAS',0,2,32,0,0,0.00),(186,3,78,14,1,'PROFESIONAL',0,3,48,0,0,0.00),(187,3,123,14,1,'PROFESIONAL',0,3,48,0,0,0.00),(188,3,124,14,1,'PROFESIONAL',0,3,48,0,0,0.00),(189,3,125,14,1,'PROFESIONAL',0,3,48,0,0,0.00),(190,3,126,14,1,'PROFESIONAL',0,2,32,0,0,0.00),(191,3,127,14,1,'PROFESIONAL',0,3,48,0,0,0.00),(192,3,128,14,1,'PROFESIONAL',0,3,48,0,0,0.00),(193,3,143,14,1,'OPTATIVAS',0,2,32,0,0,0.00),(194,3,58,14,1,'PROYECTOS Y TESIS',0,0,32,0,0,0.00),(195,3,132,15,1,'PROFESIONAL',0,2,32,0,0,0.00),(196,3,133,15,1,'PROFESIONAL',0,3,48,0,0,0.00),(197,3,134,15,1,'PROFESIONAL',0,2,32,0,0,0.00),(198,3,135,15,1,'PROFESIONAL',0,3,48,0,0,0.00),(199,3,136,15,1,'PROFESIONAL',0,3,48,0,0,0.00),(201,3,67,15,1,'PROYECTOS Y TESIS',0,0,32,0,0,0.00),(202,2,1,7,1,'HUMANISTICA',0,2,32,0,0,0.00),(203,2,2,7,1,'BASICAS',0,2,32,0,0,0.00),(204,2,3,7,1,'BASICAS',0,4,64,0,0,0.00),(205,2,33,7,1,'BASICAS',0,2,32,0,0,0.00),(206,2,6,7,1,'PROFESIONAL',0,4,64,0,0,0.00),(207,2,34,7,1,'PROFESIONAL',0,3,48,0,0,0.00),(208,2,35,7,1,'PROFESIONAL',0,3,48,0,0,0.00),(209,2,115,7,1,'PROFESIONAL',0,3,48,0,0,0.00),(210,2,144,7,1,'OPTATIVAS',0,4,64,0,0,0.00),(211,3,29,8,1,'PROFESIONAL',0,3,48,0,0,0.00),(212,3,30,8,1,'PROFESIONALES',0,3,48,0,0,0.00),(213,3,144,8,1,'OPTATIVAS',0,2,32,0,0,0.00),(214,3,32,8,1,'PROYECTOS Y TESIS',0,2,32,0,0,0.00),(215,3,139,9,1,'PROFESIONAL',0,3,48,0,0,0.00),(216,3,140,9,1,'PROFESIONAL',0,3,48,0,0,0.00),(217,3,141,9,1,'PROFESIONAL',0,2,32,0,0,0.00),(218,3,142,9,1,'PROFESIONAL',0,2,32,0,0,0.00),(219,3,57,9,1,'OPTATIVAS',0,2,32,0,0,0.00),(220,3,145,9,1,'PROYECTOS Y TESIS',0,2,32,0,0,0.00),(221,3,19,12,1,'BASICAS',0,2,32,0,0,0.00),(222,3,110,12,1,'PROFESIONALES',0,2,32,0,0,0.00),(223,3,111,12,1,'PROFESIONALES',0,3,48,0,0,0.00),(224,3,112,12,1,'PROFESIONALES',0,2,32,0,0,0.00),(225,3,113,12,1,'PROFESIONALES',0,3,48,0,0,0.00),(226,3,105,12,1,'PROFESIONALES',0,3,48,0,0,0.00),(227,3,106,12,1,'PROFESIONALES',0,3,48,0,0,0.00),(228,3,107,12,1,'PROFESIONALES',0,2,32,0,0,0.00),(229,3,108,12,1,'PROFESIONALES',0,3,48,0,0,0.00),(232,3,65,12,1,'OPTATIVAS',0,2,32,0,0,0.00),(233,3,147,12,1,'PROYECTOS Y TESIS',0,2,32,0,0,0.00),(240,5,1,21,1,'HUMANO',0,2,32,0,0,0.00),(241,5,148,21,1,'BASICO',0,2,32,0,0,0.00),(242,5,2,21,1,'BASICO',0,2,32,0,0,0.00),(243,5,149,21,1,'BASICO',0,2,32,0,0,0.00),(244,5,213,21,1,'BASICO',0,2,32,0,0,0.00),(245,5,5,21,1,'BASICO',0,2,32,0,0,0.00),(246,5,4,21,1,'BASICO',0,2,32,0,0,0.00),(247,5,151,21,1,'PROFESIONAL',0,2,32,0,0,0.00),(248,5,152,21,1,'PROFESIONAL',0,3,48,0,0,0.00),(249,5,153,21,1,'PROFESIONAL',0,3,48,0,0,0.00),(250,5,154,21,1,'PROFESIONAL',0,2,32,0,0,0.00),(251,5,155,21,1,'PROFESIONAL',0,3,48,0,0,0.00),(252,5,156,21,1,'PROFESIONAL',0,2,32,0,0,0.00),(265,5,10,24,1,'HUMANA',0,2,32,0,0,0.00),(266,5,157,24,1,'BASICA',0,2,32,0,0,0.00),(267,5,11,24,1,'BASICA',0,2,32,0,0,0.00),(268,5,215,24,1,'BASICA',0,2,32,0,0,0.00),(269,5,158,24,1,'BASICA',0,2,32,0,0,0.00),(270,5,159,24,1,'BASICA',0,2,32,0,0,0.00),(271,5,225,24,1,'BASICA',0,3,48,0,0,0.00),(272,5,216,24,1,'BASICA',0,2,32,0,0,0.00),(273,5,160,24,1,'PROFESIONAL',0,2,32,0,0,0.00),(274,5,161,24,1,'PROFESIONAL',0,3,48,0,0,0.00),(275,5,162,24,1,'PROFESIONAL',0,2,32,0,0,0.00),(276,5,163,24,1,'PROFESIONAL',0,3,48,0,0,0.00),(277,5,164,24,1,'PROFESIONAL',0,3,48,0,0,0.00),(278,5,218,25,1,'HUMANA',0,2,32,0,0,0.00),(279,5,165,25,1,'BASICA',0,2,32,0,0,0.00),(280,5,19,25,1,'BASICA',0,2,32,0,0,0.00),(282,5,226,25,1,'BASICO',0,3,48,0,0,0.00),(283,5,217,25,1,'BASICO',0,2,32,0,0,0.00),(284,5,166,25,1,'BASICO',0,2,32,0,0,0.00),(285,5,167,25,1,'PROFESIONAL',0,3,48,0,0,0.00),(286,5,168,25,1,'PROFESIONAL',0,3,48,0,0,0.00),(287,5,169,25,1,'PROFESIONAL',0,2,32,0,0,0.00),(288,5,170,25,1,'PROFESIONAL',0,4,64,0,0,0.00),(289,5,171,26,1,'HUMANA',0,2,32,0,0,0.00),(290,5,172,26,1,'BASICA',0,2,32,0,0,0.00),(291,5,38,26,1,'BASICA',0,2,32,0,0,0.00),(292,5,173,26,1,'BASICA',0,3,48,0,0,0.00),(293,5,174,26,1,'BASICA',0,3,48,0,0,0.00),(294,5,227,26,1,'BASICA',0,3,48,0,0,0.00),(295,5,175,26,1,'PROFESIONAL',0,3,48,0,0,0.00),(296,5,176,26,1,'PROFESIONAL',0,4,64,0,0,0.00),(297,5,177,26,1,'PROFESIONAL',0,2,32,0,0,0.00),(298,5,178,26,1,'PROFESIONAL',0,3,48,0,0,0.00),(299,5,179,26,1,'PROFESIONAL',0,3,48,0,0,0.00),(300,5,180,27,1,'HUMANA',0,2,32,0,0,0.00),(301,5,41,27,1,'BASICA',0,3,48,0,0,0.00),(302,5,182,27,1,'PROFESIONAL',0,2,32,0,0,0.00),(303,5,183,27,1,'PROFESIONAL',0,4,64,0,0,0.00),(304,5,184,27,1,'PROFESIONAL',0,4,64,0,0,0.00),(305,5,185,27,1,'PROFESIONAL',0,4,64,0,0,0.00),(306,5,186,27,1,'PROFESIONAL',0,3,48,0,0,0.00),(307,5,187,27,1,'PROFESIONAL',0,4,64,0,0,0.00),(308,5,144,27,1,'OPTATIVA',0,2,32,0,0,0.00),(309,5,58,27,1,'PROYECTOS Y TESIS',0,0,0,0,0,0.00),(310,5,188,28,1,'PROFESIONAL',0,5,80,0,0,0.00),(311,5,189,28,1,'PROFESIONAL',0,4,64,0,0,0.00),(312,5,190,28,1,'PROFESIONAL',0,4,64,0,0,0.00),(313,5,191,28,1,'PROFESIONAL',0,4,64,0,0,0.00),(314,5,192,28,1,'PROFESIONAL',0,5,80,0,0,0.00),(315,5,57,28,1,'OPTATIVA',0,4,64,0,0,0.00),(317,5,67,28,1,'PROYECTOS Y TESIS',0,0,0,0,0,0.00),(318,8,1,29,1,'HUMANA',0,2,32,0,0,0.00),(319,8,148,29,1,'BASICA',0,2,32,0,0,0.00),(320,8,2,29,1,'BASICA',0,2,32,0,0,0.00),(321,8,149,29,1,'BASICA',0,2,32,0,0,0.00),(322,8,213,29,1,'BASICA',0,2,32,0,0,0.00),(323,8,150,29,1,'BASICA',0,2,32,0,0,0.00),(324,8,4,29,1,'BASICA',0,2,32,0,0,0.00),(325,8,151,29,1,'PROFESIONAL',0,2,32,0,0,0.00),(326,8,152,29,1,'PROFESIONAL',0,3,48,0,0,0.00),(327,8,153,29,1,'PROFESIONAL',0,3,48,0,0,0.00),(328,8,193,29,1,'PROFESIONAL',0,3,48,0,0,0.00),(329,8,156,29,1,'PROFESIONAL',0,2,32,0,0,0.00),(330,8,154,29,1,'PROFESIONAL',0,2,32,0,0,0.00),(331,8,10,30,1,'HUMANA',0,2,32,0,0,0.00),(332,8,157,30,1,'BASICA',0,2,32,0,0,0.00),(333,8,11,30,1,'BASICA',0,2,32,0,0,0.00),(334,8,215,30,1,'BASICA',0,2,32,0,0,0.00),(335,8,158,30,1,'BASICA',0,2,32,0,0,0.00),(336,8,159,30,1,'BASICA',0,2,32,0,0,0.00),(337,8,225,30,1,'BASICA',0,3,48,0,0,0.00),(338,8,216,30,1,'BASICA',0,2,32,0,0,0.00),(339,8,161,30,1,'PROFESIONAL',0,3,48,0,0,0.00),(340,8,162,30,1,'PROFESIONAL',0,2,32,0,0,0.00),(341,8,163,30,1,'PROFESIONAL',0,3,48,0,0,0.00),(342,8,228,30,1,'PROFESIONAL',0,3,48,0,0,0.00),(343,8,194,30,1,'PROFESIONAL',0,2,32,0,0,0.00),(344,8,218,31,1,'HUMANA',0,2,32,0,0,0.00),(345,8,165,31,1,'BASICA',0,2,32,0,0,0.00),(346,8,19,31,1,'BASICA',0,2,32,0,0,0.00),(347,8,219,31,1,'BASICA',0,5,80,0,0,0.00),(348,8,226,31,1,'BASICA',0,3,48,0,0,0.00),(349,8,217,31,1,'BASICA',0,2,32,0,0,0.00),(350,8,195,31,1,'PROFESIONAL',0,4,64,0,0,0.00),(351,8,196,31,1,'PROFESIONAL',0,3,48,0,0,0.00),(352,8,169,31,1,'PROFESIONAL',0,2,32,0,0,0.00),(353,8,197,31,1,'PROFESIONAL',0,3,48,0,0,0.00),(354,8,144,31,1,'OPTATIVA',0,2,32,0,0,0.00),(355,8,171,32,1,'HUMANA',0,2,32,0,0,0.00),(356,8,172,32,1,'BASICA',0,2,32,0,0,0.00),(357,8,38,32,1,'BASICA',0,2,32,0,0,0.00),(358,8,173,32,1,'BASICA',0,3,48,0,0,0.00),(359,8,174,32,1,'BASICA',0,3,48,0,0,0.00),(360,8,227,32,1,'BASICA',0,3,48,0,0,0.00),(363,8,220,32,1,'PROFESIONAL',0,3,48,0,0,0.00),(364,8,221,32,1,'PROFESIONAL',0,4,64,0,0,0.00),(365,8,177,32,1,'PROFESIONAL',0,2,32,0,0,0.00),(366,8,222,32,1,'PROFESIONAL',0,3,48,0,0,0.00),(367,8,223,32,1,'PROFESIONAL',0,3,48,0,0,0.00),(368,8,59,33,1,'HUMANA',0,2,32,0,0,0.00),(369,8,198,33,1,'BASICA',0,3,48,0,0,0.00),(370,8,199,33,1,'PROFESIONAL',0,3,48,0,0,0.00),(371,8,200,33,1,'PROFESIONAL',0,3,48,0,0,0.00),(372,8,201,33,1,'PROFESIONAL',0,2,32,0,0,0.00),(373,8,202,33,1,'PROFESIONAL',0,4,64,0,0,0.00),(375,8,224,33,1,'PROFESIONAL',0,4,64,0,0,0.00),(376,8,204,33,1,'PROFESIONAL',0,2,32,0,0,0.00),(377,8,205,33,1,'PROFESIONAL',0,3,48,0,0,0.00),(378,8,57,33,1,'OPTATIVAS',0,2,32,0,0,0.00),(379,8,58,33,1,'PROYECTOS Y TESIS',0,0,0,0,0,0.00),(380,8,206,34,1,'PROFESIONAL',0,3,48,0,0,0.00),(381,8,207,34,1,'PROFESIONAL',0,2,32,0,0,0.00),(382,8,208,34,1,'PROFESIONAL',0,4,64,0,0,0.00),(383,8,209,34,1,'PROFESIONAL',0,4,64,0,0,0.00),(384,8,56,34,1,'PROFESIONAL',0,4,64,0,0,0.00),(385,8,211,34,1,'PROFESIONAL',0,3,48,0,0,0.00),(386,8,229,34,1,'OPTATIVA',0,4,64,0,0,0.00),(387,8,66,34,1,'LIBRE OPCION',0,2,32,0,0,0.00),(388,8,67,34,1,'PROYECTOS Y TESIS',0,0,0,0,0,0.00),(389,5,219,25,1,'BASICA',0,5,80,0,0,0.00),(390,9,230,35,1,'NORMAL',0,4,64,0,0,0.00),(391,9,231,35,1,'NORMAL',0,4,64,0,0,0.00),(392,9,232,35,1,'NORMAL',0,3,48,0,0,0.00),(393,9,233,35,1,'NORMAL',0,3,48,0,0,0.00),(394,9,234,35,1,'NORMAL',0,2,32,0,0,0.00),(395,9,235,35,1,'NORMAL',0,2,32,0,0,0.00),(396,9,236,35,1,'NORMAL',0,2,32,0,0,0.00),(397,9,237,35,1,'NORMAL',0,1,16,0,0,0.00),(398,9,238,35,1,'NORMAL',0,1,16,0,0,0.00),(399,9,33,35,1,'NORMAL',0,2,32,0,0,0.00),(400,9,239,35,1,'NORMAL',0,2,32,0,0,0.00),(401,9,240,35,1,'NORMAL',0,2,32,0,0,0.00),(402,10,10,2,1,'O',0,2,32,0,0,0.00),(403,10,11,2,1,'O',0,2,32,0,0,0.00),(404,10,12,2,1,'O',0,4,64,0,0,0.00),(405,10,9,2,1,'O',0,3,48,0,0,0.00),(406,10,14,2,1,'O',0,5,80,0,0,0.00),(407,10,56,2,1,'O',0,3,48,0,0,0.00),(408,10,16,2,1,'O',0,3,48,0,0,0.00),(409,10,17,2,1,'O',0,3,48,0,0,0.00),(410,11,10,24,1,'O',0,2,32,0,0,0.00),(411,11,11,24,1,'O',0,2,32,0,0,0.00),(412,11,158,24,1,'O',0,2,32,0,0,0.00),(413,11,225,24,1,'O',0,2,32,0,0,0.00),(414,11,244,24,1,'O',0,4,64,0,0,0.00),(415,11,215,24,1,'O',0,2,32,0,0,0.00),(416,11,243,24,1,'O',0,2,32,0,0,0.00),(417,11,242,24,1,'O',0,3,48,0,0,0.00),(418,11,163,24,1,'O',0,3,48,0,0,0.00),(419,11,164,24,1,'O',0,3,48,0,0,0.00),(420,10,1,1,1,'HUMANISTICO',0,2,32,0,0,0.00),(421,10,2,1,1,'BASICO',0,3,48,0,0,0.00),(422,10,245,1,1,'BASICO',0,5,80,0,0,0.00),(423,10,4,1,1,'BASICO',0,3,48,0,0,0.00),(424,10,246,1,1,'PROFESIONAL',0,3,48,0,0,0.00),(425,10,7,1,1,'PROFESIONAL',0,4,64,0,0,0.00),(426,10,8,1,1,'PROFESIONAL',0,2,32,0,0,0.00),(427,10,247,1,1,'PROFESIONAL',0,3,48,0,0,0.00),(428,11,1,21,1,'HUMANA',0,2,32,0,0,0.00),(429,11,2,21,1,'BASICA',0,2,32,0,0,0.00),(430,11,149,21,1,'BASICA',0,3,48,0,0,0.00),(431,11,248,21,1,'BASICA',0,3,48,0,0,0.00),(432,11,148,21,1,'BASICA',0,3,48,0,0,0.00),(433,11,213,21,1,'BASICA',0,2,32,0,0,0.00),(434,11,152,21,1,'PROFESIONAL',0,3,48,0,0,0.00),(435,11,249,21,1,'PROFESIONAL',0,2,32,0,0,0.00),(436,11,155,21,1,'PROFESIONAL',0,3,48,0,0,0.00),(437,11,156,21,1,'PROFESIONAL',0,2,32,0,0,0.00),(438,10,19,3,1,'BASICO',0,3,48,0,0,0.00),(439,10,20,3,1,'BASICO',0,5,80,0,0,0.00),(440,10,22,3,1,'PROFESIONAL',0,4,64,0,0,0.00),(441,10,23,3,1,'PROFESIONAL',0,4,64,0,0,0.00),(442,10,25,3,1,'PROFESIONAL',0,3,48,0,0,0.00),(443,10,271,3,1,'PROFESIONAL',0,6,96,0,0,0.00),(444,10,44,4,1,'PROFESIONAL',0,3,48,0,0,0.00),(445,10,45,4,1,'PROFESIONAL',0,6,96,0,0,0.00),(446,10,46,4,1,'PROFESIONAL',0,3,48,0,0,0.00),(447,10,47,4,1,'PROFESIONAL',0,8,128,0,0,0.00),(448,10,53,4,1,'PROFESIONAL',0,5,80,0,0,0.00),(449,10,253,5,1,'PROFESIONAL',0,2,32,0,0,0.00),(450,10,51,5,1,'PROFESIONAL',0,4,64,0,0,0.00),(451,10,52,5,1,'PROFESIONAL',0,2,32,0,0,0.00),(452,10,252,5,1,'PROFESIONAL',0,4,64,0,0,0.00),(453,10,54,5,1,'PROFESIONAL',0,5,80,0,0,0.00),(454,10,55,5,1,'PROFESIONAL',0,4,64,0,0,0.00),(455,10,144,5,1,'OPTATIVA',0,2,32,0,0,0.00),(456,10,254,6,1,'P',0,3,48,0,0,0.00),(457,10,61,6,1,'P',0,4,64,0,0,0.00),(458,10,255,6,1,'P',0,5,80,0,0,0.00),(459,10,64,6,1,'P',0,6,96,0,0,0.00),(460,10,57,6,1,'O',0,2,32,0,0,0.00),(461,11,218,25,1,'H',0,2,32,0,0,0.00),(462,11,19,25,1,'B',0,2,32,0,0,0.00),(463,11,20,25,1,'B',0,4,64,0,0,0.00),(464,11,226,25,1,'B',0,3,48,0,0,0.00),(465,11,166,25,1,'B',0,2,32,0,0,0.00),(466,11,167,25,1,'P',0,3,48,0,0,0.00),(467,11,168,25,1,'P',0,4,64,0,0,0.00),(468,11,169,25,1,'P',0,2,32,0,0,0.00),(469,11,170,25,1,'P',0,3,48,0,0,0.00),(470,11,173,26,1,'B',0,3,48,0,0,0.00),(471,11,40,26,1,'B',0,3,48,0,0,0.00),(472,11,227,26,1,'B',0,3,48,0,0,0.00),(473,11,175,26,1,'P',0,3,48,0,0,0.00),(474,11,176,26,1,'P',0,4,64,0,0,0.00),(475,11,177,26,1,'P',0,2,32,0,0,0.00),(476,11,178,26,1,'P',0,3,48,0,0,0.00),(477,11,179,26,1,'P',0,4,64,0,0,0.00),(478,11,41,27,1,'B',0,2,32,0,0,0.00),(479,11,182,27,1,'P',0,3,48,0,0,0.00),(480,11,183,27,1,'P',0,3,48,0,0,0.00),(481,11,184,27,1,'P',0,3,48,0,0,0.00),(482,11,185,27,1,'P',0,5,80,0,0,0.00),(483,11,186,27,1,'P',0,4,64,0,0,0.00),(484,11,187,27,1,'P',0,3,48,0,0,0.00),(485,11,144,27,1,'P',0,2,32,0,0,0.00),(486,11,188,28,1,'P',0,4,64,0,0,0.00),(487,11,189,28,1,'P',0,4,64,0,0,0.00),(488,11,190,28,1,'P',0,3,48,0,0,0.00),(489,11,191,28,1,'P',0,3,64,0,0,0.00),(490,11,192,28,1,'P',0,3,48,0,0,0.00),(491,11,57,28,1,'O',0,4,64,0,0,0.00),(492,9,230,36,1,'O',0,4,64,0,0,0.00),(493,9,231,36,1,'O',0,4,64,0,0,0.00),(494,9,232,36,1,'0',0,3,48,0,0,0.00),(495,9,234,36,1,'O',0,2,32,0,0,0.00),(496,9,235,36,1,'0',0,2,32,0,0,0.00),(497,9,236,36,1,'O',0,2,32,0,0,0.00),(498,9,237,36,1,'1',0,1,16,0,0,0.00),(499,9,238,36,1,'O',0,1,16,0,0,0.00),(500,9,33,36,1,'O',0,2,32,0,0,0.00),(501,9,240,36,1,'O',0,3,48,0,0,0.00),(502,9,233,36,1,'O',0,3,48,0,0,0.00),(503,9,256,36,1,'O',0,3,48,0,0,0.00),(504,9,257,36,1,'0',0,3,48,0,0,0.00),(505,10,87,5,1,'HUMANISTICA',0,2,32,0,0,0.00),(506,12,230,35,1,'O',0,3,60,0,0,0.00),(507,12,231,35,1,'O',0,2,40,0,0,0.00),(508,12,232,35,1,'O',0,2,40,0,0,0.00),(509,12,233,35,1,'O',0,2,40,0,0,0.00),(510,12,238,35,1,'O',0,1,20,0,0,0.00),(511,12,237,35,1,'O',0,1,20,0,0,0.00),(512,12,258,35,1,'O',0,2,40,0,0,0.00),(513,12,259,35,1,'O',0,1,20,0,0,0.00),(514,12,239,35,1,'O',0,2,40,0,0,0.00),(515,12,240,35,1,'0',0,2,40,0,0,0.00),(516,12,260,35,1,'0',0,2,40,0,0,0.00),(517,12,262,35,1,'0',0,2,40,0,0,0.00),(518,12,230,36,1,'O',0,3,60,0,0,0.00),(519,12,231,36,1,'O',0,2,40,0,0,0.00),(520,12,232,36,1,'O',0,2,40,0,0,0.00),(521,12,233,36,1,'O',0,2,40,0,0,0.00),(522,12,238,36,1,'O',0,1,20,0,0,0.00),(523,12,237,36,1,'O',0,1,20,0,0,0.00),(524,12,258,36,1,'O',0,2,40,0,0,0.00),(525,12,259,36,1,'O',0,1,20,0,0,0.00),(526,12,239,36,1,'O',0,2,40,0,0,0.00),(527,12,240,36,1,'0',0,2,40,0,0,0.00),(533,12,256,36,1,'0',0,2,40,0,0,0.00),(534,12,264,36,1,'0',0,2,40,0,0,0.00),(535,10,59,6,1,'P',0,2,32,0,0,0.00),(536,12,261,36,1,'0',0,2,40,0,0,0.00),(537,12,231,37,1,'O',0,2,40,0,0,0.00),(538,12,230,37,1,'O',0,3,60,0,0,0.00),(539,12,232,37,1,'0',0,2,40,0,0,0.00),(540,12,233,37,1,'O',0,2,40,0,0,0.00),(541,12,238,37,1,'O',0,1,20,0,0,0.00),(542,12,237,37,1,'O',0,1,20,0,0,0.00),(543,12,258,37,1,'0',0,2,40,0,0,0.00),(544,12,259,37,1,'0',0,1,20,0,0,0.00),(545,12,2,37,1,'0',0,2,40,0,0,0.00),(546,12,240,37,1,'0',0,4,80,0,0,0.00),(547,12,265,37,1,'O',0,2,40,0,0,0.00),(548,12,266,37,1,'O',0,2,40,0,0,0.00),(549,12,267,37,1,'0',0,2,40,0,0,0.00),(550,12,268,37,1,'0',0,2,40,0,0,0.00),(551,12,269,37,1,'0',0,2,40,0,0,0.00),(552,12,270,37,1,'0',0,2,40,0,0,0.00),(553,12,263,36,1,NULL,0,2,40,0,0,0.00),(554,10,58,6,1,'O',0,3,48,0,0,0.00),(555,11,58,28,1,'O',0,4,64,0,0,0.00),(556,13,1,8,1,'O',0,2,32,0,0,0.00),(557,13,2,8,1,'O',0,3,48,0,0,0.00),(558,13,245,8,1,'O',0,5,80,0,0,0.00),(559,13,246,8,1,'O',0,3,48,0,0,0.00),(560,13,29,8,1,'O',0,3,48,0,0,0.00),(561,13,30,8,1,'O',0,2,32,0,0,0.00),(562,13,32,8,1,'O',0,2,32,0,0,0.00),(563,13,250,8,1,'O',0,3,48,0,0,0.00),(564,13,272,8,1,'O',0,2,32,0,0,0.00),(565,13,273,9,1,'O',0,2,32,0,0,0.00),(566,13,11,9,1,'O',0,2,32,0,0,0.00),(567,13,80,9,1,'O',0,4,64,0,0,0.00),(568,13,102,9,1,'O',0,2,32,0,0,0.00),(569,13,103,9,1,'O',0,4,64,0,0,0.00),(570,13,139,9,1,'O',0,3,48,0,0,0.00),(571,13,275,9,1,'O',0,4,64,0,0,0.00),(572,13,141,9,1,'O',0,2,32,0,0,0.00),(573,13,145,9,1,'O',0,2,32,0,0,0.00),(574,12,230,38,1,'O',0,3,60,0,0,0.00),(575,12,231,38,1,'O',0,2,40,0,0,0.00),(576,12,232,38,1,'O',0,2,40,0,0,0.00),(577,12,233,38,1,'O',0,2,40,0,0,0.00),(578,12,238,38,1,'O',0,1,20,0,0,0.00),(579,12,237,38,1,'O',0,1,20,0,0,0.00),(580,12,258,38,1,'O',0,2,40,0,0,0.00),(581,12,259,38,1,'O',0,1,20,0,0,0.00),(582,12,239,38,1,'O',0,2,40,0,0,0.00),(583,12,240,38,1,'0',0,2,40,0,0,0.00),(584,12,256,38,1,'0',0,2,40,0,0,0.00),(585,12,264,38,1,'0',0,2,40,0,0,0.00),(586,12,261,38,1,'0',0,2,40,0,0,0.00),(587,12,263,38,1,NULL,0,2,40,0,0,0.00),(588,12,231,39,1,'O',0,2,40,0,0,0.00),(589,12,230,39,1,'O',0,3,60,0,0,0.00),(590,12,232,39,1,'0',0,2,40,0,0,0.00),(591,12,233,39,1,'O',0,2,40,0,0,0.00),(592,12,238,39,1,'O',0,1,20,0,0,0.00),(593,12,237,39,1,'O',0,1,20,0,0,0.00),(594,12,258,39,1,'0',0,2,40,0,0,0.00),(595,12,259,39,1,'0',0,1,20,0,0,0.00),(596,12,2,39,1,'0',0,2,40,0,0,0.00),(597,12,240,39,1,'0',0,4,80,0,0,0.00),(598,12,265,39,1,'O',0,2,40,0,0,0.00),(599,12,266,39,1,'O',0,2,40,0,0,0.00),(600,12,267,39,1,'0',0,2,40,0,0,0.00),(601,12,268,39,1,'0',0,2,40,0,0,0.00),(602,12,269,39,1,'0',0,2,40,0,0,0.00),(603,12,270,39,1,'0',0,2,40,0,0,0.00),(604,13,19,12,1,'O',0,3,48,0,0,0.00),(605,13,110,12,1,NULL,0,2,32,0,0,0.00),(606,13,111,12,1,NULL,0,2,32,0,0,0.00),(607,13,112,12,1,NULL,0,4,64,0,0,0.00),(608,13,113,12,1,NULL,0,3,48,0,0,0.00),(609,13,105,12,1,NULL,0,4,64,0,0,0.00),(610,13,106,12,1,NULL,0,3,48,0,0,0.00),(611,13,107,12,1,NULL,0,2,32,0,0,0.00),(612,13,147,12,1,NULL,0,2,32,0,0,0.00),(613,13,37,13,1,'O',0,2,32,0,0,0.00),(614,13,116,13,1,'O',0,4,64,0,0,0.00),(615,13,117,13,1,'O',0,6,96,0,0,0.00),(616,13,118,13,1,'O',0,3,48,0,0,0.00),(617,13,126,13,1,'O',0,2,32,0,0,0.00),(618,13,119,13,1,'O',0,2,32,0,0,0.00),(619,13,108,13,1,'O',0,4,64,0,0,0.00),(620,13,146,13,1,'O',0,2,32,0,0,0.00),(621,13,124,14,1,'O',0,3,48,0,0,0.00),(622,13,123,14,1,'O',0,3,48,0,0,0.00),(623,13,127,14,1,'O',0,3,48,0,0,0.00),(624,13,125,14,1,'O',0,3,48,0,0,0.00),(625,13,253,14,1,'O',0,2,32,0,0,0.00),(626,13,134,14,1,'O',0,2,32,0,0,0.00),(627,13,78,14,1,'O',0,3,48,0,0,0.00),(628,13,87,14,1,'O',0,2,32,0,0,0.00),(629,13,276,14,1,'O',0,4,64,0,0,0.00),(630,13,132,15,1,'O',0,3,48,0,0,0.00),(631,13,131,15,1,'O',0,4,64,0,0,0.00),(632,13,133,15,1,'O',0,4,64,0,0,0.00),(633,13,95,15,1,'O',0,2,32,0,0,0.00),(634,13,135,15,1,'O',0,3,48,0,0,0.00),(635,13,71,15,1,'O',0,3,48,0,0,0.00),(636,13,136,15,1,'O',0,3,48,0,0,0.00),(637,13,67,15,1,'O',0,3,48,0,0,0.00),(638,14,277,40,1,'O',0,3,16,0,0,0.00),(639,14,250,40,1,'0',0,3,16,0,0,0.00),(640,14,1,40,1,'0',0,3,16,0,0,0.00),(641,14,278,40,1,'0',0,4,16,0,0,0.00),(642,14,279,40,1,'0',0,3,16,0,0,0.00),(643,14,280,40,1,'0',0,3,16,0,0,0.00),(644,15,304,45,1,'0',0,1,16,0,0,0.00),(645,15,305,45,1,'0',0,1,16,0,0,0.00),(646,15,306,45,1,'0',0,1,16,0,0,0.00),(647,15,275,45,1,'0',0,1,16,0,0,0.00),(648,15,1,45,1,'0',0,1,16,0,0,0.00),(649,15,250,45,1,'0',0,1,16,0,0,0.00),(650,16,304,50,1,'0',0,4,16,0,0,0.00),(651,16,307,50,1,'0',0,2,16,0,0,0.00),(652,16,308,50,1,'0',0,3,16,0,0,0.00),(653,16,1,50,1,'0',0,2,16,0,0,0.00),(654,16,250,50,1,'0',0,4,16,0,0,0.00),(655,16,309,50,1,'0',0,5,16,0,0,0.00),(656,17,155,55,1,'0',0,3,16,0,0,0.00),(657,17,310,55,1,'0',0,2,16,0,0,0.00),(658,17,304,55,1,'0',0,4,16,0,0,0.00),(659,17,4,55,1,'0',0,3,16,0,0,0.00),(660,17,1,55,1,'0',0,2,16,0,0,0.00),(661,17,247,55,1,'0',0,4,16,0,0,0.00),(662,14,281,41,1,'0',1,3,56,0,0,0.00),(663,14,282,41,1,'0',1,3,54,0,0,0.00),(664,14,283,41,1,'0',0,3,54,0,0,0.00),(665,14,284,41,1,'0',0,4,72,0,0,0.00),(666,14,285,41,1,'0',0,3,54,0,0,0.00),(667,17,311,56,1,'0',0,2,36,0,0,0.00),(668,17,244,56,1,'0',0,3,54,0,0,0.00),(669,17,242,56,1,'0',0,4,72,0,0,0.00),(670,17,312,56,1,'0',0,3,54,0,0,0.00),(672,17,313,56,1,'0',0,3,54,0,0,0.00),(673,16,314,51,1,'0',0,3,54,0,0,0.00),(674,16,253,51,1,'0',0,2,36,0,0,0.00),(675,16,53,51,1,'0',0,4,54,0,0,0.00),(676,16,315,51,1,'0',0,3,54,0,0,0.00),(677,16,24,51,1,'0',0,5,72,0,0,0.00),(678,16,316,51,1,'0',0,3,54,0,0,0.00),(679,16,317,51,1,'0',0,2,36,0,0,0.00),(680,15,318,46,1,'0',0,1,54,0,0,0.00),(682,15,319,46,1,'0',0,1,72,0,0,0.00),(683,15,320,46,1,'0',0,1,54,0,0,0.00),(684,15,321,46,1,'0',0,1,72,0,0,0.00),(685,15,322,46,1,'0',0,1,36,0,0,0.00),(686,15,323,46,1,'0',0,1,36,0,0,0.00),(687,14,286,41,1,'0',0,2,36,0,0,0.00),(688,17,184,56,1,'0',0,3,54,0,0,0.00),(689,16,109,52,1,'0',0,2,36,0,0,0.00),(690,16,324,52,1,'0',0,2,16,0,0,0.00),(691,16,325,52,1,'0',0,4,16,0,0,0.00),(692,16,326,52,1,'0',0,3,16,0,0,0.00),(693,16,327,52,1,'0',0,3,16,0,0,0.00),(694,16,328,52,1,'0',0,4,16,0,0,0.00),(695,17,170,57,1,'0',0,2,32,0,0,0.00),(696,17,249,57,1,'0',0,2,32,0,0,0.00),(697,17,323,57,1,'0',0,2,32,0,0,0.00),(698,17,329,57,1,'0',0,3,32,0,0,0.00),(699,17,330,57,1,'0',0,3,48,0,0,0.00),(700,17,331,57,1,'0',0,3,48,0,0,0.00),(701,17,332,57,1,'0',0,3,48,0,0,0.00),(702,14,287,42,1,'0',0,3,48,0,0,0.00),(703,14,288,42,1,'0',0,2,32,0,0,0.00),(704,14,289,42,1,'0',0,3,48,0,0,0.00),(705,14,290,42,1,'0',0,3,48,0,0,0.00),(706,14,291,42,1,'0',0,3,48,0,0,0.00),(707,14,292,42,1,'0',0,3,48,0,0,0.00),(708,18,2,60,1,'0',0,1,32,0,0,0.00),(709,18,11,61,1,'0',0,1,32,0,0,0.00),(710,18,19,62,1,'0',0,1,32,0,0,0.00),(711,18,38,63,1,'0',0,1,32,0,0,0.00),(712,14,293,43,1,'0',0,3,54,0,0,0.00),(713,14,294,43,1,'0',0,3,54,0,0,0.00),(714,14,295,43,1,'0',0,3,54,0,0,0.00),(715,14,296,43,1,'0',0,3,54,0,0,0.00),(716,14,297,43,1,'0',0,3,36,0,0,0.00),(717,14,298,43,1,'0',0,2,36,0,0,0.00),(718,14,299,44,1,'0',0,4,72,0,0,0.00),(719,14,300,44,1,'0',0,3,54,0,0,0.00),(720,14,301,44,1,'0',0,3,54,0,0,0.00),(721,14,302,44,1,'0',0,3,54,0,0,0.00),(722,14,303,44,1,'0',0,4,72,0,0,0.00),(723,16,114,53,1,'0',0,2,32,0,0,0.00),(724,16,333,53,1,'0',0,4,64,0,0,0.00),(725,16,334,53,1,'0',0,3,48,0,0,0.00),(726,16,335,53,1,'0',0,2,48,0,0,0.00),(727,16,336,53,1,'0',0,4,64,0,0,0.00),(728,16,180,54,1,'0',0,2,32,0,0,0.00),(729,16,337,54,1,'0',0,4,64,0,0,0.00),(730,16,338,54,1,'0',0,3,64,0,0,0.00),(731,16,339,54,1,'0',0,3,48,0,0,0.00),(732,16,340,54,1,'0',0,4,64,0,0,0.00),(733,17,341,58,1,'0',0,2,32,0,0,0.00),(734,17,342,58,1,'0',0,2,32,0,0,0.00),(735,17,192,58,1,'0',0,3,48,0,0,0.00),(736,17,343,58,1,'0',0,4,64,0,0,0.00),(737,17,344,58,1,'0',0,4,64,0,0,0.00),(738,17,345,58,1,'0',0,3,64,0,0,0.00),(739,17,243,59,1,'0',0,4,64,0,0,0.00),(740,17,346,59,1,'0',0,4,64,0,0,0.00),(741,17,347,59,1,'0',0,4,64,0,0,0.00),(742,17,237,59,1,'0',0,2,16,0,0,0.00),(743,17,348,59,1,'0',0,3,48,0,0,0.00),(744,19,304,50,1,'B',0,3,48,0,0,0.00),(745,19,307,50,1,'B',0,2,32,0,0,0.00),(746,19,250,50,1,'B',0,4,64,0,0,0.00),(747,19,1,50,1,'B',0,2,32,0,0,0.00),(748,19,349,50,1,'P',0,4,64,0,0,0.00),(749,19,350,50,1,'P',0,2,32,0,0,0.00),(750,20,277,40,1,'B',0,3,48,0,0,0.00),(751,20,250,40,1,'B',0,3,48,0,0,0.00),(752,20,1,40,1,'B',0,2,32,0,0,0.00),(753,20,278,40,1,'P',0,2,32,0,0,0.00),(754,20,289,40,1,'P',0,4,64,0,0,0.00),(755,20,279,40,1,'P',0,2,32,0,0,0.00),(756,21,155,55,1,'P',0,4,64,0,0,0.00),(757,21,156,55,1,'P',0,2,32,0,0,0.00),(758,21,4,55,1,'B',0,2,32,0,0,0.00),(759,21,304,55,1,'B',0,2,32,0,0,0.00),(760,21,351,55,1,'B',0,4,64,0,0,0.00),(761,21,1,55,1,'B',0,2,32,0,0,0.00),(762,19,109,51,1,'P',0,3,48,0,0,0.00),(763,19,317,51,1,'P',0,3,48,0,0,0.00),(764,19,53,51,1,'P',0,3,48,0,0,0.00),(765,19,211,51,1,'P',0,4,64,0,0,0.00),(766,19,352,51,1,'P',0,4,64,0,0,0.00),(767,21,244,56,1,'P',0,2,32,0,0,0.00),(768,21,170,56,1,'P',0,3,48,0,0,0.00),(769,21,312,56,1,'P',0,2,32,0,0,0.00),(770,21,184,56,1,'P',0,3,48,0,0,0.00),(771,21,331,56,1,'P',0,3,48,0,0,0.00),(772,21,189,56,1,'P',0,3,48,0,0,0.00),(773,20,281,41,1,'P',0,3,48,0,0,0.00),(774,20,282,41,1,'P',0,3,48,0,0,0.00),(775,20,283,41,1,'P',0,3,48,0,0,0.00),(776,20,284,41,1,'P',0,4,64,0,0,0.00),(777,20,285,41,1,'P',0,3,48,0,0,0.00),(778,20,286,41,1,'P',0,2,32,0,0,0.00),(779,19,271,51,1,'P',0,3,48,0,0,0.00),(780,12,231,64,1,'0',0,1,6,1,0,0.00),(781,12,353,64,1,'0',0,1,6,1,0,0.00),(782,12,354,64,1,'0',0,1,6,1,0,0.00),(783,12,238,64,1,'0',0,1,6,1,0,0.00),(784,12,355,64,1,'0',0,1,6,1,0,0.00),(785,19,356,52,1,'P',0,2,32,0,0,0.00),(786,19,357,52,1,'P',0,4,64,0,0,0.00),(787,19,358,52,1,'P',0,4,64,0,0,0.00),(788,19,359,52,1,'P',0,4,64,0,0,0.00),(789,19,328,52,1,'P',0,2,32,0,0,0.00),(790,19,360,52,1,'P',0,3,48,0,0,0.00),(791,20,287,42,1,'P',0,3,48,0,0,0.00),(792,20,288,42,1,'P',0,2,32,0,0,0.00),(793,20,280,42,1,'P',0,3,48,0,0,0.00),(794,20,290,42,1,'P',0,3,48,0,0,0.00),(795,20,291,42,1,'P',0,3,48,0,0,0.00),(796,20,292,42,1,'P',0,3,48,0,0,0.00),(797,21,342,57,1,'P',0,3,48,0,0,0.00),(798,21,323,57,1,'P',0,2,32,0,0,0.00),(799,21,329,57,1,'P',0,3,48,0,0,0.00),(801,21,330,57,1,'P',0,3,48,0,0,0.00),(802,21,176,57,1,'P',0,3,48,0,0,0.00),(803,21,332,57,1,'P',0,2,32,0,0,0.00),(804,19,324,53,1,'P',0,2,32,0,0,0.00),(805,19,333,53,1,'P',0,4,64,0,0,0.00),(806,19,361,53,1,'P',0,3,48,0,0,0.00),(807,19,334,53,1,'P',0,4,64,0,0,0.00),(808,19,362,53,1,'P',0,3,48,0,0,0.00),(809,19,59,54,1,'P',0,2,32,0,0,0.00),(810,19,337,54,1,'P',0,4,64,0,0,0.00),(811,19,363,54,1,'P',0,4,64,0,0,0.00),(812,19,340,54,1,'P',0,3,48,0,0,0.00),(813,19,338,54,1,'P',0,4,64,0,0,0.00),(814,20,293,43,1,'P',0,3,48,0,0,0.00),(815,20,294,43,1,'P',0,3,48,0,0,0.00),(816,20,295,43,1,'P',0,3,48,0,0,0.00),(817,20,296,43,1,'P',0,3,48,0,0,0.00),(818,20,297,43,1,'P',0,3,48,0,0,0.00),(819,20,298,43,1,'P',0,2,32,0,0,0.00),(820,20,299,44,1,'P',0,4,64,0,0,0.00),(821,20,300,44,1,'P',0,3,48,0,0,0.00),(822,20,301,44,1,'P',0,3,48,0,0,0.00),(823,20,302,44,1,'P',0,2,32,0,0,0.00),(824,20,303,44,1,'P',0,2,32,0,0,0.00),(825,21,341,58,1,'P',0,3,48,0,0,0.00),(826,21,364,58,1,'P',0,3,48,0,0,0.00),(827,21,365,58,1,'P',0,4,64,0,0,0.00),(828,21,188,58,1,'P',0,4,64,0,0,0.00),(829,21,366,58,1,'P',0,2,32,0,0,0.00),(830,21,243,59,1,'P',0,3,48,0,0,0.00),(831,21,185,59,1,'P',0,4,64,0,0,0.00),(832,21,367,59,1,'P',0,3,48,0,0,0.00),(833,21,237,59,1,'P',0,2,32,0,0,0.00),(834,21,368,59,1,'P',0,3,48,0,0,0.00),(835,21,348,59,1,'p',0,2,32,0,0,0.00),(836,22,369,65,3,'B',0,1,48,0,1,1.00),(837,22,373,65,3,'B',0,1,48,0,1,0.00),(838,22,109,65,1,'B',0,1,48,0,0,0.00),(839,22,370,65,1,'P',0,1,96,0,0,0.00),(840,22,264,65,1,'P',0,1,144,0,0,0.00),(841,22,371,65,1,'P',0,1,144,0,0,0.00),(842,22,372,65,1,'P',0,1,144,0,0,0.00),(843,24,373,55,3,'B',0,1,48,0,1,0.00),(844,24,304,55,1,'B',0,3,144,0,0,0.00),(845,24,369,55,3,'B',0,1,48,0,1,1.00),(846,24,351,55,1,'B',0,3,144,0,0,0.00),(847,24,249,55,1,'B',0,3,144,0,0,0.00),(848,24,156,55,1,'B',0,2,96,0,0,0.00),(849,24,155,55,1,'B',0,2,96,0,0,0.00),(850,23,159,50,1,'B',0,2,96,0,0,0.00),(851,23,373,50,3,'B',0,1,48,0,1,0.00),(852,23,369,50,3,'B',0,1,48,0,1,1.00),(853,23,304,50,1,'B',0,2,96,0,0,0.00),(854,23,309,50,1,'B',0,3,144,0,0,0.00),(855,23,374,50,1,'B',0,3,144,0,0,0.00),(856,23,375,50,1,'B',0,3,144,0,0,0.00),(857,25,369,69,3,'B',0,1,48,0,1,1.00),(858,25,373,69,3,'B',0,1,48,0,1,0.00),(859,25,73,69,1,'B',0,2,96,0,0,0.00),(860,25,376,69,1,'P',0,2,96,0,0,0.00),(861,25,377,69,1,'P',0,3,144,0,0,0.00),(862,25,378,69,1,'P',0,3,144,0,0,0.00),(863,25,379,69,1,'P',0,3,144,0,0,0.00),(864,26,380,94,1,'B',0,2,96,0,0,0.00),(865,26,381,94,1,'B',0,2,96,0,0,0.00),(866,26,373,94,3,'B',0,1,48,0,1,0.00),(867,26,369,94,3,'B',0,1,48,0,1,1.00),(868,26,382,94,1,'P',0,3,144,0,0,0.00),(870,26,384,94,1,'P',0,3,144,0,0,0.00),(871,27,369,100,3,'B',0,1,48,0,1,1.00),(872,27,373,100,3,'B',0,1,48,0,1,0.00),(873,27,385,100,1,'B',0,2,96,0,0,0.00),(874,27,386,100,1,'P',0,3,144,0,0,0.00),(875,27,387,100,1,'P',0,2,96,0,0,0.00),(876,27,388,100,1,'P',0,3,144,0,0,0.00),(877,27,389,100,1,'P',0,3,144,0,0,0.00),(878,28,369,76,3,'B',0,1,48,0,1,1.00),(879,28,390,76,1,'B',0,3,144,0,0,0.00),(880,28,373,76,3,'B',0,1,48,0,1,0.00),(881,28,249,76,1,'B',0,2,96,0,0,0.00),(882,28,391,76,1,'B',0,3,144,0,0,0.00),(883,28,392,76,1,'B',0,2,96,0,0,0.00),(884,28,393,76,1,'P',0,3,144,0,0,0.00),(885,29,369,90,3,'B',0,1,48,0,1,1.00),(886,29,394,90,1,'B',0,2,96,0,0,0.00),(887,29,373,90,3,'B',0,1,48,0,1,0.00),(888,29,395,90,1,'P',0,2,96,0,0,0.00),(889,29,396,90,1,'P',0,3,144,0,0,0.00),(890,29,35,90,1,'P',0,3,144,0,0,0.00),(891,29,397,90,1,'P',0,3,144,0,0,0.00),(892,30,398,83,1,'B',0,2,96,0,0,0.00),(893,30,399,83,1,'B',0,2,96,0,0,0.00),(894,30,373,83,3,'B',0,2,48,0,1,1.00),(895,30,400,83,1,'B',0,2,144,0,0,0.00),(896,30,401,83,1,'B',0,3,144,0,0,0.00),(897,30,369,83,3,'B',0,1,48,0,1,0.00),(898,30,402,83,1,'P',0,3,144,0,0,0.00),(899,31,403,40,1,'B',0,2,96,0,0,0.00),(900,31,373,40,3,'B',0,1,48,0,1,0.00),(901,31,369,40,3,'B',0,1,48,0,1,1.00),(902,31,404,40,1,'B',0,1,48,0,0,0.00),(903,31,278,40,1,'P',0,2,96,0,0,0.00),(904,31,285,40,1,'P',0,3,144,0,0,0.00),(905,31,405,40,1,'P',0,2,96,0,0,0.00),(906,31,284,40,1,'P',0,3,144,0,0,0.00),(907,32,406,104,1,'B',0,2,96,0,0,0.00),(908,32,373,104,3,'B',0,1,48,0,1,0.00),(909,32,407,104,1,'B',0,1,48,0,0,0.00),(910,32,408,104,1,'P',0,3,144,0,0,0.00),(911,32,409,104,1,'P',0,3,144,0,0,0.00),(912,32,410,104,1,'P',0,2,96,0,0,0.00),(913,32,411,104,1,'P',0,3,144,0,0,0.00),(914,22,412,66,3,'B',0,1,48,0,1,NULL),(915,22,237,66,3,'B',0,1,48,0,1,1.00),(916,22,305,66,1,'B',0,2,96,0,0,0.00),(917,22,413,66,1,'P',0,3,144,0,0,0.00),(918,22,414,66,1,'P',0,3,144,0,0,0.00),(919,22,415,66,1,'P',0,3,144,0,0,0.00),(920,24,416,56,1,'B',0,2,96,0,0,0.00),(921,24,312,56,1,'B',0,2,96,0,0,0.00),(922,24,412,56,3,'B',0,1,48,0,1,0.00),(923,24,418,56,1,'P',0,2,96,0,0,0.00),(924,24,342,56,1,'P',0,2,96,0,0,0.00),(925,24,189,56,1,'P',0,3,144,0,0,0.00),(926,24,417,56,1,'P',0,2,96,0,0,0.00),(928,23,181,51,1,'B',0,3,144,0,0,0.00),(929,23,24,51,1,'P',0,3,144,0,0,0.00),(930,23,420,51,1,'P',0,2,96,0,0,0.00),(931,23,421,51,1,'P',0,3,144,0,0,0.00),(932,23,422,51,1,'P',0,2,96,0,0,0.00),(933,23,412,51,3,'B',0,1,48,0,1,0.00),(935,26,383,94,1,'P',0,3,144,0,0,0.00),(936,34,4,108,1,'B',0,2,96,0,0,0.00),(937,34,373,108,3,'B',0,1,48,0,1,0.00),(938,34,369,108,3,'B',0,1,48,0,1,1.00),(939,34,309,108,1,'P',0,3,144,0,0,0.00),(940,34,374,108,1,'P',0,3,144,0,0,0.00),(941,34,211,108,1,'P',0,3,144,0,0,0.00),(942,33,424,112,1,'B',0,2,96,0,0,0.00),(943,33,373,112,3,'B',0,1,48,0,1,0.00),(944,33,425,112,1,'B',0,3,144,0,0,0.00),(945,33,369,112,3,'B',0,1,48,0,1,1.00),(946,33,426,112,1,'P',0,3,144,0,0,0.00),(947,33,427,112,1,'P',0,2,96,0,0,0.00),(948,33,428,112,1,'P',0,3,144,0,0,0.00),(949,12,429,64,1,'0',0,1,6,0,0,0.00),(950,12,430,64,1,'0',0,1,6,0,0,0.00),(951,12,431,64,1,'0',0,1,6,0,0,0.00),(952,12,432,64,1,'0',0,1,6,0,0,0.00),(953,12,433,64,1,'0',0,1,6,0,0,0.00),(954,24,434,57,1,'B',0,2,96,0,0,0.00),(955,24,237,57,3,'B',0,1,48,0,1,1.00),(956,24,435,57,1,'P',0,3,144,0,0,0.00),(957,24,436,57,1,'P',0,2,96,0,0,0.00),(958,24,437,57,1,'P',0,2,96,0,0,0.00),(959,24,438,57,1,'P',0,3,144,0,0,0.00),(966,31,444,41,1,'B',0,1,48,0,0,0.00),(967,31,412,41,3,'B',0,1,48,0,1,1.00),(968,31,445,41,1,'B',0,2,96,0,0,0.00),(969,31,446,41,1,'P',0,3,144,0,0,0.00),(970,31,291,41,1,'P',0,3,144,0,0,0.00),(971,31,447,41,1,'P',0,2,96,0,0,0.00),(972,31,448,41,1,'P',0,2,96,0,0,0.00),(973,28,412,77,3,'B',0,1,48,0,1,0.00),(974,28,237,77,3,'B',0,1,48,0,1,1.00),(975,28,481,77,1,'P',0,2,96,0,0,0.00),(976,28,482,77,1,'P',0,3,144,0,0,0.00),(977,28,483,77,1,'P',0,2,96,0,0,0.00),(978,28,484,77,1,'P',0,2,96,0,0,0.00),(979,28,485,77,1,'P',0,2,96,0,0,0.00),(980,32,451,105,1,'B',0,2,96,0,0,0.00),(981,32,453,105,1,'B',0,2,96,0,0,0.00),(982,32,369,105,3,'B',0,1,48,0,1,0.00),(983,32,454,105,1,'P',0,3,144,0,0,0.00),(984,32,455,105,1,'P',0,2,96,0,0,0.00),(985,32,456,105,1,'P',0,2,96,0,0,0.00),(986,32,457,105,1,'P',0,2,96,0,0,0.00),(987,22,463,67,1,'B',0,2,96,0,0,0.00),(988,22,464,67,1,'B',0,2,96,0,0,0.00),(989,22,13,67,1,'P',0,3,144,0,0,0.00),(990,22,465,67,1,'P',0,3,144,0,0,0.00),(991,22,466,67,1,'P',0,3,144,0,0,0.00),(992,25,412,70,3,'B',0,1,48,0,1,1.00),(993,25,477,70,1,'B',0,3,144,0,0,0.00),(994,25,237,70,3,'B',0,1,48,0,1,1.00),(995,25,478,70,1,'P',0,3,144,0,0,0.00),(996,25,479,70,1,'P',0,3,144,0,0,0.00),(997,25,480,70,1,'P',0,3,144,0,0,0.00),(998,27,412,101,3,'B',0,1,48,0,1,0.00),(999,27,218,101,1,'B',0,1,48,0,0,0.00),(1000,27,237,101,3,'B',0,1,48,0,1,1.00),(1001,27,473,101,1,'P',0,3,144,0,0,0.00),(1002,27,474,101,1,'P',0,3,144,0,0,0.00),(1003,27,475,101,1,'P',0,3,144,0,0,0.00),(1004,27,476,101,1,'P',0,2,96,0,0,0.00),(1005,29,305,91,1,'B',0,2,96,0,0,0.00),(1006,29,467,91,1,'P',0,3,144,0,0,0.00),(1007,29,468,91,1,'P',0,3,144,0,0,0.00),(1008,29,83,91,1,'P',0,3,144,0,0,0.00),(1009,29,469,91,1,'P',0,3,144,0,0,0.00),(1010,30,449,84,1,'B',0,3,144,0,0,0.00),(1011,30,450,84,1,'B',0,2,96,0,0,0.00),(1012,30,458,84,1,'B',0,1,48,0,0,0.00),(1013,30,412,84,3,'B',0,1,48,0,1,0.00),(1014,30,459,84,1,'P',0,2,96,0,0,0.00),(1015,30,460,84,1,'P',0,3,144,0,0,0.00),(1016,30,461,84,1,'P',0,2,96,0,0,0.00),(1017,34,304,108,1,'B',0,2,96,0,0,0.00),(1018,32,486,106,1,'B',0,2,96,0,0,0.00),(1019,32,487,106,3,'B',0,1,48,0,1,1.00),(1020,32,412,106,3,'B',0,1,48,0,1,1.00),(1021,32,488,106,1,'P',0,2,96,0,0,0.00),(1022,32,489,106,1,'P',0,2,96,0,0,0.00),(1023,32,490,106,1,'P',0,3,144,0,0,0.00),(1024,32,491,106,1,'P',0,2,96,0,0,0.00),(1025,23,237,52,3,'B',0,1,48,0,1,1.00),(1026,23,439,52,1,'B',0,2,96,0,0,0.00),(1027,23,361,52,1,'P',0,2,96,0,0,0.00),(1028,23,441,52,1,'P',0,3,144,0,0,0.00),(1029,23,440,52,1,'P',0,3,144,0,0,0.00),(1030,23,442,52,1,'P',0,2,96,0,0,0.00),(1031,31,237,42,3,'B',0,1,48,0,1,1.00),(1032,31,287,42,1,'B',0,2,96,0,0,0.00),(1033,31,286,42,1,'B',0,2,96,0,0,0.00),(1034,31,504,42,1,'P',0,2,96,0,0,0.00),(1035,31,296,42,1,'P',0,3,144,0,0,0.00),(1036,31,443,42,1,'P',0,3,144,0,0,0.00),(1037,28,508,78,1,'B',0,2,96,0,0,0.00),(1038,28,510,78,1,'P',0,3,144,0,0,0.00),(1039,28,511,78,1,'P',0,3,144,0,0,0.00),(1040,28,512,78,1,'P',0,3,144,0,0,0.00),(1041,28,513,78,1,'P',0,2,96,0,0,0.00),(1042,23,518,53,1,'B',0,1,48,0,0,0.00),(1043,23,519,53,1,'B',0,1,48,0,0,0.00),(1044,23,520,53,1,'P',0,2,96,0,0,0.00),(1045,23,521,53,1,'P',0,2,96,0,0,0.00),(1046,23,317,53,1,'P',0,2,96,0,0,0.00),(1047,23,523,53,1,'P',0,2,96,0,0,0.00),(1048,23,496,53,1,'U',0,2,96,0,0,0.00),(1049,30,524,85,1,'B',0,2,96,0,0,0.00),(1050,30,525,85,1,'B',0,2,96,0,0,0.00),(1051,30,237,85,3,'B',0,1,48,0,1,1.00),(1052,30,526,85,1,'B',0,1,48,0,0,0.00),(1053,30,534,85,1,'P',0,2,96,0,0,0.00),(1054,30,535,85,1,'P',0,2,96,0,0,0.00),(1055,30,536,85,1,'P',0,3,144,0,0,0.00),(1056,24,341,58,1,'B',0,1,48,0,0,0.00),(1057,24,531,58,1,'B',0,2,96,0,0,0.00),(1058,24,368,58,1,'B',0,2,96,0,0,0.00),(1059,24,329,58,1,'P',0,2,96,0,0,0.00),(1060,24,243,58,1,'P',0,1,48,0,0,0.00),(1061,24,533,58,1,'P',0,2,96,0,0,0.00),(1062,24,348,58,1,'U',0,2,96,0,0,0.00),(1063,29,537,92,3,'B',0,1,48,0,1,1.00),(1064,29,237,92,3,'B',0,1,48,0,1,1.00),(1065,29,538,92,1,'P',0,3,144,0,0,0.00),(1066,29,539,92,1,'P',0,3,144,0,0,0.00),(1067,29,540,92,1,'P',0,2,96,0,0,0.00),(1068,29,541,92,1,'P',0,3,144,0,0,0.00),(1069,26,542,95,1,'B',0,2,96,0,0,0.00),(1070,26,412,95,3,'B',0,1,48,0,1,0.00),(1071,26,543,95,1,'P',0,3,144,0,0,0.00),(1072,26,544,95,1,'P',0,3,144,0,0,0.00),(1073,26,545,95,1,'P',0,2,96,0,0,0.00),(1074,26,546,95,1,'P',0,2,96,0,0,0.00),(1075,26,547,95,1,'P',0,2,96,0,0,0.00),(1076,22,497,68,1,'B',0,1,48,0,0,0.00),(1077,22,498,68,1,'P',0,2,96,0,0,0.00),(1078,22,499,68,1,'P',0,2,96,0,0,0.00),(1079,22,500,68,1,'P',0,2,96,0,0,0.00),(1080,22,501,68,1,'P',0,2,96,0,0,0.00),(1081,22,502,68,1,'P',0,2,96,0,0,0.00),(1082,22,496,68,1,'U',0,2,96,0,0,0.00),(1083,27,461,102,1,'B',0,2,96,0,0,0.00),(1084,27,526,102,1,'B',0,1,48,0,0,0.00),(1085,27,548,102,1,'P',0,2,96,0,0,0.00),(1086,27,549,102,1,'P',0,3,144,0,0,0.00),(1087,27,550,102,1,'P',0,3,144,0,0,0.00),(1088,27,551,102,1,'P',0,2,96,0,0,0.00),(1089,34,418,109,1,'B',0,2,96,0,0,0.00),(1090,34,537,109,3,'B',0,2,96,0,1,1.00),(1091,34,359,109,1,'P',0,2,96,0,0,0.00),(1092,34,552,109,1,'P',0,3,144,0,0,0.00),(1093,34,553,109,1,'P',0,3,144,0,0,0.00),(1094,34,53,109,1,'P',0,2,96,0,0,0.00),(1095,31,505,43,1,'B',0,1,48,0,0,0.00),(1096,31,294,43,1,'P',0,2,96,0,0,0.00),(1097,31,506,43,1,'P',0,2,96,0,0,0.00),(1098,31,295,43,1,'P',0,2,96,0,0,0.00),(1099,31,507,43,1,'P',0,2,96,0,0,0.00),(1100,31,496,43,1,'U',0,2,96,0,0,0.00),(1101,25,555,71,1,'B',0,2,96,0,0,0.00),(1102,25,556,71,1,'B',0,2,96,0,0,0.00),(1103,25,558,71,1,'P',0,3,144,0,0,0.00),(1104,25,86,71,1,'P',0,3,144,0,0,0.00),(1105,25,559,71,1,'P',0,3,144,0,0,0.00),(1106,25,560,72,1,'B',0,1,48,0,0,0.00),(1107,25,561,72,1,'P',0,2,96,0,0,0.00),(1108,25,562,72,1,'P',0,2,96,0,0,0.00),(1109,25,563,72,1,'P',0,2,96,0,0,0.00),(1110,25,564,72,1,'P',0,2,96,0,0,0.00),(1111,25,565,72,1,'P',0,1,48,0,0,0.00),(1112,25,496,72,1,'U',0,2,96,0,0,0.00),(1113,29,110,93,1,'B',0,2,96,0,0,0.00),(1114,29,59,93,1,'B',0,1,48,0,0,0.00),(1115,29,566,93,1,'P',0,2,96,0,0,0.00),(1116,29,567,93,1,'P',0,2,96,0,0,0.00),(1117,29,568,93,1,'P',0,2,96,0,0,0.00),(1118,29,569,93,1,'P',0,1,48,0,0,0.00),(1119,29,496,93,1,'U',0,2,96,0,0,0.00),(1120,28,59,79,1,'B',0,1,48,0,0,0.00),(1121,28,514,79,1,'B',0,2,96,0,0,0.00),(1122,28,515,79,1,'P',0,2,96,0,0,0.00),(1123,28,516,79,1,'P',0,2,96,0,0,0.00),(1124,28,517,79,1,'P',0,2,96,0,0,0.00),(1125,33,156,113,1,'B',0,2,96,0,0,0.00),(1126,33,312,113,1,'B',0,2,96,0,0,0.00),(1127,33,412,113,3,'B',0,1,48,0,1,0.00),(1128,33,570,113,1,'P',0,2,96,0,0,0.00),(1129,33,571,113,1,'P',0,3,144,0,0,0.00),(1130,33,572,113,1,'P',0,2,96,0,0,0.00),(1131,33,573,113,1,'P',0,2,96,0,0,0.00),(1132,26,574,98,1,'B',0,2,96,0,0,0.00),(1133,26,237,98,3,'B',0,1,48,0,1,1.00),(1134,26,575,98,1,'P',0,3,144,0,0,0.00),(1135,26,576,98,1,'P',0,2,96,0,0,0.00),(1136,26,577,98,1,'P',0,3,144,0,0,0.00),(1137,26,578,98,1,'P',0,2,96,0,0,0.00),(1138,27,579,103,1,'B',0,2,96,0,0,0.00),(1139,27,580,103,1,'P',0,3,144,0,0,0.00),(1140,27,581,103,1,'P',0,3,144,0,0,0.00),(1141,27,582,103,1,'P',0,2,96,0,0,0.00),(1142,34,237,110,3,'B',0,1,48,0,1,1.00),(1143,34,583,110,1,'P',0,2,96,0,0,0.00),(1144,34,584,110,1,'P',0,3,144,0,0,0.00),(1145,34,585,110,1,'P',0,3,144,0,0,0.00),(1146,34,586,110,1,'P',0,2,96,0,0,0.00),(1147,34,587,110,1,'P',0,2,96,0,0,0.00),(1148,30,581,86,1,'B',0,1,48,0,0,0.00),(1149,30,589,86,1,'P',0,3,144,0,0,0.00),(1150,30,590,86,1,'p',0,2,96,0,0,0.00),(1151,30,528,86,1,'p',0,2,96,0,0,0.00),(1152,30,529,86,1,'p',0,1,48,0,0,0.00),(1153,30,530,86,1,'p',0,1,48,0,0,0.00),(1154,32,492,107,1,'B',0,2,48,0,0,0.00),(1155,32,493,107,1,'B',0,3,144,0,0,0.00),(1156,32,494,107,1,'p',0,3,144,0,0,0.00),(1157,32,595,107,1,'p',0,2,96,0,0,0.00),(1158,32,495,107,1,'p',0,2,96,0,0,0.00),(1159,26,581,99,1,'B',0,1,48,0,0,0.00),(1160,26,596,99,1,'P',0,3,144,0,0,0.00),(1161,26,597,99,1,'P',0,3,144,0,0,0.00),(1162,26,598,99,1,'P',0,2,96,0,0,0.00),(1163,26,599,99,1,'P',0,3,144,0,0,0.00),(1164,34,59,111,1,'B',0,2,96,0,0,0.00),(1165,34,600,111,1,'P',0,2,96,0,0,0.00),(1166,34,601,111,1,'P',0,2,96,0,0,0.00),(1167,34,602,111,1,'P',0,2,96,0,0,0.00),(1168,34,603,111,1,'P',0,2,96,0,0,0.00),(1169,33,237,114,3,'B',0,1,48,0,1,1.00),(1170,33,604,114,1,'P',0,3,144,0,0,0.00),(1171,33,605,114,1,'P',0,2,96,0,0,0.00),(1172,33,221,114,1,'P',0,3,144,0,0,0.00),(1173,33,607,114,1,'P',0,2,96,0,0,0.00),(1174,33,608,114,1,'P',0,2,96,0,0,0.00),(1176,33,609,115,1,'B',0,1,48,0,0,0.00),(1177,33,610,115,2,'P',0,2,96,0,0,0.00),(1179,33,611,115,2,'P',0,2,96,0,0,0.00),(1180,33,612,115,2,'P',0,1,48,0,0,0.00),(1181,33,613,115,2,'P',0,1,48,0,0,0.00),(1182,33,496,115,2,'P',0,2,48,0,0,0.00),(1183,33,208,115,2,'p',0,2,96,0,0,0.00),(1184,27,614,103,1,'teorico',0,4,80,0,1,0.00),(1185,28,496,79,1,'P',0,2,96,0,0,0.00),(1186,27,496,103,1,'P',0,2,96,0,0,0.00),(1187,26,496,99,1,'P',0,2,96,0,0,0.00),(1188,32,496,107,1,'P',0,2,96,0,0,0.00),(1189,24,496,58,1,'p',0,2,96,0,0,0.00),(1190,34,496,111,1,'p',0,2,96,0,0,0.00);
/*!40000 ALTER TABLE `detallemallas` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `discapacidades`
LOCK TABLES `discapacidades` WRITE;
/*!40000 ALTER TABLE `discapacidades` DISABLE KEYS */;
INSERT INTO `discapacidades` VALUES (1,'AUDITIVA',0),(2,'FISICA MOTORA',0),(3,'INTELECTUAL',0),(4,'LENGUAJE',0),(5,'MENTAL PSICOSOCIAL',0),(6,'VISUAL',0),(7,'NINGUNA',1);
/*!40000 ALTER TABLE `discapacidades` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `estadocivil`
LOCK TABLES `estadocivil` WRITE;
/*!40000 ALTER TABLE `estadocivil` DISABLE KEYS */;
INSERT INTO `estadocivil` VALUES (1,'Solter@',0),(2,'Casado@',1),(3,'Viud@',0),(4,'Divorciad@',0),(5,'Union Libre',1);
/*!40000 ALTER TABLE `estadocivil` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `etnias`
LOCK TABLES `etnias` WRITE;
/*!40000 ALTER TABLE `etnias` DISABLE KEYS */;
INSERT INTO `etnias` VALUES (1,'INDIGENA',1,0),(2,'AFROECUATORIANO/A',0,0),(3,'NEGRO/A',0,0),(4,'MULATO/A',0,0),(5,'MONTUBIO/A',0,0),(6,'MESTIZO/A',0,0),(7,'BLANCO/A',0,0),(8,'OTRO',0,0),(9,'NO REGISTRA',0,1);
/*!40000 ALTER TABLE `etnias` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `grados_academicos`
LOCK TABLES `grados_academicos` WRITE;
/*!40000 ALTER TABLE `grados_academicos` DISABLE KEYS */;
INSERT INTO `grados_academicos` VALUES (1,1,'TECNOLOGO SUPERIOR'),(2,1,'INGENIERIA'),(3,1,'LICENCIATURA'),(4,2,'ESPECIALISTA'),(5,2,'MAGISTER'),(6,2,'PHD'),(7,1,'ABOGADO');
/*!40000 ALTER TABLE `grados_academicos` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `horas_clases`
LOCK TABLES `horas_clases` WRITE;
/*!40000 ALTER TABLE `horas_clases` DISABLE KEYS */;
INSERT INTO `horas_clases` VALUES (1,1,6,'7:00','8:30',90,1,'C',1),(2,1,6,'8:30','10:00',90,2,'C',1),(3,1,6,'10:00','11:30',90,3,'C',1),(4,1,6,'11:30','13:00',90,4,'C',1),(5,2,6,'18:00','18:45',45,1,'C',0),(6,2,6,'18:45','19:30',45,2,'C',0),(7,2,6,'19:45','20:30',45,3,'C',0),(8,2,6,'20:30','21:45',45,4,'C',0),(9,3,6,'14:30','16:00',90,1,'C',0),(10,3,6,'16:00','17:30',90,2,'C',0),(11,3,6,'17:30','19:00',90,3,'C',0),(13,4,6,'7:00','8:30',90,1,'C',1),(14,4,6,'8:30','10:00',90,2,'C',1),(15,4,6,'10:00','11:30',90,3,'C',1),(16,4,6,'11:30','13:00',90,4,'C',1),(17,4,6,'14:30','16:00',90,5,'C',0),(18,4,6,'16:00','17:30',90,6,'C',0),(19,4,6,'17:30','19:00',90,7,'C',0),(23,3,1,'13:00','14:00',60,1,'C',1),(24,3,1,'14:00','15:00',60,2,'C',1),(25,3,1,'15:00','16:00',60,3,'C',1),(26,3,1,'16:00','17:00',60,4,'C',1),(27,3,1,'17:00','18:00',60,5,'C',1),(28,3,2,'13:00','14:00',60,1,'C',1),(29,3,2,'14:00','15:00',60,2,'C',1),(30,3,4,'13:00','14:00',60,1,'C',1),(31,3,4,'14:00','15:00',60,2,'C',1),(32,3,7,'13:00','14:00',60,1,'C',1),(33,3,7,'14:00','15:00',60,2,'C',1),(34,3,7,'15:00','16:00',60,3,'C',1),(35,3,7,'16:00','17:00',60,4,'C',1),(36,3,7,'17:00','18:00',60,5,'C',1),(39,3,8,'13:00','14:00',60,1,'C',1),(40,3,8,'14:00','15:00',60,2,'C',1),(41,3,8,'15:00','16:00',60,3,'C',1),(42,3,8,'16:00','17:00',60,4,'C',1),(43,3,8,'17:00','18:00',60,5,'C',1),(46,3,9,'13:00','14:00',60,1,'C',1),(47,3,9,'14:00','15:00',60,2,'C',1),(48,3,9,'15:00','16:00',60,3,'C',1),(49,3,9,'16:00','17:00',60,4,'C',1),(50,3,9,'17:00','18:00',60,5,'C',1),(53,3,10,'13:00','14:00',60,1,'C',1),(54,3,10,'14:00','15:00',60,2,'C',1),(55,3,10,'15:00','16:00',60,3,'C',1),(56,3,10,'16:00','17:00',60,4,'C',1),(57,3,10,'17:00','18:00',60,5,'C',1),(58,3,6,'14:00','15:30',90,1,'I',1),(59,3,6,'15:30','17:00',90,2,'I',1),(60,3,6,'17:00','18:30',90,3,'I',1),(61,3,6,'18:30','20:00',90,4,'I',1),(62,4,6,'07:00','09:00',120,1,'I',1),(63,4,6,'09:00','11:00',120,2,'I',1),(64,4,6,'11:00','13:00',120,3,'I',1),(65,3,6,'14:00','15:30',90,1,'C',1),(66,3,6,'15:30','17:00',90,2,'C',1),(67,3,6,'17:00','18:30',90,3,'C',1),(68,3,6,'18:30','20:00',90,4,'C',1),(69,4,6,'14:00','15:30',90,5,'C',1),(70,4,6,'15:30','17:00',90,6,'C',1),(71,4,6,'17:00','18:30',90,7,'C',1),(72,NULL,NULL,'8:00','9:00',60,1,'X',1),(73,NULL,NULL,'9:00','10:00',60,2,'X',1),(74,NULL,NULL,'10:00','11:00',60,3,'X',1),(75,NULL,NULL,'11:00','12:00',60,4,'X',1),(76,NULL,NULL,'19:00','20:00',60,10,'X',1),(77,NULL,NULL,'20:00','21:00',60,11,'X',1),(78,NULL,NULL,'12:00','13:00',60,5,'X',1),(79,NULL,NULL,'13:00','14:00',60,6,'X',1),(80,NULL,NULL,'14:00','15:00',60,7,'X',1),(81,NULL,NULL,'15:00','16:00',60,8,'X',1),(82,NULL,NULL,'16:00','17:00',60,9,'X',1),(83,NULL,NULL,'14:00','15:30',90,5,'Z',1),(84,NULL,NULL,'15:45','17:15',90,6,'Z',1),(85,NULL,NULL,'18:00','19:30',90,7,'Z',1),(86,NULL,NULL,'19:45','21:15',90,8,'Z',1),(87,NULL,NULL,'07:00','08:30',90,1,'Z',1),(88,NULL,NULL,'08:30','10:00',90,2,'Z',1),(89,NULL,NULL,'10:00','11:30',90,3,'Z',1),(90,NULL,NULL,'12:30','14:00',90,4,'Z',1);
/*!40000 ALTER TABLE `horas_clases` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `instituciones`
LOCK TABLES `instituciones` WRITE;
/*!40000 ALTER TABLE `instituciones` DISABLE KEYS */;
INSERT INTO `instituciones` VALUES (1,'INSTITUTO TECNICO SUPERIOR ANGEL POLIBIO CHAVES','GUARANDA','BOLIVAR'),(2,'ACADEMIA MILITAR GENERAL MIGUEL ITURRALDE','QUITO','PICHINCHA'),(3,'COLEGIO PARTICULAR EUGENIO ESPEJO','QUITO','PICHINCHA'),(4,'COLEGIO NACIONAL EXPERIMENTAL PILOTO \"GONZALO ZALUMBIDE\"','QUITO','PICHINCHA'),(5,'COLEGIO TECNICO HUMANISTICO EXPERIMENTAL QUITO','QUITO','PICHINCHA'),(6,'COLEGIO FISCOMISIONAL  \"MARIA AUGUSTA URRUTIA\"','QUITO','PICHINCHA'),(7,'COLEGIO MENOR UNIVERSIDAD CENTRAL','QUITO','PICHINCHA'),(8,'NACIONAL CUMBAYA','TUMBACO','PICHINCHA'),(9,'UNIDAD EDUCATIVA RINCON DEL SABER','QUITO','PICHINCHA'),(10,'COLEGIO NACIONAL EMILIO UZCATEGUI','QUITO','PICHINCHA'),(11,'PARTICULAR EUGENIO ESPEJO','QUITO','PICHINCHA'),(12,'FRANCISCO JOSE DE CALDAS','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(13,'COLEGIO NACIONAL MIXTO EXPERIMENTAL \"AMAZONAS\"','PICHINCHA ','QUITO'),(15,'COLEGIO  TECNICO \"ECUADOR\"','QUITO','PICHINCHA'),(16,'COLEGIO TECNICO POPULAR \"DR. TELMO HIDALGO DIAZ\"','SANGOLQUI','PICHINCHA'),(17,'UNIDAD EDUCATIVA POLICIA NACIONAL','QUITO','PICHINCHA'),(18,'INSTITUTO TECNOLOGICO SUPERIOR CENTRAL TECNICO','QUITO','PICHINCHA'),(19,'COLEGIO SAN JOSE LA SALLE','QUITO','PICHINCHA'),(20,'COLEGIO NACIONAL TECNICO \"SAN JOSE\"','CHILLANES','BOLIVAR'),(21,'COLEGIO NACIONAL TECNICO \" ISMAEL PROAÑO ANDRADE\"','TAMBILLO','PICHINCHA'),(22,'INSTITUTO TECNOLOGICO \"BENITO JUAREZ\"','QUITO','PICHINCHA'),(23,'INSTITUTO TECNOLOGICO SUPERIOR \"SUCRE\" NOCTURNO','QUITO','PICHINCHA'),(24,'COLEGIO NACIONAL \"JUAN DE SALINAS\"','SANGOLQUI','PICHINCHA'),(25,'INSTITUTO TECNOLOGICO SUPERIOR ALOASI','ALOASI','PICHINCHA'),(26,'COLEGIO TECNICO INDUSTRIAL \"MIGUEL DE SANTIAGO\"','QUITO','PICHINCHA'),(27,'COLEGIO MILITAR TENIENTE HUGO ORTIZ','GUAYAQUIL','GUAYAS'),(28,'COLEGIO NACIONAL\"CARLOS A. GARCIA MORA\"','JUNIN','MANABI'),(29,'UNIDAD EDUCATIVA CARDENAL DE LA TORRE','QUITO','PICHINCHA'),(30,'COLEGIO PARTICULAR ELECTRONICO PICHINCHA','QUITO','PICHINCHA'),(31,'INSTITUTO TECNOLOGICO SUPERIOR \"SUCRE\" SECCION DIURNA','QUITO','PICHINCHA'),(32,'COLEGIO NACIONAL TECNICO \" VICENTE ROCAFUERTE\"','QUITO','PICHINCHA'),(33,'COLEGIO CONSEJO PROVINCIAL DE PICHINCHA','QUITO','PICHINCHA'),(34,'COLEGIO PARTICULAR SHALON','QUITO','PICHINCHA'),(35,'COLEGIO TECNICO SIGCHOS','SIGCHOS ','COTOPAXI'),(36,'INSTITUTO SUPERIOR TECNOLOGICO \"12 DE FEBRERO\"','ZAMORA','ZAMORA CHINCHIPE'),(37,'COLEGIO PARTICULAR MIXTO \"JOSE GARIBALDI\"','QUITO','PICHINCHA'),(38,'COLEGIO NACIONAL  MIXTO \"GENERAL RUMIÑAHUI\"','QUITO','PICHINCHA'),(39,'COLEGIO PARTICULAR \"JESUS DE NAZARET\"','QUITO ','PICHINCHA'),(40,'T.H.E. \"QUITO\"','QUITO','PICHINCHA'),(41,'COLEGIO NACIONAL TECNICO LA ASUNCION','GUARANDA','BOLIVAR'),(42,'COLEGIO PARTICULAR MARIA DE NAZARET','QUITO','PICHINCHA'),(43,'COLEGIO NACIONAL TECNICO JACINTO JIJON Y CAAMAÑO','SANGOLQUI','PICHINCHA'),(44,'UNIDAD EDUCATIVA PEREZ PALLARES','QUITO','PICHINCHA'),(45,'COLEGIO NACIONAL DIEZ DE AGOSTO','QUITO','PICHINCHA'),(46,'COLEGIO NACIONAL TECNICO ARTURO BORJA','QUITO','PICHINCHA'),(47,'UNIDAD EDUCATIVA PARTICULAR VICENTE ROCAFUERTE','SHUSHUFINDI','SUCUMBIOS'),(48,'UNIDAD EDUCATIVA MUNICIPAL EXPERIMENTAL ANTONIO JOSE DE SUCRE','QUITO','PICHINCHA'),(49,'COLEGIO TECNICO PEDRO VICENTE MALDONADO','QUITO','PICHINCHA'),(50,'COLEGIO PARTICULAR NUEVA GENERACION ','QUITO','PICHINCHA'),(52,'INSTITUTO NACIONAL \"MEJIA\" DIURNO','QUITO','PICHINCHA'),(53,'COLEGIO TECNICO \"SEGUNDO ORELLANA \"','NUEVA LOJA ','SUCUMBIOS '),(54,'COLEGIO NACIONAL TECNICO JORGE ICAZA','QUITO ','PICHINCHA'),(55,'UNIDAD EDUCATIVA MUNICIPAL \"JULIO E. MORENO\"','QUITO','PICHINCHA'),(56,'COLEGIO \"PRIMICIAS DE LA CULTURA DE QUITO\"','QUITO','PICHINCHA'),(57,'UNIDAD EDUCATIVA LICEO POLICIAL  BILINGUE MYR. GALO MIÑO J.','AMBATO ','TUNGURAHUA'),(58,'UNIDAD EDUCATIVA POPULAR VIDA NUEVA','QUITO','PICHINCHA'),(59,'COLEGIO EXPERIMENTAL SIMON BOLIVAR ','QUITO','PICHINCHA '),(60,'COLEGIO PARTICULAR \"NUEVA ERA\"','QUITO','PICHINCHA'),(61,'COLEGIO NACIONAL NOCTURNO FEDERICO GONZALEZ SUAREZ ','QUITO','PICHINCHA'),(62,'NUEVA PRIMAVER ','TUNGURAHUA ','AMBATO'),(63,'COLEGIO NUEVA PRIMAVERA ','TUNGURAHUA ','AMBATO'),(64,'COLEGIO TECNICO POPULAR PARTICULAR \"CRISTO SALVADOR\"','QUITO ','PICHINCHA'),(65,'COLEGIO FISCOMISIONAL \"JUAN BAUTISTA MONTINI\"','BORJA ','NAPO'),(66,'COLEGIO MARIANO SAMANIEGO ','CARIAMANGA ','LOJA'),(67,'UNIDAD EDUCATIVA SAN ANDRES','QUITO','PICHINCHA'),(68,'UNIDAD EDUCATIVA SANTA MARIANA DE JESUS','LOJA','LOJA'),(69,'COLEGIO FISCAL MIXTO \"SEIS DE OCTUBRE\"','LOS RIOS','VENTANAS'),(70,'AGENCIA NACIONAL DE TRANSITO (ANT)','QUITO','PICHINCHA'),(71,'COLEGIO EXPERIMENTAL E INSTITUTO SUPERIOR DE PEDAGOGIA \" JUAN MONTALVO \"','QUITO','PICHINCHA'),(72,'COLEGIO EXPERIMENTAL MIXTO \"SHUMIRAL\"','AZUAY','SHUMIRAL'),(73,'COLEGIO TECNICO AGROPECUARIO \"TENIENTE MAXIMILIANO RODRIGUEZ\"','LOJA','LOJA'),(75,'INSTITUTO TECNOLOGICO VICTORIA VASCONEZ CUVI','LATACUNGA','LATACUNGA'),(76,'INSTITUTO TECNOLOGICO CINCO DE JUNIO','QUITO','PICHINCHA'),(77,'COLEGIO FISCAL TECNICO AGROPECUARIO \"JOSE RODRIGUEZ LABANDERA\"','QUEVEDO ','LOS RIOS'),(78,'COLEGIO UNIDAD EDUCATIVA A DISTANCIA DE ESMERALDAS','ESMERALDAS ','ESMERALDAS'),(79,'INSTITUTO TECNOLOGICO SUPERIOR JULIO MORENO ESPINOSA ','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS COLORADOS'),(80,'COLEGIO NACIONAL TOMAS.B OLEAS','RIOBAMBA','CHIMBORAZO'),(81,'COLEGIO TECNICO UNE','QUITO','PICHINCHA'),(83,'COLEGIO FISCAL \"DR GONZALO ABAD GRIJALVA\"','TOSAGUA','MANABI'),(85,'COLEGIO NACIONAL \"SAQUISILI\"','SAQUISILI','LATACUNGA'),(86,'COLEGIO NACIONAL \"SANTA ROSA DE CERRITOS\"','CHILLANES','BOLIVAR'),(87,'ESCUELA POLITECNICA DEL EJERCITO','SANGOLQUI','PICHINCHA'),(88,'COLEGIO TECNICO PARTICULAR MIXTO CRISTO SALVADOR','QUITO','PICHINCHA'),(89,'COLEGIO NACIONAL JORGE ICAZA','PICHINCHA ','QUITO'),(90,'COLEGIO TECNICO EXPERIMENTAL SALESIANA DON BOSCO','QUITO','PICHINCHA'),(91,'COLEGIO FISCAL MARTHA BUCARAM DE ROLDOS','GUAYAQUIL','GUAYAS'),(92,'COLEGIO PARTICULAR NUEVA PRIMAVERA','QUITO','PICHINCHA'),(93,'COLEGIO FISCAL \"CARLOS POVEDA HURTADO\"','QUITO','PICHINCHA'),(94,'MASTER','QUITO','PICHINCHA'),(96,'COLEGIO INTERCULTURAL BILINGUE JATARI UNANCHA','ZUMBAHUA','COTOPAXI'),(97,'INSTITUTO TEGNOLOGICO SUPERIOR\"GUARANDA\"','GUARANDA','BOLIVAR'),(98,'COLEGIO NACIONAL MIXTO GRAN BRETAÑA','QUITO','PICHINCHA'),(99,'REPUBLICA DE FRANCIA','GUAYAQUIL','GUAYAS'),(100,'ACADEMIA NAVAL ALMIRANTE  HOWARD','QUITO','PICHINCHA'),(101,'LICEO CRISTIANO \"HENRY DAVIS\"','QUITO','PICHINCHA'),(102,'INSTITUTO TEGNOLOGICO SUPERIOR LOS ANDES','PILLARO','TUNGURAHUA'),(103,'JUAN PIO MONTUFAR','QUITO','PICHINCHA'),(104,'COLEGIO NACIONAL MIXTO TARQUI','QUITO','PICHINCHA'),(105,'INSTITUTO TECNOLOGICO SUPERIOR MAYOR PEDRO TRAVERSARI','QUITO','PICHINCHA'),(107,'COLEGIO PARTICULAR  MIXTO INTERANDINO','QUITO','PICHINCHA'),(108,'COLEGIO PARTICULAR MIXTO \"JULIO AYON\"','GUAYAQUIL','GUAYAS'),(109,'UNIDAD EDUCATIVA PARTICULAR ESPERANZA Y PROGRESO','QUITO','PICHINCHA'),(110,'UNIDAD EDUCATIVA SAGRADO CORAZON DE JESUS','QUITO','PICHINCHA'),(111,'PAULO VI','QUITO','PICHINCHA'),(112,'TECNICO LUIS NAPOLEON DILLON','QUITO','PICHINCHA'),(113,'UNIDAD EDUCATIVA JULIO MORENO ESPINOSA','STO DOMINGO','STO DMGO DE LOS COLRADOS'),(114,'UNIVERSIDAD TECNOLOGICA AMERICA','QUITO','PICHINCHA'),(115,'COLEGIO NACIONAL JORGUE MANTILLA ORTEGA','QUITO','PICHINCHA'),(116,'INSTITUTO TECNOLOGICO ELOY ALFARO','ESMERALDAS ','ESMERALDAS'),(117,'COLEGIO NACIONAL \"JOSE DE LA CUADRA\"','QUITO','PICHINCHA'),(118,'COLEGIO NACIONAL NOCTURNO \"CHIMBO\"','CHIMBO','BOLIVAR'),(120,'COLEGIO TECNICO \"CARIAMANGA\"','CARIAMANGA ','LOJA'),(124,'AGENCIA NACIONAL DE TRANSITO','QUITO','PICHINCHA'),(126,'UNIDAD EDUCATIVA FESVIP','QUITO','PICHINCHA'),(127,'INSTITUTO TECNOLOGICO GRAN COLOMBIA','QUITO','PICHINCHA'),(130,'INSTITUTO TECNOLOGICO SUPERIOR GRAN COLOMBIA','QUITO','PICHINCHA'),(131,'COLEGIO NACIONAL GONZALO ZALDUMBIDE','QUITO','PICHINCHA'),(132,'COLEGIO POPULAR PARTICULAR A DISTANCIA SAN FRANCISCO DE ASIS ','PICHINCHA ','QUITO'),(133,'INSTITUTO TECNOLOGICO SUPERIOR SHIRY CACHA','RIOBAMBA','CHIMBORAZO'),(134,'COLEGIO EL CEBOLLAR \"LA SALLE\"','QUITO','PICHINCHA'),(135,'COLEGIO TECNICO MARCABELI','EL ORO','MANABI'),(137,'COLEGIO DE BACHILLERATO MARCABELI','MARCABELI','EL ORO'),(138,'COLEGIO ALFREDO PEREZ GUERRERO','PICHINCHA ','QUITO'),(139,'INSTITUTO SUPERIOR TECNOLOGICO ANDRES F, CORDOVA','QUITO','PICHINCHA'),(140,'COLEGIO MILITAR N°10 ABDON CALDERON','QUITO','PICHINCHA'),(141,'COLEGIO MILITAR ABDON CALDERON','QUITO','PICHINCHA'),(142,'COLEGIO MUNICIPALTECNICO EXPERIMENTAL \"FERNANDEZ MADRID\"','QUITO','PICHINCHA'),(143,'COLEGIO 24 DE MAYO','QUITO','PICHINCHA'),(144,'COLEGIO NACIONAL MIXTO CASCALES','PICHINCHA ','QUITO'),(145,'COLEGIO PARTICULAR MIXTO INMACULADA MARIA AUXILIADORA','PEDERNALES ','MANABI'),(146,'COLEGIO NACIONAL ELOY ALFARO','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(148,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ','PICHINCHA ','QUITO'),(151,'JOSE MARIA LE','PICHINCHA ','QUITO'),(153,'COLEGIO PARTICULAR COMPUINFORMATICA','QUITO','PICHINCHA'),(154,'COLEGIO TECNICO MAGALY MASSON DE VALLE CARRERA','CHONE','MANABI'),(155,'INSTITUTO SUPERIOR \"JAVERIANO\"','QUITO','PICHINCHA'),(156,'COLEGIO PARTICULAR\" NUEVO ECUADOR\"','QUITO','PICHINCHA'),(157,'COLEGIO FISCAL \"GONZALO ESCUDERO\"','QUITO','PICHINCHA'),(158,'UNIVERSIDAD CENTRAL DEL ECUADOR','QUITO','PICHINCHA'),(159,'INSTITUTO TECNOLOGICO SUPERIOR GUARANDA','GUARANDA','BOLIVAR'),(160,'COLEGIO PARTICULAR JUAN LEON MERA','QUITO','PICHINCHA'),(161,'COLEGIO PARTICULAR A DISTANCIA  \"OCTAVIO PAZ\"','QUITO','PICHINCHA'),(162,'GONZALO ZANDUMBIDE','QUITO','PICHINCHA'),(163,'COLEGIO NACIONAL \"ALANGASI\"','QUITO','PICHINCHA'),(164,'COLEGIO NACIONAL LA UNION','SANTANA','MANABI'),(165,'COLEGIO PARTICULAR BOLIVARIANO','PICHINCHA ','QUITO'),(166,'11 DE MARZO','QUITO','PICHINCHA'),(167,'NUEVOS HORIZONTES DEL SUR N°1','QUITO','PICHINCHA'),(168,'IES.ITURRALDE','MADRID','MADRID'),(169,'COLEGIO NOCTURNO MARIANO SAMANIEGO','CARIAMANGA ','LOJA'),(170,'COLEGIO NACIONAL  \"FORESTAL\"','QUITO','PICHINCHA'),(171,'COLEGIO NOCTURNO MARIANO SAMANIEGO','CARIAMANGA ','LOJA'),(172,'COLEGIO NACIONAL PICHINCHA','QUITO','PICHINCHA'),(173,'COLEGIO NACIONAL TECNICO NOCTURNO \"10 DE NOVIEMBRE\"','GUARANDA','BOLIVAR'),(174,'COLEGIO  PARTICULAR \"PATRIA','LATACUNGA','COTOPAXI'),(175,'COLEGIO PARTICULAR \"PATRIA·','LATACUNGA','COTOPAXI'),(176,'UNIDAD EDUCATIVA \"VICENTE LEON\"','LATACUNGA','COTOPAXI'),(177,'COLEGIO POPULAR PARTICULAR A DISTANCIA DE ACCION SOCIAL CASA DE LA CULTURA ECUATORIANA','QUITO','PICHINCHA'),(178,'EMAUS FE Y ALEGRIA','QUITO','PICHINCHA'),(179,'COLEGIO NACIONAL  \"CALACALI\"','QUITO','PICHINCHA'),(180,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"CARLOS MONTUFAR\"','QUITO','PICHINCHA'),(181,'COLEGIO PARTICULAR  UNITED KINGDOM','QUITO','PICHINCHA'),(182,'COLEGIO PARTICULAR A DISTANCIA \"FAMEPP\" ','QUITO','PICHINCHA'),(183,'COLEGIO NACIONAL EXPERIMENTAL  \"CARLOS ZAMBRANO OREJUELA\"','QUITO','PICHINCHA'),(184,'COLEGIO NACIONAL LUIS FELIPE BORJA DEL ALCAZAR','QUITO','PICHINCHA'),(185,'COLEGIO PARTICULAR SEGUNDO ANGEL TAPIA','QUITO','PICHINCHA'),(186,'COLEGIO NACIONAL  28 DE AGOSTO','RIOBAMBA','CHIMBORAZO'),(187,'INSTITUTO TECNOLOGICO SUPERIORDE MENCION RADIODIFUSION','QUITO','PICHINCHA'),(188,'COLEGIO EXPERIMENTAL E ISPED \"JUAN MONTALVO\"','QUITO','PICHINCHA'),(189,'COLEGIO TECNICO AGROPECUARIO ORIANGA','LOJA','LOJA'),(190,'UNIDAD EDUCATIVA DE BELLAS ARTES \"LCDO. ENRIQUE CAPURROQUIÑONEZ\" SECCION COLEGIO','ESMERALDAS ','ESMERALDAS'),(191,'COLEGIO NACIONAL NOCTURNO CATAMAYO','CATAMAYO','LOJA'),(192,'COLEGIO PARTICULAR \"VICTOR EMILIO ESTRADA\"','QUITO','PICHINCHA'),(193,'COLEGIO NACIONAL ALOAG','ALOAG','PICHINCHA'),(197,'COLEGIO NACIONAL MACHACHI','MEJIA','PICHINCHA'),(198,'INSTITUTO NORMAL SUPERIOR N|1','QUITO','PICHINCHA'),(199,'TECNICO AGROPECUARIO  \"FAUSTO VALLEJO ESCOBAR','RIOBAMBA','CHIMBORAZO'),(200,'UNIDAD EDUCATIVA  POPULAR PARTICULAR A DISTANCIA \"JUAN MONTALVO\"','QUITO','PICHINCHA'),(201,'COLEGIO NACIONAL \"JOSE JULIAN ANDRADE\"','SAN GABRIEL','CARCHI'),(202,'TECNOLOGICO \"CARLOS  CISNEROS\"','CHIMBORAZO','RIOBAMBA'),(203,'COLEGIO NACIONAL MIXTO NOCTURNO  SALAMANCA','QUITO','PICHINCHA'),(204,'COLEGIO NACIONAL GALO PLAZA  LASSO','ECHEANDIA','BOLIVAR'),(205,'COLEGIO FISCAL NOCTURNO \"AB. JAIME ROLDOS AGUILERA\"','MONTALVO','LOS RIOS'),(206,'COLEGIO TECNICO DE AGRICULTURA \"SAN LORENZO\"','SAN LORENZO','ESMERALDAS'),(207,'COLEGIO PARTICULAR ARISTOTELES','QUITO','PICHINCHA'),(208,'COLEGIO NACIONAL \"ANGEL POLIBIO CHAVES\"','GUARANDA','BOLIVAR'),(209,'INSTITUTO TECNICO SUPERIOR POLICIA NACIONAL  ','QUITO ','PICHINCHA '),(210,'PARTICULAR MIXTO INTERAMERICANO','QUITO','PICHINCHA'),(211,'COLEGIO NACIONAL TECNICO FERNANDO DAQUILEMA','RIOBAMBA','CHIMBORAZO'),(212,'COLEGIO JULIO ERNESTO CELI ','LOJA ','LOJA '),(213,'COLEGIO NACIONAL EXPERIMENTAL SALCEDO','LATACUNGA','COTOPAXI'),(214,'COLEGIO RICARDO CORNEJO ','QUITO ','PICHINCHA'),(215,'COLEGIO NACIONAL \"DR. RICARDO CORNEJO ROSALES\"','QUITO','PICHINCHA'),(216,'RED EDUCATIVA UTUANA','LOJA','LOJA'),(217,'COLEGIO NACIONAL\"JOSE PERALTA\"','SALCEDO','COTOPAXI'),(218,'UNIDAD EDUCATIVA SAN PEDRO PASCUAL','QUITO','PICHINCHA'),(219,'UNIVERSIDAD CATOLICA DEL ECUADOR','QUITO','PICHINCHA'),(220,'COLEGIO NACIONAL DARIO GUEVARA MAYORGA','QUITO','PICHINCHA'),(221,'COLEGIO EXPERIMENTAL \"LUCIANO ANDRADE MARIN\"','QUITO','PICHINCHA'),(222,'COLEGIO NACIONAL BATZACON','RIOBAMBA','CHIMBORAZO'),(223,'SAN LUIS GONZAGA','QUITO','RUMIÑAHUI'),(224,'UNIVERSIDAD TECNOLOGICA AMERICA','QUITO','PICHINCHA'),(225,'COLEGIO A DISTANCIA \"SEGUNDO  TORRES\"','QUITO','PICHINCHA'),(226,'UNIDAD EDUCATIVA SALESIANA CARDENAL SPELLMAN','QUITO','PICHINCHA'),(227,'COLEGIO COMANDANTE GENERAL ATAHUALPA','QUITO','PICHINCHA'),(228,'COLEGIO MUNICIPAL ANTONIO JOSE DE SUCRE','QUITO','PICHINCHA'),(229,'MANUEL CORDOVA GALARZA','QUITO','PICHINCHA'),(230,'UNIDAD EDUCATIVA PARTICULAR A DISTANCIA CENTEBAD','PICHINCHA ','QUITO'),(231,'NACIONAL EXPERIMENTAL GABRIELA MISTRAL','QUITO','PICHINCHA'),(232,'COLEGIO PARTICULAR MIXTO \"JACINTO BURGOS PINARGOTE\"','PORTOVIEJO','MANABI'),(233,'COLEGIO NACIONAL NOCTURNO REPUBLICA DE MEXICO','QUITO','PICHINCHA'),(234,'COLEGIO INTERCULTURAL BILINGUE \" MAESTRO OSWALDO GUAYASAMIN CALERO\"','RIOBAMBA','CHIMBORAZO'),(235,'INSTITUTO TECNOLOGICO SUPERIOR BAÑOS','BAÑOS','TUGURAHUA'),(236,'UNIDAD EDUCATIVA MUNICIPAL \"QUITUMBE\"','QUITO','PICHINCHA'),(237,'COLEGIO PARTICULAR INTERNACIONAL','STO DOMINGO','STO DOMINGO DE LOS COLORADOS'),(238,'CIUDAD DE CARIAMANGA','CARIAMANGA ','LOJA'),(239,'CIUDAD CARIAMANGA','CARIAMANGA ','LOJA'),(240,'CIDUDAD CARIAMNAGA','LOJA','LOJA'),(241,'CIUDAD DE CARIAMANGA','LOJA','LOJA'),(242,'CIUDAD DE CARIAMNAGA','LOJA','LOJA'),(243,'COLEGIO  TECNICO \"MAGGY  INTERNACIONAL\"','QUITO','PICHINCHA'),(244,'COLEGIO 15 DE DICIEMBRE','QUITO','PICHINCHA'),(245,'UNIDAD EDUCATIVA \"SANTA CRUZ DE LA PROVIDENCIA\"','QUITO','PICHINCHA'),(246,'UNIDAD EDUCATIVA  CRISTIANA NEW LIFE','QUITO','PICHINCHA'),(247,'COLEGIO PARTICULAR JIM IRWIN','QUITO','PICHINCHA'),(248,'COLEGIO PARTICULAR \"JOSE  MARTI\"','QUITO','PICHINCHA'),(249,'COLEGIO PANAMERICANA','QUITO','PICHINCHA'),(250,'COLEGIO  NACIONAL EXP. CAP. \"EDMUNDO CHIRIBOGA\"','RIOBAMBA','CHIMBORAZO'),(251,'COLEGIO PARTICULAR 17 DE AGOSTO','QUITO','PICHINCHA'),(252,'ACADEMIA INTEGRAL BILINGUE ISAAC PITMAN','QUITO','PICHINCHA'),(253,'COLEGIO POPULAR A DISTANCIA \"JULIO CORTAZAR\"','QUITO','PICHINCHA'),(254,'COLEGIO NACIONAL TECNICO INDUSTRIAL \"JAIME ROLDOS AGUILERA\"','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(255,'UNIDAD  EDUCATIVA  MUNICIPAL\"OSWALDO  LOMBEYDA\"','QUITO','PICHINCHA'),(256,'INSTITUTO TECNOLOGICO SUPERIOR CINCO DE JUNIO','QUITO','PICHINCHA'),(257,'COLEGIO BILINGUE MODERNO','QUITO','PICHINCHA'),(258,'COLEGIO PARTICULAR MIXTO REPUBLICA DEL ECUADOR','ESMERALDAS ','ESMERALDAS'),(259,'COLEGIO  EL TABERNACULO','LATACUNGA','COTOPAXI'),(260,'COLEGIO NACIONAL \"CUTUGLAGUA\"','MACHACHI','PICHINCHA'),(261,'ACADEMIA NAVAL ALMIRANTE HOWARD','QUITO','PICHINCHA'),(262,'ACADEMIA  NAVAL ALMIRANTE HOWARD','QUITO','PICHINCHA'),(263,'ACADEMIA NAVAL ALMIRANTE HOWARD','PICHINCHA ','QUITO'),(264,'COLEGIO PARTICULAR SEMIPRESENCIAL HIGH SCHOOL SANTA MARIA','QUITO','PICHINCHA'),(265,'UNIVERSIDAD DE ESPECIALIDADES TURISTICAS','QUITO','PICHINCHA'),(266,'COLEGIO PARTICULAR  NUESTRA SEÑORA  DEL  CISNE','QUITO','PICHINCHA'),(267,'UNIDAD EDUCATIVA  A  DISTANCIA  DE BOLIVAR','GUARANDA','BOLIVAR'),(268,'COLEGIO PARTICULAR  \"SIGLO  XXI\"','QUITO','PICHINCHA'),(269,'UNIDAD EDUCATIVA CHILLANES','GUARANDA','BOLIVAR'),(270,'COLEGIO DE  BACHILLERATO PROCER JOSE PICOITA','LOJA','LOJA'),(271,'UNIVERSIDAD AUTONOMA  DE QUITO','QUITO','PICHINCHA'),(272,'COLEGIO NACIONAL TECNICO PROF.ANGEL JACINTO VILLARES ESPIN','CHILLANES','BOLIVAR'),(273,'COLEGIO NACIONAL \"ANDRES BELLO\"','QUITO','PICHINCHA'),(274,'COLEGIO TECNICO\"EDMUNDO CEVALLOS\"','LOJA','LOJA'),(275,'COLEGIO NACIONAL MIXTO \"DR RICARDO DESCALZI\"','RIOBAMBA','CHIMBORAZO'),(276,'COLEGIO NACIONAL SANTIAGO DE GUAYAQUIL','QUITO','PICHINCHA'),(277,'MONS.\" LUIS ALFONSO CRESPO CH.\"','AMALUZA','LOJA'),(278,'UNIDAD EDUCATIVA EXPERIMENTAL \"QUITO SUR\"','QUITO','PICHINCHA'),(279,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE TRANSITO AMAGUAÑA','QUITO','PICHINCHA'),(280,'COLEGIO NACIONAL JAIME DEL HIERRO','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(281,'COLEGIO TECNICO PARTICULAR \"JACQUES COUSTEAU\"','STO DOMINGO','STO DMGO DE LOS COLORADOS'),(282,'INSTITUTO TECNOLOGICO SUPERIOR JUAN DE VELASCO','CHIMBORAZO','RIOBAMBA'),(283,'COLEGIO NACIONAL NOCTURNO SEIS DE DICIEMBRE','QUITO','PICHINCHA'),(284,'UNIVERSIDAD TECNOLOGICA INDOAMERICA','AMBATO ','TUNGURAHUA'),(285,'COLEGIO PARTICULAR A DISTANCIA WIÑARINA','QUITO','PICHINCHA'),(286,'COLEGIO JESUS DE NAZARETH','QUITO','PICHINCHA'),(287,'INSTITUTO PEDAGOGICO \"DR. MISAEL ACOSTA SOLIS\"','BAÑOS','TUNGURAHUA'),(288,'COLEGIO PARTICULAR METROPOLITANO JOSE MILER SALAZAR','QUITO','PICHINCHA'),(289,'COLEGIO NACIONAL PROCER JOSE DE ANTEPARA ','VINCES','LOS RIOS '),(290,'COLEGIO TECNICO INDUSTRIAL\"DR. TRAJANO ITURRALDE','LATACUNGA','COTOPAXI'),(291,'COLEGIO NACIONAL \"ANGEL MODESTO PAREDES\"','QUITO','PICHINCHA'),(292,'COLEGIO FISCAL CESAR BORJA LAVAYEN','GUAYAQUIL','GUAYAS'),(293,'COLEGIO NACIONAL RAFAEL LARREA ANDRADE','QUITO','PICHINCHA'),(294,'SECAP','QUITO','PICHINCHA'),(295,'COLEGIO NACIONAL ELIAS CEDEÑO JERVES','SAN VICENTE','MANABI'),(296,'COLEGIO PARTICULAR \"  LUCA PACIOLO \"','QUITO','PICHINCHA'),(297,'COLEGIO PARTICULAR DE LAS AMERICAS','QUITO','PICHINCHA'),(298,'COLEGIO TECNICO AGROPECUARIO F. \" CHAQUIÑAN \"','LATACUNGA','COTOPAXI'),(299,'UNIDAD EDUCATIVA PANGUA','PANGUA','COTOPAXI'),(300,'COLEGIO NACIONAL PANGUA','PANGUA','COTOPAXI'),(301,'6 DE DICIEMBRE','VENTANAS','LOS RIOS'),(302,'COLEGIO NACIONAL NOCTURNO \"PRIMERO DE MAYO\"','QUITO','PICHINCHA'),(303,'UNIDAD EDUCATIVA  PARTICULAR A DISTANCIA \"JUAN MONTALVO\"','QUITO','PICHINCHA'),(304,'COLEGIO PARTICULAR A DISTANCIA \"JULIO CORTAZAR\"','QUITO','PICHINCHA'),(305,'COLEGIO  POPULAR A DISTANCIA SAN JUAN PABLO ','QUITO','PICHINCHA'),(306,'COLEGIO NACIONAL TECNICO  AGROPECUARIO \"SANTIAGO\"','SAN MIGUEL','BOLIVAR'),(307,'UNIDAD EDUCATIVA FISCAL JORGE MANTILLA ORTEGA','QUITO','PICHINCHA'),(308,'COLEGIO NACIONAL \"SANTA ROSA DE CERRITOS','SAN MIGUEL','BOLIVAR'),(309,'LA UNIDAD EDUCATIVA MUNICIPAL A DISTANCIA \"SUCRE\"','QUITO','PICHINCHA'),(310,'COLEGIO TECNICO INDUSTRIAL \"19 DE SEPTIEMBRE\"','SALCEDO','COTOPAXI'),(311,'COLEGIO TECNICO 21 DE ABRIL','RIOBAMBA','CHIMBORAZO'),(312,'UNIDAD EDUCATIVA SANTA MARIA D MAZZARELLO','QUITO','PICHINCHA'),(313,'COLEGIO PARTICULAR FRANCIS BACON','QUITO','PICHINCHA'),(314,'COLEGIO FISCAL MIXTO PATRIA ECUATORIANA','GUAYAQUIL','GUAYAS'),(315,'COLEGIO PARTICULAR \"GRAN MARISCAL SUCRE\"','QUITO','PICHINCHA'),(316,'COLEGIO NACIONAL \"SAN RAFAEL\"','QUITO','PICHINCHA'),(317,'COLEGIO NACIONAL TECNICO \"DIEZ DE ENERO\"','SAN MIGUEL','BOLIVAR'),(318,'COLEGIO PARTICULAR \"METROPOLITANO JOSE MILLER SALAZAR\"','QUITO','PICHINCHA'),(319,'COLEGIO NACIONAL \"CAMINO REAL\"','GUARANDA','BOLIVAR'),(320,'INSTITUTO  TECNOLOGICO \"RUMIÑAHUI \"','AMBATO ','TUNGURAHUA'),(321,'COLEGIO PARTICULAR A DISTANCIA \"NICOLAS ESCOBAR TAPIA\"','QUITO','PICHINCHA'),(322,'COLEGIO TECNICO TOACASO','LATACUNGA','COTOPAXI'),(323,'UNIDAD EDUCATIVA \"TEODORO GOMEZ DE LA TORRE\"','IBARRA','IMBABURA'),(324,'COLEGIO FISCAL MIXTO \"NARANJITO\"','NARANJITO','GUAYAS'),(325,'INSTITUTO TECNOLOGICO SUPERIOR \"TIRSO DE MOLINA\"','AMBATO ','TUNGURAHUA'),(326,'UNIDAD EDUCATIVA SAN LORENZO','SAN LORENZO','BOLIVAR'),(327,'UNIDAD EDUCATIVA EXPERIMENTAL \"COLEGIO MILITAR N°8 GRAL. JOSE MARIA DE VILLAMIL JOLY\"','GUAYAQUIL','GUAYAS'),(328,'UNIDAD EDUCATIVA \"VIDA NUEVA\"','QUITO','PICHINCHA'),(329,'COLEGIO NACIONAL NOCTURNO CHIMBO','CHIMBO','BOLIVAR'),(330,'COLEGIO CARDENAL CARLOS MARIA DE LA TORRES','QUITO','PICHINCHA'),(331,'COLEGIO NACIONAL MIXTO ANDRES MIXTO \"ANDRES GURITAVE\"','TADAY','CAÑAR'),(332,'UNIDAD EDUCATIVA A DISTANCIA \"SEGUNDO TORRES\"','QUITO','PICHINCHA'),(333,'UNIDAD EDUCATIVA HERMANO MIGUEL LA SALLE','QUITO','PICHINCHA'),(334,'COLEGIO NACIONAL \"JUAN  DE SALINAS\" ','SANGOLQUI','PICHINCHA'),(335,'EL COLEGIO DR GONZALO OLEAS ZAMBRANO','RIOBAMBA','CHIMBORAZO'),(336,'COLEGIO PARTICULAR \"INTERNACIONAL\"','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(337,'COLEGIO INTERCULTURAL BILINGÜE\"JATARI UNANCHA\"','ZUMBAHUA','COTOPAXI'),(338,'COLEGIO NACIO0NAL TECNICO TNTE. HUGO ORTIZ','QUITO','PICHINCHA'),(339,'COLEGIO NACIONAL MIXTO JORGE MANTILLA ORTEGA','QUITO','PICHINCHA'),(340,'UNIDAD EDUCATIVA A DISTANCIA DE COTOPAXI CONVENIO ME-CONFEDEC','LATACUNGA','COTOPAXI'),(341,'COLEGIO NACIONAL NOCTURNO\"REPUBLICA DE MEXICO\"','QUITO','PICHINCHA'),(342,'COLEGIO NACIONAL TECNICO JACINTO JIJON Y CAAMAÑO','QUITO','PICHINCHA'),(343,'COLEGIO NACIONAL TECNICO MIXTO \"JOSE PERALTA\"','QUITO','PICHINCHA'),(344,'COLEGIO NACIONAL TECNICO \"YARUQUI\"','QUITO','PICHINCHA'),(345,'UNIDAD EDUCATIVA A DISTANCIA ICAM-QUITO','QUITO','PICHINCHA'),(346,'UNIDAD EDUCATIVA PARTICULAR VIDA NUEVA','QUITO','PICHINCHA'),(347,'UNIDAD EDUCATIVA RINCON DEL SABER','QUITO','PICHINCHA'),(348,'COLEGIO UNIVERSITARIO\"MANUEL MARIA SANCHEZ\"','QUITO','PICHINCHA'),(349,'COLEGIO PARTICULAR \"INTERAMERICANO\"','QUITO','PICHINCHA'),(350,'COLEGIO  FLUMINENSE','PATRICIA PILAR','LOS RIOS'),(351,'COLEGIO NACIONAL TECNICO VICENTE ROCAFUERTE','MACHACHI','PICHINCHA'),(352,'COLEGIO EXPERIMENTAL E ISPED \"JUAN MONTALVO\"','QUITO','PICHINCHA'),(353,'UNIDAD EDUACTIVA FISCOMISIONAL HNO  ANGEL PASTRANA CORRAL','LOJA','LOJA'),(354,'COLEGIO MARIANO SAMANIEGO','CALVAS ','LOJA '),(355,'COLEGIO NACIONAL \"ELOY ALFARO\"','QUITO','PICHINCHA'),(356,'COLEGIO TECNICO PARTICULAR \"MUNDO NUEVO\"','QUITO','PICHINCHA'),(357,'UNIDAD EDUCATIVA A DISTANCIA DE CHIMBORAZO','PALLATANGA','CHIMBORAZO'),(358,'COLEGIO NACIONAL TECNICO \"VICENTE ROCAFUERTE\"','QUITO','PICHINCHA'),(359,'COLEGIO NACIONAL TECNICO MIXTO \"UNE\"','QUITO','PICHINCHA'),(360,'COLEGIO TECNICO INDUSTRIAL \"MIGUEL DE SANTIAGO\"','QUITO','PICHINCHA'),(361,'INSTITUTO TEGNOLOGICO SAN LORENZO','GUARANDA','BOLIVAR'),(362,'COLEGIO MENOR UNIVERSIDAD CENTRAL','QUITO','PICHINCHA'),(363,'UNIVERSIDAD TECNICA DE BABAHOYO','BABAHOYO','BABAHOYO'),(364,'COLEGIO NACIONAL NOCTURNO FEDERICO GONZALEZ SUAREZ','QUITO','PICHINCHA'),(365,'INSTITUTO TECNOLOGICO SUPERIOR NELSON TORRES','CAYAMBE','PICHINCHA'),(366,'ESCUELA POLITECNICA NACIONAL','QUITO','PICHINCHA'),(367,'COLEGIO POPULAR PARTICULAR A DISTANCIA ISRAEL','QUITO','PICHINCHA'),(368,'COLEGIO TECNICO AGROPECUARIO PROVINCIA DE LOS LAGOS','SAN FRANCISCO','IMBABURA'),(370,'COLEGIO PARTICULAR 27 DE FEBRERO','QUITO','PICHINCHA'),(371,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE \"NACION PURUHA\"','GALTE LAIME','CHIMBORAZO'),(372,'COLEGIO EXPERIMENTAL  PALTAS','CATACOCHA','LOJA'),(373,'COLEGIO NACIONAL EXPERIMENTAL MARIA ANGELICA IDROBO','QUITO','PICHINCHA'),(374,'UNIDAD EDUCATIVA JUAN MONTALVO FIALLOS','SIGCHOS ','COTOPAXI'),(375,'COLEGIO TECNICO INTERCULTURAL BILIGUE FISCOMISIONAL ABYA YALA','LATACUNGA','COTOPAXI'),(376,'COLEGIO NACIONAL EXPERIMENTAL AMAZONAS','QUITO','PICHINCHA'),(377,'UNIDAD EDUCATIVA ANGAMARCA','PUJILI','COTOPAXI'),(378,'COLEGIO UNIVERSITARIO MANUL MARIA SANCHEZ','QUITO','PICHINCHA'),(379,'COLEGIO JORGE MARTINEZ ACOSTA','SAN GABRIEL','CARCHI'),(380,'COLEGIO NACIONAL EXPERIMENTAL AMBATO','AMBATO ','AMBATO'),(381,'COLEGIO NACIONAL \"CHILLANES\"','CHILLANES','BOLIVAR'),(382,'LICEO MUNICIPAL FERNANDEZ MADRID','QUITO','PICHINCHA'),(383,'COLEGIO NACIONAL TARQUI','QUITO','PICHINCHA'),(384,'INSTITUTO TECNOLOGICO SUPERIOR CONSEJO PROVINCIAL DE PICHINCHA','QUITO','PICHINCHA'),(385,'COLEGIO NACIONAL TECNICO \"CAYAMBE\"','CAYAMBE','PICHINCHA'),(386,'INSTITUTO SUPERIOR TECNOLOGICO \"HISPANO AMERICA\"','AMBATO ','TUNGURAHUA'),(387,'COLEGIO FISCAL MIXTO \"PROVINCIA DE PICHINCHA\"','GUARANDA','BOLIVAR'),(388,'INSTITUTO TECNOLOGICO SUPERIOR \"ANDRES F. CORDOVA\"','QUITO','PICHINCHA'),(389,'COLEGIO NACIONAL \"EMILIO UZCATEGUI\"','QUITO','PICHINCHA'),(390,'COLEGIO NACIONAL MIXTO \"MANUEL CORDOVA GALARZA\"','QUITO','PICHINCHA'),(391,'COLEGIO TECNICO MONS MAXILIMILIANI SPILLER','TENA','NAPO'),(392,'COLEGIO TECNICO AGROPECUARIO \"DR. JUAN FRANCISCO ONTANEDA\"','CELICA','LOJA'),(393,'COLEGIO NACIONAL ANTISANA','QUITO','PICHINCHA'),(394,'COLEGIO PARTICULAR POPULAR A DISTANCIA LIBERTADOR ','RIOBAMBA ','CHIMBORAZO'),(395,'COLEGIO PARTICULAR REPÙBLICA DE CROACIA ','QUITO','PICHINCHA '),(396,'COLEGIO PARTICULAR \"CARDENAL SPINDOLA DE FE Y ALEGRIA\"','QUITO','PICHINCHA'),(397,'COLEGIO DE LIGA UNIDAD EDUCATIVA EXPERIMENTAL BILINGÜE','POMASQUI','PICHINCHA'),(398,'COLEGIO TECNICO POPULAR PARTICULAR A DISTANCIA \"JOSÉ MARTÍ\"','QUITO','PICHINCHA'),(399,'COLEGIO PARTICULAR NOCTURNO PIO XII','QUITO','PICHINCHA'),(400,'COLEGIO PARTICULAR MIXTO \"PROVINCIA DE GALAPAGOS\"','GUAYAQUIL','GUAYAS'),(401,'UNIVERSIDAD TECNICA PARTICULAR DE LOJA','QUITO','PICHINCHA'),(402,'COLEGIO DR CAMILO GALLEGOS DOMINGUEZ','MACAS','MORONA SANTIAGO'),(403,'COLEGIO TECNICO AGROPECUARIO CARLOS POMERIO ZAMBRANO','CHONE','PORTOVIEJO'),(404,'INSTITUTO TECNICO SUPERIOR BENITO JUAREZ','QUITO','PICHINCHA'),(405,'INSTITUTO TECNOLOGICO SUPERIOR PARTICULAR INTERCULTURAL BILINGÜE \"DON BOSCO\"','PIUJILI','COTOPAXI'),(406,'UNIDAD EDUCATIVA A DISTANCIA DE COTOPAXI','LATACUNGA','COTOPAXI'),(407,'EUGENIO ESPEJO','QUITO','PICHINCHA'),(408,'COLEGIO NACIONAL NOCTURNO \"DR. MODESTO CHAVEZ FRANCO\"','QUITO','PICHINCHA'),(409,'COLEGIO PARTICULA MARIA MAGDALENA','QUITO','PICHINCHA'),(410,'COLEGIO NACIONAL \" OCHO DE NOVIEMBRE \"','BALSAPAMBA','BOLIVAR'),(411,'COLEGIO NACIONAL \"PRIMERO DE MAYO\"','QUITO','PICHINCHA'),(412,'COLEGIO PARTICULAR \"PROVINCIA DE GALAPAGOS\"','GUAYAQUIL','GUAYAS'),(413,'COLEGIO NACIONAL EXPERIMENTAL \"PROVINCIA DE COTOPAXI\"','PUJILI','COTOPAXI'),(414,'COLEGIO TECNICO \"JUAN ABEL ECHEVERRIA\"','LATACUNGA','COTOPAXI'),(415,'UNIDAD EDUCATIVA A DISTANCIA DE LOJA','PALTAS','LOJA'),(416,'COLEGIO TECNICO SAN JOSE','QUITO ','PICHINCHA'),(417,'COLEGIO UNIVERSITARIO \"MANUEL MARIA SANCHEZ\"','QUITO','PICHINCHA'),(418,'COLEGIO NACIONAL TECNICO \"SAN PEDRO\"','GUARANDA','BOLIVAR'),(419,'COLEGIO DR. GONZALO OLEAS ZAMBRANO','RIOBAMBA','CHIMBORAZO'),(420,'COLEGIO DR. GONZALO OLEAS ZAMBRANO','PALLATANGA','CHIMBORAZO'),(421,'COLEGIO NACIONAL FEMENINO \"11 DE MARZO\"','QUITO','PICHINCHA'),(422,'COLEGIO EXPERIMENTAL E INSTITUTO SUPERIOR PEDAGOGICO \"JUAN MONTALVO\"','QUITO','PICHINCHA'),(423,'COLEGIO \" AGUSTO ARIAS \"','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(424,'COLEGIO \" AUGUSTO  ARIAS\"','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(425,'COLEGIO TECNICO MIXTO \"PASTORA ITURRALDE\"','SALCEDO','COTOPAXI'),(426,'COLEGIO NACIONAL \"PALTAS\" SECCION DIURNA Y  NOCTURNA','CATACOCHA','LOJA'),(427,'COLEGIO PARTICULAR  \"MARIA DOLORES LOJA PATIÑO\"','QUITO','PICHINCHA'),(428,'COLEGIO NACIONAL TECNICO MIXTO \"UNE\"','QUITO','PICHINCHA'),(429,'COLEGIO NACIONAL \"TEODORO GOMEZ DE LA TORRE\"','IBARRA','IMBABURA'),(430,'UNIDAD EDUCATIVA FISCOMISIONAL A DISTANCIA DE LOS RIOS ','BABAHOYO','LOS RIOS '),(431,'COLEGIO TECNICO PARTICULAR VIDA NUEVA ','QUITO','PICHINCHA'),(432,'COLEGIO TECNICO AGROINDUSTRIAL \"MORASPUNGO\"','PANGUA','COTOPAXI'),(433,'INSTITUTO TECNICO SUPERIOR  DE INFORMATICA ','QUITO','PICHINCHA'),(434,'UNIDAD EDUCATIVA ANDINO','QUITO','PICHINCHA'),(435,'UNIDAD EDUCATIVA A DISTANCIA DE PICHINCHA','QUITO','PICHINCHA'),(436,'INSTITUTO NACIONAL \"MEJIA\" NOCTURNO','QUITO','PICHINCHA'),(437,'UNIDAD EDUCATIVA PARTICULAR \"JUAN  MONTALVO\"','QUITO','PICHINCHA'),(438,'COLEGIO TECNICO SAN VICENTE','SAN VICENTE','MANABI'),(439,'COLEGIO TECNICO NACIONAL PASTOCALLE ','LATACUNGA','COTOPAXI'),(440,'COLEGIO TECNICO AGROPECUARIO MANUEL CARRION PINZANO','PUYANGO','LOJA'),(441,'COLEGIO TECNICO NACIONAL MIXTO \"MIGUEL ANGEL LEON PONTON\"','RIOBAMBA','CHIMBORAZO'),(442,'INSTITUTO TECNOLOGICO SUPERIOR INTERCULTURAL BILINGÜE \"DR. MANUEL NAULA SAGÑAY\"','RIOBAMBA','CHIMBORAZO'),(443,'COLEGIO NACIONAL \"PRIMERO DE ABRIL\"','LATACUNGA','COTOPAXI'),(444,'COLEGIO EXPERIMENTAL \"24 DE MAYO\"','QUITO','PICHINCHA'),(445,'UNIDAD EDUCATIVA COCAN','ALAUSI','CHIMBORAZO'),(446,'INSTITUTO TECNICO SUPERIOR \"LUIS N. DILLON\"','QUITO','PICHINCHA'),(447,'COLEGIO NACIONAL \"GRAL MARCO AURELIO SUBIA MARTINEZ\"','TANICUCHI','COTOPAXI'),(448,'UNIDAD EDUCATIVA \"PEDRO PABLO BORJA Y. Nº 1\"','QUITO','PICHINCHA'),(449,'COLEGIO NACIONAL TECNICO TOSAGUA','TOSAGUA','MANABI'),(450,'COLEGIO TECNICO AGROPECUARIO MACARA ','LOJA','LOJA'),(451,'COLEGIO PARTICULAR MIXTO CIENCIAS Y VIDA ','GUAYAQUIL','GUAYAS '),(452,'COLEGIO TECNICO ALFREDO  ALBORNOZ SANCHEZ','BOLIVAR','CARCHI'),(453,'ALM. JORGE CRUZ POLANCO','PICHINCHA ','QUITO'),(454,'COLEGIO NACIONAL TECNICO RAFAEL VASCONEZ GOMEZ ','LA MANA ','COTOPAXI '),(455,'INSTITUTO  TECNOLOGICO SUPERIOR BENITO JUAREZ ','QUITO','PICHINCHA'),(456,'COLEGIO FISCAL MIXTO PROVINCIA DE PICHINCHA ','GUAYAQUIL','GUAYAS '),(457,'COLEGIO NACIONAL DR. EMILIO USCATEGUI VESPERTINO ','QUITO','PICHINCHA '),(458,'COLEGIO DR. MIGUEL ANGEL ZAMBRANO ','QUITO','PICHINCHA'),(459,'COLEGIO NACIONAL TECNICO RAUL DELGADO GARAY','ESMERALDAS ','ESMERALDAS'),(460,'COLEGIO PARTICULAR A DISTANCIA HISPANOAMERICANO','GUAYAQUIL','GUAYAS'),(461,'COLEGIO FISCAL  SAN JOSE DE MINAS','QUITO ','PICHINCHA'),(462,'COLEGIO FISCAL \"NUEVE DE OCTUBRE\"','MACHALA','EL ORO'),(463,'SAN MIGUEL DE BOLIVAR','SAN MIGUEL','BOLIVAR'),(464,'INSTITUTO NORMAL SUPERIOR \"JUAN MONTALVO\"','QUITO','PICHINCHA'),(465,'COLEGIO NACIONAL SEGUNDO CUEVA CELI','CATACOCHA','LOJA'),(466,'COLEGIO OSCAR EFREN REYES','BAÑOS','BAÑOS '),(467,'UNIDAD EDUCATIVA FISCOMICIONAL A DISTANCIA DE BOLIVAR','GUARANDA','BOLIVAR'),(468,'UNIDAD EDUCATIVA FISCOMISIONAL A DISTANCIA DE BOLIVAR ','BOLIVAR ','GUARANDA '),(469,'COLEGIO FISCOMISIONAL SAGRADO CORAZON DE JESUS','ESMERALDAS ','ESMERALDAS'),(470,'COLEGIO A DISTANCIA \"MONSEÑOR LEONIDAS PROAÑO\"','AMBATO ','TUNGURAHUA'),(471,'COLEGIO NACIONAL PASA','AMBATO ','TUNGURAHUA '),(472,'COLEGIO NACIONAL MIXTO \"GONZALO ESCUDERO\"','QUITO','PICHINCHA'),(473,'COLEGIO NACIONAL TECNICO \"LICTO\"','RIOBAMBA','CHIMBORAZO'),(474,'COLEGIO PARTICULAR ACADEMIA BORJA N°3','QUITO','PICHINCHA'),(475,'UNIDAD  EDUCATIVA A DISTANCIA DE COTOPAXI','PANGUA','COTOPAXI'),(476,'COLEGIO PARTICULAR SAGRADO CORAZON DE JESUS','LATACUNGA','COTOPAXI'),(477,'DR. EUGENIO ESPEJO','CHILLANES','BOLIVAR'),(478,'COLEGIO NACIONAL \"CHILLANES\"','CHILLANES','BOLIVAR'),(479,'UNIVERSIDAD CENTRAL DEL ECUADOR ','QUITO ','PROVINCIA '),(481,'COLEGIO PARTICULAR UNITED KINGDOM','QUITO','PICHINCHA '),(482,'COLEGIO FISCAL MIXTO \"PABLO HANNIBAL VELA EGUEZ\"','GUAYAQUIL','GUAYAS'),(483,'INSTITUTO  TEGNOLOGICO INDUSTRIAL RAMON BARBA NARANJO','ÑAGRA','COTOPAXI'),(484,'COLEGIO NACIONAL PIMANPIRO','PIMAMPIRO','IMBABURA'),(485,'COLEGIO NACIONAL AIDA GALLEGOS DE MONCAYO','QUITO','PICHINCHA'),(486,'COLEGIO PARTICULAR MEDARDO ANGEL SILVA ','GUAYAQUIL','GUAYAS '),(487,'INSTITUTO PARTICULAR INTERCULTURAL BILINGUE DON BOSCO ','LATACUNGA','COTOPAXI'),(488,'INSTITUTO TECNICO SUPERIOR ISABEL DE GODIN ','RIOBAMBA ','CHIMBORAZO '),(489,'COLEGIO FISCAL JOSE DE LA CUADRA ','QUITO ','PICHINCHA'),(490,'COLEGIO PARTICULAR INSTA ','QUITO ','PICHINCHA '),(491,'UNIDAD EDUCATIVA  PARTICULAR JESUS DE NAZARETH','QUITO ','PICHINCHA'),(492,'UNIDAD EDUCATIVA FISCOMISIONAL A DISTANCIA \"JUAN JIMENEZ\"','LAGO AGRIO','SUCUMBIOS'),(493,'COLEGIO SAN PEDRO PASCUAL ','QUITO ','PICHINCHA'),(494,'COLEGIO ALFONSO LASO BERMEO ','QUITO ','PICHINCHA '),(495,'INSTITUTO TECNICO SUPERIOR DE TURISMO Y HOTELERIA INTERNACIONAL ITHI','QUITO','PICHINCHA'),(496,'INSTITUTO SUPERIOR BEATRIZ  CUEVA DE AYORA ','LOJA ','LOJA '),(497,'UNIVERSIDAD TECNOLOGICA EQUINOCCIAL','QUITO','PICHINCHA'),(498,'COLEGIO TECNICO AGROINDUSTRIAL MORASPUNGO ','LATACUNGA','COTOPAXI '),(499,'COLEGIO PENSIONADO MIXTO JOSE BEDON TOSCANO','QUITO','PICHINCHA '),(500,'COLEGIO NACIONAL NICOLAS INFANTE DIAZ','QUEVEDO ','LOS RIOS'),(501,'COLEGIO PARTICULAR LICEO MATOVELLE ','QUITO','PICHINCHA '),(502,'INSTITUTO TECNOLOGICO  SUPERIOR \"17 DE JULIO\"','IBARRA','IMBABURA'),(503,'POPULAR PARTICULAR VIRTUAL A DISTANCIA \"IBEROAMERICANO\"','PICHINCHA ','QUITO'),(504,'COLEGIO PARTICULAR LATINO','QUITO','PÌCHINCHA '),(505,'COLEGIO PARTICULAR PERPETUO SOCORRO','QUITO','PICHINCHA'),(506,'COLEGIO INTERCULTURAL BILINGUE JATARI UNANCHA ','LATACUNGA ','COTOPAXI '),(507,'COLEGIO NACIONAL MIXTO DR. CAMILO GALLEGOS TOLEDO ','QUITO','PICHINCHA '),(508,'INSTITUTO TECNICO SUPERIOR ANDRES F CORDOVA ','QUITO ','PICHINCHA'),(509,'COLEGIO TECNICO AGROPECUARIO  \"SAN  JUAN \"','SAN JUAN','CHIMBORAZO'),(510,'COLEGIO NACIONAL MIXTO 14 DE FEBRERO ','QUITO ','PICHINCA'),(511,'UNIDAD EDUCATIVA A DISTANCIA MONSEÑOR LEONIDAS PROAÑO ','QUEVEDO ','LOS RIOS '),(512,'COLEGIO PARTICULAR DE CAPACITACION POPULAR','QUITO ','PICHINCHA'),(513,'COLEGIO POPULAR PARTICULAR A DISTANCIA  JEAN PEAGET ','QUITO ','PICHINCHA'),(514,'COLEGIO NACIONAL TECNICO \"SIMON BOLIVAR\"','GUARANDA','BOLIVAR'),(515,'COLEGIO WILLIAN BLAKE ','QUITO ','PICHINCHA '),(516,'COLEGIO FISCAL TECNICO ARTURO BORJA JORNADA VESPERTINA ','QUITO','PICHINCHA '),(517,'BORJA MONTSERRAT','QUITO','PICHINCA'),(518,'COLEGIO PARTICULAR A DISTANCIA \"JUAN DELFIN FONSECA\"','AMBATO ','TUGURAHUA'),(519,'UNIDAD EDUCATIVA \"SUDAMERICANO\"','CUENCA ','AZUAY '),(520,'COLEGIO PARTICULAR THOMAS ALVA EDISON ','QUITO ','PICHINCHA'),(521,'LA UNIDAD EDUCATIVA MUNICIPAL QUITUMBE ','QUITO ','PICHINCHA'),(522,'COLEGIO TECNICO PARTICULAR \"JHON VELCK\" ','QUITO','PICHINCA'),(523,'COLEGIO  PARTICULAR \"SAN FERNANDO\"','QUITO','PICHINCHA'),(524,'COLEGIO NACIONALTECNICO AGROPECUARIO JOSE RODRIGUEZ LABANDERA','QUEVEDO ','LOS RIOS '),(525,'COLEGIO NACIONAL INGAPIRCA ','AZOGUEZ','CAÑAR '),(526,'COLEGIO PARTICULAR POLICIA NACIONAL ','QUITO ','PICHINCHA '),(527,'COLEGIO NACIONAL TECNICO REGULO DE MORA ','GUARANDA','BOLIVAR'),(528,'COLEGIO EXPERIMENTAL \"JUAN PIO MONTUFAR\"','QUITO','PICHINCHA'),(529,'COLEGIO PARTICULAR DAVID P. AUSUBEL ','QUITO','PICHINCHA'),(530,'UNIDAD  EDUCATIVA PARTICULAR A DISTANCIA \"VIEJO LUCHADOR\"','QUITO','PICHINCHA'),(531,'COLEGIO TECNICO NACIONAL  ALFREDO ALBORNOZ SANCHEZ','BOLIVAR','CARCHI'),(532,'COLEGIO PARTICULAR INTEGRACION ANDINA ','QUITO ','PICHINCHA'),(533,'COLEGIO TECNOLOGICO PICHINCHA ','SANTO DOMINGO DE LOS SACHILAS ','SANTO DOMINGO DE LOS COLORADOS'),(534,'COLEGIO NACIONAL JOSE JUALIAN ANDRADE ','CARCHI ','TULCAN '),(535,'UNIDAD EDUCATIVA PARTICULAR ANDREW ','QUITO ','PICHINCHA'),(536,'COLEGIO FISCAL MIXTO PROVINCIA DE COTOPAXI ','LATACUNGA ','COTOPAXI '),(537,'COLEGIO TECNICO A DISTANCIA \"JUAN JOSE FLORES\"','RIOBAMBA','CHIMBORAZO'),(538,'COLEGIO NACIONAL MIXTO \"SANTO DOMINGO DE LOS COLORADOS\"','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(539,'UNIVERSIDAD DE GUAYAQUIL','GUAYAQUIL','GUAYAS'),(540,'COLEGIO FISCAL MIXTO \"QUINCE DE OCTUBRE\"','NARANJAL','GUAYAS'),(541,'COLEGIO DE BACHILLERATO \"CHAGUARPAMBA\"','CHAGUARPAMBA','LOJA'),(542,'INSTITUTO SUPERIOR TECNOLOGICO CONSEJO PROVINCIAL DE PICHINCHA','QUITO','PICHINCHA'),(543,'COLEGIO TECNICO INDUSTRIAL \"DR. TRAJANO NARANJO ITURRALDE\"','LATACUNGA','COTOPAXI'),(544,'COLEGIO PARTICULAR BILINGÜE \"MODERNO\"','QUITO','PICHINCHA'),(545,'INSTITUTO SUPERIOR  TECNOLOGICO TIRSO  DE MOLINA ','AMBATO ','TUNGURAHUA'),(546,'COLEGIO NACIONAL LA CONCORDIA ','LA CONCORDIA ','SANTO DOMINGO DE LOS TSACHILAS'),(547,'INSTITUTO TECNOLOGICO SUPERIOR \"FEDERICO GONZALEZ SUAREZ\"','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(548,'COLEGIO PARTICULAR ACADEMIA MILITAR DEL VALLE ','SANGOLQUI','PICHINCHA'),(549,'COLEGIO NACIONAL ANTONIO CARRILLO MOSCOSO','PILLARO','TUNGURAHUA'),(550,'COLEGIO MENOR UNIVERSIDAD CENTRAL','QUITO','PICHINCHA'),(551,'COLEGIO CATORCE DE JULIO ','LATACUNGA','COTOPAXI'),(552,'INSTITUTO SUPERIOR TECNOLOGICO RAMON BARBA NARANJO','LATACUNGA','COTOPAXI'),(553,'COLEGIO NACIONAL TECNICO MIXTO JOSE PERALTA ','ESMERALDAS ','ESMERALDAS '),(554,'COLEGIO TECNICO SUPERIOR DON BOSCO  EXTENSION ZUMBAHUA','PUJILI','COTOPAXI '),(555,'COLEGIO NACIONAL UYUMBICHO','QUITO','PICHINCHA'),(556,'COLEGIO NACIONAL \"LATACUNGA\"','SIGCHOS ','COTOPAXI'),(557,'UNIVERSIDAD NACIONAL DE CHIMBORAZO','RIOBAMBA','CHIMBORAZO'),(558,'COLEGIO NACIONAL \"BENIGNO MALO\"','CUENCA ','AZUAY '),(559,'COLEGIO MARIA DE NAZARETH','QUITO','PICHINCHA'),(560,'COLEGIO NACIONAL EL CARMEN ','EL CARMEN ','MANABI'),(561,'COLEGIO ELECTRONICO PICHINCHA POPULAR ','QUITO ','PICHINCHA'),(562,'INSTITUTO JUAN BOSCO','LORCA','MURCIA'),(563,'COLEGIO PARTICULAR \"PRINCESA SHAYARINA\"','MACHACHI','PICHINCHA'),(564,'COLEGIO INTERNACIONAL DEL PACIFICO','MANTA','MANABI'),(565,'UNIDAD EDUCATIVA SAGRADOS CORAZONES DE RUMIPAMBA','QUITO','PICHINCHA'),(566,'COLEGIO NACIONAL DE POMASQUI','QUITO','PICHINCHA'),(567,'COLEGIO NACIONAL MIXTO POMASQUI','QUITO','PICHINCA'),(568,'DR. CARLOS CUEVA TAMARIZ','QUITO','PICHINCHA'),(569,'COLEGIO NACIONAL GENERAL PINTAG','PINTAG','PICHINCHA'),(570,'COLEGIO NACIONAL CONOCOTO','CONOCOTO','PICHINCHA'),(571,'JOSE MARIA VELAZ, S.J.','QUITO','PICHINCHA'),(572,'COLEGIO GENERAL ANTONIO ELIZALDE ','TRIUNFO ','GUAYAS '),(573,'COLEGIO FISCAL GRAL. VICENTE ANDA AGUIRRE','MILAGRO','GUAYAS'),(574,'UNIVERSIDAD POLITECNICA SALESIANA','QUITO','PICHINCHA'),(575,'INSTITUTO TECNOLOGICO SUPERIOR  \"AGUIRRE ABAD\"','MONTALVO','LOS RIOS'),(576,'COLEGIO INTERCULTURAL BILINGUE \"CIMA\"','LATACUNGA','COTOPAXI'),(577,'COLEGIO  PARTICULAR \"SAN ANTONIO DE PADUA\"','QUITO','PICHINCHA'),(578,'COLEGIO PARTICULAR \"JOSE MARIA VELAZ\" DE FE Y ALEGRIA','QUITO','PICHINCHA'),(579,'COLEGIO NACIONAL TECNICO REGULO DE MORA','SAN MIGUEL','BOLIVAR'),(580,'COLEGIO NACIONAL \"SAN JOSE\" DE GUAYTACAMA','LATACUNGA','COTOPAXI'),(581,'COLEGIO NACIONAL NOCTURNO \"SIMON BOLIVAR\"','CALCETA','MANABI'),(582,'UNIDAD EDUCATIVA TECNICA INTERCULTURAL BILINGUE CAPITAN \"GIOVANNI CALLES LASCNO\"','QUITO','PICHINCHA'),(583,'COLEGIO NACIONAL TECNICO \"10 DE ENERO\"','SAN MIGUEL ','BOLIVAR'),(584,'COLEGIO PARTICULAR DE CAPACITACION POPULAR','QUITO ','PICHINCHA'),(585,'UNIVERCIDAD DEL ECUADOR ','QUITO ','PICHINCHA '),(586,'UNIVERSIDAD CENTRAL DEL ECUADOR ','QUITO ','PICHINCHA'),(587,'COLEGIO NACIONAL TECNICO \"TENIENTE HUGO ORTIZ\"','QUITO','PICHINCHA'),(588,'COLEGIO NACIONAL \"REMIGIO GEO GOMEZ GUERRERO\"','HUAQUILLAS','EL ORO'),(589,'COLEGIO NACIONAL NOCTURNO \"JULIO ISAAC ESPINOSA OCHOA\"','LOJA','LOJA'),(590,'IES CALDERON DE LA BARCA','ESPAÑA','MADRID'),(591,'INSTITUTO SUPERIOR DE MUSICA INES COBO DONOSO ','PUJILI','COTOPAXI '),(592,'COLEGIO TRANSITO AMAGUAÑA ','QUITO ','PICHINCHA'),(593,'INSTITUTO TECNOLOGICO OTAVALO','OTAVALO','IMBABURA'),(594,'COLEGIO NACIONAL MIXTO \"ANGEL BENJAMIN RIQUELME\"','QUITO','PICHINCHA'),(595,'INSTITUTO SUPERIOR TECNOLOGICO JAPON','QUITO','PICHINCHA'),(596,'COLEGIO TECNICO NACIONAL \"VICTOR MANUEL GUZMAN\"','IBARRA','IMBABURA'),(597,'COLEGIO PARTICULAR ACROPOLIS','QUITO','PICHINCHA'),(598,'COLEGIO PARTICULAR \"DR. JOSE MARIA VIVAR CASTRO\"','LOJA','LOJA'),(599,'COLEGIO TECNICO AGROPECUARIO\"PUERTO QUITO\"','PUERTO QUITO','PICHINCHA'),(600,'COLEGIO FISCAL MIXTO\" PROVINCIA DE PICHINCHA\"','GUAYAQUIL','GUAYAS'),(601,'COLEGIO PARTICULAR NUEVO ECUADOR ','SANGOLQUI ','PICHINCHA '),(602,'COLEGIO FISCAL NOCTURNO \"REPUBLICA DE MEXICO\"','QUITO','PICHINCHA'),(603,'COLEGIO NACIONAL \"WALTER SERRANO BATALLAS\"','UZHCURRUMI','EL ORO'),(604,'COLEGIO TECNOLOGICO SUPERIOR SHIMIATUK KUNAPAK JATUN KAPARI','SIMIATUG','BOLIVAR'),(605,'COLEGIO PARTICULAR \"JOSE MARIA VELEZ\"','QUITO','PICHINCHA'),(606,'COLEGIO TECNICO AGROPECUARIO \"PUCARA\"','PUCARA','AZUAY '),(607,'INSTITUTO NORMAL \"JUAN MONTALVO\"','QUITO','PICHINCHA'),(608,'COLEGIO TECNICO NACIONAL \"MANTA\"','MANTA','MANABI'),(609,'INSTITUTO NORMAL SUPERIOR N. 7 ','PUJILI','COTOPAXI '),(610,'INSTITUTO TECNO. BENITO JUAREZ NOCTURNA ','QUITO','PICHINCHA '),(611,'COLEGIO TEC. NOC. MAGALY MASSON DE VALLE CARRERA ','CHONE ','MANABI'),(612,'COLEGIO PARTICULAR A DISTANCIA \"ALFREDO PEREZ CHIRIBOGA\"','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(613,'COLEGIO NACIONAL PEDRO CARBO','GUARANDA','BOLIVAR'),(614,'COLEGIO NACIONAL EXPERIMENTAL \"PEDRO VICENTE MALDONADO\"','RIOBAMBA','CHIMBORAZO'),(615,'COLEGIO FISCOMISIONAL \"MARISTA\"','CATACOCHA','LOJA'),(616,'COLEGIO NACIONAL \"RAUL ANDRADE','PICHINCHA ','QUITO'),(617,'COLEGIO MIXTO PABLO HANNIBAL VELA EGUEZ','GUAYAQUIL','GUAYAS'),(618,'COLEGIO FISCAL CUTUGLAGUA','MEJIA','PICHINCHA'),(619,'UNIDAD EDUCATIVA TECNICO EXPERIMENTAL MITAD DEL MUNDO','QUITO','PICHINCHA'),(620,'COLEGIO FISCAL MIXTO \"LA INDUSTRIA\"','CATARAMA','LOS RIOS'),(621,'COLEGIO FICAL JUAN EMILIO MURILLO LANDIN','GUAYAQUIL','GUAYAS'),(622,'COLEGIO PARTICULAR MIXTO \"MANUEL ANDRADE URETA\"','PORTOVIEJO','MANABI'),(623,'COLEGIO SAN JUAN BOSCO','MURSIA','LORCA'),(624,'COLEGIO \"DR. CAMILO GALLEGOS TOLEDO\"','QUITO','PICHINCHA'),(625,'INSTITUTO TECNOLOGICO SAN PABLO DE ATENAS','BOLIVAR','GUARANDA '),(626,'MARIA EUGENIA CORDOVEZ CAICEDO DE DURAN BALLEN','QUITO','PICHINCHA'),(627,'UNIDAD EDUCATIVA MIXTA BILINGUE DEL VALLE','QUITO','PICHINCHA'),(628,'COLEGIO PARTICULAR WILLIAM BLAKE','MACHACHI','PICHINCHA'),(629,'COLEGIO FISCAL TECNICO \"DR. CARLOS CUEVA TAMARIZ\"','GUAYAQUIL','GUAYAS'),(630,'COLEGIO DE BACHILLERATO CARLOS GARBAY MONTESDEOCA','ALAMOR','LOJA'),(631,'COLEGIO TECNICO AGRICOLA \"30 DE SEPTIEMBRE\"','PURUNUMA','LOJA '),(632,'COLEGIO PARTICULAR MIXTO SAN FRANCISCO DE QUITO','QUITO','PICHINCHA'),(633,'COLEGIO \"LIC. MIGUEL ANTOLIANO SALINAS JARAMILLO\"','LOJA','EL ORO'),(634,'LICEO EMPRESARIAL','QUITO','PICHINCHA'),(635,'COLEGIO PARTICULAR FERNANDO SAVATER','QUITO','PICHINCHA'),(636,'COLEGIO TECNICO AGROPECUARIO \"QUILANGA\"','LOJA','LOJA'),(637,'UNIVERSIDAD TECNICA DE AMBATO','AMBATO ','TUNGURAHUA'),(638,'COLEGIO NACIONAL \"PENIPE\"','PENIPE','CHIMBORAZO'),(639,'COLEGIO TECNICO PARTICULAR POPULAR \"CENEPA\"','QUITO','PICHINCHA'),(640,'COLEGIO FISCAL  MIXTO \"ELOY ALFARO\"','QUITO','PICHINCHA'),(641,'COLEGIO FISCAL \"ISMAEL PROAÑO ANDRADE\"','MACHACHI','PICHINCHA'),(642,'COLEGIO NACIONAL MIXTO \"CORINA PARRAL DE VELASCO IBARRA\"','GUARANDA','BOLIVAR'),(643,'COLEGIO PARTICULAR NOCTURNO \"LA INMACULADA\"','LOJA','LOJA'),(644,'COLEGIO NACIONAL \"PICIAHUA\"','PICIAHUA','TUNGURAHUA'),(645,'COLEGIO \"MARIANO SAMANIEGO\"','CARIAMANGA ','LOJA'),(646,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"ALFREDO PAREJA DIEZCANSECO\"','QUITO','PICHINCHA'),(647,'COLEGIO NACIONALTECNICO \"ONCE DE NOVIEMBRE\"','TINGO','COTOPAXI'),(648,'INSTITUTO TECNICO DR. JOSE OCHOA LEON ','PASAJE ','EL ORO '),(649,'COLEGIO NACIONAL TECNICO JOSE PERALTA ','ESMERALDAS ','ESMERALDAS '),(650,'JOSE MARIA VELAZ EXT 35 A SOLANDA ','QUITO ','PICHINCA'),(651,'COLEGIO PARTICULARINTEGRACION TECNICA EDUCATIVA \"I.T.E\"','GUAYAQUIL','GUAYAS'),(652,'COLEGIO POPULAR GENERAL \"ELOY ALFARO\"','SAN GABRIEL','CARCHI'),(653,'COLEGIO PARTICULAR MIXTO NOCTURNO \"ANGEL TEOFILO CHAVEZ R\"','QUITO','PICHINCHA'),(654,'COLEGIO NACIONAL \"LUIS FERNANDO RUIZ','LATACUNGA','COTOPAXI'),(655,'COMIL COMBATIENTES DE TAPI','RIOBAMBA','CHIMBORAZO'),(656,'INSTITUTO SUPERIOR DR MISAEL ACOSTA SOLIS','RIOBAMBA','CHIMBORAZO'),(657,'COLEGIO NACIONAL TECNICO MIXTO \"DR. MANUEL BENJAMIN CARRION MORA\"','QUITO','PICHINCHA'),(658,'INSTITUCION EDUCATIVA MACHACHI','MACHACHI','PICHINCHA'),(659,'COLEGIO FISCOMISIONAL TECNICO AGROPECUARIO PADRE MIGUEL GAMBOA','ORELLANA','FRANCISCO DE ORELLANA'),(660,'UNIDAD EDUCATIVA COLOMBO ECUATORIANO','SUCUMBIOS','LAGOAGRIO'),(661,'COLEGIO NACIONAL \"SAN MIGUEL DE LOS BANCOS\"','SAN MIGUEL DE LOS BANCOS','PICHINCHA'),(662,'COLEGIO TECNICO AGROPECUARIO TENIENTE CORONEL LAURO GUERRERO','LOJA','LOJA'),(663,'COLEGIO NACIONAL FELIX GRANJA','GUARANDA','BOLIVAR'),(664,'INSTITUCION EDUCATIVA JUAN MONTALVO','QUITO','PICHINCHA'),(665,'UNIDAD EDUCATIVA A DISTANCIA DE PICHINCHA \"EXTENSION DOMINGO SAVIO\"','QUITO','PICHINCHA'),(666,'COLEGIO NACIONAL \"VELASCO IBARRA\"','GUAMOTE','CHIMBORAZO'),(667,'ACADEMIA MILITAR MIGUEL ITURRALDE N°2','QUITO','TUMBACO'),(668,'COLEGIO FISCAL \"DR. LEONIDAS ORTEGA MOREIRA\"','GUAYAQUIL','GUAYAS'),(669,'COLEGIO DE BACHILLERATO \"LA MANA\"','LA MANA ','COTOPAXI'),(670,'COLEGIO PARTICULAR \"COMPUINFORMATICA\"','QUITO','PICHINCHA'),(671,'COLEGIO NACIONAL EXPERIMENTAL FEMENINO \"ESPEJO\"','QUITO','PICHINCHA'),(672,'COLEGIO PARTICULAR \"INTERNACIONAL DEL PACIFICO\"','SANTO DOMINGO','SANTO DOMINGO DE LOS COLORADOS'),(673,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"SAN JUAN PABLO II\"','QUITO','PICHINCHA'),(674,'COLEGIO MILITAR N°13','LATACUNGA','COTOPAXI'),(675,'COLEGIO GRAL \"MARCO AURELIO SUBIA MARTINEZ\"','TANICUCHI','CHIMBORAZO'),(676,'COLEGIO TECNICO NOCTURNO \"GALAPAGOS\"','RIOBAMBA','CHIMBORAZO'),(677,'COLEGIO FISCOMICIONAL DOMINGO CELI','CATACOCHA','LOJA'),(678,'COLEGIO NACIONAL MIXTO 20 DE NOVIEMBRE','COTOPAXI','LATACUNGA'),(679,'COLEGIO PARTICULAR MISIONERO \" ELIOT THOMAS \" ','GUAMANI','PICHINCHA'),(680,'COLEGIO TECNICO A DISTANCIA \"CLAUDIO MALO GONZALEZ\"','CUENCA ','AZUAY '),(681,'COLEGIO \"EMILIO BOWEN ROGGIERO\"','MANTA','MANABI'),(682,'UNIDAD EDUCATIVA ALOASI','LATACUNGA','COTOPAXI'),(683,'INSTITUCION EDUCATIVA SEGUNDO TORRES','LATACUNGA','COTOPAXI'),(684,'COLEGIO MIXTO PARTICULAR \"GRANCOLOMBIANO\"','GUAYAQUIL','GUAYAS'),(685,'COLEGIO TECNICO INTERCULTURAL BILINGUE \"EL CHAQUIÑAN\"','LATACUNGA','COTOPAXI'),(686,'COLEGIO NACIONAL  LEOVIGILDO LOAYZA LOAYZA','PIÑAS','EL ORO'),(687,'UNIDAD EDUCATIVA EXPERIMENTAL FAE N. 1  QUITO','QUITO','PICHINCHA'),(688,'COLEGIO NACIONAL 5 DE JUNIO','QUITO','PICHINCHA'),(689,'COLEGIO NACIONAL \" SAN ANDRES \"','RIOBAMBA','CHIMBORAZO'),(690,'COLEGIO NOCTURNO \"REPUBLICA DE MEXICO\"','QUITO','PICHINCHA'),(691,'COLEGIO PEDRO FERMIN CEVALLOS','AMBATO ','TUNGURAHUA'),(692,'UNIDAD EDUCATIVA MUNICIPAL DEL MILENIO BICENTENARIO','QUITO','PICHINCHA'),(693,'COLEGIO TEC. AGROP. VICTR MANUEL PEÑAHERRERA','LA UNION','ESMERALDAS'),(694,'INEPE','QUITO','PICHINCHA'),(695,'INSTITUTO TECNICO SUPERIOR \"RIOBAMBA\"','RIOBAMBA','CHIMBORAZO'),(696,'COLEGIO PARTICULAR MIXTO \"GENERAL PACO MONCAYO\"','GUAYAQUIL','GUAYAS'),(697,'COLEGIO TECNICO MIGUEL SANCHEZ ASTUDILLO','ZARUMA','EL ORO'),(698,'COLEGIO NACIONAL \"RIOBAMBA\"','RIOBAMBA','CHIMBORAZO'),(699,'COLEGIO PARTICULAR A DISTANCIA STA. CRUZ','GUAYAQUIL','GUAYAS'),(700,'COLEGIO NACIONAL FEDERICO GONZALEZ SUAREZ ','ALAUSI','ALAUSI '),(701,'COLEGIO NACIONAL \"10 DE AGOSTO\"','MONTALVO','LOS RIOS'),(702,'COLEGIO NACIONAL DE SEÑORITAS \"IBARRA\"','IBARRA','IMBABURA'),(703,'INSTITUTO TECNICO SUPERIOR JUAN DE VELAZCO','RIOBAMBA','CHIMBORAZO'),(704,'COLEGIO NACIONAL JOSE MARIA ESTRADA COELLO','BABAHOYO','LOS RIOS'),(705,'COLEGIO NACIONAL TECNICO \"ATAHUALPA\"','AMBATO ','TUNGURAHUA'),(706,'JUAN CARLOS I, REY DE ESPAÑA','ESPAÑA','VALENCIA'),(707,'COLEGIO PARTICULAR DE SEÑORITAS REPUBLICA DEL ECUADOR','OTAVALO','IMBABURA'),(708,'INSTITUTO SUPERIOR PEDAGOGICO \"BELISARIO QUEVEDO\"','LATACUNGA','COTOPAXI'),(709,'COLEGIO UNIVERSITARIO \"ODILO AGUILAR\"','QUITO','PICHINCHA'),(710,'UNIDAD EDUC. EXP. FISCOMISIONAL A DISTANCIA \"JUAN R. JIMENEZ H.\"','LAGO AGRIO','SUCUMBIOS'),(711,'COLEGIO NACIONAL \"CINCO DE JUNIO\"','QUITO ','PICHINCHA '),(712,'LEONARDO PONCE POZO','QUITO','PICHINCHA'),(713,'COLEGIO NOCTURNO MIXTO  \"SIMON BOLIVAR\"','PUERTO BOLIVAR','MACHALA'),(715,'COLEGIO NACIONAL \"SAN GUISEL ALTO\"','RIOBAMBA','CHIMBORAZO'),(716,'COLEGIO NOCTURNO \"PIO XII\" ANEXO A \"LA PROVIDENCIA\"','QUITO','PICHINCHA'),(717,'COLEGIO PARTICULAR \"INTERNACIONAL\"','STO DOMINGO','STO DMGO DE LOS COLORADOS'),(718,'ACADEMIA ELIA LIUT','MACHACHI','PICHINCHA'),(719,'UNIDAD EDUCATIVA PARTICULAR \"SANTA DOROTEA\"','QUITO','PICHINCHA'),(720,'COLEGIO SALESIANO \"DON BOSCO\"  LA TOLA','QUITO','PICHINCHA'),(721,'COLEGIO NACIONAL \"TUMBACO\"','TUMBACO','PICHINCHA'),(722,'INSTITUTO TECNICO SUPERIOR CARLOS CISNEROS','RIOBAMBA','CHIMBORAZO'),(723,'COLEGIO NACIONAL NEPTALI SANCHO JARAMILLO','AMBATO','TUNGURAHUA'),(724,'TECNICO INDUSTRIAL VIDA NUEVA','QUITO','PICHINCHA'),(725,'COTOPAXI MARCAMANTA JATUN YACHANA HUASI \"JATARI UNANCHA\" ','PUJILI','COTOPAXI'),(726,'COLEGIO NACIONAL TECNICO \" LA MAGDALENA \"','PICHINCHA ','QUITO '),(727,'UNIDAD EDUCATIVA FISC. TEC. \"PACIFICO CEMBRENOS\"','SUCUMBIOS','SUCUMBIOS'),(728,'COLEGIO NACIONAL TECNICO \"12 DE FEBRERO\"','JOYA DE LOS SACHAS','ORELLANA'),(729,'COLEGIO MUNICIPAL DE BACHILLERATO POPULAR \"JOSE RICARDO CHIRIBOGA VILLAGOMEZ\"','QUITO','PICHINCHA'),(730,'INSTITUTO TECNICO SUPERIOR \"ALOASI\"','MEJIA','ALOASI'),(731,'COLEGIO TECNICO INTERCULTURAL BILINGÜE \"EL CHAQUIÑAN\"','LATACUNGA','COTOPAXI'),(732,'COLEGIO NACIONAL \"AUGUSTO SOLORZANO HOYOS\"','BABAHOYO','BABAHOYO'),(733,'COLEGIO NACIONAL POLIVALENTE \"JUAN DE SALINAS\"','SANGOLQUI','PICHINCHA'),(734,'INSTITUTO TECNOLOGICO AGROPECUARIO \"SIMON RODRIGUEZ\"','LATACUNGA','COTOPAXI'),(735,'INSTITUTO SUPERIOR PEDAGOGICO \"MANUELA CAÑIZARES\"','QUITO','PICHINCHA'),(736,'COLEGIO NACIONAL TECNICO \"MIGUEL ANGEL CORRAL\"','SALATI','EL ORO'),(737,'INSTITUCION EDUCATIVA TECNICO SUCRE','QUITO','PICHINCHA'),(738,'COLEGIO NACIONAL MIXTO \"18 DE OCTUBRE\"','PORTOVIEJO','MANABI'),(739,'INSTITUCION EDUCATIVA ECUADOR','QUITO','PICHINCHA'),(740,'INSTITUTO TECNOLOGICO SUPERIOR GUARANDA','GUARANDA','BOLIVAR'),(741,'UNIDAD EDUCATIVA SAN PEDRO','GUANUJO','GUARANDA '),(742,'INSTITUTO TECNOLOGICO SUPERIOR LUIS NAPOLEON DILLON','QUITO','PICHINCHA'),(743,'UNIDAD EDUCATIVA PARTICULAR \"JOSUE\"','QUITO','PICHINCHA'),(744,'COLEGIO NACIONAL DR. TRAJANO NARANJO JACOME ','LATACUNGA','INSINLIVI'),(745,'COLEGIO NACIONAL  \"BENITO JUAREZ \"','QUITO ','PICHINCHA'),(746,'COLEGIO NACIONAL \"BENJAMIN CARRION\"','QUITO','PICHINCHA'),(747,'UNIDAD EDUCATIVA ANGEL VILLARES ESPIN','BOLIVAR','GUARANDA '),(748,'COLEGIO TECNICO FORESTAL DR. ZOILO RODRIGUEZ','TACAMOROS ','LOJA'),(749,'UNIDAD EDUCATIVA  \"LA PROVIDENCIA\"','QUITO','PICHINCHA'),(750,'UNIDAD EDUCATIVA \" QUITO LUZ DE AMERICA \"','QUITO','PICHINCHA'),(751,'UNIDAD EDUCATIVA MONS ALBERTO ZAMBRANO PALACIOS','LOJA','LOJA'),(752,'COLEGIO PARTICULAR  MARIANO NEGRETTE','MEJIA','PICHINCA'),(753,'COLEGIO NACIONAL \"CAHUASQUI\"','IBARRA','IMBABURA'),(754,'COLEGIO PARTICULAR \"QUITO\"','QUITO','PICHINCHA'),(755,'COLEGIO NACIONAL \"JOSE RAFAEL BUSTAMANTE\"','QUITO','PICHINCHA'),(756,'COLEGIO NACIONAL MIXTO TARQUI','QUITO','PICHINCHA'),(757,'COLEGIO INSTITUTO \"PEREZ PALLARES\"','QUITO','PICHINCHA'),(758,'INSTITUTO EDUCATIVO LEIBNITZ','QUITO','PICHINCHA'),(759,'COLEGIO TOACASO','LA TACUNGA','COTOPAXI'),(760,'COLEGIO NORMAL EXPERIMENTAL \"CARLOS ZAMBRANO','QUITO','PICHINCHA'),(761,'COLEGIO NACIONAL MIXTO \"SIMON PLATA TORRES\"','QUININDE','ESMERALDAS'),(762,'COLEGIO NACIONAL TECNICO \"PASAJE\"','PASAJE ','EL ORO'),(763,'COLEGIO PARTICULAR MIXTO \"JULIO AYON\"','GUAYAQUIL','GUAYAS'),(764,'COLEGIO FISCAL \"SEIS DE OCTUBRE\"','VENTANAS','LOS RIOS'),(765,'COLEGIO NACIONAL DE SEÑORITAS \"QUEVEDO\"','QUEVEDO ','LOS RIOS'),(766,'UNIDAD DE FORMACION ARTESANAL FISCAL \"ANA MAC -AULIFFE\"','QUITO','PICHINCHA'),(767,'COLEGIO NACIONAL ABELARDO MONCAYO','ATUNTAQUI','IMBABURA'),(768,'UNIDAD EDUCATIVA A DISTANCIA DE COTOPAXI (CONVENIO MECD-CONFEDEC)','LATACUNGA','COTOPAXI'),(769,'COLEGIO NACIONAL \"EDUARDO SALAZAR GOMEZ\"','PIFO','PICHINCHA'),(770,'COLEGIO \" VICTOR MANUEL PEÑAHERRERA\"','IBARRA','IMBABURA'),(771,'COLEGIO NACIONAL \"ING. EDUARDO PAZMIÑO BARCIONA\"','PASAJE ','EL ORO'),(772,'COLEGIO NACIONAL \"OTAVALO\"','OTAVALO','IBARRA'),(773,'COLEGIO NACIONAL \"26 DE OCTUBRE\"','SHUSHUFINDI','SUCUMBIOS'),(774,'COLEGIO PARTICULAR A DISTANCIA \" VIDA NUEVA \"','QUITO','PICHINCHA'),(775,'COLEGIO MIXTO PARTICULAR \"FRANCISCO DE ORELLANA\"','QUITO','PICHINCHA'),(776,'UNIDAD EDUCATIVA  \"PAULO VI\"','QUITO','PICHINCHA'),(777,'COLEGIO NACIONAL MIXTO \"ABDON CALDERON\"','QUITO','PICHINCHA'),(778,'UNIDAD EDUCATIVA A DISTANCIA MANABI','SUCRE','MANABI'),(779,'COLEGIO NACIONAL \"JOSE MARIA VELASCO IBARRA\"','QUITO','PICHINCHA'),(780,'COLEGIO NACIONAL AGROPECUARIO MANUEL CARRION PINZANO','LOJA','LOJA'),(781,'COLEGIO POPULAR PARTICULAR A DISTANCIA DE CAPACITACION DEL PACIFICO','QUITO','PICHINCHA'),(782,'COLEGIO PARTICULAR A DISTANCIA REPUBLICA DE ARGENTNA','LA MANA ','COTOPAXI'),(783,'GENERAL ALBERTO GALLO','SALCEDO','COTOPAXI'),(784,'SAN MIGUEL BETHLEMITAS','SAN MIGUEL','BOLIVAR'),(785,'INSTITUTO TECNOLOGICO\"BOLIVAR\"  ','TULCAN','TULCAN '),(786,'COLEGIO TECNICO POPULAR PARTICULAR A DISTANCIA \" JOSE PERALTA\"','CONOCOTO','PICHINCHA'),(787,'COLEGIO NACIONAL MIXTO 23 DE ABRIL','GUARANDA','BOLIVAR'),(788,'INSTITUTO TECNOLOGICO  \" BENITO JUAREZ\"','QUITO','PICHINCHA'),(789,'INSTITUTO TECNOLOGICO SUPERIOR PARTICULAR INTERCULTURAL BILINGUE \"DON BOSCO\"','LATACUNGA','COTOPAXI'),(790,'UNIDAD EDUCATIVA PABLO SEXTO','QUITO','PICHINCHA'),(791,'UNIDAD EDUCATIVA PAULO SEXTO','QUITO','PICHINCHA'),(792,'COLEGIO NACIONAL \"5 DE JUNIO\"','MANTA','MANABI'),(793,'COLEGIO TÉCNICO FISCAL POPULAR \"AMPARITO ARGUELLO NAVARRO\"','SIGCHOS ','COTOPAXI'),(794,'16 DE MAYO','QUINSALOMA','LOS RIOS'),(795,'16 DE JULIO','QUINSALOMA','LOS RIOS'),(796,'DANTE ALIGHIRI','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(797,'UNIDAD EDUCATIVA BERNARDO VALDIVIESO','LOJA','LOJA'),(798,'ITSPET INSTITUTO PEDAGOGICO ALFREDO PEREZ GUERRERO','SAN PABLO DE LAGO ','IMBABURA'),(799,'COLEGIO NACIONAL \"VEINTIUNO DE ABRIL\"','LATACUNGA','COTOPAXI'),(800,'COLEGIO PARTICULAR ADVENTISTA GEDEON','QUITO','PICHINCHA'),(801,'COLEGIO PARTICULAR LOYOLA DEL VALLE','CONOCOTO','PICHINCHA'),(802,'UNIDAD EDUCATIVA MUNICIPAL DEL MILENIO BICENTENARIO','QUITO','PICHINCA'),(803,'UNIDAD EDUCATIVA MUNICIPAL DEL MILENIO BICENTENARIO','QUITO','PICHINCHA'),(804,'COLEGIO TECNICO NACIONAL \"DR. FACUNDO VELA\"','GUARANDA ','BOLIVAR'),(805,'EL COLEGIO PARTICULAR MIXTO NOCTURNO \" REPUBLICA DEL ECUADOR \"','ESMERALDAS ','ESMERALDAS'),(806,'UNIDAD EDUCATIVA DEL MILENIO \"CACIQUE TUMBALA\"','LATACUNGA','COTOPAXI'),(807,'COLEGIO PARTICULAR TECNICO INDUSTRIAL \" PEDRO VICENTE MALDONADO \"','QUITO','PICHINCHA'),(808,'COLEGIO FISCAL EN CIENCIAS \"JUAN MONTALVO\"','MACHALA','EL ORO'),(809,'COLEGIO MUNICIPAL \"JUAN WISNETH\"','QUITO','PICHINCHA'),(810,'COLEGIO PARTICULAR AGROPECUARIA \"GENOVEVA GERMAN\"','MACHACHI','PICHINCHA'),(811,'INSTITUCION EDUCATIVA \"SEBASTIAN DE BENALCAZAR\"','QUITO','PICHINCHA'),(812,'COLEGIO MIXTO FISCOMICIONAL \"HERMANO MIGUEL \" LA SALLE','TULCAN','CARCHI'),(813,'COLEGIO PARTICULAR A DISTANCIA SEGUNDO ANGEL TAPIA','QUITO','PICHINCHA'),(814,'PROVINCIA DE CHIMBORAZO','PALLATANGA','CHIMBORAZO'),(815,'INSTITUTO TECNOLOGICO LUIS  ULPIANO DE LA TORRE','COTACACHI','IMBABURA'),(816,'COLEGIO NACIONAL DE AGRICULTURA \"LAS NAVES\"','LAS NAVES','BOLIVAR'),(817,'UNIDAD EDUCATIVA PARTICULAR MIXTA \"MARIA ANDREA\"','BABAHOYO','LOS RIOS'),(818,'COLEGIO PARTICULAR RUDOLF STEINER','QUITO','PICHINCA'),(819,'COLEGIO FERNANDEZ SALVADOR VILLAVICENCIO PONCE','QUITO','PICHINCHA'),(820,'UNIDAD EDUCATIVA \"ECUADOR PATRIA MIA\"','QUITO','PICHINCHA'),(821,'UNIDAD EDUCATIVA EXPERIMENTAL INDIGENA INTERCULTURAL BILINGÛE SHUAR-ACHUAR \"YAMARAM TSAWAA','SUCUA','MORONA SANTIAGO'),(822,'UNIDAD EDUCATIVA VICENTE LEÓN','COTOPAXI','LATACUNGA'),(823,'INSTITUTO SUPERIOR TECNOLOGICO \" INTEGRACION ANDINA\"','QUITO','PICHINCHA'),(824,'COLEGIO PARTICULAR \"FEDERICO GAUSS\"','QUITO','PICHINCHA'),(825,'COLEGIO PARTICULAR \"LEONIDAS PROAÑO\"','QUITO','PICHINCHA'),(826,'COLEGIO DE BACHILLERATO 8 DE DICIEMBRE','LOJA','LOJA'),(827,'COLEGIO TECNICO \"REINALDO MIÑO\"','SANTA ROSA','TUGURAHUA'),(828,'COLEGIO TECNICO FEBRES CORDERO','GUAYAQUIL','GUAYAS'),(829,'INSTITUTO TECNOLOGICO SUPERIOR INTERCULTURAL BILINGUE \"SHIMIATUKKUNAPAK JATUN KAPARI\"','SIMIATUG','BOLIVAR'),(830,'COLEGIO NACIONAL SAN JOSE DE ORITO','PUTUMAYO','COLOMBIA'),(831,'COLEGIO TECNICO \"GUSTAVO BECERRA ORTIZ\"','LAS VILLEGAS','ESMERALDAS'),(832,'COLEGIO NACIONAL \" GENERAL PINTAG\" ','QUITO','PICHINCHA'),(833,'CEPA MUIGUEL DE CERVANTES','DAIMIEL','CIUDAD REAL'),(834,'UNIDAD EDUCATIVA ANEXA A LA UNIVERSIDAD NACIONAL DE LOJA','LOJA','LOJA'),(835,'COLEGIO SAN VICENTE DE PAUL','CONOCOTO','PICHINCHA'),(836,'UNIDAD EDUCATIVA LAS AMERICAS DEL VALLE','QUITO','PICHINCHA'),(837,'COLEGIO PARTICULAR LOS ALPES','QUITO','PICHINCHA'),(838,'COLEGIO TECNICO \"JUAN XXIII\"','TENA','NAPO'),(839,'INSTITUTO TECNOLOGICO SUPERIOR DANIEL ALVAREZ BURNEO','LOJA','LOJA'),(840,'CENTRO EDUCATIVO LICEO DEL SUR','QUITO','PICHINCHA '),(841,'EPISCOPAL CHIMBACALLE','QUITO','PICHINCHA'),(842,'COLEGIO NACIONAL JUAN MONTALVO','ESMERALDAS ','ESMERALDAS'),(843,'UNIDAD EDUCATIVA A DISTANCIA DE PICHINCHA','PEDRO VICENTE MALDONADO','PICHINCHA'),(844,'COLEGIO PEDRO ZAMBRANO IZAGUIRRE','QUITO','PICHINCHA'),(845,'COLEGIO NACIONAL JOSE MEJIA DEL VALLE','QUITO','PICHINCHA'),(846,'COLEGIO  FISCAL RUMIÑAHUI','SANGOLQUI','PICHINCA'),(847,'COLEGIO WALTER SERRANO BATALLAS','PASAJE ','EL ORO'),(848,'COLEGIO TECNICO FISCOMISIONAL LEONARDO MURIALDO','AMBATO ','TUNGURAHUA'),(849,'COLEGIO  PARTICULAR MIXTO VESPERTINO \"NUESTRO MUNDO\"','GUAYAQUIL','GUAYAS'),(850,'COLEGIO NACIONAL MIXTO \"VALLE HERMOSO\"','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(853,'TECNICO SUCRE','QUITO','PICHICHA'),(855,'TIWINTZA','QUITO','PICHINCHA'),(856,'COLEGIO NACIONAL \"PACAYACU\"','PACAYACU','SUCUMBIOS'),(857,'COLEGIO HISPANOAMERICANO','QUITO','PICHICHA'),(858,'COLEGIO TECNICO  NACIONAL  CARLOS CONCHA TORRES','ESMERALDAS ','ESMERALDAS'),(859,'COLEGIO NACIONAL \"15 DE AGOSTO\"','RIOBAMBA','CHIMBORAZO'),(860,'COLEGIO NACIONAL \"MARISTA DE MACARA\"','MACARA','LOJA'),(861,'COLEGIO FISCAL TECNICO \"FERNANDO DOBRONSKY OJEDA\"','SALINAS','GUAYAS'),(862,'COLEGIO GIMNASIO LAA SALETTE','BOGOTA','CUNDINAMARCA'),(863,'COLEGIO FISCAL TECNICO JOAQUIN GALLEGOS LARA','GUAYAQUIL','GUAYAS'),(864,'UNIDAD EDUCATIVA MONSEÑOR LEONIDAS PROAÑO','RIOBAMBA','CHIMBORAZO'),(865,'COLEGIO NACIONAL JORGE ALVAREZ','AMBATO ','TUNGURAHUA'),(866,'COLEGIO PARTICULAR REMANSO DE AMOR','QUITO','PICHINCHA'),(867,'COLEGIO PARTICULAR CRISTIANO REMANSO DE AMOR','QUITO','PICHINCHA'),(868,'UNIDAD EDUCATIVA FISCOMISIONAL A DIST. MONS. VICENTE MAYA','MACHALA','EL ORO'),(869,'INSTITUTO  TECNOLOGICO SUPERIOR CARIAMANGA','CARIAMANGA ','LOJA'),(870,'NACIONAL EXPERIMENTAL CARLOS ZAMBRANO','QUITO','PICHINCHA'),(871,'COLEGIO PARTICULAR MIXTO \"AMERICANO\"','ESMERALDAS ','ESMERALDAS'),(872,'UNIDAD EDUCATIVA  NAPO','LAGO AGRIO','SUCUMBIOS'),(873,'COLEGIO DE BACHILLERATO FISCAL  \"6 DE DICIEMBRE\" NOCTURNO','QUITO','PICHINCHA'),(874,'COLEGIO MILITAR N0 10 ABDON CALDERON','QUITO','PICHINCHA'),(875,'COLEGIO NACIONAL 24 DE JULIO','QUITO','PICHINCHA'),(876,'COLEGIO NACIONAL TECNICO MIXTO UNE ','QUITO','PICHINCHA'),(877,'COLEGIO NACIONAL TECNICO PAQUISHA','PIÑAS','EL ORO'),(878,'COLEGIO AGROPECUARIO MANGAHURCO','LOJA','LOJA'),(879,'COLEGIO PARTICULAR DON BOSCO','QUITO','PICHINCHA'),(880,'COLEGIO PARTICULAR JIM IRWIN','QUITO','PICHINCHA'),(881,'COLEGIO POPULAR A DISTANCIA CICE','QUITO','PICHINCHA'),(882,'COLEGIO FISCAL MIXTO DR. JORGEN ICAZA CORONEL','GUAYAQUIL','GUAYAS'),(883,'COLEGIO NACIONAL MIXTO \"CELICA\"','PEDRO VICENTE MALDONADO','PICHINCHA'),(884,'UNIDAD EDUCATIVA TECNICA VIDA NUEBA','QUITO ','PICHINCHA'),(885,'COLEGIO NACIONAL CHILLANES','CHILLANES','BOLIVAR'),(886,'LA INSTITUCION EDUCATIVA SAN MARINO','QUITO','PICHINCHA'),(887,'SAGRADOS CORAZONES DEL CENTRO','QUITO','PICHINCHA'),(888,'INSTITUCION EDUCATIVA SAGRADOS CORAZONEZ DEL CENTRO','QUITO','PICHINCHA'),(889,'COLEGIO PARTICULAR BOLIVAR','CALUMA','BOLIVAR'),(890,'INSTITUTO SUPERIOR TECNOLOGICO \"JUAN FRANCISCO MONTALVO\"','AMBATO ','TUGURAHUA'),(891,'UNIDAD EDUCATIVA FISCOMISIONAL TECNICO ECUADOR','QUITO ','PICHINCHA'),(892,'COLEGIO PARTRICULAR RAFAEL MORAN VALVERDE','QUITO','PICHINCHA'),(893,'COLEGIO \"ALFONSO LASO BERMEO\"','QUITO','PICHINCHA'),(894,'INSTITUCION EDUCATIVA LENIN SCHOOL','LATACUNGA','COTOPAXI'),(895,'COLEGIO NACIONAL FELIX GRANJA GAMAZO','GUARANDA','BOLIVAR'),(896,'COLEGIO PARTICULAR ITALIA','QUITO','PICHINCHA'),(897,'CONSERVATORIO  DE MUSICA DE QUITO ','QUITO','PICHINCHA'),(898,'COLEGIO NACIONAL MIXTO \"20 DE NOVIEMBRE\" ','ESMERALDAS ','ESMERALDAS'),(899,'COLEGIO PARTICULAR A DISTANCIA \"JOSE MARTI\"','QUITO','PICHINCHA'),(900,'I.E.S. RIVERA DE JALON','SORIA','SORIA'),(901,'UNIDAD EDUCATIVA \"VICENTE ANTE AGUIRRE\"','LOJA','LOJA'),(902,'COLEGIO  PARTICULAR LA PORCIUNCULA','LOJA','LOJA'),(903,'UNIDAD EDUCATIVA PARTICULAR JUAN MONTALVO','QUITO','PICHINCHA'),(904,'MARGAERIDA SHIRGUE','MADRID','ESPAÑA'),(905,'COLEGIO NACIONAL  TECNICO \"PUELLARO\"','QUITO','PICHINCHA'),(906,'DANTE ALIGHIERI','SANTO DOMINGO DE LOS SACHILAS ','SANTO DOMINGO DE LOS COLORADOS'),(907,'COLEGIO NACIONAL MIXTO DELBERTVELASQUEA ARTEAGA','MANABI','CHONE'),(908,'INSTITUTO TECNOLOGICO MARIANO SAMANIEGO','QUITO','PICHINCHA'),(909,'INSTITUTO  SUPERIOR CENTRAL TECNICO','QUITO','PICHINCHA'),(910,'GENERAL DE POLICIA JORGE POVEDA ZUÑIGA','SAQUISILI','COTOPAXI'),(911,'COLEGIO NACIONAL OCHO DE NOVIEMBRE','PIÑAS','EL ORO'),(912,'COLEGIO NACIONAL OCHO DE NOVIEMBRE','PIÑAS','EL ORO'),(913,'COLEGIO NELSON ISAURO TORRES','CAYAMBE','PICHINCHA'),(914,'INSTITUTO TECNICO SUPERIOR LOS SHYRIS','QUITO','PICHINCHA'),(915,'INSTITUTO TECNOLOGICO SUPERIOR DE ARTES VISUALES','QUITO','PICHINCHA'),(916,'COLEGIO EXPERIMENTAL \"LUIS VARGAS TORRES\"','ESMERALDAS ','ESMERALDAS'),(917,'COLEGIO INTERCULTURAL BILINGUE','PUJILI','COTOPAXI'),(918,'COLEGIO INTERCULTURAL BILINGUE JATARI UNANCHA','LATACUNGA','COTOPAXI'),(919,'COLEGIO INTERCULTURAL BILINGUE JATARI UNANCHA','LATACUNGA','COTOPAXI'),(920,'INSTITUCION EDUCATIVA JOSE DE LA CUADRA','QUITO','PICHINCHA'),(921,'INSTITUTO TECNICO CONSEJO PROVINCIAL DE PICHINCHA','QUITO','PICHINCHA'),(922,'INSTITUTO TECNICO CONSEJO PROVINCIAL DE PICHINCHA','QUITO','PICHINCHA'),(923,'UNIDAD EDUCATIVA INTERCULTURAL \"BILINGUE INTERANDINA\"','RIOBAMBA','CHIMBORAZO'),(924,'COLEGIO TECNICO TOACASO','LATACUNGA','COTOPAXI'),(925,'UNIDAD EDUCATIVA \"SAN FRANSISCO DE ASIS\"','QUITO','PICHINCHA'),(926,'COLEGIO NACIONAL MIXTO PROF RAMON BEDOYA NAVIA ','ESMERALDAS ','ESMERALDAS '),(927,'UNIDAD EDUCATIVA TECNICA VIDA NUEVA','QUITO','PICHINCHA'),(928,'COLEGIO NACIONAL DR. GONZALO OLEAS ZAMBRANO','PALLATANGA','CHIMBORAZO'),(929,'NACIONAL HIPATIA CARDENAS DE BUSTAMANTE','QUITO','PICHINCHA'),(930,'UNIDAD EDUCATIVA PARTICULARA DISTANCIA \"DR. EUGENIO ESPEJO\" ','ECHEANDIA','BOLIVAR'),(931,'LUIS ALFREDO MARTINEZ','QUITO','PICHINCHA'),(932,'COLEGIO PARTICULAR \" ECUADORIAN COLLEGE\"','QUITO','PICHINCHA'),(933,'PARTICULAR MIXTO VICENTE LEON ','GUAYAQUIL','GUAYAS'),(934,'NACIONAL NOCTURNA \"PRESIDENTE ISIDRO AYORA\"','EL PLATEADO ','LOJA'),(935,'DR. CLOTARIO PAZ PALADINES','LOJA','LOJA'),(936,'COLEGIO COOP. DE EDUCACION NOCTURNO \"SANTIAGO DE PILLARO\"','PILLARO','TUGURAHUA'),(937,'UNIDAD PARTICULAR TECN. \"PRINCESA DE GALES\"','PICHINCHA ','QUITO'),(938,'COLEGIO LUIS TELLO','ESMERALDAS ','ESMERALDAS'),(939,'I.S.PED.I.B JAIME ROLDOS AGUILERA','RIOBAMBA','CHIMBORAZO'),(940,'COLEGIO TECNICO EXPERIMENTAL DE AVIACION CIVIL','QUITO','PICHINCHA'),(941,'COLEGIO NACIONAL PIMAMPIRO','PIMAMPIRO','IMBABURA'),(942,'COLEGIO FISCOMICIONAL \"SAGRADO CORAZON\"','ESMERALDAS ','ESMERALDAS'),(943,'COLEGIO PARTICULAR CRISTIANA KYRYOS','QUITO','PICHICHA'),(944,'COLEGIO SANTA MARIA D. MAZZARELLO','QUITO ','PICHINCHA'),(945,'COLEGIO PARTICULAR \"ERNEST HEMINGWAY\"','QUITO','PICHINCHA'),(946,'INSTITUTO SUPERIOR TECNOLOGICO FISCOMISIONAL \"JUAN XXIII\"','YANTZAZA','ZAMORA CHINCHIPE'),(947,'COLEGIO TECNICO \"SARA M. BUSTILLOS DE ATIAGA','RIOBLANCO','COTOPAXI'),(948,'COLEGIO PARTICULAR ESPAÑA','QUITO ','PICHINCHA'),(949,'COLEGIO NACIONAL FEMENINO 10 DE AGOSTO','QUITO','PICHINCHA'),(950,'COLEGIO PARTICULAR IBEROAMERICANO','SANTO DOMINGO DE LOS SACHILAS ','SANTO DOMINGO '),(951,' UNIVERSIDAD ESTATAL DE BOLIVAR','GUARANDA','BOLIVAR'),(952,'COLEGIO PARTICULAR \"SULTANA DE LOS ANDES ','QUITO','PICHINCHA'),(953,'INSTITUTO SUPERIOR \"B. CAVALIERI\"','MILAN','LOMBARDIA'),(954,'COLEGIO NACIONAL TECNICO \"PUEBLO NUEVO\"','PORTOVIEJO','MANABI'),(955,'COLEGIO \"GUILLERMO BUSTAMANTE CEVALLOS\"','SHUSHUFINDI','SUCUMBIOS'),(956,'INSTITUTO TECNICO NACIONAL \"HUAQUILLAS\"','HUAQUILLAS','EL ORO'),(957,'COLEGIO  CIUDAD DE VALENCIA','VALENCIA','LOS RIOS'),(958,'COLEGIO NACIONAL TECNICO ATACAMES','ESMERALDAS ','ESMERALDAS'),(959,'INSTITUCION EDUCATIVA  \"SAN JUAN BOSCO\"','QUITO','PICHINCHA'),(960,'COLEGIO PARTICULAR \"TECNOLOGICO PICHINCHA\"','QUITO','PICHINCHA'),(961,'COLEGIO NACIONAL \"VICENTE ANDA AGUIRRE\"','PEDRO VICENTE MALDONADO','PICHINCHA'),(962,'ACUERDO MINISTERIAL','QUITO','PICHINCHA'),(963,'UNIDAD EDUCATIVA MIXTA ISABEL TOBAR N° 2','QUITO','PICHINCHA'),(964,'COLEGIO NACIONAL ALAUSI','ALAUSI','CHIMBORAZO'),(965,'COLEGIO MUNICIPAL MIXTO VESPERTINO \"TABUGA\"','MANABI','PORTOVIEJO'),(966,'UNIVERSIDAD CRISTIANA LATINOAMERICANA','QUITO','PICHINCHA'),(967,'COLEGIO PARTICULAR CORAZON DE MARIA','TUMBACO','PICHINCHA'),(968,'COLEGIO PILOTO DEMOSTRATIVO \"AMELIA GALLEGOS DIAZ\"','RIOBAMBA','CHIMBORAZO'),(969,'COLEGIO NACIONAL TECNICO \"SHUSHUFINDI\"','SHUSHUFINDI','SUCUMBIOS'),(970,'UNIDAD EDUCATIVA SIMON BOLIVAR ','QUITO','PICHINCHA'),(971,'UNIDAD EDUCATIVA FISCOMICIONAL TECNICO \"ECUADOR\"','QUITO','LOS BANCOS'),(972,'TECNICO PARTICULAR \"RICARDO JARAMILLO\"','QUITO','PICHICHA'),(973,'COLEGIO NACIONAL 6 DE OCTUBRE','VENTANAS','LOS RIOS'),(974,'NACIONAL PRIMERO DE MAYO','PUYO','PASTAZA'),(975,'INSTITUTO TECNOLOGICO SUPERIOR AGROPECUARIO \"TRES DE MARZO\"','CHIMBO','BOLIVAR'),(976,'UNIDAD EDUCATIVA MUNICIPAL SUCRE MODALIDAD SEMIPRESENCIAL ','QUITO','PICHINCHA'),(977,'INSTITUTO TECNOLOGICO VIDA NUEVA','QUITO ','PICHINCHA'),(978,'COLEGIO PARCTICULAR CHALLENGER','QUITO','PICHINCHA'),(979,'COLEGIO NACIONAL TECNICO \"LIGDANO CHAVEZ\"','QUITO','PICHINCHA'),(980,'COLEGIO PROCER ANTONIO AGUIRRE','QUITO ','PICHINCHA'),(981,'UNIDAD EDUCATIVA PARTICULAR \"I.T.C. AMAZONAS\"','STO DOMINGO','STO DOMINGO DE LOS COLORADOS'),(982,'COLEGIO NACIONAL DELBERT VELAQUEZ ARTEAGA','CHONE','MANABI'),(983,'COLEGIO HEROES DEL CENEPA','CAYAMBE','PICHICHA'),(984,'COLEGIO TECNICO \"MARTHA BUCARAN DE ROLDOS\"','QUITO','PICHINCHA'),(985,' UNIDAD EDUCATIVA \"BETHEL VALLE\"','QUITO','RUMIÑAHUI'),(986,'COLEGIO PARTICULAR \"PIO JARAMILLO ALVARADO\"','QUITO','PICHINCHA'),(987,'UNIDAD EDUCATIVA \"TIWINZA','QUINSALOMA','LOS RIOS'),(988,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE FISCOMISIONAL PACHAYACHACHIK','RIOBAMBA','CHIMBORAZO'),(989,'COLEGIO FISCAL LOS GUAYACANES ','QUEVEDO ','LOS RIOS'),(990,'COLEGIO NACIONAL CARLOS JULIO AROSEMENA TOLA','AROSEMENA TOLA','NAPO'),(991,'COLEGIO FISCAL LUXEMBURGO','QUITO','PICHINCHA'),(992,'UNIDAD EDUCATIVA PARTICULAR LA SALLE ','QUITO ','PICHINCHA'),(993,'COLEGIO PARTICULAR POPULAR \" JULIO CORTAZAR \"','QUITO ','PICHINCHA'),(994,'COLEGIO E.P.A EIBAR','EIBAR','GUIPUSCO'),(995,'COLEGIO TECNICO AGROPECUARIO \" FRANCISCO A. DAZA ZAMBRANO \"','MANABI ','JUNIN'),(996,'UNIDAD EDUCATIVA DR. GONZALO TAPIA GAIBOR','LAS NAVES','BOLIVAR'),(997,'UNIDAD EDUCATIVA PARTICULAR PAUL DIRAC ','QUITO ','PICHINCHA'),(998,'COLEGIO NACIONAL VILLA FLORIDA','SANTO DOMINGO ','SANTO DOMINGO DE LOS TSACHILAS'),(999,'COLEGIO NACIONAL \"VERACRUZ\"','PUYO','PASTAZA'),(1000,'COLEGIO NACIONAL MALCHINGUI ','QUITO ','PICHINCHA'),(1001,'INSTITUTO TECNICO SUPERIOR  LUIS NAPOLEON DILLON ','QUITO ','PICHINCHA'),(1002,'UNIDDAD ERDUCATIVA PARTICULAR A DISTANCIA \" ECUADOR \"','QUITO ','PICHINCHA '),(1003,'COLEGIO FISCAL TECNICO RICAURTE ','RICAURTE ','LOS RIOS '),(1004,'COLEGIO PARTICULAR MIXTO \"ZAPALLO\"','ZAPALLO','CHONE'),(1005,'COLEGIO MUNICIPAL 9 DE OCTUBRE','QUITO','PICHINCHA'),(1006,'COLEGIO FISCAL MIXTO \"DR. JOSE MARIA EGAS\"','GUAYAQUIL','GUAYAS'),(1007,'COLEGIUO FISCAL LIBERTAD DE TIEMBRE','ESMERALDAS ','ESMERALDAS '),(1008,'INSTITUTO TECNOLOGICO SUPERIOR DE TECNOLOGIAS APROPIADAS ','QUITO ','PICHINCHA '),(1009,'COLEGIO NACIONAL MIXTO \"SAN LUIS\"','SAN LUIS DE PAMBIL','BOLIVAR '),(1010,'COLEGIO NACIONAL TECNICO \" 27 DE FEBRERO \"','LOJA ','LOJA'),(1011,'JOSE JULIAN ANDRADE','SAN GABRIEL','CARCHI'),(1012,'INSTITUTO SUPERIOR DE MUSICA \"GRAL. VICENTE ANDA AGUIRRE','RIOBAMBA','CHIMBORAZO'),(1013,'IRFEYAL-UNIDAD EDUCATIVA \"JOSE MARIA VELAZ S.J\" ','QUITO','PICHINCHA'),(1014,'UNIDAD EDUCATIVA FISCAL TOTORAS','ALAUSI','CHIMBORAZO'),(1015,'COLEGIO A DISTANCIA \"REPUBLICA DE ARGENTINA\"','CUENCA ','AZUAY '),(1016,'COLEGIO PARTICULAR DE EDUCACION POPULAR A ADISTANCIA BUENAS NUEVAS ','LATACUNGA ','COTOPAXI '),(1017,'UNIDAD EDUCATIVA PARTICULAR A DISTANCIA\" JUAN MONTALVO \"','ORELLANA','PUERTO VAQUERIZO '),(1018,'COLEGIO PARTICULAR \"ELIA LIUT\"','QUITO','MACHACHI'),(1019,'COLEGIO TECNICO FISCAL \"SAN CAMILO\"','QUEVEDO ','LOS RIOS'),(1020,'COLEGIO \"APUELA\"','COTACACHI','IMBABURA'),(1021,'UNIVERSIDAD TECNICA DE COTOPAXI','LATACUNGA','COTOPAXI'),(1022,'COLEGIO PARTICULAR MIXTO \"VEINTITRES DE JUNIO\"','EL EMPALME','GUAYAS'),(1023,'COLEGIO PATICULAR \"ARIEL\"','GUAYAQUIL','GUAYAS'),(1024,'COLEGIO FISCAL TECNICO \"MILAGRO\"','MILAGRO','GUAYAS'),(1025,'VICEALMIRANTE JORGE CRUZ POLANCO','QUITO','PICHINCHA'),(1026,'UNIDAD EDUCATIVOA \"OSWALDO DE GUAYASAMIN\" ','QUITO','PICHINCHA'),(1027,'COLEGIO  \"JAIME ROLDOS AGUILERA\"','QUITO','PICHINCHA'),(1028,'CHARLES DE GAULLE','QUITO','PICHINCHA'),(1029,'COLEGIO NACIONAL MACANDAMINE','LOJA','LOJA'),(1030,'COLEGIO TECNICO AGROINDUSTRIAL SALINAS','SALINAS','IMBABURA'),(1031,'COLEGIO TECNICO BILINGUE SAN FRANCISCO DE ASIS ','ORELLANA','ORELLANA'),(1032,'COLEGIO FISCAL TECNICO \"26 DE NOVIEMBRE\"','ZARUMA','ORO'),(1033,'UNION NACIONAL DE PERIODISTAS ','QUITO','PICHINCHA'),(1034,'INSTITUTO TECNOLOGICO BOLIVAR','TULCAN','CARCHI'),(1035,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"STEPHEN HAWKING\"','AMBATO ','TUGURAHUA'),(1036,'TECNICO AGROPECUARIO EDUARDO SALAZAR GOMEZ ','QUITO','PICHINCHA'),(1037,'COLEGIO PARTICULAR DEL PACIFICO','QUITO','PICHINCHA'),(1038,'COLEGIO NACIONAL \"DIEZ DE AGOSTO\"','MONTALVO','LOS RIOS'),(1039,'COLEGIO POPULAR PARTICULAR A DISTANCIA \" TIWINTZA\"','QUITO','PICHINCHA'),(1040,'COLEGIO \"EMILIANO ORTEGA ESPINOZA\"','CATAMAYO','LOJA'),(1041,'COLEGIO PARTICULAR \"ESTADOS UNIDOS DEL BRASIL\"','QUITO','PICHICHA'),(1042,'COLEGIO NACIONAL \"HUACA\"','CARCHI ','CARCHI'),(1043,'COLEGIO NACIONAL DE MACHACHI','MEJIA','PICHINCHA'),(1044,'INSTITUTO TECNOLOGICOSUPERIOR SHIRY CACHA','RIOBAMBA','CHIMBORAZO'),(1045,'JUAN DE DIOS MARTINEZ MERA','GUAYAQUIL','GUAYAS'),(1046,'NACIONAL GRAL MARCO AURELIO SUBIA MARTINEZ','LATCUNGA','COTOPAXI'),(1047,'COLEGIO NACIONAL DR MANUEL AGUSTIN AGUIRRE','LOJA','SOZORANGA'),(1048,'COLGIO POPULAR PARTICULAR EUGNIO ESPEJO','QUITO','PICHINCHA'),(1049,'UNIVERSIDAD ESCUELA POLITECNICA JAVERIANA DEL ECUADOR','QUITO','PICHICHA'),(1050,'UNIVERSIDAD ESCUELA POLITECNICA JAVERIANA DEL ECUADOR','QUITO','PICHICHA'),(1051,'UNIVERSIDAD POLITECNICA JAVERIANA DEL ECUADOR','QUITO','PICHINCHA'),(1052,'ESCUELA POLITECNICA JAVERIANA DEL ECUADOR','QUITO','PICHINCHA'),(1053,'ACADEMIA MILITAR MIGUEL ITURRALDE 2','QUITO','PICHICHA'),(1054,'INSTITUTO SUPERIOR PEDAGOGICO INTERCULTURAL BILINGUE QUILLOAC','CAÑAR','CAÑAR'),(1055,'COLEGIO NACIONAL PANGUA','EL CORAZON','COTOPAXI'),(1056,'EL COLEGIO FISCAL 16 DE MAYO ','QUINSALOMA','LOS RIOS'),(1057,'COLEGIO TECNICO NESTOR MOGOLLON','SALCEDO','COTOPAXI'),(1058,'UNIDADA EDUCATIVA JESUS DE NASARET','QUITO','PICHINCHA'),(1059,'MARCO SALAS YEPEZ ','QUITO','PICHINCHA'),(1060,'UNIDAD EDUCATIVA LUIS A MARTINEZ','AMBATO ','TUGURAHUA'),(1061,'REINALDO MIÑO ALTAMIRANO','AMBATO ','TUGURAHUA'),(1062,'COLEGIO PARTICULAR MIXTO CARLOS MARIA DE LA CONDAMINE','CONCORDIA','ESMERALDAS'),(1063,'ESCUELA POLITECNICA DEL EJERCITO','LATACUNGA','COTOPAXI'),(1064,'EL COLEGIO NACIONAL TECNICO \"LA MAGDALENA\" SECCION NOCTURNA','SAN JOSE DE CHIMBO ','BOLIVAR'),(1065,'COLEGIO FISCAL MIXTO DR.ANTONIO PARRA VELASCO','GUAYAQUIL','GUAYAS'),(1066,'UNIDAD EDUCATIVA A DISTANCIA DE CHIMBORAZO ','RIOBAMBA','CHIMBORAZO'),(1067,'COLEGIO A DISTANCIA  REPUBLICA DE ARGENTINA ','LATACUNGA','COTOPAXI'),(1068,'UNIDAD EDUCATIVA FISCOMICIONAL MANUEL JOSE RODRIGUEZ','LOJA','LOJA'),(1069,'UNIDAD EDUCATIVA \" COLEGIO MILITAR N.-13 PATRIA \"','LATACUNGA','COTOPAXI'),(1070,'COLEGIO MUNICIPAL NUEVE DE OCTUBRE','QUITO','PICHINCHA'),(1071,'COLEGIO FISCAL MIXTO PROVINCIA DE COTOPAXI','GUAYAQUIL','GUAYAS'),(1072,'COLEGIO FISCAL MIXTO EL EMPALME','QUEVEDO ','GUAYAS'),(1073,'COLEGIO CARLOS CUEVA TAMARIZ','CUENCA ','AZUAY '),(1074,'UNIDAD EDUCATIVA MONSEÑOR SANTIAGO FERNANDEZ  GARCIA','CARIAMANGA ','LOJA'),(1075,'COLEGIO PARTICULAR A DISTANCIA \"SANTA CRUZ\"','GUAYAQUIL','GUAYAS'),(1076,'COLEGIO A DISTANSIA MONSEÑOR SEGUNDO PEREZ','QUITO ','PICHINCHA'),(1077,'COLEGIO PARTICULAR LA ALVERNIA','QUITO','PICHINCHA'),(1078,'COLEGIO PARTICULAR MIXTO PROVINCIA DE GALAPAGOS','GUAYAQUIL','GUAYAS'),(1079,'UNIDAD EDUCATIVA LEOPOLDO N CHAVEZ','LATACUNGA','COTOPAXI'),(1080,'COLEGIO NACIONAL NANEGALITO','NANEGALITO','PICHINCHA'),(1081,'UNIDAD EDUCATIVA VICENTE FIERRO','TULCAN','CARCHI'),(1082,'UNID EDUC TECN EXP DEL MILENIO AHUANO','TENA','NAPO'),(1083,'UNIDAD  EDUCATIVA    FISCASL  PONCE ENRIQUEZ','QUITO','PICHINCHA'),(1084,'INSTITUCION EDUCATIVA MARIA AUGUSTA URRITIA','PICHINCHA ','QUITO'),(1085,' LA UNION','BABAHOYO','LOS RIOS'),(1086,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE \"LA PAZ\"','GUARANDA','GUANUJO'),(1087,'INSTITUTO TECNOLOGICO SUPERIOR MANUEL GALECIO','ALAUSI','CHIMBORAZO'),(1088,'UNIDAD DE FORMACION TECNICA ARTESANAL 3 DE NOVIEMBRE','SACHAS','ORELLANA'),(1089,'COMUNIDAD EDUCATIVA CATOLICA PIO XII','SAN GABRIEL ','CARCHI'),(1090,'UNIVERSITY OF HERTFORDSHIRE','LONDRES ',' HERTFORDSHIRE'),(1091,'COLEGIO \"GABRIEL GARCIA MORENO\"','ESPINDOLA','LOJA'),(1092,'UNIDAD EDUCATIVA FRANCISCO FEBRES CORDERO','QUITO','PICHINCHA'),(1093,'PROF. RICARDO ALVAREZ MANTILLA','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(1094,'COLEGIO NACIONAL MIXTO \"CALUMA\"','CALUMA','BOLIVAR'),(1095,'JOSE MARIA VALAZ EXTENSION 54 A','QUITO','PICHINCHA'),(1096,'JOSE MARIA VELAZ EXTENSION 14 SAN GABRIEL','QUITO','PICHINCHA'),(1097,'COLEGIO FISCAL MIXTO \" PABLO HANIBAL VELA EGUEZ\"','GUAYAQUIL','GUAYAS'),(1098,'COLEGIO NACIONAL NOCTURNO DR. MODESTO CHAVEZ FRANCO ','SANTA ROSA ','EL ORO'),(1099,'COLEGIO FISCAL MIXTO LCDO CARLOS ESTARELLAS AVILEZ','GUAYAQUIL','GUAYAS '),(1100,'INSTITUTO TECNOLOGICO SUPERIOR SARAGURO','LOJA','SARAGURO'),(1101,'INSTITUTO TECNOLOGICO SUPERIOR PARTICULAR INTERCULTURAL BILINGUE DON BOSCO','COTOPAXI','PUJILI'),(1102,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE \"RUMIÑAHUI\"','GUAMOTE','CHIMBORAZO'),(1103,'UNIDAD EDUCATIVA COLON','QUITO','PICHINCHA'),(1104,'INSTITUTO TECNICO SUPERIOR FISCOMISIONAL NUESTRA SEÑORA DEL ROSARIO','CATAMAYO ','LOJA'),(1105,'ARTURO HENDERSON','QUITO','PICHINCHA'),(1106,'COLEGIO TECNICO PARTICULAR  ISRAEL','QUITO','PICHINCHA'),(1107,'ULLOA BOMBON DEIGO GERMAN','TUNGURAGUA','AMBATO'),(1108,'COLEGIO SAN ALFONSO','AMBATO ','TUNGURAHUA'),(1109,'COLEGIO PARTICULAR FRANCISCO DE LA LLAGAS','QUITO','PICHINCHA'),(1110,'COLEGIO DE BACHILLERATO FRANCISCO DE ORELLANA','PUYO','PASTAZA'),(1111,'TENIENTE HUGO ORTIZ GARCES','RIOBMBA','CHIMBORAZO'),(1112,'COLEGIO NOCTURNO \"RAFAEL RODRIGUEZ PALACIOS','LOJA','LOJA'),(1113,'COLEGIO PARTICULAR REPUBLICA DE CROACIA','QUITO','PICHINCHA'),(1114,'COLEGIO FISCAL CANTON ARCHIDONA','NAPO','TENA'),(1115,'COLEGIO NACIONAL TOMAS B. OLEAS','RIOBAMBA','CHIMBORAZO'),(1116,'INSTITUTO TECNOLOGICO SUPERIOR DE TECNOLOGIAS APROPAIDAS','QUITO','PICHINCHA'),(1117,'COLEGIO NACIONAL \"TULCAN\"','TULCAN','CARCHI'),(1118,'INSTITUTO TECNOLOGICO RUMIÑAHUI','SANGOLQUI','PICHINCHA'),(1119,'COLEGIO PARTICULAR A DISTANCIA REPUBLICA DE AREGENTINA','LATACUNGA ','COTOPAXI'),(1120,'COLEGIO PÀRTICULAR MIXTO JAPON ','SANTO DOMINGO DE LOS SACHILAS ','SANTO DOMINGO DE LOS TSACHILAS'),(1121,'COLEGIO SAN LORENZO','GUARANDA','BOLIVAR'),(1122,'COLEGIO DE MARIANITAS \"MONSEÑOR RADA\"','GUARANDA','BOLIVAR'),(1123,'INSTITUTO SUPERIOR SAN LORENZO','QUITO','PICHINCHA'),(1124,'UNIDAD EDUCATIVA POPULAR PARTICULAR A DISTANCIA ECUADOR','QUITO','PICHINCHA'),(1125,'COLEGIO PROF.ECHEVERRIA TERAN','QUITO','PICHINCHA'),(1126,'COLEGIO TECNICO INTERCULTURAL BILINGUE FISCOMISIONAL \"ABYA-YALA\"','LATACUNGA','COTOPAXI'),(1127,'COLEGIO NACIONAL 18 DE NOVIEMBRE ','LOJA','LOJA'),(1128,'COLEGIO TECNICO FISCO MISIONAL JUAN PABLI II','LORETO','ORELLANA'),(1129,'COLEGIO FISCOMISIONAL JUAN PABLO II','LORETO','ORELLANA'),(1130,'COLEGIO NACIONAL TECNICO ASCAZUBI','QUITO','PICHINCHA'),(1131,'NACIONAL AGROPECUARIO \"AYAPAMBA\"','MACHALA','EL ORO'),(1132,'INSTITUTO SUPERIOR TECNOLOGICO QUITO','QUITO','PICHINCHA'),(1133,'COLEGIO NACIONAL PRIMERO DE MAYO ','QUITO ','PICHINCHA'),(1134,'COLEGIO PARTICULAR LA INMACULADA ','MACHALA','ORO'),(1135,'INSTITUTO TECNICO SUPERIOR LA MANA','LA MANA ','COTOPAXI'),(1136,'INSTITUTO TECNICO SUPERIOR RAUL PREBISCH','QUITO','PICHICHA'),(1137,'COLEGIO FISCAL NOCTURNO EL GUABO ','MACHALA ','EL ORO'),(1138,'UNIDAD EDUCATIVA A DISTANCIA MONS. LEONIDAS PROAÑO COTOPAXI ','LATACUNGA ','COTOPAXI'),(1139,'COLEGIO TECNICO INDUSTRIAL ZUMBA','ZUMBAHUA','CHIMCHIPE'),(1140,'COLEGIO NACIONAL TECNICO UNE DE QUITO ','QUITO ','PICHINCHA '),(1141,'COLEGIO DE BACHILLERATO\"RIO NANGARITZA\"','NANGARITZA','ZAMORA CHINCHIPE'),(1142,'COLEGIO MUNICIPAL\"SEGUNDO ULPIANO FIGUEROA\"','CALUMA','BOLIVAR'),(1143,'UNIDAD EDUCATIVA PCEI\"GENERAL RUMIÑAHUI\"','QUITO','PICHINCHA'),(1144,'INSTITUTO TECNOLOGICO SUPERIORBENITO JUAREZ','QUITO','PICHINCHA'),(1145,'COLEGIO DR. CAMILO GALLEGOS  DOMINGUEZ','SANTIAGO','MORONA SANTIAGO'),(1146,'COLEGIO PARTICULAR \"TECNICO ECUADOR\"','QUITO','PICHINCHA '),(1147,'COLEGIO PARTICULA  A DISTANCIA\" PROF. ERNESTO GONZALEZ MUÑOZ\"','SANTA ELENA ','SALINAS'),(1148,'SEGUNDO ANGLE TAPIA','QUITO','PICHINCHA'),(1149,'COLEGIO TECNICO AGROPECUARIO \"12 DE DICIEMBRE\"','CELICA','LOJA'),(1150,'COLEGIO NACIONAL \"DELBERT VELASQUEZ ARTEAGA\"','PORTOVIEJO','MANABI'),(1151,'COLEGIO NACIONAL \"19 DE NOVIEMBRE\"','MIRA','CARCHI'),(1152,'INSTITUTO TECNICO PANGUA','LATACUNGA','COTOPAXI'),(1153,'INSTITUCION EDUCATIVA PATRIMONIO DE LA HUMANIDAD','QUITO','PICHINCHA'),(1154,'UNIDAD EDUCATIVA MUNICIPAL \"QUITUMBE','QUITO','PICHINCHA'),(1155,'UNIDAD EDUCATIVA GIOVANNI ANTONIO FARINA','QUITO','PICHICHA'),(1156,'LA DOLOROSA','LOJA','LOJA'),(1157,'COLEGIO PARTICULAR DEMETRIO SAN PEDRO ','QUITO ','PICHINCHA'),(1158,'INSTITUTO DE EDUCACION SECUNDARIA BENICALAP','VALENCIA','VALENCIA'),(1159,'INSTITUTO TECNOLOGICO COLEGIO NACIONAL JUAN BAUTISTA VASQUEZ','AZUAY ','CAÑAR'),(1160,'COLEGIO FISCOMISIONAL MARIA AUGUSTA URRUTIA','QUITO ','PICHINCHA '),(1161,'COLEGIO EXPERIMENTAL UNIVERSITARIO MANUEL CABRERALOZANO','LOJA','LOJA'),(1162,'GRAL ALBERTO ENRIQUEZ GALLO','SALCEDO','COTOPAXI'),(1163,'COLEGIO 14 DE OCTUBRE','CALCETA','MANABI'),(1164,'COLEGIO 13 DE OCTUBRE','CALCETA','MANABI'),(1165,'COLEGIO NACIONAL NOPTURNO JOSE MARIA ESTRADA CUELLO','B ABAHOYO','LOS RIOS'),(1166,'COLEGIO PARTICULAR MIXTO 16 DE JUNIO','QUITO','PICHINCHA'),(1167,'COLEGIO  POPULAR PARTICULAR A DISTANCIA ISAAC NEWTON','AMBATO ','TUNGRAHUA'),(1168,'UNIDAD EDUCATIVA POPULAR PARTICULAR A DISTANCIA ECUADOR','QUITO','PICHINCHA'),(1169,'UNIDAD EDUCATIVA ADISTANCIA DE LOJA','CELICA','LOJA'),(1170,'INSTITUTO TECNICO SUPERIOR ANDRES F. CORDOVA','QUITO','PICHINCHA'),(1171,'INSTITUTO TECNOLOGICO SUPERIOR DR. MANUEL NAULA SAGÑAY','COLTA','CHIMBARAZO'),(1172,'COLEGIO PARTICULAR MIXTO INSTA','QUITO','PICHINCHA'),(1173,'COLEGIO PARTICULAR MIXTO INSTA','QUITO','PICHINCHA'),(1174,'EL COLEGIO MIXTO PASTORA ITURRALDE','SALCEDO','COTOPAXI'),(1175,'COLEGIO NACIONAL ANGEL POLIBIO CHAVEZ','GUARANDA','CHIMBARAZO'),(1176,'COLEGIO PARTICULAR A DISTANCIA \"AMERICANO\"','IBARRA ','IMBABURA'),(1177,'INSTITUCION EDUCATIVA EL CHAQUIÑAN','LATACUNGA','COTOPAXI'),(1178,'UNIVERSIDAD INDOAMERICA','AMBATO ','TUNGURAGUA'),(1179,'COLEGIO NACIONAL NOCTURNO  MIXTO  GENERAL RUMUÑAHUI','QUITO','PICHINCHA'),(1180,'COLEGIO NACIONAL TECNICO INDUSTRIAL ANCON ','SANTA ELENA ','SANTA ELENA'),(1181,'COLEGIO TECNICO AGROPECUARIO \"FAUSTO VALLEJO\"','ALAUSI','CHIMBORAZO'),(1182,'COLEGIO DE BACHILLERES DE LA MANA','LA MANA ','COTOPAXI'),(1183,'INSTITUTO TECNICO BENITO JUAREZ','QUITO','PICHIMCHA'),(1184,'COTOPAXI MARCAMANTA JATUN YACHANA HUASSI JATARI UNANCHA','LATACUNGA','COTOPAXI'),(1185,'COLEGIO SAN GABRIEL','QUITO','PICHINCHA '),(1186,'UNIDAD EDUCATIVA FISCAL 4 DE NOVIEMBRE','MANTA','MANABI'),(1187,'UNIDAD EDUCATIVA COTOGCHOA','SANGOLQUI','PICHINCHA'),(1188,'COLEGIO NACIONAL ANTISANA','QUITO','PICHINCHA'),(1189,'COLEGIO OPARTICULAR LUIGI GALVANI ','QUITO ','PICHINCHA '),(1190,'COLEGIO LUIS FIDEL MARTINEZ','QUITO ','PICHINCHA '),(1191,'COLEGIO NACIONAL PANGUA','EL CORAZON ','COTOPAXI'),(1192,'COLEGIO NACIONAL MIXTO AUGUSTO SOLORZANO HOYOS','CHONE','MANABI'),(1193,'INSTITUTO TECNICO SUPERIOR LOS SHYRIS','QUITO','PICHINCHA'),(1194,'COLEGIO NACIONAL DR. EMILIO UZCATEGUI','QUITO','PICHINCHA'),(1195,'COLEGIO TECNICO LAUREL','GUAYAQUIL','GUAYAS'),(1196,'INSTITUTO TECNOLOGICO SUPERIOR ALBERTO ENRIQUEZ','IBARRA','IMBABURA'),(1197,'COLEGIO NACIONAL MIXTO\"DR. MIGUEL ANGUEL ZAMBRANO ','QUITO','PICHINCHA '),(1198,'HEROES DE L41','MACHALA ','EL ORO'),(1199,'COLEGIO TECNICO INTELCULTURAL BILINGUE MONSEÑOR LEONIDAS PROAÑO VILLALBA','SAN PABLO DE ATENAS','BOLIVAR'),(1200,'UNIDAD EDUCATIVA A DISTANCIA DE COTOPAXI CONVENIO ME- CONFEDEC','SIGCHOS ','COTOPAXI'),(1201,'COLEGIO POPULAR CRISTO REY','QUITO','PICHINCHA'),(1202,'COLEGIO NACIONAL ALLURIQUIN','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(1203,'TECNICA AGROPECUARIO SAN DIEGO ','IPIALES','NARIÑO'),(1204,'COLEGIO JUAN MANTOVANI','SANGOLQUI','PICHICHA'),(1205,'COLEGIO MIRANDA RIVADENEIRA BOLIVAR EDUARDO','QUININDE','ESMERALDAS'),(1206,'COLEGIO NACIONAL CINCO DE JUNIO','BABAHOYO','LOS RIOS'),(1207,'UNIDAD EDUCATIVA PARTICULAR A DISTANCIA ECUADOR','QUITO','PICHINCHA'),(1208,'UNIDAD EDUCATIVA JULIO ENRIQUE MORENO','QUITO','PICHINCHA'),(1209,'COLEGIO PARTICULAR JEFFERSON SCHOOL-SIERRA','QUITO','PICHINCHA'),(1210,'COLEGIO PARTICULAR LUCA PACCIOLO','QUITO ','PICHINCHA '),(1211,'COLEGIO NACIONAL INDANZA','MACAS','MORONA ZANTIAGO'),(1212,'UNIDAD EDUCATIVA VICENTE ANDA AGUIRRE SECCION NOCTURNA ','LOJA ','LOJA '),(1213,'COLEGIO EXPERIMENTAL JACINTO COLLAHUAZO ','OTAVALO ','IMBABURA'),(1214,'COLEGIO BILINGUE INTIYAN ','QUITO ','PICHINCHA'),(1215,'COLEGIO TECNICO MONSEÑOR MAXIMILIANO ESPILLER','TENA','NAPO'),(1216,'COLEGIO TECNICO HUASIMPAMBA','AMBATO ','TUNGURAGUA'),(1217,'COLEGIO FISCAL PROF PEDRO ECHEVERRIA TERAN','QUITO','PICHINCHA'),(1218,'ACADEMIA  MILITAR BORJA Nª 3 CAVANIES','QUITO ','PICHINCHA '),(1219,'COLEGIO FISCAL TECNICO RAYMUNDO AVEIGA','CHONE','CHONE'),(1220,'UNIDAD EDUCATIVA PARTICULAR CENTRAL','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(1221,'ACADEMIA AERONAUTICA \"MAYOR PEDRO TRAVERSARI\"','QUITO','PICHINCHA'),(1222,'COLEGIO FISCAL MIXTO 26 DE SEPTIEMBRE','BALZAR','GUAYAS'),(1223,'COLEGIO PARTICULAR TECNICO INDUSTRIAL ESPAÑA','GUAYAQUIL','GUAYAS'),(1224,'COLEGIO NACIONAL MIXTO VILCABAMBA','LOJA','LOJA'),(1225,'COLEGIO NACIONAL TECNICO PROVINCIA DEL CHIMBORAZO ','RIOBAMBA','CHIMBORAZO'),(1226,'COLEGIO SANTA MARIA EUFRASIA','QUITO','PICHINCHA'),(1227,'ESCUELA SUPERIOR POLITECNICA DE CHIMBORAZO ','RIOBAMBA',' CHIMBORAZO '),(1228,'COLEGIO FISCAL MIXTO NACIONAL EL EMPALME','EMPALME','GUAYAS'),(1229,'SECAP','RIOBAMBA','CHIMBORAZO'),(1230,'COLEGIO FISCOMISIONAL SAN FELIPE','GONZANAMA','LOJA'),(1231,'COLEGIO EMILIANO ORTEGA ESPINAZA','LOJA','LOJA'),(1232,'INSTITUTO TECNOLOGICO SUPERIOR AERONAUTICO','LATACUGA','COTOPAXI'),(1233,'INSTITUTO TECNOLOGICO SUPERIOR TENA','TENA','NAPO'),(1234,'UNIDAD EDUCATIVA FISCOMISIONAL A DISTANCIA DE ORELLANA','COCA','ORRELLANA'),(1235,'COLEGIO POPULAR PATATE','PATATE','TUNGURAHUA'),(1236,'INSTITUTO  OXARCUAGUA','BILLVAO ','VIZCAYO'),(1237,'UNIDAD EDUCATIVA BAUTISTA CHARLES SPURGEON','PIFO','PICHINCHA'),(1238,'INSTITUCION EDUCATIVA JULIO E. MORENO','QUITO','PICHINCHA'),(1239,'COLEGIO POPULAR PARTICULAR A DISTANCIA DE CAPACITACION DEL PASIFICO','QUITO','PICHINCHA'),(1240,'COLEGIO NACIONAL \"PUERTO LIMON\"','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(1241,'20  DE DICIEMBRE ','LOJA','LOJA'),(1242,'UNIDAD EDUCATIVA PARTICULAR ISABEL TOBAR','QUITO','PICHINCHA'),(1243,'COLEGIO PARTICULAR SUDAMERICANO','QUITO','PICHINCHA'),(1244,'COLEGIO FISCAL MIXTO ASSAD BUCARAM ELMHALIM','GUAYAQUIL','GUAYAS'),(1245,'UNIDAD EDUCATIVA A DISTANCIA DEL CARCHI','CARCHI ','CARCHI'),(1246,'COLEGIO MIXTO COMBIATIENTES DEL CENEPA','VINCES','LOS RIOS'),(1247,'COLEEGIO MIXTO PARTICULAR COMBATIENTES DEL CENEPA','BABAHOYO','LOS RIOS '),(1248,'COLEGIO PARTICULAR  COMANDANTE ','QUITO ','PICHINCHA '),(1249,'COLEGIO PARTICULAR COMANDANTE LIZARDO ALFONSO VILLAMARN ','QUITO ','PICHINCHA '),(1250,'INSTITUTO I.E.S MARINA','BARCELONA ','CATALUÑA'),(1251,'I.E.SECUNDARIA PRAXEDES MATEO SAGASTA','LOGROÑO','LA RIOJA'),(1252,'UNIVERSISDAD ESTATAL DE GUAYAQUIL','GUAYAQUIL','GUAYAS'),(1253,'ISTITUTO SUPERIOR BAÑOS','BAÑOS','TUNGURAHUA'),(1254,'COLEGIO PARTICULAR ELECTRONICO PICHINCHA','QUITO','PICHINCHA'),(1255,'COLEGIO PARTICULAR NOCTURNO MIXTO ISABEL LA CATOLICA','QUITO','PICHINCHA'),(1256,'UNIDAD EDUCATIVA FISCOMISIONAL A DISTANCIA DE COTOPAXI','LA MANA ','COTOPAXI'),(1257,'INSTITUCION EDUCATIVA LAS CUADRAS','QUITO','PICHINCHA'),(1258,'COLEGIO NACIONAL \"JOSE FELIX DE VALDIVIESO\"','SACAPALCA','LOJA'),(1259,'UNIDAD EDUCATIVA A DISTANCIA  DE IMBABURA','IBARRA','IMBABURA'),(1260,'COLEGIO NACIONAL ANGEL POLIO CHAVEZ','SAN MIGUEL','BOLIVAR'),(1261,'COLEGIO NACIONAL ANGEL POLIVIO CHAVEZ','GUARANDA','BOLIVAR'),(1262,'COLEGIO NACIONAL \"17 DE ABRIL\"','AMBATO ','TUGURAHUA'),(1263,'UNIDAD EDUCATIVA SEGUNDO TORRES','QUITO','PICHINCHA'),(1264,'UNIDAD EDUCATIVA A DISTANCIA DE TUNGURAHUA','AMBATO ','TUNGURAHUA'),(1265,'UNIDAD EDUACTIVA  LOS ANDES','PILLARO','TUNGURAHUA'),(1266,'COLEGIO PARTICULAR\"NUESTRA SEÑORA DE LA ANUNCIACION\"','QUITO','PICHINCHA '),(1267,'COLEGIO FISCOMISIONAL JUAN XXIII','QUININDE','ESMERALDAS'),(1268,'COLEGIO TECNICO TOACAZO','LATACUNGA','COTOPAXI'),(1269,'INSTITUTO TECNOLOGICO PELILEO','PELILEO ','TUNGURAHUA'),(1270,'COLEGIO POPULAR PARTICULAR ELECTRONICO PICHINCHA','QUITO','PICHINCHA'),(1271,'COLEGIO PARTICULAR SEGUNDO ANGEL TAPIA','QUITO','PICHINCHA'),(1272,'ACADEMIA AERONAUTICA MAYOR PEDRO TRAVERSARI 2','QUITO','PICHINCHA'),(1273,'COLEGIO OSWALDO GUATASAMIN','SANTO DOMINGO','SANTO DOMINGO DE LOS SACHILAS'),(1274,'COLEGIO JOHANN STRAUSS','QUITO','PICHINCHA'),(1275,'ISNTITUTO TECNICO SUPERIOR SUCRE NOCTURNO','QUITO','PICHINCHA'),(1276,'INSTITUCION EDUCATIVA TECNICO PUJILI','PUJILI','COTOPAXI'),(1277,'INSTITUTO DE EDUCACION SECUNDARIA  PACIFICO DE MADRID','MADRID','MADRID'),(1278,'UNIDAD EDUCATIVA PARTICULAR CENTEBAD','LATACUNGA','COTOPAXI'),(1279,'UNIVERSIDAD TECNICA DE MACHALA','MACHALA ','EL ORO '),(1280,'COLEGIO NACIONAL DR ALFREDO NOBOA MONTENEGRO','GUARANDA','BOLIVAR'),(1281,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"LATINOAMERICA\"','PUYO','PASTAZA'),(1282,'COLEGIO FISCAL TECNICO ALOAG ','MACHACHI','PICHINCHA '),(1283,'UNIDAD EDUCATIVA EXPERIMENTAL \"MANUELA CAÑIZARES\"','QUITO','PICHINCHA'),(1284,'INSTITUTO TECNOLOGICO SUPERIOR BENITO JUAREZ','QUITO','PICHINCHA'),(1285,'UNIDAD EDUACTIVA MARIA AUXILIADORA','QUITO','PICHINCHA'),(1286,'COLEGIO DR. RICARDO CORNEJO ROSALES','QUITO','PICHINCHA'),(1287,'UNIDAD EDUCATIVA SIETE DE OCTUBRE','QUEVEDO ','LOS RIOS'),(1288,'COLEGIO PARTICULAR CONFESIONALCIMA ','LATACUNGA ','COTOPAXI'),(1289,'UNIDAD EDUCATIVA SANTA  TERESITA ','CELICA','LOJA'),(1290,'COLEGIO FRANCISCA DE LAS LLAGAS ','QUITO ','PICHINCHA'),(1291,'COLEGIO PARTICULAR LAS PALMAS ','ESMERALDAS ','ESMERALDAS'),(1292,'COLEGIO NACIONAL \"YATUVI\"','CALUMA','BOLIVAR'),(1293,'COLEGIO TECNICO PARTICULAR JACQUES COUSTEAU','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(1294,'COLEGIO PARTICULAR JEAN LE ROND D ALLEMBERT','QUITO','PICHICHA'),(1295,'INSTITUTO NORMAL SUPERIOR N°14','COLTA','CHIMBORAZO'),(1296,'COLEGIO NACIONAL TECNICO URCUQUI','IBARRA','IMBABURA'),(1297,'UNIDAD EDUCATIVA FISCOMISIONAL A DISTACIA MONSEÑOR LEONIDAS PROAÑO','GUARANDA','BOLIVAR'),(1298,'COLEGIO NACIONAL  ALEJO LASCANO','QUIPIJAPA','MANABI'),(1299,'UNIDAD EDUCATIVA MARIA ANGELICA IDROBO','QUITO','PICHINCHA'),(1300,'UNIVERSIDAD POLITECNICA SALECIANA ','QUITO ','PICHICHA'),(1301,'COLEGIO PARTICULAR PRIMERO DE AGOSTO','QUEVEDO ','LOS RIOS '),(1302,'UNIDAD EDUCATIVA GONZANAMA','GONZANAMA','LOJA'),(1303,'COLEGIO NACIONAL \"ONCE DE OCTUBRE\"','CATARAMA','LOS RIOS'),(1304,'COLEGIO TECNICO AGROPECUARIO CHUNCHI','CHUNCHI','CHIMBARAZO'),(1305,'UNIDAD EDUCATIVA MORASPUNGO','PANGUA ','COTOPAXI'),(1306,'INSTITUTO TECNOLOGICO SUPERIOS LO SHIRIS','QUITO','PICHINCHA'),(1307,'FACULTAD LATINOAMERICANA DE CIENCIAS SOCILAES','QUITO','PICHINCHA'),(1308,'ACADEMIA MILITAQR DEL VALLE ','QUITO','PICHINCHA'),(1309,'COLEGIO MIXTO PARTICULAR \"DR. MANUEL DE J. REAL MURILLO\"','GUAYAQUIL','GUAYAS'),(1310,'TECNICO AGROPECUARIO PUCAYACU','PUCAYACU','COTOPAXI'),(1311,'COLEGIO TECNICO INDUSTRIAL SAN FRANCISCO DE ASIS','LOJA','LOJA'),(1312,'COLEGIO FISCAL NOCTURNO \"EMILIO ESTRADA ICAZA\"','GUAYAQUIL','GUAYAS'),(1313,'TRAFICO DE BURGOS','BURGOS','CASTILLOS DE LEON'),(1314,'COLEGIO NACIONAL MIXTO \"DR. RICARDO DESCALZI\"','RIOBAMBA','CHIMBORAZO'),(1315,'COLEGIO NACIONAL HUAMBALO','AMBATO ','TUGURAHUA'),(1316,'COLEGIO EXPERIMENTAL PIO JARAMILLO ALVARADO','LOJA ','LOJA '),(1317,'INSTITUTO SUPERIOR COMPU SUR','QUITO','PICHINCHA'),(1318,'UNIDAD EDUCATIVA NUEVA PRIMAVERA','QUITO','PICHINCHA'),(1319,'COLEGIO NACIONAL MONTALVO','MONTALVO','LOS RIOS'),(1320,'COLEGIO FAUSTO ENRIQUE MOLINA MOLINA ','AMBATO ','TUNGURAGUA'),(1321,'UNIDAD EDUCATIVA MARTHA BUCARAM DE ROLDOS','YANTZAZA','ZAMORA CHINCHIPE'),(1322,'COLEGIO PRIMICIAS DE LKA CULTURA DE QUITO','QUITO','PICHINCHA'),(1323,'COLEGIO PRIMICIAS DE LA CULTURA DEW  QUITO','QUITO','PICHINCHA'),(1324,'COLEGIO 27 DE FEBRERO','QUITO','PICHINCHA'),(1325,'COLEGIO TECNICO HUASIPAMBA','AMBATO ','TUGURAHUA'),(1326,'ORELLANA','NAPO','PASTAZA'),(1327,'BENITO JUAREZ','QUITO','PICHINCHA'),(1328,'AMAZONAS','QUITO','PICHINCHA'),(1329,'UNIVERSIDAD TECNOLOGICA AMERICA','QUITO','PICHINCHA'),(1330,'SAN  MIGUEL','GUARANDA ','BOLIVAR'),(1331,'UNIDAD EDUCATIVA MUNICIPAL DEL MILENIO BICENTENARIO','QUITO','PICHINCHA'),(1332,'COLEGIO FISCAL \"EDUARDO VILLAQUIRAN\"','QUITO','PICHINCHA'),(1333,'TECNICO AGROPECUARIO JOSE RODRIGUEZ LABANDERA','QUEVEDO ','LOS RIOS'),(1334,'MIGUEL DEL HIERRO','QUITO','PICHINCHA'),(1335,'INSTITUTO TECNICO SUPERIOR EXPERIMENTAL LUIS NAPOLEON DILLON','QUITO','PICHINCHA'),(1336,'UNIDAD EDUCATIVA FISCOMISIONAL SAN JERONIMO','QUITO','PICHINCHA '),(1337,'INSTITUTO NACIONAL MEJIA','QUITO','PICHINCHA'),(1338,'COLEGIO TECNICO NACIONAL  JAMBELI ','LAGO AGRIO','SUCUMBIOS '),(1339,'COLEGIO NACIONAL MIXTO JAMBELI ','LAGO AGRIO','SUCUMBIOS'),(1340,'COLEGIO MUNICIPAL HUGO B. CRUZ ANDRADE','EL CARMEN ','MANABI '),(1341,'NACIONAL TECNICO INDUSTRIAL \"SIETE DE OCTUBRE\"','QUEVEDO ','LOS RIOS'),(1342,'UNIDAD EDUCATIVA ADVENTISTA EMANUEL','LAGO AGRIO','SUCUMBIOS'),(1343,'MIXTO PART HOMERO VILLAMIL B ','VALENCIA','LOS RIOS '),(1344,'COLEGIO NACIONAL DR. TRAJANO NARANJO JACOME ','SIGCHOS ','COTOPAXI'),(1345,'COMPUINFORMATICA','QUITO','PICHICHA'),(1346,'COMPUINFORMATICA','QUITO','PICHINCHA'),(1347,'CONPUIMFORMATICA','QUITO','PICHINCHA'),(1348,'COMPUINFORMATICA','QUITO','PICHINCHA'),(1349,'COMPUINFORMATICA','QUITO','PICHINCHA'),(1350,'LIBERTAD DE TIEMBRE','ESMERALDAS ','ESMERALDAS'),(1351,'PANGUA','LATACUNGA','COTOPAXI'),(1352,'COLEGIO DE BACHILLERATO PARTICULAR PRESIDENTE CORDERO','MORONA SANTIAGO','SANTIAGO'),(1353,'UNIDAD EDUCATIVA ROSA MARIA ALAVA MOREIRA','BUENA FE','LOS RIOS'),(1354,'INSTITUCION EDUCATIVA LA BRETAÑA','QUITO','PICHINCHA'),(1355,'ACADEMIA NAVAL ALMIRANTE JORGE CRUZ POLANCO','QUITO','PICHINCHA'),(1356,'UNIVERSIDAD POLITECNICA SALESIANA','QUITO','PICHINCHA'),(1357,'UNIDAD EDUCATIVA A DISTANCIA  DE COTOPAXI CONVENIO MEC CONFEDEC','PANGUA','COTOPAXI'),(1358,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE \"NIZAG\"','ALAUSI','CHIMBORAZO'),(1359,'UNIDAD EDUCATIVA ISINLIVI','SIGCHOS ','COTOPAXI'),(1360,'COLEGIO FISCAL ANTONIO JOSE DE SUCRE','QUEVEDO ','LOS RIOS'),(1361,'COLEGIO TECNICO NACIONAL ALFREDO PEREZ GUERRERO ','GUANO','CHIMBORAZO'),(1362,'COLEGIO TECNICO NACIONAL ALFREDO PEREZ GUERRERO ','GUANO ','CHIMBORAZO '),(1363,'UNIDAD EDUCATIVA PARTICULAR A DISTANCIA DR. EUGENIO ESPEJO','SAN GABRIEL','CARCHI'),(1364,'UNIDAD EDUCATIVA PUCAYACU ','LA MANA ','COTOPAXI '),(1365,'UNIDAD EDUCATIVA PUCAYACU','LA MANA ','COTOPAXI'),(1366,'COLEGIO NACIONAL DE SEÑORITAS VENTANAS ','VENTANAS ','LOS RIOS '),(1367,'COLEGIO NACIONAL \"4 DE JULIO\"','CHUNCHI','CHIMBORAZO'),(1368,'COLEGIO NACIONAL FEDERICO GONZALEZ SUAREZ ','QUITO ','PICHINCHA '),(1369,'INSTITUTO TECNICO SUPERIOR ALOASI ','MEJIA ','PICHINCHA'),(1370,'INSTITUTO TECNOLOGICO SUPERIOR CONSEJO PROVINCIAL DE PICHINCHA','PICHINCHA ','QUITO'),(1371,'COLEGIO TECNICO AGROPECUARIO PUCAYACU ','LA MANA ','COTOPAXI'),(1372,'UNIDAD EDUCATIVA TEMPORAL GALO PLAZA LASSO ','ECHEANDIA','BOLIVAR'),(1373,'DR. JOSE PATRICIO ROMERO ','QUITO','PICHINCHA'),(1374,'ACADEMIA ARENAUTICA MAYOR PEDRO TRAVESARI','QUITO','PICHINCA'),(1375,'PIO BAROJA DE MADRID','MADRID','MADRID'),(1376,'COLEGIO DIOCESANO BILINGUE','IBARRA','IMBABURA'),(1377,'COLEGIO FISCAL MIXTO ROSA ERLINDA GARCIA DE GARCIA','ESPINDOLA','LOJA'),(1378,'COLEGIO DE BACHILLERATO ROSAS HERLINDA GARCIA DE GARCIA','ESPINDOLA ','LOJA'),(1379,'COLEGIO NACIONAL  TECNICO LLANO CHICO ','QUITO','PICHINCHA'),(1380,'UNIDAD EDUCATIVA INTERNACIONAL DEL PASIFICO','MANTA','MANABI'),(1381,'COLEGIO PARTICULAR VIRGEN CONSUELO ','QUITO ','PICHINCHA '),(1382,'COLEGIO PARTICULAR VIRGEN DEL CONSUELO ','QUITO ','PICHINCHA'),(1383,'U.E TEMPORAL MARIANO SUAREZ VEINTIMILLA','IMBARRA','IMBABURA'),(1384,'UNIVERSIDAD TECNOLOGICA INDOAMERICA','PICHINCHA ','QUITO'),(1385,'INSTITUTO TECNOLOGICO BENITO JUARES','QUITO','PICHINCHA '),(1386,'COLEGIO DE BACHILLERATO FISCAL JAIME HURTADO GONZALEZ','ESMERALDAS ','ESMERALDAS'),(1387,'UNIDAD EDUCATIVA  28 DE MAYO ','QUEVEDO ','LOS RIOS '),(1388,'RED EDUCATIVA RURAL BRAMADEROS ','PALTAS','LOJA'),(1389,'\"IST.TECN. STAT ARGENTIA\"','GORGONZOLA','MILAN'),(1390,'COLEGIO PARTICULAR SAGRADO CORAZON DE JESUS','QUITO ','PICHINCHA'),(1391,'INSTITUTO TECNOLOGICO  SUPERIOR AGROPECUARIO CIUDAD DE VALENCIA','VELANCIA','LOS RIOS'),(1392,'DR.GABRIEL PAZMIÑO','GUARANDA','BOLIVAR'),(1393,'UNIDAD EDUCATIVA \"SOLIDARIDAD\"','QUITO','PICHINCHA'),(1394,'COLEGIO FISCAL MIXTO DURAN','DURAN','GUAYAQUIL'),(1395,'COLEGIO PARTICULAR ELECTRONICA PICHINCHA','QUITO','PICHINCHA'),(1396,'UNIDAD EDUCATIVA LEOPOLDO BENITEZ VINUEZA','ORELLANA','PTO FRANCISCO DE ORELLANA'),(1397,'COLEGIO PARTICULAR MARIANO NEGRETE','MACHACHI','PICHINCHA'),(1398,'COLEGIO MULALO','LATACUNGA ','COTOPAXI'),(1399,'CESAR AUGUSTO TAMAYO MEDINA','CAYAMBE','PICHINCHA'),(1400,'INSTITUCION EDUCATIVA TRES DE DICIEMBRE','QUITO','PICHINCHA'),(1401,'COLEGIO NACIONAL 15 DE DICIEMBRE ','QUITO','PICHINCHA '),(1402,'UNIDAD EDUCATIVA CALDERON II','QUITO','PICHINCHA '),(1403,'COLEGIO NACIONAL TECNICO \"DR. ALFREDO PAREJA DIEZCANSECO\"','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(1404,'COLEGIO GEORGINA ROSILLO DE CUEVA','CARIAMANGA ','LOJA'),(1405,'COLEGIO PARTICULAR SEMIPRESENCIAL \"SAN JUAN PABLO II\"','QUITO','PICHINCHA'),(1406,'UNIDAD EDUCATIVA PARTICULAR ADVENTISTA DEL SUR','QUITO','PICHINCHA'),(1407,'COLEGIO NACIONAL MIXTO\"RAFAEL MORAN VALVERDE\"','GUAYAQUIL','GUAYAS'),(1408,'GENERAL VICENTE ANDA AGUIRRE','BALSAS','EL ORO'),(1409,'COLEGIO NACIONAL TABACUNDO','QUITO','PICHINCHA'),(1410,'COLEGIO NACIONAL ATAHUALPA','QUITO','PICHINCHA'),(1411,'UNIDAD EDUCATIVA \"HUGO B CRUZ ANDRADE\"','EL CARMEN ','MANABI'),(1412,'COLEGIO MENOR IBEROAMERICANO','QUITO','PICHINCHA '),(1413,'ACADEMIA MILITAR GENERAL MIGUEL ITURRALDE','QUITO','PICHINCHA'),(1414,'UNIDAD EDUCATIVA INTERCULTURAL DON BOSCO','PUJILI','COTOPAXI'),(1415,'JOSE ANTONIO DE SUCRE','APURIMAC','ABANCAY'),(1416,'INTERNACIONAL BOLIVAR','GUARANDA','BOLIVAR'),(1417,'UNIDAD EDUCATIVA FISCOMISIONAL PCEI DE PICHINCHA','QUITO ','PICHINCHA'),(1418,'UNIDAD EDUCATIVA FISCOMICIONAL PICHINCHA','QUITO','PICHINCHA'),(1419,'COLEGIO TECNICO INTERCULTURAL BILINGUE JATARISHUN','SAQUISILI','COTOPAXI'),(1420,'COLEGIO DE BARRILLERATO TECNICO DR. CAMILO GALLEGOS DOMINGUES ','LATACUNGA','COTOPAXI'),(1421,'COLEGIO DE BACHILLER TECNICO DR. CAMILO GALLEGOS  DOMINGUEZ ','LA TACUNGA','COTOPAXI'),(1422,'COLEGIO TÉCNICO INDUSTRIAL \"DR. TRAJANO NARANJO ITURRALDE\"','LATACUNGA','COTOPAXI'),(1423,'TECNOLÓGICO AGROPECUARIO \" LUIS A. MARTÍNEZ\"','AMBATO ','TUGURAHUA'),(1424,'INSTITUTO SUPERIOR TECNOLOGICO CORDILLERA','QUITO ','PICHINCHA'),(1425,'UNIDAD EDUCATIVA A DISTANCIA PARTICULAR SULTANA DE LOS ANDES','GUARANDA','BOLIVAR'),(1426,'UNIDAD EDUCATIVA JOSE JOAQUIN DE OLMEDO','CAYAMBE','PICHINCHA '),(1427,'UNIDAD EDUCATIVA CHIMBORAZO PCEI','RIOBAMBA ','CHIMBORAZO '),(1428,'EL COLEGIO  POPULAR PARTICULAR A DISTANCIA JERICO','SAN ANTONIO','PICHINCHA'),(1429,'DR. TRAJANO NARANJO ITURRALDE ','LATACUNGA','COTOPAXI'),(1430,'INSTITUCION EDUCATIVA FISCAL FORESTAL','QUITO ','PICHINCHA '),(1431,'COLEGIOJENERAL MARCO AURELIOSUBIA MARTINEZ','LA TACUNGA','COTOPAXI'),(1432,'NACIONAL HUMANISTICO GRAL. MARCO AURELIO SUBIA MARTINEZ','LATACUGA','COTOPAXI'),(1433,'COLEGIO PARTICULAR MIXTO 4 DE DICIEMBRE ','EL CARMEN ','MANABI'),(1434,'UNIDAD EDUCATIVA EXPERIMENTAL\" SANTA CRUZ DE LA PROVIDENCIA\"','QUITO','PICHINCHA'),(1435,'UNIDAD EDUCATIVA A DISTANCIA DE PICHINCHA','QUITO','PICHINCHA'),(1436,'COLEGIO TECNICO NOCTURNO 10DE NOVIEMBRE','GUARANDA','BOLIVAR'),(1437,'UNIDAD EDUCATIVA A DISTANCIA ELOY ALFARO','EL CARMEN ','MANABI'),(1438,'INSTITUTO TR¡ECNOLOGICO AUTONOMO DEL ECUADOR','QUITO','PICHICHA'),(1439,'COLEGIO FISCAL MIXTO JOSE JOAQUIN  PINO Y CAZA','GUAYAS ','GUAYAQUIL'),(1440,'COLEGIO PARTICULAR BILINGUE \" ALEXANDER VON HUMBOLDT\"','QUITO','PICHINCHA'),(1441,'COLEGIO NACIONAL NELSON','CAYANBE','PICHINCHA'),(1442,'COLEGIO NACIONAL NELSON I. TORRES ','CAYANMBE','PICHINCHA'),(1443,'INSTITUTO TECNOLIGICO LUIS ARBOLEDA MARTINEZ','MANTA','MANABI'),(1444,'COLEGIO NACIONAL NOCTURNO KLEBER FRANCO CRUZ ','MACHALA','EL ORO'),(1445,'UNIVERSIDAD INTERNACIONAL DEL ECUADOR','QUITO','PICHINCHA'),(1446,'COLEGIO FISCAL EXPERIMENTAL  AGUIRRE ABAD','GUAYAS ','GUAYAQUIL'),(1447,'COLEGIO A DISTANCIA SUCRE','PORTOVIEJO ','MANABI'),(1448,'UNIDAD COMPU INFORMATICA','PICHINCHA ','QUITO'),(1449,'COLEGIO NACIONAL \"DR.J.M. VELASCO IBARRA\"','PICHINCHA ','QUITO'),(1450,'COLEGIO TECNICO ELECTRONICO PICHINCHA','PICHINCHA ','QUITO'),(1451,'COLEGIO TECNICO FEMENINO \" LUIS  FERNANDO RUIZ\"','LATACUNGA','COTOPAXI'),(1452,'COLEGIO NACIONAL RUMIÑAHUI','SANGOLQUI','PICHINCHA'),(1453,'RUMIÑAHIU','SANGOLQUI','PICHINCHA'),(1454,'UNIDAD EDUCATIVA \"MARISCAL DE AYACUCHO\"','PORTOVIEJO','MANABI'),(1455,'UNIDAD EDUCATIVA EL CHACO','CHACO','NAPO'),(1456,'COLEGIO MIXTO PARTICULAR DAGOBERTO MONTENEGRO','LA LIBERTAD','SANTA ELENA'),(1457,'HERBART','CHECA','PICHINCHA'),(1458,'SANTIAGO FERNANDO GARCIA','LOJA','CARIAMANGA'),(1459,'COLEGIO NACIONAL TECNICO RICAURTE','RICAURTE','EL RIOS '),(1460,'COLEGIO FISCAL EXPERIMENTAL  ELOY ALFARO ','GUAYAQUIL','GUAYAS'),(1461,'COLEGIO FISCAL LOS BABAHOYOS','VENTANAS ','LOS RIOS '),(1462,'UNIDAD EDUCATIVA FISCAL DEL MILENIO REPLICA 24 DE MAYO','QUITO','PICHINCHA '),(1463,'INSTITUTO SUPERIOR VIDA NUEVA','QUITO','PICHINCHA'),(1464,'TECNICO AGROINDUSTRIAL MORASPUNGO','PAGUA','COTOPAXI'),(1465,'MORASPUNGO','PAGUA','COTOPAXI'),(1466,'AGENCIA NACIONAL DE TRANSITO','QUITO','PICHINCHA'),(1467,'COLEGIO TECNICO \" ALESSANDRO VOLTA\"','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(1468,'INSTITUCION EDUCATIVA JULIO MORENO PEÑAHERRERA','QUITO','PICHINCHA'),(1469,'INSTITUTO TECNICO SUPERIOR EUGENIO ESPEJO','BABAHOYO','LOS RIOS'),(1470,'TECNICO PUJILI','LATACUGA','COTOPAXI'),(1471,'UNIDAD EDUCATIVA ALFONSO DEL HIERRO LA SALLE','QUITO','PICHINCHA'),(1472,'UNIDAD EDUACTIVA LICTO ','RIOBAMBA ','CHIMBORAZO '),(1473,'COLEGIO NACIONAL TECNICO AGROPECUARIO SAN ISIDRO','SUCRE','MANABI'),(1474,'UNIDAD EDUCATIVA  SAN VICENTE DE PAUL','LOJA','LOJA'),(1475,'UNIDAD EDUCATIVA DANIEL ENRIQUE PROAÑO','QUITO ','PICHINCHA '),(1476,'EL COLEGIO TECNICO CONSEJO PROVINCIAL DE CHIMBORAZO','RIOBAMBA ','CHIBORAZO'),(1477,'COLEGIO NACIONAL OLMEDO ','MANABI','PORTOVIEJO'),(1478,'COLEGIO FISCAL TÉCNICO A DISTANCIA \"PIO JARAMILLO\"','LA CONCORDIA ','SANTO DOMINGO DE LOS TSACHILAS'),(1479,'PENIPE','RIOBAMBA','CHIBORAZO'),(1480,'UNIDAD EDUCATIVA SIGCHOS','SIGCHOS ','COTOPAXI'),(1481,'ANTONIO DE TRUEBA','BILBAO','BIZKAIA'),(1482,'IESS GARCIA MOROTA ','MADRID','MADRID'),(1483,'UNIDAD EDUCATIVA MUNICIPAL OSWALDO LOMBEIDA ','QUITO','PICHINCHA'),(1484,'COLEGIO TECNICO POPULAR PARTICULAR A DISTANCIA 23 DE AGOSTO','SAN LUIS DE PAMBIL','BOLIVAR'),(1485,'COLEGIO ISSAC NEWTON','MADRID','MADRID'),(1486,'COLEGIO PARTICULAR \"SIMON BOLIVAR\"','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(1487,'COLEGIO DE BACHILLERATO  PANGUA','PANGUA','COTOPAXI'),(1488,'DR.JOSE RICARDO CHIRIBOGA  VILLAGOMEZ','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(1489,'PROVINCIA DEL CAÑAR','DURAN','GUAYAQUIL'),(1490,'COLEGIO DE BACHILLERATO RUMISHITANA','LOJA','LOJA'),(1491,'COLEGIO PARTICULAR NOCTURNO GALAPAGOS','RIOBAMBA','CHIMBORAZO'),(1492,'INSTITUTO SUPERIOR PARTICULAR LOS ANDES','QUITO','PICHINCHA'),(1493,'INSTITUTO TECNOLOGICO POLICIA NACIONAL ','QUITO','PICHINCHA'),(1494,'UNIDAD EDUCATIVA A DISTANCIA DE COTOPAXI EXTENSION PUCAYACU','LA MANA ','COTOPAXI'),(1495,'MONTE OLIVO','TULCAN','CARCHI'),(1496,'UNIDAD EDUCATIVA DOCTOR ARTURO FREIRE','QUITO','PICHINCHA '),(1497,'UNIDAD EDUCATIVA SHIRY CACHA ','CHIMBORAZO','RIOBAMBA'),(1498,'INSTITUTO TECNOLOGICO SUPERIOR DUCHICELA SHYRI II','RIOBAMBA','CHIMBARAZO'),(1499,'UNIDAD EDUCATIVA FISCOMISIONAL PIERRE TEILHARD DE CHARDIN','ATACAMES','ESMERALDAS'),(1500,'UNIDAD EDUCATIVA EMAUS DE FE Y ALEGRIA','QUITO','PICHINCHA'),(1501,'UNIDAD EDUCATIVA BILINGUE \" WILLIAM JHOMSON INTERNACIONAL\"','QUITO','PICHINCHA'),(1502,'UNIVERSIDAD ANDINA SIMON BOLIVAR ','QUITO ','PICHINCHA '),(1503,'COLEGIO NACIONAL \"FRAY JODOCO RICKE\"','QUITO','PICHINCHA'),(1504,'REPUBLICA DEL PERU','MACHALA','EL ORO '),(1505,'COLEGIO POPULAR PARTICULAR LAICO \"LATINOAMERICANO\"','QUITO','PICHINCHA'),(1506,'INSTITUTO TECNOLOGICO SUPERIOR SAGRADOS CORAZONES DE JESUS','TULCAN','CARCHI'),(1507,'CORONEL DE LA POLICIA MILTON BORJA ','PUJILI','COTOPAXI'),(1508,'UNIDAD EDUCATIVA FISCAL CAPITAN GEOVANI CALLES ','ORELLANA','PUERTO FRACISCO DE ORELLANA '),(1509,'COLEGIO MUNICIPAL PEDRO PABLO TRAVERSARI','QUITO','PICHINCHA '),(1510,'UNIDAD EDUCATIVA EVANGELICA THEODORO W. ANDERSON','QUITO','PICHINCHA'),(1511,'UNIDAD EDUCATIVA GUARANDA ','GUARANDA','BOLIVAR '),(1512,'UNIDAD EDUCATIVA MILITAR HEROES DEL CENEPA ','MERA','PASTAZA'),(1513,'COLEGIO NACIONAL \"QUINCHE FELIX REZABALA\"','BOLIVAR','MANABI'),(1514,'VICEALMIRANTE JORGE CRUZ POLANCO','QUITO','PICHINCHA'),(1515,'UNIDADA EDUACTIVA SELVA ALEGRE','OTAVALO','IMBABURA '),(1516,'ACADEMIA NAVAL GUAYAQUIL ','GUAYAQUIL','GUAYAS '),(1517,'COLEGIO PARTICULAR BOLIVARIANO 24 DE JULIO','QUITO','PICHINCHA'),(1518,'COLEGIO PARTICULAR PATRIA NUEVA','QUITO','PICHINCHA'),(1519,'COLEGIO TECNICO NACIONAL NICOLAS JIMENEZ','QUITO','PICHINCHA'),(1520,'BENITO JUAREZ','QUITO','PICHINCHA'),(1521,'INSTITUTO TECNICO SUPERIOR EL ORO','MACHALA','EL ORO'),(1522,'COLEGIO LEON DE FEBRES CORDERO ','QUITO ','PICHINCHA '),(1523,'NACIONAL CINCO DE JUNIO','QUITO','PICHINCHA'),(1524,'COLEGIO NACIONAL EXPERIMENTAL LUCIANO ANDRADE MARIN ','QUITO ','PICHINCHA '),(1525,'COLEGIO NACIONAL \" PROF. PEDRO ECHEVERIA TERAN\"','QUITO','PICHINCHA'),(1526,'MIXTO LUCAS PACIOLO','QUITO ','PICHINCHA'),(1527,'COLEGIO PARTICULAR VICENTE ROCAFUERTE','GUAYAQUIL','GUAYAS'),(1528,'UNIDAD EDUCATIVA CAMINO REAL','GUARANDA','BOLIVAR'),(1529,'CONSEJO NACIONAL DE EDUCACION SUPERIOR','QUITO ','PICHINCHA '),(1530,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE MISION ANDINA','TABACUNDO','PICHINCHA'),(1531,'COLEGIO NACIONAL TECNICO VALLE DEL CHOTA ','CHOTA','IMBABURA'),(1532,'COLEGIO PARTICULAR SANTA TERESA','CELICA','LOJA'),(1533,'ANGEL POLIBIO CHAVEZ','SAN MIGUEL','BOLIVAR'),(1534,'NACIONAL TECNICO AGROPECUARIO UNION Y PROGRESO','MANABI','EL CARMEN'),(1535,'COLEGIO NACIONAL TECNICO \"25 DE MAYO\"','CRUCITA','MANABI'),(1536,'INSTITUTO TECNICO SUPERIOR LUIS TELLO','ESMERALDAS ','ESMERALDAS'),(1537,'COLEGIO FISCAL\"LIC. FAUSTO MOLINA MOLINA','SANTA ROSA','EL ORO'),(1538,'NICOLAS INFANTE DIAZ','QUEVEDO ','LOS RIOS '),(1539,'UNIDAD EDUCATIVA MILITAR ELOY ALFARO','QUITO','PICHINCHA'),(1540,'UNIDAD EDUCATIVA ALBERTINA RIVAS MEDINA','MANABI','PORTOVIEJO'),(1541,'COLEGIO PARTICULAR LUIS A. MARTINEZ ','QUITO','PICHINCHA '),(1542,'SAN FRANCISCO','IBARRA','IMBABURA'),(1543,'UNIDAD EDUCATIVA 2 DE AGOSTO','QUITO ','PICHINCHA '),(1544,'COLEGIO PARTICULA \"ATENAS SCHOOL\"','PICHINCHA ','QUITO'),(1545,'UNIDAD EDUCATIVA MARIA AUXILIADORA','CARIAMANGA ','LOJA'),(1546,'UNIDAD EDUCATIVA FISCAL LUIS FELIPE BORJA DEL ALCAZAR ','QUITO ','PICHINCHA'),(1547,'COLEGIO CUNDINAMARCA','BOGOTA ','COLOMBIA'),(1548,'COLEGIO NACIONAL SAN PEDRO DE GUANUCO','GUARANDA','BOLIVAR'),(1549,'INSTITUTO SUPERIOR PEDAGOGICA SAN MIGUEL DE BOLIVAR','SAN MIGUEL','BOLIVAR'),(1550,'INSTITUTO TECNICO SUPERIO CINCO DE AGOSTO','ESMERALDAS ','ESMERALDAS'),(1551,'UNIDAD EDUCATIVA INTERCILTURAL BILINGUE SHIRY CHACA','RIOBAMBA','CHIBORAZO'),(1552,'INSTITUCION EDUCATIVA PROCEL MANUEL QUIROGA','SANTO DOMINGO','SANTO DOMINGO DE LOS SACHILAS'),(1553,'UNIDAD EDUCATIVA MUNICIPAL JULIO ENRIQUE MORENO','QUITO','PICHINCHA'),(1554,'COLEGIO  NACIONAL MOISES GAMEZ GONZALEZ','QUININDE ','ESMERALDAS'),(1555,'UNIDAD EDUCATIVA ALOASI','ALOASI','PICHINCHA'),(1556,'UNIDAD EDUACTIVA ALOASI','ORELLANA','ORELLANA'),(1557,'UNIDADA EDUCATIVA PRESIDENTE TAMAYO','ORELLANA','ORELLANA'),(1558,'UNIDAD EDUCATIVA LA MANÁ','LA MANA ','COTOPAXI'),(1559,'UNIDAD EDUCATIVA DEL VALLE','QUITO','PICHINCHA'),(1560,'INSTITUTO SUPERIOR TECNOLOGICO ESTADOS UNIDOS DE NORTEAMERICA','QUITO','PICHINCHA'),(1561,'INSTITUTO SUPERIOR TECNOLOGICO ESTADOS UNIDOS DE NORTEAMERICA','QUITO','PICHINCHA'),(1562,'UNIDAD EDUCATIVO RIOBLANCO ALTO ','LATACUNGA','COTOPAXI'),(1563,'UNIDAD EDUCATIVA PARTICULAR LUDOTECA PADRE VICTOR GRADOS','QUITO','PICHINCHA'),(1564,'COLEGIO PAUL DIRAC','PICHINCHA ','QUITO'),(1565,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ DE FE Y ALEGRIA','QUITO','PICHINCHA'),(1566,'DANIEL LEON BORJA','PUNGALA','CHIMBARAZO'),(1567,'SIMON RODRIGUEZ','QUEVEDO ','LOS RIOS '),(1568,'UNIDAD EDUCATIVA CHUNCHI','QUITO','CHIMBORAZO'),(1569,'JULIO TOBAR DONOSO ','QUITO ','PICHINCHA'),(1570,'20 DE DICIEMBRE','QUITO','PICHINCHA'),(1571,'FANNY SOLORZANO DE BAIRD','BAHIA DE CARAQUEZ','MANABI'),(1572,'COLEGIO CACIQUE TUMBALA ','ZUMBAHUA','COTOPAXI'),(1573,'COLEGIO DE BACHILLER DE SANTA ROSA ','SANTA ROSA ','EL ORO'),(1574,'COLEGIO HERMANO ALGEL PASTRANA CORRAL ','PUYANGO','LOJA'),(1575,'COLEGIO LENIN SCHOOL','LATACUNGA','COTOPAXI'),(1576,'UNIDAD EDUCATIVA 19 DE SEPTIEMBRE ','SALCEDO ','COTOPAXI'),(1577,'COLEGIO JORGE ALVAREZ','PILLARO','TUNGRAHUA'),(1578,'COLEGIO TECNICO INTERCULTURAL BILINGUE \"LUIS FELIPE WAJAREI\"','SHUSHUFINDI','SUCUMBIOS'),(1579,'UNIDAD EDUCATIVA FISCAL JUAN MONTALVO','QUITO','PICHINCHA'),(1580,'INSTITUTO TECNOLOGICO RAMON BARBA NARANJO ','LATACUGA','COTOPAXI'),(1581,'COLEGIO ANDRES GURITAVE','TADAY','AZOGUES'),(1582,'UNIDAD EDUCATIVA TULCAN ','TULCAN','CARCHI'),(1583,'COLEGIO MONSEÑOR LEONIDAS PROAÑO ','SAN PABLE DE ATENAS ','BOLIVAR'),(1584,'UNIDAD EDUCATIVA GONZALEZ SUAREZ','AMBATO ','TUNGURAHUA'),(1585,'UNIDAD EDUCATIVO MIGUEL DE CERVANTES','PUJILI','COTOPAXI'),(1586,'UNIDAD EDUCATIVA 2 DE AGOSTO','QUITO','PICHINCHA'),(1587,'UNIDAD EDUCATIVA SAN MARINO','PICHINCHA ','QUITO'),(1588,'COLEGIO 6 DE DICIEMBRE ','QUITO','PICHINCHA'),(1589,'CENTRO EDUCATIVOTHOMAS ALVA EDISON','PICHINCHA ','QUITO'),(1590,'UNIDAD EDUCATIVA MONSEÑOR ALBERTO ZAMBRANO PALACIOS','PUYO','PASTAZA'),(1591,'GONZALO ALBAN RUMAZO','LATACUNGA','ALAQUEZ'),(1592,'COLEGIO TECNICO ESPERIMENTAL MARTHA BUCARAN DE ROLDOS','YANZANSA ','ZAMORA CHINCHIPE'),(1593,'COLEGIO ANEXO UNIVERSITARIO JOSE BASURTO MENDOZA','ESMERALDAS ','ESMERALDAS'),(1594,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"JAPON\"','AMBATO ','TUNGURAGUA'),(1595,'COLEGIO PARTICULAR MIXTO NOCTURNO \"DIEGO DE ALMAGRO\"','QUITO','PICHINCHA'),(1596,'COLEGIO ´PARTICULAR HARRY S. TRUMAN ','QUITO ','PICHICHA'),(1597,'COLEGIO TECNICO AGRICOLA ECUADOR','LOJA','LOJA'),(1598,'COLEGIO JUAN FRANCISCO  YEROVI','ALAUSI','CHIBORAZO'),(1599,'COLEGIO TÈCNICO P. MARCOS BENETAZZO','B ABAHOYO','LOS RIOS'),(1600,'INSTITUTO TECNOLOGICO SUPERIOR METROPOLITANO','QUITO','PICHINCHA'),(1601,'COLEGIO NACIONA MIXTO LAS DELICIAS','SANTO DOMINGO  ','SANTO DOMINGO DE LOS SACHILAS'),(1602,'COLEGIO TECNICO BOLIVARIANO','QUITO','PICHINCHA'),(1603,'UNIDAD EDUCATIVA PARTICULAR A DISTANCIA \"NUEVOS HORIZONTES\"','EL TRIUNFO','GUAYAS'),(1604,'UNIDAD EDUCATIVA EXPERIMENTAL LICEO POLICIAL','QUITO','PICHINCHA'),(1605,'COLEGIO TECNICO AGROPECUARIO EUGENIO ESPEJO','TULCAN','CARCHI'),(1606,'UNIDAD EDUCATIVA JOSE MARIA VELASCO IBARRA','EL EMPALME','GUAYAS'),(1607,'UNIDAD EDUCATIVA DIEGO DE ALMAGRO ','GUARANDA','BOLIVAR '),(1608,'PARTICULAR TECNICO AERONAUTICO CORONEL MAYA ','QUITO ','PICHINCHA'),(1609,'COLEGIO PARTICULAR ECUATORIANO AUSTRIACO','GUAYAQUIL','GUAYAS'),(1610,'COLEGIO EXPERIMENTAL CAPITAN EDMUNDO CHIRIBOGA','RIOBAMBA','CHIMBORAZO'),(1611,'COLEGIO NACIONAL AUGUSTO ARIAS','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(1612,'INSTITUCION EDUCATIVA EL REVENTADOR ','GONZALO PIZARRO','SUCUMBIOS'),(1613,'UNIANDES ','AMBATO ','TUGURAHUA'),(1614,'MONSEÑOR LEONIDAS PROAÑO EXTENSION  MORASPUNGO','LATACUNGA','COTOPAXI'),(1615,'JOSE RICARDO CHIRIBOGA','QUITO','PICHINCHA'),(1616,'COLEGIO MIXTO LCDO. CARLOS ESTARELLAS AVILEZ','GUAYAQUIL','GUAYAS'),(1617,'UNIVERSIDAD TECNICA DEL NORTE','IBARRA','IMBABURA'),(1618,'UNIDAD EDUCATIVA DR CARLOS LUIS PLAZA DAÑIN','VALENCIA','LOS RIOS'),(1619,'COLEGIO PARTICULAR PICHINCHA DE CONOCOTO','RUMIÑAHUI','PICHINCHA'),(1620,'INSTITUCION EDUCATIVA FISCAL DR EMILIO UZCATEGUI','QUITO','PICHINCHA'),(1621,'COLEGIO CARDENAL SPINOLA DE FE  Y ALEGRIA','QUITO','PICHINCHA'),(1622,'UNIDAD EDUCATIVA HUGO CRUZ ANDRADE','EL CARMEN ','MANABI'),(1623,'UNIDAD EDUCATIVA  21 DE JULIO ','YAGUACHI ','GUAYAS'),(1624,'COLEGIO PARTICULAR SEGUNDO ANGEL TAPIA','QUITO','PICHINCHA'),(1625,'UNIDAD EDUCATIVA  PARTICULAR PCEI ECUADOR ','QUITO','PICHINCHA'),(1626,'UNIDAD EDUCATIVA JUAN DE SALINAS','QUITO','SANGOLQUI'),(1627,'UNIDAD EDUCATIVA PUEBLO VIEJO','PUEBLO VIEJO ','LOS RIOS '),(1628,'UNIDAD EDUCATIVA RICON DEL SABER ','QUITO ','PICHINCHA '),(1629,'COLEGIO TECNICO ASAAD BUCARAN','MACHALA','EL ORO'),(1630,'COLEGIO JERONIMO CARRION ','LAGO AGRIO','SUCUMBIOS'),(1631,'COLEGIO NACIONAL MIXTO EXPERIMENTAL AMAZONAS','QUITO','PICHINCHA'),(1632,'UNIDAD EDUCATIVA MEJIA D7','QUITO','PICHINCHA'),(1633,'UNIDAD ECUACTIVA A DISTANCIA SUCRE','QUITO','PICHINCHA'),(1634,'UNIDA EDUCATIVA FISCAL LA UNION ','ESMERALDAS ','ESMERALDAS'),(1635,'COLEGIO PARTICULAR DIEZ DE NOVIEMBRE ','OTAVALO','IMBABURA'),(1636,'UNIDAD EDUCATIVA A DISTANCIA DE ESMERALDAS ','DICHE ','ESMERALDAS'),(1637,'INSTITUTO NACIONAL MEJIA ','QUITO ','PICHINCHA'),(1638,'SILVIO LUIS HARO ALVEAR ','PIMAMPIRO','IMBABURA'),(1639,'RINCON DEL SABER ','QUITO','PICHINCHA'),(1640,'UNIDAD EDUCATIVA IMBABURA PCEI','IBARRA','IMBABURA'),(1641,'UNIDAD EDUCATIVA LUIS ULPIANO DE LA TORRE','COTACAHI','IMBABURA'),(1642,'UNIDAD EDUCATIVA  GENERAL  JULIO ANDRADE ','BOLIVAR','CARCHI'),(1643,'UNIDAD EDUCATIVA FAE Nº 5 ','LATACUNGA','COTOPAXI'),(1644,'UNIDAD EDUCATIVA FISCAL MARIA EUGENIA DURAN BALLEN ','FLAVIO ALFARO ','MANABI'),(1645,'COLEGIO SANTO DOMINGO DE LOS COLORADOS ','SANTO DOMINGO DE LOS SACHILAS ','SANTO DOMINGO DE LOS TSACHILAS'),(1646,'UNIDAD EDUCATIVA SAN JOSÉ  DE GUAYTACAMA','LATACUNGA','COTOPAXI'),(1647,'UNIDAD EDUCATIVA TOMAS OLEAS','RIOBAMBA','CHIMBORAZO'),(1648,'LA UNIDAD EDUCATIVA A DISTANCIA DE LOJA','LOJA','LOJA'),(1649,'HIGH SCHOOOL SANTA MARIA ','QUITO ','PICHINCHA'),(1650,'COLEGIO PARTICULAR JIM IRWIN ','QUITO','PICHINCHA'),(1651,'UNIDAD EDUCATIVA LOS RIOS','BABAHOYO','LOS RIOS'),(1652,'COLEGIO FISCAL \"AÍDA GALLEGOS DE MONCAYO','QUITO ','PICHINCHA'),(1653,'UNIDAD EDUCATIVA MARINA CASTILLO DE YEPEZ','VENTANAS','LOS RIOS'),(1654,'COLEGIO MUNICIPIO DE LORETO','LORETO','ORELLANA'),(1655,'COLEGIO METROPOLITANO JOSE MILLER SALAZAR ','QUITO','PICHINCHA'),(1656,'UNIDAD EDUCATIVA SAN FRANCISCO DEL CABO','MUISNE','ESMERALDAS'),(1657,'CENTRO EDUCATIVO MATRIZ INTERCULTURAL BILINGUE \"PULL CHICO\"','GUAMOTE','CHIMBORAZO'),(1658,'INSTITTUTO TECNOLOGICO DE MUSICA INES COBO DONOSO ','LATACUGA','COTOPAXI'),(1659,'INSTITUTO TECNOLOGICO SUPERIOR CENTRAL TECNICO SECCION NOCTURNO','QUITO','PICHINCHA'),(1660,'INSTITUTO TECNOLOGICO SUPERIOR HUALCOPO DUCHICELA','COLUMBE','CHIBORAZO'),(1661,'COLEGIO NACIONAL TECNICO VICENTE ROCAFUERTE','QUITO','PICHINCHA'),(1662,'UNIDAD EDUCATIVA \"LA PROVIDENCIA\"','QUITO','PICHINCHA'),(1663,'UNIDAD EDUCATIVA DEL MILENIO REPLICA 24 DE MAYO','QUITO','PICHINCHA'),(1664,'COLEGIO PARTICULAR OSWALDO GUAYASAMIN','JOYA DE LOS SACHAS','ORELLANA'),(1665,'UNIVERSIDAD TECNICA LUIS VARGAS LUIS VARGAS TORRES DE ESMERALDAS','ESMERALDAS ','ESMERALDAS'),(1666,'COLEGIO NACIONAL TECNICO \"22 DE MARZO\"','SAN LORENZO','ESMERALDAS'),(1667,'UNIDAD EDUCATIVA SAN FRANCISCO DE ASIS ','BALSAS ','EL ORO '),(1668,'INSTITUCION EDUCATIVA ALEJANDRO HUMBOLTH','EL CORAZON','COTOPAXI'),(1669,'COLEGIO NACIONAL PEDRO VICENTE MALDONADO ','RIOBAMBA','CHIMBORAZO'),(1670,'COLEGIO JAIME ROLDOS AGUILERA','VENTANAS','LOS RIOS'),(1671,'COLEGIO PARTICULAR HARRIET BEECHER STOWE','QUITO','PICHINCHA'),(1672,'COLEGIO NACIONAL MIXTO \"MARIA ANGELICA CARRILLO DE MATA MARTINEZ\"','QUITO','PICHINCHA'),(1673,'UNIDAD EDUCATIVA CUSUBAMBA ','QUITO','PICHINCHA'),(1674,'INTERCULTURAL BILINGUE DANIEL EVAS GUARACA','RIOBAMBA','CHIBORAZO'),(1675,'UNIDAD EDUCATIVA PARTICULAR LATINOAMERICANO','QUITO ','PICHINCHA'),(1676,'COLEGIO NACIONAL \"ANGEL TINOCO RUIZ\"','MACHALA','ORO '),(1677,'SECAP','TENA ','NAPO'),(1678,'DR. LUIS ALFONSO SALTOS ESPINOZA','GUAYAQUIL','GUAYAS'),(1679,'UNIDAD EDUCATIVA FISCAL 15 DE OCTUBRE','JIPIJAPA','MANABI'),(1680,'UNIDAD EDUCATIVA A DISTANCIA \"DR. EUGENIO ESPEJO\"','GUAYAQUIL','GUAYAS'),(1681,'COLEGIO PARTICULAR AURELIO MOSQUERA','QUITO','PICHINCHA'),(1682,'GENERAL VICENTE ANDA AGUIRRE','RIOBAMBA','CHIMBORAZO'),(1683,'INTITUCION EDUCATIVA FISCAL GONZALO ZALDUMBIDE','QUITO','PICHINCHA'),(1684,'UNIDAD EDUCATIVA 14 DE ENERO','STO DMGO ','STO DMGO DE LOS COLORADOS'),(1685,'HUMANISTICO QUITO','QUITO','PICHINCHA'),(1686,'VIEJO LUCHADOR POPULAR','QUITO','PICHINCHA'),(1687,'INSTITUTO EDUCATIVA FISCAL NACIONAL UNE','QUITO','PICHINCHA'),(1688,'NUESTRA SEÑORA DEL CISNE','QUITO','PICHINCHA'),(1689,'NUESTRA SEÑORA DEL CISNE','QUITO','PICHINCHA'),(1690,'NUESTRA SEÑORA DEL CISNE','QUITO','PICHINCHA'),(1691,'UNIDAD EDUCATIVA PARTICULAR GONZALO RUALES BENALCAZAR','QUITO','PICHINCHA'),(1692,'MANUELA DE SANTA CRUZ Y ESPEJO ','QUITO ','PICHINCA'),(1693,'COLEGIO 10 DE NOVIEMBRE ','GUARANDA','BOLIVAR '),(1694,'COLEGIO FISCAL TECNICO \"OTTO AROSEMENA GOMEZ\"','GUAYAQUIL','GUAYAS'),(1695,'COLEGIO TECNICO DR CARLOS CUEVAS TAMARIZ','GUAYAQUIL','GUAYAS'),(1696,'JORGE ARSENIO MOGROVEJO NEPTALI','QUINSALOMA','LOS RIOS'),(1697,'COLEGIO FISCAL ROBERTOLUISCERVANTESMANTAÑO','ESMERALDAS ','ESMERALDAS'),(1698,'SAN JOSE DE GUAYTACAMA','LATACUNGA','COTOPAXI'),(1699,'COLEGIO NACIONAL GUAYLLABAMBA','GUAYLLABAMBA','PICHINCHA'),(1700,'COLEGIO NOCTURNO RUMAÑAHUI','QUITO','PICHINCHA'),(1701,'COLEGIO THE QUITO','QUITO','PICHINCHA'),(1702,'COLEGIO NACIONAL MIXTO ANGEL MODESTO PAREDES','QUITO ','PICHINCHA'),(1703,'COLEGIO PARTICULAR SIGLO XXI ','QUITO ','PICHINCHA'),(1704,'UNIDAD EDUCATIVA PARTICULAR SAN JOSE ','QUEVEDA','LOS RIOS'),(1705,'COLEGIO FISCAL PROVINCIA BOLIVAR','GUARANDA','BOLIVAR'),(1706,'UNIDAD EDUCATIVA GLEND SIDE','QUITO','PICHINCA'),(1707,'UNIDAD EDUCATIVA JORGE ARSENIO MOGROVEJO VELASCO ','QUISALOMA','LOS RIOS '),(1708,'COLEGIO E INSTITUTO DR ENRIQUE NOBOA ARIZAGA','LA TRONCAL','CAÑAR'),(1709,'DR. CAMILO PONCE ENRIQUEZ','QUEVEDO ','BABAHOYO'),(1710,'COLEGIO TECNICO PARTICULAR LOS PINOS','QUITO','PICHINCHA'),(1711,'LEONARDO MALDONADO PEREZ','PUEMBO','PICHINCHA'),(1712,'COLEGIO NACIONAL BOLIVAR ','AMBATO ','TUGURAHUA'),(1713,'UNIDAD EDUCATIVA ALFONSO HERRERA','EL ANGEL ','CARCHI'),(1714,'COLEGIO NACIONAL NOCTURNO FLOR MARIA INFANTE','SAN MIGUEL','BOLIVAR'),(1715,'UNIDAD EDUCATIVA PARTICULAR SANTA ANA ','QUITO','PICHINCHA'),(1716,'UNIDAD EDUCATIVA ISMAEL PROAÑO ANDRADE ','TAMBILLO','PICHINCHA'),(1717,'FRANCISCO  ARIZAGA LUQUE','GUAYAQUIL','GUAYAS '),(1718,'UNIDAD EDUCATIVA JULIO E. MORENO','QUITO','PICHINCHA'),(1719,'COLEGIO MIXTO PARTICULAR PITAGORAS','QUITO','PICHINCHA'),(1720,'COLEGIO EXPERIMENTAL PADRE MIGUEL GAMBOA ','ORELLANA','PUERTO FRANCISCO DE ORELLANA '),(1721,'UNIDAD EDUCATIVA FRANCISCO ARIZAGA LUQUE ','GUAYAQUIL','GUAYAS'),(1722,'COLEGIO NACIONAL MIXTO HUMBERTO FIERRO','SUCUMBIOS','LAGO AGRIO'),(1723,'COLEGIO REPUBLICA DEL ECUADOR ','QUEVEDO ','LOS RIOS '),(1724,'COLEGIO NACIONAL TAYUZ ','TAYUZA','MORONA SANTIAGO'),(1725,'UNIDAD EDUCATIVA EXPERIMENTAL QUITO SUR','QUITO ','PICHINCHA'),(1726,'COLEGIO EXPERIMENTAL 28 DE MAYO','GUAYAQUIL','GUAYAS'),(1727,'COLEGIO NACIONAL MARIANO BENITEZ','PELILEO ','TUNGURAHUA'),(1728,'COLEGIO NACIONAL TECNICO REPUBLICA DE RUMANIA','QUITO','PICHINCHA'),(1729,'COLEGIO PARTICULAR BETHEL DEL VALLE','YARUQUI','PICHINCHA'),(1730,'COLEGIO PARTICULAR BETHEL DEL VALLE','YARUQUI','PICHINCHA'),(1731,'INSTITUTO TECNOLOGICO PELILEO ','AMBATO ','TUNGURAGUA'),(1732,'WALTER QUIÑONEZ SEVILLA N. 525','ESMERALDAS ','ESMERALDAS'),(1733,'UNIVERSIDAD TECNICA DE MANABI ','PORTOVIEJO','MANABI'),(1734,'UNIDAD EDUCATIVA EMIGDIO ESPARZA MORENO','BABAHOYO','LOS RIOS'),(1735,'TECNICO AGROPECUARIO SAN JUAN ','RIOBAMBA','CHIMBORAZO'),(1736,'EXPERIMENTALL E INSTITUTO PEDAGOGICO JUAN MONTALVO ','QUITO ','PICHINCHA '),(1737,'UNIDAD EDUCATIVA ELOY ALFARO ','LOJA','LOJA '),(1738,'COLEGIO TECNICO MIXTO CATOLICO SIMON BOLIVAR','CATARAMA','LOS RIOS'),(1739,'COLEGIO GIORDANO BRUNO','QUITO','PICHINCHA'),(1740,'UNIDAD EDUCATIVA PACIFICO CEMBRAMOS','NUEVA LOJA ','SUCUMBIOS'),(1741,'COLEGIO PARTICULAR A DISTANCIA CECOMSYS','LA TACUNGA','COTOPAXI'),(1742,'INSTITUTO TECNOLOGICO SUPERIOR EL PACIFICO ','QUITO ','PICHINCHA'),(1743,'COLEGIO PARTICULAR  \"PROVINCIA DE GALAPAGOS\"','GUAYAQUIL','GUAYAS '),(1744,'INSTITUCION EDUCATIVA GUALLABAMBA','QUITO','PICHINCHA'),(1745,'UNIVERSIDAD NACIONAL DE LOJA ','LOJA ','LOJA '),(1746,'COLEGIO PARTICULAR ABDON CALDERON','QUEVEDO','LOS RIOS'),(1747,'INSTITUTO JAIME ROLDOS AGUILERA','QUITO','PICHINCHA'),(1748,'COLEGIO PARTICULAR MIXTO TRECE DE ABRIL ','BABAHOYO ','LOS RIOS '),(1749,'COLEGIO CARLOS MARTINEZ ACOSTA ','MIRA ','CARCHI '),(1750,'UNIDAD EDUCATIVA SAN JUAN BOSCO ','QUITO ','PICHINCHA'),(1751,'COLEGIO SANTIAGO DE QUITO ','RIOBAMBA ','CHIMBORAZO '),(1752,'COLEGIO PARTICULAR ITALIA ','QUITO ','PICHINCHA'),(1753,'CESAR ANTONIO MOSQUERA','TULCAN','CARCHI'),(1754,'COLEGIO DE COMERCIO ANTONIO AVILA','CUENCA ','AZUAY '),(1755,'VINCENT VAN GOGH','QUITO ','PICHINCHA'),(1756,'COLEGIO PARTICULAR ASAMBLEAS DE DIOS','QUITO','PICHINCHA'),(1757,'INSTITUTO TECNOLOGICO IBEROAMERICA','QUITO','PICHINCHA'),(1758,'COLEGIO NACIONAL TECNICO ARENILLAS','ARENILLAS','EL  ORO'),(1759,'UNIDAD EDUCATIVA MARIO COBO BARONA ','AMBATO ','TUNGURAHUA '),(1760,'UNIDAD EDUCATIVA ROSA ZARATE','SALCEDO','COTOPAXI'),(1761,'COLEGIO FISCAL \"16 DE MAYO\"','QUINSALOMA','LOS RIOS'),(1762,'COLEGIO NACIONAL TECNICO \"URCUQUI\"','URCUQUI','IBARRA'),(1763,'COLEGIO UNIVERSITARIO UTN','IBARRA','IMBABURA'),(1764,'UNITED KINGDOM','QUITO','PICHINCHA'),(1765,'COLEGIO FISCAL COMPENSATORIO \"JOSE MARIA VELASCO IBARRA\" ','EL EMPALME','GUAYAS '),(1766,'EL COLEGIO RAUL GONZALEZ ASTUDILLO ','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(1767,'UNIDAD EDUCATIVA JULIO ENRIQUE MORENO ','QUITO ','PICHINCHA'),(1768,'UNIDAD EDUCATIVA TUMBACO ','PICHINCHA ','QUITO '),(1769,'COLEGIO DR EUGENIO ESPEJO ','GUARANDA','BOLIVAR '),(1770,'SANTA ROSA ','AMBATO ','TUNGURAHUA'),(1771,'COLEGIO POPULAR MUNDO NUEVO ','QUITO','PICHINCHA'),(1772,'INSTITUTO TECNOLOGICO SUPERIOR \"DUCHICELA SHYRI XII\"','LLINLLIN ','CHIMBORAZO'),(1773,'COLEGIO TECNICO LATINOAMERICANO POPULAR ','QUITO ','PICHINCHA'),(1774,'UNIDAD EDUCATIVA ISINLIVI ','LATACUNGA ','COTOPAXI '),(1775,'COLEGIO PARTICULAR 15 DE SEPTIEMBRE ','BABA ','LOS RIOS '),(1776,'FUERZA AEREA  ECUATORIANA N.1','QUITO','PICHINCHA'),(1777,'COLEGIO NACIONAL NOCTURNA SEIS DE DICIEMBRE ','QUITO ','PICHINCHA'),(1778,'COLEGIO PARTICULAR SAN FRANCISCO DE QUITO ','QUITO ','PICHINCHA'),(1779,'COLEGIO NACIONAL MIXTO \"DR. BRUNO SANCHEZ CARREÑO\"','PORTOVIEJO','MANABI '),(1780,'UNIDAD EDUCATIVA ROSA HERLINDA GARCIA DE GARCIA ','AMALUZA','LOJA'),(1781,'UNIDAD EDUCATIVA SANTIAGO APOSTOL','PICHINCHA ','QUITO'),(1782,'UNIDAD EDUCATIVA PRIMICIAS DE LA CULTURA DE QUITO ','QUITO ','PICHINCHA'),(1783,'COLEGIO TECNICO AGROPECUARIO BALZAR','BALZAR','GUAYAS'),(1784,'UNIDAD EDUCATIVA \"SAN FRANCISCO DE SALES\"','ALAUSI','CHIMBORAZO'),(1785,'COLEGIO PARTICULAR \"ARISTOTELES\" ','QUITO ','PICHINCHA'),(1786,'COLEGIO PILOTO EXPERIMENTAL \"CAMILO PONCE ENRIQUEZ\"','QUITO','PICHINCHA'),(1787,'UNIDAD EDUCATIVA QUITO SUR ','QUITO ','PICHINCHA'),(1788,'INSTITUTO SUPERIOR PEDAGOGICO CHIMBORAZO','RIOBAMBA','CHIMBORAZO'),(1789,'10 DE ENERO ','GUARANDA ','BOLIVAR '),(1790,'UNIDAD EDUCATIVA MARSICAL SUCRE ','LAGO AGRIO ','SUCUMBIOS '),(1791,'UNIDAD EDUCATIVA PEDRO PABLO BORJA UNO','PICHINCHA ','QUITO'),(1792,'SAN GABRIEL ','LAGO AGRIO ','SUCUMBIOS'),(1793,'UNIDAD EDUCATIVA 2 DE AGOSTO ','QUITO ','PÌCHINCHA'),(1794,'INSTITUCION EDUCATIVA NUEVO MUNDO EN LAS MANOS DE DIOS','SANGOLQUI','PICHINCHA'),(1795,'UNIDAD EDUCATIVA FISCAL A DISTANCIA P. JORGE UGALDE PALADINES','PORTOVIEJO','MANABI'),(1796,'COLEGIO NACIONAL TECNICO DR. OTTO AROSEMENA GOMEZ ','GAYAQUIL','GUAYAS '),(1797,'COLEGIO POPULAR PARTICULAR SAN JUAN  PABLO II','PICHINCHA ','QUITO'),(1798,'COLEGIO TECNICO MIGUEL DE SANTIAGO ','QUITO ','PICHINCHA'),(1799,'COLEGIO FISCAL TECNICO AGRICOLA PUEBLO NUEVO','EL EMPALME','GUAYAS'),(1800,'UNIDAD EDUCATIVA CESAR SANDOVAL VITERI','LATACUNGA','COTOPAXI'),(1801,'COLOGIO NACILNAL CUTUGLAGUA','PICHINCHA ','QUITO'),(1802,'COLEGIO NACIONAL MONTUFAR','PICHINCHA ','QUITO'),(1803,'UNIDAD UDUCATIVA POLICIA NACIONAL','PICHINCHA ','QUITO'),(1804,'COLEGIO PARTIOCULAR CHECA','QUITO','PICHINCHA'),(1805,'COLEGIO PARTICULAR CHECA','QUITO','PICHINCHA'),(1806,'COLEGIO MIXTO MARCO OCHOA MUÑOZ','PUYANGO','LOJA'),(1807,'COLEGIO TECNICO PARTICULAR  \"CRISTO SALVADOR\"','QUITO ','PICHINCHA'),(1808,'COLEGIO PARTICULAR INSTITUTO SIMON BOLIVAR ','GUAYAQUIL','GUAYAS'),(1809,'UNIDAD EDUCATIVA FISCAL ABDON CALDERON ','QUITO','PICHINCA'),(1810,'MANUELA GARAICOA DE CALDERON','CUENCA ','AZUAY '),(1811,'UNIDAD EDUCATIVA TECNICO FISCAL \"VICTOR PROAÑO CARRION\"','CHIMBORAZO','COTOPAXI'),(1812,'UNIDAD EDUCATIVA PROVINCIA DE COTOPAXI ','COTOPAXI','PUJILI'),(1813,'COLEGIO DIURNO LEON RUALES ','MIRA ','CARCHI'),(1814,'DR MIGUEL ANGEL ZAMBRANO','QUITO','PICHINCHA'),(1815,'COLEGIO PARTICULAR MIXTO NOCTURNO CHIMBORAZO ','QUITO','PROVINCIA '),(1816,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE CALANCHA','RIOBAMBA','CHIMBORAZO'),(1817,'COLEGIO DE BACHILLERATO MACAS','MACAS','MORONA SANTIAGO'),(1818,'COLEGIO NACIONAL PICOAZA','PORTOVIEJO','MANABI'),(1819,'TECNICO AGROPECUARIO \"29 DE MAYO\"','LOJA','PALTAS'),(1820,'UNI.FOR.ART.PART.TECN.NAZARETH','GUAYAQUIL','GUAYAS'),(1821,'COLEGIO FISCAL MIXTO VENTANAS','VENTANAS','LOS RIOS'),(1822,'UNIDAD EDUCATIVA SAN FERNANDO','PICHINCHA ','QUITO'),(1823,'INSTITUTO SUPERIOR PARTICULAR CAMILO GALLEGOS LARA','PRORTOVIEJO','MANABI'),(1824,'INST. TEC. SUPERIOR DR. CAMILO GALLEGOS DOMINGUEZ','PRORTOVIEJO','MANABI'),(1825,'EL COLEGIO E INSTITUTO NORMAL MANUELA CAÑIZARES ','QUITO ','PICHINCHA '),(1826,'INSTITUTO SUPERIOR RAUL PREBISCH','QUITO ','PICHINCHA '),(1827,'EL COLEGIO EXPERIMENTAL 24 DE MAYO','PICHINCHA ','QUITO '),(1828,'MARIA DE NAZARET ','QUITO','PICHINCHA'),(1829,'COLEGIO DE BACHILLERATO PIYANGO','LOJA','LOJA'),(1830,'CORPORACION EDUCATIVA ARKOS','FACATATIVA','DEP. CUNDINAMARCA'),(1831,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE \"MUSHUK PAKARI\"','QUITO','PICHINCHA'),(1832,'UNIDAD EDUCATIVA PUYANGO','PUYANGO','LOJA'),(1833,'INSTITUTO SUPERIOR JUNIOR TECHNOLOGY','QUITO','PICHINCHA'),(1834,'COLEGIO NACIONAL ONCE DE FEBRERO','QUITO','PICHINCHA'),(1835,'UNIDAD EDUCATIVA DR. GONZALO ABAD GRIJALVA','CHONE','MANABI'),(1836,'COLEGIO TECNICO AGROPECUARIO ODILON GOMEZ','CHONE','MANABI'),(1837,'UNIDAD EDUCATIVA PAULO EMILIO MACIAS','CDLA.ANDRES DE VERA','MANABI'),(1838,'DR.JULIO CESAR TRUJILLO','VENTANAS ','LOS RIOS '),(1839,'UNIDAD EDUCATIVA DR RICARDO CORNEJO ROSALES','QUITO','PICHINCHA'),(1840,'COLEGIO JOSE MARIA ASPIAZU Y AVILES ','PAMBILAR DE CALOPE','LOS RIOS'),(1841,'UNIDAD EDUCATIVA  TECNICA YARUQUI','YARUQUI','PICHINCHA'),(1842,'UNIDAD EDUCATIVA F.M A DISTANCIA PADRE MARTINEZ FERNANDEZ','OYACACHI','NAPO'),(1843,'COLEGIO FISCAL DR JOSE MARIA VELASCO IBARRA','BUENA FE','LOS RIOS'),(1844,'ALMIRANTE THOMAS CHARLES WRIGHT MONTGOMERY','GUAYAQUIL','GUAYAS'),(1845,'UNIVERSIDAD LATINA DE PANAMA','PANAMA','PANAMA'),(1846,'INSTITUCION EDUCATIVA ARCO IRIS OCCIDENTAL','QUITO','PICHINCHA'),(1847,'UNIDAD EDUCATIVA FIDCOMISIONAL YANCHANA INTI ','ORELLANA','SUCUMBIOS'),(1848,'UNIVERSIDAD LAICA \"ELOY ALFARO\"','MANTA','MANABI'),(1849,'COLEGIO PARTICULAR \"MARCELINO CHAMPAGNIA\"','QUITO','PICHINCHA'),(1850,'UNIDAD EDUCATIVA PARTICULAR PCEI \" ECUADOR\" ','QUITO ','PICHINCHA '),(1851,'COLEGIO PARTICULAR \"QUITO \"','QUITO ','PICHINCHA'),(1852,'UNIDAD EDUCATIVA BERBARDO VALDIVIESO','QUITO','PICHINCHA '),(1853,'COLEGIO TECNICO PARTICULAR PCEI SIGLO XXI','SANGOLQUI ','RUMIÑAHUI'),(1854,'UNIDAD EDUCATIVA FISCOMISIONAL SAN LUIS GONZAGA','MUISNE','ESMERALDAS'),(1855,'UNIDAD EDUCATIVA FISCAL ARTURO BORJA','QUITO ','PICHINCHA '),(1856,'UNIDAD EDUCATIVA \"RAFAEL ASTUDILLO\"','COLON ELOY','ESMERALDAS'),(1857,'UNIDAD EDUCATIVA CRNL. DE E.M DE POLICIA MILTON OSWALDO BORJA BORJA','LATACUNGA','COTOPAXI'),(1858,'COLEGIO \"DOCTOR RICARDO CORNEJO ROSALES\"','QUITO','PICHINCHA'),(1859,'TECNOLOGICO UNIVERSITE','QUITO','PICHINCHA'),(1860,'UNIDAD EDUCATIVA SAN VICENTE FERRER','PUYO','PASTAZA'),(1861,'COLEGIO TECNICO BILINGUE GUAMANI','ARCHIDONA','NAPO'),(1862,'DR. JOSE MARIA VELASCO IBARRA ','QUITO','PICHINCHA '),(1863,'UNIDAD EDUCATIVA ASCAZUBI','CAYAMBE ','PICHINCHA'),(1864,'COLEGIO PARTICULAR \"DAVID P. AUSUBEL\"','QUITO','PICHINCHA'),(1865,'UNIVERSIDAD DE LAS AMERICAS','QUITO','PICHINCHA'),(1866,'COLEGIO  FISCAL  EL PARAISO ','MANABI','EL CARMEN'),(1867,'COLEGIO TECNICO RUBEN CEVALLOS VEGA','TENA','NAPO'),(1868,'COLEGIO TECNICO 19 DE MAYO','LA MANA ','LA MANA'),(1869,'UNIDAD EDUCATIVA JUAN XXLLL','TENA ','NAPO'),(1870,'UNIDAD EDUCATIVA MILENIO BICENTENARIO ','QUITO','PICHINCHA'),(1871,'SAN PEDRO PASCUAL','PICHINCHA ','QUITO'),(1872,' COLEGIO BOLIVARIANO COOP DE EDUCACION','PICHINCHA ','QUITO'),(1873,'COLEGIO FISCAL MIXTO SOLDADO MONGE','GUAYAS ','EL EMPALME '),(1874,'UNIDAD EDUCATIVA JUAN CARLOS MATHEUS POZO','ESMERALDAS ','ESMERALDAS'),(1875,'UNIDAD EDUCATIVA 10 DE ENERO','GUARANDA','BOLIVAR'),(1876,'COLEGIO NACIONAL MIXTO \"ATAHUALPA\"','MACHALA','EL ORO'),(1877,'COLEGIO NACIONAL MIXTO GONZALO ESCUDERO ','QUITO ','PICHINCHA'),(1878,'INSTITUCION EDUCATIVA ANTONIO SAMANIEGO','MACAS','MORONA SANTIAGO'),(1879,'COLEGIO PARTICULAR RAFAEL GALETH - PCEI','ORELLANA','ORELLANA'),(1880,'UNIDAD EDUCATIVA VICENTE LEON','LA TACUNGA','COTOPAXI'),(1881,'INSTITUTO TECNICO SUPERIOR GRAN COLOMBIA  ','QUITO ','PICHINCHA '),(1882,'COLEGIO JUAN MONTALVO ','QUITO ','PICHINCHA'),(1883,'COLEGIO PARTICULAR SEMIPRESENCIAL OCEANO PACIFICO ','MANABI','MANABI'),(1884,'JUAN PABLO II DE FE Y ALEGRIA','CANTON EL CARMEN','MANABI'),(1885,'INSTITUCION EDUCATIVA JULIO CORTAZAR','QUITO','PICHICHA'),(1886,'INSTITUCION EDUCATIVA VICENTE ANDA AGUIRRE','MOCHA','TUNGURAHUA'),(1887,'COLEGIO PARTICULAR BILINGUE TECNICO AGROPECUARIO POPULAR SURUPUCYU','GUARANDA','BOLIVAR'),(1888,'COLEGIO INTERCULTURAL BILINGUE TECNICO AGROPECUARIO POPULAR SURUPUCYU','GUARANDA ','BOLIVAR'),(1889,'COLEGIO FISCAL HUMBERTO MOREIRA MARQUEZ','VENTANAS','LOS RIOS'),(1890,'UNIVERCIDAD TECNICA DE LOJA ','LOJA ','LOJA '),(1891,'COLEGIO LOLA AROSEMENA DE CARBO','GUAYAQUIL','GUAYAS'),(1892,'INSTITUCION EDUCATIVA SAN CARLOS','QUEVEDO ','LOS RIOS'),(1893,'UNIVERSIDAD DE LAS FUERZAS ARMADAS ESPE ','SANGOLQUI','RUMIÑAHUI'),(1894,'COLEGIO NACIONAL PROVINCIA DE BOLIVAR','BOLIVAR ','GUARANDA '),(1895,'NACIONAL SAQUISILI','SAQUISILI','COTOPAXI'),(1896,'UNIDAD EDUCATIVA A DISTANCIA ICAM QUITO','QUITO','PICHINCHA'),(1897,'UNIDAD EDUCATIVA 12 DE NOVIEMBRE','PILLARO','TUNGURAHUA'),(1898,'INSTITUTO DE MUSICA \"DRA. TEODORA LUCACIU\"','MACHALA','EL ORO'),(1899,'COLEGIO PARTICULAR \"JULIO CORTAZAR\"','QUITO','PICHINCHA'),(1900,'COLEGIO PARTICULAR \"JULIO CORTAZAR\"','QUITO','PICHINCHA'),(1901,'COLEGIO FISCAL NOCTURNO DR ALFREDO BAQUERIZO MORENO','GUAYAQUIL','GUAYAS'),(1902,'UNIDAD EDUCATIVA MONSEÑOR LEONIDAS PROAÑO','COTOPAXI','LATACUNGA '),(1903,'UNIDAD EDUCATIVA RUMIÑAHUI','RUMIÑAHUI','PICHINCHA'),(1904,'COLEGIO INTERCULTURAL BILINGUE TECNICO SURUPUCYU','GUARANDA','BOLIVAR'),(1905,'NACIONAL CHILLAGANES','CHILLANES','BOLIVAR'),(1906,'COLEGIO NACIONAL MANUEL GONZALO ALBAN RUMAZO ','LATACUNGA','COTOPAXI'),(1907,'COLEGIO NACIONAL MIXTO GONZOL','GONZOL','CHIMBORAZO'),(1908,'COLEGIO NACIONAL FEMENINO DR. CAMILO GALLEGOS DOMINGUEZ','ARRENILLAS','EL ORO'),(1909,'UNIDAD NATALIA JARRIN DE ESPINOZA','CAYAMBE','PICHINCHA'),(1910,'UNIDAD EDUCATIVA MARIETA DE VEINTIMILLA ','SOZORANGA','LOJA'),(1911,'COLEGIO NACIONAL CARLOS ALBERTO AGUIRRE AVILES','MANABI','BABAHOYO'),(1912,'UNIDAD EDUCATIVA LA FLORIDA','GUAYAQUIL','GUAYAS'),(1913,'UNIDAD EDUCATIVA DEL MILENIO CACIQUE TUMBALA','PIJILI','COTOPAXI'),(1914,'UNIDAD EDUCATIVA RITA LECUMBERRI','GUAYAQUIL','GUAYAS'),(1915,'COLEGIO DARIO GUEVARA MAYORGA','PICHINCHA ','QUITO'),(1916,'UNIDAD EDUCATIVA CUYABENO','TARAPOA','SUCUMBIOS'),(1917,'UNIDAD EDUCATIVA 2 DE AGOSTO ','QUITO','PICHINCHA'),(1918,'DR TRAJANDO NARANJO JACOME ','COTOPAXI','COTOPAXI'),(1919,'UECIB GENERAL RUMIÑAHUI','CHIMBORAZO','RIOBAMBA'),(1920,'COLEGIO NACIONAL GRAL. MARCO AURELIO SUBIA','TANICUCHI','COTOPAXI'),(1921,'UNIDAD EDUCATIVA LA MAGDALENA ','GUARANDA ','BOLIVAR'),(1922,'COLEGIO TECNICO \"VEINTIUNO DE ABRIL\"','FLORES','CHIMBORAZO'),(1923,'VICTOR MANUEL PEÑAHERRERA','ESMERALDAS ','ESMERALDAS'),(1924,'COLEGIO MARIA AUGUSTA URRUTIA','PICHINCHA ','QUITO'),(1925,'ESCUELA DE EDUCACION BASICA \"10 DE AGOSTO\"','QUITO','PICHINCHA'),(1926,'INST. TEC. SUP. OSCAR ENFREN REYES','TUNGURAHUA ','BAÑOS '),(1927,'UNIDAD EDUCATIVA FISCAL \"CIUDAD DE TENA\"','TENA','NAPO'),(1928,'UNIDAD EDUCATIVA FISCOMISIONAL \"JOSE MARIA VELAZ, S.J\" EXTENSION EDUCATIVA Nº99 LATACUNGA','LATACUNGA','COTOPAXI'),(1929,'UNIVERSIDAD CRISTIANA LATINOAMERICANO','QUITO','PICHINCHA'),(1930,'COLEGIO FISCAL MIXTO \" ASSAD BUCARAM EL MHALIM\"','RIOBMBA','CHIMBARAZO'),(1931,'INSTITUTO SUPERIOR TECNOLOGICO LIBERTAD','QUITO','PICHINCHA'),(1932,'COLEGIO NACIONAL TECNICO \"DR. CAMILO GALLEGOS DOMINGUEZ\"','LATACUNGA','COTOPAXI'),(1933,'COLEGIO UNIVERSITARIO ODILO AGUILAR','QUITO','PICHINCHA'),(1934,'SAGRADOS CORAZONEZ CENTRO','PICHINCHA ','QUITO'),(1935,'UNIDAD EDUCATIVA DE SIGCHOS','SIGCHOS ','COTOPAXI'),(1936,'UNIDAD EDU. FISCOMISIONAL A DISTANCIA LOS RIOS','LOS RIOS','BABAHOYO'),(1937,'COLEGIO EXPERIMENTAL \"JATARI UNANCHA\"','COTOPAXI','COTOPAXI'),(1938,'JUTARI UNANCHA','COTOPAXI','LATACUNGA '),(1939,'COLEGIO \"SAN PABLO\"','IBARRA','IMBABURA'),(1940,'COLEGIO\"SAN PABLO\"','IBARRA','IMBABURA'),(1941,'COLEGIO NACIONAL MIXTO OÑA','CUENCA ','AZUAY '),(1942,'INSTITUTO RENACIMIENTO','MADRID','MADRID'),(1943,'COLEGIO PÁRTICULAR BORJA 3 CAVANIS','QUITO','PICHINCHA'),(1944,'UNIVERSIDAD TECNOLOGICA AMERICA','QUITO','PICHICHA'),(1945,'COLEGIO TECNICO SARA M BUSTILLOS DE ATIAGA','LAZO','COTOPAXI'),(1946,'ABYA YALA ','LATACUNGA ','COTOPAXI'),(1947,'UNIDAD EDUCATIVA PARTICULAR PCEI \"ECUADOR\"','QUITO','PICHINCHA'),(1948,'UNIDAD EDUCATIVA FRANCISCO DE ORELLANA','PUYO','PASTAZA'),(1949,'COLEGIO TECNICO INDUSTRIAL \"JOSE PERALTA\"','GUAYAQUIL','GUAYAS'),(1950,'COLEGIO PARTICULAR MASTER','QUITO','PICHINCHA'),(1951,'INSTITUTO TECNICO AGROPECUARIO ALFONSO HERREA','ANGEL ','CARCHI'),(1952,'COLEGIO PARTICULAR A DISTANCIA \" DR. EUGENIO ESPEJO\"','RIOBAMBA','CHIBORAZO'),(1953,'UNIDAD EDUCATIVA ANDRES F CORDOVA','QUITO','PICHINCHA'),(1954,'COLEGIO NACIONAL DE SEÑORITAS DE IBARRA','IBARRA','IMBABURA'),(1955,'UNIDAD EDUCATIVA EL CARMEN','MANABI','EL CARMEN'),(1956,'COLEGIO TECNICO INDUSTRIAL MIXTO PARTICULAR JUAN PABLO II','EL EMPALME','GUAYAS'),(1957,'CIENCIA Y BIBLIA ','RIOBAMBA','CHIMBORAZO'),(1958,'UNIDAD EDUCATIVA FISCOMICIONAL PCEI DE PICHINCHA','QUITO','PICHICHA'),(1959,'UNIDAD EDUCATIVA CARDENAL DE LA TORRE ','QUITO','PICHINCHA'),(1960,'UNIDAD EDUCATIVA REPLICA MEJIA ','QUITO','PICHINCHA'),(1961,'COLEGIO NACIONAL MIXTO \"CIUDAD DE PORTOVELO\"','PORTOVELO','EL ORO'),(1962,'COLEGIO SEMIPRESENCIAL MARCELO MONTENEGRO','QUITO','PICHINCHA'),(1963,'INSTITUTO TECNICO SUPERIOR LIBERTAD','QUITO','PICHINCHA'),(1964,'UNIDAD EDUCATIVA  DR. JULIO ALVAREZ CRESPO','SHUSHUFINDI','SUCUMBIOS'),(1965,'INSTITUTO TECNOLOGICO SUPERIOR SAN PABLO DE ATENAS ','BOLIVAR','GUARANDA '),(1966,'COLEGIO PARTICULAR MIXTO JEAN LE ROND D ALEMBERT','QUITO','PICHINCHA'),(1967,'UNIDAD EDUCATIVA QUITO LUZ DE AMERICA','PICHINCHA ','QUITO'),(1968,'INSTITUCION EDUCATIVA MARIANO MONTES','LATACUNGA','COTOPAXI'),(1969,'UNIDAD EDUCTIVA  EL PUEBLITO','CHONE','MANABI'),(1970,'UNIDAD EDUCATIVA FISCOMICIONAL 10 DE AGOSTO','SAN LORENZO','ESMERALDAS'),(1971,'JEAN LE ROND','QUITO','PICHINCHA'),(1972,' COLEGIO NACIONAL MIXTO \"SANTA ANA DE COTACACHI\"','IBARRA','IMBABURA'),(1973,'HNO PASTRANA CORRAL','GONZANAMA','LOJA'),(1974,'UNIDAD EDUCATIVAPARTICULAR A DISTACIA CENTEBAD','QUITO','PICHINCHA '),(1975,'UNIDAD EDUCATIVA CMDT. RAFAEL MORAN VALVERDE','QUEVEDO ','LOS RIOS'),(1976,'COLEGIO NACIONAL JUAN FRANCISCO MONTALVO','AMBATO ','TUNGURAHUA'),(1977,'COLEGIO FISCAL VESPERTINO \"DR. CARLOS CUEVA TAMARIZ\"','GUAYAQUIL','GUAYAS'),(1978,'FUERZA AERIA ECUATORIANA Nª1','QUITO','PICHINCHA'),(1979,'COLEGIO TECNICO \"SUCRE\"','QUITO','PICHINCHA '),(1980,'SEGUNDO ANGEL TAPIA ','QUITO','PICHINCHA'),(1981,'UNIVERCIDAD CENTRAL DEL ECUADOR ','QUITO','PICHICHA'),(1982,'COLEGIO JAMBELI','MACHALA ','EL  ORO'),(1983,'INSTITUTO SUPERIOR TECNOLOGICO EXPERIMENTAL \"LUIS A. MARTINEZ\"','AMBATO ','TUNGURAHUA'),(1984,'LOUIS VICTOR DE BROGLIE','QUITO','PICHINCHA'),(1985,'UNIDAD EDUCATIVA MUNICIPAL OSWALDO LOMBEYDA','QUITO','PICHINCHA'),(1986,'UNIDAD EDUCATIVA LUIS ENRIQUE RAZA BOLAÑOS','QUITO','PICHINCHA'),(1987,'EL COLEGIO PARTICULAR  ARISTOTELES ','QUITO ','PICHINCHA '),(1988,'UNIDAD EDUCATIVA \"BAUTISTA\"','AMBATO ','TUNGURAHUA'),(1989,'INSTITUTO TECNOLOGICO SAN PEDRO DE ATENAS','SAN PABLE DE ATENAS ','BOLIVAR'),(1990,'COLEGIO PARTICULAR CRISTIANO \"FEBE\"','QUITO','PICHINCHA'),(1991,'UNIDAD EDUCATIVA INTERCULTURAL Y BILINGUE JATARI UNANCHA','COTOPAXI ','ZUMBAHUA'),(1992,'UNIDAD EDUCATIVA PCEI SAN PABLO','SAN PABLO','BOLIVAR'),(1993,'COLEGIO PARTICULAR GEOVANA GERMAN','MEJIA','PICHINCHA'),(1994,'COLEGIO PARTICULAR GENOVEVA GERMAN','MEJIA ','MACHACHI'),(1995,'INSTITUTO EDUCATIVO SECUNDARIO CAMPEADOR ','VALENCIA ','VALENCIA '),(1996,'COLEGIO NACIONAL TOACASO','LATACUNGA','COTOPAXI'),(1997,'FEDERICO GARCIA LORCA','QUITO','PICHINCHA'),(1998,'JUAN BENIGNO VELA','AMBATO ','TUNGURAHUA'),(1999,'INSTITUTO DE EDUCACION SECUNDARIA \"LUIS BUÑUEL\"','SARAGOZA','SARAGOZA'),(2000,'UNIDAD EDUCATIVA PARTICULAR \"GEOVANNI BELLINE\"','QUITO','PICHINCHA'),(2001,'RED EDUCATIVA \"TUTATACTO\"','SAN ANDRES','CHIMBARAZO'),(2002,'DR. CAMILO GALLEGOS TOLEDO','QUITO','PICHINCHA'),(2003,'COLEGIO NACIONAL FANNY DE BAIRD','BAHIA DE CARAQUEZ','MANABI'),(2004,'COLEGIO NACIONAL FANNY DE BAIRD','MANABI','BAHIA DE CARAQUES '),(2005,'COLEGIO PEDRO VICENTE MALDONADO ','QUITO','PICHICNHA'),(2006,'UNIDAD EDUCATIVA PROVINCIA DE COTOPAXI','LA TACUNGA ','COTOPAXI'),(2007,'JUAN PIO MONTUFAR ','QUITO','PICHINCHA '),(2008,'U.E.INTERCULTURAL BILINGUE SHIMIATUKKUNAPAK JATUN KAPARI','GUARANDA','BOLIVAR'),(2009,' COLEGIO NACIONAL \"DR. ALFREDO NOBOA MONTENEGRO\"','CALUMA','BOLIVAR'),(2010,'COLEGIO FISCAL MARTHA BUCARAN DE ROLDOS','GUAYAQUIL','GUAYAS'),(2011,'UNIDAD EDUCATIVA PATRIMONIO DE LA HUMANIDAD ','QUITO','PICHINCHA'),(2012,'CORPORACION PARA EL DESARROLLO DE CIENCIA Y TECNOLOGIA ','QUITO','PICHINCHA'),(2013,'UNIDAD EDUCATIVA FISCAL COMBANIENTES DE TAPI ','RIOBAMBA ','RIOBAMBA'),(2014,'COLEGIO POLICIA NACIONAL ','QUITO','PICHINCHA'),(2015,'COLEGIO EXPERIMENTAL 23 DE OCTUBRE','MONTECRISTI','PORTOVIEJO'),(2016,'FRANZ SCHUBERT','RUMIÑAHUI','VALLE DE  LOS CHILLOS'),(2017,'COLEGIO NACIONAL NOCTURNO SEIS DE DICIEMBRE ','QUITO ','PICHINCHA '),(2018,'UNIDAD EDUCATIVA PCEI 23 DE AGOSTO','GUARANDA','BOLIVAR'),(2019,'COLEGIO PARTICULAR LUDOTECA PADRE VICTOR GRADOS','QUITO','PICHINCHA '),(2020,'EL COLEGIO FISCAL NOCTURNO UNION NACIONAL DE PERIODISTAS','QUITO','PICHINCHA '),(2021,'COLEGIO NALCIONAL CARLOS ALBERTO AGUIRRE AVILES ','BABAHOYO','LOS RIO '),(2022,'COLEGIO FISCAL NOCTURNO GQENRAL RUMIÑAHUI ','QUITO ','PICHINCHA '),(2023,'UNIDAD EDUCATIVA PARTICULAR MARIA MAGDALENA ','QUITO ','PICHINCHA'),(2024,'COLEGIO CIMA PCEI','LATACUGA','COTOPAXI'),(2025,'UNIDAD EDUCATIVA OSWALDO GUAYASAMIN','QUITO','PICHINCHA'),(2026,'INTERCULTURAL BILINGUE DR MIGUEL RIOFRIO','LOJA','LOJA'),(2027,'UNIDAD EDUCATIVA GABRIEL GARCIA MORENO','COTACACHI','IMBABURA'),(2028,'UNIDAD EDUCATIVA LA INMACULADA','CUENCA ','AZUAY '),(2029,'COLEGIO FISCAL INDUSTRIAL MIGUEL DE SANTIAGO  ','QUITO ','PICHINCHA'),(2030,'INSTITUTO  TECNOLOGICO SAN PABLO DE ATENAS ','GUARANDA','BOLIVAR'),(2031,'TECNICO FISCOMISIONAL SAN JOSE','QUITO ','PICHINCHA '),(2032,'COLEGIO NACIONAL CONOCOTO ','QUITO ','PICHINCHA '),(2033,'COLEGIO PARTICULAR LUCA PACIOLA','QUITO','PICHINCA'),(2034,'COLEGIO FISCAL LOS SHYRIS ','QUITO ','PICHINCHA '),(2035,'COLEGIO MARCOS OCHOA MUÑOZ','PUYANGO ','LOJA'),(2036,'UNIDAD EDUCATIVA BILINGUE MARIANO VALLA SAGNAY','COLTA','CHIBORAZO'),(2037,'UNIDAD EDUCATIVA JUAN BAUTISTA VASQUEZ','AZOGUEZ','CAÑAR'),(2038,'ALBOREADA','AMBATO ','TUGURAHUA'),(2039,'13 DE ABRIL','QUITO','PICHINCHA'),(2040,'UNIDAD EDUCATIVA SAN PABLO DE ATENAS ','BOLIVAR','GUARANDA '),(2041,'INSTITUTO SUPERIOR TECNOLOGICO DOCENTE \"GUAYAQUIL\"','AMBATO ','TUGURAHUA'),(2042,'ARTURO BORJA','QUITO ','PICHINCHA'),(2043,'COLEGIO NACIONAL SHIRV CACHA','RIOBAMBA','CHIMBORAZO'),(2044,'CARLOS MONTUFAR ','QUITO ','PICHINCHA'),(2045,'COLEGIO  MANUELA SAENZ','QUITO','PICHINCHA'),(2046,'UNIDAD EDUCATIVA FISCAL PEDRO BALDA CUCALON','MANABI','MANABI'),(2047,'COLEGIO PARTICULAR MENSAJEROS DE LA PAZ','CUENCA ','AZOGUES'),(2048,'UNIDAD EDUCATIVA 8 DE MARZO','SUCUMBIOS','PUTUMAYO'),(2049,'COLEGIO PARTICULAR EUGENIO ESPEJO ','QUITO','PICHINCHA'),(2050,'COLEGIO NACIONAL MIXTO NOCTURNO BAHIA DE CARAQUEZ','BAHIA DE CARAQUEZ','MANABI'),(2051,'INSTITUCION EDUCATIVA ISMAEL PROAÑO ANDRADE','QUITO','PICHINCHA'),(2052,'MINISTERIO DE EDUCACION','QUITO','PICHINCHA'),(2053,'COLEGIO TECNICO A DISTANCIA BUCAY','BUCAY','GUAYAS'),(2054,'INSTITUCION EDUCATIVA SANTA TERESITA','CEVILLA VALLE','COLOMBIA'),(2055,'DR EMILIO UZCATEGUI','QUITO','PICHINCHA'),(2056,'UNITED KINGDOM','QUITO','PICHINCHA'),(2057,'UNIDAD EDUCATIVA ALAUSI','ALAUSI','CHIMBORAZO'),(2058,'UNIDAD EDUCATIVA CAMINO REAL ','GUARANDA ','BOLIVAR '),(2059,'RAFAEL LARREA ANDRADE ','QUITO ','PICHINCHA'),(2060,'LA ESCUELA POLITECNICA JAVERIANA DEL ECUADOR','QUITO','PICHINCHA'),(2061,'ESCUELA SUPERIOR ECOLOGICA AMAZONAS ','LAGO AGRIO','SUCUMBIOS '),(2062,'UNIVERSIDAD OG MANDINO','QUITO','PICHINCHA'),(2063,'UNIDA EDUCATIVA RICARDO CORNEJO ROSALES ','QUITO','PICHINCHA'),(2064,'UNIVERSIDAD TECNOLOGICA EQUINOCCIAL','QUITO','PICHINCHA'),(2065,'INSTITUCIÓN EDUCATIVA PCEI SEGUNDO TORRES ','QUITO','PICHINCHA'),(2066,'RAMON ZAMBRANO BRAVO','EL CARMEN ','MANABI'),(2067,'UNIDAD EDUCATIVA FISCAL PRIMICIAS DE LA CULTURA DE QUITO ','QUITO','PICHINCHA '),(2068,'CENTRAL TECNICO','QUITO','PICHINCHA'),(2069,'UNIDAD EDUCATIVA CALUMA ','CALUMA','BOLIVAR '),(2070,'UNIDAD EDUCATIVA JESUS DE NAZARETH','QUITO','CHILLOGALLO'),(2071,'COLEGIO TECNICO AGROPECUARIO FRONTERA SUR','PALTAS','LOJA'),(2072,'COLEGIO NOCTURNO SEIS DE DICIEMBRE ','QUITO','PICHINCHA'),(2073,'UNIDAD EDUCATIVA GEGERAL RUMIÑAHUI ','QUITO','PICHINCHA'),(2074,'INSTITUTO TECNOLOGICO PAULO EMILIO MACIAS ','PORTOVIEJO','MANABI'),(2075,'UNIDAD EDUCATICA FISCAL AIDA GALLEGOS DE MONCAYO','QUITO','PICHINCHA'),(2076,'UNIDAD EDUCATIVA JOSE MARIA LEQUERICA','QUITO','PICHINCHA'),(2077,'COLEGIO TARQUI','QUITO','PICHINCHA'),(2078,'UNIDAD EDUCATIVA JUAN DE SALINAS ','SANGOLQUI','PICHINCHA '),(2079,'UNIDAD EDUCATIVA FISCAL 15 DE DICIEMBRE','QUITO','PICHINCHA'),(2080,'INTERCULTURAL  RUMILOMA','QUITO','PICHINCHA'),(2081,'COLEGIO NACIONAL SAQUISILI','LATACUNGA','COTOPAXI'),(2082,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"COMPUINFORMATICA\"','QUITO','PICHINCHA'),(2083,'COLEGIO NACIONAL EUDOFILO ALVAREZ','LATACUNGA','COTOPAXI'),(2084,'INSTITUTO  SUPERIOR JOSE PERALTA','CAÑAR','CAÑAR'),(2085,'INSTITUTO SECAP','QUITO','PICHINCHA'),(2086,'COLEGIO TECNICO INDUSTRIAL \"DR TRAJANO NARANJO\"','LATACUNGA','LA LAGUNA'),(2087,'TECNICO INDUSTRIAL SIGCHOS','SIGCHOS ','COTOPAXI'),(2088,'UNIDAD EDUCATIVA FISCAL ARTURO BORJA','QUITO ','PICHINCHA '),(2089,'CARDENAL CARDENAS  MARIA DE  LA TORRE','QUITO','PICHICHA'),(2090,'UNIDAD EDUCATIVA POLICIA NACIONAL ','QUITO ','PICHINCHA '),(2091,'FRANKLIN.K.ENE.HIGH.SCHOOL','NUEVA YORK','BRUCKLIN'),(2092,'ALMIRANTE ILLINGWORTH','GUAYAQUIL ','GUAYAS'),(2093,'DOLORES CACUANGO','CAYAMBE','PICHINCHA'),(2094,'COLEGIO TECNICO HUMANISTICO EXPERIMENTAL QUITO ','QUITO ','PICHINCHA'),(2095,'SANTO DOMINGO DE GUZMAN ','QUITO ','PICHINCHA'),(2096,'COLEGIO DAVAD AUSUBEL','PICHINCHA ','QUITO'),(2097,'COLEGIO LAGO AGRIO','SUCUMBIOS','SUCUMBIOS'),(2098,'COLEGIO PARTICULAR POPULAR TECNICO \"NOROCCIDENTAL\"','NANEGALITO','PICHINCHA'),(2099,'UNIDAD EDUCATIVA FISCAL ARTURO BORJA ','QUITO ','PICHINCHA'),(2100,'UNIDAD EDUCATIVA PARTICULAR  PCEI ECUADOR','QUITO ','PICHINCHA'),(2101,'COLEGIO NACIONAL TECNICO AGROPECUARIO ALFREDO PEREZ GUERRERO','MUISNE','ESMERALDAS'),(2102,'COLEGIO PARTICULAR VISION SIGLO XXI','QUITO','PICHINCHA'),(2103,' FISCAL CONSEJO PROVINCIAL PICHINCHA','QUITO ','PICHINCHA '),(2104,'UNIDAD EDUCATIVA PUCAYACO','LA MANA ','COTOPAXI'),(2105,'UNIDAD EDUCATIVA SIMIATUG ','GUARANDA','BOLIVAR'),(2106,'UNIDAD EDUCATIVA ANTONIO JOSE DE SUCRE ','QUITO','PICHINCHA'),(2107,'MARIA OÑA PERDOMO','SAN GABRIEL','CARCHI'),(2108,'UNIDAD EDUCATIVA MANUELA DE SANTA CRUZ  Y ESPEJO','QUITO','PICHICHA'),(2109,'UNIDAD EDUCATIVA MUNICIPAL FERNANDEZ MADRID','PICHINCHA ','QUITO'),(2110,'LA FAE','QUITO','PICHINCHA'),(2111,'SAN JUAN PABLO SEGUNDO','QUITO','PICHICNHA'),(2112,'COLEGIO \"CALDERON\"','QUITO','PICHINCHA'),(2113,'ADVENTISTA SANTO DOMINGO','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS SACHILAS'),(2114,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE PCEI ABYA AYALA','QUITO ','PICHINCHA'),(2115,'COLEGIO PARTICULAR JIM IRWIN ','PICHINCHA ','QUITO'),(2116,'COLEGIO NACIONAL MIXTO \"12 DE MARZO\"','PORTOVIEJO','MANTA'),(2117,'HIGH SGHOOL SANTA MARIA','LA TACUNGA','COTOPAXI '),(2118,'COLEGIO FISCAL TECNICO 24 DE MAYO','QUEVEDO ','LOS RIOS'),(2119,'DAVID AUSUBEL','QUITO','PICHINCHA'),(2120,'JUAN RAMON JIMENEZ HERRERA','LAGO AGRIO','SUCUMBIOS'),(2121,'PEDRO  CARBO','GUARANDA','BOLIVAR'),(2122,'PEDRO CARBO ','QUITO ','GUARANDA '),(2123,'COLEGIO PARTICUAR CHARLES BABBAGE','SANGOLQUI','PICHINCHA'),(2124,'UNIDAD EDUCATIVA MAUELA CAÑIZAREZ','QUITO','PICHINCHA'),(2125,'COLEGIO  NACIONAL PEDRO  VICENTE  MALDONADO ','RIOBAMBA','CHIMBORAZO '),(2126,'COLEGUIO  NACIONAL  PEDRO VICENTE  MALDONADO ','RIOBAMBA','CHIMBORAZO'),(2128,'ARISTOTELES  BILINGUE ','QUITO ','PICHINCHA'),(2129,'ARISTOTELES BILINGUE ','QUITO ','PICHINCHA'),(2130,'ARISTOTELES ','QUITO ','PICHINCHA'),(2131,'UNIDAD  EDUCATIVA  ARTURO BORJA ','QUITO ','PICHINCHA'),(2132,'UNIDAD  EDUCATIVA ARTURO BORJA  ','QUITO ','PICHINCHA'),(2133,'ARTURO   BORJA ','QUITO ','PICHINCHA'),(2134,'COLEGUIO   FISCAL  TECNICO  ARTURO   BORJA','QUITO ','PICHINCHA'),(2135,'COLEGIO  FISCAL TECNICO ARTURO BORJA ','QUITO ','PICHINCHA'),(2136,'COLEGIO  FISCLA TECNICO  ARTURO BORJA','QUITO ','PICHINCHA'),(2137,'COLEGIO NACIONAL  ARTURO BORJA','QUITO ','PICHINCHA'),(2138,'SARA MARIA BUSTILLOS DE ARTEAGA','LAZO','COTOPAXI'),(2139,'VICEALMIRANTE JORGE CRUZ PALANCO','QUITO','PICHINCHA'),(2140,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"EUGENIO ESPEJO\"','QUITO','PICHINCHA'),(2141,'FACULTAD DE CIENCIAS MEDICAS DE LA UNIVERSIDAD DE CUENCA','CUENCA ','AZUAY '),(2142,'INSTITUCION EDUCATIVA  FISCAL NACIONAL UNE ','QUITO ','PICHINCHA'),(2143,'SAN JUAN   PABLO SEGUNDO ','QUITO ','PICHINCHA'),(2144,'CORNEJO ROSALES ','QUITO ','PICHINCHA'),(2145,'INSTITUTO TECNICO INSTA','QUITO','PICHICNHA'),(2146,'UNIVERSIDAD AUTONOMA QUITO UNAQ','QUITO','PICHINCHA'),(2147,'UNIDAD EDUCATIVA MARCO AURELIO SUBIA MARTINEZ -BATALLA DE PANUPALI','LATACUNGA','COTOPAXI'),(2148,'UNIDAD EDUCATIVA TAISHA','QUITO','PICHICHA'),(2149,'UNIDAD  EDUCATIVA 11 DE FEBRERO ','QUITO','PICHINCHA'),(2150,'COLEGIO NACIONAL MIXTO ALLURIQUI','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(2151,'UNIDAD  EDUCATIVA  FISCAL   AIGA  GALLEGOS DE MONC','QUITO ','PICHINCHA'),(2152,'EMILIO UZCATEGUI ','QUITO ','PICHICNHA'),(2153,'UNIDAD EDUCATIVA PARTICILAR ECUADOR ','QUITO','PICHINCHA'),(2154,'FEDERICO GONZALO SUAREZ','PICHINCHA ','QUITO'),(2155,'UNIDAD EDUCATIVA DARIO GUEVARA MAYORGA','PICHINCHA ','QUITO'),(2156,'ACADEMIA AERONAUTICA MAYOR PEDRO TRAVESARI','QUITO','PICHINCHA'),(2157,'COLEGIO PARTICULAR \"VEINTE Y SIETE DE FEBRERO\"','QUITO','PICHINCHA'),(2158,'UNIDAD EDUCATIVA FISCAL ALFONSO ARROYO AGUIRRE','QUITO','PICHINCHA'),(2159,'UNIDAD EDUCATIVA \"NACIONAL TENA\"','TENA','NAPO'),(2160,'UNIDAD EDUCATIVA NONO','QUITO','PICHINCHA'),(2161,'COLEGIO TECNICO INDUSTRIAL LA ALBORADA ','MILAGRO','GUAYAS'),(2162,'COLEGIO BACHILLERATO PARTICULAR \"ATLANTICO\"','CUENCA ','AZUAY '),(2163,'UNIDAD EDUCATIVA FISCALMARIA CRISTINA ARTINEZ DE FRANCIS','ESMERALDAS ','ESMERALDAS'),(2164,'COLEGIO NACIONAL TECNICO MIXTO DR CAMILO GALLEGOS TOLEDO','QUITO','PICHINCHA'),(2165,'INSTITUCION EDUCATIVA \"SANTO TOMAS DE AQUINO\"','SANGOLQUI','PICHINCHA'),(2166,'COLEGIO DE BACHILLERATO FEMENINO \"CIUDAD DE ASIS\"','COLOMBIA','COLOMBIA'),(2167,'INSTITUCION EDUCATIVA AMAUTA FERNANDO DAQUILEMA','GUAMOTE','CHIMBORAZO'),(2168,'UNIDAD EDUCATIVA SANTA MARIANA DE JESUS','QUITO','PICHINCHA'),(2169,'UNIDAD EDUCATIVA CHORDELEG','CHORDELEG ','AZUAY '),(2170,'JUAN JIMENEZ ','LAGO AGRIO','SHUSHUFINDO'),(2171,'IEES VILLEGAS','MADRID','ESPAÑA'),(2172,'INSTITUCION EDUCATIVA FISCAL BENITO JUAREZ',' QUITO ','PICHINCHA'),(2173,'COLEGIO NACIONAL TECNICO ARTURO BORJA ','QUITO ','PICHINCHA'),(2174,'UNIDAD EDUCATIVA FISCAL AIDA GALLEGOS DE MONCAYO','PICHINCHA ','QUITO'),(2175,'DR. EMILIO UZCATEGUI','PICHINCHA ','QUITO '),(2176,'COLEGIO NACIONAL MIXTO AMAZONAS ','PICHINCHA ','QUITO '),(2177,'COLEGIO NACIONAL TECNICO AGROPECUARIO 29 DE AGOSTO','BABAHOYO','LOS RIOS'),(2178,'COLEGUIO PARTICULAR NUEVO  ECUDADOR','QUITO','PICHINCHA'),(2179,'UNIDAD  EDUCATIVA  FISCAL  CINCO DE JULIO','QUITO','PICHICHA'),(2180,'COLEGIO PARTICULAR DE LAS AMERICAS ','QUITO ','PIUCHINCHA '),(2181,'INSTITUCION EDUCATIVA  FISCOMISIONAL HOGAR CRISTO REY','TUMBACO','PICHINCHA'),(2182,'MANUEL CORDOVA GALARZA ','QUITO ','PICHINCHA '),(2183,'INSTITUTO TECNOLOGICO SUPERIOR COMPU SUR','QUITO','PICHINCHA '),(2184,'INSTITUTO TEGNOLOGICO SUPERIOR ALOASI','PICHINCHA ','QUITO'),(2185,'UNIADA EDUCATIVA 23 DE ABRIL','GUARANDA','BOLIVAR '),(2186,'UNIDAD EDUCATIVA PAGUA ','LATACUNGA','COTOPAXI'),(2187,'COLEGIO PARTICULAR VIDA NUEVA','QUITO','PICHICHA'),(2188,'UNIDAD EDUCATIVA PARTICULAR MARIA TERESA CARREÑO','MARACAIBO','ESTADO ZULIA'),(2189,'DR AGUSTIN CUEVA SAENZ','LOJA','LOJA'),(2190,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BLILING 24 DE OCTUBRE','PUJILI','COTOPAXI'),(2191,'UNIDAD EDUCATIVA FERNANDEZ SALVADOR VILLAVICENCIO PONCE ','QUITO ','PICHINCHA'),(2192,'UNIDAD EDUCATIVA FISCAL BICENTENERIO D7 VESPERTINO','QUITO','PICHINCHA'),(2193,'UNIDAD EDUCATIVA LICEO DE CIENCIAS Y  ARTES ','QUITO','PICHINCHA'),(2194,'UNIDAD EDUCATIVA SANTA JUANA DE CHANTAL','OTAVALO','IBARRA'),(2195,'DISTRITO METROPOLITANO DE QUITO','QUITO','PICHINCHA'),(2196,'UNIDAD EDUCATIVA ROSA ZARATE','LA CONCORDIA ','ESMERALDAS'),(2197,'VITUAL IBEROAMERICANO','QUITO ','PICHINCHA'),(2198,'UNIDAD EDUCATIVA PCEI ECUADOR ','QUITO ','PICHINCHA'),(2199,'UNIVERSIDAD TECNICA DE PARTICULAR DE LOJA ','QUITO','PICHINCHA'),(2200,'MASTER ','QUITO ','PICHINCHA'),(2201,'COLEGIO  NACIONAL  LOS CAÑARIS','CAÑAR ','AZOGUES'),(2202,'UNIDAD EDUCATIVA JOAQUIN LALAMA','AMBATO ','TUNGURAHUA'),(2203,'INSTITUTO TECNOLOGICO SUPERIOR PARA EL DESARROLLO','QUITO','PICHINCHA'),(2204,'UNIVERSIDAD NACIONAL DE LOJA','LOJA','LOJA'),(2205,'COLEGIO FISCAL MIXTO PROVICIA DE PICHINCHA','GUARANDA','CHILLANES'),(2206,'COLEGIO NACIONAL TECNICO JORGE ICAZA ','QUITO ','PICHINCHA'),(2207,'COLEGIO NACIONAL CESAR DAVILA ANDRADE','CUENCA ','AZUAY '),(2208,'COLEGIO NACIONAL CUTUGLAGUA ','MEJIA ','PICHINCHA '),(2209,'COLEGIO LUXENBURGO','QUITO','PICHINCHA'),(2210,'UNIDAD EDUCATIVA PCEI TUNGURAHUA','AMBATO ','AMBATO'),(2211,'UNIDAD EDICATIVA ELIA LIUT','MACHACHI','PICHINCHA'),(2212,'COLEGIO PARTICULAR JULIO CORTAZA ','QUITO','PICHINCHA'),(2213,'UNIDAD EDUCATIVA  A DISTANCIA UNEDE','ESMERALDAS ','ESMERALDAS'),(2214,'UNIDAD EDUCATIVA 11 DE NOVIEMBRE ','QUITO','PICHINCHA'),(2215,'COLEGIO UNIVERSITARIO MILTON REYES ','RIOBAMBA','CHIMBORAZO'),(2216,'COLEGIO PARTICULAR DE CIENCIAS \"PITAGORAS\"','RIOBAMBA','CHIBORAZO'),(2217,'COLEGIO PARTICULAR DE CIENCIAS \"PITAGORAS\"','RIOBAMBA','CHIBORAZO'),(2218,'UNIDAD EDUCATIVA MIGUEL DE SANTIAGO','QUITO','PICHICHA'),(2219,'UNIDAD EDUCATIVA MIGUEL DE SANTIAGO','QUITO','PICHINCHA'),(2220,'COLEGIO MIXTO PARTICULAR VICENTE ROCAFUERTE','SANTO DOMINGO DE LOS SACHILAS ','SANTO DOMINGO '),(2221,'UNIDAD EDUCATIVA  JUAN ABEL ECHEVERRIA','LA TACUNGA ','COTOPAXI'),(2222,'UNIDA EDUCATIVA ALOASI','MEJIA ','PICHINCHA'),(2223,'INSTITUTO TECNOLOGICO SUPERIOR LATINO','QUITO','PICHINCHA'),(2224,'UNIVERSIDAD BOLIVARIANA DE VENEZUELA','CARACAS','DISTRITO CAPITAL'),(2225,'JOSE RAMON ZAMBRANO BRAVO','MANABI','EL CARMEN'),(2226,'COLEGIO LEONARDO MALDONADO PEREZ','QUITO','PICHINCHA'),(2227,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ S.J IRFEYAL EXT 92','PIÑAS','ORO'),(2228,'UNIDAD EDUCATIVA DE LAS FUERZAS ARMADAS COLEGIO MILITAR Nº10 ABDON CALDERON ','QUITO ','PICHINCHA '),(2229,'UNIDAD EDUCATIVA  PICHINCHA','QUITO','PROVINCIA '),(2230,'INSTITUCION EDUCATIVA FISCAL JORGE MANTILLA ORTEGA ','QUITO','PICHINCHA'),(2231,'VIRGEN DEL VALLE','PORLAMAR','VALLE HERMOSO'),(2232,'COLEGIO PARTICULAR NOCTURNO QUITO','QUITO','PICHINCHA'),(2233,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE \"NUEVOS HORIZONTES\"','SUCUMBIOS','LAGO AGRIO'),(2234,'COLEGIO POPULAR PARTICULAR \"VIDA NUEVA\"','QUITO','PICHINCHA'),(2235,'INSTITUTO EDUCATIVA PARTICULAR JOHN HARMAN','QUITO','PICHINCHA'),(2236,'COLEGIO FISCAL TEC. EXP. VEINTIOCHO DE MAYO','GUAYAQUIL','GUAYAS'),(2237,'INSTITUCION EDUCATIVA PAUL DIRAC','QUITO','PICHINCHA'),(2238,'MARIA DOLOROSA LOJA PATIÑO ','SANGOLQUI','PICHINCHA'),(2239,'COLEGIO TECNICO SAN LORENZO ','GUARANDA','GUANUJO'),(2240,'UNIDAD EDUCATIVA MUNICIPAL JUAN WISNETH','QUITO','PICHINCHA'),(2241,'COLEGIO TECNICO MULALO','LATACUNGA','COTOPAXI'),(2242,'UNIDAD EDUCATIVA PARTICULAR  \"JUAN MONTALVO\"','QUITO','PICHINCHA'),(2243,' UNIDAD EDUCTIVA FISCAL REPLICA DEL MILENIO  24 DE MAYO ','QUITO ','PICHINCHA'),(2244,'COLEGIO  FISCAL 11 DE MARZO','QUITO','PICHINCHA'),(2245,'UNIDAD EDUCATIVA EL ANGEL','EL ANGEL ','CARCHI'),(2246,'COLEGIO A DISTANCIA PROVINCIA DE PICHINCHA','GUAYAQUIL','GUAYAS'),(2247,'UNIDAD EDUCATIVA PCEI 31 DE OCTUBRE','OTAVALO','IMBABURA'),(2248,'INSTITUCION EDUCATIVA HUMANISTICO QUITO','QUITO','PICHICHA'),(2249,'UNIDAD EDUCATIVA REPUBLICA DE BOLIVIA','QUITO','PICHINCHA'),(2250,'INSTITUCION EDUCATIVA DR. RICARDO CORNEJO ROSALES','QUITO','PICHINCHA'),(2251,'COLEGIO TECNICO FISCOMICIONAL MARIA INMACULADA ','ARCHIDONA','NAPO'),(2252,'COLEGIO DE BACHILLER PCEI CECOMSYS','SANGOLQUI','PICHICHA'),(2253,'COLEGIO TECNICO BILINGUE HUAMANI','ARCHIDONA','NAPO'),(2254,'COLEGIO HORACIO HIDROVO VELASQUEZ','MANABI','PORTOVIEJO'),(2255,'UNIDAD EDUCATIVA EMILIO SUAREZ','LA JOYA DE SACHAS','ORELLANA'),(2256,'COLEGIO PARTICULAR SAN FERNANDO','QUITO','PICHINCHA'),(2257,'UNIDAD EDUCATIVA PARTICULAR NEW LIFE','QUITO','PICHINCHA'),(2258,'UNIDA EDUCATIVA HUMBERTO MOREIRA MARQUEZ ','VENTANAS ','VENTANAS '),(2259,'HUMBERTO MORERIRA MRQUEZ','VENTANAS ','VENTANAS '),(2260,'COLEGIO FISCAL \"EMILIANO ORTEGA ESPINOZA\"','LOJA','LOJA'),(2261,'UNIDAD EDUCATIVA TECNICA EXPERIMENTAL MITAD DEL MUNDO','QUITO','PICHINCHA'),(2262,'DR.LUIS ESPINOSA TAMAYO ','RECINTO VIDA NUEVA ','GUAYAS '),(2263,'JOSE MARIA VELAZ EXT 111 PACTO','QUITO','PICHINCHA'),(2264,'COLEGIO NACIONAL NOCTURNO MIXTO \"GENERAL RUMIÑAHUI\"','QUITO','PICHINCHA'),(2265,'COLEGIO NACIONAL LA TINGUE','PALTAS','LOJA'),(2266,'UNIDAD     EDUCATIVA   2  D E AGOSTO ','QUITO','PICHINCHA '),(2267,'CAMINO DEL INCA','QUITO','PICHINCHA'),(2268,'COELGIO FISCOMISIONAL TECNICO \"SAN MIGUEL\"','PUTUMAYO','SUCUMBIOS'),(2269,'INSTITUTO SUPERIOR  AERONAUTICO','LA TACUNGA','COTOPAXI'),(2270,'UNIDAD EDUCATIVA RAMON BARBA NARANJO','LATACUNGA','COTOPAXI'),(2271,'COLEGIO TECNICO FISCOMISIONAL ANGEL BARBISOTTI','ESMERALDAS ','ESMERALDAS'),(2272,'COLEGIO PROVINCIA DE COTOPAXI','LA TACUNGA','COTOPAXI'),(2273,'ISTITUTO DISTRUZIONE SECONDARI SUPERIORE EINAUDI-CASAREGIS-GALILEI','ITALIA','GENOVA'),(2274,'DR TELMO HIDALGO DIAZ','QUITO','PICHICHA'),(2275,'INSTITUCION EDUCATIVA FISCOMISIONAL MARIA AUGUSTA URRUTIA','QUITO','PICHINCHA'),(2276,'INSTITUCION EDUCATIVA MANUEL CABEZA DE VACA','QUITO','PICHINCHA'),(2277,'INSTITUTO SUPERIOR TECNOLOGICO ISMAC','QUITO','PICHINCHA'),(2278,'COLEGIO FISCAL ONCE DE NOVIEMBRE','LA MANA ','COTOPAXI'),(2279,'COLEGIO TECNICO PARTICULAR CERVANTES','ESMERALDAS ','ESMERALDAS'),(2280,'UNIDAD EDUCATIVA \" LICEO DE CIENCIAS Y ARTES\"','QUITO','PICHINCHA'),(2281,'13 DE ABRIL','QUITO','PICHINCHA'),(2282,'COLEGIO TECNICO AGROPECUARIO SABANETILLAS','ECHEANDIA','BOLIVAR'),(2283,'JARA VERA','MADRID ','ESPAÑA'),(2284,'UNIDAD EDUCATIVA LICTO','RIOBAMBA','CHIBORAZO'),(2285,'CINCO  DE  JUNIO','QUITO ','PICHINCHA '),(2286,'UNIDAD EDUCATIVA MARISCAL ANTONIO JOSE DE SUCRE','ALAUSI','CHIMBORAZO'),(2287,'UNIVERSIDAD TECNOLOGICA ISRAEL','QUITO','PICHINCHA'),(2288,'UNIDAD EDUCATIVA FISCAL PORTOVIEJO','PORTOVIEJO ','MANABI'),(2289,'INSTITUTO TECNOLOGICO SUPERIOR CRUZ ROJA ECUATORIANA','QUITO','PICHINCHA'),(2290,'COLEGIO NACIONAL \"DR TRAJANO NARANJO JACOME\"','COTOPAXI','SIGCHOS'),(2291,'COLEGIO NACIONAL TECNICO \"TENIENTE HUGO ORTIZ\"','PICHINCHA ','QUITO'),(2292,'UNIDAD EDUCATIVA LUCENBURGO','QUITO','PICHINCHA'),(2293,'UNIDAD EDUCATIVA TEMPORAL 17 DE JULIO','IBARRA ','IMBABURA'),(2294,'COLEGIO INTEROAMERICANO','QUITO','PICHINCHA'),(2295,'COLEGIO ANTONIO ANTE','ANTUTAQUI','IMBABURA'),(2296,'UNIDAD EDUCATIVA PARTICULAR HERMANO MIGUEL ','LATACUNGA','COTOPAXI'),(2297,'COLEGIO NACIONAL MIXTO ABDON CALDERON','CUENCA ','AZUAY '),(2298,'COLEGIO PARTICULAR DR MANUEL NAULA SAGNAY ','COLTA','CHIMBORAZO '),(2299,'COLEGIO NACIONAL TAYUZA','TAYUZA','MORONA SANTIAGO '),(2300,'COLEGIO PARTICULAR A DISTANCIA SECOMSYS','QUITO','PICHINCHA'),(2301,'UNIDAD EDUCATIVA FUERZA AEREA ECUATORIANA N. 1','QUITO','PICHINCHA'),(2302,'FLAVIO ALFARO','CHONE','MANABI'),(2303,'UNIDAD EDUCATIVA ISINLIVI','COTOPAXI','LA TACUNGA '),(2304,'UNIDADA EDUCATIVA DR. MANUEL AGUSTIN CABRERA LOZANO','LOJA','LOJA'),(2305,'UNIDAD EDUCATIVA ISMAEL PROAÑO ANDRADE','QUITO','TAMBILLO '),(2306,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE ING. HERMEL TAYUPANDA','RIOBAMBA','CHIBORAZO'),(2307,'UNIDAD EDUCATIVA FISCAL BICENTENARIO D7 VESPERTINO','QUITO','PICHINCHA'),(2308,'COLEGIO PARTICULAR \"JOSE ANTONIO EGUIGUREN\" LA SALLE','LOJA','LOJA'),(2309,'UNIDADA EDUCATIVA MUNICIPAL JOSE ANTONIO DE SUCRE SEMIPROFACIONAL','PICHINCHA ','QUITO'),(2310,'UNIDAD EDUCATIVA MUNICIPAL ANTONIO JOSE DE SUCRE SEMIPRECENCIAL','PICHINCHA ','QUITO'),(2311,'COLEGIO PARTICULAR HELMUT WAHLMULLER','PICHINCHA ','QUITO'),(2312,'UNIDAD EDUCATIVA FISCAL VEINTITRES DE OCTUBRE','MANTA','MANABI'),(2313,'COLEGIO TECNICO DE COMPUTACION E INSTITUTO SUPERIOR DE CONPUTACION CENSTUDIOS','PICHINCHA ','QUITO'),(2314,'UNIDAD EDUCATIVA LICEO ITALIANO','GUAYAQUIL','GUAYAS'),(2315,'COLEGIO NACIONAL ALEJANDRO OTOYA BRIONES','ESMERALDAS ','ESMERALDAS'),(2316,'UNIDAD EDUCATIVA DOCE DE MAYO','PUYO','PASTAZA'),(2317,'UNIDAD EDUCATIVA FISCAL \"LEONIDAS PLAZA\"','BAHIA DE CARAQUEZ','MANABI'),(2318,'COLEGIO PADRE JORGE UGALDE PALADINES','PORTOVIEJO','MANABI'),(2319,'COLEGIO FISCAL ALFREDO PEREZ CHIRIBOGA','QUITO','PICHINCHA'),(2320,'UNIVERCIADAD NACIONAL DE LOJA','LOJA ','LOJA'),(2321,'MILITAR GENERAL MIGUEL ITURRALDE N2','TUMBACO','PICHINCHA'),(2322,'UNIDAD EDUCATIVA PARTICULAR ECUADOR ','QUITO ','PICHICHA'),(2323,'UNIDAD EDUCATIVA SANTA CRUZ DE LA PROVIDENCIA','QUITO','PICHINCHA'),(2324,'COLEGIO FISCOMISDIONAL ESTRELLA DEL MAR','ESMERALDAS ','ESMERALDAS'),(2325,'FRANK VARGAS PAZZOS','SALINAS','SANTA ELENA'),(2326,'COLEGIO PARTICULAR SEMIPRESENCIAL SAN JUAN PABLO II','QUITO','PICHINCHA'),(2327,'UNIDAD EDUCATIVA PARTICULAR SAN FRANCISCO DE ASIS DE LA ARCADIA','QUITO','PICHINCHA'),(2328,'JOSE MARIA VELAZ EXT.66-A','EL CARMEN ','MANABI'),(2329,'FRANCISCO HUERTA RENDON','GUAYAQUIL','GUAYAS'),(2330,'UNIDAD EDUCATIVA PCEI MONSEÑOR LEONIDAS PROAÑO','LATACUNGA','COTOPAXI'),(2331,'UNIDAD EDUCATIVA LUIS ALFREDO MARTINEZ','SALCEDO','COTOPAXI'),(2332,'UNIDAD EDUCATIVA SAN JOSE LA SALLE','LATACUNGA','COTOPAXI'),(2333,'COLEGIO NACIONAL MIXTO ROBERTO ALFREDO ARREGUI CH','GUARANDA','BOLIVAR'),(2334,'COLEGIO NUEVA ACADEMIA SALVADOR ','PICHINCHA ','QUITO'),(2335,'INSTITUCIÒN  EDUCATIVA  ALANGASI  ','QUITO  ','PICHINCHA'),(2336,'INSTITUCIÒN   EDUCATIVA  MUNICIPAL   NUEVE DE  OCTUBRE ','QUITO ','PICHINCHA '),(2337,'VIDA  NUEVA  ','QUITO ','PICHINCHA '),(2338,'CESAR AGUSTO TAMAYO MEDINA','CAYAMBE','CANGAHUA'),(2339,'AUXILIADORA','QUITO ','PICHINCHA '),(2340,'SAN MARTIN ','QUITO   ','PICHINCHA '),(2341,'COLEGIO FISCAL MIXTO \"MARCELINO MARIDUEÑA\"','MARCELINO MARIDUEÑA','GUAYAS'),(2342,'UNIDAD EDUCATIVA FISCOMICIONAL LEONARDO MURIALDO','NAPO ','PASTAZA'),(2343,'TRAVERSARI ','QUITO   ','PICHINCHA '),(2344,'CORONEL ARCENCIO  SILVA','QUITO  ','PICHINCHA'),(2345,'COLEGIO NACIONAL CARLOS ZAMBRANO OREJUELA','QUITO','PICHINCHA'),(2346,'11 DE OCTUBRE','RICAURTE ','LOS RIOS'),(2347,'COLEGIO POPULAR   A DISTANCIA  DE ACCIÒN  SOCIAL  CASA  DE LA  CULTURA   ECUATORIANA  ','QUITO   ','PICHINCHA '),(2348,'UNIDAD  EDUCATIVA   ANDINO ','QUITO  ','PICHINCHA  '),(2349,'PRIMICIAS DE LA CULTURA DE  QUITO   ','QUITO  ','PICHINCHA'),(2350,'UNIDAD EDUCATIVA QUEVEDO','LOS RIOS','BABAHOYO'),(2351,'ANUAL    ','QUITO ','PICHINCHA'),(2352,'COLONIAL CUMBAYA   ','QUITO   ','PICHINCHA  '),(2353,'COLEGIO NACIONAL    RIOBAMBA ','QUITO ','PICHINCHA '),(2354,'COLEGIO FISCAL VESPERTINO DR CARLOS TAMERIZ','IBARRA','INMBABURA'),(2355,'UNIDAD EDUCATIVA FISCOMISIONAL TECNICA PACIFICO CEMBRANOS','NUEVA LOJA ','LAGO AGRIO'),(2356,'COLEGIO NACIONAL ELOY ALFARO','QUITO','PICHINCHA'),(2357,'UNIDAD EDUCATIVA ISCOMICIONAL MARISTAS DE CATACOCHA','LOJA','PALTAS'),(2358,'COLEGIO HUMBERTO MOREIRA MARQUEZ','LOS RIOS ','LOS RIOS '),(2359,'INSTITUCION EDUCATIVA PRIMERO DE ABRIL','COTOPAXI','LATACUNGA'),(2360,'INSTITUTO TECNOLOGICO SUPERIOR CARIAMANGA','LOJA','CARIAMANGA'),(2361,'COLEGIO  PARTICULAR  A DISTANCIA  CUOMPUINFORMATICA','QUITO   ','PICHINCHA'),(2362,'UNIDAD   EDUCATIVA   ANGEL MODESTO PAREDES ','QUITO   ','PICHINCHA '),(2363,'UNIDAD EDUCATIVA INTERCULTURA BILIGUE SAN JACINTO','ORELLANA','PASTAZA'),(2364,'COLEGIO DE BACHILLERATO TECNICO FISCAL AUTACHI','RIOBAMBA','CHIMBORAZO'),(2365,'UNIDAD EDUCATIVA DR JOSE MARIA VELASCO IBARRA','PICHINCHA ','QUITO'),(2366,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ EXT. Nº39','QUITO','PICHINCHA'),(2367,'UNIDAD EDUCATIVA LAS CUADRAS','QUITO ','PICHINCHA'),(2368,'UNIDAD  EDUCATIVA  YAHUARCOCHA','QUITO  ','PICHINCHA'),(2369,'COLEGIO NACIONAL ANDRES BELLO','QUITO','PICHICHA'),(2370,'COLEGIO NACIONAL EXPERIMENTAL PROVINCIA DE COTOPAXI','PUJILI','COTOPAXI'),(2371,'INTERANDINO   ','PICHINCHA   ','QUITO '),(2372,'CARMEN MORA DE ENCALADA ','MACHALA','PASAJE'),(2373,'UNIDAD EDUCATIVA 5 DE JUNIO ','QUITO   ','PICHINCHA'),(2374,'DARIO GUEVARA  MAYORGA','PICHINCHA ','QUITO'),(2375,'TECNICO LICTO','CHIMBORAZO','RIOBAMBA'),(2376,'UD PARTICULAR CRISTO DEL CONSUELO','QUITO','PICHINCA'),(2377,'DR. JOSE MARIA VELASCO IBARRA ','MACHALA','EL GUABO'),(2378,'UNIDAD  EDUCATIVA   LUXENBURGO  ','QUITO ','PICHINCHA '),(2379,'UNIDAD EDUCATIVA  SAGRADO  CORAZON  DE  JESUS  HERMANAS     BETHLEMITAS  ','QUITO','PICHINCHA '),(2380,'INSTITUTO SUPERIOR DE ARTES PLASTICAS DANIEL REYES','IBARRA','IMBABURA'),(2381,'COLEGIO NACIONAL JORGE MANTILLA ORTEGA','QUITO','PICHINCHA'),(2382,'COLEGIO CASA DE LA CULTURA ECUATORIANA BENJAMIN CARRION','QUITO','PICHINCHA'),(2383,'COLEGIO PARTICULAR BOLIVARIANO COOPERTIVA DE EDUCACION','QUITO','PICHINCHA'),(2384,'UNIDAD EDUCATIVA ANGEL POLIVIO CHAVES','BOLIVAR','GUARANDA '),(2385,'UNIDAD EDUCATIVA DEL MILENIO SAYAUSI','CUENCA ','AZUAY '),(2386,'COLEGIO NACIONAL MIXTO EL ESFUERZO','SANTO DOMINGO DE LOS SACHILAS ','SANTO DOMINGO DE LOS SACHILAS'),(2387,'COLEGIO SAN GERONIMO','QUITO','PICHINCHA'),(2388,'UNIDAD EDUCATIVA INTERCULTURAL ROGERS MC CULLY','PUYU','PASTAZA'),(2389,'COLEGIO NACIONAL    NOCTURNO  CATAMAYO  ','QUITO  ','PICHINCHA '),(2390,'HODWARD','QUITO ','PICHINCHA '),(2391,'ACADEMIA  AERONAUTICA   HODWARD ','QUITO ','PICHICNHA '),(2392,'MONSEÑOR HUGOLINO DE OSTIA ','DURAN','GUAYAS'),(2393,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE  DOLORES CACUANGO','CAYAMBE','PICHINCHA'),(2394,'UNIDAD EDUCATIVA MIGUEL ANGEL SAMANIEGO JIMENEZ','B ABAHOYO','LOS RIOS'),(2395,'COLEGIO PENSIONADO MIXTO JEAN LE RONDD ALEMBERT','PICHINCHA ','QUITO'),(2396,'NUESTRA  SEÑORA   DEL CISNE ','QUITO ','PICHINCHA'),(2397,'COLEGIO PARTICULAR BRASIL','QUITO','PICHINCHA'),(2398,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE NACION PURUHA','GUAMOTE','CHIMBORAZO'),(2399,'COLEGIO  NACIONAL QUISAPINCHA ','AMBATO ','TUNGURAHUA '),(2400,'COLEGIO NACIONAL TENIENTE HUGO ORTIZ','QUITO','PICHINCHA'),(2401,'COLEGIO NACIONAL MIXTO MIGUEL A ZAMBRANO','QUITO','PICHINCHA'),(2403,'INSTITUCION EDUCATIVA RAFAEL LARREA ANDRADE','QUITO','PICHINCHA'),(2404,'UNIDAD EDUCATIVA FISCAL URUGUAY','PORTOVIEJO','MANABI'),(2405,'INSTITUCION LUMBAQUI ','SUCUMBIOS ','NUEVA   LOJA'),(2406,'UNIDAD  EDUCATIVA  JACINTO  JIJON Y CAAMANO ','QUITO ','PICHINCHA '),(2407,'COLEGIO PARTICULAR KOLPING','STO DMGO ','SANTO DOMINGO '),(2408,'COLEGIO MIXTO MANUEL CSANOVA MACIAS','QUININDE','ESMERALDAS'),(2409,'COLEGIO FISCAL TECNICO EXPERIMENTAL \" ELOY ALFARO\"','QUEVEDO ','LOS RIOS'),(2410,'UNIDAD  EDUCATIVA  COLEGIO   NACIONAL EL ANGEL ','QUITO   ','PICHINCHA  '),(2411,'UNIDAD EDUCATIVA PRTICULAR PCI \"INSTITUTO SUAREZ','GUAYAQUIL','GUAYAS'),(2412,'UNIDAD EDUCATIVA A DISTANCIA DE BOLIVAR EXTENSION CHILLANES','QUITO','PICHINCHA'),(2413,'UNIDAD EDUCATIVA FISCOMISIONAL SANTA JUANA DE ARCO LA SALLE ','CALVAS ','LOJA'),(2414,'COLEGIO PARTICULAR MIXTO JULIO AYON','GUAYAQUIL','GUAYAS'),(2415,'COLEGIO FISCAL DR FRANCISCO CAMPOS COELLO','GUAYAQUIL','GUAYAS'),(2416,'COLEGIO FISCAL BARON DE CARONDELET','ESMERALDAS ','ESMERALDAS'),(2417,'UNIDAD  EDUCATIVA  A DISTANCIA  DEL CARCHI  MONS  LEONIDAS  PROAÑO ','TULCAN','CARCHI'),(2418,'COLEGIO NACIONAL \"PINDAL\"','PINDAL','LOJA'),(2419,'PRIMERO DE AGOSTO','MOCACHA','LOS RIOS'),(2420,'INSTITUTO TEGNOLOGICO GUARANDA','GUARANDA ','BOLIVAR'),(2421,'COLEGIO TECNICO AGROPECUARIO BORBON','ESMERALDAS ','ESMERALDAS'),(2422,'UNIDAD EDUCATIVA COLUMA','CALUMA','BOLIVAR'),(2423,'COLEGIO NACIONAL WALTER TEOFILO SERRANO BATALLAS','MACHALA','EL ORO'),(2424,'COLEGIO DE BACHILLERATO PCEI CECOMSYS','QUITO','PICHINCHA'),(2425,'COLEGIO TECNICO INDUSTRIAL JOSE PERALTA','LATACUGA','COTOPAXI'),(2426,'INSTITUCION     EDUCATIVA   LUIS DUEÑAS  VERA','MANABI ','PORTOVIEJO'),(2427,'COLEGIO NACIONAL TEODORO GOMEZ DE LA TORRE','IBARRA','IMBABURA'),(2428,'UNIDAD EDUCATIVA SIMON RODRIGUEZ','LATACUNGA ','COTOPAXI'),(2429,'COLEGIO PARTICULAR OCTAVIO PAZ','QUITO','PICHINCHA'),(2430,'COLEGIO TECNICO 12 DE NOVIEMBRE','PILLARO','TUNGURAHUA'),(2431,'UNSTITUCION EDUCATIVA ABELARDO FLORES','QUITO','PICHINCHA'),(2432,'UNIDAD EDICATIVA PARTICULAR MARISCAL SUCRE','PASAJE ','MACHALA'),(2433,'DR.ALFREDO MONTENEGRO ','GUARANDA','BOLIVAR'),(2434,'COLEGIO NACIONAL NOCTURNO DR MODESTO CHAVEZ FRANCO','SANTA ROSA','EL  ORO'),(2435,'INSTITUCION EDUCATIVA CAMINO DEL INCA ','QUITO','PICHINCHA'),(2436,'COLEGIO MIXTO MANUEL ANTONIO CASANOVA MACIAS','QUININDE','ESMERALDAS'),(2437,'PCEI GENERAL RUMIÑAHUI','QUITO','PICHINCHA '),(2438,'COLEGIO CARLOS POVEDA HURTADO','QUITO','PICHINCHA'),(2439,'COLEGIO FISCAL POPULAR LIBERTAD DE TIMBRE','ESMERALDAS ','ESMERALDAS'),(2440,'SECAP','TULCAN','CARCHI'),(2441,'COLEGIO TECNICO INTERCULTURAL BILINGUE EL CHAQUIÑAN','LATACUNGA','COTOPAXI'),(2442,'COTOGCHOA','SANGOLQUI','PICHINCHA'),(2443,'UNIDAD EDUCATIVA TECNICA YARUQUI','QUITO','PICHINCHA'),(2444,'UNIDAD EDUCATIVA DARIO FIGUEROA LARCO ','SANGOLQUI','PICHINCHA'),(2445,'INSTITUCION EDUCATIVA  NUESTRA SEÑORA DEL CISNE ','QUITO','PIUCHINCHA '),(2446,'UNIDAD FISICOMISIONAL SAN FRANCISCO JAVIER','TENA','NAPO'),(2447,'COLEGIO CAPITAN ARROYO','QUITO','ELOY ALFARO'),(2448,'INSTITUCION EDUCATIVA MUNICIPAL NUEVE DE OCTUBRE ','QUITO','PICHINCHA'),(2449,'UNIDAD EDUCATIVA A DISTANCIA \"LA SALLE\"','AZOGUEZ','CAÑAR'),(2450,'UNIDAD EDUCATIVA \"PABLO MUÑOZ VEGA\"','SAN GABRIEL','CARCHI'),(2451,'UNIDAD EDUCATIVA MARISTA CATACOCHA','PALTAS','LOJA'),(2452,'PROFESOR PEDRO ECHEVERRIA BELTRAN','QUITO','PICHINCHA'),(2453,'COLEGIO FISCAL PEDRO ECHEVERRIA TERAN','QUITO','PICHINCHA'),(2454,'UNIDAD EDUCATIVA ANGEL MODESTO PAREDES','QUITO','PICHINCHA'),(2455,'INSTITUCION EDUCATIVA PARTICULAR MANABI TECNOLOGICO','MANABI','MANABI'),(2456,'COLEGIO DR TRAJANO NARANJO ITURRALDE','LATACUNGA','COTOPAXI'),(2457,'COLEGIO NACIONAL ATAHUALPA','AMBATO ','COTOPAXI'),(2458,'UNIDAD EDUCATIVA FISCAL DR RICARDO CORNEJO ROSALES','QUITO','PICHINCHA'),(2459,'UNIDAD EDUCATIVA MACHACHI','MACHACHI','PICHINCHA'),(2460,'COLEGIO NACIONAL DR EMILI UZCATEGUI','QUITO','PICHINCHA'),(2461,'UNIDAD   EDUCATIVA   VALDIVIEZO   DE LANDIVAR ','VENTANA    ','LOS   RIOS '),(2462,'COLEGIO MIXTO PARTICULAR DR MANUEL DE J REAL MURILLO','RIOBAMBA','COTOPAXI'),(2463,'UNIDAD EDUCATIVA EVANELICA A DISTANCIA 15 DE NOVIEMBRE ','SHUSHUFINDI','SUCUMBIOS'),(2464,'COLEGIO FISCAL MONS VICENTE MAYA ','QUITO','PICHINCHA'),(2465,'INSTITUCION EDUCATIVA UETAFIB DUCHICELA SHIRY XII','RIOBAMBA','CHIBORAZO'),(2466,'UNIDAD  EDUCATIVA  DOLORES  CACUANGO  ','QUITO  ','PICHINCHA '),(2467,'COLEGIO PARTICULAR MIXTO NOCTURNO \"ANDRES DE VERA\"','PORTOVIEJO','PORTOVIEJO'),(2468,'COLEGIO RICARDO ALVAREZ MANTILLA','QUITO','PICHINCHA'),(2469,'COLEGIO DE BACHILLERATO QUILANGA','LOJA','LOJA'),(2470,'COELGIO PARTICULAR MARQUES DE SELVA ALEGRE','SANGOLQUI','PICHINCHA'),(2471,'UNIDAD EDUCATIVA PARTICULAR TOMAS ALVA EDISON','SANTO DOMINGO DE LOS SACHILAS ','SANTO DOMINGO DE LOS SACHILAS'),(2472,'COLEGIO ADVENTISTA CIUDAD DE QUITO','QUITO','PICHINCHA'),(2473,'COLEGIO NACIONAL TECNICO POPULAR CUCUY','CHONE','MANABI'),(2474,'INSTITUTO TECNOLOGICO SUPERIOR TECNOECUATORIANO','QUITO','PICHINCHA'),(2475,'UNIDAD EDUCATIVA DARIO  GUEVARA MAYORGA','QUITO','PICHINCHA'),(2476,'COLEGIO FISCAL DR JOSE VICENTE TRUJILLO','GUAYAS ','GUAYAQUIL'),(2477,'INSTITUCION EDUCATIVA BERNARDO DAVALOS LEON','RIOBAMBA','CHIMBORAZO'),(2478,'UNIDAD EDUCATIVA FRAY JODOCO RICKE','QUITO','PICHINCHA'),(2479,'UNIDAD EDUCATIVA ELOY ALFARO','QUITO','PICHINCHA'),(2480,'COLEGIO UNIVERSITARIO \"ODILO AGUILAR\"','QUITO','PICHINCHA'),(2481,'ISTITUCION EDUCATIVA PARTICULAR MIXTA ALBERTO EISTEN','SANTO DOMINGO','SANTO DOMINGO DE LOS SATCHILAS'),(2482,'COLEGIO DE BACHILLERATO \"ADOLFO VALAREZO\"','LOJA','LOJA'),(2483,'CENTRO  EDUCATIVO  CEVEDA','CALI ','COLOMBIA'),(2484,'CENTRO EDUCATIVO  CEVIDA','CALI ','COLOMBIA'),(2485,'COLEGIO TECNICO ARTISTICO CESAR VIERA','QUITO','PICHINCHA'),(2486,'ITSI CHONE','MANABI','CHONE'),(2487,'ZAYDA PATRICIA QUIÑONEZ  HIDALGO','MANABI','CHONE'),(2488,'COLEGIO NACIONAL PINDAL','LOJA ','LOJA'),(2489,'COLEGIO NACIONAL FERNANDO DAQUILEMA','QUITO','PICHINCHA'),(2490,'COLEGIO PARTICULAR A DISTANCIA PCEI CRISTOBAL COLON','NAPO','TENA'),(2491,'UNIDAD EDUCATIVA CADVRISH','AMBATO ','TUNGURAGUA'),(2492,'INSTITUCION EDUCATIVA ALANGASI','QUITO','PICHINCHA'),(2493,'GONZALO      DIAZ  PINEDA   GUALCHAN ','TULCAN  ','CARCHI'),(2494,'UNIDAD EDICATIVA CIUDAD DE ALAUSI','ALAUSI','CHIMBARAZO'),(2495,'COLEGIO NOCTURNO PIO XII ANEXO A LA PROVIDENCIA','QUITO','PICHINCHA'),(2496,'UNIDAD EDUCATIVA TEMPORAL OÑA','OÑA','AZUAY '),(2497,'COLEGIO NACIONAL PUERTO LIMON','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS SACHILAS'),(2498,'COLEGIO TECNICO INDUSTRIAL CHARAPOTO','CHARAPOTO','MANABI'),(2499,'LA MERCED','SUCUMBIOS ','NUEVA LOJA'),(2500,'COLEGIO   PARTICULAR   A DISTANCIA  JULIO  CORTAZAR ','QUITO ','PICHINCHA '),(2501,'JUAN PIO MONTUFAR','QUITO','PICHINCHA'),(2502,'UNIDAD EDUCATIVA DE LAS FUERZAS ARMADAS COLEGIO MILITAR 1 ELOY ALFARO','QUITO','PICHINCHA'),(2503,'QUITO SUR','QUITO','PICHICHA'),(2504,'AIDA GALLEGOS DE MONCAYO','QUITO','PICHINCHA'),(2505,'LEONARDO MALDONADO PEREZ','QUITO','PICHINCHA'),(2506,'COLEGIO DE ESCOLARIDAD INCONCLUSA PARTICULAR ISRAEL','QUITO','PICHINCHA'),(2507,'CIRO ALEGRIA BAZAN','PERU','CHOTA'),(2508,'COLEGIO PARTICULAR A DISTANCIA SEGUNDO ANGEL TAPIA','QUITO','PICHINCHA'),(2509,'UNIDAD EDUCATIVA PCEI SEGUNDO TORRES','LATACUNGA','COTOPAXI'),(2510,'UNIDAD EDUCATIVA MUNICIPAL JULIO E. MORENO','QUITO','PICHINCHA'),(2511,'COLEGIO DE BACHILLERATO LIMON','LIMON','MORONA SANTIAGO'),(2512,'UNIDAD EDUCATIVA PCEI \"MANUEL DE SERVANTES\"','AMBATO ','TUNGURAHUA'),(2513,'UNIDAD EDUCATIVA PCEI \"MANUEL DE SERVANTES\"','AMBATO ','TUGURAHUA'),(2514,'UNIDAD EDUCATIVA PCEI \"MIGUEL DE CERVANTES\"','AMBATO ','TUNGURAHUA'),(2515,'PEDRO PABLO BORJA N1','QUITO','PICHICHA'),(2516,'UNIDAD EDUCATIVA DIECICIETE DE JULIO','IBARRA','IMBABURA'),(2517,'IES ISAAC PERAL','TORREJON ARDOZ','MADRID'),(2518,'UNIDAD EDUCATIVA PCI DE BOLIVAR','GUARANDA','GUARANDA '),(2519,'COLEGIO NACIONAL TECNICO MIXTO \"12 DE ABRIL\"','GUALACEO','AZUAY '),(2520,'PADRE JORGE UGUALDE PALADINRS PCEI','PORTOVELO','MANABI'),(2521,'COLEGIO NACIONAL TECNICO EUGENIO ESPEJO','LAS LAJAS','EL ORO'),(2522,'UNIDAD EDUCATIVA NUEVO HORIZONTE ','QUITO','PIFO '),(2523,'UNIDAD EDUCATIVA MARIO OÑA PERDOMO','SAN GABRIEL','CARCHI'),(2524,'LICEO IBEROAMERICA','QUITO','PICHINCHA'),(2525,'DEL PACIFICO DE CAPACITACION POPULAR','QUITO','PICHINCHA'),(2526,'UNIDAD EDUCATIVA SANTA ISABEL','CUENCA ','AZUAY '),(2527,'UNIDAD EDUCATIVA DEL MILENIO EL TAMBO','LOJA','LOJA'),(2528,'UNIDAD EDUCATIVA AGROPECUARIO TECNICO PEDERNALES','PEDERNALES ','MANABI'),(2529,'UNIDAD EDUCATIVA BABAHOYO','BABAHOYO','LOS   RIOS '),(2530,'UNIDAD  EDUCATIVA  3 DE MAYO','MANABI ','PORTO VIEJO'),(2531,'COLEGIO PARTICULAR CALCETA','CALCETA','MANABI'),(2532,'ALFONSO LOPEZ PUMAREJO','COLOMBIA','COLOMBIA'),(2533,'PONTIFICIA UNIVERITAS AUTONIANUM (ROMA)','EL VATICANO','ROMA'),(2534,'UNIDAD EDUCATIVA EL PROGRESO','CUENCA ','AZUAY '),(2535,'ESCUELA MEDIA 241 DE SAN PETERSBURGO','SAN  PETERSBURGO','OKTIABIRSKIY'),(2536,'UNIDAD EDUC. FISCOMISIONAL SANTA MARIA GORETTI','ELOY ALFARO','ESMERALDAS'),(2537,'INSTITUTO TECNICO SUPERIOR SOBERANIA NACIONAL','ZAMORA CHINCHIPE','ZAMORA CHINCHIPE'),(2538,'COLEGIO DE BACHILLERATO FISCAL \"ALAUSI\"','ALAUSI','CHIMBORAZO'),(2539,'UNIDAD EDUCATIVA HERNAN MALO GONZALEZ','SANTO DOMINGO DE LOS SACHILAS ','SANTO DOMINGO DE LOS COLORADOS'),(2540,'COLEGIO ALVARO VALLADARES','TITUTINI','ORELLANA'),(2541,'COLEGIO  MUNICIPAL HUMBERTO MATA MARTINEZ','QUITO','PICHINCHA'),(2542,'COLEGIOTECNICOMAGGGY INTERNACIONAL','QUITO','PICHINCHA'),(2543,'MARCELO   MONTENEGRO ','QUITO   ','PICHINCHA'),(2544,'UNIDAD  EDUCATIVA  EL ANGEL  ','EL ANGEL  ','CARCHI'),(2545,'INSTITUTO SUPERIOR POLITECNICO JOSE ANTONIO ECHEVERRIA','CUBA','CUBA'),(2546,'COLEGIO TECNICO PRIMERO DE MAYO','QUITO','PICHINCHA'),(2547,'LUIS CORDERO','AZOGUES','CAÑAR'),(2548,'REPUBLICA DE ARGENTINA','LATACUNGA','COTOPAXI'),(2549,'COLEGIO  POPULAR PARTICULAR  CONTINENTAL ','QUITO','PICHINCHA'),(2550,'COLEGIO DE BACHILLERATO TECNICO \"TOACASO\"','LATACUNGA','COTOPAXI'),(2551,'PRIMERO    DE ABRIL ','QUITO  ','PICHINCHA  '),(2552,'INSTITUCION  EDUCATIVA  PCEI COMPUINFORMATICA ','QUITO   ','PICHINCHA  '),(2553,'UNIDAD EDUCATIVA CESAR VIERA','LA TACUNGA','COTOPAXI'),(2554,'UNIDAD  EDUCATIVA TOACASO  ','LATACUNGA','COTOPAXI'),(2555,'GONZALO  ZALDUMBIDE  ','QUITO  ','PICHINCHA'),(2556,'COLEGIO NACIONAL MIXTO TECNICO AGROPECUARIO SUCRE','SUCRE','MANABI'),(2557,'COLEGIO DE EDUCACION GENERAL BASICO','TUMBACO','PICHINCHA'),(2558,'INSTITUTO SUPERIOR TECNOLOGICO INSTA','QUITO','PICHINCHA'),(2559,'COLEGIO PEDRO VICENTE MALDONADO','IBARRA','IMBABURA'),(2560,'UNIDAD   EDUCATIVA  LUXEMBURGO ','QUITO  ','PICHINCHA'),(2561,'UNIDAD EDUCATIVA LA PRESENTACION','QUITO','PICHINCHA'),(2562,'UNIDAD EDUCATIVA FISCAL PATRIA','LATACUNGA','COTOPAXI'),(2563,'COLEGIO OCTAVIO CORDERO PALACIOS','CUENCA ','AZUAY '),(2564,'UNIDAD EDUCATIVA 10 DE AGOSTO','QUITO','PICHINCHA'),(2565,'JOSE ENRIQUE GUERRERO','QUITO','PICHINCHA'),(2566,'COLEGIO   CARDENAL  CARLOS  MARIA  DE LA TORRE  ','QUITO ','PICHINCHA '),(2567,'COLEGIO NACIONAL   GABRIELA MISTRAL  ','QUITO  ','PICHINCHA '),(2568,'UNIDAD EDUCATIVA FISCOMISIONAL ZAMORA CHINCHIPE PCEI','ZAMORA CHINCHIPE','ZAMORA CHINCHIPE'),(2569,'INSTITUTO TECNOLOGICO SUPERIOR ESTUDIOS DE TELEVICION','GUAYAQUIL','GUAYAS'),(2570,'INSTITUCION EDUCATIVA SAN PEDRO DE VALLE HERMOSO','STO DOMINGO','SANTO DOMINGO DE LOS SACHILAS'),(2571,'LICEO PARTICULAR BILINGUE NUEVO MUNDO','CUENCA ','AZUAY '),(2572,'UNIDAD  EDUCATIVA  COMANDANTE  LIZARDO  ALFONSO  VILLAMARIN  ','QUITO  ','PICHINCHA'),(2573,'COLEGIO DE BACHILLERATO FISCOMISIONAL SAN VICENTE FERRER','LOJA','LOJA'),(2574,'UNIDAD  EDUCATIVA AMBATO ','QUITO   ','PICHINCHA '),(2575,'UNIDAD EDUCATIVA MARACAIBO II','CARACAS','VENEZUELA'),(2576,'HIGH SCOOL ACADEMY FOR NEW AMERICANS','QUEENS','NUEVA YORK'),(2577,'COLEGIO  PARTICULAR  PROVINCIA  GALAPAGOS','PUERTO BAQUERIZO MORENO ','GALAPAGOS '),(2578,'COLEGIO NACIONAL DR. VICTOR MIDEROS ALMEIDA','IBARRA','IMBABURA'),(2579,'INSTITUTO TECNOLOGICO SUPERIOR \"LUIS ROGERIO GONZALEZ\"','AZOGUEZ','CAÑAR'),(2580,'COLEGIO TECNICO PARTICULARMIXTO  RUBEN DARIO','GUAYAQUIL ','GUAYAS'),(2581,'COLEGIO PARTICULAR DR. EDMUNDO LOPEZ DOMINGUEZ','GUAYAQUIL','GUAYAS'),(2582,'UNIDAD EDUCATIVA  DEL MILENIO','ORELLANA ','ORELLANA'),(2583,'UNIDAD EDUCATIVA  QUITO  ','QUININDE','ESMERALDAS'),(2584,'COLEGIO NACIONAL TOMAS OLEAS ','CAJABAMBA','CHIBORAZO'),(2585,'ASAAD BUCARM','EL ORO ','ARENILLA'),(2586,'UNIDAD EDUCATIVA DEL MILENIO INTERCULTURAL \"SALINAS\"','GUARANDA','BOLIVAR'),(2587,'UNIDAD EDUCATIVA MANUELA SAENZ DE AIZPURU D7','QUITO','PICHINCHA'),(2588,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE HUANCA PALLAGUACHI','ALAUSI','CHIMBORAZO'),(2589,'COLEGIO DE BACHILLERATO PARTICULAR NOCTURNO VUELTA LARGA','ESMERALDAS ','ESMERALDAS'),(2590,'UNIDAD EDUCATIVA CALAZACON','SANTO DOMINGO','SANTO DOMINGO DE LOS SACHILAS'),(2591,'UNIDAD  EDUCATIVA  PROMOCIÒN  SOCIAL  INTEGRAL  DEL AUSTRO ','CUENCA ','AZUAY '),(2592,'30 DE ABRIL','SACHA','ORELLANA'),(2593,'UNIDAD EDUCATIVA GRAN COLOMBIA','QUITO','PICHINCHA'),(2594,'COLEGIO PARTICULAR MENA DEL HIERRO','QUITO','PICHINCHA'),(2595,'COLEGIO DE BACHILLERATO FISCAL 5 DE AGOSTO','ESMERALDAS ','ESMERALDAS'),(2596,'COLEGIO PARTICULAR LEONOR HEREDIA BUSTAMANTE ','QUITO ','PICHINCHA'),(2597,'COLEGIO MIGUEL MORENO ORDOÑEZ','CUENCA ','AZUAY '),(2598,'U.E.8. DE NOVIEMBRE','BALZAPAMBA','BOLIVAR'),(2599,'INSTITUTO TECNICO SUPERIOR  REPUBLICA DEL  ECUADOR  ','OTAVALO','IMBABURA  '),(2600,'UNIDAD EDUCATIVA CARLOS LARCO HIDALGO ','SANGOLQUI','PICHINCHA'),(2601,'ESCUELA  DE EDUCACIÒN  GENERAL   BASICA  VICTOR   MANUEL PEÑAHERRERA','QUITO ','PICHINCHA'),(2602,'INSTITUCION EDUCATIVA FISCAL QUITO ','QUITO ','PICHINCHA'),(2603,'UNIDAD EDUCATIVA ZAPOTAL','VENTANAS','LOS RIOS'),(2604,'CONCENTRACION DE EDUCACION JULIO CESAR TURBAY','COLOMBIA','CARMEN DE BOLIVAR'),(2605,'COLEGIO  SEMINARIO  NUESTRA SEÑORA  DE LA PAZ','QUITO ','PICHINCHA'),(2606,'LA UNIVERSIDAD   METROPOLITANA','QUITO ','PICHINCHA'),(2607,'KASAMA ','SANTO DOMINGO','SACHILAS'),(2608,'UNIDAD EDUCATIVA NUMA POMPILIO LLONA','QUITO','PICHINCHA'),(2609,'COLEGIO CHARLES DARWIN','GUAYAQUIL','GUAYAS'),(2610,'COLEGIO PARTICULAR MIXTO \"SAN JUAN BOSCO\"','QUITO','PICHINCHA'),(2611,'UNIDAD EDUCATIVA BENJAMIN CARRION','QUITO','PICHINCHA'),(2612,'UNIDAD EDUCATIVA PCEI MONSEÑOR LEONIDAS PROAÑO','SIGCHOS ','COTOPAXI'),(2613,'COLEGIO SALAZAR JIMENEZ JUAN PABLO','LOJA','LOJA'),(2614,'COLEGIO PARTICULAR SANTA MARIA ','QUITO','PICHINCHA'),(2615,'UNIDAD EDUCATIVA MIXTA JULIO MARIA MATOVELLE','CUENCA ','AZUAY '),(2616,'UNIDAD EDUCATIVA MUNICIPAL \"EUGENIO ESPEJO\"','QUITO','PICHINCHA'),(2617,'COLEGIO NACIONAL EL  PLAYON','NUEVA LOJA ','SUCUMBIOS'),(2618,'UNIDAD  EDUCATIVA   A DISTANCIA  DON  BOSCO CAYAMBE ','CAYAMBE','PICHINCHA'),(2619,'UNIDAD EDUCATIVA PCEI \"VICENTE LEON Y ARGUELLES','LATACUNGA','COTOPAXI'),(2620,'COLEGIO NACIONAL \"MIGUEL ANGEL CAZARES\"','PUERTO AYORA','GALAPAGOS '),(2621,'UNIDAD EDUCATIVA BORJA MONSERRAT','QUITO','PICHINCHA'),(2622,'COLEGIO PIO XII','SANTO DOMINGO DE LOS TSACHILAS','SANTO DOMINGO DE LOS COLORADOS'),(2623,'INSTITUCION EDUCATIVA FISCAL CINCO DE JUNIO','QUITO','PICHINCHA'),(2624,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE DR. MANUEL NAULA SAGÑAY','COLTA','CHIMBORAZO'),(2625,'CAMILO TOLEDO GALLEGOS','LATACUNGA','COTOPAXI'),(2626,'UTE','QUITO','PICHINCHA'),(2627,'INSTITUCIÓN EDUCATIVA LEONARDO MALDONADO PEREZ','PUEMBO','PICHINCHA'),(2628,'COLEGIO NACIONAL TECNICO POPULAR COTOGCHOA','RUMIÑAHUI','PICHINCHA'),(2629,'INSTITUCION EDUCATIVA FISCAL TECNICO SUCRE','QUITO','PICHINCHA'),(2630,'COLEGIO NACIONAL ALEJANDRO BUSTAMANTE BUSTAMANTE','JIPIJAPA','MANABI'),(2631,'COLEGIO TECNICO PARTICULAR PADRE ANTONIO BRESCIANI','PUJILI','COTOPAXI'),(2632,'PRINCIPE DE PAZ','ESMERALDAS ','ESMERALDAS'),(2633,'COLEGIO NACIONAL EXPERIMENTAL NOCTURNO GABRIELA MISTRAL','QUITO','PICHINCHA'),(2634,'INSTITUCION EDUCATIVA FISCAL 13 DE ABRIL','QUITO','PICHINCHA'),(2635,'UNIVERSIDAD CRISTIANA LATINOAMERICANA SEK','QUITO','PICHINCHA'),(2636,'LEOPOLDO MERCADO ','RUMIÑAHUI','PICHINCHA'),(2637,'INSTITUCION EDUCATIVA FISCAL LUIS NAPOLEON DILON','QUITO','PICHINCHA'),(2638,'COLEGIO FISCAL PROFESOR PEDRO ECHEVERRIA TERAN    ','QUITO  ','PICHINCHA'),(2639,'COLEGIO DE INFORMATICA Y TECNICAS CONTABLES \"AMAZONAS\"','SANTO DOMINGO ','STO. DGO DE LOS TSACHILAS'),(2640,'COLEGIO NOCTURNO FISCAL U.N.E','GUAYAQUIL','GUAYAS'),(2641,'COLEGIO   TECNICO   HUMANISTICO  FERNANDO   DAQUILEMA','RIOBAMBA','CHIMBORAZO '),(2642,'INSTITUCION EDUCATIVA CENEPA','QUITO','PICHINCHA'),(2643,'COLEGIO CARDENAL CARLOS MARIA DE LA TORRE','QUITO','PICHINCHA'),(2644,'UNIDAD EDUCATIVA 17 DE SEPTIEMBRE','MILAGRO','GUAYAS'),(2645,'COLEGIO PARTICULAR MIXTO LIBERTADOR BOLIVAR','GUAYAQUIL','GUAYAS'),(2646,'UNIDAD EDUCATIVA JUAN BAUTISTA AGUIRRE','DAULE','GUAYAS'),(2647,'INSTITUCION EDUCATIVA PARA PERSONAS CON EDUCACION INCONCLUSA  SAN JUAN PABLO II','QUITO ','PICHINCHA'),(2648,'INSTITUCION EDUCATIVA MUNICIPAL  RAFAEL ALVARADO','TUMBACO','PICHINCHA'),(2649,'UNIDAD EDUCATIVA CHIMBORAZO  PCEI','RIOBAMBA','CHIMBORAZO'),(2650,'UNIDAD EDUCATIVA MIXTA NARCISA DE JESUS','GUAYAQUIL','GUAYAS'),(2651,'COLEGIO PARTICULAR SANTA RITA ','QUITO','PICHINCHA'),(2652,'COLEGIO TCENICO PARTICULAR A DISTANCIA PROVINCIA DE ESMERALDAS','ESMERALDAS ','ESMERALDAS'),(2653,'REPUBLICA DE CUBA','SANCTI ESPIRITUS','SANCTI ESPIRITU'),(2654,'UNIDAD EDUCATIVA PIMAMPIRO','IBARRA','IMBABURA'),(2655,'COLEGIO   PARTICULAR   A  DISTANCIA INTERCULTURAL  BILINGUE \"PUCARA\"','AMBATO ','TUNGURAHUA'),(2656,'TULA STATE UNIVERTITY','TULA','RUSIA'),(2657,'TECNICO FUERZA AEREA ECUATORIANA','QUITO','PICHICHA'),(2658,'SANTA JUANA DE ARCO LA SALLE','CALVAS ','LOJA'),(2659,'SAN JUAN BOSCO','QUITO','PICHINCHA'),(2660,'CAMILO GALLEGOS TOLEDO','QUITO','PICHINCHA'),(2661,'COLEGIO TECNICO  PARTICULAR  JOSE MARTI','QUITO','PICHINCHA'),(2662,'UNIDAD  EDUCATIVA  GONZALO PIZARRO ','QUITO ','PICHINCHA'),(2663,'UNIDAD EDUCATIVA PARTICULAR GLORIA GORELIK','GUAYAS ','GUAYAQUIL'),(2664,'COLEGIO NACIONAL MIXTO \"ESMERALDAS LIBRE\"','ESMERALDAS ','ESMERALDAS'),(2665,'AMADOR VERA VERA','EL CARMEN ','MANABI'),(2666,'INSTITUCION EDUCATIVA FISCAL ALANGASI','QUITO','PICHINCHA'),(2667,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE INTILLACTA DE PAUSHIYACU','TENA ','NAPO'),(2668,'UNIDAD EDUCATIVA GONZALO PIZARRO','PANGUA','COTOPAXI'),(2669,'UNIDAD EDUCATIVA SAQUISILI','SAQUISILI','COTOPAXI'),(2670,'PCEI PARTICULAR \"DEL PACIFICO\"','QUITO','PICHINCHA'),(2671,'COLEGIO PARTICULAR SANTA MARIA','QUITO','PICHINCHA'),(2672,'COLEGIO TECNICO ECUADOR','QUITO  ','PICHINCHA'),(2673,'UNIDAD EDUCATIVA FISCAL 24 DE JULIO','QUITO','PICHINCHA'),(2674,'UNIDAD EDUCATIVA PROCER MANUEL QUIROGA','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(2675,'UNIDAD EDUCATIVA PROCER JOSE CUERO Y CAICEDO','MACAS','MORONA SANTIAGO'),(2676,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"SIMON BOLIVAR\"','SANGOLQUI','MEJIA'),(2677,'COLEGIO PARTICULAR MIXTO SANTA MARIA','QUITO','PICHINCHA'),(2678,'COLEGIO PARTICULAR A DISTANCIA FEDERICOP GONZALEZ SUAREZ','SANTO DOMINGO','SANTO DOMINGO DE LOS SATCHILAS'),(2679,'COLEGIO PARTICULAR A DISTANCIA FEDERICO GONZALEZ SUAREZ','SANTO DOMINGO','SANTO DOMINGO DE LOS SATCHILAS'),(2680,'COLEGIO NACIONAL TECNICO AGROPECUARIO COLON ARTEAGA GARCIA','CHONE','MANABI'),(2681,'UNIDAD EDUCATIVA FISCOMISIONAL \"YAMARAM TSAWAA\"','SUCUA','MORONA SANTIAGO'),(2682,'UNIDAD   EDUCATIVA  DEL MILENIO  \"AMAZONAS\"','ORELLANA','FRANCISCO  DE  ORELLANA '),(2683,'UNIDAD EDUCATIVA FISCOMISIONAL \"JOSE MARIA VELAZ, S.J.\" EXT. Nº 100 CENTRO DEL MUCHACHO TRABAJADOR','QUITO','PICHINCHA'),(2684,'UNIDAD EDUCATIVA LA INMACULADA','EL CORAZON','COTOPAXI'),(2685,'UNIDAD EDUCATIVA PECI MONSEÑOR LEONIDAS PROAÑO - EL CORAZON','PANGUA','COTOPAXI'),(2686,'UNIDAD EDUCATIVA PARTICULAR CARDENA DE LA TORRE','PICHINCHA ','QUITO'),(2687,'UE FISCOMISIONAL JUAN RAMON JIMENEZ HERRERA, CAT \" MANUELITA SAENZ\"','NUEVA LOJA ','SUCUMBIOS'),(2688,'CENTRO DE ESTUDIOS E INVESTIGACION VIDA \"CEVIDA\"','CALI ','COLOMBIA'),(2689,'INSTITUTO TECNOLOGICO SUPERIOR DAVID P. AUSUBEL','QUITO','PICHINCHA'),(2690,'INSTITUCION EDUCATIVA FISCOMISIONAL \"JUAN PABLO II\"','QUITO','PICHINCHA'),(2691,'COLEGIO A DISTANCIA PARTICULAR POLITECNICO NUEVO ECUADOR','QUITO','PICHINCHA'),(2692,'UNIDAD EDUCATIVA PARTICULAR INTERNACIONAL','QUITO','PICHINCHA'),(2693,'MARCELO MONTENEGRO','QUITO','PICHINCHA'),(2694,'UECIB SEGUNDO JACOBO YEPEZ TOCTO','CAJABAMBA ','CHIMBORAZO'),(2695,'PARTICULAR MIXTO \"FRANKLIN DELANO ROODRVRLT\"','PORTOVIEJO','PORTOVIEJO'),(2696,'INSTITUCION EDUCATIVA PROF. ALONSO VITERI GARRIDO','STO DOMINGO','SANTO DOMINGO DE LOS SACHILAS'),(2697,'UNIDAD EDUCATIVA 23 DE JUNIO','BABA ','LOS RIOS '),(2698,'UNIDAD EDUCATIVA PARTICULAR PDTE CARLOS JULIO AROSEMENA TOLA','GUAYAQUIL ','GUAYAS'),(2699,'UNIDAD EDUCATIVA SAN JUAN','PUEBLO VIEJO ','LOS   RIOS '),(2700,'UNIDAD EDUCATIVA PCEI LIBERTAD','LATACUNGA ','COTOPAXI'),(2701,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE HUALCOPO DUCHICELA','COLTA','CHIMBORAZO'),(2702,'INSTITUTO EDUCATIVO ISIDRO AYORA','IBARRA','LITA'),(2703,'COLEGIO PARTICULAR  MIXTO JOSE BEDON TOSCANO','QUITO','PICHINCHA'),(2704,'COLEGIO DE BACHILLERATO \"12 DE DICIEMBRE\"','CELICA','LOJA'),(2705,'UNIDAD EDUCATIVA PCEI DE BOLIVAR EXTENSION SAN JOSE DEL TAMBO','BOLIVAR','SAN MIGUEL'),(2706,'UNIDAD EDUCATIVA EXPERIMENTAL YAMARAM TSAWAA MATRIZ','SUCUA','MORONA SANTIAGO'),(2707,'UNIDAD EDUCATIVA SUCUMBIOS','LAGO AGRIO','SUCUMBIOS'),(2708,'INSTITUTO TECNICO SUPERIOR VIDA NUEVA','QUITO','PICHINCHA '),(2709,'INSTITUCIÒN EDUCATIVA PCEI NUEVO ECUADOR','QUITO','PICHINCHA'),(2710,'UNIDAD EDUCATIVA \"ECONOMISTA ABDON CALDERON\"','QUITO','PICHINCHA'),(2711,'UNIDAD EDUCATIVA CLUB ARABE ECUATORIANO','QUITO','PICHINCHA'),(2712,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE \"LOS TIPINES\"','GUAMOTE','CHIMBORAZO'),(2713,'INSTITUCION EDUCATIVA FISCAL CONOCOTO','QUITO','PICHINCHA'),(2714,'UNIDAD EDUCATIVA \"JOSE MARIA VELASCO IBARRA\"','EL GUABO','EL  ORO'),(2715,'UNIDAD EDUCATIVA INFORMATICA PORTOVIEJO','MANABI','PORTOVIEJO'),(2716,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"SIGLO XXI\"','SANGOLQUI','PICHINCHA'),(2717,'UNIDAD EDUCATIVA MANUELA SAENZ','QUITO','PICHINCHA'),(2718,'COLEGIO TECNICO AGROPECUARIO \"JATUN JUIGUA\"','PUJILI','COTOPAXI'),(2719,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE JATUN JUIGUA','PUJILI','COTOPAXI'),(2720,'COLEGIO PARTICULAR  A   DISTANCIA  \"REPUBLICA  DE  ARGENTINA\"','AMBATO ','TUGURAHUA'),(2721,'COLEGIO NACIONAL MIXTO MARIO MINUCHE MURILLO','PICHINCHA ','QUITO'),(2722,'UNIDAD  EDUCATIVA   JESUS  DE  NAZARETH','QUITO  ','PICHINCHA'),(2723,'COLEGIO PARTICULAR LOS ALAMOS','QUITO','PICHINCHA'),(2724,'UNIDAD EDUCATIVA PARTICULAR DR. EUGENIO ESPEJO','ESMERALDAS ','QUININDE'),(2725,'COLEGIO NACIONAL JOAQUIN GALLEGOS LARA','LA CONCORDIA ','SANTO DOMINGO DE LOS TSACHILAS'),(2726,'COLEGIO PARTICULAR  A DISTANCIA ELOY ALFARO','FLAVIO ALFARO ','MANABI'),(2727,'COLEGIO NACIONAL MIXTO 4 JULIO','QUITO','PICHINCHA'),(2728,'INSTITUCIÒN EDUCATIVA PCEI PARTICULAR SAN JUAN PABLO II','QUITO','PICHINCHA'),(2729,'UNIDAD EDUCATIVA FISCAL AMAZONAS','QUITO','PICHINCHA'),(2730,'COLEGIO PARTICULAR \"COMPUINFORMATICA\"','QUITO','PICHINCHA'),(2731,'UNIDAD EDUCATIVA ELOY LAFARO','CHONE','MANABI'),(2732,'COLEGIO TECNICO PARTICULAR \"MUNDO NUEVO\"','QUITO','PICHINCHA'),(2733,'UNIDAD EDUCATIVA BOLIVAR','AMBATO ','TUNGURAHUA'),(2734,'INSTITUTO TECNOLOGICO SUPERIOR SUCRE','QUITO','PICHINCHA'),(2735,'UNIDAD EDUCATIVA FISCAL BILINGUE CESAR SANDOVAL VITERI','LATACUNGA','COTOPAXI'),(2736,'COLEGIO DE BACHILLERATO A DISTANCIA MARIA DEL CISNE','EL ORO','PIÑAS'),(2737,'UNIDAD EDUCATIVA MUNICIPAL MANUEL CABEZA DE VACA','QUITO','PICHINCHA'),(2738,'COLEGIO DE BACHILLERATO \"ZOILA UGARTE DE LANDIVAR\"','SANTA ROSA','EL  ORO'),(2739,'COLEGIO PARTICULAR \"LICEO EMPRESARIAL\"','QUITO','PICHINCHA'),(2740,'UNIDAD EDUCATIVA AGUSTIN IGLESIAS','LUDO','AZUAY '),(2741,'GENERAL RUMIÑAHUI','QUITO','PICHINCHA'),(2742,'INSTITUCION EDUCATIVA FISCAL 11 DE MARZO','QUITO','PICHINCHA'),(2743,'UNIDAD EDUCATIVA PARTICULAR POPULAR \"SEGUNDO TORRES\"','QUITO','PICHINCHA'),(2744,'UNIDAD  EDUCATIVA  PCEI  DE  BOLIVAR  CAT SAN LUIS   DE PAMBIL ','GUARANDA','BOLIVAR'),(2745,'COLEGIO FISCAL POPULAR DR.FRLIX SARMIENTO NUÑEZ','SANTA ELENA ','SANTA ELENA'),(2746,'UNIDAD EDUCATIVA FISCAL DR. JOSE MARIA VELASCO IBARRA','QUITO','PICHINCHA'),(2747,'CASA DE LA CULTURA ECUATORIANA POPULAR','QUITO','PICHINCHA'),(2748,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE \"TINKU YACHAY\"','QUITO','PICHINCHA'),(2749,'UNIDAD EDUCATIVA INTERCULTURAL Y BILINGUE JATARI UNANCHA','PUJILI','COTOPAXI'),(2750,'UNIDAD EDUCATIVA PICHINCHA','QUITO','PICHINCHA'),(2751,'COLEGIO PARTICULAR MIXTO VICENTE ROCAFUERTE','PICHINCHA ','MANABI'),(2752,'COLEGIO TECNICO EL ENO','SUCUMBIOS','LAGO AGRIO'),(2753,'UNIDAD EDUCATIVA DR. BALTAZAR AGUIRRE','QUINARA','LOJA'),(2754,'COLEGIO NACIONAL TECNICO \"CAMPOSANO\"','PAJAN','MANABI'),(2755,'UNIDAD EDUCATIVA ALFREDO PEREZ GUERRERO','OTAVALO','IMBABURA'),(2756,'UNIDAD   EDUCATIVA    SAN MIGUEL   DE  IBARRA  ISFERYAL','IBARRA','IMBABURA'),(2757,'UNIDAD EDUCATIVA FISCAL \"CESAR PLAZA MONZON\"','ESMERALDAS ','ESMERALDAS'),(2758,'INSTITUCION EDUCATIVA CALDERON II','QUITO','PICHINCHA'),(2759,'UNIDAD EDUCATIVA CUMANDA','RIOBAMBA','CHIMBORAZO'),(2760,'INSTITUCION EDUCATIVA TERESA DE CALCUTA','MANTA','MANABI'),(2761,'COLEGIO TÈCNICO AGROPECUARIO  \"DR JOSÉ MARIA   EGAS\"','QUITO','PICHINCHA'),(2762,'COLEGIO TÈCNICO  AGROPECUARIO \"DR. JOSÈ MARÌA  EGAS\"','CHONE  ','MANABI'),(2763,'INSTITUCION EDUCATIVA PCEI PARTICULAR \"DEL PACIFICO\"','QUITO','PICHINCHA'),(2764,'MIGUEL DE SANTIAGO','QUITO','PICHINCHA'),(2765,'INSTITUCIÓN EDUCATIVA JOSE MEJIA LEQUERICA','MACHACHI','PICHINCHA'),(2766,'JUAN DE SALINAS','SANGOLQUI','PICHINCHA'),(2767,'UNIDAD EDUCATIVA IMBANA','LOJA','ZAMORA CHINCHIPE'),(2768,'UNIDAD EDUCATIVA HENRY DUNANT','SAN GOLQUI','PICHINCHA'),(2769,'JOSE MARIA VELAZ EXT 61A SANGOLQUI','QUITO','PICHINCHA'),(2770,'INSTITUCION EDUCATIVA FISCAL \"SUCRE\"','QUITO','PICHINCHA'),(2771,'COLEGIO NACIONAL MIXTO \"DR. ALFREDO NOBOA MONTENEGRO\"','CHARQUIYACO','BOLIVAR'),(2772,'UNIDAD EDUCATIVA MUNICIPAL ANTONIO JOSE DE SUCRE','QUITO','PICHINCHA'),(2773,'COLEGIO    NACIONAL    VICENTE    ANDA  AGUIRRE     ','PEDRO VICENTE MALDONADO','PICHINCHA'),(2774,'UNIDAD EDUCATIVA A DISTANCIA DE MANABI','PORTOVIEJO','MANABI'),(2775,'VICENTE ROCAFUERTE','QUITO','PICHINCHA'),(2776,'INSTITUCION EDUCATIVA LUIS A. MARTINEZ','QUITO','PICHINCHA'),(2777,'INSTITUCION SANTA GEMA','PORTOVIEJO','MANABI'),(2778,'COLEGIO PARTICULAR \"SEGUNDO TORRES\"','QUITO','PICHINCHA'),(2779,'UNIDAD DE FORMACION ARTESANAL FISCAL \"ISMAEL PEREZ PAZMIÑO\"','NARANJITO','GUAYAS'),(2780,'UNIDAD   EDUCATIVA   13 DE   ABRIL  ','QUITO  ','PICHINCHA    '),(2781,'INSTITUCION EDUCATIVA PARTICULAR PARA PERSONAS CON ESCOLARIDAD INCONCLUSA ISRAEL','QUITO','PICHINCHA'),(2782,'UNIDAD EDUCATIVA REPUBLICA DE CANADA','LAGO AGRIO','SUCUMBIOS'),(2783,'INSTITUTO UNIVERSITARIO DE EDUACION  ESPECIALIZADA    ','VALERA','VENEZUELA'),(2784,'UNIVERSIDAD LAICA \"ELOY ALFARO\" DE MANABI','MANABI','PORTOVIEJO'),(2785,'INSTITUCION EDUCATIVA  FISCAL \"EDUARDO  SALAZAR GÒMEZ\"','QUITO  ','PICHINCHA'),(2786,'COLEGIO   TECNICO PARTICULAR  MIXTO  AGR.PATRICIO LOPEZ   REASCO ','QUININDE ','ESMERALDAS'),(2787,'COLEGIO NACIONAL TECNICO SAN JUAN DE PASTOCALLE','LATACUNGA','COTOPAXI'),(2788,'INSTITUCION EDUCATIVA PARA PERSONASCON ESCOLARIDAD INCONCLUSA PRIMERO DE MAYO','QUITO','PICHINCHA'),(2789,'UNIDAD EDUCATIVA FISCAL DR. TEODORO ALVARADO OLEA','GUAYAQUIL','GUAYAS'),(2790,'UNIVERSIDAD CRISTIANA LATINOAMERICANA','QUITO','PICHINCHA'),(2791,'MUNICIPAL SAN FRANCISCO DE QUITO','GUAYLLABAMBA','PICHINCHA'),(2792,'UNIDAD EDUCATIVA LEON DE FEBRES CORDERO','ESMERALDAS ','ESMERALDAS'),(2793,'ESCUELA DE EDUCACION BASICA PCEI  14 DE OCTUBRE','PUJILI','COTOPAXI'),(2794,'UNIDAD DE FORMACION ARTESANAL FISCAL \"MANUELA CAÑIZARES\"','GUAYAQUIL','GUAYAS'),(2795,'COLEGIO TECNICO PARTICULAR MIXTO \"21 DE ABRIL\"','LA TRONCAL','CAÑAR'),(2796,'INSTITUTO NORMAL QUILLOA Nº 17 CAÑAR ','AZUAY','CAÑAR'),(2797,'COLEGIO MUNICIPAL JOSE RICARDO CHIRIBOGA V.','QUITO','PICHINCHA'),(2798,'UNIDAD EDUCATIVA A DISTANCIA DE COTOPAXI EXTENSION SIGCHOS','SIGCHOS ','COTOPAXI'),(2799,'UNIDAD EDUCATIVA PCEI \"COMPUINFORMATICA\" REGIMEN COSTA','QUITO','PICHINCHA'),(2800,'COLEGIO INTERCULTURAL BILINGUE TECNICO AGROPECUARIO POPULAR SURUPUCYU','GUANUJO','BOLIVAR'),(2801,'UNIDAD EDUCATIVA CASA DE LA  CULTURA ECUATORIANA BENJAMIN CARRION Nº1 ','QUITO  ','PICHINCHA'),(2802,'INSTITUCION EDUCATIVA \"SIXTO DURAN BALLEN\"','QUITO','PICHINCHA'),(2803,'UNIDAD EDUCATIVA A DISTANCIA DEL CARCHI \"MONS. LEONIDAS PROAÑO\"','TULCAN','CARCHI'),(2804,'UNIDAD EDUCATIVA FISCAL \"J.M. JIJOM CAAMAÑO Y FLORES\" ','QUITO','PICHINCHA'),(2805,'INSTITUTO  PARTICULAR  SUPERIOR INTERANDINO ','QUITO','PICHINCHA'),(2806,'UNIDAD EDUCATIVA MUNICIPAL JULIO E. MORENO','QUITO','PICHINCHA'),(2807,'UNIDAD EDUCATIVA MUNICIPAL \"JULIO E. MORENO\"','QUITO','PICHINCHA'),(2808,'MUNICIPAL FERNANDEZ MADRID','QUITO','PICHINCHA'),(2809,'UNIDAD EDUCATIVA BATALLA DE PICHINCHA','LAS GOLONDRINAS','IMBABURA'),(2810,'COLEGIO PARTICULAR A DISTANCIA \"SANTA CRUZ\" ','GUAYAQUIL','GUAYAS'),(2811,'COLEGIO PARTICULAR A DISTANCIA \"SANTA CRUZ\"','GUAYAS ','GUAYAQUIL'),(2812,'ERCILIA DE MARTINEZ','QUEVEDO ','LOS RIOS'),(2813,'UNIDAD EDUCATIVA PARTICULAR \"JEAN PIAGET\"','SANTO DOMINGO DE LOS TSACHILAS ','SANTO DOMINGO '),(2814,'UNIDAD EDUCATIVA MANUELA SAENZ DE AZIPURU D7','QUITO','PICHINCHA'),(2815,'COLEGIO DE BACHILLERATO HEROES DE PAQUISHA ','ZUMBA ','ZAMORA CHINCHIPE'),(2816,'UNIVERSIDAD REGIONAL AUTONOMA DE LOS ANDES','AMBATO ','COTOPAXI'),(2817,'INSTITUCION EDUCATIVA FISCAL TRECE DE ABRIL','QUITO','PICHINCHA'),(2818,'COLEGIO NACIONAL TECNICO NUEVA JERUSALEN','QUININDE','ESMERALDAS'),(2819,'COLEGIO FISCAL MANUEL CORDOVA GALARZA','QUITO','PICHINCHA'),(2820,'INSTITUTO  SUPERIOR TECNICO SUCRE','QUITO','PICHICHA'),(2821,'UNIDAD EDUCATIVA PARTICULAR PICHINCHA  CONOCOTO','CONOCOTO','PICHINCHA'),(2822,'COLEGIO PARTICULAR NUESTRA SEÑORA DEL CISNE','QUITO','PICHINCHA'),(2823,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"JULIO CORTAZAR\"','QUITO','PICHINCHA'),(2824,'INSTITUTO LA GUINEUETA ','ESPAÑA','ESPAÑA'),(2825,'0400000959 SAINT EUGANE','HAITI','FORT- LIBERTE'),(2826,'COLEGIO PARTICULAR BAUHAUS','QUITO','PICHINCHA'),(2827,'UNIDAD EDUCATIVA MOCACHE','QUEVEDO ','LOS RIOS'),(2828,'UNIDAD EDUCATIVA GUARE','VINCES','LOS   RIOS '),(2829,'COLEGIO POPULAR A DISTANCIA \"REPUBLICA DE ARGENTINA\"','LA MANA ','AMBATO'),(2830,'SAN JUAN BAUTISTA','LOS ANDES','COLOMBIA'),(2831,'COLEGIO TECNICO INTERCULTURAL BILINGUE\"ACHULLAY\"','ACHULLAY','CHIMBORAZO'),(2832,'INSTITUTO TECNOLOGICO TULCAN','TULCAN','CARCHI'),(2833,'INSTITUTO DE EDUCACION SECUNDARIA GALLECS','QUITO','PICHINCHA'),(2834,'ALEJANDRO VON HUMBOLTH','QUITO','PICHINCHA'),(2835,'UNIDAD EDUCATIVA MARISCAL SUCRE','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS COLORADOS'),(2836,'INSTITUCION PROVIDENCIA   MIRANDA ','CAUCA','COLOMBIA'),(2837,'UNIVERSITARIO DE ARTES PLASTICAS','QUITO','PICHINCA'),(2838,'UNIDAD EDUCATIVA GALO PLAZA LAZO','ECHEANDIA','BOLIVAR'),(2839,'UNIDAD EDUCATIVA SAN ISIDRO','RIOBAMBA','CHIBORAZO'),(2840,'COLEGIO MIXTO NOCTURNO AMAZONAS','QUITO','PICHINCHA'),(2841,'UNIDAD EDUCATIVA FISCOMISIONAL SAN JOSE','TENA','NAPO'),(2842,'NUEVO MUNDO EN LAS MANOS DE DIOS','SANGOLQUI','PICHINCHA'),(2843,'UNIDAD EDUCATIVA FM. EXPERIMENTAL A DISTANCIA DE NAPO','TENA','NAPO'),(2844,'ANDINOS','EL CARMEN ','MANABI'),(2845,'COLEGIO JOSE MONCADA SANCHEZ','SAN GOLQUI','PICHINCHA'),(2846,'UNIDAD  EDUCATIVA NASA','MEJIA','PICHINCHA'),(2847,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE TOBIAS CELESTINO ZANIMBA GAVILANES','GUAMBOYA','MORONA SANTIAGO'),(2848,'CENTRO EDUCATIVO COMUNITARIO  INTERCULTURAL BILINGUE \"MAYU KAWSAY\"','QUITO ','PICHINCHA'),(2849,'UNIDAD EDUCATIVA FISCAL CELIANO MONGE','QUITO','PICHINCHA '),(2850,'UNIDAD EDUCATIVA LUZ DE EVANGELIO','LA CONCORDIA ','SANTO DOMINGO DE LOS COLORADOS'),(2851,'UNIDAD EDUCATIVA VICENTE ANDA AGUIRRE','DELEG','CAÑAR'),(2852,'UNIDAD EDUCATIVA LEON COOPER','PICHINCHA ','QUITO'),(2853,'UNIDAD EDUCATIVA LUIS RIVADENEIRA ECHEVERRIA','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(2854,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ, S.J. IRFEYAL EXT 92-A-LA','LA MANA ','COTOPAXI'),(2855,'UNIDAD EDUCATIVA QUISLAG','ALAUSI','CHIMBORAZO'),(2856,'UNIDAD EDUCATIVA ATANASIO VITERI KAROLYS','LATACUNGA','COTOPAXI'),(2857,'UNIDAD EDUCATIVA FISCAL MIGUEL ITURRALDE','MANABI','PORTO VIEJO'),(2858,'UNIDAD EDUCATIVA DISTRITO METROPOLITANO','STO DOMINGO','SANTO DOMINGO DE LOS SACHILAS'),(2859,'EL IRFEYAL - UNIDAD EDUCATIVA \"JOSE MARIA VELAZ, S.J.\" EXT. 47','SANTO DOMINGO','STO DOMINGO DE LOS COLORADOS'),(2860,'UNIDAD EDUCATIVA A DISTANCIA DE BOLIVAR','BOLIVAR','SAN MIGUEL'),(2861,'UNIDAD EDUCATIVA A DISTANCIA DE BOLIVAR','BOLIVAR','SAN MIGUEL'),(2863,'UNIDAD EDUCATIVA RICON DEL SABER','PICHINCHA ','QUITO'),(2864,'UNIDAD EDUCATIVA ALOASI','QUITO','PICHINCHA'),(2865,'UNIDAD EDUCATIVA BELLAVISTA','24 DE MAYO','MANABI'),(2866,'LA UNIDAD EDUCATIVA DE LA PROVIDENCIA','GUAYAS ','GUAYAQUIL'),(2867,'UNIDAD EDUCATIVA DON BOSCO - SALESIANO','CAYAMBE','PICHINCHA'),(2868,'COLEGIO PARTICULAR HISPANOAMERICANO','QUITO','PICHINCHA'),(2869,'INSTITUCION EDUCATIVA CAPITAN ALFONSO ARROYO AGUIRRE','QUITO','PICHINCHA'),(2870,'COLEGIO A DISTANCIA LATACUNGA','COTOPAXI','LATACUNGA'),(2871,'COLEGIO DE BACHILLERATO ZUMBI','ZUMBI','ZAMORA CHINCHIPE'),(2872,'LUIS FELIPE BORJA DEL ALCAZAR','QUITO','PICHINCHA'),(2873,'COLEGIO NACIONAL TECNICO LA PAZ','CARCHI ','TULCAN '),(2874,'UNIDAD EDUCATIVA GUSTAVO LEMOS RAMIREZ','GUARANDA','BOLIVAR'),(2875,'INSTITUCION EDUCATIVA CAMILO GALLEGOS TOLEDO','COTOPAXI','LATACUNGA'),(2876,'UNIDAD EDUCATIVA PARTICULAR RAFAEL BUCHEILI','QUITO','PICHINCHA'),(2877,'UNIDAD EDUCATIVA PARTICULAR \"QUITO\"','GONZALO PIZARRO','SUCUMBIOS'),(2878,'INSTITUTO EDUCATIVA CINCO DE JUNIO','RIOBAMBA','CHIBORAZO'),(2879,'INSTITUCION EDUCATIVA CINCO DE JUNIO','QUITO','PICHINCHA'),(2880,'AB ROBERTO PASSAILAIGUE BAQUERIZO','GUAYAS ','GUAYAQUIL'),(2881,'UNIDAD EDUCATIVA INMACULADA STELLA MARIS','PUERTO BAQUERIZO MORENO ','GALAPAGOS '),(2882,'COLEGIO DE BACHILLERATO RUMIÑAHUI','ARENILLAS','EL  ORO'),(2883,'UNIDAD EDUCATIVA PEDRO CARBO','GUARANDA','BOLIVAR'),(2884,'UNIDAD EDUCATIVA GUASAGANDA ','LA MANA ','COTOPAXI'),(2885,'UNIDAD EDUCATIVA FISCAL LCDA. AGUEDA GONZALEZ QUIÑOÑEZ','ESMERALDAS ','ESMERALDAS'),(2886,'UNIDAD EDUCATIVA ESTRELLAS DEL MAR','ESMERALDAS ','ESMERALDAS'),(2887,'UNIDAD EDUCATIVA BAEZA','BAEZA','NAPO'),(2888,'COLEGIO   TECNICO PARTICULAR JHON VELCK','QUITO  ','PICHINCHA'),(2889,'COLEGIO POPULAR PARTICULAR NUEVA ERA','QUITO','PICHINCHA'),(2890,'COLEGIO MIXTO ANGEL MODESTO','QUITO','PICHICHA'),(2891,'UNIDAD EDUCATIVA SEGUNDO REINALDO CHIRIBOGA RIVERA','EL CARMEN ','MANABI'),(2892,'COLEGIO PARTICULAR A DISTANCIA JUAN MONTALVO FIALLOS','GUAYAQUIL','GUAYAS'),(2893,'INSTITUCION EDUCATIVA JACINTO JIJON Y CAAMANO','PICHINCHA ','QUITO'),(2894,'COLEGIO PARTICULAR DE LAS AMERICAS QUITUMBE','QUITO','PICHINCHA'),(2895,'UNIDAD EDUCATIVA NABON','NABON','AZUAY '),(2896,'UNIDAD   EDUCATIVA  CARLOS    CISNEROS  ','RIOBAMBA','CHIMBORAZO '),(2897,'UNIDAD EDUCATIVA VIDA NUEVA I','QUITO','PICHINCHA'),(2898,'UNIDAD EDUCATIVA 26 DE FEBRERO','PAUTE','AZUAY '),(2899,'UNIDAD EDUCATIVA GUAPARA','PANGUA','COTOPAXI'),(2900,'COLEGIO TECNICO AGROPECUARIO  CHILLA','MACHALA ','EL ORO'),(2901,'UNIDAD EDUCATIVA GREGORIO MARAÑON','LOJA','LOJA'),(2902,'UNIDAD EDUCATIVA LODANA','MANABI','PORTO VIEJO'),(2903,'UNIDAD EDUCATIVA FISCAL MIXTA \"GERMAN GRIJALVA Y TAMAYO\"','IBARRA','IMBABURA'),(2904,'COLEGIO PARTICULAR \"LATINO\"','STO DOMINGO','SANTO DOMINGO DE LOS COLORADOS'),(2905,'UNIDAD  EDUCATIVA  EXPERIMENTAL FAE  N 1','QUITO ','PICHINCHA'),(2906,'COLEGIO TECNICO AGROPECUARIO \"ZULETA\"','IBARRA','IMBABURA'),(2907,'COLEGIO NACIONAL \"GUILLERMO DURAN ARCENTALES\"','GUAYAS ','GUAYAQUIL'),(2908,'UNIDAD EDUCATIVA BILINGUE NUEVO MUNDO','QUITO','PICHINCHA'),(2909,'COLEGIO PARTICULAR CONCEPCION LOZA','QUITO','PICHINCHA'),(2910,'COLEGIO FISCAL CLEMENTE BAQUERIZO','BABAHOYO','LOS RIOS'),(2911,'INSTITUCION EDUCATIVA BRITANICO LOS ANDES','QUITO','PICHINCHA'),(2912,'COLEGIO MIXTO PANAMERICANO','QUITO','PICHINCHA'),(2913,'COLEGIO NACIONAL TECNICO PLAYA PRIETA','PORTOVIEJO','MANABI'),(2914,'UNIDAD EDUCATICA PCEI \"BRITANICO SCHOOL\"','LATACUNGA','CHIMBORAZO'),(2915,'UNIDAD EDUCATIVA PARTICULAR CRISTIANO VERBO','QUITO','PICHINCHA'),(2916,'LA UNIVERSIDAD TECNICA DE DRESDE','ALEMANIA','ALEMANIA'),(2917,'COLEGIO NACIONAL MINAS','QUITO','PICHINCHA'),(2918,'COLEGIO TECNICO AGRICOLA MONS.LEONIDAS PROAÑO V.','PEDERNALES ','MANABI'),(2919,'UNIDAD EDUCATIVA SAN RAFAEL','QUITO','PICHINCHA'),(2920,'COLEGIO PARTICULAR A DISTANCIA SIMON BOLIVAR','SANGOLQUI','PICHINCHA'),(2921,'LICEO LIBANES','GUAYAS ','GUAYAQUIL'),(2922,'UNIDAD EDUCATIVA VICENTE LEON','LATACUNGA','COTOPAXI'),(2923,'ESCUELA GENERAL BASICA FISCAL \"JOSE ENRIQUE RODO\"','QUITO','PICHINCHA'),(2924,'INSTUTICION EDUCATIVA PROVINCIA DE COTOPAXI','PUJILI','COTOPAXI'),(2925,'INSTITUCION EDUCATIVA \"AMABLE ARAUZ\"','PICHINCHA ','QUITO'),(2926,'COLEGIO A DISTANCIA DE PICHINCHA','RUMIÑAHUI','SANGOLQUI'),(2927,'UNIDAD EDUCATIVA SAGRADOS CORAZONES','LA CONCORDIA ','SANTO DOMINGO DE LOS TSACHILAS'),(2928,'COLEGIO FISCAL MIXTO \"DR. JORGE ICAZA CORONEL\"','GUAYAQUIL','GUAYAS'),(2929,'UNIDAD   EDUCATIVA JUAN  RAMON  JIMENEZ  EXTENSION  LUZ   Y  VIDA   ','NUEVA LOJA ','SUCUMBIOS'),(2930,'COLEGIO PARTICULAR SAN JUAN BOSCO','QUITO','PICHINCHA'),(2931,'UNIDAD EDUCATIVA PCEI AB. JAIME ROLDOS AGUILERA','LATACUNA','COTOPAXI'),(2932,'INSTITUCION EDUCATIVA CUMBAYA','CUMBAYA','PICHINCHA'),(2933,'COLEGIO 13 DE ABRIL ','AMBATO ','TUNGRAHUA'),(2934,'INSTITUTO SUPERIOR PEDAGOGICO CIUDAD DE CARIAMANGA','CARIAMANGA ','LOJA'),(2935,'INSTITUTO TECNOLOGICO SUPERIOR PARTICULAR DON BOSCO','LOJA','LOJA'),(2936,'INSTITUCION EDUCATIVA DR MIGUEL ANGEL ZAMBRANO ','QUITO','PICHINCHA'),(2937,'UNIDAD EDUCATIVA CARLOS ZAMBRANO OREJUELA','QUITO','PICHINCHA'),(2938,'IRFEYAL INSTITUTO RADIOFONICO FE Y ALEGRIA','QUITO','PICHINCHA'),(2939,'UNIDAD EDUCATIVA PARTICULAR ACADEMIA AERONAUTICA MAYOR PEDRO TRAVERSARI','QUITO','PICHINCHA'),(2940,'MONSERRATE ALAVA DE GONZALEZ','CALCETA','MANABI'),(2941,'UNIDAD EDUCATIVA PCEI MONSEÑOR LEONIDAS PROAÑO LA MANA','LA MANA ','COTOPAXI'),(2942,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ S.J. IRFEYAL EXTENSION 6-D-SAN','RIOBAMBA','CHIMBORAZO'),(2943,'UNIDAD EDUCATIVA BILINGÜE SURCOS','QUITO','PICHINCHA'),(2944,'UNIDAD EDUCATICA CAMILO GALLEGOS DOMINGUEZ','SHELL','PASTAZA'),(2945,'UNIDAD EDUCATIVA FISCAL VICTOR MANUEL PEÑAHERRERA','QUITO','PICHINCHA'),(2946,'UNIDAD EDUCATIVA URCUQUI','IBARRA','IMBABURA'),(2947,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ EXTENSION 14 SAN GABRIEL','PICHINCHA ','QUITO'),(2948,'NACIONAL \"DR CAMILO GALLEGOS DOMINGUEZ\"','QUININDE','ESMERALDAS'),(2949,'COLEGIO TECNICO ANIBAL SALGADO RUIZ','TISALEO','TUNGURAHUA'),(2950,'UNIDAD EDUCATIVA PCEI LIC. JOSE GABRIEL TERAN VAREA','MACHACHI','PICHINCHA'),(2951,'UNIDAD EDUCATIVA PARTICULAR PCEI VIDA NUEVA','QUITO','PICHINCHA'),(2952,'UNIDAD  EDUCATIVA  LA  INDUSTRIA  ','URDANETA','LOS  RIOS'),(2953,'COLEGIO PARTICULAR MIXTO TRECE DE ABRIL','GUAYAQUIL','GUAYAS'),(2954,'ABELARDO FLORES','QUITO','PICHINCHA'),(2955,'UNIDAD EDUCATIVA CARIAMANGA','CARIAMANGA ','LOJA'),(2956,'UNIDAD EDUCATIVA SAN JACINTO DEL BUA','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(2957,'UNIDAD EDUCATIVA SAN CAMILO','QUEVEDO ','LOS   RIOS '),(2958,'UNIDAD EDUCATIVA ECUADOR A DISTANCIA','QUITO','PICHINCHA '),(2959,'UNIDAD EDUCATIVA MAHANAYM','SANGOLQUI','PICHINCHA'),(2960,'COLEGIO PARTICULAR DE INFORMATICA \"GABRIELA MISTRAL\"','FLAVIO ALFARO ','MANABI'),(2961,'INSTITUCIÒN  EDUCATIVA FISCOMISIONAL CARLOS  PONCE MARTINEZ','QUITO ','PICHINCHA'),(2962,'INSTITUTO TECNOLOGICO SUPERIOR \"PORTOVIEJO\"','PORTOVIEJO','MANABI'),(2963,'COLEGIO NACIONAL 11 DE JULIO','SHUSHUFINDI ','SUCUMBIOS'),(2964,'UNIDAD EDUCATIVA SAN JOSE LA SALLE','QUITO','PICHINCHA'),(2965,'COLEGIO DESAPARECIDO','LATACUNGA','LATACUNGA'),(2966,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILIGUE AYNI PACHA','QUITO','PICHINCHA'),(2967,'UNIDAD EDUCATIVA TEMPORAL OTAVALO','OTAVALO','IMBABURA'),(2968,'UNIDAD EDUCATIVA  FISCOMISIONAL  \"MARIA  AUXILIADORA\"','ESMERALDAS ','ESMERALDAS'),(2969,'PEDRO SCHUMACHER','TOSAGUA','MANABI'),(2970,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ D.J. IRFEYAL EXT. EDUCATIVA Nº 5 - A TANDAPI','TANDAPI','PICHINCHA'),(2971,'UNIDAD EDUCATIVA NICOLAS GUILLEN','QUITO','PICHINCHA'),(2972,' COLEGIO NACIONAL EMILIO UZCATEGUI','QUITO','PICHINCHA'),(2973,'UNIVERSIDAD DE LOS HEMISFERIOR','QUITO','PICHINCHA'),(2974,'DR RASHID TORBAY','GENERAL VILLAMIL PLAYAS','GUAYAS'),(2975,'UNIDAD EDUCATIVA DEL MILENIO AMAZONAS','PUERTO FRANCISCO DE ORELLANA','ORELLANA'),(2976,'COLEGIO  SAN PEDRO DE  GUARANDA  ','GUARANDA ','BOLIVAR'),(2977,'UNIDAD EDUCATIVA FISCAL ATAHUALPA   ','QUITO','PICHINCHA    '),(2978,'UNIDAD EDUCATIVA  COMUNITARIA  INTERCULTURAL BILINGUE SURUPUCYU','GUARANDA','BOLIVAR '),(2979,'UNIDAD EDUCATIVA PCEI CENTEBAD LATACUNGA','LATACUNGA','COTOPAXI'),(2980,'INSTITUCION EDUCATIVA PARTICULAR \"VIDA NUEVA I\"','QUITO','PICHINCHA'),(2981,'COLEGIO A DISTANCIA \"DEL PACIFICO\"','QUITO','PICHINCHA'),(2982,'INSTITUTO TECNOLOGICO \"CINCO DE JUNIO\"','QUITO','PICHINCHA'),(2983,'LUID FELIPE BORJA','MACHACHI','PICHINCHA'),(2984,'LUIS FELIPE  BORJA','MACHACHI','PICHINCHA'),(2985,'INSTITUCION EDUCATIVA SAN VICENTE','TULCAN','CARCHI'),(2986,'COMANDANTE RAFAEL MORAN VALVERDE','QUITO','PICHINCHA'),(2987,'COLEGIO NACIONAL TECNICO MIXTO \"UNE\" DE QUITO','QUITO','PICHINCHA'),(2988,'UNIDAD EDUCATIVA \"CAMILO PONCE ENRIQUEZ\"','QUITO','PICHINCHA'),(2989,'COLEGIO TECNICO AGROPECUARIO \"GENERAL RUMIÑAHUI\"','COLTA','CHIMBORAZO'),(2990,'UNIDAD EDUCATIVA PEDRO BOUGUER','PICHINCHA ','QUITO'),(2991,'INSTITUTO TECNOLOGICO COLEGIO NACIONAL \"JUAN BAUTISTA VAZQUEZ\"','AZOGUEZ','CAÑAR'),(2992,'COLEGIO NACIONAL JUAN PIO MONTUFAR','QUITO','PICHINCHA'),(2993,'UNIDAD EDUCATIVA FISCAL \"GALAPAGOS\"','RIOBAMBA','CHIMBORAZO'),(2994,'UNIDAD EDUCATIVA GENERAL MEDARDO ALFARO','SANTO DOMINGO','SANTO DOMINGO DE LOS SATCHILAS'),(2995,'IMANTAG','IBARRA','IMBABURA'),(2996,'UNIDAD EDUCATIVA FISCAL MANUELA CAÑIZARES','QUITO','PICHINCHA'),(2997,'COLEGIO NACIONAL CHAMBO','RIOBAMBA','CHIMBORAZO'),(2998,'COLEGIO CAMILO PONCE ENRIQUEZ','QUITO','PICHINCHA'),(2999,'UNIDAD EDUCATIVA PCEI LOS RIOS','BABAHOYO','LOS   RIOS '),(3000,'COLEGIO FISCAL \"DIEZ DE AGOSTO\"','VINCES','LOS RIOS'),(3001,'COLEGIO \"CRISTIANO FEBE\"','QUITO','PICHINCHA'),(3002,'COLEGIO SANTIAGO FERNANDEZ GARCIA','LOJA','LOJA'),(3003,'BACHILLERATO INTENSIVO MONSEÑOR LEONIDAS PROAÑO TODOS\"ABC\"','QUITO','PICHINCHA'),(3004,'UNIDAD EDUCATIVA PARTICULAR PCEI \"SAN JUAN PABLO II\"','QUITO','PICHINCHA'),(3005,'UNIDAD EDUCATIVA DEL MILENIO SIGCHOS','SIGCHOS ','COTOPAXI'),(3006,'UNIDAD EDUCATIVA PARTICULAR FEDERICO ENGELS','QUITO','PICHINCHA'),(3007,'SUCRE','QUITO','PICHINCHA'),(3008,'RUMIÑAHUI','SANGOLQUI','PICHINCHA'),(3009,'UNIDAD EDUCATIVA PARTICULAR \"SAN JUAN BOSCO\"','QUITO','PICHINCHA'),(3010,'ADVENTISTA DEL SUR','QUITO','PICHINCHA'),(3011,'INSTITUCIÒN EDUCATIVA EDUARDO SALAZAR GOMEZ','QUITO ','PICHINCHA'),(3012,'UNIDAD EDUCATIVA A DISTANCIA DE COTOPAXI EXTENSION MALINGUAPAMBA','SIGCHOS ','COTOPAXI'),(3013,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGÜE JATARI UNANCHA','SIGCHOS ','COTOPAXI'),(3014,'UNIDAD EDUCATIVA FISCAL DR. RICARDO CORNEJO ROSALES','QUITO','PICHINCHA'),(3015,'UNIDAD EDUCATIVA FISCAL CAMINO DEL INCA','QUITO','PICHINCHA'),(3016,'UNIDAD EDUCATIVA FISCAL DOMINGO FAUSTINO SARMIENTO','QUITO','PICHINCHA'),(3017,'ESCUELA DE EDUCACION BASICA \"VICENTE MIRANDA\"','QUITO','PICHINCHA'),(3018,'ANGEL POLIBIO CORDOVA SANTANDER','QUITO','PICHINCHA'),(3019,'UNIDAD EDUCATIVA GUANGAJE','PUJILI','COTOPAXI'),(3020,'UNIDAD EDUCATIVA FISCOMISIONAL YACHANA INTI','JOYA DE LOS SACHAS','ORELLANA'),(3021,'COLEGIO TECNICO INTERCULTURAL BILINGUE FISCOMISIONAL SEMIPRESENCIAL \"ABYA - YALA\"','LATACUNGA','COTOPAXI'),(3022,'UNIDAD EDUCATIVA LAS NAVES','LAS NAVES','BOLIVAR'),(3023,'INSTITUT FRANCESC MACIA','ESPAÑA','BARCELONA'),(3024,'TECNICO SALESIANO DON BOSCO','QUITO','PICHINCHA'),(3025,'ATAHUALPA','AMAGUAÑA','PICHINCHA'),(3026,'UNIDAD EDUCATIVA JUAN JOSE FLORES','SIGCHOS ','COTOPAXI'),(3027,'COLEGIO NACIONAL JAMA','MANABI','JAMA'),(3028,'INSTITUCION EDUCATIVA TUPAC YUPANQUI','LATACUNGA','COTOPAXI'),(3029,'E.DE FUERZAS ARMADAS LICEO NAVAL QUITO COMANDANTE CESAR ENDARA PEÑAHERRERA','QUITO','PICHINCHA'),(3030,'UNIDAD EDUCATIVA CARLOS ZAMBRANO OREJUELA','GUARANDA','BOLIVAR'),(3031,'UNIDAD EDUCATIVA ERNESTO ALBAN MOSQUERA','STO DOMINGO','STO. DGO DE LOS TSACHILAS'),(3032,'UNIDAD EDUCATIVA PCEI PADRE MARTIN FERNANDEZ','TENA','NAPO'),(3033,'INSTITUCION EDUCATIVA INTI PAKARI','SUCUMBIOS','LAGO AGRIO'),(3034,'UNIDAD EDUCATIVA 2 DE AGOSTO PROYECTO PARA JOVENES Y ADULTOS EBJA','QUITO','PICHINCHA'),(3035,'UNIDAD EDUCATIVA FISCAL \"PROVINCIA DE LOJA\"','GUAYAQUIL','GUAYAS'),(3036,'UNIDAD EDUCATIVA FISCAL FUERTE MILITAR HUANCAVILCA','QUITO ','PICHINCHA'),(3037,'BILINGÜE MODERNO','QUITO','PICHINCHA'),(3038,'COLEGIO NACIONAL \"PALTAS\"','CATACOCHA','LOJA'),(3039,'COMBATIENTES DE TAPI','RIOBAMBA','CHIMBORAZO'),(3040,'COLEGIO \"DR ANTONIO ANDRADE FAJARDO\"','QUITO ','PICHINCHA'),(3041,'UECIB JAIME ROLDOS AGUILERA','QUITO','PICHINCHA'),(3042,'CINCO DE JUNIO','QUITO','PICHINCHA'),(3043,' UNIDAD EDUCATIVA FISCAL ANTISANA','QUITO','PICHINCHA'),(3044,'PADRE JUAN DE VELASCO','CAYAMBE','PICHINCHA'),(3045,'COLEGIO ELECTRONICO PICHINCHA','QUITO','PICHINCHA'),(3046,'UNIDAD EDUCATIVA \"BELISARIO QUEVEDO\"','PUJILI','COTOPAXI'),(3047,'COLEGIO TECNICO FORESTAL \"BATALLA DE TIO CAJAS\"','RIOBAMBA','CHIMBORAZO'),(3048,'UNIDAD EDUCATIVA PCEI JULIO CORTAZAR','QUITO','PICHINCHA'),(3049,'UNIDAD EDUCATIVA PARTICULAR \"SAN JUAN BOSCO\"','QUITO','PICHINCHA'),(3050,'ESCUELA POLITECNICA NACIONAL','QUITO ','PICHINCHA'),(3051,'UNIDAD EDUCATIVA RUMIÑAHUI','QUITO','PICHINCHA'),(3052,'INSTITUTO TECNOLOGICO SUPERIOR AGROPECUARIO \"QUININDE\"','QUININDE','ESMERALDAS'),(3053,'UNIDAD EDUCATICA PCEI JUAN LEON MERA','AMBATO ','TUNGURAHUA'),(3054,'BALCAZAR MORENO JUAN ALFREDO','LA UNION','ESMERALDAS'),(3055,'UNIDAD EDUCATIVA MANUELA SAENZ DE AIZPURU D7','QUITO','PICHINCHA'),(3056,'COLEGIO NOCTURNO RUMIÑAHUI','SANGOLQUI','PICHINCHA'),(3057,'UNIDAD EDUCATIVA DR. TELMO HIDALGO DIAZ','QUITO','PICHINCA'),(3058,'UNIDAD EDUCATIVA CAMILO GALLEGOS TOLEDO','RIOBAMBA','CHIMBORAZO'),(3059,'UNIDAD EDUCATIVA SALINAS INNOVA','SALINAS','SANTA ELENA'),(3060,'LICEO FRAY JUAN RAMOS DE LORA','VENEZUELA','VENEZUELA'),(3061,'UNIDAD EDUCATIVA NACIONAL NAPO','NUEVA LOJA ','SUCUMBIOS'),(3062,'UNIDAD EDUCATIVA FISCAL BICENTENARIO D7 VESPERTINO','QUITO','PICHINCHA'),(3063,'INSTITUCION EDUCATIVA FISCAL \"QUITO\"','QUITO','PICHINCHA'),(3064,'UNIDAD EDUCATIVA \"SAN JUAN EVANGELISTA\"','PEDRO VICENTE MALDONADO','PICHINCHA'),(3065,'MANUEL JOSE JARAMILLO','LOJA','LOJA'),(3066,'COLEGIO RAMON SAMANIEGO PALACIOS','QUITO ','PICHINCHA'),(3067,'INSTITUTO SUPERIOR TECNOLOGICO  DE TURISMO Y PATRIMONIO YAVIRAC ','QUITO ','PICHINCHA'),(3068,'UNIDAD EDUCATIVA FISCAL MARISCAL ANTONIO JOSE DE SUCRE D7','QUITO','PICHINCHA'),(3069,'COLEGIO NACIONAL MIXTO SAN RAFAEL','SANGOLQUI','PICHINCHA'),(3070,'INSTITUTO TECNICO SUPERIOR SUCRE','QUITO','PICHINCHA'),(3071,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE BATALLA DE TIOCAJAS','GUAMOTE','CHIMBARAZO'),(3072,'COLEGIO JUAN MONTALVO','SANGOLQUI','PICHINCHA'),(3073,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE SHIRY CACHA','RIOBAMBA','CHIMBARAZO'),(3074,'COLEGIO FISCAL GONZALO ZALDUMBIDE','QUITO','PICHINCHA'),(3075,'UNIDAD EDUCATIVA DE FUERZAS ARMADAS COLEGIO MILITAR NO.1 ELOY ALFARO','QUITO','PICHINCHA'),(3076,'SIMON BOLIVAR','QUITO','PICHINCHA'),(3077,'INSTITUCION EDUCATIVA FISCOMISIONAL CARLOS PONCE MARTINEZ','QUITO','PICHINCHA'),(3078,'COLEGIO NACIONAL CARDENAL CARLOS MARIA DE LA TORRE','QUITO','PICHINCHA'),(3079,'COLEGIO PARTICULAR \"SAN JUAN BOSCO\"','QUITO','PICHINCHA'),(3080,'COLEGIO PARTICULAR SAN JUAN BOSO','QUITO','PICHINCHA'),(3081,'UNIDAD EDUCATIVA PADRE MARCOS BENETTAZO','BABAHOYO','LOS RIOS'),(3082,'UNIDAD EDUCATIVA ATLANTIS DEL VALLE','QUITO','PICHINCHA'),(3083,'UNIDAD EDUCATIVA PARTICULAR SEGUNDO TORRES ','QUITO','PICHINCHA'),(3084,'UNIDAD EDUCATIVA FISCAL PCEI FEDERICO GONZALEZ SUAREZ','QUITO','PICHINCHA'),(3085,'INSTITUCION EDUCATIVA PARTICULAR ACADEMIA MILITAR GENERAL MIGUEL ITURRALDE','QUITO','PICHINCHA'),(3086,'INSTITUCION EDUCATIVA FISCAL SUCRE','QUITO','PICHINCHA'),(3087,'UNIVERSIDAD AUTONOMA DE QUITO','QUITO','PICHINCHA'),(3088,'COLEGIO NACIONAL NOCTURNO GENERAL RUMIÑAHUI','SANGOLQUI','PICHINCHA'),(3089,'UNIDAD EDUCATIVA FISCAL JULIO TOBAR DONOSO','QUITO','PICHINCHA'),(3090,'UNIDAD EDUCATIVA SANTO DOMINGO DE LOS COLORADOS','STO DOMINGO','STO. DGO DE LOS TSACHILAS'),(3091,'UNIDAD EDUCATIVA PCEI HARVARD ','PUYO ','PASTAZA'),(3092,'UNIDAD EDUCATIVA FISCAL EC. ABDON CALDERON MUÑOZ','QUITO','PICHINCHA'),(3093,'INSTITUTO TECNOLOGICO SUPERIOR VIDA NUEVA','QUITO','PICHINCHA'),(3094,'COLEGIO MIXTO PARTICULAR \"ING. JORGE MANUEL MARUN RODRIGUEZ\"','BUENA FE','LOS RIOS'),(3095,'UNIDAD EDUCATIVA \"SAN FRANCISCO DE LAS PAMPAS\"','LAS PAMPAS','COTOPAXI'),(3096,'INSTITUCION EDUCATIVA PARTICULAR LOUIS VICTOR DE BROGLIE','QUITO','PICHINCHA'),(3097,'UNIDAD EDUCATIVA TARQUI','QUITO','PICHINCHA'),(3098,'COLEGIO MUNICIPAL COTOCOLLAO','QUITO','PICHINCHA'),(3099,'UNIDAD EDUCATIVA 5 DE OCTUBRE','ECHEANDO','BOLIVAR'),(3100,'UNIDAD EDUCATIVA PARTICULAR PCEI CEPEDA','QUITO','PICHINCHA'),(3101,'UNIDAD EDUCATIVA PARTICULAR PCEI CENEPA','QUITO','PICHINCHA'),(3102,'UNIDAD EDUCATIVA FISCAL MEJIA','QUITO','PICHINCHA'),(3103,'UNIDAD EDUCATIVA FISCAL SIMON BOLIVAR','QUITO','PICHINCHA'),(3104,'EL ITSE CONSEJO PROVINCIAL DE PICHINCHA','QUITO','PICHINCHA'),(3105,'INSTITUTO NACIONAL MEJIA NOCTURNA','QUITO','PICHINCHA'),(3106,'COLEGIO NACIONAL DR. CARLOS MANUEL ESPINOZA','PALTAS','LOJA'),(3107,'UNIDAD EDUCATIVA PARTICULAR RINCON DEL SABER','QUITO','PICHINCHA'),(3108,'UNIDAD EDUCATIVA JOSE MARIA VELASCO IBARRA','BUENA FE','LOS   RIOS '),(3109,'ANTONIO JOSE DE SUCRE','QUITO','PICHINCHA'),(3110,'SAN JUAN PABLO II','QUITO','PICHINCHA'),(3111,'UNIDAD EDUCATIVA ANTONIO AVILA MALDONADO','CUENCA ','AZUAY '),(3112,'COLEGIO ESTATAL SAN CARLOS','BAMBAMARCA','PERU'),(3113,'UNIDAD EDUCATIVA LUIS A. MARTINEZ','QUITO','PICHINCHA'),(3114,'2 DE AGOSTO','QUITO','PICHINCHA'),(3115,'UNIDAD EDUCATIVA FISCOMISIONAL SANTA CRUZ DE LA PROVIDENCIA FE Y ALEGRIA','QUITO','PICHINCHA'),(3116,'INSTITUTO TECNICO SUPERIOR BOLIVAR','TULCAN','TULCAN '),(3117,'COLEGIO DE BACHILLERATO SIMON BOLIVAR','IMBABURA','IBARRA'),(3118,'UNIDAD EDUCATIVA A DISTANCIA DE COTOPAXI EXTENSION LA MANA','LATACUNGA','COTOPAXI'),(3119,'UNIDAD EDUCATIVA JUAN PIO MONTUFAR','QUITO','PICHINCHA'),(3120,'NUESTRA SEÑORA DE FATIMA','IBARRA','IMBABURA'),(3121,'INSTITUCION EDUCATIVA PARTICULAR ACADEMIA NAVAL ALMIRANTE HOWARD','QUITO','PICHINCHA'),(3122,'UNIDAD EDUCATIVA A DISTANCIA DR CAMILO GALLEGOS DOMINGUEZ','MACAS','MORONA SANTIAGO'),(3123,'UNIDAD EDUCATIVA A DISTANCIA DR CAMILO GALLEGOS DOMINGUEZ','MACAS','MORONA SANTIAGO'),(3124,'BACHILLERATO ANEXO A LA RED EDUCATIVA \"CHICAL\"','TULCAN','CARCHI'),(3125,'ANDRES F CORDOVA','QUITO','PICHINCHA'),(3126,'UNIDAD EDUCATIVA NOCTURNO SALAMANCA','QUITO','PICHINCHA'),(3127,'UNIDAD EDUCATIVA PARTICULAR LEV VYGOTSKY','QUITO','PICHINCHA'),(3128,'INSTITUTO TECNOLOGICO SUPERIOR HONORABLE CONSEJO PROVINCIAL DE PICHINCHA','QUITO','PICHINCHA'),(3129,'UNIDAD EDUCATIVA \"JULIO CORTAZAR\"','QUITO','PICHINCHA'),(3130,'UNIDAD EDUCATIVA DEL MILENIO CANCHAGUA','COTOPAXI','LATACUNGA'),(3131,'UNIDAD EDUCATIVA YAGUACHI ','GUAYAQUIL','GUAYAS'),(3132,'UNIDAD EDUCATIVA ANA PAEZ','LATACUNGA','COTOPAXI'),(3133,'UNIDAD EDUCATIVA DEL MILENIO SUMAK YACHANA WASI','IBARRA','IMBABURA'),(3134,'UNIDAD EDUCATIVA VICTORIA VASCONEZ CUVI - SIMON BOLIVAR - ELVIRA ORTEGA','LATACUGA','COTOPAXI'),(3135,'COLEGIO NACIONAL \"AMAZONAS\"','QUITO','PICHINCHA'),(3136,'SEGUN DO TORRES','QUITO','PICHINCHA'),(3137,'INSTITUCION EDUCATIVA LUXEMBURGO','QUITO','PICHINCHA'),(3138,'UNIDAD EDUCATIVA CICALPA','RIOBAMBA','CHIMBORAZO'),(3139,'UNIDAD EDUCATIVA FISCOMISIONAL MONSEÑOR LEONIDAS PROAÑO PCEI','ESMERALDAS ','ESMERALDAS'),(3140,'INSTITUTO TECNOLOGICO MULTILINGUE KURY','RIOBAMBA','CHIBORAZO'),(3141,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ, S.J. IRFEYAL EXTENCION Nª 35 A SOLANDA','QUITO','PICHINCHA'),(3142,'UNIDAD EDUCATIVA PARTICULAR CALASANZ 2','SANTO DOMINGO','SANTO DOMINGO '),(3143,'IRFEYAL - UNIDAD EDUCATIVA \"JOSE MARIA VELAZ, S.J\" EXT. 28','CHONE','MANABI'),(3144,'INSTITUCION EDUCATIVA PCEI GALATAS ','QUITO ','PICHINCHA'),(3145,'CENTRO EDUCATIVO COMUNITARIO INTERCULTURAL BILINGUE MUYU KAWSAY','QUITO ','PICHINCHA'),(3146,'COLEGIO DE BACHILLERATO TECNICO \"RAMON BARBA NARANJO','LATACUNGA','COTOPAXI'),(3147,'UNIDAD EDUCATIVA  FISCAL  NUEVA AURORA','QUITO ','PICHINCHA'),(3148,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE SANTIAGO DE QUITO','CAJABAMBA ','CHIMBORAZO'),(3149,'COLEGIO NACIONAL \"3 DE JULIO\"','QUININDE','ESMERALDAS'),(3150,'COLEGIO NACIONAL CUMBAYA','QUITO','PICHINCHA'),(3151,'UNIDAD EDUCATIVA ALOAG','MEJIA','PICHINCHA'),(3152,'UNIDAD EDUCATIVA  PUERTO  QUITO','QUITO','PICHINCHA'),(3153,'ESCUELA EGB FISCAL BATALLA DE TARQUI','GUAYAQUIL','GUAYAS'),(3154,'UNIDAD EDUCATIVA POPULAR VIDA NUEVA','QUITO','PICHINCHA'),(3155,'UNIDAD EDUCATIVA PARTICULAR PCEI IBEROAMERICANO','QUITO','PICHINCHA'),(3156,'UNIDAD EDUCATIVA PARTICULAR  JOSE MARIA VELAZ, S.J. EXT 30','FLAVIO ALFARO ','MANABI'),(3157,'LA SALLE','BARCELONA ','CATALUÑA'),(3158,'SAN JOSE','QUITO','PICHINCHA'),(3159,'INSTITUCION EDUCATIVA FISCOMISIONAL JUAN PABLO II FE Y ALEGRIA','QUITO','PICHINCHA'),(3160,'UNIDAD EDUCATIVA PCEI ALBERT  EINSTEIN','LA TACUNGA','COTOPAXI'),(3161,'UNIDAD EDUCATIVA PARTICULAR RAFAEL BUCHELI','QUITO','PICHINCHA'),(3162,'UNIDAD EDUCATIVA SEGUNDO TORRES EXTENCION LA MANA','LATACUGA','COTOPAXI'),(3163,'UNIDAD EDUCATIVA FISCAL PCEI 17H00812','QUITO','PICHINCHA'),(3164,'UNIVERSITÀ DEGLI STUDI DI ROMA LA SAPIENZA','ROMA','LAZIO'),(3165,'PADRE MENTHEN','CHIRIBOGA','PICHINCHA'),(3166,'INSTITUTO SUPERIOR TECNOLOGICO DEL TRANSPORTE','QUITO','PICHINCHA'),(3167,'LA INMACULADA','SANGOLQUI','PICHINCHA'),(3168,'INSTITUCION EDUCATIVA \"EL CAMINO\"','RUMIÑAHUI','PICHINCHA'),(3169,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ S.J. IRFEYAL - EXT. 20 SANTA ROSA','SANTA ROSA','EL  ORO'),(3170,'INSTITUTO TECNOLOGICO SUPERIOR BERNARDO O´HIGGINS','QUITO','PICHINCHA'),(3171,'ESCUELA DE EDUCACION BASICA FISCAL ANTONIO NARIÑO ','QUITO','PICHINCHA'),(3172,'UNIDAD EDUCATIVA PARTICULAR PCEI PICHINCHA','QUITO','PICHINCHA'),(3173,'UNIDAD EDUCATIVA ROBERTO RODAS','CAÑAR','AZOGUES'),(3174,'COLEIO FISCOMISIONAL MARIA AUGUSTA URRUTIA DE ESCUDERO FEY ALEGRIA','QUITO','PICHINCHA'),(3175,'U.E. EXPERIMENTAL FISCOMISIONAL A DISTANCIA \"JUAN RAMON JIMENEZ HERRERA\"','LAGO AGRIO','SUCUMBIOS'),(3176,'UNIDAD EDUCATIVA BEST','VINCES','LOS RIOS'),(3177,'UNIDAD EDUCATIVA JACQUES PHILIPPE BINET','QUITO','PICHINCHA'),(3178,'UNIDAD EDUCATIVA LICEO CRISTIANO PENINSULAR','LA LIBERTAD','SANTA ELENA'),(3179,'INSTITUTO TECNOLOGICO SUPERIOR DE FUTBOL DE QUITO','QUITO','PICHINCHA'),(3180,'COLEGIO PARTICULAR LA DOLOROSA','PIMAMPIRO','IMBABURA'),(3181,'UNIDAD EDUCATIVA FISCAL ALFREDO CISNEROS','QUITO','PICHINCHA'),(3182,'UNIDAD EDUCATIVA CARLOS MARIA DE LA CONDAMINE','RIOBAMBA','CHIMBORAZO'),(3183,'UNIDAD  EDUCATIVA FISCOMISIONAL  COMBONI','ESMERALDAS ','ESMERALDAS '),(3184,'COLEGIO PARTICULAR TECNICO VESPERTINO \"10 DE AGOSTO\"','PORTOVIEJO','MANABI'),(3185,'COLEGIO DE BACHILLERATO LIBERTAD','PUYO','TENA'),(3186,'UNIDAD EDUCATIVA PCEI \"ALBERT EINSTEIN\"','LATACUNGA','COTOPAXI'),(3187,'COLEGIO SAN IGNACIO DE LOYOLA','QUITO','PICHINCHA'),(3188,'COLEGIO TECNICO AGROPECUARIO RIO PUCA','MANABI','MANABI'),(3189,'UNIDAD EDUCATIVA FISCAL GARCIA LORCA','QUITO','PICHINCHA'),(3190,'INSTITUCION EDUCATIVA FISCAL \"LUIS NAPOLEON DILLON\"','QUITO','PICHINCHA'),(3191,'UNIDAD EDUCATIVA SAN VICENTE DE PAUL','RIOBAMBA','CHIMBORAZO'),(3192,'COLEGIO TECNICO NARANJAL','NARANJAL','GUAYAS'),(3193,'COLEGIO MIXTO PARTICULAR VIDA NUEVA EN CRISTO','GUAYAS ','GUAYAQUIL'),(3194,'UNIDAD EDUCATIVA LUIS NAPOLEON DILLON','QUITO','PICHINCHA'),(3195,'COLEGIO DE BACHILLERATO PCI EBENCER','QUITO','PICHINCHA'),(3196,'UNIDAD EDUCATIVA JOHANN AMOS COMENIOS','QUITO','PICHINCHA'),(3197,'UNIDAD EDUCATIVA PARTICULAR SAN JOSE LA SALLE','QUITO','PICHINCHA'),(3198,'EL IRFEYAL - UNIDAD EDUCATIVA \"JOSE MARIA VELAZ, S.J.\" EXT. 72-B','HUILLOLOMA','BOLIVAR'),(3199,'UNIDAD EDUCATIVA DR. MANUEL RODRIGUEZ ROZCO ','QUITO ','PICHINCHA'),(3200,'UNIDAD EDUCATIVA PARTICULAR PCEI CENTEBAD','QUITO','PICHINCHA'),(3201,'UNIVERSIDAD POLITECNICA ESTATAL DEL CARCHI','TULCAN','CARCHI'),(3202,'UNIDAD EDUCATIVA FISCOMISIONAL \"JOSE MARIA VELAZ, S.J.\" EXT. 35 DE MACHALA','MACHALA','EL  ORO'),(3203,'UNIDAD EDUCATIVA CARLOS COCHA TORRES','ESMERALDAS ','ESMERALDAS'),(3204,'UNIDAD EDUCATIVA \"TUMBACO\"','QUITO','PICHINCHA'),(3205,'LUIS ULPIANO DE LA TORRE','QUITO','PICHINCHA'),(3206,' INSTITUCION EDUCATIVA FISCAL QUITO','QUITO','PICHINCHA'),(3207,'UNIDAD EDUCATIVA COMUNITARIA JOSE VICENTE RIVADENEIRA','TIWINZA','MORONA SANTIAGO'),(3208,'INSTITUCION EDUCATIVA \"LUCILA SANTOS DE AROSEMENA\"','QUITO','PICHINCHA'),(3209,'UNIDAD EDUCATIVA GRAL. LEONIDAS PLAZA GUTIERREZ','LATACUNGA','COTOPAXI'),(3210,'COLEGIO NACIONAL LIBERTAD','TULCAN','CARCHI'),(3211,'DIEZ DE AGOSTO','QUITO','PICHINCHA'),(3212,'UNIDAD EDUCATIVA HORTENSIA VASQUEZ SALVADOR','SANTO DOMINGO','STO. DGO DE LOS TSACHILAS'),(3213,'COLEGIO DE BACHILLERATO TECNICO FISCAL CONDORAZO','RIOBAMBA','CHIMBORAZO'),(3214,'INSTITUTO TECNICO SUPERIOR MARIANO SAMANIEGO','CARIAMANGA ','LOJA'),(3215,'TOHALLI','MANTA','MANABI'),(3216,'INSTITUCION EDUCATIVA PISULI','QUITO','PICHINCHA'),(3217,'UNIDAD EDUCATIVA PRIVADA \"SAGRADO CORAZON DE JESUS\"','VENEZUELA','VENEZUELA'),(3218,'UNIDAD EDUCATIVA \"QUININDE\"','QUININDE','ESMERALDAS'),(3219,'INSTITUTO NACIONAL \"MEJIA\" MATUTINA','QUITO','PICHINCHA'),(3220,'INSTITUCION EDUCATIVA HERMANO MIGUEL FEBRES CORDERO','QUITO','PICHINCHA'),(3221,'UNIDAD EDUCATIVA PARTICULAR PCEI SECOMSYS','QUITO','PICHINCHA'),(3222,'UNIDAD EDUCATIVA FISCAL ALANGASI','QUITO','PICHINCHA'),(3223,'INSTITUCION EDUCATIVA MONSESOR LEONIDAS PROAÑO VILLALBA','SAN MIGUEL','BOLIVAR'),(3224,'UNIDAD EDUCATIVA \"MADRE MARIA BERENICE\"','QUITO','PICHINCHA'),(3225,'UNIVERSIDAD SAN FRASNCISCO DE QUITO','QUITO','PICHINCHA'),(3226,'UNIVERSIDAD SAN FRANCISCO DE QUITO','QUITO','PICHINCHA'),(3227,'UNIDAD EDUCATIVA FISCAL ALONSO DE ILLESCAS','GUAYAS ','GUAYAQUIL'),(3228,'UNIDAD EDUCATIVA SAN JOSE DE GUAYTACAMA','LATACUNGA','COTOPAXI'),(3229,'UNIDAD EDUCATIVA PUSIR GRANDE ','BOLIVAR','CARCHI'),(3230,'COLEGIO A DISTANCIA NUEVO ECUADOR','QUITO','PICHINCHA'),(3231,'COLEGIO JOSE OTILIO RAMIREZ REINA','SAN LORENZO','ESMERALDAS'),(3232,'UNIDAD EDUCATIVA FISCAL FABRIZIO BUCCO BOZZOLO','DURAN','GUAYAS'),(3233,'UNIDAD EDUCATIVA SALINAS SIGLO XXI','SALINAS','SANTA ELENA'),(3234,'UNIDAD EDUCATIVA A DISTANCIA SAN MIGUEL DE SALCEDO','SALCEDO','LATACUNGA'),(3235,'UNIDAD EDUCATIVA DR. JOSE MARIA VELASCO IBARRA','LATACUNGA','COTOPAXI'),(3236,'UNIDAD EDUCATIVA PRIMERO DE MAYO','YANZATZA ','ZAMORA CHINCHIPE'),(3237,'UNIDAD EDUCATIVA JUNTA NUEVA','BABAHOYO','LOS RIOS'),(3238,'UNIDAD EDUCATIVA FISCAL DURAN','DURAN','GUAYAS'),(3239,'UNIDAD EDUCATIVA FISCAL \"QUITO SUR\"','QUITO','PICHINCHA'),(3240,'UNIDAD EDUCATUVA PARTICULAR CALASANZ 2','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(3241,'UNIDAD EDUCATIVA A DISTANCIA \"VIEJO LUCHADOR\"','IBARRA','IMBABURA'),(3242,'INSTITUCION EDUCATIVA PARTICULAR PEDRO VICENTE MALDONADO','QUITO','PICHINCHA'),(3243,'UNIDAD EDUCATIVA FISCAL GENERAL PINTAG','QUITO','PICHINCHA'),(3244,'GONZALO ESCUDERO','QUITO','PICHINCHA'),(3245,'UNIDAD EDUCATIVA PARTICULAR PCEI \"NUEVO ECUADOR\"','QUITO','PICHINCHA'),(3246,'UNIDAD EDUCATIVA INTERCULTURAL BILINGÜE DON BOSCO','PUJILI','COTOPAXI'),(3247,'UNIDAD EDUCATIVA TOMAS MARTINEZ','AMBATO ','TUNGURAHUA'),(3248,'UNIDAD EDUCATIVA PCEI MONSEÑOR LEONIDAS PROAÑO	','ZUMBAHUA','COTOPAXI'),(3249,'ESCUELA DE EDUCACION BASICA FISCAL ANTONIO NARIÑO','QUITO','PICHINCHA'),(3250,'UNIDAD EDUCATIVA PARTICULAR PCEI \" COMPUINFORMATICA\"','QUITO','PICHINCHA'),(3251,'COLEGIO PARTICULAR MIXTO \"FEDERICO GONZALEZ SUAREZ\"','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(3252,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE \"EL CHAQUIÑAN\"','LATACUNGA','COTOPAXI'),(3253,'UNIDAD EDUCATIVA FISCAL SAN FRANCISCO DE QUITO','QUITO','PICHINCHA'),(3254,'UNIDAD EDUCATIVA ALEJANDRO ANDRADE COELLO','QUITO','PICHINCHA'),(3255,'INSTITUTO SUPERIOR TECNOLOGICO SUPERIOR VICENTE LEON','LATACUNGA','COTOPAXI'),(3256,'UNIDAD EDUCATIVA FISCAL TARQUI','QUITO','PICHINCHA'),(3257,'COLEGIO FISCAL MIXTO \"AGRO-ECOLOGICO LA PALMA\"','GUARANDA','BOLIVAR'),(3258,'COLEGIO POPULAR PARTICULAR A DISTANCIA \"VIDA NUEVA\"','QUITO','PICHINCHA'),(3259,'UNIDAD EDUCATIVA FILADELFIA','QUITO','PICHINCHA'),(3260,'COLEGIO TECNICO TARQUI','QUITO','PICHINCHA'),(3261,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE SAN JUAN BOSCO','GUARANDA','BOLIVAR'),(3262,'UNIDAD EDUCATIVA A DISTANCIA \"MONSEÑOR LEONIDAS PROAÑO\" EXTENCION TINGO LA ESPERANZA','LA ESPERANZA','COTOPAXI'),(3263,'COLEGIO DE BACHILLERATO ABDON CALDERON MUÑOZ','LOJA','LOJA'),(3264,'COLEGIO TECNICO POPULAR PARTICULAR \"VIDA NUEVA\"','QUITO','PICHINCHA'),(3265,'UNIDAD EDUCATIVA FISCOMISIONAL \"JOSE MARIA VELAZ, S.J.\" EXT. 61-A SANGOLQUI','QUITO','PICHINCHA'),(3266,'UNIDAD EDUCATIVA MUNICIPAL \"JULIO E. MOREO\"','QUITO','PICHINCHA'),(3267,'UNIDAD EDUCATIVA MUNICIPAL \"JULIO E. MORENO\"','QUITO','PICHINCHA'),(3268,'UNIDAD EDUCATIVA MUNICIPAL \"JULIO E. MORENO','QUITO','PICHINCHA'),(3269,'INSTITUCION EDUCATIVA FISCAL MIGUEL DE SANTIAGO','QUITO','PICHINCHA'),(3270,'UNIDAD EDUCATIVA \"SAN FELIPE NERI\"','RIOBAMBA','CHIMBORAZO'),(3271,'UNIDAD EDUCATIVA JOHN WYCLIFFE','QUITO','PICHINCHA'),(3272,'UNIDAD EDUCATIVA JUAN FRANCISCO YEROVI','ALAUSI','CHIMBORAZO'),(3273,'INSTITUTO SUPERIOR TECNOLOGICO SUDAMERICANO ','QUITO','PICHINCHA'),(3274,'UNIDAD EDUCATIVA PARTICULAR PCEI OCTAVIO PAZ','QUITO','PICHINCHA'),(3275,'COLEGIO PARTICULAR DR. CAMILO PONCE ENRIQUEZ','ESMERALDAS ','ESMERALDAS'),(3276,'UNIDAD EDUCATIVA MUNICIPAL SEBASTIAN DE BENALCAZAR','QUITO','PICHINCHA'),(3277,'INSTITUCION EDUCATIVA FISCAL ANDRES F. CORDOVA','QUITO','PICHINCHA'),(3278,'UNIDADA EDUCATIVA EL CARMELO','TULCAN','CARCHI'),(3279,'UNIDAD EDUCATIVA PARTICULAR PCEI CASA DE LA CULTURA ECUATORIANA','QUITO','PICHINCHA'),(3280,'COLEGIO PARTICULAR MADRE DE LA DIVINA GRACIA','RUMIÑAHUI','PICHINCHA'),(3281,'COLEGIO NACIONAL TECNICO \"FLAVIO ALFARO\"','FLAVIO ALFARO ','MANABI'),(3282,'COLEGIO FISCOMISIONAL TECNICO AGROPECUARIO \"STA. MARIA DE LOS CAYAPAS\"','ESMERALDAS ','ESMERALDAS'),(3283,'UNIVERSIDAD IBEROAMERICANA DEL ECUADOR','QUITO','PICHINCHA'),(3284,'COLEGIO PARTICULAR MAX PLANK','QUITO','PICHINCHA'),(3285,'UNIDAD EDUCATIVA 17 DE JULIO','IBARRA','IMBABURA'),(3286,'U.E.C.I.B. GUARDIANA DE LA LENGUA Y DE LOS SABERES MUSHUK PAKARI','QUITO','PICHINCHA'),(3287,'UNIDAD EDUCATIVA FISCOMISIONAL SAN DANIEL COMBONI','ESMERALDAS ','ESMERALDAS'),(3288,'TECNICO DON BOSCO','QUITO','PICHINCHA'),(3289,'COLEGIO PARTICULAR SAN JUAN BOSCO','QUITO','PICHINCHA'),(3290,'COLEGIO DE BACHILLERATO FISCAL LUIS TELLO','ESMERALDAS ','ESMERALDAS'),(3291,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGÜE CIENCIA Y BIBLIA','GUARANDA','BOLIVAR'),(3292,'COLEGIO NACIONAL EXPERIMENTAL TECNICO GUAYAQUIL','AMBATO ','TUNGURAHUA'),(3293,'UNIDAD EDUCATIVA DEL MILENIO INTERCULTURAL BILINGUE CHIBULEO','AMBATO ','TUNGURAHUA'),(3294,'UNIDAD EDUCATIVA FISCAL SEC','SAN CRISTOBAL','GALAPAGOS '),(3295,'UNIDAD EDUCATIVA JOHN OSTEEN','QUITO','PICHINCHA'),(3296,'UNIVERSIDAD ALFREDO PEREZ GUERRERO','QUITO','PICHINCHA'),(3297,'IGNACIO HERNANDEZ','PUERTO BAQUERIZO MORENO ','GALAPAGOS '),(3298,'UNIDAD EDUCATIVA RAMBUCHE','CHONE','MANABI'),(3299,'UNIDAD EDUCATIVA PCEI PARTICULAR SULTANA DEL ORIENTE','MACAS','MORONA SANTIAGO'),(3300,'SANTA MARIA EUFRACIA','QUITO','PICHINCHA'),(3301,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGÜE \"KANAMBU\"','CHONTAPUNTA','NAPO'),(3302,'UNIDAD EDUCATIVA PARTICULAR SAN ANDRES QUITUMBE','QUITO','PICHINCHA'),(3303,'INSTITUCION EDUCATIVA EMILE JAQUES DALCROZE','QUITO','PICHINCHA'),(3304,'TUNGURAHUA','BAÑOS','TUNGURAHUA'),(3305,'INSTITUCION EDUCATIVA FISCAL JORGE ICAZA','QUITO','PICHINCHA'),(3306,'JUAN RAMON JIMENEZ HERRERA EXTENSION Y DE TIPISHCA','LAGO AGRIO','SUCUMBIOS'),(3307,'UNIDAD EDUCATIVA PEDRO JOSE ARTETA','QUITO','PICHINCHA'),(3308,'UNIDAD EDUCATIVA HUMBERTO MATA MARTINEZ','QUITO','PICHINCHA'),(3309,'UNIDAD EDUCATIVA RAYMUNDO AVEIGA MOREIRA','MANTA','MANABI'),(3310,'COLEGIO DE BACHILLERATO PCEI AMERICA','AMBATO ','TUNGURAHUA'),(3311,'COLEGIO PARTICULAR MIXTO NOCTURNO','RIOBAMBA','CHIMBORAZO'),(3312,'MEXICO 29','QUITO','PICHINCHA'),(3313,'UNIDAD EDUCATIVA JORGE ICAZA','LATACUNGA','COTOPAXI'),(3314,'UNIDAD EDUCATIVA TRES DE DICEIMBRE','PICHINCHA ','CHECA'),(3315,'UNIDAD EDUCATIVA PARTICULAR CENTEBAD','LAGO AGRIO','SUCUMBIOS'),(3316,'UNIDAD EDUCATIVA CEPE','QUITO','PICHINCHA'),(3317,'INSTITUCION EDUCATIVA BUENA VENTURA','QUITO','PICHINCHA'),(3318,'UNIDAD EDUCATIVA PALMAR','SANTA ELENA ','SANTA ELENA'),(3319,'UNIDAD EDUCATIVA FISCAL BRETHREN','QUITO','PICHINCHA'),(3320,'UNIDAD EDUCATIVA PRIMERO DE ABRIL','RIOBAMBA','CHIMBORAZO'),(3321,'UNIDAD EDUCATIVA DEL MILENIO \"PEDRO AGUSTIN LOPEZ RAMOS\"','MANABI','MANABI'),(3322,'UNIDAD EDUCATIVA SANTA ANA DE COTACACHI','LAS GOLONDRINAS','IMBABURA'),(3323,'COLEGIO DE ARTES FREDERIK ASHTON','QUITO','PICHINCHA'),(3324,'LICEO CRISTIANO ELOHIM','QUITO','PICHINCHA'),(3325,'UNIDAD EDUCATIVA DEL MILENIO JOSE DE SAN MARTIN','VENTANAS','LOS RIOS'),(3326,'UNIDAD EDUCATIVA ATAHUALPA','IBARRA','IMBABURA'),(3327,'VICTOR EMILIO ESTRADA','QUITO','PICHINCHA'),(3328,'UNIDAD EDUCATIVA FISCOMISIONAL DON BOSCO','QUITO','PICHINCHA'),(3329,'COLEGIO PARTICULAR  INSTITUTO TECNICO ECUATORIANO COREANO','SANTO DOMINGO DE LOS TSACHILAS','SANTO DOMINGO DE LOS TSACHILAS'),(3330,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE MONSEÑOR LEONIDAS PROAÑO','COLTA','CHIMBORAZO'),(3331,'UNIDAD EDUCATIVA CARLOS VELEZ VERDUGA','EL CARMEN ','MANABI'),(3332,'UNIDAD EDUCATIVA FISCAL BENJAMIN CARRION','QUITO','PICHINCHA'),(3333,'COLEGIO EXPERIMENTAL \"JUAN PIO MONTUFAR\" NOCTURNO','QUITO','PICHINCHA'),(3334,'UNIDAD EDUCATIVA A DISTANCIA DE COTOPAXI EXTENSION PUJILI','PUJILI','COTOPAXI'),(3335,'LICEO IBEROAMERICANO','QUITO','PICHINCHA'),(3336,'UNIDAD EDUCATIVA PARTICULAR  LICEO ECUATORIANO','QUITO','PICHINCHA'),(3337,'INSTITUCION EDUCATIVA FISCAL ANDRES F. CORDOVA','QUITO','PICHINCHA'),(3338,'INSTITUCION EDUCATIVA FISCAL ANDRES F. CORDOVA','QUITO','PICHINCHA'),(3339,'UNIDAD EDUCATIVA TEMPORAL LUIS ULPIANO DE LA TORRE','COTACACHI','IMBABURA'),(3340,'UNIDAD EDUCATIVA LOS ANDES','BOLIVAR','CARCHI'),(3341,'SIMON BOLIVAR COL','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(3342,'UNIDAD EDUCATIVA LA BELLEZA','EL COCA','ORELLANA'),(3343,'UNIDAD EDUCATIVA ISAAC JESUS BARRERA','OTAVALO','IMBABURA'),(3344,'UNIDAD EDUCATIVA MUNICIPAL SUCRE','QUITO','PICHINCHA'),(3345,'UNIDAD EDUCATIVA FISCAL \"TUMBACO\"','QUITO','PICHINCHA'),(3346,'UNIDAD EDUCATIVA FISCAL ING JUAN SUAREZ CHACON','QUITO','PICHINCHA'),(3347,'INSTITUTO TECNICO SUPERIOR PARTICULAR PEDRO FARIAS CARRASCO','AMBATO ','TUNGURAHUA'),(3348,'UNIDAD EDUCATIVA FISCAL \"EUGENIO ESPEJO\"','QUITO','PICHINCHA'),(3349,'UNIDAD EDUCATIVA PCEI \"ANGEL POLIBIO CORDOVA SANTANDER\"','QUITO','PICHINCHA'),(3350,'COLEGIO DE BACHILLERATO PCEI EBENEZER','RIOBAMBA','CHIMBORAZO'),(3351,'UNIDAD EDUCATIVA CHAMANGA','MUISNE','ESMERALDAS'),(3352,'UNIDAD EDUCATIVA DEL MILENIO \"JACINTO JIJON Y CAAMAÑO\"','RUMIÑAHUI','PICHINCHA'),(3353,'UNIDAD EDUCATIVA CIUDAD DE IBARRA','JOYA DE LOS SACHAS','ORELLANA'),(3354,'UNIDAD EDUCATIVA DEL MILENIO BERNARDO VALDIVIESO','LOJA','LOJA'),(3355,'UNIDAD EDUCATIVA DEL MILENIO DR CARLOS ROMO DAVILA','FLAVIO ALFARO ','MANABI'),(3356,'UNIDAD EDUCATIVA PCEI EVEREST','RIOBAMBA','CHIMBORAZO'),(3357,'COLEGIO PARTICULAR \"NUESTRA SEÑORA DEL ROSARIO\"','QUITO','PICHINCHA'),(3358,'COLEGIO PCEI 14 DE OCTUBRE','PUJILI','COTOPAXI'),(3359,'UNIDAD EDUCATIVA DR. LEONIDAS GARCIA ORTIZ','PASAJE ','EL  ORO'),(3360,'COLEGIO DE BACHILLERATO \"MOISES OLIVA\"','CALVAS ','LOJA'),(3361,'UNIDAD EDUCATIVA JOSE MARIA VARGAS','QUITO','PICHINCHA'),(3362,'INSTITUTO SUPERIOR TECNOLOGICO G\'SSOT','RUMIÑAHUI','PICHINCHA'),(3363,'UNIDAD EDUCATIVA SAN JUAN BAUTISTA DE LA SALLE','SHUSHUFINDI','SUCUMBIOS'),(3364,'INSTITUCION EDUCATIVA ROBERT ALDRICH','QUITO','PICHINCHA'),(3365,'COLEGIO TECNICO POPULAR PARTICULAR DE LAS AMERICAS - QUITUMBE','QUITO','PICHINCHA'),(3366,'UNIDAD EDUCATIVA CIUDAD DE GUARANDA','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO '),(3367,'INSTITUCION EDUCATIVA ROBERTO ARREGUI MOSCOSO','QUITO','PICHINCHA'),(3368,'UNIDAD EDUCATIVA MANUEL ABAD','QUITO','PICHINCHA'),(3369,'COLEGIO FISCAL TECNICO MIXTO UBILLÚS','QUITO','PICHINCHA'),(3370,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE COCHAPAMBA','SAQUISILI','COTOPAXI'),(3371,'ESCUELA DE EDUCACION BASICA PCEI 18 DE OCTUBRE','COTOPAXI','SAQUISILI'),(3372,'UNIDAD EDUCATIVA RAMON PAEZ','LATACUNGA','COTOPAXI'),(3373,'FRANCISO JAVIER PEÑARRETA','SHUSHUFINDI','SUCUMBIOS'),(3374,'UNIDAD EDUCATIVA JOSE MARIA VELAZ IRFEYAL','ESMERALDAS ','ESMERALDAS'),(3375,'UNIDAD EDUCATIVA CIUDAD DE CARACAS','SANTO DOMINGO','SANTO DOMINGO '),(3376,'COLEGIO FISCAL MIXTO \"AGOYAN\"','JOYA DE LOS SACHAS','ORELLANA'),(3377,'INSTITUCION EDUCATIVA LUIS G. TUFIÑO','QUITO','PICHINCHA'),(3378,'UNIDAD EDUCATIVA BATALLA DE PICHINCHA','ESMERALDAS ','ESMERALDAS'),(3379,'UNIDAD EDUCATIVA  SIBAMBE','ALAUSI','CHIMBORAZO'),(3380,'COLLEGIO DE BACHILLERATO FISCAL VALLE DEL SADE','ESMERALDAS ','ESMERALDAS'),(3381,'U.E. ISABEL LA CATOLICA','SANTIAGO DE  PILLARO','TUNGURAHUA'),(3382,'CARDENAL GONZALEZ ZUMARRAGA','QUITO','PICHICHA'),(3383,'PROVINCIA DE COTOPAXI','GUAYAQUIL','GUAYAS'),(3384,'UNIVERSIDAD DE LAS FUERZAS ARMADAS (ESPE)','LATACUGA','COTOPAXI'),(3385,'UNIDAD EDUCATIVA COCHASQUI','TABACUNDO','PICHINCHA'),(3386,'COLEGIO NACIONAL ANGEL POLIBIO CHAVES','SAN MIGUEL','BOLIVAR'),(3387,'UNIDAD EDUCATIVA FISCOMISIONAL MARIA AUXILIADORA','ESMERALDAS ','ESMERALDAS'),(3388,'INSTITUTO EDUCATIVA MUNICIPAL JUAN WISNETH ','PICHINCHA ','QUITO'),(3389,'UNIDAD EDUCATIVA REGULO DE MORA ','BOLIVAR','SAN MIGUEL'),(3390,'UNIDAD EDUCATIVA FISCAL \"TUMBACO\"','PICHINCHA ','QUITO'),(3391,'U.E.C.INTERCULTURAL BILINGÜE AMAWTA FERNANDO DAQUILEMA','CHIMBORAZO','GUAMOTE'),(3392,'DON BOSCO','MACAS','MACAS'),(3393,'COLEGIO FISCOMICINAL DON BOSCO','MACAS','MACAS'),(3394,'COLEGIO MIXTO PARTICULAR DR. MANUEL DE J. REAL MURILLO','GUAYAQUIL','EL  GUAYAS'),(3395,'UNIDAD EDUCATIVA FISCOMISIONAL VIRGEN DEL CONSUELO','QUITO','PICHINCHA'),(3396,'COLEGIO NACIONAL CALUMA ','CALUMA','BOLIVAR'),(3397,'UNIDAD EDUCATIVA RAFAEL VASCONEZ GOMEZ','LA MANA ','COTOPAXI'),(3398,'UNIDAD EDUCATIVA POALO - GARCIA MORENO ','LATACUNGA','COTOPAXI'),(3399,'UNIDAD EDUCATIVA 15 DE DICIEMBRE','QUITO','PICHICHA'),(3400,'ESCUELA POLITECNICA DEL EJERCITO','LATACUNGA','LATACUNGA'),(3401,'UNIDAD EDUCATIVA DEL MILENIO \"CELICA\"  ','LOJA ','LOJA '),(3402,'COLEGIO DE BACHILLERATO PINDAL','LOJA','LOJA'),(3403,'INSTITUTO TEC.SUP Y TECNOLOGICO BABAHOYO','BABAHOYO','LOS RIOS'),(3404,'UNIDAD EDUCATIVA PARTICULAR FRANCISCO FEBRES CORDERO-LA SALLE','PICHINCHA ','QUITO'),(3405,'COLEGIO NACIONAL TECNICO DR. M. BENJAMIN CARRION MORA','QUITO','PICHINCHA'),(3406,'UNIDAD EDUCATIVA FISCAL FEDERICO GARCIA LORCA','QUITO','PICHINCHA'),(3407,'UNIDAD EDUCATIVA PCEI DR. \"GABRIEL PAZMIÑO ARMIJOS\"','GUARANDA','BOLIVAR'),(3408,'UNIDAD EDUCATIVA FISCOMISIONAL  JUAN XXIII','ESMERALDAS ','ESMERALDAS'),(3409,'UNIDAD EDUCATIVA VEINTICUATRO DE MAYO','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(3410,'COLEGIO DE BACHILLERATO KEPLER REYNA BARONA','ESMERALDAS ','ESMERALDAS'),(3411,'COLEGIO PARTICULAR ECOLOGICO INTERNACIONAL','LAGO AGRIO','SUCUMBIOS '),(3412,'UNIDAD EDUCATIVA DEL MILENIO BOSCO WISUMA','MORONA SANTIAGO','MORONA SANTIAGO'),(3413,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL SURUPUCYO','BOLIVAR','GUARANDA '),(3414,'ISTITUTO SUPERIOR TECNOLOGICO \"HONORABLE CONSEJO PROVINCIAL DE PICHINCHA\"','QUITO','PICHICHA'),(3415,'UNIDAD EDUCATIVA A DISTANCIA DE IMBABURA (UNEDI)','IBARRA','IMBABURA'),(3416,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ S.J. IRFEYAL - EXT. 61-A-SANGOLQUI','QUITO','PICHINCHA'),(3417,'FRAY BARTOLOME DE LAS CASAS SALASACA','PELILEO ','TUGURAHUA'),(3418,'UNIDAD EDUCATIVA FEDERACION DEPORTIVA DE COTOPAXI','LA MANA ','COTOPAXI'),(3419,'UNIDAD EDUCATIVA AMAZONAS','CHONE','MANABI'),(3420,'COLEGIO BLAS PASCAL','QUITO','PICHICHA'),(3421,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE 16 DE NOVIEMBRE','RIOBAMBA','CHIBORAZO'),(3422,'UNIDAD EDUCATIVA TNTE. CORONEL JOHN MERINO BARRENO','COLTA','CHIMBORAZO'),(3423,'UNIDAD EDUCATIVA \"EL COSMOPOLITA JUAN MONTALVO\"','SIGCHOS ','COTOPAXI'),(3424,'OTRO','QUITO','PICHINCHA'),(3425,'UNIDAD EDUCATIVA JOSÈ GABRIEL BATALLAS','SAN LORENZO','ESMERALDAS'),(3426,'UNIDAD EDUCATIVA GALO VELA ALVAREZ ','QUITO','PICHICHA'),(3427,'UNIDAD EDUCATIVA DR. CARLOS FERNANDO ALOMOTO AYALA','SAN MIGUEL DE LOS BANCOS','PICHICHA'),(3428,'INSTITUCION EDUCATIVA PARTICULAR LATINOAMAERICANO','QUITO','PICHINCHA'),(3429,'INSTITUCION EDUCATIVA FISCOMISIONL MARIA NAZARET','QUITO','PICHINCHA'),(3430,'UNIDAD EDUCATIVA FISCAL LA FORESTAL','QUITO','PICHINCHA'),(3431,'PICHIINCHA','MANTA','MANABI'),(3432,'PICHINCHA','MANTA','MANABI'),(3433,'UNIDAD EDUCATIVA PCEI \"PRIMERO DE MAYO\"','QUITO','PICHINCHA'),(3434,'COLEGIO PARTICULAR HENRY FORD','EL EMPALME','GUAYAS'),(3435,'UNIDAD EDUCATIVA BENJAMIN ARAUJO','AMBATO ','TUGURAHUA'),(3436,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGÜE CHONE','PUJILI','COTOPAXI'),(3437,'UNIDAD EDUCATIVA PARTICULAR SAGRADA FAMILIA DE NAZARET','QUININDE','ESMERALDAS'),(3438,'UNIDAD EDUCATIVA PCEI BOLIVARIANO','LATACUNGA','COTOPAXI'),(3439,'UNIDAD EDUCATIVA DEL MILENIO DAYUMA KENTO','LA JOYA DE SACHAS','ORELLANA'),(3440,'CUEST T.V','QUITO','PICHICHA'),(3441,'UNIDAD EDUCATIVA LUZ DE AMERICA','STO DOMINGO','STO DOMINGO DE LOS COLORADOS'),(3442,'UNIDAD EDUCATIVA MANUEL CORDOVA GALARZA','VENTANAS','LOS   RIOS '),(3443,'COLEGIO REMIGIO TAMARIZ  CRESPO','CUENCA ','AZUAY '),(3444,'UNIDAD EDUCATIVA \"CENTRAL TECNICO\"','QUITO','PICHINCHA'),(3445,'UNIDAD EDUCATIVA \"LUIS FELIPE BORJA\"','MACHACHI','PICHINCHA'),(3446,'UNIDAD EDUCATIVA FISCOMISIONAL \"JOSE MARIA VELAZ. S.J\" N°62','CUENCA ','AZUAY '),(3447,'UNIDAD EDUCATIVA NUESTRA SEÑORA DE POMPEYA','LATACUGA','COTOPAXI'),(3448,'PALMAR DEL BIMBE','SANTO DOMINGO DE LOS TSACHILAS','SANTO DOMINGO DE LOS TSACHILAS'),(3449,'COLEGIO PARTICULAR JIM IRWIM','QUITO','PICHINCHA'),(3450,'UNIDAD EDUCATIVA FISCOMISIONAL JUAN PABLO BAUTISTA STIEHLE','CUENCA ','AZUAY '),(3451,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE \"LA PAZ\" CDC SANTA MARIA','ELOY ALFARO','ESMERALDAS'),(3452,'UNIDAD EDUCATIVA PRESIDENTE TAMAYO','EL COCA','ORELLANA'),(3453,'UNIDAD EDUCATIVA PCEI MONSEÑOR LEONIDAS PROAÑO','CALUMA','BOLIVAR'),(3454,'UNIDAD EDUCATIVA PCEI MONSEÑOR LEONIDAS PROAÑO CALUMA','CALUMA','BOLIVAR'),(3455,'UNIDAD EDUCATIVA FISCAL REPLICA TECNICO SIMON BOLIVAR','GUAYAQUIL','GUAYAS'),(3456,'UNIDAD EDUCATIVA PARTICULAR MARISCAL SUCRE','LAGO AGRIO','SUCUMBIOS'),(3457,'COLEGIO NACIONAL \"LAUTARO ASPIAZU SEDEÑO\"','PALENQUE ','LOS RIOS'),(3458,'MATILDE ALVAREZ','QUITO','PICHINCHA'),(3459,'UNIDAD EDUCATIVA FISCOMISIONAL JOSE MARIA VELAZ, S.J - IRFEYAL - MATRIZ','QUITO','PICHINCHA'),(3460,'UNIDAD EDUCATIVA GEORGE MASON','RUMIÑAHUI','PICHINCHA'),(3461,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE PADRE JUA DE VELASCO','CAYAMBE','PICHINCA'),(3462,'UNIDAD EDUCATIVA BACHILLERO','TOSAGUA','MANABI'),(3463,'UNIDAD EDUCATIVA FELIX VALENCIA','MULALO','COTOPAXI'),(3464,'CORPORACIÓN EDUCATIVA INTEGRAL \"JHYRÉ\"','QUITO','PICHINCHA'),(3465,'UNIDAD EDUCATIVA INTERCULTURAL BILINGÜE \"INTI CHURI\"','GUARANDA','BOLIVAR'),(3466,'COLEGIO DE BACHILLERATO NOCTURNO FISCAL 21 DE NOVIEMBRE','ATACAMES','ESMERALDAS'),(3467,'UNIDAD EDUCATIVA HOPE CHRISTIAN ACADEMY','CAYAMBE','CAYAMBE'),(3468,'UNIDAD EDUCATIVA DELIA IBARRA DE VELASCO','PUJILI','COTOPAXI'),(3469,'UNIDAD EDUCATIVA MARIA INMACULADA - JOAQUIN TURINA','MADRID','MADRID'),(3470,'UNIDAD EDUCATIVA PARTICULAR SAINT DOMINIC SCHOOL','QUITO','PICHINCHA'),(3471,'CORPORACION EDUCATIVA INTEGRAL JHYRE','QUITO','PICHINCHA'),(3472,'UNIDAD EDUCATIVA DEL MILENIO CASIQUE TUMBALA','LATACUNGA','COTOPAXI'),(3473,'UNIDAD EDUVATIVA 6 DE OCTUBRE','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(3474,'UNIDAD EDUCATIVA \"BOLIVAR\"','TULCAN','CARCHI'),(3475,'UNIDAD EDUCATIVA ISLA DE BEJUCAL','LOS RIOS','BABAHOYO'),(3476,'INSTITUCION EDUCATIVA \"JUAN XXIII \"','PUERRES','NARIÑO'),(3477,'UNIDAD EDUCATIVA 16 DE OCTUBRE','ESMERALDAS ','ESMERALDAS'),(3478,'UNIDAD EDUCATIVA \"RICARDO CORNEJO NARANJO\"','SANTO DOMINGO','SANTO DOMINGO DE LOS COLORADOS'),(3479,'UNIDAD EDUCATIVA IBARRA','IBARRA','IMBABURA'),(3480,'UNIDAD EDUCATIVA LUIS TUFIÑO ','QUITO ','PICHINCHA'),(3481,'UNIDAD EDUCATIVA \"JULIO PIMENTEL CARBO\"','GAYAQUIL','GUAYAS'),(3482,'UNIDAD EDUCATIVA JUAN MONTALVO','CUENCA ','AZUAY '),(3483,'COLEGIO DE BACHILLERATO PCEI \" TIERRA NUEVA\"','IBARRA','IMBABURA'),(3484,'UNIDAD EDUCATIVA PCEI INTERNATIONAL BRITANICO SCHOOL','LATACUGA','COTOPAXI'),(3485,'UNIDAD EDUCATIVAPARTICULAR EMAUS DE FE Y ALEGRIA','QUITO','PICHICHA'),(3486,'UNIDAD EDUCATIVA FISCOMISIONAL BERNABE DE LARRAUL','SAN MIGUEL DE LOS BANCOS','PICHINCHA'),(3487,'UNIDAD EDUCATIVA FISCOMISIONAL \"SAN JOSE\"','QUITO','PICHICHA'),(3488,'UNIDAD EDUCATIVA DR. WENCESLAO PAREJA','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(3489,'UNIDAD EDUCATIVA PARTICULAR COREL','CUENCA ','AZUAY '),(3490,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGÜE COCISA','GUAMOTE','CHIMBORAZO'),(3491,'UNIDAD EDUCATIVA TEMPORAL GABRIEL ARSENIO ULLAURI','CUENCA ','AZUAY '),(3492,'UNIDAD EDUCATIVA PCEI PARTICULAR PROMOCIÓN SOCIAL INTEGRAL DEL AUSTRO','PAUTE','AZUAY '),(3493,'UNIDAD EDUCATIVA JORGE CARRERA ANDRADE','GUAYAS ','GUAYAQUIL'),(3494,'UNIDAD EDUCATIVA FISCOMISIONAL PCEI JUAN RAMON JIMENEZ HERRERA EXTENSIÓN PROGRESO Y LIBERTAD','CUYABENO','SUCUMBIOS'),(3495,'UNIDAD EDUCATIVA HARRIET BEECHER STOWE','PUEMBO','PICHINCHA'),(3496,'COLEGIO FISCAL TECNICO \"AMARILIS FUENTES ALCIVAR\"','GUAYAQUIL','GUAYAS'),(3497,'UNIDAD EDUCATIVA PARTICULAR LEON COOPER','QUITO','PICHINCHA'),(3498,'UNIDAD EDUCATIVA \"NUESTRA SEÑORA DE POMPEYA\"','PUYO','PASTAZA'),(3499,'HIGH SCHOOL SANTA MARIA','QUITO','PICHINCHA'),(3500,'INSTITUTO SUPERIOR TECNOLOGICO JOSE CHIRIBOGA GRIJALVA','OTAVALO','IMBABURA'),(3501,'COLEGIO NACIONAL \" SAN PEDRO DE VILCABAMBA\"','LOJA','LOJA'),(3502,'COLEGIO TECNICO \"NARCISA DE JESUS\"','ORELLANA','ORELLANA'),(3503,'UNIDAD EDUCATIVA NAMBACOLA','LOJA','LOJA'),(3504,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE GABRIEL LOPEZ','PASTAZA','ARAJUNO'),(3505,'HONORABLE CONSEJO PROVINCIAL DE NAPO','ORELLANA','FRANCISCO DE ORELLANA'),(3506,'UNIDAD EDUACTIVA JOSE JOAQUIN PINO ICAZA','GUAYAS ','GUAYAQUIL'),(3507,'UNIDAD EDUCATIVA DE FUERZAS ARMADAS COLEGIO MILITAR Nº 3','MACHALA','EL  ORO'),(3508,'UNIDAD EDUCATIVA \"ANTONIO MARIÑO\"','QUITO','PICHINCHA'),(3509,'GRAL. ELOY ALFARO DELGADO','AMBATO ','TUNGURAHUA'),(3510,'INSTITUCION EDUCATIVA \"LUXEMBURGO\"','QUITO','PICHICHA'),(3511,'DESCONOCIDO','PICHINCHA ','QUITO'),(3512,'UNIDAD EDUCATIVA MERCEDES DE JESUS MOLINA','RIOBAMBA','CHIMBARAZO'),(3513,'UNIDAD EDUCATIVA RAMON GONZALEZ ARTIGAS','SANGOLQUI','PICHINCHA'),(3514,'INSTITUTO SUPERIOR TECNOLOGICO PICHINCHA','PICHINCHA ','QUITO'),(3515,'UNIDAD EDUCATIVA SUCRE MIELES','PEDERNALES ','MANABI'),(3516,'INSTITUTO SUPERIOR TECNOLOGICO INTISANA','QUITO','PICHINCHA'),(3517,'HENDRICK ANTOON LORENTZ','QUITO','PICHINCHA'),(3518,'MARCO SUBIA MARTINEZ','QUITO','PICHINCHA'),(3519,'UNIDAD EDUCATIVA PARTICULAR \"NAVARRA\"','PICHINCHA ','QUITO'),(3520,'UNIDAD EDUCATIVA \"VENCEDORES\"','PICHINCHA ','QUITO'),(3521,'UNIDAD EDUCATIVA PARTICULAR INNOVAR','QUITO','PICHINCHA'),(3522,'INSTITUTO SUPERIOR TECNOLOGICO QUITO METROPOLITANO','QUITO','PICHINCHA'),(3523,'INSTITUTO TECNOLOGICO UNIVERSITARIO RUMIÑAHUI','QUITO','PICHINCHA'),(3524,'AGENCIA NACIONAL DE  TRANSITO','QUITO','PICHINCHA'),(3525,'UNIDAD EDUCATIVA “CENTRAL TÉCNICO”','QUITO ','PICHINCHA'),(3526,'UNIDAD EDUCATIVA SAN MARIN','QUITO','PICHICHA'),(3527,'UNIDAD EDUCATIVA SAN MARTIN','QUITO','PICHINCHA'),(3528,'UNIDAD EDUCATIVA DE PEDERNALES','PEDERNALES ','MANABI'),(3529,'UNIDAD EDUCATIVA PARTICULAR KHIPU','QUITO','PICHINCHA'),(3530,'UNIDAD EDUCATIVA PARTICULAR SAGRADA FAMILIA DE NAZARET','QUININDE','ESMERALDAS'),(3531,'INSTITUCION EDUCATIVA FISCAL BENITO JUAREZ ','QUITO','PICHINCHA '),(3532,'UNIDAD EDUCATIVA LIMON','MACAS','ZAMORA CHINCHIPE'),(3533,'UNIDAD EDUCATIVA DEL MILENIO CACIQUE TUMBALA','COTOPAXI','PUJILI'),(3534,'UNIDAD EDUCATIVA PARTICULAR COMPUINFORMATICA','PICHINCHA','QUITO'),(3535,'UNIDAD EDUCATIVA MUNICIPAL JULIO ENRIQUE MORENO','PICHINCHA ','QUITO'),(3536,'COLEGIO TECNICO TOACASO ','LATACUGA','COTOPAXI'),(3537,'UNIDAD EDUCATIVA PARTICULAR PCEI SAN JUAN BOSCO','QUITO','PICHINCHA'),(3538,'UNIDAD EDUCATIVA ICAM QUITO','QUITO','PICHINCHA'),(3539,'UNIDAD EDUCATIVA CELIANO MONGE','QUITO','PICHINCHA'),(3540,'UNIDAD EDUCATIVA FISCAL PRIMICIAS DE LA CULTURA DE QUITO','QUITO','PICHINCHA'),(3541,'UNIDAD EDUCATIVA FISCAL CONOCOTO','RUMIÑAHUI','PICHINCHA'),(3542,'UNIDAD EDUCATIVA 14 DE OCTUBRE VICENTE ROCAFUERTE','PUJILI','COTOPAXI'),(3543,'COLEGIO INSECOL','IPIALES','NARIÑO'),(3544,'UNIDAD EDUCATIVA LUCIANO ANDRADE MARIN ','QUITO','PICHINCHA'),(3545,'UNIDAD EDUCATIVA DR EMILIO UZCATEGUI','QUITO','PICHINCHA'),(3546,'INSTITUTO EDUCATIVA PCEI PARTICULAR SAN JUAN PABLO II','QUITO','PICHINCHA'),(3547,'COLEGIO NACIONAL NOCTURNO JULIO ISAAC ESPINOSA OCHOA','AMBATO ','TUNGURAHUA'),(3548,'UNIDAD EDUCATIVA PCEI \"EUCLIDES BARRERA\"','PELILEO ','TUNGURAHUA'),(3549,'UNIDAD EDUCATIVA FISCAL SANTIAGO DE GUAYAQUIL','QUITO','PICHINCHA'),(3550,'INSTITUCION EDUCATICA JORGE ICAZA','QUITO','PICHINCHA'),(3551,'UNIDA EDUCATIVA FISCAL EUGENIO ESPEJO','QUITO','PICHINCHA'),(3552,'EL COLEGIO DE EDUCACION MUSICAL CESAR VIERA','QUITO ','PICHINCHA'),(3553,'JUNTA NACIONAL DE DEFENSA ARTESANO','IMBABURA','IBARRA'),(3554,'UNIDAD EDUCATIVA SANTA CATALINA LABOUTE','IBARRA','IMBABURA'),(3555,'COLEGIO BACHILLERATO UTN','IBARRA','IMBABURA'),(3556,'COLEGIO RAUL PONCE RIVADENEIRA','GUAYAQUIL','GUAYAS'),(3557,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE RUMIÑAHUI','BOLIVAR','GUARANDA '),(3558,'UNIDAD EDUCATIVA \"ADOLFO KOLPING\"','RIOBAMBA','CHIMBORAZO'),(3559,'UNIDAD EDUCATIVA DEL MILENIO ILEANA CEDEÑO','GUAYAQUIL','GUAYAS'),(3560,'SECAP SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS','SANTO DOMINGO '),(3561,'COLEGIO MENOR UNIVERSIDAD CENTRAL ','QUITO','PICHICHA'),(3562,'UNIDAD EDUCATIVA PARTICULAR PCEI LIDERES','QUITO','PICHINCHA'),(3563,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGÜE POROTOYACU','NAPO','NAPO'),(3564,'UNIDAD EDUCATIVA ANA ROSA VALDIVIESO DE LANDIVAR','QUITO','PICHINCHA'),(3565,'UNIDAD EDUCATIVA TARQUI','MANTA','MANABI'),(3566,'COLEGIO PARTICULAR MIXTO ECUADOR CIENTIFICO','DURAN','GUAYAS'),(3567,'INSTITUTO TECNICO SUPERIOR PRIMERO DE DE MAYO','ZAMORA','ZAMORA CHINCHIPE'),(3568,'UNIDAD EDUCATIVA FISCAL \"JUAN MONTALVO','GUAYAQUIL','GUAYAS'),(3569,'UNIDAD EDUCATIVA BILINGUE \"ACADEMIA MILITAR DEL VALLE\"','QUITO','PICHINCHA'),(3570,'UNIDAD EDUCATIVA FISCOMISIONAL IRFEYAL DISTANCIA VIRTUAL','QUITO','PICHINCHA'),(3571,'UNIDAD EDUCATIVA U.E.8 DE NOVIEMBRE','BOLIVAR','BALZAPAMBA'),(3572,'UNIDAD EDUCATIVA PARTICULAR \"JUAN MONTALVO\"','LOJA','LOJA'),(3573,'UNIDAD EDUCATIVA PARTICULAR \"ANGEL DE LA GUARDA COLLEGE\"','QUITO','PICHINCHA'),(3574,'UNIDAD EDUCATIVA PARTICULAR ADVENTISTA DEL ECUADOR','SANTO DOMINGO','SANTO DOMINGO DE LOS COLORADOS'),(3575,'BUENA VENTURA','QUITO','PICHINCHA'),(3576,'UNIDAD EDUCATIVA PCEI HISPANOAMERICANO','GUAYABAMBA','PICHINCHA'),(3577,'UNIDAD EDUCATIVA FISCOMISIONAL \"JUANPABLO II\" DE FE Y ALEGRIA','QUITO','PICHINCHA'),(3578,'UNIVERSIDAD UTE','QUITO','PICHINCHA'),(3579,'UNIDAD EDUCATIVA \"GUILLERMO ORDOÑEZ GOMEZ\"','SANTA ELENA ','GUAYAQUIL'),(3580,'UNIDAD EDUCATIVA DR MARIO MALDONADO','LATACUNGA','COTOPAXI'),(3581,'COLEGIO NOCTURNO CARAPUNGO','QUITO','PICHINCHA'),(3582,'UNIDAD EDUCATIVA JUAN FRANCISCO YEROVI','TIXAN','CHIMBORAZO'),(3583,'UNIDAD EDUCATIVA DEL MILENIO \"LIC. RAFAEL FIALLOS GUEVARA\"','PEDRO VICENTE MALDONADO','PICHINCHA'),(3584,'UNIDAD EDUCATIVA PCEI MONSEÑOR LEONIDAS PROAÑO - ECHEANDIA','ECHEANDIA','BOLIVAR'),(3585,'UNIDAD EDUCATIVA “22 DE OCTUBRE” ','PICHINCHA ','PUERTO QUITO'),(3586,'UNIDAD EDUCATIVA TOACASO','LATACUGA','COTOPAXI'),(3587,'UNIDAD EDUCATIVA DURENO','SUCUMBIOS','LAGO AGRIO'),(3588,'UNIDAD EDUCATIVA QUINTILINO SANCHEZ RENDON','BUENA FE','LOS RIOS'),(3589,'UNIDAD EDUCATIVA INES COBO DONOSO','LATACUGA','COTOPAXI'),(3590,'INSTITUTO SUPERIOR TECNOLOGICO ORIENTE','ORELLANA','ORELLANA'),(3591,'UNIDAD EDUCATIVA HUAMBOYA','MORONA SANTIAGO','SUCUA'),(3592,'UNIDAD EDUCATIVA ABDON CALDERON','ROCAFUERTE','MANABI'),(3593,'UNIDAD EDUCATIVA ISAAC ACOSTA CALDERON','CARCHI ','TULCAN '),(3594,'DR ITALO COLAMARCO INTRIAGO','CHONE','MANABI'),(3595,'COLEGIO PCEI MANUELA ESPEJO','IBARRA','IMBABURA'),(3596,'NUEVA ERA POPULAR','EL QUINCHE','PICHINCHA'),(3597,'DIEGO ABAD DE CEPEDA','QUITO','PICHINCHA'),(3598,'UNIDAD EDUCATIVA FISCOMISIONAL JOSÉ MARÍA VÉLAZ, S.J. – IRFEYAL – EXTENSIÓN 61-A-SANGOLQU','PICHINCHA ','SANGOLQUI'),(3599,'UNIDAD EDUCATIVA SAN JOSE','CHILLANES','BOLIVAR'),(3600,'UNIDAD EDUCATIVA PARTICULAR PCEI ALTAVISTA','QUITO','PICHINCHA'),(3601,'UNIDAD EDUCATIVA MUEY','SALINAS','SANTA ELENA'),(3602,'UNIDAD EDUCATIVA RIO AMAZONAS','PORTOVIEJO','MANABI'),(3603,'DR CLOTARIO PAZ PALADINES','PINDAL','LOJA'),(3604,'UNIDAD EDUCATIVA JOSE MARIA CELAZ S.J. EXT EDUCATIVA 93 LA CONCORDIA','LA CONCORDIA ','LA CONCORDIA'),(3605,'UNIDAD EDUCATIVA PARAMBAS','IBARRA','IMBABURA'),(3606,'GUIZHAGUIÑA','ZARUMA','EL ORO'),(3607,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE SAMINAY EL LEGADO','OTAVALO','IMBABURA'),(3608,'UNIDAD EDUCATIVA VALDIVIA','SANTA ELENA ','SANTA ELENA'),(3609,'UNIDAD EDUCATIVA VALM. MANUEL NIETO CADENA','ESMERALDAS ','ESMERALDAS'),(3610,'UNIDAD EDUCATIVA FISCAL J.M. JIJON CAAMAÑO Y FLORES','QUITO','PICHINCHA'),(3611,'UNIDAD EDUCATIVA MARIA PIEDAD CASTILLO DE LEVI','PAJAN','MANABI'),(3612,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE REPUBLICA DOMINICANA','COTOPAXI','EL CORAZON'),(3613,'UNIDAD EDUCATIVA PCEI BRITAIN SCHOOL','LATACUNGA','COTOPAXI'),(3614,'COLEGIO PARTICULAR AMERICAN SCHOOL','GUAYAQUIL','GUAYAS'),(3615,'UNIDAD EDUCATIVA PARTICULAR AMERICAN BASIC','RUMIÑAHUI','PICHINCHA'),(3616,'UNIDAD EDUCATIVA FISCAL EUGENIO ESPEJO ','QUITO','PICHINCHA'),(3617,'UNIDAD EDUCATIVA PCEI REPUBLICA DE ARGENTINA','AMBATO ','TUGURAHUA'),(3618,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGÜE \"PUEBLO MACA GRANDE\"','LATACUNGA','COTOPAXI'),(3619,'COLEGIO TEC. NC. ROBERTO LUIS CERVANTES M.','ESMERALDAS ','ESMERALDAS'),(3620,'INSTITUCION EDUCATIVA ELOY ALFARO','QUITO','PICHINCHA'),(3621,'UNIDAD EDUCATIVA PARTICULAR MARISTA','QUITO','PICHINCHA'),(3622,'COLEGIO NOCTURNO ATUNTAQUI','IBARRA','IMBABURA'),(3623,'UNIDAD EDUCATIVA RIOVERDE','ESMERALDAS ','ESMEDALDAS'),(3624,'COLEGIO PARTICULAR PROF. ERNESTO GONZALEZ MUÑOZ','GUAYAQUIL','GUAYAS'),(3625,'UNIDAD EDUCATIVA RIO CHINGUAL','JOYA DE LOS SACHAS','ORELLANA'),(3626,'UNIDAD EDUCATIVA \"ISABEL ROBALINO\"','QUITO','PICHINCHA'),(3627,'COLEGIO DE BACHILLERATO FISCAL \"TONCHIGÜE\"','ESMERALDAS ','ESMERALDAS'),(3628,'UNIVERSIDAD ESTATAL DE MILAGRO','MILAGRO','GUAYAS'),(3629,'EDISON CAREER AND TECNOLOGY HIGH SCHOOL','ESTADOS UNIDOS ','NUEVA YORK'),(3630,'UNIDAD EDUCATIVA FISCOMISIONAL \"MONSEÑOR OSCAR ARNULFO ROMERO\"','JOYA DE LOS SACHAS','ORELLANA'),(3631,'UNIDAD EDUCATIVA INTERCULTURAL BILINGUE CAPITAN GIOVANNI LASCANO','CHIMBORAZO','RIOBAMBA'),(3632,'CORPORACION EDUCATIVA DEL SUR OCCIDENTE COLOMBIANO','POPALLAN','COLOMBIA'),(3633,'NUESTRA SEÑORA DE LOURDE BAMBAMARCA','BAMBAMARCA','CAJAMARCA'),(3634,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL','GUARANDA','BOLIVAR'),(3635,'DR RICARDO CORNEJO ROSALES','QUITO','PICHINCHA'),(3636,'UNIDAD EDUCATIVA NUEVA PRIMAVERA','PICHINCHA ','QUITO'),(3637,'UNIDAD EDUCATIVA FISCOMISIONAL MARISTA DE CATACOCHA','CATACOCHA','LOJA'),(3638,'U.E PARA LA FORMACION DEPORTIVA INTEGRAL INDEPENDIENTE DEL VALLE','QUITO','PICHINCHA'),(3639,'UNIDAD EDUCATIVA MADRE DOLOROSA','MANTA','MANABI'),(3640,'UNIDAD EDUCATIVA PCEI SAN JOSE DE MORAN ','QUITO','PICHINCHA'),(3641,'INSTITUCION EDUCATIVA HERNAN MALO GONZALEZ','QUITO','PICHINCHA'),(3642,'INSTITUTO TECNOLOGICO MAYOR PEDRO TRAVERSARI','QUITO','PICHINCHA'),(3643,'UNIDAD EDUCATIVA PCEI PARTICULAR SULTANA DEL ORIENTE','MANABI','MANABI'),(3644,'UNIDAD EDUCATIVA PARTICULAR EUGENE CERMAN','QUITO','PICHINCHA'),(3645,'UNIDAD EDUCATIVA FISCOMISIONAL 10 DE AGOSTO ','ESMERALDAS ','ESMEDALDAS'),(3646,'UNIVERSIDAD DE LOS HEMISFERIOS','QUITO','PICHINCHA'),(3647,'UNIDAD EDUCATIVA PARTICULAR “GENERACIÓN ALFA”','GUAYAQUIL','GUAYAS'),(3648,'UNIDAD EDUCATIVA MAGALY MASSONDE VALLE CARRERA','CHONE','MANABI'),(3649,'UNIDAD EDUCATIVA RIO PACHIJAL','PEDRO VICENTE MALDONADO','SAN MIGUEL DE LOS BANCOS'),(3650,'UNIDAD EDUCATIVA FISCAL CAMILO PONCE ENRIQUEZ','GUAYAQUIL','GUAYAS'),(3651,'COLEGIO TENICO POPULAR PARTICULAR JOSEPH SMITH','QUITO','CUMBAYA'),(3652,'UNIDAD EDUCATIVA CIUDAD DE BALZAR','GUAYAQUIL','GUAYAS'),(3653,'COLEGIO PARTICULAR DE BACHILLERATO PCEI NIKOLA TESLA','IMBABURA','IBARRA'),(3654,'UNIDAD EDUCATIVA JOSE ORDOÑEZ','MACAS','MORONA SANTIAGO'),(3655,'UNIDAD EDUCATIVA ALFONSO QUIÑONEZ GEORGE','ESMERALDAS ','ESMEDALDAS'),(3656,'UNIDAD EDUCATIVA ISINLIVI','SIGCHOS ','COTOPAXI'),(3657,'COLEGIO DE BACHILLERATO PCEI VALLE','PICHINCHA ','TUMBACO'),(3658,'INSTITUCION EDUCATIVA BATALLA DE JAMBELI','QUITO','PICHINCHA'),(3659,'UNIDAD EDUCATIVA PARTICULAR CAMINO AL BELLO AMANECER','GUAYAQUIL','GUAYAS'),(3660,'UNIDAD EDUCATIVA FISCAL PEDRO LUIS CALERO','QUITO','PICHINCHA'),(3661,'UNIDAD EDUCATIVA PARTICULAR EUGENIO DE SANTA CRUZ Y ESPEJO','EL COCA','ORELLANA'),(3662,'INSTITUCION EDUCATIVA FISCOMISIONAL FRATERNIDAD Y SERVICIO','QUITO','PICHINCHA'),(3663,'COLEGIO PARTICULAR MIXTO SANTA ,MARIA DE LA GUAYAS','CARMEN ','MANABI'),(3664,'UNIDAD EDUCATIVA 10 DE AGOSTO','QUITO','PICHINCHA'),(3665,'COLEGIO FISCOMISIONAL BALBINA MORENO','LOJA','GONZANAMA'),(3666,'UNIDAD EDUCATIVA PRESIDENTE VICENTE RAMON ROCA','ALFREDO BAQUERIZO MORENO','GUAYAS'),(3667,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILIGUE AQUILES PEREZ TAMAYO','CAYAMBE','PICHINCHA'),(3668,'COLEGIO MXTO ANEXO A LA U.T.B.','BABAHOYO','LOS RIOS'),(3669,'UNIDAD EDUCATIVA PCEI BLAISE PASCAL','QUEVEDO ','LOS RIOS'),(3670,'UNIDAD EDUCATIVA SAN FRANCISCO DE QUITO','QUITO','PICHINCHA'),(3671,'GUAYAQUIL','GUAYAQUIL','GUAYAS'),(3672,'UNIDAD EDUCATIVA ARUPOS','QUITO','PICHINCHA'),(3673,'JUAN RAMON JIMENEZ HERRERA MATRIZ','SHUSHUFINDI','SUCUMBIOS'),(3674,'UNIDAD EDUCATIVA GENERAL JULIO ANDRADE','BOLIVAR','CARCHI'),(3675,'UNIDAD EDUCATICA INDOAMERICA','LOJA','LOJA'),(3676,'UNIDAD EDUCATIVA THEODORE W . ANDERSON','QUITO','PICHINCHA'),(3677,'COLEGIO DE BACHILLERATO FISCAL MARGARITA CORTEZ','ESMERALDAS ','ESMEDALDAS'),(3678,'CIUDAD DE COCA','EL COCA','ORELLANA'),(3679,'UNIDAD EDUCATIVA PARTICULAR \"MIGUEL ANGEL BUONARROTI\"','QUITO','PICHINCHA'),(3680,'COLEGIO PARTICULAR MILITAR N 9 \"EUGENIO ESPEJO\"','SALINAS','SANTA ELENA'),(3681,'UNIDAD EDUCATIVA DEL MILENIO GUARDIANA DE LA LENGUA 27 DE FEBRERO','PALMIRA','CHIMBORAZO'),(3682,'U.E. FISCOMISIONAL JOSE MARIA VELAZ EXT 36 SANTA EUFRASIA','QUITO','PICHINCHA'),(3683,'UNIDAD EDUCATIVA LICEO POLICIAL N·1 GRAL. GALO FLOR PINTO','QUITO','PICHINCHA'),(3684,'UNIDAD EDUCATIVA CINCO DE JUNIO ','QUITO','PICHINCHA'),(3685,'PARTICULAR DIVINO NIÑO','PONCE ENRIQUEZ','AZUAY '),(3686,'COLEGIO DE BACHILLERATO DEMETRIO AGUILERA MALTA','SANTA ROSA','EL ORO'),(3687,'FRANCISO DE ORELLANA','ORELLANA','ORELLANA'),(3688,'FRANCISO DE ORELLANA','ORELLANA','ORELLANA'),(3689,'COLEGIO NACIONAL SANTA  MARTHA','SANTO DOMINGO DE LOS COLORADOS','SANTO DOMINGO DE LOS TSACHILAS'),(3690,'UNIDAD EDUCATIVA PARTICULAR PCEI KEVIN ROBERTS','GUAYAQUIL','GUAYAS'),(3691,'UNIDAD EDUCATIVA BILINGUE \"SEK\" LOS VALLES','QUITO','PICHICNCHA'),(3692,'NACIONAL MIXTO ELOY ALFARO','QUITO','PICHINCHA'),(3693,'INSTITUTO SUPERIOR TECNOLOGICO COTOPAXI','LATACUGA','COTOPAXI'),(3694,'UNIDAD EDUCATIVA FISCAL JUAN ANTONIO VEGA ARBOLEDA','MANABI','EL CARMEN'),(3695,'UNIDAD EDUCATIVA PARTICULAR AMAZONICA UEPA','PUYO','PASTAZA'),(3696,'UNIDAD EDUCATIVA PARTICULAR \"SAUL`O\"','QUITO','PICHINCHA'),(3697,'UNIDAD EDUCATIVA FISCAL PCEIDR. ALBERTO CABEZAS Y CABEZAS','GUAYAQUIL','GUAYAS'),(3698,'EUGENIO ESPEJO EXTENSION ESMERALDAS','ESMERALDAS ','ESMERALDAS'),(3699,'UNIDAD EDUCATIVA SALINAS','SALINAS','MANABI'),(3700,'UNIDAD EDUCATIVA PARTICULAR \" TECNICA CRSTIANA VIDA NUEVA \" ','QUITO ','PICHINCHA '),(3701,'UNIDAD EDUCATIVA GUZMAN BLANCO','MARACAIBO','MARACAIBO'),(3702,'UNIDAD EDUCATIVA DEL MILENIO DR. CAMILO GALLEGOS DOMINGUEZ','NUEVA LOJA ','SUCUMBIOS'),(3703,'UNIDAD EDUCATIVA PCEI CRUZADA SOCIAL','RIOBAMBA','CHIMBORAZO'),(3704,'INSTITUTO SUPERIOR UNIVERSITARIO JAPON','QUITO','PICHINCHA'),(3705,'UNIDAD EDUCATIVA SANTANDER','GUAYAS ','GUAYAQUIL'),(3706,'TRECE DE NOVIEMBRE','SABANILLA','LOJA'),(3707,'GONZALO CORDERO CRESPO FE Y ALEGRIA','ECHEANDIA','BOLIVAR'),(3708,'COLEGIO PARTICULAR PABLO NERUDA','BABAHOYO','LOS   RIOS '),(3709,'UNIDAD EDUCATIVA PARTICULAR INDIRA GANDHI','QUITO','PICHINCHA'),(3710,'UNIDAD EDUCATIVA \"YANAHURCO\"','AMBATO ','TUNGURAHUA'),(3711,'UNIDAD EDUCATIVA FISCAL DR LUIS PRADO VITERI','ESMERALDAS ','ESMEDALDAS'),(3712,'QUITO LUZ DE AMERICA BLANTACH','QUITO','PICHINCHA'),(3713,'COLEGIO TECNICO PARTICULAR \"CEIS&E\"','LATACUNGA','COTOPAXI'),(3714,'UNIDAD EDUCATIVA EDUARDO GRANJA GARCES','GUAYAS ','GUAYAQUIL'),(3715,'UNIDAD EDUCATIVA PARTICULAR SOFOS','GUAYAQUIL','GUAYAS'),(3716,'SARA SERRANO DE MARIDUELA','EL ORO','HUAQUILLAS'),(3717,'DOLORES VEINTIMILLA DE GALINDO','LA TRONCAL','CAÑAR'),(3718,'NACIONAL MIXTO ROCAFUERTE','ROCAFUERTE','MANABI'),(3719,'UNIDAD EDUCATIVA SARANCE','IBARRA','IMBABURA'),(3720,'UNIDAD EDUCATIVA FLOR DEL ORIENTE','ORELLANA','ORELLANA'),(3721,'GALO PLAZA LASSO','QUITO','PICHINCHA'),(3722,'UNIDAD EDUCATIVA \"SUCRE\"','PICHINCHA ','QUITO'),(3723,'UNIDAD EDUCATIVA LAUTARO VICENTE LOAYZA','PUYANGO','LOJA'),(3724,'UNIDAD EDUCATIVA A DISTANCIA \"RIOS DE AGUA VIVA\"','MANTA','MANABI'),(3725,'AIU HIGH SCHOOL','MIAMI','FLORIDA'),(3726,'UNIDAD EDUCATIVA \"NUEVA CONCORDIA\"','LA CONCORDIA ','SANTO DOMINGO DE LOS TSACHILAS'),(3727,'CENTRO EDUCATIVO PAULO FREIRE','BUCARAMANGA','BUCARAMANGA'),(3728,'UNIDAD EDUCATIVA SARAGURO','SARAGURO','LOJA'),(3729,'UNIDAD EDUCATIVA PECI FISCOMISIONAL JUAN RAMON JIMENEZ HERRERA EXT AMERICANO','SUCUMBIOS','LAGO AGRIO'),(3730,'UNIDAD EDUCATIVA GALO MOLINA','COTOPAXI','LATACUNGA'),(3731,'UNIDAD EDUCATIVA CAPITAN GALO MOLINA','PAUTE','COTOPAXI'),(3732,'UNIDAD EDUCACTIVA SANTA MARIANA DE JESUS GUARANDA','BOLIVAR','GUARANDA '),(3733,'COLEGIO DE BACHILLERATO ZAPOTILLO','LOJA','ZAPOTILLO'),(3734,'CELINA VIVAR ESPINOSA','SARAGURO','LOJA'),(3735,'UNIDAD EDUCATIVA SANGUILLIN','CALVAS ','LOJA'),(3736,'UNIDAD EDUCATIVA VUELA ALTO','QUITO','PICHINCHA'),(3737,'UNIDAD EDUCATIVA ALBERTO ANDRADE ARIZAGA BRUMMEL','CUENCA ','AZUAY '),(3738,'CONZALO ESCOBAR BARCIA','PORTOVIEJO','MANABI'),(3739,'CARLOS SOUBLETTE','CARACAS','VENEZUELA'),(3740,'MARIA LUISA LUQUE DE SOTOMAYOR','GUAYAQUIL','GUAYAS'),(3741,'UNIDAD EDUCATIVA PARTICULAR MODERNA','QUITO','PICHINCHA'),(3742,'BARRINGER HIGH SCHOOL','NUEVA YORK','NUEVA YORK'),(3743,'BORJA 3','QUITO','PICHINCHA'),(3744,'UNIDAD PARTICULAR COSME RENNELLA BARBATTO','PICHINCHA','QUITO'),(3745,'UNIDAD EDUCATIVA GALO VELA ALVAREZ','QUITO','PICHINCHA'),(3746,'MUNICIPAL COLEGIO N 3','RUSA','RUSA'),(3747,'UNIDAD EDUCATIVA PARTICULAR ANGELICO DE FIESOLE','QUITO','PICHINCHA'),(3748,'ERNESTO VELASQUEZ KUFFO','CHONE','MANABI'),(3749,'UNIDAD EDUCATIVA # EQUINOCCIO SAN ANTONIO\"','QUITO','PICHINCHA'),(3750,'UNIDAD EDUCATIVA MONSEÑOR EMILIO LORENZOSTHELE','SANTO DOMINGO','SANTO DOMINGO DE LOS TSACHILAS'),(3751,'UNIDAD EDUCATIVA CASA DE LA  CULTURA ECUATORIANA BENJAMIN CARRION Nº2','PICHINCHA ','QUITO'),(3752,'UNIDAD EDUCATIVA FISCAL MODESTO ENRIQUE SUAREZ PIMENTEL','ESMERALDAS ','ESMEDALDAS'),(3753,'COLEGIO NACIONAL \"ELOY ALFARO\" DE CARIAMANNGA','CARIAMANGA ','LOJA'),(3754,'UNIDAD EDUCATIVA PARTICULAR \" GENERACIÓN ALFA\"','QUITO','PICHINCHA'),(3755,'UNIDAD EDUCATIVA COMUNITARIA INTERCULTURAL BILINGUE \"AMAWTA RIKCHARI\"','QUITO','PICHINCHA'),(3756,'UNIDAD EDUCATIVA ROSA CEVALLOS','ESMERALDAS ','ESMEDALDAS');
/*!40000 ALTER TABLE `instituciones` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `instituciones_instituto`
LOCK TABLES `instituciones_instituto` WRITE;
/*!40000 ALTER TABLE `instituciones_instituto` DISABLE KEYS */;
INSERT INTO `instituciones_instituto` VALUES (1,'INSTITUTO SUPERIOR TECNOLÓGICO MAYOR PEDRO TRAVERSARI','1792105633001','las cuadras parroquia de Chillogallo','MSc. Naranjo Paredes Giovanny Edison','1718161126'),(2,'ESCUELA DE CONDUCCIÓN PROFESIONAL - ISTPET','1792105633001','las cuadras parroquia de Chillogallo','MSc. Naranajo Paredes Giovanny Edison','1719380337');
/*!40000 ALTER TABLE `instituciones_instituto` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `jornadas_ofertas`
LOCK TABLES `jornadas_ofertas` WRITE;
/*!40000 ALTER TABLE `jornadas_ofertas` DISABLE KEYS */;
INSERT INTO `jornadas_ofertas` VALUES (1,'TIEMPO COMPLETO'),(2,'MEDIO TIEMPO'),(3,'TIEMPO PARCIAL');
/*!40000 ALTER TABLE `jornadas_ofertas` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `mallas`
LOCK TABLES `mallas` WRITE;
/*!40000 ALTER TABLE `mallas` DISABLE KEYS */;
INSERT INTO `mallas` VALUES (1,1,4,'MALLA 2007',120,150,119,0),(2,3,6,'MALLA ADMINISTRACION 2007',120,189,20,0),(3,2,6,'MALLAS 2007 ',178,200,178,0),(5,4,6,'2008',36,211,0,0),(8,5,6,'2008',31,211,0,0),(9,6,1,'MALLA ESCUELA CONDUCCION',28,28,0,0),(10,1,6,'MALLA INFORMATICA 2013',150,150,119,0),(11,4,6,'MALLA MECANICA 2013 ',150,150,119,0),(12,6,1,'MALLA ESCUELA DE CONDUCCION 2016',32,32,0,1),(13,2,6,'MALLA 2016 TURISMO',162,200,0,0),(14,7,5,'MALLA 2018 ENTRENAMIENTO',100,100,0,0),(15,8,5,'MALLA 2018 TURISMO',100,100,0,0),(16,9,5,'DESARROLLO DE SOFTWARE',100,100,0,0),(17,10,5,'MALLA 2018 MECANICA REDISEÑO',100,100,0,0),(18,11,4,'MALLA 2020 INGLES',20,20,0,0),(19,9,5,'MALLA 2020 SOFTWARE',20,100,0,0),(20,7,5,'MALLA 2020 ENTRENAMIENTO DEPORTIVO',20,100,0,0),(21,10,5,'MALLA 2020 MECANICA',20,100,0,0),(22,12,4,'MALLA 2023 CONTABILIDAD Y ASESORIA TRIBUTARIA',60,60,0,1),(23,9,4,'MALLA 2023 SOFTWARE',20,100,0,1),(24,10,4,'MALLA 2023 MECANICA',20,100,0,1),(25,13,4,'MALLA 2023 ADMINISTRACION TALENTO HUMANO',38,38,0,1),(26,17,4,'MALLA 2023 EDUCACION INCLUSIVA',60,60,0,1),(27,18,4,'MALLA 2023 EDUCACION BASICA',60,60,0,1),(28,14,4,'MALLA 2023 DISEÑO GRAFICO',60,60,0,1),(29,16,4,'MALLA 2023 MARKETING DIGITAL',60,60,0,1),(30,15,4,'MALLA 2023 EDUCACION INICIAL',60,60,0,1),(31,7,4,'MALLA 2023 ENTRENAMIENTO DEPORTIVO',60,60,0,1),(32,19,4,'MALLA 2023 GASTRONOMIA',60,60,0,1),(33,21,4,'MALLA 2023 ELECTRONICA',60,60,0,1),(34,20,4,'MALLA 2023 REDES Y TELEECOMUNICACIONES',60,60,0,1);
/*!40000 ALTER TABLE `mallas` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `mallas_periodos`
LOCK TABLES `mallas_periodos` WRITE;
/*!40000 ALTER TABLE `mallas_periodos` DISABLE KEYS */;
INSERT INTO `mallas_periodos` VALUES ('AA2021',40,20),('AA2021',41,20),('AA2021',42,14),('AA2021',43,14),('AA2021',44,14),('AA2021',45,15),('AA2021',46,15),('AA2021',47,15),('AA2021',48,15),('AA2021',49,15),('AA2021',50,19),('AA2021',51,19),('AA2021',52,16),('AA2021',53,16),('AA2021',54,16),('AA2021',55,21),('AA2021',56,21),('AA2021',57,17),('AA2021',58,17),('AA2021',59,17),('AAE2021',40,20),('AAE2021',41,20),('AAE2021',42,14),('AAE2021',43,14),('AAE2021',44,14),('AAE2021',45,15),('AAE2021',46,15),('AAE2021',47,15),('AAE2021',48,15),('AAE2021',49,15),('AAE2021',50,19),('AAE2021',51,19),('AAE2021',52,16),('AAE2021',53,16),('AAE2021',54,16),('AAE2021',55,21),('AAE2021',56,21),('AAE2021',57,17),('AAE2021',58,17),('AAE2021',59,17),('AAE2022',40,20),('AAE2022',41,20),('AAE2022',42,20),('AAE2022',44,14),('AAE2022',50,19),('AAE2022',51,19),('AAE2022',52,19),('AAE2022',54,16),('AAE2022',55,21),('AAE2022',56,21),('AAE2022',57,21),('AAE2022',59,17),('ABR2008',1,0),('ABR2008',2,0),('ABR2008',3,0),('ABR2008',4,0),('ABR2008',5,0),('ABR2008',16,2),('ABR2009',18,2),('ABR2010',1,0),('ABR2010',2,0),('ABR2010',3,0),('ABR2010',4,0),('ABR2010',5,0),('ABR2010',20,2),('ABR2011',1,1),('ABR2011',2,1),('ABR2011',3,1),('ABR2011',4,1),('ABR2011',5,1),('ABR2011',6,1),('ABR2012',2,1),('ABR2012',4,1),('ABR2012',6,1),('ABR2012',9,3),('ABR2012',13,3),('ABR2012',15,3),('ABR2012',18,2),('ABR2012',20,2),('ABR2012',24,5),('ABR2012',26,5),('ABR2012',28,5),('ABR2013',6,1),('ABR2013',20,2),('ABR2013',28,5),('ABR2014',2,10),('ABR2014',24,11),('ABR2015',2,10),('ABR2015',4,10),('ABR2015',24,11),('ABR2015',26,11),('ABR2016',2,10),('ABR2016',4,10),('ABR2016',6,10),('ABR2016',24,11),('ABR2016',26,11),('ABR2016',28,11),('ABR2017',2,10),('ABR2017',4,10),('ABR2017',6,10),('ABR2017',9,13),('ABR2017',24,11),('ABR2017',26,11),('ABR2017',28,11),('ABR2018',1,10),('ABR2018',2,10),('ABR2018',3,10),('ABR2018',4,10),('ABR2018',5,10),('ABR2018',6,10),('ABR2018',8,13),('ABR2018',9,13),('ABR2018',12,13),('ABR2018',13,13),('ABR2018',14,13),('ABR2018',15,13),('ABR2018',21,11),('ABR2018',24,11),('ABR2018',25,11),('ABR2018',26,11),('ABR2018',27,11),('ABR2018',28,11),('ABR2019',1,10),('ABR2019',2,10),('ABR2019',3,10),('ABR2019',4,10),('ABR2019',5,10),('ABR2019',6,10),('ABR2019',8,13),('ABR2019',9,13),('ABR2019',12,13),('ABR2019',13,13),('ABR2019',14,13),('ABR2019',15,13),('ABR2019',21,11),('ABR2019',24,11),('ABR2019',25,11),('ABR2019',26,11),('ABR2019',27,11),('ABR2019',28,11),('ABR2019',40,14),('ABR2019',41,14),('ABR2019',42,14),('ABR2019',43,14),('ABR2019',44,14),('ABR2019',45,15),('ABR2019',46,15),('ABR2019',47,15),('ABR2019',48,15),('ABR2019',49,15),('ABR2019',50,16),('ABR2019',51,16),('ABR2019',52,16),('ABR2019',53,16),('ABR2019',54,16),('ABR2019',55,17),('ABR2019',56,17),('ABR2019',57,17),('ABR2019',58,17),('ABR2019',59,17),('ABR2020',1,10),('ABR2020',2,10),('ABR2020',3,10),('ABR2020',4,10),('ABR2020',5,10),('ABR2020',6,10),('ABR2020',8,13),('ABR2020',9,13),('ABR2020',12,13),('ABR2020',13,13),('ABR2020',14,13),('ABR2020',15,13),('ABR2020',21,11),('ABR2020',24,11),('ABR2020',25,11),('ABR2020',26,11),('ABR2020',27,11),('ABR2020',28,11),('ABR2020',40,14),('ABR2020',41,14),('ABR2020',42,14),('ABR2020',43,14),('ABR2020',44,14),('ABR2020',45,15),('ABR2020',46,15),('ABR2020',47,15),('ABR2020',48,15),('ABR2020',49,15),('ABR2020',50,16),('ABR2020',51,16),('ABR2020',52,16),('ABR2020',53,16),('ABR2020',54,16),('ABR2020',55,17),('ABR2020',56,17),('ABR2020',57,17),('ABR2020',58,17),('ABR2020',59,17),('ABR2021',40,20),('ABR2021',41,20),('ABR2021',42,14),('ABR2021',43,14),('ABR2021',44,14),('ABR2021',45,15),('ABR2021',46,15),('ABR2021',47,15),('ABR2021',48,15),('ABR2021',49,15),('ABR2021',50,19),('ABR2021',51,19),('ABR2021',52,16),('ABR2021',53,16),('ABR2021',54,16),('ABR2021',55,21),('ABR2021',56,21),('ABR2021',57,17),('ABR2021',58,17),('ABR2021',59,17),('ABR2022',40,20),('ABR2022',41,20),('ABR2022',42,20),('ABR2022',43,20),('ABR2022',50,19),('ABR2022',51,19),('ABR2022',52,19),('ABR2022',53,19),('ABR2022',55,21),('ABR2022',56,21),('ABR2022',57,21),('ABR2022',58,21),('ABR2023',40,20),('ABR2023',41,20),('ABR2023',42,20),('ABR2023',43,20),('ABR2023',44,20),('ABR2023',50,23),('ABR2023',51,19),('ABR2023',52,19),('ABR2023',53,19),('ABR2023',54,19),('ABR2023',55,24),('ABR2023',56,21),('ABR2023',57,21),('ABR2023',58,21),('ABR2023',59,21),('ABR2023',65,22),('ABR2024',40,31),('ABR2024',41,31),('ABR2024',42,20),('ABR2024',43,20),('ABR2024',44,20),('ABR2024',50,23),('ABR2024',51,23),('ABR2024',52,23),('ABR2024',53,19),('ABR2024',54,19),('ABR2024',55,24),('ABR2024',56,24),('ABR2024',57,24),('ABR2024',58,21),('ABR2024',59,21),('ABR2024',65,22),('ABR2024',66,22),('ABR2024',67,22),('ABR2024',69,25),('ABR2024',70,25),('ABR2024',76,28),('ABR2024',77,28),('ABR2024',83,30),('ABR2024',84,30),('ABR2024',90,29),('ABR2024',91,29),('ABR2024',94,26),('ABR2024',95,26),('ABR2024',100,27),('ABR2024',101,27),('ABR2024',104,32),('ABR2024',105,32),('ABR2025',40,31),('ABR2025',41,31),('ABR2025',42,31),('ABR2025',43,31),('ABR2025',50,23),('ABR2025',51,23),('ABR2025',52,23),('ABR2025',53,23),('ABR2025',55,24),('ABR2025',56,24),('ABR2025',57,24),('ABR2025',58,24),('ABR2025',65,22),('ABR2025',66,22),('ABR2025',67,22),('ABR2025',68,22),('ABR2025',69,25),('ABR2025',70,25),('ABR2025',72,25),('ABR2025',76,28),('ABR2025',77,28),('ABR2025',78,28),('ABR2025',79,28),('ABR2025',83,30),('ABR2025',86,30),('ABR2025',90,29),('ABR2025',91,29),('ABR2025',92,29),('ABR2025',93,29),('ABR2025',94,26),('ABR2025',95,26),('ABR2025',98,26),('ABR2025',100,27),('ABR2025',101,27),('ABR2025',102,27),('ABR2025',103,27),('ABR2025',104,32),('ABR2025',105,32),('ABR2025',106,32),('ABR2025',107,32),('ABR2025',109,34),('ABR2025',110,34),('ABR2025',112,33),('ABR2025',113,33),('NOV2018',35,12),('OCT2007',1,1),('OCT2007',3,2),('OCT2007',4,0),('OCT2007',5,0),('OCT2007',6,0),('OCT2007',7,2),('OCT2008',1,1),('OCT2008',2,1),('OCT2008',3,1),('OCT2008',4,1),('OCT2008',5,1),('OCT2008',17,2),('OCT2009',1,0),('OCT2009',2,0),('OCT2009',3,0),('OCT2009',4,0),('OCT2009',5,0),('OCT2009',19,2),('OCT2010',1,0),('OCT2010',2,0),('OCT2010',3,0),('OCT2010',4,0),('OCT2010',5,0),('OCT2010',6,0),('OCT2011',1,0),('OCT2011',2,0),('OCT2011',3,0),('OCT2011',4,0),('OCT2011',5,0),('OCT2011',6,0),('OCT2012',5,1),('OCT2012',14,3),('OCT2012',19,2),('OCT2012',27,5),('OCT2013',1,10),('OCT2013',21,10),('OCT2014',1,10),('OCT2014',3,10),('OCT2014',21,11),('OCT2014',25,11),('OCT2015',1,10),('OCT2015',3,10),('OCT2015',5,10),('OCT2015',21,11),('OCT2015',25,11),('OCT2015',27,11),('OCT2016',1,10),('OCT2016',3,10),('OCT2016',5,10),('OCT2016',8,13),('OCT2016',21,11),('OCT2016',25,11),('OCT2016',27,11),('OCT2017',1,10),('OCT2017',3,10),('OCT2017',5,10),('OCT2017',8,13),('OCT2017',12,13),('OCT2017',21,11),('OCT2017',25,11),('OCT2017',27,11),('OCT2018',1,10),('OCT2018',2,10),('OCT2018',3,10),('OCT2018',4,10),('OCT2018',5,10),('OCT2018',6,10),('OCT2018',8,13),('OCT2018',9,13),('OCT2018',12,13),('OCT2018',13,13),('OCT2018',14,13),('OCT2018',15,13),('OCT2018',21,11),('OCT2018',24,11),('OCT2018',25,11),('OCT2018',26,11),('OCT2018',27,11),('OCT2018',28,11),('OCT2018',40,14),('OCT2018',41,14),('OCT2018',42,14),('OCT2018',43,14),('OCT2018',44,14),('OCT2018',45,15),('OCT2018',46,15),('OCT2018',47,15),('OCT2018',48,15),('OCT2018',49,15),('OCT2018',50,16),('OCT2018',51,16),('OCT2018',52,16),('OCT2018',53,16),('OCT2018',54,16),('OCT2018',55,17),('OCT2018',56,17),('OCT2018',57,17),('OCT2018',58,17),('OCT2018',59,17),('OCT2019',1,10),('OCT2019',2,10),('OCT2019',3,10),('OCT2019',4,10),('OCT2019',5,10),('OCT2019',6,10),('OCT2019',8,13),('OCT2019',9,13),('OCT2019',12,13),('OCT2019',13,13),('OCT2019',14,13),('OCT2019',15,13),('OCT2019',21,11),('OCT2019',24,11),('OCT2019',25,11),('OCT2019',26,11),('OCT2019',27,11),('OCT2019',28,11),('OCT2019',40,14),('OCT2019',41,14),('OCT2019',42,14),('OCT2019',43,14),('OCT2019',44,14),('OCT2019',45,15),('OCT2019',46,15),('OCT2019',47,15),('OCT2019',48,15),('OCT2019',49,15),('OCT2019',50,16),('OCT2019',51,16),('OCT2019',52,16),('OCT2019',53,16),('OCT2019',54,16),('OCT2019',55,17),('OCT2019',56,17),('OCT2019',57,17),('OCT2019',58,17),('OCT2019',59,17),('OCT2020',40,20),('OCT2020',41,14),('OCT2020',42,14),('OCT2020',43,14),('OCT2020',44,14),('OCT2020',45,15),('OCT2020',46,15),('OCT2020',47,15),('OCT2020',48,15),('OCT2020',49,15),('OCT2020',50,19),('OCT2020',51,16),('OCT2020',52,16),('OCT2020',53,16),('OCT2020',54,16),('OCT2020',55,21),('OCT2020',56,17),('OCT2020',57,17),('OCT2020',58,17),('OCT2020',59,17),('OCT2021',40,20),('OCT2021',41,20),('OCT2021',42,20),('OCT2021',44,14),('OCT2021',50,19),('OCT2021',51,19),('OCT2021',52,19),('OCT2021',54,16),('OCT2021',55,21),('OCT2021',56,21),('OCT2021',57,21),('OCT2021',59,17),('OCT2022',40,20),('OCT2022',41,20),('OCT2022',42,20),('OCT2022',43,20),('OCT2022',44,20),('OCT2022',50,19),('OCT2022',51,19),('OCT2022',52,19),('OCT2022',53,19),('OCT2022',54,19),('OCT2022',55,21),('OCT2022',56,21),('OCT2022',57,21),('OCT2022',58,21),('OCT2022',59,21),('OCT2023',40,31),('OCT2023',41,20),('OCT2023',42,20),('OCT2023',43,20),('OCT2023',44,20),('OCT2023',50,23),('OCT2023',51,23),('OCT2023',52,19),('OCT2023',53,19),('OCT2023',54,19),('OCT2023',55,24),('OCT2023',56,24),('OCT2023',57,21),('OCT2023',58,21),('OCT2023',59,21),('OCT2023',65,22),('OCT2023',66,22),('OCT2023',69,25),('OCT2023',76,28),('OCT2023',83,30),('OCT2023',90,29),('OCT2023',100,27),('OCT2023',104,32),('OCT2024',40,31),('OCT2024',41,31),('OCT2024',42,31),('OCT2024',43,31),('OCT2024',44,20),('OCT2024',50,23),('OCT2024',51,23),('OCT2024',52,23),('OCT2024',53,23),('OCT2024',54,19),('OCT2024',55,24),('OCT2024',56,24),('OCT2024',57,24),('OCT2024',58,24),('OCT2024',59,21),('OCT2024',65,22),('OCT2024',66,22),('OCT2024',67,22),('OCT2024',68,22),('OCT2024',69,25),('OCT2024',71,25),('OCT2024',76,28),('OCT2024',77,28),('OCT2024',78,28),('OCT2024',85,30),('OCT2024',90,29),('OCT2024',91,29),('OCT2024',92,29),('OCT2024',94,26),('OCT2024',95,26),('OCT2024',100,27),('OCT2024',101,27),('OCT2024',102,27),('OCT2024',104,32),('OCT2024',105,32),('OCT2024',106,32),('OCT2024',108,34),('OCT2024',109,34),('OCT2024',112,33),('OCT2025',40,31),('OCT2025',41,31),('OCT2025',42,31),('OCT2025',43,31),('OCT2025',50,23),('OCT2025',51,23),('OCT2025',52,23),('OCT2025',53,23),('OCT2025',55,24),('OCT2025',56,24),('OCT2025',57,24),('OCT2025',58,24),('OCT2025',65,22),('OCT2025',66,22),('OCT2025',67,22),('OCT2025',68,22),('OCT2025',69,25),('OCT2025',70,25),('OCT2025',71,25),('OCT2025',72,25),('OCT2025',76,28),('OCT2025',77,28),('OCT2025',78,28),('OCT2025',79,28),('OCT2025',83,30),('OCT2025',84,30),('OCT2025',86,30),('OCT2025',90,29),('OCT2025',91,29),('OCT2025',92,29),('OCT2025',93,29),('OCT2025',94,26),('OCT2025',95,26),('OCT2025',98,26),('OCT2025',99,26),('OCT2025',100,27),('OCT2025',101,27),('OCT2025',102,27),('OCT2025',103,27),('OCT2025',104,32),('OCT2025',105,32),('OCT2025',106,32),('OCT2025',107,32),('OCT2025',108,34),('OCT2025',109,34),('OCT2025',110,34),('OCT2025',111,34),('OCT2025',112,33),('OCT2025',113,33),('OCT2025',114,33);
/*!40000 ALTER TABLE `mallas_periodos` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `modalidades`
LOCK TABLES `modalidades` WRITE;
/*!40000 ALTER TABLE `modalidades` DISABLE KEYS */;
INSERT INTO `modalidades` VALUES (1,'PRESENCIAL','P','Presencial'),(2,'EN LINEA','L','En linea'),(3,'HIBRIDA','H','Hibrida'),(4,'SEMIPRESENCIAL','S','Semipresencial');
/*!40000 ALTER TABLE `modalidades` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `modalidades_carreras`
LOCK TABLES `modalidades_carreras` WRITE;
/*!40000 ALTER TABLE `modalidades_carreras` DISABLE KEYS */;
INSERT INTO `modalidades_carreras` VALUES (1,9,1,1),(2,9,2,1),(3,14,1,1),(4,7,1,1),(5,15,1,1),(6,4,2,1),(8,13,3,1),(9,12,2,1),(10,18,4,1),(11,17,2,1),(12,21,4,1),(13,19,4,1),(14,16,2,1),(15,10,1,1),(16,20,4,1);
/*!40000 ALTER TABLE `modalidades_carreras` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `modalidades_ofertas`
LOCK TABLES `modalidades_ofertas` WRITE;
/*!40000 ALTER TABLE `modalidades_ofertas` DISABLE KEYS */;
INSERT INTO `modalidades_ofertas` VALUES (1,'PRESENCIAL'),(2,'HIBRIDA'),(3,'A DISTANCIA');
/*!40000 ALTER TABLE `modalidades_ofertas` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `nacionalidades`
LOCK TABLES `nacionalidades` WRITE;
/*!40000 ALTER TABLE `nacionalidades` DISABLE KEYS */;
INSERT INTO `nacionalidades` VALUES (1,'TSACHILA',0),(2,'WAORANI',0),(3,'ZAPARA',0),(4,'ANDOA',0),(5,'KICHWA',0),(6,'PASTOS',0),(7,'NO APLICA',1),(8,'NO REGISTRA',0);
/*!40000 ALTER TABLE `nacionalidades` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `niveles_academicos`
LOCK TABLES `niveles_academicos` WRITE;
/*!40000 ALTER TABLE `niveles_academicos` DISABLE KEYS */;
INSERT INTO `niveles_academicos` VALUES (1,'TERCER NIVEL'),(2,'CUARTO NIVEL');
/*!40000 ALTER TABLE `niveles_academicos` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `ofertas_carreras`
LOCK TABLES `ofertas_carreras` WRITE;
/*!40000 ALTER TABLE `ofertas_carreras` DISABLE KEYS */;
INSERT INTO `ofertas_carreras` VALUES (1,7,10),(3,9,9),(5,10,6),(6,11,7),(7,12,10),(8,13,14),(9,14,20),(19,15,20),(20,16,20),(21,17,20);
/*!40000 ALTER TABLE `ofertas_carreras` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `paises`
LOCK TABLES `paises` WRITE;
/*!40000 ALTER TABLE `paises` DISABLE KEYS */;
INSERT INTO `paises` VALUES (1,'Afganistán','afgano/a',0),(2,'Albania','albanés/albanesa',0),(3,'Alemania','alemán/alemana',0),(4,'Andorra','andorrano/a',0),(5,'Angola','angoleño/a',0),(6,'Antigua y Barbuda','antiguano-barbudense',0),(7,'Arabia Saudita','saudí',0),(8,'Argelia','argelino/a',0),(9,'Argentina','argentino/a',0),(10,'Armenia','armenio/a',0),(11,'Australia','australiano/a',0),(12,'Austria','austriaco/a',0),(13,'Azerbaiyán','azerbaiyano/a',0),(14,'Bahamas','bahameño/a',0),(15,'Bangladés','bangladesí',0),(16,'Barbados','barbadense',0),(17,'Baréin','bareiní',0),(18,'Bélgica','belga',0),(19,'Belice','beliceño/a',0),(20,'Benín','beninés/beninesa',0),(21,'Bielorrusia','bielorruso/a',0),(22,'Birmania (Myanmar)','myanmareño/a',0),(23,'Bolivia','boliviano/a',0),(24,'Bosnia y Herzegovina','bosnio/a',0),(25,'Botsuana','botsuano/a',0),(26,'Brasil','brasileño/a',0),(27,'Brunéi','bruneano/a',0),(28,'Bulgaria','búlgaro/a',0),(29,'Burkina Faso','burkinés/burkinesa',0),(30,'Burundi','burundés/burundesa',0),(31,'Bután','butanés/butanesa',0),(32,'Cabo Verde','caboverdiano/a',0),(33,'Camboya','camboyano/a',0),(34,'Camerún','camerunés/camerunesa',0),(35,'Canadá','canadiense',0),(36,'Catar','catarí',0),(37,'Chad','chadiano/a',0),(38,'Chile','chileno/a',0),(39,'China','chino/a',0),(40,'Chipre','chipriota',0),(41,'Colombia','colombiano/a',0),(42,'Comoras','comorense',0),(43,'Congo','congoleño/a',0),(44,'Corea del Norte','norcoreano/a',0),(45,'Corea del Sur','surcoreano/a',0),(46,'Costa de Marfil','marfileño/a',0),(47,'Costa Rica','costarricense',0),(48,'Croacia','croata',0),(49,'Cuba','cubano/a',0),(50,'Dinamarca','danés/danesa',0),(51,'Dominica','dominiqués/dominiquesa',0),(52,'Ecuador','ecuatoriano/a',1),(53,'Egipto','egipcio/a',0),(54,'El Salvador','salvadoreño/a',0),(55,'Emiratos Árabes Unidos','emiratí',0),(56,'Eritrea','eritreo/a',0),(57,'Eslovaquia','eslovaco/a',0),(58,'Eslovenia','esloveno/a',0),(59,'España','español/a',0),(60,'Estados Unidos','estadounidense',0),(61,'Estonia','estonio/a',0),(62,'Esuatini','suazi',0),(63,'Etiopía','etíope',0),(64,'Fiyi','fiyiano/a',0),(65,'Filipinas','filipino/a',0),(66,'Finlandia','finlandés/finlandesa',0),(67,'Francia','francés/francesa',0),(68,'Gabón','gabonés/gabonesa',0),(69,'Gambia','gambiano/a',0),(70,'Georgia','georgiano/a',0),(71,'Ghana','ghanés/ghanesa',0),(72,'Granada','granadino/a',0),(73,'Grecia','griego/a',0),(74,'Guatemala','guatemalteco/a',0),(75,'Guyana','guyanés/guyanesa',0),(76,'Guinea','guineano/a',0),(77,'Guinea-Bisáu','guineano-bisauano/a',0),(78,'Guinea Ecuatorial','ecuatoguineano/a',0),(79,'Haití','haitiano/a',0),(80,'Honduras','hondureño/a',0),(81,'Hungría','húngaro/a',0),(82,'India','indio/a',0),(83,'Indonesia','indonesio/a',0),(84,'Irak','iraquí',0),(85,'Irán','iraní',0),(86,'Irlanda','irlandés/irlandesa',0),(87,'Islandia','islandés/islandesa',0),(88,'Islas Marshall','marshalés/marshalesa',0),(89,'Islas Salomón','salomonense',0),(90,'Israel','israelí',0),(91,'Italia','italiano/a',0),(92,'Jamaica','jamaicano/a',0),(93,'Japón','japonés/japonesa',0),(94,'Jordania','jordano/a',0),(95,'Kazajistán','kazajo/a',0),(96,'Kenia','keniano/a',0),(97,'Kirguistán','kirguís',0),(98,'Kiribati','kiribatiano/a',0),(99,'Kuwait','kuwaití',0),(100,'Laos','laosiano/a',0),(101,'Lesoto','lesotense',0),(102,'Letonia','letón/letona',0),(103,'Líbano','libanés/libanesa',0),(104,'Liberia','liberiano/a',0),(105,'Libia','libio/a',0),(106,'Liechtenstein','liechtensteiniano/a',0),(107,'Lituania','lituano/a',0),(108,'Luxemburgo','luxemburgués/luxemburguesa',0),(109,'Macedonia del Norte','macedonio/a',0),(110,'Madagascar','malgache',0),(111,'Malasia','malasio/a',0),(112,'Malaui','malauí',0),(113,'Maldivas','maldivo/a',0),(114,'Malí','maliense',0),(115,'Malta','maltés/maltesa',0),(116,'Marruecos','marroquí',0),(117,'Mauricio','mauriciano/a',0),(118,'Mauritania','mauritano/a',0),(119,'México','mexicano/a',0),(120,'Micronesia','micronesio/a',0),(121,'Moldavia','moldavo/a',0),(122,'Mónaco','monegasco/a',0),(123,'Mongolia','mongol/mongola',0),(124,'Montenegro','montenegrino/a',0),(125,'Mozambique','mozambiqueño/a',0),(126,'Namibia','namibio/a',0),(127,'Nauru','nauruano/a',0),(128,'Nepal','nepalí',0),(129,'Nicaragua','nicaragüense',0),(130,'Níger','nigerino/a',0),(131,'Nigeria','nigeriano/a',0),(132,'Noruega','noruego/a',0),(133,'Nueva Zelanda','neozelandés/neozelandesa',0),(134,'Omán','omaní',0),(135,'Países Bajos','neerlandés/neerlandesa',0),(136,'Pakistán','paquistaní',0),(137,'Palaos','palaosiano/a',0),(138,'Palestina','palestino/a',0),(139,'Panamá','panameño/a',0),(140,'Papúa Nueva Guinea','papú',0),(141,'Paraguay','paraguayo/a',0),(142,'Perú','peruano/a',0),(143,'Polonia','polaco/a',0),(144,'Portugal','portugués/portuguesa',0),(145,'Reino Unido','británico/a',0),(146,'República Centroafricana','centroafricano/a',0),(147,'República Checa','checo/a',0),(148,'República Democrática del Congo','congoleño/a',0),(149,'República Dominicana','dominicano/a',0),(150,'Ruanda','ruandés/ruandesa',0),(151,'Rumania','rumano/a',0),(152,'Rusia','ruso/a',0),(153,'Samoa','samoano/a',0),(154,'San Cristóbal y Nieves','kittiano/nevisiano',0),(155,'San Marino','sanmarinense',0),(156,'San Vicente y las Granadinas','sanvicentino/a',0),(157,'Santa Lucía','santalucense',0),(158,'Santo Tomé y Príncipe','santotomense',0),(159,'Senegal','senegalés/senegalesa',0),(160,'Serbia','serbio/a',0),(161,'Seychelles','seychellense',0),(162,'Sierra Leona','sierraleonés/sierraleonesa',0),(163,'Singapur','singapurense',0),(164,'Siria','sirio/a',0),(165,'Somalia','somalí',0),(166,'Sri Lanka','srilanqués/srilanquesa',0),(167,'Sudáfrica','sudafricano/a',0),(168,'Sudán','sudanés/sudanesa',0),(169,'Sudán del Sur','sursudanés/sursudanesa',0),(170,'Suecia','sueco/a',0),(171,'Suiza','suizo/a',0),(172,'Surinam','surinamés/surinamesa',0),(173,'Tailandia','tailandés/tailandesa',0),(174,'Tanzania','tanzano/a',0),(175,'Tayikistán','tayiko/a',0),(176,'Timor Oriental','timorense',0),(177,'Togo','togolés/togolesa',0),(178,'Tonga','tongano/a',0),(179,'Trinidad y Tobago','trinitense',0),(180,'Túnez','tunecino/a',0),(181,'Turkmenistán','turcomano/a',0),(182,'Turquía','turco/a',0),(183,'Tuvalu','tuvaluano/a',0),(184,'Ucrania','ucraniano/a',0),(185,'Uganda','ugandés/ugandesa',0),(186,'Uruguay','uruguayo/a',0),(187,'Uzbekistán','uzbeko/a',0),(188,'Vanuatu','vanuatuense',0),(189,'Vaticano','vaticano/a',0),(190,'Venezuela','venezolano/a',0),(191,'Vietnam','vietnamita',0),(192,'Yemen','yemení',0),(193,'Yibuti','yibutiano/a',0),(194,'Zambia','zambiano/a',0),(195,'Zimbabue','zimbabuense',0);
/*!40000 ALTER TABLE `paises` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `parametros`
LOCK TABLES `parametros` WRITE;
/*!40000 ALTER TABLE `parametros` DISABLE KEYS */;
INSERT INTO `parametros` VALUES ('ISTPET','INSTITUTO SUPERIOR MAYOR PEDRO TRAVERSARI',NULL,'MSC. GIOVANNY NARANJO PAREDES',NULL,NULL,NULL,NULL,1,1);
/*!40000 ALTER TABLE `parametros` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `parciales`
LOCK TABLES `parciales` WRITE;
/*!40000 ALTER TABLE `parciales` DISABLE KEYS */;
INSERT INTO `parciales` VALUES (1,'Primer','2022-12-13','2022-12-16',0,0,0,0),(2,'Segundo','2023-08-22','2023-08-28',0,0,0,0),(3,'Examen Final','2023-03-06','2023-03-21',0,0,0,0),(4,'Remedial','2025-01-31','2025-01-29',0,0,0,0);
/*!40000 ALTER TABLE `parciales` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `parciales_modalidades`
LOCK TABLES `parciales_modalidades` WRITE;
/*!40000 ALTER TABLE `parciales_modalidades` DISABLE KEYS */;
INSERT INTO `parciales_modalidades` VALUES (1,1,1),(2,1,1),(3,1,1),(3,2,1);
/*!40000 ALTER TABLE `parciales_modalidades` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `parciales_modalidades_fechas`
LOCK TABLES `parciales_modalidades_fechas` WRITE;
/*!40000 ALTER TABLE `parciales_modalidades_fechas` DISABLE KEYS */;
INSERT INTO `parciales_modalidades_fechas` VALUES ('ABR2023',1,1,'2023-07-27','2023-09-04',1),('ABR2023',2,1,'2023-08-22','2023-09-04',1),('ABR2023',3,1,'2023-08-30','2023-09-04',1),('ABR2023',1,2,'2023-07-27','2023-07-28',1),('OCT2023',1,2,'2024-03-09','2024-04-01',1),('OCT2023',2,2,'2024-03-09','2024-04-01',1),('OCT2023',3,2,'2024-03-09','2024-04-01',1),('OCT2023',1,1,'2024-01-04','2024-01-11',1),('OCT2023',1,3,'2024-01-04','2024-01-18',1),('OCT2023',2,4,'2024-01-04','2024-03-26',1),('OCT2023',1,4,'2024-01-04','2024-03-26',1),('OCT2023',3,4,'2024-03-21','2024-03-26',1),('OCT2023',2,3,'2024-01-17','2024-01-18',1),('OCT2023',3,3,'2024-01-17','2024-01-18',1),('OCT2023',2,1,'2024-03-06','2024-03-22',1),('OCT2023',3,1,'2024-03-13','2024-04-01',1),('ABR2024',1,1,'2024-06-17','2024-07-25',1),('ABR2024',2,1,'2024-08-20','2024-08-23',1),('ABR2024',3,1,'2024-08-27','2024-09-02',1),('OCT2024',1,1,'2025-02-23','2025-02-28',1),('OCT2024',3,1,'2025-03-13','2025-03-18',1),('OCT2024',2,1,'2025-03-06','2025-03-10',1),('ABR2025',1,1,'2025-06-30','2025-07-04',1),('ABR2025',2,1,'2025-08-22','2025-08-26',1),('ABR2025',3,1,'2025-09-03','2025-09-08',1),('OCT2025',1,1,'2026-01-07','2026-01-29',1),('OCT2025',2,1,'2026-03-03','2026-03-09',1),('OCT2025',3,1,'2026-03-16','2026-03-18',1),('ABR2026',1,1,'2026-07-01','2026-07-07',1),('ABR2026',2,1,'2026-09-02','2026-09-07',1),('ABR2026',3,1,'2026-09-09','2026-09-14',1);
/*!40000 ALTER TABLE `parciales_modalidades_fechas` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `parroquias`
LOCK TABLES `parroquias` WRITE;
/*!40000 ALTER TABLE `parroquias` DISABLE KEYS */;
INSERT INTO `parroquias` VALUES (1447,403,'BAÑOS'),(1448,403,'CHAUCHA'),(1449,403,'CHECA (JIDCAY)'),(1450,403,'CHIQUINTAD'),(1451,403,'CUENCA'),(1452,403,'CUMBE'),(1453,403,'LLACAO'),(1454,403,'MOLLETURO'),(1455,403,'NULTI'),(1456,403,'OCTAVIO CORDERO PALACIOS (STA. ROSA)'),(1457,403,'PACCHA'),(1458,403,'QUINGEO'),(1459,403,'RICAURTE'),(1460,403,'SAN JOAQUIN'),(1461,403,'SANTA ANA'),(1462,403,'SAYAUSI'),(1463,403,'SIDCAY'),(1464,403,'SININCAY'),(1465,403,'TARQUI'),(1466,403,'TURI'),(1467,403,'VALLE'),(1468,403,'VICTORIA DEL PORTETE (IRQUIS)'),(1469,404,'EL PAN'),(1470,404,'SAN VICENTE'),(1471,405,'CALUMA'),(1472,406,'CHILLANES'),(1473,406,'SAN JOSE DEL TAMBO (TAMBOPAMBA)'),(1474,407,'ASUNCION (ASANCOTO)'),(1475,407,'MAGDALENA (CHAPACOTO)'),(1476,407,'SAN JOSE DE CHIMBO'),(1477,407,'SAN SEBASTIAN'),(1478,407,'TELIMBELA'),(1479,408,'ECHEANDIA'),(1480,409,'FACUNDO VELA'),(1481,409,'GUARANDA'),(1482,409,'JULIO MORENO (CATANAHUAN GRANDE)'),(1483,409,'SALINAS'),(1484,409,'SAN LORENZO'),(1485,409,'SAN LUIS DE PAMBIL'),(1486,409,'SAN SIMON (YACOTO)'),(1487,409,'SANTA FE (SANTA FE)'),(1488,409,'SIMIATUG'),(1489,410,'LAS NAVES'),(1490,411,'BALSAPAMBA'),(1491,411,'BILOVAN'),(1492,411,'REGULO DE MORA'),(1493,411,'SAN MIGUEL'),(1494,411,'SAN PABLO (SAN PABLO DE ATENAS)'),(1495,411,'SAN VICENTE'),(1496,411,'SANTIAGO'),(1497,412,'AZOGUES'),(1498,412,'COJITAMBO'),(1499,412,'GUAPAN'),(1500,412,'JAVIER LOYOLA (CHUQUIPATA)'),(1501,412,'LUIS CORDERO'),(1502,412,'PINDILIG'),(1503,412,'RIVERA'),(1504,412,'SAN MIGUEL'),(1505,412,'TADAY'),(1506,413,'BIBLIAN'),(1507,413,'JERUSALEN'),(1508,413,'NAZON (CAB. EN PAMPA DE DOMINGUEZ)'),(1509,413,'SAN FRANCISCO DE SAGEO'),(1510,413,'TURUPAMBA'),(1511,414,'CAÑAR'),(1512,414,'CHONTAMARCA'),(1513,414,'CHOROCOPTE'),(1514,414,'DUCUR'),(1515,414,'GENERAL MORALES (SOCARTE)'),(1516,414,'GUALLETURO'),(1517,414,'HONORATO VASQUEZ (TAMBO VIEJO)'),(1518,414,'INGAPIRCA'),(1519,414,'JUNCAL'),(1520,414,'SAN ANTONIO'),(1521,414,'VENTURA'),(1522,414,'ZHUD'),(1523,415,'DELEG'),(1524,415,'SOLANO'),(1525,416,'EL TAMBO'),(1526,417,'LA TRONCAL'),(1527,418,'SUSCAL'),(1528,419,'EL ANGEL'),(1529,419,'EL GOALTAL'),(1530,419,'LA LIBERTAD (ALIZO)'),(1531,419,'SAN ISIDRO'),(1532,420,'CONCEPCION'),(1533,420,'JIJON Y CAAMAÑO (CAB. EN RIO BLANCO)'),(1534,420,'JUAN MONTALVO (SAN IGNACIO DE QUIL)'),(1535,420,'MIRA (CHONTAHUASI)'),(1536,421,'EL CHICAL'),(1537,421,'MALDONADO'),(1538,421,'TOBAR DONOSO (LA BOCANA DE CAMUMBI)'),(1539,421,'TUFIÑO'),(1540,422,'ACHUPALLAS'),(1541,422,'ALAUSI'),(1542,422,'GUASUNTOS'),(1543,422,'HUIGRA'),(1544,422,'MULTITUD'),(1545,422,'PISTISHI (NARIZ DEL DIABLO)'),(1546,422,'PUMALLACTA'),(1547,422,'SEVILLA'),(1548,422,'SIBAMBE'),(1549,422,'TIXAN'),(1550,423,'CHAMBO'),(1551,424,'CAPZOL'),(1552,424,'CHUNCHI'),(1553,424,'COMPUD'),(1554,424,'GONZOL'),(1555,424,'LLAGOS'),(1556,425,'CAÑI'),(1557,425,'COLUMBE'),(1558,425,'JUAN DE VELASCO (PANGOR)'),(1559,425,'SANTIAGO DE QUITO (CAB. EN SAN ANTONIO DE QUITO)'),(1560,425,'VILLA LA UNION (CAJABAMBA)'),(1561,426,'CUMANDA'),(1562,427,'ACHUPALLAS'),(1563,427,'CEBADAS'),(1564,427,'GUAMOTE'),(1565,427,'PALMIRA'),(1566,428,'GUANANDO'),(1567,428,'GUANO'),(1568,428,'ILAPO'),(1569,428,'LA PROVIDENCIA'),(1570,428,'SAN ANDRES'),(1571,428,'SAN ISIDRO DE PATULU'),(1572,428,'SAN JOSE DEL CHAZO'),(1573,428,'SANTA FE DE GALAN'),(1574,428,'VALPARAISO'),(1575,429,'PALLATANGA'),(1576,430,'BILBAO (CAB. EN QUILLUYACU)'),(1577,430,'EL ALTAR'),(1578,430,'LA CANDELARIA'),(1579,430,'MATUS'),(1580,430,'PENIPE'),(1581,430,'PUELA'),(1582,430,'SAN ANTONIO DE BAYUSHIG'),(1583,431,'CACHA (CAB. EN MACHANGARA)'),(1584,431,'CALPI'),(1585,431,'FLORES'),(1586,431,'LICAN'),(1587,431,'LICTO'),(1588,431,'PUNGALA'),(1589,431,'PUNIN'),(1590,431,'QUIMIAG'),(1591,431,'RIOBAMBA'),(1592,431,'SAN JUAN'),(1593,431,'SAN LUIS'),(1594,432,'GUASAGANDA (CAB. EN GUASAGANDA CENTRO)'),(1595,432,'LA MANA'),(1596,432,'PUCAYACU'),(1597,433,'ALAQUES (ALAQUEZ)'),(1598,433,'BELISARIO QUEVEDO (GUANAILIN)'),(1599,433,'GUAITACAMA (GUAYTACAMA)'),(1600,433,'LATACUNGA'),(1601,433,'MULALO'),(1602,433,'POALO'),(1603,433,'SAN JUAN DE PASTOCALLE'),(1604,433,'TANICUCHI'),(1605,433,'TOACASO'),(1606,433,'11 DE NOVIEMBRE (ILINCHISI)'),(1607,434,'EL CORAZON'),(1608,434,'MORASPUNGO'),(1609,434,'PINLLOPATA'),(1610,434,'RAMON CAMPAÑA'),(1611,435,'ANGAMARCA'),(1612,435,'GUANGAJE'),(1613,435,'LA VICTORIA'),(1614,435,'PILALO'),(1615,435,'PUJILI'),(1616,435,'TINGO'),(1617,435,'ZUMBAHUA'),(1618,436,'ANTONIO JOSE HOLGUIN (SANTA LUCIA)'),(1619,436,'CUSUBAMBA'),(1620,436,'MULALILLO'),(1621,436,'MULLIQUINDIL (SANTA ANA)'),(1622,436,'PANSALEO'),(1623,436,'SAN MIGUEL'),(1624,437,'CANCHAGUA'),(1625,437,'COCHAPAMBA'),(1626,437,'SAQUISILI'),(1627,438,'CHUGCHILLAN'),(1628,438,'ISINLIVI'),(1629,438,'LAS PAMPAS'),(1630,438,'PALO QUEMADO'),(1631,438,'SIGCHOS'),(1632,439,'ARENILLAS'),(1633,439,'CARCABON'),(1634,439,'CHACRAS'),(1635,439,'PALMALES'),(1636,440,'AYAPAMBA'),(1637,440,'CORDONCILLO'),(1638,440,'MILAGRO'),(1639,440,'PACCHA'),(1640,440,'SAN JOSE'),(1641,440,'SAN JUAN DE CERRO AZUL'),(1642,441,'BALSAS'),(1643,441,'BELLAMARIA'),(1644,442,'CHILLA'),(1645,443,'EL GUABO'),(1646,443,'LA IBERIA'),(1647,443,'RIO BONITO'),(1648,443,'TENDALES (CAB. EN PUERTO TENDALES)'),(1649,444,'HUAQUILLAS'),(1650,445,'EL PARAISO'),(1651,445,'LA LIBERTAD'),(1652,445,'LA VICTORIA'),(1653,445,'SAN ISIDRO'),(1654,446,'MACHALA'),(1655,447,'EL INGENIO'),(1656,447,'MARCABELI'),(1657,448,'BUENAVISTA'),(1658,448,'CAÑAQUEMADA'),(1659,448,'CASACAY'),(1660,448,'LA PEAÑA'),(1661,448,'PASAJE'),(1662,448,'PROGRESO'),(1663,448,'UZHCURRUMI'),(1664,449,'CAPIRO (CAB. EN LA CAPILLA DE CAPIRO)'),(1665,449,'LA BOCANA'),(1666,449,'MOROMORO (CAB. EN EL VADO)'),(1667,449,'PIEDRAS'),(1668,449,'PIÑAS'),(1669,449,'SAN ROQUE (AMBROSIO MALDONADO)'),(1670,449,'SARACAY'),(1671,450,'CURTINCAPA'),(1672,450,'MORALES'),(1673,450,'PORTOVELO'),(1674,450,'SALATI'),(1675,451,'BELLAMARIA'),(1676,451,'BELLAVISTA'),(1677,451,'LA AVANZADA'),(1678,451,'SAN ANTONIO'),(1679,451,'SANTA ROSA'),(1680,451,'TORATA'),(1681,451,'VICTORIA'),(1682,452,'ABAÑIN'),(1683,452,'ARCAPAMBA'),(1684,452,'GUANAZAN'),(1685,452,'GUIZHAGUIÑA'),(1686,452,'HUERTAS'),(1687,452,'MALVAS'),(1688,452,'MULUNCAY GRANDE'),(1689,452,'SALVIAS'),(1690,452,'SINSAO'),(1691,452,'ZARUMA'),(1692,453,'ATACAMES'),(1693,453,'TONCHIGUE'),(1694,454,'ATAHUALPA (CAB. EN CAMARONES)'),(1695,454,'BORBON'),(1696,454,'LUIS VARGAS TORRES (CAB. EN PLAYA DE ORO)'),(1697,454,'MALDONADO'),(1698,454,'SAN JOSE DE CAYAPAS'),(1699,454,'SANTA LUCIA DE LAS PEÑAS'),(1700,454,'SANTO DOMINGO DE ONZOLE'),(1701,454,'SELVA ALEGRE'),(1702,454,'TELEMBI'),(1703,454,'TIMBIRE'),(1704,455,'CAMARONES (CAB. EN SAN VICENTE)'),(1705,455,'ESMERALDAS'),(1706,455,'SAN MATEO'),(1707,455,'TACHINA'),(1708,456,'DAULE'),(1709,456,'GALERA'),(1710,456,'MUISNE'),(1711,456,'SAN GREGORIO'),(1712,456,'SAN JOSE DE CHAMANGA'),(1713,457,'CHURA (CHANCAMA) (CAB. EN EL YERBERO)'),(1714,457,'CUBE'),(1715,457,'LA UNION'),(1716,457,'MALIMPIA'),(1717,457,'ROSA ZARATE (QUININDE)'),(1718,458,'LAGARTO'),(1719,458,'MONTALVO (CAB EN HORQUETA)'),(1720,458,'RIOVERDE'),(1721,458,'ROCAFUERTE'),(1722,459,'ALTO TAMBO (CAB EN GUADUAL)'),(1723,459,'CALDERON'),(1724,459,'CONCEPCION'),(1725,459,'URBINA'),(1726,459,'5 DE JUNIO (CAB. EN UIMBI)'),(1727,460,'ELOY ALFARO (DURAN)'),(1728,461,'EL TRIUNFO'),(1729,462,'GENERAL ANTONIO ELIZALDE (BUCAY)'),(1730,463,'GUAYAQUIL'),(1731,463,'JUAN GOMEZ RENDON (PROGRESO)'),(1732,463,'MORRO'),(1733,463,'POSORJA'),(1734,463,'PUNA'),(1735,464,'JESUS MARIA'),(1736,464,'NARANJAL'),(1737,464,'SAN CARLOS'),(1738,464,'SANTA ROSA DE FLANDES'),(1739,464,'TAURA'),(1740,465,'GENERAL VILLAMIL (PLAYAS)'),(1741,466,'TARIFA'),(1742,467,'ATUNTAQUI'),(1743,467,'SAN ROQUE'),(1744,468,'APUELA'),(1745,468,'COTACACHI'),(1746,468,'GARCIA MORENO (LLURIMAGUA)'),(1747,468,'IMANTAG'),(1748,468,'PEÑAHERRERA'),(1749,468,'PLAZA GUTIERREZ (CALVARIO)'),(1750,468,'QUIROGA'),(1751,468,'VACAS GALINDO (EL CHURO) (CAB. EN SAN MIGUEL ALTO)'),(1752,468,'6 DE JULIO DE CUELLAJE (CAB. EN CUELLAJE)'),(1753,469,'AMBUQUI'),(1754,469,'ANGOCHAGUA'),(1755,469,'CAROLINA'),(1756,469,'LA ESPERANZA'),(1757,469,'LITA'),(1758,469,'SALINAS'),(1759,469,'SAN ANTONIO'),(1760,469,'SAN MIGUEL DE IBARRA'),(1761,470,'DOCTOR MIGUEL EGAS CABEZAS (PEGUCHE)'),(1762,470,'EUGENIO ESPEJO (CALPAQUI)'),(1763,470,'GONZALEZ SUAREZ'),(1764,470,'OTAVALO'),(1765,470,'PATAQUI'),(1766,470,'SAN JOSE DE QUICHINCHE'),(1767,470,'SAN JUAN DE ILUMAN'),(1768,470,'SAN PABLO'),(1769,470,'SAN RAFAEL'),(1770,470,'SELVA ALEGRE (CAB. EN SAN MIGUEL DE PAMPLONA)'),(1771,471,'MARIANO ACOSTA'),(1772,471,'PIMAMPIRO'),(1773,471,'SAN FRANCISCO DE SIGSIPAMBA'),(1774,472,'CAHUASQUI'),(1775,472,'LA MERCED DE BUENOS AIRES'),(1776,472,'PABLO ARENAS'),(1777,472,'SAN BLAS'),(1778,472,'TUMBABIRO'),(1779,472,'URCUQUI'),(1780,473,'CARIAMANGA'),(1781,473,'COLAISACA'),(1782,473,'EL LUCERO'),(1783,473,'SANGUILLIN'),(1784,473,'UTUANA'),(1785,474,'CATAMAYO (LA TOMA)'),(1786,474,'EL TAMBO'),(1787,474,'GUAYQUICHUMA'),(1788,474,'SAN PEDRO DE LA BENDITA'),(1789,474,'ZAMBI'),(1790,475,'CELICA'),(1791,475,'CRUZPAMBA (CAB EN CARLOS BUSTAMANTE)'),(1792,475,'POZUL (SAN JUAN DE POZUL)'),(1793,475,'SABANILLA'),(1794,475,'TENIENTE MAXIMILIANO RODRIGUEZ LOAIZA'),(1795,476,'AMARILLOS'),(1796,476,'BUENAVISTA'),(1797,476,'CHAGUARPAMBA'),(1798,476,'EL ROSARIO'),(1799,476,'SANTA RUFINA'),(1800,477,'AMALUZA'),(1801,477,'BELLAVISTA'),(1802,477,'EL AIRO'),(1803,477,'EL INGENIO'),(1804,477,'JIMBURA'),(1805,477,'SANTA TERESITA'),(1806,477,'27 DE ABRIL (CAB. EN LA NARANJA)'),(1807,478,'CHANGAIMINA (LA LIBERTAD)'),(1808,478,'GONZANAMA'),(1809,478,'NAMBACOLA'),(1810,478,'PURUNUMA (EGUIGUREN)'),(1811,478,'SACAPALCA'),(1812,479,'CHANTACO'),(1813,479,'CHUQUIRIBAMBA'),(1814,479,'EL CISNE'),(1815,479,'GUALEL'),(1816,479,'JIMBILLA'),(1817,479,'LOJA'),(1818,479,'MALACATOS (VALLADOLID)'),(1819,479,'QUINARA'),(1820,479,'SAN LUCAS'),(1821,479,'SAN PEDRO DE VILCABAMBA'),(1822,479,'SANTIAGO'),(1823,479,'TAQUIL (MIGUEL RIOFRIO)'),(1824,479,'VILCABAMBA (VICTORIA)'),(1825,479,'YANGANA (ARSENIO CASTILLO)'),(1826,480,'LA VICTORIA'),(1827,480,'LARAMA'),(1828,480,'MACARA'),(1829,480,'SABIANGO (LA CAPILLA)'),(1830,481,'LA TINGUE'),(1831,481,'OLMEDO'),(1832,482,'CANGONAMA'),(1833,482,'CASANGA'),(1834,482,'CATACOCHA'),(1835,482,'GUACHANAMA'),(1836,482,'LAURO GUERRERO'),(1837,482,'ORIANGA'),(1838,482,'SAN ANTONIO'),(1839,482,'YAMANA'),(1840,483,'CHAQUINAL'),(1841,483,'MILAGROS'),(1842,483,'PINDAL'),(1843,483,'12 DE DICIEMBRE (CAB. EN ACHIOTES)'),(1844,484,'ALAMOR'),(1845,484,'CIANO'),(1846,484,'EL ARENAL'),(1847,484,'EL LIMO (MARIANA DE JESUS)'),(1848,484,'MERCADILLO'),(1849,484,'VICENTINO'),(1850,485,'FUNDOCHAMBA'),(1851,485,'QUILANGA'),(1852,485,'SAN ANTONIO DE LAS ARADAS (CAB. EN LAS ARADAS)'),(1853,486,'EL PARAISO DE CELEN'),(1854,486,'EL TABLON'),(1855,486,'LLUZHAPA'),(1856,486,'MANU'),(1857,486,'NAMBACOLA'),(1858,486,'SAN ANTONIO DE QUMBE (CUMBE)'),(1859,486,'SAN LUCAS'),(1860,486,'SAN PABLO DE TENTA'),(1861,486,'SAN SEBASTIAN DE YULUC'),(1862,486,'SARAGURO'),(1863,486,'SELVA ALEGRE'),(1864,486,'SUMAYPAMBA'),(1865,486,'URDANETA (PAQUISHAPA)'),(1866,487,'NUEVA FATIMA'),(1867,487,'SOZORANGA'),(1868,487,'TACAMOROS'),(1869,488,'BOLASPAMBA'),(1870,488,'GARZAREAL'),(1871,488,'LIMONES'),(1872,488,'MANGAHURCO'),(1873,488,'PALETILLAS'),(1874,488,'ZAPOTILLO'),(1875,489,'ISLA DE BEJUCAL'),(1876,490,'FEBRES CORDERO (LAS JUNTAS)'),(1877,490,'LA UNION'),(1878,491,'PATRICIA PILAR'),(1879,492,'MONTALVO'),(1880,493,'QUINSALOMA'),(1881,494,'RICAURTE'),(1882,495,'VALENCIA'),(1883,496,'CHACARITA'),(1884,496,'LOS ANGELES'),(1885,496,'ZAPOTAL'),(1886,497,'QUIROGA'),(1887,498,'CHIBUNGA'),(1888,498,'ELOY ALFARO'),(1889,498,'SAN ANTONIO'),(1890,499,'EL CARMEN'),(1891,499,'SAN PEDRO DE SUMA'),(1892,500,'FLAVIO ALFARO'),(1893,500,'ZAPALLO'),(1894,501,'JAMA'),(1895,502,'EL ANEGADO (CAB. EN ELOY ALFARO)'),(1896,502,'JIPIJAPA'),(1897,502,'JULCUY'),(1898,502,'MEMBRILLAL'),(1899,502,'PEDRO PABLO GOMEZ'),(1900,502,'PUERTO DE CAYO'),(1901,503,'JUNIN'),(1902,504,'MANTA'),(1903,504,'SANTA MARIANITA (BOCA DE PACOCHE)'),(1904,505,'LA PILA'),(1905,505,'MONTECRISTI'),(1906,506,'COJIMIES'),(1907,506,'PEDERNALES'),(1908,506,'10 DE AGOSTO'),(1909,507,'PICHINCHA'),(1910,508,'CRUCITA'),(1911,508,'PORTOVIEJO'),(1912,508,'SAN PLACIDO'),(1913,509,'SALANGO'),(1914,510,'ROCAFUERTE'),(1915,511,'SAN VICENTE'),(1916,512,'BAHIA DE CARAQUEZ'),(1917,512,'CHARAPOTO'),(1918,512,'SAN ISIDRO'),(1919,513,'BACHILLERO'),(1920,513,'TOSAGUA'),(1921,514,'AMAZONAS (ROSARIO DE CUYES)'),(1922,514,'BERMEJOS'),(1923,514,'BOMBOIZA'),(1924,514,'CHIGUINDA'),(1925,514,'EL IDEAL'),(1926,514,'EL ROSARIO'),(1927,514,'GUALAQUIZA'),(1928,514,'NUEVA TARQUI'),(1929,514,'SAN MIGUEL DE CUYES'),(1930,515,'CHIGUAZA'),(1931,515,'HUAMBOYA'),(1932,516,'GENERAL LEONIDAS PLAZA GUTIERREZ'),(1933,516,'INDANZA'),(1934,516,'SAN ANTONIO (CAB EN SAN ANTONIO CENTRO)'),(1935,516,'SAN MIGUEL DE CONCHAY'),(1936,516,'STA SUSANA DE CHIVIAZA (CAB EN CHIVIAZA)'),(1937,516,'YUNGANZA (CAB EN EL ROSARIO)'),(1938,517,'LOGROÑO'),(1939,517,'SHIMPIS'),(1940,517,'YAUPI'),(1941,518,'ALSHI (CAB EN 9 DE OCTUBRE)'),(1942,518,'CUCHAENTZA'),(1943,518,'GENERAL PROAÑO'),(1944,518,'MACAS'),(1945,518,'RIO BLANCO'),(1946,518,'SAN ISIDRO'),(1947,518,'SEVILLA DON BOSCO'),(1948,518,'SINAI'),(1949,518,'ZUÑA (ZUÑAC)'),(1950,519,'PABLO SEXTO'),(1951,520,'ARAPICOS'),(1952,520,'CUMANDA (CAB EN COLONIA AGRICOLA SEVILLA DEL ORO)'),(1953,520,'PALORA (METZERA)'),(1954,520,'SANGAY (CAB EN NAYAMANACA)'),(1955,520,'16 DE AGOSTO'),(1956,521,'PAN DE AZUCAR'),(1957,521,'SAN JACINTO DE WAKAMBEIS'),(1958,521,'SAN JUAN BOSCO'),(1959,521,'SANTIAGO DE PANANZA'),(1960,522,'CHUPIANZA'),(1961,522,'COPAL'),(1962,522,'PATUCA'),(1963,522,'SAN FRANCISCO DE CHINIMBIMI'),(1964,522,'SAN LUIS DE EL ACHO (CAB EN EL ACHO)'),(1965,522,'SANTIAGO DE MENDEZ'),(1966,522,'TAYUZA'),(1967,523,'ASUNCION'),(1968,523,'HUAMBI'),(1969,523,'SANTA MARIANITA DE JESUS'),(1970,523,'SUCUA'),(1971,524,'MACUMA'),(1972,524,'TAISHA'),(1973,524,'TUUTINENTZA'),(1974,525,'SAN JOSE DE MORONA'),(1975,525,'SANTIAGO'),(1976,526,'ARCHIDONA'),(1977,526,'COTUNDO'),(1978,526,'SAN PABLO DE USHPAYACU'),(1979,527,'CARLOS JULIO AROSEMENA TOLA'),(1980,528,'EL CHACO'),(1981,528,'GONZALO DIAZ DE PINEDA (EL BOMBON)'),(1982,528,'LINARES'),(1983,528,'OYACACHI'),(1984,528,'SANTA ROSA'),(1985,528,'SARDINAS'),(1986,529,'BAEZA'),(1987,529,'COSANGA'),(1988,529,'CUYUJA'),(1989,529,'PAPALLACTA'),(1990,529,'SAN FRANCISCO DE BORJA (VIRGILIO DAVILA)'),(1991,529,'SUMACO'),(1992,530,'AHUANO'),(1993,530,'CHONTAPUNTA'),(1994,530,'PANO'),(1995,530,'PUERTO MISAHUALLI'),(1996,530,'PUERTO NAPO'),(1997,530,'TALAG'),(1998,530,'TENA'),(1999,531,'RUMIPAMBA'),(2000,531,'SAN SEBASTIAN DEL COCA'),(2001,532,'AVILA (CAB. EN HUIRUNO)'),(2002,532,'LORETO'),(2003,532,'PUERTO MURIALDO'),(2004,532,'SAN JOSE DE DAHUANO'),(2005,532,'SAN JOSE DE PAYAMINO'),(2006,532,'SAN VICENTE DE HUATICOCHA'),(2007,533,'GARCIA MORENO'),(2008,533,'LA BELLEZA'),(2009,533,'NUEVO PARAISO (CAB. EN UNION )'),(2010,533,'SAN JOSE DE GUAYUSA'),(2011,533,'SAN LUIS DE ARMENIA'),(2012,534,'ARAJUNO'),(2013,534,'CURARAY'),(2014,535,'MADRE TIERRA'),(2015,535,'MERA'),(2016,535,'SHELL'),(2017,536,'CANELOS'),(2018,536,'DIEZ DE AGOSTO'),(2019,536,'EL TRIUNFO'),(2020,536,'FATIMA'),(2021,536,'POMONA'),(2022,536,'PUYO'),(2023,536,'SIMON BOLIVAR (CAB. EN MUSHULLACTA)'),(2024,536,'TARQUI'),(2025,536,'TENIENTE HUGO ORTIZ'),(2026,536,'VERACRUZ (INDILLAMA) (CAB. EN INDILLAMA)'),(2027,537,'SAN JOSE'),(2028,537,'SANTA CLARA'),(2029,538,'ASCAZUBI'),(2030,538,'CANGAHUA'),(2031,538,'CAYAMBE'),(2032,538,'OLMEDO (PESILLO)'),(2033,538,'OTON'),(2034,538,'SANTA ROSA DE CUZUBAMBA'),(2035,539,'ALANGASI'),(2036,539,'AMAGUAÑA'),(2037,539,'ATAHUALPA (HABASPAMBA)'),(2038,539,'CALACALI'),(2039,539,'CALDERON (CARAPUNGO)'),(2040,539,'CHAVEZPAMBA'),(2041,539,'CHECA (CHILPA)'),(2042,539,'CONOCOTO'),(2043,539,'CUMBAYA'),(2044,539,'EL QUINCHE'),(2045,539,'GUALEA'),(2046,539,'GUANGOPOLO'),(2047,539,'GUAYLLABAMBA'),(2048,539,'LA MERCED'),(2049,539,'LLANO CHICO'),(2050,539,'LLOA'),(2051,539,'NANEGAL'),(2052,539,'NANEGALITO'),(2053,539,'NONO'),(2054,539,'PACTO'),(2055,539,'PERUCHO'),(2056,539,'PIFO'),(2057,539,'PINTAG'),(2058,539,'POMASQUI'),(2059,539,'PUELLARO'),(2060,539,'PUEMBO'),(2061,539,'QUITO'),(2062,539,'SAN ANTONIO'),(2063,539,'SAN JOSE DE MINAS'),(2064,539,'TABABELA'),(2065,539,'TUMBACO'),(2066,539,'YARUQUI'),(2067,539,'ZAMBIZA'),(2068,540,'ALOAG'),(2069,540,'ALOASI'),(2070,540,'CUTUGLAHUA'),(2071,540,'EL CHAUPI'),(2072,540,'MACHACHI'),(2073,540,'MANUEL CORNEJO ASTORGA (TANDAPI)'),(2074,540,'TAMBILLO'),(2075,540,'UYUMBICHO'),(2076,541,'LA ESPERANZA'),(2077,541,'MALCHINGUI'),(2078,541,'TABACUNDO'),(2079,541,'TOCACHI'),(2080,541,'TUPIGACHI'),(2081,542,'PEDRO VICENTE MALDONADO'),(2082,543,'COTOGCHOA'),(2083,543,'RUMIPAMBA'),(2084,543,'SANGOLQUI'),(2085,544,'MINDO'),(2086,544,'SAN MIGUEL DE LOS BANCOS'),(2087,545,'ANCONCITO'),(2088,546,'ATAHUALPA'),(2089,546,'CHANDUY'),(2090,546,'SAN JOSE DE ANCON'),(2091,546,'SANTA ELENA'),(2092,547,'LA CONCORDIA'),(2093,547,'LA VILLEGAS'),(2094,547,'MONTERREY'),(2095,547,'PLAN PILOTO'),(2096,548,'ALLURIQUIN'),(2097,548,'EL ESFUERZO'),(2098,548,'LUZ DE AMERICA'),(2099,548,'SAN JACINTO DEL BUA'),(2100,548,'SANTA MARIA DEL TOACHI'),(2101,548,'SANTO DOMINGO DE LOS COLORADOS'),(2102,548,'VALLE HERMOSO'),(2103,549,'EL DORADO DE CASCALES'),(2104,550,'EL REVENTADOR'),(2105,550,'GONZALO PIZARRO'),(2106,550,'LUMBAQUI'),(2107,550,'PUERTO LIBRE'),(2108,551,'EL ENO'),(2109,551,'SANTA CECILIA'),(2110,552,'LA SOFIA'),(2111,552,'ROSA FLORIDA'),(2112,553,'AMBATILLO'),(2113,553,'AMBATO'),(2114,553,'AUGUSTO N. MARTINEZ (MUNDUGLEO)'),(2115,553,'CONSTANTINO FERNANDEZ (CAB. EN CULLITAHUA)'),(2116,553,'CUNCHIBAMBA'),(2117,553,'HUACHI GRANDE'),(2118,553,'IZAMBA'),(2119,553,'JUAN BENIGNO VELA'),(2120,553,'MONTALVO'),(2121,553,'PASA'),(2122,553,'PICAIGUA'),(2123,553,'PILAGUIN (PILAHUIN)'),(2124,553,'QUISAPINCHA (QUIZAPINCHA)'),(2125,553,'SAN BARTOLOME DE PINLLO'),(2126,553,'SAN FERNANDO (PASA SAN FERNANDO)'),(2127,553,'SANTA ROSA'),(2128,553,'UNAMUNCHO'),(2129,554,'BAÑOS DE AGUA SANTA'),(2130,554,'LLIGUA'),(2131,554,'RIO NEGRO'),(2132,554,'RIO VERDE'),(2133,554,'ULBA'),(2134,555,'CEVALLOS'),(2135,556,'MOCHA'),(2136,557,'EL TRIUNFO'),(2137,557,'LOS ANDES (CAB. EN POATUG)'),(2138,557,'PATATE'),(2139,557,'SUCRE (CAB. EN SUCRE-PATATE URCU)'),(2140,558,'BENITEZ (PACHANLICA)'),(2141,558,'CHIQUICHA (CAB. EN CHIQUICHA GRANDE)'),(2142,558,'COTALO'),(2143,558,'EL ROSARIO (RUMICHACA)'),(2144,558,'GARCIA MORENO (CHUMAQUI)'),(2145,558,'PELILEO'),(2146,558,'SALASACA'),(2147,559,'BAQUERIZO MORENO'),(2148,559,'EMILIO MARIA TERAN (RUMIPAMBA)'),(2149,559,'MARCOS ESPINEL (CHACATA)'),(2150,559,'PILLARO'),(2151,559,'PRESIDENTE URBINA (CHAGRAPAMBA -PATZUCUL)'),(2152,559,'SAN ANDRES'),(2153,559,'SAN JOSE DE POALO'),(2154,559,'SAN MIGUELITO'),(2155,560,'QUERO'),(2156,560,'RUMIPAMBA'),(2157,560,'YANAYACU- MOCHAPATA (CAB. EN YANAYACU)'),(2158,561,'QUINCHICOTO'),(2159,562,'PANGUINTZA'),(2160,562,'TR\nIUNFO-DORADO'),(2161,562,'ZUMBI'),(2162,563,'CHITO'),(2163,563,'EL CHORRO'),(2164,563,'LA CHONTA'),(2165,563,'PUCAPAMBA'),(2166,563,'SAN ANDRES'),(2167,563,'ZUMBA'),(2168,564,'EL GUISME'),(2169,564,'EL PANGUI'),(2170,564,'PACHICUTZA'),(2171,564,'TUNDAYME'),(2172,565,'GUAYZIMI'),(2173,565,'NUEVO PARAISO'),(2174,565,'ZURMI'),(2175,566,'EL PORVENIR DEL CARMEN'),(2176,566,'LA CANELA'),(2177,566,'PALANDA'),(2178,566,'SAN FRANCISCO DEL VERGEL'),(2179,566,'VALLADOLID'),(2180,567,'BELLAVISTA'),(2181,567,'NUEVO QUITO'),(2182,567,'PAQUISHA'),(2183,568,'LA PAZ'),(2184,568,'TUTUPALI'),(2185,568,'28 DE MAYO (SAN JOSE DE YACUAMBI)'),(2186,569,'CHICAÑA'),(2187,569,'LOS ENCUENTROS'),(2188,569,'YANTZAZA (YANZATZA)'),(2189,570,'CUMBARATZA'),(2190,570,'GUADALUPE'),(2191,570,'IMBANA (LA VICTORIA DE IMBANA)'),(2192,570,'SABANILLA'),(2193,570,'SAN CARLOS DE LAS MINAS'),(2194,570,'TIMBARA'),(2195,570,'ZAMORA'),(2196,571,'EL PIEDRERO'),(2197,572,'LAS GOLONDRINAS'),(2198,573,'Afganistán'),(2199,574,'Albania'),(2200,575,'Alemania'),(2201,576,'Andorra'),(2202,577,'Angola'),(2203,578,'Antigua y Barbuda'),(2204,579,'Arabia Saudita'),(2205,580,'Argelia'),(2206,581,'Argentina'),(2207,582,'Armenia'),(2208,583,'Australia'),(2209,584,'Austria'),(2210,585,'Azerbaiyán'),(2211,586,'Bahamas'),(2212,587,'Bangladés'),(2213,588,'Barbados'),(2214,589,'Baréin'),(2215,590,'Bélgica'),(2216,591,'Belice'),(2217,592,'Benín'),(2218,593,'Bielorrusia'),(2219,594,'Birmania (Myanmar)'),(2220,595,'Bolivia'),(2221,596,'Bosnia y Herzegovina'),(2222,597,'Botsuana'),(2223,598,'Brasil'),(2224,599,'Brunéi'),(2225,600,'Bulgaria'),(2226,601,'Burkina Faso'),(2227,602,'Burundi'),(2228,603,'Bután'),(2229,604,'Cabo Verde'),(2230,605,'Camboya'),(2231,606,'Camerún'),(2232,607,'Canadá'),(2233,608,'Catar'),(2234,609,'Chad'),(2235,610,'Chile'),(2236,611,'China'),(2237,612,'Chipre'),(2238,613,'Colombia'),(2239,614,'Comoras'),(2240,615,'Congo'),(2241,616,'Corea del Norte'),(2242,617,'Corea del Sur'),(2243,618,'Costa de Marfil'),(2244,619,'Costa Rica'),(2245,620,'Croacia'),(2246,621,'Cuba'),(2247,622,'Dinamarca'),(2248,623,'Dominica'),(2249,624,'Egipto'),(2250,625,'El Salvador'),(2251,626,'Emiratos Árabes Unidos'),(2252,627,'Eritrea'),(2253,628,'Eslovaquia'),(2254,629,'Eslovenia'),(2255,630,'España'),(2256,631,'Estados Unidos'),(2257,632,'Estonia'),(2258,633,'Esuatini'),(2259,634,'Etiopía'),(2260,635,'Fiyi'),(2261,636,'Filipinas'),(2262,637,'Finlandia'),(2263,638,'Francia'),(2264,639,'Gabón'),(2265,640,'Gambia'),(2266,641,'Georgia'),(2267,642,'Ghana'),(2268,643,'Granada'),(2269,644,'Grecia'),(2270,645,'Guatemala'),(2271,646,'Guyana'),(2272,647,'Guinea'),(2273,648,'Guinea-Bisáu'),(2274,649,'Guinea Ecuatorial'),(2275,650,'Haití'),(2276,651,'Honduras'),(2277,652,'Hungría'),(2278,653,'India'),(2279,654,'Indonesia'),(2280,655,'Irak'),(2281,656,'Irán'),(2282,657,'Irlanda'),(2283,658,'Islandia'),(2284,659,'Islas Marshall'),(2285,660,'Islas Salomón'),(2286,661,'Israel'),(2287,662,'Italia'),(2288,663,'Jamaica'),(2289,664,'Japón'),(2290,665,'Jordania'),(2291,666,'Kazajistán'),(2292,667,'Kenia'),(2293,668,'Kirguistán'),(2294,669,'Kiribati'),(2295,670,'Kuwait'),(2296,671,'Laos'),(2297,672,'Lesoto'),(2298,673,'Letonia'),(2299,674,'Líbano'),(2300,675,'Liberia'),(2301,676,'Libia'),(2302,677,'Liechtenstein'),(2303,678,'Lituania'),(2304,679,'Luxemburgo'),(2305,680,'Macedonia del Norte'),(2306,681,'Madagascar'),(2307,682,'Malasia'),(2308,683,'Malaui'),(2309,684,'Maldivas'),(2310,685,'Malí'),(2311,686,'Malta'),(2312,687,'Marruecos'),(2313,688,'Mauricio'),(2314,689,'Mauritania'),(2315,690,'México'),(2316,691,'Micronesia'),(2317,692,'Moldavia'),(2318,693,'Mónaco'),(2319,694,'Mongolia'),(2320,695,'Montenegro'),(2321,696,'Mozambique'),(2322,697,'Namibia'),(2323,698,'Nauru'),(2325,699,'Nepal'),(2326,701,'Nicaragua'),(2327,702,'Níger'),(2328,704,'Noruega'),(2329,705,'Nueva Zelanda'),(2330,706,'Omán'),(2331,709,'Países Bajos'),(2332,710,'Pakistán'),(2333,711,'Palaos'),(2334,712,'Palestina'),(2335,713,'Panamá'),(2336,714,'Papúa Nueva Guinea'),(2337,715,'Paraguay'),(2338,716,'Perú'),(2339,717,'Polonia'),(2340,718,'Portugal'),(2341,719,'Reino Unido'),(2342,720,'República Centroafricana'),(2343,721,'República Checa'),(2344,722,'República Democrática del Congo'),(2345,723,'República Dominicana'),(2346,724,'Ruanda'),(2347,725,'Rumania'),(2348,726,'Rusia'),(2349,727,'Samoa'),(2350,728,'San Cristóbal y Nieves'),(2351,729,'San Marino'),(2352,730,'San Vicente y las Granadinas'),(2353,731,'Santa Lucía'),(2354,732,'Santo Tomé y Príncipe'),(2355,733,'Senegal'),(2356,735,'Serbia'),(2357,736,'Seychelles'),(2358,737,'Sierra Leona'),(2359,738,'Singapur'),(2360,739,'Siria'),(2361,740,'Somalia'),(2362,741,'Sri Lanka'),(2363,742,'Sudáfrica'),(2364,743,'Sudán'),(2365,744,'Sudán del Sur'),(2366,745,'Suecia'),(2367,746,'Suiza'),(2368,747,'Surinam'),(2369,748,'Tailandia'),(2370,749,'Tanzania'),(2371,750,'Tayikistán'),(2372,751,'Timor Oriental'),(2373,752,'Togo'),(2374,753,'Tonga'),(2375,754,'Trinidad y Tobago'),(2376,755,'Túnez'),(2377,756,'Turkmenistán'),(2378,757,'Turquía'),(2379,758,'Tuvalu'),(2380,759,'Ucrania'),(2381,760,'Uganda'),(2382,761,'Uruguay'),(2383,762,'Uzbekistán'),(2384,763,'Vanuatu'),(2385,764,'Vaticano'),(2386,766,'Venezuela'),(2387,767,'Vietnam'),(2388,768,'Yemen'),(2389,769,'Yibuti'),(2390,770,'Zambia'),(2391,771,'Zimbabue'),(2392,539,'SANTA BARBARA'),(2393,539,'LA MAGDALENA'),(2394,772,'SANTA BARBARA'),(2395,539,'JIPIJAPA'),(2396,539,'SANTA PRISCA'),(2397,539,'LA VICENTINA'),(2398,539,'CHILLOGALLO'),(2399,539,'SAN BLAS'),(2400,539,'SAN BARTOLO'),(2401,539,'CHIMBACALLE'),(2402,539,'SANTA ANITA'),(2403,539,'GUAJALO'),(2404,539,'GUAMANI'),(2405,539,'EL CALZADO'),(2406,539,'EL GIRON'),(2407,539,'GUAMANI'),(2408,409,'GUANUJO'),(2409,539,'LA MENA'),(2410,539,'GONZALEZ SUAREZ'),(2411,539,'ITCHIMBIA'),(2412,539,'TURUBAMBA'),(2413,773,'LA UNION'),(2414,498,'SANTA RITA');
/*!40000 ALTER TABLE `parroquias` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `periodos`
LOCK TABLES `periodos` WRITE;
/*!40000 ALTER TABLE `periodos` DISABLE KEYS */;
INSERT INTO `periodos` VALUES ('AAE2021','EXTRAORDINARIO ABRIL 2021','2021-04-05','2021-04-30',0,'2021-04-05',0,0,1,'2021-04-05',1,0,0,0,0,0,0,0,0),('AAE2022','EXTRAORDINARIO ABRIL 2022','2022-04-04','2022-04-29',0,'2022-04-04',0,0,1,'2022-04-04',1,0,0,0,0,0,0,0,0),('ABC2015','ABRIL 2015- OCTUBRE 2015','2015-04-16','2015-09-16',0,'2015-04-16',0,0,6,'2015-04-16',1,0,0,0,0,0,0,0,1),('ABC2023','ABRIL - OCTUBRE 2023','2023-04-10','2023-10-30',0,'2023-04-10',1,1,1,'2023-04-10',1,0,1,0,0,0,0,0,1),('ABD2025','ABRIL - NOVIEMBRE 2025','2025-04-14','2025-11-30',0,'2025-04-14',1,1,1,'2025-04-14',1,0,0,0,0,0,0,0,1),('ABE2020','ABRIL  2020 - ENERO 2021','2020-04-15','2021-01-15',0,'2021-01-16',0,0,6,'2021-01-12',1,0,0,0,0,0,0,0,1),('ABR2008','ABRIL 2008 - SEPTIEMBRE 2008','2008-04-07','2008-09-26',0,'2009-12-23',0,0,6,'2009-12-21',2,0,0,0,0,0,0,0,0),('ABR2009','ABRIL2009 - SEPTIEMBRE 2009','2009-04-06','2009-09-29',0,'2010-02-06',0,0,6,'2010-02-04',4,0,0,0,0,0,0,0,0),('ABR2010','ABRIL - SEPTIEMBRE 2010','2010-04-09','2010-09-10',0,'2010-09-11',0,1,6,'2010-04-09',6,0,0,0,0,0,0,0,0),('ABR2011','ABRIL 2011 - SEPTIEMBRE 2011','2011-03-04','2011-03-05',0,'2011-03-06',0,0,6,'2011-03-04',1,0,0,0,0,0,0,0,0),('ABR2012','ABRIL 2012- SEPTIEMBRE 2012','2012-03-19','2012-03-23',0,'2012-03-24',0,0,6,'2012-03-22',1,0,0,0,0,0,0,0,0),('ABR2013','ABRIL 2013 - SEPTIEMBRE 2013','2013-03-14','2013-03-15',0,'2013-03-16',0,0,6,'2013-03-14',1,0,0,0,0,0,0,0,0),('ABR2014','ABRIL  A SEPTIEMBRE 2014','2014-04-03','2014-08-08',1,'2014-10-01',0,1,6,'2014-06-30',1,0,0,0,0,0,0,0,0),('ABR2015','ABRIL - SEPTIEMBRE 2015','2015-04-05','2015-09-30',0,'2015-04-30',0,0,6,'2015-04-05',1,0,0,0,0,0,0,0,0),('ABR2016','ABRIL - SEPTIEMBRE 2016','2016-04-16','2016-09-30',0,'2016-04-16',0,0,6,'2016-04-16',1,0,0,0,0,0,0,0,0),('ABR2017','ABRIL - SEPTIEMBRE 2017','2017-04-01','2017-09-30',0,'2017-04-01',0,0,6,'2017-04-01',1,0,0,0,0,0,0,0,0),('ABR2018','ABRIL - AGOSTO 2018','2018-04-15','2018-08-15',0,'2018-04-15',0,0,6,'2018-04-15',1,0,0,0,0,0,0,0,0),('ABR2019','ABRIL - AGOSTO 2019','2019-04-14','2019-08-30',0,'2019-04-30',0,0,6,'2019-04-15',1,0,0,0,0,0,0,0,0),('ABR2020','ABRIL - SEPTIEMBRE 2020','2020-04-15','2020-08-30',0,'2020-04-15',0,0,6,'2020-04-15',1,0,0,0,0,0,0,0,0),('ABR2021','ABRIL - SEPTIEMBRE 2021','2021-04-15','2021-08-30',0,'2021-04-15',1,0,6,'2021-04-15',1,0,0,0,0,0,0,0,0),('ABR2022','ABRIL - SEPTIEMBRE 2022','2022-04-25','2022-09-30',0,'2022-04-25',1,0,1,'2022-04-25',1,0,0,0,0,0,0,0,0),('ABR2023','ABRIL - SEPTIEMBRE 2023','2023-04-17','2023-10-31',0,'2023-04-17',0,1,1,'2023-04-17',1,0,0,0,0,1,0,0,0),('ABR2024','ABRIL - SEPTIEMBRE 2024','2024-04-22','2024-09-30',0,'2024-04-22',0,1,1,'2024-04-22',1,0,0,0,0,1,0,0,0),('ABR2025','ABRIL - SEPTIEMBRE 2025','2025-04-21','2025-09-30',0,'2025-04-21',0,1,1,'2025-04-21',1,0,0,0,0,1,0,0,0),('ABR2026','ABRIL - SEPTIEMBRE 2026','2026-04-27','2026-09-30',0,'2026-04-27',1,1,1,'2026-04-27',1,0,1,1,1,1,1,0,0),('ADC2024','AGOSTO - NOVIEMBRE 2024','2024-08-05','2024-11-29',0,'2024-08-05',1,1,1,'2024-08-05',1,0,0,0,0,0,0,0,1),('ADC2025','ABRIL - JULIO 2025','2025-04-14','2025-07-31',0,'2025-04-14',1,1,1,'2025-04-14',1,0,0,0,0,0,0,0,1),('AEC2020','ABRIL - SEPTIEMBRE   2020','2020-04-15','2021-01-15',0,'2021-01-16',0,0,6,'2020-09-22',1,0,0,0,0,0,0,0,1),('AEC2024','MAYO - OCTUBRE  2024','2024-05-11','2024-09-27',0,'2024-10-24',1,0,6,'2024-10-22',1,0,0,0,0,0,0,0,1),('AEC2025','ABRIL - SEPTIEMBRE 2025','2025-04-28','2025-09-30',0,'2025-04-28',1,1,1,'2025-04-28',1,0,0,0,0,0,0,0,1),('AGC2022','SEPTIEMBRE 2022 - MARZO 2023','2022-08-08','2023-02-10',0,'2022-08-08',1,0,1,'2022-08-08',1,0,0,0,0,0,0,0,1),('AGD2024','AGOSTO 2024 - MARZO 2025','2024-08-05','2025-03-28',0,'2024-08-05',1,1,1,'2024-08-05',1,0,0,0,0,0,0,0,1),('AGO2013','AGOSTO 2013 - FEBRERO 2014','2013-08-17','2014-02-21',0,'2014-02-22',0,0,6,'2013-08-17',1,0,0,0,0,0,0,0,1),('AGO2014','AGOSTO  2014 - FEBRERO  2015','2014-08-26','2015-02-13',0,'2015-03-02',0,0,6,'2014-08-26',3,0,0,0,0,0,0,0,1),('AGO2017','AGOSTO  NOVIEMBRE 2017','2017-08-05','2017-11-05',0,'2017-08-05',0,0,3,'2017-08-05',1,0,0,0,0,0,0,0,1),('ARP2023','ABRIL 2023','2023-04-03','2023-04-21',0,'2023-04-21',0,1,1,'2023-04-21',1,0,0,0,0,0,0,0,1),('ARP2024','ABRIL 2024','2024-04-02','2024-04-26',0,'2024-04-26',1,1,1,'2024-04-26',1,0,0,0,0,0,0,0,1),('ARP2025','ABRIL 2025','2025-04-12','2025-04-27',0,'2025-04-12',1,1,1,'2025-04-12',1,0,0,0,0,0,0,0,1),('DEC2024','DICIEMBRE 2024 - MAYO 2025','2024-12-09','2025-05-30',0,'2024-12-09',1,1,1,'2024-12-09',1,0,0,0,0,0,0,0,1),('DIC2016','DICIEMBRE 2016 - JULIO 2017','2016-12-01','2017-07-30',0,'2017-12-01',0,0,6,'2016-12-01',1,0,0,0,0,0,0,0,1),('DIE2016','DICIEMBRE 2016 - AGOSTO 2017','2016-12-12','2016-12-13',0,'2016-12-14',0,0,9,'2016-12-12',1,0,0,0,0,0,0,0,1),('DIE2024','DICIEMBRE 2024 - SEPTIEMBRE 2025','2024-12-09','2025-09-30',0,'2024-12-09',1,1,1,'2024-12-09',1,0,1,0,0,0,0,0,1),('EEC2022','ENERO - JUNIO 2022','2022-01-10',NULL,1,'2022-01-10',0,0,6,'2022-01-10',1,0,0,0,0,0,0,0,1),('EEC2026','ENERO - JUNIO 2026','2026-01-12','2026-06-30',0,'2026-01-12',1,1,1,'2026-01-12',1,0,1,0,0,0,0,0,1),('ENC2020','ENERO   -  JULIO  2020','2020-01-05','2020-06-30',0,'2020-09-11',0,0,6,'2020-09-09',1,0,0,0,0,0,0,0,1),('ENC2022','ENERO - JULIO 2022','2022-01-10',NULL,1,'2022-01-10',0,0,5,'2022-01-10',1,0,0,0,0,0,0,0,1),('ENC2025','ENERO - JULIO 2025','2025-01-06','2025-07-31',0,'2025-01-06',1,1,1,'2025-01-06',1,0,0,0,0,0,0,0,1),('ENC2026','ENERO - JULIO 2026','2026-01-12','2026-07-30',0,'2026-01-12',1,1,1,'2026-01-12',1,0,1,0,0,0,0,0,1),('END2018','FEBRERO - MAYO 2018 ','2018-01-15','2018-04-15',1,'2018-05-18',0,0,6,'2018-05-16',1,0,0,0,0,0,0,0,1),('ENE2018','MARZO - SEPTIEMBRE 2018','2018-01-13','2018-06-13',0,'2018-06-14',0,0,6,'2018-05-16',1,0,0,0,0,0,0,0,1),('ENE2022','ENERO - OCTUBRE 2022','2022-01-10',NULL,1,'2022-01-10',1,0,6,'2022-01-10',1,0,0,0,0,0,0,0,1),('ENE2026','ENERO - OCTUBRE 2026','2026-01-12','2026-10-30',0,'2026-01-12',1,1,1,'2026-01-12',1,0,1,0,0,0,0,0,1),('ENF2018','FEBRERO - JULIO 2018','2018-01-18','2018-10-10',0,'2018-10-11',0,0,6,'2018-05-16',1,0,0,0,0,0,0,0,1),('ENI2020','ENERO - FEBRERO','2020-01-07','2020-02-28',0,'2020-01-07',0,0,3,'2020-01-07',1,0,0,0,0,0,0,0,0),('ERP2022','ENERO 2022','2022-01-03','2021-12-30',0,'2022-01-03',0,0,1,'2022-01-03',1,0,0,0,0,0,0,0,1),('FEB2015','FEBRERO - OCTUBRE 2015','2015-02-16','2015-09-25',0,'2015-09-26',0,0,6,'2015-02-16',1,0,0,0,0,0,0,0,1),('FEB2016','MARZO  - OCTUBRE 2016','2016-02-18','2016-09-02',0,'2019-01-14',0,0,6,'2019-01-12',1,0,0,0,0,0,0,0,1),('FEC2021','FEBRERO - JULIO 2021','2021-02-01','2021-07-30',0,'2021-02-01',0,0,6,'2021-02-01',1,0,0,0,0,0,0,0,1),('FED2019','FEBRERO   -  MAYO   2019','2019-02-01','2019-09-29',0,'2019-09-30',0,0,6,'2019-05-17',1,0,0,0,0,0,0,0,1),('FED2020','FEBRERO  -  SEPTIEMBRE  2020','2020-02-15','2020-09-15',0,'2020-10-09',0,0,6,'2020-10-07',1,0,0,0,0,0,0,0,1),('FEE2019','FEBRERO  - JULIO  2019','2019-02-19','2019-09-29',0,'2019-09-30',0,0,6,'2019-07-11',1,0,0,0,0,0,0,0,1),('FEE2021','ENERO - OCTUBRE 2021','2021-02-01','2021-11-30',0,'2021-02-01',0,0,6,'2021-02-01',1,0,0,0,0,0,0,0,1),('FRP2023','FEBRERO 2023','2023-02-06','2023-02-24',0,'2023-02-06',0,1,1,'2023-02-06',1,0,0,0,0,0,0,0,1),('FRP2024','FEBRERO 2024','2024-02-07','2024-02-27',0,'2024-02-27',1,1,1,'2024-02-27',1,0,0,0,0,0,0,0,1),('FRP2025','FEBRERO - MARZO 2025','2025-02-24','2025-03-17',0,'2025-02-24',1,1,1,'2025-02-24',1,0,0,0,0,0,0,0,1),('JEC2026','JULIO - DICIEMBRE 2026','2026-07-06','2026-12-29',0,'2026-07-06',1,1,1,'2026-07-06',1,1,1,0,0,0,0,0,1),('JLR2022','JULIO 2022','2022-07-04','2022-07-22',0,'2022-07-04',0,0,1,'2022-07-04',1,0,0,0,0,0,0,0,1),('JRP2024','JUNIO 2024','2024-06-06','2024-06-28',0,'2024-06-06',1,1,1,'2024-06-06',1,0,0,0,0,0,0,0,1),('JUC2021','JUNIO - DICIEMBRE 2021','2021-06-01','2021-12-01',0,'2021-06-01',0,0,6,'2021-06-01',1,0,0,0,0,0,0,0,1),('JUC2024','JULIO 2024 - ENERO 2025','2024-07-15','2025-01-31',0,'2024-07-15',1,1,1,'2024-07-15',1,0,0,0,0,0,0,0,1),('JUC2025','JULIO 2025 - ENERO 2026','2025-07-07','2026-01-30',0,'2025-07-07',1,1,1,'2025-07-07',1,0,1,0,0,0,0,0,1),('JUC2026','JULIO 2026 - ENERO 2027 ','2026-07-06','2027-01-29',0,'2027-01-29',1,1,1,'2027-01-29',1,1,1,0,0,0,0,0,1),('JUD2021','JULIO 2021 - ENERO 2022','2021-07-05','2022-01-05',0,'2021-07-05',0,0,1,'2021-07-05',1,0,1,0,0,0,0,0,1),('JUE2019','JUNIO  2019  -  MARZO  2020','2019-06-01','2020-02-28',0,'2020-06-03',0,0,6,'2020-06-01',1,0,0,0,0,0,0,0,1),('JUE2021','JULIO - DICIEMBRE 2021','2021-07-05','2021-11-05',0,'2021-07-05',0,0,1,'2021-07-05',1,0,0,0,0,0,0,0,1),('JUE2022','JULIO - DICIEMBRE 2022','2022-07-11','2022-12-09',0,'2022-07-11',1,0,1,'2022-07-11',1,0,0,0,0,0,0,0,1),('JUE2026','JULIO 2026 - ABRIL 2027','2026-07-06','2027-04-30',0,'2026-07-06',1,1,1,'2026-07-06',1,1,1,0,0,0,0,0,1),('JUI2020','JUNIO - AGOSTO 2020','2020-06-08','2020-07-08',0,'2020-06-08',0,0,6,'2020-06-08',1,0,0,0,0,0,0,0,0),('JUL2017','AGOSTO 2017 - MAYO 2018 ','2017-08-05','2018-05-05',0,'2018-05-06',0,0,6,'2018-04-24',1,0,0,0,0,0,0,0,1),('JUL2018','JULIO  2018 - ABRIL 2019','2018-07-01','2018-12-01',0,'2019-05-04',0,0,6,'2019-05-02',1,0,0,0,0,0,0,0,1),('JUN2017','AGOSTO 2017- FEBRERO 2018','2017-06-01','2018-05-07',0,'2018-05-08',0,0,6,'2018-05-06',1,0,0,0,0,0,0,0,1),('JUN2018','JUNIO 2018 - ENERO 2019','2018-03-16','2018-06-03',0,'2019-02-24',0,0,6,'2019-02-22',1,0,0,0,0,0,0,0,1),('JUN2019','JUNIO  -  DICIEMBRE  2019','2019-06-06','2019-12-12',0,'2019-12-19',0,0,6,'2019-12-17',1,0,0,0,0,0,0,0,1),('MAC2024','MARZO - SEPTIEMBRE 2024','2024-03-18','2024-09-30',0,'2024-03-18',1,1,1,'2024-03-18',1,0,0,0,0,0,0,0,1),('MAC2025','MARZO - SEPTIEMBRE 2025','2025-03-17','2025-09-30',0,'2025-03-17',1,1,1,'2025-03-17',1,0,0,0,0,0,0,0,1),('MAC2026','MARZO - SEPTIEMBRE 2026','2026-03-16','2026-09-30',0,'2026-03-16',1,1,1,'2026-03-16',1,0,1,0,0,0,0,0,1),('MAE2026','MARZO - DICIEMBRE 2026','2026-03-16','2026-12-30',0,'2026-03-16',1,1,1,'2026-03-16',1,0,1,0,0,0,0,0,1),('MAI2021','MARZO - ABRIL 2021','2021-03-29','2021-05-29',0,'2021-05-29',0,0,1,'2021-05-29',1,0,0,0,0,0,0,0,0),('MAR2014','MARZO - SEPTIEMBRE 2014','2014-03-31','2014-09-15',1,'2014-09-16',0,1,6,'2014-04-30',2,0,0,0,0,0,0,0,1),('MAR2016','MARZO - SEPTIEMBRE 2016','2016-03-18','2016-09-15',0,'2016-03-18',0,0,6,'2016-03-16',1,0,0,0,0,0,0,0,1),('MAR2017','MARZO - JUNIO 2017','2017-03-07','2017-06-30',1,'2017-03-23',0,0,4,'2016-03-20',1,0,0,0,0,0,0,0,1),('MDC2022','MAYO - AGOSTO 2022','2022-05-09','2022-08-12',0,'2022-05-09',0,0,1,'2022-05-09',1,0,0,0,0,0,0,0,1),('MEC2023','MARZO - AGOSTO 2023','2023-03-20','2023-08-30',0,'2023-03-20',0,1,1,'2023-03-20',1,0,0,0,0,0,0,0,1),('MEC2026','MARZO - AGOSTO 2026','2026-03-16','2026-08-31',0,'2026-03-16',1,1,1,'2026-03-16',1,0,1,0,0,0,0,0,1),('MRP2022','MARZO 2022','2022-03-14','2022-03-25',1,'2022-03-14',0,0,1,'2022-03-14',1,0,0,0,0,0,0,0,1),('MRP2023','MAYO 2023','2023-05-22','2023-06-12',0,'2023-05-22',0,1,1,'2023-05-22',1,0,0,0,0,0,0,0,1),('MRP2024','MARZO - ABRIL 2024','2024-03-11','2024-04-01',0,'2024-04-01',1,1,1,'2024-04-01',1,0,0,0,0,0,0,0,1),('MYI2021','INGLES MAYO - AGOSTO 2021','2021-05-31','2021-08-30',0,'2021-05-31',0,0,1,'2021-05-31',1,0,0,0,0,0,0,0,0),('MYP2024','MAYO - JUNIO 2024','2024-05-13','2024-06-03',0,'2024-05-13',1,1,1,'2024-05-13',1,0,0,0,0,0,0,0,1),('MYR2022','MAYO 2022','2022-05-05','2022-05-27',0,'2022-05-05',0,0,1,'2022-05-05',1,0,0,0,0,0,0,0,1),('NDC2025','DICIEMBRE 2025 - MARZO 2026','2025-12-15','2026-03-31',0,'2025-11-17',1,1,1,'2025-11-17',1,1,1,0,0,0,0,0,1),('NOC2020','NOVIEMBRE 2020  - MAYO 2021','2020-11-08','2021-05-30',0,'2020-11-08',0,0,6,'2020-11-08',1,0,0,0,0,0,0,0,1),('NOC2023','DICIEMBRE 2023 - JUNIO 2024','2023-12-11','2024-06-28',0,'2023-11-06',0,1,1,'2023-11-06',1,0,1,0,0,0,0,0,1),('NOD2025','DICIEMBRE 2025 - JULIO 2026','2025-12-15','2026-07-31',0,'2025-11-17',1,1,1,'2025-11-17',1,1,1,0,0,0,0,0,1),('NOE2022','NOVIEMBRE 2022 - AGOSTO 2023','2022-11-14','2023-08-30',0,'2022-11-14',1,1,1,'2022-11-14',1,0,0,0,0,0,0,0,1),('NOI2020','NOVIEMBRE 2020 - MARZO 2021','2020-11-23','2020-03-31',0,'2020-11-23',0,0,6,'2020-11-23',1,0,0,0,0,0,0,0,0),('NOV2016','NOVIEMBRE 2016 - JUNIO 2017','2016-11-01','2017-06-30',0,'2016-11-01',0,0,6,'2016-11-01',1,0,0,0,0,0,0,0,1),('NOV2018','NOVIEMBRE  2018  -  MAYO  2019','2018-11-01','2019-04-30',1,'2019-05-01',0,0,6,'2019-02-15',1,0,0,0,0,0,0,0,1),('NRP2022','NOVIEMBRE 2022','2022-11-07','2022-11-25',0,'2022-11-07',1,0,1,'2022-11-07',1,0,0,0,0,0,0,0,1),('OCC2019','OCTUBRE  2019  -  ABRIL  2020','2019-10-05','2020-04-30',0,'2020-05-01',0,0,6,'2020-01-02',1,0,0,0,0,0,0,0,1),('OCC2024','OCTUBRE 2024 - ABRIL 2025','2024-10-14','2025-04-30',0,'2024-10-14',1,1,1,'2024-10-14',1,0,0,0,0,0,0,0,1),('OCC2025','OCTUBRE 2025 - ABRIL 2026','2025-10-06','2026-04-30',0,'2025-10-06',1,1,1,'2025-10-06',1,0,1,0,0,0,0,0,1),('OCC2026','OCTUBRE 2026- ABRIL 2027','2026-10-05','2027-04-30',0,'2026-10-05',1,1,1,'2026-10-05',1,1,1,0,0,0,0,0,1),('OCD2019','OCTUBRE 2019 - MAYO 2020','2019-10-12','2020-05-31',0,'2020-05-31',0,0,6,'2019-11-01',1,0,0,0,0,0,0,0,1),('OCD2022','OCTUBRE 2022 - ABRIL 2023','2022-10-03','2023-04-28',0,'2022-10-03',1,1,1,'2022-10-03',1,0,0,0,0,0,0,0,1),('OCE2024','OCTUBRE 2024 - JULIO 2025','2024-10-07','2025-07-31',0,'2024-10-07',1,1,1,'2024-10-07',1,0,0,0,0,0,0,0,1),('OCE2025','OCTUBRE 2025 - JULIO 2026','2025-10-13','2026-07-31',0,'2025-10-13',1,1,1,'2025-10-13',1,0,1,0,0,0,0,0,1),('OCI2020','OCTUBRE - NOVIEMBRE 2020','2020-10-12','2020-11-12',0,'2020-10-12',0,0,6,'2020-10-12',1,0,0,0,0,0,0,0,0),('OCI2021','OCTUBRE - NOVIEMBRE 2021','2021-10-18','2021-11-18',0,'2021-10-18',1,0,6,'2021-10-18',1,0,0,0,0,0,0,0,0),('OCT2007','OCTUBRE 2007 - MARZO 2008','2007-10-15','2008-03-15',0,'2008-03-30',0,0,6,'2008-11-15',1,0,0,0,0,0,0,0,0),('OCT2008','OCTUBRE 2008 A MARZO 2009','2008-10-14','2009-03-20',0,'2010-01-28',0,0,6,'2010-01-26',3,0,0,0,0,0,0,0,0),('OCT2009','OCTUBRE 2009 - MARZO 2010','2009-10-05','2010-03-24',1,'2010-03-25',0,0,6,'2010-02-19',5,0,0,0,0,0,0,0,0),('OCT2010','OCTUBRE 2010 - MARZO 2011','2010-06-14','2010-06-15',0,'2010-06-16',0,0,6,'2010-06-14',7,0,0,0,0,0,0,0,0),('OCT2011','OCTUBRE 2011 - ABRIL 2012','2011-08-29','2011-08-30',0,'2011-08-31',0,0,6,'2011-08-29',1,0,0,0,0,0,0,0,0),('OCT2012','OCTUBRE 2012 - MARZO 2013','2012-10-08','2012-10-09',0,'2012-10-10',0,0,6,'2012-10-08',1,0,0,0,0,0,0,0,1),('OCT2013','OCTUBRE 2013 - MARZO 2014','2013-09-16','2014-03-04',1,'2014-03-05',0,0,6,'2013-09-16',1,0,0,0,0,0,0,0,0),('OCT2014','OCTUBRE 2014 - MARZO 2015','2014-10-06','2014-10-07',0,'2015-03-06',0,0,6,'2014-10-06',1,0,0,0,0,0,0,0,0),('OCT2015','OCTUBRE 2015 - MARZO 2016','2015-10-05','2016-03-30',0,'2015-10-05',0,0,6,'2015-10-06',1,0,0,0,0,0,0,0,0),('OCT2016','OCTUBRE 2016 - MARZO 2017','2016-10-01','2017-03-08',0,'2017-03-09',0,0,6,'2016-10-01',1,0,0,0,0,0,0,0,0),('OCT2017','OCTUBRE 2017 - MARZO 2018','2017-10-01','2018-03-30',0,'2018-03-31',0,0,6,'2018-02-16',1,0,0,0,0,0,0,0,0),('OCT2018','OCTUBRE 2018 - MARZO 2019','2018-10-01','2019-02-28',0,'2018-03-31',0,0,6,'2018-10-10',1,0,0,0,0,0,0,0,0),('OCT2019','OCTUBRE 2019 - MARZO 2020','2019-10-01','2020-03-13',0,'2020-03-13',0,0,6,'2020-03-13',1,0,0,0,0,0,0,0,0),('OCT2020','OCTUBRE 2020 - MARZO 2021','2020-10-15','2021-03-31',0,'2020-10-15',0,0,6,'2020-10-15',1,0,0,0,0,0,0,0,0),('OCT2021','OCTUBRE 2021 - MARZO 2022','2021-10-18','2022-03-04',1,'2021-10-18',1,0,6,'2021-10-18',1,0,0,0,0,0,0,0,0),('OCT2022','OCTUBRE 2022 - MARZO 2023','2022-10-17','2023-03-31',0,'2022-10-17',1,0,1,'2022-10-17',1,0,0,0,0,0,0,0,0),('OCT2023','OCTUBRE 2023 - MARZO 2024','2023-10-23','2024-03-29',0,'2023-10-23',0,1,1,'2023-10-23',1,0,0,0,0,1,0,0,0),('OCT2024','OCTUBRE 2024 - MARZO 2025','2024-10-21','2025-03-31',0,'2024-10-21',0,1,1,'2024-10-21',1,0,0,0,0,1,0,0,0),('OCT2025','OCTUBRE 2025 - MARZO 2026','2025-10-20','2026-03-31',0,'2025-10-20',1,1,1,'2025-10-20',1,1,0,0,0,0,0,1,0),('OCT2026','OCTUBRE 2026 - MARZO 2027 ','2026-10-18','2027-03-12',0,'2026-10-18',0,1,1,'2026-10-18',1,1,1,0,0,0,0,0,0),('ODC2022','OCTUBRE 2022 - DICIEMBRE 2022','2022-10-03','2022-12-30',0,'2022-10-03',1,1,1,'2022-10-03',1,0,0,0,0,0,0,0,1),('OEC2024','OCTUBRE 2024 - MARZO 2025','2024-10-07','2025-03-31',0,'2024-10-07',1,1,1,'2024-10-07',1,0,0,0,0,0,0,0,1),('OEC2025','OCTUBRE 2025 - MARZO 2026','2025-10-13','2026-03-31',0,'2025-10-13',1,1,1,'2025-10-13',1,0,1,0,0,0,0,0,1),('ORP2021','OCTUBRE - NOVIEMBRE 2021','2021-10-18','2021-11-09',0,'2021-10-18',0,0,1,'2021-10-18',1,0,0,0,0,0,0,0,1),('ORP2025','OCTUBRE 2025','2025-10-13','2025-10-31',0,'2025-10-13',1,1,1,'2025-10-13',1,0,1,0,0,0,0,0,1),('SDC2023','OCTUBRE 2023 - ENERO 2024','2023-10-02','2024-01-31',0,'2023-09-11',0,1,1,'2023-09-11',1,0,1,0,0,0,0,0,1),('SEC2023','OCTUBRE 2023 - MARZO 2024','2023-10-16','2024-03-29',NULL,'2023-09-18',0,1,1,'2023-09-18',1,0,1,0,0,0,0,0,1),('SED2023','OCTUBRE 2023 - MAYO 2024','2023-10-02','2024-05-31',0,'2023-09-11',0,1,1,'2023-09-11',1,0,1,0,0,0,0,0,1),('SEE2019','SEPTIEMBRE 2019 - FEBRERO 2020','2019-09-28','2020-02-28',0,'2019-09-28',0,0,6,'2019-09-28',1,0,0,0,0,0,0,0,1),('SEE2023','OCTUBRE 2023 - JULIO 2024','2023-10-16','2024-07-26',0,'2023-09-18',1,1,1,'2023-09-18',1,0,1,0,0,0,0,0,1),('SRP2021','SEPTIEMBRE 2021','2021-09-06','2021-09-24',0,'2021-09-02',0,0,1,'2021-09-02',1,0,0,0,0,0,0,0,1),('SRP2022','SEPTIEMBRE 2022','2022-09-12','2022-09-30',0,'2022-09-12',1,1,1,'2022-09-12',1,0,0,0,0,0,0,0,1),('SRP2023','SEPTIEMBRE 2023','2023-09-04','2023-09-22',0,'2023-09-22',0,1,1,'2023-09-22',1,0,1,0,0,0,0,0,1);
/*!40000 ALTER TABLE `periodos` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `periodos_inscripciones`
LOCK TABLES `periodos_inscripciones` WRITE;
/*!40000 ALTER TABLE `periodos_inscripciones` DISABLE KEYS */;
INSERT INTO `periodos_inscripciones` VALUES (1,'SEE2023',1,37,2,'2023-05-01','2023-07-01','2023-05-10 01:52:36',0,1),(2,'OCT2023',1,40,1,'2023-07-27','2023-10-31','2023-07-27 15:49:55',0,0),(3,'OCT2023',1,50,1,'2023-07-27','2023-10-31','2023-07-27 15:50:23',0,0),(4,'OCT2023',1,55,1,'2023-07-27','2023-10-31','2023-07-27 15:51:51',0,0),(5,'OCT2023',2,65,2,'2023-07-27','2023-10-31','2023-07-27 15:52:45',0,0),(6,'OCT2023',3,69,1,'2023-07-27','2023-10-31','2023-07-27 15:53:40',0,0),(7,'OCT2023',1,76,1,'2023-07-27','2023-10-31','2023-07-27 15:56:34',0,0),(8,'OCT2023',1,83,1,'2023-07-27','2023-10-31','2023-07-27 15:56:59',0,0),(9,'OCT2023',2,94,2,'2023-07-27','2023-10-31','2023-07-27 15:57:54',0,0),(10,'NOC2023',1,35,3,'2023-08-29','2023-11-27','2023-08-30 03:31:36',0,1),(11,'NOC2023',1,35,4,'2023-08-29','2023-11-27','2023-08-30 03:32:18',0,1),(12,'NOC2023',1,35,2,'2023-08-29','2023-11-27','2023-08-30 03:32:58',0,1),(13,'SED2023',1,36,2,'2023-08-29','2023-10-23','2023-08-30 03:33:47',0,1),(14,'SED2023',1,36,4,'2023-08-29','2023-10-23','2023-08-30 03:34:26',0,1),(15,'SEE2023',1,37,4,'2023-08-29','2023-10-30','2023-08-30 03:35:12',0,1),(16,'SEE2023',1,37,3,'2023-08-29','2023-10-23','2023-08-30 03:35:48',0,1),(17,'SDC2023',1,38,4,'2023-08-29','2023-10-23','2023-08-30 03:36:26',0,1),(18,'SEC2023',1,39,2,'2023-08-29','2023-10-30','2023-08-30 03:37:04',0,1),(19,'SEC2023',1,39,4,'2023-08-29','2023-10-30','2023-08-30 03:37:25',0,1),(20,'OCT2023',2,100,1,'2023-10-01','2023-10-31','2023-10-16 19:50:20',0,0),(21,'OCT2023',2,90,2,'2023-10-01','2023-10-31','2023-10-16 19:51:13',0,0),(22,'OCT2023',4,104,1,'2023-10-01','2023-10-31','2023-10-16 19:51:51',0,0),(23,'OCT2023',4,108,1,'2023-10-01','2023-10-31','2023-10-16 20:02:59',0,0),(24,'ABR2024',1,40,1,'2024-01-01','2024-04-30','2024-01-31 20:06:28',1,0),(25,'ABR2024',1,50,1,'2024-01-01','2024-04-30','2024-01-31 20:07:00',1,0),(26,'ABR2024',1,55,1,'2024-01-01','2024-04-30','2024-01-31 20:07:00',1,0),(27,'ABR2024',2,65,2,'2024-01-01','2024-04-30','2024-01-31 20:07:00',1,0),(28,'ABR2024',3,69,4,'2024-01-01','2024-04-30','2024-01-31 20:07:00',1,0),(29,'ABR2024',1,76,1,'2024-01-01','2024-04-30','2024-01-31 20:07:00',1,0),(30,'ABR2024',1,83,1,'2024-01-01','2024-04-30','2024-01-31 20:07:00',1,0),(31,'ABR2024',2,90,2,'2024-01-01','2024-04-30','2024-01-31 20:07:00',1,0),(32,'ABR2024',4,100,4,'2024-01-01','2024-04-30','2024-01-31 20:07:00',1,0),(33,'ABR2024',4,104,4,'2024-01-01','2024-04-30','2024-01-31 20:07:01',1,0),(34,'MAC2024',1,35,2,'2024-01-10','2024-03-31','2024-01-31 20:19:57',1,1),(35,'MAC2024',1,35,3,'2024-01-10','2024-03-31','2024-01-31 20:20:15',1,1),(36,'MAC2024',1,35,4,'2024-01-10','2024-03-31','2024-01-31 20:20:33',1,1),(37,'ABR2024',4,108,1,'2024-01-01','2024-04-30','2024-01-31 20:23:22',1,0),(38,'JUC2024',1,35,2,'2024-04-10','2024-07-07','2024-04-10 14:57:59',1,1),(39,'JUC2024',1,35,3,'2024-04-10','2024-07-07','2024-04-10 14:58:29',1,1),(40,'JUC2024',1,35,4,'2024-04-10','2024-07-07','2024-04-10 14:58:55',1,1),(41,'AEC2024',1,39,2,'2024-04-10','2024-04-29','2024-04-10 15:01:24',1,1),(42,'AEC2024',1,39,4,'2024-04-10','2024-04-29','2024-04-10 15:01:58',1,1),(43,'MYP2024',1,64,2,'2024-05-02','2024-05-10','2024-05-02 13:08:24',1,1),(44,'OCE2024',1,37,3,'2024-05-09','2024-10-07','2024-05-09 17:22:51',1,1),(45,'OCE2024',1,37,2,'2024-05-09','2024-10-07','2024-05-09 17:23:24',1,1),(46,'OCE2024',1,37,4,'2024-05-09','2024-10-07','2024-05-09 17:23:51',1,1),(47,'OEC2024',1,39,2,'2024-05-09','2024-10-07','2024-05-09 17:25:08',1,1),(48,'OEC2024',1,39,4,'2024-05-09','2024-10-07','2024-05-09 17:25:28',1,1),(49,'JRP2024',1,69,4,'2024-05-20','2024-06-03','2024-05-17 16:03:17',1,1),(50,'OCC2024',1,35,3,'2024-07-08','2024-10-14','2024-07-08 17:18:30',1,1),(51,'OCC2024',1,35,2,'2024-07-08','2024-10-14','2024-07-08 17:18:54',1,1),(52,'OCC2024',1,35,4,'2024-07-08','2024-10-14','2024-07-08 17:19:14',1,1),(53,'OCT2024',2,65,2,'2024-08-01','2024-10-30','2024-08-11 18:29:50',1,0),(54,'OCT2024',1,50,1,'2024-08-01','2024-10-30','2024-08-11 18:29:51',1,0),(55,'OCT2024',1,76,1,'2024-08-01','2024-10-30','2024-08-11 18:29:51',1,0),(56,'OCT2024',3,100,1,'2024-08-01','2024-10-30','2024-08-11 18:29:51',1,0),(57,'OCT2024',2,94,2,'2024-08-01','2024-10-30','2024-08-11 18:29:51',1,0),(58,'OCT2024',1,40,1,'2024-08-01','2024-10-30','2024-08-11 18:29:51',1,0),(59,'OCT2024',3,104,1,'2024-08-01','2024-10-30','2024-08-11 18:29:51',1,0),(60,'OCT2024',2,90,2,'2024-08-01','2024-10-30','2024-08-11 18:29:51',1,0),(61,'OCT2024',1,55,1,'2024-08-01','2024-10-30','2024-08-11 18:29:51',1,0),(62,'OCT2024',3,108,1,'2024-08-01','2024-10-30','2024-08-11 18:29:51',1,0),(63,'DIE2024',1,37,3,'2024-10-08','2024-11-23','2024-10-08 19:22:58',1,1),(64,'DIE2024',1,37,2,'2024-10-08','2024-11-23','2024-10-08 19:23:30',1,1),(65,'DIE2024',1,37,4,'2024-10-08','2024-11-23','2024-10-08 19:23:55',1,1),(66,'DEC2024',1,39,2,'2024-10-08','2024-11-23','2024-10-08 19:24:52',1,1),(67,'ENC2025',1,35,2,'2024-10-08','2024-12-31','2024-10-09 03:22:50',1,1),(68,'ENC2025',1,35,3,'2024-10-08','2024-12-31','2024-10-09 03:23:27',1,1),(69,'ENC2025',1,35,4,'2024-10-08','2024-12-31','2024-10-09 03:24:04',1,1),(70,'MAC2025',1,35,2,'2025-01-10','2025-03-02','2025-01-10 17:29:48',1,1),(71,'MAC2025',1,35,3,'2025-01-10','2025-03-02','2025-01-10 17:40:43',1,1),(72,'MAC2025',1,35,4,'2025-01-10','2025-03-02','2025-01-10 17:41:06',1,1),(73,'ABR2025',1,50,1,'2025-01-24','2025-04-30','2025-01-24 17:45:32',1,0),(74,'ABR2025',3,69,3,'2025-01-24','2025-04-30','2025-01-24 18:19:19',1,0),(75,'ABR2025',2,65,2,'2025-01-24','2025-04-30','2025-01-24 18:19:45',1,0),(76,'ABR2025',1,76,1,'2025-01-24','2025-04-30','2025-01-24 18:19:45',1,0),(77,'ABR2025',4,100,3,'2025-01-24','2025-04-30','2025-01-24 18:19:45',1,0),(78,'ABR2025',2,94,2,'2025-01-24','2025-04-30','2025-01-24 18:19:45',1,0),(79,'ABR2025',4,112,3,'2025-01-24','2025-04-30','2025-01-24 18:19:45',1,0),(80,'ABR2025',1,40,1,'2025-01-24','2025-04-30','2025-01-24 18:19:45',1,0),(81,'ABR2025',4,104,3,'2025-01-24','2025-04-30','2025-01-24 18:19:45',1,0),(82,'ABR2025',2,90,2,'2025-01-24','2025-04-30','2025-01-24 18:19:46',1,0),(83,'ABR2025',1,55,1,'2025-01-24','2025-04-30','2025-01-24 18:19:46',1,0),(84,'ABR2025',4,108,3,'2025-01-24','2025-04-30','2025-01-24 18:19:46',1,0),(85,'ABD2025',1,36,4,'2025-02-03','2025-03-31','2025-02-03 18:37:30',1,1),(86,'ADC2025',1,38,4,'2025-02-03','2025-03-31','2025-02-03 18:38:01',1,1),(87,'JUC2025',1,35,3,'2025-03-25','2025-07-07','2025-03-25 18:51:19',1,1),(88,'JUC2025',1,35,4,'2025-03-25','2025-07-07','2025-03-25 18:52:30',1,1),(89,'JUC2025',1,35,2,'2025-03-25','2025-07-07','2025-03-25 18:52:58',1,1),(90,'OCE2025',1,37,2,'2025-06-06','2025-09-23','2025-06-06 18:51:45',1,1),(91,'OCE2025',1,37,4,'2025-06-06','2025-09-23','2025-06-06 18:52:23',1,1),(92,'OCE2025',1,37,3,'2025-06-06','2025-09-23','2025-06-06 18:52:59',1,1),(93,'OEC2025',1,39,2,'2025-06-06','2025-09-23','2025-06-06 18:53:33',1,1),(94,'OCE2025',1,39,4,'2025-06-06','2025-09-23','2025-06-06 18:56:05',1,1),(95,'OCC2025',1,35,2,'2025-07-03','2025-10-01','2025-07-03 19:31:35',1,1),(96,'OCC2025',1,35,3,'2025-07-03','2025-10-01','2025-07-03 19:32:05',1,1),(97,'OCC2025',1,35,4,'2025-07-03','2025-10-01','2025-07-03 19:32:23',1,1),(98,'OCT2025',1,50,1,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(99,'OCT2025',3,69,3,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(100,'OCT2025',2,65,2,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(101,'OCT2025',1,76,1,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(102,'OCT2025',4,100,3,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(103,'OCT2025',2,94,2,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(104,'OCT2025',4,112,3,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(105,'OCT2025',1,40,1,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(106,'OCT2025',4,104,3,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(107,'OCT2025',2,90,2,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(108,'OCT2025',1,55,1,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(109,'OCT2025',4,108,3,'2025-08-01','2025-10-20','2025-08-04 02:29:25',1,0),(113,'NOD2025',1,36,2,'2025-09-19','2025-11-15','2025-09-19 14:30:58',1,1),(114,'NOD2025',1,36,4,'2025-09-19','2025-11-15','2025-09-19 14:31:33',1,1),(115,'NDC2025',1,38,4,'2025-09-19','2025-11-15','2025-09-19 14:32:15',1,1),(116,'ORP2025',1,64,2,'2025-09-19','2025-10-02','2025-09-19 14:32:54',1,1),(117,'ENE2026',1,37,2,'2025-09-23','2025-12-22','2025-09-23 13:50:36',1,1),(118,'ENE2026',1,37,3,'2025-09-23','2025-12-22','2025-09-23 13:51:22',1,1),(119,'ENE2026',1,37,4,'2025-09-23','2025-12-22','2025-09-23 13:51:43',1,1),(120,'EEC2026',1,39,2,'2025-09-23','2025-12-22','2025-09-23 13:53:02',1,1),(121,'EEC2026',1,39,4,'2025-09-23','2025-12-22','2025-09-23 13:53:21',1,1),(122,'ENC2026',1,35,2,'2025-09-23','2025-12-22','2025-09-23 13:53:45',1,1),(123,'ENC2026',1,35,3,'2025-09-23','2025-12-22','2025-09-23 13:54:07',1,1),(124,'ENC2026',1,35,4,'2025-09-23','2025-12-22','2025-09-23 13:54:22',1,1),(125,'MAE2026',1,37,2,'2026-01-07','2026-02-24','2026-01-07 14:30:08',1,1),(126,'MAE2026',1,37,3,'2026-01-07','2026-02-24','2026-01-07 14:30:38',1,1),(127,'MAE2026',1,37,4,'2026-01-07','2026-02-24','2026-01-07 14:30:57',1,1),(128,'MEC2026',1,39,2,'2026-01-07','2026-02-24','2026-01-07 14:32:08',1,1),(129,'MEC2026',1,39,4,'2026-01-07','2026-02-24','2026-01-07 14:32:46',1,1),(130,'MAC2026',1,35,2,'2026-01-07','2026-02-24','2026-01-07 14:33:35',1,1),(131,'MAC2026',1,35,3,'2026-01-07','2026-02-24','2026-01-07 14:33:54',1,1),(132,'MAC2026',1,35,4,'2026-01-07','2026-02-24','2026-01-07 14:34:16',1,1),(133,'ABR2026',1,50,1,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(134,'ABR2026',3,69,3,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(135,'ABR2026',2,65,2,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(136,'ABR2026',1,76,1,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(137,'ABR2026',4,100,3,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(138,'ABR2026',2,94,2,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(139,'ABR2026',4,112,3,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(140,'ABR2026',1,40,1,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(141,'ABR2026',4,104,3,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(142,'ABR2026',2,90,2,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(143,'ABR2026',1,55,1,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(144,'ABR2026',4,108,3,'2026-01-09','2026-04-30','2026-01-09 18:18:22',1,0),(145,'JUC2026',1,35,2,'2026-03-10','2026-06-30','2026-03-10 15:55:55',1,1),(146,'JUE2026',1,37,2,'2026-03-10','2026-06-30','2026-03-10 16:19:21',1,1),(147,'JEC2026',1,39,2,'2026-03-10','2026-06-30','2026-03-10 16:20:15',1,1),(148,'OCC2026',1,35,3,'2026-06-25','2026-10-14','2026-06-25 18:41:22',1,1),(149,'OCC2026',1,35,2,'2026-06-25','2026-10-14','2026-06-25 18:42:59',1,1),(150,'OCC2026',1,35,4,'2026-06-25','2026-10-14','2026-06-25 18:43:55',1,1),(151,'OCT2026',1,50,1,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(152,'OCT2026',3,69,3,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(153,'OCT2026',2,65,2,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(154,'OCT2026',1,76,1,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(155,'OCT2026',4,100,3,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(156,'OCT2026',2,94,2,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(157,'OCT2026',4,112,3,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(158,'OCT2026',1,40,1,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(159,'OCT2026',4,104,3,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(160,'OCT2026',2,90,2,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(161,'OCT2026',1,55,1,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0),(162,'OCT2026',4,108,3,'2026-07-14','2026-10-30','2026-07-14 16:30:59',1,0);
/*!40000 ALTER TABLE `periodos_inscripciones` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `periodos_matriculas_niveles`
LOCK TABLES `periodos_matriculas_niveles` WRITE;
/*!40000 ALTER TABLE `periodos_matriculas_niveles` DISABLE KEYS */;
INSERT INTO `periodos_matriculas_niveles` VALUES ('AAE2021',44,3,1),('AAE2021',51,3,1),('AAE2021',52,3,1),('AAE2021',57,3,1),('AAE2022',50,3,1),('AAE2022',52,3,1),('AAE2022',55,3,1),('AAE2022',56,3,1),('AAE2022',57,3,1),('ABC2023',35,2,1),('ABC2023',35,3,1),('ABC2023',35,4,1),('ABD2025',36,2,1),('ABD2025',36,3,1),('ABD2025',36,4,1),('ABE2020',37,2,1),('ABE2020',37,3,1),('ABE2020',37,4,1),('ABR2020',6,3,1),('ABR2020',15,3,1),('ABR2020',28,3,1),('ABR2020',40,3,1),('ABR2020',41,3,1),('ABR2020',42,3,1),('ABR2020',43,3,1),('ABR2020',45,3,1),('ABR2020',50,3,1),('ABR2020',51,3,1),('ABR2020',52,3,1),('ABR2020',53,3,1),('ABR2020',55,3,1),('ABR2020',56,3,1),('ABR2020',57,3,1),('ABR2020',58,3,1),('ABR2021',40,3,1),('ABR2021',41,3,1),('ABR2021',43,3,1),('ABR2021',44,3,1),('ABR2021',50,3,1),('ABR2021',51,3,1),('ABR2021',53,3,1),('ABR2021',54,3,1),('ABR2021',55,3,1),('ABR2021',56,3,1),('ABR2021',58,3,1),('ABR2021',59,3,1),('ABR2021',61,3,1),('ABR2022',40,3,1),('ABR2022',41,3,1),('ABR2022',42,3,1),('ABR2022',43,3,1),('ABR2022',50,2,1),('ABR2022',50,3,1),('ABR2022',51,3,1),('ABR2022',52,3,1),('ABR2022',53,3,1),('ABR2022',55,2,1),('ABR2022',55,3,1),('ABR2022',56,3,1),('ABR2022',57,3,1),('ABR2022',58,3,1),('ABR2023',65,2,1),('ABR2024',40,1,1),('ABR2024',41,1,1),('ABR2024',42,1,1),('ABR2024',43,1,1),('ABR2024',44,1,1),('ABR2024',50,1,1),('ABR2024',51,1,1),('ABR2024',52,1,1),('ABR2024',53,1,1),('ABR2024',54,1,1),('ABR2024',55,1,1),('ABR2024',56,1,1),('ABR2024',57,1,1),('ABR2024',58,1,1),('ABR2024',59,1,1),('ABR2024',65,2,1),('ABR2024',66,1,1),('ABR2024',66,2,1),('ABR2024',67,2,1),('ABR2024',69,4,1),('ABR2024',70,4,1),('ABR2024',71,4,1),('ABR2024',76,1,1),('ABR2024',77,1,1),('ABR2024',83,1,1),('ABR2024',84,1,1),('ABR2024',90,2,1),('ABR2024',91,2,1),('ABR2024',94,2,1),('ABR2024',100,4,1),('ABR2024',101,4,1),('ABR2024',104,4,1),('ABR2024',105,4,1),('ABR2024',106,4,1),('ABR2024',108,4,1),('ABR2024',112,4,1),('ABR2025',40,1,1),('ABR2025',41,1,1),('ABR2025',42,1,1),('ABR2025',43,1,1),('ABR2025',44,1,1),('ABR2025',50,1,1),('ABR2025',50,2,1),('ABR2025',51,1,1),('ABR2025',52,1,1),('ABR2025',53,1,1),('ABR2025',54,1,1),('ABR2025',55,1,1),('ABR2025',56,1,1),('ABR2025',57,1,1),('ABR2025',58,1,1),('ABR2025',59,1,1),('ABR2025',65,2,1),('ABR2025',66,2,1),('ABR2025',67,2,1),('ABR2025',68,2,1),('ABR2025',69,4,1),('ABR2025',70,4,1),('ABR2025',72,4,1),('ABR2025',76,1,1),('ABR2025',77,1,1),('ABR2025',78,1,1),('ABR2025',79,1,1),('ABR2025',83,1,1),('ABR2025',86,1,1),('ABR2025',90,2,1),('ABR2025',91,2,1),('ABR2025',92,2,1),('ABR2025',93,2,1),('ABR2025',94,2,1),('ABR2025',95,2,1),('ABR2025',98,2,1),('ABR2025',100,4,1),('ABR2025',101,4,1),('ABR2025',102,4,1),('ABR2025',103,4,1),('ABR2025',104,4,1),('ABR2025',105,4,1),('ABR2025',106,4,1),('ABR2025',107,4,1),('ABR2025',108,4,1),('ABR2025',109,4,1),('ABR2025',110,4,1),('ABR2025',112,4,1),('ABR2025',113,4,1),('ABR2026',40,1,1),('ABR2026',41,1,1),('ABR2026',42,1,1),('ABR2026',43,1,1),('ABR2026',50,1,1),('ABR2026',50,2,1),('ABR2026',51,1,1),('ABR2026',51,2,1),('ABR2026',52,1,1),('ABR2026',53,1,1),('ABR2026',55,1,1),('ABR2026',56,1,1),('ABR2026',57,1,1),('ABR2026',58,1,1),('ABR2026',65,2,1),('ABR2026',66,2,1),('ABR2026',67,2,1),('ABR2026',68,2,1),('ABR2026',69,4,1),('ABR2026',70,4,1),('ABR2026',72,4,1),('ABR2026',76,1,1),('ABR2026',77,1,1),('ABR2026',78,1,1),('ABR2026',79,1,1),('ABR2026',83,1,1),('ABR2026',84,1,1),('ABR2026',85,1,1),('ABR2026',86,1,1),('ABR2026',90,2,1),('ABR2026',91,2,1),('ABR2026',92,2,1),('ABR2026',93,2,1),('ABR2026',94,2,1),('ABR2026',95,2,1),('ABR2026',98,2,1),('ABR2026',99,2,1),('ABR2026',100,4,1),('ABR2026',101,4,1),('ABR2026',102,4,1),('ABR2026',103,4,1),('ABR2026',104,4,1),('ABR2026',105,4,1),('ABR2026',106,4,1),('ABR2026',107,4,1),('ABR2026',108,4,1),('ABR2026',109,4,1),('ABR2026',110,4,1),('ABR2026',111,4,1),('ABR2026',112,4,1),('ABR2026',113,4,1),('ABR2026',114,4,1),('ABR2026',115,4,1),('ADC2024',38,4,1),('ADC2025',38,4,1),('AEC2020',39,2,1),('AEC2020',39,3,1),('AEC2020',39,4,1),('AEC2024',39,2,1),('AEC2024',39,4,1),('AEC2025',39,2,1),('AEC2025',39,4,1),('AGC2022',35,2,1),('AGC2022',35,3,1),('AGC2022',35,4,1),('AGD2024',36,2,1),('AGD2024',36,4,1),('ARP2023',64,2,1),('ARP2024',64,2,1),('ARP2025',64,2,1),('DEC2024',39,2,1),('DIE2024',37,2,1),('DIE2024',37,3,1),('DIE2024',37,4,1),('EEC2022',39,2,1),('EEC2022',39,3,1),('EEC2022',39,4,1),('EEC2026',39,2,1),('EEC2026',39,4,1),('ENC2020',35,2,1),('ENC2020',35,3,1),('ENC2020',35,4,1),('ENC2022',35,2,1),('ENC2022',35,3,1),('ENC2022',35,4,1),('ENC2025',35,2,1),('ENC2025',35,3,1),('ENC2025',35,4,1),('ENC2026',35,2,1),('ENC2026',35,3,1),('ENC2026',35,4,1),('ENE2022',37,2,1),('ENE2022',37,3,1),('ENE2022',37,4,1),('ENE2026',37,2,1),('ENE2026',37,3,1),('ENE2026',37,4,1),('ENI2020',60,2,1),('ENI2020',60,3,1),('ERP2022',64,2,1),('FEC2021',39,2,1),('FEC2021',39,3,1),('FEC2021',39,4,1),('FED2020',36,2,1),('FED2020',36,3,1),('FED2020',36,4,1),('FEE2021',37,2,1),('FEE2021',37,3,1),('FEE2021',37,4,1),('FRP2023',64,2,1),('FRP2024',64,2,1),('FRP2025',64,2,1),('JDC2021',38,4,1),('JEC2026',39,2,1),('JEC2026',39,4,1),('JLR2022',64,2,1),('JRP2024',64,2,1),('JUC2021',35,2,1),('JUC2021',35,3,1),('JUC2021',35,4,1),('JUC2024',35,2,1),('JUC2024',35,3,1),('JUC2024',35,4,1),('JUC2025',35,2,1),('JUC2025',35,3,1),('JUC2025',35,4,1),('JUC2026',35,2,1),('JUC2026',35,3,1),('JUC2026',35,4,1),('JUD2021',36,2,1),('JUD2021',36,3,1),('JUD2021',36,4,1),('JUE2021',39,2,1),('JUE2021',39,3,1),('JUE2021',39,4,1),('JUE2022',39,2,1),('JUE2022',39,3,1),('JUE2022',39,4,1),('JUE2026',37,2,1),('JUE2026',37,3,1),('JUE2026',37,4,1),('JUI2020',60,2,1),('JUI2020',60,3,1),('JUI2020',61,2,1),('JUI2020',61,3,1),('MAC2024',35,2,1),('MAC2024',35,3,1),('MAC2024',35,4,1),('MAC2025',35,2,1),('MAC2025',35,3,1),('MAC2025',35,4,1),('MAC2026',35,2,1),('MAC2026',35,3,1),('MAC2026',35,4,1),('MAD2022',36,2,1),('MAD2022',36,4,1),('MAE2026',37,2,1),('MAE2026',37,3,1),('MAE2026',37,4,1),('MAI2021',61,3,1),('MDC2022',38,2,1),('MDC2022',38,3,1),('MDC2022',38,4,1),('MEC2023',39,2,1),('MEC2023',39,4,1),('MEC2026',39,2,1),('MEC2026',39,4,1),('MRP2022',64,2,1),('MRP2023',64,2,1),('MRP2024',64,2,1),('MYI2021',60,1,1),('MYI2021',60,2,1),('MYI2021',60,3,1),('MYI2021',61,1,1),('MYI2021',61,3,1),('MYI2021',62,1,1),('MYI2021',62,2,1),('MYP2024',64,2,1),('MYR2022',64,2,1),('NDC2025',38,2,1),('NDC2025',38,4,1),('NOC2020',35,2,1),('NOC2020',35,3,1),('NOC2020',35,4,1),('NOC2023',35,2,1),('NOC2023',35,3,1),('NOC2023',35,4,1),('NOD2025',36,2,1),('NOD2025',36,4,1),('NOE2022',37,2,1),('NOE2022',37,3,1),('NOE2022',37,4,1),('NOI2020',60,3,1),('NOI2020',61,2,1),('NOI2020',62,2,1),('NRP2022',64,2,1),('OCC2024',35,2,1),('OCC2024',35,3,1),('OCC2024',35,4,1),('OCC2025',35,2,1),('OCC2025',35,3,1),('OCC2025',35,4,1),('OCC2026',35,2,1),('OCC2026',35,3,1),('OCC2026',35,4,1),('OCD2022',36,2,1),('OCD2022',36,4,1),('OCE2024',37,2,1),('OCE2024',37,3,1),('OCE2024',37,4,1),('OCE2025',37,2,1),('OCE2025',37,3,1),('OCE2025',37,4,1),('OCI2020',60,3,1),('OCI2021',60,1,1),('OCI2021',60,2,1),('OCI2021',60,3,1),('OCI2021',61,1,1),('OCI2021',61,2,1),('OCI2021',61,3,1),('OCI2021',62,1,1),('OCI2021',62,2,1),('OCT2020',40,3,1),('OCT2020',41,3,1),('OCT2020',42,3,1),('OCT2020',43,3,1),('OCT2020',44,3,1),('OCT2020',45,3,1),('OCT2020',50,3,1),('OCT2020',51,3,1),('OCT2020',52,3,1),('OCT2020',53,3,1),('OCT2020',54,3,1),('OCT2020',55,3,1),('OCT2020',56,3,1),('OCT2020',57,3,1),('OCT2020',58,3,1),('OCT2020',59,3,1),('OCT2021',40,3,1),('OCT2021',41,3,1),('OCT2021',42,3,1),('OCT2021',44,3,1),('OCT2021',50,3,1),('OCT2021',51,3,1),('OCT2021',52,3,1),('OCT2021',54,3,1),('OCT2021',55,3,1),('OCT2021',56,3,1),('OCT2021',57,3,1),('OCT2021',59,3,1),('OCT2022',40,3,1),('OCT2022',41,3,1),('OCT2022',42,3,1),('OCT2022',43,3,1),('OCT2022',44,3,1),('OCT2022',50,3,1),('OCT2022',51,3,1),('OCT2022',52,3,1),('OCT2022',53,3,1),('OCT2022',54,3,1),('OCT2022',55,3,1),('OCT2022',56,3,1),('OCT2022',57,3,1),('OCT2022',58,3,1),('OCT2022',59,3,1),('OCT2023',40,1,1),('OCT2023',41,1,1),('OCT2023',41,3,1),('OCT2023',42,1,1),('OCT2023',43,1,1),('OCT2023',43,3,1),('OCT2023',44,1,1),('OCT2023',50,1,1),('OCT2023',51,1,1),('OCT2023',52,1,1),('OCT2023',53,1,1),('OCT2023',54,1,1),('OCT2023',55,1,1),('OCT2023',56,1,1),('OCT2023',56,3,1),('OCT2023',57,1,1),('OCT2023',58,1,1),('OCT2023',58,3,1),('OCT2023',59,1,1),('OCT2023',65,2,1),('OCT2023',66,2,1),('OCT2023',69,4,1),('OCT2023',76,1,1),('OCT2023',83,1,1),('OCT2023',90,2,1),('OCT2023',94,2,1),('OCT2023',100,4,1),('OCT2023',104,1,1),('OCT2023',104,4,1),('OCT2024',40,1,1),('OCT2024',41,1,1),('OCT2024',42,1,1),('OCT2024',43,1,1),('OCT2024',44,1,1),('OCT2024',46,4,1),('OCT2024',50,1,1),('OCT2024',50,2,1),('OCT2024',51,1,1),('OCT2024',52,1,1),('OCT2024',53,1,1),('OCT2024',54,1,1),('OCT2024',55,1,1),('OCT2024',56,1,1),('OCT2024',57,1,1),('OCT2024',58,1,1),('OCT2024',59,1,1),('OCT2024',65,2,1),('OCT2024',66,2,1),('OCT2024',67,2,1),('OCT2024',68,2,1),('OCT2024',69,4,1),('OCT2024',70,4,1),('OCT2024',71,4,1),('OCT2024',76,1,1),('OCT2024',77,1,1),('OCT2024',78,1,1),('OCT2024',83,1,1),('OCT2024',85,1,1),('OCT2024',90,2,1),('OCT2024',91,2,1),('OCT2024',92,2,1),('OCT2024',94,2,1),('OCT2024',95,2,1),('OCT2024',100,4,1),('OCT2024',101,4,1),('OCT2024',102,4,1),('OCT2024',104,4,1),('OCT2024',105,4,1),('OCT2024',106,4,1),('OCT2024',108,4,1),('OCT2024',109,4,1),('OCT2024',110,4,1),('OCT2024',112,4,1),('OCT2024',113,4,1),('OCT2025',40,1,1),('OCT2025',41,1,1),('OCT2025',42,1,1),('OCT2025',43,1,1),('OCT2025',50,1,1),('OCT2025',50,2,1),('OCT2025',51,1,1),('OCT2025',52,1,1),('OCT2025',53,1,1),('OCT2025',55,1,1),('OCT2025',56,1,1),('OCT2025',57,1,1),('OCT2025',58,1,1),('OCT2025',65,2,1),('OCT2025',66,2,1),('OCT2025',67,2,1),('OCT2025',68,2,1),('OCT2025',69,4,1),('OCT2025',70,4,1),('OCT2025',71,4,1),('OCT2025',76,1,1),('OCT2025',77,1,1),('OCT2025',78,1,1),('OCT2025',79,1,1),('OCT2025',83,1,1),('OCT2025',84,1,1),('OCT2025',90,2,1),('OCT2025',91,2,1),('OCT2025',92,2,1),('OCT2025',93,2,1),('OCT2025',94,2,1),('OCT2025',95,2,1),('OCT2025',98,2,1),('OCT2025',99,2,1),('OCT2025',100,4,1),('OCT2025',101,4,1),('OCT2025',102,4,1),('OCT2025',103,4,1),('OCT2025',104,4,1),('OCT2025',105,4,1),('OCT2025',106,4,1),('OCT2025',107,4,1),('OCT2025',108,4,1),('OCT2025',110,4,1),('OCT2025',111,4,1),('OCT2025',112,4,1),('OCT2025',113,4,1),('OCT2025',114,4,1),('OCT2026',40,1,1),('OCT2026',50,1,1),('OCT2026',50,2,1),('OCT2026',55,1,1),('OCT2026',65,2,1),('OCT2026',68,2,1),('OCT2026',69,4,1),('OCT2026',76,1,1),('OCT2026',83,1,1),('OCT2026',90,2,1),('OCT2026',94,2,1),('OCT2026',100,4,1),('OCT2026',104,4,1),('OCT2026',108,4,1),('OCT2026',112,4,1),('ODC2022',38,4,1),('OEC2024',39,2,1),('OEC2024',39,4,1),('OEC2025',39,2,1),('OEC2025',39,4,1),('ORP2021',64,2,1),('ORP2021',64,4,1),('ORP2025',64,2,1),('SDC2023',38,4,1),('SEC2023',39,2,1),('SEC2023',39,3,1),('SEC2023',39,4,1),('SED2023',36,2,1),('SED2023',36,4,1),('SEE2023',37,2,1),('SEE2023',37,3,1),('SEE2023',37,4,1),('SRP2021',64,2,1),('SRP2021',64,3,1),('SRP2021',64,4,1),('SRP2022',64,2,1),('SRP2023',64,2,1);
/*!40000 ALTER TABLE `periodos_matriculas_niveles` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `prerequisitos`
LOCK TABLES `prerequisitos` WRITE;
/*!40000 ALTER TABLE `prerequisitos` DISABLE KEYS */;
INSERT INTO `prerequisitos` VALUES (10,1,1),(11,6,1);
/*!40000 ALTER TABLE `prerequisitos` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `provincias`
LOCK TABLES `provincias` WRITE;
/*!40000 ALTER TABLE `provincias` DISABLE KEYS */;
INSERT INTO `provincias` VALUES (219,52,'AZUAY'),(220,52,'BOLIVAR'),(221,52,'CAÑAR'),(222,52,'CARCHI'),(223,52,'CHIMBORAZO'),(224,52,'COTOPAXI'),(225,52,'EL ORO'),(226,52,'ESMERALDAS'),(227,52,'GUAYAS'),(228,52,'IMBABURA'),(229,52,'LOJA'),(230,52,'LOS RIOS'),(231,52,'MANABI'),(232,52,'MORONA SANTIAGO'),(233,52,'NAPO'),(234,52,'ORELLANA'),(235,52,'PASTAZA'),(236,52,'PICHINCHA'),(237,52,'SANTA ELENA'),(238,52,'SANTO DOMINGO DE LOS TSACHILAS'),(239,52,'SUCUMBIOS'),(240,52,'TUNGURAHUA'),(241,52,'ZAMORA CHINCHIPE'),(242,52,'ZONA NO DELIMITADA'),(243,2,'Albania'),(244,1,'Afganistán'),(245,3,'Alemania'),(246,4,'Andorra'),(247,5,'Angola'),(248,6,'Antigua y Barbuda'),(249,7,'Arabia Saudita'),(250,8,'Argelia'),(251,9,'Argentina'),(252,10,'Armenia'),(253,11,'Australia'),(254,12,'Austria'),(255,13,'Azerbaiyán'),(256,14,'Bahamas'),(257,15,'Bangladés'),(258,16,'Barbados'),(259,17,'Baréin'),(260,18,'Bélgica'),(261,19,'Belice'),(262,20,'Benín'),(263,21,'Bielorrusia'),(264,22,'Birmania (Myanmar)'),(265,23,'Bolivia'),(266,24,'Bosnia y Herzegovina'),(267,25,'Botsuana'),(268,26,'Brasil'),(269,27,'Brunéi'),(270,28,'Bulgaria'),(271,29,'Burkina Faso'),(272,30,'Burundi'),(273,31,'Bután'),(274,32,'Cabo Verde'),(275,33,'Camboya'),(276,34,'Camerún'),(277,35,'Canadá'),(278,36,'Catar'),(279,37,'Chad'),(280,38,'Chile'),(281,39,'China'),(282,40,'Chipre'),(283,41,'Colombia'),(284,42,'Comoras'),(285,43,'Congo'),(286,44,'Corea del Norte'),(287,45,'Corea del Sur'),(288,46,'Costa de Marfil'),(289,47,'Costa Rica'),(290,48,'Croacia'),(291,49,'Cuba'),(292,50,'Dinamarca'),(293,51,'Dominica'),(294,53,'Egipto'),(295,54,'El Salvador'),(296,55,'Emiratos Árabes Unidos'),(297,56,'Eritrea'),(298,57,'Eslovaquia'),(299,58,'Eslovenia'),(300,59,'España'),(301,60,'Estados Unidos'),(302,61,'Estonia'),(303,62,'Esuatini'),(304,63,'Etiopía'),(305,64,'Fiyi'),(306,65,'Filipinas'),(307,66,'Finlandia'),(308,67,'Francia'),(309,68,'Gabón'),(310,69,'Gambia'),(311,70,'Georgia'),(312,71,'Ghana'),(313,72,'Granada'),(314,73,'Grecia'),(315,74,'Guatemala'),(316,75,'Guyana'),(317,76,'Guinea'),(318,77,'Guinea-Bisáu'),(319,78,'Guinea Ecuatorial'),(320,79,'Haití'),(321,80,'Honduras'),(322,81,'Hungría'),(323,82,'India'),(324,83,'Indonesia'),(325,84,'Irak'),(326,85,'Irán'),(327,86,'Irlanda'),(328,87,'Islandia'),(329,88,'Islas Marshall'),(330,89,'Islas Salomón'),(331,90,'Israel'),(332,91,'Italia'),(333,92,'Jamaica'),(334,93,'Japón'),(335,94,'Jordania'),(336,95,'Kazajistán'),(337,96,'Kenia'),(338,97,'Kirguistán'),(339,98,'Kiribati'),(340,99,'Kuwait'),(341,100,'Laos'),(342,101,'Lesoto'),(343,102,'Letonia'),(344,103,'Líbano'),(345,104,'Liberia'),(346,105,'Libia'),(347,106,'Liechtenstein'),(348,107,'Lituania'),(349,108,'Luxemburgo'),(350,109,'Macedonia del Norte'),(351,110,'Madagascar'),(352,111,'Malasia'),(353,112,'Malaui'),(354,113,'Maldivas'),(355,114,'Malí'),(356,115,'Malta'),(357,116,'Marruecos'),(358,117,'Mauricio'),(359,118,'Mauritania'),(360,119,'México'),(361,120,'Micronesia'),(362,121,'Moldavia'),(363,122,'Mónaco'),(364,123,'Mongolia'),(365,124,'Montenegro'),(366,125,'Mozambique'),(367,126,'Namibia'),(368,127,'Nauru'),(369,128,'Nepal'),(370,129,'Nicaragua'),(371,130,'Níger'),(372,131,'Nigeria'),(373,132,'Noruega'),(374,133,'Nueva Zelanda'),(375,134,'Omán'),(376,135,'Países Bajos'),(377,136,'Pakistán'),(378,137,'Palaos'),(379,138,'Palestina'),(380,139,'Panamá'),(381,140,'Papúa Nueva Guinea'),(382,141,'Paraguay'),(383,142,'Perú'),(384,143,'Polonia'),(385,144,'Portugal'),(386,145,'Reino Unido'),(387,146,'República Centroafricana'),(388,147,'República Checa'),(389,148,'República Democrática del Congo'),(390,149,'República Dominicana'),(391,150,'Ruanda'),(392,151,'Rumania'),(393,152,'Rusia'),(394,153,'Samoa'),(395,154,'San Cristóbal y Nieves'),(396,155,'San Marino'),(397,156,'San Vicente y las Granadinas'),(398,157,'Santa Lucía'),(399,158,'Santo Tomé y Príncipe'),(400,159,'Senegal'),(402,160,'Serbia'),(403,161,'Seychelles'),(404,162,'Sierra Leona'),(405,163,'Singapur'),(406,164,'Siria'),(407,165,'Somalia'),(408,166,'Sri Lanka'),(409,167,'Sudáfrica'),(410,168,'Sudán'),(411,169,'Sudán del Sur'),(412,170,'Suecia'),(413,171,'Suiza'),(414,172,'Surinam'),(415,173,'Tailandia'),(416,174,'Tanzania'),(417,175,'Tayikistán'),(418,176,'Timor Oriental'),(419,177,'Togo'),(420,178,'Tonga'),(421,179,'Trinidad y Tobago'),(422,180,'Túnez'),(423,181,'Turkmenistán'),(424,182,'Turquía'),(425,183,'Tuvalu'),(426,184,'Ucrania'),(427,185,'Uganda'),(428,186,'Uruguay'),(429,187,'Uzbekistán'),(430,188,'Vanuatu'),(431,189,'Vaticano'),(432,190,'Venezuela'),(433,191,'Vietnam'),(434,192,'Yemen'),(435,193,'Yibuti'),(436,194,'Zambia'),(437,195,'Zimbabue'),(439,52,'PICHINCHA'),(440,52,'PICHINCHA'),(441,52,'PICHINCHA'),(442,52,'PICHINCHA'),(443,52,'GONZALEZ SUAREZ');
/*!40000 ALTER TABLE `provincias` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `rbac_modulos`
LOCK TABLES `rbac_modulos` WRITE;
/*!40000 ALTER TABLE `rbac_modulos` DISABLE KEYS */;
INSERT INTO `rbac_modulos` VALUES (1,1,'contratos',1),(2,1,'profesores',1),(3,1,'plantillas',1),(4,1,'configuraciones',1),(5,1,'reportes',1),(6,2,'Convocatorias',1),(7,2,'Infraestructura',1),(8,2,'PostulacionesAlumnos',1),(9,2,'PostulacionesBienestar',1),(10,2,'Tribunal',1),(11,2,'BecasAprobadas',1),(12,3,'distributivo',1),(13,3,'cronogramas',1),(14,3,'horarios',1),(15,3,'mallas',1),(16,4,'auditlogs',1),(17,4,'gestion_usuarios',1),(18,4,'notificaciones',1),(19,4,'catalogos',1),(20,3,'asistencia',1),(21,3,'dashboard',1),(22,3,'reportes',1);
/*!40000 ALTER TABLE `rbac_modulos` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `rbac_modulos_operaciones`
LOCK TABLES `rbac_modulos_operaciones` WRITE;
/*!40000 ALTER TABLE `rbac_modulos_operaciones` DISABLE KEYS */;
INSERT INTO `rbac_modulos_operaciones` VALUES (1,1,1,NULL,NULL,1),(2,1,2,NULL,NULL,1),(3,1,3,NULL,NULL,1),(4,1,4,NULL,NULL,1),(5,2,1,NULL,NULL,1),(6,2,2,NULL,NULL,1),(7,2,3,NULL,NULL,1),(8,2,4,NULL,NULL,1),(9,3,1,NULL,NULL,1),(10,3,2,NULL,NULL,1),(11,3,3,NULL,NULL,1),(12,3,4,NULL,NULL,1),(13,4,1,NULL,NULL,1),(14,4,2,NULL,NULL,1),(15,4,3,NULL,NULL,1),(16,4,4,NULL,NULL,1),(17,5,1,NULL,NULL,1),(18,5,2,NULL,NULL,1),(19,5,3,NULL,NULL,1),(20,5,4,NULL,NULL,1),(21,6,1,NULL,NULL,1),(22,6,2,NULL,NULL,1),(23,6,3,NULL,NULL,1),(24,6,4,NULL,NULL,1),(25,7,1,NULL,NULL,1),(26,7,2,NULL,NULL,1),(27,7,3,NULL,NULL,1),(28,7,4,NULL,NULL,1),(29,8,1,NULL,NULL,1),(30,8,2,NULL,NULL,1),(31,8,3,NULL,NULL,1),(32,8,4,NULL,NULL,1),(33,9,1,NULL,NULL,1),(34,9,2,NULL,NULL,1),(35,9,3,NULL,NULL,1),(36,9,4,NULL,NULL,1),(37,10,1,NULL,NULL,1),(38,10,2,NULL,NULL,1),(39,10,3,NULL,NULL,1),(40,10,4,NULL,NULL,1),(41,11,1,NULL,NULL,1),(42,11,2,NULL,NULL,1),(43,11,3,NULL,NULL,1),(44,11,4,NULL,NULL,1),(45,12,1,NULL,NULL,1),(46,12,2,NULL,NULL,1),(47,12,3,NULL,NULL,1),(48,12,4,NULL,NULL,1),(49,13,1,NULL,NULL,1),(50,13,2,NULL,NULL,1),(51,13,3,NULL,NULL,1),(52,13,4,NULL,NULL,1),(53,14,1,NULL,NULL,1),(54,14,2,NULL,NULL,1),(55,14,3,NULL,NULL,1),(56,14,4,NULL,NULL,1),(57,15,1,NULL,NULL,1),(58,15,2,NULL,NULL,1),(59,15,3,NULL,NULL,1),(60,15,4,NULL,NULL,1),(61,16,1,NULL,NULL,1),(62,16,2,NULL,NULL,1),(63,16,3,NULL,NULL,1),(64,16,4,NULL,NULL,1),(65,17,1,NULL,NULL,1),(66,17,2,NULL,NULL,1),(67,17,3,NULL,NULL,1),(68,17,4,NULL,NULL,1),(69,18,1,NULL,NULL,1),(70,18,2,NULL,NULL,1),(71,18,3,NULL,NULL,1),(72,18,4,NULL,NULL,1),(73,19,1,NULL,NULL,1),(74,19,2,NULL,NULL,1),(75,19,3,NULL,NULL,1),(76,19,4,NULL,NULL,1),(77,20,1,'2026-08-19',NULL,1),(78,20,2,'2026-08-19',NULL,1),(79,20,3,'2026-08-19',NULL,1),(80,21,1,'2026-08-19',NULL,1),(81,21,6,'2026-08-19',NULL,1),(83,22,1,'2026-09-02',NULL,1);
/*!40000 ALTER TABLE `rbac_modulos_operaciones` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `rbac_operaciones`
LOCK TABLES `rbac_operaciones` WRITE;
/*!40000 ALTER TABLE `rbac_operaciones` DISABLE KEYS */;
INSERT INTO `rbac_operaciones` VALUES (1,'ver'),(2,'editar'),(3,'crear'),(4,'eliminar'),(6,'ver-auditoria');
/*!40000 ALTER TABLE `rbac_operaciones` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `rbac_rol`
LOCK TABLES `rbac_rol` WRITE;
/*!40000 ALTER TABLE `rbac_rol` DISABLE KEYS */;
INSERT INTO `rbac_rol` VALUES (1,'Administrado GRECUH','grecuh_admin',1),(2,'Gestor GRECUH','grecuh_gest',1),(3,'Infraestructura GRECUH','grecuh_infr',1),(6,'Recursos Humano GRECUH','grecuh_rrhh',1),(8,'Administrador del Sistema','ADMIN_SIST',1),(9,'Docente Investigador','DOCENTE_IN',1),(10,'Director de Investigación','DIRECTOR_I',1),(11,'Revisor Externo','REVISOR_E',0),(12,'Director de Investigación','DIRECTOR_INV',1),(13,'Revisor Externo','REVISOR_EXT',0),(14,'Gestor Bienestar','bien_gestor',1),(15,'Alumno','alumno',1),(16,'Miembro Tribunal','bien_tribunal',1),(17,'Configurador Sistema','bien_infraestructura',1),(18,'Administrador Bienestar','bien_admin',1),(19,'Docente Bienestar','bien_docente',1),(20,'Administrador GACAD','gacad_admin',1),(21,'Gestor GACAD','gacad_gestor',1),(22,'Infraestructura GACAD','gacad_infra',1),(23,'Administrador GADMI','gadmi_admin',1),(24,'Egresado','egresado',1),(25,'Docente','docente',1),(26,'[COND] Administrador Conducción','gacad_cond_admin',1),(27,'[COND] Gestor Conducción','gacad_cond_gestor',1),(28,'[COND] Inspector Conducción','gacad_cond_inspector',1),(29,'[COND] Supervisor Conducción','gacad_cond_supervisor',1);
/*!40000 ALTER TABLE `rbac_rol` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `rbac_rol_modulo_operacion`
LOCK TABLES `rbac_rol_modulo_operacion` WRITE;
/*!40000 ALTER TABLE `rbac_rol_modulo_operacion` DISABLE KEYS */;
INSERT INTO `rbac_rol_modulo_operacion` VALUES (1,1,1,NULL,NULL,NULL,1),(2,2,1,NULL,NULL,NULL,1),(3,3,1,NULL,NULL,NULL,1),(4,4,1,NULL,NULL,NULL,1),(5,5,1,NULL,NULL,NULL,1),(6,6,1,NULL,NULL,NULL,1),(7,7,1,NULL,NULL,NULL,1),(8,8,1,NULL,NULL,NULL,1),(9,9,1,NULL,NULL,NULL,1),(10,10,1,NULL,NULL,NULL,1),(11,11,1,NULL,NULL,NULL,1),(12,12,1,NULL,NULL,NULL,1),(13,13,1,NULL,NULL,NULL,1),(14,14,1,NULL,NULL,NULL,1),(15,15,1,NULL,NULL,NULL,1),(16,16,1,NULL,NULL,NULL,1),(17,17,1,NULL,NULL,NULL,1),(18,18,1,NULL,NULL,NULL,1),(19,19,1,NULL,NULL,NULL,1),(20,20,1,NULL,NULL,NULL,1),(21,1,2,NULL,NULL,NULL,1),(22,2,2,NULL,NULL,NULL,1),(23,3,2,NULL,NULL,NULL,1),(24,4,2,NULL,NULL,NULL,1),(25,5,2,NULL,NULL,NULL,1),(26,6,2,NULL,NULL,NULL,1),(27,7,2,NULL,NULL,NULL,1),(28,8,2,NULL,NULL,NULL,1),(29,9,2,NULL,NULL,NULL,1),(30,10,2,NULL,NULL,NULL,1),(31,11,2,NULL,NULL,NULL,1),(32,12,2,NULL,NULL,NULL,1),(33,17,2,NULL,NULL,NULL,1),(34,18,2,NULL,NULL,NULL,1),(35,19,2,NULL,NULL,NULL,1),(36,20,2,NULL,NULL,NULL,1),(37,1,6,NULL,NULL,NULL,1),(38,2,6,NULL,NULL,NULL,1),(39,3,6,NULL,NULL,NULL,1),(40,5,6,NULL,NULL,NULL,1),(41,6,6,NULL,NULL,NULL,1),(42,7,6,NULL,NULL,NULL,1),(67,9,3,NULL,NULL,NULL,1),(68,10,3,NULL,NULL,NULL,1),(69,11,3,NULL,NULL,NULL,1),(70,12,3,NULL,NULL,NULL,1),(71,13,3,NULL,NULL,NULL,1),(72,14,3,NULL,NULL,NULL,1),(73,15,3,NULL,NULL,NULL,1),(74,16,3,NULL,NULL,NULL,1),(75,13,2,NULL,NULL,NULL,1),(76,13,6,NULL,NULL,NULL,1),(77,14,2,NULL,NULL,NULL,1),(78,15,2,NULL,NULL,NULL,1),(79,25,14,NULL,NULL,NULL,1),(80,29,14,NULL,NULL,NULL,1),(81,33,14,NULL,NULL,NULL,1),(82,34,14,NULL,NULL,NULL,1),(83,35,14,NULL,NULL,NULL,1),(84,37,14,NULL,NULL,NULL,1),(85,41,14,NULL,NULL,NULL,1),(86,29,15,NULL,NULL,NULL,1),(87,30,15,NULL,NULL,NULL,1),(88,31,15,NULL,NULL,NULL,1),(89,33,16,NULL,NULL,NULL,1),(90,37,16,NULL,NULL,NULL,1),(91,38,16,NULL,NULL,NULL,1),(92,39,16,NULL,NULL,NULL,1),(93,41,16,NULL,NULL,NULL,1),(94,42,16,NULL,NULL,NULL,1),(95,43,16,NULL,NULL,NULL,1),(96,21,17,NULL,NULL,NULL,1),(97,22,17,NULL,NULL,NULL,1),(98,23,17,NULL,NULL,NULL,1),(99,25,17,NULL,NULL,NULL,1),(100,26,17,NULL,NULL,NULL,1),(101,27,17,NULL,NULL,NULL,1),(102,21,18,NULL,NULL,NULL,1),(103,22,18,NULL,NULL,NULL,1),(104,23,18,NULL,NULL,NULL,1),(105,24,18,NULL,NULL,NULL,1),(106,25,18,NULL,NULL,NULL,1),(107,26,18,NULL,NULL,NULL,1),(108,27,18,NULL,NULL,NULL,1),(109,28,18,NULL,NULL,NULL,1),(110,29,18,NULL,NULL,NULL,1),(111,30,18,NULL,NULL,NULL,1),(112,31,18,NULL,NULL,NULL,1),(113,32,18,NULL,NULL,NULL,1),(114,33,18,NULL,NULL,NULL,1),(115,34,18,NULL,NULL,NULL,1),(116,35,18,NULL,NULL,NULL,1),(117,36,18,NULL,NULL,NULL,1),(118,37,18,NULL,NULL,NULL,1),(119,38,18,NULL,NULL,NULL,1),(120,39,18,NULL,NULL,NULL,1),(121,40,18,NULL,NULL,NULL,1),(122,41,18,NULL,NULL,NULL,1),(123,45,20,NULL,NULL,NULL,1),(124,46,20,NULL,NULL,NULL,1),(125,47,20,NULL,NULL,NULL,1),(126,49,20,NULL,NULL,NULL,1),(127,50,20,NULL,NULL,NULL,1),(128,51,20,NULL,NULL,NULL,1),(129,53,20,NULL,NULL,NULL,1),(130,54,20,NULL,NULL,NULL,1),(131,55,20,NULL,NULL,NULL,1),(132,48,20,NULL,NULL,NULL,1),(133,52,20,NULL,NULL,NULL,1),(134,56,20,NULL,NULL,NULL,1),(135,57,20,NULL,NULL,NULL,1),(136,58,20,NULL,NULL,NULL,1),(137,59,20,NULL,NULL,NULL,1),(138,60,20,NULL,NULL,NULL,1),(139,45,21,NULL,NULL,NULL,1),(140,46,21,NULL,NULL,NULL,1),(141,47,21,NULL,NULL,NULL,1),(142,48,21,NULL,NULL,NULL,1),(143,57,21,NULL,NULL,NULL,1),(144,58,21,NULL,NULL,NULL,1),(145,59,21,NULL,NULL,NULL,1),(146,60,21,NULL,NULL,NULL,1),(147,49,22,NULL,NULL,NULL,1),(148,50,22,NULL,NULL,NULL,1),(149,51,22,NULL,NULL,NULL,1),(150,54,22,NULL,NULL,NULL,1),(151,55,22,NULL,NULL,NULL,1),(152,52,22,NULL,NULL,NULL,1),(153,56,22,NULL,NULL,NULL,1),(154,45,26,'2026-08-19',NULL,NULL,1),(155,53,26,'2026-08-19',NULL,NULL,1),(156,45,27,'2026-08-19',NULL,NULL,1),(157,53,27,'2026-08-19',NULL,NULL,1),(158,46,26,'2026-08-19',NULL,NULL,1),(159,54,26,'2026-08-19',NULL,NULL,1),(160,46,27,'2026-08-19',NULL,NULL,1),(161,54,27,'2026-08-19',NULL,NULL,1),(162,47,26,'2026-08-19',NULL,NULL,1),(163,55,26,'2026-08-19',NULL,NULL,1),(164,47,27,'2026-08-19',NULL,NULL,1),(165,55,27,'2026-08-19',NULL,NULL,1),(166,48,26,'2026-08-19',NULL,NULL,1),(167,56,26,'2026-08-19',NULL,NULL,1),(168,48,27,'2026-08-19',NULL,NULL,1),(169,56,27,'2026-08-19',NULL,NULL,1),(185,45,28,'2026-08-19',NULL,NULL,1),(186,53,28,'2026-08-19',NULL,NULL,1),(188,53,29,'2026-08-19',NULL,NULL,1),(189,77,25,'2026-08-19',NULL,NULL,1),(190,78,25,'2026-08-19',NULL,NULL,1),(191,79,25,'2026-08-19',NULL,NULL,1),(192,80,20,'2026-08-19',NULL,NULL,1),(193,80,21,'2026-08-19',NULL,NULL,1),(194,80,22,'2026-08-19',NULL,NULL,1),(195,80,26,'2026-08-19',NULL,NULL,1),(196,80,27,'2026-08-19',NULL,NULL,1),(197,80,28,'2026-08-19',NULL,NULL,1),(198,80,29,'2026-08-19',NULL,NULL,1),(199,81,20,'2026-08-19',NULL,NULL,1),(200,83,20,'2026-09-02',NULL,NULL,1),(201,83,26,'2026-09-02',NULL,NULL,1);
/*!40000 ALTER TABLE `rbac_rol_modulo_operacion` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `rbac_sistema`
LOCK TABLES `rbac_sistema` WRITE;
/*!40000 ALTER TABLE `rbac_sistema` DISABLE KEYS */;
INSERT INTO `rbac_sistema` VALUES (1,'grecuh','RRHH','http://localhost:4200','people'),(2,'bien_proy062026','Bienestar Institucional','http://localhost:4200','school'),(3,'gacad','Gestion Academica','http://localhost:4200','calendar_month'),(4,'gadmi','Gestion Administracion de Sistemas','http://localhost:4200',NULL);
/*!40000 ALTER TABLE `rbac_sistema` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `relacion_ies`
LOCK TABLES `relacion_ies` WRITE;
/*!40000 ALTER TABLE `relacion_ies` DISABLE KEYS */;
INSERT INTO `relacion_ies` VALUES (1,'CONTRATO CON RELACION DE DEPENDENCIA'),(2,'CONTRATO SIN RELACION DE DEPENDENCIA');
/*!40000 ALTER TABLE `relacion_ies` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `secciones`
LOCK TABLES `secciones` WRITE;
/*!40000 ALTER TABLE `secciones` DISABLE KEYS */;
INSERT INTO `secciones` VALUES (1,'MATUTINA','M'),(2,'NOCTURNA','N'),(3,'VESPERTINA','V'),(4,'FIN SEMAN','F');
/*!40000 ALTER TABLE `secciones` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `semanas_horarios`
LOCK TABLES `semanas_horarios` WRITE;
/*!40000 ALTER TABLE `semanas_horarios` DISABLE KEYS */;
INSERT INTO `semanas_horarios` VALUES (1,'Semana 1',1,NULL),(2,'Semana 2',1,NULL),(3,'Semana 3',1,NULL),(4,'Semana 4',1,NULL),(5,'Semana 5',1,NULL),(6,'Semana 6',1,NULL),(7,'Semana 7',1,NULL),(8,'Semana 8',1,NULL),(9,'Semana 9',1,1),(10,'Semana 10',1,NULL),(11,'Semana 11',1,NULL),(12,'Semana 12',1,NULL),(13,'Semana 13',1,NULL),(14,'Semana 14',1,NULL),(15,'Semana 15',1,NULL),(16,'Semana 16',1,NULL),(17,'Semana 17',1,NULL),(18,'Semana 18',1,NULL),(19,'Semana 19',1,1),(20,'Semana 20',1,1),(21,'Semana 21',1,NULL),(22,'Semana 22',1,NULL),(23,'Semana 23',1,NULL),(24,'Semana 24',1,NULL),(25,'Semana 25',1,NULL),(26,'Semana 26',1,NULL),(27,'Semana 27',1,NULL),(28,'Semana 28',1,NULL),(29,'Semana 30',1,NULL),(30,'Semana 31',1,NULL),(31,'Semana 32',1,NULL),(32,'Semana 33',1,NULL),(33,'Semana 34',1,NULL),(34,'Semana 35',1,NULL),(35,'Semana 36',1,NULL),(36,'Semana 37',1,NULL),(37,'Semana 38',1,NULL),(38,'Semana 39',1,NULL),(39,'Semana 40',1,NULL),(40,'Semana 41',1,NULL),(41,'Semana 42',1,NULL),(42,'Semana 43',1,NULL),(43,'Semana 44',1,NULL),(44,'Semana 45',1,NULL);
/*!40000 ALTER TABLE `semanas_horarios` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `tipo_funcionario`
LOCK TABLES `tipo_funcionario` WRITE;
/*!40000 ALTER TABLE `tipo_funcionario` DISABLE KEYS */;
INSERT INTO `tipo_funcionario` VALUES (1,'Academia',_binary ''),(2,'Administrativo ISTPET',_binary ''),(3,'Servicios Esc. Cond',_binary ''),(4,'Docente Esc. Cond',_binary ''),(5,'Instructor Esc. Cond',_binary ''),(6,'Servicios ISTPET',_binary ''),(7,'Administrativo Esc Cond',_binary '');
/*!40000 ALTER TABLE `tipo_funcionario` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `tipos_asignatura`
LOCK TABLES `tipos_asignatura` WRITE;
/*!40000 ALTER TABLE `tipos_asignatura` DISABLE KEYS */;
INSERT INTO `tipos_asignatura` VALUES (1,'BASICA','B',1,NULL),(2,'PROFESIONAL','P',1,NULL),(3,'TRONCO COMUN','TR',1,0);
/*!40000 ALTER TABLE `tipos_asignatura` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `tipos_documentos`
LOCK TABLES `tipos_documentos` WRITE;
/*!40000 ALTER TABLE `tipos_documentos` DISABLE KEYS */;
INSERT INTO `tipos_documentos` VALUES (1,'Word','docx'),(2,'PDF','pdf');
/*!40000 ALTER TABLE `tipos_documentos` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `tiposangre`
LOCK TABLES `tiposangre` WRITE;
/*!40000 ALTER TABLE `tiposangre` DISABLE KEYS */;
INSERT INTO `tiposangre` VALUES ('ABRH+','AB',1),('ABRH-','AB',0),('ARH+','A',1),('ARH-','A',0),('BRH+','B',1),('BRH-','B',0),('N/D','ND',0),('ORH+','O',1),('ORH-','O',0);
/*!40000 ALTER TABLE `tiposangre` ENABLE KEYS */;
UNLOCK TABLES;

-- Datos para la tabla `tiposdocumentosi`
LOCK TABLES `tiposdocumentosi` WRITE;
/*!40000 ALTER TABLE `tiposdocumentosi` DISABLE KEYS */;
INSERT INTO `tiposdocumentosi` VALUES ('C','CEDULA IDENTIDAD',1),('P','PASAPORTE',1),('R','RUC',1);
/*!40000 ALTER TABLE `tiposdocumentosi` ENABLE KEYS */;
UNLOCK TABLES;

-- -----------------------------------------------------------------------------
-- 3. DOCENTES Y PROFESORES ANONIMIZADOS (LOPDP COMPLIANT CON CLAVE 12345)
-- -----------------------------------------------------------------------------
LOCK TABLES `profesores` WRITE;
/*!40000 ALTER TABLE `profesores` DISABLE KEYS */;
INSERT INTO `profesores` VALUES
('1725555377', '1', 'Doicela', 'Molina', 'Doicela', 'Molina', 'Jorge', 'Ismael', 1, 'Quito', 'Av. Principal', 'Calle 1', 'S/N', '022222222', '0999999999', 'jorge.doicela@istpet.edu.ec', '1990-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'jorge.doicela@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720000002', '1', 'Valencia', 'Llerena', 'Valencia', 'Llerena', 'Carlos', 'Enrique', 1, 'Quito', 'Av. Principal', 'Calle 2', 'S/N', '022222222', '0999999999', 'carlos.valencia@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'carlos.valencia@istpet.edu.ec', '2018-01-01', '2018-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720000003', '1', 'Proaño', 'Ramos', 'Proaño', 'Ramos', 'Marcia', 'Elena', 1, 'Quito', 'Av. Principal', 'Calle 3', 'S/N', '022222222', '0999999999', 'vicerrectorado@istpet.edu.ec', '1980-01-01', 'F', '12345', 0, 'P', 'Ecuatoriana', 'Msc.', 'Msc.', '', 1, 1, 1, 1, 'vicerrectorado@istpet.edu.ec', '2015-01-01', '2015-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720000004', '1', 'Guaman', 'Perez', 'Guaman', 'Perez', 'David', 'Alejandro', 1, 'Quito', 'Av. Principal', 'Calle 4', 'S/N', '022222222', '0999999999', 'coordinacion.software@istpet.edu.ec', '1988-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'coordinacion.software@istpet.edu.ec', '2019-01-01', '2019-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720000005', '1', 'Andrade', 'Torres', 'Andrade', 'Torres', 'Silvia', 'Patricia', 1, 'Quito', 'Av. Principal', 'Calle 5', 'S/N', '022222222', '0999999999', 'coordinacion.academica@istpet.edu.ec', '1982-01-01', 'F', '12345', 0, 'P', 'Ecuatoriana', 'Msc.', 'Msc.', '', 1, 1, 1, 1, 'coordinacion.academica@istpet.edu.ec', '2016-01-01', '2016-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1802707511', '1', 'Baño', '', 'Baño', '', 'Freddy', '', 1, 'Quito', 'Av. Principal', 'Calle 6', 'S/N', '022222222', '0999999999', 'freddy.bano@istpet.edu.ec', '1975-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Msc.', 'Msc.', '', 1, 1, 1, 1, 'freddy.bano@istpet.edu.ec', '2010-01-01', '2010-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0502405889', '1', 'Cobos', '', 'Cobos', '', 'Cristian', '', 1, 'Quito', 'Av. Principal', 'Calle 7', 'S/N', '022222222', '0999999999', 'cristian.cobos@istpet.edu.ec', '1983-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Msc.', 'Msc.', '', 1, 1, 1, 1, 'cristian.cobos@istpet.edu.ec', '2017-01-01', '2017-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709890626', '1', 'Trujillo', '', 'Trujillo', '', 'Wilfrido', '', 1, 'Quito', 'Av. Principal', 'Calle 8', 'S/N', '022222222', '0999999999', 'wilfrido.trujillo@istpet.edu.ec', '1978-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'wilfrido.trujillo@istpet.edu.ec', '2012-01-01', '2012-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720004793', '1', 'Castro', '', 'Castro', '', 'Christian', '', 1, 'Quito', 'Av. Principal', 'Calle 9', 'S/N', '022222222', '0999999999', 'christian.castro@istpet.edu.ec', '1986-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'christian.castro@istpet.edu.ec', '2018-01-01', '2018-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721465431', '1', 'Toapanta', '', 'Toapanta', '', 'Wilmer', '', 1, 'Quito', 'Av. Principal', 'Calle 10', 'S/N', '022222222', '0999999999', 'wilmer.toapanta@istpet.edu.ec', '1987-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'wilmer.toapanta@istpet.edu.ec', '2019-01-01', '2019-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0103563086', '1', 'DocenteApellido 1', 'DocenteNombre 1', 'DocenteApellido 1', '', 'DocenteNombre 1', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0103563086@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0103563086@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0200847705', '1', 'DocenteApellido 2', 'DocenteNombre 2', 'DocenteApellido 2', '', 'DocenteNombre 2', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0200847705@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0200847705@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201081031', '1', 'DocenteApellido 3', 'DocenteNombre 3', 'DocenteApellido 3', '', 'DocenteNombre 3', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201081031@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201081031@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201192051', '1', 'DocenteApellido 4', 'DocenteNombre 4', 'DocenteApellido 4', '', 'DocenteNombre 4', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201192051@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201192051@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201267341', '1', 'DocenteApellido 5', 'DocenteNombre 5', 'DocenteApellido 5', '', 'DocenteNombre 5', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201267341@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201267341@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201324928', '1', 'DocenteApellido 6', 'DocenteNombre 6', 'DocenteApellido 6', '', 'DocenteNombre 6', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201324928@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201324928@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201325628', '1', 'DocenteApellido 7', 'DocenteNombre 7', 'DocenteApellido 7', '', 'DocenteNombre 7', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201325628@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201325628@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201398229', '1', 'DocenteApellido 8', 'DocenteNombre 8', 'DocenteApellido 8', '', 'DocenteNombre 8', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201398229@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201398229@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201411469', '1', 'DocenteApellido 9', 'DocenteNombre 9', 'DocenteApellido 9', '', 'DocenteNombre 9', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201411469@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201411469@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201430048', '1', 'DocenteApellido 10', 'DocenteNombre 10', 'DocenteApellido 10', '', 'DocenteNombre 10', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201430048@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201430048@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201434669', '1', 'DocenteApellido 11', 'DocenteNombre 11', 'DocenteApellido 11', '', 'DocenteNombre 11', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201434669@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201434669@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201566890', '1', 'DocenteApellido 12', 'DocenteNombre 12', 'DocenteApellido 12', '', 'DocenteNombre 12', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201566890@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201566890@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201582194', '1', 'DocenteApellido 13', 'DocenteNombre 13', 'DocenteApellido 13', '', 'DocenteNombre 13', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201582194@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201582194@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201714078', '1', 'DocenteApellido 14', 'DocenteNombre 14', 'DocenteApellido 14', '', 'DocenteNombre 14', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201714078@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201714078@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201769007', '1', 'DocenteApellido 15', 'DocenteNombre 15', 'DocenteApellido 15', '', 'DocenteNombre 15', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201769007@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201769007@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('0201776085', '1', 'DocenteApellido 16', 'DocenteNombre 16', 'DocenteApellido 16', '', 'DocenteNombre 16', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201776085@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201776085@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201829942', '1', 'DocenteApellido 17', 'DocenteNombre 17', 'DocenteApellido 17', '', 'DocenteNombre 17', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201829942@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201829942@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201832060', '1', 'DocenteApellido 18', 'DocenteNombre 18', 'DocenteApellido 18', '', 'DocenteNombre 18', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201832060@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201832060@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201862000', '1', 'DocenteApellido 19', 'DocenteNombre 19', 'DocenteApellido 19', '', 'DocenteNombre 19', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201862000@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201862000@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201876901', '1', 'DocenteApellido 20', 'DocenteNombre 20', 'DocenteApellido 20', '', 'DocenteNombre 20', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201876901@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201876901@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201919693', '1', 'DocenteApellido 21', 'DocenteNombre 21', 'DocenteApellido 21', '', 'DocenteNombre 21', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201919693@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201919693@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201924826', '1', 'DocenteApellido 22', 'DocenteNombre 22', 'DocenteApellido 22', '', 'DocenteNombre 22', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201924826@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201924826@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201939899', '1', 'DocenteApellido 23', 'DocenteNombre 23', 'DocenteApellido 23', '', 'DocenteNombre 23', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201939899@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201939899@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201941093', '1', 'DocenteApellido 24', 'DocenteNombre 24', 'DocenteApellido 24', '', 'DocenteNombre 24', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201941093@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201941093@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201965332', '1', 'DocenteApellido 25', 'DocenteNombre 25', 'DocenteApellido 25', '', 'DocenteNombre 25', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201965332@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201965332@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201966041', '1', 'DocenteApellido 26', 'DocenteNombre 26', 'DocenteApellido 26', '', 'DocenteNombre 26', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201966041@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201966041@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0201972015', '1', 'DocenteApellido 27', 'DocenteNombre 27', 'DocenteApellido 27', '', 'DocenteNombre 27', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0201972015@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0201972015@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202047189', '1', 'DocenteApellido 28', 'DocenteNombre 28', 'DocenteApellido 28', '', 'DocenteNombre 28', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202047189@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202047189@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202072229', '1', 'DocenteApellido 29', 'DocenteNombre 29', 'DocenteApellido 29', '', 'DocenteNombre 29', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202072229@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202072229@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202073243', '1', 'DocenteApellido 30', 'DocenteNombre 30', 'DocenteApellido 30', '', 'DocenteNombre 30', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202073243@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202073243@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202081394', '1', 'DocenteApellido 31', 'DocenteNombre 31', 'DocenteApellido 31', '', 'DocenteNombre 31', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202081394@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202081394@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202081816', '1', 'DocenteApellido 32', 'DocenteNombre 32', 'DocenteApellido 32', '', 'DocenteNombre 32', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202081816@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202081816@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202129946', '1', 'DocenteApellido 33', 'DocenteNombre 33', 'DocenteApellido 33', '', 'DocenteNombre 33', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202129946@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202129946@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202281564', '1', 'DocenteApellido 34', 'DocenteNombre 34', 'DocenteApellido 34', '', 'DocenteNombre 34', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202281564@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202281564@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202283289', '1', 'DocenteApellido 35', 'DocenteNombre 35', 'DocenteApellido 35', '', 'DocenteNombre 35', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202283289@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202283289@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202286167', '1', 'DocenteApellido 36', 'DocenteNombre 36', 'DocenteApellido 36', '', 'DocenteNombre 36', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202286167@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202286167@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202296992', '1', 'DocenteApellido 37', 'DocenteNombre 37', 'DocenteApellido 37', '', 'DocenteNombre 37', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202296992@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202296992@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202318085', '1', 'DocenteApellido 38', 'DocenteNombre 38', 'DocenteApellido 38', '', 'DocenteNombre 38', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202318085@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202318085@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0202330403', '1', 'DocenteApellido 39', 'DocenteNombre 39', 'DocenteApellido 39', '', 'DocenteNombre 39', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0202330403@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0202330403@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0250322765', '1', 'DocenteApellido 40', 'DocenteNombre 40', 'DocenteApellido 40', '', 'DocenteNombre 40', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0250322765@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0250322765@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('0302144159', '1', 'DocenteApellido 41', 'DocenteNombre 41', 'DocenteApellido 41', '', 'DocenteNombre 41', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0302144159@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0302144159@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0401090923', '1', 'DocenteApellido 42', 'DocenteNombre 42', 'DocenteApellido 42', '', 'DocenteNombre 42', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0401090923@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0401090923@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0401123856', '1', 'DocenteApellido 43', 'DocenteNombre 43', 'DocenteApellido 43', '', 'DocenteNombre 43', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0401123856@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0401123856@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0401130638', '1', 'DocenteApellido 44', 'DocenteNombre 44', 'DocenteApellido 44', '', 'DocenteNombre 44', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0401130638@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0401130638@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0401801873', '1', 'DocenteApellido 45', 'DocenteNombre 45', 'DocenteApellido 45', '', 'DocenteNombre 45', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0401801873@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0401801873@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0401877360', '1', 'DocenteApellido 46', 'DocenteNombre 46', 'DocenteApellido 46', '', 'DocenteNombre 46', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0401877360@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0401877360@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0500665690', '1', 'DocenteApellido 47', 'DocenteNombre 47', 'DocenteApellido 47', '', 'DocenteNombre 47', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0500665690@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0500665690@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0500849849', '1', 'DocenteApellido 48', 'DocenteNombre 48', 'DocenteApellido 48', '', 'DocenteNombre 48', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0500849849@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0500849849@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0501722433', '1', 'DocenteApellido 49', 'DocenteNombre 49', 'DocenteApellido 49', '', 'DocenteNombre 49', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0501722433@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0501722433@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0501788079', '1', 'DocenteApellido 50', 'DocenteNombre 50', 'DocenteApellido 50', '', 'DocenteNombre 50', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0501788079@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0501788079@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0502304272', '1', 'DocenteApellido 51', 'DocenteNombre 51', 'DocenteApellido 51', '', 'DocenteNombre 51', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0502304272@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0502304272@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0502890692', '1', 'DocenteApellido 53', 'DocenteNombre 53', 'DocenteApellido 53', '', 'DocenteNombre 53', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0502890692@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0502890692@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0502929573', '1', 'DocenteApellido 54', 'DocenteNombre 54', 'DocenteApellido 54', '', 'DocenteNombre 54', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0502929573@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0502929573@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0502996093', '1', 'DocenteApellido 55', 'DocenteNombre 55', 'DocenteApellido 55', '', 'DocenteNombre 55', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0502996093@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0502996093@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0503151748', '1', 'DocenteApellido 56', 'DocenteNombre 56', 'DocenteApellido 56', '', 'DocenteNombre 56', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0503151748@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0503151748@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0503238248', '1', 'DocenteApellido 57', 'DocenteNombre 57', 'DocenteApellido 57', '', 'DocenteNombre 57', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0503238248@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0503238248@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0503376931', '1', 'DocenteApellido 58', 'DocenteNombre 58', 'DocenteApellido 58', '', 'DocenteNombre 58', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0503376931@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0503376931@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0503640997', '1', 'DocenteApellido 59', 'DocenteNombre 59', 'DocenteApellido 59', '', 'DocenteNombre 59', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0503640997@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0503640997@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0503840712', '1', 'DocenteApellido 60', 'DocenteNombre 60', 'DocenteApellido 60', '', 'DocenteNombre 60', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0503840712@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0503840712@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0504134073', '1', 'DocenteApellido 61', 'DocenteNombre 61', 'DocenteApellido 61', '', 'DocenteNombre 61', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0504134073@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0504134073@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0550111595', '1', 'DocenteApellido 62', 'DocenteNombre 62', 'DocenteApellido 62', '', 'DocenteNombre 62', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0550111595@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0550111595@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0601292576', '1', 'DocenteApellido 63', 'DocenteNombre 63', 'DocenteApellido 63', '', 'DocenteNombre 63', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0601292576@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0601292576@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0601888076', '1', 'DocenteApellido 64', 'DocenteNombre 64', 'DocenteApellido 64', '', 'DocenteNombre 64', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0601888076@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0601888076@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0602224255', '1', 'DocenteApellido 65', 'DocenteNombre 65', 'DocenteApellido 65', '', 'DocenteNombre 65', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0602224255@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0602224255@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0602959553', '1', 'DocenteApellido 66', 'DocenteNombre 66', 'DocenteApellido 66', '', 'DocenteNombre 66', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0602959553@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0602959553@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('0602987968', '1', 'DocenteApellido 67', 'DocenteNombre 67', 'DocenteApellido 67', '', 'DocenteNombre 67', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0602987968@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0602987968@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0602993081', '1', 'DocenteApellido 68', 'DocenteNombre 68', 'DocenteApellido 68', '', 'DocenteNombre 68', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0602993081@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0602993081@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0603574070', '1', 'DocenteApellido 69', 'DocenteNombre 69', 'DocenteApellido 69', '', 'DocenteNombre 69', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0603574070@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0603574070@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0603677865', '1', 'DocenteApellido 70', 'DocenteNombre 70', 'DocenteApellido 70', '', 'DocenteNombre 70', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0603677865@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0603677865@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0603827056', '1', 'DocenteApellido 71', 'DocenteNombre 71', 'DocenteApellido 71', '', 'DocenteNombre 71', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0603827056@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0603827056@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0603990839', '1', 'DocenteApellido 72', 'DocenteNombre 72', 'DocenteApellido 72', '', 'DocenteNombre 72', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0603990839@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0603990839@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0604114280', '1', 'DocenteApellido 73', 'DocenteNombre 73', 'DocenteApellido 73', '', 'DocenteNombre 73', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0604114280@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0604114280@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0604402248', '1', 'DocenteApellido 74', 'DocenteNombre 74', 'DocenteApellido 74', '', 'DocenteNombre 74', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0604402248@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0604402248@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0604978163', '1', 'DocenteApellido 75', 'DocenteNombre 75', 'DocenteApellido 75', '', 'DocenteNombre 75', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0604978163@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0604978163@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0605168863', '1', 'DocenteApellido 76', 'DocenteNombre 76', 'DocenteApellido 76', '', 'DocenteNombre 76', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0605168863@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0605168863@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0704407386', '1', 'DocenteApellido 77', 'DocenteNombre 77', 'DocenteApellido 77', '', 'DocenteNombre 77', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0704407386@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0704407386@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0704548205', '1', 'DocenteApellido 78', 'DocenteNombre 78', 'DocenteApellido 78', '', 'DocenteNombre 78', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0704548205@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0704548205@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0705152544', '1', 'DocenteApellido 79', 'DocenteNombre 79', 'DocenteApellido 79', '', 'DocenteNombre 79', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0705152544@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0705152544@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0800624942', '1', 'DocenteApellido 80', 'DocenteNombre 80', 'DocenteApellido 80', '', 'DocenteNombre 80', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0800624942@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0800624942@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0802362574', '1', 'DocenteApellido 81', 'DocenteNombre 81', 'DocenteApellido 81', '', 'DocenteNombre 81', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0802362574@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0802362574@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0802718742', '1', 'DocenteApellido 82', 'DocenteNombre 82', 'DocenteApellido 82', '', 'DocenteNombre 82', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0802718742@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0802718742@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0920267341', '1', 'DocenteApellido 83', 'DocenteNombre 83', 'DocenteApellido 83', '', 'DocenteNombre 83', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0920267341@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0920267341@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('0923523922', '1', 'DocenteApellido 84', 'DocenteNombre 84', 'DocenteApellido 84', '', 'DocenteNombre 84', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_0923523922@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_0923523922@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1001580537', '1', 'DocenteApellido 85', 'DocenteNombre 85', 'DocenteApellido 85', '', 'DocenteNombre 85', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1001580537@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1001580537@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1001995727', '1', 'DocenteApellido 86', 'DocenteNombre 86', 'DocenteApellido 86', '', 'DocenteNombre 86', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1001995727@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1001995727@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1001997053', '1', 'DocenteApellido 87', 'DocenteNombre 87', 'DocenteApellido 87', '', 'DocenteNombre 87', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1001997053@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1001997053@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1002182994', '1', 'DocenteApellido 88', 'DocenteNombre 88', 'DocenteApellido 88', '', 'DocenteNombre 88', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1002182994@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1002182994@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1002261061', '1', 'DocenteApellido 89', 'DocenteNombre 89', 'DocenteApellido 89', '', 'DocenteNombre 89', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1002261061@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1002261061@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1002534632', '1', 'DocenteApellido 90', 'DocenteNombre 90', 'DocenteApellido 90', '', 'DocenteNombre 90', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1002534632@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1002534632@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1002844403', '1', 'DocenteApellido 91', 'DocenteNombre 91', 'DocenteApellido 91', '', 'DocenteNombre 91', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1002844403@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1002844403@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1003987763', '1', 'DocenteApellido 92', 'DocenteNombre 92', 'DocenteApellido 92', '', 'DocenteNombre 92', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1003987763@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1003987763@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('103563086', '1', 'DocenteApellido 93', 'DocenteNombre 93', 'DocenteApellido 93', '', 'DocenteNombre 93', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_103563086@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_103563086@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1104486079', '1', 'DocenteApellido 94', 'DocenteNombre 94', 'DocenteApellido 94', '', 'DocenteNombre 94', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1104486079@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1104486079@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1104557317', '1', 'DocenteApellido 95', 'DocenteNombre 95', 'DocenteApellido 95', '', 'DocenteNombre 95', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1104557317@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1104557317@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1104895527', '1', 'DocenteApellido 96', 'DocenteNombre 96', 'DocenteApellido 96', '', 'DocenteNombre 96', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1104895527@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1104895527@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1105148884', '1', 'DocenteApellido 97', 'DocenteNombre 97', 'DocenteApellido 97', '', 'DocenteNombre 97', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1105148884@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1105148884@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1105640534', '1', 'DocenteApellido 98', 'DocenteNombre 98', 'DocenteApellido 98', '', 'DocenteNombre 98', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1105640534@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1105640534@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1205152620', '1', 'DocenteApellido 99', 'DocenteNombre 99', 'DocenteApellido 99', '', 'DocenteNombre 99', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1205152620@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1205152620@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1205566563', '1', 'DocenteApellido 100', 'DocenteNombre 100', 'DocenteApellido 100', '', 'DocenteNombre 100', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1205566563@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1205566563@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1206207506', '1', 'DocenteApellido 101', 'DocenteNombre 101', 'DocenteApellido 101', '', 'DocenteNombre 101', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1206207506@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1206207506@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1304154113', '1', 'DocenteApellido 102', 'DocenteNombre 102', 'DocenteApellido 102', '', 'DocenteNombre 102', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1304154113@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1304154113@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1309865739', '1', 'DocenteApellido 103', 'DocenteNombre 103', 'DocenteApellido 103', '', 'DocenteNombre 103', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1309865739@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1309865739@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1310169212', '1', 'DocenteApellido 104', 'DocenteNombre 104', 'DocenteApellido 104', '', 'DocenteNombre 104', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1310169212@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1310169212@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1311740375', '1', 'DocenteApellido 105', 'DocenteNombre 105', 'DocenteApellido 105', '', 'DocenteNombre 105', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1311740375@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1311740375@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1312179367', '1', 'DocenteApellido 106', 'DocenteNombre 106', 'DocenteApellido 106', '', 'DocenteNombre 106', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1312179367@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1312179367@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1312190265', '1', 'DocenteApellido 107', 'DocenteNombre 107', 'DocenteApellido 107', '', 'DocenteNombre 107', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1312190265@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1312190265@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1350517882', '1', 'DocenteApellido 108', 'DocenteNombre 108', 'DocenteApellido 108', '', 'DocenteNombre 108', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1350517882@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1350517882@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1500731219', '1', 'DocenteApellido 109', 'DocenteNombre 109', 'DocenteApellido 109', '', 'DocenteNombre 109', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1500731219@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1500731219@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1703253631', '1', 'DocenteApellido 110', 'DocenteNombre 110', 'DocenteApellido 110', '', 'DocenteNombre 110', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1703253631@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1703253631@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1703637262', '1', 'DocenteApellido 111', 'DocenteNombre 111', 'DocenteApellido 111', '', 'DocenteNombre 111', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1703637262@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1703637262@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1703665826', '1', 'DocenteApellido 112', 'DocenteNombre 112', 'DocenteApellido 112', '', 'DocenteNombre 112', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1703665826@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1703665826@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1704294683', '1', 'DocenteApellido 113', 'DocenteNombre 113', 'DocenteApellido 113', '', 'DocenteNombre 113', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1704294683@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1704294683@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1704377439', '1', 'DocenteApellido 114', 'DocenteNombre 114', 'DocenteApellido 114', '', 'DocenteNombre 114', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1704377439@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1704377439@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1704912540', '1', 'DocenteApellido 115', 'DocenteNombre 115', 'DocenteApellido 115', '', 'DocenteNombre 115', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1704912540@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1704912540@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1704954427', '1', 'DocenteApellido 116', 'DocenteNombre 116', 'DocenteApellido 116', '', 'DocenteNombre 116', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1704954427@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1704954427@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1705284295', '1', 'DocenteApellido 117', 'DocenteNombre 117', 'DocenteApellido 117', '', 'DocenteNombre 117', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1705284295@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1705284295@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1705551396', '1', 'DocenteApellido 118', 'DocenteNombre 118', 'DocenteApellido 118', '', 'DocenteNombre 118', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1705551396@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1705551396@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1706272281', '1', 'DocenteApellido 119', 'DocenteNombre 119', 'DocenteApellido 119', '', 'DocenteNombre 119', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1706272281@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1706272281@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1706281431', '1', 'DocenteApellido 120', 'DocenteNombre 120', 'DocenteApellido 120', '', 'DocenteNombre 120', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1706281431@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1706281431@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1706342290', '1', 'DocenteApellido 121', 'DocenteNombre 121', 'DocenteApellido 121', '', 'DocenteNombre 121', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1706342290@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1706342290@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1706389275', '1', 'DocenteApellido 122', 'DocenteNombre 122', 'DocenteApellido 122', '', 'DocenteNombre 122', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1706389275@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1706389275@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1706788096', '1', 'DocenteApellido 123', 'DocenteNombre 123', 'DocenteApellido 123', '', 'DocenteNombre 123', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1706788096@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1706788096@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1706839121', '1', 'DocenteApellido 124', 'DocenteNombre 124', 'DocenteApellido 124', '', 'DocenteNombre 124', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1706839121@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1706839121@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1707024202', '1', 'DocenteApellido 125', 'DocenteNombre 125', 'DocenteApellido 125', '', 'DocenteNombre 125', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1707024202@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1707024202@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1707054225', '1', 'DocenteApellido 126', 'DocenteNombre 126', 'DocenteApellido 126', '', 'DocenteNombre 126', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1707054225@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1707054225@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1707280838', '1', 'DocenteApellido 127', 'DocenteNombre 127', 'DocenteApellido 127', '', 'DocenteNombre 127', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1707280838@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1707280838@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1707314942', '1', 'DocenteApellido 128', 'DocenteNombre 128', 'DocenteApellido 128', '', 'DocenteNombre 128', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1707314942@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1707314942@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1707456834', '1', 'DocenteApellido 129', 'DocenteNombre 129', 'DocenteApellido 129', '', 'DocenteNombre 129', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1707456834@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1707456834@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1707457899', '1', 'DocenteApellido 130', 'DocenteNombre 130', 'DocenteApellido 130', '', 'DocenteNombre 130', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1707457899@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1707457899@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1707633218', '1', 'DocenteApellido 131', 'DocenteNombre 131', 'DocenteApellido 131', '', 'DocenteNombre 131', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1707633218@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1707633218@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1708072903', '1', 'DocenteApellido 132', 'DocenteNombre 132', 'DocenteApellido 132', '', 'DocenteNombre 132', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1708072903@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1708072903@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1708073927', '1', 'DocenteApellido 133', 'DocenteNombre 133', 'DocenteApellido 133', '', 'DocenteNombre 133', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1708073927@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1708073927@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1708198534', '1', 'DocenteApellido 134', 'DocenteNombre 134', 'DocenteApellido 134', '', 'DocenteNombre 134', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1708198534@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1708198534@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1708509995', '1', 'DocenteApellido 135', 'DocenteNombre 135', 'DocenteApellido 135', '', 'DocenteNombre 135', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1708509995@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1708509995@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1708532047', '1', 'DocenteApellido 136', 'DocenteNombre 136', 'DocenteApellido 136', '', 'DocenteNombre 136', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1708532047@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1708532047@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1708658776', '1', 'DocenteApellido 137', 'DocenteNombre 137', 'DocenteApellido 137', '', 'DocenteNombre 137', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1708658776@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1708658776@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1708779564', '1', 'DocenteApellido 138', 'DocenteNombre 138', 'DocenteApellido 138', '', 'DocenteNombre 138', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1708779564@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1708779564@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709055907', '1', 'DocenteApellido 139', 'DocenteNombre 139', 'DocenteApellido 139', '', 'DocenteNombre 139', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709055907@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709055907@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709217291', '1', 'DocenteApellido 140', 'DocenteNombre 140', 'DocenteApellido 140', '', 'DocenteNombre 140', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709217291@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709217291@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709285991', '1', 'DocenteApellido 141', 'DocenteNombre 141', 'DocenteApellido 141', '', 'DocenteNombre 141', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709285991@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709285991@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1709573776', '1', 'DocenteApellido 142', 'DocenteNombre 142', 'DocenteApellido 142', '', 'DocenteNombre 142', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709573776@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709573776@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709681017', '1', 'DocenteApellido 143', 'DocenteNombre 143', 'DocenteApellido 143', '', 'DocenteNombre 143', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709681017@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709681017@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709738635', '1', 'DocenteApellido 144', 'DocenteNombre 144', 'DocenteApellido 144', '', 'DocenteNombre 144', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709738635@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709738635@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709765612', '1', 'DocenteApellido 145', 'DocenteNombre 145', 'DocenteApellido 145', '', 'DocenteNombre 145', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709765612@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709765612@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709881260', '1', 'DocenteApellido 146', 'DocenteNombre 146', 'DocenteApellido 146', '', 'DocenteNombre 146', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709881260@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709881260@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709921306', '1', 'DocenteApellido 148', 'DocenteNombre 148', 'DocenteApellido 148', '', 'DocenteNombre 148', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709921306@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709921306@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1709977860', '1', 'DocenteApellido 149', 'DocenteNombre 149', 'DocenteApellido 149', '', 'DocenteNombre 149', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1709977860@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1709977860@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710013200', '1', 'DocenteApellido 150', 'DocenteNombre 150', 'DocenteApellido 150', '', 'DocenteNombre 150', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710013200@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710013200@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710037225', '1', 'DocenteApellido 151', 'DocenteNombre 151', 'DocenteApellido 151', '', 'DocenteNombre 151', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710037225@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710037225@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710309913', '1', 'DocenteApellido 152', 'DocenteNombre 152', 'DocenteApellido 152', '', 'DocenteNombre 152', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710309913@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710309913@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710334531', '1', 'DocenteApellido 153', 'DocenteNombre 153', 'DocenteApellido 153', '', 'DocenteNombre 153', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710334531@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710334531@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710485309', '1', 'DocenteApellido 154', 'DocenteNombre 154', 'DocenteApellido 154', '', 'DocenteNombre 154', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710485309@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710485309@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710580406', '1', 'DocenteApellido 155', 'DocenteNombre 155', 'DocenteApellido 155', '', 'DocenteNombre 155', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710580406@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710580406@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710599604', '1', 'DocenteApellido 156', 'DocenteNombre 156', 'DocenteApellido 156', '', 'DocenteNombre 156', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710599604@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710599604@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710641174', '1', 'DocenteApellido 157', 'DocenteNombre 157', 'DocenteApellido 157', '', 'DocenteNombre 157', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710641174@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710641174@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710732221', '1', 'DocenteApellido 158', 'DocenteNombre 158', 'DocenteApellido 158', '', 'DocenteNombre 158', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710732221@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710732221@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710844232', '1', 'DocenteApellido 159', 'DocenteNombre 159', 'DocenteApellido 159', '', 'DocenteNombre 159', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710844232@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710844232@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710918242', '1', 'DocenteApellido 160', 'DocenteNombre 160', 'DocenteApellido 160', '', 'DocenteNombre 160', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710918242@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710918242@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1710989185', '1', 'DocenteApellido 161', 'DocenteNombre 161', 'DocenteApellido 161', '', 'DocenteNombre 161', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1710989185@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1710989185@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711158178', '1', 'DocenteApellido 162', 'DocenteNombre 162', 'DocenteApellido 162', '', 'DocenteNombre 162', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711158178@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711158178@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711239747', '1', 'DocenteApellido 163', 'DocenteNombre 163', 'DocenteApellido 163', '', 'DocenteNombre 163', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711239747@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711239747@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711319846', '1', 'DocenteApellido 164', 'DocenteNombre 164', 'DocenteApellido 164', '', 'DocenteNombre 164', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711319846@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711319846@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711320356', '1', 'DocenteApellido 165', 'DocenteNombre 165', 'DocenteApellido 165', '', 'DocenteNombre 165', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711320356@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711320356@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711326353', '1', 'DocenteApellido 166', 'DocenteNombre 166', 'DocenteApellido 166', '', 'DocenteNombre 166', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711326353@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711326353@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711391837', '1', 'DocenteApellido 167', 'DocenteNombre 167', 'DocenteApellido 167', '', 'DocenteNombre 167', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711391837@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711391837@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1711414720', '1', 'DocenteApellido 168', 'DocenteNombre 168', 'DocenteApellido 168', '', 'DocenteNombre 168', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711414720@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711414720@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711477669', '1', 'DocenteApellido 169', 'DocenteNombre 169', 'DocenteApellido 169', '', 'DocenteNombre 169', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711477669@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711477669@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711517506', '1', 'DocenteApellido 170', 'DocenteNombre 170', 'DocenteApellido 170', '', 'DocenteNombre 170', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711517506@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711517506@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711592301', '1', 'DocenteApellido 171', 'DocenteNombre 171', 'DocenteApellido 171', '', 'DocenteNombre 171', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711592301@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711592301@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711602563', '1', 'DocenteApellido 172', 'DocenteNombre 172', 'DocenteApellido 172', '', 'DocenteNombre 172', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711602563@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711602563@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711668044', '1', 'DocenteApellido 173', 'DocenteNombre 173', 'DocenteApellido 173', '', 'DocenteNombre 173', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711668044@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711668044@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711680072', '1', 'DocenteApellido 174', 'DocenteNombre 174', 'DocenteApellido 174', '', 'DocenteNombre 174', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711680072@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711680072@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711856318', '1', 'DocenteApellido 175', 'DocenteNombre 175', 'DocenteApellido 175', '', 'DocenteNombre 175', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711856318@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711856318@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711974848', '1', 'DocenteApellido 176', 'DocenteNombre 176', 'DocenteApellido 176', '', 'DocenteNombre 176', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711974848@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711974848@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1711984391', '1', 'DocenteApellido 177', 'DocenteNombre 177', 'DocenteApellido 177', '', 'DocenteNombre 177', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1711984391@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1711984391@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712032471', '1', 'DocenteApellido 178', 'DocenteNombre 178', 'DocenteApellido 178', '', 'DocenteNombre 178', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712032471@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712032471@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712035409', '1', 'DocenteApellido 179', 'DocenteNombre 179', 'DocenteApellido 179', '', 'DocenteNombre 179', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712035409@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712035409@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712117082', '1', 'DocenteApellido 180', 'DocenteNombre 180', 'DocenteApellido 180', '', 'DocenteNombre 180', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712117082@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712117082@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712352937', '1', 'DocenteApellido 181', 'DocenteNombre 181', 'DocenteApellido 181', '', 'DocenteNombre 181', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712352937@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712352937@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712416245', '1', 'DocenteApellido 182', 'DocenteNombre 182', 'DocenteApellido 182', '', 'DocenteNombre 182', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712416245@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712416245@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712471067', '1', 'DocenteApellido 183', 'DocenteNombre 183', 'DocenteApellido 183', '', 'DocenteNombre 183', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712471067@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712471067@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712492634', '1', 'DocenteApellido 184', 'DocenteNombre 184', 'DocenteApellido 184', '', 'DocenteNombre 184', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712492634@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712492634@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712537743', '1', 'DocenteApellido 185', 'DocenteNombre 185', 'DocenteApellido 185', '', 'DocenteNombre 185', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712537743@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712537743@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712644937', '1', 'DocenteApellido 186', 'DocenteNombre 186', 'DocenteApellido 186', '', 'DocenteNombre 186', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712644937@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712644937@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712677283', '1', 'DocenteApellido 187', 'DocenteNombre 187', 'DocenteApellido 187', '', 'DocenteNombre 187', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712677283@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712677283@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712687134', '1', 'DocenteApellido 188', 'DocenteNombre 188', 'DocenteApellido 188', '', 'DocenteNombre 188', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712687134@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712687134@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712714714', '1', 'DocenteApellido 189', 'DocenteNombre 189', 'DocenteApellido 189', '', 'DocenteNombre 189', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712714714@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712714714@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712773934', '1', 'DocenteApellido 190', 'DocenteNombre 190', 'DocenteApellido 190', '', 'DocenteNombre 190', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712773934@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712773934@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712785136', '1', 'DocenteApellido 191', 'DocenteNombre 191', 'DocenteApellido 191', '', 'DocenteNombre 191', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712785136@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712785136@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712810090', '1', 'DocenteApellido 192', 'DocenteNombre 192', 'DocenteApellido 192', '', 'DocenteNombre 192', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712810090@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712810090@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1712828225', '1', 'DocenteApellido 193', 'DocenteNombre 193', 'DocenteApellido 193', '', 'DocenteNombre 193', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712828225@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712828225@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712924883', '1', 'DocenteApellido 194', 'DocenteNombre 194', 'DocenteApellido 194', '', 'DocenteNombre 194', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712924883@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712924883@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712961000', '1', 'DocenteApellido 195', 'DocenteNombre 195', 'DocenteApellido 195', '', 'DocenteNombre 195', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712961000@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712961000@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1712986494', '1', 'DocenteApellido 196', 'DocenteNombre 196', 'DocenteApellido 196', '', 'DocenteNombre 196', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1712986494@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1712986494@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713049532', '1', 'DocenteApellido 197', 'DocenteNombre 197', 'DocenteApellido 197', '', 'DocenteNombre 197', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713049532@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713049532@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713137071', '1', 'DocenteApellido 198', 'DocenteNombre 198', 'DocenteApellido 198', '', 'DocenteNombre 198', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713137071@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713137071@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713206058', '1', 'DocenteApellido 199', 'DocenteNombre 199', 'DocenteApellido 199', '', 'DocenteNombre 199', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713206058@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713206058@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713225355', '1', 'DocenteApellido 200', 'DocenteNombre 200', 'DocenteApellido 200', '', 'DocenteNombre 200', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713225355@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713225355@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713228482', '1', 'DocenteApellido 201', 'DocenteNombre 201', 'DocenteApellido 201', '', 'DocenteNombre 201', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713228482@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713228482@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713243101', '1', 'DocenteApellido 202', 'DocenteNombre 202', 'DocenteApellido 202', '', 'DocenteNombre 202', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713243101@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713243101@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713267605', '1', 'DocenteApellido 203', 'DocenteNombre 203', 'DocenteApellido 203', '', 'DocenteNombre 203', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713267605@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713267605@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713269296', '1', 'DocenteApellido 204', 'DocenteNombre 204', 'DocenteApellido 204', '', 'DocenteNombre 204', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713269296@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713269296@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713293304', '1', 'DocenteApellido 205', 'DocenteNombre 205', 'DocenteApellido 205', '', 'DocenteNombre 205', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713293304@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713293304@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713368320', '1', 'DocenteApellido 206', 'DocenteNombre 206', 'DocenteApellido 206', '', 'DocenteNombre 206', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713368320@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713368320@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713430971', '1', 'DocenteApellido 207', 'DocenteNombre 207', 'DocenteApellido 207', '', 'DocenteNombre 207', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713430971@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713430971@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713432928', '1', 'DocenteApellido 208', 'DocenteNombre 208', 'DocenteApellido 208', '', 'DocenteNombre 208', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713432928@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713432928@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713435855', '1', 'DocenteApellido 209', 'DocenteNombre 209', 'DocenteApellido 209', '', 'DocenteNombre 209', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713435855@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713435855@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713484952', '1', 'DocenteApellido 210', 'DocenteNombre 210', 'DocenteApellido 210', '', 'DocenteNombre 210', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713484952@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713484952@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713485868', '1', 'DocenteApellido 211', 'DocenteNombre 211', 'DocenteApellido 211', '', 'DocenteNombre 211', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713485868@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713485868@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713597688', '1', 'DocenteApellido 212', 'DocenteNombre 212', 'DocenteApellido 212', '', 'DocenteNombre 212', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713597688@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713597688@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713614541', '1', 'DocenteApellido 213', 'DocenteNombre 213', 'DocenteApellido 213', '', 'DocenteNombre 213', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713614541@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713614541@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713623872', '1', 'DocenteApellido 214', 'DocenteNombre 214', 'DocenteApellido 214', '', 'DocenteNombre 214', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713623872@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713623872@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713628848', '1', 'DocenteApellido 215', 'DocenteNombre 215', 'DocenteApellido 215', '', 'DocenteNombre 215', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713628848@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713628848@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713629556', '1', 'DocenteApellido 216', 'DocenteNombre 216', 'DocenteApellido 216', '', 'DocenteNombre 216', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713629556@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713629556@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713638987', '1', 'DocenteApellido 217', 'DocenteNombre 217', 'DocenteApellido 217', '', 'DocenteNombre 217', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713638987@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713638987@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1713746962', '1', 'DocenteApellido 218', 'DocenteNombre 218', 'DocenteApellido 218', '', 'DocenteNombre 218', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713746962@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713746962@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713810826', '1', 'DocenteApellido 219', 'DocenteNombre 219', 'DocenteApellido 219', '', 'DocenteNombre 219', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713810826@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713810826@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713833265', '1', 'DocenteApellido 220', 'DocenteNombre 220', 'DocenteApellido 220', '', 'DocenteNombre 220', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713833265@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713833265@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1713899605', '1', 'DocenteApellido 221', 'DocenteNombre 221', 'DocenteApellido 221', '', 'DocenteNombre 221', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1713899605@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1713899605@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714046982', '1', 'DocenteApellido 222', 'DocenteNombre 222', 'DocenteApellido 222', '', 'DocenteNombre 222', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714046982@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714046982@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714116892', '1', 'DocenteApellido 223', 'DocenteNombre 223', 'DocenteApellido 223', '', 'DocenteNombre 223', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714116892@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714116892@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714129507', '1', 'DocenteApellido 224', 'DocenteNombre 224', 'DocenteApellido 224', '', 'DocenteNombre 224', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714129507@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714129507@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714170642', '1', 'DocenteApellido 225', 'DocenteNombre 225', 'DocenteApellido 225', '', 'DocenteNombre 225', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714170642@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714170642@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714225222', '1', 'DocenteApellido 226', 'DocenteNombre 226', 'DocenteApellido 226', '', 'DocenteNombre 226', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714225222@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714225222@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714248349', '1', 'DocenteApellido 227', 'DocenteNombre 227', 'DocenteApellido 227', '', 'DocenteNombre 227', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714248349@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714248349@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714273925', '1', 'DocenteApellido 228', 'DocenteNombre 228', 'DocenteApellido 228', '', 'DocenteNombre 228', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714273925@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714273925@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714289897', '1', 'DocenteApellido 229', 'DocenteNombre 229', 'DocenteApellido 229', '', 'DocenteNombre 229', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714289897@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714289897@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714407838', '1', 'DocenteApellido 230', 'DocenteNombre 230', 'DocenteApellido 230', '', 'DocenteNombre 230', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714407838@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714407838@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714413893', '1', 'DocenteApellido 231', 'DocenteNombre 231', 'DocenteApellido 231', '', 'DocenteNombre 231', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714413893@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714413893@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714419965', '1', 'DocenteApellido 232', 'DocenteNombre 232', 'DocenteApellido 232', '', 'DocenteNombre 232', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714419965@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714419965@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714494604', '1', 'DocenteApellido 233', 'DocenteNombre 233', 'DocenteApellido 233', '', 'DocenteNombre 233', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714494604@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714494604@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714515333', '1', 'DocenteApellido 234', 'DocenteNombre 234', 'DocenteApellido 234', '', 'DocenteNombre 234', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714515333@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714515333@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714582440', '1', 'DocenteApellido 235', 'DocenteNombre 235', 'DocenteApellido 235', '', 'DocenteNombre 235', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714582440@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714582440@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714614391', '1', 'DocenteApellido 236', 'DocenteNombre 236', 'DocenteApellido 236', '', 'DocenteNombre 236', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714614391@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714614391@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714753348', '1', 'DocenteApellido 237', 'DocenteNombre 237', 'DocenteApellido 237', '', 'DocenteNombre 237', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714753348@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714753348@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714773791', '1', 'DocenteApellido 238', 'DocenteNombre 238', 'DocenteApellido 238', '', 'DocenteNombre 238', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714773791@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714773791@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1714976592', '1', 'DocenteApellido 239', 'DocenteNombre 239', 'DocenteApellido 239', '', 'DocenteNombre 239', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1714976592@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1714976592@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715006399', '1', 'DocenteApellido 240', 'DocenteNombre 240', 'DocenteApellido 240', '', 'DocenteNombre 240', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715006399@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715006399@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715052906', '1', 'DocenteApellido 241', 'DocenteNombre 241', 'DocenteApellido 241', '', 'DocenteNombre 241', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715052906@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715052906@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715126940', '1', 'DocenteApellido 242', 'DocenteNombre 242', 'DocenteApellido 242', '', 'DocenteNombre 242', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715126940@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715126940@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1715181994', '1', 'DocenteApellido 243', 'DocenteNombre 243', 'DocenteApellido 243', '', 'DocenteNombre 243', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715181994@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715181994@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715199848', '1', 'DocenteApellido 244', 'DocenteNombre 244', 'DocenteApellido 244', '', 'DocenteNombre 244', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715199848@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715199848@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715210884', '1', 'DocenteApellido 245', 'DocenteNombre 245', 'DocenteApellido 245', '', 'DocenteNombre 245', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715210884@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715210884@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715223523', '1', 'DocenteApellido 246', 'DocenteNombre 246', 'DocenteApellido 246', '', 'DocenteNombre 246', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715223523@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715223523@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715223887', '1', 'DocenteApellido 247', 'DocenteNombre 247', 'DocenteApellido 247', '', 'DocenteNombre 247', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715223887@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715223887@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715224604', '1', 'DocenteApellido 248', 'DocenteNombre 248', 'DocenteApellido 248', '', 'DocenteNombre 248', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715224604@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715224604@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715299150', '1', 'DocenteApellido 249', 'DocenteNombre 249', 'DocenteApellido 249', '', 'DocenteNombre 249', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715299150@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715299150@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715506026', '1', 'DocenteApellido 250', 'DocenteNombre 250', 'DocenteApellido 250', '', 'DocenteNombre 250', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715506026@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715506026@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715708838', '1', 'DocenteApellido 251', 'DocenteNombre 251', 'DocenteApellido 251', '', 'DocenteNombre 251', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715708838@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715708838@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715709679', '1', 'DocenteApellido 252', 'DocenteNombre 252', 'DocenteApellido 252', '', 'DocenteNombre 252', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715709679@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715709679@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715747174', '1', 'DocenteApellido 253', 'DocenteNombre 253', 'DocenteApellido 253', '', 'DocenteNombre 253', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715747174@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715747174@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715832588', '1', 'DocenteApellido 254', 'DocenteNombre 254', 'DocenteApellido 254', '', 'DocenteNombre 254', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715832588@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715832588@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715839898', '1', 'DocenteApellido 255', 'DocenteNombre 255', 'DocenteApellido 255', '', 'DocenteNombre 255', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715839898@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715839898@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715963797', '1', 'DocenteApellido 256', 'DocenteNombre 256', 'DocenteApellido 256', '', 'DocenteNombre 256', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715963797@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715963797@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1715975700', '1', 'DocenteApellido 257', 'DocenteNombre 257', 'DocenteApellido 257', '', 'DocenteNombre 257', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1715975700@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1715975700@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716038078', '1', 'DocenteApellido 258', 'DocenteNombre 258', 'DocenteApellido 258', '', 'DocenteNombre 258', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716038078@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716038078@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716064694', '1', 'DocenteApellido 259', 'DocenteNombre 259', 'DocenteApellido 259', '', 'DocenteNombre 259', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716064694@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716064694@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716084684', '1', 'DocenteApellido 260', 'DocenteNombre 260', 'DocenteApellido 260', '', 'DocenteNombre 260', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716084684@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716084684@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716127780', '1', 'DocenteApellido 261', 'DocenteNombre 261', 'DocenteApellido 261', '', 'DocenteNombre 261', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716127780@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716127780@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716128796', '1', 'DocenteApellido 262', 'DocenteNombre 262', 'DocenteApellido 262', '', 'DocenteNombre 262', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716128796@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716128796@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716153737', '1', 'DocenteApellido 263', 'DocenteNombre 263', 'DocenteApellido 263', '', 'DocenteNombre 263', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716153737@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716153737@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716155849', '1', 'DocenteApellido 264', 'DocenteNombre 264', 'DocenteApellido 264', '', 'DocenteNombre 264', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716155849@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716155849@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716157225', '1', 'DocenteApellido 265', 'DocenteNombre 265', 'DocenteApellido 265', '', 'DocenteNombre 265', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716157225@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716157225@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716254014', '1', 'DocenteApellido 266', 'DocenteNombre 266', 'DocenteApellido 266', '', 'DocenteNombre 266', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716254014@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716254014@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716276819', '1', 'DocenteApellido 267', 'DocenteNombre 267', 'DocenteApellido 267', '', 'DocenteNombre 267', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716276819@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716276819@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1716290414', '1', 'DocenteApellido 268', 'DocenteNombre 268', 'DocenteApellido 268', '', 'DocenteNombre 268', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716290414@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716290414@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716307127', '1', 'DocenteApellido 269', 'DocenteNombre 269', 'DocenteApellido 269', '', 'DocenteNombre 269', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716307127@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716307127@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716317712', '1', 'DocenteApellido 270', 'DocenteNombre 270', 'DocenteApellido 270', '', 'DocenteNombre 270', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716317712@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716317712@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716350853', '1', 'DocenteApellido 271', 'DocenteNombre 271', 'DocenteApellido 271', '', 'DocenteNombre 271', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716350853@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716350853@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716397243', '1', 'DocenteApellido 272', 'DocenteNombre 272', 'DocenteApellido 272', '', 'DocenteNombre 272', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716397243@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716397243@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716397359', '1', 'DocenteApellido 273', 'DocenteNombre 273', 'DocenteApellido 273', '', 'DocenteNombre 273', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716397359@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716397359@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716430754', '1', 'DocenteApellido 274', 'DocenteNombre 274', 'DocenteApellido 274', '', 'DocenteNombre 274', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716430754@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716430754@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716506744', '1', 'DocenteApellido 275', 'DocenteNombre 275', 'DocenteApellido 275', '', 'DocenteNombre 275', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716506744@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716506744@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716547896', '1', 'DocenteApellido 276', 'DocenteNombre 276', 'DocenteApellido 276', '', 'DocenteNombre 276', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716547896@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716547896@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716623846', '1', 'DocenteApellido 277', 'DocenteNombre 277', 'DocenteApellido 277', '', 'DocenteNombre 277', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716623846@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716623846@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716666894', '1', 'DocenteApellido 278', 'DocenteNombre 278', 'DocenteApellido 278', '', 'DocenteNombre 278', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716666894@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716666894@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716668460', '1', 'DocenteApellido 279', 'DocenteNombre 279', 'DocenteApellido 279', '', 'DocenteNombre 279', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716668460@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716668460@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716740954', '1', 'DocenteApellido 280', 'DocenteNombre 280', 'DocenteApellido 280', '', 'DocenteNombre 280', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716740954@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716740954@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716750268', '1', 'DocenteApellido 281', 'DocenteNombre 281', 'DocenteApellido 281', '', 'DocenteNombre 281', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716750268@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716750268@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716825623', '1', 'DocenteApellido 282', 'DocenteNombre 282', 'DocenteApellido 282', '', 'DocenteNombre 282', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716825623@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716825623@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716843154', '1', 'DocenteApellido 283', 'DocenteNombre 283', 'DocenteApellido 283', '', 'DocenteNombre 283', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716843154@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716843154@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716850480', '1', 'DocenteApellido 284', 'DocenteNombre 284', 'DocenteApellido 284', '', 'DocenteNombre 284', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716850480@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716850480@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716919939', '1', 'DocenteApellido 285', 'DocenteNombre 285', 'DocenteApellido 285', '', 'DocenteNombre 285', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716919939@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716919939@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716920200', '1', 'DocenteApellido 286', 'DocenteNombre 286', 'DocenteApellido 286', '', 'DocenteNombre 286', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716920200@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716920200@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716923980', '1', 'DocenteApellido 287', 'DocenteNombre 287', 'DocenteApellido 287', '', 'DocenteNombre 287', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716923980@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716923980@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716925779', '1', 'DocenteApellido 288', 'DocenteNombre 288', 'DocenteApellido 288', '', 'DocenteNombre 288', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716925779@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716925779@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716959075', '1', 'DocenteApellido 289', 'DocenteNombre 289', 'DocenteApellido 289', '', 'DocenteNombre 289', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716959075@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716959075@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716975360', '1', 'DocenteApellido 290', 'DocenteNombre 290', 'DocenteApellido 290', '', 'DocenteNombre 290', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716975360@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716975360@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1716997356', '1', 'DocenteApellido 291', 'DocenteNombre 291', 'DocenteApellido 291', '', 'DocenteNombre 291', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1716997356@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1716997356@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717001778', '1', 'DocenteApellido 292', 'DocenteNombre 292', 'DocenteApellido 292', '', 'DocenteNombre 292', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717001778@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717001778@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1717045718', '1', 'DocenteApellido 293', 'DocenteNombre 293', 'DocenteApellido 293', '', 'DocenteNombre 293', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717045718@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717045718@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717045726', '1', 'DocenteApellido 294', 'DocenteNombre 294', 'DocenteApellido 294', '', 'DocenteNombre 294', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717045726@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717045726@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717129793', '1', 'DocenteApellido 295', 'DocenteNombre 295', 'DocenteApellido 295', '', 'DocenteNombre 295', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717129793@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717129793@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717220931', '1', 'DocenteApellido 296', 'DocenteNombre 296', 'DocenteApellido 296', '', 'DocenteNombre 296', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717220931@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717220931@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717257651', '1', 'DocenteApellido 297', 'DocenteNombre 297', 'DocenteApellido 297', '', 'DocenteNombre 297', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717257651@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717257651@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717298853', '1', 'DocenteApellido 298', 'DocenteNombre 298', 'DocenteApellido 298', '', 'DocenteNombre 298', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717298853@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717298853@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717336380', '1', 'DocenteApellido 299', 'DocenteNombre 299', 'DocenteApellido 299', '', 'DocenteNombre 299', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717336380@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717336380@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717412157', '1', 'DocenteApellido 300', 'DocenteNombre 300', 'DocenteApellido 300', '', 'DocenteNombre 300', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717412157@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717412157@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717490732', '1', 'DocenteApellido 301', 'DocenteNombre 301', 'DocenteApellido 301', '', 'DocenteNombre 301', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717490732@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717490732@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717591307', '1', 'DocenteApellido 302', 'DocenteNombre 302', 'DocenteApellido 302', '', 'DocenteNombre 302', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717591307@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717591307@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717627879', '1', 'DocenteApellido 303', 'DocenteNombre 303', 'DocenteApellido 303', '', 'DocenteNombre 303', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717627879@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717627879@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717655649', '1', 'DocenteApellido 304', 'DocenteNombre 304', 'DocenteApellido 304', '', 'DocenteNombre 304', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717655649@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717655649@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717675290', '1', 'DocenteApellido 305', 'DocenteNombre 305', 'DocenteApellido 305', '', 'DocenteNombre 305', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717675290@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717675290@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717705774', '1', 'DocenteApellido 306', 'DocenteNombre 306', 'DocenteApellido 306', '', 'DocenteNombre 306', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717705774@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717705774@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717726614', '1', 'DocenteApellido 307', 'DocenteNombre 307', 'DocenteApellido 307', '', 'DocenteNombre 307', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717726614@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717726614@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717755548', '1', 'DocenteApellido 308', 'DocenteNombre 308', 'DocenteApellido 308', '', 'DocenteNombre 308', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717755548@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717755548@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717762049', '1', 'DocenteApellido 309', 'DocenteNombre 309', 'DocenteApellido 309', '', 'DocenteNombre 309', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717762049@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717762049@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717766602', '1', 'DocenteApellido 310', 'DocenteNombre 310', 'DocenteApellido 310', '', 'DocenteNombre 310', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717766602@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717766602@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717768871', '1', 'DocenteApellido 311', 'DocenteNombre 311', 'DocenteApellido 311', '', 'DocenteNombre 311', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717768871@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717768871@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717774861', '1', 'DocenteApellido 312', 'DocenteNombre 312', 'DocenteApellido 312', '', 'DocenteNombre 312', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717774861@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717774861@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717858623', '1', 'DocenteApellido 313', 'DocenteNombre 313', 'DocenteApellido 313', '', 'DocenteNombre 313', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717858623@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717858623@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1717926776', '1', 'DocenteApellido 314', 'DocenteNombre 314', 'DocenteApellido 314', '', 'DocenteNombre 314', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1717926776@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1717926776@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718123290', '1', 'DocenteApellido 315', 'DocenteNombre 315', 'DocenteApellido 315', '', 'DocenteNombre 315', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718123290@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718123290@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718161126', '1', 'DocenteApellido 316', 'DocenteNombre 316', 'DocenteApellido 316', '', 'DocenteNombre 316', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718161126@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718161126@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718168949', '1', 'DocenteApellido 317', 'DocenteNombre 317', 'DocenteApellido 317', '', 'DocenteNombre 317', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718168949@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718168949@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1718194861', '1', 'DocenteApellido 318', 'DocenteNombre 318', 'DocenteApellido 318', '', 'DocenteNombre 318', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718194861@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718194861@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718319674', '1', 'DocenteApellido 319', 'DocenteNombre 319', 'DocenteApellido 319', '', 'DocenteNombre 319', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718319674@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718319674@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718397258', '1', 'DocenteApellido 320', 'DocenteNombre 320', 'DocenteApellido 320', '', 'DocenteNombre 320', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718397258@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718397258@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718422445', '1', 'DocenteApellido 321', 'DocenteNombre 321', 'DocenteApellido 321', '', 'DocenteNombre 321', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718422445@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718422445@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718481979', '1', 'DocenteApellido 322', 'DocenteNombre 322', 'DocenteApellido 322', '', 'DocenteNombre 322', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718481979@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718481979@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718482092', '1', 'DocenteApellido 323', 'DocenteNombre 323', 'DocenteApellido 323', '', 'DocenteNombre 323', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718482092@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718482092@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718496498', '1', 'DocenteApellido 324', 'DocenteNombre 324', 'DocenteApellido 324', '', 'DocenteNombre 324', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718496498@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718496498@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718498734', '1', 'DocenteApellido 325', 'DocenteNombre 325', 'DocenteApellido 325', '', 'DocenteNombre 325', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718498734@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718498734@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718520404', '1', 'DocenteApellido 326', 'DocenteNombre 326', 'DocenteApellido 326', '', 'DocenteNombre 326', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718520404@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718520404@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718521832', '1', 'DocenteApellido 327', 'DocenteNombre 327', 'DocenteApellido 327', '', 'DocenteNombre 327', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718521832@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718521832@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718597642', '1', 'DocenteApellido 328', 'DocenteNombre 328', 'DocenteApellido 328', '', 'DocenteNombre 328', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718597642@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718597642@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718608621', '1', 'DocenteApellido 329', 'DocenteNombre 329', 'DocenteApellido 329', '', 'DocenteNombre 329', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718608621@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718608621@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718620816', '1', 'DocenteApellido 330', 'DocenteNombre 330', 'DocenteApellido 330', '', 'DocenteNombre 330', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718620816@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718620816@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718622515', '1', 'DocenteApellido 331', 'DocenteNombre 331', 'DocenteApellido 331', '', 'DocenteNombre 331', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718622515@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718622515@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718715624', '1', 'DocenteApellido 332', 'DocenteNombre 332', 'DocenteApellido 332', '', 'DocenteNombre 332', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718715624@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718715624@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718788365', '1', 'DocenteApellido 333', 'DocenteNombre 333', 'DocenteApellido 333', '', 'DocenteNombre 333', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718788365@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718788365@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718859620', '1', 'DocenteApellido 334', 'DocenteNombre 334', 'DocenteApellido 334', '', 'DocenteNombre 334', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718859620@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718859620@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718865106', '1', 'DocenteApellido 335', 'DocenteNombre 335', 'DocenteApellido 335', '', 'DocenteNombre 335', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718865106@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718865106@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1718917758', '1', 'DocenteApellido 336', 'DocenteNombre 336', 'DocenteApellido 336', '', 'DocenteNombre 336', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1718917758@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1718917758@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719036251', '1', 'DocenteApellido 337', 'DocenteNombre 337', 'DocenteApellido 337', '', 'DocenteNombre 337', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719036251@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719036251@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719048124', '1', 'DocenteApellido 338', 'DocenteNombre 338', 'DocenteApellido 338', '', 'DocenteNombre 338', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719048124@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719048124@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719060855', '1', 'DocenteApellido 339', 'DocenteNombre 339', 'DocenteApellido 339', '', 'DocenteNombre 339', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719060855@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719060855@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719106880', '1', 'DocenteApellido 340', 'DocenteNombre 340', 'DocenteApellido 340', '', 'DocenteNombre 340', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719106880@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719106880@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719132332', '1', 'DocenteApellido 341', 'DocenteNombre 341', 'DocenteApellido 341', '', 'DocenteNombre 341', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719132332@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719132332@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719134759', '1', 'DocenteApellido 342', 'DocenteNombre 342', 'DocenteApellido 342', '', 'DocenteNombre 342', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719134759@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719134759@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1719204354', '1', 'DocenteApellido 343', 'DocenteNombre 343', 'DocenteApellido 343', '', 'DocenteNombre 343', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719204354@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719204354@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719231761', '1', 'DocenteApellido 344', 'DocenteNombre 344', 'DocenteApellido 344', '', 'DocenteNombre 344', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719231761@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719231761@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719233478', '1', 'DocenteApellido 345', 'DocenteNombre 345', 'DocenteApellido 345', '', 'DocenteNombre 345', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719233478@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719233478@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719244913', '1', 'DocenteApellido 346', 'DocenteNombre 346', 'DocenteApellido 346', '', 'DocenteNombre 346', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719244913@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719244913@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719302133', '1', 'DocenteApellido 347', 'DocenteNombre 347', 'DocenteApellido 347', '', 'DocenteNombre 347', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719302133@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719302133@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719316893', '1', 'DocenteApellido 348', 'DocenteNombre 348', 'DocenteApellido 348', '', 'DocenteNombre 348', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719316893@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719316893@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719318873', '1', 'DocenteApellido 349', 'DocenteNombre 349', 'DocenteApellido 349', '', 'DocenteNombre 349', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719318873@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719318873@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719318907', '1', 'DocenteApellido 350', 'DocenteNombre 350', 'DocenteApellido 350', '', 'DocenteNombre 350', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719318907@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719318907@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719322149', '1', 'DocenteApellido 351', 'DocenteNombre 351', 'DocenteApellido 351', '', 'DocenteNombre 351', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719322149@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719322149@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719357632', '1', 'DocenteApellido 352', 'DocenteNombre 352', 'DocenteApellido 352', '', 'DocenteNombre 352', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719357632@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719357632@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719380337', '1', 'DocenteApellido 353', 'DocenteNombre 353', 'DocenteApellido 353', '', 'DocenteNombre 353', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719380337@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719380337@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719384610', '1', 'DocenteApellido 354', 'DocenteNombre 354', 'DocenteApellido 354', '', 'DocenteNombre 354', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719384610@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719384610@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719384990', '1', 'DocenteApellido 355', 'DocenteNombre 355', 'DocenteApellido 355', '', 'DocenteNombre 355', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719384990@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719384990@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719413625', '1', 'DocenteApellido 356', 'DocenteNombre 356', 'DocenteApellido 356', '', 'DocenteNombre 356', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719413625@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719413625@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719445353', '1', 'DocenteApellido 357', 'DocenteNombre 357', 'DocenteApellido 357', '', 'DocenteNombre 357', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719445353@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719445353@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719454553', '1', 'DocenteApellido 358', 'DocenteNombre 358', 'DocenteApellido 358', '', 'DocenteNombre 358', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719454553@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719454553@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719466243', '1', 'DocenteApellido 359', 'DocenteNombre 359', 'DocenteApellido 359', '', 'DocenteNombre 359', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719466243@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719466243@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719516294', '1', 'DocenteApellido 360', 'DocenteNombre 360', 'DocenteApellido 360', '', 'DocenteNombre 360', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719516294@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719516294@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719536961', '1', 'DocenteApellido 361', 'DocenteNombre 361', 'DocenteApellido 361', '', 'DocenteNombre 361', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719536961@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719536961@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719625061', '1', 'DocenteApellido 362', 'DocenteNombre 362', 'DocenteApellido 362', '', 'DocenteNombre 362', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719625061@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719625061@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719626002', '1', 'DocenteApellido 363', 'DocenteNombre 363', 'DocenteApellido 363', '', 'DocenteNombre 363', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719626002@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719626002@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719667071', '1', 'DocenteApellido 364', 'DocenteNombre 364', 'DocenteApellido 364', '', 'DocenteNombre 364', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719667071@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719667071@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719741017', '1', 'DocenteApellido 365', 'DocenteNombre 365', 'DocenteApellido 365', '', 'DocenteNombre 365', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719741017@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719741017@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719745943', '1', 'DocenteApellido 366', 'DocenteNombre 366', 'DocenteApellido 366', '', 'DocenteNombre 366', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719745943@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719745943@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719749689', '1', 'DocenteApellido 367', 'DocenteNombre 367', 'DocenteApellido 367', '', 'DocenteNombre 367', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719749689@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719749689@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1719831842', '1', 'DocenteApellido 368', 'DocenteNombre 368', 'DocenteApellido 368', '', 'DocenteNombre 368', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719831842@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719831842@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719873497', '1', 'DocenteApellido 369', 'DocenteNombre 369', 'DocenteApellido 369', '', 'DocenteNombre 369', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719873497@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719873497@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719939918', '1', 'DocenteApellido 370', 'DocenteNombre 370', 'DocenteApellido 370', '', 'DocenteNombre 370', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719939918@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719939918@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719947028', '1', 'DocenteApellido 371', 'DocenteNombre 371', 'DocenteApellido 371', '', 'DocenteNombre 371', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719947028@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719947028@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1719963249', '1', 'DocenteApellido 372', 'DocenteNombre 372', 'DocenteApellido 372', '', 'DocenteNombre 372', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1719963249@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1719963249@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720008745', '1', 'DocenteApellido 374', 'DocenteNombre 374', 'DocenteApellido 374', '', 'DocenteNombre 374', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720008745@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720008745@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720039336', '1', 'DocenteApellido 375', 'DocenteNombre 375', 'DocenteApellido 375', '', 'DocenteNombre 375', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720039336@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720039336@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720040755', '1', 'DocenteApellido 376', 'DocenteNombre 376', 'DocenteApellido 376', '', 'DocenteNombre 376', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720040755@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720040755@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720041233', '1', 'DocenteApellido 377', 'DocenteNombre 377', 'DocenteApellido 377', '', 'DocenteNombre 377', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720041233@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720041233@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720099389', '1', 'DocenteApellido 378', 'DocenteNombre 378', 'DocenteApellido 378', '', 'DocenteNombre 378', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720099389@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720099389@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720111358', '1', 'DocenteApellido 379', 'DocenteNombre 379', 'DocenteApellido 379', '', 'DocenteNombre 379', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720111358@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720111358@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720114600', '1', 'DocenteApellido 380', 'DocenteNombre 380', 'DocenteApellido 380', '', 'DocenteNombre 380', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720114600@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720114600@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720177748', '1', 'DocenteApellido 381', 'DocenteNombre 381', 'DocenteApellido 381', '', 'DocenteNombre 381', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720177748@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720177748@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720200219', '1', 'DocenteApellido 382', 'DocenteNombre 382', 'DocenteApellido 382', '', 'DocenteNombre 382', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720200219@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720200219@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720203395', '1', 'DocenteApellido 383', 'DocenteNombre 383', 'DocenteApellido 383', '', 'DocenteNombre 383', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720203395@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720203395@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720221074', '1', 'DocenteApellido 384', 'DocenteNombre 384', 'DocenteApellido 384', '', 'DocenteNombre 384', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720221074@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720221074@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720222528', '1', 'DocenteApellido 385', 'DocenteNombre 385', 'DocenteApellido 385', '', 'DocenteNombre 385', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720222528@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720222528@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720225539', '1', 'DocenteApellido 386', 'DocenteNombre 386', 'DocenteApellido 386', '', 'DocenteNombre 386', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720225539@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720225539@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720231115', '1', 'DocenteApellido 387', 'DocenteNombre 387', 'DocenteApellido 387', '', 'DocenteNombre 387', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720231115@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720231115@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720242013', '1', 'DocenteApellido 388', 'DocenteNombre 388', 'DocenteApellido 388', '', 'DocenteNombre 388', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720242013@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720242013@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720283397', '1', 'DocenteApellido 389', 'DocenteNombre 389', 'DocenteApellido 389', '', 'DocenteNombre 389', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720283397@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720283397@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720429867', '1', 'DocenteApellido 390', 'DocenteNombre 390', 'DocenteApellido 390', '', 'DocenteNombre 390', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720429867@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720429867@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720440948', '1', 'DocenteApellido 391', 'DocenteNombre 391', 'DocenteApellido 391', '', 'DocenteNombre 391', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720440948@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720440948@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720477031', '1', 'DocenteApellido 392', 'DocenteNombre 392', 'DocenteApellido 392', '', 'DocenteNombre 392', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720477031@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720477031@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720496379', '1', 'DocenteApellido 393', 'DocenteNombre 393', 'DocenteApellido 393', '', 'DocenteNombre 393', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720496379@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720496379@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1720723525', '1', 'DocenteApellido 394', 'DocenteNombre 394', 'DocenteApellido 394', '', 'DocenteNombre 394', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720723525@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720723525@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720753191', '1', 'DocenteApellido 395', 'DocenteNombre 395', 'DocenteApellido 395', '', 'DocenteNombre 395', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720753191@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720753191@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720954427', '1', 'DocenteApellido 396', 'DocenteNombre 396', 'DocenteApellido 396', '', 'DocenteNombre 396', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720954427@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720954427@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720970688', '1', 'DocenteApellido 397', 'DocenteNombre 397', 'DocenteApellido 397', '', 'DocenteNombre 397', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720970688@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720970688@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1720989670', '1', 'DocenteApellido 398', 'DocenteNombre 398', 'DocenteApellido 398', '', 'DocenteNombre 398', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1720989670@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1720989670@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721040788', '1', 'DocenteApellido 399', 'DocenteNombre 399', 'DocenteApellido 399', '', 'DocenteNombre 399', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721040788@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721040788@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721112041', '1', 'DocenteApellido 400', 'DocenteNombre 400', 'DocenteApellido 400', '', 'DocenteNombre 400', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721112041@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721112041@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721147369', '1', 'DocenteApellido 401', 'DocenteNombre 401', 'DocenteApellido 401', '', 'DocenteNombre 401', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721147369@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721147369@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721154654', '1', 'DocenteApellido 402', 'DocenteNombre 402', 'DocenteApellido 402', '', 'DocenteNombre 402', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721154654@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721154654@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721162285', '1', 'DocenteApellido 403', 'DocenteNombre 403', 'DocenteApellido 403', '', 'DocenteNombre 403', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721162285@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721162285@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721166559', '1', 'DocenteApellido 404', 'DocenteNombre 404', 'DocenteApellido 404', '', 'DocenteNombre 404', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721166559@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721166559@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721182085', '1', 'DocenteApellido 405', 'DocenteNombre 405', 'DocenteApellido 405', '', 'DocenteNombre 405', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721182085@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721182085@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721188256', '1', 'DocenteApellido 406', 'DocenteNombre 406', 'DocenteApellido 406', '', 'DocenteNombre 406', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721188256@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721188256@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721189825', '1', 'DocenteApellido 407', 'DocenteNombre 407', 'DocenteApellido 407', '', 'DocenteNombre 407', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721189825@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721189825@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721251385', '1', 'DocenteApellido 408', 'DocenteNombre 408', 'DocenteApellido 408', '', 'DocenteNombre 408', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721251385@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721251385@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721251393', '1', 'DocenteApellido 409', 'DocenteNombre 409', 'DocenteApellido 409', '', 'DocenteNombre 409', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721251393@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721251393@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721267050', '1', 'DocenteApellido 410', 'DocenteNombre 410', 'DocenteApellido 410', '', 'DocenteNombre 410', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721267050@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721267050@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721280418', '1', 'DocenteApellido 411', 'DocenteNombre 411', 'DocenteApellido 411', '', 'DocenteNombre 411', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721280418@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721280418@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721285748', '1', 'DocenteApellido 412', 'DocenteNombre 412', 'DocenteApellido 412', '', 'DocenteNombre 412', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721285748@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721285748@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721327433', '1', 'DocenteApellido 413', 'DocenteNombre 413', 'DocenteApellido 413', '', 'DocenteNombre 413', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721327433@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721327433@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721343943', '1', 'DocenteApellido 414', 'DocenteNombre 414', 'DocenteApellido 414', '', 'DocenteNombre 414', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721343943@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721343943@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721366860', '1', 'DocenteApellido 415', 'DocenteNombre 415', 'DocenteApellido 415', '', 'DocenteNombre 415', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721366860@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721366860@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721368197', '1', 'DocenteApellido 416', 'DocenteNombre 416', 'DocenteApellido 416', '', 'DocenteNombre 416', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721368197@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721368197@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721435137', '1', 'DocenteApellido 417', 'DocenteNombre 417', 'DocenteApellido 417', '', 'DocenteNombre 417', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721435137@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721435137@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721438818', '1', 'DocenteApellido 418', 'DocenteNombre 418', 'DocenteApellido 418', '', 'DocenteNombre 418', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721438818@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721438818@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1721441028', '1', 'DocenteApellido 419', 'DocenteNombre 419', 'DocenteApellido 419', '', 'DocenteNombre 419', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721441028@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721441028@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721449039', '1', 'DocenteApellido 420', 'DocenteNombre 420', 'DocenteApellido 420', '', 'DocenteNombre 420', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721449039@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721449039@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721525846', '1', 'DocenteApellido 422', 'DocenteNombre 422', 'DocenteApellido 422', '', 'DocenteNombre 422', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721525846@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721525846@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721592770', '1', 'DocenteApellido 423', 'DocenteNombre 423', 'DocenteApellido 423', '', 'DocenteNombre 423', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721592770@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721592770@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721610754', '1', 'DocenteApellido 424', 'DocenteNombre 424', 'DocenteApellido 424', '', 'DocenteNombre 424', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721610754@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721610754@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721734083', '1', 'DocenteApellido 425', 'DocenteNombre 425', 'DocenteApellido 425', '', 'DocenteNombre 425', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721734083@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721734083@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721741971', '1', 'DocenteApellido 426', 'DocenteNombre 426', 'DocenteApellido 426', '', 'DocenteNombre 426', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721741971@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721741971@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721752945', '1', 'DocenteApellido 427', 'DocenteNombre 427', 'DocenteApellido 427', '', 'DocenteNombre 427', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721752945@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721752945@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721752986', '1', 'DocenteApellido 428', 'DocenteNombre 428', 'DocenteApellido 428', '', 'DocenteNombre 428', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721752986@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721752986@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721756862', '1', 'DocenteApellido 429', 'DocenteNombre 429', 'DocenteApellido 429', '', 'DocenteNombre 429', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721756862@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721756862@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721762969', '1', 'DocenteApellido 430', 'DocenteNombre 430', 'DocenteApellido 430', '', 'DocenteNombre 430', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721762969@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721762969@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721796470', '1', 'DocenteApellido 431', 'DocenteNombre 431', 'DocenteApellido 431', '', 'DocenteNombre 431', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721796470@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721796470@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721818209', '1', 'DocenteApellido 432', 'DocenteNombre 432', 'DocenteApellido 432', '', 'DocenteNombre 432', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721818209@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721818209@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721819306', '1', 'DocenteApellido 433', 'DocenteNombre 433', 'DocenteApellido 433', '', 'DocenteNombre 433', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721819306@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721819306@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721825568', '1', 'DocenteApellido 434', 'DocenteNombre 434', 'DocenteApellido 434', '', 'DocenteNombre 434', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721825568@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721825568@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721844726', '1', 'DocenteApellido 435', 'DocenteNombre 435', 'DocenteApellido 435', '', 'DocenteNombre 435', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721844726@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721844726@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721849469', '1', 'DocenteApellido 436', 'DocenteNombre 436', 'DocenteApellido 436', '', 'DocenteNombre 436', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721849469@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721849469@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721855060', '1', 'DocenteApellido 437', 'DocenteNombre 437', 'DocenteApellido 437', '', 'DocenteNombre 437', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721855060@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721855060@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721873980', '1', 'DocenteApellido 438', 'DocenteNombre 438', 'DocenteApellido 438', '', 'DocenteNombre 438', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721873980@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721873980@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721900395', '1', 'DocenteApellido 439', 'DocenteNombre 439', 'DocenteApellido 439', '', 'DocenteNombre 439', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721900395@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721900395@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721925707', '1', 'DocenteApellido 440', 'DocenteNombre 440', 'DocenteApellido 440', '', 'DocenteNombre 440', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721925707@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721925707@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721969911', '1', 'DocenteApellido 441', 'DocenteNombre 441', 'DocenteApellido 441', '', 'DocenteNombre 441', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721969911@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721969911@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1721996559', '1', 'DocenteApellido 442', 'DocenteNombre 442', 'DocenteApellido 442', '', 'DocenteNombre 442', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1721996559@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1721996559@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722012810', '1', 'DocenteApellido 443', 'DocenteNombre 443', 'DocenteApellido 443', '', 'DocenteNombre 443', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722012810@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722012810@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722022389', '1', 'DocenteApellido 444', 'DocenteNombre 444', 'DocenteApellido 444', '', 'DocenteNombre 444', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722022389@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722022389@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1722058680', '1', 'DocenteApellido 445', 'DocenteNombre 445', 'DocenteApellido 445', '', 'DocenteNombre 445', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722058680@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722058680@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722070560', '1', 'DocenteApellido 446', 'DocenteNombre 446', 'DocenteApellido 446', '', 'DocenteNombre 446', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722070560@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722070560@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722087903', '1', 'DocenteApellido 447', 'DocenteNombre 447', 'DocenteApellido 447', '', 'DocenteNombre 447', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722087903@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722087903@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722122395', '1', 'DocenteApellido 448', 'DocenteNombre 448', 'DocenteApellido 448', '', 'DocenteNombre 448', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722122395@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722122395@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722303177', '1', 'DocenteApellido 449', 'DocenteNombre 449', 'DocenteApellido 449', '', 'DocenteNombre 449', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722303177@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722303177@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722364112', '1', 'DocenteApellido 450', 'DocenteNombre 450', 'DocenteApellido 450', '', 'DocenteNombre 450', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722364112@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722364112@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722380969', '1', 'DocenteApellido 451', 'DocenteNombre 451', 'DocenteApellido 451', '', 'DocenteNombre 451', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722380969@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722380969@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722430657', '1', 'DocenteApellido 452', 'DocenteNombre 452', 'DocenteApellido 452', '', 'DocenteNombre 452', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722430657@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722430657@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722436936', '1', 'DocenteApellido 453', 'DocenteNombre 453', 'DocenteApellido 453', '', 'DocenteNombre 453', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722436936@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722436936@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722504188', '1', 'DocenteApellido 454', 'DocenteNombre 454', 'DocenteApellido 454', '', 'DocenteNombre 454', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722504188@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722504188@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722507421', '1', 'DocenteApellido 455', 'DocenteNombre 455', 'DocenteApellido 455', '', 'DocenteNombre 455', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722507421@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722507421@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722528286', '1', 'DocenteApellido 456', 'DocenteNombre 456', 'DocenteApellido 456', '', 'DocenteNombre 456', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722528286@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722528286@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722620919', '1', 'DocenteApellido 457', 'DocenteNombre 457', 'DocenteApellido 457', '', 'DocenteNombre 457', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722620919@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722620919@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722622394', '1', 'DocenteApellido 458', 'DocenteNombre 458', 'DocenteApellido 458', '', 'DocenteNombre 458', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722622394@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722622394@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722683693', '1', 'DocenteApellido 459', 'DocenteNombre 459', 'DocenteApellido 459', '', 'DocenteNombre 459', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722683693@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722683693@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722696687', '1', 'DocenteApellido 460', 'DocenteNombre 460', 'DocenteApellido 460', '', 'DocenteNombre 460', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722696687@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722696687@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722744339', '1', 'DocenteApellido 461', 'DocenteNombre 461', 'DocenteApellido 461', '', 'DocenteNombre 461', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722744339@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722744339@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722752514', '1', 'DocenteApellido 462', 'DocenteNombre 462', 'DocenteApellido 462', '', 'DocenteNombre 462', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722752514@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722752514@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722780754', '1', 'DocenteApellido 463', 'DocenteNombre 463', 'DocenteApellido 463', '', 'DocenteNombre 463', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722780754@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722780754@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722793161', '1', 'DocenteApellido 464', 'DocenteNombre 464', 'DocenteApellido 464', '', 'DocenteNombre 464', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722793161@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722793161@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722809223', '1', 'DocenteApellido 465', 'DocenteNombre 465', 'DocenteApellido 465', '', 'DocenteNombre 465', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722809223@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722809223@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1722932611', '1', 'DocenteApellido 466', 'DocenteNombre 466', 'DocenteApellido 466', '', 'DocenteNombre 466', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1722932611@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1722932611@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723019301', '1', 'DocenteApellido 467', 'DocenteNombre 467', 'DocenteApellido 467', '', 'DocenteNombre 467', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723019301@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723019301@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723029763', '1', 'DocenteApellido 468', 'DocenteNombre 468', 'DocenteApellido 468', '', 'DocenteNombre 468', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723029763@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723029763@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723041941', '1', 'DocenteApellido 469', 'DocenteNombre 469', 'DocenteApellido 469', '', 'DocenteNombre 469', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723041941@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723041941@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1723082143', '1', 'DocenteApellido 470', 'DocenteNombre 470', 'DocenteApellido 470', '', 'DocenteNombre 470', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723082143@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723082143@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723083125', '1', 'DocenteApellido 471', 'DocenteNombre 471', 'DocenteApellido 471', '', 'DocenteNombre 471', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723083125@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723083125@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723083851', '1', 'DocenteApellido 472', 'DocenteNombre 472', 'DocenteApellido 472', '', 'DocenteNombre 472', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723083851@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723083851@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723150098', '1', 'DocenteApellido 473', 'DocenteNombre 473', 'DocenteApellido 473', '', 'DocenteNombre 473', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723150098@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723150098@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723151781', '1', 'DocenteApellido 474', 'DocenteNombre 474', 'DocenteApellido 474', '', 'DocenteNombre 474', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723151781@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723151781@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723285019', '1', 'DocenteApellido 475', 'DocenteNombre 475', 'DocenteApellido 475', '', 'DocenteNombre 475', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723285019@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723285019@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723330831', '1', 'DocenteApellido 476', 'DocenteNombre 476', 'DocenteApellido 476', '', 'DocenteNombre 476', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723330831@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723330831@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723346498', '1', 'DocenteApellido 477', 'DocenteNombre 477', 'DocenteApellido 477', '', 'DocenteNombre 477', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723346498@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723346498@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723377576', '1', 'DocenteApellido 478', 'DocenteNombre 478', 'DocenteApellido 478', '', 'DocenteNombre 478', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723377576@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723377576@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723434088', '1', 'DocenteApellido 479', 'DocenteNombre 479', 'DocenteApellido 479', '', 'DocenteNombre 479', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723434088@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723434088@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723439103', '1', 'DocenteApellido 480', 'DocenteNombre 480', 'DocenteApellido 480', '', 'DocenteNombre 480', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723439103@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723439103@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723444269', '1', 'DocenteApellido 481', 'DocenteNombre 481', 'DocenteApellido 481', '', 'DocenteNombre 481', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723444269@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723444269@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723457428', '1', 'DocenteApellido 482', 'DocenteNombre 482', 'DocenteApellido 482', '', 'DocenteNombre 482', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723457428@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723457428@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723461198', '1', 'DocenteApellido 483', 'DocenteNombre 483', 'DocenteApellido 483', '', 'DocenteNombre 483', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723461198@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723461198@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723468151', '1', 'DocenteApellido 484', 'DocenteNombre 484', 'DocenteApellido 484', '', 'DocenteNombre 484', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723468151@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723468151@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723469712', '1', 'DocenteApellido 485', 'DocenteNombre 485', 'DocenteApellido 485', '', 'DocenteNombre 485', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723469712@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723469712@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723514145', '1', 'DocenteApellido 486', 'DocenteNombre 486', 'DocenteApellido 486', '', 'DocenteNombre 486', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723514145@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723514145@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723522486', '1', 'DocenteApellido 487', 'DocenteNombre 487', 'DocenteApellido 487', '', 'DocenteNombre 487', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723522486@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723522486@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723533426', '1', 'DocenteApellido 488', 'DocenteNombre 488', 'DocenteApellido 488', '', 'DocenteNombre 488', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723533426@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723533426@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723546527', '1', 'DocenteApellido 489', 'DocenteNombre 489', 'DocenteApellido 489', '', 'DocenteNombre 489', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723546527@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723546527@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723563530', '1', 'DocenteApellido 490', 'DocenteNombre 490', 'DocenteApellido 490', '', 'DocenteNombre 490', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723563530@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723563530@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723568414', '1', 'DocenteApellido 491', 'DocenteNombre 491', 'DocenteApellido 491', '', 'DocenteNombre 491', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723568414@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723568414@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723588271', '1', 'DocenteApellido 492', 'DocenteNombre 492', 'DocenteApellido 492', '', 'DocenteNombre 492', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723588271@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723588271@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723596068', '1', 'DocenteApellido 493', 'DocenteNombre 493', 'DocenteApellido 493', '', 'DocenteNombre 493', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723596068@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723596068@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723641351', '1', 'DocenteApellido 494', 'DocenteNombre 494', 'DocenteApellido 494', '', 'DocenteNombre 494', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723641351@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723641351@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1723653240', '1', 'DocenteApellido 495', 'DocenteNombre 495', 'DocenteApellido 495', '', 'DocenteNombre 495', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723653240@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723653240@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723656045', '1', 'DocenteApellido 496', 'DocenteNombre 496', 'DocenteApellido 496', '', 'DocenteNombre 496', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723656045@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723656045@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723707962', '1', 'DocenteApellido 497', 'DocenteNombre 497', 'DocenteApellido 497', '', 'DocenteNombre 497', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723707962@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723707962@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723708689', '1', 'DocenteApellido 498', 'DocenteNombre 498', 'DocenteApellido 498', '', 'DocenteNombre 498', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723708689@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723708689@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723787824', '1', 'DocenteApellido 499', 'DocenteNombre 499', 'DocenteApellido 499', '', 'DocenteNombre 499', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723787824@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723787824@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723815831', '1', 'DocenteApellido 500', 'DocenteNombre 500', 'DocenteApellido 500', '', 'DocenteNombre 500', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723815831@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723815831@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723818769', '1', 'DocenteApellido 501', 'DocenteNombre 501', 'DocenteApellido 501', '', 'DocenteNombre 501', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723818769@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723818769@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1723959811', '1', 'DocenteApellido 502', 'DocenteNombre 502', 'DocenteApellido 502', '', 'DocenteNombre 502', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1723959811@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1723959811@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724059199', '1', 'DocenteApellido 503', 'DocenteNombre 503', 'DocenteApellido 503', '', 'DocenteNombre 503', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724059199@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724059199@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724184187', '1', 'DocenteApellido 504', 'DocenteNombre 504', 'DocenteApellido 504', '', 'DocenteNombre 504', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724184187@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724184187@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724200553', '1', 'DocenteApellido 505', 'DocenteNombre 505', 'DocenteApellido 505', '', 'DocenteNombre 505', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724200553@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724200553@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724223944', '1', 'DocenteApellido 506', 'DocenteNombre 506', 'DocenteApellido 506', '', 'DocenteNombre 506', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724223944@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724223944@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724235054', '1', 'DocenteApellido 507', 'DocenteNombre 507', 'DocenteApellido 507', '', 'DocenteNombre 507', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724235054@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724235054@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724249758', '1', 'DocenteApellido 508', 'DocenteNombre 508', 'DocenteApellido 508', '', 'DocenteNombre 508', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724249758@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724249758@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724294689', '1', 'DocenteApellido 509', 'DocenteNombre 509', 'DocenteApellido 509', '', 'DocenteNombre 509', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724294689@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724294689@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724296973', '1', 'DocenteApellido 510', 'DocenteNombre 510', 'DocenteApellido 510', '', 'DocenteNombre 510', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724296973@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724296973@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724389851', '1', 'DocenteApellido 511', 'DocenteNombre 511', 'DocenteApellido 511', '', 'DocenteNombre 511', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724389851@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724389851@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724392822', '1', 'DocenteApellido 512', 'DocenteNombre 512', 'DocenteApellido 512', '', 'DocenteNombre 512', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724392822@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724392822@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724428568', '1', 'DocenteApellido 513', 'DocenteNombre 513', 'DocenteApellido 513', '', 'DocenteNombre 513', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724428568@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724428568@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724441595', '1', 'DocenteApellido 514', 'DocenteNombre 514', 'DocenteApellido 514', '', 'DocenteNombre 514', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724441595@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724441595@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724445836', '1', 'DocenteApellido 515', 'DocenteNombre 515', 'DocenteApellido 515', '', 'DocenteNombre 515', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724445836@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724445836@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724466907', '1', 'DocenteApellido 516', 'DocenteNombre 516', 'DocenteApellido 516', '', 'DocenteNombre 516', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724466907@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724466907@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724495708', '1', 'DocenteApellido 517', 'DocenteNombre 517', 'DocenteApellido 517', '', 'DocenteNombre 517', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724495708@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724495708@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724499098', '1', 'DocenteApellido 518', 'DocenteNombre 518', 'DocenteApellido 518', '', 'DocenteNombre 518', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724499098@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724499098@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724530462', '1', 'DocenteApellido 519', 'DocenteNombre 519', 'DocenteApellido 519', '', 'DocenteNombre 519', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724530462@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724530462@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1724567258', '1', 'DocenteApellido 520', 'DocenteNombre 520', 'DocenteApellido 520', '', 'DocenteNombre 520', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724567258@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724567258@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724615354', '1', 'DocenteApellido 521', 'DocenteNombre 521', 'DocenteApellido 521', '', 'DocenteNombre 521', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724615354@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724615354@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724649338', '1', 'DocenteApellido 522', 'DocenteNombre 522', 'DocenteApellido 522', '', 'DocenteNombre 522', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724649338@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724649338@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724669393', '1', 'DocenteApellido 523', 'DocenteNombre 523', 'DocenteApellido 523', '', 'DocenteNombre 523', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724669393@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724669393@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724685480', '1', 'DocenteApellido 524', 'DocenteNombre 524', 'DocenteApellido 524', '', 'DocenteNombre 524', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724685480@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724685480@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724706526', '1', 'DocenteApellido 525', 'DocenteNombre 525', 'DocenteApellido 525', '', 'DocenteNombre 525', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724706526@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724706526@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724782824', '1', 'DocenteApellido 526', 'DocenteNombre 526', 'DocenteApellido 526', '', 'DocenteNombre 526', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724782824@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724782824@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724785488', '1', 'DocenteApellido 527', 'DocenteNombre 527', 'DocenteApellido 527', '', 'DocenteNombre 527', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724785488@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724785488@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724835713', '1', 'DocenteApellido 528', 'DocenteNombre 528', 'DocenteApellido 528', '', 'DocenteNombre 528', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724835713@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724835713@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724982309', '1', 'DocenteApellido 529', 'DocenteNombre 529', 'DocenteApellido 529', '', 'DocenteNombre 529', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724982309@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724982309@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1724995558', '1', 'DocenteApellido 530', 'DocenteNombre 530', 'DocenteApellido 530', '', 'DocenteNombre 530', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1724995558@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1724995558@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725009276', '1', 'DocenteApellido 531', 'DocenteNombre 531', 'DocenteApellido 531', '', 'DocenteNombre 531', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725009276@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725009276@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725032310', '1', 'DocenteApellido 532', 'DocenteNombre 532', 'DocenteApellido 532', '', 'DocenteNombre 532', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725032310@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725032310@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725065906', '1', 'DocenteApellido 533', 'DocenteNombre 533', 'DocenteApellido 533', '', 'DocenteNombre 533', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725065906@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725065906@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725175655', '1', 'DocenteApellido 534', 'DocenteNombre 534', 'DocenteApellido 534', '', 'DocenteNombre 534', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725175655@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725175655@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725249856', '1', 'DocenteApellido 535', 'DocenteNombre 535', 'DocenteApellido 535', '', 'DocenteNombre 535', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725249856@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725249856@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725422891', '1', 'DocenteApellido 536', 'DocenteNombre 536', 'DocenteApellido 536', '', 'DocenteNombre 536', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725422891@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725422891@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725449498', '1', 'DocenteApellido 537', 'DocenteNombre 537', 'DocenteApellido 537', '', 'DocenteNombre 537', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725449498@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725449498@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725470502', '1', 'DocenteApellido 538', 'DocenteNombre 538', 'DocenteApellido 538', '', 'DocenteNombre 538', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725470502@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725470502@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725474223', '1', 'DocenteApellido 539', 'DocenteNombre 539', 'DocenteApellido 539', '', 'DocenteNombre 539', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725474223@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725474223@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725478604', '1', 'DocenteApellido 540', 'DocenteNombre 540', 'DocenteApellido 540', '', 'DocenteNombre 540', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725478604@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725478604@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725508418', '1', 'DocenteApellido 541', 'DocenteNombre 541', 'DocenteApellido 541', '', 'DocenteNombre 541', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725508418@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725508418@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725567802', '1', 'DocenteApellido 542', 'DocenteNombre 542', 'DocenteApellido 542', '', 'DocenteNombre 542', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725567802@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725567802@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725608382', '1', 'DocenteApellido 543', 'DocenteNombre 543', 'DocenteApellido 543', '', 'DocenteNombre 543', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725608382@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725608382@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725609117', '1', 'DocenteApellido 544', 'DocenteNombre 544', 'DocenteApellido 544', '', 'DocenteNombre 544', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725609117@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725609117@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1725637159', '1', 'DocenteApellido 545', 'DocenteNombre 545', 'DocenteApellido 545', '', 'DocenteNombre 545', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725637159@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725637159@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725640104', '1', 'DocenteApellido 546', 'DocenteNombre 546', 'DocenteApellido 546', '', 'DocenteNombre 546', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725640104@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725640104@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725744492', '1', 'DocenteApellido 547', 'DocenteNombre 547', 'DocenteApellido 547', '', 'DocenteNombre 547', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725744492@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725744492@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725783904', '1', 'DocenteApellido 548', 'DocenteNombre 548', 'DocenteApellido 548', '', 'DocenteNombre 548', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725783904@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725783904@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725842502', '1', 'DocenteApellido 549', 'DocenteNombre 549', 'DocenteApellido 549', '', 'DocenteNombre 549', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725842502@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725842502@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725866444', '1', 'DocenteApellido 550', 'DocenteNombre 550', 'DocenteApellido 550', '', 'DocenteNombre 550', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725866444@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725866444@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725873408', '1', 'DocenteApellido 551', 'DocenteNombre 551', 'DocenteApellido 551', '', 'DocenteNombre 551', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725873408@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725873408@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725909277', '1', 'DocenteApellido 552', 'DocenteNombre 552', 'DocenteApellido 552', '', 'DocenteNombre 552', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725909277@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725909277@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1725910291', '1', 'DocenteApellido 553', 'DocenteNombre 553', 'DocenteApellido 553', '', 'DocenteNombre 553', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1725910291@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1725910291@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726001306', '1', 'DocenteApellido 554', 'DocenteNombre 554', 'DocenteApellido 554', '', 'DocenteNombre 554', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726001306@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726001306@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726014036', '1', 'DocenteApellido 555', 'DocenteNombre 555', 'DocenteApellido 555', '', 'DocenteNombre 555', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726014036@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726014036@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726036708', '1', 'DocenteApellido 556', 'DocenteNombre 556', 'DocenteApellido 556', '', 'DocenteNombre 556', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726036708@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726036708@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726039835', '1', 'DocenteApellido 557', 'DocenteNombre 557', 'DocenteApellido 557', '', 'DocenteNombre 557', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726039835@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726039835@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726066739', '1', 'DocenteApellido 558', 'DocenteNombre 558', 'DocenteApellido 558', '', 'DocenteNombre 558', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726066739@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726066739@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726215617', '1', 'DocenteApellido 559', 'DocenteNombre 559', 'DocenteApellido 559', '', 'DocenteNombre 559', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726215617@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726215617@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726265372', '1', 'DocenteApellido 560', 'DocenteNombre 560', 'DocenteApellido 560', '', 'DocenteNombre 560', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726265372@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726265372@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726292822', '1', 'DocenteApellido 561', 'DocenteNombre 561', 'DocenteApellido 561', '', 'DocenteNombre 561', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726292822@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726292822@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726541103', '1', 'DocenteApellido 562', 'DocenteNombre 562', 'DocenteApellido 562', '', 'DocenteNombre 562', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726541103@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726541103@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726546763', '1', 'DocenteApellido 563', 'DocenteNombre 563', 'DocenteApellido 563', '', 'DocenteNombre 563', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726546763@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726546763@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726592890', '1', 'DocenteApellido 564', 'DocenteNombre 564', 'DocenteApellido 564', '', 'DocenteNombre 564', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726592890@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726592890@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726614025', '1', 'DocenteApellido 565', 'DocenteNombre 565', 'DocenteApellido 565', '', 'DocenteNombre 565', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726614025@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726614025@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726665332', '1', 'DocenteApellido 566', 'DocenteNombre 566', 'DocenteApellido 566', '', 'DocenteNombre 566', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726665332@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726665332@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726685496', '1', 'DocenteApellido 567', 'DocenteNombre 567', 'DocenteApellido 567', '', 'DocenteNombre 567', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726685496@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726685496@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726692724', '1', 'DocenteApellido 568', 'DocenteNombre 568', 'DocenteApellido 568', '', 'DocenteNombre 568', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726692724@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726692724@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726724295', '1', 'DocenteApellido 569', 'DocenteNombre 569', 'DocenteApellido 569', '', 'DocenteNombre 569', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726724295@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726724295@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1726744079', '1', 'DocenteApellido 570', 'DocenteNombre 570', 'DocenteApellido 570', '', 'DocenteNombre 570', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726744079@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726744079@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726779422', '1', 'DocenteApellido 571', 'DocenteNombre 571', 'DocenteApellido 571', '', 'DocenteNombre 571', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726779422@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726779422@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726841719', '1', 'DocenteApellido 572', 'DocenteNombre 572', 'DocenteApellido 572', '', 'DocenteNombre 572', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726841719@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726841719@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726933482', '1', 'DocenteApellido 573', 'DocenteNombre 573', 'DocenteApellido 573', '', 'DocenteNombre 573', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726933482@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726933482@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1726975061', '1', 'DocenteApellido 574', 'DocenteNombre 574', 'DocenteApellido 574', '', 'DocenteNombre 574', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1726975061@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1726975061@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1727186973', '1', 'DocenteApellido 575', 'DocenteNombre 575', 'DocenteApellido 575', '', 'DocenteNombre 575', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1727186973@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1727186973@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1727455097', '1', 'DocenteApellido 576', 'DocenteNombre 576', 'DocenteApellido 576', '', 'DocenteNombre 576', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1727455097@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1727455097@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1729199263', '1', 'DocenteApellido 577', 'DocenteNombre 577', 'DocenteApellido 577', '', 'DocenteNombre 577', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1729199263@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1729199263@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1729334373', '1', 'DocenteApellido 578', 'DocenteNombre 578', 'DocenteApellido 578', '', 'DocenteNombre 578', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1729334373@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1729334373@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1750108084', '1', 'DocenteApellido 579', 'DocenteNombre 579', 'DocenteApellido 579', '', 'DocenteNombre 579', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1750108084@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1750108084@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1750205872', '1', 'DocenteApellido 580', 'DocenteNombre 580', 'DocenteApellido 580', '', 'DocenteNombre 580', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1750205872@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1750205872@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1750232223', '1', 'DocenteApellido 581', 'DocenteNombre 581', 'DocenteApellido 581', '', 'DocenteNombre 581', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1750232223@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1750232223@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1750803403', '1', 'DocenteApellido 582', 'DocenteNombre 582', 'DocenteApellido 582', '', 'DocenteNombre 582', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1750803403@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1750803403@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1751290998', '1', 'DocenteApellido 583', 'DocenteNombre 583', 'DocenteApellido 583', '', 'DocenteNombre 583', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1751290998@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1751290998@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1751417724', '1', 'DocenteApellido 584', 'DocenteNombre 584', 'DocenteApellido 584', '', 'DocenteNombre 584', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1751417724@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1751417724@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1751451913', '1', 'DocenteApellido 585', 'DocenteNombre 585', 'DocenteApellido 585', '', 'DocenteNombre 585', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1751451913@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1751451913@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1751469931', '1', 'DocenteApellido 586', 'DocenteNombre 586', 'DocenteApellido 586', '', 'DocenteNombre 586', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1751469931@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1751469931@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1751482488', '1', 'DocenteApellido 587', 'DocenteNombre 587', 'DocenteApellido 587', '', 'DocenteNombre 587', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1751482488@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1751482488@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1751535574', '1', 'DocenteApellido 588', 'DocenteNombre 588', 'DocenteApellido 588', '', 'DocenteNombre 588', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1751535574@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1751535574@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1751595347', '1', 'DocenteApellido 589', 'DocenteNombre 589', 'DocenteApellido 589', '', 'DocenteNombre 589', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1751595347@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1751595347@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1752531192', '1', 'DocenteApellido 590', 'DocenteNombre 590', 'DocenteApellido 590', '', 'DocenteNombre 590', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1752531192@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1752531192@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1752781128', '1', 'DocenteApellido 591', 'DocenteNombre 591', 'DocenteApellido 591', '', 'DocenteNombre 591', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1752781128@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1752781128@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1753633252', '1', 'DocenteApellido 592', 'DocenteNombre 592', 'DocenteApellido 592', '', 'DocenteNombre 592', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1753633252@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1753633252@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1754060745', '1', 'DocenteApellido 593', 'DocenteNombre 593', 'DocenteApellido 593', '', 'DocenteNombre 593', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1754060745@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1754060745@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1754701546', '1', 'DocenteApellido 594', 'DocenteNombre 594', 'DocenteApellido 594', '', 'DocenteNombre 594', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1754701546@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1754701546@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('1754853149', '1', 'DocenteApellido 595', 'DocenteNombre 595', 'DocenteApellido 595', '', 'DocenteNombre 595', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1754853149@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1754853149@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1755031208', '1', 'DocenteApellido 596', 'DocenteNombre 596', 'DocenteApellido 596', '', 'DocenteNombre 596', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1755031208@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1755031208@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1755577838', '1', 'DocenteApellido 597', 'DocenteNombre 597', 'DocenteApellido 597', '', 'DocenteNombre 597', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1755577838@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1755577838@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1756271514', '1', 'DocenteApellido 598', 'DocenteNombre 598', 'DocenteApellido 598', '', 'DocenteNombre 598', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1756271514@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1756271514@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1756800544', '1', 'DocenteApellido 599', 'DocenteNombre 599', 'DocenteApellido 599', '', 'DocenteNombre 599', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1756800544@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1756800544@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1757254741', '1', 'DocenteApellido 600', 'DocenteNombre 600', 'DocenteApellido 600', '', 'DocenteNombre 600', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1757254741@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1757254741@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1758042509', '1', 'DocenteApellido 601', 'DocenteNombre 601', 'DocenteApellido 601', '', 'DocenteNombre 601', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1758042509@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1758042509@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1759471673', '1', 'DocenteApellido 602', 'DocenteNombre 602', 'DocenteApellido 602', '', 'DocenteNombre 602', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1759471673@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1759471673@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1801235852', '1', 'DocenteApellido 603', 'DocenteNombre 603', 'DocenteApellido 603', '', 'DocenteNombre 603', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1801235852@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1801235852@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1801708445', '1', 'DocenteApellido 604', 'DocenteNombre 604', 'DocenteApellido 604', '', 'DocenteNombre 604', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1801708445@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1801708445@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1801994060', '1', 'DocenteApellido 605', 'DocenteNombre 605', 'DocenteApellido 605', '', 'DocenteNombre 605', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1801994060@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1801994060@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1802341600', '1', 'DocenteApellido 606', 'DocenteNombre 606', 'DocenteApellido 606', '', 'DocenteNombre 606', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1802341600@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1802341600@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1802528784', '1', 'DocenteApellido 607', 'DocenteNombre 607', 'DocenteApellido 607', '', 'DocenteNombre 607', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1802528784@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1802528784@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1802989226', '1', 'DocenteApellido 609', 'DocenteNombre 609', 'DocenteApellido 609', '', 'DocenteNombre 609', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1802989226@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1802989226@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1803297181', '1', 'DocenteApellido 610', 'DocenteNombre 610', 'DocenteApellido 610', '', 'DocenteNombre 610', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1803297181@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1803297181@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1804102711', '1', 'DocenteApellido 611', 'DocenteNombre 611', 'DocenteApellido 611', '', 'DocenteNombre 611', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1804102711@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1804102711@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1804261491', '1', 'DocenteApellido 612', 'DocenteNombre 612', 'DocenteApellido 612', '', 'DocenteNombre 612', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1804261491@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1804261491@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1804293866', '1', 'DocenteApellido 613', 'DocenteNombre 613', 'DocenteApellido 613', '', 'DocenteNombre 613', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1804293866@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1804293866@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1804421335', '1', 'DocenteApellido 614', 'DocenteNombre 614', 'DocenteApellido 614', '', 'DocenteNombre 614', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1804421335@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1804421335@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1804962155', '1', 'DocenteApellido 615', 'DocenteNombre 615', 'DocenteApellido 615', '', 'DocenteNombre 615', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1804962155@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1804962155@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1804991527', '1', 'DocenteApellido 616', 'DocenteNombre 616', 'DocenteApellido 616', '', 'DocenteNombre 616', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1804991527@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1804991527@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1850084631', '1', 'DocenteApellido 617', 'DocenteNombre 617', 'DocenteApellido 617', '', 'DocenteNombre 617', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1850084631@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1850084631@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1850921196', '1', 'DocenteApellido 618', 'DocenteNombre 618', 'DocenteApellido 618', '', 'DocenteNombre 618', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1850921196@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1850921196@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1900478148', '1', 'DocenteApellido 619', 'DocenteNombre 619', 'DocenteApellido 619', '', 'DocenteNombre 619', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1900478148@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1900478148@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('1900490309', '1', 'DocenteApellido 620', 'DocenteNombre 620', 'DocenteApellido 620', '', 'DocenteNombre 620', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_1900490309@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_1900490309@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
INSERT INTO `profesores` VALUES
('201325628', '1', 'DocenteApellido 621', 'DocenteNombre 621', 'DocenteApellido 621', '', 'DocenteNombre 621', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_201325628@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_201325628@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('202286167', '1', 'DocenteApellido 622', 'DocenteNombre 622', 'DocenteApellido 622', '', 'DocenteNombre 622', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_202286167@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_202286167@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('2100370549', '1', 'DocenteApellido 623', 'DocenteNombre 623', 'DocenteApellido 623', '', 'DocenteNombre 623', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_2100370549@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_2100370549@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('2300472590', '1', 'DocenteApellido 624', 'DocenteNombre 624', 'DocenteApellido 624', '', 'DocenteNombre 624', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_2300472590@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_2300472590@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('502996093', '1', 'DocenteApellido 625', 'DocenteNombre 625', 'DocenteApellido 625', '', 'DocenteNombre 625', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_502996093@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_502996093@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('504134073', '1', 'DocenteApellido 626', 'DocenteNombre 626', 'DocenteApellido 626', '', 'DocenteNombre 626', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_504134073@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_504134073@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1),
('6102522395', '1', 'DocenteApellido 627', 'DocenteNombre 627', 'DocenteApellido 627', '', 'DocenteNombre 627', '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', '022222222', '0999999999', 'docente_6102522395@istpet.edu.ec', '1985-01-01', 'M', '12345', 0, 'P', 'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, 'docente_6102522395@istpet.edu.ec', '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;
/*!40000 ALTER TABLE `profesores` ENABLE KEYS */;
UNLOCK TABLES;

-- -----------------------------------------------------------------------------
-- 4. USUARIOS INSTITUCIONALES PARA AUTENTICACIÓN DOSIER (CLAVE 12345)
-- -----------------------------------------------------------------------------
LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` (`idUsuario`, `idSigafi`, `tablaSigafi`, `nombre`, `contrasenia`, `activo`, `administrador`, `emailInstitucional`, `emailValidado`) VALUES
(1, '1725555377', 'profesor', 'Jorge Ismael Doicela Molina', '12345', 1, 1, 'jorge.doicela@istpet.edu.ec', 1),
(2, '1720000002', 'profesor', 'Carlos Enrique Valencia Llerena', '12345', 1, 0, 'carlos.valencia@istpet.edu.ec', 1),
(3, '1720000003', 'profesor', 'Marcia Elena Proaño Ramos', '12345', 1, 0, 'vicerrectorado@istpet.edu.ec', 1),
(4, '1720000004', 'profesor', 'David Alejandro Guaman Perez', '12345', 1, 0, 'coordinacion.software@istpet.edu.ec', 1),
(5, '1720000005', 'profesor', 'Silvia Patricia Andrade Torres', '12345', 1, 0, 'coordinacion.academica@istpet.edu.ec', 1),
(6, '1802707511', 'profesor', 'Freddy Baño', '12345', 1, 0, 'freddy.bano@istpet.edu.ec', 1),
(7, '0502405889', 'profesor', 'Cristian Cobos', '12345', 1, 0, 'cristian.cobos@istpet.edu.ec', 1),
(8, '1709890626', 'profesor', 'Wilfrido Trujillo', '12345', 1, 0, 'wilfrido.trujillo@istpet.edu.ec', 1),
(9, '1720004793', 'profesor', 'Christian Castro', '12345', 1, 0, 'christian.castro@istpet.edu.ec', 1),
(10, '1721465431', 'profesor', 'Wilmer Toapanta', '12345', 1, 0, 'wilmer.toapanta@istpet.edu.ec', 1)
ON DUPLICATE KEY UPDATE 
  `contrasenia` = VALUES(`contrasenia`),
  `nombre` = VALUES(`nombre`),
  `activo` = 1,
  `administrador` = VALUES(`administrador`),
  `emailInstitucional` = VALUES(`emailInstitucional`);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
