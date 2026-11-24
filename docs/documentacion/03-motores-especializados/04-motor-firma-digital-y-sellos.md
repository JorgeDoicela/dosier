# Motor de Firma Digital, Criptografía y Sellos

## 1. Visión General del Subsistema de Firma

El motor de firma y sellado de DOSIER (`Signatures`) proporciona la infraestructura para validar la autoría, integridad y no-repudio legal sobre los instrumentos curriculares emitidos por el Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET), en estricta conformidad con la **Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos (Ley 67 de la República del Ecuador)**.

El subsistema integra:
1. Validación de certificados digitales en formato PKCS#12 (.p12 / FirmaEC) emitidos por entidades acreditadas (Banco Central del Ecuador, Security Data, ANF, UANATACA).
2. Firma digital institucional basada en HMAC-SHA256 con código único de trazabilidad DFRM.
3. Cálculo canónico de huellas digitales de integridad SHA-256 sobre el contenido pedagógico y los bytes compilados.
4. Estampado visual de sellos con código QR de verificación pública en documentos PDF mediante iText 9.
5. Protocolo de revocación forense de firmas ante reaperturas curriculares colegiadas.

---

## 2. Arquitectura de Firma y Patrón Fachada (Facade Pattern)

El motor implementa el patrón de diseño Facade a través de la clase `DosierSignatureService` (`backend/dosier_infrastructure/Signatures/DosierSignatureService.cs`), la cual implementa la interfaz de aplicación `IDosierSignatureService` y orquesta 5 subservicios altamente especializados:

```mermaid
flowchart TD
    Client["Controladores REST / Casos de Uso (PeaService, SignaturesController)"] --> Facade["DosierSignatureService (Fachada Principal)"]

    subgraph SubserviciosEspecializados["Subservicios Especializados (Signatures/Subservices)"]
        Facade --> S1["SignatureProfileSubservice\n(Gestión de Perfiles y Trazos Manuscritos)"]
        Facade --> S2["DosierInternalSignerSubservice\n(Firma Básica Institucional HMAC-SHA256)"]
        Facade --> S3["P12SignatureSubservice\n(Firma Avanzada PKCS#12 PAdES / BouncyCastle)"]
        Facade --> S4["SignatureVerificationSubservice\n(Verificación Criptográfica y Consultas Públicas)"]
        Facade --> S5["SignatureRevocationSubservice\n(Revocación Auditada ante Devolución Curricular)"]
    end

    subgraph ComponentesTransversales["Componentes Transversales de Apoyo"]
        S2 --> HashService["SignatureHashService\n(Cálculo SHA-256 Canónico)"]
        S3 --> HashService
        S2 --> Stamper["SignatureStamper\n(Estampado Visual iText 9)"]
        S3 --> Stamper
    end

    subgraph Persistencia["Persistencia Relacional"]
        S2 --> DB[("doc_documentos_firmas\ny doc_user_signature_profiles")]
        S3 --> DB
        S5 --> DB
    end
```

---

## 3. Modalidades de Firma Soportadas

### 3.1. Firma Electrónica Avanzada (PKCS#12 / .p12 / FirmaEC)
* **Contrato:** Ejecutada a través de `P12SignatureSubservice.SignDocumentWithP12Async`.
* **Procesamiento:** El usuario suministra los bytes de su certificado digital en formato binario (`.p12` o `.pfx`) y su contraseña secreta en memoria:
  1. `P12SignatureSubservice` utiliza **BouncyCastle** (`Org.BouncyCastle.Pkcs.Pkcs12Store`) para desencriptar el almacén de claves sin persistir la clave privada en disco.
  2. Valida la vigencia temporal del certificado (`NotBefore` $\le \text{UtcNow} \le$ `NotAfter`).
  3. Verifica la correspondencia de identidad entre el titular del certificado y el usuario autenticado en la sesión activa.
  4. Extrae la clave privada y la cadena de certificados X.509, calculando la firma digital PAdES sobre el documento.

