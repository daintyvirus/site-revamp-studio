import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

function hexToHsl(hex: string): string | null {
  if (!hex || !hex.startsWith('#')) return null;
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Font family mappings for Google Fonts
const fontFamilyMap: Record<string, string> = {
  'Inter': "'Inter', sans-serif",
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  'DM Sans': "'DM Sans', sans-serif",
  'Poppins': "'Poppins', sans-serif",
  'Roboto': "'Roboto', sans-serif",
  'Open Sans': "'Open Sans', sans-serif",
  'Montserrat': "'Montserrat', sans-serif",
  'Lato': "'Lato', sans-serif",
  'Oswald': "'Oswald', sans-serif",
  'Raleway': "'Raleway', sans-serif",
  'Nunito': "'Nunito', sans-serif",
  'JetBrains Mono': "'JetBrains Mono', monospace",
};

export default function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    
    // ========== COLOR SETTINGS ==========
    // Primary color
    if (settings.primary_color) {
      const hsl = hexToHsl(settings.primary_color);
      if (hsl) {
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
      }
    }
    
    // Accent color
    if (settings.accent_color) {
      const hsl = hexToHsl(settings.accent_color);
      if (hsl) {
        root.style.setProperty('--accent', hsl);
      }
    }
    
    // Secondary color
    if (settings.secondary_color) {
      const hsl = hexToHsl(settings.secondary_color);
      if (hsl) {
        root.style.setProperty('--secondary', hsl);
      }
    }

    // ========== TYPOGRAPHY SETTINGS ==========
    // Heading font
    if (settings.heading_font_family) {
      const fontFamily = fontFamilyMap[settings.heading_font_family] || settings.heading_font_family;
      root.style.setProperty('--font-display', fontFamily);
    }
    
    // Body font
    if (settings.body_font_family) {
      const fontFamily = fontFamilyMap[settings.body_font_family] || settings.body_font_family;
      root.style.setProperty('--font-body', fontFamily);
    }
    
    // Body font size
    if (settings.body_font_size) {
      root.style.setProperty('--font-size-base', `${settings.body_font_size}px`);
    }
    
    // Heading color
    if (settings.heading_color) {
      const hsl = hexToHsl(settings.heading_color);
      if (hsl) {
        root.style.setProperty('--heading-color', hsl);
      }
    }
    
    // Body color
    if (settings.body_color) {
      const hsl = hexToHsl(settings.body_color);
      if (hsl) {
        root.style.setProperty('--body-color', hsl);
      }
    }

    // ========== LINK SETTINGS ==========
    if (settings.link_color) {
      root.style.setProperty('--link-color', settings.link_color);
    }
    if (settings.link_hover_color) {
      root.style.setProperty('--link-hover-color', settings.link_hover_color);
    }

    // ========== BUTTON SETTINGS ==========
    if (settings.button_bg_color) {
      const hsl = hexToHsl(settings.button_bg_color);
      if (hsl) root.style.setProperty('--button-bg', hsl);
    }
    if (settings.button_text_color) {
      const hsl = hexToHsl(settings.button_text_color);
      if (hsl) root.style.setProperty('--button-text', hsl);
    }
    if (settings.button_hover_bg_color) {
      const hsl = hexToHsl(settings.button_hover_bg_color);
      if (hsl) root.style.setProperty('--button-hover-bg', hsl);
    }
    if (settings.button_hover_text_color) {
      const hsl = hexToHsl(settings.button_hover_text_color);
      if (hsl) root.style.setProperty('--button-hover-text', hsl);
    }
    if (settings.button_border_radius) {
      root.style.setProperty('--button-radius', `${settings.button_border_radius}px`);
    }

    // ========== HEADER SETTINGS ==========
    if (settings.header_bg_color) {
      const hsl = hexToHsl(settings.header_bg_color);
      if (hsl) root.style.setProperty('--header-bg', hsl);
    }
    if (settings.header_text_color) {
      root.style.setProperty('--header-text', settings.header_text_color);
    }
    if (settings.header_hover_color) {
      root.style.setProperty('--header-hover', settings.header_hover_color);
    }

    // ========== FOOTER SETTINGS ==========
    if (settings.footer_bg_color) {
      const hsl = hexToHsl(settings.footer_bg_color);
      if (hsl) root.style.setProperty('--footer-bg', hsl);
    }
    if (settings.footer_text_color) {
      root.style.setProperty('--footer-text', settings.footer_text_color);
    }
    if (settings.footer_link_color) {
      root.style.setProperty('--footer-link', settings.footer_link_color);
    }
    if (settings.footer_link_hover_color) {
      root.style.setProperty('--footer-link-hover', settings.footer_link_hover_color);
    }

    // ========== CARD SETTINGS ==========
    if (settings.card_bg_color) {
      const hsl = hexToHsl(settings.card_bg_color);
      if (hsl) root.style.setProperty('--card', hsl);
    }
    if (settings.card_border_color) {
      const hsl = hexToHsl(settings.card_border_color);
      if (hsl) root.style.setProperty('--card-border', hsl);
    }
    if (settings.card_border_radius) {
      root.style.setProperty('--card-radius', `${settings.card_border_radius}px`);
    }
    if (settings.product_title_color) {
      root.style.setProperty('--product-title', settings.product_title_color);
    }
    if (settings.product_price_color) {
      root.style.setProperty('--product-price', settings.product_price_color);
    }
    if (settings.sale_price_color) {
      root.style.setProperty('--sale-price', settings.sale_price_color);
    }

    // ========== BADGE SETTINGS ==========
    if (settings.badge_new_bg) {
      root.style.setProperty('--badge-new-bg', settings.badge_new_bg);
    }
    if (settings.badge_new_text) {
      root.style.setProperty('--badge-new-text', settings.badge_new_text);
    }
    if (settings.badge_sale_bg) {
      root.style.setProperty('--badge-sale-bg', settings.badge_sale_bg);
    }
    if (settings.badge_sale_text) {
      root.style.setProperty('--badge-sale-text', settings.badge_sale_text);
    }
    if (settings.badge_featured_bg) {
      root.style.setProperty('--badge-featured-bg', settings.badge_featured_bg);
    }
    if (settings.badge_featured_text) {
      root.style.setProperty('--badge-featured-text', settings.badge_featured_text);
    }

    // ========== LAYOUT SETTINGS ==========
    if (settings.container_max_width) {
      root.style.setProperty('--container-max-width', `${settings.container_max_width}px`);
    }
    if (settings.section_spacing) {
      root.style.setProperty('--section-spacing', `${settings.section_spacing}px`);
    }

    // ========== CUSTOM CSS ==========
    let customStyleEl = document.getElementById('custom-theme-styles');
    if (settings.custom_css) {
      if (!customStyleEl) {
        customStyleEl = document.createElement('style');
        customStyleEl.id = 'custom-theme-styles';
        document.head.appendChild(customStyleEl);
      }
      customStyleEl.textContent = settings.custom_css;
    } else if (customStyleEl) {
      customStyleEl.remove();
    }

    // ========== ANIMATIONS TOGGLE ==========
    if (settings.enable_animations === 'false') {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Cleanup function
    return () => {
      const propsToRemove = [
        '--primary', '--ring', '--accent', '--secondary',
        '--font-display', '--font-body', '--font-size-base',
        '--heading-color', '--body-color',
        '--link-color', '--link-hover-color',
        '--button-bg', '--button-text', '--button-hover-bg', '--button-hover-text', '--button-radius',
        '--header-bg', '--header-text', '--header-hover',
        '--footer-bg', '--footer-text', '--footer-link', '--footer-link-hover',
        '--card', '--card-border', '--card-radius',
        '--product-title', '--product-price', '--sale-price',
        '--badge-new-bg', '--badge-new-text', '--badge-sale-bg', '--badge-sale-text',
        '--badge-featured-bg', '--badge-featured-text',
        '--container-max-width', '--section-spacing'
      ];
      propsToRemove.forEach(prop => root.style.removeProperty(prop));
      
      const customStyleEl = document.getElementById('custom-theme-styles');
      if (customStyleEl) customStyleEl.remove();
    };
  }, [settings]);

  return <>{children}</>;
}
