# DOSIER - Sistema Integral de Gestión Curricular, Acreditación y Portafolio Docente

**DOSIER** es una plataforma de software diseñada para la gobernanza curricular, formulación asistida, co-redacción en tiempo real, validación matemática de horas y acreditación oficial de instrumentos pedagógicos en el **Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET)** de Quito, Ecuador.

El sistema vincula la cadena macro-curricular (Normativas externas CES/CACES, Modelo Educativo Institucional, Proyectos de Carrera y Perfiles de Egreso) con la planificación académica operativa almacenada en el sistema institucional **SIGAFI** (`sigafi_es`), garantizando el cumplimiento estricto del marco normativo **CACES 2026**, el Reglamento de Régimen Académico (RRA) del CES y la firma digital PKCS#12 (.p12) / FirmaEC bajo la Ley de Comercio Electrónico y Firmas Electrónicas del Ecuador.

---

## 1. Contexto Académico y Delimitación de Tesis

* **Institución:** Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET).
* **Tema de Titulación:** Sistema web de gestión curricular para el Programa de Estudio de la Asignatura del Instituto Superior Tecnológico Mayor Pedro Traversari.
* **Autor:** Jorge Ismael Doicela Molina.
* **Tutor:** Tnldgo. Carlos Enrique Valencia Llerena.
* **Carrera:** Tecnología Superior en Desarrollo de Software.

### 1.1. Alcance Evaluativo de la Tesis de Grado
La tesis de grado implementa, valida y evalúa exhaustivamente el ciclo de vida completo del **Programa de Estudio de la Asignatura (PEA)** como primer entregable oficial:
* Registro y normalización institucional de las **11 secciones reglamentarias (a - k)**.
* Origen transaccional de solo lectura desde las asignaciones docentes reales de SIGAFI (`AcademicContextResolver`).
* Co-redacción concurrente multi-docente en tiempo real basada en Conflict-free Replicated Data Types (**CRDT / Yjs**) sobre WebSockets (**SignalR**).
* Motor de validaciones matemáticas intransigentes (*CurricularValidationEngine*): horas de docencia, práctico-experimental (APE) y autónomo vs. `detallemallas` de SIGAFI.
* Articulación directa con los Resultados de Aprendizaje del Perfil de Egreso (RDA Carrera).
* Circuito colegiado de revisión y firmas de 4 estados institucionales.
* Emisión oficial de documento PDF vectorial con membrete reglamentario, estampado digital DFRM, firma criptográfica **SHA-256** y **Código QR de verificación pública** sin autenticación.
* Tablero de control de cobertura curricular para procesos de acreditación del CACES.

---

## 2. Roles Curriculares y Circuito de Responsabilidades

El sistema implementa un modelo de Control de Acceso Basado en Roles (RBAC) alineado al **Reglamento del Sistema de Seguimiento, Control y Evaluación del Proceso Docente del ISTPET (Resolución ISTPET-OCS-SE-2022-019)** y al formato oficial del PEA (Sección k):

```text
[ Docente ]                --> Elabora y Co-redacta (Borrador / Corregido)
    | (Firma Elaborador)
    v
[ Coordinador de Carrera ] --> Revisa Coherencia Curricular y Perfil de Egreso (RevisadoCoord)
    | (Firma Revisado)
    v
[ Coordinación Académica ] --> Revisa Estructura Metodológica y Horas/Créditos (RevisadoAcad)
    | (Firma Revisado)
    v
[ Vicerrectorado Acad. ]   --> Aprobación Oficial, Sello SHA-256 y Publicación (Aprobado)
```

| Rol del Sistema | Denominación Institucional | Atribuciones en DOSIER |
| :--- | :--- | :--- |
| `DOSIER_DOCENTE` | Docente Elaborador | Elabora el PEA desde su distributivo oficial, participa en co-redacción y subsana observaciones registradas por las comisiones. |
| `DOSIER_COORD_CARRERA` | Coordinador(a) de Carrera | Verifica la coherencia disciplinar, pertinencia respecto a la malla vigente y el aporte a los Resultados de Aprendizaje del Perfil de Egreso. Registra observaciones o emite su aval favorable. |
| `DOSIER_COORD_ACAD` | Coordinación / Comisión Académica | Revisa la estructura metodológica institucional, el cuadre estricto de horas (48h por crédito) y la distribución del sistema de evaluación continua (10.0 puntos). |
| `DOSIER_VICERRECTOR` | Vicerrectorado Académico | Máxima autoridad de legalización curricular. Emite la aprobación final en firme, activando el congelamiento forense de datos, la firma criptográfica SHA-256 y la emisión del PDF público. |
| `DOSIER_ADMIN` | Administrador de Plataforma y Calidad | Administración de parámetros, actualización inalterable de normativas externas (CES, CACES, SENESCYT), modelos educativos y tableros de cobertura para acreditación CACES. |

---

## 3. Visión General de Arquitectura

