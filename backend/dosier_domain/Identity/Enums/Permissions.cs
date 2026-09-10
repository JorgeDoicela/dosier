namespace dosier_domain.Identity.Enums;

public static class Permissions
{
    // Módulo de Elaboración y Gestión del PEA
    public const string PeaVer = "PEA:VER";
    public const string PeaCrear = "PEA:CREAR";
    public const string PeaEditar = "PEA:EDITAR";
    public const string PeaCowork = "PEA:COWORK";
    public const string PeaObservar = "PEA:OBSERVAR";
    public const string PeaSubsanar = "PEA:SUBSANAR";
    public const string PeaAvalCarrera = "PEA:AVALAR_CARRERA";
    public const string PeaAvalAcademico = "PEA:AVALAR_ACADEMICO";
    public const string PeaAprobar = "PEA:APROBAR";
    public const string PeaExportarPdf = "PEA:EXPORTAR_PDF";

    // Módulo de Gobernanza y Antecedentes Curriculares
    public const string GobernanzaVer = "GOBERNANZA_CURRICULAR:VER";
    public const string GobernanzaGestionar = "GOBERNANZA_CURRICULAR:GESTIONAR";

    // Módulo de Auditoría y Acreditación CACES
    public const string AuditoriaVer = "AUDITORIA_CACES:VER-AUDITORIA";
    public const string AuditoriaReportes = "AUDITORIA_CACES:REPORTES";

    // Módulo de Configuración del Sistema
    public const string ConfiguracionVer = "CONFIGURACION:VER";
    public const string ConfiguracionEditar = "CONFIGURACION:EDITAR";
}
