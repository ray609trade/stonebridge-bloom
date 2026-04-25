import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, ChevronDown, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFormattedSchedule } from "@/lib/businessHours";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">{title}</h4>
        {children}
      </div>
    );
  }

  return (
    <div className="border-b border-primary-foreground/20 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left touch-target"
      >
        <h4 className="font-semibold text-lg">{title}</h4>
        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
      </button>
      <div className={cn("overflow-hidden transition-all", isOpen ? "pb-4" : "max-h-0")}>
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  const schedule = getFormattedSchedule();
  const isMobile = useIsMobile();

  return (
    <footer className="bg-primary text-primary-foreground pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-10 md:py-16 border-primary-foreground">
        {/* Mobile: Quick Action Buttons */}
        {isMobile && (
          <div className="flex gap-3 mb-8">
            <Button
              variant="secondary"
              className="flex-1 h-12 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
              asChild
            >
              <a href="tel:+16097383222">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </a>
            </Button>
            <Button
              variant="secondary"
              className="flex-1 h-12 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
              asChild
            >
              <a 
                href="https://maps.google.com/?q=1278+Yardville-Allentown+Road+Allentown+NJ+08501" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Directions
              </a>
            </Button>
          </div>
        )}

        <div className={cn(
          isMobile 
            ? "space-y-0" 
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
        )}>
          {/* Brand - Always visible on mobile */}
          <div className={cn("space-y-4", isMobile && "pb-6 border-b border-primary-foreground/20")}>
            <h3 className="font-serif text-2xl font-semibold">Stonebridge Bagels</h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Handcrafted bagels made fresh daily using traditional methods and the finest ingredients.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="p-2.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors touch-target"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors touch-target"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors touch-target"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <AccordionSection title="Quick Links">
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm py-1">
                Home
              </Link>
              <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm py-1">
                Our Story
              </Link>
              <Link to="/order" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm py-1">
                Order Online
              </Link>
              <Link to="/wholesale" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm py-1">
                Wholesale
              </Link>
              <Link to="/order/lookup" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm py-1">
                Look up your order
              </Link>
            </nav>
          </AccordionSection>

          {/* Contact */}
          <AccordionSection title="Contact">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span className="text-primary-foreground/80">
                  1278 Yardville-Allentown Road<br />
                  Allentown, NJ 08501
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a href="tel:+16097383222" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">(609) 738-3222</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a href="mailto:steven@stonebridgebagels.com" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors break-all">steven@stonebridgebagels.com</a>
              </div>
            </div>
          </AccordionSection>

          {/* Hours */}
          <AccordionSection title="Hours" defaultOpen={true}>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <div className="text-primary-foreground/80">
                  {schedule.map((s) => (
                    <p key={s.label} className="py-0.5">{s.label}: {s.hours}</p>
                  ))}
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>

        <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-primary-foreground/20 flex flex-col items-center gap-4 text-sm text-primary-foreground/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <p>© {new Date().getFullYear()} Stonebridge Bagels. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
          <p className="text-xs text-primary-foreground/40">Designed by Ray Management Group LLC</p>
        </div>
      </div>
    </footer>
  );
}
