# Plan maestro de integración curricular institucional de DOSIER

## 1. Decisión de alcance

DOSIER se implementará como una plataforma de **gobernanza documental curricular**, integrada en modo de solo lectura con SIGAFI. El sistema cubrirá la cadena completa de trazabilidad:

`normativa nacional -> instrumentos institucionales -> diseño de carrera -> malla/asignatura -> expediente curricular -> PEA -> sílabo -> guías -> evidencia y acreditación`

La delimitación se manejará en dos planos distintos:

- **Alcance del producto:** toda la cadena y los cuatro entregables microcurriculares.
- **Corte demostrable de la tesis:** PEA completo de extremo a extremo, con las bases comunes y contratos ya preparados para Sílabo, Guía APE y Guía de Estudio.

Esto evita convertir la tesis en cuatro desarrollos simultáneos, pero impide que el PEA quede como un módulo aislado que luego deba reescribirse.

## 2. Estado real encontrado

### 2.1. Datos institucionales reutilizables de SIGAFI

SIGAFI debe permanecer estrictamente en modo de solo lectura. Las fuentes útiles son:

| Necesidad | Fuente existente | Uso en DOSIER |
|---|---|---|
| Período académico | `periodos` | Determinar el ciclo del expediente. |
| Carreras del instituto | `carreras`, filtrando `esInstituto = 1` | Excluir escuela de conducción y otros negocios mezclados. |
| Malla aplicable por cohorte/período | `mallas`, `mallas_periodos` | Resolver la versión curricular correcta. |
| Asignaturas y horas | `detallemallas`, `asignaturas`, `tipos_asignatura` | Precargar créditos y horas de docencia, APE y trabajo autónomo. |
| Secuencia curricular | `prerequisitos` | Advertir prerrequisitos registrados; su cobertura actual es insuficiente para asumir que representa toda la secuencia. |
| Oferta y modalidad | `modalidades`, `modalidades_carreras`, `secciones` | Contextualizar modalidad, sección y paralelo. |
| Docencia real | `asignaciones_profesores`, `profesores_carreras_periodos`, `profesores` | Determinar responsables y colaboradores legítimos del expediente. |
| Fechas evaluativas | `parciales`, `parciales_modalidades`, `parciales_modalidades_fechas` | Preparar la futura matriz semanal del sílabo. |

El `AcademicContextResolver` y la creación del PEA desde una asignación constituyen la primera pieza correcta de esta integración.

No se tomarán como fuentes curriculares las tablas que solo coinciden por nombre pero pertenecen a otros módulos, por ejemplo los resultados de aprendizaje de vinculación. Tampoco se dependerá por ahora de `seddautoridadescarrerasperiodos`, porque no tiene datos en la copia analizada.

### 2.2. Capacidades nativas que ya tiene DOSIER

Se reutilizarán y generalizarán estas capacidades:

| Capacidad | Tablas/componentes actuales | Decisión |
|---|---|---|
| Plantillas versionadas | `doc_document_templates` | Reutilizar y registrar plantillas curriculares. |
| Instancias y snapshots | `doc_documentos_instancias` | Convertir cada instancia en una revisión documental trazable. |
| Auditoría de emisión | `doc_document_audit` | Reutilizar para emisiones oficiales. |
| Colaboración CRDT | `doc_cowork_documentos`, `doc_cowork_updates`, `doc_cowork_sesiones`, Yjs/SignalR | Reutilizar, desacoplando la autorización actualmente orientada a proyectos de investigación. |
| Comentarios y secciones | `doc_collaboration_comments`, `doc_documentos_secciones_metadata` | Reutilizar para observaciones de revisión por campo o sección. |
| Firma | `doc_documentos_firmas` y servicio de firma DOSIER/FirmaEC | Reutilizar con una política de firmantes por etapa. |
| Notificaciones | `doc_notificaciones` y motor multicanal | Reutilizar para asignaciones, devoluciones y aprobaciones. |
| Permisos | RBAC modular | Ampliar con módulos, operaciones y roles curriculares. |
| Modelos de contenido | `doc_pea*`, `doc_silabo*`, `doc_guias_ape*`, `doc_guias_estudio*` | Conservar como modelos especializados, vinculados a un núcleo documental común. |

### 2.3. Brechas que deben resolverse

