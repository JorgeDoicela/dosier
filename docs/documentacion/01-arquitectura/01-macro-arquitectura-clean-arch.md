# Macro-Arquitectura del Sistema y Clean Architecture

## 1. Resumen Ejecutivo y Alcance del Sistema

**DOSIER** (*Sistema Web para la Gestión de Documentación Curricular Docente del ISTPET*) es la plataforma tecnológica institucional encargada de gestionar el ciclo de vida, co-redacción y validación de la planificación curricular docente en el Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET) de Quito, Ecuador.

El sistema resuelve la problemática de la dispersión documental y la desconexión operativa entre las disposiciones de los organismos reguladores (CES, CACES, SENESCYT), la planificación académica registrada en SIGAFI y los entregables microcurriculares docentes:
1. **Programa de Estudio de la Asignatura (PEA):** Formato oficial institucional normalizado en sus **11 secciones reglamentarias (a - k)**, implementado de extremo a extremo en la tesis de grado.
2. **Plan Analítico o Sílabo (19 Semanas):** Matriz semanal articulada por unidades, estrategias y evaluaciones.
3. **Guías de Aprendizaje Práctico-Experimental (Guías APE):** Planificación detallada de prácticas de laboratorio y talleres.
4. **Guías de Estudio Institucional:** Compendio teórico, glosarios y cuestionarios de autoevaluación autónoma.

El sistema está diseñado bajo estrictos criterios de integridad matemática (correspondencia de horas de docencia, práctico-experimental y autónomo vs. `detallemallas` de SIGAFI), inmutabilidad forense (SHA-256), trazabilidad, firma digital PKCS#12 (.p12) / FirmaEC y aseguramiento de la calidad ante el CACES, bajo el marco de la Ley Orgánica de Educación Superior (LOES), el Reglamento de Régimen Académico (RRA) y la Ley Orgánica de Protección de Datos Personales (LOPDP).

---

## 2. Visión General de la Arquitectura de Solución

La solución adopta un modelo desacoplado compuesto por una aplicación de página única (SPA) en el Frontend y una API RESTful construida bajo Clean Architecture (Arquitectura Limpia) en el Backend.

```mermaid
graph TD
    subgraph CapaPresentacion [Capa de Presentacion / Exposicion]
        WebClient["React 19 SPA (dosier_web)\nVite 8 + TypeScript + Modern Enterprise Docs"]
    end

    subgraph CapaBackend [Backend API Gateway .NET 8.0]
        APIGateway["ASP.NET Core Web API (dosier_api)\nJWT Auth / SnakeCase Serializer / Swagger / 6 BackgroundServices"]
        AppCore["Capa de Aplicacion (dosier_application)\nCasos de Uso / Validaciones Curriculares / DTOs"]
        DomainCore["Capa de Dominio (dosier_domain)\nEntidades PEA / Value Objects / Reglas de Negocio"]
        InfraCore["Capa de Infraestructura (dosier_infrastructure)\nEF Core 9 / Pomelo MySQL / Repositorios"]
    end

    subgraph CapaPersistencia [Capa de Persistencia e Integracion]
        MySQLDB[(MySQL 8.0 / MariaDB\nBase 'sigafi_es' :3306)]
        MailSMTP["Servidor SMTP / Push Notification Drivers"]
        ExternalSIGAFI[("Malla y Registro Academico SIGAFI (Solo Lectura)")]
    end

    WebClient -->|HTTP REST / WebSockets Yjs| APIGateway

    APIGateway --> AppCore
    AppCore --> DomainCore
    InfraCore --> DomainCore
    InfraCore --> AppCore

    InfraCore --> MySQLDB
    InfraCore --> MailSMTP
    InfraCore --> ExternalSIGAFI
```

---

## 3. Diagramas de Arquitectura C4

### Nivel 1: Diagrama de Contexto del Sistema

El diagrama de contexto ilustra los actores principales que interactúan con DOSIER y los sistemas externos integrados.

