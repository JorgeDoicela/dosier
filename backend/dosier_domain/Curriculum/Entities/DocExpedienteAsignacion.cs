using System;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Relación N:M entre el Expediente Curricular Maestro y las asignaciones docentes / paralelos de SIGAFI (Materia Compartida)
    /// </summary>
    public class DocExpedienteAsignacion
    {
        public int IdExpediente { get; set; }
        public int IdAsignacion { get; set; }
        public bool EsDocenteLider { get; set; } = false;
        public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;

        // Navegación
        public virtual DocExpedienteCurricular Expediente { get; set; } = null!;
    }
}
