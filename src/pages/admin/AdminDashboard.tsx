import { Package, Tags, ShoppingBag, DollarSign } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminProducts } from '@/hooks/useProducts';
import { useCategories, useBrands } from '@/hooks/useProducts';
import { useAdminOrders } from '@/hooks/useOrders';

export default function AdminDashboard() {
  const { data: products } = useAdminProducts();
  const { data: categories } = useCategories();
  const { data: orders } = useAdminOrders();

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) ?? 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length ?? 0;

  const stats = [
    { title: 'Total Products', value: products?.length ?? 0, icon: Package, color: 'text-primary' },
    { title: 'Categories', value: categories?.length ?? 0, icon: Tags, color: 'text-secondary' },
    { title: 'Total Orders', value: orders?.length ?? 0, icon: ShoppingBag, color: 'text-accent' },
    { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-neon-green' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{pendingOrders}</p>
              <p className="text-sm text-muted-foreground">Orders awaiting processing</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">
                {products?.filter(p => p.stock <= 5).length ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">Products with 5 or less in stock</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
