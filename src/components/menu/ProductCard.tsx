import { useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isMobile = useIsMobile();

  // Check if product has options that need selection
  const hasOptions = Array.isArray(product.options) && (product.options as unknown[]).length > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If product has options, open modal instead of quick-adding
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

  const image = product.images?.[0] || "/placeholder.svg";

  return (
    <motion.div
      className={cn(
        "group relative rounded-xl overflow-hidden bg-card border border-border transition-all duration-300 cursor-pointer touch-manipulation",
        isHovered && !isMobile && "shadow-card-hover -translate-y-1",
        "active:scale-[0.98]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] md:aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Quick Add Button - Always visible on mobile */}
        <Button
          size="icon"
          className={cn(
            "absolute bottom-3 right-3 rounded-full shadow-lg transition-all duration-300",
            "bg-accent hover:bg-amber-dark text-accent-foreground",
            "h-12 w-12 md:h-10 md:w-10", // Larger on mobile
            "active:scale-90",
            isMobile 
              ? "opacity-100" 
              : isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            isAdding && "scale-110"
          )}
          onClick={handleQuickAdd}
        >
          {isAdding ? (
            <ShoppingBag className="h-5 w-5 md:h-5 md:w-5" />
          ) : (
            <Plus className="h-6 w-6 md:h-5 md:w-5" />
          )}
        </Button>

        {/* Category Badge */}
        {product.category?.name && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-xs"
          >
            {product.category.name}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-base md:text-lg font-medium text-foreground line-clamp-1">
            {product.name}
          </h3>
          <span className="font-semibold text-base md:text-base text-foreground whitespace-nowrap bg-accent/10 px-2 py-0.5 rounded-md">
            ${product.retail_price.toFixed(2)}
          </span>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Dietary Tags */}
        {product.dietary_tags && product.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
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
    </motion.div>
  );
}
