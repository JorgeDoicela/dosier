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
| **e** | `pea_subject_outcomes_section` | SECCIÓN E: RESULTADOS DE ASIGNATURA | `PeaSubjectOutcomesProperties.tsx` | Contenedor rayado para resultados de aprendizaje específicos de la cátedra. | `{{ resultados_asignatura }}` |
| **f** | `pea_contents_section` | SECCIÓN F: CONTENIDOS DE ENSEÑANZA | `PeaContentsProperties.tsx` | Tabla No \| UNIDADES DE ESTUDIO con subcabeceras celestes (`#bdd7ee`) y desglose de horas por unidad. | `{{ unidades }}` con horas CD, APE, TA |
| **g** | `pea_methodology_section` | SECCIÓN G: METODOLOGÍA DE ENSEÑANZA | `PeaMethodologyProperties.tsx` | Bloque dual: Estrategias metodológicas y Recursos didácticos / informatización. | `{{ metodologia.estrategias }}`, `{{ metodologia.recursos }}` |
| **h** | `pea_resources_section` | SECCIÓN H: ACTIVIDADES PRÁCTICAS | `PeaResourcesProperties.tsx` | Tabla institucional: Unidad \| Nombre de la práctica y caracterización de la actividad. | `{{ actividades_practicas }}` |
| **i** | `pea_evaluation_section` | SECCIÓN I: EVALUACIÓN DEL APRENDIZAJE | `PeaEvaluationProperties.tsx` | Matriz oficial con fondo celeste: Parcial 1 (10 pts), Parcial 2 (10 pts), Examen Final (10 pts). | `{{ evaluacion.parcial1 }}`, `{{ evaluacion.parcial2 }}`, `{{ evaluacion.final }}` |
| **j** | `pea_bibliography_section` | SECCIÓN J: BIBLIOGRAFÍA | `PeaBibliographyProperties.tsx` | Esquema estructurado para Bibliografía Básica y Bibliografía de Consulta (Norma APA 7ma). | `{{ bibliografia.basica }}`, `{{ bibliografia.consulta }}` |
| **k** | `pea_signatures_section` | SECCIÓN K: FIRMAS DE RESPONSABILIDAD | `PeaSignaturesProperties.tsx` | Matriz formal de 4 columnas: Docente, Coordinador de Carrera, Coordinador Académico, Vicerrectorado. | `{{ firmas }}` con sellado DFRM / P12 |

---

## 3. Diagrama de Flujo de Extensibilidad de Bloques

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

Se construye la interfaz interactiva donde los docentes de cátedra definen los criterios. Para campos de texto colaborativo, se integra el componente `<CoWorkField>`:

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
