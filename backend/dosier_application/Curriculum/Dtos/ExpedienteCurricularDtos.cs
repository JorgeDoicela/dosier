using System;
using System.Collections.Generic;

namespace dosier_application.Curriculum.Dtos
{
    // =========================================================================
    // DTOs DE NORMATIVAS Y ANTECEDENTES REGULATORIOS (CES / CACES)
    // =========================================================================

    public class NormativaDto
    {
        public int IdNormativa { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public string OrganismoEmisor { get; set; } = "CACES";
        public string TipoNormativa { get; set; } = "Reglamento";
        public string CodigoResolucion { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public DateTime? FechaEmision { get; set; }
        public DateTime? FechaVigencia { get; set; }
        public string? ArchivoUrl { get; set; }
        public bool Activo { get; set; } = true;
        public List<NormativaArticuloDto> Articulos { get; set; } = new List<NormativaArticuloDto>();
    }

    public class NormativaArticuloDto
    {
        public int IdArticulo { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdNormativa { get; set; }
        public string CodigoResolucion { get; set; } = string.Empty;
        public string OrganismoEmisor { get; set; } = string.Empty;
        public string NumeroArticulo { get; set; } = string.Empty;
        public string? Titulo { get; set; }
        public string Contenido { get; set; } = string.Empty;
        public string? RequisitoCurricular { get; set; }
        public int Orden { get; set; }
    }

    public class ModeloEducativoDto
    {
        public int IdModelo { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Version { get; set; } = "1.0";
        public string? ResolucionAprobacion { get; set; }
        public string? Descripcion { get; set; }
        public DateTime FechaVigenciaDesde { get; set; }
        public DateTime? FechaVigenciaHasta { get; set; }
        public string? ArchivoUrl { get; set; }
        public bool Activo { get; set; } = true;
    }

    // =========================================================================
    // DTOs DE PROYECTO CES, PERFILES DE EGRESO Y TRIBUTACIÓN
    // =========================================================================

    public class ProyectoCurricularDto
    {
        public int IdProyectoCurricular { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdCarrera { get; set; }
        public string? NombreCarrera { get; set; }
        public int IdMalla { get; set; }
        public string? CodigoResolucionCes { get; set; }
        public string NombreProyecto { get; set; } = string.Empty;
        public string Version { get; set; } = "1.0";
        public DateTime? FechaAprobacion { get; set; }
        public bool Activo { get; set; } = true;
    }

    public class PerfilEgresoDto
    {
        public int IdPerfilEgreso { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdCarrera { get; set; }
        public string? NombreCarrera { get; set; }
        public int IdMalla { get; set; }
        public string Version { get; set; } = "1.0";
        public string DescripcionGeneral { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
        public List<PerfilEgresoResultadoDto> Resultados { get; set; } = new List<PerfilEgresoResultadoDto>();
    }

    public class PerfilEgresoResultadoDto
    {
        public int IdResultadoPerfil { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPerfilEgreso { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public int Orden { get; set; }
        public string? NivelAporteAsignatura { get; set; } // Si se consulta en el contexto de una asignatura
    }

    public class AsignaturaResultadoPerfilDto
    {
        public int IdRelacion { get; set; }
        public int IdAsignatura { get; set; }
        public string? NombreAsignatura { get; set; }
        public int IdMalla { get; set; }
        public int IdResultadoPerfil { get; set; }
        public string CodigoRdaPerfil { get; set; } = string.Empty;
        public string DescripcionRdaPerfil { get; set; } = string.Empty;
        public string NivelAporte { get; set; } = "Medio"; // Introductorio | Medio | Avanzado
    }

    // =========================================================================
    // DTOs DEL EXPEDIENTE CURRICULAR INSTITUCIONAL
    // =========================================================================

    public class ExpedienteCurricularDto
    {
        public int IdExpediente { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public string? CodigoExpediente { get; set; }
        public int? IdAsignacion { get; set; }
        public string IdPeriodo { get; set; } = string.Empty;
        public int IdCarrera { get; set; }
        public string NombreCarrera { get; set; } = string.Empty;
        public int? IdMalla { get; set; }
        public int? IdDetalleMalla { get; set; }
        public int IdAsignatura { get; set; }
        public string NombreAsignatura { get; set; } = string.Empty;
        public string? CodigoAsignatura { get; set; }
        public int? IdNivel { get; set; }
        public int? IdModalidad { get; set; }
        public int? IdSeccion { get; set; }
        public string? Paralelo { get; set; }
        public string? IdDocenteResponsable { get; set; }
        public string? NombreDocenteResponsable { get; set; }
        public int? IdProyectoCurricular { get; set; }
        public string? ResolucionCesCarrera { get; set; }
        public int? IdPerfilEgreso { get; set; }
        public int? IdModeloEducativo { get; set; }
        public string? NombreModeloEducativo { get; set; }
        public string EstadoGeneral { get; set; } = "Abierto"; // Abierto, EnRevision, Aprobado, Cerrado
        public DateTime FechaApertura { get; set; }
        public DateTime? FechaCierre { get; set; }
        public bool Activo { get; set; } = true;

        // Vínculo con el PEA
        public int? IdPea { get; set; }
        public string? EstadoPea { get; set; }
        public int? VersionPea { get; set; }
    }

    public class ExpedienteCurricularDetalleDto : ExpedienteCurricularDto
    {
        public ProyectoCurricularDto? ProyectoCurricular { get; set; }
        public PerfilEgresoDto? PerfilEgreso { get; set; }
        public ModeloEducativoDto? ModeloEducativo { get; set; }
        public List<NormativaArticuloDto> ChecklistNormativo { get; set; } = new List<NormativaArticuloDto>();
        public List<AsignaturaResultadoPerfilDto> TributacionPerfil { get; set; } = new List<AsignaturaResultadoPerfilDto>();
        public PeaDto? Pea { get; set; }
    }
}
