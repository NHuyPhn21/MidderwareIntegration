# 🏢 **UNIFIED PORTAL ARCHITECTURE**
## 3 Systems, 1 Login, 1 Portal

---

## 📐 **SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIFIED PORTAL (UI)                      │
│                   Login Page - Email/Pass                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
                  ┌────────────────┐
                  │  HR System     │ ← CORE/MAIN
                  │  (Port 8080)   │
                  │  Spring Boot   │
                  │  MySQL         │
                  └────────┬───────┘
                           │
                  ┌────────┴──────────┐
                  ↓                   ↓
         ┌────────────────┐  ┌────────────────┐
         │ Hospital API   │  │  Hotel API     │
         │ (Port 5000)    │  │  (Port 3000)   │
         │ Node.js        │  │  TBD           │
         │ MongoDB        │  │  TBD           │
         └────────────────┘  └────────────────┘
                  ↓                   ↓
         ┌────────────────┐  ┌────────────────┐
         │ Hospital DB    │  │  Hotel DB      │
         │ MongoDB        │  │  MySQL/Mongo   │
         └────────────────┘  └────────────────┘
```

---

## 🔐 **AUTHENTICATION FLOW (SSO - Single Sign-On)**

```
Step 1: User Access Portal
┌──────────────────────────┐
│  Visit: localhost:3000   │
│  (or any portal URL)     │
└──────────────┬───────────┘
               ↓
Step 2: Login Form
┌──────────────────────────┐
│  Email: user@example.com │
│  Password: ****          │
│  System: HR              │
└──────────────┬───────────┘
               ↓
Step 3: Authentication to HR
┌──────────────────────────┐
│  POST /api/auth/login    │
│  Verify credentials      │
│  Against HR MySQL DB     │
└──────────────┬───────────┘
               ↓
Step 4: JWT Token Generated (from HR)
┌──────────────────────────────────────────┐
│ {                                        │
│   "token": "eyJhbGciOi...",             │
│   "user": {                              │
│     "id": 1,                             │
│     "email": "user@example.com",        │
│     "firstName": "John",                │
│     "department": "Engineering",        │
│     "role": "EMPLOYEE"                  │
│   },                                    │
│   "services": ["hr", "hospital", "hotel"]
│ }                                        │
└──────────────┬──────────────────────────┘
               ↓
Step 5: Dashboard - Choose Service
┌──────────────────────────────────────┐
│  Welcome John Doe                    │
│                                      │
│  [HR Module]  [Hospital]  [Hotel]   │
│                                      │
│  Or Direct Links:                   │
│  - Manage HR Profile                │
│  - Check Doctor Schedule            │
│  - Book Hotel Room                  │
└─────────────────────────────────────┘
```

---

## 🏗️ **PORTAL STRUCTURE**

### **Main Portal (Frontend)**
```
localhost:3000
├─ /login                    ← Login page (HR auth)
├─ /dashboard               ← Main dashboard
├─ /hr                       ← HR Module
│  ├─ /employees
│  ├─ /departments
│  └─ /profile
├─ /hospital                ← Hospital Module
│  ├─ /doctors
│  ├─ /departments
│  └─ /appointments
└─ /hotel                    ← Hotel Module
   ├─ /rooms
   ├─ /bookings
   └─ /reservations
```

---

## 🔗 **SERVICE INTEGRATION MAP**

### **HR System (Core)**
- **Role:** Authentication & Main Portal
- **Port:** 8080 (Spring Boot)
- **Database:** MySQL (employees, departments, auth)
- **Functions:**
  - User login/authentication
  - Employee management
  - Department management
  - User profile management

### **Hospital System (Integrated)**
- **Role:** Subordinate service
- **Port:** 5000 (Node.js Express)
- **Database:** MongoDB (doctors, patients, appointments)
- **Access:** 
  - Via JWT token from HR
  - API Gateway proxy
  - Token header: `Authorization: Bearer {jwt_token}`

### **Hotel System (Integrated)**
- **Role:** Subordinate service
- **Port:** 3000 (TBD)
- **Database:** TBD
- **Access:**
  - Via JWT token from HR
  - API Gateway proxy
  - Token header: `Authorization: Bearer {jwt_token}`

---

## 🛠️ **TECHNICAL IMPLEMENTATION**

### **1. Frontend Portal (React/Vue)**

```javascript
// Login Component
const handleLogin = async (email, password) => {
  try {
    // Call HR Auth API
    const response = await axios.post(
      'http://localhost:8080/api/auth/login',
      { email, password }
    );

    const { token, user, services } = response.data;

    // Store in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('services', JSON.stringify(services));

    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    setError('Login failed. Please try again.');
  }
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredService }) => {
  const token = localStorage.getItem('authToken');
  const services = JSON.parse(localStorage.getItem('services') || '[]');

  if (!token || (requiredService && !services.includes(requiredService))) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Dashboard Component
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('authToken');

  return (
    <div>
      <h1>Welcome {user.firstName} {user.lastName}</h1>
      
      <div className="services-grid">
        <Card title="HR Management" 
              description="Manage your profile, employees, departments"
              link="/hr"
              icon="👥" />
        
        <Card title="Hospital"
              description="View doctors, schedule appointments"
              link="/hospital"
              icon="🏥" />
        
        <Card title="Hotel"
              description="Check rooms, make reservations"
              link="/hotel"
              icon="🏨" />
      </div>
    </div>
  );
};
```

### **2. API Gateway (gateway.mjs - Route requests)**

```javascript
import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 6000;

