import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Gamepad2, Crown, User, Headphones, CreditCard, Layers, ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useHomepageSection } from '@/hooks/useHomepageSections';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  Gift,
  Gamepad2,
  Crown,
  User,
  Headphones,
  CreditCard,
};

const colorMap: Record<string, { bg: string; glow: string }> = {
  'gift-cards': { bg: 'from-primary to-primary/60', glow: 'shadow-primary/40' },
  'top-ups': { bg: 'from-neon-pink to-neon-pink/60', glow: 'shadow-neon-pink/40' },
  'subscriptions': { bg: 'from-success to-success/60', glow: 'shadow-success/40' },
  'accounts': { bg: 'from-warning to-warning/60', glow: 'shadow-warning/40' },
  'discord': { bg: 'from-neon-purple to-neon-purple/60', glow: 'shadow-neon-purple/40' },
  'credits': { bg: 'from-neon-orange to-neon-orange/60', glow: 'shadow-neon-orange/40' },
};

const INITIAL_DISPLAY_COUNT = 6;

export default function CategorySection() {
  const { data: categories } = useCategories();
  const { data: section } = useHomepageSection('categories');
  const [showAll, setShowAll] = useState(false);
  
  // Get content from database or use defaults
  const badgeText = section?.badge_text || 'Categories';
  const title = section?.title || 'Browse by Category';
  const description = section?.description || "Find exactly what you're looking for in our extensive catalog";

  // Don't render if section is hidden
  if (section && !section.is_visible) return null;

  const displayedCategories = showAll ? categories : categories?.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreCategories = (categories?.length || 0) > INITIAL_DISPLAY_COUNT;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--neon-pink)/0.05)_0%,transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-neon-pink/20 border border-primary/30 mb-4">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{badgeText}</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayedCategories?.map((category, index) => {
            const Icon = iconMap[category.icon || 'Gift'] || Gift;
            const colors = colorMap[category.slug] || { bg: 'from-primary to-primary/60', glow: 'shadow-primary/40' };
            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to={`/shop?category=${category.slug}`}
                  className="group block"
                >
                  <div className="relative p-6 rounded-2xl bg-card border border-border text-center transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 overflow-hidden">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Icon Container */}
                    <div className={`relative inline-flex p-4 rounded-xl bg-gradient-to-br ${colors.bg} mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${colors.glow}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors relative">
                      {category.name}
                    </h3>
                    
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-neon-pink group-hover:w-full transition-all duration-300 rounded-full" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Show All Button */}
        {hasMoreCategories && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-center mt-10"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAll(!showAll)}
              className="px-8 h-12 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-card/50 transition-all group"
            >
              {showAll ? 'Show Less' : 'View All Categories'}
              <ChevronRight className={`ml-2 h-4 w-4 transition-transform ${showAll ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}