"use client"

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMedia } from "@/lib/landing-hooks";

/**
 * A two-part cursor: a precise dot + a trailing ring.
 * Renders only on fine pointers; native cursor is hidden via html.custom-cursor.
 */
export default function CustomCursor() {
  const fine = useMedia("(pointer: fine)");
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { stiffness: 900, damping: 60, mass: 0.2 });
  const dotY = useSpring(y, { stiffness: 900, damping: 60, mass: 0.2 });
  const ringX = useSpring(x, { stiffness: 220, damping: 24, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 220, damping: 24, mass: 0.6 });

  useEffect(() => {
    if (!fine) return;
    document.documentElement.classList.add("custom-cursor");
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      setHovering(!!t?.closest("a, button, [data-cursor]"));
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[110] rounded-full bg-white mix-blend-difference"
        style={{ x: dotX, y: dotY, width: 6, height: 6, marginLeft: -3, marginTop: -3 }}
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 0.4 : 1 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[110] rounded-full border-[1.5px] border-white mix-blend-difference"
        style={{ x: ringX, y: ringY, width: 34, height: 34, marginLeft: -17, marginTop: -17 }}
        animate={{ opacity: visible ? (hovering ? 0.9 : 0.5) : 0, scale: hovering ? 1.7 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </>
  );
}
