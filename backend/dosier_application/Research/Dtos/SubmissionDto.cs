namespace dosier_application.Research.Dtos;

public class SubmissionDto
{
    public string Titulo { get; set; } = string.Empty;
    public string Resumen { get; set; } = string.Empty;
    public string LineaInvestigacion { get; set; } = string.Empty;
    public byte[]? ProtocoloFile { get; set; }
}
