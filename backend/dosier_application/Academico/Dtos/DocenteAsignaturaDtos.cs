using System;
using System.Collections.Generic;

namespace dosier_application.Academico.Dtos;

public class PeriodoAcademicoDto
{
    public string IdPeriodo { get; set; } = null!;
    public string? Detalle { get; set; }
    public DateOnly? FechaInicial { get; set; }
    public DateOnly? FechaFinal { get; set; }
    public bool EsActivo { get; set; }
}

public class DocenteAsignaturaDto
{
    public int IdAsignacion { get; set; }
    public int IdAsignatura { get; set; }
    public string? CodigoAsignatura { get; set; }
    public string? NombreAsignatura { get; set; }
    
    public int IdCarrera { get; set; }
    public string? CodigoCarrera { get; set; }
    public string? NombreCarrera { get; set; }
    public string? AliasCarrera { get; set; }

    public string IdPeriodo { get; set; } = null!;
    public string? DetallePeriodo { get; set; }

    public int IdModalidad { get; set; }
    public string? NombreModalidad { get; set; }

    public int IdNivel { get; set; }
    public string? NombreNivel { get; set; }
    public string Paralelo { get; set; } = null!;

    // Distribución horaria y curricular
    public int HorasTotales { get; set; }
    public decimal HorasDocencia { get; set; }
    public decimal HorasPracticoExperimental { get; set; }
    public decimal HorasAutonomo { get; set; }
    public int Creditos { get; set; }
    public string? UnidadOrganizacionCurricular { get; set; }

    // Prerrequisitos de la asignatura
    public List<string> Prerrequisitos { get; set; } = new();

    // Estados de documentación docente de la tesis
    public string EstadoPea { get; set; } = "NoIniciado";
    public string EstadoSilabo { get; set; } = "NoIniciado";
    public int TotalGuiasApe { get; set; } = 0;
    public string EstadoGuiaEstudio { get; set; } = "NoIniciado";
}

public class CurriculoAsignaturaDetalleDto
{
    public int IdAsignatura { get; set; }
    public string? CodigoAsignatura { get; set; }
    public string? NombreAsignatura { get; set; }

    public int IdCarrera { get; set; }
    public string? NombreCarrera { get; set; }
    public string? CodigoCases { get; set; }

    public int IdNivel { get; set; }
    public string? Nivel { get; set; }

    public int HorasTotales { get; set; }
    public decimal HorasDocencia { get; set; }
    public decimal HorasPracticoExperimental { get; set; }
    public decimal HorasAutonomo { get; set; }
    public int Creditos { get; set; }
    public string? UnidadOrganizacionCurricular { get; set; }
    public string? DescripcionMalla { get; set; }

    public List<PrerrequisitoItemDto> Prerrequisitos { get; set; } = new();
}

public class PrerrequisitoItemDto
{
    public int IdAsignatura { get; set; }
    public string? Codigo { get; set; }
    public string? Asignatura { get; set; }
}
