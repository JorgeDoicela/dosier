# Sistema de Diseño Visual: Modern Enterprise Docs (Linear / Stripe / Mintlify)

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

## 1. Nomenclatura Estándar en la Industria y Fuentes de Inspiración

En el estándar de la industria del diseño de interfaces (UI/UX) y desarrollo de software, este estilo se clasifica y denomina bajo las siguientes convenciones profesionales:

* **Nombre Estándar de la Industria:** **`Modern Enterprise Docs Aesthetic`** / **`Linear-Inspired Minimalist UI`** (Estilo Documental Editorial y de Productividad Moderna).
* **Fuentes de Inspiración y Benchmarks del Mercado:**
  1. **Linear (`linear.app`):** Creadores del estándar de interfaces de alta velocidad, tipografía Inter con features OpenType, bordes tenues al 5% de opacidad, rieles continuos al ras de la línea base, y eliminación total de tarjetas KPI innecesarias en favor de tablas de datos directas.
  2. **Mintlify (`mintlify.com`):** Referencia moderna en plataformas de documentación técnica con contraste editorial suave, fondos sólidos y confort visual prolongado.
  3. **Stripe Docs & GitBook Enterprise:** Pioneros en la jerarquía de folios limpios, legibilidad tipográfica monoespaciada para códigos, navegación sobre riel plano y cero transparencias que saturen la vista.

En el contexto institucional del ISTPET y la memoria de grado, se formaliza como **"Sistema Modern Enterprise Docs (Inspirado en Stripe Docs, Linear y Mintlify)"**.

---

## 2. Comparativa: Modern Enterprise Docs vs. Geist Puro (Vercel)

A continuación se detalla la matriz de diferencias arquitectónicas y visuales entre el estilo adoptado por DOSIER y el sistema *Geist Puro* convencional utilizado en la plataforma Vercel:

| Dimensión de Diseño | Geist Puro (Vercel Standard) | Modern Enterprise Docs (DOSIER Oficial) | Justificación Académica / Operativa en DOSIER |
| :--- | :--- | :--- | :--- |
| **Tipografía Principal** | `Geist Sans` (Geométrica, condensada, trazos duros y números angulares). | **`Inter` Variable** con características OpenType (`cv02`, `cv03`, `cv04`, `cv11`) y ajuste óptico (`opsz`). | *Inter* ofrece mayor legibilidad y descanso visual en lectura y redacción de textos pedagógicos extensos (objetivos, RDA, bibliografía). |
| **Bordes y Delimitación** | Bordes de alto contraste de 1px (`#eaeaea` en claro / `#333333` en oscuro) o líneas marcadas. | **Bordes ultra suaves (`rgba(0, 0, 0, 0.05)` / `rgba(255, 255, 255, 0.07)`)**. | Elimina el efecto visual de "enrejado" o cuadrículas pesadas, dejando que el contenido y la jerarquía de espacios guíen la vista. |
| **Superficies y Capas** | Contraste binario marcado (Blanco puro `#fff` vs. Negro absoluto `#000`) con sombras secas. | **Superficies Atenuadas (`--subtle: #f2f4f7` / `#181d27`)** y contenedores limpios al ras. | Proporciona profundidad y contexto jerárquico sin necesidad de sombras artificiales ni bordes oscuros. |
| **Transparencias y Blur** | Uso extensivo de `backdrop-filter: blur(12px)` con fondos translúcidos (`rgba(..., 0.8)`). | **Fondos 100% Sólidos y Opacos (Cero Transparencias)** en modales, popovers, selectores y drawers. | Previene el sangrado de texto (*text bleed-through*) al superponer menús sobre tablas o editores de texto denso. |
| **Presentación de Datos** | Cuadros de métricas gigantes (tarjetas KPI de gran tamaño con números `4xl` y gráficos sparkline). | **Supresión de KPIs artificiales**: Enfoque directo en tablas de datos, listas procesables y editores. | Elimina la falsa sensación de analítica de ventas y orienta al docente y coordinador de inmediato a la tarea operativa. |
| **Iconografía** | Gran profusión de iconos SVG en cada acción, menú, etiqueta y botón con envoltorios de fondo. | **Iconografía técnica estricta con Lucide React desnuda**, prescindiendo de cajas envolventes o wrappers de colores. | Reduce la carga cognitiva y centra la atención en códigos institucionales, materias y nombres docentes. |

---

## 3. Especificación Tipográfica (Inter Puro)

El sistema utiliza exclusivamente la familia tipográfica **Inter** cargada local y remotamente con variables de optimización:

```css
/* Configuración en theme.css / base.css */
:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-feature-settings: 'cv02' 1, 'cv03' 1, 'cv04' 1, 'cv11' 1, 'calt' 1, 'liga' 1;
  letter-spacing: -0.011em;
}
```

