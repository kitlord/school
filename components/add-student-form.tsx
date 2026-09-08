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
import { useEffect, useMemo, useState } from "react";

type SchoolClass = { id: number; name: string | null };
type SchoolSection = { id: number; name: string | null; class_id: number };

export function AddStudentForm({
  classes,
  sections,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  classes: SchoolClass[];
  sections: SchoolSection[];
}) {
  const [name, setName] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id.toString() ?? "");
  const [sectionId, setSectionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sections are scoped to a class, so the section dropdown only ever shows
  // the selected class's own sections. A class with none (e.g. LKG/UKG)
  // works exactly as before — no section is required.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          classId: Number(classId),
          sectionId: sectionId ? Number(sectionId) : undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setSuccess(`Added ${result.student.name}.`);
      setName("");
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
          <CardTitle className="text-2xl">Add student</CardTitle>
          <CardDescription>Enrol a new student in a class</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Student name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || (sectionRequired && !sectionId)}
              >
                {isLoading ? "Adding..." : "Add student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
