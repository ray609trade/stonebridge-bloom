import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Clock, MapPin, Phone, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 md:pt-32 pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 text-green-600 mb-5 sm:mb-6">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-3 sm:mb-4">
              Order Confirmed!
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-1.5">
              Thank you for your order
            </p>
            <p className="text-xl sm:text-2xl font-semibold text-foreground mb-6 sm:mb-8 break-all">
              Order #{orderNumber}
            </p>

            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8 text-left shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
                What's Next?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">Preparation</p>
                    <p className="text-sm text-muted-foreground">
                      We're preparing your order fresh. You'll receive a text when it's ready.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">Pickup</p>
                    <p className="text-sm text-muted-foreground">
                      Head to the pickup counter and give us your order number.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">Questions?</p>
                    <p className="text-sm text-muted-foreground">
                      Call us at{" "}
                      <a href="tel:+16097383222" className="text-accent hover:underline">
                        (609) 738-3222
                      </a>{" "}
                      if you have any questions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lookup hint inside the card for visual cohesion */}
              <div className="mt-6 pt-5 border-t border-border flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                  <Search className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-foreground">Check on it later</p>
                  <p className="text-muted-foreground">
                    Save your order number and{" "}
                    <Link
                      to={`/order/lookup?order=${encodeURIComponent(orderNumber || "")}`}
                      className="text-accent hover:underline font-medium"
                    >
                      look it up here
                    </Link>{" "}
                    anytime with your email.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="h-12 sm:flex-1" asChild>
                <Link to="/order">Order More</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 sm:flex-1" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
