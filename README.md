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
|-- dosier_web/                  # Cliente Web React 18 + Vite + TypeScript (Geist Editorial / Enterprise Docs)
|   |-- public/                  # Recursos estáticos, marcas y certificados
|   `-- src/                     # Componentes modulares, Editor PEA, Contextos y API Client
|-- docs/
|   |-- documentacion/           # Especificación técnica, arquitectónica y operativa completa
|   `-- tesis/                   # Anteproyecto, codex de diagnóstico y formatos institucionales
`-- scripts/
    |-- base_datos/              # Scripts SQL oficiales (00 a 04) para MySQL sigafi_es
    |   `-- extensiones/         # Esquemas futuros opcionales (05_extension_futura_...)
    `-- despliegue/              # Automatizaciones organizadas por entorno
        |-- docker/              # Arranque local Docker + Cloudflare Quick Tunnel (start-local.ps1)
        `-- iis/                 # Despliegue nativo Windows IIS (deploy_local.ps1) y respaldos
```

### 3.1. Tecnologías Principales
* **Backend:** C# con .NET 8.0, ASP.NET Core Web API, Entity Framework Core 9.0, Pomelo MySQL Provider.
* **Frontend Web:** React 18, TypeScript, Vite, Tailwind CSS v4, Feature-Based Modular SPA con Service Layer (22 servicios), Geist Editorial / Enterprise Docs System (Inter Puro), Lucide Icons.
* **Colaboración en Tiempo Real:** SignalR WebSockets con protocolo binario y sincronización Yjs CRDT.
* **Generación Documental y Criptografía:** iText 9, Handlebars.Net, QRCoder, SHA-256 y soporte PKCS#12 (.p12).
* **Base de Datos Institucional:** MySQL 8.0+ / MariaDB en base `sigafi_es`, modo de solo lectura para tablas académicas (`AsNoTracking()`).

---

## 4. Estructura de Scripts de Base de Datos

Los scripts ubicados en `scripts/base_datos/` administran el esquema del módulo curricular con prefijo `doc_` sin alterar las tablas nativas de SIGAFI:

0. `00_sigafi_esquema_y_datos_demo.sql`: Esquema maestro preexistente de SIGAFI y datos sintéticos representativos del ISTPET (LOPDP compliant para producción y defensa de grado).
1. `01_sistema_base.sql`: Núcleo de auditoría, eventos normativos, seguridad, metadatos, tablas CoWork (`doc_cowork_documentos`) y tablas LOPDP.
2. `02_gobernanza_y_antecedentes_curriculares.sql`: Normativas externas inalterables (CES, CACES, SENESCYT), modelos educativos institucionales, proyectos de carrera aprobados por CES, perfiles de egreso y matriz de antecedentes epistemológicos de asignaturas.
3. `03_curriculum_pea_oficial.sql`: Arquitectura completa y normalizada del Programa de Estudio de la Asignatura (Secciones a - k: unidades, temas, RDA con aporte al perfil, prácticas, evaluación institucional 10 pts, bibliografía, observaciones y trazabilidad).
4. `04_seguridad_rbac_roles_curriculares.sql`: Identidad oficial de DOSIER (Sistema ID 6), módulos curriculares, catálogo de los 5 roles institucionales y asignación granular de permisos.
* `extensiones/05_extension_futura_curriculum_silabo_guias.sql`: Esquema DDL para extensiones curriculares futuras (Sílabo analítico y Guías APE).

---

## 5. Directrices de Interfaz de Usuario y Estándar Visual

El diseño visual de DOSIER sigue estrictamente el **Vercel Geist Design System**:
* **Fondos Sólidos y Cero Transparencia:** Prohibido el uso de glassmorphism translúcido o `backdrop-blur` en modales, selectores, menús flotantes, popovers y drawers. Todos los elementos superpuestos emplean fondos 100% opacos (`bg-white` en tema claro, `bg-zinc-950` / `bg-surface` sólido en oscuro) con bordes definidos (`border border-zinc-200 dark:border-zinc-800`) y sombras profundas (`shadow-xl`) para evitar el traslape visual de textos.
* **Densidad de Datos:** Presentación sobria y jerarquizada de información académica sin tarjetas gigantes innecesarias ni anidamiento excesivo de cajas.
* **Cero Emojis:** Empleo exclusivo de iconografía técnica vectorial con Lucide React (`strokeWidth={1.5}` o `1.75`).

---

## 6. Configuración y Ejecución Local

### Opción A: Ejecución Integral con Docker (Recomendada)
Para levantar el stack completo (MySQL 8.0, Backend .NET, Frontend Nginx y Túnel HTTPS de Cloudflare):
```powershell
# Levantar stack con túnel público HTTPS
.\scripts\despliegue\docker\start-local.ps1 -Tunnel

