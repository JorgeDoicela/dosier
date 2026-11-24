-- =============================================================================
-- SIGAFI / DOSIER - Actualización de Horas Oficiales por Asignatura (Mallas 2023)
-- =============================================================================
-- Fuente oficial: Mallas Curriculares aprobadas por Vicerrectorado (14 PDFs).
-- Actualiza creditos, horas totales, horasDocente (CD) y horasPracticoExperimental (CPAE)
-- en sigafi_es.detallemallas. El componente autónomo (CAA/TA) se obtiene por diferencia:
--   horasAutonomo = horas - horasDocente - horasPracticoExperimental
-- =============================================================================

USE `sigafi_es`;

START TRANSACTION;

-- -----------------------------------------------------------------------------
-- 1. ENTRENAMIENTO DEPORTIVO (idCarrera = 7, idMalla = 31)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 899;  -- MORFOFUNCION
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 900;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 901;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 902;  -- BIOESTADISTICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 903;  -- METODOLOGIA DEL ENTRENAMIENTO DEPORTIVO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 904;  -- VOLEIBOL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 905;  -- PEDAGOGIA Y DIDACTICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 906;  -- FUTBOL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 966;  -- LEGISLACION DEPORTIVA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 967;  -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 968;  -- FISIOLOGIA DEPORTIVA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 969;  -- PLANIFICACION DEL ENTRENAMIENTO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 970;  -- BASQUET
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 971;  -- RECREACION
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 972;  -- DEPORTE ADAPTADO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1031; -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1032; -- PSICOLOGIA DEPORTIVA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1033; -- BIOMECANICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1034; -- NUTRICION
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 1035; -- NATACION
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 1036; -- ATLETISMO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1095; -- GERENCIA Y DISEÑO DE PROYECTOS DEPORTIVOS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1096; -- MEDICINA DEPORTIVA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 1097; -- MUSCULACION
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1098; -- DEPORTES DE CONTACTO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1099; -- GIMNASIA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1100; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 2. DESARROLLO DE SOFTWARE (idCarrera = 9, idMalla = 23, Presencial)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 850;  -- ALGEBRA LINEAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 851;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 852;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 853;  -- MATEMATICAS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 854;  -- FUNDAMENTOS DE PROGRAMACION
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 855;  -- ARQUITECTURA COMPUTACIONAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 856;  -- SISTEMAS OPERATIVOS Y REDES DE COMUNICACION
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 928;  -- PROBABILIDAD Y ESTADISTICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 929;  -- PROGRAMACION ORIENTADA A OBJETOS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 930;  -- ANALISIS Y DISEÑO DE SOFTWARE
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 931;  -- SGBD I
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 932;  -- PROGRAMACION WEB I
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 933;  -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1025; -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1026; -- COMPUTACIÓN EN LA NUBE
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1027; -- PROGRAMACION DE APLICACIONES
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1028; -- SGBD II
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1029; -- PROGRAMACION WEB II
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1030; -- CALIDAD DE SOFTWARE Y AUDITORIA INFORMATICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1042; -- EMPRENDIMIENTO Y LIDERAZGO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1043; -- INTRODUCCION A LA INTELIGENCIA ARTIFICIAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1044; -- PROGRAMACION DE APLICACIONES II
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1045; -- SISTEMAS WEB
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1046; -- SEGURIDAD DE LA INFORMACION
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1047; -- BUSSINESS INTELIGENCE
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1048; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 3. MECÁNICA AUTOMOTRIZ (idCarrera = 10, idMalla = 24)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 843;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 844;  -- MATEMATICAS
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 845;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 846;  -- CIRCUITOS ELECTRICOS Y ELECTRONICOS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 847;  -- DIBUJO TECNICO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 848;  -- SEGURIDAD INDUSTRIAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 849;  -- TALLER DE AJUSTE MECANICO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 920;  -- MECANICA NEWTONIANA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 921;  -- CALCULO DIFERENCIAL E INTEGRAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 922;  -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 923;  -- ELECTRICIDAD Y ELECTRONICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 924;  -- DIBUJO ASISTIDO POR COMPUTADOR
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 925;  -- SISTEMAS AUTOMOTRICES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 926;  -- MOTORES DE COMBUSTION INTERNA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 954;  -- MECANICA DE MATERIALES
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 955;  -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 956;  -- AUTOTRÓNICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 957;  -- FLUIDOS Y LUBRICANTES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 958;  -- ORGANIZACIÓN DE TALLERES AUTOMOTRICES
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 959;  -- REPARACIÓN DE MOTORES A GASOLINA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1056; -- DEONTOLOGIA PROFESIONAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1057; -- AUTOTRONICA II
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1058; -- ESTRUCTURA Y ACABADOS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1059; -- PROCESOS DE MECANIZADO Y TRATAMIENTO SUPERFICIAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1060; -- TECNOLOGIA AUTOMOTRIZ
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1061; -- REPARACION DE MOTORES A DIESEL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1062; -- PROYECTO TECNICO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1189; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 4. CONTABILIDAD Y ASESORIA TRIBUTARIA (idCarrera = 12, idMalla = 22)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 836;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 837;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 838;  -- MATEMATICA FINANCIERA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 839;  -- CONTABILIDAD BÁSICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 840;  -- ADMINISTRACION
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 841;  -- ECONOMÍA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 842;  -- CONTABILIDAD FINANCIERA Y ADMINISTRATIVA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 914;  -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 915;  -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 916;  -- ESTADISTICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 917;  -- CONTROL FINANCIERO Y PRESUPUESTARIO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 918;  -- AUDITORIA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 919;  -- DERECHO LABORAL Y EMPRESARIAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 987;  -- INFORMATICA APLICADA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 988;  -- MARKETING Y EMPRENDIMIENTO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 989;  -- CONTABILIDAD DE COSTOS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 990;  -- DERECHO TRIBUTARIO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 991;  -- GESTION Y ASESORAMIENTO ECONOMICO Y FISCAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1076; -- ETICA Y DESARROLLO INTERPERSONAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1077; -- ANALISIS Y GESTION DE INVERSIONES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1078; -- DISEÑO Y EVALUACION DE PROYECTOS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1079; -- GESTION DE LA CALIDAD PARA PROCESOS CONTABLES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1080; -- REGIMEN TRIBUTARIO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1081; -- TOMA DE DESICIONES ECONOMICAS Y FINANCIERAS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1082; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 5. ADMINISTRACION DE TALENTO HUMANO (idCarrera = 13, idMalla = 25)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 857;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 858;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 859;  -- ESTADISTICA APLICADA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 860;  -- FUNDAMENTOS DE GESTION DE TALENTO HUMANO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 861;  -- ADMINISTRACION DE LA COMPENSACION EN EL TALENTO HUMANO I
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 862;  -- LEGISLACION LABORAL Y SEGURIDAD SOCIAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 863;  -- SEGURIDAD Y SALUD OCUPACIONAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 992;  -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 993;  -- PSICOLOGIA DE LA COMUNICACIÓN
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 994;  -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 995;  -- GESTION Y DESARROLLO POR COMPETENCIAS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 996;  -- RECLUTAMIENTO Y SELECCIÓN DEL PERSONAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 997;  -- ADMINISTRACIÓN DE LA COMPENSACION EN EL TALENTO HUMANO II
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1101; -- ETICA Y DEONTOLOGIA PROFESIONAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1102; -- COMPORTAMIENTO ORGANIZACIONAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1103; -- GESTION PRESUPUESTARIA Y DE TALENTO HUMANO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1104; -- DESARROLLO ORGANIZACIONAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1105; -- ANALISIS DE GESTION DE RIESGOS I
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1106; -- NEGOCIACION Y RESOLUCION DE CONFLICTOS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1107; -- ANALISIS DE GESTION DE RIESGOS II
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1108; -- EVALUACION DEL DESEMPEÑO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1109; -- AUDITORIA DE TRABAJO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1110; -- CAPACITACION Y DESARROLLO DE COMPETENCIAS
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1111; -- PROGRAMACION NEUROLINGÜISTICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1112; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 6. DISEÑO GRAFICO (idCarrera = 14, idMalla = 28)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 878;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 879;  -- FUNDAMENTOS DEL DISEÑO Y CROMATICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 880;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 881;  -- DIBUJO TECNICO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 882;  -- TECNICAS DE ILUSTRACION
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 883;  -- HISTORIA DEL ARTE
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 884;  -- DIGITAL I
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 973;  -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 974;  -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 975;  -- SEMIOTICA Y COMUNICACION
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 976;  -- DIGITAL II (PHOTOSHOP)
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 977;  -- IMAGEN CORPORATIVA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 978;  -- FOTOGRAFIA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 979;  -- ANIMACIÓN
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1037; -- DISEÑO PUBLICITARIO Y MARKETING
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1038; -- MULTIMEDIA I (ANIMATE)
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1039; -- PACKAGING (DISEÑO DE EMPAQUES)
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1040; -- DIGITAL III (INDESING)
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1041; -- MODELADO 3D
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1120; -- ETICA PROFESIONAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1121; -- INNOVACION Y EMPRENDIMIENTO DIGITAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1122; -- DIGITAL IV (PREMIER)
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1123; -- MULTIMEDIA II (AFTER EFFECTS)
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1124; -- DISEÑO WEB
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1185; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 7. EDUCACION INICIAL (idCarrera = 15, idMalla = 30)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 892;  -- FUNDAMENTOS DE LA EDUCACION INICIAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 893;  -- TEORIAS DEL APRENDIZAJE
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 894;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 895;  -- MODALIDADES DE ATENCION EN EDUCACION INICIAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 896;  -- DESARROLLO LUDICO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 897;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 898;  -- PSICOLOGIA DEL DESARROLLO INFANTIL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1010; -- DIDACTICA EN EDUCACION INICIAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1011; -- EXPRESION CORPORAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1012; -- PRIMEROS AUXILIOS EN ATENCIÓN A LA PRIMERA INFANCIA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1013; -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1014; -- LEGISLACIÓN EDUCATICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1015; -- PUERICULTURA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1016; -- ATENCIÓN A LA DIVERSIDAD
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1049; -- CURRICULO I
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1050; -- DESARROLLO DEL LENGUAJE
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1051; -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1052; -- EDUCACION DIGITAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1053; -- LITERATURA INFANTIL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1054; -- ESTIMULACION TEMPRANA (0 - 3 AÑOS)
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 1055; -- TEATRO INFANTIL Y EXPRESION DRAMATICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1148; -- GESTIÓN Y LIDERAZGO EDUCATIVO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1149; -- CURRICULO II
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1150; -- ESTIMULACION INFANTIL (3-6 AÑOS)
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1151; -- EVALUACION EDUCATIVA DEL SUBNIVEL INICIAL I Y II
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1152; -- RINCONES Y AMBIENTES DE APRENDIZAJE
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1153; -- NEUROEDUCACION INFANTIL

