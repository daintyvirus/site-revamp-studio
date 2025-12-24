import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function Index() {
  return (
    <>
      <Helmet>
        <title>GoldenBumps - Online Gaming Store | Gift Cards, Top-Ups & More</title>
        <meta name="description" content="Your trusted source for digital gaming products. Buy gift cards, game top-ups, subscriptions, and gaming accounts with instant delivery." />
      </Helmet>
      <Layout>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
      </Layout>
    </>
  );
}
