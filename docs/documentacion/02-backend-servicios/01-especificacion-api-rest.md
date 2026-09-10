# Especificación de API REST y Enlace de Datos (API-Frontend Binding)

## 1. Visión General de la API Backend

La capa de exposición web API (`dosier_api`) de DOSIER está construida sobre **ASP.NET Core 8.0**, proporcionando una interfaz RESTful para el consumo cliente por parte de la SPA React (`dosier_web`) y la aplicación móvil (`dosier_mobile`).

El backend está compuesto por controladores especializados organizados bajo los principios de Clean Architecture, coordinando la ejecución de los casos de uso curriculares y documentales alojados en `dosier_application`.

---

## 2. Políticas Globales de Serialización y Model Binding

Para asegurar la interoperabilidad entre el cliente TypeScript y la API C#, el pipeline de ASP.NET Core impone convenciones de serialización y mapeo de parámetros.

### 2.1. Política Global de Casing: `lower_snake_case` (`[FromBody]`)
El backend tiene configurada la propiedad `JsonNamingPolicy.SnakeCaseLower` de forma global en `Program.cs`. Todas las solicitudes `POST`, `PUT` y `PATCH` enviadas en el cuerpo del mensaje deben utilizar nombres de clave en **`lower_snake_case`**.

```json
{
  "id_asignacion": 1254,
  "codigo_asignatura": "SOF-401",
  "horas_docencia": 64,
  "horas_ape": 32,
  "horas_autonomo": 64,
  "creditos": 3.33,
  "rol_firmante": "DOSIER_DOCENTE"
}
```

La deserialización de .NET transforma automáticamente estas claves a sus correspondientes propiedades `PascalCase` en los DTOs de C# (`IdAsignacion`, `CodigoAsignatura`, `HorasDocencia`, `HorasApe`, `HorasAutonomo`, `Creditos`, `RolFirmante`).

### 2.2. Parámetros de Consulta y Formularios (`[FromQuery]`, `[FromForm]`)
* **Query Parameters (`[FromQuery]`):** El enlazador de parámetros de consulta vincula directamente con las variables de los métodos del controlador en **`camelCase`** (ej. `?idAsignatura=12&idPeriodo=ABR2026`).
* **Form Data (`multipart/form-data`):** La carga de certificados digitales (.p12), evidencias y archivos se procesa mediante `IFormFile`.

### 2.3. Excepción de Metadatos de Plantillas (`PascalCase`)
Las llamadas dirigidas al endpoint de parches de instancias documentales (`/documents/instances/{uuid}/metadata`) procesan esquemas dinámicos renderizados por el motor de plantillas (Handlebars / Scriban). Para preservar la compatibilidad con el compilador HTML, el payload de metadatos se envía y procesa en **`PascalCase`**.

---

## 3. Catálogo Técnico de Controladores del Backend

| Controlador | Ruta Base HTTP | Subsistema | Responsabilidad Principal |
| :--- | :--- | :--- | :--- |
| `PeaController` | `/api/pea` | Curricular | Gestión integral del PEA: Secciones a - k, guardado, co-redacción, cambio de estados, circuito de firmas, observaciones por sección, subsanación y trazabilidad. |
| `DocenteAsignaturasController` | `/api/docente-asignaturas` | Curricular | Consulta de asignaciones docentes reales de solo lectura desde SIGAFI, resolución de mallas por cohorte (`mallas_periodos`) y cálculo de horas oficiales. |
| `ExpedientesController` | `/api/expedientes-curriculares` | Curricular | Expedientes Curriculares por Asignatura: vinculación de la asignación docente de SIGAFI con el período académico y el PEA oficial. |
| `NormativasController` | `/api/normativas` | Gobernanza | Repositorio de normativas externas inalterables (CES, CACES, SENESCYT), desglose de artículos y checklist de cumplimiento pedagógico. |
| `CurriculumCatalogController` | `/api/curriculum-catalog` | Catálogos | Catálogos de campos de formación, modelos educativos institucionales y perfiles de egreso. |
| `DocumentInstancesController` | `/api/document-instances` | Motor Documental | Instanciación documental, snapshots forenses SHA-256, versionado y renderizado oficial a PDF. |
| `DocumentTemplatesController` | `/api/document-templates` | Motor Documental | Gestión y versionado de plantillas institucionales HTML oficiales (PEA Institucional y formatos de acreditación). |
| `DocumentsController` | `/api/documents` | Motor Documental | Almacenamiento, descarga de archivos PDF emitidos y verificación pública mediante QR. |
| `CollaborationController` | `/api/collaboration` | CoWork | Orquestación de sesiones de co-redacción concurrente multi-docente y control de bloqueos de sección. |
| `SignaturesController` | `/api/signatures` | Criptografía | Registro de firmas electrónicas, validación de certificados PKCS#12 (.p12) y estampados DFRM. |
| `AuthController` | `/api/auth` | Seguridad | Autenticación JWT, JIT provisioning desde profesores de SIGAFI, SSO Microsoft 365 y Magic Links. |
| `AdminController` | `/api/admin` | Administración | Gestión de usuarios, asignación de roles curriculares RBAC y auditoría administrativa. |
| `CalendarioController` | `/api/calendario` | Planificación | Hitos académicos, semanas lectivas institucionales y alertas normativas CACES. |
| `ReportsController` | `/api/reports` | Analítica | Reportes de cobertura curricular por carrera y tableros para acreditación institucional CACES. |
| `LopdpController` | `/api/lopdp` | Gobernanza | Gestión de derechos ARCO, consentimientos informados y anonimización de datos personales. |
| `NotificationsController` | `/api/notifications` | Comunicación | Notificaciones in-app, marcas de lectura y suscripciones WebPush VAPID. |
| `EmailEngineController` | `/api/email-engine` | Comunicación | Envío de correos transaccionales con layout institucional para alertas de revisión y firma. |
| `CatalogsController` | `/api/catalogs` | Catálogos | Catálogos de carreras institucionales (`esInstituto = 1`) y períodos académicos de SIGAFI. |
| `RecycleBinController` | `/api/recycle-bin` | Persistencia | Papelera de reciclaje lógica y restauración controlada de registros. |
| `StorageController` | `/api/storage` | Almacenamiento | Gestión de archivos temporales e imágenes institucionales. |
| `HealthController` | `/api/health` | Monitoreo | Verificación de estado y disponibilidad operativa del servicio. |

---

## 4. Estructura Estándar de Peticiones y Respuestas

### 4.1. Respuesta Exitosa de Consulta Curricular
```json
{
  "id_pea": 108,
  "id_asignatura": 45,
  "nombre_asignatura": "PROGRAMACION ORIENTADA A OBJETOS",
  "codigo_carrera": "SOF-2023",
  "horas_totales": 160,
  "horas_docencia": 64,
  "horas_ape": 32,
  "horas_autonomo": 64,
  "creditos": 3.33,
  "estado": "EnRevision",
  "version": 1,
  "unidades": [
    {
      "id_unidad": 1,
      "numero_unidad": 1,
      "titulo": "Fundamentos de Objetos y Clases",
      "horas_docencia": 16,
      "horas_ape": 8,
      "horas_autonomo": 16
    }
  ]
}
```

### 4.2. Respuesta de Error de Validación Matemática (`400 Bad Request`)
```json
{
  "status": 400,
  "error": "Inconsistencia Matemática Curricular",
  "message": "La suma de horas de las unidades temáticas (176h) excede el total oficial de la asignatura en la malla (160h).",
  "detalles": {
    "horas_malla": 160,
    "horas_ingresadas": 176,
    "diferencia": 16
  }
}
```
