import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE_OUT } from "../lib/hooks";

const LINKS = [
  { label: "System", id: "system" },
  { label: "Intelligence", id: "intelligence" },
  { label: "Focus", id: "focus" },
  { label: "Progress", id: "progress" },
];

interface Props {
  ready: boolean;
  onNav: (hash: string) => void;
}

/**
 * Nearly invisible navigation. Rendered in pure white with
 * mix-blend-difference so it self-inverts across light and dark chapters.
 */
export default function Navigation({ ready, onNav }: Props) {
  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 mix-blend-difference"
      initial={{ y: -28, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.9, delay: 0.4, ease: EASE_OUT }}
    >
      <nav className="flex h-[72px] items-center justify-between px-5 text-white md:px-10">
        <button
          onClick={() => onNav("#top")}
          className="text-[15px] font-semibold tracking-[0.3em]"
          aria-label="NEXUS — back to top"
        >
          NEXUS
        </button>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => onNav(`#${l.id}`)}
              className="group relative py-1 text-[12.5px] tracking-[0.05em] text-white/70 transition-colors duration-300 hover:text-white"
            >
              {l.label}
              <span
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100"
                style={{ transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <button className="hidden text-[12.5px] text-white/60 transition-colors duration-300 hover:text-white sm:block">
            Sign in
          </button>
          <button
            onClick={() => onNav("#finale")}
            className="group flex items-center gap-2 rounded-full border border-white/40 py-2 pl-4 pr-3.5 text-[11px] font-medium tracking-[0.18em] transition-all duration-500 hover:gap-3 hover:border-white"
          >
            ENTER NEXUS
            <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5" strokeWidth={2} />
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
