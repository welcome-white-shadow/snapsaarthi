import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    
    const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
    const db = client.db(dbName);
    const usersCollection = db.collection("User");

    await usersCollection.updateOne(
      { email: "admin@snapsaarthi.com" },
      { 
        $set: { 
          email: "admin@snapsaarthi.com", 
          role: "ADMIN", 
          name: "SnapSaarthi Admin", 
          studioName: "SnapSaarthi HQ",
          createdAt: new Date() 
        } 
      },
      { upsert: true }
    );

    await client.close();
    return NextResponse.json({ success: true, message: "Admin account seeded successfully. Use admin@snapsaarthi.com and OTP 123456 to login." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
