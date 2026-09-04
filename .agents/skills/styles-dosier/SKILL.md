---
name: styles-dosier
description: >
  Activa esta skill para cualquier tarea que involucre el sistema de diseno visual de DOSIER:
  estilos CSS, tokens de diseno, paleta de colores, tipografia, animaciones, nuevos componentes
  visuales, correccion de inconsistencias de diseno o alineacion estricta con el estilo Vercel.com (Geist).
  Tambien activala cuando el usuario reporte que algo se ve mal o pida mejorar la apariencia
  de cualquier elemento de la interfaz.
---

# DOSIER Design System — Estándar Oficial Vercel.com (Geist)

Esta skill documenta de forma exacta las convenciones de diseño del sistema DOSIER, combinando la precisión minimalista de **Vercel Geist** con la alta densidad de datos requerida para la gestión curricular docente.

---

## 1. Directrices Fundamentales de UX/UI

### 1.1. Prohibido "KPIs Grandes Arriba" (Anti-Patrón de IA Genérica)
* **Anti-patrón:** Poner tarjetas rectangulares gigantes con números desproporcionados arriba de cada pantalla.
* **Patrón Oficial DOSIER (Listas de Resumen de Alta Densidad):** Las métricas y resúmenes se presentan en **bloques de lista horizontal compactos** (`Resumen del Período`, `Distribución Horaria`):
  * Título de sección sobrio en `text-[13px] font-semibold text-text-main`.
  * Filas horizontales: indicador circular/progreso tenue + nombre del concepto (`Horas Docencia`, `Horas APE`, `Horas Autónomo`) + valor tabular alineado (`64h`, `32h`, `64h / 160h Total`).

### 1.2. Estructura Delimitada y Arquitectura de 1 Sola Capa (Uso Equilibrado de Cajas)
* **Dónde SÍ se usan contenedores y tarjetas Bento:**
  * Para bloques de resumen curricular y ficha técnica de la asignatura.
  * Para controles segmentados de pestañas (`p-1 bg-surface rounded-xl` con pestaña activa en relieve).
  * Para enmarcar la matriz semanal de 19 semanas con borde exterior fino (`rounded-xl border border-border-thin divide-y divide-border-thin`).
* **Lo que está PROHIBIDO (Anidamiento Asfixiante):**
  * Meter "cajas dentro de cajas dentro de cajas" con múltiples bordes y fondos apilados.
  * Mantener siempre una jerarquía visual limpia de **1 sola capa contenedora directa**, espaciosa y con suficiente margen de respiración.

### 1.3. Jerarquía Tipográfica y Metadatos Clave
* Los datos institucionales de alto impacto (Código de Asignatura, Horas Malla, Período Académico, Docentes de Cátedra) deben tener presencia y jerarquía destacada:
  * Título principal: `text-xl` o `text-2xl font-bold tracking-tight text-text-main`.
  * Horas y fechas: `text-sm` a `text-[15px] font-bold font-mono text-text-main` organizados en cuadrículas limpias con labels monospaciados en mayúsculas pequeñas (`text-[10.5px] font-bold text-text-dim uppercase tracking-widest`).

### 1.4. Lenguaje Exclusivo del Dominio Académico
* Prohibido mostrar términos de DevOps/Git o jerga no académica.
* Habla en el lenguaje institucional de DOSIER: *PEA*, *Sílabo 19 Semanas*, *Carga Horaria*, *Malla Curricular*, *Resultados de Aprendizaje*, *Guías APE*, *Guía de Estudio*, *Acreditación CACES*.

### 1.5. Cero Emojis y Cero Iconos SVG Decorativos
* Prohibido el uso de emojis en la interfaz.
* Utiliza exclusivamente iconos semánticos de Lucide React con stroke fino (`strokeWidth={1.5}` o `1.75`).

---

## 2. Paleta y Componentes Oficiales

* **Fondo Principal:** `#ffffff` (Canvas claro: `#fafafa` / Dark base: `#000000`).
* **Líneas y Bordes:** `border-border-thin` (`border-zinc-200/80` en claro / `border-zinc-800/80` en oscuro).
* **Superficies Hover / Activas:** `bg-surface-hover` para hover sutil y dinámico.
