import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  try {
    const adminEmail = request.headers.get("x-admin-email");
    
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    
    const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
    const db = client.db(dbName);
    const usersCollection = db.collection("User");

    // Check if user has ADMIN role in DB
    const adminUser = await usersCollection.findOne({ email: adminEmail, role: "ADMIN" });
    
    if (!adminUser) {
      await client.close();
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const snapsCollection = db.collection("Snap");

    // Fetch all users (Studios)
    const users = await usersCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    // Fetch some basic stats for each user
    const studiosWithStats = await Promise.all(users.map(async (user) => {
      const snapCount = await snapsCollection.countDocuments({ userId: user._id });
      return {
        id: user._id.toString(),
        email: user.email,
        mobileNumber: user.mobileNumber || "N/A",
        name: user.name || "N/A",
        studioName: user.studioName || "N/A",
        studioSize: user.studioSize || "solo",
        createdAt: user.createdAt,
        totalAlbums: snapCount,
        planType: user.planType || "FREE",
        isPendingUpgrade: user.isPendingUpgrade || false,
        lastTxnId: user.lastTxnId || "",
        maxAlbums: user.maxAlbums || (user.planType === 'MICRO' ? 5 : (user.planType === 'PRO' ? 999999 : 1))
      };
    }));

    await client.close();
    return NextResponse.json({ success: true, studios: studiosWithStats });

  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 });
  }
}
