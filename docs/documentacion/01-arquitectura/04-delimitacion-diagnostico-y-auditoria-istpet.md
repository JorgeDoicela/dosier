# Diagnóstico Institucional SIGAFI, Auditoría Técnica y Delimitación de Tesis

## 1. Contexto Institucional y Delimitación Académica

Este documento formaliza el diagnóstico técnico de la infraestructura académica del **Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET)**, la auditoría del sistema curricular y la delimitación de alcance de la memoria de titulación para la carrera de **Tecnología Superior en Desarrollo de Software**:

* **Tema de Titulación:** Sistema web de gestión curricular para el Programa de Estudio de la Asignatura del Instituto Superior Tecnológico Mayor Pedro Traversari.
* **Autor:** Jorge Ismael Doicela Molina.
* **Tutor:** Tnldgo. Carlos Enrique Valencia Llerena.
* **Marco de Aplicación:** Carrera de Desarrollo de Software, Coordinaciones de Carrera y Aseguramiento de la Calidad (CACES 2026).

---

## 2. Diagnóstico Técnico de la Base de Datos Institucional (`sigafi_es`)

La base de datos institucional `sigafi_es` contiene más de 200 tablas que gobiernan la operación académica y administrativa del ISTPET. La integración con DOSIER se sustenta en una **frontera estricta de solo lectura**:

> [!IMPORTANT]
> **Frontera SIGAFI Inviolable:**
> SIGAFI administra la oferta académica operativa: carreras, períodos, mallas por cohorte, niveles y distributivo docente. DOSIER consume estos datos en modo de solo lectura (`AsNoTracking()`) y gestiona exclusivamente el ciclo de gobernanza curricular y producción documental con sus propias tablas (`doc_*`) y permisos (`rbac_*` con `idSistema = 6`). Queda estrictamente prohibido alterar o sobreescribir las tablas maestras de SIGAFI.

### 2.1. Inventario y Capacidad de Tablas Clave
1. **`detallemallas`:**
   * Contiene **1.086 registros curriculares** activos.
   * El 100% cuenta con horas totales oficiales, horas de docencia y créditos académicos.
   * Las horas de trabajo autónomo se calculan matemáticamente:  
     $$\text{Horas Autónomas} = \text{Horas Totales} - (\text{Horas Docencia} + \text{Horas APE})$$
2. **`asignacion_materias` / `asignaciones_profesores`:**
   * Más de **23.000 registros históricos** que definen de forma unívoca quién debe elaborar cada PEA, para qué asignatura, carrera, paralelo y período académico.
3. **`mallas_periodos` (Piedra angular de resolución curricular):**
   * Vincula formalmente: $\text{Período} + \text{Nivel} \longrightarrow \text{Malla Aplicable}$.
   * Permite al servicio `AcademicContextResolver` identificar la malla exacta de cada cohorte durante transiciones curriculares institucionales (por ejemplo, niveles superiores bajo malla 2020 y niveles iniciales bajo rediseño 2023).
4. **`carreras` (`esInstituto = 1`):**
   * Filtro indispensable para aislar la oferta de educación superior tecnológica del ISTPET de las actividades de capacitación continua o escuela de conducción.

---

## 3. Matriz de Hallazgos Técnicos y Resoluciones de Auditoría

En la auditoría técnica exhaustiva del sistema se identificaron y subsanaron los siguientes puntos críticos:

