# ==============================================================================
# Verificador de Ausencia del Rol / Usuario Externo en DOSIER
# ==============================================================================
# Este script escanea el código fuente (backend, frontend, base de datos y docs)
# para certificar que NO existan remanentes del rol externo, revisores externos
# como usuarios del sistema, DTOs de registro externo ni defaults 'Externo'.
#
# Se omiten intencionalmente funcionalidades legitimas que usan el termino:
# - Normativas externas reguladoras (CES, CACES, SENESCYT)
# - Evaluacion externa del CACES (acreditacion institucional)
# - Componente iconografico ExternalLink (Lucide React)
# - Entidades externas de vinculacion (doc_entidades_externas)
# - Firmas PKCS#12 con interfaces criptograficas (IExternalSignature)
# - Conexiones y enlaces HTTP externos
# ==============================================================================

param(
    [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " AUDITORIA DE SEGURIDAD: VERIFICACION DE AUSENCIA DE ROLES EXTERNOS   " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Ruta raiz: $rootDir`n" -ForegroundColor Gray

# Carpetas y archivos a escanear
$scanDirs = @("backend", "dosier_web\src", "scripts\base_datos", "docs\documentacion")
$extensions = @("*.cs", "*.ts", "*.tsx", "*.sql", "*.json", "*.md")

# Exclusiones de directorios
$excludedPaths = @(
    "\bin\", "\obj\", "\node_modules\", "\.git\", "\dist\", "\.gemini\",
    "docs\tesis\" # Protegida segun regla del proyecto
)

# Patrones que denotan la presencia del ROL o USUARIO externo prohibido
$forbiddenPatterns = @(
    # Roles y tokens en base de datos o modelos
    @{ Pattern = "REVISOR_EXT"; Description = "Codigo de rol de revisor externo residual" },
    @{ Pattern = "REVISOR_E\b"; Description = "Codigo de rol de revisor externo residual" },
    @{ Pattern = "DOSIER_REVISOR"; Description = "Constante de rol externo inexistente en DOSIER" },
    @{ Pattern = "'Externo'\s*\)"; Description = "Default 'Externo' en columna tipoReferencia de base de datos" },
    @{ Pattern = '"Externo"\s*\)'; Description = "Default 'Externo' en columna tipoReferencia de base de datos" },
    
    # DTOs y metodos de creacion de usuarios externos
    @{ Pattern = "\bExternalUserDto\b"; Description = "DTO de usuario externo en backend" },
    @{ Pattern = "\bExternalUserCreateDto\b"; Description = "DTO de usuario externo en frontend" },
    @{ Pattern = "\bRegisterExternalUser\b"; Description = "Metodo de registro de usuario externo en backend" },
    @{ Pattern = "\bcreateExternalUser\b"; Description = "Metodo de registro de usuario externo en frontend" },
    @{ Pattern = "\bIExternalAuthService\b"; Description = "Servicio de autenticacion externa" },
    @{ Pattern = "\bExternalAuthService\b"; Description = "Servicio de autenticacion externa" },
    
    # Tipos de usuario y filtros RBAC
    @{ Pattern = 'type\s*==\s*"EXTERNO"'; Description = "Filtro backend por tipo de usuario EXTERNO" },
    @{ Pattern = 'type\s*===\s*[\''"]EXTERNO[\''"]'; Description = "Filtro frontend por tipo de usuario EXTERNO" },
    @{ Pattern = 'user_type\s*===\s*[\''"]EXTERNO[\''"]'; Description = "Filtro frontend por tipo de usuario EXTERNO" },
    @{ Pattern = 'userType\s*===\s*[\''"]EXTERNO[\''"]'; Description = "Filtro frontend por tipo de usuario EXTERNO" },
    @{ Pattern = '"EXTERNO"\s*=>'; Description = "Mapeo de rol EXTERNO a tabla de usuarios" },
    @{ Pattern = 'esRevisorExterno'; Description = "Flag booleano de revisor externo" },
    @{ Pattern = 'EsRevisorExterno'; Description = "Flag booleano de revisor externo" },
    @{ Pattern = 'REGISTRO_EXTERNO'; Description = "Evento de auditoria para registro de usuarios externos" },
    
    # Textos de UI residuales de roles externos
    @{ Pattern = '\+ Nuevo Externo'; Description = "Boton de creacion de usuario externo en UI" },
    @{ Pattern = '>Revisor Ext\.'; Description = "Insignia o etiqueta de revisor externo en UI" },
    @{ Pattern = 'Revisor externo\b'; Description = "Mencion a usuario con rol de revisor externo" },
    @{ Pattern = 'revisores externos\b'; Description = "Mencion a usuarios con rol de revisores externos" },
    @{ Pattern = 'Destinatario Externo'; Description = "Etiqueta UI de destinatario externo" },
    @{ Pattern = 'Externo / Desconocido'; Description = "Etiqueta UI de usuario externo" }
)

# Terminos permitidos (falsos positivos que corresponden a funcionalidades legitimas)
$allowedExceptions = @(
    "ExternalLink",                    # Icono de Lucide React
    "IExternalSignature",              # Interfaz criptografica iText / PKCS#12
    "doc_entidades_externas",          # Tabla de entidades aliadas / convenios
    "Normativas externas",             # Marco regulatorio CES/CACES
    "normativas externas",             # Marco regulatorio CES/CACES
    "Modelo de Evaluacion Externa",    # Marco normativo del CACES
    "evaluadores externos del CACES",  # Evaluacion y acreditacion institucional del CACES
    "evaluador externo del CACES",     # Pares evaluadores del CACES
    "servidor push externo",           # Mensajeria WebPush
    "envio externo",                   # Envio SMTP
    "traductor externo",               # ErrorBoundary del navegador
    "navegacion externa"               # Popstate del navegador
)

$violationsFound = 0
$totalFilesScanned = 0

foreach ($relDir in $scanDirs) {
    $fullDir = Join-Path $rootDir $relDir
    if (-not (Test-Path $fullDir)) {
        continue
    }

    $files = Get-ChildItem -Path $fullDir -Recurse -File -Include $extensions | Where-Object {
        $filePath = $_.FullName
        $isExcluded = $false
        foreach ($ex in $excludedPaths) {
            if ($filePath -like "*$ex*") {
                $isExcluded = $true
                break
            }
        }
        -not $isExcluded
    }

    foreach ($file in $files) {
        $totalFilesScanned++
        $lines = Get-Content -Path $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $lines) { continue }

        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            $lineNum = $i + 1

            foreach ($rule in $forbiddenPatterns) {
                if ($line -match $rule.Pattern) {
                    # Verificar si la linea contiene una excepcion permitida
                    $isAllowed = $false
                    foreach ($allowed in $allowedExceptions) {
                        if ($line -like "*$allowed*") {
                            $isAllowed = $true
                            break
                        }
                    }

                    if (-not $isAllowed) {
                        $violationsFound++
                        $relPath = $file.FullName.Replace($rootDir, "").TrimStart("\/")
                        Write-Host "[ALERTA] Infraccion encontrada:" -ForegroundColor Red
                        Write-Host "  Archivo:     ${relPath}:${lineNum}" -ForegroundColor Yellow
                        Write-Host "  Regla:       $($rule.Description)" -ForegroundColor Gray
                        Write-Host "  Contenido:   $($line.Trim())" -ForegroundColor White
                        Write-Host ""
                    }
                }
            }
        }
    }
}

Write-Host "----------------------------------------------------------------------" -ForegroundColor Gray
Write-Host "Resumen del Escaneo:" -ForegroundColor Cyan
Write-Host "  Total de archivos auditados: $totalFilesScanned" -ForegroundColor Gray
Write-Host "  Infracciones detectadas:     $violationsFound" -ForegroundColor $(if ($violationsFound -eq 0) { "Green" } else { "Red" })

if ($violationsFound -eq 0) {
    Write-Host "`n[OK] El sistema se encuentra 100% limpio de roles y usuarios externos." -ForegroundColor Green
    Write-Host "Todas las referencias al termino 'externo' corresponden a normativas CES/CACES, iconografia o integraciones tecnicas legitimas.`n" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "`n[FALLO] Se detectaron $violationsFound referencias al rol o usuario externo que deben ser revisadas.`n" -ForegroundColor Red
    exit 1
}
