# 🏥 HIS-HRM Integration: Employee Health Check Management

## 📋 Overview

**Quy trình quản lý khám sức khỏe định kỳ cho nhân viên** - Tích hợp giữa:
- **HRM** (HR Management): Lập kế hoạch, quản lý danh sách nhân viên
- **HIS** (Hospital Information System): Thực hiện khám, lưu bệnh lý, kết luận

---

## 🔄 Quy Trình Chi Tiết

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEALTH CHECK WORKFLOW                       │
└─────────────────────────────────────────────────────────────────┘

GIAI ĐOẠN 1: LƯỢNG ĐỊNH (HRM)
├─ HR tạo "Health Check Campaign" 
│  ├─ Name: "Annual Health Check 2026"
│  ├─ Start Date: 2026-02-01
│  ├─ End Date: 2026-03-31
│  └─ Type: "Annual" / "Quarterly"
│
├─ Hệ thống tự động check nhân viên "đến hạn khám"
│  ├─ Lấy last_health_check_date từ HIS
│  ├─ So với quy định (12 tháng, 6 tháng, v.v.)
│  └─ Sinh danh sách "employees_to_check"
│
└─ HR xác nhận → gửi sang HIS


GIAI ĐOẠN 2: ĐẠT LỊCH (HRM ↔ HIS Integration)
├─ HIS nhận danh sách nhân viên từ HRM
│
├─ HIS check lịch làm việc bác sĩ nội bộ
│  └─ Các slots khám trống
│
├─ HIS tự động sắp xếp khung giờ khám
│  ├─ Ưu tiên khung giờ không ảnh hưởng công việc
│  ├─ Chia đều tải bác sĩ
│  └─ Tạo Appointment records
│
└─ HIS gửi lịch xác nhận về HRM
   └─ HR gửi email/SMS cho nhân viên


GIAI ĐOẠN 3: THỰC HIỆN (HIS)
├─ Bác sĩ mở HIS → Health Check section
│
├─ Chọn ngày → hiển thị danh sách nhân viên cần khám
│
├─ Với mỗi nhân viên:
│  ├─ Ghi kết quả:
│  │  ├─ Xét nghiệm (máu, nước tiểu, v.v.)
│  │  ├─ Chẩn đoán hình ảnh (X-quang, siêu âm)
│  │  ├─ Kết luận bác sĩ
│  │  └─ Loại sức khỏe (Type 1, 2, 3, 4)
│  │
│  └─ Lưu tại HIS (bảo mật chuyên môn)
│
└─ Đánh dấu "completed"


GIAI ĐOẠN 4: TỔNG HỢP (HIS → HRM)
├─ HIS tạo Health Check Report
│  └─ Loại sức khỏe + Lưu ý vị trí làm việc
│     (KHÔNG gửi chi tiết bệnh lý)
│
├─ Gửi về HRM:
│  ├─ emp_id, emp_name
│  ├─ check_date
│  ├─ health_status (Type 1, 2, 3, 4)
│  └─ restrictions: ["no_height_work", "sit_8h_max", ...]
│
└─ HR cập nhật hồ sơ + phân công công việc


SECURITY MODEL:
├─ HRM: Biết ai cần khám, kết luận phân loại sức khỏe
├─ HIS: Biết chi tiết bệnh lý (bác sĩ sử dụng)
└─ Không có chi tiết bệnh lý được truyền qua HRM
```

---

## 📊 Database Schema

### **HRM Database (HR System - MySQL)**

#### **health_check_campaigns** (Bộ phận HR tạo)
```sql
CREATE TABLE health_check_campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_name VARCHAR(255),          -- "Annual Health Check 2026"
  campaign_type ENUM('Annual', 'Quarterly', 'Special'),
  start_date DATE,
  end_date DATE,
  description TEXT,
  status ENUM('planning', 'scheduled', 'in_progress', 'completed'),
  created_by INT,                      -- HR Manager ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### **health_check_requests** (Danh sách nhân viên cần khám)
