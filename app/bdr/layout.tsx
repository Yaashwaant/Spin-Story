"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

export default function BdrLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // Don't redirect if we're on the BDR login page
    if (pathname === "/bdr/login") {
      setIsAuthorized(true)
      return
    }

    if (!user) {
      router.push("/bdr/login")
      return
    }

    if (user.role !== "BDR" && user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    setIsAuthorized(true)
  }, [user, isLoading, router, pathname])

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
