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
  const [lastFetch, setLastFetch] = useState<number>(0)

  const refreshWardrobeItems = useCallback(() => {
    if (!user) return
    
    // Check if we have recent cached data (within 5 minutes)
    const now = Date.now()
    const cacheExpiry = 5 * 60 * 1000 // 5 minutes
    if (now - lastFetch < cacheExpiry && wardrobeItems.length > 0) {
      console.log('Using cached wardrobe data')
      return
    }
    
    setLoading(true)
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.recentItems) {
          setWardrobeItems(data.data.recentItems)
          setLastFetch(now)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, wardrobeItems.length, lastFetch])

  // Optimized refresh that doesn't show loading state
  const silentRefresh = useCallback(() => {
    if (!user) return
    
    // Check cache for silent refresh (within 2 minutes)
    const now = Date.now()
    const cacheExpiry = 2 * 60 * 1000 // 2 minutes
    if (now - lastFetch < cacheExpiry && wardrobeItems.length > 0) {
      return
    }
    
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.recentItems) {
          setWardrobeItems(data.data.recentItems)
          setLastFetch(now)
        }
      })
      .catch(() => {})
  }, [user, wardrobeItems.length, lastFetch])

  useEffect(() => {
    refreshWardrobeItems()
  }, [user, refreshTrigger])

  // Auto-refresh every 60 seconds (reduced frequency for better performance)
  useEffect(() => {
    const interval = setInterval(() => {
      silentRefresh()
    }, 60000)
    return () => clearInterval(interval)
  }, [silentRefresh])

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
                  <div className="space-y-4">
                    {/* Clean visual outfit display - 3x2 grid */}
                    {suggestion.itemImages && suggestion.itemImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {suggestion.itemImages.map((imageUrl, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border/30 hover:border-border/60 transition-all duration-200 hover:shadow-sm group">
                            <img 
                              src={imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                            <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-sm">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed px-4 py-12 text-center bg-gradient-to-br from-muted/30 to-muted/10">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl border border-border/20 bg-gradient-to-br from-muted/20 to-muted/5 flex items-center justify-center">
                          <svg className="w-4 h-4 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground/80">Create your perfect outfit</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <FindOutfitPanel onGenerateOutfit={setSuggestion} wardrobeItems={wardrobeItems} />
          </div>
        </div>
      </main>
    </div>
  )
}
