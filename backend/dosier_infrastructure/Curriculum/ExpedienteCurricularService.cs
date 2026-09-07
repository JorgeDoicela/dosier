using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Academico;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;
using dosier_domain.Curriculum.Entities;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Curriculum
{
    public class ExpedienteCurricularService : IExpedienteCurricularService
    {
        private readonly DosierContext _context;
        private readonly IAcademicContextResolver _academicContextResolver;
        private readonly INormativaService _normativaService;
        private readonly IPerfilEgresoService _perfilEgresoService;

        public ExpedienteCurricularService(
            DosierContext context,
            IAcademicContextResolver academicContextResolver,
            INormativaService normativaService,
            IPerfilEgresoService perfilEgresoService)
        {
            _context = context;
            _academicContextResolver = academicContextResolver;
            _normativaService = normativaService;
            _perfilEgresoService = perfilEgresoService;
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
                IdPea = peaVigente?.IdPea,
                EstadoPea = peaVigente?.Estado,
                VersionPea = peaVigente?.Version
            };
        }
    }
}
