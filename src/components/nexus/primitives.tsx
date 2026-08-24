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
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-premium",
        hover && "cursor-pointer hover:border-[#5B8CFF]/30",
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
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "sm" | "default" | "lg" | "icon"
}

export function NexusButton({ variant = "default", className, ...props }: NexusButtonProps) {
  const variantClass = {
    default: "bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] hover:shadow-[0_0_25px_-4px_rgba(91,140,255,0.45)] border-0 text-white",
    outline: "border border-border bg-background hover:bg-accent",
    ghost: "hover:bg-accent",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  }[variant]
  return <Button className={cn(variantClass, className)} {...props} />
}

// ─── NexusStatCard ───────────────────────────────────────────────────────────
export function NexusStatCard({
  label,
  value,
  sub,
  color = "#5B8CFF",
  icon,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  color?: string
  icon?: React.ReactNode
}) {
  return (
    <NexusCard className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            {label}
          </div>
          <div className="text-2xl font-semibold mt-1" style={{ color }}>
            {value}
          </div>
          {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </div>
        {icon && (
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {icon}
          </div>
        )}
      </div>
    </NexusCard>
  )
}

// ─── NexusProgressRing ──────────────────────────────────────────────────────
export function NexusProgressRing({
  progress,
  size = 60,
  stroke = 6,
  color = "#5B8CFF",
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
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
  color = "#5B8CFF",
  className,
}: {
  progress: number
  color?: string
  className?: string
}) {
  return (
    <div className={cn("h-1.5 bg-white/[0.05] rounded-full overflow-hidden", className)}>
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
type BadgeColor = "blue" | "violet" | "cyan" | "green" | "amber" | "red" | "muted"

const badgeColors: Record<BadgeColor, string> = {
  blue: "bg-[#5B8CFF]/10 text-[#5B8CFF] border-[#5B8CFF]/20",
  violet: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  cyan: "bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/20",
  green: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  amber: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  red: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  muted: "bg-muted text-muted-foreground border-border",
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
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium",
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
      className="flex flex-col items-center justify-center text-center py-16 px-4"
    >
      {icon && (
        <div className="h-14 w-14 rounded-2xl border border-border bg-card flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
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
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
