# DOSIER - Sistema Integral de Portafolio Docente y Acreditación Curricular

**DOSIER** es una plataforma de software diseñada para la formulación, co-redacción en tiempo real, validación matemática de horas y acreditación oficial de portafolios docentes en el **Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET)**. El sistema integra el macro-currículo institucional con la base de datos `sigafi_es`, garantizando el cumplimiento estricto del marco normativo **CACES 2026**, el Reglamento de Régimen Académico (RRA) del CES y la firma digital PKCS#12 (.p12) / FirmaEC.

---

## 1. Documentos Oficiales Soportados

La plataforma estandariza la producción de los cuatro (4) entregables curriculares obligatorios por cátedra:

1. **PEA (Programa de Estudio de la Asignatura):**
   * Caracterización, objetivos, resultados de aprendizaje (RDA) y distribución matemática de horas (`Docencia`, `Práctico-Experimental / APE`, `Trabajo Autónomo`).
   * Validación automática contra la carga horaria y créditos de la malla curricular oficial en `sigafi_es`.

2. **Sílabo (Cronograma Semanal de 19 Semanas):**
   * Matriz semanal detallada con articulación de contenidos, estrategias didácticas y mecanismos de evaluación.
   * Fechas sincronizadas de **Parcial 1 (Semana 9)**, **Parcial 2 (Semana 18)** y **Examen de Recuperación (Semana 19)**.

3. **Guías de Trabajo Práctico-Experimental (APE):**
   * Micro-planificación de prácticas en laboratorios físicos e institucionales.
   * Rúbricas analíticas de evaluación cualitativa y cuantitativa.

4. **Guías de Estudio:**
   * Compendio teórico estructurado por unidades temáticas, lecturas obligatorias, glosarios y cuestionarios de autoevaluación.

---

## 2. Visión General de Arquitectura

La plataforma implementa un modelo desacoplado compuesto por un backend API RESTful en .NET 8.0 y un cliente web de página única (SPA) en React 18:

* **Backend API (`dosier_api`):** ASP.NET Core 8.0 estructurado bajo Clean Architecture (`dosier_domain`, `dosier_application`, `dosier_infrastructure`, `dosier_api`).
* **Frontend Web (`dosier_web`):** React 18 SPA compilado con Vite, TypeScript, Tailwind CSS v4 y el sistema de diseño Vercel Geist.
* **Base de Datos Institucional (`sigafi_es`):** MySQL 8.0+ / MariaDB en el puerto local `3306`, mapeado de solo lectura para mallas y docentes vía Pomelo Entity Framework Core 9.0.

---

## 3. Componentes y Motores Especializados

1. **Motor Documental PDF (`DocumentEngine`):** Renderizado de plantillas HTML (`Handlebars.Net` / `Scriban`), membretes oficiales y generación vectorial con **iText 9**.
2. **Resiliencia Forense e Inmutabilidad:** Congelamiento de datos en punto de emisión (`data_snapshot_json`), hash criptográfico **SHA-256** y códigos QR para verificación pública descentralizada.
3. **Co-Redacción en Tiempo Real (CoWork):** Sincronización multi-docente concurrente basada en **CRDT (Yjs)** sobre **SignalR WebSockets** con persistencia incremental y bloqueo de secciones.
4. **Firma Electrónica Oficial:** Sellado criptográfico PKCS#12 (`.p12`) / FirmaEC con estampado visual de rúbrica y sellos de tiempo UTC.
5. **Auditoría y Acreditación CACES:** Monitoreo en vivo de indicadores de cumplimiento documental por carrera y período académico.

---

## 4. Estructura del Repositorio

```text
dosier/
├── backend/                     # Solución .NET 8.0 (dosier.slnx)
│   ├── dosier_api/              # Controladores REST, Middlewares y Swagger
│   ├── dosier_application/      # Casos de Uso, DTOs de Mallas y Portafolios
│   ├── dosier_domain/           # Entidades curriculares y Contratos de Dominio
│   ├── dosier_infrastructure/   # EF Core 9, Pomelo MySQL, Motores PDF, CoWork y Firmas
│   └── dosier_tests/            # Pruebas unitarias e integración
├── dosier_web/                  # Cliente Web React 18 + Vite + TypeScript (Geist Design)
│   ├── public/                  # Assets, logos vectoriales y webp
│   └── src/                     # Páginas, Landing, Editor Colaborativo y Componentes
├── docs/
│   ├── documentacion/           # Documentación técnica y arquitectónica completa
│   └── tesis/
│       ├── analisis_y_planificacion/
│       │   └── codex.md         # Diagnóstico SIGAFI, arquitectura y delimitación de tesis
│       └── formatos_oficiales/   # Formatos institucionales (PEA y Sílabo de 19 semanas)
└── scripts/
    ├── base_datos/              # Scripts SQL de inicialización y sincronización
    └── despliegue/              # Scripts de automatización y despliegue local
```

---

## 5. Documentación de Tesis y Formatos Oficiales

Toda la fundamentación académica y especificación de formatos oficiales se encuentra organizada en `docs/tesis/`:
* [CODEX: Diagnóstico SIGAFI, Arquitectura y Delimitación de Tesis](docs/tesis/analisis_y_planificacion/codex.md)
* [Formato Oficial: Programa de Estudio de la Asignatura (PEA)](docs/tesis/formatos_oficiales/Programa%20de%20Estudio%20de%20la%20Asignatura%20%28PEA%29.md)
* [Formato Oficial de Referencia: Plan Analítico / Sílabo (19 Semanas)](docs/tesis/formatos_oficiales/Plan_analitico_o_silabo.md)

---

## 6. Configuración y Ejecución Local

### Puertos de Desarrollo:
* **Frontend Web:** `http://localhost:3010/`
* **Backend API:** `http://localhost:5247/` (Swagger en `/swagger`)
* **Base de Datos MySQL (`sigafi_es`):** `127.0.0.1:3306`

### Pasos de Inicio:

1. **Backend:**
   ```powershell
   cd backend/dosier_api
   dotnet run
   ```

2. **Frontend:**
   ```powershell
   cd dosier_web
   npm install
   npm run dev
   ```

---

DOSIER Architecture | Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET) | Quito, Ecuador
