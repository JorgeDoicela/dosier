# Suite de Pruebas Unitarias, Integración y Aseguramiento de Calidad

## 1. Visión General del Proyecto de Pruebas (`dosier_tests`)

El aseguramiento de la calidad del backend reside en el proyecto `backend/dosier_tests/` (`dosier_tests.csproj`), ejecutado sobre el marco **xUnit**, la biblioteca de simulación de dependencias **Moq** y el proveedor en memoria de Entity Framework Core (`Microsoft.EntityFrameworkCore.InMemory`).

El objetivo primordial de esta suite consiste en verificar de forma automatizada, determinista e innegociable:
1. El cumplimiento del Artículo 21 del Reglamento de Régimen Académico (RRA) del CES (balance exacto de horas: $\text{CD} + \text{APE} + \text{TA} = \text{Total Asignatura}$, créditos $\times 48\text{h}$).
2. El avance riguroso del circuito colegiado de firmas digitales (Ley de Comercio Electrónico y Firmas Digitales - Ley 67 del Ecuador).
3. La inmutabilidad de los instrumentos curriculares aprobados (*State Locking*).
4. El protocolo de reapertura, anulación de avales y revocación forense de firmas ante dictamen de observaciones.
5. El aislamiento institucional y unicidad del período lectivo activo en la frontera de solo lectura con SIGAFI.
6. La seguridad criptográfica de credenciales (BCrypt), tokens JWT y autorización basada en políticas de permisos (PBAC).

---

## 2. Estructura del Proyecto y Métricas de Cobertura

El proyecto `backend/dosier_tests/` alberga **80 pruebas automatizadas** organizadas en 12 clases de prueba distribuidas en 6 áreas temáticas funcionales:

```text
backend/dosier_tests/
├── Academico/       # Frontera institucional y resolución de períodos SIGAFI
│   └── PeriodoInstitucionalResolverTests.cs
├── Calendario/      # Planificación académica, alertas y notas rápidas
│   └── CalendarioServiceTests.cs
├── Controllers/     # Controladores REST institucionales
│   ├── CatalogsControllerTests.cs
│   └── LopdpControllerTests.cs
├── Curriculum/      # Núcleo curricular, workflow colegiado, IA y sincronización
│   ├── PeaFirmaTests.cs
│   ├── PeaAiAssistantServiceTests.cs
│   └── PeaSyncTests.cs
├── Middleware/      # Pipeline HTTP y transformación de excepciones a JSON
│   └── ExceptionMiddlewareTests.cs
└── Security/        # Criptografía, autenticación, RBAC y copias de seguridad
    ├── AuthServiceTests.cs
    ├── BackupAdminServiceTests.cs
    ├── RbacServiceTests.cs
    └── TokenServiceTests.cs
```

Adicionalmente, el frontend (`dosier_web`) cuenta con **26 archivos de prueba y 328 pruebas unitarias e integradas (100% aprobadas en CI)** ejecutadas sobre el motor **Vitest**, asegurando una verificación integral de punta a punta en la arquitectura.

---

## 3. Especificación Detallada de Suites de Prueba por Área Temática

### 3.1. Núcleo Curricular, Workflow Colegiado y Firmas (`Curriculum/`)

