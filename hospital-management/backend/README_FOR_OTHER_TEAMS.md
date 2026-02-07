# 📋 HƯỚNG DẪN CHO NHÓM KHÁC TEST API

## 🎯 **CHÀO MỪNG!**

Đây là API demo của nhóm chúng tôi. Bạn có thể test **MIỄN PHÍ**, **KHÔNG CẦN TOKEN**, chỉ cần mở browser!

### **Dữ liệu bạn được xem:**
- ✅ **Danh sách bác sĩ** (Doctors)
  - Tên bác sĩ
  - Chuyên khoa
  - Khoa làm việc
  - Kinh nghiệm
  - Lịch làm việc

### **Dữ liệu bạn KHÔNG thấy:**
- ❌ Medicines (Thuốc)
- ❌ Appointments (Lịch hẹn)
- ❌ Users (Tài khoản, password)
- ❌ Lab records
- ❌ Surgery records

---

## 🚀 **CÁCH TEST - CỰC KỲ ĐƠN GIẢN!**

### **Cách 1: Dùng Browser (Dễ nhất!)**

Mở browser (Chrome, Edge, Firefox...) và paste các URL sau:

#### **1. Xem tất cả bác sĩ:**
```
http://localhost:5000/api/demo/doctors
```

#### **2. Xem bác sĩ theo ID:**
```
http://localhost:5000/api/demo/doctors/1
http://localhost:5000/api/demo/doctors/2
http://localhost:5000/api/demo/doctors/3
```

#### **3. Xem bác sĩ theo Khoa:**
```
http://localhost:5000/api/demo/doctors/department/Cardiology
http://localhost:5000/api/demo/doctors/department/Neurology
http://localhost:5000/api/demo/doctors/department/Pediatrics
```

#### **4. Xem bác sĩ theo Chuyên khoa:**
```
http://localhost:5000/api/demo/doctors/specialization/Cardiologist
http://localhost:5000/api/demo/doctors/specialization/Neurologist
http://localhost:5000/api/demo/doctors/specialization/Pediatrician
```

#### **5. Xem thông tin API:**
```
http://localhost:5000/api/demo/info
```

---

### **Cách 2: Dùng Postman**

1. Mở Postman
2. Tạo request mới:
   - **Method:** GET
   - **URL:** http://localhost:5000/api/demo/doctors
3. Click **Send**
4. Xem kết quả!

---

### **Cách 3: Dùng cURL (Terminal)**

```bash
# Xem tất cả bác sĩ
curl http://localhost:5000/api/demo/doctors

# Xem bác sĩ ID 1
curl http://localhost:5000/api/demo/doctors/1

# Xem bác sĩ khoa Cardiology
curl http://localhost:5000/api/demo/doctors/department/Cardiology
```

---

### **Cách 4: Dùng JavaScript/Fetch**

```javascript
// Xem tất cả bác sĩ
fetch('http://localhost:5000/api/demo/doctors')
  .then(res => res.json())
  .then(data => {
    console.log('Total Doctors:', data.totalDoctors);
    console.log('Doctors:', data.data);
  });

// Xem bác sĩ ID 1
fetch('http://localhost:5000/api/demo/doctors/1')
  .then(res => res.json())
  .then(data => console.log('Doctor:', data.data));

// Xem bác sĩ khoa Cardiology
fetch('http://localhost:5000/api/demo/doctors/department/Cardiology')
  .then(res => res.json())
  .then(data => console.log('Cardiology Doctors:', data.data));
```

---

## 📊 **RESPONSE FORMAT**

### **Success Response (Code 0):**

```json
{
  "code": 0,
  "message": "Demo: Doctors list for testing by other teams",
  "success": true,
  "totalDoctors": 4,
  "data": [
    {
      "id": 1,
      "name": "Dr. Rahul Mishra",
      "specialization": "Cardiologist",
      "department": "Cardiology",
      "Experience": "10 years",
      "availability": "Mon-Fri, 9AM-5PM"
    },
    {
      "id": 2,
      "name": "Dr. Sarah Lee",
      "specialization": "Neurologist",
      "department": "Neurology",
      "Experience": "8 years",
      "availability": "Tue-Sat, 10AM-6PM"
    }
  ],
  "info": {
    "note": "This is a public demo endpoint",
    "access": "Read-only",
    "visibleData": "Only doctors collection",
    "hiddenData": "Medicines, Appointments, Users, Lab, Surgery"
  }
}
```

