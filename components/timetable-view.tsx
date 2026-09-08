"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type SchoolClass = { id: number; name: string | null };
type SchoolSection = { id: number; name: string | null; class_id: number };
type Entry = {
  id: number;
  day_of_week: number;
  period_number: number;
  start_time: string | null;
  end_time: string | null;
  subject_id: number | null;
  title: string | null;
  teacher_name: string | null;
  subject: { name: string | null } | null;
};

// 1 = Monday .. 6 = Saturday, matching day_of_week in the database.
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTimeRange(start: string | null, end: string | null) {
  const short = (t: string) => t.slice(0, 5); // "09:00:00" -> "09:00"
  if (start && end) return `${short(start)}–${short(end)}`;
  if (start) return short(start);
  return null;
}

export function TimetableView({
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
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sectionsForClass = useMemo(
    () => sections.filter((s) => s.class_id === Number(classId)),
    [sections, classId],
  );
  const sectionRequired = sectionsForClass.length > 0;
  const selectedClassName = classes.find((c) => c.id === Number(classId))?.name;
  const selectedSectionName = sectionsForClass.find(
    (s) => s.id === Number(sectionId),
  )?.name;

  // Reset the section whenever the class changes, defaulting to that
  // class's first section when it has any.
  useEffect(() => {
    setSectionId(sectionsForClass[0]?.id.toString() ?? "");
  }, [sectionsForClass]);

  const loadTimetable = useCallback(async () => {
    if (!classId) return;
    if (sectionRequired && !sectionId) {
      setEntries([]);
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
      setEntries(result.entries as Entry[]);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [classId, sectionId, sectionRequired]);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const periods = useMemo(
    () =>
      [...new Set(entries.map((e) => e.period_number))].sort((a, b) => a - b),
    [entries],
  );

  const entryAt = (day: number, period: number) =>
    entries.find((e) => e.day_of_week === day && e.period_number === period);

  const periodTime = (period: number) => {
    const withTime = entries.find(
      (e) => e.period_number === period && (e.start_time || e.end_time),
    );
    return withTime ? formatTimeRange(withTime.start_time, withTime.end_time) : null;
  };

  // window.print() prints whatever's currently visible on the page — the
  // rest of app/timetable/page.tsx (nav, admin editor, footer) is marked
  // print:hidden so only this card's content ends up in the PDF. The
  // browser's print dialog lets the user pick "Save as PDF", so this
  // needs no PDF library, server route, or image-rendering step — just
  // print CSS. No separate "download as image" option: a real PDF via
  // print is strictly better than a rasterized screenshot here, so there
  // wasn't a reason to build both.
  const handleDownload = () => window.print();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Timetable</CardTitle>
            <CardDescription className="print:hidden">
              Select a class{sectionRequired ? " and section" : ""} to see
              its weekly schedule
            </CardDescription>
            {/* Print-only: gives the PDF/printout a heading even though
                the selectors themselves are hidden for print. */}
            <CardDescription className="hidden print:block">
              {selectedClassName}
              {selectedSectionName ? ` - ${selectedSectionName}` : ""}
            </CardDescription>
          </div>
          {periods.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="shrink-0 print:hidden"
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-4 print:hidden">
              <div className="grid gap-2">
                <Label htmlFor="classId">Class</Label>
                <select
                  id="classId"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="flex h-9 w-full min-w-40 rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
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
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="flex h-9 w-full min-w-32 rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
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

            {error && <p className="text-sm text-red-500">{error}</p>}
            {!error && isLoading && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {!error && !isLoading && periods.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No timetable published yet for this{" "}
                {sectionRequired ? "section" : "class"}.
              </p>
            )}

            {!isLoading && periods.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Period</th>
                      {DAYS.map((day) => (
                        <th key={day} className="p-2">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr key={period} className="border-b align-top">
                        <td className="p-2 font-medium">
                          {period}
                          {periodTime(period) && (
                            <div className="text-xs font-normal text-muted-foreground">
                              {periodTime(period)}
                            </div>
                          )}
                        </td>
                        {DAYS.map((_, i) => {
                          const day = i + 1;
                          const entry = entryAt(day, period);
                          return (
                            <td key={day} className="p-2">
                              {entry ? (
                                <>
                                  <div>{entry.subject?.name ?? entry.title}</div>
                                  {entry.teacher_name && (
                                    <div className="text-xs text-muted-foreground">
                                      {entry.teacher_name}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          );
                        })}
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
