import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useActivePromotionalBanners } from '@/hooks/usePromotionalBanners';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromotionalBanner() {
  const { data: banners, isLoading } = useActivePromotionalBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!banners || banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners, isPaused]);

  if (isLoading || !banners || banners.length === 0 || !isVisible) return null;

  const currentBanner = banners[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const BannerContent = () => (
    <span className="text-sm md:text-base font-medium">{currentBanner.text}</span>
  );

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: currentBanner.background_color || '#D4AF37',
        color: currentBanner.text_color || '#1a1a1a',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-4">
        {banners.length > 1 && (
          <button
            onClick={goToPrevious}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 text-center"
          >
            {currentBanner.link_url ? (
              <Link 
                to={currentBanner.link_url} 
                className="hover:underline inline-flex items-center gap-2"
              >
                <BannerContent />
              </Link>
            ) : (
              <BannerContent />
            )}
          </motion.div>
        </AnimatePresence>

        {banners.length > 1 && (
          <button
            onClick={goToNext}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex ? 'w-4 bg-current' : 'w-1 bg-current/40'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
