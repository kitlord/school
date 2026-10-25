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
type SummaryRow = {
  roll: number;
  name: string | null;
  presentCount: number;
  absentCount: number;
  totalMarked: number;
};
type AttendanceResponse =
  | { type: "single"; students: RosterRow[] }
  | { type: "range"; range: { from: string; to: string }; students: SummaryRow[] };

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
  // Optional: when set (and different from `date`), the API returns a
  // present/absent summary across date..toDate instead of one day's
  // roster — see the "type" field on `result`.
  const [toDate, setToDate] = useState("");
  const [result, setResult] = useState<AttendanceResponse | null>(null);
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

  const loadAttendance = useCallback(async () => {
    if (!classId || !date) return;
    if (toDate && toDate < date) {
      setError("The \"to\" date must be on or after the date.");
      setResult(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ classId, date });
      if (sectionId) params.set("sectionId", sectionId);
      if (toDate && toDate !== date) params.set("toDate", toDate);
      const response = await fetch(`/api/attendance?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setResult(result);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [classId, sectionId, date, toDate]);

  // Reload whenever the class, section, or either date changes, and once
  // up front.
  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const students = result?.students ?? [];
  const presentCount =
    result?.type === "single" ? result.students.filter((s) => s.present).length : 0;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Attendance list</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading…"
              : students.length === 0
                ? "Look up a class's attendance for a date, or a summary across a range"
                : result?.type === "range"
                  ? `Summary from ${result.range.from} to ${result.range.to}`
                  : `${presentCount} of ${students.length} present`}
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
            {sectionsForClass.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="sectionId">Section</Label>
                <select
                  id="sectionId"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
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
            {/* Stacked until there's room for two date inputs side by side:
                input[type=date] has an intrinsic minimum width (the picker
                widget), so min-w-0 is needed for them to shrink at all. */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="grid min-w-0 flex-1 gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="grid min-w-0 flex-1 gap-2">
                <Label htmlFor="toDate">To (optional)</Label>
                <Input
                  id="toDate"
                  type="date"
                  min={date}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            {toDate && toDate !== date && (
              <p className="text-xs text-muted-foreground">
                Showing a present/absent summary across the whole range
                instead of a single day. Clear &quot;To&quot; to go back to a
                single day&apos;s roster.
              </p>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            {!error && !isLoading && students.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No students in this class.
              </p>
            )}

            {result?.type === "single" && result.students.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Roll</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.students.map((s) => (
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
              </div>
            )}

            {result?.type === "range" && result.students.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Roll</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Present</th>
                      <th className="p-2">Absent</th>
                      <th className="p-2">Marked</th>
                      <th className="p-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.students.map((s) => (
                      <tr key={s.roll} className="border-b">
                        <td className="p-2">{s.roll}</td>
                        <td className="p-2">{s.name}</td>
                        <td className="p-2 text-green-600">{s.presentCount}</td>
                        <td className="p-2 text-red-500">{s.absentCount}</td>
                        <td className="p-2 text-muted-foreground">{s.totalMarked}</td>
                        <td className="p-2">
                          {s.totalMarked > 0
                            ? `${Math.round((s.presentCount / s.totalMarked) * 100)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
