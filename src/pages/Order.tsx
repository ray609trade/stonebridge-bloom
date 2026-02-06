import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ShoppingBag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/menu/ProductCard";
import { ProductModal } from "@/components/menu/ProductModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  images: string[] | null;
  dietary_tags: string[] | null;
  options: any;
  retail_price: number;
  category?: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Order() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { itemCount, subtotal, toggleCart } = useCart();
  const isMobile = useIsMobile();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("active", true)
        .in("visibility", ["retail", "both"])
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, category:categories(id, name)")
        .eq("active", true)
        .order("sort_order");

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <CartDrawer />

      <main className="pt-16 md:pt-20">
        {/* Header Section */}
        <section className="bg-secondary/50 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="font-serif text-3xl md:text-5xl font-semibold text-foreground mb-3 md:mb-4">
                Order Online
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8">
                Browse our menu and place your order for pickup. Skip the line!
              </p>

              {/* Search - Sticky on mobile */}
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search menu..."
                  className="pl-12 h-12 md:h-12 text-base rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories & Products */}
        <section className="py-6 md:py-12">
          <div className="container mx-auto px-4">
            {/* Category Pills - Horizontal scroll with larger touch targets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 md:mb-8 scrollbar-hide -mx-4 px-4">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "shrink-0 h-11 px-5 rounded-full text-sm font-medium",
                  "active:scale-95 transition-transform touch-manipulation"
                )}
              >
                All Items
              </Button>
              {categories?.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "shrink-0 h-11 px-5 rounded-full text-sm font-medium",
                    "active:scale-95 transition-transform touch-manipulation"
                  )}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Products Grid - Single column on mobile */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-72 md:h-80 rounded-xl bg-secondary animate-pulse" />
                ))}
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                  >
                    <ProductCard
                      product={product}
                      onSelect={() => setSelectedProduct(product)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  {searchQuery
                    ? "No items match your search."
                    : "Menu items coming soon!"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Cart Button - Mobile only, when items in cart */}
      {isMobile && itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 left-4 right-4 z-30"
        >
          <Button
            onClick={toggleCart}
            className="w-full h-14 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold text-base rounded-xl shadow-lg active:scale-[0.98] transition-transform touch-manipulation"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            View Cart ({itemCount}) · ${subtotal.toFixed(2)}
          </Button>
        </motion.div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
