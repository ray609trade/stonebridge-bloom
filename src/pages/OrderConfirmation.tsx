import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
              <CheckCircle className="h-10 w-10" />
            </div>

            <h1 className="font-serif text-4xl font-semibold text-foreground mb-4">
              Order Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Thank you for your order
            </p>
            <p className="text-2xl font-semibold text-foreground mb-8">
              Order #{orderNumber}
            </p>

            <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left">
              <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
                What's Next?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Preparation</p>
                    <p className="text-sm text-muted-foreground">
                      We're preparing your order fresh. You'll receive a text when it's ready.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Pickup</p>
                    <p className="text-sm text-muted-foreground">
                      Head to the pickup counter and give us your order number.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Questions?</p>
                    <p className="text-sm text-muted-foreground">
                      Call us at <a href="tel:+16097383222" className="text-accent hover:underline">(609) 738-3222</a> if you have any questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/order">Order More</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              Want to check on this order later? Save your order number and look it up anytime at{" "}
              <Link
                to={`/order/lookup?order=${encodeURIComponent(orderNumber || "")}`}
                className="text-accent hover:underline font-medium"
              >
                /order/lookup
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
