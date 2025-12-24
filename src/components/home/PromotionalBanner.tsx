import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';
import { useActivePromotionalBanners, PromotionalBanner as BannerType } from '@/hooks/usePromotionalBanners';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  endTime: string;
  label: string | null;
}

function CountdownTimer({ endTime, label }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (isExpired) return null;

  return (
    <div className="flex items-center gap-2 ml-3">
      <Clock className="h-4 w-4" />
      <span className="text-xs md:text-sm font-medium">{label || 'Ends in:'}</span>
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-bold">
            {timeLeft.days}d
          </span>
        )}
        <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-bold">
          {String(timeLeft.hours).padStart(2, '0')}h
        </span>
        <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-bold">
          {String(timeLeft.minutes).padStart(2, '0')}m
        </span>
        <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-bold">
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
}

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

  const BannerContent = ({ banner }: { banner: BannerType }) => (
    <div className="flex items-center justify-center flex-wrap gap-1">
      <span className="text-sm md:text-base font-medium">{banner.text}</span>
      {banner.countdown_enabled && banner.countdown_end_time && (
        <CountdownTimer 
          endTime={banner.countdown_end_time} 
          label={banner.countdown_label} 
        />
      )}
    </div>
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
                <BannerContent banner={currentBanner} />
              </Link>
            ) : (
              <BannerContent banner={currentBanner} />
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
