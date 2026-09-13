# =============================================================================
# DOSIER: Script de Búsqueda de Residuos de Presupuesto, Dinero y Financiamiento
# =============================================================================

param(
    [string]$Path = "."
)

Write-Host "Iniciando escaneo exhaustivo de presupuesto, dinero y financiamiento en DOSIER..." -ForegroundColor Cyan

$keywords = @(
    'presupuesto',
    'budget',
    'financiamiento',
    'fuentefinanciamiento',
    'monto',
    'rubro',
    'partida_presupuestaria',
    'presupuesto_total',
    'presupuesto_ejecutado'
)

$excludeDirs = @(
    'node_modules',
    '.git',
    'dist',
    'bin',
    'obj',
    '.system_generated'
)

$regexPattern = ($keywords | ForEach-Object { [regex]::Escape($_) }) -join '|'

$files = Get-ChildItem -Path $Path -Recurse -File | Where-Object {
    $filePath = $_.FullName
    $shouldExclude = $false
    foreach ($ex in $excludeDirs) {
        if ($filePath -like "*\$ex\*" -or $filePath -like "*/$ex/*") {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude -and ($_.Extension -match '\.(tsx|ts|cs|sql|json|md)$')
}

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

foreach ($file in $files) {
    try {
        $lines = Get-Content -Path $file.FullName -ErrorAction SilentlyContinue
        $lineNum = 1
        foreach ($line in $lines) {
            if ($line -match $regexPattern) {
                # Ignorar comentarios triviales o dependencias no pertinentes
                $results.Add([PSCustomObject]@{
                    File = $file.FullName.Replace((Get-Location).Path + "\", "")
                    Line = $lineNum
                    Match = $matches[0]
                    Content = $line.Trim()
                })
            }
            $lineNum++
        }
    } catch {
        # Silencioso en archivos bloqueados
    }
}

Write-Host "`nResultados encontrados: $($results.Count) coincidencias en $($results | Select-Object -ExpandProperty File -Unique | Measure-Object | Select-Object -ExpandProperty Count) archivos.`n" -ForegroundColor Yellow

$groupedByArea = $results | Group-Object {
    if ($_.File -like "dosier_web*") { "Frontend (React / TypeScript)" }
    elseif ($_.File -like "backend*") { "Backend (.NET / C#)" }
    elseif ($_.File -like "scripts\base_datos*") { "Base de Datos (SQL)" }
    else { "Documentación y Raíz" }
}

foreach ($group in $groupedByArea) {
    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host "AREA: $($group.Name) ($($group.Count) coincidencias)" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
    
    $group.Group | Group-Object File | ForEach-Object {
        Write-Host "`n  [ARCHIVO] $($_.Name) ($($_.Count) ocurrencias):" -ForegroundColor White
        $_.Group | Select-Object -First 5 | ForEach-Object {
            Write-Host "    Línea $($_.Line): $($_.Content)" -ForegroundColor Gray
        }
        if ($_.Count -gt 5) {
            Write-Host "    ... y $($_.Count - 5) coincidencias más en este archivo." -ForegroundColor DarkGray
        }
    }
    Write-Host ""
}
