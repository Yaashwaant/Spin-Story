"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Outfit {
  id: number
  name: string
  items: string[]
}

const recentOutfits: Outfit[] = [
  { id: 1, name: "Outfit 1: Casual", items: ["🧥", "👖", "👟", "🕶️"] },
  { id: 2, name: "Outfit 2: Evening", items: ["👔", "👖", "👞", "⌚"] },
  { id: 3, name: "Outfit 3: Sport", items: ["👕", "🩳", "👟", "🧢"] },
]

export function RecentOutfits() {
  return (
    <Card className="rounded-3xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold">Recent Outfits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {recentOutfits.map((outfit) => (
            <Card
              key={outfit.id}
              className="flex h-24 w-36 flex-shrink-0 cursor-pointer flex-col justify-between rounded-2xl border px-2.5 py-2"
            >
              <div className="flex gap-1.5">
                {outfit.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-medium">{outfit.name}</p>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
