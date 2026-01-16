"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Bot, Lightbulb } from "lucide-react"

interface OutfitItem {
  id: string
  name: string
  image: string
  type: string
}

interface OutfitResultProps {
  outfit: OutfitItem[] | null
  reasoning: string | null
  confidence: number | null
  isLoading?: boolean
}

export function OutfitResult({ outfit, reasoning, confidence, isLoading }: OutfitResultProps) {
  // Empty State
  if (!outfit && !isLoading) {
    return (
      <Card className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center py-12">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50">
            <Bot className="h-14 w-14 text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="text-center text-lg font-medium text-foreground">Describe an occasion to get started</p>
          <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
            Tell us about your event and we will suggest the perfect outfit from your wardrobe
          </p>
        </CardContent>
      </Card>
    )
  }

  // Loading State
  if (isLoading) {
    return (
      <Card className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center py-12">
          <div className="mb-6 relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot className="h-12 w-12 text-primary animate-bounce" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-center text-lg font-medium text-foreground">AI is styling your outfit...</p>
          <p className="mt-2 text-center text-sm text-muted-foreground">Analyzing your wardrobe for the best match</p>

          {/* Skeleton outfit preview */}
          <div className="mt-8 flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Result State
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Your AI Suggested Outfit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Outfit Visual Stack */}
        <div className="relative flex items-center justify-center py-8">
          <div className="flex items-end gap-4">
            {outfit?.map((item, index) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-xl border border-border/50 bg-white shadow-md transition-transform hover:scale-105 hover:shadow-lg"
                style={{
                  width: index === 1 ? "140px" : "110px",
                  height: index === 1 ? "140px" : "110px",
                  zIndex: index === 1 ? 10 : 5,
                }}
              >
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-[10px] font-medium text-white truncate">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Reasoning Box */}
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">Why these items were chosen</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{reasoning}</p>
        </div>

        {/* Confidence Indicator */}
        {confidence !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Match Confidence</span>
              <span className="font-medium text-foreground">{confidence}%</span>
            </div>
            <Progress value={confidence} className="h-2 rounded-full" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
