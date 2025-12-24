import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useNavigationMenu } from '@/hooks/useNavigationMenu';

export default function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: quickLinks } = useNavigationMenu('footer_quick_links');
  const { data: supportLinks } = useNavigationMenu('footer_support');

  const siteName = settings?.site_name || 'Golden Bumps';
  const tagline = settings?.site_tagline || 'Your trusted source for digital gaming products, gift cards, and game top-ups.';
  const email = settings?.contact_email || 'support@goldenbumps.com';
  const phone = settings?.contact_phone || '+1 (555) 123-4567';
  const address = settings?.contact_address || 'Available Worldwide';
  const copyright = (settings?.footer_copyright || '© {year} Golden Bumps. All rights reserved.')
    .replace('{year}', new Date().getFullYear().toString());

  const socialLinks = [
    { key: 'social_facebook', icon: Facebook, label: 'Facebook' },
    { key: 'social_twitter', icon: Twitter, label: 'Twitter' },
    { key: 'social_instagram', icon: Instagram, label: 'Instagram' },
    { key: 'social_youtube', icon: Youtube, label: 'YouTube' },
    { key: 'social_discord', icon: MessageCircle, label: 'Discord' },
  ].filter(s => settings?.[s.key]);

  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-xl font-semibold tracking-tight">
                {siteName}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {tagline}
            </p>
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map(({ key, icon: Icon, label }) => (
                  <a
                    key={key}
                    href={settings?.[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
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
            <h3 className="font-medium text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {quickLinks?.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url}
                    target={item.open_in_new_tab ? '_blank' : undefined}
                    rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              {supportLinks?.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url}
                    target={item.open_in_new_tab ? '_blank' : undefined}
                    rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
