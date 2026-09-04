using Microsoft.EntityFrameworkCore;
using dosier_domain.Identity.Entities;
using dosier_infrastructure.data.models.Cowork;

namespace dosier_infrastructure.data.models;

/// <summary>
/// Contexto LIMPIO del sistema Dosier.
/// Solo contiene las tablas que el sistema de Investigación e Innovación
/// realmente usa. No confundirse con SigafiEsContext (que tiene las 235 
/// tablas del legacy completo y está solo como referencia).
///
/// TABLAS PROPIAS (doc_):      Tablas nuevas creadas para Dosier
/// TABLAS DE SIGAFI (lecturas): Solo las necesarias para el sistema
/// </summary>
public partial class DosierContext : DbContext
{
    public DosierContext() { }

    public DosierContext(DbContextOptions<DosierContext> options) : base(options) { }

    // ============================================================
    // TABLAS NUEVAS Dosier (doc_) - V3 Core Schema
    // ============================================================
    public virtual DbSet<DocGrupoInvestigacion> DocGruposInvestigacion { get; set; }
    public virtual DbSet<DocGrupoMiembro>       DocGruposMiembros       { get; set; }
    public virtual DbSet<DocTipoConvocatoria>   DocTiposConvocatoria   { get; set; }
    public virtual DbSet<DocAgendaZonal>        DocAgendasZonales      { get; set; }
    public virtual DbSet<DocConvocatoria>       DocConvocatorias       { get; set; }
    public virtual DbSet<DocProyecto>           DocProyectos           { get; set; }
    public virtual DbSet<DocProyectoCarrera>    DocProyectosCarreras    { get; set; }
    public virtual DbSet<DocProyectoParticipante> DocProyectoParticipantes { get; set; }
    public virtual DbSet<DocObjetivoProyecto>   DocObjetivosProyecto   { get; set; }
    public virtual DbSet<DocOdsEje>             DocOdsEjes             { get; set; }
    public virtual DbSet<DocOds>                DocOds                 { get; set; }
    public virtual DbSet<DocProyectoOds>        DocProyectosOds        { get; set; }
    public virtual DbSet<DocCatImpacto>         DocCatImpactos         { get; set; }
    public virtual DbSet<DocImpactoProyecto>    DocImpactosProyecto    { get; set; }
    public virtual DbSet<DocCronograma>         DocCronogramas         { get; set; }
    public virtual DbSet<DocBibliografiaProyecto> DocBibliografiasProyecto { get; set; }
    public virtual DbSet<DocTrazabilidadProyecto> DocTrazabilidadProyectos { get; set; }
    public virtual DbSet<DocConfigWorkflow> DocConfigWorkflows { get; set; }
    public virtual DbSet<DocDocumentoSeccionMetadata> DocDocumentosSeccionesMetadata { get; set; }
    public virtual DbSet<DocCollaborationComment> DocCollaborationComments { get; set; }
    public virtual DbSet<DocPndObjetivo>               DocPndObjetivos              { get; set; }
    public virtual DbSet<DocProyectoMml>               DocProyectosMml               { get; set; }
    public virtual DbSet<DocProyectoDocumentoAdjunto>  DocProyectosDocumentosAdjuntos { get; set; }

    // --- Sistema y Seguridad ---
    public virtual DbSet<DocNotificacion>       DocNotificaciones      { get; set; }
    public virtual DbSet<DocEmailTemplate>     DocEmailTemplates      { get; set; }
    public virtual DbSet<DocEmailHistorial>    DocEmailHistorials     { get; set; }
    public virtual DbSet<AccessToken>           DocTokensAcceso        { get; set; }
    public virtual DbSet<DocUsuarioMetadata>    DocUsuariosMetadata    { get; set; }
    public virtual DbSet<DocLopdpConsentimiento> DocLopdpConsentimientos { get; set; }
    public virtual DbSet<DocLopdpAuditoriaDatos> DocLopdpAuditoriaDatos  { get; set; }
    public virtual DbSet<DocAuditAdmin>       DocAuditAdmin          { get; set; }
    public virtual DbSet<DocDispositivoToken> DocDispositivosTokens   { get; set; }
    public virtual DbSet<DocMagicLink>        DocMagicLinks          { get; set; }
    public virtual DbSet<DocConfigGeneral>    DocConfigsGenerales    { get; set; }
    public virtual DbSet<DocBackupLog>        DocBackupLogs          { get; set; }

    public virtual DbSet<DocCatTipoEvidencia>  DocCatTipoEvidencias   { get; set; }
    public virtual DbSet<DocEntidadExterna>    DocEntidadesExternas   { get; set; }
    public virtual DbSet<DocProyectoExtension> DocProyectoExtensions { get; set; }

    // --- Módulo Calendario ---
    public virtual DbSet<DocCalendarioEventoNormativo>  DocCalendarioEventosNormativos  { get; set; }
    public virtual DbSet<DocIcalToken>                  DocIcalTokens                   { get; set; }
    public virtual DbSet<DocCalendarioAlertaEnviada>    DocCalendarioAlertasEnviadas    { get; set; }

