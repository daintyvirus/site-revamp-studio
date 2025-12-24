import { Link } from 'react-router-dom';
import { Gift, Gamepad2, Crown, User, Headphones, CreditCard } from 'lucide-react';

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
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Find exactly what you're looking for in our extensive catalog
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                to={`/shop?category=${category.slug}`}
                className="group"
              >
                <div className="relative p-6 rounded-xl bg-card border border-border text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${category.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-background" />
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
