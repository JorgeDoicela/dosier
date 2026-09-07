using System;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Matriz institucional de articulación entre asignaturas y resultados de perfil de egreso (tributación)
    /// </summary>
    public class DocAsignaturaResultadoPerfil
    {
        public int IdRelacion { get; set; }
        public int IdAsignatura { get; set; }
        public int IdMalla { get; set; }
        public int IdResultadoPerfil { get; set; }
        public string NivelAporte { get; set; } = "Medio"; // 'Introductorio', 'Medio', 'Avanzado'

        // Navegación
        public virtual DocPerfilEgresoResultado? ResultadoPerfil { get; set; }
    }
}