El sistema implementa una arquitectura desacoplada estructurada en Clean Architecture para el backend y una aplicación de página única (SPA) modular para el frontend:

```text
dosier/
|-- backend/                     # Solución ASP.NET Core 8 (.NET 8.0 / dosier.slnx)
|   |-- dosier_api/              # Controladores REST, Middlewares de Seguridad y Swagger
|   |-- dosier_application/      # Casos de Uso, DTOs curriculares, Interfaces y Handlers
|   |-- dosier_domain/           # Entidades del PEA, Constantes de Permisos y Reglas Puras
|   |-- dosier_infrastructure/   # EF Core 9, Pomelo MySQL, SignalR Hub, Motor PDF y Firmas
|   `-- dosier_tests/            # Pruebas unitarias de integridad curricular y firmas
|-- dosier_web/                  # Cliente Web React 18 + Vite + TypeScript (Vercel Geist UI)
|   |-- public/                  # Recursos estáticos, marcas y certificados
|   `-- src/                     # Componentes modulares, Editor PEA, Contextos y API Client
|-- dosier_mobile/               # Cliente Móvil React Native + Expo Router (Vercel Mobile UI)
|   |-- app/                     # Rutas móviles basadas en archivos (tabs)
|   `-- components/ui/           # Catálogo táctil BentoCards, VercelButton, VercelTabs
|-- docs/
|   |-- documentacion/           # Especificación técnica, arquitectónica y operativa completa
|   `-- tesis/                   # Anteproyecto, codex de diagnóstico y formatos institucionales
`-- scripts/
    |-- base_datos/              # Scripts SQL oficiales (01 a 04) para MySQL sigafi_es
    `-- despliegue/              # Automatizaciones para entornos locales y de producción
```

### 3.1. Tecnologías Principales
* **Backend:** C# con .NET 8.0, ASP.NET Core Web API, Entity Framework Core 9.0, Pomelo MySQL Provider.
* **Frontend Web:** React 18, TypeScript, Vite, Tailwind CSS v4, Vercel Geist Design System, Lucide Icons.
* **Cliente Móvil:** React Native, Expo SDK, Expo Router, React Native Reanimated.
* **Colaboración en Tiempo Real:** SignalR WebSockets con protocolo binario y sincronización Yjs CRDT.
* **Generación Documental y Criptografía:** iText 9, Handlebars.Net, QRCoder, SHA-256 y soporte PKCS#12 (.p12).
* **Base de Datos Institucional:** MySQL 8.0+ / MariaDB en base `sigafi_es`, modo de solo lectura para tablas académicas (`AsNoTracking()`).

---

## 4. Estructura de Scripts de Base de Datos

Los scripts ubicados en `scripts/base_datos/` administran el esquema del módulo curricular con prefijo `doc_` sin alterar las tablas nativas de SIGAFI:

1. `01_sistema_base.sql`: Núcleo de auditoría, eventos normativos, seguridad, metadatos, tablas CoWork (`doc_cowork_documentos`) y tablas LOPDP.
2. `02_gobernanza_y_antecedentes_curriculares.sql`: Normativas externas inalterables (CES, CACES, SENESCYT), modelos educativos institucionales, proyectos de carrera aprobados por CES, perfiles de egreso y matriz de antecedentes epistemológicos de asignaturas.
3. `03_curriculum_pea_oficial.sql`: Arquitectura completa y normalizada del Programa de Estudio de la Asignatura (Secciones a - k: unidades, temas, RDA con aporte al perfil, prácticas, evaluación institucional 10 pts, bibliografía, observaciones y trazabilidad).
4. `04_seguridad_rbac_roles_curriculares.sql`: Identidad oficial de DOSIER (Sistema ID 6), módulos curriculares, catálogo de los 5 roles institucionales y asignación granular de permisos.

---

## 5. Directrices de Interfaz de Usuario y Estándar Visual

El diseño visual de DOSIER sigue estrictamente el **Vercel Geist Design System**:
* **Fondos Sólidos y Cero Transparencia:** Prohibido el uso de glassmorphism translúcido o `backdrop-blur` en modales, selectores, menús flotantes, popovers y drawers. Todos los elementos superpuestos emplean fondos 100% opacos (`bg-white` en tema claro, `bg-zinc-950` / `bg-surface` sólido en oscuro) con bordes definidos (`border border-zinc-200 dark:border-zinc-800`) y sombras profundas (`shadow-xl`) para evitar el traslape visual de textos.
* **Densidad de Datos:** Presentación sobria y jerarquizada de información académica sin tarjetas gigantes innecesarias ni anidamiento excesivo de cajas.
* **Cero Emojis:** Empleo exclusivo de iconografía técnica vectorial con Lucide React (`strokeWidth={1.5}` o `1.75`).

---

## 6. Configuración y Ejecución Local

