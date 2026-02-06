#!/usr/bin/env pwsh
# Unified Portal - Start All Services
# This script starts all 4 systems in separate PowerShell windows

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Unified Portal - Starting All 4 Services                ║" -ForegroundColor Cyan
Write-Host "║   1. HR System (Java Spring Boot) - Port 8080            ║" -ForegroundColor Yellow
Write-Host "║   2. Hospital API (Node.js) - Port 5000                  ║" -ForegroundColor Green
Write-Host "║   3. API Gateway (Node.js) - Port 6000                   ║" -ForegroundColor Blue
Write-Host "║   4. Frontend Portal (React) - Port 3000                 ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$baseDir = Get-Location
$delay = 2

# Function to start a service in a new terminal
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "✓ Starting $Name..." -ForegroundColor $Color
    
    $fullPath = Join-Path $baseDir $Path
    
    Start-Process powershell -ArgumentList @"
        Set-Location `"$fullPath`"
        Write-Host "═════════════════════════════════════════════" -ForegroundColor $Color
        Write-Host "$Name" -ForegroundColor $Color
        Write-Host "═════════════════════════════════════════════" -ForegroundColor $Color
        Write-Host "Starting in: `"$fullPath`"" -ForegroundColor Gray
        Write-Host "Command: $Command" -ForegroundColor Gray
        Write-Host ""
        $Command | Invoke-Expression
"@
}

Write-Host "Starting services...(windows will open in sequence)" -ForegroundColor Gray
Write-Host ""

# 1. Start HR System
Start-Service -Name "HR System (Java Spring Boot)" `
              -Path "hr-system\backend" `
              -Command "mvn spring-boot:run" `
              -Color Yellow

Start-Sleep -Seconds $delay

# 2. Start Hospital API
Start-Service -Name "Hospital API (Node.js)" `
              -Path "server" `
              -Command "npm start" `
              -Color Green

Start-Sleep -Seconds $delay

# 3. Start API Gateway
Start-Service -Name "API Gateway (Node.js)" `
              -Path "server" `
              -Command "node gateway.mjs" `
              -Color Blue

Start-Sleep -Seconds $delay

# 4. Start Frontend Portal
Start-Service -Name "Frontend Portal (React)" `
              -Path "client" `
              -Command "npm start" `
              -Color Magenta

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              All Services Started!                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting for services to be ready (2-3 minutes)..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  • Frontend Portal:  http://localhost:3000" -ForegroundColor Magenta
Write-Host "  • HR System:        http://localhost:8080/swagger-ui.html" -ForegroundColor Yellow
Write-Host "  • Hospital API:     http://localhost:5000" -ForegroundColor Green
Write-Host "  • API Gateway:      http://localhost:6000/api/gateway/health" -ForegroundColor Blue
Write-Host ""

Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  • Email:    demo@example.com" -ForegroundColor White
Write-Host "  • Password: demo123" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for all windows to show 'Server running' messages" -ForegroundColor Gray
Write-Host "  2. Open http://localhost:3000 in your browser" -ForegroundColor Gray
Write-Host "  3. Click 'Try Demo Account'" -ForegroundColor Gray
Write-Host "  4. You'll see the unified dashboard with 3 services" -ForegroundColor Gray
Write-Host ""

Write-Host "To stop all services, close all PowerShell windows" -ForegroundColor Yellow
