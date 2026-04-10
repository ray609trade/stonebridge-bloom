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
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    if (!valid) return;
    closeCart();
    navigate("/wholesale/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <ShoppingBag className="h-4.5 w-4.5 text-accent" />
            </div>
            <div>
              <span className="block text-base">Wholesale Cart</span>
              <span className="block text-xs font-normal text-muted-foreground">{itemCount} items</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="h-20 w-20 rounded-3xl bg-secondary flex items-center justify-center mb-5">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/25" />
            </div>
            <p className="font-medium text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add products from the menu to get started
            </p>
          </div>
        ) : (
          <>
            {/* Warning for minimum violations */}
            {!valid && (
              <div className="bg-destructive/8 border-b border-destructive/15 px-5 py-3 flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Minimum quantity not met</p>
                  <p className="text-xs text-destructive/70 mt-0.5">
                    Adjust: {invalidItems.join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
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
                        "flex gap-3 py-3.5 border-b border-border/60 last:border-0",
                        isInvalid && "bg-destructive/5 -mx-3 px-3 rounded-xl"
                      )}
                    >
                      {/* Product Image */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-secondary shrink-0 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ${item.wholesalePrice.toFixed(2)} each
                            </p>
                            {isInvalid && (
                              <p className="text-[10px] text-destructive font-medium mt-1">
                                Min: {item.minimumQuantity}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-sm shrink-0">
                            ${(item.wholesalePrice * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md"
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
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-5 space-y-4 bg-card/80">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-2xl font-bold text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
              <Button
                onClick={handleCheckout}
                disabled={!valid}
                className="w-full h-13 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold text-base rounded-xl shadow-[var(--amber-glow)] transition-all"
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
