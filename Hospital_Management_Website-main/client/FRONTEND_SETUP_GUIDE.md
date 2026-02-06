# 🚀 **FRONTEND PORTAL - SETUP & TESTING GUIDE**

## ✅ **WHAT WAS CREATED**

Em vừa tạo **Unified Portal Frontend** - React app với đầy đủ tính năng login, dashboard, và navigation cho 3 services.

### **Files Created/Updated:**

| File | Status | Purpose |
|------|--------|---------|
| `client/src/services/gatewayService.js` | ✨ New | API service for Gateway communication |
| `client/src/context/AuthContext.js` | ✅ Updated | Auth context for unified portal |
| `client/src/pages/Login.js` | ✅ Updated | Beautiful login page |
| `client/src/pages/Dashboard.js` | ✨ New | Dashboard with 3-service tiles |
| `client/src/styles/Login.css` | ✨ New | Login page styling |
| `client/src/styles/Dashboard.css` | ✨ New | Dashboard styling |
| `client/src/App.js` | ✅ Updated | New routing with AuthProvider |
| `client/.env` | ✨ New | Environment configuration |

---

## 🎨 **FEATURES**

### **1. Login Page**
- ✅ Email/Password authentication
- ✅ Demo account login
- ✅ Beautiful gradient design
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive mobile design

### **2. Dashboard**
- ✅ Welcome message with user info
- ✅ Three service cards (HR, Hospital, Hotel)
- ✅ Service access control (based on user permissions)
- ✅ Data sync button
- ✅ Quick stats
- ✅ Sidebar navigation
- ✅ User profile section
- ✅ Logout functionality

### **3. Authentication System**
- ✅ JWT token storage
- ✅ Automatic login persistence
- ✅ Protected routes
- ✅ Token verification
- ✅ Auto-redirect on logout
- ✅ Error messages

### **4. API Integration**
- ✅ Gateway service layer
- ✅ Request interceptors (add JWT token)
- ✅ Response interceptors (handle errors)
- ✅ Auto-logout on 401
- ✅ Error handling

---

## 📦 **DEPENDENCIES**

### **Already Installed:**
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.6.3",
  "axios": "^1.11.0",
  "lucide-react": "^0.526.0",
  "jwt-decode": "^4.0.0"
}
```

No additional dependencies needed! ✨

---

## 🚀 **SETUP INSTRUCTIONS**

### **Step 1: Install Dependencies**

```bash
cd client
npm install
```

### **Step 2: Configure Environment**

Create/Update `.env` file:

```bash
REACT_APP_GATEWAY_URL=http://localhost:6000/api
REACT_APP_HOSPITAL_URL=http://localhost:5000/api
REACT_APP_HR_URL=http://localhost:8080/api
REACT_APP_HOTEL_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

### **Step 3: Start All Systems**

**Terminal 1: HR System**
```bash
cd hr-system/backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

**Terminal 2: Hospital System**
```bash
cd server
npm start
# Runs on http://localhost:5000
```

**Terminal 3: API Gateway**
```bash
cd server
node gateway.mjs
# Runs on http://localhost:6000
```

**Terminal 4: Frontend Portal**
```bash
cd client
npm start
# Runs on http://localhost:3000
```

---

## 🧪 **TESTING GUIDE**

### **Test 1: Access Login Page**

```
URL: http://localhost:3000/login
Expected: Beautiful login page with email/password fields
```

### **Test 2: Demo Login**

**Click "Try Demo Account" button**

```
Email: demo@example.com
Password: demo123
Expected: Redirects to /dashboard
```

**Note:** Make sure HR System is running on port 8080!

### **Test 3: Dashboard Access**

```
URL: http://localhost:3000/dashboard
Expected: 
- Welcome message
- User info (firstName, lastName, department, role)
- Three service cards (HR, Hospital, Hotel)
- Sidebar navigation
```

### **Test 4: User Profile**

```
Check top-right header:
- User name
- User email
- User role
- Logout button
```

### **Test 5: Service Navigation**

```
Click on each service card:
- HR Management card → service loading state
- Hospital card → service loading state
- Hotel card → service loading state
```

### **Test 6: Data Sync**

```
Click "🔄 Sync HR to Hospital" button
Expected:
- Loading state
- Success/Error message
- Timestamp
```

### **Test 7: Logout**

```
Click "Logout" button in top-right
Expected:
- Clears localStorage
- Redirects to /login
- Login form ready for next user
```

### **Test 8: Persistence (Page Refresh)**

```
1. Login with demo account
2. Refresh browser (Ctrl+R)
3. Expected: Stays on dashboard (automatic re-login)
```

### **Test 9: Token Expiration**

```
1. Login and get token
2. Manually delete authToken from localStorage
3. Try accessing /dashboard
4. Expected: Redirects to /login
```

### **Test 10: Responsive Mobile View**

```
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on iPhone/iPad/Android sizes
Expected:
- Layout adapts correctly
- Sidebar collapses to horizontal scroll
- Cards stack vertically
- Touch-friendly buttons
```

---

## 📝 **API ENDPOINTS USED**

### **Authentication**
```
POST   /gateway/auth/login         ← Login
GET    /gateway/auth/verify        ← Verify token
```

### **Hospital**
```
GET    /gateway/hospital/hr/doctors
POST   /gateway/hospital/hr/doctors
```

### **HR**
```
GET    /gateway/hr/employees
GET    /gateway/hr/departments
```

### **Sync**
```
POST   /gateway/sync/hr-to-hospital
GET    /gateway/sync/status
```

---

## 🔐 **Security Features**

### **1. JWT Token Management**
- Stored in localStorage
- Automatically added to requests
- Auto-logout on 401/403

### **2. Request Interceptor**
```javascript
// Automatically adds token to every request
config.headers.Authorization = `Bearer ${token}`;
```

### **3. Response Interceptor**
```javascript
// Auto-logout if token is invalid
if (error.response?.status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}
```

### **4. Protected Routes**
- Dashboard requires authentication
- Redirects to login if not authenticated

---

## ⚠️ **TROUBLESHOOTING**

### **Issue: "Cannot GET /login"**
```
Solution:
1. Check React app is running on port 3000
2. npm start in client folder
3. Wait for compilation (may take 1-2 mins first time)
```

### **Issue: "Gateway connection refused"**
```
Solution:
1. Check gateway.mjs is running on port 6000
2. node gateway.mjs in server folder
3. Check HR system is running (port 8080)
```

### **Issue: "Login failed - Invalid credentials"**
```
Solution:
1. Ensure HR system is running
2. Check database has demo user
3. Verify email/password match HR system credentials
```

### **Issue: "Cannot find module 'lucide-react'"**
```
Solution:
npm install lucide-react
```

### **Issue: "Dashboard shows blank"**
```
Solution:
1. Check browser console (F12)
2. Check localStorage has authToken
3. Check gateway is responding
```

### **Issue: "CORS error"**
```
Solution:
1. Check CORS is enabled in gateway.mjs
2. Check CORS headers in Hospital API
3. Verify gateway is allowing frontend origin
```

---

## 📊 **DATA FLOW**

```
User Login
   ↓
