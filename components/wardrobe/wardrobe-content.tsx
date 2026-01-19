"use client"

import { useState, useEffect, useCallback } from "react"
import { ClothingCard, type ClothingItemData } from "@/components/wardrobe/clothing-card"
import { UploadDropzone } from "@/components/wardrobe/upload-dropzone"
import { FilterSidebar } from "@/components/wardrobe/filter-sidebar"
import { EmptyWardrobeState } from "@/components/wardrobe/empty-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Grid3X3, LayoutList } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function WardrobeContent() {
  const { user } = useAuth()
  const [wardrobe, setWardrobe] = useState<ClothingItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const customerId = user?.id || "demo-customer"

  // Fetch wardrobe items from API
  const fetchWardrobeItems = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/wardrobe?customerId=${customerId}`)
      const data = await response.json()
      
      if (data.items) {
        setWardrobe(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch wardrobe items:', error)
    } finally {
      setLoading(false)
    }
  }, [customerId])

  // Fetch items on component mount and when customerId changes
  useEffect(() => {
    fetchWardrobeItems()
  }, [fetchWardrobeItems])

  // Handle successful upload completion
  const handleUploadComplete = useCallback(() => {
    // Refresh wardrobe items after successful upload
    fetchWardrobeItems()
  }, [fetchWardrobeItems])

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
        <UploadDropzone onUploadComplete={handleUploadComplete} customerId={customerId} />

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading wardrobe items...</p>
            </div>
          </div>
        ) : filteredWardrobe.length > 0 ? (
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
