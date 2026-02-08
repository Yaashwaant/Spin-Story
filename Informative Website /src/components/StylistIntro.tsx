import { motion } from "framer-motion";
import { Check } from "lucide-react";

const points = [
  "Your real wardrobe",
  "Your body profile",
  "Your comfort preferences",
  "Your lifestyle",
  "Your budget",
];

const StylistIntro = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4"
          >
            Why Spin Story
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-6"
          >
            The AI Stylist That{" "}
            <span className="text-gradient italic">Knows You</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto"
          >
            Most fashion advice is generic. Spin Story's AI stylist is different. It doesn't guess — it styles based on data.{" "}
            <span className="text-foreground font-medium">Your data.</span>
          </motion.p>

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
      </div>
    </section>
  );
};

export default StylistIntro;
