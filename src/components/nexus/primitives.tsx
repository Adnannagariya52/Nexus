"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// ─── NexusCard — matches landing page's border/bg/shadow language ────────────
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
      transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }}
      className={cn(
        "rounded-xl border border-black/[0.06] bg-white shadow-soft",
        hover && "cursor-pointer hover:border-black/20 transition-colors duration-300",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── NexusButton — matches landing page's button language ───────────────────
type NexusButtonProps = React.ComponentProps<typeof Button> & {
  variant?: "default" | "iris" | "outline" | "ghost"
  size?: "sm" | "default" | "lg" | "icon"
}

export function NexusButton({ variant = "default", className, ...props }: NexusButtonProps) {
  const variantClass = {
    default: "bg-ink text-white hover:bg-coal border-0 rounded-full",
    iris: "bg-iris text-white hover:bg-iris-dark border-0 rounded-full",
    outline: "border border-black/15 bg-transparent hover:bg-black/[0.04] text-ink rounded-full",
    ghost: "hover:bg-black/[0.04] text-ink rounded-full border-0",
  }[variant]
  return <Button className={cn(variantClass, className)} {...props} />
}

// ─── NexusStatCard — matches landing page's StatChip design ──────────────────
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
    <div className="rounded-xl border border-black/[0.06] bg-[#FAFAF8] p-4">
      <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-black/40">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight" style={{ color, fontFamily: "var(--font-display)" }}>
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-black/40">{sub}</div>}
    </div>
  )
}

// ─── NexusProgressRing ────────────────────────────────────────────────────────
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
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(17,17,17,0.06)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        />
      </svg>
      {label && <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">{label}</div>}
    </div>
  )
}

// ─── NexusProgressBar — matches landing page's progress bar ──────────────────
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
    <div className={cn("h-[5px] overflow-hidden rounded-full bg-black/[0.06]", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, progress)}%` }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

// ─── NexusBadge — matches landing page's pill badges ─────────────────────────
type BadgeColor = "iris" | "lime" | "muted" | "dark"

const badgeColors: Record<BadgeColor, string> = {
  iris: "bg-iris-soft text-iris-dark border-transparent",
  lime: "bg-[#B8FF6A]/15 text-[#5B9B1F] border-transparent",
  muted: "bg-black/[0.04] text-black/50 border-black/[0.06]",
  dark: "bg-ink text-white border-transparent",
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
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[8.5px] tracking-[0.14em] font-medium",
        badgeColors[color],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── NexusEmptyState ──────────────────────────────────────────────────────────
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
      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
      className="flex flex-col items-center justify-center text-center py-16 px-4"
    >
      {icon && (
        <div className="mb-4 h-12 w-12 rounded-xl border border-black/[0.06] bg-[#FAFAF8] flex items-center justify-center text-black/30">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      {description && <p className="mt-1.5 text-sm text-black/40 max-w-sm">{description}</p>}
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

// ─── NexusViewHeader — matches landing page's editorial heading style ────────
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
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-black/40">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── NexusSectionLabel — the mono uppercase label used throughout ───────────
export function NexusSectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[9px] tracking-[0.25em] text-black/40 font-medium", className)}>
      {children}
    </span>
  )
}
