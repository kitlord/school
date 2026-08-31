"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Student = {
  roll: number;
  name: string | null;
  class: { name: string | null } | null;
};

export function StudentsList({
  students,
  isAdmin,
}: {
  students: Student[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [removingRoll, setRemovingRoll] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (roll: number, name: string | null) => {
    if (
      !confirm(
        `Remove ${name ?? "this student"}? This also permanently deletes their attendance history.`,
      )
    ) {
      return;
    }

    setRemovingRoll(roll);
    setError(null);

    try {
      const response = await fetch(`/api/students/${roll}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setRemovingRoll(null);
    }
  };

  if (students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <ul className="flex flex-col gap-1">
        {students.map((student) => (
          <li
            key={student.roll}
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span>
              {student.name}{" "}
              <span className="text-muted-foreground">
                · {student.class?.name ?? "No class"}
              </span>
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleRemove(student.roll, student.name)}
                disabled={removingRoll === student.roll}
                className="shrink-0 text-xs text-red-500 underline disabled:opacity-50"
              >
                {removingRoll === student.roll ? "Removing..." : "Remove"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
