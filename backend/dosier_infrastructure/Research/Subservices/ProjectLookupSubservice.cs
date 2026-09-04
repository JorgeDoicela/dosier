using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;

namespace dosier_infrastructure.Research.Subservices
{
    public class ProjectLookupSubservice : IProjectLookupSubservice
    {
        private readonly DosierContext _context;

        public ProjectLookupSubservice(DosierContext context)
        {
            _context = context;
        }

        public async Task<string?> ResolveCanonicalUuidAsync(string identifier)
        {
            if (string.IsNullOrWhiteSpace(identifier)) return null;

            var trimmed = identifier.Trim();

            var exact = await _context.DocProyectos
                .Where(p => p.Uuid == trimmed)
                .Select(p => p.Uuid)
                .FirstOrDefaultAsync();
            if (exact != null) return exact;

            if (int.TryParse(trimmed, out int idProyecto))
            {
                var byId = await _context.DocProyectos
                    .Where(p => p.IdProyecto == idProyecto)
                    .Select(p => p.Uuid)
                    .FirstOrDefaultAsync();
                if (byId != null) return byId;
            }

            if (!trimmed.Contains('-') && trimmed.Length >= 4)
            {
                var prefix = trimmed.ToLowerInvariant();
                var matches = await _context.DocProyectos
                    .Where(p => p.Uuid.ToLower().StartsWith(prefix))
                    .Select(p => p.Uuid)
                    .ToListAsync();

                if (matches.Count == 1) return matches[0];
                if (matches.Count > 1)
                {
                    var segmentMatch = matches.FirstOrDefault(u =>
                        u.Split('-')[0].Equals(trimmed, StringComparison.OrdinalIgnoreCase));
                    return segmentMatch ?? matches[0];
                }
            }

            return null;
        }

        public async Task<List<ProyectoResumenDto>> GetAllProjectsAsync()
        {
            return await _context.DocProyectos
                .Include(p => p.IdConvocatoriaNavigation)
                .Include(p => p.IdObjetivoPndNavigation)
                .Include(p => p.IdEntidadAliadaNavigation)
                .Include(p => p.DocProyectoParticipantes)
                .Include(p => p.DocInformesAvance)
                .Include(p => p.DocProyectosCarreras).ThenInclude(pc => pc.IdCarreraNavigation)
                .OrderByDescending(p => p.FechaRegistro)
                .Select(p => new ProyectoResumenDto
                {
                    IdProyecto = p.IdProyecto,
                    Uuid = p.Uuid,
                    CodigoInstitucional = p.CodigoInstitucional,
                    Titulo = p.Titulo,
                    Estado = p.Estado,
                    LineaInvestigacion = null,
                    Carrera = p.DocProyectosCarreras.Select(pc => pc.IdCarreraNavigation.Carrera1).FirstOrDefault(),
                    PresupuestoTotal = p.DocPresupuestoItems.Any()
                        ? p.DocPresupuestoItems.Sum(i => (decimal?)i.ValorUnitario * (decimal?)i.Cantidad)
                        : p.PresupuestoEstimado,
                    PresupuestoEjecutado = p.ValorEjecucion,
                    PuntajeEvaluacion = p.PuntajeEvaluacion,
                    FechaRegistro = p.FechaRegistro,
                    FechaModificacion = p.FechaModificacion,
                    FechaInicio = p.FechaInicio,
                    FechaFin = p.FechaFin,
                    TiempoEjecucion = p.TiempoEjecucion,
                    ConvocatoriaTitulo = p.IdConvocatoriaNavigation != null ? p.IdConvocatoriaNavigation.Titulo : null,
                    TotalInvestigadores = p.DocProyectoParticipantes.Count(pp => pp.Activo != false),
                    TotalProductos = 0,
                    TotalInformes = p.DocInformesAvance.Count,
                    InformesAprobados = p.DocInformesAvance.Count(i => i.Estado == "Aprobado"),
                    TrlActual = (int?)p.TrlActual,
                    TrlMeta = (int?)p.TrlMeta,
                    TotalEstudiantes = p.DocProyectoParticipantes.Count(pp => pp.TipoParticipante == "Alumno" && pp.Activo != false),
                    EntidadAliada = p.IdEntidadAliadaNavigation != null ? p.IdEntidadAliadaNavigation.RazonSocial : null,
                    ObjetivoPnd = p.IdObjetivoPndNavigation != null ? p.IdObjetivoPndNavigation.Nombre : null,
                    ConvocatoriaCodigo = p.IdConvocatoriaNavigation != null ? p.IdConvocatoriaNavigation.CodigoConvocatoria : null,
                    DirectorNombre = p.DocProyectoParticipantes
                        .Where(pp => pp.EsDirector == true && pp.IdUsuarioNavigation != null)
                        .Select(pp => pp.IdUsuarioNavigation!.Nombre)
                        .FirstOrDefault()
                        ?? p.DocProyectoParticipantes
                        .Where(pp => pp.IdUsuarioNavigation != null)
                        .Select(pp => pp.IdUsuarioNavigation!.Nombre)
                        .FirstOrDefault(),
                    TemplateCode = _context.DocumentInstances
                        .Where(d => d.EntityUuid == p.Uuid)
                        .Select(d => d.TemplateCode)
                        .FirstOrDefault() ?? "PROTOCOLO_INVESTIGACION"
                })
                .ToListAsync();
        }

