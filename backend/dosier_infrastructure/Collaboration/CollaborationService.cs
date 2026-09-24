using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_application.Collaboration.Dtos;
using dosier_application.Collaboration.Interfaces;
using dosier_infrastructure.data.models;
using dosier_infrastructure.data.models.Cowork;

namespace dosier_infrastructure.Collaboration
{
    public class CollaborationService : ICollaborationService
    {
        private readonly DosierContext _db;
        private readonly IHubContext<CollaborationHub> _hubContext;
        private readonly ILogger<CollaborationService> _logger;

        public CollaborationService(
            DosierContext db,
            IHubContext<CollaborationHub> hubContext,
            ILogger<CollaborationService> logger)
        {
            _db = db;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task<PulseResponseDto> GetPulseAsync(string instanceUuid)
        {
            var comments = await _db.DocCollaborationComments
                .AsNoTracking()
                .Where(c => c.DocumentoUuid == instanceUuid)
                .OrderByDescending(c => c.CreadoEn)
                .Take(50)
                .Select(c => new CommentDto
                {
                    IdComentario = c.IdComentario,
                    DocumentoUuid = c.DocumentoUuid,
                    UsuarioUuid = c.UsuarioUuid,
                    NombreUsuario = c.NombreUsuario,
                    Contenido = c.Contenido,
                    IdPadre = c.IdPadre,
                    CreadoEn = c.CreadoEn
                })
                .ToListAsync();

            var statuses = await _db.DocDocumentosSeccionesMetadata
                .AsNoTracking()
                .Where(s => s.DocumentoUuid == instanceUuid)
                .Select(s => new
                {
                    s.SeccionNombre,
                    s.Estado,
                    s.UltimoNombreUsuario,
                    s.UltimoUsuarioUuid,
                    s.ActualizadoEn
                })
                .ToListAsync();

            var statusesDict = statuses
                .GroupBy(s => s.SeccionNombre)
                .ToDictionary(
                    g => g.Key,
                    g => new SectionStatusDto
                    {
                        Estado = g.First().Estado,
                        UltimoNombreUsuario = g.First().UltimoNombreUsuario,
                        UltimoUsuarioUuid = g.First().UltimoUsuarioUuid,
                        ActualizadoEn = g.First().ActualizadoEn
                    });

            var pattern = instanceUuid + "%";
            var sesiones = await _db.DocCoworkSesiones.AsNoTracking()
                .Where(s => EF.Functions.Like(s.DocumentoUuid, pattern) &&
                            (s.SeccionNombre != null || s.Accion != null))
                .OrderByDescending(s => s.ConectadoEn)
                .Take(50)
                .ToListAsync();

            sesiones = sesiones
                .Where(s => !s.DesconectadoEn.HasValue ||
                            (s.DesconectadoEn.Value - s.ConectadoEn).TotalSeconds >= 5)
                .Take(15)
                .ToList();

            var metaSecciones = await _db.DocDocumentosSeccionesMetadata
                .AsNoTracking()
                .Where(m => m.DocumentoUuid == instanceUuid)
                .OrderByDescending(m => m.ActualizadoEn)
                .Take(15)
                .ToListAsync();

            var activitiesList = new List<ActivityItemDto>();

            foreach (var s in sesiones)
            {
                if (string.IsNullOrWhiteSpace(s.SeccionNombre) && string.IsNullOrWhiteSpace(s.Accion))
                {
                    continue;
                }

                string sectionName;
                string action;

                if (!string.IsNullOrWhiteSpace(s.SeccionNombre))
                {
                    sectionName = s.SeccionNombre.Replace("_", " ");
                    action = string.IsNullOrWhiteSpace(s.Accion) ? "ha entrado a redactar" : s.Accion;
                }
                else
                {
                    var parts = s.DocumentoUuid.Split('_');
                    sectionName = parts.Length > 1 ? parts[1].Replace("_", " ") : "General";
                    var durMin = s.DesconectadoEn.HasValue
                        ? (int)(s.DesconectadoEn.Value - s.ConectadoEn).TotalMinutes
                        : -1;

                    action = parts.Length > 1
                        ? "ha entrado a redactar"
                        : (durMin >= 0
                            ? $"editó 'General' durante {durMin} min"
                            : "está editando 'General'");
                }

                activitiesList.Add(new ActivityItemDto
                {
                    UserName = string.IsNullOrWhiteSpace(s.NombreUsuario) ? "Usuario" : s.NombreUsuario,
                    Action = action,
                    SectionName = sectionName,
                    Timestamp = s.ConectadoEn
                });
            }

            foreach (var sec in metaSecciones)
            {
                activitiesList.Add(new ActivityItemDto
                {
                    UserName = sec.UltimoNombreUsuario ?? "Sistema",
                    Action = $"marcó sección como {sec.Estado}",
                    SectionName = sec.SeccionNombre,
                    Timestamp = sec.ActualizadoEn
                });
            }

            var orderedActivities = activitiesList
                .OrderByDescending(a => a.Timestamp)
                .Take(20)
                .ToList();

            return new PulseResponseDto
            {
                Comments = comments,
                Statuses = statusesDict,
                Activities = orderedActivities
            };
        }

        public async Task<CommentOpResult> PostCommentAsync(CreateCommentRequest request, string userUuid, string userName)
        {
            if (string.IsNullOrEmpty(request.DocumentoUuid) || string.IsNullOrEmpty(request.Contenido))
            {
                return new CommentOpResult { Status = CommentOpStatus.InvalidData, Message = "Faltan campos obligatorios." };
            }

            var comment = new DocCollaborationComment
            {
                DocumentoUuid = request.DocumentoUuid,
                UsuarioUuid = userUuid,
                NombreUsuario = userName,
                Contenido = request.Contenido,
                IdPadre = request.IdPadre,
                CreadoEn = DateTime.UtcNow
            };

            _db.DocCollaborationComments.Add(comment);
            await _db.SaveChangesAsync();

            await _hubContext.Clients.Group(request.DocumentoUuid.ToLower().Trim()).SendAsync("NewCommentReceived", new
            {
                idComentario = comment.IdComentario,
                usuarioUuid = comment.UsuarioUuid,
                nombreUsuario = comment.NombreUsuario,
                contenido = comment.Contenido,
                idPadre = comment.IdPadre,
                creadoEn = comment.CreadoEn
            });

            return new CommentOpResult
            {
                Status = CommentOpStatus.Success,
                Comment = new CommentDto
                {
                    IdComentario = comment.IdComentario,
                    DocumentoUuid = comment.DocumentoUuid,
                    UsuarioUuid = comment.UsuarioUuid,
                    NombreUsuario = comment.NombreUsuario,
                    Contenido = comment.Contenido,
                    IdPadre = comment.IdPadre,
                    CreadoEn = comment.CreadoEn
                }
            };
        }

        public async Task<CommentOpResult> UpdateCommentAsync(int id, UpdateCommentRequest request, string userUuid, bool isAdmin)
        {
            if (string.IsNullOrEmpty(request.Contenido))
            {
                return new CommentOpResult { Status = CommentOpStatus.InvalidData, Message = "El contenido no puede estar vacío." };
            }

            var comment = await _db.DocCollaborationComments.FindAsync(id);
            if (comment == null)
            {
                return new CommentOpResult { Status = CommentOpStatus.NotFound, Message = "Comentario no encontrado." };
            }

            if (comment.UsuarioUuid != userUuid && !isAdmin)
            {
                return new CommentOpResult { Status = CommentOpStatus.Forbidden, Message = "No tienes permisos para editar este comentario." };
            }

            comment.Contenido = request.Contenido;
            await _db.SaveChangesAsync();

            await _hubContext.Clients.Group(comment.DocumentoUuid.ToLower().Trim()).SendAsync("CommentUpdated", new
            {
                idComentario = comment.IdComentario,
                documentoUuid = comment.DocumentoUuid,
                contenido = comment.Contenido
            });

            return new CommentOpResult
            {
                Status = CommentOpStatus.Success,
                Comment = new CommentDto
                {
                    IdComentario = comment.IdComentario,
                    DocumentoUuid = comment.DocumentoUuid,
                    UsuarioUuid = comment.UsuarioUuid,
                    NombreUsuario = comment.NombreUsuario,
                    Contenido = comment.Contenido,
                    IdPadre = comment.IdPadre,
                    CreadoEn = comment.CreadoEn
                }
            };
        }

        public async Task<CommentOpResult> DeleteCommentAsync(int id, string userUuid, bool isAdmin)
        {
            var comment = await _db.DocCollaborationComments.FindAsync(id);
            if (comment == null)
            {
                return new CommentOpResult { Status = CommentOpStatus.NotFound, Message = "Comentario no encontrado." };
            }

            if (comment.UsuarioUuid != userUuid && !isAdmin)
            {
                return new CommentOpResult { Status = CommentOpStatus.Forbidden, Message = "No tienes permisos para eliminar este comentario." };
            }

            var children = await _db.DocCollaborationComments.Where(c => c.IdPadre == id).ToListAsync();
            _db.DocCollaborationComments.RemoveRange(children);
            _db.DocCollaborationComments.Remove(comment);
            await _db.SaveChangesAsync();

            await _hubContext.Clients.Group(comment.DocumentoUuid.ToLower().Trim()).SendAsync("CommentDeleted", new
            {
                idComentario = comment.IdComentario,
                documentoUuid = comment.DocumentoUuid
            });

            return new CommentOpResult
            {
                Status = CommentOpStatus.Success,
                Message = "Comentario eliminado correctamente."
            };
        }
    }
}
