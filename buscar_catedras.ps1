# Script de búsqueda exhaustiva de "catedra" y "cátedra" en todo el proyecto DOSIER
$ErrorActionPreference = "SilentlyContinue"

$excludeDirs = @('.git', 'node_modules', 'dist', 'bin', 'obj', '.turbo', '.vscode')
$pattern = 'c[aá]tedra'

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " ESCANEANDO TODO EL PROYECTO DOSIER EN BUSCA DE 'CATEDRA' " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$matchesFound = @()

Get-ChildItem -Path $root -Recurse -File | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($d in $excludeDirs) {
        if ($path -like "*\$d\*" -or $path -like "*/$d/*") {
            $skip = $true
            break
        }
    }
    -not $skip
} | ForEach-Object {
    $file = $_.FullName
    $relPath = $file.Replace($root, "").TrimStart('\', '/')
    
    # Excluir este mismo script de búsqueda
    if ($relPath -eq "buscar_catedras.ps1") { return }

    $lines = Get-Content -Path $file -Encoding UTF8
    $lineNum = 1
    foreach ($line in $lines) {
        if ($line -match $pattern) {
            $matchesFound += [PSCustomObject]@{
                Archivo = $relPath
                Linea   = $lineNum
                Texto   = $line.Trim()
            }
        }
        $lineNum++
    }
}

Write-Host ""
if ($matchesFound.Count -eq 0) {
    Write-Host ">>> [OK] No se encontró ninguna coincidencia de 'cátedra' o 'catedra' en el proyecto." -ForegroundColor Green
} else {
    Write-Host ">>> SE ENCONTRARON $($matchesFound.Count) COINCIDENCIAS:" -ForegroundColor Yellow
    $matchesFound | Format-Table -AutoSize -Wrap
}
Write-Host "=========================================================" -ForegroundColor Cyan