# O detener el stack conservando los volúmenes de datos
.\scripts\despliegue\docker\start-local.ps1 -Down
```

### Opción B: Ejecución Manual de Servicios (.NET + Vite)

#### 6.1. Inicialización de Base de Datos
Ejecutar secuencialmente los scripts oficiales desde el cliente MySQL:
```powershell
mysql -u root -p12345 -h 127.0.0.1 -P 3306 sigafi_es -e "SOURCE scripts/base_datos/00_sigafi_esquema_y_datos_demo.sql"
mysql -u root -p12345 -h 127.0.0.1 -P 3306 sigafi_es -e "SOURCE scripts/base_datos/01_sistema_base.sql"
mysql -u root -p12345 -h 127.0.0.1 -P 3306 sigafi_es -e "SOURCE scripts/base_datos/02_gobernanza_y_antecedentes_curriculares.sql"
mysql -u root -p12345 -h 127.0.0.1 -P 3306 sigafi_es -e "SOURCE scripts/base_datos/03_curriculum_pea_oficial.sql"
mysql -u root -p12345 -h 127.0.0.1 -P 3306 sigafi_es -e "SOURCE scripts/base_datos/04_seguridad_rbac_roles_curriculares.sql"
```

#### 6.2. Ejecución del Backend
```powershell
cd backend/dosier_api
dotnet run
```
* Servicio activo en: `http://localhost:5001/` (o puerto configurado)
* Documentación interactiva Swagger: `http://localhost:5001/swagger`

#### 6.3. Ejecución del Frontend Web
```powershell
cd dosier_web
npm install
npm run dev
```
* Interfaz de usuario activa en: `http://localhost:3010/` (o `http://localhost:5173/`)

---

## 7. Documentación Técnica Integral