### **Error Response (Code 2 - Not Found):**

```json
{
  "code": 2,
  "message": "Doctor with ID 999 not found",
  "success": false
}
```

### **Error Response (Code 5 - Database Error):**

```json
{
  "code": 5,
  "message": "Database error",
  "success": false,
  "error": "Connection timeout"
}
```

---

## 🎓 **DANH SÁCH KHOA & CHUYÊN KHOA CÓ SẴN**

### **Khoa (Departments):**
- Cardiology
- Neurology
- Pediatrics
- Orthopedics
- ENT
- General Medicine

### **Chuyên khoa (Specializations):**
- Cardiologist
- Neurologist
- Pediatrician
- Orthopedic Surgeon
- ENT Specialist
- General Physician

---

## 📝 **VÍ DỤ THỰC TẾ**

### **Scenario 1: Tìm tất cả bác sĩ khoa Tim mạch**

**Request:**
```
GET http://localhost:5000/api/demo/doctors/department/Cardiology
```

**Response:**
```json
{
  "code": 0,
  "message": "Found 2 doctors in Cardiology department",
  "success": true,
  "totalDoctors": 2,
  "department": "Cardiology",
  "data": [
    {
      "id": 1,
      "name": "Dr. Rahul Mishra",
      "specialization": "Cardiologist",
      "department": "Cardiology",
      "Experience": "10 years",
      "availability": "Mon-Fri, 9AM-5PM"
    }
  ]
}
```

---

### **Scenario 2: Xem thông tin bác sĩ cụ thể**

**Request:**
```
GET http://localhost:5000/api/demo/doctors/1
```

**Response:**
```json
{
  "code": 0,
  "message": "Doctor found",
  "success": true,
  "data": {
    "id": 1,
    "name": "Dr. Rahul Mishra",
    "specialization": "Cardiologist",
    "department": "Cardiology",
    "Experience": "10 years",
    "availability": "Mon-Fri, 9AM-5PM"
  }
}
```

---

## 🔒 **BẢO MẬT & GIỚI HẠN**

### **Quyền truy cập:**
- ✅ **Đọc** (Read) - Xem danh sách bác sĩ
- ❌ **Ghi** (Write) - Không thể tạo/sửa/xóa
- ❌ **Xem tables khác** - Chỉ xem doctors

### **Rate Limiting:**
- Không giới hạn request (demo purpose)
- Production: 100 requests/phút

### **CORS:**
- Cho phép tất cả origins
- Production: Chỉ cho phép domains cụ thể

---

## ⚡ **TROUBLESHOOTING**

### **Lỗi: "Cannot connect to server"**
**Nguyên nhân:** Server chưa chạy
**Giải pháp:**
```bash
cd server
node index.js
```

### **Lỗi: "Doctor not found"**
**Nguyên nhân:** ID không tồn tại
**Giải pháp:** Dùng ID từ 1-4 (hoặc xem danh sách trước)

### **Lỗi: "Database error"**
**Nguyên nhân:** MongoDB không kết nối
**Giải pháp:** Liên hệ nhóm chúng tôi

---

## 📞 **LIÊN HỆ & HỖ TRỢ**

### **Cần hỗ trợ?**
- 📧 Email: [your-email@example.com]
- 💬 Zalo: [your-zalo]
- 🐛 Report bug: [GitHub Issues]

### **Góp ý?**
Chúng tôi rất mong nhận được feedback từ các bạn!

---

## 🎯 **TÓM TẮT**

### **URLs để test:**
```
✅ http://localhost:5000/api/demo/doctors
✅ http://localhost:5000/api/demo/doctors/1
✅ http://localhost:5000/api/demo/doctors/department/Cardiology
✅ http://localhost:5000/api/demo/doctors/specialization/Cardiologist
✅ http://localhost:5000/api/demo/info
```

### **Không cần:**
- ❌ Token
- ❌ API Key
- ❌ Authentication
- ❌ Postman (dùng browser cũng được)

### **Chỉ cần:**
- ✅ Browser
- ✅ Internet connection
- ✅ Copy & paste URL

**HAPPY TESTING! 🚀**

---

## 📚 **TÀI LIỆU THAM KHẢO**

- [Full API Documentation](./CREATE_DOCTOR_API_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Project Summary](./PROJECT_SUMMARY.md)

**Cảm ơn các bạn đã test API của chúng tôi! 🙏**
