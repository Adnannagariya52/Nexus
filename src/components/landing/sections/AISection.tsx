"use client"

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { EASE, usePrefersReducedMotion } from "@/lib/landing-hooks";

const STEPS = ["QUESTION", "THINKING", "EXPLANATION", "BREAKDOWN", "EXAMPLE", "PRACTICE"];
const DURATIONS = [3600, 2500, 5200, 4200, 3400, 4000];

/* ------------------------------- step content ------------------------------ */

function TypingText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <span>
      {text.slice(0, n)}
      <motion.span
        className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-iris"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />
    </span>
  );
}

function StepQuestion() {
  return (
    <motion.div
      className="flex h-full flex-col justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <span className="font-mono text-[9px] tracking-[0.3em] text-white/40">YOU ASK</span>
      <p className="mt-4 max-w-xl text-[22px] font-medium leading-snug tracking-tight text-white md:text-[28px]">
        <TypingText text="Why is the derivative of sin x equal to cos x?" />
      </p>
      <div className="mt-6 flex gap-2">
        {["CALCULUS", "CH.4", "EXAM IN 2 DAYS"].map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[8.5px] tracking-[0.15em] text-white/45"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function StepThinking() {
  return (
    <motion.div
      className="flex h-full flex-col justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="flex items-center gap-2.5 font-mono text-[9px] tracking-[0.3em] text-iris">
        <Sparkles className="size-3.5" />
        REASONING OVER YOUR COURSE MATERIAL
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1 rounded-full bg-iris"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
      <div className="mt-7 max-w-xl space-y-3">
        {[88, 64, 42].map((wdt, i) => (
          <div
            key={i}
            className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.07]"
            style={{ width: `${wdt}%` }}
          >
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-iris/50 to-transparent"
              animate={{ x: ["-110%", "330%"] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-7 font-mono text-[9px] tracking-[0.2em] text-white/35">
        connecting: derivatives → sin x → cosine curve → exam problems
      </div>
    </motion.div>
  );
}

const EXPLANATION =
  "The derivative measures how steeply a function changes at every point. Along sin x, that steepness itself traces the cosine curve. At x = 0 the slope is exactly 1 — the steepest climb. At the peak, it flattens to 0. Position and rate of change are one continuous motion.";

function StepExplanation() {
  return (
    <motion.div
      className="flex h-full flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <span className="font-mono text-[9px] tracking-[0.3em] text-iris">NEXUS EXPLAINS</span>
      <p className="mt-4 max-w-2xl border-l-2 border-iris/60 pl-5 text-[15px] leading-[1.75] text-white/85 md:text-[17px]">
        {EXPLANATION.split(" ").map((word, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.022 }}
          >
            {word}&nbsp;
          </motion.span>
        ))}
      </p>
    </motion.div>
  );
}

function StepBreakdown() {
  const lineAnim = {
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 0.9, delay: 0.3, ease: EASE },
  };
  const nodes = [
    { x: 44, label: "sin x", sub: "position" },
    { x: 252, label: "d/dx", sub: "rate of change" },
    { x: 460, label: "cos x", sub: "slope" },
  ];
  return (
    <motion.div
      className="flex h-full flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <span className="font-mono text-[9px] tracking-[0.3em] text-white/40">VISUAL BREAKDOWN</span>
      <svg viewBox="0 0 600 150" className="mt-4 w-full max-w-2xl">
        <motion.line x1="140" y1="55" x2="252" y2="55" stroke="url(#aig)" strokeWidth="1.5" {...lineAnim} />
        <motion.line x1="348" y1="55" x2="460" y2="55" stroke="url(#aig)" strokeWidth="1.5" {...lineAnim} />
        <defs>
          <linearGradient id="aig" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {nodes.map((n, i) => (
          <motion.g
            key={n.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.25, ease: EASE }}
          >
            <rect x={n.x} y="32" width="96" height="46" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.16)" />
            <circle cx={n.x + 14} cy="46" r="2.5" fill="#6C63FF" />
            <text x={n.x + 24} y="50" fill="rgba(255,255,255,0.9)" fontSize="13" fontFamily="Geist Mono, monospace">
              {n.label}
            </text>
            <text x={n.x + 14} y="66" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Geist Mono, monospace">
              {n.sub}
            </text>
          </motion.g>
        ))}
      </svg>
      <p className="mt-3 max-w-lg text-[12.5px] leading-relaxed text-white/45">
        One concept, three views. NEXUS links every idea back to your course graph.
      </p>
    </motion.div>
  );
}

function StepExample() {
  const lines = [
    { t: "f(x) = sin x", tone: "text-white/50" },
    { t: "f′(x) = cos x", tone: "text-white/85" },
    { t: "f′(0) = cos 0 = 1", tone: "text-white" },
  ];
  return (
    <motion.div
      className="flex h-full flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <span className="font-mono text-[9px] tracking-[0.3em] text-white/40">WORKED EXAMPLE</span>
      <div className="mt-4 max-w-xl rounded-xl border border-white/10 bg-white/[0.025] p-5">
        {lines.map((l, i) => (
          <motion.div
            key={l.t}
            className={`font-mono text-[15px] leading-loose md:text-[17px] ${l.tone}`}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.35, ease: EASE }}
          >
            {l.t}
            {i === 2 && (
              <motion.span
                className="ml-3 text-[11px] text-iris"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                — the slope at the origin is exactly 1
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function StepPractice() {
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPicked(true), 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      className="flex h-full flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <span className="font-mono text-[9px] tracking-[0.3em] text-white/40">
        PRACTICE — UNTIL IT STICKS
      </span>
      <p className="mt-4 text-[16px] font-medium text-white/90">
        d/dx of sin x = ?
      </p>
      <div className="mt-4 flex max-w-xl gap-3">
        {[
          { t: "cos x", ok: true },
          { t: "−sin x", ok: false },
        ].map((o) => (
          <div
            key={o.t}
            className={`flex flex-1 items-center justify-between rounded-xl border px-4 py-3.5 font-mono text-[13px] transition-all duration-500 ${
              picked && o.ok
                ? "border-iris/70 bg-iris/15 text-white"
                : "border-white/12 text-white/60"
            }`}
          >
            {o.t}
            {picked && o.ok && <CheckCircle2 className="size-4 text-iris" />}
          </div>
        ))}
      </div>
      <motion.span
        className="mt-4 font-mono text-[9px] tracking-[0.2em] text-iris"
        animate={{ opacity: picked ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        CORRECT — YOUR STREAK CONTINUES
      </motion.span>
    </motion.div>
  );
}

const STEP_COMPONENTS = [StepQuestion, StepThinking, StepExplanation, StepBreakdown, StepExample, StepPractice];

/* --------------------------------- section --------------------------------- */

export default function AISection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const t = setTimeout(() => {
      if (step >= STEPS.length - 1) {
        setStep(0);
        setLoop((l) => l + 1);
      } else {
        setStep(step + 1);
      }
    }, DURATIONS[step]);
    return () => clearTimeout(t);
  }, [inView, step, loop, reduced]);

  const Active = reduced ? StepExplanation : STEP_COMPONENTS[step];

  return (
    <section id="intelligence" className="relative overflow-hidden bg-abyss text-white">
      {/* dissolve out of the light chapter */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-24"
        style={{ background: "linear-gradient(to bottom, #F5F5F2, rgba(245,245,242,0))" }}
      />
      {/* ambience */}
      <div
        className="pointer-events-none absolute -right-[20vw] -top-[10vh] h-[70vw] w-[70vw] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(108,99,255,0.09), transparent 62%)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(108,99,255,0.05),transparent_55%)]" />

      <div ref={ref} className="relative mx-auto max-w-6xl px-6 py-[18vh] md:py-[22vh]">
        <div className="flex items-center gap-4">
          <span className="h-px w-10 bg-iris" />
          <span className="font-mono text-[9.5px] tracking-[0.45em] text-white/50">
            03 — INTELLIGENCE
          </span>
        </div>

        <div className="mt-10 grid gap-12 md:grid-cols-[1.5fr_1fr] md:items-end">
          <h2 className="font-display text-[clamp(2.7rem,6.6vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
            ASK ANYTHING.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(100deg,#ffffff 30%,rgba(255,255,255,0.32))" }}
            >
              UNDERSTAND EVERYTHING.
            </span>
          </h2>
          <p className="max-w-sm text-[14px] leading-relaxed text-white/45">
            Not a chatbot — a knowledge engine that reads your subjects, your notes and
            your deadlines, then teaches in the way your brain actually learns.
          </p>
        </div>

        {/* the knowledge engine */}
        <div className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[#0E0E11] md:mt-20">
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2"
            style={{ background: "radial-gradient(50% 100% at 50% 0%, rgba(108,99,255,0.12), transparent)" }}
          />

          <div className="relative p-5 md:p-9">
            {/* step rail */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex flex-1 items-center gap-2 md:gap-2.5">
                    <span
                      className={`size-1.5 shrink-0 rounded-full transition-all duration-500 ${
                        i === step || reduced
                          ? "bg-iris shadow-[0_0_12px_2px_rgba(108,99,255,0.6)]"
                          : i < step
                            ? "bg-white/70"
                            : "bg-white/20"
                      }`}
                    />
                    <span
                      className={`hidden font-mono text-[8px] tracking-[0.2em] transition-colors duration-500 sm:block ${
                        i === step ? "text-white" : i < step ? "text-white/50" : "text-white/25"
                      }`}
                    >
                      {s}
                    </span>
                    {i < STEPS.length - 1 && <span className="mx-1 h-px flex-1 bg-white/[0.08]" />}
                  </div>
                ))}
              </div>
            </div>

            {/* stage */}
            <div className="relative mt-6 h-[360px] md:h-[330px]">
              <AnimatePresence mode="wait" initial={false}>
                <Active key={reduced ? "static" : `${loop}-${step}`} />
              </AnimatePresence>
            </div>

            {/* status bar */}
            <div className="flex items-center justify-between border-t border-white/[0.07] pt-4 font-mono text-[8.5px] tracking-[0.22em] text-white/35">
              <span>NEXUS KNOWLEDGE ENGINE</span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-lime" />
                LIVE
                <span className="ml-2 text-white/25">
                  {String((reduced ? 3 : step + 1)).padStart(2, "0")} / 06
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
