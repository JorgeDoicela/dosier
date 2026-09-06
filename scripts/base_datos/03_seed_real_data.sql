USE sigafi_es;
 
SET FOREIGN_KEY_CHECKS = 0;
 
-- 1. Limpieza de tablas de proyectos e instancias documentales
TRUNCATE TABLE doc_proyectos_carreras;
TRUNCATE TABLE doc_proyecto_participantes;
TRUNCATE TABLE doc_objetivos_proyecto;
TRUNCATE TABLE doc_cronograma;
TRUNCATE TABLE doc_trazabilidad_proyectos;
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
 
-- 4. Poblar Metadatos y Consentimiento de Firma de Usuarios
INSERT INTO doc_usuarios_metadata (uuid, idUsuario, aceptoTerminosFirma, fechaConsentimientoFirma) VALUES
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1718161126' LIMIT 1), 1, '2025-01-10 09:00:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1802707511' LIMIT 1), 1, '2025-01-12 10:30:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '0302144159' LIMIT 1), 1, '2025-01-15 11:00:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1802989226' LIMIT 1), 1, '2025-01-15 11:30:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1719134759' LIMIT 1), 1, '2025-02-18 09:00:00'),
(UUID(), (SELECT idUsuario FROM usuarios WHERE idSigafi = '1720477031' LIMIT 1), 1, '2025-02-20 09:30:00');
 
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
