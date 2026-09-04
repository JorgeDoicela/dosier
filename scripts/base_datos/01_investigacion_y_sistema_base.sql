-- =============================================================================
--  ADVERTENCIA DE SEGURIDAD - AMBIENTE DE DESARROLLO
--  Este script está diseñado para el despliegue del módulo de INVESTIGACIÓN.
--  SOLO AFECTA A TABLAS CON PREFIJO 'doc_'.
--  NO MODIFICA, ELIMINA NI ALTERA TABLAS INSTITUCIONALES (periodos, carreras,
--  profesores, alumnos, etc.).
--  Uso: Instalación inicial o reinicio del módulo de investigación.
-- =============================================================================

USE sigafi_es;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- =============================================================================
-- LIMPIEZA PREVIA (Tablas, Vistas y Triggers exclusivos del módulo 'doc_')
-- =============================================================================

DROP VIEW IF EXISTS v_doc_calendario_eventos;

DROP TRIGGER IF EXISTS trg_doc_proyectos_uuid;
DROP TRIGGER IF EXISTS trg_doc_convocatorias_uuid;
DROP TRIGGER IF EXISTS trg_doc_lineas_uuid;
DROP TRIGGER IF EXISTS trg_doc_cronograma_uuid;
DROP TRIGGER IF EXISTS trg_doc_biblio_uuid;
DROP TRIGGER IF EXISTS trg_doc_infinforme_uuid;
DROP TRIGGER IF EXISTS trg_doc_evidencia_uuid;
DROP TRIGGER IF EXISTS trg_doc_revisiones_uuid;
DROP TRIGGER IF EXISTS trg_doc_evid_cat_uuid;
DROP TRIGGER IF EXISTS trg_doc_ent_ext_uuid;
DROP TRIGGER IF EXISTS trg_doc_grupos_uuid;
DROP TRIGGER IF EXISTS trg_doc_pnd_obj_uuid;
DROP TRIGGER IF EXISTS trg_doc_proy_docadj_uuid;
DROP TRIGGER IF EXISTS trg_doc_trazabilidad_uuid;
DROP TRIGGER IF EXISTS trg_doc_notif_uuid;
DROP TRIGGER IF EXISTS trg_doc_tokens_uuid;
DROP TRIGGER IF EXISTS trg_doc_usermeta_uuid;
DROP TRIGGER IF EXISTS trg_doc_proy_ext_uuid;
DROP TRIGGER IF EXISTS trg_doc_lopdp_consentimientos_uuid;
DROP TRIGGER IF EXISTS trg_doc_lopdp_auditoria_uuid;
DROP TRIGGER IF EXISTS trg_doc_backup_logs_uuid;
DROP TRIGGER IF EXISTS trg_doc_email_tpl_uuid;
DROP TRIGGER IF EXISTS trg_doc_email_hist_uuid;
DROP TRIGGER IF EXISTS trg_doc_ical_token_uuid;
DROP TRIGGER IF EXISTS trg_doc_cal_norm_uuid;

DROP TABLE IF EXISTS
    -- Grupo K (Seguridad y Notificaciones)
    doc_backup_logs,
    doc_lopdp_consentimientos,
    doc_lopdp_auditoria_datos,
    doc_notificaciones,
    doc_tokens_acceso,
    doc_usuarios_metadata,
    doc_dispositivos_tokens,
    doc_config_general,
    doc_audit_admin,
    doc_email_templates,
    doc_email_historial,
    doc_magic_links,

    -- DOSIER Document Engine (Plantillas y Auditoría)
    doc_document_audit,
    doc_documentos_firmas,
    doc_documentos_instancias,
    doc_document_templates,
    doc_user_signature_profiles,

    -- DOSIER CoWork (Coordinación Team Pulse & Colaboración)
    doc_collaboration_comments,
    doc_documentos_secciones_metadata,
    doc_cowork_updates,
    doc_cowork_sesiones,
    doc_cowork_documentos,

    -- Núcleo V3 (Secciones 1-9)
    doc_bibliografia_proyecto,
    doc_cronograma,
    doc_impactos_proyecto,
    doc_cat_impactos,
    doc_proyectos_ods,
    doc_ods,
    doc_ods_ejes,
    doc_objetivos_proyecto,
    doc_proyecto_extensiones,
    doc_proyecto_participantes,
    doc_proyectos_carreras,
    doc_trazabilidad_proyectos,
    doc_proyectos_documentos_adjuntos,
    doc_proyectos_mml,
    doc_proyectos,
    doc_convocatorias,
    doc_agendas_zonales,
    doc_tipos_convocatoria,
    doc_grupos_carreras,
    doc_grupos_miembros,
    doc_grupos_investigacion,
    doc_pnd_objetivos,

    -- Catálogos y Configuración adicionales
    doc_cat_tipo_evidencia,
    doc_entidades_externas,
    doc_config_workflow,

    -- Módulo Calendario (orden inverso por FK)
    doc_calendario_alertas_enviadas,
    doc_ical_tokens,
    doc_calendario_eventos_normativos;

-- #############################################################################
-- SECCIÓN 1: CATÁLOGOS BASE
-- #############################################################################



