"use client";

import { cn } from "@/lib/utils";
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

function statusLabel(present: boolean | null) {
  if (present === null) return "Not marked";
  return present ? "Present" : "Absent";
}

export function AttendanceList({
  classes,
  sections,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  classes: SchoolClass[];
  sections: SchoolSection[];
}) {
  const [classId, setClassId] = useState(classes[0]?.id.toString() ?? "");
  // Left blank ("All sections") by default — unlike marking attendance,
  // viewing works fine across a whole class even when it has sections.
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(today);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sectionsForClass = useMemo(
    () => sections.filter((s) => s.class_id === Number(classId)),
    [sections, classId],
  );

  // Reset to "All sections" whenever the class changes.
  useEffect(() => {
    setSectionId("");
  }, [classId]);

  const loadRoster = useCallback(async () => {
    if (!classId || !date) return;
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ classId, date });
      if (sectionId) params.set("sectionId", sectionId);
      const response = await fetch(`/api/attendance?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setRoster(result.students);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [classId, sectionId, date]);

  // Reload the roster whenever the class or date changes, and once up front.
  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const presentCount = roster.filter((s) => s.present).length;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Attendance list</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading…"
              : roster.length > 0
                ? `${presentCount} of ${roster.length} present`
                : "Look up a class's attendance for a date"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="classId">Class</Label>
              <select
                id="classId"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
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
            {sectionsForClass.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="sectionId">Section</Label>
                <select
                  id="sectionId"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                >
                  <option value="">All sections</option>
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {!error && !isLoading && roster.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No students in this class.
              </p>
            )}

            {roster.length > 0 && (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Roll</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s) => (
                    <tr key={s.roll} className="border-b">
                      <td className="p-2">{s.roll}</td>
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            s.present === null
                              ? "text-muted-foreground"
                              : s.present
                                ? "text-green-600"
                                : "text-red-500",
                          )}
                        >
                          {statusLabel(s.present)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
