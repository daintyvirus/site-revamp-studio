import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PaymentMethod } from './PaymentMethodSelector';

interface PaymentInstructionsProps {
  method: PaymentMethod;
  amount: number;
  transactionId: string;
  onTransactionIdChange: (value: string) => void;
  storeName: string;
}

const methodConfig: Record<PaymentMethod, { name: string; color: string; number: string }> = {
  bkash: { name: 'bKash', color: '#E2136E', number: '01XXXXXXXXX' },
  nagad: { name: 'Nagad', color: '#F6921E', number: '01XXXXXXXXX' },
  rocket: { name: 'Rocket', color: '#8C3494', number: '01XXXXXXXXX' },
  upay: { name: 'Upay', color: '#00A651', number: '01XXXXXXXXX' },
};

export default function PaymentInstructions({
  method,
  amount,
  transactionId,
  onTransactionIdChange,
  storeName
}: PaymentInstructionsProps) {
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  
  const config = methodConfig[method];

  const copyToClipboard = (text: string, type: 'number' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'number') {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div 
          className="inline-flex items-center gap-2 text-2xl font-bold"
          style={{ color: config.color }}
        >
          {config.name}
          <span className="text-3xl">💳</span>
        </div>
      </div>

      {/* Store and Amount */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">🎮</span>
          </div>
          <span className="font-semibold">{storeName}</span>
        </div>
        <div className="text-xl font-bold">{amount.toFixed(0)} BDT</div>
      </div>

      {/* Instructions */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>
          <p>Go to your <strong>{config.name}</strong> Mobile App.</p>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>
          <p>Choose: <strong>Send Money</strong></p>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>
          <div className="flex items-center gap-2 flex-wrap">
            <span>Enter the Number:</span>
            <strong>{config.number}</strong>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              onClick={() => copyToClipboard(config.number, 'number')}
            >
              {copiedNumber ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              Copy
            </Button>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>
          <div className="flex items-center gap-2 flex-wrap">
            <span>Enter the Amount:</span>
            <strong>{amount.toFixed(0)} BDT</strong>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              onClick={() => copyToClipboard(amount.toFixed(0), 'amount')}
            >
              {copiedAmount ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              Copy
            </Button>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>
          <p>Now enter your <strong>{config.name}</strong> PIN to confirm.</p>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>
          <p>Put the <strong>Transaction ID</strong> in the box below and press <strong>Verify</strong></p>
        </div>
      </div>

      {/* Transaction ID Input */}
      <div className="space-y-2">
        <Label htmlFor="transaction-id" className="font-semibold">Transaction ID</Label>
        <Input
          id="transaction-id"
          placeholder="Enter Transaction ID"
          value={transactionId}
          onChange={(e) => onTransactionIdChange(e.target.value)}
          className="text-center"
        />
      </div>
    </div>
  );
}