### 3.2. Firma Digital Institucional DOSIER (HMAC-SHA256)
* **Contrato:** Ejecutada a través de `DosierInternalSignerSubservice.SignDocumentAsync`.
* **Procesamiento:** Diseñada para la validación interna y el avance del flujo colegiado ordinario:
  1. Valida la sesión activa y opcionalmente re-autentica las credenciales del docente contra el hash seguro en base de datos.
  2. Genera un token criptográfico HMAC-SHA256 utilizando la clave secreta del servidor (`DosierFirma:SigningSecret`).
  3. Genera un código de trazabilidad institucional único con formato `DFRM-{AÑO}-{UUID8}` (ej. `DFRM-2026-D9F7C872`).

---

## 4. Modalidades de Presentación del Estampado Visual (`SignatureStamper` e `InstitutionalStampGenerator`)

El motor de estampado gráfico sobre el archivo PDF utiliza **iText 9** (`backend/dosier_infrastructure/Signatures/SignatureStamper.cs`) junto al generador vectorial oficial `InstitutionalStampGenerator` (`backend/dosier_infrastructure/Signatures/InstitutionalStampGenerator.cs`) para posicionar el sello institucional en la matriz de firmas (Sección k). El usuario puede seleccionar y configurar su modalidad de presentación en `doc_user_signature_profiles.tipo_sello`:

```mermaid
flowchart TD
    subgraph ModosDeEstampado["Modalidades de Estampado Curricular (tipo_sello)"]
        M1["1. Firma y Sello Oficial (sello_y_firma / sello_institucional)\n- Doble aro concéntrico en azul institucional (#0A3264)\n- Leyendas vectoriales en arco: TECNOLÓGICO TRAVERSARI / ISTPET\n- Banda central departamental resuelta por rol institucional\n- Superposición centrada de la rúbrica personal limpia"]
        M2["2. Solo Firma Personal (solo_firma)\n- Trazo manuscrito personal limpio (PNG con canal alfa)\n- O sello físico de caucho escaneado individualmente (preset 1:1)\n- Sin artefactos gráficos externos en el casillero"]
        M3["3. Solo Sello Oficial Departamental (solo_sello)\n- Únicamente el sello circular oficial vectorial del ISTPET\n- Sin rúbrica personal superpuesta en el centro\n- Máxima nitidez para avales institucionales de despacho"]
        M4["4. Sello Criptográfico Digital (completo)\n- Cabecera azul corporativa (#0A3264) con metadatos\n- Trazo manuscrito + datos de auditoría UTC\n- Código QR de verificación pública con enlace directo"]
    end
```

### 4.1. Firma y Sello Oficial (`sello_y_firma` / `sello_institucional` - Recomendado)
* **Arquitectura Vectorial Pura:** Generado directamente como un `PdfFormXObject` en iText 9 con transformaciones de matriz trigonométrica (`cos`, `sin`) para texto curvado en arco. No depende de bibliotecas externas ni rasterizado de imágenes intermedias, garantizando máxima nitidez vectorial en cualquier nivel de zoom o impresión física.
* **Componentes Gráficos del Sello:**
  1. **Doble Anillo Concéntrico de Alto Impacto:** Círculo exterior con trazo grueso de 2.4pt (4.6px en SVG) y círculo interior de 1.3pt (2.2px en SVG) en azul marino institucional (`#0A3264`, RGB 10, 50, 100), emulando la presión y densidad de entintado de los sellos físicos de caucho institucional.
  2. **Texto Superior en Arco:** Leyenda *"TECNOLÓGICO TRAVERSARI"* trazada en semicírculo superior con tipografía bold de peso 900 y espaciado calibrado para abarcar con autoridad el cuadrante superior.
  3. **Texto Inferior en Arco:** Leyenda *"ISTPET"* trazada en semicírculo inferior con tipografía bold destacada (peso 900, espaciado expandido a 3px).
  4. **Banda Central Horizontal Reforzada:** Delimitada por dos líneas paralelas horizontales de 1.6pt (2.8px en SVG) que intersecan el círculo interior. Resuelve dinámicamente el nombre de la unidad o carrera con tipografía bold sólida según el rol institucional del firmante:
     - **Vicerrectorado:** *"VICERRECTORADO"* (peso 900, tamaño prominente).
     - **Coordinación Académica:** *"COORDINACIÓN ACADÉMICA"* con subtítulo *"CARRERAS PRESENCIALES"*.
     - **Coordinación de Carrera:** Nombre oficial de la carrera (ej. *"DESARROLLO DE SOFTWARE"*) con ajuste de ancho y peso contundente.
     - **Docencia:** Departamento oficial o *"DOCENCIA SUPERIOR"*.
  5. **Superposición de Rúbrica Personal:** La firma manuscrita transparente del docente o autoridad se superpone centrada en el eje del sello, emulando con exactitud física los sellos de caucho estampados con tinta y firmados en documentos oficiales.

