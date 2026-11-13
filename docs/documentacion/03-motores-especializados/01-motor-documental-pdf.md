# Motor de Generación Documental PDF e Integridad Forense

## 1. Visión General del Motor

El motor documental de DOSIER (`DocumentEngine`) es el subsistema de infraestructura encargado de transformar estructuras de datos curriculares y plantillas HTML en documentos PDF de validez legal e institucional.

El motor estandariza la producción de los entregables oficiales del Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET):
1. **Programa de Estudio de la Asignatura (PEA):** Formato institucional reglamentario en sus 11 secciones (a - k), con desglose por unidades, temas, aporte al perfil de egreso, prácticas, evaluación y firmas.
2. **Plan Analítico o Sílabo (19 Semanas):** Matriz semanal articulada por unidades, estrategias y evaluaciones.
3. **Guía de Prácticas de Aprendizaje Práctico-Experimental (Guías APE):** Planificación micro-curricular de talleres y laboratorios.
4. **Guía de Estudio Institucional:** Compendio teórico estructurado para el autoaprendizaje.

---

## 2. Pipeline de Compilación Documental

La generación de un documento PDF sigue una secuencia de 5 etapas coordinadas por `DocumentEngine`:

```mermaid
graph TD
    Req[Petición DocumentRequest] --> DataOrchestrator[DocumentDataOrchestrator]
    DataOrchestrator -->|Ensambla DTO Curricular| TemplateRegistry[DocumentTemplateRegistry]
    TemplateRegistry -->|Obtiene HTML + JSON Schema| TemplateEngine[Handlebars / Scriban Engine]
    TemplateEngine -->|HTML Evaluado| LegalInjector[LegalComplianceInjector]
    LegalInjector -->|HTML + Encabezados ISTPET + Pie LOPDP + QR| PDFRenderer[ITextHtmlPdfRenderer / iText 9]
    PDFRenderer -->|PDF Renderizado| AuditRepo[DocumentAuditRepository]
    AuditRepo --> OutputPDF[PDF Oficial + Sello DFRM + Hash SHA-256]
```

### 2.1. Preparación de Datos (`DocumentDataOrchestrator`)
Recopila los metadatos requeridos para la plantilla mediante el patrón Strategy (`IDocumentDataProvider`). Obtiene los datos oficiales de la asignatura, carrera, horas y créditos desde SIGAFI en modo solo lectura (`AsNoTracking`) y los combina con las secciones co-redactadas en el módulo CoWork (`doc_cowork_documentos`).

### 2.2. Evaluación de Plantillas (`HandlebarsTemplateEngine` / `Scriban`)
Sustituye variables, procesa bucles de iteración (unidades temáticas, temas, actividades prácticas, bibliografía, matriz de evaluación) y evalúa expresiones condicionales en el marcado HTML de la plantilla seleccionada (`doc_document_templates`). Incorpora un pipeline de normalización y sanitización editorial:
1. **Normalización Canónica de Colecciones (`NormalizePeaCollections`):** Proyecta dinámicamente cada entidad en PascalCase, camelCase y snake_case, garantizando que ninguna tabla o bloque evaluativo dependa de filas estáticas o claves asimétricas entre el frontend y el motor de reportes.
2. **Generación Editorial de Contenidos (`GenerateContenidosHtml`):** Transforma el texto plano o enriquecido de los contenidos en una tabla HTML optimizada para impresión (fuente de 8pt, padding de 3px), resaltando automáticamente las líneas que definen temas (`Tema X`, `Unidad X`) con fondo sutil `#f8fafc` y peso en negrita.
3. **Reconstrucción de Títulos Truncados (`CompleteTruncatedUnitTitle`):** Detecta títulos de unidades incompletos que terminan en preposiciones cortadas en tablas de origen (ej. *"FUNDAMENTOS DE"*, *"ARQUITECTURA DE"*, *"INTRODUCCIÓN A"*) y los completa de forma inteligente a partir del primer concepto identificado en la lista de temas.
4. **Sanitización de Títulos Redundantes (`SanitizePeaFieldHeadings`):** Limpia mediante expresiones regulares encabezados repetidos al inicio de campos de texto enriquecido (ej. *"RECURSOS DIDÁCTICOS"*, *"ESTRATEGIAS METODOLÓGICAS"*, *"OBJETIVO DE LA ASIGNATURA"* o *"BIBLIOGRAFÍA"*), eliminando párrafos vacíos `<p></p>` para evitar duplicidad visual con las barras de título oficiales.

