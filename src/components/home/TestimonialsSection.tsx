import { Star, Quote } from 'lucide-react';
import { useFeaturedTestimonials } from '@/hooks/useTestimonials';
import { useHomepageSection } from '@/hooks/useHomepageSections';
import { motion } from 'framer-motion';

export default function TestimonialsSection() {
  const { data: section } = useHomepageSection('testimonials');
  const { data: testimonials, isLoading } = useFeaturedTestimonials();

  if (section && !section.is_visible) return null;
  if (isLoading || !testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            {section?.title || 'What Our Customers Say'}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {section?.subtitle || 'Trusted by thousands of customers worldwide'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-lg p-6 border border-border/50 hover:border-border transition-colors"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'text-primary fill-primary'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>

              <p className="text-foreground/80 mb-4 text-sm leading-relaxed">
                "{testimonial.review_text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium text-sm">
                  {testimonial.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.customer_name}</p>
                  {testimonial.product_name && (
                    <p className="text-xs text-muted-foreground">
                      {testimonial.product_name}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
