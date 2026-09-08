"use client";

import { useEffect, useState } from "react";

export type ContactInfo = {
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
};

/**
 * Fetches the school's contact details (see GET /api/contact, backed by
 * the singleton `contact_info` table) once per mount. Admin-editable from
 * /admin — see the ContactInfoForm there and PUT /api/contact.
 */
export function useContactInfo() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/contact");
        const result = await response.json();
        if (!cancelled && response.ok) {
          setContact(result.contact as ContactInfo);
        }
      } catch {
        // Leave contact null — callers should render fine either way.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { contact, isLoading };
}
