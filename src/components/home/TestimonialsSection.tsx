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
    <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {section?.title || 'What Our Customers Say'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {section?.subtitle || 'Trusted by thousands of gamers across Bangladesh'}
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
              className="bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>

              <p className="text-foreground/80 mb-4 text-sm leading-relaxed">
                "{testimonial.review_text}"
              </p>

              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  {testimonial.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.customer_name}</p>
                  {testimonial.product_name && (
                    <p className="text-xs text-muted-foreground">
                      Purchased: {testimonial.product_name}
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
