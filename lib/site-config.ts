import {
  ClipboardList,
  GraduationCap,
  Monitor,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for every piece of school-specific text used
 * across the site — nav labels, hero copy, contact info, teacher list.
 * Sourced from data.json (the school's actual details, as supplied by
 * the school).
 *
 * Read this directly in Server Components (`import { siteConfig } from
 * "@/lib/site-config"`), or via `useSite()` (see site-provider.tsx) in
 * Client Components.
 */
export const siteConfig = {
  name: "Navallur L.P",
  shortName: "Navallur LPS",
  initials: "NM",
  description:
    "A government LP school in Menaprem, Chokli, Kannur, teaching LKG to Class 4 since 1899 under the motto “Every child towards excellence.”",

  nav: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Teachers", href: "#teachers" },
    { label: "Gallery", href: "#gallery" },
    { label: "Events", href: "/events" },
    { label: "Contact", href: "#contact" },
  ],

  hero: {
    eyebrow: "Welcome to Navallur Muslim LP School",
    headline: "Every Child Towards Excellence.",
    body: "Serving Menaprem, Chokli since 1899 — small classes from LKG to Class 4, led by 8 teachers who know every student by name.",
    primaryCta: { label: "Enroll Now", href: "/auth/sign-up" },
    secondaryCta: { label: "Learn More", href: "#about" },
    image: { src: "/school.jpeg", alt: "Navallur Muslim LP School's front gate" },
  },

  features: [
    {
      icon: Users,
      title: "8 Dedicated Teachers",
      body: "One teacher per class from LKG to Class 4, plus dedicated Arabic and Work Experience teachers — everyone known by name.",
    },
    {
      icon: ClipboardList,
      title: "Full Curriculum",
      body: "Arabic, Malayalam, English, EVS, Mathematics, Work Experience and Art Education, across 8 periods a day, Monday to Friday.",
    },
    {
      icon: GraduationCap,
      title: "Established 1899",
      body: "More than a century educating children in Menaprem, Chokli — trusted across generations.",
    },
    {
      icon: Monitor,
      title: "Attendance Tracked Online",
      body: "Every class's daily attendance is recorded and available for staff to view online, in real time.",
    },
  ] satisfies { icon: LucideIcon; title: string; body: string }[],

  about: {
    eyebrow: "About Us",
    heading: "Navallur Muslim LP School",
    body: "Established in 1899, Navallur Muslim LP School has taught children in Menaprem, Chokli for well over a century under the motto “Every child towards excellence.” Headmaster Rajeevan V P joined the school in 1990 and has led it since 2014, overseeing a close-knit team of 8 teachers across LKG to Class 4.",
    cta: { label: "Meet Our Teachers", href: "#teachers" },
    // One official class photo per grade, LKG through Class 4.
    images: [
      { src: "/lkg.jpeg", alt: "LKG class photo" },
      { src: "/ukg.jpeg", alt: "UKG class photo" },
      { src: "/class1.jpeg", alt: "Class 1 photo" },
      { src: "/class2.jpeg", alt: "Class 2 photo" },
      { src: "/class3.jpeg", alt: "Class 3 photo" },
      { src: "/class4.jpeg", alt: "Class 4 photo" },
    ],
  },

  gallery: {
    eyebrow: "Take a Look Around",
    heading: "Gallery",
    body: "A glimpse of daily life on campus — classrooms and the moments in between.",
    images: [
      { src: "/assembly1.jpeg", alt: "Morning assembly" },
      { src: "/assembly2.jpeg", alt: "Students and teachers doing exercises at assembly" },
      { src: "/event1.jpeg", alt: "School event" },
      { src: "/event2.jpeg", alt: "School event" },
      { src: "/nature-event.jpeg", alt: "Students and staff planting a tree" },
    ],
  },

  teachers: {
    eyebrow: "Our Staff",
    heading: "Meet Our Teachers",
    body: "Eight teachers cover every class and subject, from LKG through Class 4.",
    groupPhoto: { src: "/faculties.jpeg", alt: "Teachers and staff group photo" },
    items: [
      {
        name: "Rajeevan V P",
        role: "Class 2 · All Subjects",
        designation: "HM",
      },
      {
        name: "Abdul Rasheed P",
        role: "LP Arabic",
        designation: "Arabic Teacher",
      },
      {
        name: "Rasina Kuttiyil",
        role: "Class 3 · All Subjects",
        designation: "LPST",
      },
      {
        name: "Muhammed Naseeb K",
        role: "Class 4 · All Subjects",
        designation: "LPST",
      },
      {
        name: "Ramsheeda P P",
        role: "Class 1 · All Subjects",
        designation: "LPST",
      },
      {
        name: "Hema Latha K",
        role: "Work Experience",
        designation: "Needlework Teacher",
      },
      {
        name: "Namisha K N",
        role: "UKG · All Subjects",
        designation: "PPT",
      },
      {
        name: "Ramsheena P T K",
        role: "LKG · All Subjects",
        designation: "PPT",
      },
    ],
  },

  cta: {
    eyebrow: "Admissions",
    heading: "Ready to Join Navallur Muslim LP School?",
    body: "Classes run Monday to Friday, 10:00 AM – 4:00 PM, for LKG to Class 4. Reach out to learn more.",
    action: { label: "Contact Us", href: "#contact" },
  },

  contact: {
    heading: "Contact",
    address: "Menaprem PO, Chokli, Kannur District, Kerala",
    phone: "9400432133",
    phoneAlt: "9747092156",
    whatsapp: "9747092156",
    email: "navallurmlps@gmail.com",
    hours: "Mon–Fri · 10:00 AM – 4:00 PM",
  },

  footer: {
    blurb:
      "Navallur Muslim LP School has taught children in Menaprem, Chokli since 1899, under the motto “Every child towards excellence.”",
  },
};

export type SiteConfig = typeof siteConfig;
