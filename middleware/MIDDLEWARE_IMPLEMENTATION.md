# 🚀 MIDDLEWARE IMPLEMENTATION GUIDE

## 📌 **QUICK START - IMPLEMENT NOW**

### **Step 1: Create Middleware Files**

```
server/
├── middleware/
│   ├── isAuthenticated.js      ← Token validation
│   ├── roleBasedAccess.js      ← Permission check
│   ├── validateDoctor.js       ← Data validation
│   ├── validateAppointment.js  ← Data validation
│   ├── errorHandler.js         ← Error handling
│   └── logging.js              ← Request logging
```

---

## 🔐 **IMPLEMENTATION 1: IS AUTHENTICATED**

**File:** `server/middleware/isAuthenticated.js`

```javascript
const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  try {
    // 1. Try to get token from Authorization header (Bearer token)
    let token = req.headers.authorization?.split(' ')[1];
    
    // 2. Try to get token from query parameter
    if (!token) {
      token = req.query.token;
    }
    
    // 3. Try to get token from cookies
    if (!token) {
      token = req.cookies?.token;
    }
    
    // 4. No token found
    if (!token) {
      return res.status(401).json({
        code: 3,
        message: 'No token provided. Use ?token=xyz or Authorization header',
        success: false,
        hint: 'Send token in: query (?token=xxx), header (Bearer xxx), or cookie'
      });
    }
    
    // 5. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 6. Attach user to request object
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };
    
    console.log(`✅ Auth passed for user: ${req.user.username} (${req.user.role})`);
    next();
    
  } catch (error) {
    console.error('❌ Auth failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 3,
        message: 'Token expired',
        success: false,
        expiresAt: error.expiredAt
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 3,
        message: 'Invalid token format',
        success: false,
        error: error.message
      });
    }
    
    return res.status(401).json({
      code: 3,
      message: 'Authentication failed',
      success: false,
      error: error.message
    });
  }
};

module.exports = isAuthenticated;
```

**Test it:**
```bash
# ✅ CORRECT - Token in query
curl "http://localhost:5000/api/doctors?token=YOUR_JWT_TOKEN"

# ✅ CORRECT - Token in header
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/doctors

# ❌ WRONG - No token
curl http://localhost:5000/api/doctors
# Response: code: 3, message: 'No token provided'
```

---

## 🛡️ **IMPLEMENTATION 2: ROLE-BASED ACCESS**

**File:** `server/middleware/roleBasedAccess.js`

```javascript
const roleBasedAccess = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (from isAuthenticated middleware)
    if (!req.user) {
      return res.status(401).json({
        code: 3,
        message: 'User not authenticated',
        success: false
      });
    }
    
    const userRole = req.user.role;
    
    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        code: 4,
        message: `Access Denied. User role '${userRole}' is not authorized`,
        success: false,
        userRole: userRole,
        requiredRoles: allowedRoles,
        hint: `Only these roles can access: ${allowedRoles.join(', ')}`
      });
    }
    
    console.log(`✅ Authorization passed for role: ${userRole}`);
    next();
  };
};

module.exports = roleBasedAccess;
```

**Usage in Routes:**
```javascript
// Only admin can create/update/delete doctors
router.post('/doctors', isAuthenticated, roleBasedAccess(['admin']), createDoctor);
router.put('/doctors/:id', isAuthenticated, roleBasedAccess(['admin']), updateDoctor);
router.delete('/doctors/:id', isAuthenticated, roleBasedAccess(['admin']), deleteDoctor);

// Admin and doctor can view
router.get('/doctors', isAuthenticated, roleBasedAccess(['admin', 'doctor']), getDoctors);

// Everyone can view (public route)
router.get('/doctors/public', getDoctorsPublic); // No middleware
```

---

## ✔️ **IMPLEMENTATION 3: VALIDATE DOCTOR DATA**

**File:** `server/middleware/validateDoctor.js`

