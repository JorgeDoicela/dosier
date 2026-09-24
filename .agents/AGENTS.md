# Reglas del Proyecto (DOSIER)

Este archivo define el stack tecnológico y las convenciones exclusivas del proyecto DOSIER (Sistema de Gestión Curricular para el Programa de Estudio de la Asignatura - PEA del ISTPET). Las reglas de comportamiento general (idioma, tokens, búsquedas eficientes, delegación de diagnósticos) están definidas en el `AGENTS.md` global y aplican automáticamente a este workspace.

---

## Stack Tecnológico y Arquitectura

* **Frontend:** React 18, Vite, TypeScript
  * *Arquitectura:* Feature-Based Modular SPA con Capa de Servicios (Service Layer).
  * *Motores Desacoplados (`core/`):*
    * `core/cowork/`: Motor de concurrencia en tiempo real basado en CRDTs (Yjs) sobre SignalR WebSockets con el componente `<CoWorkField>`.
    * `core/documents/`: Registro desacoplado de esquemas del PEA en JSON puro (`DocumentTemplateRegistry.ts`) y catálogo de renderers (`DocumentComponentRegistry.ts`).
  * *Capa de Servicios (`services/`):* Todas las llamadas HTTP pasan por fachadas tipadas (`docenteAsignaturasService.ts`, `peaService.ts`, etc.) usando la instancia configurada de Axios en `api/`. Queda prohibido el uso de `fetch` nativo o llamadas Axios directas desde el JSX.
  * *Estilos y UI:* Sistema de diseño basado en **Geist Editorial / Enterprise Docs** (inspirado en Mintlify y GitBook Enterprise con tipografía Inter Puro). Tailwind CSS v4 integrado nativamente en `base.css`. Catálogo de clases semánticas (`.surface-subtle`, `.badge-subtle`, `.segmented-container`, `.bento-card`, etc.).
  * *Regla Cardinal de Diseño Visual:* **Fondos 100% sólidos y opacos, cero transparencias**. Todos los modales (`src/pages/Dashboard/Roles/Modals/`), popovers, menús desplegables (`GeistSelect`), selectores de fecha (`GeistDatePicker`) y drawers deben tener fondo sólido (`bg-white` en claro, `bg-zinc-950` o `bg-[#131720]` en oscuro; cabeceras y pies en `bg-zinc-50 dark:bg-zinc-900`). Queda terminantemente prohibido el uso de opacidades translúcidas (`/50`, `/40`) o `backdrop-blur` que generen sangrado de texto (*text bleed-through*).
  * *Cero Emojis:* Empleo exclusivo de iconografía técnica vectorial con Lucide React (`strokeWidth={1.5}` o `1.75`).
  * *Serialización:* El backend transforma todas las propiedades a `snake_case` de forma global. Al consumir la API en React, mapear siempre esperando `snake_case` y usar fallbacks duales defensivos cuando sea necesario (ej: `has_template_update || hasTemplateUpdate`).

