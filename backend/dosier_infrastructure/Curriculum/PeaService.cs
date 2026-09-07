using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Academico;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;
using dosier_domain.Curriculum.Entities;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Curriculum
{
    public class PeaService : IPeaService
    {
        private readonly DosierContext _context;
        private readonly IAcademicContextResolver _academicContextResolver;
        private readonly IExpedienteCurricularService _expedienteService;

        public PeaService(
            DosierContext context,
            IAcademicContextResolver academicContextResolver,
            IExpedienteCurricularService expedienteService)
        {
            _context = context;
            _academicContextResolver = academicContextResolver;
            _expedienteService = expedienteService;
        }

        public async Task<PeaDto> CrearDesdeAsignacionAsync(int idAsignacion, string idProfesor)
        {
            var academicContext = await _academicContextResolver.ResolveByAssignmentAsync(idAsignacion, idProfesor)
                ?? throw new KeyNotFoundException("No se encontró una asignación académica válida para crear el PEA.");

            var existing = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .Include(p => p.Observaciones)
                .Include(p => p.Trazabilidades)
                .FirstOrDefaultAsync(p => p.IdAsignacion == idAsignacion && p.Activo);

            if (existing != null)
            {
                // Si existe pero no tenía expediente vinculado, vincularlo ahora
                if (!existing.IdExpediente.HasValue)
                {
                    var expExistente = await _expedienteService.ObtenerOCrearExpedienteAsync(idAsignacion, idProfesor);
                    existing.IdExpediente = expExistente.IdExpediente;
                    await _context.SaveChangesAsync();
                }
                return await MapToDtoAsync(existing);
            }

            // Asegurar que exista el Expediente Curricular Institucional
            var expediente = await _expedienteService.ObtenerOCrearExpedienteAsync(idAsignacion, idProfesor);

            var entity = new DocPea
            {
                Uuid = Guid.NewGuid().ToString(),
                IdExpediente = expediente.IdExpediente,
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
                Modalidad = academicContext.NombreModalidad ?? "Presencial",
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

            // Registrar trazabilidad inicial
            await RegistrarTrazabilidadAsync(entity.IdPea, "Nuevo", "Borrador", "Creación inicial del PEA desde asignación de SIGAFI", null, null);

            return await MapToDtoAsync(entity);
        }

        public async Task<PeaDto?> GetByIdAsync(int idPea)
        {
            var pea = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .Include(p => p.Observaciones)
                .Include(p => p.Trazabilidades)
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
                .Include(p => p.Observaciones)
                .Include(p => p.Trazabilidades)
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
                    .Include(p => p.Observaciones)
                    .Include(p => p.Trazabilidades)
                    .FirstOrDefaultAsync(p => p.IdPea == dto.IdPea && p.Activo)
                    ?? throw new KeyNotFoundException($"No se encontró el PEA con id {dto.IdPea}");

                entity.Modalidad = dto.Modalidad;
                if (entity.IdAsignacion == null)
                {
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
                entity.EvaluacionAprendizaje = dto.EvaluacionAprendizaje;
                entity.FechaModificacion = DateTime.UtcNow;

                _context.DocPeaUnidades.RemoveRange(entity.Unidades);
                _context.DocPeaResultadosAprendizaje.RemoveRange(entity.ResultadosAprendizaje);
                _context.DocPeaActividadesPracticas.RemoveRange(entity.ActividadesPracticas);
                _context.DocPeaBibliografias.RemoveRange(entity.Bibliografias);
            }
            else
            {
                entity = new DocPea
                {
                    Uuid = Guid.NewGuid().ToString(),
                    IdExpediente = dto.IdExpediente,
                    IdCarrera = dto.IdCarrera,
                    IdAsignatura = dto.IdAsignatura,
                    IdPeriodo = dto.IdPeriodo,
                    IdAsignacion = dto.IdAsignacion,
                    IdDocenteElaborador = dto.IdDocenteElaborador,
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
                    EvaluacionAprendizaje = dto.EvaluacionAprendizaje,
                    Estado = "Borrador",
                    Version = 1,
                    Activo = true
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

        public async Task<bool> CambiarEstadoAsync(int idPea, string nuevoEstado, string? firmaDocente, string? idUsuario, string? motivo = null)
        {
            var entity = await _context.DocPeas
                .Include(p => p.Unidades)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo);

            if (entity == null) return false;

            string estadoAnterior = entity.Estado;
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

            // Calcular hash forense del contenido en la transición
            string hashSha256 = CalcularHashSha256(entity);
            int? idUserInt = int.TryParse(idUsuario, out int u) ? u : null;

            await RegistrarTrazabilidadAsync(idPea, estadoAnterior, nuevoEstado, motivo ?? $"Transición de estado a {nuevoEstado}", hashSha256, idUserInt);

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

        // =====================================================================
        // WORKFLOW COLEGIADO DE OBSERVACIONES Y TRAZABILIDAD
        // =====================================================================

        public async Task<PeaObservacionDto> AgregarObservacionAsync(int idPea, string rolObservador, string seccion, string texto, int? idUsuario)
        {
            var pea = await _context.DocPeas.FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo)
                ?? throw new KeyNotFoundException($"No se encontró el PEA con id {idPea}");

            var obs = new DocPeaObservacion
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = idPea,
                IdUsuarioObservador = idUsuario,
                RolObservador = rolObservador,
                SeccionAfectada = seccion,
                TextoObservacion = texto,
                Estado = "Pendiente",
                FechaObservacion = DateTime.UtcNow
            };

            _context.DocPeaObservaciones.Add(obs);

            // Si el PEA estaba en revisión, pasa a Observado
            if (pea.Estado == "EnRevision")
            {
                pea.Estado = "Observado";
                await RegistrarTrazabilidadAsync(idPea, "EnRevision", "Observado", $"Observación en sección {seccion}: {texto}", null, idUsuario);
            }

            await _context.SaveChangesAsync();

            return new PeaObservacionDto
            {
                IdObservacion = obs.IdObservacion,
                Uuid = obs.Uuid,
                IdPea = obs.IdPea,
                IdUsuarioObservador = obs.IdUsuarioObservador,
                RolObservador = obs.RolObservador,
                SeccionAfectada = obs.SeccionAfectada,
                TextoObservacion = obs.TextoObservacion,
                Estado = obs.Estado,
                FechaObservacion = obs.FechaObservacion
            };
        }

        public async Task<bool> SubsanarObservacionAsync(int idObservacion, string respuestaDocente, int? idUsuario)
        {
            var obs = await _context.DocPeaObservaciones.FirstOrDefaultAsync(o => o.IdObservacion == idObservacion);
            if (obs == null) return false;

            obs.Estado = "Subsanada";
            obs.RespuestaDocente = respuestaDocente;
            obs.FechaResolucion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Verificar si quedan observaciones pendientes en el PEA
            var pendientes = await _context.DocPeaObservaciones
                .CountAsync(o => o.IdPea == obs.IdPea && o.Estado == "Pendiente");

            if (pendientes == 0)
            {
                var pea = await _context.DocPeas.FirstOrDefaultAsync(p => p.IdPea == obs.IdPea);
                if (pea != null && pea.Estado == "Observado")
                {
                    pea.Estado = "Corregido";
                    await RegistrarTrazabilidadAsync(obs.IdPea, "Observado", "Corregido", "Todas las observaciones fueron subsanadas por el docente", null, idUsuario);
                    await _context.SaveChangesAsync();
                }
            }

            return true;
        }

        public async Task<List<PeaObservacionDto>> GetObservacionesByPeaAsync(int idPea)
        {
            var list = await _context.DocPeaObservaciones
                .AsNoTracking()
                .Where(o => o.IdPea == idPea)
                .OrderByDescending(o => o.FechaObservacion)
                .ToListAsync();

            var dtos = new List<PeaObservacionDto>();
            foreach (var o in list)
            {
                string? nombreUsuario = null;
                if (o.IdUsuarioObservador.HasValue)
                {
                    var u = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.IdUsuario == o.IdUsuarioObservador.Value);
                    if (u != null) nombreUsuario = u.Nombre;
                }

                dtos.Add(new PeaObservacionDto
                {
                    IdObservacion = o.IdObservacion,
                    Uuid = o.Uuid,
                    IdPea = o.IdPea,
                    IdUsuarioObservador = o.IdUsuarioObservador,
                    NombreObservador = nombreUsuario,
                    RolObservador = o.RolObservador,
                    SeccionAfectada = o.SeccionAfectada,
                    TextoObservacion = o.TextoObservacion,
                    Estado = o.Estado,
                    RespuestaDocente = o.RespuestaDocente,
                    FechaObservacion = o.FechaObservacion,
                    FechaResolucion = o.FechaResolucion
                });
            }

            return dtos;
        }

        public async Task<List<PeaTrazabilidadDto>> GetTrazabilidadByPeaAsync(int idPea)
        {
            var list = await _context.DocPeaTrazabilidades
                .AsNoTracking()
                .Where(t => t.IdPea == idPea)
                .OrderByDescending(t => t.FechaTransicion)
                .ToListAsync();

            var dtos = new List<PeaTrazabilidadDto>();
            foreach (var t in list)
            {
                string? nombreUsuario = null;
                if (t.IdUsuario.HasValue)
                {
                    var u = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.IdUsuario == t.IdUsuario.Value);
                    if (u != null) nombreUsuario = u.Nombre;
                }

                dtos.Add(new PeaTrazabilidadDto
                {
                    IdTrazabilidad = t.IdTrazabilidad,
                    Uuid = t.Uuid,
                    IdPea = t.IdPea,
                    IdUsuario = t.IdUsuario,
                    NombreUsuario = nombreUsuario,
                    EstadoAnterior = t.EstadoAnterior,
                    EstadoNuevo = t.EstadoNuevo,
                    Motivo = t.Motivo,
                    HashIntegridadSha256 = t.HashIntegridadSha256,
                    FechaTransicion = t.FechaTransicion
                });
            }

            return dtos;
        }

        private async Task RegistrarTrazabilidadAsync(int idPea, string anterior, string nuevo, string? motivo, string? hashSha256, int? idUsuario)
        {
            var traza = new DocPeaTrazabilidad
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = idPea,
                IdUsuario = idUsuario,
                EstadoAnterior = anterior,
                EstadoNuevo = nuevo,
                Motivo = motivo,
                HashIntegridadSha256 = hashSha256,
                FechaTransicion = DateTime.UtcNow
            };

            _context.DocPeaTrazabilidades.Add(traza);
            await _context.SaveChangesAsync();
        }

        private static string CalcularHashSha256(DocPea pea)
        {
            var payload = new
            {
                pea.IdPea,
                pea.Uuid,
                pea.IdCarrera,
                pea.IdAsignatura,
                pea.IdPeriodo,
                pea.Version,
                pea.Estado,
                pea.TotalHorasAsignatura,
                pea.Creditos,
                pea.ObjetivoAsignatura,
                pea.MetodologiaEnsenanza,
                pea.EvaluacionAprendizaje,
                UnidadesCount = pea.Unidades.Count,
                RdaCount = pea.ResultadosAprendizaje.Count
            };

            string json = JsonSerializer.Serialize(payload);
            using var sha = SHA256.Create();
            byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(json));
            return Convert.ToHexString(bytes).ToLowerInvariant();
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
                IdExpediente = pea.IdExpediente,
                IdCarrera = pea.IdCarrera,
                NombreCarrera = carrera?.Carrera1 ?? "Carrera ISTPET",
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
                EvaluacionAprendizaje = pea.EvaluacionAprendizaje,
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
                }).ToList(),
                Observaciones = pea.Observaciones.OrderByDescending(o => o.FechaObservacion).Select(o => new PeaObservacionDto
                {
                    IdObservacion = o.IdObservacion,
                    Uuid = o.Uuid,
                    IdPea = o.IdPea,
                    IdUsuarioObservador = o.IdUsuarioObservador,
                    RolObservador = o.RolObservador,
                    SeccionAfectada = o.SeccionAfectada,
                    TextoObservacion = o.TextoObservacion,
                    Estado = o.Estado,
                    RespuestaDocente = o.RespuestaDocente,
                    FechaObservacion = o.FechaObservacion,
                    FechaResolucion = o.FechaResolucion
                }).ToList(),
                Trazabilidades = pea.Trazabilidades.OrderByDescending(t => t.FechaTransicion).Select(t => new PeaTrazabilidadDto
                {
                    IdTrazabilidad = t.IdTrazabilidad,
                    Uuid = t.Uuid,
                    IdPea = t.IdPea,
                    IdUsuario = t.IdUsuario,
                    EstadoAnterior = t.EstadoAnterior,
                    EstadoNuevo = t.EstadoNuevo,
                    Motivo = t.Motivo,
                    HashIntegridadSha256 = t.HashIntegridadSha256,
                    FechaTransicion = t.FechaTransicion
                }).ToList()
            };
        }
    }
}
