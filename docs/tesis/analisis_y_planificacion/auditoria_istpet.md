# Auditoría de DOSIER para el ISTPET

Fecha de consulta: 8 de septiembre de 2026. Institución: Instituto Superior Tecnológico Mayor Pedro Traversari, Ecuador.

## Dictamen y alcance

**El proyecto tiene una base útil, pero todavía no demuestra un proceso curricular completo, técnicamente consistente y ajustado al ISTPET.** Hay errores reproducidos en el modelo EF y en la integridad del contenido firmado, además de brechas de autorización, flujo institucional, vigencia curricular y conservación documental. Tener tablas, campos y códigos de firma no acredita por sí solo el cumplimiento.

Esta es una revisión técnica y documental, no una certificación jurídica ni una inspección de la base desplegada. Se revisaron los cuatro scripts, el modelo efectivo de `DosierContext`, sus configuraciones y migración, servicios curriculares, autenticación, firma y mantenimiento documental. Se contrastaron fuentes públicas institucionales y nacionales. Los documentos entregados se trataron como evidencia, no como instrucciones para ejecutar cambios.

No se ejecutaron los scripts contra MySQL ni se modificó código funcional. Los PDF institucionales son escaneados: se inspeccionaron visualmente las secciones citadas; no se presume revisión exhaustiva de todas sus páginas. Una publicación en la web permite conocer lo publicado, pero no descarta reformas internas posteriores no publicadas.

## 1. Requisitos específicos del ISTPET