```sql
CREATE TABLE health_check_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT,
  employee_id INT,
  employee_name VARCHAR(255),
  department VARCHAR(255),
  last_check_date DATE,                -- Lần khám trước
  due_date DATE,                       -- Hạn khám tiếp theo
  status ENUM('pending', 'scheduled', 'completed', 'skipped'),
  
  -- Linked to HIS
  his_appointment_id INT,              -- Reference to HIS appointment
  
  FOREIGN KEY (campaign_id) REFERENCES health_check_campaigns(id)
);
```

#### **health_check_results** (Kết quả từ HIS)
```sql
CREATE TABLE health_check_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  health_check_request_id INT,
  employee_id INT,
  check_date DATE,
  
  -- Chỉ lưu KẾT LUẬN, không chi tiết bệnh lý
  health_status ENUM('Type_1', 'Type_2', 'Type_3', 'Type_4'),
  -- Type 1: Sức khỏe bình thường
  -- Type 2: Sức khỏe bình thường, có lưu ý nhỏ
  -- Type 3: Có vấn đề sức khỏe, cần theo dõi
  -- Type 4: Không đủ sức khỏe để làm việc
  
  restrictions JSON,                   -- ["no_height_work", "sit_8h_max", ...]
  doctor_conclusion TEXT,              -- Tóm tắt kết luận
  
  -- Link to HIS
  his_health_record_id INT,            -- Reference to HIS detailed record
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (health_check_request_id) REFERENCES health_check_requests(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

---

### **HIS Database (Hospital System - MongoDB)**

#### **health_checks** (Chi tiết khám - chỉ HIS biết)
```javascript
db.health_checks.insertOne({
  _id: ObjectId(),
  
  // Link to HRM
  hrm_appointment_id: 123,
  employee_id: 456,
  employee_name: "Nguyễn Văn A",
  campaign_id: 1,
  
  // Doctors & Schedule
  doctor_id: ObjectId(),
  doctor_name: "Dr. Trần Thị B",
  check_date: "2026-02-10",
  check_time: "09:00 AM",
  
  // Detailed Medical Records (KHÔNG gửi HRM)
  examinations: {
    vital_signs: {
      height: 170,
      weight: 65,
      blood_pressure: "120/80",
      heart_rate: 72,
      temperature: 36.5
    },
    lab_results: {
      blood_test: {
        RBC: 4.5,
        WBC: 7.0,
        Hb: 14.0,
        // ... chi tiết máu
      },
      urine_test: {
        color: "pale yellow",
        // ... chi tiết nước tiểu
      }
    },
    imaging: {
      xray: {
        part: "Chest",
        result: "Normal",
        image_url: "..."
      }
    }
  },
  
  // Doctor's Conclusion (gửi HRM)
  health_status: "Type_2",  // GỬI sang HRM
  restrictions: ["avoid_heavy_lifting"],  // GỬI sang HRM
  doctor_notes: "Huyết áp hơi cao, cần theo dõi",  // Tóm tắt, GỬI
  
  // Detailed Diagnosis (CHỈ lưu HIS)
  detailed_diagnosis: "Tăng huyết áp stage 1, có tiền sử gia đình",
  recommended_treatment: "Tập thể dục, giảm muối, tái khám sau 3 tháng",
  
  // Status
  status: "completed",  // pending, in_progress, completed
  created_at: ISODate(),
  updated_at: ISODate()
});
```

#### **health_check_schedule** (Lịch khám)
```javascript
db.health_check_schedules.insertOne({
  _id: ObjectId(),
  campaign_id: 1,
  hrm_campaign_name: "Annual Health Check 2026",
  
  appointments: [
    {
      appointment_id: ObjectId(),
      employee_id: 456,
      employee_name: "Nguyễn Văn A",
      doctor_id: ObjectId(),
      doctor_name: "Dr. Trần Thị B",
      scheduled_date: "2026-02-10",
      scheduled_time: "09:00 AM",
      status: "confirmed",
      sent_to_hrm: true,
      hrm_sync_date: ISODate("2026-02-05")
    }
  ],
  
  total_employees: 50,
  scheduled_count: 48,
  pending_count: 2,
  
  created_at: ISODate(),
  updated_at: ISODate()
});
```

---

## 🔌 API Endpoints

### **HRM Endpoints** (HR calls these)

#### **1. Create Health Check Campaign**
```http
POST /api/hrm/health-check/campaigns
Content-Type: application/json

