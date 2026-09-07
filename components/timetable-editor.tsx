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
type Subject = { id: number; name: string | null };
type Entry = {
  id: number;
  day_of_week: number;
  period_number: number;
  start_time: string | null;
  end_time: string | null;
  subject_id: number | null;
  title: string | null;
  teacher_name: string | null;
};

type Row = {
  key: string; // client-only, for React list keys — not sent to the server
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  title: string;
  teacherName: string;
};

// 1 = Monday .. 6 = Saturday, matching day_of_week in the database.
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm";

let nextKey = 0;
function newRow(dayOfWeek: number, periodNumber: number): Row {
  return {
    key: `new-${nextKey++}`,
    dayOfWeek,
    periodNumber,
    startTime: "",
    endTime: "",
    subjectId: "",
    title: "",
    teacherName: "",
  };
}

function rowFromEntry(entry: Entry): Row {
  return {
    key: `entry-${entry.id}`,
    dayOfWeek: entry.day_of_week,
    periodNumber: entry.period_number,
    startTime: entry.start_time?.slice(0, 5) ?? "",
    endTime: entry.end_time?.slice(0, 5) ?? "",
    subjectId: entry.subject_id?.toString() ?? "",
    title: entry.title ?? "",
    teacherName: entry.teacher_name ?? "",
  };
}

export function TimetableEditor({
  classes,
  sections,
  subjects,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  classes: SchoolClass[];
  sections: SchoolSection[];
  subjects: Subject[];
}) {
  const [classId, setClassId] = useState(classes[0]?.id.toString() ?? "");
  const [sectionId, setSectionId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const loadTimetable = useCallback(async () => {
    if (!classId) return;
    if (sectionRequired && !sectionId) {
      setRows([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ classId });
      if (sectionId) params.set("sectionId", sectionId);
      const response = await fetch(`/api/timetable?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setRows((result.entries as Entry[]).map(rowFromEntry));
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [classId, sectionId, sectionRequired]);

  useEffect(() => {
    loadTimetable();
    setSuccess(null);
  }, [loadTimetable]);

  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    const nextPeriod = rows.length
      ? Math.max(...rows.map((r) => r.periodNumber)) + 1
      : 1;
    setRows((prev) => [...prev, newRow(1, nextPeriod)]);
  };

  const removeRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: Number(classId),
          sectionId: sectionId ? Number(sectionId) : undefined,
          entries: rows.map((r) => ({
            dayOfWeek: r.dayOfWeek,
            periodNumber: r.periodNumber,
            startTime: r.startTime || undefined,
            endTime: r.endTime || undefined,
            subjectId: r.subjectId ? Number(r.subjectId) : undefined,
            title: r.title.trim() || undefined,
            teacherName: r.teacherName.trim() || undefined,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setSuccess("Timetable saved.");
      setRows((result.entries as Entry[]).map(rowFromEntry));
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
          <CardTitle className="text-2xl">Issue timetable</CardTitle>
          <CardDescription>Visible to admins only</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tt-classId">Class</Label>
                <select
                  id="tt-classId"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className={cn(selectClass, "min-w-40")}
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
                  <Label htmlFor="tt-sectionId">Section</Label>
                  <select
                    id="tt-sectionId"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className={cn(selectClass, "min-w-32")}
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
            </div>

            {isLoading && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {!isLoading && sectionRequired && !sectionId && (
              <p className="text-sm text-muted-foreground">
                Select a section to edit its timetable.
              </p>
            )}

            {!isLoading && (!sectionRequired || sectionId) && (
              <div className="flex flex-col gap-3">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-6"
                  >
                    <div className="grid gap-1">
                      <Label className="text-xs">Day</Label>
                      <select
                        value={row.dayOfWeek}
                        onChange={(e) =>
                          updateRow(row.key, { dayOfWeek: Number(e.target.value) })
                        }
                        className={selectClass}
                      >
                        {DAYS.map((day, i) => (
                          <option key={day} value={i + 1}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Period</Label>
                      <Input
                        type="number"
                        min={1}
                        value={row.periodNumber}
                        onChange={(e) =>
                          updateRow(row.key, {
                            periodNumber: Number(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="time"
                        value={row.startTime}
                        onChange={(e) =>
                          updateRow(row.key, { startTime: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">End</Label>
                      <Input
                        type="time"
                        value={row.endTime}
                        onChange={(e) =>
                          updateRow(row.key, { endTime: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Subject</Label>
                      <select
                        value={row.subjectId}
                        onChange={(e) =>
                          updateRow(row.key, { subjectId: e.target.value })
                        }
                        className={selectClass}
                      >
                        <option value="">— None —</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">
                        {row.subjectId ? "Teacher" : "Title"}
                      </Label>
                      {row.subjectId ? (
                        <Input
                          value={row.teacherName}
                          placeholder="Teacher (optional)"
                          onChange={(e) =>
                            updateRow(row.key, { teacherName: e.target.value })
                          }
                        />
                      ) : (
                        <Input
                          value={row.title}
                          placeholder="e.g. Lunch break"
                          onChange={(e) =>
                            updateRow(row.key, { title: e.target.value })
                          }
                        />
                      )}
                    </div>
                    <div className="col-span-2 flex justify-end sm:col-span-6">
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        className="text-xs text-red-500 underline"
                      >
                        Remove period
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addRow}
                  className="self-start text-sm text-muted-foreground underline underline-offset-2"
                >
                  + Add period
                </button>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? "Saving..." : "Save timetable"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
