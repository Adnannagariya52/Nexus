"use client"

export function FullScreenProgress() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6C63FF] animate-spin" />
        </div>
        <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          Loading NEXUS
        </div>
      </div>
    </div>
  )
}
