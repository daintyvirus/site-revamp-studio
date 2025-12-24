import { Link } from 'react-router-dom';
import { Gamepad2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Footer() {
  const { data: settings } = useSiteSettings();

  const siteName = settings?.site_name || 'GOLDEN BUMPS';
  const tagline = settings?.site_tagline || 'Your trusted source for digital gaming products, gift cards, and game top-ups.';
  const email = settings?.contact_email || 'support@goldenbumps.com';
  const phone = settings?.contact_phone || '+1 (555) 123-4567';
  const address = settings?.contact_address || 'Available Worldwide';
  const copyright = (settings?.footer_copyright || '© {year} GoldenBumps. All rights reserved.')
    .replace('{year}', new Date().getFullYear().toString());

  // Social links
  const socialLinks = [
    { key: 'social_facebook', icon: Facebook, label: 'Facebook' },
    { key: 'social_twitter', icon: Twitter, label: 'Twitter' },
    { key: 'social_instagram', icon: Instagram, label: 'Instagram' },
    { key: 'social_youtube', icon: Youtube, label: 'YouTube' },
    { key: 'social_discord', icon: MessageCircle, label: 'Discord' },
  ].filter(s => settings?.[s.key]);

  // Split site name for styling
  const nameParts = siteName.split(' ');
  const firstPart = nameParts[0] || 'GOLDEN';
  const secondPart = nameParts.slice(1).join(' ') || 'BUMPS';

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold tracking-wider">
                {firstPart}<span className="text-primary">{secondPart}</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {tagline}
            </p>
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map(({ key, icon: Icon, label }) => (
                  <a
                    key={key}
                    href={settings?.[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
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
                {email}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                {phone}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
