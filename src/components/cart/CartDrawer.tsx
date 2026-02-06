import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/hooks/useCart";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, updateQuantity, removeItem } = useCart();
  const isMobile = useIsMobile();

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="cart-drawer-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer - Full screen on mobile, side drawer on desktop */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-0 right-0 h-full bg-background shadow-2xl z-50 flex flex-col",
              isMobile ? "w-full" : "w-full max-w-md"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border safe-area-top">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="font-serif text-xl font-semibold">Your Order</h2>
                {items.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({items.reduce((acc, item) => acc + item.quantity, 0)} items)
                  </span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeCart}
                className="h-10 w-10 touch-target"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="font-serif text-lg font-medium mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Add some delicious bagels to get started!
                </p>
                <Button 
                  onClick={closeCart} 
                  className="h-12 px-6 touch-target"
                  asChild
                >
                  <Link to="/order">Browse Menu</Link>
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-3 p-3 rounded-xl bg-secondary/50"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 md:w-20 md:h-20 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm md:text-base truncate">{item.name}</h4>
                          {item.options && Object.entries(item.options).length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {Object.values(item.options).join(", ")}
                            </p>
                          )}
                          <p className="font-semibold text-sm md:text-base mt-1">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          
                          {/* Quantity Controls - Larger on mobile */}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 md:h-8 md:w-8 touch-target active:scale-95 transition-transform"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 md:h-8 md:w-8 touch-target active:scale-95 transition-transform"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 md:h-8 md:w-8 ml-auto text-destructive hover:text-destructive touch-target active:scale-95 transition-transform"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Footer - Sticky checkout */}
                <div className="p-4 border-t border-border space-y-4 safe-area-bottom bg-background">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tax calculated at checkout
                  </p>
                  <Button 
                    className="w-full h-14 text-base font-semibold bg-accent hover:bg-amber-dark text-accent-foreground active:scale-[0.98] transition-transform touch-manipulation" 
                    asChild 
                    onClick={closeCart}
                  >
                    <Link to="/order/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
