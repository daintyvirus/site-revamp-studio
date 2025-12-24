import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const titleWords = ['LEVEL', 'UP', 'YOUR'];
  const gradientWords = ['GAMING', 'EXPERIENCE'];
  return (
    <section className="relative min-h-[700px] flex items-center overflow-hidden">
      {/* Red to Black Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-background" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-destructive/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      {/* Radial Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_70%)]" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Instant Digital Delivery</span>
          </div>

          {/* Title with Animated Text Reveal */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            <span className="block overflow-hidden">
              {titleWords.map((word, index) => (
                <span
                  key={word}
                  className={`inline-block transition-all duration-700 ease-out ${
                    isVisible 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-full opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100 + 200}ms`,
                    marginRight: '0.3em'
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
            <span className="block overflow-hidden">
              {gradientWords.map((word, index) => (
                <span
                  key={word}
                  className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-destructive to-accent transition-all duration-700 ease-out ${
                    isVisible 
                      ? 'translate-y-0 opacity-100 blur-0' 
                      : 'translate-y-full opacity-0 blur-sm'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 150 + 500}ms`,
                    marginRight: '0.3em'
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Get instant access to gift cards, game top-ups, subscriptions, and premium gaming accounts. Fast, secure, and reliable.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="glow-primary text-lg px-8 bg-gradient-to-r from-primary to-destructive hover:from-primary/90 hover:to-destructive/90 border-0">
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
