---
name: styles-dosier
description: >
  Activa esta skill para cualquier tarea que involucre el sistema de diseño visual de DOSIER:
  estilos CSS, tokens de diseño, paleta de colores, tipografía, animaciones, nuevos componentes
  visuales, corrección de inconsistencias de diseño o alineación estricta con el estilo Vercel.com (Geist).
  También actívala cuando el usuario reporte que algo se ve mal o pida mejorar la apariencia
  de cualquier elemento de la interfaz.
---
# DOSIER Design System — Estándar Oficial Vercel Geist

Esta skill define las reglas obligatorias de diseño visual del sistema DOSIER, combinando la precisión minimalista de **Vercel Geist** con la alta densidad y sobriedad requerida para la gestión curricular institucional del ISTPET.

---

## 1. Regla Cardinal de Diseño: Fondos 100% Sólidos y Cero Transparencias

> [!IMPORTANT]
> **Prohibición Total de Transparencias en Componentes Superpuestos:**
> * Todos los modales, popovers, menús desplegables (`GeistSelect`), selectores de fecha (`GeistDatePicker`), drawers y tooltips deben tener **fondos 100% opacos y sólidos**:
>   * **Modo Claro:** Fondo sólido `bg-white` (`#ffffff`) con bordes contrastantes `border border-zinc-200` y sombras `shadow-xl`.
>   * **Modo Oscuro:** Fondo sólido `bg-zinc-950` (`#09090b`) o `bg-black` (`#000000`) con bordes `border border-zinc-800`.
> * Queda estrictamente prohibido el uso de clases translúcidas intermedias (como `bg-white/80`, `bg-black/60` o `backdrop-blur` sin color sólido pleno) que generen sangrado o traslape visual de texto (*text bleed-through*) respecto a la página de fondo.

---

## 2. Directrices Fundamentales de UX/UI y Maquetación

### 2.1. Presentación Compacta de Datos (Anti-Patrón de KPIs Gigantes)
* **Anti-patrón:** Colocar tarjetas gigantes con números desproporcionados en la cabecera de las vistas.
* **Estándar DOSIER:** Presentar la información en **bloques de lista horizontal compactos** de alta densidad informativa:
  * Título de sección sobrio en `text-[13px] font-semibold text-zinc-900 dark:text-zinc-100`.
  * Filas horizontales: indicador circular o barra discreta + concepto formativo (`Docencia CD`, `Prácticas APE`, `Autónomo TA`) + valor tabular alineado (`64h`, `32h`, `64h / 160h Total`).

### 2.2. Arquitectura de 1 Sola Capa Contenedora (Uso Equilibrado de Cajas)
* **Dónde SÍ se usan tarjetas y bordes:**
  * Para bloques de resumen curricular y ficha técnica de la asignatura (`.bento-card`).
  * Para controles segmentados de pestañas del PEA (`p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg`).
  * Para enmarcar tablas de contenidos temáticos y matrices de evaluación con bordes definidos.
* **Lo que está PROHIBIDO (Anidamiento Excesivo):**
  * Colocar cajas dentro de cajas con múltiples bordes y fondos apilados que asfixien la lectura.
  * Mantener siempre una jerarquía limpia de **1 sola capa contenedora directa**, espaciosa y con márgenes de respiración adecuados.

### 2.3. Jerarquía Tipográfica Institucional
* Datos institucionales clave (Código de Asignatura, Carga Horaria, Período Lectivo, Docentes de Cátedra) con jerarquía nítida:
  * Título principal: `text-xl` o `text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50`.
  * Horas y fechas: `text-sm` a `text-[15px] font-bold font-mono text-zinc-900 dark:text-zinc-100` con etiquetas en mayúsculas pequeñas (`text-[10.5px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest`).

### 2.4. Vocabulario Técnico Académico
* Prohibido mostrar términos de desarrollo, jerga de bases de datos o conceptos ajenos al ámbito pedagógico en interfaces de usuario finales.
* Utiliza el léxico institucional oficial: *PEA (Programa de Estudio de la Asignatura)*, *Carga Horaria*, *Malla Curricular*, *Resultados de Aprendizaje*, *Competencias*, *Campos de Formación*, *Acreditación CACES*.

### 2.5. Cero Emojis
* Queda prohibido el uso de emojis en cualquier componente, botón, alerta o encabezado de la interfaz.
* Utiliza exclusivamente iconos vectoriales de Lucide React con grosor fino (`strokeWidth={1.5}` o `1.75`).

---

## 3. Catálogo de Clases Semánticas y Tokens (`base.css`)

* **Superficies:**
  * Base principal: `bg-white` (claro) / `bg-black` (oscuro).
  * Fondo de tarjetas: `bg-zinc-50` o `bg-white` (claro) / `bg-zinc-900` o `bg-zinc-950` (oscuro).
  * Hover interactivo: `hover:bg-zinc-100 dark:hover:bg-zinc-800`.
* **Bordes:**
  * Delimitadores sutiles: `border border-zinc-200 dark:border-zinc-800`.
* **Botones Semánticos:**
  * Primario: `.btn-vercel-primary` (fondo negro con texto blanco en claro / fondo blanco con texto negro en oscuro).
  * Secundario: `.btn-vercel-secondary` (fondo transparente, borde sutil y hover con fondo sólido).