### 2.3. Inyección de Cumplimiento Institucional (`LegalComplianceInjector`)
Añade al HTML evaluado los elementos normativos requeridos por el ISTPET:
* Encabezado oficial con logotipos y membrete institucional reglamentario.
* Código de trazabilidad institucional único (ej. `DFRM-PEA-2026-0042`).
* Marcadores de posición para las firmas de responsabilidad docente, coordinación de carrera, coordinación académica y vicerrectorado (Sección k).
* Código QR dinámico vectorial generado por `QRCoder` con URL pública de verificación de autenticidad.
* Pie de página con cláusula de protección de datos personales LOPDP.

### 2.4. Renderizado Vectorial a PDF (`ITextHtmlPdfRenderer`)
Convierte el marcado HTML5 y estilos CSS con soporte tipográfico a un documento en formato PDF plano de alta fidelidad utilizando **iText 9** (`iText.Html2pdf` y `iText.Kernel`).

### 2.5. Ensamblado, Estampado Dinámico de Firmas y Registro Forense
1. **Estampado Acumulativo de Firmas en Caliente:** Al solicitar el renderizado del documento oficial (`isDraft == false`) en `DocumentsController` o `DocumentInstancesController`, el sistema consulta en `IDosierSignatureService` las firmas válidas registradas para el documento (`SignatureState.Valid`). Si existen firmas emitidas, invoca sucesivamente a `SignatureStamper.StampSignatureBlock` para incrustar los sellos vectoriales con sus códigos DFRM, nombres y URLs de verificación antes de devolver los bytes al usuario.
2. **Nomenclatura Institucional y Metadatos del Visor PDF:** Mediante la columna `filename_pattern` en `doc_document_templates`, las autoridades (`DOSIER_ADMIN`, `DOSIER_COORD_ACAD`, `DOSIER_VICERRECTOR`) configuran el patrón de salida sin tocar código. El motor resuelve dinámicamente los tokens (`{code}`, `{carrera}`, `{asignatura}`, `{periodo}`, `{docente}`, `{fecha}`, `{version}`) inyectando el título oficial en el diccionario de metadatos de iText (`pdfDocument.GetDocumentInfo().SetTitle(...)`) y en la cabecera HTTP `Content-Disposition: inline; filename="..."`. Esto asegura que el visor de PDF de Chrome/Edge y las descargas conserven siempre la nomenclatura oficial en lugar de identificadores hash temporales.
3. **Registro Forense y Sellado:** Calcula el Hash **SHA-256** sobre el archivo compilado y el contenido pedagógico, registrando la transacción en `doc_document_audit` y `doc_pea_trazabilidad`.

---

## 3. Estructura del Congelamiento Forense (`data_snapshot_json`)

En el momento en que un PEA o documento curricular es aprobado por Vicerrectorado Académico, `DocumentEngine` genera una captura inmutable del estado exacto de los datos (`data_snapshot_json`) que se almacena en la tabla `doc_document_instances`:

```json
{
  "instance_uuid": "3a9f1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "template_code": "PEA_OFICIAL",
  "traceability_code": "DFRM-PEA-2026-0142",
  "data_snapshot": {
    "asignatura": "PROGRAMACION ORIENTADA A OBJETOS",
    "codigo_asignatura": "SOF-401",
    "carrera": "TECNOLOGIA SUPERIOR EN DESARROLLO DE SOFTWARE",
    "periodo": "ABR2026 - AGO2026",
    "horas_totales": 160,
    "horas_docencia": 64,
    "horas_ape": 32,
    "horas_autonomo": 64,
    "creditos": 3.33,
    "firmantes": [
      { "rol": "Docente Elaborador", "nombre": "Ing. Carlos Mendoza", "fecha": "2026-09-02T10:15:00Z" },
      { "rol": "Coordinador de Carrera", "nombre": "Ing. Diana Paredes", "fecha": "2026-09-04T14:30:00Z" },
      { "rol": "Coordinador Academico", "nombre": "MSc. Franklin Calderon", "fecha": "2026-09-06T11:00:00Z" },
      { "rol": "Vicerrector Academico", "nombre": "MSc. Geovanny Naranjo", "fecha": "2026-09-08T16:45:00Z" }
    ],
    "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "issued_at_utc": "2026-09-08T16:45:00Z"
  }
}
```