### Funciones OpenType Activas
* **`cv02` (Curved 4):** Otorga un número 4 curvado y armónico con el flujo de texto.
* **`cv03` (Open &):** Ampersand abierto clásico para mayor legibilidad en cabeceras.
* **`cv04` (Disambiguated l):** Letra `l` minúscula con cola curva para evitar confusión con el número `1` o la `I` mayúscula en códigos de asignaturas (ej. `TIC-101`).
* **`cv11` (Disambiguated 1):** Número `1` con base horizontal para claridad en tablas numéricas y de horas pedagógicas.

---

## 4. Tokens de Diseño y Paleta Cromática

Los tokens están declarados como variables CSS semánticas en `src/styles/theme.css` e inyectados al compilador Tailwind CSS v4 en `src/styles/base.css`:

```css
/* Modo Claro (Default) */
:root {
  --bg: #ffffff;
  --bg-offset: #fbfbfb;
  --surface: #ffffff;
  --surface-raised: #f9f9fb;
  
  /* Superficie Sutil */
  --subtle: #f2f4f7;
  --subtle-border: rgba(0, 0, 0, 0.05);
  --subtle-hover: #e4e7ec;
  
  /* Bordes Suaves */
  --border: rgba(0, 0, 0, 0.05);
  --border-thin: rgba(0, 0, 0, 0.05);
  --border-subtle: rgba(0, 0, 0, 0.03);
  
  /* Texto */
  --text-main: #111827;
  --text-muted: #4b5563;
  --text-dim: #6b7280;

  /* Acentos Técnicos */
  --brand: #0070f3;
  --brand-success: #059669;
  --brand-warning: #d97706;
}

/* Modo Oscuro (.dark) */
.dark {
  --bg: #0b0e14;
  --bg-offset: #0f131a;
  --surface: #121721;
  --surface-raised: #161c28;
  
  /* Superficie Sutil */
  --subtle: #181d27;
  --subtle-border: rgba(255, 255, 255, 0.07);
  --subtle-hover: #222938;
  
  /* Bordes Suaves */
  --border: rgba(255, 255, 255, 0.07);
  --border-thin: rgba(255, 255, 255, 0.07);
  --border-subtle: rgba(255, 255, 255, 0.04);
  
  /* Texto */
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --text-dim: #6b7280;

  /* Acentos Técnicos */
  --brand: #0070f3;
  --brand-success: #10b981;
  --brand-warning: #f59e0b;
}
```

---

## 5. Catálogo de Patrones y Clases Semánticas del Sistema

### 5.1. Rieles Planos de Navegación y Tabs
* **Riel Plano Continuo:** Línea divisoria continua al ras (`border-b border-slate-200 dark:border-zinc-800`) que sirve de base para todas las pestañas y vistas conmutables.
* **Estructura `<nav>`:**
  ```tsx
  <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">
    <button className="border-b-2 border-[#0070f3] dark:border-blue-400 pb-3 text-sm font-semibold text-[#0070f3] dark:text-blue-400">
      Docentes
    </button>
  </nav>
  ```
* **Prohibición de Segmented Controls:** Quedan prohibidos contenedores encapsulados tipo iOS/macOS (`bg-slate-100 p-1 rounded-xl`) con botones flotantes y sombras.
* **Prohibición de Desplazamientos Verticales (Sliders):** Prohibido aplicar márgenes negativos individuales (`-mb-[1px]`, `-mb-[13px]`) en los botones. El margen `-mb-px` reside exclusivamente en el contenedor `<nav>`, acompañado de `overflow-y-hidden no-scrollbar`.

### 5.2. Badges y Puntos Discretos de Estado
* **Puntos Indicadores:** Estados curriculares representados por círculos sólidos de 6px (`w-1.5 h-1.5 rounded-full bg-emerald-500` / `bg-[#0070f3]` / `bg-amber-500`), nunca cápsulas con bordes que rodeen el texto.
* **`.badge-subtle`:** Etiqueta sobria de bajo contraste con tipografía monoespaciada para códigos (`TIC-101`) o versiones normativas.

### 5.3. Entradas de Texto y Controles Interactivos
* **`.input-vercel`:** Campos de texto con fondo sólido, borde ultra suave y anillo de enfoque discreto en el color de acento (`#0070f3`).
* **`.btn-vercel-primary`:** Botón principal de acción en `#0070f3` o contraste alto (`#111827` en claro / `#f3f4f6` en oscuro).
* **`.btn-vercel-secondary`:** Botón secundario con fondo de superficie y borde fino, resistente a hover.

---

## 6. Reglas de Implementación en Nuevas Vistas y Componentes (Modern Enterprise Docs Puro)

