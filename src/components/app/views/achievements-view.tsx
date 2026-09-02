"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useData } from "@/lib/data-client"
import {
  NexusCard,
  NexusBadge,
  NexusEmptyState,
  NexusViewHeader,
} from "@/components/nexus/primitives"
import {
  Award,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  Target,
  Zap,
  Brain,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ALL_ACHIEVEMENTS = [
  {
    type: "first_focus",
    title: "First Focus Session",
    description: "Complete your first focus session",
    icon: Zap,
    color: "#6C63FF",
    check: (s: any) => s.focusSessions.length > 0,
  },
  {
    type: "streak_7",
    title: "7 Day Streak",
    description: "Study for 7 consecutive days",
    icon: Flame,
    color: "#FFB020",
    check: (s: any) => {
      const days = new Set(s.focusSessions.map((f: any) => new Date(f.startedAt).toDateString()))
      let streak = 0
      const d = new Date()
      while (days.has(d.toDateString())) {
        streak++
        d.setDate(d.getDate() - 1)
      }
      return streak >= 7
    },
  },
  {
    type: "study_50",
    title: "50 Study Hours",
    description: "Accumulate 50 hours of study",
    icon: Clock,
    color: "#B8FF6A",
    check: (s: any) =>
      [...s.focusSessions, ...s.studySessions].reduce(
        (sum: number, x: any) => sum + x.durationMinutes,
        0,
      ) >= 3000,
  },
  {
    type: "assignment_master",
    title: "Assignment Master",
    description: "Complete 25 assignments",
    icon: CheckCircle2,
    color: "#4238D6",
    check: (s: any) => s.assignments.filter((a: any) => a.status === "completed").length >= 25,
  },
  {
    type: "early_starter",
    title: "Early Starter",
    description: "Start a focus session before 8am",
    icon: Star,
    color: "#6C63FF",
    check: (s: any) =>
      s.focusSessions.some((f: any) => new Date(f.startedAt).getHours() < 8),
  },
  {
    type: "goal_crusher",
    title: "Goal Crusher",
    description: "Complete 5 goals",
    icon: Target,
    color: "#EC4899",
    check: (s: any) => s.goals.filter((g: any) => g.progress >= 100).length >= 5,
  },
  {
    type: "ai_explorer",
    title: "AI Explorer",
    description: "Have 10 conversations with the AI tutor",
    icon: Brain,
    color: "#6C63FF",
    check: (s: any) => s.aiConversations.length >= 10,
  },
  {
    type: "subject_scholar",
    title: "Subject Scholar",
    description: "Create 5 subjects",
    icon: Trophy,
    color: "#FFB020",
    check: (s: any) => s.subjects.length >= 5,
  },
]

export function AchievementsView() {
  const { snapshot } = useData()
  const unlocked = snapshot?.achievements || []

  const unlockedTypes = new Set(unlocked.map((a) => a.achievementType))

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Achievements"
        subtitle="Celebrate milestones and unlock new badges."
      />

      {/* Summary */}
      <NexusCard className="p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-48 w-48 bg-[#4238D6]/15 blur-3xl" />
        <div className="relative flex items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#4238D6] flex items-center justify-center shadow-glow">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <div>
            <div className="text-3xl font-semibold">
              {unlocked.length}{" "}
              <span className="text-muted-foreground text-base font-normal">
                / {ALL_ACHIEVEMENTS.length} unlocked
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {unlocked.length === 0
                ? "Complete your first focus session to start unlocking achievements."
                : `Keep going — ${ALL_ACHIEVEMENTS.length - unlocked.length} more to discover.`}
            </div>
          </div>
        </div>
      </NexusCard>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ALL_ACHIEVEMENTS.map((a, i) => {
          const isUnlocked = unlockedTypes.has(a.type)
          const Icon = a.icon
          return (
            <motion.div
              key={a.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <NexusCard
                className={cn(
                  "p-5 h-full",
                  !isUnlocked && "opacity-60",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                      isUnlocked ? "" : "grayscale",
                    )}
                    style={{
                      backgroundColor: isUnlocked ? `${a.color}15` : "rgba(148,163,184,0.1)",
                      color: isUnlocked ? a.color : "#94A3B8",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                      {isUnlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-lime" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                    {isUnlocked ? (
                      <NexusBadge color="green" className="mt-3">
                        <Award className="h-2.5 w-2.5" />
                        Unlocked
                      </NexusBadge>
                    ) : (
                      <NexusBadge color="muted" className="mt-3">
                        Locked
                      </NexusBadge>
                    )}
                  </div>
                </div>
              </NexusCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
