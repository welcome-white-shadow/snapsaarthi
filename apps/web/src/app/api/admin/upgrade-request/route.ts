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
  try {
    const { email, txnId, planName } = await request.json();
    
    if (!email || !txnId) return NextResponse.json({ error: "Missing info" }, { status: 400 });

    const { db, client } = await getDb();
    const usersCol = db.collection("User");
    
    // Mark user as pending upgrade and save transaction id
    await usersCol.updateOne(
      { email },
      { 
        $set: { 
          isPendingUpgrade: true,
          pendingPlanName: planName,
          lastTxnId: txnId,
          upgradeRequestedAt: new Date()
        } 
      }
    );
    
    await client.close();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to request upgrade" }, { status: 500 });
  }
}
