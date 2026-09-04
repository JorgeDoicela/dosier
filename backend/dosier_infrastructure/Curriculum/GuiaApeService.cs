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
    public class GuiaApeService : IGuiaApeService
    {
        private readonly DosierContext _context;

        public GuiaApeService(DosierContext context)
        {
            _context = context;
        }

        public async Task<GuiaApeDto?> GetByIdAsync(int idGuiaApe)
        {
            var guia = await _context.DocGuiasApe
                .Include(g => g.Objetivos)
                .Include(g => g.ResultadosAprendizaje)
                .Include(g => g.CriteriosEvaluacion)
                .Include(g => g.PreparacionPrevia)
                .Include(g => g.Procedimientos)
                .Include(g => g.Referencias)
                .FirstOrDefaultAsync(g => g.IdGuiaApe == idGuiaApe && g.Activo);

            if (guia == null) return null;
            return await MapToDtoAsync(guia);
        }

        public async Task<List<GuiaApeDto>> GetGuiasByPeaIdAsync(int idPea)
        {
            var guias = await _context.DocGuiasApe
                .Include(g => g.Objetivos)
                .Include(g => g.ResultadosAprendizaje)
                .Include(g => g.CriteriosEvaluacion)
                .Include(g => g.PreparacionPrevia)
                .Include(g => g.Procedimientos)
                .Include(g => g.Referencias)
                .Where(g => g.IdPea == idPea && g.Activo)
                .OrderBy(g => g.NumeroPractica)
                .ToListAsync();

            var result = new List<GuiaApeDto>();
            foreach (var g in guias)
            {
                result.Add(await MapToDtoAsync(g));
            }
            return result;
        }

        public async Task<GuiaApeDto> GenerarGuiaDesdePracticaPeaAsync(int idPea, int idPracticaPea, string? idUsuario)
        {
            var pea = await _context.DocPeas
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.Bibliografias)
                .FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo)
                ?? throw new KeyNotFoundException($"No se encontró el PEA con id {idPea}");

            var practica = pea.ActividadesPracticas.FirstOrDefault(pr => pr.IdPractica == idPracticaPea)
                ?? throw new KeyNotFoundException($"No se encontró la práctica con id {idPracticaPea} en el PEA");

            var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura);
            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == pea.IdCarrera);

            var nuevaGuia = new DocGuiaApe
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = idPea,
                IdAsignatura = pea.IdAsignatura,
                IdCarrera = pea.IdCarrera,
                IdPeriodo = pea.IdPeriodo,
                IdDocente = pea.IdDocenteElaborador ?? idUsuario,
                CodigoFormato = "IT-P03-F05",
                VersionFormato = "01",
                FechaRevisionFormato = DateTime.Now.ToString("dd/MM/yyyy"),
                VigenciaFormato = $"{DateTime.Now.Year} - {DateTime.Now.Year + 1}",
                DuracionHoras = practica.DuracionHoras,
                DuracionSemanas = 1,
                NivelSemestre = pea.SemestreNivel,
                NumeroPractica = practica.NumeroPractica,
                TallerLaboratorio = "Laboratorio de Cómputo / Talleres Especializados ISTPET",
                TituloPractica = practica.NombrePractica,
                FundamentosTeoricos = !string.IsNullOrEmpty(practica.Caracterizacion)
                    ? practica.Caracterizacion
                    : $"Fundamentos teóricos y conceptuales para el desarrollo de la práctica {practica.NumeroPractica}: {practica.NombrePractica}.",
                InvestigacionAutonoma = "1. Investigar los antecedentes técnicos y requerimientos de entorno para la ejecución práctica.\n2. Analizar casos de uso y mejores prácticas de la industria.",
                MetodologiaDidactica = "Aprendizaje basado en problemas (ABP), ejecución guiada por el docente y experimentación en equipos.",
                NormasSeguridad = "1. Uso obligatorio de credencial institucional y respeto a los reglamentos de laboratorios.\n2. Prohibido el ingreso de alimentos o bebidas a los talleres.",
                HabilidadesBlandas = "Pensamiento analítico, resolución estructurada de problemas, trabajo en equipo y comunicación técnica asertiva.",
                IndicacionesEntrega = "1. Entrega del informe oficial en formato PDF a través de la plataforma virtual.\n2. Adjuntar capturas de evidencia y código fuente funcional.",
                Estado = "Borrador",
                Version = 1,
                Activo = true,
                FechaCreacion = DateTime.UtcNow,
                FechaModificacion = DateTime.UtcNow
            };

            // Objetivos
            nuevaGuia.Objetivos = new List<DocGuiaApeObjetivo>
            {
                new DocGuiaApeObjetivo { Uuid = Guid.NewGuid().ToString(), Descripcion = $"Implementar y verificar {practica.NombrePractica} aplicando las directrices técnicas del ISTPET.", Orden = 1 },
                new DocGuiaApeObjetivo { Uuid = Guid.NewGuid().ToString(), Descripcion = "Validar el funcionamiento correcto mediante pruebas y documentación de evidencias.", Orden = 2 }
            };

            // RDAs vinculados
            nuevaGuia.ResultadosAprendizaje = pea.ResultadosAprendizaje.Take(2).Select((r, idx) => new DocGuiaApeRda
            {
                Uuid = Guid.NewGuid().ToString(),
                IdRda = r.IdRda,
                DescripcionRda = r.Descripcion,
                Orden = idx + 1
            }).ToList();

            // Criterios de evaluación (Rúbrica de 10 puntos)
            nuevaGuia.CriteriosEvaluacion = new List<DocGuiaApeCriterio>
            {
                new DocGuiaApeCriterio { Uuid = Guid.NewGuid().ToString(), CriterioEvaluacion = "Fundamentación técnica e investigación previa", Puntaje = 2.50m, Orden = 1 },
                new DocGuiaApeCriterio { Uuid = Guid.NewGuid().ToString(), CriterioEvaluacion = "Ejecución correcta del procedimiento práctico", Puntaje = 3.50m, Orden = 2 },
                new DocGuiaApeCriterio { Uuid = Guid.NewGuid().ToString(), CriterioEvaluacion = "Resultados obtenidos y resolución de problemas", Puntaje = 2.00m, Orden = 3 },
                new DocGuiaApeCriterio { Uuid = Guid.NewGuid().ToString(), CriterioEvaluacion = "Conclusiones técnicas y formato del informe", Puntaje = 2.00m, Orden = 4 }
            };

            // Preparación previa
            nuevaGuia.PreparacionPrevia = new List<DocGuiaApePreparacion>
            {
                new DocGuiaApePreparacion { Uuid = Guid.NewGuid().ToString(), Tipo = "IndicacionPrevia", Descripcion = "Revisar los conceptos teóricos y preparar el entorno de trabajo antes de ingresar a la sesión.", Orden = 1 },
                new DocGuiaApePreparacion { Uuid = Guid.NewGuid().ToString(), Tipo = "MaterialEquipo", Descripcion = "Computador con herramientas de desarrollo y software base configurado.", CaracteristicasCantidad = "1 por estudiante / equipo", Orden = 2 }
            };

            // Procedimiento en partes
            nuevaGuia.Procedimientos = new List<DocGuiaApeProcedimiento>
            {
                new DocGuiaApeProcedimiento
                {
                    Uuid = Guid.NewGuid().ToString(),
                    NumeroParte = 1,
                    NombreEtapa = "Fase Inicial: Configuración y Verificación",
                    DescripcionEtapa = "Preparación del entorno, herramientas de desarrollo y carga de dependencias.",
                    InstruccionesDetalle = "[\"Verificar la conectividad y acceso a las herramientas.\", \"Crear la estructura del proyecto y repositorio local.\"]",
                    Orden = 1
                },
                new DocGuiaApeProcedimiento
                {
                    Uuid = Guid.NewGuid().ToString(),
                    NumeroParte = 2,
                    NombreEtapa = "Fase Central: Implementación Práctica",
                    DescripcionEtapa = "Codificación, ejecución del diseño y aplicación de la metodología.",
                    InstruccionesDetalle = "[\"Desarrollar los componentes requeridos siguiendo los requerimientos.\", \"Ejecutar pruebas unitarias y de integración.\"]",
                    Orden = 2
                }
            };

            // Referencias
            nuevaGuia.Referencias = pea.Bibliografias.Take(2).Select((b, idx) => new DocGuiaApeReferencia
            {
                Uuid = Guid.NewGuid().ToString(),
                CitaApa = b.CitaCompletaApa,
                Orden = idx + 1
            }).ToList();

            _context.DocGuiasApe.Add(nuevaGuia);
            await _context.SaveChangesAsync();

            return await MapToDtoAsync(nuevaGuia);
        }

        public async Task<GuiaApeDto> GuardarGuiaApeAsync(GuiaApeDto dto, string? idUsuarioModificador)
        {
            DocGuiaApe entity;

            if (dto.IdGuiaApe > 0)
            {
                entity = await _context.DocGuiasApe
                    .Include(g => g.Objetivos)
                    .Include(g => g.ResultadosAprendizaje)
                    .Include(g => g.CriteriosEvaluacion)
                    .Include(g => g.PreparacionPrevia)
                    .Include(g => g.Procedimientos)
                    .Include(g => g.Referencias)
                    .FirstOrDefaultAsync(g => g.IdGuiaApe == dto.IdGuiaApe && g.Activo)
                    ?? throw new KeyNotFoundException($"No se encontró la Guía APE con id {dto.IdGuiaApe}");

                entity.FechaPractica = dto.FechaPractica;
                entity.DuracionHoras = dto.DuracionHoras;
                entity.DuracionSemanas = dto.DuracionSemanas;
                entity.NivelSemestre = dto.NivelSemestre;
                entity.Paralelo = dto.Paralelo;
                entity.NumeroPractica = dto.NumeroPractica;
                entity.TallerLaboratorio = dto.TallerLaboratorio;
                entity.TituloPractica = dto.TituloPractica;
                entity.FundamentosTeoricos = dto.FundamentosTeoricos;
                entity.InvestigacionAutonoma = dto.InvestigacionAutonoma;
                entity.MetodologiaDidactica = dto.MetodologiaDidactica;
                entity.NormasSeguridad = dto.NormasSeguridad;
                entity.HabilidadesBlandas = dto.HabilidadesBlandas;
                entity.IndicacionesEntrega = dto.IndicacionesEntrega;
                entity.FechaModificacion = DateTime.UtcNow;

                _context.DocGuiasApeReferencias.RemoveRange(entity.Referencias);
                _context.DocGuiasApeProcedimientos.RemoveRange(entity.Procedimientos);
                _context.DocGuiasApePreparaciones.RemoveRange(entity.PreparacionPrevia);
                _context.DocGuiasApeCriterios.RemoveRange(entity.CriteriosEvaluacion);
                _context.DocGuiasApeRdas.RemoveRange(entity.ResultadosAprendizaje);
                _context.DocGuiasApeObjetivos.RemoveRange(entity.Objetivos);
            }
            else
            {
                entity = new DocGuiaApe
                {
                    Uuid = Guid.NewGuid().ToString(),
                    IdPea = dto.IdPea,
                    IdAsignatura = dto.IdAsignatura,
                    IdCarrera = dto.IdCarrera,
                    IdPeriodo = dto.IdPeriodo,
                    IdDocente = dto.IdDocente ?? idUsuarioModificador,
                    CodigoFormato = dto.CodigoFormato,
                    VersionFormato = dto.VersionFormato,
                    FechaRevisionFormato = dto.FechaRevisionFormato,
                    VigenciaFormato = dto.VigenciaFormato,
                    FechaPractica = dto.FechaPractica,
                    DuracionHoras = dto.DuracionHoras,
                    DuracionSemanas = dto.DuracionSemanas,
                    NivelSemestre = dto.NivelSemestre,
                    Paralelo = dto.Paralelo,
                    NumeroPractica = dto.NumeroPractica,
                    TallerLaboratorio = dto.TallerLaboratorio,
                    TituloPractica = dto.TituloPractica,
                    FundamentosTeoricos = dto.FundamentosTeoricos,
                    InvestigacionAutonoma = dto.InvestigacionAutonoma,
                    MetodologiaDidactica = dto.MetodologiaDidactica,
                    NormasSeguridad = dto.NormasSeguridad,
                    HabilidadesBlandas = dto.HabilidadesBlandas,
                    IndicacionesEntrega = dto.IndicacionesEntrega,
                    Estado = "Borrador",
                    Version = 1,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow,
                    FechaModificacion = DateTime.UtcNow
                };
                _context.DocGuiasApe.Add(entity);
            }

            entity.Objetivos = dto.Objetivos.Select(o => new DocGuiaApeObjetivo
            {
                Uuid = Guid.NewGuid().ToString(),
                Descripcion = o.Descripcion,
                Orden = o.Orden
            }).ToList();

            entity.ResultadosAprendizaje = dto.ResultadosAprendizaje.Select(r => new DocGuiaApeRda
            {
                Uuid = Guid.NewGuid().ToString(),
                IdRda = r.IdRda,
                DescripcionRda = r.DescripcionRda,
                Orden = r.Orden
            }).ToList();

            entity.CriteriosEvaluacion = dto.CriteriosEvaluacion.Select(c => new DocGuiaApeCriterio
            {
                Uuid = Guid.NewGuid().ToString(),
                CriterioEvaluacion = c.CriterioEvaluacion,
                Puntaje = c.Puntaje,
                Orden = c.Orden
            }).ToList();

            entity.PreparacionPrevia = dto.PreparacionPrevia.Select(p => new DocGuiaApePreparacion
            {
                Uuid = Guid.NewGuid().ToString(),
                Tipo = p.Tipo,
                Descripcion = p.Descripcion,
                CaracteristicasCantidad = p.CaracteristicasCantidad,
                Orden = p.Orden
            }).ToList();

            entity.Procedimientos = dto.Procedimientos.Select(p => new DocGuiaApeProcedimiento
            {
                Uuid = Guid.NewGuid().ToString(),
                NumeroParte = p.NumeroParte,
                NombreEtapa = p.NombreEtapa,
                DescripcionEtapa = p.DescripcionEtapa,
                InstruccionesDetalle = p.InstruccionesDetalle,
                Orden = p.Orden
            }).ToList();

            entity.Referencias = dto.Referencias.Select(r => new DocGuiaApeReferencia
            {
                Uuid = Guid.NewGuid().ToString(),
                CitaApa = r.CitaApa,
                Orden = r.Orden
            }).ToList();

            await _context.SaveChangesAsync();
            return await MapToDtoAsync(entity);
        }

        public async Task<bool> CambiarEstadoAsync(int idGuiaApe, string nuevoEstado, string? firma, string? idUsuario)
        {
            var entity = await _context.DocGuiasApe.FirstOrDefaultAsync(g => g.IdGuiaApe == idGuiaApe && g.Activo);
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
                entity.FirmaAprobadoDocencia = firma;
                entity.FechaAprobado = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<GuiaApeDto> MapToDtoAsync(DocGuiaApe guia)
        {
            var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == guia.IdAsignatura);
            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == guia.IdCarrera);
            var docente = !string.IsNullOrEmpty(guia.IdDocente)
                ? await _context.Profesores.AsNoTracking().FirstOrDefaultAsync(p => p.IdProfesor == guia.IdDocente)
                : null;

            return new GuiaApeDto
            {
                IdGuiaApe = guia.IdGuiaApe,
                Uuid = guia.Uuid,
                IdPea = guia.IdPea,
                IdAsignatura = guia.IdAsignatura,
                NombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura",
                IdCarrera = guia.IdCarrera,
                NombreCarrera = carrera?.Carrera1 ?? "Carrera",
                IdPeriodo = guia.IdPeriodo,
                IdDocente = guia.IdDocente,
                NombreDocente = docente != null ? $"{docente.Nombres} {docente.Apellidos}".Trim() : null,
                CodigoFormato = guia.CodigoFormato,
                VersionFormato = guia.VersionFormato,
                FechaRevisionFormato = guia.FechaRevisionFormato,
                VigenciaFormato = guia.VigenciaFormato,
                FechaPractica = guia.FechaPractica,
                DuracionHoras = guia.DuracionHoras,
                DuracionSemanas = guia.DuracionSemanas,
                NivelSemestre = guia.NivelSemestre,
                Paralelo = guia.Paralelo,
                NumeroPractica = guia.NumeroPractica,
                TallerLaboratorio = guia.TallerLaboratorio,
                TituloPractica = guia.TituloPractica,
                FundamentosTeoricos = guia.FundamentosTeoricos,
                InvestigacionAutonoma = guia.InvestigacionAutonoma,
                MetodologiaDidactica = guia.MetodologiaDidactica,
                NormasSeguridad = guia.NormasSeguridad,
                HabilidadesBlandas = guia.HabilidadesBlandas,
                IndicacionesEntrega = guia.IndicacionesEntrega,
                Estado = guia.Estado,
                Version = guia.Version,
                Activo = guia.Activo,
                Objetivos = guia.Objetivos.OrderBy(o => o.Orden).Select(o => new GuiaApeObjetivoDto
                {
                    IdObjetivo = o.IdObjetivo,
                    Uuid = o.Uuid,
                    IdGuiaApe = o.IdGuiaApe,
                    Descripcion = o.Descripcion,
                    Orden = o.Orden
                }).ToList(),
                ResultadosAprendizaje = guia.ResultadosAprendizaje.OrderBy(r => r.Orden).Select(r => new GuiaApeRdaDto
                {
                    IdGuiaRda = r.IdGuiaRda,
                    Uuid = r.Uuid,
                    IdGuiaApe = r.IdGuiaApe,
                    IdRda = r.IdRda,
                    DescripcionRda = r.DescripcionRda,
                    Orden = r.Orden
                }).ToList(),
                CriteriosEvaluacion = guia.CriteriosEvaluacion.OrderBy(c => c.Orden).Select(c => new GuiaApeCriterioDto
                {
                    IdCriterio = c.IdCriterio,
                    Uuid = c.Uuid,
                    IdGuiaApe = c.IdGuiaApe,
                    CriterioEvaluacion = c.CriterioEvaluacion,
                    Puntaje = c.Puntaje,
                    Orden = c.Orden
                }).ToList(),
                PreparacionPrevia = guia.PreparacionPrevia.OrderBy(p => p.Orden).Select(p => new GuiaApePreparacionDto
                {
                    IdPrep = p.IdPrep,
                    Uuid = p.Uuid,
                    IdGuiaApe = p.IdGuiaApe,
                    Tipo = p.Tipo,
                    Descripcion = p.Descripcion,
                    CaracteristicasCantidad = p.CaracteristicasCantidad,
                    Orden = p.Orden
                }).ToList(),
                Procedimientos = guia.Procedimientos.OrderBy(p => p.Orden).Select(p => new GuiaApeProcedimientoDto
                {
                    IdProcedimiento = p.IdProcedimiento,
                    Uuid = p.Uuid,
                    IdGuiaApe = p.IdGuiaApe,
                    NumeroParte = p.NumeroParte,
                    NombreEtapa = p.NombreEtapa,
                    DescripcionEtapa = p.DescripcionEtapa,
                    InstruccionesDetalle = p.InstruccionesDetalle,
                    Orden = p.Orden
                }).ToList(),
                Referencias = guia.Referencias.OrderBy(r => r.Orden).Select(r => new GuiaApeReferenciaDto
                {
                    IdReferencia = r.IdReferencia,
                    Uuid = r.Uuid,
                    IdGuiaApe = r.IdGuiaApe,
                    CitaApa = r.CitaApa,
                    Orden = r.Orden
                }).ToList()
            };
        }
    }
}
