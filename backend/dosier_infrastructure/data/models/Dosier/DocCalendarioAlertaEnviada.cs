namespace dosier_infrastructure.data.models;

public partial class DocCalendarioAlertaEnviada
{
    public int IdAlerta { get; set; }
    public string IdEventoCalendario { get; set; } = null!;
    public int IdUsuario { get; set; }
    public DateOnly FechaEvento { get; set; }
    public DateTime FechaEnvio { get; set; }
}
