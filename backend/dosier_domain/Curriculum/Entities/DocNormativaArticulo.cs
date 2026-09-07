using System;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Desglose de artículos normativos para auditoría y validación activa del PEA
    /// </summary>
    public class DocNormativaArticulo
    {
        public int IdArticulo { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdNormativa { get; set; }
        public string NumeroArticulo { get; set; } = string.Empty;
        public string? Titulo { get; set; }
        public string Contenido { get; set; } = string.Empty;
        public string? RequisitoCurricular { get; set; }
        public int Orden { get; set; } = 1;

        // Navegación
        public virtual DocNormativa? Normativa { get; set; }
    }
}
