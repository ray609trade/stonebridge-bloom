import { useState, useRef, useEffect, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  AlertCircle,
  Phone,
  Clock,
  User,
  Mail,
  Loader2,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCart, CartItem } from "@/hooks/useCart";
import { toast } from "sonner";

interface LookupOrder {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  pickup_type: string | null;
  scheduled_time: string | null;
  notes: string | null;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice?: number;
    price?: number;
    options?: Record<string, string>;
    image?: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
}

const ORDER_NUMBER_REGEX = /^SB-\d{6}-\d{4}$/i;

const orderNumberSchema = z
  .string()
  .trim()
  .min(1, "Please enter your order number.")
  .max(40, "That order number looks too long.")
  .regex(
    ORDER_NUMBER_REGEX,
    "Order numbers look like SB-YYMMDD-1234. Check your confirmation email or text."
  );

const emailSchema = z
  .string()
  .trim()
  .min(1, "Please enter your email address.")
  .email("That doesn't look like a valid email address.")
  .max(255, "Email must be less than 255 characters.");

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Received", tone: "bg-amber-100 text-amber-900 border-amber-200" },
  confirmed: { label: "Confirmed", tone: "bg-blue-100 text-blue-900 border-blue-200" },
  preparing: { label: "Preparing", tone: "bg-blue-100 text-blue-900 border-blue-200" },
  ready: { label: "Ready for pickup", tone: "bg-green-100 text-green-900 border-green-200" },
  completed: { label: "Picked up", tone: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", tone: "bg-red-100 text-red-900 border-red-200" },
};

function formatStatus(status: string) {
  return STATUS_LABELS[status] ?? { label: status, tone: "bg-muted text-muted-foreground border-border" };
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
}

