# 🎯 **HOSPITAL API UPDATED - SUMMARY**

## ✅ **WHAT WAS UPDATED**

Em vừa update Hospital API để tương thích với **Unified Portal Architecture** (1 Login, 3 Services).

### **Files Modified/Created:**

| File | Status | Purpose |
|------|--------|---------|
| `server/models/doctor.js` | ✅ Updated | Added HR integration fields (hr_employee_id, hr_sync_status, etc.) |
| `server/middleware/verifyHRToken.js` | ✨ New | Verify JWT token from HR system |
| `server/routes/hrIntegrationRoutes.js` | ✨ New | 22+ endpoints for HR-Hospital integration |
| `server/index.js` | ✅ Updated | Registered new HR routes |
| `server/gateway.mjs` | ✅ Updated | Added auth, HR, sync endpoints |

---

## 📡 **NEW ENDPOINTS**

### **Authentication (via Gateway)**
```
POST   /api/gateway/auth/login              ← Login with HR credentials
GET    /api/gateway/auth/verify             ← Verify JWT token
```

### **Hospital - HR Integration**
```
GET    /api/hr/doctors                      ← Get all doctors
GET    /api/hr/doctors/:id                  ← Get doctor by ID
GET    /api/hr/doctors/sync-status/:hrId    ← Check sync status
POST   /api/hr/doctors                      ← Create new doctor
PUT    /api/hr/doctors/:id                  ← Update doctor
DELETE /api/hr/doctors/:id                  ← Delete doctor
GET    /api/hr/departments                  ← Get departments
GET    /api/hr/specializations              ← Get specializations
POST   /api/hr/sync/doctors                 ← Sync from HR employees
GET    /api/hr/sync/status                  ← Get sync overview
```

### **Gateway - Unified Access**
```
GET    /api/gateway/hospital/hr/doctors     ← Hospital doctors via HR auth
POST   /api/gateway/sync/hr-to-hospital     ← Trigger sync
GET    /api/gateway/sync/status             ← Sync status
GET    /api/gateway/hr/employees            ← Get HR employees
GET    /api/gateway/hr/departments          ← Get HR departments
```

---

## 🔄 **FLOW: HR Login → Access Hospital**

```
1. User Login at Gateway
   POST /api/gateway/auth/login
   └─ Calls: HR System (8080)
   └─ Returns: JWT Token

2. User Access Hospital via JWT
   GET /api/gateway/hospital/hr/doctors
   Header: Authorization: Bearer <JWT_TOKEN>
   └─ Gateway verifies token
   └─ Calls: Hospital API (5000)
   └─ Returns: Doctors list

3. Automatic Sync (Optional)
   POST /api/gateway/sync/hr-to-hospital
   └─ Fetches: HR employees from HR System
   └─ Maps: Employee → Doctor
   └─ Stores: In Hospital MongoDB
```

---

## 📊 **NEW DOCTOR MODEL FIELDS**

```javascript
// Existing fields
id, name, specialization, department, Experience, availability, photoUrl

// NEW HR Integration fields
email                       // For HR contact
hr_employee_id             // Link to HR employee
hr_sync_status             // 'synced' | 'pending' | 'failed' | 'manual'
hr_sync_date               // When synced
hr_last_updated            // Last update time
source_system              // 'hospital' | 'hr' | 'manual'
timestamps                 // createdAt, updatedAt
```

---

## 🚀 **QUICK START**

### **Terminal 1: HR System**
```bash
cd ../hr-system/backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### **Terminal 2: Hospital System**
```bash
cd server
npm start
# Runs on http://localhost:5000
```

### **Terminal 3: Gateway**
```bash
cd server
node gateway.mjs
# Runs on http://localhost:6000
```

### **Test Login**
```bash
curl -X POST http://localhost:6000/api/gateway/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

---

## 📝 **MIDDLEWARE LOGIC**

### **verifyHRToken.js**

Verifies JWT token from HR system:

1. Check Authorization header: `Bearer <token>`
2. Try local JWT verification using `JWT_SECRET`
3. If fails, verify with HR system: `GET /api/auth/verify`
4. Attach user info to `req.user`

```javascript
// Usage in any route
app.get('/api/hr/doctors', verifyHRToken, handler);
```

---

## 🔄 **SYNC MECHANISM**

