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
            GetSeedTemplates().FirstOrDefault(t => t.Code == (code == "PRE_PEA" ? "PEA_OFICIAL" : code));

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
            // ÁREA: CURRÍCULO ACADÉMICO (PEA Y PLAN ANALÍTICO OFICIAL 2026)
            // ══════════════════════════════════════════════════════════════
            // 1. PROGRAMA DE ESTUDIO DE LA ASIGNATURA (PEA)
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

            // 2. FORMATO PLAN ANALÍTICO 2026
            yield return DocumentTemplate.Create(
                code: "PLAN_ANALITICO",
                name: "2. Formato Plan Analítico 2026",
                description: "Formato institucional oficial del Plan Analítico de la Asignatura 2026 para carreras del ISTPET.",
                category: DocumentCategory.PeaCurricular,
                htmlContent: "<!-- Plantilla oficial de fábrica Plan Analítico 2026 ISTPET -->",
                requiresLopdp: true,
                supportsBlind: false,
                requiresTraceability: true,
                requiresSignature: true,
                signatureType: "DOSIER",
                collaborativeFields: "[\"datos_informativos\", \"objetivo_general\", \"resultados_aprendizaje\"]",
                version: 1);

            // 3. FORMATO SEGUIMIENTO DE TUTORÍAS ACADÉMICAS 2026
            yield return DocumentTemplate.Create(
                code: "SEGUIMIENTO_TUTORIAS",
                name: "3. Formato Seguimiento de Tutorías Académicas 2026",
                description: "Formato institucional oficial para el registro, acompañamiento y seguimiento de tutorías académicas del ISTPET.",
                category: DocumentCategory.PeaCurricular,
                htmlContent: "<!-- Plantilla oficial de fábrica Seguimiento de Tutorías Académicas 2026 ISTPET -->",
                requiresLopdp: true,
                supportsBlind: false,
                requiresTraceability: true,
                requiresSignature: true,
                signatureType: "DOSIER",
                collaborativeFields: "[\"cabecera_docente\", \"matriz_tutorias\", \"firmas_responsabilidad\"]",
                version: 1);

            // 4. FORMATO INFORME DE ACOMPAÑAMIENTO ACADÉMICO DE CARRERA 26-26
            yield return DocumentTemplate.Create(
                code: "INFORME_ACOMPANAMIENTO_CARRERA",
                name: "6. Informe de Acompañamiento Académico de Carrera 26-26",
                description: "Formato institucional oficial para el informe de acompañamiento académico de carrera de la Unidad Académica del ISTPET.",
                category: DocumentCategory.PeaCurricular,
                htmlContent: "<!-- Plantilla oficial de fábrica Informe de Acompañamiento Académico de Carrera 26-26 ISTPET -->",
                requiresLopdp: true,
                supportsBlind: false,
                requiresTraceability: true,
                requiresSignature: true,
                signatureType: "DOSIER",
                collaborativeFields: "[\"datos_informativos\", \"nomina_tutores\", \"nomina_docentes_aporte\", \"gestion_academica\", \"conclusiones\", \"firmas_responsabilidad\"]",
                version: 1);




            // Nota: Para agregar una nueva plantilla:
            //   1. Crear el .html en Templates/{Categoria}/{NombreArchivo}.html
            //   2. Agregar el CODE al TemplateFileLoader.ResolveFilePath()
            //   3. Registrar aquí con htmlContent vacío
        }

    }
}
