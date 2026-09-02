"use client"

import { useId, type ReactNode } from "react";
import { motion, LayoutGroup } from "framer-motion";
import {
  LayoutGrid,
  CalendarDays,
  Sparkles,
  Timer,
  BarChart3,
  Target,
  Search,
  ArrowRight,
} from "lucide-react";

/* ============================== building blocks ============================ */

export type ScreenId =
  | "overview"
  | "planner"
  | "tutor"
  | "focus"
  | "analytics"
  | "goals";

const NAV: { id: ScreenId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "planner", label: "Planner", icon: CalendarDays },
  { id: "tutor", label: "AI Tutor", icon: Sparkles },
  { id: "focus", label: "Focus", icon: Timer },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "goals", label: "Goals", icon: Target },
];

// Map screen IDs to screenshot paths
const SCREENSHOTS: Record<ScreenId, string> = {
  overview: "/screenshots/dashboard.png",
  planner: "/screenshots/planner.png",
  tutor: "/screenshots/ai-tutor.png",
  focus: "/screenshots/focus.png",
  analytics: "/screenshots/analytics.png",
  goals: "/screenshots/goals.png",
};

export function Mark({ className = "size-6" }: { className?: string }) {
  return (
    <div className={`grid place-items-center rounded-[7px] bg-ink ${className}`}>
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none">
        <path
          d="M7 18V6l10 12V6"
          stroke="#6C63FF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export const SIDEBAR_ITEMS = NAV;

/* --------------------------------- chrome --------------------------------- */

export function WindowChrome({
  active = "overview",
  children,
}: {
  active?: ScreenId;
  children: ReactNode;
}) {
  const groupId = useId();
  return (
    <div className="flex h-full w-full flex-col bg-white text-ink">
      {/* top bar */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-black/[0.06] px-4">
        <div className="flex items-center gap-2">
          <Mark className="size-5 rounded-[5px]" />
          <span className="font-mono text-[10px] font-medium tracking-[0.3em]">
            NEXUS
          </span>
        </div>
        <div className="mx-auto hidden h-6 w-52 items-center gap-2 rounded-full bg-black/[0.045] px-2.5 sm:flex">
          <Search className="size-3 text-black/35" strokeWidth={2.4} />
          <span className="text-[10px] text-black/35">
            Search subjects, tasks, notes…
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <span className="hidden rounded-full border border-black/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-black/50 md:block">
            + NEW
          </span>
          <span className="grid size-5 place-items-center rounded-full bg-iris-soft text-[9px] font-semibold text-iris-dark">
            A
          </span>
        </div>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[168px] shrink-0 flex-col border-r border-black/[0.05] p-2.5 md:flex">
          <LayoutGroup id={groupId}>
            {NAV.map((item) => {
              const isActive = item.id === active;
              return (
                <div
                  key={item.id}
                  className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[10.5px] font-medium transition-colors duration-300 ${
                    isActive ? "text-ink" : "text-black/40"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidepill"
                      className="absolute inset-0 rounded-lg bg-black/[0.05]"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <item.icon
                    className={`relative size-3.5 ${isActive ? "text-iris" : ""}`}
                    strokeWidth={2.2}
                  />
                  <span className="relative">{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="sidedot"
                      className="relative ml-auto size-1 rounded-full bg-iris"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </div>
              );
            })}
          </LayoutGroup>
          <div className="mt-auto flex items-center gap-2.5 rounded-lg border border-black/[0.06] p-2.5">
            <svg viewBox="0 0 32 32" className="size-7 -rotate-90">
              <circle cx="16" cy="16" r="13" fill="none" stroke="#00000010" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="13" fill="none" stroke="#6C63FF" strokeWidth="3"
                strokeLinecap="round" strokeDasharray="81.7" strokeDashoffset="24"
              />
            </svg>
            <div>
              <div className="font-mono text-[8.5px] tracking-[0.2em] text-black/40">STREAK</div>
              <div className="text-[11px] font-semibold leading-tight">9 days</div>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

/* ------------------------------ screenshot screens ------------------------------ */

// Each screen renders a real screenshot image that fills the available space.
// The WindowChrome provides the sidebar + top bar, so the screenshot
// shows the actual NEXUS application content area.

function ScreenshotScreen({ id }: { id: ScreenId }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#F5F5F2]">
      <img
        src={SCREENSHOTS[id]}
        alt={`NEXUS ${id} screen`}
        className="absolute inset-0 h-full w-full object-cover object-left-top"
        draggable={false}
      />
    </div>
  );
}

// Keep named exports for backward compatibility with landing page sections
export function DashboardScreen() { return <ScreenshotScreen id="overview" />; }
export function PlannerScreen() { return <ScreenshotScreen id="planner" />; }
export function TutorScreen() { return <ScreenshotScreen id="tutor" />; }
export function FocusScreen() { return <ScreenshotScreen id="focus" />; }
export function AnalyticsScreen() { return <ScreenshotScreen id="analytics" />; }
export function GoalsScreen() { return <ScreenshotScreen id="goals" />; }

/* ------------------------------ screen router ------------------------------ */

export function Screen({ id }: { id: ScreenId }) {
  return <ScreenshotScreen id={id} />;
}

/* ------------------------------ scaled stage ------------------------------- */

export function ScaledStage({
  width = 1040,
  height = 650,
  scale,
  children,
  className = "",
}: {
  width?: number;
  height?: number;
  scale: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: width * scale, height: height * scale }}
    >
      <div
        className="absolute left-0 top-0"
        style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
