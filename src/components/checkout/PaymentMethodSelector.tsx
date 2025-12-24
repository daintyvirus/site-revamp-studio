import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/hooks/usePaymentMethods';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selected: string | null;
  onSelect: (methodSlug: string) => void;
}

export default function PaymentMethodSelector({ methods, selected, onSelect }: PaymentMethodSelectorProps) {
  const mobileMethods = methods.filter(m => m.type === 'mobile_banking');
  const netMethods = methods.filter(m => m.type === 'net_banking');

  return (
    <Tabs defaultValue="mobile" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="mobile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
          MOBILE BANKING
        </TabsTrigger>
        <TabsTrigger value="net" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
          NET BANKING
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="mobile">
        {mobileMethods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No mobile banking methods available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mobileMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => onSelect(method.slug)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md",
                  selected === method.slug
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                    : "border-border bg-card hover:border-muted-foreground/50"
                )}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted overflow-hidden">
                  {method.logo_url ? (
                    <img src={method.logo_url} alt={method.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {method.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-center">{method.name}</span>
              </button>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="net">
        {netMethods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No net banking methods available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {netMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => onSelect(method.slug)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md",
                  selected === method.slug
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                    : "border-border bg-card hover:border-muted-foreground/50"
                )}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted overflow-hidden">
                  {method.logo_url ? (
                    <img src={method.logo_url} alt={method.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {method.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-center">{method.name}</span>
              </button>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
