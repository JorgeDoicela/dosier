USE sigafi_es;
 
SET FOREIGN_KEY_CHECKS = 0;
 
-- 1. Limpieza de tablas de proyectos e instancias documentales
TRUNCATE TABLE doc_proyectos_carreras;
TRUNCATE TABLE doc_proyecto_participantes;
TRUNCATE TABLE doc_objetivos_proyecto;
TRUNCATE TABLE doc_cronograma;
TRUNCATE TABLE doc_trazabilidad_proyectos;
TRUNCATE TABLE doc_proyecto_extensiones;
TRUNCATE TABLE doc_documentos_firmas;
TRUNCATE TABLE doc_documentos_instancias;
TRUNCATE TABLE doc_document_audit;
TRUNCATE TABLE doc_cowork_updates;
TRUNCATE TABLE doc_cowork_sesiones;
TRUNCATE TABLE doc_cowork_documentos;
TRUNCATE TABLE doc_collaboration_comments;
TRUNCATE TABLE doc_documentos_secciones_metadata;
TRUNCATE TABLE doc_notificaciones;
TRUNCATE TABLE doc_tokens_acceso;
TRUNCATE TABLE doc_dispositivos_tokens;
TRUNCATE TABLE doc_magic_links;
TRUNCATE TABLE doc_lopdp_consentimientos;
TRUNCATE TABLE doc_lopdp_auditoria_datos;
TRUNCATE TABLE doc_backup_logs;
TRUNCATE TABLE doc_convocatorias;
TRUNCATE TABLE doc_grupos_miembros;
TRUNCATE TABLE doc_grupos_carreras;
TRUNCATE TABLE doc_grupos_investigacion;
TRUNCATE TABLE doc_usuarios_metadata;
 
-- 1.5. Asegurar usuarios requeridos en tabla central
INSERT INTO usuarios (idSigafi, tablaSigafi, nombre, contrasenia, activo, emailInstitucional)
SELECT
    p.idProfesor,
    'profesor',
    TRIM(CONCAT(
        IFNULL(p.primerNombre, ''), ' ',
        IFNULL(p.segundoNombre, ''), ' ',
        IFNULL(p.primerApellido, ''), ' ',
        IFNULL(p.segundoApellido, '')
    )),
    IFNULL(p.clave, '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    1,
    COALESCE(p.emailInstitucional, p.email)
FROM profesores p
WHERE p.idProfesor IN (
    '1718161126', '1802707511', '0302144159', '1802989226', '1719134759',
    '1724649338', '1719322149', '1720477031'
)
AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.idSigafi = p.idProfesor);
 
INSERT INTO usuarios (idSigafi, tablaSigafi, nombre, contrasenia, activo, emailInstitucional)
SELECT
    a.idAlumno,
    'alumno',
    TRIM(CONCAT(
        IFNULL(a.primerNombre, ''), ' ',
        IFNULL(a.segundoNombre, ''), ' ',
        IFNULL(a.apellidoPaterno, ''), ' ',
        IFNULL(a.apellidoMaterno, '')
    )),
    IFNULL(a.password, '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    1,
    COALESCE(a.email_institucional, a.email)
FROM alumnos a
WHERE a.idAlumno IN (
    '1725555377', '0102598570', '1751325000', '0103057584', '0105057335'
)
AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.idSigafi = a.idAlumno);
 
