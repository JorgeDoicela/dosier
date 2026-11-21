# Especificación Técnica de API REST y Enlace de Datos (API-Frontend Binding)

## 1. Visión General de la API REST

La Web API de **DOSIER** (`dosier_api`) está desarrollada sobre **ASP.NET Core 8.0** y proporciona el ecosistema integral de servicios web consumidos por la aplicación SPA (`dosier_web`).

La API expone **23 controladores especializados** junto con 2 hubs de SignalR, estructurados bajo **Clean Architecture pura**. Ningún controlador inyecta directamente el contexto de base de datos (`DosierContext`) ni formula consultas LINQ directas; todas las operaciones se delegan en interfaces de servicio tipadas en `dosier_application` e implementadas en `dosier_infrastructure`.

---

## 2. Convenciones Globales de Comunicación

### 2.1. Política Global de Nomenclatura: `snake_case`
El backend tiene configurada la política global `JsonNamingPolicy.SnakeCaseLower` en `Program.cs`. Todas las solicitudes y respuestas intercambiadas en el cuerpo HTTP (`[FromBody]`) utilizan exclusivamente nombres de campo en **`snake_case`**.

Ejemplo de payload JSON estructurado para el PEA:
```json
{
  "id_pea": 108,
  "id_carrera": 12,
  "id_asignatura": 45,
  "id_periodo": "ABR2026-SEP2026",
  "total_horas_asignatura": 160,
  "creditos": 3.33,
  "horas_contacto_docente": 64,
  "horas_practico_experimental": 32,
  "horas_autonomo": 64,
  "estado": "Borrador",
  "version": 1
}
```

### 2.2. Parámetros de Consulta (`[FromQuery]`) y Encabezados
* Los parámetros de consulta en URL se reciben en formato **`camelCase`** (ejemplo: `?idAsignatura=45&idPeriodo=ABR2026`).
* La autenticación soporta modelo híbrido: mediante encabezado `Authorization: Bearer <jwt_token>` o lectura de la cookie segura HttpOnly `dosier_auth`.

### 2.3. Production-Lock de Validación
`SuppressModelStateInvalidFilter = false` se encuentra activado de forma permanente. Cualquier petición que viole las DataAnnotations o los validadores de FluentValidation es interceptada antes de ingresar al controlador, retornando automáticamente `400 Bad Request` con el detalle estructurado de validación.

---

## 3. Catálogo Exhaustivo de los 23 Controladores REST

```text
Controladores del Backend DOSIER:
├── Subsistema Curricular:
│   ├── 1. PeaController (/api/pea)
│   ├── 2. DocenteAsignaturasController (/api/docente-asignaturas)
│   ├── 3. ExpedientesController (/api/expedientes-curriculares)
│   ├── 4. NormativasController (/api/normativas)
│   ├── 5. CurriculumCatalogController (/api/curriculum)
│   └── 6. CatalogsController (/api/catalogs)
├── Subsistema de Motor Documental y Criptografía:
│   ├── 7. DocumentInstancesController (/api/documents/instances)
│   ├── 8. DocumentTemplatesController (/api/admin/templates)
│   ├── 9. DocumentsController (/api/documents)
│   └── 10. SignaturesController (/api/signatures)
├── Subsistema de Seguridad, Identidad y Gobernanza:
│   ├── 11. AuthController (/api/auth)
│   ├── 12. AdminController (/api/admin)
│   └── 13. LopdpController (/api/lopdp)
├── Subsistema de Colaboración:
│   └── 14. CollaborationController (/api/collaboration)
├── Subsistema de Comunicación, Soporte y Analítica:
│   ├── 15. NotificationsController (/api/Admin/notifications)
│   ├── 16. EmailEngineController (/api/Admin/email-engine)
│   ├── 17. CalendarioController (/api/calendario)
│   ├── 18. ReportsController (/api/reports)
│   └── 19. FeedbackController (/api/feedback)
└── Subsistema de Mantenimiento y Utilidades:
    ├── 20. RecycleBinController (/api/recyclebin)
    ├── 21. StorageController (/api/storage)
    ├── 22. HealthController (/api/health)
    └── 23. Endpoint Mínimo Ping (/api/ping)
```

---

### 3.1. `PeaController` (`/api/pea`)
Controlador central para la elaboración, edición, validación de horas, circuito colegiado de firmas y observaciones del PEA institucional.

