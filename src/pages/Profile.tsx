import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { User, Mail, Phone, Package, Heart, Settings, Edit2, Save, X, ChevronRight, Download, ShoppingCart, Shield, LogOut, Wallet } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useWishlist } from '@/hooks/useWishlist';
import { useUpdateProfile } from '@/hooks/useProfile';
import { generateInvoicePDF } from '@/lib/generateInvoice';
import { useCurrency } from '@/hooks/useCurrency';
import type { Order } from '@/types/database';
import { cn } from '@/lib/utils';

type TabType = 'orders' | 'wishlist' | 'profile' | 'settings';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-primary/20 text-primary border-primary/30',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
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
          <h1 className="font-display text-2xl font-bold mb-2">Sign in to view your profile</h1>
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

  const recentOrders = orders?.slice(0, 5) || [];
  const totalSpent = orders?.reduce((sum, order) => {
    if (order.payment_status === 'paid') {
      return sum + Number(order.total);
    }
    return sum;
  }, 0) || 0;

  const sidebarItems = [
    { id: 'orders' as TabType, label: 'My Orders', description: 'View and track your purchases', icon: Package },
    { id: 'wishlist' as TabType, label: 'Wishlists', description: 'Track your desire items', icon: Heart },
    { id: 'profile' as TabType, label: 'Profile', description: 'Personalize your preferences', icon: Settings },
    { id: 'settings' as TabType, label: '2FA Settings', description: 'For extra security', icon: Shield, badge: 'DISABLED' },
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Kryptomate Style */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="profile-sidebar-gradient rounded-2xl p-6 text-white sticky top-24">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-accent-foreground text-xl font-bold">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">
                      {profile?.full_name || 'Welcome!'}
                    </h2>
                    <p className="text-white/70 text-sm">Personalize your preferences</p>
                  </div>
                </div>

                {/* Wallet Section */}
                <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-2">WALLET</p>
                  <p className="text-sm text-white/70 mb-3">Monitor your transactions</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-white/60" />
                      <span className="font-mono font-medium">{orders?.length || 0}</span>
                      <span className="text-white/60 text-sm">Orders</span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="space-y-2">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                        activeTab === item.id
                          ? "bg-white/20 backdrop-blur-sm"
                          : "hover:bg-white/10"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-white/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-xs text-white/60 truncate">{item.description}</p>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="bg-destructive/20 text-destructive text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>

                {/* Sign Out */}
                <Separator className="my-6 bg-white/20" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
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
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="font-display text-2xl font-bold">My Orders</h1>
                    <Button asChild variant="outline">
                      <Link to="/orders">View All Orders</Link>
                    </Button>
                  </div>

                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <Card className="border-border/50">
                      <CardContent className="pt-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-4">No orders yet</p>
                        <Button asChild>
                          <Link to="/shop">Start Shopping</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => {
                        const orderCurrency = (order as any).currency || 'BDT';
                        const isCompleted = order.status === 'completed';
                        
                        return (
                          <Card key={order.id} className="border-border/50 overflow-hidden">
                            {/* Status Header */}
                            {isCompleted && (
                              <div className="bg-primary/10 border-b border-primary/20 p-4 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div>
                                  <Badge className="status-completed mb-1">COMPLETED</Badge>
                                  <h3 className="font-display font-bold text-lg">Your order has been delivered</h3>
                                  <p className="text-sm text-muted-foreground">All set! Your order is complete and your items have been delivered. Enjoy!</p>
                                </div>
                              </div>
                            )}

                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row gap-6">
                                {/* Order Items */}
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-4">Order items</h4>
                                  {order.items?.slice(0, 2).map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 mb-4">
                                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center overflow-hidden">
                                        {item.product?.image_url ? (
                                          <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <Package className="h-8 w-8 text-muted-foreground" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-semibold">{item.product?.name}</h5>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                          {item.product?.short_description || 'Digital product'}
                                        </p>
                                        {isCompleted && (
                                          <Badge className="status-delivered">DELIVERED</Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {(order.items?.length ?? 0) > 2 && (
                                    <p className="text-sm text-muted-foreground">
                                      +{(order.items?.length ?? 0) - 2} more items
                                    </p>
                                  )}
                                </div>

                                {/* Order Summary */}
                                <div className="md:w-64 bg-muted/30 rounded-xl p-4 space-y-3">
                                  <h4 className="font-semibold text-sm">Order summary</h4>
                                  <p className="text-xs text-muted-foreground">Quick reference details, amounts, and payment status.</p>
                                  
                                  <div className="space-y-2 pt-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground uppercase tracking-wider">ORDER ID</p>
                                      <p className="font-mono font-semibold">KM/ORDER-{order.id.slice(0, 6).toUpperCase()}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground uppercase tracking-wider">ORDER STATUS</p>
                                      <Badge className={cn("mt-1", statusColors[order.status])}>
                                        {order.status.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground uppercase tracking-wider">ORDER DATE</p>
                                      <p className="font-medium">{format(new Date(order.created_at), 'MMM dd, yyyy, h:mm a')}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground uppercase tracking-wider">PAYMENT STATUS</p>
                                      <Badge className={cn("mt-1", order.payment_status === 'paid' ? 'status-paid' : 'status-pending')}>
                                        {order.payment_status.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground uppercase tracking-wider">PAYMENT METHOD</p>
                                      <p className="font-medium uppercase">{order.payment_method || 'N/A'}</p>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-muted-foreground">Total Amount</p>
                                      <p className="text-lg font-bold text-primary">{formatPrice(order.total, orderCurrency)}</p>
                                    </div>
                                  </div>

                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full mt-2"
                                    onClick={() => handleDownloadInvoice(order)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Invoice
                                  </Button>
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
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="font-display text-2xl font-bold">My Wishlist</h1>
                    <Button asChild variant="outline">
                      <Link to="/wishlist">View Full Wishlist</Link>
                    </Button>
                  </div>

                  {wishlistLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : !wishlist?.length ? (
                    <Card className="border-border/50">
                      <CardContent className="pt-8 text-center">
                        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                        <Button asChild>
                          <Link to="/shop">Explore Products</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {wishlist.slice(0, 8).map((item) => (
                        <Link 
                          key={item.id} 
                          to={`/product/${item.product?.slug}`}
                          className="group"
                        >
                          <Card className="border-border/50 overflow-hidden card-hover">
                            <div className="aspect-square bg-muted">
                              <img 
                                src={item.product?.image_url || '/placeholder.svg'} 
                                alt={item.product?.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <CardContent className="p-3">
                              <p className="font-medium text-sm line-clamp-1">{item.product?.name}</p>
                              <p className="text-sm text-primary font-bold">
                                ৳{Math.round(Number(item.product?.price_bdt || item.product?.price || 0)).toLocaleString()}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h1 className="font-display text-2xl font-bold">Profile Settings</h1>
                  
                  <Card className="border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Manage your account details</CardDescription>
                        </div>
                        {!isEditing ? (
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          {isEditing ? (
                            <Input
                              id="fullName"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{profile?.full_name || 'Not set'}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          {isEditing ? (
                            <Input
                              id="phone"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Enter your phone number"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{profile?.phone || 'Not set'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h1 className="font-display text-2xl font-bold">Security Settings</h1>
                  
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>Add an extra layer of security to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">2FA Authentication</p>
                            <p className="text-sm text-muted-foreground">
                              Currently disabled. Enable for enhanced security.
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                          DISABLED
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Two-factor authentication will be available soon. Stay tuned!
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>Email Notifications</CardTitle>
                      <CardDescription>Manage your notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Updates</p>
                          <p className="text-sm text-muted-foreground">
                            Receive emails about your order status
                          </p>
                        </div>
                        <Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive important account notifications
                          </p>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
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
