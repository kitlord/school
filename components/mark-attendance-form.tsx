"use client";

import { cn } from "@/lib/utils";
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
import { useCallback, useEffect, useMemo, useState } from "react";

type SchoolClass = { id: number; name: string | null };
type SchoolSection = { id: number; name: string | null; class_id: number };
type RosterRow = { roll: number; name: string | null; present: boolean | null };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function MarkAttendanceForm({
  classes,
  sections,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  classes: SchoolClass[];
  sections: SchoolSection[];
}) {
  const [classId, setClassId] = useState(classes[0]?.id.toString() ?? "");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [isRosterLoading, setIsRosterLoading] = useState(false);

  // roll -> checked state for the checkbox list. Unmarked students default
  // to present; the teacher unchecks whoever is absent.
  const [marks, setMarks] = useState<Record<number, boolean>>({});

  // Sections are scoped to a class. A class with multiple sections mixes
  // every section's students into one roll list, so once a class has any
  // sections, picking one is required before attendance can be marked —
  // a class with none (e.g. LKG/UKG) works exactly as before.
  const sectionsForClass = useMemo(
    () => sections.filter((s) => s.class_id === Number(classId)),
    [sections, classId],
  );
  const sectionRequired = sectionsForClass.length > 0;

  // Reset the section whenever the class changes, defaulting to that
  // class's first section when it has any.
  useEffect(() => {
    setSectionId(sectionsForClass[0]?.id.toString() ?? "");
  }, [sectionsForClass]);

  const loadRoster = useCallback(async () => {
    if (!classId || !date) return;
    if (sectionRequired && !sectionId) {
      setRoster([]);
      return;
    }
    setIsRosterLoading(true);
    setRosterError(null);
    try {
      const params = new URLSearchParams({ classId, date });
      if (sectionId) params.set("sectionId", sectionId);
      const response = await fetch(`/api/attendance?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      const students = result.students as RosterRow[];
      setRoster(students);
      setMarks(
        Object.fromEntries(students.map((s) => [s.roll, s.present ?? true])),
      );
    } catch (error: unknown) {
      setRosterError(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setIsRosterLoading(false);
    }
  }, [classId, sectionId, sectionRequired, date]);

  // Reload the roster whenever the class or date changes, and once up front.
  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const toggleMark = (roll: number, present: boolean) => {
    setMarks((prev) => ({ ...prev, [roll]: present }));
  };

  const markAll = (present: boolean) => {
    setMarks(Object.fromEntries(roster.map((s) => [s.roll, present])));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: Number(classId),
          date,
          marks: roster.map((s) => ({
            roll: s.roll,
            present: marks[s.roll] ?? true,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setSuccess(
        `Saved attendance for ${result.attendance.length} student(s) on ${date}.`,
      );
      await loadRoster(); // reflect the saved marks in the checkboxes
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mark attendance</CardTitle>
          <CardDescription>
            Check a student to mark them present, uncheck for absent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="classId">Class</Label>
                <select
                  id="classId"
                  required
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                >
                  <option value="" disabled>
                    Select a class
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {sectionRequired && (
                <div className="grid gap-2">
                  <Label htmlFor="sectionId">Section</Label>
                  <select
                    id="sectionId"
                    required
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                  >
                    <option value="" disabled>
                      Select a section
                    </option>
                    {sectionsForClass.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {rosterError && (
                <p className="text-sm text-red-500">{rosterError}</p>
              )}
              {!rosterError &&
                !isRosterLoading &&
                sectionRequired &&
                !sectionId && (
                  <p className="text-sm text-muted-foreground">
                    Select a section to load its roster.
                  </p>
                )}
              {!rosterError &&
                !isRosterLoading &&
                (!sectionRequired || sectionId) &&
                roster.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No students in this class.
                </p>
              )}

              {roster.length > 0 && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      {isRosterLoading
                        ? "Loading…"
                        : `Students (${roster.length})`}
                    </Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => markAll(true)}
                        className="text-xs text-muted-foreground underline underline-offset-2"
                      >
                        Mark all present
                      </button>
                      <button
                        type="button"
                        onClick={() => markAll(false)}
                        className="text-xs text-muted-foreground underline underline-offset-2"
                      >
                        Mark all absent
                      </button>
                    </div>
                  </div>
                  <div className="rounded-md border divide-y">
                    {roster.map((s) => (
                      <label
                        key={s.roll}
                        htmlFor={`present-${s.roll}`}
                        className="flex items-center gap-3 p-2 text-sm cursor-pointer"
                      >
                        <input
                          id={`present-${s.roll}`}
                          type="checkbox"
                          checked={marks[s.roll] ?? true}
                          onChange={(e) => toggleMark(s.roll, e.target.checked)}
                          className="h-4 w-4 rounded border-input"
                        />
                        <span className="text-muted-foreground w-8">
                          {s.roll}
                        </span>
                        <span>{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={isSaving || isRosterLoading || roster.length === 0}
              >
                {isSaving ? "Saving..." : "Save attendance"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
