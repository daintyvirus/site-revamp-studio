import { useState, useEffect } from 'react';
import { DollarSign, Percent, Calculator, CheckCircle2, Loader2, Search, ArrowUpDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useProducts';

interface Product {
  id: string;
  name: string;
  price_bdt: number;
  price: number;
  sale_price_bdt: number | null;
  sale_price: number | null;
  category_id: string | null;
  image_url: string | null;
}

interface BulkPriceEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type AdjustmentType = 'fixed' | 'percentage' | 'multiply';
type PriceField = 'price_bdt' | 'price' | 'sale_price_bdt' | 'sale_price';

export default function BulkPriceEditor({ open, onOpenChange, onComplete }: BulkPriceEditorProps) {
  const { data: categories } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Adjustment settings
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');
  const [priceField, setPriceField] = useState<PriceField>('price_bdt');
  const [operation, setOperation] = useState<'increase' | 'decrease'>('increase');
  const [updateVariants, setUpdateVariants] = useState(true);

  // Preview
  const [previewProducts, setPreviewProducts] = useState<Array<{ id: string; name: string; oldPrice: number; newPrice: number }>>([]);

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price_bdt, price, sale_price_bdt, sale_price, category_id, image_url')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error(`Failed to load products: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleProduct = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const calculateNewPrice = (currentPrice: number): number => {
    const value = parseFloat(adjustmentValue) || 0;
    let newPrice = currentPrice;

    if (adjustmentType === 'fixed') {
      newPrice = operation === 'increase' ? currentPrice + value : currentPrice - value;
    } else if (adjustmentType === 'percentage') {
      const adjustment = currentPrice * (value / 100);
      newPrice = operation === 'increase' ? currentPrice + adjustment : currentPrice - adjustment;
    } else if (adjustmentType === 'multiply') {
      newPrice = currentPrice * value;
    }

    return Math.max(0, Math.round(newPrice * 100) / 100);
  };

  const generatePreview = () => {
    const previews = filteredProducts
      .filter(p => selectedIds.has(p.id))
      .map(p => {
        const oldPrice = p[priceField] || 0;
        const newPrice = calculateNewPrice(oldPrice);
        return { id: p.id, name: p.name, oldPrice, newPrice };
      });
    setPreviewProducts(previews);
  };

  useEffect(() => {
    if (adjustmentValue && selectedIds.size > 0) {
      generatePreview();
    } else {
      setPreviewProducts([]);
    }
  }, [adjustmentValue, adjustmentType, priceField, operation, selectedIds]);

  const applyChanges = async () => {
    if (selectedIds.size === 0) {
      toast.error('No products selected');
      return;
    }

    if (!adjustmentValue || parseFloat(adjustmentValue) === 0) {
      toast.error('Please enter an adjustment value');
      return;
    }

    setIsUpdating(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const product of products.filter(p => selectedIds.has(p.id))) {
        const oldPrice = product[priceField] || 0;
        const newPrice = calculateNewPrice(oldPrice);

        const updateData: Record<string, number> = {
          [priceField]: newPrice,
        };

        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', product.id);

        if (error) {
          errorCount++;
        } else {
          successCount++;

            // Update variants if enabled
            if (updateVariants) {
              const { data: variants } = await supabase
                .from('product_variants')
                .select('id, price_bdt, price, sale_price_bdt, sale_price')
                .eq('product_id', product.id);

              if (variants && Array.isArray(variants)) {
                for (const variant of variants) {
                  const variantOldPrice = (variant as any)[priceField] || 0;
                  const variantNewPrice = calculateNewPrice(variantOldPrice);

                  await supabase
                    .from('product_variants')
                    .update({ [priceField]: variantNewPrice })
                    .eq('id', variant.id);
                }
              }
            }
          }
        }

      toast.success(`Updated ${successCount} products${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
      onComplete();
      handleClose();
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setAdjustmentValue('');
    setPreviewProducts([]);
    setSearch('');
    setCategoryFilter('all');
    onOpenChange(false);
  };

  const priceFieldLabels: Record<PriceField, string> = {
    price_bdt: 'BDT Price',
    price: 'USD Price',
    sale_price_bdt: 'BDT Sale Price',
    sale_price: 'USD Sale Price',
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Bulk Price Editor
          </DialogTitle>
          <DialogDescription>
            Update prices for multiple products at once. Select products and apply adjustments.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
          {/* Left: Product Selection */}
          <div className="flex flex-col space-y-3 overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                {selectedIds.size === filteredProducts.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Badge variant="secondary">
                {selectedIds.size} selected
              </Badge>
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleProduct(product.id)}
                    >
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                      <div className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                        {product.image_url && (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ৳{product.price_bdt?.toLocaleString() || 0} / ${product.price?.toFixed(2) || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right: Adjustment Settings & Preview */}
          <div className="flex flex-col space-y-4 overflow-hidden">
            {/* Price Field Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Price Field to Update</Label>
              <Select value={priceField} onValueChange={(v) => setPriceField(v as PriceField)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priceFieldLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Adjustment Type */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Adjustment Type</Label>
              <RadioGroup
                value={adjustmentType}
                onValueChange={(v) => setAdjustmentType(v as AdjustmentType)}
                className="grid grid-cols-3 gap-2"
              >
                <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                  <RadioGroupItem value="percentage" />
                  <Percent className="h-4 w-4" />
                  <span className="text-sm">Percentage</span>
                </Label>
                <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                  <RadioGroupItem value="fixed" />
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Fixed</span>
                </Label>
                <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                  <RadioGroupItem value="multiply" />
                  <span className="text-sm">×</span>
                  <span className="text-sm">Multiply</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Operation (Increase/Decrease) */}
            {adjustmentType !== 'multiply' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Operation</Label>
                <RadioGroup
                  value={operation}
                  onValueChange={(v) => setOperation(v as 'increase' | 'decrease')}
                  className="grid grid-cols-2 gap-2"
                >
                  <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-green-500 [&:has(:checked)]:bg-green-500/5">
                    <RadioGroupItem value="increase" />
                    <span className="text-sm text-green-600">↑ Increase</span>
                  </Label>
                  <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-500/5">
                    <RadioGroupItem value="decrease" />
                    <span className="text-sm text-red-600">↓ Decrease</span>
                  </Label>
                </RadioGroup>
              </div>
            )}

            {/* Adjustment Value */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {adjustmentType === 'percentage' ? 'Percentage (%)' : 
                 adjustmentType === 'fixed' ? 'Amount' : 'Multiplier'}
              </Label>
              <Input
                type="number"
                step={adjustmentType === 'percentage' ? '1' : '0.01'}
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(e.target.value)}
                placeholder={adjustmentType === 'percentage' ? 'e.g., 10' : 
                             adjustmentType === 'fixed' ? 'e.g., 100' : 'e.g., 1.5'}
              />
            </div>

            {/* Update Variants */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="updateVariants"
                checked={updateVariants}
                onCheckedChange={(c) => setUpdateVariants(c === true)}
              />
              <Label htmlFor="updateVariants" className="text-sm">
                Also update product variants
              </Label>
            </div>

            {/* Preview */}
            {previewProducts.length > 0 && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Preview Changes</span>
                </div>
                <ScrollArea className="flex-1 border rounded-lg">
                  <div className="p-2 space-y-1">
                    {previewProducts.slice(0, 20).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 text-sm">
                        <span className="truncate flex-1">{item.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-muted-foreground line-through">
                            {priceField.includes('bdt') ? '৳' : '$'}{item.oldPrice.toLocaleString()}
                          </span>
                          <span className="text-primary font-medium">
                            {priceField.includes('bdt') ? '৳' : '$'}{item.newPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {previewProducts.length > 20 && (
                      <p className="text-center text-xs text-muted-foreground py-2">
                        And {previewProducts.length - 20} more...
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={applyChanges}
            disabled={selectedIds.size === 0 || !adjustmentValue || isUpdating}
            className="glow-purple"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Apply to {selectedIds.size} Products
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
