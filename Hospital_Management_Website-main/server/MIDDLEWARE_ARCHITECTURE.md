# 🔧 MIDDLEWARE - KIẾN TRÚC XỨ LÝ REQUEST

## 🎯 **MIDDLEWARE OVERVIEW**

Middleware là những lớp xử lý request đi từ client đến database và ngược lại.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                        │
└────────────────────────────┬──────────────────────────────┘
                             │
           ┌─────────────────▼──────────────────┐
           │  1. AUTHENTICATION MIDDLEWARE      │
           │  - Validate token/credentials      │
           │  - Check user login                │
           └────────────────┬────────────────────┘
                            │
           ┌─────────────────▼──────────────────┐
           │  2. AUTHORIZATION MIDDLEWARE       │
           │  - Check user role/permission      │
           │  - Role-based access control       │
           └────────────────┬────────────────────┘
                            │
           ┌─────────────────▼──────────────────┐
           │  3. VALIDATION MIDDLEWARE          │
           │  - Validate request data           │
           │  - Check data types/formats        │
           └────────────────┬────────────────────┘
                            │
           ┌─────────────────▼──────────────────┐
           │  4. BUSINESS LOGIC MIDDLEWARE      │
           │  - Process data                    │
           │  - Call database                   │
           │  - Execute business rules          │
           └────────────────┬────────────────────┘
                            │
           ┌─────────────────▼──────────────────┐
           │  5. ERROR HANDLING MIDDLEWARE      │
           │  - Catch errors                    │
           │  - Format error response           │
           └────────────────┬────────────────────┘
                            │
           ┌─────────────────▼──────────────────┐
           │  6. LOGGING MIDDLEWARE             │
           │  - Log request/response            │
           │  - Monitor performance             │
           └────────────────┬────────────────────┘
                            │
┌─────────────────────────────▼──────────────────────────────┐
│                    SEND RESPONSE TO CLIENT                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 **MIDDLEWARE LAYERS**

### **1️⃣ AUTHENTICATION MIDDLEWARE**

**Mục đích:** Xác thực người dùng có quyền truy cập hay không

**Hospital System:**
```javascript
// middleware/isAuthenticated.js
const isAuthenticated = (req, res, next) => {
  try {
    // Cách 1: Token từ Header
    const token = req.headers.authorization?.split(' ')[1];
    
    // Cách 2: Token từ URL query
    const urlToken = req.query.token;
    
    const finalToken = token || urlToken;
    
    if (!finalToken) {
      return res.status(401).json({
        code: 3,
        message: 'Missing token',
        success: false
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    
    next();
  } catch (error) {
    return res.status(401).json({
      code: 3,
      message: 'Invalid token',
      success: false,
      error: error.message
    });
  }
};

module.exports = isAuthenticated;
```

**Usage in Routes:**
```javascript
// routes/doctorRoutes.js
router.post('/doctors', isAuthenticated, createDoctor);
router.get('/doctors', getDoctors); // Public - no auth needed
```

---

### **2️⃣ AUTHORIZATION MIDDLEWARE**

**Mục đích:** Kiểm tra người dùng có quyền thực hiện action này không

**Hospital System:**
```javascript
// middleware/roleBasedAccess.js
const roleBasedAccess = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        code: 4,
        message: 'Access Denied - Insufficient permissions',
        success: false,
        userRole: userRole,
        requiredRoles: allowedRoles
      });
    }
    
    next();
  };
};

module.exports = roleBasedAccess;
```

**Usage:**
```javascript
// Only ADMIN and DOCTOR can access
router.post('/doctors', 
  isAuthenticated, 
  roleBasedAccess(['admin', 'doctor']), 
  createDoctor
);

// Only ADMIN can delete
router.delete('/doctors/:id', 
  isAuthenticated, 
  roleBasedAccess(['admin']), 
  deleteDoctor
);
```

**Hospital Roles:**
```
ADMIN       - Quản lý toàn bộ hệ thống
USER        - Bệnh nhân, nhân viên
DOCTOR      - Bác sĩ
VIEWER      - Chỉ xem (read-only)
DOCTOR_VIEWER - Chỉ xem doctors (read-only)
```

---

### **3️⃣ VALIDATION MIDDLEWARE**

**Mục đích:** Kiểm tra dữ liệu request có hợp lệ không

