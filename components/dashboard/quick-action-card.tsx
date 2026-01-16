"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface QuickActionCardProps {
  icon: LucideIcon
  title: string
  description?: string
  gradient: string
  iconBgClass?: string
  onClick?: () => void
}

export function QuickActionCard({ icon: Icon, title, gradient, onClick }: QuickActionCardProps) {
  return (
    null
  )
}
