Hemos completado al 100% el saneamiento técnico, normativo y criptográfico del PEA (Fases 1 a 5 de la auditoría: estados de 4 roles, SHA-256 pedagógico, DTOs/entidades de Prerrequisitos y Evaluación, vínculo con Perfil de Egreso, inmutabilidad y eliminación de llaves sombra en EF Core).

Para tener el sistema DOSIER completamente alineado con la auditoría y los estándares del ISTPET, los siguientes módulos y tareas son los que faltan:

1. Frontend: Integración Visual en el Editor de PEA (dosier_web)
Qué falta: Aunque el backend (PeaController / PeaService) y el cliente TypeScript (peaService.ts) ya tienen los modelos listos, las vistas/componentes del editor de PEA en React aún no exponen:
El formulario/tabla de Prerrequisitos y Correquisitos (Asignatura, Código, Tipo).
La matriz de Criterios de Evaluación oficiales del ISTPET (Docencia, Prácticas APE, Trabajo Autónomo, Examen = 100%).
El selector de vinculación de cada RDA con el Perfil de Egreso de la carrera.
La actualización visual del flujo de firmas para reflejar los nuevos estados (RevisadoCoord y RevisadoAcad).
2. Los otros 3 Instrumentos Curriculares del ISTPET
Instrumento	Estado Actual	Qué falta auditar / implementar
Sílabo (Plan Analítico)	Estructura base en BD	Regla estricta de 19 semanas académicas con hitos de evaluación obligatorios: Semana 9 (Parcial 1), Semana 18 (Parcial 2) y Semana 19 (Recuperación/Gracia). Validar coherencia con los temas del PEA.
Guías APE (Prácticas)	Modelo DocGuiaApe	Estructura oficial formato IT-P03-F05 (objetivos de la práctica, equipos/reactivos, instrucciones metodológicas, rúbrica de evaluación y horas prácticas).
Guías de Estudio / Compendios	Modelo DocGuiaEstudio	Formato modular de trabajo autónomo (lecturas obligatorias, actividades de autoaprendizaje, control de avance).
3. Generación y Exportación a PDF Oficial
Qué falta: Servicio de renderizado y exportación de PEA y Sílabos en PDF:
Encabezado y pie de página institucional reglamentario del ISTPET.
Estampado de sellos digitales con código DFRM-XXXX, fecha UTC y hash SHA-256.
Generación de código QR para verificación pública de autenticidad.
4. Ejecución en MySQL Local de Desarrollo
Qué falta: Cuando decidas aplicar los cambios en tu MySQL local (sigafi_es), ejecutar el script que creamos:


05_pea_complementos_formato_istpet.sql
 (creación de doc_pea_prerrequisitos, doc_pea_evaluaciones y columna id_resultado_perfil).
¿Cuál de estos pasos abordamos a continuación?
Frontend del PEA: Integrar los componentes visuales de Prerrequisitos, Evaluación y vinculación de RDA en dosier_web.
Sílabo (19 semanas): Auditar e implementar la lógica de negocio del Sílabo y sus 19 semanas con hitos evaluativos.
Guías APE / Guías de Estudio: Estructurar los formatos oficiales de prácticas y compendios autónomos.
