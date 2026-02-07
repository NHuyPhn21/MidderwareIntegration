# 🚀 NGROK QUICK START - CHẠY NGAY!

## ⚡ **3 BƯỚC NHANH NHẤT**

### **Bước 1: Download ngrok**
```powershell
# Vào: https://ngrok.com/download
# Download → Giải nén → Copy ngrok.exe vào thư mục server này
```

### **Bước 2: Lấy authtoken**
```powershell
# Vào: https://dashboard.ngrok.com/get-started/your-authtoken
# Copy token → Chạy lệnh sau (thay YOUR_TOKEN):

.\ngrok.exe config add-authtoken YOUR_TOKEN_HERE
```

### **Bước 3: Chạy!**

**Terminal 1 (Server):**
```powershell
node index.js
```

**Terminal 2 (ngrok):**
```powershell
.\ngrok.exe http 5000
```

**Xong! Copy URL từ ngrok và share cho nhóm khác!**

---

## 📋 **COPY PASTE TEMPLATE**

### **Message gửi nhóm khác:**

```
Chào nhóm [Tên],

Link demo API (có hiệu lực 2 giờ):

🔗 URLs:
https://[YOUR-NGROK-URL]/api/demo/doctors
https://[YOUR-NGROK-URL]/api/demo/doctors/1
https://[YOUR-NGROK-URL]/api/demo/doctors/department/Cardiology
https://[YOUR-NGROK-URL]/api/demo/info

📝 Cách test:
- Mở browser → paste URL → Enter
- Không cần token
- Lần đầu click "Visit Site" (ngrok warning)

⏰ Test time: Hôm nay [giờ bắt đầu] - [giờ kết thúc]

Nhóm chúng tôi!
```

---

## 🎯 **MONITORING**

Mở browser:
```
http://127.0.0.1:4040
```

Xem tất cả requests realtime!

---

## ⚠️ **LƯU Ý**

- ✅ Giữ 2 terminal chạy
- ✅ Không tắt máy
- ✅ URL thay đổi mỗi lần restart
- ✅ Free: 40 requests/phút (đủ dùng)

**Chi tiết đầy đủ:** Xem file [HUONG_DAN_NGROK.md](./HUONG_DAN_NGROK.md)

**DONE! 🚀**
