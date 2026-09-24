# Arquitectura Frontend Web (React 18 + Vite + TypeScript)

## 1. Visión General y Nombre Oficial de la Arquitectura

El cliente web de DOSIER (`dosier_web`) adopta la arquitectura **Feature-Based Modular SPA con Service Layer y Container/Presenter en Custom Hooks**. Esta es la definición canónica y estable del frontend; cualquier trabajo nuevo debe seguir este estándar sin excepción.

El stack técnico es:
* **React 18** y **TypeScript 5.x**.
* **Vite** como empaquetador ultrarrápido y servidor de desarrollo local.
* **Tailwind CSS v4** integrado nativamente con variables semánticas en `src/styles/base.css`.
* **Geist Editorial / Enterprise Docs System**: Lenguaje visual sobrio y de alta legibilidad inspirado en Mintlify y GitBook Enterprise, enfocado en tipografía documental **Inter Puro** con variantes tipográficas avanzadas (`cv02`, `cv03`, `cv04`, `cv11`), arquitectura de capas con contraste equilibrado y delimitación estricta de folios curriculares.

La plataforma proporciona a la comunidad académica del Instituto Superior Tecnológico Mayor Pedro Traversari una herramienta profesional para la planificación del Programa de Estudio de la Asignatura (PEA), co-redacción en tiempo real, revisión colegiada por comisiones de carrera, firma electrónica y verificación pública de acreditación.

> [!IMPORTANT]
> **El Motor Documental (`core/documents/`) NO es el centro de la arquitectura.** Es un motor de infraestructura auxiliar — equivalente al motor de colaboración (`core/cowork/`). El centro del negocio es el dominio curricular: el flujo PEA con su ciclo de vida de 4 estados (Borrador → EnRevision → RevisadoCoord → Aprobado). Los motores de `core/` sirven a ese dominio; no lo gobiernan.

---

## 2. Regla Cardinal de Diseño Visual: Cero Transparencias y Fondos 100% Sólidos

Por directriz de diseño institucional y usabilidad técnica, el frontend implementa la siguiente norma obligatoria y no negociable:

> [!IMPORTANT]
> **Prohibición Total de Transparencias en Componentes Flotantes y Superpuestos:**
> Todos los modales, popovers, menús desplegables (`GeistSelect`), selectores de fechas (`GeistDatePicker`), drawers, tooltips y paneles de diálogo deben poseer fondos **100% sólidos y opacos**.
> * Modo Claro: Fondo sólido `bg-white` (`#ffffff`) sobre lienzo documental `#f1f3f6`.
> * Modo Oscuro: Fondo sólido `bg-[#121721]` o `bg-[#0b0e14]`.
> * Queda estrictamente prohibido el uso de clases translúcidas con opacidades intermedias (como `bg-white/80`, `bg-black/60` o `backdrop-blur-md` sin color de fondo pleno) en elementos de interacción, a fin de evitar el sangrado de texto (*text bleed-through*) y la contaminación visual de elementos subyacentes.

---

## 3. Estructura de Directorios del Código Fuente (`src/`)