### 4.2. Solo Firma Personal (`solo_firma`)
* **Presentación Limpia:** Estampa exclusivamente el trazo manuscrito digitalizado del firmante o el sello físico de caucho escaneado por el docente (usando la proporción cuadrada 1:1).
* **Preservación Estética:** No imprime recuadros, cabeceras azules ni códigos QR visibles en la celda del documento, emulando la firma documental tradicional.
* **Plena Validez Legal:** La validez jurídica, el hash SHA-256 del PDF y el registro criptográfico permanecen inalterables en `doc_documentos_firmas` con el metadato `"tipo_sello": "solo_firma"`.

### 4.3. Solo Sello Oficial Departamental (`solo_sello`)
* **Presentación Institucional Pura:** Estampa exclusivamente el sello circular vectorial oficial con el doble aro concéntrico y las leyendas departamentales, sin incluir rúbrica personal superpuesta.
* **Uso Operativo:** Diseñado para despachos institucionales, secretaría o sellado departamental formal donde se requiere el aval de la unidad sin depender del trazo manuscrito.

### 4.4. Sello Criptográfico Completo (`completo`)
* **Cabecera:** Franja superior azul oscuro (`#0A3264`) con texto blanco centrado *"FIRMA INSTITUCIONAL DOSIER"*.
* **Cuerpo de 3 Columnas:**
  - **Columna 1:** Imagen del trazo manuscrito digitalizado del docente o monograma formal generado.
  - **Columna 2:** Metadatos institucionales: nombre completo, cargo formal, cédula institucional, marca de tiempo UTC y código DFRM en azul técnico (`#0070f3`).
  - **Columna 3:** Código QR de alta resolución con etiqueta inferior *"VERIFICAR"* generado dinámicamente con `QRCoder`.
* **Pie Normativo:** Leyenda institucional *"Certificado Digital DOSIER · CACES / LOPDP"*.

### 4.5. Matriz de Resolución Automática de Textos y Sellos por Rol Institucional

El motor resuelve de manera desacoplada y determinista las leyendas del sello circular y las columnas de la matriz curricular para cada actor del ISTPET:

| Rol Curricular Oficial | Variaciones Soportadas | Columna PEA | Leyenda Central (Banda del Sello) | Subtítulo Central |
| :--- | :--- | :---: | :--- | :--- |
| **Vicerrectorado Académico** | `VICERRECTOR`, `Vicerector`, `Vicerrectorado`, `DOSIER_VICERRECTOR`, `Aprobado` | **Columna 4** | `VICERRECTORADO` | *Ninguno* |
| **Coordinación Académica** | `COORD_ACADEMICO`, `Coordinador Académico`, `Academia`, `DOSIER_COORD_ACAD`, `RevisadoAcad` | **Columna 3** | `COORDINACIÓN ACADÉMICA` | `CARRERAS PRESENCIALES` |
| **Coordinador de Carrera** | `COORD_CARRERA`, `Coordinador de Carrera`, `RevisadoCoord`, `DOSIER_COORD_CARRERA` | **Columna 2** | Nombre Oficial de la Carrera (ej. `DESARROLLO DE SOFTWARE`) | *Ninguno* (o línea 2 si es largo) |
| **Docente Elaborador** | `DOSIER_DOCENTE`, `Docente Titular`, `Profesor`, `Elaborador`, `Autor` | **Columna 1** | Carrera del Docente o `DOCENCIA SUPERIOR` | *Ninguno* |

