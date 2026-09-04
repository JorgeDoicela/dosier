# Reglas del Proyecto (DOSIER)

Este archivo define el stack tecnológico y las convenciones exclusivas del proyecto DOSIER (Sistema de Portafolio Docente y Acreditación Curricular ISTPET). Las reglas de comportamiento general (idioma, tokens, búsquedas eficientes, delegación de diagnósticos) están definidas en el `AGENTS.md` global y aplican automáticamente a este workspace.

---

## Stack Tecnológico

* **Frontend:** React 18, Vite, TypeScript
  * *API Client:* Axios — instancia configurada en `api/`, usarla siempre. No usar `fetch` nativo.
  * *Colaboración en tiempo real:* Yjs con componente `<CoWorkField>` para co-redacción concurrente de PEA y Sílabos.
  * *Estilos:* Sistema de diseño basado en **Vercel Geist Design System**. Tailwind CSS v4 integrado nativamente en `base.css`. El proyecto tiene su propio catálogo de clases semánticas (`.bento-card`, `.btn-vercel-*`, `.badge-vercel-*`, etc.) — usar siempre el sistema antes de crear estilos ad-hoc.
  * *Serialización:* El backend transforma todas las propiedades a `snake_case` de forma global. Al consumir la API en React, mapear siempre esperando `snake_case` y usar fallbacks duales cuando sea necesario (ej: `has_template_update || hasTemplateUpdate`).
* **Backend:** ASP.NET Core Web API (.NET 8), Entity Framework Core 9 (ORM), Pomelo MySQL
* **Base de Datos:** MySQL — base de datos `sigafi_es`, puerto `3306`

---

## Orquestación y Activación de Skills (DOSIER)

Para garantizar que el agente aplique tanto los estándares globales como los patrones específicos del proyecto, activa siempre las habilidades en **cascada/combinación**:

* **Tareas de Frontend (UI, componentes React, Yjs, cliente API):**
  1. Activar skill global `desarrollo-frontend` (reglas generales de UX/UI, React, Hooks y tipado estricto).
  2. Activar skill local `frontend-dosier` (convenciones de CoWorkField, snake_case, umbral de 700 líneas y cliente Axios).

* **Tareas de Sistema de Diseño Visual, Tokens CSS, Paleta de Colores, Animaciones o Estilo Vercel:**
  1. Activar skill global `desarrollo-frontend`.
  2. Activar skill local `styles-dosier` (tokens, variables HSL, tipografía Geist y catálogo de clases semánticas).

* **Tareas de Backend (API C#, EF Core, DTOs, migraciones, base de datos):**
  1. Activar skill global `desarrollo-backend` (arquitectura limpia, EF Core, SOLID, REST, logging).
  2. Activar skill local `backend-dosier` (mallas, PEA, Sílabo 19 semanas, Guías APE, esquemas `sigafi` de solo lectura).

* **Tareas de Seguridad, Login, Credenciales o Base de Datos Sensible:**
  * Activar skill global `gobernanza-datos-segura`.

* **Tareas de Restricción de Alcance o Respuestas Rápidas:**
  * Activar skill global `respuesta-eficiente`.
