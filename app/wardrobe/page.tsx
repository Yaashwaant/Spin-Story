"use client"

import { Suspense } from "react"
import { Navbar } from "@/components/layout/navbar"
import { WardrobeContent } from "@/components/wardrobe/wardrobe-content"

export default function WardrobePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-foreground">My Wardrobe</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage your clothing collection</p>
        </div>

        <Suspense fallback={null}>
          <WardrobeContent />
        </Suspense>
      </main>
    </div>
  )
}
