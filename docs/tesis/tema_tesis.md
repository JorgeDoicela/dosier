# Sistema web para la gestión de documentación institucional docente del ISTPET

## Planteamiento del problema

En el Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET) de Quito, la planificación curricular docente y el diseño de guías prácticas se gestionan tradicionalmente mediante procesadores de texto individuales y carpetas compartidas. Esta manualidad genera serios inconvenientes en el aseguramiento de la calidad académica.

En primer lugar, los docentes de una misma área de conocimiento carecen de una plataforma centralizada que permita la co-redacción y revisión colaborativa en tiempo real del Programa de Estudio de la Asignatura (PEA) y los planes analíticos (sílabos), lo que produce desorganización curricular e inconsistencia en los contenidos transversales.

En segundo lugar, no existen mecanismos automatizados para verificar síncronamente que las horas prácticas declaradas en las guías y los créditos coincidan matemáticamente con las mallas curriculares vigentes para cada período académico.

Finalmente, la elaboración y el renderizado manual de esta documentación en los formatos institucionales oficiales incrementa de forma desmedida la carga administrativa docente y da lugar a discrepancias en el portafolio de evidencias académicas exigidas por el CACES para la acreditación institucional.

## Objetivo general

Desarrollar un sistema web para la gestión de documentación académica docente por períodos en el ISTPET, para la redacción de PEAs y planes analíticos, validando la correspondencia de horas y créditos curriculares, generando una documentación docente acorde a los formatos institucionales oficiales.

## Objetivos específicos

1. Recopilar los requerimientos funcionales e historias de usuario, mediante el análisis de los formatos oficiales y las necesidades operativas de la planta docente del ISTPET en general, para establecer las bases operativas y de diseño del sistema.

2. Desarrollar los módulos lógicos e interfaces del sistema web, mediante la codificación de las funciones de co-redacción, validación curricular y generación de reportes, para obtener una herramienta digital que automatice la creación de la documentación académica por cada período académico.

3. Definir una infraestructura de alojamiento en la nube para configurar el despliegue del sistema en un servidor de AWS, para mantenerlo en un entorno de producción accesible a todos los docentes de la institución.

## Justificación

### 5.1. Justificación Pedagógica y de Diseño Curricular

La planificación curricular en institutos de tercer nivel tecnológico debe asegurar que los campos de aprendizaje (docencia, autónomo y práctico-experimental) estén perfectamente integrados. La coherencia de contenidos entre el PEA (diseño macro), el Plan Analítico (diseño meso) y las Guías APE (ejecución micro) es vital.

Este proyecto justifica su desarrollo al automatizar la correspondencia horaria de la malla curricular, previniendo errores de cálculo en horas y créditos. Además, facilita la integración transversal de materias mediante la co-redacción compartida, asegurando que los contenidos prácticos sigan la secuencia correcta del perfil de egreso.

### 5.2. Justificación de Procesos y Colaboración en Tiempo Real

Uno de los principales cuellos de botella administrativos para los docentes es el diseño y actualización periódica del portafolio académico. Al inicio de cada semestre, la elaboración de PEAs y sílabos requiere coordinación síncrona entre los docentes del área académica.

Este sistema introduce una innovación de procesos al permitir la redacción colaborativa en tiempo real sobre la misma plataforma, con un control de versiones y comentarios integrados. Asimismo, el sistema automatiza la transición por períodos académicos mediante la duplicación controlada y herencia de documentos previamente validados, ahorrando hasta un 80% de esfuerzo manual en cada nuevo ciclo.

### 5.3. Justificación Técnica y de Desarrollo de Software

Desde la perspectiva del desarrollo de software, este proyecto implementa un stack moderno y escalable que responde a las exigencias técnicas de una aplicación interactiva:

- **C# con .NET 8 (Web API) y Clean Architecture:** Garantiza un backend robusto con separación de responsabilidades y aplicación estricta de las reglas de validación de negocio.

- **React con TypeScript:** Permite construir un cliente web modular, interactivo y veloz (Single Page Application) para la manipulación dinámica de la planificación curricular.

- **Comunicación Colaborativa (Sockets):** Uso de conexiones síncronas para la co-redacción simultánea de los programas de estudio, actualizando los campos e información al instante para todos los docentes involucrados.

- **Motor de Plantillas Dinámicas y PDF:** Generación automática y en tiempo real de los reportes oficiales del ISTPET en formato PDF, garantizando que todos los sílabos y guías de prácticas cumplan con la estandarización institucional requerida.

### 5.4. Beneficiarios e Impacto

- **Docentes:** Trabajo cooperativo fluido y veloz en la redacción de sílabos y guías, reduciendo la digitación redundante y generando reportes oficiales al instante.

- **Coordinadores y Evaluadores:** Un canal unificado para revisar, comentar y validar la documentación docente, garantizando que el 100% de la carga horaria y los créditos de la malla curricular estén respaldados de forma exacta.

- **ISTPET:** Velar por la disponibilidad centralizada del portafolio docente digital oficial en tiempo real, garantizando la consistencia absoluta de las evidencias curriculares ante procesos de evaluación institucional y acreditación del CACES.
