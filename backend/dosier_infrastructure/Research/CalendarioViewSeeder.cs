using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Research
{
    public static class CalendarioViewSeeder
    {
        public static async Task EnsureCalendarioViewCreatedAsync(DosierContext context, ILogger logger)
        {
            try
            {
                const string viewSql = @"
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
    'Convocatoria',
    'AperturaConvocatoria',
    fechaApertura,
    NULL,
    1,
    '#3B82F6',
    idConvocatoria,
    uuid,
    'CONVOCATORIA',
    NULL,
    NULL,
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
    'Convocatoria',
    'CierreConvocatoria',
    fechaCierre,
    NULL,
    1,
    '#F97316',
    idConvocatoria,
    uuid,
    'CONVOCATORIA',
    NULL,
    NULL,
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
    'Proyecto',
    'InicioProyecto',
    fechaInicio,
    NULL,
    1,
    '#10B981',
    idProyecto,
    uuid,
    'PROYECTO',
    NULL,
    'DOSIER_ADMIN',
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

-- 6. Fin / Cierre de proyectos
SELECT
    CONCAT('PROY-FIN-', idProyecto),
    uuid,
    CONCAT('Cierre: ', titulo),
    CONCAT('Fecha límite de ejecución del proyecto ', COALESCE(codigoInstitucional, uuid)),
    'Proyecto',
    'FinProyecto',
    fechaFin,
    NULL,
    1,
    '#EF4444',
    idProyecto,
    uuid,
    'PROYECTO',
    NULL,
    'DOSIER_ADMIN',
    IF(estado NOT IN ('Borrador','Anulado','Rechazado') AND activo = 1, 1, 0),
    0                                       AS esPrivado,
    'Alta'                                  AS prioridad,
    'Pendiente'                             AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_proyectos
WHERE fechaFin IS NOT NULL

UNION ALL

-- 7. Informes de Avance (fechaReporte)
SELECT
    CONCAT('INF-', ia.idInforme),
    ia.uuid,
    CONCAT('Informe Avance #', ia.numeroInforme, ': ', COALESCE(p.codigoInstitucional, p.titulo)),
    CONCAT('Fecha de entrega del informe de avance #', ia.numeroInforme, '. Resumen: ', SUBSTRING(ia.resumenActividades, 1, 100)),
    'InformeAvance',
    'EntregaInforme',
    ia.fechaReporte,
    NULL,
    1,
    '#8B5CF6',
    ia.idInforme,
    ia.uuid,
    'INFORME_AVANCE',
    NULL,
    'DOSIER_ADMIN',
    IF(p.estado NOT IN ('Borrador','Anulado','Rechazado') AND p.activo = 1, 1, 0),
    0                                       AS esPrivado,
    'Media'                                 AS prioridad,
    IF(ia.estado = 'Aprobado', 'Completado', 'Pendiente') AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_informes_avance ia
JOIN doc_proyectos p ON p.idProyecto = ia.idProyecto
WHERE ia.fechaReporte IS NOT NULL

UNION ALL

-- 9. Plazos de Subsanación fijados por el Administrador (fechaLimiteSubsanacion)
SELECT
    CONCAT('PROY-SUBS-', p.idProyecto),
    p.uuid,
    CONCAT('Límite Subsanación: ', COALESCE(p.codigoInstitucional, p.titulo)),
    CONCAT('Fecha límite fijada por el Administrador para corregir observaciones del proyecto ', COALESCE(p.codigoInstitucional, p.uuid)),
    'Proyecto',
    'SubsanacionObservaciones',
    p.fechaLimiteSubsanacion,
    NULL,
    1,
    '#F59E0B',
    p.idProyecto,
    p.uuid,
    'PROYECTO',
    NULL,
    'DOSIER_ADMIN',
    IF(p.estado IN ('En Corrección', 'En Revisión') AND p.activo = 1, 1, 0),
    0                                       AS esPrivado,
    'Alta'                                  AS prioridad,
    'Pendiente'                             AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_proyectos p
WHERE p.fechaLimiteSubsanacion IS NOT NULL

UNION ALL

-- 10. Plazos de Informe Final fijados por el Administrador (fechaLimiteInformeFinal / fechaLimiteSubsanacionFinal)
SELECT
    CONCAT('PROY-INF-FIN-', p.idProyecto),
    p.uuid,
    CONCAT('Límite Entrega Informe Final: ', COALESCE(p.codigoInstitucional, p.titulo)),
    CONCAT('Fecha límite fijada por el Administrador para la entrega del informe final del proyecto ', COALESCE(p.codigoInstitucional, p.uuid)),
    'Proyecto',
    'EntregaInformeFinal',
    COALESCE(p.fechaLimiteSubsanacionFinal, p.fechaLimiteInformeFinal),
    NULL,
    1,
    '#DC2626',
    p.idProyecto,
    p.uuid,
    'PROYECTO',
    NULL,
    'DOSIER_ADMIN',
    IF(p.estado IN ('En Ejecución', 'En Corrección') AND p.activo = 1, 1, 0),
    0                                       AS esPrivado,
    'Alta'                                  AS prioridad,
    'Pendiente'                             AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_proyectos p
WHERE (p.fechaLimiteInformeFinal IS NOT NULL OR p.fechaLimiteSubsanacionFinal IS NOT NULL);
";

                await context.Database.ExecuteSqlRawAsync(viewSql);
                logger.LogInformation("DOSIER Calendario: Vista v_doc_calendario_eventos verificada y sincronizada exitosamente.");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "DOSIER Calendario: No se pudo auto-sincronizar la vista v_doc_calendario_eventos en el arranque (se reintentará en el próximo ciclo).");
            }
        }
    }
}