| Método | Ruta | Autorización | Descripción y Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/{id:int}` | Autenticado | Obtiene un PEA por su ID primario numérico, incluyendo las 11 secciones estructuradas. |
| `GET` | `/uuid/{uuid}` o `/{uuid:guid}` | Autenticado | Obtiene un PEA por su identificador UUID único. |
| `GET` | `/buscar` | Autenticado | Busca PEA por `idAsignatura` e `idPeriodo`. |
| `GET` | `/bandeja` | Autenticado | Bandeja de supervisión curricular filtrada por `idPeriodo`, `idCarrera`, `estado`. Computa firmas completadas. |
| `GET` | `/otros-docentes` | Autenticado | Lista las cátedras asignadas a otros docentes de la misma carrera para consulta colegiada y co-elaboración. |
| `POST`| `/colaboraciones/solicitar` | Autenticado | Registra una solicitud de colaboración formal de un docente hacia la asignatura de otro profesor titular. |
| `POST`| `/colaboraciones/{uuid}/responder` | Docente Titular / Admin | Acepta o rechaza la solicitud de colaboración e inicializa el PEA si estaba `NoIniciado`. |
| `POST`| `/colaboraciones/{uuid}/cancelar` | Autenticado | Retira formalmente una solicitud de colaboración pendiente antes de su dictamen. |
| `GET` | `/colaboraciones/mis-solicitudes` | Autenticado | Lista las solicitudes de colaboración formuladas por el usuario en sesión. |
| `GET` | `/colaboraciones/recibidas` | Autenticado | Lista las solicitudes recibidas por el docente titular de la cátedra. |
| `POST`| `/` | Autenticado | Guarda o actualiza incrementalmente las secciones del PEA. Valida balance de horas normado. |
| `POST`| `/desde-asignacion/{idAsignacion:int}` | Autenticado | Instancia un nuevo PEA a partir de la asignación docente de SIGAFI. |
| `PATCH`| `/{id:int}/estado` o `/uuid/{uuid}/estado` | `DOSIER_ADMIN` | Modificación forzada de estado curricular por el administrador. |
| `POST`| `/{id:int}/firmar` o `/uuid/{uuid}/firmar` | Autenticado | Firma electrónica oficial del PEA (DFRM o PKCS#12) según la etapa del flujo. |
| `POST`| `/{id}/clonar` | Admin / Docente / Coord | Clona el PEA hacia un nuevo período académico (`?nuevoPeriodo=...`). |
| `GET` | `/{id:int}/observaciones` o `/uuid/{uuid}/observaciones` | Autenticado | Lista las observaciones registradas durante la revisión colegiada. |
| `POST`| `/{id:int}/observaciones` o `/uuid/{uuid}/observaciones` | Coordinadores / Vicerrector | Registra una nueva observación formal sobre una sección pedagógica del PEA. |
| `PATCH`| `/observaciones/{idObs:int}/subsanar` | Docente / Admin | Subsanación de la observación por el docente con su justificación de cambios. |
| `DELETE`| `/observaciones/{idObs:int}` | Coordinadores / Vicerrector / Admin | Eliminación o retiro de una observación formal registrada. |
| `GET` | `/{id:int}/trazabilidad` o `/uuid/{uuid}/trazabilidad` | Autenticado | Historial inmutable de cambios de estado y hashes criptográficos SHA-256. |
| `POST`| `/uuid/{uuid}/trazabilidad` | Autenticado | Registro manual de hitos o eventos en la bitácora de trazabilidad. |
| `GET` | `/ai/config` | Autenticado | Consulta el estado de configuración, proveedor activo, modelo y endpoint del asistente de IA. |
| `POST`| `/ai/config` | Autenticado / Admin | Almacenamiento cifrado con AES-256 de las credenciales y configuración del motor de IA. |
| `POST`| `/uuid/{uuid}/ai/generar` | Autenticado (Docente/Admin) | Generación asistida de propuestas curriculares con balance horario exacto SIGAFI. |
| `POST`| `/uuid/{uuid}/ai/revisar` | Autenticado | Análisis heurístico y emisión de sugerencias de consistencia CACES con IA. |
| `POST`| `/uuid/{uuid}/importar-documento` | Autenticado (Docente/Admin) | Extracción sintáctica de contenidos desde archivos digitales (.pdf y .docx) con mapeo a campos Yjs. |
| `POST`| `/uuid/{uuid}/ai/importar-archivo` | Autenticado | Importación directa de archivos mediante el pipeline del motor de IA. |

---

### 3.2. `DocenteAsignaturasController` (`/api/docente-asignaturas`)
Frontera de integración de solo lectura con las asignaciones académicas de SIGAFI.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/contexto/{idAsignacion:int}` | Autenticado | Resuelve el contexto curricular oficial de la asignatura asignada (horas, créditos, nivel). |
| `GET` | `/periodo-activo` | Autenticado | Retorna el período académico activo institucional en SIGAFI. |
| `GET` | `/periodos` | Autenticado | Lista los períodos académicos disponibles. |
| `GET` | `/mis-asignaturas` | Autenticado | Retorna las cátedras asignadas al docente autenticado con el estado actual de su PEA. |
| `GET` | `/curriculo` | Autenticado | Información detallada de una asignatura y carrera (`idAsignatura`, `idCarrera`). |

