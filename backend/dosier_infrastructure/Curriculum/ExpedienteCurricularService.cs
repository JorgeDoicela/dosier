using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Academico;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;
using dosier_domain.Curriculum.Entities;
using dosier_infrastructure.data.models;
using dosier_infrastructure.data.models.Cowork;
using Dosier.Application.Common.Documents;

namespace dosier_infrastructure.Curriculum
{
    public class ExpedienteCurricularService : IExpedienteCurricularService
    {
        private readonly DosierContext _context;
        private readonly IAcademicContextResolver _academicContextResolver;
        private readonly INormativaService _normativaService;
        private readonly IPerfilEgresoService _perfilEgresoService;
        private readonly IDocumentEngine _documentEngine;

        public ExpedienteCurricularService(
            DosierContext context,
            IAcademicContextResolver academicContextResolver,
            INormativaService normativaService,
            IPerfilEgresoService perfilEgresoService,
            IDocumentEngine documentEngine)
        {
            _context = context;
            _academicContextResolver = academicContextResolver;
            _normativaService = normativaService;
            _perfilEgresoService = perfilEgresoService;
            _documentEngine = documentEngine;
        }

        public async Task<ExpedienteCurricularDto?> GetByIdAsync(int idExpediente)
        {
            var exp = await _context.DocExpedientesCurriculares
                .AsNoTracking()
                .Include(e => e.ModeloEducativo)
                .Include(e => e.ProyectoCurricular)
                .Include(e => e.Peas.Where(p => p.Activo))
                .FirstOrDefaultAsync(e => e.IdExpediente == idExpediente);

            if (exp == null) return null;

            return await MapearDtoAsync(exp);
        }

        public async Task<ExpedienteCurricularDetalleDto?> GetDetalleByIdAsync(int idExpediente)
        {
            var exp = await _context.DocExpedientesCurriculares
                .AsNoTracking()
                .Include(e => e.ModeloEducativo)
                .Include(e => e.ProyectoCurricular)
                .Include(e => e.PerfilEgreso)
                .Include(e => e.Peas.Where(p => p.Activo))
                .FirstOrDefaultAsync(e => e.IdExpediente == idExpediente);

            if (exp == null) return null;

            var baseDto = await MapearDtoAsync(exp);

            var detalle = new ExpedienteCurricularDetalleDto
            {
                IdExpediente = baseDto.IdExpediente,
                Uuid = baseDto.Uuid,
                CodigoExpediente = baseDto.CodigoExpediente,
                IdAsignacion = baseDto.IdAsignacion,
                IdPeriodo = baseDto.IdPeriodo,
                IdCarrera = baseDto.IdCarrera,
                NombreCarrera = baseDto.NombreCarrera,
                IdMalla = baseDto.IdMalla,
                IdDetalleMalla = baseDto.IdDetalleMalla,
                IdAsignatura = baseDto.IdAsignatura,
                NombreAsignatura = baseDto.NombreAsignatura,
                CodigoAsignatura = baseDto.CodigoAsignatura,
                IdNivel = baseDto.IdNivel,
                IdModalidad = baseDto.IdModalidad,
                IdSeccion = baseDto.IdSeccion,
                Paralelo = baseDto.Paralelo,
                IdDocenteResponsable = baseDto.IdDocenteResponsable,
                NombreDocenteResponsable = baseDto.NombreDocenteResponsable,
                IdProyectoCurricular = baseDto.IdProyectoCurricular,
                ResolucionCesCarrera = baseDto.ResolucionCesCarrera,
                IdPerfilEgreso = baseDto.IdPerfilEgreso,
                IdModeloEducativo = baseDto.IdModeloEducativo,
                NombreModeloEducativo = baseDto.NombreModeloEducativo,
                EstadoGeneral = baseDto.EstadoGeneral,
                FechaApertura = baseDto.FechaApertura,
                FechaCierre = baseDto.FechaCierre,
                Activo = baseDto.Activo,
                IdPea = baseDto.IdPea,
                EstadoPea = baseDto.EstadoPea,
                VersionPea = baseDto.VersionPea
            };

            // Proyecto de carrera CES
            if (exp.IdMalla.HasValue)
            {
                detalle.ProyectoCurricular = await _perfilEgresoService.GetProyectoCurricularAsync(exp.IdCarrera, exp.IdMalla.Value);
                detalle.PerfilEgreso = await _perfilEgresoService.GetPerfilByCarreraMallaAsync(exp.IdCarrera, exp.IdMalla.Value);
                detalle.TributacionPerfil = await _perfilEgresoService.GetTributacionAsignaturaAsync(exp.IdAsignatura, exp.IdMalla.Value);
            }

            // Modelo Educativo
            detalle.ModeloEducativo = await _normativaService.GetModeloEducativoVigenteAsync();

            // Checklist Normativo
            detalle.ChecklistNormativo = await _normativaService.GetChecklistCurricularAsync("CES");

            return detalle;
        }

