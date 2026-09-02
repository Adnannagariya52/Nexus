"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Lenis from "lenis"
import { AnimatePresence } from "framer-motion"

import Preloader from "@/components/landing/Preloader"
import CustomCursor from "@/components/landing/CustomCursor"
import Navigation from "@/components/landing/Navigation"
import AmbientBackground from "@/components/landing/AmbientBackground"

import Hero from "@/components/landing/sections/Hero"
import SystemReveal from "@/components/landing/sections/SystemReveal"
import ChaosClarity from "@/components/landing/sections/ChaosClarity"
import AISection from "@/components/landing/sections/AISection"
import SpatialJourney from "@/components/landing/sections/SpatialJourney"
import FocusFlow from "@/components/landing/sections/FocusFlow"
import Explorer from "@/components/landing/sections/Explorer"
import Finale from "@/components/landing/sections/Finale"

import { usePrefersReducedMotion } from "@/lib/landing-hooks"

export function LandingPage() {
  const reduced = usePrefersReducedMotion()
  const [loading, setLoading] = useState(true)
  const lenisRef = useRef<Lenis | null>(null)

  /* cinematic inertia scroll */
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      smoothWheel: true,
    })
    lenisRef.current = lenis
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  /* hold the world still during the entry ritual */
  useEffect(() => {
    const lenis = lenisRef.current
    if (lenis) {
      if (loading) lenis.stop()
      else lenis.start()
    }
    document.body.style.overflow = loading ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [loading])

  const onNav = useCallback((hash: string) => {
    const el = document.querySelector(hash)
    if (!el) return
    const lenis = lenisRef.current
    if (lenis) {
      lenis.scrollTo(el as HTMLElement, {
        duration: 1.7,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      })
    } else {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <AmbientBackground />
      <CustomCursor />

      <AnimatePresence>
        {loading && (
          <Preloader key="preloader" reduced={reduced} onDone={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <Navigation ready={!loading} onNav={onNav} />

      <main>
        <Hero ready={!loading} onNav={onNav} />
        <SystemReveal />
        <ChaosClarity />
        <AISection />
        <SpatialJourney />
        <FocusFlow />
        <Explorer />
        <Finale onNav={onNav} />
      </main>
    </div>
  )
}
