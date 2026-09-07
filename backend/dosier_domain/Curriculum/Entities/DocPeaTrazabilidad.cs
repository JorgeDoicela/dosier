using System;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Historial inmutable de trazabilidad y auditoría cronológica del ciclo de vida del PEA con firma criptográfica
    /// </summary>
    public class DocPeaTrazabilidad
    {
        public int IdTrazabilidad { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public int? IdUsuario { get; set; }
        public string EstadoAnterior { get; set; } = string.Empty;
        public string EstadoNuevo { get; set; } = string.Empty;
        public string? Motivo { get; set; }
        public string? HashIntegridadSha256 { get; set; }
        public DateTime FechaTransicion { get; set; } = DateTime.UtcNow;

        // Navegación
        public virtual DocPea? Pea { get; set; }
    }
}
