"use client"

import { motion } from "framer-motion"
import { Sparkles, CalendarDays, MessageCircle, ShirtIcon } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Instant Outfit Recommendations",
    description:
      "Choose your mood, season, and occasion. Your AI stylist generates complete outfit combinations using your actual clothes. No random suggestions. No repeating the same look.",
    tags: ["Mood", "Season", "Occasion"],
  },
  {
    icon: CalendarDays,
    title: "Smart Outfit Planning",
    description:
      "Generate week plans, trip packing plans, and occasion-specific styling plans. Each plan is tailored to your wardrobe and personal profile. Download as PDF.",
    tags: ["Week Plans", "Packing", "PDF Export"],
  },
  {
    icon: MessageCircle,
    title: "Style Advice On Demand",
    description:
      "Chat naturally with your AI stylist. Ask what suits your body type, how to style a piece differently, what colors work best, or how to elevate your everyday look.",
    tags: ["Body Type", "Color Theory", "Styling Tips"],
  },
  {
    icon: ShirtIcon,
    title: "Powered by Your Digital Wardrobe",
    description:
      "Upload clothing photos through drag-and-drop. The AI automatically detects category, identifies color, tags season and style, and creates structured metadata.",
    tags: ["Auto-Tag", "Smart Search", "Organize"],
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-card/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
            Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
            What Your AI Stylist <span className="text-gradient italic">Can Do</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative p-8 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all duration-500 shadow-soft hover:shadow-elevated"
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              <h3 className="text-xl font-display font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {feature.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}