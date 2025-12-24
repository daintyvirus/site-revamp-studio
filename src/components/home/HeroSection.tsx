import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';

const fullDescription = "Get instant access to gift cards, game top-ups, subscriptions, and premium gaming accounts. Fast, secure, and reliable.";

// Generate floating particles
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
  }));
};

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
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [statsInView, setStatsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const particles = useMemo(() => generateParticles(20), []);
  
  // Counter values
  const productsCount = useCountUp(10, 2000, 0, statsInView);
  const gamersCount = useCountUp(50, 2500, 0, statsInView);
  const supportHours = useCountUp(24, 1500, 0, statsInView);
  
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
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePos({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isTyping) return;
    
    if (displayedText.length < fullDescription.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullDescription.slice(0, displayedText.length + 1));
      }, 25);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, displayedText]);

  const titleWords = ['LEVEL', 'UP', 'YOUR'];
  const gradientWords = ['GAMING', 'EXPERIENCE'];

  return (
    <section ref={sectionRef} className="relative min-h-[700px] flex items-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-background animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Animated Mesh Gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.3),transparent)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_80%_120%,hsl(var(--destructive)/0.2),transparent)]" />
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary/40 animate-float-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* Scan Lines Effect */}
      <div className="absolute inset-0 bg-scan-lines opacity-5 pointer-events-none" />
      
      {/* Glow Orbs with Parallax + Mouse Follow */}
      <div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x * 30}px, ${scrollY * 0.3 + mousePos.y * 20}px)` }}
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-destructive/20 rounded-full blur-[100px] transition-transform duration-500 ease-out"
        style={{ transform: `translate(${mousePos.x * -20}px, ${scrollY * 0.15 + mousePos.y * -15}px)` }}
      />
      <div 
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] transition-transform duration-700 ease-out"
        style={{ transform: `translate(calc(-50% + ${mousePos.x * 15}px), calc(-50% + ${scrollY * 0.2 + mousePos.y * 10}px))` }}
      />
      
      {/* Radial Glow Effect with Parallax */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_70%)] transition-transform duration-100"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      />
      
      {/* Grid Pattern Overlay with Parallax */}
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-30 transition-transform duration-100"
        style={{ transform: `translateY(${scrollY * 0.05}px)` }}
      />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary animate-sparkle" />
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
                  className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-destructive to-accent animate-gradient-text transition-all duration-700 ease-out ${
                    isVisible 
                      ? 'translate-y-0 opacity-100 blur-0' 
                      : 'translate-y-full opacity-0 blur-sm'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 150 + 500}ms`,
                    marginRight: '0.3em',
                    backgroundSize: '200% auto',
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
          </h1>

          {/* Description with Typewriter Effect */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 h-[60px] md:h-[56px]">
            {displayedText}
            {displayedText.length < fullDescription.length && (
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
                <Link to="/shop">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Zap className="h-5 w-5 mr-2 animate-zap" />
                  Shop Now
                </Link>
              </Button>
            </div>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 hover:bg-primary/10 hover:border-primary transition-all duration-300">
              <Link to="/shop?category=gift-cards">
                Browse Gift Cards
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Stats with Counter Animation */}
          <div ref={statsRef} className="grid grid-cols-3 gap-8 mt-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center group">
              <div className="relative inline-block">
                <p className={`font-display text-3xl md:text-4xl font-bold text-primary transition-all duration-300 ${statsInView ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} group-hover:scale-110`}>
                  {productsCount}K+
                </p>
                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Products</p>
            </div>
            <div className="text-center group">
              <div className="relative inline-block">
                <p className={`font-display text-3xl md:text-4xl font-bold text-secondary transition-all duration-300 ${statsInView ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} group-hover:scale-110`} style={{ transitionDelay: '0.1s' }}>
                  {gamersCount}K+
                </p>
                <div className="absolute -inset-2 bg-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Happy Gamers</p>
            </div>
            <div className="text-center group">
              <div className="relative inline-block">
                <p className={`font-display text-3xl md:text-4xl font-bold text-accent transition-all duration-300 ${statsInView ? 'scale-100 opacity-100' : 'scale-75 opacity-0'} group-hover:scale-110`} style={{ transitionDelay: '0.2s' }}>
                  {supportHours}/7
                </p>
                <div className="absolute -inset-2 bg-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Support</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
