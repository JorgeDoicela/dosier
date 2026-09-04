Me conecté directamente a `sigafi_es` en modo de solo lectura. La base tiene 200+ tablas de varios sistemas, pero sí existen datos adicionales útiles para integrar DOSIER con el flujo real.

## Hallazgo principal

La delimitación debe usar como frontera:

> SIGAFI administra la oferta académica real: carreras, mallas aplicadas por período y nivel, asignaciones docentes, modalidades y calendario. DOSIER consume esos datos y gestiona exclusivamente el ciclo institucional del PEA.

No debemos replicar la administración académica dentro de DOSIER.

## Tablas útiles que ya usa el código

### Núcleo curricular

- `carreras`
- `mallas`
- `detallemallas`
- `asignaturas`
- `cursos`
- `tipos_asignatura`
- `prerequisitos`

`detallemallas` está bastante completo:

- 1.086 registros curriculares no anulados.
- Todos tienen horas totales.
- Todos tienen horas docentes.
- Todos tienen créditos.
- Solo uno no tiene horas práctico-experimentales.
- Las horas autónomas pueden derivarse matemáticamente.

Esto ya se consume en [AsignaturasDocenteService.cs](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/backend/dosier_infrastructure/Academico/AsignaturasDocenteService.cs:110).

### Planificación académica

- `periodos`
- `asignaciones_profesores`
- `profesores_carreras_periodos`
- `modalidades`
- `parciales`
- `parciales_modalidades_fechas`
- `horario_detalle`
- `fechas_horarios`
- `horas_clases`

`asignaciones_profesores` tiene más de 23.000 registros y sus relaciones básicas están completas: asignatura, período, nivel y modalidad. Esta tabla permite saber quién debe elaborar cada PEA, para qué asignatura, carrera, modalidad, paralelo y período.

### Identidad y autoridad

- `usuarios`
- `profesores`
- `contratos`
- `cargo_instituto`
- Tablas `rbac_*`

`cargo_instituto` incluye cargos institucionales como rector, vicerrector, profesor, docente, gestor educativo y directores. Además, `contratos` vincula al personal con esos cargos. Esta relación ya se utiliza para obtener automáticamente el cargo de una persona al firmar documentos en [SignatureProfileSubservice.cs](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/backend/dosier_infrastructure/Signatures/Subservices/SignatureProfileSubservice.cs:58).

Puede reutilizarse para mostrar el cargo del aprobador, pero no basta para decidir quién debe aprobar un PEA. Esa autorización necesita una asignación académica configurable.

## Tablas útiles que todavía no usa DOSIER

### `mallas_periodos`

Esta es la incorporación más importante.

Relaciona:

```text
período + nivel + malla
```

Permite determinar qué malla se aplica realmente a cada cohorte y nivel durante un período académico. Esto es más preciso que consultar simplemente `mallas.activa`.

Los datos muestran que durante períodos de transición pueden coexistir dos mallas de una misma carrera. Por ejemplo, en períodos anteriores Desarrollo de Software tuvo niveles asociados a la malla 2020 y otros niveles asociados a la malla 2023.

Actualmente el backend busca una sola malla activa por carrera:

```csharp
_context.Mallas
    .Where(m => m.IdCarrera == idCarrera && m.Activa == true)
```

Eso puede funcionar hoy, pero no reconstruye correctamente información histórica ni transiciones curriculares. Para determinar el PEA aplicable, debería utilizarse:

```text
período + nivel → mallas_periodos → malla → detallemallas
```

### `modalidades_carreras`

Indica qué modalidades están autorizadas para cada carrera. Contiene combinaciones reales como:

- Desarrollo de Software: presencial y en línea.
- Administración de Talento Humano: híbrida.
- Educación Básica: semipresencial.
- Mecánica Automotriz: presencial.

Sirve para evitar que un PEA sea generado para una combinación carrera-modalidad inexistente.

### `secciones`

Contiene las jornadas institucionales:

- Matutina.
- Vespertina.
- Nocturna.
- Fin de semana.

Se puede utilizar para presentar correctamente la asignación docente. No constituye información sustantiva del PEA y debería mantenerse como dato heredado.

### `semanas_horarios` y `fechas_semanas`

`semanas_horarios` define hasta 20 semanas e identifica semanas de examen. `fechas_semanas` ya tiene 139 registros para `ABR2026`.

Estas tablas podrían servir para integrar el contexto del período o para un syllabus futuro, pero no son necesarias para el núcleo del PEA. Conviene dejarlas fuera del desarrollo de tesis, salvo como referencia.

### `agenda_academica`

La estructura sería útil para feriados y actividades académicas, pero solo contiene seis registros de 2017. No debe considerarse una fuente vigente.

### `seddautoridadescarrerasperiodos`

Su estructura es prometedora:

```text
carrera + período + profesor + instrumento + designación
```

Sin embargo, está vacía. Por ahora no puede utilizarse para definir revisores o aprobadores.

## Cómo separar el instituto de la escuela de conducción

La regla más confiable es `carreras.esInstituto = 1`.

La tabla `carreras` contiene:

- Carreras antiguas.
- Escuela de conducción.
- Inglés.
- Carreras actuales del instituto.
- Carreras inactivas.

La escuela de conducción tiene su propia carrera y muchas tablas específicas:

- `cond_*`
- `alumnos_acta_conduccion`
- `calificaciones_conduccion`
- `categorias_examenes_conduccion`
- `asignacion_instructores_vehiculos`
- `vehiculos`
- `vehiculos_operacion`

Todo eso debe excluirse.

Además, `instituciones_instituto` tiene dos registros separados: el instituto y la escuela de conducción. DOSIER debe filtrar explícitamente el registro correspondiente al ISTPET.

El servicio de catálogo actual filtra únicamente por `carreras.activa`, sin comprobar `esInstituto`, por lo que potencialmente puede incluir la escuela de conducción u otras ofertas activas. Ese punto está en [CurriculumCatalogService.cs](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/backend/dosier_infrastructure/Curriculum/CurriculumCatalogService.cs:47).

## Problemas de calidad de datos detectados

1. **Período activo inconsistente.**
   `OCT2025` conserva `periodoactivoinstituto = 1`, aunque termina en marzo de 2026. `ABR2026` tiene fechas de abril a septiembre de 2026 y está marcado como período de planificación, pero no como período activo institucional.

