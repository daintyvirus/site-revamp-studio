-- Add comprehensive typography and styling settings like WooCommerce Customizer
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, label, description, sort_order) VALUES
-- Typography - Headings
('heading_font_family', 'Space Grotesk', 'select', 'typography', 'Heading Font', 'Font family for all headings (H1-H6)', 1),
('heading_font_weight', '600', 'select', 'typography', 'Heading Font Weight', 'Weight for heading text', 2),
('heading_color', '', 'color', 'typography', 'Heading Color', 'Color for all headings', 3),
-- Typography - Body
('body_font_family', 'Inter', 'select', 'typography', 'Body Font', 'Font family for body text', 4),
('body_font_size', '16', 'number', 'typography', 'Body Font Size (px)', 'Base font size for body text', 5),
('body_color', '', 'color', 'typography', 'Body Text Color', 'Color for body text', 6),
-- Links
('link_color', '', 'color', 'links', 'Link Color', 'Default link color', 1),
('link_hover_color', '', 'color', 'links', 'Link Hover Color', 'Link color on hover', 2),
-- Buttons
('button_bg_color', '', 'color', 'buttons', 'Button Background', 'Primary button background color', 1),
('button_text_color', '', 'color', 'buttons', 'Button Text Color', 'Primary button text color', 2),
('button_hover_bg_color', '', 'color', 'buttons', 'Button Hover Background', 'Button background on hover', 3),
('button_hover_text_color', '', 'color', 'buttons', 'Button Hover Text', 'Button text color on hover', 4),
('button_border_radius', '8', 'number', 'buttons', 'Button Border Radius (px)', 'Roundness of button corners', 5),
-- Header
('header_text_color', '', 'color', 'header', 'Header Text Color', 'Color for header navigation links', 1),
('header_hover_color', '', 'color', 'header', 'Header Hover Color', 'Header link hover color', 2),
('header_sticky', 'true', 'boolean', 'header', 'Sticky Header', 'Keep header fixed when scrolling', 3),
('header_show_search', 'true', 'boolean', 'header', 'Show Search Bar', 'Display search bar in header', 4),
('header_show_cart', 'true', 'boolean', 'header', 'Show Cart Icon', 'Display cart icon in header', 5),
-- Footer
('footer_text_color', '', 'color', 'footer', 'Footer Text Color', 'Color for footer text', 3),
('footer_link_color', '', 'color', 'footer', 'Footer Link Color', 'Color for footer links', 4),
('footer_link_hover_color', '', 'color', 'footer', 'Footer Link Hover', 'Footer link hover color', 5),
('footer_show_social', 'true', 'boolean', 'footer', 'Show Social Icons', 'Display social media icons', 6),
('footer_show_newsletter', 'false', 'boolean', 'footer', 'Show Newsletter', 'Display newsletter signup', 7),
-- Cards/Products
('card_bg_color', '', 'color', 'cards', 'Card Background', 'Background color for product cards', 1),
('card_border_color', '', 'color', 'cards', 'Card Border Color', 'Border color for cards', 2),
('card_hover_shadow', 'true', 'boolean', 'cards', 'Card Hover Shadow', 'Add shadow effect on card hover', 3),
('card_border_radius', '12', 'number', 'cards', 'Card Border Radius (px)', 'Roundness of card corners', 4),
('product_title_color', '', 'color', 'cards', 'Product Title Color', 'Color for product titles', 5),
('product_price_color', '', 'color', 'cards', 'Price Color', 'Color for product prices', 6),
('sale_price_color', '#ef4444', 'color', 'cards', 'Sale Price Color', 'Color for sale/discounted prices', 7),
-- Badges
('badge_new_bg', '#22c55e', 'color', 'badges', 'New Badge Background', 'Background for "New" badge', 1),
('badge_new_text', '#ffffff', 'color', 'badges', 'New Badge Text', 'Text color for "New" badge', 2),
('badge_sale_bg', '#ef4444', 'color', 'badges', 'Sale Badge Background', 'Background for "Sale" badge', 3),
('badge_sale_text', '#ffffff', 'color', 'badges', 'Sale Badge Text', 'Text color for "Sale" badge', 4),
('badge_featured_bg', '#f59e0b', 'color', 'badges', 'Featured Badge Background', 'Background for "Featured" badge', 5),
('badge_featured_text', '#ffffff', 'color', 'badges', 'Featured Badge Text', 'Text color for "Featured" badge', 6),
-- Layout
('container_max_width', '1400', 'number', 'layout', 'Max Container Width (px)', 'Maximum width of page content', 1),
('section_spacing', '80', 'number', 'layout', 'Section Spacing (px)', 'Vertical spacing between sections', 2),
('enable_animations', 'true', 'boolean', 'layout', 'Enable Animations', 'Enable page animations and transitions', 3),
-- Advanced
('custom_css', '', 'textarea', 'advanced', 'Custom CSS', 'Add your own CSS styles', 1),
('custom_js', '', 'textarea', 'advanced', 'Custom JavaScript', 'Add custom JavaScript code (use carefully)', 2);

-- Update existing appearance settings sort order
UPDATE site_settings SET sort_order = 10 WHERE setting_key = 'primary_color';
UPDATE site_settings SET sort_order = 11 WHERE setting_key = 'secondary_color';
UPDATE site_settings SET sort_order = 12 WHERE setting_key = 'accent_color';
UPDATE site_settings SET sort_order = 13 WHERE setting_key = 'header_bg_color';
UPDATE site_settings SET sort_order = 14 WHERE setting_key = 'footer_bg_color';
UPDATE site_settings SET sort_order = 15 WHERE setting_key = 'button_style';