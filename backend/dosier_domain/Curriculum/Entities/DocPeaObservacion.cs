using System;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Observaciones formales emitidas durante la revisión colegiada del PEA
    /// </summary>
    public class DocPeaObservacion
    {
        public int IdObservacion { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public int? IdUsuarioObservador { get; set; }
        public string RolObservador { get; set; } = "CoordinadorCarrera";
        public string SeccionAfectada { get; set; } = string.Empty;
        public string TextoObservacion { get; set; } = string.Empty;
        public string Estado { get; set; } = "Pendiente"; // 'Pendiente', 'Subsanada', 'Desestimada'
        public string? RespuestaDocente { get; set; }
        public DateTime FechaObservacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaResolucion { get; set; }

        // Navegación
        public virtual DocPea? Pea { get; set; }
    }
}
