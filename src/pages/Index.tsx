import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import CategorySection from '@/components/home/CategorySection';
import BestSellersSection from '@/components/home/BestSellersSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import NewArrivalsSection from '@/components/home/NewArrivalsSection';
import BrandsSection from '@/components/home/BrandsSection';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Index() {
  const { data: settings } = useSiteSettings();
  
  const seoTitle = settings?.seo_title || 'GoldenBumps - Online Gaming Store | Gift Cards, Top-Ups & More';
  const seoDescription = settings?.seo_description || 'Your trusted source for digital gaming products. Buy gift cards, game top-ups, subscriptions, and gaming accounts with instant delivery.';

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
      </Helmet>
      <Layout>
        <HeroSection />
        <AdvantagesSection />
        <CategorySection />
        <BestSellersSection />
        <FeaturedProducts />
        <NewArrivalsSection />
        <BrandsSection />
      </Layout>
    </>
  );
}
