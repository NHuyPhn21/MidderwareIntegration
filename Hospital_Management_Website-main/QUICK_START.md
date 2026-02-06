# 🚀 **QUICK START GUIDE - Unified Portal (3 Systems)**

## **In 5 Minutes: Get Everything Running**

### **Step 1: Open 4 Terminal Windows** (2 min)
```
Terminal 1: cd hr-system/backend
Terminal 2: cd server
Terminal 3: cd server
Terminal 4: cd client
```

### **Step 2: Start Services** (3 min)

**Terminal 1 - HR System (Java):**
```bash
mvn spring-boot:run
# Wait for: ✓ Tomcat initialized with port(s): 8080
```

**Terminal 2 - Hospital API:**
```bash
npm start
# Wait for: ✓ Server running on port 5000
```

**Terminal 3 - API Gateway:**
```bash
node gateway.mjs
# Wait for: ⚡ Gateway running on port 6000
```

**Terminal 4 - Frontend:**
```bash
npm start
# Wait for: ✓ Compiled successfully!
# Auto-opens: http://localhost:3000
```

---

## **Testing the Integration**

### **1️⃣ Login Page (http://localhost:3000)**
```
Email: demo@example.com
Password: demo123

OR click "Try Demo Account" button
```

### **2️⃣ Dashboard Features**
- ✓ User info displayed (from HR system)
- ✓ 3 service cards (HR, Hospital, Hotel)
- ✓ Sync button (trigger HR→Hospital sync)
- ✓ Quick stats (department, role, services)
- ✓ Navigation sidebar

### **3️⃣ API Testing (Manual)**

**Check Gateway Health:**
```bash
curl http://localhost:6000/api/gateway/health
```

**Login API:**
```bash
curl -X POST http://localhost:6000/api/gateway/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'
```

**Get HR Employees (with token):**
```bash
TOKEN="<jwt_from_login>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:6000/api/gateway/hr/employees
```

---

## **System Ports & URLs**

| System | Port | URL | Purpose |
|--------|------|-----|---------|
| Frontend | 3000 | http://localhost:3000 | React Portal (Login/Dashboard) |
| Hospital | 5000 | http://localhost:5000 | Hospital API |
| Gateway | 6000 | http://localhost:6000/api | Request Router & Auth |
| HR | 8080 | http://localhost:8080 | Employee Management (Java) |

---

## **Architecture Flow**

```
User Browser (3000)
    ↓ (Email + Password)
    ↓
Frontend Login Component
    ↓ (Calls: POST /api/gateway/auth/login)
    ↓
API Gateway (6000)
    ↓ (Forwards to HR system)
    ↓
HR System (8080)
    ↓ (Returns JWT token + user data)
    ↓
Gateway (Stores token in localStorage)
    ↓
Frontend (Redirects to Dashboard with JWT)
    ↓
User sees Dashboard with:
  • User info (from HR)
  • Service cards (HR, Hospital, Hotel)
  • Sync button (HR→Hospital)
```

---

## **Key Capabilities**

### **✅ Single Sign-On (SSO)**
- Login via HR system credentials
- JWT token issued and stored
- Token valid for all services

### **✅ Data Synchronization**
- HR employees sync to Hospital doctors
- Employee → Doctor mapping
- Sync status tracking

### **✅ Service Integration**
- HR: Employee management
- Hospital: Doctor management
- Hotel: Room booking (coming soon)
- All accessible from unified dashboard

### **✅ Security**
- JWT authentication on all protected endpoints
- Token verification at Gateway
- Auto-logout on 401 response

---

## **Database Requirements**

### **MySQL (HR System)**
- Database: employees_db (or configured)
- Tables: employees, departments
- Sample data: demo@example.com / demo123

### **MongoDB (Hospital System)**
- Database: hospital_db (or configured)
- Collections: doctors, patients, etc.
- Synced from HR employees table

---

## **Common Issues & Fixes**

### **❌ Port Already in Use**
```bash
# Windows - Find process on port
netstat -ano | findstr :6000

# Kill process
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :6000
kill -9 <PID>
```

### **❌ MongoDB Not Running**
```bash
# Windows - Install Docker & run MongoDB
docker run -d -p 27017:27017 mongo

# Check connection
curl http://localhost:27017
```

### **❌ JWT Token Expired**
```bash
# Clear localStorage in DevTools
localStorage.clear()

# Refresh page and login again
```

### **❌ CORS Errors**
- Check gateway.mjs has CORS enabled
- Verify all services running on expected ports
- Check frontend .env has correct REACT_APP_GATEWAY_URL

### **❌ Services Not Connecting**
```bash
# Verify all 4 services running
netstat -an | findstr LISTEN

# Should see ports: 3000, 5000, 6000, 8080

# Check each service:
# HR: http://localhost:8080/swagger-ui.html
# Hospital: http://localhost:5000
# Gateway: http://localhost:6000/api/gateway/health
# Frontend: http://localhost:3000
```

