"use client";

import { useState } from "react";

// Lets an Admin set any user's display name (PATCH /api/users/[userId]) —
// there's no separate profile table, it's stored in that user's auth
// user_metadata.full_name. Currently only consumed by GET /api/headmaster
// (whichever Admin joined first), but works for any user.
export function EditUserNameField({
  userId,
  initialName,
}: {
  userId: string;
  initialName: string;
}) {
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSaved(false);
        }}
        placeholder="Full name"
        className="w-36 rounded border bg-background px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="text-xs underline disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
      {saved && <span className="text-xs text-green-600">Saved</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </form>
  );
}