Este snapshot asegura que variaciones posteriores en la base de datos (reestructuraciones de mallas, cambios de distributivo docente o actualizaciones de software) no alteren la información contenida en el documento oficial ya legalizado.

---

## 4. Verificación Pública mediante Código QR

Cada documento generado incluye un código QR que apunta a un endpoint público de validación:

$$\text{URL de Validación} = \texttt{https://dosier.istpet.edu.ec/public/verify/}\text{traceability\_code}$$

### Proceso de Verificación
1. El auditor del CACES o interesado escanea el código QR del documento impreso o digital.
2. El cliente web consulta el endpoint público de verificación en `DocumentInstancesController` o `DocumentsController`.
3. El servidor contrasta el código de trazabilidad con el hash criptográfico SHA-256 almacenado en el snapshot inmutable.
4. Se presenta en pantalla la ficha de autenticidad institucional con el estado del documento, fecha de aprobación y autoridades firmantes sin requerir inicio de sesión ni credenciales en el sistema.

---

## 5. Inmutabilidad y Ciclo de Vida: Patrón Molde vs Instancia

Para garantizar que las actualizaciones en las plantillas maestras (`doc_document_templates`) no alteren ni corrompan los documentos de los docentes en producción, el sistema implementa una separación estricta:

```mermaid
graph LR
    subgraph Administracion
        T[Plantilla Maestra / doc_document_templates] -->|Versionado Admin| TVersion[Version N]
    end
    subgraph Documentos en Produccion
        TVersion -->|Clonacion Inicial| Instance[Instancia / doc_documentos_instancias]
        Instance --> Snapshot[template_config_snapshot_json]
        Docente[Docente Redactando] -->|Escribe| CoWorkData[Datos Yjs / CoWorkField]
    end
```

### Reglas de Negocio y Seguridad
1. **Molde Maestro (`doc_document_templates`):** Plantilla base versionada administrada por la institución.
2. **Snapshot Inmutable (`template_config_snapshot_json`):** Al iniciarse la planificación de una asignatura, `DocumentInstanceService` clona la versión de la plantilla y guarda el snapshot exacto de los bloques en ese momento.
3. **Protección Histórica (`Estado != Borrador`):** Los documentos revisados, aprobados o legalizados leen **exclusivamente su Snapshot**, conservando el formato visual con el que fueron oficializados.
4. **Desacoplamiento de Contenido:** Los textos de redacción colaborativa se indexan por clave de campo (`field_key`), desacoplados de la presentación visual.

---

## 6. Previsualización en Caliente y Renderizado Oficial de Plantillas

Para permitir la inspección en tiempo real sin alterar la base de datos ni los documentos en curso, el subsistema expone dos endpoints especializados en `DocumentTemplatesController`:

### 6.1. Endpoint de Renderizado Oficial
* **Ruta:** `GET /api/admin/templates/{code}/render-pdf`
* **Parámetros de Consulta:**
  * `isDraft` (booleano): Indica si se inyecta marca de agua de borrador institucional.
  * `download` (booleano): Devuelve el archivo con cabecera `Content-Disposition: attachment` para descarga directa, o `inline` para renderizado en el visor embebido.
* **Propósito:** Genera el PDF con los datos institucionales oficiales de muestra del ISTPET (asignatura de software, 160h, docentes y autoridades firmantes).

### 6.2. Endpoint de Previsualización en Caliente
* **Ruta:** `POST /api/admin/templates/{code}/render-pdf`
* **Cuerpo de la Solicitud (`RenderTemplatePreviewRequest`):**
  * `htmlContent`: Marcado HTML con los bloques del lienzo actualmente en edición.
  * `customCss`: Estilos CSS personalizados de la plantilla.
  * `themeConfigJson`: Configuración visual del tema fusionado (colores institucionales, márgenes A4, tipografía).
* **Propósito:** Renderiza un PDF en vivo a partir de las modificaciones no publicadas del diseñador visual. Permite al administrador validar visualmente la maqueta antes de comprometer una nueva versión de fábrica.

---

## 7. Paginación Inteligente y Prevención de Huérfanos (Anti-Orphan Pagination)

Para evitar que encabezados o subtítulos de sección se impriman aislados al final de una página (separados de su contenido en la página siguiente), el motor documental inyecta directivas de paginación CSS a nivel de renderizado e impone encapsulación en sub-bloques:

1. **Directivas Globales en `DocumentEngine`:**
   * `.header-primary, .header-sub, .pea-subhead, th`: Configurados con `page-break-after: avoid !important; break-after: avoid !important;`. El motor prohíbe cortes de página inmediatos tras cualquier encabezado o barra de título.
   * `.sub-block, .keep-together`: Configurados con `page-break-inside: avoid !important; break-inside: avoid !important;`. Todo sub-bloque (ej. Estrategias Metodológicas o Recursos Didácticos) se traslada íntegramente a la página siguiente si no cabe completo en la actual.
   * Tablas institucionales: `thead` configurado con `display: table-header-group` y filas `tr` con `page-break-inside: avoid !important;`.
2. **Sanitización de Títulos Redundantes:**
   * En `HandlebarsTemplateEngine`, `PeaAiAssistantService` y `PeaDocumentExtractorService`, el sistema analiza mediante expresiones regulares los campos de texto enriquecido (`recursos_didacticos`, `metodologia_ensenanza`, `objetivo_asignatura`, `bibliografia_basica`). Si el contenido inicia con el nombre de la sección repetido (ej. *"RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE"*), este se remueve automáticamente antes de la compilación de la plantilla, evitando duplicaciones visuales con la barra de cabecera.

---

## 8. Nomenclatura Institucional de Descarga y Streaming PDF

Para garantizar que los archivos PDF exportados por docentes y revisores mantengan la convención institucional y no identidades UUID internas, el motor opera bajo las siguientes directivas:

1. **Resolución de Nombres en Caliente (`DocumentEngine.ResolveFilename`):**
   * Resuelve dinámicamente el patrón configurado en la plantilla (ej. `{code}_{carrera}_{asignatura}_{periodo}.pdf`).
   * Deserializa los datos de `DataSnapshotJson` extrayendo tokens directos o anidados (`carrera`, `asignatura`, `periodo`, `docente`).
2. **Endpoints en `DocumentInstancesController`:**
   * `GET /api/documents/instances/{uuid}/pdf/{filename?}`: Devuelve el archivo en modo `inline` con cabecera `Content-Disposition` codificada en UTF-8 y ruta enriquecida para visores Chromium.
   * `GET /api/documents/instances/{uuid}/download`: Devuelve el archivo como adjunto binario forzado (`Content-Disposition: attachment`).
3. **CORS:** Política institucional configurada con `WithExposedHeaders("Content-Disposition")` para permitir lectura programática del nombre de archivo desde el cliente web.

---

## 9. Gobernanza de Fechas en la Sección 11 (Firmas de Responsabilidad)

Para cumplir con la normativa de auditoría curricular y la Ley 67 de Firmas Electrónicas, la matriz de firmas de responsabilidad institucional (Sección 11 / k) opera bajo un esquema de sincronización dinámica con confirmación:

1. **Resolución y Valor por Defecto:**
   * La fecha de elaboración (`DocenteFecha`) se inicializa automáticamente con la fecha actual del sistema en formato institucional `DD/MM/AAAA` (o la fecha de creación registrada en `doc_pea.fechaElaborado`), garantizando que la tabla oficial y los documentos exportados nunca presenten celdas de fecha vacías bajo el rol de elaboración.
2. **Desbloqueo Controlado con Confirmación:**
   * Al igual que los nombres de las autoridades, el campo de fecha permanece protegido contra ediciones accidentales.
   * El usuario puede modificar la fecha haciendo clic sobre el campo, lo que despliega un diálogo modal de confirmación informando que la modificación aplica de forma aislada a este instrumento curricular sin alterar los registros globales.
3. **Sincronización Bidireccional (CoWork Yjs y Motor de Plantillas):**
   * El valor modificado se propaga en tiempo real a través del proveedor Yjs (`Firmas_DocenteFecha`, `Firmas_CoordinadorFecha`, etc.) y se normaliza en el motor de plantillas (`HandlebarsTemplateEngine`) hacia las variables `FechaElaborado` y `fecha_elaborado`, permitiendo que el visor web, el diseñador de plantillas y la exportación oficial a PDF reflejen exactamente la misma fecha sin requerir nuevas tablas en la base de datos.



