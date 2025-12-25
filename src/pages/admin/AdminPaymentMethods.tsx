import { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
  type PaymentMethod
} from '@/hooks/usePaymentMethods';

const emptyForm = {
  name: '',
  slug: '',
  type: 'mobile_banking',
  account_number: '',
  account_name: '',
  logo_url: '',
  instructions: '',
  is_active: true,
  sort_order: 0,
  available_currencies: ['BDT', 'USD'] as string[]
};

export default function AdminPaymentMethods() {
  const { data: methods, isLoading } = usePaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreateDialog = () => {
    setEditingMethod(null);
    setForm({ ...emptyForm, sort_order: (methods?.length ?? 0) + 1 });
    setDialogOpen(true);
  };

  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method);
    setForm({
      name: method.name,
      slug: method.slug,
      type: method.type,
      account_number: method.account_number,
      account_name: method.account_name || '',
      logo_url: method.logo_url || '',
      instructions: method.instructions || '',
      is_active: method.is_active,
      sort_order: method.sort_order,
      available_currencies: method.available_currencies || ['BDT', 'USD']
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug || !form.account_number) return;

    if (editingMethod) {
      await updateMethod.mutateAsync({ id: editingMethod.id, ...form });
    } else {
      await createMethod.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      await deleteMethod.mutateAsync(id);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground">Manage mobile banking and payment options</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : methods?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No payment methods configured</p>
          ) : (
            methods?.map((method) => (
              <div
                key={method.id}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {method.logo_url ? (
                    <img src={method.logo_url} alt={method.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary">
                      {method.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{method.name}</h3>
                    <Badge variant={method.is_active ? 'default' : 'secondary'}>
                      {method.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.account_number} • {method.type.replace('_', ' ')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(method)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="bKash Personal"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ 
                      ...form, 
                      name: e.target.value,
                      slug: editingMethod ? form.slug : generateSlug(e.target.value)
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="bkash"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number *</Label>
                <Input
                  id="account_number"
                  placeholder="01XXXXXXXXX"
                  value={form.account_number}
                  onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  placeholder="Your Name"
                  value={form.account_name}
                  onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                    <SelectItem value="net_banking">Net Banking</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                placeholder="https://..."
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Payment Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Step by step instructions for users..."
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Available Currencies</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.available_currencies.includes('BDT')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({ ...form, available_currencies: [...form.available_currencies, 'BDT'] });
                      } else {
                        setForm({ ...form, available_currencies: form.available_currencies.filter(c => c !== 'BDT') });
                      }
                    }}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">BDT (৳)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.available_currencies.includes('USD')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({ ...form, available_currencies: [...form.available_currencies, 'USD'] });
                      } else {
                        setForm({ ...form, available_currencies: form.available_currencies.filter(c => c !== 'USD') });
                      }
                    }}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">USD ($)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!form.name || !form.slug || !form.account_number}
            >
              {editingMethod ? 'Save Changes' : 'Add Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
