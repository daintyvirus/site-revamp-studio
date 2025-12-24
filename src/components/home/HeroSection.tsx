import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden bg-grid-pattern">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Instant Digital Delivery</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            LEVEL UP YOUR
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              GAMING EXPERIENCE
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Get instant access to gift cards, game top-ups, subscriptions, and premium gaming accounts. Fast, secure, and reliable.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="glow-purple text-lg px-8">
              <Link to="/shop">
                <Zap className="h-5 w-5 mr-2" />
                Shop Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/shop?category=gift-cards">
                Browse Gift Cards
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Products</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-secondary">50K+</p>
              <p className="text-sm text-muted-foreground mt-1">Happy Gamers</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-accent">24/7</p>
              <p className="text-sm text-muted-foreground mt-1">Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
