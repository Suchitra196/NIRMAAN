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

import { TOTAL_DISTRICTS_COUNT } from "@/lib/maharashtra";
import { SAMPLE_PROJECTS, SAMPLE_STATS } from "@/lib/sampleProjects";

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

    if (!total || total === 0) {
      return {
        totalProjects: SAMPLE_STATS.totalProjects,
        ongoingProjects: SAMPLE_STATS.ongoingProjects,
        delayedProjects: SAMPLE_STATS.delayedProjects,
        completedProjects: SAMPLE_STATS.completedProjects,
        totalBudgetPlanned: SAMPLE_STATS.totalBudgetPlanned,
        totalBudgetActual: SAMPLE_STATS.totalBudgetActual,
      };
    }

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
      totalProjects: SAMPLE_STATS.totalProjects,
      ongoingProjects: SAMPLE_STATS.ongoingProjects,
      delayedProjects: SAMPLE_STATS.delayedProjects,
      completedProjects: SAMPLE_STATS.completedProjects,
      totalBudgetPlanned: SAMPLE_STATS.totalBudgetPlanned,
      totalBudgetActual: SAMPLE_STATS.totalBudgetActual,
    };
  }
}

async function getLatestProjects(): Promise<PublicProject[]> {
  try {
    const projects = await prisma.project.findMany({
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

    if (!projects || projects.length === 0) {
      return SAMPLE_PROJECTS.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        budgetPlanned: p.budgetPlanned,
        budgetActual: p.budgetActual,
        officer: { name: p.officerName },
      }));
    }

    return projects;
  } catch {
    return SAMPLE_PROJECTS.slice(0, 6).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      budgetPlanned: p.budgetPlanned,
      budgetActual: p.budgetActual,
      officer: { name: p.officerName },
    }));
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
                NIRMAAN (Networked Infrastructure &amp; Resource Management for Administration and
                Nodal Authorities) is an academic project management platform demonstrating transparent
                public infrastructure finance. It models a unified digital framework for planning, executing,
                and monitoring public development projects across all {TOTAL_DISTRICTS_COUNT} districts of
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
                NIRMAAN models project tracking across all {TOTAL_DISTRICTS_COUNT} districts of Maharashtra,
                demonstrating transparent workflow tracking from Konkan to Vidarbha. Every project, from rural road
                construction to health centre upgrades, is tracked in simulated real time across 6 administrative divisions.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/locations"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fe9832] text-[#00003c] rounded hover:opacity-90 transition text-sm font-semibold"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    map
                  </span>
                  View All {TOTAL_DISTRICTS_COUNT} Districts
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white rounded hover:bg-white/10 transition text-sm font-medium"
                >
                  Contact Us
                </Link>
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
                  <Link
                    href="/about"
                    aria-label="About NIRMAAN"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
                  >
                    <span className="material-symbols-outlined text-sm">info</span>
                  </Link>
                  <Link
                    href="/contact"
                    aria-label="Contact Us"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </Link>
                  <Link
                    href="/sitemap"
                    aria-label="Sitemap"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
                  >
                    <span className="material-symbols-outlined text-sm">map</span>
                  </Link>
                </div>
              </div>

              {/* Link columns */}
              {[
                {
                  heading: "About",
                  links: [
                    { label: "About NIRMAAN", href: "/about" },
                    { label: "Vision & Mission", href: "/vision-mission" },
                    { label: "Governance & RBAC", href: "/governance" },
                    { label: "Locations Directory", href: "/locations" },
                    { label: "FAQs & Help", href: "/faq" },
                  ],
                },
                {
                  heading: "Portals",
                  links: [
                    { label: "Officer Login", href: "/login" },
                    { label: "Contractor Sign In", href: "/login" },
                    { label: "New Account Request", href: "/register" },
                    { label: "Pending Approvals", href: "/pending-approval" },
                    { label: "Support & Grievances", href: "/contact" },
                  ],
                },
                {
                  heading: "Projects",
                  links: [
                    { label: "36 Maharashtra Districts", href: "/locations" },
                    { label: "Public Project Insights", href: "#insights" },
                    { label: "Works & Infrastructure", href: "/tenders" },
                    { label: "Administrative Reports", href: "/governance" },
                    { label: "RTI Public Disclosures", href: "/rti" },
                  ],
                },
                {
                  heading: "Resources",
                  links: [
                    { label: "Circulars & Directives", href: "/circulars" },
                    { label: "Downloads & Manuals", href: "/downloads" },
                    { label: "Simulated Tenders", href: "/tenders" },
                    { label: "Accessibility Statement", href: "/accessibility" },
                    { label: "Full Sitemap", href: "/sitemap" },
                  ],
                },
              ].map((col) => (
                <div key={col.heading}>
                  <h4 className="font-semibold text-sm uppercase tracking-widest text-[#fe9832] mb-4">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-white/60 hover:text-white transition"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Academic Prototype Banner */}
            <div className="border-t border-white/10 pt-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#fe9832]" style={{ fontSize: 22 }}>
                    school
                  </span>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-widest">
                    Academic Prototype
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Non-Governmental Educational Demonstration &bull;{" "}
                    <span className="text-[#fe9832]">Simulated Sample Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="border-t border-white/10 bg-black/20">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
              <span>
                &copy; NIRMAAN (GPOMS) — Academic Demonstration Portal. Developed for research &amp; education. All data is sample data.
              </span>
              <div className="flex gap-4">
                <Link href="/terms" className="hover:text-white transition">
                  Terms &amp; Conditions
                </Link>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
                <Link href="/accessibility" className="hover:text-white transition">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
