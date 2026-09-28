---
name: styles-dosier
description: Activa esta skill para el sistema de diseño visual de DOSIER basado en Modern Enterprise Docs (Stripe Docs, Mintlify, GitBook Enterprise, Linear): estética técnica y profesional con acentos vivos (#0070f3, esmeralda), steppers verticales interactivos, badges de estado normativo refinados, especificaciones clave-valor de alta densidad, cero KPIs gigantes y fondos 100% sólidos.
---
# DOSIER Design System — Estándar Oficial Modern Enterprise Docs

> **Propósito Institucional:** Esta skill rige la arquitectura visual y el sistema de diseño de **DOSIER** (Sistema de Gestión Curricular para el Programa de Estudio de la Asignatura - PEA del ISTPET). Implementa el estándar de diseño **Modern Enterprise Docs** de alta gama (inspirado en Stripe Docs, Mintlify, GitBook Enterprise y Linear Docs), combinando pulcritud técnica, acentos cromáticos vivos y legibilidad ejecutiva sin amontonamiento ni decoraciones superfluas.

---

## 1. Principios Fundamentales del Estilo Modern Enterprise Docs

### 1.1. Simplicidad, Aire y Maquetación Despejada
* **Cero Amontonamiento:** Estructura espaciosa con paddings y gaps generosos (`p-6` a `p-8`, `gap-6` a `gap-8`). El contenido debe respirar sin saturar la vista.
* **Folio Unificado:** En lugar de apilar múltiples cajas anidadas (*cards inside cards*), se utiliza un **Folio Unificado** con divisiones internas tenues mediante bordes de precisión (`border-slate-200/90` o `border-zinc-200 dark:border-zinc-800`).
* **Cero Mezclas con Marketing:** Prohibido mezclar con elementos de landing pages (cero botones macOS semáforo "rojo/amarillo/verde", cero barras falsas de navegador).

### 1.2. Paleta Cromática Técnica y Acentos Profesionales
* **Azul Eléctrico Corporativo (`#0070f3` / `blue-600`):** Utilizado para el estado activo de navegación, fases en curso, botones de acción primaria (`bg-[#0070f3] text-white hover:bg-[#005bb5]`) y badges de gobernanza institucional (`bg-blue-50 text-[#0070f3] border-blue-200/60`).
* **Verde Esmeralda Normativo (`emerald-600` / `emerald-700`):** Utilizado para hitos aprobados, metas alcanzadas, estado de validación CACES y badges de entrega (`bg-emerald-50 text-emerald-700 border-emerald-200/80`).
* **Ámbar de Advertencia (`amber-600` / `amber-700`):** Para observaciones pendientes o alertas curriculares.
* **Bases y Lienzo Sólido:** Lienzo general en gris pizarra sutil (`#f8fafc` / `slate-50`) para descanso visual y contraste nítido; tarjetas, folios y modales en blanco puro 100% sólido (`#ffffff`) en modo claro y grafito oscuro (`#0b0d11` a `#131720`) en modo oscuro, con bordes definidos de precisión (`#e2e8f0` / `border-slate-200/90`).

### 1.3. Regla Estricta: Prohibición de Cápsulas y Burbujas Envolventes ("Eso que rodea")
* **Definición de "Eso que rodea":** Cápsulas, píldoras o burbujas con bordes redondeados y fondos tintados (`rounded-full border border-... bg-... px-3 py-1`) que la IA suele colocar alrededor de palabras, metas, etiquetas o iconos SVG.
* **Prohibición Total:**
  * **Cero cápsulas envolventes en metas y acciones:** Textos como "Sincronizar y Notificar Distributivo" o "Validar Horas Art. 21" se presentan directamente con su tipografía limpia (`font-mono text-xs font-medium text-emerald-600`) y su icono técnico desnudo (`<CheckCircle2 size={14} />`), **sin ninguna cápsula ni píldora con fondo o borde alrededor**.
  * **Cero wrappers en iconos SVG:** Prohibido encerrar iconos en cajas o recuadros coloreados (`<div className="w-9 h-9 rounded-lg bg-purple-50...">`). Los iconos se presentan directos y desnudos.
  * **Cero cápsulas en palabras ordinarias, nombres o etiquetas:** Prohibido envolver nombres de usuarios, docentes, textos descriptivos o subtítulos en píldoras.
  * **Cero cápsulas en códigos o tablas:** Los códigos de asignaturas (`DS-201`), celdas de tabla y datos van en tipografía monoespaciada limpia (`font-mono text-xs text-zinc-500`), jamás dentro de cápsulas ni cajas grises.
  * **Cero cápsulas en roles, simuladores y encabezados:** Textos como "Coordinación Académica", "Simulador Activo" o "Gobernanza Curricular Oficial" van directos con su tipografía limpia, icono desnudo y punto indicador discreto (`w-1.5 h-1.5 rounded-full`), **jamás dentro de cápsulas, píldoras o cajas redondeadas con borde y fondo**.
  * **Cero Excepciones:** Prohibido todo tipo de cápsula, píldora o recuadro envolvente (`rounded-full border bg-...`, `rounded-md border bg-...`) en cualquier parte de la aplicación. Todo elemento se presenta desnudo y directo con tipografía nítida y sus colores correspondientes intactos.

### 1.4. Stepper y Riel Vertical Conector (Connected Rails)
* **Línea Conectora Continua:** Línea vertical nítida (`w-[2px] bg-slate-200 dark:bg-zinc-800`) que guía el flujo de fases.
* **Nodos Circulares Numerados:** Círculos estilizados (`w-8 h-8 rounded-full`) con número de paso:
  * Paso completado: `bg-emerald-500 text-white` con icono de check (`Check`).
  * Paso activo: `bg-[#0070f3] text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-xs`.
  * Paso futuro: fondo neutro con borde `border-2 border-slate-300 dark:border-zinc-700 text-slate-500`.
* **Tarjeta de Fase Activa:** Resaltada sutilmente con `bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60` y chevron suave.

### 1.5. Fichas de Especificación Técnica Clave-Valor
* **Etiquetas de Parámetro:** En mayúsculas pequeñas con tipografía monoespaciada (`font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[11px] w-36 shrink-0`).
* **Valores Técnicos:** Tipografía clara y directa con soporte para viñetas de confirmación (`<Check size={14} className="text-emerald-600" />`).

### 1.6. Supresión de KPIs Gigantes Artificiales
* **Anti-patrón prohibido:** Tarjetas con números monumentales (`text-4xl`, `text-5xl font-extrabold`) acompañadas de sparklines o gráficos decorativos que ocupen el espacio operativo.
* **Regla estricta:** Métricas expresadas en fichas clave-valor, tablas directas de alta densidad o barras de avance horizontales discretas.

### 1.7. Supresión Absoluta de Información Irrelevante, Fluff y Redundancias
* **Prohibición de texto irrelevante:** Queda terminantemente prohibido colocar en la interfaz etiquetas, indicadores o textos artificiales que no aporten valor operativo al usuario (ejemplos prohibidos: *"Simulador Activo"*, *"Sincronizar y Notificar Distributivo"*, *"Modo Simulación"*, *"Control Normativo de Calidad"* o frases de auto-explicación obvia).
* **Cero metas redundantes al lado de títulos:** Si una fase, panel o encabezado ya cuenta con su título y su acción clara, está prohibido colocar etiquetas de meta o subtítulos descriptivos redundantes a su lado.
* **Directo a los datos operativos útiles:** La pantalla debe contener únicamente información real, útil y procesable: códigos de asignaturas (`DS-201`), período lectivo (`2025-A`), desglose de horas, estado normativo del workflow, autoridades responsables y botones de acción directa. Cero ruido cognitivo.

---

## 2. Regla Cardinal de Diseño Visual: Fondos 100% Sólidos y Cero Transparencias

> [!IMPORTANT]
> **Prohibición Total de Transparencias en Componentes Superpuestos:**
> * Todos los modales, popovers, menús desplegables (`GeistSelect`), selectores de fecha (`GeistDatePicker`), drawers y tooltips deben tener **fondos 100% opacos y sólidos**:
>   * **Modo Claro:** Fondo sólido `bg-white` (`#ffffff`) con bordes definidos `border border-zinc-200` y sombras volumétricas `shadow-xl`.
>   * **Modo Oscuro:** Fondo sólido `bg-zinc-950` (`#09090b`) o `bg-[#131720]` con bordes `border border-zinc-800`.
>   * **Cabeceras y Pies de Modales:** Fondo sólido `bg-zinc-50 dark:bg-zinc-900` completamente opaco.
> * **Cero sangrado visual:** Prohibido el uso de `backdrop-blur` o fondos translúcidos (`/50`, `/40`) sin capa sólida debajo.

---

## 3. Checklist de Verificación de Estilo Modern Enterprise Docs

Antes de dar por finalizada cualquier interfaz o componente:
* [ ] ¿Aplica la estética **Modern Enterprise Docs** con acentos técnicos vivos (`#0070f3`, `emerald`, `amber`)?
* [ ] ¿El layout es despejado y espacioso, **sin amontonamiento** ni tarjetas excesivamente anidadas?
* [ ] ¿Los badges de estado normativo se usan con propósito institucional y contraste balanceado (`bg-emerald-50`, `bg-blue-50`)?
* [ ] ¿Los steppers de proceso utilizan la línea conectora continua y nodos circulares con acento activo?
* [ ] ¿Se eliminaron los **KPIs gigantes** decorativos, usando especificaciones clave-valor o tablas directas?
* [ ] ¿Se eliminaron los **textos redundantes** o de relleno explicativo?
* [ ] ¿Todos los modales y menús desplegables tienen **fondos 100% sólidos y opacos**?
* [ ] ¿Se utilizó tipografía **Inter Puro** con funciones OpenType activas?
* [ ] ¿La interfaz está completamente libre de emojis?
