import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { User, Package, Heart, Settings, ChevronRight, Download, Shield, LogOut, Wallet, ExternalLink } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useUpdateProfile } from '@/hooks/useProfile';
import { generateInvoicePDF } from '@/lib/generateInvoice';
import { useCurrency } from '@/hooks/useCurrency';
import type { Order } from '@/types/database';
import { cn } from '@/lib/utils';

type TabType = 'orders' | 'wishlist' | 'profile' | 'settings';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30',
};

function formatPrice(amount: number, currency: string): string {
  if (currency === 'USD') {
    return `$${Number(amount).toFixed(2)}`;
  }
  return `৳${Math.round(Number(amount)).toLocaleString()}`;
}

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();
  const { formatPrice: formatCurrencyPrice } = useCurrency();
  const updateProfile = useUpdateProfile();
  const toggleWishlist = useToggleWishlist();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  
  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2">Sign in to view your profile</h1>
          <p className="text-muted-foreground mb-6">Access your account, orders, and preferences</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleSaveProfile = async () => {
    if (!user) return;
    
    await updateProfile.mutateAsync({
      id: user.id,
      full_name: fullName,
      phone: phone,
    });
    
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setIsEditing(false);
  };

  const handleDownloadInvoice = (order: Order) => {
    generateInvoicePDF(order);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleRemoveFromWishlist = (productId: string) => {
    toggleWishlist.mutate(productId);
  };

  const sidebarItems = [
    { id: 'orders' as TabType, label: 'My Orders', icon: Package },
    { id: 'wishlist' as TabType, label: 'Wishlist', icon: Heart },
    { id: 'profile' as TabType, label: 'Profile', icon: Settings },
    { id: 'settings' as TabType, label: '2FA Settings', icon: Shield, badge: 'OFF' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-5 sticky top-24">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-foreground truncate">
                      {profile?.full_name || 'Welcome!'}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                {/* Wallet Summary */}
                <div className="bg-muted/30 rounded-xl p-4 mb-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Wallet</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{orders?.length || 0}</span>
                      <span className="text-sm text-muted-foreground">Orders</span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm",
                        activeTab === item.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  ))}
                </nav>

                {/* Sign Out */}
                <Separator className="my-5" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h1 className="text-xl font-semibold mb-4">My Orders</h1>

                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : !orders?.length ? (
                    <Card className="border-border/30">
                      <CardContent className="py-12 text-center">
                        <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-4">No orders yet</p>
                        <Button asChild size="sm">
                          <Link to="/shop">Start Shopping</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => {
                        const orderCurrency = (order as any).currency || 'BDT';
                        
                        return (
                          <Card key={order.id} className="border-border/30 overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                {/* Order Image */}
                                <div className="w-16 h-16 rounded-lg bg-muted/50 overflow-hidden flex-shrink-0">
                                  {order.items?.[0]?.product?.image_url ? (
                                    <img 
                                      src={order.items[0].product.image_url} 
                                      alt="" 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>

                                {/* Order Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-medium text-sm">
                                        {order.items?.[0]?.product?.name || 'Order'}
                                        {(order.items?.length ?? 0) > 1 && (
                                          <span className="text-muted-foreground"> +{(order.items?.length ?? 0) - 1} more</span>
                                        )}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                      </p>
                                    </div>
                                    <p className="font-semibold text-sm">{formatPrice(order.total, orderCurrency)}</p>
                                  </div>

                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className={cn("text-[10px]", statusColors[order.status])}>
                                      {order.status.toUpperCase()}
                                    </Badge>
                                    <Badge className={cn("text-[10px]", order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400')}>
                                      {order.payment_status.toUpperCase()}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-2 mt-3">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-7 text-xs"
                                      onClick={() => handleDownloadInvoice(order)}
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Invoice
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-xs"
                                      asChild
                                    >
                                      <Link to={`/track-order?id=${order.id}`}>
                                        Track Order
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  <h1 className="text-xl font-semibold mb-4">My Wishlist</h1>

                  {wishlistLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : !wishlist?.length ? (
                    <Card className="border-border/30">
                      <CardContent className="py-12 text-center">
                        <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                        <Button asChild size="sm">
                          <Link to="/shop">Browse Products</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {wishlist.map((item) => (
                        <Card key={item.id} className="border-border/30 overflow-hidden group">
                          <div className="relative aspect-square bg-muted/30">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <button
                              onClick={() => handleRemoveFromWishlist(item.product_id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </button>
                          </div>
                          <CardContent className="p-3">
                            <Link 
                              to={`/product/${item.product?.slug}`}
                              className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors"
                            >
                              {item.product?.name}
                            </Link>
                            <p className="text-sm font-semibold text-primary mt-1">
                              {formatCurrencyPrice(item.product?.price_bdt || 0, item.product?.price || 0)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold">Profile Settings</h1>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                    )}
                  </div>

                  <Card className="border-border/30">
                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={isEditing ? fullName : (profile?.full_name || '')}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user.email || ''} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          value={isEditing ? phone : (profile?.phone || '')}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your phone"
                        />
                      </div>
                      
                      {isEditing && (
                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h1 className="text-xl font-semibold mb-4">Security Settings</h1>

                  <Card className="border-border/30">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Badge variant="secondary">Coming Soon</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/30">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive promotional emails</p>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Updates</p>
                          <p className="text-sm text-muted-foreground">Get notified about your orders</p>
                        </div>
                        <Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
