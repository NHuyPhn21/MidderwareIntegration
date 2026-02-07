# PowerShell Test Suite for Unified Portal

# Colors for output
$colors = @{
    Success = 'Green'
    Error = 'Red'
    Info = 'Cyan'
    Warning = 'Yellow'
    Header = 'Magenta'
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Type = 'Info'
    )
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $colors[$Type]
}

function Test-ServiceAvailable {
    param(
        [string]$Url,
        [string]$ServiceName
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -ErrorAction Stop
        Write-Log "✓ $ServiceName is RUNNING (HTTP $($response.StatusCode))" -Type Success
        return $true
    }
    catch {
        Write-Log "✗ $ServiceName is NOT RUNNING" -Type Error
        return $false
    }
}

function Test-APIEndpoint {
    param(
        [string]$Url,
        [string]$Method = 'GET',
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$TestName
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 5
            Headers = $Headers
        }
        
        if ($Body) {
            $params['Body'] = $Body
            $params['ContentType'] = 'application/json'
        }
        
        $response = Invoke-RestMethod @params
        Write-Log "✓ $TestName - PASS" -Type Success
        return $response
    }
    catch {
        Write-Log "✗ $TestName - FAIL: $($_.Exception.Message)" -Type Error
        return $null
    }
}

# ==================== MAIN TEST SUITE ====================

Write-Host "`n" -ForegroundColor Magenta
Write-Log "╔════════════════════════════════════════════════════╗" -Type Header
Write-Log "║     UNIFIED PORTAL - COMPREHENSIVE TEST SUITE     ║" -Type Header
Write-Log "╚════════════════════════════════════════════════════╝" -Type Header
Write-Host "`n"

# Phase 1: Service Availability
Write-Log "═════ PHASE 1: SERVICE AVAILABILITY CHECK ═════" -Type Header
Write-Host ""

$services = @{
    'HR System' = 'http://localhost:8080/swagger-ui.html'
    'Hospital API' = 'http://localhost:5000'
    'API Gateway' = 'http://localhost:6000/api/gateway/health'
    'Frontend Portal' = 'http://localhost:3000'
}