-- -----------------------------------------------------------------------------
-- 8. MARKETING DIGITAL Y COMERCIO ELECTRONICO (idCarrera = 16, idMalla = 29)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 885;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 886;  -- FUNDAMENTOS MATEMATICOS
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 887;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 888;  -- FUNDAMENTOS DE E-COMMERCE
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 889;  -- ADMINISTRACION GENERAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 890;  -- FUNDAMENTOS DEL MARKETING
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 891;  -- DISEÑO WEB Y TIENDAS ON LINE
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1005; -- ESTADISTICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1006; -- FOTOGRAFIA DIGITAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1007; -- MARKETING DE CONTENIDOS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1008; -- MARKETING ESTRATEGICO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1009; -- CREACIÓN Y ESTRATEGIS DE MARCA: BRANDING
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1063; -- FUNDAMENTOS DE INVESTIGACION CIENTIFICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1064; -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1065; -- E - COMMERCE Y OMNICANALIDAD
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1066; -- PLATAFORMAS DIGITALES Y SOCIALES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1067; -- MARKETING DIGITAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1068; -- NEUROMARKETING Y VENTAS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1113; -- INVESTIGACION DE MERCADOS
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1114; -- ETICA PROFESIONAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1115; -- ESTRATEGIAS PARA REDES SOCIALES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1116; -- SOCIAL MEDIA Y COMMUNITY MANAGER
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1117; -- EMPRENDIMIENTO DIGITAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1118; -- TENDENCIAS EN TECNOLOGIAS DE MARKETING
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1119; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 9. EDUCACION INCLUSIVA (idCarrera = 17, idMalla = 26)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 864;  -- FUNDAMENTOS DE PEDAGOGIA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 865;  -- FUNDAMENTOS DE DIDACTICA GENERAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 866;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 867;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 868;  -- BASES NEUROPSICOLOGICAS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 935;  -- LEGISLACION EDUCATIVA PARA LA ATENCION INCLUSIVA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 870;  -- SOCIOLOGIA DE LA EDUCACION
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1069; -- CURRICULO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1070; -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1071; -- PSICOLOGIA DEL DESARROLLO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1072; -- PSICOLOGIA DEL APRENDIZAJE PARA LA GESTION AULICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1073; -- ESTIMULACION TEMPRANA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1074; -- NECESIDADES EDUCATIVAS ESPECIALES NO ASOCIADAS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1075; -- NECESIDADES EDUCATIVAS ASOCIADAS A LA DISCAPACIDAD
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1132; -- ADAPTACIONES CURRICULARES
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1133; -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1134; -- ORIENTACIÓN Y AMBIENTACIÓN ÁULICA INCLUSIVA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1135; -- INTERVENCIÓN EDUCATIVA A TRASTORNOS DEL DESARROLLO DEL LENGUAJE
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1136; -- PROBLEMAS EMOCIONALES Y TRASTORNOS CONDUCTUALES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1137; -- INTERVENCIÓN TEMPRANA DESDE LA EDUCACIÓN
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1159; -- GESTIÓN Y LIDERAZGO EDUCATIVO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1160; -- RECURSOS PSICOPEDAGOGICOS PARA LA INCLUSION
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1161; -- INTERVENCION EDUCATIVA EN DIVERSIDAD FUNCIONAL SENSORIAL Y MOTORA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1163; -- INTERVENCION EDUCATIVA EN DIVERSIDAD FUNCIONAL COGNITIVA Y PSICOSOCIAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1162; -- INTERVENCION MEDIANTE PLATAFORMAS DIGITALES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1187; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 10. EDUCACION BASICA (idCarrera = 18, idMalla = 27)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 871;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 872;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 16, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 873;  -- TEORIAS Y MODELOS PEDAGOGICOS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 874;  -- FILOSOFIA DE LA EDUCACION
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 16, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 875;  -- PSICOLOGIA EDUCATIVA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 876;  -- DIDACTICA GENERAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 877;  -- DIDACTICA DEL DEPORTE Y LA EDUCACION FISICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 998;  -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 999;  -- REALIDAD NACIONAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1000; -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1001; -- DIDACTICA DE LAS CCNN1
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1002; -- DIDACTICA DE LA MATEMATICA 1
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1003; -- DIDACTICA DEL LENGUAJE 1
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 16, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1004; -- DIDACTICA DE LA CCSS I
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1083; -- ATENCIÓN A LA DIVERSIDAD
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1084; -- EDUCACION DIGITAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 16, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1085; -- DIDACTICA DE LAS CCNN II
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1086; -- DIDACTICA DE MATEMATICA II
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1087; -- DIDACTICA DE LENGUAJE II
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 16, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1088; -- DIDACTICA DE LAS CCSS II
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 16, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1138; -- FUNDAMENTOS NEUROCIENCIAS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1139; -- CURRÍCULO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1140; -- GESTIÓN Y LIDERAZGO EDUCATIVO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 16, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1141; -- EVALUACIÓN DE LOS APRENDIZAJES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 16, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1186; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 11. GASTRONOMIA (idCarrera = 19, idMalla = 32)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 907;  -- FUNDAMENTOS DE LA GASTRONOMIA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 908;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 909;  -- MATEMATICA APLICADA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 910;  -- QUIMICA CULINARIA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 911;  -- TECNICAS CULINARIAS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 912;  -- HIGIENE Y SANIDAD ALIMENTARIA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 913;  -- DIETETICA Y NUTRICION
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 980;  -- COSTOS Y GESTION DE ALIMENTOS Y BEBIDAS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 981;  -- DISEÑO Y PLANIFICACIÓN DE MENUS
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 982;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 983;  -- TÉCNICAS DE PANADERIA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 984;  -- TÉCNICAS CULINARIAS II
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 985;  -- TÉCNICAS DE BAR Y RESTAUTANTE
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 986;  -- ETNOLOGIA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1018; -- ADMINISTRACION Y MARKETING DE CENTROS GASTRONOMICOS
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1019; -- EDUCACION AMBIENTAL Y SOSTENABILIDAD
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1020; -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1021; -- TECNICAS DE PASTELERIA Y REPOSTERIA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1022; -- COCINA ECUATORIANA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 32, `horasPracticoExperimental` = 64.00 WHERE `idDetalleMalla` = 1023; -- GASTRONOMIA INTERNACIONAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1024; -- TECNICAS DE COCINA Y CHARCUTERIA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1154; -- EMPRENDIMIENTOS GASTRONOMICOS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1155; -- TURISMO GASTRONOMICO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1156; -- TECNICAS DE COCINA CONTEMPORANEA Y DE VANGUARDIA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1157; -- ORGANIZACIÓN DE EVENTOS GRASTRONÓMICOS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1158; -- COCINA FRIA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1188; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 12. REDES Y TELECOMUNICACIONES (idCarrera = 20, idMalla = 34)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 936;  -- FISICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 937;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1017; -- MATEMATICAS
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 938;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 939;  -- FUNDAMENTOS DE PROGRAMACION
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 940;  -- ARQUITECTURA COMPUTACIONAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 941;  -- REDES DE COMUNICACION
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1089; -- ELECTRICIDAD Y ELECTRONICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1090; -- FUNDAMENTOS DE INVESTIGACION CIENTIFICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1091; -- BASE DE DATOS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1092; -- REDES LAN/WAN
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1093; -- COMUNICACION ANALOGICA Y DIGITAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1094; -- SISTEMAS OPERATIVOS
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1142; -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1143; -- CABLE ESTRUCTURADO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1144; -- PLATAFORMAS DE SERVIDORES DE MICROSOFT
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1145; -- COMUNICACIONES MÓVILES Y SATÉLITES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1146; -- SEGURIDAD DE REDES E INTERNET
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1147; -- DISEÑO DE REDES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1164; -- ETICA PROFESIONAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1165; -- PLATAFORMA DE SERVIDORES LINUX/UNIX
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1166; -- ADMINISTRACION DE REDES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1167; -- INTERNET DE LAS COSAS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1168; -- TENDENCIAS EN REDES Y TELECOMUNICACIONES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1190; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 13. ELECTRÓNICA (idCarrera = 21, idMalla = 33)
-- -----------------------------------------------------------------------------
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 942;  -- FISICA GENERAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 943;  -- TIC Y GESTIÓN DEL CONOCIMIENTO
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 944;  -- MATEMATICA APLICADA A LA ELECTRONICA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 945;  -- COMUNICACION Y REDACCION ACADEMICA
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 946;  -- FUNDAMENTOS DE ELECTRONICA Y CIRCUITOS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 947;  -- TALLER DE CIRCUITOS IMPRESOS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 948;  -- ELECTRICIDAD
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1125; -- SEGURIDAD INDUSTRIAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1126; -- CALCULO DIFERENCIAL E INTEGRAL
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1127; -- FUNDAMENTOS DE LA INVESTIGACIÓN CIENTÍFICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1128; -- DISPOSITIVOS ELECTRÓNICOS
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1129; -- INSTRUMENTACIÓN Y SENSORES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1130; -- ELECTRÓNICA ANALÓGICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1131; -- DISEÑO Y MODELAMIENTO ASISTIDO POR COMPUTADORA
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1169; -- EDUCACION AMBIENTAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1170; -- MICROCONTROLADORES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1171; -- MAQUINAS Y CONTROL INDUSTRIAL
UPDATE `detallemallas` SET `creditos` = 3, `horas` = 144, `horasDocente` = 48, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1172; -- ELECTRONICA DE POTENCIA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1173; -- INSTALACIONES INDUSTRIALES DE BAJO VOLTAJE
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1174; -- SISTEMAS ELECTRICOS, NEUMATICOS E HIDRAULICOS
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 0.00  WHERE `idDetalleMalla` = 1176; -- DEONTOLOGIA Y LIDERAZGO PROFESIONAL
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 48.00 WHERE `idDetalleMalla` = 1177; -- DOMÓTICA
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1183; -- PLC
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1179; -- ADMINISTRACION Y PRODUCTIVIDAD
UPDATE `detallemallas` SET `creditos` = 1, `horas` = 48,  `horasDocente` = 16, `horasPracticoExperimental` = 16.00 WHERE `idDetalleMalla` = 1180; -- INTEGRACION DE SISTEMAS ELECTRONICOS
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1181; -- REDES INDUSTRIALES
UPDATE `detallemallas` SET `creditos` = 2, `horas` = 96,  `horasDocente` = 32, `horasPracticoExperimental` = 32.00 WHERE `idDetalleMalla` = 1182; -- UNIDAD DE INTEGRACION CURRICULAR

