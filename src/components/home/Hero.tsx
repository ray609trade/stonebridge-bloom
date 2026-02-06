import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBusinessStatus } from "@/lib/businessHours";
import { useIsMobile } from "@/hooks/use-mobile";
import heroBagels from "@/assets/hero-bagels.jpg";

export function Hero() {
  const [businessStatus, setBusinessStatus] = useState(getBusinessStatus());
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(0);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    
    // Update business status every minute
    const interval = setInterval(() => {
      setBusinessStatus(getBusinessStatus());
    }, 60000);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, []);

  // Reduce parallax intensity on mobile for better performance
  const parallaxIntensity = isMobile ? 0.2 : 0.4;
  const y = useTransform(scrollY, [0, windowHeight], [0, windowHeight * parallaxIntensity]);
  const opacity = useTransform(scrollY, [0, windowHeight * 0.5], [1, 0]);
  const scale = useTransform(scrollY, [0, windowHeight * 0.5], [1, isMobile ? 1.05 : 1.1]);

  // Disable animations if user prefers reduced motion
  const shouldAnimate = !prefersReducedMotion;

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden"
    >
      {/* Animated Background */}
      <motion.div 
        style={shouldAnimate ? { y, scale } : undefined} 
        className="absolute inset-0 parallax-bg"
      >
        <img
          src={heroBagels}
          alt="Fresh bagels"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        
        {/* Animated gradient orbs - hidden on mobile for performance */}
        {!isMobile && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent/20 blur-3xl animate-float" />
            <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-amber-light/15 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div 
        style={shouldAnimate ? { opacity } : undefined} 
        className="relative z-10 container mx-auto px-4 pt-16 md:pt-20"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 30 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-primary-foreground/90 text-xs md:text-sm font-medium mb-4 md:mb-6"
          >
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>{businessStatus.message}</span>
          </motion.div>

          <motion.h1
            initial={shouldAnimate ? { opacity: 0, y: 30 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-primary-foreground leading-tight mb-4 md:mb-6"
          >
            Handcrafted
            <span className="block text-gradient">Bagels</span>
            Made Fresh Daily
          </motion.h1>

          <motion.p
            initial={shouldAnimate ? { opacity: 0, y: 30 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base md:text-xl text-primary-foreground/80 mb-6 md:mb-8 leading-relaxed"
          >
            From our ovens to your table. Traditional New York-style bagels crafted with care, using time-honored recipes and the finest ingredients.
          </motion.p>

          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 30 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col gap-3 md:flex-row md:gap-4"
          >
            <Button
              size="lg"
              className="w-full md:w-auto bg-accent hover:bg-amber-dark text-accent-foreground font-semibold px-8 shadow-glow h-14 md:h-12 text-base active:scale-95 transition-transform touch-manipulation"
              asChild
            >
              <Link to="/order">
                Order Pickup
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full md:w-auto border-primary-foreground/50 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 px-8 h-14 md:h-12 text-base active:scale-95 transition-transform touch-manipulation"
              asChild
            >
              <Link to="/wholesale">Wholesale Portal</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator - hidden on mobile */}
      <motion.div
        style={shouldAnimate ? { opacity } : undefined}
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-primary-foreground/60"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
