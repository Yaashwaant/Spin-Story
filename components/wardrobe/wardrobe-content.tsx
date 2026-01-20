"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [filters, setFilters] = useState<{
    categories: string[]
    styles: string[]
    seasons: string[]
  }>({ categories: [], styles: [], seasons: [] })

  const normalize = useCallback((value: string) => value.trim().toLowerCase(), [])

  const toLabel = useCallback((value: string) => {
    const cleaned = value.trim().replace(/[_-]+/g, " ")
    return cleaned.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
  }, [])

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, { raw: string; count: number }>()
    for (const item of wardrobe) {
      if (!item.type) continue
      const id = normalize(item.type)
      const existing = counts.get(id)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(id, { raw: item.type, count: 1 })
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      .map(([id, meta]) => ({ id, label: toLabel(meta.raw) }))
  }, [normalize, toLabel, wardrobe])

  const styleOptions = useMemo(() => {
    const counts = new Map<string, { raw: string; count: number }>()
    for (const item of wardrobe) {
      for (const style of item.styles || []) {
        if (!style) continue
        const id = normalize(style)
        const existing = counts.get(id)
        if (existing) {
          existing.count += 1
        } else {
          counts.set(id, { raw: style, count: 1 })
        }
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      .map(([id, meta]) => ({ id, label: toLabel(meta.raw) }))
  }, [normalize, toLabel, wardrobe])

  const seasonOptions = useMemo(() => {
    const counts = new Map<string, { raw: string; count: number }>()
    for (const item of wardrobe) {
      if (!item.season) continue
      const id = normalize(item.season)
      const existing = counts.get(id)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(id, { raw: item.season, count: 1 })
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      .map(([id, meta]) => ({ id, label: toLabel(meta.raw) }))
  }, [normalize, toLabel, wardrobe])

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

  // Debounce search query to reduce filtering frequency
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle successful upload completion
  const handleUploadComplete = useCallback((uploadedFiles?: File[]) => {
    // Refresh wardrobe items after successful upload
    fetchWardrobeItems()
  }, [fetchWardrobeItems])

  const handleRemoveItem = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/wardrobe?customerId=${customerId}&itemId=${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || "Failed to remove item")
        }

        setWardrobe((prev) => prev.filter((item) => item.id !== id))
      } catch (error) {
        console.error("Failed to remove wardrobe item:", error)
        alert(error instanceof Error ? error.message : "Failed to remove item. Please try again.")
      }
    },
    [customerId],
  )

  const filteredWardrobe = wardrobe.filter(
    (item) => {
      // Search query filter
      const matchesSearch = 
        item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.color.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      
      // Category filter
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(normalize(item.type))
      
      // Style filter
      const matchesStyle =
        filters.styles.length === 0 || item.styles.some((style) => filters.styles.includes(normalize(style)))
      
      // Season filter
      const matchesSeason = filters.seasons.length === 0 || filters.seasons.includes(normalize(item.season))
      
      return matchesSearch && matchesCategory && matchesStyle && matchesSeason
    }
  )

  return (
    <div className="grid gap-8 lg:grid-cols-4">
      {/* Left Sidebar - Filters */}
      <div className="lg:col-span-1">
        <FilterSidebar
          categoryOptions={categoryOptions.length ? categoryOptions : undefined}
          styleOptions={styleOptions.length ? styleOptions : undefined}
          seasonOptions={seasonOptions.length ? seasonOptions : undefined}
          onFiltersChange={setFilters}
        />
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
