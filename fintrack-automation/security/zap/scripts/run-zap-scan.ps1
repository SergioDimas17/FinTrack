param(
    [string]$TargetUrl = "https://wlsxfjlaxxwgnbhmtgmw.supabase.co"
)

$ErrorActionPreference = "Stop"

Write-Host "Target URL: $TargetUrl" -ForegroundColor Cyan

# Directorios
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ReportsDir = Join-Path $ScriptDir "..\reports"
if (-not (Test-Path $ReportsDir)) {
    New-Item -ItemType Directory -Force -Path $ReportsDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ReportFile = "zap-report_$Timestamp.html"
$ReportPath = Join-Path $ReportsDir $ReportFile

Write-Host "Iniciando escaneo de seguridad OWASP ZAP Baseline..." -ForegroundColor Yellow
Write-Host "El reporte se guardará en: $ReportPath" -ForegroundColor Green

# Ejecutar contenedor Docker de ZAP mapeando la carpeta de reportes
docker run --rm `
    -v "${ReportsDir}:/zap/wrk":rw `
    owasp/zap2docker-stable `
    zap-baseline.py `
    -t "$TargetUrl" `
    -r "$ReportFile" `
    -I

Write-Host "`n¡Escaneo completado con éxito!" -ForegroundColor Green
Write-Host "Reporte HTML generado en: $ReportPath" -ForegroundColor Cyan