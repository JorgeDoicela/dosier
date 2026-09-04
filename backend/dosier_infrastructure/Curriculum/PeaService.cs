using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;
using dosier_domain.Curriculum.Entities;
using dosier_infrastructure.data.models;
using dosier_application.Academico;
using System.Text.Json;

namespace dosier_infrastructure.Curriculum
{
    public class PeaService : IPeaService
    {
        private readonly DosierContext _context;
        private readonly IAcademicContextResolver _academicContextResolver;

        public PeaService(DosierContext context, IAcademicContextResolver academicContextResolver)
        {
            _context = context;
            _academicContextResolver = academicContextResolver;
        }

        public async Task<PeaDto> CrearDesdeAsignacionAsync(int idAsignacion, string idProfesor)
        {
            var academicContext = await _academicContextResolver.ResolveByAssignmentAsync(idAsignacion, idProfesor)
                ?? throw new KeyNotFoundException("No se encontro una asignacion academica valida para crear el PEA.");

            var existing = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .FirstOrDefaultAsync(p => p.IdAsignacion == idAsignacion && p.Activo);
            if (existing != null)
                return await MapToDtoAsync(existing);

            var entity = new DocPea
            {
                Uuid = Guid.NewGuid().ToString(),
                IdAsignacion = academicContext.IdAsignacion,
                IdMalla = academicContext.IdMalla,
                IdDetalleMalla = academicContext.IdDetalleMalla,
                IdCarrera = academicContext.IdCarrera,
                IdAsignatura = academicContext.IdAsignatura,
                IdPeriodo = academicContext.IdPeriodo,
                IdNivel = academicContext.IdNivel,
                IdModalidad = academicContext.IdModalidad,
                IdSeccion = academicContext.IdSeccion,
                Paralelo = academicContext.Paralelo,
                FuenteMalla = academicContext.FuenteMalla,
                SnapshotCurricularJson = JsonSerializer.Serialize(academicContext),
                IdDocenteElaborador = academicContext.IdProfesor,
                Modalidad = academicContext.NombreModalidad ?? "Sin modalidad",
                UnidadOrganizacion = academicContext.UnidadOrganizacionCurricular,
                SemestreNivel = academicContext.NombreNivel,
                TotalHorasAsignatura = academicContext.HorasTotales,
                Creditos = academicContext.Creditos,
                HorasContactoDocente = decimal.ToInt32(academicContext.HorasDocencia),
                HorasPracticoExperimental = decimal.ToInt32(academicContext.HorasPracticoExperimental),
                HorasAutonomo = decimal.ToInt32(academicContext.HorasAutonomo),
                Estado = "Borrador",
                Version = 1,
                Activo = true
            };

            _context.DocPeas.Add(entity);
            await _context.SaveChangesAsync();
            return await MapToDtoAsync(entity);
        }

        public async Task<PeaDto?> GetByIdAsync(int idPea)
        {
            var pea = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo);

            if (pea == null) return null;
            return await MapToDtoAsync(pea);
        }

        public async Task<PeaDto?> GetByAsignaturaPeriodoAsync(int idAsignatura, string idPeriodo)
        {
            var pea = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .FirstOrDefaultAsync(p => p.IdAsignatura == idAsignatura && p.IdPeriodo == idPeriodo && p.Activo);

            if (pea == null) return null;
            return await MapToDtoAsync(pea);
        }

