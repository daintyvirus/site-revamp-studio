import { useState } from 'react';
import { Package, Send, Copy, Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUpdateOrderDelivery } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Order } from '@/types/database';

const platforms = [
  { value: 'steam', label: 'Steam' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'nintendo', label: 'Nintendo' },
  { value: 'itunes', label: 'iTunes/Apple' },
  { value: 'netflix', label: 'Netflix' },
  { value: 'roblox', label: 'Roblox' },
  { value: 'google', label: 'Google Play' },
  { value: 'razer_gold', label: 'Razer Gold' },
  { value: 'discord', label: 'Discord' },
  { value: 'chatgpt', label: 'ChatGPT/OpenAI' },
  { value: 'other', label: 'Other' },
];

const deliveryTypePresets = [
  { value: 'Code', label: 'Redeem Code' },
  { value: 'Account', label: 'Account Credentials' },
  { value: 'custom', label: 'Custom...' },
];

interface DeliveryManagementDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeliveryManagementDialog({ order, open, onOpenChange }: DeliveryManagementDialogProps) {
  const [deliveryInfo, setDeliveryInfo] = useState(order?.delivery_info || '');
  const [deliveryType, setDeliveryType] = useState(order?.delivery_type || 'Code');
  const [customDeliveryType, setCustomDeliveryType] = useState('');
  const [deliveryPlatform, setDeliveryPlatform] = useState(order?.delivery_platform || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState(order?.delivery_instructions || '');
  const [showInfo, setShowInfo] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('delivery');
  const [isCustomType, setIsCustomType] = useState(false);
  
  const updateDelivery = useUpdateOrderDelivery();

  // Update form when order changes
  useState(() => {
    if (order) {
      setDeliveryInfo(order.delivery_info || '');
      const existingType = order.delivery_type || 'Code';
      const isPreset = deliveryTypePresets.some(p => p.value === existingType && p.value !== 'custom');
      if (isPreset) {
        setDeliveryType(existingType);
        setIsCustomType(false);
      } else {
        setDeliveryType('custom');
        setCustomDeliveryType(existingType);
        setIsCustomType(true);
      }
      setDeliveryPlatform(order.delivery_platform || '');
      setDeliveryInstructions(order.delivery_instructions || '');
    }
  });

  const getFinalDeliveryType = () => {
    return isCustomType ? customDeliveryType.trim() || 'Item' : deliveryType;
  };

  const handleSaveAndDeliver = async () => {
    if (!order || !deliveryInfo.trim()) {
      toast.error('Please enter delivery information');
      return;
    }

    try {
      setSending(true);
      
      const finalType = getFinalDeliveryType();
      
      // Update order with delivery info
      await updateDelivery.mutateAsync({
        orderId: order.id,
        deliveryInfo: deliveryInfo.trim(),
        deliveryType: finalType,
        deliveryPlatform,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
      });

      // Send delivery notification email
      if (order.customer_email) {
        const { error } = await supabase.functions.invoke('send-delivery-notification', {
          body: {
            customerEmail: order.customer_email,
            customerName: order.customer_name || 'Valued Customer',
            orderId: order.id,
            orderTotal: order.total,
            deliveryInfo: deliveryInfo.trim(),
            deliveryType: finalType,
            deliveryPlatform,
          },
        });

        if (error) {
          console.error('Failed to send delivery email:', error);
          toast.error('Delivery saved but email failed to send');
        } else {
          toast.success('Delivery information saved and email sent!');
        }
      } else {
        toast.success('Delivery information saved (no email - customer has no email)');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving delivery:', error);
      toast.error('Failed to save delivery information');
    } finally {
      setSending(false);
    }
  };

  const handleResendEmail = async () => {
    if (!order || !order.delivery_info || !order.customer_email) {
      toast.error('Cannot resend - no delivery info or customer email');
      return;
    }

    try {
      setSending(true);
      const { error } = await supabase.functions.invoke('send-delivery-notification', {
        body: {
          customerEmail: order.customer_email,
          customerName: order.customer_name || 'Valued Customer',
          orderId: order.id,
          orderTotal: order.total,
          deliveryInfo: order.delivery_info,
          deliveryType: order.delivery_type,
          deliveryPlatform: order.delivery_platform,
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Delivery email resent successfully');
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('Failed to resend email');
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async () => {
    if (deliveryInfo) {
      await navigator.clipboard.writeText(deliveryInfo);
      toast.success('Copied to clipboard');
    }
  };

  if (!order) return null;

  const hasExistingDelivery = !!order.delivery_info;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery Management
          </DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(0, 8).toUpperCase()} - {order.customer_name || order.customer_email}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="delivery">Delivery Info</TabsTrigger>
            <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="delivery" className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {hasExistingDelivery ? (
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                  Delivered
                </Badge>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                  Pending Delivery
                </Badge>
              )}
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={deliveryPlatform} onValueChange={setDeliveryPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Type */}
            <div className="space-y-2">
              <Label>Delivery Type (appears in email as "Reveal Your ___")</Label>
              <Select 
                value={isCustomType ? 'custom' : deliveryType} 
                onValueChange={(val) => {
                  if (val === 'custom') {
                    setIsCustomType(true);
                    setDeliveryType('custom');
                  } else {
                    setIsCustomType(false);
                    setDeliveryType(val);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryTypePresets.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isCustomType && (
                <Input
                  value={customDeliveryType}
                  onChange={(e) => setCustomDeliveryType(e.target.value)}
                  placeholder="Enter custom type name (e.g., Gift Card, License Key)"
                  className="mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Email button will show: "Reveal Your {isCustomType ? (customDeliveryType || 'Item') : deliveryType}"
              </p>
            </div>

            {/* Delivery Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {deliveryType === 'Account' ? 'Account Details' : 'Redeem Code / Info'}
                </Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowInfo(!showInfo)}
                  >
                    {showInfo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopy}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
                placeholder={deliveryType === 'account' 
                  ? "Username: example@email.com\nPassword: ****" 
                  : "Enter the redeem code..."
                }
                className={`font-mono ${!showInfo && deliveryInfo ? 'text-transparent selection:text-transparent' : ''}`}
                style={!showInfo && deliveryInfo ? { 
                  textShadow: '0 0 8px currentColor',
                  caretColor: 'transparent' 
                } : {}}
                rows={3}
              />
            </div>

            {/* Custom Instructions */}
            <div className="space-y-2">
              <Label>Custom Instructions (Optional)</Label>
              <Textarea
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="Add any special instructions for the customer..."
                rows={2}
              />
            </div>

            {/* Warning for replacement */}
            {hasExistingDelivery && (
              <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <p className="text-xs text-yellow-600">
                  This order already has delivery info. Saving will replace the existing information.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveAndDeliver}
                disabled={sending || !deliveryInfo.trim()}
                className="flex-1"
              >
                {sending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {hasExistingDelivery ? 'Update & Resend' : 'Save & Deliver'}
              </Button>
              
              {hasExistingDelivery && (
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={sending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Email
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <DeliveryLogsTab orderId={order.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function DeliveryLogsTab({ orderId }: { orderId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('delivery_logs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    };
    fetchLogs();
  });

  if (loading) {
    return <p className="text-sm text-muted-foreground py-4">Loading logs...</p>;
  }

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No delivery logs yet</p>;
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="text-xs border rounded p-2 space-y-1">
          <div className="flex justify-between">
            <Badge variant="outline" className="text-xs">
              {log.action}
            </Badge>
            <span className="text-muted-foreground">
              {new Date(log.created_at).toLocaleString()}
            </span>
          </div>
          {log.error_message && (
            <p className="text-destructive">{log.error_message}</p>
          )}
        </div>
      ))}
    </div>
  );
}