2. **El código prioriza la bandera antes que las fechas.**
   [AsignaturasDocenteService.cs](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/backend/dosier_infrastructure/Academico/AsignaturasDocenteService.cs:20) puede seleccionar `OCT2025` antes que `ABR2026` debido al orden actual.

3. **`ABR2026` tiene 365 asignaciones docentes, pero cero registros en `mallas_periodos`.**
   Para ese período habría que aplicar una regla de contingencia o completar la relación institucional.

4. **Solo existen dos prerrequisitos activos.**
   La estructura sirve, pero probablemente la información institucional está incompleta. No podemos afirmar que una asignatura no tenga prerrequisitos solo porque no aparezca en esa tabla sin validarlo con la malla oficial.

5. **`parametros` está vacía.**
   No sirve actualmente para obtener rector, firma o sello, aunque el modelo del código la contempla.

6. **La tabla de autoridades académicas por carrera está vacía.**

7. **RBAC no tiene todavía roles curriculares completos.**
   Existen `DOSIER_ADMIN` y `DOSIER_DOCENTE`, pero no aparecen roles específicos para coordinador de carrera, comisión académica, coordinación de docencia o aprobador del PEA.

## Lo que definitivamente sigue faltando

No encontré fuera de `doc_*` estructuras utilizables para:

- Modelo educativo y sus versiones.
- Proyecto aprobado de carrera.
- Resolución de aprobación de la carrera o malla.
- Perfil de egreso estructurado.
- Resultados de aprendizaje del perfil.
- Relación entre asignaturas y resultados del perfil de egreso.
- Contenidos mínimos oficiales por asignatura.
- Procedimiento institucional de aprobación del PEA.
- Designación vigente de revisores y aprobadores curriculares.

Las tablas de “resultados de aprendizaje” encontradas pertenecen al módulo de vinculación y describen resultados de proyectos de vinculación. No deben reutilizarse para el perfil de egreso o el PEA.

## Delimitación final basada en la base real

### Ya resuelto por SIGAFI

```text
Carrera
→ malla aplicable por período y nivel
→ asignatura
→ créditos y horas
→ modalidad y jornada
→ asignación del docente
→ calendario académico
```

DOSIER solo debe leer esta información.

### Núcleo nuevo de la tesis

```text
Asignación académica recibida desde SIGAFI
→ creación o actualización del PEA
→ vinculación con perfil de egreso
→ elaboración colaborativa
→ validaciones curriculares
→ revisión y observaciones
→ corrección
→ aprobación colegiada
→ firma o formalización
→ publicación
→ vigencia y versionado
→ reporte de cobertura por malla
```

### Fuera del alcance

- Administración de carreras y mallas.
- Matrículas y estudiantes.
- Calificaciones.
- Horarios.
- Contratación de docentes.
- Conducción.
- Bienestar.
- Finanzas.
- Vinculación.
- Vacaciones.
- Desarrollo completo de sílabos y guías.

La prioridad técnica debería ser integrar `mallas_periodos`, aplicar siempre el filtro `esInstituto = 1` y corregir la selección del período. Esas tres decisiones conectan DOSIER con el funcionamiento académico real sin ampliar innecesariamente la tesis. No modifiqué la base de datos ni el código.










eso del periodo no te preocupes que si se gestiona bien, yo lo movi porque estoy en desarrollo de otra cosa local pero se tomar backups de produccion en esta base de datos de la maquina que analizaste, ¿que hay que hacer?






Entendido: no consideraré el estado del período local como problema. Partiendo de que los respaldos representan producción, hay que integrar lo que SIGAFI ya gestiona y concentrar el desarrollo nuevo en el PEA.

## Qué hay que hacer

### 1. Definir la frontera entre SIGAFI y DOSIER

SIGAFI será la fuente oficial de solo lectura para:

- Instituto y oferta académica.
- Profesores.
- Carreras.
- Períodos.
- Mallas aplicables.
- Asignaturas.
- Nivel, modalidad, jornada y paralelo.
- Créditos y horas.
- Prerrequisitos.
- Asignaciones docentes.
- Cargos institucionales.

DOSIER no permitirá editar esos datos. Los mostrará en el PEA y verificará su consistencia.

### 2. Corregir cómo se determina la malla aplicable

Actualmente se busca una sola `malla.activa` por carrera. Debemos utilizar, cuando tenga información:

```text
asignación docente
→ período
→ nivel
→ mallas_periodos
→ malla correspondiente
→ detallemallas
```

Esto permite manejar correctamente cohortes que todavía utilizan una malla anterior mientras los niveles nuevos ya utilizan un rediseño.

La regla propuesta sería:

1. Buscar `mallas_periodos` por período y nivel.
2. Confirmar que la malla pertenece a la carrera.
3. Buscar la asignatura en `detallemallas`.
4. Si SIGAFI aún no cargó `mallas_periodos`, utilizar temporalmente la malla activa.
5. Registrar qué mecanismo resolvió la malla para poder auditarlo.

### 3. Filtrar estrictamente la oferta del instituto

Toda consulta curricular debería exigir:

```text
carreras.esInstituto = 1
```

Y, cuando se consulten datos institucionales, seleccionar el registro del ISTPET, no el de la escuela de conducción.

No basta con comprobar `carreras.activa`, porque conducción y otras ofertas también pueden estar activas.

### 4. Crear el PEA desde una asignación real

El PEA no debería iniciarse seleccionando manualmente carrera, asignatura, horas y profesor.

Debe originarse desde:

```text
asignaciones_profesores.idAsignacion
```

A partir de esa asignación DOSIER obtiene:

- Docente elaborador.
- Período.
- Asignatura.
- Carrera.
- Nivel.
- Modalidad.
- Jornada o sección.
- Paralelo.
- Malla y detalle de malla.
- Horas y créditos.
- Prerrequisitos.

Esto demuestra la integración con el flujo institucional real.

Además, `doc_pea` debería guardar `idAsignacion` e `idDetalleMalla`. Actualmente solo guarda carrera, asignatura y período, lo que resulta ambiguo si una asignatura se dicta en varias modalidades, paralelos o niveles.

### 5. Convertir los datos de SIGAFI en campos bloqueados

En el editor del PEA deben ser de solo lectura:

- Nombre y código de asignatura.
- Carrera.
- Período.
- Malla.
- Nivel.
- Modalidad.
- Créditos.
- Horas totales.
- Horas con docente.
- Horas práctico-experimentales.
- Horas autónomas.
- Prerrequisitos.

