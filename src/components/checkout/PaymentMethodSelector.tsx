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
  const cardMethods = methods.filter(m => m.type === 'card');
  const cryptoMethods = methods.filter(m => m.type === 'crypto');
  const otherMethods = [...cardMethods, ...cryptoMethods];

  // Determine which tabs to show
  const tabs = [];
  if (mobileMethods.length > 0) tabs.push({ value: 'mobile', label: 'MOBILE BANKING' });
  if (netMethods.length > 0) tabs.push({ value: 'net', label: 'NET BANKING' });
  if (otherMethods.length > 0) tabs.push({ value: 'other', label: 'OTHER' });

  const defaultTab = tabs[0]?.value || 'mobile';

  const renderMethodGrid = (methodList: PaymentMethod[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {methodList.map((method) => (
        <button
          key={method.id}
          onClick={() => onSelect(method.slug)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md",
            selected === method.slug
              ? "border-primary bg-primary/10"
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
  );

  if (tabs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No payment methods available for your currency</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className={cn("grid w-full mb-6", `grid-cols-${tabs.length}`)}>
        {tabs.map(tab => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value} 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="mobile">
        {mobileMethods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No mobile banking methods available</p>
          </div>
        ) : renderMethodGrid(mobileMethods)}
      </TabsContent>
      
      <TabsContent value="net">
        {netMethods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No net banking methods available</p>
          </div>
        ) : renderMethodGrid(netMethods)}
      </TabsContent>

      <TabsContent value="other">
        {otherMethods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No other payment methods available</p>
          </div>
        ) : renderMethodGrid(otherMethods)}
      </TabsContent>
    </Tabs>
  );
}
