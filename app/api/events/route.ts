import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

const BUCKET = "events";

// Serverless function (Vercel): lets an authenticated Admin post a new
// event. Image/video, if any, are uploaded straight from the browser to
// Storage beforehand (see ./upload-url) — this only ever receives their
// storage paths, never the file bytes.
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { title, description, imagePath, videoPath } = await request.json();

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { error: "Event title is required" },
      { status: 400 },
    );
  }

  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json(
      { error: "Event description is required" },
      { status: 400 },
    );
  }

  if (imagePath !== undefined && typeof imagePath !== "string") {
    return NextResponse.json({ error: "Invalid imagePath" }, { status: 400 });
  }
  if (videoPath !== undefined && typeof videoPath !== "string") {
    return NextResponse.json({ error: "Invalid videoPath" }, { status: 400 });
  }

  const imageUrl = imagePath
    ? admin.storage.from(BUCKET).getPublicUrl(imagePath).data.publicUrl
    : null;
  const videoUrl = videoPath
    ? admin.storage.from(BUCKET).getPublicUrl(videoPath).data.publicUrl
    : null;

  const { data: event, error } = await admin
    .from("events")
    .insert({
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl,
      video_url: videoUrl,
    })
    .select("id, title, description, image_url, video_url, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, event });
}
