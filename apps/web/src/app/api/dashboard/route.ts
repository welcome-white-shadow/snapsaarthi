import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  return handleDashboard(request);
}

export async function POST(request: Request) {
  return handleDashboard(request);
}

async function handleDashboard(request: Request) {
  try {
    let email: string | null = null;
    
    if (request.method === "POST") {
      const body = await request.json();
      email = body.email;
    } else {
      const { searchParams } = new URL(request.url);
      email = searchParams.get("email");
    }

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
    const client = new MongoClient(url.split('?')[0]);
    await client.connect();
    
    const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
    const db = client.db(dbName);
    const usersCol = db.collection("User");
    const snapsCol = db.collection("Snap");

    const rawUser = await usersCol.findOne({ email });
    
    let user: any = null;
    let notifications: any[] = [];
    if (rawUser) {
      // Find snaps associated with user manually
      const snaps = await snapsCol.find({ userId: rawUser._id.toString() }).sort({ createdAt: -1 }).toArray();
      user = { ...rawUser, snaps, id: rawUser._id.toString() };

      const notificationsCol = db.collection("notifications");
      notifications = await notificationsCol.find({ userId: rawUser._id.toString() }).sort({ createdAt: -1 }).limit(5).toArray();
      notifications = notifications.map(n => ({ ...n, id: n._id.toString() }));
    }
    
    await client.close();

    if (!user) {
      return NextResponse.json({ 
        user: null,
        stats: [],
        albums: []
      }, { status: 200 });
    }

    // Unpacking from structured fields instead of JSON
    const albums = (user.snaps || []).map((snap: any) => ({
      id: snap._id ? snap._id.toString() : snap.id,
      title: snap.title,
      client: snap.clientName,
      status: snap.status,
      category: snap.category || "General",
      date: new Date(snap.createdAt).toLocaleDateString(),
      target: snap.targetCount,
      selected: (snap.photos || []).filter((p: any) => p.selected).length,
      cover: snap.coverImage || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
      photos: snap.photos || []
    }));

    return NextResponse.json({ 
      stats: [
        { label: "Active Albums", value: albums.length.toString(), growth: "Real-time", type: "albums" }
      ],
      albums,
      notifications,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "Artist",
        studioName: user.studioName || "Your Studio",
        studioSize: user.studioSize || "Premium Member",
        mobileNumber: user.mobileNumber || "Not set",
        role: user.role || "STUDIO"
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
