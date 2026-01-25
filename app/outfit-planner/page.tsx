"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Spinner />
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.p 
            className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground font-serif"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Outfit planner
          </motion.p>
          <motion.h1 
            className="text-2xl font-semibold text-foreground font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            AI stylist for {user.fullName}
          </motion.h1>
          <motion.p 
            className="mt-1 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            Chat with your AI stylist, get outfit advice, and generate detailed plans using your wardrobe and profile.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        >
          <CustomerChatPanel
            customerId={user.id}
            customerName={user.fullName}
            customerProfile={user.profile}
            customerPreferences={user.preferences}
            wardrobeUploaded={true}
            outfitPlanCount={0}
          />
        </motion.div>
      </main>
    </div>
  )
}

