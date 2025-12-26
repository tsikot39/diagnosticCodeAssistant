# Start Backend Server Script
Write-Host "Starting Diagnostic Code Assistant Backend..." -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend"

# Activate virtual environment and start server
& "$PSScriptRoot\.venv\Scripts\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
