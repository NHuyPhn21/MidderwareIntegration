# 🏗️ KIẾN TRÚC TÍCH HỢP 3 HỆ THỐNG

## 📊 **3 NHÓM - 3 HỆ THỐNG**

### **1️⃣ NHÓM BẠN: Quản Lý Bệnh Viện (Hospital Management)**
```
- Bác sĩ (Doctors)
- Lịch hẹn (Appointments)  
- Khám bệnh (Checkups)
- Phòng khám (Departments)
```

### **2️⃣ NHÓM HR: Quản Lý Nhân Sự (HR Management) - CORE**
```
- Nhân viên (Employees)
- Chức vụ (Positions)
- Bộ phận (Departments)
- Lương (Salaries)
- Chấm công (Attendance)
```

### **3️⃣ NHÓM KHÁCH SẠN: Quản Lý Khách Sạn (Hotel Management)**
```
- Phòng (Rooms)
- Đặt phòng (Bookings)
- Khách (Guests)
- Hóa đơn (Bills)
```

---

## 🔗 **QUAN HỆ GIỮA 3 HỆ THỐNG**

```
┌─────────────────┐
│  HR Management  │ (CORE - tất cả phụ thuộc)
│   (Nhân sự)     │
└────────┬────────┘
         │ Employees/Staff
    ┌────┴────┐
    ↓         ↓
┌─────────┐  ┌──────────────┐
│Hospital │  │Hotel Management│
│  Mgmt   │  │  (Khách sạn)   │
└─────────┘  └──────────────┘
    ↑ Doctors = Employees
    ↑ Patients = Guests
```

---

## ❓ **CẦN GIẢI ĐÁP**

### **Về HR Management (CORE):**
1. ✅ Họ có API sẵn chưa?
2. ✅ Database của họ là gì? (MongoDB/MySQL/...)
3. ✅ Connection string?
4. ✅ Có user/password để kết nối không?

### **Về Hotel Management:**
1. ✅ Họ có API sẵn chưa?
2. ✅ Database của họ?
3. ✅ Connection string?
4. ✅ Có user/password không?

### **Về dữ liệu chung:**
1. ✅ Bác sĩ = Nhân viên HR? (Cùng database?)
2. ✅ Khách hôi = Bệnh nhân? (Cùng dữ liệu?)
3. ✅ Phòng khám = Phòng khách sạn? (Cùng database?)

---

## 🎯 **3 CHIẾN LƯỢC TÍCH HỢP**

### **CHIẾN LƯỢC A: API Gateway (Khuyên dùng!)**
```
┌─────────────┐
│ API Gateway │ (Unified API)
└──────┬──────┘
   ┌───┼───┐
   ↓   ↓   ↓
  HR  Hospital Hotel
```

**Ưu điểm:**
- ✅ Tập trung control
- ✅ Dễ quản lý
- ✅ Bảo mật tốt

---

### **CHI战LƯỢC B: Direct Integration**
```
HR ←→ Hospital
↓        ↓
Hospital ←→ Hotel
```

**Ưu điểm:**
- ✅ Đơn giản
- ✅ Nhanh

---

### **CHIẾN LƯỢC C: Message Queue (RabbitMQ/Kafka)**
```
HR ─┐
    ├→ Message Queue → Topic/Events
Hospital ─┤
    │
Hotel ────┘
```

**Ưu điểm:**
- ✅ Real-time sync
- ✅ Scalable

---

## 📋 **BƯỚC TIẾP THEO**

### **NGAY LÚC NÀY:**
1. ✅ Liên hệ nhóm HR: Lấy API docs/connection string
2. ✅ Liên hệ nhóm Hotel: Lấy API docs/connection string
3. ✅ Xác định: Bác sĩ = Employees? Bệnh nhân = Guests?

### **TUẦN SAU:**
1. ✅ Thiết kế database unified
2. ✅ Tạo API Gateway
3. ✅ Viết integration code

---

## 🚀 **CÔNG VIỆC CỤ THỂ**

### **BẠN CẦN CUNG CẤP:**

```javascript
// 1. HR Management Connection
{
  "team": "HR Management",
  "database": "???", // MySQL/MongoDB/...
  "host": "???",
  "port": "???",
  "username": "???",
  "password": "???",
  "database_name": "???",
  "api_url": "???" // Nếu có API sẵn
}

// 2. Hotel Management Connection
{
  "team": "Hotel Management", 
  "database": "???",
  "api_url": "???",
  ...
}

// 3. Data Mapping
{
  "doctors_from_hr_employees": true/false,
  "patients_from_hotel_guests": true/false,
  "shared_departments": true/false
}
```