        public async Task<ExpedienteCurricularDto?> GetByAsignacionAsync(int idAsignacion)
        {
            var exp = await _context.DocExpedientesCurriculares
                .AsNoTracking()
                .Include(e => e.ModeloEducativo)
                .Include(e => e.ProyectoCurricular)
                .Include(e => e.Peas.Where(p => p.Activo))
                .FirstOrDefaultAsync(e => e.IdAsignacion == idAsignacion && e.Activo);

            if (exp == null) return null;
            return await MapearDtoAsync(exp);
        }

        public async Task<ExpedienteCurricularDto?> GetByAsignaturaPeriodoAsync(int idAsignatura, string idPeriodo)
        {
            var exp = await _context.DocExpedientesCurriculares
                .AsNoTracking()
                .Include(e => e.ModeloEducativo)
                .Include(e => e.ProyectoCurricular)
                .Include(e => e.Peas.Where(p => p.Activo))
                .FirstOrDefaultAsync(e => e.IdAsignatura == idAsignatura && e.IdPeriodo == idPeriodo && e.Activo);

            if (exp == null) return null;
            return await MapearDtoAsync(exp);
        }

        public async Task<ExpedienteCurricularDto> ObtenerOCrearExpedienteAsync(int idAsignacion, string? idProfesor)
        {
            var existente = await _context.DocExpedientesCurriculares
                .Include(e => e.ModeloEducativo)
                .Include(e => e.ProyectoCurricular)
                .Include(e => e.Peas.Where(p => p.Activo))
                .FirstOrDefaultAsync(e => e.IdAsignacion == idAsignacion && e.Activo);

            if (existente != null)
            {
                return await MapearDtoAsync(existente);
            }

            // Resolver datos institucionales exactos desde el resolver académico de DOSIER
            var academicContext = await _academicContextResolver.ResolveByAssignmentAsync(idAsignacion, idProfesor)
                ?? throw new KeyNotFoundException($"No se encontró la asignación académica {idAsignacion} en SIGAFI.");

            int idCarrera = academicContext.IdCarrera;
            int idAsignatura = academicContext.IdAsignatura;
            string idPeriodo = academicContext.IdPeriodo;
            int? idMalla = academicContext.IdMalla;
            int? idDetalleMalla = academicContext.IdDetalleMalla;
            string idDocente = academicContext.IdProfesor;

            // Consultar Modelo Educativo Vigente
            var modeloEducativo = await _context.DocModelosEducativos
                .AsNoTracking()
                .Where(m => m.Activo)
                .OrderByDescending(m => m.FechaVigenciaDesde)
                .FirstOrDefaultAsync();

            // Consultar Proyecto Curricular de Carrera
            var proyectoCurricular = await _context.DocProyectosCurriculares
                .AsNoTracking()
                .Where(p => p.IdCarrera == idCarrera && p.Activo)
                .OrderByDescending(p => p.Version)
                .FirstOrDefaultAsync();

            // Consultar Perfil de Egreso
            var perfilEgreso = await _context.DocPerfilesEgreso
                .AsNoTracking()
                .Where(p => p.IdCarrera == idCarrera && p.Activo)
                .OrderByDescending(p => p.Version)
                .FirstOrDefaultAsync();

            // Generar código formal de expediente
            string codigoExp = $"EXP-{idPeriodo}-C{idCarrera}-A{idAsignatura}-ASIG{idAsignacion}";

            var nuevoExpediente = new DocExpedienteCurricular
            {
                Uuid = Guid.NewGuid().ToString(),
                CodigoExpediente = codigoExp,
                IdAsignacion = idAsignacion,
                IdPeriodo = idPeriodo,
                IdCarrera = idCarrera,
                IdMalla = idMalla,
                IdDetalleMalla = idDetalleMalla,
                IdAsignatura = idAsignatura,
                IdNivel = academicContext.IdNivel,
                IdModalidad = academicContext.IdModalidad,
                IdSeccion = academicContext.IdSeccion,
                Paralelo = academicContext.Paralelo,
                IdDocenteResponsable = idDocente,
                IdProyectoCurricular = proyectoCurricular?.IdProyectoCurricular,
                IdPerfilEgreso = perfilEgreso?.IdPerfilEgreso,
                IdModeloEducativo = modeloEducativo?.IdModelo,
                EstadoGeneral = "Abierto",
                FechaApertura = DateTime.UtcNow,
                Activo = true
            };

            _context.DocExpedientesCurriculares.Add(nuevoExpediente);
            await _context.SaveChangesAsync();

            return await MapearDtoAsync(nuevoExpediente);
        }

