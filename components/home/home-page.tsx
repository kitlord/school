"use client";

import { Suspense } from "react";
import { SiteHeader } from "@/components/home/site-header";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { AboutSection } from "@/components/home/about-section";
import { GallerySection } from "@/components/home/gallery-section";
import { CoursesSection } from "@/components/home/courses-section";
import { CtaSection } from "@/components/home/cta-section";
import { SiteFooter } from "@/components/home/site-footer";

// The auth widget (Sign in/Sign up vs. the signed-in user's name) reads the
// Supabase session server-side, so it's rendered by app/page.tsx and passed
// in here rather than fetched from this Client Component.
export function HomePage({ authSlot }: { authSlot: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <SiteHeader authSlot={authSlot} />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <GallerySection />
      <CoursesSection />
      <CtaSection />
      {/* SiteFooter reads the current year, so it needs its own Suspense
          boundary — otherwise Cache Components can't tell where the
          statically-prerenderable page ends and per-request content begins. */}
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </main>
  );
}