---

# 🏗️ ARCHITECTURE TÍCH HỢP 3 HỆ THỐNG - 5 NGÀY

## 📋 **THÔNG TIN ĐÃ BIẾT**

| Nhóm | Tech | Status | Database | API |
|------|------|--------|----------|-----|
| **Hospital (Bạn)** | Node.js/Express | ✅ Sẵn sàng | MongoDB | ✅ Có |
| **HR (CORE)** | Java | ✅ Có code | TBD | TBD |
| **Hotel** | ??? | ❓ Chưa biết | TBD | TBD |
| **Database** | - | - | **3 tách biệt** | - |
| **Timeline** | - | - | **5 ngày** | - |
| **Data mapping** | - | - | Doctors ≠ Employees | - |

---

## 🎯 **KIẾN TRÚC TÍCH HỢP**

```
┌──────────────────────────────────────────┐
│        UNIFIED API GATEWAY (Node.js)     │ ← Bạn xây dựng
│  (Điểm trung tâm, tất cả request đi qua)│
└──────┬───────────────────┬──────────────┘
       │                   │
       ↓                   ↓
┌─────────────────┐  ┌──────────────────┐
│   HR System     │  │   Hospital Sys   │
│    (Java API)   │  │   (Node.js API)  │
│   port: ???     │  │   port: 5000     │
│  DB: MySQL/???  │  │   DB: MongoDB    │
└─────────────────┘  └──────────────────┘
       ↑
       │ (To implement later)
       ↓
┌──────────────────────┐
│  Hotel System (???)  │
│  port: ???           │
│  DB: ???             │
└──────────────────────┘
```

---

## 📅 **TIMELINE 5 NGÀY**

### **NGÀY 1: Discovery & Architecture**
- [ ] Lấy API docs từ nhóm HR
- [ ] Lấy API docs từ nhóm Hotel
- [ ] Thiết kế unified schema
- [ ] Tạo API Gateway skeleton

### **NGÀY 2: HR Integration**
- [ ] Viết client để gọi HR Java API
- [ ] Map HR data → Hospital schema
- [ ] Sync employees → doctors (nếu cần)
- [ ] Test endpoints

### **NGÀY 3: Hotel Integration**
- [ ] Lấy API docs Hotel
- [ ] Viết client để gọi Hotel API
- [ ] Map Hotel data → Hospital schema
- [ ] Sync rooms → departments (nếu cần)

### **NGÀY 4: Testing & Optimization**
- [ ] Test 3 hệ thống tích hợp
- [ ] Error handling
- [ ] Performance tuning
- [ ] Security review

### **NGÀY 5: Documentation & Deployment**
- [ ] Viết documentation
- [ ] Deploy to staging
- [ ] Demo với thầy
- [ ] Fix bugs

---

## 🚀 **API GATEWAY STRUCTURE**

### **Routes:**
```
GET  /api/gateway/health                    # Health check
GET  /api/gateway/systems                   # Các hệ thống kết nối

# Hospital endpoints (local)
GET  /api/gateway/hospital/doctors
GET  /api/gateway/hospital/appointments
POST /api/gateway/hospital/checkup

# HR endpoints (proxy → Java)
GET  /api/gateway/hr/employees
GET  /api/gateway/hr/departments
GET  /api/gateway/hr/salaries

# Hotel endpoints (proxy → Hotel API)
GET  /api/gateway/hotel/rooms
GET  /api/gateway/hotel/bookings
GET  /api/gateway/hotel/guests

# Unified/Cross-system
GET  /api/gateway/sync/doctors-employees    # Sync HR → Hospital
GET  /api/gateway/sync/rooms-departments    # Sync Hotel → Hospital
GET  /api/gateway/reports/system-overview   # Report tất cả
```

---

## 💾 **DATABASE SCHEMA (UNIFIED)**

### **Hospital DB (MongoDB)**
```javascript
// Doctors collection
{
  _id: ObjectId,
  id: Number,
  name: String,
  specialization: String,
  department: String,
  Experience: String,
  availability: String,
  // Link to external systems:
  hr_employee_id: String,  // Từ HR system
  hotel_room_id: String,   // Từ Hotel system
  sync_status: String,     // "synced" / "pending" / "error"
  last_sync: Date
}
```

### **HR DB (Java - tạm thời)**
```
Employees:
- emp_id
- emp_name
- department
- position
- salary
- ...
```

### **Hotel DB (TBD)**
```
Rooms:
- room_id
- room_name
- room_type
- price
- ...
```

---

## 🔐 **AUTHENTICATION FLOW**

