using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using dosier_application.Common.Notifications;
using System.Security.Claims;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/Admin/notifications")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyNotifications([FromQuery] int limit = 20)
        {
            var userIdStr = User.FindFirst("id_usuario")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var notifications = await _notificationService.GetMyNotificationsAsync(userId);
            var list = notifications.ToList();

            if (limit > 0 && limit < list.Count)
            {
                list = list.Take(limit).ToList();
            }

            return Ok(list);
        }

        [HttpPatch("{uuid}/read")]
        public async Task<IActionResult> MarkAsRead(string uuid)
        {
            var result = await _notificationService.MarkAsReadAsync(uuid);
            if (result) return Ok();
            return NotFound();
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userIdStr = User.FindFirst("id_usuario")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            await _notificationService.MarkAllAsReadAsync(userId);
            return Ok();
        }

        [HttpDelete("{uuid}")]
        public async Task<IActionResult> Delete(string uuid)
        {
            var result = await _notificationService.DeleteNotificationAsync(uuid);
            if (result) return Ok();
            return NotFound();
        }

        [HttpDelete("clear-read")]
        public async Task<IActionResult> ClearRead()
        {
            var userIdStr = User.FindFirst("id_usuario")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            await _notificationService.ClearReadNotificationsAsync(userId);
            return Ok();
        }

        [HttpPost("trigger-welcome")]
        public async Task<IActionResult> TriggerWelcome()
        {
            var userIdStr = User.FindFirst("id_usuario")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var result = await _notificationService.TriggerWelcomeNotificationAsync(userId);
            return Ok(result);
        }

        [HttpPost("test-push")]
        public async Task<IActionResult> TestPush([FromQuery] string title = "Prueba Profesional DOSIER", [FromQuery] string body = "¡Éxito! Esta es una notificación Web Push real en segundo plano.")
        {
            var userIdStr = User.FindFirst("id_usuario")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            await _notificationService.NotifyUserAsync(userId, title, body, "SISTEMA", "/dashboard");
            return Ok(new { message = "Push de prueba encolado y enviado." });
        }
    }
}
