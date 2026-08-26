"use client"

import * as React from "react"
import { useNexusAuth } from "@/components/providers/nexus-auth-provider"
import { useTheme } from "next-themes"
import { useData } from "@/lib/data-client"
import {
  NexusCard,
  NexusButton,
  NexusViewHeader,
  NexusBadge,
} from "@/components/nexus/primitives"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Palette,
  Bell,
  Target,
  Lock,
  LogOut,
  Trash2,
  Moon,
  Sun,
  Mail,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Section = "account" | "appearance" | "notifications" | "study" | "security"

export function SettingsView() {
  const [section, setSection] = React.useState<Section>("account")
  const { user, signOut } = useNexusAuth()
  const { theme, setTheme } = useTheme()

  const sections: { key: Section; label: string; icon: any }[] = [
    { key: "account", label: "Account", icon: User },
    { key: "appearance", label: "Appearance", icon: Palette },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "study", label: "Study preferences", icon: Target },
    { key: "security", label: "Security", icon: Lock },
  ]

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Settings"
        subtitle="Customize your NEXUS experience."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={cn(
                "w-full flex items-center gap-2.5 h-10 px-3 rounded-lg text-sm transition-colors",
                section === s.key
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {section === "account" && <AccountSection />}
          {section === "appearance" && (
            <AppearanceSection theme={theme} setTheme={setTheme} />
          )}
          {section === "notifications" && <NotificationsSection />}
          {section === "study" && <StudySection />}
          {section === "security" && <SecuritySection email={user?.email} />}
        </div>
      </div>
    </div>
  )
}

function AccountSection() {
  const { user, signOut } = useNexusAuth()
  return (
    <NexusCard className="p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
        Account
      </h3>
      <div className="space-y-4">
        <div>
          <Label className="text-xs">Email</Label>
          <Input value={user?.email || ""} disabled className="mt-1.5 bg-muted/30" />
          <p className="text-[10px] text-muted-foreground mt-1">
            Email cannot be changed in this version.
          </p>
        </div>
      </div>
    </NexusCard>
  )
}

function AppearanceSection({
  theme,
  setTheme,
}: {
  theme: string | undefined
  setTheme: (t: string) => void
}) {
  return (
    <div className="space-y-4">
      <NexusCard className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Theme
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              theme === "dark"
                ? "border-[#6C63FF] bg-[#6C63FF]/[0.05]"
                : "border-border bg-card hover:bg-accent",
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <Moon className="h-4 w-4 text-[#6C63FF]" />
              {theme === "dark" && <span className="text-[10px] text-[#6C63FF]">Active</span>}
            </div>
            <div className="text-sm font-semibold">Dark</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              NEXUS signature look
            </div>
            <div className="mt-3 h-8 rounded-lg bg-gradient-to-br from-[#050608] to-[#0E1117] border border-white/[0.08]" />
          </button>
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              theme === "light"
                ? "border-[#6C63FF] bg-[#6C63FF]/[0.05]"
                : "border-border bg-card hover:bg-accent",
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <Sun className="h-4 w-4 text-[#FFB020]" />
              {theme === "light" && <span className="text-[10px] text-[#6C63FF]">Active</span>}
            </div>
            <div className="text-sm font-semibold">Light</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Equally premium
            </div>
            <div className="mt-3 h-8 rounded-lg bg-gradient-to-br from-[#F7F8FC] to-[#FFFFFF] border border-black/[0.08]" />
          </button>
        </div>
      </NexusCard>
    </div>
  )
}

function NotificationsSection() {
  const [settings, setSettings] = React.useState({
    assignmentDue: true,
    examApproaching: true,
    goalDeadline: true,
    achievementUnlocked: true,
    studyTargetAchieved: true,
    weeklyDigest: false,
  })

  const items = [
    { key: "assignmentDue", label: "Assignment due soon", desc: "Get reminded before due dates" },
    { key: "examApproaching", label: "Exam approaching", desc: "Countdown warnings for exams" },
    { key: "goalDeadline", label: "Goal deadline", desc: "Alerts on approaching goal targets" },
    { key: "achievementUnlocked", label: "Achievement unlocked", desc: "Celebrate your milestones" },
    { key: "studyTargetAchieved", label: "Study target achieved", desc: "When you hit your daily goal" },
    { key: "weeklyDigest", label: "Weekly digest", desc: "Summary of your week every Sunday" },
  ]

  return (
    <NexusCard className="p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
        Notifications
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-[10px] text-muted-foreground">{item.desc}</div>
            </div>
            <Switch
              checked={settings[item.key as keyof typeof settings]}
              onCheckedChange={(v) => setSettings({ ...settings, [item.key]: v })}
            />
          </div>
        ))}
      </div>
    </NexusCard>
  )
}

function StudySection() {
  return (
    <NexusCard className="p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
        Study preferences
      </h3>
      <p className="text-xs text-muted-foreground">
        Study preferences are part of your profile. Edit them in{" "}
        <a href="#" onClick={() => useApp.getState().navigate("profile")} className="text-[#6C63FF] hover:underline">
          Profile
        </a>
        .
      </p>
    </NexusCard>
  )
}

function SecuritySection({ email }: { email?: string | null }) {
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")

  async function deleteAccount() {
    // In production, this would call an API endpoint
    // For demo: sign out and explain
    await signOut()
    toast.success("Account deletion requested. (Demo mode — your data persists in the database.)")
  }

  return (
    <div className="space-y-4">
      <NexusCard className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Password & security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">Change password</div>
              <div className="text-[10px] text-muted-foreground">
                Update your account password
              </div>
            </div>
            <NexusButton variant="outline" size="sm" onClick={() => toast.info("Password change requires email verification flow — coming soon.")}>
              Change
            </NexusButton>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <div className="text-sm font-medium">Sign out</div>
              <div className="text-[10px] text-muted-foreground">
                Sign out of NEXUS on this device
              </div>
            </div>
            <NexusButton
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </NexusButton>
          </div>
        </div>
      </NexusCard>

      <NexusCard className="p-6 border-[#E5484D]/20">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#E5484D] mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Danger zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Delete account</div>
            <div className="text-[10px] text-muted-foreground">
              Permanently delete your account and all data. This cannot be undone.
            </div>
          </div>
          <NexusButton
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="text-[#E5484D] border-[#E5484D]/30 hover:bg-[#E5484D]/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </NexusButton>
        </div>
      </NexusCard>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="bg-popover border-border">
          <DialogHeader>
            <DialogTitle>Delete account permanently?</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="flex items-start gap-2 rounded-lg bg-[#E5484D]/10 border border-[#E5484D]/20 p-3 text-xs text-[#E5484D]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                This will permanently delete your account and all associated data including
                subjects, assignments, notes, goals, habits, and AI conversations.{" "}
                <strong>This action cannot be undone.</strong>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                Type <span className="font-mono font-semibold">DELETE</span> to confirm
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setConfirmDelete(false); setConfirmText("") }}>
              Cancel
            </Button>
            <NexusButton
              disabled={confirmText !== "DELETE"}
              onClick={deleteAccount}
              className="bg-[#E5484D] hover:bg-[#E5484D]/80"
            >
              Delete account forever
            </NexusButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Used by StudySection
import { useApp } from "@/lib/store"
