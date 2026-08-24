"use client"

import * as React from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/store"
import { NexusLogo } from "@/components/nexus/nexus-logo"
import {
  ArrowRight,
  Sparkles,
  Brain,
  Timer,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Calendar,
  Zap,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function LandingPage() {
  const setView = useApp((s) => s.setView)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#050608] text-white overflow-hidden">
      {/* Ambient background */}
      <LandingBackground />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "py-2.5" : "py-4",
        )}
      >
        <div
          className={cn(
            "mx-auto max-w-7xl px-4 sm:px-6",
            scrolled && "max-w-6xl",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between rounded-2xl transition-all duration-500",
              scrolled
                ? "glass-strong border border-white/[0.08] shadow-premium px-4 py-2.5"
                : "px-2 py-2 border border-transparent",
            )}
          >
            <NexusLogo size={28} withWordmark wordmarkClassName="text-white" />

            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Product", target: "product" },
                { label: "Features", target: "features" },
                { label: "AI Tutor", target: "ai" },
                { label: "How It Works", target: "how" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    document
                      .getElementById(item.target)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("login")}
                className="hidden sm:inline-flex h-9 px-3.5 items-center text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => setView("signup")}
                className="inline-flex h-9 px-4 items-center gap-1.5 text-sm font-semibold text-white rounded-lg bg-white/[0.08] border border-white/10 hover:bg-white/[0.14] transition-all"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <HeroSection />

      {/* Problem */}
      <ProblemSection />

      {/* Solution */}
      <SolutionSection />

      {/* Features */}
      <FeaturesSection />

      {/* AI Tutor showcase */}
      <AIShowcase id="ai" />

      {/* Focus mode cinematic */}
      <FocusShowcase />

      {/* Analytics */}
      <AnalyticsShowcase />

      {/* How it works */}
      <HowItWorks id="how" />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}

function LandingBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-[#050608]" />
      <div className="absolute inset-0 bg-grid opacity-[0.5]" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute -top-40 left-1/4 h-[40rem] w-[40rem] rounded-full bg-[#5B8CFF]/20 blur-[120px]"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
        className="absolute top-1/3 -right-40 h-[35rem] w-[35rem] rounded-full bg-[#8B5CF6]/15 blur-[120px]"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.6 }}
        className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-[#22D3EE]/10 blur-[120px]"
      />
    </div>
  )
}

