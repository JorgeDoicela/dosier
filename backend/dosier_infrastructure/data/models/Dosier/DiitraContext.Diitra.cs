using Microsoft.EntityFrameworkCore;
using dosier_infrastructure.data.models.Configurations;

namespace dosier_infrastructure.data.models;

public partial class DosierContext
{
    partial void OnModelCreatingDosier(ModelBuilder modelBuilder)
    {
        // Ciclo de vida de Proyectos
        modelBuilder.ApplyConfiguration(new DocProyectoConfiguration());
        modelBuilder.ApplyConfiguration(new DocTrazabilidadProyectoConfiguration());
        modelBuilder.ApplyConfiguration(new DocProyectoCarreraConfiguration());
        modelBuilder.ApplyConfiguration(new DocProyectoParticipanteConfiguration());
        modelBuilder.ApplyConfiguration(new DocObjetivoProyectoConfiguration());
        modelBuilder.ApplyConfiguration(new DocCronogramaConfiguration());
        modelBuilder.ApplyConfiguration(new DocBibliografiaProyectoConfiguration());

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

        // Configuraciones de Workflow
        modelBuilder.ApplyConfiguration(new DocConfigWorkflowConfiguration());

        // Gobernanza Curricular y Antecedentes Institucionales
        modelBuilder.ApplyConfiguration(new DocNormativaConfiguration());
        modelBuilder.ApplyConfiguration(new DocNormativaArticuloConfiguration());
        modelBuilder.ApplyConfiguration(new DocModeloEducativoConfiguration());
        modelBuilder.ApplyConfiguration(new DocProyectoCurricularConfiguration());
        modelBuilder.ApplyConfiguration(new DocPerfilEgresoConfiguration());
        modelBuilder.ApplyConfiguration(new DocPerfilEgresoResultadoConfiguration());
        modelBuilder.ApplyConfiguration(new DocAsignaturaResultadoPerfilConfiguration());
        modelBuilder.ApplyConfiguration(new DocExpedienteCurricularConfiguration());
        modelBuilder.ApplyConfiguration(new DocExpedienteAsignacionConfiguration());

        // Módulos Curriculares Oficiales (Los 4 Documentos ISTPET)
        // 1. PEA
        modelBuilder.ApplyConfiguration(new DocPeaConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaUnidadConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaTemaConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaResultadoAprendizajeConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaActividadPracticaConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaBibliografiaConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaObservacionConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaTrazabilidadConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaPrerequisitoConfiguration());
        modelBuilder.ApplyConfiguration(new DocPeaEvaluacionConfiguration());
    }
}
