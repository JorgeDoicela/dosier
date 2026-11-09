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

            int conBorradorCount = 0;
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

                bool tieneBorrador = false;
                DateTime? ultActBorrador = null;

                if (!string.IsNullOrEmpty(exp.SalaSesionMetadataJson) && exp.SalaSesionMetadataJson.Contains("\"borrador\""))
                {
                    tieneBorrador = true;
                    conBorradorCount++;
                    try
                    {
                        using var doc = JsonDocument.Parse(exp.SalaSesionMetadataJson);
                        if (doc.RootElement.TryGetProperty("borrador", out var bEl) && bEl.TryGetProperty("actualizado_en", out var actEl))
                        {
                            if (actEl.TryGetDateTime(out var dtAct)) ultActBorrador = dtAct;
                        }
                    }
                    catch
                    {
                        // Fallback
                    }
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
                    EstadoPea = peaVigente?.Estado,
                    TieneBorradorSala = tieneBorrador,
                    UltimaActualizacionBorrador = ultActBorrador
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
                AsignaturasConBorrador = conBorradorCount,
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

                if (!string.IsNullOrEmpty(exp.SalaSesionMetadataJson) && exp.SalaSesionMetadataJson.Contains("\"borrador\""))
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(exp.SalaSesionMetadataJson);
                        if (doc.RootElement.TryGetProperty("borrador", out var borradorProp))
                        {
                            var updatedMeta = new
                            {
                                moderador_id = idUsuario,
                                moderador_nombre = moderadorNombre ?? idUsuario,
                                tema_principal = tema ?? "Armonización Curricular y Análisis de Malla",
                                fecha_apertura = activar ? DateTime.UtcNow : (DateTime?)null,
                                activa = activar,
                                borrador = JsonSerializer.Deserialize<object>(borradorProp.GetRawText())
                            };
                            exp.SalaSesionMetadataJson = JsonSerializer.Serialize(updatedMeta);
                            continue;
                        }
                    }
                    catch
                    {
                        // Fallback
                    }
                }

                exp.SalaSesionMetadataJson = metaJson;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BorradorPrePeaDto?> GetBorradorPrePeaAsync(int idExpediente)
        {
            var exp = await _context.DocExpedientesCurriculares
                .AsNoTracking()
                .Include(e => e.Peas.Where(p => p.Activo))
                .FirstOrDefaultAsync(e => e.IdExpediente == idExpediente);

            if (exp == null) return null;

            var asig = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == exp.IdAsignatura);

            if (!string.IsNullOrEmpty(exp.SalaSesionMetadataJson) && exp.SalaSesionMetadataJson.Contains("\"borrador\""))
            {
                try
                {
                    using var doc = JsonDocument.Parse(exp.SalaSesionMetadataJson);
                    if (doc.RootElement.TryGetProperty("borrador", out var bEl))
                    {
                        var dto = JsonSerializer.Deserialize<BorradorPrePeaDto>(bEl.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (dto != null)
                        {
                            dto.IdExpediente = exp.IdExpediente;
                            dto.IdAsignatura = exp.IdAsignatura;
                            dto.NombreAsignatura = asig?.Asignatura1 ?? "Asignatura";
                            return dto;
                        }
                    }
                }
                catch
                {
                    // Fallback
                }
            }

            var pea = exp.Peas?.OrderByDescending(p => p.Version).FirstOrDefault();
            return new BorradorPrePeaDto
            {
                IdExpediente = exp.IdExpediente,
                IdAsignatura = exp.IdAsignatura,
                NombreAsignatura = asig?.Asignatura1 ?? "Asignatura",
                ObjetivoAsignatura = CleanHtmlToText(pea?.ObjetivoAsignatura),
                MetodologiaEnsenanza = CleanHtmlToText(pea?.MetodologiaEnsenanza),
                RecursosDidacticos = CleanHtmlToText(pea?.RecursosDidacticos),
                EvaluacionAprendizaje = CleanHtmlToText(pea?.EvaluacionAprendizaje),
                ActualizadoEn = DateTime.UtcNow
            };
        }

        private static string CleanHtmlToText(string? html)
        {
            if (string.IsNullOrWhiteSpace(html)) return string.Empty;
            var cleaned = System.Text.RegularExpressions.Regex.Replace(html, "<[^>]+>", " ");
            cleaned = System.Net.WebUtility.HtmlDecode(cleaned);
            return System.Text.RegularExpressions.Regex.Replace(cleaned, @"\s+", " ").Trim();
        }

        public async Task<BorradorPrePeaDto> GuardarBorradorPrePeaAsync(int idExpediente, BorradorPrePeaDto dto, string idUsuario)
        {
            var exp = await _context.DocExpedientesCurriculares.FirstOrDefaultAsync(e => e.IdExpediente == idExpediente);
            if (exp == null) throw new InvalidOperationException($"Expediente {idExpediente} no encontrado.");

            dto.IdExpediente = exp.IdExpediente;
            dto.IdAsignatura = exp.IdAsignatura;
            dto.ActualizadoEn = DateTime.UtcNow;
            dto.ActualizadoPor = idUsuario;

            string moderadorId = idUsuario;
            string moderadorNombre = idUsuario;
            string temaPrincipal = "Armonización Curricular";
            bool activa = exp.SalaColaborativaActiva;

            if (!string.IsNullOrEmpty(exp.SalaSesionMetadataJson))
            {
                try
                {
                    using var doc = JsonDocument.Parse(exp.SalaSesionMetadataJson);
                    if (doc.RootElement.TryGetProperty("moderador_id", out var mId)) moderadorId = mId.GetString() ?? moderadorId;
                    if (doc.RootElement.TryGetProperty("moderador_nombre", out var mNom)) moderadorNombre = mNom.GetString() ?? moderadorNombre;
                    if (doc.RootElement.TryGetProperty("tema_principal", out var tPr)) temaPrincipal = tPr.GetString() ?? temaPrincipal;
                    if (doc.RootElement.TryGetProperty("activa", out var act)) activa = act.GetBoolean();
                }
                catch
                {
                    // Fallback
                }
            }

            var updatedPayload = new
            {
                moderador_id = moderadorId,
                moderador_nombre = moderadorNombre,
                tema_principal = temaPrincipal,
                activa = activa,
                borrador = dto
            };

            exp.SalaSesionMetadataJson = JsonSerializer.Serialize(updatedPayload);
            await _context.SaveChangesAsync();

            try
            {
                string docUuid = $"expediente_{exp.IdExpediente}_prepea";
                var coworkDoc = await _context.DocCoworkDocumentos.FirstOrDefaultAsync(d => d.Uuid == docUuid);
                if (coworkDoc == null)
                {
                    coworkDoc = new DocCoworkDocumento
                    {
                        Uuid = docUuid,
                        EntidadUuid = exp.Uuid,
                        CampoNombre = "pre_pea",
                        EntidadTipo = "EXPEDIENTE_SALA",
                        CreadoEn = DateTime.UtcNow
                    };
                    _context.DocCoworkDocumentos.Add(coworkDoc);
                }
                coworkDoc.ContentJson = JsonSerializer.Serialize(dto);
                coworkDoc.ActualizadoEn = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            catch
            {
                // Non-blocking best effort
            }

            return dto;
        }

        public async Task<PeaDto> AplicarBorradorASalaPeaAsync(int idExpediente, int? idPea, string idUsuario)
        {
            var exp = await _context.DocExpedientesCurriculares
                .Include(e => e.Peas)
                .FirstOrDefaultAsync(e => e.IdExpediente == idExpediente);

            if (exp == null) throw new InvalidOperationException($"Expediente {idExpediente} no encontrado.");

            var borrador = await GetBorradorPrePeaAsync(idExpediente);
            if (borrador == null) throw new InvalidOperationException("No se encontró ningún borrador registrado en la Sala Curricular para este expediente.");

            DocPea? pea = null;
            if (idPea.HasValue)
            {
                pea = await _context.DocPeas
                    .Include(p => p.Unidades)
                        .ThenInclude(u => u.Temas)
                    .Include(p => p.ResultadosAprendizaje)
                    .Include(p => p.ActividadesPracticas)
                    .FirstOrDefaultAsync(p => p.IdPea == idPea.Value && p.Activo);
            }

            if (pea == null)
            {
                pea = exp.Peas.OrderByDescending(p => p.Version).FirstOrDefault(p => p.Activo);
            }

            if (pea == null)
            {
                // Crear PEA inicial si no existía aún
                pea = new DocPea
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
                    IdDocenteElaborador = exp.IdDocenteResponsable ?? idUsuario,
                    Estado = "Borrador",
                    Version = 1,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow,
                    FechaModificacion = DateTime.UtcNow
                };
                _context.DocPeas.Add(pea);
                await _context.SaveChangesAsync();
            }

            // Inyectar datos del borrador acordado en la sala
            if (!string.IsNullOrWhiteSpace(borrador.ObjetivoAsignatura))
                pea.ObjetivoAsignatura = borrador.ObjetivoAsignatura;

            if (!string.IsNullOrWhiteSpace(borrador.MetodologiaEnsenanza))
                pea.MetodologiaEnsenanza = borrador.MetodologiaEnsenanza;

            if (!string.IsNullOrWhiteSpace(borrador.RecursosDidacticos))
                pea.RecursosDidacticos = borrador.RecursosDidacticos;

            if (!string.IsNullOrWhiteSpace(borrador.EvaluacionAprendizaje))
                pea.EvaluacionAprendizaje = borrador.EvaluacionAprendizaje;

            pea.FechaModificacion = DateTime.UtcNow;

            // Inyectar Unidades Temáticas si existen en el borrador
            if (borrador.Unidades != null && borrador.Unidades.Any())
            {
                var unidadesExistentes = await _context.DocPeaUnidades
                    .Where(u => u.IdPea == pea.IdPea)
                    .ToListAsync();

                if (unidadesExistentes.Any())
                {
                    _context.DocPeaUnidades.RemoveRange(unidadesExistentes);
                }

                int ordenU = 1;
                foreach (var uDto in borrador.Unidades)
                {
                    var nuevaUnidad = new DocPeaUnidad
                    {
                        Uuid = Guid.NewGuid().ToString(),
                        IdPea = pea.IdPea,
                        NumeroUnidad = uDto.NumeroUnidad > 0 ? uDto.NumeroUnidad : ordenU,
                        NombreUnidad = uDto.NombreUnidad,
                        TotalHorasUnidad = uDto.TotalHorasUnidad,
                        HorasDocencia = uDto.HorasDocencia,
                        HorasPracticoExp = uDto.HorasPracticoExp,
                        HorasAutonomo = uDto.HorasAutonomo,
                        Orden = ordenU++
                    };

                    if (uDto.Temas != null && uDto.Temas.Any())
                    {
                        int ordenT = 1;
                        foreach (var tDto in uDto.Temas)
                        {
                            nuevaUnidad.Temas.Add(new DocPeaTema
                            {
                                Uuid = Guid.NewGuid().ToString(),
                                NumeroTema = tDto.NumeroTema > 0 ? tDto.NumeroTema : ordenT,
                                TituloTema = tDto.TituloTema,
                                DescripcionSubtemas = tDto.DescripcionSubtemas,
                                Orden = ordenT++
                            });
                        }
                    }

                    _context.DocPeaUnidades.Add(nuevaUnidad);
                }
            }

            // Inyectar Resultados de Aprendizaje si existen en el borrador
            if (borrador.ResultadosAprendizaje != null && borrador.ResultadosAprendizaje.Any())
            {
                var rdasExistentes = await _context.DocPeaResultadosAprendizaje
                    .Where(r => r.IdPea == pea.IdPea)
                    .ToListAsync();

                if (rdasExistentes.Any())
                {
                    _context.DocPeaResultadosAprendizaje.RemoveRange(rdasExistentes);
                }

                int ordenR = 1;
                foreach (var rDto in borrador.ResultadosAprendizaje)
                {
                    _context.DocPeaResultadosAprendizaje.Add(new DocPeaResultadoAprendizaje
                    {
                        Uuid = Guid.NewGuid().ToString(),
                        IdPea = pea.IdPea,
                        IdResultadoPerfil = rDto.IdResultadoPerfil,
                        TipoRda = string.IsNullOrWhiteSpace(rDto.TipoRda) ? "Asignatura" : rDto.TipoRda,
                        CodigoRda = rDto.CodigoRda,
                        Descripcion = rDto.Descripcion,
                        NivelDesarrollo = string.IsNullOrWhiteSpace(rDto.NivelDesarrollo) ? "Medio" : rDto.NivelDesarrollo,
                        Orden = ordenR++
                    });
                }
            }

            // Registrar trazabilidad forense
            _context.DocPeaTrazabilidades.Add(new DocPeaTrazabilidad
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = pea.IdPea,
                EstadoAnterior = pea.Estado,
                EstadoNuevo = pea.Estado,
                Motivo = $"Borrador importado y aplicado con éxito desde la Sala Colegiada de Carrera por {idUsuario}.",
                FechaTransicion = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Mapear y retornar
            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == pea.IdCarrera);
            var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura);

            return new PeaDto
            {
                IdPea = pea.IdPea,
                Uuid = pea.Uuid,
                IdCarrera = pea.IdCarrera,
                NombreCarrera = carrera?.Carrera1 ?? string.Empty,
                IdAsignatura = pea.IdAsignatura,
                NombreAsignatura = asignatura?.Asignatura1 ?? string.Empty,
                CodigoAsignatura = asignatura?.Codigo,
                IdPeriodo = pea.IdPeriodo,
                IdExpediente = pea.IdExpediente,
                ObjetivoAsignatura = pea.ObjetivoAsignatura,
                MetodologiaEnsenanza = pea.MetodologiaEnsenanza,
                RecursosDidacticos = pea.RecursosDidacticos,
                EvaluacionAprendizaje = pea.EvaluacionAprendizaje,
                Estado = pea.Estado,
                Version = pea.Version,
                Activo = pea.Activo
            };
        }

        public async Task<(byte[] PdfBytes, string FileName, string TraceabilityCode)> GenerarActaAcuerdosCarreraAsync(int idCarrera, string idPeriodo, string idUsuario)
        {
            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == idCarrera);
            string nombreCarrera = carrera?.Carrera1 ?? "Carrera ISTPET";

            var expedientes = await _context.DocExpedientesCurriculares
                .AsNoTracking()
                .Include(e => e.Peas.Where(p => p.Activo))
                .Where(e => e.IdCarrera == idCarrera && e.IdPeriodo == idPeriodo && e.Activo)
                .ToListAsync();

            var asigIds = expedientes.Select(e => e.IdAsignatura).Distinct().ToList();
            var dictAsignaturas = await _context.Asignaturas.AsNoTracking()
                .Where(a => asigIds.Contains(a.IdAsignatura))
                .ToDictionaryAsync(a => a.IdAsignatura, a => a);

            var profIds = expedientes.Where(e => !string.IsNullOrEmpty(e.IdDocenteResponsable)).Select(e => e.IdDocenteResponsable!).Distinct().ToList();
            var dictProfesores = await _context.Profesores.AsNoTracking()
                .Where(p => profIds.Contains(p.IdProfesor))
                .ToDictionaryAsync(p => p.IdProfesor, p => $"{p.Apellidos} {p.Nombres}".Trim());

            string? moderadorNombre = idUsuario;
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdSigafi == idUsuario || u.IdUsuario.ToString() == idUsuario);
            if (user != null && !string.IsNullOrWhiteSpace(user.Nombre))
            {
                moderadorNombre = user.Nombre.Trim();
            }

            var acuerdosLista = new List<object>();
            foreach (var exp in expedientes)
            {
                dictAsignaturas.TryGetValue(exp.IdAsignatura, out var asig);
                string? profNombre = null;
                if (!string.IsNullOrEmpty(exp.IdDocenteResponsable))
                {
                    dictProfesores.TryGetValue(exp.IdDocenteResponsable, out profNombre);
                }

                var borrador = await GetBorradorPrePeaAsync(exp.IdExpediente);

                acuerdosLista.Add(new
                {
                    codigo = asig?.Codigo ?? "S/C",
                    asignatura = asig?.Asignatura1 ?? "Asignatura",
                    docente = profNombre ?? "No asignado",
                    nivel = exp.IdNivel ?? 1,
                    objetivo_acordado = borrador?.ObjetivoAsignatura ?? "En formulación colegiada",
                    justificacion_malla = borrador?.JustificacionCambiosMalla ?? "Sin modificaciones estructurales de malla",
                    tiene_borrador = borrador != null && (!string.IsNullOrEmpty(borrador.ObjetivoAsignatura) || borrador.Unidades.Any())
                });
            }

            // Consultar perfil de egreso si existe
            PerfilEgresoDto? perfil = null;
            if (expedientes.Any(e => e.IdMalla.HasValue))
            {
                int idMalla = expedientes.First(e => e.IdMalla.HasValue).IdMalla!.Value;
                perfil = await _perfilEgresoService.GetPerfilByCarreraMallaAsync(idCarrera, idMalla);
            }

            var dataModel = new
            {
                institucion = "Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET)",
                titulo = "Acta de Acuerdos de Armonización Curricular y Cambios de Malla",
                carrera = nombreCarrera,
                periodo = idPeriodo,
                fecha_sesion = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm UTC"),
                moderador = moderadorNombre,
                perfil_egreso = perfil?.DescripcionGeneral ?? "Perfil de egreso oficial aprobado por el Consejo de Educación Superior (CES)",
                total_asignaturas = expedientes.Count,
                asignaturas_acordadas = acuerdosLista
            };

            // Generar HTML institucional con el estándar Modern Enterprise Docs
            string htmlContent = $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <style>
        body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; font-size: 11pt; margin: 25mm 20mm; }}
        .header {{ border-bottom: 2px solid #0070f3; padding-bottom: 12px; margin-bottom: 20px; }}
        .header h1 {{ font-size: 16pt; margin: 0; color: #0f172a; font-weight: bold; }}
        .header h2 {{ font-size: 12pt; margin: 4px 0 0 0; color: #0070f3; font-weight: normal; }}
        .meta-grid {{ display: table; width: 100%; margin-bottom: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }}
        .meta-row {{ display: table-row; }}
        .meta-cell {{ display: table-cell; padding: 4px 10px; font-size: 9.5pt; }}
        .meta-cell strong {{ color: #475569; text-transform: uppercase; font-size: 8.5pt; }}
        .section-title {{ font-size: 12pt; font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }}
        table.data-table {{ width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }}
        table.data-table th {{ background-color: #f1f5f9; color: #334155; text-align: left; padding: 8px; border: 1px solid #cbd5e1; font-size: 8.5pt; text-transform: uppercase; }}
        table.data-table td {{ padding: 7px 8px; border: 1px solid #e2e8f0; vertical-align: top; }}
        .signatures {{ margin-top: 50px; display: table; width: 100%; }}
        .sig-col {{ display: table-cell; width: 50%; text-align: center; padding: 0 20px; }}
        .sig-line {{ border-top: 1px solid #64748b; width: 80%; margin: 0 auto 6px auto; }}
        .footer-note {{ font-size: 8pt; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 8px; }}
    </style>
</head>
<body>
    <div class=""header"">
        <h1>{dataModel.institucion}</h1>
        <h2>{dataModel.titulo}</h2>
    </div>

    <div class=""meta-grid"">
        <div class=""meta-row"">
            <div class=""meta-cell""><strong>Carrera:</strong><br>{dataModel.carrera}</div>
            <div class=""meta-cell""><strong>Período Académico:</strong><br>{dataModel.periodo}</div>
            <div class=""meta-cell""><strong>Fecha de Sesión:</strong><br>{dataModel.fecha_sesion}</div>
        </div>
        <div class=""meta-row"">
            <div class=""meta-cell"" colspan=""3""><strong>Coordinador de Carrera (Moderador):</strong><br>{dataModel.moderador}</div>
        </div>
    </div>

    <div class=""section-title"">1. Marco Curricular y Perfil de Egreso Analizado</div>
    <p style=""font-size: 9.5pt; text-align: justify; color: #334155;"">{dataModel.perfil_egreso}</p>

    <div class=""section-title"">2. Matriz de Acuerdos por Asignatura y Propuestas de Cambio de Malla</div>
    <table class=""data-table"">
        <thead>
            <tr>
                <th style=""width: 12%;"">Código / Nivel</th>
                <th style=""width: 25%;"">Asignatura</th>
                <th style=""width: 23%;"">Docente Responsable</th>
                <th style=""width: 40%;"">Acuerdo Pedagógico / Propuesta de Malla</th>
            </tr>
        </thead>
        <tbody>";

            foreach (var item in (IEnumerable<dynamic>)acuerdosLista)
            {
                htmlContent += $@"
            <tr>
                <td><strong>{item.codigo}</strong><br><span style=""color: #64748b;"">Nivel {item.nivel}</span></td>
                <td><strong>{item.asignatura}</strong></td>
                <td>{item.docente}</td>
                <td>
                    <strong>Objetivo Consensuado:</strong> {item.objetivo_acordado}<br>
                    <span style=""color: #0369a1;""><strong>Propuesta Malla:</strong> {item.justificacion_malla}</span>
                </td>
            </tr>";
            }

            htmlContent += $@"
        </tbody>
    </table>

    <div class=""section-title"">3. Certificación de Responsabilidad y Legalización</div>
    <p style=""font-size: 9pt; color: #475569;"">
        La presente acta certifica que el colectivo docente de la carrera, bajo la conducción de la Coordinación de Carrera, ha revisado la consistencia pedagógica y las propuestas preliminares para la posterior formulación de los Programas de Estudio de la Asignatura (PEA) oficiales correspondientes al período {idPeriodo}.
    </p>

    <div class=""signatures"">
        <div class=""sig-col"">
            <div class=""sig-line""></div>
            <strong>{dataModel.moderador}</strong><br>
            <span style=""font-size: 8.5pt; color: #475569;"">Coordinador de Carrera<br>{dataModel.carrera}</span>
        </div>
        <div class=""sig-col"">
            <div class=""sig-line""></div>
            <strong>Colectivo Docente</strong><br>
            <span style=""font-size: 8.5pt; color: #475569;"">Planta Docente Participante<br>Período {idPeriodo}</span>
        </div>
    </div>

    <div class=""footer-note"">
        Documento oficial emitido mediante DOSIER Curricular Platform. Código de verificación forense institucional ISTPET.
    </div>
</body>
</html>";

            var docRequest = new DocumentRequest
            {
                TemplateCode = "ACTA_ARMONIZACION_CARRERA",
                Data = dataModel,
                CustomHtmlContent = htmlContent,
                RequestedBy = idUsuario
            };

            var docResult = await _documentEngine.GenerateAsync(docRequest);
            string fileName = $"Acta_Armonizacion_{nombreCarrera.Replace(" ", "_")}_{idPeriodo}.pdf";

            return (docResult.PdfBytes, fileName, docResult.TraceabilityCode);
        }
    }
}
