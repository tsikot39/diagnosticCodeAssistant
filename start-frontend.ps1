# Start Frontend Development Server Script
Write-Host "Starting Diagnostic Code Assistant Frontend..." -ForegroundColor Green

# Navigate to frontend directory
Set-Location -Path "$PSScriptRoot\frontend"

# Start development server
npm run dev
