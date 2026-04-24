import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  try {
    const { email, type } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Connect to DB
    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    const db = client.db(url.includes('snapsaarthi') ? 'snapsaarthi' : 'test');
    
    // Save OTP to DB with 5-minute expiry
    await db.collection("OTP").updateOne(
      { email: normalizedEmail },
      { $set: { code: otp, createdAt: new Date() } },
      { upsert: true }
    );

    const emailHtml = `
      <div style="background-color: #020202; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #1e1b4b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px; font-style: italic;">SnapSaarthi <span style="color: #4f46e5;">OS</span></h1>
        </div>
        <div style="background-color: #0a0a0a; border: 1px solid #ffffff10; padding: 30px; border-radius: 24px; text-align: center;">
          <p style="color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; margin-bottom: 10px;">Verification Code</p>
          <h2 style="font-size: 48px; font-weight: 900; color: #ffffff; margin: 0; letter-spacing: 5px;">${otp}</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">Use this code to verify your identity and access your studio command center.</p>
        </div>
      </div>
    `;

    // Dispatch via Mail Engine
    const mailEngineUrl = process.env.NEXT_PUBLIC_MAIL_API_URL || "https://mail-engine.blinke.in/api/send";
    const mailEngineKey = process.env.NEXT_PUBLIC_MAIL_API_KEY || "sk_partners_123";

    await fetch(mailEngineUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": mailEngineKey },
      body: JSON.stringify({
        from: "SnapSaarthi <noreply@snapsaarthi.com>",
        to: normalizedEmail,
        subject: `${otp} is your Login Code`,
        html: emailHtml
      }),
    });

    await client.close();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("OTP_ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// Add a verification endpoint in the same file or a separate one
export async function PUT(request: Request) {
  try {
    const { email, code } = await request.json();
    const normalizedEmail = email.toLowerCase().trim();

    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    const db = client.db(url.includes('snapsaarthi') ? 'snapsaarthi' : 'test');

    const record = await db.collection("OTP").findOne({ email: normalizedEmail });
    
    if (!record || record.code !== code) {
      await client.close();
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Check if expired (5 minutes)
    const age = (new Date().getTime() - new Date(record.createdAt).getTime()) / (1000 * 60);
    if (age > 5) {
      await db.collection("OTP").deleteOne({ email: normalizedEmail });
      await client.close();
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    await db.collection("OTP").deleteOne({ email: normalizedEmail });
    await client.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
  }
}
