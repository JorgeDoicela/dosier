-- =============================================================================
-- SISTEMA DOSIER: GESTIÓN CURRICULAR (ISTPET)
-- MODELO RELACIONAL - PROGRAMA DE ESTUDIO DE LA ASIGNATURA (PEA)
-- =============================================================================

USE sigafi_es;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- =============================================================================
-- 0. LIMPIEZA PREVIA Y RESTABLECIMIENTO ESTRUCTURAL
-- =============================================================================

DROP TABLE IF EXISTS
    -- Circuito de Calidad, Auditoría y Firmas
    doc_documentos_firmas,
    doc_pea_trazabilidad,
    doc_pea_observaciones,

    -- Estructura Pedagógica del PEA (Secciones a - k)
    doc_pea_bibliografia,
    doc_pea_evaluaciones,
    doc_pea_actividades_practicas,
    doc_pea_resultados_aprendizaje,
    doc_pea_temas,
    doc_pea_unidades,
    doc_pea_prerrequisitos,
    doc_pea,

    -- Expediente Curricular Institucional
    doc_expediente_asignaciones,
    doc_expedientes_curriculares,

    -- Gobernanza y Antecedentes Curriculares
    doc_asignatura_resultado_perfil,
    doc_perfil_egreso_resultados,
    doc_perfiles_egreso,
    doc_proyectos_curriculares,
    doc_modelos_educativos,
    doc_normativa_articulos,
    doc_normativas;

-- =============================================================================
-- BLOQUE 1: MARCO DE GOBERNANZA CURRICULAR Y NORMATIVA INSTITUCIONAL
-- =============================================================================

