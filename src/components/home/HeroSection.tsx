import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Hero Carousel Background */}
      <HeroCarousel />
      
      {/* Elegant Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 leading-[1.1]"
          >
            {titleWords.map((word, index) => (
              <span key={index} className="mr-3">{word}</span>
            ))}
            <br />
            <span className="text-primary">
              {gradientWords.join(' ')}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link to={buttonUrl}>
                {buttonText}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            {secondaryButtonText && (
              <Button asChild variant="outline" size="lg" className="text-base px-8 h-12 border-border hover:bg-secondary">
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
            className="flex gap-12 mt-16 pt-8 border-t border-border/50"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 10 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <p className="font-display text-3xl md:text-4xl font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