Actualmente [PeaService.cs](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/backend/dosier_infrastructure/Curriculum/PeaService.cs:54) acepta desde el DTO las horas, créditos, modalidad y nivel. Eso permite que el cliente envíe valores diferentes de SIGAFI.

Al guardar, el backend debe volver a consultar SIGAFI y aplicar los valores oficiales. El frontend solo los presenta.

### 6. Guardar una fotografía curricular

Aunque SIGAFI sea la fuente oficial, los datos pueden cambiar posteriormente. Cuando el PEA se envíe a revisión o se apruebe, debemos guardar un snapshot con:

```json
{
  "id_asignacion": 0,
  "id_malla": 0,
  "id_detalle_malla": 0,
  "id_carrera": 0,
  "id_asignatura": 0,
  "id_periodo": "",
  "creditos": 0,
  "horas_contacto": 0,
  "horas_ape": 0,
  "horas_autonomas": 0,
  "prerrequisitos": [],
  "fecha_captura": ""
}
```

Así, un PEA aprobado no cambia si posteriormente SIGAFI modifica una descripción, una autoridad o una malla.

Se puede aprovechar el patrón de snapshot que ya existe en `document_instances`.

### 7. Incorporar los antecedentes que SIGAFI no tiene

Hace falta mantener en DOSIER:

- Versiones del modelo educativo.
- Proyectos o versiones curriculares de carrera.
- Perfil de egreso por carrera y versión.
- Resultados de aprendizaje del perfil.
- Relación entre asignaturas y resultados del perfil.
- Normativa interna aplicable al PEA.

No hace falta digitalizar todos esos documentos completos. Para la tesis basta con registrar:

- Nombre.
- Código o resolución.
- Versión.
- Vigencia.
- Archivo o enlace oficial.
- Estado.
- Relaciones curriculares necesarias.

El PEA debe indicar qué versiones sustentaron su elaboración.

### 8. Separar resultados institucionales y resultados del PEA

La tabla actual `doc_pea_resultados_aprendizaje` mezcla resultados de tipo `Carrera` y `Asignatura` como texto copiado.

Conviene separar:

```text
doc_perfiles_egreso
doc_perfil_egreso_resultados
doc_asignatura_resultado_perfil
doc_pea_resultados_aprendizaje
```

De esta manera:

- Los resultados del perfil se administran una sola vez por carrera y versión.
- Cada asignatura selecciona a cuáles contribuye.
- El PEA formula sus propios resultados de aprendizaje.
- Se conserva la trazabilidad entre ambos niveles.

No deben reutilizarse las tablas de resultados de aprendizaje del módulo de vinculación.

### 9. Completar el contenido metodológico del PEA

El modelo existente ya contempla:

- Objetivo de la asignatura.
- Metodología.
- Recursos.
- Unidades.
- Temas.
- Resultados de aprendizaje.
- Actividades prácticas.
- Bibliografía.

Debe añadirse o comprobarse:

- Función de la asignatura en la formación profesional.
- Correspondencia con el perfil de egreso.
- Sistema y criterios de evaluación.
- Evidencias para evaluar resultados.
- Distribución horaria validada por unidad.
- Sustentación de la bibliografía.
- Diferenciación entre bibliografía básica y de consulta.
- Observaciones o fundamentos metodológicos.
- Reglas de obligatoriedad frente a recomendaciones docentes.

### 10. Rehacer el flujo de aprobación

El método actual permite cambiar `Estado` directamente a cualquier texto y, al aprobar, guarda la firma en un campo denominado `FirmaAprobadoVicerrector`. Esto contradice la necesidad de un flujo institucional configurable.

El flujo mínimo debería ser:

```text
Borrador
→ En revisión
→ Observado
→ Corregido
→ Validado académicamente
→ Aprobado
→ Publicado
→ Reemplazado o archivado
```

Se necesitan:

- Transiciones permitidas.
- Permiso requerido por transición.
- Usuario responsable.
- Cargo institucional.
- Observación.
- Fecha.
- Versión afectada.
- Evidencia o firma.
- Historial inalterable.

Los aprobadores no deben estar codificados como “vicerrector”. Deben asignarse por rol, carrera, período y etapa. Puede conservarse el cargo real obtenido desde `contratos` y `cargo_instituto`.

### 11. Crear los roles curriculares

El RBAC actual tiene administrador y docente de DOSIER, pero faltan roles como:

- Coordinador de asignatura o colectivo.
- Coordinador de carrera.
- Revisor académico.
- Coordinación de docencia.
- Aprobador institucional.
- Auditor o consulta.

Una persona puede tener varios roles y estos deberían configurarse por carrera y período, no solamente de forma global.

### 12. Corregir el versionado

Actualmente:

- `Version` nace en `1`.
- No se incrementa durante las actualizaciones.
- Clonar a otro período vuelve a colocarla en `1`.
- Los elementos secundarios se eliminan y recrean en cada guardado.

Debemos distinguir:

- Guardados de trabajo dentro del mismo borrador.
- Nueva versión formal.
- Clonación para otro período.
- Corrección posterior a observaciones.
- Reemplazo de un PEA aprobado.

Una versión aprobada debe ser inmutable. Toda modificación posterior debe crear una versión nueva vinculada con la anterior.

### 13. Implementar validaciones automáticas

Como mínimo:

- Las horas del PEA coinciden con `detallemallas`.
- La suma de horas de las unidades coincide con el total.
- La suma por componente coincide con docencia, APE y autónomo.
- La suma de actividades prácticas no excede las horas APE.
- La asignatura pertenece a la malla resuelta.
- La modalidad está autorizada para la carrera.
- Los prerrequisitos provienen de SIGAFI.
- Cada resultado del PEA está relacionado con unidades y evaluación.
- Existe al menos bibliografía básica.
- Los campos obligatorios están completos antes de revisión.
- El usuario tiene asignación o autorización para intervenir.

Como `prerequisitos` tiene poca información, el sistema debe mostrarlos como “registrados en SIGAFI”, no afirmar automáticamente que la ausencia representa una validación curricular completa.

### 14. Crear el tablero de cobertura

La cobertura se calcula desde la malla, no desde los PEA existentes:

```text
Asignaturas que requieren PEA
                versus
PEA válido y aprobado para la malla o período
```

Estados recomendados:

- Sin PEA.
- Borrador.
- En revisión.
- Observado.
- Validado.
- Aprobado.
- Publicado.
- Vencido.
- Reemplazado.
- Inconsistente con SIGAFI.

