# Regla: Actualización Continua y Oportuna de la Documentación Técnica

Esta regla define el protocolo obligatorio para mantener la documentación técnica de DOSIER permanentemente sincronizada con el código fuente en producción y desarrollo.

---

## 1. Principio Fundamental y Cero Emojis

1. **Inmutabilidad del Principio Cero Emojis:** Queda estrictamente prohibido el uso de emojis en cualquier archivo de documentación (`docs/documentacion/`), en el `README.md` del repositorio y en cualquier archivo de configuración o código fuente. Toda comunicación técnica debe ser sobria, formal y profesional.
2. **Sincronización Oportuna y Precisa:** La documentación técnica en `docs/documentacion/` no debe rezagarse respecto al código fuente. Cuando se implementen cambios sustanciales, el agente debe actualizar de manera inmediata y precisa los documentos correspondientes antes de finalizar la tarea.

---

## 2. Criterios de Aplicación: ¿Cuándo es Sustancial y Necesario Actualizar?

La actualización debe realizarse **única y exclusivamente sobre los archivos afectados**, evitando modificaciones masivas innecesarias. Se considera un cambio sustancial:

### 2.1. Base de Datos y Persistencia (`04-base-de-datos/`)
* Modificación, adición o eliminación de tablas, columnas clave o relaciones en los scripts SQL oficiales (`01_sistema_base.sql` a `04_seguridad_rbac_roles_curriculares.sql`).
* Cambios en la integración o mapeo de entidades de solo lectura de SIGAFI (`carreras`, `detallemallas`, `profesores`, `asignacion_materias`).
* **Acción:** Actualizar inmediatamente `04-base-de-datos/01-esquema-relacional-sigafi.md` y `07-despliegue-y-operaciones/01-instalacion-entorno-local.md` si el cambio afecta la secuencia de instalación.

### 2.2. Backend y Servicios REST (`02-backend-servicios/` y `01-arquitectura/`)
* Creación, renombramiento o eliminación de controladores API en `dosier_api/Controllers/`.
* Modificación de rutas HTTP, contratos DTOs de entrada/salida o políticas de serialización `lower_snake_case`.
* Cambios en la máquina de estados del PEA, circuito de firmas o reglas del motor de validación curricular (`CurricularValidationEngine`).
* Alteración en el modelo de seguridad RBAC, permisos o roles institucionales.
* **Acción:** Actualizar `02-backend-servicios/01-especificacion-api-rest.md`, `02-backend-servicios/02-autenticacion-sso-y-rbac.md` o `02-backend-servicios/04-ciclo-vida-curricular-y-workflow.md` según corresponda.

### 2.3. Motores Especializados (`03-motores-especializados/`)
* Modificaciones en el pipeline de generación documental PDF (`iText 9`), membretes institucionales, estampados DFRM o generación de códigos QR.
* Cambios en el protocolo de WebSocket SignalR (`CollaborationHub`), compresión GZip o algoritmo Yjs CRDT de co-redacción concurrente.
* Ajustes en el flujo de validación de firmas digitales PKCS#12 (.p12) o despacho de notificaciones multicanal.
* **Acción:** Actualizar el documento específico dentro de `docs/documentacion/03-motores-especializados/`.

### 2.4. Frontend Web y UI (`05-frontend-web/`)
* Creación, renombramiento o reestructuración de rutas en `dosier_web/src/App.tsx`.
* Creación de nuevos componentes de sección del PEA oficial, integración de `<CoWorkField>` o modales.
* Cambios en la regla cardinal de fondos 100% sólidos o en el sistema de diseño Vercel Geist.
* **Acción:** Actualizar `05-frontend-web/01-arquitectura-react-vite.md` o `05-frontend-web/02-componentes-ui-y-builder-shell.md`.

### 2.5. Cliente Móvil (`06-aplicacion-movil/`)
* Adición o ajuste de pantallas en `dosier_mobile/app/(tabs)/` o nuevos componentes táctiles en `components/ui/`.
* **Acción:** Actualizar `06-aplicacion-movil/01-arquitectura-movil-docente.md`.

---

## 3. Exclusiones: ¿Cuándo NO se Debe Tocar la Documentación?

Para optimizar recursos y no generar ruido documental innecesario, **no se debe modificar la documentación** ante:
* Correcciones menores de formato, espaciado o refactorización interna de métodos privados que no alteren la arquitectura ni contratos externos.
* Correcciones de bugs puntuales que no modifiquen el comportamiento funcional ni las interfaces del sistema.
* Actualizaciones menores de dependencias o ajustes cosméticos que respeten el sistema de diseño ya documentado.

---

## 4. Protocolo de Verificación Obligatorio

Tras actualizar cualquier documento técnico en `docs/documentacion/` o el `README.md`:
1. **Verificación de Enlaces y Coherencia:** Validar que los nombres de archivos, rutas y referencias cruzadas sean exactos.
2. **Auditoría de Cero Emojis:** Comprobar que el texto incorporado carezca absolutamente de emojis o pictogramas decorativos.
3. **Reflejo Estricto de la Realidad:** Describir únicamente lo que está construido y funcionando en el código actual, prohibiendo incluir suposiciones sobre funcionalidades futuras no implementadas.