```
Client
  ↓ Login
  ↓ Nhận Token (JWT)
  ↓
API Gateway
  ↓ Verify token
  ├→ HR API (Forward token / create HR session)
  ├→ Hospital API (Local check)
  └→ Hotel API (Forward token / create Hotel session)
```

---

## 🔄 **DATA SYNC STRATEGY**

### **Option 1: Polling (Mỗi 5 phút)**
```
Gateway ─→ HR API ─→ Lấy employees mới
        ↓
        Insert/Update vào Hospital DB
```

### **Option 2: Event-driven (Real-time)**
```
HR System emit event
   ↓
Gateway receive webhook
   ↓
Update Hospital DB
```

**→ KHUYÊN: Polling (đơn giản, ổn định)**

---

## 📁 **FILE STRUCTURE**

```
server/
├── gateway/
│   ├── index.js              # API Gateway server
│   ├── routes/
│   │   ├── hospital.js       # Local hospital routes
│   │   ├── hr-proxy.js       # Proxy to HR Java API
│   │   ├── hotel-proxy.js    # Proxy to Hotel API
│   │   └── sync.js           # Sync endpoints
│   ├── controllers/
│   │   ├── hr-client.js      # HR API client
│   │   ├── hotel-client.js   # Hotel API client
│   │   └── sync-controller.js# Sync logic
│   ├── models/
│   │   └── sync-log.js       # Sync status tracking
│   └── utils/
│       ├── hr-mapper.js      # Map HR data → Hospital
│       └── hotel-mapper.js   # Map Hotel data → Hospital
├── config/
│   └── systems.js            # 3 systems config
└── tests/
    └── integration.test.js   # 3 systems tests
```

---

## 🔧 **NEXT STEPS**

### **NGAY HÔM NAY:**
1. [ ] Liên hệ nhóm HR: Lấy Java API documentation
   ```
   - Endpoint URL
   - Port
   - Authentication method
   - Sample requests/responses
   - Database type
   ```

2. [ ] Liên hệ nhóm Hotel: Xác nhận họ có code chưa
   ```
   - Họ đã làm xong?
   - Dùng tech gì?
   - Có API chưa?
   - Database gì?
   ```

3. [ ] Tôi sẽ tạo API Gateway skeleton

### **NGÀY MAI (NGÀY 1):**
- [ ] Tạo HR Java API client
- [ ] Tạo sync mechanism
- [ ] Tạo data mapper

---

## 📊 **DEPENDENCIES**

```javascript
// package.json - Thêm vào
"dependencies": {
  "axios": "^1.6.0",           // HTTP client (call HR Java API)
  "node-cache": "^5.1.0",      // Cache sync status
  "bull": "^4.0.0",            // Job queue (for sync)
  "joi": "^17.0.0",            // Validation
  "dotenv": "^16.0.0"          // Environment variables
}
```

---

## ❓ **THÔNG ĐIỆP GỬI 2 NHÓM**

**Gửi cho nhóm HR:**
```
Chào nhóm HR,

Chúng tôi cần tích hợp HR Java API vào hệ thống Hospital.

Bạn có thể cung cấp:

1️⃣ API Documentation:
   - Base URL: ???
   - Port: ???
   - Available endpoints: ???
   - Example requests/responses: ???

2️⃣ Authentication:
   - Method: (Basic/Bearer/Custom) ???
   - Username/Password: ???
   - API Key: ???

3️⃣ Database:
   - Type: (MySQL/PostgreSQL/MongoDB) ???
   - Host: ???
   - Port: ???
   - Database name: ???

4️⃣ Sample Data:
   - Employees list (5 samples)
   - Departments
   - Any important fields

Chúng tôi có 5 ngày để hoàn thành integration.

Cảm ơn!
```

**Gửi cho nhóm Hotel:**
```
Chào nhóm Hotel,

Chúng tôi sẽ tích hợp Hotel system vào Hospital management.

Bạn có thể confirm:

1️⃣ Các bạn đã xong code chưa? (Estimate bao giờ?)
2️⃣ Dùng tech stack gì?
3️⃣ Có REST API chưa?
4️⃣ Database là gì?
5️⃣ Khi nào có thể share API docs?

Cảm ơn!
```

---

## 🎯 **OUTCOME (SAU 5 NGÀY)**

✅ Unified API Gateway (Node.js)  
✅ HR Java Integration working  
✅ Hotel Integration ready (khi họ xong)  
✅ Data sync mechanism  
✅ Full documentation  
✅ Demo ready  

---

**Tiếp theo: Bạn hãy lấy thông tin từ 2 nhóm kia, tôi sẽ bắt đầu code ngay! 🚀**
