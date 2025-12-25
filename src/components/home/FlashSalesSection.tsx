import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';

function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference <= 0) return;

      setTimeLeft({
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <span className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-lg font-mono min-w-[48px] text-center">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-xs text-muted-foreground mt-1">HRS</span>
      </div>
      <span className="text-primary font-bold text-xl">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-lg font-mono min-w-[48px] text-center">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-xs text-muted-foreground mt-1">MIN</span>
      </div>
      <span className="text-primary font-bold text-xl">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-gradient-to-br from-primary to-accent text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-lg font-mono min-w-[48px] text-center animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-xs text-muted-foreground mt-1">SEC</span>
      </div>
    </div>
  );
}

export default function FlashSalesSection() {
  const { data: products, isLoading } = useProducts({});
  
  // Get products with flash sales enabled
  const flashSaleProducts = products?.filter(p => 
    p.flash_sale_enabled && 
    p.sale_price_bdt && 
    p.sale_price_bdt < (p.price_bdt || 0)
  ).slice(0, 4) ?? [];

  // Default end date: end of today
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  // Don't render if no flash sale products
  if (!isLoading && flashSaleProducts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Flash <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sales</span>
              </h2>
              <p className="text-muted-foreground">Limited time offers - Don't miss out!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground mb-1">Ends in:</p>
              <CountdownTimer endDate={endDate} />
            </div>
            <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10 group">
              <Link to="/shop">
                View All
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Countdown */}
        <div className="sm:hidden mb-8 flex justify-center">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground mb-2 text-center">Ends in:</p>
            <CountdownTimer endDate={endDate} />
          </div>
        </div>

        <ProductGrid products={flashSaleProducts} isLoading={isLoading} />
      </div>
    </section>
  );
}