        public async Task<List<ExpedienteCurricularDto>> ListarExpedientesPeriodoAsync(string idPeriodo, int? idCarrera = null)
        {
            var query = _context.DocExpedientesCurriculares
                .AsNoTracking()
                .Include(e => e.ModeloEducativo)
                .Include(e => e.ProyectoCurricular)
                .Include(e => e.Peas.Where(p => p.Activo))
                .Where(e => e.IdPeriodo == idPeriodo && e.Activo);

            if (idCarrera.HasValue)
            {
                query = query.Where(e => e.IdCarrera == idCarrera.Value);
            }

            var list = await query.ToListAsync();
            var dtos = new List<ExpedienteCurricularDto>();

            foreach (var item in list)
            {
                dtos.Add(await MapearDtoAsync(item));
            }

            return dtos;
        }

        private async Task<ExpedienteCurricularDto> MapearDtoAsync(DocExpedienteCurricular exp)
        {
            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == exp.IdCarrera);
            var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == exp.IdAsignatura);

            string? nombreDocente = null;
            if (!string.IsNullOrEmpty(exp.IdDocenteResponsable))
            {
                var prof = await _context.Profesores.AsNoTracking().FirstOrDefaultAsync(p => p.IdProfesor == exp.IdDocenteResponsable);
                if (prof != null)
                {
                    nombreDocente = $"{prof.Apellidos} {prof.Nombres}".Trim();
                }
            }

            var peaVigente = exp.Peas?.OrderByDescending(p => p.Version).FirstOrDefault();

