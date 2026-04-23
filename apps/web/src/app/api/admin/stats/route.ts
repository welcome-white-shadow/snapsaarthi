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
    const snapsCollection = db.collection("Snap");

    // Check if user has ADMIN role in DB
    const adminUser = await usersCollection.findOne({ email: adminEmail, role: "ADMIN" });
    
    if (!adminUser) {
      await client.close();
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // 1. Total Metrics
    const totalStudios = await usersCollection.countDocuments({});
    const totalAlbums = await snapsCollection.countDocuments({});
    
    // 2. Plan Distribution
    const freeCount = await usersCollection.countDocuments({ planType: "FREE" });
    const microCount = await usersCollection.countDocuments({ planType: "MICRO" });
    const proCount = await usersCollection.countDocuments({ planType: "PRO" });

    // 3. Growth: New users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newStudios = await usersCollection.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // 4. Revenue Estimation (simplified)
    // Assuming MICRO = 49/mo and PRO = 149/mo
    const estimatedMonthlyRevenue = (microCount * 49) + (proCount * 149);

    await client.close();
    return NextResponse.json({ 
      success: true, 
      stats: {
        totalStudios,
        totalAlbums,
        newStudios,
        estimatedMonthlyRevenue,
        plans: {
          FREE: freeCount,
          MICRO: microCount,
          PRO: proCount
        }
      } 
    });

  } catch (error: any) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
