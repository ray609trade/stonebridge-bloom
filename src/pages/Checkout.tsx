import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, CreditCard, Banknote, ChevronDown, ChevronUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { checkoutFormSchema, validateForm } from "@/lib/validation";
import { logError, getUserFriendlyError } from "@/lib/errorUtils";
import { cn } from "@/lib/utils";

const timeSlots = [
  "ASAP (15-20 min)",
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupType: "pickup" as "pickup" | "dine_in",
    pickupTime: "ASAP (15-20 min)",
    paymentMethod: "pay_at_pickup" as "pay_at_pickup" | "card",
    notes: "",
  });

  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate form data
    const validation = validateForm(checkoutFormSchema, formData);
    if (!validation.success) {
      setFieldErrors((validation as { success: false; errors: Record<string, string> }).errors);
      toast.error("Please fix the errors in the form");
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);

    try {
      const validatedData = validation.data;
      
      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        options: item.options,
      }));

      const { data, error } = await supabase.from("orders").insert({
        order_type: "retail",
        customer_name: validatedData.name,
        customer_email: validatedData.email,
        customer_phone: validatedData.phone,
        items: orderItems,
        subtotal,
        tax,
        total,
        pickup_type: validatedData.pickupType,
        scheduled_time: validatedData.pickupTime === "ASAP (15-20 min)" ? null : new Date().toISOString(),
        payment_method: validatedData.paymentMethod,
        notes: validatedData.notes || null,
        status: "pending",
      }).select().single();

      if (error) throw error;

      clearCart();
      navigate(`/order/confirmation/${data.order_number}`);
    } catch (error: any) {
      logError("Checkout.handleSubmit", error);
      toast.error(getUserFriendlyError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="pt-24 md:pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Add some delicious items to get started!
            </p>
            <Button asChild className="h-12 px-8">
              <Link to="/order">Browse Menu</Link>
            </Button>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="pt-20 md:pt-24 pb-8 md:pb-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-4 md:mb-6 -ml-2" asChild>
            <Link to="/order">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
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
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 md:mb-8">
                  Checkout
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground">
                      Contact Information
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 md:h-11 text-base"
                        />
                        {fieldErrors.name && (
                          <p className="text-sm text-destructive">{fieldErrors.name}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-12 md:h-11 text-base"
                          />
                          {fieldErrors.phone && (
                            <p className="text-sm text-destructive">{fieldErrors.phone}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-12 md:h-11 text-base"
                          />
                          {fieldErrors.email && (
                            <p className="text-sm text-destructive">{fieldErrors.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Type - Large tappable cards */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground">
                      Order Type
                    </h2>
                    <RadioGroup
                      value={formData.pickupType}
                      onValueChange={(v) => setFormData({ ...formData, pickupType: v as "pickup" | "dine_in" })}
                      className="grid grid-cols-2 gap-3"
                    >
                      <label
                        htmlFor="pickup"
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all touch-target",
                          "active:scale-[0.98] touch-manipulation",
                          formData.pickupType === "pickup"
                            ? "border-accent bg-accent/10"
                            : "border-border bg-card hover:border-accent/50"
                        )}
                      >
                        <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                        <MapPin className="h-6 w-6 text-accent" />
                        <span className="font-medium">Pickup</span>
                      </label>
                      <label
                        htmlFor="dine_in"
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all touch-target",
                          "active:scale-[0.98] touch-manipulation",
                          formData.pickupType === "dine_in"
                            ? "border-accent bg-accent/10"
                            : "border-border bg-card hover:border-accent/50"
                        )}
                      >
                        <RadioGroupItem value="dine_in" id="dine_in" className="sr-only" />
                        <Clock className="h-6 w-6 text-accent" />
                        <span className="font-medium">Dine-in</span>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* Pickup Time - Horizontal scroll pills on mobile */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground">
                      Pickup Time
                    </h2>
                    <div className="flex flex-wrap gap-2 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setFormData({ ...formData, pickupTime: slot })}
                          className={cn(
                            "shrink-0 px-4 py-3 rounded-xl border text-sm font-medium transition-all touch-target",
                            "active:scale-95 touch-manipulation",
                            formData.pickupTime === slot
                              ? "border-accent bg-accent/10 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-accent/50"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {fieldErrors.pickupTime && (
                      <p className="text-sm text-destructive">{fieldErrors.pickupTime}</p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground">
                      Payment Method
                    </h2>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(v) => setFormData({ ...formData, paymentMethod: v as "pay_at_pickup" | "card" })}
                      className="grid grid-cols-2 gap-3"
                    >
                      <label
                        htmlFor="pay_at_pickup"
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all touch-target",
                          "active:scale-[0.98] touch-manipulation",
                          formData.paymentMethod === "pay_at_pickup"
                            ? "border-accent bg-accent/10"
                            : "border-border bg-card hover:border-accent/50"
                        )}
                      >
                        <RadioGroupItem value="pay_at_pickup" id="pay_at_pickup" className="sr-only" />
                        <Banknote className="h-6 w-6 text-accent" />
                        <span className="font-medium text-center text-sm">Pay at Pickup</span>
                      </label>
                      <label
                        htmlFor="card"
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-not-allowed transition-all opacity-50",
                          "border-border bg-card"
                        )}
                      >
                        <RadioGroupItem value="card" id="card" disabled className="sr-only" />
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                        <span className="font-medium text-center text-sm text-muted-foreground">Card (Soon)</span>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or allergies?"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

            {/* Order Summary - Collapsible on mobile */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:sticky lg:top-24"
              >
                {/* Mobile: Collapsible Summary */}
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowOrderSummary(!showOrderSummary)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border touch-target"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg font-semibold">Order Summary</span>
                      <span className="text-sm text-muted-foreground">({items.length} items)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">${total.toFixed(2)}</span>
                      {showOrderSummary ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
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
                              <p className="text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax (8%)</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Desktop: Full Summary */}
                <div className="hidden lg:block p-6 rounded-xl bg-card border border-border">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile: Sticky Submit Button */}
          <div className="md:hidden fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom z-30">
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full h-14 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold text-base active:scale-[0.98] transition-transform touch-manipulation"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Placing Order..." : `Place Order · $${total.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
