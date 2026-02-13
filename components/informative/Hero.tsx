"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/informative-assets/hero-wardrobe.jpg"
          alt="Curated wardrobe flat lay with elegant clothing and accessories"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-24">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <span className="text-sm font-medium text-primary">Your Personal AI Stylist</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6"
          >
            The Spin{" "}
            <span className="text-gradient italic">Story</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-4 max-w-lg"
          >
            Style advice, outfit planning, and wardrobe intelligence — powered by AI and built around{" "}
            <span className="text-foreground font-medium">you</span>.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="text-base text-muted-foreground leading-relaxed mb-10 max-w-lg"
          >
            Upload your clothes. Build your profile. Let your AI stylist create outfits that actually work for your body, preferences, and budget.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a href="/login" className="inline-flex items-center">
              <Button size="lg" className="text-base px-8 py-6">
                Create Your Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="/login" className="inline-flex items-center">
              <Button variant="outline" size="lg" className="text-base px-8 py-6">
                Login
              </Button>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
    </section>
  )
}
