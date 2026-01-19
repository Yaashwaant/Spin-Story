"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface OutfitItem {
  id: string
  name: string
  imageUrl: string
  occasion: string
  createdAt: Date
}

interface RecentOutfitsProps {
  outfits: OutfitItem[]
}

export function RecentOutfits({ outfits }: RecentOutfitsProps) {
  if (!outfits || outfits.length === 0) {
    return (
      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold">Recent Outfits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent outfits found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold">Recent Outfits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {outfits.map((outfit) => (
            <Card
              key={outfit.id}
              className="flex h-24 w-36 flex-shrink-0 cursor-pointer flex-col justify-between rounded-2xl border px-2.5 py-2"
            >
              <div className="flex items-center justify-center h-12">
                {outfit.imageUrl ? (
                  <img 
                    src={outfit.imageUrl} 
                    alt={outfit.name}
                    className="h-10 w-10 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs">👔</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-medium truncate">{outfit.name}</p>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}