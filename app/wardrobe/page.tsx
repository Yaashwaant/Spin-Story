"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { WardrobeContent } from "@/components/wardrobe/wardrobe-content"

export default function WardrobePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-xl font-semibold text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            My Wardrobe
          </motion.h1>
          <motion.p 
            className="mt-0.5 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            Manage your clothing collection
          </motion.p>
        </motion.div>

        <Suspense fallback={null}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <WardrobeContent />
          </motion.div>
        </Suspense>
      </main>
    </div>
  )
}
