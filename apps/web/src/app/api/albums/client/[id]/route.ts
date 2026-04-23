import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

async function getDb() {
  const url = process.env.DATABASE_URL || "mongodb://localhost:27017/snapsaarthi";
  const client = new MongoClient(url.split('?')[0]);
  await client.connect();
  const dbName = url.includes('/snapsaarthi') ? 'snapsaarthi' : 'test';
  return { db: client.db(dbName), client };
}

export async function GET(request: Request, { params }: { params: any }) {
  try {
    const resolvedParams = await params;
    const { db, client } = await getDb();
    const snapsCol = db.collection("Snap");
    
    if (resolvedParams.id === "demo") {
      return NextResponse.json({
        success: true,
        album: {
          id: "demo",
          title: "Siddhi & Rohan's Wedding",
          status: "OPEN",
          clientName: "Demo Client",
          cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2070",
          targetCount: 50,
          photos: [
            { id: "p1", url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800", selected: false },
            { id: "p2", url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800", selected: false },
            { id: "p3", url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800", selected: false },
            { id: "p4", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800", selected: false },
            { id: "p5", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800", selected: false },
            { id: "p6", url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800", selected: false },
            { id: "p7", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800", selected: false },
            { id: "p8", url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800", selected: false }
          ],
          settings: { watermark: true, allowDownload: false }
        }
      });
    }

    let objectId;
    try {
      objectId = new ObjectId(resolvedParams.id);
    } catch {
      await client.close();
      return NextResponse.json({ error: "Invalid album link" }, { status: 400 });
    }

    const album = await snapsCol.findOne({ _id: objectId });
    await client.close();

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Map the database document to a secure client-facing object
    return NextResponse.json({
      success: true,
      album: {
        id: album._id.toString(),
        title: album.title,
        status: album.status,
        clientName: album.clientName,
        cover: album.coverImage,
        targetCount: album.targetCount,
        photos: album.photos || [],
        settings: album.shareSettings || { watermark: true, allowDownload: false }
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load album." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: any }) {
  // To handle selection updates from the client
  try {
    const resolvedParams = await params;
    const { photoId, selected } = await request.json();
    const { db, client } = await getDb();
    const snapsCol = db.collection("Snap");
    
    // Update the specific photo's selected status within the array
    await snapsCol.updateOne(
      { _id: new ObjectId(resolvedParams.id), "photos.id": photoId },
      { $set: { "photos.$.selected": selected } }
    );
    
    await client.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save selection" }, { status: 500 });
  }
}
