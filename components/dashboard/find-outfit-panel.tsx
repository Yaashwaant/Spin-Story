"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Sun, Leaf, Snowflake, Flower } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

interface ClothingItem {
  id: string
  name: string
  imageUrl: string
  category: string
  createdAt: Date
}

const moods = ["Relaxed", "Playful", "Elegant", "Confident"]
const seasons = [
  { name: "Summer", icon: Sun, activeClasses: "bg-amber-400/20 text-amber-200" },
  { name: "Autumn", icon: Leaf, activeClasses: "bg-orange-500/20 text-orange-200" },
  { name: "Winter", icon: Snowflake, activeClasses: "bg-blue-400/20 text-blue-200" },
  { name: "Spring", icon: Flower, activeClasses: "bg-green-400/20 text-green-200" },
]

const seasonItems: Record<string, string[]> = {
  Summer: ["Linen shirt", "Chino shorts", "Canvas sneakers"],
  Autumn: ["Chunky knit sweater", "Dark denim", "Chelsea boots"],
  Winter: ["Wool coat", "Thermal knit", "Leather boots"],
  Spring: ["Light trench", "Pastel top", "White sneakers"],
}

const moodAccents: Record<string, string> = {
  Relaxed: "Soft scarf",
  Playful: "Statement accessory",
  Elegant: "Polished watch",
  Confident: "Structured bag",
}

export interface OutfitSuggestion {
  title?: string
  summary?: string
  items: string[]
  itemImages?: string[]
  matchedItems?: ClothingItem[]
  aiReasoning?: string
}

interface FindOutfitPanelProps {
  onGenerateOutfit?: (suggestion: OutfitSuggestion) => void
  wardrobeItems?: ClothingItem[]
}

