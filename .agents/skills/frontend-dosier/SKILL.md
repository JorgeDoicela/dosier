---
name: frontend-dosier
description: Extiende la skill global de frontend con convenciones y patrones específicos de DOSIER (Yjs, CoWorkField, snake_case, Axios). Activa esta skill EN COMBINACIÓN CON `desarrollo-frontend` para tareas de UI, componentes React, estilos o integraciones del cliente en DOSIER.
---
# Extensión de Frontend — DOSIER

> **Orquestación:** Esta skill **extiende y complementa** las directrices globales de `desarrollo-frontend`. Debe cargarse siempre junto con los principios globales (estética premium, micro-animaciones, tipografía, tipado estricto).

## 1. Regla Cardinal de Diseño Visual: Cero Transparencias y Fondos Sólidos

* **Fondos 100% Opacos y Sólidos:** Todos los componentes flotantes, modales (`FirmaModal`), selectores desplegables (`GeistSelect`), selectores de fecha (`GeistDatePicker`), popovers, tooltips y drawers deben tener fondos **completamente sólidos**:
  * Modo Claro: `bg-white` (`#ffffff`) con bordes contrastantes `border border-zinc-200`.
  * Modo Oscuro: `bg-zinc-950` (`#09090b`) o `bg-black` (`#000000`) con bordes `border border-zinc-800`.
* **Prohibición Terminante:** Queda estrictamente prohibido utilizar clases translúcidas con opacidades intermedias (ej. `bg-white/80`, `bg-black/60` o `backdrop-blur` sin fondo sólido pleno) en elementos emergentes para erradicar el sangrado de texto (*text bleed-through*) y la interferencia con elementos subyacentes.

## 2. Colaboración en Tiempo Real (Yjs / `<CoWorkField>`)

* En los formularios del PEA oficial (Secciones C a J), encapsula los campos de texto enriquecido o descriptivo con el componente `<CoWorkField>`.
* El componente gestiona la conexión con `CollaborationHub` de SignalR y aplica CRDT sin colisiones de edición entre docentes de cátedra.
* Muestra cursores remotos con avatares de presencia docente y autoguarda en segundo plano con debounce.

## 3. Serialización de Datos y Patrón de Fallback Dual

* El backend de DOSIER transforma todas las propiedades a `lower_snake_case` globalmente.
* Al despachar peticiones `POST`, `PUT` o `PATCH`, envía siempre las propiedades en `lower_snake_case`.
* Al consumir respuestas del backend en componentes o servicios de React, lee en `snake_case` y aplica el patrón de fallback dual defensivo:
  ```typescript
  const hasUpdate = response.has_template_update ?? response.hasTemplateUpdate ?? false;
  const peaStatus = response.estado_workflow ?? response.estadoWorkflow ?? 'Borrador';
  ```
* Usa **siempre** el cliente Axios configurado en `src/api/` para todas las comunicaciones HTTP. Queda prohibido el uso de `fetch` nativo.

## 4. Enrutamiento y Mapeo de Roles Curriculares

* La navegación en `src/App.tsx` utiliza React Router v6 con las rutas oficiales:
  * `/dashboard`: Panel de control general.
  * `/documentacion/mis-proyectos`: Mis asignaturas asignadas (Docente).
  * `/documentacion/workspace/:templateCode/:projectUuid`: Constructor y co-redacción concurrente.
  * `/documentacion/revision-tecnica/:projectUuid`: Portal de revisión colegiada y observaciones.
  * `/documentacion`: Supervisión institucional y administración de expedientes.
  * `/plantillas`: Diseñador de plantillas Canvas.
  * `/verificacion/:code`: Comprobación forense pública vía QR sin autenticación.
* `AuthContext` sincroniza y valida los 5 roles curriculares del sistema: `DOSIER_ADMIN`, `DOSIER_DOCENTE`, `DOSIER_COORD_CARRERA`, `DOSIER_COORD_ACAD`, `DOSIER_VICERRECTOR`.

## 5. Modularización y Umbral de Líneas

* El umbral de extracción de subcomponentes en DOSIER es de **700 líneas**.
* Dada la extensión del formulario del PEA oficial (11 secciones a - k), cada sección debe residir en su propio componente modular dentro de `src/components/DOSIER/sections/`.
* Si un archivo supera las 700 líneas, extrae de inmediato sus bloques lógicos a submódulos especializados.
