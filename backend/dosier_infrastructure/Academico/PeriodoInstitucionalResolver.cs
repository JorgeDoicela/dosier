using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_application.Academico;
using dosier_application.Academico.Dtos;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Academico;

/// <summary>
/// Implementación de la Fuente Única de Verdad (SSOT) para la resolución de períodos académicos del ISTPET.
/// Centraliza la frontera de lectura sobre `sigafi_es.periodos` garantizando el aislamiento de la
/// Escuela de Conducción y la invariante matemática de un solo período activo a la vez.
/// </summary>
public class PeriodoInstitucionalResolver : IPeriodoInstitucionalResolver
{
    private readonly DosierContext _context;
    private readonly ILogger<PeriodoInstitucionalResolver> _logger;

    public PeriodoInstitucionalResolver(DosierContext context, ILogger<PeriodoInstitucionalResolver> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PeriodoAcademicoDto?> GetPeriodoActivoAsync(CancellationToken cancellationToken = default)
    {
        var periodos = await GetPeriodosInstitucionalesAsync(limite: null, cancellationToken);
        return periodos.FirstOrDefault(p => p.EsActivo) ?? periodos.FirstOrDefault();
    }

    public async Task<string> GetIdPeriodoActivoAsync(CancellationToken cancellationToken = default)
    {
        var activo = await GetPeriodoActivoAsync(cancellationToken);
        return activo?.IdPeriodo ?? "OCT2026";
    }

    public async Task<List<PeriodoAcademicoDto>> GetPeriodosInstitucionalesAsync(int? limite = null, CancellationToken cancellationToken = default)
    {
        // 1. Obtener identificadores de periodos que cuentan con asignaciones reales en carreras del instituto (esInstituto = 1)
        var periodosInstitutoQuery = await (
            from a in _context.AsignacionesProfesores.AsNoTracking()
            join cu in _context.Cursos.AsNoTracking() on a.IdNivel equals cu.IdNivel
            join c in _context.Carreras.AsNoTracking() on cu.IdCarrera equals c.IdCarrera
            where c.EsInstituto == 1
            select a.IdPeriodo
        ).Distinct().ToListAsync(cancellationToken);

        // 2. Filtrar únicamente los períodos oficiales del instituto (excluyendo Conducción y legados no institucionales)
        var query = _context.Periodos
            .AsNoTracking()
            .Where(p =>
                (p.EsConduccion == 0 || p.EsConduccion == null) &&
                (p.Periodoactivoinstituto == 1 ||
                 p.EsInstituto == 1 ||
                 periodosInstitutoQuery.Contains(p.IdPeriodo))
            );

        var periodosRaw = await query.ToListAsync(cancellationToken);

        // 3. Invariante de Período Activo Único:
        // Prioridad 1: periodoactivoinstituto == 1 (marcado explícito institucional de secretaría/rectoría)
        // Prioridad 2: Período más reciente por FechaInicial
        var periodoActivoOficial = periodosRaw.FirstOrDefault(p => p.Periodoactivoinstituto == 1)
            ?? periodosRaw.OrderByDescending(p => p.FechaInicial).FirstOrDefault();

        var idPeriodoActivo = periodoActivoOficial?.IdPeriodo;

        var ordenados = periodosRaw
            .OrderByDescending(p => p.IdPeriodo == idPeriodoActivo)
            .ThenByDescending(p => p.FechaInicial)
            .Select(p => new PeriodoAcademicoDto
            {
                IdPeriodo = p.IdPeriodo,
                Detalle = p.Detalle?.Trim(),
                FechaInicial = p.FechaInicial,
                FechaFinal = p.FechaFinal,
                EsActivo = (p.IdPeriodo == idPeriodoActivo)
            });

        if (limite.HasValue && limite.Value > 0)
        {
            ordenados = ordenados.Take(limite.Value);
        }

        return ordenados.ToList();
    }
}

