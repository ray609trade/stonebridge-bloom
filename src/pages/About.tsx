import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Award, Leaf, Heart, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

const values = [
  {
    icon: Award,
    title: "Quality First",
    description: "We use only the finest ingredients, sourced from trusted local suppliers.",
  },
  {
    icon: Leaf,
    title: "Fresh Daily",
    description: "Every bagel is baked fresh each morning. No preservatives, ever.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Traditional recipes passed down through generations, made with care.",
  },
  {
    icon: Clock,
    title: "Time-Honored",
    description: "Authentic New York-style bagels using traditional boiling methods.",
  },
];

const team = [
  { name: "Team Member 1 (Sample)", role: "Head Baker", image: "/placeholder.svg" },
  { name: "Team Member 2 (Sample)", role: "Owner", image: "/placeholder.svg" },
  { name: "Team Member 3 (Sample)", role: "General Manager", image: "/placeholder.svg" },
];

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const y = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 100 : 200]);
  const shouldAnimate = !prefersReducedMotion;

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <Header />
      <CartDrawer />

      <main>
        {/* Hero Section */}
        <section ref={containerRef} className="relative min-h-[50vh] md:min-h-[60vh] flex items-center overflow-hidden">
          <motion.div style={shouldAnimate ? { y } : undefined} className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-espresso-dark" />
            {!isMobile && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl animate-float" />
                <div className="absolute bottom-1/3 -right-1/4 w-[400px] h-[400px] rounded-full bg-amber-light/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
              </div>
            )}
          </motion.div>

          <div className="relative z-10 container mx-auto px-4 pt-24 md:pt-32 pb-12 md:pb-16">
            <motion.div
              initial={shouldAnimate ? { opacity: 0, y: 30 } : undefined}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground mb-4 md:mb-6">
                Our Story
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
                From a small family kitchen to your neighborhood's favorite bagel shop. 
                Discover the passion and tradition behind every Stonebridge bagel.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center max-w-6xl mx-auto">
              <motion.div
                initial={shouldAnimate ? { opacity: 0, x: -30 } : undefined}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4 md:mb-6">
                  A Tradition of Excellence
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
                  <p>
                    Stonebridge Bagels began with a simple belief: great bagels require patience, 
                    quality ingredients, and respect for tradition. Our founder learned the craft 
                    from master bakers in New York, bringing those time-honored techniques to our 
                    community.
                  </p>
                  <p>
                    Every morning before dawn, our bakers arrive to begin the ritual. The dough 
                    is mixed, shaped by hand, and left to rise slowly. Then comes the boiling—the 
                    step that gives our bagels their signature chewy texture and glossy exterior.
                  </p>
                  <p>
                    Finally, into the oven they go, emerging golden brown and ready to be topped 
                    with everything from classic sesame to our signature house blend. It's a labor 
                    of love that we're proud to share with you every day.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={shouldAnimate ? { opacity: 0, x: 30 } : undefined}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-2 gap-3 md:gap-4"
              >
                <div className="space-y-3 md:space-y-4">
                  <div className="aspect-[4/5] rounded-xl bg-secondary" />
                  <div className="aspect-square rounded-xl bg-secondary" />
                </div>
                <div className="space-y-3 md:space-y-4 pt-6 md:pt-8">
                  <div className="aspect-square rounded-xl bg-secondary" />
                  <div className="aspect-[4/5] rounded-xl bg-secondary" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <motion.div
              initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10 md:mb-16"
            >
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 md:mb-4">
                Quality & Freshness
              </h2>
              <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto">
                Our commitment to excellence shows in every bagel we bake
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-4 md:p-6"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary-foreground/10 mb-3 md:mb-4">
                    <value.icon className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                  </div>
                  <h3 className="font-serif text-base md:text-xl font-semibold mb-1 md:mb-2">{value.title}</h3>
                  <p className="text-primary-foreground/70 text-xs md:text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
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
                Meet the Team
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                The passionate people behind your favorite bagels
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="aspect-square rounded-2xl bg-secondary mb-3 md:mb-4 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-serif text-base md:text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
