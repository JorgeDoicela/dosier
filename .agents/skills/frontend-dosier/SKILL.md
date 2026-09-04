---
name: frontend-dosier
description: Extiende la skill global de frontend con convenciones y patrones específicos de DOSIER (Yjs, CoWorkField, snake_case, Axios). Activa esta skill EN COMBINACIÓN CON `desarrollo-frontend` para tareas de UI, componentes React, estilos o integraciones del cliente en DOSIER.
---
# Extensión de Frontend — DOSIER

> **Orquestación:** Esta skill **extiende y complementa** las directrices globales de `desarrollo-frontend`. Debe cargarse siempre junto con los principios globales (estética premium, micro-animaciones, tipografía, tipado estricto).


## 1. Colaboración en Tiempo Real (Yjs / CoWorkField)

* En formularios curriculares editables (PEA, Sílabo 19 semanas), encapsula los campos de entrada con el componente `<CoWorkField>` configurado con su `name` y el manejador `cowork`.
* Los nombres de campo **deben coincidir exactamente** con la estructura definida en las plantillas oficiales (ej: `ObjetivoGeneral`, `ResultadosAprendizaje`, `Semana1Contenido`).

## 2. Serialización API — snake_case

* El backend de DOSIER transforma globalmente todas las propiedades a `snake_case` en la serialización. Al consumir la API desde React, mapea siempre esperando `snake_case` y provee fallbacks duales para evitar fallos de tipado:
  ```ts
  const value = response.has_template_update ?? response.hasTemplateUpdate;
  ```
* Usa **siempre** el cliente Axios configurado (`api`) para todas las llamadas al backend. No uses `fetch` nativo.

## 3. Modularización — Umbral DOSIER

* El umbral de extracción de subcomponentes en DOSIER es de **700 líneas** (más permisivo que el estándar global de 400-500, dado el alto acoplamiento del editor curricular y matriz semanal). Si una página o componente supera las 700 líneas, extrae inmediatamente sus secciones a componentes hijos en una subcarpeta `components/`.

## 4. Convenciones UI — DOSIER

* Usa `custom-scrollbar` como clase CSS estándar del proyecto para barras de scroll discretas.
* Los sidebars colapsables y arrastrables deben persistir su estado de visibilidad con `localStorage`.
* En selects/dropdowns con catálogos relacionales de SIGAFI (`carreras`, `mallas`, `asignaturas`, `parciales`), verifica que cada opción exponga el `id` local y las claves de vinculación necesarias.

## 5. Sistema de Color y Selector Unificado de Plantillas

* **Componente Compartido (`ColorPickerField`):** Ubicado en `src/pages/Admin/Templates/components/properties/SharedColorPicker.tsx`. Debe usarse como el estándar único en todos los paneles de propiedades para selección de color.
* **Normalización y Contraste Automático:**
  - `getContrastFg(color)`: Calcula por luminancia si el texto del encabezado debe ser blanco (`#ffffff`) u oscuro (`#0f172a`), garantizando siempre legibilidad en exportaciones PDF y previsualizaciones.
