Write-Host "Diagnostic Code Assistant - Setup Verification" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# Check Python
Write-Host "`nChecking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = & "$PSScriptRoot\.venv\Scripts\python.exe" --version 2>&1
    Write-Host "OK Python: $pythonVersion" -ForegroundColor Green
} catch {
    $errors += "Python virtual environment not found"
    Write-Host "ERROR Python virtual environment not found" -ForegroundColor Red
}

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "OK Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    $errors += "Node.js not installed"
    Write-Host "ERROR Node.js not installed" -ForegroundColor Red
}

# Check npm
Write-Host "`nChecking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "OK npm: v$npmVersion" -ForegroundColor Green
} catch {
    $errors += "npm not installed"
    Write-Host "ERROR npm not installed" -ForegroundColor Red
}

# Check Docker
Write-Host "`nChecking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Docker: $dockerVersion" -ForegroundColor Green
        
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK Docker daemon is running" -ForegroundColor Green
        } else {
            $warnings += "Docker is installed but not running"
            Write-Host "WARNING Docker is installed but not running" -ForegroundColor Yellow
        }
    } else {
        $errors += "Docker not installed"
        Write-Host "ERROR Docker not installed" -ForegroundColor Red
    }
} catch {
    $errors += "Docker not installed"
    Write-Host "ERROR Docker not installed" -ForegroundColor Red
}

# Check Python packages
Write-Host "`nChecking Backend Dependencies..." -ForegroundColor Yellow
try {
    $packages = & "$PSScriptRoot\.venv\Scripts\python.exe" -m pip list 2>&1
    $requiredPackages = @("fastapi", "uvicorn", "sqlalchemy", "psycopg2-binary", "pydantic", "alembic")
    $installedCount = 0
    
    foreach ($pkg in $requiredPackages) {
        if ($packages -match $pkg) {
            $installedCount++
        }
    }
    
    Write-Host "OK Backend packages: $installedCount / $($requiredPackages.Count) installed" -ForegroundColor Green
} catch {
    $warnings += "Could not verify Python packages"
    Write-Host "WARNING Could not verify Python packages" -ForegroundColor Yellow
}

# Check frontend dependencies
Write-Host "`nChecking Frontend Dependencies..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\frontend\node_modules") {
    Write-Host "OK Frontend packages installed" -ForegroundColor Green
} else {
    $warnings += "Frontend node_modules not found"
    Write-Host "WARNING Frontend node_modules not found" -ForegroundColor Yellow
}

# Check configuration files
Write-Host "`nChecking Configuration Files..." -ForegroundColor Yellow
$configFiles = @(
    "$PSScriptRoot\.env.example",
    "$PSScriptRoot\backend\.env",
    "$PSScriptRoot\docker-compose.yml"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "OK $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        $warnings += "Missing: $(Split-Path $file -Leaf)"
        Write-Host "WARNING Missing: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Setup Verification Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "`nAll checks passed! Your setup is ready." -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "1. Start Docker Desktop (if not running)" -ForegroundColor White
    Write-Host "2. Run .\start-all.ps1 to start all services" -ForegroundColor White
    Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
} else {
    if ($errors.Count -gt 0) {
        Write-Host "`nErrors Found:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  - $error" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`nWarnings:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
