---
name: documentacion-dosier
description: Activa esta skill para la gobernanza, sincronización oportuna y actualización continua de la documentación técnica y memoria académica de DOSIER en docs/documentacion/ y README.md, protegiendo estrictamente docs/tesis/ y sin emojis.
---
# Gobernanza y Documentación Técnica Continua — DOSIER (Memoria de Tesis ISTPET)

> **Propósito Institucional:** Esta skill rige la creación, sincronización oportuna, actualización y mantenimiento de la documentación técnica y memoria académica de la plataforma **DOSIER** (Sistema de Gestión Curricular para el Programa de Estudio de la Asignatura - PEA del ISTPET). Garantiza que cada avance en el código fuente se refleje de manera inmediata y rigurosa en `docs/documentacion/` y `README.md`, protegiendo de forma inviolable los formatos oficiales de titulación en `docs/tesis/` y manteniendo un tono técnico sobrio, formal y libre de emojis.

---

## 1. Principio Fundamental y Reglas Inviolables

1. **Inmutabilidad del Principio Cero Emojis:** Queda estrictamente prohibido el uso de emojis en cualquier archivo de documentación (`docs/documentacion/`), en el `README.md` del repositorio, en las directrices de agentes y en cualquier archivo de configuración o código fuente. Toda comunicación técnica debe ser sobria, formal, académica y profesional.
2. **Actualización Oportuna y en el Mismo Turno:** La documentación técnica en `docs/documentacion/` no debe rezagarse respecto al código fuente. Cuando se implementen cambios sustanciales (nuevos controladores, métodos de servicio, esquemas de base de datos, rutas en React Router, componentes clave de UI o cambios en el flujo de negocio), el agente debe actualizar de manera inmediata y precisa los documentos correspondientes antes de dar por concluida la tarea.
3. **Blindaje Total e Inviolable de `docs/tesis/`:** Queda terminantemente prohibido leer, modificar, alterar, renombrar o eliminar archivos dentro del directorio `docs/tesis/`. Esta carpeta contiene el anteproyecto oficial de titulación, resoluciones institucionales y formatos estáticos de grado que pertenecen exclusivamente al tribunal de titulación.
4. **Veracidad y Cero Especulaciones Futuras:** La documentación debe reflejar con exactitud matemática y técnica la realidad operativa del código existente, sin incluir funcionalidades futuras hipotéticas, supuestos o código no implementado.
5. **Principio de Mínima Modificación y Precisión Quirúrgica:** No reescribir archivos masivamente ante tareas menores; actualizar única y exclusivamente los párrafos, tablas o diagramas estrictamente impactados por el cambio.

---

## 2. Mapa Estructural de Secciones (`docs/documentacion/`)

Todo documento técnico nuevo o modificado debe ubicarse estrictamente en la sección temática correspondiente dentro del árbol documental del proyecto:

```text
docs/documentacion/
├── 01-arquitectura/              # Clean Architecture en 4 capas (.NET 8), Feature-Based SPA (React 18), DTOs, diagramas C4 y patrones de diseño.
│   ├── 01-vision-general-y-principios.md
│   ├── 02-arquitectura-backend-limpia.md
│   ├── 03-arquitectura-frontend-modular.md
│   └── 04-patrones-de-diseno-y-concurrencia.md
├── 02-backend-servicios/         # Controladores REST, autenticación JWT/SSO, RBAC (5 roles), ciclo de vida del PEA y validaciones CACES.
│   ├── 01-especificacion-api-rest.md
│   ├── 02-autenticacion-sso-y-rbac.md
│   ├── 03-servicios-de-dominio-y-aplicacion.md
│   └── 04-ciclo-vida-curricular-y-workflow.md
├── 03-motores-especializados/    # DocumentEngine (PDF iText 9), CoWork (Yjs SignalR), Firmas Criptográficas (DFRM / P12) y Notificaciones.
│   ├── 01-motor-documental-itext9.md
│   ├── 02-motor-cowork-yjs-signalr.md
│   ├── 03-motor-firmas-digitales.md
│   └── 04-motor-notificaciones-y-alertas.md
├── 04-base-de-datos/             # Frontera SIGAFI (solo lectura), DosierContext (4 partes), scripts 01 a 04, diccionario de datos y auditoría.
│   ├── 01-esquema-relacional-sigafi.md
│   ├── 02-esquema-relacional-dosier.md
│   ├── 03-infraestructura-efcore-y-repositorios.md
│   └── 04-scripts-ddl-y-migraciones.md
├── 05-frontend-web/              # Arquitectura Feature-Based SPA, Service Layer, DOSIERBuilderShell, componentes UI y sistema Geist Editorial.
│   ├── 01-arquitectura-react-vite.md
│   ├── 02-componentes-ui-y-builder-shell.md
│   ├── 03-gestion-estado-y-cowork-ui.md
│   └── 04-sistema-diseno-geist-editorial.md
├── 06-aplicacion-movil/          # Arquitectura React Native Expo, navegación por tabs y vistas docentes.
│   └── 01-arquitectura-movil-docente.md
└── 07-despliegue-y-operaciones/  # Instalación local, CACES 2026, CI/CD GitHub Actions, Cloudflare SSL y despliegue en servidor.
    ├── 01-instalacion-entorno-local.md
    ├── 02-auditoria-y-acreditacion-caces.md
    └── 03-integracion-continua-y-despliegue.md
```

