"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/store"
import { useData, updateResource } from "@/lib/data-client"
import { X, Bell, Check, Trash2, CalendarClock, Award, Target, Flame, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  exam: CalendarClock,
  achievement: Award,
  goal: Target,
  habit: Flame,
  warning: AlertCircle,
  info: Bell,
}

const COLORS: Record<string, string> = {
  exam: "#FFB020",
  achievement: "#4238D6",
  goal: "#B8FF6A",
  habit: "#6C63FF",
  warning: "#E5484D",
  info: "#6C63FF",
}

export function NotificationsDrawer() {
  const open = useApp((s) => s.notifOpen)
  const setOpen = useApp((s) => s.setNotifOpen)
  const { snapshot, refresh } = useData()
  const notifications = snapshot?.notifications ?? []

  async function markRead(id: string) {
    try {
      await updateResource("notification", id, { read: true })
      await refresh()
    } catch {
      toast.error("Failed to update notification")
    }
  }
  async function markAllRead() {
    const unread = notifications.filter((n) => !n.read)
    await Promise.all(unread.map((n) => updateResource("notification", n.id, { read: true })))
    await refresh()
    toast.success("All notifications marked as read")
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[90] h-screen w-full max-w-md bg-background border-l border-border flex flex-col"
          >
            <div className="h-16 px-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <h2 className="text-base font-semibold">Notifications</h2>
                {notifications.some((n) => !n.read) && (
                  <span className="text-[10px] text-muted-foreground">
                    ({notifications.filter((n) => !n.read).length} new)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.some((n) => !n.read) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllRead}
                    className="text-xs h-8"
                  >
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-muted-foreground mb-3">
                    <Bell className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">You're all caught up.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Notifications about assignments, exams, and achievements will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = ICONS[n.type] || Bell
                  const color = COLORS[n.type] || "#6C63FF"
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "rounded-xl border p-3 flex gap-3 transition-colors",
                        n.read ? "border-border bg-card" : "border-[#6C63FF]/20 bg-[#6C63FF]/[0.04]",
                      )}
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{n.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.message}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1.5">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