---

### 3.3. `ExpedientesController` (`/api/expedientes-curriculares`)
Gestión del Expediente Curricular Maestro por Asignatura y Período, y soporte para Salas Curriculares Colegiadas.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/{id:int}` | Autenticado | Consulta básica de expediente curricular por ID. |
| `GET` | `/{id:int}/detalle` | Autenticado | Expediente consolidado con proyecto de carrera CES, modelo educativo y matriz de tributación. |
| `GET` | `/asignacion/{idAsignacion:int}` | Autenticado | Obtiene el expediente vinculado a una asignación docente. |
| `GET` | `/periodo/{idPeriodo}` | Autenticado | Lista expedientes curriculares por período y carrera. |
| `POST`| `/asegurar/asignacion/{idAsignacion:int}` | Autenticado | Obtiene o crea automáticamente el expediente curricular maestro para la cátedra. |
| `GET` | `/sala-carrera/{idCarrera:int}/{idPeriodo}` | Autenticado | Obtiene estado de la Sala Curricular por carrera y nómina de asignaturas del período. |
| `POST`| `/sala-carrera/{idCarrera:int}/{idPeriodo}/conmutar` | Coordinador / Vicerrector | Abre o pausa formalmente la sesión interactiva de la sala de carrera en tiempo real. |
| `GET` | `/sala-carrera/{idCarrera:int}/{idPeriodo}/pizarra` | Autenticado | Obtiene el snapshot persistido de la pizarra interactiva (notas, acuerdos, textos y estado Yjs). |
| `PUT` | `/sala-carrera/{idCarrera:int}/{idPeriodo}/pizarra` | Autenticado | Persiste el snapshot JSON y estado binario Base64 de la pizarra en `doc_cowork_documentos`. |

---

### 3.4. `NormativasController` (`/api/normativas`)
Repositorio inalterable de normativas externas y catálogos curriculares.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Autenticado | Lista normativas vigentes (CES, CACES, SENESCYT). |
| `GET` | `/checklist` | Autenticado | Checklist de artículos normativos para validación pedagógica del PEA. |
| `GET` | `/modelo-educativo` | Autenticado | Versión oficial del Modelo Educativo Institucional (MED) vigente. |
| `GET` | `/perfil-egreso` | Autenticado | Perfil de egreso formal por carrera y malla (`idCarrera`, `idMalla`). |
| `GET` | `/tributacion-asignatura`| Autenticado | Matriz de articulación curricular entre asignatura y resultados del perfil. |
| `GET` | `/proyecto-curricular` | Autenticado | Proyecto curricular aprobado por el CES para la carrera. |

---

### 3.5. `CurriculumCatalogController` (`/api/curriculum`)
Catálogos académicos filtrados para la elaboración del PEA.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/carreras` | Autenticado | Carreras institucionales asociadas al docente en el período lectivo. |
| `GET` | `/asignaturas` | Autenticado | Asignaturas de la malla curricular por carrera y profesor. |
| `GET` | `/periodos` | Autenticado | Lista de períodos académicos para filtros de selección. |

---

