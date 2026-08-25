import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";

/* ---------------------------------- easing --------------------------------- */

export const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ------------------------------- media queries ----------------------------- */

export function useMedia(query: string): boolean {
  // Lazy init against the live viewport so the first paint is already correct
  // (prevents a mobile/desktop layout flash on mount).
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export const useIsMobile = () => useMedia("(max-width: 768px)");
export const usePrefersReducedMotion = () =>
  useMedia("(prefers-reduced-motion: reduce)");

/* ------------------------------ viewport size ------------------------------ */

export function useViewportSize() {
  // Read the real viewport on first render — no 1280x800 placeholder jump.
  const [size, setSize] = useState(() =>
    typeof window === "undefined"
      ? { w: 1440, h: 900 }
      : { w: window.innerWidth, h: window.innerHeight }
  );
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setSize({ w: window.innerWidth, h: window.innerHeight })
      );
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return size;
}

/* ------------------------------ pointer (normalized) ----------------------- */

export function usePointer(): { x: MotionValue<number>; y: MotionValue<number> } {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX / window.innerWidth - 0.5);
      y.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);
  return { x, y };
}

/* ------------------------- smoothed scroll progress ------------------------ */

/**
 * Scroll-progress smoothing. Tuned to sit on top of Lenis: responsive enough
 * to feel connected to the wheel, damped enough to never overshoot or jitter.
 */
export function useSmooth(progress: MotionValue<number>, stiffness = 170, damping = 32) {
  return useSpring(progress, { stiffness, damping, mass: 0.4, restDelta: 0.0005 });
}

/* --------------------------- shared stage metrics -------------------------- */

/** Canonical product-window artboard. Every section derives from this. */
export const STAGE_W = 1040;
export const STAGE_H = 650;
export const STAGE_RATIO = STAGE_H / STAGE_W;

/** The hero + system-reveal window box, identical in both for a seamless handoff. */
export function windowBox(vw: number) {
  const w = Math.min(1080, vw * 0.88);
  return { w, h: w * STAGE_RATIO };
}

/** Scale needed for the window box to fully cover the viewport. */
export function coverScale(vw: number, vh: number, box: { w: number; h: number }) {
  return Math.max(vw / box.w, vh / box.h) * 1.02;
}

/* ---------------------------------- math ----------------------------------- */

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

/** Piecewise fade: 0 → 1 → 0 across [a,b] and [c,d] */
export function fadeWindow(v: number, a: number, b: number, c: number, d: number) {
  if (v <= a || v >= d) return 0;
  if (v < b) return (v - a) / (b - a);
  if (v > c) return 1 - (v - c) / (d - c);
  return 1;
}

/** Catmull-Rom → cubic bezier smooth path through points */
export function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* -------------------------------- interval hook ---------------------------- */

export function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
