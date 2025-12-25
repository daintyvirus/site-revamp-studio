import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminPages, useCreatePage, useDeletePage, useUpdatePage } from '@/hooks/useCustomPages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, FileText, Pencil, Trash2, Eye, ExternalLink, Loader2, LayoutTemplate } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPages() {
  const { data: pages, isLoading } = useAdminPages();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '', meta_title: '', meta_description: '' });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleCreate = async () => {
    if (!newPage.title || !newPage.slug) return;
    await createPage.mutateAsync(newPage);
    setNewPage({ title: '', slug: '', meta_title: '', meta_description: '' });
    setIsCreateOpen(false);
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await updatePage.mutateAsync({ id, is_published: !isPublished });
  };

  const handleToggleMenu = async (id: string, showInMenu: boolean) => {
    await updatePage.mutateAsync({ id, show_in_menu: !showInMenu });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this page? All sections will be deleted.')) {
      await deletePage.mutateAsync(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <LayoutTemplate className="h-8 w-8 text-primary" />
              Page Builder
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage custom pages with drag-and-drop sections
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Page Title *</Label>
                  <Input
                    value={newPage.title}
                    onChange={(e) => {
                      setNewPage({ 
                        ...newPage, 
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                        meta_title: e.target.value
                      });
                    }}
                    placeholder="About Us"
                  />
                </div>
                <div>
                  <Label>URL Slug *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">/page/</span>
                    <Input
                      value={newPage.slug}
                      onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                      placeholder="about-us"
                    />
                  </div>
                </div>
                <div>
                  <Label>SEO Title</Label>
                  <Input
                    value={newPage.meta_title}
                    onChange={(e) => setNewPage({ ...newPage, meta_title: e.target.value })}
                    placeholder="About Us - GoldenBumps"
                  />
                </div>
                <div>
                  <Label>SEO Description</Label>
                  <Input
                    value={newPage.meta_description}
                    onChange={(e) => setNewPage({ ...newPage, meta_description: e.target.value })}
                    placeholder="Learn more about our company..."
                  />
                </div>
                <Button 
                  onClick={handleCreate} 
                  disabled={!newPage.title || !newPage.slug || createPage.isPending}
                  className="w-full"
                >
                  {createPage.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Page
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pages?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No pages yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first custom page to get started
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Pages ({pages?.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>In Menu</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages?.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">/page/{page.slug}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={page.is_published}
                            onCheckedChange={() => handleTogglePublish(page.id, page.is_published)}
                          />
                          <Badge variant={page.is_published ? 'default' : 'secondary'}>
                            {page.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={page.show_in_menu}
                          onCheckedChange={() => handleToggleMenu(page.id, page.show_in_menu)}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(page.updated_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/pages/${page.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          {page.is_published && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`/page/${page.slug}`} target="_blank" rel="noopener">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(page.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. <strong>Create a page</strong> - Give it a title and URL slug</p>
            <p>2. <strong>Add sections</strong> - Choose from Hero, Text, Image, CTA, FAQ, Features, Products, etc.</p>
            <p>3. <strong>Edit content</strong> - Customize each section's text, images, and styling</p>
            <p>4. <strong>Publish</strong> - Toggle the publish switch to make it live</p>
            <p>5. <strong>Add to menu</strong> - Enable "In Menu" to show in navigation</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
