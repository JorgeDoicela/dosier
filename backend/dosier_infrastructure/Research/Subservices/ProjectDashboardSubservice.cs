using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;

namespace dosier_infrastructure.Research.Subservices
{
    public class ProjectDashboardSubservice : IProjectDashboardSubservice
    {
        private readonly DosierContext _context;

        public ProjectDashboardSubservice(DosierContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(string userIdReferencia, bool isAdmin)
        {
            var stats = new DashboardStatsDto();

            var proyectosQuery = _context.DocProyectos.AsQueryable();

            var conteoEstados = await proyectosQuery
                .GroupBy(p => p.Estado)
                .Select(g => new { Estado = g.Key ?? "Borrador", Cantidad = g.Count() })
                .ToListAsync();

            // Consultar también los PEAs registrados oficialmente
            var conteoPeas = await _context.DocPeas
                .Where(p => p.Activo)
                .GroupBy(p => p.Estado)
                .Select(g => new { Estado = g.Key ?? "Borrador", Cantidad = g.Count() })
                .ToListAsync();

            // Combinar conteos por estado
            var conteoDict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            foreach (var item in conteoEstados)
            {
                conteoDict[item.Estado] = conteoDict.GetValueOrDefault(item.Estado, 0) + item.Cantidad;
            }
            foreach (var item in conteoPeas)
            {
                conteoDict[item.Estado] = conteoDict.GetValueOrDefault(item.Estado, 0) + item.Cantidad;
            }

            stats.TotalProyectos = conteoDict.Values.Sum();
            stats.ProyectosBorrador = conteoDict.GetValueOrDefault("Borrador", 0);
            stats.ProyectosEnRevision = conteoDict.GetValueOrDefault("En Revisión", 0) + conteoDict.GetValueOrDefault("Enviado", 0) + conteoDict.GetValueOrDefault("Revisión Técnica", 0);
            stats.ProyectosAprobados = conteoDict.GetValueOrDefault("Aprobado", 0);
            stats.ProyectosEnEjecucion = conteoDict.GetValueOrDefault("En Ejecución", 0);
            stats.ProyectosFinalizados = conteoDict.GetValueOrDefault("Finalizado", 0);

            // Mapear métricas para los widgets del dashboard curricular:
            // ArticulosIndexados -> Instrumentos Aprobados
            // Prototipos -> En Revisión Colegiada
            // Ponencias -> En Elaboración / Borrador
            stats.ArticulosIndexados = stats.ProyectosAprobados;
            stats.Prototipos = stats.ProyectosEnRevision;
            stats.Ponencias = stats.ProyectosBorrador;

            stats.TotalInvestigadoresActivos = await _context.DocProyectoParticipantes
                .Where(pp => pp.Activo != false && pp.IdProyectoNavigation!.Estado != "Borrador" && pp.IdProyectoNavigation.Estado != "Rechazado" && pp.IdProyectoNavigation.Estado != "Anulado")
                .Select(pp => pp.IdUsuario)
                .Distinct()
                .CountAsync();

            var colorMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "Borrador", "#6B7280" },
                { "Enviado", "#3B82F6" },
                { "En Revisión", "#F59E0B" },
                { "Revisión Técnica", "#F59E0B" },
                { "Aprobado", "#10B981" },
                { "En Ejecución", "#8B5CF6" },
                { "Finalizado", "#059669" },
                { "Rechazado", "#EF4444" }
            };

            stats.ProyectosPorEstado = conteoDict
                .Select(x => new EstadoConteoDto
                {
                    Estado = x.Key,
                    Cantidad = x.Value,
                    Color = colorMap.TryGetValue(x.Key, out var col) ? col : "#6B7280"
                })
                .ToList();

            var userId = await _context.Users
                .Where(u => u.IdSigafi.Trim() == userIdReferencia.Trim())
                .Select(u => (int?)u.IdUsuario)
                .FirstOrDefaultAsync();

