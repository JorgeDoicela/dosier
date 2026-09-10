# Centro de Documentación Técnica - DOSIER

Este directorio constituye la fuente oficial y centralizada de conocimiento técnico, arquitectónico y operativo de la plataforma **DOSIER** (*Sistema de Gestión Curricular y Portafolio Docente del Instituto Superior Tecnológico Mayor Pedro Traversari*).

---

## 1. Guía de Lectura según Perfil

| Perfil del Consultante | Documentos Prioritarios Recomendados |
| :--- | :--- |
| **Desarrollador Backend (.NET 8)** | [01-macro-arquitectura-clean-arch.md](./01-arquitectura/01-macro-arquitectura-clean-arch.md), [01-especificacion-api-rest.md](./02-backend-servicios/01-especificacion-api-rest.md), [02-autenticacion-sso-y-rbac.md](./02-backend-servicios/02-autenticacion-sso-y-rbac.md) |
| **Desarrollador Frontend (React)** | [01-arquitectura-react-vite.md](./05-frontend-web/01-arquitectura-react-vite.md), [02-componentes-ui-y-builder-shell.md](./05-frontend-web/02-componentes-ui-y-builder-shell.md), [03-integracion-api-y-resiliencia.md](./05-frontend-web/03-integracion-api-y-resiliencia.md) |
| **Ingeniero de Base de Datos / DBA** | [01-esquema-relacional-sigafi.md](./04-base-de-datos/01-esquema-relacional-sigafi.md), [02-catalogos-normativa-ecuador.md](./04-base-de-datos/02-catalogos-normativa-ecuador.md), [03-gobernanza-lopdp-y-auditoria.md](./02-backend-servicios/03-gobernanza-lopdp-y-auditoria.md) |
| **Comisión Curricular / Auditor CACES** | [02-guia-acreditacion-caces-2026.md](./07-despliegue-y-operaciones/02-guia-acreditacion-caces-2026.md), [01-motor-documental-pdf.md](./03-motores-especializados/01-motor-documental-pdf.md), [04-motor-firma-digital-y-sellos.md](./03-motores-especializados/04-motor-firma-digital-y-sellos.md) |
| **Ingeniero de Operaciones / DevOps** | [01-instalacion-entorno-local.md](./07-despliegue-y-operaciones/01-instalacion-entorno-local.md) |

---

## 2. Mapa Completo de Secciones Mapeadas

### Sección 01: Arquitectura de Sistemas
* [01. Macro-Arquitectura del Sistema y Clean Architecture](./01-arquitectura/01-macro-arquitectura-clean-arch.md): Clean Architecture en .NET 8, diagramas C4 (Contexto y Contenedores), integración curricular de solo lectura con SIGAFI (`sigafi_es`) y delimitación estratégica de la tesis.
* [02. Micro-Arquitecturas Internas, Patrones y Motores Especializados](./01-arquitectura/02-micro-arquitecturas-patrones.md): Patrones arquitectónicos: *Curricular Validation Engine*, *Snapshot Forensic SHA-256*, *Pattern Molde vs Instancia*, *CRDT CoWork Yjs*, *State Machine Curricular* y *AcademicContextResolver*.

### Sección 02: Backend y Servicios REST
* [01. Especificación de API REST y Enlace de Datos](./02-backend-servicios/01-especificacion-api-rest.md): Catálogo de controladores de la API (`PeaController`, `NormativasController`, `ExpedienteCurricularController`, etc.), rutas HTTP, DTOs y serialización `snake_case`.
* [02. Arquitectura de Autenticación, SSO y Control de Acceso (RBAC)](./02-backend-servicios/02-autenticacion-sso-y-rbac.md): Autenticación JWT Bearer, hashing BCrypt, SSO Microsoft 365, Magic Links y los 5 roles curriculares oficiales (`DOSIER_ADMIN`, `DOSIER_DOCENTE`, `DOSIER_COORD_CARRERA`, `DOSIER_COORD_ACAD`, `DOSIER_VICERRECTOR`).
* [03. Gobernanza de Datos, Protección LOPDP y Bitácora de Auditoría](./02-backend-servicios/03-gobernanza-lopdp-y-auditoria.md): Cumplimiento de la Ley Orgánica de Protección de Datos Personales (LOPDP), consentimientos, bitácora inmutable `doc_document_audit` y custodia forense.
* [04. Ciclo de Vida Curricular, Workflow y Portafolio Docente](./02-backend-servicios/04-ciclo-vida-curricular-y-workflow.md): Circuito colegiado de 4 estados y firmas (`Borrador` -> `EnRevision` -> `RevisadoCoord` -> `RevisadoAcad` -> `Aprobado`), control de observaciones por sección y sellado forense.

