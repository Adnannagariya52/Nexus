"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface NexusLogoProps {
  size?: number
  withWordmark?: boolean
  className?: string
  wordmarkClassName?: string
  animated?: boolean
  variant?: "iris" | "adaptive"
}

export function NexusLogo({
  size = 24,
  withWordmark = false,
  className,
  wordmarkClassName,
  animated = false,
  variant = "adaptive",
}: NexusLogoProps) {
  const strokeColor = variant === "iris" ? "#6C63FF" : "currentColor"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <motion.path
          d="M7 18V6l10 12V6"
          stroke={strokeColor}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0 } : false}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        />
      </svg>
      {withWordmark && (
        <motion.span
          className={cn("text-[15px] font-semibold tracking-tight", wordmarkClassName)}
          initial={animated ? { opacity: 0, x: -4 } : false}
          animate={animated ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          NEXUS
        </motion.span>
      )}
    </div>
  )
}
