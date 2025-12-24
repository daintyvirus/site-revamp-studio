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
  Banknote
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  branding: <Palette className="h-4 w-4" />,
  contact: <Phone className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  footer: <FileText className="h-4 w-4" />,
  currency: <DollarSign className="h-4 w-4" />,
};

const settingIcons: Record<string, React.ReactNode> = {
  site_name: <Globe className="h-4 w-4 text-muted-foreground" />,
  site_tagline: <FileText className="h-4 w-4 text-muted-foreground" />,
  contact_email: <Mail className="h-4 w-4 text-muted-foreground" />,
  contact_phone: <Phone className="h-4 w-4 text-muted-foreground" />,
  contact_address: <MapPin className="h-4 w-4 text-muted-foreground" />,
  support_hours: <Clock className="h-4 w-4 text-muted-foreground" />,
  social_facebook: <Facebook className="h-4 w-4 text-muted-foreground" />,
  social_twitter: <Twitter className="h-4 w-4 text-muted-foreground" />,
  social_instagram: <Instagram className="h-4 w-4 text-muted-foreground" />,
  social_youtube: <Youtube className="h-4 w-4 text-muted-foreground" />,
  social_discord: <MessageCircle className="h-4 w-4 text-muted-foreground" />,
  usd_to_bdt_rate: <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />,
  default_currency: <Banknote className="h-4 w-4 text-muted-foreground" />,
  show_currency_toggle: <DollarSign className="h-4 w-4 text-muted-foreground" />,
};

const categoryLabels: Record<string, { title: string; description: string }> = {
  branding: { 
    title: 'Branding', 
    description: 'Customize your site name, logo, and tagline' 
  },
  contact: { 
    title: 'Contact Information', 
    description: 'Update your contact details shown across the site' 
  },
  social: { 
    title: 'Social Media', 
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
};

export default function AdminSiteSettings() {
  const { data: settings, isLoading } = useAdminSiteSettings();
  const bulkUpdate = useBulkUpdateSiteSettings();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form values when settings load
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

  // Group settings by category
  const groupedSettings = settings?.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>) || {};

  // Sort categories to put currency at the end
  const categoryOrder = ['branding', 'contact', 'social', 'footer', 'currency'];
  const categories = Object.keys(groupedSettings).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const renderCurrencySettings = () => {
    const currencySettings = groupedSettings['currency'] || [];
    const rateSetting = currencySettings.find(s => s.setting_key === 'usd_to_bdt_rate');
    const defaultCurrencySetting = currencySettings.find(s => s.setting_key === 'default_currency');
    const showToggleSetting = currencySettings.find(s => s.setting_key === 'show_currency_toggle');

    const currentRate = rateSetting ? parseFloat(formValues[rateSetting.id] || '110') : 110;

    return (
      <div className="space-y-6">
        {/* Exchange Rate Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Exchange Rate
            </CardTitle>
            <CardDescription>
              Set the conversion rate from USD to BDT
            </CardDescription>
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
                  <div className="relative">
                    <Input
                      id={rateSetting.id}
                      type="number"
                      step="0.01"
                      min="1"
                      value={formValues[rateSetting.id] || ''}
                      onChange={(e) => handleChange(rateSetting.id, e.target.value)}
                      className="text-lg font-mono pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      BDT
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Preview conversions */}
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

        {/* Currency Display Settings */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Default Currency */}
          {defaultCurrencySetting && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  Default Currency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {['BDT', 'USD'].map(currency => (
                    <Button
                      key={currency}
                      variant={formValues[defaultCurrencySetting.id] === currency ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => handleChange(defaultCurrencySetting.id, currency)}
                    >
                      {currency === 'BDT' ? '৳ BDT' : '$ USD'}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  New visitors will see prices in this currency by default
                </p>
              </CardContent>
            </Card>
          )}

          {/* Currency Toggle Visibility */}
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
                    <p className="text-sm text-muted-foreground">
                      Allow users to switch between BDT and USD
                    </p>
                  </div>
                  <Switch
                    checked={formValues[showToggleSetting.id] === 'true'}
                    onCheckedChange={(checked) => 
                      handleChange(showToggleSetting.id, checked ? 'true' : 'false')
                    }
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
              Manage your site's branding, contact info, and social links
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
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="gap-2">
                {categoryIcons[category]}
                <span className="hidden sm:inline">{categoryLabels[category]?.title || category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              {category === 'currency' ? (
                renderCurrencySettings()
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
                            {settingIcons[setting.setting_key]}
                            {setting.label}
                          </Label>
                          {setting.setting_key.includes('tagline') || 
                           setting.setting_key.includes('disclaimer') || 
                           setting.setting_key.includes('copyright') ? (
                            <Textarea
                              id={setting.id}
                              value={formValues[setting.id] || ''}
                              onChange={(e) => handleChange(setting.id, e.target.value)}
                              placeholder={setting.description || ''}
                              rows={3}
                            />
                          ) : (
                            <Input
                              id={setting.id}
                              value={formValues[setting.id] || ''}
                              onChange={(e) => handleChange(setting.id, e.target.value)}
                              placeholder={setting.description || ''}
                            />
                          )}
                          {setting.description && (
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

        {/* Preview Card */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Use <code className="bg-muted px-1 rounded">{'{year}'}</code> in copyright text for automatic year updates</p>
            <p>• Leave social media URLs empty to hide them from the footer</p>
            <p>• Changes take effect immediately after saving</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
