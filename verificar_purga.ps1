# ==============================================================================
# Script de Auditoría y Verificación de Purga de Entidades del Grupo 3
# ==============================================================================
# Busca coincidencias residuales de:
# 1. Convocatorias (doc_convocatorias, doc_tipos_convocatoria, IConvocatoriaService...)
# 2. Grupos Documentales (doc_grupos_documentales, doc_grupos_carreras, doc_grupos_miembros, IGroupsService...)
# 3. Extensiones de Plazo (doc_proyecto_extensiones, InvProyectoExtension...)
# 4. Adjuntos de Postulación (doc_proyectos_documentos_adjuntos, InvProyectoDocumentoAdjunto...)
# ==============================================================================

$targetTerms = @(
    "doc_convocatorias",
    "doc_tipos_convocatoria",
    "doc_grupos_documentales",
    "doc_grupos_carreras",
    "doc_grupos_miembros",
    "doc_proyectos_documentos_adjuntos",
    "doc_proyecto_extensiones",
    "InvConvocatoria",
    "InvGrupoInvestigacion",
    "InvGrupoMiembro",
    "InvProyectoExtension",
    "InvProyectoDocumentoAdjunto",
    "IConvocatoriaService",
    "IGroupsService",
    "ConvocatoriasController",
    "GroupsController",
    "ConvocatoriasPage",
    "PublicConvocatoriasPage",
    "GroupsPage",
    "IdConvocatoria",
    "TieneGrupo",
    "IdGrupo"
)

$excludeDirs = @("node_modules", "bin", "obj", ".git", "dist", ".gemini", ".system_generated")
$excludeFiles = @("verificar_purga.ps1", "implementation_plan.md", "walkthrough.md")

Write-Host "Iniciando escaneo de verificación de purga en: $PSScriptRoot" -ForegroundColor Cyan
Write-Host "Términos a evaluar: $($targetTerms.Count) patrones" -ForegroundColor Cyan
Write-Host "------------------------------------------------------------------"

$totalMatches = 0
$findings = @()

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
    -not $skip
}

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($content)) { continue }

        foreach ($term in $targetTerms) {
            # Búsqueda insensible a mayúsculas
            if ($content -match [regex]::Escape($term)) {
                # Obtener líneas coincidentes
                $lines = Get-Content -Path $file.FullName
                for ($i = 0; $i -lt $lines.Count; $i++) {
                    if ($lines[$i] -match [regex]::Escape($term)) {
                        $relPath = Resolve-Path -Path $file.FullName -Relative
                        $findings += [PSCustomObject]@{
                            Archivo = $relPath
                            Linea   = $i + 1
                            Termino = $term
                            Codigo  = $lines[$i].Trim()
                        }
                        $totalMatches++
                    }
                }
            }
        }
    } catch {
        # Ignorar archivos bloqueados o binarios
    }
}

Write-Host ""
if ($totalMatches -eq 0) {
    Write-Host "[OK] CERO COINCIDENCIAS ENCONTRADAS." -ForegroundColor Green
    Write-Host "Todas las referencias a las tablas, clases, servicios y páginas del Grupo 3 han sido completamente purgadas." -ForegroundColor Green
} else {
    Write-Host "[ALERTA] Se encontraron $totalMatches coincidencias residuales:" -ForegroundColor Yellow
    $findings | Group-Object Archivo | ForEach-Object {
        Write-Host "`nArchivo: $($_.Name)" -ForegroundColor Magenta
        foreach ($item in $_.Group) {
            Write-Host "  [Línea $($item.Linea)] [$($item.Termino)]: $($item.Codigo)" -ForegroundColor Gray
        }
    }
}
Write-Host "------------------------------------------------------------------"
Write-Host "Escaneo finalizado." -ForegroundColor Cyan
