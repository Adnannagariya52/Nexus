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
  Flame,
  CheckCircle2,
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

/* -------------------------------- overview -------------------------------- */

const TASKS = [
  { t: "Physics — problem set 7", done: true },
  { t: "Essay draft — introduction", done: true },
  { t: "Read Ch. 4: Thermodynamics", done: false },
  { t: "Flashcards: Spanish verbs", done: false },
];

const SCHEDULE = [
  { time: "09:00", s: "Mathematics", tag: "Lecture", tone: "bg-iris-soft text-iris-dark" },
  { time: "11:30", s: "Physics lab", tag: "Lab", tone: "bg-black/[0.05] text-black/60" },
  { time: "14:00", s: "Literature", tag: "Seminar", tone: "bg-black/[0.05] text-black/60" },
];

function StatChip({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Timer;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-[#FAFAF8] p-3">
      <div className="flex items-center gap-1.5 font-mono text-[8.5px] tracking-[0.18em] text-black/40">
        <Icon className={`size-3 ${accent ? "text-iris" : "text-black/40"}`} strokeWidth={2.4} />
        {label}
      </div>
      <div className="mt-1.5 text-[15px] font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export function DashboardScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-4 md:gap-4 md:p-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[9px] tracking-[0.25em] text-black/40">
            TUESDAY · MARCH 4
          </div>
          <div className="mt-1 text-[17px] font-semibold tracking-tight md:text-xl">
            Good morning, Ana
          </div>
        </div>
        <div className="hidden font-mono text-[9px] tracking-[0.25em] text-black/40 sm:block">
          WEEK 09 / 16
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <StatChip icon={Flame} label="STREAK" value="9 days" />
        <StatChip icon={Timer} label="FOCUS TODAY" value="2h 48m" accent />
        <StatChip icon={CheckCircle2} label="TASKS" value="5 / 8" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-5 gap-2 md:gap-3">
        <div className="col-span-5 flex min-h-0 flex-col rounded-xl border border-black/[0.06] p-3 sm:col-span-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-[0.25em] text-black/40">TODAY</span>
            <span className="font-mono text-[9px] text-iris">4 LEFT</span>
          </div>
          <div className="space-y-[7px] overflow-hidden">
            {TASKS.map((task) => (
              <div key={task.t} className="flex items-center gap-2.5">
                {task.done ? (
                  <CheckCircle2 className="size-[15px] shrink-0 text-iris" strokeWidth={2.2} />
                ) : (
                  <span className="size-[15px] shrink-0 rounded-[5px] border border-black/20" />
                )}
                <span
                  className={`truncate text-[11.5px] ${
                    task.done ? "text-black/35 line-through" : "text-black/80"
                  }`}
                >
                  {task.t}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto hidden items-center gap-2 rounded-lg bg-iris-soft/60 p-2.5 sm:flex">
            <Sparkles className="size-3.5 shrink-0 text-iris" strokeWidth={2.2} />
            <span className="text-[10.5px] leading-snug text-iris-dark">
              Quiz Thursday — 20 min of Physics review scheduled at 17:00.
            </span>
          </div>
        </div>

        <div className="col-span-2 hidden min-h-0 flex-col rounded-xl border border-black/[0.06] p-3 sm:flex">
          <div className="mb-2 font-mono text-[9px] tracking-[0.25em] text-black/40">UP NEXT</div>
          <div className="space-y-2">
            {SCHEDULE.map((ev) => (
              <div key={ev.time} className="flex items-center gap-2.5">
                <span className="w-8 font-mono text-[9.5px] text-black/45">{ev.time}</span>
                <span className="flex-1 truncate text-[11px] font-medium text-black/80">{ev.s}</span>
                <span className={`rounded-full px-1.5 py-0.5 font-mono text-[8px] tracking-wide ${ev.tone}`}>
                  {ev.tag}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto border-t border-black/[0.06] pt-2.5">
            <div className="flex justify-between font-mono text-[8.5px] tracking-[0.15em] text-black/40">
              <span>WEEK LOAD</span>
              <span className="text-ink">BALANCED</span>
            </div>
            <div className="mt-1.5 flex gap-1">
              {[70, 45, 85, 60, 40, 20, 15].map((v, i) => (
                <div key={i} className="flex h-8 flex-1 items-end rounded-[4px] bg-black/[0.035]">
                  <div
                    className={`w-full rounded-[4px] ${i === 2 ? "bg-iris" : "bg-ink/70"}`}
                    style={{ height: `${v}%`, opacity: i === 2 ? 1 : 0.35 + v / 200 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- planner --------------------------------- */

const WEEK: { d: string; n: string; today?: boolean; events: { t: string; tone: "violet" | "dark" | "line"; span?: boolean }[] }[] = [
  { d: "MON", n: "3", events: [{ t: "Math — Lecture", tone: "line" }, { t: "Gym", tone: "line" }] },
  { d: "TUE", n: "4", today: true, events: [{ t: "Physics lab", tone: "dark" }, { t: "Essay draft", tone: "violet" }] },
  { d: "WED", n: "5", events: [{ t: "Chem — Problem set", tone: "line" }] },
  { d: "THU", n: "6", events: [{ t: "Physics quiz", tone: "violet" }, { t: "Study group", tone: "line" }] },
  { d: "FRI", n: "7", events: [{ t: "Literature", tone: "line" }] },
  { d: "SAT", n: "8", events: [{ t: "Deep work — 3h", tone: "dark" }] },
  { d: "SUN", n: "9", events: [{ t: "Weekly reset", tone: "violet" }] },
];

export function PlannerScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight">March 2026</span>
        <div className="flex gap-1.5 font-mono text-[9px] tracking-[0.15em]">
          <span className="rounded-full bg-ink px-2.5 py-1 text-white">WEEK</span>
          <span className="rounded-full border border-black/10 px-2.5 py-1 text-black/50">MONTH</span>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 gap-1.5">
        {WEEK.map((day) => (
          <div key={day.d} className="flex min-h-0 flex-col gap-1">
            <div className="flex items-baseline justify-between px-0.5">
              <span className="font-mono text-[8px] tracking-[0.2em] text-black/40">{day.d}</span>
              <span
                className={`font-mono text-[8.5px] ${
                  day.today ? "grid size-3.5 place-items-center rounded-full bg-iris text-[7px] text-white" : "text-black/50"
                }`}
              >
                {day.n}
              </span>
            </div>
            {day.events.map((ev) => (
              <div
                key={ev.t}
                className={`truncate rounded-[5px] px-1 py-[3px] text-[7.5px] font-medium leading-tight md:text-[8.5px] ${
                  ev.tone === "violet"
                    ? "bg-iris-soft text-iris-dark"
                    : ev.tone === "dark"
                      ? "bg-coal text-white/85"
                      : "border border-black/10 text-black/55"
                }`}
              >
                {ev.t}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-black/[0.06] pt-2 font-mono text-[8.5px] tracking-[0.15em] text-black/40">
        <span>6 EVENTS · 2 EXAMS</span>
        <span className="flex items-center gap-1 text-iris">
          AUTO-BALANCED <Sparkles className="size-2.5" />
        </span>
      </div>
    </div>
  );
}

/* --------------------------------- tutor ---------------------------------- */

export function TutorScreen() {
  return (
    <div className="flex h-full flex-col gap-2.5 p-4 md:gap-3 md:p-5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 font-mono text-[8.5px] tracking-[0.2em] text-black/40">YOU</span>
        <div className="rounded-lg rounded-tl-sm border border-black/[0.07] bg-[#FAFAF8] px-3 py-2 text-[11.5px] text-black/80">
          Why is the derivative of sin x equal to cos x?
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 font-mono text-[8.5px] tracking-[0.2em] text-iris">NEXUS</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] leading-relaxed text-black/75">
            The derivative measures how steeply a function changes. Along sin x, that
            steepness traces out the cosine curve — at x = 0 the slope is 1, at the
            peak it is 0.
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {["sin x", "d/dx", "cos x"].map((c, i) => (
              <span key={c} className="flex items-center gap-1.5">
                <span className="rounded-full border border-iris/30 bg-iris-soft/50 px-2 py-[3px] font-mono text-[8.5px] text-iris-dark">
                  {c}
                </span>
                {i < 2 && <ArrowRight className="size-2.5 text-black/30" />}
              </span>
            ))}
            <span className="ml-1 font-mono text-[8px] tracking-[0.15em] text-black/35">
              CONCEPT MAP
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <div className="rounded-lg border border-black/[0.07] p-2.5 font-mono text-[9.5px] leading-relaxed text-black/60">
          <span className="text-black/35">// worked example</span>
          <br />
          f(x) = sin x ⇒ f′(x) = cos x
          <br />f′(0) = cos 0 = <span className="text-iris">1</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-ink px-3 py-2 text-white">
          <span className="font-mono text-[8.5px] tracking-[0.18em] text-white/60">
            PRACTICE SET READY — 3 QUESTIONS
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] tracking-wide text-iris-soft">
            START <ArrowRight className="size-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- focus ---------------------------------- */

export function FocusScreen() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 p-4">
      <span className="font-mono text-[8.5px] tracking-[0.3em] text-black/40">
        DEEP WORK · PHYSICS CH.4
      </span>
      <div className="relative grid place-items-center">
        <svg viewBox="0 0 120 120" className="size-[104px] -rotate-90 md:size-[120px]">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#0000000d" strokeWidth="2" />
          <circle
            cx="60" cy="60" r="52" fill="none" stroke="#6C63FF" strokeWidth="2"
            strokeLinecap="round" strokeDasharray="326.7" strokeDashoffset="104"
          />
        </svg>
        <div className="absolute text-center">
          <div className="font-mono text-[22px] font-light tracking-tight md:text-[26px]">25:00</div>
        </div>
      </div>
      <div className="flex h-4 items-end gap-[3px]">
        {[0.5, 1, 0.7, 0.9, 0.6].map((v, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-ink/50"
            style={{ height: 16, transformOrigin: "bottom" }}
            animate={{ scaleY: [v, 1 - v * 0.4, v] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
      <span className="text-[10.5px] text-black/40">The world can wait.</span>
    </div>
  );
}

/* -------------------------------- analytics ------------------------------- */

const HEAT = [
  0.1, 0.45, 0.2, 0.7, 0.3, 0.9, 0.15,
  0.35, 0.6, 0.1, 0.8, 0.5, 0.25, 1,
  0.2, 0.55, 0.4, 0.65, 0.3, 0.75, 0.5,
];

export function AnalyticsScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.25em] text-black/40">THIS WEEK</span>
        <span className="rounded-full bg-iris-soft px-2 py-0.5 font-mono text-[8.5px] text-iris-dark">
          +38% CONSISTENCY
        </span>
      </div>

      <div className="flex gap-4">
        {[
          { l: "FOCUS", v: "14h 20m" },
          { l: "SESSIONS", v: "12" },
          { l: "BEST DAY", v: "THU" },
        ].map((s) => (
          <div key={s.l}>
            <div className="font-mono text-[8px] tracking-[0.2em] text-black/40">{s.l}</div>
            <div className="mt-0.5 text-[15px] font-semibold tracking-tight">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        <svg viewBox="0 0 520 150" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[30, 70, 110].map((y) => (
            <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="#000" strokeOpacity="0.05" strokeWidth="1" />
          ))}
          <path
            d="M0 118 C 45 112, 60 78, 95 76 S 165 96, 205 84 S 285 34, 325 40 S 415 62, 455 36 S 505 22, 520 20 L 520 150 L 0 150 Z"
            fill="url(#ag)"
          />
          <path
            d="M0 118 C 45 112, 60 78, 95 76 S 165 96, 205 84 S 285 34, 325 40 S 415 62, 455 36 S 505 22, 520 20"
            fill="none" stroke="#6C63FF" strokeWidth="2" vectorEffect="non-scaling-stroke"
          />
          {[
            { x: 95, y: 76 },
            { x: 325, y: 40 },
            { x: 520, y: 20 },
          ].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#6C63FF" strokeWidth="2" />
          ))}
        </svg>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1">
          {HEAT.map((v, i) => (
            <div
              key={i}
              className="aspect-square rounded-[3px]"
              style={{ backgroundColor: i === 13 ? "#6C63FF" : `rgba(17,17,17,${0.05 + v * 0.28})` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[7.5px] tracking-[0.2em] text-black/35">
          <span>MON</span>
          <span>SUN</span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- goals ---------------------------------- */

const GOALS = [
  { t: "Finish Calculus course", p: 72, tone: "#6C63FF" },
  { t: "Read 12 books this year", p: 42, tone: "#151515" },
  { t: "SAT target — 1500", p: 58, tone: "#151515" },
  { t: "30-day focus streak", p: 30, tone: "#151515" },
];

export function GoalsScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.25em] text-black/40">SEMESTER GOALS</span>
        <span className="rounded-full border border-black/10 px-2 py-0.5 font-mono text-[8.5px] text-black/50">
          + NEW GOAL
        </span>
      </div>
      <div className="space-y-3.5">
        {GOALS.map((g) => (
          <div key={g.t}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[11.5px] font-medium text-black/80">{g.t}</span>
              <span className="font-mono text-[9px] text-black/45">{g.p}%</span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-full bg-black/[0.06]">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: g.tone }}
                initial={{ width: 0 }}
                whileInView={{ width: `${g.p}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-iris-soft/60 p-3">
        <Target className="size-4 text-iris" strokeWidth={2.2} />
        <span className="text-[10.5px] leading-snug text-iris-dark">
          On pace to finish Calculus 6 days early. Keep the streak alive.
        </span>
      </div>
    </div>
  );
}

/* ------------------------------ screen router ------------------------------ */

export function Screen({ id }: { id: ScreenId }) {
  switch (id) {
    case "planner":
      return <PlannerScreen />;
    case "tutor":
      return <TutorScreen />;
    case "focus":
      return <FocusScreen />;
    case "analytics":
      return <AnalyticsScreen />;
    case "goals":
      return <GoalsScreen />;
    default:
      return <DashboardScreen />;
  }
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
