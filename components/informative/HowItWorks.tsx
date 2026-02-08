"use client"

import { motion } from "framer-motion"
import { UserPlus, Camera, Wand2 } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create Your Profile",
    description: "Sign up and complete your onboarding preferences — height, fit, budget, colors, and more.",
  },
  {
    icon: Camera,
    number: "02",
    title: "Upload Your Wardrobe",
    description: "Add clothing photos. AI organizes everything automatically with smart tags and categories.",
  },
  {
    icon: Wand2,
    number: "03",
    title: "Login to Style",
    description: "Ask for outfits, generate plans, or chat with your stylist anytime. Your wardrobe becomes a decision engine.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
            How It <span className="text-gradient italic">Works</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="relative inline-flex mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary text-primary text-xs font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-display font-semibold mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}