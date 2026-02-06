import { motion, useReducedMotion } from "framer-motion";
import { Smartphone, Clock, CheckCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const steps = [
  {
    icon: Smartphone,
    title: "Order Online",
    description: "Browse our menu and customize your order with just a few taps.",
  },
  {
    icon: Clock,
    title: "Choose Your Time",
    description: "Select a convenient pickup time that works for your schedule.",
  },
  {
    icon: CheckCircle,
    title: "Skip the Line",
    description: "Walk in, grab your fresh order, and enjoy your day.",
  },
];

export function HowItWorks() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-3 md:mb-4">
            How Pre-Order Works
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Skip the wait and enjoy your morning even more
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center"
            >
              {/* Connector line - only on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}

              {/* Step number circle */}
              <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-card border-2 border-border shadow-card mb-4 md:mb-6">
                <step.icon className="h-8 w-8 md:h-10 md:w-10 text-accent" />
              </div>

              {/* Step number */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
                {index + 1}
              </div>

              <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