* **Catálogo de 13 Carreras Soportadas para Sellos Departamentales:**
  1. *Desarrollo de Software* $\rightarrow$ `DESARROLLO DE SOFTWARE`
  2. *Redes y Telecomunicaciones* $\rightarrow$ `REDES Y` / `TELECOMUNICACIONES`
  3. *Mecánica Automotriz* $\rightarrow$ `MECÁNICA AUTOMOTRIZ`
  4. *Gastronomía* $\rightarrow$ `GASTRONOMÍA`
  5. *Diseño Gráfico* $\rightarrow$ `DISEÑO GRÁFICO`
  6. *Contabilidad y Asesoría Tributaria* $\rightarrow$ `CONTABILIDAD Y` / `ASESORÍA TRIBUTARIA`
  7. *Administración de Talento Humano* $\rightarrow$ `ADMINISTRACIÓN DE` / `TALENTO HUMANO`
  8. *Marketing Digital y Comercio Electrónico* $\rightarrow$ `MARKETING DIGITAL Y` / `COMERCIO ELECTRÓNICO`
  9. *Educación Inicial* $\rightarrow$ `EDUCACIÓN INICIAL`
  10. *Educación Básica* $\rightarrow$ `EDUCACIÓN BÁSICA`
  11. *Educación Inclusiva* $\rightarrow$ `EDUCACIÓN INCLUSIVA`
  12. *Entrenamiento Deportivo* $\rightarrow$ `ENTRENAMIENTO` / `DEPORTIVO`
  13. *Electrónica* $\rightarrow$ `ELECTRÓNICA`

### 4.6. Resolución Contextual de Roles: Coordinadores y Directivos con Carga Docente

En la gestión académica institucional, los Coordinadores de Carrera, Coordinadores Académicos o Vicerrectores frecuentemente imparten cátedras curriculares asignadas en el distributivo oficial SIGAFI.

* **Fase de Elaboración (`Borrador`, `Observado`, `Corregido`):**
  - Todo usuario que posea la titularidad asignada de la materia actúa legítimamente como **Docente Elaborador** (Columna 1 del PEA: *Elaborado por*).
  - Tanto el frontend (`useBuilderPdfAndSign.ts`) como el backend (`PeaService.cs`) resuelven de forma contextual que la firma en estas fases corresponde a la elaboración de la cátedra, permitiendo que la autoridad firme su propio PEA sin ser bloqueada por validaciones exclusivas de revisión curricular.
  - La emisión de esta firma avanza el PEA al estado `EnRevision`.
* **Fase de Revisión Curricular (`EnRevision`):**
  - Para emitir el aval de carrera (Columna 2: *Revisado por Coordinador de Carrera*), el usuario firma en calidad de autoridad curricular (`DOSIER_COORD_CARRERA`), transitando el documento al estado `RevisadoCoord`.

---

## 5. Geometría Adaptativa en Matriz Curricular (Sección k)

En el PEA institucional, la Sección k requiere un diseño de 4 firmas simultáneas en una única tabla horizontal. `SignatureStamper` detecta las columnas mediante `DocumentSignatureLayoutLocator` y adapta dinámicamente la geometría del sello según la relación de aspecto (`aspectRatio`) de la imagen del firmante:

| Columna | Responsabilidad Normativa | Actor Institucional | Dimensiones Firma Horizontal (`ratio >= 1.8`) | Dimensiones Sello Circular/Cuadrado (`0.70 <= ratio <= 1.45`) |
| :---: | :--- | :--- | :---: | :---: |
| **Columna 1** | **Elaborado por:** | Docente Titular de la Asignatura | `94.0 pt` $\times$ `48.0 pt` | `88.0 pt` $\times$ `68.0 pt` |
| **Columna 2** | **Revisado por (Carrera):** | Coordinador de Carrera | `94.0 pt` $\times$ `48.0 pt` | `88.0 pt` $\times$ `68.0 pt` |
| **Columna 3** | **Revisado por (Académica):** | Coordinación Académica General | `94.0 pt` $\times$ `48.0 pt` | `88.0 pt` $\times$ `68.0 pt` |
| **Columna 4** | **Aprobado por:** | Vicerrectorado Académico | `94.0 pt` $\times$ `48.0 pt` | `88.0 pt` $\times$ `68.0 pt` |