{
  "campaign_name": "Annual Health Check 2026",
  "campaign_type": "Annual",
  "start_date": "2026-02-01",
  "end_date": "2026-03-31",
  "description": "Khám sức khỏe định kỳ hàng năm"
}

Response:
{
  "success": true,
  "campaign_id": 1,
  "message": "Campaign created successfully"
}
```

#### **2. Get Employees Due for Health Check**
```http
GET /api/hrm/health-check/due-employees?campaign_id=1

Response:
{
  "success": true,
  "due_employees": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "a@company.com",
      "department": "Engineering",
      "last_check_date": "2025-02-10",
      "due_date": "2026-02-10"
    },
    ...
  ],
  "total": 50
}
```

#### **3. Send Health Check Request to HIS**
```http
POST /api/hrm/health-check/sync-to-his
Content-Type: application/json

{
  "campaign_id": 1,
  "employees": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "a@company.com",
      "department": "Engineering"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Health check requests sent to HIS",
  "his_campaign_id": "abc123"
}
```

#### **4. Receive Health Check Results from HIS**
```http
POST /api/hrm/health-check/receive-results
Content-Type: application/json

{
  "his_campaign_id": "abc123",
  "results": [
    {
      "employee_id": 1,
      "check_date": "2026-02-10",
      "health_status": "Type_2",
      "restrictions": ["avoid_heavy_lifting"],
      "doctor_conclusion": "Huyết áp hơi cao, cần theo dõi"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Health check results received and stored",
  "stored_count": 1
}
```

#### **5. Get Health Check Results**
```http
GET /api/hrm/health-check/results?campaign_id=1&employee_id=1

Response:
{
  "success": true,
  "result": {
    "employee_id": 1,
    "employee_name": "Nguyễn Văn A",
    "check_date": "2026-02-10",
    "health_status": "Type_2",
    "restrictions": ["avoid_heavy_lifting"],
    "doctor_conclusion": "Huyết áp hơi cao, cần theo dõi"
  }
}
```

---

### **HIS Endpoints** (Hospital calls these)

#### **1. Get Health Check Requests from HRM**
```http
GET /api/his/health-check/pending-requests

Response:
{
  "success": true,
  "requests": [
    {
      "hrm_campaign_id": 1,
      "campaign_name": "Annual Health Check 2026",
      "employees": [
        {
          "id": 1,
          "name": "Nguyễn Văn A",
          "department": "Engineering"
        }
      ],
      "total": 50
    }
  ]
}
```

#### **2. Create Health Check Schedule**
```http
POST /api/his/health-check/schedule
Content-Type: application/json

{
  "hrm_campaign_id": 1,
  "appointments": [
    {
      "employee_id": 1,
      "employee_name": "Nguyễn Văn A",
      "doctor_id": "doc1",
      "scheduled_date": "2026-02-10",
      "scheduled_time": "09:00 AM"
    }
  ]
}

Response:
{
  "success": true,
  "his_campaign_id": "abc123",
  "message": "Schedule created successfully",
  "total_scheduled": 50
}
```

#### **3. Submit Health Check Results**
```http
POST /api/his/health-check/results
Content-Type: application/json

{
  "appointment_id": "apt123",
  "employee_id": 1,
  "check_date": "2026-02-10",
  "doctor_id": "doc1",
  
  "health_status": "Type_2",
  "restrictions": ["avoid_heavy_lifting"],
  "doctor_conclusion": "Huyết áp hơi cao, cần theo dõi",
  
  "detailed_diagnosis": "Tăng huyết áp stage 1",
  "recommended_treatment": "Tập thể dục, giảm muối",
  
  "status": "completed"
}

Response:
{
  "success": true,
  "message": "Health check result recorded"
}
```

#### **4. Send Results Back to HRM**
```http
POST /api/his/health-check/sync-to-hrm
Content-Type: application/json

{
  "hrm_campaign_id": 1,
  "results": [
    {
      "employee_id": 1,
      "check_date": "2026-02-10",
      "health_status": "Type_2",
      "restrictions": ["avoid_heavy_lifting"],
      "doctor_conclusion": "Huyết áp hơi cao, cần theo dõi"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Results sent to HRM"
}
```

---

## 🔐 Data Security

### **What HRM Sees:**
✅ Danh sách nhân viên cần khám
✅ Lịch khám (ngày, giờ, bác sĩ)
✅ Kết luận phân loại sức khỏe (Type 1-4)
✅ Lưu ý vị trí làm việc (restrictions)
❌ Chi tiết bệnh lý
❌ Kết quả xét nghiệm chi tiết
❌ Chẩn đoán hình ảnh

### **What HIS Keeps Private:**
✅ Tất cả chi tiết bệnh lý (bác sĩ sử dụng)
✅ Xét nghiệm chi tiết
✅ Chẩn đoán hình ảnh
✅ Điều trị đề nghị
✅ Ghi chú riêng của bác sĩ

---

## 🚀 Implementation Timeline

### **WEEK 1: Database & API Setup**
- [ ] Create HRM database tables
- [ ] Create HIS collections
- [ ] Create HRM endpoints (1-5)
- [ ] Create HIS endpoints (1-4)

### **WEEK 2: Integration Logic**
- [ ] Auto-generate health check requests (cron job)
- [ ] Implement sync mechanism (HRM → HIS)
- [ ] Implement schedule creation (HIS → HRM)
- [ ] Implement result submission (HIS)

### **WEEK 3: UI & Testing**
- [ ] HRM UI: Create campaign, view results
- [ ] HIS UI: Health check form, results entry
- [ ] End-to-end testing
- [ ] Security audit

---

## 📁 File Structure

```
server/
├── health-check/
│  ├── models/
│  │  ├── hrm-health-check.js    # HRM DB schema
│  │  └── his-health-check.js    # HIS DB schema
│  ├── controllers/
│  │  ├── hrm-health-check.js    # HRM logic
│  │  └── his-health-check.js    # HIS logic
│  ├── routes/
│  │  ├── hrm-routes.js          # HRM endpoints
│  │  └── his-routes.js          # HIS endpoints
│  ├── middleware/
│  │  └── sync-middleware.js     # Data sync logic
│  └── jobs/
│     └── auto-sync.js           # Cron jobs
└── config/
   └── health-check-config.js    # Health status types, restrictions
```

---

## 🔄 Sync Mechanism

```javascript
// server/health-check/jobs/auto-sync.js

// EVERY DAY: Auto-generate health check requests
cron.schedule('0 2 * * *', async () => {
  // 1. Get all employees with last_check_date < 12 months ago
  // 2. Create health_check_requests records
  // 3. Call /api/his/health-check/pending-requests
  // 4. Wait for HIS response with schedule
});

// EVERY 2 HOURS: Check HIS for completed results
cron.schedule('0 */2 * * *', async () => {
  // 1. Query HIS for completed health checks
  // 2. Pull results (health_status, restrictions, conclusion)
  // 3. Save to HRM health_check_results
  // 4. Update employee health profile
  // 5. Send email to HR manager
});
```

---

**Tiếp theo: Tôi sẽ tạo API routes và models! 🚀**
