# Sistema de Diseño Visual: Modern Enterprise Docs (Linear / Stripe / Mintlify)

## 1. Mandato de Alcance Universal e Innegociable (100% del Sistema)

El estándar **Modern Enterprise Docs** rige de forma absoluta y universal en todo el cliente web de DOSIER sin excepciones:

1. **En Todas las Pantallas y Vistas:**
   * Dashboards de los 5 roles curriculares (*Docente*, *Coord. Carrera*, *Coord. Académica*, *Vicerrectorado*, *Administrador*).
   * Espacio de trabajo y lienzo colaborativo del PEA oficial (`/documentacion/workspace/pea-oficial/...` y `/documentacion/mis-proyectos/workspace/...`).
   * Editor y Diseñador Visual de Plantillas Documentales (`/plantillas`).
   * Salas Curriculares Colegiadas (`/salas-curriculares` y `/salas-curriculares/:idCarrera`).
   * Calendario Normativo y Cronograma Institucional (`/calendario`).
   * Gestión de Usuarios y Roles (`/usuarios`).
   * Auditoría Forense y Trazabilidad LOPDP (`/auditoria` y `/lopdp`).
   * Motor de Correos y Plantillas SMTP (`/emails`).
   * Analíticas Institucionales y Cobertura CACES (`/analiticas`).
   * Centro de Notificaciones y Solicitudes (`/notificaciones` y `/solicitudes`).
   * Gestión de Incidencias Técnicas (`/incidencias`, `/admin/incidencias`, `/mis-incidencias`).
   * Ajustes de Perfil y Parámetros Normativos (`/configuracion`).
2. **En Todos los Componentes Estructurales:**
   * **Barras de Navegación:** Barra lateral (`Sidebar`), barra superior (`Topbar`), cabeceras de página (`PageHeader`).
   * **Pestañas y Selectores:** Exclusivamente sobre **riel plano continuo** (`<nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">`) con borde inferior activo `#0070f3`, sin márgenes negativos individuales en botones y **cero segmented controls** tipo iOS/macOS encapsulados en cajas grises.
   * **Steppers de Proceso:** Línea conectora continua vertical con nodos circulares numerados (`w-8 h-8 rounded-full`) y acento activo `#0070f3`.
   * **Tablas de Datos:** Cabeceras en tipografía mono tenue (`text-[11px] font-mono uppercase tracking-wider text-slate-500`), filas con divisores finos y estados representados exclusivamente por **puntos discretos** (`w-1.5 h-1.5 rounded-full`), prohibiendo recuadros o cápsulas envolventes.
   * **Superficies y Paneles:** **Fondos 100% sólidos y opacos** en modales, popovers, selectores (`GeistSelect`, `GeistDatePicker`) y drawers (`bg-white` en modo claro, `bg-zinc-950` o `bg-[#131720]` en oscuro). Prohibición absoluta de transparencias (`/50`, `/40`) o `backdrop-blur`.
   * **Feeds y Notificaciones:** Folio continuo con divisores (`divide-y`), punto azul discreto (`w-2 h-2 rounded-full bg-[#0070f3]`) y fecha única en la esquina superior derecha.
3. **En la Tipografía y Tono:**
   * Tipografía Inter Variable oficial (`@fontsource-variable/inter`) en toda la interfaz con variantes OpenType activas.
   * Capitalización natural (*Docentes*, *Administrativos*, *Con carga docente*). **Prohibición absoluta de mayúsculas forzadas (ALL CAPS)** en botones, pestañas o filtros.
   * Cero emojis en toda la aplicación.

---

## 2. Nomenclatura Estándar en la Industria y Fuentes de Inspiración

En la ingeniería de interfaces de usuario modernas, este estilo se denomina **`Modern Enterprise Docs Aesthetic`** / **`Linear-Inspired Minimalist UI`**:

* **Linear (`linear.app`):** Estándar de velocidad visual, tipografía Inter con características OpenType, bordes tenues al 8% de opacidad, rieles continuos al ras de la línea base y sustitución de tarjetas KPI gigantes por tablas de datos operativas de alta densidad.
* **Mintlify (`mintlify.com`):** Referencia en documentación técnica editorial de alto contraste, fondos sólidos y lectura prolongada sin fatiga.
* **Stripe Docs & GitBook Enterprise:** Folios limpios, tipografía monoespaciada para códigos y metadatos, navegación sobre riel plano continuo y ausencia de efectos translúcidos que degraden el rendimiento visual.

---

## 3. Comparativa: Modern Enterprise Docs vs. Geist Puro (Vercel)

