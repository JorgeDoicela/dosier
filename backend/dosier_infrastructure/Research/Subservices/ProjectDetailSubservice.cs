using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;

namespace dosier_infrastructure.Research.Subservices
{
    public class ProjectDetailSubservice : IProjectDetailSubservice
    {
        private readonly DosierContext _context;
        private readonly IProjectLookupSubservice _lookupSubservice;

        public ProjectDetailSubservice(DosierContext context, IProjectLookupSubservice lookupSubservice)
        {
            _context = context;
            _lookupSubservice = lookupSubservice;
        }

        public async Task<ProyectoDto?> GetProjectDetailAsync(string uuid)
        {
            var canonicalUuid = await _lookupSubservice.ResolveCanonicalUuidAsync(uuid);
            if (canonicalUuid == null) return null;

            var basicProject = await _context.DocProyectos
                .FirstOrDefaultAsync(p => p.Uuid == canonicalUuid);

            if (basicProject == null) return null;

            if (basicProject.Estado == "Prepropuesta" || basicProject.Estado == "Prepropuesta Rechazada")
            {
                string desc = "";
                if (!string.IsNullOrEmpty(basicProject.MetadataCacesJson))
                {
                    try
                    {
                        using var doc = System.Text.Json.JsonDocument.Parse(basicProject.MetadataCacesJson);
                        if (doc.RootElement.TryGetProperty("descripcionProyecto", out var el) 
                         || doc.RootElement.TryGetProperty("DescripcionProyecto", out el)
                         || doc.RootElement.TryGetProperty("descripcionInnovacion", out el)
                         || doc.RootElement.TryGetProperty("DescripcionInnovacion", out el)
                         || doc.RootElement.TryGetProperty("resumenProyecto", out el)
                         || doc.RootElement.TryGetProperty("ResumenProyecto", out el)
                         || doc.RootElement.TryGetProperty("descripcion", out el)
                         || doc.RootElement.TryGetProperty("Descripcion", out el))
                        {
                            desc = el.GetString() ?? "";
                        }
                    }
                    catch {}
                }

                if (string.IsNullOrWhiteSpace(desc))
                {
                    try
                    {
                        var instance = await _context.DocumentInstances
                            .FirstOrDefaultAsync(i => i.EntityUuid == basicProject.Uuid && i.TemplateCode == "PROTOCOLO_INVESTIGACION");

                        if (instance?.DataSnapshotJson != null)
                        {
                            using var docInst = System.Text.Json.JsonDocument.Parse(instance.DataSnapshotJson);
                            if (docInst.RootElement.TryGetProperty("descripcionProyecto", out var el) 
                             || docInst.RootElement.TryGetProperty("DescripcionProyecto", out el)
                             || docInst.RootElement.TryGetProperty("descripcionInnovacion", out el)
                             || docInst.RootElement.TryGetProperty("DescripcionInnovacion", out el)
                             || docInst.RootElement.TryGetProperty("resumenProyecto", out el)
                             || docInst.RootElement.TryGetProperty("ResumenProyecto", out el)
                             || docInst.RootElement.TryGetProperty("descripcion", out el)
                             || docInst.RootElement.TryGetProperty("Descripcion", out el))
                            {
                                desc = el.GetString() ?? "";
                            }
                        }
                    }
                    catch {}
                }

                var lightDto = new ProyectoDto
                {
                    Uuid = basicProject.Uuid,
                    Estado = basicProject.Estado,
                    IdConvocatoria = null,
                    ConvocatoriaTitulo = null,
                    Titulo = basicProject.Titulo,
                    DescripcionProyecto = desc,
                    TieneGrupoInvestigacion = false,
                    PuntajeEvaluacion = basicProject.PuntajeEvaluacion,
                    Investigadores = new List<InvestigadorDto>()
                };

                var projectProfs = await _context.DocProyectoParticipantes
                    .Include(pp => pp.IdUsuarioNavigation)
                    .Where(pp => pp.IdProyecto == basicProject.IdProyecto && pp.TipoParticipante == "Docente")
                    .ToListAsync();

                foreach (var pp in projectProfs)
                {
                    lightDto.Investigadores.Add(new InvestigadorDto
                    {
                        Nombre = pp.IdUsuarioNavigation?.Nombre,
                        Cedula = pp.IdUsuarioNavigation?.IdSigafi,
                        Email = pp.IdUsuarioNavigation?.EmailInstitucional ?? pp.IdUsuarioNavigation?.IdSigafi ?? "",
                        Rol = pp.Rol,
                        Activo = pp.Activo ?? true,
                        EsDirector = pp.EsDirector ?? (pp.EsDirector == true)
                    });
                }

                var principalCarrera = await _context.DocProyectosCarreras
                    .Include(pc => pc.IdCarreraNavigation)
                    .Where(pc => pc.IdProyecto == basicProject.IdProyecto)
                    .OrderByDescending(pc => pc.Modalidad == "PRINCIPAL")
                    .Select(pc => pc.IdCarreraNavigation.Carrera1)
                    .FirstOrDefaultAsync();

                lightDto.Carrera = principalCarrera;
                return lightDto;
            }

            var p = await _context.DocProyectos
                .AsSplitQuery()
                .Include(p => p.DocProyectosCarreras)
                .Include(p => p.DocProyectoParticipantes).ThenInclude(pp => pp.IdUsuarioNavigation)
                .Include(p => p.DocObjetivosProyecto)
                .Include(p => p.DocCronogramas)
                .Include(p => p.DocBibliografiasProyecto)
                .FirstOrDefaultAsync(p => p.Uuid == canonicalUuid);

            if (p == null) return null;

            ProyectoDto dto = new ProyectoDto();
            if (!string.IsNullOrEmpty(p.MetadataCacesJson))
            {
                try
                {
                    var cleanedJson = Dosier.Infrastructure.Common.Documents.Engine.HandlebarsTemplateEngine.CleanAndNormalizeJson(p.MetadataCacesJson);
                    var deserialized = System.Text.Json.JsonSerializer.Deserialize<ProyectoDto>(cleanedJson, ProyectoDto.DefaultDeserializerOptions);
                    if (deserialized != null)
                    {
                        dto = deserialized;
                    }
                }
                catch
                {
                    dto = new ProyectoDto();
                }
            }
            else
            {
                dto = new ProyectoDto();
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var currentPeriod = await _context.Periodos
                .Where(pr => pr.EsInstituto == 1)
                .OrderByDescending(pr => pr.Periodoactivoinstituto == 1)
                .ThenByDescending(pr => pr.Activo == true)
                .ThenByDescending(pr => pr.FechaInicial <= today && pr.FechaFinal >= today)
                .ThenByDescending(pr => pr.FechaInicial)
                .FirstOrDefaultAsync();
            var periodId = currentPeriod?.IdPeriodo;

            var researchSubcatId = await GetResearchSubcatIdAsync();

            var profCedulas = p.DocProyectoParticipantes
                .Where(pp => pp.TipoParticipante == "Docente" && pp.IdUsuarioNavigation != null)
                .Select(pp => pp.IdUsuarioNavigation!.IdSigafi.Trim())
                .Where(c => !string.IsNullOrEmpty(c))
                .ToList();

            var studentCedulas = p.DocProyectoParticipantes
                .Where(pp => pp.TipoParticipante == "Alumno" && pp.IdUsuarioNavigation != null)
                .Select(pp => pp.IdUsuarioNavigation!.IdSigafi.Trim())
                .Where(c => !string.IsNullOrEmpty(c))
                .ToList();

            var profCareers = new List<ProfesoresCarrerasPeriodo>();
            if (profCedulas.Any() && !string.IsNullOrEmpty(periodId))
            {
                var profCedulaLts = profCedulas.Select(c => c.Trim()).ToList();
                var rawCareers = await _context.ProfesoresCarrerasPeriodos
                    .Include(pc => pc.IdCarreraNavigation)
                    .Where(pc => pc.IdPeriodo == periodId && pc.EsActivo == 1 && pc.IdProfesor != null && profCedulaLts.Contains(pc.IdProfesor))
                    .ToListAsync();

                profCareers = rawCareers
                    .Where(pc => profCedulas.Any(ced => pc.IdProfesor!.Trim().Equals(ced, StringComparison.OrdinalIgnoreCase)))
                    .ToList();
            }

            var alumCareers = new List<AlumnosCarrera>();
            var students = new List<Alumno>();
            var currentMatriculas = new List<Matricula>();
            var relevantCursos = new List<Curso>();

            if (studentCedulas.Any())
            {
                var studentCedulaLts = studentCedulas.Select(c => c.Trim()).ToList();
                var rawAlumCareers = await _context.AlumnosCarreras
                    .Where(ac => ac.IdAlumno != null && studentCedulaLts.Contains(ac.IdAlumno))
                    .ToListAsync();
                alumCareers = rawAlumCareers
                    .Where(ac => studentCedulas.Any(ced => ac.IdAlumno!.Trim().Equals(ced, StringComparison.OrdinalIgnoreCase)))
                    .ToList();

                students = await _context.Alumnos
                    .Where(s => studentCedulas.Contains(s.IdAlumno.Trim()))
                    .ToListAsync();

                if (!string.IsNullOrEmpty(periodId))
                {
                    currentMatriculas = await _context.Matriculas
                        .Where(m => studentCedulas.Contains(m.IdAlumno.Trim()) && m.IdPeriodo == periodId)
                        .ToListAsync();
                }

                var levelIds = currentMatriculas.Select(m => (int?)m.IdNivel)
                    .Concat(students.Select(s => s.IdNivel))
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .Distinct()
                    .ToList();

                relevantCursos = await _context.Cursos.Where(c => levelIds.Contains(c.IdNivel)).ToListAsync();
            }

            var allCarrerasList = await _context.Carreras.ToListAsync();

            var researchHours = new List<ProfesoresActividade>();
            var otherAssignedHours = new List<DocProyectoParticipante>();
            if (profCedulas.Any() && !string.IsNullOrEmpty(periodId))
            {
                researchHours = await _context.ProfesoresActividades
                    .Where(pa => profCedulas.Contains(pa.IdProfesor) && pa.IdSubcategoria == researchSubcatId && pa.IdPeriodo == periodId)
                    .ToListAsync();

                var profUserIds = p.DocProyectoParticipantes.Where(pp => pp.TipoParticipante == "Docente").Select(pp => pp.IdUsuario).Distinct().ToList();
                var estadosConCarga = await GetEstadosConCargaHorariaAsync();
                otherAssignedHours = await _context.DocProyectoParticipantes
                    .Include(pp => pp.IdProyectoNavigation)
                    .Where(pp => pp.TipoParticipante == "Docente" &&
                                 profUserIds.Contains(pp.IdUsuario) &&
                                 pp.IdProyecto != p.IdProyecto &&
                                 pp.Activo != false &&
                                 estadosConCarga.Contains(pp.IdProyectoNavigation!.Estado))
                    .ToListAsync();
            }

            // Carga en lote de Profesores y Alumnos para evitar consultas N+1 por cada participante
            var profesoresDict = new Dictionary<string, Profesore>();
            if (profCedulas.Any())
            {
                var profCedulaLts = profCedulas.Select(c => c.Trim()).ToList();
                var profs = await _context.Profesores
                    .Where(prof => profCedulaLts.Contains(prof.IdProfesor))
                    .ToListAsync();
                profesoresDict = profs
                    .GroupBy(prof => prof.IdProfesor.Trim(), StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);
            }

            var alumnosDict = new Dictionary<string, Alumno>();
            if (studentCedulas.Any())
            {
                var studentCedulaLts = studentCedulas.Select(c => c.Trim()).ToList();
                var alums = await _context.Alumnos
                    .Where(alum => studentCedulaLts.Contains(alum.IdAlumno))
                    .ToListAsync();
                alumnosDict = alums
                    .GroupBy(alum => alum.IdAlumno.Trim(), StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);
            }

            var participantUserIds = p.DocProyectoParticipantes.Select(pp => pp.IdUsuario).Distinct().ToList();
            var userMetasDict = new Dictionary<int, DocUsuarioMetadata>();
            if (participantUserIds.Any())
            {
                var metas = await _context.DocUsuariosMetadata
                    .AsNoTracking()
                    .Where(m => participantUserIds.Contains(m.IdUsuario))
                    .ToListAsync();
                userMetasDict = metas
                    .GroupBy(m => m.IdUsuario)
                    .ToDictionary(g => g.Key, g => g.First());
            }

            var investigadoresList = new List<InvestigadorDto>();

            foreach (var pp in p.DocProyectoParticipantes.Where(pp => pp.TipoParticipante == "Docente"))
            {
                var phone = pp.Telefono ?? string.Empty;
                var email = pp.IdUsuarioNavigation?.EmailInstitucional ?? pp.IdUsuarioNavigation?.IdSigafi ?? "";
                var cedula = pp.IdUsuarioNavigation?.IdSigafi?.Trim() ?? "";

                if (pp.IdUsuarioNavigation?.TablaSigafi == "profesor" && profesoresDict.TryGetValue(cedula, out var prof))
                {
                    if (string.IsNullOrEmpty(phone)) phone = prof.Celular ?? prof.Telefono ?? string.Empty;
                    email = prof.EmailInstitucional ?? prof.Email ?? email;
                }
                else if (pp.IdUsuarioNavigation?.TablaSigafi == "alumno" && alumnosDict.TryGetValue(cedula, out var alum))
                {
                    if (string.IsNullOrEmpty(phone)) phone = alum.Celular ?? alum.Telefono ?? string.Empty;
                    email = alum.EmailInstitucional ?? alum.Email ?? email;
                }

                if (string.IsNullOrEmpty(email)) email = pp.IdUsuarioNavigation?.EmailInstitucional ?? pp.IdUsuarioNavigation?.IdSigafi ?? "";

                var linkedCareers = profCareers
                    .Where(pc => pc.IdProfesor.Trim() == cedula && pc.IdCarreraNavigation != null)
                    .Select(pc => pc.IdCarreraNavigation!.Carrera1)
                    .Distinct()
                    .ToList();
                var carrerasDisponibles = linkedCareers.Any() ? string.Join(", ", linkedCareers) : "Docente";
                var carreraNom = linkedCareers.FirstOrDefault() ?? "Docente";

                var existingInvInJson = dto?.Investigadores?.FirstOrDefault(i => !string.IsNullOrEmpty(i.Cedula) && i.Cedula.Trim() == cedula);
                if (existingInvInJson != null && !string.IsNullOrWhiteSpace(existingInvInJson.Carrera))
                {
                    var savedCarrera = existingInvInJson.Carrera.Trim();
                    if (linkedCareers.Any(lc => lc != null && lc.Trim().Equals(savedCarrera, StringComparison.OrdinalIgnoreCase)))
                    {
                        carreraNom = savedCarrera;
                    }
                }

                var availableHours = researchHours.Where(pa => pa.IdProfesor.Trim() == cedula).Sum(pa => pa.HorasSemana ?? 0);
                var assignedHours = otherAssignedHours.Where(o => o.IdUsuario == pp.IdUsuario).Sum(o => o.HorasSemanales ?? 0);

                userMetasDict.TryGetValue(pp.IdUsuario, out var meta);

                investigadoresList.Add(new InvestigadorDto
                {
                    Nombre = pp.IdUsuarioNavigation?.Nombre,
                    Cedula = pp.IdUsuarioNavigation?.IdSigafi,
                    Email = email,
                    Rol = pp.Rol,
                    NivelAcademico = pp.NivelAcademico,
                    Telefono = phone,
                    Activo = pp.Activo ?? true,
                    FechaInicio = pp.FechaInicio,
                    FechaFin = pp.FechaFin,
                    MotivoCambio = pp.MotivoCambio,
                    Carrera = carreraNom,
                    CarrerasDisponibles = carrerasDisponibles,
                    HorasSemanales = pp.HorasSemanales,
                    HorasDisponibles = availableHours,
                    HorasAsignadas = assignedHours,
                    EsDirector = pp.EsDirector,
                    FirmaHabilitada = meta?.AceptoTerminosFirma
                });
            }

            foreach (var pa in p.DocProyectoParticipantes.Where(pp => pp.TipoParticipante == "Alumno"))
            {
                var phone = pa.Telefono ?? string.Empty;
                var email = pa.IdUsuarioNavigation?.EmailInstitucional ?? pa.IdUsuarioNavigation?.IdSigafi ?? "";
                var cedula = pa.IdUsuarioNavigation?.IdSigafi?.Trim() ?? "";

                if (pa.IdUsuarioNavigation?.TablaSigafi == "profesor" && profesoresDict.TryGetValue(cedula, out var prof))
                {
                    if (string.IsNullOrEmpty(phone)) phone = prof.Celular ?? prof.Telefono ?? string.Empty;
                    email = prof.EmailInstitucional ?? prof.Email ?? email;
                }
                else if (pa.IdUsuarioNavigation?.TablaSigafi == "alumno" && alumnosDict.TryGetValue(cedula, out var alum))
                {
                    if (string.IsNullOrEmpty(phone)) phone = alum.Celular ?? alum.Telefono ?? string.Empty;
                    email = alum.EmailInstitucional ?? alum.Email ?? email;
                }

                if (string.IsNullOrEmpty(email)) email = pa.IdUsuarioNavigation?.EmailInstitucional ?? pa.IdUsuarioNavigation?.IdSigafi ?? "";

                var sCareerIds = alumCareers
                    .Where(ac => ac.IdAlumno != null && ac.IdAlumno.Trim().Equals(cedula, StringComparison.OrdinalIgnoreCase))
                    .Select(ac => ac.IdCarrera)
                    .ToList();
                var sCareers = allCarrerasList
                    .Where(c => sCareerIds.Contains(c.IdCarrera) && !string.IsNullOrEmpty(c.Carrera1))
                    .Select(c => c.Carrera1!)
                    .ToList();

                var studentObj = students.FirstOrDefault(s => s.IdAlumno != null && s.IdAlumno.Trim().Equals(cedula, StringComparison.OrdinalIgnoreCase));
                var matricula = currentMatriculas.FirstOrDefault(m => m.IdAlumno != null && m.IdAlumno.Trim().Equals(cedula, StringComparison.OrdinalIgnoreCase));

                var idNivelTarget = matricula?.IdNivel ?? studentObj?.IdNivel;
                if (idNivelTarget.HasValue)
                {
                    var cursoInfo = relevantCursos.FirstOrDefault(c => c.IdNivel == idNivelTarget.Value);
                    if (cursoInfo != null)
                    {
                        var resolvedCareer = allCarrerasList.FirstOrDefault(c => c.IdCarrera == cursoInfo.IdCarrera)?.Carrera1;
                        if (!string.IsNullOrEmpty(resolvedCareer) && !sCareers.Any(sc => sc.Equals(resolvedCareer, StringComparison.OrdinalIgnoreCase)))
                        {
                            sCareers.Add(resolvedCareer);
                        }
                    }
                }

                var carrerasDisponibles = sCareers.Any() ? string.Join(", ", sCareers) : "Estudiante";
                var carreraNom = sCareers.FirstOrDefault() ?? "Estudiante";

                var existingInvInJson = dto?.Investigadores?.FirstOrDefault(i => !string.IsNullOrEmpty(i.Cedula) && i.Cedula.Trim().Equals(cedula, StringComparison.OrdinalIgnoreCase));
                if (existingInvInJson != null && !string.IsNullOrWhiteSpace(existingInvInJson.Carrera))
                {
                    var savedCarrera = existingInvInJson.Carrera.Trim();
                    if (sCareers.Any(sc => sc != null && sc.Trim().Equals(savedCarrera, StringComparison.OrdinalIgnoreCase)))
                    {
                        carreraNom = savedCarrera;
                    }
                }

                userMetasDict.TryGetValue(pa.IdUsuario, out var metaStudent);

                investigadoresList.Add(new InvestigadorDto
                {
                    Nombre = pa.IdUsuarioNavigation?.Nombre,
                    Cedula = pa.IdUsuarioNavigation?.IdSigafi,
                    Email = email,
                    Rol = pa.Rol,
                    NivelAcademico = pa.NivelAcademico,
                    Telefono = phone,
                    Activo = pa.Activo ?? true,
                    FechaInicio = pa.FechaInicio,
                    FechaFin = pa.FechaFin,
                    MotivoCambio = pa.MotivoCambio,
                    Carrera = carreraNom,
                    CarrerasDisponibles = carrerasDisponibles,
                    FirmaHabilitada = metaStudent?.AceptoTerminosFirma
                });
            }

            dto ??= new ProyectoDto();
            dto.Uuid = p.Uuid;
            dto.CodigoInstitucional = p.CodigoInstitucional;
            dto.Estado = p.Estado;
            dto.IdConvocatoria = null;
            dto.ConvocatoriaTitulo = null;
            dto.IdCarrera = p.DocProyectosCarreras?.FirstOrDefault(pc => pc.Modalidad == "PRINCIPAL")?.IdCarrera ?? p.DocProyectosCarreras?.FirstOrDefault()?.IdCarrera;
            if (dto.IdCarrera.HasValue)
            {
                var carreraObj = allCarrerasList.FirstOrDefault(c => c.IdCarrera == dto.IdCarrera.Value);
                if (carreraObj != null)
                {
                    dto.Carrera = carreraObj.Carrera1;
                }
            }
            dto.Titulo = p.Titulo;
            dto.TiempoEjecucion = p.TiempoEjecucion;
            dto.TieneGrupoInvestigacion = false;
            dto.PuntajeEvaluacion = p.PuntajeEvaluacion;

            dto.DirectorProyecto = p.DocProyectoParticipantes
                .Where(pp => pp.EsDirector == true && pp.IdUsuarioNavigation != null && pp.TipoParticipante == "Docente")
                .Select(pp => pp.IdUsuarioNavigation!.Nombre)
                .FirstOrDefault()
                ?? p.DocProyectoParticipantes
                .Where(pp => pp.IdUsuarioNavigation != null && pp.TipoParticipante == "Docente")
                .Select(pp => pp.IdUsuarioNavigation!.Nombre)
                .FirstOrDefault()
                ?? dto.DirectorProyecto;

            dto.TieneGrupoInvestigacion = false;
            dto.GrupoInvestigacionTipo = "NO";
            dto.GrupoInvestigacion = null;
            dto.GrupoInvestigacionUuid = null;
            dto.GrupoInvestigacionNombre = null;

            dto.Investigadores = investigadoresList;

            dto.FechaPresentacion = p.FechaPresentacion?.ToString("dd/MM/yyyy");
            dto.FechaInicio = p.FechaInicio?.ToString("dd/MM/yyyy");
            dto.FechaFin = p.FechaFin?.ToString("dd/MM/yyyy");
            dto.FechaInicioEstimada = p.FechaInicio?.ToString("dd/MM/yyyy");
            dto.FechaFinEstimada = p.FechaFin?.ToString("dd/MM/yyyy");
            dto.FechaLimiteSubsanacion = p.FechaLimiteSubsanacion?.ToString("yyyy-MM-dd");
            dto.Periodo = dto.Periodo ?? currentPeriod?.Detalle;
            dto.PeriodoConvocatoria = dto.Periodo;
            dto.ObjetivosEspecificos = p.DocObjetivosProyecto
                .Where(o => !o.EsGeneral)
                .OrderBy(o => o.Orden)
                .Select(o => o.Descripcion)
                .ToList();
            dto.ResultadosEsperados = new List<ResultadoEsperadoDto>();
            var specificObjetivoIds = p.DocObjetivosProyecto
                .Where(o => !o.EsGeneral)
                .OrderBy(o => o.Orden)
                .Select(o => o.IdObjetivo)
                .ToList();

            dto.Cronograma = p.DocCronogramas.OrderBy(c => c.NumeroActividad).ToList().Select(c => new ActividadCronogramaDto
            {
                IdObjetivo = c.IdObjetivo == 0 ? 0 : (specificObjetivoIds.Contains(c.IdObjetivo) ? specificObjetivoIds.IndexOf(c.IdObjetivo) + 1 : 0),
                Numero = c.NumeroActividad,
                Actividad = c.Descripcion,
                RecursosNecesarios = c.RecursosNecesarios,
                Responsable = c.Responsable,
                Entregable = c.Entregable,
                Ponderacion = c.Ponderacion,
                EsEntregableCaces = c.EsEntregableCaces,
                FechaInicioPrevista = c.FechaInicioPrevista?.ToString("yyyy-MM-dd"),
                FechaFinPrevista = c.FechaFinPrevista?.ToString("yyyy-MM-dd"),
                Semanas = ProjectHelper.GetSemanasCalculadas(p.FechaInicio, p.FechaFin, c.FechaInicioPrevista, c.FechaFinPrevista)
            }).ToList();
            dto.Bibliografia = p.DocBibliografiasProyecto.Select(b => b.CitaApa).ToList();

            return dto;
        }

        private async Task<List<string>> GetEstadosConCargaHorariaAsync()
        {
            var list = await _context.DocConfigWorkflows
                .Where(w => w.Activo && w.ContabilizaCargaHoraria)
                .Select(w => w.EstadoDestino)
                .Distinct()
                .ToListAsync();
            if (list == null || !list.Any())
            {
                list = new List<string> { "Enviado", "En Revisión", "Aprobado", "En Ejecución" };
            }
            return list;
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
