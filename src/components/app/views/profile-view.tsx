"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useApp } from "@/lib/store"
import { useData, updateResource } from "@/lib/data-client"
import {
  NexusCard,
  NexusButton,
  NexusViewHeader,
  NexusBadge,
} from "@/components/nexus/primitives"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Mail, GraduationCap, School, Target, Clock, Save, Camera, Edit2 } from "lucide-react"
import { toast } from "sonner"

export function ProfileView() {
  const { data: session } = useSession()
  const navigate = useApp((s) => s.navigate)
  const { snapshot, mutate, refresh } = useData()
  const profile = snapshot?.profile

  const [fullName, setFullName] = React.useState(profile?.fullName || "")
  const [grade, setGrade] = React.useState(profile?.grade || "")
  const [educationLevel, setEducationLevel] = React.useState(profile?.educationLevel || "high_school")
  const [stream, setStream] = React.useState(profile?.stream || "")
  const [schoolName, setSchoolName] = React.useState(profile?.schoolName || "")
  const [studyTargetMinutes, setStudyTargetMinutes] = React.useState(profile?.studyTargetMinutes || 60)
  const [academicGoal, setAcademicGoal] = React.useState(profile?.academicGoal || "")
  const [avatarUrl, setAvatarUrl] = React.useState(profile?.avatarUrl || "")

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "")
      setGrade(profile.grade || "")
      setEducationLevel(profile.educationLevel || "high_school")
      setStream(profile.stream || "")
      setSchoolName(profile.schoolName || "")
      setStudyTargetMinutes(profile.studyTargetMinutes || 60)
      setAcademicGoal(profile.academicGoal || "")
      setAvatarUrl(profile.avatarUrl || "")
    }
  }, [profile])

  async function save() {
    try {
      await mutate(() =>
        updateResource("profile", profile!.id, {
          fullName,
          grade,
          educationLevel,
          stream,
          schoolName,
          studyTargetMinutes,
          academicGoal,
          avatarUrl,
        }),
      )
      toast.success("Profile saved")
    } catch {
      toast.error("Failed to save profile")
    }
  }

  function onAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Read as data URL for demo (in production this would upload to Supabase Storage)
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarUrl(reader.result as string)
      toast.info("Avatar will be saved with your profile (demo mode).")
    }
    reader.readAsDataURL(file)
  }

  const initials = (fullName || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Profile"
        subtitle="Your NEXUS identity and academic context."
        action={
          <NexusButton onClick={save}>
            <Save className="h-4 w-4 mr-1.5" />
            Save changes
          </NexusButton>
        }
      />

      {/* Profile card */}
      <NexusCard className="p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-48 w-48 bg-[#5B8CFF]/15 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <label
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-card border-2 border-background flex items-center justify-center cursor-pointer hover:bg-accent"
              title="Upload avatar"
            >
              <Camera className="h-3.5 w-3.5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarUpload}
              />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{fullName || "Student"}</h2>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {grade && <NexusBadge color="blue">{grade}</NexusBadge>}
              {stream && <NexusBadge color="violet">{stream}</NexusBadge>}
              {educationLevel && (
                <NexusBadge color="cyan">{educationLevel.replace("_", " ")}</NexusBadge>
              )}
            </div>
          </div>
        </div>
      </NexusCard>

      {/* Editable fields */}
      <NexusCard className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Personal information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input value={session?.user?.email || ""} disabled className="bg-muted/30" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Education level</Label>
            <Select value={educationLevel} onValueChange={setEducationLevel}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="competitive">Competitive Exam</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Grade / Year</Label>
            <Input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. 12th, 2nd year"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Stream</Label>
            <Input
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              placeholder="e.g. Science"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">School / College</Label>
            <Input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="School name"
            />
          </div>
        </div>
      </NexusCard>

      <NexusCard className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Academic preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Academic goal</Label>
            <Select value={academicGoal} onValueChange={setAcademicGoal}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="improve_grades">Improve grades</SelectItem>
                <SelectItem value="entrance_exam">Prepare for entrance exam</SelectItem>
                <SelectItem value="build_consistency">Build study consistency</SelectItem>
                <SelectItem value="master_subjects">Master difficult subjects</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Daily study target (minutes)</Label>
            <Select
              value={String(studyTargetMinutes)}
              onValueChange={(v) => setStudyTargetMinutes(parseInt(v))}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </NexusCard>

      <div className="flex justify-end">
        <NexusButton onClick={save}>
          <Save className="h-4 w-4 mr-1.5" />
          Save changes
        </NexusButton>
      </div>
    </div>
  )
}