Debe poder filtrarse por carrera, malla, nivel, período, modalidad y responsable.

## Orden recomendado de implementación

1. Integración segura con `mallas_periodos` y filtro `esInstituto`.
2. Creación del PEA desde `idAsignacion`.
3. Campos curriculares heredados y bloqueados.
4. Snapshot curricular.
5. Perfiles de egreso y sus resultados.
6. Validaciones del PEA.
7. Roles curriculares.
8. Flujo configurable y trazabilidad.
9. Versionado e inmutabilidad.
10. Publicación y PDF oficial.
11. Tablero de cobertura.
12. Pruebas con docentes y autoridades.

## Alcance resultante de la tesis

El producto puede definirse así:

> DOSIER se integra con la planificación académica administrada en SIGAFI y, a partir de las asignaciones docentes y las mallas aplicables por período y nivel, gestiona la elaboración colaborativa, validación, revisión, aprobación, publicación, versionado y trazabilidad de los Programas de Estudio de Asignatura del ISTPET.

Ese es el trabajo necesario. No hay que reconstruir todo el flujo superior: hay que demostrarlo mediante las integraciones, referencias y snapshots que originan cada PEA.





ok, haz un plan para poder hacerlo






## Plan de implementación para limitar DOSIER al PEA

El trabajo se organizará en ocho fases. La prioridad es integrar correctamente SIGAFI antes de ampliar el editor del PEA.

### Fase 1 Preparación y protección del alcance

Objetivo: establecer una base segura para trabajar sin afectar SIGAFI.

Tareas:

- Documentar las tablas institucionales autorizadas para lectura.
- Garantizar que EF Core trate las tablas de SIGAFI como solo lectura.
- Definir el filtro institucional común:
  - `carreras.esInstituto = 1`.
  - Excluir escuela de conducción y carreras históricas no aplicables.
- Crear una configuración para habilitar el nuevo módulo PEA progresivamente.
- Preparar datos de prueba anonimizados.
- Definir estados, roles y reglas antes de modificar la base.

Resultado:

- Documento técnico de integración.
- Matriz de tablas y responsabilidades.
- Reglas de alcance cerradas.
- Entorno de pruebas reproducible.

---

### Fase 2 Resolver el contexto académico real

Objetivo: obtener correctamente la asignatura que debe planificarse.

Flujo de resolución:

```text
Profesor
→ asignación docente
→ período
→ nivel y paralelo
→ carrera del nivel
→ malla aplicable por período y nivel
→ detalle de malla
→ asignatura y prerrequisitos
```

Tareas:

- Mapear en EF Core:
  - `mallas_periodos`.
  - `modalidades_carreras`.
  - `secciones`.
- Crear un servicio `AcademicContextResolver`.
- Resolver la malla usando `mallas_periodos`.
- Implementar fallback controlado hacia `mallas.activa`.
- Validar que la modalidad esté habilitada para la carrera.
- Incorporar `id_asignacion`, `id_malla` e `id_detalle_malla` al contexto.
- Devolver advertencias cuando falte información institucional.
- Aplicar `AsNoTracking()` a todas las consultas.

Respuesta esperada del servicio:

```json
{
  "id_asignacion": 123,
  "id_profesor": "...",
  "id_periodo": "OCT2025",
  "id_carrera": 9,
  "id_malla": 23,
  "id_detalle_malla": 500,
  "id_asignatura": 80,
  "id_nivel": 50,
  "id_modalidad": 1,
  "id_seccion": 1,
  "paralelo": "A",
  "creditos": 4,
  "horas_totales": 192,
  "horas_docencia": 64,
  "horas_ape": 32,
  "horas_autonomas": 96,
  "prerrequisitos": [],
  "fuente_malla": "mallas_periodos"
}
```

Criterio de aceptación:

- El sistema determina la malla correcta sin pedir al docente que seleccione o escriba datos curriculares.

---

### Fase 3 Modelar los antecedentes curriculares

Objetivo: representar el proceso anterior al PEA sin desarrollar un sistema completo de diseño curricular.

Tablas nuevas sugeridas:

```text
doc_normativas_curriculares
doc_modelos_educativos
doc_proyectos_carrera
doc_perfiles_egreso
doc_perfil_egreso_resultados
doc_asignatura_resultado_perfil
```

Información mínima:

- Código.
- Nombre.
- Versión.
- Resolución o documento de aprobación.
- Fecha de vigencia.
- Estado.
- Archivo o enlace.
- Carrera y malla relacionadas.

Tareas:

- Crear entidades, configuraciones EF Core y migración.
- Administrar versiones del modelo educativo.
- Registrar el proyecto curricular de cada carrera.
- Registrar perfiles de egreso y sus resultados.
- Relacionar asignaturas con resultados del perfil.
- Crear pantallas administrativas sencillas.
- Impedir eliminar antecedentes utilizados por PEA aprobados.

Criterio de aceptación:

- Cada PEA puede demostrar qué modelo educativo, proyecto de carrera, malla y perfil de egreso lo sustentan.

---

### Fase 4 Rediseñar la identidad y persistencia del PEA

Objetivo: evitar ambigüedades y preservar la historia curricular.

Cambios sugeridos en `doc_pea`:

```text
id_asignacion
id_malla
id_detalle_malla
id_modelo_educativo
id_proyecto_carrera
id_perfil_egreso
version
id_pea_anterior
motivo_nueva_version
estado
fecha_vigencia_desde
fecha_vigencia_hasta
publicado
fecha_publicacion
snapshot_curricular_json
```

Restricción recomendada:

```text
asignación + versión → única
```

Tareas:

- Crear PEA desde una asignación docente.
- Evitar creación manual con carrera y asignatura arbitrarias.
- Obtener horas y créditos exclusivamente desde SIGAFI.
- Guardar snapshot curricular.
- Distinguir borrador, versión y clonación entre períodos.
- Mantener las versiones aprobadas como inmutables.
- Impedir actualizaciones destructivas de resultados, unidades y bibliografía en versiones formalizadas.

Criterio de aceptación:

- El documento aprobado continúa siendo reproducible aunque posteriormente cambien datos de SIGAFI.

---

### Fase 5 Completar el contenido del PEA

Objetivo: cumplir los componentes metodológicos exigidos.

Bloques del editor:

