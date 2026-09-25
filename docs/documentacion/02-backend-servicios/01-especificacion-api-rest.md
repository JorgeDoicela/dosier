# Especificación Técnica de API REST y Enlace de Datos (API-Frontend Binding)

La API REST de **DOSIER** (`dosier_api`) está construida sobre **ASP.NET Core 8.0**, proporcionando el conjunto completo de servicios web consumidos por la aplicación web institucional SPA (`dosier_web`).

El sistema expone **23 controladores especializados** que orquestan los casos de uso curriculares, motores documentales, validaciones normativas, seguridad RBAC, criptografía, colaboración concurrente y gestión integral de incidencias.

---

## 2. Convenciones Globales de Comunicación

### 2.1. Política de Nombres de Claves: `snake_case`
El backend tiene configurada la directiva global `JsonNamingPolicy.SnakeCaseLower` en `Program.cs`. Todas las solicitudes y respuestas JSON intercambiadas a través del cuerpo HTTP (`[FromBody]`) utilizan exclusivamente nombres de campo en **`snake_case`**.

Ejemplo de payload para guardado del PEA:
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

### 2.2. Parámetros de Consulta (`[FromQuery]`) y Cabeceras
* Los parámetros de consulta en URL se reciben en formato **`camelCase`** (ej. `?idAsignatura=45&idPeriodo=ABR2026`).
* Las autorizaciones se transmiten vía encabezado `Authorization: Bearer <jwt_token>` o mediante la cookie segura `dosier_auth`.

---

## 3. Catálogo Exhaustivo de los 23 Controladores REST

Los 23 controladores de la API operan bajo el estándar estricto de **Clean Architecture pura**. Ningún controlador inyecta directamente el contexto de base de datos (`DosierContext`) ni formula consultas LINQ contra la persistencia; todos los controladores delegan exclusivamente en fachadas e interfaces de servicio tipadas en `dosier_application` e implementadas en `dosier_infrastructure`.

A continuación se detalla la especificación técnica de cada uno de los controladores del backend:

```
Controladores del Backend DOSIER:
|-- Subsistema Curricular:
|   |-- 1. PeaController (/api/pea)
|   |-- 2. DocenteAsignaturasController (/api/docente-asignaturas)
|   |-- 3. ExpedientesController (/api/expedientes-curriculares)
|   |-- 4. NormativasController (/api/normativas)
|   |-- 5. CurriculumCatalogController (/api/curriculum)
|   `-- 6. CatalogsController (/api/catalogs)
|-- Subsistema de Motor Documental y Criptografía:
|   |-- 7. DocumentInstancesController (/api/documents/instances)
|   |-- 8. DocumentTemplatesController (/api/admin/templates)
|   |-- 9. DocumentsController (/api/documents)
|   `-- 10. SignaturesController (/api/signatures)
|-- Subsistema de Seguridad, Identidad y Gobernanza:
|   |-- 11. AuthController (/api/auth)
|   |-- 12. AdminController (/api/admin)
|   `-- 13. LopdpController (/api/lopdp)
|-- Subsistema de Colaboración:
|   `-- 14. CollaborationController (/api/collaboration)
|-- Subsistema de Comunicación, Soporte y Analítica:
|   |-- 15. NotificationsController (/api/Admin/notifications)
|   |-- 16. EmailEngineController (/api/Admin/email-engine)
|   |-- 17. CalendarioController (/api/calendario)
|   |-- 18. ReportsController (/api/reports)
|   `-- 19. FeedbackController (/api/feedback)
`-- Subsistema de Mantenimiento y Utilidades:
    |-- 20. RecycleBinController (/api/recyclebin)
    |-- 21. StorageController (/api/storage)
    |-- 22. HealthController (/api/health)
    `-- 23. Endpoint Mínimo Ping (/api/ping)
