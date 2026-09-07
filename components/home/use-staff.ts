"use client";

import { useEffect, useState } from "react";

export type StaffMember = {
  id: number;
  name: string;
  designation: string | null;
  role: string | null;
};

/**
 * Fetches the public staff directory (see /api/staff, backed by the
 * `staff` table) once per mount. Shared by TeachersSection (the full grid)
 * and SiteFooter (the "Teachers" quick-links column) so both reflect the
 * same data without each hand-rolling the same fetch.
 */
export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/staff");
        const result = await response.json();
        if (!cancelled && response.ok) {
          setStaff(result.staff as StaffMember[]);
        }
      } catch {
        // Leave staff empty — callers should render fine either way.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { staff, isLoading };
}
