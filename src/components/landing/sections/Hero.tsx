"use client"

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import {
  EASE,
  EASE_OUT,
  STAGE_H,
  STAGE_W,
  coverScale,
  useIsMobile,
  usePointer,
  usePrefersReducedMotion,
  useSmooth,
  useViewportSize,
  windowBox,
} from "@/lib/landing-hooks";
import { DashboardScreen, ScaledStage, WindowChrome } from "@/components/landing/NexusUI";

/* ============================ dimensional layers =========================== */

interface PlaneCfg {
  label: string;
  px: number;
  py: number;
  w: number;
  s: number;
  depth: number;
  drift: number;
  bars: number[];
}

function BackPlane({
  cfg,
  p,
  mx,
  my,
}: {
  cfg: PlaneCfg;
  p: MotionValue<number>;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const width = cfg.w * cfg.s;
  const opacity = useTransform(p, [0, 0.16, 0.36], [1, 1, 0]);
  const recede = useTransform(p, [0, 0.36], [1, 0.9]);
  const x = useTransform(
    [mx, p],
    (v) => (v[0] as number) * cfg.depth * 34 + (v[1] as number) * cfg.drift * 150
  );
  const y = useTransform(
    [my, p],
    (v) => (v[0] as number) * cfg.depth * 20 + (v[1] as number) * 60
  );

  return (
    <motion.div
      className="absolute left-1/2 top-0 z-0 will-change-transform"
      style={{
        marginLeft: cfg.px - width / 2,
        marginTop: cfg.py,
        width,
        opacity,
        scale: recede,
        x,
        y,
      }}
    >
      <div className="rounded-xl border border-black/[0.07] bg-white/85 p-3 shadow-[0_28px_60px_-32px_rgba(9,9,9,0.22)]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[7.5px] tracking-[0.28em] text-black/45">
            {cfg.label}
          </span>
          <span className="size-1 rounded-full bg-iris/70" />
        </div>
        <div className="mt-2.5 space-y-1.5">
          {cfg.bars.map((b, i) => (
            <div
              key={i}
              className="h-[4px] rounded-full bg-black/[0.09]"
              style={{ width: `${b}%` }}
            />
          ))}
        </div>
        <div className="mt-2.5 h-8 rounded-md bg-black/[0.045]" />
      </div>
    </motion.div>
  );
}

/* ================================ typography =============================== */

function MaskLine({ children }: { children: ReactNode }) {
  return (
    <span className="block overflow-hidden pb-[0.1em]">{children}</span>
  );
}

function Chars({
  text,
  ready,
  delay,
  wave = false,
  reduced = false,
  amp = 7,
}: {
  text: string;
  ready: boolean;
  delay: number;
  wave?: boolean;
  reduced?: boolean;
  amp?: number;
}) {
  return (
    <span aria-label={text} className="inline-flex">
      {text.split("").map((c, i) => (
        <span key={i} aria-hidden className="inline-block">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "118%" }}
            animate={ready ? { y: "0%" } : { y: "118%" }}
            transition={{ duration: 1.05, delay: delay + i * 0.034, ease: EASE_OUT }}
          >
            <motion.span
              className="inline-block"
              animate={
                !reduced && wave
                  ? { y: [0, amp, 0], rotate: [0, 1.1, -0.9, 0] }
                  : {}
              }
              transition={
                !reduced && wave
                  ? {
                      duration: 4.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.34,
                    }
                  : {}
              }
            >
              {c === " " ? "\u00A0" : c}
            </motion.span>
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** The alive word — a travelling light through a hairline, letters on a slow swell. */
function FlowWord({
  ready,
  delay,
  reduced,
  amp,
}: {
  ready: boolean;
  delay: number;
  reduced: boolean;
  amp: number;
}) {
  return (
    <span className="relative inline-flex">
      <span style={{ textShadow: "0 0 46px rgba(108,99,255,0.22)" }}>
        <Chars text="FLOW." ready={ready} delay={delay} wave reduced={reduced} amp={amp} />
      </span>

      <span className="pointer-events-none absolute inset-x-0 bottom-[0.08em] h-px">
        <motion.span
          className="absolute inset-0 origin-left bg-ink/15"
          initial={{ scaleX: 0 }}
          animate={ready ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: delay + 0.45, ease: EASE_OUT }}
        />
        <motion.span
          className="absolute inset-y-0 left-0 w-[26%]"
          style={{
            background:
              "linear-gradient(90deg, transparent, #6C63FF 45%, #6C63FF 55%, transparent)",
          }}
          initial={{ x: "-140%", opacity: 0 }}
          animate={
            ready && !reduced
              ? { x: ["-140%", "420%"], opacity: [0, 1, 1, 0] }
              : { opacity: 0 }
          }
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay + 1.3,
            repeatDelay: 1.1,
          }}
        />
      </span>
    </span>
  );
}

/* ============================= magnetic button ============================= */

function Magnetic({
  children,
  className,
  onClick,
  enabled,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  enabled: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 240, damping: 20, mass: 0.4 });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        if (!enabled || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 18);
        y.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 12);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/* =============================== status ticker ============================= */

