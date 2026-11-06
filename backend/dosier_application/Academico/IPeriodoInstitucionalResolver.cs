using dosier_application.Academico.Dtos;

namespace dosier_application.Academico;

/// <summary>
/// Fuente Única de Verdad (SSOT) para la resolución de períodos académicos institucionales del ISTPET.
/// Centraliza la frontera de datos entre SIGAFI y DOSIER:
/// 1. Aislamiento absoluto de la Escuela de Conducción (esConduccion == 0 o null).
/// 2. Filtro estricto de carreras del instituto (carreras con esInstituto = 1).
/// 3. Invariante de Período Activo Único: exactamente UN período puede tener EsActivo = true (prioridad: periodoactivoinstituto == 1).
/// 4. Ordenamiento canónico institucional: período activo oficial primero, seguido de orden cronológico descendente.
/// </summary>
public interface IPeriodoInstitucionalResolver
{
    /// <summary>
    /// Resuelve el único período académico activo oficial del instituto ISTPET.
    /// </summary>
    Task<PeriodoAcademicoDto?> GetPeriodoActivoAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Resuelve el identificador de texto del período académico activo oficial (ej. "OCT2026").
    /// </summary>
    Task<string> GetIdPeriodoActivoAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene la lista oficial de períodos académicos del instituto ISTPET,
    /// asegurando que exactamente un período tenga EsActivo = true.
    /// </summary>
    Task<List<PeriodoAcademicoDto>> GetPeriodosInstitucionalesAsync(int? limite = null, CancellationToken cancellationToken = default);
}

