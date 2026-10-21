using System.Collections.Generic;

namespace dosier_application.Security.DTOs;

public class GobernanzaCurricularDto
{
    public string PeriodoActivo { get; set; } = string.Empty;
    public AutoridadInstitucionalDto? Vicerrector { get; set; }
    public AutoridadInstitucionalDto? CoordinadorAcademico { get; set; }
    public List<CarreraGobernanzaDto> Carreras { get; set; } = new();
}

public class AutoridadInstitucionalDto
{
    public int IdAutoridad { get; set; }
    public string IdSigafi { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string CargoCurricular { get; set; } = string.Empty; // VICERRECTOR, COORD_ACADEMICO, COORD_CARRERA
    public string? Email { get; set; }
    public int? IdCarrera { get; set; }
    public string? CarreraNombre { get; set; }
    public bool EsActivo { get; set; }
}

public class CarreraGobernanzaDto
{
    public int IdCarrera { get; set; }
    public string Carrera { get; set; } = string.Empty;
    public string? AliasCarrera { get; set; }
    public string? Resolucion { get; set; }
    public AutoridadInstitucionalDto? Coordinador { get; set; }
    public int TotalDocentes { get; set; }
    public int TotalMaterias { get; set; }
    public List<DocenteCarreraResumenDto> Docentes { get; set; } = new();
}

public class DocenteCarreraResumenDto
{
    public string IdProfesor { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Email { get; set; }
    public decimal HorasDocente { get; set; }
    public int MateriasAsignadas { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool EsCoordinador { get; set; }
}