1. El motor documental genérico y los cuatro modelos curriculares existen como dos diseños paralelos.
2. Solo hay dos plantillas activas y ambas son de investigación; todavía no existen plantillas curriculares registradas en el motor.
3. Las tablas curriculares están vacías en la copia local, lo que facilita una migración limpia.
4. El frontend presenta el módulo curricular en la landing, pero no ofrece rutas ni editores curriculares operativos.
5. Los endpoints de estado del PEA, Sílabo y Guías aceptan transiciones arbitrarias y no validan rol, etapa, observación ni firma.
6. El workflow configurable actual está acoplado al proceso de proyectos de investigación.
7. CoWork tiene persistencia útil, pero su control de acceso está acoplado a equipos y grupos de investigación.
8. Los guardados de varios agregados reemplazan colecciones completas. Ese mecanismo no debe utilizarse sobre revisiones aprobadas porque destruye identidad e historial de los elementos.
9. El campo `version` de los documentos curriculares no representa todavía un historial real de revisiones.
10. La finalización genérica contiene un hash provisional en un controlador; toda emisión curricular deberá calcular SHA-256 real sobre el archivo generado.
11. No existe todavía un validador curricular ejecutable; las validaciones aparecen descritas en documentación y landing, pero no implementadas como reglas de dominio.
12. Los roles actuales no distinguen docente, coordinador de carrera, comisión académica y autoridad aprobadora.

## 3. Arquitectura objetivo

### 3.1. Instrumentos curriculares superiores

Se creará un catálogo versionado para registrar los antecedentes que justifican cada PEA:

- normativa nacional y organismos emisores;
- modelo educativo/pedagógico institucional;
- reglamentos, políticas y formatos institucionales;
- proyecto o rediseño de carrera;
- perfil de egreso y resultados de aprendizaje;
- lineamientos y contenidos mínimos de cada asignatura.

Tablas propuestas:

- `doc_instrumentos_curriculares`: identidad estable, tipo, nivel, código, título, organismo y ámbito.
- `doc_instrumento_versiones`: versión, vigencia, estado, resolución, archivo, hash, datos estructurados y responsable.
- `doc_instrumento_relaciones`: relación entre norma, modelo, proyecto de carrera, perfil, malla y documentos dependientes.
- `doc_resultados_aprendizaje`: resultados versionados del perfil de egreso.
- `doc_asignatura_resultados`: contribución de una asignatura/detalle de malla a resultados del perfil.
- `doc_asignatura_lineamientos`: objetivos, contenidos mínimos y orientaciones asociados a una versión de malla.

Los archivos fuente podrán registrarse, pero para la tesis no se construirá un editor completo para todos estos instrumentos. Sí se implementará su versionamiento, vigencia, aprobación y selección como antecedentes del PEA.

### 3.2. Expediente curricular

El centro del sistema será `doc_expedientes_curriculares`. Un expediente representará la unidad de trabajo curricular de una asignatura dentro de una carrera, malla y período.

Campos mínimos:

- UUID del expediente;
- período, carrera, malla y detalle de malla provenientes de SIGAFI;
- asignatura, nivel, modalidad y jornada/sección aplicables;
- estado global de cobertura;
- snapshot del contexto académico resuelto;
- fechas de apertura, cierre y última sincronización;
- versión del esquema del expediente.

Se añadirá `doc_expediente_asignaciones` para relacionar varias asignaciones y docentes con un mismo expediente. Esto evita duplicar el PEA cuando existen paralelos o coautores, y permite que documentos posteriores tengan un alcance distinto:

- PEA: compartido por asignatura, malla y período cuando la política institucional así lo determine.
- Sílabo: puede especializarse por modalidad, paralelo o asignación.
- Guía APE: puede existir una instancia por práctica.
- Guía de Estudio: normalmente compartida por asignatura y versión del PEA.

La clave de agrupación será configurable y se validará con autoridades académicas antes de fijar un índice único.

### 3.3. Serie documental y revisiones

No se creará otro motor documental. Se evolucionará el actual:

- `doc_documentos_series`: identidad lógica de un entregable dentro de un expediente.
- `doc_documentos_instancias`: cada fila será una revisión concreta de la serie, vinculada mediante `idSerie`, `numeroRevision` y `instanciaAnteriorUuid`.
- `doc_pea` y sus tablas hijas: contenido estructurado de la revisión PEA, vinculado a la instancia y al expediente.
- `doc_cowork_documentos`: fuente viva para campos colaborativos durante edición.
- `data_snapshot_json`: captura inmutable al enviar o aprobar; nunca será la fuente editable principal.
- `template_config_snapshot_json`: estructura exacta de la plantilla utilizada por esa revisión.