### 3.6. `CatalogsController` (`/api/catalogs`)
Catálogos institucionales maestros y configuraciones del sistema.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/config-general` | Público / Autenticado | Parámetros de configuración general del instituto. |
| `GET` | `/carreras` | Público / Autenticado | Catálogo de carreras institucionales del ISTPET (`esInstituto = 1`). |
| `GET` | `/mi-carrera` | Autenticado | Determina la carrera oficial del usuario en el período activo. |

---

### 3.7. `DocumentInstancesController` (`/api/documents/instances`)
Orquestación de instancias documentales generadas, snapshots forenses y mantenimiento en disco.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `POST`| `/` | Autenticado | Crea una nueva instancia documental para una entidad y plantilla. |
| `GET` | `/{uuid}` | Autenticado | Consulta la instancia documental por su UUID. |
| `GET` | `/{uuid}/pdf` | Público (AllowAnonymous) | Retorna el archivo PDF oficial o firmado; si no existe, lo compila en caliente sin marca de agua. |
| `GET` | `/entity/{entityUuid}` | Autenticado | Lista instancias vinculadas a una entidad (PEA o proyecto). |
| `GET` | `/resolve` | Autenticado | Busca o crea atómicamente la instancia para `(entityUuid, templateCode)`. |
| `PATCH`| `/{uuid}/metadata` | Autenticado | Guarda snapshots de metadatos colaborativos para renderizado. |
| `POST`| `/{uuid}/finalize` | Autenticado | Finaliza el documento, bloqueando edición y registrando hash SHA-256. |
| `POST`| `/{uuid}/upgrade-template` | Autenticado | Actualiza la instancia a la última versión publicada de la plantilla. |
| `GET` | `/templates/{code}/ui-config` | Autenticado | Retorna la configuración dinámica de interfaz (Metadata-Driven UI). |
| `GET` | `/{uuid}/ui-config` | Autenticado | Configuración de UI preservando el snapshot histórico de la instancia. |
| `GET` | `/maintenance/obsolete-diagnosis` | `DOSIER_ADMIN` | Diagnóstico de documentos generados con plantillas obsoletas y espacio en disco. |
| `DELETE`| `/maintenance/purge-file/{uuid}` | `DOSIER_ADMIN` | Purga física de un PDF obsoleto preservando la trazabilidad forense. |
| `POST`| `/maintenance/purge-all-obsolete` | `DOSIER_ADMIN` | Purga masiva de binarios preliminares obsoletos del servidor. |

---

### 3.8. `DocumentTemplatesController` (`/api/admin/templates`)
Administración y diseño de plantillas HTML institucionales en base de datos.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Lista todas las plantillas institucionales activas. |
| `POST`| `/` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Registra una nueva plantilla institucional en el catálogo maestro. |
| `GET` | `/{code}` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Detalle, bloques y configuración de una plantilla por código. |
| `PUT` | `/{code}` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Actualiza marcado HTML, CSS y campos colaborativos de la plantilla. |
| `POST`| `/migrate-protocolo-investigacion` | `DOSIER_ADMIN` | Script de migración estructural para formatos institucionales. |
| `POST`| `/{code}/reset-to-default` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Restablece la plantilla a sus archivos oficiales de fábrica. |
| `PUT` | `/{code}/signature-config` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Configura los requisitos de firma (DOSIER, ECUADOR_P12, HIBRIDO). |
| `PUT` | `/{code}/filename-pattern` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Define el patrón de nomenclatura para descarga del PDF compilado. |
| `GET` | `/{code}/usage-count` | `DOSIER_ADMIN` | Retorna el número de expedientes activos que emplean la plantilla. |
| `GET` | `/global-theme` | Autenticado | Obtiene la configuración del tema visual institucional global. |
| `PUT` | `/global-theme` | `DOSIER_ADMIN` | Actualiza los tokens y propiedades del tema visual global. |
| `PUT` | `/order` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Guarda el orden secuencial de presentación de plantillas en la UI. |
| `GET` | `/{code}/render-pdf` o `POST /{code}/render-pdf` | Autenticado | Compila y renderiza en PDF la plantilla con sus bloques actuales en tiempo real. |

---

### 3.9. `DocumentsController` (`/api/documents`)
Motor documental agnóstico de renderizado PDF y validación pública forense.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `POST`| `/render` | Autenticado | Renderizado universal de cualquier DTO a PDF con marca de agua o doble ciego. |
| `GET` | `/templates` | Autenticado | Catálogo de plantillas disponibles en el motor. |
| `GET` | `/templates/{code}` | Autenticado | Consulta de plantilla por código. |
| `GET` | `/verify/{traceabilityCode}` | **Público (Anónimo)** | Verificación pública forense de autenticidad documental mediante QR. |
| `GET` | `/audit/{traceabilityCode}` | Autenticado | Ficha completa de auditoría forense con snapshot inyectado. |
| `POST`| `/merge` | Autenticado | Concatenación de múltiples binarios PDF en un solo archivo. |

---

### 3.10. `SignaturesController` (`/api/signatures`)
Motor criptográfico de firmas digitales institucionales y certificados PKCS#12.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Autenticado | Obtiene el perfil de firma del usuario (trazo canvas, cargo institucional). |
| `PUT` | `/profile` | Autenticado | Guarda o actualiza el trazo vectorial y metadatos del firmante. |
| `POST`| `/sign` | Autenticado | Firma institucional con re-autenticación de contraseña (HMAC-SHA256 y DFRM). |
| `POST`| `/sign-p12` | Autenticado | Firma electrónica con certificado calificado del Ecuador (`.p12` / `.pfx`). |
| `GET` | `/document/{documentUuid}` | Autenticado | Lista todas las firmas electrónicas válidas estampadas en un documento. |
| `GET` | `/verify/{firmaCode}` | **Público (Anónimo)** | Verificación de validez de una firma sin requerir inicio de sesión. |
| `POST`| `/revoke` | Autenticado | Revocación formal de una firma por el autor o un administrador. |

---

### 3.11. `AuthController` (`/api/auth`)
Gestión de autenticación, JIT provisioning, SSO Microsoft y ciclo de vida de contraseñas.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `POST`| `/login` | **Público** | Autenticación con usuario/contraseña, emitiendo JWT y cookie segura `dosier_auth`. |
| `POST`| `/microsoft-login` | **Público** | Inicio de sesión federado mediante token de Microsoft Azure AD / Entra ID. |
| `POST`| `/refresh` | **Público** | Renovación del access token JWT mediante refresh token. |
| `POST`| `/logout` | Autenticado | Invalida la sesión activa y purga la cookie `dosier_auth`. |
| `GET` | `/me` | Autenticado | Ficha completa del usuario autenticado con roles curriculares y permisos. |
| `GET` / `POST` | `/validate-sso` | Autenticado | Validación de vigencia del token de sesión federada. |
| `POST`| `/recuperar-contrasenia` | **Público** | Emite solicitud de recuperación de clave institucional (cédula o correo). |
| `POST`| `/ver-contrasenia` | **Público** | Valida el token de un solo uso para recuperación. |
| `POST`| `/cambiar-contrasenia` | Autenticado | Cambio voluntario de contraseña por parte del usuario con sesión activa. |
| `POST`| `/revertir-contrasenia-alerta`| **Público** | Reversión de emergencia ante sospecha de compromiso de cuenta institucional. |
| `POST`| `/restablecer-contrasenia-recuperacion` | **Público** | Establecimiento definitivo de nueva contraseña mediante token de recuperación. |

---

### 3.12. `AdminController` (`/api/admin`)
Panel de control administrativo institucional (`DOSIER_ADMIN`).

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | `DOSIER_ADMIN` | Gestión paginada de docentes y personal con filtros de carga docente y departamento. |
| `GET` | `/gobernanza-carreras` | Autenticado | Estructura jerárquica institucional: Vicerrectorado, Coordinación Académica, carreras y claustro docente. |
| `GET` | `/roles` | `DOSIER_ADMIN` | Catálogo de roles curriculares institucionales. |
| `GET` | `/departments` | `DOSIER_ADMIN` | Departamentos y áreas académicas institucionales. |
| `GET` | `/metadata/{userUuid}` o `/users/{userUuid}/metadata` | `DOSIER_ADMIN` | Metadatos de perfil extendido de un usuario. |
| `PUT` | `/metadata/{userUuid}` o `/users/{userUuid}/metadata` | `DOSIER_ADMIN` | Actualización de perfil administrativo del usuario. |
| `POST`| `/roles/assign` o `/users/{idUsuario}/roles/{roleCode}` | `DOSIER_ADMIN` | Asignación de rol curricular RBAC a un usuario. |
| `POST`| `/roles/revoke` o `DELETE /users/{idUsuario}/roles/{roleCode}` | `DOSIER_ADMIN` | Revocación formal de rol curricular a un usuario. |
| `GET` | `/audit-logs` o `/audit` | `DOSIER_ADMIN` | Bitácora inmutable de auditoría con deltas JSON (`values_before`, `values_after`). |
| `GET` | `/audit-logs/recent` | `DOSIER_ADMIN` | Registros de auditoría recientes para tableros de control. |
| `GET` | `/audit/advanced` | `DOSIER_ADMIN` | Búsqueda forense avanzada con filtros multicriterio. |
| `GET` | `/backups` | `DOSIER_ADMIN` | Historial de copias de seguridad generadas en el sistema. |
| `GET` | `/backups/disk-info` | `DOSIER_ADMIN` | Métricas físicas de almacenamiento y espacio libre en disco del servidor. |
| `POST`| `/backups/trigger` | `DOSIER_ADMIN` | Ejecución asíncrona inmediata de respaldo integral (base de datos + uploads). |
| `GET` | `/backups/download/{uuid}` | `DOSIER_ADMIN` | Descarga del archivo comprimido `.sql.gz` del respaldo solicitado. |
| `POST`| `/backups/verify/{uuid}` | `DOSIER_ADMIN` | Verificación en vivo de integridad criptográfica SHA-256 contra el hash registrado. |
| `DELETE`| `/backups/{uuid}` | `DOSIER_ADMIN` | Purga y eliminación física definitiva del archivo de respaldo en servidor. |

---

### 3.13. `LopdpController` (`/api/lopdp`)
Gestión de cumplimiento de la Ley Orgánica de Protección de Datos Personales.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/termino-vigente` | **Público** | Obtención del documento HTML de la política y términos vigentes de SIGAFI. |
| `POST`| `/consentimiento` | Autenticado | Registro de consentimiento informado unificado en `pd_aceptaciones_usuarios`. |
| `GET` | `/consentimientos` | `DOSIER_ADMIN` | Auditoría de consentimientos otorgados por la comunidad institucional. |
| `POST`| `/solicitud-arco` | Autenticado | Registro de solicitudes de derechos ARCO (Acceso, Rectificación, Cancelación, Oposición). |
| `GET` | `/solicitudes-arco` | `DOSIER_ADMIN` | Bandeja de seguimiento de solicitudes ARCO con control de plazos legales. |
| `POST`| `/solicitud-arco/resolver` | `DOSIER_ADMIN` | Resolución formal de solicitud ARCO con adjunto de evidencia técnica. |
| `GET` | `/perfil` | Autenticado | Estado del consentimiento LOPDP del usuario autenticado. |
| `PATCH`| `/perfil` | Autenticado | Actualización de preferencias de consentimiento y firmas. |

