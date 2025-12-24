import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import PromotionalBanner from '@/components/home/PromotionalBanner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PromotionalBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
