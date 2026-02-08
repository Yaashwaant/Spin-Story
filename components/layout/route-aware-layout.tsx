"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"

interface RouteAwareLayoutProps {
  children: ReactNode
  className?: string
}

export function RouteAwareLayout({ children, className = "" }: RouteAwareLayoutProps) {
  const pathname = usePathname()
  
  // Apply landing-page class only for the root path
  const isLandingPage = pathname === "/"
  
  return (
    <div className={`${className} ${isLandingPage ? "landing-page" : ""}`}>
      {children}
    </div>
  )
}