### Sección 03: Motores Especializados
* [01. Motor de Generación Documental PDF e Integridad Forense](./03-motores-especializados/01-motor-documental-pdf.md): Pipeline `DocumentEngine`, plantilla oficial del PEA institucional, membrete ISTPET, iText 9, Hash SHA-256 y Código QR de verificación pública sin login.
* [02. Motor Colaborativo en Tiempo Real (CoWork)](./03-motores-especializados/02-motor-colaborativo-cowork.md): `CollaborationHub` SignalR, sincronización Yjs CRDT para co-redacción concurrente de materias y componente `<CoWorkField>`.
* [03. Motor de Revisión Colegiada Curricular](./03-motores-especializados/03-motor-revision-colegiada-curricular.md): Flujo de revisión por Coordinación de Carrera y Coordinación Académica, bitácora de observaciones por sección y control de subsanaciones.
* [04. Motor de Firma Digital, Criptografía y Sellos](./03-motores-especializados/04-motor-firma-digital-y-sellos.md): Certificados PKCS#12 (.p12) / FirmaEC, sellos de tiempo UTC, código DFRM-XXXX y estampado visual en PDF bajo Ley 67 del Ecuador.
* [05. Motor de Notificaciones Multicanal](./03-motores-especializados/05-motor-notificaciones-multicanal.md): WebSockets in-app (`SignalRDriver`), notificaciones push VAPID (`PushDriver`) y correos HTML institucionales.

### Sección 04: Base de Datos y Catálogos
* [01. Esquema Relacional de Base de Datos e Integración SIGAFI](./04-base-de-datos/01-esquema-relacional-sigafi.md): Frontera de solo lectura sobre `sigafi_es`, resolución de mallas por cohorte (`mallas_periodos`), aislamiento de la escuela de conducción y los 4 scripts oficiales en `scripts/base_datos/`.
* [02. Catálogos Institucionales y Normativa Curricular](./04-base-de-datos/02-catalogos-normativa-ecuador.md): Repositorio inalterable de normativas externas (CES, CACES, SENESCYT), versiones del Modelo Educativo Institucional y Proyectos de Carrera aprobados.

### Sección 05: Frontend Web (React SPA)
* [01. Arquitectura Frontend Web (React SPA + Vite)](./05-frontend-web/01-arquitectura-react-vite.md): React 18, Vite, TypeScript, Tailwind CSS v4, Vercel Geist Design System, catálogo de rutas reales de `App.tsx` y directriz de fondos sólidos sin transparencias.
* [02. Componentes UI Especializados y Shell del Constructor (DOSIERBuilder)](./05-frontend-web/02-componentes-ui-y-builder-shell.md): Shell documental, controles Geist UI, stepper de firmas de 4 estados y editor de las 11 secciones oficiales del PEA.
* [03. Integración con API, Resiliencia y Tolerancia a Discrepancias](./05-frontend-web/03-integracion-api-y-resiliencia.md): Cliente Axios, serialización snake_case con fallbacks duales, interceptores JWT y reconexión SignalR.
* [04. Guía de Extensibilidad y Creación de Nuevos Bloques Documentales](./05-frontend-web/04-creacion-y-extensibilidad-de-bloques.md): Arquitectura desacoplada para incorporar bloques modulares para el PEA y documentos curriculares institucionales.

### Sección 06: Aplicación Móvil
* [01. Arquitectura de Aplicación Móvil (React Native + Expo)](./06-aplicacion-movil/01-arquitectura-movil-docente.md): Arquitectura de `dosier_mobile`, Expo Router `(tabs)`, catálogo de componentes táctiles Vercel Mobile y sistema de diseño Geist.

### Sección 07: Despliegue y Operaciones
* [01. Guía de Instalación y Configuración en Entorno Local](./07-despliegue-y-operaciones/01-instalacion-entorno-local.md): Requisitos de desarrollo (.NET 8, Node 18, MySQL 3306), ejecución ordenada de los 4 scripts SQL oficiales (01 a 04) y variables de entorno.
* [02. Guía de Cumplimiento e Integridad Forense para Acreditación CACES 2026](./07-despliegue-y-operaciones/02-guia-acreditacion-caces-2026.md): Matriz de evidencias técnicas y cobertura curricular para auditorías de acreditación institucional.

---

DOSIER Technical Documentation | Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET)