    // --- DOSIER Document Engine (Persistence & Audit) ---
    public virtual DbSet<Dosier.Domain.Common.Documents.DocumentTemplate> DocumentTemplates { get; set; }
    public virtual DbSet<Dosier.Domain.Common.Documents.DocumentInstance> DocumentInstances { get; set; }
    public virtual DbSet<Dosier.Domain.Common.Documents.DocumentAuditEntry> DocumentAuditEntries { get; set; }

    // --- DOSIER Firma (Módulo de Firma Digital Institucional) ---
    public virtual DbSet<DocDocumentoFirma>       DocDocumentoFirmas       { get; set; }
    public virtual DbSet<DocUserSignaturePerfil>  DocUserSignaturePerfiles { get; set; }
    public virtual DbSet<CargoInstituto>          CargosInstituto          { get; set; }

    // --- DOSIER CoWork (Persistencia Colaborativa) ---
    public virtual DbSet<DocCoworkDocumento> DocCoworkDocumentos { get; set; }
    public virtual DbSet<DocCoworkUpdate>    DocCoworkUpdates    { get; set; }
    public virtual DbSet<DocCoworkSesion>    DocCoworkSesiones   { get; set; }

    // --- DOSIER Curricular (Los 4 Documentos Oficiales ISTPET) ---
    // 1. PEA (Programa de Estudio de la Asignatura)
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocPea>                  DocPeas                   { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocPeaUnidad>            DocPeaUnidades            { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocPeaTema>              DocPeaTemas               { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocPeaResultadoAprendizaje> DocPeaResultadosAprendizaje { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocPeaActividadPractica> DocPeaActividadesPracticas { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocPeaBibliografia>      DocPeaBibliografias       { get; set; }

    // 2. Sílabo / Plan Analítico (19 Semanas)
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocSilabo>               DocSilabos                { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocSilaboSemana>         DocSilaboSemanas          { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocSilaboAdaptacion>     DocSilaboAdaptaciones     { get; set; }

    // 3. Guías de Trabajo Práctico - Experimental (Guías APE)
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaApe>              DocGuiasApe               { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaApeObjetivo>      DocGuiasApeObjetivos      { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaApeRda>           DocGuiasApeRdas           { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaApeCriterio>      DocGuiasApeCriterios      { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaApePreparacion>   DocGuiasApePreparaciones  { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaApeProcedimiento> DocGuiasApeProcedimientos{ get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaApeReferencia>   DocGuiasApeReferencias    { get; set; }

    // 4. Guía de Estudio / Compendio Autónomo de la Asignatura
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaEstudio>          DocGuiasEstudio           { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaEstudioUnidad>    DocGuiasEstudioUnidades   { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaEstudioTema>      DocGuiasEstudioTemas      { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaEstudioSubtema>   DocGuiasEstudioSubtemas   { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaEstudioPreguntaGuia> DocGuiasEstudioPreguntasGuia { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaEstudioGlosario>  DocGuiasEstudioGlosarios  { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaEstudioActividad> DocGuiasEstudioActividades { get; set; }
    public virtual DbSet<dosier_domain.Curriculum.Entities.DocGuiaEstudioReferencia>DocGuiasEstudioReferencias { get; set; }

    // ============================================================
    // TABLAS DE SIGAFI (solo lectura recomendada)
    // Los investigadores, alumnos, periodos, horarios y carreras 
    // ya existen en SIGAFI. Aquí solo los consultamos, NO los creamos.
    // ============================================================

    // --- Actores ---
    public virtual DbSet<Profesore>    Profesores  { get; set; }   // profesores
    public virtual DbSet<Alumno>       Alumnos     { get; set; }   // alumnos

    // Core de Identidad Centralizado (SIGAFI Centralization)
    public virtual DbSet<User>                Users                 { get; set; }   // usuarios
    public virtual DbSet<Role>                Roles                 { get; set; }   // rol
    public virtual DbSet<UserRole>            UserRoles             { get; set; }   // usuario_rol
    public virtual DbSet<SystemEntity>        Systems               { get; set; }   // sistema
    public virtual DbSet<IdentityModule>      Modules               { get; set; }   // modulos
    public virtual DbSet<IdentityOperation>   Operations            { get; set; }   // operaciones
    public virtual DbSet<ModuleOperation>     ModuleOperations      { get; set; }   // modulos_operaciones
    public virtual DbSet<RoleModuleOperation> RoleModuleOperations  { get; set; }   // rol_modulo_operacion

    // --- Académico ---
    public virtual DbSet<Periodo>              Periodos           { get; set; }  // periodos
    public virtual DbSet<Carrera>              Carreras           { get; set; }  // carreras
    public virtual DbSet<ProfesoresCarrerasPeriodo> ProfesoresCarrerasPeriodos { get; set; } // profesores_carreras_periodos
    public virtual DbSet<AlumnosCarrera>            AlumnosCarreras           { get; set; } // alumnos_carreras
    public virtual DbSet<Departamento>         Departamentos      { get; set; }  // departamentos
    public virtual DbSet<Espacio>              Espacios           { get; set; }  // espacios (labs/aulas)
    public virtual DbSet<AsignacionesProfesore>AsignacionesProfesores { get; set; } // asignaciones_profesores (carga horaria)
    public virtual DbSet<HorarioDetalle>       HorariosDetalle    { get; set; }  // horario_detalle (día/hora física)
    public virtual DbSet<FechasHorario>        FechasHorarios     { get; set; }  // fechas_horario (fechas de calendario para horarios)
    public virtual DbSet<HorasClase>           HorasClase         { get; set; }  // horas_clases (franjas horarias)
    public virtual DbSet<Matricula>            Matriculas         { get; set; }  // matriculas
    public virtual DbSet<Curso>                Cursos             { get; set; }  // cursos
    public virtual DbSet<Asignatura>           Asignaturas        { get; set; }  // asignaturas
    public virtual DbSet<Malla>                Mallas             { get; set; }  // mallas
    public virtual DbSet<DetalleMalla>         DetalleMallas      { get; set; }  // detallemallas
    public virtual DbSet<Prerequisito>         Prerequisitos      { get; set; }  // prerequisitos
    public virtual DbSet<TipoAsignatura>       TiposAsignatura    { get; set; }  // tipos_asignatura
    public virtual DbSet<Modalidad>            Modalidades        { get; set; }  // modalidades
    public virtual DbSet<Parcial>              Parciales          { get; set; }  // parciales
    public virtual DbSet<ParcialModalidadFecha>ParcialesModalidadesFechas { get; set; } // parciales_modalidades_fechas

    // --- Títulos y nivel académico (para reportes CACES) ---
    public virtual DbSet<TitulosProfesore>     TitulosProfesores  { get; set; }  // titulos_profesores
    public virtual DbSet<GradosAcademico>      GradosAcademicos   { get; set; }  // grados_academicos
    public virtual DbSet<NivelesAcademico>     NivelesAcademicos  { get; set; }  // niveles_academicos
    public virtual DbSet<Universidade>         Universidades       { get; set; } // universidades
    public virtual DbSet<Etnia>                Etnias             { get; set; }  // etnias (caces)
    public virtual DbSet<Discapacidade>        Discapacidades     { get; set; }  // discapacidades (caces)

    // --- Actividades del docente (horas de investigación) ---
    public virtual DbSet<ProfesoresActividade>     ProfesoresActividades    { get; set; } // profesores_actividades
    public virtual DbSet<SubcategoriasActividade>  SubcategoriasActividades { get; set; } // subcategorias_actividades
    public virtual DbSet<Contrato>                 Contratos                { get; set; } // contratos
    public virtual DbSet<TiposContrato>            TiposContratos           { get; set; } // tipos_contratos
    public virtual DbSet<HorasAcademica>           HorasAcademicas          { get; set; } // horas_academicas (los límites permitidos)

    // --- Clasificación UNESCO (obligatorio SENESCYT) ---
    public virtual DbSet<CampoDetalladoUnesco>  CamposDetalladoUnesco { get; set; } // campo_detallado_unesco
    public virtual DbSet<CampoEspecificoUnesco> CamposEspecificoUnesco { get; set; }// campo_especifico_unesco
    public virtual DbSet<CampoAmplioUnesco>     CamposAmplioUnesco    { get; set; } // campo_amplio_unesco

    // --- Datos institucionales (para actas y certificados) ---
    public virtual DbSet<InstitucionesInstituto>InstitucionesInstitutos{ get; set; } // instituciones_instituto (RUC, dirección)
    public virtual DbSet<Parametro>             Parametros            { get; set; } // parametros (rector, firma, sello)

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // La conexión se inyecta desde Program.cs vía AddDbContext<DosierContext>
        // No se configura aquí para evitar credenciales en el código fuente
        optionsBuilder.ConfigureWarnings(warnings => 
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.PossibleIncorrectRequiredNavigationWithQueryFilterInteractionWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DocProyecto>().HasQueryFilter(p => p.Eliminado != true);
        modelBuilder.Entity<DocConvocatoria>().HasQueryFilter(c => c.Eliminado != true);
        modelBuilder.Entity<DocGrupoInvestigacion>().HasQueryFilter(g => g.Eliminado != true);

        // Modularización de Fluent API mediante clases parciales
        OnModelCreatingSigafi(modelBuilder);
        OnModelCreatingIdentity(modelBuilder);
        OnModelCreatingDosier(modelBuilder);

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingSigafi(ModelBuilder modelBuilder);
    partial void OnModelCreatingIdentity(ModelBuilder modelBuilder);
    partial void OnModelCreatingDosier(ModelBuilder modelBuilder);
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
