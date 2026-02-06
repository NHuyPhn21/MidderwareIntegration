# 🔗 HR SYSTEM INTEGRATION GUIDE

## 📊 **HR SYSTEM ANALYZED**

### **✅ System Information**

```
Project: Employee Management System (Spring Boot)
Backend: Java Spring Boot
Database: MySQL (employees, departments)
Port: 8080
Authentication: JWT Token (Fixed for third-party)
Base URL: http://localhost:8080
```

---

## 📋 **API ENDPOINTS DISCOVERED**

### **Employee Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/employees/third-party?token=xxx` | Search employees (keyword optional) | ✅ JWT Token |
| GET | `/api/employees/third-party/all?token=xxx` | Get all employees | ✅ JWT Token |
| GET | `/api/employees/{id}` | Get employee by ID | ❌ Public |
| POST | `/api/employees/third-party?token=xxx` | Create employee | ✅ JWT Token |
| PUT | `/api/employees/third-party/{id}?token=xxx` | Update employee | ✅ JWT Token |
| DELETE | `/api/employees/third-party/{id}?token=xxx` | Delete employee | ✅ JWT Token |
| DELETE | `/api/employees/{id}` | Delete employee (public) | ❌ Public |

### **Department Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/departments` | Get all departments | ❌ Public |
| GET | `/api/departments/{id}` | Get department by ID | ❌ Public |
| POST | `/api/departments` | Create department | ❌ Public |
| PUT | `/api/departments/{id}` | Update department | ❌ Public |
| DELETE | `/api/departments/{id}` | Delete department | ❌ Public |

---

## 🔑 **AUTHENTICATION**

### **JWT Token for Third-Party Access**

```javascript
const FIXED_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0aGlyZF9wYXJ0eV91c2VyIiwiaWF0IjoxNzI4MDAwMDAwLCJleHAiOjMzMDgwMDAwMDB9.thirdpartyfixedtoken123456789";
```

**Usage:**
```
GET http://localhost:8080/api/employees/third-party/all?token=eyJhbGciOiJIUzI1NiJ9...
```

---

## 📦 **DATA MODELS**

### **Employee Model**

```java
{
  "id": Long,                    // Auto-generated
  "firstName": String,           // Required
  "lastName": String,            // Required
  "email": String,              // Required
  "age": int,                   // Required
  "department": {               // ManyToOne relationship
    "id": Long,
    "name": String
  },
  "departmentId": Long          // Transient field for JSON
}
```

**Example Response:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "age": 30,
  "department": {
    "id": 1,
    "name": "Engineering"
  },
  "departmentId": 1
}
```

### **Department Model**

```java
{
  "id": Long,          // Auto-generated
  "name": String       // Required
}
```

**Example Response:**
```json
{
  "id": 1,
  "name": "Engineering"
}
```

---

## 🔄 **FIELD MAPPING: HR → HOSPITAL**

### **Employee → Doctor Mapping**

```javascript
HR Employee                    Hospital Doctor
─────────────────────────────────────────────────
id                      →      hr_employee_id
firstName + lastName    →      name
email                   →      email (new field in Doctor model)
department.name         →      department
"Doctor"               →      specialization (default)
N/A                    →      experience (default: 0)
N/A                    →      availability (default: true)
N/A                    →      photoUrl (default: null)
"synced"               →      sync_status
new Date()             →      sync_date
```

### **Department → Department Mapping**

```javascript
HR Department                  Hospital Department
─────────────────────────────────────────────────
id                      →      hr_department_id
name                    →      name
"synced"               →      sync_status
```

---

## 🚀 **INTEGRATION STEPS**

### **Step 1: Update Hospital Gateway**

File: `server/gateway.mjs`

```javascript
// Update HR system configuration
const SYSTEMS = {
  hospital: {
    baseUrl: 'http://localhost:5000',
    port: 5000
  },
  hr: {
    baseUrl: 'http://localhost:8080',
    port: 8080,
    auth: {
      type: 'jwt-query',  // JWT in query parameter
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0aGlyZF9wYXJ0eV91c2VyIiwiaWF0IjoxNzI4MDAwMDAwLCJleHAiOjMzMDgwMDAwMDB9.thirdpartyfixedtoken123456789'
    }
  },
  hotel: {
    baseUrl: 'http://localhost:3000',  // TBD
    port: 3000
  }
};
```

### **Step 2: Add HR Proxy Routes**

```javascript
// HR Proxy Routes
app.get('/api/gateway/hr/employees', async (req, res) => {
  try {
    const response = await axios.get(
      `${SYSTEMS.hr.baseUrl}/api/employees/third-party/all`,
      {
        params: { token: SYSTEMS.hr.auth.token }
      }
    );
    res.json({
      code: 0,
      message: 'Success',
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'HR API error',
      success: false,
      error: error.message
    });
  }
});

