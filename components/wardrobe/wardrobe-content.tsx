"use client"

import { useState } from "react"
import { ClothingCard, type ClothingItemData } from "@/components/wardrobe/clothing-card"
import { UploadDropzone } from "@/components/wardrobe/upload-dropzone"
import { FilterSidebar } from "@/components/wardrobe/filter-sidebar"
import { EmptyWardrobeState } from "@/components/wardrobe/empty-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Grid3X3, LayoutList } from "lucide-react"

const sampleWardrobe: ClothingItemData[] = [
  {
    id: "1",
    name: "Classic Denim Jacket",
    image: "/classic-denim-jacket.png",
    type: "Jacket",
    color: "Blue",
    season: "All Season",
    styles: ["Casual"],
  },
  {
    id: "2",
    name: "Black Blazer",
    image: "/black-blazer.jpg",
    type: "Jacket",
    color: "Black",
    season: "All Season",
    styles: ["Formal"],
  },
  {
    id: "3",
    name: "Floral Summer Dress",
    image: "/floral-dress.png",
    type: "Dress",
    color: "Multi",
    season: "Summer",
    styles: ["Casual"],
  },
  {
    id: "4",
    name: "Brown Leather Boots",
    image: "/brown-leather-boots.png",
    type: "Footwear",
    color: "Brown",
    season: "Autumn",
    styles: ["Casual"],
  },
  {
    id: "5",
    name: "Classic Denim Jeans",
    image: "/denim-jeans.png",
    type: "Bottoms",
    color: "Blue",
    season: "All Season",
    styles: ["Casual"],
  },
  {
    id: "6",
    name: "Casual T-Shirt",
    image: "/casual-tshirt.png",
    type: "Top",
    color: "White",
    season: "Summer",
    styles: ["Casual", "Sporty"],
  },
]

export function WardrobeContent() {
  const [wardrobe, setWardrobe] = useState<ClothingItemData[]>(sampleWardrobe)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleRemoveItem = (id: string) => {
    setWardrobe((prev) => prev.filter((item) => item.id !== id))
  }

  const filteredWardrobe = wardrobe.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="grid gap-8 lg:grid-cols-4">
      {/* Left Sidebar - Filters */}
      <div className="lg:col-span-1">
        <FilterSidebar />
      </div>

      {/* Main Content */}
      <div className="space-y-6 lg:col-span-3">
        {/* Upload Zone */}
        <UploadDropzone />

        {/* Search & View Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search wardrobe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{filteredWardrobe.length} items</span>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
              <TabsList className="h-9 rounded-lg bg-slate-100">
                <TabsTrigger value="grid" className="h-7 w-7 p-0 rounded-md">
                  <Grid3X3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="h-7 w-7 p-0 rounded-md">
                  <LayoutList className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Wardrobe Grid */}
        {filteredWardrobe.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWardrobe.map((item) => (
              <ClothingCard key={item.id} item={item} onRemove={handleRemoveItem} />
            ))}
          </div>
        ) : (
          <EmptyWardrobeState />
        )}
      </div>
    </div>
  )
}
