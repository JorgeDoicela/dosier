# Guía de Extensibilidad y Creación de Nuevos Bloques Curriculares

## 1. Visión General del Patrón Guiado por Metadatos Curriculares

El sistema de estructuración de documentos de DOSIER opera bajo el patrón de arquitectura guiada por metadatos (*Metadata-Driven Architecture*). Los documentos académicos oficiales (Programa de Estudio de la Asignatura PEA, Sílabos de 19 semanas, Guías APE e Informes de Avance Curricular) se componen a partir de bloques modulares e independientes denominados `DocumentBlock`.

Cada bloque curricular cuenta con:
* Un identificador de tipo único (`BlockType`).
* Una configuración en formato JSON (`config`).
* Un renderizador visual para la vista previa de hoja A4.
* Un componente de captura de datos con soporte de co-redacción concurrente vía `<CoWorkField>`.
* Una plantilla de marcado HTML evaluada por el motor de compilación documental.

---

## 2. Bloques Oficiales del Programa de Estudio de la Asignatura (PEA ISTPET)

El formato oficial del PEA institucional del ISTPET se compone de **11 bloques curriculares atómicos e independientes** (Secciones a hasta k) distribuidos en 3 folios normalizados A4, articulados con saltos de página técnicos (`page_break`):

| Sección | Bloque (`BlockType`) | Título Canónico | Inspector de Propiedades | Renderizador A4 | Variables Scriban / Modelo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **a** | `pea_general_section` | SECCIÓN A: DATOS GENERALES | `PeaGeneralProperties.tsx` | Cabecera institucional ISTPET (Chillogallo) y tabla de 10 campos con desglose CD, APE, TA. | `{{ asignatura.nombre }}`, `{{ periodo.nombre }}`, horas normadas |
| **b** | `pea_objective_section` | SECCIÓN B: OBJETIVO DE LA ASIGNATURA | `PeaObjectiveProperties.tsx` | Recuadro con barra azul y líneas continuas para objetivo formativo con verbo en infinitivo. | `{{ objetivo_asignatura }}` |
| **c** | `pea_prerequisites_section` | SECCIÓN C: PRERREQUISITOS | `PeaPrerequisitesProperties.tsx` | Tabla comparativa oficial: Asignatura \| Observación. | `{{ prerrequisitos }}` |
| **d** | `pea_career_outcomes_section` | SECCIÓN D: RESULTADOS DE CARRERA | `PeaCareerOutcomesProperties.tsx` | Contenedor rayado para aportes al perfil de egreso de la carrera. | `{{ resultados_carrera }}` |
| **e** | `pea_subject_outcomes_section` | SECCIÓN E: RESULTADOS DE ASIGNATURA | `PeaSubjectOutcomesProperties.tsx` | Contenedor rayado para resultados de aprendizaje específicos de la asignatura. | `{{ resultados_asignatura }}` |
| **f** | `pea_contents_section` | SECCIÓN F: CONTENIDOS DE ENSEÑANZA | `PeaContentsProperties.tsx` | Tabla No \| UNIDADES DE ESTUDIO con subcabeceras celestes (`#bdd7ee`) y desglose de horas por unidad. | `{{ unidades }}` con horas CD, APE, TA |
| **g** | `pea_methodology_section` | SECCIÓN G: METODOLOGÍA DE ENSEÑANZA | `PeaMethodologyProperties.tsx` | Bloque dual: Estrategias metodológicas y Recursos didácticos / informatización. | `{{ metodologia.estrategias }}`, `{{ metodologia.recursos }}` |
| **h** | `pea_resources_section` | SECCIÓN H: ACTIVIDADES PRÁCTICAS | `PeaResourcesProperties.tsx` | Tabla institucional: Unidad \| Nombre de la práctica y caracterización de la actividad. | `{{ actividades_practicas }}` |
| **i** | `pea_evaluation_section` | SECCIÓN I: EVALUACIÓN DEL APRENDIZAJE | `PeaEvaluationProperties.tsx` | Matriz oficial con fondo celeste: Parcial 1 (10 pts), Parcial 2 (10 pts), Examen Final (10 pts). | `{{ evaluacion.parcial1 }}`, `{{ evaluacion.parcial2 }}`, `{{ evaluacion.final }}` |
| **j** | `pea_bibliography_section` | SECCIÓN J: BIBLIOGRAFÍA | `PeaBibliographyProperties.tsx` | Esquema estructurado para Bibliografía Básica y Bibliografía de Consulta (Norma APA 7ma). | `{{ bibliografia.basica }}`, `{{ bibliografia.consulta }}` |
| **k** | `pea_signatures_section` | SECCIÓN K: FIRMAS DE RESPONSABILIDAD | `PeaSignaturesProperties.tsx` | Matriz formal de 4 columnas: Docente, Coordinador de Carrera, Coordinador Académico, Vicerrectorado. | `{{ firmas }}` con sellado DFRM / P12 |

