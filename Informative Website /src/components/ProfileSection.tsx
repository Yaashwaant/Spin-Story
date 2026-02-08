import { motion } from "framer-motion";
import { Ruler, Palette, Heart, DollarSign, User, ScanFace } from "lucide-react";

const profileItems = [
  { icon: Ruler, label: "Height & weight" },
  { icon: Heart, label: "Fit preference" },
  { icon: Palette, label: "Colors you love or avoid" },
  { icon: DollarSign, label: "Budget range" },
  { icon: User, label: "Gender & age" },
  { icon: ScanFace, label: "Photo analysis" },
];

const ProfileSection = () => {
  return (
    <section id="profile" className="py-24 lg:py-32 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
              Personalization
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight mb-6">
              Built Around <span className="text-gradient italic">Your Profile</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Create a detailed style profile so your AI stylist can guide silhouette balance, skin tone alignment, and personal style direction.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This isn't trend-based styling. It's{" "}
              <span className="text-foreground font-medium">personal intelligence</span> applied to fashion.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {profileItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border shadow-soft hover:border-primary/30 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