INSERT INTO usuarios (idSigafi, tablaSigafi, nombre, contrasenia, activo, emailInstitucional)
SELECT v.idSigafi, v.tablaSigafi, v.nombre, '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, v.email
FROM (
    SELECT '1719322149' AS idSigafi, 'profesor' AS tablaSigafi, 'María Fernanda Cevallos' AS nombre, 'mcevallos@traversari.edu.ec' AS email UNION ALL
    SELECT '1720477031', 'profesor', 'Carlos Andrés Mendieta', 'cmendieta@traversari.edu.ec' UNION ALL
    SELECT '1725555377', 'alumno',   'Diego Alejandro Romero',  'dromero@est.traversari.edu.ec' UNION ALL
    SELECT '0102598570', 'alumno',   'Valentina Paz Herrera',   'vherrera@est.traversari.edu.ec' UNION ALL
    SELECT '1751325000', 'alumno',   'Sebastián Morales Vega',  'smorales@est.traversari.edu.ec' UNION ALL
    SELECT '0103057584', 'alumno',   'Camila Torres Salinas',   'ctorres@est.traversari.edu.ec' UNION ALL
    SELECT '0105057335', 'alumno',   'Mateo Javier Intriago',   'mintriago@est.traversari.edu.ec' UNION ALL
    SELECT '1725555376', 'otros',    'Revisor Externo A',       'revisor.externo.a@demo.ec' UNION ALL
    SELECT '1725555355', 'otros',    'Revisor Externo B',       'revisor.externo.b@demo.ec'
) AS v
WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE CONVERT(u.idSigafi USING utf8mb4) = v.idSigafi);
 
-- 4. Poblar Metadatos y Consentimiento de Firma de Usuariosde Usuarios
INSERT INTO doc_usuarios_metadata (uuid, idUsuario, aceptoTerminosFirma, fechaConsentimientoFirma) VALUES
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1718161126' LIMIT 1), 1, '2025-01-10 09:00:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1802707511' LIMIT 1), 1, '2025-01-12 10:30:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '0302144159' LIMIT 1), 1, '2025-01-15 11:00:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1802989226' LIMIT 1), 1, '2025-01-15 11:30:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1719134759' LIMIT 1), 1, '2025-02-18 09:00:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1720477031' LIMIT 1), 1, '2025-02-20 09:30:00');
 
-- 5. Poblar Grupos de Investigación
INSERT INTO doc_grupos_investigacion (idGrupo, uuid, nombre, siglas, tipoGrupo, idCoordinador, objetivoGeneral, mision, vision, resolucionAprobacion, fechaCreacion, categoriaConsolidacion, estado, activo) VALUES
(1, 'a241b625-56b8-4160-a4ba-1f67865dded0', 'Grupo de Investigación en Ingeniería de Software y TI', 'GIIST', 'Investigación', (SELECT idUsuario FROM usuarios WHERE idSigafi = '1718161126' LIMIT 1),
 'Fomentar el desarrollo tecnológico y la innovación en software en la región',
 'Desarrollar soluciones de software con alto estándar de calidad',
 'Ser referentes nacionales en desarrollo de software aplicado',
 'RES-GIIST-2025-01', '2025-01-10', 'Consolidado', 'Aprobado', 1),
(2, 'b11b1111-2222-3333-4444-555555555555', 'Grupo de Energías Renovables y Sostenibilidad Ambiental', 'GERSA', 'Investigación', (SELECT idUsuario FROM usuarios WHERE idSigafi = '1802707511' LIMIT 1),
 'Desarrollar prototipos y soluciones tecnológicas en el ámbito energético',
 'Investigar y aplicar fuentes de energía limpia en beneficio social',
 'Liderar la transición energética desde la academia',
 'RES-GERSA-2025-02', '2025-01-12', 'Consolidado', 'Aprobado', 1),
(3, 'c11c1111-2222-3333-4444-555555555555', 'Semillero de Investigación en Innovación y Gestión Empresarial', 'SIGE', 'Semillero', (SELECT idUsuario FROM usuarios WHERE idSigafi = '0302144159' LIMIT 1),
 'Capacitar a estudiantes en metodologías de investigación en el ámbito de negocios',
 'Formar semilleristas con visión crítica y emprendedora',
 'Ser el principal semillero de ideas de negocio tecnológicas del IST',
 'RES-SIGE-2025-03', '2025-02-15', 'En Formación', 'Aprobado', 1),
(4, 'd11d1111-2222-3333-4444-555555555555', 'Grupo de Investigación en Redes y Ciberseguridad Aplicada', 'GIRCA', 'Investigación', (SELECT idUsuario FROM usuarios WHERE idSigafi = '1724649338' LIMIT 1),
 'Investigar e implementar soluciones de ciberseguridad para infraestructuras críticas',
 'Contribuir a la seguridad digital y la protección de datos en el entorno corporativo y académico',
 'Consolidarse como un referente nacional en auditoría de ciberseguridad',
 'RES-GIRCA-2025-04', '2025-03-01', 'En Formación', 'Aprobado', 1),
