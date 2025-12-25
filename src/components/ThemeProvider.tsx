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

export default function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    
    // Apply primary color
    const primaryColor = settings.primary_color;
    if (primaryColor) {
      const hsl = hexToHsl(primaryColor);
      if (hsl) {
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
      }
    }
    
    // Apply accent color
    const accentColor = settings.accent_color;
    if (accentColor) {
      const hsl = hexToHsl(accentColor);
      if (hsl) {
        root.style.setProperty('--accent', hsl);
      }
    }
    
    // Apply secondary color
    const secondaryColor = settings.secondary_color;
    if (secondaryColor) {
      const hsl = hexToHsl(secondaryColor);
      if (hsl) {
        root.style.setProperty('--secondary', hsl);
      }
    }

    // Cleanup function to reset styles
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--secondary');
    };
  }, [settings]);

  return <>{children}</>;
}
