"use client"

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useIsMobile, usePrefersReducedMotion, useSmooth, useViewportSize } from "@/lib/landing-hooks";

interface WordCfg {
  t: string;
  sx: number;
  sy: number;
  r: number;
  fx: number;
  fy: number;
  drift: number;
  tone: "ink" | "line" | "iris";
}

const WORDS: WordCfg[] = [
  { t: "ASSIGNMENTS", sx: -0.32, sy: -0.3, r: -13, fx: -0.215, fy: -0.16, drift: 1.0, tone: "ink" },
  { t: "EXAMS", sx: 0.29, sy: -0.34, r: 11, fx: 0, fy: -0.16, drift: 1.4, tone: "line" },
  { t: "NOTES", sx: -0.37, sy: 0.03, r: 7, fx: 0.215, fy: -0.16, drift: 0.8, tone: "line" },
  { t: "DEADLINES", sx: 0.35, sy: -0.03, r: -9, fx: -0.215, fy: 0.16, drift: 1.2, tone: "ink" },
  { t: "GOALS", sx: -0.28, sy: 0.33, r: 13, fx: 0, fy: 0.16, drift: 0.9, tone: "ink" },
  { t: "FOCUS", sx: 0.33, sy: 0.3, r: -7, fx: 0.215, fy: 0.16, drift: 1.1, tone: "iris" },
];

function ChaosWord({
  cfg,
  dock,
  p,
  w,
  h,
  i,
  xFactor,
  reduced,
}: {
  cfg: WordCfg;
  dock: { x: number; y: number };
  p: MotionValue<number>;
  w: number;
  h: number;
  i: number;
  xFactor: number;
  reduced: boolean;
}) {
  const sx = cfg.sx * w * xFactor;
  const sy = cfg.sy * h;
  const fx = dock.x;
  const fy = dock.y;

  const x = useTransform(p, [0, 0.45, 0.62, 0.85], [sx, fx, fx, 0]);
  const y = useTransform(p, [0, 0.45, 0.62, 0.85], [sy, fy, fy, 0]);
  const rotate = useTransform(p, [0, 0.45], [cfg.r, 0]);
  const scale = useTransform(p, [0, 0.45, 0.62, 0.85], [1, 0.5, 0.5, 0.03]);
  const opacity = useTransform(p, [0, 0.7, 0.82], [1, 1, 0]);

  const toneClass =
    cfg.tone === "line"
      ? "text-stroke"
      : cfg.tone === "iris"
        ? "text-stroke-iris"
        : "text-ink";

  const strokeColor = cfg.tone === "iris" ? "#6C63FF" : "#151515";
  const color = useTransform(p, [0, 0.45, 0.62], ["rgba(0,0,0,0)", "rgba(0,0,0,0)", strokeColor]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ x, y, rotate, scale, opacity }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={reduced ? {} : { x: [0, cfg.drift * 10, cfg.drift * -8, 0], y: [0, cfg.drift * -8, cfg.drift * 9, 0] }}
          transition={{ duration: 11 + i * 1.7, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className={`whitespace-nowrap text-[clamp(1.9rem,5.6vw,5rem)] font-semibold tracking-[-0.03em] ${toneClass}`}
            style={cfg.tone === "ink" ? { color } : undefined}
          >
            {cfg.t}
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ChaosClarity() {
  const ref = useRef<HTMLElement>(null);
  const { w, h } = useViewportSize();
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSmooth(scrollYProgress, 130, 28);

  const xFactor = isMobile ? 0.85 : 1;
  const MDOCKS: [number, number][] = [
    [-0.24, -0.26],
    [0.24, -0.26],
    [-0.24, 0],
    [0.24, 0],
    [-0.24, 0.26],
    [0.24, 0.26],
  ];
  const docks = WORDS.map((c, i) =>
    isMobile ? { x: MDOCKS[i][0] * w, y: MDOCKS[i][1] * h } : { x: c.fx * w, y: c.fy * h }
  );
  const dockPath = [
    `M ${w / 2 + docks[0].x} ${h / 2 + docks[0].y}`,
    `L ${w / 2 + docks[1].x} ${h / 2 + docks[1].y}`,
    `L ${w / 2 + docks[2].x} ${h / 2 + docks[2].y}`,
    `L ${w / 2 + docks[5].x} ${h / 2 + docks[5].y}`,
    `L ${w / 2 + docks[4].x} ${h / 2 + docks[4].y}`,
    `L ${w / 2 + docks[3].x} ${h / 2 + docks[3].y}`,
  ].join(" ");

  const lineLen = useTransform(p, [0.4, 0.56], [0, 1]);
  const lineO = useTransform(p, [0.4, 0.5, 0.62, 0.72], [0, 1, 1, 0]);

  const captionO = useTransform(p, [0, 0.06, 0.42, 0.52], [0, 1, 1, 0]);
  const markO = useTransform(p, [0.66, 0.8], [0, 1]);
  const markS = useTransform(p, [0.66, 0.9], [0.62, 1]);
  const glowO = useTransform(p, [0.7, 0.9], [0, 0.16]);
  const capUp = useTransform(p, [0.8, 0.92], [0, 1]);
  const capY = useTransform(p, [0.8, 0.92], [24, 0]);

  if (reduced) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <span className="font-mono text-[10px] tracking-[0.5em] text-ink/45">FROM CHAOS</span>
        <h2 className="font-display mt-4 text-[clamp(4rem,14vw,11rem)] font-bold tracking-[-0.05em] text-ink">
          NEXUS.
        </h2>
        <span className="mt-4 font-mono text-[10px] tracking-[0.5em] text-ink/45">TO CLARITY.</span>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* iris breath behind the mark */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            opacity: glowO,
            background: "radial-gradient(circle, rgba(108,99,255,0.55), transparent 65%)",
          }}
        />

        {/* phase caption */}
        <motion.div
          className="absolute inset-x-0 top-[13vh] text-center"
          style={{ opacity: captionO }}
        >
          <span className="font-mono text-[9.5px] tracking-[0.45em] text-ink/45">
            02 — A STUDENT LIFE, SCATTERED
          </span>
        </motion.div>

        {/* connection lines */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d={dockPath}
            fill="none"
            stroke="#111111"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="3 6"
            style={{ pathLength: lineLen, opacity: lineO }}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* the words */}
        {WORDS.map((cfg, i) => (
          <ChaosWord
            key={cfg.t}
            cfg={cfg}
            dock={docks[i]}
            p={p}
            w={w}
            h={h}
            i={i}
            xFactor={xFactor}
            reduced={reduced}
          />
        ))}

        {/* resolution */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-mono text-[10px] tracking-[0.5em] text-ink/45"
            style={{ opacity: capUp, y: capY }}
          >
            FROM CHAOS
          </motion.span>
          <motion.h2
            className="font-display select-none text-[clamp(4rem,14vw,11.5rem)] font-bold leading-none tracking-[-0.05em] text-ink"
            style={{ opacity: markO, scale: markS }}
          >
            NEXUS<span className="text-iris">.</span>
          </motion.h2>
          <motion.span
            className="font-mono text-[10px] tracking-[0.5em] text-ink/45"
            style={{ opacity: capUp, y: capY }}
          >
            TO CLARITY.
          </motion.span>
        </div>
      </div>
    </section>
  );
}
