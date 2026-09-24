using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Calendario
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

-- 2. Plazos de revisión y legalización del PEA
SELECT
    CONCAT('PEA-', id_pea)                  AS idEventoCalendario,
    uuid,
    CONCAT('PEA: ', COALESCE(codigo_asignatura, uuid)) AS titulo,
    CONCAT('Instrumento Curricular PEA - Asignatura: ', COALESCE(codigo_asignatura, '')) AS descripcion,
    'Curricular'                            AS categoriaGlobal,
    'PEA'                                   AS subcategoria,
    DATE(fecha_actualizacion)               AS fechaInicio,
    NULL                                    AS fechaFin,
    1                                       AS esTodoElDia,
    '#3B82F6'                               AS colorHex,
    id_pea                                  AS idEntidadOrigen,
    uuid                                    AS uuidEntidadOrigen,
    'PEA_OFICIAL'                           AS tipoEntidadOrigen,
    CONCAT('/curriculum/workspace/PEA_OFICIAL/', uuid) AS urlAccion,
    'DOSIER_DOCENTE,DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR' AS rolesVisibles,
    activo,
    0                                       AS esPrivado,
    'Alta'                                  AS prioridad,
    estado_workflow                         AS estado,
    NULL                                    AS creadoPor,
    NULL                                    AS alertaDias,
    0                                       AS recurrenciaAnual
FROM doc_pea
WHERE activo = 1;
";

                await context.Database.ExecuteSqlRawAsync(viewSql);
                logger.LogInformation("DOSIER Calendario: Vista v_doc_calendario_eventos verificada y sincronizada exitosamente con soporte curricular.");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "DOSIER Calendario: No se pudo auto-sincronizar la vista v_doc_calendario_eventos en el arranque (se reintentará en el próximo ciclo).");
            }
        }
    }
}
