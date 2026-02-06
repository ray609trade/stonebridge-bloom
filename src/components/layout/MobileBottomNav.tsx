import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingBag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/order", icon: UtensilsCrossed, label: "Order" },
  { href: "#cart", icon: ShoppingBag, label: "Cart", isCart: true },
  { href: "/about", icon: Menu, label: "More" },
];

export const MobileBottomNav = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
    const location = useLocation();
    const { itemCount, toggleCart } = useCart();

    return (
      <nav 
        ref={ref}
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom"
        {...props}
      >
        <div className="flex items-stretch justify-around h-16">
          {navItems.map((item) => {
            const isActive = item.href === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.href) && !item.isCart;
            
            if (item.isCart) {
              return (
                <button
                  key={item.label}
                  onClick={toggleCart}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 gap-1 relative",
                    "active:scale-95 transition-transform touch-manipulation",
                    "text-muted-foreground"
                  )}
                >
                  <div className="relative">
                    <item.icon className="h-6 w-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                        {itemCount > 9 ? "9+" : itemCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 gap-1",
                  "active:scale-95 transition-all touch-manipulation",
                  isActive 
                    ? "text-accent" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive && "fill-accent/20")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }
);

MobileBottomNav.displayName = "MobileBottomNav";