| Dimensión de Diseño | Geist Puro (Vercel Standard) | Modern Enterprise Docs (DOSIER Oficial) | Justificación Académica / Operativa en DOSIER |
| :--- | :--- | :--- | :--- |
| **Tipografía Principal** | `Geist Sans` (Geométrica, condensada, trazos duros y números angulares). | **`Inter` Variable** con características OpenType (`cv02`, `cv03`, `cv04`, `cv11`) y ajuste óptico (`opsz`). | *Inter* ofrece mayor descanso y legibilidad en redacción y revisión de textos curriculares extensos (objetivos, RDA, bibliografía). |
| **Bordes y Delimitación** | Bordes de alto contraste (`#eaeaea` en claro / `#333333` en oscuro) o líneas marcadas. | **Bordes ultra suaves (`rgba(255, 255, 255, 0.08)` / `rgba(226, 232, 240, 0.75)`)**. | Elimina el efecto de "enrejado", permitiendo que los espacios y la tipografía guíen la lectura. |
| **Superficies y Capas** | Contraste binario estricto (Blanco puro `#fff` vs. Negro absoluto `#000`) con sombras secas. | **Superficies Atenuadas (`--subtle: #f1f5f9` / `#0e1117`)** y folios documentales unificados. | Brinda profundidad y jerarquía sin necesidad de sombras artificiales pesadas. |
| **Transparencias y Blur** | Uso extensivo de `backdrop-filter: blur(12px)` con fondos translúcidos (`rgba(..., 0.8)`). | **Fondos 100% Sólidos y Opacos (Cero Transparencias)** en modales, popovers, selectores y drawers. | Previene el sangrado de texto (*text bleed-through*) al desplegar menús sobre editores o tablas densas. |
| **Presentación de Datos** | Tarjetas KPI gigantes con números `4xl` o `5xl` y gráficos sparkline decorativos. | **Tablas y Fichas Clave-Valor (`<dl>`)**: Supresión total de números gigantes o métricas decorativas. | Centra al docente y coordinador de inmediato en las asignaturas, horas, plazos y acciones directas. |
| **Iconografía** | Gran profusión de iconos SVG dentro de cajas y recuadros de color. | **Iconografía técnica Lucide React desnuda**, con trazo fino (`strokeWidth={1.5}` o `1.75`). | Disminuye la saturación cognitiva, destacando los nombres de asignaturas y códigos normativos. |

---

## 4. Arquitectura Modular de Hojas de Estilo (`src/styles/`)

La arquitectura CSS se estructura en archivos independientes de menos de 400 líneas centralizados a través de `src/index.css`:

```text
dosier_web/src/styles/
├── theme.css             # Tokens CSS en :root (modo oscuro default) y [data-theme="light"]
├── base.css              # Configuración de Tailwind CSS v4, tipografía Inter y utilidades base
├── components.css        # Archivo orquestador que importa la subcarpeta components/
│   └── components/
│       ├── alerts.css    # Contenedor y diseño de Toasts (.toast-container-vercel) y badges
│       ├── buttons.css   # Botones corporativos (.btn-vercel-primary, .btn-vercel-secondary)
│       ├── cards.css     # Superficies de folios y tarjetas unificadas
│       ├── inputs.css    # Campos de texto, selectores y estados de foco (.input-vercel)
│       ├── modals.css    # Reglas de fondos 100% sólidos para modales y diálogos
│       └── misc.css      # Steppers verticales, rieles planos y utilidades de scrollbar
└── animations.css        # Animaciones y transiciones de aceleración por hardware
```

---

## 5. Tokens de Diseño y Paleta Cromática (`theme.css`)

DOSIER implementa la alternancia de temas mediante el atributo `data-theme` aplicado al elemento raíz `<html>`:

### 5.1. Modo Oscuro Institucional (Predeterminado en `:root`)
Diseñado en grafito profundo para trabajo curricular prolongado:

```css
:root {
    color-scheme: dark;
    --bg: #0b0d11;
    --fg: #f1f5f9;

    --surface: #131720;
    --surface-hover: #1b212d;

    --subtle: #0e1117;
    --subtle-border: rgba(255, 255, 255, 0.08);
    --subtle-hover: #161b24;

    --border: rgba(255, 255, 255, 0.08);
    --border-hover: rgba(255, 255, 255, 0.15);

    --text-dim: #94a3b8;
    --brand: #0070f3;
    --brand-dark: #0051c3;
    --brand-light: #3291ff;

    --success: #10b981;
    --warning: #f59e0b;
    --error: #f43f5e;
    --info: #0ea5e9;

    /* Escala de grises editorial */
    --accents-1: #131720;
    --accents-2: #1b212d;
    --accents-3: #283347;
    --accents-4: #475569;
    --accents-5: #64748b;
    --accents-6: #94a3b8;
    --accents-7: #cbd5e1;
    --accents-8: #f1f5f9;
}
```

### 5.2. Modo Claro (`[data-theme="light"], .force-light-theme`)
Lienzo documental limpio de alta legibilidad editorial:

```css
[data-theme="light"], .force-light-theme {
    color-scheme: light;
    --bg: #f8fafc;
    --fg: #0f172a;

    --surface: #ffffff;
    --surface-hover: #f1f5f9;

    --subtle: #f1f5f9;
    --subtle-border: #e2e8f0;
    --subtle-hover: #e2e8f0;

    --border: rgba(226, 232, 240, 0.75);
    --border-hover: #cbd5e1;
    --text-dim: #64748b;
    --brand: #0070f3;
}
```

