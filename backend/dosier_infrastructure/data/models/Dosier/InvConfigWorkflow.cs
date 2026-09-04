using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dosier_infrastructure.data.models
{
    [Table("doc_config_workflow")]
    public class DocConfigWorkflow
    {
        [Key]
        public int IdWorkflow { get; set; }

        [Required]
        [MaxLength(50)]
        public string EstadoOrigen { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string EstadoDestino { get; set; } = null!;

        [MaxLength(100)]
        public string? RolRequerido { get; set; }

        public bool RequiereObservacion { get; set; } = true;

        public bool Activo { get; set; } = true;

        public bool ContabilizaCargaHoraria { get; set; } = false;

        public bool PermiteInformesAvance { get; set; } = false;
 
        public bool EsEstadoFinal { get; set; } = false;

        [MaxLength(80)]
        public string? EtiquetaUi { get; set; }

        [MaxLength(7)]
        public string? ColorHex { get; set; }
    }
}
