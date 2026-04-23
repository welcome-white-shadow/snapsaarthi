import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    
    const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
    const db = client.db(dbName);
    const usersCollection = db.collection("User");

    const user = await usersCollection.findOne({ email });

    if (!user) {
       return NextResponse.json({ 
         error: "Account not found. Please register first.",
         needsRegistration: true 
       }, { status: 404 });
    }

    // No password check - everything is OTP based now

    // Device Limit Logic: Prevent sharing
    const plan = user.planType || "FREE";
    const limit = plan === "PRO" ? (parseInt(process.env.SESSION_LIMIT_PRO || "2")) : (parseInt(process.env.SESSION_LIMIT_STUDIO || "1"));
    
    // Cleanup sessions older than 24h
    const now = new Date();
    const activeSessions = (user.activeSessions || []).filter((s: any) => {
       const sessionDate = new Date(s.createdAt);
       return (now.getTime() - sessionDate.getTime()) < 24 * 60 * 60 * 1000;
    });

    if (activeSessions.length >= limit) {
       await client.close();
       return NextResponse.json({ 
         error: `Device Limit Reached! This account is active on ${activeSessions.length} devices. Please logout from another device.`,
         code: "SESSION_LIMIT_REACHED"
       }, { status: 403 });
    }

    const sessionId = Math.random().toString(36).substring(2, 15);
    await usersCollection.updateOne(
       { _id: user._id },
       { 
          $set: { activeSessions: [...activeSessions, { sessionId, createdAt: new Date() }] } 
       }
    );

    await client.close();

    return NextResponse.json({ 
       success: true, 
       user: {
         id: user._id.toString(),
         email: user.email,
         name: user.name,
         studioName: user.studioName,
         studioSize: user.studioSize,
         role: user.role || "STUDIO",
         planType: user.planType || "FREE",
         sessionId // Send sessionId to frontend
       }
    });

  } catch (error: any) {
    console.error("NATIVE Login Error:", error);
    return NextResponse.json({ error: "Failed to login. " + (error.message || "") }, { status: 500 });
  }
}
