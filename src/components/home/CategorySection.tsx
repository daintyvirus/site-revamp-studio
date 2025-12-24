import { Link } from 'react-router-dom';
import { Gift, Gamepad2, Crown, User, Headphones, CreditCard, Layers } from 'lucide-react';

const categories = [
  {
    name: 'Gift Cards',
    slug: 'gift-cards',
    icon: Gift,
    color: 'from-primary to-primary/50',
    description: 'Steam, PlayStation, Xbox & more'
  },
  {
    name: 'Game Top-Ups',
    slug: 'top-ups',
    icon: Gamepad2,
    color: 'from-secondary to-secondary/50',
    description: 'UC, Diamonds, V-Bucks & more'
  },
  {
    name: 'Subscriptions',
    slug: 'subscriptions',
    icon: Crown,
    color: 'from-accent to-accent/50',
    description: 'Game Pass, PS Plus, EA Play'
  },
  {
    name: 'Gaming Accounts',
    slug: 'accounts',
    icon: User,
    color: 'from-neon-pink to-neon-pink/50',
    description: 'Premium gaming accounts'
  },
  {
    name: 'Discord Services',
    slug: 'discord',
    icon: Headphones,
    color: 'from-neon-purple to-neon-purple/50',
    description: 'Nitro, boosts & more'
  },
  {
    name: 'Digital Credits',
    slug: 'credits',
    icon: CreditCard,
    color: 'from-neon-orange to-neon-orange/50',
    description: 'App store credits & vouchers'
  }
];

export default function CategorySection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05)_0%,transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <Layers className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Categories</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Find exactly what you're looking for in our extensive catalog
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                to={`/shop?category=${category.slug}`}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative p-6 rounded-xl bg-card border border-border text-center transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 overflow-hidden">
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icon Container */}
                  <div className={`relative inline-flex p-4 rounded-xl bg-gradient-to-br ${category.color} mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                    <Icon className="h-6 w-6 text-background" />
                    {/* Icon Glow */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${category.color} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                  </div>
                  
                  <h3 className="font-display font-semibold text-sm mb-1 group-hover:text-primary transition-colors relative">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 relative">
                    {category.description}
                  </p>
                  
                  {/* Bottom Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
