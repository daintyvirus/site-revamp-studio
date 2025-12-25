import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Clock, Sparkles } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import HeroCarousel from './HeroCarousel';
import { useHomepageSection } from '@/hooks/useHomepageSections';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { data: section } = useHomepageSection('hero');
  const [isVisible, setIsVisible] = useState(false);
  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const description = section?.description || "Your trusted destination for premium digital products. Gift cards, game top-ups, and subscriptions delivered instantly.";
  const buttonText = section?.button_text || 'Shop Now';
  const buttonUrl = section?.button_url || '/shop';
  const secondaryButtonText = section?.secondary_button_text || 'View Categories';
  const secondaryButtonUrl = section?.secondary_button_url || '/shop';
  
  const extraData = section?.extra_data as { title_words?: string[]; gradient_words?: string[]; stats?: { label: string; value: string }[] } | null;
  const titleWords = extraData?.title_words || ['Your Gaming', 'Universe'];
  const gradientWords = extraData?.gradient_words || ['Awaits'];
  const stats = extraData?.stats || [
    { label: 'Products', value: '10K+' },
    { label: 'Happy Customers', value: '50K+' },
    { label: 'Support', value: '24/7' },
  ];
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  if (section && !section.is_visible) return null;

  const features = [
    { icon: Zap, label: 'Instant Delivery', color: 'text-warning' },
    { icon: Shield, label: 'Secure Payment', color: 'text-success' },
    { icon: Clock, label: '24/7 Support', color: 'text-primary' },
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Hero Carousel Background */}
      <HeroCarousel />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glowing orbs */}
        <motion.div 
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-neon-pink/10 blur-[100px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-neon-pink/20 border border-primary/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent">
              Trusted by 50K+ Gamers
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            {titleWords.map((word, index) => (
              <span key={index} className="block">{word}</span>
            ))}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-neon-pink to-primary bg-clip-text text-transparent">
                {gradientWords.join(' ')}
              </span>
              <motion.span 
                className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-neon-pink to-primary rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isVisible ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed"
          >
            {description}
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-wrap gap-3 mb-10"
          >
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm font-medium text-foreground">{feature.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              asChild 
              size="lg" 
              className="text-base px-8 h-14 rounded-xl bg-gradient-to-r from-primary to-neon-pink hover:opacity-90 shadow-lg shadow-primary/30 transition-all"
            >
              <Link to={buttonUrl} className="flex items-center gap-2">
                {buttonText}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            {secondaryButtonText && (
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-base px-8 h-14 rounded-xl border-2 border-border hover:bg-card/50 hover:border-primary/50 transition-all"
              >
                <Link to={secondaryButtonUrl}>
                  {secondaryButtonText}
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div 
            ref={statsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: statsInView ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex gap-8 md:gap-12 mt-16 pt-8 border-t border-border/30"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 10 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center sm:text-left"
              >
                <p className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}