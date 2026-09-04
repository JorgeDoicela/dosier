using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dosier_infrastructure.data.models;
using dosier_domain.Identity.Entities;
using System.Security.Claims;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/catalogs")]
    public class CatalogsController : ControllerBase
    {
        private readonly DosierContext _context;

        public CatalogsController(DosierContext context)
        {
            _context = context;
        }

        [HttpGet("tipo-evidencia")]
        public async Task<IActionResult> GetTiposEvidencia()
        {
            var data = await _context.DocCatTipoEvidencias
                .Where(t => t.Activo == true)
                .OrderBy(t => t.Nombre)
                .ToListAsync();
            return Ok(data);
        }

        [HttpGet("entidades-externas")]
        public async Task<IActionResult> GetEntidadesExternas()
        {
            var data = await _context.DocEntidadesExternas
                .Where(e => e.Activo == true)
                .OrderBy(e => e.RazonSocial)
                .ToListAsync();
            return Ok(data);
        }

        [HttpGet("config-general")]
        public async Task<IActionResult> GetConfigGeneral([FromQuery] string? prefix = null)
        {
            var query = _context.DocConfigsGenerales.AsQueryable();
            if (!string.IsNullOrEmpty(prefix))
            {
                query = query.Where(c => c.Clave.StartsWith(prefix));
            }
            var data = await query.ToListAsync();
            return Ok(data);
        }

        [HttpGet("carreras")]
        public async Task<IActionResult> GetCarreras()
        {
            var data = await _context.Carreras
                .OrderBy(c => c.Carrera1)
                .ToListAsync();
            return Ok(data);
        }

        /// <summary>
        /// Devuelve las carreras vinculadas al usuario autenticado en el periodo académico activo.
        /// </summary>
        [HttpGet("mi-carrera")]
        [Authorize]
        public async Task<IActionResult> GetMiCarrera()
        {
            var idReferencia = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(idReferencia))
                return Unauthorized();

            var dbUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi.Trim() == idReferencia.Trim());
            if (dbUser == null)
                return NotFound(new { message = "Usuario no encontrado." });

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var currentPeriod = await _context.Periodos
                .Where(p => p.EsInstituto == 1)
                .OrderByDescending(p => p.Periodoactivoinstituto == 1)
                .ThenByDescending(p => p.Activo == true)
                .ThenByDescending(p => p.FechaInicial <= today && p.FechaFinal >= today)
                .ThenByDescending(p => p.FechaInicial)
                .FirstOrDefaultAsync();

            if (dbUser.TablaSigafi == "profesor")
            {
                var profCareersQuery = _context.ProfesoresCarrerasPeriodos
                    .AsNoTracking()
                    .Include(pc => pc.IdCarreraNavigation)
                    .Where(pc => pc.IdProfesor.Trim() == idReferencia.Trim()
                                 && pc.EsActivo == 1
                                 && pc.IdCarreraNavigation != null);

                if (currentPeriod != null)
                    profCareersQuery = profCareersQuery.Where(pc => pc.IdPeriodo == currentPeriod.IdPeriodo);

                var careers = await profCareersQuery
                    .Select(pc => pc.IdCarreraNavigation!)
                    .Distinct()
                    .OrderBy(c => c.Carrera1)
                    .ToListAsync();

                return Ok(careers);
            }

            return Ok(Array.Empty<Carrera>());
        }

        // --- CRUD Periodos Académicos ---
        [HttpGet("periodos")]
        public async Task<IActionResult> GetPeriodos()
        {
            var data = await _context.Periodos
                .Where(p => p.EsInstituto == 1)
                .OrderByDescending(p => p.IdPeriodo)
                .ToListAsync();
            return Ok(data);
        }

        [HttpPost("periodos")]
        public async Task<IActionResult> CreatePeriodo([FromBody] Periodo model)
        {
            if (string.IsNullOrEmpty(model.IdPeriodo)) return BadRequest("Id de período requerido (ej. 2026-A)");
            if (string.IsNullOrEmpty(model.Detalle)) return BadRequest("Detalle requerido");

            model.Activo = true;
            model.Cerrado = false;
            model.EsInstituto = 1;
            
            _context.Periodos.Add(model);
            await _context.SaveChangesAsync();
            return Created($"/api/catalogs/periodos/{model.IdPeriodo}", model);
        }

        [HttpPut("periodos/{id}")]
        public async Task<IActionResult> UpdatePeriodo(string id, [FromBody] Periodo model)
        {
            var existing = await _context.Periodos.FirstOrDefaultAsync(p => p.IdPeriodo == id && p.EsInstituto == 1);
            if (existing == null) return NotFound();

            existing.Detalle = model.Detalle;
            existing.FechaInicial = model.FechaInicial;
            existing.FechaFinal = model.FechaFinal;
            existing.Activo = model.Activo;
            existing.Cerrado = model.Cerrado;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("periodos/{id}")]
        public async Task<IActionResult> TogglePeriodo(string id)
        {
            var existing = await _context.Periodos.FirstOrDefaultAsync(p => p.IdPeriodo == id && p.EsInstituto == 1);
            if (existing == null) return NotFound();

            existing.Activo = !(existing.Activo ?? true);
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpGet("workflow/estados")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEstadosConfig()
        {
            var estados = await _context.DocConfigWorkflows
                .Where(w => w.Activo)
                .Select(w => new {
                    estado = w.EstadoDestino,
                    etiqueta = w.EtiquetaUi ?? w.EstadoDestino,
                    color = w.ColorHex ?? "#94A3B8",
                    esFinal = w.EsEstadoFinal,
                    permiteInformes = w.PermiteInformesAvance,
                    permiteEgresos = w.PermiteRegistroEgresos
                })
                .Distinct()
                .ToListAsync();
            return Ok(estados);
        }

        // --- Objetivos de Desarrollo Sostenible (ODS) ---
        [HttpGet("ods")]
        public async Task<IActionResult> GetOds()
        {
            var data = await _context.DocOds
                .Include(o => o.IdEjeNavigation)
                .OrderBy(o => o.NumeroOds)
                .Select(o => new {
                    idOds = o.IdOds,
                    numeroOds = o.NumeroOds,
                    titulo = o.Titulo,
                    idEje = o.IdEje,
                    eje = o.IdEjeNavigation != null ? o.IdEjeNavigation.Nombre : ""
                })
                .ToListAsync();
            return Ok(data);
        }
    }
}