La especificación completa del sistema está organizada en el directorio `docs/documentacion/`:
* [Centro de Documentación Técnica - Índice General](docs/documentacion/README.md)
* [Sección 01: Macro-Arquitectura y Clean Architecture](docs/documentacion/01-arquitectura/01-macro-arquitectura-clean-arch.md)
* [Sección 01: Micro-Arquitecturas y Patrones Especializados](docs/documentacion/01-arquitectura/02-micro-arquitecturas-patrones.md)
* [Sección 01: Modelo de Dominio y Entidades del Sistema](docs/documentacion/01-arquitectura/03-modelo-de-dominio-y-entidades.md)
* [Sección 01: Diagnóstico Institucional SIGAFI, Auditoría Técnica y Delimitación](docs/documentacion/01-arquitectura/04-delimitacion-diagnostico-y-auditoria-istpet.md)
* [Sección 02: Especificación Completa de la API REST (23 Controladores)](docs/documentacion/02-backend-servicios/01-especificacion-api-rest.md)
* [Sección 02: Autenticación, SSO y Roles Curriculares (RBAC)](docs/documentacion/02-backend-servicios/02-autenticacion-sso-y-rbac.md)
* [Sección 02: Gobernanza de Datos y Auditoría](docs/documentacion/02-backend-servicios/03-gobernanza-lopdp-y-auditoria.md)
* [Sección 02: Ciclo de Vida Curricular y Workflow del PEA](docs/documentacion/02-backend-servicios/04-ciclo-vida-curricular-y-workflow.md)
* [Sección 02: Capa de Aplicación, Casos de Uso y Servicios de Orquestación](docs/documentacion/02-backend-servicios/05-capa-de-aplicacion-y-casos-de-uso.md)
* [Sección 02: Pipeline HTTP, Middlewares y Background Services](docs/documentacion/02-backend-servicios/06-pipeline-http-y-middleware.md)
* [Sección 02: Suite de Pruebas Unitarias, Integración y Aseguramiento de Calidad](docs/documentacion/02-backend-servicios/07-pruebas-unitarias-y-calidad-de-software.md)
* [Sección 03: Motor Documental PDF e Integridad Forense](docs/documentacion/03-motores-especializados/01-motor-documental-pdf.md)
* [Sección 03: Motor Colaborativo en Tiempo Real (CoWork)](docs/documentacion/03-motores-especializados/02-motor-colaborativo-cowork.md)
* [Sección 03: Motor de Revisión Colegiada Curricular](docs/documentacion/03-motores-especializados/03-motor-revision-colegiada-curricular.md)
* [Sección 03: Motor de Firma Digital y Criptografía](docs/documentacion/03-motores-especializados/04-motor-firma-digital-y-sellos.md)
* [Sección 03: Motor de Notificaciones Multicanal](docs/documentacion/03-motores-especializados/05-motor-notificaciones-multicanal.md)
* [Sección 04: Esquema Relacional de Base de Datos e Integración SIGAFI](docs/documentacion/04-base-de-datos/01-esquema-relacional-sigafi.md)
* [Sección 04: Catálogos Institucionales y Normativa Curricular](docs/documentacion/04-base-de-datos/02-catalogos-normativa-ecuador.md)
* [Sección 04: Infraestructura de Persistencia, EF Core y Repositorios](docs/documentacion/04-base-de-datos/03-infraestructura-efcore-y-repositorios.md)
* [Sección 05: Arquitectura Frontend Web (React + Vite)](docs/documentacion/05-frontend-web/01-arquitectura-react-vite.md)
* [Sección 05: Componentes UI y Shell del Constructor](docs/documentacion/05-frontend-web/02-componentes-ui-y-builder-shell.md)
* [Sección 05: Integración con API y Resiliencia](docs/documentacion/05-frontend-web/03-integracion-api-y-resiliencia.md)
* [Sección 05: Extensibilidad de Bloques Documentales](docs/documentacion/05-frontend-web/04-creacion-y-extensibilidad-de-bloques.md)
* [Sección 05: Sistema de Diseño Visual Editorial Minimalista](docs/documentacion/05-frontend-web/05-sistema-de-diseno-editorial.md)
* [Sección 05: Catálogo Integral de Vistas, Páginas y Flujos de Usuario](docs/documentacion/05-frontend-web/06-catalogo-completo-vistas-y-flujos.md)
* [Sección 05: Servicios, Hooks Especializados y Gestión del Estado Global](docs/documentacion/05-frontend-web/07-servicios-hooks-y-estado-global.md)
* [Sección 06: Instalación y Configuración Local](docs/documentacion/06-despliegue-y-operaciones/01-instalacion-entorno-local.md)
* [Sección 06: Guía de Cumplimiento para Acreditación CACES 2026](docs/documentacion/06-despliegue-y-operaciones/02-guia-acreditacion-caces-2026.md)
* [Sección 06: Pipeline CI/CD y Despliegue en AWS EC2](docs/documentacion/06-despliegue-y-operaciones/03-pipeline-cicd-y-despliegue-ec2.md)
* [Sección 06: Seguridad Perimetral y SSL Cloudflare Origin CA](docs/documentacion/06-despliegue-y-operaciones/04-seguridad-ssl-cloudflare-origin-ca.md)
* [Sección 06: Dimensionamiento de Servidor y Topología en AWS EC2](docs/documentacion/06-despliegue-y-operaciones/05-topologia-de-red-y-arquitectura-servidor.md)
* [Sección 06: Guía de Aprovisionamiento, Migración y Rotación de Seguridad](docs/documentacion/06-despliegue-y-operaciones/06-guia-provisionamiento-y-migracion-servidores.md)

---

## 8. Despliegue en Producción y CI/CD

El repositorio implementa integración y despliegue continuo (CI/CD) automatizado mediante GitHub Actions hacia instancias AWS EC2 con Docker Compose:

* **Pipeline Principal (`deploy.yml`):** Detección de cambios por rutas (`backend/**` vs `dosier_web/**`), compilación multi-stage, publicación de imágenes en GitHub Container Registry (`ghcr.io`), transferencia segura por SCP y despliegue zero-downtime vía SSH.
* **Mecanismo de Rollback (`rollback.yml`):** Reversión instantánea por commit SHA sin re-compilación.
* **Seguridad Perimetral:** Nginx como proxy inverso con terminación SSL en puerto 443 mediante certificados Cloudflare Origin CA bajo modo Full (Strict).

---

DOSIER Architecture | Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET) | Quito, Ecuador

