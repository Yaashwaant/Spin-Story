import type React from "react"
import type { Metadata } from "next"

import "./globals.css"
import { Playfair_Display } from "next/font/google"
import { AuthProvider } from "@/components/auth/auth-provider"
import { RouteAwareLayout } from "@/components/layout/route-aware-layout"

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"]
})

export const metadata: Metadata = {
  title: "The Spin Story - Your AI Wardrobe Assistant",
  description: "AI-powered wardrobe management and outfit recommendations",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/Gemini_Generated_Image_9dytj19dytj19dyt.png",
        type: "image/png",
      },
    ],
    apple: "/Gemini_Generated_Image_9dytj19dytj19dyt.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfairDisplay.className} bg-slate-50 text-slate-950 antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <RouteAwareLayout className="min-h-screen">
            {children}
          </RouteAwareLayout>
        </AuthProvider>
      </body>
    </html>
  )
}