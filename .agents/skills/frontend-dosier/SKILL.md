---
name: frontend-dosier
description: Extiende la skill global de frontend con la arquitectura Feature-Based Modular SPA (React 18 + Vite + TypeScript), Capa de Servicios (Service Layer), motor concurrente Yjs (CoWorkField), registro documental desacoplado (DocumentTemplateRegistry en JSON puro), regla de fondos 100% sólidos, estilo visual Modern Enterprise Docs puro y suite Vitest.
---
# Convenciones y Arquitectura de Frontend — DOSIER (React 18 + Vite + TypeScript)

> **Orquestación Obligatoria:** Esta skill **extiende y profundiza** las directrices globales de `desarrollo-frontend`. Rige la construcción de componentes, orquestación de estado, capa de servicios, motor de concurrencia en tiempo real y maquetación de **DOSIER** (Sistema de Gestión Curricular para el Programa de Estudio de la Asignatura - PEA del ISTPET).

---

## 1. Arquitectura Feature-Based Modular SPA con Capa de Servicios

El cliente web (`dosier_web`) es una Single Page Application (SPA) modular basada en React 18, Vite y TypeScript con estricta separación de responsabilidades:

```text
dosier_web/src/
├── api/             # Capa de Infraestructura HTTP (Instancia Axios centralizada, interceptores, AuthContext, NotificationsContext)
├── core/            # Capa de Dominio y Motores Desacoplados (Sin dependencias de JSX ni UI)
│   ├── cowork/      # Motor de concurrencia CRDT Yjs + transporte SignalR WebSockets + componente <CoWorkField>
│   └── documents/   # Registro documental: esquemas en JSON puro (DocumentTemplateRegistry) y renderers (DocumentComponentRegistry)
├── services/        # Capa de Fachadas REST / Service Layer (peaService, docenteAsignaturasService, etc.)
├── hooks/           # Capa de Lógica de Estado y Orquestación (useDOSIERBuilderShell, useWorkflowStates)
├── components/      # Componentes UI Reutilizables (Modern Enterprise Docs Puro)
│   ├── Common/      # Modales base, selectores tipados, tablas semánticas y alertas
│   └── DOSIER/      # Shell del PEA (DOSIERBuilderShell) y secciones modulares pea/ (Secciones A - K)
└── pages/           # Vistas y Rutas por Dominio / Módulos de Funcionalidad
    ├── Dashboard/   # Paneles especializados por rol institucional (Docente, Coordinadores, Vicerrector, Admin)
    │   └── Roles/   # Modales curriculares (AuditoriaCacesModal, LegalizacionFirmaModal, etc.) y componentes de flujo
    ├── Calendario/  # Cronograma curricular y eventos normativos CACES
    └── Admin/       # Administración de usuarios, plantillas institucionales y auditoría LOPDP
```

---

## 2. Estándar Visual Obligatorio: Modern Enterprise Docs Profesional