---

### 3.14. `CollaborationController` (`/api/collaboration`)
Coordinación previa y control de sesiones del editor colaborativo CoWork.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `POST`| `/upload` | Autenticado | Carga segura de imágenes insertadas en el editor colaborativo evitando Base64. |
| `GET` | `/doc/{docId}` | Autenticado | Estado inicial y snapshot del documento colaborativo antes del handshake WebSocket. |
| `POST`| `/doc/{docId}/lock` | Autenticado | Adquisición de bloqueo suave sobre una sección pedagógica del PEA. |
| `POST`| `/doc/{docId}/unlock` | Autenticado | Liberación de bloqueo sobre la sección. |
| `GET` | `/doc/{docId}/active-users` | Autenticado | Lista de usuarios actualmente concurrentes en el documento. |
| `GET` | `/doc/{docId}/comments` | Autenticado | Hilos de discusión y retroalimentación pedagógica sobre el documento. |
| `POST`| `/doc/{docId}/comments` | Autenticado | Inserción de nuevo comentario o sugerencia colaborativa. |
| `PATCH`| `/comments/{commentId}/resolve` | Autenticado | Marca un comentario o sugerencia como resuelta. |
| `DELETE`| `/comments/{commentId}` | Autenticado | Eliminación de comentario por su autor o un moderador. |

