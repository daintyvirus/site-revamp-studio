import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, 
  Eye, 
  EyeOff, 
  LayoutGrid, 
  Sparkles, 
  ShoppingBag, 
  Building2, 
  Star, 
  Zap, 
  TrendingUp, 
  Package,
  GripVertical,
  ArrowUp,
  ArrowDown,
  MessageSquare
} from 'lucide-react';
import { useHomepageSections, useUpdateHomepageSection, HomepageSection } from '@/hooks/useHomepageSections';

const sectionIcons: Record<string, React.ElementType> = {
  hero: Sparkles,
  categories: LayoutGrid,
  featured: ShoppingBag,
  brands: Building2,
  advantages: Zap,
  bestsellers: TrendingUp,
  new_arrivals: Package,
  testimonials: MessageSquare,
};

const sectionDescriptions: Record<string, string> = {
  hero: 'Main hero banner with call-to-action buttons',
  categories: 'Product category cards with icons',
  featured: 'Featured products showcase',
  brands: 'Partner and trusted brands logos',
  advantages: 'Why choose us - key benefits',
  bestsellers: 'Best selling products carousel',
  new_arrivals: 'Recently added products',
  testimonials: 'Customer reviews and testimonials',
};

export default function AdminHomepageSections() {
  const { data: sections, isLoading } = useHomepageSections();
  const updateMutation = useUpdateHomepageSection();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge_text: '',
    description: '',
    button_text: '',
    button_url: '',
    secondary_button_text: '',
    secondary_button_url: '',
    is_visible: true,
  });

  const handleOpenDialog = (section: HomepageSection) => {
    setEditingSection(section);
    setFormData({
      title: section.title || '',
      subtitle: section.subtitle || '',
      badge_text: section.badge_text || '',
      description: section.description || '',
      button_text: section.button_text || '',
      button_url: section.button_url || '',
      secondary_button_text: section.secondary_button_text || '',
      secondary_button_url: section.secondary_button_url || '',
      is_visible: section.is_visible,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    await updateMutation.mutateAsync({
      id: editingSection.id,
      title: formData.title || null,
      subtitle: formData.subtitle || null,
      badge_text: formData.badge_text || null,
      description: formData.description || null,
      button_text: formData.button_text || null,
      button_url: formData.button_url || null,
      secondary_button_text: formData.secondary_button_text || null,
      secondary_button_url: formData.secondary_button_url || null,
      is_visible: formData.is_visible,
    });
    setIsDialogOpen(false);
  };

  const toggleVisibility = async (section: HomepageSection) => {
    await updateMutation.mutateAsync({
      id: section.id,
      is_visible: !section.is_visible,
    });
  };

  const moveSection = async (section: HomepageSection, direction: 'up' | 'down') => {
    if (!sections) return;
    
    const currentIndex = sections.findIndex(s => s.id === section.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    
    const targetSection = sections[targetIndex];
    
    // Swap sort orders
    await updateMutation.mutateAsync({
      id: section.id,
      sort_order: targetSection.sort_order,
    });
    await updateMutation.mutateAsync({
      id: targetSection.id,
      sort_order: section.sort_order,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutGrid className="h-8 w-8 text-primary" />
            Homepage Sections
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage homepage content, visibility, and order. Drag sections to reorder.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{sections?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Total Sections</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">
                {sections?.filter(s => s.is_visible).length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Visible</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/5 border-orange-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-500">
                {sections?.filter(s => !s.is_visible).length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Hidden</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-500">
                {sections?.filter(s => s.button_text).length || 0}
              </div>
              <p className="text-sm text-muted-foreground">With CTA</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-3">
            {sections?.map((section, index) => {
              const Icon = sectionIcons[section.section_key] || Sparkles;
              const description = sectionDescriptions[section.section_key] || '';
              
              return (
                <Card 
                  key={section.id} 
                  className={`transition-all ${!section.is_visible ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Drag Handle & Order Controls */}
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveSection(section, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveSection(section, 'down')}
                          disabled={index === (sections?.length || 0) - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Icon */}
                      <div className={`p-3 rounded-lg ${section.is_visible ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-6 w-6 ${section.is_visible ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold capitalize">
                            {section.section_key.replace('_', ' ')} Section
                          </h3>
                          <Badge variant={section.is_visible ? 'default' : 'secondary'} className="text-xs">
                            {section.is_visible ? 'Visible' : 'Hidden'}
                          </Badge>
                          {section.badge_text && (
                            <Badge variant="outline" className="text-xs">
                              {section.badge_text}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {section.title || description}
                        </p>
                        {section.subtitle && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {section.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {section.button_text && (
                          <Badge variant="outline" className="hidden md:flex gap-1 text-xs">
                            CTA: {section.button_text}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVisibility(section)}
                          className={section.is_visible ? 'text-green-500' : 'text-muted-foreground'}
                        >
                          {section.is_visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(section)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="capitalize flex items-center gap-2">
                {editingSection && sectionIcons[editingSection.section_key] && (
                  <span className="p-2 rounded-lg bg-primary/10">
                    {(() => {
                      const Icon = sectionIcons[editingSection.section_key];
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                  </span>
                )}
                Edit {editingSection?.section_key.replace('_', ' ')} Section
              </DialogTitle>
              <DialogDescription>
                {editingSection && sectionDescriptions[editingSection.section_key]}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="buttons">Buttons</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="badge_text">Badge Text</Label>
                    <Input
                      id="badge_text"
                      value={formData.badge_text}
                      onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                      placeholder="e.g., New, Featured, Hot"
                    />
                    <p className="text-xs text-muted-foreground">Small label shown above the title</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Section title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Section subtitle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Longer description text"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="buttons" className="space-y-4 mt-4">
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Primary Button
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="button_text">Button Text</Label>
                        <Input
                          id="button_text"
                          value={formData.button_text}
                          onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                          placeholder="Shop Now"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="button_url">Button URL</Label>
                        <Input
                          id="button_url"
                          value={formData.button_url}
                          onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                          placeholder="/shop"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      Secondary Button
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="secondary_button_text">Button Text</Label>
                        <Input
                          id="secondary_button_text"
                          value={formData.secondary_button_text}
                          onChange={(e) => setFormData({ ...formData, secondary_button_text: e.target.value })}
                          placeholder="Learn More"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondary_button_url">Button URL</Label>
                        <Input
                          id="secondary_button_url"
                          value={formData.secondary_button_url}
                          onChange={(e) => setFormData({ ...formData, secondary_button_url: e.target.value })}
                          placeholder="/about"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="is_visible" className="text-base">Visible on Homepage</Label>
                      <p className="text-sm text-muted-foreground">Show or hide this section</p>
                    </div>
                    <Switch
                      id="is_visible"
                      checked={formData.is_visible}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
