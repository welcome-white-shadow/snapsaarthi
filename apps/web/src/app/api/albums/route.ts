import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Helper for Native MongoDB Client
async function getDb() {
  const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
  const client = new MongoClient(url.split('?')[0]);
  await client.connect();
  const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
  return { db: client.db(dbName), client };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const clientName = formData.get("clientName") as string;
    const clientPhone = formData.get("clientPhone") as string;
    const category = formData.get("category") as string;
    const targetCount = formData.get("targetCount") as string;
    const userId = formData.get("userId") as string;
    const email = formData.get("email") as string;
    const imageFile = formData.get("coverImage") as File | null;

    let targetUserId = userId;
    const { db, client } = await getDb();
    const usersCol = db.collection("User");
    const snapsCol = db.collection("Snap");

    // Fetch user and enforce plan limits
    const dbUser = await usersCol.findOne(
      targetUserId && targetUserId !== "undefined" 
        ? { _id: new ObjectId(targetUserId) } 
        : { email }
    );

    if (!dbUser) {
      if (email) {
        const newUser = await usersCol.insertOne({ 
          email, 
          name: "", 
          studioName: "", 
          studioSize: "solo",
          role: "STUDIO",
          planType: "FREE",
          subscriptionStatus: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date()
        });
        targetUserId = newUser.insertedId.toString();
      } else {
        await client.close();
        return NextResponse.json({ error: "Please log in again" }, { status: 401 });
      }
    } else {
      targetUserId = dbUser._id.toString();
    }

    // Plan Logic Enforcement: Use lifetime count or current count as fallback for old users
    const lifetimeCount = dbUser?.lifetimeAlbums ?? (await snapsCol.countDocuments({ userId: targetUserId }));
    const planType = dbUser?.planType || "FREE";
    const maxAlbums = dbUser?.maxAlbums ?? (planType === "PRO" ? 999999 : (planType === "MICRO" ? 5 : 1));

    if (planType !== "PRO" && lifetimeCount >= maxAlbums) {
      await client.close();
      return NextResponse.json({ 
        error: `Plan Limit Reached (${maxAlbums})! Please upgrade or renew your plan to create more albums.`,
        code: "PLAN_LIMIT_REACHED"
      }, { status: 403 });
    }

    let coverImageUrl = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000";

    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = join(process.cwd(), "public", "uploads");
        
        await mkdir(uploadDir, { recursive: true });
        const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const filePath = join(uploadDir, fileName);
        
        await writeFile(filePath, buffer);
        coverImageUrl = `/uploads/${fileName}`;
        console.log("Cover image uploaded successfully:", coverImageUrl);
      } catch (uploadError) {
        console.error("Image Upload Failed, using default:", uploadError);
        // Keep default coverImageUrl
      }
    }

    const albumData = {
      title: title || "New Project",
      clientName: clientName || "Client",
      clientPhone: clientPhone || null,
      category: category || null,
      coverImage: coverImageUrl,
      targetCount: targetCount ? parseInt(targetCount) : 0,
      status: "Draft",
      userId: targetUserId.toString(), // Force string storage
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await snapsCol.insertOne(albumData);
    
    // Update user's lifetime count
    await usersCol.updateOne(
      { _id: new ObjectId(targetUserId) },
      { $inc: { lifetimeAlbums: 1 } }
    );

    await client.close();

    return NextResponse.json({ success: true, album: { ...albumData, id: result.insertedId.toString() } });
  } catch (error: any) {
    console.error("ALBUM_CREATE_ERROR:", error);
    return NextResponse.json({ error: "Server sync pending. Please try again.", details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || userId === "undefined") {
      return NextResponse.json({ error: "Identity missing" }, { status: 400 });
    }

    const { db, client } = await getDb();
    const snapsCol = db.collection("Snap");
    
    // Defensive query: handle both string and ObjectId if possible
    let query: any = { userId };
    try {
      query = { 
        $or: [
          { userId: userId },
          { userId: new ObjectId(userId) }
        ] 
      };
    } catch (e) {
      // Fallback if userId is not a valid ObjectId
      query = { userId: userId };
    }

    const snaps = await snapsCol.find(query).sort({ createdAt: -1 }).toArray();
    await client.close();

    const albums = snaps.map(snap => ({
      id: snap._id.toString(),
      title: snap.title,
      client: snap.clientName,
      clientPhone: snap.clientPhone,
      category: snap.category,
      status: snap.status,
      cover: snap.coverImage,
      target: snap.targetCount,
      date: new Date(snap.createdAt).toLocaleDateString()
    }));

    return NextResponse.json({ success: true, albums });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
