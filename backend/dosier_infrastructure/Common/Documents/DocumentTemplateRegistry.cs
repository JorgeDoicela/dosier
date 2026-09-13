using Dosier.Domain.Common.Documents;
using System.Collections.Generic;
using System.Linq;
using Dosier.Infrastructure.Common.Documents.Templates.Investigacion;

namespace Dosier.Infrastructure.Common.Documents
{
    /// <summary>
    /// CATÁLOGO MAESTRO DE PLANTILLAS INSTITUCIONALES (DOSIER Registry)
    /// Este archivo actúa como el índice central. El contenido HTML de cada documento
    /// se encuentra en su propia carpeta bajo /Templates/ para máxima organización.
    /// </summary>
    public static class DocumentTemplateRegistry
    {
        public static DocumentTemplate? GetByCode(string code) => 
            GetSeedTemplates().FirstOrDefault(t => t.Code == code);

        public static IEnumerable<DocumentTemplate> GetSeedTemplates()
        {
            // ══════════════════════════════════════════════════════════════
            // ÁREA: DOCUMENTACIÓN Y PORTAFOLIO
            // ══════════════════════════════════════════════════════════════
            // NOTA: El HTML de cada plantilla vive en su archivo .html correspondiente
            // bajo Templates/{Categoria}/{Nombre}.html. El TemplateFileLoader lo carga
            // automáticamente. El htmlContent aquí es solo un placeholder de arranque;
            // en producción el .html copiado al output tiene prioridad.

            // 1. FORMATO PROYECTO DOCUMENTAL
            yield return DocumentTemplate.Create(
                code: ProyectoInvestigacionTemplate.CODE,
                name: "1. Formato Proyecto Documental y Portafolio",
                description: "Documento oficial para postulación de proyectos y portafolios institucionales. Versión de Producción Final v14.0.",
                category: DocumentCategory.Protocolo,
                htmlContent: "<!-- Cargado desde Templates/Investigacion/ProyectoInvestigacion.html -->",
                requiresLopdp: true,
                supportsBlind: true,
                requiresTraceability: true,
                requiresSignature: true,
                collaborativeFields: "[\"programa\", \"grupo_investigacion\", \"dominio\", \"linea_investigacion\", \"sublinea_investigacion\", \"tipo_investigacion\", \"campo_amplio\", \"campo_especifico\", \"campo_detallado\", \"antecedentes\", \"descripcion_proyecto\", \"justificacion\", \"objetivo_general\", \"objetivos_especificos\", \"marco_teorico\", \"metodologia\", \"evaluacion\", \"bibliografia\"]",
                version: 410);

            // ══════════════════════════════════════════════════════════════
            // OTRAS ÁREAS (Registro de marcadores de posición)
            // ══════════════════════════════════════════════════════════════

            yield return DocumentTemplate.Create(
                code: ReporteAnaliticasTemplate.CODE,
                name: "Reporte de Analíticas y Portafolio Documental",
                description: "Reporte directivo con indicadores KPI, cumplimiento CACES y portafolio de proyectos para acreditación institucional.",
                category: DocumentCategory.ReporteAnaliticas,
                htmlContent: "<!-- Cargado desde Templates/Investigacion/ReporteAnaliticas.html -->",
                requiresLopdp: true,
                supportsBlind: false,
                requiresTraceability: true,
                requiresSignature: false,
                version: 20);

            // ══════════════════════════════════════════════════════════════
            // ÁREA: CURRÍCULO ACADÉMICO (PEA OFICIAL)
            // ══════════════════════════════════════════════════════════════
            yield return DocumentTemplate.Create(
                code: "PEA_OFICIAL",
                name: "Programa de Estudio de la Asignatura (PEA)",
                description: "Formato institucional oficial del Programa de Estudio de la Asignatura (PEA) para carreras del ISTPET. Estructura curricular oficial secciones A a K según el Modelo Educativo.",
                category: DocumentCategory.PeaCurricular,
                htmlContent: "<!-- Plantilla oficial de fábrica PEA ISTPET -->",
                requiresLopdp: true,
                supportsBlind: false,
                requiresTraceability: true,
                requiresSignature: true,
                signatureType: "DOSIER",
                collaborativeFields: "[\"objetivo_asignatura\", \"prerrequisitos\", \"rdas_carrera\", \"rdas_asignatura\", \"contenidos_unidades\", \"metodologia_propuesta\", \"recursos_didacticos\", \"actividades_practicas\", \"sistema_evaluacion\", \"bibliografia_basica\", \"bibliografia_consulta\"]",
                version: 1);




            // Nota: Para agregar una nueva plantilla:
            //   1. Crear el .html en Templates/{Categoria}/{NombreArchivo}.html
            //   2. Agregar el CODE al TemplateFileLoader.ResolveFilePath()
            //   3. Registrar aquí con htmlContent vacío
        }

    }
}