export function FindOutfitPanel({ onGenerateOutfit, wardrobeItems: externalWardrobeItems }: FindOutfitPanelProps) {
  const { user } = useAuth()
  const [selectedMoods, setSelectedMoods] = useState<string[]>(["Playful"])
  const [selectedSeason, setSelectedSeason] = useState("Autumn")
  const [occasion, setOccasion] = useState("")
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(false)
  const customerId = user?.id || "demo-customer"
  const [isUsingExternalItems, setIsUsingExternalItems] = useState(false)

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]))
  }

  // Fetch user's wardrobe items
  const fetchWardrobeItems = useCallback(async () => {
    if (!customerId || customerId === "demo-customer") return
    
    try {
      const response = await fetch(`/api/wardrobe?customerId=${customerId}`)
      const data = await response.json()
      if (data.items) {
        setWardrobeItems(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch wardrobe items:', error)
    }
  }, [customerId])

  // Use external wardrobe items if provided, otherwise fetch them
  useEffect(() => {
    if (externalWardrobeItems && externalWardrobeItems.length > 0) {
      setWardrobeItems(externalWardrobeItems)
      setIsUsingExternalItems(true)
    } else {
      fetchWardrobeItems()
      setIsUsingExternalItems(false)
    }
  }, [externalWardrobeItems, fetchWardrobeItems])

  // Intelligent outfit matching algorithm (simplified for dashboard items)
  const matchOutfitFromWardrobe = useCallback((mood: string, season: string, occasion: string): ClothingItem[] => {
    if (wardrobeItems.length === 0) return []

    // Define outfit composition rules based on category
    const outfitRules = {
      tops: ['shirt', 't-shirt', 'blouse', 'sweater', 'jacket', 'top'],
      bottoms: ['pants', 'jeans', 'trousers', 'shorts', 'skirt', 'bottom'],
      shoes: ['sneakers', 'shoes', 'boots', 'sandals', 'footwear'],
      accessories: ['watch', 'bag', 'scarf', 'hat', 'belt', 'accessory']
    }

    // Simple filtering based on name and category (since we don't have full wardrobe data in dashboard)
    let filteredItems = wardrobeItems.filter(item => {
      const nameLower = item.name.toLowerCase()
      const categoryLower = item.category.toLowerCase()
      
      // Basic mood matching based on item names
      let moodMatch = true
      if (mood === 'Relaxed' && (nameLower.includes('casual') || nameLower.includes('comfortable'))) {
        moodMatch = true
      } else if (mood === 'Playful' && (nameLower.includes('fun') || nameLower.includes('colorful'))) {
        moodMatch = true
      } else if (mood === 'Elegant' && (nameLower.includes('formal') || nameLower.includes('classic'))) {
        moodMatch = true
      } else if (mood === 'Confident' && (nameLower.includes('bold') || nameLower.includes('modern'))) {
        moodMatch = true
      }
      
      // Occasion relevance based on name
      let occasionMatch = true
      if (occasion) {
        const occasionLower = occasion.toLowerCase()
        if (occasionLower.includes('work') || occasionLower.includes('office')) {
          occasionMatch = nameLower.includes('formal') || nameLower.includes('professional')
        } else if (occasionLower.includes('casual') || occasionLower.includes('weekend')) {
          occasionMatch = nameLower.includes('casual') || nameLower.includes('comfortable')
        } else if (occasionLower.includes('party') || occasionLower.includes('event')) {
          occasionMatch = nameLower.includes('elegant') || nameLower.includes('stylish')
        }
      }
      
      return moodMatch && occasionMatch
    })

    // Group items by category and select one from each
    const groupedItems = {
      tops: filteredItems.filter(item => outfitRules.tops.some(rule => item.category.toLowerCase().includes(rule))),
      bottoms: filteredItems.filter(item => outfitRules.bottoms.some(rule => item.category.toLowerCase().includes(rule))),
      shoes: filteredItems.filter(item => outfitRules.shoes.some(rule => item.category.toLowerCase().includes(rule))),
      accessories: filteredItems.filter(item => outfitRules.accessories.some(rule => item.category.toLowerCase().includes(rule)))
    }

    // Build complete outfit - select one item from each category
    const selectedOutfit: ClothingItem[] = []
    
    if (groupedItems.tops.length > 0) {
      selectedOutfit.push(groupedItems.tops[0])
    }
    if (groupedItems.bottoms.length > 0) {
      selectedOutfit.push(groupedItems.bottoms[0])
    }
    if (groupedItems.shoes.length > 0) {
      selectedOutfit.push(groupedItems.shoes[0])
    }
    if (groupedItems.accessories.length > 0) {
      selectedOutfit.push(groupedItems.accessories[0])
    }

    // If no complete outfit, just return the first few items
    if (selectedOutfit.length === 0) {
      return filteredItems.slice(0, 3)
    }

    return selectedOutfit
  }, [wardrobeItems])

  const handleGenerate = async () => {
    if (!customerId || customerId === "demo-customer") {
      // Fallback to hardcoded suggestions for demo user - clean visual only
      const moodLabel = selectedMoods[0] || "Playful"
      const items = seasonItems[selectedSeason] || seasonItems.Autumn
      const accent = moodAccents[moodLabel] || moodAccents.Playful
      const suggestion: OutfitSuggestion = {
        items: [...items, accent],
      }
      onGenerateOutfit?.(suggestion)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/clean-suggest-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          mood: selectedMoods[0] || "Playful",
          season: selectedSeason,
          occasion: occasion
        })
      })

      const data = await response.json()
      
      if (data.success && data.suggestion) {
        onGenerateOutfit?.(data.suggestion)
      } else {
        // Fallback to local wardrobe matching if API fails
        const moodLabel = selectedMoods[0] || "Playful"
        const matchedOutfit = matchOutfitFromWardrobe(moodLabel, selectedSeason, occasion)
        
        if (matchedOutfit.length > 0) {
          // Use items from user's wardrobe with images
          const suggestion: OutfitSuggestion = {
            title: `${moodLabel} ${selectedSeason} Look from Your Wardrobe`,
            summary: `For ${occasion || "your plans"} • ${selectedMoods.join(", ")} mood • From your wardrobe`,
            items: matchedOutfit.map(item => item.name),
            itemImages: matchedOutfit.map(item => item.imageUrl),
            matchedItems: matchedOutfit,
          }
          onGenerateOutfit?.(suggestion)
        } else {
          // Fallback to hardcoded suggestions if no wardrobe items match
          const items = seasonItems[selectedSeason] || seasonItems.Autumn
          const accent = moodAccents[moodLabel] || moodAccents.Playful
          const suggestion: OutfitSuggestion = {
            title: `${moodLabel} ${selectedSeason} Look`,
            summary: `For ${occasion || "your plans"} • ${selectedMoods.join(", ")} mood`,
            items: [...items, accent],
          }
          onGenerateOutfit?.(suggestion)
        }
      }
    } catch (error) {
      console.error('Failed to generate outfit suggestion:', error)
      // Fallback to local wardrobe matching on error
      const moodLabel = selectedMoods[0] || "Playful"
      const matchedOutfit = matchOutfitFromWardrobe(moodLabel, selectedSeason, occasion)
      
      if (matchedOutfit.length > 0) {
        // Use items from user's wardrobe with images - clean visual only
        const suggestion: OutfitSuggestion = {
          items: matchedOutfit.map(item => item.name),
          itemImages: matchedOutfit.map(item => item.imageUrl),
          matchedItems: matchedOutfit,
        }
        onGenerateOutfit?.(suggestion)
      } else {
        // Fallback to hardcoded suggestions if no wardrobe items match - clean visual only
        const items = seasonItems[selectedSeason] || seasonItems.Autumn
        const accent = moodAccents[moodLabel] || moodAccents.Playful
        const suggestion: OutfitSuggestion = {
          items: [...items, accent],
        }
        onGenerateOutfit?.(suggestion)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="min-h-[420px] rounded-3xl">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Primary action
          </p>
          <CardTitle className="mt-3 flex items-center gap-2 text-xl font-semibold">
            <span>Find an Outfit</span>
          </CardTitle>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground">
          <Brain className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Where are you going?
          </label>
          <Input
            className="h-10 rounded-full text-sm"
            placeholder="Tell me where you're going — I'll style you."
            value={occasion}
            onChange={(event) => setOccasion(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Mood</p>
          <div className="flex flex-wrap gap-1.5">
            {moods.map((mood) => {
              const isActive = selectedMoods.includes(mood)
              return (
                <Badge
                  key={mood}
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer rounded-full px-4 py-1 text-xs"
                  onClick={() => toggleMood(mood)}
                >
                  {mood}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Season focus
          </p>
          <div className="flex flex-wrap gap-1.5">
            {seasons.map((season) => {
              const isActive = selectedSeason === season.name
              const Icon = season.icon
              return (
                <Badge
                  key={season.name}
                  variant={isActive ? "default" : "outline"}
                  className="flex cursor-pointer items-center gap-1 rounded-full px-4 py-1 text-xs"
                  onClick={() => setSelectedSeason(season.name)}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {season.name}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="mt-3">
          <Button 
            className="h-9 w-full rounded-full text-sm font-semibold" 
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Outfit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
