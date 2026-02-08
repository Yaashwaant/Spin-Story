import { motion } from "framer-motion";
import { Briefcase, Heart, PartyPopper, Plane, Sun } from "lucide-react";

const useCases = [
  { icon: Briefcase, label: "Everyday office wear" },
  { icon: Heart, label: "Date nights" },
  { icon: PartyPopper, label: "Weddings & formal" },
  { icon: Plane, label: "Travel packing" },
  { icon: Sun, label: "Seasonal transitions" },
];

const UseCases = () => {
  return (
    <section className="py-24 lg:py-32 bg-card/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
            Every Occasion
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-4">
            Designed for <span className="text-gradient italic">Real Life</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Your AI stylist adapts to every scenario.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-background border border-border shadow-soft hover:shadow-elevated hover:border-primary/30 transition-all duration-300"
            >
              <uc.icon className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{uc.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
