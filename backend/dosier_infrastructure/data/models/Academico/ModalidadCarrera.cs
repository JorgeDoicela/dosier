namespace dosier_infrastructure.data.models;

/// <summary>
/// Modalidad habilitada por SIGAFI para una carrera institucional.
/// </summary>
public class ModalidadCarrera
{
    public int IdModalidadCarrera { get; set; }
    public int IdCarrera { get; set; }
    public int IdModalidad { get; set; }
    public sbyte? EsActivo { get; set; }
}
