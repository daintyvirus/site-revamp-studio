import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
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
        <CategorySection />
        <FeaturedProducts />
        <BrandsSection />
      </Layout>
    </>
  );
}
