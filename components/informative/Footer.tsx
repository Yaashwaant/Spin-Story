"use client"

import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="font-display text-xl font-bold">
              Spin <span className="text-gradient">Story</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Your personal AI stylist that knows your style, body, and preferences.
          </p>
          <div className="text-muted-foreground text-xs">
            © 2026 Spin Story  All rights reserved.
          </div>
        </motion.div>
      </div>
    </footer>
  )
}