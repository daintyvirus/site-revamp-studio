import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminSiteSettings, useBulkUpdateSiteSettings, SiteSetting } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  Palette, 
  Phone, 
  Share2, 
  FileText,
  Save,
  Loader2,
  Globe,
  DollarSign,
  ArrowRightLeft,
  Banknote,
  Home,
  ShoppingBag,
  CreditCard,
  Package,
  Bell,
  Type,
  Link as LinkIcon,
  MousePointer,
  LayoutGrid,
  Tag,
  Code,
  Eye,
  Sparkles
} from 'lucide-react';

// Category configuration
const categoryConfig: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
  branding: { icon: <Globe className="h-4 w-4" />, title: 'Branding', description: 'Site name, logo, and tagline' },
  appearance: { icon: <Palette className="h-4 w-4" />, title: 'Colors', description: 'Primary theme colors' },
  typography: { icon: <Type className="h-4 w-4" />, title: 'Typography', description: 'Fonts and text styles' },
  links: { icon: <LinkIcon className="h-4 w-4" />, title: 'Links', description: 'Link colors and hover effects' },
  buttons: { icon: <MousePointer className="h-4 w-4" />, title: 'Buttons', description: 'Button styles and colors' },
  header: { icon: <LayoutGrid className="h-4 w-4" />, title: 'Header', description: 'Header appearance and options' },
  footer: { icon: <FileText className="h-4 w-4" />, title: 'Footer', description: 'Footer content and styling' },
  cards: { icon: <CreditCard className="h-4 w-4" />, title: 'Product Cards', description: 'Product card appearance' },
  badges: { icon: <Tag className="h-4 w-4" />, title: 'Badges', description: 'Badge colors for products' },
  layout: { icon: <LayoutGrid className="h-4 w-4" />, title: 'Layout', description: 'Page layout and spacing' },
  homepage: { icon: <Home className="h-4 w-4" />, title: 'Homepage', description: 'Homepage content' },
  shop: { icon: <ShoppingBag className="h-4 w-4" />, title: 'Shop', description: 'Shop page settings' },
  checkout: { icon: <CreditCard className="h-4 w-4" />, title: 'Checkout', description: 'Checkout process settings' },
  contact: { icon: <Phone className="h-4 w-4" />, title: 'Contact', description: 'Contact information' },
  social: { icon: <Share2 className="h-4 w-4" />, title: 'Social', description: 'Social media links' },
  currency: { icon: <DollarSign className="h-4 w-4" />, title: 'Currency', description: 'Currency settings' },
  notifications: { icon: <Bell className="h-4 w-4" />, title: 'Notifications', description: 'Notification settings' },
  inventory: { icon: <Package className="h-4 w-4" />, title: 'Inventory', description: 'Stock settings' },
  seo: { icon: <Globe className="h-4 w-4" />, title: 'SEO', description: 'Search optimization' },
  advanced: { icon: <Code className="h-4 w-4" />, title: 'Advanced', description: 'Custom CSS & JavaScript' },
};

// Category order for tabs
const categoryOrder = [
  'branding', 'appearance', 'typography', 'links', 'buttons', 
  'header', 'footer', 'cards', 'badges', 'layout',
  'homepage', 'shop', 'checkout', 'contact', 'social', 
  'currency', 'notifications', 'inventory', 'seo', 'advanced'
];

// Font options
const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Nunito', label: 'Nunito' },
];

const fontWeightOptions = [
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi-Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra-Bold (800)' },
];

