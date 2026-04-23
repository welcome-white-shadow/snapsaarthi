import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

async function getDb() {
  const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
  const client = new MongoClient(url.split('?')[0]);
  await client.connect();
  const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
  return { db: client.db(dbName), client };
}

export async function POST(request: Request) {
  try {
    const { name, studioName, mobile, email } = await request.json();
    
    const { db, client } = await getDb();
    const leadsCol = db.collection("DemoLead");
    
    await leadsCol.insertOne({
      name,
      studioName,
      mobile,
      email,
      status: "NEW",
      createdAt: new Date()
    });
    
    await client.close();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to book demo" }, { status: 500 });
  }
}
