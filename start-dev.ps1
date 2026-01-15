# Stop any running node processes
Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Set PORT for React client
Write-Host "Setting client port to 3002..." -ForegroundColor Yellow
$env:PORT = "3002"

Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host "Server will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Client will run on: http://localhost:3002" -ForegroundColor Cyan

# Start the servers
npm run dev




