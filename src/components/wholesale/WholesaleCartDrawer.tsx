import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWholesaleCart } from "@/hooks/useWholesaleCart";
import { cn } from "@/lib/utils";

export function WholesaleCartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    removeItem,
    updateQuantity,
    validateMinimums,
  } = useWholesaleCart();

  const { valid, invalidItems } = validateMinimums();

  const handleCheckout = () => {
    if (!valid) {
      return;
    }
    closeCart();
    navigate("/wholesale/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Wholesale Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Add products from the menu to get started
            </p>
          </div>
        ) : (
          <>
            {/* Warning for minimum violations */}
            {!valid && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Minimum quantity not met</p>
                  <p className="text-xs text-destructive/80 mt-1">
                    Adjust quantities for: {invalidItems.join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const isInvalid = item.quantity < item.minimumQuantity;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={cn(
                        "flex gap-3 py-3 border-b border-border last:border-0",
                        isInvalid && "bg-destructive/5 -mx-4 px-4"
                      )}
                    >
                      {/* Product Image */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary shrink-0 flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${item.wholesalePrice.toFixed(2)} each
                            </p>
                            {isInvalid && (
                              <p className="text-xs text-destructive mt-1">
                                Min: {item.minimumQuantity}
                              </p>
                            )}
                          </div>
                          <p className="font-semibold text-sm shrink-0">
                            ${(item.wholesalePrice * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
              <Button
                onClick={handleCheckout}
                disabled={!valid}
                className="w-full h-12 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
