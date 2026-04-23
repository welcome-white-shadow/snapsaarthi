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
    const { albumId, settings } = await request.json();
    
    if (!albumId) return NextResponse.json({ error: "Missing album ID" }, { status: 400 });

    const { db, client } = await getDb();
    const snapsCol = db.collection("Snap");
    
    await snapsCol.updateOne(
      { _id: new ObjectId(albumId) },
      { $set: { "shareSettings": settings } }
    );
    
    await client.close();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
