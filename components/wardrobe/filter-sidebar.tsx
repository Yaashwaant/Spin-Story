"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FilterOption = { id: string; label: string }

const defaultCategories: FilterOption[] = [
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "outerwear", label: "Outerwear" },
  { id: "dresses", label: "Dresses" },
  { id: "footwear", label: "Footwear" },
  { id: "accessories", label: "Accessories" },
]

const defaultStyles: FilterOption[] = [
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
  { id: "sporty", label: "Sporty" },
  { id: "ethnic", label: "Ethnic" },
  { id: "boho", label: "Boho" },
]

const defaultSeasons: FilterOption[] = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
]

interface FilterSidebarProps {
  categoryOptions?: FilterOption[]
  styleOptions?: FilterOption[]
  seasonOptions?: FilterOption[]
  onFiltersChange?: (filters: {
    categories: string[]
    styles: string[]
    seasons: string[]
  }) => void
}

export function FilterSidebar({
  categoryOptions,
  styleOptions,
  seasonOptions,
  onFiltersChange,
}: FilterSidebarProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])

  const toggleFilter = (id: string, setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Notify parent component when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        categories: selectedCategories,
        styles: selectedStyles,
        seasons: selectedSeasons,
      })
    }
  }, [selectedCategories, selectedStyles, selectedSeasons, onFiltersChange])

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
            {(categoryOptions?.length ? categoryOptions : defaultCategories).map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleFilter(category.id, setSelectedCategories)}
                />
                <Label htmlFor={category.id} className="text-sm font-normal text-muted-foreground cursor-pointer">
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>



        {/* Style Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Style</h4>
          <div className="flex flex-wrap gap-2">
            {(styleOptions?.length ? styleOptions : defaultStyles).map((style) => (
              <button
                key={style.id}
                onClick={() => toggleFilter(style.id, setSelectedStyles)}
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
            {(seasonOptions?.length ? seasonOptions : defaultSeasons).map((season) => (
              <button
                key={season.id}
                onClick={() => toggleFilter(season.id, setSelectedSeasons)}
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