```text
dosier_web/src/
├── api/             # Instancia de Axios configurada, interceptores JWT y serialización snake_case
├── components/      # Componentes UI reutilizables y modulares
│   ├── Common/      # Modales, GeistSelect, GeistDatePicker, MemberSearchSelector, botones Geist
│   ├── DOSIER/      # Shell curricular, CoWorkField, Stepper de 4 estados, pestañas Secciones A-K
│   │   └── sections/# Componentes individuales para cada sección del PEA oficial
│   └── Layout/      # Header institucional, barra lateral de navegación, pie de página y breadcrumbs
├── context/         # Contextos globales de React (AuthContext, ThemeContext, NotificationContext)
├── hooks/           # Custom React Hooks (useAuth, useCoWork, useSignalR, useDebounce)
├── pages/           # Vistas principales del enrutador de React (App.tsx)
│   ├── Admin/       # Usuarios, Auditoría, Mantenimiento Documental, Plantillas Canvas
│   ├── Analytics/   # Métricas e indicadores de cumplimiento institucional
│   ├── Auth/        # Vistas de autenticación institucional, contraseñas y alertas
│   ├── Calendario/  # Calendario académico y cronograma institucional
│   ├── Curriculum/  # Dominio Curricular ISTPET (Mis Asignaturas PEA, Supervisión, DocumentWorkspace, Monitoreo, Revisión)
│   ├── Dashboard/   # Panel de control interactivo según el rol autenticado
│   ├── Landing/     # Página pública institucional
│   ├── Login/       # Acceso estándar, Magic Links, Microsoft SSO y PIN
│   ├── Lopdp/       # Formularios de consentimiento y administración LOPDP
│   ├── Notificaciones/ # Bandeja de alertas y eventos transaccionales
│   ├── Public/      # Verificación forense pública de documentos vía código QR
│   ├── RecycleBin/  # Papelera de reciclaje y recuperación de registros
│   └── Settings/    # Configuración de cuenta y parámetros normativos
├── services/        # Capa de abstracción REST para comunicación con los 23 controladores del backend
├── styles/          # base.css con tokens HSL, variables Geist y utilidades semánticas
└── types/           # Definiciones de tipos e interfaces TypeScript (PEA, Malla, RBAC, LOPDP)
```

---

## 4. Enrutamiento y Control de Acceso por Roles (RBAC)

El enrutamiento se gestiona a través de **React Router v6** en `src/App.tsx`. El componente de guardia `ProtectedRoute` y los evaluadores de rol (`RoleRoute`, `AdminRoute`, `PermissionRoute`, `ResearcherRoute`) controlan la navegación:

```mermaid
graph TD
    Request[Acceso a Ruta / URL] --> AuthCheck{¿Usuario Autenticado?}

    AuthCheck -->|No| PublicRoute[Rutas Públicas\n/login, /verificacion/:code]
    AuthCheck -->|Sí| LOPDPCheck{¿Aceptó LOPDP?}

    LOPDPCheck -->|No| ConsentRoute[/consentimiento-lopdp]
    LOPDPCheck -->|Sí| RoleCheck{Evaluación de Rol RBAC}

    RoleCheck -->|Docente| DocenteViews[/documentacion/mis-proyectos\n/documentacion/workspace/:templateCode/:projectUuid]
    RoleCheck -->|Revisores / Coordinación| RevisorViews[/documentacion/revision-tecnica/:projectUuid]
    RoleCheck -->|Supervisión / Admin| AdminViews[/documentacion\n/plantillas, /usuarios, /auditoria, /analiticas]
```

### Matriz de Rutas Oficiales en el Cliente Web (`App.tsx`)

| Ruta Frontend | Rol / Guardia | Funcionalidad Principal |
| :--- | :--- | :--- |
| `/login` | Público (`AuthenticatedRedirect`) | Acceso institucional con credenciales locales, Magic Links o Microsoft 365. |
| `/verificacion/:code` | Público | Comprobación forense de autenticidad, firmas y hash SHA-256 mediante código QR. |
| `/dashboard` | Autenticado | Panel de bienvenida, accesos rápidos y estado institucional. |
| `/documentacion/mis-proyectos` | `ResearcherRoute` (Docentes) | Listado de asignaturas y expedientes asignados al docente autenticado. |
| `/documentacion/workspace/:templateCode/:projectUuid` | Autenticado | Entorno de trabajo para estructuración y co-redacción concurrente con Yjs (soporta plantillas de investigación y PEA oficial vía `/api/pea/uuid/:uuid`). |
| `/documentacion/revision-tecnica/:projectUuid` | Autenticado | Portal de revisión colegiada, formulación de observaciones técnicas y dictámenes. |
| `/documentacion/monitoreo/:projectUuid` | Autenticado | Seguimiento del estado del flujo curricular y avances. |
| `/documentacion` | `RoleRoute` (Admin, Coordinadores, Vicerrector) | Consola de supervisión y gestión integral de expedientes curriculares. |
| `/plantillas` | `AdminRoute` | Maquetador visual de bloques de plantillas (Canvas Template Builder). |
| `/usuarios` | `PermissionRoute("USUARIOS", "VER")` | Administración de usuarios institucionales, sincronización SIGAFI y roles. |
| `/auditoria` | `RoleRoute` (Admin, Coord. Académica, Vicerrector) | Bitácora forense de transacciones con filtros de fecha, usuario e IP. |
| `/lopdp` | `AdminRoute` | Supervisión de consentimientos y gestión de solicitudes de derechos ARCO. |
| `/consentimiento-lopdp` | Autenticado | Aceptación obligatoria de términos conforme a la Ley de Protección de Datos. |
| `/analiticas` | `RoleRoute` (Admin, Coordinadores, Vicerrector) | Métricas estadísticas de cumplimiento y cobertura CACES. |
| `/notificaciones` | Autenticado | Centro de notificaciones in-app recibidas vía SignalR. |
| `/calendario` | Autenticado | Calendario de eventos y fechas límite de planificación curricular. |
| `/emails` | `AdminRoute` | Configuración de plantillas de correo y pruebas de despacho SMTP. |