Reglas esenciales:

1. Una revisión aprobada o firmada jamás se edita ni reemplaza.
2. Una corrección crea una revisión nueva enlazada a la anterior.
3. Las colecciones aprobadas no se borran y recrean.
4. El cambio de plantilla solo afecta borradores que acepten explícitamente la actualización.
5. El PDF final, sus datos, la plantilla, el hash y las firmas deben poder reconstruir la evidencia exacta.

### 3.4. Workflow curricular configurable

Se ampliará `doc_config_workflow` de forma compatible con investigación, añadiendo código y versión de flujo, tipo de documento, acción, orden, exigencia de firma y política de edición. Se añadirá `doc_workflow_eventos` como registro append-only de cada decisión.

Flujo inicial del PEA:

1. `Borrador`: docente responsable y coautores editan.
2. `Enviado`: se congela la revisión y se ejecutan validaciones.
3. `RevisionCoordinacion`: coordinador comenta, devuelve o avala.
4. `RevisionAcademica`: comisión/autoridad académica revisa.
5. `PendienteFirmas`: se exige la secuencia de firmas configurada.
6. `Aprobado`: se genera el PDF definitivo, snapshot, SHA-256 y código de trazabilidad.
7. `Vigente`: el documento es el aplicable al expediente y período.
8. `Sustituido` o `Anulado`: permanece consultable con su causa y trazabilidad.

Una devolución no reabre destructivamente la revisión enviada: crea o habilita una nueva revisión de trabajo. Los revisores conservan comentarios y decisiones de la revisión anterior.

### 3.5. Responsables y autorización

Debido a que la tabla institucional de autoridades por carrera está vacía, DOSIER administrará responsables sin escribir en SIGAFI:

- `doc_responsables_academicos`: usuario/profesor, cargo, carrera opcional, período, vigencia y fuente de designación.
- Roles iniciales: `DOSIER_DOCENTE`, `DOSIER_COORDINADOR_CARRERA`, `DOSIER_COMISION_ACADEMICA`, `DOSIER_VICERRECTOR_ACADEMICO`, `DOSIER_ADMIN`.
- Operaciones: `CURRICULO:VER`, `CREAR`, `EDITAR`, `ENVIAR`, `REVISAR`, `APROBAR`, `FIRMAR`, `CONFIGURAR` y `AUDITAR`.

La autorización se verificará en servicios y en el Hub de colaboración según expediente, asignación, carrera, etapa y rol; no se confiará únicamente en ocultar opciones del frontend.

### 3.6. Validación y trazabilidad curricular

Se implementará un motor de reglas con resultados persistidos en `doc_validaciones_curriculares`. Cada regla devolverá código, severidad, mensaje, campo/sección, valores comparados y fecha.

Reglas PEA del primer corte:

- la asignación pertenece al docente o existe una designación válida;
- la carrera pertenece al instituto;
- la malla corresponde al período y nivel;
- horas y créditos coinciden con el detalle de malla;
- la suma de horas por unidad coincide con el total oficial;
- las actividades APE no exceden las horas práctico-experimentales;
- los prerrequisitos registrados en SIGAFI se muestran y justifican;
- objetivos, unidades, resultados y bibliografía cumplen mínimos configurables;
- los resultados de asignatura se vinculan con el perfil de egreso vigente;
- todos los antecedentes obligatorios están vigentes/aprobados;
- la secuencia de revisión y firmas está completa.

Las reglas se clasificarán como bloqueantes o advertencias. La baja cobertura actual de prerrequisitos debe producir advertencias de calidad de datos, no conclusiones falsas.

Para los otros entregables se registrarán desde el inicio los contratos de validación:

- Sílabo: 19 semanas, fechas de parciales y suma de horas por componente.
- Guía APE: práctica vinculada a unidad, resultado y horas APE disponibles.
- Guía de Estudio: cobertura de unidades, temas y bibliografía del PEA vigente.

## 4. Plan de ejecución

### Fase 0. Línea base segura

Objetivo: estabilizar el punto de partida antes de ampliar el esquema.

- Inventariar definitivamente migraciones y tablas `doc_*`.
- Convertir los scripts destructivos de desarrollo en migraciones aditivas e idempotentes para MySQL 5.7.
- Añadir pruebas del `AcademicContextResolver` con casos de malla por período, fallback, carrera no institucional y docente incorrecto.
- Corregir la configuración SSL de la suite de integración sin debilitar producción.
- Establecer una política explícita: SIGAFI se consulta con `AsNoTracking()` y jamás se modifica desde DOSIER.