```mermaid
graph TD
    Docente["Docente Elaborador de Asignatura"]
    CoordCarrera["Coordinador(a) de Carrera\n(Revisor Curricular)"]
    CoordAcad["Coordinación / Comisión Académica\n(Revisor Metodológico)"]
    Vicerrector["Vicerrectorado Académico\n(Aprobador Oficial)"]
    Admin["Administrador de Plataforma y Calidad"]
    Publico["Auditor CACES / Verificación Pública QR"]

    subgraph DOSIERSystem ["Plataforma DOSIER ISTPET"]
        CoreSystem["DOSIER Core Platform\n(API REST + CoWork Hub + Engines + Frontend Web SPA)"]
    end

    SIGAFI[("SIGAFI Institucional: Mallas, Asignaturas, Asignacion Materias (Solo Lectura)")]
    SMTPService["Servidor de Correo SMTP / Push Notifications"]

    Docente -->|Elaboración y Co-redacción del PEA| CoreSystem
    CoordCarrera -->|Revisión de coherencia y aval de carrera| CoreSystem
    CoordAcad -->|Revisión metodológica y cuadre de horas| CoreSystem
    Vicerrector -->|Aprobación legal, sello SHA-256 y publicación| CoreSystem
    Admin -->|Gestión de normativas, modelos y periodos| CoreSystem
    Publico -->|Verificación de autenticidad via QR sin login| CoreSystem

    CoreSystem -->|Lectura AsNoTracking de mallas y distributivo| SIGAFI
    CoreSystem -->|Notificaciones de revisiones y firmas| SMTPService
```

### Nivel 2: Diagrama de Contenedores

El diagrama de contenedores detalla los bloques tecnológicos principales y sus protocolos de comunicación.

```mermaid
graph TB
    subgraph Clients [Contenedor de Cliente]
        WebClient["dosier_web\nReact 19 + Vite 8 + TypeScript (Modern Enterprise Docs)"]
    end

    subgraph BackendServices [Contenedores de Aplicacion .NET 8.0]
        APIContainer["dosier_api\n23 Controllers HTTP REST / ExceptionMiddleware / 6 BackgroundServices"]
        AppContainer["dosier_application\nCurriculum Services / Validation Engine / DTOs"]
        DomainContainer["dosier_domain\nEntidades Curriculares & Contratos Puros"]
        InfraContainer["dosier_infrastructure\nEF Core 9 / Engine Providers / Security"]
    end

    subgraph SpecializedEngines [Motores de Infraestructura]
        DocEngine["Motor Documental PDF\niText 9 / Handlebars.Net / QRCoder"]
        CoWorkHub["CollaborationHub\nSignalR / WebSockets / Yjs CRDT"]
        SignatureEngine["DosierSignatureService (Facade)\nDFRM HMAC-SHA256 / PKCS#12 (.p12) / SignatureStamper"]
        SecurityEngine["Security & RBAC Engine\nBCrypt / JWT / Microsoft SSO / 16 Permisos PBAC"]
    end

    subgraph DataStorage [Persistencia]
        DB[(MySQL 8.0 / MariaDB\nBase 'sigafi_es' :3306)]
        FileStore["Almacenamiento Local de Documentos y PDFs Emitidos"]
    end

    WebClient -->|HTTP REST / JSON / WebSockets| APIContainer

    APIContainer --> AppContainer
    AppContainer --> DomainContainer
    InfraContainer --> DomainContainer
    InfraContainer --> AppContainer

    InfraContainer --> DocEngine
    InfraContainer --> CoWorkHub
    InfraContainer --> SignatureEngine
    InfraContainer --> SecurityEngine

    InfraContainer -->|Pomelo MySQL ORM| DB
    DocEngine -->|Lectura de plantillas / Escritura PDF| FileStore
```

---

## 4. Desglose de Proyectos en la Solución Backend (.NET 8.0)

La solución backend `dosier.slnx` implementa Clean Architecture segregada en cinco proyectos independientes:

### 1. `dosier_domain` (Capa de Dominio)
* **Responsabilidad:** Contener las entidades curriculares puras, enumeraciones, constantes de permisos y contratos fundamentales sin dependencias de base de datos ni frameworks externos.
* **Componentes principales:** Entidades del PEA (`DocPea`, `DocPeaUnidad`, `DocPeaTema`, `DocPeaResultadoAprendizaje`, `DocPeaActividadPractica`, `DocPeaEvaluacion`, `DocPeaBibliografia`, `DocPeaObservacion`, `DocPeaTrazabilidad`), gobernanza curricular (`DocExpedienteCurricular`, `DocExpedienteAsignacion`, `DocNormativa`, `DocModeloEducativo`, `DocPerfilEgreso`), motor de plantillas (`DocDocumentTemplate`, `DocDocumentosInstancia`, `DocDocumentAudit`, `DocDocumentosFirma`), enumeraciones y constantes de permisos institucionales (`Permissions.cs` con 16 permisos PBAC).

### 2. `dosier_application` (Capa de Aplicación)
* **Responsabilidad:** Orquestar los casos de uso curriculares, procesar DTOs de entrada/salida y ejecutar validaciones de negocio.
* **Componentes principales:** Interfaces de servicios (`IPeriodoInstitucionalResolver`, `IAcademicContextResolver`, `IPeaService`, `INormativasService`, `IExpedienteCurricularService`, `IAsignaturasDocenteService`, `IDocumentInstanceService`, `IDosierSignatureService`, `IPeaAiAssistantService`), validadores con FluentValidation y contratos de transferencia de datos con mapeo canónico en `snake_case`.

### 3. `dosier_infrastructure` (Capa de Infraestructura)
* **Responsabilidad:** Implementar el acceso a datos relacionales, servicios externos, criptografía, generación documental y canales de comunicación en tiempo real.
* **Componentes principales:** `DosierContext` (EF Core 9 con Pomelo MySQL en 4 clases parciales), `PeaService` (gestión del PEA y validación matemática bloqueante de horas), `AcademicContextResolver`, `PeaAiAssistantService`, `PeaDocumentExtractorService`, `CollaborationHub` (SignalR + Yjs con compresión GZip), `RbacService`, fachada `DosierSignatureService` con 5 subservicios (`SignatureProfileSubservice`, `DosierInternalSignerSubservice`, `P12SignatureSubservice`, `SignatureVerificationSubservice`, `SignatureRevocationSubservice`), `DocumentEngine` (iText 9 + `HandlebarsTemplateEngine`), `QRCoder` y drivers de notificación (`SignalRDriver`, `EmailDriver` con `MailKit`).

### 4. `dosier_api` (Capa de Exposición Web API)
* **Responsabilidad:** Exponer los 23 archivos de controladores HTTP REST (22 clases, 201 endpoints HTTP), administrar autenticación JWT, gestionar la política global de serialización JSON `snake_case`, ejecutar los 6 servicios hospedados de fondo y configurar inyección de dependencias.
* **Componentes principales:** Controladores curriculares (`PeaController`, `NormativasController`, `ExpedientesController`, `AuthController`, `SignaturesController`, `CatalogsController`, etc.), Swagger OpenAPI (`Swashbuckle 6.6.2`), filtros de autorización RBAC/PBAC, `ExceptionMiddleware` de manejo global de excepciones y los 6 `BackgroundServices` (`BackupBackgroundService`, `CalendarioAlertasJob`, `RecycleBinCleanupBackgroundService`, `DocumentGarbageCollectorBackgroundService`, `EmailBackgroundProcessorService`, `EmailBounceListenerService`).