        public async Task<PeaDto> GuardarPeaAsync(PeaDto dto, string? idUsuarioModificador)
        {
            DocPea entity;

            if (dto.IdPea > 0)
            {
                entity = await _context.DocPeas
                    .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                    .Include(p => p.ResultadosAprendizaje)
                    .Include(p => p.ActividadesPracticas)
                    .Include(p => p.Bibliografias)
                    .FirstOrDefaultAsync(p => p.IdPea == dto.IdPea && p.Activo)
                    ?? throw new KeyNotFoundException($"No se encontró el PEA con id {dto.IdPea}");

                entity.Modalidad = dto.Modalidad;
                if (entity.IdAsignacion == null)
                {
                    // Compatibilidad temporal con borradores creados antes de la integracion SIGAFI.
                    entity.UnidadOrganizacion = dto.UnidadOrganizacion;
                    entity.SemestreNivel = dto.SemestreNivel;
                    entity.TotalHorasAsignatura = dto.TotalHorasAsignatura;
                    entity.Creditos = dto.Creditos;
                    entity.HorasContactoDocente = dto.HorasContactoDocente;
                    entity.HorasPracticoExperimental = dto.HorasPracticoExperimental;
                    entity.HorasAutonomo = dto.HorasAutonomo;
                }
                entity.ObjetivoAsignatura = dto.ObjetivoAsignatura;
                entity.MetodologiaEnsenanza = dto.MetodologiaEnsenanza;
                entity.RecursosDidacticos = dto.RecursosDidacticos;
                entity.FechaModificacion = DateTime.UtcNow;

                _context.DocPeaBibliografias.RemoveRange(entity.Bibliografias);
                _context.DocPeaActividadesPracticas.RemoveRange(entity.ActividadesPracticas);
                _context.DocPeaResultadosAprendizaje.RemoveRange(entity.ResultadosAprendizaje);
                _context.DocPeaUnidades.RemoveRange(entity.Unidades);
            }
            else
            {
                entity = new DocPea
                {
                    Uuid = Guid.NewGuid().ToString(),
                    IdCarrera = dto.IdCarrera,
                    IdAsignatura = dto.IdAsignatura,
                    IdPeriodo = dto.IdPeriodo,
                    IdDocenteElaborador = dto.IdDocenteElaborador ?? idUsuarioModificador,
                    Modalidad = dto.Modalidad,
                    UnidadOrganizacion = dto.UnidadOrganizacion,
                    SemestreNivel = dto.SemestreNivel,
                    TotalHorasAsignatura = dto.TotalHorasAsignatura,
                    Creditos = dto.Creditos,
                    HorasContactoDocente = dto.HorasContactoDocente,
                    HorasPracticoExperimental = dto.HorasPracticoExperimental,
                    HorasAutonomo = dto.HorasAutonomo,
                    ObjetivoAsignatura = dto.ObjetivoAsignatura,
                    MetodologiaEnsenanza = dto.MetodologiaEnsenanza,
                    RecursosDidacticos = dto.RecursosDidacticos,
                    Estado = "Borrador",
                    Version = 1,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow,
                    FechaModificacion = DateTime.UtcNow
                };
                _context.DocPeas.Add(entity);
            }

            // Unidades y Temas
            entity.Unidades = dto.Unidades.Select(u => new DocPeaUnidad
            {
                Uuid = Guid.NewGuid().ToString(),
                NumeroUnidad = u.NumeroUnidad,
                NombreUnidad = u.NombreUnidad,
                TotalHorasUnidad = u.TotalHorasUnidad,
                HorasDocencia = u.HorasDocencia,
                HorasPracticoExp = u.HorasPracticoExp,
                HorasAutonomo = u.HorasAutonomo,
                Orden = u.Orden,
                Temas = u.Temas.Select(t => new DocPeaTema
                {
                    Uuid = Guid.NewGuid().ToString(),
                    NumeroTema = t.NumeroTema,
                    TituloTema = t.TituloTema,
                    DescripcionSubtemas = t.DescripcionSubtemas,
                    Orden = t.Orden
                }).ToList()
            }).ToList();

            // RDAs
            entity.ResultadosAprendizaje = dto.ResultadosAprendizaje.Select(r => new DocPeaResultadoAprendizaje
            {
                Uuid = Guid.NewGuid().ToString(),
                TipoRda = r.TipoRda,
                CodigoRda = r.CodigoRda,
                Descripcion = r.Descripcion,
                NivelDesarrollo = r.NivelDesarrollo,
                Orden = r.Orden
            }).ToList();

            // Prácticas
            entity.ActividadesPracticas = dto.ActividadesPracticas.Select(p => new DocPeaActividadPractica
            {
                Uuid = Guid.NewGuid().ToString(),
                NumeroPractica = p.NumeroPractica,
                NombrePractica = p.NombrePractica,
                Caracterizacion = p.Caracterizacion,
                DuracionHoras = p.DuracionHoras,
                Orden = p.Orden
            }).ToList();

            // Bibliografía
            entity.Bibliografias = dto.Bibliografias.Select(b => new DocPeaBibliografia
            {
                Uuid = Guid.NewGuid().ToString(),
                TipoBibliografia = b.TipoBibliografia,
                Autor = b.Autor,
                Anio = b.Anio,
                TituloLibro = b.TituloLibro,
                EditorialCiudad = b.EditorialCiudad,
                Isbn = b.Isbn,
                UrlRecurso = b.UrlRecurso,
                CitaCompletaApa = b.CitaCompletaApa,
                Orden = b.Orden
            }).ToList();

            await _context.SaveChangesAsync();
            return await MapToDtoAsync(entity);
        }

        public async Task<bool> CambiarEstadoAsync(int idPea, string nuevoEstado, string? firmaDocente, string? idUsuario)
        {
            var entity = await _context.DocPeas.FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo);
            if (entity == null) return false;

            entity.Estado = nuevoEstado;
            entity.FechaModificacion = DateTime.UtcNow;

            if (nuevoEstado == "EnRevision" && !string.IsNullOrEmpty(firmaDocente))
            {
                entity.FirmaElaboradoDocente = firmaDocente;
                entity.FechaElaborado = DateTime.UtcNow;
            }
            else if (nuevoEstado == "Aprobado")
            {
                entity.FirmaAprobadoVicerrector = firmaDocente;
                entity.FechaAprobado = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PeaDto> ClonarPeaPeriodoAsync(int idPeaOrigen, string nuevoPeriodo, string? idUsuario)
        {
            var origen = await GetByIdAsync(idPeaOrigen) 
                ?? throw new KeyNotFoundException("No se encontró el PEA original para clonar.");

            origen.IdPea = 0;
            origen.Uuid = Guid.NewGuid().ToString();
            origen.IdPeriodo = nuevoPeriodo;
            origen.IdDocenteElaborador = idUsuario;
            origen.Estado = "Borrador";
            origen.Version = 1;

            return await GuardarPeaAsync(origen, idUsuario);
        }

        private async Task<PeaDto> MapToDtoAsync(DocPea pea)
        {
            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == pea.IdCarrera);
            var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura);
            var docente = !string.IsNullOrEmpty(pea.IdDocenteElaborador) 
                ? await _context.Profesores.AsNoTracking().FirstOrDefaultAsync(p => p.IdProfesor == pea.IdDocenteElaborador)
                : null;

