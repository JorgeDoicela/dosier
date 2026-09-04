using Microsoft.AspNetCore.Mvc;

namespace dosier_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Check()
    {
        return Ok(new { status = "online", timestamp = DateTime.UtcNow });
    }
}
