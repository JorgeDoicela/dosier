using System;

namespace dosier_application.Curriculum.Dtos
{
    public class SolicitarColaboracionDto
    {
        public int IdAsignacion { get; set; }
        public int? IdPea { get; set; }
        public string? UuidPea { get; set; }
        public string? Motivo { get; set; }
    }

    public class ResponderColaboracionDto
    {
        public bool Aceptar { get; set; }
        public string? Motivo { get; set; }
    }

    public class PeaColaboracionItemDto
    {
        public int IdColaboracion { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int? IdPea { get; set; }
        public string? UuidPea { get; set; }
        public int IdAsignacion { get; set; }
        public string IdDocenteTitular { get; set; } = string.Empty;
        public string IdDocenteColaborador { get; set; } = string.Empty;
        public string? NombreDocenteColaborador { get; set; }
        public string? NombreAsignatura { get; set; }
        public string Estado { get; set; } = "Pendiente";
        public DateTime FechaSolicitud { get; set; }
        public DateTime? FechaRespuesta { get; set; }
    }
}

