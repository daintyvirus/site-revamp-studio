import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  useAdminPage, 
  useUpdatePage, 
  useCreateSection, 
  useUpdateSection, 
  useDeleteSection,
  useCreateFaqItem,
  useUpdateFaqItem,
  useDeleteFaqItem,
  useCreateFeatureItem,
  useDeleteFeatureItem,
  PageSection
} from '@/hooks/useCustomPages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  GripVertical,
  Image,
  Type,
  Layout,
  MessageSquare,
  Star,
  ShoppingBag,
  FileText,
  Code,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section', icon: Layout, description: 'Large banner with title, subtitle, and CTA' },
  { value: 'text', label: 'Text Block', icon: Type, description: 'Rich text content section' },
  { value: 'image', label: 'Image', icon: Image, description: 'Full-width or contained image' },
  { value: 'cta', label: 'Call to Action', icon: Star, description: 'Action button with background' },
  { value: 'features', label: 'Features Grid', icon: Layout, description: 'Grid of feature cards with icons' },
  { value: 'faq', label: 'FAQ Accordion', icon: MessageSquare, description: 'Expandable Q&A section' },
  { value: 'products', label: 'Products', icon: ShoppingBag, description: 'Display products from store' },
  { value: 'testimonials', label: 'Testimonials', icon: MessageSquare, description: 'Customer reviews carousel' },
  { value: 'custom_html', label: 'Custom HTML', icon: Code, description: 'Raw HTML/embed content' },
];

