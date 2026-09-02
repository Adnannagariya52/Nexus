"use client"

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { smoothPath, useIsMobile, usePrefersReducedMotion, useSmooth, useViewportSize } from "@/lib/landing-hooks";

const PTS = [
  { x: 8, y: 196 },
  { x: 88, y: 164 },
  { x: 168, y: 176 },
  { x: 248, y: 122 },
  { x: 328, y: 134 },
  { x: 408, y: 84 },
  { x: 488, y: 96 },
  { x: 556, y: 38 },
];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function FocusFlow() {
  const ref = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const { w, h } = useViewportSize();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSmooth(scrollYProgress, 110, 26);

  /* ring */
  const ringPL = useTransform(p, [0.02, 0.3, 0.42, 0.56], [0, 0.72, 0.72, 1]);
  const ringO = useTransform(p, [0, 0.05], [0, 1]);

  /* stage A → B: the timer leaves center, settles to the side */
  const timerX = useTransform(p, [0.42, 0.58], [0, isMobile ? 0 : -w * 0.31]);
  const timerY = useTransform(p, [0.42, 0.58], [0, isMobile ? -h * 0.3 : 0]);
  const timerS = useTransform(p, [0.42, 0.58], [1, isMobile ? 0.46 : 0.54]);
  const timerO = useTransform(p, [0.6, 0.74], [1, 0]);

  /* digit morph */
  const aO = useTransform(p, [0.32, 0.42], [1, 0]);
  const aY = useTransform(p, [0.32, 0.42], [0, -34]);
  const bO = useTransform(p, [0.36, 0.46], [0, 1]);
  const bY = useTransform(p, [0.36, 0.46], [34, 0]);
  const capO = aO;

  /* timeline */
  const tlO = useTransform(p, [0.48, 0.56], [0, 1]);
  const tlX = useTransform(p, [0.48, 0.62], [isMobile ? 0 : 60, 0]);
  const linePL = useTransform(p, [0.5, 0.76], [0, 1]);
  const areaO = useTransform(p, [0.74, 0.88], [0, 0.9]);
  const n0 = useTransform(p, [0.56, 0.62], [0, 1]);
  const n1 = useTransform(p, [0.6, 0.66], [0, 1]);
  const n2 = useTransform(p, [0.64, 0.7], [0, 1]);
  const n3 = useTransform(p, [0.68, 0.74], [0, 1]);
  const n4 = useTransform(p, [0.72, 0.78], [0, 1]);
  const n5 = useTransform(p, [0.76, 0.82], [0, 1]);
  const n6 = useTransform(p, [0.8, 0.86], [0, 1]);
  const nodeOps = [n0, n1, n2, n3, n4, n5, n6];
  const labelO = useTransform(p, [0.62, 0.72], [0, 1]);

  /* stage C — the lesson */
  const hdO = useTransform(p, [0.68, 0.8], [0, 1]);
  const hdY = useTransform(p, [0.68, 0.82], [44, 0]);
  const chipsO = useTransform(p, [0.8, 0.9], [0, 1]);
  const statsO = useTransform(p, [0.86, 0.95], [0, 1]);
  const statsY = useTransform(p, [0.86, 0.95], [22, 0]);

  const curve = smoothPath(PTS);

  if (reduced) {
    return (
      <section id="focus" className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-24">
        <span className="font-mono text-[10px] tracking-[0.5em] text-ink/50">FOCUS MODE</span>
        <div className="font-mono text-[22vw] font-extralight leading-none tracking-[-0.06em] text-ink md:text-[11rem]">
          2H 48M
        </div>
        <h2 className="font-display text-center text-[clamp(2.4rem,7vw,5rem)] font-semibold tracking-[-0.05em] text-ink">
          SMALL DAYS. <span className="text-iris">BIG CHANGE.</span>
        </h2>
        <svg viewBox="0 0 560 260" className="w-full max-w-xl">
          <path d={curve} fill="none" stroke="#111" strokeWidth="1.75" />
          {PTS.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#F5F5F2" stroke="#111" strokeWidth="1.5" />
          ))}
        </svg>
      </section>
    );
  }

  return (
    <section ref={ref} id="focus" className="relative h-[440vh]">
      {/* anchor for the "Progress" nav item, deep in the journey */}
      <div id="progress" className="absolute left-0 top-[62%] h-px w-px" aria-hidden />

      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* chapter marker */}
        <div className="absolute top-9 left-1/2 -translate-x-1/2">
          <span className="font-mono text-[9px] tracking-[0.45em] text-ink/40">
            05 — SILENCE, THEN EVIDENCE
          </span>
        </div>

        {/* headline — stage C */}
        <motion.div
          className={`absolute inset-x-0 px-6 text-center ${isMobile ? "top-[9vh]" : "top-[12vh]"}`}
          style={{ opacity: hdO, y: hdY }}
        >
          <h2 className="font-display text-[clamp(2.4rem,6.5vw,5.4rem)] font-semibold leading-[1.0] tracking-[-0.05em] text-ink">
            SMALL DAYS.
            <br />
            <span className="text-iris">BIG CHANGE.</span>
          </h2>
          <motion.div
            className="mt-5 flex items-center justify-center gap-3 font-mono text-[8.5px] tracking-[0.3em] text-ink/45"
            style={{ opacity: chipsO }}
          >
            <span>FOCUS</span>
            <span className="h-px w-6 bg-ink/25" />
            <span>CONSISTENCY</span>
            <span className="h-px w-6 bg-ink/25" />
            <span className="text-iris">PROGRESS</span>
          </motion.div>
        </motion.div>

        {/* the timer */}
        <motion.div
          className="relative flex flex-col items-center"
          style={{ x: timerX, y: timerY, scale: timerS, opacity: timerO }}
        >
          <span className="mb-8 font-mono text-[10px] tracking-[0.5em] text-ink/55">FOCUS MODE</span>

          <div className="relative grid place-items-center">
            <motion.svg
              viewBox="0 0 400 400"
              className="h-[62vmin] w-[62vmin] -rotate-90 md:h-[54vmin] md:w-[54vmin]"
              style={{ opacity: ringO }}
            >
              <circle cx="200" cy="200" r="186" fill="none" stroke="rgba(9,9,9,0.08)" strokeWidth="1.5" />
              <motion.circle
                cx="200"
                cy="200"
                r="186"
                fill="none"
                stroke="#6C63FF"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength={1}
                style={{ pathLength: ringPL }}
              />
            </motion.svg>

            {/* breathing digits */}
            <motion.div
              className="absolute"
              animate={reduced ? {} : { scale: [1, 1.018, 1] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative grid place-items-center">
                <motion.div
                  className="col-start-1 row-start-1 flex flex-col items-center"
                  style={{ opacity: aO, y: aY }}
                >
                  <span className="font-mono text-[16vmin] font-extralight leading-none tracking-[-0.06em] text-ink md:text-[13vmin]">
                    25:00
                  </span>
                  <motion.span className="mt-4 text-[13px] text-ink/45" style={{ opacity: capO }}>
                    THE WORLD CAN WAIT.
                  </motion.span>
                </motion.div>
                <motion.div
                  className="col-start-1 row-start-1"
                  style={{ opacity: bO, y: bY }}
                >
                  <span className="whitespace-nowrap font-mono text-[13vmin] font-extralight leading-none tracking-[-0.06em] text-ink md:text-[11vmin]">
                    2H<span className="text-iris">·</span>48M
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* the timeline — one continuous path of evidence */}
        <motion.div
          className={`pointer-events-none absolute inset-0 flex px-6 ${
            isMobile ? "items-end justify-center pb-[15vh]" : "items-center justify-end pr-[5vw]"
          }`}
          style={{ opacity: tlO, x: tlX }}
        >
          <div className={isMobile ? "w-[88vw] max-w-[420px]" : "w-[44vw] max-w-[560px]"}>
            <svg viewBox="0 0 560 260" className="w-full overflow-visible">
              <defs>
                <linearGradient id="tlg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d={`${curve} L 556 232 L 8 232 Z`}
                fill="url(#tlg)"
                style={{ opacity: areaO }}
              />
              <motion.path
                d={curve}
                fill="none"
                stroke="#111111"
                strokeWidth="1.75"
                style={{ pathLength: linePL }}
              />
              {PTS.slice(1).map((pt, i) => (
                <motion.circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#F5F5F2"
                  stroke="#111111"
                  strokeWidth="1.5"
                  style={{ opacity: nodeOps[i] }}
                />
              ))}
              <motion.g style={{ opacity: labelO }}>
                {DAYS.map((d, i) => (
                  <text
                    key={d}
                    x={8 + (i * 548) / 6}
                    y="254"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="Geist Mono, monospace"
                    fill="rgba(9,9,9,0.45)"
                  >
                    {d}
                  </text>
                ))}
              </motion.g>
            </svg>
            <motion.div
              className="mt-2 flex justify-between font-mono text-[8px] tracking-[0.2em] text-ink/40"
              style={{ opacity: labelO }}
            >
              <span>DEEP WORK SESSIONS</span>
              <span className="text-ink">2H 48M TODAY</span>
            </motion.div>
          </div>
        </motion.div>

        {/* proof */}
        <motion.div
          className="absolute inset-x-0 bottom-[4vh] flex items-center justify-center gap-6 px-6 md:bottom-[7vh] md:gap-12"
          style={{ opacity: statsO, y: statsY }}
        >
          {[
            { v: "12", l: "SESSIONS THIS WEEK" },
            { v: "+38%", l: "CONSISTENCY" },
            { v: "9", l: "DAY STREAK" },
          ].map((s, i) => (
            <div key={s.l} className="flex items-center gap-6 md:gap-12">
              {i > 0 && <span className="h-8 w-px bg-ink/10" />}
              <div className="text-center">
                <div className="text-xl font-semibold tracking-tight text-ink md:text-2xl">{s.v}</div>
                <div className="mt-1 font-mono text-[7.5px] tracking-[0.25em] text-ink/45">{s.l}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
