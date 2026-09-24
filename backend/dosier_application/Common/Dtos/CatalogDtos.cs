using System;

namespace dosier_application.Common.Dtos
{
    public class ConfigGeneralDto
    {
        public string Clave { get; set; } = string.Empty;
        public string? Valor { get; set; }
        public string? Descripcion { get; set; }
    }

    public class CarreraCatalogoDto
    {
        public int IdCarrera { get; set; }
        public string Carrera1 { get; set; } = string.Empty;
        public string? AliasCarrera { get; set; }
        public string? CodigoCases { get; set; }
        public int? EsInstituto { get; set; }
        public bool? Activa { get; set; }
    }

    public class PeriodoCatalogoDto
    {
        public string IdPeriodo { get; set; } = string.Empty;
        public string? Detalle { get; set; }
        public DateOnly? FechaInicial { get; set; }
        public DateOnly? FechaFinal { get; set; }
        public bool? Activo { get; set; }
        public bool? Cerrado { get; set; }
        public int? EsInstituto { get; set; }
        public int? Periodoactivoinstituto { get; set; }
    }

    public class PeriodoMutationDto
    {
        public string IdPeriodo { get; set; } = string.Empty;
        public string Detalle { get; set; } = string.Empty;
        public DateOnly? FechaInicial { get; set; }
        public DateOnly? FechaFinal { get; set; }
        public bool? Activo { get; set; }
        public bool? Cerrado { get; set; }
    }

    public class WorkflowEstadoConfigDto
    {
        public string Estado { get; set; } = string.Empty;
        public string Etiqueta { get; set; } = string.Empty;
        public string Color { get; set; } = "#94A3B8";
        public bool EsFinal { get; set; }
    }
}