### 2.1. Arquitectura de Renderizadores en Lienzo (`canvasRenderers/pea/`)

Para dar cumplimiento estricto a las directrices de modularización (< 700 líneas por archivo) y a la regla innegociable de interactividad en el lienzo, la suite de renderizadores visuales del PEA se estructura en módulos desacoplados bajo `canvasRenderers/pea/`, orquestados mediante el barrel `RenderPeaSections.tsx`:

* **Tipado Estricto (`types.ts`):** Interfaz tipada `PeaBlockConfig` y contrato `PeaBlockProps` sin recurrencia a tipos `any`.
* **Datos Generales (`RenderPeaGeneral.tsx`):** Edición in-situ de textos de cabecera institucional y personalización de las 11 etiquetas de campo.
* **Objetivos y RDAs (`RenderPeaObjectives.tsx`):** Secciones b, d y e con textareas auto-expandibles de redacción directa.
* **Prerrequisitos (`RenderPeaPrerequisites.tsx`):** Celdas interactivas celda a celda con botón `+ Agregar Prerrequisito` y eliminación por fila.
* **Contenidos de Enseñanza (`RenderPeaContents.tsx`):** Matriz de unidades con títulos editables, distribución horaria CD/APE/TA reactiva y textarea de temas.
* **Metodología (`RenderPeaMethodology.tsx`):** Desglose dual para estrategias metodológicas y recursos didácticos.
* **Actividades Prácticas (`RenderPeaResources.tsx`):** Tabla interactiva con inputs por práctica y botón `+ Agregar Actividad Práctica`.
* **Evaluación del Aprendizaje (`RenderPeaEvaluation.tsx`):** Matriz oficial con notas parametrizables, ponderaciones y botón `+ Agregar Componente`.
* **Bibliografía (`RenderPeaBibliography.tsx`):** Entradas auto-expandibles para referencias básicas (APA 7ma) y complementarias.
* **Firmas de Responsabilidad (`RenderPeaSignatures.tsx`):** Edición directa de nombres, cargos y fechas institucionales.
* **Compatibilidad Heredada (`RenderPeaLegacy.tsx`):** Soporte retrocompatible para bloques compuestos anteriores.

---

## 3. Bloques Oficiales del Formato Plan Analítico 2026 (`planAnalitico/`)

Para extender el catálogo documental sin alterar ni colisionar con los bloques del PEA oficial, se introdujo el conjunto de bloques modulares específicos para el **2. Formato Plan Analítico 2026** (`PLAN_ANALITICO`):