---

## 3. Criterios de Aplicación: ¿Cuándo es Sustancial y Necesario Actualizar?

Para evitar tanto el desfase documental como el ruido innecesario, se establecen los siguientes criterios precisos por área técnica:

### 3.1. Base de Datos y Persistencia (`04-base-de-datos/`)
* **Cambio Sustancial:**
  * Modificación, adición o eliminación de tablas, columnas o relaciones en los 4 scripts DDL oficiales (`01_sistema_base.sql` a `04_seguridad_rbac_roles_curriculares.sql`).
  * Ajustes en el mapeo de entidades de solo lectura de SIGAFI (`carreras`, `detallemallas`, `profesores`, `asignacion_materias`).
  * Modificaciones en los archivos parciales de `DosierContext` (`DosierContext.cs`, `DosierContext.Doc.cs`, `DosierContext.Identity.cs`, `DosierContext.Sigafi.cs`) o en las configuraciones Fluent API (`Configurations/Doc*Configurations.cs`).
* **Acción Obligatoria:** Actualizar inmediatamente `04-base-de-datos/02-esquema-relacional-dosier.md`, `04-base-de-datos/03-infraestructura-efcore-y-repositorios.md` y `07-despliegue-y-operaciones/01-instalacion-entorno-local.md` si impacta el script de inicialización.

### 3.2. Backend y Servicios REST (`02-backend-servicios/` y `01-arquitectura/`)
* **Cambio Sustancial:**
  * Creación, renombramiento o eliminación de controladores API en `dosier_api/Controllers/`.
  * Modificación de rutas HTTP, contratos DTOs de entrada/salida o políticas de serialización `snake_case`.
  * Cambios en la máquina de estados del PEA (`Borrador` $\to$ `EnRevision` $\to$ `RevisadoCoord` $\to$ `RevisadoAcad` $\to$ `Aprobado`), circuito de observaciones o reglas del motor de validación curricular (`CurricularValidationEngine`).
  * Alteraciones en el modelo de seguridad RBAC, permisos o roles institucionales (Sistema ID 6).
* **Acción Obligatoria:** Actualizar `02-backend-servicios/01-especificacion-api-rest.md`, `02-backend-servicios/02-autenticacion-sso-y-rbac.md` o `02-backend-servicios/04-ciclo-vida-curricular-y-workflow.md` según corresponda.

### 3.3. Motores Especializados (`03-motores-especializados/`)
* **Cambio Sustancial:**
  * Modificaciones en el pipeline de generación documental PDF (`iText 9`), membretes institucionales, estampados DFRM o códigos QR.
  * Cambios en el protocolo de WebSocket SignalR (`CollaborationHub`), compresión GZip o algoritmo Yjs CRDT de co-redacción concurrente.
  * Ajustes en el flujo de validación de firmas digitales PKCS#12 (.p12) o despacho de notificaciones multicanal.
* **Acción Obligatoria:** Actualizar el documento específico dentro de `docs/documentacion/03-motores-especializados/`.

