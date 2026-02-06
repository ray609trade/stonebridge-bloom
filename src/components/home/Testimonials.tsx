import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Regular Customer",
    content: "Best bagels I've had outside of New York. The everything bagel with scallion cream cheese is perfection.",
    rating: 5,
  },
  {
    name: "David L.",
    role: "Cafe Owner",
    content: "We've been ordering wholesale from Stonebridge for years. Consistent quality and their delivery is always on time.",
    rating: 5,
  },
  {
    name: "Jennifer K.",
    role: "Weekly Subscriber",
    content: "The online ordering system saves me so much time in the morning. Fresh bagels ready when I arrive!",
    rating: 5,
  },
];

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-3 md:mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Join thousands of happy bagel lovers
          </p>
        </motion.div>

        {/* Mobile: Horizontal scroll carousel */}
        {isMobile ? (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex-shrink-0 w-[85vw] snap-center p-6 rounded-2xl bg-card border border-border shadow-card"
                >
                  <Quote className="absolute top-4 right-4 h-6 w-6 text-accent/20" />
                  
                  {/* Stars */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>

                  <p className="text-foreground text-sm leading-relaxed mb-4">
                    "{testimonial.content}"
                  </p>

                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Scroll indicators */}
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* Desktop: Grid layout */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative p-8 rounded-2xl bg-card border border-border shadow-card"
              >
                <Quote className="absolute top-6 right-6 h-8 w-8 text-accent/20" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-foreground leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