function HeroSection() {
  const setView = useApp((s) => s.setView)
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <section
      id="product"
      ref={ref}
      className="relative min-h-screen flex items-center pt-32 pb-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full">
        <motion.div
          style={{ y, opacity }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur text-xs font-medium text-white/70 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#5B8CFF]" />
              Introducing NEXUS — built for serious students
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2.75rem] sm:text-6xl lg:text-[4.25rem] font-semibold tracking-[-0.03em] leading-[0.95] text-balance"
            >
              Your entire student life.
              <br />
              <span className="gradient-text">One intelligent system.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-7 max-w-xl text-lg text-white/60 leading-relaxed text-pretty"
            >
              Plan your studies, master your subjects, track your progress, and solve doubts —
              all from one beautifully designed workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <button
                onClick={() => setView("signup")}
                className="group relative inline-flex h-12 px-6 items-center gap-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] hover:shadow-[0_0_40px_-4px_rgba(91,140,255,0.5)] transition-all"
              >
                Enter NEXUS
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() =>
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex h-12 px-6 items-center gap-2 text-sm font-semibold text-white/90 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all"
              >
                Explore Platform
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-10 flex items-center gap-6 text-xs text-white/40"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                Free to start
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                AI-powered
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                Built for students
              </div>
            </motion.div>
          </div>

          {/* Right: hero preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <HeroPreview />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function HeroPreview() {
  return (
    <div className="relative">
      {/* Glow behind */}
      <div className="absolute -inset-10 bg-gradient-to-br from-[#5B8CFF]/30 via-transparent to-[#8B5CF6]/30 blur-3xl opacity-50" />

      {/* Main card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative glass-strong border border-white/[0.08] rounded-2xl shadow-premium overflow-hidden"
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#22C55E]/70" />
          </div>
          <div className="text-[10px] text-white/40 font-medium tracking-wide uppercase">
            nexus.app
          </div>
          <div className="w-12" />
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5">
          {/* Top stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Focus Score", value: "92", color: "#5B8CFF" },
              { label: "Streak", value: "7d", color: "#F59E0B" },
              { label: "Today", value: "2h 14m", color: "#22C55E" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="text-[10px] text-white/40 uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-lg font-semibold mt-0.5" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Today's mission */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#5B8CFF]/[0.08] to-[#8B5CF6]/[0.05] p-4 mb-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">
                Today's Mission
              </div>
              <Zap className="h-3.5 w-3.5 text-[#5B8CFF]" />
            </div>
            <div className="text-sm font-medium text-white">Calculus — Integration by Parts</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ duration: 1.4, delay: 1.4 }}
                  className="h-full bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6]"
                />
              </div>
              <span className="text-[10px] text-white/40">60%</span>
            </div>
          </motion.div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-2">
            {/* Timer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col items-center justify-center"
            >
              <div className="relative h-12 w-12">
                <svg className="absolute inset-0" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="none" />
                  <motion.circle
                    cx="24" cy="24" r="20"
                    stroke="#5B8CFF"
                    strokeWidth="4" fill="none" strokeLinecap="round"
                    strokeDasharray="125.6"
                    initial={{ strokeDashoffset: 125.6 }}
                    animate={{ strokeDashoffset: 37 }}
                    transition={{ duration: 1.5, delay: 1.6 }}
                    transform="rotate(-90 24 24)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
                  18:42
                </div>
              </div>
              <div className="text-[10px] text-white/40 mt-1.5">Focus</div>
            </motion.div>

            {/* Upcoming exam */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <div className="text-[10px] text-white/40 uppercase tracking-wide">Exam</div>
              <div className="text-xs font-medium mt-0.5 text-white">Physics Midterm</div>
              <div className="mt-2 flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-[#F59E0B]" />
                <span className="text-[10px] text-white/60">In 5 days</span>
              </div>
              <div className="mt-1.5 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1.2, delay: 1.7 }}
                  className="h-full bg-[#F59E0B]"
                />
              </div>
            </motion.div>
          </div>

          {/* AI Tutor preview row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Brain className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span className="text-[10px] uppercase tracking-wide text-white/40 font-medium">
                AI Tutor
              </span>
            </div>
            <div className="text-xs text-white/70 leading-relaxed">
              "Explain Newton's third law simply."
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="inline-block w-1 h-3 bg-[#8B5CF6] ml-0.5 align-middle"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating accent: Tasks card */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-8 top-1/3 hidden sm:block glass-strong border border-white/[0.08] rounded-xl p-3 w-44 shadow-premium"
      >
        <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1.5">Tasks Today</div>
        {[
          { label: "Math problem set", done: true },
          { label: "Read chapter 4", done: true },
          { label: "Physics notes", done: false },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-2 py-1">
            <div
              className={cn(
                "h-3.5 w-3.5 rounded-full flex items-center justify-center border",
                t.done ? "bg-[#22C55E] border-[#22C55E]" : "border-white/20",
              )}
            >
              {t.done && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
            </div>
            <span className={cn("text-[11px]", t.done ? "text-white/40 line-through" : "text-white/80")}>
              {t.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function ProblemSection() {
  const items = [
    { label: "Notes", icon: "📝" },
    { label: "Assignments", icon: "📚" },
    { label: "Exams", icon: "📋" },
    { label: "Goals", icon: "🎯" },
    { label: "Timers", icon: "⏱" },
    { label: "AI questions", icon: "🤖" },
  ]

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
            Student life is scattered.
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            Notes in one app. Assignments in another. Timers scattered everywhere. Studying
            becomes a struggle of switching tabs instead of actually learning.
          </p>
        </motion.div>

        <div className="mt-16 relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30, rotate: -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="aspect-square rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col items-center justify-center gap-3 p-4"
                style={{
                  transform: `translateY(${i % 2 === 0 ? -8 : 8}px)`,
                }}
              >
                <div className="text-3xl opacity-80">{item.icon}</div>
                <div className="text-xs font-medium text-white/60">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SolutionSection() {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#5B8CFF]/20 bg-[#5B8CFF]/[0.06] text-xs font-medium text-[#5B8CFF] mb-5">
            The NEXUS Way
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            NEXUS brings everything together.
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            A single intelligent workspace that connects your subjects, assignments, exams, notes,
            goals, habits, focus sessions, and AI tutor into one cohesive system.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 relative aspect-[16/9] rounded-2xl glass-strong border border-white/[0.08] p-8 overflow-hidden"
        >
          {/* Central NEXUS core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#5B8CFF]/30 blur-3xl" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] flex items-center justify-center shadow-glow">
                <NexusLogo size={56} />
              </div>
            </motion.div>
          </div>

          {/* Orbiting feature pills */}
          {[
            { label: "Subjects", angle: 0 },
            { label: "AI Tutor", angle: 60 },
            { label: "Focus", angle: 120 },
            { label: "Notes", angle: 180 },
            { label: "Goals", angle: 240 },
            { label: "Analytics", angle: 300 },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="absolute top-1/2 left-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "center" }}
            >
              <motion.div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `rotate(${item.angle}deg) translateX(220px) rotate(-${item.angle}deg)`,
                }}
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="px-3 py-1.5 rounded-full glass-strong border border-white/10 text-xs font-medium text-white whitespace-nowrap"
                >
                  {item.label}
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: Target,
      title: "Smart Dashboard",
      desc: "Your day at a glance — focus score, streak, today's mission, upcoming exams, and AI-recommended priorities.",
      color: "#5B8CFF",
    },
    {
      icon: BookOpen,
      title: "Subject Intelligence",
      desc: "Organize subjects into chapters, track progress, and connect every assignment, note, and exam to a clear roadmap.",
      color: "#8B5CF6",
    },
    {
      icon: CheckCircle2,
      title: "Assignment Management",
      desc: "Prioritize, filter, and complete. Track due dates, estimated study time, and never miss a deadline again.",
      color: "#22C55E",
    },
    {
      icon: Calendar,
      title: "Exam Preparation",
      desc: "Live countdowns, syllabus tracking, and preparation progress for every upcoming exam, with urgency cues.",
      color: "#F59E0B",
    },
    {
      icon: Timer,
      title: "Focus Mode",
      desc: "A cinematic Pomodoro experience that tracks every session, builds streaks, and unlocks achievements.",
      color: "#22D3EE",
    },
    {
      icon: Brain,
      title: "AI Tutor",
      desc: "Powered by Gemini. Ask anything about your studies, upload questions, and get step-by-step explanations.",
      color: "#5B8CFF",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      desc: "Beautiful charts built from your real study data — weekly trends, subject distribution, completion rates.",
      color: "#22C55E",
    },
    {
      icon: Target,
      title: "Goals",
      desc: "Set academic goals with target dates, track progress, and let NEXUS calculate on-track vs at-risk.",
      color: "#F59E0B",
    },
    {
      icon: Zap,
      title: "Habits",
      desc: "Build consistency with daily habits, calendar heatmaps, streaks, and best-record tracking.",
      color: "#8B5CF6",
    },
    {
      icon: Award,
      title: "Career Exploration",
      desc: "Map interests, skills, and strengths into possible career paths with clear study roadmaps.",
      color: "#22D3EE",
    },
  ]

  return (
    <section id="features" className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="text-xs font-medium text-[#5B8CFF] uppercase tracking-wide mb-3">
            Everything in one place
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Ten powerful systems.
            <br />
            <span className="text-white/40">One workspace.</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-default"
            >
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                style={{ backgroundColor: `${f.color}15`, color: f.color }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-white/50 leading-relaxed">{f.desc}</p>
              <ChevronRight className="absolute top-6 right-5 h-4 w-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AIShowcase({ id }: { id: string }) {
  const [typed, setTyped] = React.useState("")
  const fullText =
    "Newton's third law says that for every action, there is an equal and opposite reaction. If you push a wall with 50N of force, the wall pushes back on you with 50N in the opposite direction. The forces act on different objects, which is why neither cancels the other out."

  React.useEffect(() => {
    let i = 0
    let timer: any
    let started = false
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true
          timer = setInterval(() => {
            i += 2
            setTyped(fullText.slice(0, i))
            if (i >= fullText.length) clearInterval(timer)
          }, 25)
        }
      },
      { threshold: 0.3 },
    )
    const el = document.getElementById(id)
    if (el) obs.observe(el)
    return () => {
      if (timer) clearInterval(timer)
      obs.disconnect()
    }
  }, [id, fullText])

  return (
    <section id={id} className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.08] text-xs font-medium text-[#8B5CF6] mb-5">
              <Brain className="h-3.5 w-3.5" />
              NEXUS AI Tutor
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Your personal
              <br />
              study companion.
            </h2>
            <p className="mt-4 text-white/50 max-w-lg leading-relaxed">
              Powered by Google Gemini, NEXUS AI Tutor explains concepts clearly, shows
              step-by-step solutions, quizzes you, and adapts explanations to your level.
              It's like having a tutor who never sleeps.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              {[
                { label: "Explain this", icon: Sparkles },
                { label: "Solve step-by-step", icon: Brain },
                { label: "Give an example", icon: BookOpen },
                { label: "Quiz me", icon: Award },
                { label: "Summarize", icon: TrendingUp },
                { label: "Simplify", icon: Zap },
              ].map((q) => (
                <div
                  key={q.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-white/70"
                >
                  <q.icon className="h-3.5 w-3.5 text-[#8B5CF6]" />
                  {q.label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-gradient-to-br from-[#8B5CF6]/20 to-transparent blur-3xl" />
            <div className="relative glass-strong border border-white/[0.08] rounded-2xl shadow-premium overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] flex items-center justify-center">
                  <Brain className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold">NEXUS AI Tutor</div>
                  <div className="text-[10px] text-white/40">Physics • Grade 12</div>
                </div>
              </div>

              <div className="p-4 space-y-3 min-h-[260px]">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-[#5B8CFF]/[0.15] border border-[#5B8CFF]/30 px-3.5 py-2 text-xs text-white">
                    Explain Newton's third law simply.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/[0.04] border border-white/[0.06] px-3.5 py-2.5 text-xs text-white/80 leading-relaxed">
                    {typed}
                    <span className="inline-block w-1 h-3 bg-[#8B5CF6] ml-0.5 align-middle animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/[0.06] p-3">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-white/40">
                  Ask anything about your studies...
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FocusShowcase() {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/[0.08] text-xs font-medium text-[#22D3EE] mb-5">
            <Timer className="h-3.5 w-3.5" />
            Focus Mode
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            A cinematic experience for deep work.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[16/9] rounded-3xl glass-strong border border-white/[0.08] overflow-hidden flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#22D3EE]/[0.05] via-transparent to-[#5B8CFF]/[0.05]" />
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 rounded-full border border-dashed border-white/[0.06]"
            />
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-64 w-64 rounded-full flex items-center justify-center"
              style={{
                background: "conic-gradient(from 0deg, #5B8CFF, #22D3EE, #8B5CF6, #5B8CFF)",
                padding: "2px",
              }}
            >
              <div className="absolute inset-[3px] rounded-full bg-[#050608] flex flex-col items-center justify-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Focusing
                </div>
                <div className="text-6xl font-semibold mt-2 tracking-tight font-mono">24:18</div>
                <div className="text-xs text-white/50 mt-2">Mathematics • Pomodoro</div>
              </div>
            </motion.div>
          </div>

          {/* Floating controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="h-11 w-11 rounded-full glass-strong border border-white/10 flex items-center justify-center text-white/60">
              <Timer className="h-4 w-4" />
            </div>
            <div className="h-11 px-5 rounded-full glass-strong border border-white/10 flex items-center text-white text-sm font-medium">
              Pause
            </div>
            <div className="h-11 w-11 rounded-full glass-strong border border-white/10 flex items-center justify-center text-white/60">
              <Zap className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function AnalyticsShowcase() {
  const bars = [40, 65, 35, 80, 55, 90, 70]
  const days = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/[0.08] text-xs font-medium text-[#22C55E] mb-5">
            <TrendingUp className="h-3.5 w-3.5" />
            Analytics
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            See your progress come to life.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {/* Weekly chart */}
          <div className="md:col-span-2 rounded-2xl glass-strong border border-white/[0.08] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wide">This week</div>
                <div className="text-2xl font-semibold mt-0.5">14h 32m</div>
              </div>
              <div className="text-xs px-2 py-1 rounded-md bg-[#22C55E]/[0.1] text-[#22C55E] font-medium">
                +24%
              </div>
            </div>
            <div className="flex items-end gap-2 h-32">
              {bars.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${b}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="w-full rounded-t-md bg-gradient-to-t from-[#5B8CFF] to-[#8B5CF6]"
                  />
                  <div className="text-[10px] text-white/30">{days[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject breakdown */}
          <div className="rounded-2xl glass-strong border border-white/[0.08] p-6">
            <div className="text-xs text-white/40 uppercase tracking-wide mb-4">Subjects</div>
            {[
              { label: "Mathematics", pct: 38, color: "#5B8CFF" },
              { label: "Physics", pct: 28, color: "#8B5CF6" },
              { label: "Chemistry", pct: 19, color: "#22D3EE" },
              { label: "Biology", pct: 15, color: "#22C55E" },
            ].map((s, i) => (
              <div key={s.label} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/70">{s.label}</span>
                  <span className="text-white/40">{s.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function HowItWorks({ id }: { id: string }) {
  const steps = [
    {
      n: "01",
      title: "Create your account",
      desc: "Sign up in seconds with email or Google. Your data stays isolated and private.",
    },
    {
      n: "02",
      title: "Set up your profile",
      desc: "Tell NEXUS your grade, stream, school, goals, and daily study target.",
    },
    {
      n: "03",
      title: "Add your subjects",
      desc: "Create subjects and break them into chapters with progress tracking.",
    },
    {
      n: "04",
      title: "Start studying",
      desc: "Use Focus Mode, take notes, complete assignments, and ask the AI Tutor anything.",
    },
  ]

  return (
    <section id={id} className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Up and running in minutes.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className="text-xs font-mono text-[#5B8CFF] mb-3">{s.n}</div>
              <div className="text-base font-semibold mb-1.5">{s.title}</div>
              <div className="text-xs text-white/50 leading-relaxed">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  const setView = useApp((s) => s.setView)
  return (
    <section className="relative py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#5B8CFF]/[0.1] via-[#0E1117] to-[#8B5CF6]/[0.1] p-12 sm:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-80 bg-[#5B8CFF]/20 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-balance">
              Your next academic breakthrough starts here.
            </h2>
            <p className="mt-4 text-white/50 max-w-lg mx-auto">
              Join the students using NEXUS to organize their academic life and study smarter.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setView("signup")}
                className="group inline-flex h-12 px-7 items-center gap-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] hover:shadow-[0_0_50px_-4px_rgba(91,140,255,0.6)] transition-all"
              >
                Enter NEXUS
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <NexusLogo size={22} withWordmark wordmarkClassName="text-white/70" />
        <div>Built for serious students. © {new Date().getFullYear()} NEXUS.</div>
      </div>
    </footer>
  )
}