### 3.4. Frontend Web y UI (`05-frontend-web/`)
* **Cambio Sustancial:**
  * Creación, renombramiento o reestructuración de rutas en `dosier_web/src/App.tsx`.
  * Creación o refactorización de fachadas en `src/services/` (`peaService.ts`, `docenteAsignaturasService.ts`, etc.).
  * Creación o ajuste de componentes de sección del PEA oficial (secciones A a K), integración de `<CoWorkField>` o modales curriculares en `src/pages/Dashboard/Roles/Modals/`.
  * Ajustes en la regla cardinal de fondos 100% sólidos o en el sistema de diseño Geist Editorial.
* **Acción Obligatoria:** Actualizar `05-frontend-web/01-arquitectura-react-vite.md`, `05-frontend-web/02-componentes-ui-y-builder-shell.md` o `05-frontend-web/04-sistema-diseno-geist-editorial.md`.

### 3.5. Cliente Móvil (`06-aplicacion-movil/`)
* **Cambio Sustancial:**
  * Adición o reestructuración de pantallas en `dosier_mobile/app/(tabs)/` o componentes táctiles en `components/ui/`.
* **Acción Obligatoria:** Actualizar `06-aplicacion-movil/01-arquitectura-movil-docente.md`.

---

## 4. Exclusiones: ¿Cuándo NO se Debe Tocar la Documentación?

Para optimizar recursos y no generar ruido documental innecesario, **no se debe modificar la documentación** ante:
* Correcciones menores de formato, espaciado, nombres de variables locales o refactorización interna de métodos privados que no alteren la arquitectura ni contratos externos.
* Correcciones de bugs puntuales que no modifiquen el comportamiento funcional, los contratos DTOs ni las interfaces del sistema.
* Actualizaciones rutinarias de dependencias menores (`npm update`, paquetes NuGet menores) que no introduzcan breaking changes.

---

## 5. Estándares Académicos para Memoria de Tesis ISTPET

Cada documento debe redactarse con un lenguaje formal de ingeniería de software e incluir:

1. **Justificación Técnica / Académica:** Explicar el fundamento ingenieril de cada decisión (por ejemplo: justificar por qué se adoptó Yjs sobre WebSockets con CRDTs en lugar de bloqueos pesimistas en base de datos; por qué se implementó Clean Architecture en 4 capas concéntricas en el backend y Feature-Based SPA con Service Layer en el frontend).
2. **Diagramas de Flujo y Arquitectura:** Emplear diagramas de texto plano (ASCII o Mermaid) que ilustren la interacción entre componentes, bases de datos y usuarios.
3. **Tablas de Especificación Exhaustivas:**
   * Para APIs: Ruta HTTP, método, roles autorizados, payload de entrada JSON, códigos de respuesta HTTP y estructura de retorno.
   * Para Base de Datos: Nombre de tabla, columnas, tipos de datos SQL, llaves primarias/foráneas, índices y políticas de integridad referencial.
   * Para CI/CD e Infraestructura: Variables de entorno, puertos, runners, recursos de hardware y políticas de seguridad.
4. **Cumplimiento Normativo CACES 2026:** Señalar la articulación con el Reglamento de Régimen Académico (RRA) del CES (Art. 21, 48 horas por crédito), el Modelo Educativo institucional del ISTPET y los criterios de evaluación de carreras técnicas y tecnológicas.

---

## 6. Protocolo de Sincronización de Índices

Siempre que se agregue, renombre o elimine un archivo `.md`:
1. **Actualizar el Índice de Documentación:** Registrar el enlace relativo y una breve descripción en [docs/documentacion/README.md](file:///c:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/docs/documentacion/README.md).
2. **Actualizar el README Principal del Repositorio:** Si el cambio impacta la arquitectura global, los requisitos de instalación o el despliegue en producción, reflejarlo en [README.md](file:///c:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/README.md).

---

## 7. Checklist de Verificación Documental

Antes de dar por concluida cualquier intervención técnica en el proyecto:
* [ ] ¿Se crearon o modificaron los `.md` en la subcarpeta temática correcta de `docs/documentacion/`?
* [ ] ¿Se eliminaron referencias a código o dependencias en desuso (ej. `Inv*`, `DiitraContext*`)?
* [ ] ¿Se actualizaron las rutas, contratos DTO y tablas de parámetros si la API o servicios cambiaron?
* [ ] ¿El directorio `docs/tesis/` permaneció completamente intacto y protegido?
* [ ] ¿El documento carece al 100% de emojis y mantiene tono profesional en español?
* [ ] ¿Están actualizados los índices en `docs/documentacion/README.md` y `README.md`?
