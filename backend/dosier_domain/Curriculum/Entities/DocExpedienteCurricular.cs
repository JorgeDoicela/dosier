using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Expediente Curricular Maestro: Agrupador oficial institucional que consolida Modelo, Proyecto CES, Perfil de Egreso y la Oferta Académica de SIGAFI
    /// </summary>
    public class DocExpedienteCurricular
    {
        public int IdExpediente { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public string? CodigoExpediente { get; set; }
        public int? IdAsignacion { get; set; }
        public string IdPeriodo { get; set; } = string.Empty;
        public int IdCarrera { get; set; }
        public int? IdMalla { get; set; }
        public int? IdDetalleMalla { get; set; }
        public int IdAsignatura { get; set; }
        public int? IdNivel { get; set; }
        public int? IdModalidad { get; set; }
        public int? IdSeccion { get; set; }
        public string? Paralelo { get; set; }
        public string? IdDocenteResponsable { get; set; }
        public int? IdProyectoCurricular { get; set; }
        public int? IdPerfilEgreso { get; set; }
        public int? IdModeloEducativo { get; set; }
        public string EstadoGeneral { get; set; } = "Abierto"; // 'Abierto', 'EnRevision', 'Aprobado', 'Cerrado'
        public string? SnapshotCurricularJson { get; set; }
        public DateTime FechaApertura { get; set; } = DateTime.UtcNow;
        public DateTime? FechaCierre { get; set; }
        public bool Activo { get; set; } = true;

        // Navegación
        public virtual DocProyectoCurricular? ProyectoCurricular { get; set; }
        public virtual DocPerfilEgreso? PerfilEgreso { get; set; }
        public virtual DocModeloEducativo? ModeloEducativo { get; set; }
        public virtual ICollection<DocPea> Peas { get; set; } = new List<DocPea>();
    }
}
