---
name: backend-dosier
description: Extiende la skill global de backend con la Clean Architecture en 4 capas (.NET 8), EF Core 9, Pomelo MySQL, convenciones de persistencia modular (DosierContext en 4 partes), frontera SIGAFI de solo lectura, esquema doc_*, subservicios de firma digital (DFRM/P12), validaciones CACES del PEA y suite xUnit.
---
# Convenciones y Arquitectura de Backend — DOSIER (.NET 8 Clean Architecture)

> **Orquestación Obligatoria:** Esta skill **extiende y profundiza** las directrices globales de `desarrollo-backend`. Rige el desarrollo de servicios, persistencia, seguridad criptográfica y reglas de negocio curriculares del backend de **DOSIER** (Sistema de Gestión Curricular para el Programa de Estudio de la Asignatura - PEA del ISTPET).

---

## 1. Arquitectura en 4 Capas Concéntricas (.NET 8 Clean Architecture)

La solución backend (`backend/dosier.sln`) implementa estrictamente Clean Architecture con la regla de dependencia unidireccional hacia adentro:

```text
backend/
├── dosier_domain/           # Capa de Dominio (Núcleo Puro, Cero Dependencias Externas)
│   ├── Common/              # Value Objects, Entidades base, Enumeraciones de estado y Contratos puros
│   ├── Curriculum/          # Entidades curriculares: PeaCurricular, Unidades, Temas, RDAs, Bibliografía
│   ├── Identity/Entities/   # Usuario, Rol, Sistema, Permisos, Auditoría (RBAC Sistema ID 6)
│   └── Signatures/          # Modelos de eventos criptográficos, firmas y sellos digitales
├── dosier_application/      # Capa de Aplicación (Casos de Uso, Orquestación y DTOs)
│   ├── Academico/           # Interfaces de contexto académico (IAcademicContextResolver)
│   ├── Common/              # Interfaces de motores (IDocumentEngine, INotificationService)
│   ├── Curriculum/          # Casos de uso del PEA (IPeaService, DTOs de entrada/salida, validaciones CACES)
│   ├── Security/            # Casos de uso de autenticación JWT/SSO, LOPDP y evaluación de políticas RBAC
│   └── Signatures/          # Contrato maestro IDosierSignatureService y DTOs de firma
├── dosier_infrastructure/   # Capa de Infraestructura (Adaptadores y Tecnologías Externas)
│   ├── Academico/           # Consumo de SIGAFI (AsignaturasDocenteService) vía Capa Anticorrupción (ACL)
│   ├── Collaboration/       # CollaborationHub (SignalR WebSockets con compresión GZip para Yjs CRDTs)
│   ├── Curriculum/          # Implementación PeaService y persistencia en tablas doc_*
│   ├── data/models/Dosier/  # Persistencia Modular: DosierContext (4 archivos parciales) y Configurations/
│   ├── Migrations/          # DosierContextModelSnapshot y migraciones EF Core 9
│   ├── Research/            # Módulo de proyectos y CalendarioService (alertas CACES)
│   └── Signatures/          # Implementación DosierSignatureService y Subservicios criptográficos
├── dosier_api/              # Capa de Exposición (Presentación HTTP REST y Middlewares)
│   ├── Controllers/         # Controladores delgados (PeaController, DocenteAsignaturasController, etc.)
│   ├── Middlewares/         # Middleware global de excepciones, auditoría y autenticación híbrida
│   └── Program.cs           # Composición raíz de la aplicación, CORS dinámico, DI y pipeline HTTP
└── dosier_tests/            # Suite de Pruebas Unitarias e Integración (118 tests xUnit, Moq, FluentAssertions)
```

### Reglas de Dependencia Inviolables
1. `dosier_domain` no referencia ningún proyecto ni paquete de base de datos o HTTP. Contiene lógica de negocio pura y entidades del dominio curricular.
2. `dosier_application` únicamente referencia a `dosier_domain`. No conoce EF Core, SQL, SignalR ni controladores.
3. `dosier_infrastructure` referencia a `dosier_application` y `dosier_domain`. Implementa los contratos definidos en aplicación.
4. `dosier_api` referencia a `dosier_infrastructure` y `dosier_application` para la composición de la inyección de dependencias en `Program.cs`.

