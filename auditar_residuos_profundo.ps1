# ==============================================================================
# Script de Auditoría Forense y Búsqueda Heurística Profunda de Basura Residual
# ==============================================================================
# Evalúa patrones léxicos amplios (en inglés, español, camelCase, snake_case, URLs,
# rutas de API, endpoints, queries SQL, DTOs y parámetros UI).
# Excluye únicamente binarios, dist, git y node_modules.
# ==============================================================================

param(
    [switch]$SoloCodigo = $false
)

$targetRegexes = @(
    # Convocatorias y tipos
    '(?i)\bconvocatoria(s)?\b',
    '(?i)\bcall(s)?\b',
    '(?i)doc_convocatoria',
    '(?i)id_?convocatoria',
    '(?i)codigo_?convocatoria',
    '(?i)convocatoria_?id',
    '(?i)/api/convocatoria',
    '(?i)/convocatoria',

    # Grupos, comisiones, colectivos
    '(?i)\bdoc_grupos\b',
    '(?i)doc_grupos_',
    '(?i)\bgrupo(s)?_investigacion\b',
    '(?i)id_?grupo\b',
    '(?i)grupo_?id\b',
    '(?i)tiene_?grupo',
    '(?i)has_?group',
    '(?i)id_?grupo_?miembro',
    '(?i)/api/group',

    # Extensiones de plazo y prórrogas
    '(?i)extension(es)?_plazo',
    '(?i)doc_proyecto_extension',
    '(?i)proyect_?extension',
    '(?i)\bprorroga(s)?\b',
    '(?i)solicitud_?extension',
    '(?i)/api/extensions',

    # Documentos adjuntos de postulación
    '(?i)doc_proyectos_documentos_adjuntos',
    '(?i)documento(s)?_adjunto(s)?',
    '(?i)adjunto(s)?_postulacion',
    '(?i)anexo(s)?_postulacion',
    '(?i)anexos_proyecto',
    '(?i)proyecto_adjunto'
)

$excludeDirs = @("node_modules", "bin", "obj", ".git", "dist", ".gemini", ".system_generated", "artifacts")
$excludeFiles = @("verificar_purga.ps1", "auditar_residuos_profundo.ps1", "implementation_plan.md", "walkthrough.md")

# Extensiones de código si se solicita SoloCodigo
$codeExtensions = @(".cs", ".ts", ".tsx", ".sql", ".json", ".html", ".css")

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "INICIANDO AUDITORIA PROFUNDA DE RESIDUOS (PALABRAS SEMEJANTES)" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Patrones Regex: $($targetRegexes.Count) familias léxicas" -ForegroundColor Cyan

$files = Get-ChildItem -Path $PSScriptRoot -Recurse -File | Where-Object {
    $filePath = $_.FullName
    $skip = $false
    foreach ($dir in $excludeDirs) {
        if ($filePath -like "*\$dir\*" -or $filePath -like "*/$dir/*") {
            $skip = $true
            break
        }
    }
    if ($excludeFiles -contains $_.Name) {
        $skip = $true
    }
    if ($SoloCodigo -and -not ($codeExtensions -contains $_.Extension)) {
        $skip = $true
    }
    -not $skip
}

$findings = @()
$totalMatches = 0

foreach ($file in $files) {
    try {
        $lines = Get-Content -Path $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($null -eq $lines) { continue }
        
        $lineNum = 0
        foreach ($line in $lines) {
            $lineNum++
            
            # Filtro inteligente para no reportar falsos positivos de cronograma ni auditoria
            if ($line -match 'doc_cronograma' -or $line -match 'doc_trazabilidad' -or $line -match 'doc_audit') {
                # Ignorar si es estrictamente la tabla protegida
            }

            foreach ($pattern in $targetRegexes) {
                if ($line -match $pattern) {
                    # Ignorar comentarios de documentación markdown histórica si SoloCodigo está activo
                    $relPath = $file.FullName.Substring($PSScriptRoot.Length).TrimStart("\/")
                    
                    # Evitar reportar coincidencias genéricas en strings de auditoría o palabras comunes como 'callback'
                    if ($line -match '\bcallback\b' -and -not ($line -match '(?i)convocatoria|call_')) {
                        continue
                    }

                    $findings += [PSCustomObject]@{
                        File = $relPath
                        LineNumber = $lineNum
                        Pattern = $pattern
                        MatchText = $Matches[0]
                        Line = $line.Trim()
                    }
                    $totalMatches++
                    break # solo un match por linea
                }
            }
        }
    } catch {
        # ignore read errors on binary or locked files
    }
}

Write-Host "`nResultados encontrados: $totalMatches coincidencia(s)" -ForegroundColor $(if ($totalMatches -gt 0) { "Yellow" } else { "Green" })
Write-Host "------------------------------------------------------------------"

$grouped = $findings | Group-Object File
foreach ($g in $grouped) {
    Write-Host "`nArchivo: $($g.Name) ($($g.Count) coincidencias)" -ForegroundColor Yellow
    foreach ($item in $g.Group | Select-Object -First 10) {
        Write-Host "  [Línea $($item.LineNumber)] [$($item.MatchText)]: $($item.Line)" -ForegroundColor Gray
    }
    if ($g.Group.Count -gt 10) {
        Write-Host "  ... y $($g.Group.Count - 10) coincidencias más en este archivo." -ForegroundColor DarkGray
    }
}

Write-Host "`n=================================================================="
Write-Host "Auditoría finalizada. Total: $totalMatches hallazgos en $($grouped.Count) archivos." -ForegroundColor Cyan
Write-Host "=================================================================="
