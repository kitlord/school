import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SiteProvider } from "@/components/site-provider";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: siteConfig.name,
  description: siteConfig.description,
};

// Body/UI face — mirrors the Poppins used across the reference theme's
// nav, buttons, and copy.
const bodyFont = Poppins({
  variable: "--font-body",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Display face for headings only — mirrors the reference theme's Playfair
// Display pairing. Applied via the `font-display` Tailwind utility, not on
// <body>, so body copy stays on the Poppins/sans stack.
const displayFont = Playfair_Display({
  variable: "--font-display",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SiteProvider site={siteConfig}>{children}</SiteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
