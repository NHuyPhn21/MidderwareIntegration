import { MongoClient } from 'mongodb';

// NHÓM KHÁC - Connection String
const otherTeamUri = "mongodb+srv://user_posts:240605nvn@echodatabase.6mu4qyz.mongodb.net/?retryWrites=true&w=majority";

async function exploreOtherTeamDatabase() {
  const client = new MongoClient(otherTeamUri);
  
  console.log("🔍 KHÁM PHÁ DATABASE CỦA NHÓM KHÁC...\n");
  
  try {
    // Test connection
    console.log("1️⃣ Kết nối tới database của nhóm khác...");
    await client.connect();
    console.log("   ✅ Kết nối thành công!\n");
    
    // List all databases
    console.log("2️⃣ Liệt kê tất cả databases...");
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    console.log(`   ✅ Tổng số databases: ${databases.databases.length}`);
    databases.databases.forEach(db => {
      console.log(`      - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    console.log("");
    
    // Explore each database
    for (const dbInfo of databases.databases) {
      if (dbInfo.name === 'admin' || dbInfo.name === 'local' || dbInfo.name === 'config') {
        continue; // Skip system databases
      }
      
      console.log(`3️⃣ Khám phá database: ${dbInfo.name}`);
      const db = client.db(dbInfo.name);
      
      const collections = await db.listCollections().toArray();
      console.log(`   📁 Collections: ${collections.length}`);
      
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments({});
        console.log(`      - ${col.name}: ${count} documents`);
        
        // Sample 1 document
        if (count > 0) {
          const sample = await db.collection(col.name).findOne({});
          console.log(`        Sample:`, JSON.stringify(sample, null, 2).split('\n').slice(0, 5).join('\n'));
        }
      }
      console.log("");
    }
    
    console.log("=".repeat(60));
    console.log("✅ KHÁM PHÁ HOÀN TẤT!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ Lỗi kết nối!");
    console.error("Error:", error.message);
    
    if (error.message.includes("Authentication failed")) {
      console.error("\n🔧 Username hoặc password sai!");
      console.error("   - Username: user_posts");
      console.error("   - Password: 240605nvn");
      console.error("   - Kiểm tra lại credentials với nhóm khác");
    }
    
    if (error.message.includes("IP") || error.message.includes("whitelist")) {
      console.error("\n🔧 IP chưa được whitelist!");
      console.error("   - Yêu cầu nhóm khác add IP của bạn");
      console.error("   - Hoặc cho phép 0.0.0.0/0 (tất cả IP)");
    }
    
    console.error("\n");
  } finally {
    await client.close();
    console.log("Connection closed.\n");
  }
}

exploreOtherTeamDatabase();