**Hospital System - Doctor Creation:**
```javascript
// middleware/validateDoctor.js
const validateDoctor = (req, res, next) => {
  const { name, specialization, department, experience } = req.body;
  
  // Check required fields
  if (!name || !specialization || !department) {
    return res.status(400).json({
      code: 1,
      message: 'Missing required fields: name, specialization, department',
      success: false,
      receivedData: { name, specialization, department }
    });
  }
  
  // Validate data types
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      code: 1,
      message: 'Invalid name - must be non-empty string',
      success: false
    });
  }
  
  if (typeof specialization !== 'string') {
    return res.status(400).json({
      code: 1,
      message: 'Invalid specialization',
      success: false
    });
  }
  
  // Validate experience if provided
  if (experience !== undefined && typeof experience !== 'number') {
    return res.status(400).json({
      code: 1,
      message: 'Invalid experience - must be number',
      success: false
    });
  }
  
  next();
};

module.exports = validateDoctor;
```

**Usage:**
```javascript
router.post('/doctors', 
  isAuthenticated, 
  validateDoctor,
  roleBasedAccess(['admin']), 
  createDoctor
);
```

---

### **4️⃣ BUSINESS LOGIC MIDDLEWARE**

**Mục đích:** Xử lý logic kinh doanh (tạo, cập nhật, xóa dữ liệu)

**Hospital System - Create Doctor:**
```javascript
// controllers/doctorController.js
const createDoctor = async (req, res) => {
  try {
    const { name, specialization, department, experience, availability, photoUrl } = req.body;
    
    // Check for duplicates
    const existingDoctor = await Doctor.findOne({ name, department });
    if (existingDoctor) {
      return res.status(409).json({
        code: 2,
        message: 'Doctor already exists in this department',
        success: false,
        existingDoctor: {
          id: existingDoctor._id,
          name: existingDoctor.name,
          department: existingDoctor.department
        }
      });
    }
    
    // Create new doctor
    const newDoctor = new Doctor({
      name,
      specialization,
      department,
      experience: experience || 0,
      availability: availability || true,
      photoUrl: photoUrl || null,
      createdAt: new Date(),
      createdBy: req.user.id
    });
    
    await newDoctor.save();
    
    res.status(201).json({
      code: 0,
      message: 'Doctor created successfully',
      success: true,
      data: {
        id: newDoctor._id,
        name: newDoctor.name,
        specialization: newDoctor.specialization,
        department: newDoctor.department,
        experience: newDoctor.experience
      }
    });
  } catch (error) {
    next(error); // Pass to error handling middleware
  }
};

module.exports = { createDoctor };
```

---

### **5️⃣ ERROR HANDLING MIDDLEWARE**

**Mục đích:** Xử lý tất cả lỗi xảy ra