---

## 2. Frontera de Base de Datos y Persistencia (`sigafi_es`)

El sistema opera sobre una base de datos institucional en MySQL 8.0 / MariaDB denominada `sigafi_es` (puerto estándar 3306), consumida con `Pomelo.EntityFrameworkCore.MySql` y resiliencia transitoria (`EnableRetryOnFailure`).

### 2.1. Frontera SIGAFI (Estrictamente Solo Lectura)
* **Tablas Heredadas Institucionales:** `carreras`, `periodos`, `mallas`, `mallas_periodos`, `detallemallas`, `profesores`, `asignacion_materias`.
* **Regla Inviolable:** Queda terminantemente prohibido ejecutar inserciones, actualizaciones o eliminaciones sobre tablas de SIGAFI.
* **Consumo sin Tracking:** Toda consulta linq a entidades mapeadas de SIGAFI debe incluir obligatoriamente `.AsNoTracking()`.
* **Filtro Institucional de Carreras:** En todas las consultas a `carreras` debe aplicarse el filtro `c.esInstituto == 1` para ignorar programas ajenos al instituto.
* **Capa Anticorrupción (ACL):** Queda prohibido inyectar consultas crudas a SIGAFI en los controladores. El acceso a asignaciones docentes y distributivo debe resolverse a través de `IAcademicContextResolver` y `AsignaturasDocenteService`.

### 2.2. Esquema Propio DOSIER (Lectura y Escritura)
Todas las tablas creadas y administradas por el ecosistema DOSIER utilizan de forma obligatoria el prefijo `doc_*`, gestionadas por los 4 scripts oficiales en `scripts/base_datos/`:
1. `01_sistema_base.sql`: Tablas base del sistema (`doc_notificaciones`, `doc_email_templates`, `doc_email_historial`, `doc_tokens_acceso`, `doc_lopdp_*`, `doc_audit_admin`).
2. `02_motor_documental.sql`: Núcleo documental (`doc_document_templates`, `doc_document_instances`, `doc_document_audit`, `doc_documento_seccion_metadata`).
3. `03_cowork_colaboracion.sql`: Concurrencia en tiempo real (`doc_cowork_documentos`, `doc_cowork_updates`, `doc_cowork_sesiones`, `doc_collaboration_comments`, `doc_calendario_*`).
4. `04_seguridad_rbac_roles_curriculares.sql`: RBAC curricular (`doc_roles_curriculares`, `doc_asignaciones_roles_carrera`, `doc_permisos_workflow`, matriz de auditoría).

---

## 3. Modularización de `DosierContext` en EF Core 9

El contexto de base de datos reside en `backend/dosier_infrastructure/data/models/Dosier/` y está particionado en 4 archivos parciales limpios para máxima mantenibilidad:

1. `DosierContext.cs`: Constructor primario, inyección de `DbContextOptions<DosierContext>` y declaración de todos los `DbSet<T>` institucionales.
2. `DosierContext.Doc.cs`: Configuración Fluent API de tablas propias (`OnModelCreatingDosier`), aplicando de forma modular las clases de configuración `IEntityTypeConfiguration<T>` ubicadas en `Configurations/Doc*Configurations.cs`.
3. `DosierContext.Identity.cs`: Configuración del modelo RBAC y seguridad institucional (Sistema ID 6 de SIGAFI).
4. `DosierContext.Sigafi.cs`: Mapeo de solo lectura de las tablas preexistentes del instituto, configurando claves primarias y desactivando navegaciones recursivas que causen ciclos en el legacy.