Login Component → gatewayService.authAPI.login()
   ↓
POST /gateway/auth/login
   ↓
Gateway → HR System (8080)
   ↓
HR returns: { token, user, services }
   ↓
Store in AuthContext + localStorage
   ↓
Redirect to Dashboard
   ↓
Dashboard displays:
  - User info from context
  - Service cards based on services array
  - Sync button for HR→Hospital data
```

---

## 🎯 **NEXT FEATURES TO ADD**

### **Short-term (This Week)**
- [ ] HR Module UI
- [ ] Hospital Module UI
- [ ] Hotel Module UI
- [ ] Service-specific pages

### **Medium-term (Next Week)**
- [ ] Employee management form
- [ ] Doctor booking interface
- [ ] Room reservation system
- [ ] Profile edit page

### **Long-term (Production)**
- [ ] Analytics dashboard
- [ ] Notifications system
- [ ] Real-time updates
- [ ] PWA support
- [ ] Offline mode

---

## 📱 **RESPONSIVE BREAKPOINTS**

```css
Desktop:    >= 1024px  (Full layout)
Tablet:     768-1023px (Collapsible sidebar)
Mobile:     < 768px    (Horizontal nav, stacked cards)
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Development Build**
```bash
npm start
```

### **Production Build**
```bash
npm run build
# Creates optimized build in client/build folder
```

### **Deploy to Production**
```bash
# Option 1: Netlify/Vercel
npm run build
# Upload build folder

# Option 2: Docker
# Use existing Dockerfile (or create one)

# Option 3: Server
# Copy build folder to web server
```

---

## 📋 **QUICK START CHECKLIST**

- [ ] All 4 systems running (HR, Hospital, Gateway, Frontend)
- [ ] .env file configured
- [ ] npm install completed
- [ ] npm start running
- [ ] Login page loads at http://localhost:3000/login
- [ ] Demo login works
- [ ] Dashboard displays
- [ ] User info shows correctly
- [ ] Service cards visible
- [ ] Logout works
- [ ] Page refresh keeps login

---

## ✨ **FEATURES SHOWCASE**

### **Login Page**
- Modern gradient design
- Animated blobs background
- Demo credentials visible
- Three-service icons
- Error messages with icons
- Loading states
- Info panel on desktop

### **Dashboard**
- Personalized welcome
- Quick access cards
- Service icons and descriptions
- Feature lists per service
- Stats section
- Sync button with feedback
- Responsive sidebar
- User profile header

### **Mobile Responsive**
- Auto-layout adjustment
- Touch-friendly buttons
- Horizontal scroll for nav
- Card stacking
- Readable fonts

---

**Frontend Portal is Ready!** 🎉

Next steps:
1. ✅ Test all login flow
2. ⏳ Integrate service modules (HR, Hospital, Hotel)
3. ⏳ Add data visualization
4. ⏳ Deploy to production