* **Detección Automática de Sello de Caucho:** Si el firmante carga una imagen con relación de aspecto cuadrada o circular (típico en sellos de caucho departamentales escaneados o recortados con el preset `1:1`), el motor amplía la altura a `68.0 pt`, aprovechando los `95 px` (~`71 pt`) de la celda de la matriz PEA y centrando verticalmente el sello sin invadir el casillero de nombres o fechas.
* Para documentos bicolumnares (ej. Proyectos de Investigación Formativa), emplea el bloque horizontal estándar de `190.0 pt` $\times$ `55.0 pt`.

---

## 6. Estampado Acumulativo y Autosanación de Archivos

Para evitar la degradación de calidad o la sobreescritura de sellos en documentos con múltiples firmas en momentos distintos:

1. **Invalidación de Caché:** Cada firma sucesiva borra la ruta del archivo pre-renderizado previo mediante `docInstancia.SetFinalPdfPath(null)`.
2. **Reconstrucción Determinista:** El servicio `DocumentInstanceService.ValidateStorageIntegrityAsync` regenera el PDF base a partir del snapshot inmutable de datos (`data_snapshot_json`) y re-estampa en caliente todas las firmas válidas vigentes registradas en `doc_documentos_firmas`.
3. **Integridad Gráfica:** Este procedimiento garantiza que la adición de una firma posterior no corrompa los sellos gráficos previamente insertados por otras autoridades.

---

## 7. Protocolo de Revocación Forense de Firmas

Cuando un instrumento microcurricular es devuelto a estado `Observado`, `SignatureRevocationSubservice.RevokeAsync` ejecuta la revocación formal:

* **Marcado Inmutable:** El registro en `doc_documentos_firmas` cambia a `EsValida = false`.
* **Metadatos de Revocación:** Registra la marca de tiempo UTC de la revocación, el usuario responsable y el motivo normativo (`"Reapertura para subsanación de observaciones curriculares"`).
* **Identificación Visual:** En el visor web y bloque de firmas, se visualiza como `Firma Revocada (Por Subsanar)`, impidiendo falsos estados de aprobación previa.

---

## 8. Estructura de Persistencia en Base de Datos (`doc_documentos_firmas`)

```sql
CREATE TABLE doc_documentos_firmas (
    id_firma INT AUTO_INCREMENT PRIMARY KEY,
    id_documento_instancia INT NOT NULL,
    id_usuario INT NOT NULL,
    rol_firmante VARCHAR(50) NOT NULL,        -- DOSIER_DOCENTE, DOSIER_COORD_CARRERA, etc.
    tipo_firma VARCHAR(30) NOT NULL,          -- P12_PADES_ECUADOR, HMAC_SHA256_INSTITUCIONAL
    hash_documento VARCHAR(64) NOT NULL,      -- Hash SHA-256 del contenido curricular firmado
    codigo_dfrm VARCHAR(50) NOT NULL,         -- Código de trazabilidad impreso
    fecha_firma DATETIME NOT NULL,            -- Marca temporal UTC inmutable
    es_valida TINYINT(1) DEFAULT 1 NOT NULL,  -- Flag de vigencia (0 = revocada)
    fecha_revocacion DATETIME NULL,
    motivo_revocacion TEXT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255) NULL,
    FOREIGN KEY (id_documento_instancia) REFERENCES doc_documentos_instancias(id_documento_instancia)
);
```

---

## 9. Verificación Pública Criptográfica sin Sesión

Cualquier evaluador externo o auditor del CACES puede verificar la legitimidad de un documento escaneando el código QR o accediendo a la URL pública:

$$\texttt{https://dosier.istpet.edu.ec/documentos/verificar/}\text{codigo\_dfrm}$$

El servicio `SignatureVerificationSubservice.VerifyAsync` consulta el código DFRM, valida que la firma no haya sido revocada (`EsValida == true`), contrasta el hash SHA-256 del PDF y devuelve la ficha con los datos del firmante, cargo oficial y marca temporal sin requerir inicio de sesión ni credenciales institucionales.