1. Identificación oficial.
2. Función de la asignatura.
3. Aporte al perfil de egreso.
4. Objetivos y resultados de aprendizaje.
5. Unidades, temas y distribución horaria.
6. Metodología.
7. Actividades práctico-experimentales.
8. Sistema de evaluación.
9. Recursos.
10. Bibliografía básica y de consulta.
11. Responsables y fundamentos de elaboración.

Tablas nuevas o ampliaciones:

```text
doc_pea_resultados_aprendizaje
doc_pea_resultados_perfil
doc_pea_unidades
doc_pea_temas
doc_pea_evaluaciones
doc_pea_criterios_evaluacion
doc_pea_actividades_practicas
doc_pea_bibliografia
```

Tareas:

- Separar resultados del perfil y resultados propios del PEA.
- Relacionar resultados con unidades y evaluación.
- Incluir horas por componente en cada unidad.
- Clasificar bibliografía.
- Guardar fundamento de la selección bibliográfica.
- Revisar el formato oficial generado.

Criterio de aceptación:

- El PEA contiene todos los campos evaluables y puede generarse sin completar datos en Word.

---

### Fase 6 Implementar validaciones curriculares

Objetivo: impedir que un PEA inconsistente avance a revisión.

Validaciones automáticas:

- La asignatura pertenece a la malla resuelta.
- La asignación corresponde al docente y período.
- Créditos y horas coinciden con `detallemallas`.
- La modalidad está habilitada para la carrera.
- Las horas de las unidades suman el total.
- Cada componente suma lo establecido en SIGAFI.
- Las actividades prácticas respetan las horas APE.
- Los resultados están vinculados con unidades y evaluación.
- Existe aporte al perfil de egreso.
- Existe bibliografía básica.
- Los campos obligatorios están completos.
- No existe otro PEA vigente incompatible.

Clasificación:

- Error: impide enviar a revisión.
- Advertencia: requiere justificación.
- Información: recomendación metodológica.

Criterio de aceptación:

- Un PEA no puede enviarse a revisión mientras tenga errores curriculares.

---

### Fase 7 Flujo institucional roles y trazabilidad

Objetivo: convertir la aprobación en un proceso académico verificable.

Estados:

```text
Borrador
→ En revisión
→ Observado
→ Corregido
→ Validado académicamente
→ Aprobado
→ Publicado
→ Reemplazado o archivado
```

Tablas sugeridas:

```text
doc_pea_workflow_config
doc_pea_asignaciones_revision
doc_pea_transiciones
doc_pea_observaciones
doc_pea_aprobaciones
```

Roles:

- Docente elaborador.
- Colaborador.
- Coordinador de asignatura.
- Coordinador de carrera.
- Revisor académico.
- Aprobador institucional.
- Administrador curricular.
- Auditor.

Tareas:

- Configurar responsables por carrera, período y etapa.
- Autorizar transiciones mediante RBAC.
- Registrar observaciones con estado pendiente o resuelto.
- Conservar usuario, cargo, fecha, decisión y justificación.
- Integrar firma institucional.
- Bloquear edición después de aprobación.
- Crear una nueva versión para modificaciones posteriores.
- No codificar “vicerrector” como aprobador obligatorio.

Criterio de aceptación:

- Cada cambio de estado puede reconstruirse y verificarse cronológicamente.

---

### Fase 8 Publicación cobertura y evidencias

Objetivo: producir el documento oficial y demostrar cobertura institucional.

Tareas:

- Generar PDF desde la versión aprobada.
- Incorporar:
  - Código institucional.
  - Número de versión.
  - Responsables.
  - Fechas.
  - Firmas.
  - Hash.
  - Código QR de verificación.
- Publicar una versión inmutable.
- Implementar tablero de cobertura.
- Exportar reporte para CACES.
- Permitir descarga del PEA y su historial.
- Mantener vínculos posteriores hacia syllabus y guías sin desarrollarlos en la tesis.

Indicador:

```text
Cobertura PEA =
PEA aprobados y válidos
÷
asignaturas que requieren PEA según las mallas aplicables
× 100
```

Criterio de aceptación:

- El sistema identifica asignaturas con PEA aprobado, pendiente, observado, inconsistente o faltante.

## Pruebas necesarias

### Pruebas unitarias

- Resolución de malla.
- Cálculo de horas autónomas.
- Validaciones horarias.
- Transiciones permitidas.
- Inmutabilidad.
- Creación de versiones.
- Cálculo de cobertura.

### Pruebas de integración

- Lectura de SIGAFI.
- Creación desde asignación docente.
- Relación con perfil de egreso.
- Flujo completo de aprobación.
- Generación y verificación del PDF.
- Comportamiento cuando faltan datos institucionales.

### Pruebas con usuarios

- Docente elabora el PEA.
- Coordinador formula observaciones.
- Docente corrige.
- Revisor valida.
- Autoridad aprueba.
- Auditor consulta evidencia.
- Administrador obtiene reporte de cobertura.

## Orden de entregas

| Entrega | Contenido |
|---|---|
| 1 | Integración académica y resolución de contexto |
| 2 | Antecedentes curriculares y perfil de egreso |
| 3 | Nuevo modelo y editor del PEA |
| 4 | Validaciones automáticas |
| 5 | Roles, observaciones y aprobación |
| 6 | Versionado, snapshots y publicación |
| 7 | PDF oficial y tablero de cobertura |
| 8 | Pruebas, documentación y evaluación de tesis |

## Prioridad inmediata

El primer bloque de desarrollo debería incluir exclusivamente:

1. Mapear `mallas_periodos`, `modalidades_carreras` y `secciones`.
2. Aplicar el filtro `esInstituto`.
3. Crear `AcademicContextResolver`.
4. Modificar la creación del PEA para partir de `idAsignacion`.
5. Guardar `idMalla` e `idDetalleMalla`.
6. Bloquear en el backend los datos heredados de SIGAFI.
7. Agregar pruebas de integración.

Solo después conviene desarrollar perfiles de egreso y el flujo de aprobación. Esto evita construir el nuevo PEA sobre una selección curricular incorrecta.
























pero no solo se limitara al pea, para mi tesis se limitara al pea pero para debe estar listo, y mejor hagamoslo desde ahora mismo ya, para que abarque todo lo que debe abarcar






















Correcto: DOSIER abarcará todo el portafolio curricular, aunque la evaluación de la tesis se cierre funcionalmente en el PEA.

Ya inicié la implementación.

### Implementado

