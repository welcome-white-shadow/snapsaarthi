import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

async function getDb() {
  const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
  const client = new MongoClient(url.split('?')[0]);
  await client.connect();
  const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
  return { db: client.db(dbName), client };
}

export async function POST(request: Request, { params }: { params: any }) {
  try {
    const resolvedParams = await params;
    
    const { db, client } = await getDb();
    const snapsCol = db.collection("Snap");
    
    const album = await snapsCol.findOne({ _id: new ObjectId(resolvedParams.id) });
    
    // Change album status to Submitted
    await snapsCol.updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      { $set: { status: "Submitted", submittedAt: new Date() } }
    );

    // Create Notification for the photographer
    const notificationsCol = db.collection("notifications");
    await notificationsCol.insertOne({
      albumId: resolvedParams.id,
      albumTitle: album?.title || "Unknown Album",
      message: `Client ${album?.clientName || 'someone'} has finalized their photo selection.`,
      type: "selection_finalized",
      read: false,
      createdAt: new Date(),
      userId: album?.userId // Link to the photographer
    });
    
    await client.close();

    return NextResponse.json({ success: true, message: "Selections locked" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to submit selections." }, { status: 500 });
  }
}
