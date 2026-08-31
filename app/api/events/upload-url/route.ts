import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

const BUCKET = "events";

const KIND_MIME_PREFIXES: Record<string, string> = {
  image: "image/",
  video: "video/",
};

// Serverless function (Vercel): an authorized Admin calls this to get a
// one-time signed upload URL for an image or video, instead of sending the
// file through this route directly — Vercel serverless functions cap
// request bodies well below typical video sizes, so the file itself is
// uploaded straight from the browser to Supabase Storage using the token
// this returns. The signed token is what authorizes that upload (bucket
// writes have no RLS policy of their own, same as every table in this
// project — everything privileged goes through the service-role client,
// which is what generates the token here).
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { fileName, fileType, kind } = await request.json();

  if (kind !== "image" && kind !== "video") {
    return NextResponse.json(
      { error: "kind must be 'image' or 'video'" },
      { status: 400 },
    );
  }
  if (typeof fileType !== "string" || !fileType.startsWith(KIND_MIME_PREFIXES[kind])) {
    return NextResponse.json(
      { error: `File must be a ${kind}` },
      { status: 400 },
    );
  }
  if (typeof fileName !== "string" || !fileName.trim()) {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 });
  }

  // Random, collision-free object key — the original filename is kept only
  // as a suffix for readability in the Storage dashboard.
  const safeName = fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${crypto.randomUUID()}-${safeName}`;

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    path: data.path,
    token: data.token,
  });
}
