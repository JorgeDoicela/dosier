using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using dosier_application.Academico;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;
using dosier_domain.Curriculum.Entities;
using dosier_domain.Identity.Entities;
using dosier_infrastructure.data.models;

using dosier_domain.Signatures;
using dosier_infrastructure.Security;
using dosier_infrastructure.Signatures;

namespace dosier_infrastructure.Curriculum
{
    public class PeaService : IPeaService
    {
        private readonly DosierContext _context;
        private readonly IAcademicContextResolver _academicContextResolver;
        private readonly IExpedienteCurricularService _expedienteService;
        private readonly SignatureHashService _hashService;
        private readonly dosier_application.Common.IAppUrlService _appUrlService;
        private readonly IFirmaElectronicaService _firmaElectronicaService;
        private readonly dosier_application.Common.Notifications.INotificationService? _notificationService;
        private readonly IServiceProvider? _serviceProvider;

        public PeaService(
            DosierContext context,
            IAcademicContextResolver academicContextResolver,
            IExpedienteCurricularService expedienteService,
            SignatureHashService hashService,
            dosier_application.Common.IAppUrlService appUrlService,
            IFirmaElectronicaService firmaElectronicaService,
            dosier_application.Common.Notifications.INotificationService? notificationService = null,
            IServiceProvider? serviceProvider = null)
        {
            _context = context;
            _academicContextResolver = academicContextResolver;
            _expedienteService = expedienteService;
            _hashService = hashService;
            _appUrlService = appUrlService;
            _firmaElectronicaService = firmaElectronicaService;
            _notificationService = notificationService;
            _serviceProvider = serviceProvider;
        }

        private dosier_application.Common.Notifications.INotificationService? GetNotificationService()
        {
            return _notificationService ?? _serviceProvider?.GetService<dosier_application.Common.Notifications.INotificationService>();
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
                .Include(p => p.Prerrequisitos)
                .Include(p => p.Evaluaciones)
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
                HorasContactoDocente = (academicContext.HorasTotales > 0 && academicContext.HorasDocencia <= 0 && academicContext.HorasPracticoExperimental <= 0)
                    ? academicContext.HorasTotales / 3
                    : decimal.ToInt32(academicContext.HorasDocencia),
                HorasPracticoExperimental = (academicContext.HorasTotales > 0 && academicContext.HorasDocencia <= 0 && academicContext.HorasPracticoExperimental <= 0)
                    ? academicContext.HorasTotales / 3
                    : decimal.ToInt32(academicContext.HorasPracticoExperimental),
                HorasAutonomo = (academicContext.HorasTotales > 0 && academicContext.HorasDocencia <= 0 && academicContext.HorasPracticoExperimental <= 0)
                    ? (academicContext.HorasTotales - (academicContext.HorasTotales / 3) * 2)
                    : decimal.ToInt32(academicContext.HorasAutonomo),
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
                .Include(p => p.Prerrequisitos)
                .Include(p => p.Evaluaciones)
                .FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo);

            if (pea == null) return null;
            return await MapToDtoAsync(pea);
        }

        public async Task<PeaDto?> GetByUuidAsync(string uuid)
        {
            var pea = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .Include(p => p.Observaciones)
                .Include(p => p.Trazabilidades)
                .Include(p => p.Prerrequisitos)
                .Include(p => p.Evaluaciones)
                .FirstOrDefaultAsync(p => p.Uuid == uuid && p.Activo);

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
                .Include(p => p.Prerrequisitos)
                .Include(p => p.Evaluaciones)
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
                    .Include(p => p.Prerrequisitos)
                    .Include(p => p.Evaluaciones)
                    .FirstOrDefaultAsync(p => p.IdPea == dto.IdPea && p.Activo)
                    ?? throw new KeyNotFoundException($"No se encontró el PEA con id {dto.IdPea}");

                if (entity.Estado is "Aprobado" or "Publicado")
                {
                    throw new InvalidOperationException(
                        $"El PEA id {dto.IdPea} se encuentra en estado '{entity.Estado}' y está legalmente cerrado bajo Ley 67. No puede modificarse directamente. Genere una nueva versión o use la función de clonación.");
                }

                entity.Modalidad = dto.Modalidad;
                if (!string.IsNullOrWhiteSpace(dto.UnidadOrganizacion))
                {
                    entity.UnidadOrganizacion = dosier_infrastructure.Academico.AcademicContextResolver.NormalizarUnidadOrganizacion(dto.UnidadOrganizacion);
                }

                if (entity.IdAsignacion == null)
                {
                    entity.SemestreNivel = dto.SemestreNivel;
                    entity.TotalHorasAsignatura = dto.TotalHorasAsignatura;
                    entity.Creditos = dto.Creditos;
                }

                entity.HorasContactoDocente = dto.HorasContactoDocente;
                entity.HorasPracticoExperimental = dto.HorasPracticoExperimental;
                entity.HorasAutonomo = dto.HorasAutonomo;

                entity.ObjetivoAsignatura = dto.ObjetivoAsignatura;
                entity.MetodologiaEnsenanza = dto.MetodologiaEnsenanza;
                entity.RecursosDidacticos = dto.RecursosDidacticos;
                entity.EvaluacionAprendizaje = dto.EvaluacionAprendizaje;
                entity.FechaModificacion = DateTime.UtcNow;

                _context.DocPeaUnidades.RemoveRange(entity.Unidades);
                _context.DocPeaResultadosAprendizaje.RemoveRange(entity.ResultadosAprendizaje);
                _context.DocPeaActividadesPracticas.RemoveRange(entity.ActividadesPracticas);
                _context.DocPeaBibliografias.RemoveRange(entity.Bibliografias);
                _context.DocPeaPrerrequisitos.RemoveRange(entity.Prerrequisitos);
                _context.DocPeaEvaluaciones.RemoveRange(entity.Evaluaciones);
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
                IdResultadoPerfil = r.IdResultadoPerfil,
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

            // Prerrequisitos oficiales (Sección c)
            entity.Prerrequisitos = dto.Prerrequisitos.Select(pr => new DocPeaPrerequisito
            {
                Uuid = Guid.NewGuid().ToString(),
                IdAsignaturaOrigen = pr.IdAsignaturaOrigen,
                CodigoAsignatura = pr.CodigoAsignatura,
                NombreAsignatura = pr.NombreAsignatura,
                Observacion = pr.Observacion,
                Orden = pr.Orden
            }).ToList();

            // Evaluaciones estructuradas oficiales (Sección i)
            entity.Evaluaciones = dto.Evaluaciones.Select(ev => new DocPeaEvaluacion
            {
                Uuid = Guid.NewGuid().ToString(),
                Denominacion = ev.Denominacion,
                TipoEvaluacion = ev.TipoEvaluacion,
                CalificacionMaxima = ev.CalificacionMaxima,
                Orden = ev.Orden
            }).ToList();

            await _context.SaveChangesAsync();
            return await MapToDtoAsync(entity);
        }

        public async Task<bool> CambiarEstadoAsync(int idPea, string nuevoEstado, string? firmaDocente, string? idUsuario, string? motivo = null)
        {
            var entity = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .Include(p => p.Prerrequisitos)
                .Include(p => p.Evaluaciones)
                .FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo);

            if (entity == null) return false;

            // Blindaje de integridad CACES: No permitir transiciones hacia revisión o aprobación con horas desbalanceadas o en cero
            if (nuevoEstado == "EnRevision" || nuevoEstado == "RevisadoCoord" || nuevoEstado == "RevisadoAcad" || nuevoEstado == "Aprobado")
            {
                var total = entity.TotalHorasAsignatura;
                var suma = entity.HorasContactoDocente + entity.HorasPracticoExperimental + entity.HorasAutonomo;
                if (total <= 0m)
                {
                    throw new InvalidOperationException("Inconsistencia CACES: El total de horas de la asignatura no puede ser cero. Ingrese las horas reglamentarias en la Sección 1.");
                }
                if (Math.Abs(suma - total) > 0.05m)
                {
                    throw new InvalidOperationException($"Inconsistencia CACES: La suma de componentes ({suma}h: {entity.HorasContactoDocente}h Docencia, {entity.HorasPracticoExperimental}h APE, {entity.HorasAutonomo}h Autónomo) no coincide con el total de {total}h de la asignatura. Verifique y cuadre la Sección 1 antes de enviar a revisión.");
                }
            }

            string estadoAnterior = entity.Estado;
            entity.Estado = nuevoEstado;
            entity.FechaModificacion = DateTime.UtcNow;

            if (nuevoEstado == "EnRevision" && !string.IsNullOrEmpty(firmaDocente))
            {
                entity.FirmaElaboradoDocente = firmaDocente;
                entity.FechaElaborado = DateTime.UtcNow;
            }
            else if (nuevoEstado == "RevisadoCoord")
            {
                entity.FirmaRevisadoCoord = firmaDocente ?? $"AVAL_COORD_{Guid.NewGuid():N}";
                entity.FechaRevisadoCoord = DateTime.UtcNow;
            }
            else if (nuevoEstado == "RevisadoAcad")
            {
                entity.FirmaRevisadoAcad = firmaDocente ?? $"AVAL_ACAD_{Guid.NewGuid():N}";
                entity.FechaRevisadoAcad = DateTime.UtcNow;
            }
            else if (nuevoEstado == "Aprobado")
            {
                entity.FirmaAprobadoVicerrector = firmaDocente;
                entity.FechaAprobado = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Calcular hash forense del contenido en la transición
            string hashSha256 = CalcularHashSha256(entity);
            int? idUserInt = null;
            if (!string.IsNullOrWhiteSpace(idUsuario))
            {
                if (int.TryParse(idUsuario, out int parsed))
                {
                    idUserInt = parsed;
                }
                else
                {
                    var uMatch = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdSigafi == idUsuario || u.EmailInstitucional == idUsuario);
                    if (uMatch != null) idUserInt = uMatch.IdUsuario;
                }
            }

            await RegistrarTrazabilidadAsync(idPea, estadoAnterior, nuevoEstado, motivo ?? $"Transición de estado a {nuevoEstado}", hashSha256, idUserInt);

            // Notificación e Hitos de Correo Electrónico Institucional
            await NotificarHitoWorkflowPeaAsync(entity, estadoAnterior, nuevoEstado, motivo);

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
        // FIRMA DIGITAL INSTITUCIONAL Y LEGAL (LEY 67 ECUADOR)
        // =====================================================================

