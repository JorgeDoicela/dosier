using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Collaboration.Dtos;
using dosier_application.Collaboration.Interfaces;
using Dosier.Infrastructure.Common.Storage;

namespace dosier_api.Controllers
{
    /// <summary>
    /// CONTROLADOR DE COORDINACIÓN (Team Pulse)
    /// Maneja el estado inicial de la colaboración antes de entrar al flujo SignalR.
    /// </summary>
    [ApiController]
    [Route("api/collaboration")]
    [Authorize]
    public class CollaborationController : ControllerBase
    {
        private readonly ICollaborationService _collaborationService;
        private readonly IFileStorageService _storageService;

        public CollaborationController(
            ICollaborationService collaborationService,
            IFileStorageService storageService)
        {
            _collaborationService = collaborationService;
            _storageService = storageService;
        }

        /// <summary>
        /// Recibe una imagen pegada en el editor colaborativo, la guarda en el servidor
        /// y retorna su URL estática para evitar incrustar Base64 en el Yjs.
        /// </summary>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No se proporcionó ningún archivo." });

            try
            {
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var content = memoryStream.ToArray();

                var relativePath = await _storageService.SaveFileAsync(file.FileName, content, "cowork_images");
                var url = $"/api/storage/{relativePath.Replace('\\', '/')}";

                return Ok(new { url });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al guardar la imagen", detail = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el pulso actual del documento (comentarios y estados de sección).
        /// </summary>
        [HttpGet("{instanceUuid}/pulse")]
        public async Task<IActionResult> GetPulse(string instanceUuid)
        {
            try
            {
                var pulse = await _collaborationService.GetPulseAsync(instanceUuid);
                return Ok(new
                {
                    comments = pulse.Comments,
                    statuses = pulse.Statuses,
                    activities = pulse.Activities
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al cargar el pulso de colaboración", detail = ex.Message });
            }
        }

        /// <summary>
        /// Publica un comentario en el hilo de colaboración / retroalimentación de un documento o grupo.
        /// </summary>
        [HttpPost("comments")]
        public async Task<IActionResult> PostComment([FromBody] CreateCommentRequest request)
        {
            var userUuid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0";
            var userName = User.FindFirst("nombre")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Usuario";

            var result = await _collaborationService.PostCommentAsync(request, userUuid, userName);
            return result.Status switch
            {
                CommentOpStatus.Success => Ok(result.Comment),
                CommentOpStatus.InvalidData => BadRequest(new { message = result.Message }),
                _ => StatusCode(500, new { message = result.Message ?? "Error al publicar comentario" })
            };
        }

        /// <summary>
        /// Actualiza el contenido de un comentario (Edición).
        /// </summary>
        [HttpPut("comments/{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentRequest request)
        {
            var userUuid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0";
            var isAdmin = User.IsInRole("DOSIER_ADMIN") || User.FindFirst("es_admin")?.Value == "true";

            var result = await _collaborationService.UpdateCommentAsync(id, request, userUuid, isAdmin);
            return result.Status switch
            {
                CommentOpStatus.Success => Ok(result.Comment),
                CommentOpStatus.NotFound => NotFound(new { message = result.Message }),
                CommentOpStatus.Forbidden => StatusCode(403, new { message = result.Message }),
                CommentOpStatus.InvalidData => BadRequest(new { message = result.Message }),
                _ => StatusCode(500, new { message = result.Message ?? "Error al actualizar comentario" })
            };
        }

        /// <summary>
        /// Elimina un comentario y sus respuestas (Eliminación).
        /// </summary>
        [HttpDelete("comments/{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var userUuid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0";
            var isAdmin = User.IsInRole("DOSIER_ADMIN") || User.FindFirst("es_admin")?.Value == "true";

            var result = await _collaborationService.DeleteCommentAsync(id, userUuid, isAdmin);
            return result.Status switch
            {
                CommentOpStatus.Success => Ok(new { message = result.Message }),
                CommentOpStatus.NotFound => NotFound(new { message = result.Message }),
                CommentOpStatus.Forbidden => StatusCode(403, new { message = result.Message }),
                _ => StatusCode(500, new { message = result.Message ?? "Error al eliminar comentario" })
            };
        }

        /// <summary>
        /// Elimina una imagen de cowork_images.
        /// </summary>
        [HttpDelete("delete-image")]
        public async Task<IActionResult> DeleteImage([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url))
                return BadRequest(new { message = "No se proporcionó la URL de la imagen." });

            try
            {
                var prefix = "/api/storage/";
                var idx = url.IndexOf(prefix, StringComparison.Ordinal);
                if (idx == -1)
                {
                    return BadRequest(new { message = "URL de imagen no válida." });
                }

                var relativePath = url.Substring(idx + prefix.Length);

                if (relativePath.Contains("..") || relativePath.StartsWith("/") || relativePath.StartsWith("\\"))
                {
                    return BadRequest(new { message = "Ruta de archivo no permitida." });
                }

                if (!relativePath.StartsWith("cowork_images/"))
                {
                    return BadRequest(new { message = "Solo se permite eliminar imágenes de colaboración." });
                }

                await _storageService.DeleteFileAsync(relativePath);
                return Ok(new { message = "Imagen eliminada correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al eliminar la imagen", detail = ex.Message });
            }
        }
    }
}
