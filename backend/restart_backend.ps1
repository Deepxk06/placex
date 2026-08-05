<#
.RESULT
Restart the PlaceX backend (Uvicorn) only.

Stops ONLY the uvicorn process running this project's `app.main` and restarts
it. Other Python processes (e.g. other apps, Celery workers, tooling) are left
untouched. Run from PowerShell:

    .\restart_backend.ps1 [-Port 8000] [-Host "0.0.0.0"]
#>
param(
    [string]$Host = "0.0.0.0",
    [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Find only the uvicorn process serving THIS project's app.main.
# Use the command line so we never kill unrelated python.exe processes.
$proc = @(Get-CimInstance Win32_Process -Filter "Name = 'python.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match "uvicorn" -and $_.CommandLine -match "app\.main" })

if ($proc.Count -gt 0) {
    foreach ($p in $proc) {
        $cmd = ($p.CommandLine -replace "\s+", " ")
        Write-Host "Stopping uvicorn PID $($p.ProcessId): $cmd"
        Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Milliseconds 500
} else {
    Write-Host "No running uvicorn for this project. Starting fresh."
}

Push-Location $projectRoot
try {
    python -m uvicorn app.main:app --host $Host --port $Port
} finally {
    Pop-Location
}