---

### 3.15. `NotificationsController` (`/api/Admin/notifications`)
Centro de notificaciones institucionales e in-app alerts.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/my` | Autenticado | Consulta de notificaciones del usuario autenticado con límite configurable. |
| `PATCH`| `/{uuid}/read` | Autenticado | Marca una notificación individual como leída. |
| `POST`| `/mark-all-read` | Autenticado | Marca todas las notificaciones del usuario como leídas. |
| `DELETE`| `/{uuid}` | Autenticado | Elimina una notificación individual del buzón del usuario. |
| `DELETE`| `/clear-read` | Autenticado | Purga todas las notificaciones leídas del buzón. |

---

### 3.16. `EmailEngineController` (`/api/Admin/email-engine`)
Administración de plantillas y despacho de correos electrónicos transaccionales.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/templates` | Autenticado | Catálogo de plantillas de correo electrónico activas. |
| `GET` | `/templates/{id}` | Autenticado | Consulta de plantilla de correo por ID. |
| `POST`| `/templates` | Autenticado | Creación de nueva plantilla de correo HTML institucional. |
| `PUT` | `/templates/{id}` | Autenticado | Actualización de contenido y variables de la plantilla de correo. |
| `DELETE`| `/templates/{id}` | Autenticado | Eliminación de plantilla de correo institucional. |
| `GET` | `/history` | Autenticado | Historial de envíos con estados (`Pendiente`, `Enviado`, `Fallido`). |
| `POST`| `/send` | Autenticado | Envío transaccional de correo con adjuntos y reemplazo de variables. |

