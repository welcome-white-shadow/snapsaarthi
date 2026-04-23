import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  try {
    const { email, name, studioName, studioSize, mobileNumber } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!mobileNumber) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    // Connect to Standalone MongoDB natively (Bypassing Prisma's Replica Set lock!)
    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    // Ensure we parse the base URL properly
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    
    // Connect to specific snapping database (database name usually extracted from URL, fallback to snapsaarthi)
    const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
    const db = client.db(dbName);
    const usersCollection = db.collection("User"); // Prisma defaults to exact model name

    // Check if user exists by email OR mobile number
    let existingUser = await usersCollection.findOne({ 
      $or: [{ email }, { mobileNumber }] 
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Mobile number";
      await client.close();
      return NextResponse.json({ error: `${field} is already registered! Please log in instead.` }, { status: 409 });
    }

    // Insert new user
    const newUser = {
      email,
      mobileNumber,
      name: name || "",
      studioName: studioName || "",
      studioSize: studioSize || "solo",
      role: email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL?.toLowerCase() ? "ADMIN" : "STUDIO",
      planType: email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL?.toLowerCase() ? "PRO" : "FREE",
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