#### `PeaFirmaTests.cs` (Circuito de Firmas y Gobernanza Curricular)
Evalúa las reglas de avance de la máquina de estados y las restricciones del marco legal:
* **`FirmarDocente_Exitoso_CambiaEstadoAEnRevision`:** Valida que la firma de elaboración del docente titular genere el código de trazabilidad institucional DFRM, registre el evento cronológico en `doc_pea_trazabilidad` y transicione el estado de `Borrador` a `EnRevision`.
* **`FirmarDocente_ConObservacionesPendientes_LanzaExcepcion`:** Comprueba la regla bloqueante que prohíbe re-enviar a revisión un instrumento microcurricular si mantiene observaciones pendientes de atención.
* **`EmitirAvalCarrera_UsuarioNoEsCoordinador_RetornaUnauthorized`:** Verifica la restricción RBAC que impide que un docente sin rol `DOSIER_COORD_CARRERA` emita el aval técnico disciplinar.
* **`EmitirAvalCarrera_Exitoso_CambiaEstadoARevisadoCoord`:** Comprueba la suscripción del Coordinador de Carrera y la transición al estado `RevisadoCoord`.
* **`EmitirAvalAcademico_Exitoso_CambiaEstadoARevisadoAcad`:** Valida la firma de Coordinación Académica General y la transición a `RevisadoAcad`.
* **`LegalizarVicerrector_Exitoso_CongelaDocumentoYAprobado`:** Valida la fase terminal: la firma de Vicerrectorado legaliza el PEA, genera el código DFRM definitivo, calcula el hash SHA-256 final, transiciona al estado `Aprobado` y activa el bloqueo inmutable permanente (*State Locking*).
* **`ModificarPea_EnEstadoAprobado_BloqueadoPorStateLocking`:** Confirma que cualquier intento de alterar contenidos o unidades en un PEA en estado `Aprobado` sea rechazado mediante excepción de inmutabilidad.

#### `PeaSyncTests.cs` (Sincronización CoWork a Modelo Relacional)
* **`SincronizarMetadataAsync_DebeSincronizarTodosLosCamposDelDocenteExitosamente`:** Valida que el parser defensivo (`SafeParseInt`, `SafeParseDecimal`, `SafeParseString`) procese el JSON semi-estructurado de CoWork (`data_snapshot_json`) y actualice con total precisión las tablas relacionales normalizadas (`doc_pea`, `doc_pea_unidades`, `doc_pea_temas`, `doc_pea_actividades_practicas`, `doc_pea_evaluaciones`, `doc_pea_bibliografia`).
* Verifica la purga previa de dependencias hijas (`doc_pea_temas`) antes de actualizar unidades temáticas para erradicar violaciones de clave foránea.

#### `PeaAiAssistantServiceTests.cs` (Asistencia Cognitiva e IA Curricular)
* Valida la construcción y formateo de prompts pedagógicos adaptados al formato oficial del ISTPET.
* Comprueba el saneamiento automático de bloques de pensamiento interno generados por modelos de razonamiento (`<think>...</think>`).
* Valida la reconciliación matemática obligatoria que fuerza a que las propuestas sugeridas por el asistente de IA se ajusten a las horas exactas de docencia (CD), prácticas (APE) y trabajo autónomo (TA) registradas en SIGAFI.

---

### 3.2. Resolución de Períodos Institucionales (`Academico/`)

#### `PeriodoInstitucionalResolverTests.cs`
Evalúa la Fuente Única de Verdad (SSOT) para la resolución de períodos académicos en la frontera con SIGAFI:
* **`GetPeriodosInstitucionales_GarantizaUnicoActivo_YAislaConduccion`:**
  - **Aislamiento de Conducción:** Verifica que los períodos marcados con `esConduccion = 1` sean rigurosamente excluidos del catálogo.
  - **Invariante de Único Período Activo:** Demuestra que, ante bases de datos heredadas con múltiples registros marcados históricamente como activos, el algoritmo prioriza `periodoactivoinstituto == 1` y garantiza que exactamente un período institucional reporte `EsActivo = true`.
  - **Filtro del Instituto:** Valida que solo se incluyan períodos asociados a carreras con `esInstituto = 1`.

---

### 3.3. Pipeline HTTP y Manejo Global de Excepciones (`Middleware/`)

#### `ExceptionMiddlewareTests.cs`
Verifica la transformación semántica de excepciones de dominio en respuestas JSON tipadas con código HTTP apropiado:
* **`InvokeAsync_ValidationException_Returns400BadRequest`:** Errores de `FluentValidation` generan HTTP 400 con lista detallada de campos y mensajes.
* **`InvokeAsync_KeyNotFoundException_Returns404NotFound`:** Recursos inexistentes retornan HTTP 404 con mensaje estructurado.
* **`InvokeAsync_UnauthorizedAccessException_Returns401Unauthorized`:** Intentos de acceso no autorizados retornan HTTP 401.
* **`InvokeAsync_InvalidOperationException_Returns400BadRequest`:** Transiciones de estado inválidas en el workflow curricular retornan HTTP 400.
* **`InvokeAsync_ArgumentException_Returns400BadRequest`:** Parámetros o identificadores malformados generan HTTP 400.
* **`InvokeAsync_DbUpdateConcurrencyException_Returns409Conflict`:** Conflictos de concurrencia optimista retornan HTTP 409 notificando que el recurso fue modificado por otro usuario.
* **`InvokeAsync_GenericException_Returns500InternalServerError`:** Excepciones no controladas retornan HTTP 500 con sanitización en producción y traza completa solo en ambiente de Desarrollo.

