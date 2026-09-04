using System;
using System.Collections.Generic;

namespace dosier_application.Curriculum.Dtos
{
    public class CarreraDocenteDto
    {
        public int IdCarrera { get; set; }
        public string NombreCarrera { get; set; } = string.Empty;
        public string? AliasCarrera { get; set; }
        public string? CodigoCarrera { get; set; }
        public int TotalAsignaturas { get; set; }
    }

    public class DocenteAsignaturaMallaDto
    {
        public int IdAsignatura { get; set; }
        public string? CodigoAsignatura { get; set; }
        public string NombreAsignatura { get; set; } = string.Empty;
        public int IdCarrera { get; set; }
        public string NombreCarrera { get; set; } = string.Empty;
        public string? Semestre { get; set; }
        public int TotalHoras { get; set; }
        public decimal Creditos { get; set; }
        public int HorasDocencia { get; set; }
        public int HorasPracticas { get; set; }
        public int HorasAutonomas { get; set; }
        public List<string> Prerrequisitos { get; set; } = new List<string>();

        // Estado de los 4 documentos oficiales
        public int? IdPeaExistente { get; set; }
        public string? PeaEstado { get; set; }

        public int? IdSilaboExistente { get; set; }
        public string? SilaboEstado { get; set; }

        public int TotalGuiasApe { get; set; }
        public int? IdGuiaEstudioExistente { get; set; }
        public string? GuiaEstudioEstado { get; set; }
    }

    public class PeriodoAcademicoDto
    {
        public string IdPeriodo { get; set; } = string.Empty;
        public string? Detalle { get; set; }
        public bool Activo { get; set; }
        public string? FechaInicial { get; set; }
        public string? FechaFinal { get; set; }
    }
}
