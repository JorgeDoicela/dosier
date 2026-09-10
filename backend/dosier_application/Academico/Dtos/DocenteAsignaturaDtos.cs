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

    public int IdMalla { get; set; }
    public int IdDetalleMalla { get; set; }
    public string FuenteMalla { get; set; } = null!;

    // Distribución horaria y curricular
    public int HorasTotales { get; set; }
    public decimal HorasDocencia { get; set; }
    public decimal HorasPracticoExperimental { get; set; }
    public decimal HorasAutonomo { get; set; }
    public int Creditos { get; set; }
    public string? UnidadOrganizacionCurricular { get; set; }

    // Prerrequisitos de la asignatura
    public List<string> Prerrequisitos { get; set; } = new();

    // Estado del PEA oficial de la asignatura
    public string EstadoPea { get; set; } = "NoIniciado";
    public List<string> AdvertenciasContexto { get; set; } = new();
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

/// <summary>
/// Contexto academico oficial para el PEA.
/// Los valores curriculares proceden de SIGAFI y no deben editarse desde DOSIER.
/// </summary>
public class AcademicContextDto
{
    public int IdAsignacion { get; set; }
    public string IdProfesor { get; set; } = null!;
    public string IdPeriodo { get; set; } = null!;
    public int IdCarrera { get; set; }
    public string? NombreCarrera { get; set; }
    public string? CodigoCarrera { get; set; }
    public int IdMalla { get; set; }
    public string? DescripcionMalla { get; set; }
    public int IdDetalleMalla { get; set; }
    public int IdAsignatura { get; set; }
    public string? CodigoAsignatura { get; set; }
    public string? NombreAsignatura { get; set; }
    public int IdNivel { get; set; }
    public string? NombreNivel { get; set; }
    public int IdModalidad { get; set; }
    public string? NombreModalidad { get; set; }
    public int IdSeccion { get; set; }
    public string? NombreSeccion { get; set; }
    public string Paralelo { get; set; } = null!;
    public int HorasTotales { get; set; }
    public decimal HorasDocencia { get; set; }
    public decimal HorasPracticoExperimental { get; set; }
    public decimal HorasAutonomo { get; set; }
    public int Creditos { get; set; }
    public string? UnidadOrganizacionCurricular { get; set; }
    public bool ModalidadAutorizada { get; set; }
    public string FuenteMalla { get; set; } = null!;
    public List<PrerrequisitoItemDto> Prerrequisitos { get; set; } = new();
    public List<string> Advertencias { get; set; } = new();
}
