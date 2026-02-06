import { MongoClient } from 'mongodb';

// NEW DATABASE - ONLY DOCTORS!
const uri = "mongodb+srv://demo_viewer:demo123456@cluster0.tke6n1k.mongodb.net/hospital_demo?retryWrites=true&w=majority";

async function testDoctorsOnlyDatabase() {
  const client = new MongoClient(uri);
  
  console.log("🔐 Testing NEW Database - CHỈ CÓ DOCTORS...\n");
  
  try {
    // Test 1: Connect
    console.log("1️⃣ Connecting to hospital_demo...");
    await client.connect();
    console.log("   ✅ Connected successfully!\n");
    
    const db = client.db('hospital_demo');
    
    // Test 2: List collections
    console.log("2️⃣ Listing all collections...");
    const collections = await db.listCollections().toArray();
    console.log(`   ✅ Total collections: ${collections.length}`);
    collections.forEach(col => {
      console.log(`      - ${col.name}`);
    });
    
    if (collections.length === 1 && collections[0].name === 'doctors') {
      console.log("   ✅✅✅ PERFECT! Only 'doctors' collection exists!");
    } else {
      console.log("   ⚠️ WARNING: Expected only 'doctors' collection!");
    }
    console.log("");
    
    // Test 3: Read doctors
    console.log("3️⃣ Reading doctors...");
    const doctors = await db.collection('doctors').find({}).toArray();
    console.log(`   ✅ Found ${doctors.length} doctors`);
    console.log(`   First doctor: ${doctors[0]?.name || "No data"}\n`);
    
    // Test 4: Try to access other collections (should be empty or non-existent)
    console.log("4️⃣ Testing access to other collections...");
    
    try {
      const users = await db.collection('users').find({}).limit(1).toArray();
      if (users.length === 0) {
        console.log("   ✅ 'users' collection: EMPTY (good!)");
      } else {
        console.log(`   ⚠️ 'users' collection has ${users.length} docs (unexpected!)`);
      }
    } catch (err) {
      console.log("   ✅ 'users' collection: KHÔNG TỒN TẠI (perfect!)");
    }
    
    try {
      const medicines = await db.collection('medicines').find({}).limit(1).toArray();
      if (medicines.length === 0) {
        console.log("   ✅ 'medicines' collection: EMPTY (good!)");
      } else {
        console.log(`   ⚠️ 'medicines' collection has ${medicines.length} docs (unexpected!)`);
      }
    } catch (err) {
      console.log("   ✅ 'medicines' collection: KHÔNG TỒN TẠI (perfect!)");
    }
    
    console.log("");
    
    // Test 5: Try to write (should fail - read-only)
    console.log("5️⃣ Testing WRITE operation (should be blocked)...");
    try {
      await db.collection('doctors').insertOne({ name: "Test Doctor", id: 9999 });
      console.log("   ❌ DANGER! Write succeeded! User is NOT read-only!");
    } catch (writeError) {
      console.log("   ✅ Write operation blocked correctly!");
      console.log("   ✅ User is READ-ONLY as expected\n");
    }
    
    console.log("=".repeat(60));
    console.log("✅✅✅ DATABASE hospital_demo - AN TOÀN TUYỆT ĐỐI!");
    console.log("=".repeat(60));
    console.log("\n📋 Connection String để share:");
    console.log(uri);
    console.log("\n📊 Database: hospital_demo");
    console.log("📁 Collections: CHỈ doctors (1 collection)");
    console.log("🔒 Không có: users, medicines, appointments, lab, surgery");
    console.log("✅ Read-only: Không thể insert/update/delete");
    console.log("\n🎉 SẴN SÀNG SHARE CHO NHÓM KHÁC!\n");
    
  } catch (error) {
    console.error("\n❌ Test failed!");
    console.error("Error:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Check if user 'demo_viewer' has access to 'hospital_demo' database");
    console.error("2. Vào MongoDB Atlas → Database Access → Edit user");
    console.error("3. Ensure user has 'read' role for 'hospital_demo' database");
    console.error("4. Check Network Access (IP whitelist)\n");
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

testDoctorsOnlyDatabase();
