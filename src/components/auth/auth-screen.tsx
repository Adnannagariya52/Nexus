"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getSupabase } from "@/lib/supabase-client"
import { useApp } from "@/lib/store"
import { NexusLogo } from "@/components/nexus/nexus-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

type Mode = "login" | "signup" | "forgot" | "reset"

export function AuthScreen({ mode }: { mode: Mode }) {
  const setView = useApp((s) => s.setView)

  return (
    <div className="min-h-screen bg-[#050608] text-white grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#6C63FF]/20 blur-[120px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#4238D6]/15 blur-[120px]"
          />
        </div>

        <div className="relative">
          <button onClick={() => setView("landing")} className="inline-flex items-center gap-2.5">
            <NexusLogo size={32} withWordmark wordmarkClassName="text-white" />
          </button>
        </div>

        <div className="relative max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl xl:text-5xl font-semibold tracking-tight leading-tight"
          >
            Your academic life,
            <br />
            <span className="gradient-text">finally organized.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-white/50"
          >
            NEXUS unifies your subjects, assignments, exams, notes, focus sessions, and AI tutor
            into a single intelligent workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-[#6C63FF]/20 to-transparent blur-3xl" />
            <div className="relative glass-strong border border-white/[0.08] rounded-2xl p-4 shadow-premium">
              <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-[#B8FF6A] animate-pulse" />
                Today's Mission
              </div>
              <div className="text-sm font-medium">Mathematics — Integration by Parts</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="h-full bg-gradient-to-r from-[#6C63FF] to-[#4238D6]"
                  />
                </div>
                <span className="text-[10px] text-white/40">60%</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative text-xs text-white/30">
          © {new Date().getFullYear()} NEXUS. Built for serious students.
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <button
            onClick={() => setView("landing")}
            className="lg:hidden mb-8 inline-flex items-center gap-2 text-xs text-white/50 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </button>

          <AnimatePresence mode="wait">
            {mode === "login" && <LoginCard key="login" />}
            {mode === "signup" && <SignupCard key="signup" />}
            {mode === "forgot" && <ForgotCard key="forgot" />}
            {mode === "reset" && <ResetCard key="reset" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function GoogleButton({ label }: { label: string }) {
  const [loading, setLoading] = React.useState(false)
  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        const supabase = getSupabase()
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/?view=app` },
        })
        if (error) {
          toast.error("Google sign-in isn't configured yet. Use email/password for now.")
          setLoading(false)
        }
      }}
      className="w-full h-11 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:text-white text-white"
    >
      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </Button>
  )
}

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/[0.06]" />
      </div>
      <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
        <span className="bg-[#050608] px-3 text-white/40">or</span>
      </div>
    </div>
  )
}

function LoginCard() {
  const setView = useApp((s) => s.setView)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [show, setShow] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })
      if (error) {
        setError("Email or password is incorrect.")
        setLoading(false)
        return
      }
      // Auth state change will trigger navigation via page.tsx
      setView("app")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="lg:hidden mb-6">
        <NexusLogo size={28} withWordmark wordmarkClassName="text-white" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
      <p className="mt-1.5 text-sm text-white/50">Continue to your NEXUS workspace.</p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <GoogleButton label="Continue with Google" />
        <Divider />

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs text-white/70">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              id="email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-11 pl-9 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
              placeholder="you@school.edu"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs text-white/70">Password</Label>
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="text-xs text-[#6C63FF] hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              id="password" type={show ? "text" : "password"} autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-11 pl-9 pr-9 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-[#E5484D]"
          >
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </motion.div>
        )}

        <Button
          type="submit" disabled={loading}
          className="w-full h-11 bg-gradient-to-br from-[#6C63FF] to-[#4238D6] hover:shadow-[0_0_30px_-4px_rgba(91,140,255,0.5)] border-0"
        >
          {loading ? "Signing in..." : "Log in"}
          {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-white/50">
        Don't have an account?{" "}
        <button onClick={() => setView("signup")} className="text-[#6C63FF] hover:underline font-medium">
          Create account
        </button>
      </div>
    </motion.div>
  )
}

function strengthOf(p: string) {
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return Math.min(score, 4)
}

function SignupCard() {
  const setView = useApp((s) => s.setView)
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [show, setShow] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const strength = strengthOf(password)
  const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["#E5484D", "#E5484D", "#FFB020", "#6C63FF", "#B8FF6A"]

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        setError(error.message || "We couldn't create your account right now.")
        setLoading(false)
        return
      }
      if (data.session) {
        window.location.href = "/"
      } else if (data.user) {
        setView("login")
        setError("Account created. Please check your email to confirm.")
        setLoading(false)
      } else {
        setError("Account created. Please check your email to confirm.")
        setView("login")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="lg:hidden mb-6">
        <NexusLogo size={28} withWordmark wordmarkClassName="text-white" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
      <p className="mt-1.5 text-sm text-white/50">Start your NEXUS journey in seconds.</p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <GoogleButton label="Sign up with Google" />
        <Divider />

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs text-white/70">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="h-11 pl-9 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
              placeholder="Aarav Sharma"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="su-email" className="text-xs text-white/70">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-11 pl-9 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
              placeholder="you@school.edu"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="su-password" className="text-xs text-white/70">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              id="su-password" type={show ? "text" : "password"} required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-11 pl-9 pr-9 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all"
                    style={{ backgroundColor: i < strength ? strengthColors[strength] : "rgba(255,255,255,0.08)" }}
                  />
                ))}
              </div>
              <span className="text-[10px]" style={{ color: strengthColors[strength] }}>
                {strengthLabels[strength]}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-xs text-white/70">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              id="confirm" type={show ? "text" : "password"} required
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="h-11 pl-9 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
              placeholder="Re-enter your password"
            />
            {confirm.length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {confirm === password ? (
                  <CheckCircle2 className="h-4 w-4 text-[#B8FF6A]" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-[#E5484D]" />
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-[#E5484D]"
          >
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </motion.div>
        )}

        <Button
          type="submit" disabled={loading}
          className="w-full h-11 bg-gradient-to-br from-[#6C63FF] to-[#4238D6] hover:shadow-[0_0_30px_-4px_rgba(91,140,255,0.5)] border-0"
        >
          {loading ? "Creating account..." : "Create account"}
          {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-white/50">
        Already have an account?{" "}
        <button onClick={() => setView("login")} className="text-[#6C63FF] hover:underline font-medium">
          Log in
        </button>
      </div>
    </motion.div>
  )
}

function ForgotCard() {
  const setView = useApp((s) => s.setView)
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/?view=reset`,
      })
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      setSent(true)
      setLoading(false)
    } catch {
      toast.error("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex h-14 w-14 rounded-full bg-[#B8FF6A]/10 items-center justify-center mb-5">
          <CheckCircle2 className="h-7 w-7 text-[#B8FF6A]" />
        </div>
        <h2 className="text-2xl font-semibold">Check your inbox</h2>
        <p className="mt-2 text-sm text-white/50">
          If an account exists for <span className="text-white">{email}</span>, you'll receive a
          password reset link shortly.
        </p>
        <Button
          onClick={() => setView("login")}
          className="mt-6 w-full h-11 bg-gradient-to-br from-[#6C63FF] to-[#4238D6] border-0"
        >
          Back to login
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
      <button
        onClick={() => setView("login")}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to login
      </button>
      <h2 className="text-2xl font-semibold tracking-tight">Forgot password?</h2>
      <p className="mt-1.5 text-sm text-white/50">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fp-email" className="text-xs text-white/70">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              id="fp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-11 pl-9 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20"
              placeholder="you@school.edu"
            />
          </div>
        </div>
        <Button
          type="submit" disabled={loading}
          className="w-full h-11 bg-gradient-to-br from-[#6C63FF] to-[#4238D6] border-0"
        >
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </motion.div>
  )
}

function ResetCard() {
  const setView = useApp((s) => s.setView)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button
        onClick={() => setView("login")}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to login
      </button>
      <h2 className="text-2xl font-semibold tracking-tight">Reset your password</h2>
      <p className="mt-1.5 text-sm text-white/50">Enter your new password below.</p>
      <form onSubmit={(e) => { e.preventDefault(); setView("login") }} className="mt-7 space-y-4">
        <Input type="password" required className="h-11 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20" placeholder="New password" />
        <Input type="password" required className="h-11 bg-white/[0.03] border-white/[0.08] focus-visible:border-[#6C63FF]/50 focus-visible:ring-[#6C63FF]/20" placeholder="Confirm new password" />
        <Button type="submit" className="w-full h-11 bg-gradient-to-br from-[#6C63FF] to-[#4238D6] border-0">
          Reset password
        </Button>
      </form>
    </motion.div>
  )
}