- Mapeo de `mallas_periodos`, `modalidades_carreras` y `secciones`.
- Filtro obligatorio `esInstituto = 1`.
- Resolución de malla por período y nivel.
- Fallback controlado a la malla activa.
- Servicio transversal `AcademicContextResolver`.
- Endpoint `GET /api/docente-asignaturas/contexto/{idAsignacion}`.
- Listado de materias alineado con la nueva resolución curricular.
- Creación de PEA mediante:
  - `POST /api/pea/desde-asignacion/{idAsignacion}`.
- Verificación de que la asignación pertenezca al docente autenticado.
- Horas, créditos y datos curriculares protegidos frente a cambios del cliente.
- Snapshot curricular para preservar la información oficial.
- Preparación del contexto compartido para:
  - PEA.
  - Syllabus.
  - Guías APE.
  - Guía de estudio.

El resolvedor principal está en [AcademicContextResolver.cs](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/backend/dosier_infrastructure/Academico/AcademicContextResolver.cs:1), y el nuevo flujo de creación del PEA en [PeaService.cs](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/backend/dosier_infrastructure/Curriculum/PeaService.cs:1).

### Base de datos

Amplié `doc_pea` con:

- `idAsignacion`
- `idMalla`
- `idDetalleMalla`
- `idNivel`
- `idModalidad`
- `idSeccion`
- `paralelo`
- `fuenteMalla`
- `snapshotCurricularJson`
- Índice por asignación y versión

La migración está documentada en [05_contexto_academico_pea.sql](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/scripts/base_datos/05_contexto_academico_pea.sql:1) y ya fue aplicada correctamente a la base local. Fue una modificación aditiva únicamente sobre `doc_pea`; no se alteraron tablas institucionales de SIGAFI.

### Verificación

- Backend compilado correctamente.
- Cero errores.
- Cero advertencias.
- `git diff --check` sin defectos.
- La consulta real asignación → nivel → `mallas_periodos` → `detallemallas` fue validada contra la base.
- La suite ejecutó 110 pruebas: 104 pasaron y 6 pruebas antiguas fallaron por autenticación SSL de MySQL en su configuración interna, no por estos cambios.

### Siguiente bloque

La siguiente entrega debe construir los antecedentes compartidos:

1. Modelos educativos versionados.
2. Proyectos curriculares de carrera.
3. Perfiles de egreso.
4. Resultados del perfil.
5. Relación asignatura–resultado del perfil.
6. Normativa curricular aplicable.
7. Snapshot común reutilizable por los cuatro documentos.
8. Flujo institucional configurable para revisión, observaciones, aprobación y publicación.

Aún no hay interfaz curricular en `dosier_web`; actualmente el frontend está concentrado en investigación y administración. Por ello, después del modelo curricular habrá que crear el módulo web completo de portafolio docente.























esque veras, te explico, quiero que este sistema abarque todo el proceso necesario y si es de crear tablas las creamos pero quiero que abarque todo, y en el nivel institucional nos limitaremos al pea pero estara preparado para todos. analiza la situacion y responde





















Ahora entiendo mejor la intención:

> DOSIER debe cubrir todo el proceso curricular institucional que conduce desde la normativa y la planificación académica hasta los documentos docentes y sus evidencias. Para la tesis, la implementación y evaluación profunda llegará hasta el PEA; los demás documentos quedarán integrados arquitectónicamente y preparados para continuar el mismo ciclo.

Esto cambia el enfoque. No debe ser solamente “un editor de PEA conectado a SIGAFI”, pero tampoco debe intentar reemplazar todo SIGAFI.

## Qué significa abarcar todo el proceso

DOSIER debe representar estas capas:

```text
Normativa nacional
→ normativa y modelo educativo institucional
→ proyectos curriculares de carrera
→ perfiles de egreso
→ mallas y asignaturas
→ planificación del período y asignación docente
→ PEA
→ syllabus
→ guías APE
→ guías de estudio
→ ejecución académica
→ seguimiento y evaluación
→ retroalimentación y actualización curricular
→ evidencias para calidad y CACES
```

Cada capa tendrá uno de tres niveles de implementación:

| Nivel | Significado |
|---|---|
| Gestión completa | DOSIER crea, revisa, aprueba, versiona y publica |
| Integración | La información pertenece a SIGAFI y DOSIER la consume |
| Preparación | Existe el modelo, vínculo y contrato técnico, pero su editor completo se implementará después |

## Distribución correcta de responsabilidades

### 1 Normativa nacional

DOSIER no modifica normativa, pero debe registrar:

- Organismo emisor.
- Tipo de norma.
- Código o resolución.
- Nombre.
- Fecha de emisión.
- Fecha de vigencia.
- Estado.
- Archivo o enlace.
- Versión.
- Ámbito de aplicación.
- Componentes curriculares afectados.

Tablas sugeridas:

```text
doc_normativas
doc_normativa_versiones
doc_normativa_requisitos
doc_normativa_relaciones
```

Así se puede demostrar qué norma sustentaba un documento en la fecha de aprobación.

### 2 Gobierno institucional

DOSIER debe gestionar o registrar:

- Modelo educativo.
- Políticas académicas.
- Reglamento o procedimiento del PEA.
- Formatos institucionales.
- Estructura de aprobación.
- Autoridades y responsables académicos.
- Períodos de vigencia.

Tablas sugeridas:

```text
doc_instrumentos_institucionales
doc_instrumento_versiones
doc_estructuras_aprobacion
doc_responsables_academicos
```

Aquí sí debe existir versionado y trazabilidad, aunque para la tesis no sea necesario construir un editor avanzado de todos los instrumentos. Se pueden cargar, registrar y relacionar.

### 3 Diseño curricular de carreras

Debe representar:

- Proyecto de carrera.
- Resolución de aprobación.
- Versión o rediseño.
- Perfil de egreso.
- Resultados del perfil.
- Contenidos mínimos.
- Relación asignatura–perfil.
- Malla asociada.
- Vigencia.

SIGAFI ya contiene carreras, mallas y asignaturas, pero no toda su fundamentación académica. DOSIER completará lo que falta.

Tablas sugeridas:

```text
doc_proyectos_carrera
doc_proyecto_carrera_versiones
doc_perfiles_egreso
doc_perfil_resultados
doc_asignatura_perfil_resultados
doc_asignatura_lineamientos
```

`doc_asignatura_lineamientos` podría guardar los resultados y contenidos mínimos definidos antes de elaborar el PEA.