---

### 3.4. Seguridad, Hashing, Criptografía y Respaldos (`Security/`)

#### `AuthServiceTests.cs` (Seguridad de Credenciales)
* **`PasswordService_HashEsDiferenteAlTextoPlano`:** Comprueba que las contraseñas nunca se persistan en texto claro y generen hashes válidos bajo el estándar BCrypt.
* **`PasswordService_VerifyPassword_Correcto_RetornaSuccess`:** Valida la verificación matemática exitosa de credenciales correctas.
* **`PasswordService_DosHashes_SonDiferentes_PeroAmbosValidos`:** Comprueba la generación de sales criptográficos aleatorios para cada invocación, impidiendo ataques basados en tablas arcoíris (*rainbow tables*).

#### `RbacServiceTests.cs` (Aislamiento de Roles por Sistema)
* Valida la evaluación estricta de permisos bajo el identificador de sistema institucional `idSistema = 6` de DOSIER, impidiendo la colisión de permisos con otros aplicativos del campus.

#### `TokenServiceTests.cs` (Criptografía JWT)
* Valida la inyección de claims normativos obligatorios: identificador institucional (`sub`), cédula de identidad, correo institucional, roles RBAC y marca de tiempo UTC de expiración.
* Verifica el rechazo de tokens manipulados, con firmas asimétricas corrompidas o con expiración vencida.

#### `BackupAdminServiceTests.cs` (Telemetría de Respaldos)
* **`GetDiskInfo_RetornaMetricasValidasDelServidor`:** Valida el cálculo de espacio total, espacio libre y porcentaje de uso del volumen de disco donde se almacenan las copias de seguridad de base de datos.

---

### 3.5. Controladores REST (`Controllers/`)

* **`CatalogsControllerTests.cs`:** Valida la respuesta HTTP 200 de los catálogos de carreras del instituto y períodos académicos vigentes.
* **`LopdpControllerTests.cs`:** Comprueba la consulta del término de condiciones vigente (`GET /api/lopdp/termino-vigente`) y el registro seguro de consentimientos informados.

---

### 3.6. Cronograma Institucional y Productividad Docente (`Calendario/`)

#### `CalendarioServiceTests.cs`
* Valida el filtrado de eventos según la visibilidad asignada a roles institucionales (`DOSIER_DOCENTE`, `DOSIER_COORD_CARRERA`, `DOSIER_VICERRECTOR`).
* Comprueba el ordenamiento y persistencia en lote de las notas rápidas no programadas en la bandeja *Inbox* del tablero Kanban.
* Valida la rutina de cálculo de fechas de alerta para el despacho preventivo de correos electrónicos ante plazos CACES inminentes.

---

## 4. Ejecución Automatizada en el Pipeline de Integración Continua (CI/CD)

El archivo de configuración de GitHub Actions (`.github/workflows/deploy.yml`) incorpora la ejecución obligatoria de la suite en la fase de aseguramiento de calidad del backend (`backend-qa`):

```bash
# Comando oficial de ejecución en el Runner de GitHub Actions (Ubuntu)
dotnet test backend/dosier_tests/dosier_tests.csproj \
  --configuration Release \
  --verbosity normal \
  --logger "trx;LogFileName=test_results.trx"
```

El pipeline de integración y despliegue continuo detiene inmediatamente el proceso ante cualquier fallo o aserción no satisfecha, impidiendo la publicación de versiones que comprometan la integridad de los datos microcurriculares o el marco normativo institucional del ISTPET.