> [!IMPORTANT]
> **Alcance Universal e Inquebrantable (100% del Sistema sin Excepciones):**
> Modern Enterprise Docs rige de forma absoluta en **TODAS las pantallas** (Dashboards de los 5 roles, Workspace PEA, Editor de Plantillas, Calendario, Usuarios, Auditoría, Correos, Analíticas, Notificaciones y Configuración), **todos los componentes estructurales** (Sidebar, Topbar, Headers, rieles de pestañas, tablas, steppers, modales sólidos), **colores** (`#0070f3`, verde esmeralda, ámbar, superficies opacas) y **tipografía** (Inter Variable, capitalización natural, cero ALL CAPS y cero emojis).
> 
> 1. **Estilo Modern Enterprise Docs:** Inspirado en la documentación técnica corporativa de élite (Stripe Docs, Mintlify, GitBook Enterprise, Linear Docs).
> 2. **Paleta Cromática con Acentos Vivos:** Fondo blanco u oscuro sólido con acentos técnicos en azul eléctrico corporativo (`#0070f3`), verde esmeralda normativo (`emerald-600/700`, `bg-emerald-50`), y ámbar para observaciones. Botones de acción principal en `#0070f3` o contraste alto.
> 3. **Prohibición Absoluta de Cápsulas y Burbujas Envolventes ("Eso que rodea"):** Queda terminantemente prohibido rodear palabras, metas, acciones, etiquetas, roles, simuladores o iconos SVG con cápsulas o píldoras tintadas (`rounded-full border bg-... px-3 py-1`). Textos como "Sincronizar y Notificar Distributivo", "Gobernanza Curricular", "Simulador Activo" o "Coordinación Académica" se presentan directos con su tipografía limpia, icono desnudo y punto indicador discreto (`w-1.5 h-1.5 rounded-full`), **sin ninguna cápsula ni píldora con fondo o borde alrededor**. Cero excepciones en toda la aplicación.
> 4. **Steppers y Conectores Verticales (Connected Rails):** Riel continuo con nodos circulares numerados (`w-8 h-8 rounded-full`), paso activo destacado con halo azul sutil (`bg-[#0070f3] text-white ring-4 ring-blue-100`) y tarjetas de fase claras.
> 5. **Fichas Técnicas Clave-Valor:** Etiquetas monoespaciadas en mayúsculas (`font-mono text-slate-400 uppercase tracking-wider text-[11px]`) y especificaciones directas con viñetas de confirmación.
> 6. **Cero Amontonamiento:** Folios espaciosos (`p-6` a `p-8`, `gap-6` a `gap-8`) sin anidamiento excesivo de cajas dentro de cajas.
> 7. **Cero KPIs Gigantes:** No números monumentales `4xl/5xl` decorativos ni sparklines ficticios. Métricas expresadas en fichas técnicas o tablas directas.
> 8. **Cero Información Irrelevante o Fluff:** Prohibido saturar la interfaz con etiquetas o textos que no aportan valor operativo (ejemplos prohibidos: "Simulador Activo", "Sincronizar y Notificar Distributivo", "Modo Simulación" o explicaciones obvias de lo que hace un botón o pantalla). Si un título o acción ya es claro, prohibido duplicarlo con metas o subtítulos redundantes. Presentar exclusivamente datos reales útiles: códigos, materias, horas, fechas límite y acciones concretas.
> 9. **Fondos 100% Sólidos:** Modales, popovers, selectores y drawers con fondos opacos absolutos sin transparencias ni sangrado.
> 10. **Pestañas sobre Riel Plano vs Segmented Controls Prohibidos:** Las pestañas y selectores de vista se implementan directos al ras de la línea base sobre un riel divisorio continuo (`border-b border-slate-200 dark:border-zinc-800`), utilizando `<nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">` y botones con idéntico padding y altura (`border-b-2`), destacando la pestaña activa con `border-[#0070f3] dark:border-blue-400`. Queda terminantemente prohibido colocar `-mb-[1px]` o `-mb-[13px]` en botones individuales, ya que combinados con `overflow-x: auto` fuerzan al navegador a renderizar barras de desplazamiento verticales (sliders) indeseadas. Quedan igualmente prohibidos los *segmented controls* tipo iOS/macOS con cajas encapsuladas redondeadas, fondos tintados/grises y botones flotantes con sombras.
> 11. **Feeds y Notificaciones en Folio Continuo:** Prohibidos bordes de acento vertical a la izquierda (`border-l-4`, `border-l-2`) y tarjetas aisladas amontonadas. Los feeds se agrupan en un único folio con separadores (`divide-y`), señalando no leídos con punto azul discreto (`w-2 h-2 rounded-full bg-[#0070f3]`) y fecha única compacta.
> 12. **Subfiltros Contextuales y Prohibición de Mayúsculas Gritadas (ALL CAPS):** Prohibido envolver grupos de filtros (ej. "Asignación:") en cajas encapsuladas o píldoras tintadas con fondos o bordes coloreados. Prohibido usar tipografía en mayúsculas forzadas (`font-black uppercase tracking-wider text-[10px]`) en botones de pestañas o filtros (`DOCENTES`, `ADMINISTRATIVOS`, `CON CARGA DOCENTE`). Usar siempre capitalización natural (*Docentes*, *Administrativos*, *Con carga docente*) en peso regular o semibold (`text-xs font-medium` o `font-semibold`), con chips de texto sobrios o menús desplegables directos.
> 13. **Paneles Laterales, IDEs y Diseñadores Visuales:** Las pestañas de inspección (ej: *Propiedades* / *Estilos*) deben utilizar el acento institucional `#0070f3` (`dark:border-blue-400 font-semibold`) sobre riel plano, quedando prohibidos los bordes negros `border-text-main`. Los catálogos deben presentar iconos vectoriales desnudos sin cajas envolventes de fondo. Las categorías y estados vacíos deben usar capitalización natural sobria. En vistas de altura completa (`isFullHeightPage`), se deben suprimir los botones flotantes (FAB) superpuestos.
> 14. **Cero Emojis:** Empleo exclusivo de iconografía técnica vectorial con Lucide React.

