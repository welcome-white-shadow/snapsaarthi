const { MongoClient } = require("mongodb");

async function createAdmin() {
  const url = "mongodb://localhost:27017/snapsaarthi";
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    const db = client.db("snapsaarthi");
    const users = db.collection("User");

    const adminEmail = "superadmin@snapsaarthi.com";
    
    // Check if exists
    const existing = await users.findOne({ email: adminEmail });
    if (existing) {
      await users.updateOne({ email: adminEmail }, { $set: { role: "ADMIN" } });
      console.log("Admin role updated for existing user:", adminEmail);
    } else {
      const result = await users.insertOne({
        email: adminEmail,
        name: "Super Admin",
        studioName: "SnapSaarthi HQ",
        mobileNumber: "0000000000",
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Super Admin created with ID:", result.insertedId);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

createAdmin();
