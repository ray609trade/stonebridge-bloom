import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-semibold">Stonebridge Bagels</h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Handcrafted bagels made fresh daily using traditional methods and the finest ingredients.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                Home
              </Link>
              <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                Our Story
              </Link>
              <Link to="/order" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                Order Online
              </Link>
              <Link to="/wholesale" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                Wholesale
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span className="text-primary-foreground/80">
                  [Address placeholder]<br />
                  [City, State ZIP]
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <span className="text-primary-foreground/80">[Phone placeholder]</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <span className="text-primary-foreground/80">[Email placeholder]</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Hours</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <div className="text-primary-foreground/80">
                  <p>Mon–Fri: 6am – 3pm</p>
                  <p>Sat–Sun: 7am – 4pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col items-center gap-4 text-sm text-primary-foreground/60">
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
