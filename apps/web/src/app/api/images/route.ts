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
    const albumId = formData.get("albumId") as string;
    
    if (!albumId) return NextResponse.json({ error: "Missing album ID" }, { status: 400 });

    const files = formData.getAll("images") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadPromises = files.map(async (file) => {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const filePath = join(uploadDir, fileName);
        
        await writeFile(filePath, buffer);
        
        return {
          id: Math.random().toString(36).substring(2, 11),
          url: `/uploads/${fileName}`,
          name: file.name,
          uploadedAt: new Date()
        };
      } catch (e) {
        console.error(`Failed to upload individual file ${file.name}:`, e);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const uploadedPhotos = results.filter(p => p !== null);

    if (uploadedPhotos.length === 0) {
      return NextResponse.json({ error: "All image uploads failed." }, { status: 500 });
    }

    // Update MongoDB
    const { db, client } = await getDb();
    const snapsCol = db.collection("Snap");
    
    await snapsCol.updateOne(
      { _id: new ObjectId(albumId) },
      { $push: { photos: { $each: uploadedPhotos } } } as any
    );
    
    await client.close();

    return NextResponse.json({ success: true, photos: uploadedPhotos });
  } catch (error: any) {
    console.error("UPLOAD_ERROR:", error);
    return NextResponse.json({ error: "Failed to upload images.", details: error.message }, { status: 500 });
  }
}
