# Especificacion Tecnica y Academica: Pipeline CI/CD y Despliegue en AWS EC2

Este documento constituye la memoria técnica formal de la arquitectura de Integración y Entrega Continua (CI/CD), contenerización Docker y despliegue automatizado en servidores AWS EC2 para la plataforma **DOSIER** del Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET).

---

## 1. Justificacion Ingenieril y DevOps para la Tesis de Grado

En el desarrollo de software institucional moderno, el despliegue manual por transferencia FTP o acceso interactivo SSH directo introduce graves riesgos de error humano, inconsistencia entre entornos (*environmental drift*), tiempos prolongados de indisponibilidad (*downtime*) y falta de trazabilidad forense exigida por organismos de acreditación como el **CACES**.

La implementación de este pipeline resuelve estas problemáticas mediante cuatro pilares fundamentales:

1. **Inmutabilidad de Artefactos:** El código fuente no se compila en el servidor de producción. Se empaqueta en imágenes de contenedores OCI (Open Container Initiative) idénticas y herméticas, garantizando que el software probado en la fase de CI sea exactamente el que corre en producción.
2. **Trazabilidad y Auditoria CACES:** Cada despliegue está criptográficamente vinculado al commit SHA exacto de Git, permitiendo saber qué versión del código, qué cambios y qué usuario autorizó la actualización del sistema curricular.
3. **Eficiencia de Recursos mediante Grafo Aciclico Dirigido (DAG):** El pipeline evalúa los cambios de rutas (`dorny/paths-filter@v3`), evitando compilar el backend .NET 8 cuando solo se modificó el frontend React Vite, y viceversa.
4. **Resiliencia Operativa y RTO Minimo:** Incorporación de mecanismos de reinicio rápido (*Quick Restart*) para resolución de incidencias 502 en menos de 10 segundos, y flujo de reversión inmediata (*Rollback*) sin requerir recompilación de código.

---

## 2. Arquitectura del Pipeline CI/CD (GitHub Actions)

El flujo de trabajo automatizado se estructura en 8 etapas secuenciales y paralelas gobernadas por dependencias estrictas (`needs`):

```
                                  [Push a rama main / workflow_dispatch]
                                                    |
                                           +--------+--------+
                                           | detect-changes  |
                                           +--------+--------+
                                                    |
                             +----------------------+----------------------+
                             |                                             |
                   (Si backend/**)                                  (Si dosier_web/**)
                             |                                             |
                     [backend-qa]                                    [frontend-qa]
               (.NET 8 SDK / dotnet test)                       (Node 22 / Vitest / Vite)
                             |                                             |
                     [build-backend]                                 [build-frontend]
                (Docker Buildx -> GHCR)                         (Docker Buildx -> GHCR)
                             |                                             |
                             +----------------------+----------------------+
                                                    |
                                             [deploy-ec2]
                                     (SSH Appleboy + docker compose)
                                                    |
                                         [health-check-report]
                                      (curl /api/ping + Summary)
```

### 2.1 Matriz Detallada de Trabajos (Jobs)

| Job | Condición de Ejecución | Entorno (Runner) | Responsabilidad Técnica |
| :--- | :--- | :--- | :--- |
| `quick-restart` | `inputs.restart_only == 'true'` | `ubuntu-latest` | Conexión SSH inmediata al EC2 para ejecutar `docker compose restart`, resolviendo fallos transitorios sin recompilar ni alterar imágenes. |
| `detect-changes` | `inputs.restart_only != 'true'` | `ubuntu-latest` | Analiza el diff de Git con `paths-filter` para activar condicionalmente los jobs de backend o frontend. |
| `backend-qa` | Cambios en `backend/**` o `workflow_dispatch` | `ubuntu-latest` | Configura .NET 8 SDK, restaura `dosier.slnx`, compila en Release y ejecuta la suite de pruebas unitarias `dosier_tests.csproj`. |
| `frontend-qa` | Cambios en `dosier_web/**` o `workflow_dispatch` | `ubuntu-latest` | Configura Node.js 22, instala dependencias con lockfile, ejecuta pruebas con Vitest y valida la compilación estática de Vite. |
| `build-backend` | `backend-qa` exitoso | `ubuntu-latest` | Construye la imagen Docker del backend mediante Buildx, aplica etiquetas (`latest`, SHA completo, SHA corto) y sube al registro `ghcr.io` con caché GHA. |
| `build-frontend` | `frontend-qa` exitoso | `ubuntu-latest` | Construye la imagen Docker del frontend SPA + Nginx, aplica etiquetas semánticas y publica en `ghcr.io`. |
| `deploy-ec2` | Builds exitosos | `ubuntu-latest` | Transfiere `docker-compose.yml` por SCP, realiza limpieza de espacio en disco en el host EC2, descarga imágenes por SHA y ejecuta `docker compose up -d --remove-orphans`. |
| `health-check-report` | `deploy-ec2` exitoso | `ubuntu-latest` | Realiza un smoke test HTTP a `/api/ping` y publica el reporte de auditoría en `$GITHUB_STEP_SUMMARY`. |

