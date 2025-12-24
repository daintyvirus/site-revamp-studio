import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import type { Category } from '@/types/database';
import { toast } from 'sonner';

export default function AdminCategories() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setIcon(category.icon ?? '');
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIcon('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, name, slug, icon: icon || null });
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync({ name, slug, icon: icon || null });
        toast.success('Category created');
      }
      handleFormClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory.mutateAsync(deletingCategory.id);
      toast.success('Category deleted');
    } catch (error) {
      toast.error('Failed to delete category');
    }
    setDeletingCategory(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage product categories</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="glow-purple">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories Table */}
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : categories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>{category.icon ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingCategory(category)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCategory) setSlug(generateSlug(e.target.value));
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="cat-icon">Icon (emoji or text)</Label>
              <Input id="cat-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🎮" />
            </div>
            <Button type="submit" className="w-full glow-purple">
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