(5, 'e11e1111-2222-3333-4444-555555555555', 'Grupo de Innovación en Gastronomía y Patrimonio Alimentario', 'GIGPA', 'Investigación', (SELECT idUsuario FROM usuarios WHERE idSigafi = '1719322149' LIMIT 1),
 'Investigar y registrar el patrimonio gastronómico tradicional de Pichincha y Ecuador',
 'Rescatar técnicas ancestrales de cocina aplicando metodologías científicas de conservación',
 'Ser la despensa de conocimiento y desarrollo de innovación culinaria del país',
 'RES-GIGPA-2025-05', '2025-03-10', 'En Formación', 'Aprobado', 1);
 
-- Relaciones de Grupos con Carreras
INSERT INTO doc_grupos_carreras (idGrupo, idCarrera) VALUES
(1, (SELECT idCarrera FROM carreras WHERE aliasCarrera = 'SOF' LIMIT 1)),
(1, (SELECT idCarrera FROM carreras WHERE aliasCarrera = 'RDT' LIMIT 1)),
(2, (SELECT idCarrera FROM carreras WHERE aliasCarrera = 'ELT' LIMIT 1)),
(3, (SELECT idCarrera FROM carreras WHERE aliasCarrera = 'EMP' LIMIT 1)),
(3, (SELECT idCarrera FROM carreras WHERE aliasCarrera = 'ATH' LIMIT 1)),
(4, (SELECT idCarrera FROM carreras WHERE aliasCarrera = 'RDT' LIMIT 1)),
(5, (SELECT idCarrera FROM carreras WHERE aliasCarrera = 'GAS' LIMIT 1));
 
