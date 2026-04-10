import { useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  retail_price: number;
  images: string[] | null;
  dietary_tags: string[] | null;
  options?: unknown;
  category?: { name: string } | null;
}

interface ProductCardProps {
  product: Product;
  className?: string;
  onSelect?: () => void;
}

export function ProductCard({ product, className, onSelect }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const hasOptions = Array.isArray(product.options) && (product.options as unknown[]).length > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasOptions && onSelect) {
      onSelect();
      return;
    }

    setIsAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.retail_price,
      quantity: 1,
      image: product.images?.[0],
    });
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <motion.div
      className={cn(
        "group relative flex items-center gap-4 rounded-xl bg-card border border-border p-4 md:p-5 cursor-pointer touch-manipulation transition-all duration-200",
        "hover:shadow-card-hover hover:border-accent/30",
        "active:scale-[0.99]",
        className
      )}
      onClick={onSelect}
      whileTap={{ scale: 0.99 }}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Category label */}
        {product.category?.name && (
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            {product.category.name}
          </span>
        )}

        {/* Name & Price row */}
        <div className="flex items-baseline justify-between gap-3 mt-0.5">
          <h3 className="font-serif text-base md:text-lg font-medium text-foreground truncate">
            {product.name}
          </h3>
          <span className="font-semibold text-base text-foreground whitespace-nowrap bg-accent/10 px-2.5 py-0.5 rounded-md shrink-0">
            ${product.retail_price.toFixed(2)}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">
            {product.description}
          </p>
        )}

        {/* Dietary Tags */}
        {product.dietary_tags && product.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {product.dietary_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Button */}
      <Button
        size="icon"
        className={cn(
          "shrink-0 rounded-full shadow-sm transition-all duration-200",
          "bg-accent hover:bg-amber-dark text-accent-foreground",
          "h-11 w-11 md:h-10 md:w-10",
          "active:scale-90",
          isAdding && "scale-110"
        )}
        onClick={handleQuickAdd}
      >
        {isAdding ? (
          <ShoppingBag className="h-5 w-5" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
      </Button>
    </motion.div>
  );
}
