import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, subject, message } = await request.json();
    
    console.log(`[OTP] Dispatching real-time email via Mail Engine to: ${to}`);

    // Using the User's Production Mail Engine
    const mailEngineUrl = process.env.NEXT_PUBLIC_MAIL_API_URL || "https://mail-engine.blinke.in/api/send";
    const mailEngineKey = process.env.NEXT_PUBLIC_MAIL_API_KEY || "sk_partners_123";

    const response = await fetch(mailEngineUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": mailEngineKey,
        "key": mailEngineKey, // Alternative for some engines
        "Authorization": `Bearer ${mailEngineKey}`,
      },
      body: JSON.stringify({
        from: "SnapSaarthi <noreply@snapsaarthi.com>",
        to: to,
        subject: subject,
        html: message,
        message: message, 
        body: message, 
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Mail Engine Critical Failure:", {
        status: response.status,
        statusText: response.statusText,
        errorData: data
      });
      return NextResponse.json({ 
        error: "Email delivery system currently unavailable. Verification paused." 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("OTP Route Critical Error:", error);
    return NextResponse.json({ error: "Internal system failure" }, { status: 500 });
  }
}