-- Miembros de Grupos
INSERT INTO doc_grupos_miembros (idGrupo, idUsuario, rol, activo, fechaInicio) VALUES
(1, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1718161126' LIMIT 1), 'Director de Proyecto', 1, '2025-01-10'),
(1, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1724649338' LIMIT 1), 'Co-Investigador', 1, '2025-01-15'),
(1, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1725555377' LIMIT 1), 'Semillerista', 1, '2025-01-20'),
(2, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1802707511' LIMIT 1), 'Director de Proyecto', 1, '2025-01-12'),
(2, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1802989226' LIMIT 1), 'Co-Investigador', 1, '2025-01-15'),
(2, (SELECT idUsuario FROM usuarios WHERE idSigafi = '0102598570' LIMIT 1), 'Semillerista', 1, '2025-01-22'),
(3, (SELECT idUsuario FROM usuarios WHERE idSigafi = '0302144159' LIMIT 1), 'Director de Proyecto', 1, '2025-02-15'),
(3, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1719134759' LIMIT 1), 'Co-Investigador', 1, '2025-02-18'),
(3, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1751325000' LIMIT 1), 'Semillerista', 1, '2025-02-20'),
(4, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1724649338' LIMIT 1), 'Director de Proyecto', 1, '2025-03-01'),
(4, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1718161126' LIMIT 1), 'Co-Investigador', 1, '2025-03-05'),
(4, (SELECT idUsuario FROM usuarios WHERE idSigafi = '0103057584' LIMIT 1), 'Semillerista', 1, '2025-03-10'),
(5, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1719322149' LIMIT 1), 'Director de Proyecto', 1, '2025-03-10'),
(5, (SELECT idUsuario FROM usuarios WHERE idSigafi = '1720477031' LIMIT 1), 'Co-Investigador', 1, '2025-03-12'),
(5, (SELECT idUsuario FROM usuarios WHERE idSigafi = '0105057335' LIMIT 1), 'Semillerista', 1, '2025-03-15');
 
-- 6. Poblar Convocatorias
INSERT INTO doc_convocatorias (idConvocatoria, uuid, codigoConvocatoria, titulo, idPeriodo, fechaApertura, fechaCierre, anio, descripcion, urlBases, requisitosMinimos, idTipoConvocatoria, estado) VALUES
(1, '84f8846c-c918-406b-a25e-336ff326e632', 'CONV-2025-I', 'Convocatoria Proyectos de Investigación y Desarrollo 2025-I', 'ABD2025', '2025-04-15', '2025-06-15', '2025', 'Convocatoria abierta para el desarrollo de proyectos aplicados de I+D en el IST Traversari', 'https://bases.traversari.edu.ec/2025-I', 'Poseer título de tercer nivel y pertenecer a un grupo de investigación', 1, 'Cerrada'),
(2, '9fb183ea-e522-4828-98e3-841853ad76aa', 'CONV-2026-I', 'Convocatoria Proyectos de Innovación Tecnológica 2026-I', 'ABR2026', '2026-04-10', '2026-06-10', '2026', 'Enfoque en desarrollo de software, prototipos de hardware y transferencia tecnológica', 'https://bases.traversari.edu.ec/2026-I', 'Tener grupo de investigación registrado o semillero activo', 2, 'Abierta');
 
-- 23. Poblar Consentimientos de LOPDP
INSERT INTO doc_lopdp_consentimientos (uuid, idUsuario, versionPolitica, canal, fechaConsentimiento, ipDireccion, userAgent, firmaHash, estado) VALUES
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1718161126' LIMIT 1), 'v1.2', 'Web', '2025-01-10 09:00:00', '192.168.1.50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'hash_consentimiento_sha256_naranjo', 'Otorgado'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1802707511' LIMIT 1), 'v1.2', 'Web', '2025-01-12 10:30:00', '192.168.1.55', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'hash_consentimiento_sha256_bano', 'Otorgado'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '0302144159' LIMIT 1), 'v1.2', 'Web', '2025-01-15 11:00:00', '192.168.1.60', 'Mozilla/5.0 (Linux; Android 13)', 'hash_consentimiento_sha256_sanchez', 'Otorgado');
 
-- 24. Poblar Auditoria LOPDP
INSERT INTO doc_lopdp_auditoria_datos (uuid, idUsuarioActor, idUsuarioAfectado, tablaAfectada, columnaAfectada, operacion, motivo, ipDireccion, userAgent, fechaAcceso) VALUES
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '0302144159' LIMIT 1), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1718161126' LIMIT 1), 'doc_usuarios_metadata', 'rutaFirmaP12', 'LECTURA', 'Validación del certificado digital para firma del acta de inicio.', '192.168.1.60', 'Mozilla/5.0', '2025-07-01 09:20:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '0302144159' LIMIT 1), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1802707511' LIMIT 1), 'doc_usuarios_metadata', 'rutaFirmaP12', 'LECTURA', 'Verificación de firma electrónica en informe de avance de proyecto.', '192.168.1.60', 'Mozilla/5.0', '2026-01-05 16:10:00');
 
-- 25. Poblar Respaldo de Base de Datos
INSERT INTO doc_backup_logs (uuid, fechaBackup, tipo, destino, nombreArchivo, tamanioBytes, estado, hashVerificacion, errorMensaje, ejecutadoPor) VALUES
(UUID(), '2026-06-01 02:00:00', 'BaseDatos', 'Local', 'sigafi_es_backup_20260601.sql', 15480000, 'Exitoso', 'sha256_hash_backup_20260601_xyz', NULL, NULL),
(UUID(), '2026-06-02 02:00:00', 'BaseDatos', 'Local', 'sigafi_es_backup_20260602.sql', 15495000, 'Exitoso', 'sha256_hash_backup_20260602_abc', NULL, NULL);
 
-- 27. Configuración de Workflow Institucional
INSERT INTO doc_config_workflow 
    (estadoOrigen, estadoDestino, rolRequerido, requiereObservacion, contabilizaCargaHoraria, esEstadoFinal, etiquetaUi, colorHex, activo)
VALUES 
    ('En Ejecución', 'En Acreditación CACES', 'DOSIER_ADMIN', 1, 1, 0, 'Evaluación Acreditación CACES', '#D97706', 1);

-- Re-activar verificación de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;
