using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Common.Dtos;
using dosier_application.Common.Interfaces;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Common
{
    public class CatalogsService : ICatalogsService
    {
        private readonly DosierContext _context;

        public CatalogsService(DosierContext context)
        {
            _context = context;
        }

        public async Task<List<ConfigGeneralDto>> GetConfigGeneralAsync(string? prefix = null)
        {
            var query = _context.DocConfigsGenerales.AsNoTracking().AsQueryable();
            if (!string.IsNullOrEmpty(prefix))
            {
                query = query.Where(c => c.Clave.StartsWith(prefix));
            }

            return await query.Select(c => new ConfigGeneralDto
            {
                Clave = c.Clave,
                Valor = c.Valor,
                Descripcion = c.Descripcion
            }).ToListAsync();
        }

        public async Task<List<CarreraCatalogoDto>> GetCarrerasAsync()
        {
            return await _context.Carreras
                .AsNoTracking()
                .Where(c => c.EsInstituto == 1)
                .OrderBy(c => c.Carrera1)
                .Select(c => new CarreraCatalogoDto
                {
                    IdCarrera = c.IdCarrera,
                    Carrera1 = c.Carrera1 ?? string.Empty,
                    AliasCarrera = c.AliasCarrera,
                    CodigoCases = c.CodigoCases,
                    EsInstituto = c.EsInstituto,
                    Activa = c.Activa
                })
                .ToListAsync();
        }

        public async Task<List<CarreraCatalogoDto>> GetMiCarreraAsync(string idReferencia)
        {
            if (string.IsNullOrWhiteSpace(idReferencia))
                return new List<CarreraCatalogoDto>();

            var dbUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi.Trim() == idReferencia.Trim());
            if (dbUser == null)
                return new List<CarreraCatalogoDto>();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var currentPeriod = await _context.Periodos
                .AsNoTracking()
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

                return await profCareersQuery
                    .Select(pc => pc.IdCarreraNavigation!)
                    .Distinct()
                    .OrderBy(c => c.Carrera1)
                    .Select(c => new CarreraCatalogoDto
                    {
                        IdCarrera = c.IdCarrera,
                        Carrera1 = c.Carrera1 ?? string.Empty,
                        AliasCarrera = c.AliasCarrera,
                        CodigoCases = c.CodigoCases,
                        EsInstituto = c.EsInstituto,
                        Activa = c.Activa
                    })
                    .ToListAsync();
            }

            return new List<CarreraCatalogoDto>();
        }

        public async Task<List<PeriodoCatalogoDto>> GetPeriodosAsync()
        {
            return await _context.Periodos
                .AsNoTracking()
                .Where(p => p.EsInstituto == 1)
                .OrderByDescending(p => p.IdPeriodo)
                .Select(p => new PeriodoCatalogoDto
                {
                    IdPeriodo = p.IdPeriodo,
                    Detalle = p.Detalle,
                    FechaInicial = p.FechaInicial,
                    FechaFinal = p.FechaFinal,
                    Activo = p.Activo,
                    Cerrado = p.Cerrado,
                    EsInstituto = p.EsInstituto,
                    Periodoactivoinstituto = p.Periodoactivoinstituto
                })
                .ToListAsync();
        }

        public async Task<PeriodoCatalogoDto> CreatePeriodoAsync(PeriodoMutationDto model)
        {
            if (string.IsNullOrEmpty(model.IdPeriodo))
                throw new ArgumentException("Id de período requerido (ej. 2026-A)");
            if (string.IsNullOrEmpty(model.Detalle))
                throw new ArgumentException("Detalle requerido");

            var entity = new Periodo
            {
                IdPeriodo = model.IdPeriodo,
                Detalle = model.Detalle,
                FechaInicial = model.FechaInicial,
                FechaFinal = model.FechaFinal,
                Activo = true,
                Cerrado = false,
                EsInstituto = 1
            };

            _context.Periodos.Add(entity);
            await _context.SaveChangesAsync();

            return new PeriodoCatalogoDto
            {
                IdPeriodo = entity.IdPeriodo,
                Detalle = entity.Detalle,
                FechaInicial = entity.FechaInicial,
                FechaFinal = entity.FechaFinal,
                Activo = entity.Activo,
                Cerrado = entity.Cerrado,
                EsInstituto = entity.EsInstituto,
                Periodoactivoinstituto = entity.Periodoactivoinstituto
            };
        }

        public async Task<PeriodoCatalogoDto?> UpdatePeriodoAsync(string id, PeriodoMutationDto model)
        {
            var existing = await _context.Periodos.FirstOrDefaultAsync(p => p.IdPeriodo == id && p.EsInstituto == 1);
            if (existing == null) return null;

            existing.Detalle = model.Detalle;
            existing.FechaInicial = model.FechaInicial;
            existing.FechaFinal = model.FechaFinal;
            existing.Activo = model.Activo;
            existing.Cerrado = model.Cerrado;

            await _context.SaveChangesAsync();

            return new PeriodoCatalogoDto
            {
                IdPeriodo = existing.IdPeriodo,
                Detalle = existing.Detalle,
                FechaInicial = existing.FechaInicial,
                FechaFinal = existing.FechaFinal,
                Activo = existing.Activo,
                Cerrado = existing.Cerrado,
                EsInstituto = existing.EsInstituto,
                Periodoactivoinstituto = existing.Periodoactivoinstituto
            };
        }

        public async Task<PeriodoCatalogoDto?> TogglePeriodoAsync(string id)
        {
            var existing = await _context.Periodos.FirstOrDefaultAsync(p => p.IdPeriodo == id && p.EsInstituto == 1);
            if (existing == null) return null;

            existing.Activo = !(existing.Activo ?? true);
            await _context.SaveChangesAsync();

            return new PeriodoCatalogoDto
            {
                IdPeriodo = existing.IdPeriodo,
                Detalle = existing.Detalle,
                FechaInicial = existing.FechaInicial,
                FechaFinal = existing.FechaFinal,
                Activo = existing.Activo,
                Cerrado = existing.Cerrado,
                EsInstituto = existing.EsInstituto,
                Periodoactivoinstituto = existing.Periodoactivoinstituto
            };
        }

        public async Task<List<WorkflowEstadoConfigDto>> GetEstadosConfigAsync()
        {
            return await _context.DocConfigWorkflows
                .AsNoTracking()
                .Where(w => w.Activo)
                .Select(w => new WorkflowEstadoConfigDto
                {
                    Estado = w.EstadoDestino,
                    Etiqueta = w.EtiquetaUi ?? w.EstadoDestino,
                    Color = w.ColorHex ?? "#94A3B8",
                    EsFinal = w.EsEstadoFinal
                })
                .Distinct()
                .ToListAsync();
        }
    }
}
