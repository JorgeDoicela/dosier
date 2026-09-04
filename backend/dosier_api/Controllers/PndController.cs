using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dosier_infrastructure.data.models;

namespace dosier_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PndController : ControllerBase
{
    private readonly DosierContext _context;

    public PndController(DosierContext context)
    {
        _context = context;
    }

    [HttpGet("objetivos")]
    public async Task<IActionResult> GetObjetivos()
    {
        var objetivos = await _context.DocPndObjetivos
            .Where(o => o.Activo == true)
            .OrderBy(o => o.Codigo)
            .Select(o => new {
                o.IdObjetivoPnd,
                o.Uuid,
                o.Codigo,
                o.Nombre,
                o.Descripcion
            })
            .ToListAsync();
        
        return Ok(objetivos);
    }
}
