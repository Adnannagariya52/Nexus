import { motion } from "framer-motion";

/**
 * The warm off-white spatial environment behind every light chapter.
 * Soft ambient light, two slowly drifting luminaires, and a paper grain film.
 * Depth comes from restraint — no blobs, no grids, no particles.
 */
export default function AmbientBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-paper" aria-hidden="true">
        {/* ceiling light */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_-10%,rgba(255,255,255,0.95),transparent_60%)]" />
        {/* iris luminaire — left */}
        <motion.div
          className="absolute -left-[18vw] -top-[18vh] h-[62vw] w-[62vw] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(108,99,255,0.075), transparent 65%)",
          }}
          animate={{ x: [0, 36, -14, 0], y: [0, -26, 18, 0] }}
          transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
        />
        {/* graphite luminaire — right */}
        <motion.div
          className="absolute -bottom-[24vh] -right-[16vw] h-[56vw] w-[56vw] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(21,21,21,0.055), transparent 65%)",
          }}
          animate={{ x: [0, -30, 20, 0], y: [0, 22, -16, 0] }}
          transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
        />
        {/* floor vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(130%_110%_at_50%_50%,transparent_62%,rgba(9,9,9,0.045))]" />
      </div>

      {/* film grain */}
      <div
        className="grain pointer-events-none fixed inset-0 z-[80] opacity-[0.05]"
        aria-hidden="true"
      />
    </>
  );
}