            return new ExpedienteCurricularDto
            {
                IdExpediente = exp.IdExpediente,
                Uuid = exp.Uuid,
                CodigoExpediente = exp.CodigoExpediente,
                IdAsignacion = exp.IdAsignacion,
                IdPeriodo = exp.IdPeriodo,
                IdCarrera = exp.IdCarrera,
                NombreCarrera = carrera?.Carrera1 ?? "Carrera ISTPET",
                IdMalla = exp.IdMalla,
                IdDetalleMalla = exp.IdDetalleMalla,
                IdAsignatura = exp.IdAsignatura,
                NombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura",
                CodigoAsignatura = asignatura?.Codigo,
                IdNivel = exp.IdNivel,
                IdModalidad = exp.IdModalidad,
                IdSeccion = exp.IdSeccion,
                Paralelo = exp.Paralelo,
                IdDocenteResponsable = exp.IdDocenteResponsable,
                NombreDocenteResponsable = nombreDocente,
                IdProyectoCurricular = exp.IdProyectoCurricular,
                ResolucionCesCarrera = exp.ProyectoCurricular?.CodigoResolucionCes,
                IdPerfilEgreso = exp.IdPerfilEgreso,
                IdModeloEducativo = exp.IdModeloEducativo,
                NombreModeloEducativo = exp.ModeloEducativo?.Nombre,
                EstadoGeneral = exp.EstadoGeneral,
                FechaApertura = exp.FechaApertura,
                FechaCierre = exp.FechaCierre,
                Activo = exp.Activo,
                SalaColaborativaActiva = exp.SalaColaborativaActiva,
                SalaSesionMetadataJson = exp.SalaSesionMetadataJson,
                IdPea = peaVigente?.IdPea,
                EstadoPea = peaVigente?.Estado,
                VersionPea = peaVigente?.Version
            };
        }

        // =========================================================================
        // IMPLEMENTACIÓN DE SALAS CURRICULARES COLEGIADAS POR CARRERA Y PRE-PEA
        // =========================================================================

        public async Task<SalaCarreraEstadoDto> GetEstadoSalaCarreraAsync(int idCarrera, string idPeriodo, string? idUsuario)
        {
            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == idCarrera);
            var expedientes = await _context.DocExpedientesCurriculares
                .Include(e => e.Peas.Where(p => p.Activo))
                .Where(e => e.IdCarrera == idCarrera && e.IdPeriodo == idPeriodo && e.Activo)
                .ToListAsync();

            if (expedientes.Count == 0)
            {
                // Auto-inicializar expedientes para las asignaciones existentes de la carrera
                var mallas = await _context.Mallas.AsNoTracking().Where(m => m.IdCarrera == idCarrera).Select(m => m.IdMalla).ToListAsync();
                var asigIdsMalla = await _context.DetalleMallas.AsNoTracking().Where(dm => mallas.Contains(dm.IdMalla)).Select(dm => dm.IdAsignatura).Distinct().ToListAsync();
                var asignaciones = await _context.AsignacionesProfesores
                    .AsNoTracking()
                    .Where(ap => asigIdsMalla.Contains(ap.IdAsignatura) && ap.IdPeriodo == idPeriodo && (ap.Activo == 1 || ap.Activo == null))
                    .ToListAsync();

                foreach (var asig in asignaciones)
                {
                    try
                    {
                        await ObtenerOCrearExpedienteAsync(asig.IdAsignacion, asig.IdProfesor);
                    }
                    catch
                    {
                        // Best effort
                    }
                }

                expedientes = await _context.DocExpedientesCurriculares
                    .Include(e => e.Peas.Where(p => p.Activo))
                    .Where(e => e.IdCarrera == idCarrera && e.IdPeriodo == idPeriodo && e.Activo)
                    .ToListAsync();
            }

            bool activa = expedientes.Any(e => e.SalaColaborativaActiva);
            string? moderadorId = null;
            string? moderadorNombre = null;
            string? temaPrincipal = null;
            DateTime? fechaApertura = null;

            var primerMeta = expedientes.FirstOrDefault(e => !string.IsNullOrEmpty(e.SalaSesionMetadataJson))?.SalaSesionMetadataJson;
            if (!string.IsNullOrEmpty(primerMeta))
            {
                try
                {
                    using var doc = JsonDocument.Parse(primerMeta);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("moderador_id", out var mId)) moderadorId = mId.GetString();
                    if (root.TryGetProperty("moderador_nombre", out var mNom)) moderadorNombre = mNom.GetString();
                    if (root.TryGetProperty("tema_principal", out var tPrin)) temaPrincipal = tPrin.GetString();
                    if (root.TryGetProperty("fecha_apertura", out var fAp) && fAp.TryGetDateTime(out var dt)) fechaApertura = dt;
                }
                catch
                {
                    // Ignorar errores de parseo json
                }
            }

            var asignaturasDto = new List<SalaAsignaturaItemDto>();
            var asignaturasIds = expedientes.Select(e => e.IdAsignatura).Distinct().ToList();
            var dictAsignaturas = await _context.Asignaturas.AsNoTracking()
                .Where(a => asignaturasIds.Contains(a.IdAsignatura))
                .ToDictionaryAsync(a => a.IdAsignatura, a => a);

            var profIds = expedientes.Where(e => !string.IsNullOrEmpty(e.IdDocenteResponsable)).Select(e => e.IdDocenteResponsable!).Distinct().ToList();
            var dictProfesores = await _context.Profesores.AsNoTracking()
                .Where(p => profIds.Contains(p.IdProfesor))
                .ToDictionaryAsync(p => p.IdProfesor, p => $"{p.Apellidos} {p.Nombres}".Trim());

            var nivelIds = expedientes.Where(e => e.IdNivel.HasValue).Select(e => e.IdNivel!.Value).Distinct().ToList();
            var dictCursos = await _context.Cursos.AsNoTracking()
                .Where(c => nivelIds.Contains(c.IdNivel))
                .ToDictionaryAsync(c => c.IdNivel, c => c.Nivel ?? string.Empty);

            foreach (var exp in expedientes)
            {
                dictAsignaturas.TryGetValue(exp.IdAsignatura, out var asig);
                string? profNombre = null;
                if (!string.IsNullOrEmpty(exp.IdDocenteResponsable))
                {
                    dictProfesores.TryGetValue(exp.IdDocenteResponsable, out profNombre);
                }

                string nombreNivel = "General";
                if (exp.IdNivel.HasValue && dictCursos.TryGetValue(exp.IdNivel.Value, out var nStr) && !string.IsNullOrWhiteSpace(nStr))
                {
                    nombreNivel = nStr;
                }
                else if (exp.IdNivel.HasValue)
                {
                    nombreNivel = $"Nivel {exp.IdNivel.Value}";
                }

                var peaVigente = exp.Peas?.OrderByDescending(p => p.Version).FirstOrDefault();
                if (peaVigente == null)
                {
                    peaVigente = new DocPea
                    {
                        Uuid = Guid.NewGuid().ToString(),
                        IdExpediente = exp.IdExpediente,
                        IdCarrera = exp.IdCarrera,
                        IdAsignatura = exp.IdAsignatura,
                        IdPeriodo = exp.IdPeriodo,
                        IdAsignacion = exp.IdAsignacion,
                        IdMalla = exp.IdMalla,
                        IdDetalleMalla = exp.IdDetalleMalla,
                        IdNivel = exp.IdNivel,
                        IdModalidad = exp.IdModalidad,
                        IdSeccion = exp.IdSeccion,
                        Paralelo = exp.Paralelo,
                        IdDocenteElaborador = exp.IdDocenteResponsable ?? moderadorId,
                        Estado = "Borrador",
                        Version = 1,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow,
                        FechaModificacion = DateTime.UtcNow
                    };
                    _context.DocPeas.Add(peaVigente);
                    await _context.SaveChangesAsync();
                }

                asignaturasDto.Add(new SalaAsignaturaItemDto
                {
                    IdExpediente = exp.IdExpediente,
                    ExpedienteUuid = exp.Uuid,
                    IdAsignatura = exp.IdAsignatura,
                    NombreAsignatura = asig?.Asignatura1 ?? "Asignatura",
                    CodigoAsignatura = asig?.Codigo,
                    IdDocenteResponsable = exp.IdDocenteResponsable,
                    NombreDocenteResponsable = profNombre,
                    IdNivel = exp.IdNivel,
                    NombreNivel = nombreNivel,
                    IdMalla = exp.IdMalla,
                    IdPea = peaVigente?.IdPea,
                    PeaUuid = peaVigente?.Uuid,
                    EstadoPea = peaVigente?.Estado
                });
            }

            return new SalaCarreraEstadoDto
            {
                IdCarrera = idCarrera,
                NombreCarrera = carrera?.Carrera1 ?? "Carrera ISTPET",
                IdPeriodo = idPeriodo,
                Activa = activa,
                ModeradorId = moderadorId,
                ModeradorNombre = moderadorNombre,
                FechaApertura = fechaApertura,
                TemaPrincipal = temaPrincipal,
                TotalAsignaturas = asignaturasDto.Count,
                Asignaturas = asignaturasDto.OrderBy(a => a.IdNivel).ThenBy(a => a.NombreAsignatura).ToList()
            };
        }

        public async Task<bool> ConmutarEstadoSalaCarreraAsync(int idCarrera, string idPeriodo, bool activar, string? tema, string idUsuario)
        {
            var expedientes = await _context.DocExpedientesCurriculares
                .Where(e => e.IdCarrera == idCarrera && e.IdPeriodo == idPeriodo && e.Activo)
                .ToListAsync();

            if (!expedientes.Any()) return false;

            string? moderadorNombre = null;
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdSigafi == idUsuario || u.IdUsuario.ToString() == idUsuario);
            if (user != null && !string.IsNullOrWhiteSpace(user.Nombre))
            {
                moderadorNombre = user.Nombre.Trim();
            }

            var metadataObj = new
            {
                moderador_id = idUsuario,
                moderador_nombre = moderadorNombre ?? idUsuario,
                tema_principal = tema ?? "Armonización Curricular y Análisis de Malla",
                fecha_apertura = activar ? DateTime.UtcNow : (DateTime?)null,
                activa = activar
            };
            string metaJson = JsonSerializer.Serialize(metadataObj);

            foreach (var exp in expedientes)
            {
                exp.SalaColaborativaActiva = activar;
                exp.SalaSesionMetadataJson = metaJson;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
