# Reglas del Proyecto (DOSIER)

Este archivo define el stack tecnológico y las convenciones exclusivas del proyecto DOSIER (Sistema de Gestión Curricular para el Programa de Estudio de la Asignatura - PEA del ISTPET). Las reglas de comportamiento general (idioma, tokens, búsquedas eficientes, delegación de diagnósticos) están definidas en el `AGENTS.md` global y aplican automáticamente a este workspace.

---

## Stack Tecnológico

* **Frontend:** React 18, Vite, TypeScript
  * *API Client:* Axios — instancia configurada en `api/`, usarla siempre. No usar `fetch` nativo.
  * *Colaboración en tiempo real:* Yjs con componente `<CoWorkField>` para co-redacción concurrente del PEA institucional.
  * *Estilos:* Sistema de diseño basado en **Vercel Geist Design System**. Tailwind CSS v4 integrado nativamente en `base.css`. El proyecto tiene su propio catálogo de clases semánticas (`.bento-card`, `.btn-vercel-*`, `.badge-vercel-*`, etc.).
  * *Regla Cardinal de Diseño Visual:* **Fondos 100% sólidos y opacos, cero transparencias**. Todos los modales, popovers, menús desplegables (`GeistSelect`), selectores de fecha (`GeistDatePicker`) y drawers deben tener fondo sólido (`bg-white` en tema claro, `bg-zinc-950` o `bg-black` en oscuro). Queda terminantemente prohibido el uso de opacidades translúcidas o `backdrop-blur` que generen sangrado de texto (*text bleed-through*).
  * *Cero Emojis:* Empleo exclusivo de iconografía técnica vectorial con Lucide React.
  * *Serialización:* El backend transforma todas las propiedades a `snake_case` de forma global. Al consumir la API en React, mapear siempre esperando `snake_case` y usar fallbacks duales cuando sea necesario (ej: `has_template_update || hasTemplateUpdate`).
* **Backend:** ASP.NET Core Web API (.NET 8), Entity Framework Core 9 (ORM), Pomelo MySQL
  * *Arquitectura:* Clean Architecture en 4 capas (`dosier_domain`, `dosier_application`, `dosier_infrastructure`, `dosier_api`).
  * *RBAC Curricular:* 5 roles oficiales institucionales (`DOSIER_ADMIN`, `DOSIER_DOCENTE`, `DOSIER_COORD_CARRERA`, `DOSIER_COORD_ACAD`, `DOSIER_VICERRECTOR`) en el sistema ID 6 de `sigafi_es`.
* **Base de Datos:** MySQL — base de datos `sigafi_es`, puerto `3306`
  * *Frontera SIGAFI (Solo Lectura):* `carreras` (con `esInstituto = 1`), `periodos`, `mallas_periodos`, `detallemallas`, `profesores`, `asignacion_materias`.
  * *Esquema DOSIER:* Tablas gestionadas por los 4 scripts oficiales en `scripts/base_datos/` (`01_sistema_base.sql`, `02_gobernanza_y_antecedentes_curriculares.sql`, `03_curriculum_pea_oficial.sql`, `04_seguridad_rbac_roles_curriculares.sql`).

---

## Orquestación y Activación de Skills (DOSIER)

Para garantizar que el agente aplique tanto los estándares globales como los patrones específicos del proyecto, activa siempre las habilidades en **cascada/combinación**:

* **Tareas de Frontend (UI, componentes React, Yjs, cliente API):**
  1. Activar skill global `desarrollo-frontend` (reglas generales de UX/UI, React, Hooks y tipado estricto).
  2. Activar skill local `frontend-dosier` (convenciones de CoWorkField, snake_case, umbral de 700 líneas, cliente Axios y regla de fondos sólidos).

* **Tareas de Sistema de Diseño Visual, Tokens CSS, Paleta de Colores, Animaciones o Estilo Vercel:**
  1. Activar skill global `desarrollo-frontend`.
  2. Activar skill local `styles-dosier` (tokens, variables HSL, tipografía Geist, regla de fondos 100% sólidos, cero transparencias y catálogo de clases semánticas).

* **Tareas de Backend (API C#, EF Core, DTOs, migraciones, base de datos):**
  1. Activar skill global `desarrollo-backend` (arquitectura limpia, EF Core, SOLID, REST, logging).
  2. Activar skill local `backend-dosier` (mallas, asignaciones docentes, PEA oficial en sus 11 secciones, gobernanza curricular y esquemas SIGAFI de solo lectura).

* **Tareas de Seguridad, Login, Credenciales o Base de Datos Sensible:**
  * Activar skill global `gobernanza-datos-segura`.

* **Tareas de Restricción de Alcance o Respuestas Rápidas:**
  * Activar skill global `respuesta-eficiente`.

---

## Gobernanza y Actualización Continua de la Documentación

* **Regla de Actualización Oportuna:** Siempre que se realicen cambios sustanciales o necesarios en el sistema (nuevos controladores o rutas en el backend, modificaciones en la base de datos o scripts DDL, nuevas rutas en React Router, componentes clave de UI o cambios en el flujo de negocio), el agente debe **actualizar de forma puntual y precisa la documentación correspondiente en `docs/documentacion/`** (y en `README.md` si impacta la arquitectura global o la instalación) antes de dar por concluida la tarea.
* **Principio de Mínima Modificación:** No reescribir archivos masivamente ante tareas menores; actualizar únicamente las secciones y archivos estrictamente afectados por el cambio.
* **Prohibición Absoluta de Emojis:** Queda terminantemente prohibido incorporar emojis en la documentación, en el código fuente, en las reglas o en los mensajes de commit.
* **Veracidad y Cero Especulaciones Futuras:** La documentación debe reflejar con exactitud la realidad operativa del código existente, sin incluir funcionalidades futuras hipotéticas o no implementadas.
