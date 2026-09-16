param (
    [switch]$Tunnel,
    [switch]$Rebuild,
    [switch]$Down
)

#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path

function Write-Header {
    param([string]$Text)
    $line = "-" * ($Text.Length + 4)
    Write-Host ""
    Write-Host "+$line+" -ForegroundColor Cyan
    Write-Host "|  $Text  |" -ForegroundColor Cyan
    Write-Host "+$line+" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Text)
    Write-Host "  >> $Text" -ForegroundColor White
}

function Write-Success {
    param([string]$Text)
    Write-Host "  [OK] $Text" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Text)
    Write-Host "  [ERROR] $Text" -ForegroundColor Red
    exit 1
}

# 1. Verificar Docker
Write-Header "Verificando Requisitos"
try {
    $dockerVersion = docker version --format "{{.Server.Version}}"
    Write-Success "Docker Engine detectado: v$dockerVersion"
} catch {
    Write-Failure "Docker no esta disponible. Asegurate de que Docker Desktop este corriendo."
}

# 2. Verificar archivo .env
$envFile = Join-Path $ProjectRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Step "Archivo .env no encontrado. Creando desde .env.example..."
    Copy-Item (Join-Path $ProjectRoot ".env.example") $envFile
    Write-Success ".env creado. Revisa las credenciales antes de continuar."
}

# 3. Modo DOWN
if ($Down.IsPresent) {
    Write-Header "Deteniendo Stack DOSIER"
    Set-Location $ProjectRoot
    docker compose --profile tunnel down --remove-orphans
    Write-Success "Stack detenido. Volumenes de datos (MySQL) conservados."
    exit 0
}

# 4. Construir y levantar
Write-Header "Levantando Stack DOSIER en Docker"
Set-Location $ProjectRoot

if ($Rebuild.IsPresent) {
    Write-Step "Modo Rebuild activo: reconstruyendo imagenes desde cero..."
    docker compose build --no-cache
}

Write-Step "Iniciando contenedores (dosier-db, dosier-backend, dosier-web)..."
docker compose up -d dosier-db dosier-backend dosier-web

if ($LASTEXITCODE -ne 0) {
    Write-Failure "Error al levantar los contenedores. Revisa los logs con: docker compose logs"
}

Write-Success "Stack base levantado exitosamente."

# 5. Esperar healthcheck del backend
Write-Header "Verificando Estado de los Servicios"
Write-Step "Esperando a que el backend este listo (hasta 90s)..."

$retries = 18
$healthy = $false
for ($attempt = 1; $attempt -le $retries; $attempt++) {
    Start-Sleep -Seconds 5
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/api/ping" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($null -ne $response -and $response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    } catch {
        # Esperando backend
    }
    Write-Step "Intento $attempt/$retries - Backend aun iniciando..."
}

if ($healthy) {
    Write-Success "Backend respondiendo en http://localhost:5001/api/ping"
} else {
    Write-Host "  [AVISO] El backend no respondio en 90s. Puede estar iniciando aun." -ForegroundColor Yellow
    Write-Host "          Ejecuta 'docker compose logs dosier-backend' para diagnosticar." -ForegroundColor Yellow
}

# 6. Activar Tunel Cloudflare si se solicito
if ($Tunnel.IsPresent) {
    Write-Header "Activando Tunel Cloudflare"
    Write-Step "Iniciando dosier-tunnel (Quick Tunnel HTTPS publico)..."
    docker compose --profile tunnel up -d dosier-tunnel
    Start-Sleep -Seconds 3
    Write-Step "Obteniendo URL del tunel desde los logs..."
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    $tunnelLogs = docker logs dosier-tunnel 2>&1 | Select-String -Pattern "https://[a-zA-Z0-9\.\-]+\.trycloudflare\.com"
    $ErrorActionPreference = $prevEAP
    if ($tunnelLogs) {
        $tunnelUrl = $tunnelLogs[0].Matches[0].Value
        Write-Host ""
        Write-Host "  ============================================================" -ForegroundColor Magenta
        Write-Host "  URL PUBLICA HTTPS: $tunnelUrl" -ForegroundColor Magenta
        Write-Host "  Comparte este enlace para acceso externo seguro." -ForegroundColor Magenta
        Write-Host "  ============================================================" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "  El backend permite automaticamente conexiones desde *.trycloudflare.com." -ForegroundColor Green
        Write-Host "  No requieres modificar .env ni reiniciar el backend." -ForegroundColor Green
    } else {
        Write-Host "  [AVISO] URL del tunel no detectada aun. Espera unos segundos y ejecuta:" -ForegroundColor Yellow
        Write-Host "    docker logs dosier-tunnel" -ForegroundColor Yellow
    }
}

# 7. Resumen final
Write-Header "DOSIER - Entorno Local Activo"
Write-Host ""
Write-Host "  Frontend (Docker/Nginx)  : http://localhost" -ForegroundColor Green
Write-Host "  Backend API              : http://localhost:5001/api/ping" -ForegroundColor Green
Write-Host "  Base de Datos MySQL      : localhost:3307 (sigafi_es)" -ForegroundColor Green
if ($Tunnel.IsPresent) {
    Write-Host "  Tunel Cloudflare         : ver logs de dosier-tunnel" -ForegroundColor Magenta
}
Write-Host ""
Write-Host "  Comandos utiles:" -ForegroundColor Cyan
Write-Host "    docker compose logs -f dosier-backend    # Logs del backend en vivo"
Write-Host "    docker compose logs -f dosier-tunnel     # URL del tunel"
Write-Host "    docker compose ps                        # Estado de los contenedores"
Write-Host "    .\scripts\despliegue\docker\start-local.ps1 -Down  # Apagar el stack"
Write-Host ""
