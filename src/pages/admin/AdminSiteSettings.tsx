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
import { 
  Settings, 
  Palette, 
  Phone, 
  Share2, 
  FileText,
  Save,
  Loader2,
  Globe,
  Mail,
  Clock,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  DollarSign,
  ArrowRightLeft,
  Banknote,
  Home,
  ShoppingBag,
  CreditCard,
  Package,
  Bell
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  branding: <Globe className="h-4 w-4" />,
  appearance: <Palette className="h-4 w-4" />,
  homepage: <Home className="h-4 w-4" />,
  shop: <ShoppingBag className="h-4 w-4" />,
  checkout: <CreditCard className="h-4 w-4" />,
  contact: <Phone className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  footer: <FileText className="h-4 w-4" />,
  currency: <DollarSign className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  inventory: <Package className="h-4 w-4" />,
  seo: <Globe className="h-4 w-4" />,
};

const categoryLabels: Record<string, { title: string; description: string }> = {
  branding: { 
    title: 'Branding', 
    description: 'Customize your site name, logo, and tagline' 
  },
  appearance: {
    title: 'Appearance',
    description: 'Customize colors, theme, and visual styles'
  },
  homepage: {
    title: 'Homepage',
    description: 'Edit homepage content, hero section, and sections'
  },
  shop: {
    title: 'Shop',
    description: 'Configure shop page settings and product display'
  },
  checkout: {
    title: 'Checkout',
    description: 'Customize checkout process and order settings'
  },
  contact: { 
    title: 'Contact', 
    description: 'Update your contact details shown across the site' 
  },
  social: { 
    title: 'Social', 
    description: 'Connect your social media profiles' 
  },
  footer: { 
    title: 'Footer', 
    description: 'Customize footer text and disclaimers' 
  },
  currency: {
    title: 'Currency',
    description: 'Manage currency settings and exchange rates'
  },
  notifications: {
    title: 'Notifications',
    description: 'Configure email notification settings'
  },
  inventory: {
    title: 'Inventory',
    description: 'Stock and inventory alert settings'
  },
  seo: {
    title: 'SEO',
    description: 'Search engine optimization settings'
  },
};

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

  const categoryOrder = ['branding', 'appearance', 'homepage', 'shop', 'checkout', 'contact', 'social', 'footer', 'currency', 'notifications', 'inventory', 'seo'];
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
    
    // Color picker for color settings
    if (setting.setting_type === 'color' || setting.setting_key.includes('color')) {
      return (
        <div className="flex gap-2 items-center">
          <Input
            type="color"
            value={value || '#000000'}
            onChange={(e) => handleChange(setting.id, e.target.value)}
            className="w-16 h-10 p-1 cursor-pointer"
          />
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
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      );
    }
    
    // Boolean/toggle settings
    if (setting.setting_type === 'boolean' || setting.setting_key.includes('enabled') || setting.setting_key.includes('show_')) {
      return (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">{setting.description}</span>
          <Switch
            checked={value === 'true'}
            onCheckedChange={(checked) => handleChange(setting.id, checked ? 'true' : 'false')}
          />
        </div>
      );
    }
    
    // Select for specific fields
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
    
    // Textarea for long text
    if (setting.setting_type === 'textarea' || 
        setting.setting_key.includes('description') || 
        setting.setting_key.includes('tagline') || 
        setting.setting_key.includes('disclaimer') || 
        setting.setting_key.includes('copyright') ||
        setting.setting_key.includes('subtitle')) {
      return (
        <Textarea
          value={value}
          onChange={(e) => handleChange(setting.id, e.target.value)}
          placeholder={setting.description || ''}
          rows={3}
        />
      );
    }
    
    // Number input
    if (setting.setting_type === 'number' || setting.setting_key.includes('_amount') || setting.setting_key.includes('_rate') || setting.setting_key.includes('per_page') || setting.setting_key.includes('threshold')) {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleChange(setting.id, e.target.value)}
          placeholder={setting.description || ''}
        />
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

  const renderCurrencySettings = () => {
    const currencySettings = groupedSettings['currency'] || [];
    const rateSetting = currencySettings.find(s => s.setting_key === 'usd_to_bdt_rate');
    const defaultCurrencySetting = currencySettings.find(s => s.setting_key === 'default_currency');
    const showToggleSetting = currencySettings.find(s => s.setting_key === 'show_currency_toggle');

    const currentRate = rateSetting ? parseFloat(formValues[rateSetting.id] || '110') : 110;

    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Exchange Rate
            </CardTitle>
            <CardDescription>Set the conversion rate from USD to BDT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center gap-3 bg-background rounded-xl p-4 border shadow-sm">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-primary">$1</span>
                  <span className="text-xs text-muted-foreground">USD</span>
                </div>
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-green-500">৳{currentRate}</span>
                  <span className="text-xs text-muted-foreground">BDT</span>
                </div>
              </div>
              
              {rateSetting && (
                <div className="flex-1 max-w-xs">
                  <Label htmlFor={rateSetting.id} className="text-sm font-medium mb-2 block">
                    Rate (BDT per USD)
                  </Label>
                  <Input
                    id={rateSetting.id}
                    type="number"
                    step="0.01"
                    min="1"
                    value={formValues[rateSetting.id] || ''}
                    onChange={(e) => handleChange(rateSetting.id, e.target.value)}
                    className="text-lg font-mono"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">Preview conversions:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[5, 10, 25, 50].map(amount => (
                  <div key={amount} className="bg-background rounded-lg p-3 text-center border">
                    <p className="text-xs text-muted-foreground">${amount} USD</p>
                    <p className="font-semibold text-primary">৳{Math.round(amount * currentRate).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {defaultCurrencySetting && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  Default Currency
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderSettingInput(defaultCurrencySetting)}
                <p className="text-xs text-muted-foreground mt-3">
                  New visitors will see prices in this currency by default
                </p>
              </CardContent>
            </Card>
          )}

          {showToggleSetting && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  Currency Toggle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show currency switcher</p>
                    <p className="text-sm text-muted-foreground">Allow users to switch between BDT and USD</p>
                  </div>
                  <Switch
                    checked={formValues[showToggleSetting.id] === 'true'}
                    onCheckedChange={(checked) => handleChange(showToggleSetting.id, checked ? 'true' : 'false')}
                  />
                </div>
                {formValues[showToggleSetting.id] === 'true' && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <div className="flex items-center gap-1 bg-background rounded-full p-1 w-fit">
                      <Badge variant="default" className="rounded-full">৳ BDT</Badge>
                      <Badge variant="outline" className="rounded-full bg-transparent">$ USD</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderAppearanceSettings = () => {
    const appearanceSettings = groupedSettings['appearance'] || [];
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Theme Colors
            </CardTitle>
            <CardDescription>
              Customize the color scheme of your website. Colors will be applied across all pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {appearanceSettings.map(setting => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.id} className="flex items-center gap-2 text-sm font-medium">
                    {setting.label}
                  </Label>
                  {renderSettingInput(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Color Preview */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-medium mb-4">Live Preview</p>
              <div className="flex flex-wrap gap-4">
                {appearanceSettings.filter(s => s.setting_type === 'color').map(setting => {
                  const color = formValues[setting.id];
                  if (!color) return null;
                  return (
                    <div key={setting.id} className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg border shadow-sm" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-muted-foreground">{setting.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Site Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage all site content, branding, colors, and configuration
            </p>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || bulkUpdate.isPending}
            className="gap-2"
          >
            {bulkUpdate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue={categories[0]} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="gap-2 text-xs sm:text-sm">
                {categoryIcons[category]}
                <span className="hidden sm:inline">{categoryLabels[category]?.title || category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              {category === 'currency' ? (
                renderCurrencySettings()
              ) : category === 'appearance' ? (
                renderAppearanceSettings()
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {categoryIcons[category]}
                      {categoryLabels[category]?.title || category}
                    </CardTitle>
                    <CardDescription>
                      {categoryLabels[category]?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {groupedSettings[category]?.map(setting => (
                        <div key={setting.id} className="space-y-2">
                          <Label htmlFor={setting.id} className="flex items-center gap-2">
                            {setting.label}
                          </Label>
                          {renderSettingInput(setting)}
                          {setting.description && setting.setting_type !== 'boolean' && !setting.setting_key.includes('enabled') && !setting.setting_key.includes('show_') && (
                            <p className="text-xs text-muted-foreground">
                              {setting.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Use <code className="bg-muted px-1 rounded">{'{year}'}</code> in copyright text for automatic year updates</p>
            <p>• Leave social media URLs empty to hide them from the footer</p>
            <p>• Color changes take effect after saving and refreshing the page</p>
            <p>• For Homepage section content, use the <strong>Homepage Sections</strong> admin page</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
