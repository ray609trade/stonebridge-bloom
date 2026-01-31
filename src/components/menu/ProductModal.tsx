import { useState } from "react";
import { X, Minus, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";

interface ProductOption {
  name: string;
  type: "single" | "multiple";
  required?: boolean;
  choices: { label: string; price?: number }[];
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

  const options = Array.isArray(product.options) ? product.options as ProductOption[] : [];

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
        const choice = option.choices.find((c) => c.label === selected);
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

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-background rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="overflow-y-auto max-h-[90vh]">
            {/* Image */}
            <div className="relative aspect-video bg-secondary">
              <img
                src={image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                {product.category?.name && (
                  <Badge variant="secondary" className="mb-2">
                    {product.category.name}
                  </Badge>
                )}
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="text-muted-foreground">{product.description}</p>
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
                      className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
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
                        {option.choices.map((choice) => (
                          <button
                            key={choice.label}
                            onClick={() => handleOptionSelect(option.name, choice.label)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                              selectedOptions[option.name] === choice.label
                                ? "border-accent bg-accent/10 text-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-accent/50"
                            }`}
                          >
                            {selectedOptions[option.name] === choice.label && (
                              <Check className="h-4 w-4 text-accent" />
                            )}
                            <span>{choice.label}</span>
                            {choice.price && choice.price > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +${choice.price.toFixed(2)}
                              </span>
                            )}
                          </button>
                        ))}
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
                  className="resize-none"
                  rows={2}
                />
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
