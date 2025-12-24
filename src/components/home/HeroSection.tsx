import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
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
  const buttonText = section?.button_text || 'Explore Products';
  const buttonUrl = section?.button_url || '/shop';
  const secondaryButtonText = section?.secondary_button_text || 'View Categories';
  const secondaryButtonUrl = section?.secondary_button_url || '/shop';
  
  const extraData = section?.extra_data as { title_words?: string[]; gradient_words?: string[]; stats?: { label: string; value: string }[] } | null;
  const titleWords = extraData?.title_words || ['Premium', 'Digital'];
  const gradientWords = extraData?.gradient_words || ['Products'];
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

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Hero Carousel Background */}
      <HeroCarousel />
      
      {/* Elegant Multi-layer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating orbs */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/15 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trusted by 50K+ Customers</span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]"
            >
              {titleWords.map((word, index) => (
                <span key={index} className="mr-3 inline-block">{word}</span>
              ))}
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  {gradientWords.join(' ')}
                </span>
                <motion.span 
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full"
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
              className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
            >
              {description}
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="text-base px-8 h-14 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
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
                  className="text-base px-8 h-14 rounded-xl border-2 border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all"
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
                  <p className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Side - Feature Cards (visible on lg+) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {[
              { title: 'Instant Delivery', desc: 'Get your products in seconds' },
              { title: 'Secure Payment', desc: 'Multiple payment options' },
              { title: '24/7 Support', desc: 'Always here to help' },
              { title: 'Best Prices', desc: 'Competitive market rates' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
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
