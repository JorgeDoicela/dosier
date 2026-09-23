---
name: styles-dosier
description: Activa esta skill para el sistema de diseño visual de DOSIER basado en Geist Editorial / Enterprise Docs: tokens CSS, Tailwind CSS v4, paleta de colores HSL, tipografía Inter Puro, catálogo de clases semánticas (.surface-subtle, .badge-subtle) y la regla estricta de fondos 100% sólidos sin transparencias ni sangrado visual.
---
# DOSIER Design System — Estándar Oficial Geist Editorial / Enterprise Docs

> **Propósito Institucional:** Esta skill rige la arquitectura visual y el sistema de diseño de **DOSIER** (Sistema de Gestión Curricular para el Programa de Estudio de la Asignatura - PEA del ISTPET). Fusiona la sobriedad, legibilidad y pulcritud de **Geist Editorial / Enterprise Docs** (inspirado en Mintlify y GitBook Enterprise) con la alta densidad informativa y el rigor académico exigido por el CACES para la educación superior técnica y tecnológica del Ecuador.

---

## 1. Regla Cardinal de Diseño Visual: Fondos 100% Sólidos y Cero Transparencias

> [!IMPORTANT]
> **Prohibición Total de Transparencias en Componentes Superpuestos:**
> * Todos los modales, popovers, menús desplegables (`GeistSelect`), selectores de fecha (`GeistDatePicker`), drawers y tooltips deben tener **fondos 100% opacos y sólidos**:
>   * **Modo Claro:** Fondo sólido `bg-white` (`#ffffff`) con bordes definidos `border border-zinc-200` y sombras volumétricas `shadow-xl`.
>   * **Modo Oscuro:** Fondo sólido `bg-zinc-950` (`#09090b`) o `bg-[#131720]` con bordes `border border-zinc-800`.
>   * **Cabeceras y Pies de Modales:** Fondo sólido `bg-zinc-50 dark:bg-zinc-900` completamente opaco.
> * **Justificación Ergonómica y Visual:** El uso de fondos translúcidos (`/50`, `/40`) o `backdrop-blur` sin color plano de fondo provoca sangrado tipográfico (*text bleed-through*), volviendo ilegibles los textos cuando el usuario se desplaza detrás de las ventanas emergentes en pantallas de alta densidad.

---

## 2. Directrices Fundamentales de UX/UI y Maquetación Editorial

### 2.1. Presentación Compacta de Datos (Anti-Patrón de KPIs Gigantes)
* **Anti-patrón:** Tarjetas enormes con números o porcentajes gigantescos en la cabecera de las vistas que empujan el contenido curricular operativo fuera del primer plano visual.
* **Estándar DOSIER:** Presentación en **bloques de lista horizontal compactos** de alta densidad informativa:
  * Título de sección sobrio en `text-[13px] font-semibold text-zinc-900 dark:text-zinc-100`.
  * Filas horizontales con indicador circular o barra de avance discreta + concepto formativo (`Docencia CD`, `Prácticas APE`, `Autónomo TA`) + valor tabular numérico alineado (`64h`, `32h`, `64h / 160h Total`).

### 2.2. Arquitectura de Folio Curricular (Uso Equilibrado de Cajas)
* **Dónde SÍ se usan tarjetas y folios:**
  * Bloques de resumen curricular y ficha técnica de la asignatura (`.bento-card` o folio con borde fino).
  * Controles segmentados de navegación por pestañas del PEA (`.segmented-container`).
  * Tablas de contenidos temáticos y matrices de evaluación con bordes nítidos.
* **Lo que está PROHIBIDO (Anidamiento Excesivo):**
  * Cajas dentro de cajas con múltiples bordes y fondos apilados que saturen cognitivamente al docente.
  * Mantener siempre una jerarquía limpia de **1 sola capa contenedora directa**, espaciosa y con márgenes de respiración adecuados (`p-5` o `p-6`).

### 2.3. Jerarquía Tipográfica Institucional (Inter Puro)
* **Familia Tipográfica Oficial:** **Inter Puro** (`font-sans`) con soporte óptico variable `opsz`.
* **Variables Tipográficas Obligatorias:**
  ```css
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  letter-spacing: -0.011em;
  ```
