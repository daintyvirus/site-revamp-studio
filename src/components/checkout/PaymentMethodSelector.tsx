import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'upay';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const mobileBankingMethods = [
  { id: 'bkash' as const, name: 'bKash Personal', color: '#E2136E' },
  { id: 'nagad' as const, name: 'Nagad Personal', color: '#F6921E' },
  { id: 'rocket' as const, name: 'Rocket Personal', color: '#8C3494' },
  { id: 'upay' as const, name: 'Upay Personal', color: '#00A651' },
];

export default function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mobileBankingMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md",
                selected === method.id
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                  : "border-border bg-card hover:border-muted-foreground/50"
              )}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: method.color }}
              >
                {method.id.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-center">{method.name}</span>
            </button>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="net">
        <div className="text-center py-8 text-muted-foreground">
          <p>Net Banking coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
