# DOSIER: Plan de Cierre de Tesis (Alcance PEA 100%)

> **Delimitación de Tesis:** El alcance del proyecto de grado se enfoca exclusivamente en la implementación profunda, rigurosa y completa del **Programa de Estudio de la Asignatura (PEA)**. 
> La arquitectura del sistema queda desacoplada y preparada (mediante `doc_expedientes_curriculares` y el script `04_extension_futura_...`) para que en una versión posterior se incorporen el Sílabo, Guías APE y Guías de Estudio sin modificar el núcleo.

---

## Estado Actual
* **Backend:** 100% completado (entidades, DTOs, validaciones contra SIGAFI, SHA-256 pedagógico, firmas DFRM de 4 roles, auditoría y pruebas unitarias passing).
* **Base de Datos:** 100% normalizada en 4 scripts DDL ordenados (`01` al `04`).

---

## Tareas Pendientes para Culminar el PEA

### 1. Frontend: Integración Visual en el Editor de PEA (`dosier_web`)
Conectar la interfaz de React con los endpoints existentes del backend:
* **Sección c (Prerrequisitos):** Formulario y tabla interactiva de prerrequisitos/correquisitos.
* **Sección d (Aporte al Perfil de Egreso):** Selector para vincular cada RDA con los resultados del perfil de la carrera.
* **Sección i (Evaluación ISTPET):** Matriz oficial de evaluación continua (Docencia, APE, Autónomo, Examen = 10.0 pts).
* **Sección k (Firmas y Estados):** Actualización visual del stepper de aprobación para reflejar los roles institucionales (`Elaborado`, `RevisadoCoord`, `RevisadoAcad`, `AprobadoVicerrector`).

### 2. Generación y Exportación a PDF Oficial del PEA
* Formato idéntico al documento reglamentario del ISTPET.
* Estampado de sellos digitales con código DFRM-XXXX, fecha UTC y hash SHA-256 de inmutabilidad.
* Inserción de código QR dinámico para verificación pública de autenticidad.

---

## Extensibilidad a Futuro (Versión 2 / Fuera de Tesis)
* **Sílabo (Plan Analítico de 19 semanas):** Esquema relacional ya previsto en `04_extension_futura_curriculum_silabo_guias.sql`.
* **Guías APE (Prácticas formato IT-P03-F05):** Mapeado en base de datos.
* **Guías de Estudio / Compendios:** Mapeado en base de datos.