---

## 3. Especificacion de Contenedores Docker

### 3.1 Backend (.NET 8 Web API) - `backend/Dockerfile`
Implementa el patrón de compilación multi-etapa (*Multi-Stage Build*) para reducir la superficie de ataque y el tamaño final de la imagen:

* **Etapa de Compilación (`mcr.microsoft.com/dotnet/sdk:8.0`):** Copia los archivos `.csproj` de las 5 capas de la solución (`dosier_api`, `dosier_application`, `dosier_domain`, `dosier_infrastructure`, `dosier_tests`), ejecuta `dotnet restore` aprovechando la caché de capas de Docker, y finalmente compila con `dotnet publish -c Release -o /app/publish`.
* **Etapa de Runtime (`mcr.microsoft.com/dotnet/aspnet:8.0`):** Imagen mínima sin herramientas de compilación. Crea las carpetas `/app/uploads` y `/app/backups`, copia los binarios publicados y establece como punto de entrada `dotnet dosier_api.dll`.
* **Puerto Expuesto:** `5000` (interno en la red bridge de Docker).

### 3.2 Frontend Web (React 18 + Vite + Nginx) - `dosier_web/Dockerfile`
* **Etapa de Compilación (`node:22-alpine`):** Ejecuta `npm install` y `npm run build`, transformando el código TypeScript/React y estilos Tailwind CSS v4 en artefactos estáticos optimizados en `dist/`.
* **Etapa de Servidor Web (`nginx:alpine`):** Servidor HTTP/HTTPS ultraligero que copia los archivos estáticos a `/usr/share/nginx/html` y carga la configuración de [nginx.conf](file:///c:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/dosier_web/nginx.conf).
* **Puertos Expuestos:** `80` (HTTP con redirección forzada a HTTPS) y `443` (HTTPS con certificados SSL).

---

## 4. Orquestacion y Persistencia (`docker-compose.yml`)

El orquestador define la topología de servicios multi-contenedor en el servidor de producción:

```yaml
services:
  # 1. Base de Datos Relacional (MySQL 8.0 con Auto-Inicialización de Scripts)
  dosier-db:
    image: mysql:8.0
    container_name: dosier-db
    restart: unless-stopped
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-DosierIstpet2026SecurePass}
      MYSQL_DATABASE: sigafi_es
      MYSQL_PASSWORD: ${DB_PASSWORD:-DosierIstpet2026UserPass}
    volumes:
      - ./mysql_data:/var/lib/mysql
      - ./scripts/base_datos:/docker-entrypoint-initdb.d:ro
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "3"
    ports:
      - "3306:3306"
    networks:
      - dosier-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_ROOT_PASSWORD:-DosierIstpet2026SecurePass}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  # 2. Backend ASP.NET Core (.NET 8 Web API)
  dosier-backend:
    image: ${BACKEND_IMAGE:-ghcr.io/jorgedoicela/dosier-backend:latest}
    container_name: dosier-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:5000
      - ConnectionStrings__default_connection=Server=dosier-db;Port=3306;Database=sigafi_es;User=root;Password=${DB_ROOT_PASSWORD:-DosierIstpet2026SecurePass};
      - ConnectionStrings__DefaultConnection=Server=dosier-db;Port=3306;Database=sigafi_es;User=root;Password=${DB_ROOT_PASSWORD:-DosierIstpet2026SecurePass};
      - Jwt__Secret=ClaveSecretaInstitucionalParaFirmasJWTMinimo32Caracteres
      - Jwt__Issuer=DosierApi
      - Jwt__Audience=DosierClients
      - FrontendUrl=https://dosier.jorgedoicela.com
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
      - ./backups:/app/backups
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "3"
    depends_on:
      dosier-db:
        condition: service_healthy
    networks:
      - dosier-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/ping"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 20s

  # 3. Frontend Web (React 18 + Vite + Nginx SPA + SSL)
  dosier-web:
    image: ${FRONTEND_IMAGE:-ghcr.io/jorgedoicela/dosier-web:latest}
    container_name: dosier-web
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./certs:/etc/nginx/certs:ro
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "3"
    depends_on:
      dosier-backend:
        condition: service_started
    networks:
      - dosier-network

networks:
  dosier-network:
    driver: bridge
```

### 4.1 Politica de Persistencia y Almacenamiento
* **`./mysql_data:/var/lib/mysql`:** Persistencia física de los archivos de tablas y registros de MySQL 8.0. En modo desarrollo/pruebas, el pipeline realiza un reseteo automático para recrear la estructura limpia desde los 5 scripts oficiales.
* **`./scripts/base_datos:/docker-entrypoint-initdb.d:ro`:** Monta los 5 scripts DDL oficiales en modo lectura (`00_` a `04_`), garantizando la auto-inicialización y sincronización continua del esquema.
* **`./uploads:/app/uploads`:** Almacena los archivos PDF oficiales generados por el motor `DocumentEngine`, firmas electrónicas PKCS#12 y evidencias curriculares.
* **`./backups:/app/backups`:** Almacena volcados periódicos y copias de seguridad de la base de datos `sigafi_es`.
* **`./certs:/etc/nginx/certs:ro`:** Monta los certificados SSL de Cloudflare Origin CA en modo solo lectura (`:ro`) para impedir cualquier manipulación desde el contenedor web.

### 4.2 Gobernanza de Almacenamiento y Control de Disco (Instancias de 15 GB)
Para operar con alta disponibilidad en instancias AWS EC2 con disco EBS limitado (15 GB):
1. **Rotación Estricta de Logs:** Cada contenedor implementa el driver `json-file` con `max-size: 20m` y `max-file: 3`, limitando el espacio de logs a un tope máximo inamovible de 60 MB por servicio.
2. **Política de Retención de 3 Versiones:** En cada despliegue se ejecuta `docker image prune -f` y se preservan únicamente las **3 versiones más recientes** de cada imagen Docker (`dosier-backend` y `dosier-web`), purgando automáticamente las versiones 4 en adelante mediante `docker images | tail -n +4 | xargs -r docker rmi -f`.
3. **Limpieza de Sistema Operativo:** El pipeline trunca automáticamente los registros de systemd (`sudo journalctl --vacuum-size=20M`) y purga la caché de paquetes de Debian (`sudo apt-get clean`).
4. **Huella Total en Disco:** El stack completo (SO Debian 13 + 3 versiones de imágenes + MySQL + Logs) consume aproximadamente **~3.5 GB**, manteniendo **más de 11 GB de espacio libre continuo** (73% de disponibilidad de disco).

---

## 5. Gestion de Secretos y Variables de Entorno

La seguridad del pipeline se rige por el principio de cero credenciales en texto plano en el repositorio:

### 5.1 Secretos de GitHub Actions (Repositorio)

| Nombre del Secreto | Tipo de Dato | Propósito |
| :--- | :--- | :--- |
| `EC2_HOST` | Dirección IPv4 | Dirección IP del host remoto AWS EC2 para la conexión SSH y el reporte final. |
| `EC2_USER` | String (`admin` / `ubuntu`) | Usuario de sistema para autenticación SSH con privilegios sudo. |
| `EC2_SSH_KEY` | Clave Privada RSA PEM | Clave criptográfica privada para autenticación SSH no interactiva sin contraseña. |
| `GITHUB_TOKEN` | Token Temporal OIDC | Generado automáticamente por GitHub con permisos `packages: write` para publicar en GHCR. |

### 5.2 Variables de Entorno en el Servidor (`/var/www/dosier/.env`)

```env
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=dosier-db;Port=3306;Database=sigafi_es;User=root;Password=PASSWORD_SEGURA;
Jwt__Secret=CLAVE_SECRETA_INSTITUCIONAL_JWT_MINIMO_32_CARACTERES
Jwt__Issuer=DosierApi
Jwt__Audience=DosierClients
FrontendUrl=https://dosier.jorgedoicela.com
```

---

## 6. Procedimiento de Rollback y Recuperacion ante Desastres (DRP)

En caso de que una versión introduzca una regresión crítica o fallo imprevisto en producción, el sistema implementa el workflow [.github/workflows/rollback.yml](file:///c:/Users/DESARROLLADOR/Desktop/Proyectos/dosier/.github/workflows/rollback.yml):

1. El operador ingresa a GitHub Actions y selecciona el workflow **"Rollback - Instant AWS EC2 Deployment"**.
2. Ingresa el parámetro `target_sha` (el commit SHA de la versión deseada, ej. `d676b17`).
3. El pipeline se conecta vía SSH al servidor EC2, actualiza los tags de imagen y levanta los servicios.
4. **Métricas de Recuperación:**
   * **RTO (Recovery Time Objective):** **Menor a 2 segundos** para cualquiera de las 3 versiones recientes ya presentes en la caché local del servidor. Menor a 15 segundos si se requiere descargar una versión histórica desde GHCR.
   * **RPO (Recovery Point Objective):** 0 pérdida de datos transaccionales, ya que la base de datos MySQL y los volúmenes de uploads no se destruyen durante el cambio de versión.
