"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // matches the "events" bucket's limit

// Uploads one file straight from the browser to Supabase Storage: gets a
// one-time signed upload URL from our server (which checks the caller is an
// Admin), then uploads directly to Storage — the file's bytes never pass
// through our own server, only its path does.
async function uploadMedia(file: File, kind: "image" | "video") {
  const urlResponse = await fetch("/api/events/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileType: file.type, kind }),
  });
  const urlResult = await urlResponse.json();
  if (!urlResponse.ok) {
    throw new Error(urlResult.error ?? `Could not prepare ${kind} upload`);
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("events")
    .uploadToSignedUrl(urlResult.path, urlResult.token, file);
  if (error) throw error;

  return urlResult.path as string;
}

export function AddEventForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_SIZE) {
      setError("File is too large (50MB max)");
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const [imagePath, videoPath] = await Promise.all([
        image ? uploadMedia(image, "image") : Promise.resolve(undefined),
        video ? uploadMedia(video, "video") : Promise.resolve(undefined),
      ]);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, imagePath, videoPath }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");

      setTitle("");
      setDescription("");
      setImage(null);
      setVideo(null);
      // Re-fetch the (server-rendered) event list below so the new post
      // shows up immediately.
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post an event</CardTitle>
          <CardDescription>Visible to admins only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Event title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="What's happening?"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Photo (optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e, setImage)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="video">Video (optional)</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFile(e, setVideo)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Posting..." : "Post event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
