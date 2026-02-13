"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

const points = [
  "Personalized recommendations",
  "Body type analysis",
  "Style preferences",
  "Budget awareness",
  "Occasion matching",
  "Weather considerations"
]

export function StylistIntro() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
            The AI Stylist That{" "}
            <span className="text-gradient italic">Knows You</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Unlike generic fashion apps, The Spin Story learns your unique style, understands your body type, 
            and considers your lifestyle to create outfits that make you feel confident and authentic.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {points.map((point, i) => (
            <motion.div
              key={point}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border shadow-soft"
            >
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{point}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}