import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import {
  useAdminHeroImages,
  useCreateHeroImage,
  useUpdateHeroImage,
  useDeleteHeroImage,
  HeroImage,
} from '@/hooks/useHeroImages';
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

interface HeroImageFormData {
  image_url: string;
  title: string;
  subtitle: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
}

const defaultFormData: HeroImageFormData = {
  image_url: '',
  title: '',
  subtitle: '',
  link_url: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminHeroImages() {
  const { data: heroImages, isLoading } = useAdminHeroImages();
  const createMutation = useCreateHeroImage();
  const updateMutation = useUpdateHeroImage();
  const deleteMutation = useDeleteHeroImage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [formData, setFormData] = useState<HeroImageFormData>(defaultFormData);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenDialog = (image?: HeroImage) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        image_url: image.image_url,
        title: image.title || '',
        subtitle: image.subtitle || '',
        link_url: image.link_url || '',
        sort_order: image.sort_order,
        is_active: image.is_active,
      });
    } else {
      setEditingImage(null);
      setFormData({
        ...defaultFormData,
        sort_order: heroImages?.length || 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingImage) {
      await updateMutation.mutateAsync({
        id: editingImage.id,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }

    setIsDialogOpen(false);
    setFormData(defaultFormData);
    setEditingImage(null);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (image: HeroImage) => {
    await updateMutation.mutateAsync({
      id: image.id,
      is_active: !image.is_active,
    });
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Hero Images - Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hero Images</h1>
            <p className="text-muted-foreground">
              Manage the carousel images displayed on the homepage
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingImage ? 'Edit Hero Image' : 'Add Hero Image'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL *</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                {formData.image_url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Slide title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      placeholder="Slide subtitle"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="link_url">Link URL</Label>
                    <Input
                      id="link_url"
                      value={formData.link_url}
                      onChange={(e) =>
                        setFormData({ ...formData, link_url: e.target.value })
                      }
                      placeholder="/shop or https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sort_order: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingImage ? 'Update' : 'Add'} Image
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Hero Images ({heroImages?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : !heroImages || heroImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hero images yet. Add your first image!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="w-32">Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead className="w-20">Order</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heroImages.map((image) => (
                    <TableRow key={image.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <div className="w-24 h-14 rounded overflow-hidden bg-muted">
                          <img
                            src={image.image_url}
                            alt={image.title || 'Hero image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {image.title || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {image.subtitle || '-'}
                      </TableCell>
                      <TableCell>{image.sort_order}</TableCell>
                      <TableCell>
                        <Switch
                          checked={image.is_active}
                          onCheckedChange={() => handleToggleActive(image)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(image)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hero image? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