const FEED = [
  "SYNCING · PHYSICS CH.4 NOTES",
  "DEADLINE DETECTED · ESSAY DRAFT — 2D",
  "FOCUS STREAK · 9 DAYS",
  "AI TUTOR · 3 CONCEPTS LINKED",
  "WEEK REBALANCED · 6 EVENTS",
];

function Ticker({ live }: { live: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setI((v) => (v + 1) % FEED.length), 3200);
    return () => clearInterval(t);
  }, [live]);

  return (
    <div className="flex items-center gap-3">
      <span className="relative grid size-1.5 place-items-center">
        <span className="absolute size-1.5 rounded-full bg-iris" />
        <motion.span
          className="absolute size-1.5 rounded-full border border-iris"
          animate={live ? { scale: [1, 3.4], opacity: [0.7, 0] } : {}}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
      </span>
      <span className="block h-[11px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={FEED[i]}
            className="block whitespace-nowrap font-mono text-[8.5px] tracking-[0.3em] text-ink/55"
            initial={{ y: "120%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-120%" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {FEED[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

/* ================================== HERO =================================== */

const CAPS = ["STUDY", "PLANNER", "NOTES", "EXAMS", "GOALS", "HABITS", "FOCUS"];

export default function Hero({
  ready,
  onNav,
}: {
  ready: boolean;
  onNav: (hash: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const { w, h } = useViewportSize();

  const { x: mxRaw, y: myRaw } = usePointer();
  const mx = useSpring(mxRaw, { stiffness: 60, damping: 20, mass: 0.4 });
  const my = useSpring(myRaw, { stiffness: 60, damping: 20, mass: 0.4 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSmooth(scrollYProgress);

  /* ---- geometry: the headline band and the product band never collide ---- */
  const box = windowBox(w);
  const bandRatio = isMobile ? 0.38 : 0.42;
  const bandH = Math.round(h * bandRatio);
  const bandTop = h - bandH;
  const winCY = bandTop + box.h / 2;
  const targetY = h / 2 - winCY;
  const cover = coverScale(w, h, box);

  /* Headline size solves for the space actually left above the product,
     so the type never overlaps the interface on short or narrow viewports. */
  const headlineSpace = h - 72 - bandH;
  const h1Size = Math.max(
    42,
    Math.min(w * 0.076, (headlineSpace - 226) / 1.76, isMobile ? 96 : 122)
  );

  /* camera dive */
  const winY = useTransform(p, [0, 0.55], [0, targetY]);
  const winScale = useTransform(p, [0, 0.55, 0.9], [1, cover * 0.72, cover]);
  const winRadius = useTransform(p, [0, 0.5, 0.9], [20, 26, 0]);
  const shadowO = useTransform(p, [0, 0.42], [1, 0]);

  /* headline retreats backward */
  const hlY = useTransform(p, [0, 0.45], [0, -h * 0.16]);
  const hlScale = useTransform(p, [0, 0.45], [1, 0.9]);
  const hlO = useTransform(p, [0, 0.24, 0.38], [1, 1, 0]);

  /* scene tilt */
  const tiltY = useTransform(mx, [-0.5, 0.5], reduced ? [0, 0] : [-2.4, 2.4]);
  const tiltX = useTransform(my, [-0.5, 0.5], reduced ? [0, 0] : [1.6, -1.6]);

  /* headline counter-parallax (2D only — keeps glyphs crisp) */
  const hlPx = useTransform(mx, [-0.5, 0.5], reduced ? [0, 0] : [-14, 14]);
  const hlPy = useTransform(my, [-0.5, 0.5], reduced ? [0, 0] : [-9, 9]);

  const hudO = useTransform(p, [0, 0.07], [1, 0]);
  const pct = useTransform(p, (v) => String(Math.round(v * 100)).padStart(2, "0"));

  const planes: PlaneCfg[] = [
    { label: "PLANNER", px: -box.w / 2 - 24, py: 46, w: 236, s: 0.96, depth: 0.5, drift: -1, bars: [74, 46, 62] },
    { label: "AI TUTOR", px: box.w / 2 + 24, py: 6, w: 254, s: 0.9, depth: 0.75, drift: 1, bars: [62, 82, 44] },
    { label: "FOCUS", px: -box.w / 2 - 52, py: 214, w: 210, s: 0.8, depth: 1, drift: -1.3, bars: [54, 68, 40] },
    { label: "ANALYTICS", px: box.w / 2 + 52, py: 252, w: 238, s: 0.72, depth: 1.25, drift: 1.3, bars: [70, 42, 58] },
  ];

  return (
    <section ref={ref} id="top" className="relative h-[340vh]">
      <div
        className="sticky top-0 flex h-screen flex-col overflow-hidden"
        style={{ perspective: 1400 }}
      >
        {/* -------------------------------- headline band -------------------------------- */}
        <motion.div
          className="relative z-20 flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center"
          style={{ y: hlY, scale: hlScale, opacity: hlO }}
        >
          <motion.div style={{ x: hlPx, y: hlPy }} className="flex flex-col items-center">
            {/* label */}
            <motion.div
              className="mb-6 flex items-center gap-3.5 md:mb-8 md:gap-5"
              initial={{ opacity: 0 }}
              animate={ready ? { opacity: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              <motion.span
                className="block h-px w-7 bg-ink/30 md:w-12"
                initial={{ scaleX: 0 }}
                animate={ready ? { scaleX: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.55, ease: EASE_OUT }}
                style={{ transformOrigin: "right" }}
              />
              <span className="font-mono text-[8.5px] tracking-[0.42em] text-ink/60 md:text-[9.5px] md:tracking-[0.5em]">
                THE STUDENT OPERATING SYSTEM
              </span>
              <motion.span
                className="block h-px w-7 bg-ink/30 md:w-12"
                initial={{ scaleX: 0 }}
                animate={ready ? { scaleX: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.55, ease: EASE_OUT }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>

            {/* headline */}
            <h1
              className="font-display select-none font-semibold leading-[0.88] tracking-[-0.045em] text-ink"
              style={{ fontSize: h1Size }}
            >
              <MaskLine>
                <Chars text="EVERYTHING." ready={ready} delay={0.28} reduced={reduced} />
              </MaskLine>
              <MaskLine>
                <span className="inline-flex items-baseline">
                  <Chars text="IN " ready={ready} delay={0.62} reduced={reduced} />
                  <FlowWord ready={ready} delay={0.74} reduced={reduced} amp={h1Size * 0.058} />
                </span>
              </MaskLine>
            </h1>

            {/* capability strip + payoff */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 1.12, ease: EASE_OUT }}
            >
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-mono text-[7.5px] tracking-[0.28em] text-ink/40 md:text-[8.5px] md:tracking-[0.34em]">
                {CAPS.map((c, i) => (
                  <span key={c} className="flex items-center gap-2.5">
                    {c}
                    {i < CAPS.length - 1 && <span className="text-ink/20">/</span>}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[13.5px] leading-relaxed text-ink/60 md:mt-5 md:text-[15.5px]">
                Your entire student life —{" "}
                <span className="font-medium text-ink">
                  connected in one intelligent system.
                </span>
              </p>
            </motion.div>

            {/* actions */}
            <motion.div
              className="mt-8 flex flex-col items-center gap-3.5 sm:flex-row sm:gap-4 md:mt-10"
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 1.28, ease: EASE_OUT }}
            >
              <Magnetic
                enabled={!reduced}
                onClick={() => onNav("#finale")}
                className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-ink py-3.5 pl-7 pr-6 text-[11.5px] font-medium tracking-[0.16em] text-white"
              >
                <span className="absolute inset-0 -translate-x-full bg-iris transition-transform duration-500 ease-out group-hover:translate-x-0" />
                <span className="relative">ENTER NEXUS</span>
                <ArrowRight className="relative size-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Magnetic>

              <Magnetic
                enabled={!reduced}
                onClick={() => onNav("#system")}
                className="group flex items-center gap-2.5 rounded-full border border-ink/15 py-3.5 pl-6 pr-5 text-[11.5px] font-medium tracking-[0.16em] text-ink/70 transition-colors duration-500 hover:border-ink/45 hover:text-ink"
              >
                EXPLORE THE SYSTEM
                <ArrowDown className="size-3.5 transition-transform duration-500 group-hover:translate-y-1" />
              </Magnetic>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* -------------------------------- product band -------------------------------- */}
        <motion.div className="relative z-10 shrink-0" style={{ height: bandH }}>
          <motion.div
            className="absolute inset-0"
            style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400 }}
          >
            {/* dimensional layers */}
            {!isMobile &&
              planes.map((cfg) => (
                <BackPlane key={cfg.label} cfg={cfg} p={p} mx={mx} my={my} />
              ))}

            {/* the interface */}
            <motion.div
              className="absolute left-1/2 top-0 z-10 will-change-transform"
              style={{
                marginLeft: -box.w / 2,
                width: box.w,
                y: winY,
                scale: winScale,
                borderRadius: winRadius,
              }}
            >
              {/* entrance */}
              <motion.div
                initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
                animate={ready ? { clipPath: "inset(0 0 0% 0)", opacity: 1 } : {}}
                transition={{ duration: 1.25, delay: 0.62, ease: EASE_OUT }}
                style={{ borderRadius: "inherit" }}
              >
                {/* breathing */}
                <motion.div
                  animate={reduced ? {} : { y: [0, -8, 0] }}
                  transition={reduced ? {} : { duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div
                    className="overflow-hidden border border-black/[0.07] bg-white [-webkit-box-reflect:below_26px_linear-gradient(transparent_74%,rgba(0,0,0,0.09))]"
                    style={{
                      borderRadius: "inherit",
                      boxShadow:
                        "0 70px 150px -44px rgba(9,9,9,0.30), 0 26px 56px -30px rgba(9,9,9,0.16)",
                    }}
                  >
                    <ScaledStage
                      width={STAGE_W}
                      height={STAGE_H}
                      scale={box.w / STAGE_W}
                    >
                      <WindowChrome active="overview">
                        <DashboardScreen />
                      </WindowChrome>
                    </ScaledStage>
                  </div>
                </motion.div>
              </motion.div>

              {/* floor shadow */}
              <motion.div
                className="pointer-events-none absolute -bottom-14 left-1/2 h-12 w-[78%] -translate-x-1/2 rounded-[100%] bg-ink/15 blur-3xl"
                style={{ opacity: shadowO }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ---------------------------------- OS chrome ---------------------------------- */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30"
          style={{ opacity: hudO }}
          aria-hidden="true"
        >
          {/* corner brackets */}
          {[
            ["left-6 top-6", "border-l border-t"],
            ["right-6 top-6", "border-r border-t"],
            ["left-6 bottom-6", "border-l border-b"],
            ["right-6 bottom-6", "border-r border-b"],
          ].map(([pos, borders], i) => (
            <motion.span
              key={pos}
              className={`absolute hidden h-3.5 w-3.5 border-ink/25 sm:block ${pos} ${borders}`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={ready ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 1.5 + i * 0.07, ease: EASE_OUT }}
            />
          ))}

          {/* left system rail */}
          <div className="absolute left-9 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex">
            <span className="relative block h-14 w-px overflow-hidden bg-ink/12">
              <motion.span
                className="absolute inset-x-0 top-0 h-4 bg-ink/50"
                animate={reduced ? {} : { y: [-16, 56] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            <span
              className="font-mono text-[8px] tracking-[0.42em] text-ink/40"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              NEXUS OS — SYSTEM ONLINE
            </span>
            <span className="block h-14 w-px bg-ink/12" />
          </div>

          {/* live feed */}
          <motion.div
            className="absolute bottom-7 left-6 md:left-10"
            initial={{ opacity: 0, x: -10 }}
            animate={ready ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.7, ease: EASE_OUT }}
          >
            <Ticker live={!reduced} />
          </motion.div>

          {/* scroll readout */}
          <motion.div
            className="absolute bottom-7 right-6 flex items-center gap-3 md:right-10"
            initial={{ opacity: 0, x: 10 }}
            animate={ready ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.7, ease: EASE_OUT }}
          >
            <span className="font-mono text-[8.5px] tracking-[0.35em] text-ink/45">SCROLL</span>
            <span className="relative block h-px w-20 bg-ink/15 md:w-24">
              <motion.span
                className="absolute inset-y-0 left-0 block w-full origin-left bg-ink"
                style={{ scaleX: p }}
              />
            </span>
            <motion.span className="w-5 text-right font-mono text-[8.5px] tabular-nums text-ink/45">
              {pct}
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
