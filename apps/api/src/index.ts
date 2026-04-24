import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '@snapsaarthi/database';
// @ts-ignore
import fetch from 'node-fetch';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const port = process.env.PORT || 5011;

app.use(cors());
app.use(express.json());

// Logging Middleware (Taki humein pata chale ki kya request aa rahi hai)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, req.body);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// Login Check (Pehle check karte hain user exists ya nahi)
app.post('/api/login', async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(404).json({ error: "Account not found", needsRegistration: true });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Database error during login check" });
  }
});

app.post('/api/otp', async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const normalizedEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const mailEngineUrl = "https://mail-engine.blinke.in/api/send";
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
        html: `<h1>Your OTP is ${otp}</h1>`
      }),
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post('/api/register', async (req: any, res: any) => {
  const { email, name, studioName } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: { name, studioName },
      create: { email: email.toLowerCase().trim(), name, studioName, role: "USER" }
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.get('/api/dashboard', async (req: any, res: any) => {
  const email = req.query.email as string;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email?.toLowerCase().trim() },
      include: { snaps: true }
    });
    res.json({ success: true, snaps: user?.snaps || [] });
  } catch (error) {
    res.status(500).json({ error: "Dashboard fetch failed" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Master API live on ${port}`);
});
