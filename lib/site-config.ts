import {
  ClipboardList,
  GraduationCap,
  Monitor,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for every piece of school-specific text used
 * across the site — nav labels, hero copy, contact info, program list.
 *
 * `name` below is a placeholder. Swap it (and the rest of this file) for
 * the real school's details and every page that reads from here — the
 * home page, and the nav brand link on every other page — updates together.
 *
 * Read this directly in Server Components (`import { siteConfig } from
 * "@/lib/site-config"`), or via `useSite()` (see site-provider.tsx) in
 * Client Components.
 */
export const siteConfig = {
  name: "Crestwood Academy",
  shortName: "Crestwood",
  initials: "CA",
  description:
    "A K–12 school built on small classes, certified teachers, and a curriculum families can track in real time.",

  nav: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Courses", href: "#courses" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ],

  hero: {
    eyebrow: "Welcome to Crestwood Academy",
    headline: "Your Child's Best Year Starts Here.",
    body: "Small classes, certified teachers, and a curriculum that grows with every student — from their first day to graduation.",
    primaryCta: { label: "Enroll Now", href: "/auth/sign-up" },
    secondaryCta: { label: "Learn More", href: "#about" },
  },

  features: [
    {
      icon: Users,
      title: "Certified Teachers",
      body: "Every classroom is led by a licensed, background-checked teacher who knows each student by name.",
    },
    {
      icon: ClipboardList,
      title: "Structured Curriculum",
      body: "A clear, grade-by-grade curriculum that builds real skills year over year, not just test scores.",
    },
    {
      icon: GraduationCap,
      title: "Accredited Certification",
      body: "Graduates leave with certification recognized by colleges and employers alike.",
    },
    {
      icon: Monitor,
      title: "Online Access",
      body: "Parents and students track attendance, grades, and schedules online, anytime.",
    },
  ] satisfies { icon: LucideIcon; title: string; body: string }[],

  about: {
    eyebrow: "About Us",
    heading: "A School Built Around Every Student",
    body: "Crestwood has spent over two decades helping students find their footing, academically and personally. Our teachers track attendance and progress closely, our classes stay small on purpose, and our campus is built for students to actually want to be here.",
    cta: { label: "Explore Our Courses", href: "#courses" },
    imageCount: 4,
  },

  gallery: {
    eyebrow: "Take a Look Around",
    heading: "Gallery",
    body: "A glimpse of daily life on campus — classrooms, labs, and the moments in between.",
    imageCount: 6,
  },

  courses: {
    eyebrow: "What We Offer",
    heading: "Courses",
    body: "Six core programs, each built to take a student from first principles to real mastery.",
    items: [
      { name: "Mathematics", duration: "4 Years", price: "$400 / yr" },
      { name: "Natural Sciences", duration: "4 Years", price: "$450 / yr" },
      { name: "Arts & Humanities", duration: "3 Years", price: "$380 / yr" },
      { name: "Computer Science", duration: "4 Years", price: "$500 / yr" },
      { name: "Business Studies", duration: "3 Years", price: "$420 / yr" },
      { name: "Languages", duration: "2 Years", price: "$350 / yr" },
    ],
  },

  cta: {
    eyebrow: "Enrollment Is Open",
    heading: "Ready to Get Started?",
    body: "Applications for the next term are open now — spots are limited.",
    action: { label: "Register Today", href: "/auth/sign-up" },
  },

  contact: {
    heading: "Contact",
    address: "123 Example Avenue, Springfield, ST 00000",
    phone: "(555) 010-0100",
    email: "info@crestwood.example.edu",
  },

  footer: {
    blurb:
      "Crestwood Academy is a K–12 school focused on small classes, certified teachers, and real accountability, for students and parents alike.",
  },
};

export type SiteConfig = typeof siteConfig;