---

## 5. Gestión del Estado de la Aplicación

La aplicación implementa una estrategia de arquitectura de estado por capas:

1. **Estado de Sesión Global (`AuthContext`):**
   * Almacena los datos del usuario activo, identificador único, nombres, apellidos, correo institucional y el arreglo de roles activos (`DOSIER_DOCENTE`, `DOSIER_COORD_CARRERA`, etc.).
   * Administra la persistencia segura del JWT en almacenamiento local y la sincronización con los interceptores de Axios.
2. **Estado Local de Formulario (`useState` / `useReducer`):**
   * Maneja los valores transitorios de las secciones del PEA durante la edición activa antes del guardado formal en base de datos.
3. **Estado Colaborativo Distribuido (Yjs CRDT + SignalR):**
   * Gestiona la sincronización concurrente en campos de texto enriquecido mediante el componente `<CoWorkField>`. El estado no sufre bloqueos pesimistas, garantizando que dos docentes puedan trabajar en la misma unidad curricular sin sobreescritura de datos.

---

## 6. Patron de Escalabilidad para Nuevos Documentos Institucionales

Cuando el ISTPET requiera incorporar un nuevo tipo de documento docente (informe de mitad de semestre, informe final de semestre, guia de practicas, silabo de 19 semanas, etc.), el proceso de extension es el siguiente. **No se modifica la arquitectura en ningun caso.**

### Pasos obligatorios (en orden)

**Paso 1 — Registrar la plantilla en el motor documental (backend + frontend):**
* Backend: agregar la plantilla HTML en `DocumentTemplateRegistry` y su contrato de metadatos JSON.
* Frontend: registrar el `templateCode` en `core/documents/DocumentTemplateRegistry.ts` con su esquema de campos.

**Paso 2 — Crear el servicio de datos en la capa de servicios:**
* Crear `services/informeMitadService.ts` (o el nombre correspondiente al dominio).
* El servicio encapsula exclusivamente las llamadas HTTP al endpoint del backend correspondiente.
* Queda prohibido realizar llamadas Axios directas desde el JSX o desde los hooks sin pasar por el servicio.

**Paso 3 — Crear la pagina en el dominio curricular:**
* Crear la carpeta `pages/Curriculum/InformeMitad/` con su componente de pagina y su custom hook contenedor.
* Registrar la ruta en `App.tsx` con el guardia de rol correspondiente.
* El workspace de edicion reutiliza automaticamente el `DOSIERBuilderShell` mediante el `templateCode` registrado en el Paso 1.

### Resultado

El motor documental `core/documents/` y el motor colaborativo `core/cowork/` sirven al nuevo documento sin ninguna modificacion interna. El ciclo de vida de 4 estados (Borrador, EnRevision, RevisadoCoord, Aprobado) aplica de forma automatica a cualquier documento que transite por el flujo colegiado institucional.
