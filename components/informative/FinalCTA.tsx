"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
            Stop asking{" "}
            <span className="text-gradient italic">"What should I wear?"</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-4">
            Login to ask your AI stylist.
          </p>

          <p className="text-muted-foreground mb-10">
            Create your account and experience personalized styling built around you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="inline-flex items-center">
              <Button size="lg" className="text-base px-10 py-6">
                Login to Spin Story
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}