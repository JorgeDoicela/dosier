# Guia de Operaciones: Pipeline CI/CD y Despliegue en AWS EC2 (DOSIER)

Este documento describe la arquitectura de automatización de compilación, empaquetado, pruebas, publicación en GitHub Packages (GHCR) y despliegue continuo en servidores AWS EC2 para el ecosistema DOSIER.

---

## 1. Arquitectura del Pipeline

El pipeline de entrega continua implementa un grafo acíclico dirigido (DAG) con detección inteligente de cambios por rutas (`paths-filter`):

```
                        [Push a rama main / workflow_dispatch]
                                          |
                                 +--------+--------+
                                 | detect-changes  |
                                 +--------+--------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
             (Si backend/**)                              (Si dosier_web/**)
                   |                                             |
           [backend-qa]                                    [frontend-qa]
        (dotnet test .NET 8)                          (vitest + npm run build)
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
                            (curl ping + Step Summary)
```

---

## 2. Componentes Dockerizados

### 2.1 Backend (.NET 8 Web API)
* **Dockerfile:** `backend/Dockerfile`
* **Estrategia:** Multi-stage build utilizando `mcr.microsoft.com/dotnet/sdk:8.0` para compilación y `mcr.microsoft.com/dotnet/aspnet:8.0` para runtime mínimo.
* **Puerto Expuesto:** `5000` (interno).
* **Volúmenes Persistentes:** `/app/uploads` (evidencias curriculares y firmas) y `/app/backups` (respaldos del sistema).

### 2.2 Frontend Web (React 18 + Vite)
* **Dockerfile:** `dosier_web/Dockerfile`
* **Estrategia:** Multi-stage build utilizando `node:22-alpine` para `npm run build` y `nginx:alpine` para servir la SPA.
* **Configuración de Servidor:** `dosier_web/nginx.conf` con soporte HTTPS (puerto 443), certificados Cloudflare Origin CA (`/etc/nginx/certs/cert.pem` y `key.pem`), redirección HTTP -> HTTPS, compresión gzip, cabeceras de seguridad y enrutamiento SPA (`try_files $uri $uri/ /index.html`).
* **Puertos Expuestos:** `80` (HTTP) y `443` (HTTPS).

### 2.3 Orquestación
* **Archivo:** `docker-compose.yml` en la raíz del repositorio.
* **Health Check Integrado:** Sondeo continuo a `http://localhost:5000/api/ping`.

---

## 3. Secretos Requeridos en GitHub Actions

Para habilitar el despliegue automático, configure los siguientes secretos en el repositorio de GitHub (`Settings > Secrets and variables > Actions`):

| Secreto | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `EC2_HOST` | Hostname / IP | Dirección IP pública o nombre DNS del servidor EC2 | `54.210.12.34` |
| `EC2_USER` | String | Usuario de acceso SSH en la instancia EC2 | `ubuntu` o `ec2-user` |
| `EC2_SSH_KEY` | Private Key PEM | Clave SSH privada de conexión al host sin passphrase | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |

> **Nota:** El token `GITHUB_TOKEN` para autenticarse contra `ghcr.io` es generado automáticamente por GitHub Actions durante el flujo del workflow.

---

## 4. Workflows Disponibles

### 4.1 Despliegue Automático (`deploy.yml`)
* **Disparador:** Push a la rama `main` afectando `backend/`, `dosier_web/` o `docker-compose.yml`.
* **Modo Manual:** Permite seleccionar `restart_only = true` para forzar un reinicio de contenedores en producción en caso de degradación o fallos temporales (502) sin requerir re-compilación ni subida de imágenes.

### 4.2 Rollback Inmediato (`rollback.yml`)
* **Disparador:** Ejecución manual vía `workflow_dispatch`.
* **Parámetro:** `target_sha` (SHA del commit objetivo o tag específico).
* **Operación:** Descarga inmediatamente las imágenes tagged en `ghcr.io` correspondientes al SHA ingresado y levanta los servicios mediante `docker compose up -d`, restaurando la versión previa en segundos.

### 4.3 Integración Continua (`main.yml`)
* **Disparador:** Pull Requests hacia `main` o `develop`, y push directo a la rama `develop`.
* **Operación:** Validación de compilación y ejecución de tests unitarios antes de permitir la mezcla de código.

---

## 5. Preparación Inicial del Servidor EC2

En la instancia EC2 remota, ejecute una única vez los siguientes comandos como administrador:

```bash
# 1. Instalar Docker y el plugin Docker Compose
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo systemctl enable --now docker

# 2. Asignar el usuario actual al grupo docker
sudo usermod -aG docker $USER

# 3. Crear el directorio oficial de despliegue
sudo mkdir -p /var/www/dosier/uploads /var/www/dosier/backups
sudo chown -R $USER:$USER /var/www/dosier

# 4. Configurar variables de entorno de producción
cat << 'EOF' > /var/www/dosier/.env
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=sigafi_es;User=dosier_user;Password=SuPasswordSeguro;
Jwt__Secret=ClaveSecretaInstitucionalParaFirmasJWTMinimo32Caracteres
Jwt__Issuer=DosierApi
Jwt__Audience=DosierClients
FrontendUrl=https://dosier.istpet.edu.ec
EOF
chmod 600 /var/www/dosier/.env
```