            if (userId != null)
            {
                var misIds = _context.DocProyectoParticipantes
                    .Where(pp => pp.IdUsuario == userId.Value).Select(pp => pp.IdProyecto);

                var misProyectosActivos = await _context.DocProyectos
                    .Where(p => misIds.Contains(p.IdProyecto) && (p.Estado == "En Ejecución" || p.Estado == "Aprobado"))
                    .CountAsync();

                var misProyectosBorrador = await _context.DocProyectos
                    .Where(p => misIds.Contains(p.IdProyecto) && p.Estado == "Borrador")
                    .CountAsync();

                var misProyectosEnRevision = await _context.DocProyectos
                    .Where(p => misIds.Contains(p.IdProyecto) && (p.Estado == "En Revisión" || p.Estado == "Enviado"))
                    .CountAsync();

                // Sumar los PEAs asignados al docente
                var misPeasActivos = await _context.DocPeas
                    .Where(p => p.IdDocenteElaborador == userIdReferencia.Trim() && p.Activo && (p.Estado == "Aprobado" || p.Estado == "En Ejecución"))
                    .CountAsync();

                var misPeasBorrador = await _context.DocPeas
                    .Where(p => p.IdDocenteElaborador == userIdReferencia.Trim() && p.Activo && p.Estado == "Borrador")
                    .CountAsync();

                var misPeasEnRevision = await _context.DocPeas
                    .Where(p => p.IdDocenteElaborador == userIdReferencia.Trim() && p.Activo && (p.Estado == "En Revisión" || p.Estado == "Enviado"))
                    .CountAsync();

                stats.MisProyectosActivos = misProyectosActivos + misPeasActivos;
                stats.MisProyectosBorrador = misProyectosBorrador + misPeasBorrador;
                stats.MisProyectosEnRevision = misProyectosEnRevision + misPeasEnRevision;

                stats.MisInformesPendientes = 0;

                stats.MisHorasInvestigacion = await _context.DocProyectoParticipantes
                    .Where(pp => pp.IdUsuario == userId.Value && pp.Activo != false && pp.TipoParticipante == "Docente" && (pp.IdProyectoNavigation!.Estado == "En Ejecución" || pp.IdProyectoNavigation.Estado == "Aprobado"))
                    .SumAsync(pp => (decimal?)pp.HorasSemanales ?? 0);

                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var currentPeriod = await _context.Periodos
                    .Where(pr => pr.EsInstituto == 1)
                    .OrderByDescending(pr => pr.Periodoactivoinstituto == 1)
                    .ThenByDescending(pr => pr.Activo == true)
                    .ThenByDescending(pr => pr.FechaInicial <= today && pr.FechaFinal >= today)
                    .ThenByDescending(pr => pr.FechaInicial)
                    .FirstOrDefaultAsync();

                if (currentPeriod != null)
                {
                    var researchSubcatId = await GetResearchSubcatIdAsync();

                    stats.HorasDisponiblesDistributivo = await _context.ProfesoresActividades
                        .Where(pa => pa.IdProfesor.Trim() == userIdReferencia.Trim() && pa.IdSubcategoria == researchSubcatId && pa.IdPeriodo == currentPeriod.IdPeriodo)
                        .SumAsync(pa => (decimal?)pa.HorasSemana ?? 0);
                }
                else
                {
                    stats.HorasDisponiblesDistributivo = 0;
                }
            }

            var ultimosProyectosQuery = _context.DocProyectos.AsQueryable();

            if (!isAdmin && userId != null)
            {
                var misIds = _context.DocProyectoParticipantes
                    .Where(pp => pp.IdUsuario == userId.Value).Select(pp => pp.IdProyecto);

                ultimosProyectosQuery = ultimosProyectosQuery.Where(p => misIds.Contains(p.IdProyecto));
            }

            var ultimosProyectos = await ultimosProyectosQuery
                .OrderByDescending(p => p.FechaModificacion ?? p.FechaRegistro)
                .Take(8)
                .Select(p => new ActividadRecienteDto
                {
                    Tipo = "proyecto",
                    Descripcion = p.Titulo,
                    Fecha = p.FechaModificacion ?? p.FechaRegistro ?? DateTime.Now,
                    Uuid = p.Uuid,
                    Estado = p.Estado
                })
                .ToListAsync();

            var ultimosPeasQuery = _context.DocPeas.Where(p => p.Activo);

            if (!isAdmin)
            {
                ultimosPeasQuery = ultimosPeasQuery.Where(p => p.IdDocenteElaborador == userIdReferencia.Trim());
            }

            var ultimosPeas = await ultimosPeasQuery
                .OrderByDescending(p => p.FechaModificacion)
                .Take(8)
                .Select(p => new ActividadRecienteDto
                {
                    Tipo = "pea",
                    Descripcion = p.ObjetivoAsignatura ?? $"PEA Asignatura #{p.IdAsignatura}",
                    Fecha = p.FechaModificacion,
                    Uuid = p.Uuid,
                    Estado = p.Estado
                })
                .ToListAsync();

            stats.ActividadReciente = ultimosProyectos
                .Concat(ultimosPeas)
                .OrderByDescending(a => a.Fecha)
                .Take(8)
                .ToList();

            return stats;
        }

        private async Task<int> GetResearchSubcatIdAsync()
        {
            var researchSubcatId = await _context.SubcategoriasActividades
                .Where(s => s.Subcategoria == "INVESTIGACION")
                .Select(s => s.IdSubcategoria)
                .FirstOrDefaultAsync();
            if (researchSubcatId == 0) researchSubcatId = 7;
            return researchSubcatId;
        }
    }
}