* **Escala Visual:**
  * Título principal: `text-xl` o `text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50`.
  * Subtítulos de sección: `text-sm font-semibold text-zinc-800 dark:text-zinc-200`.
  * Horas, códigos y fechas: `text-sm` a `text-[15px] font-bold font-mono text-zinc-900 dark:text-zinc-100` con etiquetas descriptivas en mayúsculas pequeñas (`text-[10.5px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest`).

### 2.4. Vocabulario Técnico Académico
* Prohibido mostrar identificadores internos de bases de datos, claves primarias numéricas o jerga de desarrollo en interfaces destinadas a usuarios docentes o coordinadores.
* Utilizar estrictamente el léxico institucional oficial: *Programa de Estudio de la Asignatura (PEA)*, *Carga Horaria*, *Malla Curricular*, *Resultados de Aprendizaje (RDA)*, *Campos de Formación*, *Acreditación CACES*.

### 2.5. Cero Emojis
* Queda terminantemente prohibido el uso de emojis en cualquier componente, botón, alerta, modal o encabezado de la interfaz.
* Utilizar exclusivamente iconografía vectorial técnica con **Lucide React**, manteniendo trazos finos y uniformes (`strokeWidth={1.5}` o `1.75`).

---

## 3. Catálogo de Clases Semánticas y Tokens (`src/styles/base.css`)

### 3.1. Tokens de Color Globales
* **Lienzo Principal:** `bg-[#f1f3f6]` (modo claro) / `bg-[#0b0e14]` o `bg-[#09090b]` (modo oscuro).
* **Superficie de Tarjetas:** `bg-white` (modo claro) / `bg-[#121721]` o `bg-zinc-950` (modo oscuro).
* **Superficie Sutil (`--subtle`):**
  * Modo Claro: `--subtle: #f2f4f7;`, `--subtle-border: rgba(0, 0, 0, 0.05);`, `--subtle-hover: #e4e7ec;`
  * Modo Oscuro: `--subtle: #181d27;`, `--subtle-border: rgba(255, 255, 255, 0.07);`, `--subtle-hover: #222938;`

### 3.2. Clases de Utilidad Semánticas Oficiales
* `.surface-subtle`: Contenedores secundarios, bloques de notas y detalles con fondo sutil y borde tenue.
* `.badge-subtle`: Píldora con tipografía monoespaciada para códigos de asignatura (`#f2f4f7`), estados de workflow institucional y roles RBAC.
* `.segmented-container` y `.segmented-item-active`: Estructura institucional para selectores horizontales (ej: `RoleFlowBanner`), pestañas y filtros de tabla.
* `.bento-card`: Tarjeta contenedora con elevación suave y borde sutil para datos de asignaturas y expedientes.
* `.btn-vercel-primary`: Botón de acción principal de alto contraste (fondo del texto principal con texto del fondo).
* `.btn-vercel-secondary`: Botón de acción secundaria con borde sutil y hover sólido.

---

## 4. Guía para la Creación de Nuevos Modales y Vistas

Al crear o modificar cualquier modal o diálogo curricular:
1. **Contenedor Raíz:** Utilizar fondo de pantalla completa fijo con oscurecimiento sólido para el backdrop (`fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4`).
2. **Cuerpo del Modal:** Definir fondo 100% sólido y bordes nítidos (`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden`).
3. **Cabecera y Pie:** Utilizar fondo sutil sólido (`bg-zinc-50 dark:bg-zinc-900 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800` en la cabecera; `bg-zinc-50 dark:bg-zinc-900 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3` en el pie).
4. **Contenido Central:** Scroll vertical independiente si el contenido es extenso (`max-h-[80vh] overflow-y-auto p-6`).

---

## 5. Checklist de Verificación de Estilo y UI

Antes de finalizar cualquier modificación visual en DOSIER:
* [ ] ¿Todos los modales y menús desplegables tienen fondos 100% sólidos (cero `dark:bg-zinc-900/50` o similares)?
* [ ] ¿Se utilizó la tipografía Inter Puro con tracking sutil y variables de características OpenType?
* [ ] ¿La interfaz está completamente libre de emojis?
* [ ] ¿Los botones y selectores utilizan las clases semánticas oficiales (`.btn-vercel-*`, `.badge-subtle`, `.segmented-container`)?
* [ ] ¿Se evitó el anidamiento excesivo de cajas y tarjetas?
* [ ] ¿Los iconos provienen de Lucide React con trazo de 1.5 o 1.75?