**Hospital System:**
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Database connection error
  if (err.name === 'MongoError') {
    return res.status(500).json({
      code: 5,
      message: 'Database connection error',
      success: false,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 1,
      message: 'Validation error',
      success: false,
      error: err.message
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 3,
      message: 'Invalid token',
      success: false
    });
  }
  
  // Generic error
  return res.status(500).json({
    code: 5,
    message: 'Internal server error',
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;
```

**Setup in main app:**
```javascript
// index.js
const app = express();

// ... other middlewares ...

// Error handling middleware (MUST be last)
app.use(errorHandler);
```

---

### **6️⃣ LOGGING MIDDLEWARE**

**Mục đích:** Ghi log mọi request để debug và monitor

**Hospital System:**
```javascript
// middleware/logging.js
const logging = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Query:', req.query);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user?.id || 'Anonymous');
  
  // Intercept response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    console.log('Response Status:', res.statusCode);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    console.log(`Duration: ${duration}ms\n`);
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = logging;
```

**Setup:**
```javascript
// Development only
if (process.env.NODE_ENV === 'development') {
  app.use(logging);
}
```

---

## 🔄 **HR SYSTEM MIDDLEWARE**

### **HR Authentication Middleware (Java)**

```java
// Java - HR System
public class AuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) 
                                   throws ServletException, IOException {
        
        // Get Basic Auth header
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Basic ")) {
            String base64Credentials = authHeader.substring(6);
            String credentials = new String(Base64.getDecoder().decode(base64Credentials));
            String[] parts = credentials.split(":");
            
            String username = parts[0];
            String password = parts[1];
            
            // Verify username and password
            User user = userService.findByUsername(username);
            if (user != null && user.getPassword().equals(password)) {
                // Set authentication in context
                SecurityContextHolder.getContext()
                    .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                            username, password
                        )
                    );
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

## 🏗️ **MIDDLEWARE STACK ARCHITECTURE**

### **Request Flow in Hospital System**

```
1. Client sends POST /api/doctors?token=xyz
   {
     "name": "Dr. A",
     "specialization": "Cardiology",
     "department": "Heart Department"
   }

2. CORS Middleware
   ✓ Check if request origin is allowed

3. Body Parser Middleware
   ✓ Parse JSON request body

4. Authentication Middleware (isAuthenticated)
   ✓ Extract token from URL or header
   ✓ Verify token
   ✓ Attach user to request
   req.user = { id: 1, username: 'admin', role: 'admin' }

5. Validation Middleware (validateDoctor)
   ✓ Check required fields present
   ✓ Validate data types
   ✓ Return error if validation fails

6. Authorization Middleware (roleBasedAccess)
   ✓ Check if user role in allowedRoles
   ✓ Return 403 if not authorized

7. Business Logic (Controller)
   ✓ Check for duplicates
   ✓ Create doctor in database
   ✓ Return 201 created

8. Logging Middleware
   ✓ Log request and response

9. Error Handling Middleware
   ✓ Catch any errors from above
   ✓ Format error response

10. Response sent to client
   {
     "code": 0,
     "message": "Doctor created successfully",
     "success": true,
     "data": { ... }
   }
```

---

## 📊 **MIDDLEWARE COMPARISON TABLE**

| Middleware | Purpose | Input | Output | Example Error |
|-----------|---------|-------|--------|---------------|
| **Auth** | Verify token | Token | `req.user` | code: 3 (invalid token) |
| **Authorization** | Check role | `req.user.role` | Allow/Deny | code: 4 (no permission) |
| **Validation** | Check data format | `req.body` | Valid data | code: 1 (missing data) |
| **Business Logic** | Process data | Valid data | Database ops | code: 2 (duplicate) |
| **Error Handling** | Catch errors | Any error | Error response | code: 5 (DB error) |
| **Logging** | Record activity | Request/Response | Logs | - |

---

## 🔗 **MIDDLEWARE IN ROUTES**

### **Hospital System - Complete Example**

```javascript
// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const { createDoctor, getDoctors, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const isAuthenticated = require('../middleware/isAuthenticated');
const roleBasedAccess = require('../middleware/roleBasedAccess');
const validateDoctor = require('../middleware/validateDoctor');

// Public routes (no auth)
router.get('/doctors', getDoctors);
router.get('/doctors/department/:dept', getDoctorsByDepartment);

// Protected routes (auth + authorization)
router.post('/doctors',
  isAuthenticated,
  validateDoctor,
  roleBasedAccess(['admin', 'doctor']),
  createDoctor
);

router.put('/doctors/:id',
  isAuthenticated,
  validateDoctor,
  roleBasedAccess(['admin']),
  updateDoctor
);

router.delete('/doctors/:id',
  isAuthenticated,
  roleBasedAccess(['admin']),
  deleteDoctor
);

module.exports = router;
```

---

## 🛡️ **SECURITY BEST PRACTICES**

### **1. Never Trust User Input**
```javascript
// ❌ WRONG
const userId = req.params.id; // Directly use
const user = await User.findById(userId);

// ✅ CORRECT
const userId = req.params.id;
if (!isValidObjectId(userId)) {
  return res.status(400).json({ code: 1, message: 'Invalid ID' });
}
const user = await User.findById(userId);
```

### **2. Always Validate Required Fields**
```javascript
// ✅ CORRECT
if (!req.body.email || !req.body.password) {
  return res.status(400).json({ code: 1, message: 'Missing required fields' });
}
```

### **3. Check Permissions Before Operations**
```javascript
// ✅ CORRECT
router.delete('/doctors/:id',
  isAuthenticated,           // 1. Who are you?
  roleBasedAccess(['admin']), // 2. Do you have permission?
  deleteDoctor               // 3. Then do the operation
);
```

### **4. Never Expose Sensitive Data**
```javascript
// ❌ WRONG - Exposing password hash
res.json({ ...user }); // Includes password hash

// ✅ CORRECT - Exclude sensitive fields
const safeUser = {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
};
res.json(safeUser);
```

---

## 📝 **MIDDLEWARE ORDER IS IMPORTANT**

```javascript
// index.js - Correct middleware order
const app = express();

// 1. Body parsers (earliest)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS
app.use(cors());

// 3. Logging
app.use(logging);

// 4. Static files
app.use(express.static('public'));

// 5. API routes (with built-in auth/validation)
app.use('/api', routes);

// 6. 404 handler
app.use((req, res) => {
  res.status(404).json({ code: 5, message: 'Route not found' });
});

// 7. Error handler (MUST be last)
app.use(errorHandler);
```

❌ **WRONG ORDER:**
```javascript
// Error handler before routes - won't catch errors!
app.use(errorHandler);
app.use('/api', routes); // Errors won't reach handler
```

---

**Middleware là nền tảng của an toàn và độ tin cậy cho API!** 🛡️
