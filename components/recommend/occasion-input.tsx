"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const moods = [
  { id: "relaxed", label: "Relaxed" },
  { id: "confident", label: "Confident" },
  { id: "elegant", label: "Elegant" },
  { id: "playful", label: "Playful" },
]

interface OccasionInputProps {
  onGenerate: (data: { occasion: string; mood: string[]; season: string }) => void
  isLoading?: boolean
}

export function OccasionInput({ onGenerate, isLoading }: OccasionInputProps) {
  const [occasion, setOccasion] = useState("")
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [season, setSeason] = useState("")

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]))
  }

  const handleGenerate = () => {
    if (occasion.trim()) {
      onGenerate({ occasion, mood: selectedMoods, season })
    }
  }

  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Describe Your Occasion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Occasion Textarea */}
        <div className="space-y-2">
          <Textarea
            placeholder="Describe the occasion...
e.g., Wedding, Office meeting, Casual outing, Date night"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="min-h-[120px] resize-none rounded-xl border-border/50 bg-slate-50/50"
          />
        </div>

        {/* Mood Chips */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Mood (optional)</label>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <Badge
                key={mood.id}
                variant={selectedMoods.includes(mood.id) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  selectedMoods.includes(mood.id)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border/50 bg-transparent hover:bg-slate-100",
                )}
                onClick={() => toggleMood(mood.id)}
              >
                {mood.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Season Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Season (optional)</label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="rounded-xl border-border/50">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="autumn">Autumn</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button
          className="w-full gap-2 rounded-xl bg-primary py-6 text-base font-medium text-primary-foreground hover:bg-primary/90"
          onClick={handleGenerate}
          disabled={!occasion.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Outfit
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
