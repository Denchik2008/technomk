# Stop any running node processes
Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clear PORT environment variable that might interfere
Write-Host "Clearing PORT environment variable..." -ForegroundColor Yellow
$env:PORT = $null

Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host "Server will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Client will run on: http://localhost:3000" -ForegroundColor Cyan

# Start the servers
npm run dev