-- -----------------------------------------------------------------------------
-- 14. NORMALIZACIÓN DE UNIDADES DE ORGANIZACIÓN CURRICULAR (Básica / Profesional / Integración)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO `tipos_asignatura` (`idtipo_asignatura`, `tipo_asignatura`, `abreviatura`, `activo`)
VALUES (4, 'INTEGRACION CURRICULAR', 'U', 1);

-- Corrección de materias mal clasificadas en Desarrollo de Software (idMalla = 23) y Mecánica (idMalla = 24)
UPDATE `detallemallas` SET `tipo` = 'P' WHERE `idDetalleMalla` IN (854, 855, 856, 846, 847, 848, 849, 1057, 1058);

-- Corrección de Unidades de Integración Curricular marcadas como 'P'/'p'
UPDATE `detallemallas` SET `tipo` = 'U' WHERE `idDetalleMalla` IN (1182, 1185, 1186, 1187, 1188, 1189, 1190);

-- Sincronización de FK idtipo_asignatura acorde al tipo oficial (1=Básica, 2=Profesional, 4=Integración)
UPDATE `detallemallas` dm
JOIN `mallas` m ON m.`idMalla` = dm.`idMalla`
JOIN `carreras` c ON c.`idCarrera` = m.`idCarrera`
SET dm.`idtipo_asignatura` = CASE UPPER(TRIM(dm.`tipo`))
    WHEN 'B' THEN 1
    WHEN 'P' THEN 2
    WHEN 'U' THEN 4
    ELSE dm.`idtipo_asignatura`
