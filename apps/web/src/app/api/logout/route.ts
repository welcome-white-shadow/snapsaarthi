import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { userId, sessionId } = await request.json();

    if (!userId || !sessionId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    
    const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
    const db = client.db(dbName);
    const usersCollection = db.collection("User");

    // Remove the specific session from activeSessions array
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $pull: { activeSessions: { sessionId: sessionId } } 
      } as any
    );

    await client.close();
    return NextResponse.json({ success: true, message: "Logged out from this device." });

  } catch (error: any) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
