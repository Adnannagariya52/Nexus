"use client"

import { useEffect } from "react";
import { motion } from "framer-motion";
import { EASE, EASE_OUT } from "@/lib/landing-hooks";

interface Props {
  reduced: boolean;
  onDone: () => void;
}

/**
 * Entry ritual: a glowing point → lines connect into an N → NEXUS resolves.
 * ~1.9s. Then the curtain lifts.
 */
export default function Preloader({ reduced, onDone }: Props) {
  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    const t = setTimeout(onDone, 2050);
    return () => clearTimeout(t);
  }, [reduced, onDone]);

  if (reduced) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-paper"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.9, ease: EASE }}
      aria-hidden="true"
    >
      <div className="relative flex h-[220px] w-[320px] items-center justify-center">
        {/* the point */}
        <motion.div
          className="absolute size-2 rounded-full bg-iris"
          style={{ boxShadow: "0 0 32px 8px rgba(108,99,255,0.55)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1, 0.001], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.0, times: [0, 0.25, 0.7, 1], ease: "easeOut" }}
        />

        {/* connecting lines → the N */}
        <motion.svg
          viewBox="0 0 120 120"
          className="absolute h-32 w-32"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 0], scale: [1, 0.96, 0.92] }}
          transition={{ duration: 0.6, delay: 1.15, times: [0, 0.3, 1], ease: "easeIn" }}
        >
          <motion.path
            d="M32 92 V28 L88 92 V28"
            fill="none"
            stroke="#111111"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.75, delay: 0.42, ease: EASE_OUT }}
            style={{ filter: "drop-shadow(0 0 14px rgba(108,99,255,0.4))" }}
          />
        </motion.svg>

        {/* resolution → NEXUS */}
        <div
          className="absolute flex items-baseline overflow-hidden pb-1 text-[26px] font-semibold tracking-[0.3em] text-ink"
          role="presentation"
        >
          {"NEXUS".split("").map((c, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span
                className="inline-block"
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.55, delay: 1.12 + i * 0.055, ease: EASE_OUT }}
              >
                {c}
              </motion.span>
            </span>
          ))}
        </div>

        {/* baseline caption */}
        <motion.div
          className="absolute bottom-8 font-mono text-[9px] tracking-[0.5em] text-ink/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          THE STUDENT OPERATING SYSTEM
        </motion.div>
      </div>
    </motion.div>
  );
}