// Configuration
const SERVICES = {
  hr: {
    baseUrl: 'http://localhost:8080',
    port: 8080
  },
  hospital: {
    baseUrl: 'http://localhost:5000',
    port: 5000
  },
  hotel: {
    baseUrl: 'http://localhost:3000',
    port: 3000
  }
};

// Middleware: Verify JWT Token from HR
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        code: 1,
        message: 'No token provided',
        success: false
      });
    }

    // Verify token with HR system
    const response = await axios.get(
      `${SERVICES.hr.baseUrl}/api/auth/verify`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    req.user = response.data.user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      code: 1,
      message: 'Invalid token',
      success: false
    });
  }
};

// Health Check
app.get('/health', (req, res) => {
  res.json({
    message: 'Gateway is running',
    services: {
      hr: 'http://localhost:8080',
      hospital: 'http://localhost:5000',
      hotel: 'http://localhost:3000'
    }
  });
});

// ==================== HR ROUTES ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const response = await axios.post(
      `${SERVICES.hr.baseUrl}/api/auth/login`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      code: 5,
      message: 'Login failed',
      success: false,
      error: error.message
    });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.hr.baseUrl}/api/auth/verify`,
      { headers: req.headers }
    );
    res.json(response.data);
  } catch (error) {
    res.status(401).json({
      code: 1,
      message: 'Token verification failed',
      success: false
    });
  }
});

// HR Employees (protected)
app.get('/api/hr/employees', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.hr.baseUrl}/api/employees`,
      { headers: { 'Authorization': req.headers.authorization } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to fetch employees',
      success: false,
      error: error.message
    });
  }
});

app.get('/api/hr/employees/:id', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.hr.baseUrl}/api/employees/${req.params.id}`,
      { headers: { 'Authorization': req.headers.authorization } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to fetch employee',
      success: false,
      error: error.message
    });
  }
});

// ==================== HOSPITAL ROUTES ====================
app.get('/api/hospital/doctors', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.hospital.baseUrl}/api/doctors`,
      { headers: { 'Authorization': req.headers.authorization } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to fetch doctors',
      success: false,
      error: error.message
    });
  }
});

app.post('/api/hospital/appointments', verifyToken, async (req, res) => {
  try {
    const response = await axios.post(
      `${SERVICES.hospital.baseUrl}/api/appointments`,
      req.body,
      { headers: { 'Authorization': req.headers.authorization } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to create appointment',
      success: false,
      error: error.message
    });
  }
});

// ==================== HOTEL ROUTES ====================
app.get('/api/hotel/rooms', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(
      `${SERVICES.hotel.baseUrl}/api/rooms`,
      { headers: { 'Authorization': req.headers.authorization } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to fetch rooms',
      success: false,
      error: error.message
    });
  }
});

