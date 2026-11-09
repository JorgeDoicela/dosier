using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    public class DocPeaUnidad
    {
        public int IdUnidad { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public int NumeroUnidad { get; set; }
        public string NombreUnidad { get; set; } = string.Empty;
        public decimal TotalHorasUnidad { get; set; }
        public decimal HorasDocencia { get; set; }
        public decimal HorasPracticoExp { get; set; }
        public decimal HorasAutonomo { get; set; }
        public int Orden { get; set; } = 1;

        public virtual DocPea? Pea { get; set; }
        public virtual ICollection<DocPeaTema> Temas { get; set; } = new List<DocPeaTema>();
        public virtual ICollection<DocPeaActividadPractica> ActividadesPracticas { get; set; } = new List<DocPeaActividadPractica>();
    }

    public class DocPeaTema
    {
        public int IdTema { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdUnidad { get; set; }
        public int NumeroTema { get; set; }
        public string TituloTema { get; set; } = string.Empty;
        public string? DescripcionSubtemas { get; set; }
        public int Orden { get; set; } = 1;

        public virtual DocPeaUnidad? Unidad { get; set; }
    }
}
