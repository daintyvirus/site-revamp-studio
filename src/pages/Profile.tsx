import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { User, Package, Heart, Settings, ChevronRight, Download, Shield, LogOut, Wallet, ExternalLink, CheckCircle2, Copy, Eye, EyeOff, Info } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useUpdateProfile } from '@/hooks/useProfile';
import { generateInvoicePDF } from '@/lib/generateInvoice';
import { useCurrency } from '@/hooks/useCurrency';
import type { Order } from '@/types/database';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type TabType = 'orders' | 'wishlist' | 'profile' | 'settings';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-muted-foreground/20 text-muted-foreground',
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
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState<Record<string, boolean>>({});
  
  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  // Handle tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'wishlist' || tab === 'profile' || tab === 'settings' || tab === 'orders') {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleItemDeliveryInfo = (itemId: string) => {
    setShowDeliveryInfo(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const sidebarItems = [
    { id: 'orders' as TabType, label: 'My Orders', description: 'View and track your purchases', icon: Package },
    { id: 'wishlist' as TabType, label: 'Wishlists', description: 'Track your desire items', icon: Heart },
    { id: 'profile' as TabType, label: 'Profile', description: 'Personalize your preferences', icon: User },
    { id: 'settings' as TabType, label: '2FA Settings', description: 'Security settings', icon: Shield, badge: 'OFF' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-5 sticky top-24">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-lg">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-foreground truncate">
                      {profile?.full_name || 'Welcome!'}
                    </h2>
                    <p className="text-xs text-muted-foreground">Personalize your preferences</p>
                  </div>
                </div>

                {/* Wallet Summary */}
                <div className="bg-muted/20 rounded-xl p-4 mb-5 border border-border/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">WALLET</p>
                  <p className="text-xs text-muted-foreground mb-3">Monitor your transactions</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">0 USD</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full border border-border/30">
                      +
                    </Button>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                        activeTab === item.id
                          ? "bg-muted/50 border border-primary/30"
                          : "hover:bg-muted/30 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        activeTab === item.id ? "bg-primary/20" : "bg-muted/50"
                      )}>
                        <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium text-sm", activeTab === item.id ? "text-foreground" : "text-muted-foreground")}>
                          {item.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                      </div>
                      {item.badge && (
                        <Badge variant={item.badge === 'OFF' ? 'destructive' : 'default'} className="text-[10px] px-2 py-0.5">
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
                  className="w-full justify-start text-muted-foreground hover:text-destructive gap-3 px-4"
                  onClick={handleSignOut}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span>Logout</span>
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-muted/30 animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : !orders?.length ? (
                    <Card className="border-border/30 bg-card/30">
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
                        const isDelivered = order.status === 'completed' || order.status === 'delivered';
                        
                        return (
                          <Card 
                            key={order.id} 
                            className={cn(
                              "border-border/30 bg-card/30 overflow-hidden cursor-pointer transition-all hover:border-primary/30",
                              isDelivered && "border-l-4 border-l-green-500"
                            )}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                {/* Status Icon */}
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                  isDelivered ? "bg-green-500/20" : "bg-muted/50"
                                )}>
                                  {isDelivered ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>

                                {/* Order Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm">
                                      GB/ORDER-{order.id.slice(0, 6).toUpperCase()}
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={cn("text-[10px] border", paymentStatusColors[order.payment_status])}>
                                      PAYMENT.{order.payment_status.toUpperCase()}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      {order.items?.length || 0} ITEM{(order.items?.length || 0) > 1 ? 'S' : ''}
                                    </Badge>
                                    {order.items?.[0]?.product?.name && (
                                      <Badge variant="secondary" className="text-[10px]">
                                        {order.items[0].product.name}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Price & Arrow */}
                                <div className="flex items-center gap-3">
                                  <p className="font-semibold text-sm">{formatPrice(order.total, orderCurrency)}</p>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
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

              {/* Order Details Dialog - Kryptomate Style One-Click */}
              <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border-border/50">
                  {selectedOrder && (
                    <>
                      <DialogHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                          <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center",
                            selectedOrder.status === 'completed' || selectedOrder.status === 'delivered'
                              ? "bg-green-500/20"
                              : "bg-primary/20"
                          )}>
                            {selectedOrder.status === 'completed' || selectedOrder.status === 'delivered' ? (
                              <CheckCircle2 className="h-8 w-8 text-green-500" />
                            ) : (
                              <Package className="h-8 w-8 text-primary" />
                            )}
                          </div>
                        </div>
                        <DialogTitle className="text-2xl font-semibold">
                          {selectedOrder.status === 'completed' || selectedOrder.status === 'delivered' 
                            ? 'Your order has been delivered'
                            : `Order ${selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}`
                          }
                        </DialogTitle>
                        <p className="text-muted-foreground">
                          {selectedOrder.status === 'completed' || selectedOrder.status === 'delivered'
                            ? 'All set! Your order is complete and your items have been delivered. Enjoy!'
                            : 'Your order is being processed. You will receive your items soon.'
                          }
                        </p>
                      </DialogHeader>

                      <div className="grid lg:grid-cols-5 gap-6 mt-4">
                        {/* Left - All Items with Delivery Info (3 cols) */}
                        <div className="lg:col-span-3 space-y-4">
                          {/* Items List with Integrated Delivery/Codes */}
                          <div className="space-y-3">
                            {selectedOrder.items?.map((item, idx) => {
                              const itemKey = `${selectedOrder.id}-${idx}`;
                              const isRevealed = showDeliveryInfo[itemKey];
                              
                              return (
                                <div key={idx} className="bg-muted/30 rounded-xl border border-border/30 overflow-hidden">
                                  {/* Item Header */}
                                  <div className="p-4 flex gap-4">
                                    <div className="w-20 h-20 rounded-lg bg-muted/50 overflow-hidden flex-shrink-0">
                                      {item.product?.image_url ? (
                                        <img 
                                          src={item.product.image_url} 
                                          alt="" 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Package className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-sm mb-1">
                                        {item.product?.name || 'Product'}
                                      </h3>
                                      {item.variant?.name && (
                                        <Badge variant="outline" className="text-[10px] mb-2">
                                          {item.variant.name}
                                        </Badge>
                                      )}
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Qty: {item.quantity}</span>
                                        <span>{formatPrice(item.price, (selectedOrder as any).currency || 'BDT')}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Badge className={cn(
                                        "text-[10px]",
                                        selectedOrder.status === 'completed' || selectedOrder.status === 'delivered'
                                          ? "bg-green-500/20 text-green-400"
                                          : statusColors[selectedOrder.status]
                                      )}>
                                        {selectedOrder.status === 'completed' ? 'DELIVERED' : selectedOrder.status.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Delivery Info Section - Integrated */}
                                  {(selectedOrder.status === 'completed' || selectedOrder.status === 'delivered') && selectedOrder.delivery_info && (
                                    <div className="border-t border-border/30 p-4 bg-muted/20">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                          </div>
                                          <span className="text-xs font-semibold uppercase tracking-wider">YOUR CODE</span>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => toggleItemDeliveryInfo(itemKey)}
                                          >
                                            {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => copyToClipboard(selectedOrder.delivery_info || '')}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                                        <code className="font-mono text-sm break-all">
                                          {isRevealed ? selectedOrder.delivery_info : '••••••••••••••••'}
                                        </code>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* How to Redeem/Instructions */}
                          <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Info className="h-4 w-4 text-primary" />
                              </div>
                              <h4 className="font-semibold uppercase text-sm">HOW TO REDEEM</h4>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-2">
                              {(selectedOrder as any).delivery_instructions ? (
                                <p>{(selectedOrder as any).delivery_instructions}</p>
                              ) : (
                                <>
                                  <p>1. Copy your code from above by clicking the copy icon.</p>
                                  <p>2. Go to the official redemption page for the product.</p>
                                  <p>3. Enter or paste your code and follow the prompts.</p>
                                  <p>4. Enjoy your purchase!</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right - Order Summary (2 cols) */}
                        <div className="lg:col-span-2 space-y-4">
                          {/* Order Summary Card */}
                          <div className="bg-muted/30 rounded-xl p-4 border border-border/30 space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ORDER ID</p>
                              <p className="font-semibold text-sm">GB/ORDER-{selectedOrder.id.slice(0, 6).toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ORDER STATUS</p>
                              <Badge className={cn("px-3 py-1 text-xs", statusColors[selectedOrder.status])}>
                                {selectedOrder.status === 'completed' ? 'COMPLETED' : selectedOrder.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ORDER DATE</p>
                              <p className="text-sm">
                                {format(new Date(selectedOrder.created_at), "MMM dd, yyyy, hh:mm a")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PAYMENT STATUS</p>
                              <Badge className={cn("px-3 py-1 text-xs", paymentStatusColors[selectedOrder.payment_status])}>
                                {selectedOrder.payment_status.toUpperCase()}
                              </Badge>
                            </div>
                            {(selectedOrder as any).payment_method && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PAYMENT METHOD</p>
                                <p className="text-sm capitalize">{(selectedOrder as any).payment_method}</p>
                              </div>
                            )}
                            <Separator />
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">Total Amount</p>
                              <p className="font-bold text-lg">
                                {formatPrice(selectedOrder.total, (selectedOrder as any).currency || 'BDT')}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleDownloadInvoice(selectedOrder)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Invoice
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              asChild
                            >
                              <Link to={`/track-order?id=${selectedOrder.id}`}>
                                Track Order
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </Link>
                            </Button>
                          </div>

                          {/* Need Help */}
                          <div className="bg-muted/20 rounded-xl p-4 border border-border/30 text-center">
                            <p className="text-xs text-muted-foreground mb-2">Need help with your order?</p>
                            <Button variant="ghost" size="sm" className="text-xs text-primary">
                              Contact Support
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  {wishlistLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-muted/30 animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : !wishlist?.length ? (
                    <Card className="border-border/30 bg-card/30">
                      <CardContent className="py-12 text-center">
                        <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                        <Button asChild size="sm">
                          <Link to="/shop">Browse Products</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {wishlist.map((item) => (
                        <Card key={item.id} className="border-border/30 bg-card/30 overflow-hidden group">
                          <div className="relative aspect-square bg-muted/20">
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

                  <Card className="border-border/30 bg-card/30">
                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={isEditing ? fullName : (profile?.full_name || '')}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your name"
                          className="bg-muted/30 border-border/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user.email || ''} disabled className="bg-muted/30 border-border/30" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          value={isEditing ? phone : (profile?.phone || '')}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your phone"
                          className="bg-muted/30 border-border/30"
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

                  <Card className="border-border/30 bg-card/30">
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

                  <Card className="border-border/30 bg-card/30">
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
