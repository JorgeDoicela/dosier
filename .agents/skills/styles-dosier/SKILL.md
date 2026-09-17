---
name: styles-dosier
description: >
  Activa esta skill para cualquier tarea que involucre el sistema de diseño visual de DOSIER:
  estilos CSS, tokens de diseño, paleta de colores, tipografía, animaciones, nuevos componentes
  visuales, corrección de inconsistencias de diseño o alineación estricta con el estilo Vercel.com (Geist).
  También actívala cuando el usuario reporte que algo se ve mal o pida mejorar la apariencia
  de cualquier elemento de la interfaz.
---
# DOSIER Design System — Estándar Oficial Geist Editorial / Enterprise Docs

Esta skill define las reglas obligatorias de diseño visual del sistema DOSIER, combinando la sobriedad y legibilidad de **Geist Editorial / Enterprise Docs** (inspirado en Mintlify y GitBook Enterprise) con la alta densidad y rigor requerido para la gestión curricular y acreditación institucional (PEA / CACES) del ISTPET.

---

## 1. Regla Cardinal de Diseño: Fondos 100% Sólidos y Cero Transparencias

> [!IMPORTANT]
> **Prohibición Total de Transparencias en Componentes Superpuestos:**
> * Todos los modales, popovers, menús desplegables (`GeistSelect`), selectores de fecha (`GeistDatePicker`), drawers y tooltips deben tener **fondos 100% opacos y sólidos**:
>   * **Modo Claro:** Fondo sólido `bg-white` (`#ffffff`) con bordes contrastantes `border border-zinc-200` y sombras `shadow-xl`.
>   * **Modo Oscuro:** Fondo sólido `bg-[#131720]` o `bg-[#0b0d11]` (grafito institucional profundo) con bordes `border border-white/10` o `border-zinc-800`.
> * Queda estrictamente prohibido el uso de clases translúcidas intermedias (como `bg-white/80`, `bg-black/60` o `backdrop-blur` sin color sólido pleno) que generen sangrado o traslape visual de texto (*text bleed-through*) respecto a la página de fondo.

---

## 2. Directrices Fundamentales de UX/UI y Maquetación Editorial

### 2.1. Presentación Compacta de Datos (Anti-Patrón de KPIs Gigantes)
* **Anti-patrón:** Colocar tarjetas gigantes con números desproporcionados en la cabecera de las vistas.
* **Estándar DOSIER:** Presentar la información en **bloques de lista horizontal compactos** de alta densidad informativa:
  * Título de sección sobrio en `text-[13px] font-semibold text-zinc-900 dark:text-zinc-100`.
  * Filas horizontales: indicador circular o barra discreta + concepto formativo (`Docencia CD`, `Prácticas APE`, `Autónomo TA`) + valor tabular alineado (`64h`, `32h`, `64h / 160h Total`).

### 2.2. Arquitectura de Folio Curricular (Uso Equilibrado de Cajas)
* **Dónde SÍ se usan tarjetas y folios:**
  * Para bloques de resumen curricular y ficha técnica de la asignatura (`.bento-card` o `.doc-folio`).
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

## 3. Catálogo de Clases Semánticas y Tokens (`theme.css` / `base.css`)

* **Superficies:**
  * Base principal (Lienzo): `bg-[#f1f3f6]` (claro) / `bg-[#0b0e14]` (oscuro).
  * Superficie de folios y tarjetas: `bg-white` (claro) / `bg-[#121721]` (oscuro).
  * Hover interactivo: `hover:bg-[#f8fafc] dark:hover:bg-[#192130]`.
* **Tipografía Oficial:**
  * Familia: **Inter Puro** (`font-sans`) con soporte óptico variable `opsz`.
  * Variables tipográficas estilísticas obligatorias: `font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'` y `letter-spacing: -0.011em`.
* **Bordes:**
  * Delimitadores sutiles: `border border-[rgba(15,23,42,0.1)] dark:border-[rgba(255,255,255,0.1)]`.
* **Botones Semánticos:**
  * Primario: `.btn-vercel-primary` (fondo texto principal con texto de fondo).
  * Secundario: `.btn-vercel-secondary` (fondo superficie, borde sutil y hover con fondo sólido).
  * Institucional: `.btn-brand` (azul cobalto institucional con sombra sobria de elevación).