### 5. `dosier_tests` (Capa de Pruebas Automáticas)
* **Responsabilidad:** Verificación unitaria y de integración de reglas de negocio curriculares, pruebas de firma electrónica, resolución de períodos, asistente IA, seguridad RBAC/JWT y middleware HTTP.
* **Métricas Reales:** Suite de **80 pruebas automatizadas** en 12 clases reales (`PeaFirmaTests`, `PeaAiAssistantServiceTests`, `PeaSyncTests`, `PeriodoInstitucionalResolverTests`, `CalendarioServiceTests`, `CatalogsControllerTests`, `LopdpControllerTests`, `ExceptionMiddlewareTests`, `AuthServiceTests`, `BackupAdminServiceTests`, `RbacServiceTests`, `TokenServiceTests`) utilizando xUnit, EF Core InMemory y Moq.

---

## 5. Matriz del Stack Tecnológico Completo

| Capa / Módulo | Tecnología / Paquete | Versión Exacta | Función en el Sistema |
| :--- | :--- | :--- | :--- |
| **Plataforma Backend** | .NET SDK (ASP.NET Core) | `8.0` | Entorno de ejecución backend Clean Architecture. |
| **ORM / Acceso a Datos** | Entity Framework Core | `9.0.0` | Mapeo objeto-relacional y control de concurrencia. |
| **Conector MySQL** | Pomelo.EntityFrameworkCore.MySql | `9.0.0` | Provider optimizado para MySQL 8.0/MariaDB (`sigafi_es`). |
| **Compilador PDF** | itext7 / pdfHTML | `9.6.0` / `6.3.2` | Generación vectorial de documentos institucionales. |
| **Motor de Plantillas** | Handlebars.Net | `2.1.6` | Evaluación de plantillas HTML oficiales. |
| **Generación QR** | QRCoder | `1.8.0` | Generación de códigos QR vectoriales para verificación pública. |
| **Criptografía / Auth** | BCrypt.Net-Next / BouncyCastle | `4.1.0` / `1.9.0` | Hashing de claves y gestión de certificados PKCS#12 (.p12). |
| **Servicio de Correo** | MailKit | `4.16.0` | Envío de correos transaccionales y soporte MIME multipart. |
| **Documentación API** | Swashbuckle (Swagger) | `6.6.2` | Especificación interactiva OpenAPI. |
| **Frontend Web** | React + TypeScript | `19.2.5` | Interfaz SPA modular. |
| **Enrutador Frontend** | React Router DOM | `7.14.1` | Navegación declarativa SPA. |
| **Bundler Frontend** | Vite | `8.0.9` | Servidor de desarrollo y compilador de producción. |
| **Sistema de Diseño** | Tailwind CSS v4 + Modern Enterprise Docs | `4.2.2` | Sistema visual Modern Enterprise Docs con Inter Puro, acento `#0070f3` y fondos 100% sólidos. |
| **Motor Colaborativo** | SignalR + Yjs CRDT | `10.0.0` / `13.6.30` | Sincronización multi-docente concurrente sin colisiones. |

---

## 6. Estrategia de Persistencia y Modo Solo Lectura

1. **Base de Datos Institucional:** MySQL 8.0 en base `sigafi_es`, puerto local `3306`.
2. **Frontera Estricta de Solo Lectura:** Las tablas de la gestión académica institucional (`carreras`, `mallas`, `detallemallas`, `mallas_periodos`, `asignacion_materias`, `periodos`, `profesores`) se consultan exclusivamente mediante `.AsNoTracking()`. DOSIER jamás escribe sobre estas tablas.
3. **Módulo Curricular Dedicado:** Todas las tablas de gobernanza, expedientes, PEA, observaciones y trazabilidad operan bajo el prefijo `doc_*`, gestionadas íntegramente por DOSIER.
4. **Filtro Institucional Obligatorio:** Toda consulta curricular aplica obligatoriamente `carreras.esInstituto = 1`, aislando por completo la oferta de la Escuela de Conducción.
5. **Auditoría Forense Inmutable:** Cada cambio de estado, observación y firma registra el identificador de usuario, IP, User-Agent, fecha UTC y hash SHA-256 inalterable en `doc_pea_trazabilidad` y `doc_document_audit`.