app.get('/api/gateway/hr/departments', async (req, res) => {
  try {
    const response = await axios.get(
      `${SYSTEMS.hr.baseUrl}/api/departments`
    );
    res.json({
      code: 0,
      message: 'Success',
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'HR API error',
      success: false,
      error: error.message
    });
  }
});
```

### **Step 3: Create Data Sync Function**

```javascript
// Sync HR Employees → Hospital Doctors
app.post('/api/gateway/sync/hr-to-hospital', async (req, res) => {
  try {
    // 1. Fetch all employees from HR
    const hrResponse = await axios.get(
      `${SYSTEMS.hr.baseUrl}/api/employees/third-party/all`,
      {
        params: { token: SYSTEMS.hr.auth.token }
      }
    );

    const employees = hrResponse.data;
    const syncResults = [];

    // 2. For each employee, create/update doctor in Hospital
    for (const emp of employees) {
      const doctorData = {
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        specialization: 'General Physician',  // Default
        department: emp.department?.name || 'General',
        experience: 0,
        availability: true,
        hr_employee_id: emp.id,
        sync_status: 'synced',
        sync_date: new Date()
      };

      try {
        // Check if doctor already exists by hr_employee_id
        const existingResponse = await axios.get(
          `${SYSTEMS.hospital.baseUrl}/api/doctors/hr/${emp.id}`
        );

        if (existingResponse.data && existingResponse.data.data) {
          // Update existing doctor
          const doctorId = existingResponse.data.data._id;
          await axios.put(
            `${SYSTEMS.hospital.baseUrl}/api/doctors/${doctorId}`,
            doctorData
          );
          syncResults.push({
            employeeId: emp.id,
            action: 'updated',
            status: 'success'
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // Create new doctor
          await axios.post(
            `${SYSTEMS.hospital.baseUrl}/api/doctors`,
            doctorData
          );
          syncResults.push({
            employeeId: emp.id,
            action: 'created',
            status: 'success'
          });
        } else {
          syncResults.push({
            employeeId: emp.id,
            action: 'failed',
            status: 'error',
            error: error.message
          });
        }
      }
    }

    res.json({
      code: 0,
      message: 'Sync completed',
      success: true,
      data: {
        total: employees.length,
        results: syncResults
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Sync failed',
      success: false,
      error: error.message
    });
  }
});
```

---

## 🧪 **TESTING**

### **Test HR Connection**

```bash
# Test 1: Get all employees
curl "http://localhost:8080/api/employees/third-party/all?token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0aGlyZF9wYXJ0eV91c2VyIiwiaWF0IjoxNzI4MDAwMDAwLCJleHAiOjMzMDgwMDAwMDB9.thirdpartyfixedtoken123456789"

# Test 2: Get all departments
curl http://localhost:8080/api/departments

# Test 3: Search employees
curl "http://localhost:8080/api/employees/third-party?keyword=John&token=eyJhbGciOiJIUzI1NiJ9..."
```

### **Test Gateway Integration**

```bash
# Test 1: Gateway health
curl http://localhost:6000/api/gateway/health

# Test 2: Get HR employees via gateway
curl http://localhost:6000/api/gateway/hr/employees

# Test 3: Trigger sync
curl -X POST http://localhost:6000/api/gateway/sync/hr-to-hospital
```

---

## 📝 **NEXT STEPS**

1. **Update Hospital Doctor Model:**
   - Add `hr_employee_id` field
   - Add `email` field
   - Add `sync_status` field
   - Add `sync_date` field

2. **Create Hospital endpoint:**
   - `GET /api/doctors/hr/:hr_employee_id` - Find doctor by HR employee ID

3. **Setup Auto-Sync:**
   - Create cron job to sync every 5 minutes
   - Or use webhook when HR employee is created/updated

4. **Update Gateway:**
   - Implement all routes above
   - Add error handling
   - Add logging

5. **Test Integration:**
   - Start HR system (port 8080)
   - Start Hospital system (port 5000)
   - Start Gateway (port 6000)
   - Test sync

---

## ⚡ **QUICK START COMMANDS**

```bash
# Terminal 1: Start HR System
cd hr-system/backend
mvn spring-boot:run

# Terminal 2: Start Hospital System
cd Hospital_Management_Website-main/server
npm start

# Terminal 3: Start API Gateway
cd Hospital_Management_Website-main/server
node gateway.mjs

# Terminal 4: Test sync
curl -X POST http://localhost:6000/api/gateway/sync/hr-to-hospital
```

---

**Integration Ready! Bây giờ anh/chị muốn em implement code không?** 🚀
