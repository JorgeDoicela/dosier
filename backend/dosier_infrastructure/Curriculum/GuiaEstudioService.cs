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
    public class GuiaEstudioService : IGuiaEstudioService
    {
        private readonly DosierContext _context;

        public GuiaEstudioService(DosierContext context)
        {
            _context = context;
        }

        public async Task<GuiaEstudioDto?> GetByIdAsync(int idGuiaEstudio)
        {
            var guia = await _context.DocGuiasEstudio
                .Include(g => g.Unidades).ThenInclude(u => u.Temas).ThenInclude(t => t.Subtemas)
                .Include(g => g.Unidades).ThenInclude(u => u.PreguntasGuia)
                .Include(g => g.Unidades).ThenInclude(u => u.Glosarios)
                .Include(g => g.Unidades).ThenInclude(u => u.Actividades)
                .Include(g => g.Unidades).ThenInclude(u => u.Referencias)
                .FirstOrDefaultAsync(g => g.IdGuiaEstudio == idGuiaEstudio && g.Activo);

            if (guia == null) return null;
            return await MapToDtoAsync(guia);
        }

        public async Task<GuiaEstudioDto?> GetByPeaIdAsync(int idPea)
        {
            var guia = await _context.DocGuiasEstudio
                .Include(g => g.Unidades).ThenInclude(u => u.Temas).ThenInclude(t => t.Subtemas)
                .Include(g => g.Unidades).ThenInclude(u => u.PreguntasGuia)
                .Include(g => g.Unidades).ThenInclude(u => u.Glosarios)
                .Include(g => g.Unidades).ThenInclude(u => u.Actividades)
                .Include(g => g.Unidades).ThenInclude(u => u.Referencias)
                .FirstOrDefaultAsync(g => g.IdPea == idPea && g.Activo);

            if (guia == null) return null;
            return await MapToDtoAsync(guia);
        }

        public async Task<GuiaEstudioDto> GenerarGuiaEstudioDesdePeaAsync(int idPea, string? idUsuario)
        {
            var pea = await _context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.Bibliografias)
                .FirstOrDefaultAsync(p => p.IdPea == idPea && p.Activo)
                ?? throw new KeyNotFoundException($"No se encontró el PEA con id {idPea}");

            var guiaExistente = await _context.DocGuiasEstudio
                .Include(g => g.Unidades).ThenInclude(u => u.Temas)
                .FirstOrDefaultAsync(g => g.IdPea == idPea && g.Activo);

            if (guiaExistente != null)
            {
                return await MapToDtoAsync(guiaExistente);
            }

            var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura);
            var nombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura";

            var nuevaGuia = new DocGuiaEstudio
            {
                Uuid = Guid.NewGuid().ToString(),
                IdPea = idPea,
                IdAsignatura = pea.IdAsignatura,
                IdCarrera = pea.IdCarrera,
                IdPeriodo = pea.IdPeriodo,
                IdDocenteElaborador = pea.IdDocenteElaborador ?? idUsuario,
                EncabezadoOficial = $"Guía de estudio de la asignatura: {nombreAsignatura}",
                IntroduccionGeneral = $"La presente guía de estudio y compendio académico para la asignatura de {nombreAsignatura} orienta el trabajo autónomo del estudiante del ISTPET a través de unidades temáticas, preguntas guía de autoevaluación, glosarios y actividades en el Entorno Virtual de Aprendizaje (EVA).",
                Estado = "Borrador",
                Version = 1,
                Activo = true,
                FechaCreacion = DateTime.UtcNow,
                FechaModificacion = DateTime.UtcNow
            };

            var unidadesList = new List<DocGuiaEstudioUnidad>();
            foreach (var uPea in pea.Unidades.OrderBy(u => u.NumeroUnidad))
            {
                var uni = new DocGuiaEstudioUnidad
                {
                    Uuid = Guid.NewGuid().ToString(),
                    NumeroUnidad = uPea.NumeroUnidad,
                    NombreUnidad = uPea.NombreUnidad,
                    Orden = uPea.Orden
                };

                // Temas y Subtemas
                uni.Temas = uPea.Temas.OrderBy(t => t.NumeroTema).Select(t => new DocGuiaEstudioTema
                {
                    Uuid = Guid.NewGuid().ToString(),
                    NumeroTema = t.NumeroTema,
                    NombreTema = t.TituloTema,
                    ContenidoDesarrollo = $"Desarrollo conceptual, fundamentos teóricos y análisis de la temática {t.TituloTema}.",
                    Orden = t.Orden,
                    Subtemas = new List<DocGuiaEstudioSubtema>
                    {
                        new DocGuiaEstudioSubtema
                        {
                            Uuid = Guid.NewGuid().ToString(),
                            NumeroSubtema = $"{t.NumeroTema}.1",
                            TituloSubtema = $"Fundamentos y principios de {t.TituloTema}",
                            ContenidoTeorico = $"Explicación detallada y marco conceptual de los principios fundamentales de {t.TituloTema}.",
                            Orden = 1
                        },
                        new DocGuiaEstudioSubtema
                        {
                            Uuid = Guid.NewGuid().ToString(),
                            NumeroSubtema = $"{t.NumeroTema}.2",
                            TituloSubtema = $"Aplicación y casos prácticos",
                            ContenidoTeorico = "Metodología de resolución y desarrollo de ejemplos demostrativos.",
                            EjemplosCodigo = "// Ejemplo demostrativo\npublic void Ejecutar() { Console.WriteLine(\"Procesando...\"); }",
                            Orden = 2
                        }
                    }
                }).ToList();

                // 11 Preguntas guía por unidad
                var preguntas = new List<DocGuiaEstudioPreguntaGuia>();
                for (int p = 1; p <= 11; p++)
                {
                    preguntas.Add(new DocGuiaEstudioPreguntaGuia
                    {
                        Uuid = Guid.NewGuid().ToString(),
                        NumeroPregunta = p,
                        Pregunta = $"Pregunta {p}: ¿Cuáles son los aspectos clave de {uPea.NombreUnidad} relacionados con el tema {p}?",
                        RespuestaDocente = $"Respuesta técnica explicativa orientada a la autoevaluación del estudiante en la pregunta {p}.",
                        Orden = p
                    });
                }
                uni.PreguntasGuia = preguntas;

                // 10 Términos de glosario por unidad
                var glosarios = new List<DocGuiaEstudioGlosario>();
                for (int g = 1; g <= 10; g++)
                {
                    glosarios.Add(new DocGuiaEstudioGlosario
                    {
                        Uuid = Guid.NewGuid().ToString(),
                        Termino = $"Término {g} ({uPea.NombreUnidad})",
                        Definicion = $"Definición precisa y contextualizada del término técnico {g} para la unidad {uPea.NumeroUnidad}.",
                        Orden = g
                    });
                }
                uni.Glosarios = glosarios;

                // Actividades EVA
                uni.Actividades = new List<DocGuiaEstudioActividad>
                {
                    new DocGuiaEstudioActividad
                    {
                        Uuid = Guid.NewGuid().ToString(),
                        CodigoTabla = $"Tabla 1. Actividad P{uPea.NumeroUnidad}",
                        TituloActividad = $"Actividad Autónoma Unidad {uPea.NumeroUnidad}: Resolución de Casos y Cuestionario",
                        DescripcionActividad = $"Lectura comprensiva del compendio, elaboración del informe analítico y respuesta a los cuestionarios de la unidad en Moodle.",
                        TipoPracticaP = $"P{uPea.NumeroUnidad}",
                        RubricaDetalleJson = "{\"criterios\": [\"Comprensión teórica\", \"Precisión técnica\", \"Calidad de redacción\"], \"puntaje\": 10.00}",
                        Orden = 1
                    }
                };

                // Referencias
                uni.Referencias = pea.Bibliografias.Take(3).Select((b, idx) => new DocGuiaEstudioReferencia
                {
                    Uuid = Guid.NewGuid().ToString(),
                    ReferenciaCompletaApa = b.CitaCompletaApa,
                    Orden = idx + 1
                }).ToList();

                unidadesList.Add(uni);
            }

            nuevaGuia.Unidades = unidadesList;

            _context.DocGuiasEstudio.Add(nuevaGuia);
            await _context.SaveChangesAsync();

            return await MapToDtoAsync(nuevaGuia);
        }

        public async Task<GuiaEstudioDto> GuardarGuiaEstudioAsync(GuiaEstudioDto dto, string? idUsuarioModificador)
        {
            var entity = await _context.DocGuiasEstudio
                .Include(g => g.Unidades).ThenInclude(u => u.Temas).ThenInclude(t => t.Subtemas)
                .Include(g => g.Unidades).ThenInclude(u => u.PreguntasGuia)
                .Include(g => g.Unidades).ThenInclude(u => u.Glosarios)
                .Include(g => g.Unidades).ThenInclude(u => u.Actividades)
                .Include(g => g.Unidades).ThenInclude(u => u.Referencias)
                .FirstOrDefaultAsync(g => g.IdGuiaEstudio == dto.IdGuiaEstudio && g.Activo)
                ?? throw new KeyNotFoundException($"No se encontró la Guía de Estudio con id {dto.IdGuiaEstudio}");

            entity.EncabezadoOficial = dto.EncabezadoOficial;
            entity.IntroduccionGeneral = dto.IntroduccionGeneral;
            entity.FechaModificacion = DateTime.UtcNow;

            _context.DocGuiasEstudioUnidades.RemoveRange(entity.Unidades);

            entity.Unidades = dto.Unidades.Select(u => new DocGuiaEstudioUnidad
            {
                Uuid = Guid.NewGuid().ToString(),
                NumeroUnidad = u.NumeroUnidad,
                NombreUnidad = u.NombreUnidad,
                Orden = u.Orden,
                Temas = u.Temas.Select(t => new DocGuiaEstudioTema
                {
                    Uuid = Guid.NewGuid().ToString(),
                    NumeroTema = t.NumeroTema,
                    NombreTema = t.NombreTema,
                    ContenidoDesarrollo = t.ContenidoDesarrollo,
                    CuadrosApoyoJson = t.CuadrosApoyoJson,
                    Orden = t.Orden,
                    Subtemas = t.Subtemas.Select(s => new DocGuiaEstudioSubtema
                    {
                        Uuid = Guid.NewGuid().ToString(),
                        NumeroSubtema = s.NumeroSubtema,
                        TituloSubtema = s.TituloSubtema,
                        ContenidoTeorico = s.ContenidoTeorico,
                        EjemplosCodigo = s.EjemplosCodigo,
                        Orden = s.Orden
                    }).ToList()
                }).ToList(),
                PreguntasGuia = u.PreguntasGuia.Select(p => new DocGuiaEstudioPreguntaGuia
                {
                    Uuid = Guid.NewGuid().ToString(),
                    NumeroPregunta = p.NumeroPregunta,
                    Pregunta = p.Pregunta,
                    RespuestaDocente = p.RespuestaDocente,
                    Orden = p.Orden
                }).ToList(),
                Glosarios = u.Glosarios.Select(g => new DocGuiaEstudioGlosario
                {
                    Uuid = Guid.NewGuid().ToString(),
                    Termino = g.Termino,
                    Definicion = g.Definicion,
                    Orden = g.Orden
                }).ToList(),
                Actividades = u.Actividades.Select(a => new DocGuiaEstudioActividad
                {
                    Uuid = Guid.NewGuid().ToString(),
                    CodigoTabla = a.CodigoTabla,
                    TituloActividad = a.TituloActividad,
                    DescripcionActividad = a.DescripcionActividad,
                    TipoPracticaP = a.TipoPracticaP,
                    RubricaDetalleJson = a.RubricaDetalleJson,
                    Orden = a.Orden
                }).ToList(),
                Referencias = u.Referencias.Select(r => new DocGuiaEstudioReferencia
                {
                    Uuid = Guid.NewGuid().ToString(),
                    ReferenciaCompletaApa = r.ReferenciaCompletaApa,
                    Orden = r.Orden
                }).ToList()
            }).ToList();

            await _context.SaveChangesAsync();
            return await MapToDtoAsync(entity);
        }

        public async Task<bool> CambiarEstadoAsync(int idGuiaEstudio, string nuevoEstado, string? firma, string? idUsuario)
        {
            var entity = await _context.DocGuiasEstudio.FirstOrDefaultAsync(g => g.IdGuiaEstudio == idGuiaEstudio && g.Activo);
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

        private async Task<GuiaEstudioDto> MapToDtoAsync(DocGuiaEstudio guia)
        {
            var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == guia.IdAsignatura);
            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == guia.IdCarrera);
            var docente = !string.IsNullOrEmpty(guia.IdDocenteElaborador)
                ? await _context.Profesores.AsNoTracking().FirstOrDefaultAsync(p => p.IdProfesor == guia.IdDocenteElaborador)
                : null;

            return new GuiaEstudioDto
            {
                IdGuiaEstudio = guia.IdGuiaEstudio,
                Uuid = guia.Uuid,
                IdPea = guia.IdPea,
                IdAsignatura = guia.IdAsignatura,
                NombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura",
                IdCarrera = guia.IdCarrera,
                NombreCarrera = carrera?.Carrera1 ?? "Carrera",
                IdPeriodo = guia.IdPeriodo,
                IdDocenteElaborador = guia.IdDocenteElaborador,
                NombreDocenteElaborador = docente != null ? $"{docente.Nombres} {docente.Apellidos}".Trim() : null,
                EncabezadoOficial = guia.EncabezadoOficial,
                IntroduccionGeneral = guia.IntroduccionGeneral,
                Estado = guia.Estado,
                Version = guia.Version,
                Activo = guia.Activo,
                Unidades = guia.Unidades.OrderBy(u => u.Orden).Select(u => new GuiaEstudioUnidadDto
                {
                    IdGuiaUnidad = u.IdGuiaUnidad,
                    Uuid = u.Uuid,
                    IdGuiaEstudio = u.IdGuiaEstudio,
                    NumeroUnidad = u.NumeroUnidad,
                    NombreUnidad = u.NombreUnidad,
                    Orden = u.Orden,
                    Temas = u.Temas.OrderBy(t => t.Orden).Select(t => new GuiaEstudioTemaDto
                    {
                        IdGuiaTema = t.IdGuiaTema,
                        Uuid = t.Uuid,
                        IdGuiaUnidad = t.IdGuiaUnidad,
                        NumeroTema = t.NumeroTema,
                        NombreTema = t.NombreTema,
                        ContenidoDesarrollo = t.ContenidoDesarrollo,
                        CuadrosApoyoJson = t.CuadrosApoyoJson,
                        Orden = t.Orden,
                        Subtemas = t.Subtemas.OrderBy(s => s.Orden).Select(s => new GuiaEstudioSubtemaDto
                        {
                            IdGuiaSubtema = s.IdGuiaSubtema,
                            Uuid = s.Uuid,
                            IdGuiaTema = s.IdGuiaTema,
                            NumeroSubtema = s.NumeroSubtema,
                            TituloSubtema = s.TituloSubtema,
                            ContenidoTeorico = s.ContenidoTeorico,
                            EjemplosCodigo = s.EjemplosCodigo,
                            Orden = s.Orden
                        }).ToList()
                    }).ToList(),
                    PreguntasGuia = u.PreguntasGuia.OrderBy(p => p.Orden).Select(p => new GuiaEstudioPreguntaGuiaDto
                    {
                        IdPreguntaGuia = p.IdPreguntaGuia,
                        Uuid = p.Uuid,
                        IdGuiaUnidad = p.IdGuiaUnidad,
                        NumeroPregunta = p.NumeroPregunta,
                        Pregunta = p.Pregunta,
                        RespuestaDocente = p.RespuestaDocente,
                        Orden = p.Orden
                    }).ToList(),
                    Glosarios = u.Glosarios.OrderBy(g => g.Orden).Select(g => new GuiaEstudioGlosarioDto
                    {
                        IdGlosario = g.IdGlosario,
                        Uuid = g.Uuid,
                        IdGuiaUnidad = g.IdGuiaUnidad,
                        Termino = g.Termino,
                        Definicion = g.Definicion,
                        Orden = g.Orden
                    }).ToList(),
                    Actividades = u.Actividades.OrderBy(a => a.Orden).Select(a => new GuiaEstudioActividadDto
                    {
                        IdActividad = a.IdActividad,
                        Uuid = a.Uuid,
                        IdGuiaUnidad = a.IdGuiaUnidad,
                        CodigoTabla = a.CodigoTabla,
                        TituloActividad = a.TituloActividad,
                        DescripcionActividad = a.DescripcionActividad,
                        TipoPracticaP = a.TipoPracticaP,
                        RubricaDetalleJson = a.RubricaDetalleJson,
                        Orden = a.Orden
                    }).ToList(),
                    Referencias = u.Referencias.OrderBy(r => r.Orden).Select(r => new GuiaEstudioReferenciaDto
                    {
                        IdGuiaRef = r.IdGuiaRef,
                        Uuid = r.Uuid,
                        IdGuiaUnidad = r.IdGuiaUnidad,
                        ReferenciaCompletaApa = r.ReferenciaCompletaApa,
                        Orden = r.Orden
                    }).ToList()
                }).ToList()
            };
        }
    }
}
