"use client"

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import {
  fadeWindow,
  useIsMobile,
  usePointer,
  usePrefersReducedMotion,
  useSmooth,
  useViewportSize,
} from "@/lib/landing-hooks";
import { ScaledStage, Screen, WindowChrome, type ScreenId } from "@/components/landing/NexusUI";

interface PlaneCfg {
  id: ScreenId;
  label: string;
  z: number;
  x: number;
  y: number;
  ry: number;
}

function SpacePlane({
  cfg,
  camZ,
  scale,
  width,
  height,
}: {
  cfg: PlaneCfg;
  camZ: MotionValue<number>;
  scale: number;
  width: number;
  height: number;
}) {
  const opacity = useTransform(camZ, (v) => fadeWindow(v + cfg.z, -2300, -1500, 230, 580));
  const rotateY = useTransform(camZ, (v) => cfg.ry + v * 0.004);
  const rotateX = useTransform(camZ, (v) => v * 0.0015);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        x: cfg.x,
        y: cfg.y,
        z: cfg.z,
        rotateY,
        rotateX,
        opacity,
        width: width * scale,
        height: height * scale,
        marginLeft: (-width * scale) / 2,
        marginTop: (-height * scale) / 2,
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="h-full w-full"
      >
        <div
          className="overflow-hidden rounded-xl border border-white/[0.12] bg-white"
          style={{
            width: "100%",
            height: "100%",
            boxShadow: "0 40px 120px_-20px rgba(0,0,0,0.8), 0 0 60px_-20px rgba(108,99,255,0.25)",
          }}
        >
          <ScaledStage width={width} height={height} scale={scale}>
            <WindowChrome active={cfg.id}>
              <Screen id={cfg.id} />
            </WindowChrome>
          </ScaledStage>
        </div>
        <div className="mt-4 text-center font-mono text-[9px] tracking-[0.45em] text-white/40">
          {cfg.label}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SpatialJourney() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const { w } = useViewportSize();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSmooth(scrollYProgress, 100, 26);
  const camZ = useTransform(p, [0, 1], [-2700, 820]);

  const { x: mxRaw, y: myRaw } = usePointer();
  const mx = useSpring(mxRaw, { stiffness: 45, damping: 18 });
  const my = useSpring(myRaw, { stiffness: 45, damping: 18 });
  const rotY = useTransform(mx, [-0.5, 0.5], reduced ? [0, 0] : [-4.5, 4.5]);
  const rotX = useTransform(my, [-0.5, 0.5], reduced ? [0, 0] : [3, -3]);

  const intro = useTransform(p, [0, 0.04, 0.14, 0.2], [0, 1, 1, 0]);
  const introY = useTransform(p, [0.14, 0.2], [0, -30]);

  /* resolution — everything merges into one */
  const finalS = useTransform(p, [0.84, 0.97], [0.5, 1]);
  const finalO = useTransform(p, [0.83, 0.92], [0, 1]);
  const ringO = useTransform(p, [0.86, 0.97], [0, 1]);
  const capO = useTransform(p, [0.9, 0.97], [0, 1]);
  const capY = useTransform(p, [0.9, 0.97], [26, 0]);

  const stageScale = isMobile ? 0.34 : 0.5;
  const W = 1040;
  const H = 650;
  const xOff = Math.min(isMobile ? w * 0.2 : 350, w * 0.26);

  const planes: PlaneCfg[] = [
    { id: "analytics", label: "ANALYTICS", z: -520, x: -xOff, y: isMobile ? -90 : -70, ry: 17 },
    { id: "tutor", label: "AI TUTOR", z: -1350, x: xOff, y: isMobile ? 60 : 90, ry: -15 },
    { id: "focus", label: "FOCUS", z: -2180, x: 0, y: isMobile ? -20 : -50, ry: 9 },
  ];

  /* --------------------------- reduced-motion --------------------------- */
  if (reduced) {
    return (
      <section className="bg-abyss px-6 py-24 text-white">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {planes.map((pl) => (
            <div key={pl.id} className="overflow-hidden rounded-xl border border-white/10 bg-white">
              <div className="aspect-[16/11]">
                <WindowChrome active={pl.id}>
                  <Screen id={pl.id} />
                </WindowChrome>
              </div>
            </div>
          ))}
        </div>
        <h2 className="font-display mt-16 text-center text-[clamp(2.5rem,7vw,5rem)] font-semibold tracking-[-0.05em]">
          ONE SYSTEM. ZERO CHAOS.
        </h2>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[460vh] bg-abyss text-white">
      <div className="sticky top-0 h-screen overflow-hidden" style={{ perspective: 1150 }}>
        {/* void ambience */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(90% 70% at 50% 55%, rgba(108,99,255,0.055), transparent 60%)" }}
        />

        {/* intro caption */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: intro, y: introY }}
        >
          <div className="text-center">
            <span className="font-mono text-[9.5px] tracking-[0.5em] text-white/45">
              04 — THE SYSTEM IN SPACE
            </span>
            <p className="mt-5 text-[clamp(1.6rem,4vw,3rem)] font-medium tracking-[-0.03em] text-white/85">
              Keep scrolling. Move through it.
            </p>
          </div>
        </motion.div>

        {/* camera */}
        <motion.div className="preserve-3d absolute inset-0" style={{ rotateX: rotX, rotateY: rotY }}>
          <motion.div className="preserve-3d absolute inset-0" style={{ z: camZ }}>
            {planes.map((cfg) => (
              <SpacePlane key={cfg.id} cfg={cfg} camZ={camZ} scale={stageScale} width={W} height={H} />
            ))}
          </motion.div>

          {/* convergence */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ scale: finalS, opacity: finalO }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-14 rounded-full"
                style={{
                  opacity: ringO,
                  background: "radial-gradient(circle, rgba(108,99,255,0.22), transparent 65%)",
                }}
              />
              <div
                className="relative overflow-hidden rounded-2xl border border-white/[0.14] bg-white"
                style={{ boxShadow: "0 60px 160px_-30px rgba(0,0,0,0.9), 0 0 80px_-20px rgba(108,99,255,0.35)" }}
              >
                <ScaledStage width={W} height={H} scale={isMobile ? 0.36 : 0.62}>
                  <WindowChrome active="overview">
                    <Screen id="overview" />
                  </WindowChrome>
                </ScaledStage>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* resolution caption */}
        <motion.div
          className="absolute inset-x-0 bottom-[10vh] text-center"
          style={{ opacity: capO, y: capY }}
        >
          <h2 className="font-display text-[clamp(2.2rem,6vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
            ONE SYSTEM.
            <br />
            <span className="text-white/40">ZERO CHAOS.</span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