### 4 Planificación académica

Esta capa pertenece principalmente a SIGAFI:

- Períodos.
- Mallas aplicadas por nivel.
- Asignaturas.
- Modalidades.
- Jornadas.
- Paralelos.
- Docentes.
- Carga académica.
- Horarios.

DOSIER la consume en modo de solo lectura. La implementación iniciada con `AcademicContextResolver` corresponde precisamente a esta capa.

### 5 Gestión microcurricular

Aquí se encuentran los cuatro documentos:

```text
PEA
├── syllabus
├── guías APE
└── guía de estudio
```

El PEA es el documento rector. Los demás deben heredar su contexto y contenido autorizado.

#### Para la tesis

Se implementará completamente:

- Elaboración del PEA.
- Colaboración.
- Validaciones.
- Observaciones.
- Correcciones.
- Aprobación.
- Firma.
- Publicación.
- Versionado.
- Cobertura.
- Evidencias.

#### Preparación para los otros documentos

Deben quedar definidos:

- Relación con el PEA.
- Contexto académico compartido.
- Estados.
- Versiones.
- Responsables.
- Dependencias.
- Reglas de propagación.
- Snapshot.
- Plantilla documental.
- API base.
- Permisos.
- Extensión del workflow.

Los editores completos del syllabus y las guías pueden quedar fuera de la evaluación de la tesis, aunque las tablas existentes pueden conservarse y evolucionar posteriormente.

## Arquitectura que conviene adoptar

No debemos crear cuatro sistemas independientes. El diseño debe tener un núcleo transversal:

```text
Contexto académico
        ↓
Expediente curricular
        ↓
Documento curricular
        ↓
Contenido especializado
        ↓
Workflow
        ↓
Versión
        ↓
Aprobaciones
        ↓
Publicación y evidencia
```

### Expediente curricular

Conviene crear una entidad que agrupe toda la documentación de una asignación:

```text
doc_expedientes_curriculares
```

Campos principales:

- Asignación docente.
- Carrera.
- Malla.
- Detalle de malla.
- Asignatura.
- Período.
- Nivel.
- Modalidad.
- Sección.
- Paralelo.
- Responsable.
- Estado general.
- Snapshot académico.
- Fecha de apertura y cierre.

Relaciones:

```text
Expediente curricular
├── PEA
├── syllabus
├── guías APE
├── guía de estudio
├── aprobaciones
├── observaciones
├── firmas
└── evidencias
```

Esto evita repetir el contexto institucional en cada documento.

### Documento curricular genérico

Ya existe un motor de `document_instances`, pero habrá que alinearlo con el ámbito curricular. La entidad genérica debe identificar:

- Expediente.
- Tipo de documento.
- Plantilla y versión.
- Estado.
- Versión documental.
- Documento anterior.
- Snapshot.
- Hash.
- Archivo publicado.
- Vigencia.
- Fecha de aprobación.
- Fecha de publicación.

Las tablas especializadas como `doc_pea`, `doc_silabo` y `doc_guias_ape` contendrán únicamente el contenido propio de cada tipo.

## Flujo completo del sistema

### Configuración

```text
Registrar normativa
→ registrar modelo educativo
→ registrar proyecto de carrera
→ registrar perfil de egreso
→ vincular malla y resultados
→ configurar tipos documentales
→ configurar workflow y responsables
```

### Inicio del período

```text
Leer planificación de SIGAFI
→ detectar asignaciones docentes
→ resolver malla por período y nivel
→ abrir expedientes curriculares
→ calcular documentos requeridos
→ asignar responsables
```

### Elaboración

```text
Crear PEA
→ heredar datos oficiales
→ vincular perfil de egreso
→ redactar contenido
→ validar estructura y horas
→ trabajar colaborativamente
```

### Revisión

```text
Enviar a revisión
→ asignar revisor
→ registrar observaciones
→ corregir
→ resolver observaciones
→ validar académicamente
```

### Aprobación y publicación

```text
Aprobar
→ congelar versión
→ guardar snapshot
→ firmar
→ generar PDF
→ calcular hash
→ publicar
→ actualizar cobertura
```

### Documentos derivados

```text
PEA publicado
→ habilitar syllabus
→ habilitar guías APE
→ habilitar guía de estudio
→ heredar resultados, unidades, horas y bibliografía
```

### Seguimiento

```text
Registrar incidencias de aplicación
→ evaluar cumplimiento
→ proponer cambios
→ crear nueva versión
→ conservar historial
```

## Qué debe estar completo para la tesis

El corte académico defendible sería:

```text
Normativa registrada
✓

Modelo educativo registrado y versionado
✓

Proyecto de carrera y perfil relacionados
✓

Integración con SIGAFI
✓

Expediente curricular
✓

PEA completo
✓

Workflow y aprobación del PEA
✓

Publicación y cobertura
✓

Syllabus y guías preparados e identificados
✓

Editores completos de syllabus y guías
Fuera de la evaluación principal
```

Esto permite afirmar que el sistema abarca toda la cadena y que la tesis desarrolla completamente un tramo representativo: el PEA.

## Cambio necesario respecto del plan anterior

La siguiente prioridad no debe ser ampliar directamente `doc_pea`. Primero debemos crear el núcleo institucional compartido:

1. `doc_expedientes_curriculares`.
2. Catálogo genérico de tipos documentales.
3. Normativa e instrumentos institucionales versionados.
4. Proyectos de carrera.
5. Perfiles de egreso.
6. Resultados del perfil.
7. Relación asignatura–resultado.
8. Workflow curricular configurable.
9. Observaciones y aprobaciones genéricas.
10. Versionado y publicación común.

Después conectamos `doc_pea` con ese núcleo.

Lo que ya implementé —resolución de contexto académico y snapshot desde una asignación— sigue siendo correcto. Sin embargo, el snapshot debe terminar perteneciendo principalmente al expediente curricular, para que PEA, syllabus y guías compartan la misma referencia institucional.

## Límite real del proyecto

DOSIER abarcará completamente la gobernanza documental curricular, pero no reemplazará:

- Matrículas.
- Calificaciones.
- Horarios.
- Contratación.
- Contabilidad.
- Gestión de conducción.
- Administración operativa de carreras y mallas.

La definición final sería:

> DOSIER es una plataforma de gobernanza curricular y gestión documental académica que integra la normativa, los instrumentos institucionales, los proyectos de carrera, los perfiles de egreso y la planificación académica proveniente de SIGAFI con el ciclo de elaboración, revisión, aprobación, publicación, aplicación y mejora de los documentos microcurriculares. La tesis implementará y evaluará integralmente este ciclo para el PEA, dejando el núcleo preparado para los demás documentos.

Ese es el alcance coherente con lo que buscas.
































exacto, eso mismo quiero, fijate que lo bueno es que consumimos muchos datos ya de la base de datos institucional de la que trabajo en la misma institucion y que en las tablas docs ya hay cosas que nos sirven para la actualidad del sistema que tenemos porque ya abarca comunicacion en tiempo real, versionamiento y demas, asi que mira bien lo que tenemos en el sistema y lo que quiero hacer y prepara un plan

















Preparé el plan maestro en [plan_integracion_curricular_institucional.md](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/docs/tesis/plan_integracion_curricular_institucional.md).

La decisión central es:

- No crear un tercer sistema documental.
- Reutilizar plantillas, instancias, snapshots, Yjs/SignalR, comentarios, firmas, auditoría, notificaciones y RBAC existentes.
- Incorporar el dominio faltante: instrumentos curriculares superiores, expedientes, series/revisiones, workflow curricular, responsables y validaciones.
- Mantener SIGAFI estrictamente como fuente institucional de solo lectura.
- Completar el PEA de extremo a extremo para la tesis.
- Dejar Sílabo, Guía APE y Guía de Estudio incorporados desde el inicio en la arquitectura y completarlos en fases posteriores del mismo producto.

El primer incremento recomendado es construir la columna vertebral:

1. Instrumentos curriculares versionados.
2. Expediente curricular y agrupación de asignaciones/paralelos.
3. Series y revisiones documentales.
4. Workflow PEA configurable.
5. Responsables y permisos académicos.
6. Integración transaccional con `CrearDesdeAsignacionAsync`.
7. Pruebas de integración antes de construir el editor.

También quedaron documentadas brechas importantes: estados arbitrarios, CoWork orientado actualmente a investigación, ausencia de plantillas curriculares, versionamiento todavía nominal, colecciones que se reemplazan al guardar y el hash provisional del finalizador genérico.

La inspección de la base fue únicamente de lectura; no modifiqué datos ni esquema en esta revisión. Las skills de DOSIER influyeron en la propuesta para conservar el patrón plantilla–instancia, `CoWorkField`, snapshots inmutables y la separación estricta respecto de SIGAFI.



















haber quiero que me expliques en pocas palabras que queremos hacer


















Queremos convertir DOSIER en el sistema que controle todo el proceso curricular del instituto:

1. Tomar de SIGAFI los datos oficiales: carreras, mallas, asignaturas, períodos, horas y docentes.
2. Registrar en DOSIER los documentos superiores que SIGAFI no maneja: normativas, modelo educativo, perfiles de egreso y lineamientos.
3. Crear un expediente curricular por asignatura y período.
4. Dentro de ese expediente gestionar PEA, Sílabo, Guías APE y Guía de Estudio.
5. Reutilizar lo que DOSIER ya tiene: edición en tiempo real, versiones, comentarios, revisión, firmas, PDF, auditoría y trazabilidad.
6. Para la tesis, completar y demostrar todo el recorrido usando el PEA.
7. Dejar la misma arquitectura preparada para incorporar completamente los otros tres documentos sin rehacer el sistema.

En resumen: **SIGAFI aporta los datos oficiales y DOSIER administra, valida, aprueba y conserva toda la documentación curricular.**

















y eso registra ya desde lo que nos dan los organos externos superiores pero no podemos modificarlo sino que tomamos lo que nos dan para organizarlo nosotros segun lo que ofrecemos?











Exactamente. El flujo comenzaría desde arriba:

**Organismos externos** —CES, CACES, SENESCYT y demás— emiten normativas, modelos, estándares o disposiciones. En DOSIER:

- Se registran como fuentes externas oficiales.
- Se guarda el documento original, emisor, fecha, versión, vigencia y resolución.
- No se altera su contenido.
- Si cambia una norma, se registra una nueva versión conservando la anterior.

Luego el instituto interpreta esas disposiciones y las aplica según su oferta académica:

**Normativa externa → políticas institucionales → carreras y perfiles de egreso → mallas y asignaturas → PEA → Sílabo y Guías.**

Así podemos demostrar:

- Qué requisito externo originó una decisión institucional.
- A qué carreras, mallas o asignaturas se aplica.
- Qué versión estaba vigente cuando se aprobó un PEA.
- Quién organizó, revisó y aprobó esa adaptación.
- Qué documentos deben revisarse cuando cambia una norma.

En resumen: **no modificamos lo emitido por los organismos superiores; lo registramos, versionamos y trazamos. El instituto crea sus propios instrumentos para cumplirlo de acuerdo con las carreras que ofrece.**













pero eso tenemos en el sistema para poder guiarnos al elaborar nuestros documentos oficiales'



















Sí, esa es precisamente la idea: **DOSIER tendrá la normativa superior disponible como referencia durante la elaboración de los documentos institucionales**.

Cuando el instituto prepare su modelo educativo, perfil de egreso, lineamientos o PEA, el sistema podrá:

- Mostrar las normas y requisitos vigentes aplicables.
- Indicar qué apartados debe cumplir cada documento.
- Proporcionar orientaciones y listas de verificación.
- Vincular cada sección del documento con el requisito que la respalda.
- Advertir cuando falte atender alguna disposición.
- Detectar si una norma cambió y señalar qué documentos podrían necesitar revisión.

DOSIER no redactará ni reinterpretará automáticamente la norma como si fuera una decisión oficial. **La autoridad institucional seguirá siendo responsable de analizarla y aprobar su aplicación.**

El flujo sería:

`Documento externo oficial → requisitos registrados → guía para elaborar el documento institucional → revisión y aprobación → PEA y demás documentos derivados`

Por ejemplo, al elaborar un PEA, DOSIER mostraría:

- Los lineamientos externos aplicables.
- El modelo educativo del instituto.
- El proyecto y perfil de egreso de la carrera.
- La malla y las horas oficiales tomadas de SIGAFI.
- Los campos obligatorios del formato institucional.
- Una validación que indique qué requisitos están cumplidos, pendientes o no aplican.

Así, la normativa no quedaría únicamente archivada: **se convertiría en una guía trazable y verificable para producir los documentos oficiales del instituto.**