        public async Task<List<ProyectoResumenDto>> GetMyProjectsAsync(string userIdReferencia)
        {
            var userId = await _context.Users
                .Where(u => u.IdSigafi == userIdReferencia)
                .Select(u => (int?)u.IdUsuario)
                .FirstOrDefaultAsync();

            if (userId == null)
            {
                return new List<ProyectoResumenDto>();
            }

            var groupIds = await _context.DocGruposMiembros
                .Where(m => m.IdUsuario == userId.Value && m.Activo != false)
                .Select(m => m.IdGrupo)
                .Distinct()
                .ToListAsync();

            var projectIds = await _context.DocProyectoParticipantes
                .Where(pp => pp.IdUsuario == userId.Value && pp.Activo != false)
                .Select(pp => pp.IdProyecto)
                .Distinct()
                .ToListAsync();

            return await _context.DocProyectos
                .Include(p => p.IdConvocatoriaNavigation)
                .Include(p => p.IdObjetivoPndNavigation)
                .Include(p => p.IdEntidadAliadaNavigation)
                .Include(p => p.DocProyectoParticipantes)
                .Include(p => p.DocInformesAvance)
                .Include(p => p.DocProyectosCarreras).ThenInclude(pc => pc.IdCarreraNavigation)
                .Where(p => projectIds.Contains(p.IdProyecto) || (p.TieneGrupo == true && p.IdGrupo.HasValue && groupIds.Contains(p.IdGrupo.Value)))
                .OrderByDescending(p => p.FechaRegistro)
                .Select(p => new ProyectoResumenDto
                {
                    IdProyecto = p.IdProyecto,
                    Uuid = p.Uuid,
                    CodigoInstitucional = p.CodigoInstitucional,
                    Titulo = p.Titulo,
                    Estado = p.Estado,
                    LineaInvestigacion = null,
                    Carrera = p.DocProyectosCarreras.Select(pc => pc.IdCarreraNavigation.Carrera1).FirstOrDefault(),
                    PresupuestoTotal = p.DocPresupuestoItems.Any()
                        ? p.DocPresupuestoItems.Sum(i => (decimal?)i.ValorUnitario * (decimal?)i.Cantidad)
                        : p.PresupuestoEstimado,
                    PresupuestoEjecutado = p.ValorEjecucion,
                    PuntajeEvaluacion = p.PuntajeEvaluacion,
                    FechaRegistro = p.FechaRegistro,
                    FechaModificacion = p.FechaModificacion,
                    FechaInicio = p.FechaInicio,
                    FechaFin = p.FechaFin,
                    TiempoEjecucion = p.TiempoEjecucion,
                    ConvocatoriaTitulo = p.IdConvocatoriaNavigation != null ? p.IdConvocatoriaNavigation.Titulo : null,
                    TotalInvestigadores = p.DocProyectoParticipantes.Count(pp => pp.Activo != false),
                    TotalProductos = 0,
                    TotalInformes = p.DocInformesAvance.Count,
                    InformesAprobados = p.DocInformesAvance.Count(i => i.Estado == "Aprobado"),
                    TrlActual = (int?)p.TrlActual,
                    TrlMeta = (int?)p.TrlMeta,
                    TotalEstudiantes = p.DocProyectoParticipantes.Count(pp => pp.TipoParticipante == "Alumno" && pp.Activo != false),
                    EntidadAliada = p.IdEntidadAliadaNavigation != null ? p.IdEntidadAliadaNavigation.RazonSocial : null,
                    ObjetivoPnd = p.IdObjetivoPndNavigation != null ? p.IdObjetivoPndNavigation.Nombre : null,
                    ConvocatoriaCodigo = p.IdConvocatoriaNavigation != null ? p.IdConvocatoriaNavigation.CodigoConvocatoria : null,
                    DirectorNombre = p.DocProyectoParticipantes
                        .Where(pp => pp.EsDirector == true && pp.IdUsuarioNavigation != null)
                        .Select(pp => pp.IdUsuarioNavigation!.Nombre)
                        .FirstOrDefault()
                        ?? p.DocProyectoParticipantes
                        .Where(pp => pp.IdUsuarioNavigation != null)
                        .Select(pp => pp.IdUsuarioNavigation!.Nombre)
                        .FirstOrDefault(),
                    TemplateCode = _context.DocumentInstances
                        .Where(d => d.EntityUuid == p.Uuid)
                        .Select(d => d.TemplateCode)
                        .FirstOrDefault() ?? "PROTOCOLO_INVESTIGACION"
                })
                .ToListAsync();
        }
    }
}
