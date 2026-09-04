namespace dosier_domain.Identity.Enums;

public static class Permissions
{
    // Módulo de Investigación y Proyectos
    public const string CrearProyecto = "PROYECTOS:CREAR";
    public const string PostularProyecto = "PROYECTOS:POSTULAR";
    public const string LiderarEquipo = "PROYECTOS:EDITAR"; // Reutilizamos operaciones base
    public const string RegistrarBitacora = "PROYECTOS:EDITAR";
    
    // Módulo de Seguimiento
    public const string RegistrarProducto = "PROYECTOS:EDITAR";
    
    // Gestión Departamental (Director / Admin)
    public const string CrearConvocatoria = "CONVOCATORIAS:CREAR";
    public const string DecidirProyecto = "PROYECTOS:APROBAR";
    public const string SupervisarGlobal = "CONFIGURACION:VER";
    public const string FirmarDigitalmente = "PROYECTOS:APROBAR";
    public const string GenerarReporteCaces = "CONFIGURACION:REPORTES";
    
    // Administración y TI
    public const string GestionarUsuarios = "USUARIOS:VER";
    public const string ConfigurarPeriodos = "CONFIGURACION:EDITAR";
    public const string GestionarRespaldos = "CONFIGURACION:EDITAR";
}