-- NÚCLEO PROFESIONAL: CATÁLOGO DE EVIDENCIAS
CREATE TABLE doc_cat_tipo_evidencia (
    idTipoEvidencia  INT          AUTO_INCREMENT PRIMARY KEY,
    uuid             VARCHAR(36)     NOT NULL UNIQUE,
    nombre           VARCHAR(100) NOT NULL,
    descripcion      VARCHAR(255),
    extensiones      VARCHAR(50)  DEFAULT 'pdf,jpg,png,zip',
    activo           TINYINT(1)   DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- NÚCLEO PROFESIONAL: ENTIDADES EXTERNAS (Empresas y Aliados)
CREATE TABLE doc_entidades_externas (
    idEntidad        INT          AUTO_INCREMENT PRIMARY KEY,
    uuid             VARCHAR(36)     NOT NULL UNIQUE,
    ruc              VARCHAR(13)  UNIQUE,
    razonSocial      VARCHAR(255) NOT NULL,
    tipo             ENUM('Pública', 'Privada', 'ONG', 'Académica') DEFAULT 'Privada',
    sector           VARCHAR(100) COMMENT 'Ej: Software, Manufactura, Agrícola',
    contactoNombre   VARCHAR(150),
    contactoEmail    VARCHAR(150),
    activo           TINYINT(1)   DEFAULT 1,
    fechaRegistro    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_grupos_investigacion (
    idGrupo              INT          AUTO_INCREMENT PRIMARY KEY,
    uuid                 VARCHAR(36)     NOT NULL UNIQUE,
    nombre               VARCHAR(255) NOT NULL,
    siglas               VARCHAR(50),
    tipoGrupo            ENUM('Investigación', 'Semillero') NOT NULL DEFAULT 'Investigación',
    idCoordinador        INT(11) NULL,
    objetivoGeneral      TEXT,
    mision               TEXT,
    vision               TEXT,
    resolucionAprobacion VARCHAR(100),
    fechaCreacion        DATE,
    categoriaConsolidacion VARCHAR(50) DEFAULT 'En Formación' COMMENT 'En Formación, Consolidado',
    estado               VARCHAR(20)  DEFAULT 'Aprobado',
    activo               TINYINT(1)   DEFAULT 1,
    eliminado            TINYINT(1)   DEFAULT 0,
    fechaEliminacion     TIMESTAMP    NULL,
    eliminadoPorUsuarioId INT(11)     NULL,
    fechaRegistro        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    linkWhatsapp         VARCHAR(255) NULL,
    telefonoCoordinador  VARCHAR(20)  NULL,
    fotoUrl              VARCHAR(500) NULL,
    FOREIGN KEY (idCoordinador) REFERENCES usuarios(idUsuario) ON DELETE SET NULL,
    FOREIGN KEY (eliminadoPorUsuarioId) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_pnd_objetivos (
    idObjetivoPnd   INT          AUTO_INCREMENT PRIMARY KEY,
    uuid            VARCHAR(36)     NOT NULL UNIQUE,
    codigo          VARCHAR(20)  NOT NULL UNIQUE,
    nombre          VARCHAR(255) NOT NULL,
    descripcion     TEXT,
    activo          TINYINT(1)   DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catálogo del Plan Nacional de Desarrollo (SENESCYT)';

-- Los objetivos del Plan Nacional de Desarrollo se insertan en la sección de datos semilla al final.



CREATE TABLE doc_grupos_carreras (
    idGrupo   INT NOT NULL,
    idCarrera INT(11) NOT NULL,
    PRIMARY KEY (idGrupo, idCarrera),
    FOREIGN KEY (idGrupo)   REFERENCES doc_grupos_investigacion(idGrupo) ON DELETE CASCADE,
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera)              ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Vinculación de grupos con programas académicos';

CREATE TABLE doc_grupos_miembros (
    idGrupoMiembro INT          AUTO_INCREMENT PRIMARY KEY,
    idGrupo        INT          NOT NULL,
    idUsuario      INT(11)      NOT NULL,
    rol            VARCHAR(100) COMMENT 'Director de Proyecto, Co-Investigador, Semillerista',
    activo         TINYINT(1)   DEFAULT 1,
    fechaInicio    DATE,
    fechaFin       DATE,
    motivoSalida   VARCHAR(255) NULL,
    telefonoContacto VARCHAR(20)  NULL,
    FOREIGN KEY (idGrupo)    REFERENCES doc_grupos_investigacion(idGrupo) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario)  REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- #############################################################################
-- CATALOGOS DE CONVOCATORIA (EXCELENCIA 2026)
-- #############################################################################

CREATE TABLE doc_tipos_convocatoria (
    idTipoConvocatoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre             VARCHAR(100) NOT NULL,
    descripcion        VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Los tipos de convocatoria se insertan en la sección de datos semilla al final.

CREATE TABLE doc_agendas_zonales (
    idAgendaZonal INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(150) NOT NULL,
    descripcion   VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Las agendas zonales se insertan en la sección de datos semilla al final.

CREATE TABLE doc_convocatorias (
    idConvocatoria     INT           AUTO_INCREMENT PRIMARY KEY,
    uuid               VARCHAR(36)      NOT NULL UNIQUE,
    codigoConvocatoria VARCHAR(30)   NOT NULL UNIQUE,
    titulo             VARCHAR(255)  NOT NULL,
    idPeriodo          CHAR(7) CHARACTER SET latin1 NOT NULL,
    fechaApertura      DATE          NOT NULL,
    fechaCierre        DATE          NOT NULL,
    anio               VARCHAR(50)   NOT NULL,
    descripcion        TEXT,
    urlBases           VARCHAR(512),
    requisitosMinimos  TEXT,
    idTipoConvocatoria INT           NULL,
    estado             ENUM('Borrador','Abierta','Cerrada','Anulada') DEFAULT 'Borrador',
    eliminado             TINYINT(1)    DEFAULT 0,
    fechaEliminacion      TIMESTAMP     NULL,
    eliminadoPorUsuarioId INT(11)       NULL,
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo),
    FOREIGN KEY (idTipoConvocatoria) REFERENCES doc_tipos_convocatoria(idTipoConvocatoria),
    FOREIGN KEY (eliminadoPorUsuarioId) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- #############################################################################
-- SECCIÓN 2: PROYECTO Y PARTICIPANTES
-- #############################################################################

CREATE TABLE doc_proyectos (
    idProyecto            INT           AUTO_INCREMENT PRIMARY KEY,
    uuid                  VARCHAR(36)      NOT NULL UNIQUE,
    idConvocatoria        INT,
    codigoInstitucional   VARCHAR(50)   UNIQUE,
    titulo                VARCHAR(500)  NOT NULL,
    -- Nota: Los textos descriptivos (antecedentes, justificacion, marcoTeorico, metodologia,
    -- metodoEvaluacion) viven exclusivamente en metadataCacesJson y en el snapshot del
    -- documento colaborativo (doc_documentos_instancias). No se duplican aquí.
    idGrupo               INT           NULL,
    tieneGrupo            TINYINT(1)    DEFAULT 0,
    fechaPresentacion     DATE          NULL,
    fechaInicio           DATE,
    fechaFin              DATE,
    tiempoEjecucion       VARCHAR(100),
    -- ADAPTABILIDAD CACES: VARCHAR en lugar de ENUM.
    -- Agregar nuevos estados solo requiere insertar en doc_config_workflow,
    -- NO requiere alterar esta tabla ni redesplegar el backend.
    estado                VARCHAR(50)   NOT NULL DEFAULT 'Borrador' COMMENT 'Estado del ciclo de vida. Valores válidos definidos en doc_config_workflow.',
    puntajeEvaluacion     DECIMAL(5,2)  NULL,
    idObjetivoPnd         INT           NULL COMMENT 'Vínculo con el Plan Nacional de Desarrollo',
    activo                TINYINT(1)    DEFAULT 1,
    eliminado             TINYINT(1)    DEFAULT 0,
    fechaEliminacion      TIMESTAMP     NULL,
    eliminadoPorUsuarioId INT(11)       NULL,
    fechaRegistro         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    fechaModificacion     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- NÚCLEO DE INNOVACIÓN Y VINCULACIÓN PRODUCTIVA
    idEntidadAliada      INT           NULL COMMENT 'Empresa o Institución Co-ejecutora',
    trlInicial           TINYINT       DEFAULT 1 COMMENT 'Technology Readiness Level Inicial (1-9)',
    trlActual            TINYINT       DEFAULT 1 COMMENT 'Technology Readiness Level Actual (1-9)',
    trlMeta              TINYINT       DEFAULT 1 COMMENT 'Technology Readiness Level Meta (1-9)',
    autoExtendDeadlines  TINYINT(1)    DEFAULT 0,
    autoExtendDays       INT           DEFAULT 7,

    -- GESTIÓN Y CONTROL DE PLAZOS INSTITUCIONALES (DEADLINES)
    fechaLimiteSubsanacion      DATE          NULL COMMENT 'Fecha límite fijada por el Administrador para subsanar observaciones del protocolo (Fase 1/2)',


    FOREIGN KEY (idConvocatoria) REFERENCES doc_convocatorias(idConvocatoria),
    FOREIGN KEY (idGrupo)        REFERENCES doc_grupos_investigacion(idGrupo),
    FOREIGN KEY (idObjetivoPnd)  REFERENCES doc_pnd_objetivos(idObjetivoPnd),
    FOREIGN KEY (idEntidadAliada) REFERENCES doc_entidades_externas(idEntidad),

    -- Extensiones CACES / SENESCYT
    hashActaAprobacion   TEXT NULL,
    fechaAprobacion      TIMESTAMP NULL,
    firmadoPor           INT(11) NULL,
    metadataCacesJson    JSON          NULL COMMENT 'Snapshot de indicadores para acreditación',
    FOREIGN KEY (firmadoPor) REFERENCES usuarios(idUsuario) ON DELETE SET NULL,
    FOREIGN KEY (eliminadoPorUsuarioId) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Matriz de Marco Lógico (MML) - Requisito SENESCYT
CREATE TABLE doc_proyectos_mml (
    idMml           INT          AUTO_INCREMENT PRIMARY KEY,
    idProyecto      INT          NOT NULL,
    nivel           ENUM('Fin','Propósito','Componente','Actividad') NOT NULL,
    resumenNarrativo TEXT        NOT NULL,
    indicadores     TEXT         NULL,
    mediosVerificacion TEXT      NULL,
    supuestos       TEXT         NULL,
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Documentos Adjuntos del Proyecto (Checklist de Postulación)
CREATE TABLE doc_proyectos_documentos_adjuntos (
    idDocAdj        INT          AUTO_INCREMENT PRIMARY KEY,
    uuid            VARCHAR(36)     NOT NULL UNIQUE,
    idProyecto      INT          NOT NULL,
    nombreArchivo   VARCHAR(255) NOT NULL,
    rutaArchivo     VARCHAR(512) NOT NULL,
    fechaSubida     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trazabilidad de Estados para Auditoría (CACES)
CREATE TABLE doc_trazabilidad_proyectos (
    idTrazabilidad  INT AUTO_INCREMENT PRIMARY KEY,
    uuid            VARCHAR(36) NOT NULL UNIQUE,
    idProyecto      INT NOT NULL,
    idUsuario       INT(11) NULL,
    estadoAnterior  VARCHAR(50) NOT NULL,
    estadoNuevo     VARCHAR(50) NOT NULL,
    observacion     TEXT,
    fechaTransicion DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Seguridad del Núcleo: Cadena de Confianza (Blockchain-like Audit)
    hashAnterior    VARCHAR(100) NULL COMMENT 'Hash de la transición previa',
    hashActual      VARCHAR(100) NULL COMMENT 'Hash SHA-256 de esta transición (Integridad)',
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Auditoría Administrativa Forense (CACES/SENESCYT)
CREATE TABLE doc_audit_admin (
    idAudit            INT AUTO_INCREMENT PRIMARY KEY,
    idUsuarioAdmin     INT NULL,
    idUsuarioAfectado  INT NULL,
    accion             VARCHAR(100) NOT NULL,
    modulo             VARCHAR(100),
    detalle            TEXT,
    ipOrigen           VARCHAR(45),
    userAgent          TEXT,
    valoresAnteriores  TEXT, -- Snapshot JSON del estado previo
    valoresNuevos      TEXT, -- Snapshot JSON del estado posterior
    fecha              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuarioAdmin) REFERENCES usuarios(idUsuario) ON DELETE SET NULL,
    FOREIGN KEY (idUsuarioAfectado) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_proyectos_carreras (
    idProyectoCarrera INT          AUTO_INCREMENT PRIMARY KEY,
    idProyecto        INT          NOT NULL,
    idCarrera         INT(11)      NOT NULL,
    modalidad         VARCHAR(100),
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE,
    FOREIGN KEY (idCarrera)  REFERENCES carreras(idCarrera)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- Tabla unificada de participantes (docentes y alumnos bajo un mismo modelo)
-- Reemplaza: doc_proyectos_profesores + doc_proyectos_alumnos
-- tipoParticipante discrimina el origen: 'Docente' | 'Alumno' | 'Externo'
CREATE TABLE doc_proyecto_participantes (
    idParticipante   INT           AUTO_INCREMENT PRIMARY KEY,
    idProyecto       INT           NOT NULL,
    idUsuario        INT(11)       NOT NULL,
    tipoParticipante VARCHAR(20)   NOT NULL DEFAULT 'Docente' COMMENT 'Docente | Alumno | Externo',
    esDirector       TINYINT(1)    DEFAULT 0,
    rol              VARCHAR(100),
    nivelAcademico   VARCHAR(150),
    telefono         VARCHAR(20),
    horasSemanales   DECIMAL(4,1),
    activo           TINYINT(1)    DEFAULT 1,
    fecha_inicio     DATETIME      NULL,
    fecha_fin        DATETIME      NULL,
    motivo_cambio    VARCHAR(150)  NULL,
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario)  REFERENCES usuarios(idUsuario)       ON DELETE CASCADE,
    UNIQUE KEY uq_proyecto_usuario (idProyecto, idUsuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Participantes del proyecto: docentes, alumnos y externos unificados';


CREATE TABLE doc_proyecto_extensiones (
    idExtension      INT           AUTO_INCREMENT PRIMARY KEY,
    uuid             VARCHAR(36)   NOT NULL UNIQUE,
    idProyecto       INT           NOT NULL,
    fechaAnterior    DATE          NOT NULL,
    fechaNueva       DATE          NOT NULL,
    motivo           TEXT          NULL,
    resolucion       TEXT          NULL,
    fechaRegistro    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- #############################################################################
-- SECCIÓN 3: OBJETIVOS Y ODS
-- #############################################################################

CREATE TABLE doc_objetivos_proyecto (
    idObjetivo    INT          AUTO_INCREMENT PRIMARY KEY,
    idProyecto    INT          NOT NULL,
    esGeneral     TINYINT(1)   NOT NULL DEFAULT 0,
    descripcion   TEXT         NOT NULL,
    orden         INT          DEFAULT 0,
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_ods_ejes (
    idEje   INT         AUTO_INCREMENT PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_ods (
    idOds     INT          AUTO_INCREMENT PRIMARY KEY,
    idEje     INT          NOT NULL,
    numeroOds INT          NOT NULL UNIQUE,
    titulo    VARCHAR(255) NOT NULL,
    FOREIGN KEY (idEje) REFERENCES doc_ods_ejes(idEje)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_proyectos_ods (
    idProyectoOds         INT  AUTO_INCREMENT PRIMARY KEY,
    idProyecto            INT  NOT NULL,
    idOds                 INT  NOT NULL,
    objetivoEspecificoODS TEXT NOT NULL,
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE,
    FOREIGN KEY (idOds)      REFERENCES doc_ods(idOds)            ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- #############################################################################
-- SECCIÓN 6: IMPACTOS
-- #############################################################################

CREATE TABLE doc_cat_impactos (
    idCatImpacto  INT          AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_impactos_proyecto (
    idImpactoProyecto INT  AUTO_INCREMENT PRIMARY KEY,
    idProyecto        INT  NOT NULL,
    idCatImpacto      INT  NOT NULL,
    descripcion       TEXT NOT NULL,
    FOREIGN KEY (idProyecto)   REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE,
    FOREIGN KEY (idCatImpacto) REFERENCES doc_cat_impactos(idCatImpacto) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- #############################################################################
-- SECCIÓN 7: CRONOGRAMA MODERNO
-- #############################################################################

CREATE TABLE doc_cronograma (
    idActividad       INT           AUTO_INCREMENT PRIMARY KEY,
    uuid              VARCHAR(36)      NOT NULL UNIQUE,
    idProyecto        INT           NOT NULL,
    idObjetivo        INT           NOT NULL,
    numeroActividad   INT           NOT NULL,
    descripcion       TEXT          NOT NULL,
    recursosNecesarios TEXT,
    responsable       VARCHAR(255)  NULL COMMENT 'Nombre del investigador/estudiante responsable',
    entregable        TEXT          NULL COMMENT 'Entregable o evidencia esperada para el CACES',
    fechaInicioPrevista DATE,
    fechaFinPrevista    DATE,
    progreso            DECIMAL(5,2)  DEFAULT 0.00,
    ponderacion         DECIMAL(5,2)  DEFAULT 0.00 COMMENT 'Peso porcentual en el proyecto',
    esEntregableCaces   TINYINT(1)    DEFAULT 0    COMMENT 'Marca actividad como evidencia de acreditación',
    idActividadPadre    INT           NULL,
    colorHex            VARCHAR(7)    DEFAULT '#0070f3',
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE,
    FOREIGN KEY (idObjetivo) REFERENCES doc_objetivos_proyecto(idObjetivo) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- #############################################################################
-- SECCIÓN 8: BIBLIOGRAFÍA ESTRUCTURADA
-- #############################################################################

CREATE TABLE doc_bibliografia_proyecto (
    idBibliografia INT          AUTO_INCREMENT PRIMARY KEY,
    uuid           VARCHAR(36)     NOT NULL UNIQUE,
    idProyecto     INT          NOT NULL,
    citaAPA        TEXT         NOT NULL,
    doi            VARCHAR(100),
    isbn           VARCHAR(20),
    autores        TEXT,
    anioPublicacion INT,
    tituloFuente   TEXT,
    url            VARCHAR(512),
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- #############################################################################
-- TRIGGERS PARA UUID
-- #############################################################################

DELIMITER $$
CREATE TRIGGER trg_doc_proyectos_uuid BEFORE INSERT ON doc_proyectos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
CREATE TRIGGER trg_doc_convocatorias_uuid BEFORE INSERT ON doc_convocatorias FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
-- Triggers adicionales para asegurar la generación de UUIDs en todo el esquema
CREATE TRIGGER trg_doc_grupos_uuid BEFORE INSERT ON doc_grupos_investigacion FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
CREATE TRIGGER trg_doc_pnd_obj_uuid BEFORE INSERT ON doc_pnd_objetivos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
CREATE TRIGGER trg_doc_proy_docadj_uuid BEFORE INSERT ON doc_proyectos_documentos_adjuntos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
CREATE TRIGGER trg_doc_trazabilidad_uuid BEFORE INSERT ON doc_trazabilidad_proyectos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- #############################################################################
-- #############################################################################
-- MILESTONE: DATOS SEMILLA Y CONFIGURACIÓN BÁSICA (Núcleo V3)
-- #############################################################################
-- #############################################################################



-- Ejes ODS (5 Ps de la Agenda 2030)
INSERT INTO doc_ods_ejes (nombre) VALUES
('Personas'), ('Planeta'), ('Prosperidad'), ('Paz'), ('Alianzas');

-- 17 ODS
INSERT INTO doc_ods (idEje, numeroOds, titulo) VALUES
(1,1,  'Fin de la pobreza'), (1,2,  'Hambre cero'), (1,3,  'Salud y bienestar'),
(1,4,  'Educación de calidad'), (1,5,  'Igualdad de género'), (2,6,  'Agua limpia y saneamiento'),
(3,7,  'Energía asequible y no contaminante'), (3,8,  'Trabajo decente y crecimiento económico'),
(3,9,  'Industria, innovación e infraestructura'), (3,10, 'Reducción de las desigualdades'),
(2,11, 'Ciudades y comunidades sostenibles'), (2,12, 'Producción y consumo responsables'),
(2,13, 'Acción por el clima'), (2,14, 'Vida submarina'), (2,15, 'Vida de ecosistemas terrestres'),
(4,16, 'Paz, justicia e instituciones sólidas'), (5,17, 'Alianzas para lograr los objetivos');

-- Categorías de impacto
INSERT INTO doc_cat_impactos (nombre) VALUES
('Social'), ('Científico'), ('Económico'), ('Político'), ('Ambiental'), ('Otro');

-- Índices básicos del núcleo V3
-- Índices básicos del núcleo V3 (Se omiten los índices sobre claves foráneas que InnoDB crea automáticamente)
CREATE INDEX idx_proyectos_estado           ON doc_proyectos(estado);

-- =============================================================================
-- GRUPO K: NOTIFICACIONES, SEGURIDAD Y METADATA
-- =============================================================================

CREATE TABLE doc_notificaciones (
    idNotificacion   INT          AUTO_INCREMENT PRIMARY KEY,
    uuid             VARCHAR(36)     NOT NULL,
    idProyecto       INT          NULL,
    destinatario     INT(11)      NOT NULL,
    tipoDestinatario ENUM('Usuario','Profesor','Alumno') DEFAULT 'Usuario',
    categoria        VARCHAR(50)  DEFAULT 'SISTEMA',
    prioridad        VARCHAR(20)  DEFAULT 'NORMAL',
    titulo           VARCHAR(255) NOT NULL,
    mensaje          TEXT,
    urlAccion        VARCHAR(255) NULL,
    leido            TINYINT(1)   DEFAULT 0,
    fechaEnvio       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    fechaLectura     TIMESTAMP    NULL,
    version          INT          DEFAULT 1,
    UNIQUE KEY uq_notif_uuid (uuid),
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE SET NULL,
    FOREIGN KEY (destinatario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[SISTEMA] Notificaciones con prioridad y redirección (Deep Linking)';

DELIMITER $$
CREATE TRIGGER trg_doc_notif_uuid
BEFORE INSERT ON doc_notificaciones FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_tokens_acceso (
    idToken         INT          AUTO_INCREMENT PRIMARY KEY,
    uuid            VARCHAR(36)     NOT NULL,
    idProyecto      INT          NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    idReferencia    INT          NOT NULL,
    tipoReferencia  VARCHAR(50)  NOT NULL DEFAULT 'Externo',
    scopes          VARCHAR(255),
    maxUsos         INT          DEFAULT 1,
    usosActuales    INT          DEFAULT 0,
    ipOrigen        VARCHAR(50)  NULL,
    activo          TINYINT(1)   DEFAULT 1,
    fechaRegistro   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    fechaExpiracion TIMESTAMP    NULL,
    version         INT          DEFAULT 1,
    UNIQUE KEY uq_tokens_uuid (uuid),
    FOREIGN KEY (idProyecto) REFERENCES doc_proyectos(idProyecto) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[SISTEMA] Seguridad para Pares Ciegos (Control de IPs y usos)';

DELIMITER $$
CREATE TRIGGER trg_doc_tokens_uuid
BEFORE INSERT ON doc_tokens_acceso FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_usuarios_metadata (
    idMetadata           INT          AUTO_INCREMENT PRIMARY KEY,
    uuid                 VARCHAR(36)     NOT NULL,
    idUsuario            INT(11)      NOT NULL UNIQUE,
    aceptoTerminosFirma  TINYINT(1)   DEFAULT 0 COMMENT 'Consentimiento explícito para el uso de la firma digital en memoria RAM',
    fechaConsentimientoFirma TIMESTAMP NULL,
    configuracion        JSON         NULL,
    fechaRegistro        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    fechaUltimoAcceso    TIMESTAMP    NULL,
    version              INT          DEFAULT 1,
    UNIQUE KEY uq_usermeta_uuid (uuid),
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[SISTEMA] Metadatos de Usuario y Firma Electrónica';

CREATE TABLE doc_lopdp_consentimientos (
    idConsentimiento     INT          AUTO_INCREMENT PRIMARY KEY,
    uuid                 VARCHAR(36)  NOT NULL UNIQUE,
    idUsuario            INT(11)      NOT NULL,
    versionPolitica      VARCHAR(20)  NOT NULL COMMENT 'Versión del documento de política de privacidad aceptado',
    canal                ENUM('Web', 'Movil', 'Presencial') DEFAULT 'Web',
    fechaConsentimiento  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    ipDireccion          VARCHAR(45)  NULL,
    userAgent            VARCHAR(255) NULL,
    firmaHash            TEXT         NULL COMMENT 'Hash SHA-256 de los términos aceptados + identificación del usuario',
    estado               ENUM('Otorgado', 'Revocado') DEFAULT 'Otorgado',
    fechaRevocacion      TIMESTAMP    NULL,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[LOPDP] Registro histórico e irrevocable del consentimiento del titular';

CREATE TABLE doc_lopdp_auditoria_datos (
    idAuditoriaDatos     INT          AUTO_INCREMENT PRIMARY KEY,
    uuid                 VARCHAR(36)  NOT NULL UNIQUE,
    idUsuarioActor       INT(11)      NULL COMMENT 'Usuario que accede al dato (ej. Administrador o Director)',
    idUsuarioAfectado    INT(11)      NOT NULL COMMENT 'El titular de los datos personales expuestos',
    tablaAfectada        VARCHAR(100) NOT NULL,
    columnaAfectada      VARCHAR(100) NULL COMMENT 'Columna sensible (ej: rutaFirmaP12, telefono)',
    operacion            ENUM('LECTURA', 'ESCRITURA', 'ELIMINACION', 'DESCARGA') NOT NULL,
    motivo               VARCHAR(255) NULL COMMENT 'Propósito legal o administrativo (ej: Validacion de Carga Horaria CACES)',
    ipDireccion          VARCHAR(45)  NULL,
    userAgent            VARCHAR(255) NULL,
    fechaAcceso          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuarioActor) REFERENCES usuarios(idUsuario) ON DELETE SET NULL,
    FOREIGN KEY (idUsuarioAfectado) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[LOPDP] Registro inalterable de acceso a datos sensibles (Auditoría CACES)';

CREATE TABLE doc_backup_logs (
    idBackup            INT           AUTO_INCREMENT PRIMARY KEY,
    uuid                VARCHAR(36)   NOT NULL UNIQUE,
    fechaBackup         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    tipo                ENUM('Completo', 'BaseDatos', 'Archivos') NOT NULL,
    destino             VARCHAR(255)  NOT NULL COMMENT 'Ej: Local, Google Drive, AWS S3, OneDrive',
    nombreArchivo       VARCHAR(255)  NOT NULL COMMENT 'Nombre del archivo zip/sql de respaldo',
    tamanioBytes        BIGINT        NOT NULL,
    estado              ENUM('Exitoso', 'Fallido', 'En_Proceso') DEFAULT 'En_Proceso',
    hashVerificacion    VARCHAR(64)   NULL COMMENT 'Hash SHA-256 para validación de integridad',
    errorMensaje        TEXT          NULL,
    ejecutadoPor        INT(11)       NULL COMMENT 'Usuario que inició el respaldo (NULL para automático/cron)',
    FOREIGN KEY (ejecutadoPor) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[SEGURIDAD] Registro y trazabilidad de copias de seguridad (LOPDP Art. 47 & EGSI)';

DELIMITER $$
CREATE TRIGGER trg_doc_usermeta_uuid
BEFORE INSERT ON doc_usuarios_metadata FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
CREATE TRIGGER trg_doc_proy_ext_uuid BEFORE INSERT ON doc_proyecto_extensiones FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
CREATE TRIGGER trg_doc_lopdp_consentimientos_uuid BEFORE INSERT ON doc_lopdp_consentimientos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
CREATE TRIGGER trg_doc_lopdp_auditoria_uuid BEFORE INSERT ON doc_lopdp_auditoria_datos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
CREATE TRIGGER trg_doc_backup_logs_uuid BEFORE INSERT ON doc_backup_logs FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

CREATE TABLE doc_dispositivos_tokens (
    idToken             INT          AUTO_INCREMENT PRIMARY KEY,
    idUsuario           INT(11)      NOT NULL,
    deviceToken         VARCHAR(512) NOT NULL UNIQUE,
    plataforma          VARCHAR(20)  DEFAULT 'Web', -- Web, iOS, Android
    ultimaSincronizacion TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[MÓVIL] Almacén de tokens para Push Notifications (FCM)';

CREATE TABLE doc_magic_links (
    id_magic_link         INT          AUTO_INCREMENT PRIMARY KEY,
    id_usuario            INT(11)      NOT NULL,
    token_hash            VARCHAR(64)  NOT NULL,
    fecha_creacion        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion      DATETIME     NOT NULL,
    utilizado             TINYINT(1)   NOT NULL DEFAULT 0,
    fecha_utilizado       DATETIME     NULL,
    ip_creacion           VARCHAR(45)  NULL,
    ip_utilizacion        VARCHAR(45)  NULL,
    user_agent            VARCHAR(255) NULL,
    codigo_pin_handoff    VARCHAR(12)  NULL,
    fecha_expiracion_pin  DATETIME     NULL,
    proposito             VARCHAR(30)  NOT NULL DEFAULT 'MAGIC_LINK' COMMENT 'MAGIC_LINK | PASSWORD_RECOVERY',
    UNIQUE KEY uk_token_hash (token_hash),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[SISTEMA] Token pool: magic links de autenticación y recuperación de contraseña';


-- CONFIGURACIÓN GENERAL (Llave-Valor)
CREATE TABLE doc_config_general (
    Clave       VARCHAR(100) NOT NULL PRIMARY KEY,
    Valor       LONGTEXT NOT NULL,
    Descripcion VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[SISTEMA] Configuración general llave-valor';


-- NÚCLEO: CONFIGURACIÓN DE INDICADORES (CACES/SENESCYT)


-- CIERRE DE SEGURIDAD PARA EL NÚCLEO V3
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SECCIÓN: CATÁLOGOS INICIALES (SEED DATA)
-- ============================================================

-- Limpieza de catálogos para evitar duplicados en re-ejecución (excluyendo ODS y tipos de investigación para conservar sus semillas completas)
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

TRUNCATE TABLE doc_agendas_zonales;
TRUNCATE TABLE doc_tipos_convocatoria;
TRUNCATE TABLE doc_cat_tipo_evidencia;
TRUNCATE TABLE doc_config_general;
TRUNCATE TABLE doc_pnd_objetivos;

SET SQL_SAFE_UPDATES = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tipos de Convocatoria
INSERT INTO doc_tipos_convocatoria (nombre, descripcion) VALUES
('Investigación Aplicada', 'Desarrollo de prototipos y soluciones técnicas'),
('Innovación y Transferencia Tecnológica', 'Proyectos orientados a prototipos TRL 4-7, registro SENADI y transferencia a la industria'),
('Retos de Innovación Abierta', 'Desafíos técnicos formulados por empresas o GADs locales'),
('Semilleros', 'Iniciación a la investigación con estudiantes'),
('Vinculación e Investigación', 'Proyectos integrados con la comunidad');

-- 11. Catálogo de Evidencias
INSERT INTO doc_cat_tipo_evidencia (uuid, nombre, descripcion) VALUES
(UUID(), 'Fotografía de Prototipo', 'Evidencia visual de avance tecnológico'),
(UUID(), 'Acta de Entrega-Recepción', 'Documento legal de vinculación externa'),
(UUID(), 'Certificado SENADI', 'Registro de propiedad intelectual'),
(UUID(), 'Lista de Asistencia', 'Evidencia de eventos o validación de campo'),
(UUID(), 'Factura / Comprobante', 'Evidencia de ejecución presupuestaria');

-- Configuración General Semilla
INSERT INTO doc_config_general (Clave, Valor, Descripcion) VALUES
('PeerReview.AutoExtendDeadlines',    'false',              'Indica si se deben extender los plazos de manera automática'),
('PeerReview.AutoExtendDays',         '7',                  'Días de prórroga automática al expirar plazo'),
('Backup.AutoSchedule',               '0 2 * * *',          'Frecuencia en formato CRON para el respaldo automático (Ej: todos los días a las 2:00 AM)'),
('Backup.RetentionDays',              '30',                 'Cantidad de días que se conservarán las copias de seguridad locales'),
('Backup.CloudBackupEnabled',         'false',              'Indica si se deben subir los respaldos a la nube configurada'),
('Backup.DestinationPath',            'C:\\dosier_backups\\', 'Ruta local donde se almacenarán temporal o permanentemente los respaldos'),
-- ADAPTABILIDAD SIGAFI: Cambia el id de subcategoría sin recompilar el backend.
-- Si SIGAFI actualiza su estructura, solo actualizar este valor aquí.
-- WorkflowEngineService y CatalogsController deben leer esta clave en lugar del fallback = 7.
('Sigafi.InvestigacionSubcategoriaId', '7',                 'ID de la subcategoría de INVESTIGACIÓN en la tabla subcategorias_actividades de SIGAFI. Actualizar si SIGAFI reorganiza su catálogo.'),
('Sigafi.InvestigacionSubcategoriaNombre', 'INVESTIGACION', 'Nombre de búsqueda alternativo de la subcategoría de investigación en SIGAFI (usado si el ID cambia)'),
('Caces.TrlMinimoInnovacion',          '5',                 'TRL mínimo para que un proyecto cuente como innovación en los indicadores CACES (E3.INNO). Cambiar si el CACES actualiza el umbral.'),
('Caces.AñoModelo',                    '2024',              'Año del modelo de evaluación CACES vigente.'),
('Workflow.EstadosEditables',          'Borrador,En Corrección', 'Lista CSV de estados en los que un proyecto puede ser editado por su director.'),
('Caces.RangosEvaluacion',           '[{"label":"Insatisfactorio","max":50,"badgeClass":"text-error bg-error/10 border-error/20"},{"label":"Poco Satisfactorio","max":70,"badgeClass":"text-warning bg-warning/10 border-warning/20"},{"label":"Satisfactorio","max":90,"badgeClass":"text-info bg-info/10 border-info/20"},{"label":"Excelente","max":100,"badgeClass":"text-success bg-success/10 border-success/20"}]', 'Rangos cualitativos y estilos visuales de calificación del CACES.'),
('DocumentMaintenance.RetentionDays', '1825',              'Cantidad de días de retención legal para evidencias físicas de proyectos de investigación del CACES (por defecto 5 años / 1825 días).'),
('Theme.GlobalConfigJson', '{"colors":{"primary":"#222c57","secondary":"#c4a857","text":"#1a1a1a","tableHeaderBg":"#222c57","tableHeaderColor":"#ffffff","accent":"#9ad3de"},"typography":{"fontFamily":"\'Calibri\', \'Open Sans\', Arial, sans-serif","baseSize":"10pt","lineHeight":"1.4"},"layout":{"marginTop":"3cm","marginBottom":"2cm","marginLeft":"2cm","marginRight":"2cm","landscapeMarginTop":"1.8cm","landscapeMarginLeft":"1.2cm"},"brand":{"showCoverPage":true,"logoScale":"100%"}}', 'Diseño y branding global institucional (colores, márgenes, tipografía).');



-- 9. Objetivos del Plan Nacional de Desarrollo (Ecuador 2024-2025)
INSERT INTO doc_pnd_objetivos (uuid, codigo, nombre, descripcion) VALUES
(UUID(), 'PND-OBJ-1', 'Productividad y Competitividad', 'Incrementar la productividad y competitividad en los sectores agrícola, industrial y de servicios.'),
(UUID(), 'PND-OBJ-2', 'Desarrollo Tecnológico', 'Fomentar la generación de conocimiento, el desarrollo científico y la innovación tecnológica.'),
(UUID(), 'PND-OBJ-3', 'Educación de Calidad', 'Garantizar el acceso, permanencia y calidad de la educación superior tecnológica.'),
(UUID(), 'PND-OBJ-4', 'Gestión Ambiental', 'Promover la gestión integral de los recursos naturales y la adaptación al cambio climático.'),
(UUID(), 'PND-OBJ-5', 'Empleo y Emprendimiento', 'Fomentar la generación de empleo digno y el fortalecimiento del ecosistema emprendedor.');

-- #############################################################################
-- SECCIÓN: DOSIER Document Engine — Plantillas y Auditoría Documental
-- #############################################################################

CREATE TABLE doc_document_templates (
    id                      INT           AUTO_INCREMENT PRIMARY KEY,
    code                    VARCHAR(100)  NOT NULL UNIQUE COMMENT 'Código único (ej: PROTOCOLO_INVESTIGACION)',
    name                    VARCHAR(255)  NOT NULL,
    description             TEXT,
    html_content            LONGTEXT      NOT NULL,
    custom_css              TEXT,
    collaborative_fields_json TEXT          NULL COMMENT 'JSON con los campos que usan CoWork (ej: ["antecedentes", "justificacion"])',
    theme_config_json       LONGTEXT      NULL COMMENT 'JSON que define los Design Tokens de tematización (colores, márgenes, tipografías)',
    version                 INT           NOT NULL DEFAULT 1,
    category                INT           NOT NULL COMMENT 'Enum DocumentCategory',
    requires_lopdp          TINYINT(1)    NOT NULL DEFAULT 1,
    supports_blind_mode     TINYINT(1)    NOT NULL DEFAULT 0,
    requires_traceability   TINYINT(1)    NOT NULL DEFAULT 1,
    requires_signature      TINYINT(1)    NOT NULL DEFAULT 0,
    signature_type          VARCHAR(50)   NOT NULL DEFAULT 'DOSIER' COMMENT 'DOSIER, ECUADOR_P12, HIBRIDO',
    is_active               TINYINT(1)    NOT NULL DEFAULT 1,
    created_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by              VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_documentos_instancias (
    id                      INT           AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)   NOT NULL UNIQUE COMMENT 'UUID público de la instancia',
    template_code           VARCHAR(100)  NOT NULL,
    template_version        INT           NOT NULL,
    entity_uuid             VARCHAR(36)   NOT NULL        COMMENT 'UUID de la entidad a la que pertenece (Proyecto, Informe, etc)',
    entity_type             VARCHAR(50)   NOT NULL DEFAULT 'Proyecto' COMMENT 'Tipo de entidad (Proyecto, Informe, etc)',
    titulo_instancia        VARCHAR(255)  NULL            COMMENT 'Título descriptivo para el usuario',
    estado                  INT           NOT NULL DEFAULT 1 COMMENT '1=Borrador, 2=EnRevision, 3=Finalizado, 4=Firmado',
    created_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              VARCHAR(100)  NOT NULL,
    final_pdf_path          VARCHAR(512)  NULL            COMMENT 'Ruta al PDF generado físicamente',
    file_hash               VARCHAR(100)  NULL            COMMENT 'Hash SHA-256 del PDF final',
    traceability_code       VARCHAR(100)  NULL            COMMENT 'Código impreso en el PDF para validación externa',
    data_snapshot_json      LONGTEXT      NULL            COMMENT 'Snapshot forense de los datos inyectados',
    template_config_snapshot_json LONGTEXT NULL           COMMENT 'Snapshot del JSON de bloques dinámicos en el momento de creación',
    is_file_purged          TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Indica si el PDF físico fue eliminado para liberar espacio',
    purged_at               TIMESTAMP     NULL            COMMENT 'Fecha y hora de la depuración del archivo físico',
    purged_by               VARCHAR(100)  NULL            COMMENT 'Usuario o Job que ejecutó la depuración del archivo',
    INDEX idx_entity (entity_uuid),
    CONSTRAINT fk_doc_instancia_template FOREIGN KEY (template_code) REFERENCES doc_document_templates(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_user_signature_profiles (
    idPerfil                INT           AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)   NOT NULL UNIQUE,
    idUsuario               INT(11)       NOT NULL UNIQUE,
    firma_imagen_b64        VARCHAR(512)  NULL     COMMENT 'Ruta al archivo PNG de la firma en almacenamiento o Base64',
    iniciales               VARCHAR(10)   NULL,
    cargo                   VARCHAR(200)  NULL     COMMENT 'Cargo institucional para estampar',
    departamento            VARCHAR(200)  NULL     COMMENT 'Departamento o área del firmante',
    es_configurado          TINYINT(1)    NOT NULL DEFAULT 0,
    creado_en               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[FIRMA] Perfiles de firma institucional por usuario';

CREATE TABLE doc_documentos_firmas (
    idFirma                 INT           AUTO_INCREMENT PRIMARY KEY,
    uuid                    VARCHAR(36)   NOT NULL UNIQUE COMMENT 'UUID público del registro de firma',
    documento_uuid          VARCHAR(36)   NOT NULL,
    firmante_id             VARCHAR(100)  NOT NULL COMMENT 'ID o Email del firmante (ej. c.c. o correo)',
    firmante_rol            VARCHAR(50)   NOT NULL COMMENT 'Rol del firmante en el documento (ej. Director, Autor)',
    fecha_firma             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_firma              ENUM('FirmaEC', 'DOSIER') NOT NULL DEFAULT 'DOSIER' COMMENT 'Tipo de firma aplicada',
    firma_code              VARCHAR(50)   NULL UNIQUE COMMENT 'Código legible para verificación (ej: DFRM-2026-A1B2C3)',
    hmac_hash               VARCHAR(128)  NULL COMMENT 'Prueba criptográfica de autenticidad HMAC-SHA256',
    doc_hash                VARCHAR(64)   NULL COMMENT 'SHA-256 del PDF en el momento exacto de la firma',
    ip_address              VARCHAR(45)   NULL COMMENT 'IP de auditoría forense',
    user_agent              TEXT          NULL COMMENT 'Navegador de auditoría forense',
    firma_metadata          TEXT          NULL COMMENT 'Datos extraídos del certificado PAdES .p12 o JSON de la firma DOSIER',
    archivo_pdf_firmado     VARCHAR(512)  NOT NULL COMMENT 'Ruta relativa al documento final firmado por este usuario',
    es_valida               TINYINT(1)    NOT NULL DEFAULT 1,
    revocada_en             TIMESTAMP     NULL,
    motivo_revocacion       TEXT          NULL,
    INDEX idx_doc_firma (documento_uuid),
    CONSTRAINT fk_doc_firma_documento FOREIGN KEY (documento_uuid) REFERENCES doc_documentos_instancias(uuid) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_document_audit (
    id                      INT           AUTO_INCREMENT PRIMARY KEY,
    traceability_code       VARCHAR(100)  NOT NULL UNIQUE,
    template_code           VARCHAR(100)  NOT NULL,
    template_version        INT           NOT NULL,
    project_uuid            VARCHAR(36)   NULL,
    entity_uuid             VARCHAR(36)   NULL COMMENT 'UUID de la entidad origen (Proyecto, Informe, etc)',
    generated_by            VARCHAR(255)  NOT NULL,
    generated_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    was_blind_mode          TINYINT(1)    NOT NULL DEFAULT 0,
    file_name               VARCHAR(255)  NOT NULL,
    file_hash               VARCHAR(100)  NULL COMMENT 'Hash SHA-256 para verificación de integridad',
    data_snapshot_json      LONGTEXT      NULL COMMENT 'Snapshot forense de los datos inyectados (Resiliencia CACES 2026)',
    INDEX idx_entity (entity_uuid),
    INDEX idx_trace (traceability_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- SECCIÓN: DOSIER CoWork — Persistencia de Colaboración en Tiempo Real
-- Módulo: Motor DOSIER CoWork (Yjs + SignalR)
-- Propósito: Almacena el estado binario Yjs de cada documento colaborativo.
--            Garantiza que:
--              1. Los usuarios que se conectan tarde reciben el documento completo.
--              2. El contenido NO se pierde si el servidor se reinicia.
--              3. El historial de quién editó qué queda registrado.
-- Normativa: LOPDP Art. 26 — Registro de acceso a datos sensibles (PI).
-- =============================================================================

CREATE TABLE doc_cowork_documentos (
    idDocumento       INT           AUTO_INCREMENT PRIMARY KEY,
    uuid              VARCHAR(100)  NOT NULL UNIQUE COMMENT 'UUID público del documento (puede incluir sufijo de sección: {uuid}_{CAMPO})',
    entidadTipo       VARCHAR(50)   NOT NULL DEFAULT 'PROYECTO',
    entidadUuid       VARCHAR(100)  NOT NULL        COMMENT 'UUID de la entidad a la que pertenece este documento',
    campoNombre       VARCHAR(100)  NOT NULL        COMMENT 'Campo específico del formulario: antecedentes, metodologia, etc.',
    yjsState          LONGBLOB      NULL            COMMENT 'Snapshot binario del Yjs Doc (Base64). NULL si nunca fue editado.',
    contentHtml       LONGTEXT      NULL            COMMENT 'Snapshot en HTML para el motor de PDFs',
    contentJson       LONGTEXT      NULL            COMMENT 'Snapshot en JSON para el motor de búsqueda/IA',
    version           INT           NOT NULL DEFAULT 0 COMMENT 'Contador de actualizaciones para detectar conflictos',
    creadoEn          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizadoEn     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_entidad_campo (entidadUuid, campoNombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='DOSIER CoWork — Estado persistente de documentos colaborativos Yjs';

-- Registro de sesiones: quién se conectó a qué documento y cuándo.
-- Cumple con LOPDP: trazabilidad de acceso a documentos con propiedad intelectual.
CREATE TABLE doc_cowork_sesiones (
    idSesion          INT           AUTO_INCREMENT PRIMARY KEY,
    documentoUuid     VARCHAR(100)  NOT NULL        COMMENT 'UUID del documento en doc_cowork_documentos',
    usuarioUuid       VARCHAR(36)   NOT NULL        COMMENT 'UUID del usuario (de doc_usuarios_metadata)',
    nombreUsuario     VARCHAR(255)  NOT NULL        COMMENT 'Nombre completo del colaborador (snapshot para auditoría)',
    rolUsuario        VARCHAR(100)  NOT NULL        COMMENT 'Rol en el momento de la sesión (Investigador, Director, etc.)',
    signalrConId      VARCHAR(255)  NULL            COMMENT 'ID de conexión SignalR (para debug)',
    seccionNombre     VARCHAR(100)  NULL            COMMENT 'Nombre de la sección visitada (NULL para sesión base)',
    accion            VARCHAR(255)  NULL            COMMENT 'Acción realizada (NULL para sesión base)',
    conectadoEn       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    desconectadoEn    TIMESTAMP     NULL            COMMENT 'NULL si la sesión sigue activa',
    INDEX idx_documento (documentoUuid),
    INDEX idx_usuario   (usuarioUuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='DOSIER CoWork — Auditoría LOPDP de acceso a documentos colaborativos';

-- Registro de deltas binarios (Estrategia Append-Only para integridad)
CREATE TABLE doc_cowork_updates (
    idUpdate          INT           AUTO_INCREMENT PRIMARY KEY,
    documentoUuid     VARCHAR(100)  NOT NULL,
    updateData        LONGBLOB      NOT NULL COMMENT 'Delta binario generado por Yjs',
    creadoEn          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_doc_upd (documentoUuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='DOSIER CoWork — Historial de cambios para sincronización en tiempo real';
-- =============================================================================
-- SECCIÓN: DOSIER Workflow Engine — Configuración de Estados
-- =============================================================================

-- =============================================================================
-- MOTOR DE FLUJOS ADAPTABLE AL CACES
-- Esta tabla es la ÚNICA fuente de verdad para el comportamiento de cada estado.
-- Para agregar un nuevo estado normativo (ej: 'Pre-aprobado'), solo insertar aquí.
-- Para cambiar qué estados cuentan para carga horaria o informes, solo hacer
-- UPDATE aquí — sin redesplegar el backend.
-- =============================================================================
CREATE TABLE doc_config_workflow (
    idWorkflow              INT           AUTO_INCREMENT PRIMARY KEY,
    estadoOrigen            VARCHAR(50)   NOT NULL     COMMENT 'Estado desde el que se puede ejecutar la transición',
    estadoDestino           VARCHAR(50)   NOT NULL     COMMENT 'Estado al que se pasa tras la transición',
    rolRequerido            VARCHAR(100)  NULL         COMMENT 'Rol que puede ejecutar esta transición (NULL = cualquier rol con acceso al proyecto)',
    requiereObservacion     TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '1 si el usuario debe escribir una justificación',
    activo                  TINYINT(1)    NOT NULL DEFAULT 1,

    -- ATRIBUTOS DE NEGOCIO DEL ESTADO DESTINO
    -- Estas columnas centralizan la lógica que antes estaba quemada en 7+ archivos C#.
    -- El WorkflowEngineService debe consultarlas en lugar de usar arrays hardcodeados.
    contabilizaCargaHoraria TINYINT(1)    NOT NULL DEFAULT 0
        COMMENT '1 si los proyectos en estadoDestino consumen horas del distributivo docente SIGAFI',
    esEstadoFinal           TINYINT(1)    NOT NULL DEFAULT 0
        COMMENT '1 si estadoDestino es un estado terminal (sin más transiciones salvo excepción)',

    -- APARIENCIA EN LA INTERFAZ
    -- Evita que el frontend tenga colores de estado quemados en TypeScript.
    etiquetaUi              VARCHAR(80)   NULL         COMMENT 'Etiqueta legible para el usuario final en la UI',
    colorHex                VARCHAR(7)    NULL         COMMENT 'Color hexadecimal para badges y filtros de la UI (ej: #3B82F6)',

    UNIQUE KEY uk_origen_destino (estadoOrigen, estadoDestino)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    COMMENT 'Motor de Flujos CACES — Única fuente de verdad para estados y sus atributos de negocio';

-- =============================================================================
-- SEED: Ciclo de vida completo del proyecto CACES
-- contabilizaCargaHoraria: 1 para estados activos (bloquea horas en SIGAFI)
-- esEstadoFinal:           1 para Finalizado, Rechazado, Anulado, Inconcluso
-- =============================================================================
--                                                                          contabiliza  esFinal   etiqueta              color
INSERT INTO doc_config_workflow
    (estadoOrigen,    estadoDestino,    rolRequerido,   requiereObservacion, contabilizaCargaHoraria, esEstadoFinal, etiquetaUi,      colorHex, activo)
VALUES
-- Flujo principal de postulación
('Borrador',         'Enviado',         NULL,             0,                   0,                       0,             'Enviado',        '#3B82F6', 1),
('Enviado',          'En Revisión',     'DOSIER_ADMIN',   0,                   1,                       0,             'En Revisión',    '#F59E0B', 1),
('Enviado',          'En Corrección',   'DOSIER_ADMIN',   1,                   0,                       0,             'En Corrección',  '#F97316', 1),
('En Revisión',      'Aprobado',        'DOSIER_ADMIN',   1,                   1,                       0,             'Aprobado',       '#10B981', 1),
('En Revisión',      'Rechazado',       'DOSIER_ADMIN',   1,                   0,                       1,             'Rechazado',      '#EF4444', 1),
('En Revisión',      'En Corrección',   'DOSIER_ADMIN',   1,                   0,                       0,             'En Corrección',  '#F97316', 1),
('En Corrección',    'Enviado',         NULL,             0,                   0,                       0,             'Enviado',        '#3B82F6', 1),
-- Paso a ejecución
('Aprobado',         'En Ejecución',    'DOSIER_ADMIN',   0,                   1,                       0,             'En Ejecución',   '#8B5CF6', 1),
-- Cierre del proyecto
('En Ejecución',     'Finalizado',      'DOSIER_ADMIN',   1,                   0,                       1,             'Finalizado',     '#059669', 1),
('En Ejecución',     'Inconcluso',      'DOSIER_ADMIN',   1,                   0,                       1,             'Inconcluso',     '#6B7280', 1),
-- Anulación desde cualquier estado pre-ejecución
('Borrador',         'Anulado',         'DOSIER_ADMIN',   1,                   0,                       0,                     1,             'Anulado',        '#94A3B8', 1),
('Enviado',          'Anulado',         'DOSIER_ADMIN',   1,                   0,                       0,                     1,             'Anulado',        '#94A3B8', 1),
('En Revisión',      'Anulado',         'DOSIER_ADMIN',   1,                   0,                       0,                     1,             'Anulado',        '#94A3B8', 1);

-- ═══════════════════════════════════════════════════════════════════
-- DOSIER CoWork — Coordinación Team Pulse & Colaboración Premium
-- ═══════════════════════════════════════════════════════════════════

-- Metadatos de Secciones (Estado y Progreso)
CREATE TABLE doc_documentos_secciones_metadata (
    idMetadata          INT           AUTO_INCREMENT PRIMARY KEY,
    instanceUuid        VARCHAR(100)  NOT NULL COMMENT 'UUID de la instancia del documento',
    sectionName         VARCHAR(100)  NOT NULL COMMENT 'Nombre de la sección (ej: resumen, metodologia)',
    status              VARCHAR(50)   NOT NULL DEFAULT 'Borrador' COMMENT 'Borrador, Revisión, Aprobado',
    lastUserUuid        VARCHAR(36)   NULL,
    lastUserName        VARCHAR(255)  NULL,
    actualizadoEn       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_instance_section (instanceUuid, sectionName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Gestión de estados por sección para coordinación Team Pulse';

-- Comentarios Colaborativos (Hilos de Discusión)
CREATE TABLE doc_collaboration_comments (
    idComment           INT           AUTO_INCREMENT PRIMARY KEY,
    instanceUuid        VARCHAR(100)  NOT NULL,
    userUuid            VARCHAR(36)   NOT NULL,
    userName            VARCHAR(255)  NOT NULL,
    content             TEXT          NOT NULL,
    parentId            INT           NULL COMMENT 'Para hilos de conversación',
    creadoEn            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_instance (instanceUuid),
    CONSTRAINT fk_doc_comment_parent FOREIGN KEY (parentId) REFERENCES doc_collaboration_comments(idComment) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Hilos de discusión real-time dentro de los documentos';

-- =============================================================================
-- SECCIÓN: MOTOR DE CORREOS PERSONALIZADO (DOSIER)
-- =============================================================================

CREATE TABLE doc_email_templates (
    idEmailTemplate INT           AUTO_INCREMENT PRIMARY KEY,
    uuid            VARCHAR(36)   NOT NULL UNIQUE,
    codigo          VARCHAR(100)  NOT NULL UNIQUE COMMENT 'Código único del template',
    nombre          VARCHAR(255)  NOT NULL,
    descripcion     TEXT          NULL,
    asunto          VARCHAR(255)  NOT NULL,
    cuerpoHtml      LONGTEXT      NOT NULL,
    activo          TINYINT(1)    NOT NULL DEFAULT 1,
    fechaCreado     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaActualizado TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_email_historial (
    idEmailHistorial INT          AUTO_INCREMENT PRIMARY KEY,
    uuid             VARCHAR(36)  NOT NULL UNIQUE,
    destinatario     VARCHAR(255) NOT NULL COMMENT 'Correo electrónico destino',
    idUsuarioDestinatario INT(11) NULL COMMENT 'Vínculo al usuario en la tabla usuarios si aplica',
    asunto           VARCHAR(255) NOT NULL,
    cuerpo           LONGTEXT     NOT NULL,
    estado           ENUM('Pendiente', 'Enviado', 'Fallido', 'Rebotado') NOT NULL DEFAULT 'Pendiente',
    errorMensaje     TEXT         NULL,
    fechaEnvio       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    adjuntosJson     JSON         NULL COMMENT 'JSON array con metadatos de archivos adjuntos',
    metadataJson     JSON         NULL COMMENT 'JSON con metadatos del sistema (proyecto_uuid, etc)',
    FOREIGN KEY (idUsuarioDestinatario) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$
CREATE TRIGGER trg_doc_email_tpl_uuid BEFORE INSERT ON doc_email_templates FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
CREATE TRIGGER trg_doc_email_hist_uuid BEFORE INSERT ON doc_email_historial FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- =============================================================================
-- SEMILLAS: MOTOR DE CORREOS PERSONALIZADO (DOSIER)
-- =============================================================================

-- Plantilla: Nueva Convocatoria Abierta
INSERT INTO doc_email_templates (uuid, codigo, nombre, descripcion, asunto, cuerpoHtml, activo) VALUES
(
    UUID(),
    'NUEVA_CONVOCATORIA',
    'Apertura de Nueva Convocatoria de Proyectos',
    'Notificación a docentes sobre el lanzamiento de una nueva convocatoria oficial para postulación de proyectos.',
    'DOSIER: Apertura de Convocatoria Oficial - [[convocatoria_titulo]]',
    '<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f0f0f0; padding-bottom: 16px;">
            <h1 style="color: #000000; font-size: 20px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: -0.05em;">DOSIER</h1>
            <p style="color: #666666; font-size: 11px; font-weight: 500; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.15em;">Sistema de Portafolio Docente ISTPET</p>
        </div>

        <h2 style="color: #111111; font-size: 16px; font-weight: 600; line-height: 1.4; margin-top: 0;">Estimado/a Docente Investigador/a,</h2>

        <p style="color: #444444; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Nos complace informar que el Departamento de Investigación e Innovación ha abierto oficialmente la convocatoria <strong>[[convocatoria_titulo]]</strong> para el periodo académico vigente. Le invitamos a postular sus propuestas de investigación aplicada e innovación tecnológica.
        </p>

        <div style="background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #111111; font-size: 13px; font-weight: 700; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Información de la Convocatoria</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse; color: #333333;">
                <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: 600; width: 150px;">Código:</td><td style="padding: 8px 0;">[[convocatoria_codigo]]</td></tr>
                <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: 600;">Título:</td><td style="padding: 8px 0;">[[convocatoria_titulo]]</td></tr>
                <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: 600;">Fecha de Apertura:</td><td style="padding: 8px 0;">[[convocatoria_apertura]]</td></tr>
                <tr><td style="padding: 8px 0; font-weight: 600;">Fecha de Cierre:</td><td style="padding: 8px 0; color: #d9534f; font-weight: 700;">[[convocatoria_cierre]]</td></tr>
            </table>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
            <a href="[[sistema_url]]/investigacion/convocatorias" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Postular Propuesta</a>
        </div>

        <p style="color: #666666; font-size: 12px; line-height: 1.6; margin-bottom: 24px;">
            Las propuestas y toda la documentación requerida (protocolo y cronograma Gantt) deben ser cargadas antes de la fecha de cierre.
        </p>

        <div style="border-top: 1px solid #eaeaea; padding-top: 16px; text-align: center; font-size: 11px; color: #888888; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">DOSIER — [[institucion_nombre]]</p>
            <p style="margin: 0 0 12px 0;">Quito, Ecuador</p>
            <p style="margin: 0; font-size: 10px; color: #aaaaaa;">Este es un correo automático generado por el sistema. Por favor no responda directamente.</p>
        </div>
    </div>',
    1
);

-- Plantilla 3: Proyecto Postulado con Éxito
INSERT INTO doc_email_templates (uuid, codigo, nombre, descripcion, asunto, cuerpoHtml, activo) VALUES
(
    UUID(),
    'PROYECTO_POSTULADO',
    'Confirmación de Postulación de Proyecto',
    'Acuse de recibo enviado al docente director cuando finaliza la postulación digital de su protocolo.',
    'DOSIER: Postulación de Proyecto Recibida - [[proyecto_titulo]]',
    '<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f0f0f0; padding-bottom: 16px;">
            <h1 style="color: #000000; font-size: 20px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: -0.05em;">DOSIER</h1>
            <p style="color: #666666; font-size: 11px; font-weight: 500; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.15em;">Sistema de Portafolio Docente ISTPET</p>
        </div>

        <h2 style="color: #111111; font-size: 16px; font-weight: 600; line-height: 1.4; margin-top: 0;">Estimado/a [[proyecto_director]],</h2>

        <p style="color: #444444; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Confirmamos que su propuesta titulada <strong>[[proyecto_titulo]]</strong> ha sido postulada exitosamente en el sistema DOSIER. El proyecto ha sido registrado con el estado <strong>[[proyecto_estado]]</strong> y entra formalmente al flujo de revisión técnica institucional.
        </p>

        <div style="background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #111111; font-size: 13px; font-weight: 700; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Resumen del Registro</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse; color: #333333;">
                <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: 600; width: 120px;">Código Temporal:</td><td style="padding: 8px 0;">[[proyecto_codigo]]</td></tr>
                <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: 600;">Título:</td><td style="padding: 8px 0;">[[proyecto_titulo]]</td></tr>
                <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0; font-weight: 600;">Línea:</td><td style="padding: 8px 0;">[[linea_investigacion]]</td></tr>
                <tr><td style="padding: 8px 0; font-weight: 600;">Director:</td><td style="padding: 8px 0;">[[proyecto_director]]</td></tr>
            </table>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
            <a href="[[proyecto_workspace_url]]" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Ver Workspace del Proyecto</a>
        </div>

        <p style="color: #666666; font-size: 12px; line-height: 1.6; margin-bottom: 24px;">
            Adjunto a este correo encontrará la Ficha del Protocolo de Investigación generada de forma automatizada por el sistema para sus archivos. Se le notificará tan pronto como concluya la revisión técnica institucional.
        </p>

        <div style="border-top: 1px solid #eaeaea; padding-top: 16px; text-align: center; font-size: 11px; color: #888888; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">DOSIER — [[institucion_nombre]]</p>
            <p style="margin: 0 0 12px 0;">Quito, Ecuador</p>
            <p style="margin: 0; font-size: 10px; color: #aaaaaa;">Este es un correo automático generado por el sistema. Por favor no responda directamente.</p>
        </div>
    </div>',
    1
);

-- Plantilla 6: Alerta de Vencimiento de Hito de Cronograma (Autómata Scheduler)
INSERT INTO doc_email_templates (uuid, codigo, nombre, descripcion, asunto, cuerpoHtml, activo) VALUES
(
    UUID(),
    'ALERTA_HITO_VENCIMIENTO',
    'Alerta de Vencimiento de Hito de Cronograma',
    'Recordatorio automatizado enviado al docente director cuando se acerca la fecha límite de entrega de evidencias en su cronograma Gantt.',
    'DOSIER Alerta: Vencimiento de Hito Próximo - [[nombre_hito]]',
    '<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f0f0f0; padding-bottom: 16px;">
            <h1 style="color: #d9534f; font-size: 20px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: -0.05em;">DOSIER ALERTA</h1>
            <p style="color: #666666; font-size: 11px; font-weight: 500; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.15em;">Sistema de Portafolio Docente ISTPET</p>
        </div>

        <h2 style="color: #111111; font-size: 16px; font-weight: 600; line-height: 1.4; margin-top: 0;">Estimado/a Docente Director/a,</h2>

        <p style="color: #444444; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Le recordamos que de acuerdo al cronograma Gantt aprobado para su proyecto, se aproxima el vencimiento de una actividad crítica que requiere la entrega de evidencias documentales (CACES Compliance).
        </p>

        <div style="background-color: #fdf7f7; border: 1px solid #eed3d2; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #a94442; font-size: 13px; font-weight: 700; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Detalles del Hito Próximo a Vencer</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse; color: #333333;">
                <tr style="border-bottom: 1px solid #eed3d2;"><td style="padding: 8px 0; font-weight: 600; width: 140px; color: #a94442;">Hito/Tarea:</td><td style="padding: 8px 0; font-weight: 600;">[[nombre_hito]]</td></tr>
                <tr style="border-bottom: 1px solid #eed3d2;"><td style="padding: 8px 0; font-weight: 600; color: #a94442;">Proyecto:</td><td style="padding: 8px 0;">[[proyecto_titulo]]</td></tr>
                <tr><td style="padding: 8px 0; font-weight: 600; color: #a94442;">Fecha Límite:</td><td style="padding: 8px 0; color: #d9534f; font-weight: 700;">[[fecha_limite]]</td></tr>
            </table>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
            <a href="[[sistema_url]]/investigacion/proyectos/workspace" style="display: inline-block; background-color: #d9534f; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Subir Evidencias / Informe</a>
        </div>

        <p style="color: #666666; font-size: 12px; line-height: 1.6; margin-bottom: 24px;">
            Evite retrasos que comprometan el cumplimiento del proyecto. Si requiere reprogramar este hito por causas justificadas, por favor solicite una extensión al Director de Investigación en el portal CoWork.
        </p>

        <div style="border-top: 1px solid #eaeaea; padding-top: 16px; text-align: center; font-size: 11px; color: #888888; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">DOSIER — [[institucion_nombre]]</p>
            <p style="margin: 0 0 12px 0;">Quito, Ecuador</p>
            <p style="margin: 0; font-size: 10px; color: #aaaaaa;">Este es un correo automático generado por el sistema. Por favor no responda directamente.</p>
        </div>
    </div>',
    1
);

-- #############################################################################
-- MÓDULO: CALENDARIO INTEGRADO DOSIER
-- #############################################################################
-- Arquitectura: Semi-acoplada. Esta sección añade SOLO la tabla de hitos
-- normativos editables (fuente de datos propia del calendario).
-- El resto de eventos se agregan dinámicamente a través de la vista
-- v_calendario_eventos, que consolida las fuentes ya existentes en el
-- esquema (convocatorias, proyectos, informes de avance, peer reviews).
--
-- ADAPTABILIDAD CACES: Cuando el CACES actualiza plazos o ventanas
-- de autoevaluación, el Admin solo hace INSERT/UPDATE en
-- doc_calendario_eventos_normativos desde /parametros-normativos.
-- No se requiere redespliegue del backend.
-- #############################################################################

CREATE TABLE doc_calendario_eventos_normativos (
    idEvento          INT           AUTO_INCREMENT PRIMARY KEY,
    uuid              VARCHAR(36)   NOT NULL UNIQUE,
    titulo            VARCHAR(255)  NOT NULL  COMMENT 'Nombre visible del evento (ej: Plazo subida SIIES)',
    descripcion       TEXT          NULL      COMMENT 'Detalle informativo para el usuario',
    -- Tipo de evento flexible: Normativo, Academico, Institucional, Feriado, Personal, Reunion, etc.
    tipoEvento        VARCHAR(50)   NOT NULL DEFAULT 'Normativo',
    -- Fechas del evento
    fechaInicio       DATE          NULL,
    fechaFin          DATE          NULL      COMMENT 'NULL si es evento de un solo día',
    esTodoElDia       TINYINT(1)    NOT NULL DEFAULT 1,
    -- RECURRENCIA ANUAL
    recurrenciaAnual  TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1 = el evento se repite cada año en la misma fecha',
    recurrenciaHasta  DATE          NULL     COMMENT 'Año hasta el que se repite (NULL = indefinidamente)',
    -- Visibilidad y Privacidad (Organización Profesional)
    rolesVisibles     VARCHAR(255)  NULL      COMMENT 'Roles que pueden ver este evento. NULL = todos.',
    esPrivado         TINYINT(1)    NOT NULL DEFAULT 1  COMMENT '1 = privado del creador, 0 = visible/compartido para otros',
    prioridad         VARCHAR(15)   NOT NULL DEFAULT 'Media' COMMENT 'Baja, Media, Alta',
    estado            VARCHAR(20)   NOT NULL DEFAULT 'Pendiente' COMMENT 'Pendiente, EnProgreso, Completado, Cancelado',
    -- Referencia a módulo del sistema
    moduloOrigen      VARCHAR(50)   NULL      COMMENT 'Módulo al que aplica: CONVOCATORIAS, PROYECTOS, SIIES, PERSONAL, etc.',
    urlAccion         VARCHAR(255)  NULL      COMMENT 'Ruta interna del sistema (ej: /convocatorias)',
    colorHex          VARCHAR(7)    NULL DEFAULT '#6B7280' COMMENT 'Color personalizado del evento en el calendario',
    -- ALERTAS AUTOMÁTICAS por email
    alertaDias        INT           NULL DEFAULT 7 COMMENT 'Días antes del evento para enviar alerta. NULL = sin alerta.',
    -- Notas Rápidas — campos extendidos
    notaDetalle       TEXT          NULL      COMMENT 'Descripción extendida opcional de la nota rápida (campo expandible en UI)',
    ordenBandeja      INT           NULL      COMMENT 'Posición manual de la nota en la bandeja Inbox (drag-to-reorder). NULL = no ordenada',
    -- Trazabilidad
    activo            TINYINT(1)    NOT NULL DEFAULT 1,
    creadoPor         INT(11)       NULL,
    fechaRegistro     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaModificacion TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creadoPor) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT 'Hitos normativos y académicos editables por el Admin sin redespliegue';

-- =============================================================================
-- TOKENS iCAL: Suscripción al calendario desde Google Calendar / Outlook
-- =============================================================================
-- Cada usuario recibe un token único. Con él, puede suscribirse a la URL:
--   GET /api/calendario/feed/{token}/calendario.ics
-- y su app de calendario sincronizará automáticamente sin requerir login.
-- El token es regenerable por el usuario desde /configuracion.
CREATE TABLE doc_ical_tokens (
    idToken           INT           AUTO_INCREMENT PRIMARY KEY,
    uuid              VARCHAR(36)   NOT NULL UNIQUE,
    idUsuario         INT(11)       NOT NULL UNIQUE COMMENT 'Un token por usuario',
    token             VARCHAR(64)   NOT NULL UNIQUE COMMENT 'Token seguro de 32 bytes en hex',
    activo            TINYINT(1)    NOT NULL DEFAULT 1,
    fechaGenerado     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaUltimoUso    TIMESTAMP     NULL     COMMENT 'Fecha de la última solicitud del feed .ics',
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT 'Tokens de suscripción iCal para Google Calendar / Outlook / iPhone';

DELIMITER $$
CREATE TRIGGER trg_doc_ical_token_uuid
BEFORE INSERT ON doc_ical_tokens FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- =============================================================================
-- TRAZABILIDAD DE ALERTAS: Evita alertas duplicadas del job diario
-- =============================================================================
-- Cada vez que el cron envía una alerta, registra aquí.
-- El job verifica esta tabla antes de enviar para no duplicar correos.
CREATE TABLE doc_calendario_alertas_enviadas (
    idAlerta          INT           AUTO_INCREMENT PRIMARY KEY,
    -- Referencia al evento origen (normativo o dinámico)
    idEventoCalendario VARCHAR(50)  NOT NULL COMMENT 'ID compuesto del evento (ej: NORM-3, INF-12, PROY-FIN-5)',
    idUsuario         INT(11)       NOT NULL COMMENT 'Usuario al que se envió la alerta',
    fechaEvento       DATE          NOT NULL COMMENT 'Fecha del evento para el que se alertó',
    fechaEnvio        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_alerta (idEventoCalendario, idUsuario, fechaEvento),
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT 'Trazabilidad del cron de alertas — evita correos duplicados';

DELIMITER $$
CREATE TRIGGER trg_doc_cal_norm_uuid
BEFORE INSERT ON doc_calendario_eventos_normativos FOR EACH ROW
BEGIN IF NEW.uuid IS NULL OR NEW.uuid = '' THEN SET NEW.uuid = UUID(); END IF; END$$
DELIMITER ;

-- =============================================================================
-- VISTA AGREGADORA: v_doc_calendario_eventos
-- =============================================================================

CREATE OR REPLACE VIEW v_doc_calendario_eventos AS

-- 1. Hitos normativos e individuales (doc_calendario_eventos_normativos)
SELECT
    CONCAT('NORM-', idEvento)               AS idEventoCalendario,
    uuid,
    titulo,
    descripcion,
    IF(tipoEvento IN ('Normativo','Academico','Institucional','Feriado'), 'Normativo', 'Personal') AS categoriaGlobal,
    tipoEvento                              AS subcategoria,
    fechaInicio,
    fechaFin,
    esTodoElDia,
    colorHex,
    NULL                                    AS idEntidadOrigen,
    NULL                                    AS uuidEntidadOrigen,
    'CALENDARIO_NORMATIVO'                  AS tipoEntidadOrigen,
    urlAccion,
    rolesVisibles,
    activo,
    esPrivado,
    prioridad,
    estado,
    creadoPor,
    alertaDias,
    recurrenciaAnual
FROM doc_calendario_eventos_normativos

UNION ALL

-- 2. Apertura de convocatorias
SELECT
    CONCAT('CONV-APE-', idConvocatoria),
    uuid,
    CONCAT('Apertura: ', titulo),
    CONCAT('Convocatoria ', codigoConvocatoria, ' - Inicio del período de postulación.'),
    'Convocatoria', 'AperturaConvocatoria',
    fechaApertura, NULL, 1,
    '#3B82F6',
    idConvocatoria, uuid, 'CONVOCATORIA',
    NULL, NULL,
    IF(estado IN ('Borrador','Abierta','Cerrada'), 1, 0),
    0                                       AS esPrivado,
    'Media'                                 AS prioridad,
    'Pendiente'                             AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_convocatorias

UNION ALL

-- 3. Cierre de convocatorias
SELECT
    CONCAT('CONV-CIE-', idConvocatoria),
    uuid,
    CONCAT('Cierre: ', titulo),
    CONCAT('Convocatoria ', codigoConvocatoria, ' - Fecha límite de postulación.'),
    'Convocatoria', 'CierreConvocatoria',
    fechaCierre, NULL, 1,
    '#F97316',
    idConvocatoria, uuid, 'CONVOCATORIA',
    NULL, NULL,
    IF(estado IN ('Borrador','Abierta','Cerrada'), 1, 0),
    0                                       AS esPrivado,
    'Media'                                 AS prioridad,
    'Pendiente'                             AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_convocatorias

UNION ALL

-- 5. Inicio de proyectos activos
SELECT
    CONCAT('PROY-INI-', idProyecto),
    uuid,
    CONCAT('Inicio: ', titulo),
    CONCAT('Fecha de inicio del proyecto ', COALESCE(codigoInstitucional, uuid)),
    'Proyecto', 'InicioProyecto',
    fechaInicio, NULL, 1,
    '#10B981',
    idProyecto, uuid, 'PROYECTO',
    NULL, 'DOSIER_ADMIN',
    IF(estado NOT IN ('Borrador','Anulado','Rechazado') AND activo = 1, 1, 0),
    0                                       AS esPrivado,
    'Media'                                 AS prioridad,
    'Pendiente'                             AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_proyectos
WHERE fechaInicio IS NOT NULL

UNION ALL

-- 6. Vencimiento de proyectos activos
SELECT
    CONCAT('PROY-FIN-', idProyecto),
    uuid,
    CONCAT('Vencimiento: ', titulo),
    CONCAT('Fecha de cierre planificada del proyecto ', COALESCE(codigoInstitucional, uuid)),
    'Proyecto', 'VencimientoProyecto',
    fechaFin, NULL, 1,
    '#EF4444',
    idProyecto, uuid, 'PROYECTO',
    NULL, NULL,
    IF(estado IN ('En Ejecución','Aprobado') AND activo = 1, 1, 0),
    0                                       AS esPrivado,
    'Alta'                                  AS prioridad,
    'Pendiente'                             AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_proyectos
WHERE fechaFin IS NOT NULL

UNION ALL

-- 9. Plazo de subsanación de protocolo (Fase 1/2)
SELECT
    CONCAT('SUB-PROT-', p.idProyecto),
    p.uuid,
    CONCAT('Plazo de Subsanación: ', p.titulo),
    'Fecha límite para corregir y reenviar el protocolo de investigación.',
    'Proyecto', 'SubsanacionProtocolo',
    p.fechaLimiteSubsanacion, NULL, 1,
    '#F59E0B',
    p.idProyecto, p.uuid, 'PROYECTO',
    NULL, NULL,
    IF(p.estado = 'En Corrección' AND p.activo = 1, 1, 0),
    0                                       AS esPrivado,
    'Alta'                                  AS prioridad,
    'Pendiente'                             AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_proyectos p
WHERE p.fechaLimiteSubsanacion IS NOT NULL;


-- =============================================================================
-- SEMILLAS: Eventos Normativos CACES 2025-2026 (referencia inicial)
-- Actualizar desde /parametros-normativos cuando el CACES publique cambios.
-- =============================================================================

INSERT INTO doc_calendario_eventos_normativos
    (uuid, titulo, descripcion, tipoEvento, fechaInicio, fechaFin, esTodoElDia,
     rolesVisibles, moduloOrigen, urlAccion, colorHex, alertaDias, activo)
VALUES
(
    UUID(),
    'Ventana de Autoevaluación Institucional CACES',
    'Período en que los IST completan la autoevaluación interna para el proceso de acreditación CACES 2025-2026. Asegurar que todos los proyectos y evidencias estén actualizados en DOSIER.',
    'Normativo', '2025-09-01', '2025-09-30', 1,
    NULL, 'SIIES', '/analiticas', '#1E3A8A', 14, 1
),
(
    UUID(),
    'Plazo límite carga masiva SIIES — Indicadores I+D',
    'Fecha de corte para la subida de evidencias estructuradas (CSV) a la plataforma SIIES del CACES. Exportar reportes desde Analíticas antes de esta fecha.',
    'Normativo', '2025-10-15', NULL, 1,
    'DOSIER_ADMIN', 'SIIES', '/analiticas', '#DC2626', 30, 1
),
(
    UUID(),
    'Inicio del Período Académico 2025-2026 II',
    'Apertura del segundo período académico. Los docentes deben registrar su distributivo y horas de investigación asignadas.',
    'Academico', '2025-10-01', NULL, 1,
    NULL, 'DISTRIBUTIVO', '/investigacion', '#0891B2', 7, 1
),
(
    UUID(),
    'Cierre de Convocatoria Interna — Proyectos 2025-II',
    'Fecha máxima para la recepción de protocolos de investigación aplicada del segundo semestre 2025.',
    'Institucional', '2025-10-31', NULL, 1,
    NULL, 'CONVOCATORIAS', '/convocatorias', '#D97706', 7, 1
),
(
    UUID(),
    'Evaluación Externa CACES — Visita de Pares',
    'Período estimado de la visita de evaluadores externos del CACES. Todas las evidencias deben estar firmadas digitalmente y disponibles en DOSIER.',
    'Normativo', '2026-03-01', '2026-03-15', 1,
    NULL, 'SIIES', '/analiticas', '#7C3AED', 45, 1
);

-- Índices para rendimiento del módulo de calendario
CREATE INDEX idx_cal_norm_fechas ON doc_calendario_eventos_normativos(fechaInicio, fechaFin);
CREATE INDEX idx_cal_norm_tipo   ON doc_calendario_eventos_normativos(tipoEvento, activo);
CREATE INDEX idx_cal_nota_bandeja ON doc_calendario_eventos_normativos(creadoPor, fechaInicio, ordenBandeja);



-- =================================================================================
-- ATENCIÓN: ESTE BLOQUE DEBE IR SIEMPRE AL FINAL ABSOLUTO DEL SCRIPT SQL.
-- Registra la migración inicial de EF Core para que no intente recrear las tablas.
-- =================================================================================
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) NOT NULL,
    `ProductVersion` varchar(32) NOT NULL,
    PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
SELECT '20260720202138_InitialCreate', '9.0.0'
WHERE NOT EXISTS (SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260720202138_InitialCreate');

-- Reactivación final de integridad referencial
SET FOREIGN_KEY_CHECKS = 1;




