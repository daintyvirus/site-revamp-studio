import { useState, useEffect } from 'react';
import { 
  DollarSign, Percent, Calculator, Loader2, Search, ArrowUpDown, 
  Trash2, Package, AlertTriangle, Power, Tag
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCategories, useBrands } from '@/hooks/useProducts';

interface Product {
  id: string;
  name: string;
  price_bdt: number;
  price: number;
  sale_price_bdt: number | null;
  sale_price: number | null;
  category_id: string | null;
  brand_id: string | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
}

interface BulkOperationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type AdjustmentType = 'fixed' | 'percentage' | 'multiply';
type PriceField = 'price_bdt' | 'price' | 'sale_price_bdt' | 'sale_price';
type StockOperation = 'set' | 'add' | 'subtract';
type TabType = 'price' | 'stock' | 'status' | 'category' | 'delete';

export default function BulkOperations({ open, onOpenChange, onComplete }: BulkOperationsProps) {
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabType>('price');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Price adjustment settings
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');
  const [priceField, setPriceField] = useState<PriceField>('price_bdt');
  const [operation, setOperation] = useState<'increase' | 'decrease'>('increase');
  const [updateVariants, setUpdateVariants] = useState(true);

  // Stock settings
  const [stockOperation, setStockOperation] = useState<StockOperation>('set');
  const [stockValue, setStockValue] = useState<string>('');
  const [updateVariantStock, setUpdateVariantStock] = useState(true);

  // Status settings
  const [newActiveStatus, setNewActiveStatus] = useState<'active' | 'inactive'>('active');
  const [newFeaturedStatus, setNewFeaturedStatus] = useState<boolean>(false);

  // Category/Brand settings
  const [newCategoryId, setNewCategoryId] = useState<string>('');
  const [newBrandId, setNewBrandId] = useState<string>('');

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
        .select('id, name, price_bdt, price, sale_price_bdt, sale_price, category_id, brand_id, image_url, stock, is_active, is_featured')
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

  const calculateNewStock = (currentStock: number): number => {
    const value = parseInt(stockValue) || 0;
    if (stockOperation === 'set') return value;
    if (stockOperation === 'add') return currentStock + value;
    if (stockOperation === 'subtract') return Math.max(0, currentStock - value);
    return currentStock;
  };

  useEffect(() => {
    if (adjustmentValue && selectedIds.size > 0) {
      const previews = filteredProducts
        .filter(p => selectedIds.has(p.id))
        .map(p => {
          const oldPrice = p[priceField] || 0;
          const newPrice = calculateNewPrice(oldPrice);
          return { id: p.id, name: p.name, oldPrice, newPrice };
        });
      setPreviewProducts(previews);
    } else {
      setPreviewProducts([]);
    }
  }, [adjustmentValue, adjustmentType, priceField, operation, selectedIds]);

  const applyPriceChanges = async () => {
    if (selectedIds.size === 0 || !adjustmentValue) return;

    setIsUpdating(true);
    let successCount = 0;

    try {
      for (const product of products.filter(p => selectedIds.has(p.id))) {
        const oldPrice = product[priceField] || 0;
        const newPrice = calculateNewPrice(oldPrice);

        const { error } = await supabase
          .from('products')
          .update({ [priceField]: newPrice })
          .eq('id', product.id);

        if (!error) {
          successCount++;
          if (updateVariants) {
            const { data: variants } = await supabase
              .from('product_variants')
              .select('id, price_bdt, price, sale_price_bdt, sale_price')
              .eq('product_id', product.id);

            if (variants) {
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

      toast.success(`Updated prices for ${successCount} products`);
      onComplete();
      handleClose();
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const applyStockChanges = async () => {
    if (selectedIds.size === 0 || stockValue === '') return;

    setIsUpdating(true);
    let successCount = 0;

    try {
      for (const product of products.filter(p => selectedIds.has(p.id))) {
        const newStock = calculateNewStock(product.stock);

        const { error } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', product.id);

        if (!error) {
          successCount++;
          if (updateVariantStock) {
            const { data: variants } = await supabase
              .from('product_variants')
              .select('id, stock')
              .eq('product_id', product.id);

            if (variants) {
              for (const variant of variants) {
                const variantNewStock = calculateNewStock(variant.stock);
                await supabase
                  .from('product_variants')
                  .update({ stock: variantNewStock })
                  .eq('id', variant.id);
              }
            }
          }
        }
      }

      toast.success(`Updated stock for ${successCount} products`);
      onComplete();
      handleClose();
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const applyStatusChanges = async () => {
    if (selectedIds.size === 0) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active: newActiveStatus === 'active',
          is_featured: newFeaturedStatus 
        })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast.success(`Updated status for ${selectedIds.size} products`);
      onComplete();
      handleClose();
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const applyCategoryChanges = async () => {
    if (selectedIds.size === 0) return;
    if (!newCategoryId && !newBrandId) {
      toast.error('Please select a category or brand');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: Record<string, string | null> = {};
      if (newCategoryId) updateData.category_id = newCategoryId === 'none' ? null : newCategoryId;
      if (newBrandId) updateData.brand_id = newBrandId === 'none' ? null : newBrandId;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast.success(`Updated category/brand for ${selectedIds.size} products`);
      onComplete();
      handleClose();
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteSelectedProducts = async () => {
    setIsUpdating(true);
    try {
      // First delete variants
      for (const id of selectedIds) {
        await supabase.from('product_variants').delete().eq('product_id', id);
        await supabase.from('product_images').delete().eq('product_id', id);
      }

      // Then delete products
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast.success(`Deleted ${selectedIds.size} products`);
      setShowDeleteConfirm(false);
      onComplete();
      handleClose();
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setAdjustmentValue('');
    setStockValue('');
    setPreviewProducts([]);
    setSearch('');
    setCategoryFilter('all');
    setNewCategoryId('');
    setNewBrandId('');
    onOpenChange(false);
  };

  const priceFieldLabels: Record<PriceField, string> = {
    price_bdt: 'BDT Price',
    price: 'USD Price',
    sale_price_bdt: 'BDT Sale Price',
    sale_price: 'USD Sale Price',
  };

  const getApplyButton = () => {
    const disabled = selectedIds.size === 0 || isUpdating;
    
    switch (activeTab) {
      case 'price':
        return (
          <Button onClick={applyPriceChanges} disabled={disabled || !adjustmentValue}>
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Apply Price Changes
          </Button>
        );
      case 'stock':
        return (
          <Button onClick={applyStockChanges} disabled={disabled || stockValue === ''}>
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Apply Stock Changes
          </Button>
        );
      case 'status':
        return (
          <Button onClick={applyStatusChanges} disabled={disabled}>
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Apply Status Changes
          </Button>
        );
      case 'category':
        return (
          <Button onClick={applyCategoryChanges} disabled={disabled}>
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Apply Category/Brand
          </Button>
        );
      case 'delete':
        return (
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={disabled}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {selectedIds.size} Products
          </Button>
        );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Bulk Operations
            </DialogTitle>
            <DialogDescription>
              Manage multiple products at once - update prices, stock, status, or delete in bulk.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="price" className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                Price
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                Stock
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-1.5">
                <Power className="h-4 w-4" />
                Status
              </TabsTrigger>
              <TabsTrigger value="category" className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                Category
              </TabsTrigger>
              <TabsTrigger value="delete" className="flex items-center gap-1.5 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4 mt-4">
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
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>৳{product.price_bdt?.toLocaleString() || 0}</span>
                              <span>•</span>
                              <span>Stock: {product.stock}</span>
                              {!product.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Right: Tab Content */}
              <div className="flex flex-col space-y-4 overflow-hidden">
                <TabsContent value="price" className="mt-0 flex-1 overflow-auto space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Price Field</Label>
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
                        <span className="text-sm">%</span>
                      </Label>
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                        <RadioGroupItem value="fixed" />
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Fixed</span>
                      </Label>
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                        <RadioGroupItem value="multiply" />
                        <span className="text-sm">×</span>
                      </Label>
                    </RadioGroup>
                  </div>

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

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(e.target.value)}
                      placeholder={adjustmentType === 'percentage' ? 'e.g., 10' : 'e.g., 100'}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="updateVariants"
                      checked={updateVariants}
                      onCheckedChange={(c) => setUpdateVariants(c === true)}
                    />
                    <Label htmlFor="updateVariants" className="text-sm">Also update variants</Label>
                  </div>

                  {previewProducts.length > 0 && (
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Preview</span>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-auto">
                        {previewProducts.slice(0, 5).map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="truncate flex-1">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground line-through text-xs">
                                {priceField.includes('bdt') ? '৳' : '$'}{item.oldPrice.toLocaleString()}
                              </span>
                              <span className="text-primary font-medium">
                                {priceField.includes('bdt') ? '৳' : '$'}{item.newPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {previewProducts.length > 5 && (
                          <p className="text-xs text-muted-foreground">+{previewProducts.length - 5} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="stock" className="mt-0 flex-1 overflow-auto space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Stock Operation</Label>
                    <RadioGroup
                      value={stockOperation}
                      onValueChange={(v) => setStockOperation(v as StockOperation)}
                      className="grid grid-cols-3 gap-2"
                    >
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                        <RadioGroupItem value="set" />
                        <span className="text-sm">Set to</span>
                      </Label>
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-green-500 [&:has(:checked)]:bg-green-500/5">
                        <RadioGroupItem value="add" />
                        <span className="text-sm text-green-600">+ Add</span>
                      </Label>
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-500/5">
                        <RadioGroupItem value="subtract" />
                        <span className="text-sm text-red-600">- Subtract</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Stock Value</Label>
                    <Input
                      type="number"
                      min="0"
                      value={stockValue}
                      onChange={(e) => setStockValue(e.target.value)}
                      placeholder="Enter stock quantity"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="updateVariantStock"
                      checked={updateVariantStock}
                      onCheckedChange={(c) => setUpdateVariantStock(c === true)}
                    />
                    <Label htmlFor="updateVariantStock" className="text-sm">Also update variant stock</Label>
                  </div>

                  {stockValue && selectedIds.size > 0 && (
                    <div className="border rounded-lg p-3">
                      <p className="text-sm">
                        {stockOperation === 'set' && `Will set stock to ${stockValue} for ${selectedIds.size} products`}
                        {stockOperation === 'add' && `Will add ${stockValue} to stock for ${selectedIds.size} products`}
                        {stockOperation === 'subtract' && `Will subtract ${stockValue} from stock for ${selectedIds.size} products`}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="status" className="mt-0 flex-1 overflow-auto space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Product Status</Label>
                    <RadioGroup
                      value={newActiveStatus}
                      onValueChange={(v) => setNewActiveStatus(v as 'active' | 'inactive')}
                      className="grid grid-cols-2 gap-2"
                    >
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-green-500 [&:has(:checked)]:bg-green-500/5">
                        <RadioGroupItem value="active" />
                        <Power className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Active</span>
                      </Label>
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer [&:has(:checked)]:border-orange-500 [&:has(:checked)]:bg-orange-500/5">
                        <RadioGroupItem value="inactive" />
                        <Power className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-600">Inactive</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="newFeatured"
                      checked={newFeaturedStatus}
                      onCheckedChange={(c) => setNewFeaturedStatus(c === true)}
                    />
                    <Label htmlFor="newFeatured" className="text-sm">Mark as Featured</Label>
                  </div>

                  {selectedIds.size > 0 && (
                    <div className="border rounded-lg p-3">
                      <p className="text-sm">
                        Will set {selectedIds.size} products to {newActiveStatus}
                        {newFeaturedStatus && ' and mark as featured'}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="category" className="mt-0 flex-1 overflow-auto space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">New Category</Label>
                    <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">New Brand</Label>
                    <Select value={newBrandId} onValueChange={setNewBrandId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Brand</SelectItem>
                        {brands?.map(brand => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedIds.size > 0 && (newCategoryId || newBrandId) && (
                    <div className="border rounded-lg p-3">
                      <p className="text-sm">
                        Will update {selectedIds.size} products
                        {newCategoryId && ` to category: ${categories?.find(c => c.id === newCategoryId)?.name || 'None'}`}
                        {newBrandId && ` and brand: ${brands?.find(b => b.id === newBrandId)?.name || 'None'}`}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="delete" className="mt-0 flex-1 overflow-auto space-y-4">
                  <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-destructive">Warning: Permanent Action</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Deleting products will also remove all their variants, images, and associated data. 
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedIds.size > 0 && (
                    <div className="border rounded-lg p-3">
                      <p className="text-sm font-medium text-destructive">
                        {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected for deletion
                      </p>
                      <div className="mt-2 max-h-32 overflow-auto space-y-1">
                        {products.filter(p => selectedIds.has(p.id)).slice(0, 10).map(p => (
                          <p key={p.id} className="text-xs text-muted-foreground">• {p.name}</p>
                        ))}
                        {selectedIds.size > 10 && (
                          <p className="text-xs text-muted-foreground">+{selectedIds.size - 10} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </div>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {getApplyButton()}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Products?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected products along with all their variants and images. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSelectedProducts}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete Products
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
