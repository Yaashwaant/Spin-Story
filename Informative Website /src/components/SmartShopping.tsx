import { motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";

const benefits = [
  "Complement existing items",
  "Fit your budget",
  "Fill real gaps",
  "Explain why they're recommended",
];

const SmartShopping = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <div className="relative p-8 rounded-2xl bg-card border border-border shadow-elevated">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
                <ShoppingBag className="w-6 h-6 text-primary-foreground" />
              </div>

              <h4 className="text-lg font-display font-semibold mb-6 mt-2 text-foreground">
                Smart Recommendations
              </h4>

              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground italic">
                  No impulse buying. No duplicates.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
              Intentional Growth
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight mb-6">
              Smarter Shopping <span className="text-gradient italic">Decisions</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your AI stylist doesn't just use what you own. It helps you grow your wardrobe intentionally with product recommendations that make sense.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every suggestion comes with a reason — because smart shopping means{" "}
              <span className="text-foreground font-medium">understanding why</span>.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SmartShopping;
