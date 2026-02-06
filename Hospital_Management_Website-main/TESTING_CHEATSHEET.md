# 🎯 **TESTING QUICK REFERENCE - ONE PAGE CHEAT SHEET**

## **READY? LET'S GO IN 3 STEPS!**

### **STEP 1: START SERVICES (Pick ONE method)**

**Method A: Automated (Windows)**
```powershell
cd Hospital_Management_Website-main
.\START_ALL_SERVICES.ps1
# Sit back - everything starts automatically!
```

**Method B: Manual (All platforms)** - Open 4 Terminals:
```bash
# Terminal 1
cd hr-system/backend
mvn spring-boot:run

# Terminal 2
cd server
npm start

# Terminal 3
cd server
node gateway.mjs

# Terminal 4
cd client
npm start
```

---

### **STEP 2: LOGIN TO PORTAL**

Open browser: **http://localhost:3000**

```
Email:    demo@example.com
Password: demo123

OR click "Try Demo Account" button ← EASIEST!
```

---

### **STEP 3: TEST IT!**

✅ **Dashboard shows?** (User info + 3 service cards)
✅ **Click sync button?** (Should sync HR → Hospital)
✅ **Logout works?** (Returns to login)

**Done!** 🎉

---

## **IF SOMETHING BREAKS:**

| Problem | Fix |
|---------|-----|
| **Can't access localhost:3000** | Check Terminal 4 - Frontend running? |
| **Login fails** | Check Terminal 1 - HR system running? |
| **Dashboard blank** | Check browser console (F12) for errors |
| **Sync button doesn't work** | Check Terminal 3 - Gateway running? |
| **Port already in use** | Change port OR kill existing process |
| **Services won't start** | Run `npm install` in client & server folders |

---

## **AUTOMATED TESTING (Choose One)**

**Windows:**
```powershell
.\TEST_SUITE.ps1
# Will test everything automatically ✓
```

**Mac/Linux:**
```bash
./test-apis.sh
```

**Postman:**
1. Import: `Postman_Unified_Portal.json`
2. Run "Login - Demo Account" first
3. Run all requests to test

---

## **WHAT'S RUNNING**

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Frontend | 3000 | ✅ Should see React | http://localhost:3000 |
| Hospital | 5000 | ✅ Backend API | http://localhost:5000 |
| Gateway | 6000 | ✅ Router | http://localhost:6000/api/gateway/health |
| HR | 8080 | ✅ Java system | http://localhost:8080/swagger-ui.html |

---

## **QUICK API TESTS (Copy & Paste)**

**Health Check:**
```bash
curl http://localhost:6000/api/gateway/health
```

**Login:**
```bash
curl -X POST http://localhost:6000/api/gateway/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'
```

**Get HR Employees (need token from login first):**
```bash
TOKEN="<copy_token_from_login_response>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:6000/api/gateway/hr/employees
```

---

## **SYSTEM WORKING? CHECKLIST**

```
⚡ Services Running
  ☐ Frontend loads (localhost:3000)
  ☐ No "Cannot reach server" errors
  ☐ No JavaScript console errors

🔐 Authentication
  ☐ Can login with demo@example.com / demo123
  ☐ Dashboard appears after login
  ☐ User name shows in header

📊 Dashboard Features
  ☐ Shows user info (name, email, department)
  ☐ Shows 3 service cards (HR, Hospital, Hotel)
  ☐ Shows quick stats
  ☐ Sidebar navigation clickable

🔄 Sync Feature
  ☐ Sync button clickable
  ☐ Shows success message
  ☐ No error in console

🚪 Logout
  ☐ Logout button works
  ☐ Returns to login page
  ☐ Can login again

🎉 ALL CHECKED? YOU'RE GOOD TO GO!
```

---

## **KEY ENDPOINTS TO TEST**

```
# Authentication
POST    /api/gateway/auth/login          (email, password)
GET     /api/gateway/auth/verify         (Bearer token)

# HR System
GET     /api/gateway/hr/employees        (Bearer token)
GET     /api/gateway/hr/departments      (Bearer token)

# Hospital System
GET     /api/gateway/hospital/hr/doctors (Bearer token)
POST    /api/gateway/hospital/hr/doctors (Bearer token)

# Sync
POST    /api/gateway/sync/hr-to-hospital (Trigger sync)
GET     /api/gateway/sync/status         (Get metrics)

# Health
GET     /api/gateway/health              (System status)
```

---

## **ERROR? CHECK THIS ORDER**

1. **Is Terminal 4 running?** 
   - `npm start` in client folder
   
2. **Is Terminal 3 running?**
   - `node gateway.mjs` in server folder

3. **Is Terminal 2 running?**
   - `npm start` in server folder

4. **Is Terminal 1 running?**
   - `mvn spring-boot:run` in hr-system/backend

5. **Are databases running?**
   - MongoDB: `mongod` or Docker
   - MySQL: Check if running

6. **Check npm installs:**
   - `npm install` in server folder
   - `npm install` in client folder

7. **Still broken?**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Close all terminals and restart
   - Check port conflicts (netstat -an | findstr LISTEN)

---

## **PASSWORDS & CREDENTIALS**

```
Demo User:
  Email:    demo@example.com
  Password: demo123

Expected User Info:
  Name:       Demo User
  Department: Engineering
  Role:       EMPLOYEE
  Services:   HR, Hospital, Hotel
```

---

## **DOCUMENTATION**

- 📖 **QUICK_START.md** - Full setup guide
- 📋 **TESTING_GUIDE.md** - Detailed test procedures
- 🏗️ **UNIFIED_PORTAL_ARCHITECTURE.md** - System design
- 📊 **IMPLEMENTATION_SUMMARY.md** - What was built
- ⚙️ **HOSPITAL_API_UPDATE_TESTING.md** - API changes

---

## **SUCCESS INDICATORS**

### ✅ You'll see these if everything works:

**Terminal 1 (HR):**
```
✓ Tomcat initialized with port(s): 8080
✓ Application started
```

**Terminal 2 (Hospital):**
```
✓ Server running on port 5000
✓ MongoDB Connected
```

**Terminal 3 (Gateway):**
```
⚡ Gateway running on port 6000
📡 All systems connected
```

**Terminal 4 (Frontend):**
```
✓ Compiled successfully!
✓ webpack compiled with warnings
```

**Browser:**
```
Login page appears → 
Click demo account → 
Dashboard loads with user info ✓
```

---

## **NEXT STEPS AFTER SUCCESS**

1. ✅ Run full TEST_SUITE.ps1
2. ✅ Test each endpoint with curl/Postman
3. ✅ Try mobile view (DevTools: Ctrl+Shift+M)
4. ✅ Test error scenarios (wrong password, etc.)
5. ✅ Review documentation
6. ✅ Integration with Hotel system
7. ✅ Production deployment

---

## **NEED HELP?**

| Issue | Solution |
|-------|----------|
| Can't login | Check HR system running (Terminal 1) |
| Sync doesn't work | Check Hospital API running (Terminal 2) |
| Gateway errors | Check gateway.mjs config in Terminal 3 |
| Frontend won't load | Check npm start in Terminal 4 |
| Database errors | Start MongoDB/MySQL services |
| Port conflicts | `netstat -an \| findstr LISTEN` |

---

**READY? START WITH STEP 1! 🚀**

---

*Last Updated: Feb 5, 2025 | Status: Ready for Testing ✅*
