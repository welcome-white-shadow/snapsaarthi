import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";

export async function GET() {
  try {
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    const db = client.db(url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test');
    const config = await db.collection("Config").findOne({ key: "payment_settings" });
    await client.close();

    return NextResponse.json({ 
      success: true, 
      upiId: config?.upiId || "mayurmahajan3399@oksbi" 
    });
  } catch (error) {
    return NextResponse.json({ success: false, upiId: "mayurmahajan3399@oksbi" });
  }
}

export async function POST(request: Request) {
  try {
    const { upiId, adminEmail } = await request.json();

    // Verify Admin
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    const db = client.db(url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test');
    
    const admin = await db.collection("User").findOne({ email: adminEmail, role: "ADMIN" });
    if (!admin) {
      await client.close();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.collection("Config").updateOne(
      { key: "payment_settings" },
      { $set: { upiId, updatedAt: new Date() } },
      { upsert: true }
    );

    await client.close();
    return NextResponse.json({ success: true, message: "UPI ID updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
