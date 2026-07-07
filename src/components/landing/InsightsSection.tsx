"use client";

import AnimatedCounter from "./AnimatedCounter";

interface Stats {
  totalProjects: number;
  ongoingProjects: number;
  delayedProjects: number;
  completedProjects: number;
  totalBudgetActual: number;
}

function formatCrore(n: number): string {
  if (n === 0) return "₹0";
  const cr = n / 10000000;
  if (cr >= 1) return `₹${cr.toFixed(1)}Cr`;
  const lakh = n / 100000;
  if (lakh >= 1) return `₹${lakh.toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function InsightsSection({ stats }: { stats: Stats }) {
  const total = stats.totalProjects || 1;
  const ongoingPct = Math.round((stats.ongoingProjects / total) * 100);
  const delayedPct = Math.round((stats.delayedProjects / total) * 100);
  const completedPct = Math.round((stats.completedProjects / total) * 100);

  return (
    <section className="py-16 px-4 bg-surface-container-low" id="insights">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#fe9832] text-sm font-semibold uppercase tracking-widest">
            Live Data
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#00003c] mt-2 font-[family:var(--font-public-sans)]">
            Project Insights at a Glance
          </h2>
        </div>

        {/* Counter cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <AnimatedCounter
            target={stats.totalProjects}
            label="Total Projects"
            icon="folder_open"
            color="bg-[#00003c]"
          />
          <AnimatedCounter
            target={stats.ongoingProjects}
            label="Ongoing Projects"
            icon="construction"
            color="bg-[#000080]"
          />
          <AnimatedCounter
            target={stats.completedProjects}
            label="Completed Projects"
            icon="task_alt"
            color="bg-[#319e23]"
          />
          <AnimatedCounter
            target={stats.totalBudgetActual}
            format={formatCrore}
            label="Budget Disbursed"
            icon="currency_rupee"
            color="bg-[#fe9832]"
          />
        </div>

        {/* Progress breakdown bar */}
        {stats.totalProjects > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-outline-variant">
            <h3 className="text-sm font-semibold text-on-surface-variant mb-4 uppercase tracking-wide">
              Project Status Breakdown
            </h3>
            <div className="flex rounded-full overflow-hidden h-5 mb-4">
              <div
                className="bg-[#000080] transition-all duration-1000"
                style={{ width: `${ongoingPct}%` }}
                title={`Ongoing: ${ongoingPct}%`}
              />
              <div
                className="bg-[#fe9832] transition-all duration-1000"
                style={{ width: `${delayedPct}%` }}
                title={`Delayed: ${delayedPct}%`}
              />
              <div
                className="bg-[#319e23] transition-all duration-1000"
                style={{ width: `${completedPct}%` }}
                title={`Completed: ${completedPct}%`}
              />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#000080] inline-block" />
                <span className="text-on-surface-variant">Ongoing — {ongoingPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#fe9832] inline-block" />
                <span className="text-on-surface-variant">Delayed — {delayedPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#319e23] inline-block" />
                <span className="text-on-surface-variant">Completed — {completedPct}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
