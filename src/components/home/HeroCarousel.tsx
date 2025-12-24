import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroImages } from '@/hooks/useHeroImages';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.2,
    rotateY: direction > 0 ? 15 : -15,
    filter: 'blur(10px)',
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '50%' : '-50%',
    opacity: 0,
    scale: 0.8,
    rotateY: direction < 0 ? -15 : 15,
    filter: 'blur(10px)',
  }),
};

const overlayVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function HeroCarousel() {
  const { data: images, isLoading } = useHeroImages();
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const imageIndex = images ? Math.abs(page % images.length) : 0;

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  // Auto-advance carousel
  useEffect(() => {
    if (!images || images.length <= 1 || isHovered) return;
    
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [images, paginate, isHovered]);

  if (isLoading || !images || images.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-destructive/10" />
    );
  }

  const currentImage = images[imageIndex];

  return (
    <div 
      className="absolute inset-0 overflow-hidden perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 200, damping: 25 },
            opacity: { duration: 0.6, ease: 'easeInOut' },
            scale: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
            rotateY: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
            filter: { duration: 0.4 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Image with Ken Burns effect */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentImage.image_url})`,
            }}
            initial={{ scale: 1, x: 0 }}
            animate={{ 
              scale: 1.15, 
              x: direction >= 0 ? '-3%' : '3%' 
            }}
            transition={{ duration: 12, ease: 'linear' }}
          />
          
          {/* Animated color overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-destructive/10"
            variants={overlayVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8 }}
          />
          
          {/* Gradient overlays for premium look */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
          
          {/* Animated scanline effect */}
          <motion.div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 4px)',
            }}
            animate={{ y: [0, 8] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Vignette effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.7)_100%)]" />
        </motion.div>
      </AnimatePresence>

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            initial={{ 
              x: `${20 + i * 15}%`, 
              y: '100%',
              opacity: 0 
            }}
            animate={{ 
              y: '-20%',
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Navigation arrows with enhanced styling */}
      {images.length > 1 && (
        <>
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/10 backdrop-blur-md hover:bg-background/30 text-foreground border border-border/30 shadow-xl transition-all duration-300 hover:border-primary/50"
              onClick={() => paginate(-1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </motion.div>
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/10 backdrop-blur-md hover:bg-background/30 text-foreground border border-border/30 shadow-xl transition-all duration-300 hover:border-primary/50"
              onClick={() => paginate(1)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </motion.div>
        </>
      )}

      {/* Enhanced dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setPage([index, index > imageIndex ? 1 : -1])}
              className="relative h-3 rounded-full overflow-hidden"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="h-full bg-foreground/20 backdrop-blur-sm"
                animate={{ 
                  width: index === imageIndex ? 32 : 12,
                }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              />
              {index === imageIndex && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-destructive"
                  layoutId="activeDot"
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Progress bar for auto-advance */}
      {images.length > 1 && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground/10 z-20">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-destructive"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
            key={page}
          />
        </div>
      )}

      {/* Animated border glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
      </div>
    </div>
  );
}