| Código | Hallazgo Técnico Identificado | Causa Raíz | Solución Definitiva Implementada |
| :--- | :--- | :--- | :--- |
| **A01** | Columnas sombra en Entity Framework | Relaciones implícitas no configuradas en Fluent API. | Configuración explícita de claves foráneas con `HasForeignKey` en `DosierContext` sobre columnas existentes (`IdPea`, `IdUnidad`, `IdRda`). |
| **A02** | Incompatibilidad de estados de workflow | `RevisadoCoord` no constaba en el ENUM original. | Unificación formal del catálogo de 5 estados (`Borrador`, `EnRevision`, `RevisadoCoord`, `RevisadoAcad`, `Aprobado`) en base de datos, DTOs y frontend. |
| **A03** | Identidad de usuario vs. referencia externa | Uso cruzado de cédula e identificador de usuario interno. | Uso estricto de `id_usuario` interno para la firma y auditoría, preservando la referencia externa para resolver datos del profesor. |
| **A04** | Autorización en operaciones curriculares | Verificación superficial de roles en endpoints. | Implementación de evaluadores de pertenencia al expediente (`IPermissionService` y `canSignPea`) verificando rol y distributivo real. |
| **A05** | Cálculo canónico de Hash SHA-256 | El hash previo solo evaluaba cantidades de unidades. | Implementación de `SignatureHashService` con serialización canónica completa (objetivos, unidades, temas, prácticas, evaluaciones y bibliografía). |
| **A06** | Separación entre Firma P12 y HMAC | Ambigüedad en el tipo de firma registrado. | Desacople en `FirmaElectronicaService`: soporte de certificados PKCS#12 (.p12 / FirmaEC) con BouncyCastle y sellos institucionales HMAC-SHA256 bajo Ley 67. |
| **A07** | Inmutabilidad de documentos aprobados | Riesgo de edición de documentos en fases colegiadas. | *State Locking Guard* en frontend y bloqueo transaccional en backend: prohibición estricta de mutación una vez alcanzado el estado `Aprobado`. |
| **A08** | Balance de horas y créditos (CES RRA) | Omisión de validación horaria en guardado. | *CurricularValidationEngine*: bloqueo matemático automático si $\sum \text{Horas}$ difiere de las horas normadas en `detallemallas` (48 horas por crédito). |
| **A09** | Fuga de oferta no tecnológica en catálogos | `CatalogsController.GetCarreras` retornaba todas las carreras de la tabla sin discriminar el tipo de entidad educativa. | Inclusión del predicado `.Where(c => c.EsInstituto == 1)` alineándolo con la regla cardinal de gobernanza SIGAFI. |

---

## 4. Certificación Técnica del Sistema DOSIER

| Componente | Métrica / Estándar Verificado | Resultado de Auditoría | Estado |
| :--- | :--- | :--- | :--- |
| **Backend Suite (`dosier_tests`)** | 111 Pruebas unitarias e integración (.NET 8) | 111 aprobadas, 0 omitidas, 0 fallos (18s) | Certificado |
| **Compilación Backend (`dosier.sln`)** | Compilación limpia de los 5 proyectos .NET | 0 errores, 0 advertencias | Certificado |
| **Frontend Web (`dosier_web`)** | Empaquetado de producción (`npm run build`) | Bundle generado exitosamente en 48.5s | Certificado |
| **TypeScript estricto** | Chequeo estático de tipos (`tsc --noEmit`) | 0 errores de tipado en 100% de vistas y modales | Certificado |
| **Controladores API (`dosier_api`)** | Auditoría integral de los 23 controladores | Endpoints mapeados, autorización RBAC y claims | Certificado |
| **Frontera de Datos (`sigafi_es`)** | Acceso a tablas nativas (`esInstituto = 1`) | Modo solo lectura (`AsNoTracking()`), 0 mutaciones | Certificado |
| **Regla de Fondos Sólidos** | Sistema Geist Editorial / Enterprise Docs | Fondos 100% sólidos, cero transparencias ni sangrado | Certificado |
| **Estándar Iconográfico** | Prohibición absoluta de emojis | Empleo exclusivo de vectores técnicos Lucide React | Certificado |

---

## 5. Delimitación del Alcance de la Tesis de Grado

Para garantizar un producto de software robusto, auditable y de calidad de producción, el alcance oficial de la tesis de grado se delimita taxativamente en:

1. **Ciclo de Vida Completo del PEA:**
   * Formulación asistida y normalizada de las **11 secciones reglamentarias (a - k)** del Programa de Estudio de la Asignatura.
   * Co-redacción concurrente multi-docente en tiempo real mediante CRDT Yjs sobre WebSockets SignalR.
   * Circuito colegiado de 4 revisiones y firmas con control de observaciones y subsanaciones por sección.
   * Compilación documental en PDF vectorial oficial con membrete del ISTPET, hash SHA-256 canónico y código QR público sin login.
2. **Plataforma Web Institucional:**
   * Aplicación Web SPA (`dosier_web`) en React 18, Vite, TypeScript y Geist Editorial System con regla cardinal de **fondos 100% sólidos sin transparencias**.
   * Web API REST (`dosier_api`) en ASP.NET Core 8 con Clean Architecture y MySQL (`sigafi_es`).
3. **Reserva para Extensiones Futuras:**
   * Los módulos de Sílabos Analíticos de 19 semanas y Guías de Prácticas APE quedan respaldados por el script DDL de extensión `05_extension_futura_curriculum_silabo_guias.sql` como segunda etapa post-titulación.
