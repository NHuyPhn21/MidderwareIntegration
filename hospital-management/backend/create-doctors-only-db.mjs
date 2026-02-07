import { MongoClient } from 'mongodb';

// Connection strings
const sourceUri = "mongodb+srv://nhathuyphan21_db_user:123@cluster0.tke6n1k.mongodb.net/hospital?retryWrites=true&w=majority";
const targetUri = "mongodb+srv://nhathuyphan21_db_user:123@cluster0.tke6n1k.mongodb.net/hospital_demo?retryWrites=true&w=majority";

async function createDoctorOnlyDatabase() {
  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);
  
  try {
    console.log("🔄 Đang tạo database mới CHỈ CÓ doctors...\n");
    
    // Connect to both databases
    await sourceClient.connect();
    await targetClient.connect();
    
    console.log("1️⃣ Kết nối source database (hospital)...");
    const sourceDb = sourceClient.db('hospital');
    
    console.log("2️⃣ Kết nối target database (hospital_demo)...");
    const targetDb = targetClient.db('hospital_demo');
    
    // Read doctors from source
    console.log("3️⃣ Đọc dữ liệu doctors từ database gốc...");
    const doctors = await sourceDb.collection('doctors').find({}).toArray();
    console.log(`   ✅ Đã đọc ${doctors.length} doctors`);
    
    // Delete existing data in target (if any)
    console.log("4️⃣ Xóa dữ liệu cũ (nếu có)...");
    await targetDb.collection('doctors').deleteMany({});
    console.log("   ✅ Đã xóa dữ liệu cũ");
    
    // Insert doctors to target
    console.log("5️⃣ Copy doctors sang database mới...");
    if (doctors.length > 0) {
      await targetDb.collection('doctors').insertMany(doctors);
      console.log(`   ✅ Đã copy ${doctors.length} doctors`);
    }
    
    // Verify
    console.log("6️⃣ Kiểm tra kết quả...");
    const count = await targetDb.collection('doctors').countDocuments({});
    console.log(`   ✅ Database 'hospital_demo' có ${count} doctors`);
    
    // List all collections in new database
    console.log("7️⃣ Kiểm tra collections trong database mới...");
    const collections = await targetDb.listCollections().toArray();
    console.log(`   ✅ Số collections: ${collections.length}`);
    collections.forEach(col => {
      console.log(`      - ${col.name}`);
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ HOÀN TẤT! Database mới đã được tạo!");
    console.log("=".repeat(60));
    console.log("\n📋 Connection string CHỈ CÓ doctors:");
    console.log("mongodb+srv://demo_viewer:demo123456@cluster0.tke6n1k.mongodb.net/hospital_demo");
    console.log("\n📊 Database: hospital_demo");
    console.log("📁 Collections: ONLY doctors");
    console.log("🔒 Không có: users, medicines, appointments, lab, surgery");
    console.log("\n⚠️ Bước tiếp theo:");
    console.log("1. Vào MongoDB Atlas → Database Access");
    console.log("2. Edit user 'demo_viewer'");
    console.log("3. Thay đổi database từ 'hospital' → 'hospital_demo'");
    console.log("4. Save");
    console.log("\nHoặc tạo user mới cho database 'hospital_demo'\n");
    
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    await sourceClient.close();
    await targetClient.close();
    console.log("Đã đóng kết nối.");
  }
}

createDoctorOnlyDatabase();
