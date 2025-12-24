import { Link } from 'react-router-dom';
import { Gamepad2, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold tracking-wider">
                GOLDEN<span className="text-primary">BUMPS</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your trusted source for digital gaming products, gift cards, and game top-ups.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/shop?category=gift-cards" className="text-muted-foreground hover:text-foreground transition-colors">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link to="/shop?category=top-ups" className="text-muted-foreground hover:text-foreground transition-colors">
                  Game Top-Ups
                </Link>
              </li>
              <li>
                <Link to="/shop?category=subscriptions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Subscriptions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                support@goldenbumps.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Available Worldwide
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GoldenBumps. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