export default function AdminSiteSettings() {
  const { data: settings, isLoading } = useAdminSiteSettings();
  const bulkUpdate = useBulkUpdateSiteSettings();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      const values: Record<string, string> = {};
      settings.forEach(s => {
        values[s.id] = s.setting_value || '';
      });
      setFormValues(values);
    }
  }, [settings]);

  const handleChange = (id: string, value: string) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    
    const updates = settings
      .filter(s => formValues[s.id] !== (s.setting_value || ''))
      .map(s => ({
        id: s.id,
        setting_value: formValues[s.id],
      }));

    if (updates.length === 0) {
      setHasChanges(false);
      return;
    }

    await bulkUpdate.mutateAsync(updates);
    setHasChanges(false);
  };

  const groupedSettings = settings?.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>) || {};

  const categories = Object.keys(groupedSettings).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const renderSettingInput = (setting: SiteSetting) => {
    const value = formValues[setting.id] || '';
    
    // Font family selector
    if (setting.setting_key.includes('font_family')) {
      return (
        <Select value={value} onValueChange={(v) => handleChange(setting.id, v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map(font => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Font weight selector
    if (setting.setting_key.includes('font_weight')) {
      return (
        <Select value={value} onValueChange={(v) => handleChange(setting.id, v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select weight" />
          </SelectTrigger>
          <SelectContent>
            {fontWeightOptions.map(weight => (
              <SelectItem key={weight.value} value={weight.value}>
                {weight.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    // Color picker
    if (setting.setting_type === 'color' || setting.setting_key.includes('color') || setting.setting_key.includes('_bg') || setting.setting_key.includes('_text')) {
      return (
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleChange(setting.id, e.target.value)}
              className="w-14 h-10 p-1 cursor-pointer rounded-lg"
            />
          </div>
          <Input
            value={value}
            onChange={(e) => handleChange(setting.id, e.target.value)}
            placeholder="#000000"
            className="flex-1 font-mono text-sm"
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleChange(setting.id, '')}
              className="text-xs px-2"
            >
              Clear
            </Button>
          )}
        </div>
      );
    }
    
    // Boolean/toggle settings
    if (setting.setting_type === 'boolean' || setting.setting_key.includes('enabled') || setting.setting_key.includes('show_') || setting.setting_key.includes('_sticky') || setting.setting_key.includes('_shadow') || setting.setting_key.includes('enable_')) {
      return (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
          <span className="text-sm">{setting.description || setting.label}</span>
          <Switch
            checked={value === 'true'}
            onCheckedChange={(checked) => handleChange(setting.id, checked ? 'true' : 'false')}
          />
        </div>
      );
    }
    
    // Button style select
    if (setting.setting_key === 'button_style') {
      return (
        <Select value={value} onValueChange={(v) => handleChange(setting.id, v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rounded">Rounded</SelectItem>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="pill">Pill</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    // Sort order select
    if (setting.setting_key === 'default_sort') {
      return (
        <Select value={value} onValueChange={(v) => handleChange(setting.id, v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    // Currency selector
    if (setting.setting_key === 'default_currency') {
      return (
        <div className="flex gap-2">
          {['BDT', 'USD'].map(currency => (
            <Button
              key={currency}
              variant={value === currency ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => handleChange(setting.id, currency)}
            >
              {currency === 'BDT' ? '৳ BDT' : '$ USD'}
            </Button>
          ))}
        </div>
      );
    }
    
    // Textarea for long text or code
    if (setting.setting_type === 'textarea' || 
        setting.setting_key.includes('description') || 
        setting.setting_key.includes('tagline') || 
        setting.setting_key.includes('disclaimer') || 
        setting.setting_key.includes('copyright') ||
        setting.setting_key.includes('subtitle') ||
        setting.setting_key.includes('custom_css') ||
        setting.setting_key.includes('custom_js')) {
      return (
        <Textarea
          value={value}
          onChange={(e) => handleChange(setting.id, e.target.value)}
          placeholder={setting.description || ''}
          rows={setting.setting_key.includes('custom_') ? 10 : 3}
          className={setting.setting_key.includes('custom_') ? 'font-mono text-sm' : ''}
        />
      );
    }
    
    // Number input
    if (setting.setting_type === 'number' || 
        setting.setting_key.includes('_amount') || 
        setting.setting_key.includes('_rate') || 
        setting.setting_key.includes('per_page') || 
        setting.setting_key.includes('threshold') ||
        setting.setting_key.includes('_size') ||
        setting.setting_key.includes('_radius') ||
        setting.setting_key.includes('_width') ||
        setting.setting_key.includes('_spacing')) {
      return (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(setting.id, e.target.value)}
            placeholder={setting.description || ''}
            className="flex-1"
          />
          {(setting.setting_key.includes('_size') || 
            setting.setting_key.includes('_radius') || 
            setting.setting_key.includes('_width') ||
            setting.setting_key.includes('_spacing')) && (
            <span className="text-sm text-muted-foreground">px</span>
          )}
        </div>
      );
    }
    
    // Default text input
    return (
      <Input
        value={value}
        onChange={(e) => handleChange(setting.id, e.target.value)}
        placeholder={setting.description || ''}
      />
    );
  };

  const renderCurrencyPreview = () => {
    const rateSetting = groupedSettings['currency']?.find(s => s.setting_key === 'usd_to_bdt_rate');
    const currentRate = rateSetting ? parseFloat(formValues[rateSetting.id] || '110') : 110;

    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Exchange Rate Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 bg-background rounded-xl p-4 border shadow-sm w-fit">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-primary">$1</span>
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-green-500">৳{currentRate}</span>
              <span className="text-xs text-muted-foreground">BDT</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderColorPreview = () => {
    const colorSettings = ['primary_color', 'secondary_color', 'accent_color'];
    const colors = colorSettings.map(key => {
      const setting = groupedSettings['appearance']?.find(s => s.setting_key === key);
      return { key, value: setting ? formValues[setting.id] : '', label: key.replace('_', ' ').replace('color', '').trim() };
    }).filter(c => c.value);

    if (colors.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-3 mt-4 p-4 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground mr-2">Preview:</span>
        {colors.map(c => (
          <div key={c.key} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border shadow-sm" style={{ backgroundColor: c.value }} />
            <span className="text-xs capitalize">{c.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSettingsGroup = (categorySettings: SiteSetting[]) => {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {categorySettings.sort((a, b) => a.sort_order - b.sort_order).map(setting => (
          <div key={setting.id} className="space-y-2">
            <Label htmlFor={setting.id} className="text-sm font-medium">
              {setting.label}
            </Label>
            {renderSettingInput(setting)}
            {setting.description && !setting.setting_type?.includes('boolean') && !setting.setting_key.includes('enabled') && !setting.setting_key.includes('show_') && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Theme Customizer
            </h1>
            <p className="text-muted-foreground mt-1">
              Customize every aspect of your store's appearance - just like WooCommerce
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || bulkUpdate.isPending}
            size="lg"
            className="gap-2"
          >
            {bulkUpdate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {hasChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>

        {/* Change indicator */}
        {hasChanges && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">You have unsaved changes</span>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue={categories[0]} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-xl gap-1 flex-wrap">
              {categories.map(category => {
                const config = categoryConfig[category] || { icon: <Settings className="h-4 w-4" />, title: category };
                return (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2"
                  >
                    {config.icon}
                    <span className="hidden sm:inline">{config.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>

          {categories.map(category => {
            const config = categoryConfig[category] || { icon: <Settings className="h-4 w-4" />, title: category, description: '' };
            const categorySettings = groupedSettings[category] || [];
            
            return (
              <TabsContent key={category} value={category} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {config.icon}
                      {config.title}
                    </CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Special previews */}
                    {category === 'currency' && renderCurrencyPreview()}
                    {category === 'appearance' && renderColorPreview()}

                    {/* Settings */}
                    {renderSettingsGroup(categorySettings)}

                    {/* Tips */}
                    {category === 'advanced' && (
                      <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                        <p className="text-sm font-medium text-destructive">⚠️ Advanced Settings</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Custom CSS and JavaScript can break your site if not used carefully. Make sure you know what you're doing.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Quick Tips */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex gap-3">
                <Palette className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">Colors</p>
                  <p className="text-muted-foreground">Customize colors for buttons, headers, footers, and cards</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Type className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">Typography</p>
                  <p className="text-muted-foreground">Choose fonts for headings and body text</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Code className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">Advanced</p>
                  <p className="text-muted-foreground">Add custom CSS for complete control</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
