import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCategories, useBrands } from '@/hooks/useProducts';
import type { Product } from '@/types/database';

interface ProductQuickEditProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function ProductQuickEdit({
  product,
  open,
  onOpenChange,
  onComplete,
}: ProductQuickEditProps) {
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [priceBdt, setPriceBdt] = useState('');
  const [salePriceBdt, setSalePriceBdt] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (product && open) {
      setName(product.name);
      setPriceBdt(String(product.price_bdt || 0));
      setSalePriceBdt(product.sale_price_bdt ? String(product.sale_price_bdt) : '');
      setStock(String(product.stock));
      setCategoryId(product.category_id || '');
      setBrandId(product.brand_id || '');
      setIsActive(product.is_active);
      setIsFeatured(product.is_featured);
    }
  }, [product, open]);

  const handleSave = async () => {
    if (!product) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          price_bdt: parseFloat(priceBdt) || 0,
          sale_price_bdt: salePriceBdt ? parseFloat(salePriceBdt) : null,
          stock: parseInt(stock) || 0,
          category_id: categoryId || null,
          brand_id: brandId || null,
          is_active: isActive,
          is_featured: isFeatured,
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Product updated');
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Quick Edit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Product Image & Name */}
          <div className="flex items-center gap-3 pb-3 border-b">
            {product.image_url && (
              <img
                src={product.image_url}
                alt=""
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-medium"
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Price (BDT)</Label>
              <Input
                type="number"
                value={priceBdt}
                onChange={(e) => setPriceBdt(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs">Sale Price (BDT)</Label>
              <Input
                type="number"
                value={salePriceBdt}
                onChange={(e) => setSalePriceBdt(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <Label className="text-xs">Stock Quantity</Label>
            <Input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Brand</Label>
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive" className="text-sm">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isFeatured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <Label htmlFor="isFeatured" className="text-sm">Featured</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