| Sección | Bloque (`BlockType`) | Título Canónico | Renderizador Modular | Estructura Oficial |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `plan_analitico_general_section` | 1. DATOS INFORMATIVOS | `RenderPlanAnaliticoGeneral.tsx` | Cabecera superior centrada del documento, título en cursiva azul `#1e40af`, franja institucional azul marino `#1e2a4a` ("Información General") y tabla de 2 columnas clave-valor (10 campos normados). |
| **2** | `plan_analitico_objective_section` | 2. OBJETIVO GENERAL | `RenderPlanAnaliticoObjective.tsx` | Título en cursiva azul `#1e40af` y contenedor colaborativo enriquecido para redacción de la meta formativa de cátedra. |
| **3** | `plan_analitico_outcomes_section` | 3. RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA | `RenderPlanAnaliticoOutcomes.tsx` | Tabla formal con cabecera de doble nivel en azul marino `#1e2a4a` (ID, Al finalizar el curso el/la estudiante estará en capacidad de, Nivel de desarrollo: Inicial/Medio/Alto) con botones in-situ de adición y eliminación. |
| **4** | `plan_analitico_methodology_matrix_section` | 4. METODOLOGÍA, CONTENIDOS, RESULTADOS DE APRENDIZAJE | `RenderPlanAnaliticoMatrix.tsx` | Matriz horizontal extensa para 19 semanas de clase dividida por unidades (1, 2, 3...), con desglose de Organización del Aprendizaje (Docencia, Práctico Experimental, Actividades Autónomas), horas semanales, vinculación con RDAs de la Sección 3 e hitos de evaluación parcial (E.1, E.2) y final (E.3). Soporta expansión multipágina automática en PDF. |
| **5** | `plan_analitico_resources_section` | 5. RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE | `RenderPlanAnaliticoResources.tsx` | Indicador selector interactivo de Adaptación Curricular (*Aplica / No aplica*) y contenedor colaborativo enriquecido para equipamiento, software y plataformas TIC. |
| **6** | `plan_analitico_evaluation_section` | 6. EVALUACIÓN | `RenderPlanAnaliticoEvaluation.tsx` | Matriz oficial con 3 notas ponderadas: Nota Parcial 1 (Actividades Autónomas y Práctico Experimentales), Nota Parcial 2 (Evaluaciones Sumativas de Unidades) y Nota Examen Final sobre 10.00 pts cada una. |
| **7** | `plan_analitico_signatures_section` | 7. FIRMAS DE RESPONSABILIDAD | `RenderPlanAnaliticoSignatures.tsx` | Circuito institucional de 3 firmas (Elaborado: Docente, Revisado: Coordinador de Carrera, Aprobado: Coordinador Académico) con soporte para sellado digital DFRM / P12. |

### 3.1. Aislamiento y Organización en la Paleta de Bloques (`BlockPalette.tsx`)

En la paleta de inserción de bloques, estos componentes se agrupan en una categoría independiente y de fábrica:
* **Bloques Plan Analítico (Formato Oficial 2026):** Permite construir y personalizar la plantilla del Plan Analítico sin mezclar ni alterar los 11 bloques curriculares del PEA ni los bloques estructurales base.

---

## 4. Bloques Oficiales del Formato Seguimiento de Tutorías Académicas 2026 (`tutorias/`)

Para dar soporte normativo al acompañamiento y nivelación académica del estudiante bajo orientación horizontal (**Landscape A4**), se integró el conjunto de bloques de la plantilla `SEGUIMIENTO_TUTORIAS`:

| Sección | Bloque (`BlockType`) | Título Canónico | Renderizador Modular | Estructura Oficial |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `tutorias_header_section` | 1. CABECERA Y DATOS DEL DOCENTE | `RenderTutoriasHeader.tsx` | Logotipo institucional ISTPET a la izquierda, títulos jerárquicos centrados (*INSTITUTO SUPERIOR TECNOLÓGICO MAYOR PEDRO TRAVERSARI*, *SEGUIMIENTO DE TUTORÍAS ACADÉMICAS*, *PERIODO ACADEMICO ABRIL - SEPTIEMBRE 2026*) y ficha estructurada para `DOCENTE:` y `HORARIO DE TUTORÍA:`. |
| **2** | `tutorias_matrix_section` | 2. MATRIZ DE REGISTRO DE TUTORÍAS | `RenderTutoriasMatrix.tsx` | Matriz horizontal de 12 columnas oficiales con cabecera en azul marino `#1e2a4a` (Nº, Fecha, Semana, Nombres y Apellidos Estudiantes Convocados, Nivel, Asignatura, Carrera, Modalidad de Tutoría, Tipos de Tutoría, Razón de Tutoría, Observaciones, Forma de Convocatoria). Incluye edición celda a celda y adición/eliminación de registros dinámicos. |
| **3** | `tutorias_signatures_section` | 3. FIRMAS DE RESPONSABILIDAD | `RenderTutoriasSignatures.tsx` | Circuito institucional de validación al pie con 2 firmas: `DOCENTE:` (izquierda) y `REVISADO: COORDINADOR DE CARRERA` (derecha). |

