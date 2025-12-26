# Stop All Services Script
Write-Host "Stopping Diagnostic Code Assistant..." -ForegroundColor Yellow

# Stop Docker Compose
Set-Location -Path $PSScriptRoot
Write-Host "Stopping Docker containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "All services stopped!" -ForegroundColor Green
