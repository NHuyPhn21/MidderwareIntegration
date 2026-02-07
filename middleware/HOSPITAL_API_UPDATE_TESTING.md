# 🧪 **HOSPITAL API UPDATE - TESTING GUIDE**

## ✅ **CHANGES MADE**

### **1. Hospital Doctor Model** - `server/models/doctor.js`

**Added HR Integration Fields:**
```javascript
// HR System Integration Fields
hr_employee_id: Number      // Reference to HR Employee ID
hr_sync_status: String      // 'synced', 'pending', 'failed', 'manual'
hr_sync_date: Date          // When synced with HR
hr_last_updated: Date       // Last update from HR
source_system: String       // 'hospital', 'hr', 'manual'

// Additional fields
email: String               // For employee contact
timestamps: true            // createdAt, updatedAt
```

### **2. New Middleware** - `server/middleware/verifyHRToken.js`

**Features:**
- Verifies JWT token from HR system
- Accepts Bearer token in Authorization header
- Falls back to HR system verification if local verification fails
- Attaches user info to request object

**Usage:**
```javascript
import verifyHRToken from "./middleware/verifyHRToken.js";
app.get('/api/hr/protected-route', verifyHRToken, handler);
```

### **3. New Routes** - `server/routes/hrIntegrationRoutes.js`

**Endpoints Created:**

#### **GET Endpoints**
- `GET /api/hr/doctors` - Get all doctors (with filters)
- `GET /api/hr/doctors/:id` - Get doctor by ID
- `GET /api/hr/doctors/sync-status/:hrEmployeeId` - Get sync status
- `GET /api/hr/departments` - Get all departments
- `GET /api/hr/specializations` - Get all specializations

#### **POST Endpoints**
- `POST /api/hr/doctors` - Create new doctor
- `POST /api/hr/sync/doctors` - Sync doctors from HR employees

#### **PUT Endpoints**
- `PUT /api/hr/doctors/:id` - Update doctor information

#### **DELETE Endpoints**
- `DELETE /api/hr/doctors/:id` - Delete doctor

#### **SYNC Endpoints**
- `GET /api/hr/sync/status` - Get sync status overview

### **4. Updated Gateway** - `server/gateway.mjs`

**New Authentication Routes:**
- `POST /api/gateway/auth/login` - Login to unified portal
- `GET /api/gateway/auth/verify` - Verify JWT token

**New HR Integration:**
- `GET /api/gateway/hr/employees` - Get all HR employees
- `GET /api/gateway/hr/employees/:id` - Get specific employee
- `POST /api/gateway/hr/employees` - Create new employee
- `GET /api/gateway/hr/departments` - Get HR departments

**Hospital HR Integration:**
- `GET /api/gateway/hospital/hr/doctors` - Access Hospital doctors via HR auth

**Sync Routes:**
- `POST /api/gateway/sync/hr-to-hospital` - Trigger sync
- `GET /api/gateway/sync/status` - Check sync status

### **5. Updated Server Entry** - `server/index.js`

**Changes:**
```javascript
// Import new routes
import hrIntegrationRoutes from "./routes/hrIntegrationRoutes.js";

// Register routes
app.use("/api/hr", hrIntegrationRoutes);
```

---

## 🧪 **TESTING INSTRUCTIONS**

### **Prerequisites**
```bash
# Ensure you have these running
1. HR System (Java Spring Boot)
  cd ../hr-system/backend
   mvn spring-boot:run
   # Runs on http://localhost:8080

2. Hospital System (Node.js)
   cd server
   npm install  # if needed
   npm start
   # Runs on http://localhost:5000

3. API Gateway
   cd server
   node gateway.mjs
   # Runs on http://localhost:6000
```

### **Test 1: Gateway Health Check**

```bash
curl http://localhost:6000/api/gateway/health
```

**Expected Response:**
```json
{
  "code": 0,
  "message": "API Gateway is running",
  "success": true,
  "timestamp": "2026-02-05T...",
  "systems": {
    "hospital": {...},
    "hr": {...},
    "hotel": {...}
  }
}
```

### **Test 2: HR Login via Gateway**

```bash
curl -X POST http://localhost:6000/api/gateway/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "code": 0,
  "message": "Login successful",
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "department": "Engineering",
      "role": "EMPLOYEE"
    },
    "services": ["hr", "hospital", "hotel"],
    "gateway": {
      "hospital": "http://localhost:5000",
      "hr": "http://localhost:8080",
      "hotel": "http://localhost:3000"
    }
  }
}
```

### **Test 3: Verify Token via Gateway**

```bash
curl http://localhost:6000/api/gateway/auth/verify \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Expected Response:**
```json
{
  "code": 0,
  "message": "Token is valid",
  "success": true,
  "data": {
    "user": {...},
    "valid": true,
    "services": ["hr", "hospital", "hotel"]
  }
}
```

### **Test 4: Get HR Employees via Gateway**

```bash
curl http://localhost:6000/api/gateway/hr/employees
```

**Expected Response:**
```json
{
  "code": 0,
  "message": "Employees from HR system",
  "success": true,
  "source": "HR Management (Java Spring Boot)",
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "age": 30,
      "department": {...}
    }
  ]
}
```

### **Test 5: Get Hospital Doctors via HR Auth**

```bash
curl http://localhost:6000/api/gateway/hospital/hr/doctors \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Expected Response:**
```json
{
  "code": 0,
  "message": "Doctors from Hospital (HR integration)",
  "success": true,
  "source": "Hospital Management - HR Integration",
  "data": [
    {
      "id": 1,
      "name": "Dr. Smith",
      "specialization": "General Physician",
      "department": "General",
      "email": "smith@hospital.com",
      "hr_sync_status": "synced",
      "hr_sync_date": "2026-02-05T..."
    }
  ]
}
```

