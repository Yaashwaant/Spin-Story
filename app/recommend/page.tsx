"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { OccasionInput } from "@/components/recommend/occasion-input"
import { OutfitResult } from "@/components/recommend/outfit-result"

const sampleOutfit = [
  { id: "1", name: "Black Blazer", image: "/black-blazer.jpg", type: "Jacket" },
  { id: "2", name: "Classic Denim Jeans", image: "/denim-jeans.png", type: "Bottoms" },
  { id: "3", name: "Brown Leather Boots", image: "/brown-leather-boots.png", type: "Footwear" },
]

export default function RecommendPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [outfit, setOutfit] = useState<typeof sampleOutfit | null>(null)
  const [reasoning, setReasoning] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)

  const handleGenerate = async (data: { occasion: string; mood: string[]; season: string }) => {
    setIsLoading(true)

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Simulate AI response
    setOutfit(sampleOutfit)
    setReasoning(
      `Based on your "${data.occasion}" occasion, I've selected a smart-casual ensemble. The black blazer adds sophistication while the denim jeans keep it relaxed. Brown leather boots complete the look with a touch of warmth perfect for ${data.season || "any season"}.`,
    )
    setConfidence(87)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Outfit Recommendations</h1>
          <p className="mt-1 text-muted-foreground">Let AI style the perfect outfit for your occasion</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Panel - Inputs */}
          <div>
            <OccasionInput onGenerate={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Right Panel - AI Output */}
          <div>
            <OutfitResult outfit={outfit} reasoning={reasoning} confidence={confidence} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
