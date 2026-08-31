"use client";

import { useState, useTransition } from "react";

export function DeleteUserButton({
  userId,
  email,
  action,
}: {
  userId: string;
  email: string;
  action: (userId: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (
      !confirm(`Remove ${email}? This deletes their account permanently.`)
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await action(userId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs text-red-500 underline disabled:opacity-50"
      >
        {isPending ? "Removing..." : "Remove"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
