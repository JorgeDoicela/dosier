param (
    [switch]$WithDb,
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
$dockerVersion = (docker version --format "{{.Server.Version}}" 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($dockerVersion)) {
    Write-Failure "Docker Engine no esta disponible. Inicia la aplicacion Docker Desktop en Windows y espera a que el motor este activo."
}
Write-Success "Docker Engine detectado: v$dockerVersion"

# 2. Verificar y Cargar Archivo .env
$envFile = Join-Path $ProjectRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Step "Archivo .env no encontrado. Creando desde .env.example..."
    Copy-Item (Join-Path $ProjectRoot ".env.example") $envFile
    Write-Success ".env creado. Revisa las credenciales antes de continuar."
}

$envVars = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line.Split("=", 2)
        $envVars[$parts[0].Trim()] = $parts[1].Trim()
    }
}

$frontendPort = if ($envVars["FRONTEND_PORT"]) { $envVars["FRONTEND_PORT"] } else { "8080" }
$backendPort = if ($envVars["BACKEND_PORT"]) { $envVars["BACKEND_PORT"] } else { "5001" }
$dbHost = if ($envVars["DB_HOST"]) { $envVars["DB_HOST"] } else { "host.docker.internal" }
$dbPort = if ($envVars["DB_PORT_INTERNAL"]) { $envVars["DB_PORT_INTERNAL"] } else { "3306" }
$tunnelToken = if ($envVars["CLOUDFLARE_TUNNEL_TOKEN"]) { $envVars["CLOUDFLARE_TUNNEL_TOKEN"] } else { "" }

# 3. Modo DOWN
if ($Down.IsPresent) {
    Write-Header "Deteniendo Stack DOSIER (Staging)"
    Set-Location $ProjectRoot
    docker compose down --remove-orphans
    Write-Success "Stack de Staging detenido exitosamente."
    exit 0
}

# 4. Verificar MySQL en Windows si se utiliza conexion local
if (-not $WithDb.IsPresent -and ($dbHost -eq "host.docker.internal" -or $dbHost -eq "127.0.0.1" -or $dbHost -eq "localhost")) {
    Write-Step "Verificando conexion con MySQL local en Windows (puerto $dbPort)..."
    try {
        $tcp = Test-NetConnection -ComputerName "127.0.0.1" -Port ([int]$dbPort) -WarningAction SilentlyContinue
        if ($tcp.TcpTestSucceeded) {
            Write-Success "MySQL local detectado y activo en 127.0.0.1:$dbPort (sigafi_es)."
        } else {
            Write-Failure "No se detecto servicio MySQL en 127.0.0.1:$dbPort. Inicia tu servidor MySQL en Windows antes de levantar Staging o usa el parametro -WithDb."
        }
    } catch {
        Write-Step "Continuando con la verificacion de red hacia MySQL..."
    }
}

# 5. Construir y levantar servicios
Write-Header "Levantando Stack DOSIER en Staging"
Set-Location $ProjectRoot

if ($Rebuild.IsPresent) {
    Write-Step "Modo Rebuild activo: reconstruyendo imagenes desde cero..."
    docker compose build --no-cache
}

if ($WithDb.IsPresent) {
    Write-Step "Iniciando contenedores con base de datos aislada en Docker (dosier-db, dosier-backend, dosier-web)..."
    docker compose --profile db up -d dosier-db dosier-backend dosier-web
} else {
    Write-Step "Iniciando contenedores de aplicacion (dosier-backend, dosier-web) conectados a MySQL local..."
    docker compose up -d dosier-backend dosier-web
}

if ($LASTEXITCODE -ne 0) {
    Write-Failure "Error al levantar los contenedores. Revisa los logs con: docker compose logs"
}

Write-Success "Contenedores principales iniciados."

# 6. Esperar healthcheck del backend
Write-Header "Verificando Estado del Backend"
Write-Step "Esperando a que el backend responda en http://localhost:$backendPort/api/ping (hasta 90s)..."

$retries = 18
$healthy = $false
for ($attempt = 1; $attempt -le $retries; $attempt++) {
    Start-Sleep -Seconds 5
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$backendPort/api/ping" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($null -ne $response -and $response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    } catch {
        # Esperando inicializacion del backend
    }
    Write-Step "Intento $attempt/$retries - Backend aun iniciando..."
}

if ($healthy) {
    Write-Success "Backend respondiendo en http://localhost:$backendPort/api/ping"
} else {
    Write-Host "  [AVISO] El backend no respondio en 90s. Puede estar iniciando aun." -ForegroundColor Yellow
    Write-Host "          Ejecuta 'docker compose logs dosier-backend' para diagnosticar." -ForegroundColor Yellow
}

# 7. Resumen final
Write-Header "DOSIER - Entorno Staging Activo"
Write-Host ""
Write-Host "  Frontend Local (Nginx)   : http://localhost:$frontendPort" -ForegroundColor Green
Write-Host "  Backend API              : http://localhost:$backendPort/api/ping" -ForegroundColor Green
if ($WithDb.IsPresent) {
    Write-Host "  Base de Datos            : Contenedor Docker dosier-db (3307 -> 3306)" -ForegroundColor Green
} else {
    Write-Host "  Base de Datos            : MySQL Local Windows (${dbHost}:${dbPort})" -ForegroundColor Green
}
Write-Host "  Dominio Publico HTTPS    : https://staging-dosier.doicela.dev (via Cloudflare Tunnel en Host)" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Comandos utiles:" -ForegroundColor Cyan
Write-Host "    docker compose logs -f dosier-backend       # Logs del backend en vivo"
Write-Host "    docker compose ps                           # Estado de los contenedores"
Write-Host "    .\scripts\despliegue\docker\start-local.ps1 -Down  # Apagar el stack"
Write-Host ""