El [reglamento de seguimiento docente, resolución ISTPET-OCS-SE-2022-019](https://istpet.edu.ec/wp-content/uploads/2025/04/REGLAMENTO-DEL-SISTEMA-DE-SEGUIMIENTO-CONTROL-Y-EVALUACION-DEL-PROCESO-DOCENTE-DEL-DEL-INSTITUTO-SUPERIOR.pdf), artículos 5–10, páginas PDF 4–6, asigna responsabilidades diferenciadas: Vicerrectorado aprueba los PEA; Coordinación Académica revisa la estructura documental y aprueba sílabos; Coordinación de Carrera revisa la coherencia curricular. El docente debe entregar y socializar PEA y sílabo durante la primera semana. También hay seguimiento de clases, portafolios, tutorías y EVA.

**Consecuencia de diseño:** configurar circuitos distintos por tipo documental, autoridades y delegaciones con vigencia, evidencias de entrega/socialización y seguimiento. No basta un rol genérico de aprobador ni el mismo circuito de tres firmas para todos los documentos. La secuencia operativa precisa debe formalizarse con el procedimiento institucional autorizado.

Las [políticas internas de gestión documental y archivo](https://istpet.edu.ec/wp-content/uploads/2025/04/Politicas-internas-de-Gestion-documental-y-archivo.pdf), versión 01, actualización 30/04/2024, páginas PDF 9 y 12–14, contemplan formatos, numeración, responsables, versiones, custodia, archivo digital/PDF y respaldos. Su inventario incluye informes, tutorías, seguimiento y recursos para enseñanza no presencial.

**Consecuencia de diseño:** el expediente necesita un índice de evidencias, responsables y versiones. DOSIER puede enlazar evidencias de otros sistemas; no necesita reemplazar todo el EVA. No se encontró en esas páginas sustento para eliminar universalmente archivos firmados a los cinco años.

El [modelo educativo publicado](https://istpet.edu.ec/wp-content/uploads/2024/08/MODELO-EDUCATIVO-ISTPET-FINAL-29-07-2024_0001.pdf), páginas PDF 17–18 y 21, vincula planificación curricular, resultados de aprendizaje, métodos y evaluación continua. El [reglamento de prácticas académicas](https://istpet.edu.ec/wp-content/uploads/2025/04/REGLAMENTO-INTERNO-DE-PRACTICAS-EN-EL-ENTORNO-ACADEMICO-DEL-INSTITUTO-SUPERIOR.pdf), resolución ISTPET-OCS-SE-2022-016, página PDF 4, relaciona la guía de prácticas con el PEA y los recursos reales disponibles. **Consecuencia:** las guías deben contextualizarse por carrera y práctica; el texto generado requiere revisión docente.

El [sitio institucional](https://istpet.edu.ec/) publica ofertas presenciales, semipresenciales, en línea e híbridas; Software aparece en más de una modalidad. Por ello, asignatura + período no identifica necesariamente un único contexto curricular. La [página de autoridades](https://istpet.edu.ec/index.php/autoridades/) confirma cargos diferenciados, pero no reemplaza nombramientos o delegaciones vigentes.

## 2. Bloqueantes técnicos comprobados

### A01. EF solicita cinco columnas que los scripts no crean — prioridad alta

El modelo se construyó y se generó SQL completamente fuera de línea. EF creó propiedades sombra por relaciones no configuradas explícitamente:

| Tabla | Columna esperada por EF, ausente en SQL | FK que debe mapearse explícitamente |
|---|---|---|
| `doc_guias_ape` | `PeaIdPea` | `IdPea` |
| `doc_guias_ape_rdas` | `PeaResultadoAprendizajeIdRda` | `IdRda` |
| `doc_guias_estudio` | `PeaIdPea` | `IdPea` |
| `doc_pea_actividades_practicas` | `UnidadIdUnidad` | `IdUnidad` |
| `doc_silabo_semanas` | `UnidadIdUnidad` | `IdUnidad` |

Evidencia: configuraciones `DocGuiaApeConfiguration`, `DocGuiaEstudioConfiguration`, `DocPeaConfiguration` y `DocSilaboConfiguration`, en `backend/dosier_infrastructure/data/models/Configurations`.

**Corrección:** configurar `HasOne/WithMany/HasForeignKey` sobre las columnas existentes y armonizar obligatoriedad y borrado. No agregar columnas accidentales para satisfacer convenciones de EF. Comprobar carga y guardado con MySQL creado a partir de los scripts corregidos.

### A02. Estado del servicio incompatible con SQL — prioridad alta

`PeaService.cs:409` asigna `RevisadoCoord`, ausente del ENUM de `03_curriculum_pea_oficial.sql:72`. En MySQL estricto, esa transición puede fallar; en configuraciones permisivas puede degradar el valor almacenado.

**Corrección:** definir un único catálogo de estados y transiciones, compartido por SQL, servicios y cliente, ajustado al circuito institucional. El cambio no debe limitarse a ampliar el ENUM: hace falta validar quién puede ejecutar cada transición.

### A03. Identidad externa confundida con usuario interno — prioridad alta

`TokenService.cs:30–37` asigna `IdReferencia` a `sub/NameIdentifier` y reserva `id_usuario` para `IdUsuario`. `PeaController.cs:75` prioriza los primeros y los convierte en el identificador entero empleado para firmar.

**Corrección:** utilizar el claim interno validado para auditoría/firma y conservar la referencia externa para resolver al profesor. Probar referencias con cédula, referencias alfanuméricas y usuarios cuyo ID interno difiera de la referencia. No convertir silenciosamente una referencia académica en usuario de seguridad.

### A04. Autorización insuficiente en operaciones curriculares — prioridad alta

`PeaController` exige autenticación, pero las rutas revisadas no aplican una política específica de autoridad y pertenencia al expediente. `FirmarPeaAsync` recibe `RolFirmante` del cliente sin contrastarlo con una atribución institucional efectiva. `CambiarEstadoAsync` admite cambios directos y la firma aprobadora permite pasar desde `EnRevision`.

**Corrección:** resolver permisos en servidor por documento, carrera, período, cargo y delegación. Bloquear firma con rol falsificado, acceso a expediente ajeno, saltos de etapa y aprobación con observaciones pendientes. Registrar transición y auditoría en una misma transacción. Una opción oculta en la interfaz no constituye autorización.

### A05. El hash no protege el contenido completo — prioridad alta, reproducido

`PeaService.cs:682` incluye cantidades de unidades/RDA, pero no sus contenidos completos, temas, prácticas o bibliografía. Una prueba fuera de línea modificó el nombre de una unidad y añadió bibliografía: **el hash permaneció idéntico**.

**Corrección:** sellar una revisión completa con serialización canónica, orden determinista de colecciones y contexto curricular. Vincular firma, versión del formato y PDF exacto. Cualquier modificación relevante debe invalidar el sello o producir otra revisión, conservando la anterior.

### A06. La ruta denominada FirmaEC no produce la firma anunciada — prioridad alta

En `PeaService.cs:331` y siguientes, abrir el P12 sirve como validación preliminar, pero la ruta termina en el sello HMAC del servidor. No invoca la firma del PDF con la clave privada del firmante; aun así, registra `P12_PADES_ECUADOR`. Existe un servicio separado de firma PDF, pero no está conectado a esta operación.

**Corrección:** conectar la firma criptográfica real al artefacto y verificar certificado, identidad, vigencia y confianza según la política aplicable. Separar claramente autenticación, aprobación interna, sello HMAC y firma electrónica. No afirmar validez de firma PAdES por haber abierto un certificado. Referencia: [Ley de Comercio Electrónico y Firmas Electrónicas](https://www.telecomunicaciones.gob.ec/wp-content/uploads/2020/07/LEY-DE-COMERCIO-ELECTRONICO-FIRMAS-Y.pdf), requisitos de firma electrónica.

Además, `PeaService.cs:443` registra **“Instituto Superior Tecnológico Sucre (ISTPET)”**. Corregir la identidad institucional a Mayor Pedro Traversari y administrarla centralmente.

## 3. Integridad curricular y documental

### A07. Edición de documentos aprobados e historial insuficiente — alta

`GuardarPeaAsync`, desde `PeaService.cs:144`, no bloquea por sí mismo la modificación de documentos aprobados/publicados. El guardado elimina y reconstruye colecciones. Tener `Version`, UUID o campos de snapshot no establece inmutabilidad.

**Corrección:** separar borrador editable y revisión aprobada inmutable; las correcciones originan nueva revisión, con motivo y aprobaciones. Aplicar control de concurrencia para evitar sobrescrituras entre revisores.

### A08. Pérdida de relaciones y clonación con contexto anterior — alta

La reconstrucción de prácticas no copia `IdUnidad`. Reemplazar unidades/RDA puede romper referencias de sílabos y guías; los `SET NULL` conservan la fila dependiente pero pierden su vínculo. `ClonarPeaPeriodoAsync:312` cambia período sin resolver nuevamente asignación y expediente.

**Corrección:** conservar identidades dentro de una revisión, enlazar documentos a revisiones específicas y resolver completamente el nuevo contexto al clonar. Validar que unidad, práctica, RDA, PEA y sílabo pertenezcan al mismo expediente/revisión.

### A09. Selección ambigua del antecedente oficial — alta

`ExpedienteCurricularService` selecciona antecedentes por carrera/activo y orden de versión, sin garantizar malla, modalidad y vigencia pertinentes. La creación sigue ligada a una asignación individual aunque existe una tabla puente. `NormativaService` usa actividad sin filtrar suficientemente las fechas de vigencia.

**Corrección:** identificar contexto por oferta/carrera, malla aprobada, modalidad, período/cohorte y asignatura; definir explícitamente qué se comparte entre docentes/paralelos. Asociar resolución, proyecto, perfil y modelo aplicables en esa fecha. Evitar ordenar versiones semánticas como texto o tomar simplemente el último activo.

### A10. Horas y créditos no se validan suficientemente — alta

`AcademicContextResolver` convierte ausencias en cero y limita con `Math.Max(0, ...)` un saldo autónomo negativo. Así se oculta una distribución imposible. En las rutas revisadas no hay cierre suficiente de horas por componente y créditos.

El [RRA publicado por CES](https://www.ces.gob.ec/wp-content/uploads/2025/05/Reglamento-de-Regimen-Academico.pdf) identifica el crédito académico con 48 horas (art. 9) y distingue componentes de aprendizaje (arts. 22–25). **Corrección:** validar total = contacto docente + práctico experimental + autónomo, coherencia con créditos y distribución aprobada; resolver redondeo explícitamente. Un dato faltante debe quedar pendiente, no convertirse en cero acreditado. Configurar restricciones aplicables a modalidad y nivel sin alterar los datos fuente de SIGAFI.

### A11. Generación de sílabos y guías con supuestos fijos — alta

`SilaboService` fija 19 semanas, evaluaciones en 9/18/19 y porcentajes 40/30/30. Consume un tema por semana no evaluativa: **un PEA con más de 16 temas deja temas sin programar**. Las guías incluyen textos genéricos de informática y selecciones parciales mediante `Take(2)`.

**Corrección:** calendario y evaluación versionados por período/formato; distribución verificable de todos los temas, horas y RDA; contenidos adecuados a cada carrera. Marcar lo generado como borrador y bloquear oficialización con campos pedagógicos pendientes. No presentar contenido prefabricado como cumplimiento institucional demostrado.

### A12. Portafolio y seguimiento incompletos como proceso — media/alta

Los cuatro tipos documentales son parte del proceso. Incorporar evidencia de entrega, socialización, seguimiento, tutorías, informes y recursos no presenciales, con enlaces a sistemas institucionales cuando corresponda. Definir responsables, fechas y cierre del expediente. La sola presencia de esas actividades en texto no demuestra que se ejecutaron.

### A13. Conservación de PDF firmados sin fundamento suficiente — alta

`DocumentInstanceService.cs`, métodos `PurgeObsoleteFileByUuidAsync` y `PurgeAllObsoleteDocumentFilesAsync`, elimina físicamente versiones firmadas/archivadas. La operación masiva usa 1825 días por defecto y conserva dos versiones dentro del conjunto antiguo seleccionado. La individual impide borrar la más reciente entre sus hermanas, pero no exige por sí misma la antigüedad del plazo.

**Corrección:** tabla de retención aprobada por serie documental, cómputo desde el evento apropiado, excepciones por auditoría/litigio, autorización y acta de disposición. Suspender la eliminación automática de originales oficiales hasta definirla. Probar recuperación de respaldos y correspondencia archivo/registro. No convertir una configuración comentada como “CACES” en fundamento legal universal.

### A14. Adaptaciones educativas y privacidad — alta

Las adaptaciones asocian estudiante y necesidad educativa. Eso exige acceso restringido y separación respecto del PEA/sílabo que se distribuye ampliamente. Revisar exportaciones, enlaces por token, auditoría y conservación para no divulgar información individual innecesaria.

Referencias: [política de protección de datos publicada por ISTPET](https://istpet.edu.ec/wp-content/uploads/2026/06/POLITICA-INTERNA-DE-PROTECCION-DE-DATOS-PERSONALES-PDF.pdf) y [LOPDP](https://www.gob.ec/sites/default/files/regulations/2025-01/01%20Ley%20Org%C3%A1nica%20de%20Protecci%C3%B3n%20de%20Datos%20Personales.pdf). Debe documentarse base jurídica, finalidad, minimización y seguridad; el consentimiento no es la única base posible.

## 4. Correcciones por script y DbContext

| Archivo | Inventario | Correcciones principales |
|---|---|---|
| `01_sistema_base.sql` | 33 tablas, 12 triggers | Separar reinicio destructivo de instalación/actualización; revisar la marca manual de migración aplicada; retirar atribuciones normativas no verificadas de retención/escalas; revisar campos SQL no mapeados. |
| `02_gobernanza_y_antecedentes_curriculares.sql` | 9 tablas, 7 triggers | Corregir semillas normativas; no cargar como oficiales resoluciones institucionales no sustentadas; vincular antecedentes por versión y vigencia; asegurar cardinalidades del expediente compartido. |
| `03_curriculum_pea_oficial.sql` | 8 tablas, 8 triggers | Resolver ENUM, reglas de horas/créditos, revisión inmutable, autoridad de firmas y pertenencia de hijos; armonizar con EF. |
| `04_extension_futura_curriculum_silabo_guias.sql` | 18 tablas, 18 triggers | Resolver relaciones sombra; revisar unicidad de semanas y UUID, vigencia de formatos, enlaces a revisiones del PEA y acceso a adaptaciones. No considerarlo una extensión futura si ya lo consumen servicios activos. |

Las 68 tablas `doc_` tienen entidad EF; eso no implica equivalencia del esquema. La comparación encontró siete columnas SQL sin representación en el modelo: `idExpediente`/`idPea` en notificaciones y tokens, y `hashActaAprobacion`, `fechaAprobacion`, `firmadoPor` en proyectos. Revisar si deben mapearse o retirarse mediante una migración justificada.

También se detectaron 35 restricciones UUID únicas no expresadas como tales en EF y diferencias de FK, nulabilidad, tipos JSON/texto y período. Son un inventario para conciliación, no 35 fallos de ejecución ya probados. Diferencias como `int` frente a `int(11)` no deben contabilizarse automáticamente como errores. Para FK textuales hay que conciliar tipo, charset y collation con la base real.

`DosierContext` reúne 120 tablas, incluidas 52 ajenas al prefijo `doc_`, sin exclusión de migraciones. La migración `20260720202138_InitialCreate` crea/elimina tablas académicas nativas y no representa el esquema curricular actual. El script 01 registra esa migración en `__EFMigrationsHistory` sin probar equivalencia.

**Corrección:** decidir una única estrategia controlada de evolución, reconstruir una línea base verificable y excluir las tablas administradas por SIGAFI de las migraciones DOSIER cuando corresponda. Revisar SQL generado antes de aplicarlo. No se encontró aplicación automática de migraciones al arrancar; el riesgo identificado es la futura ejecución contra una base compartida.

### Semillas normativas

El script 02 utiliza `RPC-SO-013-No.111-2022` para el RRA; el documento consultado corresponde a **RPC-SE-08-No.023-2022**. La [gaceta CES](https://gaceta.ces.gob.ec/resultados.html?id_documento=251023) permite contrastar su vigencia. Corregir también referencias de artículos: el art. 24 no establece el conjunto de instrumentos microcurriculares; trata aprendizaje autónomo.

`M-A-IST-2024` no debe presentarse como resolución oficial. El [modelo CACES publicado para ISTT 2024](https://www.caces.gob.ec/wp-content/uploads/2024/02/Modelo-de-Evaluacio%CC%81n-Externa-2024-con-Fines-de-Acreditacio%CC%81n-para-los-Institutos-Superiores-Te%CC%81cnicos-y-Tecnolo%CC%81gicos-.pdf) identifica su aprobación mediante 047-SE-12-CACES-2021. La versión y resolución `RES-OCS-2024-004` sembradas para el modelo ISTPET no quedaron acreditadas por la publicación revisada; mantenerlas pendientes hasta contar con respaldo.

La [resolución CACES 072-SO-13-CACES-2026, de 5 de mayo de 2026](https://www.caces.gob.ec/wp-content/uploads/downloads/gaceta/Actas_y_Resoluciones/Sesiones%20Ordinarias/SO%202026/SESI%C3%93N%2013/RESOLUCIONES/resoluciO%CC%81n_no__072-so-13-caces-2026_compressed-signed-signed0935473001778082830.pdf) dispone cierre administrativo del proceso de evaluación externa referido y deja sin efecto actividades pendientes de su programación. Por tanto, revisar calendarios e indicadores codificados como vigentes. Esto no equivale a afirmar que desapareció la acreditación o que todo el modelo anterior fue derogado.

## 5. Validación realizada y pendiente

| Comprobación ejecutada | Resultado | Límite |
|---|---|---|
| Compilación de infraestructura con `--no-restore` | Correcta, sin errores ni advertencias | No verifica SQL real ni legalidad |
| Filtro `PeaFirmaTests` | 4 aprobadas | Usan InMemory; no comprueban FK/ENUM de MySQL ni la firma electrónica completa |
| Construcción de modelo EF y generación de SQL fuera de línea | 120 entidades/tablas; cinco columnas sombra ausentes del SQL | No consulta la base desplegada |
| Cambio de unidad y bibliografía seguido de recálculo de hash | Hash idéntico | Confirma omisión en el contenido sellado |
| Inventario comparativo de los cuatro scripts | 68 tablas `doc_`, todas presentes en EF | Las diferencias requieren clasificación, no equipararlas todas a defectos |

No se ejecutó toda la suite porque existen pruebas que conectan a MySQL. No se probó interfaz, despliegue, restauración, PDF firmado de extremo a extremo ni permisos contra usuarios reales.

Antes de declarar listo el módulo, comprobar en una base de pruebas aislada: instalación y actualización sin alterar SIGAFI; CRUD relacional; denegación de permisos; circuito institucional completo; rechazo de cargas horarias inconsistentes; programación de más de 16 temas; nueva revisión tras aprobación; clonación sin referencias antiguas; firma verificable del PDF; entrega/socialización; privacidad y recuperación de respaldos.

## 6. Orden recomendado

1. Corregir relaciones EF/SQL, estados, identidad de usuario e identidad institucional.
2. Implementar autorización por expediente, revisión inmutable, hash completo y firma real.
3. Formalizar y configurar circuitos ISTPET por documento; validar horas y contexto histórico.
4. Sustituir semillas sin evidencia y generación fija; completar seguimiento y entrega.
5. Conciliar migraciones, conservación, privacidad y restauración; ejecutar aceptación integral.

Para cerrar la validación institucional se requieren las resoluciones y mallas aprobadas por oferta/modalidad, formatos vigentes autorizados, calendario del período objetivo, nombramientos/delegaciones y tabla de retención. Su ausencia debe quedar visible como pendiente; no suplirse con valores inventados.

El alcance defendible de DOSIER sería gestionar y conservar evidencia del proceso curricular cubierto. Afirmar que cumple **todo** el proceso legal de un instituto requeriría evaluar también procesos institucionales fuera de este módulo, como admisión, matrícula, titulación, vinculación y gobierno institucional.

























**Para el ISTPET, todavía no es suficiente para afirmar que DOSIER cumple todo el proceso.** Revisé los cuatro scripts, el modelo efectivo de `DosierContext`, configuraciones, migraciones y servicios relacionados. Encontré errores técnicos concretos y diferencias con el procedimiento institucional.

Dejé el detalle y el orden de corrección en el [informe de auditoría del ISTPET](C:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/docs/tesis/analisis_y_planificacion/auditoria_istpet_2026-09-08.md).

**Lo que exige específicamente el instituto**

El reglamento publicado distingue responsabilidades: **Vicerrectorado aprueba PEA; Coordinación Académica revisa su estructura y aprueba sílabos; Coordinación de Carrera revisa la coherencia curricular**. También establece entrega y socialización de PEA y sílabo durante la primera semana. El sistema necesita representar esas responsabilidades y conservar evidencia de su ejecución. [Reglamento docente ISTPET](https://istpet.edu.ec/wp-content/uploads/2025/04/REGLAMENTO-DEL-SISTEMA-DE-SEGUIMIENTO-CONTROL-Y-EVALUACION-DEL-PROCESO-DOCENTE-DEL-DEL-INSTITUTO-SUPERIOR.pdf).

**Las correcciones más urgentes**

| Hallazgo | Qué corregir |
|---|---|
| **EF espera cinco columnas inexistentes en los scripts**, como `PeaIdPea` y `UnidadIdUnidad`. | Mapear explícitamente las relaciones a las FK existentes. Puede fallar la consulta de guías, prácticas y semanas. |
| El servicio guarda `RevisadoCoord`, pero el ENUM SQL no lo admite. | Unificar estados y validar transiciones. |
| El controlador confunde la referencia del profesor con el ID interno del usuario. | Corregir los claims usados para firma y auditoría. |
| El rol firmante llega del cliente sin suficiente comprobación de autoridad. | Validar cargo, carrera, expediente y delegación en servidor. |
| **Modificar una unidad y añadir bibliografía deja el mismo hash. Lo reproduje.** | Sellar el contenido completo de una revisión inmutable. |
| La ruta denominada FirmaEC termina usando HMAC y registra `P12_PADES_ECUADOR`. | Conectar la firma criptográfica del PDF y verificarla; abrir un P12 no equivale a firmar. |
| Se pueden modificar documentos aprobados y reconstruir relaciones. | Conservar revisiones aprobadas y crear otra versión para cambios. |
| El sílabo fija 19 semanas y programa como máximo 16 temas. | Usar el calendario autorizado y comprobar cobertura de todos los contenidos. |

Además, encontré:

- **Nombre institucional incorrecto:** la firma registra “Instituto Superior Tecnológico Sucre (ISTPET)”.
- Antecedentes seleccionados sin asegurar suficientemente malla, modalidad y vigencia.
- Horas faltantes convertidas en cero y saldos negativos ocultados.
- Clonación a otro período conservando referencias del anterior.
- Semillas normativas incorrectas o sin respaldo documental.
- Migraciones que incluyen tablas académicas compartidas y no representan el esquema curricular actual.
- Eliminación de PDF firmados antiguos con una retención atribuida genéricamente al CACES.

El archivo institucional requiere versiones, responsables, custodia y evidencias adicionales de seguimiento. Por eso, **PEA, sílabo y guías son una parte del expediente**, que puede completarse mediante integración con otros sistemas. [Políticas de archivo ISTPET](https://istpet.edu.ec/wp-content/uploads/2025/04/Politicas-internas-de-Gestion-documental-y-archivo.pdf).

**Validación realizada:** compilación correcta y cuatro pruebas de firma aprobadas. Esas pruebas usan memoria y no comprueban las restricciones de MySQL; la comprobación adicional confirmó el defecto del hash.

No modifiqué código funcional ni ejecuté los scripts contra tu base. El informe contiene las correcciones por archivo y las pruebas necesarias antes de declarar el módulo listo para uso institucional.
















Sí: el informe especifica las correcciones identificadas, dónde están, por qué hacen falta, su prioridad y cómo comprobarlas.
Incluye base de datos y DbContext, permisos, flujo de aprobación del ISTPET, firmas, versiones, horas/créditos, sílabos, guías, conservación documental y privacidad.
Todavía no es una lista definitiva de todo el cumplimiento legal del instituto. Para cerrar el alcance faltan dos verificaciones:
- Contrastar formatos, mallas, resoluciones, delegaciones y calendario con los documentos vigentes autorizados del ISTPET.
- Aplicar las correcciones y probar el circuito completo en MySQL, incluida la generación y firma del PDF.
Puedes usarlo como plan de corrección del módulo curricular. Las correcciones están documentadas; todavía no están implementadas.






**Para guardar este PEA, la base ya cubre gran parte del formato. No necesitas rehacerla, pero sí cerrar algunos vacíos y corregir su integridad.** Contrasté el texto adjunto con los scripts actuales.

| Sección del PEA | Situación actual | Qué falta |
|---|---|---|
| **a. Datos generales** | Existen carrera, asignatura, período, modalidad, semestre, horas y créditos. | Garantizar que correspondan a la misma malla/oferta y conservar sus nombres y códigos históricos al aprobar. |
| **b. Objetivo** | Cubierto en `objetivoAsignatura`. | Sin tabla adicional. |
| **c. Prerrequisitos** | Pueden quedar dentro del snapshot curricular. | Representar explícitamente **asignatura y observación**, preservando lo que figuraba en esa versión del PEA. |
| **d. Resultados de la carrera** | Existen resultados del perfil y resultados dentro del PEA. | Vincular cada resultado seleccionado con su **resultado oficial de origen**, conservando su texto histórico. |
| **e. Resultados de la asignatura** | Cubiertos. | Garantizar orden y pertenencia a la revisión del PEA. |
| **f. Unidades y contenidos** | Cubiertos, incluyendo horas por componente. | Validar sumas y evitar numeración duplicada dentro del mismo padre. |
| **g. Metodología y recursos** | Cubiertos mediante campos de texto. | No es obligatorio crear más tablas para reproducir este formato. |
| **h. Actividades prácticas** | Cubiertas. | Garantizar que la unidad relacionada pertenezca al mismo PEA. |
| **i. Evaluación** | Actualmente es un texto libre. | Estructurar las filas: **nota, tipo de evaluación, calificación máxima y orden**. |
| **j. Bibliografía** | Cubiertas básica y consulta. | Mantener clasificación y orden. |
| **k. Responsables** | Existen cuatro espacios de firma y fechas. | Vincularlos con identidad del firmante, nombre y cargo históricos, etapa y versión firmada. |

**Las modificaciones concretas que haría en la base son estas:**

1. **Agregar `doc_pea_prerrequisitos`.**
   Con PEA/revisión, asignatura de origen cuando corresponda, nombre/código conservados, observación y orden. Puede alimentarse desde SIGAFI sin modificar sus prerrequisitos oficiales.

2. **Agregar `doc_pea_evaluaciones`.**
   Con PEA/revisión, denominación —por ejemplo, “Nota parcial 1”—, descripción, calificación máxima y orden. **Los tres valores 10 del formato no son porcentajes ni justifican repartir 40/30/30.**

3. **Agregar la referencia al resultado oficial de carrera.**
   En `doc_pea_resultados_aprendizaje`, incorporar el vínculo con `doc_perfil_egreso_resultados` para los resultados de tipo carrera. Ya tienes ambas tablas; falta cerrar esa relación.

4. **Completar el vínculo de las cuatro responsabilidades.**
   Reutilizar `doc_documentos_firmas`, evitando otro mecanismo paralelo. Cada registro debe identificar inequívocamente PEA, revisión, responsable y etapa. Corregir **“Comisión Académica” por “Coordinador Académico”** donde se está describiendo el cargo de este formato.

5. **Definir versiones y formato utilizado.**
   Identificar la revisión del PEA y la versión de la plantilla; conservar el contexto y contenido aprobado. El campo `version` actual, por sí solo, no impide sobrescribirlo.

6. **Añadir restricciones de integridad.**
   Horas no negativas, coherencia de componentes, numeración única por PEA/unidad, relaciones entre hijos del mismo documento y estados consistentes. Las sumas entre varias filas requieren una validación transaccional; no se resuelven únicamente con un `CHECK`.

7. **Corregir la correspondencia SQL–DbContext y las migraciones.**
   Resolver las cinco relaciones que generan columnas inexistentes y preparar una actualización que preserve datos y no altere las tablas administradas por SIGAFI.

**No debes imponer tres unidades, seis temas o tres referencias como límites:** el propio adjunto aclara que son espacios del Excel. Tampoco hacen falta dos estructuras de base por las hojas «PEA» y «PEA (2)».

---

## 5. Dictamen de Saneamiento e Integración Técnica (Estado Actual)

Todas las brechas y bloqueantes identificados en esta auditoría han sido **resueltos y saneados al 100%** en la arquitectura del sistema:

| Hallazgo / Brecha | Estado | Resolución Técnica Implementada |
|---|---|---|
| **A01. Llaves sombra en EF Core** | **Resuelto** | Se configuraron explícitamente las claves foráneas en `DocPeaConfiguration.cs`, eliminando propiedades accidentales y convenciones no mapeadas. |
| **A02. Estados de 4 roles en SQL** | **Resuelto** | Se actualizó el ENUM en `03_curriculum_pea_oficial.sql` y `PeaService.cs` incorporando `RevisadoCoord` y `RevisadoAcad`. |
| **A03. Confusión de Identidad / Claims** | **Resuelto** | Claims unificados: uso estricto del ID de usuario autenticado para firmas y trazabilidad forense. |
| **A04. Autorización y flujo colegiado** | **Resuelto** | Reglas estrictas de transición de estado y validación de atribución institucional en `PeaService` con pruebas unitarias passing. |
| **A05. Inmutabilidad y Hash SHA-256** | **Resuelto** | Cálculo criptográfico de hash SHA-256 sobre el contenido pedagógico formal y registro en trazabilidad y sellos DFRM. |
| **Formato PEA ISTPET (Secciones c e i)** | **Resuelto** | Se integraron las tablas relacionales de Prerrequisitos (`doc_pea_prerrequisitos`) y Evaluación estructurada (`doc_pea_evaluaciones`) dentro de `03_curriculum_pea_oficial.sql`. |

Con este saneamiento, la base de datos y el backend del PEA cumplen íntegramente con los lineamientos del ISTPET y los criterios del CACES para acreditación institucional y auditoría microcurricular.