* **Backend:** ASP.NET Core Web API (.NET 8), Entity Framework Core 9 (ORM), Pomelo MySQL
  * *Arquitectura:* Clean Architecture en 4 capas concéntricas (`dosier_domain`, `dosier_application`, `dosier_infrastructure`, `dosier_api`).
  * *Persistencia Modular (`DosierContext`):* Dividido en 4 archivos parciales (`DosierContext.cs`, `DosierContext.Doc.cs`, `DosierContext.Identity.cs`, `DosierContext.Sigafi.cs`) y snapshot oficial `DosierContextModelSnapshot.cs`. Prohibido el uso de prefijos heredados (`Inv*`, `Diitra*`); todo modelo propio debe llamarse `Doc*.cs`.
  * *Frontera SIGAFI (Solo Lectura):* `carreras` (con filtro obligatorio `esInstituto = 1`), `periodos`, `mallas`, `mallas_periodos`, `detallemallas`, `profesores`, `asignacion_materias` en la base de datos `sigafi_es` (puerto 3306). Modo solo lectura estricto con `.AsNoTracking()`.
  * *Capa Anticorrupción (ACL):* Consumo exclusivo a través de `IAcademicContextResolver` y `AsignaturasDocenteService`.
  * *Esquema DOSIER (Escritura):* Tablas gestionadas por los 4 scripts oficiales en `scripts/base_datos/` con prefijo obligatorio `doc_*`.
  * *Subservicios de Firma Digital:* `IDosierSignatureService`, `DosierInternalSignerSubservice` (HMAC-SHA256, DFRM), `P12SignatureSubservice` (PKCS#12 / FirmaEC) y `SignatureStamper` (iText 9).
  * *RBAC Curricular:* 5 roles oficiales institucionales (`DOSIER_ADMIN`, `DOSIER_DOCENTE`, `DOSIER_COORD_CARRERA`, `DOSIER_COORD_ACAD`, `DOSIER_VICERRECTOR`) en el sistema ID 6 de `sigafi_es`.

---

## Orquestación y Activación de Skills (DOSIER)

Para garantizar que el agente aplique tanto los estándares globales como los patrones específicos del proyecto, activa siempre las habilidades en **cascada/combinación**:

* **Tareas de Frontend (UI, componentes React, Yjs, Service Layer, cliente API):**
  1. Activar skill global `desarrollo-frontend` (reglas generales de UX/UI, React, Hooks y tipado estricto).
  2. Activar skill local `frontend-dosier` (Feature-Based SPA, Service Layer, CoWorkField Yjs, snake_case, umbral de 700 líneas y regla de fondos sólidos).

* **Tareas de Sistema de Diseño Visual, Tokens CSS, Paleta de Colores, Animaciones o Estilo Geist:**
  1. Activar skill global `desarrollo-frontend`.
  2. Activar skill local `styles-dosier` (tokens HSL, tipografía Inter Puro, regla de fondos 100% sólidos, cero transparencias y catálogo de clases semánticas).

* **Tareas de Backend (API C#, Clean Architecture, EF Core, DTOs, migraciones, base de datos):**
  1. Activar skill global `desarrollo-backend` (arquitectura limpia, EF Core, SOLID, REST, logging).
  2. Activar skill local `backend-dosier` (Clean Architecture en 4 capas, DosierContext modular, firmas DFRM/P12, PEA oficial en sus 11 secciones, gobernanza curricular y esquemas SIGAFI de solo lectura).

* **Tareas de Documentación Técnica, Memoria de Tesis y Especificación Académica:**
  * Activar skill local `documentacion-dosier` (sincronización obligatoria de `docs/documentacion/`, creación/edición/eliminación de `.md`, cero emojis, protección total de `docs/tesis/` y consistencia para la titulación del ISTPET).

* **Tareas de Seguridad, Login, Credenciales o Base de Datos Sensible:**
  * Activar skill global `gobernanza-datos-segura`.

* **Tareas de Restricción de Alcance o Respuestas Rápidas:**
  * Activar skill global `respuesta-eficiente`.

---

## Gobernanza y Actualización Continua de la Documentación

* **Regla de Actualización Oportuna:** Siempre que se realicen cambios sustanciales o necesarios en el sistema (nuevos controladores o rutas en el backend, modificaciones en la base de datos o scripts DDL, nuevas rutas en React Router, componentes clave de UI o cambios en el flujo de negocio), el agente debe **actualizar de forma puntual y precisa la documentación correspondiente en `docs/documentacion/`** (y en `README.md` si impacta la arquitectura global o la instalación) antes de dar por concluida la tarea.
* **Prohibición Absoluta de Tocar `docs/tesis/`:** Queda terminantemente prohibido modificar, alterar o eliminar archivos en la carpeta `docs/tesis/`.
* **Principio de Mínima Modificación:** No reescribir archivos masivamente ante tareas menores; actualizar únicamente las secciones y archivos estrictamente afectados por el cambio.
* **Prohibición Absoluta de Emojis:** Queda terminantemente prohibido incorporar emojis en la documentación, en el código fuente, en las reglas o en los mensajes de commit.
* **Veracidad y Cero Especulaciones Futuras:** La documentación debe reflejar con exactitud la realidad operativa del código existente, sin incluir funcionalidades futuras hipotéticas o no implementadas.
