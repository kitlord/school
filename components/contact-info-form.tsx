"use client";

import { useEffect, useState } from "react";

type ContactFields = {
  address: string;
  phone: string;
  phoneAlt: string;
  whatsapp: string;
  whatsappCountryCode: string;
  email: string;
  hours: string;
};

const EMPTY: ContactFields = {
  address: "",
  phone: "",
  phoneAlt: "",
  whatsapp: "",
  whatsappCountryCode: "",
  email: "",
  hours: "",
};

const FIELDS: { key: keyof ContactFields; label: string }[] = [
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone" },
  { key: "phoneAlt", label: "Alternate phone" },
  { key: "whatsappCountryCode", label: "WhatsApp country code" },
  { key: "whatsapp", label: "WhatsApp number" },
  { key: "email", label: "Email" },
  { key: "hours", label: "Hours (e.g. Mon–Fri · 10:00 AM – 4:00 PM)" },
];

// Admin-only editor for the school's public contact details, shown in the
// site footer (see components/home/site-footer.tsx, use-contact-info.ts).
// Reads/writes GET|PUT /api/contact, backed by the singleton `contact_info`
// table — every field is optional, an empty one just hides that row in
// the footer.
export function ContactInfoForm() {
  const [fields, setFields] = useState<ContactFields>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/contact");
        const result = await response.json();
        if (response.ok) {
          const c = result.contact as Partial<ContactFields>;
          setFields({
            address: c.address ?? "",
            phone: c.phone ?? "",
            phoneAlt: c.phoneAlt ?? "",
            whatsapp: c.whatsapp ?? "",
            whatsappCountryCode: c.whatsappCountryCode ?? "",
            email: c.email ?? "",
            hours: c.hours ?? "",
          });
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const update =
    (key: keyof ContactFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "An error occurred");
      setSuccess("Contact info saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-3">
      {FIELDS.map(({ key, label }) => (
        <label key={key} className="flex flex-col gap-1 text-sm">
          {label}
          <input
            type="text"
            value={fields[key]}
            onChange={update(key)}
            className="rounded border bg-background px-2 py-1"
          />
        </label>
      ))}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <button
        type="submit"
        disabled={isSaving}
        className="self-start rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save contact info"}
      </button>
    </form>
  );
}
