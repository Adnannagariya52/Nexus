import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { NexusSessionProvider } from "@/components/providers/session-provider"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "NEXUS — Your entire student life. One intelligent system.",
  description:
    "NEXUS is a unified digital operating system for students. Plan your studies, master your subjects, track your progress, and solve doubts — all from one beautifully designed workspace.",
  keywords: [
    "NEXUS",
    "student productivity",
    "study planner",
    "AI tutor",
    "academic workspace",
    "focus timer",
  ],
  authors: [{ name: "NEXUS" }],
  icons: {
    icon: "/nexus-mark.svg",
  },
  openGraph: {
    title: "NEXUS",
    description: "Your entire student life. One intelligent system.",
    siteName: "NEXUS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXUS",
    description: "Your entire student life. One intelligent system.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrains.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <NexusSessionProvider>
            {children}
            <Toaster />
            <SonnerToaster />
          </NexusSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
