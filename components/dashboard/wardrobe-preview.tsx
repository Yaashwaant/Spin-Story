"use client"

import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Check, Leaf, Snowflake, Sun } from "lucide-react"

interface ClothingItem {
  id: string
  name: string
  image: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const sampleClothes: ClothingItem[] = [
  {
    id: "1",
    name: "Denim Jacket",
    image: "/classic-denim-jacket.png",
    label: "2 Seasons",
    icon: Snowflake,
  },
  {
    id: "2",
    name: "Black Blazer",
    image: "/black-blazer.jpg",
    label: "Spring/Fall",
    icon: Leaf,
  },
  {
    id: "3",
    name: "Floral Midi Dress",
    image: "/floral-dress.png",
    label: "Summer",
    icon: Sun,
  },
  {
    id: "4",
    name: "Leather Boots",
    image: "/brown-leather-boots.png",
    label: "Winter",
    icon: Snowflake,
  },
  {
    id: "5",
    name: "Denim Jeans",
    image: "/denim-jeans.png",
    label: "Everyday",
    icon: Leaf,
  },
  {
    id: "6",
    name: "Green Crewneck Tee",
    image: "/casual-tshirt.png",
    label: "Summer",
    icon: Sun,
  },
]

export function WardrobePreview() {
  return (
    <Card className="rounded-3xl py-2">
      <CardHeader className="pb-0.5">
        <CardTitle className="text-base font-semibold">Your Wardrobe</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2">
          {sampleClothes.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.id}
                className="relative flex flex-col rounded-3xl bg-card shadow-sm"
              >
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>

                <div className="mx-2.5 mt-1 mb-1 overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="h-20 w-full object-cover"
                  />
                </div>

                <div className="px-2.5 pb-1">
                  <p className="text-[12px] font-semibold tracking-tight">{item.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    <span>{item.label}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
