"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { useAuth } from "@/components/auth/auth-provider"
import { CustomerChatPanel } from "@/components/bdr/customer-chat-panel"
import { Spinner } from "@/components/ui/spinner"

export default function OutfitPlannerPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-10 flex justify-center">
          <Spinner />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Outfit planner
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            AI stylist for {user.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chat with your AI stylist, get outfit advice, and generate detailed plans using your wardrobe and profile.
          </p>
        </div>
        <CustomerChatPanel
          customerId={user.id}
          customerName={user.fullName}
          customerProfile={user.profile}
          customerPreferences={user.preferences}
          wardrobeUploaded={true}
          outfitPlanCount={0}
        />
      </main>
    </div>
  )
}

