-- Add theme/appearance settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, label, description, sort_order)
VALUES 
  -- Appearance/Theme settings
  ('primary_color', '#dc2626', 'color', 'appearance', 'Primary Color', 'Main accent color used for buttons and highlights', 1),
  ('secondary_color', '#1a1a1a', 'color', 'appearance', 'Secondary Color', 'Secondary color for backgrounds and accents', 2),
  ('accent_color', '#ef4444', 'color', 'appearance', 'Accent Color', 'Accent color for hover states and highlights', 3),
  ('header_bg_color', '', 'color', 'appearance', 'Header Background', 'Custom header background color (leave empty for default)', 4),
  ('footer_bg_color', '', 'color', 'appearance', 'Footer Background', 'Custom footer background color (leave empty for default)', 5),
  ('button_style', 'rounded', 'select', 'appearance', 'Button Style', 'Button corner style: rounded, square, or pill', 6),
  
  -- Homepage content settings
  ('hero_badge_text', 'Premium Digital Store', 'text', 'homepage', 'Hero Badge Text', 'Badge text shown above hero title', 1),
  ('hero_title', 'Level Up Your Gaming Experience', 'text', 'homepage', 'Hero Title', 'Main headline on the homepage hero section', 2),
  ('hero_subtitle', 'Get instant access to premium game keys, gift cards, and top-ups at unbeatable prices.', 'textarea', 'homepage', 'Hero Subtitle', 'Subtitle text under the hero title', 3),
  ('hero_cta_text', 'Shop Now', 'text', 'homepage', 'Hero CTA Button Text', 'Text for the main call-to-action button', 4),
  ('hero_cta_url', '/shop', 'text', 'homepage', 'Hero CTA Button URL', 'Link for the main call-to-action button', 5),
  
  -- Shop page settings
  ('products_per_page', '12', 'number', 'shop', 'Products Per Page', 'Number of products to show per page on shop', 1),
  ('show_out_of_stock', 'true', 'boolean', 'shop', 'Show Out of Stock', 'Display out of stock products on shop page', 2),
  ('default_sort', 'newest', 'select', 'shop', 'Default Sort Order', 'Default product sorting: newest, price-low, price-high, name', 3),
  
  -- Checkout settings
  ('min_order_amount', '0', 'number', 'checkout', 'Minimum Order Amount', 'Minimum order value to proceed to checkout (0 for no minimum)', 1),
  ('order_notes_enabled', 'true', 'boolean', 'checkout', 'Allow Order Notes', 'Let customers add notes to their orders', 2),
  ('terms_url', '/terms', 'text', 'checkout', 'Terms & Conditions URL', 'Link to terms and conditions page', 3),
  ('privacy_url', '/privacy', 'text', 'checkout', 'Privacy Policy URL', 'Link to privacy policy page', 4)
ON CONFLICT (setting_key) DO NOTHING;