"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useData, updateResource } from "@/lib/data-client"
import {
  NexusCard,
  NexusBadge,
  NexusButton,
  NexusEmptyState,
  NexusViewHeader,
} from "@/components/nexus/primitives"
import {
  Input } from "@/components/ui/input"
import { X, Plus, Compass, Briefcase, GraduationCap, Atom, Cpu, Palette, Heart, Brain, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CAREER_SUGGESTIONS = [
  {
    title: "Software Engineer",
    field: "Technology",
    description: "Design, build, and maintain software systems that power modern life.",
    skills: ["Programming", "Problem solving", "Algorithms", "Communication"],
    path: ["CS fundamentals", "Data structures", "Web/mobile dev", "System design"],
    icon: Cpu,
    color: "#6C63FF",
    matchTags: ["computer_science", "problem_solving", "logic"],
  },
  {
    title: "Data Scientist",
    field: "Analytics",
    description: "Turn data into insights using statistics, ML, and visualization.",
    skills: ["Statistics", "Python/R", "ML", "Communication"],
    path: ["Math foundations", "Statistics", "ML algorithms", "Domain knowledge"],
    icon: BarChart3,
    color: "#4238D6",
    matchTags: ["mathematics", "statistics", "data"],
  },
  {
    title: "Doctor / Physician",
    field: "Medicine",
    description: "Diagnose, treat, and care for patients across many specialties.",
    skills: ["Biology", "Empathy", "Communication", "Critical thinking"],
    path: ["Biology", "Chemistry", "Medical school", "Residency"],
    icon: Heart,
    color: "#E5484D",
    matchTags: ["biology", "chemistry", "helping_others"],
  },
  {
    title: "Research Scientist",
    field: "Science",
    description: "Push the boundaries of human knowledge through systematic inquiry.",
    skills: ["Domain expertise", "Research methods", "Writing", "Critical thinking"],
    path: ["Undergrad in field", "Research experience", "Graduate studies", "Publishing"],
    icon: Atom,
    color: "#6C63FF",
    matchTags: ["physics", "chemistry", "biology", "curiosity"],
  },
  {
    title: "Product Designer",
    field: "Design",
    description: "Shape how products look, feel, and work for the people who use them.",
    skills: ["Visual design", "Empathy", "Prototyping", "Research"],
    path: ["Design fundamentals", "UI/UX", "Prototyping", "Portfolio"],
    icon: Palette,
    color: "#EC4899",
    matchTags: ["arts", "creativity", "design"],
  },
  {
    title: "Civil Engineer",
    field: "Engineering",
    description: "Design and build the infrastructure that society depends on.",
    skills: ["Physics", "Math", "Project management", "Communication"],
    path: ["Math + physics", "Engineering degree", "Internships", "Licensure"],
    icon: GraduationCap,
    color: "#B8FF6A",
    matchTags: ["physics", "mathematics", "construction"],
  },
]

export function CareerView() {
  const { snapshot, mutate } = useData()
  const profile = snapshot?.careerProfile
  const [interests, setInterests] = React.useState<string[]>(profile ? JSON.parse(profile.interests) : [])
  const [skills, setSkills] = React.useState<string[]>(profile ? JSON.parse(profile.skills) : [])
  const [strengths, setStrengths] = React.useState<string[]>(profile ? JSON.parse(profile.strengths) : [])
  const [preferredFields, setPreferredFields] = React.useState<string[]>(profile ? JSON.parse(profile.preferredFields) : [])
  const [newInterest, setNewInterest] = React.useState("")
  const [newSkill, setNewSkill] = React.useState("")
  const [newStrength, setNewStrength] = React.useState("")
  const [newField, setNewField] = React.useState("")
  const [saved, setSaved] = React.useState(!!profile)

  function add(list: string[], item: string, setList: (v: string[]) => void, reset: () => void) {
    const v = item.trim()
    if (!v || list.includes(v)) return
    setList([...list, v])
    reset()
  }

  async function save() {
    try {
      await mutate(() =>
        updateResource("careerProfile", profile?.id || "", {
          interests: JSON.stringify(interests),
          skills: JSON.stringify(skills),
          strengths: JSON.stringify(strengths),
          preferredFields: JSON.stringify(preferredFields),
        }),
      )
      toast.success("Career profile saved")
      setSaved(true)
    } catch {
      // Try create
      try {
        const r = await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "careerProfile",
            action: "create",
            data: {
              interests: JSON.stringify(interests),
              skills: JSON.stringify(skills),
              strengths: JSON.stringify(strengths),
              preferredFields: JSON.stringify(preferredFields),
            },
          }),
        })
        if (r.ok) {
          toast.success("Career profile saved")
          setSaved(true)
        } else {
          throw new Error("Failed")
        }
      } catch {
        toast.error("Failed to save career profile")
      }
    }
  }

  // Calculate match scores
  const matches = CAREER_SUGGESTIONS.map((c) => {
    const allTags = [...interests, ...skills, ...strengths].map((t) => t.toLowerCase().replace(/\s+/g, "_"))
    let score = 0
    c.matchTags.forEach((t) => {
      if (allTags.some((u) => u.includes(t) || t.includes(u))) score += 1
    })
    if (preferredFields.some((f) => f.toLowerCase().includes(c.field.toLowerCase()))) score += 2
    return { ...c, score }
  }).sort((a, b) => b.score - a.score)

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Career Exploration"
        subtitle="Map your interests into possible paths. This is exploration, not a verdict."
      />

      <NexusCard className="p-5">
        <div className="flex items-start gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Your profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tell NEXUS about yourself to see potential career paths. Note: this is
              exploratory, not authoritative.
            </p>
          </div>
        </div>
      </NexusCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TagInputCard
          title="Interests"
          subtitle="What excites you?"
          items={interests}
          onAdd={(v) => add(interests, v, setInterests, () => setNewInterest(""))}
          onRemove={(v) => setInterests(interests.filter((i) => i !== v))}
          newValue={newInterest}
          onNewValueChange={setNewInterest}
          color="#6C63FF"
        />
        <TagInputCard
          title="Skills"
          subtitle="What are you good at?"
          items={skills}
          onAdd={(v) => add(skills, v, setSkills, () => setNewSkill(""))}
          onRemove={(v) => setSkills(skills.filter((i) => i !== v))}
          newValue={newSkill}
          onNewValueChange={setNewSkill}
          color="#4238D6"
        />
        <TagInputCard
          title="Strengths"
          subtitle="What comes naturally to you?"
          items={strengths}
          onAdd={(v) => add(strengths, v, setStrengths, () => setNewStrength(""))}
          onRemove={(v) => setStrengths(strengths.filter((i) => i !== v))}
          newValue={newStrength}
          onNewValueChange={setNewStrength}
          color="#B8FF6A"
        />
        <TagInputCard
          title="Preferred fields"
          subtitle="Where do you want to work?"
          items={preferredFields}
          onAdd={(v) => add(preferredFields, v, setPreferredFields, () => setNewField(""))}
          onRemove={(v) => setPreferredFields(preferredFields.filter((i) => i !== v))}
          newValue={newField}
          onNewValueChange={setNewField}
          color="#FFB020"
        />
      </div>

      <div className="flex justify-end">
        <NexusButton onClick={save}>Save profile</NexusButton>
      </div>

      {/* Career suggestions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Career paths to explore</h2>
          <NexusBadge color="muted">Exploratory, not authoritative</NexusBadge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {matches.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <NexusCard className="p-5 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${c.color}15`, color: c.color }}
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                  {c.score > 0 && (
                    <NexusBadge color={c.score >= 3 ? "green" : c.score >= 1 ? "blue" : "muted"}>
                      {c.score >= 3 ? "Strong match" : c.score >= 1 ? "Possible match" : "Explore"}
                    </NexusBadge>
                  )}
                </div>
                <h3 className="text-sm font-semibold">{c.title}</h3>
                <div className="text-[10px] text-muted-foreground">{c.field}</div>
                <p className="text-xs text-muted-foreground mt-2 flex-1">{c.description}</p>

                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                    Required skills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {c.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                    Study path
                  </div>
                  <ol className="text-[10px] text-muted-foreground space-y-1">
                    {c.path.map((p, idx) => (
                      <li key={p} className="flex items-start gap-1.5">
                        <span className="font-mono">{idx + 1}.</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </NexusCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TagInputCard({
  title,
  subtitle,
  items,
  onAdd,
  onRemove,
  newValue,
  onNewValueChange,
  color,
}: {
  title: string
  subtitle: string
  items: string[]
  onAdd: (v: string) => void
  onRemove: (v: string) => void
  newValue: string
  onNewValueChange: (v: string) => void
  color: string
}) {
  return (
    <NexusCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {items.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">Nothing added yet.</span>
        ) : (
          items.map((i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {i}
              <button onClick={() => onRemove(i)} className="opacity-60 hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
      </div>
      <div className="flex gap-1.5">
        <Input
          value={newValue}
          onChange={(e) => onNewValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onAdd(newValue)
            }
          }}
          placeholder={`Add ${title.toLowerCase()}`}
          className="h-9 bg-background text-xs"
        />
        <NexusButton
          size="icon"
          onClick={() => onAdd(newValue)}
          className="h-9 w-9"
        >
          <Plus className="h-3.5 w-3.5" />
        </NexusButton>
      </div>
    </NexusCard>
  )
}