1. **Priorizar el contenido sobre el contenedor (Cero Amontonamiento):** No envolver elementos en múltiples tarjetas anidadas (*cards inside cards*). Preferir un folio unificado con espaciado amplio (`p-6` a `p-8`, `gap-6` a `gap-8`) sobre el lienzo oficial `bg-[#f8fafc] dark:bg-[#0b0d11]`, sin elementos de marketing (cero botones macOS semáforo, cero URLs falsas).
2. **Paleta Cromática con Acentos Vivos:** Empleo de acento técnico azul eléctrico corporativo (`#0070f3`), verde esmeralda normativo (`emerald-600/700`, `bg-emerald-50`), y ámbar para observaciones. Botones de acción destacados en `#0070f3` o alto contraste.
3. **Prohibición Absoluta de Cápsulas Envolventes ("Eso que rodea"):** Queda terminantemente prohibido rodear palabras, metas, acciones, etiquetas, roles, simuladores o iconos SVG con cápsulas o píldoras tintadas (`rounded-full border bg-...`). Cero recuadros en iconos SVG y cero cápsulas en nombres, códigos o encabezados. En tablas usar exclusivamente puntos discretos de estado (`w-1.5 h-1.5 rounded-full`) y tipografía limpia. Cero excepciones en toda la aplicación.
4. **Cero Wrappers en Iconos SVG:** Prohibido encerrar iconos dentro de recuadros o círculos coloreados (`w-9 h-9 rounded-lg bg-purple-50`). Los iconos vectoriales de Lucide React deben ser libres y directos (`strokeWidth={1.5}` o `1.75`), flotando junto a su texto correspondiente.
5. **Steppers y Rieles Conectores:** Líneas verticales continuas con nodos circulares numerados (`w-8 h-8 rounded-full`), paso activo destacado con halo azul sutil (`bg-[#0070f3] text-white ring-4 ring-blue-100`).
6. **Cero KPIs Gigantescos:** Eliminar tarjetas con números 4xl/5xl y gráficos sparkline decorativos. Maquetar datos técnicos en fichas de especificación clave-valor (`<dl>`) o tablas estructuradas.
7. **Cero Información Irrelevante o Fluff:** Prohibido saturar la interfaz con etiquetas, indicadores o textos artificiales que no aporten valor operativo al usuario (ej: "Simulador Activo", "Sincronizar y Notificar Distributivo", "Modo Simulación" o explicaciones obvias de botones o pantallas). Prohibido duplicar títulos con metas redundantes. Presentar únicamente datos reales y procesables: materias, códigos, horas, fechas límite y acciones directas.
8. **Tablas antes que tarjetas aisladas:** Si se presentan múltiples registros (PEAs, asignaturas, docentes), maquetar siempre en tablas estructuradas con cabeceras sobrias y tipografía monoespaciada para números y códigos.
9. **Regla Cardinal de Diseño Visual: Fondos 100% Sólidos y Opacos:** Todos los modales (`src/pages/Dashboard/Roles/Modals/`), popovers, menús desplegables (`GeistSelect`), selectores de fecha (`GeistDatePicker`) y drawers deben tener fondo sólido (`bg-white` en claro, `bg-zinc-950` o `bg-[#131720]` en oscuro; cabeceras y pies en `bg-zinc-50 dark:bg-zinc-900`). Queda terminantemente prohibido el uso de opacidades translúcidas (`/50`, `/40`) o `backdrop-blur` que generen sangrado de texto (*text bleed-through*).
10. **Cero Emojis:** Empleo exclusivo de iconografía técnica vectorial con Lucide React con trazo fino (`strokeWidth={1.5}` o `1.75`).
11. **Riel Plano vs Segmented Controls Prohibidos:** Todo grupo de pestañas se monta sobre `<nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">` con borde inferior `#0070f3` al ras del riel base. Prohibido colocar `-mb-[1px]` o `-mb-[13px]` en botones.
12. **Subfiltros Contextuales y Prohibición de Mayúsculas Gritadas (ALL CAPS):** Prohibido encerrar grupos de filtros en cajas tintadas o píldoras. Prohibido forzar mayúsculas sostenidas (`font-black uppercase tracking-wider text-[10px]`) en botones de pestañas o filtros. Emplear capitalización natural (*Docentes*, *Administrativos*, *Con carga docente*) en peso regular o semibold.
13. **Feeds y Notificaciones en Folio Continuo:** Agrupados en un único folio con divisores finos (`divide-y divide-slate-100 dark:divide-zinc-800`), punto azul (`#0070f3`) para no leídos y una sola fecha en la esquina superior derecha. Prohibidos bordes verticales laterales (`border-l-4`).
14. **Paneles Laterales e IDEs:** Pestañas de inspección (ej. *Propiedades* / *Estilos*) con acento institucional `#0070f3`, iconos vectoriales desnudos y supresión de botones flotantes (FAB) en vistas de pantalla completa.