### **How HR Employee Becomes Hospital Doctor**

```
HR Employee (MySQL)
{
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@company.com",
  age: 30,
  department: {name: "Engineering"}
}
        ↓
    [MAP FUNCTION]
        ↓
Hospital Doctor (MongoDB)
{
  id: 101,
  name: "John Doe",
  email: "john@company.com",
  specialization: "General Physician",
  department: "Engineering",
  Experience: "30",  // age → experience
  hr_employee_id: 1,
  hr_sync_status: "synced",
  hr_sync_date: "2026-02-05...",
  source_system: "hr"
}
```

### **Trigger Sync**

```bash
POST /api/gateway/sync/hr-to-hospital
```

**What happens:**
1. Gateway fetches all HR employees
2. Maps employee fields to doctor schema
3. Calls Hospital sync endpoint
4. Hospital creates/updates doctors in MongoDB
5. Returns sync results

---

## ✨ **KEY FEATURES**

### **1. HR-Hospital Integration**
- ✅ Unified login (HR = core)
- ✅ JWT token for all services
- ✅ Doctor sync from HR employees
- ✅ HR employee reference tracking

### **2. Data Mapping**
- firstName + lastName → name
- age → experience
- department → department
- specialization → "General Physician" (default)

### **3. Sync Status Tracking**
- synced: From HR system
- manual: Created in Hospital
- pending: Waiting for sync
- failed: Sync error

### **4. Multiple Access Methods**
- Public: `/api/doctors` (existing)
- HR Auth: `/api/hr/doctors` (requires JWT)
- Gateway: `/api/gateway/hospital/hr/doctors` (unified)

---

## 📋 **TESTING GUIDE**

See: [HOSPITAL_API_UPDATE_TESTING.md](HOSPITAL_API_UPDATE_TESTING.md)

**Quick Tests:**
```bash
# 1. Health check
curl http://localhost:6000/api/gateway/health

# 2. Login
curl -X POST http://localhost:6000/api/gateway/auth/login \
  -d '{"email": "user@example.com", "password": "password123"}'

# 3. Get doctors (with JWT)
curl http://localhost:6000/api/gateway/hospital/hr/doctors \
  -H "Authorization: Bearer <TOKEN>"

# 4. Sync HR to Hospital
curl -X POST http://localhost:6000/api/gateway/sync/hr-to-hospital

# 5. Check sync status
curl http://localhost:6000/api/gateway/sync/status
```

---

## 🎯 **NEXT STEPS**

### **Immediate (Today)**
- [ ] Test all endpoints with Postman
- [ ] Verify HR-Hospital communication
- [ ] Check sync functionality
- [ ] Update environment variables in .env

### **Short-term (This Week)**
- [ ] Create Frontend Portal (React/Vue)
  - Login page
  - Dashboard with 3 modules
  - Doctor/Employee management views
- [ ] Setup CORS properly
- [ ] Add comprehensive error handling
- [ ] Create monitoring/logging

### **Medium-term (Next)**
- [ ] Integrate Hotel System
  - Analyze Hotel code/API
  - Add Hotel routes to gateway
  - Create data mappings
- [ ] Setup auto-sync (cron job)
- [ ] Add role-based access control

### **Long-term (Production)**
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Security audit

---

## 📁 **FILE LOCATIONS**

```
Hospital_Management_Website-main/server/
├── models/
│   └── doctor.js                          ✅ UPDATED
├── middleware/
│   └── verifyHRToken.js                   ✨ NEW
├── routes/
│   └── hrIntegrationRoutes.js              ✨ NEW
├── gateway.mjs                             ✅ UPDATED
├── index.js                                ✅ UPDATED
├── HOSPITAL_API_UPDATE_TESTING.md          ✨ NEW
└── UNIFIED_PORTAL_ARCHITECTURE.md          ✨ NEW
```

---

## 🔐 **SECURITY NOTES**

1. **JWT Token:** Uses `JWT_SECRET` from `.env` (keep secure!)
2. **CORS:** Update to allow gateway origin only
3. **Hospital Access:** Requires HR JWT token (enforced by middleware)
4. **Third-party Access:** HR system uses fixed token in query param
5. **Rate Limiting:** Recommended for production

---

**Hospital API is now HR-compliant!** ✨

Next: Test integration, then integrate Hotel system! 🚀
