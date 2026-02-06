import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Truck, Clock, DollarSign, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { wholesaleAccountSchema, validateForm } from "@/lib/validation";
import { logError, getUserFriendlyError } from "@/lib/errorUtils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Honeypot field for bot detection
  const [honeypot, setHoneypot] = useState("");
  const isMobile = useIsMobile();

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
    
    // Check honeypot - bots will fill this hidden field
    if (honeypot) {
      // Silently reject bot submissions
      setIsSubmitted(true);
      return;
    }

    // Validate form data
    const validation = validateForm(wholesaleAccountSchema, formData);
    if (!validation.success) {
      setFieldErrors((validation as { success: false; errors: Record<string, string> }).errors);
      toast.error("Please fix the errors in the form");
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);

    try {
      const validatedData = validation.data;
      
      // Build notes safely - already validated and length-limited
      const notesContent = [
        validatedData.volume && `Volume: ${validatedData.volume}`,
        validatedData.preference && `Preference: ${validatedData.preference}`,
        validatedData.notes,
      ].filter(Boolean).join(". ");

      const { error } = await supabase.from("wholesale_accounts").insert({
        business_name: validatedData.businessName,
        contact_name: validatedData.contactName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address || null,
        notes: notesContent || null,
        status: "pending",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      logError("Wholesale.handleSubmit", error);
      toast.error(getUserFriendlyError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <CartDrawer />

      <main className="pt-14 md:pt-20">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-espresso-dark" />
          {!isMobile && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl animate-float" />
            </div>
          )}

          <div className="relative z-10 container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground mb-4 md:mb-6">
                Wholesale Partnership
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
                Partner with Stonebridge to bring fresh, handcrafted bagels to your cafe, 
                restaurant, or business. Quality products with reliable service.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-4 md:p-6 rounded-xl bg-card border border-border"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent/10 mb-3 md:mb-4">
                    <benefit.icon className="h-6 w-6 md:h-7 md:w-7 text-accent" />
                  </div>
                  <h3 className="font-serif text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8 md:mb-12"
              >
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3 md:mb-4">
                  Request a Wholesale Account
                </h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Fill out the form below and we'll be in touch within 1-2 business days.
                </p>
              </motion.div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-8 md:p-12 rounded-xl bg-card border border-border"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-2">
                    Application Received!
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
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
                  className="space-y-5 md:space-y-6 p-5 md:p-8 rounded-xl bg-card border border-border"
                >
                  {/* Honeypot field - hidden from users, bots will fill it */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute -left-[9999px] opacity-0 h-0 w-0"
                    aria-hidden="true"
                  />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        required
                        maxLength={100}
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className={`h-12 ${fieldErrors.businessName ? "border-red-500" : ""}`}
                      />
                      {fieldErrors.businessName && (
                        <p className="text-sm text-red-500">{fieldErrors.businessName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        required
                        maxLength={100}
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className={`h-12 ${fieldErrors.contactName ? "border-red-500" : ""}`}
                      />
                      {fieldErrors.contactName && (
                        <p className="text-sm text-red-500">{fieldErrors.contactName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        maxLength={255}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`h-12 ${fieldErrors.email ? "border-red-500" : ""}`}
                      />
                      {fieldErrors.email && (
                        <p className="text-sm text-red-500">{fieldErrors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        maxLength={20}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`h-12 ${fieldErrors.phone ? "border-red-500" : ""}`}
                      />
                      {fieldErrors.phone && (
                        <p className="text-sm text-red-500">{fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      maxLength={500}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`h-12 ${fieldErrors.address ? "border-red-500" : ""}`}
                    />
                    {fieldErrors.address && (
                      <p className="text-sm text-red-500">{fieldErrors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="volume">Estimated Weekly Volume</Label>
                      <Select
                        value={formData.volume}
                        onValueChange={(v) => setFormData({ ...formData, volume: v })}
                      >
                        <SelectTrigger className="h-12">
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
                        <SelectTrigger className="h-12">
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
                      maxLength={1000}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className={`min-h-[100px] ${fieldErrors.notes ? "border-red-500" : ""}`}
                    />
                    {fieldErrors.notes && (
                      <p className="text-sm text-red-500">{fieldErrors.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formData.notes.length}/1000 characters</p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-amber-dark text-accent-foreground font-semibold h-14 text-base active:scale-[0.98] transition-transform touch-manipulation"
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
      <MobileBottomNav />
    </div>
  );
}
