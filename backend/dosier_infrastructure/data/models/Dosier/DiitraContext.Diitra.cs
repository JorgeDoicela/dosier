using Microsoft.EntityFrameworkCore;
using dosier_infrastructure.data.models.Configurations;

namespace dosier_infrastructure.data.models;

public partial class DosierContext
{
    partial void OnModelCreatingDosier(ModelBuilder modelBuilder)
    {
        // Catálogos e información maestra
        modelBuilder.ApplyConfiguration(new DocTipoConvocatoriaConfiguration());
        modelBuilder.ApplyConfiguration(new DocAgendaZonalConfiguration());
        modelBuilder.ApplyConfiguration(new DocOdsEjeConfiguration());
        modelBuilder.ApplyConfiguration(new DocOdsConfiguration());
        modelBuilder.ApplyConfiguration(new DocCatImpactoConfiguration());
        modelBuilder.ApplyConfiguration(new DocCatTipoEvidenciaConfiguration());
        modelBuilder.ApplyConfiguration(new DocEntidadExternaConfiguration());
        modelBuilder.ApplyConfiguration(new DocPndObjetivoConfiguration());

        // Ciclo de vida de Proyectos
        modelBuilder.ApplyConfiguration(new DocProyectoConfiguration());
        modelBuilder.ApplyConfiguration(new DocTrazabilidadProyectoConfiguration());
        modelBuilder.ApplyConfiguration(new DocProyectoCarreraConfiguration());
        modelBuilder.ApplyConfiguration(new DocProyectoParticipanteConfiguration());
        modelBuilder.ApplyConfiguration(new DocObjetivoProyectoConfiguration());
        modelBuilder.ApplyConfiguration(new DocProyectoOdsConfiguration());
        modelBuilder.ApplyConfiguration(new DocImpactoProyectoConfiguration());
        modelBuilder.ApplyConfiguration(new DocCronogramaConfiguration());
        modelBuilder.ApplyConfiguration(new DocBibliografiaProyectoConfiguration());
        modelBuilder.ApplyConfiguration(new DocProyectoMmlConfiguration());
        modelBuilder.ApplyConfiguration(new DocProyectoDocumentoAdjuntoConfiguration());

        // Convocatorias
        modelBuilder.ApplyConfiguration(new DocConvocatoriaConfiguration());

        // Motor de Documentos
        modelBuilder.ApplyConfiguration(new DocumentInstanceConfiguration());
        modelBuilder.ApplyConfiguration(new DocumentTemplateConfiguration());
        modelBuilder.ApplyConfiguration(new DocumentAuditEntryConfiguration());
        modelBuilder.ApplyConfiguration(new DocDocumentoSeccionMetadataConfiguration());

        // Trabajo Colaborativo (Cowork)
        modelBuilder.ApplyConfiguration(new DocCoworkDocumentoConfiguration());
        modelBuilder.ApplyConfiguration(new DocCoworkUpdateConfiguration());
        modelBuilder.ApplyConfiguration(new DocCoworkSesionConfiguration());
        modelBuilder.ApplyConfiguration(new DocCollaborationCommentConfiguration());

        // Calendario
        modelBuilder.ApplyConfiguration(new DocCalendarioEventoNormativoConfiguration());
        modelBuilder.ApplyConfiguration(new DocIcalTokenConfiguration());
        modelBuilder.ApplyConfiguration(new DocCalendarioAlertaEnviadaConfiguration());

        // Grupos de Investigación
        modelBuilder.ApplyConfiguration(new DocGrupoInvestigacionConfiguration());
        modelBuilder.ApplyConfiguration(new DocGrupoMiembroConfiguration());

        // Configuraciones de Workflow
        modelBuilder.ApplyConfiguration(new DocConfigWorkflowConfiguration());

        // Módulos Curriculares Oficiales (Los 4 Documentos ISTPET)
        // 1. PEA
        modelBuilder.ApplyConfiguration(new DocPeaConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaUnidadConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaTemaConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaResultadoAprendizajeConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaActividadPracticaConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaBibliografiaConfiguration());

        // 2. Sílabo (19 Semanas)
        modelBuilder.ApplyConfiguration(new DocSilaboConfiguration());
        modelBuilder.ApplyConfiguration(new DocSilaboSemanaConfiguration());
        modelBuilder.ApplyConfiguration(new DocSilaboAdaptacionConfiguration());

        // 3. Guías APE
        modelBuilder.ApplyConfiguration(new DocGuiaApeConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaApeObjetivoConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaApeRdaConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaApeCriterioConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaApePreparacionConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaApeProcedimientoConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaApeReferenciaConfiguration());

        // 4. Guía de Estudio / Compendio Autónomo
        modelBuilder.ApplyConfiguration(new DocGuiaEstudioConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaEstudioUnidadConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaEstudioTemaConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaEstudioSubtemaConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaEstudioPreguntaGuiaConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaEstudioGlosarioConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaEstudioActividadConfiguration());
        modelBuilder.ApplyConfiguration(new DocGuiaEstudioReferenciaConfiguration());
    }
}
