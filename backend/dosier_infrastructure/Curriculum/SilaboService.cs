using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;
using dosier_domain.Curriculum.Entities;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Curriculum
{
    public class SilaboService : ISilaboService
    {
        private readonly DosierContext _context;
        private readonly IPeaService _peaService;

        public SilaboService(DosierContext context, IPeaService peaService)
        {
            _context = context;
            _peaService = peaService;
        }

        public async Task<SilaboDto?> GetByIdAsync(int idSilabo)
        {
            var silabo = await _context.DocSilabos
                .Include(s => s.Semanas)
                .Include(s => s.Adaptaciones)
                .FirstOrDefaultAsync(s => s.IdSilabo == idSilabo && s.Activo);

            if (silabo == null) return null;
            return await MapToDtoAsync(silabo);
        }

        public async Task<SilaboDto?> GetByPeaIdAsync(int idPea)
        {
            var silabo = await _context.DocSilabos
                .Include(s => s.Semanas)
                .Include(s => s.Adaptaciones)
                .FirstOrDefaultAsync(s => s.IdPea == idPea && s.Activo);

            if (silabo == null) return null;
            return await MapToDtoAsync(silabo);
        }

        public async Task<SilaboDto> GenerarSilaboDesdePeaAsync(int idPea, string? idUsuario)
        {
            var pea = await _peaService.GetByIdAsync(idPea) 
                ?? throw new KeyNotFoundException($"No se encontró el PEA con id {idPea}");

            var silaboExistente = await _context.DocSilabos
                .Include(s => s.Semanas)
                .FirstOrDefaultAsync(s => s.IdPea == idPea && s.Activo);

            if (silaboExistente != null)
            {
                return await MapToDtoAsync(silaboExistente);
            }

            var semanasList = new List<DocSilaboSemana>();
            var todosLosTemas = pea.Unidades.SelectMany(u => u.Temas.Select(t => new { u.IdUnidad, u.NombreUnidad, t.NumeroTema, t.TituloTema })).ToList();
            int temaIndex = 0;

            for (int sem = 1; sem <= 19; sem++)
            {
                var semana = new DocSilaboSemana
                {
                    Uuid = Guid.NewGuid().ToString(),
                    NumeroSemana = sem,
                    DocenciaMetodologia = "Clase magistral interactiva, resolución guiada de problemas y discusión",
                    PracticoExperimental = "Desarrollo de práctica de taller/laboratorio en equipos guiados",
                    ActividadesAutonomas = "Lectura de compendio, investigación y resolución de cuestionario en aula virtual"
                };

                if (sem == 9)
                {
                    semana.ContenidosTemas = "EVALUACIÓN PRIMER PARCIAL — Consolidación y examen sumativo de Unidad 1";
                    semana.EsHitoEvaluativo = true;
                    semana.CalificacionEvaluativa = "E1: 10.00 pts";
                    semana.ActividadesAutonomas = "E.1 Examen Primer Parcial (Plataforma Virtual/Presencial)";
                }
                else if (sem == 18)
                {
                    semana.ContenidosTemas = "EVALUACIÓN SEGUNDO PARCIAL — Consolidación y examen sumativo de Unidad 2 y 3";
                    semana.EsHitoEvaluativo = true;
                    semana.CalificacionEvaluativa = "E2: 10.00 pts";
                    semana.ActividadesAutonomas = "E.2 Examen Segundo Parcial (Evaluación Sumativa)";
                }
                else if (sem == 19)
                {
                    semana.ContenidosTemas = "EVALUACIÓN FINAL DE LA ASIGNATURA — Examen final y entrega de portafolio académico";
                    semana.EsHitoEvaluativo = true;
                    semana.CalificacionEvaluativa = "E3: 10.00 pts";
                    semana.ActividadesAutonomas = "E.3 Examen Final y Cierre de Portafolio Docente";
                }
                else
                {
                    if (temaIndex < todosLosTemas.Count)
                    {
                        var t = todosLosTemas[temaIndex];
                        semana.IdUnidad = t.IdUnidad;
                        semana.ContenidosTemas = $"Tema {t.NumeroTema}: {t.TituloTema}";
                        temaIndex++;
                    }
                    else
                    {
                        semana.ContenidosTemas = $"Semana {sem}: Refuerzo pedagógico, retroalimentación y aplicación práctica";
                    }
                }

                semanasList.Add(semana);
            }

            var nuevoSilabo = new DocSilabo
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = idPea,
                IdPeriodo = pea.IdPeriodo,
                IdDocenteResponsable = pea.IdDocenteElaborador ?? idUsuario,
                PorcentajeDocencia = 40.00m,
                PorcentajePractico = 30.00m,
                PorcentajeAutonomo = 30.00m,
                HorasSemanaDocencia = (decimal)(pea.HorasContactoDocente) / 16.0m,
                HorasSemanaPractico = (decimal)(pea.HorasPracticoExperimental) / 16.0m,
                HorasSemanaAutonomo = (decimal)(pea.HorasAutonomo) / 16.0m,
                AplicaAdaptacion = false,
                Estado = "Borrador",
                Version = 1,
                Activo = true,
                FechaCreacion = DateTime.UtcNow,
                FechaModificacion = DateTime.UtcNow,
                Semanas = semanasList
            };

            _context.DocSilabos.Add(nuevoSilabo);
            await _context.SaveChangesAsync();

            return await MapToDtoAsync(nuevoSilabo);
        }

        public async Task<SilaboDto> GuardarSilaboAsync(SilaboDto dto, string? idUsuarioModificador)
        {
            var entity = await _context.DocSilabos
                .Include(s => s.Semanas)
                .Include(s => s.Adaptaciones)
                .FirstOrDefaultAsync(s => s.IdSilabo == dto.IdSilabo && s.Activo)
                ?? throw new KeyNotFoundException($"No se encontró el Sílabo con id {dto.IdSilabo}");

            entity.HorarioTutoria = dto.HorarioTutoria;
            entity.EmailDocente = dto.EmailDocente;
            entity.PorcentajeDocencia = dto.PorcentajeDocencia ?? 40.00m;
            entity.PorcentajePractico = dto.PorcentajePractico ?? 30.00m;
            entity.PorcentajeAutonomo = dto.PorcentajeAutonomo ?? 30.00m;
            entity.HorasSemanaDocencia = dto.HorasSemanaDocencia ?? 0m;
            entity.HorasSemanaPractico = dto.HorasSemanaPractico ?? 0m;
            entity.HorasSemanaAutonomo = dto.HorasSemanaAutonomo ?? 0m;
            entity.AplicaAdaptacion = dto.AplicaAdaptacion;
            entity.DetalleAdaptacion = dto.DetalleAdaptacion;
            entity.RecursosDidacticos = dto.RecursosDidacticos;
            entity.FechaModificacion = DateTime.UtcNow;

            foreach (var semDto in dto.Semanas)
            {
                var semEntity = entity.Semanas.FirstOrDefault(s => s.NumeroSemana == semDto.NumeroSemana);
                if (semEntity != null)
                {
                    semEntity.IdUnidad = semDto.IdUnidad;
                    semEntity.ContenidosTemas = semDto.ContenidosTemas;
                    semEntity.DocenciaMetodologia = semDto.DocenciaMetodologia;
                    semEntity.PracticoExperimental = semDto.PracticoExperimental;
                    semEntity.ActividadesAutonomas = semDto.ActividadesAutonomas;
                    semEntity.IdRdaEvaluado = semDto.IdRdaEvaluado;
                    semEntity.CalificacionEvaluativa = semDto.CalificacionEvaluativa;
                    semEntity.EsHitoEvaluativo = semDto.EsHitoEvaluativo;
                }
            }

            _context.DocSilaboAdaptaciones.RemoveRange(entity.Adaptaciones);
            entity.Adaptaciones = dto.Adaptaciones.Select(a => new DocSilaboAdaptacion
            {
                Uuid = Guid.NewGuid().ToString(),
                EstudianteId = a.EstudianteId,
                TipoNecesidad = a.TipoNecesidad,
                AdaptacionAplicada = a.AdaptacionAplicada,
                FechaRegistro = DateTime.UtcNow
            }).ToList();

            await _context.SaveChangesAsync();
            return await MapToDtoAsync(entity);
        }

        public async Task<bool> CambiarEstadoAsync(int idSilabo, string nuevoEstado, string? firma, string? idUsuario)
        {
            var entity = await _context.DocSilabos.FirstOrDefaultAsync(s => s.IdSilabo == idSilabo && s.Activo);
            if (entity == null) return false;

            entity.Estado = nuevoEstado;
            entity.FechaModificacion = DateTime.UtcNow;

            if (nuevoEstado == "EnRevision" && !string.IsNullOrEmpty(firma))
            {
                entity.FirmaElaboradoDocente = firma;
                entity.FechaElaborado = DateTime.UtcNow;
            }
            else if (nuevoEstado == "Aprobado")
            {
                entity.FirmaAprobadoAcad = firma;
                entity.FechaAprobado = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<SilaboDto> MapToDtoAsync(DocSilabo silabo)
        {
            var pea = await _context.DocPeas.AsNoTracking().FirstOrDefaultAsync(p => p.IdPea == silabo.IdPea);
            var asignatura = pea != null ? await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura) : null;
            var carrera = pea != null ? await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == pea.IdCarrera) : null;
            var docente = !string.IsNullOrEmpty(silabo.IdDocenteResponsable)
                ? await _context.Profesores.AsNoTracking().FirstOrDefaultAsync(p => p.IdProfesor == silabo.IdDocenteResponsable)
                : null;

            return new SilaboDto
            {
                IdSilabo = silabo.IdSilabo,
                Uuid = silabo.Uuid,
                IdPea = silabo.IdPea,
                NombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura",
                NombreCarrera = carrera?.Carrera1 ?? "Carrera",
                IdPeriodo = silabo.IdPeriodo,
                IdDocenteResponsable = silabo.IdDocenteResponsable,
                NombreDocenteResponsable = docente != null ? $"{docente.Nombres} {docente.Apellidos}".Trim() : null,
                HorarioTutoria = silabo.HorarioTutoria,
                EmailDocente = silabo.EmailDocente,
                PorcentajeDocencia = silabo.PorcentajeDocencia,
                PorcentajePractico = silabo.PorcentajePractico,
                PorcentajeAutonomo = silabo.PorcentajeAutonomo,
                HorasSemanaDocencia = silabo.HorasSemanaDocencia,
                HorasSemanaPractico = silabo.HorasSemanaPractico,
                HorasSemanaAutonomo = silabo.HorasSemanaAutonomo,
                AplicaAdaptacion = silabo.AplicaAdaptacion,
                DetalleAdaptacion = silabo.DetalleAdaptacion,
                RecursosDidacticos = silabo.RecursosDidacticos,
                Estado = silabo.Estado,
                Version = silabo.Version,
                Activo = silabo.Activo,
                Semanas = silabo.Semanas.OrderBy(s => s.NumeroSemana).Select(s => new SilaboSemanaDto
                {
                    IdSemana = s.IdSemana,
                    Uuid = s.Uuid,
                    IdSilabo = s.IdSilabo,
                    NumeroSemana = s.NumeroSemana,
                    IdUnidad = s.IdUnidad,
                    ContenidosTemas = s.ContenidosTemas,
                    DocenciaMetodologia = s.DocenciaMetodologia,
                    PracticoExperimental = s.PracticoExperimental,
                    ActividadesAutonomas = s.ActividadesAutonomas,
                    IdRdaEvaluado = s.IdRdaEvaluado,
                    CalificacionEvaluativa = s.CalificacionEvaluativa,
                    EsHitoEvaluativo = s.EsHitoEvaluativo
                }).ToList(),
                Adaptaciones = silabo.Adaptaciones.Select(a => new SilaboAdaptacionDto
                {
                    IdAdaptacion = a.IdAdaptacion,
                    Uuid = a.Uuid,
                    IdSilabo = a.IdSilabo,
                    EstudianteId = a.EstudianteId,
                    TipoNecesidad = a.TipoNecesidad,
                    AdaptacionAplicada = a.AdaptacionAplicada,
                    FechaRegistro = a.FechaRegistro
                }).ToList()
            };
        }
    }
}