### Prohibición Terminante de Nombres Residuales
* Queda terminantemente prohibido reintroducir nombres, prefijos o clases heredadas del proyecto origen (`Inv*.cs`, `DiitraContext*.cs`).
* Todas las entidades del modelo de datos de DOSIER deben denominarse obligatoriamente `Doc*.cs` (ej: `DocProyecto.cs`, `DocNotificacion.cs`, `DocCoworkDocumento.cs`, `DocPeaCurricular.cs`).
* El archivo de snapshot oficial es `backend/dosier_infrastructure/Migrations/DosierContextModelSnapshot.cs`.

---

## 4. Módulo de Firmas Criptográficas (`Signatures/`)

El sistema cumple con la Ley de Comercio Electrónico y Firmas Electrónicas del Ecuador mediante una arquitectura desacoplada en `dosier_infrastructure/Signatures/Subservices/`:

```text
dosier_application/Signatures/
└── IDosierSignatureService.cs            # Contrato maestro de alto nivel
dosier_infrastructure/Signatures/
├── DosierSignatureService.cs             # Orquestador de casos de uso de firma
└── Subservices/
    ├── IDosierInternalSignerSubservice.cs / DosierInternalSignerSubservice.cs   # Firma DFRM (HMAC-SHA256)
    ├── IP12SignatureSubservice.cs / P12SignatureSubservice.cs                   # Firma PKCS#12 (.p12 / FirmaEC)
    ├── SignatureStamper.cs                                                      # Estampado visual PDF (iText 9)
    ├── SignatureVerificationSubservice.cs                                       # Verificación pública por QR
    ├── SignatureProfileSubservice.cs                                            # Gestión de perfiles y certificados
    └── SignatureRevocationSubservice.cs                                         # Revocación formal de instrumentos
```

### Protocolos de Firma
1. **Firma Interna Institucional (DFRM):**
   * Código de validación unívoco formato `DFRM-{AÑO}-{UUID8}` (ej: `DFRM-2026-A1B2C3D4`).
   * Re-autenticación obligatoria con contraseña institucional antes de generar el hash criptográfico.
   * Firma mediante algoritmo HMAC-SHA256 vinculando la identidad del usuario, el rol curricular y el contenido inmutable del documento.
2. **Firma Electrónica PKCS#12 (.p12):**
   * Validación de certificados digitales emitidos por entidades acreditadas en Ecuador (Banco Central del Ecuador, Security Data, Consejo de la Judicatura, ANFAC).
   * Verificación de vigencia, cadena de confianza y lista de revocación (CRL / OCSP).
3. **Estampado Vectorial con iText 9:**
   * La clase `SignatureStamper` inserta el sello visual institucional en el PDF generado: código DFRM, titular, cargo/rol curricular, fecha/hora exacta en zona horaria de Ecuador (UTC-5) y código QR de verificación pública.

---

## 5. Máquina de Estados y Ciclo de Vida del PEA Oficial

El ciclo de vida del instrumento curricular en `PeaService` sigue la máquina de estados institucional:

```text
[Borrador] ──────> [EnRevision] ──────> [RevisadoCoord] ──────> [RevisadoAcad] ──────> [Aprobado]
  ▲                   │
  │                   ▼
  └────────────── [Observado]
```

### Fases del Workflow
1. **Borrador:** Formulación colaborativa del PEA por el o los docentes autores asignados a la asignatura, con sincronización concurrente Yjs.
2. **EnRevision:** Envío formal del PEA a Coordinación de Carrera. Las comisiones de carrera y revisores designados pueden emitir observaciones disciplinarias por sección (`POST /api/pea/:id/observaciones`).
3. **Observado:** Si se emiten observaciones, el PEA entra en estado de subsanación. Los docentes corrigen las secciones observadas y registran la subsanación (`PATCH /api/pea/observaciones/:id/subsanar`) para retornar a `EnRevision`.
4. **RevisadoCoord:** Aval de coherencia disciplinar y pertinencia respecto al perfil de egreso emitido por la Coordinación de Carrera.
5. **RevisadoAcad:** Aval de cuadre horario, coherencia de créditos y distribución metodológica emitido por Coordinación Académica.
6. **Aprobado:** Legalización definitiva por el Vicerrectorado Académico. Al alcanzarse este estado:
   * Se activa el **Congelamiento Forense Inmutable** (*State Locking*): ninguna sección puede modificarse.
   * Se genera el hash criptográfico SHA-256 definitivo del documento y se sella en `doc_document_instances`.
   * Se habilita el acceso de verificación pública por código QR para auditorías externas del CACES.

