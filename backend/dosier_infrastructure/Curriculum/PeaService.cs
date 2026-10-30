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

        public PeaService(
            DosierContext context,
            IAcademicContextResolver academicContextResolver,
            IExpedienteCurricularService expedienteService,
            SignatureHashService hashService,
            dosier_application.Common.IAppUrlService appUrlService,
            IFirmaElectronicaService firmaElectronicaService)
        {
            _context = context;
            _academicContextResolver = academicContextResolver;
            _expedienteService = expedienteService;
            _hashService = hashService;
            _appUrlService = appUrlService;
            _firmaElectronicaService = firmaElectronicaService;
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
                .Include(p => p.Unidades)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Bibliografias)
                .Include(p => p.Prerrequisitos)
                .Include(p => p.Evaluaciones)
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

            // 8. Sincronizar instancia documental para autosanación de PDF oficial firmado
            var docInstancia = await _context.DocumentInstances.FirstOrDefaultAsync(d => d.EntityUuid == pea.Uuid);
            if (docInstancia != null)
            {
                docInstancia.SetFinalPdfPath(null);
            }

            await _context.SaveChangesAsync();

            string verificationUrl = _appUrlService.BuildFrontendUrl($"/verificacion/{firmaCode}");

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
                ?? throw new UnauthorizedAccessException("Usuario observador no encontrado.");

            var userRoles = await _context.UserRoles
                .AsNoTracking()
                .Include(ur => ur.Role)
                .Where(ur => ur.IdUsuario == idUsuario.Value && (ur.EsActivo ?? true))
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

            var obs = new DocPeaObservacion
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = idPea,
                IdUsuarioObservador = idUsuario,
                RolObservador = rolEfectivo,
                SeccionAfectada = seccion,
                TextoObservacion = texto,
                Estado = "Pendiente",
                FechaObservacion = DateTime.UtcNow
            };

            _context.DocPeaObservaciones.Add(obs);

            // Si el PEA estaba en revisión (cualquiera de las etapas colegiadas), pasa a Observado
            if (pea.Estado == "EnRevision" || pea.Estado == "RevisadoCoord" || pea.Estado == "RevisadoAcad")
            {
                var estadoPrevio = pea.Estado;
                pea.Estado = "Observado";
                await RegistrarTrazabilidadAsync(idPea, estadoPrevio, "Observado", $"Observación en sección {seccion}: {texto}", null, idUsuario);
            }

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
                pea.RecursosDidacticos,
                pea.EvaluacionAprendizaje,
                // CONTENIDO REAL — orden determinístico por Orden
                Unidades = pea.Unidades.OrderBy(u => u.Orden).Select(u => new
                {
                    u.NumeroUnidad,
                    u.NombreUnidad,
                    u.TotalHorasUnidad,
                    u.HorasDocencia,
                    u.HorasPracticoExp,
                    u.HorasAutonomo,
                    Temas = u.Temas.OrderBy(t => t.Orden).Select(t => new
                    {
                        t.NumeroTema,
                        t.TituloTema,
                        t.DescripcionSubtemas
                    })
                }),
                Rdas = pea.ResultadosAprendizaje.OrderBy(r => r.Orden).Select(r => new
                {
                    r.TipoRda,
                    r.CodigoRda,
                    r.Descripcion,
                    r.NivelDesarrollo
                }),
                Bibliografias = pea.Bibliografias.OrderBy(b => b.Orden).Select(b => new
                {
                    b.TipoBibliografia,
                    b.CitaCompletaApa
                }),
                Practicas = pea.ActividadesPracticas.OrderBy(p => p.Orden).Select(p => new
                {
                    p.NumeroPractica,
                    p.NombrePractica,
                    p.Caracterizacion,
                    p.DuracionHoras
                }),
                Prerrequisitos = pea.Prerrequisitos.OrderBy(pr => pr.Orden).Select(pr => new
                {
                    pr.CodigoAsignatura,
                    pr.NombreAsignatura,
                    pr.Observacion
                }),
                Evaluaciones = pea.Evaluaciones.OrderBy(ev => ev.Orden).Select(ev => new
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
            int totalHoras = pea.TotalHorasAsignatura;
            decimal creditos = pea.Creditos;
            int horasCd = pea.HorasContactoDocente;
            int horasApe = pea.HorasPracticoExperimental;
            int horasTa = pea.HorasAutonomo;

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
                        totalHoras = detalle.Horas ?? 0;
                        creditos = detalle.Creditos ?? 0;
                        horasCd = detalle.HorasDocente ?? 0;
                        horasApe = decimal.ToInt32(detalle.HorasPracticoExperimental ?? 0m);
                        horasTa = Math.Max(0, totalHoras - horasCd - horasApe);
                    }
                }
            }

            if (totalHoras > 0 && horasCd <= 0 && horasApe <= 0)
            {
                int third = totalHoras / 3;
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
                CodigoCarrera = !string.IsNullOrWhiteSpace(carrera?.CodigoCases) ? carrera.CodigoCases : carrera?.AliasCarrera,
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
                    entity.HorasContactoDocente = SafeParseInt(hcdProp, entity.HorasContactoDocente);
                }

                if (SafeTryGetProperty(root, new[] { "HorasPracticoExperimental", "horas_practica", "horasPracticoExperimental", "horasPractica", "horasAPE" }, out var hpeProp))
                {
                    entity.HorasPracticoExperimental = SafeParseInt(hpeProp, entity.HorasPracticoExperimental);
                }

                if (SafeTryGetProperty(root, new[] { "HorasAutonomo", "horas_autonomo", "horasAutonomo", "horasTA" }, out var haProp))
                {
                    entity.HorasAutonomo = SafeParseInt(haProp, entity.HorasAutonomo);
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

                        int cd = 0, ape = 0, ta = 0;
                        if (SafeTryGetProperty(uEl, new[] { "horasCD", "HorasCD", "horasDocencia", "horas_docencia", "horasDocente", "2" }, out var cdP))
                            cd = SafeParseInt(cdP);
                        if (SafeTryGetProperty(uEl, new[] { "horasAPE", "HorasAPE", "horasPracticoExp", "horas_practica", "horasPractica", "3" }, out var apeP))
                            ape = SafeParseInt(apeP);
                        if (SafeTryGetProperty(uEl, new[] { "horasTA", "HorasTA", "horasAutonomo", "horas_autonomo", "4" }, out var taP))
                            ta = SafeParseInt(taP);

                        int totalH = cd + ape + ta;
                        if (SafeTryGetProperty(uEl, new[] { "TotalHorasUnidad", "total_horas", "horasTotal", "HorasTotal", "totalHoras", "5" }, out var thuP))
                        {
                            int thuV = SafeParseInt(thuP);
                            if (thuV > 0) totalH = thuV;
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

                        int horas = 2;
                        if (SafeTryGetProperty(prEl, new[] { "horas", "Horas", "DuracionHoras", "duracion_horas", "duracionHoras", "2" }, out var hP))
                            horas = SafeParseInt(hP, 2);

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


        public async Task<List<PeaBandejaItemDto>> ListarBandejaAsync(string? idPeriodo, int? idCarrera, string? estado, int idUsuario, string? identifier = null, System.Threading.CancellationToken cancellationToken = default)
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

            if (!string.IsNullOrWhiteSpace(idPeriodo) && idPeriodo != "todos")
            {
                query = query.Where(p => p.IdPeriodo == idPeriodo);
            }

            if (idCarrera.HasValue && idCarrera.Value > 0)
            {
                query = query.Where(p => p.IdCarrera == idCarrera.Value);
            }

            if (!string.IsNullOrWhiteSpace(estado) && estado != "todos")
            {
                query = query.Where(p => p.Estado == estado);
            }

            // Si es docente exclusivo sin rol de supervisión institucional, solo ve sus materias
            if (!isAdmin && !isVicerrector && !isCoordAcad && !isCoordCarrera)
            {
                if (!string.IsNullOrEmpty(user.IdSigafi))
                {
                    query = query.Where(p => p.IdDocenteElaborador == user.IdSigafi);
                }
            }
            else if (isCoordCarrera && !isAdmin && !isVicerrector && !isCoordAcad && !string.IsNullOrEmpty(user.IdSigafi))
            {
                // Coordinador de Carrera: supervisa las carreras que coordina o sus materias formuladas
                var carrerasCoordinadas = await _context.DocAutoridadesCurriculares.AsNoTracking()
                    .Where(a => a.IdSigafi == user.IdSigafi && a.EsActivo && a.CargoCurricular == "COORD_CARRERA" && a.IdCarrera != null)
                    .Select(a => a.IdCarrera!.Value)
                    .ToListAsync(cancellationToken);

                if (carrerasCoordinadas.Any())
                {
                    query = query.Where(p => carrerasCoordinadas.Contains(p.IdCarrera) || p.IdDocenteElaborador == user.IdSigafi);
                }
            }

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
                    TotalObservacionesPendientes = p.Observaciones?.Count(o => o.Estado == "Pendiente") ?? 0
                };
            }).ToList();
        }
    }
}