END,
dm.`tipo` = UPPER(TRIM(dm.`tipo`))
WHERE c.`esInstituto` = 1 AND m.`activa` = 1 AND UPPER(TRIM(dm.`tipo`)) IN ('B', 'P', 'U');

-- -----------------------------------------------------------------------------
-- 15. SIGLAS OFICIALES DE CARRERAS (aliasCarrera)
-- -----------------------------------------------------------------------------
UPDATE `carreras` SET `aliasCarrera` = 'ED'  WHERE `idCarrera` = 7;  -- ENTRENAMIENTO DEPORTIVO
UPDATE `carreras` SET `aliasCarrera` = 'DS'  WHERE `idCarrera` = 9;  -- DESARROLLO DE SOFTWARE
UPDATE `carreras` SET `aliasCarrera` = 'MA'  WHERE `idCarrera` = 10; -- MECANICA AUTOMOTRIZ
UPDATE `carreras` SET `aliasCarrera` = 'CAT' WHERE `idCarrera` = 12; -- CONTABILIDAD Y ASESORIA TRIBUTARIA
UPDATE `carreras` SET `aliasCarrera` = 'ATH' WHERE `idCarrera` = 13; -- ADMINISTRACION DE TALENTO HUMANO
UPDATE `carreras` SET `aliasCarrera` = 'DG'  WHERE `idCarrera` = 14; -- DISEÑO GRAFICO
UPDATE `carreras` SET `aliasCarrera` = 'EI'  WHERE `idCarrera` = 15; -- EDUCACION INICIAL
UPDATE `carreras` SET `aliasCarrera` = 'MKC' WHERE `idCarrera` = 16; -- MARKETING DIGITAL Y COMERCIO ELECTRONICO
UPDATE `carreras` SET `aliasCarrera` = 'EIC' WHERE `idCarrera` = 17; -- EDUCACION INCLUSIVA
UPDATE `carreras` SET `aliasCarrera` = 'EB'  WHERE `idCarrera` = 18; -- EDUCACION BASICA
UPDATE `carreras` SET `aliasCarrera` = 'GT'  WHERE `idCarrera` = 19; -- GASTRONOMIA
UPDATE `carreras` SET `aliasCarrera` = 'RT'  WHERE `idCarrera` = 20; -- REDES Y TELECOMUNICACIONES
UPDATE `carreras` SET `aliasCarrera` = 'ET'  WHERE `idCarrera` = 21; -- ELECTRÓNICA

COMMIT;
