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

  // Fetch categories visible to wholesale
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

  // Fetch products with wholesale pricing
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

      // Filter to only products in wholesale-visible categories
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
    
    // Reset quantity to minimum after adding
    setQuantities((prev) => ({ ...prev, [product.id]: minimum }));
  };

  return (
    <div>
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="shrink-0 h-10 px-4 rounded-full text-sm"
        >
          All Products
        </Button>
        {categories?.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.id)}
            className="shrink-0 h-10 px-4 rounded-full text-sm"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => {
            const minimum = product.wholesale_minimum || 1;
            const quantity = getQuantity(product.id, minimum);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="p-4 rounded-xl border border-border bg-card hover:border-accent/50 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-secondary shrink-0 flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold text-accent">
                        ${product.wholesale_price?.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        ${product.retail_price.toFixed(2)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Min: {minimum}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Quantity & Add */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, -1, minimum)}
                      disabled={quantity <= minimum}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, 1, minimum)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-accent hover:bg-amber-dark text-accent-foreground"
                  >
                    Add to Cart
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{searchQuery ? "No products match your search" : "No wholesale products available"}</p>
        </div>
      )}
    </div>
  );
}
