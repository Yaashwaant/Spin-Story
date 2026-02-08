"use client"

import { motion } from "framer-motion"
import { Shield, Lock } from "lucide-react"

export function Privacy() {
  return (
    <section id="privacy" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight mb-6">
            Privacy & <span className="text-gradient italic">Security</span>
          </h2>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              Your wardrobe, photos, and personal data are securely stored with authenticated access.
            </p>
          </div>

          <p className="text-foreground font-display text-xl font-medium italic">
            Your style data stays yours.
          </p>
        </motion.div>
      </div>
    </section>
  )
}