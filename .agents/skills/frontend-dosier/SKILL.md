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
> **Reglas Inquebrantables de Maquetación y UX/UI:**
> 1. **Estilo Modern Enterprise Docs:** Inspirado en la documentación técnica corporativa de élite (Stripe Docs, Mintlify, GitBook Enterprise, Linear Docs).
> 2. **Paleta Cromática con Acentos Vivos:** Fondo blanco u oscuro sólido con acentos técnicos en azul eléctrico corporativo (`#0070f3`), verde esmeralda normativo (`emerald-600/700`, `bg-emerald-50`), y ámbar para observaciones. Botones de acción principal en `#0070f3` o contraste alto.
> 3. **Prohibición Absoluta de Cápsulas y Burbujas Envolventes ("Eso que rodea"):** Queda terminantemente prohibido rodear palabras, metas, acciones, etiquetas, roles, simuladores o iconos SVG con cápsulas o píldoras tintadas (`rounded-full border bg-... px-3 py-1`). Textos como "Sincronizar y Notificar Distributivo", "Gobernanza Curricular", "Simulador Activo" o "Coordinación Académica" se presentan directos con su tipografía limpia, icono desnudo y punto indicador discreto (`w-1.5 h-1.5 rounded-full`), **sin ninguna cápsula ni píldora con fondo o borde alrededor**. Cero excepciones en toda la aplicación.
> 4. **Steppers y Conectores Verticales (Connected Rails):** Riel continuo con nodos circulares numerados (`w-8 h-8 rounded-full`), paso activo destacado con halo azul sutil (`bg-[#0070f3] text-white ring-4 ring-blue-100`) y tarjetas de fase claras.
> 5. **Fichas Técnicas Clave-Valor:** Etiquetas monoespaciadas en mayúsculas (`font-mono text-slate-400 uppercase tracking-wider text-[11px]`) y especificaciones directas con viñetas de confirmación.
> 6. **Cero Amontonamiento:** Folios espaciosos (`p-6` a `p-8`, `gap-6` a `gap-8`) sin anidamiento excesivo de cajas dentro de cajas.
> 7. **Cero KPIs Gigantes:** No números monumentales `4xl/5xl` decorativos ni sparklines ficticios. Métricas expresadas en fichas técnicas o tablas directas.
> 8. **Cero Información Irrelevante o Fluff:** Prohibido saturar la interfaz con etiquetas o textos que no aportan valor operativo (ejemplos prohibidos: "Simulador Activo", "Sincronizar y Notificar Distributivo", "Modo Simulación" o explicaciones obvias de lo que hace un botón o pantalla). Si un título o acción ya es claro, prohibido duplicarlo con metas o subtítulos redundantes. Presentar exclusivamente datos reales útiles: códigos, materias, horas, fechas límite y acciones concretas.
> 9. **Fondos 100% Sólidos:** Modales, popovers, selectores y drawers con fondos opacos absolutos sin transparencias ni sangrado.
> 10. **Cero Emojis:** Empleo exclusivo de iconografía técnica vectorial con Lucide React.

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

## 5. Co-Redacción Concurrente en Tiempo Real (Yjs + `<CoWorkField>`)

* Las secciones del PEA que admiten trabajo simultáneo entre docentes de la misma cátedra (Objetivos, Unidades Temáticas, Metodología, Bibliografía) deben encapsularse con el componente `<CoWorkField>`.
* El componente enlaza con el `ydoc` de Yjs a través de WebSockets con SignalR, aplicando resolución de conflictos en cliente con cero latencia y autoguardado en segundo plano (*debounced*).
* Prohibido bloquear manualmente la interfaz del usuario mientras se sincronizan los deltas concurrentes.

---

## 6. Enrutamiento y Control de Acceso RBAC (React Router v6)

El árbol de rutas en `src/App.tsx` protege el acceso declarativamente por roles institucionales:
* `<RoleRoute allowedRoles={['DOSIER_DOCENTE']}>`: Paneles de formulación del PEA y distributivo académico personal.
* `<RoleRoute allowedRoles={['DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR']}>`: Bandejas de revisión disciplinar, control de horas y legalización.
* `<AdminRoute>`: Administración de usuarios, plantillas institucionales y auditoría LOPDP.
* En `src/pages/Dashboard/Roles/`, el componente `RoleFlowBanner` proporciona una transición fluida entre roles para usuarios con múltiples atribuciones académicas.

---

## 7. Estándares de Tipado, Modularización y Pruebas con Vitest

* **Tipado Estricto:** Prohibido el uso de `any` en interfaces, propiedades o retornos de servicios. Definir contratos claros en `src/types/`.
* **Umbral de Modularización:** Ningún archivo de componente o hook debe exceder las **700 líneas de código**. Cuando un componente crezca, extraer subcomponentes en carpetas modulares (`components/`, `hooks/`, `types/`).
* **Suite de Pruebas con Vitest:** Ejecutar `npm run test:run` en `dosier_web` para validar los 247 tests automatizados en los 19 archivos de prueba. Todo build de producción debe empaquetarse de forma limpia con `npm run build`.

---

## 8. Checklist de Entrega para Tareas de Frontend

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