---

### 3.17. `CalendarioController` (`/api/calendario`)
Planificación académica, hitos lectivos y sincronización de calendario institucional con control de visibilidad curricular por rol (RBAC: `DOSIER_DOCENTE`, `DOSIER_COORD_CARRERA`, `DOSIER_COORD_ACAD`, `DOSIER_VICERRECTOR`, `DOSIER_ADMIN`).

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/eventos` | Autenticado | Retorna agregación de eventos institucionales y curriculares según el rol del usuario autenticado. |
| `POST`| `/normativos` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Publica una directiva o hito normativo institucional (CACES, fechas límite) con segmentación por `roles_visibles`. |
| `PUT` | `/normativos/{uuid}` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Modifica una directiva o hito normativo existente. |
| `DELETE`| `/normativos/{uuid}` | `DOSIER_ADMIN, DOSIER_COORD_ACAD, DOSIER_VICERRECTOR` | Elimina lógicamente una directiva institucional. |
| `GET` | `/normativos` | Autenticado | Lista las directivas normativas institucionales activas. |
| `GET` | `/usuario/notas` | Autenticado | Consulta las notas rápidas y tareas pendientes del usuario (Inbox personal). |
| `POST`| `/usuario/eventos` | Autenticado | Registra una tarea o evento personal en la agenda del docente. |
| `PUT` | `/usuario/eventos/{uuid}`| Autenticado | Actualiza una tarea o evento personal existente. |
| `DELETE`| `/usuario/eventos/{uuid}`| Autenticado | Elimina una tarea o evento personal. |
| `PATCH`| `/usuario/eventos/{uuid}/inbox` | Autenticado | Devuelve un evento programado al estado de nota adhesiva en Inbox. |
| `PATCH`| `/usuario/notas/reordenar` | Autenticado | Actualiza el ordenamiento secuencial de notas en la bandeja. |

---

### 3.18. `ReportsController` (`/api/reports`)
Tableros analíticos y paquetes de evidencias para acreditación CACES 2026.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/analiticas` | `DOSIER_ADMIN, DOSIER_VICERRECTOR, DOSIER_COORD_ACAD, DOSIER_COORD_CARRERA` | Reporte consolidado de cobertura curricular por período y carrera. |
| `GET` | `/caces-preview` | `DOSIER_ADMIN` | Previsualización de indicadores de acreditación CACES. |
| `GET` | `/caces-package` | `DOSIER_ADMIN` | Generación del paquete PDF unificado de evidencias institucionales. |
| `GET` | `/caces-coverage` | `DOSIER_ADMIN` | Matriz porcentual de cobertura de PEAs aprobados y firmados. |
| `GET` | `/distributivo-cruce` | `DOSIER_ADMIN` | Cruce distributivo entre asignaciones SIGAFI y PEAs elaborados. |

---

