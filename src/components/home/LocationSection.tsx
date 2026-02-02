import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getFormattedSchedule } from "@/lib/businessHours";

export function LocationSection() {
  const schedule = getFormattedSchedule();
  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border shadow-card"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3041.8!2d-74.5867!3d40.1789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c160e5b0a89a8d%3A0x1234567890abcdef!2s1278%20Yardville-Allentown%20Rd%2C%20Allentown%2C%20NJ%2008501!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Stonebridge Bagels Location"
              className="absolute inset-0"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Visit Us
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Stop by for fresh bagels, coffee, and a warm welcome. We can't wait to see you!
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Address</h4>
                  <p className="text-muted-foreground">
                    1278 Yardville-Allentown Road<br />
                    Allentown, NJ 08501
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Hours</h4>
                  <p className="text-muted-foreground">
                    {schedule.map((s, i) => (
                      <span key={s.label}>
                        {s.label}: {s.hours}
                        {i < schedule.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                  <a href="tel:+16097383222" className="text-muted-foreground hover:text-foreground transition-colors">(609) 738-3222</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Email</h4>
                  <a href="mailto:steven@stonebridgebagels.com" className="text-muted-foreground hover:text-foreground transition-colors">steven@stonebridgebagels.com</a>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button size="lg" asChild>
                <Link to="/order">Order Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:+16097383222">Call Us</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
