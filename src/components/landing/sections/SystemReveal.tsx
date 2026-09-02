"use client"

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  clamp,
  coverScale,
  EASE,
  STAGE_H,
  STAGE_W,
  usePrefersReducedMotion,
  useSmooth,
  useViewportSize,
  windowBox,
} from "@/lib/landing-hooks";
import { ScaledStage, Screen, WindowChrome, type ScreenId } from "@/components/landing/NexusUI";

const STAGES: { id: ScreenId; label: string }[] = [
  { id: "overview", label: "OVERVIEW" },
  { id: "planner", label: "PLANNER" },
  { id: "tutor", label: "AI TUTOR" },
  { id: "focus", label: "FOCUS" },
  { id: "analytics", label: "ANALYTICS" },
];

export default function SystemReveal() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { w, h } = useViewportSize();
  const [idx, setIdx] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSmooth(scrollYProgress);

  useMotionValueEvent(p, "change", (v) => {
    const next = clamp(Math.floor(v * STAGES.length + 0.02), 0, STAGES.length - 1);
    setIdx((prev) => (prev === next ? prev : next));
  });

  /* The camera pulls back out of the product — identical geometry to the hero,
     so the hand-off between the two chapters is invisible. */
  const box = windowBox(w);
  const cover = coverScale(w, h, box);
  const winScale = useTransform(p, [0, 0.085], [cover, 1]);
  const winRadius = useTransform(p, [0, 0.085], [0, 18]);

  const stage = STAGES[idx];

  /* ------------------------- reduced-motion variant ------------------------ */
  if (reduced) {
    return (
      <section id="system" className="relative px-5 py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIdx(i)}
                className={`rounded-full border px-4 py-2 font-mono text-[10px] tracking-[0.2em] transition-colors ${
                  i === idx ? "border-ink bg-ink text-white" : "border-black/15 text-black/60"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="mx-auto overflow-hidden rounded-[18px] border border-black/[0.07] bg-white shadow-[0_80px_160px_-40px_rgba(9,9,9,0.30),0_30px_60px_-30px_rgba(9,9,9,0.18)]">
            <ScaledStage width={STAGE_W} height={STAGE_H} scale={box.w / STAGE_W}>
              <WindowChrome active={stage.id}>
                <Screen id={stage.id} />
              </WindowChrome>
            </ScaledStage>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="system" className="relative h-[520vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* chapter marker */}
        <div className="absolute top-9 left-1/2 -translate-x-1/2 text-center">
          <span className="font-mono text-[9px] tracking-[0.45em] text-ink/40">
            01 — ONE SYSTEM, EVERY SURFACE
          </span>
        </div>

        {/* ghost stage word */}
        <div className="pointer-events-none absolute inset-0 grid select-none place-items-center">
          <AnimatePresence initial={false}>
            <motion.span
              key={stage.id}
              className="col-start-1 row-start-1 block whitespace-nowrap font-display text-[15vw] font-bold tracking-[-0.05em] text-black/[0.04] md:text-[13vw]"
              initial={{ y: "6%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-6%", opacity: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {stage.label}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* left rail — stage index */}
        <div className="absolute left-8 top-1/2 hidden -translate-y-1/2 flex-col gap-5 lg:flex">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <span
                className={`font-mono text-[9px] transition-colors duration-500 ${
                  i === idx ? "text-iris" : "text-ink/25"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`h-px transition-all duration-500 ${
                  i === idx ? "w-7 bg-ink" : "w-3.5 bg-ink/20"
                }`}
              />
              <span
                className={`font-mono text-[9px] tracking-[0.25em] transition-colors duration-500 ${
                  i === idx ? "text-ink" : "text-ink/30"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* the living window */}
        <motion.div
          className="relative z-10 overflow-hidden border border-black/[0.07] bg-white will-change-transform"
          style={{
            scale: winScale,
            borderRadius: winRadius,
            width: box.w,
            boxShadow:
              "0 80px 160px_-40px rgba(9,9,9,0.30), 0 30px 60px_-30px rgba(9,9,9,0.18)",
          }}
        >
          <ScaledStage width={STAGE_W} height={STAGE_H} scale={box.w / STAGE_W}>
          <WindowChrome active={stage.id}>
            <div className="relative h-full w-full">
              <AnimatePresence initial={false}>
                <motion.div
                  key={stage.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: 70, scale: 0.986 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -70, scale: 0.986 }}
                  transition={{ duration: 0.62, ease: EASE }}
                >
                  <Screen id={stage.id} />
                </motion.div>
              </AnimatePresence>
            </div>
          </WindowChrome>
          </ScaledStage>
        </motion.div>

        {/* right rail — morph progress */}
        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2.5 lg:flex">
          {STAGES.map((s, i) => (
            <span
              key={s.id}
              className={`h-[2.5px] rounded-full transition-all duration-500 ${
                i === idx ? "w-8 bg-ink" : i < idx ? "w-4 bg-ink/50" : "w-4 bg-ink/15"
              }`}
            />
          ))}
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <span className="font-mono text-[9px] tracking-[0.4em] text-ink/35">
            SCROLL — THE INTERFACE EVOLVES
          </span>
        </div>
      </div>
    </section>
  );
}