-- 1. Repositorio inalterable de normativas externas reguladoras (CES, CACES, SENESCYT)
CREATE TABLE doc_normativas (
    idNormativa             INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria autoincremental de la normativa',
    organismoEmisor         ENUM('CES', 'CACES', 'SENESCYT', 'MINEDUC', 'OTRO') NOT NULL DEFAULT 'CACES' COMMENT 'Ente regulador emisor',
    tipoNormativa           VARCHAR(100)    NOT NULL COMMENT 'Tipo legal: Reglamento, Resolución, Guía Metodológica, Modelo de Evaluación',
    codigoResolucion        VARCHAR(100)    NOT NULL COMMENT 'Código oficial de la resolución (ej: RPC-SO-013-No.111-2022)',
    titulo                  VARCHAR(500)    NOT NULL COMMENT 'Título oficial completo de la normativa',
    descripcion             TEXT            NULL COMMENT 'Resumen o propósito regulatorio',
    fechaEmision            DATE            NULL COMMENT 'Fecha en que el organismo emitió la norma',
    fechaVigencia           DATE            NULL COMMENT 'Fecha a partir de la cual entra en vigencia',
    archivoUrl              VARCHAR(512)    NULL COMMENT 'Ruta de almacenamiento seguro del PDF oficial de la resolución',
    activo                  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '1 = Vigente para auditorías, 0 = Derogada o histórica',
    fechaRegistro           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de registro en el sistema',

    INDEX idx_normativa_emisor (organismoEmisor, activo),
    INDEX idx_normativa_codigo (codigoResolucion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Gobernanza: Repositorio inalterable de normativas externas de educación superior';

-- 2. Artículos y lineamientos específicos para la lista de verificación activa
CREATE TABLE doc_normativa_articulos (
    idArticulo              INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del artículo normativo',
    idNormativa             INT             NOT NULL COMMENT 'FK a la normativa reguladora padre',
    numeroArticulo          VARCHAR(50)     NOT NULL COMMENT 'Identificador del artículo (ej: Art. 21, Criterio 2.1, Estándar 4)',
    titulo                  VARCHAR(255)    NULL COMMENT 'Título o epígrafe temático del artículo',
    contenido               TEXT            NOT NULL COMMENT 'Texto legal verbatim del artículo',
    requisitoCurricular     TEXT            NULL COMMENT 'Directriz o criterio exacto que debe cumplir el PEA para satisfacer este artículo',
    orden                   INT             NOT NULL DEFAULT 1 COMMENT 'Orden secuencial de presentación en auditoría',

    INDEX idx_articulo_normativa (idNormativa),
    FOREIGN KEY (idNormativa) REFERENCES doc_normativas(idNormativa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Gobernanza: Artículos y directrices de auditoría curricular';

-- 3. Modelo Educativo Pedagógico Institucional (Versiones históricas y vigentes)
CREATE TABLE doc_modelos_educativos (
    idModelo                INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del modelo educativo',
    codigo                  VARCHAR(50)     NOT NULL UNIQUE COMMENT 'Código institucional (ej: MED-ISTPET-2024)',
    nombre                  VARCHAR(255)    NOT NULL COMMENT 'Denominación oficial del Modelo Educativo Pedagógico',
    version                 VARCHAR(20)     NOT NULL DEFAULT '1.0' COMMENT 'Versión documental del modelo',
    resolucionAprobacion    VARCHAR(150)    NULL COMMENT 'Resolución del Consejo Superior o Rectorado que avala el modelo',
    descripcion             TEXT            NULL COMMENT 'Síntesis filosófica, pedagógica y metodológica institucional',
    fechaVigenciaDesde      DATE            NOT NULL COMMENT 'Inicio de vigencia pedagógica',
    fechaVigenciaHasta      DATE            NULL COMMENT 'Fin de vigencia (NULL si continúa vigente)',
    archivoUrl              VARCHAR(512)    NULL COMMENT 'Enlace al documento oficial aprobado',
    activo                  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '1 = Activo, 0 = Inactivo',
    fechaRegistro           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',

    INDEX idx_modelo_vigencia (fechaVigenciaDesde, fechaVigenciaHasta, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Gobernanza: Versiones del Modelo Educativo Institucional del ISTPET';

-- 4. Proyectos curriculares de carreras aprobados por el CES (Resolución de creación / Rediseño)
CREATE TABLE doc_proyectos_curriculares (
    idProyectoCurricular    INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del proyecto de carrera',
    idCarrera               INT(11)         NOT NULL COMMENT 'FK a la tabla institucional carreras (SIGAFI)',
    idMalla                 INT(11)         NOT NULL COMMENT 'FK a la tabla mallas (SIGAFI)',
    codigoResolucionCes     VARCHAR(100)    NULL COMMENT 'Número de resolución del CES que aprueba la carrera o rediseño',
    nombreProyecto          VARCHAR(255)    NOT NULL COMMENT 'Nombre del proyecto curricular de la carrera',
    version                 VARCHAR(20)     NOT NULL DEFAULT '1.0' COMMENT 'Versión del rediseño curricular',
    fechaAprobacion         DATE            NULL COMMENT 'Fecha oficial de aprobación en el CES',
    activo                  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '1 = Carrera activa con estudiantes, 0 = No vigente',
    fechaRegistro           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',

    INDEX idx_proy_carrera_malla (idCarrera, idMalla),
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idMalla) REFERENCES mallas(idMalla) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Gobernanza: Proyectos curriculares de carreras avalados por el CES';

-- 5. Perfil de egreso formal institucional por carrera y malla
CREATE TABLE doc_perfiles_egreso (
    idPerfilEgreso          INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del perfil de egreso',
    idCarrera               INT(11)         NOT NULL COMMENT 'FK a carreras (SIGAFI)',
    idMalla                 INT(11)         NOT NULL COMMENT 'FK a mallas (SIGAFI)',
    version                 VARCHAR(20)     NOT NULL DEFAULT '1.0' COMMENT 'Versión del perfil institucional',
    descripcionGeneral      TEXT            NOT NULL COMMENT 'Descripción integral de las competencias profesionales del graduado',
    activo                  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '1 = Vigente, 0 = Histórico',
    fechaRegistro           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',

    INDEX idx_perfil_carrera_malla (idCarrera, idMalla),
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idMalla) REFERENCES mallas(idMalla) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Gobernanza: Perfil de egreso oficial por carrera y diseño de malla';

-- 6. Resultados de Aprendizaje del Perfil de Egreso (RDA Carrera - Administrados institucionalmente)
CREATE TABLE doc_perfil_egreso_resultados (
    idResultadoPerfil       INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del RDA de carrera',
    idPerfilEgreso          INT             NOT NULL COMMENT 'FK al perfil de egreso institucional',
    codigo                  VARCHAR(50)     NOT NULL COMMENT 'Código de control curricular (ej: RDA-SOF-01)',
    descripcion             TEXT            NOT NULL COMMENT 'Declaración formal del resultado de aprendizaje esperado',
    orden                   INT             NOT NULL DEFAULT 1 COMMENT 'Secuencia pedagógica de presentación',

    INDEX idx_res_perfil (idPerfilEgreso),
    FOREIGN KEY (idPerfilEgreso) REFERENCES doc_perfiles_egreso(idPerfilEgreso) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Gobernanza: Resultados de aprendizaje (RDA) oficiales del perfil de egreso';

-- 7. Matriz de tributación curricular: Articulación Asignatura -> Resultados del Perfil de Egreso
CREATE TABLE doc_asignatura_resultado_perfil (
    idRelacion              INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria de la relación de tributación',
    idAsignatura            INT(11)         NOT NULL COMMENT 'FK a la asignatura oficial (SIGAFI)',
    idMalla                 INT(11)         NOT NULL COMMENT 'FK a la malla curricular (SIGAFI)',
    idResultadoPerfil       INT             NOT NULL COMMENT 'FK al RDA de carrera que se tributa',
    nivelAporte             ENUM('Introductorio', 'Medio', 'Avanzado') NOT NULL DEFAULT 'Medio' COMMENT 'Nivel taxonómico de contribución de la materia',

    INDEX idx_asig_malla_res (idAsignatura, idMalla, idResultadoPerfil),
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura) ON DELETE RESTRICT,
    FOREIGN KEY (idMalla) REFERENCES mallas(idMalla) ON DELETE RESTRICT,
    FOREIGN KEY (idResultadoPerfil) REFERENCES doc_perfil_egreso_resultados(idResultadoPerfil) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Gobernanza: Matriz institucional de articulación curricular entre asignaturas y perfil de egreso';

-- =============================================================================
-- BLOQUE 2: GESTIÓN DE EXPEDIENTES CURRICULARES
-- =============================================================================

-- 8. Expediente Curricular: Agrupador oficial por Asignatura, Período y Carrera
CREATE TABLE doc_expedientes_curriculares (
    idExpediente            INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del expediente curricular',
    codigoExpediente        VARCHAR(100)    NULL COMMENT 'Código institucional de control (ej: EXP-2025-SOF-P01-PROG1)',
    idPeriodo               CHAR(7)         CHARACTER SET latin1 NOT NULL COMMENT 'FK a periodos académicos (SIGAFI)',
    idCarrera               INT(11)         NOT NULL COMMENT 'FK a carreras (SIGAFI)',
    idMalla                 INT(11)         NULL COMMENT 'FK a mallas (SIGAFI)',
    idDetalleMalla          INT(11)         NULL COMMENT 'FK al desglose de horas/créditos en detallemallas (SIGAFI)',
    idAsignatura            INT(11)         NOT NULL COMMENT 'FK a asignaturas (SIGAFI)',
    idNivel                 INT(11)         NULL COMMENT 'Nivel académico / semestre (SIGAFI)',
    idModalidad             INT(11)         NULL COMMENT 'Modalidad académica (SIGAFI)',
    idSeccion               INT(11)         NULL COMMENT 'Jornada matutina, nocturna, etc. (SIGAFI)',
    idDocenteResponsable    VARCHAR(20)     NULL COMMENT 'Cédula o ID del docente líder responsable de la cátedra',
    idProyectoCurricular    INT             NULL COMMENT 'FK al proyecto de carrera aprobado por el CES',
    idPerfilEgreso          INT             NULL COMMENT 'FK al perfil de egreso asociado',
    idModeloEducativo       INT             NULL COMMENT 'FK al modelo pedagógico aplicado',
    estadoGeneral           ENUM('Abierto', 'EnRevision', 'Aprobado', 'Cerrado') NOT NULL DEFAULT 'Abierto' COMMENT 'Estado operativo del expediente',
    fechaApertura           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de apertura del expediente curricular',
    fechaCierre             DATETIME        NULL COMMENT 'Fecha de legalización y cierre del período',
    activo                  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '1 = Activo, 0 = Inactivo',

    INDEX idx_exp_periodo_asig (idPeriodo, idAsignatura),
    INDEX idx_exp_carrera (idCarrera),
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura) ON DELETE RESTRICT,
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo) ON DELETE RESTRICT,
    FOREIGN KEY (idProyectoCurricular) REFERENCES doc_proyectos_curriculares(idProyectoCurricular) ON DELETE SET NULL,
    FOREIGN KEY (idPerfilEgreso) REFERENCES doc_perfiles_egreso(idPerfilEgreso) ON DELETE SET NULL,
    FOREIGN KEY (idModeloEducativo) REFERENCES doc_modelos_educativos(idModelo) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Gestión: Expediente Curricular Maestro por Asignatura y Período Académico';

-- 9. Mapeo de asignaciones docentes y paralelos al expediente de la materia
CREATE TABLE doc_expediente_asignaciones (
    idExpediente            INT             NOT NULL COMMENT 'FK al expediente curricular maestro',
    idAsignacion            INT(11)         NOT NULL COMMENT 'FK a asignaciones_profesores (distributivo docente SIGAFI)',
    esDocenteLider          TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '1 = Docente principal redactor del PEA, 0 = Docente colaborador/paralelo',
    fechaAsignacion         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha en que se vinculó la asignación',
    PRIMARY KEY (idExpediente, idAsignacion),
    INDEX idx_exp_asig_id (idAsignacion),
    FOREIGN KEY (idExpediente) REFERENCES doc_expedientes_curriculares(idExpediente) ON DELETE CASCADE,
    FOREIGN KEY (idAsignacion) REFERENCES asignaciones_profesores(idAsignacion) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Gestión: Mapeo de docentes y paralelos asignados al expediente de la asignatura';

-- =============================================================================
-- BLOQUE 3: ARQUITECTURA PEDAGÓGICA OFICIAL DEL PEA (11 SECCIONES a - k)
-- =============================================================================

-- 10. Cabecera del Programa de Estudio de la Asignatura (PEA)
CREATE TABLE doc_pea (
    idPea                   INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del PEA',
    idExpediente            INT             NULL COMMENT 'FK al expediente curricular maestro',
    idCarrera               INT(11)         NOT NULL COMMENT 'FK a carreras (SIGAFI)',
    idAsignatura            INT(11)         NOT NULL COMMENT 'FK a asignaturas (SIGAFI)',
    idPeriodo               CHAR(7)         CHARACTER SET latin1 NOT NULL COMMENT 'FK a periodos académicos (SIGAFI)',
    idAsignacion            INT(11)         NULL COMMENT 'Vínculo al distributivo docente en asignaciones_profesores (SIGAFI)',
    idMalla                 INT(11)         NULL COMMENT 'FK a mallas (SIGAFI)',
    idDetalleMalla          INT(11)         NULL COMMENT 'FK al detalle normado en detallemallas (SIGAFI)',
    idNivel                 INT(11)         NULL COMMENT 'Nivel o semestre académico',
    idModalidad             INT(11)         NULL COMMENT 'Modalidad académica (SIGAFI)',
    idSeccion               INT(11)         NULL COMMENT 'Jornada académica (SIGAFI)',
    paralelo                VARCHAR(20)     NULL COMMENT 'Paralelo o conjunto de paralelos a los que aplica',
    idDocenteElaborador     VARCHAR(20)     NULL COMMENT 'Cédula o ID institucional del docente autor',
    modalidad               VARCHAR(50)     NOT NULL DEFAULT 'Presencial' COMMENT 'Presencial, Semipresencial, Híbrida, En Línea',
    unidadOrganizacion      VARCHAR(100)    NULL COMMENT 'Unidad curricular: Formación Básica, Profesionalizante o Titulación',
    semestreNivel           VARCHAR(20)     NULL COMMENT 'Primer Semestre, Segundo Semestre, etc.',

    -- Validación Matemática de Horas y Créditos (Reglamento Régimen Académico)
    totalHorasAsignatura    INT             NOT NULL DEFAULT 0 COMMENT 'Total horas certificadas en malla oficial',
    creditos                DECIMAL(4,2)    NOT NULL DEFAULT 0.00 COMMENT 'Créditos académicos (Total Horas / 48)',
    horasContactoDocente    INT             NOT NULL DEFAULT 0 COMMENT 'Sección a) Horas CD - Contacto Docente',
    horasPracticoExperimental INT           NOT NULL DEFAULT 0 COMMENT 'Sección a) Horas APE - Práctico Experimental',
    horasAutonomo           INT             NOT NULL DEFAULT 0 COMMENT 'Sección a) Horas AA - Aprendizaje Autónomo',

    -- Componentes pedagógicos descriptivos
    objetivoAsignatura      TEXT            NULL COMMENT 'Sección b) Objetivo general y de aprendizaje de la materia',
    metodologiaEnsenanza    TEXT            NULL COMMENT 'Sección g) Estrategias pedagógicas, métodos y técnicas didácticas',
    recursosDidacticos      TEXT            NULL COMMENT 'Sección g) Recursos instruccionales, bibliotecas digitales y software',
    evaluacionAprendizaje   TEXT            NULL COMMENT 'Sección i) Políticas de evaluación y criterios formativos institucionales',

    -- Ciclo de Vida y Máquina de Estados
    estado                  ENUM('Borrador', 'EnRevision', 'RevisadoCoord', 'RevisadoAcad', 'Observado', 'Corregido', 'Aprobado', 'Publicado', 'Rechazado') NOT NULL DEFAULT 'Borrador' COMMENT 'Estado actual del PEA en el workflow',
    version                 INT             NOT NULL DEFAULT 1 COMMENT 'Versión secuencial del PEA dentro del período',
    activo                  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '1 = Registro activo, 0 = Histórico o reemplazado',
    fechaCreacion           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de inicio de elaboración',
    fechaModificacion       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación guardada',

    -- Seccional de Firmas y Responsabilidades Institucionales (Sección k — Ley 67 Ecuador)
    firmaElaboradoDocente   VARCHAR(255)    NULL COMMENT 'Código DFRM de firma digital del Docente Autor',
    fechaElaborado          DATETIME        NULL COMMENT 'Fecha de formalización del Docente Autor',
    firmaRevisadoCoord      VARCHAR(255)    NULL COMMENT 'Código DFRM de firma del Coordinador de Carrera',
    fechaRevisadoCoord      DATETIME        NULL COMMENT 'Fecha de aval del Coordinador de Carrera',
    firmaRevisadoAcad       VARCHAR(255)    NULL COMMENT 'Código DFRM de firma de Coordinación Académica',
    fechaRevisadoAcad       DATETIME        NULL COMMENT 'Fecha de verificación metodológica institucional',
    firmaAprobadoVicerrector VARCHAR(255)   NULL COMMENT 'Código DFRM de firma del Vicerrectorado',
    fechaAprobado           DATETIME        NULL COMMENT 'Fecha de aprobación legal definitiva',

    INDEX idx_pea_carrera_asig (idCarrera, idAsignatura, idPeriodo),
    INDEX idx_pea_expediente (idExpediente),
    INDEX idx_pea_estado (estado),
    FOREIGN KEY (idExpediente) REFERENCES doc_expedientes_curriculares(idExpediente) ON DELETE SET NULL,
    FOREIGN KEY (idCarrera) REFERENCES carreras(idCarrera) ON DELETE RESTRICT,
    FOREIGN KEY (idAsignatura) REFERENCES asignaturas(idAsignatura) ON DELETE RESTRICT,
    FOREIGN KEY (idPeriodo) REFERENCES periodos(idPeriodo) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='PEA: Cabecera oficial del Programa de Estudio de la Asignatura ISTPET';

-- 11. Sección c) Prerrequisitos y Correquisitos de la Asignatura
CREATE TABLE doc_pea_prerrequisitos (
    idPrerequisito      INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del prerrequisito',
    idPea               INT             NOT NULL COMMENT 'FK al PEA correspondiente',
    idAsignaturaOrigen  INT(11)         NULL COMMENT 'FK a asignaturas de SIGAFI si la materia existe formalmente',
    codigoAsignatura    VARCHAR(50)     NULL COMMENT 'Código académico de la asignatura previa',
    nombreAsignatura    VARCHAR(255)    NOT NULL COMMENT 'Nombre de la materia prerrequisito o correquisito',
    tipoRequisito       ENUM('Prerrequisito', 'Correquisito') NOT NULL DEFAULT 'Prerrequisito' COMMENT 'Tipo de condición académica',
    observacion         TEXT            NULL COMMENT 'Condición especial de aprobación o conocimientos indispensables requeridos',
    orden               INT             NOT NULL DEFAULT 1 COMMENT 'Secuencia de visualización',

    INDEX idx_prerreq_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idAsignaturaOrigen) REFERENCES asignaturas(idAsignatura) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='PEA Sección c: Prerrequisitos y correquisitos curriculares';

-- 12. Sección f) Contenidos de Enseñanza: Unidades de Estudio
CREATE TABLE doc_pea_unidades (
    idUnidad                INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria de la unidad temática',
    idPea                   INT             NOT NULL COMMENT 'FK al PEA correspondiente',
    numeroUnidad            INT             NOT NULL COMMENT 'Número ordinal de la unidad (1, 2, 3, etc.)',
    nombreUnidad            VARCHAR(255)    NOT NULL COMMENT 'Nombre o título temático de la unidad',
    totalHorasUnidad        INT             NOT NULL DEFAULT 0 COMMENT 'Total de horas planificadas para la unidad',
    horasDocencia           INT             NOT NULL DEFAULT 0 COMMENT 'Horas de Contacto con el Docente (CD)',
    horasPracticoExp        INT             NOT NULL DEFAULT 0 COMMENT 'Horas Práctico-Experimentales (APE)',
    horasAutonomo           INT             NOT NULL DEFAULT 0 COMMENT 'Horas de Aprendizaje Autónomo (AA)',
    orden                   INT             NOT NULL DEFAULT 1 COMMENT 'Secuencia pedagógica de impartición',

    INDEX idx_unidad_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='PEA Sección f: Unidades temáticas con distribución de horas';

-- 13. Sección f) Contenidos de Enseñanza: Temas y Subtemas por Unidad
CREATE TABLE doc_pea_temas (
    idTema                  INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del tema',
    idUnidad                INT             NOT NULL COMMENT 'FK a la unidad de estudio padre',
    numeroTema              INT             NOT NULL COMMENT 'Número o índice del tema dentro de la unidad (ej: 1.1, 1.2)',
    tituloTema              VARCHAR(255)    NOT NULL COMMENT 'Título del tema principal',
    descripcionSubtemas     TEXT            NULL COMMENT 'Desglose detallado de contenidos mínimos y subtemas a tratar',
    orden                   INT             NOT NULL DEFAULT 1 COMMENT 'Orden cronológico de enseñanza',

    INDEX idx_tema_unidad (idUnidad),
    FOREIGN KEY (idUnidad) REFERENCES doc_pea_unidades(idUnidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='PEA Sección f: Temas y subtemas de enseñanza por unidad';

-- 14. Secciones d y e) Resultados de Aprendizaje (de Carrera y de la Asignatura)
CREATE TABLE doc_pea_resultados_aprendizaje (
    idRda                   INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del RDA',
    idPea                   INT             NOT NULL COMMENT 'FK al PEA correspondiente',
    idResultadoPerfil       INT             NULL COMMENT 'FK al RDA de carrera en doc_perfil_egreso_resultados (si aplica articulación)',
    tipoRda                 ENUM('Carrera', 'Asignatura') NOT NULL DEFAULT 'Asignatura' COMMENT 'Distingue si tributa al perfil o es propio de la materia',
    codigoRda               VARCHAR(20)     NULL COMMENT 'Código del RDA (ej: RDA-01)',
    descripcion             TEXT            NOT NULL COMMENT 'Redacción taxonómica del resultado de aprendizaje (Verbo + Objeto + Contexto)',
    nivelDesarrollo         ENUM('Inicial', 'Medio', 'Alto') NOT NULL DEFAULT 'Medio' COMMENT 'Grado de profundidad alcanzado',
    orden                   INT             NOT NULL DEFAULT 1 COMMENT 'Secuencia de visualización',

    INDEX idx_rda_pea (idPea),
    INDEX idx_rda_perfil (idResultadoPerfil),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idResultadoPerfil) REFERENCES doc_perfil_egreso_resultados(idResultadoPerfil) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='PEA Secciones d-e: Resultados de aprendizaje articulados';

-- 15. Sección h) Actividades Prácticas y Experimentales (APE)
CREATE TABLE doc_pea_actividades_practicas (
    idPractica              INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria de la práctica de laboratorio/taller',
    idPea                   INT             NOT NULL COMMENT 'FK al PEA correspondiente',
    idUnidad                INT             NULL COMMENT 'FK a la unidad a la que pertenece la práctica',
    numeroPractica          INT             NOT NULL COMMENT 'Número ordinal de la práctica',
    nombrePractica          VARCHAR(255)    NOT NULL COMMENT 'Título de la práctica o experimento de aplicación',
    caracterizacion         TEXT            NULL COMMENT 'Instrucciones metodológicas, entorno de laboratorio o software requerido',
    duracionHoras           INT             NOT NULL DEFAULT 2 COMMENT 'Duración en horas cronológicas de la práctica',
    orden                   INT             NOT NULL DEFAULT 1 COMMENT 'Secuencia en el ciclo formativo',

    INDEX idx_practica_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idUnidad) REFERENCES doc_pea_unidades(idUnidad) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='PEA Sección h: Actividades prácticas y experimentales de aprendizaje (APE)';

-- 16. Sección i) Mecanismos e Instrumentos de Evaluación del Aprendizaje
CREATE TABLE doc_pea_evaluaciones (
    idEvaluacion        INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del componente de evaluación',
    idPea               INT             NOT NULL COMMENT 'FK al PEA correspondiente',
    denominacion        VARCHAR(100)    NOT NULL COMMENT 'Nota Parcial 1, Nota Parcial 2, Evaluación Sumativa / Examen Final',
    tipoEvaluacion      TEXT            NOT NULL COMMENT 'Detalle de actividades evaluadas: talleres, lecciones, proyectos, rúbricas',
    calificacionMaxima  DECIMAL(4,1)    NOT NULL DEFAULT 10.0 COMMENT 'Ponderación cuantitativa máxima institucional (sobre 10.0)',
    orden               INT             NOT NULL DEFAULT 1 COMMENT 'Secuencia de cómputo institucional',

    INDEX idx_eval_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='PEA Sección i: Componentes e instrumentos de evaluación formal sobre 10 puntos';

-- 17. Sección j) Bibliografía Institucional (Básica, Consulta y Recursos Virtuales)
CREATE TABLE doc_pea_bibliografia (
    idBiblio                INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria de la referencia bibliográfica',
    idPea                   INT             NOT NULL COMMENT 'FK al PEA correspondiente',
    tipoBibliografia        ENUM('Basica', 'Consulta', 'Virtual') NOT NULL DEFAULT 'Basica' COMMENT 'Tipo de fuente bibliográfica',
    autor                   VARCHAR(255)    NULL COMMENT 'Nombre del autor o institución responsable',
    anio                    INT             NULL COMMENT 'Año de publicación (vigencia CACES máx. 5 años recomendada)',
    tituloLibro             VARCHAR(500)    NOT NULL COMMENT 'Título de la obra, manual o investigación',
    editorialCiudad         VARCHAR(255)    NULL COMMENT 'Editorial y ciudad de publicación',
    isbn                    VARCHAR(50)     NULL COMMENT 'Código ISBN / ISSN oficial',
    urlRecurso              VARCHAR(512)    NULL COMMENT 'Enlace directo o acceso a base de datos indexada',
    citaCompletaApa         TEXT            NOT NULL COMMENT 'Cita bibliográfica completa estructurada bajo normas APA vigentes',
    orden                   INT             NOT NULL DEFAULT 1 COMMENT 'Secuencia de presentación',

    INDEX idx_biblio_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='PEA Sección j: Bibliografía básica, complementaria y virtual con citación APA';

-- =============================================================================
-- BLOQUE 4: CIRCUITO DE CALIDAD, AUDITORÍA Y FIRMAS DE RESPONSABILIDAD
-- =============================================================================

-- 18. Bandeja de Observaciones Formadas durante la Revisión del PEA
CREATE TABLE doc_pea_observaciones (
    idObservacion           INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria de la observación',
    idPea                   INT             NOT NULL COMMENT 'FK al PEA observado',
    idUsuarioObservador     INT(11)         NULL COMMENT 'FK a usuarios (SIGAFI) de quien emite la observación',
    rolObservador           VARCHAR(50)     NOT NULL DEFAULT 'CoordinadorCarrera' COMMENT 'Rol que observa: CoordinadorCarrera, CoordinacionAcademica',
    seccionAfectada         VARCHAR(100)    NOT NULL COMMENT 'Sección específica observada: Horas, Objetivos, Unidades, Metodología, etc.',
    textoObservacion        TEXT            NOT NULL COMMENT 'Descripción y requerimiento técnico de la corrección solicitada',
    estado                  ENUM('Pendiente', 'Subsanada', 'Desestimada') NOT NULL DEFAULT 'Pendiente' COMMENT 'Estado de atención de la observación',
    respuestaDocente        TEXT            NULL COMMENT 'Justificación o explicación técnica dada por el docente al subsanar',
    fechaObservacion        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de emisión de la observación',
    fechaResolucion         DATETIME        NULL COMMENT 'Fecha en que la observación fue subsanada o desestimada',

    INDEX idx_obs_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idUsuarioObservador) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Calidad: Observaciones formales emitidas durante el circuito de revisión del PEA';

-- 19. Historial de Trazabilidad de Estados y Auditoría Forense
CREATE TABLE doc_pea_trazabilidad (
    idTrazabilidad          INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria del registro de auditoría',
    idPea                   INT             NOT NULL COMMENT 'FK al PEA auditado',
    idUsuario               INT(11)         NULL COMMENT 'FK a usuarios (SIGAFI) que ejecutó la transición de estado',
    estadoAnterior          VARCHAR(50)     NOT NULL COMMENT 'Estado del cual parte la transición (ej: Borrador, EnRevision)',
    estadoNuevo             VARCHAR(50)     NOT NULL COMMENT 'Estado al que pasa el documento (ej: RevisadoCoord, Aprobado)',
    motivo                  TEXT            NULL COMMENT 'Comentarios o justificación de la transición',
    hashIntegridadSha256    VARCHAR(64)     NULL COMMENT 'Hash criptográfico SHA-256 de los datos en ese momento exacto',
    fechaTransicion         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora inalterable del cambio de estado',

    INDEX idx_traza_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Calidad: Trazabilidad cronológica inmutable del ciclo de vida del PEA';

-- 20. Registro Formal de Firmas Digitales de Responsabilidad
CREATE TABLE doc_documentos_firmas (
    idFirma                 INT             AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave primaria de la firma digital',
    idPea                   INT             NOT NULL COMMENT 'FK al PEA firmado',
    idUsuarioFirmante       INT(11)         NOT NULL COMMENT 'FK al usuario firmante (SIGAFI)',
    rolFirmante             VARCHAR(50)     NOT NULL COMMENT 'Rol con el que firma: DocenteElaborador, CoordinadorCarrera, CoordinacionAcademica, Vicerrector',
    fechaFirma              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora exacta de la firma',
    codigoVerificacion      VARCHAR(50)     NULL UNIQUE COMMENT 'Código único institucional visible (ej: DFRM-2026-PEA-00123)',
    hashDocumento           VARCHAR(64)     NULL COMMENT 'Hash SHA-256 del contenido curricular completo al momento de firmar',
    firmaDigitalBase64      TEXT            NULL COMMENT 'Evidencia criptográfica o certificado PKCS#12 / FirmaEC',
    ipOrigen                VARCHAR(45)     NULL COMMENT 'Dirección IP de auditoría forense',
    userAgent               TEXT            NULL COMMENT 'Navegador o cliente desde el que se efectuó la firma',
    esValida                TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '1 = Válida y vigente, 0 = Revocada',
    revocadaEn              TIMESTAMP       NULL COMMENT 'Fecha de anulación si aplicara',
    motivoRevocacion        TEXT            NULL COMMENT 'Causa formal de revocatoria de la firma',

    INDEX idx_firma_pea (idPea),
    FOREIGN KEY (idPea) REFERENCES doc_pea(idPea) ON DELETE CASCADE,
    FOREIGN KEY (idUsuarioFirmante) REFERENCES usuarios(idUsuario) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Seguridad: Registro formal de firmas digitales institucionales de responsabilidad';

-- =============================================================================
-- BLOQUE 5: SEGURIDAD RBAC CURRICULAR INSTITUCIONAL
-- =============================================================================
-- La seguridad se encuentra integrada en las tablas del sistema base `sigafi_es`:
-- 1. Sistema ID = 6: 'DOSIER' - "Gestión Curricular y Acreditación ISTPET"
-- 2. Cinco Roles:
--    - DOSIER_ADMIN: Administrador general.
--    - DOSIER_DOCENTE: Docente elaborador y autor del PEA.
--    - DOSIER_COORD_CARRERA: Coordinador de Carrera.
--    - DOSIER_COORD_ACAD: Coordinación Académica.
--    - DOSIER_VICERRECTOR: Vicerrectorado.
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;
