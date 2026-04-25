import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import stonebridgeLogo from "@/assets/stonebridge-logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/order", label: "Order" },
  { href: "/wholesale", label: "Bulk Orders" },
  { href: "/admin/login", label: "Admin" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { itemCount, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isHomePage = location.pathname === "/";
  const isOrderPage = location.pathname === "/order" || location.pathname.startsWith("/order/");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || !isHomePage
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-14 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.img
              src={stonebridgeLogo}
              alt="Stonebridge Bagels"
              className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : isScrolled || !isHomePage
                    ? "text-foreground hover:bg-secondary"
                    : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Order Now Button - shown when scrolled or not on order page */}
            {!isOrderPage && (
              <Button
                size="sm"
                className="md:hidden bg-accent hover:bg-amber-dark text-accent-foreground font-semibold h-9 px-3 text-xs"
                asChild
              >
                <Link to="/order">
                  Order
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className={cn(
                "relative h-10 w-10 touch-target",
                isScrolled || !isHomePage
                  ? "text-foreground hover:bg-secondary"
                  : "text-primary-foreground hover:bg-white/10"
              )}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "md:hidden h-10 w-10 touch-target",
                isScrolled || !isHomePage
                  ? "text-foreground hover:bg-secondary"
                  : "text-primary-foreground hover:bg-white/10"
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-14 bg-background z-40"
          >
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "flex items-center px-4 py-4 rounded-xl text-lg font-medium transition-colors touch-target",
                      location.pathname === link.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary active:bg-secondary"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              {/* CTA in mobile menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-6"
              >
                <Button
                  size="lg"
                  className="w-full bg-accent hover:bg-amber-dark text-accent-foreground font-semibold h-14 text-lg"
                  asChild
                >
                  <Link to="/order">
                    Order Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
