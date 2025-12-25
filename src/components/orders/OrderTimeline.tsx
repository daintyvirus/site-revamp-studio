import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  Package, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Truck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface StatusHistoryItem {
  id: string;
  order_id: string;
  status: string;
  payment_status: string | null;
  notes: string | null;
  created_at: string;
}

interface OrderTimelineProps {
  orderId: string;
  orderCreatedAt: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
  processing: { icon: RefreshCw, color: 'text-blue-500', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-purple-500', label: 'Shipped' },
  completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-500', label: 'Cancelled' },
  refunded: { icon: AlertCircle, color: 'text-orange-500', label: 'Refunded' },
};

const paymentStatusConfig: Record<string, { color: string; label: string }> = {
  unpaid: { color: 'text-yellow-500', label: 'Unpaid' },
  paid: { color: 'text-green-500', label: 'Paid' },
  refunded: { color: 'text-orange-500', label: 'Refunded' },
};

export default function OrderTimeline({ 
  orderId, 
  orderCreatedAt, 
  currentStatus, 
  currentPaymentStatus 
}: OrderTimelineProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['order-status-history', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as StatusHistoryItem[];
    }
  });

  // Create timeline items starting with order creation
  const timelineItems = [
    {
      id: 'created',
      status: 'pending',
      notes: 'Order placed',
      created_at: orderCreatedAt,
      isCreation: true
    },
    ...(history || []).map(h => ({
      ...h,
      isCreation: false
    }))
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Order Timeline
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* Timeline items */}
        <div className="space-y-4">
          {timelineItems.map((item, index) => {
            const config = statusConfig[item.status] || statusConfig.pending;
            const Icon = config.icon;
            const isLast = index === timelineItems.length - 1;
            
            return (
              <div key={item.id} className="relative flex gap-4 pl-0">
                {/* Icon container */}
                <div className={`
                  relative z-10 flex-shrink-0 w-8 h-8 rounded-full 
                  flex items-center justify-center
                  ${isLast ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                `}>
                  <Icon className={`h-4 w-4 ${isLast ? '' : config.color}`} />
                </div>
                
                {/* Content */}
                <div className={`
                  flex-1 bg-card border rounded-lg p-3 
                  ${isLast ? 'border-primary/50 shadow-sm' : ''}
                `}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">
                        {item.isCreation ? 'Order Placed' : config.label}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {item.notes}
                        </p>
                      )}
                      {!item.isCreation && (item as StatusHistoryItem).payment_status && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Payment: <span className={paymentStatusConfig[(item as StatusHistoryItem).payment_status!]?.color || ''}>
                            {paymentStatusConfig[(item as StatusHistoryItem).payment_status!]?.label || (item as StatusHistoryItem).payment_status}
                          </span>
                        </p>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
                    </time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Summary */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Status</p>
            <p className={`font-semibold ${statusConfig[currentStatus]?.color || 'text-foreground'}`}>
              {statusConfig[currentStatus]?.label || currentStatus}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Payment</p>
            <p className={`font-semibold ${paymentStatusConfig[currentPaymentStatus]?.color || 'text-foreground'}`}>
              {paymentStatusConfig[currentPaymentStatus]?.label || currentPaymentStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