### 3.19. `FeedbackController` (`/api/feedback`)
Gestión institucional de incidencias técnicas, reportes de bugs, sugerencias y solicitudes de mejora.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/config` | Autenticado | Obtiene la configuración de soporte (número y disponibilidad de WhatsApp de soporte técnico). |
| `GET` | `/attachments/{yearMonth}/{fileName}` | Autenticado | Descarga o previsualiza archivos adjuntos de reportes verificando acceso institucional. |
| `POST`| `/` | Autenticado (`[FromForm]`) | Crea un nuevo reporte de incidencia con adjuntos opcionales y metadata del cliente. Notifica a administradores. |
| `GET` | `/my` | Autenticado | Lista las incidencias registradas por el usuario autenticado con conteo de respuestas no leídas. |
| `GET` | `/` | `DOSIER_ADMIN` | Bandeja maestra de administración con filtros por tipo, estado y búsqueda de texto. |
| `PATCH`| `/{id:int}/status` | `DOSIER_ADMIN` | Actualiza el estado del reporte (`Pendiente`, `En Revisión`, `Resuelto`, `Descartado`) y notifica al autor. |
| `PUT` | `/{id:int}` | Autenticado | Edita el título o descripción de una incidencia mientras permanezca en estado `Pendiente`. |
| `POST`| `/{id:int}/messages` | Autenticado | Envía una nueva respuesta al hilo de conversación del ticket y emite notificación al interlocutor. |
| `DELETE`| `/{id:int}` | Autenticado | Elimina el reporte si pertenece al usuario (en `Pendiente`) o con privilegios de `DOSIER_ADMIN`. |

---

### 3.20. `RecycleBinController` (`/api/recyclebin`)
Papelera de reciclaje lógica y recuperación de registros eliminados.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects` | Autenticado | Lista elementos curriculares eliminados lógicamente disponibles para restauración. |
| `POST`| `/projects/{uuid}/restore` | Autenticado | Restaura un instrumento curricular y reconstruye sus dependencias. |
| `DELETE`| `/projects/{uuid}/permanent`| `DOSIER_ADMIN` | Eliminación definitiva (*Hard Delete*) de un registro tras período de gracia. |

---

### 3.21. `StorageController` (`/api/storage`)
Despacho de archivos estáticos, evidencias y firmas institucionales.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/{*filePath}` | Público / Autenticado | Descarga de recursos estáticos (imágenes de canvas, evidencias y anexos) con resolución automática de MIME Type. |

---

### 3.22. `HealthController` (`/api/health`) y Endpoint `/api/ping`
Comprobación de estado y disponibilidad del servicio API.

* `HealthController`: `GET /api/health` retorna `{ "status": "online", "timestamp": "..." }`.
* Endpoint Mapeado en `Program.cs`: `GET /api/ping` retorna `{ "status": "healthy", "timestamp": "..." }` para health checks de balanceadores de carga y Cloudflare.

---

## 4. Endpoints de WebSockets SignalR

El backend expone 2 hubs de SignalR configurados en `Program.cs`:

* **`CollaborationHub` (`/hubs/collaboration`):**
  * Orquesta la co-redacción concurrente y transmisión de deltas CRDT de Yjs con compresión binaria GZip (límite de mensaje ampliado a 2 MB).
  * Transmite presencia remota de cursores y bloqueos suaves de sección.
* **`NotificationHub` (`/hubs/notifications`):**
  * Despacha eventos transaccionales en tiempo real hacia el cliente React (`dosier-projects-changed`, `dosier-emails-changed`, `dosier-activity-updated`).

---

## 5. Estrategia de Rendimiento y Caché en Memoria (`IMemoryCache`)

Para prevenir cuellos de botella en la frontera SIGAFI y garantizar tiempos de respuesta sub-100ms para todos los roles:
* **Consulta Idempotente de Bandeja (`/api/pea/bandeja`):** Desacoplada de sincronizaciones masivas bloqueantes. La consulta opera en modo de lectura pura y enriquecimiento por lotes.
* **Resolución de Períodos Institucionales (`PeriodoInstitucionalResolver`):** Almacenamiento en caché en memoria (`IMemoryCache`) de los períodos oficiales del instituto durante 10 minutos, eliminando joins cruzados repetitivos contra tablas de asignaciones históricas de SIGAFI.
* **Catálogo de Carreras Institucionales (`CatalogsService`):** Almacenamiento en caché en memoria durante 30 minutos para el listado de carreras (`esInstituto = 1`).
