import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Phone, Clock, Mail, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getFormattedSchedule } from "@/lib/businessHours";
import { useIsMobile } from "@/hooks/use-mobile";
import { LazyMap } from "./LazyMap";

export function LocationSection() {
  const schedule = getFormattedSchedule();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
          {/* Map */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: -20 } : undefined}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/3] md:aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border shadow-card order-2 lg:order-1"
          >
            <LazyMap className="absolute inset-0" />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: 20 } : undefined}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2"
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4 md:mb-6">
              Visit Us
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-6 md:mb-8">
              Stop by for fresh bagels, coffee, and a warm welcome. We can't wait to see you!
            </p>

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 rounded-lg bg-accent/10 shrink-0">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm md:text-base mb-0.5 md:mb-1">Address</h4>
                  <p className="text-muted-foreground text-sm md:text-base">
                    1278 Yardville-Allentown Road<br />
                    Allentown, NJ 08501
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 rounded-lg bg-accent/10 shrink-0">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm md:text-base mb-0.5 md:mb-1">Hours</h4>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {schedule.map((s, i) => (
                      <span key={s.label}>
                        {s.label}: {s.hours}
                        {i < schedule.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 rounded-lg bg-accent/10 shrink-0">
                  <Phone className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm md:text-base mb-0.5 md:mb-1">Phone</h4>
                  <a href="tel:+16097383222" className="text-muted-foreground text-sm md:text-base hover:text-foreground transition-colors">(609) 738-3222</a>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 rounded-lg bg-accent/10 shrink-0">
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm md:text-base mb-0.5 md:mb-1">Email</h4>
                  <a href="mailto:steven@stonebridgebagels.com" className="text-muted-foreground text-sm md:text-base hover:text-foreground transition-colors break-all">steven@stonebridgebagels.com</a>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:gap-4">
              <Button 
                size="lg" 
                className="h-12 md:h-11 active:scale-95 transition-transform touch-manipulation"
                asChild
              >
                <Link to="/order">Order Now</Link>
              </Button>
              {isMobile ? (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-12 active:scale-95 transition-transform touch-manipulation"
                  asChild
                >
                  <a 
                    href="https://maps.google.com/?q=1278+Yardville-Allentown+Road+Allentown+NJ+08501" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </a>
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-11"
                  asChild
                >
                  <a href="tel:+16097383222">Call Us</a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