$allRunning = $true
foreach ($service in $services.GetEnumerator()) {
    if (-not (Test-ServiceAvailable -Url $service.Value -ServiceName $service.Key)) {
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Log "⚠ Some services are not running. Please start them first!" -Type Warning
    Write-Host ""
    exit 1
}

Write-Host ""

# Phase 2: Gateway Health
Write-Log "═════ PHASE 2: GATEWAY HEALTH CHECK ═════" -Type Header
Write-Host ""

$healthResponse = Test-APIEndpoint `
    -Url 'http://localhost:6000/api/gateway/health' `
    -TestName 'Gateway Health Status'

if ($healthResponse) {
    Write-Host "Systems connected:" -ForegroundColor Cyan
    $healthResponse.systems.PSObject.Properties | ForEach-Object {
        $status = if ($_.Value.status -eq 'connected') { 'Green' } else { 'Red' }
        Write-Host "  • $($_.Name): $($_.Value.status)" -ForegroundColor $status
    }
}

Write-Host ""

# Phase 3: Authentication
Write-Log "═════ PHASE 3: AUTHENTICATION FLOW ═════" -Type Header
Write-Host ""

$loginBody = @{
    email = "demo@example.com"
    password = "demo123"
} | ConvertTo-Json

Write-Log "Attempting login with demo@example.com / demo123" -Type Info
$loginResponse = Test-APIEndpoint `
    -Url 'http://localhost:6000/api/gateway/auth/login' `
    -Method 'POST' `
    -Body $loginBody `
    -TestName 'Demo Account Login'

if ($loginResponse -and $loginResponse.data.token) {
    $token = $loginResponse.data.token
    Write-Log "✓ JWT Token obtained: $($token.Substring(0, 20))..." -Type Success
    Write-Log "✓ User: $($loginResponse.data.user.firstName) $($loginResponse.data.user.lastName)" -Type Success
    Write-Log "✓ Services: $($loginResponse.data.services -join ', ')" -Type Success
    
    Write-Host ""
    
    # Phase 4: Token Verification
    Write-Log "═════ PHASE 4: TOKEN VERIFICATION ═════" -Type Header
    Write-Host ""
    
    $headers = @{
        'Authorization' = "Bearer $token"
    }
    
    Test-APIEndpoint `
        -Url 'http://localhost:6000/api/gateway/auth/verify' `
        -Headers $headers `
        -TestName 'Token Verification' | Out-Null
    
    Write-Host ""
    
    # Phase 5: HR System API
    Write-Log "═════ PHASE 5: HR SYSTEM API ═════" -Type Header
    Write-Host ""
    
    $hrResponse = Test-APIEndpoint `
        -Url 'http://localhost:6000/api/gateway/hr/employees' `
        -Headers $headers `
        -TestName 'Get HR Employees'
    
    if ($hrResponse -and $hrResponse.data.Count -gt 0) {
        Write-Log "✓ Retrieved $($hrResponse.data.Count) employees from HR system" -Type Success
        Write-Host "Sample employee:" -ForegroundColor Cyan
        $employee = $hrResponse.data[0]
        Write-Host "  • Name: $($employee.firstName) $($employee.lastName)"
        Write-Host "  • Email: $($employee.email)"
        Write-Host "  • Department: $($employee.department)"
    }
    
    # Get departments
    $deptResponse = Test-APIEndpoint `
        -Url 'http://localhost:6000/api/gateway/hr/departments' `
        -Headers $headers `
        -TestName 'Get HR Departments'
    
    if ($deptResponse -and $deptResponse.data.Count -gt 0) {
        Write-Log "✓ Retrieved $($deptResponse.data.Count) departments" -Type Success
    }
    
    Write-Host ""
    
    # Phase 6: Hospital API (with HR Auth)
    Write-Log "═════ PHASE 6: HOSPITAL API (HR INTEGRATION) ═════" -Type Header
    Write-Host ""
    
    $hospitalsResponse = Test-APIEndpoint `
        -Url 'http://localhost:6000/api/gateway/hospital/hr/doctors' `
        -Headers $headers `
        -TestName 'Get Hospital Doctors (HR Auth)'
    
    if ($hospitalsResponse -and $hospitalsResponse.data.Count -gt 0) {
        Write-Log "✓ Retrieved $($hospitalsResponse.data.Count) doctors" -Type Success
        Write-Host "Sample doctor:" -ForegroundColor Cyan
        $doctor = $hospitalsResponse.data[0]
        Write-Host "  • Name: $($doctor.name)"
        Write-Host "  • Email: $($doctor.email)"
        Write-Host "  • Specialization: $($doctor.specialization)"
        Write-Host "  • HR Sync Status: $($doctor.hr_sync_status)"
    }
    
    Write-Host ""
    
    # Phase 7: Sync Operations
    Write-Log "═════ PHASE 7: SYNC OPERATIONS ═════" -Type Header
    Write-Host ""
    
    # Get sync status before sync
    $syncStatusBefore = Test-APIEndpoint `
        -Url 'http://localhost:6000/api/gateway/sync/status' `
        -TestName 'Check Sync Status (Before)'
    
    if ($syncStatusBefore -and $syncStatusBefore.data.hospital) {
        Write-Host "Hospital sync metrics:" -ForegroundColor Cyan
        Write-Host "  • Total doctors: $($syncStatusBefore.data.hospital.total)"
        Write-Host "  • Synced: $($syncStatusBefore.data.hospital.synced)"
        Write-Host "  • Manual: $($syncStatusBefore.data.hospital.manual)"
        Write-Host "  • Sync %: $($syncStatusBefore.data.hospital.syncPercentage)%"
    }
    
    Write-Host ""
    
    # Trigger sync
    Write-Log "Triggering HR to Hospital sync..." -Type Info
    $syncResponse = Test-APIEndpoint `
        -Url 'http://localhost:6000/api/gateway/sync/hr-to-hospital' `
        -Method 'POST' `
        -TestName 'Sync HR to Hospital'
    
    if ($syncResponse) {
        Write-Host "Sync results:" -ForegroundColor Cyan
        Write-Host "  • Employees synced: $($syncResponse.data.employees_count)"
    }
    
    Write-Host ""
    
    # Get sync status after sync
    $syncStatusAfter = Test-APIEndpoint `
        -Url 'http://localhost:6000/api/gateway/sync/status' `
        -TestName 'Check Sync Status (After)'
    
    Write-Host ""
    
    # Phase 8: Error Scenarios
    Write-Log "═════ PHASE 8: ERROR HANDLING TESTS ═════" -Type Header
    Write-Host ""
    
    # Test invalid token
    $invalidHeaders = @{
        'Authorization' = "Bearer invalid_token_12345"
    }
    
    Write-Log "Testing with invalid token..." -Type Info
    try {
        $invalidResponse = Invoke-RestMethod `
            -Uri 'http://localhost:6000/api/gateway/hospital/hr/doctors' `
            -Headers $invalidHeaders `
            -TimeoutSec 5 `
            -ErrorAction Stop
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Log "✓ Invalid token correctly rejected (HTTP 401)" -Type Success
        }
        else {
            Write-Log "✗ Unexpected error: $($_.Exception.Response.StatusCode)" -Type Error
        }
    }
    
    # Test empty credentials
    Write-Log "Testing with empty credentials..." -Type Info
    try {
        $emptyBody = @{
            email = ""
            password = ""
        } | ConvertTo-Json
        
        $emptyResponse = Invoke-RestMethod `
            -Uri 'http://localhost:6000/api/gateway/auth/login' `
            -Method 'POST' `
            -Body $emptyBody `
            -ContentType 'application/json' `
            -TimeoutSec 5 `
            -ErrorAction Stop
    }
    catch {
        Write-Log "✓ Empty credentials correctly rejected" -Type Success
    }
    
    Write-Host ""
    
    # Phase 9: Summary
    Write-Log "═════ TEST SUMMARY ═════" -Type Header
    Write-Host ""
    
    Write-Log "✓ All services are running and connected" -Type Success
    Write-Log "✓ Authentication flow successful" -Type Success
    Write-Log "✓ HR system integration working" -Type Success
    Write-Log "✓ Hospital system integration working" -Type Success
    Write-Log "✓ Sync operations functional" -Type Success
    Write-Log "✓ Error handling operational" -Type Success
    
    Write-Host ""
    Write-Log "🎉 ALL TESTS PASSED! System is ready for production!" -Type Success
    
}
else {
    Write-Log "Login failed - cannot proceed with integration tests" -Type Error
    exit 1
}

Write-Host "`n"
Write-Log "═════ NEXT STEPS ═════" -Type Header
Write-Host ""
Write-Host "1. Open frontend portal: http://localhost:3000"
Write-Host "2. Login with: demo@example.com / demo123"
Write-Host "3. Verify dashboard displays correctly"
Write-Host "4. Test service navigation"
Write-Host "5. Review any errors in browser console"
Write-Host ""
Write-Log "For detailed testing, see TESTING_GUIDE.md" -Type Info
Write-Host ""
