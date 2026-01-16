"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"

interface SavedOutfit {
  id: number
  name: string
  items: string[]
  likes: number
}


const savedOutfits: SavedOutfit[] = [
  { id: 1, name: "Date Night", items: ["👗", "👠", "👜"], likes: 24 },
  { id: 2, name: "Office Look", items: ["👔", "👖", "👞"], likes: 18 },
  { id: 3, name: "Weekend Vibes", items: ["👕", "🩳", "🩴"], likes: 32 },
]

export function SavedOutfits() {
  return (
    <Card className="rounded-3xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Saved Outfits</CardTitle>
          <Heart className="h-3 w-3 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {savedOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-1.5 text-xs hover:bg-muted/50"
            >
              <div className="flex -space-x-1">
                {outfit.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[11px]"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <span className="flex-1 text-[11px] font-medium">{outfit.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Heart className="h-2.5 w-2.5 fill-primary/70 text-primary" />
                {outfit.likes}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