app.post('/api/hotel/bookings', verifyToken, async (req, res) => {
  try {
    const response = await axios.post(
      `${SERVICES.hotel.baseUrl}/api/bookings`,
      req.body,
      { headers: { 'Authorization': req.headers.authorization } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      code: 5,
      message: 'Failed to create booking',
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Gateway running on port ${PORT}`);
  console.log(`📡 Connected to HR: ${SERVICES.hr.baseUrl}`);
  console.log(`🏥 Connected to Hospital: ${SERVICES.hospital.baseUrl}`);
  console.log(`🏨 Connected to Hotel: ${SERVICES.hotel.baseUrl}`);
});
```

### **3. HR System Updates (Spring Boot)**

Add verify endpoint to HR AuthController:

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            );
            
            String token = JwtTokenProvider.generateToken(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            response.put("services", Arrays.asList("hr", "hospital", "hotel"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).json({
                "code": 1,
                "message": "Authentication failed",
                "success": false
            });
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestHeader("Authorization") String token) {
        try {
            String cleanToken = token.replace("Bearer ", "");
            User user = JwtTokenProvider.getUserFromToken(cleanToken);
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("valid", true);
            response.put("services", Arrays.asList("hr", "hospital", "hotel"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).json({
                "code": 1,
                "message": "Invalid token",
                "success": false
            });
        }
    }
}
```

---

## 🚀 **DEPLOYMENT STRUCTURE**

### **Option 1: Separate Servers (Development)**
```
PC/Laptop:
├─ Terminal 1: HR System (port 8080)
├─ Terminal 2: Hospital System (port 5000)
├─ Terminal 3: Hotel System (port 3000)
├─ Terminal 4: API Gateway (port 6000)
└─ Terminal 5: Frontend Portal (port 3000 or 80)
```

### **Option 2: Docker Compose (Production)**
```yaml
version: '3.8'

services:
  hr-system:
    build: ../hr-system/backend
    ports:
      - "8080:8080"
    environment:
      - MYSQL_HOST=mysql-hr
      - MYSQL_PORT=3306
      - MYSQL_DB=hr_system
    depends_on:
      - mysql-hr

  hospital-system:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb-hospital:27017/hospital
    depends_on:
      - mongodb-hospital

  hotel-system:
    build: ./hotel-system
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/hotel

  gateway:
    build: ./gateway
    ports:
      - "6000:6000"
    environment:
      - HR_SERVICE=http://hr-system:8080
      - HOSPITAL_SERVICE=http://hospital-system:5000
      - HOTEL_SERVICE=http://hotel-system:3000
    depends_on:
      - hr-system
      - hospital-system
      - hotel-system

  mysql-hr:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=hr_system

  mongodb-hospital:
    image: mongo:latest
    ports:
      - "27017:27017"

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=hotel
```

---

## 📊 **USER ROLE MANAGEMENT**

```
User Roles:
├─ ADMIN
│  ├─ Access: HR (manage all), Hospital (manage all), Hotel (manage all)
│  └─ Permissions: Create, Read, Update, Delete (all services)
│
├─ HR_MANAGER
│  ├─ Access: HR (full), Hospital (read-only), Hotel (read-only)
│  └─ Permissions: Manage employees, departments
│
├─ DOCTOR/STAFF
│  ├─ Access: HR (own profile), Hospital (full), Hotel (read-only)
│  └─ Permissions: View appointments, manage schedule
│
├─ EMPLOYEE
│  ├─ Access: HR (own profile), Hospital (book), Hotel (book)
│  └─ Permissions: View profile, book appointments, book rooms
│
└─ GUEST
   ├─ Access: Public pages only
   └─ Permissions: None (login required)
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

- [ ] **Phase 1: HR Authentication**
  - [ ] Add JWT token generation in HR
  - [ ] Add verify endpoint in HR
  - [ ] Update frontend login page

- [ ] **Phase 2: API Gateway**
  - [ ] Create/update gateway.mjs
  - [ ] Add proxy routes for all 3 systems
  - [ ] Add token verification middleware

- [ ] **Phase 3: Hospital Integration**
  - [ ] Update Hospital API to accept JWT header
  - [ ] Modify Hospital routes for gateway
  - [ ] Test Hospital endpoint access

- [ ] **Phase 4: Hotel Integration**
  - [ ] Get Hotel system code/API specs
  - [ ] Add Hotel routes to gateway
  - [ ] Test Hotel endpoint access

- [ ] **Phase 5: Frontend Portal**
  - [ ] Create login page (connects to HR)
  - [ ] Create dashboard with 3 modules
  - [ ] Add navigation between services
  - [ ] Implement token management

- [ ] **Phase 6: Testing**
  - [ ] Test login flow
  - [ ] Test access to all 3 services
  - [ ] Test token verification
  - [ ] Test permission/role validation

- [ ] **Phase 7: Deployment**
  - [ ] Setup Docker containers
  - [ ] Configure environment variables
  - [ ] Deploy to production

---

## 🎯 **QUICK START**

```bash
# Terminal 1: HR System (Core)
cd ../hr-system/backend
mvn spring-boot:run
# Runs on http://localhost:8080

# Terminal 2: Hospital System
cd .
npm start
# Runs on http://localhost:5000

# Terminal 3: API Gateway
cd .
node gateway.mjs
# Runs on http://localhost:6000

# Terminal 4: Frontend Portal
cd ../hospital-management/client
npm start
# Runs on http://localhost:3000
```

**Access Portal:**
```
http://localhost:3000
Login with HR credentials
Access all 3 services from dashboard
```

---

**Kiến trúc "One Login, Three Services" - Sẵn sàng implement! 🚀**