function formatPickup(scheduled: string | null, pickupType: string | null) {
  const typeLabel = pickupType === "asap" ? "ASAP" : pickupType === "dine_in" ? "Dine in" : "Pickup";
  if (!scheduled) return typeLabel;
  const d = new Date(scheduled);
  const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${typeLabel} · ${date} at ${time}`;
}

export default function OrderLookup() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<1 | 2>(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupOrder | null>(null);
  const [reordering, setReordering] = useState(false);

  const orderInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from URL ?order=SB-... or ?email=...
  useEffect(() => {
    const o = searchParams.get("order");
    const e = searchParams.get("email");
    if (o) setOrderNumber(o.toUpperCase());
    if (e) setEmail(e);
  }, [searchParams]);

  // Focus management
  useEffect(() => {
    if (result) return;
    if (step === 1) orderInputRef.current?.focus();
    if (step === 2) emailInputRef.current?.focus();
  }, [step, result]);

  function handleStep1Submit(e: FormEvent) {
    e.preventDefault();
    const parsed = orderNumberSchema.safeParse(orderNumber);
    if (!parsed.success) {
      setOrderError(parsed.error.issues[0].message);
      return;
    }
    setOrderError(null);
    setOrderNumber(parsed.data.toUpperCase());
    setStep(2);
  }

  async function handleStep2Submit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const orderParse = orderNumberSchema.safeParse(orderNumber);
    if (!orderParse.success) {
      setOrderError(orderParse.error.issues[0].message);
      setStep(1);
      return;
    }
    const emailParse = emailSchema.safeParse(email);
    if (!emailParse.success) {
      setEmailError(emailParse.error.issues[0].message);
      return;
    }
    setEmailError(null);

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("lookup_guest_order", {
        p_order_number: orderParse.data,
        p_email: emailParse.data.toLowerCase(),
      });

      if (error) {
        console.error("Lookup error:", error);
        setSubmitError(
          "Something went wrong while looking up your order. Please try again or call us at (609) 738-3222."
        );
        return;
      }

      const row = Array.isArray(data) ? data[0] : null;
      if (!row) {
        setSubmitError(
          "We couldn't find an order with that number and email. Double-check both fields, or call us at (609) 738-3222."
        );
        return;
      }

      setResult(row as unknown as LookupOrder);
      setSubmitError(null);
    } catch (err) {
      console.error(err);
      setSubmitError(
        "Something went wrong while looking up your order. Please try again or call us at (609) 738-3222."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setStep(1);
    setOrderNumber("");
    setEmail("");
    setSubmitError(null);
    setOrderError(null);
    setEmailError(null);
  }

  function handleReorder() {
    if (!result) return;
    setReordering(true);
    try {
      let added = 0;
      result.items.forEach((it) => {
        const price = typeof it.unitPrice === "number" ? it.unitPrice : it.price ?? 0;
        if (!it.productId || !it.name) return;
        const cartItem: Omit<CartItem, "id"> = {
          productId: it.productId,
          name: it.name,
          price,
          quantity: it.quantity || 1,
          options: it.options,
          image: it.image,
        };
        addItem(cartItem);
        added += 1;
      });
      if (added === 0) {
        toast.error("We couldn't add these items to your cart. Please add them manually from the menu.");
        return;
      }
      toast.success(`${added} item${added === 1 ? "" : "s"} added to your cart`);
      navigate("/order/checkout");
    } finally {
      setReordering(false);
    }
  }

  const status = result ? formatStatus(result.status) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Look up your order — Stonebridge Bagels</title>
        <meta
          name="description"
          content="Check the status of your Stonebridge Bagels order. Enter your order number and the email used at checkout."
        />
      </Helmet>

      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-32 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            {/* Heading */}
            {!result && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4">
                  <Receipt className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
                  Look up your order
                </h1>
                <p className="text-muted-foreground">
                  Check your order status, see what you ordered, or reorder in one tap.
                </p>
              </div>
            )}

            {/* Form card */}
            {!result && (
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {/* Progress */}
                <div className="px-6 pt-6">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
                    <span>Step {step} of 2</span>
                    <span>{step === 1 ? "Order number" : "Email address"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent"
                      initial={false}
                      animate={{ width: step === 1 ? "50%" : "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Error banner */}
                {submitError && (
                  <div className="mx-6 mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.form
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleStep1Submit}
                      className="p-6"
                    >
                      <Label htmlFor="order-number" className="text-base font-medium">
                        What's your order number?
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Find this in your confirmation email or text. It looks like{" "}
                        <span className="font-mono text-foreground">SB-YYMMDD-1234</span>.
                      </p>
                      <Input
                        ref={orderInputRef}
                        id="order-number"
                        inputMode="text"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        placeholder="SB-260415-1234"
                        value={orderNumber}
                        onChange={(e) => {
                          setOrderNumber(e.target.value.toUpperCase());
                          if (orderError) setOrderError(null);
                        }}
                        className={`h-12 font-mono text-base ${orderError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                        aria-invalid={!!orderError}
                        aria-describedby={orderError ? "order-error" : undefined}
                      />
                      {orderError && (
                        <p id="order-error" className="mt-2 text-sm text-red-700 flex items-start gap-1.5">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{orderError}</span>
                        </p>
                      )}

                      <Button type="submit" size="lg" className="w-full mt-6 h-12">
                        Continue
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleStep2Submit}
                      className="p-6"
                    >
                      <Label htmlFor="email" className="text-base font-medium">
                        What email did you use at checkout?
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        We use this to confirm the order belongs to you. It must match what you entered when you placed
                        order <span className="font-mono text-foreground">{orderNumber}</span>.
                      </p>
                      <Input
                        ref={emailInputRef}
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError(null);
                        }}
                        className={`h-12 text-base ${emailError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? "email-error" : undefined}
                      />
                      {emailError && (
                        <p id="email-error" className="mt-2 text-sm text-red-700 flex items-start gap-1.5">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{emailError}</span>
                        </p>
                      )}

                      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="h-12 sm:flex-1"
                          onClick={() => {
                            setStep(1);
                            setSubmitError(null);
                          }}
                          disabled={loading}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                        <Button type="submit" size="lg" className="h-12 sm:flex-[2]" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Looking up your order...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Find my order
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Help text below form */}
            {!result && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                Need help? Call us at{" "}
                <a href="tel:+16097383222" className="text-accent hover:underline font-medium">
                  (609) 738-3222
                </a>
              </p>
            )}

            {/* Result view */}
            {result && status && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
                    Order found
                  </h1>
                  <p className="text-muted-foreground">
                    Order <span className="font-mono text-foreground">{result.order_number}</span>
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  {/* Status */}
                  <div className="px-5 sm:px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">Status</p>
                      <Badge variant="outline" className={`text-sm font-medium ${status.tone}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="sm:text-right min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">Pickup</p>
                      <p className="text-sm font-medium text-foreground flex items-center sm:justify-end gap-1.5">
                        <Clock className="h-4 w-4 text-accent shrink-0" />
                        <span className="truncate">{formatPickup(result.scheduled_time, result.pickup_type)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="px-5 sm:px-6 py-5 border-b border-border space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      <User className="h-4 w-4 shrink-0" />
                      <span className="text-foreground truncate">{result.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="text-foreground truncate">{result.customer_email}</span>
                    </div>
                    {result.customer_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span className="text-foreground truncate">{result.customer_phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="px-5 sm:px-6 py-5">
                    <h2 className="font-semibold text-foreground mb-3">Your items</h2>
                    <ul className="divide-y divide-border">
                      {result.items.map((it, idx) => {
                        const price = typeof it.unitPrice === "number" ? it.unitPrice : it.price ?? 0;
                        const qty = it.quantity || 1;
                        return (
                          <li key={`${it.productId}-${idx}`} className="py-3 flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">
                                <span className="text-muted-foreground mr-2">{qty}×</span>
                                {it.name}
                              </p>
                              {it.options && Object.keys(it.options).length > 0 && (
                                <p className="text-xs text-muted-foreground mt-0.5 break-words">
                                  {Object.entries(it.options)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground whitespace-nowrap">
                              {formatCurrency(price * qty)}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Totals */}
                  <div className="px-5 sm:px-6 py-5 border-t border-border space-y-1.5 text-sm bg-muted/30">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(result.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>{formatCurrency(result.tax)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-foreground pt-2 border-t border-border mt-2">
                      <span>Total</span>
                      <span>{formatCurrency(result.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions (desktop & tablet) */}
                <div className="hidden md:flex flex-wrap gap-3 mt-6">
                  <Button size="lg" className="h-12 flex-1 min-w-[200px]" onClick={handleReorder} disabled={reordering}>
                    {reordering ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Reorder these items
                  </Button>
                  <Button size="lg" variant="outline" className="h-12" onClick={handleReset}>
                    Look up another order
                  </Button>
                  <Button size="lg" variant="ghost" className="h-12" asChild>
                    <Link to="/order">Back to menu</Link>
                  </Button>
                </div>

                {/* Secondary actions (mobile, non-sticky) */}
                <div className="md:hidden mt-6 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-11" onClick={handleReset}>
                    Look up another
                  </Button>
                  <Button variant="ghost" className="h-11" asChild>
                    <Link to="/order">Back to menu</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky reorder bar (mobile, only when result is shown) */}
      {result && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Button
            size="lg"
            className="w-full h-12"
            onClick={handleReorder}
            disabled={reordering}
          >
            {reordering ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Reorder these items
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
}
