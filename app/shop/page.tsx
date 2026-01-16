"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { ProductCard, type ProductData } from "@/components/shop/product-card"
import { ShopFilters } from "@/components/shop/shop-filters"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

const sampleProducts: ProductData[] = [
  {
    id: "1",
    name: "Classic Trench Coat",
    image: "/beige-trench-coat.png",
    price: "$189",
    reason: "Complements your formal wear and fills a gap in your outerwear collection.",
    category: "outerwear",
    isRecommended: true,
  },
  {
    id: "2",
    name: "Minimalist White Sneakers",
    image: "/white-minimalist-sneakers.png",
    price: "$95",
    reason: "Pairs perfectly with your casual tops and jeans. A year-round essential.",
    category: "footwear",
    isRecommended: true,
  },
  {
    id: "3",
    name: "Navy Chinos",
    image: "/navy-chinos.png",
    price: "$65",
    reason: "Versatile bottoms that work with your existing blazers and casual shirts.",
    category: "bottoms",
  },
  {
    id: "4",
    name: "Cream Knit Sweater",
    image: "/cream-knit-sweater.png",
    price: "$78",
    reason: "Adds warmth to your autumn wardrobe. Layers beautifully with your jackets.",
    category: "tops",
  },
  {
    id: "5",
    name: "Leather Crossbody Bag",
    image: "/leather-crossbody-bag.png",
    price: "$120",
    reason: "A practical accessory that complements your casual and smart-casual outfits.",
    category: "accessories",
    isRecommended: true,
  },
  {
    id: "6",
    name: "Structured Wool Blazer",
    image: "/wool-blazer.png",
    price: "$220",
    reason: "Elevates your formal options. Great for office and evening events.",
    category: "outerwear",
  },
]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredProducts =
    selectedCategory === "all" ? sampleProducts : sampleProducts.filter((p) => p.category === selectedCategory)

  const recommendedProducts = filteredProducts.filter((p) => p.isRecommended)
  const otherProducts = filteredProducts.filter((p) => !p.isRecommended)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Shopping Suggestions</h1>
          <p className="mt-1 text-muted-foreground">Curated picks to complete your wardrobe</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <ShopFilters selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          </div>

          {/* Main Content */}
          <div className="space-y-8 lg:col-span-3">
            {/* AI Recommendations Section */}
            {recommendedProducts.length > 0 && (
              <div>
                <Card className="mb-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100">
                  <CardContent className="flex items-center gap-3 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                      <Sparkles className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-teal-800">AI Recommended for You</p>
                      <p className="text-xs text-teal-600">Based on your wardrobe analysis</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Other Products */}
            {otherProducts.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-foreground">More Suggestions</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {otherProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <Card className="rounded-2xl border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-center text-muted-foreground">No products found in this category</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
