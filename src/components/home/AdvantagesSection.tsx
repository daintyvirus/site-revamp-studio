import { Zap, ShieldCheck, Headphones, Clock, Gift, CreditCard } from 'lucide-react';
import { useHomepageSection } from '@/hooks/useHomepageSections';

const advantages = [
  {
    icon: Zap,
    title: 'Fastest Delivery',
    description: 'Get your digital products instantly delivered to your email',
    color: 'from-primary to-primary/50',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Purchases',
    description: '100% secure payment methods with buyer protection',
    color: 'from-secondary to-secondary/50',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support for all your needs',
    color: 'from-accent to-accent/50',
  },
  {
    icon: Gift,
    title: 'Best Prices',
    description: 'Competitive prices with regular discounts and offers',
    color: 'from-neon-green to-neon-green/50',
  },
  {
    icon: CreditCard,
    title: 'Easy Payment',
    description: 'Multiple payment options including mobile banking',
    color: 'from-neon-orange to-neon-orange/50',
  },
  {
    icon: Clock,
    title: 'Instant Activation',
    description: 'Codes and accounts ready to use immediately',
    color: 'from-neon-pink to-neon-pink/50',
  },
];

export default function AdvantagesSection() {
  const { data: section } = useHomepageSection('advantages');
  
  // Don't render if section exists and is hidden
  if (section && !section.is_visible) return null;

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            {section?.title || 'Our Advantages'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            {section?.description || 'Why choose Golden Bumps for your digital gaming needs'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <div
                key={advantage.title}
                className="group text-center p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${advantage.color} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5 text-background" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                  {advantage.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {advantage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
