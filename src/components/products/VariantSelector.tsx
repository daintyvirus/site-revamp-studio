import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import type { ProductVariant } from '@/types/database';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
}

export default function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  const { formatPrice } = useCurrency();

  if (!variants?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Amount</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOutOfStock = variant.stock <= 0;
          const price = variant.sale_price || variant.price;

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant.id)}
              disabled={isOutOfStock}
              className={cn(
                "px-4 py-2.5 rounded-full border text-sm font-medium transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-muted/50 text-foreground border-border hover:border-primary/50 hover:bg-muted",
                isOutOfStock && "opacity-50 cursor-not-allowed line-through"
              )}
            >
              {variant.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
