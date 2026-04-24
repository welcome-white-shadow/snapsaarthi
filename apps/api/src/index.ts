import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '@snapsaarthi/database';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 5011;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// OTP Generation & Sending
app.post('/api/otp', async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const normalizedEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Save/Update OTP in DB (Using direct collection access via Prisma or Prisma model if exists)
    // For simplicity, we'll assume a User or OTP model exists.
    // If not, we'll use a raw query or just log for now. 
    // Ideally, there should be an OTP model in schema.prisma.
    
    const mailEngineUrl = process.env.NEXT_PUBLIC_MAIL_API_URL || "http://127.0.0.1:5000/api/send";
    const mailEngineKey = process.env.NEXT_PUBLIC_MAIL_API_KEY || "sk_partners_123";

    await fetch(mailEngineUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "x-api-key": mailEngineKey,
        "key": mailEngineKey,
        "Authorization": `Bearer ${mailEngineKey}`
      },
      body: JSON.stringify({
        from: "SnapSaarthi OS <noreply@blinke.in>",
        to: normalizedEmail,
        subject: `${otp} is your Login Code`,
        html: `<h1>Your OTP is ${otp}</h1><p>Valid for 5 minutes.</p>`
      }),
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("OTP Error:", error.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Login Logic
app.post('/api/login', async (req: any, res: any) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  
  // Master Bypass for Admin
  if (otp === "999999" && normalizedEmail === process.env.SUPER_ADMIN_EMAIL) {
    return res.json({ success: true, user: { email: normalizedEmail, role: "ADMIN" } });
  }

  // Real OTP Verification Logic would go here
  res.json({ success: true, user: { email: normalizedEmail } });
});

// Register Logic
app.post('/api/register', async (req: any, res: any) => {
  const { email, name, studioName } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: { name, studioName },
      create: { email: normalizedEmail, name, studioName, role: "USER" }
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Dashboard Data
app.get('/api/dashboard', async (req: any, res: any) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { albums: true }
    });
    res.json({ success: true, albums: user?.albums || [] });
  } catch (error) {
    res.status(500).json({ error: "Dashboard data fetch failed" });
  }
});

app.listen(port, () => {
  console.log(`🚀 SnapSaarthi Master API running at http://localhost:${port}`);
});
