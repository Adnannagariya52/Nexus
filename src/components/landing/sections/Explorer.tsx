"use client"

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { EASE, useIsMobile, usePointer, usePrefersReducedMotion, useViewportSize } from "@/lib/landing-hooks";
import { ScaledStage, Screen, WindowChrome, type ScreenId } from "@/components/landing/NexusUI";

interface Mode {
  id: ScreenId;
  label: string;
  name: string;
  desc: string;
}

const MODES: Mode[] = [
  { id: "tutor", label: "AI", name: "AI TUTOR", desc: "Ask anything — get taught, not told." },
  { id: "focus", label: "FOCUS", name: "FOCUS MODE", desc: "Deep work, protected by design." },
  { id: "planner", label: "PLAN", name: "PLANNER", desc: "Your week, balanced around exams." },
  { id: "analytics", label: "TRACK", name: "ANALYTICS", desc: "Proof that small days compound." },
  { id: "goals", label: "GROW", name: "GOALS", desc: "Turn semesters into missions." },
];

/* -------------------------------- orbit item ------------------------------- */

function OrbitItem({
  mode,
  index,
  total,
  rot,
  off,
  rx,
  ry,
  active,
  onEnter,
  onLeave,
}: {
  mode: Mode;
  index: number;
  total: number;
  rot: MotionValue<number>;
  off: MotionValue<number>;
  rx: number;
  ry: number;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const angle = useTransform([rot, off], (v) => {
    const [r, o] = v as number[];
    return ((r + o + index * (360 / total)) * Math.PI) / 180;
  });
  const x = useTransform(angle, (a) => Math.cos(a) * rx);
  const y = useTransform(angle, (a) => Math.sin(a) * ry);
  const s = useTransform(angle, (a) => 0.82 + ((Math.sin(a) + 1) / 2) * 0.26);
  const o = useTransform(angle, (a) => 0.34 + ((Math.sin(a) + 1) / 2) * 0.66);
  const z = useTransform(angle, (a) => Math.round(((Math.sin(a) + 1) / 2) * 10));

  return (
    <motion.div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ x, y, scale: s, opacity: o, zIndex: z }}>
      <button
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        className={`relative -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-5 py-2.5 font-mono text-[11px] tracking-[0.25em] transition-colors duration-500 ${
          active
            ? "border-ink bg-ink text-white"
            : "border-black/15 bg-paper/90 text-ink/60 hover:border-ink/40 hover:text-ink"
        }`}
      >
        {mode.label}
      </button>
    </motion.div>
  );
}

/* --------------------------------- section --------------------------------- */

export default function Explorer() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const { w } = useViewportSize();
  const [active, setActive] = useState(0);

  const rot = useMotionValue(0);
  const speed = useRef(reduced ? 0 : 0.022);
  const targetSpeed = useRef(reduced ? 0 : 0.022);

  const { x: mxRaw } = usePointer();
  const mx = useSpring(mxRaw, { stiffness: 40, damping: 18 });
  const off = useTransform(mx, [-0.5, 0.5], reduced ? [0, 0] : [-26, 26]);

  useAnimationFrame((_, delta) => {
    speed.current += (targetSpeed.current - speed.current) * 0.07;
    rot.set(rot.get() + (speed.current * delta) / 16.7);
  });

  const mode = MODES[active];
  const panelW = isMobile ? Math.min(w * 0.9, 460) : 560;
  const scale = panelW / 1040;
  const rx = Math.min(w * 0.34, 480);
  const ry = 215;

  const setHover = (i: number | null) => {
    if (i !== null) setActive(i);
    targetSpeed.current = reduced || i === null ? (reduced ? 0 : 0.022) : 0;
  };

  return (
    <section className="relative overflow-hidden px-6 py-[14vh]">
      <div className="text-center">
        <span className="font-mono text-[9.5px] tracking-[0.45em] text-ink/40">
          06 — THE ORBIT
        </span>
        <h2 className="font-display mt-6 text-[clamp(2.2rem,5.5vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink">
          FIVE INSTRUMENTS.
          <br />
          <span className="text-ink/35">ONE SCULPTURE.</span>
        </h2>
      </div>

      {/* mobile: simple chips */}
      {isMobile && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              className={`rounded-full border px-4 py-2 font-mono text-[10px] tracking-[0.2em] transition-colors ${
                i === active ? "border-ink bg-ink text-white" : "border-black/15 text-ink/60"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* sculpture */}
      <div className={`relative mx-auto ${isMobile ? "mt-10" : "mt-4 h-[680px]"}`}>
        {/* ghost watermark */}
        {!isMobile && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none text-[17vw] font-bold tracking-[-0.05em] text-black/[0.03]">
            NEXUS
          </span>
        )}

        {/* orbit guide */}
        {!isMobile && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.07]"
            style={{ width: rx * 2, height: ry * 2 }}
          />
        )}

        {/* preview panel */}
        <div
          className={`relative z-[5] mx-auto ${isMobile ? "" : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"}`}
          style={{ width: panelW }}
        >
          <div
            className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white"
            style={{ boxShadow: "0 60px 120px_-40px rgba(9,9,9,0.28), 0 24px 48px_-24px rgba(9,9,9,0.14)" }}
          >
            <ScaledStage width={1040} height={650} scale={scale}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode.id}
                  className="h-full w-full"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.015 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <WindowChrome active={mode.id}>
                    <Screen id={mode.id} />
                  </WindowChrome>
                </motion.div>
              </AnimatePresence>
            </ScaledStage>
          </div>

          {/* caption */}
          <div className="mt-6 text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <div className="font-mono text-[8.5px] tracking-[0.35em] text-iris">
                  {String(active + 1).padStart(2, "0")} / 05 — {mode.name}
                </div>
                <p className="mt-2 text-[13.5px] text-ink/55">{mode.desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* orbiting labels */}
        {!isMobile &&
          MODES.map((m, i) => (
            <OrbitItem
              key={m.id}
              mode={m}
              index={i}
              total={MODES.length}
              rot={rot}
              off={off}
              rx={rx}
              ry={ry}
              active={i === active}
              onEnter={() => setHover(i)}
              onLeave={() => setHover(null)}
            />
          ))}
      </div>
    </section>
  );
}
