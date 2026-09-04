namespace dosier_infrastructure.data.models;

/// <summary>
/// Jornada o seccion academica definida en SIGAFI.
/// </summary>
public class Seccion
{
    public int IdSeccion { get; set; }
    public string? Nombre { get; set; }
    public string? Sufijo { get; set; }
}
