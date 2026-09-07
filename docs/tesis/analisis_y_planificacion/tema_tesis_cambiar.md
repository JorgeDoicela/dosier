# Título o tema

**Sistema web para la gestión del ciclo de vida de la documentación curricular docente en instituciones de educación superior**

## Planteamiento del problema

- En los institutos de educación superior, la elaboración de la documentación curricular docente exige articular las disposiciones emitidas por los organismos nacionales competentes —que deben registrarse sin ser modificadas— con los instrumentos propios de la institución, la oferta académica vigente y la información registrada en los sistemas de gestión académica. El uso de archivos individuales y carpetas compartidas dificulta identificar qué normativa y versión institucional sustentaron cada documento.

- Aunque los sistemas de gestión académica contienen datos oficiales sobre períodos, carreras, mallas, asignaturas, carga horaria y asignaciones docentes, no están integrados con un flujo que controle la elaboración, revisión, aprobación, firma y conservación histórica del Programa de Estudio de la Asignatura (PEA). Esto genera digitación repetida, riesgo de inconsistencias con la malla vigente y limitada capacidad de demostrar el cumplimiento de los requisitos curriculares.

- El problema central es la ausencia de una plataforma que organice las fuentes externas como referencia de consulta interna, permita a la institución aplicarlas según su oferta académica e integre el ciclo completo del PEA con los datos institucionales existentes.

## Objetivo general

Desarrollar un sistema web para gestionar el ciclo de vida de la documentación curricular docente, mediante el registro inalterable y versionado de fuentes externas como referencia, su vinculación con los instrumentos institucionales y la integración de solo lectura con el sistema de gestión académica, implementando de forma completa la elaboración, revisión, aprobación y emisión del Programa de Estudio de la Asignatura.

## Objetivos específicos

1. **Analizar** las disposiciones externas, los instrumentos curriculares institucionales, los formatos oficiales y el proceso actual de elaboración del PEA, mediante revisión documental y levantamiento de requerimientos con los actores académicos, para definir las reglas, responsables y datos que deberá gestionar el sistema.

2. **Diseñar** una arquitectura web integrada con el sistema de gestión académica que organice fuentes normativas como referencia interna, instrumentos institucionales, expedientes curriculares, versiones, validaciones y flujos de aprobación, de manera que el PEA se implemente como primer caso completo y la solución pueda extenderse posteriormente al sílabo, las guías de actividades práctico-experimentales y las guías de estudio.

3. **Implementar y evaluar** el flujo completo del PEA mediante coedición en tiempo real, validación de horas y créditos contra la malla vigente, control de revisiones, comentarios, aprobaciones, firmas y generación del documento oficial, para verificar la consistencia de la información curricular y la integridad de los documentos emitidos.

## Justificación

### 5.1. Justificación institucional y curricular

Las disposiciones de los organismos nacionales de educación superior constituyen fuentes oficiales que la institución debe conservar sin alterar y aplicar mediante sus propios instrumentos. DOSIER registra esas fuentes como referencia de consulta interna durante la elaboración de los documentos; no tramita procesos ante los organismos externos ni requiere su participación directa en el flujo.

Para demostrar la cadena curricular, el sistema vincula la normativa vigente con el modelo educativo institucional, el proyecto de carrera, el perfil de egreso, la malla curricular y, finalmente, los documentos microcurriculares. En esta cadena, el PEA concreta para una asignatura sus objetivos, resultados de aprendizaje, unidades, contenidos, metodologías y distribución horaria.

El sistema integrará en modo de solo lectura los datos oficiales del sistema de gestión académica —carreras, mallas aplicables por período y nivel, asignaturas, horas, créditos y asignaciones docentes— de manera que el PEA se origine desde la asignación real, sin que el docente deba ingresar datos ya registrados institucionalmente.

### 5.2. Justificación de procesos y colaboración en tiempo real

La elaboración del PEA involucra a docentes, coordinadores y autoridades, por lo que no debe depender de copias independientes. La coedición en tiempo real permitirá trabajar sobre una misma revisión; los comentarios, estados y responsables mostrarán el avance del proceso.

El versionado conservará las revisiones formales; la herencia entre períodos reducirá la digitación sin arrastrar datos modificados. Cada transición de estado registrará su autor, cargo, fecha y justificación, generando un historial inalterable del proceso de aprobación.

### 5.3. Justificación técnica y de desarrollo de software

La solución combina componentes especializados con un dominio curricular integrado:

- **C# con .NET 8 y arquitectura por capas:** centraliza las reglas de negocio, autorización, validaciones curriculares y el flujo de aprobación.

- **React con TypeScript:** proporciona interfaces modulares para consulta, elaboración y revisión de los expedientes curriculares.

- **SignalR y Yjs:** permiten la coedición concurrente, la sincronización de cambios y la recuperación del contenido colaborativo.

- **Integración con sistema académico y motor documental:** consume en modo de solo lectura los datos académicos oficiales y genera versiones, snapshots, PDF con firma, hash de integridad y códigos de verificación sin duplicar ni modificar la fuente institucional.

### 5.4. Beneficiarios e impacto

- **Docentes:** dispondrán de datos oficiales precargados, referencias curriculares vigentes y un espacio colaborativo para elaborar el PEA sin mantener copias divergentes.

- **Coordinadores y autoridades académicas:** podrán revisar, comentar, devolver, aprobar y firmar cada revisión con evidencia de las validaciones y antecedentes utilizados.

- **La institución:** contará con expedientes curriculares centralizados y verificables, preparados para incorporar el sílabo, las guías de actividades práctico-experimentales y las guías de estudio bajo el mismo modelo de gestión documental.
