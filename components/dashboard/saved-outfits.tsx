"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"

interface OutfitItem {
  id: string
  name: string
  imageUrl: string
  occasion: string
  createdAt: Date
}

interface SavedOutfitsProps {
  outfits: OutfitItem[]
}

export function SavedOutfits({ outfits }: SavedOutfitsProps) {
  if (!outfits || outfits.length === 0) {
    return (
      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Saved Outfits</CardTitle>
            <Heart className="h-3 w-3 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">No saved outfits found</p>
        </CardContent>
      </Card>
    )
  }

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
          {outfits.slice(0, 3).map((outfit) => (
            <div
              key={outfit.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-1.5 text-xs hover:bg-muted/50"
            >
              <div className="flex -space-x-1">
                {outfit.imageUrl ? (
                  <img 
                    src={outfit.imageUrl} 
                    alt={outfit.name}
                    className="h-6 w-6 rounded-full border-2 border-background object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[11px]">
                    👔
                  </div>
                )}
              </div>
              <span className="flex-1 text-[11px] font-medium truncate">{outfit.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Heart className="h-2.5 w-2.5 fill-primary/70 text-primary" />
                {Math.floor(Math.random() * 50) + 10}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}