---

## 6. Especificación Tipográfica (Inter Puro)

La tipografía oficial se configura en `src/styles/base.css` mediante `@fontsource-variable/inter`:

```css
:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-feature-settings: 'cv02' 1, 'cv03' 1, 'cv04' 1, 'cv11' 1, 'calt' 1, 'liga' 1;
  letter-spacing: -0.011em;
}
```

### Variantes OpenType Activas
* **`cv02` (Curved 4):** Número 4 curvado y armónico con la lectura continua.
* **`cv03` (Open &):** Ampersand abierto clásico para mayor legibilidad en cabeceras.
* **`cv04` (Disambiguated l):** Letra `l` minúscula con cola curva, previniendo ambigüedades con el número `1` o la `I` mayúscula en códigos institucionales (ej: `MAT-101`).
* **`cv11` (Disambiguated 1):** Número `1` con base horizontal para tablas de distribución horaria y matrices curriculares.

---

## 7. Catálogo de Clases Semánticas y Patrones de Interfaz

### 7.1. Rieles Planos de Navegación y Pestañas
* Base sobre riel continuo al ras (`border-b border-border`):
  ```tsx
  <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">
    <button className="border-b-2 border-[#0070f3] dark:border-blue-400 pb-3 text-sm font-semibold text-[#0070f3] dark:text-blue-400">
      Docentes
    </button>
  </nav>
  ```
* **Prohibición de Segmented Controls:** Queda prohibido el uso de cajas redondeadas tintadas con botones flotantes y sombras tipo iOS.
* **Prohibición de Sliders Verticales:** Prohibido aplicar márgenes negativos individuales (`-mb-[1px]`, `-mb-[13px]`) en los botones.

### 7.2. Puntos Indicadores de Estado vs. Cápsulas Envolventes
* **Puntos Indicadores:** Los estados curriculares (*Borrador*, *En Revisión*, *Revisado*, *Aprobado*) se representan exclusivamente mediante círculos sólidos de 6px (`w-1.5 h-1.5 rounded-full bg-emerald-500` / `bg-[#0070f3]` / `bg-amber-500`), sin recuadros ni cápsulas que encierren el texto.
* **`.badge-subtle`:** Etiqueta plana y sobria para códigos de asignatura y versiones normativas.

### 7.3. Entradas, Botones y Utilidades de Desplazamiento
* **`.input-vercel`:** Entrada de datos con fondo sólido, borde ultrafino y anillo de foco en `#0070f3`.
* **`.btn-vercel-primary`:** Botón principal de acción en `#0070f3` con tipografía de alto contraste.
* **`.btn-vercel-secondary`:** Botón secundario con superficie sólida y borde sutil.
* **`.toast-container-vercel`:** Posicionamiento superior derecho (`top: 1.5rem; right: 1.5rem;`) para notificaciones flotantes con soporte de reversión interactiva.
* **`.no-scrollbar`:** Oculta las barras de desplazamiento manteniendo el desplazamiento nativo táctil o con rueda de ratón.

---

## 8. Resumen de Reglas Cardinales de Diseño

1. **Priorizar el Contenido (Cero Amontonamiento):** Folio unificado con espaciado amplio (`p-6` a `p-8`, `gap-6` a `gap-8`) sobre el lienzo oficial `bg-[#f8fafc] dark:bg-[#0b0d11]`. Cero tarjetas anidadas innecesarias (*cards inside cards*).
2. **Fondos 100% Sólidos y Opacos:** Todos los modales, popovers, selectores y drawers aplican fondos sólidos (`bg-white` en claro, `bg-zinc-950` o `bg-[#131720]` en oscuro; cabeceras y pies en `bg-zinc-50 dark:bg-zinc-900`). Prohibición absoluta de opacidades intermedias (`/50`, `/40`) o `backdrop-blur`.
3. **Cero Mayúsculas Gritadas (ALL CAPS):** Uso exclusivo de capitalización natural (*Docentes*, *Administrativos*, *Con carga docente*) en botones, pestañas y filtros.
4. **Cero Emojis y Cero Wrappers en Iconos:** Empleo exclusivo de Lucide React con trazo fino (`strokeWidth={1.5}` o `1.75`) desnudos y contextuales. Prohibición de envolver iconos en recuadros coloreados.
5. **Cero KPIs Gigantes:** Supresión de tarjetas con cifras enormes (`text-4xl`, `text-5xl`). Emplear tablas y listas estructuradas con datos procesables.
6. **Feeds en Folio Continuo:** Listas de notificaciones en un único contenedor con divisores finos (`divide-y`), punto azul para elementos no leídos y fecha única en la esquina superior derecha. Prohibidas barras laterales gruesas (`border-l-4`).
