import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, CreditCard, Banknote } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { checkoutFormSchema, validateForm } from "@/lib/validation";
import { logError, getUserFriendlyError } from "@/lib/errorUtils";

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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupType: "pickup" as "pickup" | "dine_in",
    pickupTime: "",
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
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Add some delicious items to get started!
            </p>
            <Button asChild>
              <Link to="/order">Browse Menu</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/order">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">
                  Checkout
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-xl font-semibold text-foreground">
                      Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Order Type */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-xl font-semibold text-foreground">
                      Order Type
                    </h2>
                    <RadioGroup
                      value={formData.pickupType}
                      onValueChange={(v) => setFormData({ ...formData, pickupType: v as "pickup" | "dine_in" })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-accent transition-colors">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="cursor-pointer flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Pickup
                        </Label>
                      </div>
                      <div className="flex items-center gap-2 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-accent transition-colors">
                        <RadioGroupItem value="dine_in" id="dine_in" />
                        <Label htmlFor="dine_in" className="cursor-pointer flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Dine-in
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Pickup Time */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-xl font-semibold text-foreground">
                      Pickup Time
                    </h2>
                    <Select
                      value={formData.pickupTime}
                      onValueChange={(v) => setFormData({ ...formData, pickupTime: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-xl font-semibold text-foreground">
                      Payment Method
                    </h2>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(v) => setFormData({ ...formData, paymentMethod: v as "pay_at_pickup" | "card" })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-accent transition-colors">
                        <RadioGroupItem value="pay_at_pickup" id="pay_at_pickup" />
                        <Label htmlFor="pay_at_pickup" className="cursor-pointer flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          Pay at Pickup
                        </Label>
                      </div>
                      <div className="flex items-center gap-2 p-4 rounded-lg border border-border bg-card cursor-pointer hover:border-accent/50 transition-colors opacity-50">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className="cursor-pointer flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          Card (Coming Soon)
                        </Label>
                      </div>
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
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-amber-dark text-accent-foreground font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Placing Order..." : `Place Order · $${total.toFixed(2)}`}
                  </Button>
                </form>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="sticky top-24 p-6 rounded-xl bg-card border border-border"
              >
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
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
