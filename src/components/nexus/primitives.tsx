"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// ─── NexusCard ───────────────────────────────────────────────────────────────
export function NexusCard({
  children,
  className,
  hover,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border border-line bg-white text-ink shadow-soft",
        hover && "cursor-pointer hover:border-ink/20",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── NexusButton ─────────────────────────────────────────────────────────────
type NexusButtonProps = React.ComponentProps<typeof Button> & {
  variant?: "default" | "iris" | "outline" | "ghost" | "secondary"
  size?: "sm" | "default" | "lg" | "icon"
}

export function NexusButton({ variant = "default", className, ...props }: NexusButtonProps) {
  const variantClass = {
    default: "bg-ink text-white hover:bg-ink/90 border-0",
    iris: "bg-iris text-white hover:bg-iris-dark border-0",
    outline: "border border-line bg-white hover:bg-paper text-ink",
    ghost: "hover:bg-paper text-ink",
    secondary: "bg-paper text-ink hover:bg-line",
  }[variant]
  return <Button className={cn(variantClass, className)} {...props} />
}

// ─── NexusStatCard ───────────────────────────────────────────────────────────
export function NexusStatCard({
  label,
  value,
  sub,
  color = "#111111",
  icon,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  color?: string
  icon?: React.ReactNode
}) {
  return (
    <NexusCard className="p-5">
      <div className="text-[10px] uppercase tracking-wider text-mute font-medium font-mono">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-2 tracking-tight" style={{ color, fontFamily: "var(--font-display)" }}>
        {value}
      </div>
      {sub && <div className="text-xs text-mute mt-1">{sub}</div>}
    </NexusCard>
  )
}

// ─── NexusProgressRing ──────────────────────────────────────────────────────
export function NexusProgressRing({
  progress,
  size = 60,
  stroke = 6,
  color = "#6C63FF",
  label,
}: {
  progress: number
  size?: number
  stroke?: number
  color?: string
  label?: React.ReactNode
}) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ - (progress / 100) * circ
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E5E2" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
          {label}
        </div>
      )}
    </div>
  )
}

// ─── NexusProgressBar ───────────────────────────────────────────────────────
export function NexusProgressBar({
  progress,
  color = "#6C63FF",
  className,
}: {
  progress: number
  color?: string
  className?: string
}) {
  return (
    <div className={cn("h-1 bg-line rounded-full overflow-hidden", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, progress)}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

// ─── NexusBadge ──────────────────────────────────────────────────────────────
type BadgeColor = "iris" | "lime" | "muted" | "dark"

const badgeColors: Record<BadgeColor, string> = {
  iris: "bg-iris-soft text-iris-dark border-iris-soft",
  lime: "bg-lime/15 text-iris-dark border-lime/30",
  muted: "bg-paper text-mute border-line",
  dark: "bg-ink text-white border-ink",
}

export function NexusBadge({
  children,
  color = "muted",
  className,
}: {
  children: React.ReactNode
  color?: BadgeColor
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium font-mono",
        badgeColors[color],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── NexusEmptyState ─────────────────────────────────────────────────────────
export function NexusEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center text-center py-16 px-4"
    >
      {icon && (
        <div className="h-12 w-12 rounded-xl border border-line bg-white flex items-center justify-center text-mute mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-mute max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

// ─── NexusSkeleton ───────────────────────────────────────────────────────────
export function NexusSkeletonCard() {
  return (
    <Card className="p-4">
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-2/3 mb-3" />
      <Skeleton className="h-2 w-full" />
    </Card>
  )
}

export function NexusViewHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-mute">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
