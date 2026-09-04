using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dosier_infrastructure.data.models
{
    [Table("doc_config_general")]
    public class DocConfigGeneral
    {
        [Key]
        [MaxLength(100)]
        public string Clave { get; set; } = null!;

        [Required]
        public string Valor { get; set; } = null!;

        [MaxLength(255)]
        public string? Descripcion { get; set; }
    }
}
