import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Truck, FileText, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { WholesaleCartProvider, useWholesaleCart } from "@/hooks/useWholesaleCart";

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

function WholesaleCheckoutContent() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, validateMinimums } = useWholesaleCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
  });
  const [notes, setNotes] = useState("");

  // Get user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/wholesale/login");
        return;
      }
      setUser(session.user);
    };
    getSession();
  }, [navigate]);

  // Get wholesale account
  const { data: account, isLoading } = useQuery({
    queryKey: ["wholesale-account-checkout", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("wholesale_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .single();
      if (error) throw error;
      
      // Pre-fill shipping address if available
      if (data.shipping_address && typeof data.shipping_address === 'object' && !Array.isArray(data.shipping_address)) {
        const addr = data.shipping_address as Record<string, unknown>;
        setShippingAddress({
          street: (addr.street as string) || "",
          city: (addr.city as string) || "",
          state: (addr.state as string) || "",
          zip: (addr.zip as string) || "",
          country: (addr.country as string) || "USA",
        });
      }
      
      return data;
    },
    enabled: !!user,
  });

  const tax = 0; // Wholesale orders typically tax exempt
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const { valid, invalidItems } = validateMinimums();
    if (!valid) {
      toast.error(`Minimum quantities not met for: ${invalidItems.join(", ")}`);
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      toast.error("Please fill in all shipping address fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.wholesalePrice,
        options: item.options,
      }));

      const { data, error } = await supabase.from("orders").insert([{
        order_type: "wholesale" as const,
        customer_name: account?.contact_name || "",
        customer_email: account?.email || "",
        customer_phone: account?.phone || null,
        user_id: user.id,
        wholesale_account_id: account?.id,
        items: orderItems,
        subtotal,
        tax,
        total,
        ship_to_address: shippingAddress as { street: string; city: string; state: string; zip: string; country: string },
        payment_method: "invoice",
        payment_status: "pending",
        notes: notes || null,
        status: "pending" as const,
      }]).select().single();

      if (error) throw error;

      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order/confirmation/${data.order_number}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS = [
    { key: "account", label: "Account", icon: Building2 },
    { key: "shipping", label: "Shipping", icon: Truck },
    { key: "review", label: "Review", icon: FileText },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="pt-24 md:pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-2xl font-semibold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              Please login to your wholesale account to checkout.
            </p>
            <Button asChild>
              <Link to="/wholesale/login">Login</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="pt-24 md:pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-2xl font-semibold mb-4">Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">
              Add products to your cart before checking out.
            </p>
            <Button asChild>
              <Link to="/wholesale/portal">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead
        title="Wholesale Checkout"
        description="Complete your bulk bagel order from Stonebridge Bagels & Deli. Review items, confirm shipping, and place your wholesale order."
        path="/wholesale/checkout"
      />
      <Header />

      <main className="pt-20 md:pt-24 pb-32 md:pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <Button variant="ghost" className="mb-4 md:mb-6 -ml-2" asChild>
            <Link to="/wholesale/portal">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portal
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                  Wholesale Checkout
                </h1>

                {/* Step Indicators */}
                <div className="flex items-center gap-2 mb-6 md:mb-8">
                  {STEPS.map((step, i) => (
                    <div key={step.key} className="flex items-center gap-2 flex-1">
                      <div className={cn(
                        "flex items-center gap-2 px-3 h-10 rounded-xl text-sm font-medium flex-1 justify-center transition-colors",
                        "bg-accent/10 text-accent border border-accent/20"
                      )}>
                        <step.icon className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">{step.label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="w-2 sm:w-4 h-px bg-border shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                  {/* Account Info */}
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-[var(--card-shadow)]">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="h-5 w-5 text-accent" />
                      <h2 className="font-serif text-lg font-semibold">Account</h2>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{account.business_name}</p>
                      <p className="text-muted-foreground">{account.contact_name}</p>
                      <p className="text-muted-foreground">{account.email}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-accent" />
                      <h2 className="font-serif text-lg md:text-xl font-semibold">Shipping Address</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          required
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            required
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            required
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            className="h-12"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="zip">ZIP Code *</Label>
                          <Input
                            id="zip"
                            required
                            value={shippingAddress.zip}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={shippingAddress.country}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                            className="h-12"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-accent" />
                      <h2 className="font-serif text-lg md:text-xl font-semibold">Payment</h2>
                    </div>
                    <div className="p-5 rounded-2xl border-2 border-accent bg-accent/10 shadow-[var(--card-shadow)]">
                      <p className="font-medium">Pay by Invoice</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Net 30 terms. Invoice will be sent to your email after order confirmation.
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Special delivery instructions or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="min-h-[100px] text-base"
                    />
                  </div>

                  {/* Submit Button - Desktop */}
                  <Button
                    type="submit"
                    size="lg"
                    className="hidden md:flex w-full bg-accent hover:bg-amber-dark text-accent-foreground font-semibold h-14"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Placing Order..." : `Place Order · $${total.toFixed(2)}`}
                  </Button>
                </form>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:sticky lg:top-24"
              >
                {/* Mobile Collapsible */}
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowOrderSummary(!showOrderSummary)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border"
                  >
                    <span className="font-serif text-lg font-semibold">
                      Order Summary ({items.length} items)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">${total.toFixed(2)}</span>
                      {showOrderSummary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>

                  {showOrderSummary && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-2 p-4 rounded-xl bg-card border border-border"
                    >
                      <div className="space-y-3 mb-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-muted-foreground">
                                {item.quantity} × ${item.wholesalePrice.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium">
                              ${(item.wholesalePrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Desktop Summary */}
                <div className="hidden lg:block p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">
                            {item.quantity} × ${item.wholesalePrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(item.wholesalePrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-sm text-muted-foreground">Calculated after</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border md:hidden z-30">
        <Button
          type="submit"
          form="checkout-form"
          onClick={handleSubmit}
          className="w-full h-14 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Placing Order..." : `Place Order · $${total.toFixed(2)}`}
        </Button>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function WholesaleCheckout() {
  return (
    <WholesaleCartProvider>
      <WholesaleCheckoutContent />
    </WholesaleCartProvider>
  );
}