---

## 5. Bloques Oficiales del Formato Informe de Acompañamiento Académico de Carrera 2026 (`informeAcompanamiento/`)

Para dar soporte normativo al informe semestral y modular de acompañamiento académico de carrera presentado a la Unidad Académica bajo orientación vertical (**Portrait A4**), cada punto del documento oficial se implementa como un bloque modular independiente (`INFORME_ACOMPANAMIENTO_CARRERA`):

| Sección | Bloque (`BlockType`) | Título Canónico | Renderizador Modular | Estructura Oficial |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `informe_acomp_datos_informativos_section` | 1. Datos informativos: | `RenderInformeAcompDatosInformativos.tsx` | Título centrado institucional, lista viñeteada: Nombre del coordinador, Carrera, Periodo académico, Parcial (`Parcial 1/ Modular` en color rojo normativo), Reporta a (`UNIDAD ACADÉMICA`) y Fecha de presentación. |
| **2** | `informe_acomp_nomina_tutores_section` | 2. Nómina de docentes tutores: | `RenderInformeAcompNominaTutores.tsx` | Tabla formal de 4 columnas (Tutor, Nivel, Actividad, Medio de verificación) con bordes negros simples, edición celda a celda y filas dinámicas. |
| **3** | `informe_acomp_nomina_docentes_section` | 3. Nómina de docentes que aportan a la carrera: | `RenderInformeAcompNominaDocentes.tsx` | Tabla formal de 6 columnas (Nómina, Asignaturas, Nivel, Jornada de trabajo, Acciones de mejora [dentro del periodo], Acciones correctivas [final del periodo]) con textareas multilínea y filas dinámicas. |
| **4** | `informe_acomp_gestion_academica_section` | 4. Gestión Académica de la carrera | `RenderInformeAcompGestionAcademica.tsx` | Bloque unificado integral con 5 sub-secciones normadas: 4.1 Reuniones de carrera (clave-valor), 4.2 Actividades realizadas por el coordinador (3 cols), 4.3 Estudiantes (8 cols), 4.4 Gestión docente (11 cols) y 4.5 Observaciones (3 cols), todas con filas y celdas dinámicas. |
| **5** | `informe_acomp_conclusiones_section` | 5. Conclusiones y Recomendaciones | `RenderInformeAcompConclusiones.tsx` | Bloque con banner normativo amarillo (`CONCLUSIÓN Y RECOMENDACIÓN POR CADA UNO DE LOS PUNTOS TRATADOS`) y lista estructurada de conclusiones y recomendaciones por punto tratado. |
| **6** | `informe_acomp_firmas_section` | 6. Firmas de responsabilidad. | `RenderInformeAcompFirmas.tsx` | Doble matriz con cabecera en azul corporativo (`#1e2a4a`): Tabla 1 para Tutores de 1er a 4to nivel y Tabla 2 para Coordinador de Carrera, Bienestar Institucional y Coordinador Académico. |

---

## 6. Diagrama de Flujo de Extensibilidad de Bloques

A continuación se detalla el procedimiento técnico para incorporar un nuevo bloque curricular (por ejemplo, `cur_rubrica_evaluacion_practica`):

### 3.1. Fase 1: Declaración del Tipo en TypeScript
Ubicación: `dosier_web/src/pages/Admin/Templates/types.ts`

Se añade el identificador del bloque a la unión de tipos `BlockType`:

```typescript
export type BlockType = 
    | 'pea_header_institucional'
    | 'pea_datos_generales'
    | 'pea_objetivos_competencias'
    | 'pea_matriz_contenidos'
    | 'pea_metodologia_recursos'
    | 'pea_criterios_evaluacion'
    | 'pea_referencias_bibliograficas'
    | 'pea_circuito_firmas'
    | 'cur_rubrica_evaluacion_practica'; // Nuevo bloque curricular
```

### 3.2. Fase 2: Registro en el Catálogo de Bloques Disponibles
Ubicación: `dosier_web/src/pages/Admin/Templates/utils/availableBlocks.ts`

Se define la configuración inicial, categoría pedagógica, icono de Lucide y metadatos por defecto:

