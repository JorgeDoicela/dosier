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
        public string? ActiveReasoningEffort { get; set; }
        public string? MaskedApiKey { get; set; }
        public bool IsReady { get; set; }
    }

    public class SavePeaAiConfigRequestDto
    {
        public string Provider { get; set; } = "deepseek";
        public string? Model { get; set; }
        public string? BaseUrl { get; set; }
        public string? ApiKey { get; set; }
        public string? ReasoningEffort { get; set; } // "low" | "medium" | "high"
        public string Scope { get; set; } = "user"; // "user" | "global"
    }

    public class PeaAiChatMessageDto
    {
        public string Role { get; set; } = "user"; // "user" | "assistant"
        public string Content { get; set; } = string.Empty;
    }

    public class GeneratePeaDraftRequestDto
    {
        public string TargetSection { get; set; } = "all";
        public List<string> TargetSections { get; set; } = new();
        public string? CustomInstructions { get; set; }
        public string? Provider { get; set; }
        public string? Model { get; set; }
        public string? ReasoningEffort { get; set; } // "low" | "medium" | "high"
        public string? BaseUrlOverride { get; set; }
        public string? ApiKeyOverride { get; set; }
        public decimal? CurrentHorasCD { get; set; }
        public decimal? CurrentHorasAPE { get; set; }
        public decimal? CurrentHorasTA { get; set; }
        public decimal? CurrentTotalHoras { get; set; }
        public List<PeaDraftUnidadDto>? CurrentUnidades { get; set; }
        public string? CurrentObjetivo { get; set; }
        public List<PeaDraftPrerrequisitoDto>? CurrentPrerrequisitos { get; set; }
        public string? CurrentRdaCarrera { get; set; }
        public string? CurrentResultadosAprendizaje { get; set; }
        public string? CurrentMetodologiaEnsenanza { get; set; }
        public string? CurrentRecursosDidacticos { get; set; }
        public List<PeaDraftActividadPracticaDto>? CurrentActividadesPracticas { get; set; }
        public List<PeaDraftEvaluacionDto>? CurrentEvaluaciones { get; set; }
        public List<PeaDraftBibliografiaDto>? CurrentBibliografias { get; set; }
        public string? CurrentBibliografiaBasica { get; set; }
        public string? CurrentBibliografiaConsulta { get; set; }
        public List<PeaAiChatMessageDto> ConversationHistory { get; set; } = new();
    }

    public class ImportPeaDocumentRequestDto
    {
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public byte[] FileBytes { get; set; } = System.Array.Empty<byte>();
        public string? CustomInstructions { get; set; }
        public string? Provider { get; set; }
        public string? Model { get; set; }
        public string? BaseUrlOverride { get; set; }
        public string? ApiKeyOverride { get; set; }
        public decimal? CurrentHorasCD { get; set; }
        public decimal? CurrentHorasAPE { get; set; }
        public decimal? CurrentHorasTA { get; set; }
        public decimal? CurrentTotalHoras { get; set; }
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

        public decimal TotalHorasAsignatura { get; set; }
        public decimal HorasContactoDocente { get; set; }
        public decimal HorasPracticoExperimental { get; set; }
        public decimal HorasAutonomo { get; set; }
        public string? CodigoCarrera { get; set; }

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
        public decimal HorasCD { get; set; }
        public decimal HorasAPE { get; set; }
        public decimal HorasTA { get; set; }
        public decimal HorasTotal => HorasCD + HorasAPE + HorasTA;
    }

    public class PeaDraftActividadPracticaDto
    {
        public int Unidad { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal Horas { get; set; } = 2m;
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
        public decimal SigafiHorasCD { get; set; }
        public decimal SigafiHorasAPE { get; set; }
        public decimal SigafiHorasTA { get; set; }
        public decimal SigafiTotalHoras { get; set; }
        public decimal GeneratedHorasCD { get; set; }
        public decimal GeneratedHorasAPE { get; set; }
        public decimal GeneratedHorasTA { get; set; }
        public decimal GeneratedTotalHoras { get; set; }
        public bool IsHoursExactMatch { get; set; }
        public bool IsBloomVerbValid { get; set; } = true;
        public string? BloomVerbDetected { get; set; }
        public bool ArePracticesCompliant { get; set; } = true;
        public bool IsBibliographyCompliant { get; set; } = true;
        public List<string> ComplianceNotes { get; set; } = new();
        public List<string> GeneratedSections { get; set; } = new();
    }
}