---

## **Testing Checklist**

```
🔐 Authentication
  [ ] Login page loads
  [ ] Demo account login works
  [ ] Invalid credentials fail gracefully
  [ ] Token stored in localStorage
  [ ] Page refresh maintains login

📊 Dashboard
  [ ] User info displays correctly
  [ ] 3 service cards visible
  [ ] Sidebar navigation works
  [ ] Sync button functional
  [ ] Logout works

🔗 Integration
  [ ] Gateway health check passes
  [ ] HR employees accessible
  [ ] Hospital doctors accessible
  [ ] Sync creates/updates doctors
  [ ] Services communicate successfully

📱 Responsive
  [ ] Desktop layout correct
  [ ] Tablet view responsive
  [ ] Mobile layout stacked
  [ ] All buttons accessible
  [ ] No horizontal scrolling

⚠️ Error Handling
  [ ] Invalid token rejected
  [ ] Missing token redirects to login
  [ ] Service offline shows error
  [ ] Network errors handled gracefully
```

---

## **API Reference Quick Links**

### **Authentication**
- `POST /api/gateway/auth/login` - Login with HR credentials
- `GET /api/gateway/auth/verify` - Verify JWT token

### **HR Management**
- `GET /api/gateway/hr/employees` - Get all employees
- `POST /api/gateway/hr/employees` - Create employee
- `GET /api/gateway/hr/departments` - Get departments

### **Hospital Management**
- `GET /api/gateway/hospital/hr/doctors` - Get doctors
- `POST /api/gateway/hospital/hr/doctors` - Create doctor
- `PUT /api/gateway/hospital/hr/doctors/:id` - Update doctor
- `DELETE /api/gateway/hospital/hr/doctors/:id` - Delete doctor

### **Synchronization**
- `POST /api/gateway/sync/hr-to-hospital` - Trigger sync
- `GET /api/gateway/sync/status` - Check sync status

### **System Health**
- `GET /api/gateway/health` - Gateway health
- `GET /api/gateway/systems` - System status

---

## **Automated Testing**

### **PowerShell (Windows)**
```powershell
.\TEST_SUITE.ps1
```

**Output:**
- ✓ Service availability check
- ✓ Gateway health verification
- ✓ Authentication flow test
- ✓ HR integration test
- ✓ Hospital integration test
- ✓ Sync operations test
- ✓ Error handling test

### **Bash (Mac/Linux)**
```bash
chmod +x test-apis.sh
./test-apis.sh
```

### **Postman Collection**
- Import: `Postman_Unified_Portal.json`
- Authenticate: Run "Login - Demo Account" first
- Token auto-stored as `{{jwt_token}}`
- Run full collection for end-to-end test

---

## **Documentation Files**

| File | Purpose |
|------|---------|
| TESTING_GUIDE.md | Comprehensive test scenarios |
| TEST_SUITE.ps1 | Automated PowerShell tests |
| test-apis.sh | Automated Bash tests |
| Postman_Unified_Portal.json | Postman API collection |
| HOSPITAL_API_UPDATE_TESTING.md | Hospital API changes |
| FRONTEND_SETUP_GUIDE.md | Frontend configuration |
| UNIFIED_PORTAL_ARCHITECTURE.md | System design overview |

---

## **Next Steps**

### **Immediate (Now)**
1. ✅ Start all 4 services
2. ✅ Test login with demo@example.com / demo123
3. ✅ Verify dashboard loads correctly
4. ✅ Test sync functionality

### **Short Term (Today)**
- Run full TEST_SUITE.ps1
- Review API responses
- Test error scenarios
- Check mobile responsiveness

### **Medium Term (This Week)**
- Analyze Hotel system
- Integrate Hotel into Gateway
- Test 3-system dashboard
- Performance testing

### **Long Term (This Month)**
- Implement notifications
- Add analytics dashboard
- Deploy to staging
- User acceptance testing

---

## **Support & Troubleshooting**

### **Quick Diagnostics**
```bash
# Check all services running
curl http://localhost:3000       # Frontend
curl http://localhost:5000       # Hospital
curl http://localhost:6000/api/gateway/health   # Gateway
curl http://localhost:8080/swagger-ui.html      # HR
```

### **View Logs**
```bash
# Terminal 1 (HR): Shows Spring Boot startup
# Terminal 2 (Hospital): Shows Express logs
# Terminal 3 (Gateway): Shows routing info
# Terminal 4 (Frontend): Shows React build info
```

### **Reset System State**
```bash
# Clear frontend localStorage
# DevTools → Application → Local Storage → Clear

# Restart all services
# Close all 4 terminals and run again
```

---

## **Demo Credentials**

```
Email:    demo@example.com
Password: demo123

User Info:
- Name: Demo User
- Role: EMPLOYEE
- Department: Engineering
- Services: HR, Hospital, Hotel
```

---

**Ready to rock! Follow the checklist and enjoy the unified portal!** 🎉
