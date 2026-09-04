using System;
using System.Collections.Generic;

namespace dosier_application.Curriculum.Dtos
{
    public class GuiaApeDto
    {
        public int IdGuiaApe { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPea { get; set; }
        public int IdAsignatura { get; set; }
        public string NombreAsignatura { get; set; } = string.Empty;
        public int IdCarrera { get; set; }
        public string NombreCarrera { get; set; } = string.Empty;
        public string IdPeriodo { get; set; } = string.Empty;
        public string? IdDocente { get; set; }
        public string? NombreDocente { get; set; }

        public string CodigoFormato { get; set; } = "IT-P03-F05";
        public string VersionFormato { get; set; } = "01";
        public string? FechaRevisionFormato { get; set; }
        public string? VigenciaFormato { get; set; }

        public string? FechaPractica { get; set; }
        public int DuracionHoras { get; set; } = 2;
        public int DuracionSemanas { get; set; } = 1;
        public string? NivelSemestre { get; set; }
        public string? Paralelo { get; set; }
        public int NumeroPractica { get; set; } = 1;
        public string? TallerLaboratorio { get; set; }
        public string TituloPractica { get; set; } = string.Empty;

        public string? FundamentosTeoricos { get; set; }
        public string? InvestigacionAutonoma { get; set; }
        public string? MetodologiaDidactica { get; set; }
        public string? NormasSeguridad { get; set; }
        public string? HabilidadesBlandas { get; set; }
        public string? IndicacionesEntrega { get; set; }

        public string Estado { get; set; } = "Borrador";
        public int Version { get; set; } = 1;
        public bool Activo { get; set; } = true;

        public List<GuiaApeObjetivoDto> Objetivos { get; set; } = new List<GuiaApeObjetivoDto>();
        public List<GuiaApeRdaDto> ResultadosAprendizaje { get; set; } = new List<GuiaApeRdaDto>();
        public List<GuiaApeCriterioDto> CriteriosEvaluacion { get; set; } = new List<GuiaApeCriterioDto>();
        public List<GuiaApePreparacionDto> PreparacionPrevia { get; set; } = new List<GuiaApePreparacionDto>();
        public List<GuiaApeProcedimientoDto> Procedimientos { get; set; } = new List<GuiaApeProcedimientoDto>();
        public List<GuiaApeReferenciaDto> Referencias { get; set; } = new List<GuiaApeReferenciaDto>();
    }

    public class GuiaApeObjetivoDto
    {
        public int IdObjetivo { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaApe { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public int Orden { get; set; }
    }

    public class GuiaApeRdaDto
    {
        public int IdGuiaRda { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaApe { get; set; }
        public int? IdRda { get; set; }
        public string DescripcionRda { get; set; } = string.Empty;
        public int Orden { get; set; }
    }

    public class GuiaApeCriterioDto
    {
        public int IdCriterio { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaApe { get; set; }
        public string CriterioEvaluacion { get; set; } = string.Empty;
        public decimal Puntaje { get; set; } = 2.50m;
        public int Orden { get; set; }
    }

    public class GuiaApePreparacionDto
    {
        public int IdPrep { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaApe { get; set; }
        public string Tipo { get; set; } = "IndicacionPrevia";
        public string Descripcion { get; set; } = string.Empty;
        public string? CaracteristicasCantidad { get; set; }
        public int Orden { get; set; }
    }

    public class GuiaApeProcedimientoDto
    {
        public int IdProcedimiento { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaApe { get; set; }
        public int NumeroParte { get; set; } = 1;
        public string NombreEtapa { get; set; } = string.Empty;
        public string? DescripcionEtapa { get; set; }
        public string? InstruccionesDetalle { get; set; }
        public int Orden { get; set; }
    }

    public class GuiaApeReferenciaDto
    {
        public int IdReferencia { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaApe { get; set; }
        public string CitaApa { get; set; } = string.Empty;
        public int Orden { get; set; }
    }
}
