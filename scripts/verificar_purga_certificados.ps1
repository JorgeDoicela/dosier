# =============================================================================
# DOSIER - AUDITORIA INTEGRAL DE PURGA: CERTIFICADOS ENTREGADOS & RESIDUOS
# =============================================================================
param(
    [string]$TargetDir = "$PSScriptRoot/.."
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host "  DOSIER - AUDITORIA TOTAL: CERTIFICADOS ENTREGADOS Y RECONOCIMIENTOS        " -ForegroundColor Cyan
Write-Host "=============================================================================" -ForegroundColor Cyan

$auditCategories = @(
    @{
        Category = "1. VISTAS, SERVICIOS, RUTAS Y DASHBOARDS DE CERTIFICADOS"
        Checks = @(
            @{ Name = "Frontend: Componente MyCertificatesPage"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = "\bMyCertificatesPage\b"; Ext = "*.ts*" },
            @{ Name = "Frontend: Servicio certificatesService"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = "\bcertificatesService\b"; Ext = "*.ts*" },
            @{ Name = "Frontend: Ruta /mis-certificados"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = '["'']/mis-certificados["'']'; Ext = "*.ts*" },
            @{ Name = "Frontend: Rutas obsoletas /verificar-certificado"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = '["'']/verificar-certificado'; Ext = "*.ts*" },
            @{ Name = "Frontend: Peticiones a /certificates/"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = '["''](/api)?/certificates/'; Ext = "*.ts*" },
            @{ Name = "Frontend: Card 'Certificados' en EstudianteDashboard"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = 'title="Certificados"'; Ext = "*.ts*" },
            @{ Name = "Frontend: Variable certificadosCount en Dashboard"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = '\bcertificadosCount\b'; Ext = "*.ts*" }
        )
    },
    @{
        Category = "2. CATALOGO DE PLANTILLAS Y MOTOR DE DOCUMENTOS"
        Checks = @(
            @{ Name = "Frontend: Categoria CERTIFICADOS en TemplateCatalog"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = "'CERTIFICADOS'"; Ext = "*.ts*" },
            @{ Name = "Frontend: Bloque certificate_header"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = "'certificate_header'"; Ext = "*.ts*" },
            @{ Name = "Frontend: Bloque certificate_recipient_badge"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = "'certificate_recipient_badge'"; Ext = "*.ts*" },
            @{ Name = "Frontend: Bloque certificate_body"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = "'certificate_body'"; Ext = "*.ts*" },
            @{ Name = "Frontend: Componente RenderCertificates"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = "\bRenderCertificates\b"; Ext = "*.ts*" },
            @{ Name = "Frontend: Generadores certificateGenerators"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = "\bcertificateGenerators\b"; Ext = "*.ts*" },
            @{ Name = "Frontend: Categoria 'Bloques de Certificados & Reconocimientos'"; SearchPath = "$TargetDir/dosier_web/src"; Pattern = "Bloques de Certificados"; Ext = "*.ts*" }
        )
    },
    @{
        Category = "3. BACKEND Y CONTROLADORES .NET"
        Checks = @(
            @{ Name = "Backend: Controlador CertificatesController"; SearchPath = "$TargetDir/backend"; Pattern = "\bCertificatesController\b"; Ext = "*.cs" },
            @{ Name = "Backend: Interfaz ICertificateIssuanceService"; SearchPath = "$TargetDir/backend"; Pattern = "\bICertificateIssuanceService\b"; Ext = "*.cs" },
            @{ Name = "Backend: Servicio CertificateIssuanceService"; SearchPath = "$TargetDir/backend"; Pattern = "\bCertificateIssuanceService\b"; Ext = "*.cs" },
            @{ Name = "Backend: Endpoint IssueProjectCertificatesByUuid"; SearchPath = "$TargetDir/backend"; Pattern = "\bIssueProjectCertificatesByUuid\b"; Ext = "*.cs" },
            @{ Name = "Backend: Permiso DescargarCertificados"; SearchPath = "$TargetDir/backend"; Pattern = "\bDescargarCertificados\b"; Ext = "*.cs" },
            @{ Name = "Backend: DocumentCategory CertificadoCompletacion/Grupo"; SearchPath = "$TargetDir/backend"; Pattern = "DocumentCategory\.Certificado"; Ext = "*.cs" },
            @{ Name = "Backend: Plantilla CERTIFICADO_COMPLETACION en Registry"; SearchPath = "$TargetDir/backend"; Pattern = '["'']CERTIFICADO_COMPLETACION["'']'; Ext = "*.cs" },
            @{ Name = "Backend: Plantilla CERTIFICADO_PARTICIPACION_GRUPO en Registry"; SearchPath = "$TargetDir/backend"; Pattern = '["'']CERTIFICADO_PARTICIPACION_GRUPO["'']'; Ext = "*.cs" },
            @{ Name = "Backend: Archivos HTML de Certificados"; SearchPath = "$TargetDir/backend"; Pattern = "Certificado(Grupo|Completacion)\.html"; Ext = "*.cs" }
        )
    }
)

$grandTotalIssues = 0

foreach ($cat in $auditCategories) {
    Write-Host "`n-----------------------------------------------------------------------------" -ForegroundColor DarkCyan
    Write-Host "  $($cat.Category)" -ForegroundColor Cyan
    Write-Host "-----------------------------------------------------------------------------" -ForegroundColor DarkCyan

    foreach ($check in $cat.Checks) {
        $files = Get-ChildItem -Path $check.SearchPath -Recurse -Filter $check.Ext | Where-Object { 
            $_.FullName -notmatch "[\\/](bin|obj|node_modules|dist|\.git)[\\/]" 
        }

        $matches = @()
        foreach ($file in $files) {
            $m = Select-String -Path $file.FullName -Pattern $check.Pattern
            if ($m) {
                $matches += $m
            }
        }

        if ($matches.Count -eq 0) {
            Write-Host "  [OK] $($check.Name) -> 0 residuos." -ForegroundColor Green
        } else {
            Write-Host "  [ALERTA] $($check.Name) -> Encontradas $($matches.Count) ocurrencias:" -ForegroundColor Red
            foreach ($item in $matches) {
                Write-Host "    --> $($item.Filename):$($item.LineNumber) : $($item.Line.Trim())" -ForegroundColor Yellow
            }
            $grandTotalIssues += $matches.Count
        }
    }
}

Write-Host "`n=============================================================================" -ForegroundColor Cyan
if ($grandTotalIssues -eq 0) {
    Write-Host "  CERTIFICACION TOTAL: 0 RESIDUOS DETECTADOS EN TODO EL CODIGO               " -ForegroundColor Green
    Write-Host "  TODOS LOS CERTIFICADOS ENTREGADOS FUERON PURGADOS AL 100%                  " -ForegroundColor Green
} else {
    Write-Host "  RESULTADO: SE DETECTARON $grandTotalIssues RESIDUOS PENDIENTES             " -ForegroundColor Red
}
Write-Host "=============================================================================" -ForegroundColor Cyan

exit $grandTotalIssues