Salida: baseline reproducible, respaldo probado y suite verde o con excepciones documentadas.

### Fase 1. Núcleo curricular común

Objetivo: construir la base que usarán todos los documentos.

- Crear instrumentos/versiones/relaciones curriculares.
- Crear expediente y relación con asignaciones.
- Crear serie documental y revisión enlazada.
- Adaptar `doc_documentos_instancias` sin romper investigación.
- Registrar los tipos `PEA`, `SILABO`, `GUIA_APE` y `GUIA_ESTUDIO`.
- Implementar proveedores de datos por `EntityType`, eliminando supuestos exclusivos de `Proyecto`.

Salida: desde una asignación real se resuelve o crea un expediente y su serie PEA de manera idempotente.

### Fase 2. Workflow, RBAC y colaboración generalizados

Objetivo: hacer que el proceso sea institucionalmente controlable.

- Versionar definiciones de workflow y persistir eventos.
- Crear roles/permisos curriculares y responsables por carrera/período.
- Sustituir los cambios arbitrarios de estado por comandos de transición validados.
- Generalizar la autorización de CoWork para expedientes curriculares.
- Habilitar comentarios por sección/campo, resolución y reapertura.
- Integrar notificaciones con las transiciones.

Salida: docentes, coordinadores y autoridades solo pueden ejecutar acciones permitidas y toda decisión queda auditada.

### Fase 3. Corte vertical completo del PEA

Objetivo: entregar la funcionalidad principal de la tesis.

- Registrar la plantilla oficial PEA en el motor documental.
- Crear dashboard de asignaturas/expedientes del docente.
- Construir editor PEA por secciones con `DOSIERBuilderShell`, `CoWorkField`, autosave y estado de conexión.
- Precargar y bloquear los datos oficiales de SIGAFI.
- Implementar el motor de validaciones PEA y matriz de trazabilidad con perfil de egreso.
- Implementar revisión, devolución, nueva revisión, aprobación y firmas.
- Generar PDF oficial en servidor, calcular SHA-256 real y habilitar verificación pública.
- Implementar clonación/herencia controlada entre períodos, resolviendo nuevamente la malla vigente y mostrando diferencias.

Salida: una asignación institucional real completa todo el circuito hasta producir un PEA vigente, firmado, verificable e históricamente reproducible.

Esta fase define el límite funcional defendible de la tesis.

### Fase 4. Preparación operativa de los demás entregables

Objetivo: demostrar que la arquitectura no está limitada al PEA.

- Registrar plantillas, series, dependencias, scopes y workflows de Sílabo, Guía APE y Guía de Estudio.
- Crear sus proveedores de datos y DTOs apoyados en el expediente y la revisión PEA vigente.
- Exponer su estado en la vista del expediente.
- Impedir su creación cuando falten antecedentes obligatorios.
- Añadir pruebas de contratos y generación mínima de instancias/snapshots.

Salida: los tres tipos pueden crearse correctamente como documentos del expediente y tienen contratos estables, aunque sus editores especializados todavía no formen parte del corte de tesis.

### Fase 5. Implementación completa de Sílabo y Guías

Objetivo: completar el alcance del producto.

- Editor y validador del Sílabo de 19 semanas.
- Editor de Guías APE por práctica y rúbricas.
- Editor de Guía de Estudio por unidad, tema, preguntas y glosario.
- Propagación controlada de cambios desde una nueva revisión PEA.
- PDF, workflow, firmas y trazabilidad de cada tipo.

Salida: portafolio microcurricular completo por expediente.

### Fase 6. Cobertura institucional y acreditación

Objetivo: administrar el proceso a escala del instituto.

- Tableros por carrera, período, malla, docente y tipo de documento.
- Semáforos de cobertura y vencimiento de antecedentes.
- Paquete de evidencia por período/carrera para auditoría.
- Indicadores de tiempos de elaboración, devoluciones, cumplimiento y consistencia.
- Exportación del expediente con manifiesto de archivos, hashes y firmas.

Salida: la institución puede demostrar no solo que posee documentos, sino de qué antecedentes proceden, quién los revisó, qué versión estuvo vigente y si su contenido coincide con la malla oficial.

## 5. Orden de migraciones propuesto

