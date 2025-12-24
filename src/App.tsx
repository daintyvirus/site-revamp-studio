import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { AnimatePresence, motion } from "framer-motion";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDelivery from "./pages/OrderDelivery";
import TrackOrder from "./pages/TrackOrder";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPaymentMethods from "./pages/admin/AdminPaymentMethods";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import AdminHeroImages from "./pages/admin/AdminHeroImages";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminNavigationMenu from "./pages/admin/AdminNavigationMenu";
import AdminHomepageSections from "./pages/admin/AdminHomepageSections";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminPromotionalBanners from "./pages/admin/AdminPromotionalBanners";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.35,
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId/delivery" element={<OrderDelivery />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/brands" element={<AdminBrands />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/payment-methods" element={<AdminPaymentMethods />} />
          <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
          <Route path="/admin/hero-images" element={<AdminHeroImages />} />
          <Route path="/admin/site-settings" element={<AdminSiteSettings />} />
          <Route path="/admin/navigation-menu" element={<AdminNavigationMenu />} />
          <Route path="/admin/homepage-sections" element={<AdminHomepageSections />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/promotional-banners" element={<AdminPromotionalBanners />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
