# Catálogos Institucionales y Normativa Curricular del Ecuador (CES / CACES / SENESCYT)

## 1. Marco Jurídico y Normativo de la Educación Superior Ecuatoriana

La plataforma DOSIER sustenta su motor de gobernanza curricular en el ordenamiento legal vigente para Institutos Superiores Técnicos y Tecnológicos en la República del Ecuador:

1. **Ley Orgánica de Educación Superior (LOES):** Mandato de pertinencia académica, libertad de cátedra responsable y aseguramiento continuo de la calidad de los programas formativos.
2. **Reglamento de Régimen Académico (RRA - Consejo de Educación Superior CES):** Regula la estructura y organización del currículo, la distribución horaria de los componentes de aprendizaje, la definición de créditos académicos y las modalidades de estudio.
3. **Modelo de Evaluación y Acreditación de Institutos Superiores Técnicos y Tecnológicos (CACES):** Define los criterios e indicadores obligatorios para la dimensión de docencia, coherencia curricular, portafolios de asignatura y rigor pedagógico.
4. **Lineamientos SENESCYT:** Normas operativas para la titulación técnica y tecnológica, registro de mallas y perfiles de egreso.

---

## 2. Campos de Formación y Unidades de Organización Curricular

El sistema categoriza cada asignatura de la malla institucional según las directrices establecidas por el Consejo de Educación Superior:

```mermaid
graph TD
    Curriculo["Organización Curricular (CES / RRA)"]

    subgraph Campos ["Campos de Formación"]
        FT["1. Fundamentos Teóricos"]
        PP["2. Praxis Profesional (Talleres y Laboratorios)"]
        EM["3. Epistemología y Metodología de la Investigación"]
        IS["4. Integración de Saberes, Contextos y Cultura"]
        CL["5. Comunicación y Lenguajes"]
    end

    subgraph Unidades ["Unidades de Organización Curricular"]
        UB["Unidad Básica\n(Fundamentos de la carrera)"]
        UP["Unidad Profesional\n(Competencias técnico-tecnológicas específicas)"]
        UIC["Unidad de Integración Curricular\n(Trabajos de titulación y examen complexivo)"]
    end

    Curriculo --> Campos
    Curriculo --> Unidades
```

### Impacto de los Campos de Formación en la Planificación

* **Tipificación Pedagógica:** El campo de formación determina la proporción pedagógica recomendada entre horas de docencia teórica, horas de laboratorio y trabajo autónomo.
* **Coherencia con el Perfil de Egreso:** En la formulación del PEA (Sección D y E), cada resultado de aprendizaje debe responder a las competencias declaradas en el proyecto de carrera aprobado por el CES.

---

## 3. Componentes de Aprendizaje y Validación Matemática de Créditos

Conforme al Reglamento de Régimen Académico del CES, el sistema implementa la regla matemática estricta para la equivalencia de créditos:

$$\text{Total Horas Asignatura} = \text{Horas Docencia (CD)} + \text{Horas APE} + \text{Horas Trabajo Autónomo (TA)}$$

$$\text{Créditos Académicos} = \frac{\text{Total Horas Asignatura}}{48}$$

### 3.1. Desglose de Componentes

| Componente | Siglas | Definición Normativa | Validación en DOSIER |
| :--- | :--- | :--- | :--- |
| **Aprendizaje en Contacto con el Docente** | CD | Actividades sincrónicas o presenciales, conferencias, seminarios y talleres guiados. | Valida que la suma semanal en el PEA coincida exactamente con las horas registradas en `detallemallas.horasdocencia`. |
| **Aprendizaje Práctico-Experimental** | APE | Actividades prácticas en talleres, laboratorios, simulaciones y centros de práctica tecnológica. | Valida que las prácticas declaradas cubran las horas de `detallemallas.horasape`. |
| **Aprendizaje Autónomo** | TA | Horas dedicadas por el estudiante a la lectura, investigación, resolución de ejercicios y proyectos. | Valida que las actividades extra-aula coincidan con `detallemallas.horasautonomas`. |

---

## 4. Estructura de Tablas de Gobernanza Curricular

El script `02_gobernanza_y_antecedentes_curriculares.sql` despliega el repositorio de articulación entre la normativa externa y los antecedentes institucionales:

```mermaid
erDiagram
    doc_normativas ||--o{ doc_normativa_articulos : contiene
    carreras ||--o{ doc_proyectos_curriculares : fundamenta
    doc_modelos_educativos ||--o{ doc_expedientes_curriculares : orienta
    doc_proyectos_curriculares ||--o{ doc_expedientes_curriculares : enmarca
    doc_perfiles_egreso ||--o{ doc_perfil_egreso_resultados : desglosa
    doc_perfil_egreso_resultados ||--o{ doc_asignatura_resultado_perfil : tributa
    doc_expedientes_curriculares ||--o{ doc_pea : consolida

    doc_normativas {
        int idNormativa PK
        string organismoEmisor "CES, CACES, SENESCYT, MINEDUC"
        string tipoNormativa "Reglamento, Resolucion, Guia Metodologica"
        string codigoResolucion
        string titulo
        date fechaVigencia
    }

    doc_modelos_educativos {
        int idModelo PK
        string codigo "MED-ISTPET-2024"
        string nombre
        string version
        string resolucionAprobacion
        date fechaVigenciaDesde
    }

    doc_proyectos_curriculares {
        int idProyectoCurricular PK
        int idCarrera FK
        int idMalla FK
        string codigoResolucionCes
        string nombreProyecto
        string version
    }

    doc_perfiles_egreso {
        int idPerfilEgreso PK
        int idCarrera FK
        int idMalla FK
        string version
        text descripcionGeneral
    }

    doc_perfil_egreso_resultados {
        int idResultadoPerfil PK
        int idPerfilEgreso FK
        string codigo
        text descripcion
        int orden
    }

    doc_asignatura_resultado_perfil {
        int idRelacion PK
        int idAsignatura FK
        int idMalla FK
        int idResultadoPerfil FK
        string nivelAporte "Introductorio, Medio, Avanzado"
    }
```

### 4.1. `doc_normativas` y `doc_normativa_articulos`
Permiten a las comisiones curriculares referenciar legalmente cada sección del PEA y de las mallas. Cuando un evaluador externo del CACES audita una asignatura, el sistema vincula la resolución del CES que habilitó la titulación y el articulado aplicable del RRA.

### 4.2. `doc_modelos_educativos`
Registra la evolución de la filosofía pedagógica del Instituto Superior Tecnológico Mayor Pedro Traversari. Permite asegurar que las estrategias metodológicas seleccionadas en la Sección g) del PEA concuerden con el modelo pedagógico oficial vigente en el período lectivo.

### 4.3. `doc_perfiles_egreso` y `doc_asignatura_resultado_perfil`
Estructura la matriz institucional de tributación curricular. Al formular el PEA, el docente selecciona los Resultados de Aprendizaje de Carrera (RDA) predefinidos institucionalmente y define el nivel de aporte disciplinar (`Introductorio`, `Medio`, `Avanzado`), garantizando coherencia transversal en la titulación.
