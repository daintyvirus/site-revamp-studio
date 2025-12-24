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
import { Pencil, Eye, EyeOff, LayoutGrid, Sparkles, ShoppingBag, Building2 } from 'lucide-react';
import { useHomepageSections, useUpdateHomepageSection, HomepageSection } from '@/hooks/useHomepageSections';

const sectionIcons: Record<string, React.ElementType> = {
  hero: Sparkles,
  categories: LayoutGrid,
  featured: ShoppingBag,
  brands: Building2,
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Homepage Sections</h1>
          <p className="text-muted-foreground">Manage homepage content, titles, and descriptions</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {sections?.map((section) => {
              const Icon = sectionIcons[section.section_key] || Sparkles;
              return (
                <Card key={section.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {section.section_key.replace('_', ' ')} Section
                        </CardTitle>
                        <CardDescription>
                          {section.title || 'No title set'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={section.is_visible ? 'default' : 'secondary'}>
                        {section.is_visible ? 'Visible' : 'Hidden'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVisibility(section)}
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
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {section.badge_text && (
                        <div>
                          <span className="text-muted-foreground">Badge:</span>
                          <p className="font-medium">{section.badge_text}</p>
                        </div>
                      )}
                      {section.description && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Description:</span>
                          <p className="font-medium truncate">{section.description}</p>
                        </div>
                      )}
                      {section.button_text && (
                        <div>
                          <span className="text-muted-foreground">Button:</span>
                          <p className="font-medium">{section.button_text}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="capitalize">
                Edit {editingSection?.section_key.replace('_', ' ')} Section
              </DialogTitle>
              <DialogDescription>
                Update the content displayed in this section
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="buttons">Buttons</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="space-y-4 mt-4">
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
                    <Label htmlFor="badge_text">Badge Text</Label>
                    <Input
                      id="badge_text"
                      value={formData.badge_text}
                      onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                      placeholder="Badge text (e.g., 'New', 'Featured')"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Section description"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_visible">Visible on Homepage</Label>
                    <Switch
                      id="is_visible"
                      checked={formData.is_visible}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="buttons" className="space-y-4 mt-4">
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">Primary Button</h4>
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
                    <h4 className="font-medium">Secondary Button</h4>
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
              </Tabs>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
