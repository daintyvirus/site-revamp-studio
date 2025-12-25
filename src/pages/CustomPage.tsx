import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePage, PageSection } from '@/hooks/useCustomPages';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight, Check } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

// Section renderers
function HeroSection({ section }: { section: PageSection }) {
  return (
    <section 
      className="relative py-20 md:py-32"
      style={{ 
        backgroundColor: section.background_color || undefined,
        color: section.text_color || undefined 
      }}
    >
      {section.image_url && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${section.image_url})` }}
        >
          <div className="absolute inset-0 bg-background/80" />
        </div>
      )}
      <div className="container mx-auto px-4 relative z-10 text-center">
        {section.subtitle && (
          <p className="text-primary font-medium mb-4">{section.subtitle}</p>
        )}
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
          {section.title}
        </h1>
        {section.content && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {section.content}
          </p>
        )}
        {(section.button_text || section.secondary_button_text) && (
          <div className="flex flex-wrap justify-center gap-4">
            {section.button_text && section.button_url && (
              <Button asChild size="lg">
                <Link to={section.button_url}>
                  {section.button_text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {section.secondary_button_text && section.secondary_button_url && (
              <Button asChild variant="outline" size="lg">
                <Link to={section.secondary_button_url}>
                  {section.secondary_button_text}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TextSection({ section }: { section: PageSection }) {
  return (
    <section 
      className="py-16"
      style={{ 
        backgroundColor: section.background_color || undefined,
        color: section.text_color || undefined 
      }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {section.title && (
          <h2 className="font-display text-3xl font-bold mb-4 text-center">
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="text-lg text-muted-foreground text-center mb-8">
            {section.subtitle}
          </p>
        )}
        {section.content && (
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }}
          />
        )}
      </div>
    </section>
  );
}

function ImageSection({ section }: { section: PageSection }) {
  return (
    <section 
      className="py-16"
      style={{ backgroundColor: section.background_color || undefined }}
    >
      <div className="container mx-auto px-4">
        {section.title && (
          <h2 className="font-display text-3xl font-bold mb-8 text-center">
            {section.title}
          </h2>
        )}
        {section.image_url && (
          <img 
            src={section.image_url} 
            alt={section.title || 'Image'} 
            className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg"
          />
        )}
        {section.content && (
          <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">
            {section.content}
          </p>
        )}
      </div>
    </section>
  );
}

function CTASection({ section }: { section: PageSection }) {
  return (
    <section 
      className="py-20"
      style={{ 
        backgroundColor: section.background_color || 'hsl(var(--primary))',
        color: section.text_color || 'hsl(var(--primary-foreground))'
      }}
    >
      <div className="container mx-auto px-4 text-center">
        {section.title && (
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {section.title}
          </h2>
        )}
        {section.content && (
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            {section.content}
          </p>
        )}
        {section.button_text && section.button_url && (
          <Button asChild size="lg" variant="secondary">
            <Link to={section.button_url}>
              {section.button_text}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}

function FeaturesSection({ section }: { section: PageSection }) {
  return (
    <section 
      className="py-16"
      style={{ backgroundColor: section.background_color || undefined }}
    >
      <div className="container mx-auto px-4">
        {section.title && (
          <h2 className="font-display text-3xl font-bold mb-4 text-center">
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {section.subtitle}
          </p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.feature_items?.map((feature) => (
            <div key={feature.id} className="text-center p-6 rounded-2xl bg-card border border-border/50">
              {feature.icon && (
                <div className="text-4xl mb-4">{feature.icon}</div>
              )}
              {feature.image_url && (
                <img src={feature.image_url} alt={feature.title} className="w-16 h-16 mx-auto mb-4 rounded-lg" />
              )}
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              {feature.description && (
                <p className="text-muted-foreground">{feature.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ section }: { section: PageSection }) {
  return (
    <section 
      className="py-16"
      style={{ backgroundColor: section.background_color || undefined }}
    >
      <div className="container mx-auto px-4 max-w-3xl">
        {section.title && (
          <h2 className="font-display text-3xl font-bold mb-4 text-center">
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="text-lg text-muted-foreground text-center mb-12">
            {section.subtitle}
          </p>
        )}
        <Accordion type="single" collapsible className="space-y-4">
          {section.faq_items?.map((faq, index) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="border rounded-xl px-6 data-[state=open]:bg-muted/50"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CustomHTMLSection({ section }: { section: PageSection }) {
  if (!section.content) return null;
  
  return (
    <section 
      className="py-16"
      style={{ backgroundColor: section.background_color || undefined }}
    >
      <div className="container mx-auto px-4">
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    </section>
  );
}

function SectionRenderer({ section }: { section: PageSection }) {
  switch (section.section_type) {
    case 'hero':
      return <HeroSection section={section} />;
    case 'text':
      return <TextSection section={section} />;
    case 'image':
      return <ImageSection section={section} />;
    case 'cta':
      return <CTASection section={section} />;
    case 'features':
      return <FeaturesSection section={section} />;
    case 'faq':
      return <FAQSection section={section} />;
    case 'custom_html':
      return <CustomHTMLSection section={section} />;
    default:
      return <TextSection section={section} />;
  }
}

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = usePage(slug || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!page || error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{page.meta_title || page.title}</title>
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
      </Helmet>
      
      <div className="min-h-screen">
        {page.sections?.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
        
        {(!page.sections || page.sections.length === 0) && (
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
            <p className="text-muted-foreground">This page has no content yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
