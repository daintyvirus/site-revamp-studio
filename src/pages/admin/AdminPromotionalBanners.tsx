import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { usePromotionalBanners, useCreatePromotionalBanner, useUpdatePromotionalBanner, useDeletePromotionalBanner, PromotionalBanner } from '@/hooks/usePromotionalBanners';

export default function AdminPromotionalBanners() {
  const { data: banners, isLoading } = usePromotionalBanners();
  const createBanner = useCreatePromotionalBanner();
  const updateBanner = useUpdatePromotionalBanner();
  const deleteBanner = useDeletePromotionalBanner();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    link_url: '',
    background_color: '#D4AF37',
    text_color: '#1a1a1a',
    is_active: true,
    sort_order: 0,
    starts_at: '',
    ends_at: '',
    countdown_enabled: false,
    countdown_end_time: '',
    countdown_label: 'Offer ends in:',
  });

  const resetForm = () => {
    setFormData({
      text: '',
      link_url: '',
      background_color: '#D4AF37',
      text_color: '#1a1a1a',
      is_active: true,
      sort_order: 0,
      starts_at: '',
      ends_at: '',
      countdown_enabled: false,
      countdown_end_time: '',
      countdown_label: 'Offer ends in:',
    });
    setEditingBanner(null);
  };

  const openEditDialog = (banner: PromotionalBanner) => {
    setEditingBanner(banner);
    setFormData({
      text: banner.text,
      link_url: banner.link_url || '',
      background_color: banner.background_color || '#D4AF37',
      text_color: banner.text_color || '#1a1a1a',
      is_active: banner.is_active,
      sort_order: banner.sort_order,
      starts_at: banner.starts_at ? banner.starts_at.slice(0, 16) : '',
      ends_at: banner.ends_at ? banner.ends_at.slice(0, 16) : '',
      countdown_enabled: banner.countdown_enabled,
      countdown_end_time: banner.countdown_end_time ? banner.countdown_end_time.slice(0, 16) : '',
      countdown_label: banner.countdown_label || 'Offer ends in:',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      link_url: formData.link_url || null,
      starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
      ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
      countdown_end_time: formData.countdown_end_time ? new Date(formData.countdown_end_time).toISOString() : null,
      countdown_label: formData.countdown_label || null,
    };

    if (editingBanner) {
      await updateBanner.mutateAsync({ id: editingBanner.id, ...payload });
    } else {
      await createBanner.mutateAsync(payload);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      await deleteBanner.mutateAsync(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Promotional Banners</h1>
            <p className="text-muted-foreground">Manage announcement banners with countdown timers</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Banner</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Banner Text *</Label>
                  <Input
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    required
                    placeholder="🎮 Special Offer: Get 10% OFF!"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link URL</Label>
                  <Input
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="/shop or https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={formData.background_color}
                        onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Countdown Timer Section */}
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">Countdown Timer</CardTitle>
                      </div>
                      <Switch
                        checked={formData.countdown_enabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, countdown_enabled: checked })}
                      />
                    </div>
                  </CardHeader>
                  {formData.countdown_enabled && (
                    <CardContent className="space-y-4 pt-0">
                      <div className="space-y-2">
                        <Label>Countdown End Time *</Label>
                        <Input
                          type="datetime-local"
                          value={formData.countdown_end_time}
                          onChange={(e) => setFormData({ ...formData, countdown_end_time: e.target.value })}
                          required={formData.countdown_enabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Countdown Label</Label>
                        <Input
                          value={formData.countdown_label}
                          onChange={(e) => setFormData({ ...formData, countdown_label: e.target.value })}
                          placeholder="Offer ends in:"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display From (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.starts_at}
                      onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Until (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.ends_at}
                      onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingBanner ? 'Update' : 'Create'} Banner
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Banners</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Countdown</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners?.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div
                          className="px-3 py-1 rounded text-xs truncate max-w-32"
                          style={{
                            backgroundColor: banner.background_color || '#D4AF37',
                            color: banner.text_color || '#1a1a1a',
                          }}
                        >
                          Preview
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{banner.text}</TableCell>
                      <TableCell>
                        {banner.countdown_enabled ? (
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3 text-primary" />
                            <span className="text-muted-foreground">
                              {banner.countdown_end_time 
                                ? new Date(banner.countdown_end_time).toLocaleString() 
                                : 'Not set'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Disabled</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {banner.starts_at || banner.ends_at ? (
                          <>
                            {banner.starts_at && <div>From: {new Date(banner.starts_at).toLocaleDateString()}</div>}
                            {banner.ends_at && <div>Until: {new Date(banner.ends_at).toLocaleDateString()}</div>}
                          </>
                        ) : (
                          'Always'
                        )}
                      </TableCell>
                      <TableCell>{banner.is_active ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(banner)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