```

---

### 3.1. `PeaController` (`/api/pea`)
Controlador central para la elaboración, edición, validación de horas, circuito colegiado de firmas y observaciones del PEA institucional.

| Método | Ruta | Autorización | Descripción y Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/{id:int}` | Autenticado | Obtiene un PEA por su ID primario, incluyendo todas sus 11 secciones estructuradas. |
| `GET` | `/uuid/{uuid}` | Autenticado | Obtiene un PEA por su UUID único. |
| `GET` | `/buscar` | Autenticado | Busca PEA por `idAsignatura` e `idPeriodo`. |
| `GET` | `/bandeja` | Autenticado | Bandeja de supervisión curricular filtrada por `idPeriodo`, `idCarrera`, `estado`. Calcula firmas completadas. |
| `POST`| `/` | Autenticado | Guarda o actualiza incrementalmente las secciones del PEA. Valida balance de horas. |
| `POST`| `/desde-asignacion/{idAsignacion:int}` | Autenticado | Instancia un nuevo PEA a partir de la asignación docente oficial de SIGAFI. |
| `PATCH`| `/{id}/estado` | `DOSIER_ADMIN` | Modificación forzada de estado administrativo. |
| `POST`| `/{id:int}/firmar` | Autenticado | Firma electrónica oficial del PEA (HMAC o PKCS#12) según la fase colegiada del usuario. |
| `POST`| `/{id}/clonar` | Admin / Docente / Coord | Clona el PEA hacia un nuevo período lectivo (`?nuevoPeriodo=...`). |
| `GET` | `/{id:int}/observaciones` | Autenticado | Lista las observaciones registradas durante la revisión. |
| `POST`| `/{id:int}/observaciones` | Coordinadores / Vicerrector | Registra una nueva observación formal sobre una sección pedagógica. |
| `PATCH`| `/observaciones/{idObs:int}/subsanar` | Docente / Admin | Subsanación de la observación por parte del docente con su respuesta formal. |
| `GET` | `/{id:int}/trazabilidad` | Autenticado | Historial inmutable de cambios de estado y hashes SHA-256. |

---

### 3.2. `DocenteAsignaturasController` (`/api/docente-asignaturas`)
Frontera de integración de solo lectura con las asignaciones académicas de SIGAFI.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/contexto/{idAsignacion:int}` | Autenticado | Resuelve el contexto curricular oficial de la materia asignada (horas, créditos, prerrequisitos). |
| `GET` | `/periodo-activo` | Autenticado | Retorna el período académico activo institucional de SIGAFI. |
| `GET` | `/periodos` | Autenticado | Lista los períodos académicos disponibles. |
| `GET` | `/mis-asignaturas` | Autenticado | Retorna las materias asignadas al docente autenticado con el estado actual de su PEA. |
| `GET` | `/curriculo` | Autenticado | Información detallada de una asignatura y carrera (`idAsignatura`, `idCarrera`). |

---

### 3.3. `ExpedientesController` (`/api/expedientes-curriculares`)
Gestión del Expediente Curricular Maestro por Asignatura y Período.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/{id:int}` | Autenticado | Consulta básica de expediente curricular por ID. |
| `GET` | `/{id:int}/detalle` | Autenticado | Expediente consolidado con proyecto de carrera CES, modelo educativo y matriz de tributación. |
| `GET` | `/asignacion/{idAsignacion:int}` | Autenticado | Obtiene el expediente vinculado a una asignación docente. |
| `GET` | `/periodo/{idPeriodo}` | Autenticado | Lista expedientes curriculares por período y carrera opcional. |
| `POST`| `/asegurar/asignacion/{idAsignacion:int}` | Autenticado | Obtiene o crea automáticamente el expediente curricular maestro para la cátedra. |

---

### 3.4. `NormativasController` (`/api/normativas`)
Repositorio inalterable de normativas externas y catálogos curriculares.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Autenticado | Lista normativas vigentes (CES, CACES, SENESCYT). |
| `GET` | `/checklist` | Autenticado | Checklist de artículos normativos para validación pedagógica del PEA. |
| `GET` | `/modelo-educativo` | Autenticado | Versión oficial del Modelo Educativo Institucional vigente. |
| `GET` | `/perfil-egreso` | Autenticado | Perfil de egreso formal por carrera y malla (`idCarrera`, `idMalla`). |
| `GET` | `/tributacion-asignatura`| Autenticado | Matriz de articulación curricular entre asignatura y resultados del perfil. |
| `GET` | `/proyecto-curricular` | Autenticado | Proyecto curricular aprobado por el CES para la carrera. |

---

### 3.5. `CurriculumCatalogController` (`/api/curriculum`)
Catálogos académicos filtrados para la elaboración del PEA.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/carreras` | Autenticado | Carreras institucionales asociadas al docente en el período. |
| `GET` | `/asignaturas` | Autenticado | Asignaturas de la malla curricular por carrera y profesor. |
| `GET` | `/periodos` | Autenticado | Lista de períodos académicos para selección en filtros. |

---

### 3.6. `CatalogsController` (`/api/catalogs`)
Catálogos institucionales maestros y configuraciones del sistema.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/config-general` | Público / Autenticado | Parámetros de configuración general del instituto (prefijos). |
| `GET` | `/carreras` | Público / Autenticado | Catálogo de carreras institucionales del ISTPET (`esInstituto = 1`). |
| `GET` | `/mi-carrera` | Autenticado | Determina la carrera oficial del usuario en el período activo. |

---

### 3.7. `DocumentInstancesController` (`/api/documents/instances`)
Orquestación de instancias documentales generadas, snapshots forenses y mantenimiento.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `POST`| `/` | Autenticado | Crea una nueva instancia documental para una entidad y plantilla. |
| `GET` | `/{uuid}` | Autenticado | Consulta la instancia documental por UUID. |
| `GET` | `/entity/{entityUuid}` | Autenticado | Lista instancias vinculadas a una entidad (ej. PEA o proyecto). |
| `GET` | `/resolve` | Autenticado | Busca o crea atómicamente la instancia para `(entityUuid, templateCode)`. |
| `PATCH`| `/{uuid}/metadata` | Autenticado | Guarda snapshots de metadatos colaborativos para renderizado. |
| `POST`| `/{uuid}/finalize` | Autenticado | Finaliza el documento, bloqueando edición y registrando hash SHA-256. |
| `POST`| `/{uuid}/upgrade-template` | Autenticado | Actualiza la instancia a la última versión de la plantilla base. |
| `GET` | `/templates/{code}/ui-config` | Autenticado | Retorna la configuración dinámica de interfaz (Metadata-Driven UI). |
| `GET` | `/{uuid}/ui-config` | Autenticado | Configuración de UI preservando el snapshot histórico de la instancia. |
| `GET` | `/maintenance/obsolete-diagnosis` | `DOSIER_ADMIN` | Diagnóstico de documentos generados con plantillas obsoletas. |
| `DELETE`| `/maintenance/purge-file/{uuid}` | `DOSIER_ADMIN` | Purga física de un PDF obsoleto preservando la trazabilidad. |
| `POST`| `/maintenance/purge-all-obsolete` | `DOSIER_ADMIN` | Purga masiva de binarios obsoletos del servidor. |

---

### 3.8. `DocumentTemplatesController` (`/api/admin/templates`)
Administración y diseño de plantillas HTML institucionales en base de datos.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Autenticado | Lista todas las plantillas institucionales activas. |
| `GET` | `/{code}` | Autenticado | Detalle y código HTML/Scriban de una plantilla por código. |
| `PUT` | `/{code}` | `DOSIER_ADMIN` | Actualiza el marcado HTML, CSS y campos colaborativos de una plantilla. |
| `POST`| `/{code}/reset` | `DOSIER_ADMIN` | Restablece la plantilla a sus archivos oficiales de fábrica. |
| `PUT` | `/{code}/signature-config` | `DOSIER_ADMIN` | Modifica los requisitos de firma (DOSIER, ECUADOR_P12, HIBRIDO). |
| `PUT` | `/{code}/theme-config` | `DOSIER_ADMIN` | Configuración Schema-Driven de tematización sin alterar HTML. |
| `POST`| `/order` | `DOSIER_ADMIN` | Guarda el orden visual de presentación de plantillas en la UI. |
| `GET` | `/categories` | Autenticado | Catálogo de categorías documentales CACES/Institucionales. |

---

### 3.9. `DocumentsController` (`/api/documents`)
Motor documental agnóstico de renderizado PDF y validación pública.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `POST`| `/render` | Autenticado | Renderizado universal de cualquier DTO a PDF con marca de agua o doble ciego. |
| `GET` | `/templates` | Autenticado | Catálogo de plantillas disponibles. |
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
| `PUT` | `/profile` | Autenticado | Guarda o actualiza el trazo vectorial y datos del firmante. |
| `POST`| `/sign` | Autenticado | Firma institucional con re-autenticación de contraseña (HMAC-SHA256 y DFRM). |
| `POST`| `/sign-p12` | Autenticado | Firma electrónica con certificado calificado del Ecuador (`.p12`). |
| `GET` | `/document/{documentoUuid}` | Autenticado | Lista todas las firmas estampadas en un documento. |
| `GET` | `/verify/{firmaCode}` | **Público (Anónimo)** | Verificación de validez de una firma sin requerir inicio de sesión. |
| `POST`| `/revoke` | Autenticado | Revocación formal de una firma por el autor o un administrador. |

---

### 3.11. `AuthController` (`/api/auth`)
Gestión de autenticación, JIT provisioning, SSO Microsoft, Magic Links y recuperación.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `POST`| `/login` | **Público** | Autenticación con usuario/contraseña, emitiendo JWT y cookie `dosier_auth`. |
| `POST`| `/microsoft-login` | **Público** | Inicio de sesión federado mediante token de Microsoft Entra ID. |
| `POST`| `/magic-login` | **Público** | Consumo de enlace temporal firmado para acceso directo sin contraseña. |
| `POST`| `/magic-login/handoff` | **Público** | Validación de PIN temporal para traspaso de sesión entre estaciones. |
| `POST`| `/magic-login/resend` | **Público** | Reenvío de enlace mágico a correo institucional. |
| `POST`| `/password-recovery/request` | **Público** | Solicitud de recuperación de contraseña con respuesta anti-enumeración. |
| `POST`| `/password-recovery/validate`| **Público** | Validación de token de recuperación. |
| `POST`| `/password-recovery/reset` | **Público** | Establecimiento de nueva contraseña mediante token. |
| `POST`| `/password-recovery/revert-suspicious` | **Público** | Reversión de emergencia ante cambio de credenciales sospechoso. |
| `POST`| `/change-password` | Autenticado | Cambio de contraseña voluntario por parte del usuario. |
| `GET` | `/profile` | Autenticado | Ficha completa del perfil autenticado con roles y permisos curriculares. |
| `POST`| `/logout` | Autenticado | Invalida la sesión y borra la cookie `dosier_auth`. |
| `POST`| `/refresh-token` | **Público** | Renovación de access token mediante refresh token. |
| `GET` | `/verify-session` | Autenticado | Comprobación de vigencia del token JWT. |

---

### 3.12. `AdminController` (`/api/admin`)
Panel de control administrativo institucional (`DOSIER_ADMIN`).

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | `DOSIER_ADMIN` | Gestión paginada de docentes, directivos, administrativos y estudiantes con filtros de carga docente (`soloConHoras`), horas de investigación (`soloConInvestigacion`) y departamento. |
| `GET` | `/roles` | `DOSIER_ADMIN` | Catálogo de roles curriculares institucionales. |
| `GET` | `/departments` | `DOSIER_ADMIN` | Departamentos y áreas académicas. |
| `GET` | `/metadata/{uuid}` | `DOSIER_ADMIN` | Metadatos de perfil extendido de un usuario. |
| `PUT` | `/metadata/{uuid}` | `DOSIER_ADMIN` | Actualización de perfil administrativo. |
| `POST`| `/assign-role` | `DOSIER_ADMIN` | Asignación de rol curricular RBAC a un usuario. |
| `POST`| `/remove-role` | `DOSIER_ADMIN` | Revocación de rol curricular. |
| `GET` | `/audit-logs` | `DOSIER_ADMIN` | Bitácora inmutable de auditoría con deltas JSON (`values_before`, `values_after`). |
| `GET` | `/backups` | `DOSIER_ADMIN` | Historial de copias de seguridad del sistema. |
| `GET` | `/backups/disk-info` | `DOSIER_ADMIN` | Obtiene métricas físicas de almacenamiento y espacio libre en disco del servidor. |
| `POST`| `/backups/trigger` | `DOSIER_ADMIN` | Ejecución asíncrona e inmediata de respaldo integral (base de datos + archivos). |
| `GET` | `/backups/download/{uuid}` | `DOSIER_ADMIN` | Descarga el archivo físico comprimido de respaldo por su UUID. |
| `POST`| `/backups/verify/{uuid}` | `DOSIER_ADMIN` | Verificación en vivo de integridad criptográfica SHA-256 contra el hash registrado. |
| `DELETE`| `/backups/{uuid}` | `DOSIER_ADMIN` | Purga y eliminación definitiva del archivo físico y registro de respaldo. |

---

### 3.13. `LopdpController` (`/api/lopdp`)
Gestión de cumplimiento de la Ley Orgánica de Protección de Datos Personales.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `POST`| `/consentimiento` | Autenticado | Registro de consentimiento informado con versión de política, IP y agente. |
| `GET` | `/consentimientos` | `DOSIER_ADMIN` | Auditoría de consentimientos otorgados por la comunidad institucional. |
| `POST`| `/solicitud-arco` | Autenticado | Registro de solicitudes de derechos ARCO (Acceso, Rectificación, etc.). |
| `GET` | `/solicitudes-arco` | `DOSIER_ADMIN` | Bandeja de seguimiento de solicitudes ARCO con alerta de plazos legales. |
| `POST`| `/solicitud-arco/resolver` | `DOSIER_ADMIN` | Resolución formal de solicitud ARCO con adjunto de evidencia. |
| `GET` | `/perfil` | Autenticado | Estado del consentimiento LOPDP del usuario autenticado. |
| `PATCH`| `/perfil` | Autenticado | Actualización de preferencias de consentimiento y firmas. |

---

### 3.14. `CollaborationController` (`/api/collaboration`)
Coordinación previa y control de sesiones del editor colaborativo CoWork.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `POST`| `/upload` | Autenticado | Carga de imágenes insertadas en el editor colaborativo para evitar Base64. |
| `GET` | `/doc/{docId}` | Autenticado | Estado inicial y snapshot del documento colaborativo antes del handshake WebSocket. |
| `POST`| `/doc/{docId}/lock` | Autenticado | Adquisición de bloqueo suave sobre una sección pedagógica del PEA. |
| `POST`| `/doc/{docId}/unlock` | Autenticado | Liberación de bloqueo sobre la sección. |
| `GET` | `/doc/{docId}/active-users` | Autenticado | Lista de usuarios actualmente concurrentes en el documento. |
| `GET` | `/doc/{docId}/comments` | Autenticado | Hilos de comentarios y debates pedagógicos sobre el documento. |
| `POST`| `/doc/{docId}/comments` | Autenticado | Inserción de nuevo comentario colaborativo. |
| `PATCH`| `/comments/{commentId}/resolve` | Autenticado | Marca un comentario o sugerencia como resuelta. |
| `DELETE`| `/comments/{commentId}` | Autenticado | Eliminación de comentario por su autor o moderador. |

---

### 3.15. `NotificationsController` (`/api/Admin/notifications`)
Centro de notificaciones institucionales e in-app alerts.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/my` | Autenticado | Consulta de notificaciones del usuario autenticado con límite configurable. |
| `PATCH`| `/{uuid}/read` | Autenticado | Marca una notificación individual como leída. |
| `POST`| `/mark-all-read` | Autenticado | Marca todas las notificaciones del usuario como leídas. |
| `DELETE`| `/{uuid}` | Autenticado | Elimina una notificación del buzón del usuario. |
| `DELETE`| `/clear-read` | Autenticado | Purga todas las notificaciones leídas del buzón. |
| `POST`| `/subscribe` | Autenticado | Suscripción de token de dispositivo WebPush para notificaciones push web. |
| `POST`| `/unsubscribe` | Autenticado | Desuscripción de token de dispositivo. |

---

### 3.16. `EmailEngineController` (`/api/Admin/email-engine`)
Administración de plantillas y despacho de correos electrónicos transaccionales.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/templates` | Autenticado | Catálogo de plantillas de correo electrónico activas. |
| `GET` | `/templates/{id}` | Autenticado | Consulta de plantilla de correo por ID. |
| `POST`| `/templates` | Autenticado | Creación de nueva plantilla de correo HTML institucional. |
| `PUT` | `/templates/{id}` | Autenticado | Actualización de contenido y variables de la plantilla de correo. |
| `DELETE`| `/templates/{id}` | Autenticado | Eliminación de plantilla de correo. |
| `GET` | `/history` | Autenticado | Historial de envíos con estados (`Pendiente`, `Enviado`, `Fallido`). |
| `POST`| `/send` | Autenticado | Envío transaccional de correo con adjuntos y reemplazo de variables. |

---

### 3.17. `CalendarioController` (`/api/calendario`)
Planificación académica, hitos lectivos y sincronización de calendario institucional con soporte a eventos del PEA.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/eventos` | Autenticado | Lista eventos normativos y fechas límites de revisión del PEA por rango de fechas. |
| `GET` | `/feed` | **Público (Token iCal)** | Feed iCalendar `.ics` para sincronización con Outlook, Google Calendar o Apple Calendar. |
| `POST`| `/ical/token` | Autenticado | Genera o renueva el token privado de sincronización iCal del docente. |
| `DELETE`| `/ical/token` | Autenticado | Revoca el token privado iCal del usuario. |

---

### 3.18. `ReportsController` (`/api/reports`)
Tableros analíticos y paquetes de evidencias para acreditación CACES 2026.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/analiticas` | `DOSIER_ADMIN` | Reporte consolidado de cobertura curricular por período y carrera. |
| `GET` | `/caces-preview` | `DOSIER_ADMIN` | Previsualización de indicadores de acreditación CACES. |
| `GET` | `/caces-package` | `DOSIER_ADMIN` | Generación del paquete PDF unificado de evidencias institucionales. |
| `GET` | `/caces-coverage` | `DOSIER_ADMIN` | Matriz porcentual de cobertura de PEAs aprobados y firmados. |
| `GET` | `/distributivo-cruce` | `DOSIER_ADMIN` | Cruce distributivo entre asignaciones SIGAFI y PEAs elaborados. |

---

### 3.19. `FeedbackController` (`/api/feedback`)
Gestión institucional de incidencias técnicas, reportes de bugs, sugerencias y solicitudes de mejora. Incluye carga controlada de archivos adjuntos (imágenes hasta 5MB y videos hasta 15MB), hilo interactivo de mensajes bidireccionales entre usuarios y administradores, integración con notificaciones del sistema e identificación de entorno y navegador.

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
| `DELETE`| `/projects/{uuid}/permanent`| `DOSIER_ADMIN` | Eliminación definitiva (Hard Delete) de un registro tras período de gracia. |

---

### 3.21. `StorageController` (`/api/storage`)
Despacho de archivos estáticos, evidencias y firmas institucionales.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/{*filePath}` | Público / Autenticado | Descarga de recursos estáticos (imágenes de canvas, evidencias y anexos) con resolución automática de MIME Type. |

---

### 3.22. `HealthController` (`/api/health`)
Comprobación de estado y disponibilidad del servicio API.

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | **Público** | Retorna estado del servicio `{ "status": "online", "timestamp": "..." }`. |

---

### 3.23. Endpoint Mínimo `/api/ping`
Ruta mapeada en `Program.cs` para chequeos de salud de balanceadores de carga y proxies:
* **Método:** `GET`
* **Ruta:** `/api/ping`
* **Autenticación:** Ninguna (Acceso abierto).
* **Respuesta:** `{ "status": "healthy", "timestamp": "..." }`.

