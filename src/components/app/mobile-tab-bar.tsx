"use client"

import * as React from "react"
import { useApp, type AppRoute } from "@/lib/store"
import { LayoutDashboard, BookOpen, Timer, Brain, User } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS: { route: AppRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { route: "dashboard", label: "Home", icon: LayoutDashboard },
  { route: "study", label: "Study", icon: BookOpen },
  { route: "focus", label: "Focus", icon: Timer },
  { route: "ai-tutor", label: "AI", icon: Brain },
  { route: "profile", label: "Profile", icon: User },
]

export function MobileTabBar() {
  const route = useApp((s) => s.route)
  const navigate = useApp((s) => s.navigate)

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 glass-strong border-t border-border flex items-stretch">
      {TABS.map((tab) => {
        const active = route === tab.route || (tab.route === "dashboard" && route === "subjects") || (tab.route === "profile" && (route === "profile" || route === "settings"))
        return (
          <button
            key={tab.route}
            onClick={() => navigate(tab.route)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
              active ? "text-[#5B8CFF]" : "text-muted-foreground",
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {active && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#5B8CFF]" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
