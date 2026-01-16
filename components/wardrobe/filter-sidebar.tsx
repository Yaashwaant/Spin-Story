"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const categories = [
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "outerwear", label: "Outerwear" },
  { id: "dresses", label: "Dresses" },
  { id: "footwear", label: "Footwear" },
  { id: "accessories", label: "Accessories" },
]

const styles = [
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
  { id: "sporty", label: "Sporty" },
  { id: "ethnic", label: "Ethnic" },
  { id: "boho", label: "Boho" },
]

const seasons = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
]

export function FilterSidebar() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])
  const [budgetRange, setBudgetRange] = useState([0, 200])

  const toggleFilter = (
    id: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <Card className="sticky top-24 rounded-2xl border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Filter by:</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleFilter(category.id, selectedCategories, setSelectedCategories)}
                />
                <Label htmlFor={category.id} className="text-sm font-normal text-muted-foreground cursor-pointer">
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Budget</h4>
          <div className="px-1">
            <Slider value={budgetRange} onValueChange={setBudgetRange} min={0} max={500} step={10} className="w-full" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>${budgetRange[0]}</span>
              <span>${budgetRange[1]}+</span>
            </div>
          </div>
        </div>

        {/* Style Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Style</h4>
          <div className="flex flex-wrap gap-2">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => toggleFilter(style.id, selectedStyles, setSelectedStyles)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all",
                  selectedStyles.includes(style.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Season Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Season</h4>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => toggleFilter(season.id, selectedSeasons, setSelectedSeasons)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all",
                  selectedSeasons.includes(season.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {season.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
