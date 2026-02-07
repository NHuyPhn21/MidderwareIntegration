#!/bin/bash
# API Testing Script - Using cURL

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Functions
print_header() {
    echo -e "\n${MAGENTA}═══════════════════════════════════════${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Test service availability
test_service() {
    local url=$1
    local name=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" -m 5)
    
    if [ "$response" = "200" ] || [ "$response" = "302" ] || [ "$response" = "404" ]; then
        print_success "$name is running (HTTP $response)"
        return 0
    else
        print_error "$name is NOT running (HTTP $response)"
        return 1
    fi
}

# ==================== MAIN EXECUTION ====================

echo -e "${MAGENTA}╔════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  UNIFIED PORTAL - API TEST SUITE      ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════╝${NC}"

# PHASE 1: Service Availability
print_header "PHASE 1: SERVICE AVAILABILITY CHECK"

test_service "http://localhost:8080/swagger-ui.html" "HR System"
test_service "http://localhost:5000" "Hospital API"
test_service "http://localhost:6000/api/gateway/health" "API Gateway"
test_service "http://localhost:3000" "Frontend Portal"

# PHASE 2: Gateway Health
print_header "PHASE 2: GATEWAY HEALTH CHECK"

response=$(curl -s http://localhost:6000/api/gateway/health)

if echo "$response" | grep -q '"success":true'; then
    print_success "Gateway health check passed"
    echo -e "${CYAN}Response:${NC}"
    echo "$response" | jq '.'
else
    print_error "Gateway health check failed"
    echo "$response"
fi

# PHASE 3: Authentication
print_header "PHASE 3: AUTHENTICATION FLOW"

print_info "Testing login with demo@example.com / demo123..."

login_response=$(curl -s -X POST http://localhost:6000/api/gateway/auth/login \
    -H "Content-Type: application/json" \
    -d '{
        "email": "demo@example.com",
        "password": "demo123"
    }')

if echo "$login_response" | grep -q '"success":true'; then
    print_success "Login successful"
    
    # Extract token
    token=$(echo "$login_response" | jq -r '.data.token')
    user_name=$(echo "$login_response" | jq -r '.data.user.firstName + " " + .data.user.lastName')
    services=$(echo "$login_response" | jq -r '.data.services | join(", ")')
    
    print_info "User: $user_name"
    print_info "Services: $services"
    print_info "Token: ${token:0:20}..."
    
    # Save token for later use
    export TOKEN=$token
else
    print_error "Login failed"
    echo "$login_response" | jq '.'
    exit 1
fi

# PHASE 4: Token Verification
print_header "PHASE 4: TOKEN VERIFICATION"

verify_response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    http://localhost:6000/api/gateway/auth/verify)

if echo "$verify_response" | grep -q '"success":true'; then
    print_success "Token verification passed"
else
    print_error "Token verification failed"
fi

# PHASE 5: HR System API
print_header "PHASE 5: HR SYSTEM INTEGRATION"

print_info "Getting HR employees..."
hr_response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    http://localhost:6000/api/gateway/hr/employees)

if echo "$hr_response" | grep -q '"success":true'; then
    count=$(echo "$hr_response" | jq '.data | length')
    print_success "Retrieved $count employees from HR"
    
    print_info "Sample employees:"
    echo "$hr_response" | jq '.data[0:2]'
else
    print_error "Failed to get HR employees"
fi

# Get departments
print_info "Getting HR departments..."
dept_response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    http://localhost:6000/api/gateway/hr/departments)

if echo "$dept_response" | grep -q '"success":true'; then
    dept_count=$(echo "$dept_response" | jq '.data | length')
    print_success "Retrieved $dept_count departments"
else
    print_error "Failed to get departments"
fi

# PHASE 6: Hospital Integration
print_header "PHASE 6: HOSPITAL SYSTEM INTEGRATION"

print_info "Getting hospital doctors (with HR auth)..."
hospital_response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    http://localhost:6000/api/gateway/hospital/hr/doctors)

if echo "$hospital_response" | grep -q '"success":true'; then
    doctor_count=$(echo "$hospital_response" | jq '.data | length')
    print_success "Retrieved $doctor_count doctors"
    
    print_info "Sample doctors:"
    echo "$hospital_response" | jq '.data[0:2]'
else
    print_error "Failed to get hospital doctors"
fi

# PHASE 7: Sync Operations
print_header "PHASE 7: SYNC OPERATIONS"

print_info "Getting sync status (before)..."
sync_before=$(curl -s http://localhost:6000/api/gateway/sync/status)

if echo "$sync_before" | grep -q '"success":true'; then
    print_success "Sync status retrieved"
    echo "$sync_before" | jq '.data'
else
    print_error "Failed to get sync status"
fi

print_info "Triggering HR to Hospital sync..."
sync_response=$(curl -s -X POST http://localhost:6000/api/gateway/sync/hr-to-hospital)

if echo "$sync_response" | grep -q '"success":true'; then
    print_success "Sync completed successfully"
    sync_count=$(echo "$sync_response" | jq '.data.employees_count')
    print_info "Synced $sync_count employees"
else
    print_error "Sync failed"
    echo "$sync_response" | jq '.'
fi

# PHASE 8: Error Handling
print_header "PHASE 8: ERROR HANDLING TESTS"

print_info "Testing with invalid token..."
invalid_response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer invalid_token" \
    http://localhost:6000/api/gateway/hospital/hr/doctors)

http_code=$(echo "$invalid_response" | tail -n1)
if [ "$http_code" = "401" ]; then
    print_success "Invalid token correctly rejected (HTTP 401)"
else
    print_error "Expected 401, got $http_code"
fi

print_info "Testing with empty credentials..."
empty_response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:6000/api/gateway/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"","password":""}')

http_code=$(echo "$empty_response" | tail -n1)
if [ "$http_code" != "200" ]; then
    print_success "Empty credentials correctly rejected"
else
    print_error "Empty credentials were accepted"
fi

# Summary
print_header "TEST SUMMARY"

echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    print_success "ALL TESTS PASSED!"
    echo -e "\n${GREEN}System is ready for production!${NC}\n"
else
    print_error "Some tests failed. Check the output above."
    echo ""
fi

# Next steps
print_header "NEXT STEPS"

echo "1. Open frontend: http://localhost:3000"
echo "2. Login with: demo@example.com / demo123"
echo "3. Verify dashboard displays correctly"
echo "4. Check service cards and navigation"
echo "5. Test sync functionality"
echo ""
