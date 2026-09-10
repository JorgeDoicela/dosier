using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    public class DocPea
    {
        public int IdPea { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int? IdExpediente { get; set; }
        public int IdCarrera { get; set; }
        public int IdAsignatura { get; set; }
        public string IdPeriodo { get; set; } = string.Empty;
        public int? IdAsignacion { get; set; }
        public int? IdMalla { get; set; }
        public int? IdDetalleMalla { get; set; }
        public int? IdNivel { get; set; }
        public int? IdModalidad { get; set; }
        public int? IdSeccion { get; set; }
        public string? Paralelo { get; set; }
        public string? FuenteMalla { get; set; }
        public string? SnapshotCurricularJson { get; set; }
        public string? IdDocenteElaborador { get; set; }
        public string Modalidad { get; set; } = "Presencial";
        public string? UnidadOrganizacion { get; set; }
        public string? SemestreNivel { get; set; }
        public int TotalHorasAsignatura { get; set; }
        public decimal Creditos { get; set; }

        public int HorasContactoDocente { get; set; }
        public int HorasPracticoExperimental { get; set; }
        public int HorasAutonomo { get; set; }

        public string? ObjetivoAsignatura { get; set; }
        public string? MetodologiaEnsenanza { get; set; }
        public string? RecursosDidacticos { get; set; }
        public string? EvaluacionAprendizaje { get; set; }

        public string Estado { get; set; } = "Borrador";
        public int Version { get; set; } = 1;
        public bool Activo { get; set; } = true;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime FechaModificacion { get; set; } = DateTime.UtcNow;

        // Firmas
        public string? FirmaElaboradoDocente { get; set; }
        public DateTime? FechaElaborado { get; set; }
        public string? FirmaRevisadoCoord { get; set; }
        public DateTime? FechaRevisadoCoord { get; set; }
        public string? FirmaRevisadoAcad { get; set; }
        public DateTime? FechaRevisadoAcad { get; set; }
        public string? FirmaAprobadoVicerrector { get; set; }
        public DateTime? FechaAprobado { get; set; }

        // Navegación
        public virtual DocExpedienteCurricular? Expediente { get; set; }
        public virtual ICollection<DocPeaUnidad> Unidades { get; set; } = new List<DocPeaUnidad>();
        public virtual ICollection<DocPeaResultadoAprendizaje> ResultadosAprendizaje { get; set; } = new List<DocPeaResultadoAprendizaje>();
        public virtual ICollection<DocPeaActividadPractica> ActividadesPracticas { get; set; } = new List<DocPeaActividadPractica>();
        public virtual ICollection<DocPeaBibliografia> Bibliografias { get; set; } = new List<DocPeaBibliografia>();
        public virtual ICollection<DocPeaObservacion> Observaciones { get; set; } = new List<DocPeaObservacion>();
        public virtual ICollection<DocPeaTrazabilidad> Trazabilidades { get; set; } = new List<DocPeaTrazabilidad>();
        public virtual ICollection<DocPeaPrerequisito> Prerrequisitos { get; set; } = new List<DocPeaPrerequisito>();
        public virtual ICollection<DocPeaEvaluacion> Evaluaciones { get; set; } = new List<DocPeaEvaluacion>();
    }
}
