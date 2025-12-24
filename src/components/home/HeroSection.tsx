import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import HeroCarousel from './HeroCarousel';
import { useHomepageSection } from '@/hooks/useHomepageSections';

// Counter animation hook
const useCountUp = (end: number, duration: number = 2000, start: number = 0, trigger: boolean = true) => {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    if (!trigger) return;
    
    let startTime: number | null = null;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * (end - start) + start));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start, trigger]);
  
  return count;
};

export default function HeroSection() {
  const { data: section } = useHomepageSection('hero');
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [statsInView, setStatsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Get content from database or use defaults
  const description = section?.description || "Get instant access to gift cards, game top-ups, subscriptions, and premium gaming accounts. Fast, secure, and reliable.";
  const badgeText = section?.badge_text || 'Instant Digital Delivery';
  const buttonText = section?.button_text || 'Shop Now';
  const buttonUrl = section?.button_url || '/shop';
  const secondaryButtonText = section?.secondary_button_text || 'Browse Gift Cards';
  const secondaryButtonUrl = section?.secondary_button_url || '/shop?category=gift-cards';
  
  // Parse extra_data for title words and stats
  const extraData = section?.extra_data as { title_words?: string[]; gradient_words?: string[]; stats?: { label: string; value: string }[] } | null;
  const titleWords = extraData?.title_words || ['LEVEL', 'UP', 'YOUR'];
  const gradientWords = extraData?.gradient_words || ['GAMING', 'EXPERIENCE'];
  const stats = extraData?.stats || [
    { label: 'Products', value: '10K+' },
    { label: 'Happy Gamers', value: '50K+' },
    { label: 'Support', value: '24/7' },
  ];

  // Counter values - parse from stats
  const parseStatValue = (value: string) => parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const productsCount = useCountUp(parseStatValue(stats[0]?.value || '10'), 2000, 0, statsInView);
  const gamersCount = useCountUp(parseStatValue(stats[1]?.value || '50'), 2500, 0, statsInView);
  const supportHours = useCountUp(parseStatValue(stats[2]?.value || '24'), 1500, 0, statsInView);
  
  useEffect(() => {
    setIsVisible(true);
    const typingDelay = setTimeout(() => {
      setIsTyping(true);
    }, 900);
    return () => clearTimeout(typingDelay);
  }, []);

  // Intersection Observer for stats section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsInView(true);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isTyping) return;
    
    if (displayedText.length < description.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(description.slice(0, displayedText.length + 1));
      }, 25);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, displayedText, description]);

  // Don't render if section is hidden
  if (section && !section.is_visible) return null;

  return (
    <section ref={sectionRef} className="relative min-h-[700px] flex items-center overflow-hidden">
      {/* Hero Carousel Background */}
      <HeroCarousel />
      
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-accent/15 rounded-full blur-[120px]" />
      </div>
      
      {/* Glass morphism overlay for content area */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-primary animate-sparkle" />
            <span className="text-sm font-medium text-primary">{badgeText}</span>
          </div>

          {/* Title with Animated Text Reveal */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            <span className="block overflow-hidden">
              {titleWords.map((word, index) => (
                <span
                  key={word}
                  className={`inline-block transition-all duration-700 ease-out drop-shadow-lg ${
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
                  className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-destructive to-accent transition-all duration-700 ease-out drop-shadow-lg ${
                    isVisible 
                      ? 'translate-y-0 opacity-100 blur-0' 
                      : 'translate-y-full opacity-0 blur-sm'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 150 + 500}ms`,
                    marginRight: '0.3em',
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
          </h1>

          {/* Description with Typewriter Effect */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 h-[60px] md:h-[56px] backdrop-blur-sm">
            {displayedText}
            {displayedText.length < description.length && (
              <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-blink" />
            )}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative group">
              {/* Animated Glow Ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-destructive to-primary rounded-lg opacity-75 blur-sm group-hover:opacity-100 transition-opacity animate-glow-ring" />
              <div className="absolute -inset-2 bg-gradient-to-r from-primary via-destructive to-primary rounded-lg opacity-40 blur-md animate-glow-ring" style={{ animationDelay: '0.2s' }} />
              <Button asChild size="lg" className="relative glow-primary text-lg px-8 bg-gradient-to-r from-primary to-destructive hover:from-primary/90 hover:to-destructive/90 border-0 overflow-hidden group">
                <Link to={buttonUrl}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Zap className="h-5 w-5 mr-2 animate-zap" />
                  {buttonText}
                </Link>
              </Button>
            </div>
            {secondaryButtonText && (
              <Button asChild variant="outline" size="lg" className="text-lg px-8 hover:bg-primary/10 hover:border-primary transition-all duration-300 backdrop-blur-sm bg-background/50">
                <Link to={secondaryButtonUrl}>
                  {secondaryButtonText}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </div>

          {/* Stats with Counter Animation */}
          <div ref={statsRef} className="grid grid-cols-3 gap-8 mt-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center group">
              <div className="relative inline-block backdrop-blur-sm bg-background/30 px-4 py-2 rounded-lg border border-border/20">
                <p className={`font-display text-3xl md:text-4xl font-bold text-primary transition-all duration-300 ${statsInView ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} group-hover:scale-110`}>
                  {productsCount}K+
                </p>
                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{stats[0]?.label || 'Products'}</p>
            </div>
            <div className="text-center group">
              <div className="relative inline-block backdrop-blur-sm bg-background/30 px-4 py-2 rounded-lg border border-border/20">
                <p className={`font-display text-3xl md:text-4xl font-bold text-secondary transition-all duration-300 ${statsInView ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} group-hover:scale-110`} style={{ transitionDelay: '0.1s' }}>
                  {gamersCount}K+
                </p>
                <div className="absolute -inset-2 bg-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{stats[1]?.label || 'Happy Gamers'}</p>
            </div>
            <div className="text-center group">
              <div className="relative inline-block backdrop-blur-sm bg-background/30 px-4 py-2 rounded-lg border border-border/20">
                <p className={`font-display text-3xl md:text-4xl font-bold text-accent transition-all duration-300 ${statsInView ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} group-hover:scale-110`} style={{ transitionDelay: '0.2s' }}>
                  {supportHours}/7
                </p>
                <div className="absolute -inset-2 bg-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{stats[2]?.label || 'Support'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
