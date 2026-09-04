using System;
using System.Collections.Generic;
using dosier_domain.Identity.Entities;

namespace dosier_infrastructure.data.models;

/// <summary>
/// Participante de un proyecto de investigacion (docente, alumno o externo).
/// Reemplaza las tablas separadas doc_proyectos_profesores e doc_proyectos_alumnos
/// bajo un modelo unificado con discriminador TipoParticipante.
/// </summary>
public partial class DocProyectoParticipante
{
    public int IdParticipante { get; set; }
    public int IdProyecto { get; set; }
    public int IdUsuario { get; set; }

    /// <summary>Docente | Alumno | Externo</summary>
    public string TipoParticipante { get; set; } = "Docente";

    public bool? EsDirector { get; set; } = false;
    public string? Rol { get; set; }
    public string? NivelAcademico { get; set; }
    public string? Telefono { get; set; }
    public decimal? HorasSemanales { get; set; }
    public bool? Activo { get; set; } = true;
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string? MotivoCambio { get; set; }

    public virtual DocProyecto? IdProyectoNavigation { get; set; }
    public virtual User? IdUsuarioNavigation { get; set; }
}