        public async Task<PeaFirmaResultadoDto> FirmarPeaAsync(int idPea, int idUsuario, FirmarPeaDto dto, string ipAddress, string userAgent)
        {
            var pea = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .Include(p => p.Observaciones)
                .Include(p => p.Trazabilidades)
                .Include(p => p.Prerrequisitos)
                .Include(p => p.Evaluaciones)
                .FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo)
                ?? throw new KeyNotFoundException($"No se encontró el PEA con id {idPea}");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUsuario == idUsuario)
                ?? throw new UnauthorizedAccessException("Usuario firmante no encontrado en el sistema.");

            // 1. Verificación de Identidad (No-repudio)
            string tipoFirmaNormalizado = (dto.TipoFirma ?? "DOSIER").Trim();
            if (tipoFirmaNormalizado.Equals("FirmaEC", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrEmpty(dto.CertificadoP12Base64))
                    throw new ArgumentException("Debe adjuntar el archivo de certificado (.p12) para la firma electrónica avanzada.");

                byte[] certBytes;
                try
                {
                    certBytes = Convert.FromBase64String(dto.CertificadoP12Base64);
                }
                catch
                {
                    throw new ArgumentException("El certificado .p12 provisto no tiene una codificación Base64 válida.");
                }

                bool certValido = _firmaElectronicaService.ValidateCertificate(certBytes, dto.ContraseniaP12 ?? string.Empty);
                if (!certValido)
                    throw new UnauthorizedAccessException("Certificado digital inválido o contraseña del certificado incorrecta.");
            }
            else
            {
                if (string.IsNullOrWhiteSpace(user.Contrasenia))
                    throw new UnauthorizedAccessException("El usuario no posee una contraseña configurada para validar la firma.");

                bool passwordOk = false;
                try
                {
                    if (!string.IsNullOrEmpty(dto.Password) && BCrypt.Net.BCrypt.Verify(dto.Password, user.Contrasenia))
                    {
                        passwordOk = true;
                    }
                }
                catch
                {
                    if (user.Contrasenia == dto.Password)
                    {
                        passwordOk = true;
                    }
                }

                if (!passwordOk)
                    throw new UnauthorizedAccessException("Contraseña incorrecta. La firma requiere verificación estricta de identidad.");
            }

            // 2. Validación de Roles Institucionales y Workflow Oficial
            var userRoles = await _context.UserRoles
                .AsNoTracking()
                .Include(ur => ur.Role)
                .Where(ur => ur.IdUsuario == idUsuario && (ur.EsActivo ?? true))
                .Select(ur => ur.Role.CodigoRol)
                .ToListAsync();

            bool isAdmin = user.Administrador || userRoles.Contains("DOSIER_ADMIN");

            string estadoAnterior = pea.Estado;
            string estadoNuevo;
            string rol = (dto.RolFirmante ?? "Docente").Trim();

            if (rol.Equals("Docente", StringComparison.OrdinalIgnoreCase) || 
                rol.Equals("Elaborador", StringComparison.OrdinalIgnoreCase) ||
                string.IsNullOrEmpty(rol))
            {
                if (!isAdmin && !userRoles.Contains("DOSIER_DOCENTE"))
                    throw new UnauthorizedAccessException("El usuario no posee el rol de Docente (DOSIER_DOCENTE) para firmar la elaboración del PEA.");

                // EXIGENCIA NORMATIVA: La firma de elaboración es obligatoria y exclusiva del docente titular asignado a la materia
                if (!isAdmin)
                {
                    bool esDocenteTitular = false;
                    if (!string.IsNullOrEmpty(pea.IdDocenteElaborador) && !string.IsNullOrEmpty(user.IdSigafi))
                    {
                        esDocenteTitular = string.Equals(pea.IdDocenteElaborador.Trim(), user.IdSigafi.Trim(), StringComparison.OrdinalIgnoreCase);
                    }

                    if (!esDocenteTitular && pea.IdAsignacion.HasValue)
                    {
                        var asignacion = await _context.AsignacionesProfesores
                            .AsNoTracking()
                            .FirstOrDefaultAsync(a => a.IdAsignacion == pea.IdAsignacion.Value);

                        if (asignacion != null && !string.IsNullOrEmpty(asignacion.IdProfesor) && !string.IsNullOrEmpty(user.IdSigafi))
                        {
                            esDocenteTitular = string.Equals(asignacion.IdProfesor.Trim(), user.IdSigafi.Trim(), StringComparison.OrdinalIgnoreCase);
                        }
                    }

                    if (!esDocenteTitular)
                    {
                        throw new UnauthorizedAccessException("Firma no autorizada: La firma de elaboración del PEA es obligatoria y exclusiva del docente titular que tiene asignada esta materia. Los demás docentes solo pueden colaborar en el contenido.");
                    }
                }

                if (pea.Estado != "Borrador" && pea.Estado != "Corregido")
                    throw new InvalidOperationException($"El docente solo puede firmar PEAs en estado Borrador o Corregido. Estado actual: {pea.Estado}");

                estadoNuevo = "EnRevision";
                rol = "Docente";

                // Sincronizar exhaustivamente la última versión del snapshot del docente antes del sellado criptográfico
                var instanciaDocente = await _context.DocumentInstances
                    .FirstOrDefaultAsync(d => d.EntityUuid == pea.Uuid && d.TemplateCode == "PEA_OFICIAL");
                if (instanciaDocente != null && !string.IsNullOrWhiteSpace(instanciaDocente.DataSnapshotJson))
                {
                    await SincronizarMetadataAsync(pea.Uuid, instanciaDocente.DataSnapshotJson);
                    await _context.Entry(pea).Collection(p => p.Unidades).Query().Include(u => u.Temas).LoadAsync();
                    await _context.Entry(pea).Collection(p => p.ResultadosAprendizaje).LoadAsync();
                    await _context.Entry(pea).Collection(p => p.ActividadesPracticas).LoadAsync();
                    await _context.Entry(pea).Collection(p => p.Bibliografias).LoadAsync();
                    await _context.Entry(pea).Collection(p => p.Prerrequisitos).LoadAsync();
                    await _context.Entry(pea).Collection(p => p.Evaluaciones).LoadAsync();
                }
            }
            else if (rol.Equals("Coordinador", StringComparison.OrdinalIgnoreCase) || 
                     rol.Equals("Revisor", StringComparison.OrdinalIgnoreCase) || 
                     rol.Equals("CoordinadorCarrera", StringComparison.OrdinalIgnoreCase))
            {
                if (!isAdmin && !userRoles.Contains("DOSIER_COORD_CARRERA"))
                    throw new UnauthorizedAccessException("El usuario no posee el rol de Coordinador de Carrera (DOSIER_COORD_CARRERA) para emitir el aval curricular.");

                if (pea.Estado != "EnRevision")
                    throw new InvalidOperationException($"El coordinador de carrera solo puede revisar PEAs en estado EnRevision. Estado actual: {pea.Estado}");

                estadoNuevo = "RevisadoCoord";
                rol = "CoordinadorCarrera";
            }
            else if (rol.Equals("CoordinadorAcademico", StringComparison.OrdinalIgnoreCase) || 
                     rol.Equals("ComisionAcademica", StringComparison.OrdinalIgnoreCase))
            {
                if (!isAdmin && !userRoles.Contains("DOSIER_COORD_ACAD"))
                    throw new UnauthorizedAccessException("El usuario no posee el rol de Coordinación Académica (DOSIER_COORD_ACAD) para emitir el aval institucional.");

                if (pea.Estado != "RevisadoCoord")
                    throw new InvalidOperationException($"La coordinación académica solo puede revisar PEAs en estado RevisadoCoord. Estado actual: {pea.Estado}");

                estadoNuevo = "RevisadoAcad";
                rol = "CoordinadorAcademico";
            }
            else if (rol.Equals("Vicerrector", StringComparison.OrdinalIgnoreCase) || 
                     rol.Equals("Aprobador", StringComparison.OrdinalIgnoreCase) || 
                     rol.Equals("VicerrectorAcademico", StringComparison.OrdinalIgnoreCase))
            {
                if (!isAdmin && !userRoles.Contains("DOSIER_VICERRECTOR"))
                    throw new UnauthorizedAccessException("El usuario no posee el rol de Vicerrectorado Académico (DOSIER_VICERRECTOR) para la aprobación final del PEA.");

                if (pea.Estado != "RevisadoAcad" && pea.Estado != "RevisadoCoord")
                    throw new InvalidOperationException($"El vicerrector solo puede aprobar PEAs que hayan cumplido con la fase de revisión previa. Estado actual: {pea.Estado}");

                estadoNuevo = "Aprobado";
                rol = "Vicerrector";
            }
            else
            {
                throw new ArgumentException($"Rol de firmante no reconocido: '{rol}'. Roles institucionales válidos: Docente, CoordinadorCarrera, CoordinadorAcademico, Vicerrector.");
            }

            // 2.1 Blindaje CACES: Ningún rol puede firmar o avanzar un PEA con horas inconsistentes o en cero
            decimal totalHorasVal = pea.TotalHorasAsignatura;
            decimal sumaComponentesVal = pea.HorasContactoDocente + pea.HorasPracticoExperimental + pea.HorasAutonomo;
            if (totalHorasVal <= 0m)
            {
                throw new InvalidOperationException("Inconsistencia CACES: El total de horas de la asignatura no puede ser cero. Ingrese las horas reglamentarias en la Sección 1 antes de firmar.");
            }
            if (Math.Abs(sumaComponentesVal - totalHorasVal) > 0.05m)
            {
                throw new InvalidOperationException($"Inconsistencia CACES: La suma de componentes ({sumaComponentesVal}h: {pea.HorasContactoDocente}h Docencia, {pea.HorasPracticoExperimental}h APE, {pea.HorasAutonomo}h Autónomo) no coincide con el total de {totalHorasVal}h de la asignatura. Verifique y cuadre la Sección 1 antes de firmar.");
            }

            // 3. Generación Forense del Hash SHA-256 del PEA
            string docHash = CalcularHashSha256(pea);
            string firmaCode = SignatureHashService.GenerateFirmaCode();
            DateTime firmadoEn = DateTime.UtcNow;
            string firmanteIdStr = $"USR-{idUsuario}";
            string hmacHash = _hashService.GenerateHmac(docHash, firmanteIdStr, firmadoEn, firmaCode);

            // 4. Perfil de Firma y Metadatos Institucionales
            var perfil = await _context.DocUserSignaturePerfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

            var metadataJson = JsonSerializer.Serialize(new
            {
                nombre = user.Nombre ?? user.IdSigafi ?? "Usuario DOSIER",
                cedula = user.IdSigafi,
                cargo = perfil?.Cargo ?? rol,
                departamento = perfil?.Departamento ?? "ISTPET",
                tipo_sello = perfil?.TipoSello ?? "completo",
                // NOTA TÉCNICA LEY 67: La firma PAdES completa con estampado en PDF se ejecuta en exportación documental.
                // A nivel transaccional se valida la vigencia del certificado P12 del docente y se genera el sello HMAC institucional.
                metodo = tipoFirmaNormalizado.Equals("FirmaEC", StringComparison.OrdinalIgnoreCase) ? "CERT_VALIDADO_HMAC_SRV" : "DOSIER_HMAC_SHA256",
                institucion = "Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET)"
            });

            // 5. Registro en doc_documentos_firmas (Módulo Transversal Oficial)
            var registroFirma = new DocDocumentoFirma
            {
                Uuid = Guid.NewGuid().ToString(),
                DocumentoUuid = pea.Uuid,
                FirmanteId = firmanteIdStr,
                FirmanteRol = rol,
                FechaFirma = firmadoEn,
                TipoFirma = tipoFirmaNormalizado.Equals("FirmaEC", StringComparison.OrdinalIgnoreCase) ? "FirmaEC" : "DOSIER",
                FirmaCode = firmaCode,
                HmacHash = hmacHash,
                DocHash = docHash,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                FirmaMetadata = metadataJson,
                EsValida = true
            };
            _context.DocDocumentoFirmas.Add(registroFirma);

            // 6. Actualizar las columnas normativas del PEA con el código de firma oficial
            pea.Estado = estadoNuevo;
            pea.FechaModificacion = firmadoEn;

            if (estadoNuevo == "EnRevision")
            {
                pea.FirmaElaboradoDocente = firmaCode;
                pea.FechaElaborado = firmadoEn;
            }
            else if (estadoNuevo == "RevisadoCoord")
            {
                pea.FirmaRevisadoCoord = firmaCode;
                pea.FechaRevisadoCoord = firmadoEn;
            }
            else if (estadoNuevo == "RevisadoAcad")
            {
                pea.FirmaRevisadoAcad = firmaCode;
                pea.FechaRevisadoAcad = firmadoEn;
            }
            else if (estadoNuevo == "Aprobado")
            {
                pea.FirmaAprobadoVicerrector = firmaCode;
                pea.FechaAprobado = firmadoEn;
            }

            // 7. Registro en doc_pea_trazabilidad
            var traza = new DocPeaTrazabilidad
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = idPea,
                IdUsuario = idUsuario,
                EstadoAnterior = estadoAnterior,
                EstadoNuevo = estadoNuevo,
                Motivo = dto.Motivo ?? $"Firma digital oficial ({rol}) bajo Ley 67. Código: {firmaCode}",
                HashIntegridadSha256 = docHash,
                FechaTransicion = firmadoEn
            };
            _context.DocPeaTrazabilidades.Add(traza);

            // 8. Sincronizar instancia documental para autosanación y estampado inmediato del PDF firmado
            var docInstancia = await _context.DocumentInstances.FirstOrDefaultAsync(d => d.EntityUuid == pea.Uuid);
            if (docInstancia != null)
            {
                docInstancia.SetFinalPdfPath(null);
                await _context.SaveChangesAsync();

                try
                {
                    var instanceService = (Dosier.Application.Common.Documents.IDocumentInstanceService?)_serviceProvider?.GetService(typeof(Dosier.Application.Common.Documents.IDocumentInstanceService));
                    if (instanceService != null)
                    {
                        await instanceService.ValidateStorageIntegrityAsync(docInstancia);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DOSIER PEA] Advertencia al autosanar y estampar PDF de PEA tras firma: {ex.Message}");
                }
            }
            else
            {
                await _context.SaveChangesAsync();
            }

            string verificationUrl = _appUrlService.BuildFrontendUrl($"/verificacion/{firmaCode}");

            // Notificación e Hitos de Correo Electrónico tras firma institucional
            await NotificarHitoWorkflowPeaAsync(pea, estadoAnterior, estadoNuevo, dto.Motivo);

            return new PeaFirmaResultadoDto
            {
                Exito = true,
                Mensaje = $"PEA firmado exitosamente por {rol}. Transición a '{estadoNuevo}' registrada.",
                FirmaCode = firmaCode,
                DocHash = docHash,
                EstadoNuevo = estadoNuevo,
                FechaFirma = firmadoEn,
                VerificationUrl = verificationUrl
            };
        }

        // =====================================================================
        // WORKFLOW COLEGIADO DE OBSERVACIONES Y TRAZABILIDAD
        // =====================================================================

        public async Task<PeaObservacionDto> AgregarObservacionByUuidAsync(string uuid, string rolObservador, string seccion, string texto, int? idUsuario)
        {
            var idPea = await _context.DocPeas
                .AsNoTracking()
                .Where(p => p.Uuid == uuid && p.Activo)
                .Select(p => (int?)p.IdPea)
                .FirstOrDefaultAsync();

            if (!idPea.HasValue)
                throw new KeyNotFoundException($"No se encontró el PEA con UUID {uuid}");

            return await AgregarObservacionAsync(idPea.Value, rolObservador, seccion, texto, idUsuario);
        }

        public async Task<PeaObservacionDto> AgregarObservacionAsync(int idPea, string rolObservador, string seccion, string texto, int? idUsuario)
        {
            if (!idUsuario.HasValue)
                throw new UnauthorizedAccessException("Se requiere una sesión autenticada para registrar observaciones al PEA.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUsuario == idUsuario.Value)
                ?? await _context.Users.FirstOrDefaultAsync(u => u.IdSigafi == idUsuario.Value.ToString());

            if (user == null)
                throw new UnauthorizedAccessException("Usuario observador no encontrado.");

            int effectiveUserId = user.IdUsuario;

            var userRoles = await _context.UserRoles
                .AsNoTracking()
                .Include(ur => ur.Role)
                .Where(ur => ur.IdUsuario == effectiveUserId && (ur.EsActivo ?? true))
                .Select(ur => ur.Role.CodigoRol)
                .ToListAsync();

            bool isAdmin = user.Administrador || userRoles.Contains("DOSIER_ADMIN");
            bool isCoordCarrera = userRoles.Contains("DOSIER_COORD_CARRERA");
            bool isCoordAcad = userRoles.Contains("DOSIER_COORD_ACAD");
            bool isVicerrector = userRoles.Contains("DOSIER_VICERRECTOR");

            if (!isAdmin && !isCoordCarrera && !isCoordAcad && !isVicerrector)
            {
                throw new UnauthorizedAccessException("El usuario no posee permisos ni roles de revisión curricular para observar este PEA.");
            }

            string rolEfectivo = isAdmin ? "Administrador" :
                                 isVicerrector ? "Vicerrector" :
                                 isCoordAcad ? "CoordinadorAcademico" : "CoordinadorCarrera";

            var pea = await _context.DocPeas.FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo)
                ?? throw new KeyNotFoundException($"No se encontró el PEA con id {idPea}");

            // La adición de una observación durante la revisión técnica NO debe mutar el estado global del PEA.
            // El estado solo cambia a 'Observado' cuando la autoridad emite formalmente el dictamen de devolución al docente.
            pea.FechaModificacion = DateTime.UtcNow;

            var obs = new DocPeaObservacion
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = idPea,
                IdUsuarioObservador = effectiveUserId,
                RolObservador = rolEfectivo,
                SeccionAfectada = seccion,
                TextoObservacion = texto,
                Estado = "Pendiente",
                FechaObservacion = DateTime.UtcNow
            };

            _context.DocPeaObservaciones.Add(obs);
            await _context.SaveChangesAsync();

            return new PeaObservacionDto
            {
                IdObservacion = obs.IdObservacion,
                Uuid = obs.Uuid,
                IdPea = obs.IdPea,
                IdUsuarioObservador = obs.IdUsuarioObservador,
                NombreObservador = user.Nombre,
                RolObservador = obs.RolObservador,
                SeccionAfectada = obs.SeccionAfectada,
                TextoObservacion = obs.TextoObservacion,
                Estado = obs.Estado,
                FechaObservacion = obs.FechaObservacion
            };
        }

        public async Task<bool> SubsanarObservacionAsync(int idObservacion, string respuestaDocente, int? idUsuario)
        {
            if (!idUsuario.HasValue)
                throw new UnauthorizedAccessException("Se requiere una sesión autenticada para subsanar observaciones.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUsuario == idUsuario.Value)
                ?? throw new UnauthorizedAccessException("Usuario docente no encontrado.");

            var userRoles = await _context.UserRoles
                .AsNoTracking()
                .Include(ur => ur.Role)
                .Where(ur => ur.IdUsuario == idUsuario.Value && (ur.EsActivo ?? true))
                .Select(ur => ur.Role.CodigoRol)
                .ToListAsync();

            bool isAdmin = user.Administrador || userRoles.Contains("DOSIER_ADMIN");
            bool isDocente = userRoles.Contains("DOSIER_DOCENTE");

            if (!isAdmin && !isDocente)
            {
                throw new UnauthorizedAccessException("Solo el docente elaborador o un administrador pueden subsanar observaciones del PEA.");
            }

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

                    await NotificarHitoWorkflowPeaAsync(pea, "Observado", "Corregido", "Todas las observaciones fueron subsanadas por el docente");
                }
            }

            return true;
        }

        public async Task<bool> EliminarObservacionAsync(int idObservacion, int? idUsuario)
        {
            if (!idUsuario.HasValue)
                throw new UnauthorizedAccessException("Se requiere una sesión autenticada para eliminar observaciones.");

            var obs = await _context.DocPeaObservaciones.FirstOrDefaultAsync(o => o.IdObservacion == idObservacion);
            if (obs == null) return false;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUsuario == idUsuario.Value);
            var userRoles = await _context.UserRoles
                .AsNoTracking()
                .Include(ur => ur.Role)
                .Where(ur => ur.IdUsuario == idUsuario.Value && (ur.EsActivo ?? true))
                .Select(ur => ur.Role.CodigoRol)
                .ToListAsync();

            bool isAdmin = user?.Administrador == true || userRoles.Contains("DOSIER_ADMIN");
            bool isCoord = userRoles.Contains("DOSIER_COORD_CARRERA") || userRoles.Contains("DOSIER_COORD_ACAD") || userRoles.Contains("DOSIER_VICERRECTOR");

            if (!isAdmin && !isCoord && obs.IdUsuarioObservador != idUsuario)
            {
                throw new UnauthorizedAccessException("No posee permisos para eliminar esta observación.");
            }

            int idPea = obs.IdPea;
            _context.DocPeaObservaciones.Remove(obs);
            await _context.SaveChangesAsync();

            var pendientes = await _context.DocPeaObservaciones
                .CountAsync(o => o.IdPea == idPea && o.Estado == "Pendiente");

            if (pendientes == 0)
            {
                var pea = await _context.DocPeas.FirstOrDefaultAsync(p => p.IdPea == idPea);
                if (pea != null && pea.Estado == "Observado")
                {
                    pea.Estado = "EnRevision";
                    await RegistrarTrazabilidadAsync(idPea, "Observado", "EnRevision", "Observación eliminada sin pendientes restantes. Retorno a EnRevision.", null, idUsuario);
                    await _context.SaveChangesAsync();

                    await NotificarHitoWorkflowPeaAsync(pea, "Observado", "EnRevision", "Observaciones eliminadas sin pendientes. Retorno a EnRevision.");
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
            int? validUserId = null;
            if (idUsuario.HasValue && idUsuario.Value > 0)
            {
                var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdUsuario == idUsuario.Value);
                if (user != null)
                {
                    validUserId = user.IdUsuario;
                }
                else
                {
                    // Fallback defensivo: verificar si el valor numérico recibido correspondía a IdSigafi
                    var stringRef = idUsuario.Value.ToString();
                    var userByRef = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdSigafi == stringRef);
                    if (userByRef != null)
                    {
                        validUserId = userByRef.IdUsuario;
                    }
                }
            }

            var traza = new DocPeaTrazabilidad
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = idPea,
                IdUsuario = validUserId,
                EstadoAnterior = anterior,
                EstadoNuevo = nuevo,
                Motivo = motivo,
                HashIntegridadSha256 = hashSha256,
                FechaTransicion = DateTime.UtcNow
            };

            _context.DocPeaTrazabilidades.Add(traza);
            await _context.SaveChangesAsync();
        }

        private async Task NotificarHitoWorkflowPeaAsync(
            DocPea pea, 
            string estadoAnterior, 
            string estadoNuevo, 
            string? motivo = null, 
            CancellationToken cancellationToken = default)
        {
            if (string.Equals(estadoAnterior, estadoNuevo, StringComparison.OrdinalIgnoreCase))
                return;

            try
            {
                var notifService = GetNotificationService();
                if (notifService == null) return;

                // 1. Resolver metadatos de asignatura y carrera
                var asignatura = await _context.Asignaturas.AsNoTracking()
                    .FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura, cancellationToken);
                string nombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura Curricular";

                var carrera = await _context.Carreras.AsNoTracking()
                    .FirstOrDefaultAsync(c => c.IdCarrera == pea.IdCarrera, cancellationToken);
                string nombreCarrera = carrera?.Carrera1 ?? "Carrera Institucional";

                // 2. Resolver docente elaborador
                User? userDocente = null;
                if (!string.IsNullOrEmpty(pea.IdDocenteElaborador))
                {
                    userDocente = await _context.Users.AsNoTracking()
                        .FirstOrDefaultAsync(u => u.Activo && (u.IdSigafi == pea.IdDocenteElaborador || u.IdUsuario.ToString() == pea.IdDocenteElaborador), cancellationToken);
                }
                string nombreDocente = userDocente?.Nombre ?? "Docente Titular";

                // 3. Resolver coordinadores de la carrera
                var coordSigafis = await _context.DocAutoridadesCurriculares.AsNoTracking()
                    .Where(a => a.IdCarrera == pea.IdCarrera && a.EsActivo && a.CargoCurricular == "COORD_CARRERA")
                    .Select(a => a.IdSigafi)
                    .ToListAsync(cancellationToken);

                var coordinadoresQuery = _context.Users.AsNoTracking()
                    .Where(u => u.Activo && (
                        (coordSigafis.Count > 0 && coordSigafis.Contains(u.IdSigafi)) ||
                        u.UserRoles.Any(ur => ur.Role.CodigoRol == "DOSIER_COORD_CARRERA" && (ur.EsActivo ?? true))
                    ));

                var coordinadores = await coordinadoresQuery.ToListAsync(cancellationToken);
                var coordinadoresCarrera = coordinadores.Where(u => coordSigafis.Contains(u.IdSigafi)).ToList();
                var destinatariosCoord = (coordinadoresCarrera.Any() ? coordinadoresCarrera : coordinadores)
                    .DistinctBy(u => u.IdUsuario)
                    .ToList();

                // 4. Resolver autoridades académicas institucionales (Vicerrectorado y Coordinación Académica)
                var autoridadesAcad = await _context.Users.AsNoTracking()
                    .Where(u => u.Activo && u.UserRoles.Any(ur => 
                        (ur.Role.CodigoRol == "DOSIER_VICERRECTOR" || ur.Role.CodigoRol == "DOSIER_COORD_ACAD") && 
                        (ur.EsActivo ?? true)))
                    .DistinctBy(u => u.IdUsuario)
                    .ToListAsync(cancellationToken);

                // 5. Administradores de respaldo
                var adminUsers = await _context.Users.AsNoTracking()
                    .Where(u => u.Activo && (u.Administrador || u.UserRoles.Any(ur => ur.Role.CodigoRol == "DOSIER_ADMIN" && (ur.EsActivo ?? true))))
                    .DistinctBy(u => u.IdUsuario)
                    .ToListAsync(cancellationToken);

                string urlPea = $"/documentacion/workspace/pea-oficial/{pea.Uuid}";

                var baseExtraData = new Dictionary<string, string>
                {
                    ["uuid_pea"] = pea.Uuid,
                    ["id_pea"] = pea.IdPea.ToString(),
                    ["asignatura"] = nombreAsignatura,
                    ["carrera"] = nombreCarrera,
                    ["estado_anterior"] = estadoAnterior,
                    ["estado_nuevo"] = estadoNuevo
                };

                // Despacho según el hito normativo
                switch (estadoNuevo)
                {
                    case "EnRevision":
                    {
                        baseExtraData["tipo"] = "PEA_EN_REVISION";
                        baseExtraData["docente"] = nombreDocente;

                        string titulo = $"PEA Remitido a Revisión: {nombreAsignatura}";
                        string mensaje = $"El docente {nombreDocente} ha remitido a revisión curricular el PEA de '{nombreAsignatura}' ({nombreCarrera}). Se requiere la revisión colegiada y emisión del Aval de Carrera.";

                        var destinatarios = destinatariosCoord.Concat(adminUsers)
                            .Where(u => userDocente == null || u.IdUsuario != userDocente.IdUsuario)
                            .DistinctBy(u => u.IdUsuario);

                        foreach (var dest in destinatarios)
                        {
                            await notifService.NotifyUserAsync(
                                dest.IdUsuario,
                                titulo,
                                mensaje,
                                "CURRICULUM",
                                urlPea,
                                new Dictionary<string, string>(baseExtraData));
                        }
                        break;
                    }

                    case "Observado":
                    {
                        baseExtraData["tipo"] = "PEA_OBSERVADO";
                        if (!string.IsNullOrWhiteSpace(motivo)) baseExtraData["motivo"] = motivo;

                        string titulo = $"PEA con Observaciones Curriculares: {nombreAsignatura}";
                        string mensaje = $"El PEA de '{nombreAsignatura}' ({nombreCarrera}) ha recibido observaciones curriculares por parte de la Coordinación de Carrera." +
                            (string.IsNullOrWhiteSpace(motivo) ? "" : $" Requerimiento: {motivo}.") +
                            " Ingrese al editor microcurricular para subsanar los puntos observados.";

                        if (userDocente != null)
                        {
                            await notifService.NotifyUserAsync(
                                userDocente.IdUsuario,
                                titulo,
                                mensaje,
                                "CURRICULUM",
                                urlPea,
                                new Dictionary<string, string>(baseExtraData));
                        }
                        break;
                    }

                    case "Corregido":
                    {
                        baseExtraData["tipo"] = "PEA_CORREGIDO";
                        baseExtraData["docente"] = nombreDocente;

                        string titulo = $"Observaciones Subsanadas: {nombreAsignatura}";
                        string mensaje = $"El docente {nombreDocente} ha subsanado las observaciones del PEA de '{nombreAsignatura}' ({nombreCarrera}). El instrumento está disponible para su verificación y emisión del Aval de Carrera.";

                        var destinatarios = destinatariosCoord.Concat(adminUsers)
                            .Where(u => userDocente == null || u.IdUsuario != userDocente.IdUsuario)
                            .DistinctBy(u => u.IdUsuario);

                        foreach (var dest in destinatarios)
                        {
                            await notifService.NotifyUserAsync(
                                dest.IdUsuario,
                                titulo,
                                mensaje,
                                "CURRICULUM",
                                urlPea,
                                new Dictionary<string, string>(baseExtraData));
                        }
                        break;
                    }

                    case "RevisadoCoord":
                    {
                        baseExtraData["tipo"] = "PEA_AVAL_CARRERA";

                        // 1. Notificar al docente elaborador
                        if (userDocente != null)
                        {
                            string tituloDocente = $"Aval de Carrera Concedido: {nombreAsignatura}";
                            string mensajeDocente = $"El PEA de '{nombreAsignatura}' ({nombreCarrera}) ha recibido el Aval de Carrera formal por parte de la Coordinación y ha avanzado a la fase de aprobación institucional.";

                            await notifService.NotifyUserAsync(
                                userDocente.IdUsuario,
                                tituloDocente,
                                mensajeDocente,
                                "CURRICULUM",
                                urlPea,
                                new Dictionary<string, string>(baseExtraData));
                        }

                        // 2. Notificar a Vicerrectorado y Coordinación Académica
                        string tituloAutoridades = $"PEA con Aval de Carrera Listo para Aprobación: {nombreAsignatura}";
                        string mensajeAutoridades = $"El PEA de '{nombreAsignatura}' ({nombreCarrera}) cuenta con el Aval de Carrera emitido y se encuentra listo para validación institucional y firma de aprobación por Vicerrectorado.";

                        var destinatariosAcad = autoridadesAcad.Concat(adminUsers)
                            .Where(u => userDocente == null || u.IdUsuario != userDocente.IdUsuario)
                            .DistinctBy(u => u.IdUsuario);

                        foreach (var dest in destinatariosAcad)
                        {
                            await notifService.NotifyUserAsync(
                                dest.IdUsuario,
                                tituloAutoridades,
                                mensajeAutoridades,
                                "CURRICULUM",
                                urlPea,
                                new Dictionary<string, string>(baseExtraData));
                        }
                        break;
                    }

                    case "RevisadoAcad":
                    {
                        baseExtraData["tipo"] = "PEA_REVISADO_ACAD";

                        string titulo = $"Revisión Académica Completada: {nombreAsignatura}";
                        string mensaje = $"El PEA de '{nombreAsignatura}' ({nombreCarrera}) ha sido avalado por la Coordinación Académica y espera la firma de aprobación final de Vicerrectorado.";

                        var destinatarios = (userDocente != null ? new[] { userDocente }.Concat(destinatariosCoord) : destinatariosCoord)
                            .DistinctBy(u => u.IdUsuario);

                        foreach (var dest in destinatarios)
                        {
                            await notifService.NotifyUserAsync(
                                dest.IdUsuario,
                                titulo,
                                mensaje,
                                "CURRICULUM",
                                urlPea,
                                new Dictionary<string, string>(baseExtraData));
                        }
                        break;
                    }

                    case "Aprobado":
                    {
                        baseExtraData["tipo"] = "PEA_APROBADO";

                        string titulo = $"PEA Aprobado Oficialmente: {nombreAsignatura}";
                        string mensaje = $"El Programa de Estudio de la Asignatura (PEA) de '{nombreAsignatura}' ({nombreCarrera}) ha sido formalmente APROBADO por Vicerrectorado Académico con firma digital y sellado criptográfico institucional bajo Ley 67.";

                        var destinatarios = (userDocente != null ? new[] { userDocente }.Concat(destinatariosCoord) : destinatariosCoord)
                            .Concat(adminUsers)
                            .DistinctBy(u => u.IdUsuario);

                        foreach (var dest in destinatarios)
                        {
                            await notifService.NotifyUserAsync(
                                dest.IdUsuario,
                                titulo,
                                mensaje,
                                "CURRICULUM",
                                urlPea,
                                new Dictionary<string, string>(baseExtraData));
                        }
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DOSIER PEA] Advertencia: No se pudo despachar la notificación del hito '{estadoNuevo}' para el PEA {pea.IdPea}: {ex.Message}");
            }
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
                pea.RecursosDidacticos,
                pea.EvaluacionAprendizaje,
                // CONTENIDO REAL — orden determinístico por Orden
                Unidades = (pea.Unidades ?? Enumerable.Empty<DocPeaUnidad>()).OrderBy(u => u.Orden).Select(u => new
                {
                    u.NumeroUnidad,
                    u.NombreUnidad,
                    u.TotalHorasUnidad,
                    u.HorasDocencia,
                    u.HorasPracticoExp,
                    u.HorasAutonomo,
                    Temas = (u.Temas ?? Enumerable.Empty<DocPeaTema>()).OrderBy(t => t.Orden).Select(t => new
                    {
                        t.NumeroTema,
                        t.TituloTema,
                        t.DescripcionSubtemas
                    })
                }),
                Rdas = (pea.ResultadosAprendizaje ?? Enumerable.Empty<DocPeaResultadoAprendizaje>()).OrderBy(r => r.Orden).Select(r => new
                {
                    r.TipoRda,
                    r.CodigoRda,
                    r.Descripcion,
                    r.NivelDesarrollo
                }),
                Bibliografias = (pea.Bibliografias ?? Enumerable.Empty<DocPeaBibliografia>()).OrderBy(b => b.Orden).Select(b => new
                {
                    b.TipoBibliografia,
                    b.CitaCompletaApa
                }),
                Practicas = (pea.ActividadesPracticas ?? Enumerable.Empty<DocPeaActividadPractica>()).OrderBy(p => p.Orden).Select(p => new
                {
                    p.NumeroPractica,
                    p.NombrePractica,
                    p.Caracterizacion,
                    p.DuracionHoras
                }),
                Prerrequisitos = (pea.Prerrequisitos ?? Enumerable.Empty<DocPeaPrerequisito>()).OrderBy(pr => pr.Orden).Select(pr => new
                {
                    pr.CodigoAsignatura,
                    pr.NombreAsignatura,
                    pr.Observacion
                }),
                Evaluaciones = (pea.Evaluaciones ?? Enumerable.Empty<DocPeaEvaluacion>()).OrderBy(ev => ev.Orden).Select(ev => new
                {
                    ev.Denominacion,
                    ev.TipoEvaluacion,
                    ev.CalificacionMaxima
                })
            };

            var opts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            string json = JsonSerializer.Serialize(payload, opts);
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
            var periodo = !string.IsNullOrEmpty(pea.IdPeriodo)
                ? await _context.Periodos.AsNoTracking().FirstOrDefaultAsync(p => p.IdPeriodo == pea.IdPeriodo)
                : null;
            string nombrePeriodo = !string.IsNullOrWhiteSpace(periodo?.Detalle) ? periodo.Detalle : pea.IdPeriodo;

            // Cargar autoridades oficiales activas del sistema para el PEA
            var autoridades = await _context.DocAutoridadesCurriculares.AsNoTracking()
                .Where(a => a.EsActivo)
                .ToListAsync();

            var coordCarrera = pea.IdCarrera > 0
                ? autoridades.FirstOrDefault(a => a.CargoCurricular == "COORD_CARRERA" && a.IdCarrera == pea.IdCarrera)
                : null;
            var coordAcad = autoridades.FirstOrDefault(a => a.CargoCurricular == "COORD_ACADEMICO" || a.CargoCurricular == "COORD_ACAD");
            var vicerrector = autoridades.FirstOrDefault(a => a.CargoCurricular == "VICERRECTOR");

            // Fallbacks defensivos de metadatos institucionales oficiales de SIGAFI
            string? semestreNivel = pea.SemestreNivel;
            if (string.IsNullOrEmpty(semestreNivel) && pea.IdNivel.HasValue)
            {
                var curso = await _context.Cursos.AsNoTracking().FirstOrDefaultAsync(c => c.IdNivel == pea.IdNivel);
                semestreNivel = curso?.Nivel;
            }

            string modalidad = pea.Modalidad;
            if (string.IsNullOrEmpty(modalidad) && pea.IdModalidad.HasValue)
            {
                var mod = await _context.Modalidades.AsNoTracking().FirstOrDefaultAsync(m => m.IdModalidad == pea.IdModalidad);
                modalidad = mod?.ModalidadImpresion ?? mod?.Modalidad1 ?? "Presencial";
            }

            string? unidadOrg = pea.UnidadOrganizacion;
            decimal totalHoras = pea.TotalHorasAsignatura;
            decimal creditos = pea.Creditos;
            decimal horasCd = pea.HorasContactoDocente;
            decimal horasApe = pea.HorasPracticoExperimental;
            decimal horasTa = pea.HorasAutonomo;

            if ((string.IsNullOrEmpty(unidadOrg) || totalHoras == 0) && pea.IdDetalleMalla.HasValue)
            {
                var detalle = await _context.DetalleMallas.AsNoTracking().FirstOrDefaultAsync(d => d.IdDetalleMalla == pea.IdDetalleMalla);
                if (detalle != null)
                {
                    if (string.IsNullOrEmpty(unidadOrg) && detalle.IdTipoAsignatura > 0)
                    {
                        var tipoAsig = await _context.TiposAsignatura.AsNoTracking().FirstOrDefaultAsync(t => t.IdTipoAsignatura == detalle.IdTipoAsignatura);
                        unidadOrg = tipoAsig?.TipoAsignatura1;
                    }
                    if (totalHoras == 0)
                    {
                        totalHoras = detalle.Horas ?? 0m;
                        creditos = detalle.Creditos ?? 0m;
                        horasCd = detalle.HorasDocente ?? 0m;
                        horasApe = detalle.HorasPracticoExperimental ?? 0m;
                        horasTa = Math.Max(0m, totalHoras - horasCd - horasApe);
                    }
                }
            }

            if (totalHoras > 0 && horasCd <= 0 && horasApe <= 0)
            {
                decimal third = Math.Floor((totalHoras / 3m) * 100m) / 100m;
                horasCd = third;
                horasApe = third;
                horasTa = totalHoras - horasCd - horasApe;
            }

            return new PeaDto
            {
                IdPea = pea.IdPea,
                Uuid = pea.Uuid,
                IdExpediente = pea.IdExpediente,
                IdCarrera = pea.IdCarrera,
                NombreCarrera = carrera?.Carrera1 ?? "Carrera ISTPET",
                CodigoCarrera = !string.IsNullOrWhiteSpace(carrera?.AliasCarrera) ? carrera?.AliasCarrera : carrera?.CodigoCases,
                IdAsignatura = pea.IdAsignatura,
                NombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura",
                CodigoAsignatura = asignatura?.Codigo,
                IdPeriodo = pea.IdPeriodo,
                NombrePeriodo = nombrePeriodo,
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
                Modalidad = modalidad,
                UnidadOrganizacion = unidadOrg,
                SemestreNivel = semestreNivel,
                TotalHorasAsignatura = totalHoras,
                Creditos = creditos,
                HorasContactoDocente = horasCd,
                HorasPracticoExperimental = horasApe,
                HorasAutonomo = horasTa,
                ObjetivoAsignatura = pea.ObjetivoAsignatura,
                MetodologiaEnsenanza = pea.MetodologiaEnsenanza,
                RecursosDidacticos = pea.RecursosDidacticos,
                EvaluacionAprendizaje = pea.EvaluacionAprendizaje,
                Estado = pea.Estado,
                Version = pea.Version,
                Activo = pea.Activo,
                FirmaElaboradoDocente = pea.FirmaElaboradoDocente,
                FechaElaborado = pea.FechaElaborado,
                FirmaRevisadoCoord = pea.FirmaRevisadoCoord,
                FechaRevisadoCoord = pea.FechaRevisadoCoord,
                FirmaRevisadoAcad = pea.FirmaRevisadoAcad,
                FechaRevisadoAcad = pea.FechaRevisadoAcad,
                FirmaAprobadoVicerrector = pea.FirmaAprobadoVicerrector,
                FechaAprobado = pea.FechaAprobado,
                NombreCoordinadorCarrera = coordCarrera?.NombreCompleto,
                NombreCoordinadorAcademico = coordAcad?.NombreCompleto,
                NombreVicerrector = vicerrector?.NombreCompleto,
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
                    IdResultadoPerfil = r.IdResultadoPerfil,
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
                Observaciones = (pea.Estado == "Observado" || pea.Estado == "Corregido" || pea.Estado == "Aprobado")
                    ? pea.Observaciones.OrderByDescending(o => o.FechaObservacion).Select(o => new PeaObservacionDto
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
                    }).ToList()
                    : new List<PeaObservacionDto>(),
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
                }).ToList(),
                Prerrequisitos = pea.Prerrequisitos.OrderBy(pr => pr.Orden).Select(pr => new PeaPrerrequisitoDto
                {
                    IdPrerequisito = pr.IdPrerequisito,
                    Uuid = pr.Uuid,
                    IdPea = pr.IdPea,
                    IdAsignaturaOrigen = pr.IdAsignaturaOrigen,
                    CodigoAsignatura = pr.CodigoAsignatura,
                    NombreAsignatura = pr.NombreAsignatura,
                    Observacion = pr.Observacion,
                    Orden = pr.Orden
                }).ToList(),
                Evaluaciones = pea.Evaluaciones.OrderBy(ev => ev.Orden).Select(ev => new PeaEvaluacionDto
                {
                    IdEvaluacion = ev.IdEvaluacion,
                    Uuid = ev.Uuid,
                    IdPea = ev.IdPea,
                    Denominacion = ev.Denominacion,
                    TipoEvaluacion = ev.TipoEvaluacion,
                    CalificacionMaxima = ev.CalificacionMaxima,
                    Orden = ev.Orden
                }).ToList()
            };
        }

        private static int SafeParseInt(System.Text.Json.JsonElement el, int defaultValue = 0)
        {
            if (el.ValueKind == System.Text.Json.JsonValueKind.Number && el.TryGetInt32(out var v)) return v;
            if (el.ValueKind == System.Text.Json.JsonValueKind.String && int.TryParse(el.GetString(), out var sVal)) return sVal;
            return defaultValue;
        }

        private static decimal SafeParseDecimal(System.Text.Json.JsonElement el, decimal defaultValue = 0m)
        {
            if (el.ValueKind == System.Text.Json.JsonValueKind.Number && el.TryGetDecimal(out var v)) return v;
            if (el.ValueKind == System.Text.Json.JsonValueKind.String)
            {
                var s = el.GetString()?.Replace(',', '.');
                if (decimal.TryParse(s, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var sVal))
                    return sVal;
            }
            return defaultValue;
        }

        private static string SafeParseString(System.Text.Json.JsonElement el, string defaultValue = "")
        {
            if (el.ValueKind == System.Text.Json.JsonValueKind.String) return el.GetString() ?? defaultValue;
            if (el.ValueKind == System.Text.Json.JsonValueKind.Number) return el.GetRawText();
            return defaultValue;
        }

        private static bool SafeTryGetProperty(System.Text.Json.JsonElement el, string[] candidates, out System.Text.Json.JsonElement result)
        {
            foreach (var name in candidates)
            {
                if (el.TryGetProperty(name, out result)) return true;
            }
            if (el.ValueKind == System.Text.Json.JsonValueKind.Object)
            {
                foreach (var prop in el.EnumerateObject())
                {
                    foreach (var name in candidates)
                    {
                        if (string.Equals(prop.Name, name, System.StringComparison.OrdinalIgnoreCase))
                        {
                            result = prop.Value;
                            return true;
                        }
                    }
                }
            }
            result = default;
            return false;
        }

        private static string NormalizarTipoBibliografia(string? tipo)
        {
            if (string.IsNullOrWhiteSpace(tipo)) return "Basica";
            var t = tipo.Trim().ToLowerInvariant();
            if (t.Contains("basic") || t.Contains("básic")) return "Basica";
            if (t.Contains("virt")) return "Virtual";
            return "Consulta";
        }

        private static string NormalizarNivelDesarrollo(string? nivel)
        {
            if (string.IsNullOrWhiteSpace(nivel)) return "Medio";
            var n = nivel.Trim().ToLowerInvariant();
            if (n.Contains("ini")) return "Inicial";
            if (n.Contains("alt") || n.Contains("ava") || n.Contains("prof")) return "Alto";
            return "Medio";
        }

        public async Task<bool> SincronizarMetadataAsync(string peaUuid, string snapshotJson)
        {
            if (string.IsNullOrWhiteSpace(peaUuid) || string.IsNullOrWhiteSpace(snapshotJson)) return false;

            var entity = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .Include(p => p.Prerrequisitos)
                .Include(p => p.Evaluaciones)
                .FirstOrDefaultAsync(p => p.Uuid == peaUuid && p.Activo);

            if (entity == null) return false;

            // Inmutabilidad bajo Ley 67 si el PEA estÃ¡ cerrado/aprobado
            if (entity.Estado is "Aprobado" or "Publicado")
            {
                return false;
            }

            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(snapshotJson);
                var root = doc.RootElement;

                // â”€â”€ 1. Metadatos Descriptivos y Textuales â”€â”€
                if (SafeTryGetProperty(root, new[] { "ObjetivoAsignatura", "objetivo_asignatura", "objetivoAsignatura" }, out var objProp))
                    entity.ObjetivoAsignatura = SafeParseString(objProp, entity.ObjetivoAsignatura ?? "");

                if (SafeTryGetProperty(root, new[] { "MetodologiaEnsenanza", "metodologia_ensenanza", "metodologiaEnsenanza" }, out var metProp))
                    entity.MetodologiaEnsenanza = SafeParseString(metProp, entity.MetodologiaEnsenanza ?? "");

                if (SafeTryGetProperty(root, new[] { "RecursosDidacticos", "recursos_didacticos", "recursosDidacticos" }, out var recProp))
                    entity.RecursosDidacticos = SafeParseString(recProp, entity.RecursosDidacticos ?? "");

                if (SafeTryGetProperty(root, new[] { "EvaluacionAprendizaje", "evaluacion_aprendizaje", "evaluacionAprendizaje" }, out var evaProp))
                    entity.EvaluacionAprendizaje = SafeParseString(evaProp, entity.EvaluacionAprendizaje ?? "");

                if (SafeTryGetProperty(root, new[] { "Modalidad", "modalidad" }, out var modProp))
                {
                    var mVal = SafeParseString(modProp);
                    if (!string.IsNullOrWhiteSpace(mVal)) entity.Modalidad = mVal;
                }

                if (SafeTryGetProperty(root, new[] { "UnidadOrganizacion", "unidad_organizacion", "unidadOrganizacion" }, out var uoProp))
                {
                    var uVal = SafeParseString(uoProp);
                    if (!string.IsNullOrWhiteSpace(uVal)) entity.UnidadOrganizacion = uVal;
                }

                if (SafeTryGetProperty(root, new[] { "Nivel", "nivel", "semestre_nivel", "semestreNivel" }, out var nivProp))
                {
                    var nVal = SafeParseString(nivProp);
                    if (!string.IsNullOrWhiteSpace(nVal)) entity.SemestreNivel = nVal;
                }

                // â”€â”€ 2. Carga Horaria y CrÃ©ditos Normados â”€â”€
                if (SafeTryGetProperty(root, new[] { "TotalHorasAsignatura", "total_horas", "totalHorasAsignatura" }, out var thProp))
                {
                    int thVal = SafeParseInt(thProp);
                    if (thVal > 0) entity.TotalHorasAsignatura = thVal;
                }

                if (SafeTryGetProperty(root, new[] { "Creditos", "creditos" }, out var credProp))
                {
                    decimal credVal = SafeParseDecimal(credProp);
                    if (credVal > 0) entity.Creditos = credVal;
                }

                if (SafeTryGetProperty(root, new[] { "HorasContactoDocente", "horas_docencia", "horasContactoDocente", "horasDocencia", "horasCD" }, out var hcdProp))
                {
                    entity.HorasContactoDocente = SafeParseDecimal(hcdProp, entity.HorasContactoDocente);
                }

                if (SafeTryGetProperty(root, new[] { "HorasPracticoExperimental", "horas_practica", "horasPracticoExperimental", "horasPractica", "horasAPE" }, out var hpeProp))
                {
                    entity.HorasPracticoExperimental = SafeParseDecimal(hpeProp, entity.HorasPracticoExperimental);
                }

                if (SafeTryGetProperty(root, new[] { "HorasAutonomo", "horas_autonomo", "horasAutonomo", "horasTA" }, out var haProp))
                {
                    entity.HorasAutonomo = SafeParseDecimal(haProp, entity.HorasAutonomo);
                }

                // â”€â”€ 3. SincronizaciÃ³n Relacional: Unidades TemÃ¡ticas y Subtemas â”€â”€
                if (SafeTryGetProperty(root, new[] { "Unidades", "unidades" }, out var unProp) && unProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    var temasAEliminar = entity.Unidades.SelectMany(u => u.Temas).ToList();
                    if (temasAEliminar.Any())
                    {
                        _context.DocPeaTemas.RemoveRange(temasAEliminar);
                    }
                    _context.DocPeaUnidades.RemoveRange(entity.Unidades);
                    entity.Unidades.Clear();

                    int uIdx = 1;
                    foreach (var uEl in unProp.EnumerateArray())
                    {
                        string titulo = "";
                        if (SafeTryGetProperty(uEl, new[] { "titulo", "Titulo", "NombreUnidad", "nombre_unidad", "nombreUnidad", "0" }, out var tP))
                            titulo = SafeParseString(tP);

                        decimal cd = 0m, ape = 0m, ta = 0m;
                        if (SafeTryGetProperty(uEl, new[] { "horasCD", "HorasCD", "horasDocencia", "horas_docencia", "horasDocente", "2" }, out var cdP))
                            cd = SafeParseDecimal(cdP);
                        if (SafeTryGetProperty(uEl, new[] { "horasAPE", "HorasAPE", "horasPracticoExp", "horas_practica", "horasPractica", "3" }, out var apeP))
                            ape = SafeParseDecimal(apeP);
                        if (SafeTryGetProperty(uEl, new[] { "horasTA", "HorasTA", "horasAutonomo", "horas_autonomo", "4" }, out var taP))
                            ta = SafeParseDecimal(taP);

                        decimal totalH = cd + ape + ta;
                        if (SafeTryGetProperty(uEl, new[] { "TotalHorasUnidad", "total_horas", "horasTotal", "HorasTotal", "totalHoras", "5" }, out var thuP))
                        {
                            decimal thuV = SafeParseDecimal(thuP);
                            if (thuV > 0m) totalH = thuV;
                        }

                        var temasList = new List<DocPeaTema>();
                        if (SafeTryGetProperty(uEl, new[] { "Temas", "temas" }, out var tmProp) && tmProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            int tIdx = 1;
                            foreach (var tmEl in tmProp.EnumerateArray())
                            {
                                string tTitulo = "";
                                if (SafeTryGetProperty(tmEl, new[] { "TituloTema", "titulo_tema", "tituloTema", "titulo", "nombre" }, out var ttP))
                                    tTitulo = SafeParseString(ttP);

                                string tDesc = "";
                                if (SafeTryGetProperty(tmEl, new[] { "DescripcionSubtemas", "descripcion_subtemas", "descripcionSubtemas", "descripcion" }, out var dsP))
                                    tDesc = SafeParseString(dsP);

                                if (!string.IsNullOrWhiteSpace(tTitulo) || !string.IsNullOrWhiteSpace(tDesc))
                                {
                                    temasList.Add(new DocPeaTema
                                    {
                                        Uuid = Guid.NewGuid().ToString(),
                                        NumeroTema = tIdx,
                                        TituloTema = string.IsNullOrWhiteSpace(tTitulo) ? $"Tema {tIdx}" : tTitulo,
                                        DescripcionSubtemas = tDesc,
                                        Orden = tIdx
                                    });
                                    tIdx++;
                                }
                            }
                        }

                        if (temasList.Count == 0)
                        {
                            string contenidos = "";
                            if (SafeTryGetProperty(uEl, new[] { "contenidos", "Contenidos", "1" }, out var contP))
                                contenidos = SafeParseString(contP);

                            temasList.Add(new DocPeaTema
                            {
                                Uuid = Guid.NewGuid().ToString(),
                                NumeroTema = 1,
                                TituloTema = "Contenidos y Subtemas de Aprendizaje",
                                DescripcionSubtemas = contenidos,
                                Orden = 1
                            });
                        }

                        var nuevaUnidad = new DocPeaUnidad
                        {
                            Uuid = Guid.NewGuid().ToString(),
                            IdPea = entity.IdPea,
                            NumeroUnidad = uIdx,
                            NombreUnidad = string.IsNullOrWhiteSpace(titulo) ? $"Unidad {uIdx}" : titulo,
                            TotalHorasUnidad = totalH,
                            HorasDocencia = cd,
                            HorasPracticoExp = ape,
                            HorasAutonomo = ta,
                            Orden = uIdx,
                            Temas = temasList
                        };
                        entity.Unidades.Add(nuevaUnidad);
                        uIdx++;
                    }
                }

                // â”€â”€ 4. SincronizaciÃ³n Relacional: Prerrequisitos Curriculares â”€â”€
                if (SafeTryGetProperty(root, new[] { "Prerrequisitos", "prerrequisitos" }, out var prProp) && prProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    _context.DocPeaPrerrequisitos.RemoveRange(entity.Prerrequisitos);
                    entity.Prerrequisitos.Clear();

                    int pIdx = 1;
                    foreach (var prEl in prProp.EnumerateArray())
                    {
                        string asig = "";
                        if (SafeTryGetProperty(prEl, new[] { "Asignatura", "asignatura", "NombreAsignatura", "nombre_asignatura", "nombreAsignatura", "nombre", "0" }, out var asP))
                            asig = SafeParseString(asP);

                        string obs = "";
                        if (SafeTryGetProperty(prEl, new[] { "Observacion", "observacion", "Condicion", "condicion", "1" }, out var obP))
                            obs = SafeParseString(obP);

                        if (!string.IsNullOrWhiteSpace(asig))
                        {
                            entity.Prerrequisitos.Add(new DocPeaPrerequisito
                            {
                                Uuid = Guid.NewGuid().ToString(),
                                IdPea = entity.IdPea,
                                NombreAsignatura = asig,
                                Observacion = obs,
                                Orden = pIdx++
                            });
                        }
                    }
                }

                // â”€â”€ 5. SincronizaciÃ³n Relacional: Actividades PrÃ¡cticas y Experimentales (APE) â”€â”€
                if (SafeTryGetProperty(root, new[] { "ActividadesPracticas", "actividades_practicas", "actividadesPracticas" }, out var apProp) && apProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    _context.DocPeaActividadesPracticas.RemoveRange(entity.ActividadesPracticas);
                    entity.ActividadesPracticas.Clear();

                    int prIdx = 1;
                    foreach (var prEl in apProp.EnumerateArray())
                    {
                        string nombre = "";
                        if (SafeTryGetProperty(prEl, new[] { "nombre", "Nombre", "NombrePractica", "nombre_practica", "nombrePractica", "descripcion", "1" }, out var nmP))
                            nombre = SafeParseString(nmP);

                        decimal horas = 2m;
                        if (SafeTryGetProperty(prEl, new[] { "horas", "Horas", "DuracionHoras", "duracion_horas", "duracionHoras", "2" }, out var hP))
                            horas = SafeParseDecimal(hP, 2m);

                        string esc = "";
                        if (SafeTryGetProperty(prEl, new[] { "escenario", "Escenario" }, out var escP))
                            esc = SafeParseString(escP);

                        string prod = "";
                        if (SafeTryGetProperty(prEl, new[] { "producto", "Producto" }, out var prdP))
                            prod = SafeParseString(prdP);

                        string caracterizacion = "";
                        if (SafeTryGetProperty(prEl, new[] { "caracterizacion", "Caracterizacion" }, out var carP))
                            caracterizacion = SafeParseString(carP);

                        if (string.IsNullOrWhiteSpace(caracterizacion))
                        {
                            caracterizacion = string.Join(" | ", new[] { esc, prod }.Where(s => !string.IsNullOrWhiteSpace(s)));
                        }

                        if (!string.IsNullOrWhiteSpace(nombre))
                        {
                            entity.ActividadesPracticas.Add(new DocPeaActividadPractica
                            {
                                Uuid = Guid.NewGuid().ToString(),
                                IdPea = entity.IdPea,
                                NumeroPractica = prIdx,
                                NombrePractica = nombre,
                                Caracterizacion = caracterizacion,
                                DuracionHoras = horas,
                                Orden = prIdx++
                            });
                        }
                    }
                }

                // â”€â”€ 6. SincronizaciÃ³n Relacional: Matriz Oficial de Evaluaciones â”€â”€
                if (SafeTryGetProperty(root, new[] { "Evaluaciones", "evaluaciones" }, out var evProp) && evProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    _context.DocPeaEvaluaciones.RemoveRange(entity.Evaluaciones);
                    entity.Evaluaciones.Clear();

                    int evIdx = 1;
                    foreach (var evEl in evProp.EnumerateArray())
                    {
                        string nota = "";
                        if (SafeTryGetProperty(evEl, new[] { "nota", "Nota", "Denominacion", "denominacion", "0" }, out var ntP))
                            nota = SafeParseString(ntP);

                        string tipo = "";
                        if (SafeTryGetProperty(evEl, new[] { "tipo", "Tipo", "TipoEvaluacion", "tipo_evaluacion", "tipoEvaluacion", "1" }, out var tpP))
                            tipo = SafeParseString(tpP);

                        decimal calif = 10m;
                        if (SafeTryGetProperty(evEl, new[] { "calificacion", "Calificacion", "CalificacionMaxima", "calificacion_maxima", "calificacionMaxima", "2" }, out var clP))
                            calif = SafeParseDecimal(clP, 10m);

                        if (!string.IsNullOrWhiteSpace(nota))
                        {
                            entity.Evaluaciones.Add(new DocPeaEvaluacion
                            {
                                Uuid = Guid.NewGuid().ToString(),
                                IdPea = entity.IdPea,
                                Denominacion = nota,
                                TipoEvaluacion = tipo,
                                CalificacionMaxima = calif,
                                Orden = evIdx++
                            });
                        }
                    }
                }

                // â”€â”€ 7. SincronizaciÃ³n Relacional: Resultados de Aprendizaje (RDAs Carrera y Asignatura) â”€â”€
                _context.DocPeaResultadosAprendizaje.RemoveRange(entity.ResultadosAprendizaje);
                entity.ResultadosAprendizaje.Clear();

                // 7.1 RDA de Carrera (Perfil de Egreso)
                if (SafeTryGetProperty(root, new[] { "RdaCarrera", "rda_carrera", "rdacarrera", "RDA_Carrera" }, out var rdaCarreraProp))
                {
                    string rdaCarreraVal = SafeParseString(rdaCarreraProp);
                    if (!string.IsNullOrWhiteSpace(rdaCarreraVal))
                    {
                        entity.ResultadosAprendizaje.Add(new DocPeaResultadoAprendizaje
                        {
                            Uuid = Guid.NewGuid().ToString(),
                            IdPea = entity.IdPea,
                            CodigoRda = "RDA-EGRESO",
                            Descripcion = rdaCarreraVal,
                            NivelDesarrollo = "Alto",
                            TipoRda = "Carrera",
                            Orden = 0
                        });
                    }
                }

                // 7.2 RDAs de Asignatura
                int rIdx = 1;
                if (SafeTryGetProperty(root, new[] { "ResultadosAprendizaje", "resultados_aprendizaje", "resultadosAprendizaje" }, out var rdaProp))
                {
                    if (rdaProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                    {
                        foreach (var rEl in rdaProp.EnumerateArray())
                        {
                            if (rEl.ValueKind == System.Text.Json.JsonValueKind.String)
                            {
                                string textVal = rEl.GetString() ?? "";
                                if (!string.IsNullOrWhiteSpace(textVal))
                                {
                                    entity.ResultadosAprendizaje.Add(new DocPeaResultadoAprendizaje
                                    {
                                        Uuid = Guid.NewGuid().ToString(),
                                        IdPea = entity.IdPea,
                                        CodigoRda = $"RDA-{rIdx}",
                                        Descripcion = textVal,
                                        NivelDesarrollo = "Medio",
                                        TipoRda = "Asignatura",
                                        Orden = rIdx++
                                    });
                                }
                            }
                            else if (rEl.ValueKind == System.Text.Json.JsonValueKind.Object)
                            {
                                string codigo = "";
                                if (SafeTryGetProperty(rEl, new[] { "CodigoRda", "codigo_rda", "codigoRda", "codigo" }, out var cP))
                                    codigo = SafeParseString(cP);

                                string desc = "";
                                if (SafeTryGetProperty(rEl, new[] { "Descripcion", "descripcion", "texto", "rda" }, out var dP))
                                    desc = SafeParseString(dP);

                                string nivel = "Medio";
                                if (SafeTryGetProperty(rEl, new[] { "NivelDesarrollo", "nivel_desarrollo", "nivelDesarrollo", "nivel" }, out var nP))
                                    nivel = NormalizarNivelDesarrollo(SafeParseString(nP, "Medio"));

                                if (!string.IsNullOrWhiteSpace(desc))
                                {
                                    entity.ResultadosAprendizaje.Add(new DocPeaResultadoAprendizaje
                                    {
                                        Uuid = Guid.NewGuid().ToString(),
                                        IdPea = entity.IdPea,
                                        CodigoRda = string.IsNullOrWhiteSpace(codigo) ? $"RDA-{rIdx}" : codigo,
                                        Descripcion = desc,
                                        NivelDesarrollo = nivel,
                                        TipoRda = "Asignatura",
                                        Orden = rIdx++
                                    });
                                }
                            }
                        }
                    }
                    else if (rdaProp.ValueKind == System.Text.Json.JsonValueKind.String && !string.IsNullOrWhiteSpace(rdaProp.GetString()))
                    {
                        var rawText = rdaProp.GetString()!;
                        var cleaned = System.Text.RegularExpressions.Regex.Replace(rawText, @"<[^>]+>", "\n");
                        var lines = cleaned.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                        foreach (var line in lines)
                        {
                            if (!string.IsNullOrWhiteSpace(line))
                            {
                                entity.ResultadosAprendizaje.Add(new DocPeaResultadoAprendizaje
                                {
                                    Uuid = Guid.NewGuid().ToString(),
                                    IdPea = entity.IdPea,
                                    CodigoRda = $"RDA-{rIdx}",
                                    Descripcion = line,
                                    NivelDesarrollo = "Medio",
                                    TipoRda = "Asignatura",
                                    Orden = rIdx++
                                });
                            }
                        }
                    }
                }

                // â”€â”€ 8. SincronizaciÃ³n Relacional: BibliografÃ­a BÃ¡sica y Complementaria â”€â”€
                _context.DocPeaBibliografias.RemoveRange(entity.Bibliografias);
                entity.Bibliografias.Clear();

                bool hasArrayBiblio = SafeTryGetProperty(root, new[] { "Bibliografias", "bibliografias" }, out var bProp) &&
                                      bProp.ValueKind == System.Text.Json.JsonValueKind.Array &&
                                      bProp.GetArrayLength() > 0;

                int bIdx = 1;
                if (hasArrayBiblio)
                {
                    foreach (var bEl in bProp.EnumerateArray())
                    {
                        string tipo = "Basica";
                        if (SafeTryGetProperty(bEl, new[] { "TipoBibliografia", "tipo_bibliografia", "tipoBibliografia", "tipo" }, out var tbP))
                            tipo = NormalizarTipoBibliografia(SafeParseString(tbP, "Basica"));

                        string autor = "";
                        if (SafeTryGetProperty(bEl, new[] { "Autor", "autor" }, out var aP))
                            autor = SafeParseString(aP);

                        string titulo = "";
                        if (SafeTryGetProperty(bEl, new[] { "TituloLibro", "titulo_libro", "tituloLibro", "titulo" }, out var tlP))
                            titulo = SafeParseString(tlP);

                        string cita = "";
                        if (SafeTryGetProperty(bEl, new[] { "CitaCompletaApa", "cita_completa_apa", "citaCompletaApa", "cita" }, out var caP))
                            cita = SafeParseString(caP);

                        string editorial = "";
                        if (SafeTryGetProperty(bEl, new[] { "EditorialCiudad", "editorial_ciudad", "editorialCiudad", "editorial" }, out var edP))
                            editorial = SafeParseString(edP);

                        string finalTitulo = !string.IsNullOrWhiteSpace(titulo) ? titulo : (!string.IsNullOrWhiteSpace(cita) ? cita : "Bibliografía Institucional");
                        string finalCita = !string.IsNullOrWhiteSpace(cita) ? cita : $"{autor} {finalTitulo}".Trim();

                        entity.Bibliografias.Add(new DocPeaBibliografia
                        {
                            Uuid = Guid.NewGuid().ToString(),
                            IdPea = entity.IdPea,
                            TipoBibliografia = tipo,
                            Autor = autor,
                            TituloLibro = finalTitulo,
                            EditorialCiudad = editorial,
                            CitaCompletaApa = finalCita,
                            Orden = bIdx++
                        });
                    }
                }
                else
                {
                    // Fallback desde campos de texto enriquecido BibliografiaBasica y BibliografiaConsulta
                    if (SafeTryGetProperty(root, new[] { "BibliografiaBasica", "bibliografia_basica", "bibliografiaBasica" }, out var bbProp) &&
                        bbProp.ValueKind == System.Text.Json.JsonValueKind.String &&
                        !string.IsNullOrWhiteSpace(bbProp.GetString()))
                    {
                        var cleaned = System.Text.RegularExpressions.Regex.Replace(bbProp.GetString()!, @"<[^>]+>", "\n");
                        var lines = cleaned.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                        foreach (var line in lines)
                        {
                            if (!string.IsNullOrWhiteSpace(line))
                            {
                                entity.Bibliografias.Add(new DocPeaBibliografia
                                {
                                    Uuid = Guid.NewGuid().ToString(),
                                    IdPea = entity.IdPea,
                                    TipoBibliografia = "Basica",
                                    CitaCompletaApa = line,
                                    TituloLibro = line,
                                    Orden = bIdx++
                                });
                            }
                        }
                    }

                    if (SafeTryGetProperty(root, new[] { "BibliografiaConsulta", "bibliografia_consulta", "bibliografiaConsulta", "bibliografiaComplementaria" }, out var bcProp) &&
                        bcProp.ValueKind == System.Text.Json.JsonValueKind.String &&
                        !string.IsNullOrWhiteSpace(bcProp.GetString()))
                    {
                        var cleaned = System.Text.RegularExpressions.Regex.Replace(bcProp.GetString()!, @"<[^>]+>", "\n");
                        var lines = cleaned.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                        foreach (var line in lines)
                        {
                            if (!string.IsNullOrWhiteSpace(line))
                            {
                                entity.Bibliografias.Add(new DocPeaBibliografia
                                {
                                    Uuid = Guid.NewGuid().ToString(),
                                    IdPea = entity.IdPea,
                                    TipoBibliografia = "Consulta",
                                    CitaCompletaApa = line,
                                    TituloLibro = line,
                                    Orden = bIdx++
                                });
                            }
                        }
                    }
                }

                entity.FechaModificacion = System.DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (System.Exception ex)
            {
                var innerMsg = ex.InnerException != null ? $"{ex.Message} -> {ex.InnerException.Message}" : ex.Message;
                System.Console.WriteLine($"[DOSIER] Error al sincronizar metadata de PEA: {innerMsg} {ex.StackTrace}");
                return false;
            }
        }


        public async Task<List<PeaBandejaItemDto>> ListarBandejaAsync(
            string? idPeriodo,
            int? idCarrera,
            string? estado,
            int idUsuario,
            string? identifier = null,
            bool alcanceInstitucional = false,
            System.Threading.CancellationToken cancellationToken = default)
        {
            User? user = null;
            if (idUsuario > 0)
            {
                user = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.IdUsuario == idUsuario, cancellationToken);
            }

            if (user == null && !string.IsNullOrEmpty(identifier))
            {
                user = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.IdSigafi == identifier || u.EmailInstitucional == identifier, cancellationToken);
            }

            if (user == null)
            {
                return new List<PeaBandejaItemDto>();
            }

            int resolvedUserId = user.IdUsuario;

            var userRoles = await _context.UserRoles
                .AsNoTracking()
                .Where(ur => ur.IdUsuario == resolvedUserId && (ur.EsActivo ?? true) && ur.Role != null)
                .Select(ur => ur.Role.CodigoRol)
                .ToListAsync(cancellationToken);

            bool isAdmin = user.Administrador || userRoles.Contains("DOSIER_ADMIN");
            bool isVicerrector = userRoles.Contains("DOSIER_VICERRECTOR");
            bool isCoordAcad = userRoles.Contains("DOSIER_COORD_ACAD");
            bool isCoordCarrera = userRoles.Contains("DOSIER_COORD_CARRERA");

            var query = _context.DocPeas.AsNoTracking()
                .Include(p => p.Observaciones)
                .Where(p => p.Activo);

            // Filtrado resiliente de período (ignora mayúsculas/minúsculas y comodines 'todos'/'todas')
            if (!string.IsNullOrWhiteSpace(idPeriodo) &&
                !string.Equals(idPeriodo, "todos", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(idPeriodo, "todas", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.IdPeriodo == idPeriodo.Trim());
            }

            if (idCarrera.HasValue && idCarrera.Value > 0)
            {
                query = query.Where(p => p.IdCarrera == idCarrera.Value);
            }

            // Filtrado resiliente de estado (ignora mayúsculas/minúsculas y comodines 'todos'/'todas')
            if (!string.IsNullOrWhiteSpace(estado) &&
                !string.Equals(estado, "todos", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(estado, "todas", StringComparison.OrdinalIgnoreCase))
            {
                var estLimpio = estado.Trim();
                query = query.Where(p => p.Estado == estLimpio);
            }

            // Gobernanza de visibilidad y alcance institucional por rol:
            // 1. Docentes regulares sin rol de autoridad: ven exclusivamente sus PEAs elaborados.
            if (!isAdmin && !isVicerrector && !isCoordAcad && !isCoordCarrera)
            {
                if (!string.IsNullOrEmpty(user.IdSigafi))
                {
                    query = query.Where(p => p.IdDocenteElaborador == user.IdSigafi);
                }
            }
            // 2. Coordinadores de Carrera (DOSIER_COORD_CARRERA exclusivo): ven ÚNICAMENTE las materias de sus carreras asignadas.
            // Regla institucional estricta: Los coordinadores de carrera supervisan solo de sus carreras, mientras que el coordinador académico supervisa todas.
            else if (isCoordCarrera && !isAdmin && !isVicerrector && !isCoordAcad && !string.IsNullOrEmpty(user.IdSigafi))
            {
                var carrerasCoordinadas = await _context.DocAutoridadesCurriculares.AsNoTracking()
                    .Where(a => a.IdSigafi == user.IdSigafi && a.EsActivo && a.CargoCurricular == "COORD_CARRERA" && a.IdCarrera != null)
                    .Select(a => a.IdCarrera!.Value)
                    .ToListAsync(cancellationToken);

                if (carrerasCoordinadas.Any())
                {
                    query = query.Where(p => carrerasCoordinadas.Contains(p.IdCarrera) || p.IdDocenteElaborador == user.IdSigafi);
                }
                else
                {
                    query = query.Where(p => p.IdDocenteElaborador == user.IdSigafi);
                }
            }
            // 3. Coordinador Académico (DOSIER_COORD_ACAD), Vicerrector (DOSIER_VICERRECTOR) y Admin (DOSIER_ADMIN):
            // Supervisión macro-curricular institucional: tienen acceso y supervisión sobre todas las carreras.
            // Nota de Arquitectura y Rendimiento: La consulta de la bandeja es estrictamente de lectura (idempotente).
            // Se desacopla el auto-aprovisionamiento bloqueante para garantizar tiempos de respuesta sub-100ms.

            var peas = await query
                .OrderByDescending(p => p.FechaModificacion)
                .ToListAsync(cancellationToken);

            if (!peas.Any()) return new List<PeaBandejaItemDto>();

            // Carga por lotes segura con GroupBy para prevenir colisiones de claves en diccionarios
            var carreraIds = peas.Select(p => p.IdCarrera).Distinct().ToList();
            var asignaturaIds = peas.Select(p => p.IdAsignatura).Distinct().ToList();
            var docenteIds = peas.Where(p => !string.IsNullOrEmpty(p.IdDocenteElaborador))
                                 .Select(p => p.IdDocenteElaborador!)
                                 .Distinct().ToList();

            var carrerasList = await _context.Carreras.AsNoTracking()
                .Where(c => carreraIds.Contains(c.IdCarrera))
                .Select(c => new { c.IdCarrera, c.Carrera1 })
                .ToListAsync(cancellationToken);
            var carrerasDict = carrerasList
                .GroupBy(c => c.IdCarrera)
                .ToDictionary(g => g.Key, g => g.First().Carrera1);

            var asignaturasList = await _context.Asignaturas.AsNoTracking()
                .Where(a => asignaturaIds.Contains(a.IdAsignatura))
                .Select(a => new { a.IdAsignatura, a.Asignatura1, a.Codigo })
                .ToListAsync(cancellationToken);
            var asignaturasDict = asignaturasList
                .GroupBy(a => a.IdAsignatura)
                .ToDictionary(g => g.Key, g => new { g.First().Asignatura1, g.First().Codigo });

            var profesoresList = await _context.Profesores.AsNoTracking()
                .Where(p => docenteIds.Contains(p.IdProfesor))
                .Select(p => new { p.IdProfesor, Nombre = $"{p.Nombres} {p.Apellidos}".Trim() })
                .ToListAsync(cancellationToken);
            var profesoresDict = profesoresList
                .GroupBy(p => p.IdProfesor)
                .ToDictionary(g => g.Key, g => g.First().Nombre);

            return peas.Select(p =>
            {
                carrerasDict.TryGetValue(p.IdCarrera, out var nomCarrera);
                asignaturasDict.TryGetValue(p.IdAsignatura, out var asigInfo);
                string? nomDocente = null;
                if (!string.IsNullOrEmpty(p.IdDocenteElaborador))
                {
                    profesoresDict.TryGetValue(p.IdDocenteElaborador, out nomDocente);
                }

                return new PeaBandejaItemDto
                {
                    IdPea = p.IdPea,
                    Uuid = p.Uuid,
                    IdCarrera = p.IdCarrera,
                    NombreCarrera = nomCarrera ?? "Carrera ISTPET",
                    IdAsignatura = p.IdAsignatura,
                    NombreAsignatura = asigInfo?.Asignatura1 ?? "Asignatura",
                    CodigoAsignatura = asigInfo?.Codigo,
                    IdPeriodo = p.IdPeriodo,
                    IdDocenteElaborador = p.IdDocenteElaborador,
                    NombreDocenteElaborador = nomDocente,
                    Modalidad = p.Modalidad,
                    SemestreNivel = p.SemestreNivel,
                    Paralelo = p.Paralelo,
                    TotalHorasAsignatura = p.TotalHorasAsignatura,
                    Creditos = p.Creditos,
                    HorasContactoDocente = p.HorasContactoDocente,
                    HorasPracticoExperimental = p.HorasPracticoExperimental,
                    HorasAutonomo = p.HorasAutonomo,
                    Estado = p.Estado,
                    Version = p.Version,
                    FechaModificacion = p.FechaModificacion,
                    FirmaDocente = !string.IsNullOrEmpty(p.FirmaElaboradoDocente),
                    FechaElaborado = p.FechaElaborado,
                    FirmaCoord = !string.IsNullOrEmpty(p.FirmaRevisadoCoord),
                    FechaRevisadoCoord = p.FechaRevisadoCoord,
                    FirmaAcad = !string.IsNullOrEmpty(p.FirmaRevisadoAcad),
                    FechaRevisadoAcad = p.FechaRevisadoAcad,
                    FirmaVicerrector = !string.IsNullOrEmpty(p.FirmaAprobadoVicerrector),
                    FechaAprobado = p.FechaAprobado,
                    TotalObservacionesPendientes = (p.Estado == "Observado") ? (p.Observaciones?.Count(o => o.Estado == "Pendiente") ?? 0) : 0
                };
            }).ToList();
        }

        /// <summary>
        /// Sincroniza y auto-aprovisiona de forma proactiva todos los PEAs correspondientes al distributivo
        /// académico oficial de SIGAFI, garantizando que el 100% de la carga institucional esté disponible
        /// en la bandeja y en las analíticas sin requerir que el docente haya abierto previamente el documento.
        /// </summary>
        private async Task SincronizarDistributivoInternoAsync(
            string? idPeriodo,
            int? idCarrera,
            string? idSigafi,
            bool tieneAlcanceGlobal,
            CancellationToken cancellationToken)
        {
            try
            {
                string targetPeriodo = idPeriodo?.Trim() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(targetPeriodo) ||
                    string.Equals(targetPeriodo, "todos", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(targetPeriodo, "todas", StringComparison.OrdinalIgnoreCase))
                {
                    var activo = await _context.Periodos.AsNoTracking()
                        .Where(p => p.Periodoactivoinstituto == 1 || p.Activo == true)
                        .Select(p => p.IdPeriodo)
                        .FirstOrDefaultAsync(cancellationToken);
                    targetPeriodo = activo ?? string.Empty;
                }

                if (string.IsNullOrWhiteSpace(targetPeriodo)) return;

                var asigQuery = _context.AsignacionesProfesores.AsNoTracking()
                    .Where(a => a.IdPeriodo == targetPeriodo && a.Activo == 1 && a.ExtraCurricular != 1);

                if (!tieneAlcanceGlobal && !string.IsNullOrEmpty(idSigafi))
                {
                    asigQuery = asigQuery.Where(a => a.IdProfesor == idSigafi);
                }

                var asignaciones = await asigQuery.ToListAsync(cancellationToken);
                if (!asignaciones.Any()) return;

                var asignacionIds = asignaciones.Select(a => a.IdAsignacion).ToList();
                var peasExistentes = await _context.DocPeas.AsNoTracking()
                    .Where(p => p.IdAsignacion.HasValue && asignacionIds.Contains(p.IdAsignacion.Value) && p.Activo)
                    .Select(p => p.IdAsignacion!.Value)
                    .ToListAsync(cancellationToken);

                var missing = asignaciones.Where(a => !peasExistentes.Contains(a.IdAsignacion)).ToList();
                if (!missing.Any()) return;

                foreach (var m in missing)
                {
                    try
                    {
                        await CrearDesdeAsignacionAsync(m.IdAsignacion, m.IdProfesor);
                    }
                    catch
                    {
                        // Best effort: se continúa con las siguientes asignaciones
                    }
                }
            }
            catch
            {
                // Fallo tolerante
            }
        }

        public async Task<List<PeaBandejaItemDto>> ListarPeasOtrosDocentesAsync(
            string? idPeriodo,
            int? idCarrera,
            string? identifier = null,
            CancellationToken cancellationToken = default)
        {
            var user = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi == identifier || u.IdUsuario.ToString() == identifier || u.Nombre == identifier, cancellationToken);

            string? idSigafi = user?.IdSigafi ?? identifier;

            // 1. Determinar período objetivo (si no se proporciona o es "todos", usar período activo)
            string targetPeriodo = idPeriodo?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(targetPeriodo) ||
                string.Equals(targetPeriodo, "todos", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(targetPeriodo, "todas", StringComparison.OrdinalIgnoreCase))
            {
                var activo = await _context.Periodos.AsNoTracking()
                    .Where(p => p.Periodoactivoinstituto == 1 || p.Activo == true)
                    .Select(p => p.IdPeriodo)
                    .FirstOrDefaultAsync(cancellationToken);
                targetPeriodo = activo ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(targetPeriodo))
            {
                return new List<PeaBandejaItemDto>();
            }

            // 2. Obtener las carreras en las que el docente tiene carga académica en este período
            // Un docente solo debe poder ver los PEAs de otros docentes que pertenezcan a su(s) misma(s) carrera(s)
            var misCarreraIds = new List<int>();
            if (!string.IsNullOrEmpty(idSigafi))
            {
                var misNivelesDocente = await _context.AsignacionesProfesores.AsNoTracking()
                    .Where(a => a.IdProfesor == idSigafi && a.IdPeriodo == targetPeriodo && a.Activo == 1)
                    .Select(a => a.IdNivel)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                if (misNivelesDocente.Any())
                {
                    misCarreraIds = await _context.Cursos.AsNoTracking()
                        .Where(c => misNivelesDocente.Contains(c.IdNivel))
                        .Select(c => c.IdCarrera)
                        .Distinct()
                        .ToListAsync(cancellationToken);
                }
            }

            // 3. Obtener todas las asignaciones curriculares del período en SIGAFI, excluyendo al docente actual
            var asignacionesQuery = _context.AsignacionesProfesores.AsNoTracking()
                .Where(a => a.IdPeriodo == targetPeriodo && a.Activo == 1 && a.ExtraCurricular != 1);

            if (!string.IsNullOrEmpty(idSigafi))
            {
                asignacionesQuery = asignacionesQuery.Where(a => a.IdProfesor != idSigafi);
            }

            var asignaciones = await asignacionesQuery.ToListAsync(cancellationToken);

            if (!asignaciones.Any())
            {
                return new List<PeaBandejaItemDto>();
            }

            // 4. Resolver catálogos de SIGAFI (Cursos, Carreras del Instituto, Asignaturas, Modalidades, Profesores)
            var nivelIds = asignaciones.Select(a => a.IdNivel).Distinct().ToList();
            var cursosList = await _context.Cursos.AsNoTracking()
                .Where(c => nivelIds.Contains(c.IdNivel))
                .ToListAsync(cancellationToken);
            var cursosMap = cursosList.GroupBy(c => c.IdNivel).ToDictionary(g => g.Key, g => g.First());

            var carreraIds = cursosMap.Values.Select(c => c.IdCarrera).Distinct().ToList();
            var carrerasList = await _context.Carreras.AsNoTracking()
                .Where(c => carreraIds.Contains(c.IdCarrera) && c.EsInstituto == 1)
                .ToListAsync(cancellationToken);
            var carrerasMap = carrerasList.GroupBy(c => c.IdCarrera).ToDictionary(g => g.Key, g => g.First());

            // Filtrar asignaciones correspondientes únicamente a las carreras del docente institucional (y por idCarrera si aplica)
            var asignacionesFiltradas = asignaciones.Where(a =>
            {
                if (!cursosMap.TryGetValue(a.IdNivel, out var cur)) return false;
                if (!carrerasMap.TryGetValue(cur.IdCarrera, out var car)) return false;
                // Restricción disciplinar: solo materias de su(s) carrera(s)
                if (misCarreraIds.Any() && !misCarreraIds.Contains(car.IdCarrera)) return false;
                if (idCarrera.HasValue && idCarrera.Value > 0 && car.IdCarrera != idCarrera.Value) return false;
                return true;
            }).ToList();

            if (!asignacionesFiltradas.Any())
            {
                return new List<PeaBandejaItemDto>();
            }

            var asigIds = asignacionesFiltradas.Select(a => a.IdAsignatura).Distinct().ToList();
            var asignaturasList = await _context.Asignaturas.AsNoTracking()
                .Where(a => asigIds.Contains(a.IdAsignatura))
                .ToListAsync(cancellationToken);
            var asignaturasMap = asignaturasList.GroupBy(a => a.IdAsignatura).ToDictionary(g => g.Key, g => g.First());

            var modalidadIds = asignacionesFiltradas.Select(a => a.IdModalidad).Distinct().ToList();
            var modalidadesList = await _context.Modalidades.AsNoTracking()
                .Where(m => modalidadIds.Contains(m.IdModalidad))
                .ToListAsync(cancellationToken);
            var modalidadesMap = modalidadesList.GroupBy(m => m.IdModalidad).ToDictionary(g => g.Key, g => g.First());

            var profesorIds = asignacionesFiltradas.Select(a => a.IdProfesor).Distinct().ToList();
            var profesoresList = await _context.Profesores.AsNoTracking()
                .Where(p => profesorIds.Contains(p.IdProfesor))
                .ToListAsync(cancellationToken);
            var profesoresMap = profesoresList.GroupBy(p => p.IdProfesor).ToDictionary(g => g.Key, g => g.First());

            // 4. Consultar PEAs existentes en DocPeas para este período
            var peasExistentes = await _context.DocPeas.AsNoTracking()
                .Include(p => p.Observaciones)
                .Where(p => p.IdPeriodo == targetPeriodo && p.Activo)
                .ToListAsync(cancellationToken);

            var peasPorAsignacion = peasExistentes
                .Where(p => p.IdAsignacion.HasValue)
                .GroupBy(p => p.IdAsignacion!.Value)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(p => p.Version).First());

            var peasPorMateriaYDocente = peasExistentes
                .Where(p => !string.IsNullOrEmpty(p.IdDocenteElaborador))
                .GroupBy(p => $"{p.IdAsignatura}_{p.IdDocenteElaborador}")
                .ToDictionary(g => g.Key, g => g.OrderByDescending(p => p.Version).First());

            // 5. La colaboración vive directamente en doc_pea (columnas idDocenteColaborador / colaboradoresJson)

            var resultado = new List<PeaBandejaItemDto>();

            foreach (var asig in asignacionesFiltradas)
            {
                if (!cursosMap.TryGetValue(asig.IdNivel, out var curso) ||
                    !carrerasMap.TryGetValue(curso.IdCarrera, out var carrera) ||
                    !asignaturasMap.TryGetValue(asig.IdAsignatura, out var asignatura))
                {
                    continue;
                }

                modalidadesMap.TryGetValue(asig.IdModalidad, out var modalidad);
                profesoresMap.TryGetValue(asig.IdProfesor, out var profesor);

                string nombreDocente = profesor != null ? $"{profesor.Nombres} {profesor.Apellidos}".Trim() : asig.IdProfesor;
                string nombreModalidad = modalidad?.Modalidad1 ?? "Presencial";
                string nombreNivel = curso.Nivel ?? string.Empty;



                // Buscar si existe un PEA para esta asignación institucional
                DocPea? pea = null;
                if (peasPorAsignacion.TryGetValue(asig.IdAsignacion, out var pAsig))
                {
                    pea = pAsig;
                }
                else if (peasPorMateriaYDocente.TryGetValue($"{asig.IdAsignatura}_{asig.IdProfesor}", out var pMat))
                {
                    pea = pMat;
                }

                if (pea != null)
                {
                    resultado.Add(new PeaBandejaItemDto
                    {
                        IdPea = pea.IdPea,
                        Uuid = pea.Uuid,
                        IdAsignacion = asig.IdAsignacion,
                        IdCarrera = carrera.IdCarrera,
                        NombreCarrera = carrera.Carrera1 ?? "Carrera ISTPET",
                        IdAsignatura = asignatura.IdAsignatura,
                        NombreAsignatura = asignatura.Asignatura1 ?? "Asignatura",
                        CodigoAsignatura = asignatura.Codigo,
                        IdPeriodo = targetPeriodo,
                        IdDocenteElaborador = pea.IdDocenteElaborador ?? asig.IdProfesor,
                        NombreDocenteElaborador = nombreDocente,
                        Modalidad = pea.Modalidad ?? nombreModalidad,
                        SemestreNivel = pea.SemestreNivel ?? nombreNivel,
                        Paralelo = pea.Paralelo ?? asig.Paralelo,
                        TotalHorasAsignatura = pea.TotalHorasAsignatura,
                        Creditos = pea.Creditos,
                        HorasContactoDocente = pea.HorasContactoDocente,
                        HorasPracticoExperimental = pea.HorasPracticoExperimental,
                        HorasAutonomo = pea.HorasAutonomo,
                        Estado = pea.Estado,
                        Version = pea.Version,
                        FechaModificacion = pea.FechaModificacion,
                        EstadoColaboracion = pea.IdDocenteColaborador == idSigafi ? pea.EstadoColaboracion : null,
                        UuidColaboracion = pea.IdDocenteColaborador == idSigafi ? pea.Uuid : null,
                        FirmaDocente = !string.IsNullOrEmpty(pea.FirmaElaboradoDocente),
                        FechaElaborado = pea.FechaElaborado,
                        FirmaCoord = !string.IsNullOrEmpty(pea.FirmaRevisadoCoord),
                        FechaRevisadoCoord = pea.FechaRevisadoCoord,
                        FirmaAcad = !string.IsNullOrEmpty(pea.FirmaRevisadoAcad),
                        FechaRevisadoAcad = pea.FechaRevisadoAcad,
                        FirmaVicerrector = !string.IsNullOrEmpty(pea.FirmaAprobadoVicerrector),
                        FechaAprobado = pea.FechaAprobado,
                        TotalObservacionesPendientes = (pea.Estado == "Observado") ? (pea.Observaciones?.Count(o => o.Estado == "Pendiente") ?? 0) : 0
                    });
                }
                else
                {
                    // Asignatura del distributivo que aún no tiene PEA iniciado (Estado = NoIniciado)
                    resultado.Add(new PeaBandejaItemDto
                    {
                        IdPea = 0,
                        Uuid = string.Empty,
                        IdAsignacion = asig.IdAsignacion,
                        IdCarrera = carrera.IdCarrera,
                        NombreCarrera = carrera.Carrera1 ?? "Carrera ISTPET",
                        IdAsignatura = asignatura.IdAsignatura,
                        NombreAsignatura = asignatura.Asignatura1 ?? "Asignatura",
                        CodigoAsignatura = asignatura.Codigo,
                        IdPeriodo = targetPeriodo,
                        IdDocenteElaborador = asig.IdProfesor,
                        NombreDocenteElaborador = nombreDocente,
                        Modalidad = nombreModalidad,
                        SemestreNivel = nombreNivel,
                        Paralelo = asig.Paralelo,
                        TotalHorasAsignatura = 0,
                        Creditos = 0,
                        HorasContactoDocente = 0,
                        HorasPracticoExperimental = 0,
                        HorasAutonomo = 0,
                        Estado = "NoIniciado",
                        Version = 1,
                        FechaModificacion = null,
                        EstadoColaboracion = null,
                        UuidColaboracion = null,
                        FirmaDocente = false,
                        FirmaCoord = false,
                        FirmaAcad = false,
                        FirmaVicerrector = false,
                        TotalObservacionesPendientes = 0
                    });
                }
            }

            // Ordenar: primero los que tienen PEA activo/en progreso, luego los NoIniciados, y por nombre de asignatura
            return resultado
                .OrderBy(r => r.Estado == "NoIniciado" ? 1 : 0)
                .ThenBy(r => r.NombreAsignatura)
                .ToList();
        }

        public async Task<PeaColaboracionItemDto> SolicitarColaboracionAsync(
            SolicitarColaboracionDto dto,
            string idDocenteSolicitante,
            CancellationToken cancellationToken = default)
        {
            var userSolicitante = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi == idDocenteSolicitante || u.IdUsuario.ToString() == idDocenteSolicitante || u.Nombre == idDocenteSolicitante, cancellationToken);

            string sigafiSolicitante = userSolicitante?.IdSigafi ?? idDocenteSolicitante;

            // Obtener datos del profesor solicitante
            var profSolicitante = await _context.Profesores.AsNoTracking()
                .FirstOrDefaultAsync(p => p.IdProfesor == sigafiSolicitante, cancellationToken);
            string nombreSolicitante = profSolicitante != null 
                ? $"{profSolicitante.Nombres} {profSolicitante.Apellidos}".Trim() 
                : userSolicitante?.Nombre ?? sigafiSolicitante;

            // Obtener asignación institucional de SIGAFI
            var asignacion = await _context.AsignacionesProfesores.AsNoTracking()
                .FirstOrDefaultAsync(a => a.IdAsignacion == dto.IdAsignacion, cancellationToken)
                ?? throw new KeyNotFoundException("No se encontró la asignación académica especificada.");

            // Obtener nombre de la asignatura
            var asignatura = await _context.Asignaturas.AsNoTracking()
                .FirstOrDefaultAsync(a => a.IdAsignatura == asignacion.IdAsignatura, cancellationToken);
            string nombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura Curricular";

            // Buscar si ya existe el PEA en doc_pea
            var pea = await _context.DocPeas
                .FirstOrDefaultAsync(p => p.IdAsignacion == dto.IdAsignacion && p.Activo, cancellationToken);

            // Si aún no existe el PEA, lo creamos/aseguramos a partir de la asignación institucional
            if (pea == null)
            {
                await CrearDesdeAsignacionAsync(dto.IdAsignacion, asignacion.IdProfesor);
                pea = await _context.DocPeas
                    .FirstOrDefaultAsync(p => p.IdAsignacion == dto.IdAsignacion && p.Activo, cancellationToken)
                    ?? throw new KeyNotFoundException("No se pudo instanciar el PEA para registrar la colaboración.");
            }

            // Actualizar columnas directas de colaboración en doc_pea
            pea.IdDocenteColaborador = sigafiSolicitante;
            pea.NombreDocenteColaborador = nombreSolicitante;
            pea.EstadoColaboracion = "Pendiente";
            pea.FechaSolicitudColaboracion = DateTime.UtcNow;
            pea.FechaRespuestaColaboracion = null;
            pea.MotivoColaboracion = dto.Motivo;

            // Historial estructurado en json
            var colabList = new List<Dictionary<string, object>>();
            if (!string.IsNullOrWhiteSpace(pea.ColaboradoresJson))
            {
                try
                {
                    colabList = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(pea.ColaboradoresJson) ?? new();
                }
                catch { }
            }
            colabList.RemoveAll(c => c.TryGetValue("id_docente", out var id) && id?.ToString() == sigafiSolicitante);
            colabList.Add(new Dictionary<string, object>
            {
                ["id_docente"] = sigafiSolicitante,
                ["nombre_docente"] = nombreSolicitante,
                ["estado"] = "Pendiente",
                ["fecha_solicitud"] = DateTime.UtcNow.ToString("o"),
                ["fecha_respuesta"] = string.Empty,
                ["motivo"] = dto.Motivo ?? string.Empty
            });
            pea.ColaboradoresJson = JsonSerializer.Serialize(colabList);

            await _context.SaveChangesAsync(cancellationToken);

            // Enviar notificación in-app y correo electrónico al docente titular
            try
            {
                var userTitular = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.IdSigafi == asignacion.IdProfesor, cancellationToken);

                if (userTitular != null)
                {
                    var notifService = GetNotificationService();
                    if (notifService != null)
                    {
                        var extraData = new Dictionary<string, string>
                        {
                            ["tipo"] = "SOLICITUD_COLABORACION",
                            ["uuid_colaboracion"] = pea.Uuid,
                            ["uuid_pea"] = pea.Uuid,
                            ["id_asignacion"] = dto.IdAsignacion.ToString(),
                            ["docente_colaborador"] = nombreSolicitante,
                            ["asignatura"] = nombreAsignatura
                        };

                        await notifService.NotifyUserAsync(
                            userTitular.IdUsuario,
                            $"Solicitud de Colaboración: {nombreAsignatura}",
                            $"El docente {nombreSolicitante} ha solicitado colaborar en la formulación del PEA de {nombreAsignatura}. Puede responder a esta solicitud en el centro de notificaciones para autorizar el ingreso al espacio de trabajo.",
                            "COLABORACION",
                            $"/notificaciones?colaboracion={pea.Uuid}",
                            extraData
                        );
                    }
                }
            }
            catch
            {
                // La notificación no bloquea la persistencia
            }

            return new PeaColaboracionItemDto
            {
                IdColaboracion = pea.IdPea,
                Uuid = pea.Uuid,
                IdPea = pea.IdPea,
                UuidPea = pea.Uuid,
                IdAsignacion = dto.IdAsignacion,
                IdDocenteTitular = asignacion.IdProfesor,
                IdDocenteColaborador = sigafiSolicitante,
                NombreDocenteColaborador = nombreSolicitante,
                NombreAsignatura = nombreAsignatura,
                Estado = "Pendiente",
                FechaSolicitud = pea.FechaSolicitudColaboracion ?? DateTime.UtcNow,
                FechaRespuesta = null
            };
        }

        public async Task<bool> ResponderColaboracionAsync(
            string uuidColaboracion,
            bool aceptar,
            string idDocenteTitular,
            string? motivo = null,
            CancellationToken cancellationToken = default)
        {
            var userTitular = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi == idDocenteTitular || u.IdUsuario.ToString() == idDocenteTitular || u.Nombre == idDocenteTitular, cancellationToken);
            string sigafiTitular = userTitular?.IdSigafi ?? idDocenteTitular;

            var pea = await _context.DocPeas
                .FirstOrDefaultAsync(p => (p.Uuid == uuidColaboracion || p.IdPea.ToString() == uuidColaboracion) && p.Activo, cancellationToken)
                ?? throw new KeyNotFoundException("No se encontró el PEA o solicitud de colaboración especificada.");

            bool isAdmin = userTitular?.Administrador == true;
            if (!isAdmin && pea.IdDocenteElaborador != sigafiTitular)
            {
                throw new UnauthorizedAccessException("Solo el docente titular de la cátedra puede autorizar la colaboración.");
            }

            pea.EstadoColaboracion = aceptar ? "Aprobada" : "Rechazada";
            pea.FechaRespuestaColaboracion = DateTime.UtcNow;
            pea.MotivoColaboracion = motivo;

            // Actualizar JSON estructurado
            var colabList = new List<Dictionary<string, object>>();
            if (!string.IsNullOrWhiteSpace(pea.ColaboradoresJson))
            {
                try
                {
                    colabList = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(pea.ColaboradoresJson) ?? new();
                }
                catch { }
            }
            var entry = colabList.FirstOrDefault(c => c.TryGetValue("id_docente", out var id) && id?.ToString() == pea.IdDocenteColaborador);
            if (entry != null)
            {
                entry["estado"] = pea.EstadoColaboracion;
                entry["fecha_respuesta"] = DateTime.UtcNow.ToString("o");
                entry["motivo"] = motivo ?? string.Empty;
            }
            else if (!string.IsNullOrEmpty(pea.IdDocenteColaborador))
            {
                colabList.Add(new Dictionary<string, object>
                {
                    ["id_docente"] = pea.IdDocenteColaborador,
                    ["nombre_docente"] = pea.NombreDocenteColaborador ?? string.Empty,
                    ["estado"] = pea.EstadoColaboracion,
                    ["fecha_solicitud"] = (pea.FechaSolicitudColaboracion ?? DateTime.UtcNow).ToString("o"),
                    ["fecha_respuesta"] = DateTime.UtcNow.ToString("o"),
                    ["motivo"] = motivo ?? string.Empty
                });
            }
            pea.ColaboradoresJson = JsonSerializer.Serialize(colabList);

            await _context.SaveChangesAsync(cancellationToken);

            // Obtener nombre de la asignatura para la notificación
            var asignatura = await _context.Asignaturas.AsNoTracking()
                .FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura, cancellationToken);
            string nombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura Curricular";

            // Notificar al docente colaborador solicitante (in-app y correo institucional)
            try
            {
                if (!string.IsNullOrEmpty(pea.IdDocenteColaborador))
                {
                    var userColaborador = await _context.Users.AsNoTracking()
                        .FirstOrDefaultAsync(u => u.IdSigafi == pea.IdDocenteColaborador, cancellationToken);

                    if (userColaborador != null)
                    {
                        var notifService = GetNotificationService();
                        if (notifService != null)
                        {
                            string targetUrl = aceptar
                                ? $"/documentacion/workspace/pea-oficial/{pea.Uuid}?edit=pea-oficial"
                                : "/documentacion/mis-proyectos";

                            string titulo = aceptar
                                ? $"Colaboración Aceptada: {nombreAsignatura}"
                                : $"Solicitud de Colaboración Declinada: {nombreAsignatura}";

                            string mensaje = aceptar
                                ? $"El docente titular ha aceptado tu solicitud para colaborar en '{nombreAsignatura}'. Ya puedes ingresar al espacio de trabajo para co-elaborar el PEA."
                                : $"El docente titular no ha aceptado la solicitud de colaboración para '{nombreAsignatura}'.";

                            var extraData = new Dictionary<string, string>
                            {
                                ["tipo"] = "RESPUESTA_COLABORACION",
                                ["uuid_colaboracion"] = pea.Uuid,
                                ["uuid_pea"] = pea.Uuid,
                                ["id_asignacion"] = (pea.IdAsignacion ?? 0).ToString(),
                                ["estado"] = pea.EstadoColaboracion
                            };

                            await notifService.NotifyUserAsync(
                                userColaborador.IdUsuario,
                                titulo,
                                mensaje,
                                "COLABORACION",
                                targetUrl,
                                extraData
                            );
                        }
                    }
                }
            }
            catch
            {
                // No bloquear si la notificación falla
            }

            return true;
        }

        public async Task<bool> CancelarSolicitudColaboracionAsync(
            string uuidColaboracion,
            string idDocenteSolicitante,
            CancellationToken cancellationToken = default)
        {
            var userSolicitante = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi == idDocenteSolicitante || u.IdUsuario.ToString() == idDocenteSolicitante || u.Nombre == idDocenteSolicitante, cancellationToken);
            string sigafiSolicitante = userSolicitante?.IdSigafi ?? idDocenteSolicitante;

            var pea = await _context.DocPeas
                .FirstOrDefaultAsync(p => (p.Uuid == uuidColaboracion || p.IdPea.ToString() == uuidColaboracion || (p.IdAsignacion.HasValue && p.IdAsignacion.ToString() == uuidColaboracion)) && p.Activo, cancellationToken)
                ?? throw new KeyNotFoundException("No se encontró el PEA o solicitud de colaboración especificada.");

            bool isAdmin = userSolicitante?.Administrador == true;
            if (!isAdmin && pea.IdDocenteColaborador != sigafiSolicitante)
            {
                throw new UnauthorizedAccessException("Solo el docente que emitió la solicitud puede cancelarla.");
            }

            pea.IdDocenteColaborador = null;
            pea.NombreDocenteColaborador = null;
            pea.EstadoColaboracion = null;
            pea.FechaSolicitudColaboracion = null;
            pea.FechaRespuestaColaboracion = null;
            pea.MotivoColaboracion = null;

            if (!string.IsNullOrWhiteSpace(pea.ColaboradoresJson))
            {
                try
                {
                    var colabList = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(pea.ColaboradoresJson) ?? new();
                    colabList.RemoveAll(c => c.TryGetValue("id_docente", out var id) && id?.ToString() == sigafiSolicitante);
                    pea.ColaboradoresJson = JsonSerializer.Serialize(colabList);
                }
                catch { }
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<List<PeaColaboracionItemDto>> ListarMisSolicitudesColaboracionAsync(
            string idDocente,
            CancellationToken cancellationToken = default)
        {
            var user = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi == idDocente || u.IdUsuario.ToString() == idDocente || u.Nombre == idDocente, cancellationToken);
            string sigafiId = user?.IdSigafi ?? idDocente;

            var peas = await _context.DocPeas.AsNoTracking()
                .Where(p => p.IdDocenteColaborador == sigafiId && p.Activo)
                .OrderByDescending(p => p.FechaSolicitudColaboracion)
                .ToListAsync(cancellationToken);

            var materiaIds = peas.Select(p => p.IdAsignatura).Distinct().ToList();
            var materiasMap = await _context.Asignaturas.AsNoTracking()
                .Where(a => materiaIds.Contains(a.IdAsignatura))
                .ToDictionaryAsync(a => a.IdAsignatura, a => a.Asignatura1, cancellationToken);

            return peas.Select(p => new PeaColaboracionItemDto
            {
                IdColaboracion = p.IdPea,
                Uuid = p.Uuid,
                IdPea = p.IdPea,
                UuidPea = p.Uuid,
                IdAsignacion = p.IdAsignacion ?? 0,
                IdDocenteTitular = p.IdDocenteElaborador ?? string.Empty,
                IdDocenteColaborador = p.IdDocenteColaborador ?? string.Empty,
                NombreDocenteColaborador = p.NombreDocenteColaborador,
                NombreAsignatura = materiasMap.TryGetValue(p.IdAsignatura, out var nom) ? nom : "Asignatura",
                Estado = p.EstadoColaboracion ?? "Pendiente",
                FechaSolicitud = p.FechaSolicitudColaboracion ?? p.FechaCreacion,
                FechaRespuesta = p.FechaRespuestaColaboracion
            }).ToList();
        }

        public async Task<List<PeaColaboracionItemDto>> ListarSolicitudesRecibidasAsync(
            string idDocenteTitular,
            CancellationToken cancellationToken = default)
        {
            var user = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi == idDocenteTitular || u.IdUsuario.ToString() == idDocenteTitular || u.Nombre == idDocenteTitular, cancellationToken);
            string sigafiId = user?.IdSigafi ?? idDocenteTitular;

            var peas = await _context.DocPeas.AsNoTracking()
                .Where(p => p.IdDocenteElaborador == sigafiId && !string.IsNullOrEmpty(p.IdDocenteColaborador) && p.Activo)
                .OrderByDescending(p => p.FechaSolicitudColaboracion)
                .ToListAsync(cancellationToken);

            var materiaIds = peas.Select(p => p.IdAsignatura).Distinct().ToList();
            var materiasMap = await _context.Asignaturas.AsNoTracking()
                .Where(a => materiaIds.Contains(a.IdAsignatura))
                .ToDictionaryAsync(a => a.IdAsignatura, a => a.Asignatura1, cancellationToken);

            return peas.Select(p => new PeaColaboracionItemDto
            {
                IdColaboracion = p.IdPea,
                Uuid = p.Uuid,
                IdPea = p.IdPea,
                UuidPea = p.Uuid,
                IdAsignacion = p.IdAsignacion ?? 0,
                IdDocenteTitular = p.IdDocenteElaborador ?? string.Empty,
                IdDocenteColaborador = p.IdDocenteColaborador ?? string.Empty,
                NombreDocenteColaborador = p.NombreDocenteColaborador,
                NombreAsignatura = materiasMap.TryGetValue(p.IdAsignatura, out var nom) ? nom : "Asignatura",
                Estado = p.EstadoColaboracion ?? "Pendiente",
                FechaSolicitud = p.FechaSolicitudColaboracion ?? p.FechaCreacion,
                FechaRespuesta = p.FechaRespuestaColaboracion
            }).ToList();
        }

        public async Task<Dictionary<int, string>> ObtenerEstadosColaboracionPorAsignacionesAsync(
            List<int> idAsignaciones,
            string idDocenteSolicitante,
            CancellationToken cancellationToken = default)
        {
            var user = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi == idDocenteSolicitante || u.IdUsuario.ToString() == idDocenteSolicitante || u.Nombre == idDocenteSolicitante, cancellationToken);
            string sigafiId = user?.IdSigafi ?? idDocenteSolicitante;

            var peas = await _context.DocPeas.AsNoTracking()
                .Where(p => p.IdAsignacion.HasValue && idAsignaciones.Contains(p.IdAsignacion.Value) && p.IdDocenteColaborador == sigafiId && p.Activo)
                .ToListAsync(cancellationToken);

            return peas
                .Where(p => p.IdAsignacion.HasValue && !string.IsNullOrEmpty(p.EstadoColaboracion))
                .ToDictionary(p => p.IdAsignacion!.Value, p => p.EstadoColaboracion!);
        }
    }
}