export default function AdminPageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: page, isLoading } = useAdminPage(id || '');
  const updatePage = useUpdatePage();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const createFaqItem = useCreateFaqItem();
  const deleteFaqItem = useDeleteFaqItem();
  const createFeatureItem = useCreateFeatureItem();
  const deleteFeatureItem = useDeleteFeatureItem();

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [pageSettings, setPageSettings] = useState<{
    title: string;
    meta_title: string;
    meta_description: string;
    is_published: boolean;
    show_in_menu: boolean;
    menu_location: string;
  } | null>(null);

  // Initialize page settings when data loads
  if (page && !pageSettings) {
    setPageSettings({
      title: page.title,
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      is_published: page.is_published,
      show_in_menu: page.show_in_menu,
      menu_location: page.menu_location || 'header',
    });
  }

  const handleSavePageSettings = async () => {
    if (!page || !pageSettings) return;
    await updatePage.mutateAsync({ id: page.id, ...pageSettings });
  };

  const handleAddSection = async (type: string) => {
    if (!page) return;
    const maxOrder = Math.max(...(page.sections?.map(s => s.sort_order) || [0]), 0);
    await createSection.mutateAsync({
      page_id: page.id,
      section_type: type,
      sort_order: maxOrder + 1,
      title: `New ${SECTION_TYPES.find(t => t.value === type)?.label || 'Section'}`,
    });
    setIsAddSectionOpen(false);
  };

  const handleUpdateSection = async (sectionId: string, updates: Partial<PageSection>) => {
    await updateSection.mutateAsync({ id: sectionId, ...updates });
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (confirm('Delete this section?')) {
      await deleteSection.mutateAsync(sectionId);
    }
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    if (!page?.sections) return;
    const index = page.sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= page.sections.length) return;

    const currentOrder = page.sections[index].sort_order;
    const targetOrder = page.sections[newIndex].sort_order;

    await updateSection.mutateAsync({ id: sectionId, sort_order: targetOrder });
    await updateSection.mutateAsync({ id: page.sections[newIndex].id, sort_order: currentOrder });
  };

  const handleAddFaqItem = async (sectionId: string) => {
    await createFaqItem.mutateAsync({
      section_id: sectionId,
      question: 'New Question',
      answer: 'Answer goes here...',
    });
  };

  const handleAddFeatureItem = async (sectionId: string) => {
    await createFeatureItem.mutateAsync({
      section_id: sectionId,
      title: 'New Feature',
      description: 'Feature description...',
      icon: '⭐',
    });
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

  if (!page) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Page not found</p>
          <Button onClick={() => navigate('/admin/pages')} className="mt-4">
            Back to Pages
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold">{page.title}</h1>
              <p className="text-sm text-muted-foreground">/page/{page.slug}</p>
            </div>
            <Badge variant={page.is_published ? 'default' : 'secondary'}>
              {page.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {page.is_published && (
              <Button variant="outline" asChild>
                <a href={`/page/${page.slug}`} target="_blank" rel="noopener">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </a>
              </Button>
            )}
            <Button onClick={() => setIsAddSectionOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sections List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Page Sections ({page.sections?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {page.sections?.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <Layout className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No sections yet. Add your first section!</p>
                    <Button onClick={() => setIsAddSectionOpen(true)} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Section
                    </Button>
                  </div>
                ) : (
                  page.sections?.map((section, index) => {
                    const sectionType = SECTION_TYPES.find(t => t.value === section.section_type);
                    const Icon = sectionType?.icon || FileText;
                    
                    return (
                      <Card key={section.id} className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleMoveSection(section.id, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleMoveSection(section.id, 'down')}
                                disabled={index === (page.sections?.length || 0) - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="h-4 w-4 text-primary" />
                                <span className="font-medium">{sectionType?.label}</span>
                                {!section.is_visible && (
                                  <Badge variant="secondary" className="text-xs">Hidden</Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {section.title || 'Untitled section'}
                              </p>

                              {/* Section Editor */}
                              <Accordion type="single" collapsible className="mt-3">
                                <AccordionItem value="edit" className="border-0">
                                  <AccordionTrigger className="text-sm py-2 hover:no-underline">
                                    Edit Section
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-4 pt-2">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <Label className="text-xs">Title</Label>
                                          <Input
                                            defaultValue={section.title || ''}
                                            onBlur={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Subtitle</Label>
                                          <Input
                                            defaultValue={section.subtitle || ''}
                                            onBlur={(e) => handleUpdateSection(section.id, { subtitle: e.target.value })}
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-xs">Content</Label>
                                        <Textarea
                                          defaultValue={section.content || ''}
                                          onBlur={(e) => handleUpdateSection(section.id, { content: e.target.value })}
                                          rows={3}
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <Label className="text-xs">Image URL</Label>
                                          <Input
                                            defaultValue={section.image_url || ''}
                                            onBlur={(e) => handleUpdateSection(section.id, { image_url: e.target.value })}
                                            placeholder="https://..."
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Background Color</Label>
                                          <div className="flex gap-2">
                                            <Input
                                              type="color"
                                              defaultValue={section.background_color || '#ffffff'}
                                              onChange={(e) => handleUpdateSection(section.id, { background_color: e.target.value })}
                                              className="w-12 h-9 p-1"
                                            />
                                            <Input
                                              defaultValue={section.background_color || ''}
                                              onBlur={(e) => handleUpdateSection(section.id, { background_color: e.target.value })}
                                              placeholder="#ffffff"
                                              className="flex-1"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <Label className="text-xs">Button Text</Label>
                                          <Input
                                            defaultValue={section.button_text || ''}
                                            onBlur={(e) => handleUpdateSection(section.id, { button_text: e.target.value })}
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Button URL</Label>
                                          <Input
                                            defaultValue={section.button_url || ''}
                                            onBlur={(e) => handleUpdateSection(section.id, { button_url: e.target.value })}
                                          />
                                        </div>
                                      </div>

                                      {/* FAQ Items */}
                                      {section.section_type === 'faq' && (
                                        <div className="border-t pt-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <Label className="text-xs font-medium">FAQ Items</Label>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => handleAddFaqItem(section.id)}
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add Q&A
                                            </Button>
                                          </div>
                                          <div className="space-y-2">
                                            {section.faq_items?.map((faq) => (
                                              <div key={faq.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                                                <div className="flex-1 text-xs">
                                                  <p className="font-medium">{faq.question}</p>
                                                  <p className="text-muted-foreground">{faq.answer.slice(0, 50)}...</p>
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-destructive"
                                                  onClick={() => deleteFaqItem.mutateAsync(faq.id)}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Feature Items */}
                                      {section.section_type === 'features' && (
                                        <div className="border-t pt-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <Label className="text-xs font-medium">Features</Label>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => handleAddFeatureItem(section.id)}
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add Feature
                                            </Button>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            {section.feature_items?.map((feature) => (
                                              <div key={feature.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                                                <span>{feature.icon}</span>
                                                <span className="flex-1 truncate">{feature.title}</span>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-5 w-5 text-destructive"
                                                  onClick={() => deleteFeatureItem.mutateAsync(feature.id)}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between pt-2 border-t">
                                        <div className="flex items-center gap-2">
                                          <Switch
                                            checked={section.is_visible}
                                            onCheckedChange={(checked) => handleUpdateSection(section.id, { is_visible: checked })}
                                          />
                                          <span className="text-xs">Visible</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteSection(section.id)}
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Page Settings Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pageSettings && (
                  <>
                    <div>
                      <Label className="text-xs">Page Title</Label>
                      <Input
                        value={pageSettings.title}
                        onChange={(e) => setPageSettings({ ...pageSettings, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">SEO Title</Label>
                      <Input
                        value={pageSettings.meta_title}
                        onChange={(e) => setPageSettings({ ...pageSettings, meta_title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">SEO Description</Label>
                      <Textarea
                        value={pageSettings.meta_description}
                        onChange={(e) => setPageSettings({ ...pageSettings, meta_description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Published</Label>
                      <Switch
                        checked={pageSettings.is_published}
                        onCheckedChange={(checked) => setPageSettings({ ...pageSettings, is_published: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Show in Menu</Label>
                      <Switch
                        checked={pageSettings.show_in_menu}
                        onCheckedChange={(checked) => setPageSettings({ ...pageSettings, show_in_menu: checked })}
                      />
                    </div>
                    {pageSettings.show_in_menu && (
                      <div>
                        <Label className="text-xs">Menu Location</Label>
                        <Select
                          value={pageSettings.menu_location}
                          onValueChange={(val) => setPageSettings({ ...pageSettings, menu_location: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="header">Header</SelectItem>
                            <SelectItem value="footer">Footer</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button 
                      onClick={handleSavePageSettings} 
                      className="w-full"
                      disabled={updatePage.isPending}
                    >
                      {updatePage.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Section Dialog */}
        <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Section</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SECTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleAddSection(type.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-center"
                >
                  <type.icon className="h-8 w-8 text-primary" />
                  <span className="font-medium text-sm">{type.label}</span>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
