"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ClothingItemData {
  id: string
  name: string
  image: string
  type: string
  color: string
  season: string
  styles: string[]
}

interface ClothingCardProps {
  item: ClothingItemData
  onView?: (id: string) => void
  onRemove?: (id: string) => void
}

export function ClothingCard({ item, onView, onRemove }: ClothingCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/50 bg-card transition-all hover:shadow-lg">
      {/* Hover Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="sm"
          variant="secondary"
          className="h-8 gap-1.5 rounded-lg bg-white/90 text-xs hover:bg-white"
          onClick={() => onView?.(item.id)}
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 gap-1.5 rounded-lg bg-white/90 text-xs text-destructive hover:bg-white"
          onClick={() => onRemove?.(item.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </Button>
      </div>

      {/* Image */}
      <div className="aspect-square overflow-hidden bg-slate-50">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="font-medium text-foreground">{item.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(item.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onRemove?.(item.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="rounded-full text-[10px] font-normal">
            {item.type}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px] font-normal">
            {item.color}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px] font-normal">
            {item.season}
          </Badge>
        </div>

        {/* Style Badges */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.styles.map((style) => (
            <Badge
              key={style}
              className={cn(
                "rounded-full text-[10px] font-medium",
                style === "Casual" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                style === "Formal" && "bg-slate-100 text-slate-700 hover:bg-slate-100",
                style === "Ethnic" && "bg-amber-100 text-amber-700 hover:bg-amber-100",
                style === "Sporty" && "bg-green-100 text-green-700 hover:bg-green-100",
              )}
            >
              {style}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}
