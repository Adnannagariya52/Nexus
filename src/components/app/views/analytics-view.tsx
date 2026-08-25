"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useData } from "@/lib/data-client"
import {
  NexusCard,
  NexusStatCard,
  NexusEmptyState,
  NexusViewHeader,
} from "@/components/nexus/primitives"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts"
import { TrendingUp, Clock, Target, Flame, CheckCircle2, BarChart3 } from "lucide-react"

const COLORS = ["#6C63FF", "#4238D6", "#6C63FF", "#B8FF6A", "#FFB020", "#EC4899"]

export function AnalyticsView() {
  const { snapshot } = useData()
  const focusSessions = snapshot?.focusSessions || []
  const studySessions = snapshot?.studySessions || []
  const subjects = snapshot?.subjects || []
  const assignments = snapshot?.assignments || []
  const habits = snapshot?.habits || []
  const habitLogs = snapshot?.habitLogs || []
  const goals = snapshot?.goals || []

  // Empty state for new users
  const totalMinutes = focusSessions.reduce((sum, f) => sum + f.durationMinutes, 0) +
    studySessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  if (totalMinutes === 0 && assignments.length === 0 && habits.length === 0) {
    return (
      <div className="pb-8">
        <NexusViewHeader
          title="Analytics"
          subtitle="Beautiful insights built from your real study data."
        />
        <NexusCard className="p-0">
          <NexusEmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title="Your analytics will appear here."
            description="Start a focus session, log study time, or complete assignments — your charts will populate automatically."
          />
        </NexusCard>
      </div>
    )
  }

  // Last 14 days weekly time
  const today = new Date()
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (13 - i))
    return d
  })

  const weeklyData = days.map((d) => {
    const focusMin = focusSessions
      .filter((f) => f.status === "completed" && new Date(f.startedAt).toDateString() === d.toDateString())
      .reduce((sum, f) => sum + f.durationMinutes, 0)
    const studyMin = studySessions
      .filter((s) => new Date(s.startedAt).toDateString() === d.toDateString())
      .reduce((sum, s) => sum + s.durationMinutes, 0)
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      minutes: focusMin + studyMin,
      focusMin,
      studyMin,
    }
  })

  // Subject distribution
  const subjectDist = subjects
    .map((s) => {
      const focusMin = focusSessions
        .filter((f) => f.subjectId === s.id)
        .reduce((sum, f) => sum + f.durationMinutes, 0)
      const studyMin = studySessions
        .filter((st) => st.subjectId === s.id)
        .reduce((sum, st) => sum + st.durationMinutes, 0)
      return {
        name: s.name,
        value: focusMin + studyMin,
        color: s.color,
      }
    })
    .filter((s) => s.value > 0)

  // Task completion rate
  const completedTasks = assignments.filter((a) => a.status === "completed").length
  const completionRate = assignments.length
    ? Math.round((completedTasks / assignments.length) * 100)
    : 0

  // Habit consistency (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const habitConsistency = last7.map((d) => {
    const completed = habitLogs.filter(
      (l) => new Date(l.completedDate).toDateString() === d.toDateString(),
    ).length
    return {
      day: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
      rate: habits.length ? Math.round((completed / habits.length) * 100) : 0,
    }
  })

  // Goal progress
  const goalsOnTrack = goals.filter((g) => g.status === "on_track" || g.status === "completed").length

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Analytics"
        subtitle="Beautiful insights built from your real study data."
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NexusStatCard
          label="Total study"
          value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
          sub="All time"
          color="#6C63FF"
          icon={<Clock className="h-4 w-4" />}
        />
        <NexusStatCard
          label="Focus sessions"
          value={focusSessions.filter((f) => f.status === "completed").length}
          sub="Completed"
          color="#4238D6"
          icon={<Target className="h-4 w-4" />}
        />
        <NexusStatCard
          label="Task completion"
          value={`${completionRate}%`}
          sub={`${completedTasks}/${assignments.length}`}
          color="#B8FF6A"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <NexusStatCard
          label="Goals on track"
          value={`${goalsOnTrack}/${goals.length}`}
          sub="Active"
          color="#FFB020"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Weekly chart */}
      <NexusCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Study time — last 14 days
            </h3>
            <div className="text-2xl font-semibold mt-1">
              {Math.floor(weeklyData.reduce((s, d) => s + d.minutes, 0) / 60)}h{" "}
              {weeklyData.reduce((s, d) => s + d.minutes, 0) % 60}m
            </div>
          </div>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="grad-min" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0E1117",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#94A3B8" }}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#6C63FF"
                strokeWidth={2}
                fill="url(#grad-min)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </NexusCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subject distribution */}
        <NexusCard className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-5">
            Subject distribution
          </h3>
          {subjectDist.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              No subject study data yet
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    paddingAngle={3}
                    animationDuration={1000}
                  >
                    {subjectDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0E1117",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {subjectDist.length > 0 && (
            <div className="mt-4 space-y-2">
              {subjectDist.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </div>
                  <span className="text-muted-foreground">
                    {Math.floor(s.value / 60)}h {s.value % 60}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </NexusCard>

        {/* Habit consistency */}
        <NexusCard className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-5">
            Habit consistency — last 7 days
          </h3>
          {habits.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              No habits tracked yet
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitConsistency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0E1117",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="rate"
                    fill="#6C63FF"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {habits.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold">
                  {Math.round(habitConsistency.reduce((s, d) => s + d.rate, 0) / 7)}%
                </div>
                <div className="text-[10px] text-muted-foreground">Avg</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{habits.length}</div>
                <div className="text-[10px] text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {habitLogs.filter((l) => {
                    const d = new Date(l.completedDate)
                    return (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) < 7
                  }).length}
                </div>
                <div className="text-[10px] text-muted-foreground">7d total</div>
              </div>
            </div>
          )}
        </NexusCard>
      </div>

      {/* Task completion */}
      {assignments.length > 0 && (
        <NexusCard className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-5">
            Task completion
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total</div>
              <div className="text-2xl font-semibold">{assignments.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Completed</div>
              <div className="text-2xl font-semibold text-[#B8FF6A]">{completedTasks}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Pending</div>
              <div className="text-2xl font-semibold text-[#FFB020]">
                {assignments.filter((a) => a.status === "pending").length}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Rate</div>
              <div className="text-2xl font-semibold">{completionRate}%</div>
            </div>
          </div>
        </NexusCard>
      )}
    </div>
  )
}