---

## 3. Capa de Servicios (Service Layer) — Protección de la UI

* **Regla Inviolable:** Los componentes de React **jamás deben invocar llamadas HTTP directas** con `api.get()` o `api.post()` dentro de los controladores de eventos del JSX.
* Toda comunicación con la API REST del backend debe canalizarse a través de las fachadas tipadas en `src/services/`:
  * [`peaService.ts`](file:///c:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/dosier_web/src/services/peaService.ts): Operaciones CRUD del PEA (`getById`, `create`, `update`), avance de workflow (`avanzarWorkflow`), gestión de observaciones disciplinarias y clonación de asignaturas.
  * [`docenteAsignaturasService.ts`](file:///c:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/dosier_web/src/services/docenteAsignaturasService.ts): Consulta de distributivo docente (`getMisMaterias`), período lectivo activo (`getPeriodoActivo`) y resolución de contexto curricular oficial de SIGAFI (`getContextoAcademico`).
  * `calendarioService.ts`: Cronograma normativo y eventos institucionales.
  * `signaturesService.ts`: Solicitud, estampado y verificación de firmas digitales.

### Consumo Defensivo de Serialización snake_case
Dado que el backend serializa globalmente en `snake_case`, el frontend debe tipar las interfaces esperando propiedades en `snake_case`, implementando fallbacks defensivos duales donde coexistan datos en transición:

```typescript
// Patrón de acceso defensivo recomendado
const estadoWorkflow = res.estado_workflow ?? res.estadoWorkflow ?? 'Borrador';
const codigoAsignatura = materia.codigo_materia ?? materia.codigoMateria ?? 'SIN_CODIGO';
```

---

## 4. Motor Documental Desacoplado (`core/documents/`)

El editor del PEA está diseñado para desacoplar completamente la definición del documento respecto a la tecnología de renderizado:

1. **Definición de Esquemas en JSON Puro (`DocumentTemplateRegistry.ts`):**
   * Define la estructura de cada instrumento curricular (ej. plantilla `PEA_OFICIAL`) como un árbol jerárquico de secciones, campos de texto colaborativo, tablas dinámicas y metadatos sin importar React ni hooks.
2. **Registro de Renderers Visuales (`DocumentComponentRegistry.ts`):**
   * Asocia cada identificador de sección definido en el esquema con su componente visual de React (ej: `PeaGeneralSection`, `PeaContentsSection`, `PeaEvaluationSection`).
3. **Navegación Oficial al Workspace del PEA:**
   Para abrir el editor curricular desde cualquier vista (dashboard docente, bandeja de coordinación o tabla administrativa), se debe utilizar obligatoriamente la función auxiliar:
   ```typescript
   import { buildWorkspacePath } from '../../../core/documents/templateUrl';
   navigate(buildWorkspacePath('PEA_OFICIAL', targetUuid, '', '/documentacion/mis-proyectos'));
   ```

---

## 5. Gobernanza de Bloques y Preservación Innegociable de Editabilidad

### 5.1. Preservación del 100% de la Reactividad y Controles
* **PROHIBIDO VOLVER ESTÁTICOS LOS BLOQUES:** Queda terminantemente prohibido eliminar, aplanar o sustituir campos de edición activa por etiquetas HTML estáticas (`<p>`, `<span>`, `<div>` de texto plano hardcodeado) con la excusa de que "se parezca al PDF final".
* **Conservación de la Interactividad:**
  - Todo input (`<input>`, `<textarea>`, `<select>`, `<CoWorkField>`), estado local (`useState`), hook y callback (`onUpdateConfig`, `onChange`, `onBlur`) debe mantenerse plenamente operativo.
  - Los botones de acción dinámicos (**+ Agregar fila/unidad/tema/práctica**, **Eliminar**, **Reordenar con flechas**, **Selector de variantes**, **Toggles**, **Modales** y **Popovers de configuración**) deben permanecer accesibles e interactivos en el lienzo/editor.
  - Las propiedades de configuración (`config.xxx`) deben poderse seguir editando tanto desde el lienzo interactivo como desde el panel lateral de propiedades (`BlockProperties`).
* **Regla para Salidas de Exportación/Impresión:**
  - Si un botón de control no debe aparecer en el documento final impreso, debe ocultarse exclusivamente mediante clases de impresión (ej. `print:hidden`) o flags condicionales de exportación (`isExportingMode`), **NUNCA eliminándolo ni deshabilitándolo en el componente React del editor**.

### 5.2. Regla Fundamental de Expansión (El Bloque Crece, Jamás se Comprime ni Asfixia)
* **Expansión Vertical Libre y Holgada (`h-auto`, `min-h-fit`):**
  - Si para acomodar el formato oficial de producción, nuevas columnas, tablas institucionales complejas, matrices CACES, horas o herramientas de edición se requiere más espacio, **el bloque DEBE EXPANDIRSE verticalmente hacia abajo todo lo necesario**.
  - No existen límites artificiales de altura: el contenedor del bloque debe fluir de forma natural adaptándose al volumen del contenido y a sus herramientas de edición.
* **Prohibición Estricta de Compresión y Asfixia:**
  - **Cero Alturas Rígidas o Fijas:** Queda prohibido forzar alturas arbitrarias (`h-[400px]`, `h-[500px]`) que encierren el contenido en un tamaño prefijado.
  - **Cero Scroll Interno Asfixiante en Bloques:** Queda prohibido aplicar `max-h-[...] overflow-y-auto` en el cuerpo de los bloques del lienzo. El lienzo completo o la página es la que hace scroll; los bloques no deben ser cajas comprimidas con barras de scroll individuales que entorpezcan la edición.
  - **Cero Reducción Artificial de Tipografía:** Prohibido reducir el tamaño de fuentes a escalas ilegibles (`text-[8px]`, `text-[9px]`, `text-[10px]`) para hacer entrar más datos en menos espacio vertical. Los estándares de legibilidad se respetan y el bloque crece hacia abajo.
  - **Cero Supresión de Márgenes o Paddings:** No comprimir los paddings (`py-1`, `gap-0.5`) para ahorrar píxeles. La ergonomía visual y la comodidad de interacción requieren márgenes de respiración adecuados (`py-3`, `gap-3` o superior).
  - **Cero Truncamientos (`truncate`, `line-clamp`):** En áreas de edición activa, está estrictamente prohibido cortar texto con puntos suspensivos o `overflow: hidden`. El usuario debe ver y editar el contenido completo.
* **Cero Eliminación de Controles por Falta de Espacio:** Jamás se debe omitir un campo, una columna o un botón con el pretexto de "falta de espacio". Si el bloque requiere más elementos, **el bloque se expande hacia abajo; nunca se reduce ni se mutila**.

### 5.3. Separación Estricta de Capas
1. **Lienzo de Edición / Diseñador Visual (`pages/Admin/Templates/components/`):** Entorno 100% interactivo, reactivo y de altura libremente expansible. No debe forzarse a simular cortes de página rígidos que mutilen los componentes.
2. **Workspace Colaborativo (`pages/Curriculum/Workspace/` y secciones `pea/`):** Colaboración en tiempo real con `<CoWorkField>` y Yjs, con altura dinámica según el volumen redactado por los docentes.
3. **Motor Documental (`DocumentEngine` C# con iText 9 / Print CSS):** Es el único responsable de la paginación formal A4, saltos de página y generación final estática de PDF con firmas electrónicas y sellos DFRM.

### 5.4. Evolución Aditiva de los Bloques (Añadir Libremente, Jamás Quitar)
* **Plena Libertad para Editar y Enriquecer:** El agente tiene **autorización total y activa** para modificar y editar los bloques (`canvasRenderers/`, `DocumentTemplateRegistry`, paneles de propiedades, schemas) con el objetivo de **añadir todo lo necesario** para que se adapten al 100% a los formatos oficiales del ISTPET, CACES o normativas CES.
* **Principio Aditivo Estricto (Añadir, Nunca Restar):**
  - Si un formato oficial requiere nuevos campos de texto, selectores de catálogo, tablas anidadas, columnas metodológicas, sub-secciones de evaluación o metadatos, **se añaden directamente al bloque**.
  - **PROHIBIDO QUITAR COSAS:** Nunca elimines campos, configuraciones previas o herramientas existentes con la excusa de simplificar o por falta de espacio. Se conservan los existentes y se incorporan los nuevos requerimientos.
  - El bloque crece verticalmente con holgura (`h-auto`) para alojar todas las nuevas adiciones sin asfixiar la interfaz.

### 5.5. Matriz de Patrones: Anti-Patrón vs Patrón Correcto

| Aspecto | Anti-Patrón (Prohibido) | Patrón Correcto (Obligatorio) |
| :--- | :--- | :--- |
| **Interactividad** | Convertir inputs a `<p>` o `<span>` para que "se vea como el PDF final". | Mantener inputs, textareas y bindings reactivos con estilo visual de alta fidelidad. |
| **Botones de Acción** | Quitar "+ Agregar fila" o botones de borrado para "limpiar la vista". | Mantener todos los botones de acción en el canvas; usar `print:hidden` para ocultarlos al exportar. |
| **Altura del Bloque** | Usar `h-[350px] overflow-y-auto` para que no ocupe mucho en el lienzo. | Usar `h-auto min-h-fit` permitiendo que el bloque se expanda naturalmente hacia abajo. |
| **Densidad y Espacio** | Achicar fuentes a `text-[9px]` o quitar padding para que "quepa en una hoja". | Mantener tipografía legible y espaciado ergonómico; el bloque crece verticalmente. |
| **Manejo de Textos** | Usar `truncate` o `line-clamp-2` ocultando texto del usuario en edición. | Mostrar todo el texto sin truncamientos, expandiendo la altura del campo automáticamente. |

---

## 6. Blindaje de Secciones Curriculares: `SectionBlockGuard`

Cada sección del PEA en el Workspace se envuelve con `<SectionBlockGuard>`, centralizando:
1. **Control de Concurrencia (Inline Lock):** Con `showInlineLock={true}`, previene colisiones visuales mostrando el estado de edición activa y presencia en vivo mediante SignalR y Yjs.
2. **Bloqueo por Estado del Workflow y Rol (`readOnly` / `readOnlyReason`):**
   - Cuando el PEA avanza a revisión o aprobación (`EnRevision`, `RevisadoCoord`, `RevisadoAcad`, `Aprobado`), se bloquea la edición sin alterar la presentación visual de alta fidelidad.
   - Si un usuario no tiene permisos sobre la sección (ej. docente intentando modificar un PEA en revisión), se despliega el motivo descriptivo (`readOnlyReason`), impidiendo modificaciones accidentales.

---

## 7. Trayecto de Vida del Documento Curricular (Lifecycle)

El instrumento curricular recorre un pipeline estricto donde el diseño y los datos permanecen desacoplados:

```text
1. MOLDE MAESTRO           2. RESOLUCIÓN / INSTANCIA   3. WORKSPACE COLABORATIVO     4. CADENA COLEGIADA          5. EMISIÓN FORENSE
   /admin/templates    →      doc_documentos_instancias →  DocumentWorkspace + CoWork → Coordinación Carrera/Acad →   DocumentEngine
   (Bloques, Paleta,          (Clonación snapshot JSON,    (Yjs en tiempo real,         (Avales, observaciones,      (PDF iText 9, SHA-256,
    Lienzo interactivo)        versión de plantilla)        persistencia por field_key)  candados de aprobación)      QR y firmas digitales)
```

* **Molde (`/admin/templates`):** El Administrador diseña los bloques en el lienzo ([BlockCanvas](file:///c:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/dosier_web/src/pages/Admin/Templates/components/BlockCanvas.tsx)). Los cambios aquí son moldes para futuros PEAs.
* **Instancia Inmutable:** Al asignar la materia se resuelve la instancia (`GET /api/documents/instances/resolve`) y se enlaza la versión vigente de la plantilla. Los documentos en curso leen su snapshot; nunca sufren desconfiguración por cambios posteriores en la plantilla maestra.
* **Workspace Activo (`DocumentWorkspace`):** Los docentes redactan colaborativamente con `<CoWorkField>`. Los datos se guardan desacoplados por `field_key` (`data_snapshot_json` / `doc_documentos_secciones_metadata`).
* **Preservación Innegociable:** En ninguna etapa de edición se aplanan los bloques a HTML estático ni se eliminan inputs/botones dinámicos.

---

## 8. Co-Redacción Concurrente en Tiempo Real (Yjs + `<CoWorkField>`)

* Las secciones del PEA que admiten trabajo simultáneo entre docentes de la misma cátedra (Objetivos, Unidades Temáticas, Metodología, Bibliografía) deben encapsularse con el componente `<CoWorkField>`.
* El componente enlaza con el `ydoc` de Yjs a través de WebSockets con SignalR, aplicando resolución de conflictos en cliente con cero latencia y autoguardado en segundo plano (*debounced*).
* Prohibido bloquear manualmente la interfaz del usuario mientras se sincronizan los deltas concurrentes.

---

## 9. Enrutamiento y Control de Acceso RBAC (React Router v6)

El árbol de rutas en `src/App.tsx` protege el acceso declarativamente por roles institucionales:
* `<RoleRoute allowedRoles={['DOSIER_DOCENTE']}>`: Paneles de formulación del PEA y distributivo académico personal.
* `<RoleRoute allowedRoles={['DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR']}>`: Bandejas de revisión disciplinar, control de horas y legalización.
* `<AdminRoute>`: Administración de usuarios, plantillas institucionales y auditoría LOPDP.
* En `src/pages/Dashboard/Roles/`, el componente `RoleFlowBanner` proporciona una transición fluida entre roles para usuarios con múltiples atribuciones académicas.

---

## 10. Estándares de Tipado, Modularización y Pruebas con Vitest

* **Tipado Estricto:** Prohibido el uso de `any` en interfaces, propiedades o retornos de servicios. Definir contratos claros en `src/types/`.
* **Umbral de Modularización:** Ningún archivo de componente o hook debe exceder las **700 líneas de código**. Cuando un componente crezca, extraer subcomponentes en carpetas modulares (`components/`, `hooks/`, `types/`).
* **Suite de Pruebas con Vitest:** Ejecutar `npm run test:run` en `dosier_web` para validar los 247 tests automatizados en los 19 archivos de prueba. Todo build de producción debe empaquetarse de forma limpia con `npm run build`.

---

## 11. Checklist de Entrega para Tareas de Frontend

Antes de finalizar cualquier tarea en el cliente web de DOSIER:
* [ ] ¿El diseño es **Modern Enterprise Docs puro** sin amontonar, con folio unificado y sin mezclas con estilos de marketing?
* [ ] ¿Se eliminaron los **wrappers/cajas alrededor de iconos SVG** (iconos limpios y directos)?
* [ ] ¿Se eliminaron las **burbujas/cápsulas alrededor de palabras o textos**?
* [ ] ¿Se eliminaron los **KPIs gigantes**, utilizando especificaciones clave-valor o tablas directas?
* [ ] ¿Se eliminaron las **palabras y textos redundantes o innecesarios**?
* [ ] ¿Todos los modales, selectores y drawers tienen fondos 100% sólidos sin transparencias ni sangrado visual?
* [ ] ¿Las llamadas a la API se canalizaron a través de la Capa de Servicios (`src/services/`) y no directamente desde JSX?
* [ ] ¿Se manejaron las propiedades de la API esperando `snake_case` con tipado defensivo?
* [ ] ¿El componente respeta el umbral de menos de 700 líneas?
* [ ] ¿La interfaz está completamente libre de emojis, empleando exclusivamente iconos de Lucide React?
* [ ] ¿Se verificó que `npm run test:run` apruebe el 100% de los tests?
* [ ] ¿Se verificó que `npm run build` genere el bundle de producción sin errores de TypeScript?
* [ ] ¿Se documentaron los cambios en `docs/documentacion/` según los criterios de `documentacion-dosier`?
