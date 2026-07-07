import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { LANDING_IMAGES } from "@/lib/images";

// Client components
import LandingNav from "@/components/landing/LandingNav";
import HeroCarousel from "@/components/landing/HeroCarousel";
import NewsTicker from "@/components/landing/NewsTicker";
import InsightsSection from "@/components/landing/InsightsSection";
import GalleryCarousel from "@/components/landing/GalleryCarousel";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface PublicProject {
  id: string;
  name: string;
  description: string | null;
  status: "ONGOING" | "DELAYED" | "COMPLETED";
  budgetPlanned: number;
  budgetActual: number;
  officer: { name: string | null } | null;
}

// ------------------------------------------------------------------
// Server-side data fetch (no auth required)
// ------------------------------------------------------------------

async function getStats() {
  try {
    const [total, ongoing, delayed, completed, agg] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "ONGOING" } }),
      prisma.project.count({ where: { status: "DELAYED" } }),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.project.aggregate({ _sum: { budgetPlanned: true, budgetActual: true } }),
    ]);
    return {
      totalProjects: total,
      ongoingProjects: ongoing,
      delayedProjects: delayed,
      completedProjects: completed,
      totalBudgetPlanned: agg._sum.budgetPlanned ?? 0,
      totalBudgetActual: agg._sum.budgetActual ?? 0,
    };
  } catch {
    return {
      totalProjects: 0,
      ongoingProjects: 0,
      delayedProjects: 0,
      completedProjects: 0,
      totalBudgetPlanned: 0,
      totalBudgetActual: 0,
    };
  }
}

