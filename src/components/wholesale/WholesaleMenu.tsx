import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useWholesaleCart } from "@/hooks/useWholesaleCart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  images: string[] | null;
  wholesale_price: number | null;
  wholesale_minimum: number | null;
  retail_price: number;
  category?: { id: string; name: string; visibility: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface WholesaleMenuProps {
  searchQuery: string;
}

export function WholesaleMenu({ searchQuery }: WholesaleMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addItem } = useWholesaleCart();

  const { data: categories } = useQuery({
    queryKey: ["wholesale-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("active", true)
        .in("visibility", ["wholesale", "both"])
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["wholesale-products", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, category:categories(id, name, visibility)")
        .eq("active", true)
        .not("wholesale_price", "is", null)
        .order("sort_order");

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as Product[]).filter(
        (p) => p.category?.visibility === "wholesale" || p.category?.visibility === "both"
      );
    },
  });

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getQuantity = (productId: string, minimum: number) => {
    return quantities[productId] ?? minimum;
  };

  const updateQuantity = (productId: string, delta: number, minimum: number) => {
    setQuantities((prev) => {
      const current = prev[productId] ?? minimum;
      const newQty = Math.max(minimum, current + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = (product: Product) => {
    const quantity = getQuantity(product.id, product.wholesale_minimum || 1);
    const minimum = product.wholesale_minimum || 1;

    if (quantity < minimum) {
      toast.error(`Minimum order quantity is ${minimum}`);
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      wholesalePrice: product.wholesale_price || 0,
      quantity,
      minimumQuantity: minimum,
      image: product.images?.[0],
    });

    toast.success(`Added ${quantity}x ${product.name} to cart`);
    setQuantities((prev) => ({ ...prev, [product.id]: minimum }));
  };

  const savings = (retail: number, wholesale: number | null) => {
    if (!wholesale || wholesale >= retail) return null;
    return Math.round(((retail - wholesale) / retail) * 100);
  };

  return (
    <div>
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "shrink-0 h-10 px-5 rounded-full text-sm font-medium transition-all",
            selectedCategory === null
              ? "bg-accent text-accent-foreground shadow-sm"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          All Products
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "shrink-0 h-10 px-5 rounded-full text-sm font-medium transition-all",
              selectedCategory === cat.id
                ? "bg-accent text-accent-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredProducts.map((product, index) => {
            const minimum = product.wholesale_minimum || 1;
            const quantity = getQuantity(product.id, minimum);
            const pctOff = savings(product.retail_price, product.wholesale_price);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="group rounded-2xl border border-border bg-card shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:border-accent/25 transition-all duration-300"
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    {product.images?.[0] ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {pctOff && (
                          <div className="absolute top-1 right-1 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            -{pctOff}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-secondary shrink-0 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-accent text-lg leading-none">
                          ${product.wholesale_price?.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ${product.retail_price.toFixed(2)}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                          Min {minimum}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Add */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
                    <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => updateQuantity(product.id, -1, minimum)}
                        disabled={quantity <= minimum}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-semibold tabular-nums">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => updateQuantity(product.id, 1, minimum)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 min-w-[8rem] h-10 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold rounded-xl transition-all"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="h-20 w-20 rounded-3xl bg-secondary mx-auto mb-5 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/25" />
          </div>
          <p className="font-medium text-muted-foreground">
            {searchQuery ? "No products match your search" : "No wholesale products available"}
          </p>
        </div>
      )}
    </div>
  );
}
