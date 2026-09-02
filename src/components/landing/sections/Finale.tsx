"use client"

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE_OUT, usePointer, usePrefersReducedMotion } from "@/lib/landing-hooks";
import { DashboardScreen, WindowChrome } from "@/components/landing/NexusUI";
import { useNexusAuth } from "@/components/providers/nexus-auth-provider";
import { useApp } from "@/lib/store";

/* ------------------------------ final reveal ------------------------------- */

function FinalReveal({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [90, -50]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.94, 1]);

  const { x: mxRaw, y: myRaw } = usePointer();
  const mx = useSpring(mxRaw, { stiffness: 40, damping: 18 });
  const my = useSpring(myRaw, { stiffness: 40, damping: 18 });
  const rotY = useTransform(mx, [-0.5, 0.5], reduced ? [0, 0] : [-2.4, 2.4]);
  const rotX = useTransform(my, [-0.5, 0.5], reduced ? [0, 0] : [1.6, -1.6]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-white py-[16vh] md:py-[20vh]">
      <div className="px-6 text-center">
        <h2 className="font-display text-[clamp(2.9rem,8vw,7.2rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
          {["EVERYTHING.", "FINALLY.", "CONNECTED."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className={`block ${i === 2 ? "text-ink" : "text-ink"}`}
                initial={{ y: "108%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: EASE_OUT }}
              >
                {i === 2 ? (
                  <>
                    CONNECTED<span className="text-iris">.</span>
                  </>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </h2>
      </div>

      <div className="mt-[8vh] px-[4vw]" style={{ perspective: 1400 }}>
        <motion.div
          className="preserve-3d relative mx-auto max-w-6xl"
          style={{ y, scale, rotateX: rotX, rotateY: rotY }}
        >
          <motion.div
            className="relative overflow-hidden rounded-[20px] border border-black/[0.07] bg-white [-webkit-box-reflect:below_32px_linear-gradient(transparent_72%,rgba(0,0,0,0.10))]"
            style={{
              boxShadow:
                "0 100px 200px_-60px rgba(9,9,9,0.35), 0 40px 80px_-40px rgba(9,9,9,0.2)",
            }}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
          >
            <div className="aspect-[16/10]">
              <WindowChrome active="overview">
                <DashboardScreen />
              </WindowChrome>
            </div>
          </motion.div>
          {/* soft floor shadow */}
          <div className="absolute -bottom-14 left-1/2 h-14 w-[76%] -translate-x-1/2 rounded-[100%] bg-ink/10 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------- final cta -------------------------------- */

const FOOT = [
  { label: "Product", id: "system" },
  { label: "Intelligence", id: "intelligence" },
  { label: "Focus", id: "focus" },
  { label: "About", id: "top" },
  { label: "Sign In", id: "top" },
];

export default function Finale({ onNav }: { onNav: (hash: string) => void }) {
  const reduced = usePrefersReducedMotion();
  const { user } = useNexusAuth();
  const setView = useApp((s) => s.setView);
  return (
    <>
      <FinalReveal reduced={reduced} />

      <section id="finale" className="relative overflow-hidden bg-abyss text-white">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(108,99,255,0.13), transparent 62%)" }}
        />

        <div className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 py-28 text-center">
          <motion.span
            className="font-mono text-[9.5px] tracking-[0.5em] text-white/40"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            READY WHEN YOU ARE
          </motion.span>

          <div className="mt-8 overflow-hidden">
            <motion.h2
              className="font-display text-[clamp(4.4rem,15vw,13rem)] font-bold leading-none tracking-[-0.055em]"
              initial={{ y: "104%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, ease: EASE_OUT }}
            >
              NEXUS<span className="text-iris">.</span>
            </motion.h2>
          </div>

          <motion.p
            className="mt-8 text-[clamp(1.05rem,2.4vw,1.6rem)] font-medium leading-snug tracking-[-0.01em] text-white/85"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT }}
          >
            YOUR LIFE IS ALREADY CONNECTED.
          </motion.p>
          <motion.p
            className="mt-2 text-[clamp(1.05rem,2.4vw,1.6rem)] leading-snug tracking-[-0.01em] text-white/40"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT }}
          >
            NOW YOUR SYSTEM IS TOO.
          </motion.p>

          <motion.button
            onClick={() => {
              if (user) {
                setView("app");
              } else {
                setView("signup");
              }
            }}
            className="group mt-14 flex items-center gap-3 rounded-full bg-white py-4 pl-9 pr-8 text-[12px] font-medium tracking-[0.18em] text-ink transition-all duration-500 hover:gap-4 hover:pl-11 hover:pr-9"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE_OUT }}
          >
            ENTER NEXUS
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={2.2} />
          </motion.button>
        </div>

        {/* footer */}
        <footer className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
            <div className="flex items-center gap-4">
              <span className="text-[13px] font-semibold tracking-[0.3em]">NEXUS</span>
              <span className="hidden h-3 w-px bg-white/20 md:block" />
              <span className="font-mono text-[8.5px] tracking-[0.3em] text-white/35">
                THE STUDENT OPERATING SYSTEM
              </span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
              {FOOT.map((l) => (
                <button
                  key={l.label}
                  onClick={() => onNav(`#${l.id}`)}
                  className="text-[11.5px] text-white/45 transition-colors duration-300 hover:text-white"
                >
                  {l.label}
                </button>
              ))}
            </nav>
            <span className="font-mono text-[8.5px] tracking-[0.25em] text-white/25">© 2026</span>
          </div>
        </footer>
      </section>
    </>
  );
}
