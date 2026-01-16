import { Navbar } from "@/components/layout/navbar"
import { FindOutfitPanel } from "@/components/dashboard/find-outfit-panel"
import { WardrobePreview } from "@/components/dashboard/wardrobe-preview"
import { RecentOutfits } from "@/components/dashboard/recent-outfits"
import { SavedOutfits } from "@/components/dashboard/saved-outfits"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-2 pb-4">
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Focus</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-primary">Alex</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-3">
            <RecentOutfits />
            <SavedOutfits />
          </div>

          <div className="lg:col-span-4">
            <WardrobePreview />
          </div>

          <div className="lg:col-span-5">
            <FindOutfitPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
