import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Truck, Clock, DollarSign, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const benefits = [
  {
    icon: DollarSign,
    title: "Wholesale Pricing",
    description: "Competitive tiered pricing based on order volume.",
  },
  {
    icon: Clock,
    title: "Recurring Orders",
    description: "Set up weekly or daily standing orders for convenience.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Fresh delivery to your location on your schedule.",
  },
  {
    icon: Building2,
    title: "Net Terms",
    description: "Invoice-based payment options for approved accounts.",
  },
];

export default function Wholesale() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    volume: "",
    preference: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("wholesale_accounts").insert({
        business_name: formData.businessName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: `Volume: ${formData.volume}, Preference: ${formData.preference}. ${formData.notes}`,
        status: "pending",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-espresso-dark" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl animate-float" />
          </div>

          <div className="relative z-10 container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="font-serif text-5xl md:text-6xl font-semibold text-primary-foreground mb-6">
                Wholesale Partnership
              </h1>
              <p className="text-xl text-primary-foreground/80 leading-relaxed">
                Partner with Stonebridge to bring fresh, handcrafted bagels to your cafe, 
                restaurant, or business. Quality products with reliable service.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-6 rounded-xl bg-card border border-border"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
                    <benefit.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="font-serif text-4xl font-semibold text-foreground mb-4">
                  Request a Wholesale Account
                </h2>
                <p className="text-muted-foreground text-lg">
                  Fill out the form below and we'll be in touch within 1-2 business days.
                </p>
              </motion.div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-12 rounded-xl bg-card border border-border"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Application Received!
                  </h3>
                  <p className="text-muted-foreground">
                    Thank you for your interest. Our team will review your application and 
                    contact you within 1-2 business days.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 p-8 rounded-xl bg-card border border-border"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
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
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="volume">Estimated Weekly Volume</Label>
                      <Select
                        value={formData.volume}
                        onValueChange={(v) => setFormData({ ...formData, volume: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5 dozen">1-5 dozen</SelectItem>
                          <SelectItem value="5-15 dozen">5-15 dozen</SelectItem>
                          <SelectItem value="15-30 dozen">15-30 dozen</SelectItem>
                          <SelectItem value="30+ dozen">30+ dozen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preference">Preferred Method</Label>
                      <Select
                        value={formData.preference}
                        onValueChange={(v) => setFormData({ ...formData, preference: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="pickup">Pickup</SelectItem>
                          <SelectItem value="either">Either</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Information</Label>
                    <Textarea
                      id="notes"
                      placeholder="Tell us about your business and needs..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-amber-dark text-accent-foreground font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </motion.form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
