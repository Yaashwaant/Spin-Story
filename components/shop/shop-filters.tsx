"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "All" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "outerwear", label: "Outerwear" },
  { id: "footwear", label: "Footwear" },
  { id: "accessories", label: "Accessories" },
]

const styles = [
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
  { id: "sporty", label: "Sporty" },
  { id: "boho", label: "Boho" },
]

interface ShopFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function ShopFilters({ selectedCategory, onCategoryChange }: ShopFiltersProps) {
  const [budgetRange, setBudgetRange] = useState([0, 200])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) => (prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]))
  }

  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Tabs */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Category</h4>
          <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
            <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="rounded-full border border-border/50 px-3 py-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Budget Slider */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Budget</h4>
          <div className="px-1">
            <Slider value={budgetRange} onValueChange={setBudgetRange} min={0} max={500} step={10} className="w-full" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>₹{budgetRange[0]}</span>
              <span>₹{budgetRange[1]}+</span>
            </div>
          </div>
        </div>

        {/* Style Pills */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Style</h4>
          <div className="flex flex-wrap gap-2">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => toggleStyle(style.id)}
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
      </CardContent>
    </Card>
  )
}