---

## 6. Validación Matemática Intransigente de Horas CES

En todo guardado o cambio de estado de un PEA, el sistema valida que la suma de horas planificadas coincida de forma exacta con la malla curricular oficial registrada en `detallemallas` de SIGAFI:

$$\text{Horas Docencia (CD)} + \text{Horas APE} + \text{Horas Autónomo (TA)} \equiv \text{Total Horas de la Asignatura}$$

* **Equivalencia RRA CES (Art. 21):** 1 Crédito Académico equivale estrictamente a **48 horas** de trabajo del estudiante.
* **Desglose de Componentes:**
  * Componente de Docencia (CD): Clases teóricas y seminarios guiados.
  * Aprendizaje Práctico-Experimental (APE): Laboratorios, talleres y prácticas aplicadas.
  * Trabajo Autónomo (TA): Estudio independiente, lecturas y preparación de proyectos.
* Si la suma no cuadra con la carga horaria oficial de la asignatura, el motor de validación curricular (`CurricularValidationEngine`) rechaza la operación retornando `400 Bad Request` con el detalle del desfase horario.

---

## 7. Políticas Globales de API REST y Middlewares

* **Serialización Global en snake_case:** El backend serializa todas las propiedades de respuestas JSON a `snake_case` de forma global (`JsonNamingPolicy.SnakeCaseLower` configurado en `Program.cs`).
* **Production-Lock de Validación:** `SuppressModelStateInvalidFilter = false`. Ninguna petición que viole las DataAnnotations o validadores de FluentValidation ingresa al cuerpo del controlador; retorna inmediatamente `400 Bad Request`.
* **Autenticación Híbrida JWT:** El middleware de autenticación soporta lectura de token tanto desde cookie segura `dosier_auth` (cliente web local) como desde la cabecera `Authorization: Bearer <token>` (SSO institucional y peticiones API).
* **SignalR CoWork Hub:** El hub de colaboración (`CollaborationHub`) establece un límite máximo de payload de 2 MB con compresión binaria GZip para la transmisión eficiente de deltas Yjs.

---

## 8. Suite de Pruebas Unitarias y de Integración (`dosier_tests`)

* Todas las reglas de negocio, cálculos de horas, validaciones de permisos RBAC y transformaciones DTO deben estar cubiertas con pruebas unitarias en `backend/dosier_tests/`.
* Tecnologías de testing: **xUnit**, **Moq** para simulación de dependencias y **FluentAssertions** para aserciones legibles.
* **Cero Tolerancia a Fallos:** Todo build de backend debe compilar sin advertencias (`dotnet build backend/dosier.sln --no-incremental`) y superar el 100% de las pruebas automatizadas (`dotnet test backend/dosier_tests/dosier_tests.csproj`).

---

## 9. Checklist de Entrega para Tareas de Backend

Antes de finalizar cualquier tarea en el backend de DOSIER:
* [ ] ¿El código respeta estrictamente la Clean Architecture y no viola las dependencias de capas?
* [ ] ¿Se utilizó `.AsNoTracking()` en todas las consultas linq a tablas de SIGAFI?
* [ ] ¿Todas las entidades creadas tienen prefijo `Doc*.cs` y tablas `doc_*`?
* [ ] ¿La respuesta de los endpoints está serializada en `snake_case`?
* [ ] ¿Se verificó que `dotnet build backend/dosier.sln` termine con 0 Errores y 0 Advertencias?
* [ ] ¿Se ejecutó `dotnet test` y el 100% de las pruebas pasaron en verde?
* [ ] ¿Se documentó oportunamente en `docs/documentacion/` según los criterios de `documentacion-dosier`?
