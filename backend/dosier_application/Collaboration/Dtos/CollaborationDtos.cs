using System;
using System.Collections.Generic;

namespace dosier_application.Collaboration.Dtos
{
    public class CommentDto
    {
        public int IdComentario { get; set; }
        public string DocumentoUuid { get; set; } = string.Empty;
        public string UsuarioUuid { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string Contenido { get; set; } = string.Empty;
        public int? IdPadre { get; set; }
        public DateTime CreadoEn { get; set; }
    }

    public class SectionStatusDto
    {
        public string Estado { get; set; } = string.Empty;
        public string? UltimoNombreUsuario { get; set; }
        public string? UltimoUsuarioUuid { get; set; }
        public DateTime ActualizadoEn { get; set; }
    }

    public class ActivityItemDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string SectionName { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class PulseResponseDto
    {
        public List<CommentDto> Comments { get; set; } = new();
        public Dictionary<string, SectionStatusDto> Statuses { get; set; } = new();
        public List<ActivityItemDto> Activities { get; set; } = new();
    }

    public class CreateCommentRequest
    {
        public string DocumentoUuid { get; set; } = null!;
        public string Contenido { get; set; } = null!;
        public int? IdPadre { get; set; }
    }

    public class UpdateCommentRequest
    {
        public string Contenido { get; set; } = null!;
    }

    public enum CommentOpStatus
    {
        Success,
        NotFound,
        Forbidden,
        InvalidData
    }

    public class CommentOpResult
    {
        public CommentOpStatus Status { get; set; }
        public string? Message { get; set; }
        public CommentDto? Comment { get; set; }
    }
}