```typescript
{
    type: 'cur_rubrica_evaluacion_practica',
    title: 'RÚBRICA DE EVALUACIÓN PRÁCTICO-EXPERIMENTAL',
    category: 'Evaluación y Acreditación',
    description: 'Matriz de criterios, niveles de desempeño y ponderaciones para prácticas de laboratorio y talleres.',
    icon: 'CheckSquare',
    config: {
        customTitle: 'RÚBRICA DE EVALUACIÓN DE TALLER / LABORATORIO',
        scaleType: 'cuantitativa_10_puntos',
        allowCoWork: true,
        showBorders: true,
        minPassingScore: 7.0
    }
}
```

### 3.3. Fase 3: Renderizador Visual para el Lienzo A4 (Canvas Renderer)
Ubicación: `dosier_web/src/pages/Admin/Templates/components/canvasRenderers/RenderRubricaPractica.tsx`

Se implementa el componente encargado de proyectar la apariencia exacta que tendrá la sección en el diseñador de plantillas, respetando la regla de fondos sólidos sin transparencias:

```tsx
import React from 'react';

interface RenderRubricaPracticaProps {
    config: any;
}

export const RenderRubricaPractica: React.FC<RenderRubricaPracticaProps> = ({ config }) => {
    const c = config || {};
    const title = c.customTitle || 'RÚBRICA DE EVALUACIÓN PRÁCTICO-EXPERIMENTAL';

    return (
        <div className="w-full text-zinc-900 font-sans my-2 bg-white">
            <div className="w-full border border-zinc-900 overflow-hidden rounded-none bg-white p-3 space-y-2">
                <p className="font-bold text-[10pt] uppercase tracking-wider text-center text-zinc-900 bg-zinc-100 py-1 border-b border-zinc-300">
                    {title}
                </p>
                <div className="border border-zinc-300 p-2 text-[8.5pt] bg-white">
                    <p className="text-zinc-600 italic">
                        [Vista previa: Matriz de criterios formativos y ponderación de prácticas APE]
                    </p>
                </div>
            </div>
        </div>
    );
};
```

Luego se registra en la bifurcación principal de `dosier_web/src/pages/Admin/Templates/components/BlockCanvas.tsx`:

```tsx
case 'cur_rubrica_evaluacion_practica':
    return <RenderRubricaPractica config={block.config} />;
```

### 3.4. Fase 4: Componente de Formulario con Co-Redacción Concurrente
Ubicación: `dosier_web/src/components/DOSIER/sections/RubricaPracticaSection.tsx`

Se construye la interfaz interactiva donde los docentes de la asignatura definen los criterios. Para campos de texto colaborativo, se integra el componente `<CoWorkField>`:

```tsx
import React from 'react';
import { CoWorkField } from '../CoWorkField';

export const RubricaPracticaSection: React.FC<{ peaId: string; readOnly: boolean }> = ({ peaId, readOnly }) => {
    return (
        <div className="space-y-4 p-4 bg-white border border-zinc-200">
            <h3 className="font-semibold text-zinc-900 text-sm">Criterios de Evaluación Práctica</h3>
            <CoWorkField
                documentId={peaId}
                fieldKey="rubrica_practica_criterios"
                label="Descripción de Criterios y Niveles de Desempeño"
                readOnly={readOnly}
            />
        </div>
    );
};
```

### 3.5. Fase 5: Registro del Proveedor de Bloque en el Motor Documental
Ubicación: `backend/dosier_infrastructure/Common/Documents/DocumentTemplateRegistry.cs` y ensambladores de bloque (`IDocumentBlockProvider`).

Se implementa el ensamblador del bloque para que `DocumentDataOrchestrator` inyecte la sección en el marcado HTML compilado por iText 9:

```csharp
public class RubricaPracticaBlockProvider : IDocumentBlockProvider
{
    public string BlockType => "cur_rubrica_evaluacion_practica";

    public async Task<string> RenderHtmlAsync(DocumentBlock block, DocumentContext context)
    {
        return $"<section class=\"pea-section rubrica-practica\">" +
               $"<div class=\"section-header\">{block.Config?.CustomTitle}</div>" +
               $"<div class=\"section-content\">{block.ContentHtml}</div>" +
               $"</section>";
    }
}
```
