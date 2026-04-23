import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

async function getDb() {
  const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
  const client = new MongoClient(url.split('?')[0]);
  await client.connect();
  const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
  return { db: client.db(dbName), client };
}

export async function POST(request: Request) {
  const { client, db } = await getDb();
  try {
    const body = await request.json();
    const { userId, newPlan, adminEmail, maxAlbums } = body;

    // Verify Admin Status
    const usersCol = db.collection("User");
    const adminUser = await usersCol.findOne({ email: adminEmail });
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      await client.close();
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const updateData: any = { 
      planType: newPlan,
      isPendingUpgrade: false,
      lastTxnId: "",
      updatedAt: new Date()
    };
    
    if (maxAlbums) {
      updateData.maxAlbums = parseInt(maxAlbums);
    }

    // Update Plan
    const result = await usersCol.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Plan updated to ${newPlan} with maxAlbums ${maxAlbums || 'default'}` });

  } catch (error: any) {
    await client.close();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