### **Test 6: Get HR Departments via Gateway**

```bash
curl http://localhost:6000/api/gateway/hr/departments
```

**Expected Response:**
```json
{
  "code": 0,
  "message": "Departments from HR system",
  "success": true,
  "source": "HR Management",
  "data": [
    {
      "id": 1,
      "name": "Engineering"
    },
    {
      "id": 2,
      "name": "Sales"
    }
  ]
}
```

### **Test 7: Create Doctor in Hospital**

```bash
curl -X POST http://localhost:6000/api/gateway/hospital/hr/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "name": "Dr. Jane Smith",
    "email": "jane@hospital.com",
    "specialization": "Cardiologist",
    "department": "Cardiology",
    "experience": "5",
    "hr_employee_id": 1
  }'
```

**Expected Response:**
```json
{
  "code": 0,
  "message": "Doctor created successfully",
  "success": true,
  "data": {
    "id": 1,
    "name": "Dr. Jane Smith",
    "email": "jane@hospital.com",
    "specialization": "Cardiologist",
    "hr_employee_id": 1,
    "hr_sync_status": "synced",
    "hr_sync_date": "2026-02-05T..."
  }
}
```

### **Test 8: Sync HR Employees → Hospital Doctors**

```bash
curl -X POST http://localhost:6000/api/gateway/sync/hr-to-hospital \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "code": 0,
  "message": "Sync HR employees to Hospital doctors completed",
  "success": true,
  "timestamp": "2026-02-05T...",
  "data": {
    "employees_count": 5,
    "sync_results": {
      "total": 5,
      "results": [
        {
          "empId": 1,
          "action": "created",
          "status": "success"
        }
      ],
      "syncDate": "2026-02-05T..."
    }
  }
}
```

### **Test 9: Check Sync Status**

```bash
curl http://localhost:6000/api/gateway/sync/status
```

**Expected Response:**
```json
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
    },
    "lastCheck": "2026-02-05T..."
  }
}
```

---

## 📊 **TESTING WITH POSTMAN**

**Import Collection:**

1. Open Postman
2. Create new collection: "Hospital + HR Integration"
3. Add requests below

### **Collection Variables**

```
{{base_url}} = http://localhost:6000
{{hr_url}} = http://localhost:8080
{{hospital_url}} = http://localhost:5000
{{jwt_token}} = <obtained from login>
```

### **Postman Requests**

```json
{
  "info": {
    "name": "Hospital HR Integration",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Gateway - Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/gateway/health"
      }
    },
    {
      "name": "Auth - Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/gateway/auth/login",
        "header": [
          {"key": "Content-Type", "value": "application/json"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"user@example.com\", \"password\": \"password123\"}"
        }
      }
    },
    {
      "name": "HR - Get All Employees",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/gateway/hr/employees"
      }
    },
    {
      "name": "HR - Get Departments",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/gateway/hr/departments"
      }
    },
    {
      "name": "Hospital - Get Doctors (HR Auth)",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/gateway/hospital/hr/doctors",
        "header": [
          {"key": "Authorization", "value": "Bearer {{jwt_token}}"}
        ]
      }
    },
    {
      "name": "Sync - Trigger Sync",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/gateway/sync/hr-to-hospital",
        "header": [
          {"key": "Content-Type", "value": "application/json"}
        ]
      }
    },
    {
      "name": "Sync - Get Status",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/gateway/sync/status"
      }
    }
  ]
}
```

---

## ⚠️ **TROUBLESHOOTING**

### **Issue: "JWT verification failed"**
```
Solution:
1. Ensure HR system is running on port 8080
2. Check if JWT token is not expired
3. Verify token format: "Bearer <token>"
4. Check JWT_SECRET in .env matches HR system
```

### **Issue: "HR API not responding"**
```
Solution:
1. Check HR system is running: curl http://localhost:8080/swagger-ui.html
2. Verify HR_API_URL in gateway.mjs
3. Check firewall/network connectivity
```

### **Issue: "Doctor creation fails with 409 conflict"**
```
Solution:
1. Check if doctor already exists with same hr_employee_id
2. Try updating instead of creating
3. Use unique hr_employee_id values
```

### **Issue: "Sync returns 0 employees"**
```
Solution:
1. Ensure HR system has employees created
2. Check HR third-party token is correct
3. Verify HR employees have required fields (firstName, lastName, email)
```

---

## 📋 **NEXT STEPS**

After successful testing:

1. **Enable CORS properly** - Update Hospital CORS to allow gateway origin
2. **Create frontend portal** - React/Vue app for login & dashboard
3. **Implement auto-sync** - Cron job or webhook for periodic sync
4. **Add Hotel system** - Integrate Hotel Management system
5. **Deploy to production** - Docker + Kubernetes setup

---

**All systems integrated! Ready for production testing!** 🚀
