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

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const titleVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    rotateX: -45,
    filter: 'blur(10px)',
  },
  visible: { 
    opacity: 1, 
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    filter: 'blur(5px)',
    transition: {
      duration: 0.3,
    },
  },
};

const subtitleVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    x: -20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const decoratorVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { 
    scaleX: 1, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    scaleX: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
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
          
          {/* Text Overlay with Staggered Animation */}
          {(currentImage.title || currentImage.subtitle) && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${page}`}
                className="absolute bottom-32 left-8 md:left-16 z-10 max-w-lg"
                variants={textContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Decorative line */}
                <motion.div 
                  className="w-16 h-1 bg-gradient-to-r from-primary to-destructive mb-4 origin-left rounded-full"
                  variants={decoratorVariants}
                />
                
                {/* Title with character split animation */}
                {currentImage.title && (
                  <motion.h2
                    className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 drop-shadow-2xl"
                    variants={titleVariants}
                    style={{ perspective: 1000 }}
                  >
                    <span className="inline-block bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
                      {currentImage.title}
                    </span>
                  </motion.h2>
                )}
                
                {/* Subtitle */}
                {currentImage.subtitle && (
                  <motion.p
                    className="text-lg md:text-xl text-muted-foreground max-w-md backdrop-blur-sm bg-background/20 px-4 py-2 rounded-lg border border-border/20"
                    variants={subtitleVariants}
                  >
                    {currentImage.subtitle}
                  </motion.p>
                )}
                
                {/* CTA Button if link exists */}
                {currentImage.link_url && (
                  <motion.a
                    href={currentImage.link_url}
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-primary to-destructive text-primary-foreground font-semibold rounded-lg shadow-xl hover:shadow-primary/25 transition-all duration-300"
                    variants={subtitleVariants}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Now
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.a>
                )}
              </motion.div>
            </AnimatePresence>
          )}
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