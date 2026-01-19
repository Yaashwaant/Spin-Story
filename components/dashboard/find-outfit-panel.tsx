"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Sun, Leaf, Snowflake, Flower } from "lucide-react"
import { cn } from "@/lib/utils"

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
  title: string
  summary: string
  items: string[]
}

interface FindOutfitPanelProps {
  onGenerateOutfit?: (suggestion: OutfitSuggestion) => void
}

export function FindOutfitPanel({ onGenerateOutfit }: FindOutfitPanelProps) {
  const [selectedMoods, setSelectedMoods] = useState<string[]>(["Playful"])
  const [selectedSeason, setSelectedSeason] = useState("Autumn")
  const [occasion, setOccasion] = useState("")

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]))
  }

  const handleGenerate = () => {
    const moodLabel = selectedMoods[0] || "Playful"
    const items = seasonItems[selectedSeason] || seasonItems.Autumn
    const accent = moodAccents[moodLabel] || moodAccents.Playful
    const suggestion: OutfitSuggestion = {
      title: `${moodLabel} ${selectedSeason} Look`,
      summary: `For ${occasion || "your plans"} • ${selectedMoods.join(", ")} mood`,
      items: [...items, accent],
    }
    onGenerateOutfit?.(suggestion)
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
            <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">AI</Badge>
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
          <Button className="h-9 w-full rounded-full text-sm font-semibold" onClick={handleGenerate}>
            Generate Outfit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
