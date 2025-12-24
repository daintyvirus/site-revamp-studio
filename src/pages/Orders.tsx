import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function Orders() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in to view orders</h1>
          <p className="text-muted-foreground mb-6">Track your order history</p>
          <Button asChild className="glow-purple">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Loading orders...</p>
        </div>
      </Layout>
    );
  }

  if (!orders?.length) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">No orders yet</h1>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
          <Button asChild className="glow-purple">
            <Link to="/shop">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl border border-border p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono font-medium">{order.id.slice(0, 8)}...</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-primary">${Number(order.total).toFixed(2)}</p>
                </div>
                <Badge className={statusColors[order.status] || statusColors.pending}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="flex flex-wrap gap-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      {item.product?.image_url && (
                        <img src={item.product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                      )}
                      <span className="text-sm">{item.product?.name} x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
