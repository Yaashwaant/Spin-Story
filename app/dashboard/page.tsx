"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/layout/navbar"
import { FindOutfitPanel, type OutfitSuggestion } from "@/components/dashboard/find-outfit-panel"
import { WardrobePreview } from "@/components/dashboard/wardrobe-preview"
import { RecentOutfits } from "@/components/dashboard/recent-outfits"
import { SavedOutfits } from "@/components/dashboard/saved-outfits"
import { useAuth } from "@/components/auth/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClothingItem {
  id: string
  name: string
  imageUrl: string
  category: string
  createdAt: Date
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null)
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const customerId = user?.id || "demo-customer"

  const refreshWardrobeItems = useCallback(() => {
    if (!user) return
    setLoading(true)
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.recentItems) setWardrobeItems(data.data.recentItems)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  useEffect(() => {
    refreshWardrobeItems()
  }, [user, refreshTrigger])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-2 pb-4">
        <div className="mb-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-primary">{user?.fullName || 'User'}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <WardrobePreview items={wardrobeItems} onRefresh={refreshWardrobeItems} />
          </div>

          <div className="lg:col-span-4">
            <Card className="min-h-[420px] rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Outfit Suggestion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestion ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.summary}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestion.items.map((item) => (
                        <Badge key={item} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    Generate an outfit to see the suggestion here.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <FindOutfitPanel onGenerateOutfit={setSuggestion} />
          </div>
        </div>
      </main>
    </div>
  )
}
