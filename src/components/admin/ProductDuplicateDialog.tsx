import { useState } from 'react';
import { Copy, Loader2, Check, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Product } from '@/types/database';

interface ProductDuplicateDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function ProductDuplicateDialog({
  product,
  open,
  onOpenChange,
  onComplete,
}: ProductDuplicateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newSku, setNewSku] = useState('');
  
  // What to duplicate
  const [duplicateVariants, setDuplicateVariants] = useState(true);
  const [duplicateImages, setDuplicateImages] = useState(true);
  const [duplicateSalePrice, setDuplicateSalePrice] = useState(true);
  const [setAsDraft, setSetAsDraft] = useState(true);
  const [resetStock, setResetStock] = useState(false);

  // Initialize values when product changes
  useState(() => {
    if (product) {
      setNewName(`${product.name} (Copy)`);
      setNewSlug(`${product.slug}-copy-${Date.now()}`);
      setNewSku(product.sku ? `${product.sku}-COPY` : '');
    }
  });

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && product) {
      setNewName(`${product.name} (Copy)`);
      setNewSlug(`${product.slug}-copy-${Date.now()}`);
      setNewSku(product.sku ? `${product.sku}-COPY` : '');
    }
    onOpenChange(isOpen);
  };

  const handleDuplicate = async () => {
    if (!product) return;

    if (!newName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!newSlug.trim()) {
      toast.error('Please enter a product slug');
      return;
    }

    setIsLoading(true);

    try {
      // Check if slug already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', newSlug.trim())
        .maybeSingle();

      if (existingProduct) {
        toast.error('A product with this slug already exists');
        setIsLoading(false);
        return;
      }

      // Create the new product
      const newProductData: Record<string, any> = {
        name: newName.trim(),
        slug: newSlug.trim(),
        sku: newSku.trim() || null,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        price_bdt: product.price_bdt,
        sale_price: duplicateSalePrice ? product.sale_price : null,
        sale_price_bdt: duplicateSalePrice ? product.sale_price_bdt : null,
        image_url: product.image_url,
        category_id: product.category_id,
        brand_id: product.brand_id,
        stock: resetStock ? 0 : product.stock,
        low_stock_threshold: product.low_stock_threshold,
        is_featured: false, // Don't duplicate featured status
        is_active: !setAsDraft,
        flash_sale_enabled: false, // Don't duplicate flash sale
        sale_start_date: duplicateSalePrice ? product.sale_start_date : null,
        sale_end_date: duplicateSalePrice ? product.sale_end_date : null,
        product_type: product.product_type,
        tags: product.tags,
        wc_id: null, // Clear WooCommerce ID
      };

      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert(newProductData as any)
        .select()
        .single();

      if (productError) throw productError;

      // Duplicate variants if selected
      if (duplicateVariants && product.variants && product.variants.length > 0) {
        const variantsToInsert = product.variants.map((v) => ({
          product_id: newProduct.id,
          name: v.name,
          sku: v.sku ? `${v.sku}-COPY` : null,
          price: v.price,
          price_bdt: v.price_bdt,
          sale_price: duplicateSalePrice ? v.sale_price : null,
          sale_price_bdt: duplicateSalePrice ? v.sale_price_bdt : null,
          stock: resetStock ? 0 : v.stock,
          wc_id: null,
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert as any);

        if (variantsError) {
          console.error('Failed to duplicate variants:', variantsError);
        }
      }

      // Duplicate images if selected
      if (duplicateImages) {
        const { data: productImages } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', product.id)
          .order('sort_order');

        if (productImages && productImages.length > 0) {
          const imagesToInsert = productImages.map((img) => ({
            product_id: newProduct.id,
            image_url: img.image_url,
            alt_text: img.alt_text,
            sort_order: img.sort_order,
            is_primary: img.is_primary,
          }));

          const { error: imagesError } = await supabase
            .from('product_images')
            .insert(imagesToInsert);

          if (imagesError) {
            console.error('Failed to duplicate images:', imagesError);
          }
        }
      }

      toast.success('Product duplicated successfully');
      onComplete();
      handleOpen(false);
    } catch (error: any) {
      console.error('Duplicate error:', error);
      toast.error(`Failed to duplicate: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Duplicate Product
          </DialogTitle>
          <DialogDescription>
            Create a copy of "{product.name}" with custom settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Info Preview */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            {product.image_url && (
              <img
                src={product.image_url}
                alt=""
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{product.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>৳{Number(product.price_bdt).toLocaleString()}</span>
                {product.variants && product.variants.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {product.variants.length} variants
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* New Product Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="newName">New Product Name *</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <Label htmlFor="newSlug">URL Slug *</Label>
              <Input
                id="newSlug"
                value={newSlug}
                onChange={(e) =>
                  setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                }
                placeholder="product-url-slug"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be the URL: /products/{newSlug || 'slug'}
              </p>
            </div>

            <div>
              <Label htmlFor="newSku">SKU (Optional)</Label>
              <Input
                id="newSku"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value.toUpperCase())}
                placeholder="PROD-SKU-001"
              />
            </div>
          </div>

          {/* Duplication Options */}
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium">Duplication Options</p>

            <div className="space-y-2">
              {product.variants && product.variants.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="duplicateVariants"
                    checked={duplicateVariants}
                    onCheckedChange={(c) => setDuplicateVariants(c === true)}
                  />
                  <Label htmlFor="duplicateVariants" className="text-sm font-normal">
                    Include product variants ({product.variants.length})
                  </Label>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="duplicateImages"
                  checked={duplicateImages}
                  onCheckedChange={(c) => setDuplicateImages(c === true)}
                />
                <Label htmlFor="duplicateImages" className="text-sm font-normal">
                  Include product images
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="duplicateSalePrice"
                  checked={duplicateSalePrice}
                  onCheckedChange={(c) => setDuplicateSalePrice(c === true)}
                />
                <Label htmlFor="duplicateSalePrice" className="text-sm font-normal">
                  Include sale prices
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="setAsDraft"
                  checked={setAsDraft}
                  onCheckedChange={(c) => setSetAsDraft(c === true)}
                />
                <Label htmlFor="setAsDraft" className="text-sm font-normal">
                  Set as inactive (draft)
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="resetStock"
                  checked={resetStock}
                  onCheckedChange={(c) => setResetStock(c === true)}
                />
                <Label htmlFor="resetStock" className="text-sm font-normal">
                  Reset stock to 0
                </Label>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Featured status and flash sale settings will not be duplicated. 
              WooCommerce IDs will be cleared from the copy.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Create Copy
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
