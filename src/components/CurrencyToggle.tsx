import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CurrencyToggle() {
  const { currency, setCurrency, showToggle } = useCurrency();

  if (!showToggle) return null;

  return (
    <div className="flex items-center gap-1 bg-muted rounded-full p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-3 rounded-full text-xs font-medium transition-all",
          currency === 'BDT' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "hover:bg-muted-foreground/10"
        )}
        onClick={() => setCurrency('BDT')}
      >
        ৳ BDT
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-3 rounded-full text-xs font-medium transition-all",
          currency === 'USD' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "hover:bg-muted-foreground/10"
        )}
        onClick={() => setCurrency('USD')}
      >
        $ USD
      </Button>
    </div>
  );
}
