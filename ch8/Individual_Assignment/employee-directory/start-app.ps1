$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host 'Starting Employee Directory backend and frontend...' -ForegroundColor Cyan
Write-Host "Project: $projectRoot"

Start-Process powershell.exe -WorkingDirectory $projectRoot -ArgumentList @(
  '-NoExit',
  '-ExecutionPolicy',
  'Bypass',
  '-Command',
  'npm run server'
)

Start-Sleep -Seconds 2

Start-Process powershell.exe -WorkingDirectory $projectRoot -ArgumentList @(
  '-NoExit',
  '-ExecutionPolicy',
  'Bypass',
  '-Command',
  'npm run client'
)

Start-Sleep -Seconds 3
Start-Process 'http://127.0.0.1:5174'

Write-Host ''
Write-Host 'Backend:  http://127.0.0.1:3001' -ForegroundColor Green
Write-Host 'Frontend: http://127.0.0.1:5174' -ForegroundColor Green
Write-Host ''
Write-Host 'Close the two PowerShell windows to stop the servers.'
