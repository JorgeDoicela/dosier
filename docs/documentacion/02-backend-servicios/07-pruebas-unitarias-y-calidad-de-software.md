# Suite de Pruebas Unitarias, Integración y Aseguramiento de Calidad

## 1. Visión General del Proyecto de Pruebas (`dosier_tests`)

El subsistema de control de calidad del backend reside en el proyecto `backend/dosier_tests/` (`dosier_tests.csproj`), ejecutado sobre el marco **xUnit**, la biblioteca de simulación **Moq** y el proveedor en memoria de **Entity Framework Core** (`Microsoft.EntityFrameworkCore.InMemory`).

El objetivo primordial de esta suite es garantizar de forma automatizada e inviolable:
1. El cumplimiento matemático de la carga horaria del PEA (CES Art. 21).
2. El funcionamiento estricto del circuito colegiado de 4 firmas (Ley 67 del Ecuador).
3. La consistencia criptográfica de las firmas digitales (PKCS#12 y sellos HMAC-SHA256).
4. La seguridad de contraseñas (BCrypt), RBAC y generación de tokens JWT.
5. El aislamiento de datos institucionales de SIGAFI y cumplimiento LOPDP.

---

## 2. Estructura de Directorios de Pruebas

```text
backend/dosier_tests/
├── Controllers/     # Pruebas de controladores REST (CatalogsController, LopdpController)
├── Curriculum/      # Pruebas del núcleo curricular y circuito colegiado de firmas
│   └── PeaFirmaTests.cs
├── Research/        # Pruebas de orquestación de proyectos y calendario académico
│   ├── CalendarioServiceTests.cs
│   ├── ProjectOrchestratorTests.cs
│   ├── ProjectSecurityServiceTests.cs
│   ├── ProjectTeamServiceTests.cs
│   └── ProjectWizardServiceTests.cs
├── Security/        # Pruebas de seguridad, criptografía y autenticación
│   ├── AuthServiceTests.cs
│   ├── RbacServiceTests.cs
│   └── TokenServiceTests.cs
└── UnitTest1.cs     # Pruebas de integración del motor transaccional
```

---

## 3. Especificación Detallada de Suites de Prueba

### 3.1. Núcleo Curricular y Firmas (`Curriculum/PeaFirmaTests.cs`)
Esta suite de pruebas evalúa el comportamiento transaccional del servicio `PeaService`:

* **`FirmarDocente_Exitoso_CambiaEstadoAEnRevision`:**
  * Valida que cuando el docente elaborador firma el PEA mediante HMAC institucional o certificado PKCS#12, el sistema registre el estampado en `doc_documentos_firmas`, actualice la trazabilidad en `doc_pea_trazabilidad` y transicione el estado de `Borrador` a `EnRevision`.
* **`FirmarDocente_ConObservacionesPendientes_LanzaExcepcion`:**
  * Verifica la regla de negocio que prohíbe re-enviar a revisión un PEA si mantiene observaciones disciplinadas o metodológicas sin subsanar (`estado = 'Pendiente'`).
* **`EmitirAvalCarrera_UsuarioNoEsCoordinador_RetornaUnauthorized`:**
  * Comprueba que si un usuario sin el rol `DOSIER_COORD_CARRERA` intenta emitir el aval técnico, la operación sea rechazada tajantemente.
* **`EmitirAvalCarrera_Exitoso_CambiaEstadoARevisadoCoord`:**
  * Valida la firma del coordinador de carrera y la transición a `RevisadoCoord`.
* **`EmitirAvalAcademico_Exitoso_CambiaEstadoARevisadoAcad`:**
  * Valida la firma de la coordinación académica institucional y la transición a `RevisadoAcad`.
* **`LegalizarVicerrector_Exitoso_CongelaDocumentoYAprobado`:**
  * Verifica la última fase del circuito: la firma de Vicerrectorado legaliza el PEA, genera el código DFRM-XXXX, calcula el hash SHA-256 definitivo, cambia el estado a `Aprobado` y activa el bloqueo inmutable (*State Locking*).
* **`ModificarPea_EnEstadoAprobado_BloqueadoPorStateLocking`:**
  * Intenta alterar una unidad o tema en un PEA ya aprobado y confirma que el sistema arroje una excepción de violación de inmutabilidad curricular.

---

### 3.2. Seguridad, Hashing y RBAC (`Security/`)

#### `AuthServiceTests.cs` (Seguridad de Credenciales)
* **`PasswordService_HashEsDiferenteAlTextoPlano`:**
  * Comprueba que la contraseña ingresada nunca se almacene en texto claro y que el resultado cumpla el estándar BCrypt (longitud > 30 caracteres).
* **`PasswordService_VerifyPassword_Correcto_RetornaSuccess`:**
  * Valida la correspondencia matemática de contraseñas correctas.
* **`PasswordService_DosHashes_SonDiferentes_PeroAmbosValidos`:**
  * Comprueba la generación de sales criptográficos dinámicos únicos para cada invocación.

#### `RbacServiceTests.cs` (Control de Acceso Basado en Roles)
* Valida la evaluación estricta de permisos bajo el identificador de sistema institucional `idSistema = 6` de DOSIER, impidiendo la colisión con otros subsistemas de SIGAFI.

#### `TokenServiceTests.cs` (Criptografía JWT)
* Comprueba la inyección de claims obligatorios (`sub`, `cedula`, `email`, roles institucionales, expiración UTC y emisor `dosier.traversari.edu.ec`).
* Verifica el rechazo de tokens manipulados o con firma criptográfica alterada.

---

### 3.3. Proyectos Curriculares y Calendario (`Research/`)

* **`CalendarioServiceTests.cs`:**
  * Valida el cálculo de plazos de entrega, fechas de gracia en prórrogas y la generación estructurada del feed iCalendar `.ics`.
* **`ProjectOrchestratorTests.cs` & `ProjectSecurityServiceTests.cs`:**
  * Valida la vinculación entre proyectos de investigación formativa y el Programa de Estudio de la Asignatura (PEA) correspondiente.

---

## 4. Ejecución Automatizada en el Pipeline CI/CD

El archivo de flujo de trabajo `.github/workflows/deploy.yml` ejecuta automáticamente estas pruebas en la etapa `backend-qa`:

```bash
# Comando ejecutado en GitHub Actions Runner (Ubuntu 22.04)
dotnet test backend/dosier_tests/dosier_tests.csproj --configuration Release --verbosity normal --logger "trx;LogFileName=test_results.trx"
```

El pipeline detiene de inmediato el proceso de despliegue si alguna de las pruebas unitarias o de integración no obtiene un resultado favorable (100% de aserciones exitosas).
