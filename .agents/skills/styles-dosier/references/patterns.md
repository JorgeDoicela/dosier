# patterns.md — Patrones Oficiales del Dashboard de DOSIER (Vercel Geist)

---

## 1. Patrón: Lista de Resumen Compacta (DOSIER Summary Rows)

En lugar de tarjetas de KPI rectangulares gigantes arriba (anti-patrón de IA), DOSIER organiza métricas en **listas de resumen de alta densidad**:

```tsx
/* PATRON CORRECTO DOSIER */
<div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 bg-white dark:bg-zinc-950">
  <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Resumen Institucional</h4>
  <div className="space-y-2.5">
    {items.map((item, idx) => (
      <div key={idx} className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item.label}</span>
        </div>
        <span className="text-zinc-900 dark:text-zinc-100 font-mono font-semibold">{item.value}</span>
      </div>
    ))}
  </div>
</div>
```

---

## 2. Patrón: Modal Oficial y Fondos 100% Sólidos (Vercel Geist Bento 1-Capa)

Todos los modales y componentes emergentes de DOSIER emplean fondos **completamente sólidos y opacos**, eliminando transparencias para evitar sangrado de texto:

* **Contenedor:** `max-w-[680px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.15)]`.
* **Header:**
  * Breadcrumb: `DOSIER / [Rol]` (insignia en Geist Mono `text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800`).
  * Título: `text-[26px] font-bold text-zinc-950 dark:text-zinc-50 tracking-[-0.03em] leading-tight`.
  * Subtítulo con la misión institucional del sistema (`text-[13.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl`).
* **Cuerpo (Bento Grid 2x2):**
  * 4 tarjetas amplias de 1 solo nivel: `border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-4.5`.
  * Micro-interacciones de elevación al hacer hover (`hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-[1px]`).
  * Título en Geist Sans 600 (`text-[13.5px]`), etiqueta temática en Geist Mono (`text-[10px]`) y texto explicativo del beneficio para el rol.
* **Footer:**
  * Checkbox estilizado con persistencia en `localStorage`.
  * Botón primario negro sólido Vercel: `h-10 px-6 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-medium text-[13px] hover:bg-black dark:hover:bg-zinc-200 active:scale-[0.98]`.

---

## 3. Anti-Patrones Prohibidos

### AP1 — KPIs Gigantes Arriba (IA Generica)
* Prohibido poner 3 o 4 cajas gigantes con números sobredimensionados arriba de las vistas. Usa listas compactas de resumen o tarjetas Bento de 1 capa.

### AP2 — Anidamiento de Cajas dentro de Cajas (Cosas Aplastadas)
* Prohibido meter dashboards en miniatura, dibujos o sub-contenedores dentro de un modal.

### AP3 — Transparencias y Backdrop-Blur sin Fondo Pleno
* Prohibido el uso de modales o popovers translúcidos (`bg-white/80`, `bg-black/60`) que dejen entrever el contenido inferior generando traslape de texto. El fondo debe ser 100% opaco (`bg-white` o `bg-zinc-950`).

### AP4 — Jerga de Infraestructura / DevOps en UI Academica
* Prohibido mostrar `Rama: main`, `Commit -o-`, `Environment: Production` o `GET /api/... 200 OK`.

### AP5 — Textos y Titulos Truncados con Elipsis
* Prohibido diseñar tarjetas donde el texto curricular se corte arbitrariamente con `text-ellipsis`.

### AP6 — Emojis o Iconos Decorativos Superfluos
* Prohibido usar cualquier emoji en títulos, botones o alertas. Emplear exclusivamente iconos vectoriales de Lucide React con stroke fino.
