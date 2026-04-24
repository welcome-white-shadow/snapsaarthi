import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const { name, studioName, studioSize, mobileNumber } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    
    // Improved database resolution
    const dbName = url.includes('snapsaarthi') ? 'snapsaarthi' : 'test';
    const db = client.db(dbName);
    const usersCollection = db.collection("User");

    // Case-insensitive check (though we store lowercase, we check for both to be safe)
    let existingUser = await usersCollection.findOne({ 
      $or: [
        { email: email }, 
        { mobileNumber: mobileNumber }
      ] 
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Mobile number";
      await client.close();
      return NextResponse.json({ error: `${field} is already registered! Please log in instead.` }, { status: 409 });
    }

    const newUser = {
      email: email,
      mobileNumber,
      name: name || "",
      studioName: studioName || "",
      studioSize: studioSize || "solo",
      role: email === process.env.SUPER_ADMIN_EMAIL?.toLowerCase() ? "ADMIN" : "STUDIO",
      planType: email === process.env.SUPER_ADMIN_EMAIL?.toLowerCase() ? "PRO" : "FREE",
      subscriptionStatus: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    await client.close();

    return NextResponse.json({ 
      success: true, 
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
        studioName: newUser.studioName,
        studioSize: newUser.studioSize
      }
    });

  } catch (error: any) {
    console.error("NATIVE Registration Error:", error);
    return NextResponse.json({ error: "Failed to create account. " + error.message }, { status: 500 });
  }
}
