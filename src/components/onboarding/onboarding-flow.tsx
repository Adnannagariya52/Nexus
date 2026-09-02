"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNexusAuth } from "@/components/providers/nexus-auth-provider"
import { useApp } from "@/lib/store"
import { NexusLogo } from "@/components/nexus/nexus-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  GraduationCap,
  School,
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  Flame,
  Compass,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TOTAL_STEPS = 5

export function OnboardingFlow() {
  const { user } = useNexusAuth()
  const setView = useApp((s) => s.setView)
  const [step, setStep] = React.useState(0)
  const [direction, setDirection] = React.useState(1)
  const [submitting, setSubmitting] = React.useState(false)

  const [data, setData] = React.useState({
    fullName: user?.user_metadata?.full_name || "",
    grade: "",
    educationLevel: "high_school",
    stream: "",
    schoolName: "",
    academicGoal: "",
    studyTargetMinutes: 60,
  })

  async function finish() {
    setSubmitting(true)
    try {
      const r = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (r.headers.get("content-type")?.includes("application/json")) {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || "Failed to save profile")
      }
      toast.success("Your NEXUS is ready.")
      // Move to the final celebration screen
      setStep(TOTAL_STEPS) // celebration screen
    } catch (e: any) {
      toast.error(e?.message || "We couldn't save your profile. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  function next() {
    setDirection(1)
    if (step === TOTAL_STEPS - 1) {
      finish()
    } else {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
    }
  }
  function back() {
    setDirection(-1)
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white relative flex items-center justify-center px-4 sm:px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-iris/15 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#4238D6]/15 blur-[120px]"
        />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="mb-8 flex items-center justify-between">
          <NexusLogo size={28} withWordmark wordmarkClassName="text-white" />
          {step < TOTAL_STEPS && (
            <div className="text-xs text-white/40">
              Step {step + 1} of {TOTAL_STEPS}
            </div>
          )}
        </div>

        {step < TOTAL_STEPS && (
          <div className="mb-8 h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6C63FF] to-[#4238D6]"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <StepCard key="s1" direction={direction} icon={<Sparkles className="h-5 w-5" />}>
              <Heading
                title="What should we call you?"
                subtitle="We'll use this to personalize your NEXUS experience."
              />
              <div className="mt-6 space-y-3">
                <Label className="text-xs text-white/70">Full name</Label>
                <Input
                  autoFocus
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  className="h-12 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
                  placeholder="Aarav Sharma"
                />
              </div>
            </StepCard>
          )}

          {step === 1 && (
            <StepCard key="s2" direction={direction} icon={<GraduationCap className="h-5 w-5" />}>
              <Heading title="Your education" subtitle="Tell us about your current stage." />
              <div className="mt-6 space-y-5">
                <div>
                  <Label className="text-xs text-white/70 mb-2 block">Education level</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: "high_school", l: "High School" },
                      { v: "college", l: "College" },
                      { v: "competitive", l: "Competitive Exam" },
                      { v: "other", l: "Other" },
                    ].map((o) => (
                      <SelectButton
                        key={o.v}
                        active={data.educationLevel === o.v}
                        onClick={() => setData({ ...data, educationLevel: o.v })}
                        label={o.l}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-white/70 mb-2 block">Grade / Year</Label>
                  <Input
                    value={data.grade}
                    onChange={(e) => setData({ ...data, grade: e.target.value })}
                    className="h-11 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
                    placeholder="e.g. 12th, 2nd year"
                  />
                </div>
                <div>
                  <Label className="text-xs text-white/70 mb-2 block">Stream</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Science", "Commerce", "Arts", "Engineering", "Medical", "Other"].map((s) => (
                      <SelectButton
                        key={s}
                        active={data.stream === s}
                        onClick={() => setData({ ...data, stream: s })}
                        label={s}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {step === 2 && (
            <StepCard key="s3" direction={direction} icon={<School className="h-5 w-5" />}>
              <Heading
                title="Your school"
                subtitle="Where do you study? This is optional but helps us tailor things."
              />
              <div className="mt-6 space-y-3">
                <Label className="text-xs text-white/70">School / College name</Label>
                <Input
                  value={data.schoolName}
                  onChange={(e) => setData({ ...data, schoolName: e.target.value })}
                  className="h-12 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
                  placeholder="e.g. Delhi Public School, IIT Bombay"
                />
                <p className="text-[10px] text-white/40">
                  You can change this later in your profile settings.
                </p>
              </div>
            </StepCard>
          )}

          {step === 3 && (
            <StepCard key="s4" direction={direction} icon={<Target className="h-5 w-5" />}>
              <Heading
                title="What are your academic goals?"
                subtitle="Pick the one that fits you best."
              />
              <div className="mt-6 grid grid-cols-1 gap-2">
                {[
                  { v: "improve_grades", l: "Improve my grades", d: "Lift your current performance" },
                  { v: "entrance_exam", l: "Prepare for entrance exam", d: "JEE, NEET, SAT, GRE..." },
                  { v: "build_consistency", l: "Build study consistency", d: "Daily habit formation" },
                  { v: "master_subjects", l: "Master difficult subjects", d: "Deep concept clarity" },
                ].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setData({ ...data, academicGoal: o.v })}
                    className={cn(
                      "text-left p-4 rounded-xl border transition-all",
                      data.academicGoal === o.v
                        ? "border-[#6C63FF] bg-iris/[0.08]"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10",
                    )}
                  >
                    <div className="text-sm font-medium">{o.l}</div>
                    <div className="text-xs text-white/40 mt-0.5">{o.d}</div>
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {step === 4 && (
            <StepCard key="s5" direction={direction} icon={<Clock className="h-5 w-5" />}>
              <Heading
                title="Daily study target"
                subtitle="How much time do you want to study each day?"
              />
              <div className="mt-6 grid grid-cols-2 gap-2">
                {[
                  { v: 30, l: "30 min", icon: "🌱" },
                  { v: 60, l: "1 hour", icon: "📘" },
                  { v: 120, l: "2 hours", icon: "📚" },
                  { v: 180, l: "3 hours", icon: "🔥" },
                ].map((o) => (
                  <SelectButton
                    key={o.v}
                    active={data.studyTargetMinutes === o.v}
                    onClick={() => setData({ ...data, studyTargetMinutes: o.v })}
                    label={o.l}
                    emoji={o.icon}
                    large
                  />
                ))}
              </div>
            </StepCard>
          )}

          {step === TOTAL_STEPS && <CelebrationScreen onEnter={() => setView("app")} />}
        </AnimatePresence>

        {step < TOTAL_STEPS && (
          <div className="mt-8 flex items-center justify-between">
            <Button
              onClick={back}
              disabled={step === 0 || submitting}
              variant="ghost"
              className="text-white/50 hover:text-white hover:bg-white/[0.04]"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={next}
              disabled={submitting || (step === 0 && !data.fullName)}
              className="bg-gradient-to-br from-[#6C63FF] to-[#4238D6] hover:shadow-[0_0_30px_-4px_rgba(91,140,255,0.5)] border-0"
            >
              {step === TOTAL_STEPS - 1
                ? submitting ? "Setting up..." : "Enter NEXUS"
                : "Continue"}
              {!submitting && <ArrowRight className="h-4 w-4 ml-1.5" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function StepCard({
  children,
  direction,
  icon,
}: {
  children: React.ReactNode
  direction: number
  icon: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-premium"
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C63FF]/20 to-[#4238D6]/20 text-iris mb-5">
        {icon}
      </div>
      {children}
    </motion.div>
  )
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 text-sm text-white/50">{subtitle}</p>
    </div>
  )
}

function SelectButton({
  active,
  onClick,
  label,
  emoji,
  large,
}: {
  active: boolean
  onClick: () => void
  label: string
  emoji?: string
  large?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border text-sm transition-all flex items-center justify-center gap-2",
        large ? "h-16" : "h-11",
        active
          ? "border-[#6C63FF] bg-iris/[0.1] text-white"
          : "border-white/[0.06] bg-white/[0.02] text-white/70 hover:bg-white/[0.04] hover:border-white/10",
      )}
    >
      {emoji && <span className="text-lg">{emoji}</span>}
      {label}
    </button>
  )
}

function CelebrationScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong border border-white/[0.08] rounded-2xl p-8 sm:p-10 shadow-premium text-center relative overflow-hidden"
    >
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-80 bg-iris/20 blur-3xl" />

      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
        className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#4238D6] mb-6 shadow-glow"
      >
        <CheckCircle2 className="h-8 w-8 text-white" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative text-3xl font-semibold tracking-tight"
      >
        Your NEXUS is ready.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative mt-2 text-white/50"
      >
        Everything is set up. Let's dive in.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative mt-8 grid grid-cols-3 gap-3"
      >
        {[
          { icon: Trophy, label: "Track achievements" },
          { icon: Flame, label: "Build streaks" },
          { icon: Compass, label: "Explore careers" },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"
          >
            <f.icon className="h-4 w-4 mx-auto mb-1 text-iris" />
            <div className="text-[10px] text-white/60">{f.label}</div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative mt-8"
      >
        <Button
          onClick={onEnter}
          className="w-full h-12 bg-gradient-to-br from-[#6C63FF] to-[#4238D6] hover:shadow-[0_0_40px_-4px_rgba(91,140,255,0.6)] border-0"
        >
          Enter NEXUS
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
