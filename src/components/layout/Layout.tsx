import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import PromotionalBanner from '@/components/home/PromotionalBanner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Subtle background pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      <PromotionalBanner />
      <Header />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
}
