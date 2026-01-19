"use client"

import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Check, Leaf, Snowflake, Sun } from "lucide-react"

interface ClothingItem {
  id: string
  name: string
  imageUrl: string
  category: string
  createdAt: Date
}

interface WardrobePreviewProps {
  items?: ClothingItem[]
}

const defaultItems: ClothingItem[] = [
  {
    id: "1",
    name: "Denim Jacket",
    imageUrl: "/classic-denim-jacket.png",
    category: "outerwear",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Black Blazer",
    imageUrl: "/black-blazer.jpg",
    category: "outerwear",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Floral Midi Dress",
    imageUrl: "/floral-dress.png",
    category: "dresses",
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Leather Boots",
    imageUrl: "/brown-leather-boots.png",
    category: "shoes",
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "Denim Jeans",
    imageUrl: "/denim-jeans.png",
    category: "bottoms",
    createdAt: new Date(),
  },
]

export function WardrobePreview({ items }: WardrobePreviewProps) {
  const displayItems = items && items.length > 0 ? items.slice(0, 5) : defaultItems

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Wardrobe Preview</CardTitle>
        <Check className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border bg-muted transition-all hover:scale-105"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-2xl">👔</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">{item.name}</p>
                  <p className="text-[10px] opacity-80">{item.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sun className="h-3 w-3" />
          <span>Spring/Summer</span>
          <span className="mx-1">•</span>
          <Leaf className="h-3 w-3" />
          <span>Fall/Winter</span>
        </div>
      </CardContent>
    </Card>
  )
}