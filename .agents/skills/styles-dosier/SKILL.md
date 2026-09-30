---
name: styles-dosier
description: Activa esta skill para el sistema de diseño visual de DOSIER basado en Modern Enterprise Docs (Stripe Docs, Mintlify, GitBook Enterprise, Linear): estética técnica y profesional con acentos vivos (#0070f3, esmeralda), steppers verticales interactivos, navegación de pestañas sobre riel plano (prohibición absoluta de segmented controls tipo iOS/macOS), badges de estado normativo con puntos discretos, especificaciones clave-valor de alta densidad, cero KPIs gigantes y fondos 100% sólidos.
---
# DOSIER Design System — Estándar Oficial Modern Enterprise Docs

> **Propósito Institucional:** Esta skill rige la arquitectura visual, componentes de interfaz y directrices de diseño de **DOSIER** (Sistema de Gestión Curricular para el Programa de Estudio de la Asignatura - PEA del ISTPET). Implementa de forma integral y rigurosa el estándar **Modern Enterprise Docs** de alta gama (inspirado en Stripe Docs, Mintlify, GitBook Enterprise y Linear Docs), combinando pulcritud técnica, acentos cromáticos vivos, legibilidad ejecutiva y cero elementos superfluos.

---

## 0. Mandato de Alcance Universal e Innegociable (100% del Sistema)

El estándar **Modern Enterprise Docs rige de forma absoluta y universal en TODO el sistema sin excepciones**:

1. **En TODAS las Pantallas y Vistas:**
   - Dashboards de los 5 roles curriculares (*Docente*, *Coord. Carrera*, *Coord. Académica*, *Vicerrectorado*, *Administrador*).
   - Espacio de trabajo y lienzo colaborativo del PEA oficial (`/documentacion/workspace/pea-oficial/...`).
   - Editor y Diseñador Visual de Plantillas Documentales (`/admin/templates`).
   - Calendario Normativo, Cronograma CACES y Tablero Kanban (`/calendario`).
   - Gestión de Personal y Usuarios (`/admin/usuarios`).
   - Auditoría Forense y Trazabilidad LOPDP (`/admin/auditoria`).
   - Motor de Comunicaciones y Plantillas de Correo (`/admin/emails`).
   - Analíticas Institucionales y Portafolio Curricular (`/analiticas`).
   - Bandeja de Notificaciones y Feeds de Eventos (`/notificaciones`).
   - Ajustes, Configuración de Sistema y Perfiles de Firma Digital (`/configuracion`).

2. **En TODOS los Componentes Estructurales:**
   - **Barras de Navegación:** Barra lateral (`Sidebar`), barra superior (`Topbar`), cabeceras de página (`PageHeader`).
   - **Pestañas y Selectores:** Exclusivamente sobre **riel plano continuo** (`<nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">`) con borde inferior activo `#0070f3`, sin márgenes negativos en botones (`-mb-[1px]` prohibido) y **cero segmented controls** tipo iOS/macOS encapsulados en cajas grises.
   - **Steppers de Proceso:** Línea conectora continua vertical con nodos circulares numerados (`w-8 h-8 rounded-full`) y acento activo `#0070f3`.
   - **Tablas de Datos:** Cabeceras en tipografía mono tenue (`text-[11px] font-mono uppercase tracking-wider text-slate-500`), filas con divisores finos y estados representados exclusivamente por **puntos discretos** (`w-1.5 h-1.5 rounded-full`), **cero cápsulas envolventes**.
   - **Superficies y Paneles:** **Fondos 100% sólidos y opacos** en modales, popovers, selectores (`GeistSelect`, `GeistDatePicker`) y drawers (`bg-white` en modo claro, `bg-zinc-950` en oscuro). Prohibición absoluta de transparencias (`/50`, `/40`) o `backdrop-blur`.
   - **Feeds y Notificaciones:** Folio continuo con divisores (`divide-y`), punto azul discreto (`w-2 h-2 rounded-full bg-[#0070f3]`) y fecha única. Prohibidas barras laterales gruesas (`border-l-4`).
   - **Paneles Laterales e IDEs:** Pestañas de inspección (ej: *Propiedades* / *Estilos*) con acento `#0070f3` (cero líneas negras `border-text-main`), iconos vectoriales desnudos y estados vacíos con capitalización natural.

3. **En TODOS los Colores y Tokens Semánticos:**
   - Acento técnico corporativo: `#0070f3` (azul eléctrico Vercel/Linear).
   - Acento normativo CACES: Verde esmeralda (`emerald-600/700`, `bg-emerald-50`).
   - Acento de alertas/observaciones: Ámbar (`amber-600`).
   - Superficies neutras: Escala Slate en modo claro, escala Zinc de precisión en modo oscuro (`#131720`, `#181d27`).

4. **En TODA la Tipografía:**
   - Tipografía Inter Variable oficial (`@fontsource-variable/inter`) en todo el sistema.
   - Capitalización natural (*Docentes*, *Administrativos*, *Con carga docente*, *Ocultar cabecera*). **Prohibición absoluta de mayúsculas forzadas (ALL CAPS)** en botones, pestañas, filtros o estados vacíos.
   - Cero emojis en toda la aplicación.

---

## 1. Filosofía y Principios Fundamentales del Diseño

### 1.1. Simplicidad, Aire y Maquetación Despejada
* **Cero Amontonamiento:** Estructura espaciosa con paddings y gaps generosos (`p-6` a `p-8`, `gap-6` a `gap-8`). Cada elemento debe respirar con holgura.
* **Folio Unificado:** En lugar de apilar múltiples cajas anidadas (*cards inside cards*), se utiliza un **Folio Unificado** con divisiones internas tenues mediante bordes de precisión (`border-slate-200/90` o `border-zinc-200 dark:border-zinc-800`).
* **Cero Mezclas con Marketing:** Prohibido mezclar con elementos de landing pages (cero botones macOS semáforo "rojo/amarillo/verde", cero barras falsas de navegador, cero URLs decorativas).
* **Cero Emojis:** Empleo exclusivo de iconografía técnica vectorial con Lucide React (`strokeWidth={1.5}` o `1.75`) desnuda y directa.

---

## 2. Sistema Tipográfico Oficial: Inter Puro (Variable)

El sistema utiliza exclusivamente la tipografía **Inter Variable** oficial instalada localmente (`@fontsource-variable/inter`), garantizando consistencia tipográfica sin depender de CDNs externas.

### 2.1. Configuración Obligatoria de Tokens y Features OpenType
* `--font-sans`: `"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
* `--font-mono`: `"Inter Variable", "Inter", monospace` (con cifras tabulares y cero cruzado activados)
* **Funciones OpenType en `:root`:**
  ```css
  font-feature-settings: 'cv02' 1, 'cv03' 1, 'cv04' 1, 'cv11' 1, 'calt' 1, 'liga' 1;
  font-optical-sizing: auto;
  ```
* **Elementos Numéricos y Tablas (`.font-mono`, `.tabular-nums`):**
  ```css
  font-feature-settings: 'cv02' 1, 'cv03' 1, 'cv04' 1, 'cv11' 1, 'tnum' 1, 'zero' 1;
  ```

### 2.2. Jerarquía y Tamaños de Fuente
* **Títulos de Página (`h1`):** `text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white`
* **Subtítulos y Secciones (`h2`, `h3`):** `text-base md:text-lg font-semibold text-slate-900 dark:text-white`
* **Cuerpo de Texto y Contenido:** `text-xs md:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed`
* **Parámetros Técnicos y Metadatos:** `text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500`
* **Prohibición de Micro-Texto:** Queda prohibido el uso de tamaños de fuente menores a 10px (`text-[8px]`, `text-[9px]`) en textos legibles o etiquetas operativas.

---

## 3. Paleta Cromática y Tokens Semánticos

### 3.1. Acentos Vivos y Estados de Dominio
* **Azul Eléctrico Corporativo (`#0070f3` / `blue-600`):**
  - Uso: Estado activo de navegación, fases en curso, pestañas seleccionadas, enlaces interactivos y botones de acción primaria.
  - Hover: `#005bb5`, Active: `#004ca3`, Anillo de foco: `ring-4 ring-blue-100 dark:ring-blue-950`.
* **Verde Esmeralda Normativo (`emerald-600` / `emerald-700`):**
  - Uso: Hitos completados, validación CACES aprobada, firma electrónica estampada y estado conforme.
  - Fondo sutil de acompañamiento: `bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800`.
* **Ámbar de Advertencia (`amber-600` / `amber-700`):**
  - Uso: Observaciones disciplinarias pendientes, plazos por vencer y revisiones requeridas.
  - Fondo sutil: `bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800`.
* **Rojo Carmín de Error (`rose-600` / `rose-700`):**
  - Uso: Rechazos normativos, observaciones críticas y alertas de bloqueo.
  - Fondo sutil: `bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800`.

### 3.2. Superficies y Lienzos (Fondos 100% Sólidos)
* **Lienzo Base:** `#f8fafc` (`slate-50`) en claro / `#0b0d11` en oscuro.
* **Superficies y Tarjetas:** `#ffffff` (`bg-white`) en claro / `#09090b` a `#131720` (`bg-zinc-950`) en oscuro.
* **Cabeceras de Tabla y Paneles Secundarios:** `bg-zinc-50` en claro / `bg-zinc-900` en oscuro.
* **Bordes de Precisión:** `border-slate-200/90` (`#e2e8f0`) en claro / `border-zinc-800` (`#27272a`) en oscuro.

---

## 4. Catálogo Canónico de Componentes

### 4.1. Navegación por Pestañas (Pestañas sobre Riel vs Segmented Controls Prohibidos)
* **Anti-patrón Terminantemente Prohibido:** *Segmented controls* estilo iOS/macOS (cajas encapsuladas redondeadas `rounded-lg bg-zinc-100`, bordes envolventes y botones interiores flotantes con sombras o fondos elevados).
* **Prevención Crítica de Sliders/Scrollbars Verticales:**
  * **Regla de Oro:** **NUNCA** colocar márgenes negativos (`-mb-[1px]`, `-mb-[13px]`) en los botones `<button>` individuales ni en la pestaña activa.
  * **Causa Raíz del Slider en Pestañas:** Cuando un contenedor `<nav>` tiene `overflow-x: auto`, la especificación CSS fuerza automáticamente `overflow-y: auto`. Si los botones tienen `-mb-[1px]` o alturas dispares, el motor del navegador detecta un desbordamiento vertical y renderiza una barra de scroll vertical (slider) indeseada.
  * **Solución Arquitectónica:**
    1. El desplazamiento de 1px hacia el borde del contenedor se aplica **exclusivamente al `<nav>` contenedor** mediante `-mb-px`.
    2. El contenedor `<nav>` debe declarar obligatoriamente `overflow-x: auto overflow-y-hidden no-scrollbar`.
    3. Todos los botones (`<button>`) deben tener la **misma altura, padding y grosor de borde** (`border-b-2 pb-2.5 pt-1 px-0.5`). La pestaña activa solo cambia el color de borde (`border-[#0070f3]`), jamás sus márgenes o dimensiones.
* **Estándar Obligatorio Modern Enterprise Docs:**
  * **Contenedor del Riel:** `<div className="border-b border-slate-200 dark:border-zinc-800">`
  * **Navegador con Riel:** `<nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" aria-label="...">`
  * **Elemento de Pestaña:** Botón interactivo plano sin caja envolvente (`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap`):
    * **Pestaña Inactiva:** `border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium`.
    * **Pestaña Activa:** `border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold`.
  * **Cero Cápsulas ni Sombras:** Prohibido encerrar el grupo de pestañas en fondos grises redondeados.

### 4.2. Tablas de Gestión y Densidad Editorial
* **Estructura del Contenedor:** `overflow-x-auto border border-slate-200/90 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950`.
* **Cabecera de Tabla (`thead`):** `bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200/90 dark:border-zinc-800 text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider`.
* **Filas (`tr`):** `divide-y divide-slate-100 dark:divide-zinc-800 hover:bg-slate-50/60 dark:hover:bg-zinc-900/60 transition-colors`.
* **Puntos Discretos de Estado (Regla Anti-Cápsula):**
  * Prohibido envolver estados en píldoras o cápsulas (`rounded-full border bg-... px-3 py-1`).
  * Estándar obligatorio: Punto indicador discreto (`w-1.5 h-1.5 rounded-full`) + texto con tipografía de color correspondiente:
    ```tsx
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Legalizado CACES</span>
    </span>
    ```

### 4.3. Steppers y Rieles Conectores (Connected Rails)
* **Línea Conectora Vertical:** Línea continua nítida (`w-[2px] bg-slate-200 dark:bg-zinc-800`) que guía el progreso de fases.
* **Nodos Circulares Numerados:** Círculos estilizados (`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold`):
  * **Paso completado:** `bg-emerald-500 text-white` con icono `<Check size={14} className="stroke-[3]" />`.
  * **Paso activo:** `bg-[#0070f3] text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-xs`.
  * **Paso futuro:** `bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400`.
* **Tarjeta de Fase Activa:** Resaltada sutilmente con `bg-blue-50/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900` y chevron suave.

### 4.4. Botones y Elementos de Acción
* **Botón Primario:**
  ```tsx
  <button className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs disabled:opacity-40 cursor-pointer inline-flex items-center gap-2">
  ```
* **Botón Secundario:**
  ```tsx
  <button className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 transition-all cursor-pointer inline-flex items-center gap-2">
  ```
* **Botón Peligro / Destructivo:**
  ```tsx
  <button className="px-3.5 py-2 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 transition-all cursor-pointer inline-flex items-center gap-2">
  ```
* **Prohibiciones en Botones:** Prohibido transformar texto de botones a mayúsculas forzadas (`uppercase tracking-widest text-[10px]`) por defecto; usar Sentence case natural (`text-xs font-semibold`).

### 4.5. Formularios, Inputs y Selectores
* **Inputs y Textareas:**
  - `bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/15 transition-all`.
* **Selectores Personalizados (`GeistSelect`):**
  - Fondo 100% sólido y opaco en menús desplegables (`bg-white` en claro, `bg-zinc-950` en oscuro). Cero sangrado de texto.
* **Grupos de Opciones / Botones de Opción Rápida:**
  - No encapsular en cajas grises tipo segmented control. Usar botones planos individuales con borde fino (`border border-slate-200 dark:border-zinc-800`), donde el activo adopta `bg-[#0070f3] text-white border-[#0070f3]`.

### 4.6. Modales, Diálogos y Drawers (Regla Cardinal de Fondos 100% Sólidos)
* **Prohibición Total de Transparencias:** Queda estrictamente prohibido el uso de `backdrop-blur` o fondos translúcidos (`/50`, `/40`) en capas superpuestas sin respaldo sólido.
* **Estructura Canónica de Modal:**
  * **Overlay:** `fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4`.
  * **Contenedor:** `bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden`.
  * **Cabecera y Pie:** Fondo sólido opaco `bg-zinc-50 dark:bg-zinc-900 border-b / border-t border-slate-200 dark:border-zinc-800`.
  * **Cuerpo:** `p-6 space-y-4 bg-white dark:bg-zinc-950`.

### 4.7. Fichas de Especificación Técnica Clave-Valor (Anti-KPIs Gigantes)
* **Anti-patrón Prohibido:** Tarjetas con números gigantescos (`text-4xl`, `text-5xl font-extrabold`) acompañados de gráficos sparklines decorativos que ocupan espacio operativo.
* **Estándar Obligatorio:** Métricas en listas clave-valor (`<dl>`) o tablas compactas:
  - Etiqueta: `font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[11px] w-36 shrink-0`.
  - Valor: `text-xs font-semibold text-slate-800 dark:text-slate-200`.

### 4.8. Prohibición Absoluta de Cápsulas Envolventes ("Eso que rodea")
* **Definición:** Píldoras o burbujas con bordes redondeados y fondos tintados (`rounded-full border bg-... px-3 py-1`) colocadas alrededor de palabras, etiquetas, nombres, códigos o iconos SVG.
* **Reglas:**
  * **Cero wrappers en iconos SVG:** Prohibido encerrar iconos en cajas redondeadas de colores (`<div className="w-9 h-9 rounded-lg bg-blue-50...">`). Los iconos se presentan directos y desnudos.
  * **Cero cápsulas en palabras ordinarias o nombres:** Prohibido envolver nombres de usuarios, docentes o materias en píldoras.
  * **Cero cápsulas en códigos o celdas:** Los códigos de asignaturas (`DS-201`), horas y créditos van en tipografía limpia (`font-mono text-xs text-slate-500`), jamás dentro de cápsulas ni recuadros grises.

### 4.9. Listas de Notificaciones, Feeds y Callouts (Prohibición de Bordes Laterales y Cajas Aisladas)
* **Anti-patrones Prohibidos:**
  * **Bordes laterales gruesos:** Prohibido usar barras de acento vertical a la izquierda (`border-l-4`, `border-l-2`, estilo callout genérico de Bootstrap).
  * **Cajas aisladas amontonadas:** Prohibido renderizar listados cronológicos como tarjetas independientes con bordes completos apiladas una sobre otra (`space-y-2` con `rounded-lg border`).
  * **Duplicación de marcas temporales:** Prohibido repetir la fecha dos veces en el mismo elemento (ej: "Hace 4d" arriba y "viernes, 25 de septiembre..." abajo).
* **Estándar Obligatorio Modern Enterprise Docs (Estilo Linear / Stripe):**
  * **Folio Unificado con Lista Continua:** Todo el grupo se contiene en un único folio (`rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden`).
  * **Indicador de Estado No Leído:** Se señala exclusivamente con un punto azul corporativo alineado (`w-2 h-2 rounded-full bg-[#0070f3]`) o un fondo sutil con acento ténue (`bg-blue-50/20 dark:bg-blue-950/10`), **jamás con bordes laterales gruesos**.
  * **Jerarquía Horizontal Nítida:**
    - Icono técnico desnudo Lucide alineado al texto.
    - Título (`text-xs font-semibold text-slate-900 dark:text-white`) y mensaje resumido (`line-clamp-2`).
    - Metadato temporal único en la esquina superior derecha (`text-[11px] font-mono text-slate-400`).
    - Acciones de mantenimiento (eliminar, marcar leída) con visibilidad elegante en hover (`group-hover:opacity-100`).

### 4.10. Filtros Secundarios y Subfiltros Contextuales (Prohibición de Cajas Encapsuladas y Mayúsculas Gritadas)
* **Anti-patrones Terminantemente Prohibidos:**
  * **Segmented Controls y Cajas Encapsuladas en Filtros:** Prohibido encerrar botones de filtros o sub-categorías dentro de cajas grises redondeadas con bordes (`bg-surface border p-1 rounded-lg`) y botones flotantes con sombras (`shadow-xs`).
  * **Cajas dentro de Cajas:** Prohibido anidar una caja para el encabezado, dentro otra caja para las pestañas principales, y abajo otra caja encapsulada para los subfiltros.
  * **Píldoras Tintadas de Color:** Prohibido envolver botones activos de filtro en cápsulas celestes/azules con fondos o bordes coloreados (`bg-brand/15 text-brand border border-brand/30`).
  * **Mayúsculas Gritadas (ALL CAPS):** Prohibido usar `font-black uppercase tracking-wider text-[10px]` en botones de navegación, pestañas o filtros (`DOCENTES`, `ADMINISTRATIVOS`, `CON CARGA DOCENTE`, `CON HORAS DE INVESTIGACIÓN`). La interfaz de Modern Enterprise Docs es un entorno editorial sobrio, no un panel militar ni publicitario.
* **Estándar Obligatorio Modern Enterprise Docs:**
  * **Vistas Principales:** Siempre sobre **riel plano continuo** (`border-b border-slate-200 dark:border-zinc-800`), con `<nav className="-mb-px ...">` y pestaña activa destacada exclusivamente por su borde inferior (`border-[#0070f3] dark:border-blue-400 font-semibold`).
  * **Subfiltros Contextuales:** Se presentan como chips de texto planos directos o botones de filtro sutiles:
    - Etiqueta descriptiva en tipografía mono tenue: `<span className="text-slate-400 dark:text-zinc-500 text-[11px] font-mono uppercase tracking-wider">Asignación:</span>`.
    - Botón inactivo: `text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 px-2.5 py-1 rounded-md text-xs font-medium transition-colors`.
    - Botón activo: `bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs`.
  * **Tipografía Natural:** Capitalización tipo frase o título (*Docentes*, *Administrativos*, *Con carga docente*, *Con horas de investigación*, *Toda la planta docente*) en tamaño `text-xs` y peso `font-medium` o `font-semibold`.

### 4.11. Paneles Laterales, IDEs y Diseñadores Visuales (Editor de Plantillas y Lienzos A4)
* **Anti-patrones Prohibidos:**
  * **Pestañas con Borde Negro Brutalista:** Prohibido utilizar `border-text-main` (borde negro en modo claro) en las pestañas de paneles laterales de inspección (ej: *Propiedades* / *Estilos*). El acento activo obligatorio es `#0070f3` (`dark:border-blue-400 font-semibold`).
  * **Iconos Encerrados en Cajas:** Prohibido envolver iconos en el catálogo de plantillas o listas de archivos dentro de cajitas grises (`p-1.5 rounded bg-zinc-50 border`). Emplear iconografía vectorial desnuda y alineada a la tipografía.
  * **Líneas de Selección Laterales Gruesas:** Prohibido usar barras laterales gruesas (`w-0.5 bg-blue-600`) para marcar la plantilla o elemento seleccionado. El estado seleccionado se representa mediante un fondo sutil continuo (`bg-blue-50/70 dark:bg-blue-950/30`) con texto destacado (`font-semibold`).
  * **Widgets Flotantes en Pantallas de Altura Completa (FAB):** Prohibido superponer botones circulares flotantes sobre lienzos de diseño, editores de plantillas o workspaces (`isFullHeightPage`).
  * **Mayúsculas Forzadas en Estados Vacíos y Categorías:** Prohibido renderizar categorías (`CURRÍCULO & ASIGNATURAS`) o títulos de estados vacíos (`SIN PLANTILLA SELECCIONADA`, `SIN FORMATO SELECCIONADO`) en mayúsculas gritadas. Usar capitalización natural (*Currículo y asignaturas*, *Sin plantilla seleccionada*).

---

## 5. Directrices de Estructura de Pantallas y Páginas

### 5.1. Cabeceras de Página Sobrias y Fácticas
* **Título Directo:** Título claro y conciso del módulo o despacho (`Mis Asignaturas`, `Coordinación de Carrera`, `Coordinación Académica`, `Vicerrectorado Académico`).
* **Cero Cejas Redundantes:** Prohibido añadir etiquetas decorativas encima del título que dupliquen lo que el título ya dice ("Docencia Curricular • Planificación Microcurricular", "Gobernanza Curricular Oficial").
* **Cero Badges de Sesión Duplicados:** Prohibido colocar badges de nombre de usuario en la cabecera si el usuario ya está identificado de forma fija en la barra lateral.
* **Cero Párrafos Filler:** No incluir textos largos que expliquen obviedades operativas.

### 5.2. Información Operativa vs Información Irrelevante
* **Prohibido:** Textos artificiales como *"Simulador Activo"*, *"Sincronizar y Notificar Distributivo"*, *"Modo Simulación"*, *"Control Normativo de Calidad"*.
* **Permitido y Obligatorio:** Datos reales y procesables: códigos de asignaturas (`DS-201`), período lectivo (`2025-A`), desglose de horas normativo (CD, APE, TA), balance de horas Art. 21 CES, estados del circuito y botones de acción directa.

---

## 6. Checklist de Verificación de Estilo Modern Enterprise Docs

Antes de dar por finalizado cualquier componente, pantalla o refactorización:
* [ ] ¿Aplica la estética **Modern Enterprise Docs** con acentos técnicos vivos (`#0070f3`, `emerald`, `amber`)?
* [ ] ¿Las pestañas están implementadas sobre **riel plano continuo** (`<nav className="-mb-px ... overflow-y-hidden no-scrollbar">`) con indicador inferior activo (`border-b-2 border-[#0070f3]`), sin margen negativo en botones?
* [ ] ¿Se eliminaron por completo todos los **segmented controls** y cajas encapsuladas (`bg-surface border p-1 rounded-lg`) tanto en pestañas como en subfiltros?
* [ ] ¿La tipografía usa capitalización natural sin **mayúsculas gritadas** (`ALL CAPS` o `font-black uppercase text-[10px]`) en botones o filtros?
* [ ] ¿El layout es despejado y espacioso, **sin amontonamiento** ni tarjetas excesivamente anidadas?
* [ ] ¿Los estados en tablas se expresan con **puntos discretos** (`w-1.5 h-1.5 rounded-full`) y tipografía limpia, **cero cápsulas envolventes**?
* [ ] ¿Los iconos SVG son **desnudos**, sin cajas ni wrappers redondeados de colores alrededor?
* [ ] ¿Los steppers de proceso utilizan la **línea conectora continua** vertical y nodos circulares con acento activo?
* [ ] ¿Se eliminaron los **KPIs gigantes** decorativos y los párrafos de relleno explicativo?
* [ ] ¿Todos los modales, popovers y selectores tienen **fondos 100% sólidos y opacos**, sin `backdrop-blur` ni sangrado visual?
* [ ] ¿Las pestañas de paneles laterales de inspección usan el acento `#0070f3` (cero líneas negras `border-text-main`) y los estados vacíos tienen capitalización natural?
* [ ] ¿Las vistas de altura completa (editores/workspaces) suprimen los widgets flotantes (FAB) superpuestos?
* [ ] ¿Se utilizó tipografía **Inter Puro** con funciones OpenType activas?
* [ ] ¿La interfaz está completamente libre de emojis?
