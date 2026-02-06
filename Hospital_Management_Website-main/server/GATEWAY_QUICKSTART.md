# 🚀 API GATEWAY - HƯỚNG DẪN CHẠY

## 📋 **FILES**

✅ `gateway.mjs` - API Gateway server (đã tạo)
✅ `INTEGRATION_3_SYSTEMS.md` - Architecture & timeline

---

## 📦 **INSTALL DEPENDENCIES**

```powershell
cd server
npm install axios node-cache bull joi
```

---

## ⚙️ **CONFIG - CẬP NHẬT .env**

Mở file `.env` và thêm:

```env
# GATEWAY
GATEWAY_PORT=6000

# HOSPITAL (Local)
HOSPITAL_API_URL=http://localhost:5000

# HR (Java - từ nhóm HR)
HR_API_URL=http://localhost:8080
HR_USERNAME=admin
HR_PASSWORD=password

# HOTEL (Chờ nhóm Hotel)
HOTEL_API_URL=http://localhost:3000
```

**Thay `admin` / `password` / `localhost:8080` bằng thông tin từ nhóm HR!**

---

## 🎯 **CHẠY**

### **Terminal 1: Hospital API (Local)**
```powershell
node index.js
# Running on port 5000
```

### **Terminal 2: API Gateway**
```powershell
node gateway.mjs
# Running on port 6000
```

---

## ✅ **TEST NGAY**

### **1. Health Check:**
```
http://localhost:6000/api/gateway/health
```

### **2. Check Systems Status:**
```
http://localhost:6000/api/gateway/systems
```

### **3. Get Hospital Doctors (qua Gateway):**
```
http://localhost:6000/api/gateway/hospital/doctors
```

### **4. Get HR Employees (qua Gateway → Java):**
```
http://localhost:6000/api/gateway/hr/employees
```

---

## 📞 **NGAY LÚC NÀY - CẦN LÀM**

### **GỬI CHO NHÓM HR:**

```
Chào nhóm HR,

Chúng tôi xây dựng API Gateway để tích hợp 3 hệ thống.

📋 CẦN CẤP CỨNG:

1️⃣ API Documentation:
   ✅ Base URL & Port
   ✅ Available endpoints (list ra)
   ✅ Example requests & responses
   ✅ Authentication method

2️⃣ Database Info:
   ✅ Database type (MySQL/PostgreSQL/...)
   ✅ Host
   ✅ Port
   ✅ Database name

3️⃣ Sample Data:
   ✅ 5 sample employees
   ✅ Departments
   ✅ Important fields

4️⃣ Test Credentials:
   ✅ Username: ???
   ✅ Password: ???

NGAY HÔM NAY CÓ ĐƯỢC KO?
```

### **GỬI CHO NHÓM HOTEL:**

```
Chào nhóm Hotel,

Chúng tôi cần tích hợp Hotel system vào Hospital management.

❓ Questions:

1️⃣ Các bạn xong code chưa? (Estimate bao giờ?)
2️⃣ Tech stack?
3️⃣ Có REST API không?
4️⃣ Database gì?
5️⃣ Khi nào share API docs được?

Chúng tôi có 5 ngày deadline!
```

---

## 📊 **TIMELINE CẬP NHẬT**

### **NGÀY 1 (NGAY HÔM NAY):**
- [x] Tạo API Gateway skeleton
- [x] Tạo Hospital endpoints proxy
- [x] Tạo HR endpoints proxy
- [ ] Lấy info từ nhóm HR
- [ ] Lấy info từ nhóm Hotel

### **NGÀY 2:**
- [ ] Update HR config
- [ ] Test HR integration
- [ ] Update Hospital integration
- [ ] Create data mapper

### **NGÀY 3:**
- [ ] Nhận info từ Hotel
- [ ] Implement Hotel proxy
- [ ] Test Hotel integration

### **NGÀY 4:**
- [ ] Integration testing
- [ ] Error handling
- [ ] Performance tuning

### **NGÀY 5:**
- [ ] Documentation
- [ ] Demo
- [ ] Final fixes

---

## 🔗 **API ENDPOINTS (Gateway)**

### **Health & Status:**
```
GET  /api/gateway/health              # Gateway health
GET  /api/gateway/systems             # Tất cả systems status
```

### **Hospital:**
```
GET  /api/gateway/hospital/doctors
GET  /api/gateway/hospital/doctors/department/:dept
```

### **HR:**
```
GET  /api/gateway/hr/employees
GET  /api/gateway/hr/departments
```

### **Hotel:**
```
GET  /api/gateway/hotel/rooms         # (Chờ nhóm Hotel)
```

### **Sync & Reports:**
```
POST /api/gateway/sync/hr-to-hospital # Sync data
GET  /api/gateway/reports/system-overview
```

---

## 🔧 **TROUBLESHOOTING**

### **Lỗi: "Cannot connect to HR"**
- [ ] Check HR API is running on port 8080
- [ ] Check username/password correct
- [ ] Check firewall/network access

### **Lỗi: "Cannot connect to Hotel"**
- [ ] Hotel API chưa ready
- [ ] Chờ nhóm Hotel

### **Lỗi: CORS**
- [ ] Thêm CORS middleware vào gateway nếu cần

---

## 📝 **NEXT ACTIONS**

1. **Ngay hôm nay:**
   - [ ] Copy messages trên cho 2 nhóm
   - [ ] Chạy gateway test
   - [ ] Đợi replies

2. **Khi nhận replies:**
   - [ ] Update .env
   - [ ] Test từng system
   - [ ] Fix issues

3. **Days 2-5:**
   - [ ] Follow timeline ở trên

---

**Bạn sẵn sàng chưa? 🚀**