```javascript
const validateDoctor = (req, res, next) => {
  const { name, specialization, department, experience, availability } = req.body;
  
  const errors = [];
  
  // 1. Check required fields
  if (!name || name.trim() === '') {
    errors.push('name is required and cannot be empty');
  }
  
  if (!specialization || specialization.trim() === '') {
    errors.push('specialization is required (e.g., "Cardiologist")');
  }
  
  if (!department || department.trim() === '') {
    errors.push('department is required (e.g., "Cardiology")');
  }
  
  // 2. Validate data types
  if (name && typeof name !== 'string') {
    errors.push('name must be a string');
  }
  
  if (specialization && typeof specialization !== 'string') {
    errors.push('specialization must be a string');
  }
  
  if (experience !== undefined) {
    if (typeof experience !== 'number' || experience < 0) {
      errors.push('experience must be a non-negative number');
    }
    if (experience > 70) {
      errors.push('experience seems too high (> 70 years)');
    }
  }
  
  if (availability !== undefined && typeof availability !== 'boolean') {
    errors.push('availability must be true/false');
  }
  
  // 3. Validate string lengths
  if (name && name.length > 100) {
    errors.push('name must not exceed 100 characters');
  }
  
  // 4. If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      code: 1,
      message: 'Validation failed',
      success: false,
      errors: errors,
      receivedData: { name, specialization, department, experience, availability }
    });
  }
  
  console.log('✅ Data validation passed');
  next();
};

module.exports = validateDoctor;
```

**Test it:**
```bash
# ❌ WRONG - Missing required fields
curl -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{ "name": "Dr. A" }'
# Response: code: 1, message: 'specialization is required'

# ✅ CORRECT
curl -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Dr. A",
    "specialization": "Cardiologist",
    "department": "Cardiology",
    "experience": 10
  }'
```

---

## ❌ **IMPLEMENTATION 4: ERROR HANDLER**

**File:** `server/middleware/errorHandler.js`

```javascript
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  console.error(`\n[ERROR] ${timestamp}`);
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // 1. MongoDB/Database Errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      code: 5,
      message: 'Database connection error',
      success: false,
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database error',
      timestamp
    });
  }
  
  // 2. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      code: 1,
      message: 'Validation error',
      success: false,
      details: messages,
      timestamp
    });
  }
  
  // 3. Duplicate Key Error (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      code: 2,
      message: `Duplicate entry: ${field} already exists`,
      success: false,
      field: field,
      timestamp
    });
  }
  
  // 4. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 3,
      message: 'Invalid token',
      success: false,
      timestamp
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 3,
      message: 'Token expired',
      success: false,
      expiresAt: err.expiredAt,
      timestamp
    });
  }
  
  // 5. Generic Server Error
  return res.status(500).json({
    code: 5,
    message: 'Internal server error',
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp
  });
};

module.exports = errorHandler;
```

---

## 📝 **IMPLEMENTATION 5: LOGGING**

**File:** `server/middleware/logging.js`

```javascript
const logging = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();
  
  // Log incoming request
  console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
  
  if (Object.keys(req.query).length > 0) {
    console.log('Query:', JSON.stringify(req.query));
  }
  
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  
  if (req.user) {
    console.log('User:', `${req.user.username} (${req.user.role})`);
  }
  
  // Intercept response
  const originalJson = res.json;
  
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    console.log('Response:', res.statusCode);
    console.log(`Duration: ${duration}ms`);
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = logging;
```

---

## 🏗️ **IMPLEMENTATION 6: SETUP IN MAIN APP**

**File:** `server/index.js`

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import middlewares
const logging = require('./middleware/logging');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const demoRoutes = require('./routes/demoRoutes');

const app = express();

// ===== MIDDLEWARE SETUP (ORDER MATTERS) =====

// 1. Body parsers (must be early)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// 3. Logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use(logging);
}

// 4. Static files
app.use(express.static('public'));

