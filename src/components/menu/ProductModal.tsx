import { useState } from "react";
import { X, Minus, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ProductOptionChoice {
  name?: string;
  label?: string;
  price?: number;
}

interface ProductOption {
  name: string;
  type: "single" | "multiple";
  required?: boolean;
  choices: ProductOptionChoice[];
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  retail_price: number;
  images: string[] | null;
  dietary_tags: string[] | null;
  options: ProductOption[] | null;
  category?: { name: string } | null;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const isMobile = useIsMobile();

  const options = Array.isArray(product.options) ? product.options as ProductOption[] : [];

  // Helper to get the display label for a choice (supports both 'name' and 'label' fields)
  const getChoiceLabel = (choice: ProductOptionChoice) => choice.label || choice.name || '';

  const handleOptionSelect = (optionName: string, choice: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: choice,
    }));
  };

  const calculateTotal = () => {
    let total = product.retail_price;
    options.forEach((option) => {
      const selected = selectedOptions[option.name];
      if (selected) {
        const choice = option.choices.find((c) => getChoiceLabel(c) === selected);
        if (choice?.price) {
          total += choice.price;
        }
      }
    });
    return total * quantity;
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: calculateTotal() / quantity,
      quantity,
      options: selectedOptions,
      image: product.images?.[0],
    });
    onClose();
  };

  const image = product.images?.[0] || "/placeholder.svg";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal - Full height bottom sheet on mobile */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? "100%" : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isMobile ? "100%" : 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative w-full bg-background overflow-hidden shadow-2xl",
            isMobile 
              ? "h-[95vh] rounded-t-3xl" 
              : "max-w-2xl max-h-[90vh] rounded-2xl"
          )}
        >
          {/* Drag indicator for mobile */}
          {isMobile && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/30 rounded-full z-20" />
          )}

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm h-10 w-10 touch-target"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="overflow-y-auto h-full pb-24 md:pb-0">
            {/* Image */}
            <div className="relative aspect-[16/10] md:aspect-video bg-secondary">
              <img
                src={image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-5 md:p-6">
              {/* Header */}
              <div className="mb-6">
                {product.category?.name && (
                  <Badge variant="secondary" className="mb-2">
                    {product.category.name}
                  </Badge>
                )}
                <h2 className="font-serif text-2xl md:text-2xl font-semibold text-foreground mb-2">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="text-muted-foreground text-sm md:text-base">{product.description}</p>
                )}
                <p className="text-xl font-semibold text-foreground mt-2">
                  ${product.retail_price.toFixed(2)}
                </p>
              </div>

              {/* Dietary Tags */}
              {product.dietary_tags && product.dietary_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.dietary_tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Options */}
              {options.length > 0 && (
                <div className="space-y-6 mb-6">
                  {options.map((option) => (
                    <div key={option.name}>
                      <h3 className="font-medium text-foreground mb-3">
                        {option.name}
                        {option.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {option.choices.map((choice) => {
                          const choiceLabel = getChoiceLabel(choice);
                          return (
                            <button
                              key={choiceLabel}
                              onClick={() => handleOptionSelect(option.name, choiceLabel)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-3 md:py-2 rounded-xl md:rounded-lg border transition-all touch-target",
                                "active:scale-95 touch-manipulation",
                                selectedOptions[option.name] === choiceLabel
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              )}
                            >
                              {selectedOptions[option.name] === choiceLabel && (
                                <Check className="h-4 w-4 text-accent" />
                              )}
                              <span className="text-sm md:text-sm">{choiceLabel}</span>
                              {choice.price && choice.price > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  +${choice.price.toFixed(2)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Special Instructions */}
              <div className="mb-6">
                <h3 className="font-medium text-foreground mb-3">
                  Special Instructions
                </h3>
                <Textarea
                  placeholder="Any allergies or special requests?"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="resize-none min-h-[80px]"
                  rows={2}
                />
              </div>

              {/* Desktop: Quantity & Add to Cart */}
              <div className="hidden md:flex items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3 bg-secondary rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="flex-1 h-12 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold"
                  onClick={handleAddToCart}
                >
                  Add to Order · ${calculateTotal().toFixed(2)}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile: Sticky footer */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom">
            <div className="flex items-center gap-3">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-secondary rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 touch-target active:scale-95"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 touch-target active:scale-95"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="flex-1 h-14 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold text-base active:scale-[0.98] transition-transform touch-manipulation"
                onClick={handleAddToCart}
              >
                Add · ${calculateTotal().toFixed(2)}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
