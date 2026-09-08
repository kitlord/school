"use client";

import { useEffect, useState } from "react";

type StaffMember = {
  id: number;
  name: string;
  designation: string;
  role: string | null;
  display_order: number;
};

type NewStaff = { name: string; designation: string; role: string };

const EMPTY_NEW: NewStaff = { name: "", designation: "", role: "" };

// Admin-only manager for the public staff directory shown on the home
// page's "Meet Our Teachers" section (see components/home/teachers-section.tsx,
// GET /api/staff). Adding someone here is unrelated to granting them the
// Teacher/Admin role above — a role controls what a signed-in account can
// do, this controls who's publicly listed. Neither implies the other.
export function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState<NewStaff>(EMPTY_NEW);
  const [isAdding, setIsAdding] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/staff");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setStaff(result.staff as StaffMember[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStaff.name,
          designation: newStaff.designation,
          role: newStaff.role || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setNewStaff(EMPTY_NEW);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: number, name: string) => {
    if (!confirm(`Remove ${name} from the staff directory?`)) return;
    setError(null);
    try {
      const response = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "An error occurred");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {staff.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No staff added yet — the home page shows a &quot;coming soon&quot;
          message until someone&apos;s added here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Designation</th>
                <th className="p-2">Role / subtitle</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <StaffRow
                  key={member.id}
                  member={member}
                  onSaved={load}
                  onRemove={() => handleRemove(member.id, member.name)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-2 border-t pt-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            required
            value={newStaff.name}
            onChange={(e) =>
              setNewStaff((prev) => ({ ...prev, name: e.target.value }))
            }
            className="rounded border bg-background px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Designation
          <input
            required
            placeholder="e.g. HM, LPST, Peon"
            value={newStaff.designation}
            onChange={(e) =>
              setNewStaff((prev) => ({ ...prev, designation: e.target.value }))
            }
            className="rounded border bg-background px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Role / subtitle (optional)
          <input
            placeholder='e.g. "Class V · All Subjects"'
            value={newStaff.role}
            onChange={(e) =>
              setNewStaff((prev) => ({ ...prev, role: e.target.value }))
            }
            className="rounded border bg-background px-2 py-1"
          />
        </label>
        <button
          type="submit"
          disabled={isAdding}
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {isAdding ? "Adding..." : "Add staff member"}
        </button>
      </form>
    </div>
  );
}

function StaffRow({
  member,
  onSaved,
  onRemove,
}: {
  member: StaffMember;
  onSaved: () => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(member.name);
  const [designation, setDesignation] = useState(member.designation);
  const [role, setRole] = useState(member.role ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    name !== member.name ||
    designation !== member.designation ||
    role !== (member.role ?? "");

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    setError(null);
    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, designation, role: role || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className="border-b align-top">
      <td className="p-2">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          className="w-32 rounded border bg-background px-2 py-1"
        />
      </td>
      <td className="p-2">
        <input
          value={designation}
          onChange={(e) => {
            setDesignation(e.target.value);
            setSaved(false);
          }}
          className="w-32 rounded border bg-background px-2 py-1"
        />
      </td>
      <td className="p-2">
        <input
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setSaved(false);
          }}
          className="w-40 rounded border bg-background px-2 py-1"
        />
      </td>
      <td className="whitespace-nowrap p-2 text-right">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !dirty}
          className="mr-3 text-xs underline disabled:opacity-50"
        >
          {isSaving ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-500 underline"
        >
          Remove
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </td>
    </tr>
  );
}