            return new PeaDto
            {
                IdPea = pea.IdPea,
                Uuid = pea.Uuid,
                IdCarrera = pea.IdCarrera,
                NombreCarrera = carrera?.Carrera1 ?? "Carrera",
                IdAsignatura = pea.IdAsignatura,
                NombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura",
                CodigoAsignatura = asignatura?.Codigo,
                IdPeriodo = pea.IdPeriodo,
                IdAsignacion = pea.IdAsignacion,
                IdMalla = pea.IdMalla,
                IdDetalleMalla = pea.IdDetalleMalla,
                IdNivel = pea.IdNivel,
                IdModalidad = pea.IdModalidad,
                IdSeccion = pea.IdSeccion,
                Paralelo = pea.Paralelo,
                FuenteMalla = pea.FuenteMalla,
                IdDocenteElaborador = pea.IdDocenteElaborador,
                NombreDocenteElaborador = docente != null ? $"{docente.Nombres} {docente.Apellidos}".Trim() : null,
                Modalidad = pea.Modalidad,
                UnidadOrganizacion = pea.UnidadOrganizacion,
                SemestreNivel = pea.SemestreNivel,
                TotalHorasAsignatura = pea.TotalHorasAsignatura,
                Creditos = pea.Creditos,
                HorasContactoDocente = pea.HorasContactoDocente,
                HorasPracticoExperimental = pea.HorasPracticoExperimental,
                HorasAutonomo = pea.HorasAutonomo,
                ObjetivoAsignatura = pea.ObjetivoAsignatura,
                MetodologiaEnsenanza = pea.MetodologiaEnsenanza,
                RecursosDidacticos = pea.RecursosDidacticos,
                Estado = pea.Estado,
                Version = pea.Version,
                Activo = pea.Activo,
                Unidades = pea.Unidades.OrderBy(u => u.Orden).Select(u => new PeaUnidadDto
                {
                    IdUnidad = u.IdUnidad,
                    Uuid = u.Uuid,
                    IdPea = u.IdPea,
                    NumeroUnidad = u.NumeroUnidad,
                    NombreUnidad = u.NombreUnidad,
                    TotalHorasUnidad = u.TotalHorasUnidad,
                    HorasDocencia = u.HorasDocencia,
                    HorasPracticoExp = u.HorasPracticoExp,
                    HorasAutonomo = u.HorasAutonomo,
                    Orden = u.Orden,
                    Temas = u.Temas.OrderBy(t => t.Orden).Select(t => new PeaTemaDto
                    {
                        IdTema = t.IdTema,
                        Uuid = t.Uuid,
                        IdUnidad = t.IdUnidad,
                        NumeroTema = t.NumeroTema,
                        TituloTema = t.TituloTema,
                        DescripcionSubtemas = t.DescripcionSubtemas,
                        Orden = t.Orden
                    }).ToList()
                }).ToList(),
                ResultadosAprendizaje = pea.ResultadosAprendizaje.OrderBy(r => r.Orden).Select(r => new PeaResultadoAprendizajeDto
                {
                    IdRda = r.IdRda,
                    Uuid = r.Uuid,
                    IdPea = r.IdPea,
                    TipoRda = r.TipoRda,
                    CodigoRda = r.CodigoRda,
                    Descripcion = r.Descripcion,
                    NivelDesarrollo = r.NivelDesarrollo,
                    Orden = r.Orden
                }).ToList(),
                ActividadesPracticas = pea.ActividadesPracticas.OrderBy(p => p.Orden).Select(p => new PeaActividadPracticaDto
                {
                    IdPractica = p.IdPractica,
                    Uuid = p.Uuid,
                    IdPea = p.IdPea,
                    IdUnidad = p.IdUnidad,
                    NumeroPractica = p.NumeroPractica,
                    NombrePractica = p.NombrePractica,
                    Caracterizacion = p.Caracterizacion,
                    DuracionHoras = p.DuracionHoras,
                    Orden = p.Orden
                }).ToList(),
                Bibliografias = pea.Bibliografias.OrderBy(b => b.Orden).Select(b => new PeaBibliografiaDto
                {
                    IdBiblio = b.IdBiblio,
                    Uuid = b.Uuid,
                    IdPea = b.IdPea,
                    TipoBibliografia = b.TipoBibliografia,
                    Autor = b.Autor,
                    Anio = b.Anio,
                    TituloLibro = b.TituloLibro,
                    EditorialCiudad = b.EditorialCiudad,
                    Isbn = b.Isbn,
                    UrlRecurso = b.UrlRecurso,
                    CitaCompletaApa = b.CitaCompletaApa,
                    Orden = b.Orden
                }).ToList()
            };
        }
    }
}
