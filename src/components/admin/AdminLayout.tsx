import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingBag, CreditCard, Mail, ArrowLeft, Loader2, Image, Settings, Tag, Menu, Layout, Star, Megaphone, MessageSquare, Ticket, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { title: 'Products', path: '/admin/products', icon: Package },
  { title: 'Categories', path: '/admin/categories', icon: Tags },
  { title: 'Brands', path: '/admin/brands', icon: Tag },
  { title: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { title: 'Coupons', path: '/admin/coupons', icon: Ticket },
  { title: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
  { title: 'Payment Methods', path: '/admin/payment-methods', icon: CreditCard },
  { title: 'Email Templates', path: '/admin/email-templates', icon: Mail },
  { title: 'Page Builder', path: '/admin/pages', icon: FileText },
  { title: 'Hero Images', path: '/admin/hero-images', icon: Image },
  { title: 'Homepage Sections', path: '/admin/homepage-sections', icon: Layout },
  { title: 'Testimonials', path: '/admin/testimonials', icon: Star },
  { title: 'Promo Banners', path: '/admin/promotional-banners', icon: Megaphone },
  { title: 'Navigation Menu', path: '/admin/navigation-menu', icon: Menu },
  { title: 'Site Settings', path: '/admin/site-settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [isLoading, user, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex-shrink-0">
        <div className="sticky top-0 h-screen flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link to="/admin" className="font-display text-lg font-bold">
              <span className="text-primary">ADMIN</span> PANEL
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Back to Store */}
          <div className="p-4 border-t border-border">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