async function getLatestProjects(): Promise<PublicProject[]> {
  try {
    return await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        budgetPlanned: true,
        budgetActual: true,
        tenderAmount: true,
        officer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

// ------------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------------

const ANNOUNCEMENTS = [
  { id: "1", text: "NIRMAAN system now available for all Zilla Parishad officers across Maharashtra" },
  { id: "2", text: "New project registration portal launched for contractor onboarding" },
  { id: "3", text: "Q1 2025 budget utilization reports now available in the Finance module" },
  { id: "4", text: "Digital payment tracking enabled for all active projects" },
];

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  ONGOING: {
    label: "Ongoing",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  DELAYED: {
    label: "Delayed",
    className: "bg-orange-100 text-orange-800 border border-orange-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
};

function formatBudget(n: number) {
  if (n === 0) return "₹0";
  const cr = n / 10000000;
  if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
  return `₹${(n / 100000).toFixed(2)} L`;
}

const DEPARTMENTS = [
  {
    id: "works",
    icon: "construction",
    name: "Works & Construction",
    desc: "Infrastructure development, road works, building construction",
    color: "#00003c",
  },
  {
    id: "agri",
    icon: "agriculture",
    name: "Agriculture",
    desc: "Farmer support schemes, irrigation, soil conservation",
    color: "#319e23",
  },
  {
    id: "health",
    icon: "local_hospital",
    name: "Health",
    desc: "Primary health centres, rural health infrastructure",
    color: "#ba1a1a",
  },
  {
    id: "education",
    icon: "school",
    name: "Education",
    desc: "School buildings, digital classrooms, infrastructure",
    color: "#fe9832",
  },
  {
    id: "water",
    icon: "water_drop",
    name: "Water Supply",
    desc: "Drinking water schemes, pipelines, rural sanitation",
    color: "#000080",
  },
  {
    id: "social",
    icon: "people",
    name: "Social Welfare",
    desc: "Women & child development, welfare schemes",
    color: "#6d3a00",
  },
];

// ------------------------------------------------------------------
// Page Component
// ------------------------------------------------------------------

export default async function LandingPage() {
  const [stats, projects] = await Promise.all([getStats(), getLatestProjects()]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ───────────────────────────────────────────── */}
      <LandingNav />

      {/* ── Hero Carousel ─────────────────────────────────────────── */}
      <main id="main">
        <HeroCarousel />

        {/* ── What's New Ticker ─────────────────────────────────── */}
        <NewsTicker announcements={ANNOUNCEMENTS} />

        {/* ── Who We Are ─────────────────────────────────────────── */}
        <section id="about" className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <span className="text-[#fe9832] text-sm font-semibold uppercase tracking-widest">
                Who We Are
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-[#00003c] font-[family:var(--font-public-sans)] mb-5">
                About NIRMAAN
              </h2>
              <p className="text-on-surface-variant leading-relaxed font-[family:var(--font-inter)] mb-4">
                NIRMAAN (Networked Infrastructure & Resource Management for Administration and
                Nodal Authorities) is the official project management system of the Maharashtra
                Zilla Parishad. It provides a unified digital platform for planning, executing,
                and monitoring government infrastructure projects across all 34 districts of
                Maharashtra.
              </p>
              <p className="text-on-surface-variant leading-relaxed font-[family:var(--font-inter)] mb-6">
                The system enables seamless coordination between district officers, contractors,
                and administrative bodies — ensuring transparent financial tracking, real-time
                progress monitoring, and accountable governance at every level of the
                Panchayati Raj Institution.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#insights"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00003c] text-white rounded hover:bg-[#000080] transition text-sm font-medium"
                >
                  View Project Insights
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#00003c] text-[#00003c] rounded hover:bg-surface-container transition text-sm font-medium"
                >
                  Officer Login
                </Link>
              </div>
            </div>

            {/* About image placeholder */}
            <div
              data-image-slot={LANDING_IMAGES.about.slot}
              className="rounded-xl overflow-hidden shadow-md"
            >
              {LANDING_IMAGES.about.src ? (
                <Image
                  src={LANDING_IMAGES.about.src}
                  alt={LANDING_IMAGES.about.label}
                  width={560}
                  height={400}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-72 md:h-96 bg-surface-container-high flex flex-col items-center justify-center gap-3 text-on-surface-variant/40">
                  <span className="material-symbols-outlined" style={{ fontSize: 56 }}>
                    photo_camera
                  </span>
                  <span className="text-sm uppercase tracking-widest">
                    {LANDING_IMAGES.about.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Live Project Insights ──────────────────────────────── */}
        <InsightsSection stats={stats} />

        {/* ── Our Capabilities / Gallery ─────────────────────────── */}
        <section id="gallery" className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[#fe9832] text-sm font-semibold uppercase tracking-widest">
                  Portfolio
                </span>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-[#00003c] font-[family:var(--font-public-sans)]">
                  Our Capabilities
                </h2>
              </div>
            </div>
            <GalleryCarousel />
          </div>
        </section>

        {/* ── Active Projects ─────────────────────────────────────── */}
        <section id="projects" className="py-16 px-4 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[#fe9832] text-sm font-semibold uppercase tracking-widest">
                  Portfolio
                </span>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-[#00003c] font-[family:var(--font-public-sans)]">
                  Active Projects
                </h2>
              </div>
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1 text-[#000080] text-sm font-medium hover:underline"
              >
                View All
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_forward
                </span>
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined" style={{ fontSize: 48 }}>
                  folder_open
                </span>
                <p className="mt-3 text-sm">No projects available yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((project) => {
                  const statusConf = STATUS_STYLES[project.status] ?? STATUS_STYLES.ONGOING;
                  const progress =
                    project.budgetPlanned > 0
                      ? Math.min(100, (project.budgetActual / project.budgetPlanned) * 100)
                      : 0;
                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-xl shadow-sm border border-outline-variant p-5 hover:shadow-md transition flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-[#00003c] font-[family:var(--font-public-sans)] leading-snug pr-2 line-clamp-2">
                          {project.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0 ${statusConf.className}`}
                        >
                          {statusConf.label}
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 font-[family:var(--font-inter)]">
                          {project.description}
                        </p>
                      )}

                      {project.officer?.name && (
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            person
                          </span>
                          {project.officer.name}
                        </p>
                      )}

                      {/* Budget progress */}
                      <div className="mt-auto">
                        <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                          <span>Budget Utilisation</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#00003c] transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-on-surface-variant">
                          <span>{formatBudget(project.budgetActual)} spent</span>
                          <span>{formatBudget(project.budgetPlanned)} planned</span>
                        </div>
                      </div>

                      <Link
                        href="/login"
                        className="mt-4 text-[#000080] text-xs font-medium hover:underline self-start"
                      >
                        View more →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-[#000080] text-sm font-medium"
              >
                View All Projects
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── District Coverage ───────────────────────────────────── */}
        <section className="bg-[#00003c] text-white py-16 px-4">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <span className="text-[#fe9832] text-sm font-semibold uppercase tracking-widest">
                Reach
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold font-[family:var(--font-public-sans)] mb-5">
                District Coverage
              </h2>
              <p className="text-white/75 leading-relaxed font-[family:var(--font-inter)] mb-6">
                NIRMAAN spans all 34 districts of Maharashtra, supporting Zilla Parishad offices
                from Konkan to Vidarbha. Every project, from rural road construction to health
                centre upgrades, is tracked in real time. The system currently covers over 350+
                sub-divisions and 6 administrative divisions under the Maharashtra Government.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fe9832] text-[#00003c] rounded hover:opacity-90 transition text-sm font-semibold">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    map
                  </span>
                  View Locations
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white rounded hover:bg-white/10 transition text-sm font-medium">
                  Contact Us
                </button>
              </div>
            </div>

            {/* Maharashtra map SVG */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <svg
                  viewBox="0 0 400 300"
                  className="w-full opacity-80"
                  aria-label="Maharashtra state outline map"
                >
                  {/* Simplified Maharashtra outline polygon */}
                  <polygon
                    points="
                      60,40 90,30 130,25 160,30 190,20 220,25 260,20 300,30 340,50
                      360,80 370,110 355,140 345,170 330,200 300,220 270,240
                      240,250 210,260 180,265 155,260 130,250 105,235 85,215
                      65,195 50,170 38,145 30,120 35,90 45,65
                    "
                    fill="none"
                    stroke="#fe9832"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* District dots */}
                  {[
                    [120, 80], [180, 70], [240, 75], [300, 90],
                    [100, 130], [160, 120], [220, 110], [280, 125],
                    [140, 175], [200, 165], [260, 180], [310, 165],
                    [170, 220], [230, 215],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="4" fill="#fe9832" opacity="0.7" />
                  ))}
                  {/* Watermark */}
                  <text
                    x="200"
                    y="160"
                    textAnchor="middle"
                    fontSize="28"
                    fontWeight="bold"
                    fill="white"
                    opacity="0.08"
                    fontFamily="sans-serif"
                    letterSpacing="4"
                  >
                    MAHARASHTRA
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ── Departments We Serve ────────────────────────────────── */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[#fe9832] text-sm font-semibold uppercase tracking-widest">
                  Services
                </span>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-[#00003c] font-[family:var(--font-public-sans)]">
                  Departments We Serve
                </h2>
              </div>
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1 text-[#000080] text-sm font-medium hover:underline"
              >
                View all
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
              {DEPARTMENTS.map((dept) => (
                <div
                  key={dept.id}
                  className="flex-shrink-0 w-[220px] rounded-xl border border-outline-variant bg-white hover:shadow-md transition overflow-hidden"
                  style={{ borderTopColor: dept.color, borderTopWidth: 4 }}
                >
                  <div className="p-5">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: dept.color + "18" }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 26, color: dept.color }}
                      >
                        {dept.icon}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#00003c] font-[family:var(--font-public-sans)] mb-1.5">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {dept.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="bg-[#00003c] text-white">
          <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
              {/* Logo + social */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-[#fe9832]" style={{ fontSize: 36 }}>
                    shield
                  </span>
                  <div>
                    <div className="font-bold text-xl font-[family:var(--font-public-sans)]">
                      NIRMAAN
                    </div>
                    <div className="text-xs text-white/60">Project Management System</div>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-xs">
                  Empowering Maharashtra&apos;s Zilla Parishad with digital-first, transparent
                  project governance.
                </p>
                <div className="flex gap-3">
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-label="Twitter / X"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L2.42 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-label="YouTube"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Link columns */}
              {[
                {
                  heading: "About",
                  links: ["About NIRMAAN", "Vision & Mission", "Team", "Governance", "Careers"],
                },
                {
                  heading: "Officers",
                  links: ["Officer Login", "Register", "Handbook", "Training", "Support"],
                },
                {
                  heading: "Projects",
                  links: ["All Projects", "By District", "By Department", "Reports", "Archive"],
                },
                {
                  heading: "Resources",
                  links: ["Guidelines", "Downloads", "Tenders", "Circulars", "RTI"],
                },
              ].map((col) => (
                <div key={col.heading}>
                  <h4 className="font-semibold text-sm uppercase tracking-widest text-[#fe9832] mb-4">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-sm text-white/60 hover:text-white transition"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Powered by */}
            <div className="border-t border-white/10 pt-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#fe9832]" style={{ fontSize: 22 }}>
                    computer
                  </span>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-widest">
                    Technology Partner
                  </div>
                  <div className="text-sm font-semibold">
                    Powered by{" "}
                    <span className="text-[#fe9832]">Digital India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="border-t border-white/10 bg-black/20">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
              <span>
                © 2025 NIRMAAN — Zilla Parishad Project Management System. All rights reserved.
              </span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition">
                  Terms &amp; Conditions
                </a>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
