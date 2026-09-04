using dosier_application.Academico.Dtos;

namespace dosier_application.Academico;

public interface IAcademicContextResolver
{
    Task<AcademicContextDto?> ResolveByAssignmentAsync(
        int idAsignacion,
        string? expectedProfessorId = null,
        CancellationToken cancellationToken = default);
}
