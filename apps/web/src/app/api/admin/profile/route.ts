import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  try {
    const { oldEmail, newEmail, name, password } = await request.json();

    if (!oldEmail || !newEmail) {
      return NextResponse.json({ error: "Email configuration missing. Refresh and try again." }, { status: 400 });
    }

    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    const client = new MongoClient(url);
    await client.connect();
    
    // Explicitly target the database
    const dbName = "snapsaarthi"; 
    const db = client.db(dbName);
    const usersCollection = db.collection("User");

    // Case-insensitive check for the admin account
    const admin = await usersCollection.findOne({ 
      email: { $regex: new RegExp(`^${oldEmail}$`, 'i') }, 
      role: "ADMIN" 
    });

    if (!admin) {
      console.error("ADMIN_NOT_FOUND:", oldEmail);
      await client.close();
      return NextResponse.json({ error: "Admin synchronization failed. Relogin and try." }, { status: 403 });
    }

    const updateData: any = { 
       email: newEmail, 
       name: name || admin.name, 
       updatedAt: new Date() 
    };
    
    if (password && password.trim() !== "") {
       updateData.password = password;
    }

    await usersCollection.updateOne(
      { _id: admin._id },
      { $set: updateData }
    );

    await client.close();
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("ADMIN_PROFILE_UPDATE_CRITICAL_ERROR:", error);
    return NextResponse.json({ error: "System sync pending: " + (error.message || "Unknown Error") }, { status: 500 });
  }
}
