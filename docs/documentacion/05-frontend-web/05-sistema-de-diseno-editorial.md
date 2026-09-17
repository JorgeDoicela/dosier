# Sistema de Diseño Visual: DOSIER Editorial Clean (Inter Editorial Minimalist)

## 1. Visión General y Nomenclatura del Sistema

El sistema de diseño visual de **DOSIER** se denomina formalmente **DOSIER Editorial Clean** (o *Inter Editorial Minimalist*). Se trata de una evolución refinada de la estética de documentación técnica de alta gama (inspirada en Mintlify, GitBook Enterprise y principios minimalistas de Vercel), adaptada específicamente a las exigencias académicas, forenses y documentales de la educación superior en el Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET).

Este estilo prioriza la **densidad informativa legible, la serenidad visual para jornadas prolongadas de planificación pedagógica, la sobriedad tipográfica y la eliminación absoluta de ornamentación superflua**.

---

## 2. Comparativa: DOSIER Editorial Clean vs. Geist Puro (Vercel)

A continuación se detalla la matriz de diferencias arquitectónicas y visuales entre el estilo adoptado por DOSIER y el sistema *Geist Puro* convencional utilizado en la plataforma Vercel:

| Dimensión de Diseño | Geist Puro (Vercel Standard) | DOSIER Editorial Clean (Sistema Actual) | Justificación Académica / Operativa en DOSIER |
| :--- | :--- | :--- | :--- |
| **Tipografía Principal** | `Geist Sans` (Geométrica, condensada, trazos duros y números angulares). | **`Inter` Variable** con características OpenType (`cv02`, `cv03`, `cv04`, `cv11`) y ajuste óptico (`opsz`). | *Inter* ofrece mayor legibilidad y descanso visual en lectura y redacción de textos pedagógicos extensos (objetivos, RDA, bibliografía). |
| **Bordes y Delimitación** | Bordes de alto contraste de 1px (`#eaeaea` en claro / `#333333` en oscuro) o líneas marcadas. | **Bordes ultra suaves (`rgba(0, 0, 0, 0.05)` / `rgba(255, 255, 255, 0.07)`)**. | Elimina el efecto visual de "enrejado" o cuadrículas pesadas, dejando que el contenido y la jerarquía de espacios guíen la vista. |
| **Superficies y Capas** | Contraste binario marcado (Blanco puro `#fff` vs. Negro absoluto `#000`) con sombras secas. | **Superficies Atenuadas (`--subtle: #f2f4f7` / `#181d27`)** y contenedores segmentados suaves. | Proporciona profundidad y contexto jerárquico sin necesidad de sombras artificiales ni bordes oscuros. |
| **Transparencias y Blur** | Uso extensivo de `backdrop-filter: blur(12px)` con fondos translúcidos (`rgba(..., 0.8)`). | **Fondos 100% Sólidos y Opacos (Cero Transparencias)** en modales, popovers, selectores y drawers. | Previene el sangrado de texto (*text bleed-through*) al superponer menús sobre tablas o editores de texto denso. |
| **Presentación de Datos** | Cuadros de métricas gigantes (tarjetas KPI de gran tamaño con números `4xl` y gráficos sparkline). | **Supresión de KPIs artificiales**: Enfoque directo en tablas de datos, listas procesables y editores. | Elimina la falsa sensación de analítica de ventas y orienta al docente y coordinador de inmediato a la tarea operativa. |
| **Iconografía** | Gran profusión de iconos SVG en cada acción, menú, etiqueta y botón. | **Iconografía técnica estricta con Lucide React**, prescindiendo de iconos decorativos innecesarios. | Reduce la carga cognitiva y centra la atención en códigos institucionales, materias y nombres docentes. |

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
  
  /* Superficie Sutil y Segmentada */
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
}

/* Modo Oscuro (.dark) */
.dark {
  --bg: #0b0e14;
  --bg-offset: #0f131a;
  --surface: #121721;
  --surface-raised: #161c28;
  
  /* Superficie Sutil y Segmentada */
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
}
```

---

## 5. Catálogo de Clases Semánticas del Sistema

### 5.1. Superficies y Contenedores Sutiles
* **`.surface-subtle`:** Aplica `background: var(--subtle)` con borde tenue de `var(--subtle-border)`. Ideal para fondos de filtros, barras de herramientas secundarias o bloques de lectura complementaria.
* **`.segmented-container`:** Contenedor envolvente para botones de opción múltiple, pestañas y selectores de roles (`RoleFlowBanner`).
* **`.segmented-item-active`:** Estado activo del elemento dentro del contenedor segmentado con elevación sutil y fondo sólido blanco/oscuro.

### 5.2. Badges y Etiquetas Semánticas
* **`.badge-subtle`:** Píldora de bajo contraste con tipografía monoespaciada para códigos de asignatura, identificadores de cohorte y badges de auditoría.
* **`.badge-vercel-neutral` / `.badge-vercel-info` / `.badge-vercel-success` / `.badge-vercel-warning` / `.badge-vercel-error`:** Indicadores de estado del flujo de aprobación curricular con contraste balanceado.

### 5.3. Entradas de Texto y Controles Interactivos
* **`.input-vercel`:** Campos de texto con fondo sólido, borde ultra suave y anillo de enfoque discreto en el color de acento (`var(--brand)`).
* **`.btn-vercel-primary`:** Botón principal de acción con fondo de alto contraste (`#111827` en claro / `#f3f4f6` en oscuro) y tipografía de peso mediano.
* **`.btn-vercel-secondary`:** Botón secundario con fondo de superficie y borde fino, resistente a hover.

---

## 6. Reglas de Implementación en Nuevas Vistas y Componentes

1. **Priorizar el contenido sobre el contenedor:** No envolver elementos en múltiples tarjetas anidadas (*cards inside cards*). Preferir una sola superficie limpia con espaciado vertical (`space-y-*`).
2. **Tablas antes que tarjetas aisladas:** Si se presentan múltiples registros (PEAs, asignaturas, docentes), maquetar siempre en tablas estructuradas con cabeceras sobrias y tipografía monoespaciada para números y códigos.
3. **Cero Fondos Translúcidos:** Todo nuevo modal, menú desplegable, tooltip o drawer debe incluir la clase `bg-white dark:bg-zinc-950` o `bg-surface` sin modificadores de opacidad como `/80` o `backdrop-blur`.
4. **Cero Emojis:** Emplear únicamente texto descriptivo formal o iconos de la suite Lucide React con tamaño consistente (13px a 16px).
