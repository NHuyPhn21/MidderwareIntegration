# 🧪 **COMPLETE TESTING GUIDE - Unified Portal**

## 📋 **TABLE OF CONTENTS**

1. [System Requirements](#system-requirements)
2. [Pre-Test Checklist](#pre-test-checklist)
3. [Starting All Services](#starting-all-services)
4. [Login Flow Testing](#login-flow-testing)
5. [Dashboard Testing](#dashboard-testing)
6. [API Testing](#api-testing)
7. [Service Integration Testing](#service-integration-testing)
8. [Error Scenarios](#error-scenarios)
9. [Performance Testing](#performance-testing)
10. [Mobile Testing](#mobile-testing)

---

## 🖥️ **SYSTEM REQUIREMENTS**

### **Minimum Specs**
- OS: Windows 10+ / macOS / Linux
- RAM: 8GB (16GB recommended)
- CPU: Quad-core (for Maven compilation)
- Storage: 2GB free space

### **Software Required**
- Java 11+ (for HR System)
- Node.js 16+ (for Hospital & Frontend)
- Maven 3.6+ (for HR compilation)
- Git (for cloning)
- PowerShell 5+ (Windows) or Bash (Mac/Linux)

### **Network**
- Ports 3000, 5000, 6000, 8080 must be available
- No firewall blocking localhost:PORT

---

## ✅ **PRE-TEST CHECKLIST**

### **1. Verify Installation**
```bash
# Check Java
java -version

# Check Node.js
node --version
npm --version

# Check Maven
mvn --version
```

### **2. Verify All Code Files Exist**
```
Hospital_Management_Website-main/
├── ../hr-system/backend/      ✓ Must have pom.xml
├── server/
│   ├── index.js              ✓ Hospital API
│   ├── gateway.mjs           ✓ API Gateway
│   └── models/doctor.js      ✓ Updated with HR fields
└── client/
    ├── src/
    │   ├── pages/Login.js    ✓ Unified login
    │   ├── pages/Dashboard.js ✓ Service dashboard
    │   ├── services/gatewayService.js ✓ API service
    │   └── context/AuthContext.js ✓ Auth context
    └── .env                   ✓ Configuration
```

### **3. Database Check**
```bash
# MongoDB should be running (if not, use docker)
# Or configure MONGO_URI in .env

# MySQL for HR (check if running)
```

### **4. Dependency Check**
```bash
# HR System
cd ../hr-system/backend
mvn clean install -DskipTests

# Hospital API
cd ../../server
npm install

# Frontend
cd ../client
npm install
```

---

## 🚀 **STARTING ALL SERVICES**

### **Method 1: Automated Script (Easiest)**

**Windows (PowerShell):**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
./START_ALL_SERVICES.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x START_ALL_SERVICES.sh
./START_ALL_SERVICES.sh
```

### **Method 2: Manual Start (4 Terminals)**

**Terminal 1: HR System**
```bash
cd ../hr-system/backend
mvn spring-boot:run

# Expected output:
# ✓ Tomcat initialized with port(s): 8080
# ✓ Application started
```

**Terminal 2: Hospital API**
```bash
cd server
npm start

# Expected output:
# ✓ Server running on port 5000
# ✓ MongoDB Connected
```

**Terminal 3: API Gateway**
```bash
cd server
node gateway.mjs

# Expected output:
# ⚡ Gateway running on port 6000
# 📡 Connected to HR: http://localhost:8080
# 🏥 Connected to Hospital: http://localhost:5000
```

**Terminal 4: Frontend Portal**
```bash
cd client
npm start

# Expected output:
# ✓ Compiled successfully!
# ✓ Local: http://localhost:3000
```

---

## 🔐 **LOGIN FLOW TESTING**

### **Test 1.1: Access Login Page**

```
Steps:
1. Open browser to http://localhost:3000
2. Should see login page (not redirected)

Expected:
✓ Login form visible
✓ Email input field
✓ Password input field
✓ "Sign In" button
✓ "Try Demo Account" button
✓ Gradient background with animations
✓ Demo credentials shown in info box
```

### **Test 1.2: Demo Account Login**

```
Steps:
1. Click "Try Demo Account" button
2. Wait for redirect

Expected:
✓ Button shows loading spinner
✓ No error message
✓ Redirects to /dashboard (URL changes)
✓ User info appears in header
✓ Dashboard content loads
```

### **Test 1.3: Manual Email/Password Login**

```
Steps:
1. Clear email field
2. Enter: demo@example.com
3. Enter password: demo123
4. Click "Sign In"

Expected:
✓ Same behavior as demo account
✓ Redirects to dashboard
✓ Same user info displayed
```

### **Test 1.4: Invalid Credentials**

```
Steps:
1. Enter: wrong@example.com
2. Enter password: wrongpassword
3. Click "Sign In"

Expected:
✓ Error message appears
✓ Red background with warning icon
✓ Message: "Login failed" or similar
✓ Stays on login page
✓ Can try again
```

### **Test 1.5: Empty Fields**

```
Steps:
1. Leave email empty
2. Leave password empty
3. Click "Sign In"

Expected:
✓ Error message: "Please enter email and password"
✓ Form validation prevents submit
```

### **Test 1.6: Invalid Email Format**

```
Steps:
1. Enter: notanemail
2. Enter password: password123
3. Click "Sign In"

Expected:
✓ Browser validation (HTML5)
✓ Error message or blocked submit
```

---

## 📊 **DASHBOARD TESTING**

### **Test 2.1: Dashboard Layout**

```
After login, check dashboard has:

✓ Header section
  - Portal title/logo
  - User name (firstName lastName)
  - User email
  - User role
  - Logout button

✓ Sidebar navigation
  - Overview (selected)
  - HR Management
  - Hospital
  - Hotel

✓ Main content area
  - Welcome message
  - Three service cards
  - Sync section
  - Quick stats
```

### **Test 2.2: User Information Display**

```
Check header shows correct user info:

Expected:
✓ User Name: "John Doe" (from HR)
✓ User Email: "demo@example.com" (from HR)
✓ User Role: "EMPLOYEE" or actual role
✓ Department: "Engineering" or actual department
```

### **Test 2.3: Service Card Visibility**

```
Check all 3 service cards visible:

Expected:
✓ HR Management card (👥 icon)
  - Title: "HR Management"
  - Description text
  - Feature list (3+ items)
  - "Access HR" button

✓ Hospital card (🏥 icon)
  - Title: "Hospital"
  - Description text
  - Feature list (3+ items)
  - "Access Hospital" button

✓ Hotel card (🏨 icon)
  - Title: "Hotel"
  - Description text
  - Feature list (3+ items)
  - "Access Hotel" button
```

### **Test 2.4: Sync Section**

```
Check sync functionality:

Steps:
1. Locate "🔄 Sync HR to Hospital" button
2. Click button
3. Watch for loading state
4. Check for success/error message

Expected:
✓ Button shows loading spinner
✓ Success message appears
✓ Shows timestamp
✓ Can click again
```

### **Test 2.5: Stats Section**

```
Check quick stats display:

Expected:
✓ Department card
  - Label: "Department"
  - Value: User's department

✓ Role card
  - Label: "Role"
  - Value: User's role

✓ Active Services card
  - Label: "Active Services"
  - Value: "3" or number of services
```

### **Test 2.6: Navigation Sidebar**

```
Check sidebar navigation:

Steps:
1. Click "Overview" → Already there
2. Click "HR Management" → Loading
3. Click "Hospital" → Loading
4. Click "Hotel" → Loading
5. Click "Overview" again

Expected:
✓ Sidebar items are clickable
✓ Active item highlighted
✓ Content area changes (or shows loading)
```

### **Test 2.7: Logout Functionality**

```
Steps:
1. Click "Logout" button (top right)
2. Check redirect

Expected:
✓ Clears localStorage (authToken, user, services)
✓ Redirects to /login
✓ Login page shows fresh
✓ Can login again
```

---

## 🌐 **API TESTING**

### **Test 3.1: Gateway Health Check**

```bash
curl http://localhost:6000/api/gateway/health

Expected Response:
{
  "code": 0,
  "message": "API Gateway is running",
  "success": true,
  "systems": {
    "hospital": {...},
    "hr": {...},
    "hotel": {...}
  }
}
```

### **Test 3.2: HR Login API**

```bash
curl -X POST http://localhost:6000/api/gateway/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123"
  }'

Expected Response:
{
  "code": 0,
  "message": "Login successful",
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {...},
    "services": ["hr", "hospital", "hotel"]
  }
}
```

### **Test 3.3: Token Verification**

```bash
TOKEN="<jwt_token_from_login>"
curl http://localhost:6000/api/gateway/auth/verify \
  -H "Authorization: Bearer $TOKEN"

Expected Response:
{
  "code": 0,
  "message": "Token is valid",
  "success": true,
  "data": {...}
}
```

### **Test 3.4: Get HR Employees**

```bash
curl http://localhost:6000/api/gateway/hr/employees

Expected Response:
{
  "code": 0,
  "message": "Employees from HR system",
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      ...
    }
  ]
}
```

### **Test 3.5: Get Hospital Doctors with HR Auth**

```bash
TOKEN="<jwt_token>"
curl http://localhost:6000/api/gateway/hospital/hr/doctors \
  -H "Authorization: Bearer $TOKEN"

Expected Response:
{
  "code": 0,
  "message": "Doctors from Hospital (HR integration)",
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. John Doe",
      "email": "john@hospital.com",
      "specialization": "General Physician",
      "hr_sync_status": "synced",
      ...
    }
  ]
}
```

### **Test 3.6: Trigger Sync**

```bash
curl -X POST http://localhost:6000/api/gateway/sync/hr-to-hospital

Expected Response:
{
  "code": 0,
  "message": "Sync HR employees to Hospital doctors completed",
  "success": true,
  "data": {
    "employees_count": 5,
    "sync_results": {...}
  }
}
```

### **Test 3.7: Check Sync Status**

```bash
curl http://localhost:6000/api/gateway/sync/status

Expected Response:
{
  "code": 0,
  "message": "Sync status",
  "success": true,
  "data": {
    "hospital": {
      "total": 10,
      "synced": 8,
      "manual": 2,
      "failed": 0,
      "syncPercentage": 80
    }
  }
}
```

---

## 🔗 **SERVICE INTEGRATION TESTING**

### **Test 4.1: HR System Accessibility**

```
URL: http://localhost:8080/swagger-ui.html

Expected:
✓ Swagger UI loads
✓ API endpoints documented
✓ Can see:
  - /api/auth/login
  - /api/auth/verify
  - /api/employees (with third-party endpoints)
  - /api/departments
```

### **Test 4.2: Hospital System Accessibility**

```
URL: http://localhost:5000

Expected:
✓ Returns: "Backend is running successfully!"
✓ Or redirects to API doc page
✓ Can access /api/doctors (public)
✓ Can access /api/hr/doctors (with JWT)
```

### **Test 4.3: Gateway System Accessibility**

```
URL: http://localhost:6000/api/gateway/health

Expected:
✓ Returns health status
✓ Shows all 3 systems
✓ Confirms connectivity
```

### **Test 4.4: Frontend Portal Accessibility**

```
URL: http://localhost:3000

Expected:
✓ React app loads
✓ Shows login page
✓ No console errors
```

### **Test 4.5: CORS Testing**

```bash
# Frontend calling Gateway
curl -i http://localhost:6000/api/gateway/health

Expected:
✓ Access-Control-Allow-Origin headers present
✓ No CORS errors in browser console
```

---

## ⚠️ **ERROR SCENARIOS**

### **Test 5.1: HR System Offline**

```
Steps:
1. Stop HR System (close Terminal 1)
2. Try to login in Frontend
3. Check error handling

Expected:
✓ Error message appears
✓ Message: "HR system unavailable" or similar
✓ User can retry
✓ Frontend doesn't crash
```

### **Test 5.2: Hospital API Offline**

```
Steps:
1. Stop Hospital API (close Terminal 2)
2. Try to access Hospital service
3. Check error handling

Expected:
✓ Error message appears
✓ User can still access HR/Hotel
✓ Gateway reports Hospital offline
```

### **Test 5.3: Gateway Offline**

```
Steps:
1. Stop Gateway (close Terminal 3)
2. Try to login in Frontend

Expected:
✓ Error: "Cannot connect to gateway"
✓ Clear error message
✓ Can retry after gateway restarts
```

### **Test 5.4: Expired Token**

```
Steps:
1. Login successfully
2. Manually delete authToken from localStorage (DevTools)
3. Refresh page or try dashboard

Expected:
✓ Redirects to login
✓ Shows error or just blank redirect
✓ Can login again
```

### **Test 5.5: Invalid Token**

```bash
curl http://localhost:6000/api/gateway/hospital/hr/doctors \
  -H "Authorization: Bearer invalid_token"

Expected:
{
  "code": 1,
  "message": "Token verification failed",
  "success": false
}
```

---

## ⚡ **PERFORMANCE TESTING**

### **Test 6.1: Page Load Time**

```
Measure with DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Measure load time

Expected:
✓ Login page: < 2 seconds
✓ Dashboard: < 3 seconds
✓ API calls: < 500ms each
```

### **Test 6.2: Login Speed**

```
Steps:
1. Click "Try Demo Account"
2. Time from click to dashboard visible

Expected:
✓ < 2 seconds total
✓ Includes API call + page render
```

### **Test 6.3: Sync Performance**

```
Steps:
1. Click "Sync HR to Hospital"
2. Time from click to success message

Expected:
✓ < 5 seconds total
✓ Should show progress indication
```

### **Test 6.4: Multiple Users**

```
Steps:
1. Open 2-3 browser windows
2. Login as different users simultaneously
3. Check all can access dashboard

Expected:
✓ No session conflicts
✓ Each user gets own data
✓ No errors
```

---

## 📱 **MOBILE TESTING**

### **Test 7.1: Login on Mobile**

```
Chrome DevTools:
1. Toggle device toolbar (Ctrl+Shift+M)
2. Select iPhone 12

Expected:
✓ Login form is readable
✓ Buttons are touch-friendly (50px+)
✓ No horizontal scroll
✓ Input fields are large
```

### **Test 7.2: Dashboard on Mobile**

```
Steps:
1. Stay in mobile view
2. Login
3. Check dashboard layout

Expected:
✓ Sidebar collapses to horizontal scroll
✓ Cards stack vertically
✓ Header is readable
✓ All buttons accessible
✓ No overlapping elements
```

### **Test 7.3: Service Cards on Mobile**

```
Expected:
✓ Cards display in single column
✓ Descriptions readable
✓ Buttons are clickable
✓ Stats section responsive
```

### **Test 7.4: Landscape Mode**

```
Steps:
1. Rotate device to landscape
2. Check layout

Expected:
✓ Content adapts to landscape
✓ Still readable
✓ No excessive scrolling
```

---

## 📊 **TEST RESULT TEMPLATE**

```markdown
## Test Execution Report

Date: 2026-02-05
Tester: [Your Name]
Environment: Windows/Mac/Linux

### Services Status
- [ ] HR System (8080): ✓ Running / ✗ Failed
- [ ] Hospital API (5000): ✓ Running / ✗ Failed
- [ ] Gateway (6000): ✓ Running / ✗ Failed
- [ ] Frontend (3000): ✓ Running / ✗ Failed

### Test Results

#### Login Flow
- [ ] Test 1.1 PASS / FAIL
- [ ] Test 1.2 PASS / FAIL
- [ ] Test 1.3 PASS / FAIL
- [ ] Test 1.4 PASS / FAIL
- [ ] Test 1.5 PASS / FAIL
- [ ] Test 1.6 PASS / FAIL

#### Dashboard
- [ ] Test 2.1 PASS / FAIL
- [ ] Test 2.2 PASS / FAIL
... (continue for all tests)

### Issues Found
1. [Issue description]
   - Severity: Low/Medium/High
   - Steps to reproduce
   - Expected vs Actual

### Notes
[Any observations or recommendations]
```

---

## 🚀 **QUICK TEST CHECKLIST**

```
Start Services:
☐ Terminal 1: HR System running (port 8080)
☐ Terminal 2: Hospital API running (port 5000)
☐ Terminal 3: Gateway running (port 6000)
☐ Terminal 4: Frontend running (port 3000)

Login Test:
☐ http://localhost:3000 loads
☐ Click "Try Demo Account"
☐ Dashboard displays
☐ User info shows correctly

Integration Test:
☐ Dashboard shows 3 service cards
☐ Sync button works
☐ Service stats display
☐ Logout button works

API Test:
☐ Gateway health check passes
☐ HR employees accessible
☐ Hospital doctors accessible
☐ Sync status shows data

Error Test:
☐ Invalid credentials fail gracefully
☐ Expired token redirects to login
☐ Network errors show messages
```

---

**Ready to test! Follow the checklist and report any issues!** ✅
