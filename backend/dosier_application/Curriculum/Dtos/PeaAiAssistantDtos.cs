using System.Collections.Generic;

namespace dosier_application.Curriculum.Dtos
{
    public class PeaAiConfigStatusDto
    {
        public bool HasUserApiKey { get; set; }
        public bool HasGlobalApiKey { get; set; }
        public string ActiveProvider { get; set; } = "deepseek";
        public string ActiveModel { get; set; } = "deepseek-chat";
        public string? ActiveBaseUrl { get; set; }
        public string? MaskedApiKey { get; set; }
        public bool IsReady { get; set; }
    }

    public class SavePeaAiConfigRequestDto
    {
        public string Provider { get; set; } = "deepseek";
        public string? Model { get; set; }
        public string? BaseUrl { get; set; }
        public string? ApiKey { get; set; }
        public string Scope { get; set; } = "user"; // "user" | "global"
    }

    public class GeneratePeaDraftRequestDto
    {
        public string TargetSection { get; set; } = "all";
        public string? CustomInstructions { get; set; }
        public string? Provider { get; set; }
        public string? Model { get; set; }
        public string? BaseUrlOverride { get; set; }
        public string? ApiKeyOverride { get; set; }
        public List<PeaDraftUnidadDto>? CurrentUnidades { get; set; }
    }

    public class PeaStructuredDraftDto
    {
        public string ObjetivoAsignatura { get; set; } = string.Empty;
        public string RdaCarrera { get; set; } = string.Empty;
        public string ResultadosAprendizaje { get; set; } = string.Empty;
        public string MetodologiaEnsenanza { get; set; } = string.Empty;
        public string RecursosDidacticos { get; set; } = string.Empty;
        public string BibliografiaBasica { get; set; } = string.Empty;
        public string BibliografiaConsulta { get; set; } = string.Empty;

        public List<PeaDraftPrerrequisitoDto> Prerrequisitos { get; set; } = new();
        public List<PeaDraftUnidadDto> Unidades { get; set; } = new();
        public List<PeaDraftActividadPracticaDto> ActividadesPracticas { get; set; } = new();
        public List<PeaDraftEvaluacionDto> Evaluaciones { get; set; } = new();
        public List<PeaDraftBibliografiaDto> Bibliografias { get; set; } = new();

        public PeaDraftValidationSummaryDto ValidationSummary { get; set; } = new();
    }

    public class PeaDraftPrerrequisitoDto
    {
        public string Asignatura { get; set; } = string.Empty;
        public string Observacion { get; set; } = string.Empty;
    }

    public class PeaDraftUnidadDto
    {
        public int Num { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Contenidos { get; set; } = string.Empty;
        public int HorasCD { get; set; }
        public int HorasAPE { get; set; }
        public int HorasTA { get; set; }
        public int HorasTotal => HorasCD + HorasAPE + HorasTA;
    }

    public class PeaDraftActividadPracticaDto
    {
        public int Unidad { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int Horas { get; set; } = 2;
        public string Escenario { get; set; } = string.Empty;
        public string Producto { get; set; } = string.Empty;
        public string Caracterizacion { get; set; } = string.Empty;
    }

    public class PeaDraftEvaluacionDto
    {
        public string Nota { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public decimal Calificacion { get; set; } = 10m;
    }

    public class PeaDraftBibliografiaDto
    {
        public string TipoBibliografia { get; set; } = "Basica"; // "Basica" | "Consulta"
        public string Autor { get; set; } = string.Empty;
        public string TituloLibro { get; set; } = string.Empty;
        public string EditorialCiudad { get; set; } = string.Empty;
        public string CitaCompletaApa { get; set; } = string.Empty;
    }

    public class PeaDraftValidationSummaryDto
    {
        public string ProviderUsed { get; set; } = string.Empty;
        public string ModelUsed { get; set; } = string.Empty;
        public string TargetSection { get; set; } = "all";
        public int SigafiHorasCD { get; set; }
        public int SigafiHorasAPE { get; set; }
        public int SigafiHorasTA { get; set; }
        public int SigafiTotalHoras { get; set; }
        public int GeneratedHorasCD { get; set; }
        public int GeneratedHorasAPE { get; set; }
        public int GeneratedHorasTA { get; set; }
        public int GeneratedTotalHoras { get; set; }
        public bool IsHoursExactMatch { get; set; }
        public List<string> GeneratedSections { get; set; } = new();
    }
}

