import { MongoClient } from 'mongodb';

// READ-ONLY CONNECTION STRING
// Share this with other teams - they can ONLY read doctors collection
const uri = "mongodb+srv://demo_viewer:demo123456@cluster0.tke6n1k.mongodb.net/hospital?retryWrites=true&w=majority";

async function testReadOnlyConnection() {
  const client = new MongoClient(uri);
  
  console.log("🔐 Testing MongoDB Read-Only User...\n");
  
  try {
    // Test 1: Connect
    console.log("1️⃣ Connecting to MongoDB...");
    await client.connect();
    console.log("   ✅ Connected successfully!\n");
    
    const db = client.db('hospital');
    
    // Test 2: Read doctors (SHOULD WORK)
    console.log("2️⃣ Testing READ operation (should succeed)...");
    const doctors = await db.collection('doctors').find({}).limit(3).toArray();
    console.log(`   ✅ Read successful! Found ${doctors.length} doctors`);
    console.log("   First doctor:", doctors[0]?.name || "No data");
    console.log("");
    
    // Test 3: Count doctors
    console.log("3️⃣ Testing COUNT operation...");
    const count = await db.collection('doctors').countDocuments({});
    console.log(`   ✅ Total doctors: ${count}\n`);
    
    // Test 4: Query by specialization
    console.log("4️⃣ Testing QUERY with filter...");
    const cardiologists = await db.collection('doctors').find({ 
      specialization: "Cardiologist" 
    }).toArray();
    console.log(`   ✅ Found ${cardiologists.length} Cardiologists\n`);
    
    // Test 5: Try to write (SHOULD FAIL - read-only)
    console.log("5️⃣ Testing WRITE operation (should be blocked)...");
    try {
      await db.collection('doctors').insertOne({ 
        name: "Test Doctor",
        id: 9999
      });
      console.log("   ❌❌❌ DANGER! Write succeeded! User is NOT read-only!");
      console.log("   ❌❌❌ Please check MongoDB Atlas user permissions!");
    } catch (writeError) {
      console.log("   ✅ Write operation blocked correctly!");
      console.log("   ✅ User is READ-ONLY as expected");
      console.log(`   Error: ${writeError.message}\n`);
    }
    
    // Test 6: Try to access other collections (should fail if properly restricted)
    console.log("6️⃣ Testing access to other collections...");
    try {
      const users = await db.collection('users').find({}).limit(1).toArray();
      console.log(`   ⚠️ Can access 'users' collection (${users.length} docs)`);
      console.log("   ⚠️ Consider restricting to 'doctors' collection only!");
    } catch (err) {
      console.log("   ✅ Other collections blocked correctly!");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ READ-ONLY USER TEST COMPLETED!");
    console.log("=".repeat(60));
    console.log("\n📋 Connection String for other teams:");
    console.log(uri);
    console.log("\n📝 They can use this in Node.js/Python/etc.");
    console.log("🔒 They can ONLY read doctors collection");
    console.log("❌ They CANNOT insert/update/delete\n");
    
  } catch (error) {
    console.error("\n❌ Test failed!");
    console.error("Error:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Check if user 'demo_viewer' exists in MongoDB Atlas");
    console.error("2. Check if password is correct");
    console.error("3. Check Network Access (IP whitelist)");
    console.error("4. Check user has 'read' role for 'hospital' database\n");
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

// Run the test
testReadOnlyConnection().catch(console.error);
