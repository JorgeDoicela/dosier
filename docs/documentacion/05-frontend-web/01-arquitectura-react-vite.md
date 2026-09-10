# Arquitectura Frontend Web (React 18 + Vite + TypeScript)

## 1. Visión General del Cliente Web

El cliente web de DOSIER (`dosier_web`) es una aplicación de página única (**SPA**) de alto rendimiento construida con:
* **React 18** y **TypeScript 5.x**.
* **Vite** como empaquetador ultrarrápido y servidor de desarrollo local.
* **Tailwind CSS v4** integrado nativamente con variables semánticas en `src/styles/base.css`.
* **Vercel Geist Design System**: Lenguaje visual sobrio, minimalista, enfocado en tipografía de alta legibilidad (`Geist Sans` / `Geist Mono`), bordes definidos y jerarquía visual estricta.

La plataforma proporciona a la comunidad académica del Instituto Superior Tecnológico Pedro Traversari una herramienta profesional para la planificación del Programa de Estudio de la Asignatura (PEA), co-redacción en tiempo real, revisión colegiada por comisiones de carrera, firma electrónica y verificación pública de acreditación.

---

## 2. Regla Cardinal de Diseño Visual: Cero Transparencias y Fondos 100% Sólidos

Por directriz de diseño institucional y usabilidad técnica, el frontend implementa la siguiente norma obligatoria y no negociable:

> [!IMPORTANT]
> **Prohibición Total de Transparencias en Componentes Flotantes y Superpuestos:**
> Todos los modales, popovers, menús desplegables (`GeistSelect`), selectores de fechas (`GeistDatePicker`), drawers, tooltips y paneles de diálogo deben poseer fondos **100% sólidos y opacos**.
> * Modo Claro: Fondo sólido `bg-white` (`#FFFFFF`).
> * Modo Oscuro: Fondo sólido `bg-zinc-950` (`#09090b`) o `bg-black` (`#000000`).
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
│   ├── Dashboard/   # Panel de control interactivo según el rol autenticado
│   ├── Investigacion/ # Expedientes y Proyectos (Workspace, Monitoreo, Revisión Técnica)
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
| `/documentacion/workspace/:templateCode/:projectUuid` | Autenticado | Entorno de trabajo para estructuración y co-redacción concurrente con Yjs. |
| `/documentacion/revision-tecnica/:projectUuid` | Autenticado | Portal de revisión colegiada, formulación de observaciones técnicas y dictámenes. |
| `/documentacion/monitoreo/:projectUuid` | Autenticado | Seguimiento del estado del flujo curricular y avances. |
| `/documentacion` | `AdminRoute` | Consola de supervisión y gestión integral de expedientes curriculares. |
| `/plantillas` | `AdminRoute` | Maquetador visual de bloques de plantillas (Canvas Template Builder). |
| `/usuarios` | `PermissionRoute("USUARIOS", "VER")` | Administración de usuarios institucionales, sincronización SIGAFI y roles. |
| `/auditoria` | `AdminRoute` | Bitácora forense de transacciones con filtros de fecha, usuario e IP. |
| `/lopdp` | `AdminRoute` | Supervisión de consentimientos y gestión de solicitudes de derechos ARCO. |
| `/consentimiento-lopdp` | Autenticado | Aceptación obligatoria de términos conforme a la Ley de Protección de Datos. |
| `/analiticas` | `AdminRoute` | Métricas estadísticas de cumplimiento y cobertura. |
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
