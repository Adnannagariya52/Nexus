"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface NexusLogoProps {
  size?: number
  withWordmark?: boolean
  className?: string
  wordmarkClassName?: string
}

export function NexusLogo({
  size = 28,
  withWordmark = false,
  className,
  wordmarkClassName,
}: NexusLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="nx-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5B8CFF" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="currentColor" className="text-[#0E1117]" />
        <rect width="32" height="32" rx="8" fill="currentColor" className="text-foreground opacity-[0.04]" />
        <path
          d="M9 22V10L23 22V10"
          stroke="url(#nx-mark)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="10" r="1.6" fill="#5B8CFF" />
        <circle cx="23" cy="22" r="1.6" fill="#8B5CF6" />
      </svg>
      {withWordmark && (
        <span
          className={cn(
            "text-[17px] font-semibold tracking-tight",
            wordmarkClassName,
          )}
        >
          NEXUS
        </span>
      )}
    </div>
  )
}