### 6.1. Requisitos Previos
* .NET SDK 8.0 o superior.
* Node.js 18.0+ y npm 9.0+.
* Servidor MySQL 8.0+ o MariaDB 10.5+ con la base de datos `sigafi_es` activa en el puerto `3306`.

### 6.2. Inicialización de Base de Datos
Ejecutar secuencialmente los scripts oficiales desde el cliente MySQL:
```powershell
mysql -u root -p12345 -h 127.0.0.1 -P 3306 sigafi_es -e "SOURCE scripts/base_datos/01_sistema_base.sql"
mysql -u root -p12345 -h 127.0.0.1 -P 3306 sigafi_es -e "SOURCE scripts/base_datos/02_gobernanza_y_antecedentes_curriculares.sql"
mysql -u root -p12345 -h 127.0.0.1 -P 3306 sigafi_es -e "SOURCE scripts/base_datos/03_curriculum_pea_oficial.sql"
mysql -u root -p12345 -h 127.0.0.1 -P 3306 sigafi_es -e "SOURCE scripts/base_datos/04_seguridad_rbac_roles_curriculares.sql"
```

### 6.3. Ejecución de Servicios
1. **Backend API:**
   ```powershell
   cd backend/dosier_api
   dotnet run
   ```
   * Servicio activo en: `http://localhost:5247/`
   * Documentación interactiva Swagger: `http://localhost:5247/swagger`

2. **Frontend Web:**
   ```powershell
   cd dosier_web
   npm install
   npm run dev
   ```
   * Interfaz de usuario activa en: `http://localhost:3010/`

---

## 7. Documentación Técnica Integral

La especificación completa del sistema está organizada en el directorio `docs/documentacion/`:
* [Centro de Documentación Técnica - Índice General](docs/documentacion/README.md)
* [Sección 01: Macro-Arquitectura y Clean Architecture](docs/documentacion/01-arquitectura/01-macro-arquitectura-clean-arch.md)
* [Sección 01: Micro-Arquitecturas y Patrones Especializados](docs/documentacion/01-arquitectura/02-micro-arquitecturas-patrones.md)
* [Sección 02: Especificación de la API REST](docs/documentacion/02-backend-servicios/01-especificacion-api-rest.md)
* [Sección 02: Autenticación, SSO y Roles Curriculares (RBAC)](docs/documentacion/02-backend-servicios/02-autenticacion-sso-y-rbac.md)
* [Sección 02: Gobernanza de Datos y Auditoría](docs/documentacion/02-backend-servicios/03-gobernanza-lopdp-y-auditoria.md)
* [Sección 02: Ciclo de Vida Curricular y Workflow del PEA](docs/documentacion/02-backend-servicios/04-ciclo-vida-curricular-y-workflow.md)
* [Sección 03: Motor Documental PDF e Integridad Forense](docs/documentacion/03-motores-especializados/01-motor-documental-pdf.md)
* [Sección 03: Motor Colaborativo en Tiempo Real (CoWork)](docs/documentacion/03-motores-especializados/02-motor-colaborativo-cowork.md)
* [Sección 03: Motor de Revisión Colegiada Curricular](docs/documentacion/03-motores-especializados/03-motor-revision-colegiada-curricular.md)
* [Sección 03: Motor de Firma Digital y Criptografía](docs/documentacion/03-motores-especializados/04-motor-firma-digital-y-sellos.md)
* [Sección 03: Motor de Notificaciones Multicanal](docs/documentacion/03-motores-especializados/05-motor-notificaciones-multicanal.md)
* [Sección 04: Esquema Relacional de Base de Datos e Integración SIGAFI](docs/documentacion/04-base-de-datos/01-esquema-relacional-sigafi.md)
* [Sección 04: Catálogos Institucionales y Normativa Curricular](docs/documentacion/04-base-de-datos/02-catalogos-normativa-ecuador.md)
* [Sección 05: Arquitectura Frontend Web (React + Vite)](docs/documentacion/05-frontend-web/01-arquitectura-react-vite.md)
* [Sección 05: Componentes UI y Shell del Constructor](docs/documentacion/05-frontend-web/02-componentes-ui-y-builder-shell.md)
* [Sección 05: Integración con API y Resiliencia](docs/documentacion/05-frontend-web/03-integracion-api-y-resiliencia.md)
* [Sección 05: Extensibilidad de Bloques Documentales](docs/documentacion/05-frontend-web/04-creacion-y-extensibilidad-de-bloques.md)
* [Sección 06: Arquitectura de la Aplicación Móvil](docs/documentacion/06-aplicacion-movil/01-arquitectura-movil-docente.md)
* [Sección 07: Instalación y Configuración Local](docs/documentacion/07-despliegue-y-operaciones/01-instalacion-entorno-local.md)
* [Sección 07: Guía de Cumplimiento para Acreditación CACES 2026](docs/documentacion/07-despliegue-y-operaciones/02-guia-acreditacion-caces-2026.md)

---

DOSIER Architecture | Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET) | Quito, Ecuador
