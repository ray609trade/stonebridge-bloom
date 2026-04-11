import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Award, Leaf, Heart, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import bagelsOutside from "@/assets/bagels_outside.jpg";
import bagelshopPhotos from "@/assets/bagelshop_potos.jpg";
import bagels2 from "@/assets/bagels_2.jpg";
import baelsShop from "@/assets/baels_shop.jpg";

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
                  About Stonebridge Bagels &amp; Deli
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
                  <p>
                    At Stonebridge Bagels &amp; Deli, we believe great food starts with great ingredients. As a family-owned business proudly serving the Allentown, NJ community since 2013, we handcraft New York-style boiled bagels fresh on the premises every single day — crispy on the outside, perfectly fluffy on the inside. From classic spreads and made-to-order sandwiches to fresh salads, homemade cookies, and our one-of-a-kind Chorizo Bagel, there's something on our menu for everyone. Whether you're stopping in for a quick breakfast, grabbing lunch, or planning your next event, our catering team is ready to make it memorable. At Stonebridge, quality meets tradition — one bagel at a time.
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

      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
