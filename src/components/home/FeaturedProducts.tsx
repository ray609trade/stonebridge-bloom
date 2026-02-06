import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/menu/ProductCard";

export function FeaturedProducts() {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .eq("featured", true)
        .eq("active", true)
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

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
            Customer Favorites
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Discover our most beloved creations, from classic everything bagels to signature sandwiches.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 md:h-80 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Featured products coming soon!</p>
          </div>
        )}

        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10 md:mt-12"
        >
          <Button 
            size="lg" 
            variant="outline" 
            className="h-12 md:h-11 px-6 active:scale-95 transition-transform touch-manipulation"
            asChild
          >
            <Link to="/order">
              View Full Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