// ===== API ROUTES =====

// Demo routes (public - no auth)
app.use('/api/demo', demoRoutes);

// Doctor routes (with auth/validation/authorization)
app.use('/api', doctorRoutes);

// Appointment routes
app.use('/api', appointmentRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    code: 5,
    message: 'Route not found',
    success: false,
    path: req.path,
    method: req.method
  });
});

// ===== ERROR HANDLER (MUST BE LAST) =====
app.use(errorHandler);

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

module.exports = app;
```

---

## 📚 **COMPLETE ROUTE EXAMPLE**

**File:** `server/routes/doctorRoutes.js`

```javascript
const express = require('express');
const router = express.Router();

// Import controllers
const { 
  getDoctors, 
  getDoctorById,
  getDoctorsByDepartment,
  createDoctor, 
  updateDoctor, 
  deleteDoctor 
} = require('../controllers/doctorController');

// Import middlewares
const isAuthenticated = require('../middleware/isAuthenticated');
const roleBasedAccess = require('../middleware/roleBasedAccess');
const validateDoctor = require('../middleware/validateDoctor');

// ===== PUBLIC ROUTES (no middleware) =====

// Anyone can view all doctors
router.get('/doctors', getDoctors);

// Anyone can view doctors by department
router.get('/doctors/department/:dept', getDoctorsByDepartment);

// Anyone can view specific doctor
router.get('/doctors/:id', getDoctorById);

// ===== PROTECTED ROUTES =====

// Only admin can create doctor
router.post('/doctors',
  isAuthenticated,              // 1. Check if user is logged in
  validateDoctor,               // 2. Validate request data
  roleBasedAccess(['admin']),   // 3. Check if user is admin
  createDoctor                  // 4. Execute controller
);

// Only admin can update doctor
router.put('/doctors/:id',
  isAuthenticated,
  validateDoctor,
  roleBasedAccess(['admin']),
  updateDoctor
);

// Only admin can delete doctor
router.delete('/doctors/:id',
  isAuthenticated,
  roleBasedAccess(['admin']),
  deleteDoctor
);

module.exports = router;
```

---

## 🧪 **TESTING MIDDLEWARE**

### **Test 1: No Token**
```bash
curl http://localhost:5000/api/doctors
# Response: code: 3, message: 'No token provided'
```

### **Test 2: Invalid Token**
```bash
curl -H "Authorization: Bearer invalid-token" http://localhost:5000/api/doctors
# Response: code: 3, message: 'Invalid token format'
```

### **Test 3: Valid Token - Insufficient Permission**
```bash
curl -H "Authorization: Bearer VALID_VIEWER_TOKEN" \
  -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr.A","specialization":"Cardio","department":"Heart"}'
# Response: code: 4, message: 'Access Denied. User role "viewer" is not authorized'
```

### **Test 4: Valid Token - Missing Fields**
```bash
curl -H "Authorization: Bearer VALID_ADMIN_TOKEN" \
  -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr.A"}'
# Response: code: 1, message: 'specialization is required'
```

### **Test 5: Success**
```bash
curl -H "Authorization: Bearer VALID_ADMIN_TOKEN" \
  -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Nguyen Van A",
    "specialization": "Cardiologist",
    "department": "Cardiology",
    "experience": 10
  }'
# Response: code: 0, message: 'Doctor created successfully', data: { ... }
```

---

## 📊 **MIDDLEWARE CHECKLIST**

- [ ] Created `isAuthenticated.js`
- [ ] Created `roleBasedAccess.js`
- [ ] Created `validateDoctor.js`
- [ ] Created `errorHandler.js`
- [ ] Created `logging.js`
- [ ] Updated `index.js` with middleware setup
- [ ] Updated `doctorRoutes.js` with middleware usage
- [ ] Tested all middleware
- [ ] Verified error codes (1-5)
- [ ] Tested with Postman/curl

**Ready to implement? Let's go!** 🚀
