using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dosier_infrastructure.data.models
{
    [Table("doc_proyecto_extensiones")]
    public class DocProyectoExtension
    {
        [Key]
        public int IdExtension { get; set; }

        [Required]
        [MaxLength(36)]
        public string Uuid { get; set; } = Guid.NewGuid().ToString();

        public int IdProyecto { get; set; }

        public DateOnly FechaAnterior { get; set; }
        public DateOnly FechaNueva { get; set; }

        public string? Motivo { get; set; }
        public string? Resolucion { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        [ForeignKey("IdProyecto")]
        public virtual DocProyecto Proyecto { get; set; } = null!;
    }
}
