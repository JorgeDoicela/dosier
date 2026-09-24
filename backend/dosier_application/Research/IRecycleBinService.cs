using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dosier_application.Research
{
    public class DeletedProjectDto
    {
        public string Uuid { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public string CodigoInstitucional { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public DateTime? FechaEliminacion { get; set; }
        public string EliminadoPor { get; set; } = string.Empty;
    }

    public interface IRecycleBinService
    {
        /// <summary>
        /// Obtiene los proyectos en la papelera de reciclaje.
        /// Retorna null si el usuario no es válido (no autenticado/no existe).
        /// </summary>
        Task<List<DeletedProjectDto>?> GetDeletedProjectsAsync(string userIdRef, bool isAdmin);
    }
}
