# Run Playwright E2E tests
Write-Host "Starting Playwright E2E Tests..." -ForegroundColor Cyan

# Check if backend is running
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    $backendRunning = $true
    Write-Host "✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "! Backend not detected - Playwright will start it automatically" -ForegroundColor Yellow
}

# Check if frontend is running
$frontendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    $frontendRunning = $true
    Write-Host "✓ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "! Frontend not detected - Playwright will start it automatically" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Running E2E tests..." -ForegroundColor Cyan
npm run test:e2e

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ All E2E tests passed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Some E2E tests failed. Run 'npm run test:e2e:report' to see details." -ForegroundColor Red
}

Write-Host ""
Write-Host "View test report with: npm run test:e2e:report" -ForegroundColor Cyan
