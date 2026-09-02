import type { Metadata } from "next"
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { NexusAuthProvider } from "@/components/providers/nexus-auth-provider"

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "NEXUS — The Student Operating System",
  description:
    "Everything you study, everything you plan, everything you're becoming — connected in one intelligent system.",
  keywords: ["NEXUS", "student OS", "study planner", "AI tutor", "focus timer"],
  authors: [{ name: "NEXUS" }],
  icons: { icon: "/nexus-mark.svg" },
  openGraph: {
    title: "NEXUS",
    description: "The Student Operating System.",
    siteName: "NEXUS",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${bricolage.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <NexusAuthProvider>
            {children}
            <Toaster />
            <SonnerToaster />
          </NexusAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
