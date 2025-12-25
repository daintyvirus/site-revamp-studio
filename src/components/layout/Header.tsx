import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, LogOut, Settings, Package, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useNavigationMenu } from '@/hooks/useNavigationMenu';
import { useCategories } from '@/hooks/useProducts';
import { useCurrency } from '@/hooks/useCurrency';
import { ThemeToggle } from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const { data: settings } = useSiteSettings();
  const { data: headerNavItems } = useNavigationMenu('header');
  const { data: categories } = useCategories();
  const { formatPrice, currency } = useCurrency();

  const cartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const wishlistCount = wishlist?.length ?? 0;
  
  // Calculate cart total
  const cartTotal = cart?.reduce((sum, item) => {
    const price = currency === 'USD' 
      ? (item.product?.sale_price || item.product?.price || 0)
      : (item.product?.sale_price_bdt || item.product?.price_bdt || 0);
    return sum + price * item.quantity;
  }, 0) ?? 0;
  
  const siteName = settings?.site_name || 'GOLDENBUMPS';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Show first 6 categories in the category bar
  const displayCategories = categories?.slice(0, 6) ?? [];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/30">
      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="font-display text-xl font-bold tracking-tight">
              <span className="text-primary">GOLDEN</span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">BUMPS</span>
            </span>
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search all products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-11 bg-muted/50 border-border/50 rounded-xl focus:bg-muted focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/70"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Currency Toggle */}
            <div className="hidden sm:block">
              <CurrencyToggle />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart with Amount */}
            <Button variant="ghost" size="sm" asChild className="relative hover:bg-muted gap-2 px-3">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  {currency === 'USD' ? `$${cartTotal.toFixed(0)}` : `৳${Math.round(cartTotal)}`}
                </span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-accent text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {user.email?.charAt(0)?.toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-md border-border/50">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Member Account</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 cursor-pointer">
                      <Heart className="h-4 w-4" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{wishlistCount}</span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-border/50" />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 text-primary cursor-pointer">
                          <Settings className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-medium">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar - Desktop */}
      <div className="hidden lg:block border-t border-border/20 bg-card/30">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1 h-12 overflow-x-auto scrollbar-hide">
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all whitespace-nowrap"
              >
                {category.icon && <span className="text-base">{category.icon}</span>}
                {category.name}
              </Link>
            ))}
            {(categories?.length || 0) > 6 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all">
                    More
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border-border/50">
                  {categories?.slice(6).map((category) => (
                    <DropdownMenuItem key={category.id} asChild>
                      <Link to={`/shop?category=${category.slug}`} className="flex items-center gap-2 cursor-pointer">
                        {category.icon && <span>{category.icon}</span>}
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Navigation Links */}
            {headerNavItems?.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                target={item.open_in_new_tab ? '_blank' : undefined}
                rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all whitespace-nowrap"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        'lg:hidden overflow-hidden transition-all duration-300 ease-out bg-card/95 backdrop-blur-md',
        isMenuOpen ? 'max-h-[500px] pb-4 border-t border-border/30' : 'max-h-0'
      )}>
        <div className="container mx-auto px-4 pt-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-muted/50 border-border/50 rounded-xl"
              />
            </div>
          </form>

          {/* Mobile Categories */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories?.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Nav */}
          <nav className="flex flex-col gap-1">
            {headerNavItems?.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                target={item.open_in_new_tab ? '_blank' : undefined}
                rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                className="px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
