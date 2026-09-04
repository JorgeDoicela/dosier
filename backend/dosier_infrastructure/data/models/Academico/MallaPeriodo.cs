namespace dosier_infrastructure.data.models;

/// <summary>
/// Relaciona la malla que corresponde a un nivel en un periodo academico.
/// Es una tabla institucional de SIGAFI y debe consultarse solo en modo lectura.
/// </summary>
public class MallaPeriodo
{
    public string IdPeriodo { get; set; } = null!;
    public int IdNivel { get; set; }
    public int IdMalla { get; set; }
}