1. `06_instrumentos_curriculares.sql`
2. `07_expedientes_curriculares.sql`
3. `08_series_y_revisiones_documentales.sql`
4. `09_workflow_curricular_y_responsables.sql`
5. `10_validaciones_y_trazabilidad_curricular.sql`
6. `11_seed_plantillas_y_permisos_curriculares.sql`

Cada migración debe:

- ser aditiva;
- comprobar precondiciones;
- incluir índices y restricciones;
- tener consulta de verificación y estrategia de reversión;
- no borrar ni modificar datos institucionales de SIGAFI;
- preservar compatibilidad temporal con los endpoints existentes.

## 6. Estrategia de transición del código actual

1. Mantener temporalmente los controladores `Pea`, `Silabo`, `GuiaApe` y `GuiaEstudio` como adaptadores.
2. Introducir servicios comunes de expediente, revisión, workflow, autorización y validación.
3. Hacer que los controladores existentes deleguen en esos servicios.
4. Mover la generación y snapshot al motor documental genérico.
5. Retirar gradualmente la lógica duplicada de estados, firmas y versiones de cada servicio especializado.
6. Mantener el contenido específico en agregados tipados; no convertir todo el currículo en JSON opaco.

## 7. Pruebas y criterios de aceptación

### Pruebas mínimas

- Unitarias: resolución de contexto, agrupación de expediente, reglas, transiciones y permisos.
- Integración MySQL: índices únicos, relaciones, snapshots y concurrencia.
- Contratos API: serialización `snake_case`, errores y códigos HTTP.
- CoWork: dos docentes, reconexión, deltas, compactación y bloqueo por estado/rol.
- Seguridad: acceso cruzado entre carreras, asignación ajena, escalamiento de roles y edición de documento sellado.
- E2E: asignación -> expediente -> PEA -> revisión -> firmas -> PDF -> verificación.

### Criterios para declarar completo el PEA

- Se crea desde una asignación SIGAFI válida sin duplicados.
- Puede agrupar responsables/paralelos conforme a la política elegida.
- Los datos oficiales no pueden adulterarse desde el cliente.
- Las horas y créditos se validan contra la malla aplicable.
- La redacción concurrente sobrevive a recargas y reconexiones.
- Ningún usuario actúa fuera de su rol, carrera o etapa.
- Una devolución conserva la revisión enviada.
- Una aprobación produce snapshot, plantilla, PDF, SHA-256, firmas y trazabilidad.
- Una revisión aprobada es inmutable.
- El historial puede consultarse y reproducirse.
- Sílabo y Guías pueden vincularse después sin cambiar la identidad del expediente ni reescribir el PEA.

## 8. Riesgos y decisiones pendientes

| Riesgo/decisión | Tratamiento |
|---|---|
| Definir si un PEA es por asignatura, paralelo, modalidad o docente | Resolver mediante política configurable de agrupación y validarla con autoridades antes del índice único. |
| Autoridades no registradas en SIGAFI | Gestionar designaciones vigentes en DOSIER enlazadas a usuarios institucionales. |
| Cobertura mínima de prerrequisitos | Mostrar calidad de fuente y advertencias; no inventar relaciones. |
| Cambios de malla durante un período | Conservar snapshot del contexto y exigir nueva revisión, nunca actualizar silenciosamente un aprobado. |
| Duplicidad entre datos estructurados y CoWork | Definir una fuente de verdad por campo y sincronización explícita antes de congelar snapshot. |
| Documentación técnica adelantada al código | Actualizar los documentos por fase y marcar claramente `implementado`, `parcial` o `planificado`. |
| Dependencias actuales de investigación | Generalizar mediante providers y políticas, manteniendo pruebas de regresión del módulo existente. |

## 9. Primer incremento recomendado

El primer incremento no debe ser todavía una pantalla grande. Debe cerrar la columna vertebral:

1. migración de instrumentos, expedientes, asignaciones y series;
2. servicio `CurricularExpedientService`;
3. provider documental `PeaDocumentDataProvider`;
4. workflow PEA versionado;
5. permisos y responsables académicos;
6. adaptación de `CrearDesdeAsignacionAsync` para crear/resolver expediente, serie, instancia y agregado PEA en una transacción;
7. pruebas de integración del flujo anterior.

Después de ese incremento, el editor PEA se construirá sobre identidades y reglas definitivas, evitando rehacer la interfaz cuando se incorporen los otros documentos.
